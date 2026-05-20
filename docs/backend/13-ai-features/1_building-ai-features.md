---
sidebar_position: 1
title: "1. Building AI-powered Features"
---

# Building AI-powered Features

---

## Mục lục

- [Integration patterns](#integration-patterns)
- [Streaming](#streaming)
- [Structured Output](#structured-output)
- [Function Calling / Tool Use](#function-calling--tool-use)
- [LLM Providers](#llm-providers)
- [Prompt Engineering](#prompt-engineering)
- [AI Agents](#ai-agents)
- [MCP (Model Context Protocol)](#mcp-model-context-protocol)

---

## Integration patterns

**Basic chat completion**:

```ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const response = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1000,
  messages: [
    { role: "user", content: "Giải thích event loop JavaScript" },
  ],
});

console.log(response.content[0].text);
```

**System prompt** — instruction cho behavior:

```ts
const response = await client.messages.create({
  model: "claude-sonnet-4-6",
  system: "Bạn là expert backend Vietnamese. Trả lời ngắn gọn, có code example.",
  messages: [
    { role: "user", content: "REST vs GraphQL?" },
  ],
});
```

**Multi-turn conversation**:

```ts
const messages = [
  { role: "user", content: "Tên tôi là An" },
  { role: "assistant", content: "Chào An!" },
  { role: "user", content: "Tên tôi là gì?" },  // AI nhớ context
];

const response = await client.messages.create({
  model: "claude-haiku-4-5-20251001",
  max_tokens: 100,
  messages,
});
```

---

## Streaming

UI feedback nhanh — token-by-token thay vì đợi xong:

```ts
const stream = await client.messages.stream({
  model: "claude-sonnet-4-6",
  max_tokens: 1000,
  messages: [{ role: "user", content: "Viết blog 500 từ về AI" }],
});

for await (const event of stream) {
  if (event.type === "content_block_delta") {
    process.stdout.write(event.delta.text);
  }
}
```

**Server-Sent Events** trả về browser:

```ts
// Next.js app/api/chat/route.ts
export async function POST(req: Request) {
  const { messages } = await req.json();

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (event.type === "content_block_delta") {
          controller.enqueue(encoder.encode(event.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/event-stream" },
  });
}
```

Client đọc stream:

```ts
const response = await fetch("/api/chat", { method: "POST", body: JSON.stringify({ messages }) });
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  setText(prev => prev + decoder.decode(value));
}
```

Hoặc dùng **Vercel AI SDK** wrap sẵn:

```ts
// app/api/chat/route.ts
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    messages,
  });

  return result.toDataStreamResponse();
}
```

```tsx
// Component
"use client";
import { useChat } from "@ai-sdk/react";

export default function Chat() {
  const { messages, input, handleSubmit, handleInputChange } = useChat();

  return (
    <div>
      {messages.map(m => <div key={m.id}>{m.content}</div>)}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
      </form>
    </div>
  );
}
```

---

## Structured Output

LLM trả về **JSON đúng schema** — useful cho data extraction.

```ts
import { z } from "zod";

const UserSchema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email(),
});

const response = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 200,
  system: `Extract user info as JSON matching schema:
${JSON.stringify(UserSchema.shape)}
Return ONLY JSON, no markdown.`,
  messages: [{
    role: "user",
    content: "Tôi tên An, 25 tuổi, email an@example.com"
  }],
});

const json = JSON.parse(response.content[0].text);
const user = UserSchema.parse(json); // validate
```

Hoặc dùng **Vercel AI SDK** `generateObject`:

```ts
import { generateObject } from "ai";

const { object: user } = await generateObject({
  model: anthropic("claude-sonnet-4-6"),
  schema: UserSchema,
  prompt: "Tôi tên An, 25 tuổi, email an@example.com",
});

// user fully typed!
```

:::info[Phân tích]

**Use case structured output**:

- **Form auto-fill** từ ảnh receipt → JSON.
- **Email classification** → category + urgency.
- **PDF parsing** → structured data.
- **Web scraping** → extract info từ HTML.
- **Resume parsing** → name + skill + experience.

Trước đây cần regex + parser phức tạp. Giờ LLM + schema = 10 dòng code.

:::

---

## Function Calling / Tool Use

LLM **decide** gọi function nào với arg nào.

```ts
const tools = [
  {
    name: "get_weather",
    description: "Get current weather for location",
    input_schema: {
      type: "object",
      properties: {
        location: { type: "string" },
      },
      required: ["location"],
    },
  },
  {
    name: "send_email",
    description: "Send email to user",
    input_schema: {
      type: "object",
      properties: {
        to: { type: "string" },
        subject: { type: "string" },
        body: { type: "string" },
      },
    },
  },
];

const response = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1000,
  tools,
  messages: [{ role: "user", content: "Thời tiết Hà Nội thế nào?" }],
});

// Claude trả về tool_use block:
// { name: "get_weather", input: { location: "Hà Nội" } }
```

Server execute tool → trả kết quả về Claude → Claude tổng hợp answer:

```ts
const toolResult = await getWeather({ location: "Hà Nội" });

const finalResponse = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1000,
  tools,
  messages: [
    { role: "user", content: "Thời tiết Hà Nội thế nào?" },
    { role: "assistant", content: response.content },
    {
      role: "user",
      content: [{
        type: "tool_result",
        tool_use_id: "...",
        content: JSON.stringify(toolResult),
      }],
    },
  ],
});
```

→ "Hà Nội đang 28°C, nắng nhẹ."

Use case:

- **API integration** — LLM gọi weather, calendar, DB.
- **Database query** — natural language → SQL → result.
- **Action automation** — book meeting, send mail.

---

## LLM Providers

**Anthropic (Claude)**:

```ts
import Anthropic from "@anthropic-ai/sdk";
const anthropic = new Anthropic();
await anthropic.messages.create({ ... });
```

**OpenAI**:

```ts
import OpenAI from "openai";
const openai = new OpenAI();
await openai.chat.completions.create({ ... });
```

**Google Gemini**:

```ts
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
```

**Multi-provider** với Vercel AI SDK:

```ts
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";

// Easy switch
const model = process.env.MODEL === "gpt" ? openai("gpt-5") : anthropic("claude-sonnet-4-6");

await generateText({ model, prompt: "..." });
```

---

## Prompt Engineering

**Techniques**:

**1. Clear instruction**:

```
SAI: "Help me with email"
ĐÚNG: "Viết email professional, 100 từ, gửi sếp xin nghỉ phép 3 ngày
       lý do family event"
```

**2. Few-shot examples**:

```
"Classify sentiment as positive/negative/neutral.

Example:
Input: 'Sản phẩm tuyệt vời!' → positive
Input: 'Tệ, không đáng giá tiền' → negative
Input: 'OK, bình thường' → neutral

Now classify:
Input: 'Giao hàng nhanh, đóng gói cẩn thận' → ?"
```

**3. Chain of Thought** — "Hãy suy luận từng bước":

```
"Giải bài toán sau, suy nghĩ từng bước trước khi trả lời cuối:

Có 23 quả táo, ăn 5 quả, mua thêm 7 quả..."
```

**4. Role assignment**:

```
"You are an experienced Vietnamese backend engineer with 10 years
focus on Node.js and Postgres. Review the following code..."
```

**5. Output format constraint**:

```
"Reply with EXACTLY this JSON structure:
{ \"summary\": \"...\", \"action_items\": [\"...\"] }
No markdown, no explanation."
```

---

## AI Agents

**Agent** = LLM + tool + loop tự thực hiện task multi-step.

**Loop cơ bản**:

```
1. LLM decide action (tool call).
2. Execute tool → get result.
3. LLM evaluate: done hay continue?
4. Goto 1 nếu continue.
```

Frameworks:

- **Claude Agent SDK** — Anthropic official.
- **Mastra** (Node).
- **CrewAI** (Python).
- **LangChain / LangGraph** — popular, complex.
- **AutoGPT** — early agent.

```ts
// Anthropic Agent SDK (sketch)
const agent = new Agent({
  model: "claude-sonnet-4-6",
  tools: [searchWeb, queryDB, sendEmail],
  systemPrompt: "Bạn là assistant giúp user lên kế hoạch.",
});

await agent.run("Đặt lịch họp tuần sau với team, gửi mời mọi người.");
// Agent: search calendar → query team → propose time → send email
```

---

## MCP (Model Context Protocol)

**MCP** — chuẩn để **expose tool/data cho AI assistant** (Claude Code,
Cursor, IDE).

```
Claude Code/Cursor ←→ MCP server ←→ Your tool (DB, API, file)
```

Lợi ích:

- **Standard** — viết MCP server 1 lần, mọi AI client dùng được.
- **Isolation** — tool chạy process riêng.
- **Composable** — combine nhiều MCP server.

```ts
// Simple MCP server
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

const server = new Server({
  name: "my-server",
  version: "1.0.0",
});

server.setRequestHandler("tools/list", async () => ({
  tools: [
    {
      name: "query_database",
      description: "Query our PostgreSQL DB",
      inputSchema: { type: "object", properties: { sql: { type: "string" } } },
    },
  ],
}));

server.setRequestHandler("tools/call", async (request) => {
  if (request.params.name === "query_database") {
    const result = await db.query(request.params.arguments.sql);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
});
```

MCP servers ecosystem 2026:

- **Filesystem**, **GitHub**, **Slack**, **Linear**, **Notion**.
- **Database** — Postgres, MongoDB, Redis.
- **Browser** — Playwright, Puppeteer.
- **Search** — Brave, Exa, Tavily.

:::tip[Mẹo]

**Best practices building AI features**:

1. **Start with prompt** — không train model. 90% case prompt + RAG đủ.
2. **Test với multiple example** — LLM probabilistic, test edge case.
3. **Fallback graceful** — LLM API down hoặc hallucinate.
4. **Rate limit + cost cap** — không để runaway cost.
5. **Stream cho UX** — perceived latency thấp hơn.
6. **Cache prompt** — context lặp lại → discount 90%.
7. **Log conversation** — debug + improvement data.
8. **Filter PII** — không gửi user data nhạy cảm.
9. **Eval** — auto test với golden dataset.
10. **Iterate prompt** — A/B test variant.

Mindset: AI feature là **iterative product**, không "launch and forget".
Monitor quality, refine prompt theo feedback.

:::

:::info[Phân tích]

**AI feature production checklist**:

- [ ] **Cost tracking** — per-user budget, alert.
- [ ] **Rate limit** — chống abuse.
- [ ] **Content filter** — moderate input + output.
- [ ] **Fallback model** — backup khi primary fail.
- [ ] **Retry với exponential backoff**.
- [ ] **Timeout** — 30s, 60s cap.
- [ ] **Streaming UI** — feedback nhanh.
- [ ] **Error message user-friendly** — không expose API error.
- [ ] **Log** prompt + response (filter PII).
- [ ] **Quality eval** — golden dataset chạy CI.
- [ ] **User feedback loop** — thumbs up/down.
- [ ] **Prompt version** — track change.

Tool hỗ trợ:

- **Langfuse**, **Helicone** — LLM observability.
- **Braintrust**, **Promptfoo** — prompt eval.
- **Portkey** — gateway, fallback, cache.

:::
