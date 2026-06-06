---
sidebar_position: 2
title: "2. Code Optimization: Metadata, Lazy Loading, Bundling"
---

# Code Optimization: Metadata, Lazy Loading, Bundling

Tối ưu code là cách giảm lượng JavaScript phải tải và chạy trên trình duyệt để ứng dụng nhẹ và nhanh hơn. Bài này giới thiệu **metadata** (dữ liệu mô tả trang dùng cho SEO), **lazy loading** (chỉ nạp thành phần khi thật sự cần) và **bundling** (gói các tệp mã nguồn lại với nhau). Hiểu các kỹ thuật này giúp người mới biết cách chia nhỏ và nạp code đúng lúc thay vì tải tất cả ngay từ đầu.

---

## Mục lục

- [Metadata API (SEO)](#metadata-api-seo)
- [Dynamic Metadata](#dynamic-metadata)
- [Lazy Loading với dynamic()](#lazy-loading-với-dynamic)
- [Code Splitting](#code-splitting)
- [Package Bundling](#package-bundling)

---

## Metadata API (SEO)

Export `metadata` từ page/layout — Next.js tự thêm `<head>`:

```tsx
// app/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home | My App",
  description: "Welcome to my app",
  openGraph: {
    title: "Home",
    description: "Welcome",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function HomePage() { /* ... */ }
```

Metadata thường dùng:

```ts
{
  title: "...",
  description: "...",

  keywords: ["next.js", "react"],
  authors: [{ name: "An" }],

  // Social
  openGraph: {
    type: "website",
    url: "https://example.com",
    title: "...",
    description: "...",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@username",
  },

  // Robots
  robots: {
    index: true,
    follow: true,
  },

  // Canonical
  alternates: {
    canonical: "https://example.com/about",
    languages: {
      "en": "/en/about",
      "vi": "/vi/about",
    },
  },

  // Icons
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
}
```

**Template** trong root layout — combine với page:

```ts
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: "My App",
    template: "%s | My App",
  },
};

// app/about/page.tsx
export const metadata: Metadata = {
  title: "About",  // sẽ thành "About | My App"
};
```

---

## Dynamic Metadata

`generateMetadata` function — async, dynamic theo data:

```tsx
// app/blog/[slug]/page.tsx
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPost(slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      images: [post.coverImage],
    },
  };
}

export default async function BlogPost({ params }) { /* ... */ }
```

:::info[Phân tích]

**Metadata dedup với page fetch**:

Trong App Router, `fetch()` được **memoize trong 1 request**:

```tsx
async function generateMetadata({ params }) {
  const post = await fetchPost(slug); // gọi 1 lần
  return { title: post.title };
}

export default async function Page({ params }) {
  const post = await fetchPost(slug); // dedupe — không gọi lại API
  return <article>{post.content}</article>;
}
```

→ Không lo về performance khi fetch cùng data ở metadata + page. Next.js
+ React `cache()` handle.

:::

---

## Lazy Loading với dynamic()

Import component **lazy** — không vào initial bundle:

```tsx
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("./HeavyChart"), {
  loading: () => <Skeleton />,
});

export default function Dashboard() {
  return (
    <div>
      <Header />
      <HeavyChart /> {/* chỉ load JS khi render */}
    </div>
  );
}
```

Disable SSR (cho component dùng browser API):

```tsx
const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});
```

:::warning[Cần lưu ý]

**`dynamic` chỉ work trong Client Component** trong App Router. Server
Component dùng **Suspense + lazy** kiểu khác:

```tsx
// Server Component
import { Suspense, lazy } from "react";

const LazyHeavy = lazy(() => import("./Heavy"));

export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <LazyHeavy />
    </Suspense>
  );
}
```

`dynamic({ ssr: false })` — buộc client-only render, dùng cho widget
phụ thuộc browser (canvas, mapbox, charting).

:::

---

## Code Splitting

Next.js **tự code split**:

- **Per route** — mỗi page là 1 bundle.
- **Per component lazy** — `dynamic()`/`lazy()`.
- **Per Client Component boundary** — Server Components không vào bundle.

Xem bundle:

```bash
npm run build
```

```
Route (app)                Size      First Load JS
┌ ○ /                    5.2 kB        85 kB
├ ○ /about               2.1 kB        82 kB
├ ƒ /dashboard          15.3 kB        95 kB
└ ƒ /dashboard/chart    22.4 kB       102 kB (extra chart bundle)
```

**First Load JS** — bundle tải khi vào page lần đầu.

:::tip[Mẹo]

**Tối ưu bundle size**:

**1. Tree-shake**: import named, không import all:

```ts
// Tệ — import all
import _ from "lodash";

// Tốt — named
import { debounce } from "lodash-es";

// Tốt hơn — function riêng
import debounce from "lodash/debounce";
```

**2. Replace heavy library**:

- `moment` → `date-fns` hoặc `dayjs`.
- `lodash` → native ES + 1-2 function riêng.
- `axios` → `fetch` native.

**3. Tách Client/Server**:

```tsx
// Tệ — toàn page client
"use client";
function Page() {
  // Heavy chart luôn trong client bundle
}

// Tốt — server wrap
function Page() {
  return (
    <>
      <Header />
      <ClientChart />  {/* chỉ chart bundle vào client */}
    </>
  );
}
```

**4. Analyze**:

```bash
npm install -D @next/bundle-analyzer
ANALYZE=true npm run build
```

:::

---

## Package Bundling

Next.js có **`serverExternalPackages`** — không bundle package server:

```ts
// next.config.ts
export default {
  serverExternalPackages: ["sharp", "@prisma/client"],
};
```

→ Native module hoặc package lớn không bundle vào server output → faster
cold start.

**`transpilePackages`** — buộc transpile package từ node_modules:

```ts
export default {
  transpilePackages: ["some-untranspiled-pkg"],
};
```

Dùng khi package publish ESM mà bundler không xử lý được.

**`optimizePackageImports`** — auto tree-shake package không tự tree-shake:

```ts
export default {
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
};
```

```tsx
// Trước
import { Search, User, Settings } from "lucide-react"; // bundle hết
// Bundle: ~50KB

// Sau (với optimizePackageImports)
import { Search, User, Settings } from "lucide-react";
// Bundle: chỉ ~5KB cho 3 icon
```

Đặc biệt hữu ích cho **icon library** (Lucide, Heroicons), **utility lib**.

:::info[Phân tích]

**Bundle optimization workflow**:

1. **Build + analyze** baseline:

```bash
ANALYZE=true npm run build
```

2. **Identify largest chunk** — package nào chiếm size.

3. **Apply optimization**:
   - `optimizePackageImports` cho icon/util.
   - `serverExternalPackages` cho native module.
   - Replace heavy lib.
   - Dynamic import cho component lớn.

4. **Re-analyze** → đo improvement.

5. **Repeat** cho large chunk còn lại.

Target: **First Load JS < 200KB** cho page chính. Báo cáo Vercel có
hint khi vượt ngưỡng.

:::

:::warning[Cần lưu ý]

**Bundle quá nhỏ cũng không tốt** — over-fragmentation gây nhiều HTTP
request, slow on poor network.

Sweet spot:

- Initial bundle: 100-200KB gzipped.
- Per-route extra: `<50KB`.
- Lazy chunks: chỉ tách khi `>50KB`.

Đừng cố `dynamic()` mọi component — overhead networking đôi khi tệ hơn.

:::
