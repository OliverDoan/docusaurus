---
sidebar_position: 12
title: "12. Microservices Architecture"
---

# Microservices Architecture

> *Microservices không phải đích đến — nó là một trade-off. Interviewer hỏi chủ đề này không phải để xem bạn thuộc buzzword, mà để xem bạn hiểu cái giá của distributed system và biết khi nào KHÔNG nên dùng microservices. Câu trả lời senior luôn bắt đầu bằng "tuỳ ngữ cảnh" kèm tiêu chí cụ thể.*

---

## Câu 18: Microservices và Monolith khác nhau như thế nào? Khi nào nên migrate? `[Intermediate]`

### Câu hỏi

> Microservices và Monolith khác nhau như thế nào? Khi nào một team nên cân nhắc migrate từ monolith sang microservices, và migrate bằng cách nào cho an toàn?

### Giải thích lý thuyết

**Monolith**: toàn bộ application là **một deployable unit** — một codebase, một process, một database. **Microservices**: hệ thống được tách thành nhiều service nhỏ, mỗi service **own một business capability**, deploy độc lập, giao tiếp qua network (HTTP/gRPC/message queue).

| Tiêu chí | Monolith | Microservices |
| -------- | -------- | ------------- |
| **Deploy** | 1 unit duy nhất — sửa 1 dòng cũng deploy cả app | Mỗi service deploy độc lập, release nhanh, blast radius nhỏ |
| **Scale** | Scale cả app (kể cả phần không cần) | Scale từng service theo nhu cầu (chỉ scale search, không scale billing) |
| **Tech stack** | Một stack thống nhất | Mỗi service tự chọn (polyglot) — nhưng nên hạn chế để dễ vận hành |
| **Data ownership** | Một database chung, JOIN thoải mái | **Database-per-service** — service khác chỉ truy cập qua API |
| **Complexity** | Đơn giản vận hành, phức tạp dần trong code | Code mỗi service đơn giản, **phức tạp dồn vào hạ tầng** (network, deploy, debug) |
| **Team** | Phù hợp team nhỏ, cùng codebase | Mỗi team own trọn vẹn vài service ("you build it, you run it") |
| **Transaction** | ACID transaction trong 1 DB | Distributed transaction — phải dùng Saga, eventual consistency |
| **Debug/Trace** | Stack trace trong 1 process | Cần distributed tracing, correlation ID, log tập trung |

**Insight quan trọng nhất**: microservices giải quyết vấn đề **TỔ CHỨC** nhiều hơn vấn đề kỹ thuật. Theo **Conway's Law**, kiến trúc hệ thống phản chiếu cấu trúc giao tiếp của tổ chức — khi 50 dev cùng commit vào một monolith, họ dẫm chân nhau: merge conflict liên tục, release train chờ nhau, một team làm chậm khoá deploy của cả công ty. Microservices cho phép mỗi team **deploy độc lập với tốc độ riêng**. Nếu team bạn chỉ 5 người, bạn không có vấn đề tổ chức để giải — microservices lúc đó chỉ thêm chi phí.

**Chi phí phải trả khi sang microservices** (interviewer rất thích nghe phần này):
- **Distributed transaction**: mất ACID xuyên service, phải chấp nhận eventual consistency + Saga.
- **Network latency & partial failure**: function call (nanosecond, đáng tin) thành network call (millisecond, có thể fail bất kỳ lúc nào) — phải có timeout, retry, circuit breaker.
- **Observability**: bắt buộc đầu tư logging tập trung, distributed tracing (OpenTelemetry), metrics — không có thì debug như mò kim đáy bể.
- **DevOps maturity**: CI/CD per service, container orchestration (Kubernetes), service discovery, config management — cần platform team thực thụ.

**Modular monolith — middle ground** đáng nói: vẫn deploy 1 unit, nhưng code chia thành **module có boundary rõ ràng** (giao tiếp qua interface nội bộ, không import chéo, có thể tách schema DB theo module). Được phần lớn lợi ích về tổ chức code, không tốn chi phí distributed system. Khi cần, tách module thành service dễ hơn nhiều vì boundary đã sạch. Shopify, Basecamp là ví dụ nổi tiếng vận hành modular monolith ở quy mô lớn.

**Khi nào nên migrate** — tín hiệu thực tế:
- Team vượt **~20-30 dev** cùng làm một codebase, velocity giảm rõ rệt.
- **Deploy block nhau**: release phải xếp hàng, một bug của team A rollback cả release của team B.
- **Scale lệch nhau**: một phần hệ thống cần scale gấp 100 lần phần còn lại (ví dụ search/feed vs admin).
- Một phần hệ thống cần tech stack/SLA hoàn toàn khác.

**Migrate an toàn — Strangler Fig Pattern**: không rewrite big-bang. Đặt một **facade/proxy** (thường là API Gateway) trước monolith, tách dần từng capability thành service mới, route traffic của capability đó sang service mới, phần còn lại vẫn vào monolith. Monolith "bị bóp nghẹt" dần như cây strangler fig — đến khi rỗng thì gỡ bỏ. Mỗi bước đều có thể rollback, business không bị gián đoạn.

### Thiết kế minh hoạ

```text
MONOLITH                          MICROSERVICES
┌───────────────────────┐         ┌─────────┐ ┌─────────┐ ┌──────────┐
│  ┌──────┐ ┌────────┐  │         │ Orders  │ │ Payment │ │ Shipping │
│  │Orders│ │Payment │  │         │ Service │ │ Service │ │ Service  │
│  └──────┘ └────────┘  │   →     └────┬────┘ └────┬────┘ └────┬─────┘
│  ┌────────┐ ┌──────┐  │              │           │           │
│  │Shipping│ │Users │  │         ┌────▼───┐  ┌────▼───┐  ┌────▼────┐
│  └────────┘ └──────┘  │         │Orders  │  │Payment │  │Shipping │
│  ┌─────────────────┐  │         │  DB    │  │  DB    │  │  DB     │
│  │   Shared DB     │  │         └────────┘  └────────┘  └─────────┘
│  └─────────────────┘  │         (database-per-service — không JOIN chéo)
└───────────────────────┘

STRANGLER FIG — migrate từng bước, không big-bang rewrite:

  Bước 1                Bước 2                     Bước 3 (đích)
┌────────┐           ┌─────────┐                ┌─────────┐
│ Client │           │ Client  │                │ Client  │
└───┬────┘           └────┬────┘                └────┬────┘
    │                ┌────▼────────┐            ┌────▼────────┐
    │                │   Facade    │            │   Gateway   │
    │                │  (Gateway)  │            └─┬────┬────┬─┘
┌───▼────────┐       └──┬───────┬──┘              │    │    │
│  Monolith  │          │       │ /orders/*      ┌▼─┐ ┌▼─┐ ┌▼─┐
│ (tất cả)   │     ┌────▼───┐ ┌─▼────────┐       │S1│ │S2│ │S3│
└────────────┘     │Monolith│ │ Orders   │       └──┘ └──┘ └──┘
                   │(còn lại)│ │ Service  │      Monolith đã rỗng
                   └────────┘ └──────────┘       → gỡ bỏ
```

```typescript
// Strangler Fig ở tầng gateway — route dần từng capability (pseudo-code)
const routes = [
  // Đã tách: orders đi sang service mới
  { path: "/api/orders/*", target: "http://orders-service:8080" },
  // Chưa tách: mọi thứ còn lại vẫn vào monolith
  { path: "/*", target: "http://legacy-monolith:3000" },
];

// Mỗi capability tách xong chỉ cần thêm 1 route — rollback = xoá route đó
// Có thể canary: 10% traffic sang service mới, 90% giữ monolith để so sánh
```

### Đáp án mẫu

> "Monolith là một deployable unit duy nhất — đơn giản vận hành, ACID transaction, nhưng khi team đông thì deploy block nhau và scale phải scale cả cục. Microservices tách theo business capability, mỗi service deploy độc lập, own database riêng — nhưng cái giá là distributed transaction, network latency, partial failure, và phải đầu tư observability lẫn DevOps. Điểm em luôn nhấn mạnh: microservices giải quyết vấn đề **tổ chức** nhiều hơn kỹ thuật — theo Conway's Law, nó cho phép nhiều team deploy độc lập không dẫm chân nhau. Nên em chỉ khuyên migrate khi có tín hiệu rõ: team trên 20-30 dev, release phải xếp hàng chờ nhau, hoặc scale lệch nhau quá lớn. Với team nhỏ, em prefer **modular monolith** — boundary sạch trong một deploy unit, sau này tách dễ. Khi migrate, em dùng Strangler Fig: đặt gateway trước monolith, tách dần từng capability, route traffic sang service mới, không bao giờ rewrite big-bang."

---

## Câu 19: API Gateway là gì? Vai trò và tính năng chính? `[Intermediate]`

### Câu hỏi

> API Gateway là gì trong kiến trúc microservices? Nó đảm nhận những vai trò gì, và có những anti-pattern nào cần tránh?

### Giải thích lý thuyết

API Gateway là **single entry point** của hệ thống — mọi request từ client đi qua gateway trước khi đến các service phía sau. Không có gateway, client phải biết địa chỉ từng service, tự lo authentication với từng service, và mỗi service phải tự implement rate limiting, TLS... — vừa trùng lặp vừa lộ internal topology ra ngoài.

**Các tính năng chính**:

| Tính năng | Vai trò |
| --------- | ------- |
| **Routing** | Map URL/path → service phía sau (`/api/orders/*` → orders-service); ẩn internal topology khỏi client |
| **AuthN/AuthZ tập trung** | Verify JWT/API key **một lần** tại gateway, forward identity (header/claims) xuống service — service không phải tự verify token với IdP |
| **Rate limiting & throttling** | Chặn abuse, bảo vệ service phía sau theo user/API key/IP — đặt ở cửa ngõ là hiệu quả nhất |
| **Request/Response transform** | Đổi format, thêm/xoá header, version translation (v1 client → v2 service) |
| **Aggregation** | Gộp nhiều call backend thành 1 response cho client — giảm round-trip, đặc biệt quan trọng với mobile |
| **TLS termination** | Decrypt HTTPS tại gateway, nội bộ dùng kết nối riêng (hoặc mTLS qua service mesh) |
| **Caching** | Cache response cho endpoint read-heavy ngay tại edge |
| **Logging/Metrics** | Điểm quan sát tập trung: access log, latency, error rate cho mọi traffic vào hệ thống |

**BFF (Backend For Frontend)** — biến thể quan trọng: thay vì một gateway chung cho mọi client, mỗi **loại client có gateway riêng** — BFF cho web, BFF cho mobile. Lý do: nhu cầu khác nhau rõ rệt — mobile cần payload gọn, ít round-trip (mạng yếu, pin); web cần data đầy đủ hơn. Một gateway chung phục vụ cả hai sẽ phình to dần với logic `if (clientType === 'mobile')`. Mỗi BFF do chính team frontend tương ứng own — họ tự quyết shape của response.

**Anti-pattern lớn nhất — gateway thành "monolith logic"**: gateway bắt đầu chỉ route, rồi dần dần ai đó nhét business logic vào ("tiện thể check ở gateway luôn") — validation nghiệp vụ, tính toán, orchestration phức tạp. Hậu quả: gateway thành single point of change, mọi team đều phải sửa nó, deploy gateway thành nút cổ chai — đúng cái vấn đề microservices sinh ra để giải. **Nguyên tắc**: gateway chỉ chứa **cross-cutting concern** (auth, rate limit, routing, logging); business logic thuộc về service. Aggregation đơn giản thì được, orchestration nghiệp vụ thì không.

Lưu ý khác: gateway là **single point of failure** — phải deploy nhiều replica sau load balancer; và nó cộng thêm một network hop — thường vài ms, chấp nhận được so với lợi ích.

**Công cụ phổ biến**: **Kong** (plugin ecosystem mạnh, self-host), **AWS API Gateway** (managed, tích hợp Lambda/Cognito), **nginx** (nhẹ, quen thuộc, tự build tính năng), ngoài ra có Apigee, Traefik, Envoy Gateway.

**Insight phỏng vấn**: phân biệt được API Gateway (north-south — traffic từ ngoài vào) với Service Mesh (east-west — traffic giữa các service) là điểm cộng lớn, dẫn thẳng sang câu service mesh.

### Thiết kế minh hoạ

```text
                  ┌──────────┐   ┌──────────┐
                  │ Web App  │   │Mobile App│
                  └────┬─────┘   └────┬─────┘
                       │              │
                ┌──────▼─────┐  ┌─────▼──────┐     BFF pattern:
                │  Web BFF   │  │ Mobile BFF │     mỗi client một gateway,
                └──────┬─────┘  └─────┬──────┘     team frontend tự own
                       └──────┬───────┘
                ┌─────────────▼──────────────┐
                │        API GATEWAY         │
                │ • AuthN/AuthZ (verify JWT) │
                │ • Rate limiting            │
                │ • Routing / TLS / Logging  │
                └──┬──────────┬──────────┬───┘
                   │          │          │
              ┌────▼───┐ ┌────▼───┐ ┌────▼────┐
              │ Orders │ │ Users  │ │ Catalog │
              └────────┘ └────────┘ └─────────┘
```

```typescript
// BFF mobile — aggregation: 1 request từ app = 3 call nội bộ (pseudo-code)
// Mobile chỉ cần 1 round-trip thay vì 3 (mạng di động latency cao)
app.get("/mobile/home", authenticate, rateLimit, async (req, res) => {
  const userId = req.user.id; // gateway đã verify JWT, forward identity

  // Gọi song song các service nội bộ
  const [profile, orders, recommendations] = await Promise.all([
    usersService.getProfile(userId),
    ordersService.getRecent(userId, { limit: 3 }),
    catalogService.getRecommendations(userId, { limit: 5 }),
  ]);

  // Trim payload cho mobile — chỉ field cần thiết
  res.json({
    user: { name: profile.name, avatar: profile.avatarThumb },
    recentOrders: orders.map((o) => ({ id: o.id, status: o.status })),
    recommendations: recommendations.map((p) => ({
      id: p.id, name: p.name, thumb: p.imageThumb,
    })),
  });
});

// ❌ Anti-pattern: business logic trong gateway
// if (order.total > 1000 && user.tier !== "gold") applyDiscount(...)
// → logic nghiệp vụ này thuộc về orders-service, KHÔNG thuộc gateway
```

### Đáp án mẫu

> "API Gateway là single entry point — mọi request từ client đi qua nó trước khi vào các service. Vai trò chính là gom các cross-cutting concern về một chỗ: routing và ẩn internal topology, verify JWT tập trung rồi forward identity xuống service, rate limiting chặn abuse ngay cửa ngõ, TLS termination, caching và logging tập trung. Với mobile, em hay dùng thêm aggregation — gộp nhiều call backend thành một response để giảm round-trip. Khi web và mobile cần shape data khác nhau, em tách theo BFF pattern — mỗi loại client một gateway riêng do chính team frontend own, tránh một gateway chung phình to với if-else theo client. Anti-pattern em luôn cảnh giác là gateway biến thành monolith logic: ai cũng 'tiện thể' nhét business logic vào, nó thành single point of change và nút cổ chai deploy — nguyên tắc của em là gateway chỉ giữ cross-cutting concern, nghiệp vụ thuộc về service. Tooling thì em từng dùng Kong và AWS API Gateway, đơn giản hơn thì nginx cũng đủ."

---

## Câu 20: Service Mesh là gì, tại sao cần trong microservices? `[Advanced]`

### Câu hỏi

> Service Mesh là gì? Nó giải quyết vấn đề gì trong microservices, khác API Gateway thế nào, và khi nào thì CHƯA cần dùng?

### Giải thích lý thuyết

Khi số service tăng, các vấn đề **service-to-service** lặp lại ở mọi service: retry, timeout, circuit breaking, mã hoá mTLS, metrics, tracing. Cách "cổ điển" là mỗi service tự implement bằng thư viện (Hystrix, resilience4j...) — nhưng phải làm lại cho **mỗi ngôn ngữ**, mỗi lần upgrade phải redeploy mọi service, và không có gì đảm bảo team nào cũng làm đúng.

**Service Mesh** là một **infrastructure layer** tách toàn bộ logic giao tiếp đó **ra khỏi application code**:

- **Sidecar proxy**: mỗi instance của service được "cắm kèm" một proxy (phổ biến nhất là **Envoy**) chạy cạnh nó (cùng pod trong Kubernetes). **Mọi traffic vào/ra service đều bị sidecar intercept** — app cứ gọi `http://orders` như bình thường, sidecar lo phần còn lại.
- **Data plane vs Control plane**:
  - **Data plane** = tập hợp các sidecar proxy — nơi traffic thực sự chạy qua, thực thi policy.
  - **Control plane** (ví dụ **Istiod** của Istio) — không đụng traffic, chỉ **phân phối config/policy/certificate** xuống các sidecar: "service A được gọi B", "retry tối đa 3 lần", "10% traffic sang v2".

**Tính năng chính — tất cả KHÔNG cần sửa code app** (đây là giá trị cốt lõi):

| Tính năng | Mô tả |
| --------- | ----- |
| **mTLS tự động** | Sidecar tự mã hoá + xác thực 2 chiều mọi kết nối service-to-service; control plane tự cấp phát & rotate certificate — zero-trust network mà dev không viết dòng nào |
| **Resilience** | Retry, timeout, circuit breaking khai báo bằng config YAML — đồng nhất mọi ngôn ngữ |
| **Traffic splitting** | Canary release: route 90/10 giữa v1/v2, tăng dần theo metric; A/B theo header |
| **Observability** | Sidecar thấy mọi request → tự sinh metrics (latency, error rate), distributed tracing, service dependency graph — đồng nhất toàn hệ thống |
| **Policy** | Authorization L7: "chỉ orders-service được gọi payment-service endpoint /charge" |

**Khác API Gateway — câu hỏi phân loại senior**:

| Tiêu chí | API Gateway | Service Mesh |
| -------- | ----------- | ------------ |
| **Loại traffic** | **North-south** — từ client bên ngoài vào hệ thống | **East-west** — giữa các service nội bộ |
| **Vị trí** | Một điểm ở rìa (edge) | Phân tán — sidecar cạnh mọi service |
| **Quan tâm** | Auth client, rate limit public API, API contract | mTLS nội bộ, resilience, traffic shaping nội bộ |

Hai thứ **bổ trợ nhau**, không thay thế nhau — hệ thống lớn thường có cả hai (và gateway có thể chính là một Envoy ở edge).

**Công cụ**: **Istio** (đầy đủ tính năng nhất, dùng Envoy, learning curve cao), **Linkerd** (nhẹ, đơn giản, proxy riêng viết bằng Rust, dễ vận hành hơn). Ngoài ra có Consul Connect, AWS App Mesh.

**Khi nào CHƯA cần — phần ăn điểm**: service mesh có chi phí thật: thêm latency mỗi hop (sidecar xử lý ~1ms x 2 đầu), tốn CPU/memory cho hàng loạt proxy, và độ phức tạp vận hành đáng kể (debug Istio config là một nghề riêng). **Dưới ~10 service là overkill** — lúc đó retry/timeout bằng thư viện, mTLS bằng network policy hoặc đơn giản là private network là đủ. Mesh đáng giá khi: hàng chục service trở lên, đa ngôn ngữ, yêu cầu zero-trust/compliance, hoặc cần canary có kiểm soát ở quy mô lớn. Một lựa chọn trung gian đang phổ biến là **sidecar-less mesh** (Istio ambient mode) để giảm overhead.

### Thiết kế minh hoạ

```text
                      CONTROL PLANE (Istiod)
                 phân phối config, policy, certificate
                ┌────────────┬────────────┬────────────┐
                │ (config)   │ (config)   │ (config)   │
                ▼            ▼            ▼            
┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐
│  Pod: orders      │  │  Pod: payment     │  │  Pod: inventory   │
│ ┌──────┐ ┌──────┐ │  │ ┌──────┐ ┌──────┐ │  │ ┌──────┐ ┌──────┐ │
│ │ App  │↔│Sidecar│◄┼──┼►│Sidecar│↔│ App │ │  │ │ App  │↔│Sidecar││
│ └──────┘ │(Envoy)│ │  │ │(Envoy)│ └─────┘ │  │ └──────┘ │(Envoy)││
│          └──────┘ │  │ └───────┘          │  │          └──────┘│
└───────────────────┘  └───────────────────┘  └───────────────────┘
        └────────── mTLS tự động ──────────┘
   App chỉ gọi http://payment — sidecar lo encrypt, retry,
   circuit break, metrics. DATA PLANE = các sidecar.
```

```yaml
# Istio VirtualService — canary 90/10, KHÔNG sửa một dòng code app nào
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: payment
spec:
  hosts: ["payment"]
  http:
    - retries:
        attempts: 3                    # retry tự động tại sidecar
        perTryTimeout: 2s
      route:
        - destination: { host: payment, subset: v1 }
          weight: 90                   # 90% traffic vào bản ổn định
        - destination: { host: payment, subset: v2 }
          weight: 10                   # 10% canary — tăng dần nếu metric tốt
---
# DestinationRule — circuit breaking khai báo bằng config
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: payment
spec:
  host: payment
  trafficPolicy:
    outlierDetection:                  # instance lỗi liên tục → eject khỏi pool
      consecutive5xxErrors: 5
      interval: 10s
      baseEjectionTime: 30s
```

### Đáp án mẫu

> "Service mesh là infrastructure layer cho giao tiếp service-to-service: mỗi service được cắm kèm một sidecar proxy — thường là Envoy — intercept mọi traffic vào ra. Data plane là các sidecar nơi traffic chạy qua, control plane như Istiod chỉ phân phối config và certificate xuống. Giá trị cốt lõi là mọi tính năng — mTLS tự động với certificate rotation, retry, timeout, circuit breaking, traffic splitting cho canary, metrics và tracing đồng nhất — đều làm ở tầng hạ tầng, **không sửa một dòng code app nào**, và đồng nhất cho mọi ngôn ngữ. Nó khác API Gateway ở loại traffic: gateway lo north-south từ client bên ngoài vào, mesh lo east-west giữa các service nội bộ — hai cái bổ trợ nhau. Về tooling em biết Istio mạnh nhất nhưng nặng, Linkerd nhẹ và dễ vận hành hơn. Tuy nhiên em luôn nói rõ trade-off: sidecar thêm latency và chi phí vận hành đáng kể — dưới khoảng 10 service thì mesh là overkill, dùng thư viện resilience và private network là đủ; mesh chỉ đáng khi hệ thống hàng chục service, đa ngôn ngữ hoặc cần zero-trust."

---

## Câu 21: Circuit Breaker Pattern là gì? Ngăn cascading failures như thế nào? `[Advanced]`

### Câu hỏi

> Circuit Breaker Pattern là gì? Cascading failure xảy ra như thế nào và circuit breaker ngăn nó ra sao? Phân biệt với retry và các pattern resilience đi kèm.

### Giải thích lý thuyết

**Cascading failure — kịch bản domino kinh điển**: service B (payment) chậm vì DB quá tải. Service A (orders) gọi B và **chờ** — mỗi request treo chiếm một thread/connection của A. Traffic vẫn đổ vào, request mới tiếp tục chờ B → **thread pool của A cạn** → A không phục vụ nổi cả những request KHÔNG liên quan đến B → A "chết theo" → service C gọi A cũng bắt đầu treo... **một service chậm kéo sập cả hệ thống**. Điểm tinh tế: service **chậm** nguy hiểm hơn service **chết hẳn** — chết hẳn thì fail nhanh, còn chậm thì giữ tài nguyên của caller.

**Circuit breaker** hoạt động như cầu dao điện — bọc quanh lời gọi remote và theo dõi tỉ lệ lỗi, với **3 trạng thái**:

| Trạng thái | Hành vi |
| ---------- | ------- |
| **CLOSED** (bình thường) | Request đi qua bình thường; đếm failure trong sliding window. Khi **failure rate vượt ngưỡng** (ví dụ >50% trong 10s, tối thiểu N request) → chuyển **OPEN** |
| **OPEN** | **Fail fast**: từ chối request ngay lập tức, KHÔNG gọi sang B — trả fallback. Caller không treo thread, B được "thở" để hồi phục. Sau thời gian chờ (ví dụ 30s) → chuyển **HALF-OPEN** |
| **HALF-OPEN** | Cho **một lượng nhỏ request thử** đi qua. Thành công đủ → về CLOSED; còn fail → về OPEN, chờ tiếp |

Hai tác dụng ngăn domino: (1) caller **fail fast** thay vì treo — thread pool không cạn, A vẫn phục vụ được phần không liên quan B; (2) B đang quá tải **không bị dội thêm traffic** — có cơ hội hồi phục.

**Fallback response** — khi breaker mở trả gì? Tuỳ nghiệp vụ: giá trị mặc định (recommendation → trả danh sách phổ biến cache sẵn), dữ liệu cache cũ (stale-while-error), xếp request vào queue xử lý sau, hoặc degrade tính năng có chủ đích ("tạm thời không hiển thị được điểm thưởng"). Nguyên tắc: **degrade gracefully** thay vì lỗi trắng trang.

**Khác retry — điểm phân loại senior**: retry giải quyết lỗi **thoáng qua** (transient — network blip, một instance restart). Nhưng khi B đang **quá tải**, retry là **đổ thêm dầu vào lửa**: mỗi request fail sinh thêm 2-3 request retry → traffic nhân lên đúng lúc B yếu nhất → **retry storm**, B không bao giờ hồi phục được. Circuit breaker là cái phanh ngăn điều đó. Kết hợp đúng:

- **Timeout**: luôn đặt timeout cho mọi remote call — không có timeout thì breaker không bao giờ thấy "lỗi", thread vẫn treo vô hạn.
- **Retry với exponential backoff + jitter**: retry thưa dần (1s, 2s, 4s...) và cộng độ trễ ngẫu nhiên (jitter) để hàng nghìn client không retry **đồng loạt cùng thời điểm** (thundering herd).
- **Bulkhead**: cô lập tài nguyên — pool connection/thread **riêng cho từng dependency** (như vách ngăn khoang tàu). B sập chỉ cạn pool của B, pool gọi C vẫn nguyên.
- Thứ tự một call chuẩn: `circuit breaker → bulkhead → retry (backoff+jitter) → timeout → call`.

**Thư viện**: **resilience4j** (Java — chuẩn hiện tại), **Polly** (.NET), opossum (Node.js). **Hystrix** (Netflix) là cha đẻ của pattern nhưng đã **ngừng phát triển** từ 2018 — nhắc đến Hystrix như legacy, đừng nói như lựa chọn hiện tại. Ngoài ra như câu service mesh: có thể đẩy circuit breaking xuống tầng sidecar (Envoy outlier detection) thay vì thư viện trong code.

### Thiết kế minh hoạ

```text
3 TRẠNG THÁI:
                 failure rate > ngưỡng
      ┌────────┐ ───────────────────────► ┌────────┐
      │ CLOSED │                          │  OPEN  │ ─ từ chối ngay,
      │(bình   │ ◄───────────────────────  │(fail   │   trả fallback
      │thường) │   thử thành công đủ      │ fast)  │
      └────────┘          │               └───┬────┘
           ▲              │                   │ hết thời gian chờ (30s)
           │         ┌────┴──────┐            │
           └──────── │ HALF-OPEN │ ◄──────────┘
        thử fail →   │(thử vài   │
        về OPEN      │ request)  │
                     └───────────┘
```

```typescript
// Circuit breaker tối giản — minh hoạ cơ chế (pseudo-code, immutable state)
type State = "CLOSED" | "OPEN" | "HALF_OPEN";

type BreakerState = {
  readonly state: State;
  readonly failures: number;
  readonly openedAt: number;
};

const CONFIG = {
  failureThreshold: 5,    // 5 lỗi liên tiếp → OPEN
  openDurationMs: 30_000, // OPEN 30s rồi mới HALF_OPEN
  callTimeoutMs: 2_000,   // timeout BẮT BUỘC — không có thì breaker mù
};

async function callWithBreaker<T>(
  breaker: BreakerState,
  call: () => Promise<T>,
  fallback: () => T,
): Promise<{ result: T; next: BreakerState }> {
  // OPEN: fail fast — không gọi remote, không chiếm thread
  if (breaker.state === "OPEN") {
    const waited = Date.now() - breaker.openedAt;
    if (waited < CONFIG.openDurationMs) {
      return { result: fallback(), next: breaker }; // trả fallback ngay
    }
    // hết thời gian chờ → HALF_OPEN, cho thử 1 request
    breaker = { ...breaker, state: "HALF_OPEN" };
  }

  try {
    const result = await withTimeout(call(), CONFIG.callTimeoutMs);
    // thành công → đóng mạch, reset đếm (tạo state mới, không mutate)
    return { result, next: { state: "CLOSED", failures: 0, openedAt: 0 } };
  } catch (error) {
    const failures = breaker.failures + 1;
    const shouldOpen =
      breaker.state === "HALF_OPEN" || failures >= CONFIG.failureThreshold;
    const next: BreakerState = shouldOpen
      ? { state: "OPEN", failures, openedAt: Date.now() }
      : { ...breaker, failures };
    return { result: fallback(), next };
  }
}

// Sử dụng: fallback theo nghiệp vụ — degrade gracefully
// const { result } = await callWithBreaker(state,
//   () => recommendationService.get(userId),
//   () => popularItemsCache.get(),  // breaker mở → trả danh sách phổ biến
// );

// Retry đúng cách: exponential backoff + jitter (tránh thundering herd)
const delay = Math.min(maxDelay, baseDelay * 2 ** attempt) * Math.random();
```

### Đáp án mẫu

> "Cascading failure xảy ra khi một service chậm: service A gọi B và chờ, mỗi request treo chiếm một thread của A, traffic vẫn vào nên thread pool của A cạn dần và A chết theo — domino lan ngược lên cả hệ thống. Circuit breaker bọc quanh lời gọi remote với 3 trạng thái: CLOSED cho request đi qua và đếm failure rate; vượt ngưỡng thì sang OPEN — fail fast, từ chối ngay và trả fallback, vừa giữ thread pool của caller vừa cho B được thở để hồi phục; sau một khoảng chờ sang HALF-OPEN, cho vài request thử, ổn thì đóng mạch lại. Em luôn phân biệt với retry: retry chỉ hợp với lỗi thoáng qua, còn khi hệ đang quá tải thì retry nhân thêm traffic đúng lúc yếu nhất — retry storm làm mọi thứ tệ hơn. Combo chuẩn của em là timeout bắt buộc cho mọi remote call, retry với exponential backoff cộng jitter, bulkhead cô lập pool theo từng dependency, và circuit breaker bọc ngoài. Thư viện thì resilience4j cho Java, Polly cho .NET — Hystrix giờ là legacy; hoặc đẩy hẳn xuống Envoy sidecar nếu đã có service mesh."

---

## Câu 22: Saga Pattern giải quyết vấn đề gì? Choreography và Orchestration khác nhau thế nào? `[Advanced]`

### Câu hỏi

> Saga Pattern giải quyết vấn đề gì trong microservices? So sánh hai cách triển khai Choreography và Orchestration — khi nào chọn cách nào?

### Giải thích lý thuyết

**Vấn đề**: trong monolith, "đặt hàng = tạo order + trừ tiền + giữ kho" là **một ACID transaction** — fail ở đâu rollback hết. Trong microservices, mỗi bước nằm ở **service khác nhau với database riêng** — không còn transaction chung. Giải pháp cổ điển **2PC (Two-Phase Commit)** không dùng được thực tế: coordinator phải **lock tài nguyên ở mọi service** suốt quá trình prepare→commit — coordinator chết là tất cả treo lock; latency cao, throughput thấp, và phần lớn hệ hiện đại (message broker, NoSQL) không hỗ trợ XA. 2PC đánh đổi availability lấy consistency — sai hướng với microservices.

**Saga** = chuỗi các **local transaction**: mỗi service thực hiện transaction trong DB của riêng nó rồi phát tín hiệu cho bước tiếp theo. Nếu một bước fail, saga **không rollback** (đã commit rồi) mà chạy ngược lại các **compensating transaction** — hành động nghiệp vụ đảo ngược những gì đã làm: đã trừ tiền thì refund, đã giữ kho thì release, đã tạo order thì đánh dấu cancelled. Hệ quả quan trọng: chỉ có **eventual consistency** — có khoảnh khắc order tồn tại mà tiền chưa trừ; nghiệp vụ phải chấp nhận và thiết kế cho điều đó.

**Hai cách triển khai**:

**1. Choreography (vũ đạo)** — không có chỉ huy. Mỗi service **nghe event** của service khác và tự biết phải làm gì: Order Service phát `OrderCreated` → Payment Service nghe, trừ tiền, phát `PaymentCompleted` → Inventory nghe, giữ kho... Fail thì phát event lỗi (`PaymentFailed`) và các service liên quan tự compensate.

**2. Orchestration (nhạc trưởng)** — có một **orchestrator** trung tâm giữ state của saga và **ra lệnh** từng bước: gọi Payment "trừ tiền đi", nhận kết quả, gọi Inventory "giữ kho đi"... Fail ở bước nào, orchestrator chủ động gọi compensation các bước trước theo đúng thứ tự ngược. Công cụ chuyên dụng: **Temporal** (workflow-as-code, tự lo retry/state/durability), **AWS Step Functions** (managed state machine), Camunda.

| Tiêu chí | Choreography | Orchestration |
| -------- | ------------ | ------------- |
| **Coupling** | Loose — service chỉ biết event, không biết nhau | Service coupling vào orchestrator |
| **Nhìn flow** | **Khó** — flow "ẩn" rải rác trong các subscriber, muốn hiểu phải đọc N service | **Dễ** — toàn bộ flow nằm một chỗ trong code orchestrator |
| **Trace/Debug** | Khó — cần distributed tracing tốt; "saga đang ở bước nào?" không ai trả lời được | Orchestrator giữ state — query được saga đang ở đâu, fail vì sao |
| **Thêm bước mới** | Chỉ thêm subscriber mới (không sửa service cũ) — nhưng dễ vô tình tạo **cyclic dependency** giữa các event | Sửa orchestrator — tường minh, một chỗ |
| **Hạ tầng** | Chỉ cần message broker (Kafka, RabbitMQ) | Thêm một component phải vận hành (hoặc dùng managed như Step Functions) |
| **Single point** | Không | Orchestrator — nhưng Temporal/Step Functions đã giải bằng durable state |
| **Hợp với** | Saga **ngắn, đơn giản** (2-4 bước), ít rẽ nhánh | Saga **dài, phức tạp**, nhiều điều kiện, cần audit/visibility |

**Khi nào chọn gì**: 2-3 bước tuyến tính, team đã có event bus → choreography đủ và nhẹ. Saga 4+ bước, có rẽ nhánh, timeout, human approval, hoặc cần trả lời "đơn này đang kẹt ở đâu" → orchestration. Xu hướng thực tế: bắt đầu choreography, đến khi không ai vẽ nổi sơ đồ flow trên whiteboard nữa thì chuyển dần các saga phức tạp sang orchestrator.

**Hai lưu ý senior hay được hỏi xoáy**: (1) **Outbox pattern** — "ghi DB + phát event" phải atomic, nếu ghi DB xong mà publish fail thì saga đứt; giải bằng cách ghi event vào bảng outbox trong cùng local transaction, một relay đọc bảng đó publish ra broker. (2) **Idempotency** — message có thể delivered nhiều lần (at-least-once), mọi handler và compensation phải idempotent (trừ tiền 2 lần vì duplicate message là tai nạn thật).

### Thiết kế minh hoạ

```text
CHOREOGRAPHY — service nghe event của nhau, không ai chỉ huy:

 Order        Payment        Inventory       Shipping
   │ OrderCreated  │              │              │
   ├──────────────►│              │              │
   │               │ PaymentCompleted            │
   │               ├─────────────►│              │
   │               │              │ StockReserved│
   │               │              ├─────────────►│
   │               │              │              │
   ◄ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤ StockFailed (hết hàng!)
   │ (cancel order)│ (refund) ◄ ─ ┤   → các service tự compensate
   
ORCHESTRATION — orchestrator ra lệnh và giữ state:

              ┌──────────────────┐
              │   ORCHESTRATOR   │  giữ state: saga #123 đang ở bước 3
              │ (Temporal / Step │  fail → chủ động gọi compensation
              │    Functions)    │     theo thứ tự NGƯỢC
              └─┬──────┬──────┬──┘
        1.charge│ 2.reserve│  3.ship│
            ┌───▼──┐ ┌────▼────┐ ┌──▼─────┐
            │Payment│ │Inventory│ │Shipping│
            └──────┘ └─────────┘ └────────┘
```

```typescript
// Orchestration — saga đặt hàng dạng workflow-as-code (pseudo-code kiểu Temporal)
async function orderSaga(order: Order): Promise<SagaResult> {
  // Stack các compensation đã "arm" — fail thì pop chạy ngược
  const compensations: Array<() => Promise<void>> = [];

  try {
    // Bước 1: tạo order (local transaction của Order Service)
    const created = await orderService.create(order);
    compensations.push(() => orderService.cancel(created.id)); // compensation

    // Bước 2: trừ tiền
    const payment = await paymentService.charge(order.userId, order.total);
    compensations.push(() => paymentService.refund(payment.id)); // refund nếu sau này fail

    // Bước 3: giữ kho — giả sử FAIL ở đây (hết hàng)
    const stock = await inventoryService.reserve(order.items);
    compensations.push(() => inventoryService.release(stock.id));

    // Bước 4: tạo shipment
    await shippingService.schedule(created.id, order.address);

    return { status: "COMPLETED", orderId: created.id };
  } catch (error) {
    // Chạy compensation theo thứ tự NGƯỢC: release kho → refund → cancel order
    for (const compensate of [...compensations].reverse()) {
      await compensate(); // mỗi compensation phải IDEMPOTENT (chạy 2 lần vô hại)
    }
    return { status: "COMPENSATED", reason: String(error) };
  }
}

// Choreography — Payment Service chỉ là một subscriber (pseudo-code)
eventBus.subscribe("OrderCreated", async (event) => {
  try {
    const payment = await chargeCustomer(event.userId, event.total);
    await eventBus.publish("PaymentCompleted", { orderId: event.orderId, payment });
  } catch {
    // Không biết ai sẽ xử lý — chỉ phát event, ai quan tâm tự nghe
    await eventBus.publish("PaymentFailed", { orderId: event.orderId });
  }
});
// Order Service tự nghe PaymentFailed để cancel order của chính nó
```

### Đáp án mẫu

> "Saga giải quyết bài toán distributed transaction: mỗi service own database riêng nên không còn ACID chung, còn 2PC thì phải lock tài nguyên ở mọi service và coordinator chết là treo hết — không dùng được thực tế. Saga thay bằng chuỗi local transaction, mỗi bước commit ngay trong DB của service đó; fail ở đâu thì chạy ngược các compensating transaction — đã trừ tiền thì refund, đã giữ kho thì release — và chấp nhận eventual consistency. Có hai cách triển khai: choreography là các service nghe event của nhau, loose coupling và chỉ cần message broker, nhưng flow ẩn rải rác trong các subscriber, saga dài là không ai trace nổi đang kẹt ở bước nào. Orchestration có một orchestrator như Temporal hay Step Functions giữ state và ra lệnh từng bước — flow tường minh một chỗ, dễ debug, đổi lại thêm component phải vận hành. Kinh nghiệm của em: saga 2-3 bước tuyến tính thì choreography, từ 4 bước trở lên có rẽ nhánh thì orchestration. Và hai thứ em luôn kèm theo: outbox pattern để ghi DB và phát event atomic, cùng idempotency cho mọi handler vì message có thể đến hai lần."

---

## Bẫy thường gặp khi trả lời

| Sai lầm | Đúng là |
| ------- | ------- |
| "Microservices luôn tốt hơn monolith, công ty lớn nào cũng dùng" | Là trade-off giải vấn đề **tổ chức** (Conway's Law); team nhỏ dùng là trả chi phí distributed system mà không nhận được lợi ích — modular monolith thường là lựa chọn đúng hơn |
| "Migrate thì rewrite lại toàn bộ thành microservices" | Strangler Fig: tách dần từng capability qua facade, mỗi bước rollback được — big-bang rewrite là cách thất bại kinh điển |
| "Các microservice có thể dùng chung một database cho tiện JOIN" | Database-per-service là nguyên tắc cốt lõi — chung DB là "distributed monolith": coupling qua schema, mất hết lợi ích deploy độc lập |
| "API Gateway nên xử lý luôn business logic cho tập trung" | Gateway chỉ giữ cross-cutting concern (auth, rate limit, routing); nhét business logic vào là biến nó thành monolith logic và nút cổ chai deploy |
| "Service mesh thay thế API Gateway" | Bổ trợ nhau: gateway lo north-south (client → hệ thống), mesh lo east-west (service ↔ service) |
| "Cứ làm microservices là phải cài Istio" | Dưới ~10 service mesh là overkill — sidecar tốn latency, tài nguyên và chi phí vận hành; thư viện resilience + private network là đủ |
| "Service B lỗi thì cứ retry đến khi thành công" | B đang quá tải mà retry là retry storm — nhân traffic đúng lúc yếu nhất; phải có circuit breaker fail fast + backoff với jitter |
| "Circuit breaker không cần timeout vì đã có ngưỡng failure" | Không có timeout thì call treo vô hạn không bao giờ được tính là failure — breaker "mù", thread pool vẫn cạn |
| "Saga rollback transaction khi fail" | Local transaction đã commit, không rollback được — saga chạy **compensating transaction** (refund, release...) và chỉ đạt eventual consistency |
| "Choreography luôn tốt hơn vì loose coupling" | Saga dài/rẽ nhánh thì flow ẩn trong N subscriber, không trace nổi — orchestration (Temporal, Step Functions) tường minh và debug được state |
| "Publish event sau khi commit DB là đủ an toàn" | Ghi DB xong publish fail là saga đứt gánh — cần Outbox pattern để hai thao tác atomic, và handler phải idempotent vì at-least-once delivery |
