---
sidebar_position: 1
title: "1. Design Patterns, DDD, CQRS, Event Sourcing"
---

# Design Patterns, DDD, CQRS, Event Sourcing

Đây là những "khuôn mẫu" và cách tổ chức code đã được đúc kết để giải quyết các bài toán thường gặp khi viết phần mềm phức tạp. Hiểu chúng quan trọng vì giúp code dễ đọc, dễ bảo trì và xử lý tốt các nghiệp vụ rắc rối, nhưng cũng cần biết khi nào không nên dùng để tránh làm mọi thứ phức tạp quá mức. Bài này giới thiệu Design Patterns, DDD, CQRS và Event Sourcing; phần chi tiết nằm bên dưới.

[![Sơ đồ tóm tắt bài: Design Patterns, DDD, CQRS, Event Sourcing](/img/backend/design-patterns.webp)](pathname:///img/backend/design-patterns.webp)

---

:::note[Ghi nhớ nhanh]

- ⭐ **Design Patterns** — nhóm Creational/Structural/Behavioral (`Factory`, `Strategy`, `Observer`...) + đặc thù backend (`Repository`, `Unit of Work`, DI, Service layer).
- **`DDD` (Domain-Driven Design)** — Bounded Context, Entity, Value Object, Aggregate; hợp business phức tạp, overkill cho CRUD app đơn giản.
- **`CQRS`** — tách model write (command) và read (query); hợp read >> write, không bắt buộc dùng Event Sourcing.
- **`Event Sourcing`** — lưu chuỗi event thay vì current state, có audit trail + time-travel nhưng phức tạp; 90% app không cần.
- ⭐ **Đừng over-architect** — start với monolith CRUD đơn giản, chỉ áp dụng CQRS/ES khi thật sự cần (read >> write rõ, audit legal, team có kinh nghiệm).

:::

---

## Mục lục

- [Common Design Patterns](#common-design-patterns)
- [Domain-Driven Design (DDD)](#domain-driven-design-ddd)
- [Event-Driven Architecture](#event-driven-architecture)
- [CQRS](#cqrs)
- [Event Sourcing](#event-sourcing)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

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

:::tip[Ví dụ đời thường]

Design pattern chỉ là **mấy chiêu quen thuộc ngoài đời được đặt cho cái tên tiếng Anh**:

| Pattern | Ngoài đời |
| --- | --- |
| `Factory` | Bạn nói "cho một ly cà phê sữa" — quầy tự biết pha thế nào, bạn không cần biết công thức |
| `Singleton` | Cả nhà chỉ có **một cái công tơ điện**, ai xài cũng chung cái đó |
| `Builder` | Gọi ổ bánh mì: thêm trứng, bớt ớt, thêm pate — ráp từng bước rồi mới ra ổ bánh |
| `Adapter` | **Cục chuyển phích cắm** khi đi nước ngoài — ổ khác chuẩn thì cắm qua nó |
| `Decorator` | Ly trà sữa cơ bản, thêm trân châu, thêm phô mai — vẫn là ly trà sữa, chỉ "gắn" thêm |
| `Strategy` | Ra sân bay bằng taxi, xe buýt hay tàu điện — đổi cách đi, đích đến không đổi |
| `Observer` | Bạn **đăng ký nhận báo** — có số mới toà soạn gửi tới, khỏi ngày nào cũng ra sạp hỏi |

:::

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

:::tip[Ví dụ đời thường]

Trong một bệnh viện, chữ "bệnh nhân" **mỗi khoa hiểu một kiểu**: phòng khám quan tâm triệu chứng và lịch hẹn, thu ngân quan tâm mã bảo hiểm và số tiền, kho thuốc quan tâm liều đã phát. Ép cả bệnh viện xài chung **một cái bảng "bệnh nhân" khổng lồ** thì sửa chỗ nào cũng đụng chỗ khác.

- `Bounded Context` — **vẽ ranh giới cho từng khoa**, mỗi khoa giữ định nghĩa "bệnh nhân" của riêng mình.
- `Ubiquitous Language` — trong khoa đó bác sĩ gọi là "ca cấp cứu" thì trong code cũng phải tên đúng như vậy, **không ai được tự chế thành `urgentItem`**.
- `Context Map` — tấm sơ đồ ghi rõ khoa nào chuyển hồ sơ cho khoa nào, và bên nào phải chiều theo bên nào.

:::

**Tactical patterns**:

- **Entity** — object có identity (User, Order).
- **Value Object** — immutable, no identity (Money, Address).
- **Aggregate** — group entity với root.
- **Repository** — persistence interface.
- **Domain Service** — logic không thuộc entity nào.
- **Domain Event** — fact happened in domain.

:::tip[Ví dụ đời thường]

- **Entity** — **cái căn cước của bạn**: đổi tên, đổi địa chỉ thì vẫn là một người, vì số định danh không đổi.
- **Value Object** — **tờ 50 nghìn**: hai tờ cùng mệnh giá thì như nhau, chẳng ai quan tâm tờ nào là tờ nào; muốn "sửa" thì đổi lấy tờ khác chứ không viết đè lên tờ cũ.
- **Aggregate** — **cái đơn hàng kẹp cả xấp phiếu món**: thêm hay bớt món đều phải đi qua tờ bìa đơn hàng, **không ai được lén rút một phiếu ra sửa riêng** — nhờ vậy tổng tiền luôn khớp.

:::

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

:::tip[Ví dụ đời thường]

Gọi trực tiếp: bếp nấu xong phải **tự đi gọi từng người** — gọi bồi bàn, gọi thu ngân, gọi kho. Ai đang bận không nghe thì bếp đứng chờ.

Event-driven: bếp chỉ **gõ chuông và hô "bàn 5 xong món"** rồi quay đi nấu tiếp. Ai quan tâm thì tự nghe — bồi bàn ra bưng, thu ngân ghi sổ, kho trừ nguyên liệu. Muốn thêm anh chụp hình món ăn thì **cho anh đó đứng nghe chuông là xong**, bếp không cần biết có anh đó tồn tại.

Cái giá phải trả: bếp **không biết chắc ai đã nghe và làm xong chưa** (eventual consistency), và khi món giao nhầm thì phải lần theo tiếng chuông qua từng người mới ra chỗ sai (debug khó).

:::

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

:::tip[Ví dụ đời thường]

Ngân hàng không bắt mọi người xếp chung một hàng. Có **quầy giao dịch** (gửi tiền, mở tài khoản — chậm, kỹ, phải ký giấy đối chiếu) và **máy in sao kê / quầy tra cứu** (chỉ xem thôi nên cực nhanh). Quầy giao dịch chỉ cần 1-2 cái; máy tra cứu đặt 20 cái khắp sảnh, vì đa số khách chỉ vào xem.

`CQRS` chính là vậy: **đường ghi** đi qua model chặt chẽ, **đường đọc** dùng bảng đã dọn sẵn cho nhanh, và mỗi bên phình to theo nhu cầu riêng của nó.

Cái giá phải trả: sao kê ở máy tra cứu có thể **trễ vài giây so với quầy** (eventual consistency), và bạn phải nuôi hai "quầy" thay vì một.

:::

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

:::tip[Ví dụ đời thường]

Cách thường: trong sổ chỉ ghi **số dư hiện tại là 3 triệu**. Ghi đè con số mới là mất luôn con số cũ — hỏi "sao hôm qua lại thành thế này" thì chịu.

Event Sourcing là **cuốn sổ cái kế toán**: chỉ ghi thêm từng dòng "nạp 5 triệu", "rút 1 triệu", "chuyển 1 triệu", **không ai được tẩy xoá dòng cũ**. Muốn biết số dư thì cộng dồn cả cuốn sổ; muốn biết số dư hôm thứ Ba thì cộng tới dòng của thứ Ba là ra (time-travel).

Cái giá phải trả: sổ **dày lên mãi mãi** (storage), và cộng lại từ dòng đầu mỗi lần thì rất mệt — nên phải chốt sẵn "số dư cuối tháng" để đỡ cộng lại (snapshot / read model).

:::

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

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi đối chiếu lại với nội dung phía trên.

1. `Design pattern` là gì và vì sao cần biết? Phân biệt ba nhóm `Creational`, `Structural`, `Behavioral` và cho ví dụ mỗi nhóm.
2. Giải thích `Strategy pattern`. Bạn dùng nó thay cho chuỗi `if/else` dài trong tình huống nào — cho một ví dụ thực tế như chọn cổng thanh toán hay thuật toán tính phí ship.
3. `Factory` và `Builder` khác nhau ở đâu? Khi nào một object phức tạp tới mức nên dùng `Builder`?
4. Vì sao `Singleton` thường bị coi là anti-pattern? Nó gây khó khăn gì cho unit test, cho môi trường đa luồng và khi app chạy nhiều instance?
5. Cả `Decorator`, `Proxy` và `Adapter` đều "bọc" một object. Phân biệt ba pattern này theo mục đích sử dụng, kèm ví dụ.
6. `Observer pattern` hoạt động thế nào ở mức code? Nó liên hệ ra sao với `pub/sub` ở mức hệ thống phân tán?
7. `Repository pattern` giải quyết vấn đề gì? Có ý kiến cho rằng ORM đã đóng vai trò repository rồi nên thêm một lớp nữa là thừa — bạn phản biện thế nào?
8. `Unit of Work` là gì, và nó phối hợp với `Repository` ra sao để quản lý ranh giới transaction?
9. `Dependency Injection` mang lại lợi ích gì cho khả năng test? So sánh constructor injection với `Service Locator`.
10. Trong `DDD`, phân biệt `Entity` và `Value Object`. Cho ví dụ cụ thể và giải thích vì sao `Value Object` nên `immutable`.
11. `Aggregate` và `Aggregate Root` là gì? Vì sao mọi thay đổi buộc phải đi qua root, và bạn dựa vào đâu để vạch ranh giới một aggregate?
12. `Bounded Context` là gì? Cùng chữ "Customer" có thể mang nghĩa khác nhau ở hai context — bạn ánh xạ giữa chúng ra sao (`Context Map`, `Anti-Corruption Layer`)?
13. `Ubiquitous Language` giúp gì trong thực tế? Cho ví dụ một đoạn code phản ánh sai ngôn ngữ nghiệp vụ và cách sửa.
14. Khi nào `DDD` là overkill? Với một CRUD app đơn giản, bạn dùng cấu trúc nào thay thế và vì sao?
15. Mô tả `Event-Driven Architecture`. So sánh với kiến trúc gọi API trực tiếp về mức độ coupling, khả năng chịu lỗi và độ khó khi debug.
16. Phân biệt `event`, `command` và `message`. Bạn đặt tên event theo quy ước nào và vì sao thì quá khứ?
17. Broker thường chỉ đảm bảo `at-least-once delivery`, nghĩa là consumer có thể nhận trùng. Bạn thiết kế consumer `idempotent` bằng cách nào?
18. `Schema evolution` của event: khi cần thêm hoặc đổi field mà đã có nhiều consumer đang chạy, làm sao để không phá vỡ hệ thống? Nói về backward/forward compatibility và versioning.
19. Giải thích `CQRS`. Việc tách read model khỏi write model đem lại lợi ích gì, và bạn phải trả giá bằng gì?
20. `CQRS` có bắt buộc đi kèm `Event Sourcing` không? Hai pattern này quan hệ với nhau ra sao và có thể dùng riêng lẻ không?
21. Với `CQRS`, read model luôn trễ hơn write một nhịp. Người dùng vừa tạo đơn xong, load lại thì không thấy — bạn xử lý tình huống này ở tầng nào?
22. `Event Sourcing` lưu gì thay cho current state? Nêu lợi ích (`audit trail`, `time-travel`, `replay`) và các khó khăn thực tế khi vận hành lâu dài.
23. Trong `Event Sourcing`, `snapshot` dùng để làm gì? Khi một stream có hàng trăm nghìn event, bạn tối ưu việc dựng lại state thế nào?
24. Một event sai đã được ghi vào event store append-only, không được phép sửa hay xoá. Bạn khắc phục bằng cách nào?
25. Bạn được yêu cầu áp dụng `DDD` + `CQRS` + `Event Sourcing` cho một dự án mới. Bạn đặt những câu hỏi gì trước khi đồng ý, và trong trường hợp nào bạn khuyên nên từ chối?
