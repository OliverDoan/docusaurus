---
sidebar_position: 1
title: "1. Mitigation Strategies"
---

# Mitigation Strategies

Trong thực tế, các service và dependency luôn có lúc bị chậm hoặc lỗi, nên hệ thống cần được thiết kế để chịu đựng và phục hồi thay vì sập hoàn toàn. Bài này giới thiệu các chiến lược giảm thiểu sự cố (mitigation/resilience) như graceful degradation, circuit breaker, retry với exponential backoff, bulkhead, timeout, backpressure và load shedding. Áp dụng những pattern này giúp ứng dụng của bạn "đỡ đòn" tốt hơn khi gặp lỗi và tránh sự cố lan rộng theo dây chuyền.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Mọi external call production nên có tối thiểu `timeout` + `retry` + `circuit breaker`** (+ fallback, idempotency key).
- **Graceful Degradation** — giảm tính năng non-critical thay vì sập toàn bộ; **Circuit Breaker** ngắt mạch khi downstream fail liên tục (CLOSED → OPEN → HALF-OPEN).
- **Retry + Exponential Backoff (kèm jitter)** — chỉ retry lỗi transient (timeout, 429, 5xx), KHÔNG retry 4xx; POST cần `Idempotency-Key`.
- **Bulkhead** cô lập resource, **Timeout** phải cascading (child < parent), **Backpressure** & **Load Shedding** khi overload (ưu tiên P1 checkout, shed P3 trước).
- ⭐ **Tránh retry storm & cascade failure** — start simple, thêm advanced khi đo cần; chaos engineering cho enterprise/mission-critical.

:::

---

## Mục lục

- [Graceful Degradation](#graceful-degradation)
- [Circuit Breaker](#circuit-breaker)
- [Retry với Exponential Backoff](#retry-với-exponential-backoff)
- [Bulkhead Pattern](#bulkhead-pattern)
- [Timeout](#timeout)
- [Backpressure](#backpressure)
- [Load Shedding](#load-shedding)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Graceful Degradation

**Giảm tính năng** khi hệ thống overload, **không sập toàn bộ**.

Ví dụ:

- **Recommendation engine** down → show generic list thay vì error page.
- **Image CDN** slow → show placeholder.
- **Search down** → disable search, app vẫn browse được.
- **Email** queue tắc → log queue retry sau.

```ts
async function getRecommendations(userId: string) {
  try {
    return await mlService.recommend(userId);
  } catch (err) {
    logger.warn({ err }, "ML service down, fallback to popular");
    return await db.product.findMany({
      orderBy: { sales_count: "desc" },
      take: 10,
    });
  }
}
```

Pattern: **graceful fallback** ở mọi non-critical path.

---

## Circuit Breaker

**Ngắt mạch** khi downstream service fail liên tục → không waste time
retry.

:::tip[Ví dụ đời thường]

Đúng như tên gọi: **cầu dao điện trong nhà bạn**. Ổ cắm chập, cầu dao **tự nhảy** — không phải để trừng phạt cái ổ cắm, mà để khỏi cháy cả nhà và khỏi cắm đi cắm lại vô ích.

Ba trạng thái cũng y hệt cái cầu dao đó:

- `CLOSED` — điện thông bình thường.
- `OPEN` — vừa chập mấy lần liên tiếp nên cắt luôn; ai bật công tắc cũng nhận câu "không có điện" **ngay lập tức**, thay vì đứng chờ 30 giây rồi mới báo lỗi.
- `HALF-OPEN` — nghỉ một lát rồi **thử đẩy cầu dao lên một cái xem sao**: êm thì cho chạy lại, chập tiếp thì cắt tiếp.

:::

```
States:
[CLOSED]   — normal, request pass.
   ↓ N consecutive failures
[OPEN]     — block request, return error immediately.
   ↓ timeout
[HALF-OPEN] — try 1 request, if success → CLOSED, if fail → OPEN.
```

```ts
import CircuitBreaker from "opossum";

const options = {
  timeout: 3000,                    // 3s timeout
  errorThresholdPercentage: 50,     // open nếu > 50% error
  resetTimeout: 30000,              // try lại sau 30s
};

const breaker = new CircuitBreaker(callExternalAPI, options);

breaker.fallback(() => "Service temporarily unavailable");

breaker.on("open", () => logger.warn("Circuit opened"));
breaker.on("halfOpen", () => logger.info("Circuit half-open"));
breaker.on("close", () => logger.info("Circuit closed"));

// Usage
const result = await breaker.fire("argument");
```

**Lợi ích**:

- **Fail fast** — không đợi 30s timeout.
- **Reduce load** trên downstream → giúp nó recover.
- **Cascading failure prevention**.

**Library**:

- **opossum** (Node) — phổ biến.
- **resilience4j** (Java).
- **Polly** (.NET).
- **hystrix-go** (Go, deprecated nhưng inspire).

---

## Retry với Exponential Backoff

**Retry** sau khi fail, **delay tăng dần** giữa attempt.

:::tip[Ví dụ đời thường]

Gọi điện gặp máy bận. Bạn không bấm gọi lại liên tục mỗi giây — làm vậy chỉ khiến tổng đài thêm nghẽn. Bạn chờ 1 phút, rồi 2 phút, rồi 4 phút: đó là **exponential backoff**, vừa đỡ làm phiền đầu bên kia vừa cho nó thời gian hồi sức.

`jitter` là chi tiết tinh tế hơn: nếu **cả nghìn người cùng bị bận một lúc** và ai cũng chờ đúng 4 phút, thì tới phút thứ 4 tổng đài lại sập lần nữa (retry storm). Nên mỗi người cộng thêm một khoảng ngẫu nhiên vài chục giây để **dòng người quay lại bị dàn đều ra**.

:::

```ts
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts = 5,
  baseDelay = 1000,
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxAttempts) throw err;

      const delay = baseDelay * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 500;  // tránh thundering herd
      await new Promise(r => setTimeout(r, delay + jitter));
    }
  }
  throw new Error("Unreachable");
}

// Usage
const result = await retryWithBackoff(() => fetch(url));
```

Delay sequence: 1s, 2s, 4s, 8s, 16s (+jitter).

**Library**:

- **p-retry** (Node).
- **tenacity** (Python).
- **resilience4j** (Java).
- **cenkalti/backoff** (Go).

:::warning[Cần lưu ý]

**Retry KHÔNG dành cho mọi error**:

| Error | Retry? |
|-------|--------|
| Network timeout, 503 | **Có** (transient) |
| 429 Rate limit | **Có** (với Retry-After header) |
| 500 Internal | **Có** (server hiccup) |
| 400 Bad Request | **Không** (input sai) |
| 401 Unauthorized | **Không** (auth sai) |
| 404 Not Found | **Không** (data không có) |
| 422 Validation | **Không** (input sai) |

Idempotency:

- **Idempotent operation** (GET, PUT, DELETE) → retry safe.
- **Non-idempotent** (POST) → retry có thể duplicate. Dùng
  **idempotency key**:

```ts
await fetch("/api/payment", {
  method: "POST",
  headers: { "Idempotency-Key": uuidv4() },
  body: JSON.stringify({ amount: 100 }),
});
```

:::

---

## Bulkhead Pattern

**Isolate resource** — failure 1 part không affect part khác.

Ship có bulkhead — 1 compartment ngập, ship vẫn nổi.

:::tip[Ví dụ đời thường]

Chính là **khoang kín của tàu thuỷ**: thân tàu chia thành nhiều khoang có vách ngăn, thủng một khoang thì nước chỉ ngập khoang đó, tàu vẫn nổi.

Trong code, "nước" là **connection pool**. Dùng chung một pool 100 connection cho mọi thứ thì chỉ cần service báo cáo bị chậm là nó ngốn sạch 100 chỗ, và **luồng thanh toán chết theo dù chẳng liên quan gì**. Chia sẵn 30 cho user, 30 cho order, 10 cho báo cáo thì báo cáo có ngập cũng chỉ chết đúng phần báo cáo.

Cái giá: chia ô sẵn nghĩa là **không dồn hết công suất cho một việc được** — lúc cả hệ thống rảnh, phần báo cáo vẫn chỉ có 10 chỗ.

:::

**Implementation**:

**1. Connection pool riêng cho từng downstream**:

```ts
// Tệ — share pool, 1 service slow ăn hết connection
const pool = new Pool({ max: 100 });

// Tốt — pool riêng per service
const userServicePool = new Pool({ max: 30 });
const orderServicePool = new Pool({ max: 30 });
const reportServicePool = new Pool({ max: 10 });

// Report slow không cản user/order.
```

**2. Thread pool riêng** (Java, Python):

```java
// Spring Resilience4j
@Bulkhead(name = "userService", type = Bulkhead.Type.THREADPOOL)
public CompletableFuture<User> getUser(String id) { ... }
```

**3. Process isolation** — microservice tự nhiên bulkhead.

Pattern thực dụng: **isolate critical path** khỏi non-critical:

- Background job ≠ user-facing request pool.
- Admin endpoint ≠ public API rate limit.
- Heavy report ≠ checkout flow.

---

## Timeout

**Set timeout** mọi external call — không hang forever.

```ts
// Fetch với timeout
const response = await fetch(url, {
  signal: AbortSignal.timeout(5000),  // 5s
});

// DB query timeout
await prisma.$queryRaw`SET statement_timeout = '10s'`;

// HTTP server timeout
import { setTimeout as setServerTimeout } from "timers/promises";
server.setTimeout(30000);  // request timeout 30s
```

**Cascading timeout** — child timeout < parent timeout:

:::tip[Ví dụ đời thường]

Nhà hàng hứa với khách **30 phút có món**. Muốn giữ được lời hứa đó, bên trong bếp phải tự đặt hạn ngắn hơn: bếp trưởng chốt 25 phút, khâu nướng 20 phút, khâu đi lấy nguyên liệu 15 phút.

Nhờ vậy nếu kho hết nguyên liệu, phút thứ 15 là biết, còn kịp báo khách đổi món. Làm ngược lại — **khâu con hẹn lâu hơn khâu cha** — thì đúng phút 30 khách đứng dậy về, trong khi trong bếp vẫn hì hục nấu một món chẳng còn ai cần.

:::

```
User request: 30s timeout
  ↓
API gateway: 25s timeout
  ↓
Service A: 20s timeout
  ↓
DB query: 15s timeout
```

Lý do: nếu DB hang, query timeout → service trả error → gateway trả error
→ user thấy error sau ~15s, không 30s.

---

## Backpressure

**Giảm tốc producer** khi consumer chậm — tránh queue overflow.

:::tip[Ví dụ đời thường]

Dây chuyền đóng gói: người đầu dây đẩy ra 100 món/phút, người cuối dây chỉ dán nhãn kịp 60 món/phút. Không ai nói gì thì hàng **chất đống giữa băng chuyền rồi đổ xuống sàn** — đúng cảnh hàng đợi phình lên tới lúc hết RAM.

Backpressure là việc người cuối dây **giơ tay ra hiệu "chậm lại"**, và người đầu dây thật sự chậm lại. Trong Node, `readable.pipe(writable)` làm sẵn chuyện đó; còn với job queue hay HTTP thì bạn phải tự đặt trần và **từ chối thẳng** (`503`) khi đã quá tải — thà nói "chờ chút" còn hơn nhận rồi làm rơi.

:::

**Stream với backpressure** (Node):

```ts
const readable = createReadStream("huge-file.csv");
const writable = createWriteStream("processed.csv");

readable.pipe(writable);
// Built-in backpressure — readable pause khi writable buffer đầy.
```

**Queue size limit**:

```ts
const queue = new BullMQ({
  defaultJobOptions: {
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  },
});

// Check queue size before enqueue
const waiting = await queue.getWaitingCount();
if (waiting > 10000) {
  throw new Error("Queue full, retry later");
}
```

**HTTP backpressure** — reject request khi server overload:

```ts
let activeRequests = 0;
const MAX_CONCURRENT = 100;

app.use((req, res, next) => {
  if (activeRequests >= MAX_CONCURRENT) {
    return res.status(503).json({ error: "Service overloaded" });
  }
  activeRequests++;
  res.on("finish", () => activeRequests--);
  next();
});
```

---

## Load Shedding

**Drop request** khi system overload — tránh full crash.

:::tip[Ví dụ đời thường]

**Cắt điện luân phiên**. Lưới quá tải, nhà đèn không để cả thành phố sập mà chủ động **cắt trước mấy khu ít thiết yếu**, giữ điện cho bệnh viện.

Hệ thống của bạn cũng vậy: quá tải thì **vứt bớt việc không sống còn** — gợi ý sản phẩm, thống kê (P3) — để dành sức cho thanh toán (P1). Điểm mấu chốt là **bạn chọn cái để bỏ**, thay vì để hệ thống tự chết ngẫu nhiên và kéo luôn cả checkout theo.

:::

Priority tiers:

```
P1 (critical): checkout, payment           → never shed
P2 (important): browsing, search           → shed last
P3 (nice-to-have): recommendation, analytics → shed first
```

```ts
function checkLoadCapacity(req): boolean {
  const cpu = getCpuUsage();

  if (cpu > 0.9 && req.priority === "P3") return false; // shed
  if (cpu > 0.95 && req.priority === "P2") return false;

  return true;
}

app.use((req, res, next) => {
  if (!checkLoadCapacity(req)) {
    return res.status(503).json({ error: "Try later" });
  }
  next();
});
```

**Adaptive concurrency** — auto-adjust based on latency:

- Latency tăng → reduce concurrency.
- Latency giảm → increase concurrency.

Netflix Concurrency Limits, AWS adaptive — library hỗ trợ.

:::tip[Mẹo]

**Resilience strategy combined**:

```ts
// Wrap critical external call
async function callPaymentAPI(data) {
  // 1. Timeout
  // 2. Retry với exponential backoff
  // 3. Circuit breaker
  // 4. Fallback
  // 5. Idempotency key

  const breaker = new CircuitBreaker(
    () => retryWithBackoff(
      () => fetchWithTimeout("/api/payment", data, 5000),
      3,
      1000
    ),
    { errorThresholdPercentage: 50, resetTimeout: 30000 }
  );

  breaker.fallback(() => ({ status: "queued", retry_later: true }));

  return await breaker.fire();
}
```

Mọi external call production nên có **timeout + retry + circuit breaker**
minimum.

:::

:::info[Phân tích]

**Chaos engineering** — proactive resilience test:

- Random kill instance.
- Inject network delay/error.
- Simulate region down.
- Database fail-over test.

Tools:

- **Chaos Monkey** (Netflix) — original.
- **Litmus** — Kubernetes chaos.
- **Gremlin** — managed.
- **AWS Fault Injection** — AWS native.

Pattern: test failure mode **trước khi production fail**. Discover weak
point ở dev, fix trước user gặp.

Đáng đầu tư cho enterprise / mission-critical app. Startup nhỏ skip
được — focus correctness + monitor.

:::

:::warning[Cần lưu ý]

**Common pitfalls**:

**1. Retry storm**:

```
All clients fail simultaneously → all retry → DDoS your own service.
```

Fix: jitter random delay.

**2. Cascade failure**:

```
Service A slow → Service B timeout → Service C connection pool exhausted → all down.
```

Fix: timeout + circuit breaker per dependency.

**3. Silent failure**:

```
Try/catch swallow error → app "OK" nhưng broken.
```

Fix: log + alert mọi exception, không nuốt.

**4. Over-retry**:

```
Retry 10 lần với 60s timeout → 10 phút latency.
```

Fix: max retry 3, total < 30s.

Resilience pattern complex — start simple (timeout + retry), add advanced
khi đo cần.

:::

---

Hết Backend Roadmap. Chúc bạn build hệ thống vững chắc!

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi đối chiếu lại với nội dung phía trên.

1. `graceful degradation` là gì? Cho ví dụ những tính năng nên fallback thay vì trả lỗi, và những tính năng không được phép degrade.
2. Phân biệt `fail fast` và `fail silent`. Vì sao nuốt exception bằng `try/catch` rỗng lại nguy hiểm hơn là để lỗi nổ ra?
3. Mô tả 3 trạng thái của `circuit breaker` (`CLOSED` → `OPEN` → `HALF-OPEN`) và điều kiện chuyển đổi giữa chúng. Vì sao cần trạng thái `HALF-OPEN`?
4. Bạn chọn ngưỡng `errorThresholdPercentage` và `resetTimeout` dựa trên cơ sở nào? Đặt quá nhạy và đặt quá lỳ thì mỗi bên hỏng như thế nào?
5. Một downstream không trả lỗi mà chỉ *chậm* — `circuit breaker` có bắt được không? Cần kết hợp thêm cơ chế gì?
6. Vì sao mọi external call bắt buộc phải có `timeout`? Nếu không đặt timeout thì tài nguyên nào cạn trước tiên và hậu quả lan ra sao?
7. `cascading timeout` là gì? Vì sao timeout của tầng con phải nhỏ hơn tầng cha, và điều gì xảy ra khi cấu hình ngược lại?
8. Vì sao retry nên dùng `exponential backoff` thay vì khoảng cách cố định? `jitter` được thêm vào để giải quyết chuyện gì?
9. Lỗi nào nên retry, lỗi nào không? Giải thích vì sao `400`/`401`/`422` không nên retry còn `429`/`503` thì nên, và bạn tôn trọng header `Retry-After` thế nào?
10. Retry một request `POST` có thể tạo đơn trùng hoặc thanh toán hai lần. `Idempotency-Key` hoạt động ra sao ở phía server — lưu gì, khoá cách nào, giữ trong bao lâu?
11. `retry storm` hình thành như thế nào? Nếu cả 4 tầng trong chuỗi service đều retry 3 lần, downstream cuối cùng nhận bao nhiêu request cho một lượt user?
12. Nên đặt retry bên trong hay bên ngoài `circuit breaker`? Giải thích thứ tự lồng nhau giữa `rate limiter`, retry, `circuit breaker` và `timeout`.
13. `bulkhead pattern` là gì? Cho ví dụ cụ thể việc dùng chung một `connection pool` khiến endpoint báo cáo chậm làm chết luôn luồng checkout, và cách chia pool để tránh.
14. Khi nào dùng `bulkhead` thay vì `circuit breaker`, và khi nào cần cả hai? Cái giá của việc chia sẵn tài nguyên theo khoang là gì?
15. `backpressure` là gì? Trong Node stream nó hoạt động thế nào, còn với HTTP API hoặc job queue thì bạn tự triển khai bằng cách nào?
16. `load shedding` khác `rate limiting` ở điểm nào? Bạn phân loại request theo mức ưu tiên (P1/P2/P3) ra sao và quyết định bỏ cái gì trước?
17. Mô tả một `cascade failure`: service A chậm → B timeout → pool của C cạn → cả hệ thống sập. Ở mỗi mắt xích cần pattern nào để chặn dây chuyền?
18. `chaos engineering` là gì? Nêu vài thí nghiệm bạn sẽ chạy trước và giải thích vì sao startup nhỏ có thể tạm bỏ qua.
19. Nếu chỉ được thêm ba cơ chế bảo vệ cho mọi external call trên production, bạn chọn gì, theo thứ tự nào, và giải thích lý do?
