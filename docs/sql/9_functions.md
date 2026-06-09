---
sidebar_position: 9
title: "9. Hàm nâng cao (Functions)"
---

# Hàm nâng cao (Functions)

Hàm (function) trong SQL là những công cụ có sẵn giúp bạn biến đổi và xử lý dữ liệu ngay trong câu truy vấn. Bài này giới thiệu các nhóm hàm thông dụng nhất: hàm chuỗi để cắt ghép văn bản, hàm ngày tháng để tính toán thời gian, hàm số học để làm tròn và tính toán, cùng các hàm điều kiện như CASE WHEN, COALESCE, NULLIF. Nắm vững chúng giúp bạn viết truy vấn gọn gàng mà không phải xử lý thủ công ở tầng ứng dụng.

---

## Mục lục

- [Hàm xử lý chuỗi (String Functions)](#hàm-xử-lý-chuỗi-string-functions)
- [Hàm ngày tháng (Date and Time Functions)](#hàm-ngày-tháng-date-and-time-functions)
- [Hàm số học (Numeric Functions)](#hàm-số-học-numeric-functions)
- [Hàm điều kiện (Conditional Functions)](#hàm-điều-kiện-conditional-functions)

---

## Hàm xử lý chuỗi (String Functions)

PostgreSQL cung cấp nhiều hàm mạnh mẽ để xử lý dữ liệu kiểu chuỗi (text, varchar, char).

### Bảng tổng hợp các hàm chuỗi thông dụng

| Hàm | Cú pháp | Mô tả |
|-----|---------|-------|
| `CONCAT` | `CONCAT(s1, s2, ...)` | Nối nhiều chuỗi lại với nhau |
| `\|\|` | `s1 \|\| s2` | Toán tử nối chuỗi (tương đương CONCAT) |
| `LENGTH` | `LENGTH(s)` | Trả về số ký tự của chuỗi |
| `SUBSTRING` | `SUBSTRING(s FROM pos FOR len)` | Cắt chuỗi con |
| `REPLACE` | `REPLACE(s, old, new)` | Thay thế chuỗi con |
| `UPPER` | `UPPER(s)` | Chuyển sang chữ HOA |
| `LOWER` | `LOWER(s)` | Chuyển sang chữ thường |
| `TRIM` | `TRIM(s)` | Xóa khoảng trắng hai đầu |
| `POSITION` | `POSITION(sub IN s)` | Tìm vị trí chuỗi con |
| `SPLIT_PART` | `SPLIT_PART(s, delim, n)` | Tách chuỗi theo ký tự phân cách |

### Ví dụ thực tế

```sql
-- Nối họ và tên thành họ tên đầy đủ
SELECT
    first_name || ' ' || last_name AS full_name,
    CONCAT(first_name, ' ', last_name) AS full_name_v2
FROM employees;

-- Lấy 3 ký tự đầu của tên sản phẩm (viết hoa)
SELECT
    product_name,
    UPPER(SUBSTRING(product_name FROM 1 FOR 3)) AS code_prefix
FROM products;

-- Thay thế ký tự trong email (ẩn bớt thông tin)
SELECT
    REPLACE(email, SUBSTRING(email FROM 1 FOR 3), '***') AS masked_email
FROM customers;

-- Tách lấy domain từ email
SELECT
    email,
    SPLIT_PART(email, '@', 2) AS domain
FROM customers;

-- Tìm vị trí ký tự '@' trong email
SELECT
    email,
    POSITION('@' IN email) AS at_position,
    LENGTH(email) AS total_length
FROM customers;
```

:::tip[Mẹo]
Toán tử `||` ngắn gọn hơn `CONCAT` trong nhiều trường hợp, nhưng nếu một trong các giá trị là `NULL` thì `||` sẽ trả về `NULL`. Dùng `CONCAT` để an toàn hơn vì nó bỏ qua `NULL`.
:::

:::info[Phân tích]
`SUBSTRING(s FROM pos FOR len)` là cú pháp chuẩn SQL. PostgreSQL cũng hỗ trợ cú pháp `SUBSTR(s, pos, len)` tương đương. Tham số `pos` bắt đầu từ 1 (không phải 0).
:::

---

## Hàm ngày tháng (Date and Time Functions)

### Kiểu dữ liệu ngày tháng trong PostgreSQL

| Kiểu | Mô tả | Ví dụ |
|------|-------|-------|
| `DATE` | Chỉ ngày | `2024-06-03` |
| `TIME` | Chỉ giờ | `14:30:00` |
| `TIMESTAMP` | Ngày + giờ | `2024-06-03 14:30:00` |
| `TIMESTAMPTZ` | Ngày + giờ + múi giờ | `2024-06-03 14:30:00+07` |
| `INTERVAL` | Khoảng thời gian | `3 days`, `2 months` |

### Bảng tổng hợp các hàm ngày tháng thông dụng

| Hàm | Cú pháp | Mô tả |
|-----|---------|-------|
| `NOW` | `NOW()` | Thời gian hiện tại (timestamp + timezone) |
| `CURRENT_DATE` | `CURRENT_DATE` | Ngày hiện tại |
| `CURRENT_TIME` | `CURRENT_TIME` | Giờ hiện tại |
| `EXTRACT` | `EXTRACT(field FROM source)` | Lấy thành phần (năm, tháng, ngày...) |
| `DATE_TRUNC` | `DATE_TRUNC('unit', source)` | Làm tròn về đơn vị thời gian |
| `AGE` | `AGE(timestamp1, timestamp2)` | Tính khoảng cách giữa hai mốc thời gian |
| `+INTERVAL` | `date + INTERVAL '...'` | Cộng/trừ khoảng thời gian |

### Ví dụ thực tế

```sql
-- Lấy ngày và giờ hiện tại
SELECT
    NOW()          AS current_timestamp,
    CURRENT_DATE   AS today,
    CURRENT_TIME   AS now_time;

-- Trích xuất thành phần từ ngày tháng
-- EXTRACT tương đương DATEPART trong SQL Server
SELECT
    order_date,
    EXTRACT(YEAR  FROM order_date) AS nam,
    EXTRACT(MONTH FROM order_date) AS thang,
    EXTRACT(DAY   FROM order_date) AS ngay,
    EXTRACT(DOW   FROM order_date) AS thu_trong_tuan  -- 0=Chủ Nhật
FROM orders;

-- Cộng/trừ khoảng thời gian với INTERVAL
-- Tương đương DATEADD trong SQL Server
SELECT
    order_date,
    order_date + INTERVAL '7 days'   AS delivery_date,
    order_date + INTERVAL '1 month'  AS one_month_later,
    order_date - INTERVAL '30 days'  AS thirty_days_ago
FROM orders;

-- Tính tuổi nhân viên hoặc thời gian làm việc
SELECT
    employee_name,
    hire_date,
    AGE(CURRENT_DATE, hire_date) AS thoi_gian_lam_viec,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, hire_date)) AS so_nam
FROM employees;

-- DATE_TRUNC: làm tròn về đầu tháng (dùng cho thống kê)
SELECT
    DATE_TRUNC('month', order_date) AS thang,
    COUNT(*)                         AS so_don,
    SUM(total_amount)                AS doanh_thu
FROM orders
GROUP BY DATE_TRUNC('month', order_date)
ORDER BY thang;
```

:::warning[Cần lưu ý]
PostgreSQL **không có** hàm `DATEPART` hay `DATEADD` như SQL Server.

- Thay `DATEPART(year, d)` bằng `EXTRACT(YEAR FROM d)`
- Thay `DATEADD(day, 7, d)` bằng `d + INTERVAL '7 days'`

Đây là điểm khác biệt quan trọng khi chuyển đổi câu truy vấn từ SQL Server sang PostgreSQL.
:::

:::info[Phân tích]
`DATE_TRUNC('month', timestamp)` trả về timestamp của ngày đầu tiên trong tháng (ví dụ `2024-06-01 00:00:00`). Rất hữu ích khi cần nhóm dữ liệu theo tháng, quý, hoặc năm mà không cần viết điều kiện phức tạp.
:::

---

## Hàm số học (Numeric Functions)

### Bảng tổng hợp các hàm số học thông dụng

| Hàm | Cú pháp | Mô tả |
|-----|---------|-------|
| `ABS` | `ABS(n)` | Giá trị tuyệt đối |
| `ROUND` | `ROUND(n, d)` | Làm tròn đến `d` chữ số thập phân |
| `FLOOR` | `FLOOR(n)` | Làm tròn xuống (số nguyên nhỏ hơn) |
| `CEILING` | `CEILING(n)` | Làm tròn lên (số nguyên lớn hơn) |
| `MOD` | `MOD(a, b)` | Phần dư của phép chia |
| `POWER` | `POWER(base, exp)` | Lũy thừa |
| `TRUNC` | `TRUNC(n, d)` | Cắt bỏ phần thập phân (không làm tròn) |

### Ví dụ thực tế

```sql
-- Làm tròn giá tiền
SELECT
    product_name,
    price,
    ROUND(price, 2)     AS gia_lam_tron,
    FLOOR(price)        AS gia_floor,
    CEILING(price)      AS gia_ceiling,
    TRUNC(price, 1)     AS gia_trunc
FROM products;

-- Giá trị tuyệt đối (ví dụ: chênh lệch tồn kho)
SELECT
    product_name,
    expected_stock - actual_stock        AS chenh_lech,
    ABS(expected_stock - actual_stock)   AS chenh_lech_tuyet_doi
FROM inventory;

-- Phần dư: kiểm tra số chẵn/lẻ
SELECT
    order_id,
    CASE WHEN MOD(order_id, 2) = 0 THEN 'Chẵn' ELSE 'Lẻ' END AS loai
FROM orders;

-- Tính lãi kép với POWER
SELECT
    principal,
    rate,
    years,
    ROUND(principal * POWER(1 + rate, years), 2) AS future_value
FROM investments;
```

:::tip[Mẹo]
`TRUNC` khác `FLOOR` ở chỗ: với số âm, `FLOOR(-3.7)` trả về `-4` còn `TRUNC(-3.7)` trả về `-3`. Dùng `TRUNC` khi muốn đơn giản cắt bỏ phần thập phân mà không quan tâm chiều số âm/dương.
:::

---

## Hàm điều kiện (Conditional Functions)

### CASE WHEN — Phân loại và biến đổi giá trị

```sql
-- Phân loại điểm học sinh
SELECT
    student_name,
    score,
    CASE
        WHEN score >= 90 THEN 'Xuất sắc'
        WHEN score >= 80 THEN 'Giỏi'
        WHEN score >= 65 THEN 'Khá'
        WHEN score >= 50 THEN 'Trung bình'
        ELSE 'Yếu'
    END AS xep_loai
FROM students;

-- CASE dạng đơn giản (simple CASE)
SELECT
    order_status,
    CASE order_status
        WHEN 'pending'   THEN 'Chờ xử lý'
        WHEN 'confirmed' THEN 'Đã xác nhận'
        WHEN 'shipped'   THEN 'Đang giao'
        WHEN 'delivered' THEN 'Đã giao'
        ELSE 'Không xác định'
    END AS trang_thai_vn
FROM orders;

-- CASE trong tính toán: giảm giá theo nhóm khách hàng
SELECT
    customer_name,
    total_amount,
    CASE
        WHEN customer_tier = 'gold'   THEN total_amount * 0.85
        WHEN customer_tier = 'silver' THEN total_amount * 0.90
        ELSE total_amount
    END AS amount_after_discount
FROM orders
JOIN customers USING (customer_id);
```

### COALESCE — Xử lý giá trị NULL và đặt giá trị mặc định

```sql
-- Hiển thị giá trị mặc định khi NULL
SELECT
    product_name,
    COALESCE(discount, 0)          AS discount,
    COALESCE(description, 'N/A')   AS description
FROM products;

-- Ưu tiên lấy giá trị đầu tiên không NULL
SELECT
    customer_id,
    COALESCE(phone_mobile, phone_home, phone_work, 'Không có SĐT') AS contact_phone
FROM customers;
```

### NULLIF — Tránh chia cho 0

```sql
-- Tính tỷ lệ hoàn thành, tránh chia cho 0
SELECT
    department,
    completed_tasks,
    total_tasks,
    ROUND(
        completed_tasks::numeric / NULLIF(total_tasks, 0) * 100,
        1
    ) AS completion_rate
FROM task_summary;
-- NULLIF(total_tasks, 0) trả về NULL khi total_tasks = 0
-- Phép chia cho NULL trả về NULL thay vì báo lỗi
```

### GREATEST và LEAST — So sánh nhiều giá trị

```sql
-- Lấy giá cao nhất / thấp nhất trong nhiều cột
SELECT
    product_name,
    price_vn,
    price_us,
    price_eu,
    GREATEST(price_vn, price_us, price_eu) AS gia_cao_nhat,
    LEAST(price_vn, price_us, price_eu)    AS gia_thap_nhat
FROM products;
```

:::info[Phân tích]
`COALESCE(a, b, c)` trả về giá trị **đầu tiên không phải NULL** trong danh sách. Đây là cách ngắn gọn và hiệu quả hơn việc viết nhiều `CASE WHEN col IS NULL THEN ...`.

`NULLIF(a, b)` trả về `NULL` nếu `a = b`, ngược lại trả về `a`. Kết hợp với `COALESCE`, đây là mẫu xử lý dữ liệu bẩn rất thực dụng trong thực tế.
:::

:::warning[Cần lưu ý]
Khi dùng `CASE WHEN` trong mệnh đề `ORDER BY` hoặc `GROUP BY`, PostgreSQL cho phép điều này nhưng cần đảm bảo kiểu dữ liệu trả về của mỗi nhánh `WHEN` là đồng nhất. Ví dụ, không được trả về `INTEGER` ở một nhánh và `TEXT` ở nhánh khác.
:::

---
