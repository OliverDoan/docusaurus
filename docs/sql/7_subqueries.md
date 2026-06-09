---
sidebar_position: 7
title: "7. Subqueries — Truy vấn con"
---

# Subqueries — Truy vấn con

Subquery là một câu lệnh SELECT được lồng bên trong một câu lệnh SQL khác, cho phép bạn lọc hoặc tính toán dựa trên kết quả của một truy vấn phụ. Bài này phân loại subquery theo kết quả trả về, phân biệt truy vấn con độc lập với tương quan (EXISTS), các toán tử IN/ANY/ALL và so sánh subquery với JOIN, CTE. Nắm được kỹ thuật này giúp bạn viết những truy vấn phức tạp gọn gàng và đúng đắn hơn.

---

## Mục lục

- [Subquery là gì](#subquery-là-gì)
- [Phân loại theo kết quả trả về](#phân-loại-theo-kết-quả-trả-về)
- [Nested Subqueries — Truy vấn con độc lập](#nested-subqueries--truy-vấn-con-độc-lập)
- [Correlated Subqueries — Truy vấn con tương quan](#correlated-subqueries--truy-vấn-con-tương-quan)
- [Toán tử với Subquery](#toán-tử-với-subquery)
- [Subquery vs JOIN vs CTE](#subquery-vs-join-vs-cte)

---

## Subquery là gì

**Subquery** (truy vấn con) là một câu lệnh `SELECT` được lồng bên trong một câu lệnh SQL khác. Câu lệnh bên ngoài được gọi là **outer query**, câu lệnh bên trong là **inner query**.

Subquery có thể xuất hiện ở ba vị trí:

- **`WHERE`** — lọc dữ liệu dựa trên kết quả của subquery
- **`FROM`** — dùng subquery như một bảng tạm (derived table)
- **`SELECT`** — tính toán một giá trị cho mỗi dòng của outer query

```sql
-- Subquery trong WHERE
SELECT name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);

-- Subquery trong FROM (derived table)
SELECT dept, avg_sal
FROM (
    SELECT department_id AS dept, AVG(salary) AS avg_sal
    FROM employees
    GROUP BY department_id
) AS dept_avg
WHERE avg_sal > 5000;

-- Subquery trong SELECT
SELECT
    name,
    salary,
    (SELECT AVG(salary) FROM employees) AS company_avg
FROM employees;
```

:::info[Phân tích]
Subquery trong `SELECT` chạy một lần cho **mỗi dòng** của outer query nếu không được optimizer tối ưu. Với PostgreSQL, optimizer thường cache kết quả nếu subquery không phụ thuộc vào dòng ngoài.
:::

---

## Phân loại theo kết quả trả về

Subquery được phân loại dựa trên **số dòng và số cột** mà nó trả về:

| Loại | Trả về | Dùng với | Ví dụ vị trí |
|------|--------|----------|--------------|
| **Scalar** | 1 giá trị (1 dòng, 1 cột) | `=`, `>`, `<`, `SELECT` | `WHERE salary > (SELECT MAX(...))` |
| **Column** | 1 cột, nhiều dòng | `IN`, `ANY`, `ALL` | `WHERE id IN (SELECT id FROM ...)` |
| **Row** | 1 dòng, nhiều cột | So sánh tuple | `WHERE (a, b) = (SELECT x, y FROM ...)` |
| **Table** | Nhiều dòng, nhiều cột | `FROM` (derived table) | `FROM (SELECT ...) AS t` |

```sql
-- Scalar subquery: trả về 1 giá trị duy nhất
SELECT name
FROM employees
WHERE salary = (SELECT MAX(salary) FROM employees);

-- Column subquery: trả về 1 cột nhiều dòng
SELECT name
FROM employees
WHERE department_id IN (
    SELECT id FROM departments WHERE location = 'Hanoi'
);

-- Row subquery: so sánh theo tuple
SELECT *
FROM employees
WHERE (department_id, job_id) = (
    SELECT department_id, job_id
    FROM employees
    WHERE name = 'Nguyen Van A'
);

-- Table subquery (derived table): dùng ở FROM
SELECT d.name, stats.headcount
FROM departments d
JOIN (
    SELECT department_id, COUNT(*) AS headcount
    FROM employees
    GROUP BY department_id
) AS stats ON d.id = stats.department_id;
```

:::warning[Cần lưu ý]
**Scalar subquery** sẽ báo lỗi nếu trả về nhiều hơn 1 dòng. Luôn đảm bảo logic chỉ cho ra đúng 1 giá trị, hoặc dùng `LIMIT 1` khi cần thiết.
:::

---

## Nested Subqueries — Truy vấn con độc lập

**Nested subquery** (hay còn gọi là **non-correlated subquery**) là subquery **không tham chiếu** đến bảng của outer query. Nó chạy **một lần duy nhất**, kết quả được tái sử dụng cho toàn bộ outer query.

```sql
-- Tìm nhân viên có lương cao hơn mức lương trung bình của phòng 'Engineering'
SELECT name, salary
FROM employees
WHERE salary > (
    SELECT AVG(e2.salary)
    FROM employees e2
    JOIN departments d ON e2.department_id = d.id
    WHERE d.name = 'Engineering'
);
```

```sql
-- Subquery lồng nhiều tầng
SELECT name
FROM employees
WHERE department_id IN (
    SELECT id
    FROM departments
    WHERE location_id IN (
        SELECT id FROM locations WHERE country = 'Vietnam'
    )
);
```

:::tip[Mẹo]
Khi subquery lồng quá 2-3 tầng, khả năng đọc giảm mạnh. Hãy cân nhắc chuyển sang **CTE** (`WITH`) để tách từng bước ra riêng biệt.
:::

---

## Correlated Subqueries — Truy vấn con tương quan

**Correlated subquery** tham chiếu đến cột của outer query. Điều này có nghĩa là inner query **chạy lại mỗi lần** outer query xử lý một dòng mới.

```sql
-- Tìm nhân viên có lương cao hơn mức lương trung bình của chính phòng họ
SELECT e1.name, e1.salary, e1.department_id
FROM employees e1
WHERE e1.salary > (
    SELECT AVG(e2.salary)
    FROM employees e2
    WHERE e2.department_id = e1.department_id  -- tham chiếu e1 từ outer query
);
```

### EXISTS và NOT EXISTS

`EXISTS` kiểm tra xem subquery có trả về **ít nhất một dòng** hay không. Đây là dạng correlated subquery phổ biến nhất.

```sql
-- Tìm phòng ban có ít nhất 1 nhân viên
SELECT d.name
FROM departments d
WHERE EXISTS (
    SELECT 1
    FROM employees e
    WHERE e.department_id = d.id
);

-- Tìm phòng ban chưa có nhân viên nào
SELECT d.name
FROM departments d
WHERE NOT EXISTS (
    SELECT 1
    FROM employees e
    WHERE e.department_id = d.id
);
```

:::info[Phân tích]
Trong `EXISTS`, giá trị `SELECT 1` (hoặc `SELECT *`) không quan trọng — PostgreSQL chỉ quan tâm đến việc có dòng nào được trả về không. Dùng `SELECT 1` là quy ước phổ biến để thể hiện ý định rõ ràng.
:::

:::warning[Cần lưu ý]
**Hiệu năng của Correlated Subquery:** Vì inner query chạy lại cho **mỗi dòng** của outer query, correlated subquery có thể rất chậm trên bảng lớn (độ phức tạp O(n x m)). PostgreSQL đôi khi có thể tự tối ưu bằng cách chuyển thành JOIN nội bộ, nhưng không phải lúc nào cũng làm được. Hãy kiểm tra `EXPLAIN ANALYZE` để xác nhận.
:::

---

## Toán tử với Subquery

### IN và NOT IN

```sql
-- IN: đúng nếu giá trị nằm trong tập kết quả
SELECT name
FROM employees
WHERE department_id IN (
    SELECT id FROM departments WHERE budget > 100000
);

-- NOT IN: đúng nếu giá trị KHÔNG nằm trong tập kết quả
SELECT name
FROM employees
WHERE department_id NOT IN (
    SELECT id FROM departments WHERE location = 'Hanoi'
);
```

:::warning[Cần lưu ý]
**Bẫy NULL với NOT IN:** Nếu subquery trả về **bất kỳ giá trị NULL nào**, toàn bộ điều kiện `NOT IN` sẽ trả về `FALSE` cho mọi dòng, khiến outer query không trả về kết quả nào.

```sql
-- Nguy hiểm: nếu department_id có NULL trong subquery, kết quả là rỗng
SELECT name FROM employees
WHERE department_id NOT IN (SELECT id FROM departments WHERE budget IS NULL);

-- An toàn hơn: dùng NOT EXISTS thay thế
SELECT e.name FROM employees e
WHERE NOT EXISTS (
    SELECT 1 FROM departments d
    WHERE d.id = e.department_id AND d.budget IS NULL
);
```
:::

### ANY và ALL

```sql
-- ANY: đúng nếu điều kiện thỏa mãn với ÍT NHẤT 1 giá trị trong tập
-- Tương đương IN khi dùng với =
SELECT name, salary
FROM employees
WHERE salary > ANY (
    SELECT salary FROM employees WHERE department_id = 3
);

-- ALL: đúng nếu điều kiện thỏa mãn với TẤT CẢ giá trị trong tập
SELECT name, salary
FROM employees
WHERE salary > ALL (
    SELECT salary FROM employees WHERE department_id = 3
);
```

| Toán tử | Ý nghĩa | Tương đương |
|---------|---------|-------------|
| `= ANY(...)` | Bằng ít nhất 1 giá trị | `IN (...)` |
| `<> ALL(...)` | Khác tất cả giá trị | `NOT IN (...)` |
| `> ANY(...)` | Lớn hơn giá trị nhỏ nhất | `> MIN(...)` |
| `> ALL(...)` | Lớn hơn giá trị lớn nhất | `> MAX(...)` |

---

## Subquery vs JOIN vs CTE

Cả ba cách đều có thể giải quyết cùng một bài toán, nhưng mỗi cách phù hợp với tình huống khác nhau:

| Tiêu chí | Subquery | JOIN | CTE (`WITH`) |
|----------|----------|------|--------------|
| **Độ đọc hiểu** | Trung bình | Cao khi đơn giản | Cao, dễ tái sử dụng |
| **Hiệu năng** | Có thể chậm (correlated) | Thường nhanh nhất | Tương đương subquery |
| **Tái sử dụng** | Không | Không | Có (gọi nhiều lần) |
| **Phù hợp khi** | Lọc 1 điều kiện đơn giản | Cần dữ liệu từ nhiều bảng | Logic phức tạp, nhiều bước |

```sql
-- Cùng bài toán: tên nhân viên và tên phòng ban

-- Cách 1: Subquery
SELECT name,
    (SELECT d.name FROM departments d WHERE d.id = e.department_id) AS dept_name
FROM employees e;

-- Cách 2: JOIN (thường được ưa dùng hơn)
SELECT e.name, d.name AS dept_name
FROM employees e
JOIN departments d ON e.department_id = d.id;

-- Cách 3: CTE (tốt khi cần dùng dept_avg nhiều lần)
WITH dept_stats AS (
    SELECT department_id, AVG(salary) AS avg_salary, COUNT(*) AS headcount
    FROM employees
    GROUP BY department_id
)
SELECT e.name, e.salary, ds.avg_salary, ds.headcount
FROM employees e
JOIN dept_stats ds ON e.department_id = ds.department_id
WHERE e.salary > ds.avg_salary;
```

:::tip[Mẹo]
Quy tắc chọn lựa đơn giản:
- Dùng **JOIN** khi cần kết hợp dữ liệu từ nhiều bảng.
- Dùng **Subquery** khi cần lọc dựa trên một tập giá trị hoặc một giá trị tổng hợp.
- Dùng **CTE** khi logic phức tạp, nhiều bước, hoặc cần dùng lại kết quả trung gian nhiều lần trong cùng một câu lệnh.
:::
