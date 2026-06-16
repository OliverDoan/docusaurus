---
sidebar_position: 6
title: "6. Ràng buộc dữ liệu (Constraints)"
---

# Ràng buộc dữ liệu (Constraints)

Constraint là các quy tắc đặt ngay ở tầng cơ sở dữ liệu để đảm bảo dữ liệu luôn hợp lệ, không bị bẩn dù đến từ đâu. Bài này trình bày các ràng buộc thường dùng: PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, CHECK, cách thêm chúng bằng ALTER TABLE và những bẫy hay gặp. Hiểu constraint giúp bạn thiết kế bảng an toàn và tránh lỗi toàn vẹn dữ liệu.

---

## Mục lục

- [Vì sao cần ràng buộc (constraints)?](#vì-sao-cần-ràng-buộc-constraints)
- [Constraint là gì](#constraint-là-gì)
- [PRIMARY KEY](#primary-key)
- [FOREIGN KEY](#foreign-key)
- [UNIQUE](#unique)
- [NOT NULL](#not-null)
- [CHECK](#check)
- [Thêm Constraint bằng ALTER TABLE](#thêm-constraint-bằng-alter-table)
- [Bẫy thường gặp](#bẫy-thường-gặp)

---

## Vì sao cần ràng buộc (constraints)?

**Vấn đề:** Nếu chỉ dựa vào ứng dụng để kiểm tra dữ liệu, rất dễ lọt dữ liệu **rác** vào DB: email trùng nhau, thiếu trường bắt buộc, khóa ngoại trỏ tới bản ghi không tồn tại, hoặc giá trị vô lý (tuổi âm). Khi nhiều ứng dụng/service cùng ghi vào một DB, mỗi nơi có thể quên validate — càng dễ sai.

```sql
-- Không có ràng buộc: DB chấp nhận tất cả, kể cả dữ liệu rác
INSERT INTO users (email, age) VALUES ('a@x.com', -5);   -- tuổi âm vẫn lọt
INSERT INTO users (email, age) VALUES ('a@x.com', 30);   -- email trùng vẫn lọt
INSERT INTO orders (user_id) VALUES (9999);              -- user không tồn tại
```

**Giải pháp:** Đặt **CONSTRAINTS** ngay tại DB để cơ sở dữ liệu tự từ chối dữ liệu sai — đây là lớp bảo vệ cuối cùng, không thể bị bypass.

```sql
CREATE TABLE users (
    id     SERIAL PRIMARY KEY,                 -- định danh duy nhất
    email  VARCHAR(255) UNIQUE NOT NULL,        -- không trùng, bắt buộc
    age    INTEGER CHECK (age >= 0)             -- giá trị hợp lệ
);

CREATE TABLE orders (
    id       SERIAL PRIMARY KEY,
    user_id  INTEGER NOT NULL REFERENCES users(id),  -- toàn vẹn tham chiếu
    price    NUMERIC(10, 2) CHECK (price > 0)        -- giá phải dương
);
```

- **PRIMARY KEY** — định danh duy nhất từng hàng.
- **FOREIGN KEY** — toàn vẹn tham chiếu giữa các bảng.
- **UNIQUE** — không trùng lặp.
- **NOT NULL** — trường bắt buộc.
- **CHECK** — chỉ chấp nhận giá trị hợp lệ.
- **DEFAULT** — giá trị mặc định khi không truyền.

:::tip[Dùng thực tế]
- **Email UNIQUE:** đảm bảo mỗi tài khoản gắn với một email duy nhất, tránh đăng ký trùng.
- **FK đơn hàng → user:** không thể tạo đơn cho user không tồn tại, tránh dữ liệu mồ côi.
- **NOT NULL cho trường bắt buộc:** ví dụ `email`, `created_at` luôn phải có giá trị.
- **CHECK giá > 0:** chặn nhập giá âm hoặc bằng 0 cho sản phẩm.
:::

---

## Constraint là gì

Constraint (ràng buộc) là các quy tắc được định nghĩa **ở tầng cơ sở dữ liệu** nhằm đảm bảo tính toàn vẹn dữ liệu (data integrity). Khi dữ liệu vi phạm ràng buộc, PostgreSQL sẽ từ chối thao tác `INSERT`, `UPDATE` hoặc `DELETE` và trả về lỗi ngay lập tức.

:::info[Phân tích]
Tại sao cần constraint ở tầng DB thay vì chỉ validate ở application?

- Application có thể bị bypass (script, tool ETL, migration trực tiếp).
- Nhiều service cùng ghi vào một DB — mỗi service có thể quên validate.
- DB là nguồn sự thật cuối cùng; constraint đảm bảo không bao giờ có dữ liệu bẩn dù đến từ đâu.
:::

---

## PRIMARY KEY

Primary Key (khóa chính) xác định duy nhất mỗi hàng trong bảng. Nó tự động áp dụng hai ràng buộc:

- **NOT NULL** — không được để trống.
- **UNIQUE** — không được trùng lặp.

**Khai báo inline khi tạo bảng:**

```sql
-- Khóa chính đơn với SERIAL (tự tăng)
CREATE TABLE products (
    id        SERIAL PRIMARY KEY,
    name      VARCHAR(100) NOT NULL,
    price     NUMERIC(10, 2)
);

-- Hoặc dùng IDENTITY (chuẩn SQL:2003, khuyến nghị cho PostgreSQL >= 10)
CREATE TABLE orders (
    id        INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**Composite Primary Key (khóa chính kép):**

```sql
-- Ví dụ bảng trung gian many-to-many
CREATE TABLE order_items (
    order_id    INTEGER,
    product_id  INTEGER,
    quantity    INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (order_id, product_id)   -- đặt cuối bảng khi composite
);
```

:::tip[Mẹo]
Dùng `GENERATED ALWAYS AS IDENTITY` thay `SERIAL` cho dự án mới. `SERIAL` thực chất là shorthand tạo sequence và gán default — không phải một kiểu dữ liệu thật sự, dễ gây nhầm lẫn khi dump/restore schema.
:::

---

## FOREIGN KEY

Foreign Key (khóa ngoại) đảm bảo giá trị trong cột luôn tồn tại ở bảng được tham chiếu, tránh **orphan records** (bản ghi mồ côi).

```sql
CREATE TABLE customers (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE orders (
    id          SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    total       NUMERIC(12, 2),
    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);
```

**Hành vi khi xóa/cập nhật hàng cha:**

| Hành vi | ON DELETE | ON UPDATE | Mô tả |
|---|---|---|---|
| `RESTRICT` | Từ chối xóa | Từ chối sửa | Lỗi nếu còn hàng con tham chiếu |
| `CASCADE` | Xóa theo | Cập nhật theo | Hàng con bị xóa/cập nhật tự động |
| `SET NULL` | Gán NULL | Gán NULL | Cột FK của hàng con thành NULL |
| `SET DEFAULT` | Gán default | Gán default | Cột FK nhận giá trị DEFAULT |
| `NO ACTION` | Giống RESTRICT | Giống RESTRICT | Kiểm tra cuối transaction |

:::warning[Cần lưu ý]
`RESTRICT` và `NO ACTION` khác nhau ở thời điểm kiểm tra: `RESTRICT` kiểm tra ngay lập tức trong statement, còn `NO ACTION` kiểm tra vào cuối transaction — hữu ích khi cần defer constraint trong một transaction phức tạp.
:::

---

## UNIQUE

Constraint UNIQUE đảm bảo không có hai hàng nào có cùng giá trị trên cột (hoặc tổ hợp cột) được chỉ định.

```sql
CREATE TABLE users (
    id       SERIAL PRIMARY KEY,
    email    VARCHAR(255) NOT NULL UNIQUE,   -- inline
    username VARCHAR(50)  NOT NULL,
    phone    VARCHAR(20),
    CONSTRAINT uq_users_username UNIQUE (username)  -- đặt tên rõ ràng
);

-- UNIQUE trên nhiều cột (tổ hợp phải duy nhất, không phải từng cột)
CREATE TABLE user_roles (
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    CONSTRAINT uq_user_role UNIQUE (user_id, role_id)
);
```

:::info[Phân tích]
Trong PostgreSQL, **nhiều giá trị NULL được phép** tồn tại trong một cột có UNIQUE constraint — vì `NULL != NULL` theo chuẩn SQL. Đây là hành vi khác với một số database khác (ví dụ SQL Server chỉ cho một NULL).

Nếu muốn bắt buộc chỉ một NULL, dùng partial index:

```sql
CREATE UNIQUE INDEX uq_users_phone_notnull
    ON users (phone)
    WHERE phone IS NOT NULL;
```
:::

---

## NOT NULL

NOT NULL đảm bảo cột luôn có giá trị, không bao giờ là NULL.

```sql
CREATE TABLE employees (
    id         SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name  VARCHAR(50) NOT NULL,
    hire_date  DATE        NOT NULL DEFAULT CURRENT_DATE,
    department VARCHAR(100)           -- NULL được phép (nhân viên chưa có phòng ban)
);
```

:::tip[Mẹo]
Nên đặt NOT NULL cho tất cả cột mà logic nghiệp vụ yêu cầu phải có giá trị. Cho phép NULL khi cố ý — không phải khi quên. Cột NOT NULL kết hợp DEFAULT giúp thêm cột mới vào bảng lớn mà không cần backfill toàn bộ dữ liệu.
:::

---

## CHECK

CHECK cho phép định nghĩa điều kiện tùy ý trên một hoặc nhiều cột. PostgreSQL sẽ từ chối hàng không thỏa điều kiện.

```sql
CREATE TABLE products (
    id           SERIAL PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    price        NUMERIC(10, 2) NOT NULL,
    discount_pct NUMERIC(5, 2) DEFAULT 0,
    stock        INTEGER       NOT NULL DEFAULT 0,
    status       VARCHAR(20)   NOT NULL DEFAULT 'active',

    CONSTRAINT chk_products_price
        CHECK (price > 0),

    CONSTRAINT chk_products_discount
        CHECK (discount_pct >= 0 AND discount_pct <= 100),

    CONSTRAINT chk_products_stock
        CHECK (stock >= 0),

    CONSTRAINT chk_products_status
        CHECK (status IN ('active', 'inactive', 'discontinued'))
);
```

**CHECK trên nhiều cột:**

```sql
CREATE TABLE promotions (
    id         SERIAL PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date   DATE NOT NULL,
    discount   NUMERIC(5, 2) NOT NULL,

    CONSTRAINT chk_promotions_dates
        CHECK (end_date >= start_date),

    CONSTRAINT chk_promotions_discount
        CHECK (discount > 0 AND discount <= 100)
);
```

:::warning[Cần lưu ý]
CHECK constraint **không validate các hàng đã tồn tại** khi bạn thêm constraint bằng `ALTER TABLE`. Ví dụ, nếu bảng đang có hàng với `price = -5` và bạn thêm `CHECK (price > 0)`, PostgreSQL sẽ báo lỗi.

Để bỏ qua kiểm tra dữ liệu cũ (dùng tạm thời khi migrate):

```sql
ALTER TABLE products
    ADD CONSTRAINT chk_products_price CHECK (price > 0) NOT VALID;

-- Sau khi fix dữ liệu cũ, validate lại:
ALTER TABLE products
    VALIDATE CONSTRAINT chk_products_price;
```
:::

---

## Thêm Constraint bằng ALTER TABLE

Khi bảng đã có dữ liệu, dùng `ALTER TABLE` để thêm hoặc xóa constraint.

```sql
-- Thêm PRIMARY KEY (nếu chưa có)
ALTER TABLE legacy_table
    ADD CONSTRAINT pk_legacy PRIMARY KEY (id);

-- Thêm FOREIGN KEY
ALTER TABLE orders
    ADD CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id) REFERENCES customers (id)
        ON DELETE RESTRICT ON UPDATE CASCADE;

-- Thêm UNIQUE
ALTER TABLE users
    ADD CONSTRAINT uq_users_email UNIQUE (email);

-- Thêm NOT NULL
ALTER TABLE employees
    ALTER COLUMN department SET NOT NULL;

-- Thêm CHECK
ALTER TABLE products
    ADD CONSTRAINT chk_products_price CHECK (price > 0);

-- Xóa constraint theo tên
ALTER TABLE products
    DROP CONSTRAINT chk_products_price;

-- Xem tất cả constraints của bảng
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'products'::regclass;
```

:::tip[Mẹo]
Luôn đặt tên constraint theo quy ước `<loại>_<bảng>_<cột>` — ví dụ `fk_orders_customer`, `uq_users_email`, `chk_products_price`. Tên rõ ràng giúp đọc lỗi và tìm constraint để drop dễ hơn nhiều.
:::

---

## Bẫy thường gặp

**Bẫy 1: FOREIGN KEY không có index gây chậm**

```sql
-- Khi xóa một customer, PostgreSQL phải scan toàn bộ bảng orders
-- để kiểm tra xem còn order nào tham chiếu không
-- => Không có index trên customer_id là thảm họa với bảng lớn

-- Thêm index cho cột FK (PostgreSQL không tự tạo)
CREATE INDEX idx_orders_customer_id ON orders (customer_id);
```

:::warning[Cần lưu ý]
PostgreSQL tự động tạo index cho PRIMARY KEY và UNIQUE constraint, nhưng **không** tự tạo index cho FOREIGN KEY. Mỗi khi thêm FK, hãy nhớ thêm index cho cột đó trên bảng con để tránh sequential scan khi xóa/cập nhật hàng cha.
:::

**Bẫy 2: CHECK không validate dữ liệu cũ**

Như đã đề cập ở phần CHECK, khi thêm constraint bằng `ALTER TABLE`, PostgreSQL kiểm tra toàn bộ dữ liệu hiện có. Nếu có hàng vi phạm, lệnh sẽ thất bại. Dùng `NOT VALID` để thêm constraint mà không scan dữ liệu cũ, rồi `VALIDATE CONSTRAINT` sau khi đã sửa sạch dữ liệu.

**Bẫy 3: Xóa constraint nhưng không xóa index**

```sql
-- DROP CONSTRAINT trên UNIQUE sẽ xóa cả index liên quan — OK
-- Nhưng DROP CONSTRAINT trên FK không xóa index bạn tạo thủ công
-- Nhớ drop index thủ công nếu không còn cần:
DROP INDEX idx_orders_customer_id;
```

**Bẫy 4: Circular FOREIGN KEY trong cùng một transaction**

```sql
-- Nếu bảng A FK sang B và B FK sang A,
-- cần dùng DEFERRABLE để hoãn kiểm tra đến cuối transaction:
ALTER TABLE table_a
    ADD CONSTRAINT fk_a_b
        FOREIGN KEY (b_id) REFERENCES table_b (id)
        DEFERRABLE INITIALLY DEFERRED;
```
