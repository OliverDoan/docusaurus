---
sidebar_position: 11
title: "11. Indexes — Chỉ mục"
---

# Indexes — Chỉ mục

Index (chỉ mục) giống như mục lục của một cuốn sách, giúp cơ sở dữ liệu tìm đúng hàng cần lấy mà không phải quét hết cả bảng. Đây là công cụ quan trọng nhất để tăng tốc truy vấn trên bảng lớn. Bài này giải thích index là gì, các loại index trong PostgreSQL (B-tree, Hash, GIN, GiST, BRIN), cách dùng EXPLAIN để kiểm tra, và cả cái giá phải trả khi tạo index sai chỗ.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Index như "mục lục sách"** — giúp DB nhảy thẳng tới hàng cần thay vì quét toàn bảng (full table scan), tăng tốc đọc rất nhiều.
- **B-tree là loại mặc định** — hợp cho `=`, so sánh khoảng và `ORDER BY`; ngoài ra còn `Hash`, `GIN`, `GiST`, `BRIN` cho nhu cầu đặc thù.
- **Nên index** — cột hay tìm/lọc, cột khoá ngoại để tăng tốc `JOIN`, và composite index cho query lọc nhiều điều kiện.
- **Kiểm tra bằng `EXPLAIN`** — xem DB có thực sự dùng index hay vẫn Seq Scan.
- ⭐ **Cái giá của index** — tốn dung lượng và làm CHẬM ghi (mỗi `INSERT`/`UPDATE` phải cập nhật index), nên chỉ index cột thực sự cần.

:::

---

## Mục lục

- [Vì sao cần index?](#vì-sao-cần-index)
- [Index là gì](#index-là-gì)
- [Managing Indexes](#managing-indexes)
- [Các loại Index trong PostgreSQL](#các-loại-index-trong-postgresql)
- [Query Optimization với Index](#query-optimization-với-index)
- [Cái giá của Index](#cái-giá-của-index)

---

## Vì sao cần index?

**Vấn đề:**

```sql
-- Bảng users có hàng triệu dòng, KHÔNG có index trên email.
-- Để tìm 1 hàng, DB phải QUÉT TOÀN BẢNG (full table scan) — đọc lần lượt
-- từng dòng cho tới khi khớp => cực chậm khi bảng lớn.
SELECT * FROM users WHERE email = 'thuan@example.com';

-- JOIN và ORDER BY trên cột không có index cũng phải quét/sắp xếp toàn bộ => chậm.
SELECT * FROM orders o
JOIN users u ON o.user_id = u.id   -- user_id không index => quét cả bảng
ORDER BY o.created_at;             -- created_at không index => sắp xếp toàn bộ
```

**Giải pháp:**

```sql
-- INDEX (thường là B-tree) là cấu trúc tra cứu giống "mục lục sách":
-- giúp DB nhảy thẳng tới hàng cần thay vì quét hết => tăng tốc đọc rất nhiều.
CREATE INDEX idx_users_email ON users(email);

-- Cùng câu truy vấn, giờ DB dùng index để tìm trực tiếp => nhanh hơn nhiều.
SELECT * FROM users WHERE email = 'thuan@example.com';

-- ĐÁNH ĐỔI: index tốn dung lượng và làm CHẬM ghi (mỗi INSERT/UPDATE phải
-- cập nhật cả index) => chỉ index cột hay dùng để tìm/lọc/join.
```

:::tip[Dùng thực tế]
- Index cột `email`/`username` để tra cứu đăng nhập, tìm người dùng nhanh.
- Index khoá ngoại (`user_id`, `order_id`...) để tăng tốc JOIN giữa các bảng.
- Composite index cho query lọc nhiều điều kiện cùng lúc (ví dụ `WHERE status = ... AND created_at > ...`).
- Cân nhắc KHÔNG index cột hiếm khi tìm/lọc — vì chỉ tốn dung lượng và làm chậm ghi.
:::

---

## Index là gì

Index (chỉ mục) là một cấu trúc dữ liệu phụ, được lưu tách biệt với bảng, giúp cơ sở dữ liệu tìm kiếm hàng dữ liệu nhanh hơn mà không cần quét toàn bộ bảng.

**Ví von dễ hiểu:** Hãy tưởng tượng một cuốn sách giáo khoa 500 trang. Nếu bạn muốn tìm từ "transaction", bạn có hai cách:
1. Đọc từng trang từ đầu đến cuối — tốn thời gian (full scan).
2. Tra mục lục ở cuối sách, tìm trang chứa từ đó ngay lập tức.

Index trong database chính là mục lục đó.

**Độ phức tạp thời gian:**

| Phương pháp | Ký hiệu Big-O | Ý nghĩa |
|---|---|---|
| Full Table Scan (không có index) | O(n) | Phải đọc qua n hàng |
| B-tree Index Scan | O(log n) | Tìm nhị phân trên cây cân bằng |

Với bảng 1 triệu hàng, B-tree chỉ cần khoảng 20 bước so sánh thay vì 1.000.000 bước.

```sql
-- Không có index: phải quét toàn bộ bảng orders (O(n))
SELECT * FROM orders WHERE customer_id = 42;

-- Sau khi tạo index trên customer_id: tìm B-tree (O(log n))
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
SELECT * FROM orders WHERE customer_id = 42;
```

:::info[Phân tích]
B-tree (Balanced Tree) là cấu trúc cây có chiều cao cân bằng. Mỗi lá cây lưu giá trị cột và con trỏ tới hàng dữ liệu thật trong bảng (gọi là heap). PostgreSQL tự duy trì cây này cân bằng sau mỗi INSERT, UPDATE, DELETE.
:::

---

## Managing Indexes

### Tạo Index cơ bản

```sql
-- Cú pháp cơ bản
CREATE INDEX ten_index ON ten_bang(ten_cot);

-- Ví dụ: tạo index trên email để tìm kiếm nhanh
CREATE INDEX idx_users_email ON users(email);

-- Index đảm bảo giá trị duy nhất
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);
```

### Composite Index (Index nhiều cột)

Composite index được tạo trên nhiều cột. **Thứ tự cột cực kỳ quan trọng** — PostgreSQL chỉ có thể dùng index từ cột đầu tiên (leftmost prefix).

```sql
-- Tạo composite index: (last_name, first_name)
CREATE INDEX idx_employees_name ON employees(last_name, first_name);

-- DÙNG được index (có last_name — leftmost prefix)
SELECT * FROM employees WHERE last_name = 'Nguyen';
SELECT * FROM employees WHERE last_name = 'Nguyen' AND first_name = 'An';

-- KHÔNG dùng được index (bỏ qua cột đầu tiên)
SELECT * FROM employees WHERE first_name = 'An';
```

:::warning[Cần lưu ý]
Khi thiết kế composite index, hãy đặt cột được lọc thường xuyên nhất (high selectivity) lên đầu. Ví dụ: nếu query thường filter theo `status` rồi mới theo `created_at`, hãy tạo `(status, created_at)` chứ không phải `(created_at, status)`.
:::

### Partial Index (Index một phần)

Partial index chỉ đánh chỉ mục cho các hàng thỏa điều kiện WHERE, giúp index nhỏ gọn và nhanh hơn.

```sql
-- Chỉ đánh index các đơn hàng chưa xử lý (is_processed = false)
-- Không lãng phí không gian cho các đơn đã xử lý
CREATE INDEX idx_orders_pending
    ON orders(created_at)
    WHERE is_processed = false;

-- Query này sẽ dùng partial index trên
SELECT * FROM orders
WHERE is_processed = false
  AND created_at > NOW() - INTERVAL '7 days';
```

### Expression Index (Index biểu thức)

Index trên kết quả của một hàm hoặc biểu thức.

```sql
-- Tìm kiếm email không phân biệt hoa thường
CREATE INDEX idx_users_email_lower ON users(LOWER(email));

-- Query phải dùng ĐÚNG biểu thức đó thì mới dùng được index
SELECT * FROM users WHERE LOWER(email) = 'thuan@example.com';
```

### Xóa Index

```sql
-- Xóa index
DROP INDEX idx_users_email;

-- Xóa nếu tồn tại (an toàn hơn)
DROP INDEX IF EXISTS idx_users_email;
```

### CREATE INDEX CONCURRENTLY (Môi trường production)

```sql
-- Index thông thường: LOCK toàn bộ bảng trong lúc tạo
-- Không dùng được trên production đang có traffic!
CREATE INDEX idx_orders_customer_id ON orders(customer_id);

-- CONCURRENTLY: KHÔNG lock bảng, bảng vẫn đọc/ghi được
-- Tốn thời gian hơn nhưng an toàn cho production
CREATE INDEX CONCURRENTLY idx_orders_customer_id ON orders(customer_id);
```

:::tip[Mẹo]
Luôn dùng `CREATE INDEX CONCURRENTLY` khi làm việc trên database production đang phục vụ người dùng. Lệnh này chạy chậm hơn nhưng không gây downtime. Nếu lệnh bị interrupt giữa chừng, index có thể ở trạng thái "invalid" — kiểm tra bằng `SELECT * FROM pg_indexes WHERE tablename = 'ten_bang'`.
:::

---

## Các loại Index trong PostgreSQL

| Loại Index | Toán tử hỗ trợ | Use Case điển hình |
|---|---|---|
| **B-tree** (mặc định) | `=`, `<`, `>`, `<=`, `>=`, `BETWEEN`, `IN`, `LIKE 'abc%'` | Hầu hết các cột thông thường (số, text, ngày) |
| **Hash** | Chỉ `=` | So sánh bằng thuần túy, ít dùng |
| **GIN** | `@>`, `<@`, `&&`, `@@` (full-text) | Mảng (`ARRAY`), JSONB, full-text search |
| **GiST** | Geometric, range, nearest-neighbor | Tọa độ địa lý, range types, PostGIS |
| **BRIN** | `=`, `<`, `>` (correlation cao) | Bảng rất lớn có dữ liệu tự nhiên tuần tự (logs, time-series) |

```sql
-- B-tree (mặc định, không cần khai báo USING)
CREATE INDEX idx_products_price ON products(price);

-- Hash index
CREATE INDEX idx_sessions_token ON sessions USING HASH (token);

-- GIN index cho JSONB
CREATE INDEX idx_events_data ON events USING GIN (data);

-- Truy vấn JSONB dùng GIN index
SELECT * FROM events WHERE data @> '{"type": "click"}';

-- BRIN cho bảng log lớn (dữ liệu tuần tự theo thời gian)
CREATE INDEX idx_logs_created_brin ON logs USING BRIN (created_at);
```

:::info[Phân tích]
**GIN vs GiST cho full-text search:** GIN cho tốc độ đọc nhanh hơn nhưng tốn dung lượng và chậm hơn khi ghi. GiST cân bằng hơn. Với full-text search ít thay đổi, dùng GIN. Với dữ liệu thay đổi liên tục, GiST phù hợp hơn.
:::

---

## Query Optimization với Index

### EXPLAIN và EXPLAIN ANALYZE

`EXPLAIN` cho biết PostgreSQL dự kiến thực thi query như thế nào. `EXPLAIN ANALYZE` thực sự chạy query và trả về số liệu thực tế.

```sql
-- EXPLAIN: kế hoạch dự kiến (không chạy query)
EXPLAIN
SELECT * FROM orders WHERE customer_id = 42;

-- EXPLAIN ANALYZE: chạy query thật và đo thời gian
EXPLAIN ANALYZE
SELECT * FROM orders WHERE customer_id = 42;

-- Output mẫu khi KHÔNG có index (Seq Scan):
-- Seq Scan on orders  (cost=0.00..18340.00 rows=1 width=64)
--                     (actual time=0.021..89.432 rows=1 loops=1)
--   Filter: (customer_id = 42)

-- Output mẫu khi CÓ index (Index Scan):
-- Index Scan using idx_orders_customer_id on orders
--                     (cost=0.43..8.45 rows=1 width=64)
--                     (actual time=0.018..0.020 rows=1 loops=1)
--   Index Cond: (customer_id = 42)
```

**Đọc kết quả EXPLAIN:**

| Thuật ngữ | Ý nghĩa |
|---|---|
| `Seq Scan` | Quét toàn bộ bảng — không dùng index |
| `Index Scan` | Dùng index, đọc heap để lấy dữ liệu |
| `Index Only Scan` | Dùng index, KHÔNG cần đọc heap (dữ liệu đủ trong index) |
| `Bitmap Index Scan` | Dùng index theo batch, hiệu quả khi trả về nhiều hàng |
| `cost=X..Y` | Chi phí ước tính (X: khởi động, Y: tổng) |
| `rows=N` | Số hàng ước tính trả về |
| `actual time=X..Y` | Thời gian thực tế (ms) — chỉ có trong ANALYZE |

### Khi nào Index KHÔNG được dùng

```sql
-- 1. Dùng hàm trên cột — PostgreSQL không thể dùng index trên (price)
--    THAY VÀO ĐÓ: tạo expression index LOWER(email)
SELECT * FROM products WHERE ROUND(price) = 100;

-- 2. Leading wildcard LIKE — không thể dùng B-tree index
SELECT * FROM products WHERE name LIKE '%shirt%';  -- KHÔNG dùng index
SELECT * FROM products WHERE name LIKE 'shirt%';   -- DÙNG được B-tree index

-- 3. Type mismatch — cột là INTEGER nhưng so sánh với TEXT
SELECT * FROM orders WHERE customer_id = '42';     -- ép kiểu ngầm, có thể miss index

-- 4. Selectivity thấp — cột chỉ có vài giá trị phân biệt
--    Planner tự quyết định Seq Scan rẻ hơn Index Scan
SELECT * FROM orders WHERE status IN ('pending', 'shipped', 'done');
-- Nếu 80% hàng là 'done', planner có thể bỏ qua index
```

:::warning[Cần lưu ý]
PostgreSQL query planner thông minh — đôi khi nó chủ động bỏ qua index vì Seq Scan rẻ hơn (bảng nhỏ, hoặc phải lấy phần lớn hàng). Thấy `Seq Scan` không có nghĩa là thiếu index; hãy đọc kỹ số `cost` và `rows` trước khi kết luận.
:::

:::tip[Mẹo]
Dùng `EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)` để xem thêm thông tin cache hit/miss — giúp phân biệt query chậm do I/O hay do CPU.
:::

---

## Cái giá của Index

Index không phải miễn phí. Trước khi tạo, hãy cân nhắc:

**Chi phí ghi:** Mỗi lần INSERT, UPDATE, DELETE trên bảng, PostgreSQL phải cập nhật tất cả index liên quan. Bảng có 10 index = mỗi INSERT phải ghi vào 11 nơi.

```sql
-- Ví dụ: bảng orders có 5 index
-- Khi INSERT 1 hàng:
-- 1. Ghi vào heap (bảng thật)
-- 2. Cập nhật idx_orders_customer_id
-- 3. Cập nhật idx_orders_status
-- 4. Cập nhật idx_orders_created_at
-- 5. Cập nhật idx_orders_total_amount
-- 6. Cập nhật idx_orders_product_id
-- => 6 lần ghi thay vì 1

INSERT INTO orders(customer_id, status, created_at, total_amount, product_id)
VALUES (42, 'pending', NOW(), 150000, 7);
```

**Chi phí lưu trữ:** Index chiếm dung lượng disk riêng. Một B-tree index trên cột TEXT lớn có thể chiếm dung lượng tương đương bảng gốc.

```sql
-- Kiểm tra kích thước index
SELECT
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE tablename = 'orders'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Kiểm tra index có thực sự được dùng không
SELECT
    indexname,
    idx_scan AS so_lan_dung,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename = 'orders'
ORDER BY idx_scan;
-- idx_scan = 0: index chưa bao giờ được dùng => cân nhắc xóa
```

:::warning[Cần lưu ý]
**Đừng index bừa.** Nguyên tắc thực tế:
- Chỉ tạo index khi có query thực tế cần tối ưu (dùng EXPLAIN để xác nhận).
- Ưu tiên index trên cột trong mệnh đề WHERE, JOIN ON, ORDER BY, GROUP BY.
- Định kỳ dùng `pg_stat_user_indexes` để tìm và xóa index không được dùng.
- Với OLTP (nhiều ghi), ít index hơn thường tốt hơn. Với OLAP/reporting (nhiều đọc), có thể index nhiều hơn.
:::

| Tình huống | Nên tạo Index? |
|---|---|
| Cột xuất hiện thường xuyên trong WHERE | Có |
| Cột dùng cho JOIN giữa hai bảng lớn | Có |
| Cột có giá trị gần như duy nhất (high cardinality) | Có |
| Cột chỉ có 2-3 giá trị phân biệt (low cardinality) | Cân nhắc partial index |
| Cột hiếm khi được query | Không |
| Bảng nhỏ dưới vài nghìn hàng | Thường không cần |
| Bảng ghi rất nhiều (log, event stream) | Hạn chế, cân nhắc BRIN |
