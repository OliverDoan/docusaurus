---
sidebar_position: 1
title: "1. AI Basics: LLM, Embeddings, RAG"
---

# AI Basics: LLM, Embeddings, RAG

Bài này giới thiệu những khái niệm cơ bản nhất về AI mà một lập trình viên backend cần biết: LLM (mô hình ngôn ngữ lớn), embeddings (biến văn bản thành vector số), vector database và RAG (cách cho AI trả lời dựa trên dữ liệu riêng của bạn). Đây là nền tảng để bạn tích hợp AI vào ứng dụng như chatbot, tìm kiếm thông minh hay hỏi đáp tài liệu. Hiểu chúng cũng giúp bạn biết khi nào nên dùng AI và khi nào nên dùng code thường.

[![Sơ đồ tóm tắt bài: AI Basics: LLM, Embeddings, RAG](/img/backend/ai-basics.webp)](pathname:///img/backend/ai-basics.webp)

---

:::note[Ghi nhớ nhanh]

- ⭐ **`LLM` dự đoán token tiếp theo** dựa trên xác suất — output mang tính probabilistic (khác nhau mỗi lần), không deterministic như code thường.
- **Token ≠ từ** — tính phí theo input + output token (output đắt hơn 3-5 lần); `prompt caching` giảm cost 50-90% cho context lặp lại.
- ⭐ **`Embedding` biến text thành vector** — vector gần nhau về mặt semantic thì gần nhau, đo bằng `cosine similarity`; nền tảng cho semantic search.
- **Vector database** lưu + search vector (dùng `HNSW`) — `pgvector` đủ cho 90% case (< 10M vector), dùng Pinecone/Qdrant khi scale lớn.
- **`RAG`** = retrieval + LLM — embed câu hỏi, tìm chunk gần nhất, nhét vào prompt để LLM trả lời trên data riêng; chất lượng phụ thuộc chunking, embedding, reranking, hybrid search.
- **Dùng LLM cho** NLP/unstructured/creative; **dùng code thường cho** tính toán chính xác, real-time, high-volume đơn giản.

:::

---

## Mục lục

- [LLM (Large Language Models)](#llm-large-language-models)
- [Token và Pricing](#token-và-pricing)
- [Embeddings và Vector](#embeddings-và-vector)
- [Vector Databases](#vector-databases)
- [RAG (Retrieval Augmented Generation)](#rag-retrieval-augmented-generation)
- [AI vs Traditional Coding](#ai-vs-traditional-coding)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## LLM (Large Language Models)

**LLM** = model học trên hàng tỷ token text, predict word tiếp theo.

:::tip[Ví dụ đời thường]

Bạn gõ tin nhắn trên điện thoại, bàn phím gợi ý từ kế tiếp: gõ "chúc bạn buổi sáng" nó đoán ngay "tốt lành". `LLM` **cũng chỉ làm đúng việc đó**, nhưng đã đọc gần như cả internet nên đoán cực chuẩn — và nó lấy chữ vừa đoán nối vào câu rồi đoán tiếp, cứ thế ra cả đoạn văn.

Hệ quả bạn phải nhớ: nó **đoán chữ hợp lý nhất**, chứ không tra cứu sự thật. Nên nó có thể nói sai mà giọng vẫn rất tự tin, và hỏi lại y hệt câu cũ thì câu trả lời có thể khác đi.

:::

Cách hoạt động:

```
Input:  "Việt Nam là nước có thủ đô"
LLM:    predict next token với xác suất:
        " Hà" (95%), " Sài" (3%), " Đà" (1%), ...
Output: "Hà Nội"
```

Lặp lại → sinh đoạn văn dài.

**Phổ biến**:

- **Claude** (Anthropic) — Opus 4.7, Sonnet 4.6, Haiku 4.5.
- **GPT** (OpenAI) — GPT-5, GPT-4.5.
- **Gemini** (Google) — Gemini 2.5 Pro/Flash.
- **Llama** (Meta) — open weight, self-host.
- **Mistral**, **DeepSeek**, **Qwen** — open source models.

**Capabilities** 2026:

- **Text generation** — viết, dịch, summary.
- **Code generation** — viết code đa ngôn ngữ.
- **Reasoning** — multi-step problem solving.
- **Multi-modal** — text + image + audio + video.
- **Tool use** — gọi function, search web.
- **Long context** — 1M+ token (Gemini, Claude).

---

## Token và Pricing

**Token** ≠ word. ~4 char tiếng Anh = 1 token. Tiếng Việt token nhiều hơn
do unicode.

:::tip[Ví dụ đời thường]

Coi `token` như **cân ký khi gửi hàng bưu điện**: bưu điện không tính tiền theo "mấy món đồ" mà theo cân nặng. LLM cũng vậy — không tính theo câu hay theo request, mà theo **lượng chữ** đi vào và đi ra.

- Bạn trả tiền **cả chiều gửi lẫn chiều nhận** (input + output token).
- Chiều nhận **đắt gấp 3-5 lần** vì model phải nghĩ ra từng chữ.
- Tiếng Việt có dấu nên "nặng ký" hơn tiếng Anh cùng nội dung — cùng một câu, hoá đơn cao hơn.

Còn `prompt caching` giống gửi mãi một kiện hàng quen: bưu điện đã có sẵn thông tin nên tính rẻ hẳn đi.

:::

```
"Hello world" = 2 token
"Hello, world!" = 4 token
"Xin chào thế giới" = ~6-8 token
```

Pricing API LLM:

- **Input token** — text gửi vào.
- **Output token** — text generated.
- Output thường đắt hơn input 3-5 lần.

Giá ước lượng 2026 (per 1M token):

| Model | Input | Output |
|-------|-------|--------|
| Claude Opus 4.7 | $15 | $75 |
| Claude Sonnet 4.6 | $3 | $15 |
| Claude Haiku 4.5 | $1 | $5 |
| GPT-5 | $5 | $20 |
| Gemini 2.5 Pro | $7 | $30 |
| Gemini 2.5 Flash | $0.5 | $2 |

**Prompt caching** giảm cost 50-90% cho repeated context. Mọi provider lớn
đều hỗ trợ.

:::info[Phân tích]

**Cost estimation pattern**:

```
1 request = 5000 input token + 1000 output token
Model: Claude Sonnet 4.6
Cost = (5000 × $3 + 1000 × $15) / 1M
     = ($0.015 + $0.015) / request
     = $0.03 per request

1000 user × 10 request/day = 10,000 request/day
Daily cost = 10,000 × $0.03 = $300/day = ~$9000/month
```

Optimization:

- **Cache** — context lặp lại (system prompt, doc) cache → discount 90%.
- **Cheaper model** — Haiku/Flash cho easy task, Opus chỉ khi cần.
- **Prompt engineering** — giảm token thừa.
- **Streaming + cancel** — user dừng, không tính token chưa generate.
- **Batch API** — 50% discount cho async job.

:::

---

## Embeddings và Vector

**Embedding** = chuyển text/image thành **vector** (mảng số) — represent
semantic meaning.

:::tip[Ví dụ đời thường]

Embedding là gán cho mỗi đoạn chữ **một toạ độ trên bản đồ**. Hà Nội với Hải Phòng nằm gần nhau, Hà Nội với Cà Mau nằm xa nhau. Chữ nghĩa cũng vậy: "con chó dễ thương" và "cún yêu" đậu sát nhau, còn "quả táo đỏ" thì tít đằng kia — **dù không có chữ nào trùng nhau**.

Nhờ đó máy trả lời được câu "cái nào **ý nghĩa** giống cái nào", việc mà tìm theo từ khoá chịu thua. Chỉ khác là bản đồ này không phải 2 chiều mà 1536 chiều, nên bạn đo khoảng cách bằng công thức (`cosine similarity`) chứ không cầm thước.

:::

```
"Con chó dễ thương"  → [0.1, -0.5, 0.8, 0.2, ..., 0.4]  (1536 chiều)
"Cún yêu"             → [0.1, -0.4, 0.7, 0.3, ..., 0.5]  (gần với trên)
"Quả táo đỏ"          → [-0.3, 0.6, -0.2, ..., 0.1]      (xa hai trên)
```

→ Vector gần nhau **về semantic gần nhau**.

**Use case**:

- **Semantic search** — tìm document tương tự query.
- **Recommendation** — gợi ý dựa similarity.
- **Clustering** — group document.
- **Anomaly detection**.
- **RAG** — retrieve context cho LLM.

**Tạo embedding**:

```ts
// OpenAI
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: "Con chó dễ thương",
});

const embedding = response.data[0].embedding;
// [0.123, -0.456, 0.789, ...] (1536 dim)
```

**Similarity** — đo "gần nhau" qua cosine similarity:

```ts
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] ** 2;
    normB += b[i] ** 2;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

Range -1 (đối lập) → 1 (giống nhau). >0.8 = tương đồng cao.

---

## Vector Databases

Lưu + search vector hiệu quả. Đa số dùng **HNSW** (Hierarchical Navigable
Small World) algorithm cho approximate nearest neighbor.

:::tip[Ví dụ đời thường]

Bạn tới một thành phố lạ, cần tìm quán phở gần nhất. Hỏi lần lượt từng người trong thành phố thì chính xác tuyệt đối nhưng cả ngày không xong (so sánh với **toàn bộ** vector).

`HNSW` làm kiểu khác: hỏi bác xe ôm rành đường → bác chỉ về đúng quận → hỏi người trong quận → hỏi người trong ngõ. Vài bước là tới, nhảy dần từ tầng "nhìn xa" xuống tầng "nhìn gần".

Cái giá nằm ở chữ **approximate**: thỉnh thoảng bạn ra quán ngon thứ nhì chứ không phải quán ngon nhất. Đổi lại nhanh hơn hàng nghìn lần — với tìm kiếm thì đánh đổi này gần như luôn đáng.

:::

| DB | Đặc điểm | Khuyến nghị |
|----|---------|-------------|
| **pgvector** (Postgres extension) | Tận dụng Postgres | **Có** — nhỏ-vừa |
| **Pinecone** | Managed, scale | Production heavy |
| **Weaviate** | Open source, GraphQL | Multi-modal |
| **Qdrant** | Rust, fast | Modern alternative |
| **Milvus** | Distributed, scale | Enterprise |
| **Chroma** | Local-first, dev | Prototype |
| **Turso vector**, **Cloudflare Vectorize** | Edge serverless | Mới |

```sql
-- pgvector
CREATE EXTENSION vector;

CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  content TEXT,
  embedding vector(1536)
);

CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops);

-- Search
SELECT content, 1 - (embedding <=> $1) AS similarity
FROM documents
ORDER BY embedding <=> $1
LIMIT 5;
```

`<=>` = cosine distance operator của pgvector.

:::tip[Mẹo]

**pgvector hay vector DB riêng?**

**pgvector** khi:

- Đã dùng Postgres.
- Dataset < 10M vector.
- Cần combine với data relational.

**Vector DB riêng** (Pinecone, Qdrant) khi:

- Dataset > 10M.
- Query rate > 1000/s.
- Cần advanced filter + hybrid search.

Default 90% case: **pgvector** đủ. Đỡ thêm system component.

:::

---

## RAG (Retrieval Augmented Generation)

**Combine retrieval + LLM** — giúp LLM trả lời câu hỏi về data riêng (DB
nội bộ, doc company).

:::tip[Ví dụ đời thường]

Bạn hỏi anh nhân viên mới: "Công ty mình cho nghỉ phép mấy ngày?". Anh ta thông minh nhưng **mới vào làm**, không thể biết — cố trả lời thì chỉ là đoán bừa.

`RAG` thêm một bước ở giữa: **thư ký chạy xuống kho hồ sơ**, rút đúng mấy trang nói về nghỉ phép, đặt lên bàn, rồi mới bảo anh ta "đọc mấy trang này và trả lời". Bản thân anh ta không học thêm gì cả, chỉ là được **thi mở sách**.

Nên chất lượng câu trả lời phụ thuộc vào **thư ký có rút đúng trang không**. Rút nhầm trang thì người giỏi mấy cũng trả lời sai — đó là lý do khâu chia nhỏ tài liệu và tìm kiếm quan trọng hơn cả việc chọn model.

:::

**Flow**:

```
1. Indexing (1 lần / khi update):
   - Split document thành chunk.
   - Embed mỗi chunk → vector.
   - Lưu vector + text vào vector DB.

2. Query time:
   - User hỏi: "Chính sách nghỉ phép như thế nào?"
   - Embed query → vector.
   - Search vector DB → 5 chunk gần nhất.
   - Construct prompt:
     "Dựa vào context sau:
      {chunk 1}
      {chunk 2}
      ...
      Trả lời câu hỏi: Chính sách nghỉ phép..."
   - Gửi LLM → answer.
```

**Code example**:

```ts
async function ragAnswer(question: string) {
  // 1. Embed question
  const queryEmbedding = await embed(question);

  // 2. Retrieve top-5 chunks
  const chunks = await db.query(`
    SELECT content FROM documents
    ORDER BY embedding <=> $1
    LIMIT 5
  `, [queryEmbedding]);

  // 3. Construct prompt
  const context = chunks.map(c => c.content).join("\n\n");
  const prompt = `
    Context:
    ${context}

    Question: ${question}

    Answer based on context above. If not in context, say "I don't know".
  `;

  // 4. Generate
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  });

  return response.content[0].text;
}
```

:::info[Phân tích]

**RAG quality phụ thuộc:**

**1. Chunking strategy**:

- **Fixed size** (500 token) — đơn giản, có thể cut giữa context.
- **Semantic split** — chia theo paragraph, heading.
- **Recursive split** — chia thông minh theo structure.
- **Overlap** — chunk overlap 10-20% để giữ context giữa boundary.

**2. Embedding quality**:

- **OpenAI text-embedding-3-large** — cao cấp, đắt.
- **OpenAI text-embedding-3-small** — balance.
- **Cohere embed-multilingual-v3** — multi-language.
- **Voyage AI** — code embedding tốt.

**3. Reranking** — bước 2: dùng reranker model lọc lại top-k:

```
Initial: vector search → top 20
Rerank: Cohere Rerank / cross-encoder → top 5
LLM: dùng top 5 để answer
```

Rerank improve accuracy 10-20%.

**4. Hybrid search** — combine vector + keyword (BM25):

- Vector: semantic similarity.
- BM25: exact keyword match.
- Combined: best of both.

PostgreSQL có cả pgvector + `tsvector` full-text search → hybrid search
trong 1 DB.

:::

---

## AI vs Traditional Coding

| | Traditional Code | AI/LLM |
|--|-----------------|--------|
| **Behavior** | Deterministic | Probabilistic |
| **Output** | Exact same each time | Khác nhau mỗi lần |
| **Logic** | Rule-based | Pattern-based |
| **Debugging** | Stack trace | Prompt engineering |
| **Cost** | CPU time | Token (variable) |
| **Latency** | ms | seconds |
| **Use case** | CRUD, business logic | NLP, creative, ambiguous |

**Khi dùng LLM thay code thường?**

✅ Có:

- **NLP**: tóm tắt, dịch, phân tích sentiment.
- **Classification** dữ liệu unstructured.
- **Code generation, refactor**.
- **Conversational** UI.
- **Content creation** — email, blog, marketing.
- **Q&A** từ doc nội bộ (RAG).
- **Data extraction** từ unstructured (HTML, PDF).

❌ Không:

- **Exact computation** (math, finance).
- **Real-time critical** path (`<100ms`).
- **Compliance** strict — output không reproducible.
- **High volume** với simple logic — quá đắt.

:::tip[Mẹo]

**Pattern hybrid**:

- **Logic deterministic** → code thường.
- **NLP / unstructured** → LLM call.
- **Combine** — LLM extract structured data, code xử lý tiếp.

Ví dụ:

```
User submit email phản hồi
    ↓
LLM: extract sentiment + topic + urgency → JSON
    ↓
Code: route ticket theo logic deterministic
    ↓
Code: insert DB, send notif
```

LLM làm phần khó (parse natural language), code làm phần predictable.

:::

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi đối chiếu lại với nội dung phía trên.

1. `LLM` hoạt động ở mức cơ bản như thế nào — vì sao nói nó chỉ đang "dự đoán token tiếp theo"?
2. `token` là gì và khác "từ" ra sao? Vì sao tiếng Việt thường tốn nhiều token hơn tiếng Anh cho cùng một nội dung?
3. `temperature`, `top_p` và `max_tokens` ảnh hưởng gì tới output? Khi nào bạn để `temperature = 0`?
4. Output của LLM là probabilistic. Điều đó gây khó khăn gì khi đưa vào hệ thống production và bạn xử lý ra sao?
5. `hallucination` là gì, sinh ra từ đâu, và có những cách nào để giảm thiểu?
6. `context window` là gì? Khi tài liệu dài hơn context window thì bạn xử lý thế nào?
7. Chi phí gọi API LLM được tính ra sao? Vì sao output token thường đắt hơn input token, và `prompt caching` tiết kiệm bằng cơ chế nào?
8. `embedding` là gì? Vì sao hai câu dùng từ ngữ khác nhau nhưng cùng ý nghĩa lại có vector nằm gần nhau?
9. Vì sao thường dùng `cosine similarity` thay vì khoảng cách Euclid khi so sánh embedding?
10. Semantic search khác keyword search (`full-text search`) ở điểm nào? Trường hợp nào keyword search vẫn tốt hơn?
11. Vector database khác database quan hệ thông thường ra sao? Khi nào `pgvector` là đủ và khi nào cần Pinecone/Qdrant/Milvus?
12. Giải thích `HNSW`. Vì sao gọi là `approximate nearest neighbor` và bạn đánh đổi gì giữa recall và latency?
13. Mô tả pipeline `RAG` đầy đủ, tách rõ giai đoạn indexing (offline) và giai đoạn query (online).
14. Chiến lược `chunking` ảnh hưởng chất lượng RAG ra sao? Chunk quá to hoặc quá nhỏ thì hỏng ở đâu, và `overlap` để làm gì?
15. So sánh `RAG` với `fine-tuning`: mỗi cách giải quyết vấn đề gì, và khi nào nên kết hợp cả hai?
16. Hệ thống RAG trả lời sai. Bạn debug theo trình tự nào để biết lỗi nằm ở khâu retrieval hay khâu generation?
17. `hybrid search` và `reranking` (cross-encoder) cải thiện RAG như thế nào? Chi phí kèm theo là gì?
18. Khi tài liệu nguồn được cập nhật, bạn đồng bộ lại vector index ra sao? Nếu đổi embedding model thì phải làm gì?
19. Bạn đánh giá chất lượng một hệ thống RAG bằng những chỉ số nào (`recall@k`, faithfulness, groundedness...)?
20. Bài toán nào nên dùng LLM và bài toán nào nên dùng code thường? Cho một ví dụ kết hợp cả hai.
21. Rủi ro bảo mật khi đưa LLM vào backend: `prompt injection`, rò rỉ dữ liệu nhạy cảm qua prompt, chi phí bị lạm dụng. Bạn phòng thế nào?
22. Làm sao bắt LLM trả về dữ liệu có cấu trúc (JSON) đáng tin cậy? Xử lý ra sao khi model trả về JSON hỏng?
