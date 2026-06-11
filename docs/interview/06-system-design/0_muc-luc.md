---
sidebar_position: 0
title: "Mục lục tra cứu"
---

# Mục lục tra cứu — System Design

> *Section này có 2 phần: file 1–6 là Frontend System Design (45 câu, đánh số riêng theo từng file), file 7–16 là Distributed Systems & Backend (58 câu, đánh số toàn cục #1–#58). Bảng dưới tra cứu 58 câu backend theo số câu.*

## Backend & Distributed Systems (58 câu, file 7–16)

| Câu | Nội dung | Level | File |
|----:|----------|-------|------|
| 1 | CAP Theorem | Intermediate | [7. Nền tảng hệ phân tán](./7_distributed-fundamentals.md) |
| 2 | ACID vs BASE | Intermediate | [7. Nền tảng hệ phân tán](./7_distributed-fundamentals.md) |
| 3 | Vertical vs Horizontal Scaling | Basic | [7. Nền tảng hệ phân tán](./7_distributed-fundamentals.md) |
| 4 | Load Balancing và các thuật toán | Basic | [8. Network & Traffic](./8_network-traffic.md) |
| 5 | CDN cải thiện hiệu năng thế nào | Basic | [8. Network & Traffic](./8_network-traffic.md) |
| 6 | Forward Proxy vs Reverse Proxy | Basic | [8. Network & Traffic](./8_network-traffic.md) |
| 7 | Latency vs Throughput | Basic | [7. Nền tảng hệ phân tán](./7_distributed-fundamentals.md) |
| 8 | Các mô hình Consistency | Advanced | [7. Nền tảng hệ phân tán](./7_distributed-fundamentals.md) |
| 9 | Caching strategies cho frontend | Intermediate | [14. Frontend System Design](./14_frontend-system-design.md) |
| 10 | Database Sharding | Advanced | [10. Database Scaling](./10_database-scaling.md) |
| 11 | Read Replica | Intermediate | [10. Database Scaling](./10_database-scaling.md) |
| 12 | Cache-aside / Write-through / Write-back | Intermediate | [9. Caching, Performance & Observability](./9_caching-performance-observability.md) |
| 13 | Rate Limiting và các thuật toán | Intermediate | [8. Network & Traffic](./8_network-traffic.md) |
| 14 | Connection Pooling | Intermediate | [9. Caching, Performance & Observability](./9_caching-performance-observability.md) |
| 15 | CQRS Pattern | Advanced | [13. Event-Driven & CQRS](./13_event-driven-cqrs.md) |
| 16 | Event Sourcing | Advanced | [13. Event-Driven & CQRS](./13_event-driven-cqrs.md) |
| 17 | Horizontal scaling cho stateful services | Advanced | [13. Event-Driven & CQRS](./13_event-driven-cqrs.md) |
| 18 | Microservices vs Monolith | Intermediate | [12. Microservices Architecture](./12_microservices.md) |
| 19 | API Gateway | Intermediate | [12. Microservices Architecture](./12_microservices.md) |
| 20 | Service Mesh | Advanced | [12. Microservices Architecture](./12_microservices.md) |
| 21 | Circuit Breaker Pattern | Advanced | [12. Microservices Architecture](./12_microservices.md) |
| 22 | Saga Pattern — Choreography vs Orchestration | Advanced | [12. Microservices Architecture](./12_microservices.md) |
| 23 | Message Queue và async communication | Intermediate | [13. Event-Driven & CQRS](./13_event-driven-cqrs.md) |
| 24 | Kafka vs RabbitMQ | Advanced | [13. Event-Driven & CQRS](./13_event-driven-cqrs.md) |
| 25 | WebSocket vs Long Polling vs SSE | Intermediate | [8. Network & Traffic](./8_network-traffic.md) |
| 26 | Chọn SQL hay NoSQL | Intermediate | [10. Database Scaling](./10_database-scaling.md) |
| 27 | Database Indexing | Intermediate | [10. Database Scaling](./10_database-scaling.md) |
| 28 | Normalization vs Denormalization | Intermediate | [10. Database Scaling](./10_database-scaling.md) |
| 29 | Blob Storage và thiết kế lưu trữ file | Intermediate | [11. Data Systems & Storage](./11_data-systems.md) |
| 30 | Consistent Hashing | Advanced | [7. Nền tảng hệ phân tán](./7_distributed-fundamentals.md) |
| 31 | Idempotency key — API an toàn khi retry | Advanced | [9. Caching, Performance & Observability](./9_caching-performance-observability.md) |
| 32 | Observability: Logs, Metrics, Traces | Intermediate | [9. Caching, Performance & Observability](./9_caching-performance-observability.md) |
| 33 | Bloom Filter | Advanced | [9. Caching, Performance & Observability](./9_caching-performance-observability.md) |
| 34 | Thiết kế hệ thống Webhook | Advanced | [15. Case Studies: Core Systems](./15_case-studies-core.md) |
| 35 | Thiết kế upload file lớn từ browser | Advanced | [14. Frontend System Design](./14_frontend-system-design.md) |
| 36 | Thiết kế chat real-time — góc nhìn frontend | Advanced | [14. Frontend System Design](./14_frontend-system-design.md) |
| 37 | Thiết kế infinite scroll feed | Advanced | [14. Frontend System Design](./14_frontend-system-design.md) |
| 38 | Thiết kế form builder (drag & drop) | Advanced | [14. Frontend System Design](./14_frontend-system-design.md) |
| 39 | Data Partitioning | Intermediate | [11. Data Systems & Storage](./11_data-systems.md) |
| 40 | Time-Series Database | Intermediate | [11. Data Systems & Storage](./11_data-systems.md) |
| 41 | Data Lake vs Data Warehouse | Intermediate | [11. Data Systems & Storage](./11_data-systems.md) |
| 42 | Change Data Capture (CDC) | Advanced | [11. Data Systems & Storage](./11_data-systems.md) |
| 43 | Thiết kế URL Shortener | Advanced | [15. Case Studies: Core Systems](./15_case-studies-core.md) |
| 44 | Thiết kế Chat real-time (backend) | Advanced | [15. Case Studies: Core Systems](./15_case-studies-core.md) |
| 45 | Thiết kế hệ thống Notification | Advanced | [15. Case Studies: Core Systems](./15_case-studies-core.md) |
| 46 | Thiết kế Rate Limiter phân tán | Advanced | [8. Network & Traffic](./8_network-traffic.md) |
| 47 | Thiết kế Web Crawler | Advanced | [15. Case Studies: Core Systems](./15_case-studies-core.md) |
| 48 | Thiết kế Distributed Message Queue | Advanced | [15. Case Studies: Core Systems](./15_case-studies-core.md) |
| 49 | Thiết kế Search Autocomplete | Advanced | [16. Case Studies: Advanced](./16_case-studies-advanced.md) |
| 50 | Thiết kế Payment như Stripe | Advanced | [16. Case Studies: Advanced](./16_case-studies-advanced.md) |
| 51 | Thiết kế xác thực OAuth2/OIDC + JWT | Advanced | [16. Case Studies: Advanced](./16_case-studies-advanced.md) |
| 52 | Multi-region active-active | Advanced | [16. Case Studies: Advanced](./16_case-studies-advanced.md) |
| 53 | Expand-and-contract schema migration | Advanced | [10. Database Scaling](./10_database-scaling.md) |
| 54 | Hot partition / hot key | Advanced | [7. Nền tảng hệ phân tán](./7_distributed-fundamentals.md) |
| 55 | Thiết kế News Feed kiểu Twitter | Advanced | [16. Case Studies: Advanced](./16_case-studies-advanced.md) |
| 56 | Thiết kế hệ thống gọi xe kiểu Uber | Advanced | [16. Case Studies: Advanced](./16_case-studies-advanced.md) |
| 57 | Thiết kế hệ thống đặt vé (Ticketmaster) | Advanced | [16. Case Studies: Advanced](./16_case-studies-advanced.md) |
| 58 | Thiết kế streaming video (YouTube/Netflix) | Advanced | [16. Case Studies: Advanced](./16_case-studies-advanced.md) |

## Frontend System Design (45 câu, file 1–6 — đánh số riêng từng file)

| File | Chủ đề chính | Số câu |
|------|--------------|-------:|
| [1. Frontend Architecture](./1_frontend-architecture.md) | Kiến trúc app cỡ trung, monorepo, micro-frontends, design system, error handling, migration | 6 |
| [2. Scalability & Performance](./2_scalability-performance.md) | News feed scrolling, optimistic UI, real-time collab, PWA, A/B testing, component library | 6 |
| [3. Security & Testing](./3_security-testing.md) | XSS, auth flow, testing pyramid, CI/CD, feature flag, GDPR | 6 |
| [4. Web Security Deep](./4_web-security-deep.md) | OWASP, CSRF, auth attacks, supply chain, session/JWT/OAuth, token storage, passkey | 12 |
| [5. Performance & Build](./5_performance-build.md) | Core Web Vitals, bundle size, build optimization | 7 |
| [6. Growth & Traffic](./6_growth-traffic.md) | SEO technical, CWV ranking, CRO, analytics, growth engineering | 8 |
