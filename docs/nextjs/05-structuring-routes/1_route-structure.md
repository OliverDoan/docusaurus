---
sidebar_position: 1
title: "1. Structuring Routes và API Endpoints"
---

# Structuring Routes và API Endpoints

---

## Mục lục

- [Folder structure tốt](#folder-structure-tốt)
- [Co-location](#co-location)
- [Private folder _name](#private-folder-_name)
- [Route Handlers (API)](#route-handlers-api)
- [Method handlers](#method-handlers)
- [Request và Response](#request-và-response)

---

## Folder structure tốt

Pattern phổ biến — **organize theo feature**:

```
app/
├── (marketing)/
│   ├── layout.tsx
│   ├── page.tsx
│   └── pricing/page.tsx
│
├── (app)/
│   ├── layout.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── _components/
│   │   │   ├── Chart.tsx
│   │   │   └── StatCard.tsx
│   │   └── _utils/
│   │       └── format.ts
│   └── settings/
│       ├── page.tsx
│       ├── account/page.tsx
│       └── billing/page.tsx
│
├── api/
│   └── users/
│       └── route.ts
│
└── layout.tsx
```

---

## Co-location

Đặt **component, util, type** liên quan **cạnh route** dùng nó:

```
app/dashboard/
├── page.tsx
├── components/
│   ├── Chart.tsx       # chỉ dùng ở dashboard
│   └── StatCard.tsx
├── utils/
│   └── format.ts
└── types.ts
```

Lợi ích:

- **Dễ tìm** — code nằm cạnh nơi dùng.
- **Easy to delete** — xoá folder = xoá feature.
- **Encapsulation** — không "leak" ra ngoài.

:::info[Phân tích]

**Phân biệt 3 nơi đặt code**:

| Vị trí | Khi nào |
|--------|---------|
| `app/feature/components/X.tsx` | Component **chỉ feature đó** dùng |
| `components/X.tsx` (root) | Component **dùng ở nhiều feature** |
| `components/ui/Button.tsx` | Design system primitive |

Pattern shadcn/ui:

```
app/
├── dashboard/
│   ├── page.tsx
│   └── components/StatCard.tsx
│
components/
├── ui/                  # shadcn copy-paste
│   ├── button.tsx
│   ├── card.tsx
│   └── dialog.tsx
└── shared/              # custom component shared
    └── PageHeader.tsx
```

Refactor pattern khi component được dùng ở nơi thứ 2 → **move lên root**
`components/`. Không cố giữ trong feature folder.

:::

---

## Private folder _name

Folder bắt đầu bằng `_` → **không được Next.js coi là route**:

```
app/
├── _components/         # private, không route
├── _utils/              # private
└── dashboard/
    └── page.tsx
```

`_components` và `_utils` chứa code helper. Folder thường (`components/`)
**cũng không tạo route** trừ khi có `page.tsx` — nhưng `_` là rõ ý đồ
hơn.

---

## Route Handlers (API)

Tạo API endpoint trong App Router — file `route.ts`:

```ts
// app/api/users/route.ts
export async function GET() {
  const users = await db.user.findMany();
  return Response.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const user = await db.user.create({ data: body });
  return Response.json(user, { status: 201 });
}
```

Endpoint:

- `GET /api/users` → list users.
- `POST /api/users` → create.

Dynamic API:

```ts
// app/api/users/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await db.user.findUnique({ where: { id } });

  if (!user) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json(user);
}
```

---

## Method handlers

Export function tương ứng method:

```ts
// app/api/users/route.ts
export async function GET()    { /* ... */ }
export async function POST()   { /* ... */ }
export async function PUT()    { /* ... */ }
export async function PATCH()  { /* ... */ }
export async function DELETE() { /* ... */ }
export async function HEAD()   { /* ... */ }
export async function OPTIONS(){ /* ... */ }
```

Method nào không có handler → Next.js trả `405 Method Not Allowed` tự động.

---

## Request và Response

Route handler dùng **Web Standards** API:

```ts
export async function POST(request: Request) {
  // Read body
  const json = await request.json();
  const text = await request.text();
  const formData = await request.formData();

  // Headers
  const auth = request.headers.get("Authorization");

  // URL & query
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  // Cookies
  const cookies = request.headers.get("Cookie");

  return Response.json({ ok: true });
}
```

`Response` API:

```ts
// JSON
Response.json({ data });

// Text
new Response("Hello", { headers: { "Content-Type": "text/plain" } });

// Stream
const stream = new ReadableStream({ ... });
new Response(stream);

// Redirect
Response.redirect("/login", 302);

// Status + headers
Response.json(
  { error: "Forbidden" },
  { status: 403, headers: { "X-Custom": "..." } }
);
```

:::info[Phân tích]

**Next.js Web Standards** vs **Node API cũ**:

| Cũ (Pages Router API) | Mới (App Router Route Handler) |
|----------------------|--------------------------------|
| `req.body` (parsed) | `await request.json()` |
| `req.query` | `new URL(req.url).searchParams` |
| `res.status(200).json({})` | `Response.json({}, { status: 200 })` |
| `res.setHeader(...)` | `Response(..., { headers })` |

Lợi ích Web Standards:

- **Tương thích Edge Runtime** — không cần Node.
- **Portable** — code chạy được trên Bun, Deno, Cloudflare Workers, Vercel Edge.
- **Streaming native** — `ReadableStream` standard.
- **Test dễ** — không cần mock Node API.

→ Đây là direction của toàn web ecosystem — Hono, Bun, Deno đều dùng
Web Standards.

:::

:::tip[Mẹo]

**Pattern wrapper cho API route**:

```ts
// lib/api.ts
export async function withAuth<T>(
  request: Request,
  handler: (user: User) => Promise<T>
): Promise<Response> {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const user = await verifyToken(token);
    const result = await handler(user);
    return Response.json(result);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
```

```ts
// app/api/profile/route.ts
import { withAuth } from "@/lib/api";

export async function GET(request: Request) {
  return withAuth(request, async (user) => {
    return await db.user.findUnique({ where: { id: user.id } });
  });
}
```

Auth + error handling trung tâm → mọi route ngắn, consistent.

:::

:::warning[Cần lưu ý]

**Route Handler vs Server Action — khi nào dùng cái nào?**

| | Route Handler | Server Action |
|--|---------------|---------------|
| Use case | API public, third-party | Form mutation từ component |
| Public? | **Có** (URL accessible) | Không (internal RPC) |
| Method | GET, POST, PUT, DELETE... | POST only |
| Schema validation | Tự làm | Tự làm (Zod) |
| Type-safe | Phải khai báo client | **Tự động** từ function |

→ Server Actions thay thế cho **CRUD trong app**. Route Handler cần khi:

- **API public** cho client khác (mobile, third-party).
- **Webhook receiver**.
- **OAuth callback**.
- **Stream**, **SSE**, **file upload** đặc biệt.

Trong App Router, đa số mutation form đi qua Server Action — gọn hơn,
type-safe.

:::
