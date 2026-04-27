---
sidebar_position: 1
title: "1. Route Handlers & API"
---

# Route Handlers & API


---

## Mục lục

- [Route Handlers là gì?](#route-handlers-là-gì)
- [Tạo Route Handler đầu tiên](#tạo-route-handler-đầu-tiên)
- [HTTP Methods](#http-methods)
- [Request và Response objects](#request-và-response-objects)
- [Dynamic Route Handlers](#dynamic-route-handlers)
- [Streaming Responses](#streaming-responses)
- [CORS Headers](#cors-headers)
- [Cookies và Headers API](#cookies-và-headers-api)
- [Route Handlers vs Server Actions](#route-handlers-vs-server-actions)
- [Real-world: REST API cho CRUD operations](#real-world-rest-api-cho-crud-operations)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Route Handlers là gì?

Route Handlers là cách Next.js cho phép bạn tạo **API endpoints** trực tiếp trong ứng dụng. Thay vì cần một backend server riêng (Express, Fastify...), bạn viết API ngay trong thư mục `app/` bằng file `route.ts`.

Route Handlers sử dụng **Web API chuẩn** — `Request` và `Response` objects — nên kiến thức này có thể áp dụng ở bất kỳ đâu, không chỉ riêng Next.js.

```
app/
├── api/
│   ├── users/
│   │   ├── route.ts          → GET/POST /api/users
│   │   └── [id]/
│   │       └── route.ts      → GET/PUT/DELETE /api/users/:id
│   └── health/
│       └── route.ts          → GET /api/health
```

## Tạo Route Handler đầu tiên

### File convention: `route.ts`

Mỗi file `route.ts` (hoặc `route.js`) trong thư mục `app/` tự động trở thành một API endpoint. Đường dẫn URL tương ứng với vị trí file trong thư mục.

```tsx
// app/api/hello/route.ts
// Endpoint: GET /api/hello

import { NextResponse } from "next/server";

// Hàm GET — xử lý HTTP GET request
export async function GET() {
  return NextResponse.json({
    message: "Xin chào từ Next.js API!",
    timestamp: new Date().toISOString(),
  });
}
```

:::tip
File `route.ts` **không thể tồn tại cùng cấp** với file `page.tsx`. Nếu bạn có `app/api/page.tsx` và `app/api/route.ts`, Next.js sẽ báo lỗi. Đây là quy tắc bắt buộc.
:::

## HTTP Methods

Route Handlers hỗ trợ tất cả HTTP methods phổ biến. Mỗi method là một **named export** trong file `route.ts`.

```tsx
// app/api/users/route.ts

import { NextRequest, NextResponse } from "next/server";

// ===== GET — Lấy danh sách users =====
export async function GET(request: NextRequest) {
  // Đọc query parameters từ URL
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  // Giả lập lấy data từ database
  const users = [
    { id: 1, name: "Nguyễn Văn A", email: "a@example.com" },
    { id: 2, name: "Trần Thị B", email: "b@example.com" },
  ];

  return NextResponse.json({
    data: users,
    meta: { page, limit, total: users.length },
  });
}

// ===== POST — Tạo user mới =====
export async function POST(request: NextRequest) {
  try {
    // Đọc body từ request
    const body = await request.json();

    // Validate input
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: "Thiếu trường name hoặc email" },
        { status: 400 }
      );
    }

    // Giả lập tạo user trong database
    const newUser = {
      id: Date.now(),
      name: body.name,
      email: body.email,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ" },
      { status: 400 }
    );
  }
}
```

### PUT, PATCH, DELETE

```tsx
// app/api/users/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";

// Type cho params — Next.js 15 yêu cầu params là Promise
type Params = { params: Promise<{ id: string }> };

// ===== GET — Lấy user theo ID =====
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;

  // Giả lập tìm user trong database
  const user = { id: parseInt(id), name: "Nguyễn Văn A", email: "a@example.com" };

  if (!user) {
    return NextResponse.json(
      { error: "Không tìm thấy user" },
      { status: 404 }
    );
  }

  return NextResponse.json(user);
}

// ===== PUT — Cập nhật toàn bộ user =====
export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  // PUT yêu cầu gửi đầy đủ tất cả fields
  const updatedUser = {
    id: parseInt(id),
    name: body.name,
    email: body.email,
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(updatedUser);
}

// ===== PATCH — Cập nhật một phần user =====
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  // PATCH chỉ cập nhật fields được gửi lên
  // Giả lập merge với data hiện tại
  const existingUser = { id: parseInt(id), name: "Nguyễn Văn A", email: "a@example.com" };
  const updatedUser = { ...existingUser, ...body };

  return NextResponse.json(updatedUser);
}

// ===== DELETE — Xóa user =====
export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;

  // Giả lập xóa user
  return NextResponse.json(
    { message: `Đã xóa user ${id}` },
    { status: 200 }
  );
}
```

## Request và Response objects

### NextRequest — mở rộng của Web Request

`NextRequest` kế thừa từ Web API `Request` và thêm các tiện ích riêng cho Next.js.

```tsx
// app/api/demo/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // === Đọc body ===
  const jsonBody = await request.json();         // Body dạng JSON
  // const textBody = await request.text();       // Body dạng text
  // const formData = await request.formData();   // Body dạng FormData

  // === Query parameters ===
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");           // ?q=nextjs → "nextjs"
  const tags = searchParams.getAll("tag");       // ?tag=react&tag=next → ["react", "next"]

  // === Headers ===
  const contentType = request.headers.get("content-type");
  const authToken = request.headers.get("authorization");

  // === Cookies ===
  const sessionCookie = request.cookies.get("session");
  const allCookies = request.cookies.getAll();

  // === URL info ===
  const pathname = request.nextUrl.pathname;     // /api/demo
  const fullUrl = request.url;                   // http://localhost:3000/api/demo?q=nextjs

  return NextResponse.json({
    body: jsonBody,
    query,
    pathname,
  });
}
```

### NextResponse — tạo response linh hoạt

```tsx
import { NextResponse } from "next/server";

export async function GET() {
  // === JSON response ===
  const jsonRes = NextResponse.json(
    { data: "hello" },
    { status: 200 }
  );

  // === Redirect ===
  const redirectRes = NextResponse.redirect(
    new URL("/login", "http://localhost:3000")
  );

  // === Response với custom headers ===
  const response = NextResponse.json({ data: "hello" });
  response.headers.set("X-Custom-Header", "my-value");
  response.headers.set("Cache-Control", "max-age=3600");

  // === Set cookies ===
  response.cookies.set("session", "abc123", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 ngày
  });

  return response;
}
```

## Dynamic Route Handlers

Giống như pages, Route Handlers cũng hỗ trợ dynamic segments.

```tsx
// app/api/posts/[slug]/comments/[commentId]/route.ts
// URL: /api/posts/hello-world/comments/42

import { NextRequest, NextResponse } from "next/server";

type Params = {
  params: Promise<{
    slug: string;
    commentId: string;
  }>;
};

export async function GET(request: NextRequest, { params }: Params) {
  const { slug, commentId } = await params;

  return NextResponse.json({
    post: slug,          // "hello-world"
    commentId: commentId, // "42"
  });
}
```

### Catch-all Route Handlers

```tsx
// app/api/proxy/[...path]/route.ts
// Khớp với: /api/proxy/a, /api/proxy/a/b, /api/proxy/a/b/c, ...

type Params = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { path } = await params;
  // /api/proxy/users/123/posts → path = ["users", "123", "posts"]

  const targetUrl = `https://external-api.com/${path.join("/")}`;

  // Proxy request đến API bên ngoài
  const response = await fetch(targetUrl);
  const data = await response.json();

  return NextResponse.json(data);
}
```

## Streaming Responses

Route Handlers hỗ trợ streaming — gửi dữ liệu theo từng phần thay vì đợi xong mới gửi. Rất hữu ích cho AI chatbot, real-time data, hoặc xử lý file lớn.

```tsx
// app/api/stream/route.ts

export async function GET() {
  const encoder = new TextEncoder();

  // Tạo ReadableStream
  const stream = new ReadableStream({
    async start(controller) {
      // Giả lập gửi dữ liệu theo từng phần
      const messages = [
        "Xin chào! ",
        "Đây là ",
        "streaming response ",
        "từ Next.js.",
      ];

      for (const msg of messages) {
        // Gửi từng phần
        controller.enqueue(encoder.encode(msg));
        // Đợi 500ms giữa mỗi phần
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Đóng stream
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
```

### Server-Sent Events (SSE)

```tsx
// app/api/events/route.ts
// Dùng cho real-time updates (notifications, live data...)

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let count = 0;

      const interval = setInterval(() => {
        count++;
        // Format SSE: "data: ...\n\n"
        const data = JSON.stringify({
          id: count,
          message: `Sự kiện #${count}`,
          time: new Date().toISOString(),
        });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));

        if (count >= 10) {
          clearInterval(interval);
          controller.close();
        }
      }, 1000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

## CORS Headers

Khi frontend và API ở khác domain (hoặc khác port trong development), bạn cần cấu hình CORS.

```tsx
// app/api/public/route.ts

import { NextRequest, NextResponse } from "next/server";

// Các origin được phép truy cập API
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://myapp.com",
];

// Hàm helper thêm CORS headers
function corsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400", // Cache preflight 24h
  };

  // Chỉ cho phép origin nằm trong danh sách
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

// Xử lý preflight request (OPTIONS)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");
  const data = { message: "API công khai" };

  return NextResponse.json(data, {
    headers: corsHeaders(origin),
  });
}
```

## Cookies và Headers API

### Đọc và ghi Cookies

```tsx
// app/api/auth/route.ts

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();

  // Đọc cookie
  const token = cookieStore.get("auth-token");
  console.log(token?.value); // Giá trị cookie

  // Set cookie
  cookieStore.set("session-id", "abc123", {
    httpOnly: true,       // Không truy cập được từ JavaScript
    secure: true,         // Chỉ gửi qua HTTPS
    sameSite: "lax",      // Bảo vệ CSRF
    path: "/",            // Áp dụng cho toàn site
    maxAge: 60 * 60 * 24, // Hết hạn sau 1 ngày
  });

  // Xóa cookie
  cookieStore.delete("old-cookie");

  return NextResponse.json({ success: true });
}
```

### Đọc Headers

```tsx
// app/api/info/route.ts

import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const headersList = await headers();

  const userAgent = headersList.get("user-agent");
  const referer = headersList.get("referer");
  const ip = headersList.get("x-forwarded-for") || "unknown";

  return NextResponse.json({
    userAgent,
    referer,
    ip,
  });
}
```

## Route Handlers vs Server Actions

Đây là câu hỏi thường gặp: khi nào dùng Route Handler, khi nào dùng Server Action?

| Tiêu chí | Route Handlers | Server Actions |
|-----------|---------------|----------------|
| **Khi nào dùng** | API cho bên ngoài, webhooks, streaming | Form submissions, data mutations từ UI |
| **Gọi từ đâu** | Bất kỳ client nào (fetch, curl, mobile app) | Chỉ từ React components |
| **HTTP Method** | GET, POST, PUT, DELETE... | Chỉ POST |
| **Caching** | Có thể cache GET requests | Không cache |
| **URL** | Có URL cố định (`/api/users`) | Không có URL trực tiếp |
| **Progressive Enhancement** | Không | Có (hoạt động khi JS bị tắt) |

### Quy tắc chọn

- **Dùng Route Handlers khi**: Tạo API cho mobile app, webhook receivers, file uploads phức tạp, streaming, proxy requests, API công khai.
- **Dùng Server Actions khi**: Form submission, update data từ UI, đơn giản hóa client-server communication.

## Real-world: REST API cho CRUD operations

Dưới đây là ví dụ hoàn chỉnh cho một REST API quản lý sản phẩm.

### Cấu trúc thư mục

```
app/api/products/
├── route.ts           → GET (list) + POST (create)
└── [id]/
    └── route.ts       → GET (detail) + PUT (update) + DELETE
```

### API chính

```tsx
// app/api/products/route.ts

import { NextRequest, NextResponse } from "next/server";

// Giả lập database bằng array (thực tế dùng Prisma, Drizzle...)
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  createdAt: string;
}

// Trong thực tế, data nên lấy từ database
let products: Product[] = [
  { id: 1, name: "iPhone 15", price: 999, category: "phone", createdAt: "2024-01-01" },
  { id: 2, name: "MacBook Pro", price: 2499, category: "laptop", createdAt: "2024-01-02" },
];

// GET /api/products — Lấy danh sách + tìm kiếm + phân trang
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  // Lấy query parameters
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") || "10"));
  const search = searchParams.get("search")?.toLowerCase();
  const category = searchParams.get("category");

  // Lọc theo điều kiện
  let filtered = [...products];
  if (search) {
    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(search)
    );
  }
  if (category) {
    filtered = filtered.filter((p) => p.category === category);
  }

  // Phân trang
  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return NextResponse.json({
    success: true,
    data: paginated,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// POST /api/products — Tạo sản phẩm mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate
    const errors: string[] = [];
    if (!body.name?.trim()) errors.push("Tên sản phẩm là bắt buộc");
    if (typeof body.price !== "number" || body.price <= 0) {
      errors.push("Giá phải là số dương");
    }
    if (!body.category?.trim()) errors.push("Danh mục là bắt buộc");

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    // Tạo product mới
    const newProduct: Product = {
      id: Date.now(),
      name: body.name.trim(),
      price: body.price,
      category: body.category.trim(),
      createdAt: new Date().toISOString(),
    };

    products.push(newProduct);

    return NextResponse.json(
      { success: true, data: newProduct },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Body không hợp lệ" },
      { status: 400 }
    );
  }
}
```

### API chi tiết theo ID

```tsx
// app/api/products/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

// Helper: tìm product (thực tế sẽ query database)
function findProduct(id: number) {
  // Đây chỉ là ví dụ — thực tế dùng db.product.findUnique({ where: { id } })
  return null; // Placeholder
}

// GET /api/products/:id
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const product = findProduct(parseInt(id));

  if (!product) {
    return NextResponse.json(
      { success: false, error: "Không tìm thấy sản phẩm" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: product });
}

// PUT /api/products/:id
export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  // Validate đầy đủ fields cho PUT
  if (!body.name || !body.price || !body.category) {
    return NextResponse.json(
      { success: false, error: "PUT yêu cầu tất cả fields" },
      { status: 400 }
    );
  }

  const updatedProduct = {
    id: parseInt(id),
    name: body.name,
    price: body.price,
    category: body.category,
    createdAt: body.createdAt || new Date().toISOString(),
  };

  return NextResponse.json({ success: true, data: updatedProduct });
}

// DELETE /api/products/:id
export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;

  return NextResponse.json({
    success: true,
    message: `Đã xóa sản phẩm #${id}`,
  });
}
```

## Lỗi thường gặp

### 1. Đặt `route.ts` cùng cấp với `page.tsx`

```
app/api/
├── page.tsx    ← Page component
└── route.ts   ← Route handler
```

Next.js sẽ báo lỗi conflict. Giải pháp: tách riêng page và API vào thư mục khác nhau.

### 2. Quên `await params` trong Next.js 15

```tsx
// SAI — params không còn là object đồng bộ trong Next.js 15
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id; // Lỗi!
}

// ĐÚNG — phải await params
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

### 3. Quên xử lý lỗi khi parse JSON body

```tsx
// SAI — sẽ crash nếu body không phải JSON
export async function POST(request: NextRequest) {
  const body = await request.json(); // Có thể throw error!
}

// ĐÚNG — bọc trong try-catch
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // xử lý...
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
```

### 4. GET Route Handler bị cache ngoài ý muốn

```tsx
// GET requests mặc định được cache trong production
// Nếu muốn data luôn fresh:
export const dynamic = "force-dynamic";

export async function GET() {
  // Data sẽ luôn được fetch mới
}
```

### 5. Gọi Route Handler nội bộ thay vì gọi trực tiếp function

```tsx
// SAI — không cần gọi API nội bộ trong Server Component
async function ProductPage() {
  const res = await fetch("http://localhost:3000/api/products"); // Không nên!
  const data = await res.json();
}

// ĐÚNG — gọi trực tiếp function/database
async function ProductPage() {
  const products = await db.product.findMany(); // Nhanh hơn nhiều!
}
```

## Câu hỏi phỏng vấn

### Câu 1: Route Handlers khác gì API Routes trong Pages Router?

**Trả lời:**

- **API Routes** (Pages Router) dùng file `pages/api/*.ts`, nhận `req`/`res` objects kiểu Node.js (`NextApiRequest`, `NextApiResponse`).
- **Route Handlers** (App Router) dùng file `app/**/route.ts`, sử dụng Web API chuẩn (`Request`, `Response`).
- Route Handlers hỗ trợ streaming, edge runtime, và tích hợp tốt hơn với App Router features (caching, revalidation).
- Route Handlers dùng named exports (`GET`, `POST`...) thay vì một handler function duy nhất.

### Câu 2: Khi nào nên dùng Route Handlers thay vì Server Actions?

**Trả lời:**

Dùng Route Handlers khi:
- Cần API endpoint có URL cố định (cho mobile app, webhook, third-party integration)
- Cần HTTP methods ngoài POST (GET, PUT, DELETE...)
- Cần streaming responses
- Cần CORS cho cross-origin access
- Cần cache GET responses

Dùng Server Actions khi:
- Mutation data từ React components (form submission)
- Muốn progressive enhancement (hoạt động khi JS tắt)
- Muốn tích hợp chặt với React (revalidation, redirect sau mutation)

### Câu 3: Làm sao để xử lý authentication trong Route Handler?

**Trả lời:**

```tsx
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  // Lấy token từ header
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const user = await verifyToken(token);

  if (!user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Tiếp tục xử lý với user đã xác thực
  return NextResponse.json({ user });
}
```

### Câu 4: GET Route Handler có được cache không? Làm sao để kiểm soát?

**Trả lời:**

Có, GET Route Handler mặc định được cache khi không đọc dynamic data. Cách kiểm soát:

- Dùng `export const dynamic = "force-dynamic"` để tắt cache hoàn toàn.
- Dùng `export const revalidate = 60` để cache 60 giây rồi revalidate.
- Đọc `cookies()`, `headers()`, hoặc `searchParams` sẽ tự động chuyển sang dynamic (không cache).
- Dùng `NextResponse` với `Cache-Control` header để kiểm soát cache ở CDN level.

### Câu 5: Streaming response hoạt động thế nào trong Route Handler?

**Trả lời:**

Route Handler sử dụng Web Streams API (`ReadableStream`) để gửi dữ liệu theo từng chunk. Quy trình:

1. Tạo `ReadableStream` với hàm `start(controller)`.
2. Dùng `controller.enqueue()` để gửi từng phần dữ liệu.
3. Dùng `controller.close()` khi hoàn thành.
4. Trả về `new Response(stream)` với headers phù hợp.

Ứng dụng thực tế: AI chatbot (stream từng token), Server-Sent Events cho real-time notifications, xử lý file lớn.
