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

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi đối chiếu lại với nội dung phía trên.

1. `ACID` gồm những tính chất nào? Giải thích từng tính chất qua ví dụ chuyển tiền giữa hai tài khoản.
2. Phân biệt `Consistency` trong ACID với `Consistency` trong `CAP theorem` — hai khái niệm này có phải một không?
3. Kể 4 `isolation level`. Mỗi mức ngăn được anomaly nào (`dirty read`, `non-repeatable read`, `phantom read`)?
4. Postgres mặc định chạy `Read Committed`. Khi nào bạn buộc phải nâng lên `Repeatable Read` hoặc `Serializable`, và cái giá phải trả là gì?
5. `deadlock` xảy ra trong tình huống nào? Database phát hiện và xử lý ra sao, còn phía code bạn viết thế nào để giảm khả năng deadlock?
6. Chuẩn hoá `1NF` → `2NF` → `3NF` khác nhau ở đâu? Cho một bảng đơn hàng chưa chuẩn hoá và tách nó ra từng bước.
7. Khi nào bạn cố tình `denormalize`? Đánh đổi những gì, và làm sao giữ dữ liệu bị nhân bản không bị lệch?
8. `index` giúp query nhanh lên bằng cơ chế nào? Vì sao thêm index lại làm chậm `INSERT`/`UPDATE`?
9. Với `composite index (a, b, c)`, một query chỉ lọc theo `b` và `c` mà không có `a` thì có tận dụng được index không? Vì sao?
10. Đọc output `EXPLAIN ANALYZE`: `Seq Scan`, `Index Scan` và `Bitmap Heap Scan` khác nhau thế nào? `cost` ước lượng và `actual time` nói lên điều gì?
11. Một query đang nhanh bỗng chậm hẳn trên production. Bạn lần theo trình tự nào để tìm nguyên nhân?
12. `N+1 query` là gì, phát hiện bằng cách nào, và ORM cung cấp cơ chế gì để tránh?
13. Dùng ORM được lợi gì và mất gì so với viết SQL thẳng? Trường hợp nào bạn bỏ ORM để viết raw SQL?
14. `connection pool` giải quyết vấn đề gì? Đặt `pool size` quá lớn thì hỏng chuyện gì?
15. Vì sao môi trường `serverless` cần pooler ngoài như `PgBouncer`? Phân biệt chế độ `session` pooling và `transaction` pooling.
16. `VACUUM` và `ANALYZE` trong Postgres làm việc gì? `table bloat` sinh ra từ đâu và hậu quả nếu không vacuum?
17. So sánh `replication` và `sharding` — mỗi cách giải quyết loại tải nào? Vì sao sharding thường bị coi là giải pháp cuối cùng?
18. Hệ thống đọc từ read replica sẽ gặp `replication lag`. Kể một bug thực tế do lag gây ra và cách bạn xử lý.
