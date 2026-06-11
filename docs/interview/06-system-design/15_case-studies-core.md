---
sidebar_position: 15
title: "15. Case Studies: Core Systems"
---

# Case Studies: Core Systems

> *Case study là phần "thi đấu thật" của vòng system design. Interviewer không chấm bạn vẽ đúng bao nhiêu ô — họ chấm cách bạn đi từ requirements → high-level design → deep dive → trade-offs một cách có kỷ luật. 6 hệ thống dưới đây là những bài kinh điển nhất: webhook, URL shortener, chat, notification, crawler, message queue.*

---

## Câu 34: Thiết kế hệ thống Webhook `[Advanced]`

### Câu hỏi

> Thiết kế hệ thống webhook như Stripe/GitHub: platform của bạn cần gửi event (payment succeeded, push code...) tới endpoint HTTP của hàng nghìn khách hàng. Làm sao đảm bảo delivery, bảo mật, và xử lý retry khi endpoint của khách hàng chết?

### Giải thích lý thuyết

**1. Requirements**

- *Functional*: khách hàng đăng ký endpoint URL + chọn event types; khi event xảy ra, hệ thống POST payload tới endpoint; có dashboard xem lịch sử delivery + replay thủ công.
- *Non-functional*: **at-least-once delivery** (không được mất event), độ trễ giây-level là chấp nhận được (không cần real-time tuyệt đối), endpoint của khách hàng **không tin cậy được** (chậm, chết, trả lỗi bất kỳ), bảo mật chống giả mạo và replay.
- *Capacity estimate*: 10k khách hàng × trung bình 100 event/ngày ≈ 1M delivery/ngày ≈ ~12 req/s trung bình, peak ×10 ≈ 120 req/s — không lớn, nhưng cái khó nằm ở **fan-out + retry + endpoint chậm chiếm worker**, không phải throughput.

**2. High-level design**

Event từ core system → publish vào **queue** → **dispatcher** lookup subscription (customer nào đăng ký event type này) → fan-out thành từng **delivery job** per endpoint → pool **worker** gọi HTTP POST. Tách queue ra để: (a) core system không bị block bởi endpoint chậm của khách, (b) retry độc lập per endpoint, (c) scale worker theo backlog.

**3. Deep dive các quyết định kỹ thuật**

- **Retry**: exponential backoff **có jitter** (1m → 5m → 30m → 2h → 1 ngày), max ~8 attempts. Jitter để tránh thundering herd khi endpoint khách hàng sống lại. Hết attempts → đẩy vào **DLQ** + hiện trên dashboard cho customer tự **replay**. Email cảnh báo nếu endpoint fail liên tục nhiều ngày → auto-disable.
- **Bảo mật**: ký payload bằng **HMAC-SHA256** với secret riêng per endpoint, gửi qua header (kiểu `X-Hub-Signature-256` của GitHub). Kèm **timestamp trong phần được ký** — consumer reject nếu lệch quá 5 phút → chống **replay attack**. Chỉ chấp nhận endpoint **HTTPS**. Không bao giờ gửi secret trong payload.
- **Idempotency phía consumer**: vì at-least-once nên có thể gửi trùng — mỗi event có **event ID duy nhất**, consumer dedup theo ID. Đây là contract phải ghi rõ trong docs.
- **Ordering**: KHÔNG đảm bảo thứ tự (retry làm event cũ đến sau event mới). Giải pháp: kèm `sequence`/`created_at` trong payload, consumer tự reconcile, hoặc consumer gọi API fetch state mới nhất thay vì tin payload.
- **Timeout ngắn 5–10s**: yêu cầu consumer trả `2xx` **ngay** rồi xử lý async phía họ. Nếu để timeout dài, một endpoint chậm sẽ chiếm hết worker pool (head-of-line blocking).
- **Circuit breaker** per endpoint: endpoint fail liên tục → tạm ngừng gửi một thời gian thay vì đốt worker vô ích.

**4. Trade-offs**

- At-least-once + dedup phía consumer **đơn giản và thực dụng hơn** exactly-once (gần như bất khả thi qua HTTP).
- Queue per-endpoint cô lập tốt nhưng tốn tài nguyên → thực tế dùng shared queue + circuit breaker.
- Push (webhook) tiện cho customer nhưng mình gánh độ phức tạp retry; nhiều platform bổ sung **polling API** làm fallback.

### Thiết kế minh hoạ

```text
                 ┌──────────────┐
 Core System ──► │ Event Queue  │  (Kafka/SQS — buffer, không mất event)
                 └──────┬───────┘
                        ▼
                ┌───────────────┐    lookup subscriptions
                │  Dispatcher   │ ◄── (customer nào nghe event này?)
                └──────┬────────┘
            fan-out: 1 event → N delivery jobs
                        ▼
                ┌───────────────┐         retry w/ backoff
                │ Delivery Queue│ ◄────────────────┐
                └──────┬────────┘                  │
                       ▼                           │ fail
   ┌────────────────────────────────┐              │
   │ Worker Pool (timeout 5-10s,    │──────────────┘
   │ circuit breaker per endpoint)  │── hết attempts ──► DLQ ──► Dashboard
   └──────────────┬─────────────────┘                           (replay)
                  ▼  HTTPS POST + HMAC signature
          Customer Endpoints
```

```python
# Worker: ký HMAC + gửi, comment tiếng Việt
import hashlib, hmac, time

def build_signature(secret: str, payload: bytes) -> tuple[str, str]:
    timestamp = str(int(time.time()))
    # Ký CẢ timestamp để chống replay attack
    signed_content = f"{timestamp}.".encode() + payload
    signature = hmac.new(secret.encode(), signed_content, hashlib.sha256).hexdigest()
    return timestamp, signature

# Headers gửi đi:
#   X-Webhook-Id: evt_8f2a...      ← consumer dedup theo ID này (idempotency)
#   X-Webhook-Timestamp: 1718000000 ← reject nếu lệch > 5 phút
#   X-Webhook-Signature: sha256=ab12...

# Lịch retry: exponential backoff + jitter, tránh thundering herd
RETRY_SCHEDULE_SECONDS = [60, 300, 1800, 7200, 86400]  # 1m → 1 ngày

def next_retry_at(attempt: int) -> float:
    import random
    base = RETRY_SCHEDULE_SECONDS[min(attempt, len(RETRY_SCHEDULE_SECONDS) - 1)]
    return time.time() + base * random.uniform(0.8, 1.2)  # jitter ±20%
```

### Đáp án mẫu

> "Em tách bài toán làm hai nửa: produce event và deliver event. Core system chỉ publish event vào queue rồi xong việc — dispatcher lookup subscription, fan-out thành delivery job per endpoint, worker pool gọi HTTP POST với timeout ngắn 5–10 giây, yêu cầu khách hàng trả 2xx ngay rồi xử lý async. Em chọn at-least-once delivery: fail thì retry exponential backoff có jitter, max khoảng 8 lần, hết thì vào DLQ và hiện lên dashboard cho khách tự replay. Hệ quả là có thể gửi trùng, nên mỗi event có ID duy nhất và em ghi rõ trong docs là consumer phải idempotent. Bảo mật thì em ký HMAC-SHA256 payload kèm timestamp trong header — vừa chống giả mạo vừa chống replay attack, và bắt buộc HTTPS. Ordering em không hứa — retry làm event đến lệch thứ tự, nên payload kèm sequence để consumer reconcile. Cuối cùng em thêm circuit breaker per endpoint để một khách hàng chết không đốt hết worker của cả hệ thống."

---

## Câu 43: Thiết kế URL Shortener `[Advanced]`

### Câu hỏi

> Thiết kế một URL shortener như bit.ly: nhận long URL, trả về short URL, và redirect khi user truy cập. Trình bày cách sinh short code, lựa chọn database, caching, và các tính năng analytics/custom alias.

### Giải thích lý thuyết

**1. Requirements**

- *Functional*: tạo short URL từ long URL; redirect short → long; custom alias; expiration; analytics đếm click.
- *Non-functional*: redirect phải **rất nhanh** (&lt;50ms) và **high availability** — link chết là mất uy tín; hệ thống **read-heavy** rõ rệt.
- *Capacity estimate*: giả sử 100M URL mới/tháng ≈ ~40 writes/s; tỉ lệ **read:write = 100:1** → ~4.000 reads/s, peak ~10k/s. Storage: 100M × ~500 bytes ≈ 50GB/tháng — nhỏ, bài toán nằm ở read latency chứ không phải dung lượng.

**2. High-level design**

Hai luồng tách biệt: **Write path** (API tạo URL → sinh short code → ghi DB) và **Read path** (GET /\{code\} → check cache → DB → redirect). Đặt LB phía trước, read path đi qua Redis cache trước khi chạm DB.

**3. Deep dive các quyết định kỹ thuật**

- **Sinh short code — 2 phương án chính**:
  - *Counter + base62*: mỗi URL nhận một số tự tăng, encode base62 (`a-zA-Z0-9`). 7 ký tự = 62⁷ ≈ 3.5 nghìn tỷ — quá đủ. Ưu: **không bao giờ collision**, code ngắn. Nhược: đoán được URL kế tiếp (sequential) → có thể bỏ qua bằng cách xáo trộn (bijective scramble) hoặc cộng offset ngẫu nhiên.
  - *Hash (MD5/SHA) lấy 7 ký tự đầu + collision check*: ưu là stateless, cùng URL ra cùng code; nhược là **phải check collision** và retry — tốn round-trip DB.
  - *Tại sao không UUID*: 36 ký tự — quá dài, mất luôn ý nghĩa "shortener".
- **ID generator phân tán**: counter đơn là SPOF. Giải pháp **range allocation**: một coordinator (ZooKeeper/DB) cấp phát từng dải (server A nhận 1–1M, server B nhận 1M–2M...), mỗi app server tự tăng trong RAM trong dải của mình — không cần gọi coordinator mỗi request.
- **Database**: access pattern thuần key→value (`code → long_url`) → **KV store là đủ** (DynamoDB/Cassandra), partition theo `short_code`. RDBMS cũng được ở quy mô vừa; không cần join.
- **301 vs 302**: `301 Permanent` → browser cache redirect, lần sau **không gọi server nữa** → giảm tải nhưng **mất analytics**. `302/307` → mọi click đều qua server → đếm được. Bit.ly dùng 301 nhưng đa số shortener thương mại chọn **302 vì analytics là sản phẩm chính**.
- **Cache**: hot URL theo Pareto — **~20% URL chiếm ~80% traffic** → Redis cache `code → url`, eviction LRU, TTL vài giờ. Cache-aside: miss thì đọc DB rồi set cache.
- **Analytics async**: redirect path chỉ đẩy event (code, timestamp, IP, UA) vào queue rồi trả redirect ngay; worker aggregate phía sau — không bao giờ để analytics làm chậm redirect.
- **Rate limiting** API tạo URL (per user/IP) chống spam/abuse; **custom alias** check unique trước khi insert; **expiration** bằng TTL field + lazy delete hoặc batch cleanup.

**4. Trade-offs**

- Counter + base62 (đơn giản, không collision) vs hash (stateless nhưng phải xử lý collision) — em nghiêng counter + range allocation.
- 302 ăn thêm tải server nhưng giữ được analytics — đáng đánh đổi vì đó là giá trị kinh doanh.
- Cache giảm latency nhưng có cửa sổ stale nhỏ khi URL bị xoá/expire — chấp nhận với TTL ngắn.

### Thiết kế minh hoạ

```text
 WRITE PATH                              READ PATH (hot path!)
 ──────────                              ─────────────────────
 POST /shorten                           GET /Ab3xY9z
      │                                       │
      ▼                                       ▼
 ┌─────────┐   xin dải ID    ┌────┐      ┌─────────┐
 │ API Srv │◄───────────────►│ ZK │      │   LB    │
 └────┬────┘  (range alloc:  └────┘      └────┬────┘
      │        1M id/lần)                     ▼
      │ base62(id)                       ┌─────────┐  hit (~80%)
      ▼                                  │  Redis  │────► 302 redirect
 ┌─────────┐                             └────┬────┘
 │ DB (KV) │◄────────────── miss ─────────────┘
 └─────────┘                                  │
                                              ▼ (async, không block)
                                       Analytics Queue ──► Worker ──► OLAP
```

```sql
-- Schema tối giản — access pattern thuần key-value
CREATE TABLE urls (
    short_code   VARCHAR(10) PRIMARY KEY,  -- partition key
    long_url     TEXT NOT NULL,
    user_id      BIGINT,
    expires_at   TIMESTAMP,                -- NULL = vĩnh viễn
    created_at   TIMESTAMP DEFAULT now()
);
```

```python
BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

def encode_base62(num: int) -> str:
    """Encode ID tự tăng thành short code — KHÔNG bao giờ collision."""
    if num == 0:
        return BASE62[0]
    chars: list[str] = []
    while num > 0:
        num, rem = divmod(num, 62)
        chars.append(BASE62[rem])
    return "".join(reversed(chars))  # vd: 125_000_000_000 → "29hLrM4"
```

### Đáp án mẫu

> "Em bắt đầu từ capacity: hệ này read-heavy khoảng 100:1, nên em tối ưu toàn bộ cho redirect path. Sinh short code em chọn counter tự tăng encode base62 — 7 ký tự cho 3.5 nghìn tỷ tổ hợp và không bao giờ collision, thay vì hash phải check trùng, còn UUID thì loại ngay vì quá dài. Để counter không thành SPOF, em dùng range allocation: ZooKeeper cấp mỗi app server một dải một triệu ID, server tự tăng trong RAM. Database thì access pattern thuần key-value nên KV store như DynamoDB là đủ, partition theo short code. Redirect em chọn 302 thay vì 301 — 301 bị browser cache nên mất analytics, mà analytics chính là sản phẩm. Trước DB em đặt Redis cache vì khoảng 20% URL chiếm 80% traffic. Analytics em đẩy event vào queue xử lý async để không bao giờ làm chậm redirect. Cuối cùng là rate limiting API tạo URL chống abuse, hỗ trợ custom alias check unique và expiration bằng TTL."

---

## Câu 44: Thiết kế hệ thống Chat real-time `[Advanced]`

### Câu hỏi

> Thiết kế backend cho hệ thống chat real-time như WhatsApp/Slack: gửi nhận tin nhắn 1-1 và group, trạng thái delivered/read, presence (online/offline), và hỗ trợ user offline. Tập trung vào kiến trúc backend và lựa chọn database.

### Giải thích lý thuyết

**1. Requirements**

- *Functional*: chat 1-1 và group; delivery status (sent/delivered/read); presence; lịch sử tin nhắn; offline user nhận push notification và sync khi online lại.
- *Non-functional*: độ trễ thấp (&lt;500ms end-to-end), **không mất tin nhắn**, ordering đúng trong từng conversation, scale tới chục triệu concurrent connection.
- *Capacity estimate*: 50M DAU, mỗi người 40 tin/ngày → 2B tin/ngày ≈ ~23k msg/s trung bình, peak ~100k/s. 10M concurrent WebSocket — mỗi gateway giữ ~100k connection → cần ~100 gateway node.

**2. High-level design**

Client giữ **WebSocket** tới **Chat Gateway** (stateful). Gateway nhận tin → đẩy vào **Message Service** → persist DB → tra **connection registry** xem receiver đang nối gateway nào → route tới gateway đó push xuống. Receiver offline → gửi **push notification** (FCM/APNs), khi online lại thì **sync** tin chưa nhận từ DB.

**3. Deep dive các quyết định kỹ thuật**

- **WebSocket gateway stateful + connection registry**: vì connection dính vào một node cụ thể, cần map `user_id → gateway_id` lưu trong **Redis** (TTL + heartbeat refresh). Gateway chỉ làm nhiệm vụ giữ connection — logic nằm ở service phía sau, để gateway restart/scale ít đau đớn.
- **Message flow & độ bền**: persist DB **trước** khi ack "sent" cho sender — tin đã ack là không được mất. Sau đó mới push cho receiver. Receiver ack lại → cập nhật "delivered"; mở conversation → "read". Status update cũng là một loại message ngược về sender.
- **Message ID + ordering**: ID tăng dần **per conversation** (snowflake-style hoặc sequence per partition) — client sort theo ID, đồng thời dùng ID làm con trỏ sync ("cho em mọi tin sau ID X"). Ordering chỉ hứa **trong một conversation**, không hứa toàn cục.
- **Group chat fan-out**: group nhỏ (&lt;vài trăm) → fan-out ngay khi gửi (write path); group/channel rất lớn → fan-out lúc đọc hoặc lai (như channel Slack lớn): ghi 1 bản vào conversation, member online được push, member offline tự pull khi mở.
- **Database**: write-heavy, append-only, query chủ đạo là "tin mới nhất của conversation X" → **Cassandra/ScyllaDB**: partition key = `conversation_id`, clustering key = `message_id DESC` — đọc một partition, sequential, rất nhanh. RDBMS sẽ nghẽn ở write volume này.
- **Presence**: client gửi **heartbeat** mỗi ~30s → set Redis key `presence:{user_id}` với **TTL** ~60s; key hết hạn = offline. Tránh "thông báo offline ngay khi rớt mạng 2 giây". Subscribe presence của bạn bè qua pub/sub, chỉ push thay đổi cho người đang quan tâm.
- **E2E encryption**: nếu được hỏi, nhắc **Signal Protocol** (X3DH + Double Ratchet) — server chỉ thấy ciphertext, chỉ route và lưu blob; trade-off là server-side search/moderation gần như bất khả thi.

**4. Trade-offs**

- Stateful gateway phức tạp hơn HTTP stateless nhưng bắt buộc cho real-time push (long-polling là fallback tốn kém).
- Fan-out on write nhanh cho reader nhưng tốn write với group lớn → hybrid theo kích thước group.
- Cassandra ăn write tốt nhưng query linh hoạt kém — search tin nhắn phải đẩy sang Elasticsearch riêng.

### Thiết kế minh hoạ

```text
  Sender ──WebSocket──► ┌────────────┐
                        │ Gateway A  │───┐
                        └────────────┘   │ 1. gửi msg
                                         ▼
   ┌──────────────┐  2. persist   ┌──────────────┐
   │ Cassandra    │◄──────────────│ Msg Service  │
   │ (msg store)  │  (rồi mới ack)└──────┬───────┘
   └──────────────┘                      │ 3. receiver ở gateway nào?
                                         ▼
                              ┌─────────────────────┐
                              │ Redis               │
                              │ conn: user→gateway  │
                              │ presence: TTL 60s   │
                              └──────┬──────────────┘
                       online        │        offline
                ┌────────────────────┴──────────────┐
                ▼                                   ▼
        ┌────────────┐  4. push             ┌──────────────┐
        │ Gateway B  │──────► Receiver      │ Push Service │──► FCM/APNs
        └────────────┘                      └──────────────┘
                                            (online lại → sync từ msg_id cuối)
```

```sql
-- Cassandra: tối ưu cho "lấy tin mới nhất của conversation"
CREATE TABLE messages (
    conversation_id uuid,      -- partition key: mọi tin 1 hội thoại nằm cùng node
    message_id      bigint,    -- clustering key: tăng dần per conversation
    sender_id       bigint,
    content         text,      -- ciphertext nếu E2E
    status          tinyint,   -- 0=sent, 1=delivered, 2=read
    created_at      timestamp,
    PRIMARY KEY ((conversation_id), message_id)
) WITH CLUSTERING ORDER BY (message_id DESC);

-- Sync khi online lại: SELECT * FROM messages
--   WHERE conversation_id = ? AND message_id > ?last_synced_id
```

### Đáp án mẫu

> "Trái tim của hệ này là tầng WebSocket gateway stateful — mỗi gateway giữ khoảng 100 nghìn connection, và vì connection dính vào node cụ thể nên em duy trì connection registry trong Redis map user sang gateway. Flow gửi tin: gateway nhận, message service persist vào DB trước rồi mới ack 'sent' — đã ack là không được mất — sau đó tra registry, route sang gateway của receiver để push. Receiver offline thì bắn push notification qua FCM/APNs, khi online lại sync theo message ID cuối cùng. Message ID em sinh tăng dần per conversation, vừa làm ordering vừa làm con trỏ sync — em chỉ hứa ordering trong một hội thoại. Database em chọn Cassandra: write-heavy, partition theo conversation_id, clustering theo message_id, đọc lịch sử là quét một partition tuần tự. Group chat em fan-out on write với group nhỏ, group lớn thì lai sang pull. Presence em làm bằng heartbeat 30 giây cộng Redis TTL 60 giây. Nếu cần E2E encryption thì dùng Signal Protocol — server chỉ route ciphertext."

---

## Câu 45: Thiết kế hệ thống Notification `[Advanced]`

### Câu hỏi

> Thiết kế hệ thống notification đa kênh (push, email, SMS) cho một platform lớn: các service nội bộ gửi event, hệ thống quyết định gửi gì, qua kênh nào, tới ai — đảm bảo không spam user, không gửi trùng, và OTP phải đi nhanh hơn marketing.

### Giải thích lý thuyết

**1. Requirements**

- *Functional*: API/event nhận yêu cầu gửi từ các service nội bộ; hỗ trợ push (FCM/APNs), email (SES/SendGrid), SMS (Twilio); template + personalization; user preferences (opt-out, kênh ưa thích, quiet hours); tracking delivered/opened.
- *Non-functional*: OTP/transactional phải đi trong vài giây; marketing chấp nhận trễ phút-level; **không gửi trùng**; provider bên thứ ba có thể chậm/chết — phải cô lập được.
- *Capacity estimate*: 10M user, trung bình 5 notification/user/ngày → 50M/ngày ≈ ~600/s, campaign marketing có thể burst hàng triệu trong vài phút → bắt buộc có queue làm buffer.

**2. High-level design**

**Notification API** nhận request (kèm **idempotency key**) → validate → qua **Preference & Rate-limit filter** → render qua **Template Service** → đẩy vào **queue riêng theo channel** (push/email/SMS) và **theo priority** → **worker per channel** gọi provider → kết quả ghi vào tracking store, fail thì retry → DLQ.

**3. Deep dive các quyết định kỹ thuật**

- **Queue per channel**: mỗi channel có throughput, rate limit provider và failure mode khác nhau — email chậm không được kéo OTP SMS chậm theo. Worker mỗi channel scale độc lập, giữ rate limit riêng với từng provider.
- **Priority queue**: tối thiểu 2 mức — **transactional (OTP, reset password)** và **marketing**. Hai queue tách biệt với worker pool riêng, không chỉ là priority field — tránh việc campaign 5 triệu email nhét OTP xuống cuối hàng.
- **Dedup — idempotency key**: caller gửi key (vd `order-123-shipped-user-456`); hệ thống check Redis SETNX với TTL — đã thấy key thì bỏ qua. Chống cả retry của caller lẫn bug double-fire.
- **User preferences + opt-out + quiet hours**: bảng preference per user per channel per category; check **trước khi enqueue**. Quiet hours (22h–8h theo timezone user) → marketing thì **delay** đến sáng, transactional vẫn đi ngay. Opt-out là yêu cầu pháp lý (CAN-SPAM/GDPR) — không phải optional.
- **Rate limit per user**: cap kiểu "tối đa N marketing/ngày/user" chống notification fatigue — quá ngưỡng thì drop hoặc dồn vào **batch digest** ("Bạn có 12 thông báo mới") thay vì 12 push riêng lẻ.
- **Retry + DLQ**: lỗi provider tạm thời (5xx, timeout) → retry backoff; lỗi vĩnh viễn (token invalid, email bounce, số điện thoại sai) → **không retry**, đánh dấu invalid để lần sau khỏi gửi. Hết retry → DLQ + alert.
- **Tracking**: provider callback/webhook (delivered, bounce), tracking pixel cho open email, deep-link callback cho push → đổ vào analytics store đo hiệu quả và feed lại quyết định gửi.

**4. Trade-offs**

- Check preference trước khi enqueue (đỡ tốn queue) vs trước khi gửi (dữ liệu tươi hơn) — thực tế check cả hai, lần cuối ngay trước khi gọi provider.
- Batch digest giảm spam nhưng tăng độ trễ thông tin — chỉ áp cho category không khẩn cấp.
- Đa provider per channel (failover SendGrid → SES) tăng resilience nhưng tốn công đồng bộ template/tracking.

### Thiết kế minh hoạ

```text
 Internal Services ──event──► ┌──────────────────┐
 (order, auth, ...)           │ Notification API │ ◄─ idempotency key (dedup Redis)
                              └────────┬─────────┘
                                       ▼
                          ┌─────────────────────────┐
                          │ Preference / Rate-limit │ ◄─ opt-out, quiet hours,
                          │ + Template render       │    cap per user
                          └────────┬────────────────┘
                  ┌────────────────┼─────────────────┐
                  ▼                ▼                 ▼
          ┌Push queue──┐   ┌Email queue─┐    ┌SMS queue───┐   * mỗi channel tách
          │ HIGH | LOW │   │ HIGH | LOW │    │ HIGH | LOW │     HIGH (OTP) / LOW (mkt)
          └─────┬──────┘   └─────┬──────┘    └─────┬──────┘
                ▼                ▼                 ▼
          Push workers     Email workers      SMS workers ──retry──► DLQ
                │                │                 │
            FCM/APNs       SES/SendGrid         Twilio
                └────────────────┴─────────────────┘
                         provider callbacks ──► Tracking store (delivered/opened)
```

```python
# Dedup bằng idempotency key — Redis SETNX + TTL
async def should_send(redis, idempotency_key: str) -> bool:
    # SETNX: chỉ set nếu chưa tồn tại → atomic dedup
    created = await redis.set(f"notif:dedup:{idempotency_key}", 1,
                              nx=True, ex=86400)  # TTL 24h
    return created is not None  # False = đã gửi rồi, bỏ qua

PRIORITY_QUEUE = {
    "transactional": "notif.push.high",   # OTP, reset password — worker riêng
    "marketing":     "notif.push.low",    # campaign — không được chặn OTP
}
```

### Đáp án mẫu

> "Em thiết kế theo pipeline: API nhận event kèm idempotency key — em dedup bằng Redis SETNX với TTL nên caller retry hay double-fire đều không gửi trùng. Tiếp theo là tầng filter: check user preferences, opt-out theo yêu cầu pháp lý, quiet hours theo timezone — marketing trong giờ ngủ thì delay đến sáng còn transactional vẫn đi ngay — và rate limit per user, quá ngưỡng thì gom thành batch digest thay vì spam. Sau đó render template có personalization rồi đẩy vào queue tách theo channel: push, email, SMS — mỗi channel có worker pool riêng vì rate limit và failure mode của provider khác nhau. Quan trọng nhất là em tách hẳn queue transactional và marketing với worker riêng — campaign năm triệu email không được nhét OTP xuống cuối hàng. Lỗi tạm thời thì retry backoff, lỗi vĩnh viễn như token invalid thì đánh dấu luôn không retry, hết retry vào DLQ. Cuối cùng tracking delivered và opened qua provider callback để đo hiệu quả."

---

## Câu 47: Thiết kế Web Crawler `[Advanced]`

### Câu hỏi

> Thiết kế một web crawler quy mô lớn (như Googlebot thu nhỏ): crawl hàng tỷ trang, lịch sự với website người ta, không crawl trùng, không sa vào bẫy vô hạn, và giữ nội dung đủ tươi.

### Giải thích lý thuyết

**1. Requirements**

- *Functional*: bắt đầu từ seed URLs, tải HTML, extract link, tiếp tục crawl; lưu nội dung cho indexer; recrawl định kỳ giữ freshness.
- *Non-functional*: **politeness** (không DDoS site người ta, tôn trọng robots.txt), scale hàng tỷ trang, dedup hiệu quả, chịu lỗi (trang chết, server chậm), tránh crawler trap.
- *Capacity estimate*: mục tiêu 1B trang/tháng ≈ ~400 trang/s; trung bình 200KB/trang → ~80MB/s bandwidth, storage thô ~200TB/tháng (trước nén/dedup) → blob storage là bắt buộc.

**2. High-level design**

Vòng lặp kinh điển: **URL Frontier** (hàng đợi có priority + politeness) → **Fetcher workers** phân tán tải trang (qua DNS cache) → **Dedup content** → lưu **raw HTML vào blob storage**, metadata vào DB → **Parser** extract link → normalize + **dedup URL** → đẩy link mới quay lại Frontier.

**3. Deep dive các quyết định kỹ thuật**

- **URL Frontier — bộ phận khó nhất**: hai tầng queue. *Front queues* theo **priority** (PageRank, tần suất update, độ sâu); *back queues* theo **domain** — mỗi domain một queue, mỗi queue gắn timer "lần fetch kế tiếp" để enforce **delay giữa 2 request cùng domain** (vd ≥1s hoặc theo `Crawl-delay`). Đây chính là cơ chế politeness: không bao giờ nã song song vào một host.
- **robots.txt**: fetch và cache per domain (TTL ~24h), check **trước khi** fetch bất kỳ URL nào; tôn trọng `Disallow` và `Crawl-delay`. Bỏ qua robots.txt là cách nhanh nhất để bị block IP và mang tiếng.
- **Dedup 2 tầng**: (a) *URL seen?* — hàng tỷ URL nên dùng **Bloom filter** trong RAM: trả "chắc chắn chưa thấy" hoặc "có thể thấy rồi"; false positive chấp nhận được (bỏ sót một ít URL, không sao). (b) *Content seen?* — nhiều URL khác nhau trỏ cùng nội dung → hash content (MD5) so trùng exact; **SimHash** để bắt near-duplicate (trang giống nhau 95%).
- **DNS cache**: DNS resolve có thể tốn 10–100ms mỗi lần; crawler tự chạy DNS resolver/cache riêng — với 400 trang/s thì đây là tối ưu bắt buộc.
- **Trap detection**: calendar vô hạn, URL tự sinh query param, redirect loop → giới hạn **độ sâu URL**, độ dài URL, **max pages per domain**, phát hiện pattern lặp. Kết hợp blacklist thủ công.
- **Storage**: raw HTML nén → **blob storage** (S3/HDFS); metadata (URL, fetch time, status, content hash, vị trí blob) → DB để scheduler quyết định recrawl.
- **Freshness**: recrawl **adaptive theo tần suất thay đổi** — trang báo đổi hàng giờ thì crawl hàng giờ, trang tĩnh thì hàng tháng. Ước lượng từ lịch sử thay đổi content hash giữa các lần crawl.
- **Scale**: partition frontier theo **hash(domain) → worker**, để một domain luôn về cùng worker — politeness state (timer per domain) nằm local, không cần đồng bộ phân tán.

**4. Trade-offs**

- Bloom filter tiết kiệm RAM khổng lồ nhưng có false positive → bỏ sót một tỷ lệ nhỏ URL — chấp nhận được với search, không chấp nhận được nếu cần đầy đủ tuyệt đối.
- Politeness làm chậm throughput trên các site lớn — bù bằng cách crawl rất nhiều domain song song.
- BFS từ seed cho coverage rộng; priority theo PageRank cho chất lượng — thực tế là hàng đợi ưu tiên lai cả hai.

### Thiết kế minh hoạ

```text
 Seed URLs ─┐
            ▼
 ┌────────────────────────────────────┐
 │            URL FRONTIER            │
 │  Front queues: theo PRIORITY       │
 │  Back queues : theo DOMAIN         │ ◄── politeness: 1 domain = 1 queue
 │  (timer per domain: next_fetch_at) │     + min delay giữa 2 request
 └──────────────┬─────────────────────┘
                ▼  partition theo hash(domain)
 ┌──────────────────────────┐    ┌───────────┐  ┌─────────────┐
 │ Fetcher Workers (N node) │───►│ DNS cache │  │ robots.txt  │
 └──────────────┬───────────┘    └───────────┘  │ cache (24h) │
                ▼                               └─────────────┘
      Content dedup (MD5 exact + SimHash near-dup)
                │
       ┌────────┴─────────┐
       ▼                  ▼
 Blob storage        Metadata DB (url, hash, fetched_at, change_rate)
 (raw HTML nén)           │
       │                  └──► Recrawl Scheduler (adaptive freshness)
       ▼
   Parser ──extract links──► normalize ──► Bloom filter (URL seen?) ──► Frontier
```

```python
# Politeness: mỗi domain một queue + timer, không bao giờ nã song song 1 host
import time

class DomainQueue:
    def __init__(self, crawl_delay: float = 1.0):
        self.urls: list[str] = []
        self.crawl_delay = crawl_delay      # từ robots.txt hoặc mặc định 1s
        self.next_fetch_at = 0.0            # timestamp được phép fetch tiếp

    def can_fetch(self) -> bool:
        return time.time() >= self.next_fetch_at and bool(self.urls)

    def pop(self) -> str:
        url = self.urls.pop(0)
        # Đặt lịch cho request kế tiếp — đây chính là "politeness"
        self.next_fetch_at = time.time() + self.crawl_delay
        return url

# Trap detection: chặn URL bệnh hoạn trước khi vào frontier
def is_probable_trap(url: str, depth: int) -> bool:
    return depth > 15 or len(url) > 2000 or url.count("?") > 3
```

### Đáp án mẫu

> "Kiến trúc là một vòng lặp: URL frontier, fetcher, parser, rồi link mới quay lại frontier — nhưng em sẽ dành nhiều thời gian nhất cho frontier vì nó gánh hai việc khó: priority và politeness. Em tổ chức hai tầng queue: front queue theo độ ưu tiên, back queue theo domain — mỗi domain một queue kèm timer giãn cách request, cộng với cache robots.txt per domain, để không bao giờ DDoS site người ta. Dedup em làm hai tầng: URL đã thấy chưa thì dùng Bloom filter vì hàng tỷ URL không nhét hash set vào RAM nổi, chấp nhận false positive nhỏ; content trùng thì hash MD5 cho exact và SimHash cho near-duplicate. Fetcher cần DNS cache riêng vì resolve mỗi lần rất tốn. Trap như calendar vô hạn em chặn bằng giới hạn độ sâu, độ dài URL và max page per domain. Storage thì HTML thô nén vào blob, metadata vào DB cho scheduler recrawl adaptive — trang đổi thường xuyên crawl dày hơn. Scale bằng cách partition frontier theo hash domain, để politeness state nằm local từng worker."

---

## Câu 48: Thiết kế Distributed Message Queue `[Advanced]`

### Câu hỏi

> Thiết kế một distributed message queue như Kafka: các thành phần chính là gì? Giải thích partition, replication, consumer group, vì sao Kafka nhanh, và các delivery semantics (at-most-once / at-least-once / exactly-once) thực chất hoạt động ra sao.

### Giải thích lý thuyết

**1. Requirements**

- *Functional*: producer publish message vào topic; nhiều consumer độc lập đọc; replay được message cũ; giữ message theo retention policy.
- *Non-functional*: throughput hàng triệu msg/s, không mất message khi node chết, ordering trong phạm vi hợp lý, horizontal scale.
- *Capacity estimate*: 1M msg/s × 1KB ≈ 1GB/s ingest; retention 7 ngày ≈ ~600TB → bắt buộc phân tán trên nhiều broker, mỗi broker ghi sequential vào disk.

**2. High-level design**

Cốt lõi là **append-only log**: message chỉ ghi nối đuôi, mỗi message có **offset** tăng dần. **Topic** chia thành nhiều **partition** — mỗi partition là một log độc lập, là đơn vị parallelism và ordering. Partition nhân bản qua nhiều **broker** (leader + followers). **Consumer group** chia partition cho các consumer, tự track **offset**.

**3. Deep dive các quyết định kỹ thuật**

- **Producer — partition theo key**: `hash(key) % num_partitions` → cùng key (vd cùng `user_id`) luôn vào cùng partition → **ordering per key**. Không key thì round-robin. **Ack levels** trade-off durability vs latency: `acks=0` fire-and-forget (nhanh nhất, mất được); `acks=1` leader ghi xong là ack (leader chết trước khi replicate thì mất); `acks=all` chờ toàn bộ **ISR** (in-sync replicas) — bền nhất, chậm nhất.
- **Broker — replication**: mỗi partition một **leader** (nhận mọi read/write) + followers pull về. **ISR** = tập replica đang theo kịp leader; leader chết → controller bầu leader mới **từ ISR** → không mất data đã ack với `acks=all` (kết hợp `min.insync.replicas=2`).
- **Consumer group**: mỗi partition gán cho **đúng 1 consumer** trong group → parallelism tối đa = số partition (thêm consumer thứ N+1 là ngồi không). Consumer tự **commit offset** (vào topic nội bộ `__consumer_offsets`); commit trước hay sau khi xử lý quyết định delivery semantics. Consumer vào/ra → **rebalancing** chia lại partition — rebalance gây pause, nên tránh restart consumer liên tục.
- **Retention**: xoá theo **time** (vd 7 ngày) hoặc **size**, *không phải* theo "đã consume hay chưa" — vì thế nhiều consumer group đọc độc lập và replay được bằng cách reset offset. Khác hẳn queue truyền thống (RabbitMQ xoá sau ack).
- **Tại sao Kafka nhanh**: (1) **sequential I/O** — append log tận dụng disk tuần tự (hàng trăm MB/s, không seek ngẫu nhiên); (2) **zero-copy** — `sendfile()` chuyển data từ page cache thẳng ra socket, không copy qua user space; (3) **batching + compression** — producer gom message thành batch, giảm syscall và network overhead; (4) dựa vào **OS page cache** thay vì tự quản lý cache.
- **Delivery semantics — thực chất**: *at-most-once* = commit offset **trước** khi xử lý (crash giữa chừng → mất message); *at-least-once* = xử lý xong **mới** commit (crash → đọc lại → duplicate); *exactly-once* của Kafka = **idempotent producer** (sequence number per partition, broker bỏ duplicate khi producer retry) + **transactions** (ghi nhiều partition + commit offset atomic) — chỉ trọn vẹn trong pipeline Kafka→Kafka (Kafka Streams). Khi side effect ra hệ ngoài (gọi API, ghi DB ngoài) thì vẫn phải **consumer idempotent** — "exactly-once processing" chứ không phải phép màu "exactly-once delivery".

**4. Trade-offs**

- Nhiều partition = nhiều parallelism nhưng tốn metadata, leader election lâu hơn, và mất ordering toàn cục (chỉ còn per partition).
- `acks=all` an toàn nhưng tăng latency — chọn theo loại data (log metrics dùng `acks=1`, giao dịch tiền dùng `acks=all`).
- Pull model (consumer tự kéo) cho phép consumer kiểm soát tốc độ + batch, đổi lại độ trễ nhỉnh hơn push một chút.

### Thiết kế minh hoạ

```text
            Topic "orders" (3 partitions, replication factor = 3)

 Producer ──hash(key)%3──┐
   acks=0/1/all          │
                         ▼
 ┌─ Broker 1 ──────────┐ ┌─ Broker 2 ──────────┐ ┌─ Broker 3 ──────────┐
 │ P0 LEADER  [0|1|2|→]│ │ P1 LEADER  [0|1|→]  │ │ P2 LEADER  [0|→]    │
 │ P1 follower         │ │ P2 follower         │ │ P0 follower         │
 │ P2 follower         │ │ P0 follower         │ │ P1 follower         │
 └─────────────────────┘ └─────────────────────┘ └─────────────────────┘
        ▲ append-only log, offset tăng dần; follower pull từ leader (ISR)
        │
 ┌──────┴──────────── Consumer Group "billing" ────────────────┐
 │  Consumer A ◄─ P0        Consumer B ◄─ P1, P2                │
 │  (1 partition chỉ thuộc 1 consumer; commit offset định kỳ)  │
 └──────────────────────────────────────────────────────────────┘
 Group "analytics" đọc CÙNG data, offset riêng → replay độc lập
```

```python
# Delivery semantics nằm ở VỊ TRÍ commit offset, comment tiếng Việt

# At-most-once: commit TRƯỚC khi xử lý → crash là mất message
for msg in consumer:
    consumer.commit(msg.offset + 1)   # commit trước
    process(msg)                      # crash ở đây → message mất luôn

# At-least-once (phổ biến nhất): xử lý xong MỚI commit → có thể duplicate
for msg in consumer:
    process(msg)                      # crash sau đây, trước commit
    consumer.commit(msg.offset + 1)   # → đọc lại msg → consumer PHẢI idempotent

# "Exactly-once" Kafka = idempotent producer + transaction:
#   producer config: enable.idempotence=true, transactional.id="svc-1"
#   → ghi output + commit offset trong CÙNG transaction (atomic)
#   → chỉ trọn vẹn Kafka→Kafka; side effect ra ngoài vẫn cần idempotency
```

### Đáp án mẫu

> "Cốt lõi của Kafka là append-only log: message ghi nối đuôi với offset tăng dần, topic chia thành nhiều partition để parallel — partition là đơn vị của cả ordering lẫn parallelism. Producer route theo hash của key nên cùng user luôn vào cùng partition, giữ ordering per key; còn ack levels là trade-off em phải chọn: acks=0 nhanh nhưng mất được, acks=1 ack khi leader ghi xong, acks=all chờ đủ ISR — bền nhất. Mỗi partition có leader và follower replicate; leader chết thì bầu leader mới từ ISR nên data đã ack không mất. Consumer group thì mỗi partition gán đúng một consumer, tự commit offset, thêm bớt consumer gây rebalancing. Retention theo time hoặc size chứ không xoá theo ack — nhờ vậy nhiều group đọc độc lập và replay được. Kafka nhanh nhờ sequential I/O, zero-copy sendfile và batching. Còn exactly-once thực chất là idempotent producer cộng transaction, trọn vẹn trong pipeline Kafka-to-Kafka thôi — side effect ra hệ ngoài thì consumer vẫn phải idempotent."

---

## Bẫy thường gặp khi trả lời

| Bẫy | Vì sao mất điểm | Cách né |
| --- | --- | --- |
| Nhảy thẳng vào vẽ kiến trúc, bỏ qua requirements | Interviewer cố tình để đề mơ hồ — không hỏi lại scope/scale là dấu hiệu junior | Luôn mở đầu bằng functional + non-functional + capacity estimate 1–2 phút |
| Hứa "exactly-once delivery" hoặc "không bao giờ mất message" tuyệt đối | Qua mạng không có exactly-once delivery thuần — chỉ có at-least-once + idempotency | Nói rõ semantics chọn gì và consumer phải idempotent (Câu 34, 48) |
| Quên rằng webhook/crawler đụng tới hệ thống **của người khác** | Thiếu timeout, circuit breaker, politeness, robots.txt = thiết kế "vô trách nhiệm" | Mặc định bên ngoài không tin cậy được: timeout ngắn, backoff, rate limit per host |
| Chọn 301 cho URL shortener mà không nhắc trade-off analytics | 301 bị browser cache → mất toàn bộ click data | So sánh 301 vs 302 và gắn với mục tiêu kinh doanh (Câu 43) |
| Dùng một queue chung cho mọi loại notification | Campaign marketing burst sẽ chặn OTP — lỗi production kinh điển | Tách queue + worker theo channel và theo priority (Câu 45) |
| Thiết kế chat bằng HTTP polling hoặc quên connection registry | Stateful WebSocket cần biết user đang nối gateway nào mới push được | Registry user→gateway trong Redis + heartbeat/TTL cho presence (Câu 44) |
| Khẳng định ordering toàn cục trong hệ phân tán | Ordering toàn cục giết parallelism — gần như không hệ nào hứa | Chỉ hứa ordering per partition / per conversation / per key |
| Nói số liệu capacity xong không dùng lại | Estimate chỉ có giá trị khi dẫn tới quyết định thiết kế | Gắn số vào quyết định: "read 100:1 nên em đầu tư cache cho redirect path" |
| Liệt kê công nghệ (Kafka, Redis, Cassandra) mà không giải thích vì sao | Name-dropping không thay được lập luận | Mỗi lựa chọn kèm 1 câu lý do + 1 câu trade-off |
