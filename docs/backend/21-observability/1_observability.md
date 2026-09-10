---
sidebar_position: 1
title: "1. Observability: Metrics, Logs, Tracing"
---

# Observability: Metrics, Logs, Tracing

Observability là khả năng "nhìn thấy" được điều gì đang xảy ra bên trong hệ thống của bạn khi nó chạy thật. Bài này giới thiệu ba trụ cột chính: metrics (số liệu để theo dõi xu hướng và cảnh báo), logs (ghi lại sự kiện để debug) và tracing (theo dấu một request đi qua nhiều service), cùng các công cụ phổ biến như Prometheus, Grafana và OpenTelemetry. Thiết lập observability tốt giúp bạn phát hiện và xử lý sự cố nhanh khi production gặp vấn đề.

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

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi đối chiếu lại với nội dung phía trên.

1. Phân biệt `monitoring` và `observability`. Vì sao có đầy đủ dashboard mà đội vẫn có thể "mù" trước một sự cố chưa từng gặp?
2. Ba trụ cột `metrics`, `logs`, `traces` khác nhau ở đâu? Với sự cố "checkout chậm", bạn dùng cái nào trước, cái nào sau và để trả lời câu hỏi gì?
3. Vì sao Prometheus chọn mô hình `pull` thay vì `push`? Mô hình pull xử lý ra sao với job chạy ngắn rồi tắt (`Pushgateway`)?
4. Phân biệt `counter`, `gauge`, `histogram` và `summary`. Mỗi loại dùng cho chỉ số nào, và vì sao `histogram` cần định nghĩa `buckets` trước?
5. Vì sao `p95`/`p99` phản ánh trải nghiệm user tốt hơn giá trị trung bình? Cho một ví dụ average trông đẹp nhưng user vẫn khổ.
6. Giải thích `RED method` và `USE method`. Với một API service và một node hạ tầng, bạn sẽ track chính xác những chỉ số nào?
7. `cardinality` của label là gì? Vì sao gắn `userId` hay `requestId` làm label Prometheus là thảm hoạ, và thông tin đó nên nằm ở đâu?
8. Vì sao nên log dạng `JSON` có cấu trúc và ghi ra `stdout` thay vì tự ghi file? Liên hệ với nguyên tắc `12-factor` và với hạ tầng container.
9. `correlation ID` / `requestId` giải quyết vấn đề gì? Bạn truyền nó qua nhiều service, qua job queue và qua background worker bằng cách nào?
10. Chọn `log level` cho production thế nào? Log quá nhiều gây hậu quả gì về chi phí lưu trữ và khả năng tìm kiếm khi sự cố?
11. Những dữ liệu nào tuyệt đối không được log (`PII`, password, số thẻ, token)? Bạn chặn bằng cơ chế gì (`redact`) và chính sách `retention` nên ra sao theo `GDPR`/`PCI-DSS`?
12. Mô tả cấu trúc một trace: `trace_id`, `span_id`, `parent_span_id`, `attributes`. `context propagation` giữa các service diễn ra thế nào (header `traceparent`)?
13. `sampling` trong tracing là gì? So sánh `head-based` và `tail-based sampling` — mỗi cách bỏ sót gì và tốn kém ở đâu?
14. `OpenTelemetry` giải quyết vấn đề gì so với SDK riêng của từng vendor? `OTel Collector` đóng vai trò gì trong pipeline và vì sao nên có nó?
15. Phân biệt `SLI`, `SLO`, `SLA` và `error budget`. Khi error budget cạn giữa quý thì team nên làm gì?
16. Thiết kế alert thế nào để tránh `alert fatigue`? Phân biệt alert theo triệu chứng (`symptom-based`, ảnh hưởng user) và theo nguyên nhân (`cause-based`) — nên đánh thức người trực bằng loại nào?
17. Sáng thứ Hai, `p99` của một endpoint nhảy từ 200ms lên 8s nhưng `error rate` vẫn bằng 0. Bạn điều tra theo trình tự nào, dùng metric/log/trace ra sao?
18. Endpoint `/health` nên kiểm tra những gì? Vì sao không nên để health check gọi hết mọi dependency, và điều đó liên quan gì tới `cascade failure`?
