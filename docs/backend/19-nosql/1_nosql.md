---
sidebar_position: 1
title: "1. NoSQL: Document, Key-Value, Wide-Column, Graph, Time-Series"
---

# NoSQL: Document, Key-Value, Wide-Column, Graph, Time-Series

NoSQL là nhóm các database không theo kiểu bảng quan hệ (relational) như SQL truyền thống, với schema linh hoạt và khả năng mở rộng theo chiều ngang dễ hơn. Bài này giới thiệu các loại NoSQL phổ biến: document (MongoDB), key-value (Redis, DynamoDB), wide-column (Cassandra), graph (Neo4j) và time-series, kèm theo từng loại phù hợp với bài toán nào. Hiểu các lựa chọn này giúp bạn chọn đúng "công cụ" cho từng nhu cầu thay vì dùng một database cho mọi thứ.

[![Sơ đồ tóm tắt bài: NoSQL: Document, Key-Value, Wide-Column, Graph, Time-Series](/img/backend/nosql.webp)](pathname:///img/backend/nosql.webp)

---

:::note[Ghi nhớ nhanh]

- ⭐ **NoSQL = "Not Only SQL"** — schema linh hoạt, scale horizontal dễ hơn, hạn chế JOIN, đa số trade consistency lấy availability/performance.
- **5 loại chính** — Document (`MongoDB`), Key-Value (`Redis`/`DynamoDB`), Wide-Column (`Cassandra`), Graph (`Neo4j`), Time-Series (`TimescaleDB`/`InfluxDB`).
- ⭐ **`PostgreSQL JSONB` thay được MongoDB cho ~90% case** — Postgres + extension (`pgvector`, `TimescaleDB`, `pg_trgm`) cover phần lớn nhu cầu.
- **`Polyglot persistence`** — mỗi DB tối ưu cho 1 task, đổi lại tốn công sync + vận hành nhiều hệ thống.
- **Đừng chọn NoSQL vì hype** — default Postgres, chỉ thêm NoSQL khi data nature thực sự fit (event log, vector, cache).

:::

---

## Mục lục

- [NoSQL là gì?](#nosql-là-gì)
- [Document DB (MongoDB)](#document-db-mongodb)
- [Key-Value (Redis, DynamoDB)](#key-value-redis-dynamodb)
- [Wide-Column (Cassandra)](#wide-column-cassandra)
- [Graph DB (Neo4j)](#graph-db-neo4j)
- [Time Series DB](#time-series-db)
- [Khi nào dùng NoSQL?](#khi-nào-dùng-nosql)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## NoSQL là gì?

**NoSQL** = "Not Only SQL" — DB không phải relational.

**Đặc điểm chung**:

- Schema **linh hoạt** (hoặc schemaless).
- Scale **horizontal** dễ hơn.
- Trade **consistency** cho **availability/performance** (đa số).
- **Không JOIN** (hoặc rất hạn chế).

:::tip[Ví dụ đời thường]

**SQL** giống **tủ hồ sơ kẻ ô sẵn**: mọi tờ khai đều đúng một mẫu, thiếu ô là nhân viên trả lại. Nhờ vậy tra cứu chéo giữa các ngăn rất dễ, số liệu không bao giờ lệch mẫu.

**NoSQL** giống **thùng đựng đồ**: nhét gì vào cũng được, thêm bớt tuỳ ý, cần chứa nhiều thì mua thêm thùng xếp cạnh nhau. Đổi lại **không còn ai gác cửa kiểm tra mẫu** — dữ liệu rác lọt vào lúc nào không hay, và việc ghép đồ ở thùng này với đồ ở thùng kia (JOIN) phải tự làm bằng tay trong code.

:::

---

## Document DB (MongoDB)

**Lưu document** JSON (BSON) — schemaless.

:::tip[Ví dụ đời thường]

Hồ sơ bệnh nhân ở phòng khám: mỗi người **một bìa còng riêng**, bên trong kẹp đủ thứ — đơn thuốc, phim chụp, giấy xét nghiệm. Người này 5 tờ, người kia 30 tờ, chẳng sao cả. Cần xem toàn bộ thông tin một người thì rút đúng một bìa là có hết, không phải chạy sang 6 ngăn tủ khác gom lại.

Cái giá: hỏi **"cả phòng khám có bao nhiêu người dị ứng thuốc?"** thì phải mở từng bìa ra đọc, và không ai đảm bảo bìa nào cũng có tờ khai dị ứng.

:::

```js
// MongoDB
db.users.insertOne({
  name: "An",
  email: "an@example.com",
  addresses: [
    { city: "HN", street: "..." },
    { city: "HCM", street: "..." },
  ],
  metadata: { source: "google" },
});

// Query
db.users.find({ "addresses.city": "HN" });
db.users.updateOne(
  { email: "an@example.com" },
  { $push: { addresses: { city: "DN" } } }
);
```

**Phù hợp**:

- Schema thay đổi nhiều (CMS, product với many attribute).
- Hierarchical nested data.
- Prototype nhanh.

**Phổ biến**:

- **MongoDB** — popular nhất, Atlas managed.
- **CouchDB** — sync với mobile.
- **AWS DocumentDB** — Mongo-compat.

:::info[Phân tích]

**MongoDB vs PostgreSQL JSONB**:

| | MongoDB | PostgreSQL JSONB |
|--|---------|-----------------|
| Native document | ✓ | ✓ (JSONB column) |
| Schema flexibility | Cao | Cao |
| ACID transaction | Limited (multi-doc 4.0+) | Full ACID |
| JOIN | Limited (`$lookup`) | Full JOIN |
| Index JSON field | ✓ | ✓ |
| Vector search | ✓ (Atlas) | ✓ (pgvector) |
| Full-text search | ✓ | ✓ |
| Mature | Lâu năm | Lâu năm |

→ Năm 2026, **PostgreSQL JSONB** thay được MongoDB cho 90% case. Lợi:

- 1 DB cho relational + document.
- Transaction full.
- Ecosystem lớn hơn.

MongoDB còn dùng khi:

- Document **rất phức tạp** nested deep.
- Geo/text search natively cần.
- Team đã rất quen MongoDB.

:::

---

## Key-Value (Redis, DynamoDB)

**Get/Set theo key** — đơn giản, fast.

:::tip[Ví dụ đời thường]

**Tủ gửi đồ ở siêu thị**. Bạn đưa túi, nhận về số **17**; lúc quay lại chìa số 17 là lấy đúng túi, nhanh gần như tức thì vì nhân viên chẳng cần biết trong túi có gì.

Cái giá cũng nằm ở đó: không ai trả lời được câu **"túi nào có bánh mì?"** — muốn biết phải mở hết mọi ngăn. Nên key-value chỉ hợp khi bạn **luôn biết trước cái chìa**: session id, user id, khoá cache.

:::

**Redis**:

```ts
await redis.set("session:abc", JSON.stringify(data));
const data = await redis.get("session:abc");
```

**DynamoDB**:

```ts
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

await client.send(new PutItemCommand({
  TableName: "users",
  Item: {
    id: { S: "user-1" },
    name: { S: "An" },
  },
}));
```

**Phổ biến**:

- **Redis** — in-memory, cache + queue.
- **DynamoDB** (AWS) — managed NoSQL.
- **etcd**, **Consul** — config/service discovery.
- **Memcached** — cache only.
- **Cloudflare KV**, **Vercel KV** — edge.

**Phù hợp**:

- Cache.
- Session store.
- Rate limiting.
- Real-time leaderboard.
- Simple key-based lookup.

---

## Wide-Column (Cassandra)

**Hybrid** key-value + column family.

:::tip[Ví dụ đời thường]

Một **chuỗi kho hàng trải khắp các tỉnh**, không có kho tổng. Hàng về tỉnh nào nhập thẳng kho tỉnh đó nên nhập bao nhiêu cũng kịp (write-heavy), thiếu chỗ thì mở thêm kho — sức chứa tăng đều theo số kho. Một kho cháy, các kho khác vẫn chạy.

Cái giá: **cách xếp hàng trong kho phải chốt từ đầu theo kiểu bạn sẽ đi tìm**. Đã xếp theo mã đơn thì sau này muốn tìm theo tên khách là bó tay — không có ai đi lục tung mọi kho giúp bạn như bên SQL.

:::

```sql
-- Cassandra CQL
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  created_at TIMESTAMP
);

INSERT INTO users (id, name, email, created_at)
VALUES (uuid(), 'An', 'an@example.com', toTimestamp(now()));

SELECT * FROM users WHERE id = ?;
```

**Đặc điểm**:

- **Linear scale** — add node, throughput tăng.
- **No single point of failure**.
- **Tunable consistency**.
- **Limited query** — phải design theo access pattern.

**Phổ biến**:

- **Cassandra** — open source, distributed.
- **ScyllaDB** — Cassandra-compat C++, nhanh hơn 5-10x.
- **BigTable** (Google) — original inspiration.

**Phù hợp**:

- Write-heavy time-series (sensor, log).
- Need scale to PB-level.
- Geo-distributed.

**Không phù hợp**:

- Complex query, ad-hoc analytics.
- ACID transaction.

---

## Graph DB (Neo4j)

**Lưu node + edge** — chuyên cho relationship.

:::tip[Ví dụ đời thường]

Bảng SQL giống **danh sách lớp**: mỗi dòng một người. Muốn biết "bạn của bạn của An là ai" thì phải dò danh sách chồng lên nhau nhiều lượt — thêm một tầng quan hệ là thêm một lượt dò, càng sâu càng ì.

Graph DB giống **cây phả hệ vẽ trên giấy**: mỗi người là một ô, mỗi quan hệ là một sợi dây nối sẵn. Tìm bạn-của-bạn chỉ là **lần theo dây**, đi mấy tầng cũng nhanh như nhau. Đổi lại, mấy việc tầm thường như "đếm tổng số người, cộng doanh thu tháng" thì tờ phả hệ lại dở hơn bảng thường.

:::

```cypher
// Neo4j Cypher
CREATE (an:Person {name: 'An', age: 25})
CREATE (binh:Person {name: 'Binh', age: 30})
CREATE (an)-[:FRIEND_OF {since: 2020}]->(binh)

// Query — friends of friends
MATCH (an:Person {name: 'An'})-[:FRIEND_OF*1..2]-(friend)
RETURN DISTINCT friend.name;
```

**Phù hợp**:

- **Social network** — friend, follower, like.
- **Recommendation** — "users who bought X also bought Y".
- **Fraud detection** — pattern detection trong network.
- **Knowledge graph**.
- **Network/topology** modeling.

**Phổ biến**:

- **Neo4j** — phổ biến nhất.
- **AWS Neptune** — managed AWS.
- **Dgraph** — Go, distributed.
- **TigerGraph** — performance focus.
- **Apache AGE** — Graph extension cho Postgres.

Phân tích graph trong **Postgres** vẫn được nhờ recursive CTE — nhưng
Graph DB tối ưu hơn cho deep traversal.

---

## Time Series DB

**Optimize cho time-series** — append-heavy, query theo time range.

:::tip[Ví dụ đời thường]

**Sổ ghi công tơ điện**: mỗi giờ ghi thêm một dòng xuống cuối, không bao giờ quay lại sửa dòng cũ. Câu hỏi cũng luôn cùng một dạng — "tuần trước trung bình mỗi ngày hết bao nhiêu số điện?".

Vì biết trước thói quen đó, time-series DB **đóng sổ theo từng khoảng thời gian rồi cất riêng**: hỏi tuần trước thì chỉ lôi đúng mấy quyển của tuần đó ra, khỏi lật cả kho 5 năm. Cái giá: nó dở tệ với việc sửa/xoá dữ liệu cũ — vốn là chuyện gần như không xảy ra với loại dữ liệu này.

:::

**Use case**:

- IoT sensor data.
- Metrics (Prometheus).
- Stock price.
- Application monitoring.

```sql
-- TimescaleDB (Postgres extension)
CREATE TABLE metrics (
  time TIMESTAMP NOT NULL,
  sensor_id INTEGER,
  value DOUBLE PRECISION
);

SELECT create_hypertable('metrics', 'time');

-- Optimized for time range
SELECT time_bucket('5 minutes', time) AS bucket,
       avg(value)
FROM metrics
WHERE time > NOW() - INTERVAL '1 day'
GROUP BY bucket
ORDER BY bucket;
```

**Phổ biến**:

- **TimescaleDB** — Postgres extension, recommended.
- **InfluxDB** — purpose-built.
- **Prometheus** — metric specific (pull-based).
- **VictoriaMetrics** — Prometheus-compat, faster.
- **ClickHouse** — analytics + time series.

:::tip[Mẹo]

**ClickHouse** — column-store, **fast analytics**:

```sql
-- ClickHouse — billion row scan trong giây
SELECT user_id, count(*)
FROM events
WHERE event_time > today() - 7
GROUP BY user_id
ORDER BY count(*) DESC
LIMIT 100;
```

Use case:

- OLAP analytics dashboard.
- Log search.
- Real-time analytics.

10-100x faster than Postgres cho aggregation lớn. Trade-off: không phù
hợp OLTP (high write, point query).

:::

---

## Khi nào dùng NoSQL?

```
Use case → DB

Cache, session                          → Redis
Document phức tạp                       → MongoDB / Postgres JSONB
Time-series                             → TimescaleDB / InfluxDB
Real-time analytics                     → ClickHouse
Social graph                            → Neo4j / Postgres + recursion
Massive scale write                     → Cassandra / ScyllaDB
Vector search                           → pgvector / Pinecone
Simple key-value at scale               → DynamoDB
Edge / serverless KV                    → Vercel KV / Cloudflare KV
```

:::info[Phân tích]

**Polyglot persistence** — dùng multiple DB cho từng case:

```
[App]
├─ PostgreSQL — user, order, transaction (ACID)
├─ Redis — cache, session, rate limit
├─ Elasticsearch — search
├─ ClickHouse — analytics dashboard
├─ S3 — file storage
└─ Pinecone — vector embedding (AI)
```

Mỗi DB optimize cho task của nó.

Trade-off:

- **Sync complexity** — data trong nhiều DB.
- **Operational cost** — maintain N system.
- **Eventual consistency** challenges.

→ **Start với 1 DB (Postgres)**, add NoSQL khi có **measurable bottleneck**.

PostgreSQL hiện đại + extension (pgvector, TimescaleDB, pg_trgm) cover
80% case mà không cần thêm DB.

:::

:::warning[Cần lưu ý]

**Đừng chọn NoSQL vì hype**:

- "Mongo scale better" — Postgres scale tốt hơn cho đa số case.
- "Schema-less faster dev" — Postgres JSONB cũng schema-less.
- "Document fit our data" — JOIN với relational cũng OK.

Hỏi:

1. **Vấn đề thật sự gặp** với SQL là gì?
2. NoSQL **giải quyết được** vấn đề đó?
3. Trade-off (transaction, JOIN, ecosystem) chấp nhận được?

90% startup default **PostgreSQL**. NoSQL khi data nature thực sự fit:

- Massive event log → time-series DB.
- Embedding vector → vector DB.
- Cache session → Redis.

Không "Mongo cho mọi thứ" hoặc "DynamoDB vì AWS".

:::

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. NoSQL là gì và khác relational database ở những điểm nào? Kể tên 5 nhóm chính (document, key-value, wide-column, graph, time-series) kèm bài toán tiêu biểu của từng nhóm.**

<details className="qa">
<summary>Xem đáp án</summary>

**NoSQL** = "Not Only SQL" — nhóm DB không theo mô hình bảng quan hệ. Khác biệt chính so với SQL:

- Schema **linh hoạt** hoặc schemaless, thay vì cột cố định.
- Scale **horizontal** (thêm node) dễ hơn scale vertical.
- **Không JOIN** hoặc JOIN rất hạn chế — phải ghép dữ liệu trong code.
- Đa số trade **consistency** lấy **availability/performance**.

Năm nhóm chính:

| Nhóm | Đại diện | Bài toán tiêu biểu |
|---|---|---|
| Document | MongoDB, CouchDB | CMS, product nhiều attribute, nested data |
| Key-Value | Redis, DynamoDB | Cache, session, rate limit, leaderboard |
| Wide-Column | Cassandra, ScyllaDB | Write-heavy log/sensor, scale PB, geo-distributed |
| Graph | Neo4j, Neptune | Social network, recommendation, fraud detection |
| Time-Series | TimescaleDB, InfluxDB | IoT sensor, metrics, stock price, monitoring |

Ví dụ đời thường trong bài: SQL là tủ hồ sơ kẻ ô sẵn (có người gác cửa kiểm mẫu), NoSQL là thùng đựng đồ (nhét gì cũng được, nhưng dữ liệu rác lọt vào lúc nào không hay).

</details>

**2. Vì sao NoSQL scale `horizontal` dễ hơn SQL? Cái giá phải trả về `JOIN`, transaction và tính nhất quán là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

NoSQL scale ngang dễ vì **dữ liệu được thiết kế để tự chia được**: mỗi record truy cập qua một key, và key đó quyết định record nằm ở node nào. Không có ràng buộc khoá ngoại xuyên bảng, không cần JOIN giữa các node, nên thêm node là thêm throughput gần như tuyến tính — đúng như tính chất "linear scale" của Cassandra trong bài. SQL ngược lại: JOIN, foreign key và transaction ACID đều giả định dữ liệu **ở cùng một chỗ**; chia ra nhiều máy là phải làm distributed JOIN và two-phase commit, rất đắt.

Cái giá:

- **JOIN** — phải denormalize (nhét dữ liệu trùng lặp vào nhiều nơi) hoặc ghép bằng nhiều lượt query trong application.
- **Transaction** — mất ACID đa bản ghi/đa node, hoặc chỉ có ở mức hạn chế.
- **Nhất quán** — đọc có thể ra dữ liệu cũ (eventual consistency), phải xử lý conflict ở tầng ứng dụng.
- **Ad-hoc query** — không còn chạy được câu hỏi ngoài dự tính ban đầu.

</details>

**3. Giải thích `CAP theorem`. Vì sao MongoDB thường được xếp là `CP` còn Cassandra là `AP`? Khi mạng bị chia cắt (`network partition`), mỗi hệ hy sinh điều gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`CAP theorem`: một hệ phân tán chỉ đảm bảo được 2 trong 3 tính chất — **Consistency** (mọi node đọc ra cùng dữ liệu mới nhất), **Availability** (mọi request đều có phản hồi), **Partition tolerance** (vẫn chạy khi mạng giữa các node đứt). Vì partition là chuyện **chắc chắn xảy ra** trên hệ phân tán thật, P là bắt buộc — lựa chọn thực sự chỉ còn giữa C và A khi partition xảy ra.

- **MongoDB (CP)** — mô hình replica set có một **primary** duy nhất nhận write. Khi partition, phía không có primary (hoặc không đủ phiếu bầu majority) sẽ **từ chối phục vụ write**, chờ bầu primary mới. Hy sinh **availability** để không sinh dữ liệu mâu thuẫn.
- **Cassandra (AP)** — masterless, mọi node nhận được write. Khi partition, các phía vẫn ghi bình thường rồi hoà giải sau (hinted handoff, read repair). Hy sinh **consistency** — đọc có thể ra dữ liệu cũ trong lúc chưa hội tụ.

Lưu ý: Cassandra có `tunable consistency`, chỉnh consistency level lên `QUORUM`/`ALL` thì nghiêng dần về phía CP.

</details>

**4. Phân biệt `strong consistency` và `eventual consistency`. Cho một nghiệp vụ chấp nhận được eventual và một nghiệp vụ tuyệt đối không.**

<details className="qa">
<summary>Xem đáp án</summary>

| | `strong consistency` | `eventual consistency` |
|---|---|---|
| Đọc sau khi ghi | Luôn thấy giá trị mới nhất | Có thể thấy giá trị cũ một thời gian |
| Cách đạt | Ghi/đọc qua leader, hoặc quorum | Ghi local rồi lan truyền bất đồng bộ |
| Latency | Cao hơn (chờ đồng thuận) | Thấp |
| Availability khi partition | Giảm | Giữ nguyên |

**Chấp nhận eventual**: số lượt xem bài viết, số like, feed gợi ý, dashboard analytics, cache danh mục sản phẩm. Lệch vài trăm ms hay vài giây không ai thiệt hại, đổi lại hệ thống nhanh và luôn sống.

**Tuyệt đối không**: số dư tài khoản và luồng thanh toán, trừ tồn kho vé/hàng giới hạn, cấp quyền truy cập. Ở đây đọc dữ liệu cũ dẫn tới chi tiêu vượt số dư hoặc bán trùng một chỗ ngồi — sai lệch có hậu quả tiền bạc, phải dùng DB ACID (Postgres) với transaction thật.

</details>

**5. `BASE` khác `ACID` ở đâu? MongoDB hỗ trợ transaction tới mức nào và có nên dựa vào nó cho luồng thanh toán không?**

<details className="qa">
<summary>Xem đáp án</summary>

**ACID** (triết lý của SQL) = Atomicity, Consistency, Isolation, Durability — ưu tiên **đúng tuyệt đối**, thà từ chối còn hơn ghi sai.

**BASE** (triết lý của nhiều NoSQL) = **B**asically **A**vailable, **S**oft state, **E**ventual consistency — ưu tiên **luôn phục vụ được**, chấp nhận dữ liệu tạm thời lệch rồi hội tụ sau.

MongoDB: thao tác trên **một document luôn atomic** (đây là lý do mô hình embed rất mạnh). Từ bản 4.0 có multi-document transaction trên replica set, 4.2 mở rộng ra sharded cluster — nhưng như bài đã nêu, vẫn là **limited** so với full ACID của Postgres: có giới hạn thời gian chạy, chi phí cao hơn, và dễ gặp write conflict khi tranh chấp.

Với luồng thanh toán: **không nên** đặt cược vào đó. Tiền bạc nên nằm ở Postgres với transaction full ACID và ràng buộc ở tầng DB. Nếu buộc phải dùng Mongo, hãy gom mọi thứ cần atomic vào **một document** thay vì trải ra nhiều collection.

</details>

**6. Khi nào bạn chọn MongoDB thay vì `PostgreSQL JSONB`, và ngược lại? Postgres `JSONB` còn thiếu gì so với MongoDB?**

<details className="qa">
<summary>Xem đáp án</summary>

| | MongoDB | PostgreSQL JSONB |
|---|---|---|
| ACID transaction | Hạn chế (multi-doc từ 4.0) | Full ACID |
| JOIN | Hạn chế (`$lookup`) | JOIN đầy đủ |
| Index field trong JSON | Có | Có (GIN) |
| Vector / full-text search | Có (Atlas) | Có (`pgvector`, `tsvector`) |
| Sharding sẵn có | Native, tự động | Phải tự làm hoặc dùng Citus |

Mặc định nên là **Postgres JSONB** — bài khẳng định nó thay được MongoDB cho khoảng 90% case: một DB phục vụ cả relational lẫn document, transaction đầy đủ, hệ sinh thái lớn hơn.

Chọn **MongoDB** khi document rất phức tạp, nested sâu; cần geo/text search native; hoặc team đã rất quen Mongo và có sẵn vận hành. Thứ Postgres còn thiếu so với Mongo chủ yếu là **sharding tự động ở quy mô rất lớn**, aggregation pipeline quen tay, và trải nghiệm quản trị của Atlas.

</details>

**7. Trong document DB, khi nào nên `embed` dữ liệu con và khi nào nên `reference`? Giới hạn kích thước document ảnh hưởng thế nào tới quyết định này?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc: **dữ liệu nào luôn đọc cùng nhau thì để cùng nhau**.

`embed` khi quan hệ **1-ít**, dữ liệu con không tồn tại độc lập và số lượng bị chặn — ví dụ `addresses` của user trong bài. Lợi: một lần đọc là có đủ (giống rút một bìa hồ sơ là thấy hết), và cập nhật trong cùng document luôn atomic.

`reference` khi quan hệ **1-rất nhiều** hoặc **nhiều-nhiều**, dữ liệu con lớn dần vô hạn (comment, order, log), hoặc được truy cập/chia sẻ độc lập.

```js
// embed — địa chỉ ít, luôn đọc cùng user
{ _id: 1, name: "An", addresses: [{ city: "HN" }] }

// reference — order tăng vô hạn, tách collection
{ _id: 101, userId: 1, total: 250000 }
```

MongoDB giới hạn **16MB mỗi document**, nên mảng con tăng không chặn (unbounded array) sẽ làm document phình dần tới lúc ghi hỏng, đồng thời mỗi lần update phải rewrite cả khối lớn. Đó là lý do "array có thể lớn vô hạn" gần như luôn phải `reference`.

</details>

**8. `sharding` là gì? Chọn `shard key` sai gây `hotspot` như thế nào, và làm sao tránh (`high cardinality`, `hashed key`, `compound key`)?**

<details className="qa">
<summary>Xem đáp án</summary>

`sharding` là chia dữ liệu thành nhiều mảnh nằm trên các node khác nhau; `shard key` quyết định một bản ghi thuộc mảnh nào. Đây chính là cơ chế giúp NoSQL scale ngang.

`hotspot` xảy ra khi key đẩy phần lớn traffic vào một shard:

- **Cardinality thấp** — shard theo `country` mà 80% user ở một nước → một shard gánh hết.
- **Key tăng đơn điệu** — shard theo `timestamp` hoặc auto-increment id: mọi write mới đều rơi vào shard cuối cùng, các shard khác nhàn rỗi.

Cách tránh:

- **High cardinality** — chọn field có rất nhiều giá trị phân bố đều (`userId`, `deviceId`).
- **Hashed key** — hash giá trị trước khi chia, phá bỏ tính tuần tự. Đổi lại mất khả năng range query theo key đó.
- **Compound key** — ghép field phân bố đều với field hay lọc, ví dụ `(userId, createdAt)`: rải đều giữa các shard nhưng vẫn quét theo thời gian được trong từng user.

Thêm nữa, shard key nên xuất hiện trong hầu hết query, nếu không mọi truy vấn đều phải scatter-gather qua tất cả shard.

</details>

**9. "Thiết kế bảng Cassandra theo `access pattern`" nghĩa là gì? Chuyện gì xảy ra khi sau 6 tháng nghiệp vụ cần query theo một cột không nằm trong `primary key`?**

<details className="qa">
<summary>Xem đáp án</summary>

Với SQL bạn chuẩn hoá dữ liệu trước rồi query kiểu gì cũng được. Cassandra ngược lại: **liệt kê trước các câu query sẽ chạy, rồi tạo bảng phục vụ đúng từng câu** — giống ví dụ chuỗi kho hàng trong bài, cách xếp hàng phải chốt từ đầu theo kiểu bạn sẽ đi tìm. Hệ quả là cùng một dữ liệu thường được ghi vào **nhiều bảng denormalized** (`orders_by_user`, `orders_by_status`), ứng dụng chịu trách nhiệm ghi đồng thời.

Khi phát sinh query theo cột ngoài primary key, các lựa chọn đều không đẹp:

- `ALLOW FILTERING` — chạy được nhưng quét toàn cluster, latency không đoán trước, tuyệt đối tránh trên production.
- **Secondary index** — chỉ hợp khi cardinality vừa phải và có kèm partition key; cardinality quá cao hoặc quá thấp đều tệ.
- **Materialized view** — tiện nhưng lịch sử có nhiều vấn đề về tính đúng đắn.
- **Tạo bảng mới theo access pattern mới + backfill** — đây là cách chuẩn, và cũng là công việc thật sự tốn kém.

Đó là cái giá của "limited query" mà bài đã nêu.

</details>

**10. Phân biệt `partition key` và `clustering key` trong Cassandra. `tunable consistency` (`ONE`, `QUORUM`, `ALL`) hoạt động ra sao và ảnh hưởng gì tới latency?**

<details className="qa">
<summary>Xem đáp án</summary>

- `partition key` — quyết định **dữ liệu nằm ở node nào**. Mọi query hiệu quả đều phải chỉ định nó.
- `clustering key` — quyết định **thứ tự sắp xếp các dòng bên trong một partition**, cho phép range query và `ORDER BY` rẻ.

```sql
CREATE TABLE events (
  user_id UUID,
  event_time TIMESTAMP,
  payload TEXT,
  PRIMARY KEY ((user_id), event_time)
);
-- user_id: partition key | event_time: clustering key
```

`tunable consistency`: mỗi lần đọc/ghi bạn chọn cần bao nhiêu replica xác nhận.

| Level | Ý nghĩa | Đánh đổi |
|---|---|---|
| `ONE` | 1 replica trả lời là xong | Nhanh nhất, dễ đọc ra dữ liệu cũ |
| `QUORUM` | Quá bán số replica | Cân bằng, thường dùng nhất |
| `ALL` | Toàn bộ replica | Nhất quán nhất, chậm, chết 1 node là hỏng |

Quy tắc quen thuộc: nếu `R + W > RF` (replication factor) thì đọc luôn thấy write mới nhất — ví dụ `QUORUM` cho cả đọc lẫn ghi. Level càng cao thì latency càng bị kéo theo replica chậm nhất và availability càng giảm.

</details>

**11. Redis dùng làm cache, session, `rate limit` — bạn xử lý `cache invalidation` và `TTL` thế nào? Redis restart mất dữ liệu thì hệ thống ra sao? Phân biệt `RDB` và `AOF`.**

<details className="qa">
<summary>Xem đáp án</summary>

**Invalidation**: đặt `TTL` cho mọi key (không có TTL là rò rỉ bộ nhớ chờ sẵn), TTL ngắn cho dữ liệu hay đổi, dài cho dữ liệu tĩnh. Kèm theo đó là chủ động xoá key khi ghi dữ liệu gốc (write-through hoặc cache-aside + delete). Nên thêm **jitter** vào TTL để tránh nhiều key hết hạn cùng lúc gây `cache stampede`, và dùng version/prefix trong tên key để "xoá" cả nhóm bằng cách đổi prefix.

**Mất dữ liệu khi restart**: cache mất thì hệ thống vẫn đúng, chỉ chậm và dồn tải xuống DB một lúc — cần chuẩn bị để DB không sập theo. Nhưng session và rate-limit counter mất thì user bị đăng xuất hàng loạt hoặc giới hạn bị reset.

| | `RDB` | `AOF` |
|---|---|---|
| Cách lưu | Snapshot toàn bộ theo chu kỳ | Ghi lại từng lệnh write |
| Rủi ro mất | Mất dữ liệu từ snapshot cuối | Rất ít (fsync mỗi giây) |
| Restart | Nhanh | Chậm hơn, file lớn hơn |

Production thường **bật cả hai**: RDB để backup/khôi phục nhanh, AOF để giảm mất mát.

</details>

**12. Redis chạy single-thread mà vẫn rất nhanh — vì sao? Một lệnh chậm như `KEYS *` gây hậu quả gì trên production, thay bằng gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Nhanh vì:

- Dữ liệu nằm hoàn toàn **in-memory** — không có disk I/O trên đường xử lý.
- **Single-thread nên không cần lock**, không context switch, không tranh chấp — với thao tác vài microsecond thì chi phí đồng bộ hoá còn đắt hơn chính công việc.
- I/O multiplexing (epoll) xử lý hàng vạn kết nối trên một vòng lặp sự kiện.
- Cấu trúc dữ liệu tối ưu sẵn, đa số lệnh là `O(1)`.
- Nút thắt thực tế thường là **network**, không phải CPU — nên pipelining giúp rất nhiều.

Chính vì single-thread, **mọi lệnh chậm đều chặn toàn bộ server**. `KEYS *` quét hết keyspace, `O(n)`: với vài triệu key nó có thể chiếm server hàng trăm ms tới vài giây, trong lúc đó mọi client khác bị treo, timeout lan ra toàn hệ thống.

```
KEYS user:*        # O(n), blocking — cấm dùng production
SCAN 0 MATCH user:* COUNT 100   # duyệt từng mẻ, không chặn
```

Tương tự, thay `FLUSHALL` bằng `FLUSHALL ASYNC`, `DEL` key khổng lồ bằng `UNLINK`, và tránh `SMEMBERS`/`HGETALL` trên collection quá lớn.

</details>

**13. Khi nào graph DB (Neo4j) thắng hẳn SQL? Vì sao truy vấn "bạn của bạn của bạn" trên bảng quan hệ lại đắt, và `recursive CTE` trong Postgres giải quyết được tới đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

Graph DB thắng khi bài toán là **đi sâu theo quan hệ**: social network, recommendation ("ai mua X cũng mua Y"), fraud detection theo pattern, knowledge graph, mô hình topology mạng.

Trên SQL, mỗi tầng quan hệ là **một lần JOIN bảng friendship với chính nó**. Số dòng trung gian nhân lên theo bậc của node: bậc 1 vài trăm, bậc 2 vài chục nghìn, bậc 3 hàng triệu — chi phí bùng nổ theo cấp số nhân. Neo4j dùng **index-free adjacency**: mỗi node giữ con trỏ trực tiếp tới các cạnh của nó, đi thêm một tầng chỉ là lần theo con trỏ, chi phí phụ thuộc vào vùng duyệt chứ không phụ thuộc kích thước toàn bộ dataset. Đúng như ví dụ trong bài: danh sách lớp phải dò chồng lên nhau, còn cây phả hệ thì lần theo dây.

`recursive CTE` (`WITH RECURSIVE`) trong Postgres làm được traversal và đủ dùng cho đồ thị vừa, độ sâu nhỏ (2–3 tầng). Nhưng nó vẫn là JOIN lặp nên càng sâu càng đuối; extension **Apache AGE** là lựa chọn trung gian nếu muốn ở lại Postgres.

</details>

**14. Time-series DB tối ưu những gì mà Postgres thường không có sẵn? So sánh `TimescaleDB`, `InfluxDB`, `Prometheus` và `ClickHouse` — mỗi cái hợp việc gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Time-series DB khai thác đặc thù "chỉ ghi thêm vào cuối, hỏi theo khoảng thời gian" (ví dụ sổ ghi công tơ điện trong bài):

- **Partition tự động theo thời gian** (hypertable/chunk) — query 1 ngày chỉ chạm vài chunk.
- **Nén theo cột** rất cao vì dữ liệu liền kề giống nhau.
- **Retention policy** — tự xoá dữ liệu quá hạn.
- **Continuous aggregate / downsampling** — gộp sẵn theo phút, giờ.
- Hàm chuyên dụng: `time_bucket`, gap filling, interpolation.

| | Hợp việc gì |
|---|---|
| `TimescaleDB` | Extension của Postgres — giữ nguyên SQL, JOIN với bảng nghiệp vụ; lựa chọn mặc định được bài khuyến nghị |
| `InfluxDB` | Purpose-built cho IoT/metrics, hệ sinh thái telegraf sẵn có |
| `Prometheus` | Metrics hạ tầng, mô hình **pull**, alerting; lưu ngắn hạn, không phải kho dữ liệu chung |
| `ClickHouse` | Analytics OLAP trên khối lượng rất lớn, log search, dashboard real-time |

</details>

**15. Vì sao `ClickHouse` quét hàng tỷ dòng nhanh hơn Postgres cho aggregation, nhưng lại không hợp OLTP? Giải thích theo kiến trúc `column-store`.**

<details className="qa">
<summary>Xem đáp án</summary>

Postgres là **row-store**: một dòng nằm liền nhau trên đĩa. Muốn `SUM(amount)` thì vẫn phải đọc cả dòng, kể cả 30 cột không dùng tới.

ClickHouse là **column-store**: mỗi cột lưu thành một file riêng. Hệ quả:

- **Chỉ đọc cột cần dùng** — query 2 cột trên bảng 50 cột giảm I/O cả chục lần.
- **Nén cực tốt** — giá trị cùng kiểu, giá trị lặp nằm cạnh nhau, dễ dùng delta/dictionary encoding.
- **Vectorized execution** — xử lý theo khối giá trị liên tiếp, tận dụng SIMD và cache CPU.

Cộng lại cho ra mức 10–100x nhanh hơn Postgres với aggregation lớn như bài nêu.

Ngược lại, OLTP thì tệ vì: ghi một dòng phải chạm tất cả các file cột; `UPDATE`/`DELETE` từng dòng gần như không có (mutation là thao tác nặng, chạy nền); point query lấy đủ một record phải ghép lại từ nhiều cột; và không có transaction kiểu ACID. Vì vậy mô hình chuẩn là **Postgres cho OLTP, ClickHouse cho analytics**, đồng bộ sang bằng CDC.

</details>

**16. `polyglot persistence` mang lại lợi gì và tạo ra chi phí vận hành nào? Bạn đồng bộ dữ liệu giữa các DB bằng cách nào (`dual write`, `CDC`, `outbox pattern`) và mỗi cách rủi ro gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`polyglot persistence` = mỗi loại dữ liệu dùng đúng DB tối ưu cho nó: Postgres cho order/transaction, Redis cho cache/session, Elasticsearch cho search, ClickHouse cho analytics, S3 cho file, vector DB cho embedding. Lợi là mỗi phần chạy nhanh và scale theo nhu cầu riêng.

Chi phí: **sync complexity** (một sự thật nằm ở nhiều nơi), **operational cost** (backup, monitoring, nâng cấp, on-call cho N hệ thống), **eventual consistency** giữa các kho, và team phải thạo nhiều công nghệ.

| Cách sync | Rủi ro |
|---|---|
| `dual write` | App ghi thẳng 2 nơi. Ghi nơi A xong, nơi B lỗi → lệch vĩnh viễn. Không atomic, không có cơ chế retry an toàn |
| `CDC` | Đọc WAL/binlog của DB nguồn rồi phát đi (Debezium). Không chạm code app, không mất event; đổi lại thêm hạ tầng Kafka/connector, có độ trễ, và schema change phải xử lý |
| `outbox pattern` | Ghi bản ghi nghiệp vụ và event vào **cùng một transaction**, worker đọc bảng outbox phát đi sau. An toàn nhất về tính đúng; cần dọn bảng outbox và consumer phải **idempotent** vì giao hàng là at-least-once |

Khuyến nghị của bài: bắt đầu bằng **một DB (Postgres)**, chỉ thêm khi có bottleneck đo được.

</details>

**17. Một team muốn bỏ Postgres chuyển sang MongoDB vì "Mongo scale tốt hơn". Bạn sẽ hỏi lại và đo đạc những gì trước khi đồng ý?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba câu hỏi gốc theo bài:

1. Vấn đề **thật sự** đang gặp với Postgres là gì — con số cụ thể nào?
2. MongoDB **giải quyết được** đúng vấn đề đó không?
3. Trade-off (transaction, JOIN, ecosystem, chi phí migrate) có chấp nhận được không?

Cần đo trước khi kết luận: p95/p99 latency của các query nóng, `EXPLAIN ANALYZE` xem có thiếu index hay N+1 không, tỷ lệ cache hit, connection pool, IOPS và CPU của instance, kích thước dataset và tốc độ tăng. Rất thường xuyên "Postgres chậm" thực chất là **thiếu index, query viết tệ, hoặc instance quá nhỏ** — sửa xong nhanh hơn nhiều so với migrate.

Nếu vẫn thật sự chạm trần, các bước rẻ hơn nên thử trước: thêm index, read replica, partition bảng, nâng cấu hình, đưa cache Redis vào, dùng JSONB cho phần schema linh hoạt. Và nhắc lại: "schema-less dev nhanh hơn" thì JSONB cũng làm được; "Mongo scale better" chỉ đúng khi bài toán thật sự là massive write phân tán — lúc đó ứng viên hợp lý còn có Cassandra chứ không mặc định là Mongo.

</details>
