---
sidebar_position: 1
title: "1. Middleware Basics"
---

# Middleware Basics

**Middleware** (lớp trung gian xử lý request) là đoạn code chạy trước khi request đến được trang hoặc route đích trong Next.js. Nó cho phép bạn kiểm tra, chỉnh sửa hoặc chuyển hướng request một cách tập trung — ví dụ kiểm tra đăng nhập, đổi ngôn ngữ, hay viết lại đường dẫn. Bài này giới thiệu cách tạo middleware cơ bản và những trường hợp dùng phổ biến cho người mới.

---

## Mục lục

- [Middleware là gì?](#middleware-là-gì)
- [Tạo middleware](#tạo-middleware)
- [Use cases phổ biến](#use-cases-phổ-biến)
- [Hạn chế của middleware](#hạn-chế-của-middleware)

---

## Middleware là gì?

**Middleware** chạy **trước khi request đến route** — intercept để
modify response, redirect, set header, check auth.

Flow:

```
Request → Middleware → Match route → Render → Response
              ↓
       Có thể: redirect, rewrite, set header, response sớm
```

Middleware chạy trên **Edge Runtime** (mặc định) → cực nhanh, gần user.

---

## Tạo middleware

File `middleware.ts` ở **root** của project (cùng cấp `app/`):

```ts
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  console.log("Request đến:", request.url);
  return NextResponse.next();
}

export const config = {
  matcher: "/dashboard/:path*",
};
```

- `request` — `NextRequest` (extend Web Request).
- `return NextResponse.next()` — cho request đi tiếp.
- `config.matcher` — route nào áp dụng middleware.

---

## Use cases phổ biến

**1. Authentication check**:

```ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};
```

**2. Geo redirect** — redirect theo quốc gia:

```ts
export function middleware(request: NextRequest) {
  const country = request.geo?.country || "US";

  if (country === "VN" && !request.nextUrl.pathname.startsWith("/vi")) {
    return NextResponse.redirect(
      new URL(`/vi${request.nextUrl.pathname}`, request.url)
    );
  }

  return NextResponse.next();
}
```

**3. A/B testing**:

```ts
export function middleware(request: NextRequest) {
  const variant = request.cookies.get("ab-variant")?.value;

  if (!variant) {
    const newVariant = Math.random() < 0.5 ? "a" : "b";
    const response = NextResponse.next();
    response.cookies.set("ab-variant", newVariant);
    return response;
  }

  if (variant === "b" && request.nextUrl.pathname === "/") {
    return NextResponse.rewrite(new URL("/variant-b", request.url));
  }

  return NextResponse.next();
}
```

**4. Rate limiting** (đơn giản, production nên dùng Upstash):

```ts
const rateLimits = new Map<string, number>();

export function middleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const count = rateLimits.get(ip) || 0;

  if (count > 100) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  rateLimits.set(ip, count + 1);
  setTimeout(() => rateLimits.delete(ip), 60_000); // reset 1 phút

  return NextResponse.next();
}
```

**5. Logging/Analytics**:

```ts
export async function middleware(request: NextRequest) {
  console.log(`${request.method} ${request.url}`);
  // Hoặc gửi đến analytics service
  return NextResponse.next();
}
```

**6. Header injection**:

```ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set("X-Custom-Header", "value");
  response.headers.set("X-Request-Id", crypto.randomUUID());

  return response;
}
```

---

## Hạn chế của middleware

:::warning[Cần lưu ý]

**Middleware chạy trên Edge Runtime** — có giới hạn:

- **Không có Node.js APIs** (`fs`, `path`, `process`).
- **Không có database client** Node-based (Prisma client cũ — cần Prisma
  Accelerate).
- **Code size limit** — 1MB sau bundle.
- **CPU time limit** — vài chục ms (Vercel limits).
- **Không truy cập `app/` data directly** — phải qua API call hoặc cookie.

→ Logic phức tạp (database query, heavy computation) **không đặt trong
middleware**. Đặt trong Server Component hoặc route handler.

Middleware **chỉ nên làm**:

- Check cookie/header.
- Redirect/rewrite simple.
- Set header.
- Light fetch (KV store, edge config).

:::

:::info[Phân tích]

**Edge Runtime vs Node Runtime**:

| | Edge | Node |
|--|------|------|
| Khởi động | **Cold start ~ms** | Cold start ~s |
| Latency | Thấp (gần user) | Cao hơn |
| Node API | **Không** (chỉ Web Standards) | Đầy đủ |
| Database driver | HTTP-based (Neon, Upstash, Planetscale) | Bất kỳ |
| File system | Không | Có |
| CPU/memory limit | Chặt | Lỏng hơn |

Middleware mặc định Edge. Route handler có thể chọn:

```ts
export const runtime = "edge";    // hoặc "nodejs"
```

Trade-off:

- **Edge** cho global fast access, light logic, auth check.
- **Node** cho database query, file processing, third-party SDK Node-only.

:::

:::tip[Mẹo]

**Matcher syntax** — chọn route áp dụng middleware:

```ts
export const config = {
  matcher: [
    // Đơn giản
    "/dashboard/:path*",

    // Nhiều pattern
    ["/api/:path*", "/admin/:path*"],

    // Negative lookahead — exclude
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "x-skip-middleware" },
      ],
    },
  ],
};
```

Pattern phổ biến — exclude static asset:

```ts
matcher: "/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"
```

→ Middleware chỉ chạy với page request, bỏ qua asset → performance tốt hơn.

:::

---

## Order matters

Middleware chạy theo **thứ tự** trong file. Có thể compose nhiều check:

```ts
export async function middleware(request: NextRequest) {
  // 1. Block bot
  const ua = request.headers.get("user-agent") || "";
  if (isBlockedBot(ua)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 2. Geo redirect
  if (needsGeoRedirect(request)) {
    return NextResponse.redirect(getGeoUrl(request));
  }

  // 3. Auth check
  if (isProtectedPath(request.nextUrl.pathname)) {
    const token = request.cookies.get("token");
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
  }

  // 4. Set header
  const response = NextResponse.next();
  response.headers.set("X-Request-Id", crypto.randomUUID());
  return response;
}
```

:::warning[Cần lưu ý]

**Chỉ có 1 file `middleware.ts`** trong toàn project — không có "nested
middleware" như framework khác.

Khi cần phức tạp:

- Compose function trong middleware chính.
- Dùng `matcher` để chia logic theo path.
- Helper function trong `lib/middleware/*.ts`.

```ts
import { authMiddleware } from "@/lib/middleware/auth";
import { geoMiddleware } from "@/lib/middleware/geo";

export async function middleware(request: NextRequest) {
  const authResponse = await authMiddleware(request);
  if (authResponse) return authResponse;

  const geoResponse = await geoMiddleware(request);
  if (geoResponse) return geoResponse;

  return NextResponse.next();
}
```

:::
