---
sidebar_position: 1
title: "1. Search Engines: Elasticsearch, Meilisearch, Typesense"
---

# Search Engines: Elasticsearch, Meilisearch, Typesense

Search engine là công cụ chuyên đi tìm kiếm văn bản, giúp người dùng gõ vài chữ là ra kết quả đúng ý dù gõ sai chính tả, nhanh hơn nhiều so với câu lệnh tìm kiếm thường của database. Nó quan trọng với các trang web cần ô tìm kiếm tốt như bán hàng hay tra cứu tài liệu. Bài này giới thiệu các lựa chọn như Elasticsearch, Meilisearch, Typesense; phần chi tiết nằm bên dưới.

[![Sơ đồ tóm tắt bài: Search Engines: Elasticsearch, Meilisearch, Typesense](/img/backend/search-engines.webp)](pathname:///img/backend/search-engines.webp)

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

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Vì sao `LIKE '%query%'` không tận dụng được index và chậm dần trên dataset lớn?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì wildcard nằm ở **đầu** chuỗi. B-tree index trên cột text được sắp theo thứ tự từ ký tự đầu tiên, nên chỉ dùng được khi biết phần đầu — `LIKE 'iphone%'` thì tra được, còn `LIKE '%query%'` thì database không có cách nào nhảy vào đúng vị trí và buộc phải **sequential scan**: đọc từng row, so từng chuỗi.

Chi phí vì thế tuyến tính theo số dòng nhân với độ dài chuỗi — đúng kiểu bê từng cuốn sách xuống đọc lướt từ trang đầu tới trang cuối. Dữ liệu tăng gấp đôi thì thời gian tăng gấp đôi.

Ngoài chậm, `LIKE` còn dở về chất lượng: chỉ khớp chuỗi ký tự thô, không hiểu typo, không hiểu từ đồng nghĩa, không biết "running" cùng gốc với "run", và không có điểm relevance nên không biết xếp kết quả nào lên đầu.

</details>

**2. `inverted index` được xây dựng ra sao, và vì sao nó tra một từ nhanh hơn hẳn việc quét bảng?**

<details className="qa">
<summary>Xem đáp án</summary>

Index thông thường đi từ **tài liệu ra chữ**; `inverted index` đi ngược lại, từ **chữ ra tài liệu** — nên mới gọi là "ngược".

Khi index một document, engine chạy analyzer để cắt văn bản thành token (hạ chữ thường, bỏ stop word, đưa về từ gốc), rồi với mỗi token ghi vào một **posting list** — danh sách document id chứa token đó, thường kèm tần suất và vị trí. Cấu trúc y hệt hộp phiếu tra từ khoá của thư viện: mỗi từ một tấm phiếu ghi "từ này có trong cuốn 12, 87, 340".

Lúc tìm kiếm, engine tra từ điển term để lấy đúng posting list rồi giao hoặc hợp các danh sách. Chi phí tỉ lệ với số document **thực sự chứa từ đó**, không phải toàn bộ bảng.

Cái giá: index phải dựng trước, tốn dung lượng, và mỗi lần dữ liệu đổi lại phải cập nhật nên luôn trễ hơn nguồn một nhịp.

</details>

**3. Pipeline `analyzer` gồm những bước nào (`character filter`, `tokenizer`, `token filter`)? `stemming` và `stop word` ảnh hưởng gì tới kết quả tìm kiếm?**

<details className="qa">
<summary>Xem đáp án</summary>

`analyzer` chạy ba chặng theo thứ tự:

- `character filter` — xử lý ở mức ký tự **trước khi cắt từ**: bỏ thẻ HTML, thay ký tự, chuẩn hoá dấu.
- `tokenizer` — cắt chuỗi thành token, thường theo khoảng trắng và dấu câu. Mỗi analyzer có đúng một tokenizer.
- `token filter` — biến đổi danh sách token: hạ chữ thường, bỏ `stop word`, `stemming`, mở rộng synonym, bỏ dấu.

`stemming` quy các biến thể về một gốc ("running", "ran", "runs" đều thành "run") nên người dùng gõ thể nào cũng ra — tăng recall. Đổi lại đôi khi cắt quá tay khiến hai từ khác nghĩa chung một gốc, làm giảm precision.

`stop word` loại những từ quá phổ biến ("the", "và") để index nhỏ hơn và điểm số bớt nhiễu. Tác dụng phụ: cụm mà từ khoá chính lại là stop word thì tìm không ra.

</details>

**4. Vì sao analyzer lúc index và lúc query phải khớp nhau? Không khớp thì hiện tượng gì xảy ra?**

<details className="qa">
<summary>Xem đáp án</summary>

Việc so khớp diễn ra ở mức **token đã chuẩn hoá**, không phải chuỗi gốc. Analyzer chạy ở cả hai phía: lúc index để sinh token lưu vào inverted index, lúc query để biến chuỗi người dùng gõ thành token đi tra.

Nếu hai bên không khớp, token sinh ra khác nhau nên tra không trúng phiếu nào — kết quả là **rỗng hoặc thiếu rất nhiều**, dù dữ liệu rõ ràng nằm trong index. Ví dụ index hạ chữ thường và stem "Running" thành "run", còn query không hạ chữ thường thì "Running" sẽ không khớp "run".

Có vài trường hợp cố tình để khác nhau bằng `search_analyzer` riêng: không mở rộng synonym ở phía query, hoặc chỉ sinh edge n-gram ở phía index cho autocomplete. Ngoài các trường hợp có chủ đích đó, đổi analyzer của một field đã có dữ liệu thì bắt buộc phải **reindex** lại toàn bộ.

</details>

**5. `mapping` trong Elasticsearch là gì? Field kiểu `text` khác `keyword` ra sao và mỗi loại dùng cho việc gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`mapping` là lược đồ của index: khai báo mỗi field kiểu gì, dùng analyzer nào, có index hay không. Không khai báo thì ES tự đoán (dynamic mapping) — tiện nhưng dễ đoán sai, mà kiểu field đã tạo thì không sửa được, phải reindex.

| Tiêu chí | `text` | `keyword` |
|---|---|---|
| Xử lý | Chạy qua analyzer, cắt thành token | Lưu **nguyên chuỗi**, không phân tích |
| Dùng cho | Full-text search, khớp một phần, tính relevance | Lọc chính xác, aggregation, sort |
| Ví dụ | Tên và mô tả sản phẩm | Mã SKU, status, tên category, tag |

Vì `text` bị cắt nhỏ nên lọc chính xác hay group theo nó sẽ ra kết quả sai; ngược lại `keyword` không tìm được theo một phần câu.

Thực tế hay khai cả hai cho cùng một field (multi-field): `name` kiểu text để tìm kiếm, `name.keyword` để sort và facet theo đúng giá trị gốc.

</details>

**6. Elasticsearch chấm điểm liên quan bằng `BM25` dựa trên những yếu tố nào? Boost kiểu `name^3` tác động thế nào tới điểm?**

<details className="qa">
<summary>Xem đáp án</summary>

`BM25` chấm điểm dựa trên ba yếu tố:

- **Term frequency** — từ khoá xuất hiện càng nhiều trong document thì điểm càng cao, nhưng tăng chậm dần.
- **Inverse document frequency** — từ càng **hiếm** trong toàn bộ tập dữ liệu thì càng đáng giá. Trong "áo thun cotton", chữ "cotton" phân biệt tốt hơn chữ "áo" nên nặng ký hơn.
- **Độ dài document** — cùng số lần xuất hiện, document ngắn được coi là đậm đặc hơn document dài lê thê.

Boost kiểu `name^3` **nhân hệ số cho phần đóng góp của field đó**: trúng ở tên sản phẩm được tính gấp ba so với trúng ở description. Nó không thay đổi cách BM25 tính bên trong từng field, chỉ đổi trọng số khi gộp điểm các field trong một `multi_match`.

Điểm cuối cùng quyết định thứ tự trả về — tìm ra 500 kết quả là chuyện dễ, xếp cái nào lên đầu mới khó.

</details>

**7. Vì sao lặp một từ 20 lần không làm điểm tăng gấp 20? Giải thích `TF saturation` và chuẩn hoá theo độ dài tài liệu trong BM25.**

<details className="qa">
<summary>Xem đáp án</summary>

Trực giác: từ khoá xuất hiện lần thứ hai bổ sung nhiều thông tin so với lần thứ nhất, nhưng lần thứ hai mươi thì gần như chẳng thêm gì — rất có thể chỉ là nhồi từ khoá.

`TF saturation`: BM25 không dùng tần suất thô mà đưa qua một hàm bão hoà dạng `tf / (tf + k1)`. Đường cong tăng nhanh lúc đầu rồi phẳng dần và tiến tới một trần, nên phần đóng góp của lần xuất hiện thứ n giảm dần. Tham số `k1` quyết định bão hoà nhanh hay chậm.

Chuẩn hoá độ dài: BM25 còn so độ dài document với độ dài trung bình và phạt document dài (tham số `b`). Lý do là một bài 10.000 chữ dễ dàng chứa từ khoá vài chục lần mà chẳng nói về chủ đề đó, trong khi một tiêu đề ngắn chứa đúng từ khoá thì rõ ràng liên quan hơn.

Hai cơ chế này giúp BM25 bền trước spam và ưu tiên tài liệu thực sự tập trung vào truy vấn.

</details>

**8. `shard` và `replica` khác nhau ra sao? Tăng replica giúp được gì, tăng shard giúp được gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`shard` là mảnh dữ liệu: một index được chia thành nhiều primary shard, mỗi shard là một index Lucene độc lập nằm trên một node. `replica` là **bản sao của primary shard**, luôn đặt trên node khác với primary.

| Tiêu chí | Tăng shard | Tăng replica |
|---|---|---|
| Mục đích | Chia nhỏ dữ liệu, scale ghi và dung lượng | Dự phòng và scale đọc |
| Lợi ích | Truy vấn chạy song song trên nhiều node, chứa được nhiều dữ liệu hơn | Chịu được node chết, tăng throughput truy vấn vì replica cũng phục vụ search |
| Đổi sau khi tạo | Khó, thường phải reindex | Dễ, chỉnh động được |

Nói gọn: shard giải bài toán "dữ liệu quá lớn cho một node", replica giải bài toán "cần chịu lỗi và phục vụ nhiều truy vấn cùng lúc". Replica không làm ghi nhanh hơn, ngược lại còn tốn thêm vì mỗi lần ghi phải nhân bản.

</details>

**9. Một truy vấn chạy qua cluster theo trình tự nào — `coordinating node` fan-out tới các shard rồi gộp kết quả thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Node nhận request đóng vai `coordinating node` và điều phối theo hai pha.

Pha **query**: coordinating node fan-out truy vấn tới một bản (primary hoặc replica) của **mọi shard** liên quan. Mỗi shard tìm cục bộ trên inverted index của mình, chấm điểm, rồi trả về một danh sách rút gọn gồm document id kèm score — chỉ khoảng `from + size` phần tử, chưa kèm nội dung.

Pha **fetch**: coordinating node gộp các danh sách, sắp xếp lại theo score toàn cục, cắt đúng trang cần, rồi mới hỏi các shard tương ứng để lấy nội dung document thật và trả cho client.

Hai hệ quả cần nhớ: một truy vấn chậm bằng **shard chậm nhất** của nó; và phân trang sâu rất tốn vì mỗi shard đều phải trả `from + size` kết quả, nên với trang sâu hãy dùng `search_after` thay cho `from` lớn.

</details>

**10. Vì sao chia quá nhiều shard cho lượng dữ liệu nhỏ lại phản tác dụng? Nêu cả ảnh hưởng lên điểm relevance.**

<details className="qa">
<summary>Xem đáp án</summary>

Mỗi shard là một index Lucene đầy đủ nên tốn chi phí cố định bất kể chứa bao nhiêu dữ liệu: heap cho metadata, file descriptor, segment, thread khi merge. Vài trăm shard tí hon là đủ ăn hết heap của một cluster nhỏ.

Về truy vấn, mỗi shard thêm một lần fan-out và một lần gộp kết quả. Với dữ liệu nhỏ, phần overhead điều phối còn lớn hơn phần tìm kiếm thật, nên chia nhiều shard lại **chậm hơn** để một shard.

Ảnh hưởng lên relevance: điểm BM25 phụ thuộc thống kê document frequency, mà thống kê này được tính **cục bộ trong từng shard**. Dữ liệu càng ít mà chia càng nhỏ thì thống kê mỗi shard càng lệch so với toàn cục, khiến cùng một document có thể được chấm điểm khác nhau tuỳ rơi vào shard nào. Hậu quả là thứ hạng thiếu ổn định và đôi khi phản trực giác trên tập dữ liệu nhỏ.

</details>

**11. Elasticsearch là `near real-time` — `refresh interval` nghĩa là gì và vì sao document vừa ghi chưa tìm thấy được ngay?**

<details className="qa">
<summary>Xem đáp án</summary>

Elasticsearch không ghi thẳng vào cấu trúc tìm kiếm được. Document mới đi vào một buffer trong bộ nhớ (kèm translog để không mất dữ liệu khi crash). Chỉ khi có một lần **refresh**, buffer đó mới được đóng thành một segment Lucene mới và từ đó mới **searchable**.

`refresh interval` là chu kỳ tự động làm việc này, mặc định 1 giây. Vì vậy ES được gọi là `near real-time`: ghi xong rồi tìm ngay lập tức thì có thể chưa thấy, phải chờ tới nhịp refresh kế tiếp.

Lý do thiết kế: mỗi lần refresh sinh một segment mới và tốn chi phí, refresh sau từng document sẽ khiến throughput ghi rất tệ.

Điều chỉnh thực tế: khi bulk import lớn thì tạm tắt refresh rồi bật lại, đổi độ trễ lấy tốc độ ghi. Cần đọc ngay sau ghi thì có thể ép refresh, nhưng đừng lạm dụng trên đường nóng.

</details>

**12. Phân biệt `query context` và `filter context`. Vì sao filter được cache còn query thì không?**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | `query context` | `filter context` |
|---|---|---|
| Trả lời câu hỏi | Document khớp **tốt đến mức nào** | Document có khớp hay không |
| Kết quả | Có tính `_score` | Chỉ có/không, không tính điểm |
| Ví dụ | `match` trên tên và mô tả sản phẩm | `term` trên category, `range` trên giá, lọc theo status |

Filter được cache vì kết quả của nó **nhị phân, xác định và không phụ thuộc vào truy vấn khác**: điều kiện "category = phones" luôn cho đúng một tập document id trên shard đó. ES lưu tập id này dưới dạng bitset và tái sử dụng cho mọi truy vấn sau, giao với các điều kiện khác rất rẻ.

Query context thì phải tính điểm, mà điểm phụ thuộc chuỗi tìm kiếm cụ thể, thống kê term và độ dài document — gần như mỗi truy vấn một khác nên cache vô nghĩa.

Thực hành: đẩy mọi điều kiện lọc chính xác vào `filter`, chỉ để phần văn bản cần xếp hạng ở phần tính điểm.

</details>

**13. So sánh `Elasticsearch`, `Meilisearch` và `Typesense` về độ nặng vận hành, tính năng và trường hợp nên dùng.**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | `Elasticsearch` | `Meilisearch` | `Typesense` |
|---|---|---|---|
| Nền tảng | Java/JVM, ngốn RAM | Rust, nhẹ | C++, nhẹ |
| Vận hành | Phức tạp: cluster, shard, tuning | Một binary, dựng rất nhanh | Một binary, dựng rất nhanh |
| Mặc định | Phải cấu hình mapping, analyzer | Tốt sẵn, typo-tolerant built-in | Tốt sẵn, typo-tolerant built-in |
| Tính năng | Đầy đủ nhất: aggregation, geospatial, vector search | Tập trung cho search UI | Tương đương Meilisearch |

Chọn Elasticsearch (hoặc OpenSearch — bản fork sau khi license đổi năm 2021) khi cần analytics, log aggregation kiểu ELK, vector search cho RAG, hoặc scale lớn — chấp nhận chi phí vận hành và bộ nhớ.

Chọn Meilisearch hay Typesense khi cần ô tìm kiếm cho người dùng cuối, dự án nhỏ đến vừa, muốn có kết quả nhanh mà không phải nuôi cluster. Hai cái này khác nhau rất ít, chọn theo hệ sinh thái và bản cloud sẵn có.

</details>

**14. Postgres full-text search (`tsvector`, `GIN index`, `pg_trgm`) làm được tới đâu? Khi nào nó đủ dùng và khi nào phải chuyển sang search engine riêng?**

<details className="qa">
<summary>Xem đáp án</summary>

Postgres FTS dựa trên cột `tsvector` — bản rút gọn của câu văn sau khi cắt từ, bỏ stop word và stem — cộng `GIN index` để tra nhanh, `plainto_tsquery` để tạo truy vấn và `ts_rank` để xếp hạng. Nó hỗ trợ nhiều ngôn ngữ và đánh trọng số theo vùng (tiêu đề nặng hơn nội dung). `pg_trgm` bổ sung khớp gần theo trigram để tha lỗi gõ sai.

Đủ dùng khi: đã có sẵn Postgres, dữ liệu cỡ vài triệu đến vài chục triệu dòng, nhu cầu tìm kiếm ở mức cơ bản, và quan trọng nhất là **không muốn nuôi thêm một hệ thống nữa** cùng bài toán đồng bộ đi kèm.

Nên chuyển sang search engine riêng khi: cần typo-tolerance tốt ngay từ mặc định, faceted search, autocomplete mượt, highlight, synonym phức tạp; cần aggregation cho analytics; hoặc traffic tìm kiếm lớn tới mức muốn tách tải khỏi database nghiệp vụ.

</details>

**15. Bạn đồng bộ dữ liệu từ database sang search engine bằng cách nào? So sánh dual write, batch job và `CDC` (Debezium).**

<details className="qa">
<summary>Xem đáp án</summary>

| Cách | Cơ chế | Ưu | Nhược |
|---|---|---|---|
| Dual write | App ghi DB xong gọi luôn API index | Đơn giản, độ trễ thấp | Không có transaction chung nên một bên fail là lệch; làm chậm request; dễ sót các đường ghi khác (migration, admin, SQL tay) |
| Batch job | Reindex định kỳ, ví dụ hằng đêm | Dễ hiểu, tự chữa lệch | Dữ liệu cũ tới cả ngày, tốn tài nguyên vì quét lại toàn bộ |
| `CDC` | Debezium đọc WAL của Postgres, đẩy qua Kafka, consumer cập nhật search | Bắt **mọi** thay đổi kể cả ghi ngoài app, gần real-time, không đụng code nghiệp vụ | Hạ tầng nặng hơn: thêm Debezium, Kafka, consumer |

Thực tế hay kết hợp: đẩy việc index qua job queue cho độ trễ thấp, cộng một batch reconcile định kỳ để chữa các lần sync fail. Hệ thống lớn thì CDC là lựa chọn sạch nhất vì lấy thay đổi thẳng từ WAL.

Nếu dùng dual write, đừng gọi index đồng bộ ngay trong request, và nên áp outbox pattern để không mất event khi transaction rollback.

</details>

**16. Nguồn sự thật nên nằm ở đâu và vì sao? Xử lý thế nào khi dữ liệu bên search engine lệch so với DB?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguồn sự thật phải là **database** (Postgres); search engine chỉ là bản sao đã đánh index. Lý do: DB có transaction, ràng buộc toàn vẹn, backup và khả năng khôi phục; search engine được tối ưu cho tra cứu chứ không đảm bảo mức đó, và nó luôn trễ hơn nguồn một nhịp.

Vì vậy workflow chuẩn là: search engine trả về **danh sách kết quả tóm tắt**, còn khi người dùng bấm vào chi tiết thì app lấy dữ liệu từ Postgres. Đừng dùng search engine như kho dữ liệu chính.

Khi lệch:

- Xoá ở DB phải kéo theo xoá ở index, update phải kéo theo reindex.
- Chạy **reconciliation job** định kỳ: đối chiếu id và mốc thời gian cập nhật giữa hai bên, index lại phần thiếu, xoá phần thừa.
- Luôn giữ được khả năng **reindex toàn bộ** từ DB — đây là lối thoát cuối cùng cho mọi sự cố index.
- Về UX, chấp nhận eventual consistency: báo "đã tạo thành công" thay vì hứa rằng tìm kiếm ra ngay.

</details>

**17. Thiết kế autocomplete và chấp nhận gõ sai (`fuzziness`, `n-gram`, `edge n-gram`) cần cân nhắc gì giữa độ chính xác và kích thước index?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba hướng với chi phí rơi vào hai chỗ khác nhau:

- `fuzziness` — cho phép sai vài ký tự theo khoảng cách chỉnh sửa, xử lý **lúc query**. Index không phình, nhưng truy vấn đắt hơn vì phải mở rộng ra nhiều term gần giống.
- `edge n-gram` — **lúc index** sinh sẵn mọi tiền tố của từ ("iphone" thành "i", "ip", "iph"...). Truy vấn cực nhanh vì chỉ là khớp term, đúng bài cho gõ tới đâu gợi ý tới đó. Đổi lại index phình nhanh.
- `n-gram` đầy đủ — khớp được cả ở giữa từ, nhưng index phình nhất và nhiễu nhất.

Cân nhắc khi triển khai:

- Giới hạn độ dài gram tối thiểu và tối đa để chặn kích thước index; đừng sinh n-gram cho field mô tả dài.
- Sinh n-gram ở phía index nhưng dùng `search_analyzer` thường ở phía query, nếu không mỗi truy vấn cũng bị cắt vụn.
- Fuzziness nên co giãn theo độ dài từ (kiểu `AUTO`): tha dễ dãi quá sẽ ra kết quả rác ("sách" gần với "sạch") và chậm hơn.
- Tách riêng một field nhỏ chuyên cho autocomplete thay vì bật cho cả index.

</details>
