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
- **Wait for LSN** — so `pg_current_wal_lsn()` trên primary với `pg_last_wal_replay_lsn()` trên replica, chờ tới khi replica bắt kịp.

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

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. So sánh `vertical scaling` và `horizontal scaling` cho database. Vì sao trong thực tế thường nên scale up trước rồi mới scale out?**

<details className="qa">
<summary>Xem đáp án</summary>

Giống chuyện quán đông khách: **scale up** là thuê một thu ngân giỏi hơn, **scale out** là mở thêm quầy.

| | Vertical (scale up) | Horizontal (scale out) |
| --- | --- | --- |
| Cách làm | Máy mạnh hơn: RAM, core, NVMe | Thêm máy: replica, shard |
| Độ phức tạp | Thấp — vẫn một node, ACID nguyên vẹn | Cao — đồng bộ, mạng, nhất quán |
| Giới hạn | Trần phần cứng, giá tăng theo cấp số nhân | Gần như không giới hạn |
| Khả dụng | Single point of failure | High availability |
| Hạn chế | Không có | Một số thao tác bất khả thi (transaction xuyên shard) |

Nên scale up trước vì: rẻ hơn và nhanh hơn nhiều (đổi instance size là xong, thường chỉ mất một lần restart), giữ nguyên mọi đảm bảo ACID và mô hình code không phải sửa, và trần của phần cứng hiện đại rất cao — **Postgres trên một instance mạnh gánh được vài TB dữ liệu và hàng triệu user**. Instagram chạy một PostgreSQL tới nhiều triệu user trước khi shard. Chỉ scale out khi đã chạm trần vertical hoặc khi cần high availability.

</details>

**2. Trước khi đụng tới hạ tầng, bạn tối ưu những gì ở tầng ứng dụng và query? Nói về index, `EXPLAIN ANALYZE`, vấn đề N+1 và `connection pooling`.**

<details className="qa">
<summary>Xem đáp án</summary>

Phần lớn "database chậm" thực ra là code chậm, và sửa ở đây rẻ hơn mọi khoản đầu tư hạ tầng:

- **Index** — thiếu index khiến truy vấn phải quét toàn bảng. Đánh index theo cột nằm trong `WHERE`, `JOIN`, `ORDER BY`; ưu tiên composite index đúng thứ tự cột, và covering index để đọc thẳng từ index. Đổi lại index làm chậm write và tốn dung lượng, nên cũng phải **xóa index không ai dùng**.
- **`EXPLAIN ANALYZE`** — luôn đo trước khi đoán. Cần nhìn: có `Seq Scan` trên bảng lớn không, số dòng ước lượng có lệch xa số dòng thực tế không (thống kê cũ), kiểu join có hợp lý không, và bước nào chiếm phần lớn thời gian.
- **N+1** — lấy danh sách 100 đơn rồi lặp để lấy khách hàng từng đơn là 101 truy vấn. Sửa bằng join, `IN (...)`, hoặc cơ chế eager loading của ORM. Đây là thủ phạm số một trong app dùng ORM.
- **Connection pooling** — mỗi kết nối Postgres là một process riêng, tốn bộ nhớ; mở kết nối mới cho mỗi request sẽ giết DB. Dùng pool ở tầng app, và **PgBouncer** khi có nhiều instance app (nhất là môi trường serverless).

Thêm nữa: phân trang bằng cursor thay vì `OFFSET` lớn, tránh `SELECT *`, và bật theo dõi slow query.

</details>

**3. `Read replication` hoạt động ra sao? Phân biệt physical/streaming replication với logical replication và trường hợp dùng của mỗi loại.**

<details className="qa">
<summary>Xem đáp án</summary>

Ý tưởng: **một cuốn sổ gốc và mấy bản photo**. Mọi write chỉ vào master, master gửi log thay đổi (WAL trong Postgres, binlog trong MySQL) sang các replica, replica áp dụng lại để giữ bản sao. App đọc từ replica, nhờ vậy master rảnh tay để ghi.

| | Physical / streaming | Logical |
| --- | --- | --- |
| Đơn vị sao chép | WAL ở mức byte/block đĩa | Thay đổi ở mức hàng (insert/update/delete) |
| Phạm vi | Toàn bộ cluster, y hệt bản gốc | Chọn từng database, từng bảng |
| Replica | Read-only, cùng version major, cùng kiến trúc | Ghi được, có thể khác version, khác schema |
| Overhead | Thấp nhất | Cao hơn (phải decode) |

**Dùng physical khi**: cần read replica để chia tải đọc, cần standby cho failover, cần backup nóng. Đây là lựa chọn mặc định.

**Dùng logical khi**: nâng cấp major version không downtime, migrate sang hạ tầng khác, chỉ đồng bộ vài bảng sang hệ thống khác (data warehouse, search index), hoặc làm nền cho CDC. Hạn chế đáng nhớ: logical replication không tự sao chép thay đổi schema (`DDL`), và bảng cần có khóa chính hoặc replica identity.

</details>

**4. So sánh `synchronous` và `asynchronous replication` về độ trễ write, nguy cơ mất dữ liệu khi master chết, và throughput.**

<details className="qa">
<summary>Xem đáp án</summary>

| | Asynchronous | Synchronous |
| --- | --- | --- |
| Master commit khi | Đã ghi WAL của chính nó | Đã ghi WAL **và** replica xác nhận |
| Độ trễ write | Thấp, không phụ thuộc mạng | Cộng thêm ít nhất một vòng round-trip |
| Mất dữ liệu khi master chết | Có — phần chưa kịp gửi đi sẽ mất | Không mất phần đã commit |
| Throughput | Cao | Thấp hơn, giảm mạnh nếu replica ở xa |
| Rủi ro khác | Replica tụt hậu âm thầm | Replica chậm/chết có thể **chặn cả write** của master |

Async là mặc định của hầu hết hệ thống vì nhanh và cách ly lỗi tốt; đổi lại có `replication lag` và cửa sổ mất dữ liệu (RPO lớn hơn 0).

Sync phù hợp với dữ liệu tài chính, nơi mất một giao dịch là không chấp nhận được. Lưu ý vận hành: chỉ bật sync với replica **cùng vùng, mạng nhanh**, và luôn cấu hình **ít nhất hai replica đồng bộ** để một replica chết không làm treo toàn bộ write. Postgres còn cho chọn mức trung gian (chỉ cần replica nhận được WAL thay vì phải apply xong), đổi một chút an toàn lấy nhiều độ trễ.

Cách thực dụng: để mặc định async, và chỉ dùng sync cho những cụm dữ liệu thật sự quan trọng.

</details>

**5. `Replication lag` là gì, sinh ra từ đâu, và bạn đo nó bằng cách nào trong production?**

<details className="qa">
<summary>Xem đáp án</summary>

`Replication lag` là **khoảng chênh giữa dữ liệu trên master và trên replica** — bản photo luôn chậm hơn bản gốc một nhịp. Thường vài mili giây tới vài giây, nhưng có thể vọt lên hàng phút khi hệ thống quá tải.

Nguyên nhân phổ biến:

- **Write burst** trên master — replica áp dụng WAL không kịp.
- **Replica áp dụng WAL đơn luồng** trong khi master ghi song song nhiều tiến trình.
- Replica bị **truy vấn nặng chiếm tài nguyên**, hoặc I/O yếu hơn master.
- **Mạng chậm**, nhất là replica đặt khác vùng địa lý.
- Transaction rất dài trên master, hoặc xung đột giữa việc apply WAL và query đang chạy trên replica.

Đo trong production:

- Trên master: xem `pg_stat_replication` — các cột `write_lag`, `flush_lag`, `replay_lag` cho biết độ trễ theo thời gian; chênh lệch LSN cho biết độ trễ theo khối lượng byte.
- Trên replica: `now() - pg_last_xact_replay_timestamp()` là cách đo trực quan nhất.
- Chủ động hơn: ghi một bản ghi heartbeat kèm timestamp vào master mỗi giây rồi đọc lại từ replica, lấy hiệu số.

Nên **cảnh báo theo ngưỡng** (ví dụ vượt vài giây) và vẽ biểu đồ theo thời gian, vì lag thường tăng dần trước khi thành sự cố.

</details>

**6. Người dùng vừa cập nhật hồ sơ, load lại trang thì thấy dữ liệu cũ. Nguyên nhân là gì và có những cách khắc phục nào (`read your own write`, đọc từ master, chờ `LSN`)?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên nhân: write đi vào master, nhưng request đọc ngay sau đó lại rơi vào **replica chưa kịp nhận thay đổi** — đúng kiểu vừa sửa số điện thoại trong sổ gốc, chạy ra quầy tra ngay thì vẫn thấy số cũ.

```ts
const user = await writeDB.user.create({ data });
const found = await readDB.user.findUnique({ where: { id: user.id } });
// Có thể null! Replica chưa replicate kịp.
```

Các cách khắc phục, từ đơn giản tới chặt chẽ:

- **Read your own write** — sau khi user ghi, **đánh dấu session đó đọc từ master** trong một khoảng ngắn (vài giây). Đơn giản, hiệu quả, chỉ ảnh hưởng đúng người vừa ghi.
- **Ghim các đường dẫn nhạy cảm vào master** — trang hồ sơ, giỏ hàng, checkout luôn đọc master; danh sách và dashboard cứ để replica.
- **Chờ theo LSN** — sau khi commit, lấy vị trí WAL hiện tại của master (`pg_current_wal_lsn()`), gửi kèm theo request; phía đọc so với `pg_last_wal_replay_lsn()` của replica, chưa đuổi kịp thì đợi hoặc chuyển sang master. Chính xác nhất nhưng tốn công triển khai.
- **Replication đồng bộ** cho những bảng quan trọng — hết lag nhưng write chậm đi.
- **Cách rẻ nhất ở tầng UI** — dùng luôn dữ liệu trả về từ lệnh ghi để hiển thị, không fetch lại.

Đa số app chấp nhận lag vài giây cho danh sách và dashboard, chỉ xử lý riêng cho critical path.

</details>

**7. Khi master chết, quy trình `failover` diễn ra thế nào? `split-brain` là gì và bạn phòng tránh bằng cơ chế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Quy trình failover:

1. **Phát hiện** — health check liên tục; master không phản hồi quá ngưỡng thì coi là chết. Đặt ngưỡng quá nhạy sẽ gây failover oan khi mạng chớp nháy.
2. **Chọn master mới** — thường là replica **ít lag nhất** (LSN cao nhất) để mất dữ liệu ít nhất.
3. **Promote** — thăng cấp replica đó thành master, cho phép ghi.
4. **Trỏ lại** — cập nhật DNS, virtual IP, hoặc cấu hình proxy để app ghi vào master mới; các replica còn lại được trỏ theo master mới.
5. **Cô lập master cũ** và về sau đưa nó trở lại cluster dưới vai trò replica.

**Split-brain** là tình trạng **hai node cùng tin mình là master** — thường xảy ra khi master cũ chỉ bị mất mạng chứ chưa chết. Cả hai cùng nhận write, dữ liệu phân nhánh, và hợp nhất lại về sau gần như bất khả thi.

Phòng tránh:

- **Quorum** — chỉ phe nắm đa số node mới được promote, nên phe thiểu số tự động dừng.
- **Fencing / STONITH** — chủ động cắt master cũ (tắt máy, chặn firewall, thu hồi virtual IP) trước khi promote node mới.
- **Một điểm ghi duy nhất** — mọi kết nối qua proxy hoặc virtual IP, để chuyển hướng là tuyệt đối.
- Dùng công cụ đã được kiểm chứng (Patroni, repmgr) hoặc **managed service** thay vì tự viết script failover.

</details>

**8. `Master-master` (multi-master) replication gặp vấn đề gì? Nêu các chiến lược giải quyết xung đột `last-write-wins`, `vector clock`, `CRDT` và điểm yếu của từng cái.**

<details className="qa">
<summary>Xem đáp án</summary>

Vấn đề cốt lõi: khi **nhiều node cùng nhận write**, hai người có thể sửa cùng một bản ghi ở hai nơi trong cùng khoảnh khắc. Không còn thứ tự toàn cục để phân xử, nên phải có cơ chế giải quyết xung đột. Kèm theo đó là: khóa chính tự tăng bị đụng nhau, ràng buộc unique không thể đảm bảo xuyên node, và độ phức tạp vận hành tăng vọt.

| Chiến lược | Cách làm | Điểm yếu |
| --- | --- | --- |
| `Last-write-wins` | So timestamp, bản mới hơn thắng | **Âm thầm mất dữ liệu**; phụ thuộc đồng hồ các máy, lệch giờ là sai kết quả |
| `Vector clock` | Theo dõi quan hệ nhân quả giữa các phiên bản | Chỉ *phát hiện* xung đột chứ không giải quyết — cuối cùng vẫn phải đẩy cho ứng dụng hoặc người dùng chọn; metadata phình theo số node |
| `CRDT` | Cấu trúc dữ liệu có phép merge giao hoán, tự hội tụ | Chỉ áp dụng được cho một số kiểu dữ liệu (counter, set, text); tốn bộ nhớ vì tombstone; không diễn đạt được ràng buộc kiểu "số dư không được âm" |

Vì vậy master-master **hiếm khi cần**: master-replica đủ cho đa số trường hợp. Chỉ cân nhắc khi thật sự cần ghi ở nhiều vùng địa lý với độ trễ thấp, hoặc ứng dụng cần hoạt động offline. Ngay cả khi đó, lựa chọn thực dụng hơn thường là **chia dữ liệu theo vùng** để mỗi bản ghi chỉ có một nơi được ghi.

</details>

**9. Phân biệt `replication`, `partitioning` và `sharding`. Postgres table partitioning khác sharding ở chỗ nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `Replication` | `Partitioning` | `Sharding` |
| --- | --- | --- | --- |
| Làm gì | **Nhân bản** toàn bộ dữ liệu ra nhiều nơi | **Chia một bảng** thành nhiều bảng con | **Chia dữ liệu** ra nhiều server |
| Phạm vi | Nhiều server, dữ liệu giống nhau | Một server, nhiều bảng | Nhiều server, dữ liệu khác nhau |
| Giải quyết | Scale đọc, high availability | Bảng quá lớn, dọn dữ liệu cũ | Scale ghi, vượt trần dung lượng |

Điểm mấu chốt: **partitioning = một server, nhiều bảng; sharding = nhiều server**.

Postgres partitioning là tính năng có sẵn, chia theo `RANGE`, `LIST` hoặc `HASH`:

```sql
CREATE TABLE events (
  id BIGSERIAL, created_at TIMESTAMP, data JSONB
) PARTITION BY RANGE (created_at);

CREATE TABLE events_2026_01 PARTITION OF events
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

Ứng dụng **không cần biết gì** — vẫn truy vấn bảng `events`, planner tự loại bỏ những partition không liên quan (partition pruning). Lợi ích lớn nhất là bảo trì: xóa dữ liệu một tháng cũ chỉ cần `DROP TABLE` partition đó, thay vì `DELETE` hàng chục triệu dòng.

Sharding thì ngược lại: ứng dụng (hoặc một lớp routing) **phải biết dữ liệu nằm ở server nào**, và mất đi transaction cùng join xuyên shard.

</details>

**10. `Sharding` là gì? Bạn chọn `shard key` dựa trên tiêu chí gì, và một shard key tồi gây hậu quả ra sao (`hotspot`, dữ liệu lệch)?**

<details className="qa">
<summary>Xem đáp án</summary>

`Sharding` là chia dữ liệu ra nhiều server độc lập theo một **shard key**, mỗi shard giữ một phần. Giống thư viện tách thành 4 phòng theo họ tên: nhìn họ là biết đi phòng nào, không phòng nào phải gánh cả thư viện.

Tiêu chí chọn shard key:

- **Phân bố đều** — tránh việc một shard ôm phần lớn dữ liệu hoặc lưu lượng.
- **Cardinality cao** — đủ nhiều giá trị khác nhau để chia mịn.
- **Khớp với cách truy vấn** — hầu hết query nên xác định được shard từ key, tránh phải hỏi tất cả các shard.
- **Gom được dữ liệu liên quan** vào cùng shard, để transaction và join vẫn nằm trong một nơi.
- **Ổn định** — giá trị không đổi theo thời gian, vì đổi shard key nghĩa là di chuyển bản ghi.

Shard key tồi gây:

- **Hotspot** — chọn timestamp làm key thì mọi write mới đều đổ vào một shard; chọn `country` thì shard của thị trường lớn nhất quá tải trong khi các shard khác nhàn rỗi.
- **Dữ liệu lệch** — một tenant khổng lồ làm một shard phình gấp nhiều lần, mất luôn ý nghĩa của việc chia.
- **Fan-out mọi truy vấn** — key không khớp với query pattern thì mọi truy vấn đều phải hỏi hết các shard, chậm hơn cả khi chưa shard.

Và sửa sai rất đắt: đổi shard key thường đồng nghĩa với migrate lại toàn bộ dữ liệu.

</details>

**11. So sánh các chiến lược chia shard theo `hash`, theo `range` và theo `geo`/tenant. Ưu nhược điểm và trường hợp dùng của từng cách?**

<details className="qa">
<summary>Xem đáp án</summary>

| Chiến lược | Ưu | Nhược | Hợp với |
| --- | --- | --- | --- |
| **Hash** | Phân bố rất đều, khó tạo hotspot | Mất tính cục bộ — truy vấn theo khoảng phải hỏi mọi shard; thêm shard là rebalance | Tra cứu theo id là chính (hồ sơ user, session) |
| **Range** | Truy vấn theo khoảng rất hiệu quả; dọn dữ liệu cũ dễ | Dễ hotspot: dữ liệu mới nhất luôn dồn vào shard cuối | Dữ liệu chuỗi thời gian, log, event |
| **Geo** | Độ trễ thấp cho người dùng gần; hỗ trợ yêu cầu lưu trú dữ liệu theo quốc gia | Lệch nặng theo thị trường; người dùng di chuyển thì rắc rối | App đa vùng, có ràng buộc pháp lý về dữ liệu |
| **Tenant** | Cách ly tốt, một khách hàng có sự cố không lây; dễ backup/khôi phục riêng | Tenant khổng lồ làm lệch shard; nhiều tenant nhỏ thì tốn tài nguyên | SaaS B2B |

Trong thực tế hay dùng **kết hợp**: shard theo tenant nhưng những tenant lớn nhất được tách riêng; hoặc range theo tháng rồi hash bên trong để tránh dồn vào một chỗ. Nguyên tắc chung: chọn chiến lược theo **cách truy vấn chiếm đa số lưu lượng**, đừng chọn theo cái nào nghe gọn nhất.

</details>

**12. Vì sao `cross-shard query` và `cross-shard transaction` lại khó đến vậy? Bạn xử lý một truy vấn cần dữ liệu từ nhiều shard bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì mỗi shard là **một database độc lập**: không biết gì về nhau, không có planner chung, không có transaction chung.

- **Cross-shard query** — câu hỏi kiểu "cả thư viện có bao nhiêu người tên An?" phải chạy đủ 4 phòng rồi cộng tay lại. Join giữa các shard buộc phải kéo dữ liệu qua mạng; `ORDER BY` kèm `LIMIT` phải lấy dư từ mọi shard rồi trộn lại; độ trễ bằng shard **chậm nhất**, và một shard chết là cả truy vấn hỏng.
- **Cross-shard transaction** — chuyển một cuốn từ phòng 1 sang phòng 3 mà tuyệt đối không được lệch. Muốn nguyên tử thì cần **two-phase commit**, mà 2PC thì chậm, giữ khóa lâu, và treo cả hai bên nếu coordinator chết.

Cách xử lý thực tế:

- **Thiết kế để né** — chọn shard key sao cho dữ liệu hay đi cùng nhau nằm chung shard; đây là giải pháp tốt nhất.
- **Scatter-gather** — gửi song song tới mọi shard rồi gộp ở tầng ứng dụng, kèm timeout và giới hạn số shard bị hỏi.
- **Bảng tra cứu toàn cục** hoặc **nhân bản bảng nhỏ ít thay đổi** (danh mục, cấu hình) sang mọi shard để join cục bộ.
- **Denormalize** dữ liệu cần đọc chung vào cùng shard.
- **Tách đường đọc phân tích** sang data warehouse hoặc search index thay vì query thẳng các shard.
- Với ghi xuyên shard: dùng **saga + compensating action + idempotency** thay cho 2PC, chấp nhận eventual consistency.

</details>

**13. Khi thêm shard mới, dữ liệu phải phân bố lại. Giải thích `consistent hashing` giúp giảm số key phải di chuyển như thế nào.**

<details className="qa">
<summary>Xem đáp án</summary>

Với cách chia đơn giản `hash(key) % N`, đổi `N` là **gần như mọi key đổi shard**. Từ 4 lên 5 shard thì khoảng 80% dữ liệu phải di chuyển — nghĩa là migrate khổng lồ, và trong lúc đó hệ thống gần như tê liệt.

**Consistent hashing** đặt cả không gian hash lên **một vòng tròn**. Mỗi node được hash vào một (hoặc nhiều) vị trí trên vòng; mỗi key cũng hash lên vòng và **thuộc về node đầu tiên gặp khi đi theo chiều kim đồng hồ**.

Khi thêm một node, node đó chỉ nhận phần key nằm giữa nó và node liền trước — **chỉ khoảng 1/N tổng số key phải di chuyển**, và chỉ một node hàng xóm bị ảnh hưởng, các node còn lại không đụng gì. Khi một node biến mất cũng vậy: phần của nó chuyển sang node kế tiếp.

**Virtual node** là bổ sung quan trọng: thay vì đặt mỗi node một điểm, đặt hàng trăm điểm ảo rải đều quanh vòng. Nhờ đó tải phân bố đều hơn, tránh việc một node vô tình chiếm một cung quá lớn, và cho phép gán trọng số cho máy mạnh yếu khác nhau.

Đây là nền tảng của Cassandra, DynamoDB và cách phân phối key của Redis Cluster (Redis dùng 16384 hash slot, cùng tinh thần "chỉ di chuyển phần cần thiết").

</details>

**14. Mô tả các bước `resharding` một hệ thống đang chạy mà không downtime.**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc: **không bao giờ cắt chuyển một phát**, mà chạy song song rồi dịch chuyển dần, luôn giữ đường lùi.

1. **Chuẩn bị** — dựng shard mới, đóng băng thay đổi schema, đảm bảo mọi truy cập dữ liệu đều đi qua **một lớp routing duy nhất** (nếu chưa có thì làm việc này trước).
2. **Copy nền** — sao chép dữ liệu của những range/key sắp chuyển sang shard mới, trong lúc hệ thống vẫn chạy bình thường.
3. **Đồng bộ liên tục** — bật CDC hoặc logical replication để mọi thay đổi mới tiếp tục chảy sang shard đích, cho tới khi độ trễ gần bằng không.
4. **Ghi kép (dual-write)** — ứng dụng ghi vào cả shard cũ lẫn mới, nhưng vẫn đọc từ shard cũ. Chạy job **đối soát** để chắc chắn hai bên khớp nhau.
5. **Chuyển đọc dần** — cho một phần nhỏ lưu lượng đọc sang shard mới, theo dõi lỗi và độ trễ, rồi tăng dần tới 100%.
6. **Chuyển ghi** — khóa ghi trong **một khoảng rất ngắn** cho đúng phần key đang chuyển (không khóa toàn hệ thống), đợi đồng bộ xong, rồi lật routing sang shard mới.
7. **Dọn dẹp** — tắt dual-write, giữ dữ liệu cũ thêm một thời gian để có đường lùi, sau đó mới xóa.

Hai điều quyết định thành bại: mọi thao tác ghi phải **idempotent** để việc phát lại không sinh sai lệch, và phải **lật ngược được ở mọi bước**. Dùng consistent hashing ngay từ đầu sẽ giảm đáng kể khối lượng phải di chuyển.

</details>

**15. Phát biểu `CAP theorem`. Vì sao trong hệ phân tán thực tế luôn buộc phải chọn `P`, khiến bài toán rút về trade-off giữa `C` và `A`?**

<details className="qa">
<summary>Xem đáp án</summary>

`CAP theorem` nói rằng một hệ phân tán chỉ đảm bảo được **2 trong 3**:

- **Consistency** — mọi node thấy cùng một dữ liệu.
- **Availability** — mọi request đều có response.
- **Partition tolerance** — hệ thống vẫn hoạt động dù mạng giữa các node bị chia cắt.

Vì sao buộc chọn `P`: **network partition không phải lựa chọn, nó là sự thật sẽ xảy ra** — đứt cáp, switch hỏng, mất gói, một vùng cloud gián đoạn. Bạn không "chọn" có partition hay không; bạn chỉ chọn phản ứng thế nào khi nó xảy ra. Bỏ `P` đồng nghĩa với việc hệ thống hỏng ngay khi mạng có vấn đề, tức là không dùng được.

Vì vậy bài toán rút về: **khi partition xảy ra, chọn `C` hay `A`?** Như ngân hàng hai chi nhánh mất liên lạc — hoặc từ chối phục vụ để sổ sách không bao giờ sai (`CP`), hoặc cứ cho rút rồi đối chiếu sau (`AP`). Không có đường thứ ba.

Nhóm **CA** chỉ tồn tại trên hệ một node (Postgres đơn lẻ), tức là không phải hệ phân tán. Cũng nên nhớ CAP chỉ mô tả hành vi **trong lúc có partition**; lúc bình thường thì `PACELC` mới là mô hình đầy đủ hơn.

</details>

**16. Cho một ví dụ hệ thống nên chọn `CP` và một ví dụ nên chọn `AP`. Giải thích lý do nghiệp vụ đằng sau mỗi lựa chọn.**

<details className="qa">
<summary>Xem đáp án</summary>

**Chọn `CP` — chuyển khoản ngân hàng.** Khi mạng giữa các node đứt, thà **từ chối giao dịch** còn hơn cho phép cùng một khoản tiền bị rút hai lần ở hai nơi. Người dùng thấy "hệ thống đang bảo trì" thì bực nhưng chấp nhận được; sai số dư thì mất tiền thật, mất uy tín và có thể vi phạm quy định. Tương tự: đặt vé số ghế có hạn, checkout thương mại điện tử (không được bán vượt tồn kho), cấp phát khóa phân tán.

**Chọn `AP` — bảng tin mạng xã hội.** Hiển thị thiếu vài lượt like hay một bài đăng chậm vài giây **không gây thiệt hại gì**; báo lỗi mới là điều người dùng không tha thứ. Tương tự: trang chi tiết sản phẩm (cache cũ vẫn ổn), số lượt xem, thông báo, hệ thống ghi log.

Điều đáng nói trong phỏng vấn: **lựa chọn nằm ở mức tính năng, không phải mức toàn hệ thống**. Cùng một sàn thương mại điện tử, trang xem sản phẩm nên `AP` (ưu tiên luôn hiển thị được), còn bước trừ tồn kho lúc checkout phải `CP`. Vì vậy câu trả lời tốt là "tùy luồng nghiệp vụ", kèm giải thích hậu quả khi dữ liệu sai so với hậu quả khi từ chối phục vụ.

</details>

**17. `PACELC` bổ sung gì so với `CAP`? Vì sao ngay cả khi không có partition thì vẫn phải chọn giữa latency và consistency?**

<details className="qa">
<summary>Xem đáp án</summary>

`CAP` chỉ mô tả hành vi **trong lúc có partition** — mà partition là trạng thái hiếm. `PACELC` bổ sung phần còn thiếu: **nếu Partition thì chọn A hay C; Else (lúc bình thường) thì chọn L (latency) hay C**.

Vì sao lúc bình thường vẫn phải chọn: muốn mọi node thấy cùng một dữ liệu thì mỗi lần ghi phải **chờ các bản sao xác nhận** — ít nhất một round-trip mạng, và nhiều hơn nếu bản sao ở khác vùng. Đó là chi phí vật lý không thể tránh: dữ liệu không đi nhanh hơn ánh sáng. Chấp nhận trả lời ngay bằng bản sao gần nhất thì nhanh, nhưng có thể là dữ liệu cũ.

Phân loại theo bài học:

| DB | Khi partition | Lúc bình thường |
| --- | --- | --- |
| Postgres (single) | Không áp dụng | Consistency |
| MongoDB | C | C |
| Cassandra | A | L |
| DynamoDB | A | L |
| CockroachDB | C | C |

PACELC hữu ích vì nó mô tả đúng cái bạn **cảm nhận hằng ngày**: hệ thống chọn C thì write chậm hơn suốt cả năm, chứ không chỉ trong vài phút mạng có sự cố.

</details>

**18. Phân biệt `strong consistency`, `eventual consistency` và `read-your-writes consistency`. Cho ví dụ tính năng phù hợp với từng mức.**

<details className="qa">
<summary>Xem đáp án</summary>

| Mức | Đảm bảo | Cái giá |
| --- | --- | --- |
| **Strong** | Đọc xong write nào thì luôn thấy write đó, bất kể đọc ở đâu | Chậm nhất; khi partition có thể phải từ chối phục vụ |
| **Eventual** | Nếu ngừng ghi, sau một khoảng thời gian mọi bản sao sẽ hội tụ | Trong khoảng đó, các nơi có thể thấy dữ liệu khác nhau |
| **Read-your-writes** | Người vừa ghi luôn thấy thay đổi của **chính mình**; người khác có thể thấy trễ | Rẻ hơn strong nhiều, cần bám theo session |

Ví dụ tính năng:

- **Strong** — số dư tài khoản, trừ tồn kho lúc checkout, giữ chỗ ghế ngồi, cấp phát mã duy nhất. Sai một lần là thiệt hại thật.
- **Eventual** — số lượt xem, bảng xếp hạng, gợi ý sản phẩm, dashboard phân tích, kết quả tìm kiếm. Trễ vài giây không ai nhận ra.
- **Read-your-writes** — sửa hồ sơ cá nhân, đăng bình luận, upload ảnh đại diện. Người khác thấy chậm một nhịp thì không sao, nhưng **chính người vừa sửa mà thấy dữ liệu cũ thì họ tưởng hệ thống hỏng**.

Kinh nghiệm thực tế: mức thứ ba giải quyết được phần lớn khiếu nại của người dùng với chi phí thấp — chỉ cần cho session vừa ghi đọc từ master trong vài giây.

</details>

**19. `Materialized view` khác `view` thường ra sao? Khi nào nên dùng, và bạn chọn chiến lược refresh nào (`REFRESH CONCURRENTLY`, incremental, theo lịch)?**

<details className="qa">
<summary>Xem đáp án</summary>

**View thường** chỉ là câu truy vấn được đặt tên — mỗi lần gọi là **chạy lại toàn bộ**, dữ liệu luôn mới nhưng chậm y như query gốc. **Materialized view** thì **lưu sẵn kết quả xuống đĩa** như một bảng thật, đọc cực nhanh nhưng dữ liệu chỉ mới tới lần refresh gần nhất. Giống cái bảng tổng kết treo tường: liếc một cái là xong, nhưng luôn cũ hơn thực tế một nhịp.

Nên dùng khi: dashboard có aggregation nặng, báo cáo chạy trên một giây, đọc nhiều hơn ghi nhiều lần, và **chấp nhận được dữ liệu cũ vài phút**. Không dùng cho số dư tài khoản hay tồn kho.

Chiến lược refresh:

- **Theo lịch** — cron mỗi vài phút; đơn giản nhất, hợp với báo cáo.
- **`REFRESH MATERIALIZED VIEW CONCURRENTLY`** — refresh mà **không khóa việc đọc**, nên người dùng không bị gián đoạn. Đổi lại chậm hơn và **bắt buộc view phải có unique index**.
- **Incremental** — chỉ tính lại phần thay đổi thay vì toàn bộ, nhanh hơn rất nhiều với bảng lớn.
- **Kích hoạt theo sự kiện** — refresh sau khi một batch dữ liệu được nạp xong, thay vì chạy mù theo giờ.

Với bảng rất lớn, một hướng thay thế đáng cân nhắc là **tự duy trì bảng tổng hợp** bằng job tăng dần — kiểm soát tốt hơn và không phải tính lại từ đầu.

</details>

**20. Cache (Redis) và read replica đều giúp giảm tải đọc — khác nhau ở đâu? Bạn xử lý `cache invalidation` như thế nào để tránh dữ liệu cũ?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Read replica | Cache (Redis) |
| --- | --- | --- |
| Dữ liệu | Bản sao **toàn bộ**, đúng schema, query gì cũng được | Chỉ những gì bạn chủ động đặt vào, theo key |
| Độ mới | Trễ theo replication lag, nhưng **tự đồng bộ** | Cũ cho tới khi bạn xóa hoặc hết TTL — **phải tự quản** |
| Tốc độ | Nhanh như DB | Nhanh hơn nhiều (bộ nhớ, không parse SQL, không join) |
| Chi phí | Tốn như một DB đầy đủ | Rẻ hơn cho cùng lượng request |
| Hợp với | Giảm tải đọc diện rộng, dự phòng failover | Điểm nóng cụ thể: phiên đăng nhập, trang sản phẩm, kết quả tính toán nặng |

Hai thứ **bổ sung cho nhau**, không thay thế nhau: cache chặn phần lớn request ở phía trước, replica gánh phần còn lại.

Xử lý invalidation:

- **TTL** — cách rẻ và an toàn nhất; chọn thời hạn theo mức chịu đựng dữ liệu cũ của từng loại dữ liệu.
- **Xóa khi ghi (write-through hoặc delete-on-write)** — cập nhật DB xong thì **xóa key** thay vì ghi đè, để lần đọc kế tiếp nạp lại bản đúng; ghi đè dễ tạo race giữa hai luồng.
- **Đặt tên key có version** — đổi version là vô hiệu hóa cả nhóm key, tránh phải dò tìm từng key.
- **Chống cache stampede** — khi key nóng hết hạn, hàng nghìn request cùng đâm xuống DB. Chống bằng khóa cho một request đi nạp, thêm jitter vào TTL, hoặc làm mới nền trước khi hết hạn.
- **Vô hiệu hóa theo event** — nghe CDC hoặc domain event để xóa đúng key, thay vì rải lệnh xóa khắp code.

</details>

**21. Phác lộ trình scale database theo từng giai đoạn tăng trưởng, từ một instance duy nhất đến khi buộc phải sharding. Ở mỗi bước, tín hiệu nào cho biết đã đến lúc chuyển sang bước tiếp theo?**

<details className="qa">
<summary>Xem đáp án</summary>

**Giai đoạn 1 (0–10k user)** — một Postgres trên một VPS, index đúng, tối ưu query, backup hằng ngày. *Tín hiệu chuyển bước:* slow query xuất hiện đều đặn, tự vận hành DB bắt đầu tốn thời gian, cần khả năng khôi phục nghiêm túc.

**Giai đoạn 2 (10k–100k)** — chuyển sang managed (Neon, RDS), thêm 1–2 read replica, thêm Redis cache, theo dõi slow query. *Tín hiệu:* CPU master cao chủ yếu do đọc, dashboard ngày càng chậm, số kết nối chạm trần.

**Giai đoạn 3 (100k–1M)** — nhiều read replica, materialized view cho dashboard, partition các bảng lớn (events, logs), PgBouncer, review query hằng tuần. *Tín hiệu:* **write** (không phải read) trở thành nút thắt, bảng lớn tới mức bảo trì và `VACUUM` khó thở, dung lượng tiến tới ngưỡng vài TB.

**Giai đoạn 4 (1M+)** — cân nhắc Citus / Vitess / CockroachDB, tách DB theo service, event sourcing cho audit, read replica đa vùng. *Tín hiệu:* đã chạm trần instance lớn nhất, throughput ghi vượt khả năng một node, hoặc có yêu cầu đa vùng địa lý.

Nguyên tắc xuyên suốt: **đo trước khi sửa**, và **không nhảy cóc giai đoạn** — bỏ qua bước là hoặc over-engineer, hoặc phải viết lại. Mỗi bước chỉ nên bắt đầu khi có số liệu chứng minh bước hiện tại đã hết dư địa.

</details>

**22. Chi phí thật của việc scale là gì (tiền hạ tầng, độ phức tạp vận hành, nhân lực)? Bạn dùng lập luận và số liệu nào để thuyết phục team KHÔNG sharding quá sớm?**

<details className="qa">
<summary>Xem đáp án</summary>

Chi phí thật gồm ba tầng, và tầng tiền bạc là tầng rẻ nhất:

- **Hạ tầng** — thêm 3 read replica là khoảng gấp 4 lần chi phí DB; cụm sharded 4 node cũng gấp 4 lần cộng thêm phần vận hành; multi-region đội thêm 2–5 lần vì băng thông liên vùng.
- **Vận hành** — thêm hệ thống giám sát, quy trình failover, kịch bản khôi phục, migration phức tạp hơn nhiều lần, và on-call nặng hơn.
- **Nhân lực** — đây mới là khoản đắt nhất: mọi tính năng mới đều tốn thời gian hơn vì phải nghĩ về shard key, về cross-shard, về nhất quán. Đó là thuế đánh vào tốc độ phát triển sản phẩm, trả mãi mãi.

Lập luận để hoãn sharding:

- **Đưa ra trần thực tế** — một Postgres hiện đại gánh vài TB và hàng triệu user; Instagram chạy một PostgreSQL tới nhiều triệu user trước khi shard. Vậy chúng ta đang ở đâu so với con số đó?
- **Bắt team nói bằng số liệu** — dung lượng hiện tại và tốc độ tăng, QPS đọc/ghi, mức sử dụng CPU và I/O của master, p95 của những query nặng nhất. Nếu không có những con số này thì chưa đủ cơ sở để shard.
- **Chỉ ra các bước rẻ hơn chưa dùng hết** — index, sửa N+1, connection pooling, cache, read replica, partitioning. Chúng thường mang lại cải thiện lớn hơn sharding với chi phí nhỏ hơn nhiều.
- **Nêu rủi ro một chiều** — shard rồi thì rất khó quay lại, và chọn sai shard key phải migrate toàn bộ.

Câu chốt: "Sẽ scale tới 1 triệu user" không phải dữ liệu, đó là dự đoán. **Profile và đo trước khi scale.**

</details>
