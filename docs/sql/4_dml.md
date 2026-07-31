---
sidebar_position: 4
title: "4. DML — Thao tác dữ liệu"
---

# DML — Thao tác dữ liệu

DML (Data Manipulation Language) là nhóm câu lệnh dùng để truy vấn và thay đổi dữ liệu bên trong bảng. Bài này tập trung vào câu lệnh SELECT (FROM, WHERE, JOIN, GROUP BY, HAVING, ORDER BY) cùng INSERT, UPDATE, DELETE. Đây là nhóm lệnh bạn dùng hằng ngày, nên nắm vững thứ tự thực thi và cách lọc dữ liệu là rất quan trọng.

---

:::note[Ghi nhớ nhanh]

- ⭐ **DML thao tác dữ liệu** — `SELECT` (đọc), `INSERT` (thêm), `UPDATE` (sửa), `DELETE` (xóa) theo điều kiện.
- ⭐ **Thứ tự thực thi logic** — `FROM` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `ORDER BY` → `LIMIT`; không dùng alias `SELECT` trong `WHERE`.
- **Kiểm tra NULL** — luôn dùng `IS NULL` / `IS NOT NULL`, không dùng `= NULL` (không bao giờ đúng).
- **Tính năng PostgreSQL** — `RETURNING` lấy lại dữ liệu vừa thao tác, `ON CONFLICT` để upsert.
- ⭐ **Luôn kèm `WHERE`** khi `UPDATE`/`DELETE` — thiếu `WHERE` sẽ tác động toàn bộ bảng.

:::

---

## Mục lục

- [Vì sao có DML?](#vì-sao-có-dml)
- [SELECT Query — Cấu trúc tổng quát](#select-query--cấu-trúc-tổng-quát)
- [Thứ tự thực thi logic](#thứ-tự-thực-thi-logic)
- [FROM — Chọn bảng nguồn](#from--chọn-bảng-nguồn)
- [WHERE — Lọc dòng dữ liệu](#where--lọc-dòng-dữ-liệu)
- [JOINs — Kết hợp bảng](#joins--kết-hợp-bảng)
- [GROUP BY — Gom nhóm](#group-by--gom-nhóm)
- [ORDER BY — Sắp xếp kết quả](#order-by--sắp-xếp-kết-quả)
- [HAVING — Lọc sau khi gom nhóm](#having--lọc-sau-khi-gom-nhóm)
- [INSERT — Thêm dữ liệu](#insert--thêm-dữ-liệu)
- [UPDATE — Cập nhật dữ liệu](#update--cập-nhật-dữ-liệu)
- [DELETE — Xóa dữ liệu](#delete--xóa-dữ-liệu)

---

## Vì sao có DML?

**Vấn đề:** Sau khi đã tạo xong bảng bằng DDL, ta cần một cách để **thao tác dữ liệu** bên trong bảng một cách an toàn và chính xác theo điều kiện: thêm, đọc, sửa, xóa đúng những bản ghi mong muốn — chứ không phải tác động nhầm vào cả bảng.

```sql
-- Bảng đã có sẵn (DDL), nhưng làm sao chỉ sửa ĐÚNG đơn hàng id = 500?
-- Làm sao chỉ xóa những session đã hết hạn, không xóa nhầm cái khác?
-- DDL không trả lời được — nó chỉ định nghĩa cấu trúc bảng.
```

**Giải pháp:** DML (Data Manipulation Language) cung cấp các câu lệnh thao tác dữ liệu theo điều kiện rõ ràng: `INSERT` (thêm), `SELECT` (đọc/truy vấn), `UPDATE` (sửa, kèm `WHERE`), `DELETE` (xóa, kèm `WHERE`).

```sql
INSERT INTO orders (customer_id, total_amount, status)  -- thêm bản ghi
VALUES (42, 1500000, 'pending');

SELECT * FROM orders WHERE status = 'pending';           -- đọc theo điều kiện

UPDATE orders SET status = 'confirmed' WHERE id = 500;   -- sửa đúng 1 bản ghi

DELETE FROM sessions WHERE expires_at < NOW();           -- xóa theo điều kiện
```

:::tip[Dùng thực tế]
- **Thêm bản ghi mới:** tạo đơn hàng, thêm sản phẩm, đăng ký người dùng (`INSERT`).
- **Truy vấn theo điều kiện:** lấy danh sách đơn "đang chờ", tìm khách theo email (`SELECT ... WHERE`).
- **Cập nhật trạng thái đơn hàng:** chuyển đơn từ `pending` sang `confirmed` (`UPDATE ... WHERE`).
- **Xóa dữ liệu cũ:** dọn session hết hạn, xóa đơn đã hủy — **luôn nhớ kèm `WHERE`** để không xóa nhầm cả bảng (`DELETE ... WHERE`).
:::

---

## SELECT Query — Cấu trúc tổng quát

Câu lệnh `SELECT` là câu lệnh DML được dùng nhiều nhất. Cú pháp đầy đủ của một câu truy vấn:

```sql
SELECT   [DISTINCT] danh_sach_cot
FROM     ten_bang [alias]
[JOIN    bang_khac ON dieu_kien]
[WHERE   dieu_kien_loc]
[GROUP BY nhom_cot]
[HAVING  dieu_kien_sau_nhom]
[ORDER BY cot [ASC | DESC] [NULLS FIRST | LAST]]
[LIMIT   so_dong]
[OFFSET  vi_tri_bat_dau];
```

---

## Thứ tự thực thi logic

:::warning[Cần lưu ý]
**Thứ tự viết** câu lệnh SQL khác hoàn toàn **thứ tự thực thi** của database engine. Hiểu điều này giúp tránh nhiều lỗi khó hiểu.
:::

| Bước | Mệnh đề | Ý nghĩa |
|------|---------|---------|
| 1 | `FROM` | Xác định bảng nguồn và thực hiện JOIN |
| 2 | `WHERE` | Lọc từng dòng trước khi gom nhóm |
| 3 | `GROUP BY` | Gom các dòng thành nhóm |
| 4 | `HAVING` | Lọc các nhóm sau khi gom |
| 5 | `SELECT` | Chọn và tính toán các cột trả về |
| 6 | `ORDER BY` | Sắp xếp kết quả cuối cùng |
| 7 | `LIMIT / OFFSET` | Giới hạn số dòng trả về |

:::info[Phân tích]
Vì `WHERE` chạy **trước** `SELECT`, bạn không thể dùng alias được đặt trong `SELECT` bên trong `WHERE`. Ví dụ: `SELECT price * 1.1 AS price_with_tax FROM products WHERE price_with_tax > 100` sẽ **báo lỗi**. Phải viết lại: `WHERE price * 1.1 > 100`.
:::

---

## FROM — Chọn bảng nguồn

`FROM` xác định bảng hoặc nguồn dữ liệu cho truy vấn. Có thể đặt alias để viết ngắn gọn hơn.

```sql
-- Truy vấn cơ bản
SELECT * FROM orders;

-- Đặt alias cho bảng
SELECT o.id, o.total_amount
FROM orders AS o;

-- Alias không cần từ khóa AS (cú pháp rút gọn)
SELECT o.id, c.full_name
FROM orders o, customers c
WHERE o.customer_id = c.id;
```

:::tip[Mẹo]
Luôn đặt alias ngắn gọn (1–2 ký tự) khi truy vấn nhiều bảng để tránh gõ tên bảng dài lặp đi lặp lại. Ví dụ: `orders o`, `customers c`, `order_items oi`.
:::

---

## WHERE — Lọc dòng dữ liệu

`WHERE` lọc từng dòng trước khi các phép tính khác diễn ra. Hỗ trợ nhiều toán tử so sánh và điều kiện.

```sql
-- Toán tử so sánh cơ bản
SELECT * FROM products
WHERE price > 100 AND stock > 0;

-- IN — kiểm tra thuộc tập hợp
SELECT * FROM orders
WHERE status IN ('pending', 'processing', 'shipped');

-- BETWEEN — kiểm tra khoảng giá trị (bao gồm cả hai đầu)
SELECT * FROM orders
WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31';

-- LIKE — khớp mẫu chuỗi (% khớp nhiều ký tự, _ khớp 1 ký tự)
SELECT * FROM customers
WHERE email LIKE '%@gmail.com';

SELECT * FROM products
WHERE sku LIKE 'PRD-___-2024';

-- IS NULL / IS NOT NULL
SELECT * FROM orders
WHERE shipped_at IS NULL;

-- Kết hợp AND / OR với dấu ngoặc để rõ ràng ưu tiên
SELECT * FROM products
WHERE (category = 'electronics' OR category = 'computers')
  AND price < 5000000
  AND is_active = true;
```

:::warning[Cần lưu ý]
Luôn dùng `IS NULL` / `IS NOT NULL` để kiểm tra giá trị NULL. Viết `= NULL` hoặc `!= NULL` sẽ **không bao giờ trả về kết quả đúng** vì NULL không so sánh bằng bất cứ thứ gì, kể cả chính nó.
:::

---

## JOINs — Kết hợp bảng

JOIN cho phép kết hợp dữ liệu từ nhiều bảng dựa trên điều kiện liên kết. Đây là giới thiệu cơ bản — chi tiết các loại JOIN sẽ được trình bày trong phần riêng.

```sql
-- INNER JOIN: chỉ lấy các dòng khớp ở cả hai bảng
SELECT o.id, o.total_amount, c.full_name, c.email
FROM orders AS o
INNER JOIN customers AS c ON o.customer_id = c.id
WHERE o.status = 'completed';

-- LEFT JOIN: lấy tất cả dòng từ bảng trái,
-- bảng phải NULL nếu không khớp
SELECT c.full_name, COUNT(o.id) AS order_count
FROM customers AS c
LEFT JOIN orders AS o ON c.id = o.customer_id
GROUP BY c.id, c.full_name;
```

:::info[Phân tích]
`INNER JOIN` loại bỏ các khách hàng chưa có đơn hàng. `LEFT JOIN` giữ lại tất cả khách hàng, kể cả người chưa đặt hàng lần nào — số đơn hàng của họ sẽ là `NULL` (hoặc `0` nếu dùng `COALESCE`).
:::

---

## GROUP BY — Gom nhóm

`GROUP BY` gom các dòng có cùng giá trị thành một nhóm, thường dùng kết hợp với hàm tổng hợp (aggregate functions) như `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`.

```sql
-- Đếm số đơn hàng theo trạng thái
SELECT status, COUNT(*) AS order_count
FROM orders
GROUP BY status;

-- Tổng doanh thu theo tháng
SELECT
    DATE_TRUNC('month', created_at) AS month,
    SUM(total_amount)               AS revenue,
    COUNT(*)                        AS order_count,
    AVG(total_amount)               AS avg_order_value
FROM orders
WHERE status = 'completed'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month;

-- GROUP BY nhiều cột
SELECT category, brand, COUNT(*) AS product_count
FROM products
GROUP BY category, brand
ORDER BY category, brand;
```

:::warning[Cần lưu ý]
Mọi cột trong `SELECT` phải hoặc là cột trong `GROUP BY`, hoặc được bao trong hàm aggregate. PostgreSQL sẽ báo lỗi nếu vi phạm quy tắc này.
:::

---

## ORDER BY — Sắp xếp kết quả

`ORDER BY` sắp xếp kết quả trả về. Chạy sau `SELECT` nên có thể dùng alias đã đặt.

```sql
-- Sắp xếp tăng dần (mặc định ASC)
SELECT * FROM products
ORDER BY price;

-- Sắp xếp giảm dần
SELECT * FROM products
ORDER BY price DESC;

-- Sắp xếp theo nhiều cột
SELECT * FROM orders
ORDER BY customer_id ASC, created_at DESC;

-- Dùng alias từ SELECT
SELECT full_name, DATE_PART('year', AGE(birth_date)) AS age
FROM customers
ORDER BY age DESC;

-- Xử lý NULL: NULLS FIRST hoặc NULLS LAST
SELECT * FROM orders
ORDER BY shipped_at ASC NULLS LAST;
```

:::tip[Mẹo]
Mặc định PostgreSQL đặt `NULLS LAST` cho `ASC` và `NULLS FIRST` cho `DESC`. Nếu cần thứ tự NULL cụ thể, hãy khai báo tường minh để code dễ đọc và tránh hành vi khác nhau giữa các database.
:::

---

## HAVING — Lọc sau khi gom nhóm

`HAVING` lọc **các nhóm** sau khi `GROUP BY` đã thực hiện, khác với `WHERE` lọc các dòng trước khi gom nhóm.

```sql
-- Chỉ lấy các khách hàng có hơn 5 đơn hàng
SELECT customer_id, COUNT(*) AS order_count
FROM orders
GROUP BY customer_id
HAVING COUNT(*) > 5;

-- WHERE lọc dòng trước, HAVING lọc nhóm sau
SELECT
    category,
    AVG(price) AS avg_price,
    COUNT(*)   AS product_count
FROM products
WHERE is_active = true          -- lọc sản phẩm còn hoạt động trước
GROUP BY category
HAVING AVG(price) > 500000      -- chỉ lấy nhóm có giá trung bình > 500k
   AND COUNT(*) >= 3;            -- và có ít nhất 3 sản phẩm
```

| Tiêu chí | WHERE | HAVING |
|----------|-------|--------|
| Lọc đối tượng | Từng dòng | Từng nhóm |
| Thời điểm chạy | Trước GROUP BY | Sau GROUP BY |
| Dùng aggregate | Không được | Được |
| Hiệu năng | Tốt hơn (lọc sớm) | Lọc muộn hơn |

:::info[Phân tích]
Nếu điều kiện không cần aggregate, hãy ưu tiên đặt vào `WHERE` thay vì `HAVING`. Lọc sớm ở `WHERE` giảm số dòng phải xử lý trong `GROUP BY`, cải thiện hiệu năng đáng kể trên bảng lớn.
:::

---

## INSERT — Thêm dữ liệu

```sql
-- Thêm một dòng
INSERT INTO products (name, price, category, stock)
VALUES ('Laptop Dell XPS 13', 28990000, 'electronics', 50);

-- Thêm nhiều dòng cùng lúc (hiệu quả hơn nhiều lệnh INSERT đơn lẻ)
INSERT INTO products (name, price, category, stock)
VALUES
    ('iPhone 15 Pro', 29990000, 'electronics', 100),
    ('Samsung Galaxy S24', 22990000, 'electronics', 80),
    ('iPad Air', 18990000, 'electronics', 60);

-- INSERT ... SELECT: sao chép dữ liệu từ bảng khác
INSERT INTO products_archive (product_id, name, price, archived_at)
SELECT id, name, price, NOW()
FROM products
WHERE is_active = false;

-- RETURNING: lấy lại dữ liệu vừa insert (rất hữu ích để lấy id tự sinh)
INSERT INTO orders (customer_id, total_amount, status)
VALUES (42, 1500000, 'pending')
RETURNING id, created_at;

-- ON CONFLICT (upsert): xử lý khi vi phạm ràng buộc UNIQUE
INSERT INTO product_prices (product_id, date, price)
VALUES (101, '2024-06-01', 29990000)
ON CONFLICT (product_id, date)
DO UPDATE SET price = EXCLUDED.price,
              updated_at = NOW();

-- ON CONFLICT DO NOTHING: bỏ qua nếu đã tồn tại
INSERT INTO tags (name)
VALUES ('electronics')
ON CONFLICT (name) DO NOTHING;
```

:::tip[Mẹo]
`RETURNING` của PostgreSQL giúp tránh phải chạy thêm câu `SELECT` để lấy `id` vừa được tạo. Đây là tính năng đặc trưng của PostgreSQL, rất tiện khi làm việc với khóa tự tăng.
:::

---

## UPDATE — Cập nhật dữ liệu

```sql
-- Cập nhật cơ bản
UPDATE products
SET price = 27990000,
    updated_at = NOW()
WHERE id = 101;

-- Cập nhật nhiều cột với biểu thức
UPDATE products
SET price       = price * 0.9,
    sale_label  = 'SALE 10%',
    updated_at  = NOW()
WHERE category = 'electronics'
  AND stock > 0;

-- UPDATE ... FROM: cập nhật dựa trên dữ liệu từ bảng khác
UPDATE order_items oi
SET subtotal = oi.quantity * p.price
FROM products p
WHERE oi.product_id = p.id
  AND oi.subtotal IS NULL;

-- RETURNING: trả về dữ liệu sau khi cập nhật
UPDATE orders
SET status = 'confirmed',
    confirmed_at = NOW()
WHERE id = 500
RETURNING id, status, confirmed_at;
```

:::warning[Cần lưu ý]
**LUÔN LUÔN kiểm tra `WHERE` trước khi chạy `UPDATE`**. Câu lệnh `UPDATE products SET price = 0` không có `WHERE` sẽ cập nhật **toàn bộ bảng**. Thói quen tốt: chạy `SELECT` với cùng điều kiện `WHERE` để kiểm tra trước, sau đó mới chạy `UPDATE`.
:::

---

## DELETE — Xóa dữ liệu

```sql
-- Xóa một dòng cụ thể
DELETE FROM products
WHERE id = 101;

-- Xóa nhiều dòng theo điều kiện
DELETE FROM order_items
WHERE order_id IN (
    SELECT id FROM orders WHERE status = 'cancelled'
);

-- DELETE USING: xóa dựa trên điều kiện từ bảng khác
DELETE FROM order_items oi
USING orders o
WHERE oi.order_id = o.id
  AND o.status = 'cancelled'
  AND o.updated_at < NOW() - INTERVAL '30 days';

-- RETURNING: lấy lại dữ liệu vừa xóa
DELETE FROM sessions
WHERE expires_at < NOW()
RETURNING user_id, session_token;
```

:::warning[Cần lưu ý]
Tương tự `UPDATE`, câu lệnh `DELETE FROM orders` không có `WHERE` sẽ **xóa toàn bộ bảng**. Luôn kiểm tra điều kiện bằng `SELECT COUNT(*)` trước. Nếu chỉ muốn xóa toàn bộ bảng nhanh chóng, hãy dùng `TRUNCATE TABLE ten_bang` — nhanh hơn nhiều nhưng không có `WHERE` và không thể rollback trong một số tình huống.
:::

:::info[Phân tích]
Trong PostgreSQL, `DELETE` + `RETURNING` rất hữu ích cho pattern "lấy và xóa" (pop from queue): bạn có thể vừa lấy dữ liệu vừa xóa trong một câu lệnh duy nhất, an toàn với concurrent access khi kết hợp với `FOR UPDATE SKIP LOCKED`.
:::
