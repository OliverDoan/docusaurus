---
sidebar_position: 2
title: "2. Khái niệm Database quan trọng"
---

# Khái niệm Database quan trọng

Khi đã chọn được database, bạn cần nắm vài khái niệm cốt lõi để dùng nó hiệu quả và tránh lỗi thường gặp. Bài này giải thích schema và migration, index, join, foreign key, vấn đề N+1 và transaction. Đây là những kiến thức nền tảng giúp bạn thiết kế dữ liệu gọn gàng và viết truy vấn chạy nhanh, đúng đắn.

[![Sơ đồ tóm tắt bài: Khái niệm Database quan trọng](/img/backend/database-concepts.webp)](pathname:///img/backend/database-concepts.webp)

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
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

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

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `Index` hoạt động ra sao khiến việc tìm row nhanh hơn `full table scan`? Cấu trúc `B-tree` giúp gì ở đây?**

<details className="qa">
<summary>Xem đáp án</summary>

Không có index, database phải **quét tuần tự toàn bộ bảng** và so sánh từng dòng — độ phức tạp `O(n)`, bảng càng lớn càng chậm. Index là một cấu trúc dữ liệu phụ, lưu sẵn giá trị của cột theo thứ tự cùng con trỏ tới vị trí dòng thật, giúp nhảy thẳng tới chỗ cần.

Đúng như ví dụ trong bài: tìm chữ "database" trong cuốn sách 500 trang, không index thì lật từng trang, có index thì mở bảng tra cứu cuối sách xếp sẵn theo bảng chữ cái, tra ra ngay "trang 312".

**B-tree** (chính xác là B+ tree) là cây cân bằng, mỗi node chứa nhiều khoá đã sắp xếp:

- Chiều cao cây rất thấp — vài triệu dòng thường chỉ 3–4 tầng — nên tìm một giá trị chỉ mất `O(log n)` lần đọc.
- Cây luôn tự cân bằng khi thêm hoặc xoá, nên hiệu năng ổn định.
- Vì các khoá đã có thứ tự, B-tree phục vụ được cả tìm chính xác, tìm theo khoảng (`>`, `<`, `BETWEEN`) lẫn `ORDER BY` — đó là lý do nó là loại index mặc định.

</details>

**2. Index có những chi phí nào? Vì sao không nên đánh index cho mọi cột?**

<details className="qa">
<summary>Xem đáp án</summary>

Index không miễn phí:

- **Dung lượng đĩa** — mỗi index là một cấu trúc riêng; bảng có nhiều index có khi tốn chỗ hơn cả dữ liệu gốc.
- **Ghi chậm hơn** — mỗi `INSERT`, `UPDATE`, `DELETE` phải cập nhật lại tất cả index liên quan. Mười index nghĩa là mười lần cập nhật thêm cho mỗi lần ghi.
- **Bộ nhớ** — index muốn nhanh thì phải nằm trong RAM; index thừa chiếm mất chỗ cache của dữ liệu thật sự hữu ích.
- **Chi phí bảo trì** — index bị phình và phân mảnh theo thời gian, cần `VACUUM` hoặc dựng lại.
- **Query planner** có nhiều lựa chọn hơn thì cũng dễ chọn nhầm hơn.

Quay lại ví dụ cuốn sách: bảng tra cứu tốn thêm giấy, và mỗi lần sửa nội dung sách thì phải cập nhật lại bảng tra. Vì vậy không ai làm bảng tra cứu cho mọi từ.

**Chỉ nên index cột dùng cho:** điều kiện `WHERE` thường gặp, khoá `JOIN`, cột dùng `ORDER BY`, và ràng buộc `UNIQUE`. Cách kiểm chứng là đo bằng `EXPLAIN ANALYZE`, đồng thời rà soát và xoá bớt index không bao giờ được dùng tới.

</details>

**3. Phân biệt `clustered index` và `non-clustered index`. Vì sao mỗi bảng chỉ có tối đa một clustered index?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Clustered index | Non-clustered index |
| --- | --- | --- |
| Bản chất | Quyết định **thứ tự lưu trữ vật lý** của dòng trên đĩa; lá của cây chính là dữ liệu dòng | Cấu trúc tách rời, lá chứa khoá cùng con trỏ tới dòng |
| Tốc độ | Nhanh nhất khi tìm theo đúng khoá đó, đặc biệt với truy vấn theo khoảng | Phải đi thêm một bước tra dòng thật (trừ khi là covering index) |
| Số lượng | Tối đa một | Nhiều tuỳ nhu cầu |

**Vì sao chỉ một:** dữ liệu chỉ có thể được sắp xếp vật lý theo **một** thứ tự trên đĩa, giống như một cuốn sách chỉ có thể đóng theo một trình tự trang. Muốn sắp theo thứ tự khác thì phải làm bảng tra cứu riêng — đó chính là non-clustered index.

Lưu ý theo từng engine: **MySQL InnoDB** lưu bảng theo kiểu clustered quanh khoá chính, nên khoá chính nên nhỏ gọn và tăng dần (UUID ngẫu nhiên làm khoá chính gây phân mảnh nặng). **PostgreSQL** không có clustered index theo nghĩa này — dòng nằm trong heap không sắp thứ tự; lệnh `CLUSTER` chỉ sắp lại một lần chứ không tự duy trì.

</details>

**4. Giải thích quy tắc `leftmost prefix` với composite index `(a, b, c)`. Query nào tận dụng được index này, query nào không?**

<details className="qa">
<summary>Xem đáp án</summary>

Composite index sắp xếp dữ liệu theo `a` trước, trong mỗi nhóm `a` mới sắp theo `b`, rồi tới `c`. Vì vậy chỉ dùng được khi truy vấn cung cấp **tiền tố từ trái sang**: `a`, hoặc `a` và `b`, hoặc cả ba.

```sql
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);

-- Tận dụng được
SELECT * FROM orders WHERE user_id = 1 ORDER BY created_at DESC;
SELECT * FROM orders WHERE user_id = 1 AND created_at > '2024-01-01';

-- Không tận dụng được (bỏ qua cột đầu tiên)
SELECT * FROM orders WHERE created_at > '2024-01-01';
```

Ví dụ trong bài rất dễ nhớ: danh bạ xếp theo `(Họ, Tên)` thì tìm mọi người họ Nguyễn được, tìm "Nguyễn Văn" cũng được, nhưng tìm mọi người tên Văn bất kể họ thì phải đọc hết danh bạ.

Hệ quả khi thiết kế: đặt cột hay lọc theo giá trị chính xác lên trước, cột lọc theo khoảng hoặc dùng để sắp xếp ra sau. Một index `(a, b, c)` đã bao gồm luôn công dụng của index `(a)` và `(a, b)`, nên không cần tạo thêm ba index riêng lẻ.

</details>

**5. `Covering index` là gì và vì sao nó nhanh hơn hẳn (`index-only scan`)?**

<details className="qa">
<summary>Xem đáp án</summary>

**Covering index** là index chứa **đủ mọi cột mà truy vấn cần** — cả cột trong điều kiện lọc lẫn cột trong danh sách `SELECT`. Khi đó database đọc xong index là có kết quả, **không phải quay lại bảng** để lấy dòng thật. PostgreSQL gọi bước này là **index-only scan**.

```sql
-- Truy vấn chỉ cần user_id và total
SELECT user_id, total FROM orders WHERE user_id = 1;

-- Index thường: tìm trong index rồi phải đọc thêm heap
CREATE INDEX idx_a ON orders(user_id);

-- Covering index: mọi thứ nằm sẵn trong index
CREATE INDEX idx_b ON orders(user_id) INCLUDE (total);
```

Vì sao nhanh hơn hẳn: bước quay lại bảng là **truy cập ngẫu nhiên trên đĩa**, mỗi dòng một lần; với truy vấn trả về hàng nghìn dòng, đây thường là phần tốn thời gian nhất. Index cũng nhỏ hơn bảng nên nhiều khả năng đã nằm sẵn trong cache.

Lưu ý riêng của PostgreSQL: index-only scan chỉ thật sự bỏ qua heap khi visibility map cho biết trang đó toàn dòng còn hiển thị, tức là bảng cần được `VACUUM` thường xuyên. Mệnh đề `INCLUDE` cho phép nhét cột phụ vào index mà không làm cồng kềnh phần khoá.

</details>

**6. Kể các trường hợp database bỏ qua index dù cột đã có index: bọc hàm lên cột, `LIKE '%abc'`, ép kiểu ngầm, selectivity thấp. Mỗi trường hợp khắc phục ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Bọc hàm lên cột** — index lưu giá trị gốc, không lưu giá trị đã biến đổi:

```sql
WHERE LOWER(email) = 'a@b.com'          -- bỏ qua index trên email
WHERE DATE(created_at) = '2024-01-01'   -- bỏ qua index trên created_at
```

Khắc phục: tạo index biểu thức `CREATE INDEX ON users (LOWER(email))`, hoặc viết lại thành điều kiện khoảng `created_at >= '2024-01-01' AND created_at < '2024-01-02'`.

**`LIKE '%abc'`** — ký tự đại diện ở đầu làm mất tiền tố, B-tree không định vị được. `LIKE 'abc%'` thì vẫn dùng index bình thường. Khắc phục: dùng full-text search, index `GIN` với `pg_trgm`, hoặc lưu thêm cột đảo chuỗi nếu chỉ cần khớp phần đuôi.

**Ép kiểu ngầm** — so sánh cột `VARCHAR` với số, hoặc `bigint` với chuỗi, khiến database phải chuyển kiểu cả cột. Khắc phục: truyền đúng kiểu từ tầng ứng dụng, thống nhất kiểu giữa các bảng khi join.

**Selectivity thấp** — điều kiện khớp quá nhiều dòng (ví dụ cột `is_active` mà 95% là `true`), planner tính ra quét tuần tự còn rẻ hơn. Đây là **lựa chọn đúng**, không phải lỗi. Khắc phục nếu thật sự cần: dùng partial index chỉ cho nhóm thiểu số, hoặc ghép cột đó vào composite index cùng cột có tính phân biệt cao.

Ngoài ra, thống kê lỗi thời cũng làm planner ước lượng sai — chạy `ANALYZE` để cập nhật.

</details>

**7. `Partial index` và `unique index` khác index thường thế nào, khi nào bạn dùng chúng?**

<details className="qa">
<summary>Xem đáp án</summary>

**Partial index** chỉ đánh index cho phần dòng thoả một điều kiện:

```sql
CREATE INDEX idx_orders_pending ON orders(created_at) WHERE status = 'pending';
```

Dùng khi truy vấn thường chỉ quan tâm một nhóm nhỏ trong bảng lớn: đơn hàng đang chờ xử lý, bản ghi chưa bị xoá mềm, job trong hàng đợi. Lợi ích là index nhỏ hơn rất nhiều nên nằm gọn trong RAM, tra nhanh hơn và làm chậm thao tác ghi ít hơn. Điều kiện của truy vấn phải khớp được với điều kiện của index thì planner mới dùng.

**Unique index** vừa là index vừa là **ràng buộc**: database từ chối mọi giá trị trùng.

```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
```

Dùng cho những trường buộc phải duy nhất: email, tên đăng nhập, mã đơn hàng. Quan trọng là đây là cách duy nhất chống trùng **đáng tin cậy** — kiểm tra ở tầng ứng dụng rồi mới ghi sẽ hỏng khi hai request chạy đồng thời. Lưu ý trên PostgreSQL, nhiều giá trị `NULL` vẫn được xem là khác nhau nên không bị chặn.

Hai thứ này kết hợp được: unique index có điều kiện, ví dụ email chỉ cần duy nhất trong nhóm tài khoản chưa bị xoá.

</details>

**8. Bạn đọc output của `EXPLAIN ANALYZE` như thế nào? Phân biệt `Seq Scan` với `Index Scan`, và ý nghĩa của cost ước lượng so với thời gian thực tế.**

<details className="qa">
<summary>Xem đáp án</summary>

`EXPLAIN` in ra **kế hoạch ước lượng**, còn `EXPLAIN ANALYZE` **chạy thật** rồi in kèm số liệu thực tế.

```sql
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'an@example.com';
```

Cách đọc: kế hoạch là một cây, **đọc từ node lá trở lên**. Mỗi node cho biết cách lấy dữ liệu, chi phí ước lượng và kết quả thật.

Các loại node hay gặp:

- **`Seq Scan`** — quét tuần tự cả bảng. Không hẳn là xấu: với bảng nhỏ hoặc khi truy vấn lấy phần lớn số dòng, đây là cách rẻ nhất.
- **`Index Scan`** — tra index rồi lấy dòng tương ứng từ bảng. Hợp khi kết quả ít.
- **`Index Only Scan`** — đọc xong index là đủ, nhanh nhất.
- **`Bitmap Heap Scan`** — nằm giữa hai thái cực, hợp với số dòng ở mức trung bình.
- Các node join: `Nested Loop`, `Hash Join`, `Merge Join`.

**Cost ước lượng so với thời gian thực tế:** `cost=0.00..8.27` là đơn vị chi phí nội bộ, không phải mili giây, chỉ dùng để so sánh giữa các phương án. `actual time` mới là thời gian thật. Điều đáng chú ý nhất là so sánh **`rows` ước lượng với `rows` thực tế**: lệch nhau nhiều lần nghĩa là thống kê lỗi thời hoặc planner ước lượng sai, dẫn tới chọn nhầm kế hoạch — hãy chạy `ANALYZE` để cập nhật. Ngoài ra nên để ý số vòng lặp (`loops`) cao bất thường và các bước sắp xếp phải đổ ra đĩa.

</details>

**9. Phân biệt `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN`, `FULL OUTER JOIN` và `CROSS JOIN`. Cho một ví dụ nghiệp vụ bắt buộc phải dùng `LEFT JOIN`.**

<details className="qa">
<summary>Xem đáp án</summary>

Vẫn dùng ví dụ hai tờ danh sách của cô giáo — danh sách học sinh và danh sách bài đã nộp, ghép theo mã học sinh:

| Kiểu JOIN | Kết quả |
| --- | --- |
| `INNER JOIN` | Chỉ những học sinh đã nộp bài — có mặt ở cả hai tờ |
| `LEFT JOIN` | Mọi học sinh; ai chưa nộp thì ô "bài nộp" để trống (`NULL`) |
| `RIGHT JOIN` | Mọi bài nộp; bài nào không tra ra học sinh thì ô "tên" để trống |
| `FULL OUTER JOIN` | Gộp cả hai tờ, bên nào thiếu thì để trống |
| `CROSS JOIN` | Ghép mỗi học sinh với mọi bài nộp — tích Descartes, 30 × 30 = 900 dòng vô nghĩa |

**Ví dụ bắt buộc dùng `LEFT JOIN`:** liệt kê học sinh **chưa nộp bài**. `INNER JOIN` không làm được vì nó loại sạch những dòng không khớp — mà đó lại đúng là thứ ta cần tìm.

```sql
SELECT u.name
FROM users u
LEFT JOIN posts p ON p.user_id = u.id
WHERE p.id IS NULL;
```

Các trường hợp tương tự: đếm số bài viết của từng người dùng kể cả người có 0 bài, hiển thị giỏ hàng kèm mã giảm giá có thể không có, báo cáo doanh thu theo ngày kể cả ngày không phát sinh đơn.

</details>

**10. Với `LEFT JOIN`, đặt điều kiện lọc ở mệnh đề `ON` khác đặt ở `WHERE` như thế nào? Vì sao đặt sai chỗ biến LEFT JOIN thành INNER JOIN?**

<details className="qa">
<summary>Xem đáp án</summary>

Khác biệt nằm ở **thứ tự thực thi**: điều kiện trong `ON` được áp dụng **trong lúc ghép bảng**, còn điều kiện trong `WHERE` áp dụng **sau khi đã ghép xong**.

```sql
-- A. Điều kiện trong ON: giữ MỌI user; chỉ ghép bài viết đã publish
SELECT u.name, p.title
FROM users u
LEFT JOIN posts p ON p.user_id = u.id AND p.status = 'published';

-- B. Điều kiện trong WHERE: LEFT JOIN thành INNER JOIN
SELECT u.name, p.title
FROM users u
LEFT JOIN posts p ON p.user_id = u.id
WHERE p.status = 'published';
```

Ở câu B, những người dùng không có bài viết nào sẽ nhận dòng ghép với toàn `NULL`. Sau đó `WHERE p.status = 'published'` được áp lên, mà `NULL = 'published'` cho kết quả không phải `true`, nên các dòng đó **bị loại sạch**. Kết quả đúng bằng `INNER JOIN` — vế trái mất hết những dòng không khớp, tức là mất luôn ý nghĩa của `LEFT JOIN`.

Quy tắc ghi nhớ: điều kiện lọc **bảng bên phải** thì đặt trong `ON`; điều kiện lọc **bảng bên trái** thì đặt ở `WHERE`. Ngoại lệ hữu ích là `WHERE p.id IS NULL` — đây chính là cách cố ý tìm những dòng không khớp.

</details>

**11. `WHERE` và `HAVING` khác nhau ở đâu? Nêu thứ tự thực thi logic của một câu `SELECT` (`FROM` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `ORDER BY` → `LIMIT`).**

<details className="qa">
<summary>Xem đáp án</summary>

Thứ tự thực thi logic:

1. **`FROM`** và các `JOIN` — dựng tập dữ liệu nguồn.
2. **`WHERE`** — lọc **từng dòng**, trước khi gom nhóm.
3. **`GROUP BY`** — gom dòng thành nhóm.
4. **`HAVING`** — lọc **từng nhóm**, dựa trên hàm tổng hợp.
5. **`SELECT`** — tính các biểu thức và bí danh cột.
6. **`ORDER BY`** — sắp xếp.
7. **`LIMIT`/`OFFSET`** — cắt lấy phần cần.

**Khác biệt then chốt:** `WHERE` chạy *trước* khi gom nhóm nên không dùng được hàm tổng hợp; `HAVING` chạy *sau* nên dùng được `COUNT`, `SUM`, `AVG`.

```sql
SELECT u.id, COUNT(p.id) AS post_count
FROM users u
LEFT JOIN posts p ON p.user_id = u.id
WHERE u.created_at > NOW() - INTERVAL '30 days'  -- lọc từng user
GROUP BY u.id
HAVING COUNT(p.id) > 5                            -- lọc từng nhóm
ORDER BY post_count DESC
LIMIT 10;
```

Hai hệ quả thực tế: nên đẩy càng nhiều điều kiện vào `WHERE` càng tốt vì lọc sớm thì phải gom nhóm ít dữ liệu hơn; và vì `SELECT` chạy sau `WHERE`, bí danh đặt trong `SELECT` không dùng được ở `WHERE` (nhưng `ORDER BY` thì được, vì nó chạy sau).

</details>

**12. `Foreign key` mang lại lợi ích gì? Nêu các trường hợp chấp nhận bỏ FK và giải thích `ON DELETE CASCADE`/`SET NULL`/`RESTRICT` khác nhau ra sao.**

<details className="qa">
<summary>Xem đáp án</summary>

**Lợi ích:** foreign key là "nội quy" do chính database thực thi — mã tham chiếu ghi trên bảng con bắt buộc phải tồn tại ở bảng cha. Nhờ vậy không bao giờ có dòng mồ côi, lỗi ở tầng ứng dụng bị chặn ngay tại nguồn thay vì âm thầm làm hỏng dữ liệu, và schema tự nó mô tả rõ quan hệ giữa các bảng cho người đọc và cho công cụ.

**Các `ON DELETE` action:**

| Action | Khi xoá user |
| --- | --- |
| `CASCADE` | Xoá luôn post của user đó |
| `SET NULL` | Giữ post lại, đặt `post.user_id = NULL` (cột phải cho phép `NULL`) |
| `RESTRICT` | Báo lỗi, không cho xoá chừng nào user còn post |
| `NO ACTION` | Mặc định, giống `RESTRICT` nhưng kiểm tra được hoãn tới cuối transaction |

Chọn thế nào: `CASCADE` cho dữ liệu thật sự thuộc sở hữu của bản ghi cha (ảnh của một bài viết, dòng chi tiết của một đơn hàng); `SET NULL` khi bản ghi con vẫn còn giá trị dù mất người tạo (bình luận để "khuyết danh"); `RESTRICT` cho dữ liệu quan trọng, buộc người dùng xử lý tường minh.

**Trường hợp chấp nhận bỏ FK:** mỗi microservice có database riêng nên không thể tham chiếu chéo; hệ thống ghi với thông lượng cực cao mà ràng buộc gây tranh chấp; mô hình event sourcing với dữ liệu bất biến; hoặc bảng phân mảnh theo shard. Với phần lớn ứng dụng monolith thì **giữ FK** — lợi ích lớn hơn nhiều so với chi phí hiệu năng.

</details>

**13. Thiết kế quan hệ `many-to-many` thế nào? Vì sao bảng trung gian thường dùng composite primary key thay vì cột `id` riêng?**

<details className="qa">
<summary>Xem đáp án</summary>

Quan hệ nhiều-nhiều không biểu diễn trực tiếp được bằng một khoá ngoại, nên phải tách ra **bảng trung gian** chứa hai khoá ngoại trỏ về hai phía:

```sql
CREATE TABLE user_roles (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- Index bổ sung cho chiều tra ngược
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
```

**Vì sao dùng composite primary key `(user_id, role_id)`:**

- Nó **tự động chống trùng** — một người không thể được gán cùng một vai trò hai lần. Nếu thêm cột `id` tự tăng làm khoá chính thì vẫn phải tạo thêm ràng buộc `UNIQUE (user_id, role_id)`, tức là cùng một việc nhưng tốn thêm một cột và một index.
- **Gọn hơn** — bớt một cột và bớt một cấu trúc index trên bảng vốn thường rất nhiều dòng.
- Khoá chính đã sẵn là index tổng hợp, phục vụ luôn truy vấn tra vai trò của một người.

**Khi nào vẫn nên có cột `id` riêng:** khi bảng trung gian mang thêm thuộc tính và trở thành một thực thể nghiệp vụ thật sự — ví dụ `order_items` có số lượng, đơn giá, hoặc `enrollments` có ngày ghi danh và điểm số — nhất là khi có bảng khác cần tham chiếu tới chính dòng đó, hoặc ORM yêu cầu khoá chính đơn.

</details>

**14. `N+1 problem` là gì, nó phát sinh thế nào trong ORM và trong GraphQL resolver? Nêu ít nhất ba cách fix.**

<details className="qa">
<summary>Xem đáp án</summary>

**N+1** là việc chạy **1 truy vấn lấy danh sách, rồi thêm N truy vấn** để lấy dữ liệu liên quan cho từng phần tử. 100 người dùng thành 101 truy vấn. Giống chuyện đi chợ: mua 100 món mà chạy đi chạy về 100 lượt, phần tốn thời gian là quãng đường chứ không phải việc nhặt món.

**Trong ORM:** vòng lặp cộng với lazy load. Truy cập `user.posts` bên trong vòng lặp khiến ORM âm thầm bắn một truy vấn mỗi lần lặp. Rất khó thấy vì code trông hoàn toàn bình thường.

**Trong GraphQL:** resolver chạy theo từng trường của từng phần tử. Truy vấn lấy 50 bài viết rồi mỗi bài hỏi tác giả sẽ sinh 50 truy vấn; lồng thêm một tầng nữa thì bùng nổ theo cấp số nhân.

**Ba cách fix:**

Eager load bằng ORM:

```js
const users = await db.user.findMany({ include: { posts: true } });
```

JOIN thủ công:

```sql
SELECT u.*, p.* FROM users u LEFT JOIN posts p ON p.user_id = u.id;
```

Batch query rồi gom nhóm ở tầng ứng dụng:

```js
const userIds = users.map(u => u.id);
const posts = await db.post.findMany({ where: { userId: { in: userIds } } });
const postsByUser = groupBy(posts, "userId");
// tổng cộng 2 truy vấn
```

Với GraphQL, giải pháp chuẩn là **DataLoader** — gom các lời gọi trong cùng một vòng sự kiện thành một truy vấn duy nhất và cache trong phạm vi một request.

</details>

**15. Eager load bằng một câu `JOIN` có nhược điểm gì (dữ liệu bị nhân bản) so với cách chạy hai query rồi gom nhóm ở tầng ứng dụng?**

<details className="qa">
<summary>Xem đáp án</summary>

Với `JOIN`, mỗi dòng bên bảng con kéo theo **một bản sao đầy đủ của dòng bên bảng cha**. Một người dùng có 100 bài viết thì thông tin người dùng đó bị lặp lại 100 lần trong kết quả trả về.

Hệ quả:

- **Lượng dữ liệu truyền qua mạng phình to** — nhất là khi bảng cha có cột `TEXT` hoặc `JSONB` lớn.
- **Nhân bản theo cấp số nhân** khi join nhiều quan hệ một-nhiều cùng lúc: một người có 10 bài viết và 10 bình luận sẽ cho 100 dòng thay vì 20. Đây là cái bẫy kinh điển.
- **Tầng ứng dụng vẫn phải gom nhóm lại** để dựng cấu trúc lồng nhau, nên công sức không tiết kiệm được bao nhiêu.
- Kết hợp với `LIMIT` thì dễ sai, vì `LIMIT` đếm dòng đã nhân bản chứ không đếm số người dùng.

**Chạy hai truy vấn rồi gom nhóm** tránh hết những chuyện trên: mỗi dòng chỉ truyền một lần, dùng `LIMIT` đúng nghĩa, và nhiều quan hệ thì chỉ thêm một truy vấn cho mỗi quan hệ chứ không nhân lên. Cái giá là thêm một vòng đi lại tới database và phải gom nhóm trong code — không đáng kể so với lợi ích. Đây cũng là lý do Prisma mặc định tách truy vấn, còn SQLAlchemy có `selectinload` bên cạnh `joinedload`.

**Khi nào `JOIN` vẫn tốt hơn:** quan hệ một-một hoặc nhiều-một (không có nhân bản), hoặc khi chỉ cần vài cột nhỏ từ bảng cha.

</details>

**16. Làm sao phát hiện `N+1` khi nó không lộ ra ở môi trường local? Bạn dùng công cụ hoặc chỉ số nào?**

<details className="qa">
<summary>Xem đáp án</summary>

N+1 khó thấy ở local vì dữ liệu ít và database nằm ngay trên máy: 101 truy vấn với độ trễ gần bằng 0 vẫn cho cảm giác nhanh. Lên production, dữ liệu lớn và mỗi truy vấn phải đi qua mạng, con số đó thành vài trăm mili giây.

Cách phát hiện:

- **Bật log truy vấn của ORM và đếm số query mỗi request.** Đây là cách hiệu quả nhất. Có thể thêm middleware tự đếm và cảnh báo khi một request vượt ngưỡng, ví dụ 20 truy vấn.
- **Viết test tự động** khẳng định số truy vấn cho một endpoint không vượt quá mức cho phép — chống hồi quy rất tốt.
- **Công cụ APM** như Datadog, New Relic, Sentry Performance: xem biểu đồ trace của một request, N+1 hiện lên thành một dãy dài các truy vấn giống hệt nhau nối tiếp.
- **`pg_stat_statements`** trên PostgreSQL — sắp xếp theo số lần gọi, truy vấn nào có `calls` cao bất thường mà mỗi lần rất nhẹ thì gần như chắc chắn là N+1. **pgBadger** phân tích log theo cách tương tự.
- **Seed dữ liệu sát thực tế ở môi trường staging** để vấn đề lộ ra trước khi lên production.

Chỉ số đáng theo dõi: **số truy vấn trên mỗi request**, và tỷ lệ thời gian nằm ở database trong tổng thời gian xử lý. Dấu hiệu nghi ngờ rõ nhất là thời gian phản hồi tăng tuyến tính theo số phần tử trong danh sách trả về.

</details>

**17. Giải thích `ACID` qua ví dụ chuyển khoản. Chữ nào do database lo, chữ nào lập trình viên vẫn phải tự đảm bảo?**

<details className="qa">
<summary>Xem đáp án</summary>

Chuyển 100k từ tài khoản A sang B gồm hai việc: trừ tiền A, cộng tiền B.

- **Atomicity (nguyên tử)** — cả hai cùng xong hoặc coi như chưa có gì. Mất điện giữa chừng thì `ROLLBACK`, tiền không bốc hơi. **Database lo.**
- **Consistency (nhất quán)** — database chuyển từ trạng thái hợp lệ sang trạng thái hợp lệ, mọi ràng buộc vẫn đúng. **Chia đôi:** database thực thi những ràng buộc bạn đã khai báo (`CHECK (balance >= 0)`, khoá ngoại, `UNIQUE`); còn quy tắc nghiệp vụ — như "không cho chuyển quá số dư" — thì **lập trình viên phải tự viết**, hoặc khai báo thành ràng buộc để database gác hộ.
- **Isolation (cô lập)** — trong lúc chuyển tiền dở dang, người khác tra số dư không được nhìn thấy trạng thái nửa vời. **Database lo, nhưng ở mức độ do bạn chọn** qua isolation level. Chọn mức quá lỏng thì vẫn gặp lost update; đó là phần lập trình viên phải quyết định, kèm việc dùng khoá hoặc cột `version` khi cần.
- **Durability (bền vững)** — `COMMIT` xong là dữ liệu còn đó kể cả khi máy chủ sập. **Database lo**, thông qua write-ahead log; phần còn lại thuộc về vận hành: cấu hình `fsync`, replication, backup.

Tóm lại: database bảo đảm phần cơ chế; lập trình viên phải **đặt đúng ranh giới transaction**, **chọn đúng isolation level** và **khai báo đủ ràng buộc nghiệp vụ**.

</details>

**18. Ba hiện tượng `dirty read`, `non-repeatable read`, `phantom read` là gì? Isolation level nào ngăn được cái nào, và default của PostgreSQL với MySQL là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Dirty read** — đọc phải dữ liệu mà transaction khác đã sửa nhưng **chưa commit**; nếu bên kia rollback thì thứ bạn đọc chưa từng tồn tại.
- **Non-repeatable read** — đọc cùng **một dòng** hai lần trong cùng transaction lại ra hai giá trị khác nhau, vì giữa hai lần đó có transaction khác sửa rồi commit.
- **Phantom read** — chạy cùng **một truy vấn theo điều kiện** hai lần lại ra số lượng dòng khác nhau, vì có dòng mới được thêm vào khớp điều kiện đó.

| Level | Dirty read | Non-repeatable read | Phantom read |
| --- | --- | --- | --- |
| Read Uncommitted | Có | Có | Có |
| Read Committed | Không | Có | Có |
| Repeatable Read | Không | Không | Có |
| Serializable | Không | Không | Không |

**Mặc định:** PostgreSQL dùng **Read Committed**, MySQL InnoDB dùng **Repeatable Read**.

Vài chi tiết đáng nhớ: PostgreSQL không thực sự có Read Uncommitted — chọn mức đó vẫn chạy như Read Committed. Mức Repeatable Read của InnoDB nhờ cơ chế next-key lock nên trong thực tế chặn được phần lớn phantom. Còn Serializable của PostgreSQL dùng kiểm soát đồng thời theo kiểu lạc quan, nên transaction có thể bị huỷ với lỗi serialization và ứng dụng phải sẵn sàng thử lại.

</details>

**19. `MVCC` hoạt động ra sao và vì sao trong PostgreSQL việc đọc không chặn việc ghi? `VACUUM` sinh ra để giải quyết vấn đề gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**MVCC (Multi-Version Concurrency Control)** nghĩa là database giữ **nhiều phiên bản** của cùng một dòng. Trong PostgreSQL, `UPDATE` không ghi đè tại chỗ mà **tạo một phiên bản dòng mới**, đánh dấu phiên bản cũ là hết hiệu lực từ một mốc transaction nhất định. Mỗi transaction nhìn thấy ảnh chụp dữ liệu phù hợp với thời điểm nó bắt đầu.

**Vì sao đọc không chặn ghi và ngược lại:** người đọc không cần khoá gì cả — nó chỉ chọn phiên bản dòng phù hợp với ảnh chụp của mình. Người ghi tạo phiên bản mới, không đụng tới phiên bản mà người đọc đang xem. Nhờ vậy báo cáo chạy hàng phút không làm nghẽn luồng ghi của ứng dụng. Chỉ hai người **cùng ghi một dòng** mới phải chờ nhau.

**Cái giá và vai trò của `VACUUM`:** các phiên bản cũ không còn ai nhìn thấy vẫn nằm lại trong bảng, gọi là dead tuple. Không dọn thì bảng và index phình lên (table bloat), quét chậm dần, và bộ đếm transaction id có nguy cơ quay vòng.

`VACUUM` làm ba việc: đánh dấu không gian của dead tuple để tái sử dụng, cập nhật visibility map (điều kiện để có index-only scan), và làm đông cứng transaction id để tránh wraparound. `autovacuum` chạy tự động, nhưng với bảng ghi nhiều thường phải chỉnh tham số cho chạy thường xuyên hơn. `VACUUM FULL` thu hồi được dung lượng thật trả về hệ điều hành nhưng khoá toàn bảng, nên tránh dùng lúc đang phục vụ.

</details>

**20. `Deadlock` xảy ra khi nào? Vì sao thống nhất thứ tự lock giữa các transaction lại giảm được deadlock?**

<details className="qa">
<summary>Xem đáp án</summary>

**Deadlock** xảy ra khi hai transaction giữ khoá mà bên kia đang cần, tạo thành vòng chờ khép kín, không bên nào đi tiếp được.

```sql
-- Transaction 1
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;  -- giữ khoá dòng 1
UPDATE accounts SET balance = balance + 100 WHERE id = 2;  -- chờ khoá dòng 2

-- Transaction 2 (chạy đồng thời)
BEGIN;
UPDATE accounts SET balance = balance - 50 WHERE id = 2;   -- giữ khoá dòng 2
UPDATE accounts SET balance = balance + 50 WHERE id = 1;   -- chờ khoá dòng 1
```

Database phát hiện vòng chờ và **huỷ một trong hai** transaction (nạn nhân), trả về lỗi deadlock; bên còn lại đi tiếp.

**Vì sao thống nhất thứ tự khoá lại hiệu quả:** deadlock cần một **chu trình** trong đồ thị chờ. Nếu mọi transaction đều khoá tài nguyên theo cùng một thứ tự — chẳng hạn luôn theo `id` tăng dần — thì không thể có chuyện A giữ 1 chờ 2 trong khi B giữ 2 chờ 1, vì B cũng sẽ xin khoá dòng 1 trước. Không có chu trình thì không có deadlock.

Trong ví dụ trên, chỉ cần sắp xếp hai `id` rồi cập nhật theo thứ tự tăng dần là hết. Các biện pháp bổ sung: giữ transaction ngắn nhất có thể, giảm số dòng bị khoá, đặt `lock_timeout`, và luôn có cơ chế **thử lại** vì deadlock không bao giờ triệt tiêu được hoàn toàn.

</details>

**21. So sánh `pessimistic locking` (`SELECT ... FOR UPDATE`) với `optimistic locking` (cột `version`). Trường hợp nào bạn chọn cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Pessimistic locking | Optimistic locking |
| --- | --- | --- |
| Cách làm | Khoá dòng ngay khi đọc, người khác phải chờ | Không khoá; lúc ghi mới kiểm tra dữ liệu có bị đổi không |
| Cài đặt | `SELECT ... FOR UPDATE` trong transaction | Cột `version` hoặc `updated_at`, `UPDATE ... WHERE version = ?` |
| Khi tranh chấp | Chờ, có thể timeout hoặc deadlock | Ghi thất bại, ứng dụng phải thử lại |
| Chi phí | Giữ khoá suốt transaction, giảm đồng thời | Gần như không tốn gì khi ít tranh chấp |

```sql
-- Pessimistic
BEGIN;
SELECT * FROM inventory WHERE id = 1 FOR UPDATE;
UPDATE inventory SET qty = qty - 1 WHERE id = 1;
COMMIT;

-- Optimistic
UPDATE products SET price = 120, version = version + 1
WHERE id = 1 AND version = 7;
-- Trả về 0 dòng bị ảnh hưởng nghĩa là có người đã sửa trước, cần thử lại
```

**Chọn pessimistic khi:** tranh chấp cao và việc thử lại tốn kém hoặc gây khó chịu — trừ tồn kho lúc flash sale, chia số dư, cấp phát số thứ tự. Điều kiện là transaction phải thật ngắn.

**Chọn optimistic khi:** tranh chấp thấp, thao tác kéo dài qua nhiều bước hoặc qua nhiều request HTTP (giữ khoá suốt thời gian người dùng điền form là không chấp nhận được), hoặc hệ thống cần thông lượng cao. Đây cũng là cách phát hiện xung đột chỉnh sửa để báo cho người dùng biết "bản ghi vừa bị người khác thay đổi".

</details>

**22. Một transaction mở quá lâu gây ra những vấn đề gì cho hệ thống?**

<details className="qa">
<summary>Xem đáp án</summary>

Transaction dài là một trong những nguyên nhân sự cố âm thầm và khó chẩn đoán nhất:

- **Giữ khoá lâu** — mọi transaction khác cần cùng dòng đó phải xếp hàng, độ trễ tăng dây chuyền, dễ dẫn tới timeout và deadlock.
- **Chặn `VACUUM`** — PostgreSQL không thể dọn dead tuple mới hơn transaction cũ nhất đang mở. Một transaction quên đóng có thể khiến bảng phình to liên tục dù autovacuum vẫn chạy.
- **Giữ connection** — connection pool cạn, request mới không xin được kết nối dù database chưa hề quá tải.
- **Chặn thao tác DDL** — migration cần khoá bảng sẽ nằm chờ, và trong lúc chờ nó lại chặn tiếp mọi truy vấn đến sau.
- **Rollback tốn kém** — transaction càng làm nhiều việc, huỷ bỏ càng lâu.
- **Nguy cơ mất nhiều công** — lỗi ở bước cuối làm mất toàn bộ công việc từ đầu.

Nguyên nhân phổ biến nhất: **gọi API bên ngoài, gửi mail, xử lý file ngay bên trong transaction**. Nguyên tắc là transaction chỉ bao đúng những lệnh ghi cần tính nguyên tử; mọi việc chậm và không thuộc database phải nằm ngoài, hoặc đẩy sang hàng đợi chạy nền. Nên đặt `statement_timeout` cùng `idle_in_transaction_session_timeout` và giám sát transaction chạy lâu nhất.

</details>

**23. Chạy `ALTER TABLE ADD COLUMN` trên bảng hàng chục triệu row có lock không? Nêu pattern zero-downtime để thêm một cột `NOT NULL` và để đổi tên cột.**

<details className="qa">
<summary>Xem đáp án</summary>

Tuỳ phiên bản, nên phải đọc tài liệu đúng bản đang chạy trước khi thao tác trên production:

- **PostgreSQL từ bản 11**: thêm cột cho phép `NULL`, hoặc có `DEFAULT` là hằng số, được thực hiện **tức thì** — chỉ sửa metadata, không viết lại bảng. Nhưng lệnh vẫn cần khoá `ACCESS EXCLUSIVE` trong khoảnh khắc, nên nếu có truy vấn dài đang chạy thì nó phải xếp hàng và chặn mọi thứ phía sau. Cách an toàn là đặt `lock_timeout` ngắn rồi thử lại.
- **MySQL**: nhiều thao tác `ALTER` phải viết lại cả bảng và khoá lâu; cần dùng công cụ như `pt-online-schema-change` hoặc `gh-ost`.

**Thêm cột `NOT NULL` không gián đoạn** — chia thành nhiều bước qua nhiều lần triển khai:

1. Thêm cột cho phép `NULL`, không đặt giá trị mặc định nặng.
2. Sửa code để **ghi cả cột mới** (nhưng chưa đọc bắt buộc).
3. **Nạp dữ liệu theo từng lô nhỏ** cho các dòng cũ, tránh một `UPDATE` khổng lồ khoá bảng.
4. Thêm ràng buộc `NOT NULL` — trên Postgres nên thêm `CHECK ... NOT VALID` trước, `VALIDATE CONSTRAINT` sau để không phải quét bảng trong lúc giữ khoá nặng.

**Đổi tên cột không gián đoạn:** không đổi trực tiếp, vì code cũ và code mới cùng chạy trong lúc triển khai.

1. Thêm cột mới.
2. Ghi vào **cả hai cột** (qua code hoặc trigger).
3. Chép dữ liệu cũ sang theo từng lô.
4. Chuyển phần đọc sang cột mới, triển khai và theo dõi.
5. Ngừng ghi cột cũ, để yên một thời gian, rồi mới xoá.

Nguyên tắc chung: **ngừng dùng trong code trước, đổi schema sau**, và luôn backup trước các migration mang tính phá huỷ.

</details>

**24. Vì sao migration nên `forward-only` và idempotent? Nếu một migration đã xoá nhầm cột trên production, bạn khôi phục thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Forward-only** — chỉ tiến tới, muốn sửa thì viết migration mới chứ không rollback. Lý do: nhật ký sửa nhà không tẩy xoá trang cũ. Trên production, nhiều thay đổi **không thể đảo ngược thật sự** — `DROP COLUMN` rollback xong thì cột có lại nhưng **dữ liệu trong đó đã mất**. Ngoài ra, các môi trường đã chạy migration ở những thời điểm khác nhau, nên một lịch sử tuyến tính chỉ tiến về phía trước là thứ duy nhất tái lập được giống hệt ở mọi nơi.

**Idempotent** — chạy lại lần hai không gây lỗi (`CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`). Cần thiết vì migration có thể bị ngắt giữa chừng, bị chạy lại do deploy lỗi, hoặc chạy song song trên nhiều instance. Kèm theo đó là mỗi migration nên là **một thay đổi logic** và nằm gọn trong transaction khi engine cho phép.

**Khi đã xoá nhầm cột trên production:**

1. **Dừng ngay**, chặn thêm ghi vào bảng liên quan nếu có thể, không hoảng loạn sửa tiếp.
2. **Đánh giá mức thiệt hại** — cột đó còn nơi nào khác giữ dữ liệu không: replica chưa đồng bộ, bản sao phục vụ báo cáo, log ứng dụng, kho dữ liệu phân tích.
3. **Khôi phục từ backup bằng PITR** vào một database **riêng**, chọn mốc ngay trước khi migration chạy. Tuyệt đối không khôi phục đè lên production.
4. **Trích cột đó ra** từ bản khôi phục và **nạp ngược lại** theo khoá chính bằng migration mới.
5. **Rút kinh nghiệm**: migration phá huỷ phải backup trước, phải chạy thử trên bản sao của production, và nên theo quy trình hai nhịp — ngừng dùng trước, xoá sau vài tuần.

</details>

**25. Giải thích `normalization` (`1NF`, `2NF`, `3NF`). Khi nào bạn cố ý `denormalize` và đánh đổi những gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Chuẩn hoá** là quá trình tổ chức lại schema để loại bỏ dữ liệu lặp và các bất thường khi thêm, sửa, xoá:

- **1NF** — mỗi ô chứa **một giá trị nguyên tử**, không nhét danh sách vào một cột. Cột `phones` chứa `"090..., 091..."` là vi phạm; phải tách thành bảng riêng.
- **2NF** — đạt 1NF, và mọi cột không thuộc khoá phải phụ thuộc vào **toàn bộ** khoá chính, không chỉ một phần. Trong bảng `order_items` có khoá `(order_id, product_id)`, cột `product_name` chỉ phụ thuộc `product_id` nên phải đưa về bảng `products`.
- **3NF** — đạt 2NF, và không có cột nào phụ thuộc bắc cầu qua một cột không phải khoá. Bảng `users` chứa cả `city_id` lẫn `city_name` là vi phạm: `city_name` phụ thuộc `city_id` chứ không phụ thuộc người dùng.

Lợi ích: mỗi sự thật chỉ lưu một chỗ, sửa một nơi là xong, dữ liệu không thể tự mâu thuẫn với chính nó.

**Khi nào cố ý denormalize:** khi việc đọc trở thành điểm nghẽn thật sự và đã đo được — bảng tin cần join qua năm bảng, trang danh mục phải đếm số đánh giá cho mỗi sản phẩm, báo cáo tổng hợp trên hàng chục triệu dòng. Cách làm thường gặp: cột đếm sẵn (`comment_count`), sao chép giá trị ít đổi, bảng tổng hợp hoặc materialized view.

**Đánh đổi:** dữ liệu tồn tại ở nhiều nơi nên **có thể lệch nhau**; mỗi lần ghi phải cập nhật thêm chỗ, code phức tạp hơn và chậm hơn; cần cơ chế đồng bộ (trigger, job nền, tính lại định kỳ) cùng cách kiểm tra và sửa sai lệch. Nguyên tắc thực dụng: **chuẩn hoá trước, denormalize sau — và chỉ khi có số liệu chứng minh là cần.**

</details>
