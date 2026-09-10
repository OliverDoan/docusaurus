---
sidebar_position: 1
title: "1. Search Engines: Elasticsearch, Meilisearch, Typesense"
---

# Search Engines: Elasticsearch, Meilisearch, Typesense

Search engine là công cụ chuyên đi tìm kiếm văn bản, giúp người dùng gõ vài chữ là ra kết quả đúng ý dù gõ sai chính tả, nhanh hơn nhiều so với câu lệnh tìm kiếm thường của database. Nó quan trọng với các trang web cần ô tìm kiếm tốt như bán hàng hay tra cứu tài liệu. Bài này giới thiệu các lựa chọn như Elasticsearch, Meilisearch, Typesense; phần chi tiết nằm bên dưới.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Search engine dùng `inverted index`** — tìm kiếm text trong mili-giây, chấp nhận typo (fuzzy), có relevance ranking (`BM25`, `TF-IDF`) — vượt xa SQL `LIKE '%query%'`.
- **`Elasticsearch`** — mature nhất, mạnh analytics + vector search, nhưng nặng RAM (JVM) và phức tạp vận hành.
- **`Meilisearch` / `Typesense`** — nhẹ, dễ deploy, typo-tolerant sẵn, hợp search UI consumer-facing.
- **Postgres full-text search** (thêm `pg_trgm` cho fuzzy) đủ cho nhiều case nếu đã có Postgres.
- ⭐ **Nguồn sự thật là DB** — sync sang search engine qua CDC/batch; search chỉ để tìm, còn detail vẫn lấy từ Postgres.

:::

---

## Mục lục

- [Tại sao cần search engine riêng?](#tại-sao-cần-search-engine-riêng)
- [Elasticsearch](#elasticsearch)
- [Meilisearch](#meilisearch)
- [Typesense](#typesense)
- [Postgres full-text search](#postgres-full-text-search)
- [Lựa chọn](#lựa-chọn)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Tại sao cần search engine riêng?

SQL `LIKE '%query%'`:

- **Slow** trên dataset lớn (no index).
- **Không hiểu typo, synonym, fuzzy**.
- **Không relevance ranking**.

Search engine:

- **Inverted index** — query trong ms.
- **Fuzzy** — chấp nhận typo.
- **Relevance scoring** (BM25, TF-IDF).
- **Synonym, stemming**.
- **Highlight**, faceted search, autocomplete.

:::tip[Ví dụ đời thường]

Thư viện 100.000 cuốn, bạn cần tìm sách nào có nhắc tới "cà phê".

- **SQL `LIKE '%cà phê%'`** — bê từng cuốn xuống, **đọc lướt từ trang đầu tới trang cuối**. Sách càng nhiều càng lâu, và index thường của DB cũng chịu, vì bạn tìm chữ nằm **giữa câu**.
- **`Inverted index`** — thư viện làm sẵn **hộp phiếu tra từ khoá**: mỗi từ một tấm phiếu, trên phiếu ghi "từ này có trong cuốn 12, 87, 340". Rút đúng tấm phiếu "cà phê" là ra danh sách ngay.

Gọi là "ngược" vì thay vì đi từ sách ra chữ, nó đi từ **chữ ra sách**.

Cái giá phải trả: hộp phiếu phải **làm trước và tốn chỗ**, mỗi lần nhập sách mới lại phải viết thêm phiếu — nên nó luôn **trễ hơn kho sách thật một nhịp**.

:::

---

## Elasticsearch

**Phổ biến nhất**, mature, scale.

```ts
import { Client } from "@elastic/elasticsearch";

const client = new Client({ node: "http://localhost:9200" });

// Index document
await client.index({
  index: "products",
  document: {
    name: "iPhone 15",
    description: "Latest Apple smartphone",
    price: 1000,
    category: "phones",
  },
});

// Search
const result = await client.search({
  index: "products",
  query: {
    multi_match: {
      query: "iphone",
      fields: ["name^3", "description"],
      fuzziness: "AUTO",
    },
  },
});
```

**Features**:

- Full-text search + relevance.
- Aggregation (analytics).
- Geospatial.
- Vector search (cho semantic + RAG).
- Cluster + shard.

:::tip[Ví dụ đời thường]

Tìm ra 500 kết quả là chuyện dễ; xếp cái nào lên đầu mới khó. Relevance scoring (`BM25`) chấm điểm theo mấy lẽ rất đời:

- **Từ hiếm đáng giá hơn từ phổ biến** — trong "áo thun cotton", chữ "cotton" phân biệt tốt hơn chữ "áo" nên được tính nặng ký hơn.
- **Trúng ở chỗ quan trọng thì cộng thêm** — trúng ở **tên** sản phẩm giá trị hơn trúng ở đoạn mô tả dài dòng, đó chính là ý nghĩa của `name^3` (nhân ba điểm).
- **Nhắc nhiều lần thì cộng, nhưng cộng ít dần** — lặp 20 lần không có nghĩa là đúng ý gấp 20 lần.

Giống người bán hàng lâu năm: nghe khách tả vài chữ là biết **lôi món nào ra trước**.

:::

**Use case**:

- E-commerce product search.
- Log aggregation (ELK stack).
- Analytics dashboard.
- Vector search.

Trade-off:

- **Memory hungry** (Java JVM).
- **Operational complexity**.
- **License changed** 2021 → fork **OpenSearch**.

---

## Meilisearch

**Open source, modern**, search-first.

```ts
import { MeiliSearch } from "meilisearch";

const client = new MeiliSearch({ host: "http://localhost:7700" });
const index = client.index("products");

await index.addDocuments([
  { id: 1, name: "iPhone 15", price: 1000 },
]);

const result = await index.search("iphon", { limit: 20 });
```

**Đặc điểm**:

- **Out-of-the-box** — defaults tốt.
- **Typo-tolerant** built-in.
- **Fast** — sub-50ms typical.
- **Easy** API.
- **Rust** — low memory.

:::tip[Ví dụ đời thường]

Khách gõ "iphon" mà kho chỉ có "iPhone". Máy so chuỗi thì hai từ này **khác nhau**, coi như không có gì.

Typo-tolerant (fuzzy) là kiểu **người bán hàng quen nghe khách nói ngọng**: nó đếm xem cần **sửa mấy ký tự** để biến từ khách gõ thành từ trong kho — thêm một chữ, bớt một chữ, hay đổi một chữ. Sai một hai ký tự thì vẫn coi là trúng.

Cái giá phải trả: càng dễ dãi thì càng ra **kết quả rác** ("sách" cũng gần với "sạch") và càng chậm. Nên các engine thường chỉ tha thứ theo độ dài: từ ngắn tha ít, từ dài tha nhiều hơn.

:::

**Phù hợp**:

- Search UI consumer-facing.
- Project nhỏ-vừa.
- Cần fast time-to-search.

Trade-off: ít feature analytics so Elasticsearch.

---

## Typesense

**Alternative Meilisearch** — C++ written.

```ts
import Typesense from "typesense";

const client = new Typesense.Client({
  nodes: [{ host: "localhost", port: "8108", protocol: "http" }],
  apiKey: "xyz",
});

await client.collections("products").documents().create({
  id: "1",
  name: "iPhone 15",
  price: 1000,
});

const result = await client.collections("products").documents().search({
  q: "iphon",
  query_by: "name,description",
});
```

So với Meilisearch: similar feature, performance vài % khác. **Cloud hosted**
có sẵn (typesense.org).

---

## Postgres full-text search

:::tip[Ví dụ đời thường]

Postgres cũng biết tự làm hộp phiếu tra từ khoá cho riêng mình. Cột `tsvector` chính là **bản rút gọn của câu văn**: nó băm câu ra từng từ, bỏ mấy từ vô nghĩa ("the", "và"), rồi **quy các biến thể về một gốc** — "running", "ran", "runs" đều ghi thành "run". Nhờ vậy khách gõ thể nào cũng ra.

Cái giá phải trả: bản rút gọn đó phải **dựng sẵn và cập nhật lại mỗi lần sửa dữ liệu**, và nó chỉ khớp theo **từ nguyên vẹn** — gõ sai chính tả là chịu, muốn tha lỗi thì phải gắn thêm `pg_trgm`.

:::

Nếu đã có Postgres, FTS built-in **đủ cho nhiều case**:

```sql
-- Tạo column tsvector
ALTER TABLE products ADD COLUMN search_vector tsvector;

-- Index
CREATE INDEX idx_products_search ON products USING GIN(search_vector);

-- Update khi insert/update
UPDATE products SET search_vector =
  to_tsvector('english', name || ' ' || description);

-- Search
SELECT *, ts_rank(search_vector, query) AS rank
FROM products, plainto_tsquery('english', 'iphone smartphone') query
WHERE search_vector @@ query
ORDER BY rank DESC
LIMIT 20;
```

**Features**:

- Stemming + stop word.
- Multiple language.
- Weight (heading > body).
- Ranking BM25-like.

**Trade-off**:

- Ít fuzzy / typo-tolerant (cần `pg_trgm` extension).
- Không faceted search built-in.
- Performance OK đến **vài chục triệu row**.

**`pg_trgm`** thêm fuzzy:

```sql
CREATE EXTENSION pg_trgm;
CREATE INDEX idx_products_name_trgm ON products USING GIN(name gin_trgm_ops);

SELECT * FROM products
WHERE name % 'iphn'    -- similar (trigram)
ORDER BY similarity(name, 'iphn') DESC;
```

---

## Lựa chọn

```
Project size?

├─ Nhỏ-vừa, đã có Postgres?
│  └─ Postgres FTS + pg_trgm
│
├─ Search UI consumer-facing, easy to deploy?
│  └─ Meilisearch / Typesense
│
├─ Enterprise, analytics + search?
│  └─ Elasticsearch / OpenSearch
│
├─ AI / RAG vector search?
│  └─ pgvector / Pinecone / Qdrant
│
└─ Managed cheap?
   └─ Algolia (paid), Typesense Cloud, Meilisearch Cloud
```

:::tip[Mẹo]

**Algolia** — managed search SaaS, pricing per request:

- Setup 5 phút.
- Sub-10ms latency global CDN.
- UI library mạnh (Instant Search).
- Expensive khi scale.

Use case: e-commerce site cần search UI nhanh, ít dev resource.

Cộng đồng đang chuyển dần sang **Meilisearch/Typesense Cloud** vì pricing
predictable hơn.

:::

:::info[Phân tích]

**Search workflow chuẩn**:

```
1. Source of truth: PostgreSQL.
2. Sync to search engine:
   - Real-time: CDC (Debezium → Kafka → Meilisearch).
   - Batch: nightly reindex.
   - Manual: on write (trigger reindex).
3. App query search engine cho list.
4. App fetch detail từ Postgres khi user click.
```

**Sync strategy**:

```ts
// On write
async function createProduct(data) {
  const product = await db.product.create({ data });

  // Async index vào search
  await meilisearch.index("products").addDocuments([
    { id: product.id, name: product.name, price: product.price },
  ]);

  return product;
}

// Hoặc qua event/job queue
await queue.add("reindex-product", { productId });
```

Đừng: query search engine cho mọi data needed. Search engine **search**,
DB **detail + transaction**.

:::

:::warning[Cần lưu ý]

**Search consistency**:

- Search index thường **eventually consistent** với DB.
- User vừa tạo product → có thể chưa search ra ngay (vài giây sync).
- UX: confirm "Product created" thay vì show "available for search".

Cẩn thận:

- **Delete in DB → delete in search**.
- **Update in DB → reindex**.
- **Failed sync** → reconciliation job định kỳ.

Pattern: **CDC (Change Data Capture)** với Debezium → Kafka → consumer
update search → đảm bảo eventual consistency.

:::

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi đối chiếu lại với nội dung phía trên.

1. Vì sao `LIKE '%query%'` không tận dụng được index và chậm dần trên dataset lớn?
2. `inverted index` được xây dựng ra sao, và vì sao nó tra một từ nhanh hơn hẳn việc quét bảng?
3. Pipeline `analyzer` gồm những bước nào (`character filter`, `tokenizer`, `token filter`)? `stemming` và `stop word` ảnh hưởng gì tới kết quả tìm kiếm?
4. Vì sao analyzer lúc index và lúc query phải khớp nhau? Không khớp thì hiện tượng gì xảy ra?
5. `mapping` trong Elasticsearch là gì? Field kiểu `text` khác `keyword` ra sao và mỗi loại dùng cho việc gì?
6. Elasticsearch chấm điểm liên quan bằng `BM25` dựa trên những yếu tố nào? Boost kiểu `name^3` tác động thế nào tới điểm?
7. Vì sao lặp một từ 20 lần không làm điểm tăng gấp 20? Giải thích `TF saturation` và chuẩn hoá theo độ dài tài liệu trong BM25.
8. `shard` và `replica` khác nhau ra sao? Tăng replica giúp được gì, tăng shard giúp được gì?
9. Một truy vấn chạy qua cluster theo trình tự nào — `coordinating node` fan-out tới các shard rồi gộp kết quả thế nào?
10. Vì sao chia quá nhiều shard cho lượng dữ liệu nhỏ lại phản tác dụng? Nêu cả ảnh hưởng lên điểm relevance.
11. Elasticsearch là `near real-time` — `refresh interval` nghĩa là gì và vì sao document vừa ghi chưa tìm thấy được ngay?
12. Phân biệt `query context` và `filter context`. Vì sao filter được cache còn query thì không?
13. So sánh `Elasticsearch`, `Meilisearch` và `Typesense` về độ nặng vận hành, tính năng và trường hợp nên dùng.
14. Postgres full-text search (`tsvector`, `GIN index`, `pg_trgm`) làm được tới đâu? Khi nào nó đủ dùng và khi nào phải chuyển sang search engine riêng?
15. Bạn đồng bộ dữ liệu từ database sang search engine bằng cách nào? So sánh dual write, batch job và `CDC` (Debezium).
16. Nguồn sự thật nên nằm ở đâu và vì sao? Xử lý thế nào khi dữ liệu bên search engine lệch so với DB?
17. Thiết kế autocomplete và chấp nhận gõ sai (`fuzziness`, `n-gram`, `edge n-gram`) cần cân nhắc gì giữa độ chính xác và kích thước index?
