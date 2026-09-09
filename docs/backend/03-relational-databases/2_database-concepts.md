---
sidebar_position: 2
title: "2. Khái niệm Database quan trọng"
---

# Khái niệm Database quan trọng

Khi đã chọn được database, bạn cần nắm vài khái niệm cốt lõi để dùng nó hiệu quả và tránh lỗi thường gặp. Bài này giải thích schema và migration, index, join, foreign key, vấn đề N+1 và transaction. Đây là những kiến thức nền tảng giúp bạn thiết kế dữ liệu gọn gàng và viết truy vấn chạy nhanh, đúng đắn.

---

:::note[Ghi nhớ nhanh]

- ⭐ **`Index` (thường B-tree) tăng tốc tìm row** nhưng tốn disk + làm chậm write — chỉ index cột dùng cho `WHERE`/`JOIN`/`ORDER BY`.
- ⭐ **`N+1 problem` là nguyên nhân slow #1** — fix bằng eager load, JOIN thủ công, hoặc batch query.
- **`Migration` nên forward-only, atomic**, test trước và cẩn thận `ALTER` table lớn (có thể lock).
- **Joins** (INNER/LEFT/RIGHT/FULL) và **`foreign key`** (`ON DELETE CASCADE/SET NULL/RESTRICT`) đảm bảo quan hệ + integrity.
- **`Transaction` đảm bảo `ACID`** (all-or-nothing) — dùng khi mutation liên quan nhiều bảng (vd transfer money).

:::

---

## Mục lục

- [Schema và Migrations](#schema-và-migrations)
- [Indexes](#indexes)
- [Joins](#joins)
- [Foreign Keys và Relationships](#foreign-keys-và-relationships)
- [N+1 Problem](#n1-problem)
- [Transactions](#transactions)

---

## Schema và Migrations

**Schema** = cấu trúc DB (table, column, type, constraint).

**Migration** = file SQL/code mô tả thay đổi schema theo thời gian:

:::tip[Ví dụ đời thường]

**Schema** giống **bản vẽ thiết kế ngôi nhà**: có mấy phòng, mỗi phòng rộng bao nhiêu, cửa mở hướng nào.

**Migration** là **nhật ký sửa nhà** ghi theo đúng thứ tự: `001` xây nhà, `002` thêm cửa sổ phòng khách, `003` xây thêm gác lửng. Ai cầm quyển nhật ký này cũng dựng lại được ngôi nhà y hệt — đó là lý do file migration phải đánh số và chạy tuần tự.

Nguyên tắc **forward-only** cũng từ đây: bạn không tẩy xoá trang cũ trong nhật ký, muốn sửa gì thì ghi thêm một trang mới.

:::

```
migrations/
├── 001_create_users.sql
├── 002_add_email_to_users.sql
└── 003_create_posts.sql
```

```sql
-- 001_create_users.sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 002_add_email_to_users.sql
ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE;
```

Tools:

- **Prisma Migrate** (Node).
- **Drizzle Kit** (Node).
- **Knex Migrations** (Node).
- **Alembic** (Python/SQLAlchemy).
- **Flyway**, **Liquibase** (Java).
- **golang-migrate** (Go).
- **Rails Migrations** (Ruby).

:::info[Phân tích]

**Migration best practices**:

1. **Forward-only** — không rollback. Tạo migration mới để fix.
2. **Atomic** — 1 migration = 1 thay đổi logic.
3. **Idempotent** — chạy 2 lần không lỗi (`CREATE TABLE IF NOT EXISTS`).
4. **Reversible** khi có thể — `up` + `down` để rollback dev.
5. **Test** trên copy production DB trước khi apply.
6. **Backup** trước migration phá hủy.
7. **Zero-downtime** patterns:
   - Add column nullable trước, populate sau, set NOT NULL.
   - Rename: add col mới, copy data, deprecate col cũ.
   - Drop: ngừng dùng trong code trước, drop sau.

**Production migration nguy hiểm**:

```sql
-- Lock table lâu nếu data lớn
ALTER TABLE huge_table ADD COLUMN new_col VARCHAR(100);

-- Postgres ≥ 11: INSTANT, không lock
-- MySQL: lock toàn table (cần pt-online-schema-change)
```

→ Đọc docs DB version về behavior của ALTER trước khi chạy production.

:::

---

## Indexes

**Index** = data structure giúp DB tìm row **nhanh hơn** (giống index sách).

:::tip[Ví dụ đời thường]

Bạn cần tìm chữ "database" trong một cuốn sách 500 trang:

- **Không index** — lật từng trang từ đầu đến cuối. Sách càng dày càng lâu (`full table scan`).
- **Có index** — mở **bảng tra cứu ở cuối sách**, các từ xếp sẵn theo alphabet, tra ra ngay "trang 312".

Và cái giá phải trả cũng y hệt ngoài đời: bảng tra cứu **tốn thêm giấy** (disk space), và mỗi lần sửa nội dung sách thì **phải cập nhật lại bảng tra** (write chậm hơn). Vì vậy không ai làm bảng tra cứu cho mọi từ — chỉ cho những từ hay tra.

:::

Không index:

```sql
SELECT * FROM users WHERE email = 'an@example.com';
-- Full table scan: O(n)
```

Có index:

```sql
CREATE INDEX idx_users_email ON users(email);
-- B-tree lookup: O(log n)
```

**Types index** (PostgreSQL):

| Type | Use case |
|------|---------|
| **B-tree** (default) | Equality, range, sort |
| **Hash** | Equality only |
| **GIN** | JSONB, full-text search, array |
| **GiST** | Geospatial, range type |
| **BRIN** | Time-series, append-only large table |

**Composite index** — multi column:

```sql
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);

-- Tận dụng cho query:
SELECT * FROM orders WHERE user_id = 1 ORDER BY created_at DESC;
SELECT * FROM orders WHERE user_id = 1 AND created_at > '2024-01-01';

-- Không tận dụng cho:
SELECT * FROM orders WHERE created_at > '2024-01-01';  -- bỏ qua user_id
```

→ **Quy tắc leftmost prefix**: index `(a, b, c)` hỗ trợ query có `a`, hoặc `a+b`, hoặc `a+b+c`.

:::tip[Ví dụ đời thường]

Nghĩ tới **danh bạ điện thoại** xếp theo `(Họ, Tên)`:

- Tìm mọi người **họ Nguyễn** → được, lật đúng khu vực chữ N.
- Tìm **Nguyễn Văn** → được, vì trong khu họ Nguyễn thì tên cũng đã xếp sẵn.
- Tìm mọi người **tên Văn** bất kể họ → chịu, phải đọc hết danh bạ.

Đó chính là leftmost prefix: bỏ qua cột đầu tiên thì index vô dụng.

:::

**Partial index**:

```sql
CREATE INDEX idx_orders_pending ON orders(created_at) WHERE status = 'pending';
-- Chỉ index row pending → nhỏ, nhanh
```

**Unique index** — vừa index, vừa constraint:

```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
```

:::warning[Cần lưu ý]

**Index có cost**:

- **Disk space** — index lớn = thêm disk.
- **Write slower** — INSERT/UPDATE phải update cả index.
- **Memory** — cache index in RAM cho performance.

→ Không index mọi column. Chỉ index column dùng cho:

- `WHERE` clause thường xuyên.
- `JOIN` keys.
- `ORDER BY` cho sort.
- `UNIQUE` constraint.

Đo bằng `EXPLAIN ANALYZE`:

```sql
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'an@example.com';
```

Output cho thấy: full scan vs index scan, cost ước lượng vs thực tế.

:::

---

## Joins

Kết hợp data từ nhiều bảng:

:::tip[Ví dụ đời thường]

Cô giáo có **2 tờ danh sách**: danh sách học sinh trong lớp, và danh sách bài đã nộp. Ghép hai tờ lại theo mã học sinh:

| Kiểu JOIN | Kết quả |
| --- | --- |
| `INNER JOIN` | Chỉ những học sinh **đã nộp bài** — có mặt ở cả 2 tờ |
| `LEFT JOIN` | **Mọi học sinh**; ai chưa nộp thì ô "bài nộp" để trống (`NULL`) — dùng để biết ai còn thiếu bài |
| `RIGHT JOIN` | **Mọi bài nộp**; bài nào không tra ra học sinh thì ô "tên" để trống |
| `FULL OUTER JOIN` | Gộp cả hai tờ, bên nào thiếu thì để trống |
| `CROSS JOIN` | Ghép mỗi học sinh với **mọi** bài nộp — 30 học sinh × 30 bài = 900 dòng vô nghĩa |

:::

```sql
-- INNER JOIN — chỉ row match cả 2 bảng
SELECT u.name, p.title
FROM users u
INNER JOIN posts p ON p.user_id = u.id;

-- LEFT JOIN — mọi user, NULL nếu không có post
SELECT u.name, p.title
FROM users u
LEFT JOIN posts p ON p.user_id = u.id;

-- RIGHT JOIN — mọi post, NULL nếu không có user (rare)
SELECT u.name, p.title
FROM users u
RIGHT JOIN posts p ON p.user_id = u.id;

-- FULL OUTER JOIN — mọi row 2 bảng, NULL nếu không match
SELECT u.name, p.title
FROM users u
FULL OUTER JOIN posts p ON p.user_id = u.id;

-- CROSS JOIN — Cartesian (mọi cặp), rare use
SELECT u.name, p.title FROM users u CROSS JOIN posts p;
```

```
INNER:        users ∩ posts (chỉ phần giao)
LEFT:         users (mọi user) + post nếu có
RIGHT:        posts (mọi post) + user nếu có
FULL OUTER:   users ∪ posts (mọi row 2 bên)
```

---

## Foreign Keys và Relationships

**Foreign key (FK)** — column reference primary key của bảng khác:

:::tip[Ví dụ đời thường]

Foreign key là **nội quy**: "mã học sinh ghi trên bài nộp bắt buộc phải có trong danh sách lớp". Nhờ nội quy này mà không tồn tại bài nộp của một học sinh ma.

`ON DELETE` trả lời câu hỏi: **học sinh chuyển trường thì bài nộp cũ xử lý sao?**

- `CASCADE` — bỏ luôn bài nộp của bạn đó.
- `SET NULL` — giữ bài lại nhưng ghi "khuyết danh".
- `RESTRICT` — không cho xoá tên khỏi danh sách chừng nào bài nộp còn đó.

:::

```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200)
);
```

`ON DELETE` actions:

| Action | Khi xóa user |
|--------|-------------|
| `CASCADE` | Xóa luôn post của user đó |
| `SET NULL` | post.user_id = NULL |
| `RESTRICT` | Báo lỗi nếu user còn post |
| `NO ACTION` | (default) Tương tự RESTRICT, deferred |

**Relationship types**:

| Type | Mô tả | Implementation |
|------|-------|----------------|
| **1-to-1** | 1 user có 1 profile | FK + UNIQUE |
| **1-to-many** | 1 user có nhiều post | FK |
| **Many-to-many** | User có nhiều role | Bảng join (user_roles) |

```sql
-- Many-to-many: User ↔ Role
CREATE TABLE user_roles (
  user_id INTEGER REFERENCES users(id),
  role_id INTEGER REFERENCES roles(id),
  PRIMARY KEY (user_id, role_id)
);
```

:::tip[Mẹo]

**Có nên dùng foreign key trong production?**

**Có**:
- Đảm bảo **referential integrity** (data consistency).
- Auto detect bug code quên xóa related.
- Performance OK với index đúng.

**Trường hợp bỏ FK**:

- Microservice với DB riêng — không thể FK cross-DB.
- High-write throughput (gây contention nhỏ).
- Event sourcing — data immutable.

Đa số app monolith → **giữ FK**. Lợi ích > cost performance.

:::

---

## N+1 Problem

**Anti-pattern kinh điển** — gây slow query.

:::tip[Ví dụ đời thường]

Bạn nấu một bữa cần **100 nguyên liệu**. Có hai cách đi chợ:

- **N+1** — ra chợ hỏi "hôm nay bán gì", rồi **chạy đi chạy về 100 lượt**, mỗi lượt mua đúng 1 món.
- **Cách đúng** — ghi sẵn danh sách 100 món, **đi một chuyến** mua hết.

Số món mua y hệt nhau, nhưng cách đầu chậm gấp bội vì thứ tốn thời gian là **quãng đường đi lại**, không phải việc nhặt món hàng. Với database, "quãng đường" đó là mỗi lần gửi query qua mạng tới DB rồi chờ trả về.

:::

**Bug**:

```js
// 1 query lấy list user
const users = await db.user.findMany(); // 1 query

// Loop fetch post của từng user
for (const user of users) {
  user.posts = await db.post.findMany({ where: { userId: user.id } }); // N query
}

// Total: 1 + N queries
// 100 user → 101 query!
```

**Fix**:

**1. Eager load** với ORM:

```js
// Prisma
const users = await db.user.findMany({
  include: { posts: true },
});
// 1 hoặc 2 query
```

```js
// SQLAlchemy
users = session.query(User).options(joinedload(User.posts)).all()
```

**2. JOIN thủ công**:

```sql
SELECT u.*, p.*
FROM users u
LEFT JOIN posts p ON p.user_id = u.id;
```

**3. Batch query**:

```js
const users = await db.user.findMany();
const userIds = users.map(u => u.id);
const posts = await db.post.findMany({ where: { userId: { in: userIds } } });

// Group lại bằng JS
const postsByUser = groupBy(posts, "userId");
users.forEach(u => u.posts = postsByUser[u.id] || []);

// Total: 2 query
```

:::info[Phân tích]

**N+1 là source slow #1 trong web app**. Khó detect vì:

- Local: data nhỏ → cảm giác nhanh.
- Production: data lớn → app chậm.

**Phát hiện**:

- ORM debug log — đếm số query mỗi request.
- APM tools (Datadog, New Relic) — flag N+1.
- pgBadger, pg_stat_statements — analyze production.
- `EXPLAIN` từng query.

**Đa số bug N+1 do**:

- Loop + lazy load.
- GraphQL resolver per field.
- Serialize relation in JSON response.

GraphQL có **DataLoader** pattern — batch + cache trong 1 request.

:::

---

## Transactions

Group nhiều query thành **đơn vị atomic** — hoặc thành công cả, hoặc fail
cả.

:::tip[Ví dụ đời thường]

**Chuyển khoản 100k từ tài khoản A sang B** gồm 2 việc: trừ tiền A, cộng tiền B.

Nếu mất điện đúng lúc vừa trừ xong mà chưa cộng, 100k đó **bốc hơi**. Ngân hàng không bao giờ chấp nhận chuyện này, nên hai việc phải được gộp thành **một thao tác duy nhất**: hoặc cả hai cùng xong (`COMMIT`), hoặc coi như chưa có gì xảy ra (`ROLLBACK`).

Còn **Isolation** là chuyện: trong lúc bạn đang chuyển tiền dở dang, người khác tra số dư thì **không được nhìn thấy trạng thái nửa vời** đó.

:::

```sql
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;

-- Nếu giữa chừng lỗi:
ROLLBACK;
```

Trong code:

```js
// Prisma
await db.$transaction(async (tx) => {
  await tx.account.update({ where: { id: 1 }, data: { balance: { decrement: 100 } } });
  await tx.account.update({ where: { id: 2 }, data: { balance: { increment: 100 } } });
});
```

```python
# SQLAlchemy
async with session.begin():
  account1.balance -= 100
  account2.balance += 100
```

**ACID properties**:

- **Atomicity** — all or nothing.
- **Consistency** — DB từ state hợp lệ sang state hợp lệ.
- **Isolation** — concurrent transaction không nhìn data nhau.
- **Durability** — commit xong thì persist (cả khi crash).

**Isolation levels**:

| Level | Dirty read | Non-repeatable read | Phantom read |
|-------|-----------|--------------------|--------------| 
| Read Uncommitted | Có | Có | Có |
| Read Committed (default Postgres) | Không | Có | Có |
| Repeatable Read | Không | Không | Có |
| Serializable | Không | Không | Không |

:::tip[Mẹo]

**Khi nào cần transaction?**

- Mọi mutation **liên quan nhiều bảng**.
- Transfer money / inventory deduction.
- Multi-step create (user + profile + initial setup).
- Bulk operation cần all-or-nothing.

**Khi nào không cần?**

- Single INSERT/UPDATE/DELETE — DB tự transaction.
- Read-only query.

**Pattern** chuẩn:

```js
async function transferMoney(fromId, toId, amount) {
  return await db.$transaction(async (tx) => {
    const from = await tx.account.findUnique({ where: { id: fromId } });
    if (from.balance < amount) {
      throw new Error("Insufficient funds");
    }

    await tx.account.update({
      where: { id: fromId },
      data: { balance: { decrement: amount } },
    });

    await tx.account.update({
      where: { id: toId },
      data: { balance: { increment: amount } },
    });

    await tx.transaction.create({
      data: { fromId, toId, amount },
    });
  });
}
```

Throw inside transaction → auto rollback.

:::
