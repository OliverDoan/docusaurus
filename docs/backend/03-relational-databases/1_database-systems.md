---
sidebar_position: 1
title: "1. Hệ quản trị Relational Database"
---

# Hệ quản trị Relational Database

Relational Database (cơ sở dữ liệu quan hệ) là cách lưu trữ data phổ biến nhất trong backend, sắp xếp thông tin thành các bảng có dòng và cột giống bảng tính Excel. Bài này giới thiệu các hệ quản trị thường gặp như PostgreSQL, MySQL, SQLite, MS SQL Server và Oracle, cùng gợi ý nên chọn cái nào cho dự án của bạn. Hiểu chúng giúp bạn lưu và truy vấn data của ứng dụng một cách an toàn, đáng tin cậy.

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
