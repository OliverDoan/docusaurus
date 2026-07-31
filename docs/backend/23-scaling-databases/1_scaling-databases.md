---
sidebar_position: 1
title: "1. Scaling: Replication, Sharding, CAP Theorem"
---

# Scaling: Replication, Sharding, CAP Theorem

Khi số lượng người dùng tăng lên, một database duy nhất sẽ không "gánh" nổi nữa, và đây là lúc bạn cần tới các kỹ thuật mở rộng (scaling). Bài này giải thích những cách phổ biến để database chạy mạnh hơn: nâng cấp máy (vertical), chia tải ra nhiều máy (horizontal), nhân bản dữ liệu để đọc (replication), chia nhỏ dữ liệu (sharding) và lý thuyết CAP nói về sự đánh đổi trong hệ phân tán. Hiểu những khái niệm này giúp bạn biết khi nào nên scale và tránh làm phức tạp hệ thống quá sớm.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Scale up (vertical, máy mạnh hơn) trước** — Postgres hiện đại gánh vài TB + hàng triệu user trên 1 instance; chỉ scale out khi đã max hoặc cần HA.
- **Read Replication** (master-replica) cho read-heavy, nhưng có `replication lag` → eventual consistency (fix bằng "read your own write").
- **Sharding** chia data theo shard key; phức tạp (cross-shard query/transaction rất khó), đa số app KHÔNG cần — phân biệt với `partitioning` của Postgres.
- **`CAP Theorem`** — hệ phân tán chỉ chọn 2/3; thực tế luôn phải chọn P nên trade-off C vs A khi có partition (`PACELC` chi tiết hơn).
- ⭐ **Đừng pre-optimize** — scale theo stage growth; `Materialized View` pre-compute query nặng cho dashboard.

:::

---

## Mục lục

- [Vertical vs Horizontal scaling](#vertical-vs-horizontal-scaling)
- [Read Replication](#read-replication)
- [Sharding](#sharding)
- [CAP Theorem](#cap-theorem)
- [Materialized Views](#materialized-views)
- [Pattern thực tế](#pattern-thực-tế)

---

## Vertical vs Horizontal scaling

**Vertical (scale up)** — máy mạnh hơn:

- 4GB RAM → 64GB RAM.
- 4 core → 32 core.
- SSD → NVMe.

**Ưu**:

- Đơn giản — không cần distributed.
- ACID transaction OK.

**Nhược**:

- Giới hạn hardware.
- Đắt (linear → exponential).
- Single point of failure.

**Horizontal (scale out)** — nhiều máy:

- 1 server → 10 server.
- Distributed system phức tạp.

**Ưu**:

- Scale gần unlimited.
- Cost-effective ở scale lớn.
- High availability.

**Nhược**:

- Phức tạp (consistency, networking).
- Some operation impossible (cross-shard transaction).

:::tip[Mẹo]

**Quy tắc thực tế**:

- **Scale up** trước (cheap, simple).
- Modern Postgres handle **vài TB + hàng triệu user** trên 1 instance mạnh.
- **Scale out** khi vertical đã max hoặc cần HA.

Đừng shard sớm — Instagram chạy 1 PostgreSQL đến nhiều triệu user trước
khi shard.

:::

---

## Read Replication

**Master-Replica** — 1 write, nhiều read replica.

```
[App write] → [Master DB]
                  ↓ (replicate WAL/binlog)
              [Replica 1] ← [App read]
              [Replica 2] ← [App read]
              [Replica 3] ← [App read]
```

**Phù hợp**:

- Read-heavy (>80% read).
- Acceptable replication lag (vài ms - vài giây).

**Code**:

```ts
// Primary cho write
const writeDB = new Client({ url: process.env.PRIMARY_DB });

// Replica cho read
const readDB = new Client({ url: process.env.REPLICA_DB });

// Service layer
async function createUser(data) {
  return writeDB.user.create({ data });
}

async function getUsers() {
  return readDB.user.findMany();  // OK với eventual consistency
}
```

:::warning[Cần lưu ý]

**Replication lag** — read replica thấy data **sau** master.

```ts
// Write user
const user = await writeDB.user.create({ data });

// Read ngay lập tức
const found = await readDB.user.findUnique({ where: { id: user.id } });
// Có thể null! Replica chưa replicate kịp.
```

Pattern fix:

- **Read your own write** — sau write, đọc từ master cho session đó.
- **Sync replication** (chậm hơn) — chờ replica ack.
- **Wait for LSN** — Postgres `pg_wait_for_lsn` đợi replica catch up.

Đa số app **chấp nhận lag** vài giây cho list/dashboard — chỉ critical
path đọc master.

:::

**Master-Master** — phức tạp hơn, có conflict resolution:

- **Last-write-wins**.
- **Vector clock**.
- **CRDT** (Conflict-free Replicated Data Type).

Hiếm dùng — đa số case master-replica đủ.

---

## Sharding

**Horizontal partition** — chia data theo key, mỗi shard 1 server riêng.

```
[Shard 1] users with id % 4 == 0
[Shard 2] users with id % 4 == 1
[Shard 3] users with id % 4 == 2
[Shard 4] users with id % 4 == 3
```

**Shard key strategies**:

- **Hash** — id hash → shard. Even distribution.
- **Range** — date range, alphabetical. Có thể skew.
- **Geo** — user theo region.
- **Customer** — multi-tenant SaaS, shard per tenant.

**Routing**:

```ts
function getShardForUser(userId: number) {
  return userId % 4; // hash-based
}

async function getUser(userId: number) {
  const shard = getShardForUser(userId);
  return shards[shard].user.findUnique({ where: { id: userId } });
}
```

**Pros**:

- Scale gần unlimited.
- Fault isolation per shard.

**Cons**:

- **Cross-shard query** rất khó.
- **Transaction cross-shard** không có.
- **Rebalance** khi thêm shard tốn công.
- **Operational complexity** lớn.

:::info[Phân tích]

**Khi nào sharding?**

- Single Postgres > 2-5TB data.
- Write throughput > vertical limit.
- Geographic distribution needed.

**Đa số app KHÔNG cần sharding**:

- Modern hardware 1 Postgres handle 10+ TB.
- Read replica xử lý read scale.
- Partitioning (built-in Postgres) cho large table.

**Postgres partitioning** ≠ sharding:

```sql
CREATE TABLE events (
  id BIGSERIAL,
  created_at TIMESTAMP,
  data JSONB
) PARTITION BY RANGE (created_at);

CREATE TABLE events_2026_01 PARTITION OF events
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

Partition = 1 server, multiple table. Sharding = nhiều server.

**Modern sharding solution**:

- **Citus** — Postgres extension.
- **PlanetScale** (MySQL/Vitess) — managed sharding.
- **CockroachDB** — distributed SQL.
- **Yugabyte** — Postgres-compatible distributed.

Đáng cân nhắc khi data thật sự > hundreds of GB / billion row.

:::

---

## CAP Theorem

**Theorem**: distributed system chỉ chọn được **2 trong 3**:

- **Consistency** — mọi node thấy same data.
- **Availability** — mọi request có response.
- **Partition tolerance** — system work dù network partition.

```
       C
      / \
     /   \
    /     \
   A───────P
```

Trong thực tế:

- **Network partition luôn có thể xảy ra** → phải chọn P.
- → Trade-off **C vs A** khi partition.

**Categories**:

- **CP** — sacrifice availability cho consistency.
  - MongoDB (strict), HBase, Redis Cluster.
- **AP** — sacrifice consistency cho availability.
  - Cassandra, DynamoDB (default), CouchDB.
- **CA** — chỉ tồn tại single node, không phải distributed.

:::info[Phân tích]

**PACELC** — extension chi tiết hơn:

- Khi **Partition** → chọn A hay C.
- **Else** (không partition) → chọn Latency hay Consistency.

Database categorize:

| DB | P state | Else state |
|----|---------|-----------|
| **Postgres** (single) | N/A | Consistency |
| **MongoDB** | C | C (default) |
| **Cassandra** | A | L (low latency) |
| **DynamoDB** | A | L |
| **CockroachDB** | C | C |

**Realistic**:

- App banking — **CP** (consistency trên hết).
- App social — **AP** (vẫn show post dù lag).
- App ecom checkout — **CP** (không over-sell).
- App ecom view product — **AP** (cache stale OK).

Chọn DB + tune theo case sử dụng, không 1 size fits all.

:::

---

## Materialized Views

**Pre-compute** query phức tạp, store như table.

```sql
-- Tạo materialized view
CREATE MATERIALIZED VIEW user_order_stats AS
SELECT
  u.id,
  u.name,
  COUNT(o.id) AS order_count,
  SUM(o.total) AS total_spent,
  MAX(o.created_at) AS last_order_at
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name;

-- Query — instant (đã tính sẵn)
SELECT * FROM user_order_stats WHERE total_spent > 1000;

-- Refresh
REFRESH MATERIALIZED VIEW CONCURRENTLY user_order_stats;
```

Phù hợp:

- Dashboard heavy aggregation.
- Report query > 1s.
- Read-heavy + acceptable stale data.

**Refresh strategy**:

- Schedule (cron mỗi 5 min).
- Trigger after update.
- Incremental (chỉ Postgres 17+).

---

## Pattern thực tế

**Stage scale theo growth**:

```
Stage 1: 0-10k users
├─ Single Postgres trên 1 VPS.
├─ Index đúng + query optimization.
└─ Daily backup.

Stage 2: 10k-100k users
├─ Move to managed (Neon/RDS).
├─ Read replica (1-2).
├─ Redis cache layer.
└─ Monitor slow query.

Stage 3: 100k-1M users
├─ Multi read replica.
├─ Materialized view cho dashboard.
├─ Partition large table (events, logs).
├─ Connection pooler (PgBouncer).
└─ Query review weekly.

Stage 4: 1M+ users
├─ Cân nhắc Citus / Vitess / CockroachDB.
├─ Microservice + DB per service.
├─ Event sourcing cho audit.
└─ Multi-region read replica.
```

:::tip[Mẹo]

**Đừng pre-optimize**:

- Stage 1 → giải bug + ship feature.
- Stage 2 → đo bottleneck, fix.
- Stage 3 → architect cho scale.
- Stage 4 → distributed system chuyên.

Skip stage = over-engineer hoặc rewrite. Take steps systematically.

:::

:::warning[Cần lưu ý]

**Cost của scaling**:

- 1 Postgres instance: $50-500/month.
- 3 read replica: 4x cost.
- Sharded cluster (Citus 4 shard): 4x + ops.
- Multi-region: 2-5x cost network.

Scale đáng giá khi:

- Revenue tăng theo user → ROI rõ.
- Compliance/SLA strict.

Không đáng:

- "Sẽ scale to 1M user" → chưa có data.
- Engineering ego.

Profile + measure trước khi scale.

:::
