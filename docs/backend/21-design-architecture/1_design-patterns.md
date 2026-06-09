---
sidebar_position: 1
title: "1. Design Patterns, DDD, CQRS, Event Sourcing"
---

# Design Patterns, DDD, CQRS, Event Sourcing

Đây là những "khuôn mẫu" và cách tổ chức code đã được đúc kết để giải quyết các bài toán thường gặp khi viết phần mềm phức tạp. Hiểu chúng quan trọng vì giúp code dễ đọc, dễ bảo trì và xử lý tốt các nghiệp vụ rắc rối, nhưng cũng cần biết khi nào không nên dùng để tránh làm mọi thứ phức tạp quá mức. Bài này giới thiệu Design Patterns, DDD, CQRS và Event Sourcing; phần chi tiết nằm bên dưới.

---

## Mục lục

- [Common Design Patterns](#common-design-patterns)
- [Domain-Driven Design (DDD)](#domain-driven-design-ddd)
- [Event-Driven Architecture](#event-driven-architecture)
- [CQRS](#cqrs)
- [Event Sourcing](#event-sourcing)

---

## Common Design Patterns

**Creational**:

- **Factory** — tạo object theo logic.
- **Singleton** — 1 instance toàn app.
- **Builder** — build complex object step-by-step.

**Structural**:

- **Adapter** — wrap interface khác.
- **Decorator** — add behavior runtime.
- **Facade** — simplified API cho complex system.
- **Proxy** — intermediary, lazy load, access control.

**Behavioral**:

- **Strategy** — interchangeable algorithm.
- **Observer** — pub/sub.
- **Command** — encapsulate request.
- **Iterator**, **State**, **Template Method**.

```ts
// Strategy pattern example
interface PaymentStrategy {
  pay(amount: number): Promise<void>;
}

class StripeStrategy implements PaymentStrategy {
  async pay(amount: number) { /* Stripe API */ }
}

class PayPalStrategy implements PaymentStrategy {
  async pay(amount: number) { /* PayPal API */ }
}

class Checkout {
  constructor(private strategy: PaymentStrategy) {}
  async processPayment(amount: number) {
    return this.strategy.pay(amount);
  }
}
```

Backend đặc thù:

- **Repository pattern** — abstract DB access.
- **Unit of Work** — group operation thành transaction.
- **Dependency Injection** — pass dep qua constructor.
- **Service layer** — business logic riêng route.

---

## Domain-Driven Design (DDD)

**Tiếp cận** thiết kế phức tạp business logic — Eric Evans (2003).

**Strategic patterns**:

- **Bounded Context** — boundary giữa subdomain.
- **Ubiquitous Language** — term consistent giữa code + business.
- **Context Map** — relationship giữa bounded context.

**Tactical patterns**:

- **Entity** — object có identity (User, Order).
- **Value Object** — immutable, no identity (Money, Address).
- **Aggregate** — group entity với root.
- **Repository** — persistence interface.
- **Domain Service** — logic không thuộc entity nào.
- **Domain Event** — fact happened in domain.

```ts
// Value Object — immutable
class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string,
  ) {
    if (amount < 0) throw new Error("Negative amount");
  }

  add(other: Money): Money {
    if (other.currency !== this.currency) {
      throw new Error("Currency mismatch");
    }
    return new Money(this.amount + other.amount, this.currency);
  }
}

// Entity với Aggregate Root
class Order {
  private items: OrderItem[] = [];
  private status: "draft" | "paid" | "shipped" = "draft";

  constructor(public readonly id: string, public readonly customerId: string) {}

  addItem(productId: string, qty: number, price: Money) {
    if (this.status !== "draft") {
      throw new Error("Cannot modify paid order");
    }
    this.items.push(new OrderItem(productId, qty, price));
  }

  totalPrice(): Money {
    return this.items.reduce(
      (sum, i) => sum.add(i.subtotal()),
      new Money(0, "VND")
    );
  }

  markAsPaid() {
    if (this.items.length === 0) throw new Error("Empty order");
    this.status = "paid";
    // Emit domain event
    return new OrderPaidEvent(this.id);
  }
}
```

:::info[Phân tích]

**DDD phù hợp khi**:

- Business **phức tạp** (banking, insurance, ERP).
- Team có **domain expert** để work.
- Long-running project (> 1 năm).
- Multiple bounded context.

**Overkill cho**:

- CRUD app đơn giản.
- Startup MVP.
- Small project < 20k LOC.

DDD đầu tư trước → payoff sau khi codebase + team lớn. Đừng dùng cho mọi
project.

Pattern phổ biến hơn cho startup:

- **Service layer** — group logic theo feature.
- **Repository** — abstract DB.
- **DTO** — input/output validation.

Đủ cho 80% case.

:::

---

## Event-Driven Architecture

**Service** giao tiếp qua **event**, không direct call.

```
[Order Service] → publish OrderCreated → [Event Bus]
                                            ↓
                          [Email Service] (send confirmation)
                          [Inventory Service] (reserve stock)
                          [Analytics Service] (track sale)
```

**Ưu**:

- **Loose coupling** — service không biết nhau.
- **Scalable** — add subscriber không sửa producer.
- **Resilient** — subscriber down → reprocess sau.
- **Audit trail** — event log natural history.

**Nhược**:

- **Eventual consistency** — async, không immediate.
- **Debug khó** — event chain qua nhiều service.
- **Schema evolution** — đổi event format affect mọi consumer.

**Event broker**:

- Kafka, RabbitMQ, AWS EventBridge, Google Pub/Sub.

```ts
// Producer
class OrderService {
  async createOrder(data) {
    const order = await db.order.create({ data });

    // Publish event
    await eventBus.publish("order.created", {
      orderId: order.id,
      userId: order.userId,
      total: order.total,
    });

    return order;
  }
}

// Consumer (different service)
class EmailService {
  async onOrderCreated(event) {
    const user = await fetchUser(event.userId);
    await sendEmail(user.email, "Order confirmation", { ... });
  }
}
```

---

## CQRS

**Command Query Responsibility Segregation** — tách **write (command)**
và **read (query)** thành 2 model khác nhau.

```
[Write Side]                    [Read Side]
Command → Domain Model →        Query → Read Model
            ↓                      ↑
        Event Store ───────→ Materialized View
```

**Ưu**:

- **Optimize riêng** — write strict consistency, read fast denormalized.
- **Scale riêng** — read replica nhiều, write 1.
- **Different model** — read model phẳng cho dashboard.

**Nhược**:

- **Complexity 2x** — 2 model.
- **Eventual consistency** — read lag sau write.
- **Sync mechanism** cần (event hoặc replication).

Use case:

- App **read >> write** (e-commerce, social).
- Reporting + transactional cùng DB không scale.

```ts
// Write side (command)
class CreateOrderCommand {
  constructor(public userId: string, public items: any[]) {}
}

class OrderCommandHandler {
  async handle(cmd: CreateOrderCommand) {
    const order = new Order(...);
    await orderRepo.save(order);
    await eventBus.publish("order.created", order.toEvent());
  }
}

// Read side (query — denormalized)
class OrderQueryHandler {
  async getOrderSummary(userId: string) {
    return await db.query(`
      SELECT
        o.id, o.total, u.name AS user_name,
        COUNT(i.id) AS item_count
      FROM order_summary_view o   -- materialized view
      JOIN users u ON u.id = o.user_id
      JOIN order_items i ON i.order_id = o.id
      WHERE o.user_id = $1
      GROUP BY o.id, u.name
    `, [userId]);
  }
}
```

CQRS **không cần Event Sourcing** — có thể chỉ tách model.

---

## Event Sourcing

**Lưu sự kiện**, không phải current state.

```
Traditional (state):
users table:
  id: 1, name: "An", email: "an@example.com"

Event Sourcing:
events table:
  id: 1, type: "UserCreated", payload: { id: 1, name: "An" }
  id: 2, type: "UserEmailChanged", payload: { id: 1, email: "..." }
  id: 3, type: "UserNameChanged", payload: { id: 1, name: "An Nguyen" }

Current state = replay events.
```

**Ưu**:

- **Audit trail** complete — biết mọi thay đổi.
- **Time-travel** — state at any point.
- **Replay** — rebuild read model từ event.
- **Multiple projection** — derive nhiều view từ same event.

**Nhược**:

- **Complexity cao** — học curve steep.
- **Storage cost** — event tích lũy mãi.
- **Query khó** — replay event để get state.
- **Schema evolution** — event format đổi tricky.

Use case:

- **Banking, financial** — audit critical.
- **Versioning** — Git-like history.
- **Complex domain** với many state transition.

Implementation:

- **EventStoreDB** — purpose-built.
- **Axon Framework** (Java).
- **Marten** (.NET với Postgres).
- **Khôi phục từ Postgres** event log.

:::warning[Cần lưu ý]

**Đừng over-architect**:

CQRS + Event Sourcing là **powerful nhưng phức tạp**. Lý do failure phổ
biến của startup dùng pattern này:

- Team chưa familiar → bug + slow dev.
- Over-engineering — CRUD app không cần.
- Migration giữa chừng → kẹt.

Start **simple monolith CRUD**. Áp dụng CQRS/ES khi:

- Read >> write rõ ràng (1000x).
- Audit trail legal requirement.
- Team có experience.

90% app **không cần** Event Sourcing. CQRS opt-in cho specific feature
(reporting, dashboard) chứ không toàn app.

:::

:::info[Phân tích]

**System Design Roadmap** cho backend senior:

1. **Load balancing** — distribute traffic.
2. **Caching** — Redis, CDN.
3. **Database scaling** — replica, shard, partition.
4. **Message queue** — async processing.
5. **Microservices** vs Monolith trade-off.
6. **API design** — REST, GraphQL, RPC.
7. **Distributed system fundamentals** — CAP theorem, consensus.
8. **Security** — auth, rate limit, OWASP.
9. **Observability** — metric, log, trace.
10. **Reliability** — retry, circuit breaker, chaos.

Books:

- **"Designing Data-Intensive Applications"** — Martin Kleppmann (must-read).
- **"System Design Interview"** — Alex Xu.
- **"Building Microservices"** — Sam Newman.

Senior interview thường hỏi system design scenarios — practice với
[System Design Primer](https://github.com/donnemartin/system-design-primer).

:::

:::tip[Mẹo]

**Recommended pattern stack 2026** cho startup tech-savvy:

```
Architecture: Modular Monolith
Pattern: Service Layer + Repository
Data: PostgreSQL với DDD-lite (entity, value object)
Event: PostgreSQL LISTEN/NOTIFY + BullMQ for async
Read model: Postgres materialized view nếu cần
```

Đủ scale đến vài triệu user. Add complexity khi đo cần.

:::
