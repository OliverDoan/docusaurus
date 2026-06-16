---
sidebar_position: 3
title: "3. DDL — Định nghĩa dữ liệu"
---

# DDL — Định nghĩa dữ liệu

DDL (Data Definition Language) là nhóm câu lệnh dùng để định nghĩa và quản lý cấu trúc của cơ sở dữ liệu — tạo bảng, sửa bảng, xóa bảng. Bài này đi qua các lệnh chính: CREATE TABLE, ALTER TABLE, DROP TABLE và TRUNCATE TABLE, kèm cảnh báo an toàn khi chạy trên production. Hiểu DDL là bước đầu để thiết kế và bảo trì schema đúng cách.

---

## Mục lục

- [Vì sao cần DDL?](#vì-sao-cần-ddl)
- [DDL là gì?](#ddl-là-gì)
- [CREATE TABLE](#create-table)
- [ALTER TABLE](#alter-table)
- [DROP TABLE](#drop-table)
- [TRUNCATE TABLE](#truncate-table)

---

## Vì sao cần DDL?

**Vấn đề:** Dữ liệu quan hệ cần một **cấu trúc rõ ràng** trước khi lưu — bảng nào, cột gì, kiểu dữ liệu ra sao, ràng buộc thế nào. Nếu cứ ném dữ liệu vào mà không định nghĩa trước, ta không kiểm soát được gì cả.

```sql
-- Không có cấu trúc: dữ liệu lộn xộn, sai kiểu, không kiểm soát
-- "users" lưu tuổi âm? email trùng? user_id trỏ tới ai?
('Nam', 'abc', -5)        -- tuổi âm vẫn lọt
('Lan', 'abc', 'hai mươi') -- kiểu lung tung, không ai chặn
```

**Giải pháp:** Dùng **DDL (Data Definition Language)** — nhóm lệnh `CREATE` / `ALTER` / `DROP` / `TRUNCATE` để **định nghĩa và thay đổi cấu trúc (schema)** của database, bảng, cột và ràng buộc. DDL đặt nền móng cho dữ liệu nhất quán: kiểu dữ liệu được ép đúng, ràng buộc tự động chặn dữ liệu sai.

```sql
-- Có cấu trúc: kiểu dữ liệu, ràng buộc rõ ràng ngay từ đầu
CREATE TABLE users (
    id    SERIAL       PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,   -- không trùng, không trống
    age   INT          CHECK (age >= 0)   -- chặn tuổi âm
);
```

:::tip[Dùng thực tế]
- **Tạo bảng `users`**: định nghĩa cột và kiểu dữ liệu bằng `CREATE TABLE`.
- **Thêm cột mới**: bổ sung `phone`, `address` vào bảng đang chạy bằng `ALTER TABLE`.
- **Đặt khóa chính / khóa ngoại**: ràng buộc `PRIMARY KEY`, `FOREIGN KEY` để liên kết và toàn vẹn dữ liệu.
- **Xóa bảng cũ**: dọn bảng không còn dùng bằng `DROP TABLE` (an toàn với `IF EXISTS`).
:::

---

## DDL là gì?

**DDL (Data Definition Language)** là tập hợp các câu lệnh SQL dùng để **định nghĩa và quản lý cấu trúc** của cơ sở dữ liệu — bảng, cột, kiểu dữ liệu, ràng buộc, index, v.v.

DDL là một trong bốn nhóm lệnh SQL chính:

| Nhóm | Viết tắt | Mục đích | Ví dụ lệnh |
|------|----------|----------|------------|
| Data Definition Language | DDL | Định nghĩa cấu trúc | `CREATE`, `ALTER`, `DROP`, `TRUNCATE` |
| Data Manipulation Language | DML | Thao tác dữ liệu | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
| Data Control Language | DCL | Phân quyền truy cập | `GRANT`, `REVOKE` |
| Transaction Control Language | TCL | Quản lý giao dịch | `COMMIT`, `ROLLBACK`, `SAVEPOINT` |

:::info[Phân tích]
Trong PostgreSQL, DDL thường **tự động COMMIT** sau khi thực thi — không cần gọi `COMMIT` thủ công. Tuy nhiên PostgreSQL hỗ trợ bao DDL trong transaction (`BEGIN ... COMMIT`), cho phép rollback nếu cần.
:::

---

## CREATE TABLE

### Cú pháp cơ bản

```sql
CREATE TABLE [IF NOT EXISTS] tên_bảng (
    tên_cột kiểu_dữ_liệu [ràng_buộc],
    ...
    [ràng_buộc_bảng]
);
```

### Ví dụ: Bảng `users`

```sql
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL          PRIMARY KEY,
    email       VARCHAR(255)    NOT NULL UNIQUE,
    full_name   VARCHAR(100)    NOT NULL,
    age         INT             CHECK (age >= 0 AND age <= 150),
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    is_active   BOOLEAN         NOT NULL DEFAULT TRUE
);
```

### Ví dụ: Bảng `orders` với khóa ngoại

```sql
CREATE TABLE IF NOT EXISTS orders (
    id          SERIAL          PRIMARY KEY,
    user_id     INT             NOT NULL,
    total       NUMERIC(12, 2)  NOT NULL CHECK (total >= 0),
    status      VARCHAR(20)     NOT NULL DEFAULT 'pending',
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT chk_orders_status
        CHECK (status IN ('pending', 'paid', 'cancelled', 'shipped'))
);
```

### Các ràng buộc (Constraint) thường dùng

| Constraint | Ý nghĩa |
|------------|---------|
| `PRIMARY KEY` | Khóa chính, duy nhất và NOT NULL |
| `NOT NULL` | Không được để trống |
| `UNIQUE` | Giá trị không được trùng |
| `DEFAULT <giá_trị>` | Giá trị mặc định khi không cung cấp |
| `CHECK (<biểu_thức>)` | Điều kiện hợp lệ cho cột |
| `FOREIGN KEY ... REFERENCES` | Khóa ngoại liên kết bảng khác |

:::tip[Mẹo]
Dùng `IF NOT EXISTS` để tránh lỗi khi script chạy lại (ví dụ trong migration). Câu lệnh sẽ bỏ qua nếu bảng đã tồn tại thay vì ném lỗi.
:::

---

## ALTER TABLE

`ALTER TABLE` dùng để **thay đổi cấu trúc bảng đã tồn tại** mà không cần xóa và tạo lại.

### Thêm cột mới

```sql
ALTER TABLE users
    ADD COLUMN phone VARCHAR(20),
    ADD COLUMN address TEXT;
```

### Xóa cột

```sql
ALTER TABLE users
    DROP COLUMN address;
```

### Đổi tên cột

```sql
ALTER TABLE users
    RENAME COLUMN full_name TO display_name;
```

### Thay đổi kiểu dữ liệu cột

```sql
-- Đổi kiểu dữ liệu (cần USING nếu không tự chuyển đổi được)
ALTER TABLE users
    ALTER COLUMN phone TYPE VARCHAR(30);

-- Ví dụ cần USING để ép kiểu
ALTER TABLE orders
    ALTER COLUMN total TYPE BIGINT USING total::BIGINT;
```

### Thêm / Xóa ràng buộc

```sql
-- Thêm ràng buộc CHECK
ALTER TABLE users
    ADD CONSTRAINT chk_users_age CHECK (age >= 18);

-- Thêm UNIQUE constraint
ALTER TABLE users
    ADD CONSTRAINT uq_users_phone UNIQUE (phone);

-- Xóa ràng buộc theo tên
ALTER TABLE users
    DROP CONSTRAINT chk_users_age;
```

### Đổi tên bảng

```sql
ALTER TABLE orders
    RENAME TO customer_orders;
```

:::warning[Cần lưu ý]
Khi `ALTER COLUMN TYPE`, PostgreSQL sẽ **viết lại toàn bộ bảng** (full table rewrite) trên một số phiên bản. Với bảng lớn (hàng triệu dòng), thao tác này có thể **khóa bảng trong vài phút**, gây gián đoạn production. Hãy thực hiện vào giờ thấp điểm hoặc dùng extension `pg_repack`.
:::

---

## DROP TABLE

`DROP TABLE` xóa hoàn toàn bảng khỏi cơ sở dữ liệu — bao gồm **cấu trúc lẫn toàn bộ dữ liệu**.

### Cú pháp

```sql
-- Xóa một bảng
DROP TABLE tên_bảng;

-- Không báo lỗi nếu bảng không tồn tại
DROP TABLE IF EXISTS tên_bảng;

-- Xóa nhiều bảng cùng lúc
DROP TABLE IF EXISTS orders, users;
```

### CASCADE — Xóa theo dây chuyền

```sql
-- Xóa users và tự động xóa các đối tượng phụ thuộc (FK, view, ...)
DROP TABLE IF EXISTS users CASCADE;
```

:::warning[Cần lưu ý]
`DROP TABLE` là thao tác **không thể hoàn tác** trong PostgreSQL trừ khi được bọc trong transaction.

**Quy tắc bắt buộc trên production:**
- Luôn bọc trong `BEGIN ... ROLLBACK` để kiểm tra trước, rồi mới `COMMIT`.
- Backup dữ liệu trước khi thực thi.
- Không dùng `CASCADE` bừa bãi — nó có thể xóa thêm bảng/view bạn không ngờ tới.
- Ưu tiên dùng `DROP TABLE IF EXISTS` để script an toàn hơn khi chạy lại.

```sql
-- Quy trình an toàn trên production
BEGIN;
DROP TABLE IF EXISTS users CASCADE;
-- Kiểm tra kết quả, nếu ổn thì:
COMMIT;
-- Nếu không ổn:
-- ROLLBACK;
```
:::

---

## TRUNCATE TABLE

`TRUNCATE TABLE` xóa **toàn bộ dữ liệu** trong bảng nhưng **giữ nguyên cấu trúc** (tên bảng, cột, constraint, index).

### Cú pháp

```sql
-- Xóa toàn bộ dữ liệu
TRUNCATE TABLE orders;

-- Reset chuỗi SERIAL/SEQUENCE về 1
TRUNCATE TABLE orders RESTART IDENTITY;

-- Xóa nhiều bảng + reset identity + cascade FK
TRUNCATE TABLE orders, order_items
    RESTART IDENTITY
    CASCADE;
```

### So sánh TRUNCATE vs DELETE vs DROP

| Tiêu chí | `TRUNCATE` | `DELETE` (không WHERE) | `DROP` |
|----------|------------|------------------------|--------|
| Xóa dữ liệu | Có | Có | Có |
| Giữ cấu trúc bảng | Có | Có | Không |
| Tốc độ | Rất nhanh | Chậm (dòng theo dòng) | Nhanh |
| Hỗ trợ mệnh đề WHERE | Không | Có | Không |
| Rollback được | Có (trong transaction) | Có | Có (trong transaction) |
| Reset SERIAL/SEQUENCE | Có (`RESTART IDENTITY`) | Không | Không áp dụng |
| Kích hoạt TRIGGER | Không | Có (`ON DELETE`) | Không |
| Ghi WAL log | Ít hơn | Nhiều | Ít |

:::info[Phân tích]
**Tại sao TRUNCATE nhanh hơn DELETE?**

`DELETE` xóa từng dòng một, ghi redo log cho mỗi dòng, và kích hoạt trigger. `TRUNCATE` hoạt động ở cấp độ **storage** — nó đánh dấu toàn bộ các trang dữ liệu là trống mà không cần duyệt từng dòng, nên thời gian thực thi gần như hằng số bất kể bảng có bao nhiêu dòng.
:::

:::warning[Cần lưu ý]
**Trên production, hãy cực kỳ thận trọng với TRUNCATE:**

- Không có mệnh đề WHERE — toàn bộ dữ liệu bị xóa, không lọc được.
- Trigger `ON DELETE` không được kích hoạt — các side-effect (audit log, cascade logic trong app) sẽ bị bỏ qua.
- Nếu cần xóa có điều kiện, dùng `DELETE FROM bảng WHERE <điều kiện>`.
- Luôn bọc trong transaction khi thực thi trên production:

```sql
BEGIN;
TRUNCATE TABLE orders RESTART IDENTITY;
-- Xác nhận số liệu trước khi commit
SELECT COUNT(*) FROM orders;
COMMIT;
-- Hoặc ROLLBACK nếu cần hủy
```
:::

---
