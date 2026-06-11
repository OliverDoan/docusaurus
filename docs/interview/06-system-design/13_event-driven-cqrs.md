---
sidebar_position: 13
title: "13. Event-Driven & CQRS"
---

# Event-Driven & CQRS

> *Event-driven architecture, CQRS, Event Sourcing và message queue là bộ câu hỏi phân loại Senior trong phỏng vấn system design. Interviewer không cần bạn thuộc định nghĩa — họ muốn xem bạn có biết **khi nào KHÔNG nên dùng** những pattern này, và có hiểu cái giá của eventual consistency hay không.*

---

## Câu 15: CQRS Pattern là gì? Khi nào nên áp dụng, thách thức gì? `[Advanced]`

### Câu hỏi

> CQRS (Command Query Responsibility Segregation) là gì? Khi nào nên áp dụng pattern này, và nó mang lại những thách thức gì?

### Giải thích lý thuyết

**CQRS = tách model xử lý ghi (Command) và model xử lý đọc (Query) thành hai đường riêng biệt**, thay vì dùng chung một model CRUD như truyền thống.

- **Command side**: nhận lệnh thay đổi state (`CreateOrder`, `CancelOrder`), chứa toàn bộ business rules và validation. Command **không trả về data** — chỉ thành công/thất bại.
- **Query side**: chỉ đọc, **không có business logic** — trả về DTO được shape sẵn cho từng màn hình. Query **không bao giờ thay đổi state**.

CQRS có **nhiều mức độ**, không phải all-or-nothing — đây là ý interviewer muốn nghe:

| Mức độ | Mô tả | Độ phức tạp |
| ------ | ----- | ----------- |
| Mức 1 — tách interface | Cùng 1 DB, tách `CommandService` / `QueryService`; query bypass domain model, đọc thẳng SQL | Thấp — gần như free |
| Mức 2 — tách model | Cùng DB nhưng write model normalize, read model là view/materialized view denormalize | Trung bình |
| Mức 3 — tách hẳn datastore | Write vào PostgreSQL, sync qua event sang read store (Elasticsearch, Redis, Mongo) | Cao — eventual consistency |

**Lợi ích chính** (rõ nhất ở mức 3):

- **Tối ưu độc lập hai phía**: write model normalize chặt chẽ để giữ invariant; read model denormalize sẵn theo từng screen — query 1 lần, không JOIN 8 bảng. Search phức tạp đẩy sang Elasticsearch.
- **Scale lệch**: hầu hết hệ thống đọc nhiều hơn ghi 10–100 lần — scale read replicas/read store độc lập mà không đụng write side.
- **Domain model sạch**: write model không bị "ô nhiễm" bởi hàng chục field chỉ phục vụ hiển thị.

**Thách thức** — phần ăn điểm:

- **Eventual consistency**: read model sync qua event nên **trễ** so với write model (vài ms đến vài giây). User vừa tạo order, refresh trang có thể chưa thấy → cần kỹ thuật UX như optimistic update, read-your-own-writes (đọc tạm từ write side cho chính user đó).
- **Sync pipeline là một hệ thống phải vận hành**: event bị mất, xử lý trùng, sai thứ tự → cần idempotent projection, retry, cơ chế rebuild read model.
- **Complexity tăng mạnh**: gấp đôi số model, thêm message broker, thêm projection worker — chi phí code + vận hành + onboarding.

**Khi nào dùng**: read/write pattern khác nhau cực đoan (write ít, read khổng lồ với query phức tạp), collaborative domain nhiều người cùng sửa một aggregate, hoặc cần audit/event stream sẵn (đi kèm Event Sourcing).

**Khi nào KHÔNG**: CRUD đơn giản, admin tool, app nhỏ — CQRS đầy đủ ở đây là over-engineering kinh điển. Trả lời được vế này mới chứng tỏ kinh nghiệm thật.

### Thiết kế minh hoạ

```text
                       CQRS mức 3 — tách datastore

  Client ──Command──▶ ┌──────────────┐    events    ┌─────────────────┐
  (POST /orders)      │ Command side │ ───────────▶ │  Message broker │
                      │ (domain model│   OrderCreated│  (Kafka/Rabbit) │
                      │  + validate) │              └────────┬────────┘
                      └──────┬───────┘                       │
                             ▼                               ▼
                      ┌──────────────┐              ┌─────────────────┐
                      │  Write DB    │              │ Projection      │
                      │ (PostgreSQL, │              │ worker          │
                      │  normalized) │              └────────┬────────┘
                      └──────────────┘                       ▼
                                                    ┌─────────────────┐
  Client ◀──Query──── ┌──────────────┐              │  Read store     │
  (GET /orders?...)   │  Query side  │ ◀─────────── │ (Elasticsearch/ │
                      │ (DTO, no     │              │  denormalized)  │
                      │  logic)      │              └─────────────────┘
                      └──────────────┘   ⚠ eventual consistency (trễ ms→s)
```

```typescript
// Command side — chứa business rules, không trả data
class CancelOrderHandler {
  async handle(cmd: CancelOrderCommand): Promise<void> {
    const order = await this.repo.findById(cmd.orderId);
    // Validate invariant ở write model
    if (order.status === "SHIPPED") {
      throw new DomainError("Đơn đã giao thì không huỷ được");
    }
    const cancelled = order.cancel(cmd.reason); // tạo state mới, không mutate
    await this.repo.save(cancelled);
    // Publish event để projection sync sang read store
    await this.eventBus.publish(new OrderCancelled(order.id, cmd.reason));
  }
}

// Query side — không business logic, đọc read store denormalized
class OrderQueryService {
  async search(filter: OrderFilter): Promise<OrderListItemDTO[]> {
    // 1 query duy nhất vào Elasticsearch — không JOIN, shape sẵn cho UI
    return this.esClient.search("orders_view", filter);
  }
}

// Projection worker — PHẢI idempotent vì event có thể delivery lại
class OrderProjection {
  async on(event: OrderCancelled): Promise<void> {
    // upsert theo id → xử lý trùng event vẫn cho kết quả đúng
    await this.esClient.upsert("orders_view", event.orderId, {
      status: "CANCELLED",
      cancelledReason: event.reason,
    });
  }
}
```

### Đáp án mẫu

> "CQRS là tách model write và read: command side chứa business rules, nhận lệnh thay đổi state; query side chỉ đọc, trả DTO shape sẵn cho UI. Em hay nhấn mạnh CQRS có nhiều mức — nhẹ nhất là tách interface trên cùng một DB, nặng nhất là tách hẳn datastore: write vào Postgres normalize, sync qua event sang Elasticsearch denormalize cho read. Lợi ích là tối ưu và scale độc lập hai phía, vì hầu hết hệ thống đọc nhiều hơn ghi rất nhiều. Cái giá lớn nhất là eventual consistency — read model trễ so với write, user vừa tạo xong refresh chưa thấy, nên em phải làm read-your-own-writes hoặc optimistic UI, và projection phải idempotent vì event có thể đến trùng. Complexity tăng gấp đôi, nên em chỉ áp dụng khi read/write pattern lệch cực đoan hoặc đi kèm Event Sourcing — còn CRUD đơn giản thì CQRS đầy đủ là over-engineering."

---

## Câu 16: Event Sourcing là gì? Lợi ích và hạn chế so với traditional state storage? `[Advanced]`

### Câu hỏi

> Event Sourcing là gì? So với cách lưu state hiện tại truyền thống (CRUD update), nó có lợi ích và hạn chế gì? Khi nào nên dùng?

### Giải thích lý thuyết

**Event Sourcing = lưu chuỗi event bất biến (immutable) mô tả những gì đã xảy ra, thay vì lưu state hiện tại.** State của entity không nằm trong bảng nào cả — nó được **tính ra bằng cách replay toàn bộ event** từ đầu.

So sánh với traditional state storage:

| | Traditional (CRUD) | Event Sourcing |
| --- | --- | --- |
| Lưu gì | State hiện tại (1 row) | Chuỗi event append-only |
| Update | `UPDATE ... SET balance = 80` — **ghi đè, mất lịch sử** | Append `MoneyWithdrawn(20)` — không xoá/sửa gì |
| Đọc state | `SELECT` trực tiếp | Replay events (hoặc đọc snapshot/projection) |
| Lịch sử | Mất (trừ khi tự làm audit table) | Có sẵn, hoàn hảo, là source of truth |
| Query ad-hoc | Dễ | Khó — phải build projection |

Cơ chế cốt lõi:

- **Append-only event store**: event đã ghi thì **không bao giờ sửa/xoá**. Mỗi event gắn version của aggregate → optimistic concurrency (hai writer cùng version thì một bên fail).
- **Snapshot**: aggregate sống lâu có hàng nghìn event → replay chậm. Định kỳ lưu snapshot state tại version N, lần sau load snapshot + replay event sau N.
- **Projection**: vì query trực tiếp event store gần như bất khả thi, phải build read model (projection) từ event — nên Event Sourcing **gần như luôn đi kèm CQRS**.

**Lợi ích:**

- **Audit trail hoàn hảo, miễn phí**: biết chính xác ai làm gì, lúc nào, theo thứ tự nào — yêu cầu bắt buộc trong banking, kế toán, compliance.
- **Time travel & debug**: tái hiện state tại bất kỳ thời điểm nào ("số dư lúc 23:59 ngày 31/12 là bao nhiêu?"), replay lại để debug bug production.
- **Rebuild projection mới từ event cũ**: 6 tháng sau cần report mới — replay toàn bộ event lịch sử để build view chưa từng tồn tại. Với CRUD, data đã mất là mất.
- Event store tự nhiên là **integration point**: service khác subscribe event mà không cần API mới.

**Hạn chế** — interviewer chấm điểm ở đây:

- **Query khó**: "đếm user có balance > 100" không thể chạy trên event store — mọi câu hỏi đều cần projection được build trước, kèm eventual consistency.
- **Event schema evolution rất đau**: event đã lưu là bất biến vĩnh viễn, nhưng code thì tiến hoá. Đổi cấu trúc event → phải versioning (`OrderCreatedV1`, `V2`), upcaster, hoặc migrate cả event store. Đây là chi phí dài hạn lớn nhất.
- **Learning curve cao**: team phải tư duy theo event, hiểu aggregate, idempotency, concurrency — sai từ đầu thì sửa rất đắt vì event đã ghi không xoá được.

**Use case hợp lý**: banking ledger, ví điện tử, inventory (tồn kho = chuỗi nhập/xuất), bất kỳ domain nào mà bản thân lịch sử là nghiệp vụ. **Đừng** event-source mọi thứ — user profile, settings, catalog CRUD thì lưu state thường là đủ; có thể event-source đúng một bounded context cần nó.

### Thiết kế minh hoạ

```text
  Traditional:  accounts table
  ┌────┬─────────┐   UPDATE balance = 80
  │ id │ balance │ ──────────────────────▶ lịch sử "100 → 80" MẤT vĩnh viễn
  │ A1 │   80    │
  └────┴─────────┘

  Event Sourcing:  event store (append-only)
  ┌─────────────────────────────────────────────────┐
  │ v1: AccountOpened   { ownerId: "u1" }           │
  │ v2: MoneyDeposited  { amount: 100 }             │
  │ v3: MoneyWithdrawn  { amount: 20 }              │  ◀── chỉ APPEND
  └─────────────────────────────────────────────────┘
        │ replay v1→v3                │ subscribe
        ▼                             ▼
  state = { balance: 80 }      Projection worker ──▶ read model (CQRS)
  (+ snapshot tại v1000        (balance_view, monthly_report_view...)
   để khỏi replay từ đầu)
```

```typescript
// Aggregate rebuild state bằng replay — pure function, không mutation
type AccountEvent =
  | { type: "AccountOpened"; ownerId: string }
  | { type: "MoneyDeposited"; amount: number }
  | { type: "MoneyWithdrawn"; amount: number };

interface AccountState {
  readonly balance: number;
  readonly version: number;
}

// Mỗi event tạo state MỚI (immutable), không sửa state cũ
function apply(state: AccountState, event: AccountEvent): AccountState {
  switch (event.type) {
    case "AccountOpened":
      return { balance: 0, version: state.version + 1 };
    case "MoneyDeposited":
      return { balance: state.balance + event.amount, version: state.version + 1 };
    case "MoneyWithdrawn":
      return { balance: state.balance - event.amount, version: state.version + 1 };
  }
}

// state hiện tại = fold toàn bộ event (hoặc từ snapshot gần nhất)
const state = events.reduce(apply, { balance: 0, version: 0 });

// Ghi lệnh mới: validate trên state đã replay, rồi APPEND event
async function withdraw(accountId: string, amount: number): Promise<void> {
  const { state, version } = await store.load(accountId); // snapshot + events
  if (state.balance < amount) throw new DomainError("Số dư không đủ");

  await store.append(
    accountId,
    { type: "MoneyWithdrawn", amount },
    version, // optimistic concurrency: version lệch → conflict, retry
  );
}
```

### Đáp án mẫu

> "Event Sourcing là lưu chuỗi event bất biến mô tả những gì đã xảy ra, thay vì lưu state hiện tại — state được tính bằng cách replay event, có snapshot để khỏi replay từ đầu với aggregate sống lâu. Lợi ích lớn nhất là audit trail hoàn hảo và time travel: em tái hiện được state tại bất kỳ thời điểm nào, và rebuild được projection hoàn toàn mới từ event lịch sử — điều CRUD không làm được vì update là ghi đè mất data. Đổi lại có ba cái giá: query trực tiếp gần như bất khả thi nên phải đi kèm CQRS với projection và chấp nhận eventual consistency; event schema evolution rất đau vì event đã ghi là bất biến, phải versioning hoặc upcasting; và learning curve của team cao. Nên em chỉ dùng cho domain mà lịch sử chính là nghiệp vụ — banking ledger, ví điện tử, inventory — và chỉ trong bounded context cần nó, chứ không event-source cả hệ thống."

---

## Câu 17: Các pattern horizontal scaling cho stateful services? Handle session state thế nào? `[Advanced]`

### Câu hỏi

> Khi horizontal scale một service có state (đặc biệt session state), có những pattern nào để xử lý? Trade-off của từng cách?

### Giải thích lý thuyết

**Vấn đề gốc**: horizontal scaling = chạy N instance sau load balancer. Nếu instance giữ state trong memory (session login, giỏ hàng, cache cục bộ), thì request sau của cùng user có thể rơi vào **instance khác** → state biến mất: user bị logout, giỏ hàng trống. Instance chết hoặc deploy lại → mất sạch. Autoscaling cũng vô nghĩa vì instance "không thay thế được cho nhau".

Bốn pattern xử lý, theo thứ tự ưu tiên thực tế:

| Pattern | Cơ chế | Ưu | Nhược |
| ------- | ------ | --- | ----- |
| **1. Stateless hoá (externalize state)** | Đẩy state ra Redis/DB; instance chỉ giữ logic | Instance thay thế nhau hoàn toàn, autoscale/rolling deploy thoải mái — **chuẩn nhất** | Thêm 1 network hop mỗi request; Redis thành critical dependency (cần HA) |
| **2. Sticky session** | LB hash cookie/IP → user luôn vào 1 instance | Đơn giản, không sửa code | **Lệch tải** (hot user dồn 1 máy); instance chết là **mất state**; cản trở autoscale |
| **3. Session replication** | Mỗi instance broadcast session cho các instance khác | Instance chết không mất state | Tốn network/memory O(N²) — chỉ chịu được cluster nhỏ; gần như lỗi thời |
| **4. Client-side state (JWT)** | State nhét vào token ký, client tự mang theo | Server hoàn toàn stateless, không cần store | Token to dần; **không revoke ngay được** (phải chờ expire hoặc lại cần... server-side blacklist); lộ data nếu nhét nhiều |

Thực tế production thường là **kết hợp**: JWT ngắn hạn (15 phút) cho authentication + refresh token và session data trong Redis — vừa ít hit store, vừa revoke được.

**Với service stateful "thật sự"** — state to và nóng đến mức không externalize nổi mỗi request (game server, WebSocket room, collaborative editing, ML model sharded theo user):

- **Shard theo key** (userId, roomId): mỗi instance **own** một tập shard, mọi request của room X luôn route về instance own X — state ở memory là hợp lệ vì có duy nhất 1 owner.
- **Consistent hashing** để routing: thêm/bớt instance chỉ di chuyển ~1/N số key, không reshuffle toàn bộ (dùng virtual nodes để tải đều).
- Vẫn cần **persist/snapshot state ra ngoài** định kỳ để recover khi instance chết, vì sharding giải quyết routing chứ không giải quyết durability.
- WebSocket nhiều instance: kết nối dính vào instance (bản chất sticky), nhưng **broadcast giữa instance qua Redis Pub/Sub hoặc Kafka** để message tới đúng user ở instance khác.

**Insight phỏng vấn**: câu trả lời mạnh là dẫn dắt "mặc định stateless hoá; sticky session chỉ là giải pháp tình thế; còn khi state thật sự phải sống trong memory thì chuyển sang tư duy sharding + consistent hashing". Phân biệt được "session state của web app" và "state của hệ stateful thật" là điểm phân loại Senior.

### Thiết kế minh hoạ

```text
  ❌ State trong memory                 ✅ Pattern 1: Externalize state
  ┌────┐   req1   ┌───────────┐         ┌────┐        ┌───────────┐
  │User│ ───────▶ │ Instance A│ session │User│ ─────▶ │ Instance  │──┐
  └────┘          │ {cart:🛒} │         └────┘  (bất  │  A/B/C    │  │ get/set
          req2    └───────────┘                 kỳ)   │ stateless │  ▼
        ────────▶ ┌───────────┐                       └───────────┘ ┌───────┐
                  │ Instance B│ ← cart đâu?!                        │ Redis │
                  │ {}  😱    │                                     │cluster│
                  └───────────┘                                     └───────┘

  ✅ Stateful thật sự: shard theo key + consistent hashing
                    hash(roomId) trên hash ring
  ┌────────┐      ┌──────────────────────────────────┐
  │ Gateway│ ───▶ │ room-1..1000   → Game Server A    │  mỗi room có
  │ router │      │ room-1001..2000→ Game Server B    │  ĐÚNG 1 owner
  └────────┘      │ room-2001..3000→ Game Server C    │  → in-memory OK
                  └──────────────────────────────────┘
                       │ snapshot định kỳ ▼ (durability)
                              Object storage / DB
```

```typescript
// Pattern 1: externalize session ra Redis — instance hoàn toàn stateless
async function sessionMiddleware(req: Request): Promise<Session> {
  const sessionId = req.cookies["sid"];
  const raw = await redis.get(`session:${sessionId}`);
  if (!raw) throw new UnauthorizedError("Session hết hạn hoặc không tồn tại");

  await redis.expire(`session:${sessionId}`, 1800); // sliding TTL 30 phút
  return JSON.parse(raw); // request nào, instance nào cũng đọc được
}

// Pattern 4 (hybrid): JWT ngắn hạn + revoke list trong Redis
async function verify(token: string): Promise<Claims> {
  const claims = jwt.verify(token, PUBLIC_KEY); // stateless, không hit store
  // Trade-off của JWT thuần: không revoke được → thêm denylist cho case logout
  if (await redis.exists(`revoked:${claims.jti}`)) {
    throw new UnauthorizedError("Token đã bị thu hồi");
  }
  return claims;
}

// Stateful thật sự: consistent hashing để route room về đúng owner
class ConsistentHashRouter {
  // Mỗi server vật lý = nhiều virtual node trên ring → tải đều
  constructor(private readonly ring: ReadonlyMap<number, string>) {}

  ownerOf(roomId: string): string {
    const h = hash(roomId);
    // Tìm node đầu tiên trên ring có vị trí >= h (vòng tròn)
    const keys = [...this.ring.keys()].sort((a, b) => a - b);
    const point = keys.find((k) => k >= h) ?? keys[0];
    return this.ring.get(point)!; // thêm/bớt server chỉ dời ~1/N số room
  }
}
```

### Đáp án mẫu

> "Vấn đề là state nằm trong memory của một instance, request sau rơi vào instance khác là mất — nên nguyên tắc đầu tiên của em là **stateless hoá**: đẩy session ra Redis, instance nào cũng phục vụ được, autoscale và rolling deploy thoải mái; đổi lại Redis thành critical dependency phải chạy HA. Sticky session thì đơn giản nhưng em coi là giải pháp tình thế — lệch tải và instance chết là mất state. Session replication thì tốn O(N²) network, gần như không ai dùng nữa. JWT cho phép server stateless hoàn toàn nhưng không revoke ngay được, nên thực tế em kết hợp: JWT ngắn hạn cộng session data trong Redis. Riêng với stateful thật sự như game server hay WebSocket room — state quá nóng để externalize mỗi request — em chuyển sang shard theo roomId/userId với consistent hashing để mỗi shard có đúng một owner, kèm snapshot định kỳ ra storage để recover, và broadcast giữa các instance qua Redis Pub/Sub."

---

## Câu 23: Message Queue là gì? Lợi ích của async communication? `[Intermediate]`

### Câu hỏi

> Message queue là gì và async communication mang lại lợi ích gì so với gọi HTTP đồng bộ? Giải thích các delivery semantics và khi nào nên dùng sync vs async.

### Giải thích lý thuyết

**Message queue** là thành phần trung gian: **producer** đẩy message vào queue, **consumer** lấy ra xử lý — hai bên **không gọi trực tiếp nhau** và không cần online cùng lúc.

Lợi ích chính của async communication:

- **Decouple producer/consumer**: order service không cần biết email service ở đâu, sống hay chết. Consumer chết 10 phút → message nằm chờ trong queue, sống lại xử lý tiếp; nếu là HTTP sync thì request đã fail và có thể kéo sập caller (cascading failure).
- **Load leveling (buffer khi traffic spike)**: flash sale đẩy 50k req/s nhưng consumer chỉ xử lý 5k/s → queue hấp thụ phần dư, consumer xử lý theo tốc độ của mình. Sync thì backend quá tải và chết ngay tại đỉnh.
- **Retry + Dead Letter Queue (DLQ)**: xử lý fail → message được redeliver; fail quá N lần → chuyển vào DLQ để người vận hành xem, không chặn message phía sau và không mất data.
- **Fan-out**: một event `OrderCreated` cho nhiều consumer độc lập (email, inventory, analytics) — thêm consumer mới không sửa producer.

**Delivery semantics** — phần interviewer luôn đào:

| Semantic | Cơ chế | Hệ quả |
| -------- | ------ | ------ |
| **At-most-once** | Gửi rồi quên, không retry | Có thể **mất** message — chỉ chấp nhận với metric/log không quan trọng |
| **At-least-once** | Retry đến khi consumer ack | Có thể **trùng** message — **chuẩn thực tế**, nhưng consumer bắt buộc **idempotent** |
| **Exactly-once** | "Mỗi message xử lý đúng 1 lần" | **Gần như myth** end-to-end: thực chất là at-least-once + dedup (idempotency key, transactional outbox/inbox) |

→ Câu nói ăn điểm: *"Em mặc định at-least-once và thiết kế consumer idempotent — check idempotency key trước khi xử lý — thay vì tin vào exactly-once của broker."*

Hai khái niệm vận hành đi kèm:

- **Ordering**: queue thường chỉ đảm bảo thứ tự **trong một partition/group** (Kafka: per-partition; SQS FIFO: per message-group). Cần thứ tự theo user → partition theo `userId`. Toàn cục ordering thì hi sinh throughput.
- **Backpressure**: consumer chậm kéo dài → queue phình vô hạn. Phải monitor **queue depth / consumer lag**, scale consumer theo lag, đặt TTL/max length cho message ít quan trọng.

**Sync HTTP vs async queue — khi nào dùng gì:**

- **Sync**: caller **cần kết quả ngay** để đi tiếp — check tồn kho trước khi cho đặt hàng, login, query data. Async ở đây chỉ thêm độ trễ và phức tạp.
- **Async**: việc làm sau cũng được (email, notification, export báo cáo), traffic spike cần buffer, fan-out nhiều consumer, hoặc tác vụ chạy lâu (encode video).
- **Cái giá của async**: eventual consistency, khó trace (cần correlation ID + distributed tracing), debug khó hơn — async không phải free lunch.

### Thiết kế minh hoạ

```text
  Sync (HTTP):  Order ──▶ Email svc chết ──▶ ❌ lỗi lan ngược về user

  Async (queue):
  ┌───────────┐  publish   ┌─────────────────────┐   consume   ┌──────────┐
  │ Order svc │ ─────────▶ │ Queue ▓▓▓▓▓░░░░░░░░ │ ──────────▶ │ Email svc│
  └───────────┘ (xong ngay)│ (buffer spike 50k/s)│  (5k/s, theo└──────────┘
                           └─────────┬───────────┘   sức mình)   │ fail > N lần
                                     │ fan-out                   ▼
                          ┌──────────┼──────────┐         ┌──────────┐
                          ▼          ▼          ▼         │   DLQ    │ → người
                      Inventory  Analytics  Loyalty       └──────────┘   vận hành
```

```typescript
// Producer: publish event rồi trả response ngay — không chờ consumer
async function createOrder(input: CreateOrderInput): Promise<Order> {
  const order = await orderRepo.create(input);
  await queue.publish("order.created", {
    messageId: crypto.randomUUID(), // dùng làm idempotency key phía consumer
    orderId: order.id,
    occurredAt: new Date().toISOString(),
  });
  return order; // user nhận response ~50ms, email gửi sau
}

// Consumer: at-least-once → BẮT BUỘC idempotent
async function onOrderCreated(msg: Message): Promise<void> {
  // Dedup: message từng xử lý rồi thì ack luôn, không gửi email lần 2
  const seen = await redis.set(`processed:${msg.messageId}`, "1", {
    NX: true,        // chỉ set nếu chưa tồn tại
    EX: 86400,       // giữ key 1 ngày
  });
  if (!seen) return msg.ack(); // duplicate delivery → bỏ qua an toàn

  try {
    await emailService.sendConfirmation(msg.body.orderId);
    await msg.ack(); // xác nhận xử lý xong → broker xoá/đánh dấu
  } catch (error) {
    logger.error("Gửi email thất bại, sẽ retry", { messageId: msg.messageId, error });
    await msg.nack(); // redeliver; quá maxRetries → broker tự chuyển DLQ
  }
}
```

### Đáp án mẫu

> "Message queue là lớp trung gian để producer và consumer không gọi trực tiếp nhau. Em thấy bốn lợi ích chính: decouple — consumer chết thì message nằm chờ thay vì lỗi lan ngược như HTTP sync; load leveling — flash sale 50k req/s thì queue hấp thụ, consumer xử lý theo sức mình; retry với DLQ để không mất message lỗi; và fan-out một event cho nhiều consumer. Về delivery semantics, em mặc định at-least-once — chuẩn thực tế — và thiết kế consumer idempotent bằng idempotency key, vì exactly-once end-to-end gần như là myth, bản chất vẫn là at-least-once cộng dedup. Em cũng luôn monitor consumer lag để xử lý backpressure, và partition theo userId khi cần ordering. Còn chọn sync hay async: caller cần kết quả ngay để đi tiếp thì sync, việc làm sau cũng được hoặc cần buffer spike thì async — và phải chấp nhận cái giá là eventual consistency với tracing khó hơn."

---

## Câu 24: Kafka và RabbitMQ khác nhau như thế nào? `[Advanced]`

### Câu hỏi

> Kafka và RabbitMQ khác nhau như thế nào về kiến trúc và mô hình hoạt động? Khi nào chọn cái nào?

### Giải thích lý thuyết

Khác biệt gốc rễ nằm ở **mô hình**: Kafka là **distributed append-only log**, RabbitMQ là **message broker truyền thống (smart broker)**. Mọi khác biệt còn lại đều suy ra từ đây.

**Kafka — dumb broker, smart consumer:**

- Message ghi vào **partition** của topic như một log bất biến, **không bị xoá khi consume** — retain theo thời gian/dung lượng (vd 7 ngày), bất kể đã đọc hay chưa.
- Consumer **pull** và **tự giữ offset** (vị trí đọc) → **replay được**: reset offset về quá khứ để đọc lại, nhiều hệ consumer độc lập đọc cùng data ở tốc độ khác nhau.
- **Ordering trong từng partition**; key quyết định message vào partition nào → cùng `userId` luôn đúng thứ tự.
- **Consumer group**: các consumer trong cùng group chia nhau partition (mỗi partition đúng 1 consumer trong group) → scale ngang; nhiều group khác nhau cùng đọc full data → fan-out tự nhiên.
- **Throughput cực cao** (hàng triệu msg/s): sequential disk I/O, zero-copy, batch — đánh đổi bằng routing rất thô (chỉ có topic/partition).

**RabbitMQ — smart broker, dumb consumer:**

- Broker **push** message tới consumer; message bị **xoá khỏi queue sau khi ack** → không replay được, queue rỗng là trạng thái khoẻ mạnh.
- **Routing linh hoạt** là điểm mạnh nhất: producer publish vào **exchange**, exchange route tới queue theo **binding** — direct (routing key chính xác), topic (wildcard `order.*.failed`), fanout, headers.
- **Per-message ack**, requeue từng message, **priority queue**, **delayed message**, TTL, DLX — bộ tính năng task queue rất giàu.
- Throughput thấp hơn Kafka (chục nghìn msg/s/node) nhưng **latency per-message thấp** và xử lý từng message tinh tế hơn.

| Tiêu chí | Kafka | RabbitMQ |
| -------- | ----- | -------- |
| Mô hình | Distributed log, dumb broker | Smart broker, exchange/binding |
| Consume | Consumer **pull**, tự giữ offset | Broker **push**, prefetch |
| Sau khi đọc | Message **giữ lại** theo retention → **replay** | **Xoá sau ack** → không replay |
| Ordering | Per-partition (theo key) | Per-queue (mất khi nhiều consumer cạnh tranh) |
| Routing | Thô — topic/partition | Giàu — direct/topic/fanout/headers |
| Priority / delay | Không có sẵn | Có sẵn |
| Throughput | Rất cao (triệu msg/s) | Trung bình (chục nghìn msg/s/node) |
| Phù hợp | Event streaming, data pipeline, log aggregation, event sourcing | Task/job queue, RPC, routing phức tạp |

**Chọn theo use case:**

- **Kafka**: event streaming và pipeline (CDC, đổ data vào warehouse), log/metrics aggregation, event sourcing backbone (retention + replay là sống còn), fan-out nhiều team cùng tiêu thụ một event stream, throughput khổng lồ.
- **RabbitMQ**: task queue (resize ảnh, gửi email) cần ack/retry/priority từng job, RPC request-reply, routing theo rule phức tạp, hệ thống vừa và nhỏ cần broker "đầy đủ đồ chơi" mà vận hành nhẹ hơn Kafka cluster.
- **Lựa chọn nhẹ thay thế**: **SQS** (managed, gần như zero vận hành — đủ cho đa số task queue trên AWS), **Redis Streams** (đã có Redis sẵn, cần queue nhẹ với consumer group). Nói được "không phải cứ async là Kafka" là điểm cộng lớn — chống over-engineering.

**Insight phỏng vấn**: câu trả lời yếu là liệt kê feature. Câu trả lời mạnh đi từ mô hình gốc — *"Kafka là log retain được nên replay được; RabbitMQ là broker xoá message sau ack nên routing giỏ hơn nhưng không replay"* — rồi mới suy ra use case.

### Thiết kế minh hoạ

```text
  KAFKA — distributed log, consumer pull + tự giữ offset
  topic "orders" (retention 7 ngày — message KHÔNG xoá khi đọc)
  ┌──────────────────────────────────┐
  │ partition 0: [m0][m1][m2][m3]... │◀─ key=userId → cùng user
  │ partition 1: [m0][m1][m2]...     │   luôn vào 1 partition (ordering)
  └──────────────────────────────────┘
        ▲ offset=2          ▲ offset=0 (replay từ đầu!)
   group "billing"      group "analytics"   ← 2 group đọc ĐỘC LẬP cùng data

  RABBITMQ — smart broker push, message xoá sau ack
                    ┌──────────────┐ binding "order.*.failed" ┌─────────┐
  producer ──────▶  │   exchange   │ ───────────────────────▶ │ queue A │──▶ consumer
  (routing key      │ (topic type) │ binding "order.#"        ├─────────┤    (ack → xoá;
  "order.vn.failed")└──────────────┘ ───────────────────────▶ │ queue B │     nack → DLX)
                                                              └─────────┘
```

```typescript
// Kafka: consumer group + offset — replay là thao tác bình thường
const consumer = kafka.consumer({ groupId: "analytics" });
await consumer.subscribe({ topic: "orders", fromBeginning: true }); // đọc lại từ đầu

await consumer.run({
  eachMessage: async ({ partition, message }) => {
    // Ordering chỉ đảm bảo TRONG partition; key=userId → per-user ordering
    await project(JSON.parse(message.value!.toString()));
    // Offset do consumer group quản lý — commit sau khi xử lý (at-least-once)
  },
});
// Cần report mới? Tạo group mới, đọc lại 7 ngày event — Rabbit không làm được

// RabbitMQ: exchange/binding routing + per-message ack
await ch.assertExchange("orders", "topic", { durable: true });
await ch.assertQueue("failed-orders", {
  durable: true,
  deadLetterExchange: "dlx",   // nack quá nhiều → chuyển DLX
  maxPriority: 10,              // priority queue — Kafka không có sẵn
});
// Chỉ nhận order thất bại, mọi quốc gia: wildcard routing
await ch.bindQueue("failed-orders", "orders", "order.*.failed");

ch.consume("failed-orders", async (msg) => {
  try {
    await handleFailedOrder(JSON.parse(msg!.content.toString()));
    ch.ack(msg!);                 // ack → message bị XOÁ khỏi queue
  } catch (error) {
    logger.error("Xử lý thất bại, đẩy sang DLX", { error });
    ch.nack(msg!, false, false);  // không requeue → đi vào dead letter exchange
  }
});
```

### Đáp án mẫu

> "Khác biệt gốc là mô hình: Kafka là distributed log — message ghi vào partition, retain theo thời gian chứ không xoá khi consume, consumer pull và tự giữ offset nên **replay được**, nhiều consumer group đọc độc lập cùng data, ordering đảm bảo trong từng partition theo key, throughput cực cao nhờ sequential I/O. RabbitMQ là smart broker — push message, xoá sau khi ack nên không replay, đổi lại routing rất giàu qua exchange và binding với wildcard, có per-message ack, priority và delayed queue. Nên em chọn theo bài toán: event streaming, data pipeline, log aggregation hay event sourcing — những thứ cần retention và replay — thì Kafka; task queue, RPC, routing theo rule phức tạp thì RabbitMQ. Và em luôn cân nhắc lựa chọn nhẹ hơn trước: trên AWS thì SQS managed gần như zero vận hành, hoặc Redis Streams nếu đã có Redis — không phải cứ async là phải dựng Kafka cluster."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                        | Đúng là                                                                                                |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| "CQRS là phải tách 2 database"                                 | CQRS có nhiều mức — nhẹ nhất chỉ là tách Command/Query service trên cùng 1 DB; tách datastore là mức cao nhất |
| "Áp dụng CQRS cho mọi service cho 'sạch'"                      | CRUD đơn giản thì CQRS đầy đủ là over-engineering; chỉ dùng khi read/write lệch cực đoan                |
| "Event Sourcing = lưu thêm audit log bên cạnh state"           | Event store **là** source of truth duy nhất — state chỉ là kết quả replay/projection, không phải bản ghi chính |
| "Event Sourcing thì query trực tiếp event store"               | Query phải qua projection (đi kèm CQRS) — và chịu eventual consistency                                  |
| "Sticky session là cách chuẩn để scale session"                | Là giải pháp tình thế: lệch tải, instance chết là mất state; chuẩn là externalize ra Redis/DB           |
| "Dùng JWT là hết vấn đề session"                               | JWT không revoke ngay được — thực tế cần token ngắn hạn + denylist/refresh token phía server            |
| "Chọn broker hỗ trợ exactly-once là không lo duplicate"        | Exactly-once end-to-end gần như myth — bản chất là at-least-once + dedup; consumer vẫn phải idempotent  |
| "Queue tự đảm bảo thứ tự message"                              | Ordering chỉ trong 1 partition/message-group — muốn theo user thì phải partition theo userId            |
| "Kafka và RabbitMQ thay thế được cho nhau"                     | Kafka là log retain/replay cho streaming; RabbitMQ là broker xoá-sau-ack cho task queue/routing — mô hình khác hẳn |
| "Hệ thống nào cần queue cũng nên dựng Kafka"                   | SQS/Redis Streams đủ cho đa số task queue — Kafka cluster là chi phí vận hành lớn, chỉ đáng khi cần streaming/replay |
