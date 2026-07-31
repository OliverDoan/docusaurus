---
sidebar_position: 1
title: "1. AI Basics: LLM, Embeddings, RAG"
---

# AI Basics: LLM, Embeddings, RAG

Bài này giới thiệu những khái niệm cơ bản nhất về AI mà một lập trình viên backend cần biết: LLM (mô hình ngôn ngữ lớn), embeddings (biến văn bản thành vector số), vector database và RAG (cách cho AI trả lời dựa trên dữ liệu riêng của bạn). Đây là nền tảng để bạn tích hợp AI vào ứng dụng như chatbot, tìm kiếm thông minh hay hỏi đáp tài liệu. Hiểu chúng cũng giúp bạn biết khi nào nên dùng AI và khi nào nên dùng code thường.

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

---

## LLM (Large Language Models)

**LLM** = model học trên hàng tỷ token text, predict word tiếp theo.

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
