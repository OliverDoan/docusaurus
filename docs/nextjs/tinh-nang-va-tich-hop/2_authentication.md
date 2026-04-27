---
sidebar_position: 2
title: "2. Authentication"
---

# Authentication


---

## Mục lục

- [Tổng quan authentication trong Next.js](#tổng-quan-authentication-trong-nextjs)
- [NextAuth.js / Auth.js Setup](#nextauthjs-authjs-setup)
- [Providers chi tiết](#providers-chi-tiết)
- [Session Management: JWT vs Database Sessions](#session-management-jwt-vs-database-sessions)
- [Protecting Routes với Middleware](#protecting-routes-với-middleware)
- [Server-side Authentication Checks](#server-side-authentication-checks)
- [Client-side Session Access](#client-side-session-access)
- [Role-based Access Control (RBAC)](#role-based-access-control-rbac)
- [Security Best Practices](#security-best-practices)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Tổng quan authentication trong Next.js

Authentication (xác thực) là quá trình xác minh danh tính người dùng — trả lời câu hỏi "Bạn là ai?". Authorization (phân quyền) quyết định "Bạn được làm gì?".

Trong Next.js App Router, authentication có thể được kiểm tra ở nhiều tầng:

```
Request → Middleware (kiểm tra sớm nhất)
       → Layout (Server Component)
       → Page (Server Component)
       → Route Handler (API)
       → Server Action (mutations)
```

### Các phương pháp phổ biến

| Phương pháp | Mô tả | Khi nào dùng |
|-------------|--------|--------------|
| **NextAuth.js / Auth.js** | Thư viện chuyên dụng, nhiều providers | Hầu hết ứng dụng |
| **Clerk, Supabase Auth** | Managed auth service | Muốn giảm phức tạp |
| **Custom JWT** | Tự viết logic auth | Kiểm soát hoàn toàn |
| **Session-based** | Cookie + database session | Ứng dụng truyền thống |

## NextAuth.js / Auth.js Setup

Auth.js (tên mới của NextAuth.js v5) là thư viện authentication phổ biến nhất cho Next.js. Nó hỗ trợ hàng chục providers (Google, GitHub, Credentials...) và quản lý session tự động.

### Cài đặt

```bash
# Cài đặt Auth.js cho Next.js
npm install next-auth@beta

# Tạo AUTH_SECRET (bắt buộc)
npx auth secret
# Lệnh này tạo file .env.local với AUTH_SECRET=...
```

### Cấu hình cơ bản

```tsx
// auth.ts — File cấu hình chính (đặt ở root project)

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Adapter kết nối với database (optional, cần cho database sessions)
  adapter: PrismaAdapter(prisma),

  // Danh sách providers
  providers: [
    // Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // GitHub OAuth
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),

    // Email + Password (Credentials)
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Tìm user trong database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        // So sánh password
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  // Session strategy
  session: {
    strategy: "jwt", // Dùng "database" nếu muốn lưu session trong DB
  },

  // Các trang custom
  pages: {
    signIn: "/login",      // Trang đăng nhập tùy chỉnh
    error: "/auth/error",  // Trang lỗi
  },

  // Callbacks — tùy chỉnh behavior
  callbacks: {
    // Thêm thông tin vào JWT token
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },

    // Thêm thông tin vào session object
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },

    // Kiểm soát quyền truy cập
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

      if (isOnDashboard && !isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      return true;
    },
  },
});
```

### Route Handler cho Auth

```tsx
// app/api/auth/[...nextauth]/route.ts
// Đây là catch-all route handler cho tất cả auth endpoints

import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

File này tạo ra các endpoints:
- `GET /api/auth/signin` — Trang đăng nhập
- `POST /api/auth/signin/:provider` — Xử lý đăng nhập
- `GET /api/auth/signout` — Trang đăng xuất
- `GET /api/auth/session` — Lấy session hiện tại
- `GET /api/auth/callback/:provider` — OAuth callback

## Providers chi tiết

### Credentials Provider (Email + Password)

```tsx
// app/(auth)/register/page.tsx — Trang đăng ký

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export default function RegisterPage() {
  // Server Action xử lý đăng ký
  async function register(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validate
    if (!name || !email || !password) {
      throw new Error("Vui lòng điền đầy đủ thông tin");
    }

    if (password.length < 8) {
      throw new Error("Mật khẩu phải có ít nhất 8 ký tự");
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("Email đã được sử dụng");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Tạo user
    await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role: "USER",
      },
    });

    redirect("/login");
  }

  return (
    <form action={register}>
      <input name="name" placeholder="Họ tên" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Mật khẩu" required />
      <button type="submit">Đăng ký</button>
    </form>
  );
}
```

### Login với Server Action

```tsx
// app/(auth)/login/page.tsx

import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div>
      <h1>Đăng nhập</h1>

      {/* Đăng nhập bằng Email + Password */}
      <form
        action={async (formData) => {
          "use server";
          await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirectTo: "/dashboard",
          });
        }}
      >
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Mật khẩu" required />
        <button type="submit">Đăng nhập</button>
      </form>

      <hr />

      {/* Đăng nhập bằng Google */}
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/dashboard" });
        }}
      >
        <button type="submit">Đăng nhập với Google</button>
      </form>

      {/* Đăng nhập bằng GitHub */}
      <form
        action={async () => {
          "use server";
          await signIn("github", { redirectTo: "/dashboard" });
        }}
      >
        <button type="submit">Đăng nhập với GitHub</button>
      </form>
    </div>
  );
}
```

## Session Management: JWT vs Database Sessions

### JWT Sessions (mặc định)

Token được lưu trong cookie, không cần database. Nhanh nhưng không thể thu hồi (revoke) session.

```tsx
// auth.ts
export const { handlers, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 ngày
  },
  // ...
});
```

**Ưu điểm:**
- Nhanh — không cần query database mỗi request
- Stateless — dễ scale
- Hoạt động tốt với edge runtime

**Nhược điểm:**
- Không thể thu hồi session ngay lập tức (phải đợi hết hạn)
- Token size lớn nếu lưu nhiều data

### Database Sessions

Session được lưu trong database. Có thể thu hồi bất cứ lúc nào.

```tsx
// auth.ts
import { PrismaAdapter } from "@auth/prisma-adapter";

export const { handlers, auth } = NextAuth({
  adapter: PrismaAdapter(prisma), // Bắt buộc cho database sessions
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,
  },
  // ...
});
```

**Ưu điểm:**
- Có thể thu hồi session ngay lập tức
- Quản lý nhiều device/session
- Lưu nhiều data trong session

**Nhược điểm:**
- Mỗi request cần query database
- Phụ thuộc vào database availability

## Protecting Routes với Middleware

Middleware chạy **trước mỗi request**, là nơi lý tưởng để kiểm tra authentication.

```tsx
// middleware.ts (đặt ở root project)

import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Các route cần đăng nhập
  const protectedRoutes = ["/dashboard", "/profile", "/settings"];
  const isProtected = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  // Các route chỉ dành cho guest (chưa đăng nhập)
  const authRoutes = ["/login", "/register"];
  const isAuthRoute = authRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  // Chưa đăng nhập mà vào protected route → redirect đến login
  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Đã đăng nhập mà vào auth route → redirect đến dashboard
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

// Cấu hình matcher — chỉ chạy middleware cho các route cần thiết
export const config = {
  matcher: [
    // Bỏ qua static files và API auth routes
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

## Server-side Authentication Checks

Kiểm tra auth trong Server Components — không cần client JavaScript.

```tsx
// app/dashboard/page.tsx — Protected Server Component

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Lấy session trên server
  const session = await auth();

  // Nếu chưa đăng nhập, redirect
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Xin chào, {session.user.name}!</p>
      <p>Email: {session.user.email}</p>
      <p>Role: {session.user.role}</p>
    </div>
  );
}
```

### Kiểm tra auth trong Server Actions

```tsx
// app/actions/post.ts
"use server";

import { auth } from "@/auth";

export async function createPost(formData: FormData) {
  // Kiểm tra auth trước khi thực hiện mutation
  const session = await auth();

  if (!session?.user) {
    throw new Error("Bạn cần đăng nhập để tạo bài viết");
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  // Tạo bài viết với user ID từ session
  const post = await prisma.post.create({
    data: {
      title,
      content,
      authorId: session.user.id,
    },
  });

  return post;
}
```

### Kiểm tra auth trong Route Handlers

```tsx
// app/api/posts/route.ts

import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();
  // Xử lý tạo post...

  return NextResponse.json({ success: true }, { status: 201 });
}
```

## Client-side Session Access

### SessionProvider setup

```tsx
// app/layout.tsx

import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="vi">
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

### useSession hook

```tsx
// components/UserMenu.tsx
"use client";

import { useSession, signOut } from "next-auth/react";

export function UserMenu() {
  const { data: session, status } = useSession();

  // status: "loading" | "authenticated" | "unauthenticated"

  if (status === "loading") {
    return <div>Đang tải...</div>;
  }

  if (status === "unauthenticated") {
    return <a href="/login">Đăng nhập</a>;
  }

  return (
    <div>
      <span>Xin chào, {session?.user?.name}</span>
      <img
        src={session?.user?.image || "/default-avatar.png"}
        alt="Avatar"
        width={32}
        height={32}
      />
      <button onClick={() => signOut({ callbackUrl: "/" })}>
        Đăng xuất
      </button>
    </div>
  );
}
```

## Role-based Access Control (RBAC)

### Mở rộng type cho session

```tsx
// types/next-auth.d.ts

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: string;
  }

  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    id: string;
  }
}
```

### Component phân quyền

```tsx
// components/RoleGate.tsx

import { auth } from "@/auth";
import { redirect } from "next/navigation";

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
}

// Server Component — kiểm tra role trên server
export async function RoleGate({
  children,
  allowedRoles,
  fallback,
}: RoleGateProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!allowedRoles.includes(session.user.role)) {
    // Không có quyền
    return fallback || (
      <div>
        <h2>Không có quyền truy cập</h2>
        <p>Bạn cần quyền {allowedRoles.join(" hoặc ")} để xem trang này.</p>
      </div>
    );
  }

  return <>{children}</>;
}
```

### Sử dụng RoleGate

```tsx
// app/admin/page.tsx

import { RoleGate } from "@/components/RoleGate";

export default function AdminPage() {
  return (
    <RoleGate allowedRoles={["ADMIN"]}>
      <h1>Trang quản trị</h1>
      <p>Chỉ admin mới thấy nội dung này.</p>
    </RoleGate>
  );
}
```

### Middleware phân quyền

```tsx
// middleware.ts — Mở rộng với role-based access

import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Định nghĩa quyền cho từng route
const roleRoutes: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/moderator": ["ADMIN", "MODERATOR"],
  "/dashboard": ["ADMIN", "MODERATOR", "USER"],
};

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Kiểm tra role-based routes
  for (const [path, allowedRoles] of Object.entries(roleRoutes)) {
    if (nextUrl.pathname.startsWith(path)) {
      if (!isLoggedIn) {
        return NextResponse.redirect(new URL("/login", nextUrl));
      }
      if (!userRole || !allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL("/unauthorized", nextUrl));
      }
    }
  }

  return NextResponse.next();
});
```

## Security Best Practices

### 1. Luôn hash password

```tsx
import bcrypt from "bcryptjs";

// Khi đăng ký — hash password trước khi lưu
const hashedPassword = await bcrypt.hash(plainPassword, 12);
// Số 12 là salt rounds — càng cao càng an toàn nhưng chậm hơn

// Khi đăng nhập — so sánh password
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

### 2. Bảo vệ environment variables

```bash
# .env.local — KHÔNG BAO GIỜ commit file này

AUTH_SECRET="your-super-secret-key"    # Bắt buộc
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
DATABASE_URL="postgresql://..."
```

### 3. CSRF Protection

Auth.js tự động bảo vệ CSRF bằng cách thêm CSRF token vào mọi form. Nếu bạn tự viết auth, hãy đảm bảo:

```tsx
// Kiểm tra Origin header trong API routes
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL];

  if (!origin || !allowedOrigins.includes(origin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Xử lý request...
}
```

### 4. Rate limiting cho login

```tsx
// lib/rate-limit.ts
// Rate limiting đơn giản dùng Map (production nên dùng Redis)

const attempts = new Map<string, { count: number; lastAttempt: number }>();

export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 phút
): boolean {
  const now = Date.now();
  const record = attempts.get(key);

  if (!record || now - record.lastAttempt > windowMs) {
    attempts.set(key, { count: 1, lastAttempt: now });
    return true; // Cho phép
  }

  if (record.count >= maxAttempts) {
    return false; // Từ chối — quá nhiều lần thử
  }

  record.count++;
  record.lastAttempt = now;
  return true;
}
```

## Lỗi thường gặp

### 1. Quên set AUTH_SECRET

```bash
# Lỗi: [auth][error] MissingSecret
# Giải pháp: chạy lệnh sau
npx auth secret
# Hoặc thêm vào .env.local:
# AUTH_SECRET="string-ngẫu-nhiên-dài-ít-nhất-32-ký-tự"
```

### 2. OAuth callback URL sai

Khi cấu hình Google/GitHub OAuth, callback URL phải chính xác:

```
# Development
http://localhost:3000/api/auth/callback/google
http://localhost:3000/api/auth/callback/github

# Production
https://yourdomain.com/api/auth/callback/google
https://yourdomain.com/api/auth/callback/github
```

### 3. Session null trong Client Component

```tsx
// SAI — quên bọc SessionProvider
"use client";
function UserInfo() {
  const { data: session } = useSession(); // Luôn null!
  return <p>{session?.user?.name}</p>;
}

// ĐÚNG — bọc SessionProvider trong layout
// app/layout.tsx
<SessionProvider session={session}>
  {children}
</SessionProvider>
```

### 4. Gọi `auth()` trong Client Component

```tsx
// SAI — auth() chỉ chạy trên server
"use client";
import { auth } from "@/auth";

export function Profile() {
  const session = await auth(); // Lỗi!
}

// ĐÚNG — dùng useSession trong client
"use client";
import { useSession } from "next-auth/react";

export function Profile() {
  const { data: session } = useSession();
}
```

### 5. Không kiểm tra auth trong Server Actions

```tsx
// SAI — ai cũng có thể gọi Server Action này
"use server";
export async function deleteUser(userId: string) {
  await prisma.user.delete({ where: { id: userId } }); // Nguy hiểm!
}

// ĐÚNG — luôn kiểm tra auth và quyền
"use server";
import { auth } from "@/auth";

export async function deleteUser(userId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  await prisma.user.delete({ where: { id: userId } });
}
```

## Câu hỏi phỏng vấn

### Câu 1: JWT và Database sessions khác nhau thế nào? Khi nào dùng cái nào?

**Trả lời:**

**JWT Sessions:**
- Token chứa toàn bộ thông tin session, lưu trong cookie.
- Stateless — server không cần lưu trữ gì.
- Không thể thu hồi ngay (phải đợi hết hạn hoặc thay đổi secret).
- Dùng khi: cần performance cao, hệ thống stateless, edge runtime.

**Database Sessions:**
- Cookie chỉ chứa session ID, data lưu trong database.
- Stateful — server tra cứu database mỗi request.
- Có thể thu hồi bất cứ lúc nào (xóa record trong DB).
- Dùng khi: cần quản lý session chặt chẽ, multiple device management, yêu cầu security cao.

### Câu 2: Middleware trong Next.js hoạt động thế nào với authentication?

**Trả lời:**

Middleware chạy **trước khi request được xử lý**, ở edge runtime. Ưu điểm:
- Kiểm tra auth sớm nhất, trước cả Server Components.
- Chạy ở edge — rất nhanh, gần user.
- Có thể redirect hoặc rewrite URL.

Hạn chế:
- Không thể truy cập database trực tiếp (edge runtime hạn chế).
- Chỉ có thể đọc JWT token từ cookie, không query database session phức tạp.
- Nên giữ logic đơn giản (kiểm tra có token hay không), logic phức tạp để ở Server Component.

### Câu 3: Làm sao bảo vệ Server Actions khỏi bị gọi trái phép?

**Trả lời:**

Server Actions thực chất là POST endpoints — bất kỳ ai biết URL đều có thể gọi. Phải bảo vệ bằng cách:

1. **Luôn kiểm tra session** ở đầu mỗi Server Action.
2. **Kiểm tra quyền** — user có được phép thực hiện action này không.
3. **Validate input** — không tin tưởng dữ liệu từ client.
4. **Rate limiting** — giới hạn số lần gọi.

Auth.js tự động bao gồm CSRF protection cho Server Actions, nhưng business logic authorization phải tự implement.

### Câu 4: Giải thích flow OAuth trong Next.js với Auth.js.

**Trả lời:**

1. User click "Đăng nhập với Google" — gọi `signIn("google")`.
2. Auth.js redirect user đến Google Authorization Server.
3. User đăng nhập và cấp quyền trên Google.
4. Google redirect về callback URL (`/api/auth/callback/google`) kèm authorization code.
5. Auth.js nhận code, đổi lấy access token từ Google.
6. Auth.js lấy thông tin user từ Google (name, email, avatar).
7. Nếu dùng database adapter: tạo/cập nhật user trong database.
8. Auth.js tạo session (JWT hoặc database) và set cookie.
9. User được redirect về trang đích (ví dụ `/dashboard`).

### Câu 5: Cách implement role-based access control hiệu quả trong Next.js?

**Trả lời:**

Kiểm tra quyền ở **nhiều tầng** (defense in depth):

1. **Middleware** — kiểm tra nhanh (có đăng nhập không, role cơ bản). Phù hợp cho broad access control (admin routes, protected routes).
2. **Server Components** — kiểm tra chi tiết hơn (role cụ thể, permission granularity). Có thể query database.
3. **Server Actions** — kiểm tra trước mỗi mutation. Bắt buộc vì Server Actions có thể bị gọi trực tiếp.
4. **Route Handlers** — kiểm tra cho API endpoints.

Không bao giờ chỉ dựa vào một tầng kiểm tra duy nhất, và không bao giờ chỉ kiểm tra ở client-side.
