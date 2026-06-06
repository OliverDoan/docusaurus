---
sidebar_position: 2
title: "2. Cookies, Headers, Auth trong Middleware"
---

# Cookies, Headers, Auth trong Middleware

Bài này đi sâu vào các tính năng thường dùng bên trong **middleware** (lớp trung gian xử lý request) của Next.js. Bạn sẽ làm việc với **cookies** (mẩu dữ liệu nhỏ trình duyệt lưu để ghi nhớ trạng thái người dùng), **headers** (thông tin đi kèm mỗi request/response) và **authentication** (xác thực — kiểm tra danh tính người dùng). Đây là nền tảng để xây dựng các luồng đăng nhập và giới hạn truy cập ngay tại lớp trung gian.

---

## Mục lục

- [Cookies API](#cookies-api)
- [Headers API](#headers-api)
- [Authentication pattern](#authentication-pattern)
- [Rate Limiting với Upstash](#rate-limiting-với-upstash)
- [CORS](#cors)

---

## Cookies API

**Đọc cookie**:

```ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");           // cookie object
  const value = request.cookies.get("token")?.value;    // string
  const all = request.cookies.getAll();
  const has = request.cookies.has("token");
}
```

**Set cookie** trên response:

```ts
const response = NextResponse.next();

response.cookies.set("token", "abc123");
response.cookies.set({
  name: "session",
  value: "xyz",
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7, // 7 ngày
  path: "/",
});

response.cookies.delete("old-cookie");

return response;
```

**Trong Server Component / Server Action**:

```ts
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  return /* ... */;
}

// Server Action — có thể set/delete
"use server";
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
}
```

:::warning[Cần lưu ý]

**Cookie security flags** quan trọng:

| Flag | Mục đích |
|------|----------|
| `httpOnly: true` | JS không đọc được — bảo vệ XSS |
| `secure: true` | Chỉ HTTPS |
| `sameSite: "lax"` | CSRF protection |
| `sameSite: "strict"` | Chặt hơn — block cross-site request |
| `maxAge` | Lifetime (giây) |
| `path: "/"` | Áp dụng cho domain |

**Auth token cookie**: luôn `httpOnly + secure + sameSite=lax`.

```ts
response.cookies.set({
  name: "session",
  value: token,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 30,
});
```

Tránh lưu data nhạy cảm trong client-readable cookie.

:::

---

## Headers API

**Đọc header**:

```ts
const auth = request.headers.get("Authorization");
const userAgent = request.headers.get("User-Agent");
const allHeaders = request.headers;
```

**Set header trên response**:

```ts
const response = NextResponse.next();
response.headers.set("X-Custom", "value");
response.headers.append("Set-Cookie", "name=val");
return response;
```

**Set header cho downstream** (forward đến route):

```ts
const requestHeaders = new Headers(request.headers);
requestHeaders.set("X-User-Id", userId);

return NextResponse.next({
  request: { headers: requestHeaders },
});

// Server Component đọc được header này
import { headers } from "next/headers";
export default async function Page() {
  const h = await headers();
  const userId = h.get("X-User-Id");
}
```

→ Pattern truyền data từ middleware xuống component qua header.

---

## Authentication pattern

**Pattern hoàn chỉnh** — JWT trong cookie:

```ts
// middleware.ts
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/settings", "/api/private"];
const PUBLIC_PATHS = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("token")?.value;

  const isProtected = PROTECTED_PATHS.some(p => path.startsWith(p));
  const isPublic = PUBLIC_PATHS.includes(path);

  // Verify token
  let user = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET)
      );
      user = payload;
    } catch {
      // Token invalid
    }
  }

  // Logged in user → không cho vào login/register
  if (user && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Not logged in → redirect khỏi protected route
  if (!user && isProtected) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", path);
    return NextResponse.redirect(loginUrl);
  }

  // Pass user id to downstream
  if (user) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("X-User-Id", user.sub as string);
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

:::info[Phân tích]

**Tại sao verify token trong middleware?**

1. **Reject sớm** — không tốn render server-side cho user unauthenticated.
2. **Redirect early** — UX tốt hơn (không flash content rồi redirect).
3. **Shared logic** — không phải check ở từng page.
4. **Edge runtime** → check nhanh, gần user.

Trade-off:

- **JWT verify cần secret accessible Edge** — không phải mọi auth lib
  hỗ trợ.
- **DB lookup không hợp Edge** — verify chỉ qua signature.

**Pattern thực tế**:

1. Login → server tạo JWT, set cookie.
2. Middleware verify JWT signature (không DB).
3. Pass user id qua header → Server Component fetch user fresh từ DB.
4. Logout → clear cookie.

Auth library hỗ trợ Next.js App Router:

- **Auth.js (NextAuth v5)** — phổ biến nhất.
- **Clerk** — SaaS, dễ setup.
- **Lucia Auth** — DIY, low-level.
- **WorkOS** — enterprise.
- **Supabase Auth** — kết hợp DB.

:::

---

## Rate Limiting với Upstash

Edge Runtime không có memory persist → cần KV store ngoài.

```bash
npm install @upstash/ratelimit @upstash/redis
```

```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 req / 10 sec
});

export async function middleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const { success, limit, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
```

---

## CORS

Cho phép cross-origin request:

```ts
export function middleware(request: NextRequest) {
  // Handle preflight
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // Normal request
  const response = NextResponse.next();
  response.headers.set("Access-Control-Allow-Origin", "*");
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
```

:::warning[Cần lưu ý]

**`Access-Control-Allow-Origin: *`** rủi ro với API có credentials. Đối
với API private, dùng whitelist:

```ts
const allowed = ["https://app.example.com", "https://admin.example.com"];
const origin = request.headers.get("Origin") || "";

if (allowed.includes(origin)) {
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Credentials", "true");
}
```

:::

:::tip[Mẹo]

**Helper function compose middleware**:

```ts
// lib/middleware.ts
type MiddlewareFn = (req: NextRequest) => Promise<NextResponse | null>;

export function compose(...fns: MiddlewareFn[]) {
  return async (req: NextRequest) => {
    for (const fn of fns) {
      const result = await fn(req);
      if (result) return result; // short-circuit
    }
    return NextResponse.next();
  };
}

// middleware.ts
import { authMiddleware, geoMiddleware, rateLimit } from "@/lib/middleware";

export const middleware = compose(rateLimit, authMiddleware, geoMiddleware);
```

Mỗi function trả `NextResponse` (stop chain) hoặc `null` (cho qua).

:::
