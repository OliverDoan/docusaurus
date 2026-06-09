---
sidebar_position: 1
title: "1. Monolith, Microservices, Serverless"
---

# Monolith, Microservices, Serverless

Đây là các kiểu kiến trúc để tổ chức một ứng dụng backend: gộp tất cả vào một khối (monolith), chia nhỏ thành nhiều dịch vụ riêng (microservices), hay chạy theo từng hàm khi cần (serverless). Hiểu chúng quan trọng vì mỗi cách có ưu nhược điểm riêng, chọn đúng giúp tiết kiệm công sức và dễ mở rộng về sau. Bài này so sánh các kiểu để bạn biết khi nào nên chọn cái nào; phần chi tiết nằm bên dưới.

---

## Mục lục

- [Monolith](#monolith)
- [Microservices](#microservices)
- [Serverless](#serverless)
- [SOA và Service Mesh](#soa-và-service-mesh)
- [Twelve Factor Apps](#twelve-factor-apps)
- [Khi nào chọn cái nào?](#khi-nào-chọn-cái-nào)

---

## Monolith

**1 codebase + 1 deploy unit**. Truyền thống, đơn giản.

```
[Load Balancer] → [Monolith App] → [DB]
                       ↓
                 [auth, users, products, orders, payments...]
                       (cùng process)
```

**Ưu**:

- **Simple** dev + deploy.
- **Easy debug** — stack trace + 1 codebase.
- **Transaction native** — DB transaction qua module.
- **Less infra** — 1 server đủ.
- **Faster** local dev (no network call internal).

**Nhược**:

- Scale **toàn app** — không scale module riêng.
- Big team **conflict** trên cùng codebase.
- Deploy = redeploy hết.
- Tech stack **single** (1 ngôn ngữ, 1 framework).

**Phù hợp**:

- Startup early stage.
- Team < 20 dev.
- App < 100k LOC.

:::info[Phân tích]

**"Modular monolith"** — modern compromise:

```
src/
├── modules/
│   ├── users/       # bounded context
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   ├── orders/
│   ├── payments/
│   └── shared/
└── app.ts
```

Mỗi module có:

- Boundary rõ.
- Interface (public API).
- Database table riêng.
- Own dependency.

Lợi ích:

- Đơn giản như monolith.
- Scale code organization tốt.
- Migrate sang microservice **dễ dàng** sau (mỗi module → 1 service).

DDD (Domain-Driven Design) + modular monolith = pattern recommended 2026
cho startup.

:::

---

## Microservices

**Nhiều service nhỏ**, deploy độc lập, giao tiếp qua network.

```
[API Gateway]
    ↓
├─ [User Service] → [User DB]
├─ [Order Service] → [Order DB]
├─ [Payment Service] → [Payment DB]
└─ [Notification Service] → [Email API]

         ↕ (sync HTTP/gRPC)
         ↕ (async via Kafka/RabbitMQ)
```

**Ưu**:

- **Independent deploy** — release fast.
- **Scale per service** — chỉ scale bottleneck.
- **Tech diversity** — service Go, service Python.
- **Team autonomy** — own service end-to-end.
- **Fault isolation** — 1 service crash, others alive.

**Nhược**:

- **Complexity** — distributed system khó.
- **Network latency** — service call slow hơn function call.
- **Data consistency** — không transaction cross-service.
- **Operational overhead** — k8s, monitoring, tracing mọi service.
- **Debug khó** — trace request qua nhiều service.

**Phù hợp**:

- Team **100+ dev**.
- App **scale rất lớn**.
- Tech stack **đa dạng** cần.
- Compliance — isolation strict.

:::warning[Cần lưu ý]

**"Microservices premium"** — chi phí ẩn:

- DevOps team dedicated (k8s, CI/CD multi-service).
- Service mesh (Istio, Linkerd) cho mTLS, routing.
- Distributed tracing (Jaeger, Tempo).
- Service discovery.
- Circuit breaker.
- Saga pattern cho transaction.
- Event sourcing đôi khi.

→ **80% startup không cần microservices**. Monolith đủ đến hàng triệu user.

Famous quote: "*If you can't build a monolith, what makes you think
microservices are the answer?*" — Simon Brown.

Migrate khi:

- Team > 20 dev và conflict.
- Module scale rất khác nhau.
- Compliance buộc isolation.

:::

---

## Serverless

**FaaS (Function as a Service)** — code chạy on-demand, không quản server.

```
[HTTP Request] → [Function (cold start ~ms)] → [DB/Service]
                  ↓
            tự scale 0 → 10000 instance
```

**Provider**:

- **AWS Lambda** — phổ biến nhất.
- **Vercel Functions**.
- **Cloudflare Workers** — edge.
- **GCP Cloud Functions**.
- **Azure Functions**.

**Ưu**:

- **Pay-per-use** — không tính khi idle.
- **Auto scale** — instant scale to traffic.
- **No ops** — provider handle infra.
- **Fast deploy**.

**Nhược**:

- **Cold start** — first request slow (Java/Node 1-3s, Go ~50ms).
- **Time limit** — Lambda 15 min, Vercel 60s.
- **Stateless** — no persistent connection (DB pooling tricky).
- **Vendor lock-in**.
- **Debug** harder (distributed log).
- **Cost** unpredictable nếu traffic spike.

**Phù hợp**:

- API có traffic spike (event-driven).
- Cron job, scheduled task.
- Webhook handler.
- Light API.

**Không phù hợp**:

- App long-running connection (WebSocket).
- Heavy compute > 15 min.
- Đụng DB nhiều (cold start + pool issue).

```ts
// AWS Lambda (Node.js)
export const handler = async (event) => {
  const body = JSON.parse(event.body);

  const user = await db.user.create({ data: body });

  return {
    statusCode: 201,
    body: JSON.stringify(user),
  };
};
```

```ts
// Cloudflare Workers
export default {
  async fetch(request, env) {
    const data = await env.KV.get("key");
    return new Response(data);
  },
};
```

---

## SOA và Service Mesh

**SOA (Service-Oriented Architecture)** — predecessor của microservices.

- Service lớn hơn microservice.
- Communicate qua **ESB (Enterprise Service Bus)**.
- XML/SOAP truyền thống.

Dần dần lose ground vào microservices (lightweight, JSON, HTTP).

**Service Mesh** — infrastructure layer cho microservice:

```
[Service A] ↔ [Sidecar Proxy] ↔ [Sidecar Proxy] ↔ [Service B]
              (Envoy/Linkerd)    (Envoy/Linkerd)
```

Sidecar handle:

- **mTLS** — encrypt service-to-service.
- **Retry, timeout, circuit breaker**.
- **Load balancing** smart.
- **Tracing** auto-inject.
- **Canary, traffic split** declarative.

**Phổ biến**:

- **Istio** — mature, feature-rich.
- **Linkerd** — simpler, Rust.
- **Consul Connect** — HashiCorp.
- **Cilium** — eBPF-based, modern.

Service mesh **chỉ cần** khi đã microservice scale lớn. Project nhỏ →
overkill.

---

## Twelve Factor Apps

**12 principles** cho cloud-native app:

1. **Codebase** — 1 codebase tracked Git, nhiều deploy.
2. **Dependencies** — declare explicit (package.json, requirements.txt).
3. **Config** — env variable, không hardcode.
4. **Backing services** — DB, cache, queue như attached resource (URL).
5. **Build, release, run** — strict separation.
6. **Processes** — stateless, share-nothing.
7. **Port binding** — self-contained, expose via port.
8. **Concurrency** — scale out via process model.
9. **Disposability** — fast startup + graceful shutdown.
10. **Dev/prod parity** — keep similar.
11. **Logs** — stdout, không file.
12. **Admin processes** — one-off task qua script + same env.

Pattern này guideline cho **Docker + Kubernetes + 12-factor** stack hiện đại.

[12factor.net](https://12factor.net) — đọc đầy đủ.

---

## Khi nào chọn cái nào?

```
Team size?

├─ 1-5 dev → Monolith
├─ 5-20 dev → Modular Monolith
├─ 20-100 dev → Microservices (nếu thực sự cần)
└─ 100+ dev → Microservices + Service Mesh

Traffic pattern?

├─ Steady → Monolith / Microservice container
├─ Spike / event-driven → Serverless
└─ Low + free → Serverless free tier

Use case?

├─ MVP, startup → Monolith
├─ Multi-team, scale lớn → Microservices
├─ Internal tool, CRUD → Monolith
└─ AI / processing pipeline → Serverless + queue
```

:::tip[Mẹo]

**Modern architecture stack 2026** cho startup:

```
[Frontend: Next.js + Vercel]
    ↓
[Backend: Node.js + Fastify/Hono]
    (Modular monolith)
    ↓
[DB: PostgreSQL (Neon/Supabase)]
[Cache: Redis (Upstash)]
[Queue: BullMQ / Inngest]
[Search: Meilisearch / Postgres FTS]
[Storage: S3 / Cloudflare R2]
[Email: Resend / Postmark]
[Auth: Clerk / Better Auth]
[Observability: Sentry + Vercel Analytics]
```

Đa số managed, ít ops, scale to millions before refactor.

Khi thực sự cần microservices, **extract module → service** dần dần. Đừng
start với 20 microservice.

:::

:::info[Phân tích]

**Lesson từ industry 2020-2026**:

- **Amazon Prime Video** moved **microservices → monolith** for cost saving.
- **Twitter (X)** simplified service count.
- **Segment** consolidated microservices.
- **Shopify** stays modular monolith.

Trend: "**Right-sized architecture**" — không over-engineer. Microservice
khi **really** cần, không vì hype.

Modular monolith → microservice migration **dễ hơn** ngược lại
(microservice → monolith tốn rất nhiều).

→ Start simple, scale architecture theo team + load thực tế.

:::
