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

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `Design pattern` là gì và vì sao cần biết? Phân biệt ba nhóm `Creational`, `Structural`, `Behavioral` và cho ví dụ mỗi nhóm.**

<details className="qa">
<summary>Xem đáp án</summary>

**Design pattern** là lời giải đã được đúc kết cho những bài toán thiết kế lặp đi lặp lại — không phải thư viện hay code copy-paste, mà là *khuôn mẫu* về cách sắp xếp object và trách nhiệm. Giá trị lớn nhất là **ngôn ngữ chung**: nói "chỗ này dùng Strategy" thì cả team hiểu ngay cấu trúc, khỏi giải thích dài dòng.

| Nhóm | Giải quyết | Ví dụ |
| --- | --- | --- |
| **Creational** | Cách *tạo* object | `Factory` (tạo theo logic), `Singleton` (1 instance toàn app), `Builder` (ráp từng bước) |
| **Structural** | Cách *ghép* object lại | `Adapter` (bọc interface khác), `Decorator` (thêm hành vi lúc runtime), `Facade`, `Proxy` |
| **Behavioral** | Cách object *giao tiếp* | `Strategy` (thuật toán thay thế được), `Observer` (pub/sub), `Command`, `Iterator`, `State` |

Lưu ý: pattern là công cụ, không phải mục tiêu. Nhồi pattern vào chỗ không cần chỉ làm code khó đọc hơn.

</details>

**2. Giải thích `Strategy pattern`. Bạn dùng nó thay cho chuỗi `if/else` dài trong tình huống nào — cho một ví dụ thực tế như chọn cổng thanh toán hay thuật toán tính phí ship.**

<details className="qa">
<summary>Xem đáp án</summary>

`Strategy` tách **thuật toán** ra khỏi nơi sử dụng nó: định nghĩa một interface chung, mỗi cách làm là một class riêng, chỗ dùng chỉ cầm interface và gọi.

```ts
interface PaymentStrategy {
  pay(amount: number): Promise<void>;
}
class StripeStrategy implements PaymentStrategy { /* Stripe API */ }
class PayPalStrategy implements PaymentStrategy { /* PayPal API */ }

class Checkout {
  constructor(private strategy: PaymentStrategy) {}
  processPayment(amount: number) { return this.strategy.pay(amount); }
}
```

Dùng khi chuỗi `if/else` phân nhánh theo **loại thuật toán** và danh sách đó còn tiếp tục dài ra: cổng thanh toán, cách tính phí ship (theo cân, theo vùng, freeship), chính sách giảm giá. Lợi ích: thêm cổng mới là thêm class, **không sửa `Checkout`** (đúng tinh thần open/closed), và test được từng strategy độc lập. Ngược lại, nếu chỉ có hai nhánh cố định và không đổi thì `if/else` vẫn dễ đọc hơn — đừng lạm dụng.

</details>

**3. `Factory` và `Builder` khác nhau ở đâu? Khi nào một object phức tạp tới mức nên dùng `Builder`?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai đều thuộc nhóm Creational, nhưng giải bài toán khác nhau:

| | `Factory` | `Builder` |
| --- | --- | --- |
| Câu hỏi giải quyết | Tạo **loại nào** trong nhiều loại? | Tạo **một object nhiều phần** ra sao? |
| Số bước | Một lời gọi duy nhất | Nhiều bước nối tiếp rồi `build()` |
| Ví dụ đời thường | Gọi "một ly cà phê sữa", quầy tự biết pha | Gọi ổ bánh mì: thêm trứng, bớt ớt, thêm pate |

Nên dùng `Builder` khi constructor bắt đầu có quá nhiều tham số (đặc biệt là nhiều tham số tùy chọn cùng kiểu, dễ truyền nhầm thứ tự), khi có nhiều tổ hợp hợp lệ khác nhau, hoặc khi cần validate tổng thể trước lúc sinh ra object immutable. Dấu hiệu nhận biết: bạn thấy mình viết `new X(a, null, null, true, null)` hoặc phải tạo hàng loạt constructor overload. Query builder của ORM là ví dụ quen thuộc nhất.

</details>

**4. Vì sao `Singleton` thường bị coi là anti-pattern? Nó gây khó khăn gì cho unit test, cho môi trường đa luồng và khi app chạy nhiều instance?**

<details className="qa">
<summary>Xem đáp án</summary>

`Singleton` ép "chỉ có một instance toàn app" và thường kèm truy cập global. Vấn đề:

- **Khó test** — dependency bị giấu bên trong hàm chứ không khai báo ở constructor, nên không thay bằng mock được. Tệ hơn, state của singleton **sống xuyên qua các test case**, gây test phụ thuộc thứ tự chạy và flaky.
- **Che giấu coupling** — nhìn signature của class không biết nó phụ thuộc vào cái gì.
- **Đa luồng** — nếu singleton giữ state thay đổi được thì đó là shared mutable state, cần khóa; bản thân việc khởi tạo lazy cũng có thể race.
- **Nhiều instance app** — khi chạy nhiều process/pod, "một instance" chỉ đúng trong phạm vi một tiến trình, nên không thể dựa vào nó để đảm bảo tính duy nhất toàn hệ thống (ví dụ counter, lock) — phải dùng Redis hay DB.

Cách thay thế lành mạnh: để DI container quản lý vòng đời "một instance mỗi app" và **tiêm qua constructor**. Vẫn một instance, nhưng test thay được.

</details>

**5. Cả `Decorator`, `Proxy` và `Adapter` đều "bọc" một object. Phân biệt ba pattern này theo mục đích sử dụng, kèm ví dụ.**

<details className="qa">
<summary>Xem đáp án</summary>

Cấu trúc giống nhau (đều wrap), khác nhau ở **ý định**:

| Pattern | Mục đích | Interface sau khi bọc | Ví dụ |
| --- | --- | --- | --- |
| `Adapter` | Làm interface không tương thích dùng được | **Đổi** sang interface client cần | Cục chuyển phích cắm; bọc SDK cũ cho khớp interface mới |
| `Decorator` | **Thêm** hành vi mà không sửa class gốc | Giữ nguyên | Ly trà sữa thêm trân châu; thêm logging/retry/cache quanh một service |
| `Proxy` | **Kiểm soát truy cập** tới object gốc | Giữ nguyên | Lazy load, kiểm tra quyền, remote call, rate limit |

Mẹo phân biệt nhanh: `Adapter` đổi hình dạng, `Decorator` cộng thêm chức năng, `Proxy` đứng gác cửa. `Decorator` và `Proxy` dễ lẫn nhất — hãy hỏi "object bọc có làm giàu thêm kết quả không (Decorator), hay chỉ quyết định cho phép / trì hoãn / chuyển tiếp lời gọi (Proxy)?".

</details>

**6. `Observer pattern` hoạt động thế nào ở mức code? Nó liên hệ ra sao với `pub/sub` ở mức hệ thống phân tán?**

<details className="qa">
<summary>Xem đáp án</summary>

Ở mức code, `Observer` gồm một **subject** giữ danh sách observer; ai quan tâm thì `subscribe`, khi state đổi subject gọi lần lượt callback của từng observer. Người quan sát tự đăng ký, subject không cần biết trước có ai — giống việc đăng ký nhận báo: có số mới toà soạn gửi tới.

Ở mức hệ thống phân tán, `pub/sub` là chính tư tưởng đó nhưng **có broker đứng giữa** (Kafka, RabbitMQ, EventBridge). Khác biệt quan trọng:

- Observer thường **đồng bộ, trong cùng tiến trình**, subject giữ tham chiếu trực tiếp tới observer → nếu quên `unsubscribe` sẽ rò rỉ bộ nhớ.
- Pub/sub **bất đồng bộ, qua mạng**: producer và consumer không biết nhau, không cùng vòng đời; đổi lại phải xử lý retry, message trùng, thứ tự, và eventual consistency.

Nói cách khác: pub/sub là Observer ở quy mô hệ thống, với cái giá là độ tin cậy của mạng.

</details>

**7. `Repository pattern` giải quyết vấn đề gì? Có ý kiến cho rằng ORM đã đóng vai trò repository rồi nên thêm một lớp nữa là thừa — bạn phản biện thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`Repository` **trừu tượng hóa việc truy cập dữ liệu**: tầng business gọi `orderRepo.findPendingByUser(id)` chứ không viết query trực tiếp. Nhờ đó query nằm gọn một chỗ, business logic không dính chi tiết lưu trữ, và test dễ hơn vì thay repository bằng bản giả là xong.

Phản biện lại ý kiến "ORM là đủ": đúng một phần — với CRUD app đơn giản, thêm repository chỉ để gọi lại y hệt ORM (`findMany`, `create`) thì đó là lớp thừa thật. Nhưng repository vẫn đáng giá khi:

- Cần đặt tên theo **ngôn ngữ nghiệp vụ** thay vì ngôn ngữ ORM, giữ Ubiquitous Language trong code.
- Một truy vấn phức tạp bị lặp ở nhiều nơi → gom về một chỗ.
- Nguồn dữ liệu không chỉ là DB: cache, API bên thứ ba, nhiều bảng ghép lại.
- Muốn tầng domain **không phụ thuộc** vào kiểu dữ liệu của ORM.

Kết luận thực dụng: đừng viết repository máy móc cho mọi bảng; viết cho những chỗ có logic truy vấn thật.

</details>

**8. `Unit of Work` là gì, và nó phối hợp với `Repository` ra sao để quản lý ranh giới transaction?**

<details className="qa">
<summary>Xem đáp án</summary>

`Unit of Work` theo dõi mọi thay đổi xảy ra trong một nghiệp vụ rồi **gom lại commit một lần** trong cùng transaction — hoặc rollback toàn bộ nếu có lỗi. Nó trả lời câu hỏi: "ranh giới transaction nằm ở đâu?".

Phân vai rõ ràng:

- **Repository** lo *cái gì* được đọc/ghi (truy vấn, lưu entity).
- **Unit of Work** lo *khi nào* những thay đổi đó thực sự chạm database.

Trong thực tế, các repository cùng tham gia một nghiệp vụ phải dùng **chung một session/transaction** thì mới nguyên tử được. Ví dụ đặt hàng: trừ tồn kho, tạo order, ghi log — nếu trừ tồn kho thành công mà tạo order lỗi thì phải rollback cả ba.

Nhiều ORM đã cài sẵn khái niệm này (`DbContext`, session của SQLAlchemy/Hibernate, `prisma.$transaction`), nên thường bạn chỉ cần **đặt ranh giới transaction ở tầng service/use case**, không rải rác trong từng repository.

</details>

**9. `Dependency Injection` mang lại lợi ích gì cho khả năng test? So sánh constructor injection với `Service Locator`.**

<details className="qa">
<summary>Xem đáp án</summary>

`DI` nghĩa là class **nhận** dependency từ bên ngoài thay vì tự tạo. Lợi ích cho test rất trực tiếp: muốn test `OrderService` mà không đụng DB hay gọi Stripe thật, chỉ cần truyền vào bản giả lúc khởi tạo — không cần monkey-patch, không cần mock module toàn cục.

| | Constructor injection | `Service Locator` |
| --- | --- | --- |
| Cách lấy dependency | Truyền vào constructor | Class tự hỏi một registry toàn cục |
| Dependency lộ ra ở đâu | Ngay signature — nhìn là biết | Ẩn trong thân hàm, phải đọc code mới biết |
| Thiếu dependency | Phát hiện sớm, lúc khởi tạo | Lỗi lúc runtime, khi nhánh code đó chạy tới |
| Test | Truyền fake trực tiếp | Phải dựng/reset registry, dễ rò rỉ state giữa test |

Vì vậy constructor injection được ưa dùng hơn; `Service Locator` thường bị coi là "Singleton trá hình" vì nó giấu coupling. Ngoại lệ chấp nhận được: dependency chỉ dùng trong một nhánh hiếm và rất nặng, khi đó truyền vào một factory cũng vẫn hơn dùng locator.

</details>

**10. Trong `DDD`, phân biệt `Entity` và `Value Object`. Cho ví dụ cụ thể và giải thích vì sao `Value Object` nên `immutable`.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Entity** — có **identity** riêng, thuộc tính đổi nhưng vẫn là nó. Giống cái căn cước: đổi tên, đổi địa chỉ thì vẫn là một người, vì số định danh không đổi. Ví dụ: `User`, `Order`.
- **Value Object** — **không có identity**, bằng nhau khi mọi giá trị bằng nhau. Giống tờ 50 nghìn: hai tờ cùng mệnh giá là như nhau. Ví dụ: `Money`, `Address`, khoảng thời gian.

Vì sao Value Object nên immutable? Vì danh tính của nó *chính là* giá trị — sửa giá trị tức là biến nó thành một thứ khác. Nếu cho phép sửa tại chỗ, mọi nơi đang giữ tham chiếu tới object đó sẽ bị đổi theo (aliasing bug), và nó không còn dùng được làm key trong Map/Set.

```ts
class Money {
  constructor(readonly amount: number, readonly currency: string) {}
  add(other: Money): Money {                 // trả về instance mới
    if (other.currency !== this.currency) throw new Error("Currency mismatch");
    return new Money(this.amount + other.amount, this.currency);
  }
}
```

Bonus: Value Object là nơi lý tưởng để nhét validation (không cho số âm, sai currency).

</details>

**11. `Aggregate` và `Aggregate Root` là gì? Vì sao mọi thay đổi buộc phải đi qua root, và bạn dựa vào đâu để vạch ranh giới một aggregate?**

<details className="qa">
<summary>Xem đáp án</summary>

**Aggregate** là một cụm entity + value object được coi là **một khối nhất quán**; **Aggregate Root** là entity duy nhất mà bên ngoài được phép cầm và gọi. Giống cái đơn hàng kẹp cả xấp phiếu món: thêm hay bớt món đều phải đi qua tờ bìa đơn hàng.

Vì sao buộc qua root? Vì **invariant** (bất biến nghiệp vụ) chỉ được bảo vệ khi có một cửa duy nhất. Nếu ai cũng sửa thẳng `OrderItem` thì không chỗ nào kiểm tra được "đơn đã thanh toán thì không sửa được nữa" hay "tổng tiền phải khớp":

```ts
addItem(productId: string, qty: number, price: Money) {
  if (this.status !== "draft") throw new Error("Cannot modify paid order");
  this.items.push(new OrderItem(productId, qty, price));
}
```

Vạch ranh giới dựa trên: (1) những gì phải **đúng ngay lập tức cùng lúc** thì nằm chung một aggregate, những gì chấp nhận eventual consistency thì tách ra; (2) aggregate nên **nhỏ** — to quá sẽ khóa nhiều, tranh chấp cao; (3) giữa các aggregate tham chiếu **bằng id**, không giữ object trực tiếp; (4) một transaction lý tưởng chỉ sửa một aggregate.

</details>

**12. `Bounded Context` là gì? Cùng chữ "Customer" có thể mang nghĩa khác nhau ở hai context — bạn ánh xạ giữa chúng ra sao (`Context Map`, `Anti-Corruption Layer`)?**

<details className="qa">
<summary>Xem đáp án</summary>

**Bounded Context** là ranh giới mà trong đó một mô hình và bộ thuật ngữ có nghĩa nhất quán. Như bệnh viện: chữ "bệnh nhân" mỗi khoa hiểu một kiểu — phòng khám quan tâm triệu chứng, thu ngân quan tâm mã bảo hiểm, kho thuốc quan tâm liều đã phát. Ép cả bệnh viện dùng chung một bảng khổng lồ thì sửa chỗ nào cũng đụng chỗ khác.

Với "Customer": ở context Sales đó là *cơ hội bán hàng* (lead score, người liên hệ); ở Billing đó là *đối tượng xuất hóa đơn* (mã số thuế, hạn thanh toán). Đừng cố gộp thành một model chung — hãy để mỗi context có model riêng, liên kết qua `customerId`.

Ánh xạ giữa chúng:

- **Context Map** — tấm sơ đồ ghi rõ context nào gửi dữ liệu cho context nào và bên nào phải chiều theo bên nào (upstream/downstream, shared kernel, customer-supplier...).
- **Anti-Corruption Layer (ACL)** — lớp dịch đặt ở biên: dữ liệu từ context ngoài (hoặc hệ thống legacy) đi qua đây để **chuyển sang mô hình nội bộ** trước khi chạm domain. Nhờ vậy mô hình bên ngoài thay đổi thì chỉ sửa lớp dịch, domain không bị "nhiễm".

</details>

**13. `Ubiquitous Language` giúp gì trong thực tế? Cho ví dụ một đoạn code phản ánh sai ngôn ngữ nghiệp vụ và cách sửa.**

<details className="qa">
<summary>Xem đáp án</summary>

`Ubiquitous Language` là việc **dùng đúng một bộ từ vựng** giữa business và code: nghiệp vụ gọi là "ca cấp cứu" thì trong code cũng phải mang tên đó, không ai được tự chế thành `urgentItem`. Lợi ích thực tế: họp với domain expert không phải "phiên dịch" hai chiều, đọc code là hiểu nghiệp vụ, và bug do hiểu nhầm thuật ngữ giảm hẳn.

Ví dụ phản ánh sai — code nói bằng ngôn ngữ kỹ thuật, mất hẳn ý định nghiệp vụ:

```ts
order.status = 2;
order.flag = true;
db.update(order);
```

Sửa lại theo ngôn ngữ nghiệp vụ, hành vi tự mô tả chính nó:

```ts
order.markAsPaid();     // bên trong: kiểm tra đơn không rỗng, chuyển sang "paid"
```

Dấu hiệu ngôn ngữ đang trôi: tên biến kiểu `data`, `info`, `flag`, `type2`; hoặc một khái niệm có ba tên khác nhau ở ba module. Cách giữ: thống nhất thuật ngữ trong glossary, và mỗi khi business đổi cách gọi thì **đổi tên trong code theo**.

</details>

**14. Khi nào `DDD` là overkill? Với một CRUD app đơn giản, bạn dùng cấu trúc nào thay thế và vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

`DDD` là khoản **đầu tư trước, hưởng lợi sau** — chỉ hoàn vốn khi codebase và team đủ lớn. Nó overkill với: CRUD app đơn giản, startup MVP đang dò tìm sản phẩm, project nhỏ dưới ~20k LOC, hoặc khi không có domain expert để cùng làm việc. Nghiệp vụ mỏng mà dựng đủ entity, value object, aggregate, repository, domain service thì chỉ tạo ra tầng tầng lớp lớp bọc quanh một câu `INSERT`.

Ngược lại, `DDD` xứng đáng khi business phức tạp thật (ngân hàng, bảo hiểm, ERP), project chạy dài trên một năm, và có nhiều bounded context.

Thay thế cho app đơn giản — bộ ba đủ cho khoảng 80% trường hợp:

- **Service layer** — gom business logic theo feature, tách khỏi route/controller.
- **Repository** — trừu tượng hóa truy cập DB ở những chỗ query thật sự phức tạp.
- **DTO** — validate input/output ở biên.

Có thể áp dụng "DDD-lite": mượn vài ý hay như value object và đặt tên theo ngôn ngữ nghiệp vụ, mà không kéo theo toàn bộ bộ khung.

</details>

**15. Mô tả `Event-Driven Architecture`. So sánh với kiến trúc gọi API trực tiếp về mức độ coupling, khả năng chịu lỗi và độ khó khi debug.**

<details className="qa">
<summary>Xem đáp án</summary>

Trong **Event-Driven Architecture**, service không gọi thẳng nhau mà **phát event lên broker**; ai quan tâm thì tự đăng ký nghe. Order Service publish `order.created`, rồi Email Service gửi xác nhận, Inventory Service giữ hàng, Analytics Service ghi nhận — producer không biết ba anh kia tồn tại. Giống bếp gõ chuông hô "bàn 5 xong món" rồi quay đi nấu tiếp.

| Tiêu chí | Gọi API trực tiếp | Event-driven |
| --- | --- | --- |
| Coupling | Chặt — producer biết địa chỉ và interface của từng consumer | Lỏng — chỉ biết tên event |
| Thêm tính năng mới | Sửa producer | Thêm subscriber, producer không đổi |
| Consumer chết | Request lỗi ngay, lan ngược về người dùng | Event nằm trong queue, xử lý lại sau |
| Tính nhất quán | Đồng bộ, thấy kết quả ngay | Eventual consistency |
| Debug | Dễ — stack trace liền mạch | Khó — phải lần theo chuỗi event qua nhiều service, cần distributed tracing (correlation id) |

Tóm lại: đổi sự đơn giản khi debug và tính tức thời lấy khả năng mở rộng và chịu lỗi.

</details>

**16. Phân biệt `event`, `command` và `message`. Bạn đặt tên event theo quy ước nào và vì sao thì quá khứ?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `Command` | `Event` |
| --- | --- | --- |
| Ý nghĩa | Yêu cầu **hãy làm** một việc | Thông báo một việc **đã xảy ra** |
| Người nhận | Đúng một handler | Không giới hạn, ai quan tâm thì nghe |
| Có thể bị từ chối | Có — validate rồi reject | Không, sự thật đã rồi |
| Hướng phụ thuộc | Người gửi biết ai sẽ xử lý | Người phát không biết ai nghe |
| Ví dụ | `CreateOrder`, `CancelSubscription` | `OrderCreated`, `PaymentFailed` |

`Message` là khái niệm bao trùm — đơn vị dữ liệu chạy qua broker; command, event (và query/reply) đều là message.

**Quy ước đặt tên event: danh từ nghiệp vụ + động từ ở thì quá khứ** — `order.created`, `payment.failed`, `user.email_changed`. Lý do: event mô tả **sự thật đã xảy ra rồi**, không thể rút lại. Đặt tên quá khứ giúp tránh cái bẫy phổ biến là biến event thành command trá hình: `send_confirmation_email` nghe như ra lệnh, buộc producer biết consumer phải làm gì — coupling quay trở lại. Đặt là `order.created` thì producer chỉ kể sự kiện, mỗi consumer tự quyết định phản ứng.

</details>

**17. Broker thường chỉ đảm bảo `at-least-once delivery`, nghĩa là consumer có thể nhận trùng. Bạn thiết kế consumer `idempotent` bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`Idempotent` nghĩa là xử lý cùng một event một lần hay mười lần thì kết quả cuối vẫn như nhau. Vì broker ack có thể mất, consumer có thể chết giữa chừng, nên **phải giả định message sẽ đến trùng**.

Các cách thường dùng:

- **Bảng khử trùng** — mỗi event mang `eventId` duy nhất; consumer ghi id đó vào bảng có unique constraint **trong cùng transaction** với việc xử lý. Gặp lại id cũ thì bỏ qua.
- **Upsert thay vì insert/increment** — gán trạng thái tuyệt đối (`status = 'paid'`) thay vì phép cộng dồn (`balance += 100`). Phép gán tự nó idempotent, phép cộng thì không.
- **Kiểm tra trạng thái trước khi hành động** — "đơn này đã gửi email xác nhận chưa?".
- **Khóa lạc quan theo version** — event mang version kỳ vọng, cập nhật chỉ thành công nếu version khớp; event cũ đến trễ bị loại.

Hai lưu ý: thao tác **có tác dụng phụ ra ngoài** (gửi email, charge thẻ) cần khóa ngoài hệ thống bằng idempotency key của nhà cung cấp; và event có thể đến **sai thứ tự**, nên nhiều khi cần kiểm tra cả version chứ không chỉ id.

</details>

**18. `Schema evolution` của event: khi cần thêm hoặc đổi field mà đã có nhiều consumer đang chạy, làm sao để không phá vỡ hệ thống? Nói về backward/forward compatibility và versioning.**

<details className="qa">
<summary>Xem đáp án</summary>

Vấn đề cốt lõi: producer và consumer **deploy không cùng lúc**, và event cũ có thể còn nằm trong queue (hoặc trong event store vĩnh viễn). Hai khái niệm:

- **Backward compatible** — code mới đọc được dữ liệu cũ.
- **Forward compatible** — code cũ đọc được dữ liệu mới (bỏ qua field lạ thay vì crash).

Nguyên tắc thực hành:

- Thêm field mới **luôn optional, có giá trị mặc định** — đây là thay đổi an toàn.
- **Không xóa, không đổi tên, không đổi kiểu** field đang có. Muốn bỏ thì thêm field mới, chuyển dần consumer sang, đợi hết vòng đời rồi mới gỡ.
- Consumer viết theo kiểu **tolerant reader**: chỉ đọc field mình cần, bỏ qua field lạ.
- Thay đổi không tương thích được thì tạo **version mới** — `order.created.v2` hoặc gắn field `version` trong payload — và cho v1, v2 chạy song song một thời gian.
- Dùng **schema registry** (Avro/Protobuf/JSON Schema) để kiểm tra tính tương thích ngay lúc CI, chặn thay đổi phá vỡ trước khi lên production.

Thứ tự triển khai an toàn: nâng cấp **consumer trước**, producer sau.

</details>

**19. Giải thích `CQRS`. Việc tách read model khỏi write model đem lại lợi ích gì, và bạn phải trả giá bằng gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**CQRS (Command Query Responsibility Segregation)** tách đường **ghi** (command) và đường **đọc** (query) thành hai model riêng. Giống ngân hàng: quầy giao dịch chậm và kỹ thì chỉ cần một hai cái; máy tra cứu chỉ để xem nên đặt hai chục cái khắp sảnh.

**Lợi ích:**

- **Tối ưu riêng** — bên ghi giữ ràng buộc chặt, chuẩn hóa; bên đọc denormalize sẵn, materialized view, không cần join lúc chạy.
- **Scale riêng** — read replica nhân nhiều, write giữ một.
- **Model phù hợp mục đích** — read model phẳng, đúng hình dạng màn hình dashboard cần.

**Cái giá:**

- **Phức tạp gấp đôi** — hai model, hai đường code phải cùng bảo trì.
- **Eventual consistency** — read trễ sau write một nhịp.
- **Cần cơ chế đồng bộ** — qua event hoặc replication, và phải xử lý khi nó lỗi/tụt hậu.

Phù hợp khi read áp đảo write rõ rệt, hoặc khi reporting và transactional dùng chung DB đã không còn scale nổi. Thực dụng nhất là **áp dụng cho từng feature** (dashboard, báo cáo) chứ không cho toàn app.

</details>

**20. `CQRS` có bắt buộc đi kèm `Event Sourcing` không? Hai pattern này quan hệ với nhau ra sao và có thể dùng riêng lẻ không?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không bắt buộc.** Đây là hai pattern độc lập, hay đi chung vì bổ trợ nhau nhưng hoàn toàn dùng riêng được.

- **CQRS không kèm ES** — rất phổ biến và là lựa chọn mặc định nên thử trước. Vẫn ghi state hiện tại vào bảng như bình thường, chỉ dựng thêm read model riêng: materialized view của Postgres, bảng denormalized cập nhật bằng trigger/job, hoặc index Elasticsearch cho tìm kiếm.
- **ES không kèm CQRS** — làm được nhưng khó chịu, vì muốn truy vấn phải replay event. Thực tế chỉ hợp khi lượng đọc rất ít.
- **Đi chung** — ES sinh ra sẵn chuỗi event, chính là nguồn tự nhiên để build và rebuild read model (projection); còn CQRS cho phép bên đọc có bảng tối ưu, gỡ đúng điểm yếu truy vấn của ES. Vì vậy ES gần như luôn kéo theo CQRS.

Chiều phụ thuộc, nói gọn: **ES thường cần CQRS; CQRS không cần ES**. Lời khuyên: bắt đầu bằng CQRS nhẹ nhàng cho vài feature đọc nặng, chỉ thêm ES khi có lý do rõ ràng như yêu cầu audit mang tính pháp lý.

</details>

**21. Với `CQRS`, read model luôn trễ hơn write một nhịp. Người dùng vừa tạo đơn xong, load lại thì không thấy — bạn xử lý tình huống này ở tầng nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Đây là bài toán **read-your-own-writes**. Có nhiều tầng để xử lý, chọn theo mức độ nghiêm trọng:

- **Tầng UI** — cách rẻ nhất: sau khi command thành công, hiển thị ngay dữ liệu mà client đã có (optimistic update) thay vì fetch lại. Hoặc chuyển hướng tới trang chi tiết đơn với dữ liệu trả về từ chính command.
- **Tầng API** — command trả về luôn id và trạng thái vừa tạo, để client không phải hỏi lại.
- **Tầng routing/đọc** — với những truy vấn cần dữ liệu tươi, cho đọc thẳng từ write model (hoặc primary thay vì replica). Chỉ áp dụng cho một số ít endpoint nhạy cảm.
- **Tầng đồng bộ** — command trả về một **version/token**; query kèm token đó và đợi read model bắt kịp mới trả lời (hoặc client poll trong vài trăm ms).
- **Tầng trải nghiệm** — với nghiệp vụ vốn dĩ bất đồng bộ, nói thẳng với người dùng: "đơn đang được xử lý", kèm trạng thái.

Nguyên tắc chung: **đừng cố ép toàn hệ thống nhất quán mạnh**; chỉ xử lý đúng những luồng mà người dùng thực sự nhìn thấy ngay sau khi hành động.

</details>

**22. `Event Sourcing` lưu gì thay cho current state? Nêu lợi ích (`audit trail`, `time-travel`, `replay`) và các khó khăn thực tế khi vận hành lâu dài.**

<details className="qa">
<summary>Xem đáp án</summary>

Thay vì lưu **trạng thái hiện tại**, `Event Sourcing` lưu **toàn bộ chuỗi sự kiện đã xảy ra**, chỉ append, không sửa không xóa; trạng thái hiện tại là kết quả replay chuỗi đó. Giống cuốn sổ cái kế toán: chỉ ghi thêm "nạp 5 triệu", "rút 1 triệu"; muốn biết số dư thì cộng dồn.

```
users table (truyền thống):  id: 1, name: "An Nguyen"

events table (ES):
  1  UserCreated       { id: 1, name: "An" }
  2  UserEmailChanged  { id: 1, email: "..." }
  3  UserNameChanged   { id: 1, name: "An Nguyen" }
```

**Lợi ích:** audit trail đầy đủ (biết ai đổi gì, lúc nào, vì sao); time-travel (dựng lại trạng thái tại bất kỳ thời điểm nào); replay để rebuild read model khi phát hiện bug hoặc cần view mới; một chuỗi event sinh được nhiều projection khác nhau.

**Khó khăn khi vận hành lâu dài:** store phình mãi mãi; replay stream dài rất chậm nên phải có snapshot; truy vấn ad-hoc khó vì không có bảng state; **schema evolution của event cực khó** vì event cũ tồn tại vĩnh viễn, code mới vẫn phải đọc được; và xóa dữ liệu cá nhân theo yêu cầu pháp lý xung đột với bản chất append-only (thường phải mã hóa rồi vứt khóa).

</details>

**23. Trong `Event Sourcing`, `snapshot` dùng để làm gì? Khi một stream có hàng trăm nghìn event, bạn tối ưu việc dựng lại state thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Snapshot** là bản chụp trạng thái của aggregate tại một version cụ thể — giống việc chốt sẵn "số dư cuối tháng" để khỏi cộng lại từ dòng đầu cuốn sổ. Khi cần dựng state, hệ thống nạp snapshot gần nhất rồi **chỉ replay những event sau đó**, thay vì chạy lại từ event số 1.

Cách tối ưu một stream dài:

- **Chụp snapshot định kỳ** theo số event (ví dụ mỗi vài trăm event) hoặc theo thời gian; lưu kèm version để biết replay tiếp từ đâu.
- Coi snapshot là **cache dẫn xuất được**, không phải nguồn sự thật: hỏng hay lệch thì xóa đi, rebuild lại từ event.
- **Đánh version cho snapshot** — khi logic dựng state đổi, snapshot cũ phải bị vô hiệu hóa, nếu không sẽ dựng ra state sai.
- **Xem lại ranh giới aggregate** — stream dài tới hàng trăm nghìn event thường là dấu hiệu aggregate bị vẽ quá to; chia nhỏ là cách chữa tận gốc.
- Với nhu cầu **đọc**, đừng dựng aggregate — dùng read model/projection đã tính sẵn (đúng tinh thần CQRS). Snapshot chỉ phục vụ đường **ghi**, khi cần load aggregate để kiểm tra invariant.

</details>

**24. Một event sai đã được ghi vào event store append-only, không được phép sửa hay xoá. Bạn khắc phục bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc bất di bất dịch: **lịch sử không được viết lại**. Cách chữa là **ghi thêm một event mới để bù trừ** — đúng như kế toán không tẩy xóa mà lập bút toán điều chỉnh.

Các hướng xử lý:

- **Compensating event** — phát event đảo ngược tác động: `OrderCancelled`, `PaymentRefunded`, `AmountCorrected`. Đây là cách chuẩn và cũng phản ánh đúng nghiệp vụ ngoài đời.
- **Corrective event** — nếu chỉ sai dữ liệu (gõ nhầm số tiền), ghi event mới mang giá trị đúng cùng lý do sửa, để projection tính lại.
- **Rebuild projection** — sau khi có event bù, chạy lại read model để mọi view phản ánh trạng thái đúng.
- **Ép projection bỏ qua event lỗi** — dùng khi event vốn không bao giờ hợp lệ (bug sinh rác): đánh dấu và cho logic projection loại nó ra. Cần ghi chép rõ vì đây là ngoại lệ.

Chỉ trong tình huống cực đoan (dữ liệu nhạy cảm buộc phải xóa theo luật) mới dùng tới **stream rewrite / migration**: viết stream mới đã loại bỏ, chuyển hẳn sang — thao tác rủi ro, phải có kế hoạch và backup cẩn thận.

</details>

**25. Bạn được yêu cầu áp dụng `DDD` + `CQRS` + `Event Sourcing` cho một dự án mới. Bạn đặt những câu hỏi gì trước khi đồng ý, và trong trường hợp nào bạn khuyên nên từ chối?**

<details className="qa">
<summary>Xem đáp án</summary>

Những câu cần hỏi trước:

- **Business phức tạp tới đâu?** Có nhiều invariant, nhiều trạng thái chuyển đổi, có domain expert cùng làm việc không — hay thực chất chỉ là CRUD?
- **Tỉ lệ read/write thực tế** là bao nhiêu? Có số đo cụ thể chứng minh read áp đảo không?
- **Audit trail có phải yêu cầu pháp lý** không, hay chỉ là "có thì tốt"? Nếu chỉ cần lịch sử thay đổi, một bảng audit log đơn giản là đủ.
- **Team đã làm ES bao giờ chưa?** Ai vận hành khi projection lệch lúc 2 giờ sáng?
- **Đội ngũ chấp nhận eventual consistency tới mức nào** về mặt sản phẩm?
- **Dự án sống bao lâu?** Dưới một năm thì gần như chắc chắn không hoàn vốn.

Nên **từ chối** khi: app là CRUD hoặc MVP startup còn đang dò sản phẩm; team chưa có kinh nghiệm và không có thời gian học; không có yêu cầu audit hay scale thật, chỉ chạy theo trào lưu.

Đề xuất thay thế cho phần lớn trường hợp: **modular monolith + service layer + repository + PostgreSQL với DDD-lite**, thêm queue cho việc async, materialized view khi cần đọc nhanh. Đủ phục vụ tới vài triệu user; tăng độ phức tạp khi đo được là cần, chứ không phải khi đoán.

</details>
