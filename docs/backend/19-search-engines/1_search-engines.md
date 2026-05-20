---
sidebar_position: 1
title: "1. Search Engines: Elasticsearch, Meilisearch, Typesense"
---

# Search Engines: Elasticsearch, Meilisearch, Typesense

---

## Mục lục

- [Tại sao cần search engine riêng?](#tại-sao-cần-search-engine-riêng)
- [Elasticsearch](#elasticsearch)
- [Meilisearch](#meilisearch)
- [Typesense](#typesense)
- [Postgres full-text search](#postgres-full-text-search)
- [Lựa chọn](#lựa-chọn)

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
