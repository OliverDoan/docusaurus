---
sidebar_position: 1
title: "1. Observability: Metrics, Logs, Tracing"
---

# Observability: Metrics, Logs, Tracing

Observability là khả năng "nhìn thấy" được điều gì đang xảy ra bên trong hệ thống của bạn khi nó chạy thật. Bài này giới thiệu ba trụ cột chính: metrics (số liệu để theo dõi xu hướng và cảnh báo), logs (ghi lại sự kiện để debug) và tracing (theo dấu một request đi qua nhiều service), cùng các công cụ phổ biến như Prometheus, Grafana và OpenTelemetry. Thiết lập observability tốt giúp bạn phát hiện và xử lý sự cố nhanh khi production gặp vấn đề.

---

## Mục lục

- [3 pillars of Observability](#3-pillars-of-observability)
- [Metrics + Prometheus + Grafana](#metrics--prometheus--grafana)
- [Logging strategy](#logging-strategy)
- [Distributed Tracing](#distributed-tracing)
- [OpenTelemetry](#opentelemetry)
- [Tools](#tools)

---

## 3 pillars of Observability

| Pillar | Format | Mục đích |
|--------|--------|---------|
| **Metrics** | Number aggregated | Trend, alert ("CPU 95%") |
| **Logs** | Text event | Debug specific event ("user X login fail") |
| **Traces** | Distributed call graph | Latency root cause |

3 combined → biết **system đang gì**, **at where**, **why**.

---

## Metrics + Prometheus + Grafana

**Prometheus** — pull-based metric store, time-series.

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
