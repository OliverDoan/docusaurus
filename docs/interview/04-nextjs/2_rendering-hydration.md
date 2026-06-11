---
sidebar_position: 2
title: "2. Rendering, Streaming & Hydration"
---

# Rendering, Streaming & Hydration

> *SSR, SSG, Streaming, Hydration — đây là "xương sống" của mọi buổi phỏng vấn Next.js. Trả lời tốt phần này chứng tỏ bạn hiểu Next.js render trang web như thế nào từ server đến browser, chứ không chỉ biết gõ `npx create-next-app`.*

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

## Câu 22: Streaming trong React Server Components là gì? `[Advanced]`

### Câu hỏi

> Streaming trong React Server Components hoạt động như thế nào? Tại sao nó cải thiện performance, và cơ chế "out-of-order streaming" là gì?

### Giải thích lý thuyết

**Vấn đề của SSR truyền thống:** server phải chờ **toàn bộ data fetch xong** mới render và gửi HTML. Một fetch chậm (ví dụ recommendation mất 2s) kéo cả trang chậm theo — TTFB bị quyết định bởi **fetch chậm nhất**.

**Streaming** giải quyết bằng cách gửi HTML **từng chunk** qua một HTTP response duy nhất (chunked transfer encoding):

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

**Insight phỏng vấn:** streaming **không làm data nhanh hơn** — tổng thời gian load đầy đủ không đổi. Nó cải thiện **perceived performance**: user thấy nội dung sớm hơn và trang "lấp đầy" dần thay vì màn hình trắng. Streaming hoạt động với cả RSC payload khi client-side navigation, không chỉ HTML lần đầu.

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

> "Streaming cho phép server gửi HTML **từng chunk** thay vì chờ toàn bộ data xong mới gửi. Với SSR truyền thống, TTFB bị quyết định bởi fetch chậm nhất; với streaming, server flush ngay phần shell — layout, header, skeleton — nên TTFB gần như tức thì, còn các phần chậm wrap trong Suspense sẽ stream vào sau. Cơ chế hay nhất là **out-of-order streaming**: vì HTML đã gửi không sửa lại được, React gửi fallback kèm marker, rồi khi data xong thì gửi content thật trong thẻ ẩn ở cuối stream kèm một inline script nhỏ — script này swap skeleton bằng content thật trong DOM, không cần chờ React bundle. Nhờ vậy phần nào xong trước stream trước, bất kể vị trí trong trang. Điểm em luôn nhấn mạnh: streaming không làm data nhanh hơn — tổng full load không đổi — nó cải thiện **perceived performance**: user thấy trang sớm và lấp đầy dần thay vì màn hình trắng."

---

## Câu 23: Suspense trong Next.js hoạt động như thế nào? `[Intermediate]`

### Câu hỏi

> `<Suspense>` trong Next.js dùng để làm gì? `loading.tsx` liên quan gì đến Suspense, và vì sao nên đặt boundary granular?

### Giải thích lý thuyết

**`<Suspense>`** là một React boundary khai báo: *"phần bên trong có thể chưa sẵn sàng — trong lúc chờ, hiển thị `fallback`"*. Trong Next.js App Router, Suspense là **đơn vị chia cắt cho streaming SSR**:

- Component async (Server Component đang `await` data) bên trong boundary sẽ "treo" (suspend).
- Server render và flush **fallback** trước, rồi stream content thật vào khi data xong (xem Câu 22).
- Phần **ngoài** boundary không bị chặn — đây là cách bạn kiểm soát phần nào của trang được phép chậm.

**`loading.tsx` = Suspense ngầm:** khi tạo file `loading.tsx` trong một route segment, Next.js tự động wrap `page.tsx` như sau:

```tsx
<Layout>
  <Suspense fallback={<Loading />}>
    <Page />
  </Suspense>
</Layout>
```

Nghĩa là cả page là **một boundary lớn**: navigation hiện loading UI ngay lập tức, layout vẫn giữ nguyên (không bị unmount).

**Granular boundaries — tại sao nên chia nhỏ:**

| Cách đặt boundary | Hệ quả |
| ----------------- | ------ |
| 1 boundary bao cả page (`loading.tsx`) | Cả trang chờ fetch chậm nhất trong page mới hiện content |
| Nhiều boundary nhỏ quanh từng khối data | Mỗi khối hiện độc lập — phần nhanh hiện trước, phần chậm skeleton riêng |

Nguyên tắc thiết kế: đặt boundary quanh **đơn vị UI có ý nghĩa** (card, chart, list), fallback nên là **skeleton cùng kích thước** với content thật để tránh layout shift (CLS).

**Pitfalls:**

- Suspense **không catch error** — fetch fail cần `error.tsx` hoặc Error Boundary riêng.
- Fetch tuần tự trong cùng một component (`await a; await b;`) tạo **waterfall** — Suspense không tự fix; cần tách thành 2 component song song hoặc `Promise.all`.
- Boundary quá nhỏ và quá nhiều → trang "nhấp nháy" từng mảnh, UX tệ hơn.

### Code minh hoạ

```tsx
// app/dashboard/loading.tsx — Suspense NGẦM cho cả page
export default function Loading() {
  // Hiện NGAY khi navigate vào /dashboard, layout giữ nguyên
  return <DashboardSkeleton />;
}

// app/dashboard/page.tsx — granular boundaries bên trong page
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <div className="grid">
      {/* Static — hiện ngay trong chunk đầu */}
      <PageTitle />

      {/* Mỗi khối data có boundary RIÊNG → stream độc lập */}
      <Suspense fallback={<CardSkeleton />}>
        <RevenueCard /> {/* fetch 300ms → hiện sớm */}
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <OrdersCard /> {/* fetch 800ms */}
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <AnalyticsChart /> {/* fetch 2s → chỉ MÌNH NÓ chờ lâu */}
      </Suspense>
    </div>
  );
}

// Hai component async chạy SONG SONG vì là 2 subtree riêng
async function RevenueCard() {
  const revenue = await fetchRevenue(); // 300ms
  return <Card title="Doanh thu" value={revenue.total} />;
}

async function AnalyticsChart() {
  const data = await fetchAnalytics(); // 2s — không chặn 2 card kia
  return <Chart data={data} />;
}

// ❌ Anti-pattern: waterfall trong 1 component — Suspense không cứu được
async function BadCard() {
  const user = await fetchUser();        // 500ms
  const orders = await fetchOrders(user.id); // +800ms → tổng 1.3s tuần tự
  return <Card user={user} orders={orders} />;
}

// ✅ Nếu 2 fetch độc lập: chạy song song
async function GoodCard() {
  const [user, stats] = await Promise.all([fetchUser(), fetchStats()]);
  return <Card user={user} stats={stats} />;
}
```

### Đáp án mẫu

> "Suspense là boundary khai báo cho phần UI có thể chưa sẵn sàng: trong lúc component async bên trong còn đang await data, React hiện `fallback`; khi data xong, content thật được stream vào thay thế. Trong App Router, Suspense chính là split point của streaming SSR — phần ngoài boundary flush ngay, phần trong stream sau. `loading.tsx` thực chất là Suspense ngầm: Next tự wrap cả page trong một boundary với loading UI, nên navigation hiện feedback tức thì mà layout không bị unmount. Em ưu tiên **granular boundaries**: thay vì một boundary bao cả trang khiến mọi thứ chờ fetch chậm nhất, em đặt boundary quanh từng khối — card, chart, list — để phần nhanh hiện trước. Hai lưu ý em hay nhắc: fallback nên là skeleton đúng kích thước để tránh CLS, và Suspense không fix được waterfall — fetch tuần tự trong cùng component thì phải tách component hoặc `Promise.all`."

---

## Câu 24: Hydration là gì? `[Basic]`

### Câu hỏi

> Hydration là gì? Tại sao cần hydration sau khi server đã render HTML, và vì sao JS bundle phải render ra kết quả khớp với HTML đó?

### Giải thích lý thuyết

HTML mà SSR/SSG gửi về chỉ là **markup tĩnh** — user nhìn thấy nội dung nhưng **chưa tương tác được**: button không có onClick, form không có handler, state chưa tồn tại.

**Hydration** là quá trình React trên client "thổi sự sống" vào HTML tĩnh đó:

1. Browser hiển thị HTML server gửi về (user thấy content — FCP).
2. JS bundle tải về và thực thi.
3. React chạy lại render trên client để **dựng lại component tree** (Fiber tree) trong memory.
4. React **đối chiếu** tree này với DOM có sẵn — thay vì tạo DOM mới, nó **adopt (nhận nuôi)** các DOM node hiện có.
5. React **gắn event listener** (onClick, onChange...) và khởi tạo state, effect.
6. Từ thời điểm này, page trở thành React app đầy đủ — **TTI (Time to Interactive)** đạt được.

Trong Next.js, lệnh thực hiện việc này là `hydrateRoot(domNode, <App/>)` (framework gọi hộ bạn).

**Tại sao client render phải khớp HTML server?** Vì hydration được thiết kế để **không render lại DOM** — React *giả định* HTML có sẵn chính là kết quả render của component tree, nên nó chỉ "ướm" tree lên DOM và gắn listener. Nếu hai bên lệch nhau, React không biết gắn listener vào đâu cho đúng → **hydration mismatch** (chi tiết ở Câu 25), và React phải vứt DOM server đi, render lại từ đầu trên client — mất toàn bộ lợi ích SSR.

**Khoảng trống cần biết — "uncanny valley":** giữa lúc user *thấy* trang (FCP) và lúc trang *tương tác được* (TTI), click vào button sẽ không có phản hồi. Bundle JS càng lớn, khoảng này càng dài. Đây là lý do Next.js đẩy mạnh Server Components: code của Server Component **không gửi xuống client và không cần hydrate** — chỉ Client Component (`"use client"`) mới phải hydrate, giúp thu nhỏ chi phí này.

### Code minh hoạ

```tsx
// app/products/[id]/page.tsx — Server Component: KHÔNG cần hydrate
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await fetchProduct(id);

  return (
    <main>
      {/* Phần này là HTML thuần sau khi render — không gửi JS xuống client */}
      <h1>{product.name}</h1>
      <p>{product.description}</p>

      {/* Chỉ island này cần hydrate */}
      <AddToCartButton productId={product.id} />
    </main>
  );
}

// app/products/[id]/AddToCartButton.tsx — Client Component: CẦN hydrate
"use client";
import { useState } from "react";

export default function AddToCartButton({ productId }: { productId: string }) {
  const [adding, setAdding] = useState(false);

  // Trước hydration: button HIỂN THỊ nhưng click KHÔNG có tác dụng
  // Sau hydration: React gắn onClick + khởi tạo state → tương tác được
  async function handleClick() {
    setAdding(true);
    await fetch("/api/cart", {
      method: "POST",
      body: JSON.stringify({ productId }),
    });
    setAdding(false);
  }

  return (
    <button onClick={handleClick} disabled={adding}>
      {adding ? "Đang thêm..." : "Thêm vào giỏ"}
    </button>
  );
}

// Bản chất hydration (React làm ngầm trong Next.js):
//
// import { hydrateRoot } from "react-dom/client";
// hydrateRoot(document, <App />);
// // ≠ createRoot().render(): KHÔNG tạo DOM mới,
// // mà ADOPT DOM có sẵn + gắn event listener lên đó.
//
// Timeline:
// t=0ms   : HTML hiển thị (FCP) — thấy button nhưng click vô dụng
// t=400ms : JS bundle tải xong, React hydrate
// t=450ms : Event listener gắn xong (TTI) — page tương tác được
```

### Đáp án mẫu

> "Hydration là quá trình biến HTML tĩnh mà server gửi về thành React app tương tác được. SSR cho user *thấy* nội dung sớm, nhưng HTML đó chưa có event listener hay state. Khi JS bundle tải xong, React render lại component tree trên client, đối chiếu với DOM có sẵn, rồi **adopt** các DOM node đó thay vì tạo mới — sau đó gắn onClick, onChange và khởi tạo state. Xong bước này page mới đạt TTI. Client render phải khớp HTML server vì React giả định DOM có sẵn chính là output của tree — nó chỉ 'ướm' lên và gắn listener; lệch nhau là hydration mismatch, React phải vứt DOM đi render lại từ đầu, mất sạch lợi ích SSR. Một insight em hay nói thêm: giữa FCP và TTI có khoảng 'thấy mà chưa bấm được' — bundle càng to khoảng này càng dài. Server Components giải quyết đúng chỗ đó: chỉ Client Component mới cần ship JS và hydrate, phần còn lại là HTML thuần."

---

## Câu 25: Hydration mismatch là gì? Nguyên nhân thường gặp? `[Intermediate]`

### Câu hỏi

> Hydration mismatch là gì? Kể các nguyên nhân thường gặp và cách fix cho từng trường hợp.

### Giải thích lý thuyết

**Hydration mismatch** xảy ra khi **HTML server render ≠ kết quả render lần đầu trên client**. React khi hydrate kỳ vọng hai bên giống hệt nhau; lệch nhau thì React log error (`Hydration failed...`) và phải **vứt bỏ DOM server, render lại toàn bộ từ client** — chậm hơn, có thể gây nháy UI, và làm SSR trở nên vô nghĩa cho phần đó.

**Nguyên nhân thường gặp:**

| Nguyên nhân | Vì sao mismatch |
| ----------- | --------------- |
| `Date.now()`, `new Date().toLocaleString()` | Thời điểm render server ≠ client; timezone/locale khác nhau |
| `Math.random()`, `crypto.randomUUID()` | Mỗi lần chạy ra giá trị khác — server một giá trị, client một giá trị |
| Đọc `window`, `localStorage` trong render | Server không có browser API → render nhánh khác client |
| HTML không hợp lệ (`<p>` lồng `<div>`, `<p>` lồng `<p>`) | Browser tự "sửa" HTML sai khi parse → DOM thực tế khác HTML server gửi |
| Browser extension (Grammarly, ad blocker...) | Chèn element vào DOM **trước khi** React hydrate — không phải bug code |

**Cách fix theo từng trường hợp:**

1. **`useEffect` + state** — pattern phổ biến nhất: render lần đầu giống server (giá trị placeholder), rồi cập nhật giá trị client-only **sau khi hydrate** trong `useEffect`. Hai bên khớp nhau ở lần render đầu → không mismatch.
2. **`suppressHydrationWarning`** — đặt trên element mà nội dung *chắc chắn và chấp nhận được* là khác nhau (đồng hồ, timestamp). Chỉ áp dụng cho element đó, **không lan xuống children** — và không nên lạm dụng vì nó che luôn bug thật.
3. **`dynamic(..., { ssr: false })`** — với component phụ thuộc nặng vào browser API (chart, map, editor): bỏ hẳn SSR cho component đó, chỉ render ở client.
4. **Sửa HTML cho hợp lệ** — không lồng block element trong `<p>`, kiểm tra component UI library render ra thẻ gì.
5. **Extension** — test ở chế độ incognito để xác nhận; nếu đúng do extension thì không phải lỗi code.

**Insight:** đừng fix bằng `typeof window !== "undefined" ? A : B` ngay trong render — đó chính là *nguyên nhân* mismatch chứ không phải cách fix, vì server đi nhánh B còn client lần đầu đi nhánh A.

### Code minh hoạ

```tsx
"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// ❌ Mismatch: server render giờ UTC, client render giờ local
function BadClock() {
  return <span>{new Date().toLocaleTimeString()}</span>;
}

// ❌ Mismatch: server không có window → đi nhánh else, client đi nhánh if
function BadTheme() {
  const theme =
    typeof window !== "undefined" ? localStorage.getItem("theme") : "light";
  return <div data-theme={theme}>...</div>;
}

// ✅ Fix 1: useEffect — lần render đầu khớp server, cập nhật sau khi hydrate
function GoodClock() {
  const [time, setTime] = useState<string | null>(null); // server + client lần 1: null

  useEffect(() => {
    // Chỉ chạy trên client, SAU khi hydrate xong → an toàn
    setTime(new Date().toLocaleTimeString());
  }, []);

  return <span>{time ?? "--:--:--"}</span>;
}

// ✅ Fix 2: suppressHydrationWarning — chấp nhận khác biệt ở ĐÚNG element này
function StampedTime({ iso }: { iso: string }) {
  return (
    <time dateTime={iso} suppressHydrationWarning>
      {new Date(iso).toLocaleString()} {/* locale user có thể khác server */}
    </time>
  );
}

// ✅ Fix 3: dynamic ssr:false — component phụ thuộc browser API, bỏ SSR luôn
const MapWidget = dynamic(() => import("./MapWidget"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

// ❌ Mismatch do HTML không hợp lệ: browser tự tách <div> ra khỏi <p>
function BadMarkup() {
  return (
    <p>
      Mô tả: <div>chi tiết</div> {/* <div> trong <p> — DOM bị browser sửa lại */}
    </p>
  );
}

// ✅ Fix 4: dùng markup hợp lệ
function GoodMarkup() {
  return (
    <div>
      Mô tả: <div>chi tiết</div>
    </div>
  );
}
```

### Đáp án mẫu

> "Hydration mismatch là khi HTML server render khác với kết quả render lần đầu trên client — React phát hiện lệch, log error và phải vứt DOM server đi để render lại từ client, vừa chậm vừa mất lợi ích SSR. Nguyên nhân top đầu em gặp: `Date`/`Math.random` ra giá trị khác nhau giữa hai lần chạy; đọc `window` hay `localStorage` ngay trong render khiến server đi nhánh khác; HTML không hợp lệ như `<div>` trong `<p>` bị browser tự sửa; và browser extension chèn DOM trước khi hydrate. Cách fix tuỳ case: với giá trị client-only thì render placeholder trước rồi set giá trị trong `useEffect` để lần render đầu khớp server; với element chấp nhận khác biệt như đồng hồ thì `suppressHydrationWarning` — dùng tiết kiệm; với component nặng browser API như map, chart thì `dynamic` với `ssr: false`. Còn nghi ngờ extension thì em test incognito để loại trừ. Điều em tránh nhất là `typeof window` ternary trong render — nó chính là nguồn mismatch chứ không phải cách fix."

---

## Câu 56: Partial Prerendering (PPR) là gì? `[Advanced]`

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
| "Streaming làm data load nhanh hơn" | Tổng thời gian không đổi — streaming cải thiện TTFB và **perceived performance** |
| "Hydration là render lại trang" | Hydration **adopt** DOM có sẵn + gắn listener; chỉ khi mismatch React mới render lại từ đầu |
| "Fix mismatch bằng `typeof window` ternary trong render" | Đó là *nguyên nhân* mismatch; fix đúng là `useEffect`, `suppressHydrationWarning`, hoặc `ssr: false` |
| "PPR chỉ là streaming SSR đổi tên" | PPR prerender shell **lúc build** (CDN), streaming SSR render shell **mỗi request** |
| "PPR đã stable, cứ bật production" | PPR vẫn **experimental**, cần canary + `experimental.ppr` |
