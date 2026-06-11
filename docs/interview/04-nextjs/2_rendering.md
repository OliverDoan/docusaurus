---
sidebar_position: 2
title: "2. Rendering Modes & Streaming"
---

# Rendering Modes & Streaming

> *SSR, SSG, static vs dynamic, Streaming, PPR — đây là "xương sống" của mọi buổi phỏng vấn Next.js. Trả lời tốt phần này chứng tỏ bạn hiểu Next.js render trang web như thế nào từ server đến browser, chứ không chỉ biết gõ `npx create-next-app`.*

---

## Câu 5: SSR (Server-Side Rendering) trong Next.js là gì? `[Basic]`

### Câu hỏi

> SSR trong Next.js là gì? Nó hoạt động thế nào, mang lại lợi ích gì, và trong App Router thì điều gì khiến một route trở thành dynamic (SSR)?

### Giải thích lý thuyết

**SSR (Server-Side Rendering)** là kỹ thuật render component thành HTML hoàn chỉnh **trên server, mỗi khi có request**. Browser nhận HTML đã có sẵn nội dung, hiển thị ngay cho user, sau đó React **hydrate** để gắn interactivity.

Quy trình một request SSR:

1. User request `/dashboard` → server nhận request.
2. Server chạy component, fetch data (DB, API), render ra HTML string/stream.
3. HTML gửi về browser → user thấy nội dung ngay (**FCP nhanh**).
4. JS bundle tải về → React hydrate → page tương tác được.

**Lợi ích chính:**

| Lợi ích | Giải thích |
| ------- | ---------- |
| **SEO** | Crawler nhận HTML đầy đủ nội dung, không phải `<div id="root">` rỗng |
| **FCP nhanh** | User thấy content trước cả khi JS tải xong |
| **Data luôn fresh** | Render mỗi request → phản ánh data mới nhất, hỗ trợ personalization |
| **OG tags** | Social share preview hoạt động vì meta có sẵn trong HTML |

**Trong App Router, SSR = dynamic rendering.** Next.js mặc định cố gắng render static (lúc build), và chỉ chuyển route sang **dynamic** khi phát hiện route phụ thuộc thông tin của từng request. Các yếu tố khiến route thành dynamic:

- Gọi **`cookies()`** hoặc **`headers()`** (từ `next/headers`) — vì cookie/header khác nhau theo từng request.
- Fetch với **`cache: "no-store"`** — yêu cầu data fresh mỗi request.
- Đọc **`searchParams`** trong page — query string chỉ biết được lúc request.
- Khai báo **`export const dynamic = "force-dynamic"`** — ép dynamic tường minh.
- Dùng `connection()` hoặc các Dynamic API khác.

**Lưu ý Next.js 15:** `fetch` mặc định **không cache** nữa (khác Next 14), và `cookies()`/`headers()`/`params`/`searchParams` đã trở thành **async** — phải `await`.

**Pitfall hay gặp:** vô tình gọi `cookies()` trong một layout dùng chung → toàn bộ subtree thành dynamic, mất static optimization mà không nhận ra. Nên chạy `next build` và đọc output (ký hiệu `ƒ` = dynamic, `○` = static) để kiểm tra.

### Code minh hoạ

```tsx
// app/dashboard/page.tsx — Next.js 15 App Router
import { cookies } from "next/headers";

// Route này TỰ ĐỘNG thành dynamic (SSR) vì dùng cookies()
export default async function DashboardPage() {
  // Next 15: cookies() là async — phải await
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  // Next 15: fetch mặc định KHÔNG cache → đã là fresh mỗi request
  // Ghi rõ no-store để tường minh ý định SSR
  const stats = await fetch("https://api.example.com/stats", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  }).then((r) => r.json());

  return <StatsView data={stats} />;
}

// app/search/page.tsx — searchParams cũng khiến route thành dynamic
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>; // Next 15: searchParams là Promise
}) {
  const { q } = await searchParams;
  const results = await fetch(`https://api.example.com/search?q=${q}`).then(
    (r) => r.json()
  );
  return <SearchResults items={results} />;
}

// Ép dynamic tường minh khi cần
// app/feed/page.tsx
export const dynamic = "force-dynamic"; // luôn SSR, không bao giờ static
```

### Đáp án mẫu

> "SSR là render component thành HTML hoàn chỉnh ở server **mỗi request**. User nhận HTML có sẵn nội dung nên FCP nhanh và SEO tốt — crawler đọc được toàn bộ content, OG tags cho social share cũng hoạt động. Sau đó React hydrate để page tương tác được. Trong App Router, SSR tương ứng với **dynamic rendering** — Next.js mặc định cố render static, chỉ chuyển sang dynamic khi route phụ thuộc vào request cụ thể: gọi `cookies()` hay `headers()`, fetch với `cache: 'no-store'`, đọc `searchParams`, hoặc khai báo `dynamic = 'force-dynamic'`. Một điểm em hay lưu ý: từ Next 15, fetch mặc định không cache nữa và `cookies()`/`searchParams` đã thành async. Trade-off của SSR là server tải nặng hơn và TTFB chậm hơn static, nên em chỉ dùng khi thực sự cần data fresh hoặc personalized — còn lại để Next render static."

---

## Câu 6: SSG (Static Site Generation) trong Next.js là gì? `[Basic]`

### Câu hỏi

> SSG là gì? Tại sao App Router mặc định là static? `generateStaticParams` dùng để làm gì, và khi nào em chọn SSG?

### Giải thích lý thuyết

**SSG (Static Site Generation)** là render trang thành HTML **một lần duy nhất lúc build** (`next build`). Kết quả là các file HTML + RSC payload tĩnh, có thể đặt lên **CDN** và serve cho mọi user mà không cần chạy lại code server.

| Tiêu chí | SSG | SSR |
| -------- | --- | --- |
| Render lúc nào | Build time (1 lần) | Mỗi request |
| TTFB | Cực nhanh (file tĩnh từ CDN) | Chậm hơn (server render) |
| Data freshness | "Đóng băng" tại thời điểm build | Luôn mới nhất |
| Tải server | Gần như zero | Tỉ lệ thuận với traffic |
| Scale | Vô hạn (CDN lo) | Phải scale server |

**App Router mặc định là static**: nếu page không đụng vào Dynamic API nào (`cookies()`, `headers()`, `no-store`, `searchParams`...), Next.js sẽ prerender nó lúc build — đây là lựa chọn an toàn nhất về performance, "static by default, dynamic by opt-in".

**`generateStaticParams`** giải quyết bài toán dynamic route (`[slug]`): lúc build, Next.js không thể tự biết có những slug nào — function này trả về danh sách params để Next prerender từng trang. Route nào không nằm trong danh sách sẽ render on-demand lần đầu rồi cache lại (điều khiển bằng `dynamicParams`).

**Khi nào dùng SSG:**

- Blog, documentation, landing page, trang marketing.
- Nội dung giống nhau cho mọi user, ít thay đổi.
- Cần TTFB tối thiểu + scale lớn với chi phí thấp.

**Pitfall:** quên rằng data bị "đóng băng" lúc build — sửa nội dung trong CMS nhưng trang không đổi vì chưa rebuild. Giải pháp là ISR (`revalidate`) hoặc on-demand revalidation, là cây cầu giữa SSG và SSR.

### Code minh hoạ

```tsx
// app/about/page.tsx — static mặc định, không cần config gì
export default function AboutPage() {
  // Không dùng Dynamic API nào → Next prerender lúc build
  return <h1>Về chúng tôi</h1>;
}

// app/blog/[slug]/page.tsx — SSG cho dynamic route
type Params = { slug: string };

// Chạy LÚC BUILD: trả về danh sách slug cần prerender
export async function generateStaticParams(): Promise<Params[]> {
  const posts = await fetch("https://api.example.com/posts").then((r) =>
    r.json()
  );
  return posts.map((post: { slug: string }) => ({ slug: post.slug }));
}

// Slug ngoài danh sách: true = render on-demand rồi cache (mặc định),
// false = trả 404
export const dynamicParams = true;

export default async function PostPage({
  params,
}: {
  params: Promise<Params>; // Next 15: params là Promise
}) {
  const { slug } = await params;

  // Next 15: fetch mặc định không cache — với SSG nên khai báo cache tường minh
  const post = await fetch(`https://api.example.com/posts/${slug}`, {
    cache: "force-cache",
  }).then((r) => r.json());

  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  );
}

// Output của next build:
// ○ /about                  → Static (prerender lúc build)
// ● /blog/[slug]            → SSG (prerender các slug từ generateStaticParams)
// HTML + RSC payload đặt ở CDN → mọi request đều hit cache, không chạm server
```

### Đáp án mẫu

> "SSG là render trang thành HTML tĩnh **một lần lúc build**, sau đó serve từ CDN — TTFB cực nhanh, server gần như không tải gì, scale thoải mái. App Router theo triết lý 'static by default': page nào không đụng Dynamic API như `cookies()` hay `no-store` thì tự động được prerender lúc build. Với dynamic route như `/blog/[slug]`, em dùng `generateStaticParams` để trả về danh sách slug cho Next prerender từng trang; slug nào ngoài danh sách thì render on-demand lần đầu rồi cache. Em chọn SSG cho blog, docs, landing page — nội dung giống nhau cho mọi user và ít đổi. Trade-off là data bị đóng băng tại thời điểm build, nên khi content có cập nhật định kỳ em chuyển sang ISR với `revalidate` hoặc gọi `revalidatePath` qua webhook từ CMS, thay vì rebuild cả site."

---

## Câu 7: getStaticProps và getServerSideProps khác nhau như thế nào? `[Intermediate]`

### Câu hỏi

> Trong Pages Router, `getStaticProps` và `getServerSideProps` khác nhau thế nào? Tương đương của chúng trong App Router là gì?

### Giải thích lý thuyết

Đây là hai data-fetching function của **Pages Router** — đều chạy **chỉ trên server**, không bao giờ bundle vào client:

| Tiêu chí | `getStaticProps` | `getServerSideProps` |
| -------- | ---------------- | -------------------- |
| Chạy lúc nào | **Build time** (và lúc revalidate nếu ISR) | **Mỗi request** |
| Rendering mode | SSG / ISR | SSR |
| Truy cập request | Không có `req`/`res` | Có `context.req`, `context.res`, cookies, headers |
| TTFB | Nhanh (HTML tĩnh) | Chậm hơn (render mỗi request) |
| ISR | `revalidate: N` trong return | Không hỗ trợ |
| Đi kèm | `getStaticPaths` (cho dynamic route) | Không cần |

Cả hai đều return `{ props }` — Next inject props này vào page component. `getStaticProps` còn hỗ trợ:

- **`revalidate: 60`** → biến SSG thành **ISR**: page tĩnh nhưng được regenerate nền sau mỗi 60s khi có request.
- **`getStaticPaths`** với **`fallback`**: `false` (ngoài danh sách → 404), `true` (trả trang fallback loading rồi generate), `'blocking'` (chờ generate xong mới trả, như SSR lần đầu).

**Tương đương trong App Router:** không còn 2 function riêng — thay bằng **fetch caching + route segment config**, khai báo ngay tại nơi fetch:

| Pages Router | App Router (Next 15) |
| ------------ | -------------------- |
| `getStaticProps` | `fetch(url, { cache: "force-cache" })` trong Server Component |
| `getStaticProps` + `revalidate` | `fetch(url, { next: { revalidate: 60 } })` hoặc `export const revalidate = 60` |
| `getStaticPaths` | `generateStaticParams` |
| `fallback: 'blocking'` | `dynamicParams = true` (mặc định) |
| `getServerSideProps` | `fetch(url, { cache: "no-store" })` hoặc dùng `cookies()`/`headers()` |

Điểm hay của mô hình mới: caching khai báo **per-fetch** thay vì per-page — cùng một trang có thể trộn data static và data dynamic, điều Pages Router không làm được.

### Code minh hoạ

```tsx
// ============ PAGES ROUTER ============

// pages/posts/[slug].tsx — getStaticProps + ISR
import type { GetStaticProps, GetStaticPaths } from "next";

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await fetchAllPosts();
  return {
    paths: posts.map((p) => ({ params: { slug: p.slug } })),
    fallback: "blocking", // slug lạ → render server lần đầu rồi cache
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // Chạy LÚC BUILD (và mỗi lần revalidate)
  const post = await fetchPost(params!.slug as string);
  if (!post) return { notFound: true };

  return {
    props: { post },
    revalidate: 60, // ISR: regenerate nền sau 60s
  };
};

// pages/dashboard.tsx — getServerSideProps
import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  // Chạy MỖI REQUEST — có quyền đọc cookie/header
  const token = req.cookies.session;
  const stats = await fetchStats(token);
  return { props: { stats } };
};

// ============ APP ROUTER TƯƠNG ĐƯƠNG (Next 15) ============

// app/posts/[slug]/page.tsx — thay getStaticProps + getStaticPaths
export async function generateStaticParams() {
  const posts = await fetchAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function Post({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // ISR per-fetch: tương đương revalidate: 60 của getStaticProps
  const post = await fetch(`https://api.example.com/posts/${slug}`, {
    next: { revalidate: 60 },
  }).then((r) => r.json());
  return <Article post={post} />;
}

// app/dashboard/page.tsx — thay getServerSideProps
import { cookies } from "next/headers";

export default async function Dashboard() {
  const token = (await cookies()).get("session")?.value; // → route dynamic
  const stats = await fetch("https://api.example.com/stats", {
    cache: "no-store", // SSR: fresh mỗi request
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json());
  return <StatsView data={stats} />;
}
```

### Đáp án mẫu

> "Cả hai đều là data-fetching function của Pages Router, chạy chỉ trên server và return props cho page. Khác biệt cốt lõi là **thời điểm chạy**: `getStaticProps` chạy lúc build → SSG, có thể thêm `revalidate` để thành ISR, và đi kèm `getStaticPaths` với `fallback` cho dynamic route. `getServerSideProps` chạy mỗi request → SSR, có quyền đọc `req`/`res`, cookie, header — đổi lại TTFB chậm hơn. Trong App Router, cả hai biến mất, thay bằng fetch caching và route segment config: `force-cache` tương đương `getStaticProps`, `next: { revalidate: 60 }` tương đương ISR, `no-store` hoặc gọi `cookies()` tương đương `getServerSideProps`, còn `getStaticPaths` thì thành `generateStaticParams`. Em thấy mô hình mới hay hơn ở chỗ cache khai báo per-fetch chứ không per-page — một trang trộn được cả data static lẫn dynamic, điều Pages Router không làm được."

---

## Câu 26: Sự khác biệt giữa dynamic và static rendering trong App Router? `[Intermediate]`

### Câu hỏi

> Trong App Router, static rendering và dynamic rendering khác nhau thế nào? Những gì khiến một route chuyển từ static sang dynamic, làm sao kiểm tra một route đang ở mode nào, và tại sao việc phân biệt này quan trọng?

### Giải thích lý thuyết

App Router phân mọi route vào một trong hai mode:

| Tiêu chí | Static rendering | Dynamic rendering |
| -------- | ---------------- | ----------------- |
| Render lúc nào | **Build time** (hoặc lúc revalidate với ISR) | **Mỗi request** |
| Kết quả | HTML + RSC payload tĩnh, cache ở CDN | HTML render mới cho từng user |
| TTFB | Cực nhanh (CDN hit) | Phụ thuộc tốc độ render + fetch |
| Personalization | Không (mọi user thấy giống nhau) | Có (đọc được cookie, header) |
| Chi phí server | Gần như zero | Tỉ lệ thuận với traffic |

**Mặc định là static.** Next.js luôn *cố gắng* prerender route lúc build — đây là "static by default, dynamic by opt-in". Route chỉ **tự động chuyển sang dynamic** khi Next.js phát hiện nó dùng thông tin chỉ tồn tại lúc request (**Dynamic API**):

- **`cookies()`**, **`headers()`** từ `next/headers` — giá trị khác nhau theo từng request.
- **`searchParams`** trong page — query string chỉ biết lúc request.
- **`connection()`** — chờ tường minh đến lúc có request thật.
- Fetch với **`cache: "no-store"`** — yêu cầu data fresh mỗi request.

Ngoài cơ chế tự động, có thể **ép tường minh** bằng route segment config:

- `export const dynamic = "force-dynamic"` — luôn render mỗi request (kể cả không dùng Dynamic API).
- `export const dynamic = "force-static"` — ép static: `cookies()`/`headers()` trả giá trị rỗng, `searchParams` rỗng. Cẩn thận vì dễ tạo bug ngầm.

**Kiểm tra mode bằng output của `next build`:**

```
○  (Static)   — prerender thành HTML tĩnh
●  (SSG)      — prerender từ generateStaticParams
ƒ  (Dynamic)  — render trên server mỗi request
```

**Tại sao quan trọng?** Vì nó quyết định **chi phí và tốc độ**: route static serve từ CDN gần như miễn phí và TTFB tối thiểu; route dynamic chiếm compute server mỗi request. Bug kinh điển là **dynamic lan truyền ngoài ý muốn**: một `cookies()` trong layout dùng chung, hay một util đọc `headers()` bị import sâu trong tree, kéo cả nhóm route lẽ ra static thành dynamic — site chậm đi và tốn tiền hơn mà không ai để ý. Thói quen tốt: sau mỗi thay đổi lớn, đọc lại bảng `○`/`ƒ` trong build output để phát hiện route "rớt" khỏi static.

### Code minh hoạ

```tsx
// app/pricing/page.tsx — STATIC: không đụng Dynamic API
export default async function PricingPage() {
  // force-cache → data đóng băng lúc build, route vẫn static
  const plans = await fetch("https://api.example.com/plans", {
    cache: "force-cache",
  }).then((r) => r.json());
  return <PlanTable plans={plans} />;
}

// app/account/page.tsx — DYNAMIC: tự động vì gọi cookies()
import { cookies } from "next/headers";

export default async function AccountPage() {
  const session = (await cookies()).get("session")?.value; // → route thành ƒ
  const user = await fetchUser(session);
  return <Profile user={user} />;
}

// app/news/page.tsx — ÉP dynamic tường minh dù không dùng Dynamic API
export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const news = await fetch("https://api.example.com/news").then((r) =>
    r.json()
  );
  return <NewsList items={news} />;
}

// ❌ Pitfall: Dynamic API trong layout dùng chung
// app/(shop)/layout.tsx
import { headers } from "next/headers";

export default async function ShopLayout({ children }) {
  const ua = (await headers()).get("user-agent"); // ⚠️ TOÀN BỘ route con
  return <div data-ua={ua}>{children}</div>;      // trong (shop) thành dynamic!
}

// Output next build — cách kiểm tra mode:
// ○ /pricing      → Static  (prerender lúc build, serve từ CDN)
// ƒ /account      → Dynamic (render mỗi request)
// ƒ /news         → Dynamic (force-dynamic)
// ƒ /shop/*       → Dynamic NGOÀI Ý MUỐN do headers() trong layout
```

### Đáp án mẫu

> "Static rendering là render **lúc build** — HTML và RSC payload được cache, serve từ CDN cho mọi user, TTFB tối thiểu và server gần như không tải gì. Dynamic rendering là render **mỗi request** — cần thiết khi nội dung phụ thuộc từng user. App Router mặc định static; route chỉ chuyển sang dynamic khi đụng Dynamic API: `cookies()`, `headers()`, `searchParams`, `connection()`, hoặc fetch `no-store` — hoặc khi em ép bằng `dynamic = 'force-dynamic'`. Em kiểm tra bằng output của `next build`: ký hiệu `○` là static, `ƒ` là dynamic. Việc phân biệt này quan trọng vì nó quyết định trực tiếp chi phí và tốc độ — bug em hay gặp nhất là dynamic 'lan truyền' ngoài ý muốn: một `cookies()` trong layout dùng chung kéo cả nhóm route thành dynamic. Nên sau thay đổi lớn em luôn đọc lại build output để chắc route nào đáng static vẫn còn static."

---

## Câu 27: Streaming SSR trong Next.js hoạt động như thế nào? `[Advanced]`

### Câu hỏi

> Streaming SSR trong Next.js hoạt động như thế nào? Tại sao nó cải thiện performance, và cơ chế "out-of-order streaming" là gì?

### Giải thích lý thuyết

**Vấn đề của SSR truyền thống:** server phải chờ **toàn bộ data fetch xong** mới render và gửi HTML. Một fetch chậm (ví dụ recommendation mất 2s) kéo cả trang chậm theo — TTFB bị quyết định bởi **fetch chậm nhất**.

**Streaming SSR** giải quyết bằng cách gửi HTML **từng chunk** qua một HTTP response duy nhất (chunked transfer encoding):

1. Server render ngay những phần đã sẵn sàng (layout, header, static content) và **flush chunk đầu tiên** — TTFB cực thấp.
2. Phần đang chờ data (wrap trong `<Suspense>`) được gửi dưới dạng **fallback** (skeleton).
3. Khi data xong, server stream tiếp chunk chứa HTML thật.

**Cơ chế out-of-order streaming** — phần thú vị nhất:

- HTML là tài liệu tuyến tính, không thể "quay lại sửa" phần đã gửi. React giải quyết bằng cách: fallback được gửi kèm một marker (`<template id="B:0">`), còn content thật khi xong được gửi ở **cuối stream** trong thẻ ẩn (`<div hidden id="S:0">`) kèm một **inline script nhỏ** (`$RC`).
- Script này chạy ngay trong browser, **swap fallback bằng content thật** trong DOM — không cần chờ React bundle load, không cần JS framework.
- Nhờ đó các phần có thể hoàn thành **theo thứ tự bất kỳ** (out-of-order): phần chậm nhất xong cuối cùng cũng không chặn phần khác.

**Tác động lên metrics:**

| Metric | SSR blocking | Streaming SSR |
| ------ | ------------ | ------------- |
| TTFB | = fetch chậm nhất | Gần như tức thì |
| FCP | Chậm | Nhanh (shell + skeleton hiện ngay) |
| Tổng thời gian full load | Tương đương | Tương đương (data vẫn mất ngần ấy thời gian) |

**Insight phỏng vấn:** streaming **không làm data nhanh hơn** — tổng thời gian load đầy đủ không đổi. Nó cải thiện **perceived performance**: user thấy nội dung sớm hơn và trang "lấp đầy" dần thay vì màn hình trắng. Streaming hoạt động với cả RSC payload khi client-side navigation, không chỉ HTML lần đầu (chi tiết góc nhìn React ở Câu 54).

### Code minh hoạ

```tsx
// app/page.tsx — Next.js 15 App Router
import { Suspense } from "react";

export default function HomePage() {
  return (
    <main>
      {/* Phần này render NGAY và flush trong chunk đầu tiên */}
      <Header />
      <Hero />

      {/* Phần chậm: wrap Suspense → không chặn TTFB */}
      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations /> {/* fetch ~2s */}
      </Suspense>

      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews /> {/* fetch ~500ms — xong TRƯỚC, stream trước (out-of-order) */}
      </Suspense>

      <Footer />
    </main>
  );
}

// Server Component async — React "treo" component này tại Suspense boundary
async function Recommendations() {
  const items = await fetch("https://api.example.com/recommendations", {
    cache: "no-store",
  }).then((r) => r.json());
  return <ProductGrid items={items} />;
}

async function Reviews() {
  const reviews = await fetch("https://api.example.com/reviews", {
    cache: "no-store",
  }).then((r) => r.json());
  return <ReviewList reviews={reviews} />;
}

// HTML stream thực tế (rút gọn):
//
// Chunk 1 (t≈0ms): Header, Hero, 2 skeleton + marker
//   <header>...</header>
//   <!--$?--><template id="B:0"></template><div class="skeleton">...</div><!--/$-->
//
// Chunk 2 (t≈500ms): Reviews xong TRƯỚC → stream trước dù nằm sau trong JSX
//   <div hidden id="S:1">...review HTML...</div>
//   <script>$RC("B:1", "S:1")</script>  ← inline script swap skeleton → content
//
// Chunk 3 (t≈2000ms): Recommendations xong sau cùng
//   <div hidden id="S:0">...recommendations HTML...</div>
//   <script>$RC("B:0", "S:0")</script>
```

### Đáp án mẫu

> "Streaming SSR cho phép server gửi HTML **từng chunk** thay vì chờ toàn bộ data xong mới gửi. Với SSR truyền thống, TTFB bị quyết định bởi fetch chậm nhất; với streaming, server flush ngay phần shell — layout, header, skeleton — nên TTFB gần như tức thì, còn các phần chậm wrap trong Suspense sẽ stream vào sau. Cơ chế hay nhất là **out-of-order streaming**: vì HTML đã gửi không sửa lại được, React gửi fallback kèm marker, rồi khi data xong thì gửi content thật trong thẻ ẩn ở cuối stream kèm một inline script nhỏ — script này swap skeleton bằng content thật trong DOM, không cần chờ React bundle. Nhờ vậy phần nào xong trước stream trước, bất kể vị trí trong trang. Điểm em luôn nhấn mạnh: streaming không làm data nhanh hơn — tổng full load không đổi — nó cải thiện **perceived performance**: user thấy trang sớm và lấp đầy dần thay vì màn hình trắng."

---

## Câu 54: React Server Components streaming và progressive rendering là gì? `[Advanced]`

### Câu hỏi

> Dưới góc nhìn React, RSC streaming và progressive rendering hoạt động thế nào? Suspense boundary đóng vai trò gì, selective hydration là gì, và nó khác gì streaming HTML thuần?

### Giải thích lý thuyết

Câu 27 nhìn streaming ở tầng **HTTP/HTML**; câu này nhìn ở tầng **React**. Khi render Server Components, React không chỉ tạo HTML — nó tạo **RSC payload**: một định dạng serialize đặc biệt mô tả cây UI (kết quả render của Server Component, "lỗ trống" tham chiếu đến Client Component kèm props, và vị trí các Suspense boundary). Payload này cũng được **stream từng phần**:

- **Suspense boundary là đơn vị stream.** Mỗi boundary là một "đường cắt" trong cây: phần đã sẵn sàng được serialize và đẩy đi ngay; component đang `await` data bên trong boundary được đánh dấu *pending*, khi resolve xong thì chunk payload tương ứng được stream nối tiếp. Không có Suspense → cả cây là một khối, phải chờ toàn bộ.
- **Progressive rendering** là trải nghiệm phía user của cơ chế đó: **shell hiện trước** (layout + fallback), rồi từng phần data đến sau **điền dần** vào trang theo thứ tự hoàn thành — trang "tiến hoá" từ skeleton sang hoàn chỉnh, không có khoảnh khắc màn hình trắng.
- **Selective hydration** — mảnh ghép thứ ba: React không hydrate cả trang như một khối mà hydrate **theo từng Suspense boundary**, và quan trọng nhất là **ưu tiên theo tương tác của user**. Nếu user click vào một vùng chưa hydrate, React ưu tiên hydrate boundary đó trước, đồng thời **replay event** sau khi hydrate xong — vùng được bấm "sống dậy" trước các vùng khác.

**Khác streaming HTML thuần ở đâu?** Streaming HTML chỉ tồn tại ở lần tải đầu. RSC streaming hoạt động ở cả **soft navigation**: khi user điều hướng client-side (`next/link`), Next.js không tải HTML mới mà fetch **RSC payload** của route đích — và payload này cũng stream: phần sẵn sàng hiện ngay, phần chậm trong Suspense hiện fallback rồi điền dần. Tức là cùng một mô hình progressive rendering áp dụng nhất quán cho mọi lần điều hướng, kèm bonus: client state (form đang gõ, scroll position) được giữ nguyên vì React chỉ **merge** cây mới vào cây hiện tại.

**Pitfall:** nghĩ rằng RSC payload là HTML — không phải; nó là mô tả cây UI để React reconcile. Và nhớ rằng streaming chỉ có tác dụng khi có Suspense boundary đặt đúng chỗ — không boundary thì mọi thứ vẫn chờ nhau.

### Code minh hoạ

```tsx
// app/products/[id]/page.tsx — Next.js 15
import { Suspense } from "react";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main>
      {/* SHELL — serialize và stream NGAY trong chunk RSC payload đầu tiên */}
      <ProductInfo id={id} />

      {/* Mỗi Suspense = 1 ĐƠN VỊ STREAM, hoàn thành độc lập */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews id={id} /> {/* Server Component, fetch ~1.5s */}
      </Suspense>

      <Suspense fallback={<RelatedSkeleton />}>
        <RelatedProducts id={id} /> {/* fetch ~400ms — điền vào TRƯỚC */}
      </Suspense>

      {/* Client Component: xuất hiện trong payload dưới dạng THAM CHIẾU
          (đường dẫn chunk JS + props serialize), hydrate theo selective hydration */}
      <AddToCartButton productId={id} />
    </main>
  );
}

// RSC payload stream (minh hoạ, rút gọn — KHÔNG phải HTML):
//
// Chunk 1 (t≈0):    1:["$","main",null,{children:[
//                     ["$","ProductInfo..."],          ← shell sẵn sàng
//                     ["$","$Sreact.suspense",null,{fallback:..., children:"$L2"}],
//                     ["$","$Sreact.suspense",null,{fallback:..., children:"$L3"}],
//                     ["$","$L4", ...props]            ← tham chiếu Client Component
//                   ]}]
// Chunk 2 (t≈400ms): 3:["$","RelatedProducts..."]      ← xong trước, điền trước
// Chunk 3 (t≈1.5s):  2:["$","Reviews..."]              ← xong sau, điền sau
//
// Progressive rendering phía user:
// t=0     : thấy ProductInfo + 2 skeleton + nút Add to Cart (chưa bấm được)
// t=400ms : RelatedProducts điền vào
// user click nút Add to Cart → selective hydration ƯU TIÊN hydrate
//           boundary chứa nút, replay event click sau khi hydrate xong
// t=1.5s  : Reviews điền vào — trang hoàn chỉnh

// Soft navigation cũng stream RSC payload (khác HTML streaming thuần):
// <Link href="/products/42" /> → fetch RSC payload của route đích,
// React MERGE cây mới vào cây hiện tại → giữ nguyên client state, không full reload
```

### Đáp án mẫu

> "Dưới góc nhìn React, khi render Server Components, server tạo ra **RSC payload** — bản serialize của cây UI — và payload này được **stream từng phần**, với **Suspense boundary là đơn vị stream**: phần sẵn sàng đẩy đi ngay, phần đang await data được đánh dấu pending và stream nối tiếp khi xong. Progressive rendering là trải nghiệm tương ứng: shell hiện trước, các phần data đến sau điền dần vào trang. Mảnh thứ ba là **selective hydration**: React hydrate theo từng boundary và ưu tiên vùng user đang tương tác — click vào vùng chưa hydrate thì React hydrate vùng đó trước rồi replay event. Điểm khác streaming HTML thuần mà em hay nhấn mạnh: HTML streaming chỉ có ở lần tải đầu, còn RSC payload stream cả khi **soft navigation** — `next/link` fetch payload của route mới và React merge vào cây hiện tại, vừa progressive vừa giữ nguyên client state."

---

## Câu 56: Partial Prerendering (PPR) trong Next.js là gì? `[Advanced]`

### Câu hỏi

> Partial Prerendering (PPR) là gì? Nó khác gì streaming SSR thuần, và hiện trạng của tính năng này trong Next.js?

### Giải thích lý thuyết

Trước PPR, mỗi **route** phải chọn một trong hai: hoặc **static** toàn bộ (nhanh nhưng không personalize được), hoặc **dynamic** toàn bộ (chỉ một cái `cookies()` trong giỏ hàng cũng kéo cả trang product thành SSR).

**PPR (Partial Prerendering)** phá vỡ lựa chọn nhị phân đó: **trong cùng một route**, kết hợp:

- **Static shell**: phần không phụ thuộc request (layout, hero, mô tả sản phẩm) được **prerender lúc build** và serve từ CDN/edge — TTFB như trang tĩnh.
- **Dynamic holes**: phần phụ thuộc request (giỏ hàng, giá theo user, recommendation) được **stream từ server lúc request**, lấp vào các "lỗ" trong shell.

**`<Suspense>` chính là ranh giới**: lúc build, Next.js prerender mọi thứ *bên ngoài* Suspense boundary; nội dung *bên trong* boundary nào đụng Dynamic API (`cookies()`, `headers()`, `no-store`...) sẽ thành dynamic hole — fallback của nó được nướng sẵn vào static shell.

**Khác gì streaming SSR thuần?**

| Tiêu chí | Streaming SSR | PPR |
| -------- | ------------- | --- |
| Shell (phần ngoài Suspense) | Render **lúc request** trên server | **Prerender lúc build**, serve từ CDN |
| TTFB | Nhanh, nhưng vẫn cần server render shell | Như trang static (CDN hit, không chờ render) |
| Route classification | Cả route là dynamic | Route vừa static vừa dynamic **cùng lúc** |
| Số response | 1 HTTP response, stream dần | Vẫn **1 response duy nhất**: shell flush tức thì, dynamic stream nối tiếp |

Điểm tinh tế: với PPR, request vẫn chỉ có **một** round-trip — edge trả shell ngay lập tức rồi giữ kết nối để stream phần dynamic, chứ không phải "tải shell xong client fetch tiếp".

**Hiện trạng:** PPR vẫn là **experimental** — cần Next.js canary, bật `experimental.ppr` trong config (giá trị `'incremental'` để opt-in từng route bằng `export const experimental_ppr = true`). Chưa nên dùng cho production quan trọng; nhưng nên hiểu vì nó là hướng đi mặc định tương lai của Next.js — "static by default, dynamic by Suspense boundary".

**Pitfall:** đặt Dynamic API *ngoài* Suspense boundary (ví dụ `cookies()` ngay trong page body) → không còn gì để prerender, PPR mất tác dụng. Kỷ luật là: đẩy mọi thứ dynamic xuống component con và wrap Suspense.

### Code minh hoạ

```tsx
// next.config.ts — PPR vẫn experimental, cần bản canary
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    ppr: "incremental", // opt-in từng route, không bật toàn app
  },
};
export default nextConfig;

// app/products/[id]/page.tsx
import { Suspense } from "react";
import { cookies } from "next/headers";

export const experimental_ppr = true; // bật PPR cho route này

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main>
      {/* ===== STATIC SHELL — prerender LÚC BUILD, serve từ CDN ===== */}
      <SiteHeader />
      <ProductGallery id={id} />
      <ProductDescription id={id} />

      {/* ===== DYNAMIC HOLES — stream LÚC REQUEST ===== */}
      {/* Suspense là RANH GIỚI static/dynamic; fallback được nướng vào shell */}
      <Suspense fallback={<PriceSkeleton />}>
        <PersonalizedPrice productId={id} />
      </Suspense>

      <Suspense fallback={<CartBadgeSkeleton />}>
        <CartBadge />
      </Suspense>

      <SiteFooter /> {/* vẫn thuộc static shell */}
    </main>
  );
}

// Component dynamic: đụng cookies() → thành dynamic hole
// QUAN TRỌNG: gọi Dynamic API BÊN TRONG boundary, không phải ở page body
async function CartBadge() {
  const cart = (await cookies()).get("cart")?.value;
  const count = cart ? JSON.parse(cart).length : 0;
  return <span className="badge">{count}</span>;
}

async function PersonalizedPrice({ productId }: { productId: string }) {
  const price = await fetch(`https://api.example.com/price/${productId}`, {
    cache: "no-store", // dynamic theo request
  }).then((r) => r.json());
  return <Price value={price.amount} discount={price.userDiscount} />;
}

// Timeline của 1 request (VẪN CHỈ 1 HTTP response):
// t≈0ms  : Edge/CDN trả static shell NGAY — gallery, description, 2 skeleton
//          (không chờ server render gì cả — đây là điểm khác streaming SSR)
// t=xxxms: Server stream PersonalizedPrice + CartBadge lấp vào holes
```

### Đáp án mẫu

> "PPR cho phép **một route vừa static vừa dynamic cùng lúc**. Trước đây chỉ một cái `cookies()` cho cart badge cũng kéo cả trang product thành dynamic; với PPR, phần không phụ thuộc request — layout, gallery, mô tả — được prerender lúc build thành **static shell** serve từ CDN, còn các phần dynamic wrap trong Suspense trở thành **holes** được stream lúc request lấp vào shell. Suspense chính là ranh giới: ngoài boundary là static, trong boundary đụng Dynamic API thì thành dynamic, và fallback được nướng sẵn vào shell. Khác streaming SSR thuần ở chỗ: streaming thì shell vẫn phải render trên server mỗi request, còn PPR shell đã nằm sẵn ở CDN nên TTFB như trang tĩnh — và tất cả vẫn trong **một response duy nhất**, edge flush shell rồi giữ kết nối stream phần dynamic. Hiện PPR vẫn **experimental** — cần canary và bật `experimental.ppr` với `experimental_ppr = true` per route — nên em chưa dùng production, nhưng em theo dõi kỹ vì đây là hướng mặc định tương lai của Next.js."

---

## Bẫy thường gặp khi trả lời

| Sai lầm | Đúng là |
| ------- | ------- |
| "Next 15 fetch mặc định cache như Next 14" | Next 15 fetch mặc định **không cache** — muốn static phải khai báo `force-cache`/`revalidate` |
| "App Router mặc định là dynamic" | Mặc định là **static** — chỉ thành dynamic khi đụng Dynamic API (`cookies()`, `headers()`, `searchParams`, `no-store`) hoặc `force-dynamic` |
| "Muốn biết route static hay dynamic phải đoán" | Đọc output `next build`: `○` = static, `●` = SSG, `ƒ` = dynamic |
| "Streaming làm data load nhanh hơn" | Tổng thời gian không đổi — streaming cải thiện TTFB và **perceived performance** |
| "RSC payload là HTML" | Là bản **serialize của cây UI** để React reconcile — stream cả ở soft navigation, giữ nguyên client state |
| "Hydration chạy một lượt cả trang" | **Selective hydration**: hydrate theo từng Suspense boundary, ưu tiên vùng user tương tác và replay event |
| "PPR chỉ là streaming SSR đổi tên" | PPR prerender shell **lúc build** (CDN), streaming SSR render shell **mỗi request** |
| "PPR đã stable, cứ bật production" | PPR vẫn **experimental**, cần canary + `experimental.ppr` |
