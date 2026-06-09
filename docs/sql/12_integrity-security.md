---
sidebar_position: 12
title: "12. Toàn vẹn & Bảo mật dữ liệu"
---

# Toàn vẹn & Bảo mật dữ liệu

Toàn vẹn dữ liệu là tập các quy tắc giữ cho dữ liệu luôn chính xác và nhất quán, còn bảo mật là việc kiểm soát ai được làm gì với dữ liệu đó. Đây là hai phần không thể thiếu khi đưa hệ thống lên môi trường thật. Bài này trình bày các loại constraint (PRIMARY KEY, FOREIGN KEY, CHECK...), nguyên tắc quyền tối thiểu, quản lý role và phân quyền GRANT/REVOKE, chống SQL Injection, audit log và Row Level Security.

---

## Mục lục

- [Data Integrity là gì](#data-integrity-là-gì)
- [Các loại Constraint đảm bảo toàn vẹn](#các-loại-constraint-đảm-bảo-toàn-vẹn)
- [Security: Nguyên tắc Least Privilege](#security-nguyên-tắc-least-privilege)
- [Tạo Role và User](#tạo-role-và-user)
- [GRANT và REVOKE](#grant-và-revoke)
- [Role-Based Access Control](#role-based-access-control)
- [DB Security Best Practices](#db-security-best-practices)
- [Row Level Security trong PostgreSQL](#row-level-security-trong-postgresql)
- [Tổng kết](#tổng-kết)

---

## Data Integrity là gì

**Data Integrity** (toàn vẹn dữ liệu) là tập hợp các quy tắc và cơ chế đảm bảo dữ liệu trong cơ sở dữ liệu luôn **chính xác**, **nhất quán** và **đáng tin cậy** trong suốt vòng đời của nó.

Có ba loại toàn vẹn dữ liệu chính:

| Loại | Định nghĩa | Ví dụ |
|---|---|---|
| **Entity Integrity** | Mỗi hàng trong bảng phải được xác định duy nhất | `PRIMARY KEY` không được `NULL` hoặc trùng lặp |
| **Referential Integrity** | Mối quan hệ giữa các bảng phải nhất quán | `FOREIGN KEY` phải trỏ đến giá trị tồn tại |
| **Domain Integrity** | Giá trị trong cột phải thuộc tập giá trị hợp lệ | `CHECK`, `NOT NULL`, kiểu dữ liệu phù hợp |

:::info[Phân tích]
Ba loại toàn vẹn này bổ sung cho nhau. Entity Integrity đảm bảo mỗi bản ghi là duy nhất, Referential Integrity đảm bảo quan hệ giữa các bảng không bị "treo", còn Domain Integrity đảm bảo từng giá trị riêng lẻ nằm trong phạm vi cho phép.
:::

---

## Các loại Constraint đảm bảo toàn vẹn

Database sử dụng **constraints** (ràng buộc) như là cơ chế kỹ thuật để thực thi ba loại toàn vẹn trên. Mỗi constraint đóng vai trò cụ thể:

| Constraint | Vai trò toàn vẹn | Loại |
|---|---|---|
| `PRIMARY KEY` | Xác định duy nhất từng hàng, không NULL | Entity |
| `FOREIGN KEY` | Đảm bảo giá trị tham chiếu tồn tại ở bảng cha | Referential |
| `UNIQUE` | Không cho phép giá trị trùng lặp trong cột | Entity / Domain |
| `NOT NULL` | Bắt buộc cột phải có giá trị | Domain |
| `CHECK` | Giới hạn giá trị theo điều kiện logic | Domain |

```sql
-- Ví dụ tổng hợp: bảng orders áp dụng nhiều loại constraint
CREATE TABLE orders (
    order_id    SERIAL PRIMARY KEY,                          -- Entity Integrity
    customer_id INT NOT NULL REFERENCES customers(id)        -- Referential Integrity
                    ON DELETE RESTRICT,
    status      VARCHAR(20) NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'paid', 'cancelled')),  -- Domain Integrity
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),  -- Domain Integrity
    order_date  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

:::tip[Mẹo]
Định nghĩa constraints ngay trong `CREATE TABLE` thay vì thêm sau bằng `ALTER TABLE`. Điều này giúp schema rõ ràng hơn và tránh việc bảng đã có dữ liệu xấu trước khi constraint được thêm vào.
:::

---

## Security: Nguyên tắc Least Privilege

**Least Privilege** (quyền tối thiểu) là nguyên tắc bảo mật cốt lõi: mỗi user hoặc ứng dụng chỉ được cấp đúng những quyền cần thiết để thực hiện công việc của mình, không hơn.

Ví dụ áp dụng thực tế:

- Ứng dụng web chỉ cần `SELECT`, `INSERT`, `UPDATE` — không cần `DROP TABLE` hay `TRUNCATE`
- Nhân viên báo cáo chỉ cần `SELECT` — không cần `INSERT` hay `DELETE`
- User backup chỉ cần quyền đọc toàn bộ database — không cần quyền ghi

:::danger[Nguy hiểm]
Tuyệt đối không dùng user `postgres` (superuser) làm tài khoản kết nối cho ứng dụng production. Nếu ứng dụng bị tấn công, kẻ tấn công sẽ có toàn quyền trên database server, bao gồm cả việc xóa toàn bộ dữ liệu hoặc đọc dữ liệu nhạy cảm.
:::

---

## Tạo Role và User

Trong PostgreSQL, **role** là đối tượng cơ bản để quản lý quyền. User thực chất là role có thuộc tính `LOGIN`.

```sql
-- Tạo role không có quyền đăng nhập (dùng để nhóm quyền)
CREATE ROLE readonly_role;
CREATE ROLE app_role;
CREATE ROLE admin_role;

-- Tạo user có thể đăng nhập
CREATE ROLE app_user WITH LOGIN PASSWORD 'strong_password_here';
CREATE ROLE report_user WITH LOGIN PASSWORD 'another_strong_password';

-- Xem danh sách role hiện có
SELECT rolname, rolsuper, rolinherit, rolcreaterole, rolcreatedb, rolcanlogin
FROM pg_roles
ORDER BY rolname;

-- Xóa user (phải revoke quyền trước)
-- DROP ROLE app_user;

-- Thay đổi mật khẩu
ALTER ROLE app_user WITH PASSWORD 'new_strong_password';

-- Giới hạn kết nối đồng thời
ALTER ROLE app_user CONNECTION LIMIT 20;
```

:::info[Phân tích]
PostgreSQL không phân biệt `CREATE USER` và `CREATE ROLE WITH LOGIN` — cả hai đều tạo ra một role. `CREATE USER` chỉ là cú pháp rút gọn với `LOGIN` được bật mặc định. Nên dùng `CREATE ROLE ... WITH LOGIN` để viết tường minh hơn.
:::

---

## GRANT và REVOKE

`GRANT` cấp quyền, `REVOKE` thu hồi quyền trên các đối tượng database.

```sql
-- ========================================
-- GRANT: Cấp quyền cho role/user
-- ========================================

-- Cấp quyền SELECT trên một bảng cụ thể
GRANT SELECT ON TABLE products TO readonly_role;

-- Cấp nhiều quyền cùng lúc
GRANT SELECT, INSERT, UPDATE ON TABLE orders TO app_role;

-- Cấp quyền trên tất cả bảng trong schema
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_role;

-- Cấp quyền DELETE (chỉ cho admin)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE customers TO admin_role;

-- Cấp quyền sử dụng sequence (cần thiết cho INSERT với SERIAL/BIGSERIAL)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_role;

-- Cấp quyền thực thi function
GRANT EXECUTE ON FUNCTION calculate_discount(NUMERIC, INT) TO app_role;

-- ========================================
-- Gán role cho user
-- ========================================
GRANT readonly_role TO report_user;
GRANT app_role TO app_user;

-- ========================================
-- REVOKE: Thu hồi quyền
-- ========================================

-- Thu hồi quyền DELETE đã cấp nhầm
REVOKE DELETE ON TABLE customers FROM app_role;

-- Thu hồi toàn bộ quyền trên bảng
REVOKE ALL PRIVILEGES ON TABLE orders FROM app_role;

-- Thu hồi membership của role
REVOKE app_role FROM app_user;

-- ========================================
-- Kiểm tra quyền hiện tại
-- ========================================
-- Xem quyền trên bảng
SELECT grantee, privilege_type, is_grantable
FROM information_schema.role_table_grants
WHERE table_name = 'orders';
```

:::warning[Cần lưu ý]
Khi dùng `GRANT SELECT ON ALL TABLES IN SCHEMA public TO role`, lệnh này chỉ áp dụng cho các bảng **đang tồn tại** tại thời điểm chạy. Bảng được tạo sau này sẽ không được cấp quyền tự động. Dùng `ALTER DEFAULT PRIVILEGES` để xử lý trường hợp này cho các bảng tương lai.
:::

```sql
-- Cấp quyền mặc định cho bảng tạo mới trong tương lai
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE ON TABLES TO app_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT ON TABLES TO readonly_role;
```

---

## Role-Based Access Control

Mô hình RBAC (Role-Based Access Control) giúp quản lý quyền theo nhóm vai trò thay vì cấp quyền từng user một.

```sql
-- Thiết lập hệ thống RBAC cho một ứng dụng thực tế

-- Bước 1: Tạo các role theo vai trò nghiệp vụ
CREATE ROLE role_viewer;    -- Chỉ đọc
CREATE ROLE role_editor;    -- Đọc và ghi
CREATE ROLE role_manager;   -- Đọc, ghi và xóa

-- Bước 2: Cấp quyền theo từng vai trò
GRANT SELECT ON ALL TABLES IN SCHEMA public TO role_viewer;

GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO role_editor;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO role_editor;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO role_manager;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO role_manager;

-- Bước 3: Tạo user và gán role phù hợp
CREATE ROLE alice WITH LOGIN PASSWORD 'pwd_alice';
CREATE ROLE bob   WITH LOGIN PASSWORD 'pwd_bob';
CREATE ROLE carol WITH LOGIN PASSWORD 'pwd_carol';

GRANT role_viewer  TO alice;   -- Alice chỉ xem báo cáo
GRANT role_editor  TO bob;     -- Bob nhập liệu
GRANT role_manager TO carol;   -- Carol quản lý dữ liệu

-- Một user có thể có nhiều role
GRANT role_viewer TO bob;  -- Bob vừa là editor vừa có quyền viewer
```

---

## DB Security Best Practices

### 1. Parameterized Query — Chống SQL Injection

SQL Injection là lỗ hổng nguy hiểm nhất xảy ra khi ứng dụng ghép chuỗi trực tiếp vào câu SQL.

```sql
-- MINH HỌA TẤN CÔNG (đừng làm thế này trong code thật)
-- Giả sử ứng dụng ghép chuỗi như sau:
-- query = "SELECT * FROM users WHERE username = '" + input + "'"
--
-- Kẻ tấn công nhập: ' OR '1'='1
-- Câu SQL thực thi trở thành:
-- SELECT * FROM users WHERE username = '' OR '1'='1'
-- => Trả về toàn bộ users!
--
-- Tệ hơn, nhập: '; DROP TABLE users; --
-- => Xóa toàn bộ bảng users!
```

```sql
-- CÁCH PHÒNG: Parameterized Query (ví dụ với psycopg2 Python)
-- cursor.execute("SELECT * FROM users WHERE username = %s", (user_input,))
--
-- Hoặc với prepared statement trong PostgreSQL:
PREPARE get_user (TEXT) AS
    SELECT id, username, email
    FROM users
    WHERE username = $1;

EXECUTE get_user('alice');

-- Driver tự động escape input, kẻ tấn công không thể can thiệp vào cấu trúc SQL
```

:::danger[Nguy hiểm]
Không bao giờ ghép chuỗi trực tiếp từ input người dùng vào câu SQL. Luôn dùng parameterized query hoặc prepared statement, dù là câu SELECT đơn giản nhất. Đây là lỗ hổng phổ biến nhất trong OWASP Top 10.
:::

### 2. Mã hóa dữ liệu

```sql
-- Kích hoạt SSL/TLS cho kết nối (cấu hình trong postgresql.conf)
-- ssl = on
-- ssl_cert_file = 'server.crt'
-- ssl_key_file = 'server.key'

-- Kiểm tra kết nối có dùng SSL không
SELECT ssl, version, cipher
FROM pg_stat_ssl
WHERE pid = pg_backend_pid();

-- Mã hóa dữ liệu nhạy cảm tại tầng ứng dụng hoặc dùng pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Lưu mật khẩu đã hash (không bao giờ lưu plain text)
INSERT INTO users (username, password_hash)
VALUES ('alice', crypt('user_password', gen_salt('bf', 12)));

-- Xác thực mật khẩu
SELECT id FROM users
WHERE username = 'alice'
  AND password_hash = crypt('user_password', password_hash);
```

### 3. Audit Log

```sql
-- Tạo bảng audit để ghi lại thay đổi dữ liệu quan trọng
CREATE TABLE audit_log (
    id          BIGSERIAL PRIMARY KEY,
    table_name  TEXT NOT NULL,
    operation   TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data    JSONB,
    new_data    JSONB,
    changed_by  TEXT NOT NULL DEFAULT current_user,
    changed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger tự động ghi audit log khi có thay đổi
CREATE OR REPLACE FUNCTION fn_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (table_name, operation, old_data, new_data)
    VALUES (
        TG_TABLE_NAME,
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_customers_audit
AFTER INSERT OR UPDATE OR DELETE ON customers
FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();
```

:::tip[Mẹo]
Ngoài audit log tự tạo, PostgreSQL hỗ trợ extension `pgaudit` chuyên dụng cho việc ghi log ở cấp độ statement và object. Đây là lựa chọn được khuyến nghị cho môi trường yêu cầu compliance như PCI-DSS hoặc HIPAA.
:::

---

## Row Level Security trong PostgreSQL

**Row Level Security (RLS)** cho phép kiểm soát quyền truy cập ở cấp độ từng hàng dữ liệu, không chỉ ở cấp bảng. Mỗi user chỉ nhìn thấy và thao tác được với các hàng mà policy cho phép.

```sql
-- Bật RLS trên bảng
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Mặc định sau khi bật RLS, không ai truy cập được (ngoài superuser)
-- Phải tạo policy để cho phép truy cập

-- Policy: mỗi customer chỉ thấy đơn hàng của mình
CREATE POLICY policy_orders_customer
    ON orders
    FOR ALL
    TO app_role
    USING (customer_id = current_setting('app.current_user_id')::INT);

-- Policy cho admin thấy tất cả đơn hàng
CREATE POLICY policy_orders_admin
    ON orders
    FOR ALL
    TO admin_role
    USING (TRUE);

-- Ứng dụng set context trước khi query
-- SET app.current_user_id = '42';
-- SELECT * FROM orders;  -- Chỉ trả về đơn hàng của customer_id = 42

-- Xem các policy đang áp dụng
SELECT schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'orders';

-- Tắt RLS (khi cần bảo trì)
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Xóa policy
DROP POLICY policy_orders_customer ON orders;
```

:::info[Phân tích]
RLS đặc biệt hữu ích trong kiến trúc multi-tenant, nơi nhiều khách hàng dùng chung một database. Thay vì filter dữ liệu ở tầng ứng dụng (có thể bị bypass nếu có lỗi), RLS đảm bảo cô lập dữ liệu ngay tại tầng database, an toàn hơn nhiều.
:::

---

## Tổng kết

| Chủ đề | Cơ chế chính | Mục tiêu |
|---|---|---|
| Entity Integrity | `PRIMARY KEY` | Mỗi hàng là duy nhất |
| Referential Integrity | `FOREIGN KEY` | Quan hệ nhất quán giữa bảng |
| Domain Integrity | `CHECK`, `NOT NULL`, kiểu dữ liệu | Giá trị hợp lệ trong cột |
| Access Control | `GRANT`, `REVOKE`, Role | Ai được làm gì |
| SQL Injection | Parameterized Query | Chống tấn công từ input |
| Mã hóa | SSL/TLS, pgcrypto | Bảo vệ dữ liệu truyền và lưu |
| Audit | Trigger + audit table | Theo dõi thay đổi |
| Row-level | RLS Policy | Cô lập dữ liệu theo hàng |

:::tip[Mẹo]
Checklist bảo mật database tối thiểu cho production: không dùng superuser cho app, bật SSL, dùng parameterized query, cấp quyền tối thiểu theo RBAC, bật audit log cho bảng nhạy cảm, backup định kỳ và kiểm tra restore thường xuyên.
:::
