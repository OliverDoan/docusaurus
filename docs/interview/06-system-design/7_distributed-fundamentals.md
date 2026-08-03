---
sidebar_position: 7
title: "7. Nền tảng hệ phân tán"
---

# Nền tảng hệ phân tán

> *Mọi câu hỏi system design đều quy về vài nguyên lý nền tảng: CAP, consistency, scaling, latency vs throughput. Interviewer không cần bạn thuộc định nghĩa — họ muốn thấy bạn dùng các nguyên lý này để **biện luận trade-off** cho từng bài toán cụ thể.*

:::note[Ghi nhớ nhanh]

- ⭐ **`CAP` + `PACELC`** — `P` là bắt buộc trong thực tế, câu hỏi thật là hy sinh `C` hay `A` khi partition; lúc bình thường vẫn đánh đổi Latency vs Consistency.
- ⭐ **`ACID` vs `BASE`** — chọn theo từng loại data: payment/inventory đi ACID (RDBMS), view count/feed đi BASE (Cassandra/DynamoDB); ranh giới mờ dần với NewSQL.
- **Vertical vs Horizontal scaling** — vertical trước (rẻ effort, không vấn đề phân tán), scale out web tier sớm (cần stateless), sharding DB sau cùng vì là one-way door.
- **Latency vs Throughput** — báo cáo bằng `p95`/`p99` không phải average (phân phối lệch đuôi); trade-off từ batching + queueing; `Little's Law L = λ×W` để định cỡ.
- **Consistency models** — phổ từ linearizable → causal → read-your-writes/monotonic reads → eventual; quorum `R+W>N` đảm bảo read chạm bản mới nhất.
- **Consistent hashing + hot partition** — hash ring chỉ remap `K/N` key (chống cache miss storm), cần virtual nodes; hot key phải salting (write-hot) hoặc cache nhiều tầng (read-hot), thêm node không cứu được.

:::

---

## Câu 1: CAP Theorem là gì và tại sao quan trọng trong thiết kế hệ phân tán? `[Intermediate]`

### Câu hỏi

> CAP Theorem phát biểu điều gì? Trong thực tế, các hệ thống lớn "chọn" như thế nào giữa C, A, P? PACELC mở rộng CAP ra sao?

### Giải thích lý thuyết

CAP Theorem (Eric Brewer, 2000) phát biểu: một hệ thống phân tán có chia sẻ dữ liệu **không thể đồng thời đảm bảo cả 3** tính chất sau, mà tối đa chỉ chọn được 2:

| Tính chất | Ý nghĩa |
| --- | --- |
| **C — Consistency** | Mọi read đều thấy write mới nhất (hoặc trả lỗi). Lưu ý: đây là *linearizability*, **khác** chữ C trong ACID |
| **A — Availability** | Mọi request đến node còn sống đều nhận được response (không lỗi, không timeout) — dù có thể không phải data mới nhất |
| **P — Partition tolerance** | Hệ thống vẫn hoạt động khi mạng giữa các node bị đứt (network partition) |

**Hiểu đúng — điểm ăn tiền của câu này**: trong hệ phân tán thực tế, **partition là điều chắc chắn xảy ra** (đứt cáp, switch lỗi, GC pause dài, AZ down). Bạn không thể "từ chối P". Vì vậy CAP thực chất là câu hỏi: **khi partition xảy ra, hy sinh C hay A?**

- **CP — hy sinh Availability**: khi partition, phía thiểu số (minority) từ chối phục vụ để không trả data sai. Phù hợp khi data sai đắt hơn downtime:
  - **Banking / payment**: trả số dư cũ rồi cho rút tiền 2 lần là thảm hoạ.
  - **ZooKeeper / etcd**: hệ thống coordination — config, leader election — bắt buộc đúng, dùng quorum (ZAB/Raft), mất quorum thì ngừng ghi.
- **AP — hy sinh Consistency**: khi partition, mọi node vẫn phục vụ, chấp nhận data tạm thời lệch nhau, hoà giải sau (eventual consistency).
  - **DNS**: bản ghi propagate hàng phút/giờ vẫn ổn, nhưng DNS không bao giờ được "down".
  - **Cassandra, DynamoDB** (thiết kế gốc Dynamo): shopping cart Amazon — thà nhận order với cart hơi cũ còn hơn báo lỗi cho khách.

**PACELC** (Daniel Abadi) mở rộng vì CAP chỉ nói về lúc *có* partition: "**P**artition → chọn **A** hay **C**; **E**lse (vận hành bình thường) → chọn **L**atency hay **C**onsistency". Ngay cả khi mạng khoẻ, muốn strong consistency thì write phải chờ replicate đồng bộ → latency tăng. Ví dụ: DynamoDB là PA/EL (ưu tiên availability và latency), Spanner là PC/EC (ưu tiên consistency, chấp nhận latency của commit-wait + TrueTime).

**Insight phỏng vấn**: nói "MongoDB là CP, Cassandra là AP" như học thuộc là chưa đủ — interviewer muốn nghe "P là bắt buộc nên câu hỏi thật là C-vs-A *khi partition*", và bonus lớn nếu nhắc PACELC vì nó giải thích trade-off cả lúc hệ thống khoẻ.

### Thiết kế minh hoạ

```text
            Network partition cắt cluster làm hai
   ┌─────────────────┐      ╳╳╳      ┌─────────────────┐
   │  Node A, Node B │  ╳ partition ╳ │     Node C      │
   │   (majority)    │      ╳╳╳      │   (minority)    │
   └─────────────────┘               └─────────────────┘

CP (vd: etcd, ZooKeeper):
   Client → Node C (minority): "ghi x=2"
   Node C: ❌ TỪ CHỐI (mất quorum) → hy sinh Availability
   Client → Node A (majority):  ✅ ghi được, data luôn đúng

AP (vd: Cassandra, Dynamo):
   Client → Node C: ✅ vẫn ghi x=2 (hinted handoff, sync sau)
   Client → Node A: ✅ vẫn đọc/ghi — nhưng có thể thấy x cũ
   Hết partition → anti-entropy / read repair hoà giải dữ liệu
```

```typescript
// Pseudo-code: cùng 1 API, hai chiến lược khi mất liên lạc với quorum
async function write(key: string, value: string, mode: "CP" | "AP") {
  const acked = await replicateToNodes(key, value);

  if (mode === "CP") {
    // CP: không đủ quorum → trả lỗi, thà unavailable còn hơn sai
    if (acked < QUORUM) throw new ServiceUnavailableError("Mất quorum, từ chối ghi");
    return { ok: true, consistent: true };
  }

  // AP: nhận write ngay cả khi chỉ 1 node ack, hoà giải sau
  return { ok: true, consistent: acked >= QUORUM, pendingSync: acked < QUORUM };
}
```

### Đáp án mẫu

> "CAP nói rằng hệ phân tán chỉ chọn được 2 trong 3: Consistency, Availability, Partition tolerance. Nhưng em luôn nhấn mạnh: trong thực tế partition chắc chắn xảy ra — đứt mạng, AZ down — nên không thể bỏ P; câu hỏi thật sự là **khi partition thì hy sinh C hay A**. Hệ CP như ZooKeeper, etcd hay hệ banking sẽ từ chối phục vụ phía mất quorum để không trả data sai. Hệ AP như Cassandra, DynamoDB, DNS thì vẫn phục vụ mọi node, chấp nhận data lệch tạm thời rồi hoà giải sau — vì với shopping cart, báo lỗi cho khách đắt hơn cart hơi cũ. Em cũng hay nhắc PACELC: ngay cả khi không có partition vẫn phải đánh đổi Latency vs Consistency — muốn strong consistency thì write chờ replicate đồng bộ, latency tăng. Nên khi design, em hỏi nghiệp vụ trước: data sai đắt hơn hay downtime đắt hơn, rồi mới chọn database."

---

## Câu 2: ACID và BASE khác nhau như thế nào? Khi nào dùng mỗi mô hình? `[Intermediate]`

### Câu hỏi

> Giải thích ACID và BASE. Hai mô hình khác nhau ở đâu, liên hệ thế nào với SQL/NoSQL, và khi nào nên dùng mỗi loại?

### Giải thích lý thuyết

**ACID** — bộ đảm bảo của transaction trong RDBMS truyền thống:

- **Atomicity**: transaction là tất-cả-hoặc-không — chuyển tiền gồm trừ A + cộng B, fail giữa chừng thì rollback cả hai.
- **Consistency**: transaction đưa DB từ trạng thái hợp lệ này sang trạng thái hợp lệ khác (constraint, foreign key, trigger không bị vi phạm). *Khác chữ C trong CAP.*
- **Isolation**: các transaction chạy song song không thấy trạng thái dở dang của nhau (các mức: read committed, repeatable read, serializable).
- **Durability**: commit rồi thì không mất, kể cả crash (WAL, fsync).

**BASE** — triết lý ngược lại, sinh ra từ nhu cầu scale của hệ phân tán lớn:

- **Basically Available**: hệ thống luôn phản hồi, kể cả khi một phần bị lỗi — có thể trả data cũ hoặc bản giảm chất lượng.
- **Soft state**: trạng thái có thể tự thay đổi theo thời gian dù không có input mới (do replication chạy nền).
- **Eventually consistent**: nếu ngừng ghi, sau một thời gian mọi replica sẽ hội tụ về cùng giá trị.

| Tiêu chí | ACID | BASE |
| --- | --- | --- |
| Consistency | Strong, ngay lập tức | Eventual, hội tụ dần |
| Availability | Có thể hy sinh (lock, failover) | Ưu tiên hàng đầu |
| Scale | Vertical là chính, scale ngang khó (distributed transaction đắt) | Horizontal tự nhiên |
| Latency write | Cao hơn (lock, sync replication) | Thấp (ghi local, sync nền) |
| Đại diện | PostgreSQL, MySQL, Oracle, Spanner | Cassandra, DynamoDB, Riak, CouchDB |
| Phù hợp | Payment, inventory, booking, sổ cái | Social feed, analytics, counter view, session |

**Liên hệ SQL vs NoSQL**: ACID gắn với RDBMS vì single-node transaction rẻ; NoSQL thế hệ Dynamo chọn BASE để scale ngang và giữ availability (đúng tinh thần AP trong CAP). Nhưng ranh giới đã mờ: **NewSQL** (Spanner, CockroachDB) cho ACID trên hệ phân tán (trả giá bằng latency), còn MongoDB/DynamoDB nay cũng hỗ trợ multi-document transaction giới hạn.

**Chiến lược thực tế — điểm interviewer muốn nghe**: không chọn 1 cho cả hệ thống mà **chọn theo từng loại data**. E-commerce điển hình: order + payment + inventory đi PostgreSQL (ACID — oversell một chiếc iPhone là mất tiền thật); product view count, recommendation, activity feed đi Cassandra/DynamoDB (BASE — lệch vài giây không ai thiệt hại).

### Thiết kế minh hoạ

```text
        E-commerce: tách theo độ "đắt" của sai lệch dữ liệu
┌──────────────────────────────┐   ┌──────────────────────────────┐
│   Critical path (ACID)       │   │   Best-effort path (BASE)    │
│                              │   │                              │
│  Order Service               │   │  Feed Service                │
│      │ transaction           │   │      │ async write           │
│      ▼                       │   │      ▼                       │
│  PostgreSQL                  │   │  Cassandra (RF=3)            │
│  - orders                    │   │  - view_counts               │
│  - payments    } 1 txn       │   │  - activity_feed             │
│  - inventory                 │   │  - recommendations           │
│  sai = mất tiền thật         │   │  lệch vài giây = chấp nhận   │
└──────────────────────────────┘   └──────────────────────────────┘
```

```typescript
// ACID: đặt hàng — tất cả hoặc không có gì
async function placeOrder(userId: string, itemId: string, qty: number) {
  return db.transaction(async (tx) => {
    // Trừ kho có điều kiện — Isolation chặn 2 người mua chiếc cuối cùng
    const updated = await tx.query(
      `UPDATE inventory SET stock = stock - $1
       WHERE item_id = $2 AND stock >= $1`,
      [qty, itemId]
    );
    if (updated.rowCount === 0) throw new OutOfStockError("Hết hàng");

    const order = await tx.insert("orders", { userId, itemId, qty });
    await tx.insert("payments", { orderId: order.id, status: "pending" });
    return order; // commit cả 3 — fail bất kỳ đâu thì rollback toàn bộ
  });
}

// BASE: tăng view count — fire-and-forget, eventual consistency là đủ
function trackView(itemId: string) {
  cassandra.execute(
    "UPDATE view_counts SET views = views + 1 WHERE item_id = ?",
    [itemId],
    { consistency: "ONE" } // ghi 1 node là xong, replicate nền
  );
}
```

### Đáp án mẫu

> "ACID là bộ đảm bảo transaction của RDBMS: Atomicity tất-cả-hoặc-không, Consistency giữ constraint, Isolation che transaction dở dang, Durability commit rồi không mất. BASE đi hướng ngược lại cho hệ phân tán: Basically Available — luôn phản hồi, Soft state, Eventually consistent — replica hội tụ dần. Trade-off cốt lõi là correctness tức thì đổi lấy availability và scale ngang: ACID cần lock và sync replication nên scale ngang đắt; BASE ghi local rồi sync nền nên latency thấp, scale tốt nhưng có cửa sổ data lệch. Trong thực tế em không chọn một mô hình cho cả hệ thống mà chọn theo loại data: payment, inventory, booking đi PostgreSQL vì oversell là mất tiền thật; còn view count, social feed, analytics đi Cassandra hay DynamoDB vì lệch vài giây không ai thiệt. Em cũng note là ranh giới đang mờ — NewSQL như Spanner cho ACID phân tán, đổi bằng latency."

---

## Câu 3: Vertical Scaling và Horizontal Scaling là gì? Ưu nhược điểm? `[Basic]`

### Câu hỏi

> Phân biệt vertical scaling (scale up) và horizontal scaling (scale out). Ưu nhược điểm từng loại, và chiến lược thực tế khi hệ thống lớn dần?

### Giải thích lý thuyết

- **Vertical scaling (scale up)**: tăng sức mạnh của **một máy** — thêm CPU, RAM, ổ NVMe nhanh hơn. Ví dụ: nâng database từ instance 16GB lên 128GB RAM.
- **Horizontal scaling (scale out)**: thêm **nhiều máy** và chia tải giữa chúng — thêm app server sau load balancer, thêm shard database, thêm node Cassandra.

| Tiêu chí | Vertical (scale up) | Horizontal (scale out) |
| --- | --- | --- |
| Độ phức tạp code | Gần như **không đổi code** — app chạy y nguyên | Cao: load balancing, sharding, service phải stateless |
| Giới hạn | **Trần vật lý** — máy to nhất thị trường là hết | Gần như vô hạn (Google, Meta scale kiểu này) |
| Chi phí | Tăng **phi tuyến** — máy gấp đôi sức mạnh thường đắt hơn gấp đôi nhiều | Tuyến tính theo số máy, dùng commodity hardware |
| Availability | **Single point of failure** — máy chết là hệ thống chết; nâng cấp thường cần downtime | Một node chết, các node còn lại gánh; rolling deploy không downtime |
| Data consistency | Đơn giản — một máy, một bộ nhớ | Khó — replication lag, distributed transaction, CAP xuất hiện |
| Phù hợp | Giai đoạn đầu, database khó shard, workload đơn lẻ cần RAM lớn | Web tier, traffic lớn, yêu cầu high availability |

**Điều kiện tiên quyết để scale out web tier**: service phải **stateless** — session đẩy ra Redis, file đẩy ra S3 — thì load balancer mới route request đến node bất kỳ được. Còn data tier scale out nghĩa là replication (scale read) và sharding (scale write) — đây là lúc độ phức tạp tăng vọt: cross-shard query, rebalancing, hotspot.

**Chiến lược thực tế — điều interviewer muốn nghe**: không phải "horizontal luôn tốt hơn". Lộ trình hợp lý:

1. **Vertical trước**: rẻ về engineering effort, một con PostgreSQL RAM lớn phục vụ được hàng chục nghìn QPS — đa số startup chết trước khi chạm trần này. Stack Overflow nổi tiếng chạy lượng traffic khổng lồ trên số server rất ít theo hướng scale up.
2. **Horizontal cho web tier sớm** (vì stateless dễ làm) để có high availability — tối thiểu 2 instance sau load balancer.
3. **Horizontal cho data tier khi buộc phải**: read replica trước, sharding sau cùng — vì sharding là one-way door rất khó quay đầu.

### Thiết kế minh hoạ

```text
VERTICAL (scale up)                HORIZONTAL (scale out)
┌──────────────┐                          ┌────────────────┐
│   Server     │                          │ Load Balancer  │
│  4 CPU/16GB  │                          └───────┬────────┘
└──────────────┘                       ┌──────────┼──────────┐
       │ nâng cấp                      ▼          ▼          ▼
       ▼                          ┌────────┐ ┌────────┐ ┌────────┐
┌──────────────┐                  │ App #1 │ │ App #2 │ │ App #3 │ ← stateless
│   Server     │                  └────┬───┘ └───┬────┘ └───┬────┘
│ 32 CPU/256GB │                       └─────────┼──────────┘
└──────────────┘                                 ▼
  ↑ trần vật lý                   ┌──────────┐  ┌──────────────┐
  ↑ vẫn là SPOF                   │  Redis   │  │ DB primary    │
  ↑ không đổi code                │ (session)│  │  + replicas   │
                                  └──────────┘  └──────────────┘
```

```typescript
// Điều kiện scale out: STATELESS — state đẩy ra ngoài process
// ❌ State trong RAM của 1 server → thêm server là hỏng (session lạc node)
const sessions = new Map<string, Session>(); // chết khi có 2 instance

// ✅ State ở Redis → node nào nhận request cũng phục vụ được
async function getSession(sessionId: string): Promise<Session | null> {
  const raw = await redis.get(`session:${sessionId}`);
  return raw ? JSON.parse(raw) : null;
}
// → Lúc này thêm/bớt app server chỉ là chỉnh con số trong autoscaling group
```

### Đáp án mẫu

> "Vertical scaling là làm một máy mạnh hơn — thêm CPU, RAM; horizontal là thêm nhiều máy và chia tải. Vertical thắng ở chỗ gần như không đổi code và không phát sinh vấn đề phân tán, nhưng có trần vật lý, chi phí tăng phi tuyến, và máy đó là single point of failure. Horizontal scale gần như vô hạn với commodity hardware, một node chết không sập hệ thống, nhưng đổi lại là độ phức tạp: service phải stateless, cần load balancer, và xuống đến data tier là đụng replication lag, sharding, CAP. Chiến lược thực tế của em: vertical trước cho database vì rẻ effort — một con PostgreSQL RAM lớn gánh được rất xa; web tier thì scale out sớm vì stateless dễ làm và cần tối thiểu 2 instance cho high availability; còn sharding database em để sau cùng vì đó là one-way door, làm rồi rất khó quay đầu."

---

## Câu 7: Latency và Throughput là gì? Tại sao thường có trade-off? `[Basic]`

### Câu hỏi

> Định nghĩa latency và throughput. Tại sao đo latency bằng trung bình là lừa dối, p95/p99 là gì? Vì sao tăng throughput thường làm tăng latency?

### Giải thích lý thuyết

- **Latency**: thời gian xử lý **một** request từ lúc gửi đến lúc nhận response — đo bằng ms (hoặc µs). Là trải nghiệm của *một user*.
- **Throughput**: số lượng công việc hệ thống xử lý được trong **một đơn vị thời gian** — đo bằng RPS/QPS, hoặc MB/s. Là năng lực của *cả hệ thống*.

Hai chỉ số **không suy ra nhau**: một chuyến xe tải chở ổ cứng xuyên quốc gia có throughput khổng lồ nhưng latency hàng ngày; một request ping có latency 1ms nhưng chẳng nói gì về throughput.

**Percentile — tại sao trung bình lừa dối**: latency thực tế có phân phối **lệch đuôi dài** (long tail). 1% request chậm 5s có thể bị 99% request 20ms "nuốt" mất trong con số trung bình. Vì vậy ngành dùng percentile:

- **p50** (median): nửa số request nhanh hơn mức này — trải nghiệm "điển hình".
- **p95 / p99**: 95%/99% request nhanh hơn mức này — trải nghiệm của nhóm tệ nhất. SLO thường định nghĩa trên p99 (vd: "p99 < 300ms").
- Đuôi quan trọng vì: user nặng nhất (nhiều data nhất) thường rơi vào đuôi — họ lại là khách quý nhất; và một page gọi 50 service thì xác suất *dính ít nhất một* response p99 rất cao (**tail latency amplification**: `1 - 0.99^50 ≈ 39%`).

**Tại sao có trade-off** — hai cơ chế chính:

1. **Batching**: gom 100 message gửi 1 lần giảm overhead per-item → throughput tăng vọt, nhưng message đầu tiên phải *chờ* batch đầy → latency tăng. Kafka `linger.ms` là ví dụ kinh điển: chờ thêm vài ms để gom batch lớn hơn.
2. **Queueing + utilization**: theo lý thuyết hàng đợi, khi utilization tiến gần 100%, thời gian chờ trong queue tăng **phi tuyến** (tiệm cận vô hạn). Ép hệ thống chạy 95% công suất để tối đa throughput thì latency đuôi bùng nổ. **Little's Law**: `L = λ × W` (số request đang trong hệ thống = throughput × thời gian xử lý trung bình) — công cụ ước lượng nhanh: muốn 10.000 RPS với latency 50ms thì trung bình có 500 request in-flight → định cỡ connection pool, số worker.

**Latency numbers every programmer should know** (Jeff Dean — số tròn để ước lượng):

| Thao tác | Thời gian |
| --- | --- |
| L1 cache reference | ~0.5 ns |
| Main memory reference (RAM) | ~100 ns |
| Đọc 1MB tuần tự từ RAM | ~0.25 ms |
| SSD random read | ~150 µs |
| Đọc 1MB tuần tự từ SSD | ~1 ms |
| Round trip trong cùng datacenter | ~0.5 ms |
| Disk seek (HDD) | ~10 ms |
| Round trip liên lục địa (VN ↔ US) | ~150–200 ms |

Bài học từ bảng: RAM nhanh hơn disk ~1000 lần (vì sao cache hiệu quả), network trong DC rẻ nhưng cross-region cực đắt (vì sao cần CDN/multi-region), và 3 round trip tuần tự cross-region là mất nửa giây — phải tránh waterfall call.

### Thiết kế minh hoạ

```text
Phân phối latency lệch đuôi — vì sao average lừa dối:
  số request
      │██
      │████
      │██████
      │███████▓
      │████████▓▓░
      │█████████▓▓▓░░░░          ░ ← đuôi dài (GC pause, cache miss,
      └─────┬────┬───┬─────────────┬──→ latency   retry, slow disk)
           p50  avg p95           p99
          20ms  35ms 120ms        800ms
   → avg 35ms nhìn "ổn" nhưng 1/100 user chờ gần 1 giây!

Batching trade-off (Kafka producer):
  linger.ms = 0   → gửi ngay      → latency thấp, throughput thấp
  linger.ms = 20  → gom batch 20ms → latency +20ms, throughput tăng nhiều lần
```

```typescript
// Little's Law: L = λ × W — định cỡ hệ thống trong 30 giây
const targetThroughput = 10_000; // λ: 10k RPS
const avgLatencySec = 0.05;      // W: 50ms
const inflight = targetThroughput * avgLatencySec; // L = 500 request in-flight
// → cần worker pool / connection pool đủ cho ~500 request đồng thời
// → nếu mỗi instance chịu 50 concurrent → cần ~10 instance

// Đo percentile thay vì average (pseudo-code, comment tiếng Việt)
function percentile(sortedLatencies: number[], p: number): number {
  // p = 0.99 → lấy phần tử ở vị trí 99% — KHÔNG dùng mean để báo cáo SLO
  const idx = Math.ceil(p * sortedLatencies.length) - 1;
  return sortedLatencies[idx];
}
```

### Đáp án mẫu

> "Latency là thời gian xử lý một request — trải nghiệm của một user; throughput là số request hệ thống xử lý mỗi giây — năng lực của cả hệ thống. Em không bao giờ báo cáo latency bằng trung bình vì phân phối latency lệch đuôi dài: average 35ms vẫn có thể giấu 1% request mất gần 1 giây, nên SLO em đặt trên p95, p99 — và đuôi quan trọng vì một page gọi 50 service thì gần 40% page view sẽ dính ít nhất một response p99. Trade-off xuất hiện qua hai cơ chế: batching — gom nhiều item xử lý một lần tăng throughput nhưng item đầu phải chờ batch đầy, như `linger.ms` của Kafka; và queueing — đẩy utilization gần 100% để ép throughput thì thời gian chờ trong queue tăng phi tuyến, latency đuôi bùng nổ. Em hay dùng Little's Law `L = λ×W` để định cỡ nhanh: 10k RPS với latency 50ms nghĩa là 500 request in-flight, từ đó suy ra số worker, connection pool."

---

## Câu 8: Các mô hình Consistency trong hệ phân tán là gì? `[Advanced]`

### Câu hỏi

> Trình bày các mức consistency model từ mạnh đến yếu (linearizable, sequential, causal, read-your-writes, monotonic reads, eventual). Quorum R+W>N trong hệ Dynamo-style hoạt động thế nào?

### Giải thích lý thuyết

Khi data được replicate nhiều node, "consistency model" là **hợp đồng** giữa hệ thống và client về việc read sẽ thấy gì. Từ mạnh xuống yếu (càng mạnh càng đắt về latency/availability):

| Model | Đảm bảo | Ví dụ thực tế |
| --- | --- | --- |
| **Strong / Linearizable** | Mọi thao tác như xảy ra tại một thời điểm duy nhất trên một bản copy; write xong là **mọi** read sau (theo thời gian thực) thấy ngay | etcd/ZooKeeper, Spanner; cần cho lock, leader election, unique constraint |
| **Sequential** | Mọi client thấy **cùng một thứ tự** thao tác, thứ tự đó tôn trọng thứ tự chương trình của từng client — nhưng không cần khớp thời gian thực | Bộ nhớ đa xử lý cổ điển |
| **Causal** | Thao tác có quan hệ nhân-quả được thấy đúng thứ tự; thao tác không liên quan có thể thấy khác thứ tự | Comment phải hiện *sau* post mà nó trả lời — không bao giờ thấy reply trước câu hỏi |
| **Read-your-writes** | Client **luôn thấy write của chính mình** (người khác có thể chưa thấy) | Sửa avatar xong reload phải thấy avatar mới — dù bạn bè thấy chậm vài giây vẫn ổn |
| **Monotonic reads** | Đã thấy giá trị mới thì không bao giờ thấy lại giá trị cũ hơn ("không đi lùi thời gian") | Tránh: F5 lần 1 thấy 5 comment, F5 lần 2 còn 3 comment (do đọc trúng replica lag) |
| **Eventual** | Chỉ hứa: ngừng ghi thì các replica *cuối cùng* hội tụ — không hứa gì về trung gian | DNS, S3 (đời đầu), counter view |

Read-your-writes và monotonic reads gọi là **session guarantees** — yếu hơn strong nhiều nhưng đủ xoá phần lớn sự "kỳ quặc" mà user cảm nhận. Cách làm phổ biến: pin session vào primary sau khi user vừa ghi, hoặc sticky routing theo user về cùng replica.

**Quorum trong Dynamo-style** (Cassandra, DynamoDB, Riak): với **N** replica, ghi chờ **W** ack, đọc hỏi **R** node. Nếu **R + W > N** thì tập đọc và tập ghi **giao nhau ít nhất 1 node** → read luôn chạm ít nhất một bản mới nhất (chọn theo version/timestamp).

- N=3, W=2, R=2: cân bằng phổ biến — chịu được 1 node chết cho cả đọc lẫn ghi.
- W=1, R=1: nhanh nhất, available nhất — nhưng R+W=2 ≤ 3, có thể đọc trúng node chưa nhận write → eventual.
- W=N: write đắt, node nào chết là không ghi được; R=1 đọc rất nhanh.

Lưu ý interviewer hay bẫy: **R+W>N chưa phải linearizability tuyệt đối** — sloppy quorum, concurrent write, partial write failure vẫn tạo edge case; nó là "strong trong điều kiện bình thường".

**Trade-off latency**: consistency càng mạnh, càng phải chờ nhiều node ack hoặc đi qua một leader → latency tăng và availability giảm (đúng tinh thần PACELC). Vì vậy hệ thống tốt **trộn nhiều mức**: payment đi linearizable, profile đi read-your-writes, view count đi eventual.

### Thiết kế minh hoạ

```text
Quorum N=3, W=2, R=2 (R+W=4 > N=3 → tập đọc ∩ tập ghi ≠ ∅)

WRITE x=2 (chờ 2 ack):           READ x (hỏi 2 node):
        Client                            Client
          │                                 │
   ┌──────┼──────┐                   ┌──────┴──────┐
   ▼      ▼      ▼                   ▼             ▼
 ┌────┐ ┌────┐ ┌────┐             ┌────┐        ┌────┐
 │ A  │ │ B  │ │ C  │             │ B  │        │ C  │
 │x=2✅│ │x=2✅│ │x=1⏳│             │x=2 │        │x=1 │
 └────┘ └────┘ └────┘             │v=9 │        │v=8 │ ← so version
  ack    ack   (chậm)             └────┘        └────┘
                                  → trả x=2 (version cao hơn)
                                  → read repair: đẩy x=2 sang C
```

```typescript
// Pseudo-code: read quorum + chọn version mới nhất + read repair
async function quorumRead(key: string): Promise<Value> {
  const replies = await askReplicas(key, R); // hỏi R node song song
  // R+W>N đảm bảo ít nhất 1 reply mang version mới nhất
  const newest = replies.reduce((a, b) => (a.version > b.version ? a : b));

  // Read repair: node cầm bản cũ được vá luôn trong lúc đọc (chạy nền)
  const stale = replies.filter((r) => r.version < newest.version);
  void repairAsync(key, newest, stale);

  return newest;
}
// Tuning: R=1,W=1 → nhanh, eventual | R=2,W=2 (N=3) → strong-ish, chịu 1 node chết
```

### Đáp án mẫu

> "Consistency model là hợp đồng về việc read thấy gì khi data nằm trên nhiều replica. Mạnh nhất là linearizable — write xong là mọi read sau thấy ngay, cần cho lock và leader election, nhưng đắt vì phải qua quorum hoặc leader. Yếu dần có sequential — mọi client thấy cùng thứ tự; causal — chỉ giữ thứ tự nhân-quả, như reply không bao giờ hiện trước comment gốc; rồi nhóm session guarantees: read-your-writes — em sửa avatar thì chính em phải thấy ngay, và monotonic reads — không bao giờ F5 mà thấy data đi lùi do trúng replica lag. Yếu nhất là eventual — chỉ hứa hội tụ. Với Dynamo-style, em tune bằng quorum: N replica, ghi chờ W ack, đọc hỏi R node; R+W>N thì hai tập giao nhau nên read luôn chạm bản mới nhất — N=3, W=2, R=2 là cấu hình cân bằng. Trade-off xuyên suốt là càng mạnh càng tăng latency, nên em trộn: payment đi strong, profile đi read-your-writes, view count đi eventual."

---

## Câu 30: Consistent Hashing là gì, giải quyết vấn đề gì so với hash modulo? `[Advanced]`

### Câu hỏi

> Consistent hashing là gì? Tại sao `hash(key) % N` gây vấn đề khi thêm/bớt node, và virtual nodes để làm gì? Kể các hệ thống thực tế dùng nó.

### Giải thích lý thuyết

**Vấn đề của hash modulo**: cách chia key về node ngây thơ nhất là `node = hash(key) % N`. Nó hoạt động tốt... cho đến khi N thay đổi:

- Thêm node thứ 5 vào cluster 4 node: `hash(key) % 4` → `% 5` — kết quả đổi với **~80% key** (tổng quát: chỉ ~1/N key giữ nguyên chỗ).
- Với **cache cluster**, gần như toàn bộ key đột nhiên trỏ sai node → **cache miss storm**: hit rate rơi từ 95% về ~0, toàn bộ traffic đập thẳng vào database → database quá tải → sự cố dây chuyền. Thêm node để *giảm tải* lại gây *sập hệ thống* — nghịch lý kinh điển.
- Với **database sharding**, nghĩa là phải di chuyển ~80% dữ liệu giữa các node mỗi lần resize.

**Consistent hashing** giải quyết bằng **hash ring**:

1. Hash space (vd: 0 → 2³²−1) được uốn thành **vòng tròn**.
2. **Cả node lẫn key** đều được hash lên vòng.
3. Key thuộc về node đầu tiên gặp khi đi **theo chiều kim đồng hồ** từ vị trí của key.
4. **Thêm node**: chỉ những key nằm giữa node mới và node liền trước nó phải dời chỗ — trung bình **K/N key** (K = tổng key, N = số node). Thêm node thứ 5 chỉ remap ~20% key thay vì ~80%. **Bớt node**: key của nó trôi sang node kế tiếp, phần còn lại đứng yên.

**Virtual nodes (vnodes)** — vá hai điểm yếu của ring thô:

- Với ít node, vị trí hash ngẫu nhiên dễ **phân bố lệch**: một node có thể "sở hữu" cung tròn lớn gấp nhiều lần node khác.
- Node chết → **toàn bộ** tải của nó đổ lên đúng 1 node kế tiếp (lại quá tải dây chuyền).
- Giải pháp: mỗi node vật lý đặt **hàng trăm điểm ảo** rải khắp ring (`nodeA#0`, `nodeA#1`, ...). Tải được trộn đều theo luật số lớn; node chết thì tải của nó rải đều cho *tất cả* node còn lại. Bonus: node mạnh gán nhiều vnode hơn → **weighted distribution**.

**Hệ thống thực tế**: Memcached client (thuật toán Ketama — nơi consistent hashing nổi tiếng đầu tiên), **Cassandra** và **DynamoDB** (partition data trên ring, Cassandra mặc định 256 vnodes/node), **CDN** (chọn edge cache cho URL — đúng bài toán gốc của paper Karger 1997 tại Akamai), Envoy/nginx load balancing với session affinity, Discord và Riak cho phân tán session/data.

**Insight phỏng vấn**: chuỗi logic ăn điểm là "modulo remap gần hết key → cache miss storm đập vào DB → consistent hashing chỉ remap K/N → virtual nodes chống lệch và chống dồn tải khi node chết". Thiếu vế virtual nodes là thiếu nửa câu trả lời ở level senior.

### Thiết kế minh hoạ

```text
hash(key) % N: thêm 1 node → gần như toàn bộ key đổi chỗ (~80% với N:4→5)

Consistent hashing ring (+ thêm Node D, chỉ k1 phải dời):
                    0/2³²
              ┌──────●──────┐
         k4 ○ │             │ ○ k1   ← k1: trước thuộc B,
              │             │ ▲        nay thuộc D (node mới)
      Node C ■               ■ Node D (MỚI)
              │             │
         k3 ○ │             │ ■ Node B
              ■ Node A      │
              │             │ ○ k2   ← k2, k3, k4: ĐỨNG YÊN
              └─────────────┘
  Quy tắc: key đi theo chiều kim đồng hồ, gặp node nào trước thì thuộc node đó

Virtual nodes: A#1..A#200, B#1..B#200... rải đều ring
  → phân bố đều, node chết thì tải rải cho TẤT CẢ node còn lại
```

```typescript
// Consistent hash ring với virtual nodes (rút gọn)
class ConsistentHashRing {
  // Sorted map: vị trí trên ring → tên node vật lý
  private ring = new Map<number, string>();
  private sortedKeys: number[] = [];

  constructor(nodes: string[], private vnodes = 200) {
    // Immutable-style: build ring mới từ danh sách node
    for (const node of nodes) {
      for (let i = 0; i < vnodes; i++) {
        // Mỗi node vật lý → 200 điểm ảo rải khắp ring chống phân bố lệch
        this.ring.set(hash(`${node}#${i}`), node);
      }
    }
    this.sortedKeys = [...this.ring.keys()].sort((a, b) => a - b);
  }

  getNode(key: string): string {
    const h = hash(key);
    // Binary search: node ảo đầu tiên >= h theo chiều kim đồng hồ
    const idx = lowerBound(this.sortedKeys, h);
    // Quá cuối vòng → quấn về điểm đầu (tính chất vòng tròn)
    const ringKey = this.sortedKeys[idx % this.sortedKeys.length];
    return this.ring.get(ringKey)!;
  }
}

// So sánh: modulo — thêm node thứ 5 thì hash(key)%4 ≠ hash(key)%5 với ~80% key
// Consistent hashing — chỉ ~K/N key (20%) dời chỗ, cache hit rate được bảo toàn
```

### Đáp án mẫu

> "Với `hash(key) % N`, chỉ cần thêm hay bớt một node là gần như toàn bộ key bị remap — N từ 4 lên 5 thì ~80% key đổi chỗ. Với cache cluster đó là cache miss storm: hit rate rơi về 0, toàn bộ traffic đập vào database và sập dây chuyền — thêm node để giảm tải lại gây sự cố. Consistent hashing giải quyết bằng hash ring: cả node lẫn key được hash lên một vòng tròn, key thuộc node đầu tiên theo chiều kim đồng hồ; thêm node chỉ kéo theo trung bình K/N key phải dời, phần còn lại đứng yên. Ring thô có hai điểm yếu — phân bố lệch khi ít node, và node chết thì toàn bộ tải dồn lên đúng node kế tiếp — nên thực tế luôn dùng virtual nodes: mỗi node vật lý đặt vài trăm điểm ảo rải khắp ring, tải đều hơn và node chết thì tải rải cho tất cả node còn lại. Em gặp nó ở Memcached client với Ketama, Cassandra và DynamoDB partition theo ring, và CDN chọn edge cache — đúng bài toán gốc của paper Akamai."

---

## Câu 54: Hot partition / hot key là gì? Vì sao xảy ra và cách giảm nhẹ? `[Advanced]`

### Câu hỏi

> Hot partition / hot key là gì, tại sao xảy ra dù đã shard "đều"? Hậu quả là gì và có những kỹ thuật nào để giảm nhẹ?

### Giải thích lý thuyết

**Hot partition / hot key** là khi một partition (hoặc một key) nhận lượng traffic **vượt trội** so với phần còn lại, vượt quá năng lực của node đang giữ nó — trong khi các node khác nhàn rỗi. Sharding chia *key space* đều, nhưng **không chia được *traffic* đều** vì workload thực tế tuân theo phân phối lệch (Zipf/power-law).

**Nguyên nhân điển hình**:

- **Celebrity problem**: partition theo `user_id` thì tài khoản 100 triệu follower (post viral, flash sale một sản phẩm) dồn toàn bộ read/write về đúng 1 partition — Twitter, Instagram đều phải xử lý riêng nhóm user này.
- **Key tuần tự theo thời gian**: partition key là timestamp/ID tăng dần → **mọi write mới luôn rơi vào partition cuối cùng** ("moving hotspot") — các partition cũ chỉ còn read. Đây là anti-pattern kinh điển của DynamoDB/HBase/Bigtable.
- Sự kiện đột biến: một URL viral, một mã giảm giá, một trận bóng — tất cả client cùng đọc/ghi đúng 1 key.

**Hậu quả**: node giữ hot partition bị quá tải CPU/IO → latency p99 tăng vọt, **throttling** (DynamoDB trả `ProvisionedThroughputExceededException` dù tổng capacity của bảng còn thừa — vì capacity chia *theo partition*), tệ hơn là node chết và tải dồn sang node kế tiếp gây dây chuyền. Điểm đau nhất: **scale thêm node không giải quyết được** — vì vấn đề nằm ở *một* key, không phải tổng tải.

**Các kỹ thuật giảm nhẹ** (thường kết hợp nhiều cách):

1. **Key salting / shard 1 key thành N** (cho **write-hot**): thay vì ghi vào `key`, ghi ngẫu nhiên vào `key#0` … `key#N-1` (random suffix) → write rải đều N partition. Đổi lại, **đọc phải scatter-gather**: query cả N mảnh rồi gộp (sum counter, merge list). Trade-off rõ ràng: write scale N lần, read đắt N lần — hợp với counter, time-series ghi nhiều đọc ít.
2. **Local cache phía client / in-process cache** (cho **read-hot**): hot key thường ít và đổi chậm → cache ngay trong RAM của app server với TTL ngắn (1–5s) chặn phần lớn read trước khi chạm cache cluster/DB. TTL ngắn cũng giới hạn cửa sổ stale.
3. **Dedicated cache cho hot key**: phát hiện hot key (đếm tần suất, top-K/heavy hitters) rồi đẩy riêng sang tầng cache chuyên dụng hoặc replicate key đó ra **nhiều** cache node (thay vì 1 node theo consistent hashing) để chia read.
4. **Tách nhóm đặc biệt**: với celebrity, đổi hẳn chiến lược — fan-out-on-read thay vì fan-out-on-write cho user nhiều follower (cách Twitter làm với feed).
5. **DynamoDB adaptive capacity**: AWS tự động (a) cho hot partition "mượn" throughput chưa dùng của bảng, (b) **split partition theo độ nóng** — tự tách hot partition làm đôi, thậm chí isolate một hot key ra partition riêng. Giảm đau đáng kể nhưng **không phải đũa thần**: vẫn có trần cứng ~3000 RCU / 1000 WCU *mỗi partition* — một key duy nhất vượt mức đó thì chỉ schema-level fix (salting) mới cứu được.

**Insight phỏng vấn**: interviewer muốn nghe bạn chẩn đoán "vì sao thêm node không cứu được" và nói được trade-off của salting (write rải đều ↔ read scatter-gather). Trả lời "thì cứ thêm cache" mà không phân biệt read-hot vs write-hot là chưa đạt.

### Thiết kế minh hoạ

```text
Hot key: counter của post viral — mọi write dồn 1 partition
        ┌─────────┐  likes:post123   ┌─────────────┐
        │ Clients │ ───────────────► │ Partition 7 │ ← 🔥 quá tải, throttle
        └─────────┘                  │ P1..P6, P8  │ ← nhàn rỗi
                                     └─────────────┘
GIẢI PHÁP: Write sharding (salting) + scatter-gather read
WRITE: suffix ngẫu nhiên 0..3        READ: gộp cả 4 mảnh
likes:post123#2  ──► Partition 3     SUM( #0 + #1 + #2 + #3 )
likes:post123#0  ──► Partition 7         = tổng like thật
likes:post123#3  ──► Partition 1     (read đắt hơn 4 lần — trade-off)
likes:post123#1  ──► Partition 5

READ-HOT thì khác: chặn từ sớm bằng cache nhiều tầng
Client → [in-process cache TTL 2s] → [Redis] → [DB]
            chặn ~99% read hot key
```

```typescript
// Write sharding cho hot counter (DynamoDB-style)
const SHARD_COUNT = 8; // N mảnh — chọn theo mức write cần scale

// Ghi: rải write ra N partition bằng suffix ngẫu nhiên
async function incrementLikes(postId: string): Promise<void> {
  const shard = Math.floor(Math.random() * SHARD_COUNT);
  // partition key = "post123#5" → các write rơi vào 8 partition khác nhau
  await db.update({
    key: `likes:${postId}#${shard}`,
    expression: "ADD cnt 1",
  });
}

// Đọc: scatter-gather — query cả N mảnh song song rồi cộng dồn
async function getLikes(postId: string): Promise<number> {
  const shardKeys = Array.from({ length: SHARD_COUNT }, (_, i) => `likes:${postId}#${i}`);
  const counts = await Promise.all(shardKeys.map((k) => db.get(k)));
  // Trade-off: read đắt N lần → thường cache kết quả tổng với TTL ngắn
  return counts.reduce((sum, c) => sum + (c?.cnt ?? 0), 0);
}

// Read-hot: local cache TTL ngắn chặn read trước khi chạm Redis/DB
const local = new TTLCache<string, number>({ ttlMs: 2_000 });
async function getLikesCached(postId: string): Promise<number> {
  const hit = local.get(postId);
  if (hit !== undefined) return hit; // chặn tại RAM của app server
  const total = await getLikes(postId);
  local.set(postId, total); // stale tối đa 2s — chấp nhận được với like count
  return total;
}
```

### Đáp án mẫu

> "Hot partition là khi một partition hay một key nhận traffic vượt trội khiến node giữ nó quá tải trong khi các node khác nhàn rỗi — sharding chia key space đều nhưng traffic thực tế theo phân phối Zipf nên không đều. Hai nguyên nhân kinh điển: celebrity problem — post viral hay flash sale dồn cả triệu request vào một key; và key tuần tự theo thời gian — partition theo timestamp thì mọi write mới rơi vào partition cuối. Hậu quả là p99 tăng vọt và throttling — DynamoDB báo throughput exceeded dù tổng capacity còn thừa, vì capacity tính theo partition — và điểm đau là thêm node không cứu được vì vấn đề nằm ở một key. Cách xử lý em tách theo loại: write-hot thì salting — shard một key thành N mảnh với random suffix, write rải đều nhưng read phải scatter-gather cộng dồn, đắt N lần; read-hot thì local cache phía client TTL 1–2 giây cộng dedicated cache cho hot key. DynamoDB có adaptive capacity tự split partition nóng, nhưng vẫn có trần per-partition nên fix tận gốc vẫn là thiết kế key."

---

## Bẫy thường gặp khi trả lời

| Sai lầm | Đúng là |
| --- | --- |
| "CAP: cứ chọn 2 trong 3 tuỳ thích" | P là bắt buộc trong thực tế — câu hỏi thật là chọn C hay A **khi partition xảy ra**; lúc bình thường là Latency vs Consistency (PACELC) |
| "C trong CAP giống C trong ACID" | CAP-C là linearizability (mọi read thấy write mới nhất); ACID-C là giữ constraint/invariant của database — hai khái niệm khác nhau |
| "NoSQL thì không có transaction, SQL thì không scale" | Ranh giới đã mờ: NewSQL (Spanner, CockroachDB) cho ACID phân tán; MongoDB/DynamoDB có transaction giới hạn — chọn theo loại data, không theo nhãn |
| "Horizontal scaling luôn tốt hơn vertical" | Vertical rẻ engineering effort và không phát sinh vấn đề phân tán — chiến lược đúng là vertical trước, scale out web tier sớm, sharding DB sau cùng |
| "Latency trung bình 50ms là hệ thống ổn" | Phân phối lệch đuôi dài — phải nhìn p95/p99; tail latency amplification khiến page gọi 50 service dính p99 với xác suất ~39% |
| "Eventual consistency nghĩa là data sai" | Là data **hội tụ dần** — và giữa eventual với strong còn cả phổ: causal, read-your-writes, monotonic reads đủ tốt cho đa số tính năng |
| "R+W>N là có linearizability tuyệt đối" | Chỉ "strong trong điều kiện bình thường" — sloppy quorum, concurrent write, partial failure vẫn tạo edge case |
| "Hash modulo cũng được, thêm node mấy khi xảy ra" | Mỗi lần resize remap ~(N-1)/N key → cache miss storm đập vào DB; consistent hashing chỉ remap K/N, và phải kèm virtual nodes |
| "Hot partition thì thêm node là xong" | Vấn đề nằm ở **một** key — thêm node không chia được nó; phải salting (write-hot) hoặc cache nhiều tầng (read-hot) |
| "Cứ trả lời định nghĩa đúng là đạt" | Interviewer muốn nghe **trade-off và bối cảnh áp dụng** — mỗi lựa chọn phải đi kèm "được gì, mất gì, vì sao hợp bài toán này" |
