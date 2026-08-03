---
sidebar_position: 2
title: "2. NoSQL, MongoDB & Redis"
---

# NoSQL, MongoDB & Redis

> *Câu hỏi NoSQL không phải để kiểm tra bạn thuộc tên database — mà để xem bạn có biết **chọn công cụ theo bài toán** hay chỉ dùng theo trend.*

:::note[Ghi nhớ nhanh]

- ⭐ **4 nhóm NoSQL** — Document (MongoDB), Key-Value (Redis), Wide-Column (Cassandra), Graph (Neo4j); thêm Search engine (Elasticsearch).
- ⭐ **NoSQL đánh đổi JOIN/transaction mạnh** để lấy scale ngang + schema linh hoạt, thường là eventual consistency.
- **Không thay thế SQL** — thực tế dùng **polyglot persistence**: PostgreSQL source of truth + Redis cache + Elasticsearch search.
- **Ranh giới đang mờ dần** — PostgreSQL có `JSONB`, MongoDB có multi-document transaction từ 4.0.

:::

---

## Câu 1: NoSQL là gì? Các loại NoSQL databases phổ biến? `[Intermediate]`

### Câu hỏi

> NoSQL là gì? Em phân loại các nhóm NoSQL database chính, ví dụ tiêu biểu và use case của từng nhóm?

### Giải thích lý thuyết

**NoSQL** ("Not Only SQL") là nhóm database **không dùng mô hình quan hệ bảng-hàng-cột truyền thống**. Ra đời để giải các bài toán mà RDBMS khó xử: schema linh hoạt, scale ngang (horizontal scaling) dễ, throughput cực lớn — đổi lại thường nới lỏng tính nhất quán (eventual consistency) và bỏ JOIN.

Bốn nhóm chính (+ 1 nhóm hay được hỏi kèm):

| Loại | Mô hình dữ liệu | Tiêu biểu | Use case |
| ---- | --------------- | --------- | -------- |
| **Document** | JSON/BSON document | MongoDB, CouchDB, Firestore | Dữ liệu bán cấu trúc, schema tiến hoá nhanh, catalog, CMS |
| **Key-Value** | key → value | Redis, DynamoDB, Memcached | Cache, session, counter, leaderboard |
| **Wide-Column** | row key → họ cột động | Cassandra, HBase, ScyllaDB | Write throughput khổng lồ, time-series, log |
| **Graph** | node + edge | Neo4j, Neptune | Quan hệ phức tạp: social graph, recommendation, fraud detection |
| **Search engine** | inverted index | Elasticsearch, OpenSearch | Full-text search, log analytics — thường đứng cạnh DB chính |

Điểm cần nói để không bị xoáy:

- NoSQL **không "thay thế" SQL** — chúng đánh đổi: bỏ JOIN/transaction mạnh để lấy scale và flexibility. Nhiều hệ thống dùng **polyglot persistence**: PostgreSQL làm source of truth + Redis cache + Elasticsearch search.
- Ranh giới đang mờ dần: PostgreSQL có `JSONB` (document trong SQL), MongoDB có multi-document transaction từ 4.0.

### Code minh hoạ

```js
// Document (MongoDB): schema linh hoạt, nested data tự nhiên
{
  _id: ObjectId("..."),
  name: "iPhone 17",
  specs: { ram: "8GB", colors: ["black", "blue"] },   // nested, không cần bảng phụ
  reviews: [{ user: "an", rating: 5 }]
}
```

```bash
# Key-Value (Redis): thao tác O(1) theo key
SET session:abc123 '{"userId": 42}' EX 3600   # TTL 1 giờ
GET session:abc123
ZINCRBY leaderboard 10 "player:42"            # sorted set: leaderboard real-time
```

```sql
-- Ranh giới mờ: PostgreSQL JSONB — document bên trong relational DB
CREATE TABLE events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  payload JSONB NOT NULL
);
SELECT payload->>'type' FROM events WHERE payload @> '{"userId": 42}';
```

### Đáp án mẫu

> "NoSQL là nhóm database không theo mô hình quan hệ, sinh ra để scale ngang dễ và schema linh hoạt, đổi lại nới lỏng consistency và JOIN. Bốn nhóm chính: **document** như MongoDB cho dữ liệu bán cấu trúc schema tiến hoá nhanh; **key-value** như Redis, DynamoDB cho cache, session, counter; **wide-column** như Cassandra cho write throughput khổng lồ kiểu time-series; **graph** như Neo4j cho quan hệ phức tạp như social network, fraud detection — kèm thêm search engine như Elasticsearch cho full-text search. Quan điểm của em: NoSQL không thay thế SQL mà là trade-off theo bài toán — thực tế hệ thống em làm dùng polyglot persistence: Postgres làm source of truth, Redis cache, Elasticsearch cho search. Và ranh giới đang mờ — Postgres có JSONB, MongoDB có transaction — nên câu hỏi đúng luôn là access pattern của bài toán là gì."

---

## Câu 2: MongoDB là gì? Document-based database hoạt động thế nào? `[Intermediate]`

### Câu hỏi

> MongoDB là gì? Document database tổ chức và truy vấn dữ liệu khác relational database thế nào?

### Giải thích lý thuyết

**MongoDB** là document database phổ biến nhất: dữ liệu lưu dạng **BSON** (Binary JSON — hỗ trợ thêm type như Date, ObjectId, Decimal128), tổ chức theo cấu trúc:

```
Database → Collection (≈ table) → Document (≈ row, nhưng là JSON lồng nhau)
```

Khác biệt cốt lõi với RDBMS:

- **Schema linh hoạt**: document trong cùng collection có thể khác field nhau — schema do **application** enforce (hoặc JSON Schema validation ở server), không phải DB ép cứng.
- **Dữ liệu liên quan lưu lồng nhau** (embedding) thay vì tách bảng + JOIN — đọc 1 document lấy đủ data cho 1 màn hình, không cần ghép.
- `_id` tự sinh kiểu `ObjectId` (12 byte: timestamp + random + counter) — sortable theo thời gian tạo.
- Query bằng **method + filter object** thay vì SQL; có secondary index (B-tree) như RDBMS — **vẫn phải đánh index**, không index thì collection scan y như SQL.
- Scale ngang native: replica set (HA) + sharding (phân mảnh) tích hợp sẵn.
- Multi-document **transaction** có từ 4.0 nhưng đắt hơn — thiết kế tốt là gom dữ liệu cần atomic vào **một document** (update 1 document luôn atomic).

### Code minh hoạ

```js
// CRUD cơ bản
db.products.insertOne({
  name: "Bàn phím cơ",
  price: 1200000,
  tags: ["keyboard", "gaming"],
  stock: { hcm: 10, hanoi: 5 },
});

// Query với filter object + projection
db.products.find(
  { price: { $lt: 2000000 }, tags: "gaming" },  // điều kiện
  { name: 1, price: 1 }                          // chỉ lấy field cần
).sort({ price: -1 }).limit(10);

// Update operator: atomic trên 1 document
db.products.updateOne(
  { _id: ObjectId("...") },
  { $inc: { "stock.hcm": -1 }, $set: { updatedAt: new Date() } }
);

// Index — bắt buộc cho query thường xuyên, y như SQL
db.products.createIndex({ tags: 1, price: -1 });
```

### Đáp án mẫu

> "MongoDB là document database lưu dữ liệu dạng BSON, tổ chức database → collection → document. Khác RDBMS ở ba điểm: schema linh hoạt do application enforce thay vì DB ép cứng; dữ liệu liên quan được embed lồng trong document thay vì tách bảng JOIN — một lần đọc lấy đủ data cho một màn hình; và scale ngang native với replica set, sharding tích hợp. Query bằng filter object với các operator như `$lt`, `$inc` — update một document luôn atomic nên thiết kế tốt là gom dữ liệu cần atomic vào cùng document, còn multi-document transaction có từ bản 4.0 nhưng đắt hơn. Điểm nhiều người nhầm: MongoDB vẫn cần index B-tree y như SQL — không đánh index thì collection scan, không hề 'tự nhanh'. Schema linh hoạt là con dao hai lưỡi nên em luôn bật JSON Schema validation hoặc dùng Mongoose để giữ kỷ luật dữ liệu."

---

## Câu 3: Document embedding vs referencing trong MongoDB `[Senior]`

### Câu hỏi

> Trong MongoDB, khi nào em embed document con vào document cha, khi nào tách ra collection riêng và reference? Tiêu chí quyết định là gì?

### Giải thích lý thuyết

Đây là quyết định thiết kế quan trọng nhất trong MongoDB — nguyên tắc vàng: **"data that is accessed together should be stored together"** — thiết kế theo **access pattern**, không theo thói quen normalize của SQL.

**Embedding** (nhúng vào document cha):

- ✅ Đọc 1 lần đủ dữ liệu, atomic update trong 1 document, không cần "join".
- ❌ Document phình to (giới hạn cứng **16MB**), array lớn dần làm mọi update chậm, dữ liệu nhúng bị **duplicate** nếu nhiều nơi cùng cần.

**Referencing** (lưu `_id` tham chiếu, tách collection):

- ✅ Không giới hạn growth, dữ liệu dùng chung không duplicate, update 1 chỗ.
- ❌ Cần query thứ hai hoặc `$lookup` (join của MongoDB — đắt, đặc biệt trên sharded cluster).

Tiêu chí quyết định:

| Tiêu chí | Embed | Reference |
| -------- | ----- | --------- |
| Quan hệ | 1-1, 1-vài (one-to-few) | 1-rất nhiều, nhiều-nhiều |
| Đọc cùng nhau? | Luôn đọc cùng cha | Truy cập độc lập |
| Tăng trưởng | Bị chặn (vd: address của user) | Không giới hạn (vd: log, comment) |
| Cập nhật | Ít đổi | Đổi thường xuyên, nhiều nơi dùng chung |

Pattern lai phổ biến: **extended reference** — reference kèm copy vài field hay đọc (vd: order lưu `customerId` + copy `customerName`) để tránh `$lookup` cho màn hình list; chấp nhận denormalize có kiểm soát.

### Code minh hoạ

```js
// EMBED: one-to-few, luôn đọc cùng nhau, không tăng trưởng vô hạn
{
  _id: 1,
  name: "Alice",
  addresses: [                       // user có vài địa chỉ — embed hợp lý
    { type: "home", city: "HCM" },
    { type: "work", city: "Hà Nội" },
  ]
}

// REFERENCE: one-to-many không giới hạn — comment tách collection riêng
// posts:    { _id: 99, title: "..." }
// comments: { _id: ..., postId: 99, text: "...", author: "an" }
db.comments.find({ postId: 99 }).sort({ createdAt: -1 }).limit(20); // phân trang được

// EXTENDED REFERENCE: reference + copy field hay đọc — né $lookup
{
  _id: 555,
  customerId: 42,
  customerName: "Alice",   // duplicate có chủ đích cho màn list order
  total: 990000
}
```

### Đáp án mẫu

> "Nguyên tắc của em là thiết kế theo access pattern: dữ liệu đọc cùng nhau thì lưu cùng nhau. **Embed** khi quan hệ one-to-few, con luôn được đọc cùng cha và không tăng trưởng vô hạn — như addresses của user; được lợi đọc một lần và atomic update. **Reference** khi one-to-many không giới hạn hoặc dữ liệu được truy cập độc lập — như comments của post, vì embed sẽ đụng trần 16MB và không phân trang được. Ba red flag bắt buộc reference: array tăng không giới hạn, dữ liệu nhiều nơi dùng chung, và cần query độc lập. Thực tế em hay dùng pattern **extended reference** — reference kèm copy vài field hay hiển thị như customerName vào order — chấp nhận denormalize có kiểm soát để màn hình list không phải `$lookup`, đổi lại phải nhớ sync khi field gốc đổi."

---

## Câu 4: MongoDB aggregation pipeline là gì? `[Intermediate]`

### Câu hỏi

> Aggregation pipeline trong MongoDB là gì? Em mô tả các stage phổ biến và cho ví dụ một pipeline thực tế?

### Giải thích lý thuyết

**Aggregation pipeline** là cách MongoDB xử lý dữ liệu qua **chuỗi các stage** — document đi qua từng stage, mỗi stage biến đổi rồi chuyền tiếp (giống pipe `|` trong Unix). Đây là "GROUP BY + JOIN + transform" của MongoDB.

Các stage phổ biến:

| Stage | Tương đương SQL | Chức năng |
| ----- | --------------- | --------- |
| `$match` | WHERE | Lọc document — **đặt đầu pipeline để dùng index** |
| `$group` | GROUP BY | Gom nhóm + aggregate (`$sum`, `$avg`, `$push`) |
| `$sort` / `$limit` / `$skip` | ORDER BY / LIMIT | Sắp xếp, phân trang |
| `$project` / `$addFields` | SELECT expression | Chọn/tính field mới |
| `$lookup` | LEFT JOIN | Join sang collection khác |
| `$unwind` | — | Tách array thành từng document |
| `$facet` | — | Nhiều pipeline con song song (vd: data + count tổng) |

Điểm performance quan trọng: **`$match` và `$sort` đặt càng sớm càng tốt** — chỉ stage đầu pipeline tận dụng được index; `$lookup` trên collection lớn không index là thảm hoạ.

### Code minh hoạ

```js
// Doanh thu theo tháng + top sản phẩm, chỉ tính đơn hoàn thành năm 2026
db.orders.aggregate([
  // 1. Lọc sớm — stage này dùng được index trên { status, createdAt }
  { $match: { status: "completed", createdAt: { $gte: ISODate("2026-01-01") } } },

  // 2. Tách array items thành từng document
  { $unwind: "$items" },

  // 3. Gom nhóm theo tháng + sản phẩm
  {
    $group: {
      _id: {
        month: { $dateTrunc: { date: "$createdAt", unit: "month" } },
        productId: "$items.productId",
      },
      revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
      orders: { $sum: 1 },
    },
  },

  // 4. Join lấy tên sản phẩm
  {
    $lookup: {
      from: "products",
      localField: "_id.productId",
      foreignField: "_id",
      as: "product",
    },
  },

  { $sort: { revenue: -1 } },
  { $limit: 10 },
]);
```

### Đáp án mẫu

> "Aggregation pipeline là chuỗi stage xử lý document tuần tự như pipe trong Unix — đây là GROUP BY cộng JOIN cộng transform của MongoDB. Các stage em dùng nhiều nhất: `$match` tương đương WHERE, `$group` với `$sum`/`$avg` tương đương GROUP BY, `$lookup` là left join, `$unwind` tách array thành từng document, `$project` chọn field, và `$facet` chạy nhiều pipeline con song song — tiện cho API trả cả data lẫn total count một lần. Quy tắc performance số một: `$match` đặt đầu pipeline vì chỉ ở đó nó tận dụng được index — `$match` sau `$group` là quét cả collection; và `$lookup` sang collection lớn thì foreign field bắt buộc có index. Pipeline phức tạp em luôn kiểm tra bằng `.explain()` y như EXPLAIN bên SQL."

---

## Câu 5: So sánh MongoDB và PostgreSQL — khi nào chọn cái nào? `[Senior]`

### Câu hỏi

> Team đang thiết kế hệ thống mới và tranh luận MongoDB vs PostgreSQL. Em phân tích và đưa tiêu chí chọn thế nào?

### Giải thích lý thuyết

So sánh theo các trục quan trọng:

| Trục | PostgreSQL | MongoDB |
| ---- | ---------- | ------- |
| Mô hình | Relational + JSONB | Document (BSON) |
| Schema | Cứng, DB enforce — data integrity cao | Linh hoạt, app enforce |
| Quan hệ & JOIN | JOIN mạnh, FK constraint | `$lookup` hạn chế, không FK |
| Transaction | ACID đầy đủ, mạnh | Có từ 4.0 nhưng đắt hơn, giới hạn hơn |
| Scale | Vertical + read replica; sharding cần tool (Citus) | Replica set + sharding native |
| Query đặc thù | SQL, window function, CTE, extension (PostGIS, pgvector) | Aggregation pipeline |
| Phù hợp | Dữ liệu quan hệ, tài chính, report phức tạp | Dữ liệu bán cấu trúc, schema đổi nhanh, write scale lớn |

Tiêu chí quyết định thực dụng:

- **Chọn PostgreSQL khi**: dữ liệu có quan hệ rõ (user-order-payment), cần integrity (tiền bạc, tồn kho), report/analytics phức tạp, team quen SQL. **JSONB cho phần bán cấu trúc** — Postgres làm được 80% việc của Mongo.
- **Chọn MongoDB khi**: dữ liệu thực sự document-shaped (catalog sản phẩm trăm loại attribute khác nhau, CMS, event/log), schema tiến hoá liên tục, cần shard write scale từ ngày đầu.
- **Default an toàn của ngành hiện nay: PostgreSQL** — vì sai lầm "chọn Mongo rồi phát hiện dữ liệu đầy quan hệ, phải tự viết JOIN trong code" đắt hơn nhiều sai lầm ngược lại.

### Code minh hoạ

```sql
-- PostgreSQL JSONB: linh hoạt như document NHƯNG vẫn có FK, transaction, JOIN
CREATE TABLE products (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category_id BIGINT NOT NULL REFERENCES categories(id),  -- integrity DB enforce
  name TEXT NOT NULL,
  attrs JSONB NOT NULL DEFAULT '{}'                       -- phần schema linh hoạt
);

CREATE INDEX idx_products_attrs ON products USING GIN (attrs);

-- Query trộn relational + document
SELECT p.name, c.name AS category, p.attrs->>'color' AS color
FROM products p
JOIN categories c ON c.id = p.category_id
WHERE p.attrs @> '{"size": "XL"}';
```

### Đáp án mẫu

> "Em so theo bốn trục: **integrity** — Postgres enforce schema và foreign key ở DB, Mongo đẩy trách nhiệm lên app; **quan hệ** — Postgres JOIN mạnh, Mongo `$lookup` hạn chế; **transaction** — Postgres ACID trọn vẹn, Mongo có nhưng đắt; **scale** — Mongo sharding native, Postgres scale vertical cộng read replica là chính. Tiêu chí chọn của em: dữ liệu có quan hệ rõ và đụng đến tiền hay tồn kho → Postgres không bàn cãi; dữ liệu thực sự document-shaped như catalog với hàng trăm attribute khác nhau, hoặc cần shard write từ ngày đầu → Mongo. Điểm em luôn nêu trong tranh luận: Postgres có JSONB với GIN index — cho phần bán cấu trúc nó làm được 80% việc của Mongo mà vẫn giữ transaction và JOIN. Nên default của em là Postgres, chỉ rời đi khi có lý do đo đếm được — vì chọn nhầm Mongo cho dữ liệu quan hệ nghĩa là tự viết JOIN trong application code, đắt hơn nhiều chiều ngược lại."

---

## Câu 6: Redis là gì? Use cases phổ biến? `[Intermediate]`

### Câu hỏi

> Redis là gì? Tại sao nhanh? Em kể các use case phổ biến và data structure tương ứng?

### Giải thích lý thuyết

**Redis** (REmote DIctionary Server) là **in-memory data store** dạng key-value, nhưng giá trị không chỉ là string mà là **rich data structures**. Nhanh vì: dữ liệu nằm **hoàn toàn trong RAM** (không disk I/O trên đường đọc), event loop **single-threaded** xử lý command tuần tự (không lock contention, mỗi command atomic), giao thức RESP tối giản. Throughput thực tế: hàng trăm nghìn ops/giây trên một node.

Use cases gắn với data structure:

| Use case | Data structure | Command tiêu biểu |
| -------- | -------------- | ------------------ |
| **Cache** | String (+TTL) | `SET key val EX 300`, `GET` |
| **Session store** | String/Hash + TTL | `HSET session:x ...` |
| **Rate limiting** | String counter | `INCR` + `EXPIRE` |
| **Leaderboard / ranking** | Sorted Set | `ZADD`, `ZRANGE ... REV` |
| **Queue / job** | List, Stream | `LPUSH`/`BRPOP`, `XADD` |
| **Pub/Sub** | Pub/Sub channel | `PUBLISH`/`SUBSCRIBE` |
| **Distributed lock** | String + NX | `SET lock val NX EX 10` |
| **Đếm unique xấp xỉ** | HyperLogLog | `PFADD`, `PFCOUNT` |

Persistence (hay bị hỏi xoáy "RAM thì mất điện sao?"): **RDB** (snapshot định kỳ) và **AOF** (append-only log từng lệnh) — nhưng triết lý đúng là coi Redis là **tầng tăng tốc**, không phải source of truth.

### Code minh hoạ

```js
// Node.js (ioredis) — các use case tiêu biểu
import Redis from "ioredis";
const redis = new Redis(process.env.REDIS_URL);

// 1. Cache với TTL
await redis.set(`user:${id}`, JSON.stringify(user), "EX", 300);

// 2. Rate limit: 100 request / phút / user
const key = `rate:${userId}:${Math.floor(Date.now() / 60000)}`;
const count = await redis.incr(key);
if (count === 1) await redis.expire(key, 60);
if (count > 100) throw new TooManyRequestsError();

// 3. Leaderboard
await redis.zincrby("leaderboard:weekly", score, `player:${playerId}`);
const top10 = await redis.zrange("leaderboard:weekly", 0, 9, "REV", "WITHSCORES");

// 4. Distributed lock (đơn giản)
const acquired = await redis.set(`lock:order:${orderId}`, workerId, "NX", "EX", 10);
if (!acquired) return; // worker khác đang xử lý
```

### Đáp án mẫu

> "Redis là in-memory data store với rich data structure — nhanh vì toàn bộ data trong RAM, event loop single-threaded nên không lock contention và mỗi command tự atomic, đạt hàng trăm nghìn ops mỗi giây một node. Use case em dùng thường xuyên: **cache** với TTL; **session store**; **rate limiting** bằng INCR cộng EXPIRE; **leaderboard** bằng sorted set — bài toán mà SQL làm rất đắt; **queue** bằng list hoặc stream; **pub/sub** cho real-time; và **distributed lock** bằng SET NX. Về độ bền có RDB snapshot và AOF log, nhưng triết lý của em: Redis là tầng tăng tốc, không phải source of truth — dữ liệu mất được phép tính lại từ DB chính. Chọn data structure đúng là kỹ năng chính khi dùng Redis — sorted set cho ranking thay vì tự sort trong app là ví dụ điển hình."

---

## Câu 7: Khi nào nên dùng Redis làm cache? `[Senior]`

### Câu hỏi

> Khi nào nên (và không nên) thêm Redis cache vào hệ thống? Em trình bày các caching pattern và vấn đề cache invalidation, cache stampede?

### Giải thích lý thuyết

**Nên cache khi** hội đủ: dữ liệu **đọc nhiều ghi ít** (read-heavy), tính toán/query gốc **đắt**, và chấp nhận được **staleness** trong một khoảng TTL. Ví dụ: config, catalog, profile, kết quả report.

**Không nên / cẩn trọng khi**: dữ liệu cần chính xác tuyệt đối từng millisecond (số dư tài khoản khi trừ tiền), ghi nhiều đọc ít, hit rate thấp (cache chỉ thêm độ trễ + độ phức tạp), hoặc khi **query chậm do thiếu index** — fix index trước, đừng lấy cache che bệnh.

Các pattern chính:

- **Cache-aside (lazy loading)** — phổ biến nhất: app đọc cache → miss thì đọc DB → ghi vào cache với TTL. Khi data đổi: **xoá key** (invalidate), để lần đọc sau tự nạp.
- **Write-through**: ghi DB đồng thời ghi cache — cache luôn ấm, nhưng ghi chậm hơn.
- **Write-behind**: ghi cache trước, flush DB async — nhanh nhất nhưng rủi ro mất data.

Hai vấn đề kinh điển phải nói:

1. **Cache invalidation**: ưu tiên **delete-on-write + TTL làm lưới an toàn** (TTL ngắn cho data hay đổi). Tránh "update cache on write" vì dễ race condition ghi đè data cũ.
2. **Cache stampede**: key hot hết hạn → hàng nghìn request cùng dồn xuống DB. Giải pháp: **lock/single-flight** (chỉ 1 request rebuild, số còn lại chờ), TTL có **jitter** (tránh nhiều key hết hạn cùng lúc), hoặc serve-stale-while-refresh.

### Code minh hoạ

```ts
// Cache-aside + chống stampede bằng single-flight lock
async function getProduct(id: string): Promise<Product> {
  const cacheKey = `product:${id}`;

  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Chống stampede: chỉ 1 request được quyền rebuild
  const gotLock = await redis.set(`${cacheKey}:lock`, "1", "NX", "EX", 5);
  if (!gotLock) {
    await sleep(100); // chờ request đang rebuild
    return getProduct(id); // retry — thường hit cache luôn
  }

  try {
    const product = await db.product.findUniqueOrThrow({ where: { id } });
    const ttl = 300 + Math.floor(Math.random() * 60); // jitter: tránh hết hạn đồng loạt
    await redis.set(cacheKey, JSON.stringify(product), "EX", ttl);
    return product;
  } finally {
    await redis.del(`${cacheKey}:lock`);
  }
}

// Invalidate khi ghi: xoá key, KHÔNG update cache (tránh race)
async function updateProduct(id: string, data: UpdateProductDto) {
  const product = await db.product.update({ where: { id }, data });
  await redis.del(`product:${id}`);
  return product;
}
```

### Đáp án mẫu

> "Em cache khi hội đủ ba điều kiện: đọc nhiều ghi ít, nguồn gốc đắt, và chấp nhận staleness trong TTL. Em **không** cache khi data cần chính xác tuyệt đối như số dư lúc trừ tiền, khi hit rate thấp, và đặc biệt khi query chậm chỉ vì thiếu index — phải fix index trước chứ không lấy cache che bệnh. Pattern mặc định là **cache-aside**: miss thì đọc DB rồi set cache với TTL; khi ghi thì **xoá key** chứ không update cache để tránh race ghi đè data cũ — TTL đóng vai trò lưới an toàn cuối. Hai vấn đề phải xử lý ở scale: **stampede** — key hot hết hạn làm nghìn request dồn xuống DB, em chống bằng single-flight lock cộng TTL có jitter; và **consistency** — chấp nhận eventual trong TTL ngắn, dữ liệu nào không chấp nhận được thì đơn giản là không cache. Kinh nghiệm: cache hit rate phải được monitor — cache mà hit 30% là đang trả phí phức tạp vô ích."
