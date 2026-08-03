---
sidebar_position: 9
title: "9. Caching, Performance & Observability"
---

# Caching, Performance & Observability

> *Caching và observability là hai mặt của cùng một bài toán: làm hệ thống nhanh hơn, và biết chính xác nó đang nhanh hay chậm ở đâu. Interviewer hỏi nhóm câu này để phân biệt người "biết dùng Redis" với người hiểu trade-off đằng sau từng pattern — invalidation, consistency, và chi phí vận hành.*

:::note[Ghi nhớ nhanh]

- ⭐ **Cache-aside (lazy loading)** — pattern phổ biến nhất: application tự quản lý cache, ghi thẳng DB rồi `invalidate` key.
- **Write-through vs Write-back** — trade-off giữa tốc độ ghi và độ an toàn: `write-back` nhanh nhất nhưng **mất data nếu cache crash trước khi flush**.
- **Cache stampede** — nhiều key hết TTL cùng lúc dồn tải DB; chống bằng lock/single-flight, jitter TTL, hoặc pre-warm.
- ⭐ **Observability = 3 trụ** — `metrics`, `logs`, `traces`: mục tiêu là biết chính xác hệ thống chậm *ở đâu*, không chỉ biết nó chậm.

:::

---

## Câu 12: Cache-aside, Write-through, và Write-back caching khác nhau như thế nào? `[Intermediate]`

### Câu hỏi

> Phân biệt ba caching pattern: Cache-aside, Write-through, và Write-back. Trade-off của từng loại là gì, và làm sao xử lý cache stampede?

### Giải thích lý thuyết

Khác biệt cốt lõi nằm ở **ai chịu trách nhiệm đồng bộ cache với database**, và **ghi dữ liệu đi qua đâu trước**.

**Cache-aside (Lazy loading)** — pattern phổ biến nhất:
- **Application tự quản lý cache**. Đọc: check cache → miss thì đọc DB → set cache (kèm TTL) → trả về. Ghi: ghi thẳng DB rồi **invalidate** (xoá) cache key.
- Chỉ cache những gì thực sự được đọc → tiết kiệm memory. Cache chết thì app vẫn chạy (chậm hơn).
- Nhược: lần đọc đầu luôn miss (cold start), và có **cửa sổ stale data** giữa lúc DB update và cache bị xoá/hết TTL.

**Write-through**:
- Mỗi lần ghi: ghi **cache và DB đồng bộ trong cùng một thao tác** (qua cache layer). Cache luôn fresh — đọc sau ghi không bao giờ stale.
- Nhược: ghi chậm hơn (2 lần ghi), và cache chứa cả data không bao giờ được đọc → lãng phí. Thường kết hợp với **read-through** (cache layer tự đọc DB khi miss — app chỉ nói chuyện với cache, ví dụ DAX của DynamoDB).

**Write-back (Write-behind)**:
- Ghi **vào cache trước, trả về ngay**; cache flush xuống DB **bất đồng bộ** theo batch.
- Cực nhanh cho write-heavy workload, gộp được nhiều write thành một (giảm tải DB). Nhược chí mạng: **cache crash trước khi flush → mất data**. Chỉ dùng khi chấp nhận mất mát (view counter, like count, metrics) hoặc cache có persistence/replication.

| Tiêu chí | Cache-aside | Write-through | Write-back |
| --- | --- | --- | --- |
| Ai quản lý | Application | Cache layer | Cache layer |
| Tốc độ ghi | Nhanh (chỉ DB) | Chậm (cache + DB sync) | Nhanh nhất (chỉ cache) |
| Consistency đọc-sau-ghi | Có thể stale | Luôn fresh | Fresh ở cache, DB trễ |
| Risk mất data | Không | Không | **Có** (crash trước flush) |
| Use case | General read-heavy | Đọc ngay sau ghi | Write-heavy, chấp nhận mất |

**Cache invalidation & stale data**: TTL là lưới an toàn cuối — kể cả invalidation có bug, data chỉ stale tối đa bằng TTL. Quy tắc khi update: **xoá cache, đừng set cache** (delete-on-write) — set cache trong write path dễ race condition ghi đè data cũ.

**Cache stampede (thundering herd)**: một hot key hết hạn → hàng nghìn request cùng miss → cùng đập vào DB → DB sập. Ba cách chống:
1. **Lock/single-flight**: chỉ 1 request được quyền rebuild cache (acquire lock theo key), số còn lại chờ hoặc nhận giá trị cũ.
2. **Stale-while-revalidate**: trả data cũ ngay lập tức, refresh ở background — user không bao giờ chờ.
3. **TTL jitter**: cộng random vào TTL để các key không hết hạn đồng loạt.

**Insight phỏng vấn**: ăn điểm nhất là nói được "cache-aside xoá cache chứ không set khi write" và chủ động nhắc cache stampede — đó là dấu hiệu đã vận hành cache thật trong production.

### Thiết kế minh hoạ

```text
CACHE-ASIDE                          WRITE-BACK
App ──1. GET──> Cache (miss)         App ──1. WRITE──> Cache ──ACK ngay──> App
App ──2. SELECT──> DB                              │
App ──3. SET (TTL)──> Cache                        └─ async batch flush ──> DB
                                                      (crash ở đây = MẤT DATA)
```

```typescript
// Cache-aside + chống stampede bằng single-flight lock
async function getProduct(id: string): Promise<Product> {
  const cached = await redis.get(`product:${id}`);
  if (cached) return JSON.parse(cached); // cache hit

  // Chỉ 1 request được rebuild — NX = set nếu chưa tồn tại
  const gotLock = await redis.set(`lock:product:${id}`, "1", "EX", 5, "NX");
  if (!gotLock) {
    await sleep(100); // request khác đang rebuild → chờ rồi đọc lại
    return getProduct(id);
  }

  const product = await db.products.findById(id);
  // TTL có jitter để các key không hết hạn đồng loạt
  const ttl = 300 + Math.floor(Math.random() * 60);
  await redis.set(`product:${id}`, JSON.stringify(product), "EX", ttl);
  await redis.del(`lock:product:${id}`);
  return product;
}

// Write path: XOÁ cache, không set — tránh race ghi đè data cũ
async function updateProduct(id: string, data: ProductInput): Promise<void> {
  await db.products.update(id, data);
  await redis.del(`product:${id}`); // lần đọc tiếp theo tự rebuild
}
```

### Đáp án mẫu

> "Cache-aside là pattern em dùng nhiều nhất: app tự quản lý — đọc thì check cache, miss thì query DB rồi set cache kèm TTL; ghi thì update DB rồi **xoá** cache key chứ không set, để tránh race condition. Ưu điểm là chỉ cache cái được đọc, cache chết app vẫn sống. Write-through thì ghi cache và DB đồng bộ — đọc sau ghi luôn fresh nhưng write chậm hơn, thường đi kèm read-through. Write-back ghi vào cache trước rồi flush DB async — nhanh nhất cho write-heavy, nhưng cache crash trước khi flush là mất data, nên em chỉ dùng cho thứ chấp nhận mất như view counter. Một vấn đề em luôn chủ động nhắc là cache stampede: hot key hết hạn, nghìn request cùng đập DB — em chống bằng lock single-flight cho một request rebuild, stale-while-revalidate trả data cũ trong lúc refresh background, và cộng jitter vào TTL."

---

## Câu 14: Connection Pooling là gì và tại sao quan trọng cho database performance? `[Intermediate]`

### Câu hỏi

> Connection pooling là gì? Tại sao không mở connection mới cho mỗi query, pool size bao nhiêu là hợp lý, và serverless gây vấn đề gì với pooling?

### Giải thích lý thuyết

**Vấn đề gốc**: mở một database connection **đắt hơn nhiều** so với chạy query. Mỗi connection mới phải trải qua: TCP 3-way handshake → TLS handshake → authentication (với Postgres còn **fork một process riêng** cho mỗi connection, tốn ~vài MB RAM). Tổng cộng dễ mất 20-50ms — trong khi bản thân query có khi chỉ 1-2ms. Mở connection mới cho mỗi request nghĩa là **overhead lớn hơn công việc thật**.

**Connection pool** giải quyết bằng cách **mở sẵn N connection và tái sử dụng**: app mượn connection từ pool → chạy query → trả lại pool (không đóng). Lợi ích:
- Loại bỏ chi phí handshake khỏi request path → latency giảm rõ rệt.
- **Bảo vệ database**: pool là chốt chặn — DB chỉ thấy tối đa N connection dù app nhận 10.000 request đồng thời. Request thừa xếp hàng chờ ở app thay vì đè chết DB.

**Pool size tuning** — sai lầm phổ biến nhất là "to hơn = nhanh hơn". Thực tế ngược lại: DB chỉ có chừng đó CPU core và disk, quá nhiều connection active gây **context switching và lock contention**, throughput giảm. Công thức kinh điển của HikariCP:

```text
connections = (core_count × 2) + effective_spindle_count
```

Server DB 8 core + SSD → pool ~16-20 là đủ cho phần lớn workload. Benchmark nổi tiếng của HikariCP: giảm pool từ 2048 xuống 96 connection khiến response time **giảm từ ~100ms xuống ~2ms**.

**External pooler — PgBouncer**: khi có nhiều app instance, mỗi instance một pool thì tổng connection vẫn nổ. PgBouncer đứng giữa app và Postgres, multiplexing hàng nghìn client connection vào vài chục server connection. Mode quan trọng nhất là **transaction mode**: connection chỉ được gán cho client **trong thời gian một transaction**, xong là trả lại ngay → hiệu quả nhất, nhưng **không dùng được session-level feature** (prepared statement kiểu cũ, `SET`, advisory lock theo session).

**Vấn đề serverless**: mỗi Lambda/serverless function instance là một process riêng → **mỗi instance một pool riêng**. Traffic spike → hàng nghìn instance → hàng nghìn connection → Postgres (max_connections mặc định 100) sập ngay. Giải pháp: pool size = 1 mỗi instance + external pooler (PgBouncer, RDS Proxy), hoặc serverless driver qua HTTP (Neon, Supabase Supavisor, PlanetScale).

**Insight phỏng vấn**: nói được công thức pool size và nghịch lý "pool nhỏ hơn lại nhanh hơn" là điểm cộng lớn; nhắc thêm serverless + RDS Proxy chứng tỏ bạn đã đụng vấn đề này ngoài đời.

### Thiết kế minh hoạ

```text
KHÔNG POOL (mỗi query 1 connection):
Request ──[TCP + TLS + Auth ~30ms]──> Postgres ──[query 2ms]──> đóng
          ^^^^^^^^^^ overhead 15x công việc thật ^^^^^^^^^^

CÓ POOL + PGBOUNCER:
App x 50 instance ──(5000 client conn)──> PgBouncer ──(40 server conn)──> Postgres
                                          transaction mode:
                                          conn chỉ gán trong 1 transaction
```

```typescript
// node-postgres: tạo pool MỘT LẦN ở module scope, tái sử dụng toàn app
import { Pool } from "pg";

const pool = new Pool({
  max: 20,                      // (8 core × 2) + spindle ≈ 20
  idleTimeoutMillis: 30_000,    // đóng connection idle quá lâu
  connectionTimeoutMillis: 2_000, // chờ mượn connection tối đa 2s → fail fast
});

// ĐÚNG: mượn - dùng - trả trong finally
async function getUser(id: string): Promise<User | null> {
  const client = await pool.connect(); // mượn từ pool (không handshake mới)
  try {
    const result = await client.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0] ?? null;
  } finally {
    client.release(); // BẮT BUỘC trả lại — quên là pool cạn dần (leak)
  }
}

// SAI (serverless anti-pattern): tạo pool trong handler
// → mỗi invocation một pool mới, spike = nghìn connection, DB sập
// export const handler = async () => { const pool = new Pool(); ... }
```

### Đáp án mẫu

> "Mở một DB connection rất đắt — TCP handshake, TLS, authentication, riêng Postgres còn fork process cho mỗi connection — dễ mất 30ms trong khi query chỉ 1-2ms. Connection pool mở sẵn N connection và tái sử dụng: app mượn, chạy query, trả lại. Nó vừa loại handshake khỏi request path, vừa là chốt chặn bảo vệ DB khỏi quá tải. Về sizing, em theo công thức của HikariCP: connections bằng core × 2 cộng spindle count — pool to quá phản tác dụng vì gây contention, benchmark của họ cho thấy giảm từ 2048 xuống 96 connection lại nhanh hơn 50 lần. Khi nhiều app instance, em đặt PgBouncer transaction mode ở giữa để multiplex nghìn client connection vào vài chục server connection, đổi lại không dùng được session-level feature. Với serverless thì đây là pain point thật: mỗi function instance một pool, spike là nổ max_connections — em set pool size 1 mỗi instance và bắt buộc đi qua RDS Proxy hoặc PgBouncer."

---

## Câu 31: Idempotency key là gì? Thiết kế API thanh toán/POST an toàn khi client retry? `[Advanced]`

### Câu hỏi

> Idempotency key là gì? Hãy thiết kế một API thanh toán (POST) an toàn khi client retry — xử lý cả trường hợp hai request trùng key đến đồng thời.

### Giải thích lý thuyết

**Vấn đề gốc — timeout không có nghĩa là fail**: client gọi `POST /payments`, network timeout. Lúc này có 3 khả năng: request chưa tới server, server xử lý xong nhưng response bị mất, hoặc server đang xử lý dở. Client **không thể phân biệt** → nếu retry mù quáng, server có thể xử lý lần hai → **double-charge**. Mà không retry thì user nghĩ thanh toán fail. Đây là bài toán kinh điển của distributed system: *at-least-once delivery* + side effect không idempotent = thảm hoạ.

**Idempotency key** biến POST thành idempotent một cách nhân tạo:

1. **Client sinh key duy nhất** (UUID v4) cho **mỗi operation logic** (một lần bấm "Thanh toán" = một key; retry dùng **lại key cũ**; user bấm thanh toán lần nữa có chủ đích = key mới). Gửi qua header `Idempotency-Key`.
2. **Server, trước khi xử lý**: check key trong store (Redis/DB). Nếu key đã có kèm response → **trả lại response đã lưu**, không xử lý lại.
3. Nếu key chưa có: xử lý request, **lưu key + status code + response body** vào store với TTL (Stripe giữ 24h), rồi trả response.

**Xử lý concurrent — phần phân loại Senior**: hai request trùng key đến **cùng lúc** (client retry quá sớm, hoặc double-click). Nếu chỉ "check rồi insert" sẽ dính race condition — cả hai cùng thấy key chưa tồn tại, cùng xử lý. Giải pháp:
- **Atomic insert key với status `pending` trước khi xử lý** (Redis `SET NX` hoặc DB unique constraint) — thao tác này đóng vai trò lock theo key.
- Request thứ hai insert fail → thấy status `pending` → trả `409 Conflict` (Stripe behavior) hoặc chờ/poll đến khi có kết quả.
- Xử lý xong → update record thành `completed` kèm response. Nếu xử lý fail giữa chừng → xoá key hoặc đánh dấu `failed` để retry sau được phép chạy lại.

**Chuẩn tham chiếu — Stripe `Idempotency-Key`**: lưu key 24h; trùng key + trùng params → replay response cũ (kể cả response lỗi 4xx cũng được replay); **trùng key nhưng khác params → 422** (chống dùng nhầm key); key đang in-flight → 409. Đây là spec đáng học thuộc — IETF cũng đang chuẩn hoá thành draft `Idempotency-Key` header.

**Phân biệt với idempotency tự nhiên của HTTP**: `GET`, `PUT`, `DELETE` vốn idempotent theo spec — `PUT /users/1` với cùng body gọi N lần kết quả như 1 lần. `POST` (create, charge) thì không — idempotency key là cơ chế **bù đắp** cho POST. Lưu ý "idempotent" nghĩa là *trạng thái cuối như nhau*, không phải *response như nhau* (DELETE lần 2 có thể trả 404).

### Thiết kế minh hoạ

```text
Client                         Server                        Store (Redis/DB)
  │── POST /payments ────────────>│
  │   Idempotency-Key: abc-123    │── SET key=abc-123 NX ──────> OK (lock được)
  │                               │   status=pending
  │         (timeout!)            │── charge thẻ, ghi DB
  │                               │── UPDATE abc-123 ──────────> completed + response
  │── RETRY cùng key abc-123 ────>│
  │                               │── GET abc-123 ─────────────> completed
  │<── replay response đã lưu ────│   (KHÔNG charge lần 2)

  Concurrent: request B trùng key đến khi A đang pending
  → SET NX fail → thấy pending → trả 409, client retry sau
```

```typescript
// Middleware idempotency cho POST /payments
async function handlePayment(req: Request): Promise<Response> {
  const key = req.headers.get("Idempotency-Key");
  if (!key) return json({ error: "Thiếu Idempotency-Key" }, 400);

  // Atomic lock theo key: NX = chỉ set nếu chưa tồn tại → chống race
  const acquired = await redis.set(
    `idem:${key}`,
    JSON.stringify({ status: "pending", paramsHash: hash(req.body) }),
    "EX", 86_400, "NX" // TTL 24h theo chuẩn Stripe
  );

  if (!acquired) {
    const record = JSON.parse((await redis.get(`idem:${key}`))!);
    // Trùng key nhưng khác params → client dùng nhầm key
    if (record.paramsHash !== hash(req.body))
      return json({ error: "Key đã dùng cho params khác" }, 422);
    // Đang xử lý dở → bảo client thử lại sau
    if (record.status === "pending")
      return json({ error: "Request đang xử lý" }, 409);
    // Đã xong → replay response cũ, KHÔNG charge lại
    return json(record.response, record.statusCode);
  }

  try {
    const payment = await chargeCard(req.body); // side effect duy nhất 1 lần
    const record = { status: "completed", statusCode: 201,
                     response: payment, paramsHash: hash(req.body) };
    await redis.set(`idem:${key}`, JSON.stringify(record), "EX", 86_400);
    return json(payment, 201);
  } catch (error) {
    await redis.del(`idem:${key}`); // mở khoá để retry chạy lại được
    throw error;
  }
}
```

### Đáp án mẫu

> "Vấn đề gốc là timeout không đồng nghĩa với fail — client không biết server đã charge hay chưa, retry mù là double-charge. Idempotency key giải quyết bằng cách client sinh UUID cho mỗi operation logic, gửi qua header `Idempotency-Key`; retry dùng lại đúng key đó. Server trước khi xử lý sẽ check key trong store: đã có thì replay response cũ, chưa có thì xử lý rồi lưu key cùng response với TTL — Stripe giữ 24 giờ. Phần khó nhất là concurrent: hai request trùng key đến cùng lúc, nếu chỉ check-rồi-insert sẽ race. Em insert key với status pending một cách atomic — Redis SET NX hoặc unique constraint — như một lock theo key; request thứ hai thấy pending thì trả 409. Em cũng theo Stripe: trùng key khác params trả 422. Cuối cùng em phân biệt rõ: GET, PUT, DELETE vốn idempotent theo HTTP spec, idempotency key là cơ chế bù đắp riêng cho POST có side effect."

---

## Câu 32: Ba trụ cột Observability (Logs, Metrics, Traces) khác nhau thế nào, khi nào dùng cái nào? `[Intermediate]`

### Câu hỏi

> Ba trụ cột của Observability — Logs, Metrics, Traces — khác nhau như thế nào về bản chất và chi phí? Mô tả flow debug thực tế dùng cả ba.

### Giải thích lý thuyết

Ba trụ cột trả lời ba câu hỏi khác nhau, và **không thay thế được nhau**:

**Logs** — *chuyện gì đã xảy ra, chi tiết thế nào?*
- Bản ghi **sự kiện rời rạc** kèm context đầy đủ: timestamp, level, message, metadata (user_id, order_id, stack trace). Nên là **structured log** (JSON) để query được, thay vì chuỗi text tự do.
- Mạnh nhất khi **debug root cause**: chỉ logs mới cho biết "order 123 fail vì thẻ hết hạn, payload là X".
- Chi phí **cao nhất**: volume khổng lồ, đắt khi lưu trữ và search. Phải có retention policy và sampling.

**Metrics** — *hệ thống đang khoẻ không, xu hướng ra sao?*
- **Số liệu aggregate theo thời gian**: counter (request_total), gauge (memory_used), histogram (latency p50/p95/p99). Đã mất chi tiết từng sự kiện — chỉ còn con số tổng hợp.
- Mạnh nhất cho **alerting và dashboard**: "p99 latency > 500ms trong 5 phút → page on-call". Cực **rẻ** để lưu và query (chỉ là số theo time series).
- Điểm yếu chí mạng: **cardinality**. Mỗi tổ hợp label là một time series riêng — đưa `user_id` vào label là nổ Prometheus. Metrics trả lời "có vấn đề", không trả lời "tại sao".

**Traces** — *request này đi qua đâu, chậm ở chặng nào?*
- Theo dấu **một request xuyên qua nhiều service**: mỗi trace gồm nhiều **span** (một đơn vị công việc — gọi API, query DB), có parent-child tạo thành cây kèm timing. Trong kiến trúc microservices, đây là cách duy nhất thấy được "request mất 2s thì 1.7s nằm ở service C chờ DB".
- Chi phí trung bình, thường phải **sampling** (giữ 1-10% trace, ưu tiên trace lỗi/chậm — tail-based sampling).

| Tiêu chí | Logs | Metrics | Traces |
| --- | --- | --- | --- |
| Bản chất | Sự kiện rời rạc, full context | Số aggregate theo thời gian | Cây span của 1 request qua nhiều service |
| Trả lời | Tại sao fail (root cause) | Có vấn đề không (health/trend) | Chậm/lỗi ở service nào |
| Chi phí | Cao nhất (volume lớn) | Rẻ nhất | Trung bình (cần sampling) |
| Cardinality | Tự do | **Giới hạn nghiêm ngặt** | Tự do trong span attributes |
| Tool | ELK, Loki | Prometheus + Grafana | Jaeger, Tempo, OpenTelemetry |

**Chất keo gắn ba trụ cột — Correlation ID / Trace ID**: mỗi request được gán một ID duy nhất ở điểm vào (API gateway), **propagate qua mọi service** (header `traceparent` theo chuẩn W3C Trace Context) và **ghi vào mọi dòng log**. Nhờ đó từ một trace nhảy thẳng sang đúng các dòng log liên quan. Thiếu correlation ID, ba trụ cột là ba ốc đảo rời rạc — đây là lỗi kiến trúc phổ biến nhất.

**Flow debug thực tế** (điểm ăn tiền của câu này):
1. **Metrics báo động**: alert "checkout p99 > 2s" từ Prometheus → biết *có* vấn đề.
2. **Traces khoanh vùng**: mở Jaeger, lọc trace chậm của endpoint checkout → thấy span `payment-service → DB query` chiếm 1.8s → biết vấn đề *ở đâu*.
3. **Logs tìm root cause**: lấy trace_id, query log của payment-service → thấy "connection pool exhausted, waited 1750ms" → biết *tại sao*. Fix: tăng pool size / tìm connection leak.

**Insight phỏng vấn**: candidate trung bình liệt kê được ba định nghĩa; candidate tốt nói được flow metrics → traces → logs và nhắc correlation ID + vấn đề cardinality của metrics. OpenTelemetry là tên đáng nhắc — chuẩn thống nhất instrumentation cho cả ba tín hiệu.

### Thiết kế minh hoạ

```text
ALERT (Metrics)            TRACE (khoanh vùng)              LOGS (root cause)
Prometheus:                Jaeger — trace_id=a1b2:           Loki/ELK query:
checkout_p99 > 2s   ───>   gateway        [■ 50ms]    ───>   {trace_id="a1b2"}
trong 5 phút               order-svc      [■■ 150ms]         → "payment-svc: pool
→ page on-call             payment-svc    [■■■■■■ 1800ms!]      exhausted, waited
                             └─ db.query  [■■■■■ 1750ms]        1750ms for conn"
```

```typescript
// Structured log + correlation: trace_id có mặt trong MỌI dòng log
import { trace } from "@opentelemetry/api";

function log(level: string, message: string, meta: Record<string, unknown>) {
  const span = trace.getActiveSpan();
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    trace_id: span?.spanContext().traceId, // chất keo nối logs ↔ traces
    ...meta,
  }));
}

// Metrics: chú ý CARDINALITY — label hữu hạn, KHÔNG đưa user_id/order_id vào
httpDuration.observe(
  { method: "POST", route: "/checkout", status: "200" }, // ✅ vài chục tổ hợp
  // { user_id: "u_99231" }  ❌ hàng triệu time series → nổ Prometheus
  durationSeconds
);

// Traces: span bọc đoạn công việc, attribute tự do (đây mới là chỗ chứa order_id)
const span = tracer.startSpan("charge-card", {
  attributes: { "order.id": orderId, "payment.provider": "stripe" },
});
```

### Đáp án mẫu

> "Logs là sự kiện rời rạc với context đầy đủ — mạnh nhất để tìm root cause nhưng đắt nhất vì volume lớn. Metrics là số liệu aggregate theo thời gian — counter, gauge, histogram — rẻ, lý tưởng cho alert và dashboard, nhưng phải kiểm soát cardinality nghiêm ngặt: đưa user_id vào label là nổ Prometheus. Traces theo dấu một request qua nhiều service dưới dạng cây span kèm timing — cách duy nhất tìm bottleneck trong microservices, thường phải sampling. Flow debug thực tế của em đi đúng thứ tự đó: alert từ Prometheus báo p99 checkout vượt ngưỡng, em mở Jaeger lọc trace chậm thấy span payment-service chiếm 1.8 giây ở DB query, rồi lấy trace_id query logs thấy connection pool exhausted — metrics nói *có* vấn đề, traces nói *ở đâu*, logs nói *tại sao*. Điều kiện tiên quyết là correlation ID propagate qua mọi service và in vào mọi dòng log — em dùng OpenTelemetry với W3C Trace Context để chuẩn hoá cả ba tín hiệu."

---

## Câu 33: Bloom Filter là gì? Đánh đổi điều gì và dùng để tối ưu ở đâu? `[Advanced]`

### Câu hỏi

> Bloom Filter là gì, hoạt động thế nào? Nó đánh đổi điều gì để đạt memory cực nhỏ, và được dùng tối ưu ở những đâu trong hệ thống thực tế?

### Giải thích lý thuyết

Bloom Filter là **cấu trúc dữ liệu xác suất** trả lời câu hỏi "phần tử X có trong tập hợp không?" với hai kết quả bất đối xứng:

- **"Chắc chắn KHÔNG có"** — đáng tin 100%, **không bao giờ false negative**.
- **"CÓ THỂ có"** — có xác suất sai (**false positive**): filter nói có nhưng thực tế không có.

**Cơ chế**: một **bit array m bit** (khởi tạo toàn 0) + **k hash function** độc lập.
- **Thêm phần tử**: hash phần tử qua k hàm → ra k vị trí → set k bit đó thành 1.
- **Kiểm tra phần tử**: hash qua k hàm → nếu **bất kỳ bit nào = 0** → chắc chắn chưa từng được thêm (vì nếu thêm rồi thì bit đó phải là 1). Nếu **tất cả k bit = 1** → *có thể* có — nhưng cũng có thể các bit đó được set bởi những phần tử khác (hash collision) → false positive.

**Trade-off cốt lõi — memory cực nhỏ đổi lấy độ chính xác**: lưu 1 triệu phần tử với false positive rate 1% chỉ tốn **~1.2 MB** (khoảng 9.6 bit/phần tử, **bất kể phần tử to cỡ nào** — URL dài hay record lớn đều thế). So với hash set lưu chính phần tử thì nhỏ hơn hàng chục đến hàng trăm lần. Cái giá: (1) tỷ lệ false positive (tuning bằng m và k: `m = -n·ln(p)/(ln2)²`, `k = (m/n)·ln2`), (2) **không lấy lại được phần tử** — chỉ test membership, (3) filter càng đầy thì false positive càng tăng.

**Không xoá được**: clear một bit có thể phá hỏng phần tử khác đang dùng chung bit đó → tạo **false negative**, phá vỡ guarantee cốt lõi. Cần xoá thì dùng **Counting Bloom Filter** (mỗi ô là counter thay vì bit — thêm thì tăng, xoá thì giảm, đổi lại tốn 4-8 lần memory) hoặc **Cuckoo Filter**.

**Use case thực tế** — pattern chung: *đặt một "người gác cổng" rẻ tiền trước một thao tác đắt tiền (disk I/O, network, DB query) để loại sớm các tra cứu chắc chắn miss*:

1. **LSM-tree storage (Cassandra, RocksDB, HBase)**: đọc một key có thể phải kiểm tra nhiều SSTable trên disk. Mỗi SSTable có Bloom filter trong memory — filter nói "không có" thì **skip hẳn disk read** cho file đó. Vì đa số SSTable không chứa key cần tìm, đây là tối ưu sống còn cho read path.
2. **Chống cache penetration**: attacker query hàng loạt key **không tồn tại** → cache miss toàn bộ → đập thẳng DB. Đặt Bloom filter chứa toàn bộ key hợp lệ trước cache: key không qua được filter → trả 404 ngay, không chạm cache lẫn DB.
3. **Check username/email tồn tại**: form đăng ký check trùng username — filter trả "chắc chắn chưa có" thì khỏi query DB; "có thể có" mới query xác nhận (false positive chỉ tốn thêm một query thừa, vô hại).
4. **Chrome Safe Browsing (lịch sử)**: filter chứa URL độc hại nằm local trong browser — URL không match thì bỏ qua; match thì mới gọi server Google xác nhận (false positive chỉ tốn một network call).

**Insight phỏng vấn**: hai câu ăn điểm là "không false negative, chỉ false positive — và hệ quả là dùng được làm người gác cổng" + "không xoá được, cần xoá thì Counting Bloom Filter". Nêu được use case Cassandra/RocksDB là dấu hiệu hiểu storage engine thật.

### Thiết kế minh hoạ

```text
Bit array (m=16), k=3 hash functions:
add("alice"):  h1→2, h2→7, h3→11      → set bit 2, 7, 11
index:  0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
bits:  [0][0][1][0][0][0][0][1][0][0][0][1][0][0][0][0]

check("bob"):   h1→2, h2→5, h3→11 → bit 5 = 0 → CHẮC CHẮN KHÔNG CÓ
check("carol"): h1→2, h2→7, h3→11 → cả 3 = 1 → "CÓ THỂ có"
                (thực ra chưa từng add — FALSE POSITIVE do trùng bit của alice)

Pattern "người gác cổng" chống cache penetration:
Request ──> Bloom filter ──"không có"──> 404 ngay (0 I/O)
                │
            "có thể có"
                ▼
             Cache ──miss──> DB (chỉ những key qua được filter)
```

```typescript
// Bloom filter tối giản — minh hoạ cơ chế
class BloomFilter {
  private readonly bits: Uint8Array;

  constructor(private readonly m: number, private readonly k: number) {
    this.bits = new Uint8Array(Math.ceil(m / 8));
  }

  private positions(item: string): number[] {
    // Double hashing: mô phỏng k hàm hash từ 2 hàm cơ sở
    const h1 = fnv1a(item), h2 = murmur(item);
    return Array.from({ length: this.k }, (_, i) => (h1 + i * h2) % this.m);
  }

  add(item: string): void {
    for (const p of this.positions(item)) this.bits[p >> 3] |= 1 << (p & 7);
  }

  mightContain(item: string): boolean {
    // Một bit = 0 → chắc chắn không có; tất cả = 1 → "có thể có"
    return this.positions(item).every((p) => (this.bits[p >> 3] >> (p & 7)) & 1);
  }
  // Lưu ý: KHÔNG có delete() — clear bit sẽ gây false negative
}

// Chống cache penetration: filter làm gác cổng trước cache + DB
const validIds = new BloomFilter(9_600_000, 7); // 1M key, ~1% FP, ~1.2MB
async function getOrder(id: string): Promise<Order | null> {
  if (!validIds.mightContain(id)) return null; // loại ngay, 0 lần chạm cache/DB
  return getFromCacheOrDb(id); // false positive ~1% → chỉ tốn 1 query thừa
}
```

### Đáp án mẫu

> "Bloom filter là cấu trúc xác suất trả lời membership với hai kết quả bất đối xứng: 'chắc chắn không có' — đáng tin tuyệt đối, không bao giờ false negative — và 'có thể có' với một tỷ lệ false positive. Cơ chế là bit array cộng k hash function: thêm thì set k bit, kiểm tra thì chỉ cần một bit bằng 0 là kết luận không có. Trade-off là memory cực nhỏ — 1 triệu phần tử với 1% false positive chỉ tốn cỡ 1.2MB, bất kể phần tử to nhỏ — đổi lấy việc không lấy lại được phần tử và không xoá được, vì clear bit sẽ phá phần tử khác dùng chung bit; cần xoá thì dùng Counting Bloom Filter. Pattern dùng của nó là người gác cổng rẻ trước thao tác đắt: Cassandra và RocksDB đặt filter trước mỗi SSTable để skip disk read khi key chắc chắn không có; em từng dùng nó chống cache penetration — attacker query key không tồn tại sẽ bị chặn trước cả cache lẫn DB; ngoài ra còn check username tồn tại, hay Chrome Safe Browsing check URL độc hại local trước khi gọi server."

---

## Bẫy thường gặp khi trả lời

| Sai lầm | Đúng là |
| --- | --- |
| "Cache-aside khi write thì update luôn cache cho fresh" | Nên **xoá** cache key (delete-on-write) — set trong write path dễ race condition ghi đè data cũ |
| "Write-back an toàn vì cuối cùng cũng flush xuống DB" | Cache crash **trước khi flush là mất data** — chỉ dùng cho data chấp nhận mất hoặc cache có persistence |
| "Hot key hết hạn thì request sau tự rebuild, không sao" | Cache stampede: nghìn request cùng miss đập DB — cần lock single-flight, stale-while-revalidate, TTL jitter |
| "Pool size càng to càng chịu tải tốt" | Quá to gây context switch + contention, throughput **giảm** — công thức `(core × 2) + spindle`, pool nhỏ thường nhanh hơn |
| "Serverless cứ dùng pool như app thường" | Mỗi instance một pool riêng → spike là nổ max_connections — cần RDS Proxy/PgBouncer hoặc HTTP driver |
| "Timeout nghĩa là request fail, retry thoải mái" | Timeout là **không biết** — server có thể đã xử lý xong; POST có side effect phải có idempotency key mới retry an toàn |
| "Check key tồn tại rồi mới insert là đủ chống trùng" | Race condition khi concurrent — phải insert `pending` **atomic** (SET NX / unique constraint) làm lock theo key |
| "Có logs đầy đủ là đủ observability" | Logs không thay được metrics (alert/trend, rẻ) và traces (bottleneck cross-service) — cần cả ba + correlation ID |
| "Đưa user_id vào metrics label để dễ filter" | Cardinality explosion — mỗi tổ hợp label là một time series; chi tiết per-request thuộc về logs/span attributes |
| "Bloom filter báo 'có' nghĩa là chắc chắn có" | Chỉ 'CÓ THỂ có' (false positive) — đáng tin tuyệt đối chỉ ở chiều 'chắc chắn KHÔNG có' |
| "Muốn xoá phần tử thì clear các bit tương ứng" | Clear bit phá phần tử khác dùng chung bit → false negative — phải dùng Counting Bloom Filter / Cuckoo Filter |
