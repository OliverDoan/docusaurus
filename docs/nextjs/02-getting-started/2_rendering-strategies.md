---
sidebar_position: 2
title: "2. Rendering Strategies"
---

# Rendering Strategies

**Rendering strategy** (chiến lược kết xuất) là cách Next.js tạo ra HTML cho trang: ở phía máy chủ, lúc build, hay ngay trên trình duyệt. Mỗi cách như **SSR** (kết xuất phía máy chủ), **SSG** (tạo trang tĩnh lúc build) hay **ISR** (tạo lại trang tĩnh theo từng phần) có ưu nhược điểm riêng về tốc độ và độ mới của dữ liệu. Bài này giúp bạn hiểu và chọn đúng chiến lược cho từng trang.

---

## Mục lục

- [4 chiến lược rendering](#4-chiến-lược-rendering)
- [SSR (Server-Side Rendering)](#ssr-server-side-rendering)
- [SSG (Static Site Generation)](#ssg-static-site-generation)
- [ISR (Incremental Static Regeneration)](#isr-incremental-static-regeneration)
- [CSR (Client-Side Rendering)](#csr-client-side-rendering)
- [Server Components](#server-components)

---

## 4 chiến lược rendering

Next.js hỗ trợ tất cả các mode rendering:

| Mode | Khi nào render | Khi nào dùng |
|------|---------------|--------------|
| **SSR** | Mỗi request | Data đổi mỗi request (user-specific) |
| **SSG** | Build time | Content tĩnh (blog, docs) |
| **ISR** | Build + revalidate định kỳ | Content updatable (e-commerce) |
| **CSR** | Browser | Dashboard sau login, không SEO |

App Router thay đổi cách định nghĩa — không còn `getStaticProps`/
`getServerSideProps`. Thay vào đó dùng **fetch options + revalidate**.

---

## SSR (Server-Side Rendering)

Render HTML **mỗi request** trên server.

```tsx
// app/users/[id]/page.tsx
export default async function UserPage({ params }) {
  const { id } = await params;
  const user = await fetch(`https://api.example.com/users/${id}`, {
    cache: "no-store", // ép SSR
  }).then(r => r.json());

  return <div>{user.name}</div>;
}
```

`cache: "no-store"` → render mỗi request, không cache.

Hoặc dùng dynamic API trong component → tự thành SSR:

```tsx
import { cookies } from "next/headers";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  // dùng cookies → page là SSR
}
```

:::info[Phân tích]

**SSR phù hợp khi:**

- Page **user-specific** (dashboard, profile).
- Data **thay đổi mỗi request** (real-time, personalized).
- Cần đọc **cookie, header, IP**.
- SEO + fresh data đồng thời.

Trade-off:

- **Slower TTFB** — server phải render mỗi request.
- **Cần Node.js runtime** chạy (hoặc Edge).
- **Khó scale** với traffic cao (mỗi request CPU).

→ Cân nhắc **ISR** thay SSR khi data không cần real-time.

:::

---

## SSG (Static Site Generation)

Render HTML **tại build time** — serve như file tĩnh.

```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await fetchPosts();
  return posts.map(p => ({ slug: p.slug }));
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = await fetchPost(slug); // chạy build time
  return <article>{post.content}</article>;
}
```

`generateStaticParams` báo Next.js list `slug` cần pre-render. Khi build:

- Mọi `/blog/:slug` được render thành HTML.
- Deploy lên CDN — serve nhanh nhất.

Phù hợp:

- **Blog, docs, marketing** — content không đổi thường xuyên.
- **Product detail** — số lượng giới hạn.
- **Landing page**.

---

## ISR (Incremental Static Regeneration)

Kết hợp SSG + revalidate — pre-render tại build, **refresh background** sau X giây.

```tsx
export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await fetch(`/api/products/${id}`, {
    next: { revalidate: 60 }, // revalidate sau 60s
  }).then(r => r.json());

  return <ProductDetail product={product} />;
}
```

Flow:

1. Build: render `/products/123`, save HTML.
2. User 1 request lúc t=0 → serve HTML cũ ngay (fast).
3. Sau 60s, user 2 request → serve HTML cũ + trigger revalidate background.
4. Lần sau request → serve HTML mới.

**On-demand revalidation** — trigger từ API hoặc Server Action:

```ts
import { revalidatePath, revalidateTag } from "next/cache";

// Sau khi update DB
revalidatePath("/products/123");
revalidateTag("products");
```

:::tip[Mẹo]

**ISR là sweet spot** cho e-commerce, content site:

- **Speed như SSG** (CDN cached HTML).
- **Fresh như SSR** (revalidate khi cần).
- **Scale tốt** (không tạo load mỗi request).

E-commerce điển hình:

```tsx
// Product page
export default async function Product({ params }) {
  const product = await fetch(`/api/products/${(await params).id}`, {
    next: { revalidate: 3600, tags: [`product-${id}`] },
  }).then(r => r.json());
}

// Khi admin update product → revalidate tag tương ứng
revalidateTag(`product-${id}`);
```

Page mới sẽ ngay lập tức có data mới — user không phải đợi cache TTL.

:::

---

## CSR (Client-Side Rendering)

Render trong browser — Server Component trả về Client Component:

```tsx
"use client";

import { useState, useEffect } from "react";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(setData);
  }, []);

  if (!data) return <Spinner />;
  return <div>{data.title}</div>;
}
```

CSR phù hợp:

- **Sau login** — không cần SEO.
- **Real-time** — WebSocket, polling.
- **Interactive heavy** — editor, game, dashboard.

→ Nhưng vẫn nên dùng **Server Component cho shell** + Client Component
chỉ cho interactive part. Đừng "use client" toàn app.

---

## Server Components

Mặc định trong App Router. Server Component:

- Chạy **trên server**, không vào client bundle.
- Có thể `await` data, đọc DB, đọc file.
- Không có hook (useState, useEffect).
- Không có event handler (`onClick`).

```tsx
// app/page.tsx — Server Component (default)
async function HomePage() {
  const data = await fetchData(); // server-side
  return (
    <main>
      <h1>{data.title}</h1>
      <InteractiveButton /> {/* Client component */}
    </main>
  );
}
```

```tsx
// app/InteractiveButton.tsx
"use client";

import { useState } from "react";

export default function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

:::info[Phân tích]

**Render mode quyết định bởi feature page dùng:**

| Dùng | Mode |
|------|------|
| `fetch(url)` không option | **Static** (build time) |
| `fetch(url, { next: { revalidate: N } })` | **ISR** |
| `fetch(url, { cache: "no-store" })` | **Dynamic** (SSR) |
| `cookies()`, `headers()` | **Dynamic** (SSR) |
| `searchParams` prop | **Dynamic** (SSR) |
| Tất cả static | **Static** |

Next.js tự detect — không phải khai báo SSR/SSG/ISR thủ công. Build
output cho biết mỗi route mode nào:

```
○ /                    Static
ƒ /dashboard           Dynamic
● /products/[id]       ISR (3600s)
```

→ **Mental model mới**: nghĩ về **data**, không phải về "rendering mode".
Data static → page static. Data dynamic → page dynamic.

:::

:::warning[Cần lưu ý]

**`output: "export"`** — chế độ Static Export, mọi page phải static:

```ts
// next.config.ts
export default {
  output: "export",
};
```

Hạn chế:

- Không Server Actions.
- Không Image Optimization (cần `unoptimized: true`).
- Không Middleware.
- Không API routes (route handlers).
- Không dynamic API (`cookies`, `headers`).

→ Chỉ dùng khi cần deploy **CDN tĩnh** (S3, GitHub Pages, Cloudflare Pages).
Nếu cần feature đầy đủ, deploy lên Node server (Vercel, AWS Amplify, Railway).

:::
