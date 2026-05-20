---
sidebar_position: 1
title: "1. Hệ quản trị Relational Database"
---

# Hệ quản trị Relational Database

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

:::

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

| | PostgreSQL | MySQL | SQLite | MS SQL | Oracle |
|--|-----------|-------|--------|--------|--------|
| **Cost** | Free | Free | Free | $$ | $$$$ |
| **Complexity** | Vừa | Đơn giản | **Cực đơn giản** | Vừa | Phức tạp |
| **Feature** | **Mạnh nhất** OSS | Trung bình | Hạn chế | Mạnh | **Mạnh nhất** |
| **Performance** | Tốt | Tốt | Excellent read | Tốt | Excellent |
| **Scale** | Tốt | **Rất tốt** (Vitess) | Hạn chế | Tốt | Excellent |
| **Job market VN** | Đang lên | Phổ biến | Embedded | Enterprise | Banking |
| **Khuyến nghị 2026** | **#1** | OK | Mobile/Edge | Nếu MS stack | Nếu enterprise lớn |

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
