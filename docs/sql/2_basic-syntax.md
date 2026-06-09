---
sidebar_position: 2
title: "2. Cú pháp SQL cơ bản"
---

# Cú pháp SQL cơ bản

SQL (Structured Query Language) là ngôn ngữ để giao tiếp với cơ sở dữ liệu quan hệ. Bài này giới thiệu những quy tắc cú pháp nền tảng nhất: cách viết keyword, các từ khóa hay dùng, kiểu dữ liệu trong PostgreSQL, các toán tử và bốn lệnh cơ bản SELECT/INSERT/UPDATE/DELETE. Đây là phần bắt buộc phải nắm trước khi học các kỹ thuật nâng cao.

---

## Mục lục

- [Nền tảng SQL](#nền-tảng-sql)
- [Các từ khóa SQL hay dùng](#các-từ-khóa-sql-hay-dùng)
- [Kiểu dữ liệu trong PostgreSQL](#kiểu-dữ-liệu-trong-postgresql)
- [Toán tử](#toán-tử)
- [Bốn lệnh cơ bản](#bốn-lệnh-cơ-bản)

---

## Nền tảng SQL

SQL (Structured Query Language) có một số quy tắc cú pháp nền tảng mà bất kỳ ai làm việc với database đều phải nắm vững.

### Không phân biệt hoa thường (với keyword)

Keyword SQL không phân biệt hoa/thường — `SELECT`, `select`, `Select` đều hợp lệ. Tuy nhiên, **convention thực chiến** là viết keyword bằng CHỮ HOA để dễ đọc và tách biệt với tên bảng/cột.

```sql
-- Cả hai đều chạy được, nhưng dòng đầu là convention chuẩn
SELECT id, name FROM users WHERE active = true;
select id, name from users where active = true;
```

### Kết thúc câu lệnh bằng dấu `;`

Mỗi câu lệnh SQL kết thúc bằng dấu chấm phẩy. Một số client (như psql) bắt buộc điều này; không có `;` thì câu lệnh chưa được gửi đi.

```sql
SELECT NOW();
SELECT version();
```

### Comment

```sql
-- Đây là comment một dòng

/*
  Đây là comment
  nhiều dòng
*/

SELECT id, name -- lấy 2 cột
FROM users;
```

### Case sensitivity của data (dữ liệu)

Khác với keyword, **giá trị chuỗi** trong PostgreSQL **phân biệt hoa thường**:

```sql
-- Hai query này cho kết quả KHÁC NHAU
SELECT * FROM users WHERE name = 'Alice';
SELECT * FROM users WHERE name = 'alice';

-- Dùng ILIKE hoặc LOWER() để so sánh không phân biệt hoa thường
SELECT * FROM users WHERE LOWER(name) = 'alice';
SELECT * FROM users WHERE name ILIKE 'alice';
```

:::warning[Cần lưu ý]
Tên cột và tên bảng trong PostgreSQL mặc định được convert sang chữ thường. Nếu bạn tạo cột tên `"FirstName"` (có dấu ngoặc kép), bạn phải luôn query với ngoặc kép: `"FirstName"`. Tránh tên có ký tự hoa để khỏi rắc rối.
:::

---

## Các từ khóa SQL hay dùng

| Keyword | Nhóm | Mục đích |
|---|---|---|
| `SELECT` | DQL | Lấy dữ liệu |
| `FROM` | DQL | Chỉ định bảng nguồn |
| `WHERE` | DQL/DML | Lọc theo điều kiện |
| `JOIN` | DQL | Kết hợp nhiều bảng |
| `GROUP BY` | DQL | Gom nhóm dữ liệu |
| `HAVING` | DQL | Lọc sau khi GROUP BY |
| `ORDER BY` | DQL | Sắp xếp kết quả |
| `DISTINCT` | DQL | Loại bỏ bản ghi trùng |
| `AS` | DQL | Đặt alias cho cột/bảng |
| `LIMIT` / `OFFSET` | DQL | Phân trang |
| `INSERT INTO` | DML | Thêm dữ liệu |
| `UPDATE` | DML | Sửa dữ liệu |
| `DELETE` | DML | Xóa dữ liệu |
| `CREATE TABLE` | DDL | Tạo bảng |
| `ALTER TABLE` | DDL | Sửa cấu trúc bảng |
| `DROP TABLE` | DDL | Xóa bảng |
| `AND` / `OR` / `NOT` | Logic | Kết hợp điều kiện |
| `IN` / `NOT IN` | Logic | So sánh với danh sách |
| `BETWEEN` | Logic | So sánh khoảng giá trị |
| `IS NULL` / `IS NOT NULL` | Logic | Kiểm tra giá trị NULL |
| `LIKE` / `ILIKE` | Logic | So sánh pattern chuỗi |

:::tip[Mẹo]
Học SQL theo nhóm DQL → DML → DDL sẽ nhanh hơn học từng keyword rời. DQL (Data Query Language) là nhóm dùng hằng ngày nhất — nắm chắc `SELECT` trước, mọi thứ còn lại sẽ logic hơn.
:::

---

## Kiểu dữ liệu trong PostgreSQL

Chọn đúng kiểu dữ liệu ảnh hưởng trực tiếp đến hiệu năng, dung lượng lưu trữ và tính đúng đắn của dữ liệu.

### Số nguyên

| Kiểu | Kích thước | Khoảng giá trị | Ghi chú |
|---|---|---|---|
| `SMALLINT` | 2 bytes | -32,768 đến 32,767 | Ít dùng |
| `INTEGER` / `INT` | 4 bytes | -2,147,483,648 đến 2,147,483,647 | Phổ biến nhất |
| `BIGINT` | 8 bytes | ±9.2 × 10^18 | Dùng cho ID lớn, timestamp |
| `SERIAL` | 4 bytes | 1 đến 2,147,483,647 | Auto-increment (legacy) |
| `BIGSERIAL` | 8 bytes | 1 đến 9.2 × 10^18 | Auto-increment lớn |

:::info[Phân tích]
PostgreSQL 10+ khuyến khích dùng `GENERATED ALWAYS AS IDENTITY` thay vì `SERIAL`. Tuy nhiên `SERIAL` vẫn hoạt động và rất phổ biến trong code cũ.
:::

### Số thực / thập phân

| Kiểu | Độ chính xác | Dùng khi nào |
|---|---|---|
| `NUMERIC(p, s)` / `DECIMAL(p, s)` | Chính xác tuyệt đối | Tiền tệ, tài chính |
| `REAL` | ~6 chữ số thập phân | Tính toán khoa học, chấp nhận sai số |
| `DOUBLE PRECISION` | ~15 chữ số thập phân | Tính toán khoa học, chấp nhận sai số |

```sql
-- Tiền tệ: dùng NUMERIC để tránh sai số floating point
price NUMERIC(12, 2)  -- tối đa 12 chữ số, 2 chữ số sau dấu phẩy
```

### Chuỗi ký tự

| Kiểu | Mô tả |
|---|---|
| `VARCHAR(n)` | Chuỗi tối đa n ký tự |
| `CHAR(n)` | Chuỗi cố định n ký tự, tự đệm space |
| `TEXT` | Chuỗi không giới hạn độ dài |

```sql
-- PostgreSQL: TEXT và VARCHAR không khác nhau về hiệu năng
-- Dùng TEXT khi không có lý do gì để giới hạn độ dài
username VARCHAR(50),
bio      TEXT
```

### Boolean

```sql
is_active BOOLEAN DEFAULT true

-- Giá trị hợp lệ: true/false, 'yes'/'no', 'on'/'off', '1'/'0'
SELECT * FROM users WHERE is_active = true;
SELECT * FROM users WHERE is_active;  -- Shorthand
```

### Ngày giờ

| Kiểu | Mô tả | Ví dụ |
|---|---|---|
| `DATE` | Chỉ ngày | `'2024-01-15'` |
| `TIME` | Chỉ giờ (không timezone) | `'14:30:00'` |
| `TIMESTAMP` | Ngày + giờ (không timezone) | `'2024-01-15 14:30:00'` |
| `TIMESTAMPTZ` | Ngày + giờ + timezone | `'2024-01-15 14:30:00+07'` |
| `INTERVAL` | Khoảng thời gian | `'2 hours 30 minutes'` |

:::warning[Cần lưu ý]
Luôn dùng `TIMESTAMPTZ` (timestamp with time zone) cho các trường ghi nhận thời điểm sự kiện. `TIMESTAMP` không lưu timezone, gây ra bug khó phát hiện khi hệ thống chạy đa timezone.
:::

### Các kiểu đặc biệt

| Kiểu | Mô tả | Dùng khi nào |
|---|---|---|
| `UUID` | Universal Unique Identifier | Primary key phân tán, tránh lộ sequence |
| `JSON` | JSON dạng text | Ít dùng |
| `JSONB` | JSON dạng binary (có index) | Lưu dữ liệu bán cấu trúc |
| `ARRAY` | Mảng của kiểu bất kỳ | Tags, danh sách đơn giản |

```sql
-- UUID làm primary key
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

-- JSONB với index
metadata JSONB,
CREATE INDEX idx_metadata ON products USING GIN (metadata);

-- ARRAY
tags TEXT[] DEFAULT '{}'
```

---

## Toán tử

### Toán tử so sánh

| Toán tử | Ý nghĩa | Ví dụ |
|---|---|---|
| `=` | Bằng | `age = 25` |
| `<>` hoặc `!=` | Khác | `status <> 'inactive'` |
| `<` | Nhỏ hơn | `price < 100` |
| `>` | Lớn hơn | `score > 90` |
| `<=` | Nhỏ hơn hoặc bằng | `age <= 18` |
| `>=` | Lớn hơn hoặc bằng | `quantity >= 1` |
| `BETWEEN x AND y` | Trong khoảng | `age BETWEEN 18 AND 65` |
| `IN (...)` | Thuộc danh sách | `status IN ('active', 'pending')` |
| `NOT IN (...)` | Không thuộc danh sách | `id NOT IN (1, 2, 3)` |
| `IS NULL` | Là NULL | `deleted_at IS NULL` |
| `IS NOT NULL` | Không phải NULL | `email IS NOT NULL` |
| `LIKE` | Pattern (phân biệt hoa thường) | `name LIKE 'Ali%'` |
| `ILIKE` | Pattern (không phân biệt hoa thường) | `name ILIKE '%alice%'` |

```sql
-- LIKE pattern: % khớp chuỗi bất kỳ, _ khớp 1 ký tự
SELECT * FROM users WHERE name LIKE 'A%';     -- bắt đầu bằng A
SELECT * FROM users WHERE email LIKE '%@gmail.com';  -- email gmail
SELECT * FROM users WHERE code LIKE 'US_'';   -- US + đúng 1 ký tự
```

### Toán tử logic

```sql
-- AND: cả hai điều kiện phải đúng
SELECT * FROM orders
WHERE status = 'paid' AND total > 500000;

-- OR: ít nhất một điều kiện đúng
SELECT * FROM users
WHERE role = 'admin' OR role = 'moderator';

-- NOT: đảo ngược điều kiện
SELECT * FROM products
WHERE NOT (stock = 0);

-- Kết hợp: dùng ngoặc để rõ ý định
SELECT * FROM orders
WHERE (status = 'paid' OR status = 'processing')
  AND created_at >= '2024-01-01';
```

### Toán tử số học

```sql
SELECT
  price,
  quantity,
  price * quantity            AS total,
  price * quantity * 0.1      AS tax,
  price * quantity * 1.1      AS total_with_tax,
  price - (price * discount)  AS discounted_price
FROM order_items;
```

---

## Bốn lệnh cơ bản

### SELECT — Truy vấn dữ liệu

```sql
-- Lấy tất cả cột
SELECT * FROM users;

-- Lấy cột cụ thể với alias
SELECT
  id,
  name        AS full_name,
  email,
  created_at  AS joined_date
FROM users
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 10;
```

### INSERT — Thêm dữ liệu

```sql
-- Thêm một dòng
INSERT INTO users (name, email, is_active)
VALUES ('Nguyễn Văn A', 'nva@example.com', true);

-- Thêm nhiều dòng trong một câu lệnh (hiệu quả hơn loop)
INSERT INTO products (name, price, stock)
VALUES
  ('Cà phê đen', 25000, 100),
  ('Cà phê sữa', 30000, 80),
  ('Trà đào', 35000, 60);

-- INSERT và lấy lại dữ liệu vừa thêm
INSERT INTO users (name, email)
VALUES ('Trần Thị B', 'ttb@example.com')
RETURNING id, created_at;
```

### UPDATE — Cập nhật dữ liệu

```sql
-- Cập nhật một cột
UPDATE users
SET is_active = false
WHERE id = 42;

-- Cập nhật nhiều cột
UPDATE products
SET
  price = 28000,
  updated_at = NOW()
WHERE id = 5;

-- Cập nhật với RETURNING để xem kết quả
UPDATE orders
SET status = 'shipped'
WHERE status = 'paid' AND created_at < NOW() - INTERVAL '1 day'
RETURNING id, status, updated_at;
```

:::warning[Cần lưu ý]
Luôn có mệnh đề `WHERE` khi dùng `UPDATE` và `DELETE`. Thiếu `WHERE` sẽ cập nhật/xóa toàn bộ bảng — không có cách phục hồi nếu không có backup.
:::

### DELETE — Xóa dữ liệu

```sql
-- Xóa một dòng theo ID
DELETE FROM users WHERE id = 42;

-- Xóa theo điều kiện
DELETE FROM sessions
WHERE expires_at < NOW();

-- Xóa và lấy lại danh sách đã xóa
DELETE FROM temp_logs
WHERE created_at < NOW() - INTERVAL '30 days'
RETURNING id, created_at;
```

:::info[Phân tích]
Trong production, thường dùng **soft delete** thay vì xóa thật: thêm cột `deleted_at TIMESTAMPTZ` và `UPDATE ... SET deleted_at = NOW()` thay vì `DELETE`. Cách này giữ được lịch sử dữ liệu và dễ phục hồi khi cần.
:::

---
