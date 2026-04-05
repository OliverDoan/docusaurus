---
sidebar_position: 4
title: "Middleware"
---

# Middleware

## Middleware là gì?

Middleware trong Next.js là code chạy **trước khi request được xử lý** bởi route handler hoặc page. Nó cho phép bạn can thiệp vào request/response cycle — redirect, rewrite URL, thêm headers, kiểm tra authentication, v.v.

### Vị trí trong request lifecycle

```
User Request
     ↓
[Middleware]     ← Chạy TRƯỚC mọi thứ
     ↓
[Route Matching]
     ↓
[Layout/Page Rendering]
     ↓
Response
```

Middleware chạy trên **Edge Runtime** — nhẹ, nhanh, nhưng có một số giới hạn (không dùng được Node.js APIs đầy đủ).

## Convention và vị trí file

Middleware được định nghĩa trong file `middleware.ts` (hoặc `middleware.js`) ở **gốc dự án** (cùng cấp với `app/` hoặc `src/`).

```
project/
├── app/
│   ├── page.tsx
│   └── dashboard/
│       └── page.tsx
├── middleware.ts          ← Đặt ở gốc dự án
├── package.json
└── next.config.ts
```

Nếu dùng thư mục `src/`:

```
project/
├── src/
│   ├── app/
│   │   └── page.tsx
│   └── middleware.ts      ← Đặt trong src/
├── package.json
└── next.config.ts
```

**Chỉ có 1 file `middleware.ts` cho toàn bộ dự án.** Không thể đặt middleware riêng cho từng route.

## Cấu trúc cơ bản

```tsx
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Logic xử lý request ở đây
  console.log("Middleware chạy cho:", request.nextUrl.pathname);

  // Tiếp tục xử lý request bình thường
  return NextResponse.next();
}
```

### Export config — Chọn routes nào middleware chạy

```tsx
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// Cách 1: matcher config — Recommended
// Chỉ chạy middleware cho các routes match pattern
export const config = {
  matcher: [
    // Match tất cả paths trừ static files và images
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
```

## Matcher Config chi tiết

Matcher xác định **middleware chạy cho routes nào**. Đây là cách hiệu quả nhất vì Next.js biết trước routes nào cần middleware.

### Cú pháp matcher

```tsx
export const config = {
  matcher: [
    // Match 1 route cụ thể
    "/dashboard",

    // Match route và tất cả route con
    "/dashboard/:path*",

    // Match nhiều routes
    "/api/:path*",
    "/admin/:path*",

    // Match với regex
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

### Ví dụ matcher phổ biến

```tsx
// Chỉ chạy cho các trang cần auth
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/admin/:path*",
  ],
};
```

```tsx
// Chạy cho tất cả NGOẠI TRỪ static files, API, và public pages
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
```

### Conditional logic thay thế matcher

Nếu cần logic phức tạp hơn matcher, kiểm tra pathname trong middleware:

```tsx
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bỏ qua static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Xử lý logic cho các routes còn lại
  // ...

  return NextResponse.next();
}
```

## NextRequest API

`NextRequest` extends Web API `Request` với các tiện ích bổ sung:

```tsx
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // URL hiện tại
  const url = request.nextUrl;
  console.log("Pathname:", url.pathname);     // '/dashboard'
  console.log("Search:", url.search);          // '?tab=settings'
  console.log("Origin:", url.origin);          // 'http://localhost:3000'

  // Query params
  const tab = url.searchParams.get("tab");     // 'settings'

  // Headers
  const userAgent = request.headers.get("user-agent");
  const authorization = request.headers.get("authorization");
  const acceptLanguage = request.headers.get("accept-language");

  // Cookies
  const token = request.cookies.get("auth-token");
  const theme = request.cookies.get("theme");
  const allCookies = request.cookies.getAll();

  // Method
  console.log("Method:", request.method); // 'GET', 'POST', ...

  // Geo (trên Vercel Edge)
  // const { country, city, region } = request.geo || {};

  // IP
  // const ip = request.ip;

  return NextResponse.next();
}
```

## NextResponse API

`NextResponse` cho phép **can thiệp vào response** — redirect, rewrite, thêm headers, set cookies:

```tsx
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 1. Tiếp tục bình thường (passthrough)
  return NextResponse.next();

  // 2. Redirect sang URL khác
  return NextResponse.redirect(new URL("/login", request.url));

  // 3. Rewrite — Giữ URL nhưng serve content khác
  return NextResponse.rewrite(new URL("/api/proxy", request.url));

  // 4. Trả về response trực tiếp (chặn request)
  return new NextResponse("Unauthorized", { status: 401 });

  // 5. Trả về JSON
  return NextResponse.json(
    { error: "Forbidden" },
    { status: 403 }
  );
}
```

### Thêm headers và cookies vào response

```tsx
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Thêm response headers
  response.headers.set("x-custom-header", "giá trị tùy chỉnh");
  response.headers.set(
    "x-request-id",
    crypto.randomUUID()
  );

  // Set cookies
  response.cookies.set("visited", "true", {
    maxAge: 60 * 60 * 24, // 1 ngày
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  // Xóa cookie
  response.cookies.delete("old-cookie");

  return response;
}
```

## Use Cases thực tế

### 1. Authentication — Bảo vệ routes

```tsx
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Danh sách routes cần đăng nhập
const protectedRoutes = ["/dashboard", "/settings", "/profile"];

// Danh sách routes chỉ dành cho khách (chưa đăng nhập)
const authRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;

  // Kiểm tra route có cần auth không
  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isAuthRoute = authRoutes.some(
    (route) => pathname === route
  );

  // Chưa đăng nhập + truy cập protected route → redirect login
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    // Lưu URL gốc để redirect lại sau login
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Đã đăng nhập + truy cập login/register → redirect dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(
      new URL("/dashboard", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/login",
    "/register",
  ],
};
```

### 2. Role-based Access Control

```tsx
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose"; // Thư viện JWT cho Edge Runtime

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "secret"
);

type TokenPayload = {
  userId: string;
  role: "user" | "admin" | "editor";
};

async function verifyToken(
  token: string
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

// Định nghĩa quyền truy cập cho từng route
const routePermissions: Record<string, string[]> = {
  "/admin": ["admin"],
  "/editor": ["admin", "editor"],
  "/dashboard": ["admin", "editor", "user"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    // Token không hợp lệ — xóa cookie và redirect
    const response = NextResponse.redirect(
      new URL("/login", request.url)
    );
    response.cookies.delete("auth-token");
    return response;
  }

  // Kiểm tra quyền truy cập
  const matchedRoute = Object.keys(routePermissions).find(
    (route) =>
      pathname === route || pathname.startsWith(`${route}/`)
  );

  if (matchedRoute) {
    const allowedRoles = routePermissions[matchedRoute];
    if (!allowedRoles.includes(payload.role)) {
      // Không có quyền — redirect 403 page
      return NextResponse.redirect(
        new URL("/forbidden", request.url)
      );
    }
  }

  // Truyền thông tin user xuống qua header (cho Server Components)
  const response = NextResponse.next();
  response.headers.set("x-user-id", payload.userId);
  response.headers.set("x-user-role", payload.role);

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/editor/:path*", "/dashboard/:path*"],
};
```

### 3. Internationalization (i18n)

```tsx
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["vi", "en", "ja"];
const defaultLocale = "vi";

function getLocale(request: NextRequest): string {
  // 1. Kiểm tra cookie đã lưu
  const savedLocale = request.cookies.get("locale")?.value;
  if (savedLocale && locales.includes(savedLocale)) {
    return savedLocale;
  }

  // 2. Kiểm tra Accept-Language header
  const acceptLanguage =
    request.headers.get("accept-language") || "";
  for (const locale of locales) {
    if (acceptLanguage.includes(locale)) {
      return locale;
    }
  }

  // 3. Mặc định
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Kiểm tra URL đã có locale chưa
  const hasLocale = locales.some(
    (locale) =>
      pathname.startsWith(`/${locale}/`) ||
      pathname === `/${locale}`
  );

  if (hasLocale) {
    return NextResponse.next();
  }

  // Thêm locale vào URL
  const locale = getLocale(request);
  const newUrl = new URL(`/${locale}${pathname}`, request.url);

  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: [
    // Bỏ qua static files và API
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

### 4. A/B Testing

```tsx
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Chỉ A/B test cho trang chủ
  if (pathname !== "/") {
    return NextResponse.next();
  }

  // Kiểm tra cookie đã phân nhóm chưa
  const variant = request.cookies.get("ab-variant")?.value;

  if (variant) {
    // Đã phân nhóm — rewrite đến variant tương ứng
    if (variant === "b") {
      return NextResponse.rewrite(new URL("/home-b", request.url));
    }
    return NextResponse.next();
  }

  // Chưa phân nhóm — random 50/50
  const isVariantB = Math.random() < 0.5;
  const response = isVariantB
    ? NextResponse.rewrite(new URL("/home-b", request.url))
    : NextResponse.next();

  // Lưu variant vào cookie (30 ngày)
  response.cookies.set("ab-variant", isVariantB ? "b" : "a", {
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return response;
}
```

### 5. Rate Limiting đơn giản

```tsx
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lưu ý: Trong production, dùng Redis hoặc service chuyên dụng
// Đây là ví dụ đơn giản với in-memory store
const rateLimitMap = new Map<
  string,
  { count: number; resetTime: number }
>();

const RATE_LIMIT = 100; // requests
const WINDOW_MS = 60 * 1000; // 1 phút

function getRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT - record.count };
}

export function middleware(request: NextRequest) {
  // Chỉ rate limit cho API routes
  if (!request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed, remaining } = getRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "Quá nhiều request. Vui lòng thử lại sau." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set(
    "X-RateLimit-Remaining",
    remaining.toString()
  );

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
```

## Chaining Middleware Logic

Vì Next.js chỉ cho phép **1 file middleware**, bạn cần tổ chức logic bên trong:

```tsx
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Định nghĩa kiểu cho middleware handler
type MiddlewareHandler = (
  request: NextRequest,
  response: NextResponse
) => NextResponse | null; // null = tiếp tục, NextResponse = dừng

// Middleware 1: Logging
const withLogging: MiddlewareHandler = (request, response) => {
  const start = Date.now();
  response.headers.set("x-request-start", start.toString());
  console.log(
    `[${request.method}] ${request.nextUrl.pathname}`
  );
  return null; // Tiếp tục
};

// Middleware 2: Auth check
const withAuth: MiddlewareHandler = (request, response) => {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;

  // Chỉ kiểm tra cho protected routes
  if (pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return null; // Tiếp tục
};

// Middleware 3: Security headers
const withSecurityHeaders: MiddlewareHandler = (
  request,
  response
) => {
  response.headers.set(
    "X-Content-Type-Options",
    "nosniff"
  );
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );
  return null; // Tiếp tục
};

// Chain tất cả middleware handlers
const middlewareChain: MiddlewareHandler[] = [
  withLogging,
  withAuth,
  withSecurityHeaders,
];

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  for (const handler of middlewareChain) {
    const result = handler(request, response);
    if (result) {
      // Handler trả về response → dừng chain
      return result;
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
```

## Performance Considerations

### 1. Middleware chạy cho MỌI matched request

```tsx
// SAI: Logic nặng trong middleware
export function middleware(request: NextRequest) {
  // Gọi database — CHẬM, chạy mỗi request!
  const user = await db.query("SELECT * FROM users WHERE ...");
}

// ĐÚNG: Chỉ kiểm tra nhẹ (cookies, headers)
export function middleware(request: NextRequest) {
  // Chỉ check cookie — nhanh
  const token = request.cookies.get("auth-token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
```

### 2. Giới hạn matcher cho routes cần thiết

```tsx
// SAI: Chạy cho tất cả routes
export const config = {
  matcher: "/:path*",
};

// ĐÚNG: Chỉ chạy cho routes cần middleware
export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
```

### 3. Edge Runtime limitations

Middleware chạy trên **Edge Runtime**, không phải Node.js đầy đủ. Không dùng được:

- `fs` (file system)
- Các Node.js native modules
- npm packages dùng Node.js APIs (nhiều ORMs, database drivers)
- `eval()`, `new Function()`

Dùng được:
- Web APIs (fetch, crypto, Headers, URL, TextEncoder, ...)
- Một số thư viện tương thích Edge (jose cho JWT, ...)

### 4. Tránh redirect loop

```tsx
// SAI: Redirect loop!
export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  if (!token) {
    // /login cũng match middleware → redirect /login → redirect /login → ...
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: "/:path*", // Match tất cả, kể cả /login!
};

// ĐÚNG: Loại trừ /login khỏi matcher
export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};

// HOẶC: Kiểm tra pathname trong middleware
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/login") return NextResponse.next();

  const token = request.cookies.get("auth-token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
```

## Lỗi thường gặp

### 1. Đặt middleware sai vị trí

```
project/
├── app/
│   └── middleware.ts    ← SAI: trong app/
├── middleware.ts         ← ĐÚNG: gốc dự án
```

### 2. Dùng Node.js APIs trong middleware

```tsx
// SAI: fs không available trong Edge Runtime
import fs from "fs";

export function middleware(request: NextRequest) {
  const config = fs.readFileSync("./config.json"); // Lỗi!
}
```

### 3. Quên return NextResponse

```tsx
// SAI: Không return → request bị treo
export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (token) {
    // Quên return NextResponse.next()!
  }
}

// ĐÚNG: Luôn return response
export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next(); // Bắt buộc!
}
```

### 4. Middleware async với database calls

```tsx
// SAI: Database call trong middleware (chậm + Edge limitation)
export async function middleware(request: NextRequest) {
  const user = await prisma.user.findUnique({ ... }); // Prisma không chạy trên Edge!
}

// ĐÚNG: Verify JWT token (nhẹ, chạy trên Edge)
export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const payload = await jwtVerify(token, SECRET); // jose library, Edge-compatible
}
```

## Câu hỏi phỏng vấn

### Câu 1: Middleware trong Next.js chạy ở đâu và khi nào?

**Trả lời:** Middleware chạy trên **Edge Runtime** — một runtime nhẹ, nhanh, chạy ở edge servers (gần user). Nó chạy **trước khi request đến route handler hoặc page** — tức là trước cả Server Components, API routes, và static file serving (nếu match).

Thứ tự: Request → Middleware → Route Matching → Layout/Page Rendering → Response.

Edge Runtime hỗ trợ Web APIs chuẩn nhưng **không hỗ trợ** Node.js native APIs (fs, path, crypto.createHash, ...). Điều này có nghĩa middleware phải nhẹ — chỉ nên kiểm tra cookies, headers, JWT token — không nên gọi database trực tiếp.

### Câu 2: Matcher config hoạt động thế nào? Tại sao nên dùng?

**Trả lời:** Matcher config xác định middleware chạy cho routes nào, sử dụng pattern matching. Nên dùng vì:

1. **Performance**: Next.js biết trước routes nào cần middleware, bỏ qua middleware cho static files, images, v.v.
2. **Rõ ràng**: Đọc config là biết ngay middleware ảnh hưởng routes nào
3. **Tránh lỗi**: Không lo middleware chặn static files hoặc gây redirect loop

Pattern: dùng `:path*` cho wildcard, `(?!...)` cho negative lookahead. Ví dụ: `/((?!api|_next).*))` match tất cả trừ `/api` và `/_next`.

### Câu 3: redirect() vs NextResponse.redirect() — khác nhau thế nào?

**Trả lời:**
- **`redirect()`** (từ `next/navigation`): Dùng trong **Server Components và Server Actions**. Throw một exception để Next.js xử lý redirect. Không dùng được trong middleware.
- **`NextResponse.redirect()`**: Dùng trong **Middleware**. Trả về HTTP redirect response trực tiếp. Chạy trước khi Server Component render.

Middleware redirect xảy ra **sớm hơn** (trước rendering), trong khi `redirect()` xảy ra **trong quá trình rendering**. Vì vậy, dùng middleware cho redirect logic toàn cục (auth, i18n), dùng `redirect()` cho redirect logic cụ thể trong từng page.

### Câu 4: Làm sao tổ chức middleware logic khi ứng dụng phức tạp?

**Trả lời:** Vì Next.js chỉ cho phép 1 file `middleware.ts`, ta dùng **chain pattern**:

1. Tách mỗi concern thành function riêng (auth handler, logging handler, i18n handler)
2. Mỗi handler nhận request + response, trả về response (dừng) hoặc null (tiếp tục)
3. Hàm middleware chính loop qua chain, dừng khi handler nào trả về response
4. Cuối chain, trả về response với tất cả headers/cookies đã thêm

Pattern này giữ code modular, dễ test từng handler riêng, và dễ thêm/bớt logic.

### Câu 5: Middleware có thể thay thế hoàn toàn server-side authentication không?

**Trả lời:** **Không hoàn toàn.** Middleware nên là **tuyến phòng thủ đầu tiên** (first line of defense) nhưng không phải duy nhất.

Middleware phù hợp cho:
- Kiểm tra nhanh có token hay không (redirect sớm)
- Verify JWT signature (nhẹ, Edge-compatible)
- Redirect user chưa đăng nhập trước khi render page

Middleware **không thay thế được**:
- Kiểm tra quyền chi tiết (cần query database)
- Validate session với database (middleware chạy trên Edge, hạn chế DB access)
- Authorization logic phức tạp (role-based access per resource)

Best practice: Middleware check JWT token (nhanh), Server Components/API routes query database để verify session và check permissions chi tiết (đầy đủ).
