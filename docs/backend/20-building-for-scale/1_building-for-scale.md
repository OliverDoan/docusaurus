---
sidebar_position: 1
title: "1. Building For Scale"
---

# Building For Scale

Khi ứng dụng có nhiều người dùng, không chỉ database mà cả tầng ứng dụng và hạ tầng mạng cũng cần được mở rộng để chịu tải. Bài này nói về cách xây dựng hệ thống sẵn sàng scale: cân bằng tải (load balancing), dùng CDN để phục vụ nội dung gần người dùng, các tầng caching, và triển khai đa vùng (multi-region). Quan trọng nhất là tư duy "đo lường trước, scale sau" để không tốn công làm phức tạp hệ thống khi chưa cần.

---

:::note[Ghi nhớ nhanh]

- ⭐ **3 quy tắc scaling** — measure first (đo trước), cheap solution first (optimize trước, scale sau), plan cho 10x chứ không phải 100x.
- **Load Balancing** phân phối traffic (round-robin, least-conn, IP hash...) + health check; **CDN** serve content gần user, giảm tải origin 90%+.
- **Caching đa tầng** — browser → CDN → app memory → Redis → DB, mỗi tầng lọc bớt request lên trên.
- **Multi-region** chỉ cần khi user global (>30% non-home) hoặc compliance; đa số startup 1 region (Singapore cho VN) + CDN là đủ.
- ⭐ **Code đúng pattern từ ngày 1** (stateless, `12-factor`, idempotent API) → scale thành chuyện config + infra, tránh premature optimization và cargo-cult.

:::

---

## Mục lục

- [Scaling principle](#scaling-principle)
- [Horizontal vs Vertical](#horizontal-vs-vertical)
- [Load Balancing](#load-balancing)
- [CDN](#cdn)
- [Caching layer](#caching-layer)
- [Geographic distribution](#geographic-distribution)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Scaling principle

**3 quy tắc**:

1. **Measure first** — không scale mò.
2. **Cheap solution first** — optimize trước, scale sau.
3. **Plan for 10x, not 100x** — over-engineer không tốt.

Pattern thường gặp:

```
Bottleneck stack:
├─ DB query slow → add index, optimize query.
├─ DB I/O hit → add cache (Redis).
├─ App CPU hit → scale app horizontal.
├─ Network bandwidth → CDN.
└─ Single region latency → multi-region.
```

Solve theo thứ tự — không jump ngay multi-region.

---

## Horizontal vs Vertical

(Đã chi tiết ở phần Scaling Databases.)

**App layer scale**:

- **Horizontal**: nhiều app instance + load balancer.
- **Vertical**: instance to hơn.

Đa số stateless app → **horizontal** dễ. Khi state có (WebSocket
connection), cần shared store (Redis).

---

## Load Balancing

**Distribute traffic** giữa multiple server.

:::tip[Ví dụ đời thường]

Siêu thị mở nhiều quầy thu ngân, và **anh bảo vệ đứng đầu hàng chia khách về từng quầy**. Load balancer chính là anh bảo vệ đó, còn mấy thuật toán bên dưới chỉ là cách anh ấy chọn quầy:

- **Round-robin** — lần lượt quầy 1, 2, 3 rồi quay lại.
- **Least connections** — ngó quầy nào ít người chờ nhất thì chỉ vào.
- **Weighted** — quầy có thu ngân cứng tay thì đẩy nhiều khách hơn.
- **IP hash** — khách quen luôn được đưa về đúng quầy cũ (sticky session).

Còn **health check** là việc anh bảo vệ thỉnh thoảng liếc xem quầy nào treo biển "tạm nghỉ" để thôi chỉ khách vào đó.

:::

**Layer 7 (HTTP)** load balancer:

- **Nginx**, **HAProxy** — self-host.
- **AWS ALB**, **GCP HTTPS LB** — managed.
- **CloudFlare Load Balancer**.

```nginx
upstream backend {
  least_conn;
  server srv1:3000;
  server srv2:3000;
  server srv3:3000;
}

server {
  location / {
    proxy_pass http://backend;
  }
}
```

**Algorithms**:

- **Round-robin** — equal distribute.
- **Least connections** — server ít connection nhất.
- **Weighted** — server mạnh hơn nhận nhiều hơn.
- **IP hash** — sticky session.
- **Response time** — server nhanh nhất.

**Health check** — auto remove unhealthy instance:

```nginx
upstream backend {
  server srv1:3000 max_fails=3 fail_timeout=30s;
}
```

---

## CDN

**Content Delivery Network** — serve content **gần user**.

:::tip[Ví dụ đời thường]

Thay vì mọi đơn hàng đều chuyển từ **tổng kho ở Mỹ**, bạn đặt sẵn **kho nhỏ gần khách** — Hà Nội, Singapore, Tokyo. Khách lấy hàng phổ thông thì nhận ngay từ kho gần, vài chục mili-giây là có; tổng kho chỉ còn lo hàng đặt riêng.

Cái giá: **hàng trong kho gần có thể là hàng cũ**. Bạn đổi logo hôm nay mà các kho vẫn phát bản hôm qua cho tới khi hết hạn cache hoặc bạn ra lệnh thu hồi (`purge`). Vì vậy chỉ đẩy ra kho gần những thứ ít đổi, hoặc gắn số phiên bản vào tên file.

:::

**Provider**:

- **CloudFlare** — free tier rộng.
- **AWS CloudFront**.
- **Fastly** — programmable edge.
- **Vercel/Netlify CDN** — built-in.
- **bunny.net** — pricing thấp.

**CDN cache**:

- Static asset (JS, CSS, image).
- HTML (nếu cache-able).
- API response GET (với `s-maxage`).

**Edge function** — chạy code ở edge:

```ts
// CloudFlare Worker
export default {
  async fetch(request: Request) {
    const url = new URL(request.url);
    if (url.pathname === "/api/light") {
      return new Response("OK");
    }
    return fetch(request); // proxy to origin
  },
};
```

CDN + edge function:

- Static asset → CDN cache.
- Light API → edge function.
- Heavy logic → origin server.

→ Origin load giảm 90%+.

---

## Caching layer

**Cache strategy** đa tầng:

:::tip[Ví dụ đời thường]

Cần một cái bút: bạn mở **ngăn kéo bàn mình** trước (browser), không có thì ra **tủ văn phòng phẩm của phòng** (CDN), rồi tới **kho công ty** (Redis), cùng lắm mới **đặt nhà cung cấp** (database).

Mỗi tầng chặn bớt phần lớn yêu cầu cho tầng sau, nên nhà cung cấp chỉ nhận vài đơn thay vì cả nghìn. Cái giá: **càng nhiều chỗ cất bút thì càng khó thu hồi bút hỏng** — đổi sang mẫu bút mới mà ngăn kéo ai đó vẫn còn bút cũ là chuyện thường (cache invalidation).

:::

```
[Browser] cache 1 giờ (Cache-Control: max-age=3600)
   ↓
[CDN] cache (s-maxage, stale-while-revalidate)
   ↓
[App memory] local cache (LRU, in-process)
   ↓
[Redis] distributed cache
   ↓
[Database]
```

Mỗi tầng filter request lên trên — DB chỉ nhận few request.

**Pattern cache invalidate** quan trọng (xem Caching docs).

---

## Geographic distribution

**Multi-region** deploy — gần user toàn cầu.

:::tip[Ví dụ đời thường]

Công ty mở **chi nhánh ở nhiều thành phố** thay vì bắt cả nước kéo về trụ sở:

- **Read replica đa vùng** — chi nhánh giữ bản sao sổ sách để **tra cứu tại chỗ**, nhưng mọi thay đổi vẫn phải gửi về trụ sở ký. Đọc nhanh, ghi vẫn chậm.
- **Active-active** — chi nhánh nào cũng được tự ký. Nhanh nhất, nhưng hai nơi cùng sửa một hồ sơ thì **vênh sổ**, phải có luật xử lý xung đột.
- **Edge-first** — đặt mấy việc lặt vặt (kiểm tra thẻ, chuyển hướng) ở quầy tiếp tân khắp nơi, việc nặng vẫn về trụ sở.

Cái giá chung: mở chi nhánh là **nhân đôi chi phí và nhân đôi số thứ có thể hỏng**. Khách chủ yếu ở Việt Nam thì một "trụ sở" đặt Singapore là quá đủ.

:::

**Lý do**:

- **Latency** — user Asia gọi US server > 200ms RTT.
- **Compliance** — data residency (GDPR, Vietnam).
- **DR (Disaster Recovery)** — region down → fallback.

**Patterns**:

**1. Read replica multi-region**:

```
[Master DB (US)] → [Replica EU] → [App EU]
                 → [Replica Asia] → [App Asia]

Write → Master US (slower for non-US user).
Read → Local replica (fast).
```

**2. Active-active**:

```
[App US] ↔ [DB US]
[App EU] ↔ [DB EU]    ←→ replication
[App Asia] ↔ [DB Asia]
```

Mỗi region tự sufficient. Phức tạp conflict resolution.

**3. Edge-first**:

```
[Edge Functions] (300+ location, CDN edge)
       ↓
[Origin (single region)] cho heavy logic
       ↓
[DB single region]
```

CloudFlare Workers, Vercel Edge model.

:::info[Phân tích]

**Khi nào multi-region?**

✅ Có:

- User base global (>30% non-home region).
- Compliance bắt buộc.
- 99.99% uptime SLA.

❌ Không:

- Vietnam-only startup.
- Tier 1 latency từ Singapore acceptable.
- Cost-conscious.

Đa số startup → **1 region (Singapore cho VN)** + CloudFlare CDN cho
static. Đủ < 100ms latency cho VN user.

**Latency reference**:

- VN ↔ Singapore: 30-50ms.
- VN ↔ HCM AWS: 5-10ms.
- VN ↔ US: 200-300ms.

→ Deploy gần user, dùng CDN edge cho static. Đủ cho 90% case.

:::

---

## Basic Operations Skills

**Linux**:

- `top`, `htop`, `ps`, `lsof`.
- `df -h`, `du -sh`, `free -h`.
- `tail -f /var/log/...`.
- `systemctl status/restart`.
- `journalctl -u service`.
- `iptables`/`ufw` firewall.

**Networking**:

- `curl -v`, `dig`, `nslookup`.
- `ping`, `traceroute`, `mtr`.
- `netstat -tulpn`, `ss`.
- `tcpdump` (advanced).

**Debug production**:

- `strace` — system call trace.
- `gdb` — process attach.
- `perf` — performance profile.
- **`cat /proc/sys/...`** — kernel params.

Backend dev không cần master ops — nhưng biết debug khi production có vấn
đề là kỹ năng critical.

:::tip[Mẹo]

**Pattern scale-ready từ ngày 1**:

- **Stateless app** — state trong DB/Redis, không file local.
- **12-factor** principles.
- **Health endpoint** + graceful shutdown.
- **Structured log** stdout.
- **Containerized** từ dev.
- **Env variable** config — không hardcode.
- **Database connection pool**.
- **Cache strategy** built-in từ đầu (Redis layer).
- **Idempotent API** — retry safe.
- **Background job queue** cho heavy task.

Code đúng pattern → scale là **config + infra**, không phải rewrite.

:::

:::warning[Cần lưu ý]

**Scale anti-patterns**:

**1. Premature optimization**:

- Microservice từ ngày 1.
- Multi-region MVP.
- Sharding 10 user.

→ Wasted effort, sai pain point.

**2. Cargo cult scaling**:

- "Google dùng Spanner, mình cũng cần."
- "FAANG có 1000 service, mình cũng phải có."

→ Scale solution **fit team + load**, không copy big company.

**3. Over-cache**:

- Cache mọi thứ → invalidation nightmare.
- Stale data → user complaint.

→ Cache chỉ khi đo cần. Read-heavy + acceptable stale.

**Mindset**: **simplicity scales further than complexity**. 1 Postgres
tuned đúng > 5 microservice mới setup.

:::

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi đối chiếu lại với nội dung phía trên.

1. Phân biệt `vertical scaling` và `horizontal scaling`. Vì sao đa số hệ thống hiện đại ưu tiên scale ngang, và khi nào scale dọc vẫn là lựa chọn đúng?
2. "App `stateless`" nghĩa là gì và vì sao đó là điều kiện tiên quyết để scale ngang? Session, file upload và kết nối `WebSocket` phải xử lý ở đâu?
3. API đang chậm. Mô tả thứ tự bạn truy bottleneck (query DB → cache → CPU app → bandwidth → region) và vì sao không nhảy thẳng lên `multi-region`.
4. Load balancer làm gì? So sánh `round-robin`, `least connections`, `weighted` và `IP hash` — mỗi thuật toán hợp tình huống nào?
5. Phân biệt load balancer `Layer 4` và `Layer 7`. Cái nào cho phép route theo path/header và vì sao?
6. `health check` hoạt động thế nào? Phân biệt `liveness` và `readiness`. Điều gì xảy ra nếu endpoint health chỉ trả `200 OK` mà không kiểm tra dependency nào?
7. `sticky session` giải quyết vấn đề gì và tạo ra vấn đề gì khi autoscale? Có cách nào bỏ hẳn sticky session không?
8. CDN giảm tải origin bằng cách nào? Phân biệt `max-age` và `s-maxage`; `stale-while-revalidate` dùng để làm gì?
9. Bạn vừa deploy bản mới nhưng user vẫn thấy JS/CSS cũ. Nguyên nhân là gì và có những cách xử lý nào (`cache busting` theo hash tên file, `purge`, chỉnh `TTL`)?
10. Mô tả các tầng cache từ browser xuống database. Mỗi tầng lọc bớt được gì, và vì sao càng nhiều tầng thì `cache invalidation` càng khó?
11. `cache stampede` (`thundering herd`) là gì? Khi một key nóng hết hạn cùng lúc thì chuyện gì xảy ra với DB, và bạn chặn bằng cách nào (`lock`, `stale-while-revalidate`, jitter cho TTL)?
12. `edge function` khác gì server ở origin? Loại logic nào nên đặt ở edge và loại nào tuyệt đối không?
13. Khi nào thực sự cần `multi-region`? So sánh `read replica` đa vùng, `active-active` và `edge-first` — mỗi mô hình đánh đổi gì về latency, chi phí và độ phức tạp?
14. Trong `active-active`, hai region cùng sửa một bản ghi thì giải quyết xung đột ra sao (`last-write-wins`, `CRDT`, phân vùng quyền ghi theo user)? Rủi ro của `last-write-wins` là gì?
15. `graceful shutdown` là gì và vì sao quan trọng khi autoscale hoặc `rolling deploy`? Bạn xử lý các request đang chạy dở và job đang tiêu thụ như thế nào?
16. Vì sao API nên `idempotent` khi hệ thống có retry và nhiều instance? Triển khai `idempotency key` ở phía server ra sao?
17. Production đang chậm và bạn SSH vào máy: dùng lệnh nào để xem CPU, RAM, disk, kết nối mạng và log (`top`, `free -h`, `df -h`, `ss`, `journalctl`)? Mô tả trình tự chẩn đoán của bạn.
18. Kể ít nhất 3 anti-pattern khi scale (microservice từ ngày 1, `multi-region` cho MVP, `sharding` khi mới 10 user, cache mọi thứ) và giải thích vì sao chúng gây hại nhiều hơn lợi.
