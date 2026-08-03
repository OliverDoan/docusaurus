---
sidebar_position: 6
title: "6. Middleware, Route Handlers & Scripts"
---

# Middleware, Route Handlers & Scripts

> *Metadata, Route Handlers, Middleware, prefetching và third-party scripts là những thứ bạn đụng hàng ngày khi làm App Router — phỏng vấn hỏi để kiểm tra bạn đã thực sự build app với Next.js 15 hay chỉ đọc docs.*

:::note[Ghi nhớ nhanh]

- ⭐ **Metadata API thay `next/head`** — dùng `export const metadata` (tĩnh) hoặc `generateMetadata()` (động, `await params`); chỉ chạy trong Server Component.
- **Merge metadata là shallow** — page override field nào thì thay nguyên object đó của layout, không deep merge; `title.template` chỉ áp dụng cho page con.
- **`generateMetadata` được memoize** — fetch trong đó dùng chung cache với fetch trong page, không gọi API hai lần.
- **Route Handler & Middleware** — Middleware chạy trên edge, cần loại trừ `_next`/asset/API khỏi matcher để tránh redirect loop.

:::

---

## Câu 2: Metadata trong Next.js App Router được định nghĩa như thế nào? `[Basic]`

### Câu hỏi

> Trong App Router, em định nghĩa metadata (title, description, Open Graph...) như thế nào? Static và dynamic metadata khác nhau ra sao?

### Giải thích lý thuyết

App Router bỏ hoàn toàn `next/head`, thay bằng **Metadata API** — định nghĩa metadata ngay trong `layout.tsx` / `page.tsx` (chỉ Server Component):

| Cách                  | Khi dùng                                          |
| --------------------- | ------------------------------------------------- |
| `export const metadata` | Metadata tĩnh, biết trước lúc build             |
| `generateMetadata()`  | Metadata động — phụ thuộc `params`, cần fetch data |
| File-based            | `favicon.ico`, `opengraph-image.tsx`, `sitemap.ts`, `robots.ts` — Next tự generate tag/route tương ứng |

Cơ chế **merge/kế thừa**: metadata được resolve từ root layout → xuống page. Page định nghĩa field nào thì **override** field đó của layout, field không định nghĩa thì kế thừa. Lưu ý: merge là **shallow** — page định nghĩa `openGraph` thì thay nguyên object `openGraph` của layout, không deep merge từng field.

**Title template**: layout khai báo `title: { template: "%s | MyApp", default: "MyApp" }` — page con chỉ cần `title: "Blog"` → render "Blog | MyApp". Template chỉ áp dụng cho **con**, không áp dụng cho chính layout đó.

Pitfalls:
- Không export đồng thời `metadata` và `generateMetadata` trong cùng 1 file.
- `generateMetadata` chạy trên server — fetch trong đó được **memoize** chung với fetch trong page (không gọi API 2 lần).
- Next 15: `params` trong `generateMetadata` là **Promise**, phải `await`.

### Code minh hoạ

```tsx
// app/layout.tsx — metadata tĩnh + title template
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | MyShop",   // page con: "Blog | MyShop"
    default: "MyShop",          // dùng khi page không khai báo title
  },
  description: "Cửa hàng demo Next.js 15",
  openGraph: { siteName: "MyShop", locale: "vi_VN", type: "website" },
};

// app/blog/[slug]/page.tsx — metadata động theo params
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;            // Next 15: params là Promise
  const post = await fetch(`https://api.example.com/posts/${slug}`)
    .then((r) => r.json());                 // fetch này được memoize với fetch trong page

  return {
    title: post.title,                      // → "Tên bài | MyShop" nhờ template
    description: post.excerpt,
    openGraph: {
      // Shallow merge: object này THAY THẾ openGraph của layout
      title: post.title,
      images: [{ url: post.coverImage }],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await fetch(`https://api.example.com/posts/${slug}`)
    .then((r) => r.json());                 // không gọi API lần 2 — memoized
  return <article>{post.content}</article>;
}

// File-based metadata — chỉ cần đặt đúng tên file:
// app/favicon.ico                → <link rel="icon" />
// app/opengraph-image.tsx        → generate OG image bằng code (ImageResponse)
// app/sitemap.ts                 → /sitemap.xml
// app/robots.ts                  → /robots.txt

// app/sitemap.ts
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await fetchAllPosts();
  return [
    { url: "https://myshop.com", lastModified: new Date() },
    ...posts.map((p) => ({
      url: `https://myshop.com/blog/${p.slug}`,
      lastModified: p.updatedAt,
    })),
  ];
}
```

### Đáp án mẫu

> "Em dùng Metadata API thay cho `next/head`. Metadata tĩnh thì `export const metadata` ngay trong layout hoặc page; metadata động — ví dụ title bài blog theo slug — thì `export async function generateMetadata`, nhận `params` (Next 15 phải `await` vì nó là Promise) rồi fetch data. Điểm hay là fetch trong `generateMetadata` được memoize chung với fetch trong page nên không gọi API hai lần. Metadata kế thừa từ root layout xuống page, page override field nào thì thay field đó — nhưng merge là shallow, define `openGraph` ở page là thay nguyên object của layout. Em hay dùng title template ở root layout: `%s | TênApp` để page con chỉ cần khai báo title ngắn. Ngoài ra có file-based metadata: `favicon.ico`, `opengraph-image.tsx`, `sitemap.ts`, `robots.ts` — đặt đúng tên file là Next tự generate."

---

## Câu 8: Route Handlers (API Routes) trong Next.js App Router là gì? `[Basic]`

### Câu hỏi

> Route Handlers trong App Router là gì? Khác gì API Routes của Pages Router, và Next.js 15 có thay đổi gì về caching?

### Giải thích lý thuyết

Route Handler = file `route.ts` (hoặc `route.js`) trong `app/`, export các function trùng tên **HTTP method**: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`.

| Khía cạnh        | Pages Router (`pages/api`)        | App Router (`route.ts`)                  |
| ---------------- | --------------------------------- | ---------------------------------------- |
| File             | `pages/api/users.ts`              | `app/api/users/route.ts`                 |
| Signature        | `(req, res)` kiểu Express         | **Web API chuẩn**: nhận `Request`, return `Response` |
| Đọc body         | `req.body` (đã parse sẵn)         | `await req.json()` / `req.formData()`    |
| Response         | `res.status(200).json(...)`       | `Response.json(...)` / `NextResponse`    |
| Method routing   | Tự `if (req.method === ...)`      | Export function riêng từng method        |

Điểm quan trọng:
- **Next 15: `GET` mặc định KHÔNG cache** (đảo ngược so với Next 14 — trước đây GET static bị cache mặc định, gây nhiều bug). Muốn cache phải opt-in: `export const dynamic = "force-static"` hoặc `revalidate`.
- **Không được đặt `route.ts` cùng cấp với `page.tsx`** — cả hai đều nhận request cho cùng URL → conflict, build báo lỗi.
- Dynamic params: `app/api/users/[id]/route.ts` — handler nhận argument thứ 2 `{ params }`, và Next 15 `params` là **Promise**.
- Method không export → Next tự trả `405 Method Not Allowed`.

### Code minh hoạ

```typescript
// app/api/users/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Next 15: GET mặc định KHÔNG cache — luôn chạy mỗi request
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);

  const users = await db.user.findMany({ skip: (page - 1) * 10, take: 10 });
  return NextResponse.json({ success: true, data: users });
}

export async function POST(req: Request) {
  const body = await req.json();              // Web API — tự parse body

  // Luôn validate input ở server
  if (!body.email || typeof body.email !== "string") {
    return NextResponse.json(
      { success: false, error: "Email không hợp lệ" },
      { status: 400 },
    );
  }

  const user = await db.user.create({ data: body });
  return NextResponse.json({ success: true, data: user }, { status: 201 });
}
// Không export PUT/DELETE → Next tự trả 405

// Muốn cache GET (opt-in, Next 15):
// export const dynamic = "force-static";
// export const revalidate = 60;             // ISR cho route handler

// app/api/users/[id]/route.ts — dynamic params
type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Ctx) {
  const { id } = await params;               // Next 15: params là Promise
  const user = await db.user.findUnique({ where: { id } });

  if (!user) {
    return NextResponse.json(
      { success: false, error: "User không tồn tại" },
      { status: 404 },
    );
  }
  return NextResponse.json({ success: true, data: user });
}

// ❌ SAI — conflict: route.ts cùng cấp page.tsx
// app/dashboard/page.tsx
// app/dashboard/route.ts      → build error, cả 2 cùng handle /dashboard

// ✅ ĐÚNG — tách namespace
// app/dashboard/page.tsx      → UI
// app/api/dashboard/route.ts  → API
```

### Đáp án mẫu

> "Route Handler là cách viết API endpoint trong App Router: file `route.ts`, export function theo tên HTTP method — `GET`, `POST`, `PUT`, `DELETE`. Khác lớn nhất so với `pages/api` là nó dùng **Web Request/Response API chuẩn** thay vì `(req, res)` kiểu Express — đọc body bằng `await req.json()`, trả về `Response.json()` hoặc `NextResponse`. Em lưu ý hai pitfall hay bị hỏi: một là **không được đặt `route.ts` cùng cấp `page.tsx`** vì cả hai cùng resolve một URL, build sẽ fail. Hai là caching: Next 14 cache GET mặc định gây nhiều bug data cũ, **Next 15 đảo lại — GET mặc định không cache**, muốn cache phải opt-in bằng `dynamic = 'force-static'` hoặc `revalidate`. Với dynamic route như `/api/users/[id]`, handler nhận `{ params }` ở argument thứ hai, và Next 15 phải `await params`. Method nào không export thì Next tự trả 405."

---

## Câu 32: Middleware trong Next.js App Router là gì? `[Intermediate]`

### Câu hỏi

> Middleware trong Next.js chạy ở đâu, dùng cho những việc gì, và có giới hạn nào em cần lưu ý?

### Giải thích lý thuyết

`middleware.ts` đặt ở **root project** (hoặc trong `src/`), chạy **TRƯỚC mọi request match** — trước cả khi route được render hay cache được đọc. Mỗi project chỉ có **1 file middleware** duy nhất.

Use case phù hợp:
- **Auth redirect**: chưa có session cookie → redirect `/login`.
- **Rewrite**: đổi nội dung serve mà URL không đổi (A/B test, multi-tenant).
- **A/B testing**: assign variant qua cookie + rewrite sang biến thể.
- **Geo-based**: đọc header geo → redirect theo quốc gia.
- **i18n locale detect**: đọc `Accept-Language` / cookie → redirect `/vi`, `/en`.
- Set security headers, bot detection, rate limit (với store edge-compatible).

**Matcher config**: `export const config = { matcher: [...] }` — giới hạn middleware chỉ chạy cho path cần. Không có matcher thì chạy cho **mọi request** kể cả static assets → overhead vô ích.

**Edge runtime** (mặc định): middleware chạy trên Edge — chỉ có Web API (fetch, Web Crypto, URL...), **không có Node API** (`fs`, `net`, nhiều native module). Không đọc được request body.

Pitfall lớn nhất: middleware chạy trên **mọi request match** → tuyệt đối không làm việc nặng (DB query, gọi API chậm). Auth trong middleware chỉ nên là **optimistic check** (có cookie/JWT hợp lệ về mặt chữ ký hay không) — verify thực sự + authorization phải làm ở Data Access Layer / Server Component, vì middleware có thể bị bypass và không phải chốt chặn duy nhất.

### Code minh hoạ

```typescript
// middleware.ts — đặt ở root project, ngang hàng với app/
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose"; // jose chạy được trên Edge (Web Crypto)

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Auth — chỉ OPTIMISTIC check, không query DB
  if (pathname.startsWith("/dashboard")) {
    const token = req.cookies.get("session")?.value;
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname); // quay lại sau khi login
      return NextResponse.redirect(loginUrl);
    }
    try {
      // Verify chữ ký JWT — đủ nhẹ cho Edge
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 2. i18n locale detect — redirect nếu thiếu locale prefix
  const hasLocale = /^\/(vi|en)(\/|$)/.test(pathname);
  if (!hasLocale && !pathname.startsWith("/api")) {
    const lang = req.headers.get("accept-language")?.startsWith("vi") ? "vi" : "en";
    return NextResponse.redirect(new URL(`/${lang}${pathname}`, req.url));
  }

  // 3. A/B test — rewrite: URL giữ nguyên, nội dung khác
  if (pathname === "/pricing") {
    let bucket = req.cookies.get("bucket")?.value;
    if (!bucket) bucket = Math.random() < 0.5 ? "a" : "b";

    const res = NextResponse.rewrite(new URL(`/pricing/${bucket}`, req.url));
    res.cookies.set("bucket", bucket); // giữ user trong cùng variant
    return res;
  }

  return NextResponse.next(); // cho request đi tiếp
}

// Matcher — chỉ chạy cho route cần, bỏ qua static assets
export const config = {
  matcher: [
    // Mọi path TRỪ _next/static, _next/image, favicon, file tĩnh
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg)$).*)",
  ],
};

// ❌ Những thứ KHÔNG làm trong middleware:
// import fs from "fs";                    → Edge không có Node API
// await prisma.user.findMany();          → DB query nặng, chạy MỌI request
// const body = await req.json();         → không đọc được body
// kiểm tra quyền chi tiết (authorization) → làm ở Server Component / DAL
```

### Đáp án mẫu

> "Middleware là file `middleware.ts` duy nhất ở root, chạy **trước mọi request match** — trước cả render và cache. Em dùng cho: auth redirect khi chưa có session, rewrite cho A/B test hoặc multi-tenant, detect locale từ `Accept-Language` để redirect `/vi` hay `/en`, và set security headers. Bắt buộc dùng `matcher` để loại static assets, không thì middleware chạy cho mọi request gây overhead. Giới hạn: nó chạy trên **Edge runtime** nên chỉ có Web API — không có `fs`, không đọc được body, nhiều lib Node-only không chạy. Pitfall em luôn nhấn mạnh: middleware chạy trên mọi request nên **không bao giờ query DB hay làm việc nặng** trong đó. Auth ở middleware chỉ là optimistic check — có cookie, JWT verify chữ ký bằng Web Crypto là đủ; còn authorization thực sự em làm ở Server Component hoặc Data Access Layer, vì middleware không nên là chốt chặn bảo mật duy nhất."

---

## Câu 37: Link prefetching trong Next.js là gì và cách control? `[Intermediate]`

### Câu hỏi

> `next/link` khác gì thẻ `<a>` thường, và prefetching hoạt động thế nào? Static route và dynamic route được prefetch khác nhau ra sao, khi nào em tắt prefetch?

### Giải thích lý thuyết

`<Link>` render ra thẻ `<a>` thật (SEO, accessibility, mở tab mới vẫn hoạt động), nhưng **chặn hành vi mặc định** và thực hiện **soft navigation**: thay vì full reload, Next chỉ fetch **RSC payload** của các segment thay đổi — các **layout chung không bị render lại**, state trong layout (sidebar mở/đóng, input đang gõ) giữ nguyên.

| Khía cạnh            | `<a href>` thường                | `<Link href>`                              |
| -------------------- | -------------------------------- | ------------------------------------------ |
| Navigation           | Full page reload                 | Soft navigation — không reload             |
| Tải gì               | Toàn bộ HTML + JS + CSS lại      | Chỉ **RSC payload** của phần tree thay đổi |
| State                | Mất hết (React remount)          | **Layout giữ nguyên state**                |
| Prefetch             | Không                            | Tự động khi link vào viewport (production) |

**Prefetching** = Next tải trước RSC payload của route đích **trước khi user click** (Intersection Observer khi link vào viewport), lưu vào Router Cache → click là render ngay. **Chỉ chạy ở production** — dev mode không prefetch (câu hỏi bẫy phổ biến).

Prefetch **bao nhiêu** phụ thuộc loại route:

| Loại route          | Prefetch mặc định                                                |
| ------------------- | ---------------------------------------------------------------- |
| Static route        | **Full** — toàn bộ RSC payload, click là hiện ngay               |
| Dynamic route       | **Partial** — chỉ tới boundary `loading.tsx` gần nhất: layout + skeleton được prefetch, data thật fetch khi click |
| `prefetch={false}`  | Không prefetch gì; chỉ fetch khi click                            |

Insight: đây là lý do **`loading.tsx` quan trọng với dynamic route** — có loading boundary thì navigation vẫn instant (hiện skeleton ngay).

Cách control:
- `prefetch={false}` — tắt cho danh sách hàng trăm link (bảng dữ liệu) để không tạo hàng trăm request vô ích, tốn băng thông server + user mobile.
- `router.prefetch("/path")` — prefetch thủ công khi đoán trước hành vi user (wizard nhiều bước).
- Dùng `<a>` thường cho external link hoặc khi cần full reload thật.

### Code minh hoạ

```tsx
import Link from "next/link";

// 1. Soft navigation + layout giữ state
// app/dashboard/layout.tsx
"use client";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // State này GIỮ NGUYÊN khi navigate giữa các page con của /dashboard
  // vì layout không re-render — chỉ {children} (RSC payload mới) được swap
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div>
      <aside hidden={!sidebarOpen}>Sidebar</aside>
      <button onClick={() => setSidebarOpen((o) => !o)}>Toggle</button>
      <main>{children}</main>
    </div>
  );
}
// Nếu dùng <a href> thường: full reload → sidebarOpen reset về true

// 2. Tắt prefetch cho danh sách dài
export function ProductTable({ products }: { products: Product[] }) {
  return (
    <table>
      <tbody>
        {products.map((p) => (
          <tr key={p.id}>
            <td>
              {/* 200 dòng → 200 prefetch request nếu để mặc định.
                  Tắt prefetch, chỉ fetch khi user thực sự click */}
              <Link href={`/products/${p.id}`} prefetch={false}>
                {p.name}
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Nav chính — ít link, tỉ lệ click cao → giữ prefetch mặc định
export function MainNav() {
  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>  {/* prefetch khi vào viewport */}
      <Link href="/settings">Cài đặt</Link>
    </nav>
  );
}

// 3. Prefetch thủ công — đoán trước hành vi user
"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function CheckoutStep1() {
  const router = useRouter();

  useEffect(() => {
    // User đang ở bước 1 → gần như chắc chắn sẽ sang bước 2
    router.prefetch("/checkout/step-2");
  }, [router]);

  return <form>{/* ... */}</form>;
}

// 4. Dynamic route + loading.tsx — quyết định prefetch được tới đâu
// app/products/[id]/loading.tsx
export default function Loading() {
  return <ProductSkeleton />;
}
// → Khi prefetch /products/123 (dynamic):
//   - Prefetch: layout + loading.tsx (skeleton)  → click là hiện skeleton NGAY
//   - Data thật của product: fetch lúc click, stream vào sau
// Không có loading.tsx → không có gì hiện ngay → navigation cảm giác "đơ"

// ⚠️ Nhớ: prefetch CHỈ chạy ở production build
// npm run build && npm run start   → mới thấy hiệu quả prefetch
```

### Đáp án mẫu

> "`<Link>` render ra thẻ `<a>` thật nhưng khi click làm **soft navigation**: chỉ fetch RSC payload của phần tree thay đổi, layout chung giữ nguyên state — không full reload như `<a>` thường. Link còn tự **prefetch** khi vào viewport: tải trước RSC payload vào Router Cache nên click gần như instant. Lưu ý nó **chỉ chạy ở production**, dev mode không prefetch — nhiều người tưởng app chậm vì test ở dev. Mức prefetch tuỳ loại route: **static prefetch full** payload; **dynamic chỉ prefetch tới boundary `loading.tsx`** — layout và skeleton, data thật fetch lúc click — nên em luôn thêm `loading.tsx` cho dynamic route. Để control: danh sách vài trăm link em set `prefetch={false}` tránh vài trăm request vô ích, giữ prefetch cho nav chính; còn khi đoán trước hành vi user như wizard nhiều bước thì gọi `router.prefetch()` thủ công cho bước kế tiếp."

---

## Câu 38: next/script component và loading strategies là gì? `[Intermediate]`

### Câu hỏi

> `next/script` giải quyết vấn đề gì so với thẻ `<script>` thường? Các loading strategy khác nhau thế nào và em chọn strategy nào cho từng loại script?

### Giải thích lý thuyết

Thẻ `<script>` thường (không `async`/`defer`) **block HTML parsing** — third-party script chậm (analytics, chat widget, ads) sẽ kéo tụt LCP/TBT. `async`/`defer` đỡ hơn nhưng vẫn thiếu control: không quản lý được thứ tự theo lifecycle của app, không dedupe khi component mount nhiều lần.

`next/script` cho phép **khai báo mức độ ưu tiên theo vòng đời trang** qua prop `strategy`:

| Strategy            | Khi nào load                                       | Dùng cho                              |
| ------------------- | -------------------------------------------------- | ------------------------------------- |
| `beforeInteractive` | Trước khi hydrate — inject vào HTML từ server      | **Hiếm**: polyfill, bot detection, cookie consent bắt buộc. Phải đặt ở **root layout** |
| `afterInteractive`  | **Mặc định** — sau khi trang hydrate xong          | Analytics, tag manager (GA, GTM)      |
| `lazyOnload`        | Lúc browser idle, sau khi mọi resource load xong   | Chat widget, social embed — thứ "có cũng được, muộn cũng được" |
| `worker`            | **Experimental** — chạy trong Web Worker (Partytown), không chiếm main thread | Script nặng không cần DOM trực tiếp; cần bật `nextScriptWorkers` |

Event callbacks (chỉ trong **Client Component**):
- `onLoad` — chạy 1 lần khi script load xong (khởi tạo lib).
- `onReady` — chạy khi load xong **và mỗi lần component re-mount** (re-init map, widget khi navigate quay lại).
- `onError` — script load fail (CDN chết, ad blocker).

Pitfall:
- **Inline script bắt buộc có `id`** — Next dùng id để track và dedupe, thiếu là warning/không tối ưu được.
- `beforeInteractive` đặt trong page con sẽ không đúng nghĩa — chỉ root layout.
- `onLoad` không dùng được trong Server Component — cần `"use client"`.

### Code minh hoạ

```tsx
// 1. afterInteractive (mặc định) — analytics, không block hydration
// app/layout.tsx
import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        {children}
        {/* Load sau khi trang interactive — không ảnh hưởng LCP */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"
          strategy="afterInteractive"
        />
        {/* Inline script — BẮT BUỘC có id để Next track/dedupe */}
        <Script id="ga-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXX');`}
        </Script>

        {/* beforeInteractive — HIẾM khi cần: polyfill/bot detect,
            inject vào HTML server, chạy TRƯỚC hydrate. Chỉ ở root layout */}
        <Script
          src="https://cdn.example.com/polyfill.min.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}

// 2. lazyOnload — chat widget, load lúc browser idle
// app/(marketing)/layout.tsx
import Script from "next/script";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* User không cần chat ngay — đợi mọi thứ xong mới load */}
      <Script src="https://widget.intercom.io/widget/abc" strategy="lazyOnload" />
    </>
  );
}

// 3. Callbacks — chỉ trong Client Component
"use client";
import Script from "next/script";

export function MapEmbed() {
  return (
    <Script
      src="https://maps.googleapis.com/maps/api/js"
      strategy="afterInteractive"
      onLoad={() => {
        console.info("Maps SDK load xong — chạy 1 lần");
      }}
      onReady={() => {
        // Chạy cả khi component re-mount (navigate đi rồi quay lại)
        initMap(document.getElementById("map"));
      }}
      onError={() => {
        // CDN fail / ad blocker — hiển thị fallback thân thiện
        showMapFallback();
      }}
    />
  );
}

// 4. worker (experimental) — chạy script trong Web Worker qua Partytown
// next.config.ts: experimental: { nextScriptWorkers: true }
// <Script src="https://analytics.example.com/heavy.js" strategy="worker" />
// → không chiếm main thread, nhưng script cần DOM trực tiếp sẽ không chạy được
```

### Đáp án mẫu

> "`next/script` giải quyết vấn đề third-party script block render: thay vì `<script>` thường chặn HTML parsing, em khai báo **strategy theo vòng đời trang**. Mặc định là `afterInteractive` — load sau khi hydrate, em dùng cho analytics, GTM. `lazyOnload` load lúc browser idle, hợp cho chat widget, social embed. `beforeInteractive` chạy trước hydrate, rất hiếm khi cần — polyfill hay bot detection — và phải đặt ở root layout. Còn `worker` là experimental, chạy script trong Web Worker qua Partytown để không chiếm main thread. So với `async`/`defer` thuần thì `next/script` còn dedupe khi component mount nhiều lần và có callbacks: `onLoad` chạy một lần khi load xong, `onReady` chạy cả khi re-mount — em dùng để re-init map khi navigate quay lại, `onError` để fallback khi CDN fail. Pitfall em hay nhắc: inline script bắt buộc có `id` để Next track, và callbacks chỉ dùng được trong Client Component."

---

## Câu 39: Middleware proxy pattern trong Next.js như thế nào? `[Advanced]`

### Câu hỏi

> Em dùng middleware làm proxy trong Next.js như thế nào? Rewrite khác redirect ra sao, khi nào dùng middleware rewrite thay vì `rewrites` trong `next.config`, và có giới hạn gì?

### Giải thích lý thuyết

Core của pattern: **`NextResponse.rewrite(new URL(...))`** — đổi đích xử lý **server-side** mà **URL trên browser không đổi**. Khác với redirect (browser nhận 307/308, URL đổi, thêm round-trip), rewrite trong suốt với user.

| | `NextResponse.redirect` | `NextResponse.rewrite` |
| --- | --- | --- |
| URL browser | **Đổi** | **Giữ nguyên** |
| Round-trip | Có (browser request lại) | Không — xử lý nội bộ |
| Use case | Auth, trang đã chuyển nhà | Proxy, A/B test, multi-tenant |

Use case proxy thực tế:
- **API proxy**: `/api/external/*` rewrite sang backend thật — **ẩn URL backend**, đính kèm auth header/API key ở middleware (secret không bao giờ lộ ra client).
- **A/B testing**: đọc cookie bucket → rewrite `/pricing` sang `/pricing/a` hoặc `/pricing/b`, URL user thấy vẫn là `/pricing`.
- **Multi-tenant theo subdomain**: `acme.myapp.com/dashboard` → rewrite sang `/tenants/acme/dashboard` — một codebase serve N tenant.
- **Maintenance mode**: check flag → rewrite mọi route sang `/maintenance`, URL giữ nguyên nên user F5 là quay lại trang cũ khi hết bảo trì.

**Middleware rewrite vs `rewrites` trong `next.config`**:
- `next.config` rewrites: **tĩnh**, khai báo lúc build — đủ cho mapping cố định (`/api/:path*` → `https://backend.com/:path*`), không cần logic.
- Middleware rewrite: khi đích **phụ thuộc runtime** — cookie, header, subdomain, geo, feature flag. Cần logic → middleware; mapping tĩnh → config (rẻ hơn, không tốn invocation).

**Giới hạn**: rewrite chỉ trỏ được tới route **trong cùng deployment**, hoặc **external URL** (absolute URL — cần được hỗ trợ bởi platform/cấu hình, trên self-host phải khai báo qua config). Ngoài ra rewrite không đọc được response để chỉnh sửa — middleware chỉ quyết định "đi đâu", không phải full reverse proxy như nginx.

### Code minh hoạ

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hostname = req.headers.get("host") ?? "";

  // 1. API proxy — ẩn backend, đính secret ở server-side
  if (pathname.startsWith("/api/external/")) {
    const target = new URL(
      pathname.replace("/api/external", ""),
      process.env.BACKEND_URL, // backend thật — client không bao giờ thấy
    );
    const headers = new Headers(req.headers);
    headers.set("x-api-key", process.env.BACKEND_API_KEY!); // secret server-side

    // URL browser vẫn là /api/external/..., request thật đi tới backend
    return NextResponse.rewrite(target, { request: { headers } });
  }

  // 2. Multi-tenant theo subdomain
  // acme.myapp.com/dashboard → render app/tenants/[slug]/dashboard
  const subdomain = hostname.split(".")[0];
  if (subdomain && subdomain !== "www" && subdomain !== "myapp") {
    return NextResponse.rewrite(
      new URL(`/tenants/${subdomain}${pathname}`, req.url),
    );
  }

  // 3. Maintenance mode — URL giữ nguyên, F5 là về trang cũ khi mở lại
  if (process.env.MAINTENANCE_MODE === "1" && pathname !== "/maintenance") {
    return NextResponse.rewrite(new URL("/maintenance", req.url));
  }

  // 4. A/B test — đích phụ thuộc cookie → BẮT BUỘC middleware, config không làm được
  if (pathname === "/pricing") {
    const bucket = req.cookies.get("bucket")?.value ?? "a";
    return NextResponse.rewrite(new URL(`/pricing/${bucket}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

```typescript
// next.config.ts — mapping TĨNH thì dùng rewrites config, không cần middleware
const nextConfig = {
  async rewrites() {
    return [
      {
        // Cố định, biết trước lúc build — rẻ hơn middleware
        source: "/api/legacy/:path*",
        destination: "https://legacy-backend.example.com/:path*",
      },
    ];
  },
};
export default nextConfig;

// Quy tắc chọn:
// - Đích cố định, không logic        → next.config rewrites
// - Đích theo cookie/header/subdomain → middleware NextResponse.rewrite
```

### Đáp án mẫu

> "Proxy pattern là dùng `NextResponse.rewrite(new URL(...))` trong middleware: đổi đích xử lý server-side mà **URL browser không đổi** — khác redirect là URL đổi và tốn thêm round-trip. Use case em hay dùng: **API proxy** — rewrite `/api/external/*` sang backend thật và đính API key vào header ngay trong middleware, secret không bao giờ lộ ra client; **multi-tenant** — đọc subdomain rồi rewrite sang `/tenants/[slug]/...`, một codebase serve nhiều tenant; **A/B testing** rewrite theo cookie bucket; và **maintenance mode** rewrite mọi route sang trang bảo trì. So với `rewrites` trong `next.config`: config là mapping tĩnh lúc build — đủ cho proxy cố định và rẻ hơn; còn đích phụ thuộc runtime như cookie, header, geo thì bắt buộc middleware. Giới hạn em lưu ý: rewrite chỉ trỏ trong cùng deployment, external URL phải là absolute và được platform/config hỗ trợ; và middleware chỉ quyết định request đi đâu, không chỉnh sửa được response như reverse proxy thật."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                  | Đúng là                                                                 |
| -------------------------------------------------------- | ----------------------------------------------------------------------- |
| "GET trong route handler được cache mặc định"            | Next 14 thì đúng; **Next 15 GET mặc định KHÔNG cache** — phải opt-in    |
| "Đặt `route.ts` cạnh `page.tsx` cho tiện"                | Conflict cùng URL — build fail; tách `app/api/` riêng                   |
| "Auth làm hết trong middleware là đủ"                    | Middleware chỉ optimistic check; verify + authorization ở server/DAL    |
| "Middleware query DB để check quyền chi tiết"            | Chạy trên MỌI request + Edge runtime — không làm việc nặng/Node API     |
| "Rewrite và redirect như nhau"                           | Rewrite: URL giữ nguyên, xử lý nội bộ; redirect: URL đổi, thêm round-trip |
| "Mọi proxy đều phải viết middleware"                     | Mapping tĩnh dùng `rewrites` trong `next.config` — rẻ hơn; middleware chỉ khi đích phụ thuộc runtime |
| "Link prefetch ở cả dev mode"                            | Chỉ production — test tốc độ navigation phải dùng production build      |
| "Dynamic route được prefetch full như static"            | Dynamic chỉ prefetch tới boundary `loading.tsx`; static mới full        |
| "Script nào cũng để `beforeInteractive` cho nhanh"       | `beforeInteractive` block hydrate, chỉ cho polyfill/bot detect; analytics dùng `afterInteractive`, widget dùng `lazyOnload` |
| "Inline `<Script>` không cần gì thêm"                    | Bắt buộc có `id` để Next track và dedupe                                |
| "params/searchParams là object đồng bộ"                  | Next 15: cả hai là **Promise** — phải `await`                           |
