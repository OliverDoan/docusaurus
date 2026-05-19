---
sidebar_position: 1
title: "1. Caching Layers"
---

# Caching Layers

---

## Mục lục

- [4 layer cache](#4-layer-cache)
- [Fetch Cache](#fetch-cache)
- [Request Memoization](#request-memoization)
- [Data Cache](#data-cache)
- [Full Route Cache](#full-route-cache)
- [Router Cache (Client)](#router-cache-client)

---

## 4 layer cache

Next.js App Router có **4 layer cache**:

```
[Browser]
    ↓
Router Cache (client-side, navigation)
    ↓
Full Route Cache (server, rendered HTML)
    ↓
Data Cache (server, fetch results — persist)
    ↓
Request Memoization (per request, React cache)
    ↓
[Database / API]
```

| Layer | Vị trí | Lifetime | Mục đích |
|-------|--------|----------|----------|
| Request Memoization | Server, per request | 1 render | Dedupe fetch trùng |
| Data Cache | Server, persistent | Until revalidate | Share data giữa request |
| Full Route Cache | Server, persistent | Until rebuild/revalidate | Pre-rendered HTML |
| Router Cache | Browser | Session/30s | Navigation tức thì |

---

## Fetch Cache

`fetch()` trong Server Component **mặc định cache**:

```tsx
async function Page() {
  // Cache mãi mãi (cho đến rebuild)
  const data = await fetch("/api/data").then(r => r.json());

  // Cache với revalidate
  const data2 = await fetch("/api/data", {
    next: { revalidate: 60 },
  }).then(r => r.json());

  // Không cache (dynamic)
  const data3 = await fetch("/api/data", {
    cache: "no-store",
  }).then(r => r.json());

  // Cache với tag (cho revalidateTag)
  const data4 = await fetch("/api/data", {
    next: { tags: ["users"] },
  }).then(r => r.json());
}
```

:::warning[Cần lưu ý]

**Next.js 15 thay đổi default cache behavior**:

- **Next.js 14 và trước**: `fetch()` cache mặc định (`force-cache`).
- **Next.js 15**: `fetch()` **không cache mặc định** (`no-store`).

Đây là **breaking change** quan trọng. Phải khai báo `cache: "force-cache"`
hoặc `next: { revalidate }` để cache:

```ts
// Next.js 15
await fetch(url);                                          // KHÔNG cache
await fetch(url, { cache: "force-cache" });                // cache
await fetch(url, { next: { revalidate: 60 } });            // ISR
```

Lý do thay đổi: developer thường confused tại sao data không refresh.
Default "no cache" trực giác hơn — phải opt-in cache.

:::

---

## Request Memoization

**Trong 1 render**, cùng `fetch(url)` chỉ chạy **1 lần** dù gọi nhiều
component:

```tsx
// Component A
async function Header() {
  const user = await fetch("/api/user").then(r => r.json());
  return <p>{user.name}</p>;
}

// Component B
async function Sidebar() {
  const user = await fetch("/api/user").then(r => r.json()); // dedupe
  return <img src={user.avatar} />;
}

// Cùng render
function Page() {
  return <><Header /><Sidebar /></>; // 1 HTTP call cho /api/user
}
```

Memoization theo URL + method + options. Tự động cho `fetch`. Cho function
không phải `fetch`, dùng `cache()` từ React:

```ts
import { cache } from "react";

export const getUser = cache(async (id: string) => {
  return await db.user.findUnique({ where: { id } });
});
```

```tsx
// Cùng id → chỉ query DB 1 lần
const a = await getUser("123"); // hit DB
const b = await getUser("123"); // cache, không hit DB
```

---

## Data Cache

**Persist giữa các request** — server-side cache cho fetch result.

```tsx
// Cache mãi (Static)
fetch(url, { cache: "force-cache" });

// ISR
fetch(url, { next: { revalidate: 60 } });

// Cache với tag
fetch(url, { next: { tags: ["products"] } });

// Skip cache
fetch(url, { cache: "no-store" });
```

**Revalidate**:

```ts
import { revalidatePath, revalidateTag } from "next/cache";

// Sau khi update DB
await db.product.update({ ... });

revalidatePath("/products");          // revalidate route
revalidateTag("products");            // revalidate mọi fetch có tag "products"
```

---

## Full Route Cache

Server cache **HTML đã render** của static route.

Build output cho biết:

```
○ /                Static
○ /about           Static
ƒ /dashboard       Dynamic
● /blog/[slug]     ISR
```

- **Static**: cache mãi (rebuild để update).
- **ISR**: cache + auto revalidate.
- **Dynamic**: không cache, render mỗi request.

```ts
// Force route static
export const dynamic = "force-static";

// Force dynamic
export const dynamic = "force-dynamic";

// Revalidate time cho cả route
export const revalidate = 3600;
```

---

## Router Cache (Client)

**Client-side cache** cho navigation — pre-fetch route khi user hover link.

```tsx
import Link from "next/link";

<Link href="/dashboard" prefetch>  {/* default true */}
  Dashboard
</Link>
```

Khi user hover link → Next.js prefetch route + data. Click → navigation
gần như **instant**.

`prefetch={false}` để tắt:

```tsx
<Link href="/heavy-page" prefetch={false}>...</Link>
```

:::info[Phân tích]

**Caching strategy theo content type**:

| Content | Cache | Lý do |
|---------|-------|-------|
| Marketing page | Static (force-cache) | Không đổi |
| Blog post | ISR (revalidate 3600s) | Update thỉnh thoảng |
| Product page | ISR + on-demand revalidate | Update khi admin sửa |
| User dashboard | Dynamic (no-store) | User-specific |
| Real-time data | no-store + client polling | Live |
| Static API (currency, weather) | Cache 1h | Slow change |

**Pattern phổ biến e-commerce**:

```tsx
// app/products/[slug]/page.tsx
export default async function Product({ params }) {
  const { slug } = await params;
  const product = await fetch(`/api/products/${slug}`, {
    next: { tags: [`product-${slug}`] },
  }).then(r => r.json());

  return <ProductDetail product={product} />;
}

// Khi admin update product → trigger revalidate
// app/api/admin/products/[id]/route.ts
import { revalidateTag } from "next/cache";

export async function PUT(request) {
  await updateProduct(...);
  revalidateTag(`product-${id}`);
  return Response.json({ ok: true });
}
```

Lợi ích:

- Page load **instant** (cached HTML).
- Update **lập tức** khi admin sửa (revalidateTag).
- Không tốn DB query cho mỗi user view.

:::

:::tip[Mẹo]

**Debug cache** — Next.js dev console hiện cache hit/miss:

```bash
npm run dev
```

```
GET /products/abc 200 in 50ms (cache: HIT)
GET /products/xyz 200 in 500ms (cache: MISS)
```

Tools:

- **Next.js DevTools** (experimental) — visualize cache.
- **`console.log` trong fetch** — kiểm tra gọi hay không.
- **`x-vercel-cache` header** trên Vercel — hit/miss/stale.

:::

:::warning[Cần lưu ý]

**Cache bug phổ biến**:

**1. Forgot `cache: "no-store"` cho user-specific**:

```ts
async function ProfilePage({ params }) {
  // Mọi user share cache → SAI
  const user = await fetch(`/api/users/${params.id}`).then(r => r.json());
}

// Fix
const user = await fetch(`/api/users/${params.id}`, {
  cache: "no-store",
}).then(r => r.json());
```

**2. Tag không revalidate**:

```ts
fetch(url, { next: { tags: ["users"] } });

// Khi revalidate
revalidateTag("users"); // chú ý chữ — case sensitive
```

**3. Path không match revalidate**:

```ts
revalidatePath("/products"); // không revalidate /products/[slug]

revalidatePath("/products", "page");      // page only
revalidatePath("/products", "layout");    // layout + children
revalidatePath("/products/[slug]", "page"); // dynamic route
```

Test cache thoroughly — đây là source bug khó debug.

:::
