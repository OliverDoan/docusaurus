---
sidebar_position: 1
title: "1. Mitigation Strategies"
---

# Mitigation Strategies

---

## Mục lục

- [Graceful Degradation](#graceful-degradation)
- [Circuit Breaker](#circuit-breaker)
- [Retry với Exponential Backoff](#retry-với-exponential-backoff)
- [Bulkhead Pattern](#bulkhead-pattern)
- [Timeout](#timeout)
- [Backpressure](#backpressure)
- [Load Shedding](#load-shedding)

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
