---
sidebar_position: 8
title: "8. Network & Traffic"
---

# Network & Traffic

> *Traffic là thứ đầu tiên "đập vào" hệ thống của bạn. Interviewer hỏi load balancer, CDN, proxy hay rate limiter không phải để kiểm tra định nghĩa — mà để xem bạn có biết điều phối hàng triệu request từ ngoài internet vào server một cách an toàn, công bằng và nhanh nhất hay không.*

---

## Câu 4: Load Balancing hoạt động như thế nào? Các thuật toán phổ biến? `[Basic]`

### Câu hỏi

> Load Balancing hoạt động như thế nào? Phân biệt L4 và L7 load balancer, và kể các thuật toán phân phối traffic phổ biến cùng trade-off của chúng.

### Giải thích lý thuyết

**Load Balancer (LB)** đứng giữa client và một nhóm server, **phân phối request đến nhiều server** để: tránh quá tải một máy, tăng availability (server chết thì route sang máy khác), và cho phép scale horizontal trong suốt với client.

Phân loại theo tầng OSI:

| Tiêu chí | L4 (Transport) | L7 (Application) |
| --- | --- | --- |
| Nhìn thấy gì | IP + port (TCP/UDP) | Toàn bộ HTTP: path, header, cookie |
| Routing | Theo connection | Theo nội dung (`/api` → service A, `/static` → service B) |
| Hiệu năng | Rất nhanh, ít CPU | Chậm hơn (parse HTTP, có thể TLS termination) |
| Tính năng | NAT, passthrough | SSL termination, sticky session, rewrite, WAF |
| Ví dụ | AWS NLB, LVS, HAProxy (mode tcp) | nginx, HAProxy (mode http), AWS ALB, Envoy |

Các **thuật toán** phổ biến:

| Thuật toán | Cách hoạt động | Khi dùng / Trade-off |
| --- | --- | --- |
| Round Robin | Lần lượt từng server | Đơn giản; giả định server đồng đều |
| Weighted RR | Server mạnh nhận weight cao hơn | Hạ tầng không đồng nhất |
| Least Connections | Chọn server ít connection đang mở nhất | Request có thời gian xử lý chênh lệch lớn |
| Least Response Time | Chọn server phản hồi nhanh nhất | Nhạy với độ trễ thực tế, cần đo liên tục |
| IP Hash | Hash IP client → server cố định | Sticky "tự nhiên", nhưng lệch tải khi NAT chung IP |
| Consistent Hashing | Hash lên vòng tròn, thêm/bớt node chỉ di chuyển ít key | Cache server, stateful backend — giảm cache miss khi scale |

Hai cơ chế đi kèm interviewer hay đào sâu:

- **Health check**: LB chủ động ping endpoint (`/healthz`) theo chu kỳ; server fail N lần liên tiếp bị loại khỏi pool, hồi phục thì đưa lại. Phân biệt *liveness* (process còn sống) vs *readiness* (sẵn sàng nhận traffic).
- **Sticky session (session affinity)**: ghim user vào một server (qua cookie hoặc IP hash) khi server giữ state trong memory. Trade-off: lệch tải, mất session khi server chết → giải pháp tốt hơn là **stateless server + session lưu Redis**.

**Insight phỏng vấn**: điểm cộng lớn là nói được "em ưu tiên thiết kế server stateless để khỏi cần sticky session", và biết LB cũng có thể là single point of failure → cần chạy cặp active-passive hoặc DNS round robin nhiều LB.

### Thiết kế minh hoạ

```text
                      ┌────────────────────────┐
        Client ──────►│  L7 Load Balancer      │── health check ──► /healthz
                      │  (nginx / ALB)         │
                      └───────┬────────────────┘
              /api/* (least_conn)   /static/* (round robin)
                  ┌────────┼────────┐         ┌──────────┐
                  ▼        ▼        ▼         ▼          ▼
              [API #1] [API #2] [API #3]  [Static #1] [Static #2]
                  └────── session lưu Redis (stateless server) ──────┘
```

```nginx
# nginx — L7 load balancing
upstream api_servers {
    least_conn;                          # chọn server ít connection nhất
    server 10.0.1.10:8080 weight=3;      # máy mạnh nhận nhiều traffic hơn
    server 10.0.1.11:8080 weight=1;
    server 10.0.1.12:8080 backup;        # chỉ nhận traffic khi máy khác chết
}

server {
    listen 443 ssl;                      # SSL termination tại LB

    location /api/ {
        proxy_pass http://api_servers;
        proxy_next_upstream error timeout http_502;  # tự retry server khác
    }
}
```

### Đáp án mẫu

> "Load balancer đứng trước nhóm server, phân phối request để tránh quá tải và tăng availability. Em phân biệt hai loại: L4 chỉ nhìn IP/port nên rất nhanh, còn L7 hiểu HTTP nên route được theo path, làm SSL termination — nginx và ALB là L7 điển hình. Về thuật toán, round robin chia đều, weighted round robin cho hạ tầng không đồng nhất, least connections hợp khi request xử lý lâu ngắn khác nhau, còn consistent hashing dùng cho cache server để thêm bớt node không làm mất hết cache. LB luôn kèm health check để loại server lỗi khỏi pool. Với sticky session, em hạn chế dùng vì gây lệch tải — em ưu tiên thiết kế server stateless, lưu session vào Redis. Cuối cùng em lưu ý bản thân LB cũng là single point of failure nên cần chạy redundant."

---

## Câu 5: CDN là gì và cải thiện hiệu năng như thế nào? `[Basic]`

### Câu hỏi

> CDN là gì và cải thiện hiệu năng hệ thống như thế nào? Phân biệt pull CDN và push CDN, và cách xử lý cache invalidation?

### Giải thích lý thuyết

**CDN (Content Delivery Network)** là mạng lưới **edge server đặt rải rác toàn cầu**, cache nội dung gần user về mặt địa lý. Thay vì mọi request bay về origin server (có thể cách nửa vòng trái đất), user được phục vụ từ edge gần nhất.

CDN cải thiện hệ thống theo **hai hướng cùng lúc**:

1. **Giảm latency cho user**: round-trip 200ms xuyên lục địa → 10-30ms tới edge. Đặc biệt quan trọng với static asset (JS, CSS, ảnh, video).
2. **Giảm tải origin**: 90%+ request được edge hấp thụ → origin chỉ xử lý cache miss và dynamic request → cần ít server hơn, chịu được traffic spike, kháng DDoS tốt hơn.

So sánh **Pull vs Push CDN**:

| Tiêu chí | Pull CDN | Push CDN |
| --- | --- | --- |
| Cách nạp content | Edge tự fetch từ origin khi cache miss | Bạn chủ động upload lên CDN |
| Request đầu tiên | Chậm (miss → về origin) | Nhanh ngay (đã có sẵn) |
| Vận hành | Đơn giản, tự quản lý theo TTL | Phải tự quản lý upload, xoá, đồng bộ |
| Phù hợp | Website traffic cao, content thay đổi thường xuyên | File lớn ít thay đổi (video, installer), traffic thấp |
| Ví dụ | CloudFront, Cloudflare (mặc định) | S3 + CDN push, video platform |

**Cache invalidation** — phần khó nhất:

- **TTL (`Cache-Control: max-age`)**: hết hạn thì edge revalidate với origin. Đơn giản nhưng có "độ trễ stale" tối đa bằng TTL.
- **Purge API**: chủ động xoá object khỏi edge khi content đổi — nhanh nhưng tốn chi phí/giới hạn rate.
- **Cache busting / versioned URL** (best practice cho asset): hash nội dung vào tên file `app.3f9a2c.js` + TTL 1 năm `immutable`. Content đổi → URL mới → không bao giờ cần purge.
- **`stale-while-revalidate`**: serve bản cũ ngay lập tức, refresh ngầm — cân bằng tốt giữa độ tươi và tốc độ.

**CDN cho dynamic content**: CDN hiện đại không chỉ cache static — Cloudflare Workers / CloudFront Functions (edge compute) chạy logic ngay tại edge: A/B testing, auth check, redirect theo geo, render HTML cá nhân hoá một phần. Ngay cả không cache được, CDN vẫn giúp dynamic request nhờ **kết nối TCP/TLS đã warm sẵn giữa edge và origin**.

**Insight phỏng vấn**: nói được "static asset thì versioned URL + TTL dài, HTML thì TTL ngắn hoặc stale-while-revalidate" cho thấy bạn đã vận hành CDN thật chứ không chỉ biết khái niệm.

### Thiết kế minh hoạ

```text
User (HN) ──10ms──► Edge Singapore ──┐
User (US) ──15ms──► Edge Virginia ───┼── cache miss (lần đầu) ──► Origin
User (EU) ──12ms──► Edge Frankfurt ──┘        (pull CDN)
                    │
                    └── cache hit (90%+): trả ngay, KHÔNG chạm origin
```

```typescript
// Chiến lược cache header theo loại content
const cacheStrategy = {
  // Asset có hash trong tên → cache "vĩnh viễn", đổi nội dung = đổi URL
  "/static/app.3f9a2c.js": "public, max-age=31536000, immutable",

  // Ảnh sản phẩm — TTL vừa, cho phép serve bản cũ trong khi refresh ngầm
  "/images/product-42.jpg": "public, max-age=86400, stale-while-revalidate=3600",

  // HTML — TTL ngắn để nội dung mới lan nhanh
  "/index.html": "public, max-age=60",

  // API cá nhân hoá — cấm CDN cache
  "/api/me": "private, no-store",
};

// Khi cần xoá gấp (ví dụ gỡ nội dung sai) → purge API
await cdn.purge({ paths: ["/images/product-42.jpg"] });
```

### Đáp án mẫu

> "CDN là mạng edge server đặt khắp thế giới, cache content gần user. Nó cải thiện hai thứ cùng lúc: latency giảm từ vài trăm ms xuống vài chục ms vì user được serve từ edge gần nhất, và origin được giảm tải vì 90% request không bao giờ chạm tới — nhờ đó chịu traffic spike và DDoS tốt hơn. Em phân biệt pull CDN — edge tự fetch từ origin khi cache miss, phù hợp web thông thường — và push CDN — mình chủ động upload, hợp với file lớn ít thay đổi. Về invalidation, với static asset em dùng versioned URL kèm hash nội dung và TTL một năm, không bao giờ phải purge; HTML thì TTL ngắn hoặc stale-while-revalidate; trường hợp khẩn mới gọi purge API. Em cũng lưu ý CDN hiện đại có edge compute như Cloudflare Workers, chạy được cả logic dynamic ngay tại edge."

---

## Câu 6: Forward Proxy và Reverse Proxy khác nhau như thế nào? `[Basic]`

### Câu hỏi

> Forward Proxy và Reverse Proxy khác nhau như thế nào? Mỗi loại giải quyết bài toán gì, và vì sao nginx được gọi là reverse proxy điển hình?

### Giải thích lý thuyết

Cả hai đều là server trung gian, khác nhau ở chỗ **đứng về phía ai**:

- **Forward proxy** đứng **trước client**, đại diện cho client đi ra internet. Server đích chỉ thấy IP của proxy, **không biết client thật là ai**.
- **Reverse proxy** đứng **trước server**, đại diện cho server nhận traffic từ internet. Client chỉ thấy proxy, **không biết server thật phía sau**.

| Tiêu chí | Forward Proxy | Reverse Proxy |
| --- | --- | --- |
| Bảo vệ/ẩn danh cho | Client | Server |
| Ai cấu hình | Client (hoặc network admin phía client) | Phía vận hành server |
| Server đích biết client thật? | Không | Client không biết server thật |
| Use case chính | Ẩn danh, bypass geo-block, content filtering, corporate firewall, cache outbound | Load balancing, SSL termination, cache, compression, rate limiting, che giấu topology |
| Ví dụ | Squid, corporate proxy, VPN (tương tự) | nginx, HAProxy, Envoy, Cloudflare |

Use case cụ thể:

- **Forward proxy**: công ty bắt mọi traffic nhân viên đi qua proxy để **chặn website cấm, log truy cập, cache** nội dung hay dùng; user cá nhân dùng để vượt geo-restriction.
- **Reverse proxy**: là "cửa ngõ" của hệ thống backend — **một điểm vào duy nhất** làm SSL termination (backend khỏi lo TLS), load balance nhiều instance, cache response, nén gzip, chặn request xấu, che giấu việc phía sau có bao nhiêu server và chạy gì.

**Vì sao nginx là reverse proxy điển hình?** Kiến trúc event-driven non-blocking giúp một process xử lý hàng chục nghìn connection đồng thời với memory rất thấp — hoàn hảo cho vai trò "đứng mũi chịu sào" nhận toàn bộ traffic rồi forward về backend. Hầu hết deployment thực tế: nginx nhận HTTPS ở cổng 443 → proxy_pass về Node.js/Python app chạy port nội bộ.

Lưu ý liên quan: **load balancer L7 về bản chất là một reverse proxy** có thêm logic phân phối; **API Gateway** cũng là reverse proxy chuyên cho API (thêm auth, rate limit, routing theo version). Nói được chuỗi quan hệ này là điểm cộng.

**Insight phỏng vấn**: cách nhớ nhanh nhất để trình bày — *"forward proxy giấu client, reverse proxy giấu server"*. Interviewer thường hỏi tiếp "CDN là loại nào?" → CDN là một dạng reverse proxy phân tán toàn cầu.

### Thiết kế minh hoạ

```text
FORWARD PROXY — đại diện CLIENT (server không biết client thật)

[Client A]─┐
[Client B]─┼─► [Forward Proxy] ──► Internet ──► [Server đích]
[Client C]─┘   (filter, log,                    chỉ thấy IP proxy
                cache, ẩn danh)

REVERSE PROXY — đại diện SERVER (client không biết server thật)

                                      ┌─► [App Server 1]
[Client] ──► Internet ──► [Reverse Proxy]─► [App Server 2]
             chỉ thấy      (nginx: SSL,   └─► [App Server 3]
             IP proxy       LB, cache,
                            rate limit)
```

```nginx
# nginx làm reverse proxy: một điểm vào duy nhất cho hệ thống
server {
    listen 443 ssl;                       # SSL termination — backend khỏi lo TLS
    server_name api.example.com;

    gzip on;                              # nén response tại proxy

    location / {
        proxy_pass http://127.0.0.1:3000; # forward về app nội bộ (client không thấy)
        proxy_set_header X-Real-IP $remote_addr;          # giữ lại IP client thật
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;       # cho app biết là HTTPS
    }
}
```

### Đáp án mẫu

> "Cả hai đều là trung gian, khác nhau ở chỗ đứng về phía ai. Forward proxy đứng trước client, đại diện client đi ra internet — server đích chỉ thấy IP proxy, nên dùng cho ẩn danh, vượt geo-block, hay corporate firewall lọc và log truy cập của nhân viên. Reverse proxy thì ngược lại, đứng trước server — client chỉ thấy proxy, không biết phía sau có gì, nên dùng cho load balancing, SSL termination, cache, rate limiting và che giấu topology. Em hay nhớ gọn là forward proxy giấu client, reverse proxy giấu server. Nginx là reverse proxy điển hình vì kiến trúc event-driven chịu được hàng chục nghìn connection — deployment phổ biến là nginx nhận HTTPS rồi proxy_pass về app port nội bộ. Em cũng lưu ý L7 load balancer, API Gateway hay CDN bản chất đều là biến thể của reverse proxy."

---

## Câu 13: Rate Limiting là gì? Các thuật toán phổ biến và cách implement? `[Intermediate]`

### Câu hỏi

> Rate Limiting là gì và tại sao cần? So sánh các thuật toán phổ biến (token bucket, leaky bucket, fixed window, sliding window) và cách implement trong thực tế?

### Giải thích lý thuyết

**Rate limiting** giới hạn số request một client được gửi trong một khoảng thời gian. Mục đích: **chống abuse/DoS**, đảm bảo **fair usage** giữa các user, bảo vệ tài nguyên backend (DB, third-party API có quota), và kiểm soát chi phí.

So sánh các thuật toán:

| Thuật toán | Cơ chế | Ưu | Nhược | Burst? |
| --- | --- | --- | --- | --- |
| **Token Bucket** | Bucket chứa token, nạp đều theo rate; mỗi request tiêu 1 token, hết token thì reject | Cho phép burst có kiểm soát (bằng dung lượng bucket), memory O(1) | Cần tune 2 tham số (rate + capacity) | ✅ trong giới hạn capacity |
| **Leaky Bucket** | Request vào queue, "rò" ra xử lý với tốc độ cố định | Output rate mượt tuyệt đối — tốt cho traffic shaping | Burst hợp lệ bị xếp hàng/loại, tăng latency | ❌ làm phẳng hoàn toàn |
| **Fixed Window** | Đếm request trong từng cửa sổ cố định (vd mỗi phút), reset đầu cửa sổ | Đơn giản nhất, rẻ nhất | **Lỗi biên cửa sổ**: 100 req cuối phút 1 + 100 req đầu phút 2 = 200 req trong 2 giây mà vẫn hợp lệ | ⚠️ gấp đôi limit ở biên |
| **Sliding Window Log** | Lưu timestamp từng request, đếm số request trong cửa sổ trượt | Chính xác tuyệt đối | Memory O(n) theo số request — đắt với traffic lớn | Kiểm soát chính xác |
| **Sliding Window Counter** | Nội suy: `count_hiện_tại + count_cửa_sổ_trước × phần_trăm_chồng_lấn` | Gần chính xác, memory O(1) — **lựa chọn thực dụng nhất** | Xấp xỉ (giả định request phân bố đều trong cửa sổ trước) | Kiểm soát tốt |

Chuẩn ứng xử HTTP khi bị limit:

- Trả **`429 Too Many Requests`** kèm header **`Retry-After`** (số giây nên chờ).
- Kèm header thông tin: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` — để client tự điều tiết (backoff) thay vì retry mù.

Implement thực tế: với một instance thì in-memory counter là đủ; nhiều instance phải dùng **Redis làm counter tập trung** — `INCR` + `EXPIRE` cho fixed window, hoặc Lua script cho thuật toán phức tạp (chi tiết ở Câu 46). Vị trí đặt: thường ở **API Gateway / reverse proxy** (nginx `limit_req` chính là leaky bucket) để chặn sớm trước khi tốn tài nguyên app.

**Insight phỏng vấn**: nắm chắc **lỗi biên của fixed window** và biết **token bucket là lựa chọn mặc định của ngành** (AWS, Stripe đều dùng) vì cho burst tự nhiên — đó là hai ý interviewer chờ nghe nhất.

### Thiết kế minh hoạ

```text
TOKEN BUCKET (rate = 10 token/s, capacity = 20)

  nạp 10 token/s ──► ┌─────────────┐
                     │ ●●●●●●●     │ bucket (tối đa 20)
                     └──────┬──────┘
  request đến ──► còn token? ──► tiêu 1 token, cho qua (burst tối đa 20 req tức thời)
                       └── hết ──► 429 + Retry-After

FIXED WINDOW — lỗi biên:
  |■■■■■■■■■■ 100 req (giây 59) | 100 req (giây 61) ■■■■■■■■■■|
  └── phút 1: hợp lệ ──────────┴────────── phút 2: hợp lệ ───┘
       → thực tế 200 req trong 2 giây! Sliding window khắc phục điều này.
```

```typescript
// Token bucket — refill "lười": chỉ tính lại khi có request, không cần timer
type Bucket = { tokens: number; lastRefill: number };

const RATE = 10; // token mỗi giây
const CAPACITY = 20; // burst tối đa

function tryConsume(bucket: Bucket, now: number): { allowed: boolean; bucket: Bucket } {
  // Nạp token theo thời gian trôi qua, không vượt capacity (immutable — trả bucket mới)
  const elapsed = (now - bucket.lastRefill) / 1000;
  const tokens = Math.min(CAPACITY, bucket.tokens + elapsed * RATE);

  if (tokens < 1) {
    return { allowed: false, bucket: { tokens, lastRefill: now } };
  }
  return { allowed: true, bucket: { tokens: tokens - 1, lastRefill: now } };
}

// Middleware: trả 429 đúng chuẩn khi vượt limit
app.use((req, res, next) => {
  const result = limiter.check(req.ip);
  res.setHeader("X-RateLimit-Remaining", String(result.remaining));
  if (!result.allowed) {
    res.setHeader("Retry-After", String(result.retryAfterSec));
    return res.status(429).json({ error: "Quá nhiều request, vui lòng thử lại sau" });
  }
  next();
});
```

### Đáp án mẫu

> "Rate limiting giới hạn số request mỗi client trong một khoảng thời gian, để chống abuse, DoS và đảm bảo fair usage. Về thuật toán: token bucket nạp token đều vào bucket, request tiêu token — ưu điểm là cho phép burst trong giới hạn capacity nên được Stripe, AWS dùng làm mặc định. Leaky bucket thì ép output rate phẳng tuyệt đối, hợp traffic shaping nhưng burst hợp lệ bị delay. Fixed window đơn giản nhất nhưng có lỗi biên — dồn request cuối cửa sổ này và đầu cửa sổ sau có thể gấp đôi limit. Sliding window log chính xác nhưng tốn memory, nên thực dụng nhất là sliding window counter dùng nội suy. Khi reject em trả 429 kèm Retry-After và các header X-RateLimit để client tự backoff. Production nhiều instance thì counter phải tập trung ở Redis, và em đặt rate limiter ở API Gateway để chặn sớm nhất."

---

## Câu 25: WebSocket, Long Polling và Server-Sent Events khác nhau thế nào? `[Intermediate]`

### Câu hỏi

> WebSocket, Long Polling và Server-Sent Events (SSE) khác nhau thế nào? Khi nào chọn cái nào, và HTTP/2 ảnh hưởng gì đến lựa chọn này?

### Giải thích lý thuyết

Cả ba đều giải bài toán **server chủ động đẩy data về client** — thứ HTTP request/response truyền thống không làm được:

- **Long Polling**: client gửi request, server **giữ connection mở** đến khi có data (hoặc timeout) mới trả về; client nhận xong **lập tức gửi request mới**. Bản chất vẫn là HTTP thường, chỉ "kéo dài" chờ đợi.
- **SSE (Server-Sent Events)**: **một** HTTP connection mở dài, server stream text events (`Content-Type: text/event-stream`) về client liên tục. **Một chiều** server → client. Browser có sẵn `EventSource` API với **auto-reconnect + `Last-Event-ID`** để resume.
- **WebSocket**: bắt đầu bằng HTTP handshake (`Upgrade: websocket`) rồi **nâng cấp thành kênh TCP hai chiều** (full-duplex), frame nhị phân overhead chỉ vài byte. Không còn là HTTP nữa.

| Tiêu chí | Long Polling | SSE | WebSocket |
| --- | --- | --- | --- |
| Hướng | 2 chiều (qua request mới) | 1 chiều server → client | 2 chiều thật (full-duplex) |
| Giao thức | HTTP thuần | HTTP (stream) | Riêng, sau HTTP upgrade |
| Overhead | Cao — mỗi message một request đầy đủ header | Thấp — 1 connection, chỉ stream body | Thấp nhất — frame vài byte |
| Reconnect | "Tự nhiên" (vòng lặp request) | **Tự động** (EventSource + Last-Event-ID) | Phải tự code (backoff, resume) |
| Binary | Không (thực tế) | Không (text only, UTF-8) | Có |
| Qua proxy/firewall cũ | Dễ nhất | Khá dễ | Hay bị chặn/cắt connection |
| Hỗ trợ browser | Mọi nơi | Tốt (trừ IE cũ) | Tốt |
| Use case | Fallback, event thưa | Notification, news feed, live score, **LLM streaming** | Chat, game, collaborative editing, trading |

Cách chọn theo nhu cầu:

- Cần **client gửi liên tục + latency thấp** (chat, game, cursor realtime) → **WebSocket**.
- Chỉ cần **server đẩy một chiều** (notification, feed, progress, token streaming của ChatGPT) → **SSE**: đơn giản hơn nhiều, đi qua HTTP infrastructure (LB, proxy, auth header) bình thường.
- Hạ tầng cũ, event thưa, cần tương thích tối đa → **Long Polling** làm fallback (Socket.IO tự động fallback kiểu này).

**HTTP/2 ảnh hưởng gì?** SSE trên HTTP/1.1 bị giới hạn ~6 connection/domain của browser (mở nhiều tab là hết); **HTTP/2 multiplexing** cho phép cả trăm SSE stream chung **một** TCP connection → SSE trở nên hấp dẫn hơn hẳn. Ngược lại WebSocket vốn không tương thích trực tiếp HTTP/2 (cần RFC 8441 — extended CONNECT, hỗ trợ chưa đều). Lưu ý: HTTP/2 Server Push (đẩy resource) đã bị deprecated, **không** phải là cơ chế thay thế ba kỹ thuật này.

**Insight phỏng vấn**: đắt giá nhất là câu "không phải cứ realtime là WebSocket — nếu chỉ cần một chiều thì SSE đơn giản và dễ vận hành hơn nhiều", kèm ví dụ thời sự: các LLM API (OpenAI, Anthropic) đều stream token bằng SSE.

### Thiết kế minh hoạ

```text
LONG POLLING                SSE                       WEBSOCKET
client    server        client      server         client      server
  │──req──►│              │──GET /events──►│          │──HTTP Upgrade──►│
  │  (chờ...)             │◄──event: a ────│          │◄════ 101 ══════►│
  │◄─data──│              │◄──event: b ────│          │◄═══ frame ═════►│ hai chiều,
  │──req──►│ lặp lại      │◄──event: c ────│ 1 chiều  │◄═══ frame ═════►│ 1 connection
  │  (chờ...)             │  (1 connection,│          │      vài byte/frame
                          │   tự reconnect)│
```

```typescript
// SSE server (Express) — notification một chiều
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");

  const send = (id: number, data: unknown) => {
    // id giúp client resume qua Last-Event-ID khi reconnect
    res.write(`id: ${id}\ndata: ${JSON.stringify(data)}\n\n`);
  };
  const unsubscribe = notifications.subscribe(req.userId, send);
  req.on("close", unsubscribe); // dọn dẹp khi client ngắt
});

// SSE client — browser tự reconnect, không cần code thêm
const es = new EventSource("/events");
es.onmessage = (e) => render(JSON.parse(e.data));

// WebSocket client — hai chiều, nhưng PHẢI tự xử lý reconnect
const ws = new WebSocket("wss://chat.example.com");
ws.onmessage = (e) => render(JSON.parse(e.data));
ws.send(JSON.stringify({ type: "chat", text: "hello" })); // client chủ động gửi
ws.onclose = () => reconnectWithBackoff(); // tự code: backoff + resume state
```

### Đáp án mẫu

> "Cả ba đều để server đẩy data về client. Long polling là HTTP thường nhưng server giữ request đến khi có data, client nhận xong gửi request mới — tương thích tốt nhất nhưng overhead cao, giờ chủ yếu làm fallback. SSE mở một HTTP connection và stream event một chiều server về client — nhẹ, có EventSource tự reconnect kèm Last-Event-ID, rất hợp notification, feed, và chính là cách các LLM API stream token. WebSocket thì upgrade từ HTTP thành kênh TCP hai chiều full-duplex, overhead vài byte mỗi frame — bắt buộc cho chat, game, collaborative editing, nhưng phải tự code reconnect và khó đi qua proxy cũ hơn. Quan điểm của em: không phải cứ realtime là WebSocket — chỉ cần một chiều thì SSE đơn giản hơn nhiều. Với HTTP/2, multiplexing gỡ giới hạn 6 connection của SSE nên SSE càng hấp dẫn, còn WebSocket trên HTTP/2 cần RFC 8441 hỗ trợ chưa đều."

---

## Câu 46: Thiết kế Rate Limiter phân tán cho API? `[Advanced]`

### Câu hỏi

> Thiết kế một rate limiter phân tán cho hệ thống API nhiều instance: kiến trúc, lưu trữ counter, đảm bảo atomicity, và xử lý khi storage gặp sự cố?

### Giải thích lý thuyết

**Requirements** (nên chốt trước với interviewer):

- Limit theo nhiều dimension: **user ID, API key, IP**; mỗi tier khác limit (free 100 req/phút, pro 10.000 req/phút).
- Chính xác hợp lý (không vượt limit quá vài %), **latency thêm < 5ms** mỗi request.
- Hoạt động đúng khi API chạy **N instance** sau load balancer.
- Trả 429 + `Retry-After` chuẩn; chịu được khi chính rate limiter gặp sự cố.

**Tại sao local counter không đủ?** Mỗi instance đếm riêng trong memory thì limit thực tế = `limit × N` (LB chia đều thì user lách được N lần limit), và autoscale thay đổi N liên tục → limit "trôi". Bắt buộc cần **trạng thái đếm tập trung**.

**Thiết kế: Redis centralized counter + Lua script**

- Mỗi key dạng `ratelimit:{user_id}:{endpoint}`, dùng **sliding window counter** (2 counter: cửa sổ hiện tại + trước, nội suy) — cân bằng tốt giữa chính xác và memory O(1).
- **Atomicity là điểm sống còn**: nếu làm `GET` rồi `SET` từ app sẽ dính race condition giữa các instance (hai instance cùng đọc 99, cùng cho qua → 101). Giải pháp: gói toàn bộ read–check–increment vào **một Lua script** — Redis thực thi script tuần tự, đơn lệnh, atomic. (Ngoài ra Redis Cell module có sẵn lệnh `CL.THROTTLE`.)
- **Vị trí đặt**: ở **API Gateway** — chặn sớm nhất, app service phía sau không cần biết logic limit; rule cấu hình tập trung theo route + tier.

**Trade-offs phải nói được**:

| Quyết định | Lựa chọn A | Lựa chọn B |
| --- | --- | --- |
| Kiểm tra | **Sync** — gọi Redis trước khi xử lý: chính xác, +1 round-trip (~1ms cùng AZ) | **Async/batch** — cho qua trước, đồng bộ counter định kỳ: nhanh hơn nhưng có thể vượt limit tạm thời (Cloudflare dùng cách lai) |
| Redis chết | **Fail-open** — cho hết qua: ưu tiên availability, chấp nhận hở limit ngắn hạn (đa số API chọn cách này) | **Fail-closed** — chặn hết: ưu tiên an toàn, hợp endpoint nhạy cảm (login, OTP, payment) nhưng Redis chết = toàn bộ API chết |
| Scale Redis | 1 instance + replica: đơn giản, đủ cho ~100k ops/s | Redis Cluster, shard theo hash(user_id): counter của 1 user luôn nằm 1 node nên không cần đếm cross-node |

Cách giảm rủi ro thực dụng: **fail-open kèm local fallback limiter** (limit thô trong memory mỗi instance) khi Redis timeout — vừa không sập API, vừa không thả cửa hoàn toàn; kèm circuit breaker + alert để biết đang chạy chế độ suy giảm.

**Insight phỏng vấn**: ba điểm ăn tiền của câu này — (1) giải thích được race condition và vì sao cần Lua script, (2) chủ động bàn fail-open vs fail-closed *theo từng loại endpoint* thay vì chọn một phía, (3) nhớ tính multi-dimension (user/IP/API key) vì đề chỉ nói "cho API".

### Thiết kế minh hoạ

```text
            ┌──────────────────────────────────────────────┐
Client ────►│ API Gateway (rate limit middleware, N instance)│
            └──────┬───────────────────────────────────────┘
                   │ EVALSHA lua_script (atomic, ~1ms)
                   ▼
            ┌─────────────┐   replica/cluster
            │   Redis     │──────────────────►(HA)
            │ ratelimit:* │
            └──────┬──────┘
        allowed ◄──┴──► denied → 429 + Retry-After
                   │
        Redis timeout? → circuit breaker → FAIL-OPEN
                         + local fallback limiter + alert
```

```typescript
// Lua script: sliding window counter — toàn bộ check + increment là MỘT thao tác atomic
const RATE_LIMIT_SCRIPT = `
  local curr_key, prev_key = KEYS[1], KEYS[2]
  local limit   = tonumber(ARGV[1])
  local window  = tonumber(ARGV[2])  -- giây
  local elapsed = tonumber(ARGV[3])  -- đã trôi bao nhiêu trong cửa sổ hiện tại

  local curr = tonumber(redis.call('GET', curr_key) or '0')
  local prev = tonumber(redis.call('GET', prev_key) or '0')

  -- Nội suy: phần cửa sổ trước còn "chồng lấn" vào cửa sổ trượt
  local weighted = prev * ((window - elapsed) / window) + curr
  if weighted >= limit then
    return {0, math.ceil(window - elapsed)}      -- denied + retry_after
  end

  redis.call('INCR', curr_key)
  redis.call('EXPIRE', curr_key, window * 2)     -- giữ đủ 2 cửa sổ rồi tự xoá
  return {1, 0}                                  -- allowed
`;

async function checkRateLimit(userId: string, tier: Tier): Promise<LimitResult> {
  const { limit, windowSec } = TIER_CONFIG[tier]; // free: 100/60s, pro: 10000/60s
  const now = Date.now() / 1000;
  const currWindow = Math.floor(now / windowSec);

  try {
    const [allowed, retryAfter] = await redis.evalsha(SCRIPT_SHA, {
      keys: [`rl:${userId}:${currWindow}`, `rl:${userId}:${currWindow - 1}`],
      arguments: [String(limit), String(windowSec), String(now % windowSec)],
    });
    return { allowed: allowed === 1, retryAfter };
  } catch (error) {
    logger.error("Rate limiter Redis lỗi, chuyển fail-open + local fallback", { error });
    // Fail-open có kiểm soát: vẫn chặn thô bằng limiter local của instance này
    return localFallbackLimiter.check(userId);
  }
}
```

### Đáp án mẫu

> "Đầu tiên em chốt requirement: limit theo user, IP và API key với tier khác nhau, latency thêm dưới 5ms, chạy đúng trên nhiều instance. Local counter không đủ vì mỗi instance đếm riêng thì limit thực tế nhân N lần, nên em dùng Redis làm counter tập trung, đặt rate limiter ở API Gateway để chặn sớm. Thuật toán em chọn sliding window counter — chính xác gần như log nhưng memory O(1). Điểm sống còn là atomicity: nếu GET rồi SET từ app sẽ race condition giữa các instance, nên em gói toàn bộ check-và-increment vào một Lua script để Redis thực thi atomic. Về sự cố, em chọn fail-open kèm local fallback limiter và circuit breaker — API không sập khi Redis chết mà vẫn không thả cửa hoàn toàn; riêng endpoint nhạy cảm như login, payment thì fail-closed. Khi reject em trả 429 kèm Retry-After để client backoff."

---

## Bẫy thường gặp khi trả lời

| Bẫy | Cách tránh |
| --- | --- |
| Nói load balancer mà không phân biệt L4/L7 | Mở đầu bằng phân tầng: L4 nhìn IP/port — nhanh; L7 hiểu HTTP — route theo nội dung, SSL termination |
| Mặc định sticky session là giải pháp cho state | Chỉ ra trade-off (lệch tải, mất session) và đề xuất stateless + Redis session |
| Coi CDN chỉ là "cache ảnh cho nhanh" | Nhấn mạnh CDN giảm cả latency lẫn origin load, và CDN hiện đại có edge compute cho dynamic content |
| Quên cache invalidation khi nói về CDN | Luôn kèm chiến lược: versioned URL cho asset, TTL ngắn / stale-while-revalidate cho HTML, purge cho khẩn cấp |
| Lẫn lộn forward và reverse proxy | Dùng câu chốt "forward giấu client, reverse giấu server" rồi mới đi vào use case |
| Không biết lỗi biên của fixed window | Chủ động nêu ví dụ 2× limit trong vài giây ở biên cửa sổ, và nói sliding window khắc phục |
| Trả lời rate limit mà quên 429 + Retry-After | Luôn nhắc chuẩn HTTP response và các header X-RateLimit để client tự backoff |
| "Cứ realtime là WebSocket" | Phân tích theo hướng dữ liệu: một chiều → SSE đơn giản hơn; hai chiều latency thấp → WebSocket; fallback → long polling |
| Thiết kế rate limiter phân tán bằng GET/SET thường | Chỉ ra race condition giữa các instance và giải bằng Lua script atomic trên Redis |
| Chọn cứng fail-open hoặc fail-closed | Trình bày theo loại endpoint: API thường fail-open + fallback; login/payment fail-closed |
