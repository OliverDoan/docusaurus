---
sidebar_position: 1
title: "1. Scaling: Replication, Sharding, CAP Theorem"
---

# Scaling: Replication, Sharding, CAP Theorem

Khi số lượng người dùng tăng lên, một database duy nhất sẽ không "gánh" nổi nữa, và đây là lúc bạn cần tới các kỹ thuật mở rộng (scaling). Bài này giải thích những cách phổ biến để database chạy mạnh hơn: nâng cấp máy (vertical), chia tải ra nhiều máy (horizontal), nhân bản dữ liệu để đọc (replication), chia nhỏ dữ liệu (sharding) và lý thuyết CAP nói về sự đánh đổi trong hệ phân tán. Hiểu những khái niệm này giúp bạn biết khi nào nên scale và tránh làm phức tạp hệ thống quá sớm.

[![Sơ đồ tóm tắt bài: Scaling: Replication, Sharding, CAP Theorem](/img/backend/scaling-databases.webp)](pathname:///img/backend/scaling-databases.webp)

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
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

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

:::tip[Ví dụ đời thường]

Quán của bạn đông khách, hàng chờ tính tiền dài ra:

- **Vertical (scale up)** — **thuê một thu ngân giỏi hơn**, tay nhanh gấp đôi. Không phải sắp xếp lại gì, mọi hoá đơn vẫn qua đúng một người nên không bao giờ lộn. Nhưng người nhanh nhất chợ cũng có giới hạn, lương thì tăng theo cấp số nhân, và hôm nào người đó ốm là quán đứng hình.
- **Horizontal (scale out)** — **mở thêm quầy thu ngân**. Muốn tăng bao nhiêu quầy cũng được, một quầy hỏng vẫn còn quầy khác. Đổi lại bạn phải có người điều phối dòng khách, và những việc cần "gộp cả quán lại" như kiểm quỹ cuối ngày trở nên rắc rối hơn nhiều.

:::

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

:::tip[Ví dụ đời thường]

Nghĩ tới **một cuốn sổ gốc và mấy bản photo**. Mọi thay đổi chỉ được ghi vào **sổ gốc** (master), rồi đem đi photo thành nhiều bản (replica) đặt ở các quầy cho khách tra cứu. Quầy nào cũng tra được, nên cả nghìn người hỏi cùng lúc thì sổ gốc vẫn rảnh tay để ghi.

Cái giá: **bản photo luôn chậm hơn bản gốc một nhịp**. Bạn vừa sửa số điện thoại trong sổ gốc, chạy ra quầy tra ngay thì vẫn thấy số cũ (`replication lag`). Vì vậy việc gì vừa ghi xong mà cần đọc lại cho chính xác thì phải quay về đọc sổ gốc.

:::

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

:::tip[Ví dụ đời thường]

Một thư viện quá đông, một thủ thư không kham nổi. Bạn tách thành **4 phòng riêng**: họ A–D vào phòng 1, E–K phòng 2... Mỗi phòng có thủ thư riêng, kho riêng. Muốn tìm hồ sơ của ai, cứ nhìn họ là biết đi phòng nào (`shard key`) — không phòng nào phải gánh cả thư viện.

Cái giá đắt hơn bạn tưởng:

- Câu hỏi kiểu **"cả thư viện có bao nhiêu người tên An?"** phải chạy đủ 4 phòng rồi cộng tay lại (cross-shard query).
- **Chuyển một cuốn từ phòng 1 sang phòng 3 mà tuyệt đối không được lệch** gần như không làm gọn được (cross-shard transaction).
- Mở thêm phòng thứ 5 nghĩa là **khuân lại hồ sơ giữa các phòng**.

:::

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

:::tip[Ví dụ đời thường]

Một ngân hàng có **hai chi nhánh**, sổ sách phải khớp nhau. Bão làm **đứt đường truyền** giữa hai nơi — chuyện chắc chắn có ngày xảy ra, nên không thể không chọn `P`. Khách tới rút tiền ở chi nhánh B, nhân viên chỉ còn hai đường:

- **Từ chối phục vụ** tới khi nối lại được đường truyền — sổ sách không bao giờ sai, nhưng khách ra về tay không (chọn `C`, hy sinh `A`).
- **Cứ cho rút** rồi đối chiếu sau — khách luôn được phục vụ, nhưng có nguy cơ hai chi nhánh cùng chi một khoản (chọn `A`, hy sinh `C`).

Không có đường thứ ba. Ngân hàng thường chọn vế trên, mạng xã hội chọn vế dưới — thà hiện thiếu vài lượt like còn hơn báo lỗi.

:::

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

:::tip[Ví dụ đời thường]

Sếp ngày nào cũng hỏi "tháng này mỗi khách mua bao nhiêu tiền?". Bạn có thể **lôi cả thùng hoá đơn ra cộng lại mỗi lần bị hỏi** (query nặng, chờ vài giây), hoặc **cuối mỗi ca ngồi tổng kết một lần vào bảng treo tường** — sau đó ai hỏi cũng chỉ liếc bảng là xong.

`Materialized view` chính là cái bảng treo tường đó. Cái giá: **bảng luôn cũ hơn thực tế** tới lần tổng kết gần nhất, nên nó hợp với dashboard/báo cáo, không hợp với số dư tài khoản.

:::

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

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi đối chiếu lại với nội dung phía trên.

1. So sánh `vertical scaling` và `horizontal scaling` cho database. Vì sao trong thực tế thường nên scale up trước rồi mới scale out?
2. Trước khi đụng tới hạ tầng, bạn tối ưu những gì ở tầng ứng dụng và query? Nói về index, `EXPLAIN ANALYZE`, vấn đề N+1 và `connection pooling`.
3. `Read replication` hoạt động ra sao? Phân biệt physical/streaming replication với logical replication và trường hợp dùng của mỗi loại.
4. So sánh `synchronous` và `asynchronous replication` về độ trễ write, nguy cơ mất dữ liệu khi master chết, và throughput.
5. `Replication lag` là gì, sinh ra từ đâu, và bạn đo nó bằng cách nào trong production?
6. Người dùng vừa cập nhật hồ sơ, load lại trang thì thấy dữ liệu cũ. Nguyên nhân là gì và có những cách khắc phục nào (`read your own write`, đọc từ master, chờ `LSN`)?
7. Khi master chết, quy trình `failover` diễn ra thế nào? `split-brain` là gì và bạn phòng tránh bằng cơ chế nào?
8. `Master-master` (multi-master) replication gặp vấn đề gì? Nêu các chiến lược giải quyết xung đột `last-write-wins`, `vector clock`, `CRDT` và điểm yếu của từng cái.
9. Phân biệt `replication`, `partitioning` và `sharding`. Postgres table partitioning khác sharding ở chỗ nào?
10. `Sharding` là gì? Bạn chọn `shard key` dựa trên tiêu chí gì, và một shard key tồi gây hậu quả ra sao (`hotspot`, dữ liệu lệch)?
11. So sánh các chiến lược chia shard theo `hash`, theo `range` và theo `geo`/tenant. Ưu nhược điểm và trường hợp dùng của từng cách?
12. Vì sao `cross-shard query` và `cross-shard transaction` lại khó đến vậy? Bạn xử lý một truy vấn cần dữ liệu từ nhiều shard bằng cách nào?
13. Khi thêm shard mới, dữ liệu phải phân bố lại. Giải thích `consistent hashing` giúp giảm số key phải di chuyển như thế nào.
14. Mô tả các bước `resharding` một hệ thống đang chạy mà không downtime.
15. Phát biểu `CAP theorem`. Vì sao trong hệ phân tán thực tế luôn buộc phải chọn `P`, khiến bài toán rút về trade-off giữa `C` và `A`?
16. Cho một ví dụ hệ thống nên chọn `CP` và một ví dụ nên chọn `AP`. Giải thích lý do nghiệp vụ đằng sau mỗi lựa chọn.
17. `PACELC` bổ sung gì so với `CAP`? Vì sao ngay cả khi không có partition thì vẫn phải chọn giữa latency và consistency?
18. Phân biệt `strong consistency`, `eventual consistency` và `read-your-writes consistency`. Cho ví dụ tính năng phù hợp với từng mức.
19. `Materialized view` khác `view` thường ra sao? Khi nào nên dùng, và bạn chọn chiến lược refresh nào (`REFRESH CONCURRENTLY`, incremental, theo lịch)?
20. Cache (Redis) và read replica đều giúp giảm tải đọc — khác nhau ở đâu? Bạn xử lý `cache invalidation` như thế nào để tránh dữ liệu cũ?
21. Phác lộ trình scale database theo từng giai đoạn tăng trưởng, từ một instance duy nhất đến khi buộc phải sharding. Ở mỗi bước, tín hiệu nào cho biết đã đến lúc chuyển sang bước tiếp theo?
22. Chi phí thật của việc scale là gì (tiền hạ tầng, độ phức tạp vận hành, nhân lực)? Bạn dùng lập luận và số liệu nào để thuyết phục team KHÔNG sharding quá sớm?
