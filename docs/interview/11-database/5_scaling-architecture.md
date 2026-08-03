---
sidebar_position: 5
title: "5. Scaling & Architecture"
---

# Scaling & Architecture

> *Nhóm câu hỏi system design cho database — thường xuất hiện ở vòng Senior. Không cần thuộc lòng cách vận hành Cassandra, nhưng phải nói được trade-off và biết khi nào KHÔNG cần đến giải pháp phức tạp.*
>
> 📌 *Index cơ bản, composite index, EXPLAIN/EXPLAIN ANALYZE đã có bài chi tiết tại [SQL & Databases — Indexing & Performance](../09-sql/2_indexing-performance.md).*

:::note[Ghi nhớ nhanh]

- ⭐ **Chọn index theo loại phép so sánh** — B-tree (mặc định, ~95% ca), GIN (JSONB/array/full-text), GiST (geometry/range), BRIN (bảng log khổng lồ).
- **B-tree** hỗ trợ `=`, `<`, `>`, `BETWEEN`, `ORDER BY`, prefix `LIKE 'abc%'`; **Hash** chỉ hỗ trợ `=`.
- ⭐ **GIN cho giá trị "chứa nhiều phần tử"** (JSONB, array) — trả lời "row nào chứa X"; đánh đổi: ghi chậm hơn, index to hơn.
- **BRIN cực nhỏ** — hiệu quả với dữ liệu tương quan vật lý (time-series, log append-only).

:::

---

## Câu 1: B-tree, Hash, GIN index khác nhau như thế nào? `[Senior]`

### Câu hỏi

> PostgreSQL có nhiều loại index: B-tree, Hash, GIN (và GiST, BRIN). Em giải thích cấu trúc, loại query phù hợp của từng loại?

### Giải thích lý thuyết

Index không phải "một thứ" — mỗi loại là một cấu trúc dữ liệu khác nhau, tối ưu cho **loại phép so sánh khác nhau**:

| Loại | Cấu trúc | Hỗ trợ | Dùng cho |
| ---- | -------- | ------ | -------- |
| **B-tree** (mặc định) | Cây cân bằng, lá có thứ tự | `=`, `<`, `>`, `BETWEEN`, `ORDER BY`, prefix `LIKE 'abc%'` | 95% trường hợp: PK, FK, range, sort |
| **Hash** | Hash table | **Chỉ `=`** | Equality thuần trên giá trị dài; lợi ích nhỏ so với B-tree, ít dùng |
| **GIN** (Generalized Inverted Index) | Inverted index: phần tử → danh sách row chứa nó | `@>`, `?`, `&&`, full-text `@@` | **JSONB, array, full-text search** — giá trị "kép" chứa nhiều phần tử |
| **GiST** | Cây tổng quát hoá | Overlap, gần nhất, khoảng cách | Geometry (PostGIS), range type, nearest-neighbor |
| **BRIN** | Tóm tắt min/max theo block | Range trên dữ liệu **tương quan vật lý** | Bảng append-only khổng lồ (log, time-series) — index siêu nhỏ |

Logic chọn:

- **B-tree là mặc định đúng** cho cột scalar — chỉ rời khỏi nó khi có lý do.
- Cột **JSONB/array/tsvector** → B-tree vô dụng (nó so sánh cả giá trị, không nhìn vào *bên trong*) → cần **GIN**: index từng phần tử bên trong, trả lời "row nào *chứa* X".
- Trade-off của GIN: **ghi chậm hơn và index to hơn** (mỗi row sinh nhiều entry) — cân nhắc trên bảng write-heavy.
- **BRIN** cho bảng log hàng trăm GB: index chỉ vài MB, hiệu quả khi dữ liệu ghi theo thứ tự thời gian.

### Code minh hoạ

```sql
-- B-tree (mặc định): equality, range, sort
CREATE INDEX idx_orders_created ON orders (created_at);
SELECT * FROM orders WHERE created_at >= '2026-01-01' ORDER BY created_at;

-- GIN cho JSONB: tìm "bên trong" document
CREATE INDEX idx_products_attrs ON products USING GIN (attrs);
SELECT * FROM products WHERE attrs @> '{"color": "red", "size": "XL"}';

-- GIN cho array
CREATE INDEX idx_posts_tags ON posts USING GIN (tags);
SELECT * FROM posts WHERE tags && ARRAY['postgres', 'index'];  -- overlap

-- GIN cho full-text search
CREATE INDEX idx_articles_fts ON articles
  USING GIN (to_tsvector('simple', title || ' ' || body));
SELECT * FROM articles
WHERE to_tsvector('simple', title || ' ' || body) @@ plainto_tsquery('database index');

-- BRIN cho bảng log khổng lồ ghi theo thời gian: index vài MB thay vì vài GB
CREATE INDEX idx_logs_time ON logs USING BRIN (created_at);
```

### Đáp án mẫu

> "Mỗi loại index là một cấu trúc dữ liệu cho một loại phép so sánh. **B-tree** là cây cân bằng có thứ tự — equality, range, ORDER BY, prefix LIKE — đúng cho 95% trường hợp và là mặc định. **Hash** chỉ làm equality, lợi ích biên so với B-tree nên em hiếm khi dùng. **GIN** là inverted index — map từng phần tử bên trong giá trị tới row chứa nó — bắt buộc cho JSONB, array, full-text search, vì B-tree không nhìn được vào bên trong giá trị kép; trade-off là ghi chậm hơn và index to hơn. Thêm hai loại đáng biết: **GiST** cho geometry và nearest-neighbor với PostGIS, **BRIN** cho bảng log append-only khổng lồ — chỉ lưu min/max theo block nên index vài MB cho bảng trăm GB. Quy tắc của em: B-tree trừ khi kiểu dữ liệu hoặc phép toán nói khác đi, và quyết định nào cũng xác nhận lại bằng EXPLAIN ANALYZE."

---

## Câu 2: Database replication — Primary-Replica hoạt động thế nào? `[Senior]`

### Câu hỏi

> Replication là gì? Kiến trúc primary-replica hoạt động thế nào? Vấn đề replication lag và cách xử lý ở tầng application?

### Giải thích lý thuyết

**Replication** = duy trì nhiều bản sao dữ liệu trên nhiều node. Mục đích: **scale read** (dồn SELECT sang replica), **high availability** (primary chết → promote replica), backup/analytics không đè production.

**Primary-Replica (leader-follower)** — kiến trúc phổ biến nhất:

- **Mọi ghi đi vào primary**. Primary ghi WAL (write-ahead log) → stream log sang các replica → replica replay để đuổi theo.
- **Đọc** từ replica (read scaling). Replica là read-only.

**Sync vs Async** — trade-off trung tâm:

- **Async** (mặc định): primary commit không chờ replica → ghi nhanh, nhưng có **replication lag** (replica trễ vài ms đến vài giây) và rủi ro mất giao dịch mới nhất khi primary chết đột ngột.
- **Sync**: commit chờ ít nhất 1 replica xác nhận → không mất dữ liệu, đổi lại ghi chậm hơn và replica treo là ghi tắc.

**Replication lag** sinh ra vấn đề kinh điển **read-your-own-writes**: user vừa đổi tên (ghi vào primary) → trang reload đọc từ replica chưa kịp sync → thấy tên cũ → tưởng lỗi. Cách xử lý ở application:

1. **Đọc từ primary cho dữ liệu user vừa ghi** (sticky theo session trong N giây sau khi ghi).
2. Route theo loại query: transaction/sau-khi-ghi → primary; list, search, report → replica.
3. Failover: dùng managed (RDS, Cloud SQL) hoặc Patroni — tự promote replica; cẩn thận **split-brain** (hai node cùng nghĩ mình là primary).

### Code minh hoạ

```text
                    ┌──────────────┐
   writes ────────► │   PRIMARY    │
                    │  (WAL log)   │
                    └──────┬───────┘
                 WAL streaming (async)
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
 reads► │ REPLICA 1│ │ REPLICA 2│ │ REPLICA 3│ ◄ analytics
        └──────────┘ └──────────┘ └──────────┘
```

```ts
// Application-level routing: tách read/write + read-your-own-writes
const writePool = new Pool({ host: PRIMARY_HOST });
const readPool = new Pool({ host: REPLICA_HOST });

async function getUserProfile(userId: string, ctx: RequestContext) {
  // User vừa ghi trong 5s gần đây → đọc primary để thấy ngay thay đổi của mình
  const useprimary = ctx.lastWriteAt && Date.now() - ctx.lastWriteAt < 5000;
  const pool = useprimary ? writePool : readPool;
  return pool.query("SELECT * FROM users WHERE id = $1", [userId]);
}

async function updateProfile(userId: string, data: ProfileDto, ctx: RequestContext) {
  await writePool.query("UPDATE users SET name = $1 WHERE id = $2", [data.name, userId]);
  ctx.lastWriteAt = Date.now();   // đánh dấu để các read sau đó sticky về primary
}
```

```sql
-- Theo dõi lag trên primary (PostgreSQL)
SELECT client_addr, state,
       pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn) AS lag_bytes
FROM pg_stat_replication;
```

### Đáp án mẫu

> "Replication là duy trì nhiều bản sao dữ liệu để scale read và high availability. Kiến trúc primary-replica: mọi write vào primary, primary stream WAL sang các replica để replay, còn read dồn sang replica. Trade-off trung tâm là sync hay async: async ghi nhanh nhưng có replication lag và rủi ro mất transaction cuối khi primary chết; sync không mất dữ liệu nhưng ghi chậm và phụ thuộc replica sống. Lag sinh ra bài toán **read-your-own-writes**: user vừa đổi tên, reload đọc từ replica trễ lại thấy tên cũ — em xử lý ở application bằng sticky-to-primary vài giây sau mỗi lần ghi của chính user đó, còn lại list và report thì cứ replica. Failover thì em dùng managed service hoặc Patroni để tự promote, và luôn cảnh giác split-brain. Em cũng monitor lag bằng `pg_stat_replication` — lag tăng bất thường là tín hiệu replica quá tải."

---

## Câu 3: Database sharding là gì? Khi nào cần? `[Senior]`

### Câu hỏi

> Sharding là gì, khác gì replication? Các chiến lược chọn shard key? Khi nào thực sự cần shard — và những gì mất đi khi shard?

### Giải thích lý thuyết

**Sharding** = chia **dữ liệu** thành nhiều phần (shard), mỗi shard nằm trên server riêng — mỗi node chỉ giữ **một phần** dữ liệu. Khác replication ở bản chất: replication **copy toàn bộ** data ra nhiều node (scale read); sharding **chia nhỏ** data (scale **write** + vượt giới hạn dung lượng một máy).

Chiến lược shard key:

| Chiến lược | Cách chia | Ưu / Nhược |
| ---------- | --------- | ----------- |
| **Hash-based** | `hash(key) % N` | Phân bố đều / range query phải hỏi mọi shard; thêm node phải rebalance (consistent hashing giảm đau) |
| **Range-based** | Theo khoảng giá trị (A-M, N-Z; theo thời gian) | Range query tốt / dễ **hotspot** (shard chứa tháng hiện tại gánh hết write) |
| **Directory/lookup** | Bảng map key → shard | Linh hoạt di chuyển / lookup service thành SPOF |

**Cái giá phải trả** (phần quan trọng nhất):

- **Mất JOIN cross-shard** — join phải làm ở application hoặc fan-out.
- **Mất transaction cross-shard** — cần 2PC/saga, phức tạp và chậm.
- Query không chứa shard key → **scatter-gather** hỏi mọi shard.
- Rebalancing khi thêm node, hotspot ("celebrity problem" — user nổi tiếng dồn 1 shard), vận hành phức tạp gấp bội.

**Khi nào cần**: chỉ khi **một primary không gánh nổi write** hoặc data vượt dung lượng/RAM một máy — và đã vắt kiệt các bước trước: tối ưu query/index → scale dọc (máy to hơn) → read replica → cache → **partitioning trong một node** (PostgreSQL declarative partitioning) → archive data cũ. Sharding là **phương án cuối**, không phải dấu hiệu "kiến trúc xịn". Chọn shard key theo access pattern: hầu hết query phải chứa shard key (đa số hệ B2C shard theo `user_id`/`tenant_id`).

### Code minh hoạ

```text
Replication (copy toàn bộ):          Sharding (chia dữ liệu):
┌─────────┐  ┌─────────┐             ┌──────────┐  ┌──────────┐
│ Node A  │  │ Node B  │             │ Shard 1  │  │ Shard 2  │
│ user1..N│  │ user1..N│             │ user A-M │  │ user N-Z │
└─────────┘  └─────────┘             └──────────┘  └──────────┘
  (bản sao giống nhau)                 (mỗi node một phần)
```

```ts
// Hash-based sharding ở application level (minh hoạ)
const SHARD_COUNT = 4;
const pools = [pool0, pool1, pool2, pool3];

function getShard(userId: string) {
  const hash = murmurhash(userId);
  return pools[hash % SHARD_COUNT];
}

// Query CÓ shard key: đi thẳng 1 shard — nhanh
await getShard(userId).query("SELECT * FROM orders WHERE user_id = $1", [userId]);

// Query KHÔNG có shard key: scatter-gather mọi shard — đắt, tránh thiết kế kiểu này
const results = await Promise.all(
  pools.map((p) => p.query("SELECT * FROM orders WHERE status = 'pending' LIMIT 10"))
);
```

```sql
-- Trước khi shard: partitioning trong MỘT node giải được rất nhiều bài toán
CREATE TABLE orders (
  id BIGINT, user_id BIGINT, created_at TIMESTAMPTZ NOT NULL, total NUMERIC
) PARTITION BY RANGE (created_at);

CREATE TABLE orders_2026_06 PARTITION OF orders
  FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
```

### Đáp án mẫu

> "Sharding là chia dữ liệu thành nhiều phần trên nhiều server — khác replication vốn copy toàn bộ: replication scale read, sharding scale write và vượt giới hạn một máy. Shard key có ba chiến lược: hash phân bố đều nhưng mất range query; range thì range query tốt nhưng dễ hotspot kiểu shard tháng hiện tại gánh hết write; directory linh hoạt nhưng lookup service thành điểm chết. Cái em luôn nhấn mạnh là **giá phải trả**: mất JOIN và transaction cross-shard, query thiếu shard key thành scatter-gather, rebalancing và vận hành phức tạp gấp bội. Nên sharding là phương án cuối — trước đó phải vắt kiệt: index, scale dọc, read replica, cache, partitioning trong một node, archive data cũ. Khi buộc phải shard, em chọn shard key theo access pattern — đa số hệ B2C là user_id hay tenant_id để hầu hết query đi thẳng một shard — hoặc dùng hệ đã shard sẵn như Citus, Vitess, MongoDB thay vì tự chế."

---

## Câu 4: CAP theorem là gì? Ý nghĩa khi chọn database? `[Senior]`

### Câu hỏi

> CAP theorem là gì? Vì sao nói lựa chọn thật sự chỉ là CP vs AP? Áp dụng vào chọn database thực tế thế nào?

### Giải thích lý thuyết

**CAP theorem**: một hệ phân tán chỉ đảm bảo đồng thời **2 trong 3**:

- **C — Consistency**: mọi read thấy write mới nhất (mọi node nhìn cùng một dữ liệu tại một thời điểm).
- **A — Availability**: mọi request đều nhận response (dù có thể là data cũ).
- **P — Partition tolerance**: hệ vẫn chạy khi network giữa các node bị đứt (partition).

Insight then chốt: **P không phải lựa chọn** — network partition *chắc chắn xảy ra* trong hệ phân tán. Nên lựa chọn thật là **khi partition xảy ra, hy sinh C hay A**:

- **CP**: từ chối phục vụ (mất A) còn hơn trả data sai. Ví dụ: etcd, ZooKeeper, HBase; hệ thống tiền bạc, inventory.
- **AP**: tiếp tục phục vụ data có thể cũ (mất C), sync lại sau — **eventual consistency**. Ví dụ: Cassandra, DynamoDB (default), CouchDB; feed, giỏ hàng, presence status.

Sắc thái để không trả lời sách vở:

- **Khi không có partition, không phải đánh đổi C vs A** — lúc đó trade-off là **latency vs consistency** (mở rộng PACELC: *if Partition then A-vs-C, Else Latency-vs-Consistency*).
- Database một node (Postgres đơn) không nằm trong phạm vi CAP — CAP chỉ áp cho hệ phân tán; thêm async replica là bắt đầu nếm mùi AP (replication lag chính là eventual consistency).
- Nhiều hệ cho **tune theo từng query**: Cassandra/DynamoDB chọn consistency level mỗi lần đọc/ghi (`QUORUM` vs `ONE`) — CAP là spectrum, không phải công tắc.

### Code minh hoạ

```text
Network partition xảy ra:

   Client ──► [Node A]  ✂✂✂  [Node B] ◄── Client
                 │   (đứt mạng)   │
   CP: Node thiểu số TỪ CHỐI request → đúng nhưng một phần hệ thống unavailable
   AP: Cả hai node VẪN trả lời → available nhưng có thể trả/nhận data lệch nhau
       → partition lành: reconcile (last-write-wins, vector clock, CRDT)
```

```js
// Cassandra: tune C vs A theo TỪNG query — CAP là spectrum
// Ghi quan trọng: chờ đa số node xác nhận (nghiêng C)
await client.execute(query, params, { consistency: types.consistencies.quorum });

// Đọc feed: 1 node trả lời là đủ (nghiêng A, nhanh)
await client.execute(query, params, { consistency: types.consistencies.one });

// Quy tắc: W + R > N (vd: N=3, W=2, R=2) → read luôn gặp write mới nhất
```

### Đáp án mẫu

> "CAP nói hệ phân tán chỉ giữ được 2 trong 3: consistency — mọi read thấy write mới nhất, availability — mọi request có response, và partition tolerance. Nhưng điểm mấu chốt: P không phải lựa chọn vì network partition chắc chắn xảy ra — nên câu hỏi thật là **khi partition, hy sinh C hay A**. CP như etcd, ZooKeeper: thà từ chối phục vụ còn hơn trả data sai — hợp với tiền và inventory; AP như Cassandra, DynamoDB: tiếp tục phục vụ data có thể cũ rồi sync sau — hợp với feed, status. Hai sắc thái em hay bổ sung: PACELC — lúc bình thường trade-off là latency vs consistency, đó là lý do replication lag tồn tại; và CAP là spectrum — Cassandra cho chọn consistency level từng query, ghi QUORUM đọc QUORUM là nghiêng C, đọc ONE là nghiêng A. Thực tế em chọn theo từng loại dữ liệu trong hệ thống chứ không phải một nhãn cho cả database."

---

## Câu 5: Connection pooling là gì? Tại sao quan trọng? `[Senior]`

### Câu hỏi

> Connection pooling là gì? Tại sao tạo connection mới mỗi request là thảm hoạ? Sizing pool thế nào và PgBouncer giải quyết vấn đề gì trong môi trường serverless?

### Giải thích lý thuyết

**Connection pool** = giữ sẵn một nhóm kết nối DB **mở sẵn và tái sử dụng**, thay vì mỗi request mở connection mới rồi đóng.

Vì sao bắt buộc:

- Mở connection mới **đắt**: TCP handshake + TLS + authentication + (PostgreSQL) **fork một process riêng** cho mỗi connection — tốn vài đến chục ms và vài MB RAM mỗi connection.
- PostgreSQL có `max_connections` hữu hạn (mặc định 100) — không pool thì traffic cao là cạn connection, request mới bị từ chối.
- Quá **nhiều** connection cũng hại: hàng trăm process active cạnh tranh CPU/lock — throughput **giảm** chứ không tăng.

**Sizing**: pool to hơn ≠ nhanh hơn. Công thức tham khảo (HikariCP): `connections ≈ (số core × 2) + số disk hiệu dụng` — thường nhỏ đáng ngạc nhiên (10-20). Quan trọng: tổng connection của **mọi instance app** cộng lại phải dưới `max_connections` của DB.

**Hai tầng pool**:

1. **Application-level**: pool trong process app (node-postgres `Pool`, HikariCP, Prisma `connection_limit`).
2. **External pooler — PgBouncer/PgCat/RDS Proxy**: đứng giữa app và DB. Chế độ quan trọng nhất: **transaction mode** — connection thật chỉ được "mượn" trong thời gian một transaction rồi trả ngay → vài nghìn client connection dồn xuống vài chục connection thật.

**Serverless là lý do PgBouncer thành bắt buộc**: mỗi lambda/function instance tự mở connection riêng → 1000 instance scale đồng thời = 1000 connection = DB chết. Pooler (PgBouncer, RDS Proxy, Supabase pooler) hấp thụ cú scale đó. Lưu ý transaction mode: không dùng được session state (prepared statement theo session, `SET`, advisory lock theo session).

### Code minh hoạ

```ts
// node-postgres: pool ở application level
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST,
  max: 20,                      // tổng các instance app phải < max_connections của DB
  idleTimeoutMillis: 30_000,    // đóng connection rảnh
  connectionTimeoutMillis: 2_000, // chờ quá 2s không lấy được connection → fail nhanh
});

// Lấy connection từ pool — xong PHẢI trả (release), quên là pool cạn dần (leak)
const client = await pool.connect();
try {
  await client.query("BEGIN");
  // ...
  await client.query("COMMIT");
} catch (e) {
  await client.query("ROLLBACK");
  throw e;
} finally {
  client.release();             // bắt buộc, kể cả khi lỗi
}
```

```ini
; pgbouncer.ini — transaction mode: nghìn client → vài chục connection thật
[databases]
appdb = host=10.0.0.5 port=5432 dbname=appdb

[pgbouncer]
pool_mode = transaction       ; connection thật chỉ mượn trong 1 transaction
max_client_conn = 5000        ; nhận 5000 client...
default_pool_size = 25        ; ...dồn xuống 25 connection thật tới PostgreSQL
```

```bash
# Prisma + pooler trong serverless
DATABASE_URL="postgresql://user:pass@pgbouncer:6432/appdb?pgbouncer=true&connection_limit=5"
```

### Đáp án mẫu

> "Connection pool giữ sẵn nhóm kết nối mở để tái sử dụng. Phải có vì hai phía: mở connection PostgreSQL rất đắt — TCP, TLS, auth và fork hẳn một process, vài MB RAM mỗi cái; còn `max_connections` thì hữu hạn, và quá nhiều connection active lại làm throughput giảm vì cạnh tranh CPU và lock. Sizing thì pool to không phải nhanh hơn — công thức tham khảo là số core nhân 2, thường chỉ 10-20, và tổng mọi instance app phải dưới max_connections. Có hai tầng: pool trong app như pg Pool hay HikariCP, và external pooler như PgBouncer chạy transaction mode — connection thật chỉ mượn trong một transaction nên vài nghìn client dồn xuống vài chục connection thật. Serverless là nơi pooler thành bắt buộc: nghìn lambda scale đồng thời là nghìn connection trực tiếp — DB chết ngay, phải có PgBouncer hay RDS Proxy đứng giữa. Hai lỗi em hay gặp khi review: quên `release()` connection trong error path làm pool leak cạn dần, và dùng session state như prepared statement với pooler transaction mode."
