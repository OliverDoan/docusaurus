---
sidebar_position: 2
title: "2. App Router & Routing"
---

# App Router & Routing

> *App Router là cú thay đổi lớn nhất của Next.js trong 5 năm. Phỏng vấn không hỏi chi tiết App Router là bất thường ở các công ty hiện tại.*

---

## Câu 1: App Router vs Pages Router — khác biệt cốt lõi `[Intermediate]`

### Câu hỏi

> Em đã chuyển từ Pages Router sang App Router chưa? Khác biệt lớn nhất là gì?

### Giải thích lý thuyết

| Khía cạnh             | Pages Router                | App Router                          |
| --------------------- | --------------------------- | ----------------------------------- |
| Folder                | `pages/`                    | `app/`                              |
| Component mặc định    | Client                       | **Server** (RSC)                    |
| Data fetching         | `getServerSideProps`, `getStaticProps` | `async` component + `fetch`  |
| Layout                | Custom `_app.js`            | Nested `layout.tsx` (compose tự nhiên) |
| Loading state         | Manual                       | `loading.tsx` convention            |
| Error                  | Custom `_error.js`          | `error.tsx` convention              |
| API routes            | `pages/api/...`              | `app/api/.../route.ts`              |
| Streaming             | Limited                      | Native với Suspense                 |
| Caching              | Manual                       | Multi-layer (fetch, route, full)    |

App Router thừa kế khái niệm RSC, streaming, layout nesting → kiến trúc mạnh hơn nhưng learning curve cao hơn.

### Code minh hoạ

```jsx
// Pages Router (cũ)
// pages/blog/[slug].tsx
import { GetServerSideProps } from "next";

export default function BlogPost({ post }) {
  return <article>{post.content}</article>;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const post = await fetch(`https://api.../posts/${params.slug}`).then((r) => r.json());
  return { props: { post } };
};

// App Router (mới)
// app/blog/[slug]/page.tsx
export default async function BlogPost({ params }) {
  const post = await fetch(`https://api.../posts/${params.slug}`).then((r) => r.json());
  return <article>{post.content}</article>;
}
// Không cần getServerSideProps — async component đã đủ

// Layout nesting
// app/layout.tsx — root
export default function RootLayout({ children }) {
  return (
    <html><body>
      <Header />
      {children}
      <Footer />
    </body></html>
  );
}

// app/blog/layout.tsx — blog section
export default function BlogLayout({ children }) {
  return (
    <div className="blog-layout">
      <Sidebar />
      {children}
    </div>
  );
}

// app/blog/[slug]/page.tsx — page
// → wrap trong BlogLayout, trong RootLayout, tự động

// Loading state — convention
// app/blog/[slug]/loading.tsx
export default function Loading() {
  return <BlogSkeleton />;
}
// Tự dùng làm fallback trong Suspense
```

### Đáp án mẫu

> "Khác biệt lớn nhất là **component mặc định là Server Component** trong App Router. Trong Pages Router, mọi component là client, data fetch qua `getServerSideProps`/`getStaticProps` riêng. App Router thì component có thể là server, fetch data ngay trong component, không cần API trung gian. Khác biệt khác: **layout nesting** với file convention — `layout.tsx` trong mỗi level, tự compose; không phải manual `_app.js`. **`loading.tsx`** và **`error.tsx`** convention — Next tự wrap Suspense và ErrorBoundary. **Streaming** native qua Suspense. **Multi-layer caching** rất mạnh nhưng phức tạp hơn. Learning curve cao hơn — team em mất 2-3 tuần để onboard. Lợi: bundle nhỏ hơn, code rõ hơn (data ở chỗ render), perceived performance tốt hơn nhờ streaming."

---

## Câu 2: Server Component vs Client Component — boundary `[Intermediate]`

### Câu hỏi

> Khi nào em đặt `'use client'`? Có thể import Server Component vào Client Component không?

### Giải thích lý thuyết

**Server Component**:
- Render trên server, không ship JS xuống client.
- Có thể dùng: `async`, `await`, DB query, file system, server-only API key.
- KHÔNG có: `useState`, `useEffect`, event handler, browser API.

**Client Component** (`'use client'` directive):
- Render server lần đầu (SSR), hydrate trên client, sau đó CSR.
- Có thể dùng: hooks, event handler, browser API.

Rules:
- Server có thể import Client.
- Client KHÔNG thể import Server (chỉ pass qua `children` prop).
- `'use client'` đặt ở **boundary** — tất cả import từ đó coi như client.

### Code minh hoạ

```jsx
// Server Component (default)
// app/page.tsx
import { db } from "@/lib/db";

export default async function Page() {
  const users = await db.user.findMany(); // DB query trên server
  return (
    <ul>
      {users.map((u) => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
}

// Client Component
// app/components/Counter.tsx
"use client";
import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0); // hook OK trong client
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// Server import Client — OK
// app/page.tsx
import Counter from "./components/Counter"; // import client component
export default async function Page() {
  return (
    <>
      <h1>Server-rendered</h1>
      <Counter />  {/* Client component inside server */}
    </>
  );
}

// Client KHÔNG thể import Server thẳng
// ❌
// "use client";
// import ServerComp from "./ServerComp"; // server với async
// function ClientPage() {
//   return <ServerComp />; // ❌ Error
// }

// ✅ Pattern: pass Server Component qua children
"use client";
function ClientWrapper({ children }) {
  return <div className="wrapper">{children}</div>;
}

// Trong Server Component
export default async function Page() {
  const data = await fetchData();
  return (
    <ClientWrapper>
      <ServerComp data={data} />  {/* OK — server rendered, pass JSX */}
    </ClientWrapper>
  );
}

// Pass data từ server xuống client component
// Server can pass plain data (string, number, object — KHÔNG function)
async function ServerPage() {
  const user = await getUser();
  return <ClientForm user={user} />; // user phải serializable
}

"use client";
function ClientForm({ user }) {
  const [name, setName] = useState(user.name);
  return <input value={name} onChange={(e) => setName(e.target.value)} />;
}
```

### Đáp án mẫu

> "Em đặt `'use client'` khi component cần: hooks (`useState`, `useEffect`), event handler, browser API (`window`, `localStorage`), hoặc third-party lib client-only (Chart.js, framer-motion). Mặc định em giữ Server Component vì bundle nhỏ + fetch data trực tiếp. Quy tắc lớn: **Server có thể import Client**, nhưng **Client không thể import Server thẳng** — phải pass qua `children` prop. Pattern em hay dùng: 'inversion' — wrap component server bằng client (ví dụ ThemeProvider) bằng cách pass server JSX qua children. `'use client'` đặt ở **boundary**: tất cả file import từ đó tự thành client. Vì vậy em đặt `'use client'` ở leaf component nhỏ (Counter, Form), không ở component to (Layout) — để giữ phần lớn tree là server."

---

## Câu 3: Routing patterns — dynamic, catch-all, route groups `[Intermediate]`

### Câu hỏi

> Em làm sao để có route `/blog/[category]/[slug]` và `/docs/[...path]` trong App Router? Route groups dùng để làm gì?

### Giải thích lý thuyết

| Pattern              | File path                          | URL match                          |
| -------------------- | ---------------------------------- | ---------------------------------- |
| Static               | `app/about/page.tsx`               | `/about`                           |
| Dynamic              | `app/blog/[slug]/page.tsx`         | `/blog/x`                          |
| Nested dynamic       | `app/blog/[category]/[slug]/page.tsx` | `/blog/tech/typescript`         |
| Catch-all            | `app/docs/[...path]/page.tsx`      | `/docs/a`, `/docs/a/b`, ...        |
| Optional catch-all   | `app/docs/[[...path]]/page.tsx`    | `/docs`, `/docs/a`, `/docs/a/b`    |
| Route group          | `app/(marketing)/about/page.tsx`   | `/about` (group không vào URL)     |
| Parallel route       | `app/@modal/...`                   | Render parallel slot               |
| Intercepting route   | `app/photos/(.)photo/[id]/page.tsx` | Intercept để show modal           |

### Code minh hoạ

```jsx
// Dynamic route
// app/blog/[slug]/page.tsx
export default async function Post({ params }) {
  // params.slug
}

// Generate static params at build time
export async function generateStaticParams() {
  const posts = await fetchAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

// Nested dynamic
// app/blog/[category]/[slug]/page.tsx
export default function Post({ params }) {
  // params.category, params.slug
}

// Catch-all
// app/docs/[...path]/page.tsx
export default function Docs({ params }) {
  // /docs/a/b/c → params.path = ["a", "b", "c"]
}

// Route group — organize không ảnh hưởng URL
// app/
//   (marketing)/
//     about/page.tsx          → /about
//     pricing/page.tsx        → /pricing
//     layout.tsx              → layout cho marketing
//   (app)/
//     dashboard/page.tsx      → /dashboard
//     layout.tsx              → layout cho app authenticated

// Parallel routes — render nhiều page đồng thời ở 1 layout
// app/
//   @analytics/page.tsx
//   @notifications/page.tsx
//   layout.tsx
export default function Layout({ children, analytics, notifications }) {
  return (
    <>
      {children}
      {analytics}
      {notifications}
    </>
  );
}

// Intercepting routes — modal pattern
// app/
//   photos/
//     [id]/page.tsx                    → full page /photos/123
//   feed/
//     (.)photos/[id]/page.tsx          → modal khi navigate từ feed
// User ở /feed → click photo → URL đổi /photos/123 nhưng render modal trên feed
// User refresh → render full page
```

### Đáp án mẫu

> "Cú pháp file convention: `[slug]` cho dynamic single segment, `[...path]` cho catch-all (match nhiều segment), `[[...path]]` cho optional catch-all (match cả root). Em luôn pair với `generateStaticParams` để prerender static lúc build cho dynamic route — performance tốt hơn nhiều SSG. **Route groups** `(name)` là tính năng em yêu thích: cho phép organize folder cho clear (group marketing pages, group authenticated pages) nhưng không ảnh hưởng URL. Pair với layout: mỗi group có layout riêng (marketing có header marketing, app có sidebar dashboard). **Parallel routes** `@slot` để render nhiều page đồng thời — dùng cho dashboard có nhiều section độc lập. **Intercepting routes** `(.)` cho modal pattern — user click photo trong feed, URL đổi nhưng UI hiện modal trên feed; refresh URL trực tiếp thì full page. Đây là pattern Instagram/Twitter dùng — implement trước rất phức tạp, giờ là file convention."

---

## Câu 4: Data Fetching trong App Router — patterns `[Senior]`

### Câu hỏi

> Trong App Router, em fetch data ở đâu? Server Component, Client Component, hay Route Handler? Mỗi cách phù hợp khi nào?

### Giải thích lý thuyết

3 chỗ chính:

1. **Server Component** — fetch trong component, dùng cho data hiển thị ban đầu. Tận dụng fetch dedupe, caching.
2. **Client Component** + library (TanStack Query, SWR) — cho real-time, polling, mutation, complex client state.
3. **Route Handler** (`app/api/.../route.ts`) — khi cần API endpoint cho client/external use.

Patterns nâng cao:
- **Sequential fetch** — bị waterfall, tránh.
- **Parallel fetch** — `Promise.all` trong async component.
- **Streaming với Suspense** — async component + Suspense boundary.

### Code minh hoạ

```jsx
// 1. Server Component — fetch khi page mount
// app/users/page.tsx
export default async function UsersPage() {
  const users = await fetch("https://api.../users", {
    next: { revalidate: 60 },
  }).then((r) => r.json());

  return <UserList users={users} />;
}

// 2. Parallel fetch — tránh waterfall
async function Page() {
  // ❌ Sequential — chậm
  // const user = await fetchUser();
  // const posts = await fetchPosts(user.id);

  // ✅ Parallel khi data độc lập
  const [user, settings] = await Promise.all([
    fetchUser(),
    fetchSettings(),
  ]);

  return <Profile user={user} settings={settings} />;
}

// 3. Component-level fetch + Suspense streaming
async function Revenue() {
  const data = await fetchRevenue(); // 2s
  return <RevenueChart data={data} />;
}

async function Users() {
  const data = await fetchUsers(); // 1s
  return <UserList data={data} />;
}

export default function Dashboard() {
  return (
    <>
      <Suspense fallback={<RevenueSkeleton />}>
        <Revenue />
      </Suspense>
      <Suspense fallback={<UsersSkeleton />}>
        <Users />
      </Suspense>
    </>
  );
}
// Two fetch chạy song song, stream vào UI khi sẵn sàng

// 4. Client fetching với TanStack Query
"use client";
import { useQuery } from "@tanstack/react-query";

function LiveDashboard() {
  const { data } = useQuery({
    queryKey: ["stats"],
    queryFn: () => fetch("/api/stats").then((r) => r.json()),
    refetchInterval: 5000, // poll
  });
  return <StatsView data={data} />;
}

// 5. Route Handler — cho external client hoặc client-side fetch
// app/api/users/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const users = await db.user.findMany();
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const data = await req.json();
  const user = await db.user.create({ data });
  return NextResponse.json(user, { status: 201 });
}

// 6. Hydrate Server data sang Client (TanStack Query)
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default async function Page() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientUserList />  {/* useQuery sẽ dùng cache đã prefetch */}
    </HydrationBoundary>
  );
}
```

### Đáp án mẫu

> "3 chỗ em fetch data tuỳ use case. **Server Component** cho data hiển thị ban đầu — page load fetch ngay, tận dụng dedupe và built-in caching. Quan trọng: dùng `Promise.all` cho data độc lập (tránh waterfall) và chia component nhỏ wrap Suspense để stream. **Client Component + TanStack Query** cho data cần refetch, polling, mutation, optimistic update — server không make sense. **Route Handler** khi cần API endpoint cho external client (mobile app) hoặc cho client component fetch. Pattern hybrid em hay dùng: server prefetch data → dehydrate vào HydrationBoundary → client `useQuery` đọc từ cache đã prefetch, không refetch lần đầu. Best of both: SEO/instant load của server + refetch/mutation pattern của TanStack Query."

---

## Câu 5: Caching trong App Router — 4 levels `[Senior]`

### Câu hỏi

> Em đã nghe Next.js có 4 cache levels chưa? Liệt kê và cho ví dụ confusing nhất.

### Giải thích lý thuyết

4 cache layers (Next 13+):

1. **Request Memoization** — trong 1 render, fetch cùng URL chỉ chạy 1 lần.
2. **Data Cache** — cache response `fetch` qua các request (persistent, server-side).
3. **Full Route Cache** — cache HTML + RSC payload của static route lúc build.
4. **Router Cache** — client-side cache navigation (prefetch + back/forward).

Mặc định Next cache aggressive — đôi khi gây confusion ("Em update DB nhưng UI vẫn cũ").

### Code minh hoạ

```jsx
// 1. Request Memoization — automatic
async function getUser(id) {
  return fetch(`/api/users/${id}`).then((r) => r.json());
}

async function Page() {
  const u1 = await getUser(1);
  const u2 = await getUser(1); // chỉ 1 network request — memoized
  return ...;
}

// 2. Data Cache — fetch options
// Cache vĩnh viễn (default trước Next 15)
await fetch(url);

// Cache với revalidate (ISR)
await fetch(url, { next: { revalidate: 60 } });

// No cache (SSR mỗi request)
await fetch(url, { cache: "no-store" });

// Tag-based cache
await fetch(url, { next: { tags: ["users"] } });

// Invalidate
import { revalidateTag, revalidatePath } from "next/cache";
revalidateTag("users");
revalidatePath("/users");

// 3. Full Route Cache
// Static route — cache HTML + RSC, serve từ CDN
// Dynamic route (cookies, headers, no-store fetch) — không cache

// Force dynamic
export const dynamic = "force-dynamic"; // luôn render dynamic
export const dynamic = "force-static";  // force static (fail nếu có dynamic data)

// 4. Router Cache — client-side prefetch
import Link from "next/link";
<Link href="/dashboard" prefetch>...</Link>
// Next prefetch HTML + RSC payload khi link visible
// Click → instant navigate

// Pitfall: client-side router cache giữ data cũ sau navigation
// User edit user → quay lại /users list → vẫn thấy user cũ vì router cache
// Fix: router.refresh() sau mutation
"use client";
const router = useRouter();
async function update() {
  await fetch("/api/users", { method: "PATCH", body: ... });
  router.refresh(); // invalidate router cache + rerender
}

// Hoặc dùng Server Action + revalidatePath
"use server";
async function updateUser(formData) {
  await db.user.update(...);
  revalidatePath("/users"); // invalidate Data + Full Route cache
}

// Confusing case nhất:
// Code: fetch("/api/products")
// Update product trong DB → page /products vẫn hiển thị cũ
// Lý do: Data Cache giữ response. Phải revalidateTag/Path hoặc dùng no-store.

// Next 15 thay đổi default: fetch không cache by default — phải opt-in
// Less confusion, but cần update mental model
```

### Đáp án mẫu

> "4 levels: **Request Memoization** (dedupe trong 1 render), **Data Cache** (cache fetch response persistent), **Full Route Cache** (cache HTML/RSC của static route), **Router Cache** (client-side prefetch + back/forward). Confusing nhất em từng debug: code `fetch(/api/products)` trong Server Component, sau khi update DB qua mutation, page vẫn hiển thị product cũ — vì Data Cache giữ response. Fix: hoặc opt-out `cache: 'no-store'` hoặc dùng `revalidateTag('products')` sau mutation. Đặc biệt confusing với client navigation: user submit form → server update OK → router push về list page → list vẫn hiển thị data cũ vì Router Cache. Phải `router.refresh()` sau mutation, hoặc dùng Server Action với `revalidatePath` (tự invalidate). Next 15 đổi default — fetch không cache by default — less footgun. Quy tắc của em: hiểu rõ data nào nên cache (immutable, slowly changing) và data nào không (user-specific, real-time), opt-in explicit thay vì rely default."

---

## Câu 6: Middleware — use cases và limitations `[Senior]`

### Câu hỏi

> Em dùng middleware Next.js cho việc gì? Có gì middleware **không** làm được?

### Giải thích lý thuyết

Middleware chạy **trước khi** route được match. Runtime: **Edge** (giới hạn).

Use case phù hợp:
- Authentication redirect (chưa login → /signin).
- A/B testing rewrite.
- Geo-based localization (VN → /vi).
- Rate limiting.
- Custom header (CSP, security).
- Bot detection.

Limitations:
- Edge runtime — không có Node API.
- Không thể đọc body (chỉ header, cookie, URL).
- Không thể render UI.
- Limit execution time (Vercel: 25s).
- Không thể call DB ORM nặng (Prisma cần Accelerate).

### Code minh hoạ

```typescript
// middleware.ts (root level)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Auth check
  if (pathname.startsWith("/dashboard")) {
    const token = req.cookies.get("session")?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/signin";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // 2. Geo redirect
  const country = req.geo?.country || "VN";
  if (country === "VN" && !pathname.startsWith("/vi")) {
    return NextResponse.rewrite(new URL(`/vi${pathname}`, req.url));
  }

  // 3. A/B test với cookie
  let variant = req.cookies.get("ab-variant")?.value;
  if (!variant) {
    variant = Math.random() < 0.5 ? "A" : "B";
    const res = NextResponse.next();
    res.cookies.set("ab-variant", variant);
    return res;
  }

  // 4. Custom header
  const res = NextResponse.next();
  res.headers.set("X-Custom", "value");
  res.headers.set("Content-Security-Policy", "default-src 'self'");
  return res;
}

// Matcher — chỉ chạy cho route cụ thể
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/protected/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

// Rate limiting với Vercel KV
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

export async function middleware(req: NextRequest) {
  const ip = req.ip ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return new NextResponse("Too many requests", { status: 429 });
  }
  return NextResponse.next();
}

// ❌ Không thể trong middleware
// import fs from "fs"; — không có Node API
// const body = await req.json(); — không đọc body
// await prisma.user.findMany(); — Prisma cần Accelerate
// return <SignInPage />; — không render UI
```

### Đáp án mẫu

> "Middleware Edge runtime, chạy trước route match. Use case em hay dùng: **auth redirect** (check session cookie, redirect signin nếu chưa login), **geo localization** (VN → /vi, US → /en), **A/B test** (assign variant qua cookie + rewrite), **rate limiting** (Upstash + sliding window), **security header** (CSP, HSTS). Quan trọng dùng `matcher` để middleware chỉ chạy cho route cần — không chạy mọi request gây overhead. Limitations: edge runtime nên không có `fs`, `Buffer`, một số lib Node-only. Không đọc được body — chỉ header, cookie, URL — nên auth phức tạp (verify JWT thì OK với Web Crypto, nhưng session lookup DB cần edge-compatible client). Không render UI được — chỉ redirect/rewrite/headers. Khi cần render auth page với data, phải dùng layout server-side, không phải middleware."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                | Đúng là                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| "Component App Router đều là server"                   | Mặc định server, nhưng `'use client'` directive chuyển client       |
| "Data fetch chỉ làm trong Route Handler"               | Server Component fetch trực tiếp được — encourage                    |
| "Caching tự động luôn đúng"                            | Cache mặc định aggressive — nhiều bug 'data cũ' do quên invalidate   |
| "Middleware có thể replace API auth check"             | Middleware OK cho redirect; verify thực sự vẫn cần ở server          |
| "Route group hiện trong URL"                           | `(group)` chỉ organize folder, không ảnh hưởng URL                   |
