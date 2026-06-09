---
sidebar_position: 1
title: "1. NoSQL: Document, Key-Value, Wide-Column, Graph, Time-Series"
---

# NoSQL: Document, Key-Value, Wide-Column, Graph, Time-Series

NoSQL là nhóm các database không theo kiểu bảng quan hệ (relational) như SQL truyền thống, với schema linh hoạt và khả năng mở rộng theo chiều ngang dễ hơn. Bài này giới thiệu các loại NoSQL phổ biến: document (MongoDB), key-value (Redis, DynamoDB), wide-column (Cassandra), graph (Neo4j) và time-series, kèm theo từng loại phù hợp với bài toán nào. Hiểu các lựa chọn này giúp bạn chọn đúng "công cụ" cho từng nhu cầu thay vì dùng một database cho mọi thứ.

---

## Mục lục

- [NoSQL là gì?](#nosql-là-gì)
- [Document DB (MongoDB)](#document-db-mongodb)
- [Key-Value (Redis, DynamoDB)](#key-value-redis-dynamodb)
- [Wide-Column (Cassandra)](#wide-column-cassandra)
- [Graph DB (Neo4j)](#graph-db-neo4j)
- [Time Series DB](#time-series-db)
- [Khi nào dùng NoSQL?](#khi-nào-dùng-nosql)

---

## NoSQL là gì?

**NoSQL** = "Not Only SQL" — DB không phải relational.

**Đặc điểm chung**:

- Schema **linh hoạt** (hoặc schemaless).
- Scale **horizontal** dễ hơn.
- Trade **consistency** cho **availability/performance** (đa số).
- **Không JOIN** (hoặc rất hạn chế).

---

## Document DB (MongoDB)

**Lưu document** JSON (BSON) — schemaless.

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
