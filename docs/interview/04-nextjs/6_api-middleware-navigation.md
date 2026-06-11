---
sidebar_position: 6
title: "6. Route Handlers, Middleware & Navigation"
---

# Route Handlers, Middleware & Navigation

> *Metadata, Route Handlers, Middleware và bộ navigation hooks là những thứ bạn đụng hàng ngày khi làm App Router — phỏng vấn hỏi để kiểm tra bạn đã thực sự build app với Next.js 15 hay chỉ đọc docs.*

---

## Câu 2: Metadata trong App Router được định nghĩa như thế nào? `[Basic]`

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

## Câu 8: Route Handlers (API Routes) trong App Router là gì? `[Basic]`

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

## Câu 9: Middleware trong Next.js dùng để làm gì? `[Intermediate]`

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

## Câu 38: useRouter() trong next/navigation khác gì so với next/router? `[Intermediate]`

### Câu hỏi

> `useRouter()` import từ `next/navigation` khác gì so với `next/router` cũ? `router.refresh()` làm gì?

### Giải thích lý thuyết

App Router dùng `useRouter` từ **`next/navigation`** — API hoàn toàn khác `next/router` (Pages Router):

| Khía cạnh           | `next/router` (Pages)             | `next/navigation` (App)                    |
| ------------------- | --------------------------------- | ------------------------------------------ |
| `router.push/replace/back` | Có                          | Có (`push`, `replace`, `back`, `forward`)  |
| `router.query`      | Có (params + search params)       | **Bỏ** → dùng `useParams()` + `useSearchParams()` |
| `router.pathname`   | Có                                 | **Bỏ** → dùng `usePathname()`              |
| `router.events`     | Có (`routeChangeStart`...)        | **Bỏ** — theo dõi đổi route bằng `useEffect` trên `usePathname` |
| `router.refresh()`  | Không có                          | **Mới** — refetch RSC payload              |
| `router.prefetch()` | Có                                 | Có                                         |
| Dùng ở đâu          | Mọi component                     | **Chỉ Client Component** (`'use client'`)  |

Triết lý thay đổi: thay vì 1 object router "biết tất cả", App Router **tách thành các hook nhỏ** (`usePathname`, `useSearchParams`, `useParams`) — component chỉ subscribe đúng thứ nó cần → ít re-render thừa hơn.

**`router.refresh()`** — đáng nhớ nhất: gửi request lên server **refetch RSC payload** của route hiện tại, server re-render Server Components với data mới, nhưng **giữ nguyên client state** (`useState`, scroll, focus không mất). Đây là cách "làm tươi" data sau mutation mà không full reload. Không cần gọi nếu mutation dùng Server Action + `revalidatePath` (đã tự refresh).

Pitfall: gọi `useRouter` từ `next/navigation` trong Server Component → error; import nhầm từ `next/router` trong App Router → error "NextRouter was not mounted".

### Code minh hoạ

```tsx
"use client"; // useRouter (next/navigation) CHỈ dùng trong Client Component

import { useRouter } from "next/navigation"; // ⚠️ KHÔNG phải next/router

export function ProductActions({ productId }: { productId: string }) {
  const router = useRouter();

  async function handleDelete() {
    const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
    if (!res.ok) {
      // Hiển thị lỗi thân thiện cho người dùng
      alert("Xoá sản phẩm thất bại, vui lòng thử lại");
      return;
    }

    // refresh(): refetch RSC payload — Server Component re-render với data mới,
    // nhưng client state (useState, scroll) GIỮ NGUYÊN — không full reload
    router.refresh();
  }

  return (
    <div>
      <button onClick={() => router.push(`/products/${productId}/edit`)}>
        Sửa
      </button>
      <button onClick={() => router.replace("/products")}>
        Về danh sách (không thêm history entry)
      </button>
      <button onClick={() => router.back()}>Quay lại</button>
      <button onClick={handleDelete}>Xoá</button>
    </div>
  );
}

// ❌ Pages Router cũ — KHÔNG còn trong next/navigation:
// const router = useRouter();          // từ next/router
// router.query.id                      // → thay bằng useParams()
// router.pathname                      // → thay bằng usePathname()
// router.events.on("routeChangeStart") // → bỏ, không có thay thế trực tiếp

// ✅ App Router — theo dõi route change bằng usePathname + useEffect
"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Chạy mỗi khi pathname đổi — thay cho router.events
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
```

### Đáp án mẫu

> "Trong App Router em import `useRouter` từ `next/navigation`, không phải `next/router` — import nhầm là lỗi runtime ngay. Router mới chỉ còn các method điều hướng: `push`, `replace`, `back`, `forward`, `prefetch`, và thêm `refresh()`. Những thứ cũ như `router.query`, `router.pathname`, `router.events` bị **tách ra thành hook riêng**: `useParams`, `useSearchParams`, `usePathname` — component chỉ subscribe đúng cái cần nên ít re-render hơn. `router.events` bị bỏ hẳn, em thay bằng `useEffect` theo dõi `usePathname`. Method em dùng nhiều nhất là `router.refresh()`: nó refetch RSC payload để Server Component render lại với data mới sau mutation, nhưng **giữ nguyên client state** — không phải full reload. Lưu ý cuối: `useRouter` là hook nên chỉ dùng được trong Client Component có `'use client'`."

---

## Câu 39: usePathname() và useSearchParams() dùng để làm gì? `[Intermediate]`

### Câu hỏi

> `usePathname()` và `useSearchParams()` dùng khi nào? Vì sao `useSearchParams()` hay gây lỗi lúc build, và em update query string trên URL như thế nào?

### Giải thích lý thuyết

Cả hai đều là hook trong `next/navigation`, **chỉ dùng trong Client Component**:

- **`usePathname()`**: trả về pathname hiện tại (ví dụ `/blog/nextjs`) — dùng cho active nav link, analytics, breadcrumb.
- **`useSearchParams()`**: trả về object `URLSearchParams` **read-only** của query string — dùng cho filter, search, pagination state trên URL.

**Pitfall nổi tiếng nhất khi build**: với route được **static render**, query string không tồn tại lúc prerender — component dùng `useSearchParams` phải được bọc trong **`<Suspense>` boundary**. Nếu không, Next báo lỗi build: *"useSearchParams() should be wrapped in a suspense boundary"* và toàn bộ route bị đẩy sang client-side render. Đây là câu hỏi "đã build production thật chưa" kinh điển.

**Pattern update query string**: `useSearchParams` là read-only → muốn đổi query, tạo `URLSearchParams` mới từ giá trị hiện tại, set/delete key, rồi `router.replace(pathname + "?" + params)`. Dùng `replace` thay vì `push` cho filter/search để không spam history. Lưu ý immutability: `new URLSearchParams(searchParams)` tạo bản copy, không mutate object gốc.

Trong Server Component không dùng được 2 hook này — page nhận prop `searchParams` (Next 15: là Promise, phải `await`).

### Code minh hoạ

```tsx
// 1. usePathname — active nav link
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname(); // ví dụ: "/blog/nextjs"
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link href={href} className={isActive ? "text-blue-600 font-bold" : ""}>
      {label}
    </Link>
  );
}

// 2. useSearchParams + pattern update query string
"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function SearchFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams(); // read-only URLSearchParams

  function handleSearch(term: string) {
    // Tạo bản copy — KHÔNG mutate searchParams gốc
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    params.delete("page"); // đổi filter thì reset pagination

    // replace: không thêm history entry — gõ từng ký tự không spam nút Back
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <input
      defaultValue={searchParams.get("q") ?? ""}
      onChange={(e) => handleSearch(e.target.value)}
      placeholder="Tìm sản phẩm..."
    />
  );
}

// 3. Pitfall build: useSearchParams cần Suspense khi static render
// app/products/page.tsx (Server Component)
import { Suspense } from "react";
import { SearchFilter } from "./SearchFilter";

export default function ProductsPage() {
  return (
    <div>
      <h1>Sản phẩm</h1>
      {/* ✅ Bọc Suspense — không thì build báo:
          "useSearchParams() should be wrapped in a suspense boundary" */}
      <Suspense fallback={<div>Đang tải bộ lọc...</div>}>
        <SearchFilter />
      </Suspense>
    </div>
  );
}

// 4. Server Component đọc query string qua prop searchParams (Next 15: Promise)
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const products = await searchProducts(q ?? "");
  return <ProductList products={products} />;
}
```

### Đáp án mẫu

> "`usePathname` trả về pathname hiện tại — em dùng chủ yếu cho active nav link và tracking. `useSearchParams` trả về `URLSearchParams` read-only của query string — em dùng để giữ state filter, search, pagination trên URL, share link được và F5 không mất. Pitfall kinh điển: khi route static render, component dùng `useSearchParams` **phải bọc trong Suspense boundary**, không thì build fail với lỗi 'should be wrapped in a suspense boundary' — em từng dính khi thêm search box vào page static. Pattern update query của em: vì hook là read-only nên tạo `new URLSearchParams(searchParams)` để copy, `set`/`delete` key, rồi `router.replace(pathname + '?' + params)` — dùng `replace` để gõ search không spam history. Còn trong Server Component thì không dùng hook, page nhận prop `searchParams` — Next 15 phải `await` vì nó là Promise."

---

## Câu 40: next/link hoạt động như thế nào? `[Basic]`

### Câu hỏi

> `next/link` khác gì thẻ `<a>` thường? Khi click một Link, Next.js thực sự làm gì?

### Giải thích lý thuyết

`<Link>` render ra thẻ `<a>` thật (SEO, accessibility, mở tab mới vẫn hoạt động), nhưng **chặn hành vi mặc định** và thực hiện **client-side navigation (soft navigation)**:

| Khía cạnh            | `<a href>` thường                | `<Link href>`                              |
| -------------------- | -------------------------------- | ------------------------------------------ |
| Navigation           | Full page reload                 | Soft navigation — không reload             |
| Tải gì               | Toàn bộ HTML + JS + CSS lại      | Chỉ **RSC payload** của phần tree thay đổi |
| State                | Mất hết (React remount)          | **Layout giữ nguyên state**, không re-render |
| Prefetch             | Không                            | Tự động khi link vào viewport (production) |
| Scroll               | Về top                           | Về top (tắt được bằng `scroll={false}`)    |

Cơ chế khi click: Next chỉ fetch **RSC payload** của các segment thay đổi (page mới), các **layout chung không bị render lại** — state trong layout (sidebar mở/đóng, audio đang phát, input đang gõ) giữ nguyên. Kết hợp Router Cache + prefetch → cảm giác navigate gần như instant.

Props hay dùng:
- `replace` — thay history entry thay vì push.
- `scroll={false}` — không scroll lên top sau navigate.
- `prefetch={false}` — tắt prefetch (xem Câu 41).

Khi nào dùng `<a>` thường: link ra **external site**, hoặc link tới route nằm ngoài app Next (cần full reload thật).

### Code minh hoạ

```tsx
import Link from "next/link";

export function Navigation() {
  return (
    <nav>
      {/* Soft navigation: không full reload, chỉ fetch RSC payload page mới */}
      <Link href="/dashboard">Dashboard</Link>

      {/* Dynamic href */}
      <Link href={`/blog/${post.slug}`}>{post.title}</Link>

      {/* replace: không thêm entry vào history — Back bỏ qua bước này */}
      <Link href="/login" replace>
        Đăng nhập
      </Link>

      {/* scroll={false}: giữ vị trí scroll sau khi navigate */}
      <Link href="/products?page=2" scroll={false}>
        Trang 2
      </Link>

      {/* External link → dùng <a> thường, Link không có ý nghĩa */}
      <a href="https://github.com" target="_blank" rel="noopener noreferrer">
        GitHub
      </a>
    </nav>
  );
}

// Minh hoạ "layout giữ state" khi soft navigation:
// app/dashboard/layout.tsx
"use client";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // State này GIỮ NGUYÊN khi navigate giữa các page con của /dashboard
  // vì layout không bị re-render — chỉ {children} (RSC payload mới) được swap
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
```

### Đáp án mẫu

> "`<Link>` render ra thẻ `<a>` thật nên SEO và mở tab mới vẫn bình thường, nhưng khi click nó chặn default behavior và làm **soft navigation**: thay vì full reload, Next chỉ fetch **RSC payload của phần tree thay đổi** — tức là page mới — còn các layout chung **không render lại, giữ nguyên state**. Ví dụ sidebar đang mở, audio đang phát thì navigate giữa các page con vẫn giữ nguyên; dùng `<a>` thường là mất hết vì browser reload toàn trang. Link còn tự **prefetch** khi vào viewport ở production nên click gần như instant. Props em hay dùng: `replace` để không thêm history entry — hợp cho redirect sau login, và `scroll={false}` khi không muốn nhảy lên top, ví dụ pagination. Em chỉ dùng `<a>` thường cho external link hoặc khi cần full reload thật sự."

---

## Câu 41: Prefetching trong Next.js là gì? `[Intermediate]`

### Câu hỏi

> Prefetching trong Next.js hoạt động thế nào? Static route và dynamic route được prefetch khác nhau ra sao, và khi nào em tắt prefetch?

### Giải thích lý thuyết

Prefetching = Next **tải trước RSC payload** của route đích **trước khi user click**, lưu vào Router Cache → click là render ngay, cảm giác instant.

Cơ chế của `<Link>`:
- Tự prefetch khi link **xuất hiện trong viewport** (dùng Intersection Observer) hoặc khi hover.
- **Chỉ chạy ở production** — `npm run dev` không prefetch, nên đừng đánh giá tốc độ navigation ở dev mode (câu hỏi bẫy phổ biến).

Prefetch **bao nhiêu** phụ thuộc loại route:

| Loại route   | Prefetch mặc định                                                |
| ------------ | ---------------------------------------------------------------- |
| Static route | **Full** — toàn bộ RSC payload, click là hiện ngay               |
| Dynamic route | **Partial** — chỉ tới boundary `loading.tsx` gần nhất: layout + loading skeleton được prefetch, data thật fetch khi click |
| `prefetch={false}` | Không prefetch gì; chỉ fetch khi click                     |

Insight: đây là lý do **`loading.tsx` quan trọng với dynamic route** — có loading boundary thì navigation vẫn instant (hiện skeleton ngay), không có thì user nhìn màn hình "đứng im" chờ server render.

Prefetch thủ công: `router.prefetch("/path")` — dùng khi đoán trước hành vi user (ví dụ prefetch bước 2 của wizard khi user đang điền bước 1).

**Trade-off băng thông**: trang có hàng trăm link (bảng dữ liệu, danh sách dài) → viewport prefetch tạo hàng trăm request, tốn băng thông server + client (thiệt cho user mobile). Khi đó set `prefetch={false}` cho các link trong danh sách, chỉ giữ prefetch cho nav chính.

### Code minh hoạ

```tsx
import Link from "next/link";

export function ProductTable({ products }: { products: Product[] }) {
  return (
    <table>
      <tbody>
        {products.map((p) => (
          <tr key={p.id}>
            <td>
              {/* Danh sách 200 dòng → 200 prefetch request nếu để mặc định.
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

// Prefetch thủ công — đoán trước hành vi user
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

// Dynamic route + loading.tsx — quyết định prefetch được tới đâu
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

> "Prefetching là Next tải trước RSC payload của route đích trước khi user click — `<Link>` tự prefetch khi link vào viewport, lưu vào Router Cache nên click là gần như instant. Lưu ý nó **chỉ chạy ở production**, dev mode không prefetch — nhiều người tưởng app chậm vì test ở dev. Mức prefetch tuỳ loại route: **static route prefetch full** payload; **dynamic route chỉ prefetch tới boundary `loading.tsx`** — tức layout và skeleton, còn data thật fetch lúc click. Vì vậy em luôn thêm `loading.tsx` cho dynamic route để navigation vẫn hiện skeleton ngay. Trade-off là băng thông: trang có danh sách vài trăm link mà để mặc định thì tạo vài trăm request prefetch vô ích — em set `prefetch={false}` cho link trong danh sách dài, giữ prefetch cho nav chính. Khi đoán trước được hành vi user, ví dụ wizard nhiều bước, em gọi `router.prefetch()` thủ công cho bước kế tiếp."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                  | Đúng là                                                                 |
| -------------------------------------------------------- | ----------------------------------------------------------------------- |
| "GET trong route handler được cache mặc định"            | Next 14 thì đúng; **Next 15 GET mặc định KHÔNG cache** — phải opt-in    |
| "Đặt `route.ts` cạnh `page.tsx` cho tiện"                | Conflict cùng URL — build fail; tách `app/api/` riêng                   |
| "Auth làm hết trong middleware là đủ"                    | Middleware chỉ optimistic check; verify + authorization ở server/DAL    |
| "`router.query` để đọc params trong App Router"          | Đã bỏ — dùng `useParams()` / `useSearchParams()` từ `next/navigation`   |
| "`useSearchParams` dùng thoải mái mọi nơi"               | Static render phải bọc `<Suspense>`, không thì build fail               |
| "Link prefetch ở cả dev mode"                            | Chỉ production — test tốc độ navigation phải dùng production build      |
| "params/searchParams là object đồng bộ"                  | Next 15: cả hai là **Promise** — phải `await`                           |
