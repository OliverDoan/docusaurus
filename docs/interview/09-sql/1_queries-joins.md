---
sidebar_position: 1
title: "1. Queries & JOINs"
---

# Queries & JOINs

> *Interviewer dùng câu hỏi SQL JOIN và aggregation để phân biệt ứng viên junior chỉ nhớ cú pháp với ứng viên senior hiểu rõ tại sao dữ liệu bị mất hoặc bị nhân lên.*

---

## Câu 1: INNER JOIN vs LEFT JOIN — tìm bản ghi "không khớp" `[Intermediate]`

### Câu hỏi

> Phân biệt `INNER JOIN` và `LEFT JOIN`. Làm thế nào để tìm tất cả khách hàng **chưa có đơn hàng nào** trong bảng `orders`?

### Giải thích lý thuyết

| JOIN type | Kết quả |
| --------- | ------- |
| `INNER JOIN` | Chỉ giữ các dòng khớp ở **cả hai bảng** |
| `LEFT JOIN` | Giữ **toàn bộ** bảng trái; bảng phải điền `NULL` nếu không khớp |
| `RIGHT JOIN` | Ngược lại `LEFT JOIN` |
| `FULL OUTER JOIN` | Giữ tất cả dòng từ cả hai phía |

Để tìm bản ghi "không khớp" (anti-join pattern), dùng `LEFT JOIN ... WHERE right_table.id IS NULL`. Cách này hiệu quả hơn `NOT IN` khi bảng phải có thể chứa `NULL`.

### Code minh hoạ

```sql
-- Tìm khách hàng chưa có đơn hàng nào
SELECT c.customer_id, c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.order_id IS NULL;

-- So sánh: INNER JOIN chỉ trả về khách hàng CÓ đơn hàng
SELECT DISTINCT c.customer_id, c.name
FROM customers c
INNER JOIN orders o ON o.customer_id = c.customer_id;
```

### Đáp án mẫu

> "Em hiểu `INNER JOIN` chỉ giữ dòng khớp ở hai bảng, còn `LEFT JOIN` giữ toàn bộ bảng trái và điền `NULL` cho phần không khớp. Để tìm khách hàng chưa có đơn hàng, em dùng anti-join pattern: `LEFT JOIN orders ON ... WHERE orders.order_id IS NULL`. Em ưu tiên cách này hơn `NOT IN` vì nếu subquery trả về `NULL` thì `NOT IN` sẽ không trả về dòng nào — một bẫy phổ biến trong thực tế."

---

## Câu 2: WHERE vs HAVING — quy tắc GROUP BY `[Intermediate]`

### Câu hỏi

> Phân biệt mệnh đề `WHERE` và `HAVING`. Tại sao câu query sau bị lỗi?
>
> ```sql
> SELECT department_id, name, COUNT(*) AS total
> FROM employees
> GROUP BY department_id
> HAVING total > 5;
> ```

### Giải thích lý thuyết

Thứ tự logic thực thi SQL (không phải thứ tự viết):

```
FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
```

- **WHERE**: lọc các **dòng thô** trước khi nhóm — không được dùng hàm aggregate.
- **HAVING**: lọc sau khi đã nhóm — được dùng hàm aggregate.

Quy tắc GROUP BY: mọi cột trong `SELECT` phải hoặc nằm trong `GROUP BY`, hoặc bọc trong hàm aggregate (`COUNT`, `SUM`, `MAX`, ...). Cột `name` trong ví dụ trên vi phạm quy tắc này vì nó không nằm trong `GROUP BY` và cũng không có aggregate.

| Mệnh đề | Lọc lúc nào | Dùng aggregate được không |
| ------- | ----------- | ------------------------- |
| `WHERE` | Trước GROUP BY | Không |
| `HAVING` | Sau GROUP BY | Có |

### Code minh hoạ

```sql
-- SAI: name không nằm trong GROUP BY hoặc aggregate
SELECT department_id, name, COUNT(*) AS total
FROM employees
GROUP BY department_id
HAVING COUNT(*) > 5;

-- ĐÚNG: chỉ select cột thuộc GROUP BY hoặc aggregate
SELECT department_id, COUNT(*) AS total
FROM employees
WHERE hire_date >= '2020-01-01'   -- lọc dòng thô trước
GROUP BY department_id
HAVING COUNT(*) > 5;              -- lọc sau khi nhóm

-- ĐÚNG nếu muốn kèm tên phòng: JOIN thêm bảng departments
SELECT d.name, COUNT(*) AS total
FROM employees e
JOIN departments d ON d.department_id = e.department_id
WHERE e.hire_date >= '2020-01-01'
GROUP BY d.department_id, d.name
HAVING COUNT(*) > 5;
```

### Đáp án mẫu

> "Em phân biệt bằng thứ tự thực thi: `WHERE` chạy trước `GROUP BY` nên không dùng được aggregate, còn `HAVING` chạy sau nên dùng được. Query bị lỗi vì cột `name` không có trong `GROUP BY` và không bọc aggregate — PostgreSQL báo lỗi ngay. Trong thực tế em hay gặp bẫy này khi chuyển code từ MySQL sang PostgreSQL vì MySQL đôi khi cho qua nhờ `ONLY_FULL_GROUP_BY` bị tắt."

---

## Câu 3: Xử lý NULL — bẫy NOT IN và logic 3 trị `[Intermediate]`

### Câu hỏi

> Query dưới đây trả về **0 dòng** dù bảng `employees` có dữ liệu. Tại sao?
>
> ```sql
> SELECT * FROM employees
> WHERE department_id NOT IN (
>     SELECT department_id FROM departments WHERE active = false
> );
> ```

### Giải thích lý thuyết

SQL dùng **3-valued logic**: `TRUE`, `FALSE`, và `UNKNOWN`. Mọi phép so sánh với `NULL` đều trả về `UNKNOWN`, và `UNKNOWN` bị xử lý như `FALSE` trong mệnh đề `WHERE`.

Khi subquery trả về ít nhất một `NULL`:

- `x NOT IN (1, 2, NULL)` tương đương `x <> 1 AND x <> 2 AND x <> NULL`
- `x <> NULL` luôn là `UNKNOWN`
- `TRUE AND UNKNOWN = UNKNOWN` → dòng bị loại

Vì vậy nếu bất kỳ dòng nào trong subquery có `department_id IS NULL`, toàn bộ `NOT IN` trả về rỗng.

Các bẫy NULL khác cần nhớ:

| Tình huống | Hành vi |
| ---------- | ------- |
| `COUNT(*)` | Đếm tất cả dòng kể cả `NULL` |
| `COUNT(column)` | Bỏ qua `NULL` |
| `SUM`, `AVG`, `MAX`, `MIN` | Bỏ qua `NULL` |
| `= NULL` | Luôn `UNKNOWN` — dùng `IS NULL` |
| `NULL = NULL` | `UNKNOWN`, không phải `TRUE` |

### Code minh hoạ

```sql
-- BẪY: nếu subquery có NULL thì không dòng nào được trả về
SELECT * FROM employees
WHERE department_id NOT IN (
    SELECT department_id FROM departments WHERE active = false
);

-- AN TOÀN: lọc NULL trong subquery
SELECT * FROM employees
WHERE department_id NOT IN (
    SELECT department_id
    FROM departments
    WHERE active = false
      AND department_id IS NOT NULL
);

-- TỐT NHẤT: dùng NOT EXISTS (tránh bẫy NULL hoàn toàn)
SELECT e.*
FROM employees e
WHERE NOT EXISTS (
    SELECT 1
    FROM departments d
    WHERE d.department_id = e.department_id
      AND d.active = false
);

-- Kiểm tra NULL đúng cách
SELECT * FROM employees WHERE manager_id IS NULL;     -- ĐÚNG
SELECT * FROM employees WHERE manager_id = NULL;      -- SAI: luôn 0 dòng
```

### Đáp án mẫu

> "Em đã gặp bẫy này rồi. Vấn đề là SQL dùng logic 3 trị: mọi so sánh với `NULL` trả về `UNKNOWN`, và `NOT IN` sẽ bao gồm điều kiện `x <> NULL` — luôn `UNKNOWN` — khiến toàn bộ bảng bị lọc ra. Giải pháp em thường dùng là `NOT EXISTS` vì nó xử lý `NULL` đúng cách, hoặc thêm `AND department_id IS NOT NULL` vào subquery. Em cũng nhớ rằng `COUNT(column)` bỏ qua `NULL` còn `COUNT(*)` thì không, nên phải cẩn thận khi tính tỉ lệ."

---

## Câu 4: Subquery vs JOIN vs CTE — khi nào dùng cái nào? `[Senior]`

### Câu hỏi

> Bạn có 3 cách viết cùng một logic: subquery, JOIN, và CTE. Bạn chọn cách nào trong trường hợp nào? Correlated subquery ảnh hưởng performance ra sao?

### Giải thích lý thuyết

**Correlated subquery** là subquery tham chiếu cột từ query ngoài — nó chạy lại **một lần cho mỗi dòng** của query ngoài, tương đương `O(n)` lần thực thi.

| Kỹ thuật | Ưu điểm | Nhược điểm |
| -------- | ------- | ---------- |
| **JOIN** | Query planner tối ưu tốt nhất, nhanh | Phức tạp khi logic nhiều tầng |
| **Subquery (uncorrelated)** | Trực quan, dễ đọc | Query planner có thể không tối ưu bằng JOIN |
| **Correlated subquery** | Đôi khi dễ viết | Chậm với bảng lớn vì chạy N lần |
| **CTE** | Dễ đọc, tái sử dụng, debug từng bước | PostgreSQL < 12 materialize CTE (không inlined) |

Từ PostgreSQL 12 trở đi, CTE được inline vào execution plan theo mặc định (giống subquery), trừ khi dùng `WITH ... AS MATERIALIZED`.

### Code minh hoạ

```sql
-- Bài toán: tìm nhân viên có lương cao hơn lương trung bình phòng mình

-- 1. Correlated subquery (chậm với bảng lớn)
SELECT e.name, e.salary, e.department_id
FROM employees e
WHERE e.salary > (
    SELECT AVG(salary)
    FROM employees
    WHERE department_id = e.department_id  -- tham chiếu e.department_id
);

-- 2. JOIN với subquery aggregate (nhanh hơn)
SELECT e.name, e.salary, e.department_id
FROM employees e
JOIN (
    SELECT department_id, AVG(salary) AS avg_salary
    FROM employees
    GROUP BY department_id
) dept_avg ON dept_avg.department_id = e.department_id
WHERE e.salary > dept_avg.avg_salary;

-- 3. CTE (dễ đọc, hiệu năng tương đương JOIN từ PG 12)
WITH dept_avg AS (
    SELECT department_id, AVG(salary) AS avg_salary
    FROM employees
    GROUP BY department_id
)
SELECT e.name, e.salary, e.department_id
FROM employees e
JOIN dept_avg ON dept_avg.department_id = e.department_id
WHERE e.salary > dept_avg.avg_salary;
```

### Đáp án mẫu

> "Em chọn dựa trên hai tiêu chí: readability và performance. Với logic đơn giản, JOIN thường nhanh nhất vì query planner tối ưu tốt. Khi logic phức tạp nhiều bước, em dùng CTE để chia nhỏ và debug từng bước — từ PostgreSQL 12 CTE được inline nên không còn lo materialization. Em tránh correlated subquery với bảng lớn vì nó chạy N lần; thay vào đó em rewrite thành JOIN với aggregate subquery. Em hay dùng `EXPLAIN ANALYZE` để xác nhận execution plan trước khi deploy."

---

## Câu 5: Window function vs GROUP BY — bài toán Top-N mỗi nhóm `[Senior]`

### Câu hỏi

> Giải thích sự khác biệt giữa window function và `GROUP BY`. Viết query lấy **3 nhân viên có lương cao nhất trong mỗi phòng ban**, không dùng subquery lồng nhiều tầng phức tạp.

### Giải thích lý thuyết

| Đặc điểm | `GROUP BY` | Window function |
| -------- | ---------- | --------------- |
| Số dòng trả về | Giảm — 1 dòng mỗi nhóm | Giữ nguyên số dòng gốc |
| Truy cập cột gốc | Chỉ GROUP BY column + aggregate | Có thể truy cập mọi cột gốc |
| Dùng trong `SELECT` | Cần aggregate | Dùng `OVER(...)` |

Window function không xóa dòng — chúng **thêm một giá trị tính toán** vào mỗi dòng dựa trên một "window" (cửa sổ) các dòng liên quan.

Cú pháp: `function() OVER (PARTITION BY ... ORDER BY ...)`

- `PARTITION BY`: tương tự `GROUP BY` — chia nhóm để tính
- `ORDER BY`: thứ tự trong mỗi partition
- `ROW_NUMBER()`: đánh số thứ tự 1, 2, 3... trong partition
- `RANK()`: giống ROW_NUMBER nhưng dòng bằng nhau có cùng rank, rank kế tiếp bị skip
- `DENSE_RANK()`: giống RANK nhưng không skip

### Code minh hoạ

```sql
-- Top-3 lương cao nhất mỗi phòng bằng ROW_NUMBER()
WITH ranked AS (
    SELECT
        employee_id,
        name,
        department_id,
        salary,
        ROW_NUMBER() OVER (
            PARTITION BY department_id
            ORDER BY salary DESC
        ) AS rn
    FROM employees
)
SELECT employee_id, name, department_id, salary
FROM ranked
WHERE rn <= 3;

-- Nếu muốn giữ dòng bằng lương (không loại ai): dùng DENSE_RANK
WITH ranked AS (
    SELECT
        employee_id,
        name,
        department_id,
        salary,
        DENSE_RANK() OVER (
            PARTITION BY department_id
            ORDER BY salary DESC
        ) AS dr
    FROM employees
)
SELECT employee_id, name, department_id, salary
FROM ranked
WHERE dr <= 3;

-- So sánh: GROUP BY không giữ được chi tiết từng nhân viên
SELECT department_id, MAX(salary) AS max_salary
FROM employees
GROUP BY department_id;
-- Chỉ trả về lương cao nhất, KHÔNG biết nhân viên nào
```

### Đáp án mẫu

> "Window function khác `GROUP BY` ở chỗ nó không giảm số dòng — mỗi dòng vẫn còn nguyên nhưng có thêm giá trị được tính theo 'cửa sổ' dữ liệu xung quanh. Bài toán Top-N em dùng `ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC)` rồi wrap vào CTE, sau đó lọc `WHERE rn <= 3`. Nếu có nhiều người cùng lương thứ 3, em cân nhắc dùng `DENSE_RANK` thay vì `ROW_NUMBER` tùy yêu cầu business."

---

## Câu 6: DISTINCT vs GROUP BY — UNION vs UNION ALL `[Intermediate]`

### Câu hỏi

> Khi nào dùng `DISTINCT` thay vì `GROUP BY`? Phân biệt `UNION` và `UNION ALL` — cái nào nhanh hơn và tại sao?

### Giải thích lý thuyết

**DISTINCT vs GROUP BY:**

| | `DISTINCT` | `GROUP BY` |
| - | ---------- | ---------- |
| Mục đích chính | Loại dòng trùng | Nhóm để aggregate |
| Dùng aggregate | Không | Có |
| Performance | Tương đương nhau (query planner thường tối ưu giống nhau) | Tương đương |
| Readability | Rõ ràng hơn khi chỉ cần dedup | Rõ hơn khi cần tính toán nhóm |

Quy tắc thực tế: nếu không có hàm aggregate thì dùng `DISTINCT` cho rõ ý định. Nếu cần `COUNT`, `SUM`, ... thì dùng `GROUP BY`.

**UNION vs UNION ALL:**

| | `UNION` | `UNION ALL` |
| - | ------- | ----------- |
| Xử lý trùng | Loại dòng trùng (chạy dedup) | Giữ tất cả dòng |
| Performance | Chậm hơn do sort/hash dedup | Nhanh hơn |
| Dùng khi | Dữ liệu có thể trùng giữa các tập | Biết chắc không trùng hoặc muốn giữ trùng |

### Code minh hoạ

```sql
-- DISTINCT: lấy danh sách city không trùng
SELECT DISTINCT city FROM customers;

-- GROUP BY tương đương (nhưng không rõ ý định bằng)
SELECT city FROM customers GROUP BY city;

-- GROUP BY khi cần aggregate: DISTINCT không làm được
SELECT city, COUNT(*) AS customer_count
FROM customers
GROUP BY city
ORDER BY customer_count DESC;

-- UNION: loại trùng giữa hai tập (chậm hơn vì phải sort/hash)
SELECT customer_id FROM orders_2023
UNION
SELECT customer_id FROM orders_2024;

-- UNION ALL: giữ tất cả, không dedup (nhanh hơn)
SELECT customer_id, order_date, amount FROM orders_2023
UNION ALL
SELECT customer_id, order_date, amount FROM orders_2024
ORDER BY order_date DESC;

-- Dùng UNION ALL + GROUP BY thay vì UNION để dedup có kiểm soát
SELECT customer_id, COUNT(*) AS years_active
FROM (
    SELECT customer_id FROM orders_2023
    UNION ALL
    SELECT customer_id FROM orders_2024
) all_orders
GROUP BY customer_id;
```

### Đáp án mẫu

> "Em dùng `DISTINCT` khi chỉ cần loại dòng trùng mà không có aggregate — nó diễn đạt ý định rõ hơn. Còn `GROUP BY` khi cần `COUNT`, `SUM`, ... Về `UNION` vs `UNION ALL`: `UNION ALL` luôn nhanh hơn vì bỏ qua bước dedup tốn kém. Em mặc định dùng `UNION ALL` khi biết chắc hai tập không trùng, hoặc khi muốn hợp nhất log rồi aggregate ở bước sau — thay vì để database dedup hai lần."

---

## Bẫy thường gặp khi trả lời

| Sai lầm | Đúng là |
| ------- | ------- |
| Dùng `= NULL` để kiểm tra null | Dùng `IS NULL` hoặc `IS NOT NULL` |
| Dùng `NOT IN` với subquery có thể trả về `NULL` | Dùng `NOT EXISTS` hoặc lọc `IS NOT NULL` trong subquery |
| Đặt hàm aggregate trong `WHERE` | Aggregate phải nằm trong `HAVING` |
| Select cột không có trong `GROUP BY` và không aggregate | Mọi cột SELECT phải thuộc GROUP BY hoặc aggregate |
| Dùng `UNION` mặc định mà không nghĩ đến performance | Dùng `UNION ALL` khi không cần dedup |
| Dùng correlated subquery không nghĩ đến N+1 | Rewrite thành JOIN với aggregate subquery hoặc window function |
| Nhầm `ROW_NUMBER` và `RANK` khi có giá trị bằng nhau | `ROW_NUMBER` luôn unique; `RANK` bỏ số kế tiếp; `DENSE_RANK` không bỏ |
