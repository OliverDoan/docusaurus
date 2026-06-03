---
sidebar_position: 15
title: "15. Tối ưu hiệu năng"
---

# Tối ưu hiệu năng

---

## Mục lục

- [Phân tích câu lệnh với EXPLAIN](#phân-tích-câu-lệnh-với-explain)
- [Tìm query chậm với pg_stat_statements](#tìm-query-chậm-với-pg_stat_statements)
- [Kỹ thuật tối ưu tổng quan](#kỹ-thuật-tối-ưu-tổng-quan)
- [Sử dụng Index hiệu quả](#sử-dụng-index-hiệu-quả)
- [Tối ưu JOIN](#tối-ưu-join)
- [Giảm thiểu Subquery](#giảm-thiểu-subquery)
- [Chọn lọc cột cần thiết](#chọn-lọc-cột-cần-thiết)
- [Pagination và Batch Update](#pagination-và-batch-update)
- [Checklist tối ưu](#checklist-tối-ưu)

---

## Phân tích câu lệnh với EXPLAIN

PostgreSQL cung cấp lệnh `EXPLAIN` để hiển thị kế hoạch thực thi (execution plan) mà query planner chọn, giúp xác định điểm nghẽn cổ chai.

### EXPLAIN — kế hoạch ước tính

```sql
EXPLAIN
SELECT o.id, c.name, o.total_amount
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.status = 'pending'
  AND o.created_at >= '2025-01-01';
```

Kết quả trả về dạng cây, mỗi node có dạng:

```
Hash Join  (cost=120.45..980.30 rows=450 width=52)
  Hash Cond: (o.customer_id = c.id)
  ->  Seq Scan on orders o  (cost=0.00..820.00 rows=450 width=28)
        Filter: ((status = 'pending') AND (created_at >= '2025-01-01'))
  ->  Hash  (cost=60.00..60.00 rows=4836 width=28)
        ->  Seq Scan on customers c  (cost=0.00..60.00 rows=4836 width=28)
```

| Thành phần | Ý nghĩa |
|---|---|
| `cost=X..Y` | X: chi phí khởi động, Y: tổng chi phí ước tính (đơn vị tương đối) |
| `rows=N` | Số hàng ước tính trả về |
| `width=W` | Kích thước trung bình một hàng (bytes) |

### EXPLAIN ANALYZE — thực thi và đo thực tế

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT o.id, c.name, o.total_amount
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.status = 'pending'
  AND o.created_at >= '2025-01-01';
```

:::warning[Cần lưu ý]
`EXPLAIN ANALYZE` **thực sự chạy** câu lệnh. Với `INSERT`, `UPDATE`, `DELETE` hãy bọc trong transaction rồi rollback để tránh thay đổi dữ liệu thật.

```sql
BEGIN;
EXPLAIN ANALYZE DELETE FROM logs WHERE created_at < '2024-01-01';
ROLLBACK;
```
:::

Kết quả bổ sung thông tin thực tế:

```
Seq Scan on orders o  (cost=0.00..820.00 rows=450 width=28)
                      (actual time=0.042..18.730 rows=312 loops=1)
  Filter: ((status = 'pending') AND (created_at >= '2025-01-01'))
  Rows Removed by Filter: 15688
  Buffers: shared hit=220 read=80
```

### Các loại node phổ biến

| Node | Mô tả | Hiệu quả |
|---|---|---|
| **Seq Scan** | Quét toàn bảng | Chậm trên bảng lớn nếu lọc ít hàng |
| **Index Scan** | Dùng B-tree index, truy cập heap theo pointer | Tốt khi selectivity cao |
| **Bitmap Index Scan** | Tạo bitmap từ index rồi fetch heap | Tốt khi trả về nhiều hàng có index |
| **Index Only Scan** | Lấy dữ liệu thẳng từ index (covering index) | Rất nhanh, không đụng heap |
| **Nested Loop** | Với mỗi hàng outer, duyệt inner | Tốt khi inner nhỏ và có index |
| **Hash Join** | Xây hash table từ bảng nhỏ hơn | Tốt cho bảng lớn, không cần sort |
| **Merge Join** | Merge hai tập đã sort | Tốt khi cả hai đã có index sắp xếp |

:::info[Phân tích]
Khi `actual rows` chênh lệch nhiều so với `rows` ước tính (gấp 10 lần trở lên), planner đang dùng thông tin thống kê lỗi thời. Chạy `ANALYZE table_name;` để cập nhật.
:::

---

## Tìm query chậm với pg_stat_statements

Extension `pg_stat_statements` lưu thống kê tất cả query đã thực thi, rất hữu ích để tìm query cần tối ưu trước tiên.

```sql
-- Kích hoạt extension (cần quyền superuser)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Top 10 query tốn thời gian tổng cộng nhiều nhất
SELECT
    query,
    calls,
    round(total_exec_time::numeric, 2)   AS total_ms,
    round(mean_exec_time::numeric, 2)    AS avg_ms,
    round(stddev_exec_time::numeric, 2)  AS stddev_ms,
    rows
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;

-- Query chậm nhất theo thời gian trung bình (chạy ít nhưng mỗi lần lâu)
SELECT
    query,
    calls,
    round(mean_exec_time::numeric, 2) AS avg_ms
FROM pg_stat_statements
WHERE calls > 50
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Reset thống kê sau khi đã xử lý
SELECT pg_stat_statements_reset();
```

:::tip[Mẹo]
Kết hợp `pg_stat_statements` với `EXPLAIN ANALYZE` theo quy trình: tìm query nặng nhất từ `pg_stat_statements`, sau đó chạy `EXPLAIN ANALYZE` trên query đó trong môi trường staging để phân tích chi tiết.
:::

---

## Kỹ thuật tối ưu tổng quan

Trước khi đi vào từng kỹ thuật cụ thể, đây là các hướng tiếp cận theo thứ tự ưu tiên:

1. **Đo trước, tối ưu sau** — dùng `EXPLAIN ANALYZE` và `pg_stat_statements` xác định đúng điểm nghẽn
2. **Index đúng chỗ** — giải quyết được phần lớn vấn đề hiệu năng
3. **Viết lại query** — loại bỏ correlated subquery, tránh hàm trên cột trong `WHERE`
4. **Giảm dữ liệu xử lý** — chọn ít cột hơn, lọc sớm hơn
5. **Điều chỉnh cấu hình** — `work_mem`, `shared_buffers`, `effective_cache_size`

---

## Sử dụng Index hiệu quả

### Index trên cột WHERE, JOIN, ORDER BY

```sql
-- Tạo index đơn trên cột lọc thường xuyên
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_created_at ON orders (created_at);

-- Composite index: thứ tự cột quan trọng
-- Cột có selectivity cao nhất (lọc được nhiều hàng nhất) đặt trước
CREATE INDEX idx_orders_status_created
    ON orders (status, created_at);

-- Query sau tận dụng được index trên
SELECT * FROM orders
WHERE status = 'pending'
  AND created_at >= '2025-01-01';
```

:::info[Phân tích]
Composite index `(status, created_at)` hỗ trợ query lọc theo `status` đơn thuần hoặc cả hai cột. Ngược lại, index `(created_at, status)` chỉ hỗ trợ khi lọc theo `created_at` ở đầu điều kiện.
:::

### Covering Index — Index Only Scan

Covering index lưu thêm cột dữ liệu vào index, cho phép trả về kết quả mà không cần truy cập heap.

```sql
-- Covering index với INCLUDE
CREATE INDEX idx_orders_covering
    ON orders (status, created_at)
    INCLUDE (id, total_amount, customer_id);

-- Query này sẽ dùng Index Only Scan — không đụng bảng chính
SELECT id, total_amount, customer_id
FROM orders
WHERE status = 'pending'
  AND created_at >= '2025-01-01';
```

### Tránh để hàm vô hiệu hóa index

```sql
-- SAI: hàm trên cột làm index vô dụng
SELECT * FROM users WHERE LOWER(email) = 'alice@example.com';

-- ĐÚNG: tạo functional index
CREATE INDEX idx_users_email_lower ON users (LOWER(email));
SELECT * FROM users WHERE LOWER(email) = 'alice@example.com';

-- SAI: ép kiểu ngầm
SELECT * FROM orders WHERE order_ref = 12345;  -- order_ref là VARCHAR

-- ĐÚNG: khớp kiểu dữ liệu
SELECT * FROM orders WHERE order_ref = '12345';
```

---

## Tối ưu JOIN

### Join trên cột có index

```sql
-- Đảm bảo cột join có index
CREATE INDEX idx_orders_customer_id ON orders (customer_id);
CREATE INDEX idx_order_items_order_id ON order_items (order_id);

-- PostgreSQL sẽ chọn Index Scan thay Seq Scan khi join
SELECT c.name, COUNT(o.id) AS order_count
FROM customers c
JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.name;
```

### Lọc sớm để giảm kích thước bảng trước khi JOIN

```sql
-- CHƯA TỐT: join toàn bộ rồi mới lọc
SELECT c.name, o.total_amount
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.created_at >= '2025-01-01'
  AND o.status = 'completed';

-- TỐT HƠN: dùng subquery hoặc CTE để lọc trước
WITH recent_orders AS (
    SELECT customer_id, total_amount
    FROM orders
    WHERE created_at >= '2025-01-01'
      AND status = 'completed'
)
SELECT c.name, ro.total_amount
FROM customers c
JOIN recent_orders ro ON ro.customer_id = c.id;
```

### Tránh tích Descartes (Cartesian Product)

```sql
-- NGUY HIỂM: quên điều kiện ON gây tích Descartes
SELECT * FROM orders, customers;  -- N * M hàng!

-- ĐÚNG: luôn khai báo điều kiện join rõ ràng
SELECT o.id, c.name
FROM orders o
JOIN customers c ON c.id = o.customer_id;
```

:::warning[Cần lưu ý]
Khi join nhiều hơn 4 bảng, PostgreSQL có thể tốn thời gian lập kế hoạch. Dùng `SET join_collapse_limit = 1;` trong session để ép planner tôn trọng thứ tự join bạn viết, sau đó thử nghiệm thứ tự khác nhau.
:::

---

## Giảm thiểu Subquery

### Đổi correlated subquery sang JOIN

```sql
-- CHẬM: correlated subquery chạy lại mỗi hàng outer
SELECT p.name, p.price,
       (SELECT AVG(price) FROM products WHERE category_id = p.category_id) AS avg_price
FROM products p;

-- NHANH HƠN: tính AVG một lần qua JOIN
SELECT p.name, p.price, ca.avg_price
FROM products p
JOIN (
    SELECT category_id, AVG(price) AS avg_price
    FROM products
    GROUP BY category_id
) ca ON ca.category_id = p.category_id;

-- Hoặc dùng window function (gọn hơn)
SELECT name, price,
       AVG(price) OVER (PARTITION BY category_id) AS avg_price
FROM products;
```

### Dùng EXISTS thay IN với subquery lớn

```sql
-- IN: load toàn bộ danh sách vào bộ nhớ
SELECT * FROM customers
WHERE id IN (SELECT customer_id FROM orders WHERE status = 'vip');

-- EXISTS: dừng ngay khi tìm thấy kết quả đầu tiên
SELECT * FROM customers c
WHERE EXISTS (
    SELECT 1 FROM orders o
    WHERE o.customer_id = c.id
      AND o.status = 'vip'
);
```

:::tip[Mẹo]
`EXISTS` thường nhanh hơn `IN` khi subquery trả về nhiều hàng. Ngược lại, `IN` với danh sách giá trị cố định nhỏ (dưới 100 phần tử) thì không có sự khác biệt đáng kể.
:::

### Dùng CTE để tránh tính toán lặp

```sql
-- Tính toán phức tạp một lần, dùng nhiều lần
WITH order_stats AS (
    SELECT
        customer_id,
        COUNT(*)        AS order_count,
        SUM(total_amount) AS lifetime_value
    FROM orders
    WHERE status = 'completed'
    GROUP BY customer_id
)
SELECT
    c.name,
    os.order_count,
    os.lifetime_value,
    CASE
        WHEN os.lifetime_value > 10000 THEN 'VIP'
        WHEN os.lifetime_value > 1000  THEN 'Regular'
        ELSE 'New'
    END AS tier
FROM customers c
JOIN order_stats os ON os.customer_id = c.id;
```

---

## Chọn lọc cột cần thiết

### Tránh `SELECT *`

```sql
-- KHÔNG NÊN: lấy toàn bộ cột kể cả TEXT, JSONB lớn
SELECT * FROM products WHERE category_id = 5;

-- NÊN: chỉ lấy cột thực sự cần
SELECT id, name, price, stock_quantity
FROM products
WHERE category_id = 5;
```

Lý do tránh `SELECT *`:

| Vấn đề | Giải thích |
|---|---|
| **I/O tốn kém** | Đọc thêm dữ liệu không cần từ disk và buffer |
| **Mất Index Only Scan** | Cần truy cập heap dù covering index có sẵn |
| **Tốn băng thông mạng** | Truyền dữ liệu thừa về client |
| **Dễ vỡ khi thay đổi schema** | Code phụ thuộc vào thứ tự cột |

---

## Pagination và Batch Update

### Keyset Pagination thay OFFSET lớn

```sql
-- CHẬM: OFFSET lớn phải đọc và bỏ N hàng trước
SELECT id, name, created_at
FROM products
ORDER BY created_at DESC
OFFSET 50000 LIMIT 20;

-- NHANH: Keyset pagination dùng giá trị cursor từ trang trước
-- Lần đầu
SELECT id, name, created_at
FROM products
ORDER BY created_at DESC, id DESC
LIMIT 20;

-- Các trang tiếp theo: truyền vào (last_created_at, last_id) từ kết quả trước
SELECT id, name, created_at
FROM products
WHERE (created_at, id) < ('2025-06-01 10:00:00', 9820)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

:::info[Phân tích]
Keyset pagination sử dụng được index trên `(created_at, id)` và luôn chạy trong thời gian hằng số bất kể trang thứ mấy. `OFFSET 100000` sẽ chậm theo tuyến tính vì phải quét qua 100000 hàng bị bỏ.
:::

### Batch Update — cập nhật từng lô

```sql
-- TRÁNH: cập nhật triệu hàng trong một transaction
UPDATE products SET is_archived = true WHERE created_at < '2020-01-01';

-- NÊN: chia thành lô nhỏ, giảm lock contention
DO $$
DECLARE
    batch_size  INT := 1000;
    rows_updated INT;
BEGIN
    LOOP
        UPDATE products
        SET is_archived = true
        WHERE id IN (
            SELECT id FROM products
            WHERE created_at < '2020-01-01'
              AND is_archived = false
            LIMIT batch_size
        );

        GET DIAGNOSTICS rows_updated = ROW_COUNT;
        EXIT WHEN rows_updated = 0;

        PERFORM pg_sleep(0.1);  -- nghỉ 100ms giữa các lô
    END LOOP;
END;
$$;
```

### Tránh N+1 Query

```sql
-- VẤN ĐỀ N+1: app chạy 1 query lấy danh sách, sau đó chạy thêm N query
-- SELECT * FROM orders;
-- SELECT * FROM customers WHERE id = 1;
-- SELECT * FROM customers WHERE id = 2; ...

-- GIẢI PHÁP: JOIN hoặc IN để lấy tất cả trong 1 query
SELECT
    o.id,
    o.total_amount,
    c.name  AS customer_name,
    c.email AS customer_email
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.created_at >= '2025-01-01'
ORDER BY o.created_at DESC;
```

---

## Checklist tối ưu

Trước khi đưa query vào production, kiểm tra lần lượt:

| Hạng mục | Kiểm tra |
|---|---|
| **Đo lường** | Đã chạy `EXPLAIN ANALYZE` và xác định node chậm nhất chưa? |
| **Index** | Cột trong `WHERE`, `JOIN ON`, `ORDER BY` có index không? |
| **Covering index** | Query có thể dùng Index Only Scan nếu thêm `INCLUDE` không? |
| **Hàm trên cột** | Không dùng hàm/ép kiểu trên cột trong `WHERE` (trừ functional index)? |
| **JOIN** | Không có tích Descartes? Lọc dữ liệu trước khi join bảng lớn chưa? |
| **Subquery** | Correlated subquery đã được thay bằng JOIN hoặc window function chưa? |
| **IN vs EXISTS** | Subquery trả về nhiều hàng thì dùng `EXISTS`? |
| **Projection** | Chỉ `SELECT` cột cần thiết, không dùng `SELECT *`? |
| **Pagination** | Trang lớn (> 10 000) dùng keyset thay `OFFSET`? |
| **Batch DML** | Update/delete lớn chia thành lô nhỏ? |
| **Thống kê** | Đã chạy `ANALYZE` sau khi load dữ liệu lớn chưa? |

:::tip[Mẹo]
Sau khi tối ưu, chạy lại `EXPLAIN (ANALYZE, BUFFERS)` và so sánh `actual time` trước và sau. Mục tiêu: giảm `Seq Scan` trên bảng lớn, tăng `Index Scan` hoặc `Index Only Scan`, và giảm `Rows Removed by Filter`.
:::
