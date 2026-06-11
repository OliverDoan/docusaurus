---
sidebar_position: 10
title: "10. Database Scaling"
---

# Database Scaling

> *Database luôn là bottleneck cuối cùng của hệ thống — stateless service scale ngang dễ dàng, nhưng data thì không. Interviewer hỏi database scaling để xem bạn có biết "leo thang đúng thứ tự": index → cache → replica → sharding, hay nhảy thẳng vào giải pháp phức tạp nhất khi chưa cần.*

---

## Câu 10: Database Sharding là gì? Các chiến lược sharding phổ biến, khi nào nên dùng? `[Advanced]`

### Câu hỏi

> Database Sharding là gì? Trình bày các chiến lược sharding phổ biến, vấn đề phát sinh khi shard, và khi nào mới nên dùng sharding?

### Giải thích lý thuyết

**Sharding** (horizontal partitioning) là kỹ thuật **chia data ra nhiều database instance độc lập**, mỗi instance (shard) giữ một tập con của data. Việc data thuộc shard nào được quyết định bởi **shard key** — thường là cột xuất hiện trong hầu hết query (vd: `user_id`, `tenant_id`). Khác với replication (mỗi node giữ **toàn bộ** data), sharding chia nhỏ — mỗi shard chỉ chịu một phần write load và một phần dataset, nên đây là cách duy nhất để **scale WRITE và scale dung lượng** vượt giới hạn một máy.

Các **chiến lược sharding** phổ biến:

| Chiến lược          | Cách hoạt động                                          | Ưu điểm                                  | Nhược điểm                                              |
| ------------------- | ------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------- |
| **Range-based**     | Chia theo khoảng giá trị key (A–M → shard 1, N–Z → 2)   | Range query hiệu quả, dễ hiểu            | Dễ **hot shard** (data mới dồn vào 1 range)             |
| **Hash-based**      | `hash(key) % N` hoặc consistent hashing → shard         | Phân bố đều, chống hot spot              | Mất khả năng range query; rebalance khó nếu modulo thô  |
| **Directory-based** | Lookup table riêng map key → shard                      | Linh hoạt tối đa, di chuyển data dễ      | Lookup table thành **single point of failure** + thêm 1 hop |
| **Geo-based**       | Chia theo vùng địa lý của user (EU shard, US shard)     | Latency thấp, đáp ứng data residency (GDPR) | Phân bố lệch theo dân số; user di chuyển giữa vùng phức tạp |

Cái giá phải trả khi shard (interviewer rất hay đào sâu phần này):

- **Cross-shard query/join**: query không chứa shard key phải **fan-out ra mọi shard** rồi merge — chậm và đắt. JOIN giữa 2 bảng nằm khác shard gần như bất khả thi ở tầng DB, phải làm ở application.
- **Mất transaction toàn cục**: ACID transaction chỉ còn trong phạm vi 1 shard. Ghi xuyên shard cần 2PC hoặc Saga — phức tạp hơn nhiều.
- **Rebalancing**: thêm shard mới phải di chuyển data. Nếu dùng `hash % N` thô, đổi N là phải reshuffle gần như toàn bộ — vì vậy thực tế dùng **consistent hashing** hoặc chia sẵn nhiều **virtual shard** rồi map vào physical node.
- **Hot shard**: chọn shard key tệ (vd: `created_date` cho hệ thống ghi liên tục) khiến 1 shard gánh phần lớn traffic — sharding mà vẫn nghẽn.
- **Vận hành**: backup, migration, monitoring nhân lên N lần.

**Khi nào nên dùng**: sharding là **phương án cuối cùng**, chỉ sau khi đã (1) vertical scale (máy to hơn), (2) tối ưu query + index, (3) thêm read replica, (4) thêm cache layer — mà write throughput hoặc dung lượng vẫn vượt khả năng một node. Nếu phải shard, ưu tiên giải pháp có sẵn như **Vitess** (MySQL — YouTube dùng), **Citus** (Postgres extension) thay vì tự viết shard routing ở application.

**Insight phỏng vấn**: câu trả lời ăn điểm không phải liệt kê chiến lược, mà là nói rõ "em sẽ KHÔNG shard cho đến khi hết cách" — và chỉ ra việc chọn shard key quyết định 90% thành bại.

### Thiết kế minh hoạ

```text
                        ┌──────────────────┐
   Request (user_id=42) │   App / Router    │  ← Vitess/Citus hoặc routing layer
   ─────────────────────►  hash(user_id)    │
                        └───┬─────┬─────┬───┘
                            │     │     │
              ┌─────────────┘     │     └─────────────┐
              ▼                   ▼                   ▼
      ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
      │   Shard 0    │   │   Shard 1    │   │   Shard 2    │
      │ users 0,3,6..│   │ users 1,4,7..│   │ users 2,5,8..│
      │ (primary +   │   │ (primary +   │   │ (primary +   │
      │  replicas)   │   │  replicas)   │   │  replicas)   │
      └──────────────┘   └──────────────┘   └──────────────┘

  Query CÓ shard_key  → đi đúng 1 shard  → nhanh ✓
  Query KHÔNG có key  → fan-out cả 3 shard rồi merge → chậm ✗
```

```sql
-- Citus (Postgres): biến bảng thường thành bảng phân tán
SELECT create_distributed_table('orders', 'user_id');  -- user_id là shard key

-- Query tốt: chứa shard key → route thẳng 1 shard
SELECT * FROM orders WHERE user_id = 42 AND status = 'paid';

-- Query xấu: không có shard key → Citus phải hỏi MỌI shard
SELECT * FROM orders WHERE status = 'paid';  -- fan-out, tránh trong hot path

-- Co-location: 2 bảng cùng shard key thì JOIN vẫn chạy local trong shard
SELECT u.name, o.total
FROM users u JOIN orders o ON u.id = o.user_id   -- cùng phân tán theo user_id
WHERE u.id = 42;
```

### Đáp án mẫu

> "Sharding là chia data ra nhiều database instance độc lập theo một shard key, mỗi shard giữ một phần data — đây là cách duy nhất để scale write và dung lượng vượt giới hạn một máy, vì replica chỉ scale read. Có bốn chiến lược chính: range-based dễ range query nhưng dễ hot shard, hash-based phân bố đều nhưng mất range query, directory-based linh hoạt nhưng lookup table thành điểm yếu, và geo-based cho data residency. Cái giá là cross-shard query phải fan-out, mất transaction toàn cục, và rebalancing phức tạp — nên chọn shard key đúng là quyết định quan trọng nhất. Quan điểm của em: sharding là phương án cuối, chỉ làm sau khi đã vertical scale, tối ưu index, thêm read replica và cache mà vẫn không đủ. Và nếu phải shard, em dùng Vitess hoặc Citus thay vì tự viết routing."

---

## Câu 11: Read Replica là gì, giúp scale database như thế nào? Hạn chế? `[Intermediate]`

### Câu hỏi

> Read Replica là gì và giúp scale database như thế nào? Replication lag gây ra vấn đề gì và xử lý ra sao? Hạn chế của read replica?

### Giải thích lý thuyết

**Read Replica** là mô hình một **primary** (nhận toàn bộ WRITE) và một hoặc nhiều **replica** sao chép data từ primary để phục vụ READ. Vì đa số hệ thống web có tỉ lệ đọc/ghi rất lệch (90/10 hoặc hơn), tách read sang replica giúp primary chỉ tập trung ghi, còn read throughput scale gần như tuyến tính theo số replica.

Cơ chế phổ biến là **asynchronous replication**: primary ghi xong, commit, trả response cho client **trước**, rồi mới stream WAL/binlog sang replica. Hệ quả trực tiếp là **replication lag** — replica luôn trễ hơn primary vài ms đến vài giây (hoặc vài phút khi quá tải). Đọc từ replica có thể nhận **stale data**.

Vấn đề kinh điển: **read-your-writes** — user vừa đổi avatar (ghi vào primary), trang reload đọc từ replica chưa kịp sync → thấy avatar cũ, tưởng app lỗi. Các cách xử lý:

| Cách xử lý                  | Cơ chế                                                            | Trade-off                                  |
| --------------------------- | ----------------------------------------------------------------- | ------------------------------------------ |
| **Đọc primary sau khi ghi** | Sau write, route read của chính user đó về primary trong X giây   | Đơn giản; primary chịu thêm read load      |
| **Sticky routing**          | Pin session/user vào primary (hoặc 1 replica đã sync) sau write   | Cần state ở routing layer                  |
| **Theo dõi LSN/GTID**       | Client giữ vị trí WAL của write, chỉ đọc replica đã apply tới đó  | Chính xác nhất nhưng phức tạp implement    |
| **Synchronous replication** | Primary chờ replica ack mới commit                                | Hết lag nhưng write latency tăng, replica chết là kẹt write |

Hạn chế quan trọng cần nói rõ trong phỏng vấn:

- **Chỉ scale READ, không scale WRITE** — mọi write vẫn dồn về một primary. Write quá tải thì replica không cứu được, lúc đó mới tính đến sharding (Câu 10).
- **Không scale dung lượng** — mỗi replica giữ full bản sao data.
- **Lag tăng theo write load** — đúng lúc hệ thống bận nhất thì replica trễ nhất.
- Bù lại, replica còn đóng vai trò **High Availability**: primary chết thì **promote** một replica lên làm primary mới (failover). Lưu ý với async replication, vài write cuối chưa kịp sync **có thể mất** — đây là điểm cộng nếu bạn chủ động nhắc.

**Insight phỏng vấn**: đừng chỉ nói "replica để scale read" rồi dừng. Điểm phân biệt senior là nói được replication lag → read-your-writes → cách xử lý, và chốt "replica không giải quyết write bottleneck".

### Thiết kế minh hoạ

```text
                 WRITE                      READ
        ┌──────────────────┐      ┌──────────────────────┐
        │                  ▼      ▼                      │
   ┌────┴────┐        ┌─────────────┐              ┌──────────┐
   │  Client │        │   PRIMARY   │              │   App /  │
   └─────────┘        │  (ghi duy   │              │ LB route │
                      │   nhất)     │              └────┬─────┘
                      └──────┬──────┘                   │ READ
                             │ async WAL/binlog         │
                ┌────────────┼────────────┐             │
                ▼            ▼            ▼             │
          ┌──────────┐ ┌──────────┐ ┌──────────┐        │
          │ Replica 1│ │ Replica 2│ │ Replica 3│◄───────┘
          │ lag ~50ms│ │ lag ~80ms│ │ lag ~2s ⚠│
          └──────────┘ └──────────┘ └──────────┘

   Read-your-writes: user vừa WRITE → trong X giây, read của user đó
   route về PRIMARY (hoặc replica đã sync đủ) để không thấy stale data.
```

```sql
-- Postgres: theo dõi replication lag để loại replica trễ khỏi pool đọc
SELECT client_addr,
       now() - pg_last_xact_replay_timestamp() AS lag  -- chạy trên replica
FROM pg_stat_replication;

-- Pattern "đọc primary sau khi ghi" ở tầng application (pseudo)
-- sau khi UPDATE profile:
--   cache.set("force_primary:user_42", true, ttl=5s)
-- khi đọc profile:
--   nếu force_primary còn TTL → query PRIMARY, ngược lại → REPLICA
```

### Đáp án mẫu

> "Read replica là mô hình một primary nhận toàn bộ write, các replica sao chép data qua async replication để phục vụ read — vì web app thường đọc nhiều hơn ghi rất nhiều nên read throughput scale gần tuyến tính theo số replica. Cái giá của async là replication lag: replica trễ hơn primary, sinh ra vấn đề read-your-writes — user vừa cập nhật xong reload lại thấy data cũ. Em xử lý bằng cách route read của chính user đó về primary trong vài giây sau write, hoặc sticky routing, chuẩn hơn nữa là track LSN để chỉ đọc replica đã sync đủ. Hạn chế lớn nhất em luôn nhấn mạnh: replica chỉ scale read, không scale write và không scale dung lượng — write bottleneck thì phải tính đến sharding. Bù lại replica cho high availability: primary chết thì promote replica lên, chấp nhận có thể mất vài write cuối chưa kịp sync."

---

## Câu 26: Khi nào chọn SQL, khi nào chọn NoSQL? Các yếu tố quyết định? `[Intermediate]`

### Câu hỏi

> Khi nào nên chọn SQL, khi nào nên chọn NoSQL? Những yếu tố nào quyết định lựa chọn này?

### Giải thích lý thuyết

Đây không phải câu hỏi "cái nào tốt hơn" — interviewer muốn xem bạn có **framework ra quyết định** dựa trên yêu cầu thực, hay chọn theo trend. Các yếu tố quyết định:

1. **Data model**: data có quan hệ chặt, nhiều entity tham chiếu nhau (user–order–product) → relational tự nhiên. Data dạng document tự chứa (profile, catalog), key-value (session, cache), hay graph (mạng xã hội) → NoSQL tương ứng phù hợp hơn.
2. **Cần ACID transaction không**: chuyển tiền, đặt hàng trừ kho — cần multi-row transaction mạnh → SQL gần như mặc định. NoSQL có transaction nhưng thường giới hạn (single document/partition) hoặc trả giá đắt.
3. **Query pattern biết trước không**: SQL cho ad-hoc query linh hoạt (JOIN, aggregate bất kỳ). NoSQL như DynamoDB/Cassandra yêu cầu **thiết kế schema theo access pattern từ đầu** — query ngoài kế hoạch rất khó và đắt.
4. **Scale write bao nhiêu**: write hàng trăm nghìn ops/s, dataset hàng chục TB → Cassandra/DynamoDB sinh ra để shard tự động. Còn vài nghìn write/s thì một con Postgres tuned tốt thừa sức.
5. **Schema flexibility**: schema thay đổi liên tục, mỗi record khác cấu trúc → document store thoải mái hơn. Nhưng "schemaless" thật ra là **schema-on-read** — validation dồn về application.

| Tiêu chí           | PostgreSQL            | MongoDB              | DynamoDB                | Cassandra              | Redis                  |
| ------------------ | --------------------- | -------------------- | ----------------------- | ---------------------- | ---------------------- |
| Data model         | Relational + JSONB    | Document             | Key-value / wide-column | Wide-column            | KV in-memory           |
| ACID transaction   | Đầy đủ, multi-row     | Có (multi-doc, sau 4.0) | Giới hạn (per-item tốt nhất) | Nhẹ (LWT, đắt)    | Transaction đơn giản   |
| Ad-hoc query       | Rất mạnh (SQL, JOIN)  | Khá (aggregation)    | Yếu — phải biết key     | Yếu — theo partition key | Không                |
| Scale write        | Vertical + Citus      | Auto-sharding        | Gần như vô hạn (managed) | Tuyến tính theo node  | Cluster, in-memory     |
| Use case điển hình | Hệ thống nghiệp vụ, OLTP | Catalog, CMS, profile | Serverless, traffic lớn đột biến | Time-series, write cực lớn | Cache, session, leaderboard |

**Sai lầm phổ biến** (nói ra là điểm cộng lớn): chọn NoSQL vì "cần scale" khi data chỉ 10GB và vài trăm request/s — mức mà một instance Postgres xử lý nhẹ nhàng, đổi lại bạn mất JOIN, mất transaction, mất ad-hoc query. **Postgres làm được rất nhiều hơn người ta nghĩ**: cột **JSONB** (có index GIN) cho nhu cầu document, full-text search, pub/sub với LISTEN/NOTIFY, thậm chí queue đơn giản với `SKIP LOCKED`. Nguyên tắc thực dụng: **mặc định bắt đầu bằng Postgres**, chỉ rời đi khi có yêu cầu cụ thể mà nó không đáp ứng — và lúc đó thường là **polyglot persistence**: Postgres làm source of truth, Redis làm cache, Elasticsearch làm search.

**Insight phỏng vấn**: kết câu trả lời bằng một quyết định cụ thể ("với bài toán X em chọn Y vì Z") thuyết phục hơn nhiều so với liệt kê đặc tính hai phe.

### Thiết kế minh hoạ

```text
Cây quyết định rút gọn:

Cần multi-row ACID transaction (tiền, kho)? ──── Có ──► SQL (Postgres/MySQL)
        │ Không
        ▼
Query pattern chưa biết trước / cần ad-hoc?  ─── Có ──► SQL
        │ Không (access pattern cố định)
        ▼
Write > ~50–100K ops/s hoặc dataset nhiều TB? ── Có ──► Cassandra / DynamoDB
        │ Không
        ▼
Data thuần document, schema biến động mạnh?  ─── Có ──► MongoDB (hoặc Postgres JSONB!)
        │ Không
        ▼
              Mặc định: PostgreSQL
```

```sql
-- Postgres "làm NoSQL": JSONB + GIN index — đủ cho rất nhiều use case document
CREATE TABLE products (
  id    bigserial PRIMARY KEY,
  name  text NOT NULL,
  attrs jsonb NOT NULL DEFAULT '{}'   -- thuộc tính linh hoạt theo loại sản phẩm
);

CREATE INDEX idx_products_attrs ON products USING GIN (attrs);

-- Query theo field trong JSON, vẫn dùng index
SELECT * FROM products
WHERE attrs @> '{"brand": "Sony", "color": "black"}';

-- Vẫn JOIN được với bảng relational khác — thứ MongoDB không cho bạn
SELECT p.name, i.quantity
FROM products p JOIN inventory i ON i.product_id = p.id
WHERE p.attrs @> '{"brand": "Sony"}';
```

### Đáp án mẫu

> "Em quyết định dựa trên năm yếu tố: data model có quan hệ chặt không, có cần ACID transaction multi-row không, query pattern biết trước hay cần ad-hoc, scale write thực tế bao nhiêu, và schema biến động thế nào. Cần transaction mạnh và query linh hoạt — như hệ thống đơn hàng, thanh toán — em chọn SQL. Write cực lớn với access pattern cố định — như event logging, time-series — em chọn Cassandra hoặc DynamoDB. Sai lầm em thấy nhiều nhất là chọn NoSQL vì 'sợ không scale' khi data mới 10GB — mức đó Postgres chấp hết, mà đổi NoSQL là mất JOIN, mất transaction. Quan điểm của em: mặc định bắt đầu bằng Postgres — JSONB cân được cả nhu cầu document — chỉ rời đi khi có yêu cầu cụ thể nó không đáp ứng, và thường là thêm Redis cache, Elasticsearch search bên cạnh chứ không thay thế hoàn toàn."

---

## Câu 27: Database Indexing hoạt động như thế nào? Các loại index, khi nào dùng? `[Intermediate]`

### Câu hỏi

> Database index hoạt động như thế nào? Kể các loại index phổ biến, trade-off, và những trường hợp index không được sử dụng?

### Giải thích lý thuyết

Index là **cấu trúc dữ liệu phụ** giúp DB tìm row mà không phải quét toàn bảng (full table scan) — đổi từ O(n) sang O(log n). Mặc định trong Postgres/MySQL là **B-tree**: cây cân bằng, node lá chứa giá trị key đã **sắp xếp** kèm con trỏ tới row. Vì sorted nên B-tree phục vụ tốt cả equality (`=`), **range query** (`<`, `>`, `BETWEEN`), `ORDER BY`, và prefix match (`LIKE 'abc%'`).

Các loại index quan trọng:

| Loại                | Cấu trúc / cơ chế                       | Dùng khi                                                        |
| ------------------- | --------------------------------------- | --------------------------------------------------------------- |
| **B-tree** (mặc định) | Cây cân bằng, giá trị sorted           | Equality + range + ORDER BY — 95% trường hợp                    |
| **Hash**            | Hash table                              | Chỉ equality (`=`), nhanh hơn B-tree chút ít; không range được  |
| **GIN**             | Inverted index                          | Full-text search, **JSONB**, array — "giá trị chứa gì"          |
| **GiST**            | Cây tổng quát                           | Geo/spatial (PostGIS), range types, nearest-neighbor            |
| **Partial index**   | Chỉ index row thoả `WHERE`              | Query luôn lọc cùng điều kiện (vd: `status = 'active'`) — index nhỏ, nhanh |
| **Covering index**  | `INCLUDE` thêm cột vào index            | Query lấy đủ data từ index → **index-only scan**, khỏi đụng bảng |
| **Composite index** | Index nhiều cột `(a, b, c)`             | Query lọc theo nhiều cột — **thứ tự cột quyết định tất cả**     |

Với **composite index `(a, b)`**: dùng được cho query lọc `a` hoặc `a AND b`, nhưng **không** dùng được cho query chỉ lọc `b` (quy tắc leftmost prefix — giống danh bạ sắp theo Họ rồi Tên: tìm theo Tên không tra được). Nguyên tắc xếp cột: **equality trước, range sau**, cột selectivity cao lên trước.

**Trade-off**: index làm **đọc nhanh nhưng ghi chậm** — mỗi INSERT/UPDATE/DELETE phải cập nhật mọi index của bảng — và **tốn disk**. Bảng có 10 index thì mỗi write tốn ~10 lần công cập nhật. Vì vậy không "index mọi cột cho chắc"; thêm index dựa trên query thật, đo bằng **`EXPLAIN ANALYZE`** (xem plan có `Index Scan` hay `Seq Scan`, so cost và thời gian thực).

Các trường hợp **index có cũng như không** (pitfall kinh điển):

- **Function trên cột**: `WHERE LOWER(email) = '...'` không dùng index trên `email` — phải tạo **expression index** `ON LOWER(email)`.
- **Leading wildcard**: `LIKE '%gmail.com'` — B-tree sorted theo prefix, wildcard đầu là chịu (cần GIN + `pg_trgm`).
- **Low selectivity**: cột chỉ có 2–3 giá trị (`gender`, `is_deleted`) — lọc xong vẫn còn 50% bảng, planner chọn seq scan vì rẻ hơn.
- **Type mismatch / implicit cast**: so sánh cột `varchar` với số → cast khiến index bị bỏ qua.
- Index **bloat** / statistics cũ → planner quyết định sai, cần `ANALYZE`/`REINDEX`.

**Insight phỏng vấn**: kể được composite index + leftmost prefix và vài case "index bị bỏ qua" là tín hiệu bạn đã debug slow query thật, không chỉ học lý thuyết.

### Thiết kế minh hoạ

```sql
-- Bảng orders: 50 triệu rows
CREATE TABLE orders (
  id         bigserial PRIMARY KEY,
  user_id    bigint NOT NULL,
  status     text   NOT NULL,        -- 'pending' | 'paid' | 'cancelled'
  total      numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Composite index: equality (user_id) trước, range (created_at) sau
CREATE INDEX idx_orders_user_created ON orders (user_id, created_at);
-- ✓ dùng được: WHERE user_id = 42
-- ✓ dùng được: WHERE user_id = 42 AND created_at > '2026-01-01'
-- ✗ KHÔNG dùng: WHERE created_at > '2026-01-01'  (vi phạm leftmost prefix)

-- Partial index: chỉ index đơn đang chờ xử lý (1% bảng) → index siêu nhỏ
CREATE INDEX idx_orders_pending ON orders (created_at)
WHERE status = 'pending';

-- Covering index: query chỉ cần total → index-only scan, không đụng heap
CREATE INDEX idx_orders_user_cover ON orders (user_id) INCLUDE (total);

-- Expression index: cứu query dùng function trên cột
CREATE INDEX idx_users_email_lower ON users (LOWER(email));
-- giờ WHERE LOWER(email) = 'a@b.com' mới dùng được index

-- Luôn kiểm chứng bằng EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT total FROM orders
WHERE user_id = 42 AND created_at > now() - interval '30 days';
-- Mong đợi: Index Scan (hoặc Index Only Scan) using idx_orders_user_created
-- Thấy Seq Scan trên bảng lớn → xem lại điều kiện/index/statistics
```

### Đáp án mẫu

> "Index là cấu trúc phụ giúp DB tìm row trong O(log n) thay vì quét cả bảng. Mặc định là B-tree — vì giá trị sorted nên cân được cả equality, range và ORDER BY. Ngoài ra em dùng GIN cho full-text và JSONB, GiST cho geo, partial index khi query luôn lọc cùng điều kiện như `status = 'pending'`, và covering index với INCLUDE để được index-only scan. Với composite index, thứ tự cột quyết định: index `(user_id, created_at)` dùng được khi lọc user_id, nhưng lọc mỗi created_at thì không — leftmost prefix. Trade-off là đọc nhanh nhưng mỗi write phải cập nhật mọi index, cộng tốn disk, nên em chỉ thêm index theo query thật và kiểm chứng bằng EXPLAIN ANALYZE. Em cũng để ý các case index bị bỏ qua: function trên cột thì cần expression index, LIKE wildcard đầu, và cột low selectivity thì planner thà seq scan."

---

## Câu 28: Normalization và Denormalization là gì? Trade-off, khi nào dùng? `[Intermediate]`

### Câu hỏi

> Normalization và Denormalization là gì? Trade-off giữa hai hướng và khi nào nên dùng mỗi hướng?

### Giải thích lý thuyết

**Normalization** là quá trình tổ chức schema để **mỗi mẩu thông tin chỉ lưu một nơi**, loại bỏ duplicate và tránh anomaly. Các mức phổ biến (nói ngắn gọn là đủ trong phỏng vấn):

- **1NF**: mỗi cột là giá trị nguyên tử — không lưu list trong một cột (`tags = "a,b,c"`).
- **2NF**: thuộc tính non-key phụ thuộc **toàn bộ** khoá chính — không phụ thuộc một phần composite key.
- **3NF**: không có phụ thuộc bắc cầu — thuộc tính non-key không phụ thuộc thuộc tính non-key khác (vd: lưu `city` và `city_population` cùng bảng user là vi phạm).

Normalization chống ba loại **anomaly**: update anomaly (sửa tên khách phải sửa N dòng order → sót là inconsistent), insert anomaly (không thêm được product khi chưa có order), delete anomaly (xoá order cuối làm mất luôn thông tin khách).

**Denormalization** là **chủ động nhân bản data** để đọc nhanh — tránh JOIN nhiều bảng trong hot path. Ví dụ: lưu sẵn `product_name` vào bảng `order_items` (vừa nhanh, vừa đúng nghiệp vụ — tên tại thời điểm mua), hay cột counter `comments_count` thay vì `COUNT(*)` mỗi lần render.

| Tiêu chí          | Normalized                              | Denormalized                              |
| ----------------- | --------------------------------------- | ----------------------------------------- |
| Read              | Chậm hơn (nhiều JOIN)                   | Nhanh (đọc 1 chỗ, không JOIN)             |
| Write             | Đơn giản, ghi 1 nơi                     | Phức tạp — phải cập nhật N bản sao        |
| Consistency       | Tự đảm bảo (single source of truth)     | **Risk inconsistency** nếu sync lỗi        |
| Storage           | Tiết kiệm                               | Tốn hơn (duplicate)                       |
| Phù hợp           | **OLTP**, write-heavy, nghiệp vụ        | **OLAP**, read-heavy, feed/dashboard      |

Nguyên tắc thực dụng:

- **OLTP normalize trước** (3NF), denormalize **có chọn lọc** khi profiling chỉ ra JOIN cụ thể là bottleneck — denormalization là **optimization có chủ đích**, không phải thiết kế mặc định.
- Mỗi chỗ denormalize phải có **cơ chế sync**: trigger, transaction ghi kèm, event/CDC — và chấp nhận eventual consistency ở mức nào.
- **NoSQL design về bản chất là denormalization theo access pattern**: DynamoDB/Cassandra không có JOIN nên bạn thiết kế bảng theo từng query — "một bảng cho một câu hỏi", nhúng sẵn data cần đọc cùng nhau. Single-table design của DynamoDB là đỉnh điểm của tư duy này.
- Một số case có giải pháp đứng giữa: **materialized view** (Postgres) — denormalize do DB quản lý, refresh định kỳ.

**Insight phỏng vấn**: đáp án yếu là đọc thuộc 1NF/2NF/3NF. Đáp án mạnh là nói trade-off bằng ngôn ngữ hệ thống — "denormalize là đổi write complexity + consistency risk lấy read speed" — kèm một ví dụ thật (counter, snapshot tên sản phẩm trong order).

### Thiết kế minh hoạ

```sql
-- NORMALIZED (3NF) — chuẩn cho OLTP
CREATE TABLE users    (id bigserial PRIMARY KEY, name text NOT NULL);
CREATE TABLE products (id bigserial PRIMARY KEY, name text NOT NULL, price numeric);
CREATE TABLE orders   (id bigserial PRIMARY KEY,
                       user_id bigint REFERENCES users(id),
                       created_at timestamptz DEFAULT now());
CREATE TABLE order_items (
  order_id   bigint REFERENCES orders(id),
  product_id bigint REFERENCES products(id),
  quantity   int NOT NULL
);
-- Đọc lịch sử đơn: JOIN 4 bảng — đúng đắn nhưng chậm khi scale

-- DENORMALIZED có chọn lọc — tối ưu hot path
ALTER TABLE order_items
  ADD COLUMN product_name  text,     -- snapshot tên lúc mua (đúng cả nghiệp vụ!)
  ADD COLUMN product_price numeric;  -- giá lúc mua, không đổi theo bảng products

ALTER TABLE users ADD COLUMN orders_count int NOT NULL DEFAULT 0;

-- Cơ chế sync: cập nhật counter trong CÙNG transaction với insert order
BEGIN;
  INSERT INTO orders (user_id) VALUES (42);
  UPDATE users SET orders_count = orders_count + 1 WHERE id = 42;
COMMIT;
```

```text
Tư duy NoSQL (DynamoDB) = denormalize theo access pattern:

Query cần trả lời: "lấy 10 order gần nhất của user kèm tên sản phẩm"
→ Thiết kế item nhúng sẵn mọi thứ, KHÔNG join:

{ PK: "USER#42", SK: "ORDER#2026-06-01#9001",
  total: 59.9,
  items: [ {name: "Tai nghe Sony", price: 49.9, qty: 1},   -- nhúng luôn
           {name: "Cáp USB-C",     price: 10.0, qty: 1} ] }
```

### Đáp án mẫu

> "Normalization là tổ chức schema để mỗi thông tin chỉ lưu một nơi — 1NF giá trị nguyên tử, 2NF phụ thuộc toàn bộ khoá, 3NF không phụ thuộc bắc cầu — mục đích là chống duplicate và các anomaly khi update, insert, delete. Denormalization là chiều ngược lại: chủ động nhân bản data để đọc nhanh, tránh JOIN trong hot path — như lưu snapshot tên sản phẩm vào order_items hay counter comments_count. Trade-off em tóm gọn: denormalize là đổi write phức tạp cộng risk inconsistency lấy read speed, nên mỗi chỗ denormalize phải có cơ chế sync rõ ràng — cùng transaction, trigger, hoặc event. Nguyên tắc của em: OLTP normalize trước theo 3NF, chỉ denormalize có chọn lọc khi profiling chỉ ra JOIN là bottleneck. Còn với NoSQL thì denormalization là mặc định — DynamoDB không có JOIN nên phải thiết kế bảng theo từng access pattern, nhúng sẵn data đọc cùng nhau."

---

## Câu 53: Expand-and-contract pattern để migrate schema không downtime? Các bước khi đổi tên cột? `[Advanced]`

### Câu hỏi

> Expand-and-contract pattern là gì và tại sao cần nó để migrate schema không downtime? Trình bày các bước cụ thể khi đổi tên một cột đang được production sử dụng.

### Giải thích lý thuyết

Vấn đề gốc: trong hệ thống đang chạy, **code và schema không thể đổi cùng một khoảnh khắc**. Deploy là rolling — luôn có thời điểm code cũ và code mới chạy song song trên cùng một DB. Nếu chạy thẳng `ALTER TABLE users RENAME COLUMN fullname TO display_name`, ngay lập tức **mọi instance đang chạy code cũ query `fullname` sẽ chết** — downtime tức thì, và rollback code cũng không cứu được vì cột đã đổi tên.

**Expand-and-contract** (còn gọi parallel change) giải bằng nguyên tắc: **mỗi bước thay đổi phải tương thích với cả phiên bản code trước và sau nó**. Schema chỉ được "mở rộng" (thêm) trước, và chỉ "thu hẹp" (xoá) sau khi chắc chắn không còn ai dùng phần cũ.

Các bước đổi tên cột `fullname` → `display_name` (mỗi bước là **một deploy riêng**, chạy ổn rồi mới sang bước sau):

| Bước | Hành động                                                       | Rollback nếu lỗi                       |
| ---- | ---------------------------------------------------------------- | --------------------------------------- |
| 1. **Expand**     | `ADD COLUMN display_name` (nullable, chưa ai dùng)  | Drop cột mới — vô hại                   |
| 2. **Dual-write** | Deploy code ghi **cả 2 cột**, vẫn đọc cột cũ        | Revert code — cột cũ vẫn đầy đủ data    |
| 3. **Backfill**   | Copy data cũ sang cột mới, **theo batch nhỏ**       | Chạy lại được (idempotent)              |
| 4. **Switch read**| Deploy code **đọc cột mới** (vẫn dual-write)        | Revert về đọc cột cũ — cũng full data   |
| 5. **Stop write cũ** | Deploy code chỉ ghi cột mới                      | Revert + backfill bù phần thiếu          |
| 6. **Contract**   | `DROP COLUMN fullname` (sau thời gian quan sát)     | Điểm không quay lại — làm cuối cùng     |

Các chi tiết thể hiện kinh nghiệm thật:

- **Backfill phải chạy theo batch** (vd 10K rows/lần, có sleep) — `UPDATE` cả bảng 100M rows một phát sẽ lock lâu, đẩy WAL/replication lag tăng vọt.
- Thêm `NOT NULL`/constraint trên cột mới chỉ làm **sau** backfill xong; Postgres nên dùng `ADD CONSTRAINT ... NOT VALID` rồi `VALIDATE CONSTRAINT` để không lock dài.
- Giữa bước 5 và 6 nên có **thời gian quan sát** (vài ngày đến vài tuần) + kiểm tra log/metrics xem còn query nào đụng cột cũ không.
- Pattern này **tổng quát hoá** cho các migration lớn hơn: **đổi DB engine** (dual-write sang DB mới + backfill + so sánh dữ liệu + switch read + tắt DB cũ — cách Stripe, GitHub vẫn làm), **tách microservice** khỏi monolith (service mới chạy song song, dual-write/CDC, chuyển dần traffic), đổi format data, tách bảng.

**Insight phỏng vấn**: từ khoá ăn điểm là "**mỗi bước đều deploy riêng và rollback được**" và "**không bao giờ có thời điểm nào code đang chạy không tương thích với schema**". Nhắc thêm backfill theo batch là tín hiệu đã làm migration trên bảng lớn thật.

### Thiết kế minh hoạ

```text
Timeline (mỗi bước = 1 deploy, xác nhận ổn mới đi tiếp):

  Bước 1        Bước 2          Bước 3        Bước 4        Bước 5       Bước 6
  EXPAND        DUAL-WRITE      BACKFILL      SWITCH READ   STOP OLD     CONTRACT
  ┌────────┐    ┌──────────┐    ┌─────────┐   ┌─────────┐   ┌────────┐   ┌────────┐
  │ +cột   │ →  │ ghi cả 2 │ →  │ copy    │ → │ đọc cột │ → │ chỉ ghi│ → │ drop   │
  │ mới    │    │ đọc cũ   │    │ data cũ │   │ MỚI     │   │ cột mới│   │ cột cũ │
  └────────┘    └──────────┘    └─────────┘   └─────────┘   └────────┘   └────────┘
   rollback:     rollback:       chạy lại      rollback:     rollback:    KHÔNG quay
   drop cột      revert code     (idempotent)  revert code   revert+bù    lại được
```

```sql
-- Bước 1: EXPAND — thêm cột mới, nullable, không ảnh hưởng code cũ
ALTER TABLE users ADD COLUMN display_name text;

-- Bước 2: DUAL-WRITE (ở application code, deploy riêng)
-- UPDATE users SET fullname = $1, display_name = $1 WHERE id = $2;

-- Bước 3: BACKFILL theo batch nhỏ — tránh lock dài và replication lag
UPDATE users
SET    display_name = fullname
WHERE  id IN (
  SELECT id FROM users
  WHERE  display_name IS NULL AND fullname IS NOT NULL
  LIMIT  10000                      -- lặp tới khi hết, có sleep giữa các batch
);

-- Sau backfill: thêm constraint mà không lock dài (Postgres)
ALTER TABLE users ADD CONSTRAINT users_display_name_nn
  CHECK (display_name IS NOT NULL) NOT VALID;
ALTER TABLE users VALIDATE CONSTRAINT users_display_name_nn;

-- Bước 4 + 5: chuyển read sang display_name, rồi ngừng ghi fullname (code deploys)

-- Bước 6: CONTRACT — sau thời gian quan sát, không còn query nào đụng cột cũ
ALTER TABLE users DROP COLUMN fullname;
```

### Đáp án mẫu

> "Vấn đề là code và schema không thể đổi cùng lúc — deploy rolling luôn có lúc code cũ và mới chạy song song, nên RENAME cột trực tiếp sẽ làm code cũ chết ngay và không rollback được. Expand-and-contract giải bằng nguyên tắc: mỗi bước phải tương thích với cả code trước và sau nó. Với đổi tên cột, em làm sáu bước, mỗi bước một deploy riêng: một, expand — thêm cột mới nullable; hai, dual-write — code ghi cả hai cột nhưng vẫn đọc cột cũ; ba, backfill data cũ theo batch nhỏ để không lock và không đẩy replication lag; bốn, chuyển read sang cột mới; năm, ngừng ghi cột cũ; sáu, contract — drop cột cũ sau thời gian quan sát. Điểm mấu chốt là mọi bước trước bước cuối đều rollback được. Pattern này em áp dụng tương tự khi đổi DB engine hay tách microservice — dual-write, backfill, switch read, rồi mới tắt hệ cũ."

---

## Bẫy thường gặp khi trả lời

| Bẫy                                                                 | Cách tránh                                                                                       |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Nhảy thẳng vào sharding khi được hỏi "DB chậm thì làm gì"            | Leo thang đúng thứ tự: EXPLAIN + index → cache → read replica → vertical scale → cuối cùng mới shard |
| Nói "replica giúp scale database" chung chung                        | Nói rõ: replica chỉ scale **read**, write vẫn dồn về một primary — write bottleneck cần sharding   |
| Quên replication lag khi vẽ kiến trúc có replica                     | Chủ động nhắc read-your-writes và cách xử lý (đọc primary sau write / sticky routing / track LSN) |
| Chọn NoSQL vì "scale tốt hơn" mà không hỏi quy mô data thật           | Nêu con số: vài trăm GB và vài nghìn write/s thì Postgres tuned tốt vẫn dư sức                    |
| Khẳng định "cứ thêm index là nhanh"                                  | Nhắc trade-off write chậm + disk, leftmost prefix của composite index, và kiểm chứng bằng EXPLAIN ANALYZE |
| Đọc thuộc lòng 1NF/2NF/3NF mà không nói trade-off                    | Diễn đạt bằng ngôn ngữ hệ thống: denormalize = đổi write complexity + consistency risk lấy read speed |
| Trả lời migrate schema bằng "chạy ALTER lúc nửa đêm"                 | Trình bày expand-and-contract: mỗi bước deploy riêng, rollback được, không có khoảnh khắc code–schema lệch nhau |
| Backfill bằng một câu UPDATE cả bảng                                 | Luôn nói "backfill theo batch nhỏ, idempotent, theo dõi lock và replication lag"                  |
