---
sidebar_position: 1
title: "1. Kiến thức nền tảng"
---

# Kiến thức nền tảng

---

## Mục lục

- [Relational Database là gì?](#relational-database-là-gì)
- [Lợi ích và giới hạn của RDBMS](#lợi-ích-và-giới-hạn-của-rdbms)
- [SQL vs NoSQL](#sql-vs-nosql)

---

## Relational Database là gì?

**Relational Database (RDB)** tổ chức dữ liệu thành **bảng (table)** gồm
**cột (column)** và **dòng (row)**, liên kết với nhau qua **khóa ngoại
(foreign key)**. Mọi bảng phải tuân theo **schema** được định nghĩa trước.

```text
┌─────────────────────────────────┐    ┌──────────────────────────────┐
│ TABLE: users                    │    │ TABLE: orders                │
├────┬──────────┬─────────────────┤    ├────┬─────────┬───────────────┤
│ id │ name     │ email           │    │ id │ user_id │ total         │
├────┼──────────┼─────────────────┤    ├────┼─────────┼───────────────┤
│  1 │ An       │ an@example.com  │    │ 10 │       1 │ 250,000 VND   │
│  2 │ Bình     │ binh@example.com│    │ 11 │       2 │ 130,000 VND   │
└────┴──────────┴─────────────────┘    └────┴─────────┴───────────────┘
                                              └──── FK → users.id
```

:::info[Thuật ngữ]

**RDBMS (Relational Database Management System)** — phần mềm hiện thực
mô hình quan hệ. PostgreSQL, MySQL, SQLite, MS SQL Server, Oracle đều là
các RDBMS.

Phân biệt nhanh:
- **RDB** = mô hình (table, row, column, foreign key)
- **RDBMS** = phần mềm quản lý mô hình đó (Postgres, MySQL…)

:::

### Các thành phần cốt lõi

| Thành phần | Vai trò |
|---|---|
| **Table** | Tập hợp dữ liệu cùng loại (như một tờ Excel) |
| **Column** | Thuộc tính của dữ liệu, có kiểu dữ liệu cố định |
| **Row** | Một bản ghi cụ thể |
| **Schema** | Bản thiết kế cấu trúc: tên bảng, cột, kiểu dữ liệu, ràng buộc |
| **Primary Key** | Định danh duy nhất cho mỗi row trong bảng |
| **Foreign Key** | Cột tham chiếu tới PK của bảng khác — tạo quan hệ |
| **Index** | Cấu trúc phụ tăng tốc truy vấn |

### Ví dụ tạo bảng với quan hệ

```sql
-- Bảng cha
CREATE TABLE users (
    id      SERIAL PRIMARY KEY,
    name    VARCHAR(100) NOT NULL,
    email   VARCHAR(255) UNIQUE NOT NULL
);

-- Bảng con tham chiếu bảng cha qua foreign key
CREATE TABLE orders (
    id         SERIAL PRIMARY KEY,
    user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total      NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RDBMS phổ biến

| RDBMS | Đặc điểm nổi bật | Dùng khi |
|---|---|---|
| **PostgreSQL** | Tính năng phong phú, tuân thủ chuẩn SQL cao, mã nguồn mở | Ứng dụng production, cần tính năng nâng cao |
| **MySQL / MariaDB** | Phổ biến, nhanh cho đọc đơn giản, ecosystem lớn | Web app truyền thống, WordPress, Laravel |
| **SQLite** | File-based, không cần server, nhẹ | Mobile app, prototype, testing |
| **MS SQL Server** | Tích hợp tốt hệ sinh thái Microsoft | Doanh nghiệp dùng .NET / Azure |
| **Oracle DB** | Tính năng enterprise mạnh, license đắt | Ngân hàng, tập đoàn lớn |

:::tip[Mẹo]

Nếu bắt đầu dự án mới và không có ràng buộc đặc biệt, hãy chọn
**PostgreSQL** — miễn phí, mã nguồn mở, hỗ trợ JSON, full-text search,
window functions, và extensions phong phú.

:::

---

## Lợi ích và giới hạn của RDBMS

### Lợi ích

**1. ACID — đảm bảo toàn vẹn dữ liệu**

```sql
-- Chuyển tiền: cả hai thao tác phải thành công hoặc đều rollback
BEGIN;
    UPDATE accounts SET balance = balance - 500000 WHERE id = 1;
    UPDATE accounts SET balance = balance + 500000 WHERE id = 2;
COMMIT; -- Hoặc ROLLBACK nếu có lỗi
```

:::info[Phân tích]

**ACID** gồm bốn tính chất:
- **Atomicity** — transaction hoặc thành công toàn bộ, hoặc thất bại toàn bộ
- **Consistency** — dữ liệu luôn ở trạng thái hợp lệ theo ràng buộc
- **Isolation** — các transaction song song không ảnh hưởng nhau
- **Durability** — sau khi commit, dữ liệu không bị mất dù hệ thống crash

:::

**2. Integrity — ràng buộc tự động**

```sql
-- Database tự từ chối dữ liệu vi phạm ràng buộc
INSERT INTO orders (user_id, total)
VALUES (9999, 100); -- Lỗi: user_id=9999 không tồn tại trong users
```

**3. SQL chuẩn hóa** — cú pháp tương đồng giữa các RDBMS, dễ chuyển đổi.

**4. Quan hệ giữa bảng** — JOIN cho phép truy vấn dữ liệu liên kết hiệu quả.

**5. Công cụ trưởng thành** — backup, replication, monitoring, ORM đều có sẵn.

### Giới hạn

| Hạn chế | Giải thích |
|---|---|
| **Scale ngang khó** | Shard dữ liệu quan hệ phức tạp hơn NoSQL rất nhiều |
| **Schema cứng** | Thay đổi cấu trúc bảng (migration) trên bảng lớn tốn thời gian |
| **Dữ liệu phi cấu trúc** | Không tự nhiên với JSON động, media, graph, time-series lớn |
| **Chi phí license** | Oracle, MS SQL Server có giá rất cao cho enterprise |
| **Impedance mismatch** | Mapping giữa object OOP và bảng quan hệ cần ORM |

:::warning[Cần lưu ý]

RDBMS vẫn là lựa chọn mặc định tốt cho **phần lớn ứng dụng** — đặc biệt
khi dữ liệu có cấu trúc rõ ràng và tính nhất quán quan trọng.
Chỉ xem xét NoSQL khi thực sự cần thiết, tránh over-engineering.

:::

---

## SQL vs NoSQL

### Bảng so sánh tổng quan

| Tiêu chí | SQL (RDBMS) | NoSQL |
|---|---|---|
| **Mô hình dữ liệu** | Bảng (table/row/column) | Document, Key-Value, Column-family, Graph |
| **Schema** | Cứng, định nghĩa trước | Linh hoạt hoặc schema-less |
| **Ngôn ngữ truy vấn** | SQL chuẩn | Riêng cho từng hệ (MQL, CQL, Gremlin…) |
| **ACID** | Hỗ trợ đầy đủ | Thường chỉ BASE, một số hỗ trợ ACID hạn chế |
| **Scale** | Chủ yếu vertical (nâng cấp server) | Horizontal (thêm node) dễ dàng hơn |
| **Quan hệ dữ liệu** | Mạnh — JOIN, FK | Yếu hoặc phải xử lý ở application layer |
| **Tính nhất quán** | Strong consistency | Eventual consistency (mặc định nhiều hệ) |
| **Tốc độ đọc/ghi lớn** | Phụ thuộc cấu hình | Thường cao hơn ở write-heavy workload |
| **Ví dụ hệ thống** | PostgreSQL, MySQL, Oracle | MongoDB, Redis, Cassandra, DynamoDB, Neo4j |

### Các loại NoSQL phổ biến

```text
Document Store  → MongoDB, CouchDB
  Lưu dữ liệu dạng JSON/BSON; phù hợp khi schema thay đổi thường xuyên

Key-Value Store → Redis, DynamoDB
  Truy cập theo key cực nhanh; phù hợp cache, session, leaderboard

Column-family   → Cassandra, HBase
  Tối ưu cho time-series, log, analytics quy mô lớn

Graph DB        → Neo4j, Amazon Neptune
  Mô hình node/edge; phù hợp mạng xã hội, fraud detection
```

### Khi nào chọn SQL?

```sql
-- Ví dụ: Hệ thống ngân hàng — cần ACID tuyệt đối
BEGIN;
    INSERT INTO transactions (from_account, to_account, amount)
    VALUES (101, 202, 1000000);

    UPDATE accounts SET balance = balance - 1000000 WHERE id = 101;
    UPDATE accounts SET balance = balance + 1000000 WHERE id = 202;
COMMIT;
```

Chọn SQL khi:
- Dữ liệu có **cấu trúc rõ ràng** và ít thay đổi schema
- Cần **ACID** — thanh toán, đặt hàng, y tế, tài chính
- Dữ liệu có **nhiều quan hệ** cần JOIN thường xuyên
- Team đã quen SQL, cần tốc độ phát triển cao

### Khi nào chọn NoSQL?

Chọn NoSQL khi:
- Cần **scale ngang** nhanh chóng với hàng triệu request/giây
- Schema **thay đổi thường xuyên** hoặc dữ liệu không đồng nhất
- Dữ liệu dạng **document lồng nhau** (catalog sản phẩm, CMS)
- Use case đặc thù: **cache** (Redis), **graph** (Neo4j), **time-series** (InfluxDB)

:::tip[Mẹo]

Trong thực tế, nhiều hệ thống dùng **cả hai**:
PostgreSQL cho business data cần ACID + Redis cho cache/session.
Đây là pattern phổ biến — không cần phải chọn một.

:::

---
