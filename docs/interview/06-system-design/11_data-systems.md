---
sidebar_position: 11
title: "11. Data Systems & Storage"
---

# Data Systems & Storage

> *Hệ thống lớn không chỉ có một database. File ảnh nằm ở đâu? Metrics ghi vào đâu? Data cho analyst lấy từ đâu? Làm sao đồng bộ search index khi DB thay đổi? Interviewer hỏi nhóm câu này để xem bạn có biết chọn đúng loại storage cho đúng loại data — thay vì nhét tất cả vào Postgres.*

:::note[Ghi nhớ nhanh]

- ⭐ **Blob/object storage (S3)** — lưu file bất biến với durability cực cao; **DB chỉ giữ metadata**, KHÔNG nhét file vào BLOB column.
- ⭐ **Presigned URL** — server chỉ ký URL có thời hạn, client upload/download **trực tiếp với S3**, không đi qua backend.
- **CDN + lifecycle policy** — cache file ở edge giảm latency/egress; tự tiering hot → cold (Standard → IA → Glacier).
- **Chọn đúng storage cho đúng data** — file → blob, metrics → time-series, search → index đồng bộ qua event; không dồn tất cả vào Postgres.

:::

---

## Câu 29: Blob Storage là gì, khi nào dùng thay vì database? Thiết kế hệ thống lưu trữ file? `[Intermediate]`

### Câu hỏi

> Blob Storage là gì và khi nào nên dùng thay vì database? Hãy thiết kế một hệ thống lưu trữ file (ảnh, video, document) cho ứng dụng web ở quy mô lớn.

### Giải thích lý thuyết

**Blob Storage (object storage)** — như AWS S3, Google Cloud Storage, Azure Blob — là dịch vụ lưu trữ **object bất biến** (file + metadata) định danh bằng key, truy cập qua HTTP API. Nó **không phải filesystem**: không có thư mục thật (prefix chỉ là convention), không sửa một phần file (ghi đè cả object), đổi lại được **durability cực cao** (S3 quảng cáo 11 số 9), scale gần như vô hạn và giá rẻ hơn disk gắn DB nhiều lần.

**Tại sao file KHÔNG nên lưu trong database** (dưới dạng BLOB column):

| Vấn đề | Giải thích |
| --- | --- |
| DB bloat | File vài MB làm bảng phình to, vacuum/index chậm, cache RAM của DB bị chiếm bởi binary vô ích |
| Backup/restore chậm | Dump 500GB ảnh cùng 5GB data quan hệ — restore mất hàng giờ |
| Băng thông | Mỗi lần serve file, traffic đi qua connection pool của DB — tài nguyên đắt nhất hệ thống |
| Scale sai chiều | DB scale theo IOPS/CPU đắt đỏ; file chỉ cần throughput rẻ |

**Pattern chuẩn**: file vào blob storage, **DB chỉ lưu metadata** (owner, tên, size, content-type, key/URL). Hai kỹ thuật quan trọng interviewer muốn nghe:

1. **Presigned URL**: server ký một URL có thời hạn, client **upload/download trực tiếp với S3** — file không đi qua application server, giải phóng băng thông và CPU của backend.
2. **CDN trước blob storage**: CloudFront/Cloudflare cache file ở edge, giảm latency và giảm chi phí egress từ S3.

Thêm điểm cộng:
- **Multipart upload** cho file lớn (>100MB): chia chunk, upload song song, retry từng chunk khi lỗi.
- **Lifecycle policy**: tự chuyển object cũ sang storage class rẻ (S3 Standard → Infrequent Access → Glacier) — hot/cold tiering tự động.

**Insight phỏng vấn**: điểm mấu chốt là flow presigned URL — nói được "client upload thẳng lên S3, server chỉ ký URL và lưu metadata" chứng tỏ bạn từng build thật. Nhiều ứng viên vẽ flow file đi qua backend — sai ngay ở quy mô lớn.

### Thiết kế minh hoạ

```text
UPLOAD (presigned URL — file KHÔNG đi qua app server):

  Client          App Server              S3                Postgres
    │  1. POST /files  │                   │                    │
    │  (tên, type, size)│                   │                    │
    │─────────────────>│ 2. validate +     │                    │
    │                  │    ký presigned URL│                    │
    │                  │ 3. INSERT metadata (status=PENDING) ───>│
    │<─────────────────│  trả presigned URL │                    │
    │  4. PUT file ────────────────────────>│  (upload trực tiếp)│
    │  5. POST /files/{id}/complete ──>│                         │
    │                  │ 6. UPDATE status=READY ────────────────>│

DOWNLOAD (CDN trước blob):

  Client ──> CDN (cache hit? trả ngay) ──miss──> S3
                                                  │
         file lớn: multipart upload               ▼
         [chunk1][chunk2][chunk3] → song song   Lifecycle:
                                                Standard (30d)
                                                → IA (90d)
                                                → Glacier
```

```sql
-- DB chỉ lưu metadata, KHÔNG lưu binary
CREATE TABLE files (
  id          UUID PRIMARY KEY,
  owner_id    UUID NOT NULL REFERENCES users(id),
  s3_key      TEXT NOT NULL,        -- vd: uploads/2026/06/uuid.jpg
  filename    TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes  BIGINT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'PENDING', -- PENDING | READY
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

### Đáp án mẫu

> "Blob storage như S3 là object storage — lưu file bất biến theo key, durability rất cao và rẻ hơn disk của database nhiều. Em không bao giờ lưu file trong DB vì nó làm bảng phình to, backup chậm và chiếm băng thông của connection pool — tài nguyên đắt nhất hệ thống. Pattern chuẩn của em: file vào S3, DB chỉ lưu metadata gồm owner, key, content-type, status. Khi upload, server validate rồi ký presigned URL để client upload trực tiếp lên S3, không đi qua app server; upload xong client gọi confirm để đổi status sang READY. Khi serve, em đặt CDN trước S3 để cache ở edge và giảm chi phí egress. File lớn thì dùng multipart upload để chia chunk song song, và em cấu hình lifecycle policy chuyển file cũ sang Glacier cho rẻ."

---

## Câu 39: Data Partitioning là gì? Horizontal vs Vertical Partitioning và các chiến lược? `[Intermediate]`

### Câu hỏi

> Data Partitioning là gì? Phân biệt horizontal và vertical partitioning. Partitioning trong một database (ví dụ Postgres) khác gì với sharding?

### Giải thích lý thuyết

**Partitioning** là chia một tập data lớn thành nhiều phần nhỏ hơn để quản lý và query hiệu quả hơn. Có hai chiều chia:

| | Horizontal Partitioning | Vertical Partitioning |
| --- | --- | --- |
| Chia theo | **Row** — mỗi partition chứa một tập row | **Cột/bảng** — tách cột theo chức năng |
| Ví dụ | Orders 2024 vs orders 2025 | Tách `users` thành `users` (login info) + `user_profiles` (bio, avatar) |
| Mục đích | Bảng quá nhiều row | Bảng quá nhiều cột, hot/cold column khác nhau |
| Quan hệ với sharding | **Sharding = horizontal partitioning trải trên nhiều máy** | Tương ứng tách theo service trong microservices |

**Partitioning trong một DB vs Sharding** — câu phân biệt interviewer rất hay hỏi:
- **Partitioning (Postgres declarative partitioning)**: các partition vẫn nằm **trên cùng một máy**, cùng instance. DB tự route query. Không giải quyết giới hạn CPU/RAM/disk của một máy — chỉ tối ưu query và vận hành.
- **Sharding**: data trải trên **nhiều máy** — scale được write throughput và dung lượng, nhưng đánh đổi: mất JOIN cross-shard, mất transaction toàn cục, cần routing layer.

**Ba chiến lược partition của Postgres**:
- **Range**: theo khoảng giá trị (thường là thời gian) — `orders_2026_06`, `orders_2026_07`. Phù hợp time-series, log.
- **List**: theo danh sách giá trị rời rạc — `region IN ('VN')`, `region IN ('US')`.
- **Hash**: hash key chia đều — khi không có tiêu chí tự nhiên, chỉ cần phân tán đều.

Hai lợi ích vận hành lớn:
1. **Partition pruning**: planner chỉ scan partition khớp điều kiện WHERE — query "đơn tháng này" không đụng vào 5 năm data cũ.
2. **Drop data cũ rẻ**: `DROP TABLE orders_2020` là thao tác metadata tức thì, thay vì `DELETE` hàng trăm triệu row gây bloat và WAL khổng lồ — đây là lý do số một người ta partition bảng log/event.

**Insight phỏng vấn**: ứng viên yếu chỉ nói "partitioning để chia nhỏ data". Ứng viên tốt phân biệt rõ partitioning (1 máy, tối ưu query + vận hành) vs sharding (nhiều máy, scale capacity), và nêu được use case drop partition thay vì DELETE.

### Thiết kế minh hoạ

```text
VERTICAL                          HORIZONTAL (range theo thời gian)
users (1 bảng to)                 orders (bảng cha logic)
┌──────────────────────┐          ┌─────────────────────────────┐
│ id │ email │ pass │  │          │   orders_2026_05  (partition)│
│ bio │ avatar │ prefs│  │  ──>    │   orders_2026_06  (partition)│
└──────────────────────┘          │   orders_2026_07  (partition)│
        │ tách cột                 └─────────────────────────────┘
        ▼                          WHERE created_at >= '2026-06-01'
users (hot)    user_profiles(cold) → planner CHỈ scan orders_2026_06
id,email,pass  user_id,bio,avatar    (partition pruning)
```

```sql
-- Postgres declarative partitioning theo range
CREATE TABLE orders (
  id         BIGINT GENERATED ALWAYS AS IDENTITY,
  user_id    BIGINT NOT NULL,
  amount     NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (id, created_at)  -- partition key PHẢI nằm trong PK
) PARTITION BY RANGE (created_at);

CREATE TABLE orders_2026_06 PARTITION OF orders
  FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE orders_2026_07 PARTITION OF orders
  FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

-- Retention: xoá 1 tháng data cũ = thao tác metadata, tức thì
DROP TABLE orders_2025_06;  -- thay vì DELETE hàng trăm triệu row
```

### Đáp án mẫu

> "Partitioning là chia data lớn thành phần nhỏ hơn. Horizontal là chia theo row — sharding chính là horizontal partitioning trải trên nhiều máy. Vertical là chia theo cột hoặc theo chức năng, ví dụ tách bảng users thành phần hot cho login và phần cold cho profile. Em phân biệt rõ partitioning trong một DB với sharding: Postgres declarative partitioning vẫn nằm trên một máy, mục đích là tối ưu query và vận hành chứ không tăng capacity; sharding mới là nhiều máy nhưng đánh đổi JOIN và transaction. Postgres có ba chiến lược range, list, hash — em hay dùng range theo thời gian cho bảng orders, events. Lợi ích lớn nhất là partition pruning — query theo tháng chỉ scan đúng partition đó — và drop data cũ bằng DROP TABLE tức thì thay vì DELETE hàng trăm triệu row gây bloat."

---

## Câu 40: Time-Series Database là gì? Khi nào cần và các giải pháp phổ biến? `[Intermediate]`

### Câu hỏi

> Time-Series Database là gì? Đặc điểm workload nào khiến ta cần TSDB thay vì database thông thường? Kể các giải pháp phổ biến và use case.

### Giải thích lý thuyết

**Time-series data** là data luôn gắn với **timestamp**: metrics hệ thống (CPU, latency), dữ liệu IoT sensor, giá cổ phiếu, event tracking. Workload của nó rất đặc thù:

- **Write-heavy, append-only**: hàng trăm nghìn điểm/giây, gần như không bao giờ UPDATE/DELETE từng row.
- **Query theo time range + aggregate**: "avg CPU theo phút trong 24h qua", hiếm khi lookup một row đơn lẻ.
- **Data cũ giảm giá trị**: chỉ cần giữ chi tiết gần đây, data cũ chỉ cần bản tóm tắt.

**TSDB tối ưu cho đúng workload này**:

| Kỹ thuật | Tác dụng |
| --- | --- |
| Compression theo cột + delta encoding | Timestamp tăng đều, giá trị thay đổi ít → nén 90%+ (delta-of-delta, Gorilla encoding) |
| Downsampling | Tự động tổng hợp data cũ: raw 10s → avg theo 5 phút sau 30 ngày |
| Retention policy tự động | Tự xoá/chuyển data hết hạn theo chunk, không cần DELETE |
| Chunk theo thời gian | Index nhỏ, luôn nóng trong RAM vì chỉ ghi vào chunk mới nhất |

**Tại sao Postgres thường không đủ**: với insert rate cao, **B-tree index bị bloat** — mỗi insert phải cập nhật index, index ngày càng to vượt RAM, write amplification tăng, vacuum không theo kịp. Query aggregate trên hàng tỷ row theo row-store cũng chậm hơn column-store nhiều lần.

**Các giải pháp phổ biến**:
- **Prometheus**: chuẩn de-facto cho metrics hạ tầng, pull-based, đi kèm PromQL + alerting. Không phải general-purpose storage.
- **InfluxDB**: TSDB chuyên dụng, push-based, phù hợp IoT/sensor.
- **TimescaleDB**: **extension của Postgres** — giữ nguyên SQL, JOIN với bảng quan hệ, hypertable tự chia chunk theo thời gian. Lựa chọn an toàn khi team đã dùng Postgres.
- **ClickHouse**: column-store OLAP, nuốt hàng triệu insert/giây, aggregate cực nhanh — phù hợp analytics/event tracking quy mô lớn.

**Insight phỏng vấn**: điểm ăn tiền là giải thích được *tại sao* Postgres thuần đuối — "index bloat với insert rate cao + aggregate trên row-store chậm" — chứ không chỉ liệt kê tên sản phẩm. Và biết TimescaleDB là middle-ground giữ được SQL.

### Thiết kế minh hoạ

```text
Pipeline metrics điển hình:

 Sensors/Agents ──push/pull──> TSDB ──query──> Grafana dashboard
 (10k điểm/giây)                │                + Alerting
                                ▼
        Chunk theo thời gian (TimescaleDB hypertable):
        ┌────────────┬────────────┬────────────┐
        │ chunk 06-09│ chunk 06-10│ chunk 06-11 │◄── chỉ ghi vào đây
        │ (đã nén)   │ (đã nén)   │ (hot, RAM)  │    index nhỏ, luôn nóng
        └────────────┴────────────┴────────────┘
              │
              ▼ retention + downsampling
        raw 10s  → giữ 7 ngày
        avg 5min → giữ 90 ngày      (continuous aggregate)
        avg 1h   → giữ 2 năm
```

```sql
-- TimescaleDB: vẫn là Postgres + SQL
CREATE TABLE metrics (
  time   TIMESTAMPTZ NOT NULL,
  device TEXT NOT NULL,
  cpu    DOUBLE PRECISION
);
SELECT create_hypertable('metrics', 'time');  -- tự chia chunk theo thời gian

-- Nén chunk cũ hơn 7 ngày (column compression, tiết kiệm ~90%)
ALTER TABLE metrics SET (timescaledb.compress);
SELECT add_compression_policy('metrics', INTERVAL '7 days');

-- Retention: tự drop chunk quá 90 ngày
SELECT add_retention_policy('metrics', INTERVAL '90 days');

-- Query điển hình: aggregate theo time bucket
SELECT time_bucket('5 minutes', time) AS bucket, device, avg(cpu)
FROM metrics
WHERE time > now() - INTERVAL '24 hours'
GROUP BY bucket, device;
```

### Đáp án mẫu

> "Time-series data là data gắn timestamp như metrics, IoT, giá cổ phiếu — workload đặc thù là write-heavy append-only với insert rate rất cao, và query thì luôn theo time range kèm aggregate. TSDB tối ưu cho đúng pattern đó: nén theo cột với delta encoding tiết kiệm trên 90%, chia chunk theo thời gian nên index luôn nhỏ và nóng, có downsampling và retention policy tự động — data cũ tự tổng hợp rồi xoá theo chunk. Postgres thuần thường đuối vì B-tree index bloat với insert rate cao và aggregate trên row-store chậm. Về giải pháp, em dùng Prometheus cho metrics hạ tầng, InfluxDB cho IoT, ClickHouse khi cần analytics quy mô lớn. Nếu team đã chạy Postgres thì em chọn TimescaleDB — nó là extension nên vẫn giữ SQL và JOIN được với data quan hệ."

---

## Câu 41: Data Lake và Data Warehouse khác nhau như thế nào? `[Intermediate]`

### Câu hỏi

> Data Lake và Data Warehouse khác nhau như thế nào? ETL vs ELT là gì, và lakehouse ra đời để giải quyết vấn đề gì?

### Giải thích lý thuyết

Cả hai đều là nơi tập trung data cho analytics, nhưng triết lý ngược nhau:

| | Data Warehouse | Data Lake |
| --- | --- | --- |
| Schema | **Schema-on-write** — define schema trước, data phải clean mới vào được | **Schema-on-read** — đổ raw data vào trước, áp schema lúc query |
| Data | Đã clean, structured | Mọi format: JSON, CSV, Parquet, ảnh, log |
| Query | SQL, tối ưu cho BI | Spark, Athena/Trino, ML pipeline |
| Chi phí | Đắt (compute + storage gắn nhau, hoặc tính theo query) | Rẻ — chỉ là file trên S3 |
| Sản phẩm | Snowflake, BigQuery, Redshift | S3/GCS + Parquet + Spark/Athena |
| Người dùng chính | Data analyst, BI dashboard | Data scientist, ML engineer |

- **Warehouse**: nguồn sự thật cho báo cáo. Vì schema-on-write nên data nhất quán, query nhanh — nhưng cứng nhắc: muốn thêm nguồn data mới phải thiết kế schema và pipeline trước.
- **Lake**: đổ tất cả raw data vào S3 với chi phí gần như không đáng kể, "để dành" cho nhu cầu tương lai (train ML, backfill). Rủi ro: không có governance thì thành **data swamp** — data rác không ai hiểu.

**ETL vs ELT**: ETL (Extract → Transform → Load) transform trước khi nạp vào warehouse — kiểu truyền thống. ELT (Extract → Load → Transform) đổ raw vào trước rồi transform bằng chính compute của warehouse/lake (dbt là công cụ tiêu biểu) — xu hướng hiện đại vì storage rẻ và compute warehouse đã đủ mạnh.

**Lakehouse** — Delta Lake, Apache Iceberg, Hudi — thêm **table format** lên file Parquet trong lake: ACID transaction, schema evolution, time travel. Mục tiêu: một bản data trên S3 phục vụ cả BI (như warehouse) lẫn ML (như lake), khỏi duy trì hai hệ thống và hai pipeline copy data.

**Insight phỏng vấn**: cặp keyword quyết định là **schema-on-write vs schema-on-read** — nói được nó là gốc của mọi khác biệt còn lại (chi phí, độ linh hoạt, người dùng) là đủ điểm. Nhắc lakehouse + Iceberg thể hiện bạn cập nhật xu hướng data platform hiện tại.

### Thiết kế minh hoạ

```text
Kiến trúc data platform điển hình:

 Nguồn data            ELT pipeline              Tiêu thụ
 ┌──────────┐
 │ App DB   │──CDC──┐
 │ Events   │──────┐│   ┌──────────────────────┐
 │ 3rd-party│─────┐││   │ DATA LAKE (S3)       │   Data scientist
 └──────────┘     ▼▼▼   │ raw/   → Parquet     │◄── Spark, ML training
                Extract │ (schema-on-read, rẻ)  │
                + Load  └──────────┬───────────┘
                                   │ Transform (dbt/Spark)
                                   ▼
                        ┌──────────────────────┐
                        │ WAREHOUSE (BigQuery/  │   Data analyst
                        │ Snowflake)            │◄── SQL, BI dashboard
                        │ schema-on-write, clean│    (Looker, Metabase)
                        └──────────────────────┘

 LAKEHOUSE = gộp 2 tầng: S3 + Iceberg/Delta (ACID, schema evolution)
             → BI và ML query CÙNG một bản data
```

```sql
-- ELT với dbt: transform NGAY TRONG warehouse bằng SQL
-- models/marts/daily_revenue.sql
SELECT
  DATE(order_created_at)        AS ngay,
  SUM(amount)                   AS doanh_thu,
  COUNT(DISTINCT user_id)       AS so_khach
FROM {{ ref('stg_orders') }}    -- raw data đã load sẵn vào warehouse
WHERE status = 'completed'
GROUP BY 1;
```

### Đáp án mẫu

> "Khác biệt gốc là schema-on-write với schema-on-read. Warehouse như Snowflake, BigQuery bắt define schema trước, data phải clean mới vào — nên query SQL nhanh, nhất quán, phục vụ analyst làm BI dashboard. Lake thì ngược lại: đổ raw data mọi format lên S3 dưới dạng Parquet với chi phí rất rẻ, áp schema lúc đọc bằng Spark hay Athena — phục vụ data scientist train ML. Đi kèm là chuyển dịch từ ETL sang ELT: thay vì transform trước khi load, giờ đổ raw vào rồi transform bằng dbt ngay trong warehouse vì storage rẻ. Vấn đề là duy trì cả hai hệ thống tốn kém và data bị copy hai nơi, nên lakehouse ra đời — Delta Lake, Iceberg thêm ACID transaction và schema evolution lên file trong lake, để một bản data trên S3 phục vụ được cả BI lẫn ML."

---

## Câu 42: Change Data Capture (CDC) là gì? Cách hoạt động và use cases? `[Advanced]`

### Câu hỏi

> Change Data Capture (CDC) là gì? So sánh các cách triển khai, mô tả flow với Debezium, và các use case cùng thách thức thực tế.

### Giải thích lý thuyết

**CDC** là kỹ thuật **bắt mọi thay đổi (insert/update/delete) trong database** và phát chúng thành stream event để các hệ thống khác đồng bộ theo — thay cho cách cũ là batch query "SELECT * WHERE updated_at > X" mỗi đêm.

**Ba cách triển khai**:

| Cách | Cơ chế | Ưu | Nhược |
| --- | --- | --- | --- |
| **Log-based** (Debezium) | Đọc transaction log của DB (Postgres **WAL** qua logical replication, MySQL **binlog**) | **Ít xâm lấn nhất** — không thêm tải lên query path, bắt được mọi thay đổi kể cả DELETE, đúng thứ tự commit | Cần quyền replication, phụ thuộc format log từng DB |
| Trigger-based | Trigger ghi thay đổi vào bảng audit | Dễ làm, DB nào cũng có | Tăng latency mỗi write, trigger là code ẩn khó maintain |
| Polling | Query định kỳ theo `updated_at` | Đơn giản nhất | Không bắt được DELETE, miss thay đổi giữa 2 lần poll, tải query lặp |

Log-based là chuẩn production. **Flow điển hình với Debezium**:

```
Postgres WAL → Debezium (Kafka Connect) → Kafka topic per table → Consumers
```

Mỗi event chứa `before`/`after` của row + metadata (op, vị trí trong log) — consumer biết chính xác cái gì đổi.

**Use cases**:
1. **Sync search index**: Postgres là source of truth, CDC đẩy thay đổi sang Elasticsearch — search luôn gần real-time mà không cần dual-write.
2. **Invalidate cache**: row đổi → event → consumer xoá key Redis tương ứng.
3. **Replicate sang warehouse**: thay batch ETL hàng đêm bằng stream liên tục.
4. **Outbox pattern** cho microservices: service ghi business data + event vào **cùng một transaction** (bảng outbox), CDC đọc outbox phát lên Kafka — giải quyết bài toán dual-write (ghi DB xong publish Kafka fail thì sao?) mà không cần distributed transaction.

**Thách thức**:
- **Ordering**: phải giữ thứ tự event cùng một row — partition Kafka theo primary key.
- **Schema evolution**: ALTER TABLE làm đổi shape event — cần Schema Registry quản lý version.
- **Initial snapshot**: consumer mới cần trạng thái đầy đủ trước khi đọc delta — Debezium hỗ trợ snapshot rồi chuyển sang streaming, nhưng với bảng tỷ row đây là bước nặng cần lên kế hoạch.
- Consumer phải **idempotent** vì CDC đảm bảo at-least-once — event có thể lặp.

**Insight phỏng vấn**: hai điểm ăn tiền là (1) giải thích log-based đọc WAL/binlog nên không xâm lấn query path, và (2) nối CDC với **outbox pattern** — cho thấy bạn hiểu CDC không chỉ là replication tool mà là nền tảng giải bài toán dual-write trong microservices.

### Thiết kế minh hoạ

```text
            ┌─────────── Postgres ───────────┐
  App ──────▶ orders table                   │
  (1 transaction)─▶ outbox table             │   ← outbox pattern:
            │        │                       │     data + event atomic
            │        ▼ WAL (logical decoding)│
            └────────┼───────────────────────┘
                     ▼
              Debezium (Kafka Connect)
              đọc WAL, KHÔNG đụng query path
                     │ event: {op:"u", before:{...}, after:{...}}
                     ▼
        Kafka topic "db.public.orders" (partition theo PK → giữ ordering)
            │              │                │
            ▼              ▼                ▼
     Elasticsearch    Redis consumer    Snowflake sink
     (sync search     (invalidate       (replicate sang
      index)           cache key)        warehouse)
```

```sql
-- Bật logical replication trong Postgres cho Debezium
-- postgresql.conf: wal_level = logical

-- Outbox pattern: ghi business data + event trong CÙNG transaction
BEGIN;
  INSERT INTO orders (id, user_id, amount) VALUES (...);
  INSERT INTO outbox (aggregate_id, event_type, payload)
  VALUES ('order-123', 'OrderCreated', '{"amount": 99}');
COMMIT;
-- Debezium đọc outbox từ WAL → publish Kafka
-- → không bao giờ có chuyện "DB ghi xong mà event bị mất"
```

### Đáp án mẫu

> "CDC là bắt mọi thay đổi insert, update, delete trong database rồi phát thành stream event cho hệ thống khác đồng bộ theo. Có ba cách: polling theo updated_at thì đơn giản nhưng miss DELETE; trigger-based thì tăng latency mỗi write; chuẩn production là log-based — Debezium đọc thẳng WAL của Postgres hay binlog của MySQL, hoàn toàn không đụng vào query path và bắt đúng thứ tự commit. Flow của em: WAL qua Debezium đẩy vào Kafka, partition theo primary key để giữ ordering, rồi consumers sync sang Elasticsearch cho search, invalidate Redis cache, và replicate sang warehouse. Use case em thích nhất là outbox pattern: ghi business data và event trong cùng một transaction, CDC đọc bảng outbox phát lên Kafka — giải quyết bài toán dual-write mà không cần distributed transaction. Thách thức là schema evolution cần Schema Registry, initial snapshot với bảng lớn, và consumer phải idempotent vì delivery là at-least-once."

---

## Bẫy thường gặp khi trả lời

| Câu | Bẫy | Cách tránh |
| --- | --- | --- |
| 29 | Vẽ flow upload file đi qua app server rồi mới đến S3 | Presigned URL — client upload trực tiếp, server chỉ ký URL và lưu metadata |
| 29 | Coi S3 là filesystem, nói về "sửa một phần file" | Object storage là bất biến — ghi đè cả object, "thư mục" chỉ là prefix |
| 39 | Đánh đồng partitioning với sharding | Partitioning = 1 máy, tối ưu query/vận hành; sharding = nhiều máy, scale capacity |
| 39 | Quên lợi ích vận hành | Partition pruning + DROP partition thay cho DELETE là hai lý do thực tế nhất |
| 40 | Chỉ liệt kê tên TSDB mà không nói tại sao Postgres đuối | Nêu index bloat với insert rate cao + aggregate chậm trên row-store |
| 40 | Bỏ qua downsampling/retention | Đây là tính năng phân biệt TSDB với DB thường, không chỉ là "nhanh hơn" |
| 41 | Nói warehouse vs lake chỉ khác về "kích thước data" | Khác biệt gốc là schema-on-write vs schema-on-read, kéo theo chi phí và người dùng |
| 41 | Không biết lakehouse | Nhắc Delta Lake/Iceberg — ACID trên file trong lake, gộp hai hệ thống làm một |
| 42 | Mô tả CDC là "cron job query updated_at" | Đó là polling — chuẩn production là log-based đọc WAL/binlog (Debezium) |
| 42 | Quên dual-write problem | Nối CDC với outbox pattern là điểm cộng lớn nhất của câu này |
