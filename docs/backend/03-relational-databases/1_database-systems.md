---
sidebar_position: 1
title: "1. Hệ quản trị Relational Database"
---

# Hệ quản trị Relational Database

Relational Database (cơ sở dữ liệu quan hệ) là cách lưu trữ data phổ biến nhất trong backend, sắp xếp thông tin thành các bảng có dòng và cột giống bảng tính Excel. Bài này giới thiệu các hệ quản trị thường gặp như PostgreSQL, MySQL, SQLite, MS SQL Server và Oracle, cùng gợi ý nên chọn cái nào cho dự án của bạn. Hiểu chúng giúp bạn lưu và truy vấn data của ứng dụng một cách an toàn, đáng tin cậy.

[![Sơ đồ tóm tắt bài: Hệ quản trị Relational Database](/img/backend/database-systems.webp)](pathname:///img/backend/database-systems.webp)

---

:::note[Ghi nhớ nhanh]

- ⭐ **`RDBMS`** (Postgres, MySQL, SQLite, MS SQL, Oracle) lưu data thành **bảng có schema**, liên kết qua `foreign key`.
- ⭐ **Học `SQL` quan trọng hơn học một RDBMS cụ thể** — nắm SQL rồi chuyển engine chỉ là khác biệt nhỏ (DDL/DML/DQL/DCL/TCL).
- **`PostgreSQL` là default 2026** — JSONB, full-text search, geospatial, extension (pgvector, TimescaleDB).
- **Chọn engine theo case**: MySQL (host rẻ, WordPress), SQLite (mobile/edge), MS SQL (.NET), Oracle (enterprise banking).
- **Đừng over-engineer** — hiểu SQL + design schema đúng quan trọng hơn engine; ORM hiện đại giúp migrate dễ.

:::

---

## Mục lục

- [Relational Database là gì?](#relational-database-là-gì)
- [PostgreSQL (khuyến nghị)](#postgresql-khuyến-nghị)
- [MySQL / MariaDB](#mysql--mariadb)
- [SQLite](#sqlite)
- [MS SQL Server](#ms-sql-server)
- [Oracle DB](#oracle-db)
- [So sánh tổng kết](#so-sánh-tổng-kết)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Relational Database là gì?

**Relational Database (RDB)** = database tổ chức data thành **bảng (table)**
với **cột (column)** và **dòng (row)** có cấu trúc nghiêm ngặt
(**schema**), liên kết qua **foreign key**.

:::tip[Ví dụ đời thường]

Hình dung **tủ hồ sơ** của một trường học. Mỗi **ngăn kéo** là một bảng: ngăn "Học sinh", ngăn "Lớp học". Mỗi **tờ khai** trong ngăn là một dòng, và mọi tờ khai trong cùng ngăn đều **in sẵn cùng các ô** để điền — đó chính là `schema`, không ai được tự vẽ thêm ô riêng.

Cái hay nằm ở chỗ tờ khai học sinh có ô "Mã lớp" ghi `10A1`. Nó không chép lại tên lớp, tên giáo viên chủ nhiệm — chỉ ghi mã để **trỏ sang** ngăn "Lớp học". Đó là `foreign key`. Nhờ vậy khi lớp đổi giáo viên chủ nhiệm, bạn sửa **một tờ** bên ngăn Lớp học, không phải lôi 40 tờ khai học sinh ra sửa.

Cái giá phải trả: ô nào cũng in sẵn nên muốn thêm một ô mới cho cả ngăn thì phải **in lại mẫu** (`ALTER TABLE`) — kém linh hoạt hơn kiểu "ghi gì cũng được" của NoSQL.

:::

:::info[Thuật ngữ]

**RDBMS (Relational Database Management System)** = **Hệ quản trị Cơ sở
dữ liệu Quan hệ** — phần mềm quản lý RDB.

PostgreSQL, MySQL/MariaDB, SQLite, MS SQL Server, Oracle DB — tất cả
đều là **các RDBMS**. Khi nghe "chọn RDBMS nào?" tức là chọn 1 trong
nhóm trên.

Phân biệt:

- **RDB** = mô hình dữ liệu (table, row, column, foreign key).
- **RDBMS** = phần mềm hiện thực mô hình đó (Postgres, MySQL…).
- **SQL** = ngôn ngữ giao tiếp với RDBMS.

:::

:::tip[Ví dụ đời thường]

Ba từ này hay bị lẫn, nhưng đặt vào chuyện bếp núc là rõ ngay:

- **RDB** là **công thức** — quy ước "data xếp thành bảng, các bảng nối nhau bằng khoá".
- **RDBMS** là **cái bếp thật** nấu theo công thức đó — Postgres, MySQL, SQLite… mỗi bếp một hãng.
- **SQL** là **tiếng bạn nói với đầu bếp** để đặt món.

Vì mọi bếp đều nghe cùng một thứ tiếng, học SQL xong bạn đổi bếp nào cũng gọi món được — chỉ khác chút giọng địa phương (`dialect`).

:::

:::info[SQL là gì?]

**SQL (Structured Query Language)** = **Ngôn ngữ truy vấn có cấu trúc**
— ngôn ngữ **chuẩn ANSI/ISO** để giao tiếp với RDBMS: định nghĩa
schema, thêm/sửa/xoá/đọc data, phân quyền, transaction.

Mỗi RDBMS có **dialect (biến thể)** riêng nhưng phần lớn cú pháp giống
nhau:

- **PostgreSQL** — PL/pgSQL
- **MySQL** — MySQL SQL
- **SQLite** — SQL (subset)
- **MS SQL Server** — T-SQL (Transact-SQL)
- **Oracle** — PL/SQL

SQL chia thành các **nhóm lệnh chính**:

| Nhóm    | Tên đầy đủ                   | Mục đích            | Lệnh tiêu biểu                        |
| ------- | ---------------------------- | ------------------- | ------------------------------------- |
| **DDL** | Data Definition Language     | Định nghĩa cấu trúc | `CREATE`, `ALTER`, `DROP`, `TRUNCATE` |
| **DML** | Data Manipulation Language   | Thao tác data       | `INSERT`, `UPDATE`, `DELETE`          |
| **DQL** | Data Query Language          | Truy vấn data       | `SELECT`                              |
| **DCL** | Data Control Language        | Phân quyền          | `GRANT`, `REVOKE`                     |
| **TCL** | Transaction Control Language | Quản lý giao dịch   | `COMMIT`, `ROLLBACK`, `SAVEPOINT`     |

Ví dụ minh hoạ từng nhóm:

```sql
-- DDL: tạo bảng
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE
);

-- DML: thêm data
INSERT INTO users (email) VALUES ('alice@example.com');

-- DQL: đọc data
SELECT * FROM users WHERE email LIKE '%@example.com';

-- DCL: phân quyền
GRANT SELECT ON users TO readonly_user;

-- TCL: giao dịch
BEGIN;
  UPDATE users SET email = 'new@example.com' WHERE id = 1;
COMMIT;
```

**Học SQL quan trọng hơn học 1 RDBMS cụ thể** — vì khi đã thạo SQL,
chuyển giữa Postgres/MySQL/SQLite chỉ là khác biệt nhỏ.

:::

:::tip[Ví dụ đời thường]

Vẫn cái tủ hồ sơ đó, 5 nhóm lệnh SQL chính là 5 loại việc bạn làm với nó:

- **DDL** — đóng thêm ngăn kéo, in mẫu tờ khai (`CREATE`, `ALTER`).
- **DML** — bỏ tờ khai vào, sửa, rút ra (`INSERT`, `UPDATE`, `DELETE`).
- **DQL** — lục tủ tìm hồ sơ (`SELECT`).
- **DCL** — phát chìa khoá: ai được mở ngăn nào (`GRANT`, `REVOKE`).
- **TCL** — làm một việc gồm nhiều bước theo kiểu "được ăn cả, ngã về không".

Nhóm TCL đáng nhớ nhất: chuyển khoản là **trừ tiền tài khoản A** rồi **cộng tiền tài khoản B**. Mất điện giữa chừng là tiền bốc hơi. `COMMIT` nghĩa là "cả hai bước đều xong, ghi sổ chính thức", còn `ROLLBACK` là "xé tờ nháp, coi như chưa làm gì".

:::

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(200),
  body TEXT
);
```

Tương tác qua **SQL (Structured Query Language)**:

```sql
SELECT u.name, COUNT(p.id) AS post_count
FROM users u
LEFT JOIN posts p ON p.user_id = u.id
WHERE u.created_at > NOW() - INTERVAL '30 days'
GROUP BY u.id
ORDER BY post_count DESC
LIMIT 10;
```

RDB **dominate** 80% backend project — phù hợp đa số case business.

---

## PostgreSQL (khuyến nghị)

**Default choice 2026** cho backend mới.

**Ưu**:

- **Mạnh nhất** trong nhóm open source.
- **JSON/JSONB** — store JSON với index, query.
- **Full-text search** built-in.
- **Geospatial** (PostGIS extension) — map app.
- **Window functions, CTEs, subquery** — phức tạp OK.
- **Transactions ACID** đầy đủ.
- **Extension ecosystem** — pgvector (AI), TimescaleDB (time series).
- **Free, open source**.

**Nhược**:

- Setup phức tạp hơn MySQL.
- Memory dùng nhiều hơn.
- Một số legacy app chưa hỗ trợ.

**Setup**:

```bash
# Docker
docker run -d \
  --name pg \
  -e POSTGRES_PASSWORD=secret \
  -p 5432:5432 \
  postgres:16
```

Connection string:

```
postgresql://user:password@localhost:5432/dbname
```

<!--
:::info[Phân tích]

**Tại sao PostgreSQL thắng 2026?**

1. **JSONB** — store unstructured như MongoDB, query với index.
2. **pgvector** — vector similarity cho AI/RAG.
3. **Logical replication** — replicate selective table.
4. **Partition** — auto partition table lớn.
5. **Concurrent index** — tạo index không block.
6. **Row-level security** — security model native.
7. **Stable** — version 10+ năm vẫn maintain.

Cloud PostgreSQL provider hot 2026:

- **Neon** — serverless, branch DB như Git.
- **Supabase** — Postgres + auth + storage + edge func.
- **Vercel Postgres** (Neon-backed).
- **Aiven**, **Render** — managed traditional.
- **AWS RDS Postgres**, **GCP Cloud SQL**.

Neon đặc biệt thú vị — **branch database** (snapshot trong giây) cho
preview environment, không phải spin up DB mới.

::: -->

---

## MySQL / MariaDB

**MySQL** — open source phổ biến lâu năm. Oracle sở hữu.

**MariaDB** — fork community-led, **drop-in replacement**.

**Ưu**:

- **Cộng đồng huge**, tài liệu vô tận.
- **Hosting cheap** — shared hosting đều support.
- **WordPress / phpMyAdmin** ecosystem.
- **PlanetScale**, **Vitess** — scale platform.
- Setup nhanh, dễ học.

**Nhược**:

- Feature ít hơn Postgres (window function, JSON cũ kém).
- ACID weaker (default).
- Stored procedure ít power.

**Setup**:

```bash
docker run -d \
  --name mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  -p 3306:3306 \
  mysql:8
```

:::tip[Mẹo]

**MySQL vs PostgreSQL** — chọn:

- **Postgres**: project mới, complex query, feature-rich, JSON heavy.
- **MySQL**: legacy, WordPress, simple CRUD, host cheap.

Cả hai đều **production-ready cho hầu hết app**. Migrate giữa hai
không quá khó với ORM (Prisma, Drizzle, TypeORM).

PlanetScale (MySQL Vitess) đáng chú ý — **schema branching**, scale
horizontal tự động.

:::

---

## SQLite

**File-based database** — không cần server, lưu trong 1 file.

:::tip[Ví dụ đời thường]

Postgres hay MySQL giống **cái kho có bảo vệ trực 24/7**: muốn lấy đồ phải tới cổng, xuất trình phiếu, bảo vệ vào lấy giúp. SQLite thì như **cuốn sổ tay nằm ngay trong ngăn bàn bạn** — mở ra ghi, gấp lại là xong, không phải thuê ai gác cổng, cũng không phải đi đâu cả.

Đổi lại, cuốn sổ chỉ có **một cây bút**: nhiều người cùng đọc thì thoải mái, nhưng hai người muốn ghi cùng lúc thì phải chờ nhau (1 writer at a time). Vì thế SQLite hợp app mobile, desktop, blog — đọc nhiều ghi ít; còn chỗ hàng nghìn người cùng bấm đặt hàng thì vẫn cần cái kho có bảo vệ.

:::

**Ưu**:

- **Zero config** — không cần install/run server.
- **Embedded** — chạy trong process app.
- **Fast** cho read-heavy.
- **Reliable** — battle-tested 20+ năm.
- File portable — copy đi đâu cũng chạy.

**Nhược**:

- **Concurrent write giới hạn** (1 writer at a time).
- Không scale horizontal.
- Limited types.

**Use case**:

- **Mobile** app (iOS, Android dùng).
- **Desktop** app (Electron, Tauri).
- **CLI tool** local data.
- **Edge** computing (Cloudflare D1, Turso = LibSQL fork).

**Turso** — distributed SQLite trên edge, popular 2024+:

```bash
turso db create my-app
```

:::info[Phân tích]

**SQLite cho production web?**

Trước 2022 thường nghĩ "không". Hiện tại **đang thay đổi**:

- **Fly.io LiteFS** — replicate SQLite multi-region.
- **Turso** — distributed SQLite serverless.
- **Litestream** — backup SQLite to S3.

Pattern: **SQLite + Litestream/LiteFS** cho app **read-heavy, low write
concurrent** — single VM, low latency, ít moving parts.

Vẫn không thay PostgreSQL cho app concurrent write cao (e-commerce
checkout), nhưng phù hợp blog, CMS, internal tool, mobile backend.

:::

---

## MS SQL Server

Microsoft database. **Windows-first** trước, giờ chạy được Linux/macOS.

**Phù hợp**:

- App .NET / C# enterprise.
- Doanh nghiệp đã trong Microsoft ecosystem.
- Tích hợp với Power BI, Azure.

**Edition**:

- **Express** — free, giới hạn 10GB.
- **Developer** — free cho dev.
- **Standard / Enterprise** — license $$$.

Trong VN, **không phổ biến trong startup** — chủ yếu doanh nghiệp lớn,
hệ thống legacy.

---

## Oracle DB

**Enterprise DB** — banking, telecom, government.

**Phù hợp**:

- Hệ thống cực lớn, mature.
- Compliance khắt khe.
- Có team DBA chuyên.

**Cost**: license cực đắt ($$$).

Free tier: **Oracle Database 23ai Free** — limited resources.

Developer rarely chọn Oracle cho project mới — quá phức tạp, expensive.

---

## So sánh tổng kết

|                      | PostgreSQL        | MySQL                | SQLite           | MS SQL       | Oracle             |
| -------------------- | ----------------- | -------------------- | ---------------- | ------------ | ------------------ |
| **Cost**             | Free              | Free                 | Free             | $$           | $$$$               |
| **Complexity**       | Vừa               | Đơn giản             | **Cực đơn giản** | Vừa          | Phức tạp           |
| **Feature**          | **Mạnh nhất** OSS | Trung bình           | Hạn chế          | Mạnh         | **Mạnh nhất**      |
| **Performance**      | Tốt               | Tốt                  | Excellent read   | Tốt          | Excellent          |
| **Scale**            | Tốt               | **Rất tốt** (Vitess) | Hạn chế          | Tốt          | Excellent          |
| **Job market VN**    | Đang lên          | Phổ biến             | Embedded         | Enterprise   | Banking            |
| **Khuyến nghị 2026** | **#1**            | OK                   | Mobile/Edge      | Nếu MS stack | Nếu enterprise lớn |

:::tip[Mẹo]

**Quyết định nhanh**:

```
Project mới 2026?
├─ Có ý định scale lớn?     → PostgreSQL
├─ Mobile / desktop / edge?  → SQLite
├─ Đã .NET stack?            → MS SQL Server
├─ Legacy WordPress / cheap host? → MySQL
└─ Enterprise banking?       → Oracle (đã có)
```

**Default: PostgreSQL** — bỏ qua decision paralysis, chọn nó cho 90%
project mới.

:::

:::warning[Cần lưu ý]

**Đừng over-engineer choice**:

- Project nhỏ (< 1000 users): SQLite hoặc Postgres đều OK.
- Quan trọng: **hiểu SQL + design schema đúng**, không phải DB engine.
- Migrate DB engine khả thi với ORM hiện đại (Prisma, Drizzle).

Tránh: "Pick MongoDB vì nó scale" — chưa cần thì pick relational + bình
thường. NoSQL dùng đúng case, không phải default.

:::

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Phân biệt `RDB`, `RDBMS` và `SQL` — mỗi khái niệm chỉ cái gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba khái niệm ở ba tầng khác nhau:

| Khái niệm | Nó là gì |
| --- | --- |
| **RDB** (Relational Database) | **Mô hình dữ liệu** — quy ước tổ chức data thành bảng có cột và dòng, schema nghiêm ngặt, các bảng nối nhau bằng `foreign key` |
| **RDBMS** | **Phần mềm** hiện thực mô hình đó: PostgreSQL, MySQL/MariaDB, SQLite, MS SQL Server, Oracle |
| **SQL** | **Ngôn ngữ** để giao tiếp với RDBMS — định nghĩa schema, thêm/sửa/xoá/đọc data, phân quyền, quản lý transaction |

Ví dụ trong bài rất dễ nhớ: RDB là **công thức nấu ăn**, RDBMS là **cái bếp thật** nấu theo công thức đó, còn SQL là **thứ tiếng bạn nói với đầu bếp** để đặt món. Vì mọi bếp đều nghe cùng một thứ tiếng, học SQL xong đổi bếp nào cũng gọi món được, chỉ khác chút giọng địa phương (`dialect`).

</details>

**2. Kể 5 nhóm lệnh `DDL`/`DML`/`DQL`/`DCL`/`TCL` và cho ví dụ mỗi nhóm. Nhóm nào nằm trong phạm vi rollback được của một transaction?**

<details className="qa">
<summary>Xem đáp án</summary>

| Nhóm | Tên đầy đủ | Mục đích | Lệnh tiêu biểu |
| --- | --- | --- | --- |
| **DDL** | Data Definition Language | Định nghĩa cấu trúc | `CREATE`, `ALTER`, `DROP`, `TRUNCATE` |
| **DML** | Data Manipulation Language | Thao tác data | `INSERT`, `UPDATE`, `DELETE` |
| **DQL** | Data Query Language | Truy vấn data | `SELECT` |
| **DCL** | Data Control Language | Phân quyền | `GRANT`, `REVOKE` |
| **TCL** | Transaction Control Language | Quản lý giao dịch | `COMMIT`, `ROLLBACK`, `SAVEPOINT` |

**Về rollback:** **DML luôn rollback được** — đó chính là mục đích của transaction. Với **DDL** thì tuỳ engine:

- **PostgreSQL** hỗ trợ DDL có tính transaction, nên `CREATE TABLE`, `ALTER TABLE` nằm trong `BEGIN ... ROLLBACK` vẫn huỷ được. Đây là lý do migration trên Postgres an toàn hơn hẳn.
- **MySQL (InnoDB)** thì DDL gây **commit ngầm** — chạy `ALTER TABLE` là transaction đang mở bị commit luôn, không rollback được.

Nhóm TCL là công cụ điều khiển: `COMMIT` nghĩa là "ghi sổ chính thức", `ROLLBACK` là "xé tờ nháp, coi như chưa làm gì", `SAVEPOINT` cho phép lùi về một mốc giữa chừng.

</details>

**3. `DELETE`, `TRUNCATE` và `DROP` khác nhau thế nào về tốc độ, khả năng rollback và ảnh hưởng tới `AUTO_INCREMENT`/`SEQUENCE`?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `DELETE` | `TRUNCATE` | `DROP` |
| --- | --- | --- | --- |
| Nhóm | DML | DDL | DDL |
| Phạm vi | Xoá từng dòng, có `WHERE` | Xoá sạch mọi dòng, không có `WHERE` | Xoá luôn cả bảng và cấu trúc |
| Tốc độ | Chậm với bảng lớn (ghi log từng dòng) | Rất nhanh (giải phóng cả vùng lưu trữ) | Rất nhanh |
| Rollback | Được | Được trên PostgreSQL; không được trên MySQL (commit ngầm) | Như `TRUNCATE`: Postgres được, MySQL không |
| Trigger | Kích hoạt trigger theo dòng | Không kích hoạt trigger `DELETE` | Không |
| Bộ đếm id | Giữ nguyên | Đặt lại `AUTO_INCREMENT` (MySQL); Postgres chỉ reset sequence khi thêm `RESTART IDENTITY` | Mất luôn cùng bảng |

```sql
DELETE FROM users WHERE id = 1;          -- xoá có điều kiện
TRUNCATE TABLE users RESTART IDENTITY;   -- dọn sạch bảng, reset sequence
DROP TABLE users;                        -- bảng biến mất khỏi schema
```

Kinh nghiệm: cần lọc theo điều kiện thì dùng `DELETE`; dọn sạch bảng tạm hoặc bảng seed thì `TRUNCATE`; `DROP` chỉ dùng trong migration có kiểm soát.

</details>

**4. Vì sao nói học `SQL` quan trọng hơn học một RDBMS cụ thể? `dialect` gây khó khăn gì khi bạn phải chuyển engine?**

<details className="qa">
<summary>Xem đáp án</summary>

SQL là **chuẩn ANSI/ISO**, nên phần lõi — `SELECT`, `JOIN`, `GROUP BY`, subquery, CTE, window function, transaction, thiết kế schema và index — gần như giống nhau trên mọi engine. Nắm được phần này là bạn dùng được Postgres, MySQL hay SQLite; chuyển engine chỉ là học lại vài chi tiết. Ngược lại, thuộc lòng công cụ quản trị của một engine mà không hiểu SQL thì không mang đi đâu được. Quan trọng hơn cả engine vẫn là **hiểu SQL và thiết kế schema đúng**.

**Dialect gây khó ở đâu khi chuyển engine:**

- **Kiểu dữ liệu** — `SERIAL`/`IDENTITY` của Postgres và `AUTO_INCREMENT` của MySQL; `BOOLEAN` trên MySQL thực chất là `TINYINT`; Postgres có `timestamptz`, `UUID`, `ARRAY`, `JSONB` mà MySQL không có tương đương trực tiếp.
- **Hàm** — hàm chuỗi, hàm ngày tháng, nối chuỗi (`||` của Postgres so với `CONCAT` của MySQL) khác nhau.
- **Ngôn ngữ thủ tục** — PL/pgSQL, T-SQL, PL/SQL gần như phải viết lại hoàn toàn.
- **Phân biệt hoa thường và collation** — MySQL mặc định so sánh chuỗi không phân biệt hoa thường, Postgres thì có. Đây là nguồn lỗi âm thầm rất khó phát hiện.

ORM hiện đại (Prisma, Drizzle, TypeORM) che bớt khác biệt này, nên việc migrate không quá khó, nhưng những chỗ viết SQL thô thì vẫn phải rà tay.

</details>

**5. So sánh `PostgreSQL` và `MySQL` ở mức cụ thể: kiểu dữ liệu, `window function`, `JSON`/`JSONB`, `MVCC`, storage engine. Bạn chọn cái nào cho dự án mới và vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | PostgreSQL | MySQL |
| --- | --- | --- |
| Kiểu dữ liệu | Rất phong phú: `JSONB`, `ARRAY`, `UUID`, `timestamptz`, `INET`, kiểu tự định nghĩa | Bộ kiểu cơ bản, không có array hay kiểu tự định nghĩa |
| Window function, CTE | Hỗ trợ đầy đủ và lâu đời, có CTE đệ quy | Chỉ có từ MySQL 8, ít tính năng hơn |
| JSON | `JSONB` lưu dạng nhị phân, đánh index được bằng `GIN`, có nhiều toán tử truy vấn | Kiểu `JSON` yếu hơn, index phải qua cột sinh (generated column) |
| MVCC | Giữ nhiều phiên bản dòng ngay trong bảng, cần `VACUUM` dọn dòng chết | InnoDB dùng undo log để dựng lại phiên bản cũ |
| Storage engine | Chỉ một engine tích hợp | Nhiều engine: InnoDB (mặc định, có transaction), MyISAM (cũ, không transaction) |
| Điểm mạnh khác | Full-text search, PostGIS, hệ extension mạnh (pgvector, TimescaleDB) | Hosting rẻ phổ biến, hệ sinh thái WordPress, Vitess/PlanetScale để scale ngang |

**Chọn gì cho dự án mới:** **PostgreSQL** — đây là lựa chọn mặc định năm 2026 cho khoảng 90% dự án mới. Lý do: nhiều tính năng nhất trong nhóm mã nguồn mở, truy vấn phức tạp không bị bó tay, có `JSONB` nên vừa chặt chẽ vừa linh hoạt, transaction ACID đầy đủ, và hệ extension mở đường cho AI, time series, bản đồ. Chỉ chọn MySQL khi đã có ràng buộc sẵn: hệ thống cũ, WordPress, hoặc hosting rẻ chỉ hỗ trợ MySQL.

</details>

**6. MySQL có nhiều storage engine (`InnoDB`, `MyISAM`) còn PostgreSQL chỉ có một. Điều đó ảnh hưởng gì tới transaction và foreign key?**

<details className="qa">
<summary>Xem đáp án</summary>

MySQL tách phần "SQL layer" khỏi phần lưu trữ, nên mỗi bảng có thể dùng một storage engine khác nhau — và **khả năng của bảng phụ thuộc vào engine của chính nó**:

| | InnoDB | MyISAM |
| --- | --- | --- |
| Transaction ACID | Có | **Không** |
| Foreign key | Có, ràng buộc được thực thi | **Không** — khai báo bị bỏ qua âm thầm |
| Khoá | Khoá theo dòng | Khoá cả bảng |
| Khôi phục sau sự cố | Có crash recovery | Dễ hỏng, phải sửa bảng thủ công |

Hệ quả nguy hiểm: một bảng lỡ tạo bằng MyISAM sẽ **im lặng bỏ qua** ràng buộc khoá ngoại và không tham gia transaction — code tưởng đang an toàn nhưng thực ra không. Đây là lỗi kinh điển với hệ thống cũ. Từ MySQL 5.5, InnoDB đã là mặc định, nên nguyên tắc là luôn dùng InnoDB và kiểm tra lại engine của các bảng kế thừa.

**PostgreSQL chỉ có một engine tích hợp sẵn**, nên không có chuyện này: mọi bảng đều có transaction và foreign key như nhau. Đổi lại là ít lựa chọn tinh chỉnh hơn — nhưng với hầu hết ứng dụng, sự nhất quán này có giá trị hơn nhiều.

</details>

**7. Khi nào nên lưu dữ liệu vào cột `JSONB` thay vì tách ra bảng riêng? Đánh index cho `JSONB` bằng loại index nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Nên dùng `JSONB` khi:**

- Dữ liệu có **cấu trúc không cố định** hoặc khác nhau theo từng dòng: thuộc tính sản phẩm theo ngành hàng, cấu hình người dùng, kết quả trả về từ API bên ngoài.
- Dữ liệu chỉ cần **đọc nguyên khối**, hiếm khi lọc hay join theo từng trường bên trong: payload webhook, ảnh chụp trạng thái để phục vụ audit log.
- Schema còn đang thay đổi nhanh trong giai đoạn đầu.

**Nên tách bảng riêng khi:**

- Trường đó thường xuyên nằm trong `WHERE`, `JOIN`, `ORDER BY` hoặc dùng để tổng hợp.
- Cần ràng buộc chặt: `NOT NULL`, `UNIQUE`, `CHECK`, khoá ngoại — `JSONB` không cho bạn những thứ này.
- Quan hệ thực sự là một-nhiều và cần truy vấn từ cả hai phía.

**Index cho `JSONB`:** dùng **`GIN`**.

```sql
-- Index toàn bộ document, hỗ trợ các toán tử chứa
CREATE INDEX idx_meta ON products USING GIN (meta);

-- Gọn và nhanh hơn nếu chỉ dùng toán tử chứa @>
CREATE INDEX idx_meta_path ON products USING GIN (meta jsonb_path_ops);

-- Chỉ một trường hay lọc: index biểu thức B-tree là đủ
CREATE INDEX idx_brand ON products ((meta->>'brand'));
```

Nguyên tắc chung: `JSONB` là cách thoát ra khỏi schema cứng ở vùng rìa dữ liệu, không phải cái cớ để bỏ hẳn việc thiết kế schema.

</details>

**8. So sánh `SQL` và `NoSQL`. Vì sao lý do 'MongoDB scale tốt hơn' thường không đủ để chọn NoSQL cho một app mới?**

<details className="qa">
<summary>Xem đáp án</summary>

| | SQL (quan hệ) | NoSQL (document, key-value, column, graph) |
| --- | --- | --- |
| Schema | Cố định, kiểm tra ở tầng database | Linh hoạt, mỗi document có thể khác nhau |
| Quan hệ | `JOIN` là việc bình thường | Thường phải nhân bản dữ liệu hoặc join ở tầng ứng dụng |
| Transaction | ACID đầy đủ, nhiều bảng | Có nhưng hạn chế hơn, thường ưu tiên tính sẵn sàng |
| Scale | Chủ yếu scale dọc, có replica và sharding | Sinh ra để scale ngang |
| Hợp với | Đa số nghiệp vụ: đơn hàng, tài chính, người dùng | Log, dữ liệu phi cấu trúc, cache, quy mô đọc ghi rất lớn |

**Vì sao lý do "scale tốt hơn" thường không đủ:**

- **Phần lớn ứng dụng không bao giờ chạm tới ngưỡng đó.** Một Postgres trên máy vừa phải xử lý được hàng nghìn giao dịch mỗi giây; tối ưu index và truy vấn còn tác dụng lớn hơn việc đổi database.
- **Cái giá trả ngay lập tức** thì rõ: mất ràng buộc toàn vẹn ở tầng database, tự viết join trong code, dễ lệch dữ liệu do nhân bản, và khó viết truy vấn tổng hợp cho báo cáo.
- **Postgres cũng đã linh hoạt** nhờ `JSONB`, nên lập luận "cần schema mềm" cũng không còn mạnh.
- Bản thân database quan hệ cũng scale được bằng replica đọc, partition và sharding khi thật sự cần.

Đúng như phần cảnh báo trong bài: đừng chọn "MongoDB vì nó scale" khi chưa thực sự cần. NoSQL dùng đúng chỗ, không phải mặc định.

</details>

**9. `SQLite` chỉ cho phép một writer tại một thời điểm — hệ quả gì với ứng dụng web? Trường hợp nào SQLite vẫn dùng production được?**

<details className="qa">
<summary>Xem đáp án</summary>

SQLite là database dạng file, nhúng thẳng trong tiến trình ứng dụng, và **chỉ một writer được ghi tại một thời điểm**. Đúng như ví dụ trong bài: cuốn sổ tay chỉ có một cây bút — nhiều người cùng đọc thì thoải mái, nhưng hai người muốn ghi cùng lúc thì phải chờ nhau.

**Hệ quả với web app:** khi nhiều request cùng ghi, chúng xếp hàng; nếu chờ quá lâu sẽ gặp lỗi kiểu "database is locked". Ngoài ra, vì database nằm ngay trên đĩa của máy chạy app nên **không chạy được nhiều instance dùng chung một database**, tức là không scale ngang theo cách thông thường. Bật chế độ **WAL** giúp người đọc không bị chặn bởi người ghi, cải thiện đáng kể nhưng vẫn không bỏ được giới hạn một writer.

**Vẫn dùng production được khi:**

- Ứng dụng **đọc nhiều, ghi ít**: blog, CMS, trang tài liệu, công cụ nội bộ, dashboard.
- Chạy trên **một máy duy nhất**, cần ít thành phần và độ trễ thấp vì không phải đi qua mạng.
- Có lớp bổ trợ: **Litestream** sao lưu liên tục lên S3, **LiteFS** nhân bản nhiều vùng, **Turso/Cloudflare D1** đưa SQLite ra edge.
- Ứng dụng mobile, desktop, CLI — đây vốn là sân nhà của SQLite.

Không phù hợp khi ghi đồng thời cao, ví dụ luồng thanh toán của một sàn thương mại điện tử.

</details>

**10. So sánh tự host database với dùng managed service (`RDS`, `Neon`, `Supabase`). Bạn mất và được gì ở mỗi hướng?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Tự host (VPS, máy riêng) | Managed service |
| --- | --- | --- |
| Chi phí tiền mặt | Rẻ hơn ở cùng cấu hình | Đắt hơn, nhưng đã gồm công vận hành |
| Vận hành | Bạn tự lo cài đặt, vá bảo mật, nâng phiên bản, giám sát | Nhà cung cấp lo phần lớn |
| Backup, khôi phục | Tự thiết lập và tự kiểm chứng | Backup tự động, thường có point-in-time recovery sẵn |
| Tính sẵn sàng cao | Tự dựng replica, tự làm failover | Bật vài tuỳ chọn là có |
| Kiểm soát | Toàn quyền: extension, tham số kernel, phiên bản | Bị giới hạn theo danh sách nhà cung cấp cho phép |
| Rủi ro | Phụ thuộc vào năng lực đội ngũ | Phụ thuộc nhà cung cấp, khó chuyển đi, chi phí tăng theo quy mô |

Các lựa chọn managed đáng chú ý: **AWS RDS / GCP Cloud SQL** cho kiểu truyền thống, **Neon** với khả năng tạo nhánh database như Git rất tiện cho môi trường preview, **Supabase** gói kèm auth, storage và edge function.

**Quan điểm thực dụng:** đội nhỏ, không có DBA thì gần như luôn nên dùng managed — thời gian tiết kiệm được đáng giá hơn phần chênh lệch chi phí, và rủi ro mất dữ liệu do sơ suất vận hành là thứ đắt nhất. Tự host chỉ hợp lý khi quy mô đủ lớn để chi phí thành vấn đề, hoặc có ràng buộc pháp lý buộc dữ liệu phải nằm trong hạ tầng của mình.

</details>

**11. Giải thích `replication` primary–replica. `Replication lag` gây ra vấn đề gì, và bạn xử lý tình huống `read-after-write` ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Replication primary–replica:** một node **primary** nhận toàn bộ lệnh ghi, rồi truyền luồng thay đổi (WAL của Postgres, binlog của MySQL) sang các **replica**. Replica áp dụng lại các thay đổi đó và phục vụ truy vấn đọc. Mục đích: chia tải đọc, có sẵn bản dự phòng để failover, và tách các truy vấn báo cáo nặng ra khỏi máy chính.

**Replication lag** là độ trễ giữa lúc primary ghi xong và lúc replica áp dụng xong — thường vài mili giây, nhưng có thể lên tới vài giây khi ghi dồn dập hoặc replica quá tải. Hệ quả: đọc từ replica có thể thấy **dữ liệu cũ**.

**Vấn đề `read-after-write`:** người dùng sửa hồ sơ, được báo thành công, nhưng trang tải lại đọc từ replica chưa kịp cập nhật và hiện ra dữ liệu cũ — trông như hệ thống bị lỗi.

Cách xử lý:

- **Đọc từ primary sau khi ghi**, trong một khoảng thời gian ngắn hoặc cho riêng người dùng vừa thao tác (sticky routing).
- **Chốt theo vị trí replication** — ghi lại LSN sau khi ghi, chỉ đọc từ replica đã bắt kịp tới vị trí đó.
- **Đọc đồng bộ** với những nghiệp vụ nhạy cảm (số dư, tồn kho) — luôn đi thẳng vào primary.
- **Cập nhật lạc quan ở giao diện** — hiển thị ngay giá trị vừa gửi, không chờ đọc lại.
- **Giám sát lag** và cảnh báo khi vượt ngưỡng.

</details>

**12. Khi nào cần `sharding` thay vì chỉ nâng cấu hình máy (`vertical scaling`)? `Vitess`/`PlanetScale` giải quyết vấn đề gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Thứ tự nên đi theo, chỉ bước sang mức sau khi mức trước hết đường:

1. **Tối ưu trước** — thêm index, sửa truy vấn chậm, bỏ N+1, thêm cache, dùng connection pool. Bước này thường mang lại nhiều nhất.
2. **Vertical scaling** — nâng CPU, RAM, ổ đĩa. Đơn giản, không phải đổi code; giới hạn là kích thước máy lớn nhất và chi phí tăng phi tuyến.
3. **Read replica** — nếu nghẽn nằm ở lượng đọc.
4. **Partition bảng** theo thời gian hoặc theo khoảng giá trị, vẫn trong một database.
5. **Sharding** — chia dữ liệu ra nhiều database theo một khoá.

**Chỉ sharding khi:** lượng ghi vượt sức một node, dữ liệu lớn tới mức một máy không chứa nổi, hoặc cần cô lập dữ liệu theo vùng địa lý hay theo khách hàng. Cái giá rất đắt: mất khả năng join giữa các shard, transaction xuyên shard trở nên khó, chọn sai shard key là bị lệch tải, và việc chia lại shard rất phức tạp.

**Vitess** (nền tảng đứng sau **PlanetScale**) là lớp trung gian đặt trước MySQL, lo giúp phần khó: định tuyến truy vấn tới đúng shard, gộp kết quả, quản lý metadata và chia lại shard mà gần như không ngừng dịch vụ — ứng dụng vẫn nói chuyện như với một MySQL duy nhất. PlanetScale còn bổ sung schema branching, cho phép thay đổi schema theo kiểu nhánh Git.

</details>

**13. Chiến lược backup của bạn là gì: full và incremental khác nhau ra sao, `PITR` (point-in-time recovery) là gì, và làm sao biết bản backup thực sự dùng được?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Full backup** — sao lưu toàn bộ database tại một thời điểm. Khôi phục đơn giản nhất nhưng tốn dung lượng và thời gian, nên thường chạy theo chu kỳ dài (hằng ngày, hằng tuần).
- **Incremental backup** — chỉ lưu phần thay đổi kể từ bản sao lưu trước. Nhanh và nhẹ, nhưng khi khôi phục phải có đủ chuỗi từ bản full gần nhất; mất một mắt xích là hỏng cả chuỗi.
- **PITR (point-in-time recovery)** — khôi phục về **đúng một thời điểm bất kỳ**, bằng cách lấy bản full gần nhất rồi phát lại nhật ký ghi (WAL của Postgres, binlog của MySQL) tới đúng giây mong muốn. Đây là thứ cứu bạn khi ai đó lỡ chạy `DELETE` thiếu `WHERE` lúc 10 giờ 32 phút.

Một chiến lược đầy đủ cần xác định rõ **RPO** (chấp nhận mất tối đa bao nhiêu dữ liệu) và **RTO** (chấp nhận ngừng dịch vụ bao lâu), lưu backup ở nơi tách biệt với database (S3 hoặc vùng khác), mã hoá, và đặt chính sách giữ nhiều mốc thời gian.

**Làm sao biết backup dùng được:** cách duy nhất đáng tin là **khôi phục thử định kỳ** vào một môi trường riêng, rồi kiểm chứng: số dòng ở các bảng chính, vài truy vấn nghiệp vụ, thời gian khôi phục thực tế. Backup chưa từng được khôi phục thử thì chỉ là niềm tin, không phải bản sao lưu.

</details>

**14. Vì sao PostgreSQL cần `connection pool` (`PgBouncer`)? Chuyện gì xảy ra khi môi trường serverless mở quá nhiều connection tới DB?**

<details className="qa">
<summary>Xem đáp án</summary>

PostgreSQL dùng mô hình **một tiến trình cho mỗi connection**. Mỗi kết nối tốn bộ nhớ riêng và tốn chi phí khởi tạo đáng kể, nên `max_connections` thường chỉ đặt ở mức vài trăm. Vượt ngưỡng đó, máy chủ tốn nhiều công chuyển ngữ cảnh và bộ nhớ hơn là làm việc thật — thông lượng đi xuống dù CPU vẫn bận.

**Connection pool** giải quyết bằng cách giữ sẵn một nhóm kết nối và cho ứng dụng dùng luân phiên. `PgBouncer` là pooler đặt ngoài database, nhận hàng nghìn kết nối từ phía ứng dụng nhưng chỉ mở vài chục kết nối thật tới Postgres. Ba chế độ chính là session, transaction và statement; chế độ **transaction** phổ biến nhất vì tận dụng kết nối tốt nhất, đổi lại không dùng được prepared statement theo phiên hay biến phiên.

**Với serverless:** mỗi lần hàm được gọi, một instance mới có thể tự mở connection riêng. Khi traffic tăng đột biến, hàng nghìn instance đồng thời mở kết nối, database nhanh chóng chạm `max_connections` và bắt đầu từ chối với lỗi "too many clients". Nghịch lý là phần tính toán scale rất tốt nhưng database thì gục. Cách xử lý: đặt một pooler trước database (PgBouncer, RDS Proxy, chế độ pooled của Neon/Supabase), dùng driver kết nối qua HTTP, và giới hạn kích thước pool ở mỗi instance.

</details>

**15. Bạn phải migrate một hệ thống đang chạy từ MySQL sang PostgreSQL. Nêu các rủi ro chính và cách giảm downtime.**

<details className="qa">
<summary>Xem đáp án</summary>

**Rủi ro chính:**

- **Khác biệt kiểu dữ liệu** — `AUTO_INCREMENT` sang `SERIAL`/`IDENTITY`, `TINYINT(1)` sang `BOOLEAN`, `DATETIME` sang `timestamptz`, kiểu `ENUM` và `UNSIGNED`.
- **Phân biệt hoa thường** — MySQL mặc định so sánh chuỗi không phân biệt hoa thường, Postgres thì có. Điều này âm thầm làm đổi kết quả đăng nhập theo email, tìm kiếm, ràng buộc `UNIQUE`.
- **SQL thô và stored procedure** — hàm khác nhau, PL/SQL phải viết lại.
- **Dữ liệu bẩn** mà MySQL vốn dễ dãi cho qua: ngày `0000-00-00`, chuỗi rỗng thay cho `NULL`, giá trị vi phạm khoá ngoại mà MyISAM không chặn.
- **Ứng dụng** — driver, ORM, chỉ số hiệu năng đổi, kế hoạch truy vấn khác nên có truy vấn đang nhanh bỗng chậm.

**Cách giảm downtime:**

1. Chuyển đổi schema trước, làm sạch dữ liệu bẩn ngay trên MySQL.
2. Nạp bản sao dữ liệu ban đầu sang Postgres, rồi bật **đồng bộ liên tục** (công cụ CDC như Debezium, hoặc pgloader cho bản nạp đầu).
3. Chạy song song **shadow read** — đọc từ cả hai bên và so sánh kết quả để phát hiện lệch.
4. Chọn cửa sổ chuyển đổi, **khoá ghi trong thời gian ngắn**, chờ đồng bộ bắt kịp, đối chiếu số lượng dòng và tổng kiểm tra.
5. Chuyển ứng dụng sang Postgres, theo dõi sát lỗi và latency.
6. **Giữ đường lùi** — MySQL vẫn chạy và còn đồng bộ ngược trong vài ngày trước khi gỡ bỏ.

</details>

**16. `charset`/`collation` và kiểu thời gian (`timestamp` với `timestamptz`) hay gây lỗi gì trong thực tế? Bạn lưu thời gian theo chuẩn nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Charset và collation:**

- `charset` quy định bảng mã lưu ký tự, `collation` quy định cách so sánh và sắp xếp.
- Lỗi kinh điển trên MySQL: dùng `utf8` — vốn chỉ là UTF-8 tối đa 3 byte — khiến emoji và một số ký tự bị cắt hoặc báo lỗi. Phải dùng `utf8mb4`.
- Collation mặc định của MySQL không phân biệt hoa thường, nên `Admin` và `admin` bị coi là trùng khi kiểm tra `UNIQUE`. Chuyển sang Postgres là hành vi đổi ngay.
- Join giữa hai cột khác collation có thể khiến index không dùng được, truy vấn chậm bất thường.
- Tiếng Việt có dấu sắp xếp đúng hay không cũng phụ thuộc collation.

**Timestamp và timestamptz (PostgreSQL):**

- `timestamp` (không có timezone) lưu con số trần, không mang thông tin múi giờ — hai người ở hai múi giờ đọc ra hai nghĩa khác nhau.
- `timestamptz` lưu thời điểm tuyệt đối theo UTC và quy đổi theo múi giờ của phiên khi đọc. Đây là thứ bạn gần như luôn muốn.

**Quy ước nên theo:** lưu mọi mốc thời gian ở **UTC**, dùng `timestamptz` trên Postgres, truyền qua API theo định dạng **ISO 8601** (ví dụ `2026-09-24T10:32:00Z`), và **chỉ quy đổi sang giờ địa phương ở tầng hiển thị**. Với dữ liệu thuần ngày như ngày sinh thì dùng `DATE`, đừng gắn múi giờ vào.

</details>
