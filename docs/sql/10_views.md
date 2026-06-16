---
sidebar_position: 10
title: "10. Views — Khung nhìn"
---

# Views — Khung nhìn

View (khung nhìn) là một câu truy vấn được lưu sẵn dưới dạng đối tượng có tên, để bạn dùng lại như một bảng ảo mà không phải viết lại đoạn SQL phức tạp mỗi lần. View giúp đơn giản hóa truy vấn, ẩn các cột nhạy cảm để bảo mật, và tách logic nghiệp vụ khỏi cấu trúc bảng thật. Bài này trình bày cách tạo, sửa, xóa view, view có thể cập nhật, và materialized view dùng cho báo cáo nặng.

---

## Mục lục

- [Vì sao cần view?](#vì-sao-cần-view)
- [View là gì](#view-là-gì)
- [Tạo View](#tạo-view)
- [Chỉnh sửa View](#chỉnh-sửa-view)
- [Xóa View](#xóa-view)
- [Updatable Views — View có thể cập nhật](#updatable-views--view-có-thể-cập-nhật)
- [Materialized View — View vật lý](#materialized-view--view-vật-lý)

---

## Vì sao cần view?

**Vấn đề:**

```sql
-- Cùng một truy vấn báo cáo phức tạp (nhiều JOIN, nhiều điều kiện)
-- bị LẶP LẠI ở khắp nơi: dashboard, export, API, job định kỳ...
SELECT
    c.full_name,
    SUM(o.total_amount) AS revenue,
    COUNT(o.id)         AS order_count
FROM customers c
JOIN orders o      ON o.customer_id = c.id
JOIN order_items i ON i.order_id = o.id
WHERE o.status = 'completed'
  AND o.order_date >= '2026-01-01'
GROUP BY c.full_name;
-- Sửa logic một chỗ → dễ sót các chỗ còn lại → khó bảo trì.
-- Ngoài ra: muốn cho người dùng xem dữ liệu nhưng KHÔNG lộ
-- toàn bộ cấu trúc và các cột nhạy cảm (lương, CMND) của bảng gốc.
```

**Giải pháp:**

```sql
-- VIEW: một "bảng ảo" lưu sẵn câu SELECT, dùng như bảng thường
-- nhưng KHÔNG chứa dữ liệu riêng — đọc trực tiếp từ bảng gốc.
CREATE VIEW vw_customer_revenue AS
SELECT
    c.full_name,
    SUM(o.total_amount) AS revenue,
    COUNT(o.id)         AS order_count
FROM customers c
JOIN orders o      ON o.customer_id = c.id
JOIN order_items i ON i.order_id = o.id
WHERE o.status = 'completed'
GROUP BY c.full_name;

-- Mọi nơi chỉ cần dùng lại view → sửa logic một chỗ duy nhất.
SELECT * FROM vw_customer_revenue WHERE revenue > 10000000;
```

View giúp **tái sử dụng** truy vấn, **đơn giản hoá** câu lệnh phức tạp, và **kiểm soát truy cập** (chỉ lộ cột cho phép). Khi cần đọc nhanh hơn cho báo cáo nặng, dùng *materialized view* để lưu sẵn kết quả.

:::tip[Dùng thực tế]
- **View báo cáo doanh thu** dùng lại ở nhiều nơi (dashboard, export, API) thay vì copy-paste cùng một query.
- **Ẩn cột nhạy cảm**: tạo view chỉ chứa cột công khai, không lộ lương hay số điện thoại của bảng gốc.
- **Đơn giản hoá query nhiều JOIN**: gói 4-5 bảng JOIN vào một tên view dễ nhớ.
- **Phân quyền theo view**: cấp `GRANT SELECT` trên view cho từng nhóm, không cấp quyền trên bảng gốc.
:::

---

## View là gì

**View** (khung nhìn) là một câu truy vấn SQL được lưu sẵn trong cơ sở dữ liệu dưới dạng một đối tượng có tên. Khi truy vấn vào view, hệ thống sẽ thực thi câu truy vấn gốc và trả về kết quả như thể bạn đang truy vấn một bảng thực.

View **không lưu dữ liệu** — nó chỉ lưu định nghĩa truy vấn. Mỗi lần truy cập, dữ liệu được lấy trực tiếp từ các bảng gốc.

**Lợi ích của View:**

| Lợi ích | Mô tả |
|---|---|
| Đơn giản hóa truy vấn | Ẩn logic JOIN/GROUP BY phức tạp sau một tên view dễ nhớ |
| Bảo mật | Ẩn các cột nhạy cảm (lương, số CMND) khỏi người dùng cụ thể |
| Abstraction | Tách logic nghiệp vụ khỏi cách lưu trữ thực tế |
| Tái sử dụng | Viết một lần, dùng nhiều nơi mà không lặp code |

:::info[Phân tích]
View hoạt động như một "lớp kính" trên dữ liệu thật. Ứng dụng tầng trên chỉ cần biết tên view, không cần hiểu cấu trúc bảng bên dưới. Khi cấu trúc bảng thay đổi, chỉ cần cập nhật view — ứng dụng không bị ảnh hưởng.
:::

---

## Tạo View

### Cú pháp cơ bản

```sql
CREATE VIEW ten_view AS
SELECT ...;
```

Nếu view đã tồn tại và muốn ghi đè, dùng `CREATE OR REPLACE VIEW`:

```sql
CREATE OR REPLACE VIEW ten_view AS
SELECT ...;
```

### Ví dụ: View tổng hợp đơn hàng theo khách hàng

```sql
-- Bảng gốc: orders(id, customer_id, order_date, total_amount, status)
-- Bảng gốc: customers(id, full_name, email)

CREATE VIEW vw_customer_order_summary AS
SELECT
    c.id            AS customer_id,
    c.full_name,
    c.email,
    COUNT(o.id)     AS total_orders,
    SUM(o.total_amount) AS lifetime_value,
    MAX(o.order_date)   AS last_order_date
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.full_name, c.email;
```

Sử dụng view như bảng thường:

```sql
-- Lấy khách hàng có giá trị > 10 triệu
SELECT full_name, lifetime_value
FROM vw_customer_order_summary
WHERE lifetime_value > 10000000
ORDER BY lifetime_value DESC;
```

### Ví dụ: View bảo mật — ẩn cột lương

```sql
-- Bảng gốc: employees(id, full_name, department, salary, phone)

CREATE VIEW vw_employees_public AS
SELECT
    id,
    full_name,
    department
    -- Không bao gồm salary, phone
FROM employees;

-- Cấp quyền xem view cho nhóm người dùng thông thường
GRANT SELECT ON vw_employees_public TO role_staff;
```

:::tip[Mẹo]
Đặt tiền tố `vw_` cho tên view giúp phân biệt rõ ràng với bảng thật khi đọc code SQL. Đây là quy ước phổ biến trong các dự án lớn.
:::

---

## Chỉnh sửa View

### Thay thế định nghĩa View

`CREATE OR REPLACE VIEW` ghi đè định nghĩa truy vấn nhưng giữ nguyên các quyền (GRANT) đã cấp:

```sql
CREATE OR REPLACE VIEW vw_customer_order_summary AS
SELECT
    c.id            AS customer_id,
    c.full_name,
    c.email,
    COUNT(o.id)     AS total_orders,
    SUM(o.total_amount) AS lifetime_value,
    MAX(o.order_date)   AS last_order_date,
    -- Thêm cột mới
    MIN(o.order_date)   AS first_order_date
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.full_name, c.email;
```

:::warning[Cần lưu ý]
`CREATE OR REPLACE VIEW` có ràng buộc: danh sách cột đầu ra phải **tương thích** với định nghĩa cũ — không được xóa cột hiện có hoặc thay đổi kiểu dữ liệu. Nếu cần thay đổi lớn, hãy `DROP` rồi `CREATE` lại.
:::

### Đổi tên View

```sql
ALTER VIEW vw_customer_order_summary
    RENAME TO vw_customer_summary;
```

### Thay đổi schema chứa View

```sql
ALTER VIEW vw_customer_summary
    SET SCHEMA reporting;
```

---

## Xóa View

```sql
-- Xóa view đơn giản
DROP VIEW vw_employees_public;

-- Xóa an toàn (không lỗi nếu view không tồn tại)
DROP VIEW IF EXISTS vw_employees_public;

-- Xóa kèm theo tất cả đối tượng phụ thuộc (các view khác dùng view này)
DROP VIEW IF EXISTS vw_customer_summary CASCADE;
```

:::warning[Cần lưu ý]
`CASCADE` sẽ xóa luôn tất cả view, function, hoặc rule phụ thuộc vào view này. Kiểm tra kỹ trước khi dùng trong môi trường production.

Dùng câu lệnh sau để xem danh sách đối tượng phụ thuộc trước khi xóa:

```sql
SELECT dependent_view.relname AS dependent_view
FROM pg_depend
JOIN pg_rewrite ON pg_depend.objid = pg_rewrite.oid
JOIN pg_class AS dependent_view ON pg_rewrite.ev_class = dependent_view.oid
JOIN pg_class AS source_table ON pg_depend.refobjid = source_table.oid
WHERE source_table.relname = 'vw_customer_summary';
```
:::

---

## Updatable Views — View có thể cập nhật

Một số view cho phép thực hiện `INSERT`, `UPDATE`, `DELETE` trực tiếp. PostgreSQL tự động chuyển thao tác đó xuống bảng gốc.

### Điều kiện để View có thể cập nhật

View phải thỏa mãn **tất cả** điều kiện sau:

- Chỉ tham chiếu **một bảng** duy nhất (không JOIN)
- Không dùng `DISTINCT`, `GROUP BY`, `HAVING`, `UNION`, `LIMIT`
- Không dùng hàm tập hợp (`SUM`, `COUNT`, `AVG`...)
- Không dùng window function
- Danh sách `SELECT` bao gồm đủ cột để xác định hàng

```sql
-- View đơn giản — CÓ THỂ cập nhật
CREATE VIEW vw_active_products AS
SELECT id, name, price, stock
FROM products
WHERE is_active = TRUE;

-- Cập nhật qua view
UPDATE vw_active_products
SET price = price * 1.1
WHERE stock < 10;

-- Insert qua view
INSERT INTO vw_active_products (name, price, stock)
VALUES ('Sản phẩm mới', 150000, 50);
```

### WITH CHECK OPTION

Ngăn người dùng `INSERT`/`UPDATE` dữ liệu không thỏa mãn điều kiện lọc của view:

```sql
CREATE OR REPLACE VIEW vw_active_products AS
SELECT id, name, price, stock
FROM products
WHERE is_active = TRUE
WITH CHECK OPTION;

-- Lệnh này sẽ BỊ TỪ CHỐI vì is_active = FALSE không thỏa mãn WHERE
UPDATE vw_active_products
SET is_active = FALSE
WHERE id = 5;
-- ERROR: new row violates check option for view "vw_active_products"
```

:::tip[Mẹo]
Dùng `WITH CHECK OPTION` khi bạn muốn đảm bảo dữ liệu được ghi qua view luôn nhìn thấy được trong chính view đó — tránh tình huống insert thành công nhưng bản ghi "biến mất" khỏi view ngay sau đó.
:::

---

## Materialized View — View vật lý

**Materialized View** khác với View thông thường: nó **lưu kết quả truy vấn vào đĩa** như một bảng thực. Dữ liệu không tự động cập nhật — bạn phải refresh thủ công hoặc theo lịch.

### Tạo Materialized View

```sql
CREATE MATERIALIZED VIEW mvw_monthly_revenue AS
SELECT
    DATE_TRUNC('month', order_date) AS month,
    SUM(total_amount)               AS revenue,
    COUNT(id)                       AS order_count
FROM orders
WHERE status = 'completed'
GROUP BY DATE_TRUNC('month', order_date)
ORDER BY month;

-- Tạo index để tăng tốc truy vấn
CREATE INDEX idx_mvw_monthly_revenue_month
    ON mvw_monthly_revenue (month);
```

### Refresh dữ liệu

```sql
-- Refresh đầy đủ (khóa bảng trong quá trình refresh)
REFRESH MATERIALIZED VIEW mvw_monthly_revenue;

-- Refresh đồng thời — KHÔNG khóa bảng (yêu cầu UNIQUE index)
REFRESH MATERIALIZED VIEW CONCURRENTLY mvw_monthly_revenue;
```

:::info[Phân tích]
`REFRESH MATERIALIZED VIEW CONCURRENTLY` cho phép đọc dữ liệu cũ trong khi đang refresh. Tuy nhiên, cần có ít nhất một `UNIQUE INDEX` trên materialized view. Phù hợp cho môi trường production có lưu lượng truy cập cao.
:::

### Xóa Materialized View

```sql
DROP MATERIALIZED VIEW IF EXISTS mvw_monthly_revenue;
```

### So sánh View và Materialized View

| Tiêu chí | View thường | Materialized View |
|---|---|---|
| Lưu trữ dữ liệu | Không (chỉ lưu query) | Có (lưu kết quả thực) |
| Tốc độ đọc | Chậm hơn với query phức tạp | Nhanh (đọc từ dữ liệu đã tính sẵn) |
| Độ tươi dữ liệu | Luôn mới nhất (real-time) | Có thể lỗi thời (cần refresh) |
| Hỗ trợ Index | Không thể tạo index trực tiếp | Có thể tạo index |
| Chi phí lưu trữ | Không đáng kể | Chiếm dung lượng đĩa |
| Use case | Dashboard real-time, bảo mật | Báo cáo phức tạp, OLAP, aggregation lớn |

:::tip[Mẹo]
Dùng **Materialized View** khi:
- Truy vấn chạy chậm do JOIN nhiều bảng hoặc tính toán phức tạp
- Dữ liệu không cần real-time (chấp nhận refresh mỗi giờ hoặc mỗi ngày)
- Cần thêm index để tối ưu truy vấn báo cáo

Dùng **View thường** khi:
- Cần dữ liệu luôn chính xác, cập nhật tức thì
- Mục đích chính là bảo mật hoặc đơn giản hóa câu truy vấn
:::
