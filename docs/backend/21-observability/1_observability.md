---
sidebar_position: 1
title: "1. Observability: Metrics, Logs, Tracing"
---

# Observability: Metrics, Logs, Tracing

Observability là khả năng "nhìn thấy" được điều gì đang xảy ra bên trong hệ thống của bạn khi nó chạy thật. Bài này giới thiệu ba trụ cột chính: metrics (số liệu để theo dõi xu hướng và cảnh báo), logs (ghi lại sự kiện để debug) và tracing (theo dấu một request đi qua nhiều service), cùng các công cụ phổ biến như Prometheus, Grafana và OpenTelemetry. Thiết lập observability tốt giúp bạn phát hiện và xử lý sự cố nhanh khi production gặp vấn đề.

[![Sơ đồ tóm tắt bài: Observability: Metrics, Logs, Tracing](/img/backend/observability.webp)](pathname:///img/backend/observability.webp)

---

:::note[Ghi nhớ nhanh]

- ⭐ **3 trụ cột observability** — Metrics (số liệu cho trend/alert), Logs (event để debug), Traces (theo dấu request qua nhiều service tìm root cause).
- **`Prometheus`** (pull metric) + **`Grafana`** (visualize) + Alertmanager; theo dõi service bằng `RED` (Rate/Errors/Duration) và resource bằng `USE` (Utilization/Saturation/Errors).
- **Structured logging JSON ra stdout** — kèm `requestId`/`traceId`, tuyệt đối **không log PII** (password, thẻ, SSN); Pino có `redact`.
- **Distributed Tracing** (Jaeger, Tempo, Honeycomb) dùng `trace_id`/`span` để chỉ ra bottleneck.
- ⭐ **`OpenTelemetry`** — chuẩn vendor-neutral, auto-instrument, mặc định cho project mới 2026 (xuất được sang bất kỳ backend OTLP nào).

:::

---

## Mục lục

- [3 pillars of Observability](#3-pillars-of-observability)
- [Metrics + Prometheus + Grafana](#metrics--prometheus--grafana)
- [Logging strategy](#logging-strategy)
- [Distributed Tracing](#distributed-tracing)
- [OpenTelemetry](#opentelemetry)
- [Tools](#tools)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 3 pillars of Observability

:::tip[Ví dụ đời thường]

Hình dung bạn quản lý một đội xe giao hàng:

- **Metrics** = **mấy cái đồng hồ trên táp-lô** — tốc độ, xăng, nhiệt độ máy. Chỉ là con số, nhưng liếc một cái là biết xe đang khoẻ hay sắp sôi, và cắm được chuông báo "kim vượt vạch đỏ".
- **Logs** = **nhật ký hành trình** tài xế ghi tay — "10:05 đổ xăng", "10:40 thủng lốp". Không nhìn ra xu hướng, nhưng khi đã biết có sự cố thì đây là chỗ đọc để hiểu chuyện gì đã xảy ra.
- **Traces** = **bám theo đúng một kiện hàng** qua từng trạm, xem nó nằm ở đâu bao lâu. Dùng khi khách kêu "đơn của tôi 3 ngày chưa tới" mà đồng hồ lẫn nhật ký đều trông bình thường.

Thiếu một trong ba là bạn biết **có chuyện**, nhưng không biết **ở đâu** hoặc **vì sao**.

:::

| Pillar | Format | Mục đích |
|--------|--------|---------|
| **Metrics** | Number aggregated | Trend, alert ("CPU 95%") |
| **Logs** | Text event | Debug specific event ("user X login fail") |
| **Traces** | Distributed call graph | Latency root cause |

3 combined → biết **system đang gì**, **at where**, **why**.

---

## Metrics + Prometheus + Grafana

**Prometheus** — pull-based metric store, time-series.

:::tip[Ví dụ đời thường]

Có hai cách lấy số điện: **mỗi hộ tự gọi lên tổng công ty báo số** (push), hoặc **nhân viên đi một vòng ghi công tơ theo lịch** (pull). Prometheus chọn cách thứ hai — cứ 15 giây nó tự tới gõ cửa `/metrics` của từng service.

Được cái: hộ nào không mở cửa là biết ngay hộ đó chết, và không ai spam ngập tổng công ty được. Mất cái: **job chạy chớp nhoáng rồi tắt** thì nhân viên tới nơi đã chẳng còn ai để ghi.

:::

**Exporter** in app — expose `/metrics` endpoint:

```ts
// Node với prom-client
import { register, Counter, Histogram } from "prom-client";

const httpRequests = new Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status"],
});

const httpDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration",
  labelNames: ["method", "route"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

// Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    httpRequests.inc({ method: req.method, route: req.path, status: res.statusCode });
    httpDuration.observe(
      { method: req.method, route: req.path },
      (Date.now() - start) / 1000
    );
  });
  next();
});

// Endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});
```

**Prometheus** scrape `/metrics` mỗi 15s.

**Grafana** visualize:

```
Dashboard:
├─ Request rate (requests/s by route)
├─ p95 latency
├─ Error rate (5xx)
├─ DB query time
└─ Memory + CPU
```

**Alerts** trong Prometheus:

```yaml
groups:
  - name: api
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "Error rate > 5%"
```

Alert send qua **Alertmanager** → Slack, PagerDuty, email.

:::info[Phân tích]

**RED method** cho service metrics:

- **R**equest rate — request/second.
- **E**rrors — error/second hoặc rate.
- **D**uration — p50, p95, p99.

**USE method** cho resource:

- **U**tilization — % thời gian busy.
- **S**aturation — queue depth, backlog.
- **E**rrors — error count.

Mỗi service track 3 RED → biết health.
Mỗi resource track 3 USE → biết bottleneck.

:::

---

## Logging strategy

**Structured logging** — JSON format, queryable:

:::tip[Ví dụ đời thường]

Cùng là ghi sổ trực ban, nhưng có hai kiểu:

- **Viết tay tự do** — "sáng nay anh Nam gọi báo không đăng nhập được". Đọc thì hiểu, nhưng sếp hỏi "tháng này có bao nhiêu ca đăng nhập lỗi?" là ngồi lật từng trang đếm.
- **Điền vào biểu mẫu có cột sẵn** — cột giờ, cột mã khách, cột loại sự việc. Máy lọc trong một nốt nhạc: "cho tôi mọi dòng loại = đăng nhập lỗi, mã khách = 123".

Log JSON chính là cái biểu mẫu đó. Thêm `requestId`/`traceId` vào mỗi dòng thì những dòng rời rạc của cùng một lượt khách được xâu lại thành một câu chuyện liền mạch.

:::

```ts
// Pino — fast Node logger
import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  formatters: {
    level: (label) => ({ level: label }),
  },
});

logger.info({ userId: 123, action: "login" }, "User logged in");
logger.error({ err, orderId }, "Failed to create order");
logger.warn({ duration: 5000 }, "Slow query detected");
```

Output:

```json
{"level":"info","time":"2026-05-19T10:00:00.000Z","userId":123,"action":"login","msg":"User logged in"}
```

**Log levels**:

- **trace** — extremely verbose.
- **debug** — debugging only.
- **info** — normal operation.
- **warn** — concerning but OK.
- **error** — broken something.
- **fatal** — service crashing.

Production: `info` mặc định. Dev: `debug`.

**Best practices**:

1. **Structured** (JSON), không free text.
2. **Context fields** — userId, requestId, traceId.
3. **Stdout** — không file (12-factor).
4. **No PII** — không log password, full credit card.
5. **Correlation ID** — request track qua service.

```ts
// Middleware add request ID
import { randomUUID } from "crypto";

app.use((req, res, next) => {
  req.id = req.headers["x-request-id"] || randomUUID();
  res.setHeader("X-Request-Id", req.id);
  req.log = logger.child({ requestId: req.id });
  next();
});

// Trong handler
req.log.info({ orderId }, "Order processed");
```

**Log aggregation**:

- **ELK Stack** — Elasticsearch + Logstash + Kibana (truyền thống).
- **EFK** — thay Logstash bằng Fluentd.
- **Loki + Grafana** — log như Prometheus.
- **Better Stack** (Logtail), **Datadog**, **Axiom** — managed.

---

## Distributed Tracing

Track **request qua nhiều service**:

:::tip[Ví dụ đời thường]

**Mã vận đơn** của một kiện hàng. Kiện đi qua bưu cục Hà Nội → kho trung chuyển → bưu cục quận → shipper, và **mỗi trạm đóng dấu giờ vào, giờ ra** dưới cùng một mã (`trace_id`; mỗi trạm là một `span`).

Khi khách kêu "đơn giao 3 ngày mới tới", bạn không phải gọi hỏi vòng quanh từng bưu cục. Mở mã vận đơn ra là thấy ngay: 4 trạm đầu mỗi trạm vài phút, riêng kho trung chuyển ôm hàng 2 ngày rưỡi. Thủ phạm lộ mặt trong 5 giây.

:::

```
[Client]
   ↓ (trace ID: abc-123)
[API Gateway]
   ↓
[User Service] → DB
   ↓
[Order Service] → DB
   ↓
[Payment Service] → Stripe
```

Mỗi step = **span** với:

- `trace_id` — chung cho cả request.
- `span_id` — unique per step.
- `parent_span_id` — link parent.
- `duration` — bao lâu.
- `attributes` — userId, method, status...

Span tree:

```
Trace abc-123 (total 500ms)
├─ API Gateway (5ms)
├─ User Service (50ms)
│  ├─ DB query: SELECT user (40ms)
│  └─ Cache check (5ms)
├─ Order Service (200ms)
│  └─ DB transaction (180ms)
└─ Payment Service (240ms)
   └─ Stripe API (220ms)
```

→ Identify **Stripe API** là bottleneck.

**Tools**:

- **Jaeger** — open source.
- **Tempo** (Grafana) — backend cho trace.
- **Zipkin** — older.
- **Honeycomb** — best-in-class managed.
- **Sentry Performance** — combine error + trace.
- **Datadog APM**, **New Relic** — enterprise.

---

## OpenTelemetry

**Standard** observability framework — vendor-neutral.

:::tip[Ví dụ đời thường]

Ngày xưa mỗi hãng điện thoại một kiểu chân sạc, đổi máy là thay cả mớ dây. Giờ tất cả dùng chung **USB-C** — dây nào cắm máy nào cũng được.

OpenTelemetry là cái chuẩn USB-C đó cho observability: bạn gắn đo đạc vào code **một lần** theo chuẩn chung, còn muốn đẩy dữ liệu sang Jaeger, Grafana Tempo hay Honeycomb thì chỉ là **đổi đầu dây** ở cấu hình. Đổi vendor không còn là dự án cả quý.

:::

```bash
npm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node
```

```ts
// instrumentation.ts
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";

const sdk = new NodeSDK({
  serviceName: "my-api",
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

Auto-instrument:

- HTTP request.
- Express, Fastify, Koa handler.
- DB query (Postgres, MongoDB, Redis).
- gRPC calls.

Output trace → **OTLP exporter** → backend (Jaeger, Honeycomb, Tempo).

```ts
// Custom span
import { trace } from "@opentelemetry/api";

async function processOrder(orderId: string) {
  const tracer = trace.getTracer("orders");

  return tracer.startActiveSpan("processOrder", async (span) => {
    span.setAttribute("order.id", orderId);

    try {
      const result = await heavyOperation();
      span.setAttribute("order.total", result.total);
      return result;
    } catch (err) {
      span.recordException(err);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw err;
    } finally {
      span.end();
    }
  });
}
```

:::info[Phân tích]

**Tại sao OpenTelemetry?**

- **Standard** — vendor-neutral.
- **Auto-instrument** — minimal code change.
- **Multi-signal** — trace + metric + log unified.
- **Future-proof** — không lock-in 1 vendor.

Trước: mỗi vendor SDK riêng (Datadog, New Relic). Migrate đau đầu.

Giờ: viết code OTel → xuất sang **bất kỳ** backend hỗ trợ OTLP.

Năm 2026, **default cho project mới**. Vercel, Cloudflare, AWS đều
hỗ trợ OTLP ingest.

:::

---

## Tools

**All-in-one**:

| Tool | Free tier | Pricing |
|------|-----------|---------|
| **Datadog** | Limited | $$$ |
| **New Relic** | 100GB/month | $$ |
| **Grafana Cloud** | Generous | $$ |
| **Honeycomb** | 20M event | $$ |
| **Sentry** | Generous | $ |
| **Better Stack** | Generous | $ |

**Open source self-host**:

- **Prometheus + Grafana** — metrics.
- **Loki + Grafana** — logs.
- **Tempo + Grafana** — traces.
- **Jaeger** — traces.
- **OpenTelemetry Collector** — central pipeline.

**Best stack 2026** cho startup:

```
- Sentry (error + perf + replay)
- Vercel/CloudFlare Analytics (Web Vitals)
- Axiom / Better Stack (logs)
- Pino (structured log)
- OpenTelemetry (vendor-neutral)
```

Cost: $0-50/month cho startup nhỏ-vừa.

:::tip[Mẹo]

**Observability checklist**:

- [ ] Health endpoint (`/health`).
- [ ] Metric endpoint (`/metrics` Prometheus format).
- [ ] Structured log to stdout (JSON).
- [ ] Request ID propagated.
- [ ] Distributed trace ID.
- [ ] Error tracking (Sentry).
- [ ] Alert on critical (5xx rate, slow query, queue backlog).
- [ ] Dashboard public — team see status anytime.
- [ ] On-call rotation.
- [ ] Runbook cho common issue.

Setup từ ngày 1 → easier debug khi production có issue.

:::

:::warning[Cần lưu ý]

**Don't log PII**:

```ts
// SAI — log password, full credit card, SSN
logger.info({ user, password, ssn }, "Login attempt");

// ĐÚNG — sanitize
logger.info({ userId: user.id, action: "login_attempt" }, "Login attempt");
```

Compliance:

- **GDPR** — không log EU user PII không cần.
- **PCI-DSS** — không log full card number.
- **HIPAA** — không log medical data.

Tool **redaction** — Pino có config:

```ts
const logger = pino({
  redact: {
    paths: ["password", "creditCard", "user.ssn"],
    censor: "[REDACTED]",
  },
});
```

Audit log policy thường xuyên — log retention rule + access control.

:::

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Phân biệt `monitoring` và `observability`. Vì sao có đầy đủ dashboard mà đội vẫn có thể "mù" trước một sự cố chưa từng gặp?**

<details className="qa">
<summary>Xem đáp án</summary>

- `monitoring` = theo dõi **những câu hỏi bạn đã biết trước**: CPU có vượt 90% không, error rate có quá 5% không. Bạn dựng sẵn dashboard và alert cho các kịch bản đã lường.
- `observability` = khả năng **đặt câu hỏi mới mà không cần deploy lại**: "riêng user trả phí ở Singapore dùng app version 3.2 thì latency ra sao?".

Dashboard đầy đủ vẫn "mù" vì dashboard chỉ hiển thị **những gì ai đó từng nghĩ tới**. Sự cố mới thường là tổ hợp bất ngờ — một tenant lớn, một endpoint ít dùng, một phiên bản client cụ thể — mà không panel nào đang vẽ. Metrics lại là số đã tổng hợp: p99 tăng thì bạn biết "có chuyện", nhưng không biết **ai** và **vì sao**, vì chi tiết đã bị làm phẳng lúc gộp.

Cách thoát: dữ liệu giàu chiều (structured log và trace có nhiều attribute) cho phép cắt lát tuỳ ý lúc đang cháy, thay vì chỉ có vài biểu đồ dựng sẵn. Đó chính là lý do bài nhấn mạnh phải có đủ cả ba trụ cột.

</details>

**2. Ba trụ cột `metrics`, `logs`, `traces` khác nhau ở đâu? Với sự cố "checkout chậm", bạn dùng cái nào trước, cái nào sau và để trả lời câu hỏi gì?**

<details className="qa">
<summary>Xem đáp án</summary>

| Trụ cột | Dạng dữ liệu | Trả lời câu hỏi |
|---|---|---|
| **Metrics** | Số đã tổng hợp theo thời gian | **Có chuyện gì không?** Trend, alert |
| **Traces** | Cây lời gọi xuyên service | **Chậm ở đâu?** Root cause về latency |
| **Logs** | Sự kiện chi tiết | **Vì sao?** Nội dung cụ thể của lỗi |

Đúng như ví dụ đội xe trong bài: metrics là đồng hồ táp-lô, logs là nhật ký hành trình, traces là bám theo một kiện hàng.

Với "checkout chậm":

1. **Metrics trước** — xác nhận sự cố có thật và phạm vi: p95/p99 của endpoint checkout, request rate, error rate, từ lúc nào, ảnh hưởng bao nhiêu %.
2. **Traces tiếp theo** — mở một trace chậm tiêu biểu, nhìn span tree để thấy thời gian nằm ở đâu: DB transaction, gọi Stripe, hay chờ queue.
3. **Logs cuối cùng** — lọc theo `traceId` của chính request đó để đọc chi tiết: timeout bao nhiêu, retry mấy lần, lỗi gì.

Đi ngược thứ tự này (nhảy vào log trước) là cách nhanh nhất để chết chìm trong hàng triệu dòng.

</details>

**3. Vì sao Prometheus chọn mô hình `pull` thay vì `push`? Mô hình pull xử lý ra sao với job chạy ngắn rồi tắt (`Pushgateway`)?**

<details className="qa">
<summary>Xem đáp án</summary>

Prometheus tự đi gõ cửa `/metrics` của từng target theo lịch (mặc định 15s) — giống nhân viên đi một vòng ghi công tơ trong ví dụ của bài. Lợi ích:

- **Tự phát hiện target chết** — scrape fail là biết ngay, metric `up` thành 0. Với push thì "im lặng" có thể là chết mà cũng có thể là không có việc gì để báo.
- **Không bị spam** — Prometheus kiểm soát tần suất, client lỗi không thể làm ngập server.
- **Cấu hình tập trung**, service discovery tự tìm target mới.
- **Dễ debug** — chỉ cần `curl` vào `/metrics` là thấy đúng thứ Prometheus thấy.

Điểm yếu: **job chạy chớp nhoáng rồi tắt** (cron, batch) thì tới lúc scrape đã không còn ai để ghi. Giải pháp là **Pushgateway**: job đẩy metric vào đó trước khi thoát, Prometheus scrape Pushgateway như một target bình thường.

Lưu ý khi dùng: Pushgateway **không tự xoá** metric cũ nên số liệu của job đã chết vẫn nằm đó, và nó trở thành single point of failure. Vì vậy chỉ dùng cho batch job, tuyệt đối không dùng thay cho scrape service thường trực.

</details>

**4. Phân biệt `counter`, `gauge`, `histogram` và `summary`. Mỗi loại dùng cho chỉ số nào, và vì sao `histogram` cần định nghĩa `buckets` trước?**

<details className="qa">
<summary>Xem đáp án</summary>

| Loại | Đặc tính | Dùng cho |
|---|---|---|
| `counter` | Chỉ tăng, reset về 0 khi restart | Tổng số request, số lỗi, số byte gửi |
| `gauge` | Lên xuống tuỳ ý | Memory đang dùng, số connection, độ dài queue |
| `histogram` | Đếm số quan sát rơi vào từng bucket | Latency, kích thước response |
| `summary` | Tính quantile ngay tại client | Latency khi không cần gộp nhiều instance |

Với `counter` bạn gần như luôn dùng qua hàm `rate()` chứ không đọc giá trị tuyệt đối — như alert trong bài dùng `rate(http_requests_total[5m])`.

`histogram` phải khai báo `buckets` trước vì nó **không lưu từng giá trị**, chỉ lưu bộ đếm tích luỹ cho từng ngưỡng. Quantile về sau được **nội suy** từ các bộ đếm đó (`histogram_quantile`), nên bucket đặt sai thì p95 sai theo: chọn ngưỡng quá thưa quanh vùng giá trị thật thì độ phân giải rất thô. Đổi lại, vì chỉ là counter nên histogram **cộng gộp được giữa nhiều instance** — đó là ưu thế quyết định so với `summary`, vốn tính quantile cục bộ tại từng process nên không cộng lại được.

</details>

**5. Vì sao `p95`/`p99` phản ánh trải nghiệm user tốt hơn giá trị trung bình? Cho một ví dụ average trông đẹp nhưng user vẫn khổ.**

<details className="qa">
<summary>Xem đáp án</summary>

Trung bình bị **kéo phẳng bởi số đông request nhanh** và che mất cái đuôi dài, trong khi người dùng cảm nhận được chính là cái đuôi đó. Percentile nói đúng ngôn ngữ trải nghiệm: p99 = 2s nghĩa là 1% lượt truy cập phải chờ hơn 2 giây.

Ví dụ: 1000 request, 990 request mất 50ms, 10 request mất 10s.

```
average = (990 * 50ms + 10 * 10000ms) / 1000 = 149.5ms   → trông rất đẹp
p99     ≈ 10s                                            → 10 user đang chờ mòn mỏi
```

Dashboard báo "trung bình 150ms, ổn", trong khi mỗi ngày có hàng nghìn lượt treo 10 giây — thường rơi đúng vào khách hàng lớn nhất (dữ liệu nhiều nhất, query nặng nhất).

Thêm một điểm hay bị bỏ qua: một trang web gọi 20 API, thì xác suất **ít nhất một** lời gọi rơi vào p99 là rất cao. Nghĩa là p99 của từng API lại trở thành trải nghiệm phổ biến ở cấp trang. Vì vậy bài yêu cầu theo dõi p50, p95, p99 (chữ D trong `RED`) chứ không chỉ một con số trung bình.

</details>

**6. Giải thích `RED method` và `USE method`. Với một API service và một node hạ tầng, bạn sẽ track chính xác những chỉ số nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`RED`** — dành cho **service** (thứ phục vụ request): **R**ate (request/giây), **E**rrors (lỗi/giây hoặc tỷ lệ), **D**uration (p50/p95/p99).
- **`USE`** — dành cho **resource** (CPU, disk, network, pool): **U**tilization (% thời gian bận), **S**aturation (hàng đợi, backlog), **E**rrors (số lỗi của chính tài nguyên đó).

Với một API service:

```
rate(http_requests_total[5m])                                  # R
rate(http_requests_total{status=~"5.."}[5m])                   # E
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))  # D
```

Với một node hạ tầng: CPU utilization và load average, memory dùng + swap, disk `%util` và I/O wait, network throughput; saturation nhìn qua run queue, độ sâu queue, số connection chờ trong pool; errors nhìn qua packet drop, disk error, OOM kill.

Cách kết hợp trong thực tế: RED cho biết **user có đang khổ không**, USE cho biết **tài nguyên nào là thủ phạm**. Alert thì đặt trên RED (triệu chứng), còn USE dùng để chẩn đoán.

</details>

**7. `cardinality` của label là gì? Vì sao gắn `userId` hay `requestId` làm label Prometheus là thảm hoạ, và thông tin đó nên nằm ở đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

`cardinality` = số tổ hợp giá trị label khác nhau của một metric. Prometheus tạo **một time series riêng cho mỗi tổ hợp**, và mỗi series tốn bộ nhớ, index, dung lượng lưu trữ.

Với `http_requests_total` có 5 method × 20 route × 6 status = 600 series — hoàn toàn bình thường. Thêm label `userId` với 1 triệu user thì con số nhảy lên **600 triệu series**: Prometheus ngốn hết RAM và OOM, query chậm tới mức vô dụng, ingest tắc — đây là kiểu "cardinality explosion" giết chết hệ metric nhanh nhất. `requestId` còn tệ hơn vì mỗi request là một giá trị mới, series tăng vô hạn theo thời gian.

Nguyên tắc: label chỉ dùng cho giá trị **có tập hữu hạn nhỏ và biết trước** (method, route đã chuẩn hoá, status, region, environment). Đặc biệt lưu ý phải chuẩn hoá path: dùng `/users/:id` chứ không phải URL thật có id trong đó.

Thông tin định danh cao thuộc về nơi khác:

- `requestId`, `userId` → **structured log** (lọc được, không tạo series).
- Hành trình một request cụ thể → **trace**, với `userId` là span attribute.

</details>

**8. Vì sao nên log dạng `JSON` có cấu trúc và ghi ra `stdout` thay vì tự ghi file? Liên hệ với nguyên tắc `12-factor` và với hạ tầng container.**

<details className="qa">
<summary>Xem đáp án</summary>

**JSON có cấu trúc** biến log thành dữ liệu truy vấn được. Thay vì grep chuỗi mong manh, bạn lọc theo trường: lấy mọi dòng có `action` là login fail và `userId` là 123, hoặc đếm số lỗi theo route. Đúng như ví dụ trong bài: viết tay tự do thì đọc hiểu nhưng không thống kê được, còn biểu mẫu có cột sẵn thì máy lọc trong một nốt nhạc.

**Ghi ra stdout** là nguyên tắc `12-factor`: *log là luồng sự kiện*, ứng dụng không chịu trách nhiệm định tuyến hay lưu trữ. Việc gom và chuyển log là của hạ tầng (Docker log driver, Fluent Bit, Vector, Loki).

Lý do cụ thể trong môi trường container:

- Container **ephemeral** — bị giết là mất sạch file trong đó.
- Ghi file cần volume, cần log rotation; quên rotate là **đầy đĩa và sập service**.
- Nhiều instance ghi nhiều file rời rạc, không ai gom được thành bức tranh chung.
- Viết file là I/O đồng bộ nằm trên đường xử lý request.

Kèm theo đó: đặt `traceId`/`requestId` vào mỗi dòng để xâu các dòng rời rạc thành một câu chuyện liền mạch.

</details>

**9. `correlation ID` / `requestId` giải quyết vấn đề gì? Bạn truyền nó qua nhiều service, qua job queue và qua background worker bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Vấn đề: một lượt người dùng sinh ra hàng chục dòng log rải ở nhiều service và nhiều instance. Không có định danh chung thì không cách nào biết dòng nào thuộc về ai — nhất là khi hàng nghìn request chạy đồng thời. `correlation ID` xâu tất cả lại, cho phép hỏi "cho tôi toàn bộ những gì đã xảy ra với request này".

Cách truyền:

- **Vào hệ thống** — nhận từ header `x-request-id` nếu có, không thì sinh `randomUUID()`, trả lại trong response header, rồi tạo child logger mang sẵn field đó.
- **Giữa các service** — đính vào header của mọi lời gọi HTTP/gRPC đi ra. Với OpenTelemetry thì chuẩn là `traceparent` và việc này được auto-instrument làm hộ.
- **Qua job queue** — nhét vào **payload hoặc metadata của message**, vì header HTTP không đi theo được. Worker đọc ra và gắn vào logger của nó.
- **Trong một process** — dùng `AsyncLocalStorage` (Node) để khỏi phải truyền tay qua từng tầng hàm.

```ts
app.use((req, res, next) => {
  req.id = req.headers["x-request-id"] || randomUUID();
  res.setHeader("X-Request-Id", req.id);
  req.log = logger.child({ requestId: req.id });
  next();
});
```

</details>

**10. Chọn `log level` cho production thế nào? Log quá nhiều gây hậu quả gì về chi phí lưu trữ và khả năng tìm kiếm khi sự cố?**

<details className="qa">
<summary>Xem đáp án</summary>

Mặc định production là `info`, dev là `debug`. Quy ước dùng từng level:

- `error`/`fatal` — thứ cần người xử lý, nên gắn với alert.
- `warn` — bất thường nhưng hệ vẫn chạy (retry, fallback, query chậm).
- `info` — mốc nghiệp vụ quan trọng: đơn tạo, thanh toán xong, job chạy.
- `debug`/`trace` — chỉ bật tạm khi điều tra.

Hậu quả của log quá nhiều:

- **Chi phí** — log thường tính tiền theo GB ingest; log `debug` ở production có thể đắt hơn cả tiền chạy server.
- **Tín hiệu chìm trong nhiễu** — lúc sự cố, dòng quan trọng bị chôn giữa hàng triệu dòng vô nghĩa, tìm kiếm chậm và người trực mất thời gian vàng.
- **Retention ngắn lại** — ngân sách cố định nên log ồn đẩy dữ liệu cũ ra sớm, mất luôn khả năng so sánh với quá khứ.

Mẹo thực tế: sampling cho các sự kiện lặp lại quá nhiều, và đưa thông tin lặp vào trace thay vì in ra log.

</details>

**11. Những dữ liệu nào tuyệt đối không được log (`PII`, password, số thẻ, token)? Bạn chặn bằng cơ chế gì (`redact`) và chính sách `retention` nên ra sao theo `GDPR`/`PCI-DSS`?**

<details className="qa">
<summary>Xem đáp án</summary>

Không bao giờ log: password (kể cả hash), số thẻ đầy đủ và CVV, token/API key/session cookie, số định danh cá nhân (SSN, CMND/CCCD), dữ liệu y tế, và nói chung mọi `PII` không thực sự cần. Cạm bẫy phổ biến nhất là **log nguyên object**: `logger.info({ user, body }, ...)` vô tình kéo theo cả password và token.

Cơ chế chặn, xếp theo tầng:

```ts
const logger = pino({
  redact: {
    paths: ["password", "creditCard", "user.ssn", "req.headers.authorization"],
    censor: "[REDACTED]",
  },
});
```

- **Redact ở logger** — chặn tự động, không phụ thuộc trí nhớ của người viết code.
- **Chỉ log định danh, không log nội dung** — `userId: user.id` thay vì cả object user.
- **Masking** khi buộc phải hiển thị: chỉ giữ 4 số cuối thẻ.
- **Code review + scan** log mẫu ở CI để bắt rò rỉ mới.

Về retention: `PCI-DSS` cấm lưu số thẻ đầy đủ và CVV, đồng thời yêu cầu giữ audit log tối thiểu một năm với phần gần nhất luôn sẵn sàng truy vấn. `GDPR` yêu cầu chỉ thu thập dữ liệu tối thiểu, có thời hạn lưu xác định và phải xoá được theo yêu cầu của người dùng — nên gắn TTL tự động cho log và kiểm soát ai được đọc.

</details>

**12. Mô tả cấu trúc một trace: `trace_id`, `span_id`, `parent_span_id`, `attributes`. `context propagation` giữa các service diễn ra thế nào (header `traceparent`)?**

<details className="qa">
<summary>Xem đáp án</summary>

Một **trace** là toàn bộ hành trình của một request; mỗi chặng là một **span**:

- `trace_id` — chung cho cả request, xâu mọi span lại (giống mã vận đơn trong ví dụ của bài).
- `span_id` — định danh riêng của từng chặng.
- `parent_span_id` — trỏ tới span cha, nhờ đó dựng lại được **cây** chứ không chỉ một danh sách.
- `duration` + thời điểm bắt đầu — để biết chặng nào ngốn thời gian.
- `attributes` — ngữ cảnh: `http.route`, `db.statement`, `order.id`, status.

```
Trace abc-123 (500ms)
├─ API Gateway (5ms)
├─ Order Service (200ms)
│  └─ DB transaction (180ms)
└─ Payment Service (240ms)
   └─ Stripe API (220ms)     ← bottleneck lộ mặt
```

**Context propagation**: service gọi đi phải chuyển ngữ cảnh sang service nhận, qua header chuẩn W3C Trace Context:

```
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
             ^version ^trace-id                  ^parent-span-id   ^flags
```

Service nhận đọc header này, tạo span mới với cùng `trace_id` và lấy span id trong header làm `parent_span_id`. Với OpenTelemetry, auto-instrumentation làm việc này tự động cho HTTP/gRPC; qua message queue thì phải tự nhét `traceparent` vào metadata của message.

</details>

**13. `sampling` trong tracing là gì? So sánh `head-based` và `tail-based sampling` — mỗi cách bỏ sót gì và tốn kém ở đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

`sampling` = chỉ giữ lại một phần trace thay vì tất cả, vì lưu 100% trace ở lưu lượng lớn cực kỳ tốn tiền lưu trữ và băng thông.

| | `head-based` | `tail-based` |
|---|---|---|
| Quyết định | Ngay ở span đầu tiên, trước khi biết kết quả | Sau khi trace kết thúc, đã biết đủ thông tin |
| Tiêu chí | Tỷ lệ cố định (ví dụ 1%), ngẫu nhiên | Giữ mọi trace lỗi, mọi trace chậm, cộng vài % trace bình thường |
| Chi phí | Rất rẻ, không cần buffer | Phải **giữ tạm toàn bộ span trong bộ nhớ** tới khi trace xong |
| Bỏ sót | Đúng trace lỗi hiếm mà bạn cần nhất | Rất ít thứ quan trọng, nhưng trace dài quá timeout có thể bị cắt |

`head-based` đơn giản và phân tán được (mọi service theo cùng quyết định nhờ flag trong `traceparent`), nhưng nghịch lý là sự cố hiếm — thứ duy nhất bạn thật sự muốn xem — thì gần như chắc chắn bị bỏ.

`tail-based` cho ra tập dữ liệu hữu ích hơn nhiều, đổi lại phải có collector gom toàn bộ span của một trace về cùng một chỗ, tốn RAM và cần thiết kế cẩn thận. **OTel Collector** có sẵn processor cho việc này. Lựa chọn thực dụng: head-based tỷ lệ thấp cho traffic bình thường, cộng luật luôn giữ 100% trace có lỗi.

</details>

**14. `OpenTelemetry` giải quyết vấn đề gì so với SDK riêng của từng vendor? `OTel Collector` đóng vai trò gì trong pipeline và vì sao nên có nó?**

<details className="qa">
<summary>Xem đáp án</summary>

Trước OTel, mỗi vendor một SDK riêng (Datadog, New Relic): code đo đạc bị dính chặt vào nhà cung cấp, đổi vendor là phải sửa toàn bộ instrumentation trong mọi service — một dự án cả quý. OTel là chuẩn **vendor-neutral**: bạn đo một lần theo chuẩn chung, đổi backend chỉ là đổi cấu hình exporter, đúng như ví dụ USB-C trong bài. Kèm theo đó là **auto-instrumentation** (HTTP, Express, Postgres, Redis, gRPC) gần như không phải sửa code, và mô hình **multi-signal** thống nhất trace + metric + log.

**OTel Collector** là một tiến trình trung gian đứng giữa app và các backend, nhận qua OTLP rồi xử lý và chuyển tiếp. Nên có vì:

- **Tách app khỏi backend** — đổi Jaeger sang Tempo/Honeycomb chỉ sửa config Collector, không đụng và không deploy lại service nào.
- **Xử lý tập trung** — batching, nén, retry, giới hạn tốc độ; và quan trọng là **redact/lọc thuộc tính nhạy cảm** ở một nơi duy nhất.
- **Tail-based sampling** — cần điểm gom toàn bộ span của một trace.

</details>

**15. Phân biệt `SLI`, `SLO`, `SLA` và `error budget`. Khi error budget cạn giữa quý thì team nên làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`SLI`** (Indicator) — chỉ số đo thực tế: tỷ lệ request thành công, tỷ lệ request dưới 300ms.
- **`SLO`** (Objective) — mục tiêu nội bộ đặt trên SLI: "99.9% request thành công trong 30 ngày".
- **`SLA`** (Agreement) — cam kết hợp đồng với khách, **kèm chế tài** (hoàn tiền). SLA luôn đặt lỏng hơn SLO để còn khoảng đệm.
- **`error budget`** — phần được phép sai: `100% − SLO`. Với SLO 99.9% trong 30 ngày, ngân sách là khoảng **43 phút downtime**.

Ý nghĩa lớn nhất của error budget là biến cuộc tranh cãi "ship nhanh hay ổn định" thành một con số chung: còn ngân sách thì cứ mạnh dạn release, hết ngân sách thì độ tin cậy là ưu tiên.

Khi ngân sách cạn giữa quý, phản ứng chuẩn: **đóng băng feature release** (chỉ cho phép bugfix và việc cải thiện độ tin cậy), chạy postmortem cho các sự cố đã tiêu ngân sách, dồn sprint tới vào việc sửa nguyên nhân gốc, siết quy trình deploy (canary, rollout chậm, rollback nhanh).

</details>

**16. Thiết kế alert thế nào để tránh `alert fatigue`? Phân biệt alert theo triệu chứng (`symptom-based`, ảnh hưởng user) và theo nguyên nhân (`cause-based`) — nên đánh thức người trực bằng loại nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`alert fatigue` xảy ra khi báo động quá nhiều và phần lớn là giả: người trực bắt đầu tắt thông báo, rồi bỏ lỡ đúng cái quan trọng.

- **`symptom-based`** — báo theo thứ người dùng cảm nhận được: tỷ lệ 5xx tăng, p99 vượt ngưỡng, đơn hàng không tạo được, queue backlog tăng liên tục.
- **`cause-based`** — báo theo nguyên nhân kỹ thuật: CPU 90%, disk 80%, một pod restart.

**Chỉ đánh thức người trực bằng symptom-based.** CPU 90% mà user vẫn vui thì đó không phải sự cố — đó là hệ thống đang dùng hết tài nguyên đã trả tiền. Cause-based nên vào dashboard hoặc ticket để chẩn đoán và xử lý trong giờ hành chính.

Các nguyên tắc kèm theo:

- Mọi alert phải **hành động được** và có **runbook**; không hành động được thì xoá.
- Dùng `for:` (như ví dụ trong bài) để bỏ qua các đợt nhiễu thoáng qua.
- Đặt ngưỡng theo **SLO và error budget burn rate**, không theo cảm tính.
- Phân tầng: `page` (đánh thức) với `ticket` (giờ hành chính).

</details>

**17. Sáng thứ Hai, `p99` của một endpoint nhảy từ 200ms lên 8s nhưng `error rate` vẫn bằng 0. Bạn điều tra theo trình tự nào, dùng metric/log/trace ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

1. **Khoanh vùng bằng metrics** — p99 tăng từ lúc nào, p50 có tăng không? p50 bình thường mà chỉ p99 vọt lên nghĩa là **một nhóm nhỏ request** bị chậm chứ không phải toàn hệ.
2. **Đối chiếu mốc thời gian với thay đổi** — deploy cuối tuần, đổi config, migration, feature flag mới bật, hay một job batch chạy sáng thứ Hai.
3. **Mở trace của các request chậm** — Span tree chỉ thẳng ra thời gian nằm ở đâu: một query DB thiếu index, một lời gọi bên thứ ba đang chậm, hay chỉ là **chờ lấy connection từ pool**.
4. **Cắt lát theo thuộc tính** — chậm cho mọi user hay chỉ một tenant dữ liệu lớn? Một region? Một client version?
5. **Kiểm tra tài nguyên bằng `USE`** — CPU, memory, I/O wait, độ sâu queue, connection pool đã bão hoà chưa.
6. **Đọc log theo `traceId`** của một request chậm cụ thể để thấy chi tiết: retry, timeout, lock chờ.

Error rate bằng 0 là gợi ý mạnh: hệ thống **không hỏng, chỉ đang chờ** — thường là lock/contention ở DB, pool cạn, hay cache vừa nguội sau đợt deploy.

</details>

**18. Endpoint `/health` nên kiểm tra những gì? Vì sao không nên để health check gọi hết mọi dependency, và điều đó liên quan gì tới `cascade failure`?**

<details className="qa">
<summary>Xem đáp án</summary>

Tách hai loại:

- **Liveness** — chỉ trả lời "process còn phản hồi không". Giữ thật nông: không chạm DB, không gọi mạng. Fail → container bị restart.
- **Readiness** — "sẵn sàng nhận traffic chưa": kết nối DB dùng được, migration đã chạy, cache đã warm, config đã nạp. Fail → chỉ bị rút khỏi load balancer, không restart.

Không nên nhét mọi dependency vào health check vì hai lý do:

- **Cascade failure** — nếu health check gọi cả 6 service phụ thuộc, chỉ cần một service phụ (ví dụ dịch vụ gửi email) chập là **toàn bộ instance của bạn bị đánh dấu unhealthy và bị gỡ khỏi LB** hoặc bị restart hàng loạt, dù 95% chức năng vẫn chạy tốt. Một sự cố nhỏ ở rìa hệ thống lan thành sự cố toàn phần.
- **Vòng lặp chết** — hai service health check lẫn nhau: A chập làm B unhealthy, B unhealthy làm A unhealthy, cả hai cùng restart mãi không lên.

Nguyên tắc thực dụng: health check chỉ kiểm tra **dependency bắt buộc** (thường là DB chính), có timeout ngắn và cache kết quả vài giây để không tự tạo tải.

</details>
