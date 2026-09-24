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

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `LLM` hoạt động ở mức cơ bản như thế nào — vì sao nói nó chỉ đang "dự đoán token tiếp theo"?**

<details className="qa">
<summary>Xem đáp án</summary>

`LLM` được train trên hàng tỷ token text để học một việc duy nhất: cho một chuỗi token đầu vào, tính phân phối xác suất của token kế tiếp.

```
Input:  "Việt Nam là nước có thủ đô"
LLM:    " Hà" (95%), " Sài" (3%), " Đà" (1%), ...
Output: "Hà Nội"
```

Sinh xong một token, nó nối token đó vào input rồi lặp lại — nên cả đoạn văn dài chỉ là chuỗi dự đoán nối tiếp nhau (`autoregressive`).

Hệ quả cần nhớ khi làm backend:

- Model **đoán chữ hợp lý nhất**, không tra cứu sự thật → nói sai vẫn rất tự tin.
- Output **probabilistic**: hỏi lại y hệt câu cũ, câu trả lời có thể khác.
- Nó không có "kiến thức riêng của công ty bạn" — muốn có phải đưa vào prompt (`RAG`).

Ví von dễ nhớ: giống bàn phím điện thoại gợi ý từ kế tiếp, nhưng đã đọc gần như cả internet nên đoán cực chuẩn.

</details>

**2. `token` là gì và khác "từ" ra sao? Vì sao tiếng Việt thường tốn nhiều token hơn tiếng Anh cho cùng một nội dung?**

<details className="qa">
<summary>Xem đáp án</summary>

`Token` là đơn vị nhỏ nhất model xử lý — một mẩu text do `tokenizer` cắt ra, có thể là cả từ, một phần từ, hoặc dấu câu. Quy ước ước lượng: ~4 ký tự tiếng Anh ≈ 1 token.

```
"Hello world"      = 2 token
"Hello, world!"    = 4 token   (dấu , và ! tách riêng)
"Xin chào thế giới" = ~6-8 token
```

Tiếng Việt tốn nhiều token hơn vì tokenizer được train chủ yếu trên tiếng Anh: chữ có dấu là ký tự Unicode nhiều byte, không nằm trong vocabulary phổ biến nên bị cắt vụn thành nhiều mảnh nhỏ.

Tác động thực tế: cùng một nội dung, hoá đơn tiếng Việt cao hơn và tốn nhiều chỗ hơn trong `context window`. Khi ước lượng cost cho sản phẩm tiếng Việt, đừng lấy thẳng tỉ lệ 4 ký tự = 1 token của tiếng Anh.

</details>

**3. `temperature`, `top_p` và `max_tokens` ảnh hưởng gì tới output? Khi nào bạn để `temperature = 0`?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba tham số điều khiển bước chọn token từ phân phối xác suất:

| Tham số | Tác dụng |
|---|---|
| `temperature` | Làm "phẳng" hay "nhọn" phân phối. Thấp → luôn chọn token xác suất cao nhất; cao → chấp nhận token ít khả năng hơn, output đa dạng/sáng tạo hơn |
| `top_p` | Nucleus sampling: chỉ lấy nhóm token đầu có tổng xác suất đạt `p`, bỏ phần đuôi. Thường chỉ chỉnh một trong hai, không chỉnh cả hai cùng lúc |
| `max_tokens` | Giới hạn số token sinh ra — chặn chi phí và tránh output lê thê. Chạm giới hạn thì câu trả lời bị cắt giữa chừng |

Để `temperature = 0` khi cần output ổn định nhất có thể: extract dữ liệu có cấu trúc (JSON), classification, routing ticket, sinh SQL. Để cao khi viết content, brainstorm ý tưởng.

Lưu ý: `temperature = 0` giảm ngẫu nhiên chứ **không** đảm bảo deterministic tuyệt đối — vẫn phải validate output.

</details>

**4. Output của LLM là probabilistic. Điều đó gây khó khăn gì khi đưa vào hệ thống production và bạn xử lý ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Khác code thường (deterministic, cùng input ra cùng output, debug bằng stack trace), LLM cho kết quả khác nhau mỗi lần. Khó khăn kéo theo:

- Không viết được test kiểu `assert equal` — hôm nay pass, mai fail.
- Không reproduce được bug, khó audit/compliance.
- Format output có thể lệch khiến code phía sau parse lỗi.
- Latency tính bằng giây và chi phí biến thiên theo độ dài output.

Cách xử lý:

- Hạ `temperature`, ràng buộc output bằng schema (JSON schema / tool use) và **validate** bằng Zod/Pydantic trước khi dùng.
- Retry có kiểm soát khi validate fail, kèm timeout và fallback về luồng deterministic.
- Test theo tiêu chí (eval set + assertion mềm) thay vì so khớp chuỗi.
- Giới hạn phạm vi: để LLM làm phần "hiểu ngôn ngữ", code thường làm phần tính toán và quyết định — pattern hybrid.
- Log lại prompt + response để truy vết khi có sự cố.

</details>

**5. `hallucination` là gì, sinh ra từ đâu, và có những cách nào để giảm thiểu?**

<details className="qa">
<summary>Xem đáp án</summary>

`Hallucination` là khi model sinh ra thông tin nghe rất hợp lý nhưng sai sự thật hoặc bịa hẳn: API không tồn tại, số liệu tự chế, trích dẫn không có thật.

Nguồn gốc nằm ngay ở cơ chế: model chọn token **hợp lý về mặt thống kê**, không tra cứu nguồn nào cả. Khi câu hỏi nằm ngoài dữ liệu train, hoặc quá mơ hồ, nó vẫn buộc phải sinh ra chữ — và chữ trôi chảy nhất thường không phải chữ đúng.

Giảm thiểu:

- **`RAG`** — đưa tài liệu thật vào prompt để model "thi mở sách" thay vì nhớ mò.
- **Ràng buộc trong prompt** — yêu cầu chỉ trả lời dựa trên context, không biết thì nói "I don't know".
- **Bắt trích nguồn** — mỗi câu trả lời phải kèm chunk/đoạn tham chiếu để người dùng kiểm chứng.
- **Hạ `temperature`**, dùng model mạnh hơn cho task đòi hỏi độ chính xác cao.
- **Verify bằng code** — mọi con số, ID, tên bảng do LLM trả về đều đối chiếu lại với hệ thống thật.

</details>

**6. `context window` là gì? Khi tài liệu dài hơn context window thì bạn xử lý thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`Context window` là tổng số token model nhìn thấy được trong một lần gọi — gồm system prompt, lịch sử hội thoại, context đưa vào **và** cả phần output sinh ra. Các model 2026 đã lên tới 1M+ token (Gemini, Claude), nhưng vẫn là giới hạn cứng, và nhồi càng nhiều thì càng đắt và càng chậm.

Khi tài liệu vượt quá:

- **`RAG`** — cách chuẩn: chunk tài liệu, embed, chỉ retrieve vài chunk liên quan nhất rồi nhét vào prompt. Không cần model đọc hết.
- **Summarize theo tầng** — tóm tắt từng phần rồi tóm tắt các bản tóm tắt (map-reduce) khi cần cái nhìn toàn cục.
- **Sliding window cho hội thoại** — giữ vài lượt gần nhất, phần cũ nén thành bản tóm tắt.
- **Cắt bớt phần thừa** trong prompt và bật `prompt caching` cho phần cố định.

Lưu ý thêm: context dài không tự động cho chất lượng cao hơn — thông tin ở giữa context dễ bị "loãng".

</details>

**7. Chi phí gọi API LLM được tính ra sao? Vì sao output token thường đắt hơn input token, và `prompt caching` tiết kiệm bằng cơ chế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Tính theo token, tách riêng hai chiều: **input token** (text gửi vào) và **output token** (text sinh ra), đơn giá thường niêm yết per 1M token.

```
1 request = 5000 input + 1000 output, Claude Sonnet 4.6 ($3 / $15)
Cost = (5000 × $3 + 1000 × $15) / 1M = $0.03 / request
1000 user × 10 request/ngày → ~$300/ngày ≈ $9000/tháng
```

Output đắt hơn input 3-5 lần vì input được xử lý song song trong một lượt, còn output phải sinh **tuần tự từng token**, mỗi token là một lượt forward pass qua cả model — tốn GPU hơn hẳn.

`Prompt caching` lưu lại trạng thái đã tính của phần prefix cố định (system prompt, tài liệu lặp lại). Lần sau gửi đúng prefix đó, provider dùng lại thay vì tính lại từ đầu → giảm 50-90% chi phí phần được cache.

Tối ưu khác: chọn model rẻ (Haiku/Flash) cho task dễ, cắt token thừa, streaming + cancel, Batch API giảm ~50% cho job async.

</details>

**8. `embedding` là gì? Vì sao hai câu dùng từ ngữ khác nhau nhưng cùng ý nghĩa lại có vector nằm gần nhau?**

<details className="qa">
<summary>Xem đáp án</summary>

`Embedding` là việc chuyển text (hoặc ảnh) thành một **vector** số nhiều chiều biểu diễn ý nghĩa ngữ nghĩa của nó.

```
"Con chó dễ thương" → [0.1, -0.5, 0.8, ..., 0.4]   (1536 chiều)
"Cún yêu"            → [0.1, -0.4, 0.7, ..., 0.5]   (gần với trên)
"Quả táo đỏ"         → [-0.3, 0.6, -0.2, ..., 0.1]  (xa hai trên)
```

Hai câu khác chữ mà gần nhau vì model embedding được train sao cho những đoạn text xuất hiện trong ngữ cảnh tương tự sẽ có vector tương tự. Nó học từ cách dùng thực tế trong hàng tỷ câu, chứ không so khớp ký tự — nên "cún yêu" và "con chó dễ thương" rơi vào cùng một vùng của không gian.

Hình dung như gán toạ độ trên bản đồ: Hà Nội gần Hải Phòng, xa Cà Mau. Chỉ khác là bản đồ này 1536 chiều nên phải đo khoảng cách bằng công thức chứ không cầm thước.

Ứng dụng: semantic search, recommendation, clustering, anomaly detection, và retrieval trong `RAG`.

</details>

**9. Vì sao thường dùng `cosine similarity` thay vì khoảng cách Euclid khi so sánh embedding?**

<details className="qa">
<summary>Xem đáp án</summary>

`Cosine similarity` đo **góc** giữa hai vector, bỏ qua độ dài:

```ts
return dot / (Math.sqrt(normA) * Math.sqrt(normB));
// range: -1 (đối lập) → 1 (giống nhau); > 0.8 = tương đồng cao
```

Lý do chuộng cosine:

- Với embedding, **hướng** mới mang ý nghĩa ngữ nghĩa, còn độ lớn phần nhiều phản ánh độ dài văn bản hay tần suất từ. Một đoạn dài và một câu ngắn cùng ý nghĩa có thể lệch nhau nhiều về norm nhưng cùng hướng — Euclid sẽ coi chúng xa nhau, cosine thì không.
- Kết quả nằm gọn trong `[-1, 1]` nên dễ đặt ngưỡng chung cho mọi truy vấn.

Lưu ý: nếu vector đã được **normalize** về độ dài 1 (nhiều model embedding làm sẵn) thì thứ tự xếp hạng theo cosine và theo Euclid là như nhau — lúc đó chọn cái nào cũng được, và ta chọn cosine vì tiện diễn giải. Trong pgvector, toán tử `<=>` chính là cosine distance.

</details>

**10. Semantic search khác keyword search (`full-text search`) ở điểm nào? Trường hợp nào keyword search vẫn tốt hơn?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Keyword search (BM25, `tsvector`) | Semantic search (vector) |
|---|---|---|
| Cơ chế | So khớp từ/thân từ xuất hiện trong document | So khớp vector embedding theo ý nghĩa |
| Bắt được | Đúng chữ, đúng mã | Diễn đạt khác nhưng cùng ý |
| Điểm yếu | Hỏi "cún yêu" không ra "con chó" | Dễ trượt mã sản phẩm, tên riêng hiếm |
| Chi phí | Rẻ, index nhẹ | Tốn embedding + vector index |

Keyword search vẫn tốt hơn khi truy vấn là **định danh chính xác**: mã đơn hàng, SKU, tên hàm, số hợp đồng, thuật ngữ hiếm mà model embedding chưa từng thấy. Nó cũng dễ giải thích vì sao một kết quả được trả về, và không cần gọi API embedding.

Thực tế production thường dùng **hybrid search**: chạy cả hai rồi hợp nhất điểm. PostgreSQL tiện ở chỗ có sẵn `pgvector` và `tsvector` nên làm hybrid trong cùng một DB.

</details>

**11. Vector database khác database quan hệ thông thường ra sao? Khi nào `pgvector` là đủ và khi nào cần Pinecone/Qdrant/Milvus?**

<details className="qa">
<summary>Xem đáp án</summary>

DB quan hệ tối ưu cho truy vấn **exact match / range** trên cột có index B-tree: "lấy row có id = 5". Vector DB tối ưu cho câu hỏi khác hẳn: "tìm k vector gần vector này nhất" trong không gian hàng nghìn chiều — dùng index chuyên biệt như `HNSW` để làm approximate nearest neighbor.

Dùng **`pgvector`** khi:

- Đã có Postgres trong hệ thống.
- Dataset dưới ~10M vector.
- Cần join/filter chung với dữ liệu relational (user, tenant, permission).

Dùng **vector DB riêng** khi:

- Dataset trên ~10M vector.
- Query rate rất cao (cỡ nghìn query/giây).
- Cần filter nâng cao, hybrid search, sharding phân tán sẵn có.

Mặc định cho khoảng 90% trường hợp là `pgvector` — đỡ thêm một thành phần phải vận hành, backup và đồng bộ. Chỉ tách ra khi có số đo thật cho thấy Postgres đuối.

</details>

**12. Giải thích `HNSW`. Vì sao gọi là `approximate nearest neighbor` và bạn đánh đổi gì giữa recall và latency?**

<details className="qa">
<summary>Xem đáp án</summary>

`HNSW` (Hierarchical Navigable Small World) là cấu trúc đồ thị nhiều tầng. Tầng trên cùng thưa, các cạnh "nhảy xa"; càng xuống dưới đồ thị càng dày, cạnh càng ngắn. Tìm kiếm bắt đầu ở tầng trên, đi tới node gần query nhất, rồi tụt xuống tầng dưới và lặp lại — vài bước là tới vùng đích.

Ví von: tới thành phố lạ tìm quán phở gần nhất. Hỏi từng người trong thành phố thì chính xác tuyệt đối nhưng cả ngày không xong (đó là brute-force quét **toàn bộ** vector). Hỏi bác xe ôm → chỉ về đúng quận → hỏi người trong quận → hỏi người trong ngõ, vài bước là tới.

Gọi là **approximate** vì thuật toán không duyệt hết, nên thỉnh thoảng bỏ sót đúng hàng xóm gần nhất — bạn ra quán ngon thứ nhì.

Đánh đổi: tăng tham số duyệt (số ứng viên giữ lại khi search) và số cạnh mỗi node thì recall cao hơn nhưng latency và bộ nhớ tăng theo. Đổi lại tốc độ nhanh hơn brute-force hàng nghìn lần — với tìm kiếm, đánh đổi này gần như luôn đáng.

</details>

**13. Mô tả pipeline `RAG` đầy đủ, tách rõ giai đoạn indexing (offline) và giai đoạn query (online).**

<details className="qa">
<summary>Xem đáp án</summary>

**Indexing (chạy 1 lần, hoặc khi tài liệu đổi):**

1. Thu thập tài liệu nguồn (doc nội bộ, wiki, PDF).
2. Split thành chunk (kèm overlap).
3. Embed mỗi chunk thành vector.
4. Lưu vector + text gốc + metadata vào vector DB, tạo index `HNSW`.

**Query (mỗi request của user):**

1. Embed câu hỏi thành vector.
2. Search vector DB lấy top-k chunk gần nhất (thường k = 5, có thể lấy top-20 rồi rerank).
3. Ghép chunk thành context, dựng prompt: "Dựa vào context sau... trả lời câu hỏi..., nếu không có trong context thì nói không biết".
4. Gọi LLM sinh câu trả lời, kèm trích nguồn.

```ts
const queryEmbedding = await embed(question);
const chunks = await db.query(
  `SELECT content FROM documents ORDER BY embedding <=> $1 LIMIT 5`,
  [queryEmbedding]
);
```

Bản chất: model không học thêm gì cả, chỉ được **thi mở sách** — nên chất lượng phụ thuộc khâu "rút đúng trang".

</details>

**14. Chiến lược `chunking` ảnh hưởng chất lượng RAG ra sao? Chunk quá to hoặc quá nhỏ thì hỏng ở đâu, và `overlap` để làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Chunk là đơn vị được embed và được retrieve, nên nó quyết định trực tiếp thứ LLM đọc được.

- **Chunk quá to**: một vector phải gánh nhiều ý khác nhau, ý nghĩa bị pha loãng nên similarity kém nhạy; lại tốn nhiều token context cho phần không liên quan.
- **Chunk quá nhỏ**: mất ngữ cảnh xung quanh, câu trả lời bị cắt cụt; phải retrieve nhiều chunk rời rạc, dễ thiếu mảnh quan trọng.

Các chiến lược:

- **Fixed size** (~500 token) — đơn giản nhưng có thể cắt ngang giữa một ý.
- **Semantic split** — chia theo đoạn văn, heading.
- **Recursive split** — chia thông minh theo cấu trúc tài liệu.

**`Overlap`** (thường 10-20%) cho hai chunk liền kề dùng chung phần rìa, để câu nằm vắt qua ranh giới vẫn xuất hiện trọn vẹn trong ít nhất một chunk. Giá phải trả là tăng số vector và dung lượng index.

Thực tế nên thử vài cấu hình và đo bằng eval set thay vì chọn theo cảm tính.

</details>

**15. So sánh `RAG` với `fine-tuning`: mỗi cách giải quyết vấn đề gì, và khi nào nên kết hợp cả hai?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `RAG` | `Fine-tuning` |
|---|---|---|
| Giải quyết | Model **thiếu kiến thức** về data riêng | Model **chưa đúng phong cách / định dạng / hành vi** |
| Cách làm | Nhét tài liệu liên quan vào prompt lúc chạy | Train tiếp trên tập ví dụ để đổi trọng số |
| Cập nhật dữ liệu | Re-index, có hiệu lực ngay | Phải train lại, tốn thời gian và tiền |
| Trích nguồn | Có, chỉ thẳng chunk nguồn | Không |
| Chi phí | Hạ tầng vector DB + token context | Chi phí train + vận hành model riêng |

Chọn `RAG` khi kiến thức thay đổi thường xuyên, cần trích nguồn, cần phân quyền theo tài liệu — đây là mặc định cho hầu hết ứng dụng doanh nghiệp.

Chọn `fine-tuning` khi cần model bám một văn phong, một format output hoặc một tác vụ hẹp mà prompt dài mãi vẫn không ổn định.

Kết hợp cả hai khi vừa cần data mới nhất vừa cần hành vi đặc thù: fine-tune để model biết cách đọc context và trả lời đúng khuôn, `RAG` để cấp kiến thức tươi.

</details>

**16. Hệ thống RAG trả lời sai. Bạn debug theo trình tự nào để biết lỗi nằm ở khâu retrieval hay khâu generation?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc: tách đôi pipeline và kiểm tra mắt xích trước.

1. **In ra các chunk đã retrieve** cho câu hỏi đó. Đây là bước quan trọng nhất.
2. **Nếu chunk không chứa thông tin đúng** → lỗi retrieval. Kiểm tiếp: tài liệu đã được index chưa; chunking có cắt nát ý cần tìm không; embedding model dùng lúc index và lúc query có khớp nhau không; filter theo metadata có loại nhầm không; k có quá nhỏ không. Thử tăng k, bật hybrid search, thêm reranking.
3. **Nếu chunk đã chứa thông tin đúng mà câu trả lời vẫn sai** → lỗi generation. Kiểm: prompt có ràng buộc "chỉ trả lời dựa trên context" chưa; context có quá dài khiến ý đúng bị loãng; chunk mâu thuẫn nhau; `temperature` quá cao; model quá yếu cho task.
4. **Dựng eval set** vài chục câu hỏi có đáp án chuẩn để đo lại sau mỗi lần sửa, tránh sửa chỗ này hỏng chỗ kia.

Log đầy đủ query, chunk id, similarity score và prompt cuối cùng giúp bước 1 làm được trong vài giây.

</details>

**17. `hybrid search` và `reranking` (cross-encoder) cải thiện RAG như thế nào? Chi phí kèm theo là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Hybrid search** chạy song song vector search (bắt ý nghĩa) và keyword search BM25 (bắt đúng chữ, mã, tên riêng) rồi hợp nhất điểm. Nhờ vậy vá được điểm mù của từng bên: câu hỏi diễn đạt khác vẫn ra, mà mã đơn hàng cũng không bị trượt. PostgreSQL có sẵn `pgvector` và `tsvector` nên làm được trong một DB.

**Reranking** thêm một tầng lọc:

```
Vector search → top 20
Rerank (Cohere Rerank / cross-encoder) → top 5
LLM đọc top 5 để trả lời
```

Khác với embedding (mã hoá query và document độc lập rồi so vector), cross-encoder đọc **cặp** query–document cùng lúc nên chấm điểm liên quan chính xác hơn nhiều. Bài học cho biết rerank cải thiện accuracy khoảng 10-20%.

Chi phí: thêm một lượt gọi model cho mỗi ứng viên nên tốn tiền và tăng latency — vì thế chỉ rerank top-k nhỏ, không rerank cả kho. Hybrid thì tốn thêm index full-text và công tinh chỉnh trọng số hợp nhất.

</details>

**18. Khi tài liệu nguồn được cập nhật, bạn đồng bộ lại vector index ra sao? Nếu đổi embedding model thì phải làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Với tài liệu cập nhật:

- Lưu metadata cho mỗi chunk: `document_id`, phiên bản, hash nội dung, thời điểm index.
- Khi tài liệu đổi, so hash để biết chunk nào thực sự thay đổi; xoá toàn bộ chunk cũ của `document_id` đó rồi index lại — cách này đơn giản và tránh sót chunk mồ côi khi tài liệu bị rút ngắn.
- Tài liệu bị xoá thì xoá chunk tương ứng, nếu không hệ thống sẽ trả lời theo nội dung đã bị gỡ.
- Chạy qua hàng đợi (job bất đồng bộ) vì embed nhiều chunk tốn thời gian và tiền.

Khi **đổi embedding model**: vector của model cũ và model mới nằm ở hai không gian khác nhau, không so sánh được với nhau, số chiều cũng có thể khác. Bắt buộc phải **re-embed toàn bộ kho**. Cách an toàn là index vào bảng/collection mới song song, đánh giá bằng eval set, rồi mới chuyển traffic sang — tránh dừng dịch vụ và có đường lùi.

</details>

**19. Bạn đánh giá chất lượng một hệ thống RAG bằng những chỉ số nào (`recall@k`, faithfulness, groundedness...)?**

<details className="qa">
<summary>Xem đáp án</summary>

Đo tách hai tầng, vì hỏng ở tầng nào cách sửa cũng khác nhau.

**Tầng retrieval:**

- `recall@k` — trong top-k chunk trả về có chứa chunk chứa đáp án không. Chỉ số quan trọng nhất: retrieval trượt thì generation vô phương cứu.
- `precision@k` — bao nhiêu chunk trong top-k thực sự liên quan (chunk rác làm loãng context).
- `MRR` / `NDCG` — chunk đúng nằm ở vị trí nào trong danh sách.

**Tầng generation:**

- `faithfulness` / `groundedness` — mọi khẳng định trong câu trả lời có truy được về context không, tức đo mức bịa.
- `answer relevance` — câu trả lời có đúng trọng tâm câu hỏi không.
- Tỉ lệ từ chối đúng lúc — khi context không có thông tin, model có nói "không biết" không.

Cách làm: dựng eval set vài chục đến vài trăm cặp câu hỏi/đáp án chuẩn, chạy lại sau mỗi thay đổi; phần chấm chất lượng có thể dùng LLM làm giám khảo nhưng nên có mẫu người kiểm tra chéo. Song song đó theo dõi chỉ số vận hành: latency p95 và cost mỗi request.

</details>

**20. Bài toán nào nên dùng LLM và bài toán nào nên dùng code thường? Cho một ví dụ kết hợp cả hai.**

<details className="qa">
<summary>Xem đáp án</summary>

**Dùng LLM** cho việc mơ hồ, liên quan ngôn ngữ tự nhiên hoặc dữ liệu phi cấu trúc: tóm tắt, dịch, phân tích sentiment, classification text, sinh/refactor code, giao diện hội thoại, hỏi đáp tài liệu nội bộ (`RAG`), trích xuất dữ liệu từ HTML/PDF.

**Dùng code thường** khi cần chính xác và rẻ: tính toán số học, tài chính, business logic dạng rule, đường real-time dưới `100ms`, tác vụ cần reproducible để audit, và các luồng khối lượng lớn nhưng logic đơn giản (gọi LLM sẽ quá đắt).

**Ví dụ hybrid** — xử lý email phản hồi của khách:

```
User gửi email phản hồi
  ↓
LLM: trích sentiment + topic + urgency → JSON
  ↓
Code: route ticket theo rule deterministic
  ↓
Code: insert DB, gửi notification
```

LLM lo phần khó là hiểu ngôn ngữ tự nhiên; code lo phần cần chắc chắn và có thể test. Đây là pattern nên mặc định áp dụng thay vì giao trọn quy trình cho LLM.

</details>

**21. Rủi ro bảo mật khi đưa LLM vào backend: `prompt injection`, rò rỉ dữ liệu nhạy cảm qua prompt, chi phí bị lạm dụng. Bạn phòng thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Prompt injection** — nội dung do người dùng (hoặc tài liệu được retrieve) cung cấp chứa chỉ thị kiểu "bỏ qua hướng dẫn trước đó". Phòng: coi mọi text bên ngoài là **dữ liệu, không phải lệnh**; tách rõ ranh giới context trong prompt; không để output LLM tự động kích hoạt hành động nguy hiểm (xoá DB, gửi tiền, gọi API nội bộ) mà phải qua allowlist và bước xác nhận; áp quyền ở tầng code chứ đừng trông cậy model tự giữ.

**Rò rỉ dữ liệu** — đừng nhét PII, secret, token vào prompt; lọc/masking trước khi gửi; lọc tài liệu theo quyền của user **trước** khi retrieve, nếu không RAG sẽ vô tình trả về tài liệu người đó không được xem; xem chính sách lưu trữ dữ liệu của provider, cân nhắc model self-host cho dữ liệu nhạy cảm.

**Lạm dụng chi phí** — rate limit theo user, đặt `max_tokens`, giới hạn độ dài input, đặt ngân sách và cảnh báo, theo dõi cost theo từng endpoint, dùng model rẻ cho đường đi phổ thông.

Ngoài ra luôn validate output trước khi hiển thị để tránh XSS từ text model sinh ra.

</details>

**22. Làm sao bắt LLM trả về dữ liệu có cấu trúc (JSON) đáng tin cậy? Xử lý ra sao khi model trả về JSON hỏng?**

<details className="qa">
<summary>Xem đáp án</summary>

Thứ tự ưu tiên:

1. **Dùng cơ chế có sẵn của provider** — structured output / tool use / function calling với JSON schema. Đây là cách chắc nhất vì ràng buộc ngay ở bước decode, không phải xin model "làm ơn trả JSON".
2. **Prompt rõ ràng** — mô tả schema, cho một ví dụ output mẫu, cấm thêm lời dẫn hay khối markdown bao quanh.
3. **`temperature` thấp** cho tác vụ extract.

Phía code luôn phải phòng thủ:

```ts
const parsed = Schema.safeParse(JSON.parse(text));
if (!parsed.success) { /* retry hoặc fallback */ }
```

Khi JSON hỏng:

- **Retry có giới hạn** (1-2 lần), gửi kèm thông báo lỗi parse để model tự sửa.
- **Sửa nhẹ** phần thường gặp: gỡ code fence bao quanh, cắt phần text thừa trước/sau dấu ngoặc ngoài cùng.
- Nếu output bị cắt giữa chừng, nhiều khả năng chạm `max_tokens` → tăng giới hạn hoặc chia nhỏ tác vụ.
- **Fallback** về luồng deterministic hoặc đẩy cho người xử lý, đồng thời log lại để cải tiến prompt.

Nguyên tắc: không bao giờ tin thẳng output LLM — luôn validate bằng schema (Zod/Pydantic) trước khi ghi DB.

</details>
