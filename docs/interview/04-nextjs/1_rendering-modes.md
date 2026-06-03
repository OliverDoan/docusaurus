---
sidebar_position: 1
title: "1. Rendering Modes (SSR/SSG/ISR/CSR)"
---

# Rendering Modes (SSR/SSG/ISR/CSR)

> *Hỏi Next.js mà không hỏi rendering modes là không phải hỏi Next.js. Phần này quyết định bạn hiểu Next.js ở mức "dùng" hay "kiến trúc".*

---

## Câu 1: 4 rendering modes — phân biệt và khi nào dùng `[Intermediate]`

### Câu hỏi

> Liệt kê các rendering mode của Next.js. Mỗi mode em chọn dựa trên tiêu chí gì?

### Giải thích lý thuyết

| Mode      | Render ở đâu          | Cache                              | Use case                            |
| --------- | --------------------- | ---------------------------------- | ----------------------------------- |
| **CSR**   | Client (browser)      | Không (data fetch client)          | Dashboard, app interactive cao      |
| **SSR**   | Server mỗi request    | Tuỳ (HTTP cache)                   | Page cần data real-time, personalized |
| **SSG**   | Build time            | CDN cache vĩnh viễn                | Blog, marketing, docs               |
| **ISR**   | Build time + revalidate | Static + refresh sau X giây       | Product page, list update không liên tục |

App Router có thêm:
- **Streaming SSR** với Suspense — gửi HTML từng phần.
- **PPR (Partial Pre-rendering)** — phần static prerender, phần dynamic stream.

### Code minh hoạ

```jsx
// App Router (Next 13+)
// Static (SSG) — mặc định
// app/about/page.tsx
export default function About() {
  return <h1>About us</h1>;
}

// SSG with data — build time
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await fetchAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function Post({ params }) {
  const post = await fetchPost(params.slug);
  return <Article post={post} />;
}

// SSR — fetch với no-cache
// app/dashboard/page.tsx
export default async function Dashboard() {
  const data = await fetch("https://api.example.com/data", {
    cache: "no-store",  // SSR mỗi request
  }).then((r) => r.json());

  return <DashboardView data={data} />;
}

// ISR — revalidate mỗi 60s
// app/products/[id]/page.tsx
export default async function Product({ params }) {
  const product = await fetch(`https://api.example.com/products/${params.id}`, {
    next: { revalidate: 60 }, // ISR
  }).then((r) => r.json());

  return <ProductPage product={product} />;
}

// On-demand ISR
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(request: Request) {
  const { path, tag } = await request.json();
  if (path) revalidatePath(path);
  if (tag) revalidateTag(tag);
  return Response.json({ revalidated: true });
}

// CSR trong RSC — dùng client component
// app/dashboard/InteractiveChart.tsx
"use client";
import { useEffect, useState } from "react";

export default function InteractiveChart() {
  const [data, setData] = useState(null);
  useEffect(() => { fetch("/api/data").then((r) => r.json()).then(setData); }, []);
  return <Chart data={data} />;
}
```

### Đáp án mẫu

> "4 modes: **CSR** (client render), **SSR** (server mỗi request), **SSG** (build time), **ISR** (static + revalidate). Tiêu chí em chọn dựa trên 2 câu hỏi: (1) data đổi nhanh không? (2) SEO có quan trọng không? Blog, docs, marketing — data ít đổi + cần SEO → **SSG**. Product page — data đổi từng giờ + SEO → **ISR** với revalidate 60-300s. Dashboard user — personalized + không SEO → **CSR** hoặc SSR cho first paint nhanh. Page tin tức real-time → **SSR no-cache**. Trong App Router em ưu tiên Server Component + Streaming SSR — render server nhưng stream từng phần, kết hợp được SSG cho phần static (header, footer) và SSR cho phần dynamic (user info). Quy tắc: SSR mỗi request là tệ nhất về performance — chỉ dùng khi thực sự cần data freshness mỗi page load."

---

## Câu 2: SPA (CSR) vs SSR — so sánh và khi nào dùng `[Intermediate]`

### Câu hỏi

> So sánh SPA (Single Page Application / Client-Side Rendering) và SSR (Server-Side Rendering). Next.js giải quyết nhược điểm của SPA thuần như thế nào?

### Giải thích lý thuyết

**SPA / CSR**: server trả về 1 file HTML gần như rỗng + bundle JS. Browser tải JS, chạy React, fetch data, rồi mới render UI. Mọi điều hướng sau đó là client-side (đổi view bằng JS, không reload trang).

**SSR**: server render component thành HTML hoàn chỉnh mỗi request, gửi về browser. User thấy nội dung ngay; sau đó React **hydrate** để gắn event listener, biến HTML tĩnh thành app tương tác.

| Tiêu chí               | SPA (CSR)                                  | SSR                                         |
| ---------------------- | ------------------------------------------ | ------------------------------------------- |
| Render ở đâu           | Browser (sau khi tải JS)                   | Server (mỗi request)                        |
| First paint / FCP      | Chậm (chờ JS tải + chạy + fetch)           | Nhanh (HTML có sẵn nội dung)                |
| TTFB                   | Nhanh (HTML rỗng)                          | Chậm hơn (server render trước)              |
| SEO                    | Yếu (crawler thấy HTML rỗng)               | Tốt (HTML đầy đủ nội dung)                  |
| Tải server             | Nhẹ (chỉ serve static)                     | Nặng (render mỗi request)                   |
| Sau khi load           | Điều hướng nhanh, mượt (không reload)      | Mỗi navigation có thể cần round-trip server |
| Social share (OG tags) | Không hoạt động (meta tag render client)   | Hoạt động (meta có trong HTML)              |
| Độ phức tạp            | Đơn giản (frontend thuần)                  | Phức tạp (cần Node server, lo hydration)    |

**Điểm mấu chốt**: SPA tối ưu cho **TTI sau lần load đầu** và app tương tác cao (dashboard sau login); SSR tối ưu cho **first paint + SEO** (landing page, blog, e-commerce). Đây không phải "cái nào tốt hơn" mà là trade-off theo use case.

### Code minh hoạ

```jsx
// === SPA thuần (kiểu Create React App / Vite) ===
// index.html chỉ có: <div id="root"></div>
// Toàn bộ render xảy ra ở client
import { useEffect, useState } from "react";

function ProductPage({ id }) {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    // Fetch chạy ở browser → user thấy loading trước, content sau
    fetch(`/api/products/${id}`).then((r) => r.json()).then(setProduct);
  }, [id]);

  if (!product) return <Spinner />; // crawler thường chỉ thấy cái này
  return <Article product={product} />;
}

// === SSR với Next.js App Router (Server Component) ===
// app/products/[id]/page.tsx
export default async function ProductPage({ params }) {
  // Fetch chạy Ở SERVER → HTML gửi về đã có sẵn nội dung
  const product = await fetch(`https://api.example.com/products/${params.id}`, {
    cache: "no-store", // SSR mỗi request
  }).then((r) => r.json());

  // Crawler nhận HTML đầy đủ → SEO tốt
  return <Article product={product} />;
}

// === Next.js = hybrid: SSR cho first paint + SPA navigation sau đó ===
// Sau khi page SSR load xong, <Link> điều hướng kiểu client-side (như SPA)
import Link from "next/link";

export default function Nav() {
  // Click link này KHÔNG reload trang — prefetch + client-side transition
  // Vừa có SEO/first-paint của SSR, vừa có UX mượt của SPA
  return <Link href="/products/2">Sản phẩm khác</Link>;
}
```

### Đáp án mẫu

> "SPA (CSR) render hoàn toàn ở browser: server trả HTML rỗng + bundle JS, client tải JS rồi mới fetch data và render. SSR render HTML hoàn chỉnh ở server mỗi request, gửi về cho user thấy ngay, sau đó React hydrate để gắn interactivity.
>
> Trade-off chính: **SPA** first paint chậm (phải chờ JS tải + chạy + fetch) và SEO yếu vì crawler thường chỉ thấy `<div id='root'>` rỗng, nhưng bù lại sau lần load đầu thì điều hướng cực mượt (không reload) và server rất nhẹ. **SSR** ngược lại: first paint nhanh, SEO tốt, OG tag cho social share hoạt động, nhưng TTFB chậm hơn và server tải nặng vì render mỗi request.
>
> Điểm hay của Next.js là nó **hybrid** chứ không bắt chọn một bên. Lần đầu vào page thì SSR (hoặc SSG) — user thấy nội dung ngay, crawler đọc được, OG tag đầy đủ. Nhưng khi đã ở trong app, dùng `<Link>` thì điều hướng là client-side transition kèm prefetch — mượt y như SPA, không reload trang. Vậy là lấy được first-paint + SEO của SSR và UX navigation của SPA cùng lúc.
>
> Em chọn theo use case: trang public cần SEO (landing, blog, product) → SSR/SSG; phần sau đăng nhập như dashboard, không cần SEO, tương tác cao → để CSR (client component) là đủ và nhẹ server."

### Khi nào dùng cái nào

- **Chọn SPA/CSR khi**: app sau authentication (dashboard, admin, trello-like), không cần SEO, tương tác client cao, muốn server nhẹ (chỉ serve static + API).
- **Chọn SSR khi**: cần SEO + first paint nhanh, data thay đổi theo request hoặc personalized, cần OG tag cho social share.
- **Thực tế với Next.js**: kết hợp — SSG/SSR cho trang public, client component cho phần interactive, tận dụng `<Link>` để có SPA-like navigation sau lần load đầu.

---

## Câu 3: ISR và Stale-While-Revalidate `[Intermediate]`

### Câu hỏi

> ISR hoạt động thế nào? Khi `revalidate: 60` thì user request lần 1 và lần 2 (sau 100s) nhận page như thế nào?

### Giải thích lý thuyết

ISR theo pattern **stale-while-revalidate**:

1. **First request** sau build → render dynamic, cache kết quả + timestamp.
2. **Request trong window revalidate (< 60s)** → trả cached page ngay.
3. **Request sau window** → trả **stale page ngay** + trigger background regeneration. Request kế tiếp nhận page mới.

Như vậy user **không bao giờ phải chờ** revalidation. Trade-off: page có thể stale 1 nhịp.

### Code minh hoạ

```jsx
// app/products/[id]/page.tsx
export default async function Product({ params }) {
  const product = await fetch(`https://api.example.com/products/${params.id}`, {
    next: { revalidate: 60 }, // ISR 60s
  }).then((r) => r.json());

  return <ProductPage product={product} />;
}

// Timeline:
// t=0    : Build, page chưa generate
// t=10s  : User A request → render dynamic, cache, trả về (slow first hit)
// t=30s  : User B request → trả cache (fast, fresh)
// t=70s  : User C request → trả cache (stale 10s) + trigger background fetch
// t=70.5s: Background fetch xong, cache update
// t=80s  : User D request → trả cache mới (fresh)

// Có thể combine với on-demand revalidate (webhook khi data đổi)
// app/api/webhook/route.ts
export async function POST(req) {
  const { slug } = await req.json();
  revalidatePath(`/products/${slug}`); // force regenerate ngay
  return Response.json({ ok: true });
}

// Trong CMS (Sanity, Strapi), config webhook để gọi endpoint này khi content publish
// → ISR + on-demand = best of both: cache + freshness

// Pattern: tag-based cache
const data = await fetch(url, {
  next: { tags: ["products"], revalidate: 3600 },
});

// Invalidate theo tag
revalidateTag("products"); // mọi page tag products refresh
```

### Đáp án mẫu

> "ISR = **stale-while-revalidate**. Lần 1 (t=10s): không có cache, render dynamic, lưu cache + timestamp, trả về. Lần 2 (t=100s, đã quá 60s): trả **page cũ ngay** cho user (không chờ), đồng thời trigger background regeneration. Request kế tiếp sẽ nhận page mới. Pattern này đảm bảo user **không bao giờ phải chờ revalidation** — luôn nhanh. Trade-off: nội dung có thể stale 1 cycle. Em pair ISR với **on-demand revalidation** qua webhook — khi CMS publish content, gọi `/api/revalidate` với `revalidatePath` hoặc `revalidateTag` để force refresh ngay, không phải chờ 60s. Với tag-based cache, em group nhiều page liên quan (ví dụ tất cả product page tag 'products'), invalidate 1 tag refresh hết — quản lý cache dễ hơn rất nhiều."

---

## Câu 4: Hydration error — nguyên nhân và cách fix `[Intermediate]`

### Câu hỏi

> User báo console warning "Hydration failed". Em debug thế nào?

### Giải thích lý thuyết

Hydration error xảy ra khi HTML server render **khác** với client render lần đầu.

Nguyên nhân phổ biến:

1. **Time/Date trong render** — `new Date()` chạy server (UTC?) khác client (local).
2. **Random** — `Math.random()`, `crypto.randomUUID()`.
3. **`window`/`localStorage` access** — không tồn tại trên server.
4. **Browser extensions** — chèn HTML vào DOM trước hydrate.
5. **CSS conditional** — `useMediaQuery` server không có viewport size.
6. **HTML sai cấu trúc** — `<p><div></div></p>` browser tự fix.

### Code minh hoạ

```jsx
// ❌ Date — server và client khác timezone
function BadTime() {
  return <p>Hôm nay: {new Date().toLocaleString()}</p>;
  // Server: "5/27/2026, 4:00:00 PM UTC"
  // Client: "27/5/2026, 23:00:00 GMT+7"
}

// ✅ Cách 1: format ổn định (UTC hoặc ISO)
function GoodTime() {
  return <p>Hôm nay: {new Date().toISOString().slice(0, 10)}</p>;
}

// ✅ Cách 2: render sau hydration với useEffect
function ClientTime() {
  const [time, setTime] = useState("");
  useEffect(() => setTime(new Date().toLocaleString()), []);
  return <p>Hôm nay: {time}</p>;
}

// ✅ Cách 3: suppressHydrationWarning (chỉ chỗ thực sự khác, không lạm dụng)
<time dateTime={iso} suppressHydrationWarning>{new Date().toLocaleString()}</time>

// ❌ window access trong render
function BadWindow() {
  const width = typeof window !== "undefined" ? window.innerWidth : 0;
  return <div>{width}</div>; // server = 0, client = 1920 → mismatch
}

// ✅ Lazy với useEffect hoặc dynamic import ssr:false
import dynamic from "next/dynamic";
const ClientChart = dynamic(() => import("./Chart"), { ssr: false });

// ✅ useSyncExternalStore cho external state
import { useSyncExternalStore } from "react";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false  // server snapshot
  );
}

function ResponsiveLayout() {
  const isClient = useIsClient();
  if (!isClient) return <ServerLayout />;
  return <ClientLayout width={window.innerWidth} />;
}

// ❌ HTML sai cấu trúc
<p>
  <div>cannot nest</div> {/* browser tự fix, mismatch với server HTML */}
</p>
```

### Đáp án mẫu

> "Hydration error xảy ra khi HTML server render khác với client render lần đầu. Top nguyên nhân: `new Date()` (timezone server vs client khác), random (Math.random, UUID), `window`/`localStorage` access (server không có), `useMediaQuery` (server không có viewport), và HTML sai structure (`<p><div></div></p>`). Cách debug: mở console, React thường log diff cụ thể giữa server và client HTML, từ đó tìm component. Fix tuỳ case: dùng `useEffect` để defer render client-only; dùng `dynamic(import, { ssr: false })` cho component dùng browser API; dùng `suppressHydrationWarning` rất sparingly cho element thực sự khác (như clock). Em tránh `suppressHydrationWarning` ở component to vì nó disable check cả subtree, dễ giấu bug khác. Một detail: browser extension (Grammarly, ad blocker) chèn HTML cũng gây mismatch — không phải bug code, nhưng nên test ở incognito để confirm."

---

## Câu 5: SEO trong Next.js — Metadata API `[Intermediate]`

### Câu hỏi

> Em làm SEO cho Next.js app như thế nào? App Router khác Pages Router thế nào?

### Giải thích lý thuyết

App Router có **Metadata API** mới:

- Static metadata: `export const metadata` trong page/layout.
- Dynamic metadata: `generateMetadata` function.
- File-based: `opengraph-image.tsx`, `icon.tsx`, `sitemap.ts`, `robots.ts`.

Pages Router cũ dùng `next/head` thủ công hoặc `next-seo` lib.

Lợi ích Metadata API:
- Type-safe.
- Tự handle Open Graph, Twitter Cards.
- File convention cho favicon, OG image dynamic.

### Code minh hoạ

```typescript
// app/layout.tsx — default cho cả app
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: {
    default: "My Site",
    template: "%s | My Site",  // <title>X | My Site</title>
  },
  description: "Default description",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "My Site",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

// app/blog/[slug]/page.tsx — dynamic metadata
import type { Metadata } from "next";

export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await fetchPost(params.slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.coverImage, width: 1200, height: 630 }],
      type: "article",
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      images: [post.coverImage],
    },
    alternates: {
      canonical: `/blog/${params.slug}`,
      languages: {
        "en": `/en/blog/${params.slug}`,
        "vi": `/vi/blog/${params.slug}`,
      },
    },
  };
}

// app/opengraph-image.tsx — dynamic OG image
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };

export default async function Image({ params }) {
  const post = await fetchPost(params.slug);
  return new ImageResponse(
    <div style={{ display: "flex", fontSize: 48 }}>{post.title}</div>,
    size
  );
}

// app/sitemap.ts
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await fetchAllPosts();
  return [
    { url: "https://example.com", lastModified: new Date(), priority: 1 },
    ...posts.map((p) => ({
      url: `https://example.com/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}

// app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/admin" }],
    sitemap: "https://example.com/sitemap.xml",
  };
}

// JSON-LD (structured data) — render trong page
function BlogPost({ post }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    author: post.author,
    datePublished: post.publishedAt,
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article>{post.content}</article>
    </>
  );
}
```

### Đáp án mẫu

> "App Router có **Metadata API** — chuẩn nhất hiện tại. Em export `metadata` object hoặc `generateMetadata` async function trong page. Default ở `app/layout.tsx`, override ở page con. Type-safe nhờ `Metadata` type. Cho OG image dynamic, em dùng file convention `opengraph-image.tsx` với `ImageResponse` từ `next/og` — tạo image runtime mà không cần generate trước, mỗi page có OG image riêng theo title. Sitemap và robots: tạo `sitemap.ts` và `robots.ts` ở app root, export function trả structure — Next tự generate XML. Structured data (JSON-LD) thì em render `<script type='application/ld+json'>` trực tiếp trong page — Google đọc được. Pages Router cũ dùng `next/head` thủ công — verbose hơn, dễ quên field. Em luôn check Google Search Console + Lighthouse SEO score sau khi deploy."

---

## Câu 6: Edge Runtime vs Node.js Runtime `[Senior]`

### Câu hỏi

> Next.js có Edge Runtime và Node.js Runtime. Khác nhau gì? Khi nào chọn cái nào?

### Giải thích lý thuyết

| Tính chất            | Node.js Runtime              | Edge Runtime                          |
| -------------------- | ---------------------------- | ------------------------------------- |
| Engine               | Node.js (V8 + Node API)      | V8 isolate (Web standard API only)    |
| Cold start           | Chậm hơn (~500ms)            | Cực nhanh (~10ms)                     |
| Global distribution  | Region cụ thể                | Chạy gần user (CDN edge)              |
| API availability     | Full Node.js                 | Subset: fetch, Crypto, Streams        |
| Library support      | Mọi npm package              | Phải Web standard hoặc edge-compatible |
| Memory limit         | Cao                          | Thấp (~128MB)                         |
| Execution time       | Cao                          | Thấp (~30s)                           |
| Use case             | DB query, file system, heavy | Auth, A/B test, redirects, light API  |

### Code minh hoạ

```typescript
// Set runtime per route
// app/api/heavy/route.ts
export const runtime = "nodejs"; // default

import fs from "fs"; // OK trong Node runtime
import { prisma } from "@/lib/prisma"; // ORM với native driver

export async function POST(req) {
  const users = await prisma.user.findMany();
  return Response.json(users);
}

// Edge runtime — light, global
// app/api/geo/route.ts
export const runtime = "edge";

export async function GET(req: Request) {
  const country = req.headers.get("cf-ipcountry") ?? "VN";
  // fs.readFile() — ❌ không có fs
  // prisma — ❌ không edge-compatible (cần Prisma Accelerate hoặc Neon driver)
  return Response.json({ country });
}

// Middleware — luôn edge
// middleware.ts
import { NextResponse } from "next/server";

export function middleware(req) {
  const country = req.geo?.country;
  if (country === "VN") {
    return NextResponse.redirect(new URL("/vi", req.url));
  }
}

// Edge-compatible DB clients
// import { neon } from "@neondatabase/serverless"; // Postgres qua HTTP
// import { drizzle } from "drizzle-orm/neon-http";

// Trade-off thực tế
// Edge: nhanh hơn cho user cross-region, cold start gần như không có
// Node: nhiều library hơn, debug dễ hơn, memory/time limit cao
```

### Đáp án mẫu

> "Edge Runtime chạy trên V8 isolate (không phải Node.js), chỉ có Web standard API như `fetch`, `Crypto`, `Streams`. Lợi: cold start gần như zero, chạy gần user (CDN edge), latency thấp. Hạn chế: không có `fs`, `Buffer` (chỉ Web stream), nhiều npm lib không tương thích — Prisma cần Accelerate/Neon driver, không thể `import sharp`. Em chọn dựa trên workload: **Edge** cho middleware (auth check, geo redirect, A/B test), light API (config, feature flag), webhook handler đơn giản — gain latency cho user toàn cầu. **Node.js Runtime** cho việc nặng: ORM (Prisma), image processing (sharp), file system, long-running task. Nguyên tắc của em: middleware luôn edge (mandatory rồi), API route mặc định Node, chuyển sang edge khi profiling cho thấy cold start gây vấn đề hoặc cần geo-distribution."

---

## Câu 7: Streaming SSR + Partial Pre-rendering `[Senior]`

### Câu hỏi

> Streaming SSR và Partial Pre-rendering (PPR) khác nhau thế nào? Em đã dùng chưa?

### Giải thích lý thuyết

**Streaming SSR** (đã GA):
- Server bắt đầu gửi HTML ngay, không chờ tất cả data ready.
- Suspense boundary là "split point" — fallback render trước, content stream vào sau.
- Cải thiện TTFB và LCP đáng kể.

**Partial Pre-rendering (PPR)** (experimental → stable trong Next 16):
- Combine SSG + SSR: shell static prerender lúc build, dynamic content stream lúc request.
- Hybrid: phần không đổi (header, layout, skeleton) tải instant từ CDN, phần dynamic (user info, recent activity) stream sau.

### Code minh hoạ

```jsx
// Streaming SSR — Suspense boundary
// app/dashboard/page.tsx
import { Suspense } from "react";

export default function Dashboard() {
  return (
    <>
      <Header />  {/* static — render ngay */}
      <Suspense fallback={<RevenueSkeleton />}>
        <Revenue />  {/* slow fetch — stream sau */}
      </Suspense>
      <Suspense fallback={<UsersSkeleton />}>
        <RecentUsers />  {/* slow fetch — stream sau */}
      </Suspense>
    </>
  );
}

async function Revenue() {
  const data = await fetch("https://api.../revenue", { cache: "no-store" })
    .then((r) => r.json());
  return <RevenueChart data={data} />;
}

// Timeline:
// t=0   : HTML có Header + 2 skeleton → first paint (LCP candidate đã visible)
// t=300ms : Revenue stream → chart fill in
// t=500ms : Users stream → list fill in

// PPR — kết hợp static + dynamic
// next.config.js
module.exports = {
  experimental: { ppr: "incremental" }, // opt-in per route
};

// app/products/[id]/page.tsx
export const experimental_ppr = true;

export default async function Product({ params }) {
  return (
    <>
      <ProductImage id={params.id} />  {/* prerender lúc build */}
      <ProductTitle id={params.id} />  {/* prerender */}

      {/* Dynamic — stream lúc request */}
      <Suspense fallback={<PriceSkeleton />}>
        <CurrentPrice id={params.id} />
      </Suspense>

      <Suspense fallback={<StockSkeleton />}>
        <StockStatus id={params.id} />
      </Suspense>

      <Suspense fallback={<RecommendSkeleton />}>
        <PersonalizedRecommendations userId={...} />
      </Suspense>
    </>
  );
}

// User experience:
// CDN trả về HTML shell với image + title + skeleton (instant, no server hit)
// Origin stream dynamic parts trong cùng response
```

### Đáp án mẫu

> "Streaming SSR đã GA — server bắt đầu gửi HTML ngay, slow data wrap trong Suspense và stream vào sau. Improvement chính: TTFB và LCP rõ rệt với page có nhiều data fetch. PPR là next-level: combine SSG + streaming. Phần static (image, title, layout) prerender lúc build, tải instant từ CDN. Phần dynamic (price, stock, user-specific) stream từ origin trong cùng response. User thấy shell instant, dynamic fill in. Cùng một page có thể chạy cả static lẫn dynamic trong cùng 1 request — không phải chọn 1 trong 2. Em đã dùng streaming cho dashboard và product page — cải thiện perceived performance rõ. PPR thì đang adopt cho marketplace project — kết hợp được SEO benefit của static với personalization của SSR. Trade-off: phức tạp hơn — phải design boundary cẩn thận để skeleton không gây CLS, và phải hiểu cache strategy."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                | Đúng là                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| "SSR luôn tốt hơn CSR cho SEO"                         | SSR + heavy data fetch có thể chậm hơn CSR + skeleton                |
| "ISR là magic không có downside"                       | Page có thể stale 1 cycle; cần on-demand revalidate cho freshness    |
| "Hydration error chỉ là warning, kệ"                   | Có thể gây mismatch UI nghiêm trọng + bị React fallback CSR phần đó  |
| "Edge runtime nhanh hơn Node nên dùng edge"            | Đổi lại library limit; chọn theo workload                            |
| "Streaming SSR thay thế ISR"                           | Khác mục đích: streaming cải thiện perceived; ISR cải thiện caching  |
