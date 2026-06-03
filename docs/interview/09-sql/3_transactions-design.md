---
sidebar_position: 3
title: "3. Transactions & Data Modeling"
---

# Transactions & Data Modeling

> *Phần này tập trung vào tính toàn vẹn dữ liệu, thiết kế schema, và các chiến lược xử lý đồng thời — những chủ đề phân biệt rõ senior engineer với junior trong vòng phỏng vấn backend.*

---

## Câu 1: ACID là gì? `[Intermediate]`

### Câu hỏi

> "Em hãy giải thích ACID trong cơ sở dữ liệu. Cho anh một ví dụ thực tế để thấy rõ từng tính chất."

### Giải thích lý thuyết

| Chữ | Tên | Ý nghĩa |
|-----|-----|---------|
| **A** | Atomicity | Transaction hoặc thành công hoàn toàn, hoặc rollback hoàn toàn — không có trạng thái "nửa vời" |
| **C** | Consistency | Dữ liệu phải chuyển từ trạng thái hợp lệ này sang trạng thái hợp lệ khác, không vi phạm constraint |
| **I** | Isolation | Các transaction đồng thời không thấy kết quả trung gian của nhau |
| **D** | Durability | Sau khi commit, dữ liệu tồn tại vĩnh viễn dù server crash |

### Code minh hoạ

```sql
-- Chuyển 500k từ account A sang account B
BEGIN;

UPDATE accounts SET balance = balance - 500000 WHERE id = 1; -- A giảm
UPDATE accounts SET balance = balance + 500000 WHERE id = 2; -- B tăng

-- Nếu lệnh 2 lỗi, toàn bộ rollback (Atomicity)
-- balance không bao giờ âm nếu có CHECK constraint (Consistency)
COMMIT;
```

### Đáp án mẫu

> "Em giải thích ACID qua ví dụ chuyển tiền: Atomicity đảm bảo nếu lệnh trừ tiền tài khoản A thành công nhưng cộng vào B lỗi thì cả hai đều rollback — tiền không biến mất. Consistency là số dư không bao giờ âm nhờ CHECK constraint. Isolation là hai giao dịch chuyển tiền đồng thời không can thiệp nhau. Durability là sau COMMIT, dù server mất điện ngay, dữ liệu vẫn được ghi vào WAL log và phục hồi được. Trong thực tế em hay dùng `BEGIN/COMMIT` bọc các thao tác multi-table để đảm bảo ACID."

---

## Câu 2: Transaction Isolation Levels `[Senior]`

### Câu hỏi

> "Postgres có mấy mức isolation? Mỗi mức ngăn được anomaly nào? Mặc định Postgres dùng mức gì và tại sao?"

### Giải thích lý thuyết

| Mức Isolation | Dirty Read | Non-repeatable Read | Phantom Read |
|---------------|-----------|---------------------|--------------|
| Read Uncommitted | Có thể | Có thể | Có thể |
| **Read Committed** (mặc định Postgres) | Ngăn được | Có thể | Có thể |
| Repeatable Read | Ngăn được | Ngăn được | Có thể* |
| Serializable | Ngăn được | Ngăn được | Ngăn được |

*Postgres dùng MVCC nên Repeatable Read cũng ngăn Phantom Read trong thực tế.*

- **Dirty Read**: đọc dữ liệu chưa commit của transaction khác
- **Non-repeatable Read**: đọc cùng row 2 lần ra kết quả khác vì transaction khác đã UPDATE
- **Phantom Read**: đọc cùng query 2 lần ra số row khác vì transaction khác đã INSERT/DELETE

### Code minh hoạ

```sql
-- Đặt isolation level cho session hiện tại
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;

SELECT balance FROM accounts WHERE id = 1; -- lần 1: 1,000,000
-- transaction khác UPDATE accounts SET balance = 500000 WHERE id = 1 và COMMIT
SELECT balance FROM accounts WHERE id = 1; -- lần 2: vẫn 1,000,000 (Repeatable Read bảo vệ)

COMMIT;

-- Dùng SERIALIZABLE khi cần tuyệt đối (ví dụ: seat booking)
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
SELECT COUNT(*) FROM bookings WHERE flight_id = 100; -- kiểm tra còn chỗ
INSERT INTO bookings (flight_id, user_id) VALUES (100, 42);
COMMIT; -- Postgres tự phát hiện conflict và có thể raise serialization_failure
```

### Đáp án mẫu

> "Em biết Postgres có 4 mức nhưng thực tế hoạt động là 3 vì Read Uncommitted được map sang Read Committed. Mặc định là Read Committed — đủ an toàn cho hầu hết CRUD mà không quá tốn chi phí lock. Khi em làm tính năng đặt vé, em nâng lên Serializable để tránh double-booking. Trade-off là throughput giảm vì Postgres có thể throw `serialization_failure` và app phải retry. Với báo cáo tài chính cần snapshot nhất quán, em dùng Repeatable Read."

---

## Câu 3: Normalization vs Denormalization `[Senior]`

### Câu hỏi

> "3NF là gì? Khi nào em sẽ cố tình denormalize schema, và trade-off là gì?"

### Giải thích lý thuyết

**Các dạng chuẩn hóa:**

| Dạng | Điều kiện | Mục tiêu |
|------|-----------|----------|
| 1NF | Không có nhóm lặp, mỗi cell một giá trị nguyên tử | Loại bỏ dữ liệu lặp trong cell |
| 2NF | 1NF + mọi non-key attribute phụ thuộc đầy đủ vào khóa chính | Loại bỏ phụ thuộc một phần |
| 3NF | 2NF + không có transitive dependency (A → B → C) | Loại bỏ phụ thuộc bắc cầu |

**Khi nào denormalize:**
- Bảng read-heavy với JOIN nhiều bảng gây bottleneck
- Dashboard / analytics cần aggregate nhanh
- Microservice cần data locality, tránh cross-service JOIN

**Trade-off denormalization:**

| Ưu điểm | Nhược điểm |
|---------|------------|
| Query đọc nhanh hơn | Dữ liệu trùng lặp, tốn storage |
| Ít JOIN hơn | Update anomaly — phải sync nhiều nơi |
| Cache dễ hơn | Khó maintain tính nhất quán |

### Code minh hoạ

```sql
-- Normalized (3NF): orders JOIN order_items JOIN products
SELECT o.id, p.name, oi.quantity, p.price
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.user_id = 42;

-- Denormalized: lưu snapshot giá và tên tại thời điểm đặt hàng
-- order_items đã có sẵn product_name và unit_price
SELECT id, product_name, quantity, unit_price
FROM order_items
WHERE order_id = 123;
-- Không JOIN, đọc nhanh hơn, và giá không bị thay đổi khi sản phẩm update
```

### Đáp án mẫu

> "Em hiểu 3NF là không có transitive dependency — ví dụ bảng orders không nên chứa city_name khi đã có city_id trỏ sang bảng cities. Nhưng trong thực tế, em đã denormalize bảng order_items bằng cách lưu thêm `product_name` và `unit_price` tại thời điểm đặt hàng — vừa tránh JOIN vừa đảm bảo lịch sử đơn hàng không thay đổi dù sản phẩm bị đổi giá. Trade-off là nếu cần sửa thì phải update nhiều chỗ, nên em chỉ denormalize với data ít thay đổi hoặc cần giữ snapshot."

---

## Câu 4: Primary Key — SERIAL/IDENTITY vs UUID `[Intermediate]`

### Câu hỏi

> "Em sẽ chọn auto-increment integer hay UUID làm primary key? Cho anh biết trade-off của từng loại."

### Giải thích lý thuyết

| Tiêu chí | SERIAL / IDENTITY | UUID (v4) | UUID (v7) |
|----------|------------------|-----------|-----------|
| Kích thước | 4–8 bytes | 16 bytes | 16 bytes |
| Index locality | Tốt — insert tuần tự, B-tree ít bị phân mảnh | Kém — random, gây page split | Tốt — có timestamp prefix |
| Distributed / Merge | Khó — conflict khi merge nhiều DB | Dễ — globally unique | Dễ — globally unique |
| Lộ thông tin | Có — lộ số lượng record | Không | Không |
| Human-readable URL | Dễ đọc nhưng đoán được | Khó đoán, an toàn hơn | Khó đoán, an toàn hơn |

### Code minh hoạ

```sql
-- Auto-increment (PostgreSQL 10+)
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email TEXT NOT NULL
);

-- UUID v4 (random)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL
);

-- UUID v7 (time-ordered, PostgreSQL 17+ có hàm uuidv7())
-- Hoặc dùng extension uuid-ossp / generate từ app layer
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    payload JSONB
);
```

### Đáp án mẫu

> "Em thường dùng BIGINT IDENTITY cho các bảng internal như logs hay lookups vì nhỏ gọn và index nhanh. Nhưng với entity expose ra API — như users hay orders — em dùng UUID v7 vì vừa globally unique (dễ merge microservice), vừa không lộ số lượng record, lại có timestamp prefix nên index locality tốt hơn UUID v4. UUID v4 em tránh dùng làm PK của bảng lớn vì random insert làm B-tree bị phân mảnh nhiều."

---

## Câu 5: SQL vs NoSQL `[Intermediate]`

### Câu hỏi

> "Dự án mới, em sẽ chọn PostgreSQL hay MongoDB? Khi nào em chọn NoSQL thay vì SQL?"

### Giải thích lý thuyết

| Tiêu chí | SQL (PostgreSQL) | NoSQL (MongoDB, DynamoDB) |
|----------|-----------------|--------------------------|
| Schema | Fixed, strict | Flexible, schemaless |
| ACID | Đầy đủ | Tuỳ loại (MongoDB 4+ có multi-doc transaction) |
| Query | Phức tạp, JOIN mạnh | Hạn chế JOIN, tối ưu document |
| Scale | Vertical + horizontal (read replicas, Citus) | Horizontal native |
| Use case tốt | Tài chính, ERP, quan hệ phức tạp | Catalog sản phẩm, feed, IoT, search |
| Use case không tốt | Schema thay đổi liên tục, write scale cực cao | Nhiều relationship, báo cáo phức tạp |

### Code minh hoạ

```sql
-- PostgreSQL: query phức tạp với JOIN và aggregate
SELECT u.name, COUNT(o.id) AS total_orders, SUM(o.amount) AS total_spent
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id
HAVING SUM(o.amount) > 1000000
ORDER BY total_spent DESC;

-- PostgreSQL cũng hỗ trợ JSONB khi cần flexible schema
CREATE TABLE products (
    id BIGINT PRIMARY KEY,
    name TEXT,
    attributes JSONB -- NoSQL-style flexible data trong SQL
);
SELECT * FROM products WHERE attributes->>'color' = 'red';
```

### Đáp án mẫu

> "Em mặc định chọn PostgreSQL trước vì ACID đầy đủ, JOIN mạnh, và JSONB cho phép lưu dữ liệu linh hoạt khi cần. Em sẽ chuyển sang NoSQL khi: schema thực sự không thể dự đoán trước, cần write throughput rất cao ở quy mô hàng triệu event mỗi giây (DynamoDB), hoặc cần full-text search mạnh (Elasticsearch). Trong một dự án e-commerce em từng làm, em dùng Postgres cho orders và users, MongoDB cho product catalog vì attributes sản phẩm rất khác nhau giữa các category."

---

## Câu 6: Foreign Key & ON DELETE CASCADE `[Senior]`

### Câu hỏi

> "Anh thấy nhiều hệ thống lớn không dùng foreign key trong database. Em nghĩ sao? Khi nào nên và không nên dùng FK?"

### Giải thích lý thuyết

**Lợi ích của FK:**
- Đảm bảo referential integrity ở tầng DB
- Tài liệu hóa quan hệ, hỗ trợ query planner

**Nhược điểm ở quy mô lớn:**

| Vấn đề | Mô tả |
|--------|-------|
| Write overhead | Mỗi INSERT/UPDATE/DELETE phải check FK — tốn I/O |
| Sharding khó | FK cross-shard là không thể với hầu hết DB |
| Microservices | Mỗi service có DB riêng — FK cross-service không khả thi |
| Bulk import | Phải disable FK hoặc import đúng thứ tự |

**ON DELETE options:**

| Option | Hành vi |
|--------|---------|
| RESTRICT / NO ACTION | Lỗi nếu còn row con tham chiếu |
| CASCADE | Xóa luôn các row con |
| SET NULL | Gán NULL cho FK column của row con |
| SET DEFAULT | Gán default value |

### Code minh hoạ

```sql
-- FK với CASCADE: xóa user thì xóa luôn tất cả orders
CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2)
);

-- Soft FK: không dùng FK constraint, tự enforce ở application layer
-- Phù hợp microservice hoặc sharded DB
CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL, -- không có REFERENCES
    amount NUMERIC(12, 2)
);
-- Application phải tự check user tồn tại trước khi insert

-- Kiểm tra referential integrity định kỳ thay vì real-time
SELECT o.id FROM orders o
LEFT JOIN users u ON u.id = o.user_id
WHERE u.id IS NULL; -- tìm orphan records
```

### Đáp án mẫu

> "Em hiểu tại sao hệ thống lớn như Shopee hay Grab không dùng FK: khi shard data sang nhiều node, FK cross-shard về mặt kỹ thuật là không thể, và overhead check FK trên bảng hàng tỷ row làm chậm write đáng kể. Em sẽ dùng FK khi: ứng dụng monolith vừa, team nhỏ cần DB tự bảo vệ integrity, hoặc business logic quan trọng như tài chính. Em sẽ bỏ FK khi: sharding, microservice, hoặc cần bulk load hiệu năng cao — nhưng phải có cleanup job kiểm tra orphan records định kỳ."

---

## Câu 7: Optimistic vs Pessimistic Locking `[Senior]`

### Câu hỏi

> "Em sẽ dùng cơ chế locking nào để tránh lost update khi nhiều user cùng chỉnh sửa một record? Giải thích rõ hai loại và khi nào dùng cái nào."

### Giải thích lý thuyết

**Lost Update problem**: User A và User B cùng đọc balance = 1000. A trừ 200 và ghi 800. B trừ 300 và ghi 700. Kết quả đúng phải là 500 nhưng ta nhận được 700.

| Tiêu chí | Pessimistic Locking | Optimistic Locking |
|----------|--------------------|--------------------|
| Cơ chế | Lock row khi đọc (`SELECT FOR UPDATE`) | Version column, check khi ghi |
| Phù hợp | Contention cao, conflict thường xuyên | Contention thấp, conflict hiếm |
| Throughput | Thấp hơn (chờ lock) | Cao hơn (không block) |
| Deadlock risk | Có | Không |
| Retry logic | App không cần retry | App phải tự retry khi conflict |

### Code minh hoạ

```sql
-- Pessimistic Locking: lock row ngay khi SELECT
BEGIN;
SELECT balance FROM accounts WHERE id = 1 FOR UPDATE; -- block các transaction khác
UPDATE accounts SET balance = balance - 200 WHERE id = 1;
COMMIT;

-- Optimistic Locking: dùng version column
-- Schema có thêm version INTEGER DEFAULT 0
BEGIN;
SELECT balance, version FROM accounts WHERE id = 1;
-- app đọc được: balance=1000, version=5

-- Khi update, check version chưa thay đổi
UPDATE accounts
SET balance = balance - 200, version = version + 1
WHERE id = 1 AND version = 5; -- điều kiện version

-- Kiểm tra xem update có thành công không
GET DIAGNOSTICS rows_affected = ROW_COUNT;
-- Nếu rows_affected = 0 thì conflict, app phải retry
COMMIT;

-- FOR UPDATE với SKIP LOCKED: dùng cho job queue
SELECT id, payload FROM job_queue
WHERE status = 'pending'
ORDER BY created_at
LIMIT 1
FOR UPDATE SKIP LOCKED; -- worker khác sẽ skip row này
```

### Đáp án mẫu

> "Em từng gặp lost update trong tính năng flash sale — nhiều user cùng mua làm stock thành số âm. Em dùng Pessimistic Locking với `SELECT FOR UPDATE` vì contention rất cao trong flash sale, chấp nhận throughput thấp hơn để đảm bảo correctness. Còn với tính năng chỉnh sửa profile — rất hiếm khi hai người cùng sửa một account — em dùng Optimistic Locking với `version` column, nhẹ hơn nhiều. App phải xử lý retry khi `ROW_COUNT = 0`, nhưng trường hợp đó gần như không xảy ra trong thực tế."

---

## Bẫy thường gặp khi trả lời

| Sai lầm | Đúng là |
|---------|---------|
| Nói ACID chỉ là "transaction an toàn" mà không giải thích từng chữ | Giải thích rõ Atomicity, Consistency, Isolation, Durability với ví dụ cụ thể |
| Nghĩ Serializable luôn tốt nhất nên lúc nào cũng dùng | Serializable có overhead lớn, chỉ dùng khi thực sự cần ngăn Phantom Read |
| Nói 3NF mà không giải thích được transitive dependency là gì | 3NF nghĩa là không có A → B → C với B không phải key |
| Chỉ biết UUID v4, không biết UUID v7 hoặc vấn đề index locality | UUID v7 ra đời giải quyết page split của UUID v4 trong B-tree |
| Nói "NoSQL nhanh hơn SQL" mà không nói ngữ cảnh | Mỗi loại có use case riêng; PostgreSQL với JSONB có thể đủ cho nhiều trường hợp |
| Nghĩ FK luôn là best practice không điều kiện | Ở quy mô sharding hoặc microservice, FK là không khả thi và phải dùng soft FK |
| Nhầm Optimistic và Pessimistic: nói Optimistic thì "bi quan" | Optimistic = lạc quan, giả định ít conflict; Pessimistic = bi quan, lock từ đầu |
