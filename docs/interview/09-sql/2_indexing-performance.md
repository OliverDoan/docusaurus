---
sidebar_position: 2
title: "2. Indexing & Performance"
---

# Indexing & Performance

> *Đây là chủ đề phân biệt ứng viên mid-level và senior: không chỉ biết tạo index mà còn hiểu khi nào index phản tác dụng, đọc được EXPLAIN ANALYZE, và tư duy đo lường trước-sau khi tối ưu.*

:::note[Ghi nhớ nhanh]

- ⭐ **`B-tree` index** — tra cứu O(log n) thay vì full scan O(n), nhưng làm chậm INSERT/UPDATE/DELETE và tốn disk; đừng tạo thừa index.
- ⭐ **Đọc `EXPLAIN ANALYZE`** — phân biệt Seq Scan vs Index Scan, xem cost/rows/thời gian thực để biết index có được dùng không.
- **Khi nào index KHÔNG được dùng** — hàm bọc quanh cột, ép kiểu ngầm, `LIKE '%...'`, hoặc bảng nhỏ/selectivity thấp.
- **Composite & covering index** — thứ tự cột phải khớp query (leftmost prefix); covering index cho phép Index-Only Scan.
- **`N+1` query** — vòng lặp query con; gộp bằng JOIN hoặc batch/`IN (...)`.
- **Pagination** — `OFFSET` lớn chậm vì phải quét bỏ nhiều dòng; dùng keyset/seek pagination (`WHERE id > ...`).

:::

---

## Câu 1: Index hoạt động như thế nào? `[Intermediate]`

### Câu hỏi

> "Em hãy giải thích cơ chế B-tree index trong PostgreSQL. Tại sao đôi khi tạo quá nhiều index lại là vấn đề?"

### Giải thích lý thuyết

| Khía cạnh | Full Table Scan | B-tree Index Scan |
|-----------|-----------------|-------------------|
| Độ phức tạp | O(n) — duyệt toàn bộ row | O(log n) — đi từ root → leaf |
| Phù hợp khi | Bảng nhỏ, lấy phần lớn dữ liệu | Bảng lớn, lọc chọn lọc (selectivity cao) |
| Chi phí ẩn | Không có | Chậm INSERT/UPDATE/DELETE, tốn thêm disk I/O |

B-tree index lưu các giá trị cột theo thứ tự tăng dần trong cấu trúc cây cân bằng. Mỗi lần INSERT một row, PostgreSQL phải cập nhật tất cả các index trên bảng đó — càng nhiều index, ghi càng chậm.

### Code minh hoạ

```sql
-- Tạo bảng và dữ liệu mẫu
CREATE TABLE orders (
    id          BIGSERIAL PRIMARY KEY,
    user_id     INT NOT NULL,
    status      VARCHAR(20) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Không có index: full scan O(n)
EXPLAIN SELECT * FROM orders WHERE user_id = 42;
-- Kết quả: Seq Scan on orders (cost=0.00..2500.00 rows=1 ...)

-- Tạo index B-tree
CREATE INDEX idx_orders_user_id ON orders (user_id);

-- Có index: O(log n)
EXPLAIN SELECT * FROM orders WHERE user_id = 42;
-- Kết quả: Index Scan using idx_orders_user_id (cost=0.42..8.45 rows=1 ...)
```

### Đáp án mẫu

> "Em hiểu B-tree index như một cuốn sổ mục lục được sắp xếp: thay vì lật từng trang tìm từ khóa — O(n) — thì em tra mục lục và nhảy thẳng tới trang cần — O(log n). Tuy nhiên em luôn cân nhắc chi phí ẩn: mỗi index là một bản sao dữ liệu cần được cập nhật khi ghi. Ở dự án trước, bảng `transactions` có 12 index nên throughput INSERT chỉ đạt 800 row/s. Sau khi xóa 5 index không dùng, con số tăng lên 3.000 row/s."

---

## Câu 2: Khi nào index KHÔNG được dùng? `[Senior]`

### Câu hỏi

> "Em đã tạo index trên cột `email` nhưng query vẫn Seq Scan. Em sẽ debug như thế nào? Có những tình huống nào khiến planner bỏ qua index?"

### Giải thích lý thuyết

| Nguyên nhân | Ví dụ | Cách khắc phục |
|-------------|-------|----------------|
| Hàm bao cột trong WHERE | `WHERE LOWER(email) = '...'` | Dùng functional index hoặc viết lại query |
| Leading wildcard LIKE | `WHERE name LIKE '%john'` | Full-text search hoặc đảo chuỗi + index |
| Type mismatch | `WHERE int_col = '42'` (text) | Cast đúng kiểu hoặc sửa kiểu tham số |
| Low selectivity | `WHERE status = 'active'` khi 90% là active | Partial index hoặc chấp nhận Seq Scan |
| Planner chọn Seq Scan vì bảng nhỏ | Bảng vài nghìn row | Bình thường, Seq Scan có thể nhanh hơn |
| Statistics lỗi thời | Sau bulk insert không ANALYZE | Chạy `ANALYZE table_name` |

### Code minh hoạ

```sql
-- Tình huống 1: function trên cột — index bị bỏ qua
CREATE INDEX idx_users_email ON users (email);
EXPLAIN SELECT * FROM users WHERE LOWER(email) = 'alice@example.com'; -- Seq Scan!

-- Khắc phục: functional index
CREATE INDEX idx_users_email_lower ON users (LOWER(email));
EXPLAIN SELECT * FROM users WHERE LOWER(email) = 'alice@example.com'; -- Index Scan!

-- Tình huống 2: leading wildcard
EXPLAIN SELECT * FROM products WHERE name LIKE '%phone'; -- Seq Scan
-- Không thể fix với B-tree; cần pg_trgm hoặc full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_products_name_trgm ON products USING GIN (name gin_trgm_ops);

-- Tình huống 3: low selectivity — partial index
CREATE INDEX idx_orders_pending ON orders (created_at)
    WHERE status = 'pending'; -- Chỉ index row thực sự cần lọc
```

### Đáp án mẫu

> "Em sẽ chạy `EXPLAIN (ANALYZE, BUFFERS)` để xem planner có thực sự Seq Scan không và lý do tại sao. Thường thì em gặp 4 nhóm: hàm bao cột như `LOWER()`, leading wildcard `LIKE '%x'`, type mismatch khi ORM truyền string vào int column, hoặc low selectivity khi cột chỉ có vài giá trị phân biệt. Với low selectivity em ưu tiên partial index — index chỉ những row 'thiểu số' — thay vì cố ép planner dùng index không hiệu quả."

---

## Câu 3: Composite index và covering index `[Senior]`

### Câu hỏi

> "Em hãy giải thích leftmost prefix rule trong composite index. Covering index là gì và nó giúp gì cho performance?"

### Giải thích lý thuyết

Composite index `(a, b, c)` hoạt động theo quy tắc leftmost prefix:

| Query condition | Dùng được index không? |
|-----------------|----------------------|
| `WHERE a = 1` | Có |
| `WHERE a = 1 AND b = 2` | Có |
| `WHERE a = 1 AND b = 2 AND c = 3` | Có (toàn bộ) |
| `WHERE b = 2` | Không — bỏ qua cột đầu |
| `WHERE a = 1 AND c = 3` | Có nhưng chỉ dùng phần `a` |

**Covering index** (index-only scan): khi tất cả cột cần SELECT đều nằm trong index, PostgreSQL không cần truy cập heap (bảng chính), giảm I/O đáng kể.

### Code minh hoạ

```sql
-- Composite index: cột có selectivity cao đặt trước
CREATE INDEX idx_orders_user_status_date
    ON orders (user_id, status, created_at);

-- Dùng được (leftmost prefix)
EXPLAIN SELECT * FROM orders WHERE user_id = 42;
EXPLAIN SELECT * FROM orders WHERE user_id = 42 AND status = 'paid';

-- KHÔNG dùng được (bỏ cột đầu)
EXPLAIN SELECT * FROM orders WHERE status = 'paid'; -- Seq Scan

-- Covering index: thêm cột SELECT vào INCLUDE
CREATE INDEX idx_orders_covering
    ON orders (user_id, status)
    INCLUDE (total_amount, created_at);

-- Index-only scan: không cần truy cập heap
EXPLAIN (ANALYZE, BUFFERS)
SELECT total_amount, created_at
FROM orders
WHERE user_id = 42 AND status = 'paid';
-- Kết quả: Index Only Scan (heap fetches=0)
```

### Đáp án mẫu

> "Em luôn đặt cột equality trước, cột range sau trong composite index — ví dụ `(user_id, status, created_at)` cho query `WHERE user_id = ? AND status = ? AND created_at > ?`. Leftmost prefix có nghĩa là index có thể phục vụ nhiều query pattern khác nhau chỉ từ một index duy nhất. Còn covering index với `INCLUDE` em dùng khi muốn index-only scan — hoàn toàn tránh đọc heap, đặc biệt hiệu quả cho báo cáo đọc nhiều."

---

## Câu 4: Đọc EXPLAIN / EXPLAIN ANALYZE `[Intermediate]`

### Câu hỏi

> "Cho em xem output của `EXPLAIN ANALYZE` và giải thích em đọc nó như thế nào. Những con số nào em quan tâm nhất?"

### Giải thích lý thuyết

| Thông tin | Ý nghĩa | Cờ đỏ |
|-----------|---------|--------|
| `cost=X..Y` | X: chi phí khởi động; Y: tổng chi phí ước tính (planner) | Y rất cao so với thực tế |
| `rows=N` (estimate) | Số row planner dự đoán | Lệch nhiều so với actual rows |
| `actual time=X..Y` | Thời gian thực thi thực tế (ms) | Cao bất thường |
| `actual rows=N` | Số row thực tế trả về | Khác xa estimate → statistics cũ |
| `Buffers: shared hit / read` | Cache hit vs disk read | Nhiều `read` → buffer cache nhỏ hoặc cold |
| `loops=N` | Node chạy bao nhiêu lần | Nested loop với loops lớn là dấu hiệu xấu |

### Code minh hoạ

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT o.id, o.total_amount, u.email
FROM orders o
JOIN users u ON u.id = o.user_id
WHERE o.status = 'pending'
  AND o.created_at > NOW() - INTERVAL '7 days';

/*
Kết quả ví dụ:
Hash Join  (cost=120.00..980.00 rows=500 width=40)
           (actual time=3.2..45.7 rows=12480 loops=1)
  Buffers: shared hit=320 read=180
  ->  Seq Scan on orders
        Filter: (status = 'pending' AND created_at > ...)
        Rows Removed by Filter: 87520
  ->  Hash  (cost=80.00..80.00 rows=3200 width=24)
        ->  Seq Scan on users

Phát hiện vấn đề:
  - estimate rows=500 nhưng actual rows=12480 → statistics lỗi thời
  - Rows Removed by Filter: 87520 → cần index trên (status, created_at)
  - Seq Scan on users → cần index trên users.id (thường là PK, đã có)
*/

-- Sau khi tạo index và ANALYZE:
ANALYZE orders;
CREATE INDEX idx_orders_status_date ON orders (status, created_at DESC)
    WHERE status = 'pending';
```

### Đáp án mẫu

> "Em đọc EXPLAIN ANALYZE từ trong ra ngoài — node lá chạy trước. Em tập trung vào hai điểm: chênh lệch giữa estimated rows và actual rows báo hiệu statistics lỗi thời, và 'Rows Removed by Filter' lớn báo hiệu cần index. Em hay dùng `EXPLAIN (ANALYZE, BUFFERS)` để thấy bao nhiêu disk read thực sự xảy ra — nếu `shared read` cao, đó là I/O bottleneck, không chỉ là vấn đề index."

---

## Câu 5: N+1 query problem `[Intermediate]`

### Câu hỏi

> "N+1 query là gì? Em đã gặp vấn đề này chưa và xử lý thế nào?"

### Giải thích lý thuyết

N+1 xảy ra khi code lấy N đối tượng cha, rồi với mỗi đối tượng lại thực hiện thêm 1 query để lấy dữ liệu con — tổng cộng N+1 queries thay vì 1 query với JOIN.

| Cách xử lý | Kỹ thuật | Phù hợp khi |
|------------|----------|-------------|
| JOIN | `LEFT JOIN` trong 1 query | Quan hệ đơn giản, cần filter |
| IN subquery | `WHERE id IN (1,2,...,N)` | Lấy nhiều bản ghi liên quan |
| Eager loading | ORM: `include`, `preload`, `joinedload` | Dùng ORM framework |
| DataLoader | Batch + deduplicate trong 1 tick | GraphQL, resolver pattern |

### Code minh hoạ

```sql
-- Vấn đề N+1: lấy 100 users rồi lặp query orders từng người
-- Query 1: SELECT * FROM users LIMIT 100
-- Query 2..101: SELECT * FROM orders WHERE user_id = ?  (lặp 100 lần)

-- Giải pháp 1: JOIN trong 1 query
SELECT
    u.id,
    u.email,
    COUNT(o.id)          AS order_count,
    SUM(o.total_amount)  AS total_spent
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.email;

-- Giải pháp 2: IN batch (khi đã có danh sách user_id)
-- Thay vì 100 query riêng lẻ:
SELECT * FROM orders
WHERE user_id IN (1, 2, 3, ..., 100)  -- 1 query duy nhất
ORDER BY user_id, created_at DESC;

-- Giải pháp 3: subquery để lấy order mới nhất mỗi user
SELECT DISTINCT ON (user_id)
    user_id, id AS order_id, total_amount, created_at
FROM orders
ORDER BY user_id, created_at DESC;
```

### Đáp án mẫu

> "Em gặp N+1 ở màn hình dashboard hiển thị danh sách 50 khách hàng kèm đơn hàng gần nhất — tổng 51 queries mỗi lần load. Em phát hiện qua `pg_stat_statements` thấy cùng một query pattern lặp liên tục. Fix bằng `DISTINCT ON` để lấy đơn mới nhất mỗi user trong 1 query. Thời gian load trang giảm từ 1,2s xuống 80ms."

---

## Câu 6: Quy trình tối ưu query chậm `[Senior]`

### Câu hỏi

> "Một query trên production bỗng chậm. Em có quy trình xử lý như thế nào? Em dùng công cụ gì để không đoán mò?"

### Giải thích lý thuyết

Nguyên tắc: **đo trước, tối ưu sau** — không thêm index ngẫu nhiên.

| Bước | Hành động | Công cụ |
|------|-----------|---------|
| 1. Xác định | Query nào chậm nhất? | `pg_stat_statements` |
| 2. Hiểu baseline | Query mất bao lâu hiện tại? | `\timing` trong psql |
| 3. Phân tích | Planner làm gì? | `EXPLAIN (ANALYZE, BUFFERS)` |
| 4. Giả thuyết | Thiếu index? Statistics cũ? Bad plan? | Đọc output bước 3 |
| 5. Can thiệp | Tạo index / rewrite / ANALYZE | `CREATE INDEX CONCURRENTLY` |
| 6. Đo lại | Cải thiện bao nhiêu? | So sánh actual time |
| 7. Monitor | Vẫn ổn sau vài ngày? | `pg_stat_user_indexes` |

### Code minh hoạ

```sql
-- Bước 1: Tìm query chậm nhất (pg_stat_statements phải được enable)
SELECT
    LEFT(query, 80)                              AS query_snippet,
    calls,
    round(total_exec_time::numeric, 2)           AS total_ms,
    round((total_exec_time / calls)::numeric, 2) AS avg_ms,
    round(rows::numeric / calls, 1)              AS avg_rows
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;

-- Bước 2: EXPLAIN ANALYZE với BUFFERS
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT /* query chậm ở đây */ ...;

-- Bước 3: Tạo index không khóa bảng (CONCURRENTLY)
CREATE INDEX CONCURRENTLY idx_orders_new
    ON orders (user_id, status)
    INCLUDE (total_amount);

-- Bước 4: Cập nhật statistics nếu nghi ngờ lỗi thời
ANALYZE orders;

-- Bước 5: Kiểm tra index có được dùng không
SELECT
    indexrelname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE relname = 'orders'
ORDER BY idx_scan DESC;

-- Index chưa bao giờ được dùng (idx_scan = 0) → cân nhắc xóa
```

### Đáp án mẫu

> "Em không bao giờ tối ưu bằng cảm tính. Quy trình của em là: đo baseline với `pg_stat_statements`, chạy `EXPLAIN (ANALYZE, BUFFERS)` để đọc actual time và buffer hit/miss, rồi mới đưa ra giả thuyết. Tạo index dùng `CONCURRENTLY` để không lock bảng production. Sau đó đo lại và so sánh con số cụ thể. Ở công ty cũ em đã giảm avg_ms của một report query từ 4,5s xuống 120ms bằng composite index và rewrite subquery thành window function — không đoán mò, mọi bước đều có số liệu."

---

## Câu 7: Pagination — tại sao OFFSET lớn chậm? `[Senior]`

### Câu hỏi

> "Tại sao `LIMIT 20 OFFSET 100000` chậm hơn nhiều so với `LIMIT 20 OFFSET 0`? Em sẽ thiết kế cursor-based pagination như thế nào?"

### Giải thích lý thuyết

| Phương pháp | Cơ chế | Vấn đề |
|-------------|--------|--------|
| OFFSET pagination | Đọc và bỏ qua N row đầu, lấy 20 row tiếp theo | OFFSET 100000 = đọc 100020 row, bỏ 100000 |
| Keyset / cursor pagination | `WHERE id > last_seen_id LIMIT 20` | Chỉ đọc đúng 20 row, hiệu quả hằng số |

OFFSET không thể "nhảy cóc" trong B-tree — PostgreSQL vẫn phải duyệt qua tất cả row bị bỏ qua, chi phí tăng tuyến tính O(offset).

### Code minh hoạ

```sql
-- Vấn đề: OFFSET lớn đọc rất nhiều row thừa
EXPLAIN ANALYZE
SELECT id, title, created_at FROM posts
ORDER BY created_at DESC
LIMIT 20 OFFSET 100000;
-- actual time có thể > 2000ms dù chỉ lấy 20 row

-- Giải pháp: Keyset pagination
-- Trang đầu
SELECT id, title, created_at
FROM posts
ORDER BY created_at DESC, id DESC
LIMIT 20;

-- Trang tiếp theo: dùng giá trị cuối của trang trước
-- (last_created_at = '2024-01-15 10:30:00', last_id = 5432)
SELECT id, title, created_at
FROM posts
WHERE (created_at, id) < ('2024-01-15 10:30:00', 5432)
ORDER BY created_at DESC, id DESC
LIMIT 20;

-- Index hỗ trợ keyset pagination
CREATE INDEX idx_posts_cursor ON posts (created_at DESC, id DESC);

-- So sánh thực tế (bảng 1 triệu row):
-- OFFSET 100000: ~1800ms
-- Keyset tương đương: ~2ms
```

### Đáp án mẫu

> "OFFSET lớn chậm vì database vẫn phải đọc và đếm tất cả row trước đó dù không trả về — chi phí tăng tuyến tính theo offset. Giải pháp em thường dùng là keyset pagination: thay vì 'bỏ qua N row', em dùng `WHERE (created_at, id) < (cursor_value)` để nhảy thẳng vào điểm cần đọc. Kỹ thuật này giữ performance hằng số bất kể đang ở trang thứ mấy. Hạn chế duy nhất là không thể nhảy tới trang tùy ý — chỉ đi tiếp hoặc lùi — nhưng với infinite scroll hay API phân trang thì hoàn toàn phù hợp."

---

## Bẫy thường gặp khi trả lời

| Sai lầm | Đúng là |
|---------|---------|
| "Cứ cột nào WHERE là tạo index" | Cân nhắc selectivity, chi phí write, và liệu planner có dùng không |
| "Index luôn nhanh hơn Seq Scan" | Với bảng nhỏ hoặc query lấy phần lớn dữ liệu, Seq Scan nhanh hơn |
| "Composite index `(a,b)` thay thế được index riêng trên `(b)`" | Không — leftmost prefix rule: index `(a,b)` không phục vụ `WHERE b = ?` |
| "EXPLAIN là đủ để tối ưu" | Cần `EXPLAIN ANALYZE` để thấy actual time và rows thực tế |
| "Xóa index cũ trực tiếp là được" | Kiểm tra `pg_stat_user_indexes` trước — index đang dùng mà xóa là vỡ performance |
| "Keyset pagination dùng được mọi nơi" | Không hỗ trợ nhảy tới trang tùy ý; OFFSET vẫn cần cho một số use case |
