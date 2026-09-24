---
sidebar_position: 1
title: "1. ACID, Normalization, ORMs, Query Optimization"
---

# ACID, Normalization, ORMs, Query Optimization

Đây là những kiến thức database nâng cao giúp bạn lưu trữ dữ liệu an toàn và truy vấn nhanh. Bài này nói về 4 tính chất ACID đảm bảo transaction đáng tin cậy, cách chuẩn hoá schema để tránh trùng lặp dữ liệu, ORM để map giữa bảng và object trong code, cùng các kỹ thuật tối ưu query, connection pooling và tinh chỉnh database. Hiểu những phần này giúp app của bạn vừa chính xác vừa chạy mượt khi dữ liệu lớn dần.

[![Sơ đồ tóm tắt bài: ACID, Normalization, ORMs, Query Optimization](/img/backend/database-advanced.webp)](pathname:///img/backend/database-advanced.webp)

---

:::note[Ghi nhớ nhanh]

- ⭐ **`ACID`** = Atomicity (all-or-nothing), Consistency, Isolation, Durability — nền tảng transaction đáng tin cậy; Postgres mặc định isolation level `Read Committed`.
- **Normalization** (1NF/2NF/3NF) tránh duplicate data — nên **start normalized, denormalize khi đo performance thực sự cần** (JOIN nhiều gây chậm).
- **`ORM`** map row ↔ object, type-safe + chống SQL injection nhưng dễ dính N+1; `Drizzle` (nhẹ, edge, SQL-like) vs `Prisma` (DX, tooling) là 2 hot nhất Node/TS; vẫn cần raw SQL cho query phức tạp.
- ⭐ **Query optimization** — dùng `EXPLAIN ANALYZE` (Seq Scan → cần index), thêm index cho WHERE/JOIN/ORDER BY, tránh `SELECT *`, dùng cursor pagination, partial index.
- **Connection pooling** — reuse connection thay vì open/close; serverless cần external pooler (`PgBouncer`, Prisma Accelerate) vì mỗi function tạo connection mới; chú ý Postgres default max 100 connection.
- **Database tuning** — chỉnh `shared_buffers`/`work_mem`, VACUUM + ANALYZE, theo dõi slow query qua `pg_stat_statements`; giải quyết bottleneck theo thứ tự index → rewrite → cache → replica → sharding (last resort).

:::

---

## Mục lục

- [ACID Properties](#acid-properties)
- [Normalization](#normalization)
- [ORMs](#orms)
- [Query Optimization](#query-optimization)
- [Connection Pooling](#connection-pooling)
- [Database Tuning](#database-tuning)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## ACID Properties

**4 properties** mọi RDBMS đảm bảo cho transaction:

- **Atomicity** — Tất cả hoặc không. Crash giữa chừng → rollback.
- **Consistency** — DB từ state hợp lệ sang state hợp lệ (constraint check).
- **Isolation** — Concurrent transaction không thấy data nhau (theo isolation level).
- **Durability** — Commit xong = persist (cả khi power off).

:::tip[Ví dụ đời thường]

Hình dung bạn ra ngân hàng chuyển 100k từ tài khoản A sang B — nhân viên phải ghi **2 bút toán**: trừ A, cộng B.

- **Atomicity** — mất điện lúc vừa trừ xong A? Cả hai bút toán bị bỏ, coi như chưa làm gì. Không có chuyện tiền bốc hơi giữa đường.
- **Consistency** — sổ sách sau giao dịch vẫn phải đúng quy định (không tài khoản nào được âm quỹ).
- **Isolation** — cùng lúc đó có người tra số dư của A, họ **không được nhìn thấy trạng thái đang làm dở**.
- **Durability** — khi nhân viên đã đóng dấu "xong", dù cháy máy tính thì cuốn sổ vẫn còn ghi.

Cái giá phải trả: đòi `Isolation` càng chặt thì ngân hàng càng phải bắt người khác **xếp hàng chờ** — nên Postgres mặc định chỉ chọn mức vừa phải (`Read Committed`).

:::

```sql
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  -- Crash ở đây → rollback transaction, balance không trừ
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
```

**Isolation levels** (Postgres default: Read Committed):

| Level | Dirty read | Non-repeatable | Phantom | Performance |
|-------|-----------|----------------|---------|-------------|
| Read Uncommitted | Có | Có | Có | Nhanh nhất |
| **Read Committed** (default) | Không | Có | Có | Nhanh |
| Repeatable Read | Không | Không | Có | Vừa |
| Serializable | Không | Không | Không | Chậm |

```ts
// Set isolation level
await db.$transaction(async (tx) => {
  // ...
}, { isolationLevel: "Serializable" });
```

---

## Normalization

Quy tắc thiết kế schema để **tránh duplicate**, **dễ maintain**.

:::tip[Ví dụ đời thường]

Bạn quản lý bán hàng bằng sổ giấy. Nếu mỗi phiếu đơn hàng bạn **chép luôn tên và địa chỉ khách** vào, thì khách chuyển nhà một cái là bạn phải lục lại **hàng nghìn tờ phiếu** để sửa — sót một tờ là dữ liệu mâu thuẫn ngay.

Chuẩn hoá là: thông tin khách chỉ ghi **một chỗ duy nhất** trong sổ khách hàng, phiếu đơn hàng chỉ ghi **mã khách**. Sửa địa chỉ = sửa đúng một dòng.

Cái giá phải trả: mỗi lần xem phiếu bạn phải **lật thêm sổ khách** để tra tên — đó chính là `JOIN`. Lật càng nhiều sổ thì đọc càng chậm, nên khi cần đọc thật nhanh người ta lại cố tình chép dư một ít (denormalize).

:::

**1NF (First Normal Form)** — atomic value, không array trong cell:

```sql
-- SAI
users (id, name, phones)  -- "0123,0456"

-- ĐÚNG
users (id, name)
phones (id, user_id, number)
```

**2NF** — Mọi non-key column phụ thuộc **toàn primary key** (composite key):

```sql
-- SAI: composite key (order_id, product_id), nhưng product_name chỉ
-- phụ thuộc product_id
order_items (order_id, product_id, qty, product_name)

-- ĐÚNG
order_items (order_id, product_id, qty)
products (id, name)
```

**3NF** — Non-key column **không phụ thuộc** non-key column khác:

```sql
-- SAI: city phụ thuộc zip, không phải user
users (id, name, zip, city)

-- ĐÚNG
users (id, name, zip)
zip_codes (zip, city)
```

**BCNF, 4NF, 5NF** — strict hơn, hiếm cần.

:::info[Phân tích]

**Khi nào denormalize?**

Normalization tốt cho **data integrity**, nhưng:

- Cần **JOIN** nhiều → slow.
- Query phức tạp.

Denormalize = duplicate data cho **read performance**:

```sql
-- Normalized
orders (id, user_id)
order_items (id, order_id, product_id, qty, price_at_time)
products (id, name, current_price)

-- Khi query order detail → 2 JOIN.

-- Denormalize
orders (id, user_id, total, item_count)  -- pre-compute
```

Trade-off: write 2 places (orders + order_items), read 1 query.

Rule: **start normalized**, denormalize khi đo performance cần.

:::

---

## ORMs

**ORM (Object-Relational Mapper)** — map row DB ↔ object code.

:::tip[Ví dụ đời thường]

Bạn nói tiếng Việt, database chỉ nghe tiếng SQL. `ORM` là **người phiên dịch ngồi giữa**: bạn bảo "lấy cho tôi user số 5", nó dịch thành `SELECT ... WHERE id = 5`, rồi dịch ngược kết quả (một dòng trong bảng) thành object trong code.

Phiên dịch giỏi thì rất tiện: câu thường ngày dịch nhanh, lại không sợ bạn nói sai ngữ pháp (chống SQL injection).

Cái giá phải trả: gặp câu **dài dòng nhiều ẩn ý** thì bản dịch hay lủng củng và chạy chậm — lúc đó bạn phải tự nói thẳng bằng SQL. Và vì không nhìn thấy câu gốc, bạn dễ vô tình bắt nó chạy đi chạy lại cả trăm lần (`N+1`).

:::

**Pros**:

- **Type-safe** với TS generation.
- **Migration** sinh tự động.
- **SQL injection** prevention built-in.
- **Cross-DB** portable (mostly).
- **Productivity** cao cho CRUD.

**Cons**:

- **Abstraction leaky** — hiệu suất, query phức tạp.
- **N+1** dễ gặp.
- **Generated SQL** đôi khi không tối ưu.
- **Learning curve** thêm.

**ORM phổ biến**:

| ORM | Lang | Style |
|-----|------|-------|
| **Prisma** | Node/TS | Schema-first, codegen |
| **Drizzle** | Node/TS | SQL-like, type-inferred |
| **TypeORM** | Node/TS | Decorator + DataMapper |
| **Sequelize** | Node | Mature, OOP |
| **Kysely** | Node/TS | Query builder type-safe |
| **SQLAlchemy** | Python | Powerful, complex |
| **Django ORM** | Python | Tied to Django |
| **GORM** | Go | Reflection-based |
| **sqlc** | Go | Code-gen từ SQL |
| **JOOQ** | Java | DSL type-safe |
| **Hibernate** | Java | Enterprise standard |
| **Eloquent** | PHP/Laravel | Active Record |

:::tip[Mẹo]

**Drizzle vs Prisma** (2 hot nhất Node TS 2026):

| | Drizzle | Prisma |
|--|---------|--------|
| Schema | TypeScript | Prisma DSL |
| Bundle | ~50KB | ~5MB (large) |
| Edge support | **Native** | Cần Accelerate |
| Type | **Inferred** | Generated |
| Migration | Manual hoặc auto | Auto |
| SQL feel | **SQL-like** | Abstract |
| Learning | Thấp (giống SQL) | Trung bình |
| Maturity | Newer | Mature |

Drizzle thắng **performance + edge + bundle size**. Prisma thắng **DX,
tooling (Studio)**.

Trend 2026: Drizzle tăng nhanh, đặc biệt cho Next.js Edge / Bun project.

:::

**Raw SQL** vẫn cần khi:

- Performance critical query.
- Complex CTE, window function ORM không support tốt.
- Migration script.

```ts
// Prisma raw
const result = await prisma.$queryRaw`
  SELECT date_trunc('day', created_at) AS day, COUNT(*)
  FROM orders
  WHERE created_at > NOW() - INTERVAL '30 days'
  GROUP BY day
  ORDER BY day
`;

// Drizzle có sql template tag tương tự
import { sql } from "drizzle-orm";

const result = await db.execute(sql`
  SELECT ... complex query ...
`);
```

---

## Query Optimization

**1. EXPLAIN ANALYZE**:

```sql
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'an@example.com';
```

Output:

```
Index Scan using users_email_idx on users  (cost=0.29..8.30 rows=1)
  Index Cond: (email = 'an@example.com'::text)
Planning Time: 0.5 ms
Execution Time: 0.1 ms
```

`Index Scan` = OK. `Seq Scan` (toàn table) → cần index.

:::tip[Ví dụ đời thường]

Query chậm giống đơn hàng ship trễ mà bạn không biết tắc ở chặng nào. `EXPLAIN ANALYZE` chính là tờ **vận đơn ghi rõ từng chặng**: đi đường nào, mất bao lâu, mang bao nhiêu kiện.

Đọc nó bạn thấy ngay shipper đang **dò từng nhà trong phố** (`Seq Scan`) hay **đi thẳng tới đúng số nhà** (`Index Scan`).

Đừng đoán mò rồi thêm index bừa — xem vận đơn trước, rồi sửa đúng chặng đang tắc.

:::

**2. Add index** cho column WHERE, JOIN, ORDER BY:

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at);
```

**3. Avoid SELECT \***:

```sql
-- Tệ
SELECT * FROM users;

-- Tốt
SELECT id, name, email FROM users;
```

Bỏ column không cần → giảm I/O, network, memory.

**4. LIMIT** khi có thể:

```sql
-- Tệ — fetch hết về app rồi slice
SELECT * FROM users;

-- Tốt
SELECT * FROM users LIMIT 100 OFFSET 0;
```

Pagination cursor-based tốt hơn offset cho large dataset:

```sql
-- Cursor (faster cho large offset)
SELECT * FROM users
WHERE id > $last_id
ORDER BY id
LIMIT 20;
```

**5. JOIN order** — DB optimizer thường handle, nhưng có lúc cần hint:

```sql
-- Reorder JOIN nếu cần
SELECT * FROM users u
JOIN orders o ON o.user_id = u.id
WHERE u.created_at > '2024-01-01'
LIMIT 100;
```

**6. Avoid N+1** — eager load related (xem phần Database Concepts).

**7. Partial index** cho condition lọc thường:

```sql
CREATE INDEX idx_orders_pending
ON orders(created_at)
WHERE status = 'pending';
```

Chỉ index row pending → nhỏ + nhanh.

---

## Connection Pooling

DB connection **expensive** — open/close mỗi request = slow + tốn DB.

:::tip[Ví dụ đời thường]

Mở một `connection` mới tới database giống như **gọi taxi mới**: phải chờ xe tới, chào hỏi, kiểm tra giấy tờ rồi mới lăn bánh. Đi có một phút mà thủ tục mất ba mươi giây.

`Connection pool` là **đội taxi đậu sẵn ở bến**: xe nổ máy chờ đó, ai cần thì lên đi ngay, xong việc thì trả xe về bến chứ không cho về gara.

Cái giá phải trả: bến chỉ chứa được số xe nhất định. Nuôi nhiều xe quá thì hết chỗ (Postgres mặc định chỉ nhận khoảng 100 kết nối), nuôi ít quá thì khách phải xếp hàng chờ xe rảnh.

:::

**Pool** = pre-open connection, reuse:

```ts
// Postgres pool
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,            // tối đa 20 connection
  idleTimeoutMillis: 30000,
});

const result = await pool.query("SELECT * FROM users");
```

ORM tự pool:

```ts
// Prisma — auto pool
const prisma = new PrismaClient();
```

**External pooler** cho serverless:

- **PgBouncer** — proxy pool Postgres.
- **Supabase Pooler**.
- **Neon Pooler**.
- **Prisma Accelerate** — managed pool + edge cache.

Tại sao cần external?

- Serverless function **không persist** state → mỗi function tạo connection mới.
- 1000 function × 1 connection = 1000 DB connection → DB overwhelmed.
- PgBouncer giữ pool, function reuse.

:::warning[Cần lưu ý]

**Connection limit** Postgres mặc định 100. Vượt → reject new connection.

Tính toán:

```
DB max_connections = 100
Reserve admin = 5
Available = 95

App: 4 instance × 20 pool = 80 connection.
Worker: 2 × 10 = 20 connection.
Total: 100 → over!
```

→ Adjust pool size hoặc dùng PgBouncer.

Setup pool size:

- **Web app**: ~10-20 connection / instance.
- **Worker**: dựa parallel job.
- **Total < DB max_connections - reserve**.

:::

---

## Database Tuning

**Postgres key params**:

```ini
# postgresql.conf
shared_buffers = 25% RAM       # cache page
effective_cache_size = 75% RAM  # OS cache estimate
work_mem = 4MB                  # per query operation
maintenance_work_mem = 64MB     # VACUUM, CREATE INDEX
max_connections = 200
```

**Vacuum + Analyze** (Postgres):

- **VACUUM** — reclaim dead tuple (Postgres MVCC).
- **ANALYZE** — update statistics cho query planner.
- **VACUUM FULL** — rewrite table, lock (avoid in production).

:::tip[Ví dụ đời thường]

Postgres không xoá dòng cũ ngay khi bạn `UPDATE`/`DELETE` — nó chỉ **dán nhãn "hết hạn"** rồi ghi bản mới ra chỗ khác, để ai đang đọc dở vẫn thấy bản cũ.

Giống kệ siêu thị: hàng hết hạn vẫn nằm đó chiếm chỗ. `VACUUM` là **nhân viên đi dọn kệ**, thu hồi chỗ trống cho hàng mới xếp vào. `ANALYZE` là **kiểm kê lại số lượng**, để quản lý biết mặt hàng nào nhiều mặt hàng nào ít mà bố trí lối đi cho hợp lý (đó là việc của query planner).

Không dọn thì kệ cứ phình to, tìm món gì cũng lâu — dù số hàng thật chẳng hề tăng.

:::

Auto-vacuum mặc định run, nhưng cần tune cho table large.

**Monitor slow query**:

```sql
-- Postgres slow query log
ALTER SYSTEM SET log_min_duration_statement = 500;  -- log > 500ms
SELECT pg_reload_conf();
```

**pg_stat_statements** extension — top slow query aggregate:

```sql
CREATE EXTENSION pg_stat_statements;

SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

:::info[Phân tích]

**Performance tuning workflow**:

1. **Identify slow query** — log, pg_stat_statements, APM.
2. **EXPLAIN ANALYZE** query đó.
3. **Add index** nếu Seq Scan.
4. **Rewrite query** nếu plan tệ.
5. **Denormalize** nếu JOIN nhiều.
6. **Cache** nếu read-heavy.
7. **Read replica** nếu read >> write.
8. **Sharding** nếu data quá lớn (sau cùng).

Cost-benefit:

- **Index**: cheap, fast win.
- **Denormalize**: medium, code complexity.
- **Cache**: medium, invalidation challenge.
- **Replica**: medium-high, infra cost.
- **Sharding**: complex, last resort.

Đa số bottleneck giải quyết được với **index + query rewrite + cache**.
Sharding rất hiếm cần với hardware modern.

:::

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `ACID` gồm những tính chất nào? Giải thích từng tính chất qua ví dụ chuyển tiền giữa hai tài khoản.**

<details className="qa">
<summary>Xem đáp án</summary>

Chuyển 100k từ tài khoản A sang B cần hai bút toán: trừ A, cộng B.

```sql
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
```

- **Atomicity** — tất cả hoặc không. Crash sau khi vừa trừ A, transaction bị rollback, coi như chưa làm gì. Không có chuyện tiền bốc hơi giữa đường.
- **Consistency** — kết thúc transaction, database vẫn ở trạng thái hợp lệ theo mọi constraint (không tài khoản nào âm, khoá ngoại vẫn đúng).
- **Isolation** — người khác tra số dư của A trong lúc đó không được nhìn thấy trạng thái đang làm dở, tuỳ theo isolation level.
- **Durability** — đã `COMMIT` thì dù mất điện ngay sau đó, dữ liệu vẫn còn, nhờ ghi WAL xuống đĩa trước khi báo thành công.

Cái giá: đòi Isolation càng chặt thì càng nhiều giao dịch phải xếp hàng chờ — nên Postgres mặc định chọn mức vừa phải là `Read Committed`.

</details>

**2. Phân biệt `Consistency` trong ACID với `Consistency` trong `CAP theorem` — hai khái niệm này có phải một không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không phải một. Trùng tên nhưng nói về hai chuyện khác hẳn.

| | `Consistency` trong ACID | `Consistency` trong CAP |
|---|---|---|
| Phạm vi | Một database, một transaction | Nhiều node trong hệ phân tán |
| Ý nghĩa | Transaction đưa DB từ trạng thái hợp lệ sang trạng thái hợp lệ, không vi phạm constraint | Mọi node trả về cùng một giá trị mới nhất tại cùng thời điểm |
| Ai đảm bảo | Ràng buộc do bạn khai báo (khoá ngoại, `CHECK`, `UNIQUE`) | Giao thức đồng bộ giữa các bản sao |

Nói cách khác, C trong ACID là **tính đúng đắn theo quy tắc nghiệp vụ**, còn C trong CAP là **tính đồng nhất giữa các bản sao**.

Một hệ có thể ACID-consistent hoàn hảo trên mỗi node mà vẫn không CAP-consistent: read replica trả về dữ liệu cũ do `replication lag` thì mỗi node vẫn hợp lệ về constraint, chỉ là chúng không thấy cùng một thứ. Ngược lại, hệ đồng nhất tuyệt đối giữa các node vẫn có thể chứa dữ liệu sai nghiệp vụ nếu bạn không đặt constraint.

</details>

**3. Kể 4 `isolation level`. Mỗi mức ngăn được anomaly nào (`dirty read`, `non-repeatable read`, `phantom read`)?**

<details className="qa">
<summary>Xem đáp án</summary>

| Level | Dirty read | Non-repeatable read | Phantom read | Performance |
|---|---|---|---|---|
| Read Uncommitted | Có | Có | Có | Nhanh nhất |
| **Read Committed** (mặc định Postgres) | Không | Có | Có | Nhanh |
| Repeatable Read | Không | Không | Có | Vừa |
| Serializable | Không | Không | Không | Chậm |

Ba anomaly:

- **Dirty read** — đọc được dữ liệu của transaction khác **chưa commit**; nếu transaction đó rollback thì bạn vừa đọc phải thứ chưa từng tồn tại.
- **Non-repeatable read** — đọc cùng một dòng hai lần trong cùng transaction lại ra hai giá trị, vì giữa chừng có ai đó commit `UPDATE`.
- **Phantom read** — chạy cùng một truy vấn theo điều kiện hai lần lại ra **số dòng khác nhau**, vì có ai đó chèn thêm dòng khớp điều kiện.

Lưu ý thực tế: Postgres không thực sự có Read Uncommitted (khai báo mức này vẫn chạy như Read Committed), và `Repeatable Read` của Postgres đã chặn luôn phantom nhờ snapshot — nhưng bảng trên vẫn là chuẩn cần nhớ khi trả lời.

</details>

**4. Postgres mặc định chạy `Read Committed`. Khi nào bạn buộc phải nâng lên `Repeatable Read` hoặc `Serializable`, và cái giá phải trả là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`Read Committed` cho phép mỗi câu lệnh nhìn thấy snapshot mới nhất, nên hai lần đọc trong cùng transaction có thể khác nhau. Nâng mức khi điều đó gây sai nghiệp vụ:

- **Repeatable Read** — báo cáo hoặc tính toán đọc nhiều bảng và cần tất cả thuộc về **cùng một thời điểm**; hoặc luồng đọc rồi tính rồi ghi dựa trên giá trị vừa đọc.
- **Serializable** — nghiệp vụ có ràng buộc không thể diễn đạt bằng constraint đơn lẻ: kiểm tra tồn kho rồi trừ, chống đặt trùng chỗ ngồi, chống rút quá số dư khi có nhiều giao dịch song song.

```ts
await db.$transaction(async (tx) => {
  // ...
}, { isolationLevel: "Serializable" });
```

Cái giá:

- Nhiều transaction bị **abort** vì xung đột serialization, nên code **bắt buộc** phải có vòng retry — thiếu nó là lỗi 500 tới tay người dùng.
- Throughput giảm, thời gian giữ snapshot dài hơn khiến vacuum khó dọn dead tuple.

Giải pháp thay thế thường rẻ hơn: khoá tường minh bằng `SELECT ... FOR UPDATE` cho đúng vài dòng cần tranh chấp, thay vì nâng mức cho toàn bộ transaction.

</details>

**5. `deadlock` xảy ra trong tình huống nào? Database phát hiện và xử lý ra sao, còn phía code bạn viết thế nào để giảm khả năng deadlock?**

<details className="qa">
<summary>Xem đáp án</summary>

Deadlock xảy ra khi hai transaction chờ khoá lẫn nhau theo vòng tròn: T1 giữ khoá dòng A và xin dòng B, trong khi T2 giữ B và xin A. Không ai nhường, cả hai chờ vĩnh viễn.

Postgres có bộ dò deadlock chạy định kỳ: phát hiện vòng chờ thì **chọn một transaction làm nạn nhân và abort nó**, transaction còn lại đi tiếp. Ứng dụng nhận lỗi deadlock và phải tự xử lý.

Phía code, giảm khả năng deadlock bằng:

- **Truy cập tài nguyên theo thứ tự nhất quán** — luôn khoá dòng có id nhỏ trước. Đây là biện pháp hiệu quả nhất, và cũng là lý do chuyển tiền hay được viết theo thứ tự id cố định.
- **Giữ transaction ngắn** — không gọi API bên ngoài, không chờ input người dùng khi đang mở transaction.
- **Chỉ khoá đúng phạm vi cần**, tránh khoá cả bảng hay dùng `SELECT FOR UPDATE` trên tập quá rộng.
- **Cập nhật theo lô có sắp xếp** thay vì thứ tự ngẫu nhiên.
- **Retry có backoff** cho lỗi deadlock — đây là lỗi tạm thời, chạy lại thường thành công.

Ngoài ra nên log lại để biết cặp câu lệnh nào hay đụng nhau mà sửa gốc.

</details>

**6. Chuẩn hoá `1NF` → `2NF` → `3NF` khác nhau ở đâu? Cho một bảng đơn hàng chưa chuẩn hoá và tách nó ra từng bước.**

<details className="qa">
<summary>Xem đáp án</summary>

Bảng ban đầu nhét mọi thứ vào một chỗ:

```sql
orders (id, customer_name, customer_zip, customer_city,
        product_ids, product_name, qty)  -- product_ids = "3,7,9"
```

**1NF — mỗi ô một giá trị nguyên tử**, không nhồi mảng vào cell:

```sql
orders (id, customer_name, customer_zip, customer_city)
order_items (order_id, product_id, qty, product_name)
```

**2NF — mọi cột không khoá phải phụ thuộc toàn bộ khoá chính.** `order_items` có khoá kép `(order_id, product_id)` nhưng `product_name` chỉ phụ thuộc `product_id`:

```sql
order_items (order_id, product_id, qty)
products (id, name)
```

**3NF — cột không khoá không được phụ thuộc cột không khoá khác.** Trong `orders`, `customer_city` phụ thuộc `customer_zip` chứ không phụ thuộc đơn hàng:

```sql
orders (id, customer_id)
customers (id, name, zip)
zip_codes (zip, city)
```

Lợi ích: sửa địa chỉ khách chỉ sửa một dòng thay vì lục hàng nghìn phiếu. Cái giá là mỗi lần xem phiếu phải `JOIN` thêm vài bảng. Các dạng chặt hơn (BCNF, 4NF, 5NF) hiếm khi cần trong thực tế.

</details>

**7. Khi nào bạn cố tình `denormalize`? Đánh đổi những gì, và làm sao giữ dữ liệu bị nhân bản không bị lệch?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc: **bắt đầu chuẩn hoá, chỉ denormalize khi đã đo và thấy thực sự cần**. Dấu hiệu đáng cân nhắc: truy vấn nóng phải `JOIN` nhiều bảng lớn, hoặc phải tính tổng/đếm trên hàng triệu dòng mỗi lần đọc trong khi tỉ lệ đọc áp đảo ghi.

```sql
-- Normalized: muốn tổng đơn hàng phải JOIN + SUM mỗi lần
orders (id, user_id)
order_items (id, order_id, product_id, qty, price_at_time)

-- Denormalized: tính sẵn
orders (id, user_id, total, item_count)
```

Đánh đổi: ghi ở hai chỗ, code phức tạp hơn, tốn thêm dung lượng, và rủi ro lớn nhất là **dữ liệu lệch nhau**.

Cách giữ đồng bộ:

- Cập nhật bản sao **trong cùng transaction** với bản gốc, hoặc dùng trigger ở tầng database.
- Coi bản chuẩn hoá là **nguồn sự thật duy nhất**, bản nhân bản chỉ là cache có thể dựng lại.
- Có job đối soát định kỳ, phát hiện lệch thì tính lại.
- Nếu cập nhật bất đồng bộ, chấp nhận rõ ràng khoảng thời gian dữ liệu chưa khớp và ghi vào tài liệu.

Một lưu ý: dữ liệu như `price_at_time` không phải denormalize — đó là ghi lại sự thật lịch sử, khác hẳn về bản chất.

</details>

**8. `index` giúp query nhanh lên bằng cơ chế nào? Vì sao thêm index lại làm chậm `INSERT`/`UPDATE`?**

<details className="qa">
<summary>Xem đáp án</summary>

Index (thường là B-tree) là một cấu trúc dữ liệu **đã sắp xếp** theo giá trị cột, trỏ tới vị trí dòng tương ứng. Nhờ đó database tìm theo kiểu chia đôi thay vì quét toàn bảng — giống tra mục lục sách thay vì lật từng trang. Trong `EXPLAIN ANALYZE`, khác biệt hiện ra ở `Index Scan` thay vì `Seq Scan`.

Index cũng phục vụ `ORDER BY` (dữ liệu đã sẵn thứ tự nên không cần sort) và `JOIN` (tìm nhanh dòng khớp ở bảng kia).

Cái giá khi ghi: mỗi `INSERT` phải chèn thêm một mục vào **từng index** của bảng, giữ cây cân bằng; `UPDATE` cột có index phải xoá mục cũ và thêm mục mới; `DELETE` phải dọn mục tương ứng. Bảng có 8 index thì một lệnh ghi hoá ra là chín lần ghi. Kèm theo đó là tốn dung lượng, tốn bộ nhớ đệm, và vacuum có thêm việc.

Vì vậy: tạo index cho cột xuất hiện trong `WHERE`, `JOIN`, `ORDER BY` của truy vấn thật sự nóng, và định kỳ rà soát để bỏ index không ai dùng.

</details>

**9. Với `composite index (a, b, c)`, một query chỉ lọc theo `b` và `c` mà không có `a` thì có tận dụng được index không? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Về cơ bản là **không** — hoặc chỉ tận dụng rất kém.

Lý do nằm ở cách B-tree sắp xếp: index `(a, b, c)` sắp theo `a` trước, trong mỗi giá trị `a` mới sắp theo `b`, rồi tới `c`. Giống danh bạ sắp theo họ rồi tới tên: biết họ thì tra nhanh, chỉ biết tên thì phải lật cả quyển. Thiếu `a`, các giá trị `b` bạn cần nằm rải rác khắp index nên không thu hẹp được phạm vi.

Đây chính là **quy tắc tiền tố trái**: index dùng được cho `(a)`, `(a, b)`, `(a, b, c)`, nhưng không dùng hiệu quả cho `(b)`, `(c)` hay `(b, c)`.

```sql
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at);
-- Tốt:  WHERE user_id = 1 AND created_at > '2024-01-01'
-- Tốt:  WHERE user_id = 1
-- Kém:  WHERE created_at > '2024-01-01'
```

Ngoại lệ: nếu index nhỏ và chứa đủ cột cần, Postgres có thể chọn quét toàn bộ index thay vì quét bảng — vẫn nhanh hơn `Seq Scan` nhưng kém xa một index đúng thứ tự. Giải pháp đúng là tạo thêm index có tiền tố phù hợp, và sắp cột chọn lọc cao lên trước.

</details>

**10. Đọc output `EXPLAIN ANALYZE`: `Seq Scan`, `Index Scan` và `Bitmap Heap Scan` khác nhau thế nào? `cost` ước lượng và `actual time` nói lên điều gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba kiểu truy cập, tương ứng ba tình huống:

- **`Seq Scan`** — quét tuần tự toàn bảng. Hợp lý khi bảng nhỏ hoặc truy vấn lấy phần lớn số dòng; là dấu hiệu thiếu index khi bảng lớn mà chỉ cần vài dòng.
- **`Index Scan`** — đi thẳng qua index tới đúng dòng cần. Tốt khi số dòng khớp ít.
- **`Bitmap Heap Scan`** — số dòng khớp ở mức trung bình: Postgres quét index dựng bitmap các trang cần đọc, rồi đọc bảng **theo thứ tự trang**. Hiệu quả hơn Index Scan khi phải nhảy ngẫu nhiên quá nhiều lần, và hay xuất hiện khi kết hợp nhiều index.

Về số liệu:

- **`cost`** là **ước lượng** của planner theo đơn vị quy ước, dựa trên statistics. Nó quyết định plan được chọn, không phải mili giây.
- **`actual time`** và **`rows`** là số đo thật của lần chạy đó.

Điều quan trọng nhất khi đọc: so sánh `rows` ước lượng với `rows` thực tế. Lệch nhiều lần nghĩa là statistics đã cũ hoặc phân bố dữ liệu bị lệch — chạy `ANALYZE`. Đừng đoán mò rồi thêm index bừa; xem "vận đơn" trước rồi sửa đúng chặng đang tắc.

</details>

**11. Một query đang nhanh bỗng chậm hẳn trên production. Bạn lần theo trình tự nào để tìm nguyên nhân?**

<details className="qa">
<summary>Xem đáp án</summary>

1. **Khoanh vùng** — chậm một query hay cả hệ thống? Nếu mọi thứ đều chậm thì nghi CPU, I/O, connection pool cạn, hoặc một job nặng đang chạy, chứ không phải bản thân query.
2. **Xác định thủ phạm** — dùng `pg_stat_statements` xem truy vấn nào ngốn tổng thời gian nhiều nhất, kết hợp slow query log và APM.
3. **Chạy `EXPLAIN ANALYZE`** trên chính query đó với tham số thật. So `rows` ước lượng và thực tế.
4. **Đối chiếu plan** — plan có đổi so với trước không? Nguyên nhân phổ biến: dữ liệu tăng làm planner chuyển từ `Index Scan` sang `Seq Scan`, hoặc statistics cũ sau khi nạp lượng lớn dữ liệu (chạy `ANALYZE`).
5. **Kiểm tra sức khoẻ bảng** — bloat do vacuum không kịp, index phình to, dead tuple nhiều.
6. **Kiểm tra tranh chấp** — có lock đang chờ không, có transaction dài treo lâu không.
7. **Xem thay đổi gần đây** — deploy mới, migration mới, index bị xoá, tham số bị chỉnh.

Sửa theo thứ tự chi phí tăng dần: thêm index → viết lại query → cache → read replica → denormalize. Đa số dừng lại ở hai bước đầu.

</details>

**12. `N+1 query` là gì, phát hiện bằng cách nào, và ORM cung cấp cơ chế gì để tránh?**

<details className="qa">
<summary>Xem đáp án</summary>

`N+1` là khi bạn lấy danh sách N bản ghi bằng 1 query, rồi trong vòng lặp lại gọi thêm 1 query cho mỗi bản ghi để lấy dữ liệu liên quan — tổng cộng N+1 lần đi về database. Lấy 100 đơn hàng rồi lặp để lấy tên khách là 101 query, mỗi query chỉ vài mili giây nhưng cộng lại thành gần một giây.

Đây là cái bẫy kinh điển của ORM: vì không nhìn thấy SQL được sinh ra nên bạn dễ vô tình bắt nó chạy đi chạy lại cả trăm lần.

Phát hiện:

- Bật log SQL ở môi trường phát triển và đếm số query cho một request.
- APM hoặc tracing cho thấy hàng loạt query giống hệt nhau, chỉ khác tham số.
- `pg_stat_statements` ghi nhận một query có `calls` cực lớn.

Tránh bằng:

- **Eager loading** — khai báo lấy kèm quan hệ trong cùng một lần truy vấn (`include` của Prisma, `with` của Drizzle, `joinedload` của SQLAlchemy).
- **Gộp theo lô** — lấy tất cả id rồi query một lần bằng `WHERE id IN (...)`, tự ghép ở tầng code (mô hình DataLoader).
- Với báo cáo phức tạp, viết thẳng **raw SQL** một câu thay vì để ORM tự dịch.

</details>

**13. Dùng ORM được lợi gì và mất gì so với viết SQL thẳng? Trường hợp nào bạn bỏ ORM để viết raw SQL?**

<details className="qa">
<summary>Xem đáp án</summary>

ORM là người phiên dịch ngồi giữa code và database: bạn nói "lấy user số 5", nó dịch thành SQL rồi dịch ngược kết quả thành object.

**Được:**

- Type-safe, IDE gợi ý được, sai kiểu là báo lỗi lúc biên dịch.
- Chống SQL injection sẵn nhờ tham số hoá.
- Sinh migration tự động, năng suất cao cho CRUD.
- Khá dễ đổi database (trong giới hạn nhất định).

**Mất:**

- Abstraction bị rò: query phức tạp thì SQL sinh ra lủng củng và chậm.
- Rất dễ dính `N+1` vì không nhìn thấy câu gốc.
- Thêm một lớp phải học và phải debug.

Bỏ ORM viết raw SQL khi: query nằm trên đường nóng cần tối ưu tới từng plan; cần CTE, window function, `LATERAL`, upsert phức tạp mà ORM hỗ trợ kém; viết script migration hoặc báo cáo tổng hợp.

```ts
const result = await prisma.$queryRaw`
  SELECT date_trunc('day', created_at) AS day, COUNT(*)
  FROM orders
  WHERE created_at > NOW() - INTERVAL '30 days'
  GROUP BY day ORDER BY day
`;
```

Thực tế lành mạnh nhất là kết hợp: ORM cho 90% CRUD, raw SQL cho phần còn lại — và luôn truyền tham số, không nối chuỗi.

</details>

**14. `connection pool` giải quyết vấn đề gì? Đặt `pool size` quá lớn thì hỏng chuyện gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Mở connection mới tới Postgres rất tốn: bắt tay TCP, xác thực, và server sinh hẳn một process mới. Đi có một phút mà thủ tục mất ba mươi giây — như gọi taxi mới cho mỗi chuyến. Pool giữ sẵn một đội connection đã mở, request nào cần thì mượn rồi trả về.

```ts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
});
```

Đặt `pool size` quá lớn gây hại thật sự:

- Postgres mặc định chỉ nhận khoảng **100 connection**; vượt ngưỡng là các kết nối mới bị từ chối và cả ứng dụng gãy.
- Mỗi connection tốn bộ nhớ riêng, lại nhân với `work_mem` cho mỗi thao tác query — dễ đẩy database tới chỗ hết RAM.
- Quá nhiều truy vấn chạy đồng thời làm tranh chấp CPU và I/O, tổng throughput **giảm** dù pool to hơn.

Cách tính: cộng pool của mọi instance và worker, phải nhỏ hơn `max_connections` trừ phần dự trữ cho admin. Ví dụ 4 instance × 20 cộng 2 worker × 10 đã là 100 — vượt rồi. Khuyến nghị thực tế khoảng 10-20 connection mỗi instance web, và dùng PgBouncer khi số tiến trình lớn.

</details>

**15. Vì sao môi trường `serverless` cần pooler ngoài như `PgBouncer`? Phân biệt chế độ `session` pooling và `transaction` pooling.**

<details className="qa">
<summary>Xem đáp án</summary>

Serverless function **không giữ trạng thái giữa các lần gọi**, nên pool nằm trong tiến trình gần như vô dụng: mỗi instance được đánh thức lại mở connection mới. Lúc traffic tăng, 1000 function đang chạy đồng thời tạo ra cả nghìn connection và Postgres (mặc định ~100) sập ngay. Pooler ngoài đứng giữa, giữ một pool nhỏ tới database và cho vô số client dùng chung.

| Chế độ | Cách hoạt động | Hệ quả |
|---|---|---|
| `session` | Client giữ nguyên một connection backend suốt phiên | An toàn cho mọi tính năng, nhưng tỉ lệ dồn thấp — ít lợi hơn |
| `transaction` | Connection backend chỉ gán cho client trong thời gian một transaction rồi trả về pool | Tỉ lệ dồn rất cao, hợp serverless; đổi lại mất các tính năng gắn với phiên |

Với `transaction` pooling, những thứ phụ thuộc trạng thái phiên sẽ hỏng: prepared statement, `LISTEN/NOTIFY`, temp table, advisory lock, `SET` biến cấp session. Nhiều ORM vì thế cần bật cờ tắt prepared statement khi chạy qua PgBouncer.

Lựa chọn phổ biến: PgBouncer, Supabase Pooler, Neon Pooler, hoặc Prisma Accelerate (pool quản lý kèm cache ở edge).

</details>

**16. `VACUUM` và `ANALYZE` trong Postgres làm việc gì? `table bloat` sinh ra từ đâu và hậu quả nếu không vacuum?**

<details className="qa">
<summary>Xem đáp án</summary>

Postgres dùng MVCC: `UPDATE` và `DELETE` không xoá dòng cũ ngay mà chỉ đánh dấu "hết hạn" rồi ghi bản mới ra chỗ khác, để transaction đang đọc dở vẫn thấy bản cũ.

- **`VACUUM`** — thu hồi không gian của các dead tuple để dòng mới ghi đè vào, giống nhân viên dọn hàng hết hạn khỏi kệ siêu thị. Nó cũng ngăn vấn đề transaction id wraparound.
- **`ANALYZE`** — cập nhật statistics về phân bố dữ liệu cho query planner, để planner ước lượng đúng và chọn plan tốt.
- **`VACUUM FULL`** — viết lại toàn bộ bảng, trả đĩa về hệ điều hành, nhưng **khoá bảng** nên tránh dùng trên production.

`Table bloat` là phần dung lượng bị dead tuple chiếm giữ. Nó phình lên khi bảng bị update/delete nhiều, hoặc khi có transaction chạy rất lâu giữ snapshot khiến vacuum không được phép dọn.

Hậu quả nếu không dọn: bảng và index to ra dù số dòng thật không tăng, mỗi lần quét phải đọc nhiều trang hơn, cache hiệu quả kém đi, query chậm dần. Statistics cũ còn khiến planner chọn sai plan.

Autovacuum chạy mặc định nhưng với bảng lớn hoặc ghi nhiều thì cần chỉnh ngưỡng cho nó chạy thường xuyên hơn.

</details>

**17. So sánh `replication` và `sharding` — mỗi cách giải quyết loại tải nào? Vì sao sharding thường bị coi là giải pháp cuối cùng?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `Replication` | `Sharding` |
|---|---|---|
| Cách làm | Nhân bản **toàn bộ** dữ liệu ra nhiều node | Chia dữ liệu thành các phần rời, mỗi node giữ một phần |
| Giải quyết | Tải **đọc** lớn, và khả năng chịu lỗi | Dữ liệu hoặc tải **ghi** vượt sức một máy |
| Không giải quyết | Ghi vẫn dồn về primary; dung lượng vẫn phải vừa một máy | Không tự có tính sẵn sàng cao (mỗi shard vẫn cần replica riêng) |
| Độ phức tạp | Trung bình | Cao |

Sharding bị coi là biện pháp cuối vì nó đánh đổi rất nhiều: phải chọn shard key khôn ngoan (chọn sai là lệch tải, sửa lại cực khổ), mất khả năng `JOIN` và transaction xuyên shard, `UNIQUE` toàn cục không còn hiển nhiên, truy vấn tổng hợp phải gom kết quả từ nhiều node, backup và migration phức tạp lên nhiều lần.

Thứ tự nên thử trước: thêm index → viết lại query → cache → read replica → denormalize → nâng cấp phần cứng → phân vùng bảng (partitioning) trong cùng một database. Với phần cứng hiện nay, phần lớn hệ thống không bao giờ chạm tới giới hạn buộc phải shard.

</details>

**18. Hệ thống đọc từ read replica sẽ gặp `replication lag`. Kể một bug thực tế do lag gây ra và cách bạn xử lý.**

<details className="qa">
<summary>Xem đáp án</summary>

`Replication lag` là khoảng trễ từ lúc primary commit tới lúc replica áp dụng thay đổi — thường vài mili giây, nhưng có thể lên hàng giây khi ghi dồn hoặc replica bận.

Bug kinh điển **read-after-write**: người dùng bấm "Cập nhật hồ sơ", request ghi vào primary rồi redirect sang trang xem, request đọc lại đi vào replica chưa kịp đồng bộ, và họ thấy dữ liệu cũ. Người dùng tưởng lưu hỏng nên bấm lại, đôi khi tạo ra bản ghi trùng. Biến thể nguy hiểm hơn: tạo đơn hàng ở primary rồi job nền đọc ở replica không thấy đơn, dẫn tới xử lý sai hoặc báo lỗi "không tìm thấy".

Cách xử lý:

- **Đọc từ primary cho luồng vừa ghi** — ghim session của người dùng đó vào primary trong vài giây sau thao tác ghi.
- **Định tuyến theo bản chất dữ liệu** — dữ liệu quan trọng và dữ liệu vừa thay đổi đọc ở primary; báo cáo, tìm kiếm, thống kê thì replica là đủ.
- **Không chuyển tiếp dữ liệu qua id rồi đọc lại** — trả thẳng kết quả từ thao tác ghi cho client.
- **Theo dõi lag** và tự động ngừng gửi traffic đọc tới replica khi vượt ngưỡng.
- Với job nền, thêm cơ chế chờ hoặc retry thay vì kết luận bản ghi không tồn tại.

</details>
