---
sidebar_position: 14
title: "14. Stored Procedures & Functions"
---

# Stored Procedures & Functions

---

## Mục lục

- [Khái niệm](#khái-niệm)
- [Function](#function)
- [Procedure](#procedure)
- [So sánh Function và Procedure](#so-sánh-function-và-procedure)
- [Tham số IN OUT INOUT và biến DECLARE](#tham-số-in-out-inout-và-biến-declare)
- [Control Flow IF LOOP FOR](#control-flow-if-loop-for)
- [RAISE NOTICE và RAISE EXCEPTION](#raise-notice-và-raise-exception)
- [Trigger](#trigger)
- [DROP FUNCTION và DROP PROCEDURE](#drop-function-và-drop-procedure)

---

## Khái niệm

**Stored Procedures** và **Functions** là các khối mã SQL được lưu trực tiếp trong cơ sở dữ liệu và có thể gọi lại nhiều lần.

**Lợi ích:**

- **Tái sử dụng logic:** Viết một lần, gọi từ nhiều nơi (ứng dụng, query, trigger).
- **Giảm round-trip:** Thay vì gửi nhiều câu lệnh SQL riêng lẻ từ ứng dụng, gọi một lần duy nhất vào DB.
- **Đóng gói logic nghiệp vụ:** Che giấu chi tiết bảng/cột, cho phép thay đổi schema mà không ảnh hưởng ứng dụng.
- **Hiệu năng:** DB có thể cache execution plan của stored routine.

**Nhược điểm:**

- **Khó version control và test:** Logic nằm trong DB, không dễ quản lý bằng Git như code ứng dụng.
- **Logic phân tán:** Nghiệp vụ bị chia giữa ứng dụng và DB, khó debug và bảo trì.
- **Phụ thuộc vendor:** Cú pháp PL/pgSQL của PostgreSQL không tương thích với MySQL hay SQL Server.

:::warning[Cần lưu ý]
Chỉ đưa logic vào stored routine khi có lý do rõ ràng (ví dụ: trigger, tính toán nặng, bảo mật row-level). Tránh nhét toàn bộ business logic vào DB.
:::

---

## Function

Function nhận tham số đầu vào, thực hiện tính toán và **bắt buộc trả về một giá trị**.

### Cú pháp cơ bản

```sql
CREATE OR REPLACE FUNCTION ten_function(tham_so kieu_du_lieu)
RETURNS kieu_tra_ve
LANGUAGE plpgsql
AS $$
DECLARE
    bien_cuc_bo kieu_du_lieu;
BEGIN
    -- logic xử lý
    RETURN ket_qua;
END;
$$;
```

### Ví dụ 1 — Trả về scalar (một giá trị đơn)

Hàm tính tổng đơn hàng của một khách hàng:

```sql
CREATE OR REPLACE FUNCTION tinh_tong_don_hang(p_customer_id INT)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
    v_tong NUMERIC;
BEGIN
    SELECT COALESCE(SUM(total_amount), 0)
    INTO v_tong
    FROM orders
    WHERE customer_id = p_customer_id;

    RETURN v_tong;
END;
$$;

-- Gọi hàm bằng SELECT
SELECT tinh_tong_don_hang(42);
```

### Ví dụ 2 — Trả về TABLE (nhiều hàng)

Hàm lấy danh sách sản phẩm thuộc một danh mục:

```sql
CREATE OR REPLACE FUNCTION lay_san_pham_theo_danh_muc(p_category_id INT)
RETURNS TABLE(
    product_id   INT,
    product_name VARCHAR,
    price        NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
        SELECT p.id, p.name, p.price
        FROM products p
        WHERE p.category_id = p_category_id
        ORDER BY p.name;
END;
$$;

-- Gọi hàm trả về nhiều hàng
SELECT * FROM lay_san_pham_theo_danh_muc(5);
```

:::tip[Mẹo]
Dùng `RETURNS SETOF ten_bang` khi muốn trả về toàn bộ cấu trúc của một bảng có sẵn. Dùng `RETURNS TABLE(...)` khi muốn tự định nghĩa cột trả về.
:::

---

## Procedure

Procedure (thủ tục) tương tự Function nhưng **không trả về giá trị**. Điểm khác biệt quan trọng: Procedure có thể chứa lệnh `COMMIT` và `ROLLBACK` bên trong body.

### Cú pháp cơ bản

```sql
CREATE OR REPLACE PROCEDURE ten_procedure(tham_so kieu_du_lieu)
LANGUAGE plpgsql
AS $$
BEGIN
    -- logic xử lý
    -- có thể COMMIT hoặc ROLLBACK
END;
$$;
```

### Ví dụ — Chuyển tiền giữa hai tài khoản

```sql
CREATE OR REPLACE PROCEDURE chuyen_tien(
    p_tu_tai_khoan  INT,
    p_den_tai_khoan INT,
    p_so_tien       NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_so_du NUMERIC;
BEGIN
    -- Kiểm tra số dư
    SELECT balance INTO v_so_du
    FROM accounts
    WHERE id = p_tu_tai_khoan
    FOR UPDATE;

    IF v_so_du < p_so_tien THEN
        RAISE EXCEPTION 'Số dư không đủ. Hiện có: %, cần: %', v_so_du, p_so_tien;
    END IF;

    -- Trừ tiền tài khoản nguồn
    UPDATE accounts
    SET balance = balance - p_so_tien
    WHERE id = p_tu_tai_khoan;

    -- Cộng tiền tài khoản đích
    UPDATE accounts
    SET balance = balance + p_so_tien
    WHERE id = p_den_tai_khoan;

    COMMIT;
END;
$$;

-- Gọi procedure bằng CALL
CALL chuyen_tien(101, 202, 500000);
```

---

## So sánh Function và Procedure

| Tiêu chí | Function | Procedure |
|---|---|---|
| Trả về giá trị | Bắt buộc (`RETURNS`) | Không trả về |
| Cách gọi | `SELECT ten_function()` | `CALL ten_procedure()` |
| Dùng trong câu lệnh SQL | Được (trong `SELECT`, `WHERE`...) | Không được |
| COMMIT / ROLLBACK bên trong | Không hỗ trợ | Hỗ trợ |
| Dùng làm trigger function | Được | Không được |
| Phù hợp cho | Tính toán, lọc dữ liệu | Xử lý giao dịch phức tạp |

:::info[Phân tích]
PostgreSQL bổ sung `PROCEDURE` từ phiên bản 11. Trước đó, mọi thứ đều dùng `FUNCTION`. Nếu cần quản lý transaction thủ công bên trong routine, hãy chọn `PROCEDURE`.
:::

---

## Tham số IN OUT INOUT và biến DECLARE

### Loại tham số

```sql
CREATE OR REPLACE FUNCTION tinh_chia(
    IN  p_so_bi_chia  NUMERIC,
    IN  p_so_chia     NUMERIC,
    OUT p_thuong      NUMERIC,
    OUT p_phan_du     NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_so_chia = 0 THEN
        RAISE EXCEPTION 'Không thể chia cho 0';
    END IF;

    p_thuong   := FLOOR(p_so_bi_chia / p_so_chia);
    p_phan_du  := MOD(p_so_bi_chia, p_so_chia);
END;
$$;

-- Gọi hàm có tham số OUT
SELECT * FROM tinh_chia(17, 5);
-- Kết quả: p_thuong = 3, p_phan_du = 2
```

### Khai báo biến với DECLARE

```sql
CREATE OR REPLACE FUNCTION vi_du_declare()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_ten      TEXT    := 'PostgreSQL';
    v_phien_ban INT    := 16;
    v_thong_bao TEXT;
BEGIN
    v_thong_bao := v_ten || ' phiên bản ' || v_phien_ban;
    RETURN v_thong_bao;
END;
$$;
```

| Loại tham số | Ý nghĩa |
|---|---|
| `IN` | Chỉ đọc, truyền vào function (mặc định) |
| `OUT` | Chỉ ghi, trả giá trị ra ngoài |
| `INOUT` | Vừa nhận đầu vào vừa trả đầu ra |

---

## Control Flow IF LOOP FOR

### IF / ELSIF / ELSE

```sql
CREATE OR REPLACE FUNCTION xep_loai_diem(p_diem NUMERIC)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_diem >= 9 THEN
        RETURN 'Xuất sắc';
    ELSIF p_diem >= 7 THEN
        RETURN 'Khá';
    ELSIF p_diem >= 5 THEN
        RETURN 'Trung bình';
    ELSE
        RETURN 'Yếu';
    END IF;
END;
$$;

SELECT xep_loai_diem(8.5);  -- Kết quả: Khá
```

### FOR loop

```sql
CREATE OR REPLACE FUNCTION tinh_tong_1_den_n(p_n INT)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    v_tong INT := 0;
    i      INT;
BEGIN
    FOR i IN 1..p_n LOOP
        v_tong := v_tong + i;
    END LOOP;
    RETURN v_tong;
END;
$$;

SELECT tinh_tong_1_den_n(100);  -- Kết quả: 5050
```

### WHILE loop

```sql
CREATE OR REPLACE FUNCTION dem_nguoc(p_bat_dau INT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_so  INT  := p_bat_dau;
    v_ket TEXT := '';
BEGIN
    WHILE v_so > 0 LOOP
        v_ket := v_ket || v_so || ' ';
        v_so  := v_so - 1;
    END LOOP;
    RETURN TRIM(v_ket);
END;
$$;

SELECT dem_nguoc(5);  -- Kết quả: 5 4 3 2 1
```

---

## RAISE NOTICE và RAISE EXCEPTION

`RAISE` dùng để ghi log hoặc ném lỗi ra ngoài.

```sql
CREATE OR REPLACE PROCEDURE kiem_tra_tuoi(p_tuoi INT)
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE NOTICE 'Đang kiểm tra tuổi: %', p_tuoi;

    IF p_tuoi < 0 THEN
        RAISE EXCEPTION 'Tuổi không hợp lệ: %', p_tuoi
            USING ERRCODE = 'invalid_parameter_value';
    ELSIF p_tuoi < 18 THEN
        RAISE WARNING 'Người dùng chưa đủ 18 tuổi';
    ELSE
        RAISE NOTICE 'Tuổi hợp lệ';
    END IF;
END;
$$;

CALL kiem_tra_tuoi(20);
```

| Mức RAISE | Hành vi |
|---|---|
| `NOTICE` | In thông báo, tiếp tục thực thi |
| `WARNING` | In cảnh báo, tiếp tục thực thi |
| `EXCEPTION` | Ném lỗi, rollback transaction hiện tại |

:::warning[Cần lưu ý]
`RAISE EXCEPTION` sẽ rollback toàn bộ transaction đang chạy trừ khi được bắt bằng khối `BEGIN ... EXCEPTION ... END`.
:::

---

## Trigger

Trigger tự động kích hoạt khi có sự kiện INSERT, UPDATE hoặc DELETE xảy ra trên một bảng.

### Ví dụ — Tự động cập nhật cột updated_at

**Bước 1:** Tạo trigger function (phải trả về `TRIGGER`):

```sql
CREATE OR REPLACE FUNCTION cap_nhat_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;
```

**Bước 2:** Gắn trigger vào bảng:

```sql
CREATE TRIGGER trg_updated_at_products
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION cap_nhat_updated_at();
```

Từ đây, mỗi khi có `UPDATE` trên bảng `products`, cột `updated_at` sẽ được cập nhật tự động mà không cần ứng dụng xử lý.

:::info[Phân tích]
`NEW` là bản ghi mới sắp được ghi vào bảng (trong INSERT/UPDATE). `OLD` là bản ghi cũ trước khi thay đổi (trong UPDATE/DELETE). Trigger `BEFORE` cho phép thay đổi `NEW` trước khi lưu; trigger `AFTER` không thể thay đổi dữ liệu.
:::

---

## DROP FUNCTION và DROP PROCEDURE

Xóa function hoặc procedure khi không còn cần thiết:

```sql
-- Xóa function (cần ghi rõ kiểu tham số nếu có overloading)
DROP FUNCTION IF EXISTS tinh_tong_don_hang(INT);

DROP FUNCTION IF EXISTS lay_san_pham_theo_danh_muc(INT);

-- Xóa procedure
DROP PROCEDURE IF EXISTS chuyen_tien(INT, INT, NUMERIC);

-- Xóa trigger (phải chỉ định bảng)
DROP TRIGGER IF EXISTS trg_updated_at_products ON products;

-- Xóa trigger function
DROP FUNCTION IF EXISTS cap_nhat_updated_at();
```

:::tip[Mẹo]
Luôn dùng `IF EXISTS` khi DROP để tránh lỗi nếu đối tượng không tồn tại. Khi xóa trigger function, nhớ xóa trigger gắn vào bảng trước, sau đó mới xóa function.
:::
