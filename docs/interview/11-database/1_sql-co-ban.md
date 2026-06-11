---
sidebar_position: 1
title: "1. SQL Cơ Bản"
---

# SQL Cơ Bản

> *Vòng screening hay hỏi những câu này để loại nhanh ứng viên "chỉ biết ORM". Trả lời trơn tru phần cơ bản là điều kiện cần trước khi vào JOIN, index, transaction.*
>
> 📌 *Các chủ đề JOIN, WHERE vs HAVING, NULL, Subquery vs CTE, UNION đã có bài chi tiết tại [SQL & Databases — Queries & Joins](../09-sql/1_queries-joins.md).*

---

## Câu 1: SQL là gì? Các loại SQL commands chính? `[Intermediate]`

### Câu hỏi

> SQL là gì? Em phân loại các nhóm lệnh SQL (DDL, DML, DCL, TCL) và cho ví dụ từng nhóm?

### Giải thích lý thuyết

**SQL (Structured Query Language)** là ngôn ngữ chuẩn để định nghĩa, thao tác và truy vấn dữ liệu trong **relational database**. SQL là ngôn ngữ **declarative** — bạn mô tả *cái muốn lấy*, database engine tự quyết *cách lấy* (qua query planner).

Các nhóm lệnh chính:

| Nhóm | Tên đầy đủ | Mục đích | Lệnh tiêu biểu |
| ---- | ---------- | -------- | -------------- |
| **DDL** | Data Definition Language | Định nghĩa cấu trúc (schema) | `CREATE`, `ALTER`, `DROP`, `TRUNCATE` |
| **DML** | Data Manipulation Language | Thao tác dữ liệu | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
| **DCL** | Data Control Language | Phân quyền | `GRANT`, `REVOKE` |
| **TCL** | Transaction Control Language | Quản lý transaction | `BEGIN`, `COMMIT`, `ROLLBACK`, `SAVEPOINT` |

Điểm hay được hỏi xoáy:

- `TRUNCATE` (DDL) vs `DELETE` (DML): `TRUNCATE` xoá toàn bộ bảng nhanh hơn nhiều (không scan từng row, reset identity), nhưng không có `WHERE`, hạn chế trigger.
- Một số tài liệu tách `SELECT` thành nhóm riêng **DQL** (Data Query Language).
- DDL trong PostgreSQL **có thể rollback trong transaction** (transactional DDL) — khác MySQL.

### Code minh hoạ

```sql
-- DDL: định nghĩa schema
CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE users ADD COLUMN name TEXT;

-- DML: thao tác dữ liệu
INSERT INTO users (email, name) VALUES ('a@example.com', 'Alice');
SELECT id, email FROM users WHERE name = 'Alice';

-- DCL: phân quyền
GRANT SELECT, INSERT ON users TO app_readonly;
REVOKE INSERT ON users FROM app_readonly;

-- TCL: transaction
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT; -- hoặc ROLLBACK nếu có lỗi
```

### Đáp án mẫu

> "SQL là ngôn ngữ declarative chuẩn cho relational database — mình mô tả kết quả muốn lấy, query planner tự chọn cách thực thi. Lệnh chia 4 nhóm: **DDL** định nghĩa schema như CREATE/ALTER/DROP; **DML** thao tác dữ liệu — SELECT/INSERT/UPDATE/DELETE; **DCL** phân quyền với GRANT/REVOKE; **TCL** điều khiển transaction với BEGIN/COMMIT/ROLLBACK. Một chi tiết em hay nhấn: TRUNCATE thuộc DDL chứ không phải DML — nó xoá cả bảng không cần scan row nên nhanh hơn DELETE nhiều, nhưng không có WHERE. Và PostgreSQL hỗ trợ transactional DDL — ALTER TABLE rollback được trong transaction, rất quan trọng khi viết migration an toàn."

---

## Câu 2: Câu lệnh SELECT cơ bản — thứ tự thực thi `[Intermediate]`

### Câu hỏi

> Em viết cấu trúc đầy đủ của một câu SELECT, và giải thích thứ tự **thực thi logic** của các mệnh đề — nó khác thứ tự viết như thế nào?

### Giải thích lý thuyết

Cấu trúc đầy đủ theo **thứ tự viết**:

```sql
SELECT ... FROM ... JOIN ... WHERE ... GROUP BY ... HAVING ... ORDER BY ... LIMIT/OFFSET
```

Nhưng database **thực thi logic theo thứ tự khác** — đây là chìa khoá để hiểu mọi lỗi SQL kinh điển:

```
1. FROM + JOIN   → xác định nguồn dữ liệu
2. WHERE         → lọc từng row (chưa có group)
3. GROUP BY      → gom nhóm
4. HAVING        → lọc trên nhóm
5. SELECT        → tính expression, alias
6. DISTINCT      → khử trùng lặp
7. ORDER BY      → sắp xếp
8. LIMIT/OFFSET  → cắt kết quả
```

Hệ quả thực tế (điểm ăn tiền):

- **Alias trong `SELECT` không dùng được ở `WHERE`** (WHERE chạy trước SELECT) — nhưng dùng được ở `ORDER BY` (chạy sau).
- `WHERE` không dùng được aggregate function (`COUNT`, `SUM`) — vì lúc đó chưa GROUP BY; phải dùng `HAVING`.
- `LIMIT` chạy cuối cùng — `LIMIT 10` không có nghĩa là query "chỉ xử lý 10 row"; với `ORDER BY` cột không index, database vẫn phải sort toàn bộ rồi mới cắt.

### Code minh hoạ

```sql
-- Top 5 khách hàng chi tiêu nhiều nhất năm 2025, chỉ tính người mua >= 3 đơn
SELECT
  c.id,
  c.name,
  COUNT(o.id)        AS order_count,
  SUM(o.total)       AS total_spent
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.created_at >= '2025-01-01'      -- lọc row TRƯỚC khi gom nhóm
GROUP BY c.id, c.name
HAVING COUNT(o.id) >= 3                 -- lọc TRÊN nhóm
ORDER BY total_spent DESC               -- alias dùng được ở đây
LIMIT 5;

-- WRONG: alias chưa tồn tại lúc WHERE chạy
SELECT price * quantity AS revenue FROM orders WHERE revenue > 100; -- lỗi!

-- CORRECT: lặp lại expression hoặc dùng subquery/CTE
SELECT price * quantity AS revenue FROM orders WHERE price * quantity > 100;
```

### Đáp án mẫu

> "Thứ tự viết là SELECT-FROM-WHERE-GROUP BY-HAVING-ORDER BY-LIMIT, nhưng thứ tự **thực thi logic** là FROM/JOIN trước, rồi WHERE lọc row, GROUP BY gom nhóm, HAVING lọc nhóm, sau đó mới đến SELECT tính expression, cuối cùng ORDER BY và LIMIT. Hiểu thứ tự này giải thích được mọi lỗi kinh điển: alias trong SELECT không dùng được ở WHERE vì WHERE chạy trước, nhưng dùng được ở ORDER BY; aggregate không đặt được trong WHERE vì lúc đó chưa có nhóm — phải dùng HAVING. Và một hiểu nhầm performance: LIMIT chạy cuối nên LIMIT 10 với ORDER BY trên cột không index vẫn phải sort toàn bộ bảng rồi mới cắt 10 dòng."

---

## Câu 3: INSERT, UPDATE, DELETE hoạt động như thế nào? `[Intermediate]`

### Câu hỏi

> Em trình bày cách dùng INSERT, UPDATE, DELETE — kèm những lỗi nguy hiểm và các pattern an toàn trong production (RETURNING, UPSERT, batch)?

### Giải thích lý thuyết

**INSERT** — thêm row mới. Pattern hữu ích:

- Multi-row insert (1 câu nhiều VALUES) nhanh hơn nhiều lần insert đơn lẻ.
- **UPSERT**: `INSERT ... ON CONFLICT DO UPDATE` (PostgreSQL) — "có thì update, chưa có thì insert" trong 1 câu atomic, tránh race condition của kiểu check-rồi-insert.
- `RETURNING` (PostgreSQL): lấy lại row vừa ghi (id tự sinh) không cần SELECT thêm.

**UPDATE / DELETE** — sửa/xoá row khớp `WHERE`. Mối nguy lớn nhất: **quên WHERE → toàn bộ bảng bị sửa/xoá**, và lệnh vẫn chạy thành công không cảnh báo.

Quy tắc an toàn production:

1. **Viết SELECT với cùng WHERE trước** để xem đúng tập row sẽ bị ảnh hưởng.
2. Chạy trong **transaction**: `BEGIN` → chạy → kiểm tra số row affected → `COMMIT`/`ROLLBACK`.
3. DELETE/UPDATE lượng lớn nên **chia batch** để tránh giữ lock lâu và phình WAL/undo log.
4. Cân nhắc **soft delete** cho dữ liệu cần audit (xem bài Database Design).

### Code minh hoạ

```sql
-- INSERT nhiều row + lấy id vừa tạo
INSERT INTO products (name, price)
VALUES ('Áo thun', 150000), ('Quần jean', 450000)
RETURNING id, name;

-- UPSERT: atomic, không race condition
INSERT INTO user_settings (user_id, theme)
VALUES (42, 'dark')
ON CONFLICT (user_id)
DO UPDATE SET theme = EXCLUDED.theme, updated_at = now();

-- UPDATE an toàn: bọc transaction, kiểm tra trước khi commit
BEGIN;
SELECT count(*) FROM orders WHERE status = 'pending' AND created_at < now() - interval '30 days';
-- thấy đúng số lượng kỳ vọng rồi mới:
UPDATE orders SET status = 'expired'
WHERE status = 'pending' AND created_at < now() - interval '30 days';
COMMIT;

-- DELETE lượng lớn: chia batch tránh lock lâu
DELETE FROM logs
WHERE id IN (
  SELECT id FROM logs WHERE created_at < now() - interval '90 days' LIMIT 10000
);
-- lặp lại đến khi affected rows = 0
```

### Đáp án mẫu

> "INSERT thêm row — em luôn dùng multi-row VALUES cho batch và `RETURNING` để lấy id vừa sinh khỏi phải SELECT lại; với logic 'có thì update chưa có thì insert' em dùng `ON CONFLICT DO UPDATE` vì nó atomic, không race condition như kiểu check-rồi-insert. UPDATE và DELETE thì rủi ro lớn nhất là quên WHERE — lệnh vẫn chạy thành công và quét cả bảng. Kỷ luật của em ở production: viết SELECT với đúng WHERE đó trước để đếm row bị ảnh hưởng, bọc trong transaction để kiểm tra affected rows trước khi COMMIT, và xoá/sửa lượng lớn thì chia batch khoảng vài nghìn row mỗi lần để không giữ lock lâu. Dữ liệu cần audit thì em dùng soft delete thay vì xoá thật."

---

## Câu 4: GROUP BY dùng để làm gì? `[Intermediate]`

### Câu hỏi

> GROUP BY dùng để làm gì? Quy tắc "mọi cột trong SELECT phải nằm trong GROUP BY hoặc aggregate" nghĩa là sao? Cho ví dụ thực tế.

### Giải thích lý thuyết

**GROUP BY** gom các row có cùng giá trị ở (các) cột chỉ định thành **một nhóm**, để tính aggregate trên từng nhóm — trả về **1 row mỗi nhóm** thay vì từng row gốc.

Quy tắc cốt lõi: sau khi gom nhóm, mỗi nhóm chỉ xuất ra 1 row — nên mọi cột trong `SELECT` phải là:

- Cột nằm trong `GROUP BY` (giá trị chung của cả nhóm), hoặc
- Kết quả của **aggregate function** (gom nhiều giá trị thành một: `SUM`, `COUNT`...).

Cột "lửng lơ" ngoài 2 loại trên → database không biết lấy giá trị của row nào trong nhóm → PostgreSQL báo lỗi ngay (MySQL chế độ cũ trả giá trị tuỳ ý — nguồn bug kinh điển).

Mở rộng hay được hỏi:

- `GROUP BY` nhiều cột → nhóm theo tổ hợp giá trị.
- Muốn lấy "row chi tiết nhất trong mỗi nhóm" (VD: đơn hàng mới nhất của mỗi khách) → GROUP BY không đủ, cần **window function** (`ROW_NUMBER() OVER (PARTITION BY ...)`) — xem [bài Window function](../09-sql/1_queries-joins.md).

### Code minh hoạ

```sql
-- Doanh thu và số đơn theo tháng, theo trạng thái
SELECT
  date_trunc('month', created_at) AS month,
  status,
  COUNT(*)    AS order_count,
  SUM(total)  AS revenue,
  AVG(total)  AS avg_order_value
FROM orders
GROUP BY date_trunc('month', created_at), status
ORDER BY month;

-- WRONG: customer_name không trong GROUP BY, không phải aggregate
SELECT customer_id, customer_name, COUNT(*)
FROM orders
GROUP BY customer_id; -- PostgreSQL: lỗi "must appear in the GROUP BY clause"

-- CORRECT: thêm vào GROUP BY (hoặc dùng aggregate như MIN(customer_name))
SELECT customer_id, customer_name, COUNT(*)
FROM orders
GROUP BY customer_id, customer_name;
```

### Đáp án mẫu

> "GROUP BY gom row cùng giá trị thành nhóm để tính aggregate trên từng nhóm — output là một row mỗi nhóm. Vì thế có quy tắc: mọi cột trong SELECT phải hoặc nằm trong GROUP BY, hoặc nằm trong aggregate function — cột lửng lơ thì database không biết lấy giá trị của row nào trong nhóm; PostgreSQL chặn bằng lỗi, MySQL mode cũ trả giá trị tuỳ ý nên rất dễ bug ngầm. Ví dụ điển hình em hay dùng: doanh thu theo tháng với `date_trunc` cộng SUM và COUNT. Một giới hạn cần biết: GROUP BY chỉ trả thông tin tổng hợp — muốn lấy 'row mới nhất trong mỗi nhóm' thì phải chuyển sang window function với ROW_NUMBER PARTITION BY."

---

## Câu 5: Aggregate functions — các hàm phổ biến? `[Intermediate]`

### Câu hỏi

> Aggregate function là gì? Em kể các hàm phổ biến và những cái bẫy với NULL — `COUNT(*)` khác `COUNT(col)` thế nào?

### Giải thích lý thuyết

**Aggregate function** nhận **một tập row** và trả về **một giá trị duy nhất**. Dùng độc lập (toàn bảng là 1 nhóm) hoặc cùng `GROUP BY`.

Các hàm phổ biến:

| Hàm | Trả về | Ghi chú |
| --- | ------ | ------- |
| `COUNT(*)` | Số row | Đếm cả row toàn NULL |
| `COUNT(col)` | Số row có `col` **không NULL** | Khác biệt then chốt với `COUNT(*)` |
| `COUNT(DISTINCT col)` | Số giá trị khác nhau | |
| `SUM`, `AVG` | Tổng / trung bình | **Bỏ qua NULL**; `AVG` chia cho số row không-NULL |
| `MIN`, `MAX` | Nhỏ nhất / lớn nhất | Dùng được cho cả text, date |
| `STRING_AGG` / `ARRAY_AGG` (PG) | Gộp chuỗi / mảng | Tiện cho report |
| `FILTER (WHERE ...)` (PG) | Aggregate có điều kiện | Thay cho `SUM(CASE WHEN ...)` |

Bẫy NULL — phần interviewer thích xoáy:

- `AVG(col)` = `SUM(col) / COUNT(col)` — chia cho số row **không NULL**, không phải tổng số row. Muốn tính NULL như 0: `AVG(COALESCE(col, 0))`.
- `SUM` trên tập rỗng trả `NULL`, không phải 0 → bọc `COALESCE(SUM(x), 0)`.
- `COUNT(*)` trên tập rỗng trả `0` (an toàn).

### Code minh hoạ

```sql
-- Khác biệt COUNT
SELECT
  COUNT(*)                    AS total_rows,        -- 1000
  COUNT(phone)                AS rows_with_phone,   -- 700 (300 row phone NULL)
  COUNT(DISTINCT country)     AS countries          -- 25
FROM customers;

-- FILTER: đếm có điều kiện trong 1 lần scan (PostgreSQL)
SELECT
  COUNT(*)                                      AS total_orders,
  COUNT(*) FILTER (WHERE status = 'completed')  AS completed,
  COUNT(*) FILTER (WHERE status = 'cancelled')  AS cancelled,
  COALESCE(SUM(total) FILTER (WHERE status = 'completed'), 0) AS revenue
FROM orders
WHERE created_at >= '2026-01-01';

-- Bẫy AVG với NULL
SELECT AVG(rating)                 FROM reviews; -- chỉ chia cho row có rating
SELECT AVG(COALESCE(rating, 0))    FROM reviews; -- tính NULL như 0 — ý nghĩa khác hẳn
```

### Đáp án mẫu

> "Aggregate function gom một tập row thành một giá trị: COUNT, SUM, AVG, MIN, MAX, và trong PostgreSQL có thêm STRING_AGG/ARRAY_AGG cùng cú pháp FILTER rất tiện cho đếm có điều kiện. Phần dễ trượt là hành vi với NULL: `COUNT(*)` đếm mọi row còn `COUNT(col)` chỉ đếm row có giá trị; AVG bỏ qua NULL nên nó chia cho số row không-NULL — muốn coi NULL là 0 phải COALESCE trước, hai kết quả khác hẳn nhau về nghĩa; và SUM trên tập rỗng trả NULL chứ không phải 0 nên em luôn bọc COALESCE khi đưa lên report. Trick em hay dùng: `COUNT(*) FILTER (WHERE ...)` để lấy nhiều chỉ số có điều kiện khác nhau trong một lần scan thay vì query nhiều lần."

---

## Câu 6: CTE (Common Table Expressions) là gì? Lợi ích? `[Intermediate]`

### Câu hỏi

> CTE là gì? Lợi ích so với subquery lồng nhau? Recursive CTE dùng khi nào?

### Giải thích lý thuyết

**CTE** (`WITH ... AS`) là **bảng tạm có tên, tồn tại trong phạm vi một query** — cho phép tách query phức tạp thành các bước đặt tên được, đọc từ trên xuống.

Lợi ích:

1. **Readability**: thay vì subquery lồng 3-4 tầng đọc từ trong ra, CTE đọc tuần tự như pipeline từng bước.
2. **Tái sử dụng**: một CTE được tham chiếu nhiều lần trong cùng query (subquery thì phải copy-paste).
3. **Recursive CTE**: xử lý dữ liệu **phân cấp** (cây danh mục, org chart, đồ thị) — điều subquery thường không làm được.
4. Kết hợp **data-modifying CTE** (PostgreSQL): `WITH deleted AS (DELETE ... RETURNING *) INSERT INTO archive SELECT * FROM deleted` — di chuyển dữ liệu atomic trong 1 câu.

Lưu ý performance (điểm Senior): PostgreSQL 12+ tự **inline CTE** vào query chính như subquery (trừ khi dùng `MATERIALIZED` để ép tính trước, hoặc CTE được tham chiếu nhiều lần) — nên CTE hiện đại gần như không còn là "optimization fence" như lời đồn từ thời PG cũ.

> So sánh chi tiết Subquery vs JOIN vs CTE: xem [bài tại 09-sql](../09-sql/1_queries-joins.md).

### Code minh hoạ

```sql
-- CTE pipeline: từng bước có tên, đọc từ trên xuống
WITH monthly_revenue AS (
  SELECT date_trunc('month', created_at) AS month, SUM(total) AS revenue
  FROM orders
  GROUP BY 1
),
with_growth AS (
  SELECT
    month,
    revenue,
    LAG(revenue) OVER (ORDER BY month) AS prev_revenue
  FROM monthly_revenue
)
SELECT month, revenue,
       ROUND((revenue - prev_revenue) * 100.0 / prev_revenue, 1) AS growth_pct
FROM with_growth;

-- Recursive CTE: lấy toàn bộ cây danh mục con của category 1
WITH RECURSIVE category_tree AS (
  SELECT id, name, parent_id, 1 AS depth
  FROM categories
  WHERE id = 1                          -- anchor: gốc cây
  UNION ALL
  SELECT c.id, c.name, c.parent_id, ct.depth + 1
  FROM categories c
  JOIN category_tree ct ON c.parent_id = ct.id   -- bước đệ quy
)
SELECT * FROM category_tree;
```

### Đáp án mẫu

> "CTE là bảng tạm có tên trong phạm vi một query, khai báo bằng `WITH`. Ba lợi ích chính: query phức tạp đọc tuần tự như pipeline thay vì subquery lồng nhau đọc từ trong ra; một CTE tham chiếu được nhiều lần không phải copy-paste; và recursive CTE giải được bài toán phân cấp — cây danh mục, org chart — thứ subquery thường bó tay. PostgreSQL còn có data-modifying CTE để vừa DELETE RETURNING vừa INSERT vào bảng archive trong một câu atomic. Về performance, từ PostgreSQL 12 CTE được inline vào query chính nên không còn là optimization fence như trước — chỉ khi muốn ép materialize em mới thêm keyword `MATERIALIZED`. Quy tắc của em: subquery cho điều kiện đơn giản một tầng, CTE khi logic từ hai bước trở lên hoặc cần đệ quy."
