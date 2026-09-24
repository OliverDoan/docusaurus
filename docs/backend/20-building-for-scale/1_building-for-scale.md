---
sidebar_position: 1
title: "1. Building For Scale"
---

# Building For Scale

Khi ứng dụng có nhiều người dùng, không chỉ database mà cả tầng ứng dụng và hạ tầng mạng cũng cần được mở rộng để chịu tải. Bài này nói về cách xây dựng hệ thống sẵn sàng scale: cân bằng tải (load balancing), dùng CDN để phục vụ nội dung gần người dùng, các tầng caching, và triển khai đa vùng (multi-region). Quan trọng nhất là tư duy "đo lường trước, scale sau" để không tốn công làm phức tạp hệ thống khi chưa cần.

[![Sơ đồ tóm tắt bài: Building For Scale](/img/backend/building-for-scale.webp)](pathname:///img/backend/building-for-scale.webp)

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

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Phân biệt `vertical scaling` và `horizontal scaling`. Vì sao đa số hệ thống hiện đại ưu tiên scale ngang, và khi nào scale dọc vẫn là lựa chọn đúng?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `vertical` (scale up) | `horizontal` (scale out) |
|---|---|---|
| Cách làm | Máy to hơn: nhiều CPU/RAM | Thêm nhiều máy + load balancer |
| Giới hạn | Có trần phần cứng | Gần như không trần |
| Fault tolerance | Máy chết là chết cả hệ | Một instance chết, các instance khác gánh |
| Downtime khi scale | Thường phải restart | Không, thêm node là xong |
| Chi phí | Tăng phi tuyến ở cấu hình cao | Tuyến tính hơn, dùng máy phổ thông |

Ưu tiên scale ngang vì tầng app hiện đại đa số **stateless**, thêm instance là chuyện config; lại có sẵn khả năng chịu lỗi và autoscale theo tải.

Scale dọc vẫn đúng khi: **database** (Postgres primary scale ngang rất khó, nâng máy là cách rẻ và nhanh nhất), workload đơn khối không chia được, hoặc đơn giản là bạn còn xa trần phần cứng — đúng tinh thần "cheap solution first" của bài: nâng máy vài phút xong, còn tách hệ thống thì tốn hàng tháng.

</details>

**2. "App `stateless`" nghĩa là gì và vì sao đó là điều kiện tiên quyết để scale ngang? Session, file upload và kết nối `WebSocket` phải xử lý ở đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

`stateless` = instance **không giữ dữ liệu riêng giữa các request**. Mọi state nằm ở kho dùng chung (DB, Redis, S3), nên bất kỳ instance nào cũng xử lý được bất kỳ request nào.

Đó là điều kiện tiên quyết vì load balancer phân phối request tuỳ ý: nếu instance A giữ session trong RAM thì request kế tiếp rơi vào instance B sẽ mất phiên. Instance cũng bị giết/tạo mới liên tục khi autoscale hoặc rolling deploy, nên mọi thứ lưu cục bộ đều có thể biến mất.

- **Session** — Redis hoặc JWT ký sẵn, không lưu in-memory.
- **File upload** — object storage (S3, R2), không ghi vào đĩa local; local chỉ dùng làm temp trong một request.
- **WebSocket** — kết nối vốn có state, nên dùng **Redis pub/sub** (hoặc adapter tương đương) để broadcast giữa các instance; trạng thái phòng/presence lưu ở Redis chứ không trong process.

Đây chính là nguyên tắc `12-factor` mà bài nhấn mạnh: code đúng pattern từ ngày 1 thì scale chỉ còn là config + infra.

</details>

**3. API đang chậm. Mô tả thứ tự bạn truy bottleneck (query DB → cache → CPU app → bandwidth → region) và vì sao không nhảy thẳng lên `multi-region`.**

<details className="qa">
<summary>Xem đáp án</summary>

Theo đúng "bottleneck stack" của bài, đi từ rẻ tới đắt:

1. **Query DB chậm** — `EXPLAIN ANALYZE`, thêm index, sửa N+1, bỏ `SELECT *`. Thường đây là 80% vấn đề và sửa mất vài giờ.
2. **DB I/O chạm trần** — thêm cache Redis cho dữ liệu read-heavy, thêm read replica.
3. **CPU app chạm trần** — profile xem có serialization/vòng lặp nặng không, rồi scale ngang tầng app sau load balancer.
4. **Bandwidth** — đẩy static asset lên CDN, bật nén, tối ưu ảnh.
5. **Latency do khoảng cách** — lúc này mới tính multi-region hoặc edge.

Không nhảy thẳng multi-region vì: nó **không sửa được nguyên nhân thật** (query chậm thì ở region nào cũng chậm), chi phí nhân đôi, và độ phức tạp tăng vọt (replication, conflict, deploy nhiều nơi, on-call nhiều nơi). Quy tắc số 1 của bài vẫn là **measure first** — không scale mò.

</details>

**4. Load balancer làm gì? So sánh `round-robin`, `least connections`, `weighted` và `IP hash` — mỗi thuật toán hợp tình huống nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Load balancer phân phối traffic tới nhiều server phía sau, đồng thời **health check** để tự loại instance hỏng — giống anh bảo vệ chia khách về từng quầy thu ngân trong ví dụ của bài.

| Thuật toán | Cách chọn | Hợp khi |
|---|---|---|
| `round-robin` | Lần lượt từng server | Server đồng cấu hình, request đồng đều, cần đơn giản |
| `least connections` | Server đang ít kết nối nhất | Request có thời lượng chênh lệch lớn (upload, streaming, query nặng) |
| `weighted` | Theo trọng số cấu hình | Cụm server không đồng đều, hoặc canary: đẩy 5% traffic sang bản mới |
| `IP hash` | Hash IP client → luôn về một server | Cần sticky session, nhưng nên coi là giải pháp tạm |

```nginx
upstream backend {
  least_conn;
  server srv1:3000 weight=2 max_fails=3 fail_timeout=30s;
  server srv2:3000;
}
```

Mặc định an toàn cho app stateless là `round-robin`; đổi sang `least_conn` khi thấy tải lệch giữa các instance.

</details>

**5. Phân biệt load balancer `Layer 4` và `Layer 7`. Cái nào cho phép route theo path/header và vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `Layer 4` (transport) | `Layer 7` (application) |
|---|---|---|
| Nhìn thấy | IP + port TCP/UDP | Toàn bộ HTTP: path, header, cookie, method |
| Route theo | Địa chỉ/cổng | Path, hostname, header, cookie |
| Chi phí | Rất thấp, throughput cao | Cao hơn (phải parse HTTP, thường terminate TLS) |
| Ví dụ | AWS NLB, `ipvs`, HAProxy mode tcp | Nginx, HAProxy mode http, AWS ALB, CloudFlare LB |

Chỉ **Layer 7** route được theo path/header, vì nó **giải mã và đọc nội dung HTTP** — L4 chỉ thấy luồng byte TCP nên không biết đường dẫn là gì. Đánh đổi: L7 phải terminate TLS mới đọc được, tốn CPU và thêm một điểm cần quản lý chứng chỉ.

Thực tế L7 được dùng cho hầu hết web traffic (route `/api` sang service này, `/img` sang service kia, canary theo header). L4 dùng khi cần thông lượng cực lớn, giao thức không phải HTTP, hoặc muốn giữ TLS đi thẳng tới backend.

</details>

**6. `health check` hoạt động thế nào? Phân biệt `liveness` và `readiness`. Điều gì xảy ra nếu endpoint health chỉ trả `200 OK` mà không kiểm tra dependency nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Load balancer/orchestrator gọi định kỳ một endpoint; quá số lần lỗi cho phép thì instance bị loại khỏi vòng phục vụ — trong Nginx là `max_fails` và `fail_timeout`.

- `liveness` — "process này còn sống không?". Fail → **restart container**. Chỉ nên kiểm tra thứ rất cơ bản.
- `readiness` — "đã sẵn sàng nhận traffic chưa?". Fail → **ngừng gửi request nhưng không restart**. Đây là nơi kiểm tra kết nối DB, Redis, cache đã warm chưa, migration đã xong chưa.

Nếu endpoint chỉ trả `200 OK` vô điều kiện, bạn có một **health check giả**: instance mất kết nối DB vẫn được coi là khoẻ, load balancer vẫn đẩy traffic vào và user nhận lỗi 500 hàng loạt; rolling deploy cũng tưởng bản mới ổn nên tiếp tục thay hết instance cũ.

Ngược lại cũng nguy hiểm: nhét quá nhiều dependency vào liveness khiến DB chập một nhịp là **toàn bộ instance bị restart cùng lúc**. Nguyên tắc: liveness nông, readiness sâu.

</details>

**7. `sticky session` giải quyết vấn đề gì và tạo ra vấn đề gì khi autoscale? Có cách nào bỏ hẳn sticky session không?**

<details className="qa">
<summary>Xem đáp án</summary>

`sticky session` ghim một client luôn về cùng một server (qua `IP hash` hoặc cookie), để state lưu trong RAM của server đó vẫn dùng được — nó là **cách vá cho app có state**.

Vấn đề khi autoscale:

- **Tải lệch** — instance cũ đã ôm nhiều phiên, instance mới thêm vào gần như rỗi vì không ai bị route sang.
- **Mất phiên khi scale-in hoặc deploy** — instance bị giết là toàn bộ user gắn với nó bị đăng xuất.
- **Hỏng cân bằng khi client sau NAT/proxy** — cả công ty ra cùng một IP thì dồn hết vào một server.

Bỏ hẳn được, và nên bỏ: đưa session ra **Redis** hoặc dùng **JWT** ký sẵn để không cần lưu server-side; file tạm đưa lên object storage; với WebSocket thì dùng Redis pub/sub để mọi instance đều phát tin được. Khi app đã stateless đúng nghĩa, sticky session trở nên thừa và load balancer được tự do phân phối.

</details>

**8. CDN giảm tải origin bằng cách nào? Phân biệt `max-age` và `s-maxage`; `stale-while-revalidate` dùng để làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

CDN đặt bản sao nội dung ở hàng trăm PoP gần user (giống mấy kho nhỏ gần khách trong ví dụ của bài). Request được phục vụ ngay tại edge, không chạm origin — với static asset, ảnh, và cả API GET cache được, origin load giảm 90%+. Bonus: TLS/TCP handshake diễn ra gần user nên latency giảm mạnh ngay cả khi phải về origin.

| Directive | Áp cho | Ý nghĩa |
|---|---|---|
| `max-age` | Browser (và mọi cache) | Bao lâu coi là còn tươi |
| `s-maxage` | Chỉ shared cache (CDN/proxy) | Ghi đè `max-age` ở CDN |

Nhờ vậy đặt được "browser giữ ngắn, CDN giữ dài" — vốn là cấu hình rất hay dùng cho HTML:

```
Cache-Control: max-age=0, s-maxage=600, stale-while-revalidate=60
```

`stale-while-revalidate` cho phép edge **trả bản cũ ngay lập tức** cho user trong khoảng thời gian đó, đồng thời lặng lẽ fetch bản mới ở nền. Người dùng không phải chờ, và origin tránh được cơn dồn request khi cache vừa hết hạn.

</details>

**9. Bạn vừa deploy bản mới nhưng user vẫn thấy JS/CSS cũ. Nguyên nhân là gì và có những cách xử lý nào (`cache busting` theo hash tên file, `purge`, chỉnh `TTL`)?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên nhân: file cũ vẫn còn hạn ở **browser cache và/hoặc CDN edge**. Vì cùng một URL nên cache không có lý do gì đi lấy bản mới cho tới khi hết TTL — đúng như cái giá "hàng trong kho gần có thể là hàng cũ" mà bài nêu.

Các cách xử lý, từ tốt nhất xuống:

- **Cache busting theo hash** — build ra `app.9f3a2c.js`, đổi nội dung là đổi URL nên cache cũ tự nhiên vô dụng. Asset băm hash có thể để `max-age=31536000, immutable`, còn HTML thì TTL ngắn vì nó trỏ tới tên file mới. Đây là cách chuẩn.
- **Purge / invalidate** — gọi API CDN xoá bản cũ sau khi deploy. Hiệu quả với CDN nhưng **không chạm được browser cache của user**, nên chỉ là biện pháp bổ trợ.
- **Chỉnh TTL** — hạ `s-maxage` cho HTML, hoặc thêm `stale-while-revalidate`. Giúp lần deploy sau lan nhanh hơn chứ không cứu được lần này.
- Chữa cháy tức thời: thêm query version `?v=2` vào đường dẫn.

</details>

**10. Mô tả các tầng cache từ browser xuống database. Mỗi tầng lọc bớt được gì, và vì sao càng nhiều tầng thì `cache invalidation` càng khó?**

<details className="qa">
<summary>Xem đáp án</summary>

```
[Browser]  max-age — request không hề rời máy user
   ↓
[CDN]      s-maxage, stale-while-revalidate — chặn ở edge, không về origin
   ↓
[App memory] LRU in-process — nhanh nhất phía server, không tốn network
   ↓
[Redis]    distributed cache — dùng chung cho mọi instance
   ↓
[Database] chỉ còn nhận vài request thật sự cần
```

Mỗi tầng lọc bớt phần lớn lưu lượng cho tầng sau: browser lọc request lặp của chính user, CDN lọc theo vùng, app memory lọc hit nóng trong một process, Redis lọc phần còn lại và giữ dữ liệu nhất quán giữa các instance.

Invalidation khó dần vì **một sự thật giờ nằm ở N bản sao**, và bạn chỉ điều khiển được vài bản trong số đó: xoá key Redis rất dễ, purge CDN cần gọi API và có độ trễ, còn cache trong RAM của từng instance phải broadcast mới xoá được, riêng browser cache thì **hoàn toàn nằm ngoài tầm với**. Đó là lý do bài cảnh báo "over-cache" — chỉ cache khi đo thấy cần, và ưu tiên cách vô hiệu hoá bằng đổi URL thay vì đi xoá.

</details>

**11. `cache stampede` (`thundering herd`) là gì? Khi một key nóng hết hạn cùng lúc thì chuyện gì xảy ra với DB, và bạn chặn bằng cách nào (`lock`, `stale-while-revalidate`, jitter cho TTL)?**

<details className="qa">
<summary>Xem đáp án</summary>

Một key nóng (trang chủ, danh sách sản phẩm) hết hạn, hàng nghìn request đồng thời cùng miss cache và cùng lao xuống DB để tính lại **cùng một giá trị**. DB đang chạy 2% CPU đột ngột bị dồn tải, query chậm lại, request timeout, retry đổ thêm vào — hệ thống có thể sập dây chuyền dù dữ liệu chỉ cần tính đúng một lần.

Cách chặn:

- **Lock / single-flight** — chỉ một request được quyền tính lại, các request khác chờ hoặc dùng tạm giá trị cũ.

```ts
const got = await redis.set(`lock:${key}`, "1", { nx: true, ex: 10 });
if (!got) return stale ?? (await waitAndRead(key));
const fresh = await loadFromDb();
await redis.set(key, fresh, { ex: 300 + Math.floor(Math.random() * 60) });
```

- **`stale-while-revalidate`** — phục vụ bản cũ ngay, refresh ở nền; user không chờ và DB chỉ nhận một lượt.
- **Jitter cho TTL** — cộng thêm ngẫu nhiên vài chục giây để các key không hết hạn đồng loạt.
- **Refresh chủ động** trước khi hết hạn cho các key quan trọng nhất.

</details>

**12. `edge function` khác gì server ở origin? Loại logic nào nên đặt ở edge và loại nào tuyệt đối không?**

<details className="qa">
<summary>Xem đáp án</summary>

`edge function` chạy ở hàng trăm PoP sát user (CloudFlare Workers, Vercel Edge), khởi động gần như tức thì, nhưng chạy trong runtime hạn chế: giới hạn CPU time và bộ nhớ, thường không có API Node đầy đủ, **không có kết nối gần tới database chính** — mỗi truy vấn DB là một chuyến đi vòng về region gốc, xoá sạch lợi thế gần user.

Nên đặt ở edge:

- Redirect, rewrite, A/B testing, geo routing.
- Kiểm tra token/auth nhẹ, chặn bot, rate limit sơ bộ.
- Chỉnh header, personalize nhẹ, phục vụ nội dung đã cache.

Tuyệt đối không nên:

- Logic cần nhiều round-trip tới DB chính hoặc transaction.
- Tính toán nặng, xử lý ảnh/video, job dài.
- Thứ cần thư viện Node nặng hoặc state bền vững.

Mô hình bài đưa ra rất gọn: static asset → CDN cache, API nhẹ → edge function, logic nặng → origin. Kết quả là origin load giảm 90%+.

</details>

**13. Khi nào thực sự cần `multi-region`? So sánh `read replica` đa vùng, `active-active` và `edge-first` — mỗi mô hình đánh đổi gì về latency, chi phí và độ phức tạp?**

<details className="qa">
<summary>Xem đáp án</summary>

Thực sự cần khi: user base toàn cầu (hơn 30% ngoài region chính), compliance/data residency bắt buộc, hoặc cam kết uptime 99.99% cần DR. Không cần khi startup chỉ phục vụ Việt Nam — một region Singapore cộng CDN đã cho latency 30–50ms, dưới 100ms cho user VN.

| Mô hình | Latency | Chi phí | Phức tạp |
|---|---|---|---|
| `read replica` đa vùng | Đọc nhanh tại chỗ, **ghi vẫn phải về master** | Trung bình | Thấp — phải xử lý replication lag và read-after-write |
| `active-active` | Nhanh cả đọc lẫn ghi ở mọi vùng | Cao nhất | Cao nhất — cần giải quyết xung đột ghi |
| `edge-first` | Rất nhanh cho phần nhẹ, phần nặng vẫn về origin | Thấp | Thấp — DB vẫn single region |

Với đa số sản phẩm, `edge-first` là điểm cân bằng tốt nhất: hưởng phần lớn lợi ích về latency mà không phải chạm vào bài toán dữ liệu phân tán.

</details>

**14. Trong `active-active`, hai region cùng sửa một bản ghi thì giải quyết xung đột ra sao (`last-write-wins`, `CRDT`, phân vùng quyền ghi theo user)? Rủi ro của `last-write-wins` là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba hướng chính:

- **`last-write-wins`** — so timestamp, bản ghi muộn hơn thắng. Đơn giản nhất, có sẵn ở nhiều hệ.
- **`CRDT`** — kiểu dữ liệu được thiết kế để hợp nhất tự động mà không cần điều phối (counter cộng dồn, set chỉ thêm, danh sách soạn thảo cộng tác). Đúng đắn theo thiết kế nhưng chỉ áp được cho một số cấu trúc, và phải mô hình hoá nghiệp vụ theo nó.
- **Phân vùng quyền ghi** (home region per user/tenant) — mỗi bản ghi chỉ có **một vùng được ghi**, các vùng khác chỉ đọc. Thực dụng nhất: xung đột bị loại bỏ từ gốc thay vì phải hoà giải.

Rủi ro của `last-write-wins`: **mất dữ liệu âm thầm** — hai người sửa hai trường khác nhau của cùng bản ghi, bản thắng ghi đè toàn bộ và thay đổi kia biến mất, không ai được báo. Tệ hơn, nó dựa vào **đồng hồ của các máy khác nhau**: clock skew khiến "muộn hơn" không đúng thứ tự thực tế, và nó hoàn toàn sai với thao tác kiểu cộng dồn (trừ tồn kho, cộng số dư) vì hai lượt trừ có thể chỉ còn tính một.

</details>

**15. `graceful shutdown` là gì và vì sao quan trọng khi autoscale hoặc `rolling deploy`? Bạn xử lý các request đang chạy dở và job đang tiêu thụ như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`graceful shutdown` = khi nhận tín hiệu dừng (`SIGTERM`), tiến trình **không chết ngay** mà hoàn tất việc đang làm rồi mới thoát. Quan trọng vì autoscale và rolling deploy giết instance liên tục; kill cứng đồng nghĩa với request lỗi 502 ngẫu nhiên và job bị bỏ dở, dù chẳng có sự cố nào thật sự.

Trình tự chuẩn:

1. Nhận `SIGTERM` → đặt readiness về fail để load balancer ngừng gửi request mới.
2. **Chờ vài giây** (drain) vì LB cập nhật không tức thì.
3. Đóng listener, để các request đang chạy hoàn tất trong một deadline (ví dụ 15–30s).
4. Với worker: dừng nhận job mới, hoàn tất job đang chạy rồi mới `ack`; job chưa xong thì trả lại queue.
5. Đóng connection pool DB/Redis, flush log, thoát bằng code 0.

```ts
process.on("SIGTERM", async () => {
  ready = false;
  await sleep(5000);
  await server.close();
  await worker.close();
  await db.end();
  process.exit(0);
});
```

Điều kiện kèm theo: job phải **idempotent**, vì at-least-once nghĩa là có thể chạy lại.

</details>

**16. Vì sao API nên `idempotent` khi hệ thống có retry và nhiều instance? Triển khai `idempotency key` ở phía server ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Trong hệ phân tán, **timeout không có nghĩa là thất bại**: request có thể đã xử lý xong nhưng phản hồi mất trên đường về. Client, load balancer, queue và cả người dùng bấm lại đều sẽ retry. Nếu API không idempotent thì kết quả là đơn trùng, trừ tiền hai lần, gửi email hai lượt. Idempotent nghĩa là gọi N lần cho ra **cùng một hiệu ứng** như gọi một lần.

Triển khai `idempotency key`:

- Client sinh một key duy nhất cho mỗi **ý định** (thường là UUID) và gửi qua header `Idempotency-Key`.
- Server lưu bảng khoá này với ràng buộc `UNIQUE`, cùng trạng thái và response đã trả.
- Request đến: insert key trong cùng transaction với nghiệp vụ. Nếu vi phạm unique → đã xử lý rồi → **trả lại response đã lưu**, không làm gì thêm.
- Key đang ở trạng thái đang xử lý → trả `409` để client thử lại sau.
- Đặt TTL cho bảng key (24h là mức thường dùng).

Ngoài ra nên tận dụng ngữ nghĩa HTTP sẵn có: `GET`, `PUT`, `DELETE` vốn idempotent, chỉ `POST` mới cần cơ chế này.

</details>

**17. Production đang chậm và bạn SSH vào máy: dùng lệnh nào để xem CPU, RAM, disk, kết nối mạng và log (`top`, `free -h`, `df -h`, `ss`, `journalctl`)? Mô tả trình tự chẩn đoán của bạn.**

<details className="qa">
<summary>Xem đáp án</summary>

Trình tự từ tổng quan xuống chi tiết:

1. **Tải tổng thể** — `uptime` xem load average, `top`/`htop` xem process nào ăn CPU, `%wa` cao nghĩa là nghẽn I/O chứ không phải CPU.
2. **RAM** — `free -h`. Cần phân biệt bộ nhớ dùng thật với buff/cache; kiểm tra swap có bị dùng không và `dmesg` xem có OOM killer không.
3. **Disk** — `df -h` xem còn chỗ trống (đầy đĩa làm DB và log chết ngay), `du -sh *` tìm thư mục phình.
4. **Mạng/kết nối** — `ss -tulpn` xem port đang lắng nghe và số kết nối; nhiều `TIME_WAIT` hay `CLOSE_WAIT` là dấu hiệu rò rỉ connection. `curl -v`, `dig`, `mtr` khi nghi vấn đề DNS/đường truyền.
5. **Log** — `journalctl -u <service> -f`, `tail -f` log ứng dụng, tìm timeout, exception, lỗi kết nối DB.
6. **File descriptor** — `lsof -p <pid> | wc -l`, chạm giới hạn là hết nhận kết nối mới.

Nâng cao khi vẫn chưa rõ: `strace` theo dõi system call, `perf` để profile, `tcpdump` khi nghi ngờ tầng mạng. Song song đó luôn đối chiếu với metrics/dashboard chứ không chỉ nhìn một máy.

</details>

**18. Kể ít nhất 3 anti-pattern khi scale (microservice từ ngày 1, `multi-region` cho MVP, `sharding` khi mới 10 user, cache mọi thứ) và giải thích vì sao chúng gây hại nhiều hơn lợi.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Microservice từ ngày 1** — bạn phải trả ngay toàn bộ chi phí phân tán (network giữa service, distributed tracing, transaction xuyên service, CI/CD cho N repo) trong khi chưa có bất kỳ lợi ích nào, lại còn chưa hiểu rõ ranh giới domain nên chia sai và sửa cực đắt.
- **Multi-region cho MVP** — nhân đôi chi phí và nhân đôi số thứ có thể hỏng, đổi lấy vài chục mili-giây mà user MVP không hề để ý.
- **Sharding khi mới 10 user** — mất hẳn JOIN và transaction xuyên shard, mọi query phức tạp lên, để giải quyết một vấn đề còn xa hàng năm.
- **Cache mọi thứ** — biến invalidation thành cơn ác mộng và sinh ra bug "dữ liệu cũ" rất khó tái hiện; cache chỉ nên dùng cho read-heavy và chấp nhận được stale.
- **Cargo cult** ("Google dùng Spanner nên mình cũng cần") — copy giải pháp của bài toán khác quy mô, khác đội ngũ.

Điểm chung: tất cả đều vi phạm **measure first** và tối ưu sai pain point. Mindset của bài — *simplicity scales further than complexity*: một Postgres tuned đúng đi xa hơn 5 microservice mới dựng.

</details>
