---
sidebar_position: 3
title: "Bảo mật"
---

# Bao mat

## Gioi thieu

Bao mat la yeu to **song con** cua moi ung dung web. Mot lo hong bao mat co the dan den:

- Lo lot du lieu nguoi dung
- Mat quyen kiem soat he thong
- Thiet hai tai chinh va uy tin

Next.js cung cap nhieu co che bao mat san co, nhung ban van can hieu va ap dung dung cach. Bai nay se di qua cac moi de doa pho bien va cach phong chong trong Next.js.

---

## Noi dung

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
11. [Loi thuong gap](#11-loi-thuong-gap)
12. [Cau hoi phong van](#cau-hoi-phong-van)

---

## 1. XSS Prevention

XSS (Cross-Site Scripting) la tan cong inject ma JavaScript doc hai vao trang web.

### 1.1 React tu dong escape

React **tu dong escape** tat ca noi dung truoc khi render, nen phan lon truong hop ban da duoc bao ve:

```tsx
// An toan - React tu dong escape HTML entities
function Comment({ text }: { text: string }) {
  // Neu text = "<script>alert('hack')</script>"
  // React se render: &lt;script&gt;alert('hack')&lt;/script&gt;
  return <p>{text}</p>;
}
```

### 1.2 Nguy hiem voi dangerouslySetInnerHTML

```tsx
// NGUY HIEM: Khong bao gio dung voi du lieu nguoi dung chua sanitize!
function UnsafeComponent({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

// Neu bat buoc phai dung, LUON sanitize truoc:
import DOMPurify from "isomorphic-dompurify";

function SafeHtmlComponent({ html }: { html: string }) {
  // DOMPurify loai bo tat ca script tags va event handlers doc hai
  const cleanHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br"],
    ALLOWED_ATTR: ["href", "target"],
  });

  return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
}
```

### 1.3 XSS qua URL

```tsx
// NGUY HIEM: URL co the chua javascript: protocol
function UnsafeLink({ url }: { url: string }) {
  // Neu url = "javascript:alert('hack')" -> XSS!
  return <a href={url}>Click me</a>;
}

// AN TOAN: Validate URL truoc
function SafeLink({ url }: { url: string }) {
  const isValidUrl = (u: string): boolean => {
    try {
      const parsed = new URL(u);
      // Chi cho phep http va https
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

CSRF (Cross-Site Request Forgery) la tan cong gia mao request tu trang web khac.

### 2.1 Server Actions tu dong bao ve

Next.js Server Actions da tich hop CSRF protection bang cach tu dong tao va kiem tra **CSRF token**:

```tsx
// app/profile/page.tsx
// Server Action - Next.js tu dong them CSRF token
async function updateProfile(formData: FormData) {
  "use server";

  // Next.js da kiem tra CSRF token truoc khi code nay chay
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

Voi Route Handlers, ban can tu bao ve:

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

CSP giup ngan chan XSS bang cach chi cho phep tai resources tu cac nguon tin cay.

### 3.1 Cau hinh CSP trong middleware

```tsx
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Tao nonce ngau nhien cho moi request
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

  // Truyen nonce qua header de component su dung
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

Rate limiting ngan chan abuse bang cach gioi han so request trong mot khoang thoi gian.

### 4.1 Rate limiting don gian voi Map

```tsx
// lib/rate-limit.ts
// Rate limiter don gian dung in-memory Map
// Luu y: chi hoat dong tren 1 server instance

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

  // Neu chua co entry hoac da het window -> reset
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  // Con trong window -> tang count
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

  // Xu ly dang nhap...
  const body = await request.json();
  // ...logic xac thuc
  return NextResponse.json({ success: true });
}
```

---

## 5. Environment Variable Security

### 5.1 Hieu ro NEXT_PUBLIC_ prefix

```bash
# .env.local

# KHONG CO NEXT_PUBLIC_ -> chi co tren server
# An toan cho secrets
DATABASE_URL="postgresql://user:pass@localhost/db"
JWT_SECRET="super-secret-key-khong-lo-ra-ngoai"
API_SECRET_KEY="sk-xxxxxxxxxxxxx"

# CO NEXT_PUBLIC_ -> duoc expose ra client (browser)!
# CHI DUNG cho thong tin khong nhay cam
NEXT_PUBLIC_API_URL="https://api.example.com"
NEXT_PUBLIC_APP_NAME="My App"
```

```tsx
// SAI: dat secret voi NEXT_PUBLIC_ prefix
// NEXT_PUBLIC_API_KEY="sk-secret" -> Bat ky ai cung thay duoc trong browser!

// DUNG: dung server-side de goi API co secret
// app/api/ai/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // API_KEY chi ton tai tren server
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API_KEY chua duoc cau hinh");
  }

  const body = await request.json();
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`, // Secret an toan tren server
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
// Validate tat ca env variables can thiet khi ung dung khoi dong

import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NEXT_PUBLIC_API_URL: z.string().url(),
});

// Parse va validate - throw error neu thieu
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

Server Actions chay tren server nhung duoc trigger tu client. Can bao ve ky:

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
  // 1. Kiem tra xac thuc
  const session = await auth();
  if (!session?.user) {
    throw new Error("Ban chua dang nhap");
  }

  // 2. Validate input voi Zod
  const rawData = {
    title: formData.get("title"),
    content: formData.get("content"),
    categoryId: Number(formData.get("categoryId")),
  };

  const result = createPostSchema.safeParse(rawData);

  if (!result.success) {
    // Tra ve loi validation cu the
    return {
      error: result.error.flatten().fieldErrors,
    };
  }

  // 3. Chi su dung du lieu da validated
  const { title, content, categoryId } = result.data;

  // 4. Kiem tra quyen
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

### 6.2 Khong truyen du lieu nhay cam qua closure

```tsx
// SAI: secret bi capture trong closure va co the lo ra client
const secret = process.env.SECRET_KEY;
async function dangerousAction() {
  "use server";
  // secret bi serialize va gui qua network!
  console.log(secret);
}

// DUNG: doc env variable ben trong Server Action
async function safeAction() {
  "use server";
  // Doc truc tiep trong ham - khong bi serialize
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
  // Hacker co the nhap: "1; DROP TABLE users; --"
  const result = await db.query(`SELECT * FROM users WHERE id = ${userId}`);
  return result;
}

// DUNG: Dung parameterized query
async function getUser(userId: string) {
  const result = await db.query(
    "SELECT * FROM users WHERE id = $1",
    [userId]  // Parameter duoc escape tu dong
  );
  return result;
}

// DUNG: Dung ORM (Prisma, Drizzle)
async function getUser(userId: number) {
  // ORM tu dong parameterize
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
  // sortBy co the la bat ky SQL nao!
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
        // Ap dung cho tat ca routes
        source: "/(.*)",
        headers: [
          // Chong clickjacking - khong cho embed trong iframe
          { key: "X-Frame-Options", value: "DENY" },

          // Bat buoc browser dung HTTPS
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },

          // Khong cho browser doan MIME type
          { key: "X-Content-Type-Options", value: "nosniff" },

          // Kiem soat thong tin referrer gui di
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

          // Khong cho trang web truy cap camera, mic, v.v.
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

| # | Moi de doa | Cach phong chong trong Next.js |
|---|-----------|-------------------------------|
| 1 | Broken Access Control | Kiem tra auth trong middleware, Server Actions |
| 2 | Cryptographic Failures | Dung HTTPS, hash password voi bcrypt |
| 3 | Injection | Parameterized queries, validate input |
| 4 | Insecure Design | Review architecture, threat modeling |
| 5 | Security Misconfiguration | Secure headers, khong expose stack traces |
| 6 | Vulnerable Components | Cap nhat dependencies thuong xuyen |
| 7 | Auth Failures | Dung NextAuth.js/Auth.js, rate limiting |
| 8 | Data Integrity Failures | Validate input, kiem tra server-side |
| 9 | Logging Failures | Log auth events, monitor bat thuong |
| 10 | SSRF | Validate URLs, whitelist domains |

---

## 10. Security Checklist

Truoc khi deploy, kiem tra tat ca cac muc sau:

**Authentication va Authorization:**
- [ ] Moi route can bao ve da co auth check
- [ ] Server Actions kiem tra session truoc khi xu ly
- [ ] Middleware chan cac route chua xac thuc
- [ ] Token co thoi gian het han hop ly

**Input Validation:**
- [ ] Tat ca form inputs duoc validate (client + server)
- [ ] File uploads duoc kiem tra type va size
- [ ] URLs duoc validate protocol (chi http/https)
- [ ] SQL queries dung parameterized

**Headers va Config:**
- [ ] CSP header duoc cau hinh
- [ ] HSTS header bat
- [ ] X-Frame-Options: DENY
- [ ] Khong expose stack traces trong production

**Environment:**
- [ ] Khong co secrets trong code
- [ ] NEXT_PUBLIC_ chi dung cho du lieu khong nhay cam
- [ ] .env files nam trong .gitignore
- [ ] Environment variables duoc validate khi khoi dong

**Dependencies:**
- [ ] Chay `npm audit` thuong xuyen
- [ ] Cap nhat dependencies co lo hong bao mat
- [ ] Khong dung packages khong duoc maintain

---

## 11. Loi thuong gap

### Loi 1: Lo API key qua NEXT_PUBLIC_

```bash
# SAI: Bat ky ai cung thay duoc trong browser DevTools
NEXT_PUBLIC_OPENAI_KEY="sk-xxxxx"

# DUNG: Bo NEXT_PUBLIC_ prefix, goi qua API route
OPENAI_KEY="sk-xxxxx"
```

### Loi 2: Khong validate input trong Server Actions

```tsx
// SAI: Tin tuong du lieu tu client
async function deleteUser(userId: string) {
  "use server";
  await db.user.delete({ where: { id: userId } });
  // Hacker co the xoa bat ky user nao!
}

// DUNG: Kiem tra auth + validate
async function deleteUser(userId: string) {
  "use server";
  const session = await auth();
  if (!session?.user?.isAdmin) {
    throw new Error("Khong co quyen");
  }
  // Validate userId la so hop le
  const id = z.string().uuid().parse(userId);
  await db.user.delete({ where: { id } });
}
```

### Loi 3: CORS qua rong

```tsx
// SAI: Cho phep moi origin
headers: {
  "Access-Control-Allow-Origin": "*"
}

// DUNG: Chi cho phep domain cu the
const allowedOrigins = ["https://yourdomain.com"];
const origin = request.headers.get("origin");
if (origin && allowedOrigins.includes(origin)) {
  headers.set("Access-Control-Allow-Origin", origin);
}
```

---

## Cau hoi phong van

### Cau 1: Next.js bao ve chong XSS nhu the nao?

**Tra loi:**

Next.js dung React, va React **tu dong escape** tat ca noi dung truoc khi render vao DOM. Nghia la neu user nhap `<script>alert('hack')</script>`, React se hien thi dung chuoi do nhu text, khong chay nhu code.

Tuy nhien, van co rui ro XSS khi:
- Dung `dangerouslySetInnerHTML` voi du lieu chua sanitize
- Truyen user input vao `href` (javascript: protocol)
- Render noi dung tu CMS ma khong sanitize

Giai phap: sanitize HTML voi DOMPurify, validate URLs, cau hinh CSP header.

### Cau 2: NEXT_PUBLIC_ khac gi environment variables binh thuong?

**Tra loi:**

- **Khong co prefix**: Chi ton tai tren server (Node.js runtime). An toan cho secrets nhu DB passwords, API keys.
- **Co NEXT_PUBLIC_ prefix**: Duoc inline vao JavaScript bundle gui xuong browser. **Bat ky ai cung co the doc duoc** qua View Source hoac DevTools.

Quy tac: **KHONG BAO GIO** dat secrets voi `NEXT_PUBLIC_`. Chi dung cho thong tin cong khai nhu API URL, app name.

### Cau 3: Lam sao bao ve Server Actions?

**Tra loi:**

Server Actions can duoc bao ve o 3 tang:

1. **Authentication**: Kiem tra user da dang nhap chua (session/token)
2. **Authorization**: Kiem tra user co quyen thuc hien action nay khong
3. **Input validation**: Validate tat ca du lieu voi Zod hoac schema tuong tu

Next.js tu dong them CSRF protection cho Server Actions, nhung ban van can tu them auth va validation. Ngoai ra, tranh truyen secrets qua closure vi chung co the bi serialize.

### Cau 4: Content Security Policy (CSP) la gi va tai sao can thiet?

**Tra loi:**

CSP la HTTP header cho phep ban dinh nghia **nguon nao duoc phep tai resources** (scripts, styles, images) tren trang web cua ban.

Vi du: `script-src 'self'` chi cho phep chay JavaScript tu cung domain, chan tat ca inline scripts va scripts tu domain khac.

CSP can thiet vi no la **tuyen phong thu cuoi cung** chong XSS. Ke ca khi attacker inject duoc script vao HTML, CSP se chan khong cho script do chay.

Trong Next.js, cau hinh CSP qua middleware va dung nonce cho cac inline scripts hop le.

### Cau 5: Rate limiting quan trong nhu the nao va cach implement?

**Tra loi:**

Rate limiting ngan chan:
- **Brute force attacks** (thu nhieu mat khau)
- **DDoS** (lam qua tai server)
- **Abuse** (spam, scraping du lieu)

Cach implement trong Next.js:
- **Don gian**: Dung in-memory Map voi IP-based tracking (chi cho 1 instance)
- **Production**: Dung Redis voi thu vien nhu `@upstash/ratelimit` (ho tro nhieu server instances)
- **Vercel**: Su dung Vercel WAF hoac Edge Middleware voi KV store

Luon rate limit cac endpoint nhay cam: login, register, forgot-password, va moi API tao du lieu.
