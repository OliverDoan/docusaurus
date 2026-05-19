---
sidebar_position: 1
title: "1. Node.js vs Edge Runtime"
---

# Node.js vs Edge Runtime

---

## Mục lục

- [Hai runtime trong Next.js](#hai-runtime-trong-nextjs)
- [Node.js Runtime](#nodejs-runtime)
- [Edge Runtime](#edge-runtime)
- [Khi nào dùng cái nào?](#khi-nào-dùng-cái-nào)
- [Trade-offs](#trade-offs)

---

## Hai runtime trong Next.js

Next.js cho phép mỗi route chọn runtime:

| Runtime | Env | Performance | Tính năng |
|---------|-----|-------------|-----------|
| **Node.js** | Node | Cold start chậm hơn | Đầy đủ Node API |
| **Edge** | V8 isolate | Cold start ~ms | Chỉ Web Standards |

Default: **Node.js** cho page/route handler. **Edge** cho middleware.

Khai báo runtime:

```ts
// app/api/users/route.ts
export const runtime = "edge";    // hoặc "nodejs"

// Áp dụng cho cả file
```

---

## Node.js Runtime

Đầy đủ tính năng:

```ts
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs"; // default

export async function GET() {
  const data = fs.readFileSync("./data.json", "utf-8");
  const users = await new PrismaClient().user.findMany();
  return Response.json({ data, users });
}
```

Có:

- `fs`, `path`, `child_process`, `http`, `crypto`.
- Node API như Buffer, Stream native.
- Mọi npm package Node-only.
- Long-running operation, heavy CPU.

**Cold start**: ~500ms - 2s tùy bundle.

**Phù hợp**:

- Database query với ORM (Prisma cũ chưa Edge).
- File I/O.
- Heavy computation.
- Third-party SDK Node-only (puppeteer, sharp, ffmpeg).

---

## Edge Runtime

Chạy trên **V8 isolate** — light, distributed gần user (CDN edge).

```ts
// app/api/data/route.ts
export const runtime = "edge";

export async function GET(request: Request) {
  const data = await fetch("https://api.example.com/data");
  return new Response(await data.text());
}
```

Có:

- Web Standards: `Request`, `Response`, `fetch`, `URL`, `Headers`, `crypto`.
- `console`, `setTimeout`, `Promise`.
- `TextEncoder`, `TextDecoder`.
- `ReadableStream`, `WritableStream`.

**Không** có:

- `fs`, `path`, `child_process`.
- Node-only API (Buffer cần polyfill).
- Most ORM (Prisma cần Accelerate hoặc HTTP driver).
- Native module (`sharp`, `bcrypt` không work).

**Cold start**: ~vài ms — gần như instant.

**Phù hợp**:

- Auth check (verify JWT signature).
- Header/cookie manipulation.
- Geo routing.
- Light API endpoint.
- A/B testing routing.
- Streaming OpenAI/AI completion.

:::info[Phân tích]

**Tại sao Edge Runtime nhanh?**

1. **V8 isolate** — không phải full Node process. Mỗi isolate ~50-100MB
   memory, share V8 engine.
2. **Distributed** — chạy gần user (300+ location).
3. **No cold start** — isolate "warm" sẵn ở mỗi edge node.
4. **Streaming-friendly** — `ReadableStream` native.

So với Lambda Node:

- Lambda cold start: 1-3s (load Node + import deps + connect DB).
- Edge cold start: 10-50ms.

Edge **không phù hợp** mọi case:

- Bundle size limit (1MB sau gzip Vercel).
- CPU limit (50ms - vài hundred ms tùy provider).
- Không persistent memory state.

→ Dùng Edge cho **light, latency-critical**. Dùng Node cho **complex,
heavy**.

:::

---

## Khi nào dùng cái nào?

**Node.js** khi:

- DB query với Prisma/Drizzle TCP driver.
- File processing (upload, resize image).
- PDF generation.
- Heavy AI inference local.
- Third-party SDK Node-only.

**Edge** khi:

- Middleware (default).
- Auth check qua JWT signature.
- Geo redirect.
- Light proxy API.
- Streaming AI response.
- Vercel KV / Upstash Redis access.

```ts
// Middleware (always Edge)
// middleware.ts
export async function middleware(request) { /* ... */ }

// API route — chọn
export const runtime = "edge";   // hoặc "nodejs"
```

```ts
// Page — chọn (default node)
export const runtime = "edge";

export default async function Page() {
  const data = await fetch(...);
  return <div>{data.title}</div>;
}
```

---

## Trade-offs

| Aspect | Node.js | Edge |
|--------|---------|------|
| Bundle size | Lớn OK (~50MB) | **Nhỏ** (~1MB) |
| Cold start | Chậm (1-3s) | **Nhanh** (~10ms) |
| Latency (warm) | Tùy region | **Thấp** (gần user) |
| Database | Mọi driver | HTTP/serverless only |
| File system | **Có** | Không |
| Heavy CPU | OK | Limited |
| Long task | OK (60s+) | Limited (50ms - 30s) |
| Cost (Vercel) | Per invocation + time | Per request |

:::tip[Mẹo]

**Pattern hybrid** — Edge cho check, Node cho heavy:

```ts
// middleware.ts (Edge) — auth check
export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", request.url));

  // Pass user info xuống
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("X-User-Id", await getUserIdFromToken(token));

  return NextResponse.next({ request: { headers: requestHeaders } });
}
```

```ts
// app/api/heavy/route.ts (Node) — DB query phức tạp
export const runtime = "nodejs";

export async function GET(request: Request) {
  const userId = request.headers.get("X-User-Id");
  const data = await prisma.user.findMany({ /* complex query */ });
  return Response.json(data);
}
```

Tận dụng Edge cho **fast check, gating**, Node cho **heavy compute**.

:::

:::info[Phân tích]

**Database trên Edge**:

| Provider | Edge support |
|----------|--------------|
| **Neon** (Postgres) | `@neondatabase/serverless` |
| **Turso** (LibSQL) | `@libsql/client` |
| **PlanetScale** | `@planetscale/database` |
| **Vercel Postgres** | `@vercel/postgres` (Neon-backed) |
| **Supabase** | Postgres-js + supabase-js |
| **Upstash Redis** | `@upstash/redis` |
| **MongoDB Atlas** | Data API (HTTP) |

Pattern HTTP-based driver:

- Không TCP — dùng HTTP/WebSocket.
- Latency cao hơn TCP (~50ms overhead per query).
- Nhưng work mọi serverless/edge environment.

Cho **read-heavy + cache**, Edge + serverless DB + KV cache (Upstash) là
combo mạnh — chạy gần user, không tốn cold start.

:::

:::warning[Cần lưu ý]

**Mix Server Component runtime**:

```tsx
// app/page.tsx (Node runtime — default)
import sharp from "sharp"; // Node-only

async function Page() {
  // OK
}
```

```tsx
// app/api/edge-endpoint/route.ts (Edge runtime)
export const runtime = "edge";
import sharp from "sharp"; // BUILD ERROR — sharp không Edge-compat
```

Khi đổi từ Node → Edge: kiểm tra mọi dependency. ESLint sẽ warn nếu
detect.

Migrate Edge cẩn thận — không phải mọi page benefit. Đo lại latency
trước/sau.

:::
