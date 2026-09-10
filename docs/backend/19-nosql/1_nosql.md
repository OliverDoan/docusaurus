---
sidebar_position: 1
title: "1. NoSQL: Document, Key-Value, Wide-Column, Graph, Time-Series"
---

# NoSQL: Document, Key-Value, Wide-Column, Graph, Time-Series

NoSQL là nhóm các database không theo kiểu bảng quan hệ (relational) như SQL truyền thống, với schema linh hoạt và khả năng mở rộng theo chiều ngang dễ hơn. Bài này giới thiệu các loại NoSQL phổ biến: document (MongoDB), key-value (Redis, DynamoDB), wide-column (Cassandra), graph (Neo4j) và time-series, kèm theo từng loại phù hợp với bài toán nào. Hiểu các lựa chọn này giúp bạn chọn đúng "công cụ" cho từng nhu cầu thay vì dùng một database cho mọi thứ.

---

:::note[Ghi nhớ nhanh]

- ⭐ **NoSQL = "Not Only SQL"** — schema linh hoạt, scale horizontal dễ hơn, hạn chế JOIN, đa số trade consistency lấy availability/performance.
- **5 loại chính** — Document (`MongoDB`), Key-Value (`Redis`/`DynamoDB`), Wide-Column (`Cassandra`), Graph (`Neo4j`), Time-Series (`TimescaleDB`/`InfluxDB`).
- ⭐ **`PostgreSQL JSONB` thay được MongoDB cho ~90% case** — Postgres + extension (`pgvector`, `TimescaleDB`, `pg_trgm`) cover phần lớn nhu cầu.
- **`Polyglot persistence`** — mỗi DB tối ưu cho 1 task, đổi lại tốn công sync + vận hành nhiều hệ thống.
- **Đừng chọn NoSQL vì hype** — default Postgres, chỉ thêm NoSQL khi data nature thực sự fit (event log, vector, cache).

:::

---

## Mục lục

- [NoSQL là gì?](#nosql-là-gì)
- [Document DB (MongoDB)](#document-db-mongodb)
- [Key-Value (Redis, DynamoDB)](#key-value-redis-dynamodb)
- [Wide-Column (Cassandra)](#wide-column-cassandra)
- [Graph DB (Neo4j)](#graph-db-neo4j)
- [Time Series DB](#time-series-db)
- [Khi nào dùng NoSQL?](#khi-nào-dùng-nosql)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## NoSQL là gì?

**NoSQL** = "Not Only SQL" — DB không phải relational.

**Đặc điểm chung**:

- Schema **linh hoạt** (hoặc schemaless).
- Scale **horizontal** dễ hơn.
- Trade **consistency** cho **availability/performance** (đa số).
- **Không JOIN** (hoặc rất hạn chế).

:::tip[Ví dụ đời thường]

**SQL** giống **tủ hồ sơ kẻ ô sẵn**: mọi tờ khai đều đúng một mẫu, thiếu ô là nhân viên trả lại. Nhờ vậy tra cứu chéo giữa các ngăn rất dễ, số liệu không bao giờ lệch mẫu.

**NoSQL** giống **thùng đựng đồ**: nhét gì vào cũng được, thêm bớt tuỳ ý, cần chứa nhiều thì mua thêm thùng xếp cạnh nhau. Đổi lại **không còn ai gác cửa kiểm tra mẫu** — dữ liệu rác lọt vào lúc nào không hay, và việc ghép đồ ở thùng này với đồ ở thùng kia (JOIN) phải tự làm bằng tay trong code.

:::

---

## Document DB (MongoDB)

**Lưu document** JSON (BSON) — schemaless.

:::tip[Ví dụ đời thường]

Hồ sơ bệnh nhân ở phòng khám: mỗi người **một bìa còng riêng**, bên trong kẹp đủ thứ — đơn thuốc, phim chụp, giấy xét nghiệm. Người này 5 tờ, người kia 30 tờ, chẳng sao cả. Cần xem toàn bộ thông tin một người thì rút đúng một bìa là có hết, không phải chạy sang 6 ngăn tủ khác gom lại.

Cái giá: hỏi **"cả phòng khám có bao nhiêu người dị ứng thuốc?"** thì phải mở từng bìa ra đọc, và không ai đảm bảo bìa nào cũng có tờ khai dị ứng.

:::

```js
// MongoDB
db.users.insertOne({
  name: "An",
  email: "an@example.com",
  addresses: [
    { city: "HN", street: "..." },
    { city: "HCM", street: "..." },
  ],
  metadata: { source: "google" },
});

// Query
db.users.find({ "addresses.city": "HN" });
db.users.updateOne(
  { email: "an@example.com" },
  { $push: { addresses: { city: "DN" } } }
);
```

**Phù hợp**:

- Schema thay đổi nhiều (CMS, product với many attribute).
- Hierarchical nested data.
- Prototype nhanh.

**Phổ biến**:

- **MongoDB** — popular nhất, Atlas managed.
- **CouchDB** — sync với mobile.
- **AWS DocumentDB** — Mongo-compat.

:::info[Phân tích]

**MongoDB vs PostgreSQL JSONB**:

| | MongoDB | PostgreSQL JSONB |
|--|---------|-----------------|
| Native document | ✓ | ✓ (JSONB column) |
| Schema flexibility | Cao | Cao |
| ACID transaction | Limited (multi-doc 4.0+) | Full ACID |
| JOIN | Limited (`$lookup`) | Full JOIN |
| Index JSON field | ✓ | ✓ |
| Vector search | ✓ (Atlas) | ✓ (pgvector) |
| Full-text search | ✓ | ✓ |
| Mature | Lâu năm | Lâu năm |

→ Năm 2026, **PostgreSQL JSONB** thay được MongoDB cho 90% case. Lợi:

- 1 DB cho relational + document.
- Transaction full.
- Ecosystem lớn hơn.

MongoDB còn dùng khi:

- Document **rất phức tạp** nested deep.
- Geo/text search natively cần.
- Team đã rất quen MongoDB.

:::

---

## Key-Value (Redis, DynamoDB)

**Get/Set theo key** — đơn giản, fast.

:::tip[Ví dụ đời thường]

**Tủ gửi đồ ở siêu thị**. Bạn đưa túi, nhận về số **17**; lúc quay lại chìa số 17 là lấy đúng túi, nhanh gần như tức thì vì nhân viên chẳng cần biết trong túi có gì.

Cái giá cũng nằm ở đó: không ai trả lời được câu **"túi nào có bánh mì?"** — muốn biết phải mở hết mọi ngăn. Nên key-value chỉ hợp khi bạn **luôn biết trước cái chìa**: session id, user id, khoá cache.

:::

**Redis**:

```ts
await redis.set("session:abc", JSON.stringify(data));
const data = await redis.get("session:abc");
```

**DynamoDB**:

```ts
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

await client.send(new PutItemCommand({
  TableName: "users",
  Item: {
    id: { S: "user-1" },
    name: { S: "An" },
  },
}));
```

**Phổ biến**:

- **Redis** — in-memory, cache + queue.
- **DynamoDB** (AWS) — managed NoSQL.
- **etcd**, **Consul** — config/service discovery.
- **Memcached** — cache only.
- **Cloudflare KV**, **Vercel KV** — edge.

**Phù hợp**:

- Cache.
- Session store.
- Rate limiting.
- Real-time leaderboard.
- Simple key-based lookup.

---

## Wide-Column (Cassandra)

**Hybrid** key-value + column family.

:::tip[Ví dụ đời thường]

Một **chuỗi kho hàng trải khắp các tỉnh**, không có kho tổng. Hàng về tỉnh nào nhập thẳng kho tỉnh đó nên nhập bao nhiêu cũng kịp (write-heavy), thiếu chỗ thì mở thêm kho — sức chứa tăng đều theo số kho. Một kho cháy, các kho khác vẫn chạy.

Cái giá: **cách xếp hàng trong kho phải chốt từ đầu theo kiểu bạn sẽ đi tìm**. Đã xếp theo mã đơn thì sau này muốn tìm theo tên khách là bó tay — không có ai đi lục tung mọi kho giúp bạn như bên SQL.

:::

```sql
-- Cassandra CQL
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  created_at TIMESTAMP
);

INSERT INTO users (id, name, email, created_at)
VALUES (uuid(), 'An', 'an@example.com', toTimestamp(now()));

SELECT * FROM users WHERE id = ?;
```

**Đặc điểm**:

- **Linear scale** — add node, throughput tăng.
- **No single point of failure**.
- **Tunable consistency**.
- **Limited query** — phải design theo access pattern.

**Phổ biến**:

- **Cassandra** — open source, distributed.
- **ScyllaDB** — Cassandra-compat C++, nhanh hơn 5-10x.
- **BigTable** (Google) — original inspiration.

**Phù hợp**:

- Write-heavy time-series (sensor, log).
- Need scale to PB-level.
- Geo-distributed.

**Không phù hợp**:

- Complex query, ad-hoc analytics.
- ACID transaction.

---

## Graph DB (Neo4j)

**Lưu node + edge** — chuyên cho relationship.

:::tip[Ví dụ đời thường]

Bảng SQL giống **danh sách lớp**: mỗi dòng một người. Muốn biết "bạn của bạn của An là ai" thì phải dò danh sách chồng lên nhau nhiều lượt — thêm một tầng quan hệ là thêm một lượt dò, càng sâu càng ì.

Graph DB giống **cây phả hệ vẽ trên giấy**: mỗi người là một ô, mỗi quan hệ là một sợi dây nối sẵn. Tìm bạn-của-bạn chỉ là **lần theo dây**, đi mấy tầng cũng nhanh như nhau. Đổi lại, mấy việc tầm thường như "đếm tổng số người, cộng doanh thu tháng" thì tờ phả hệ lại dở hơn bảng thường.

:::

```cypher
// Neo4j Cypher
CREATE (an:Person {name: 'An', age: 25})
CREATE (binh:Person {name: 'Binh', age: 30})
CREATE (an)-[:FRIEND_OF {since: 2020}]->(binh)

// Query — friends of friends
MATCH (an:Person {name: 'An'})-[:FRIEND_OF*1..2]-(friend)
RETURN DISTINCT friend.name;
```

**Phù hợp**:

- **Social network** — friend, follower, like.
- **Recommendation** — "users who bought X also bought Y".
- **Fraud detection** — pattern detection trong network.
- **Knowledge graph**.
- **Network/topology** modeling.

**Phổ biến**:

- **Neo4j** — phổ biến nhất.
- **AWS Neptune** — managed AWS.
- **Dgraph** — Go, distributed.
- **TigerGraph** — performance focus.
- **Apache AGE** — Graph extension cho Postgres.

Phân tích graph trong **Postgres** vẫn được nhờ recursive CTE — nhưng
Graph DB tối ưu hơn cho deep traversal.

---

## Time Series DB

**Optimize cho time-series** — append-heavy, query theo time range.

:::tip[Ví dụ đời thường]

**Sổ ghi công tơ điện**: mỗi giờ ghi thêm một dòng xuống cuối, không bao giờ quay lại sửa dòng cũ. Câu hỏi cũng luôn cùng một dạng — "tuần trước trung bình mỗi ngày hết bao nhiêu số điện?".

Vì biết trước thói quen đó, time-series DB **đóng sổ theo từng khoảng thời gian rồi cất riêng**: hỏi tuần trước thì chỉ lôi đúng mấy quyển của tuần đó ra, khỏi lật cả kho 5 năm. Cái giá: nó dở tệ với việc sửa/xoá dữ liệu cũ — vốn là chuyện gần như không xảy ra với loại dữ liệu này.

:::

**Use case**:

- IoT sensor data.
- Metrics (Prometheus).
- Stock price.
- Application monitoring.

```sql
-- TimescaleDB (Postgres extension)
CREATE TABLE metrics (
  time TIMESTAMP NOT NULL,
  sensor_id INTEGER,
  value DOUBLE PRECISION
);

SELECT create_hypertable('metrics', 'time');

-- Optimized for time range
SELECT time_bucket('5 minutes', time) AS bucket,
       avg(value)
FROM metrics
WHERE time > NOW() - INTERVAL '1 day'
GROUP BY bucket
ORDER BY bucket;
```

**Phổ biến**:

- **TimescaleDB** — Postgres extension, recommended.
- **InfluxDB** — purpose-built.
- **Prometheus** — metric specific (pull-based).
- **VictoriaMetrics** — Prometheus-compat, faster.
- **ClickHouse** — analytics + time series.

:::tip[Mẹo]

**ClickHouse** — column-store, **fast analytics**:

```sql
-- ClickHouse — billion row scan trong giây
SELECT user_id, count(*)
FROM events
WHERE event_time > today() - 7
GROUP BY user_id
ORDER BY count(*) DESC
LIMIT 100;
```

Use case:

- OLAP analytics dashboard.
- Log search.
- Real-time analytics.

10-100x faster than Postgres cho aggregation lớn. Trade-off: không phù
hợp OLTP (high write, point query).

:::

---

## Khi nào dùng NoSQL?

```
Use case → DB

Cache, session                          → Redis
Document phức tạp                       → MongoDB / Postgres JSONB
Time-series                             → TimescaleDB / InfluxDB
Real-time analytics                     → ClickHouse
Social graph                            → Neo4j / Postgres + recursion
Massive scale write                     → Cassandra / ScyllaDB
Vector search                           → pgvector / Pinecone
Simple key-value at scale               → DynamoDB
Edge / serverless KV                    → Vercel KV / Cloudflare KV
```

:::info[Phân tích]

**Polyglot persistence** — dùng multiple DB cho từng case:

```
[App]
├─ PostgreSQL — user, order, transaction (ACID)
├─ Redis — cache, session, rate limit
├─ Elasticsearch — search
├─ ClickHouse — analytics dashboard
├─ S3 — file storage
└─ Pinecone — vector embedding (AI)
```

Mỗi DB optimize cho task của nó.

Trade-off:

- **Sync complexity** — data trong nhiều DB.
- **Operational cost** — maintain N system.
- **Eventual consistency** challenges.

→ **Start với 1 DB (Postgres)**, add NoSQL khi có **measurable bottleneck**.

PostgreSQL hiện đại + extension (pgvector, TimescaleDB, pg_trgm) cover
80% case mà không cần thêm DB.

:::

:::warning[Cần lưu ý]

**Đừng chọn NoSQL vì hype**:

- "Mongo scale better" — Postgres scale tốt hơn cho đa số case.
- "Schema-less faster dev" — Postgres JSONB cũng schema-less.
- "Document fit our data" — JOIN với relational cũng OK.

Hỏi:

1. **Vấn đề thật sự gặp** với SQL là gì?
2. NoSQL **giải quyết được** vấn đề đó?
3. Trade-off (transaction, JOIN, ecosystem) chấp nhận được?

90% startup default **PostgreSQL**. NoSQL khi data nature thực sự fit:

- Massive event log → time-series DB.
- Embedding vector → vector DB.
- Cache session → Redis.

Không "Mongo cho mọi thứ" hoặc "DynamoDB vì AWS".

:::

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi đối chiếu lại với nội dung phía trên.

1. NoSQL là gì và khác relational database ở những điểm nào? Kể tên 5 nhóm chính (document, key-value, wide-column, graph, time-series) kèm bài toán tiêu biểu của từng nhóm.
2. Vì sao NoSQL scale `horizontal` dễ hơn SQL? Cái giá phải trả về `JOIN`, transaction và tính nhất quán là gì?
3. Giải thích `CAP theorem`. Vì sao MongoDB thường được xếp là `CP` còn Cassandra là `AP`? Khi mạng bị chia cắt (`network partition`), mỗi hệ hy sinh điều gì?
4. Phân biệt `strong consistency` và `eventual consistency`. Cho một nghiệp vụ chấp nhận được eventual và một nghiệp vụ tuyệt đối không.
5. `BASE` khác `ACID` ở đâu? MongoDB hỗ trợ transaction tới mức nào và có nên dựa vào nó cho luồng thanh toán không?
6. Khi nào bạn chọn MongoDB thay vì `PostgreSQL JSONB`, và ngược lại? Postgres `JSONB` còn thiếu gì so với MongoDB?
7. Trong document DB, khi nào nên `embed` dữ liệu con và khi nào nên `reference`? Giới hạn kích thước document ảnh hưởng thế nào tới quyết định này?
8. `sharding` là gì? Chọn `shard key` sai gây `hotspot` như thế nào, và làm sao tránh (`high cardinality`, `hashed key`, `compound key`)?
9. "Thiết kế bảng Cassandra theo `access pattern`" nghĩa là gì? Chuyện gì xảy ra khi sau 6 tháng nghiệp vụ cần query theo một cột không nằm trong `primary key`?
10. Phân biệt `partition key` và `clustering key` trong Cassandra. `tunable consistency` (`ONE`, `QUORUM`, `ALL`) hoạt động ra sao và ảnh hưởng gì tới latency?
11. Redis dùng làm cache, session, `rate limit` — bạn xử lý `cache invalidation` và `TTL` thế nào? Redis restart mất dữ liệu thì hệ thống ra sao? Phân biệt `RDB` và `AOF`.
12. Redis chạy single-thread mà vẫn rất nhanh — vì sao? Một lệnh chậm như `KEYS *` gây hậu quả gì trên production, thay bằng gì?
13. Khi nào graph DB (Neo4j) thắng hẳn SQL? Vì sao truy vấn "bạn của bạn của bạn" trên bảng quan hệ lại đắt, và `recursive CTE` trong Postgres giải quyết được tới đâu?
14. Time-series DB tối ưu những gì mà Postgres thường không có sẵn? So sánh `TimescaleDB`, `InfluxDB`, `Prometheus` và `ClickHouse` — mỗi cái hợp việc gì?
15. Vì sao `ClickHouse` quét hàng tỷ dòng nhanh hơn Postgres cho aggregation, nhưng lại không hợp OLTP? Giải thích theo kiến trúc `column-store`.
16. `polyglot persistence` mang lại lợi gì và tạo ra chi phí vận hành nào? Bạn đồng bộ dữ liệu giữa các DB bằng cách nào (`dual write`, `CDC`, `outbox pattern`) và mỗi cách rủi ro gì?
17. Một team muốn bỏ Postgres chuyển sang MongoDB vì "Mongo scale tốt hơn". Bạn sẽ hỏi lại và đo đạc những gì trước khi đồng ý?
