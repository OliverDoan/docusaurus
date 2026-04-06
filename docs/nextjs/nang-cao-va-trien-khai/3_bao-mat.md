---
sidebar_position: 3
title: "Bảo mật"
---

# Bao mat

## Giới thiệu

Bao mat là yếu tố **sống còn** của mỗi ứng dụng web. Mot lỗ hổng bảo mật có thể dẫn đến:

- Lộ lọt dữ liệu người dùng
- Mat quyền kiem soat hệ thống
- Thiệt hại tài chính va uy tín

Next.js cung cap nhieu cơ chế bảo mật san co, nhưng bạn van can hieu va ap dứng dụng cach. Bai nay se di qua các mối de doa phổ biến và cách phòng chống trong Next.js.

---

## Nội dung

1. [XSS Prevention](#1-xss-prevention)
2. [CSRF Protection](#2-csrf-protection)
3. [Content Security Policy](#3-content-security-policy-csp)
4. [Rate Limiting](#4-rate-limiting)
5. [Environment Variable Security](#5-environment-variable-security)
6. [Server Actions Security](#6-server-actions-security)
7. [SQL Injection Prevention](#7-sql-injection-prevention)
8. [Secure Headers Configuration](#8-secure-headers-configuration)
9. [OWASP Top 10 trong Next.js](#9-owasp-top-10-trong-nextjs)
10. [Security Checklist](#10-security-checklist)
11. [Lỗi thường gặp](#11-loi-thuong-gap)
12. [Câu hỏi phỏng vấn](#cau-hoi-phong-van)

---

## 1. XSS Prevention

XSS (Cross-Site Scripting) là tấn công inject ma JavaScript độc hại vao trang web.

### 1.1 React tự động escape

React **tự động escape** tất cả nội dung trước khi render, nen phần lớn trường hợp bạn đã được bảo vệ:

```tsx
// An toan - React tự động escape HTML entities
function Comment({ text }: { text: string }) {
  // Nếu text = "<script>alert('hack')</script>"
  // React sẽ render: &lt;script&gt;alert('hack')&lt;/script&gt;
  return <p>{text}</p>;
}
```

### 1.2 Nguy hiem voi dangerouslySetInnerHTML

```tsx
// NGUY HIEM: Không bao gio dung với dữ liệu người dùng chưa sanitize!
function UnsafeComponent({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

// Nếu bắt buộc phai dung, LUON sanitize truoc:
import DOMPurify from "isomorphic-dompurify";

function SafeHtmlComponent({ html }: { html: string }) {
  // DOMPurify loai bo tất cả script tags va event handlers độc hại
  const cleanHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br"],
    ALLOWED_ATTR: ["href", "target"],
  });

  return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
}
```

### 1.3 XSS qua URL

```tsx
// NGUY HIEM: URL có thể chua javascript: protocol
function UnsafeLink({ url }: { url: string }) {
  // Nếu url = "javascript:alert('hack')" -> XSS!
  return <a href={url}>Click me</a>;
}

// AN TOAN: Validate URL truoc
function SafeLink({ url }: { url: string }) {
  const isValidUrl = (u: string): boolean => {
    try {
      const parsed = new URL(u);
      // Chi cho phép http va https
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  if (!isValidUrl(url)) {
    return <span>Link khong hop le</span>;
  }

  return (
    <a href={url} rel="noopener noreferrer">
      Click me
    </a>
  );
}
```

---

## 2. CSRF Protection

CSRF (Cross-Site Request Forgery) là tấn công gia mao request tu trang web khac.

### 2.1 Server Actions tự động bao ve

Next.js Server Actions đã tích hợp CSRF protection bang cach tự động tạo và kiểm tra **CSRF token**:

```tsx
// app/profile/page.tsx
// Server Action - Next.js tự động them CSRF token
async function updateProfile(formData: FormData) {
  "use server";

  // Next.js da kiểm tra CSRF token trước khi code nay chay
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  // Validate input
  if (!name || !email) {
    throw new Error("Thieu thong tin bat buoc");
  }

  await db.user.update({ where: { id: userId }, data: { name, email } });
}

export default function ProfilePage() {
  return (
    <form action={updateProfile}>
      <input name="name" placeholder="Ten" required />
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit">Cap nhat</button>
    </form>
  );
}
```

### 2.2 CSRF cho Route Handlers

Voi Route Handlers, bạn cần tự bảo vệ:

```tsx
// app/api/update-profile/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Kiem tra Origin header
  const origin = request.headers.get("origin");
  const allowedOrigins = [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
  ];

  if (!origin || !allowedOrigins.includes(origin)) {
    return NextResponse.json(
      { error: "Khong duoc phep" },
      { status: 403 }
    );
  }

  // Kiem tra Content-Type (chong CSRF don gian)
  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return NextResponse.json(
      { error: "Content-Type khong hop le" },
      { status: 400 }
    );
  }

  // Xu ly request...
  const body = await request.json();
  return NextResponse.json({ success: true });
}
```

---

## 3. Content Security Policy (CSP)

CSP giup ngăn chặn XSS bang cach chi cho phép tai resources tu các nguồn tin cay.

### 3.1 Cau hinh CSP trong middleware

```tsx
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Tạo nonce ngau nhien cho mỗi request
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // Dinh nghia CSP header
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'nonce-${nonce}';
    img-src 'self' blob: data: https://images.unsplash.com;
    font-src 'self';
    connect-src 'self' https://api.example.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  // Them header vao response
  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", cspHeader);

  // Truyen nonce qua header de component sử dụng
  response.headers.set("x-nonce", nonce);

  return response;
}
```

### 3.2 Su dung nonce trong components

```tsx
// app/layout.tsx
import { headers } from "next/headers";
import Script from "next/script";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const nonce = headersList.get("x-nonce") ?? "";

  return (
    <html lang="vi">
      <body>
        {children}
        {/* Script voi nonce se duoc CSP cho phep */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXX"
          strategy="afterInteractive"
          nonce={nonce}
        />
      </body>
    </html>
  );
}
```

---

## 4. Rate Limiting

Rate limiting ngăn chặn abuse bang cach giới hạn so request trong một khoảng thời gian.

### 4.1 Rate limiting don gian voi Map

```tsx
// lib/rate-limit.ts
// Rate limiter don gian dung in-memory Map
// Lưu ý: chi hoạt động tren 1 server instance

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export function rateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60_000
): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  // Nếu chua co entry hoac da het window -> reset
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  // Con trong window -> tăng count
  if (entry.count < limit) {
    entry.count++;
    return { success: true, remaining: limit - entry.count };
  }

  // Vuot qua limit
  return { success: false, remaining: 0 };
}
```

### 4.2 Ap dung vao Route Handler

```tsx
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Lay IP address lam key
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { success, remaining } = rateLimit(ip, 5, 60_000); // 5 lan/phut

  if (!success) {
    return NextResponse.json(
      { error: "Qua nhieu yeu cau. Vui long thu lai sau." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Remaining": String(remaining),
        },
      }
    );
  }

  // Xu ly đăng nhập...
  const body = await request.json();
  // ...logic xác thực
  return NextResponse.json({ success: true });
}
```

---

## 5. Environment Variable Security

### 5.1 Hieu ro NEXT_PUBLIC_ prefix

```bash
# .env.local

# KHONG CO NEXT_PUBLIC_ -> chỉ có trên server
# An toan cho secrets
DATABASE_URL="postgresql://user:pass@localhost/db"
JWT_SECRET="super-secret-key-khong-lo-ra-ngoai"
API_SECRET_KEY="sk-xxxxxxxxxxxxx"

# CO NEXT_PUBLIC_ -> được expose ra client (browser)!
# CHI DUNG cho thông tin khong nhạy cảm
NEXT_PUBLIC_API_URL="https://api.example.com"
NEXT_PUBLIC_APP_NAME="My App"
```

```tsx
// SAI: dat secret voi NEXT_PUBLIC_ prefix
// NEXT_PUBLIC_API_KEY="sk-secret" -> Bat ky ai cung thay duoc trong browser!

// DUNG: dung server-side de gọi API co secret
// app/api/ai/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // API_KEY chỉ tồn tại trên server
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API_KEY chua duoc cau hinh");
  }

  const body = await request.json();
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`, // Secret an toàn trên server
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data);
}
```

### 5.2 Validate env tai startup

```tsx
// lib/env.ts
// Validate tất cả env variables can thiet khi ứng dụng khoi dong

import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NEXT_PUBLIC_API_URL: z.string().url(),
});

// Parse va validate - throw error neu thiếu
export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});

// Dung: import { env } from "@/lib/env"
// env.DATABASE_URL - co type safety va dam bao ton tai
```

---

## 6. Server Actions Security

Server Actions chay trên server nhung được trigger tu client. Can bao ve ky:

### 6.1 Luon validate input

```tsx
// app/actions/create-post.ts
"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";

// Dinh nghia schema validation
const createPostSchema = z.object({
  title: z
    .string()
    .min(1, "Tieu de khong duoc de trong")
    .max(200, "Tieu de qua dai"),
  content: z
    .string()
    .min(10, "Noi dung it nhat 10 ky tu")
    .max(10000, "Noi dung qua dai"),
  categoryId: z.number().int().positive(),
});

export async function createPost(formData: FormData) {
  // 1. Kiem tra xác thực
  const session = await auth();
  if (!session?.user) {
    throw new Error("Ban chua dang nhap");
  }

  // 2. Validate input với Zod
  const rawData = {
    title: formData.get("title"),
    content: formData.get("content"),
    categoryId: Number(formData.get("categoryId")),
  };

  const result = createPostSchema.safeParse(rawData);

  if (!result.success) {
    // Tra ve loi validation cụ thể
    return {
      error: result.error.flatten().fieldErrors,
    };
  }

  // 3. Chi sử dụng dữ liệu đã validated
  const { title, content, categoryId } = result.data;

  // 4. Kiem tra quyền
  const hasPermission = await checkPermission(session.user.id, "create_post");
  if (!hasPermission) {
    throw new Error("Ban khong co quyen tao bai viet");
  }

  // 5. Thuc hien action
  const post = await db.post.create({
    data: {
      title,
      content,
      categoryId,
      authorId: session.user.id,
    },
  });

  return { success: true, postId: post.id };
}
```

### 6.2 Không truyền dữ liệu nhạy cảm qua closure

```tsx
// SAI: secret bi capture trong closure va có thể lo ra client
const secret = process.env.SECRET_KEY;
async function dangerousAction() {
  "use server";
  // secret bi serialize va gui qua network!
  console.log(secret);
}

// DUNG: doc env variable ben trong Server Action
async function safeAction() {
  "use server";
  // Doc truc tiep trong ham - không bị serialize
  const secret = process.env.SECRET_KEY;
  console.log(secret);
}
```

---

## 7. SQL Injection Prevention

### 7.1 Luon dung parameterized queries

```tsx
// SAI: Truyen truc tiep user input vao SQL -> SQL Injection!
async function getUser(userId: string) {
  // Hacker có thể nhap: "1; DROP TABLE users; --"
  const result = await db.query(`SELECT * FROM users WHERE id = ${userId}`);
  return result;
}

// DUNG: Dung parameterized query
async function getUser(userId: string) {
  const result = await db.query(
    "SELECT * FROM users WHERE id = $1",
    [userId]  // Parameter duoc escape tự động
  );
  return result;
}

// DUNG: Dung ORM (Prisma, Drizzle)
async function getUser(userId: number) {
  // ORM tự động parameterize
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  return user;
}
```

### 7.2 Validate va whitelist

```tsx
// SAI: Cho phep user chon column de sort
async function getUsers(sortBy: string) {
  // sortBy có thể la bất kỳ SQL nao!
  return db.query(`SELECT * FROM users ORDER BY ${sortBy}`);
}

// DUNG: Whitelist cac column duoc phep
const ALLOWED_SORT_COLUMNS = ["name", "email", "created_at"] as const;
type SortColumn = (typeof ALLOWED_SORT_COLUMNS)[number];

async function getUsers(sortBy: string) {
  if (!ALLOWED_SORT_COLUMNS.includes(sortBy as SortColumn)) {
    throw new Error("Column sap xep khong hop le");
  }
  return db.query(`SELECT * FROM users ORDER BY ${sortBy}`);
}
```

---

## 8. Secure Headers Configuration

### 8.1 Cau hinh headers trong next.config.ts

```tsx
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Áp dụng cho tất cả routes
        source: "/(.*)",
        headers: [
          // Chong clickjacking - khong cho embed trong iframe
          { key: "X-Frame-Options", value: "DENY" },

          // Bắt buộc browser dung HTTPS
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },

          // Không cho browser doan MIME type
          { key: "X-Content-Type-Options", value: "nosniff" },

          // Kiem soat thông tin referrer gửi đi
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

          // Không cho trang web truy cập camera, mic, v.v.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

## 9. OWASP Top 10 trong Next.js

| # | Moi de doa | Cach phòng chống trong Next.js |
|---|-----------|-------------------------------|
| 1 | Broken Access Control | Kiem tra auth trong middleware, Server Actions |
| 2 | Cryptographic Failures | Dung HTTPS, hash password voi bcrypt |
| 3 | Injection | Parameterized queries, validate input |
| 4 | Insecure Design | Review architecture, threat modeling |
| 5 | Security Misconfiguration | Secure headers, khong expose stack traces |
| 6 | Vulnerable Components | Cap nhat dependencies thường xuyên |
| 7 | Auth Failures | Dung NextAuth.js/Auth.js, rate limiting |
| 8 | Data Integrity Failures | Validate input, kiểm tra server-side |
| 9 | Logging Failures | Log auth events, monitor bat thuong |
| 10 | SSRF | Validate URLs, whitelist domains |

---

## 10. Security Checklist

Truoc khi deploy, kiểm tra tất cả các mục sau:

**Authentication va Authorization:**
- [ ] Moi route can bao ve đã có auth check
- [ ] Server Actions kiểm tra session trước khi xu ly
- [ ] Middleware chan các route chua xác thực
- [ ] Token co thời gian het han hợp lý

**Input Validation:**
- [ ] Tat ca form inputs được validate (client + server)
- [ ] File uploads duoc kiểm tra type va size
- [ ] URLs được validate protocol (chi http/https)
- [ ] SQL queries dung parameterized

**Headers va Config:**
- [ ] CSP header được cấu hình
- [ ] HSTS header bat
- [ ] X-Frame-Options: DENY
- [ ] Không expose stack traces trong production

**Environment:**
- [ ] Không co secrets trong code
- [ ] NEXT_PUBLIC_ chỉ dùng cho dữ liệu khong nhạy cảm
- [ ] .env files nam trong .gitignore
- [ ] Environment variables được validate khi khoi dong

**Dependencies:**
- [ ] Chay `npm audit` thường xuyên
- [ ] Cap nhat dependencies co lỗ hổng bảo mật
- [ ] Không dung packages không được maintain

---

## 11. Lỗi thường gặp

### Lỗi 1: Lo API key qua NEXT_PUBLIC_

```bash
# SAI: Bat ky ai cung thay duoc trong browser DevTools
NEXT_PUBLIC_OPENAI_KEY="sk-xxxxx"

# DUNG: Bo NEXT_PUBLIC_ prefix, gọi qua API route
OPENAI_KEY="sk-xxxxx"
```

### Lỗi 2: Không validate input trong Server Actions

```tsx
// SAI: Tin tuong dữ liệu tu client
async function deleteUser(userId: string) {
  "use server";
  await db.user.delete({ where: { id: userId } });
  // Hacker có thể xoa bất kỳ user nao!
}

// DUNG: Kiem tra auth + validate
async function deleteUser(userId: string) {
  "use server";
  const session = await auth();
  if (!session?.user?.isAdmin) {
    throw new Error("Khong co quyen");
  }
  // Validate userId la so hợp lệ
  const id = z.string().uuid().parse(userId);
  await db.user.delete({ where: { id } });
}
```

### Lỗi 3: CORS quá rộng

```tsx
// SAI: Cho phep moi origin
headers: {
  "Access-Control-Allow-Origin": "*"
}

// DUNG: Chi cho phép domain cụ thể
const allowedOrigins = ["https://yourdomain.com"];
const origin = request.headers.get("origin");
if (origin && allowedOrigins.includes(origin)) {
  headers.set("Access-Control-Allow-Origin", origin);
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: Next.js bao ve chong XSS nhu thế nào?

**Trả lời:**

Next.js dung React, va React **tự động escape** tất cả nội dung trước khi render vào DOM. Nghia la neu user nhap `<script>alert('hack')</script>`, React se hiển thị dung chuoi do nhu text, khong chay nhu code.

Tuy nhien, van co rui ro XSS khi:
- Dung `dangerouslySetInnerHTML` với dữ liệu chưa sanitize
- Truyen user input vao `href` (javascript: protocol)
- Render nội dung tu CMS ma khong sanitize

Giai phap: sanitize HTML voi DOMPurify, validate URLs, cấu hình CSP header.

### Câu 2: NEXT_PUBLIC_ khac gi environment variables bình thường?

**Trả lời:**

- **Không co prefix**: Chi ton tai trên server (Node.js runtime). An toan cho secrets nhu DB passwords, API keys.
- **Co NEXT_PUBLIC_ prefix**: Duoc inline vao JavaScript bundle gửi xuống browser. **Bat ky ai cung có thể đọc được** qua View Source hoac DevTools.

Quy tac: **KHONG BAO GIO** dat secrets voi `NEXT_PUBLIC_`. Chi dung cho thông tin cong khai nhu API URL, app name.

### Câu 3: Lam sao bao ve Server Actions?

**Trả lời:**

Server Actions can được bảo vệ o 3 tăng:

1. **Authentication**: Kiem tra user da đăng nhập chua (session/token)
2. **Authorization**: Kiem tra user co quyền thực hiện action nay khong
3. **Input validation**: Validate tất cả dữ liệu với Zod hoac schema tương tự

Next.js tự động them CSRF protection cho Server Actions, nhưng bạn van can tu them auth va validation. Ngoai ra, tránh truyền secrets qua closure vi chung có thể bi serialize.

### Câu 4: Content Security Policy (CSP) là gì va tại sao can thiet?

**Trả lời:**

CSP là HTTP header cho phép bạn định nghĩa **nguon nao duoc phep tai resources** (scripts, styles, images) tren trang web của bạn.

Ví dụ: `script-src 'self'` chi cho phép chay JavaScript tu cùng domain, chan tất cả inline scripts va scripts tu domain khac.

CSP can thiet vi no la **tuyến phòng thủ cuối cùng** chong XSS. Ke ca khi attacker inject duoc script vao HTML, CSP sẽ chặn khong cho script do chay.

Trong Next.js, cấu hình CSP qua middleware va dung nonce cho cac inline scripts hợp lệ.

### Câu 5: Rate limiting quan trọng nhu thế nào và cách implement?

**Trả lời:**

Rate limiting ngăn chặn:
- **Brute force attacks** (thu nhieu mật khẩu)
- **DDoS** (lam qua tai server)
- **Abuse** (spam, scraping dữ liệu)

Cach implement trong Next.js:
- **Don gian**: Dung in-memory Map voi IP-based tracking (chi cho 1 instance)
- **Production**: Dung Redis voi thư viện nhu `@upstash/ratelimit` (hỗ trợ nhiều server instances)
- **Vercel**: Su dung Vercel WAF hoac Edge Middleware voi KV store

Luon rate limit các endpoint nhạy cảm: login, register, forgot-password, va moi API tao dữ liệu.
