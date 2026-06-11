---
sidebar_position: 4
title: "4. Data Fetching & Caching"
---

# Data Fetching & Caching

> *Hiểu rõ 4 lớp cache và cách invalidate từng lớp là thứ phân biệt người "dùng Next.js" với người "hiểu Next.js".*

---

## Câu 26: React `cache()` trong Next.js là gì? `[Advanced]`

### Câu hỏi

> Em query database bằng Prisma trong nhiều Server Component khác nhau trên cùng một trang. Làm sao tránh query trùng lặp? React `cache()` giải quyết việc này như thế nào, và nó khác gì với fetch memoization?

### Giải thích lý thuyết

`cache()` là API của **React** (không phải Next.js), dùng để **memoize kết quả của một function trong 1 render pass** trên server.

Vấn đề nó giải quyết:
- `fetch()` được Next.js tự động memoize trong cùng render pass — nhưng **chỉ áp dụng cho fetch**.
- DB query qua Prisma/Drizzle, gọi SDK, đọc file... **không phải fetch** → không được dedupe tự động.
- Nếu `Layout`, `Page`, `generateMetadata` cùng cần `getUser(id)` → 3 query DB trùng lặp.

Cơ chế:
- Wrap function bằng `cache()` → tạo memoized version.
- Trong **cùng 1 render pass** (1 server request), gọi nhiều lần với **cùng arguments** → chỉ chạy 1 lần, các lần sau trả kết quả đã memo.
- Cache key dựa trên **reference của function + arguments** (so sánh shallow, object arguments phải cùng reference mới hit).
- Hết render pass → cache bị xoá. **Không persist** qua request.

So sánh với các cơ chế cache khác:

| Cơ chế               | Áp dụng cho            | Thời gian sống       | Persist qua request? |
| -------------------- | ---------------------- | -------------------- | -------------------- |
| `fetch` memoization  | Chỉ `fetch()`          | 1 render pass        | Không                |
| React `cache()`      | Mọi function (DB, ORM) | 1 render pass        | Không                |
| `unstable_cache` / `'use cache'` | Mọi function | Theo revalidate      | Có (Data Cache)      |
| Data Cache (`fetch`) | `fetch()` có cache     | Theo revalidate      | Có                   |

Pitfalls:
- Khai báo `cache()` **ngoài component** (module scope). Khai báo trong component → mỗi render tạo function mới → không bao giờ hit cache.
- Object arguments: `getUser({ id: 1 })` gọi 2 lần với 2 object literal khác nhau → **miss cache** vì khác reference. Truyền primitive (`getUser(1)`) an toàn hơn.
- Chỉ hoạt động trên server (Server Component, Server Action). Trong Client Component nó không có tác dụng memo theo request.
- Đừng nhầm với `unstable_cache`/`'use cache'` — hai cái đó là **Data Cache** persist qua request, còn `cache()` chỉ sống trong 1 request.

### Code minh hoạ

```typescript
// lib/data/user.ts
import { cache } from "react";
import { db } from "@/lib/db";

// ✅ Khai báo ở module scope — share memo giữa các component
export const getUser = cache(async (id: string) => {
  console.log("DB query chạy"); // Log này chỉ in 1 lần / request
  return db.user.findUnique({ where: { id } });
});

// app/users/[id]/layout.tsx
export default async function Layout({ params, children }) {
  const { id } = await params;
  const user = await getUser(id); // Query DB lần đầu
  return (
    <div>
      <Breadcrumb name={user?.name} />
      {children}
    </div>
  );
}

// app/users/[id]/page.tsx
export default async function Page({ params }) {
  const { id } = await params;
  const user = await getUser(id); // Hit memo — KHÔNG query DB lại
  return <Profile user={user} />;
}

// app/users/[id]/page.tsx — generateMetadata cũng dedupe
export async function generateMetadata({ params }) {
  const { id } = await params;
  const user = await getUser(id); // Vẫn hit memo trong cùng request
  return { title: user?.name };
}

// ❌ Sai: object argument khác reference → miss cache
export const getUserBad = cache(async (opts: { id: string }) => {
  return db.user.findUnique({ where: { id: opts.id } });
});
await getUserBad({ id: "1" }); // chạy query
await getUserBad({ id: "1" }); // object mới → MISS, query lại!

// Khác với 'use cache' (Next 15 canary) — persist qua request
// async function getProducts() {
//   "use cache";
//   return db.product.findMany();
// }
```

### Đáp án mẫu

> "React `cache()` memoize kết quả function trong **1 render pass** trên server. Nó giải quyết bài toán mà fetch memoization không cover: Next.js chỉ tự dedupe `fetch()`, còn DB query qua Prisma hay ORM thì không. Khi `Layout`, `Page` và `generateMetadata` cùng cần `getUser(id)`, nếu không có `cache()` thì query DB chạy 3 lần — wrap bằng `cache()` thì chỉ chạy 1 lần, các lần sau trả kết quả memo. Quan trọng là nó **không persist qua request** — hết render pass là cache xoá, nên không có vấn đề stale data. Em phân biệt rõ với `unstable_cache` hay `'use cache'` — hai cái đó ghi vào Data Cache, sống qua nhiều request và cần revalidate. Pitfall em hay nhắc: phải khai báo `cache()` ở module scope, và tránh truyền object literal làm argument vì cache key so sánh theo reference."

---

## Câu 27: `fetch()` trong App Router có cơ chế cache như thế nào? `[Intermediate]`

### Câu hỏi

> Anh gọi `fetch()` trong Server Component của Next.js 15. Request đó có được cache không? Cơ chế cache của fetch trong App Router hoạt động ra sao?

### Giải thích lý thuyết

`fetch()` trong App Router đi qua **2 tầng** xử lý:

**1. Request Memoization (tự động, không tắt được với GET):**
- Trong **cùng 1 render pass**, các fetch có cùng URL + cùng options chỉ thực thi 1 lần.
- Cho phép gọi fetch ở bất kỳ component nào cần data mà không sợ duplicate request — không cần lift fetch lên cha rồi prop-drill xuống.
- Hết request → memo xoá.

**2. Data Cache (opt-in từ Next 15):**
- Cache **persist qua nhiều request**, thậm chí qua deployment (tuỳ adapter).
- Điều khiển qua options:
  - `cache: 'force-cache'` — cache vĩnh viễn đến khi revalidate.
  - `cache: 'no-store'` — không cache, fetch mỗi request.
  - `next: { revalidate: 60 }` — cache, tự làm mới sau 60 giây (ISR).
  - `next: { tags: ['posts'] }` — gắn tag để invalidate on-demand bằng `revalidateTag()`.

**Thay đổi quan trọng giữa các version (interviewer rất hay hỏi):**

| Version  | Default của `fetch()`                          |
| -------- | ---------------------------------------------- |
| Next 14  | `force-cache` — **cache mặc định**             |
| Next 15  | **Không cache** (tương đương `no-store`)       |

Lý do Next 15 đổi: default cache gây quá nhiều bug "data cũ không hiểu vì sao" (accidental staleness). Triết lý mới: **explicit caching** — muốn cache phải khai báo.

Lưu ý ở Next 15:
- fetch không cache **không tự động** làm cả route thành dynamic (khác `no-store` explicit ở một số ngữ cảnh prerender) — route static vẫn có thể chạy fetch lúc build và "đóng băng" kết quả vào HTML. Muốn chắc chắn dynamic thì dùng `cache: 'no-store'` explicit hoặc dynamic API.
- GET Route Handler ở Next 15 cũng **không cache mặc định** (Next 14 thì có).

### Code minh hoạ

```typescript
// app/products/page.tsx — Next.js 15

export default async function ProductsPage() {
  // 1. Mặc định Next 15: KHÔNG cache (Next 14: cache vĩnh viễn)
  const fresh = await fetch("https://api.shop.com/products");

  // 2. Opt-in cache vĩnh viễn (default cũ của Next 14)
  const cached = await fetch("https://api.shop.com/categories", {
    cache: "force-cache",
  });

  // 3. ISR: cache + tự revalidate sau 1 giờ
  const products = await fetch("https://api.shop.com/products", {
    next: { revalidate: 3600 },
  });

  // 4. Tag để invalidate on-demand
  const featured = await fetch("https://api.shop.com/featured", {
    next: { tags: ["products", "featured"], revalidate: 3600 },
  });

  return <ProductList products={await products.json()} />;
}

// Request Memoization — tự động trong cùng render pass
async function Header() {
  // Cùng URL + options với fetch trong Footer → chỉ 1 request thật
  const config = await fetch("https://api.shop.com/config", {
    cache: "force-cache",
  }).then((r) => r.json());
  return <nav>{config.siteName}</nav>;
}

async function Footer() {
  const config = await fetch("https://api.shop.com/config", {
    cache: "force-cache",
  }).then((r) => r.json()); // Hit memoization — không gọi network lần 2
  return <footer>{config.copyright}</footer>;
}

// Invalidate tag từ Server Action
"use server";
import { revalidateTag } from "next/cache";

export async function updateProduct(id: string, data: FormData) {
  await db.product.update({ where: { id }, data: parse(data) });
  revalidateTag("products"); // Mọi fetch gắn tag 'products' bị purge
}
```

### Đáp án mẫu

> "Fetch trong App Router có 2 tầng. Tầng 1 là **Request Memoization** — tự động, trong cùng 1 render pass các fetch trùng URL và options chỉ chạy 1 lần, nên em gọi fetch ngay tại component cần data mà không sợ duplicate. Tầng 2 là **Data Cache** — persist qua request, điều khiển bằng options: `force-cache` cache vĩnh viễn, `next.revalidate` cho ISR, `next.tags` để invalidate on-demand. Điểm quan trọng nhất là **default đổi giữa version**: Next 14 fetch mặc định `force-cache`, Next 15 mặc định **không cache** — vì default cache gây quá nhiều bug stale data khó debug, nên Next chuyển sang triết lý explicit caching. GET Route Handler cũng vậy, Next 15 không cache mặc định. Khi migrate 14 lên 15, em phải audit lại toàn bộ fetch và thêm `force-cache` hoặc `revalidate` cho chỗ nào cần cache."

---

## Câu 28: `force-cache` và `no-store` khác nhau thế nào? `[Basic]`

### Câu hỏi

> Giải thích sự khác nhau giữa `cache: 'force-cache'` và `cache: 'no-store'` khi gọi fetch. Hai option này ảnh hưởng thế nào đến việc route được render static hay dynamic?

### Giải thích lý thuyết

Đây là 2 đầu đối lập của trục caching:

| Tiêu chí               | `force-cache`                              | `no-store`                                  |
| ---------------------- | ------------------------------------------ | ------------------------------------------- |
| Hành vi                | Lưu response vào **Data Cache** vĩnh viễn  | **Bỏ qua cache**, gọi origin mỗi request    |
| Lần fetch sau          | Trả từ cache (cache HIT)                   | Luôn gọi network (cache MISS chủ động)      |
| Cách làm mới data      | `revalidate` time-based hoặc on-demand     | Tự nhiên fresh mỗi request                  |
| Ảnh hưởng rendering    | Route có thể **static** (prerender)        | Route thành **dynamic** (render mỗi request)|
| Phù hợp với            | Data ít đổi: categories, config, blog post | Data per-user/realtime: giỏ hàng, dashboard |

Cơ chế quan trọng:
- `force-cache`: lần đầu fetch → lưu vào Data Cache → mọi request sau (của mọi user) đọc từ cache. Data chỉ đổi khi `revalidatePath`/`revalidateTag` hoặc redeploy (tuỳ cấu hình).
- `no-store`: opt-out hoàn toàn. Quan trọng: **một fetch `no-store` làm cả route segment thành dynamic** — Next.js không thể prerender HTML vì data phải fresh mỗi request. Tức là 1 dòng fetch có thể đổi behavior của cả trang.
- Request Memoization vẫn áp dụng cho cả hai trong cùng 1 render pass (dedupe trong 1 request vẫn xảy ra với GET).

Bối cảnh version:
- Next 14: không ghi gì = `force-cache`.
- Next 15: không ghi gì = không cache (gần như `no-store`, nhưng không ép route thành dynamic một cách tường minh như `no-store`). Vì vậy ở Next 15, viết explicit option giúp code tự document ý đồ.

Pitfall phỏng vấn: nhiều người nghĩ `no-store` chỉ ảnh hưởng 1 fetch — thực tế nó **lan ra cả route** (static → dynamic), kéo theo mất Full Route Cache, TTFB tăng.

### Code minh hoạ

```typescript
// app/blog/page.tsx
// ✅ force-cache: blog list ít đổi → route được prerender static
export default async function BlogPage() {
  const posts = await fetch("https://cms.example.com/posts", {
    cache: "force-cache", // Cache vĩnh viễn trong Data Cache
  }).then((r) => r.json());

  return <PostList posts={posts} />;
}
// Build xong → HTML static, mọi user nhận cùng 1 bản từ CDN

// app/dashboard/page.tsx
// no-store: số liệu realtime → route thành DYNAMIC
export default async function Dashboard() {
  const stats = await fetch("https://api.example.com/stats", {
    cache: "no-store", // Mỗi request gọi API mới
  }).then((r) => r.json());

  return <StatsView stats={stats} />;
}
// Chỉ 1 fetch no-store → CẢ trang render lại mỗi request

// Pattern trộn: phần static + phần dynamic stream qua Suspense
import { Suspense } from "react";

export default function HybridPage() {
  return (
    <>
      <StaticHero />          {/* Prerender được */}
      <Suspense fallback={<Skeleton />}>
        <LiveStats />          {/* Chứa fetch no-store, stream sau */}
      </Suspense>
    </>
  );
}

async function LiveStats() {
  const stats = await fetch("https://api.example.com/stats", {
    cache: "no-store",
  }).then((r) => r.json());
  return <StatsView stats={stats} />;
}

// Middle ground: không cần vĩnh viễn, không cần realtime → revalidate
const news = await fetch("https://api.example.com/news", {
  next: { revalidate: 300 }, // Cache nhưng làm mới mỗi 5 phút
});
```

### Đáp án mẫu

> "`force-cache` lưu response vào Data Cache và dùng lại cho mọi request sau — data chỉ đổi khi revalidate hoặc redeploy. `no-store` thì ngược lại: bỏ qua cache, gọi origin mỗi request. Điểm quan trọng nhất em luôn nhấn mạnh: hai option này **quyết định route static hay dynamic**. Route chỉ toàn `force-cache` thì Next prerender được thành HTML static, serve từ CDN cực nhanh. Nhưng chỉ cần **1 fetch `no-store`** là cả route segment thành dynamic, render lại mỗi request, mất Full Route Cache — một dòng code đổi behavior cả trang. Nên với data realtime em hay cô lập nó vào component riêng wrap `Suspense` để shell vẫn static. Ở Next 15 default là không cache, nên em viết explicit option để code tự nói lên ý đồ; còn case ở giữa — không cần realtime tuyệt đối — em dùng `next.revalidate` thay vì `no-store`."

---

## Câu 29: Revalidation trong Next.js là gì? `[Intermediate]`

### Câu hỏi

> Data đã nằm trong cache của Next.js thì làm sao để cập nhật? Trình bày các cơ chế revalidation và hành vi stale-while-revalidate.

### Giải thích lý thuyết

Revalidation = quá trình **purge Data Cache và fetch lại data mới**. Có 2 nhóm:

**1. Time-based revalidation:**
- Khai báo ở fetch: `next: { revalidate: 60 }`.
- Hoặc ở cấp route segment: `export const revalidate = 60` — áp cho cả segment (số nhỏ nhất giữa segment và fetch thắng).
- Phù hợp data đổi theo nhịp dự đoán được: tin tức, bảng giá, danh sách sản phẩm.

**2. On-demand revalidation:**
- `revalidatePath('/posts')` — purge cache theo đường dẫn.
- `revalidateTag('posts')` — purge mọi fetch gắn tag đó.
- Gọi trong **Server Action** hoặc **Route Handler** (không gọi được trong lúc render).
- Phù hợp khi biết chính xác thời điểm data đổi: sau mutation, webhook từ CMS.

**Hành vi stale-while-revalidate (SWR) của time-based — điểm hay bị hỏi xoáy:**

Với `revalidate: 60`:
1. Request đầu → fetch origin, lưu cache.
2. Trong 60s tiếp theo → mọi request trả cache (fresh).
3. Request đầu tiên **sau mốc 60s** → vẫn trả **data cũ (stale)** ngay lập tức, đồng thời **trigger fetch lại ở background**.
4. Fetch background xong → cache cập nhật → request tiếp theo nhận data mới.

Nghĩa là: `revalidate: 60` **không đảm bảo** data tối đa 60 giây tuổi — user đầu tiên sau khi hết hạn vẫn thấy data cũ. Đổi lại, **không user nào phải chờ** origin (trừ lần đầu tiên).

Khác biệt on-demand: `revalidatePath`/`revalidateTag` **purge ngay** — request tiếp theo chắc chắn fetch mới (user đó phải chờ origin).

Pitfall:
- `revalidate: 0` ≠ tắt cache mượt mà — nó tương đương dynamic.
- Time-based revalidation chỉ chạy khi **có traffic** — không có cron tự refresh ngầm.
- Lỗi khi background regenerate → Next giữ data cũ và thử lại lần sau (không làm sập trang).

### Code minh hoạ

```typescript
// 1. Time-based — ở từng fetch
// app/news/page.tsx
export default async function NewsPage() {
  const news = await fetch("https://api.example.com/news", {
    next: { revalidate: 300 }, // Làm mới mỗi 5 phút
  }).then((r) => r.json());
  return <NewsList items={news} />;
}

// 2. Time-based — cấp route segment (áp cho mọi fetch trong segment)
// app/products/page.tsx
export const revalidate = 3600; // Cả trang regenerate mỗi giờ

// 3. On-demand — trong Server Action sau mutation
// app/actions/post.ts
"use server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function publishPost(formData: FormData) {
  const post = await db.post.create({ data: parse(formData) });

  revalidateTag("posts");               // Purge mọi fetch tag 'posts'
  revalidatePath(`/posts/${post.slug}`); // Purge trang detail
}

// 4. On-demand — Route Handler nhận webhook từ CMS
// app/api/revalidate/route.ts
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== process.env.REVALIDATE_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { tag } = await req.json();
  revalidateTag(tag);
  return NextResponse.json({ revalidated: true, now: Date.now() });
}

// Timeline minh hoạ stale-while-revalidate với revalidate: 60
// t=0s   : request A → fetch origin (chậm), cache lưu
// t=30s  : request B → cache HIT, trả ngay (fresh)
// t=90s  : request C → cache STALE → trả data CŨ ngay lập tức
//          + background fetch origin
// t=91s  : request D → cache HIT data MỚI
```

### Đáp án mẫu

> "Revalidation là cách làm mới Data Cache, có 2 nhóm. **Time-based**: khai báo `next.revalidate` ở fetch hoặc `export const revalidate` cấp segment — phù hợp data đổi theo nhịp như tin tức. **On-demand**: `revalidatePath` và `revalidateTag` gọi trong Server Action hoặc Route Handler — phù hợp khi biết chính xác lúc data đổi, ví dụ sau mutation hoặc webhook CMS. Điểm em hay nhấn khi trả lời là hành vi **stale-while-revalidate** của time-based: hết hạn 60 giây thì request đầu tiên vẫn nhận data cũ ngay lập tức, Next regenerate ở background, request sau mới nhận data mới — nên `revalidate: 60` không đảm bảo data tối đa 60 giây tuổi, đổi lại không user nào phải chờ origin. Production em thường combine: time-based làm safety net, on-demand để update tức thì sau mutation."

---

## Câu 30: ISR (Incremental Static Regeneration) là gì? `[Intermediate]`

### Câu hỏi

> Trang e-commerce có 50.000 trang sản phẩm, giá thay đổi vài lần mỗi ngày. Build static toàn bộ thì build lâu và data cũ, SSR thì tốn server. ISR giải quyết bài toán này như thế nào?

### Giải thích lý thuyết

ISR = **static rendering + khả năng regenerate từng trang** sau khi deploy, không cần rebuild toàn site.

Ý tưởng: lấy ưu điểm của static (nhanh, rẻ, CDN-cacheable) nhưng khắc phục nhược điểm (data đóng băng lúc build, build lâu khi nhiều trang).

Cơ chế:
1. **Build time**: prerender một tập trang (qua `generateStaticParams`) — không cần đủ 50.000, chỉ cần top trang phổ biến.
2. **Runtime**: trang được serve static; sau khoảng `revalidate` giây, request tiếp theo trigger **regenerate ở background** (stale-while-revalidate — xem Câu 29).
3. **On-demand**: `revalidatePath`/`revalidateTag` regenerate ngay khi giá đổi.

**Fallback behavior với `dynamicParams` (quan trọng):**
- Trang **không nằm** trong `generateStaticParams` thì sao?
- `export const dynamicParams = true` (mặc định): request đầu tiên → render on-demand trên server (user chờ), kết quả **được cache lại như trang static** → các request sau nhanh như prerendered. Đây là "incremental" đúng nghĩa — site lớn dần theo traffic.
- `export const dynamicParams = false`: slug lạ → 404 ngay. Dùng khi tập trang là hữu hạn và đã biết trước.

Lợi ích với bài toán 50.000 sản phẩm:
- Build chỉ prerender ~1.000 trang hot → build nhanh.
- 49.000 trang còn lại generate lần đầu khi có người vào, rồi cache.
- Giá đổi → webhook gọi `revalidateTag('product-{id}')` → chỉ trang đó regenerate.

Pitfalls:
- ISR cần nơi lưu cache **share giữa các instance** — self-host nhiều node phải cấu hình cache handler chung (Redis/S3), không thì mỗi node một bản cache lệch nhau.
- `revalidate` chỉ chạy khi có traffic — trang không ai vào sẽ giữ bản cũ mãi (thường không sao).
- Data per-user (giá theo account) **không dùng ISR được** — cache share cho mọi user.

### Code minh hoạ

```typescript
// app/products/[slug]/page.tsx — Next.js 15

// 1. Prerender top 1000 sản phẩm hot lúc build
export async function generateStaticParams() {
  const hot = await db.product.findMany({
    orderBy: { views: "desc" },
    take: 1000,
    select: { slug: true },
  });
  return hot.map((p) => ({ slug: p.slug }));
}

// 2. Slug ngoài danh sách: render lần đầu on-demand rồi cache (mặc định)
export const dynamicParams = true;

// 3. Safety net: regenerate tối đa mỗi giờ
export const revalidate = 3600;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await fetch(`https://api.shop.com/products/${slug}`, {
    next: { tags: [`product-${slug}`], revalidate: 3600 },
  }).then((r) => {
    if (!r.ok) return null;
    return r.json();
  });

  if (!product) notFound();

  return (
    <article>
      <h1>{product.name}</h1>
      <Price value={product.price} />
    </article>
  );
}

// 4. Giá đổi → regenerate NGAY trang đó (on-demand ISR)
// app/api/webhooks/price/route.ts
import { revalidateTag } from "next/cache";

export async function POST(req: Request) {
  // ... verify webhook secret
  const { slug } = await req.json();
  revalidateTag(`product-${slug}`); // Chỉ 1 trang bị purge, 49.999 trang khác giữ nguyên
  return Response.json({ ok: true });
}

// So sánh nhanh:
// - Full static : build 50k trang ~ hàng giờ, giá cũ đến lần deploy sau
// - SSR         : mỗi view 1 lần render + query → tốn server, TTFB chậm
// - ISR         : build 1k trang, còn lại theo traffic, giá update theo webhook
```

### Đáp án mẫu

> "ISR là static rendering nhưng từng trang có thể **regenerate sau khi deploy** — theo thời gian với `revalidate` hoặc tức thì với `revalidatePath`/`revalidateTag` — không cần rebuild toàn site. Với 50.000 trang sản phẩm, em chỉ prerender khoảng 1.000 trang hot trong `generateStaticParams` cho build nhanh; phần còn lại nhờ `dynamicParams: true` mặc định — request đầu render on-demand rồi cache lại như static, site 'lớn dần' theo traffic, đó là chữ Incremental. Giá đổi thì webhook gọi `revalidateTag` theo từng sản phẩm, chỉ trang đó regenerate. Kết quả: tốc độ và chi phí của static, độ tươi gần như SSR. Em lưu ý hai giới hạn: cache ISR share cho mọi user nên data per-user không dùng được, và khi self-host nhiều instance phải cấu hình custom cache handler dùng Redis để các node share cache, không thì mỗi node một bản lệch nhau."

---

## Câu 31: `revalidatePath()` và `revalidateTag()` khác nhau thế nào? `[Intermediate]`

### Câu hỏi

> Next.js có hai API on-demand revalidation là `revalidatePath()` và `revalidateTag()`. Chúng khác nhau ở điểm gì và khi nào dùng cái nào?

### Giải thích lý thuyết

Cả hai đều purge cache on-demand, khác nhau ở **đơn vị invalidate**:

| Tiêu chí          | `revalidatePath(path)`                       | `revalidateTag(tag)`                              |
| ----------------- | -------------------------------------------- | ------------------------------------------------- |
| Invalidate theo   | **Đường dẫn** (route)                        | **Tag** gắn vào fetch lúc gọi                     |
| Phạm vi           | Mọi data của route đó                        | Mọi fetch (ở bất kỳ route nào) mang tag đó        |
| Cần chuẩn bị trước| Không — chỉ cần biết URL                     | Có — phải gắn `next: { tags: [...] }` khi fetch   |
| Mạnh khi          | Đổi data ảnh hưởng **1 trang cụ thể**        | Đổi 1 entity xuất hiện ở **nhiều trang**           |
| Granularity       | Thô (cả trang)                               | Mịn (đúng nhóm data)                              |

Cách hình dung:
- `revalidatePath` trả lời câu hỏi "**trang nào** cần mới?" — invalidate theo chiều route.
- `revalidateTag` trả lời "**data nào** đã đổi?" — invalidate theo chiều data, Next tự tìm mọi nơi dùng data đó.

Ví dụ: sửa 1 bài post xuất hiện ở trang detail, trang list, sidebar "bài mới", trang author:
- Dùng path: phải gọi `revalidatePath` 4 lần và phải **nhớ đủ** mọi trang — dễ sót khi thêm trang mới.
- Dùng tag: gắn `tags: ['post-123']` ở mọi fetch liên quan → 1 lệnh `revalidateTag('post-123')` cover hết, kể cả trang thêm sau này (miễn gắn đúng tag).

Lưu ý kỹ thuật:
- Cả hai chỉ gọi được ở **server**: Server Action hoặc Route Handler.
- Cả hai purge **Data Cache + Full Route Cache** của trang liên quan, và khiến **Router Cache** phía client được làm mới ở lần điều hướng/refresh tương ứng (gọi trong Server Action thì client đang mở cũng cập nhật).
- `revalidatePath` với dynamic route có 2 cách: truyền URL cụ thể `/posts/abc`, hoặc truyền pattern `revalidatePath('/posts/[slug]', 'page')` để purge mọi slug.
- Tag là chuỗi tự do → cần **naming convention** (`post-{id}`, `user-{id}-orders`) và kỷ luật gắn tag nhất quán.

### Code minh hoạ

```typescript
// Gắn tag lúc fetch — điều kiện tiên quyết để dùng revalidateTag
// app/posts/[slug]/page.tsx
export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = await fetch(`https://cms.io/posts/${slug}`, {
    next: { tags: ["posts", `post-${slug}`] }, // tag chung + tag riêng
  }).then((r) => r.json());
  return <Article post={post} />;
}

// app/page.tsx — sidebar bài mới, CŨNG gắn tag 'posts'
async function LatestPosts() {
  const latest = await fetch("https://cms.io/posts?limit=5", {
    next: { tags: ["posts"] },
  }).then((r) => r.json());
  return <Sidebar posts={latest} />;
}

// Server Action sau khi edit
"use server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function updatePost(slug: string, formData: FormData) {
  await db.post.update({ where: { slug }, data: parse(formData) });

  // ✅ Cách 1: TAG — 1 lệnh, mọi nơi dùng data này đều fresh
  revalidateTag(`post-${slug}`); // trang detail
  revalidateTag("posts");        // list, sidebar, trang author...

  // Cách 2: PATH — phải liệt kê đủ trang, dễ sót
  // revalidatePath(`/posts/${slug}`);
  // revalidatePath("/posts");
  // revalidatePath("/");               // sidebar ở homepage
  // revalidatePath(`/authors/${authorId}`); // quên là bug!
}

// revalidatePath với dynamic route — 2 dạng
revalidatePath("/posts/my-first-post");    // 1 URL cụ thể
revalidatePath("/posts/[slug]", "page");   // MỌI slug của route này

// Khi revalidatePath hợp lý: data chỉ hiện đúng 1 trang
export async function updateAboutPage(formData: FormData) {
  await db.page.update({ where: { slug: "about" }, data: parse(formData) });
  revalidatePath("/about"); // Đơn giản, đủ dùng — không cần bày tag
}
```

### Đáp án mẫu

> "Khác nhau ở **đơn vị invalidate**. `revalidatePath` purge theo **đường dẫn** — em chỉ cần biết URL, không cần chuẩn bị gì trước, nhưng phải tự liệt kê đủ mọi trang bị ảnh hưởng. `revalidateTag` purge theo **tag** gắn vào fetch từ trước — invalidate theo chiều data: em nói 'data này đã đổi' và Next tự làm mới mọi nơi dùng nó. Quy tắc chọn của em: data chỉ xuất hiện ở **1 trang** thì dùng path cho đơn giản, ví dụ trang About; data là **entity xuất hiện nhiều nơi** — post hiện ở detail, list, sidebar — thì dùng tag, vì 1 lệnh `revalidateTag('post-123')` cover hết kể cả trang thêm sau này, còn path thì dễ sót khi codebase lớn lên. Trade-off của tag là phải có naming convention và kỷ luật gắn tag nhất quán khi fetch. Cả hai đều chỉ gọi được trong Server Action hoặc Route Handler."

---

## Câu 48: Sau một mutation, chọn `revalidatePath` hay `revalidateTag` — chiến lược thực tế? `[Advanced]`

### Câu hỏi

> Trong app thực tế, user sửa tên một sản phẩm. Sản phẩm đó xuất hiện ở trang detail, trang danh sách, sidebar "best sellers" trong layout, và trang admin. Anh thiết kế chiến lược revalidation sau mutation như thế nào? Có pitfall gì cần tránh?

### Giải thích lý thuyết

Đây là bài toán **cache invalidation theo entity** — đào sâu Câu 31 ở góc thực chiến.

**Chiến lược: tag theo entity, path cho trường hợp đặc biệt.**

1. **Thiết kế tag hierarchy theo entity:**
   - Tag riêng: `product-{id}` — gắn ở mọi fetch lấy đúng sản phẩm đó.
   - Tag collection: `products` — gắn ở list, sidebar, search.
   - Mutation 1 sản phẩm → `revalidateTag('product-{id}')` + `revalidateTag('products')` → detail + list + sidebar + admin đều fresh, **không cần biết** có bao nhiêu trang đang dùng.
   - Đây là điểm thắng quyết định: thêm trang mới dùng data này chỉ cần gắn đúng tag, **không phải sửa code mutation**.

2. **`revalidatePath` và 2 mode `'page'` / `'layout'`:**
   - `revalidatePath('/products/[slug]', 'page')` — purge mọi URL khớp route đó.
   - `revalidatePath('/products', 'layout')` — purge route + **mọi segment con** bên dưới layout đó.
   - Mode `'layout'` hữu ích khi data nằm trong layout (sidebar best-sellers) — vì layout share cho nhiều trang.

3. **Pitfalls thực tế:**
   - **Pitfall 1 — revalidatePath với dynamic route truyền sai dạng**: `revalidatePath('/products/[slug]')` mà quên tham số `'page'` sẽ không hoạt động như mong đợi; ngược lại truyền URL literal `/products/ao-thun` thì chỉ purge đúng 1 slug. Phải chọn đúng dạng cho đúng ý đồ.
   - **Pitfall 2 — quên data trong layout**: purge page nhưng sidebar nằm ở layout vẫn stale → cần tag hoặc `'layout'` mode.
   - **Pitfall 3 — chỉ fetch mới có tag**: DB query qua Prisma không gắn tag được trực tiếp — phải wrap bằng `unstable_cache(fn, keys, { tags })` (hoặc `'use cache'` + `cacheTag` ở canary) thì `revalidateTag` mới có tác dụng.
   - **Pitfall 4 — revalidate quá rộng**: `revalidatePath('/', 'layout')` purge cả site — "giết ruồi bằng búa tạ", cache hit rate sập sau mỗi mutation.

4. **Gọi ở Server Action vs Route Handler — khác biệt tinh tế:**
   - Trong **Server Action**: ngoài purge server cache, Next còn **làm mới Router Cache của client đang thực hiện action** — UI cập nhật ngay trong cùng round-trip, không cần `router.refresh()`.
   - Trong **Route Handler** (webhook): chỉ purge server cache; client nào đang mở trang sẽ thấy data mới ở lần navigation/refresh sau. Webhook từ CMS thì điều này chấp nhận được.

### Code minh hoạ

```typescript
// lib/data/products.ts — wrap DB query để có tag (DB query không phải fetch!)
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

export const getProduct = (id: string) =>
  unstable_cache(
    () => db.product.findUnique({ where: { id } }),
    [`product-${id}`],                       // cache key
    { tags: [`product-${id}`, "products"] }  // tags để revalidateTag hoạt động
  )();

export const getBestSellers = unstable_cache(
  () => db.product.findMany({ orderBy: { sold: "desc" }, take: 5 }),
  ["best-sellers"],
  { tags: ["products"] } // sidebar cũng theo tag collection
);

// app/products/layout.tsx — sidebar trong LAYOUT (share nhiều trang)
export default async function ProductsLayout({ children }) {
  const best = await getBestSellers();
  return (
    <div>
      <BestSellerSidebar items={best} />
      {children}
    </div>
  );
}

// app/actions/product.ts — Server Action: chiến lược tag-first
"use server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function renameProduct(id: string, formData: FormData) {
  await db.product.update({
    where: { id },
    data: { name: String(formData.get("name")) },
  });

  // ✅ Tag theo entity: detail + list + sidebar + admin — 2 dòng cover hết
  revalidateTag(`product-${id}`);
  revalidateTag("products");
  // Bonus: gọi trong Server Action → Router Cache client cũng được
  // làm mới ngay, UI cập nhật không cần router.refresh()
}

// ❌ Pitfall: dùng path mà sai dạng / sót trang
export async function renameProductBad(id: string, slug: string) {
  await db.product.update({ where: { id }, data: {/* ... */} });

  revalidatePath("/products/[slug]");        // SAI: thiếu 'page' mode
  revalidatePath(`/products/${slug}`);        // chỉ 1 trang, sót list/sidebar/admin
  // revalidatePath("/", "layout");           // quá rộng: purge CẢ SITE
}

// ✅ Path 'layout' mode khi cần purge cả cây segment
revalidatePath("/products", "layout"); // /products + mọi trang con

// Route Handler (webhook CMS) — chỉ purge server cache
// app/api/webhooks/cms/route.ts
export async function POST(req: Request) {
  // ...verify secret
  const { productId } = await req.json();
  revalidateTag(`product-${productId}`);
  revalidateTag("products");
  return Response.json({ ok: true });
  // Client đang mở trang: thấy data mới ở lần navigate/refresh sau
}
```

### Đáp án mẫu

> "Chiến lược của em là **tag-first theo entity**. Mỗi sản phẩm có tag riêng `product-{id}` và tag collection `products`; mutation chỉ cần `revalidateTag` 2 dòng là detail, list, sidebar, admin đều fresh — và khi sau này thêm trang mới dùng data đó, em chỉ gắn tag lúc fetch chứ không phải sửa code mutation. Vì sidebar nằm trong layout và data lấy từ Prisma chứ không phải fetch, em wrap query bằng `unstable_cache` kèm tags — đây là pitfall nhiều người dính: DB query không gắn tag thì `revalidateTag` vô tác dụng. `revalidatePath` em để cho trang đơn lẻ, và phải dùng đúng dạng: URL literal cho 1 trang, `('/products/[slug]', 'page')` cho mọi slug, `'layout'` mode khi cần purge cả cây — tuyệt đối tránh `revalidatePath('/', 'layout')` vì nó purge cả site. Cuối cùng, em ưu tiên gọi trong Server Action vì nó làm mới luôn Router Cache phía client trong cùng round-trip; webhook qua Route Handler thì chỉ purge server cache, client thấy data mới ở lần điều hướng sau."

---

## Câu 54: Route Segment Config là gì? `[Advanced]`

### Câu hỏi

> Em thấy đầu file `page.tsx` có các dòng như `export const dynamic = 'force-dynamic'` hay `export const revalidate = 60`. Route Segment Config gồm những option nào và chúng tương tác với fetch options ra sao?

### Giải thích lý thuyết

Route Segment Config là các **export const đặc biệt** ở đầu `page.tsx` / `layout.tsx` / `route.ts`, dùng để **override behavior của cả segment** thay vì cấu hình từng fetch. Giá trị phải là hằng số phân tích tĩnh được (không tính toán runtime).

**Các option chính:**

| Option           | Giá trị                                            | Tác dụng                                                                 |
| ---------------- | -------------------------------------------------- | ------------------------------------------------------------------------ |
| `dynamic`        | `'auto'` \| `'force-dynamic'` \| `'force-static'` \| `'error'` | Ép chế độ render của segment                                  |
| `revalidate`     | `false` \| `0` \| `number`                          | Thời gian revalidate mặc định cho cả segment                             |
| `fetchCache`     | `'auto'` \| `'force-cache'` \| `'force-no-store'` \| `'default-cache'` \| `'default-no-store'`... | Override cache default của mọi fetch trong segment |
| `runtime`        | `'nodejs'` (default) \| `'edge'`                    | Môi trường thực thi                                                      |
| `dynamicParams`  | `true` (default) \| `false`                         | Slug ngoài `generateStaticParams`: render on-demand hay 404              |

**Chi tiết `dynamic`:**
- `'auto'` (mặc định): Next tự infer — dùng dynamic API (`cookies()`, `headers()`...) hoặc fetch `no-store` thì dynamic.
- `'force-dynamic'`: luôn render mỗi request (tương đương SSR truyền thống).
- `'force-static'`: ép static — `cookies()`/`headers()`/`searchParams` trả giá trị rỗng thay vì làm trang dynamic.
- `'error'`: ép static và **throw lỗi lúc build** nếu có code dùng dynamic API — dùng làm "chốt chặn" cho trang bắt buộc static.

**Chi tiết `revalidate` (segment-level):**
- `false`: cache vô hạn (mặc định cho static).
- `0`: luôn dynamic.
- `number`: ISR cho cả segment.
- **Thứ tự ưu tiên với fetch options**: revalidate **thấp nhất** thắng — segment `revalidate = 3600` nhưng 1 fetch `revalidate: 60` → cả route đi theo nhịp 60s. Ngược lại fetch không khai báo gì sẽ "thừa hưởng" giá trị của segment.

**Chi tiết `fetchCache`:** ít dùng, là "cây gậy lớn" override default của mọi fetch trong segment — hữu ích khi migrate Next 14 → 15 muốn giữ behavior cũ (`fetchCache = 'default-cache'`) mà chưa kịp sửa từng fetch.

Pitfalls:
- Config đặt ở **layout** ảnh hưởng mọi page con — `force-dynamic` ở root layout giết static toàn site.
- `force-static` không làm data per-user "tự đúng" — `cookies()` trả rỗng, dễ tạo bug logic âm thầm thay vì lỗi rõ ràng.
- `runtime = 'edge'` không hỗ trợ đầy đủ Node API (Prisma engine cũ, fs...) — đổi runtime phải kiểm tra dependency.

### Code minh hoạ

```typescript
// app/dashboard/page.tsx
// Trang dashboard per-user: luôn render mỗi request
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const stats = await fetch("https://api.io/stats").then((r) => r.json());
  return <Stats data={stats} />;
}

// app/blog/[slug]/page.tsx
// Trang blog: ISR cả segment + chặn slug lạ
export const revalidate = 3600;       // mặc định cho mọi fetch trong segment
export const dynamicParams = false;   // slug ngoài generateStaticParams → 404

export async function generateStaticParams() {
  const posts = await getAllSlugs();
  return posts.map((slug) => ({ slug }));
}

export default async function Post({ params }) {
  const { slug } = await params;
  // Fetch này không khai báo revalidate → thừa hưởng 3600 từ segment
  const post = await fetch(`https://cms.io/posts/${slug}`).then((r) => r.json());

  // Fetch này khai báo 60 → giá trị THẤP NHẤT thắng,
  // effective revalidate của cả route = 60
  const related = await fetch(`https://cms.io/related/${slug}`, {
    next: { revalidate: 60 },
  }).then((r) => r.json());

  return <Article post={post} related={related} />;
}

// app/pricing/page.tsx
// Chốt chặn: trang pricing BẮT BUỘC static — ai thêm cookies() là build FAIL
export const dynamic = "error";

// app/legacy/layout.tsx
// Migrate Next 14 → 15: giữ default cache cũ cho cả nhánh /legacy
export const fetchCache = "default-cache";

// app/api/geo/route.ts
// Route Handler chạy Edge runtime (gần user, cold start thấp)
export const runtime = "edge";

export async function GET(req: Request) {
  return Response.json({ region: process.env.VERCEL_REGION });
}

// ❌ Pitfall: force-dynamic ở ROOT layout → cả site mất static
// app/layout.tsx
// export const dynamic = "force-dynamic"; // ĐỪNG làm thế nếu không chủ đích
```

### Đáp án mẫu

> "Route Segment Config là các `export const` đặc biệt ở đầu page, layout hoặc route handler để **điều khiển behavior cả segment** thay vì từng fetch. Quan trọng nhất là `dynamic` với 4 giá trị: `auto` để Next tự infer, `force-dynamic` ép render mỗi request, `force-static` ép static — lúc đó `cookies()` trả rỗng — và `error` em rất thích cho trang bắt buộc static vì nó **fail ngay lúc build** nếu ai vô tình thêm dynamic API. Ngoài ra có `revalidate` cấp segment, `fetchCache` override default mọi fetch — tiện khi migrate 14 lên 15 — `runtime` chọn nodejs hay edge, và `dynamicParams` quyết định slug lạ được render on-demand hay 404. Về thứ tự ưu tiên với fetch options: revalidate **thấp nhất thắng** — segment 3600 nhưng một fetch khai báo 60 thì cả route theo nhịp 60 giây. Pitfall em luôn cảnh báo: đặt `force-dynamic` ở layout cao sẽ giết static của mọi trang con."

---

## Câu 55: Next.js có những loại cache nào? `[Advanced]`

### Câu hỏi

> Đây là câu kinh điển: liệt kê và phân biệt các lớp cache trong Next.js App Router — mỗi lớp lưu ở đâu, sống bao lâu, và invalidate bằng cách nào?

### Giải thích lý thuyết

Next.js có **4 lớp cache**, là nguồn gốc của đa số sự "khó hiểu" về caching. Nắm bảng này là trả lời được hầu hết câu hỏi cache:

| Lớp cache               | Nơi lưu  | Cache cái gì                       | Thời gian sống                  | Cách invalidate                                        |
| ----------------------- | -------- | ---------------------------------- | ------------------------------- | ------------------------------------------------------ |
| **Request Memoization** | Server   | Return value của fetch (GET)       | **1 render pass** (1 request)   | Tự xoá khi render xong (không cần invalidate)          |
| **Data Cache**          | Server   | Response của fetch / unstable_cache| **Persist** qua request & deploy| `revalidatePath` / `revalidateTag` / `revalidate` time |
| **Full Route Cache**    | Server   | HTML + RSC payload của route static| Persist, **xoá khi redeploy**   | Revalidate Data Cache của route, hoặc redeploy         |
| **Router Cache**        | **Client** (memory) | RSC payload theo segment | Phiên duyệt; theo staleTime     | `router.refresh()`, Server Action revalidate, hết staleTime |

**Đi từng lớp:**

1. **Request Memoization** — của React: cùng fetch (URL + options) trong 1 render pass chỉ chạy 1 lần. Mục đích: gọi data ngay tại component cần, không phải prop-drill. Hết request là hết — không bao giờ gây stale.

2. **Data Cache** — của Next: lưu response fetch trên server, share mọi user, sống qua request và qua deploy. Đây là lớp điều khiển bằng `cache`, `next.revalidate`, `next.tags` (Câu 27-29). Next 15: **opt-in**.

3. **Full Route Cache** — kết quả prerender của route static: HTML (cho first visit) + RSC payload (cho navigation). Tạo lúc build hoặc lúc ISR regenerate. Route dynamic **bỏ qua** lớp này. Khi Data Cache của route bị revalidate → Full Route Cache cũng được regenerate. Redeploy là xoá.

4. **Router Cache (client-side)** — lưu RSC payload trong memory của browser, giúp Back/Forward và navigate qua lại **tức thì** không gọi server. **Thay đổi lớn ở Next 15**: `staleTime` mặc định cho page segment là **0** (Next 14 là 30s với dynamic / 5 phút với static) — nghĩa là navigate sang trang đã thăm vẫn lấy data mới từ server; chỉ Back/Forward và layout/loading vẫn dùng cache. Lý do đổi: dev kêu ca data stale 30 giây sau mutation mà không hiểu vì sao. Có thể chỉnh lại qua `experimental.staleTimes` trong `next.config`.

**Chuỗi liên hệ khi revalidate:** `revalidateTag` → purge **Data Cache** → **Full Route Cache** của các route liên quan regenerate ở lần request sau → nếu gọi trong Server Action, **Router Cache** client cũng được làm mới. Request Memoization đứng ngoài — nó chỉ sống trong 1 render.

Pitfall phỏng vấn: nhầm Router Cache (client) với Full Route Cache (server) — tên giống nhau nhưng một cái ở browser memory, một cái ở server/filesystem.

### Code minh hoạ

```typescript
// Lớp 1: Request Memoization — trong 1 render pass
async function CompA() {
  const cfg = await fetch("https://api.io/config").then((r) => r.json()); // gọi thật
  return <div>{cfg.name}</div>;
}
async function CompB() {
  const cfg = await fetch("https://api.io/config").then((r) => r.json()); // hit memo
  return <div>{cfg.theme}</div>;
}

// Lớp 2: Data Cache — persist qua request, share mọi user
const posts = await fetch("https://cms.io/posts", {
  next: { revalidate: 3600, tags: ["posts"] }, // sống 1h hoặc đến khi revalidateTag
});

// Lớp 3: Full Route Cache — route static được prerender HTML + RSC payload
// app/blog/page.tsx (không dynamic API, fetch có cache) → vào Full Route Cache
export const revalidate = 3600;
export default async function Blog() {
  const posts = await fetch("https://cms.io/posts", {
    next: { tags: ["posts"] },
  }).then((r) => r.json());
  return <PostList posts={posts} />;
}
// revalidateTag('posts') → purge Data Cache → route này regenerate lần request sau

// Lớp 4: Router Cache — client-side
"use client";
import { useRouter } from "next/navigation";

function RefreshButton() {
  const router = useRouter();
  // Xoá Router Cache + re-fetch RSC payload cho route hiện tại
  return <button onClick={() => router.refresh()}>Làm mới</button>;
}

// Next 15: chỉnh lại staleTime nếu muốn behavior giống Next 14
// next.config.ts
const nextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 30, // Next 15 default: 0 — navigate luôn lấy mới
      static: 180, // default: 5 phút
    },
  },
};

// Server Action: revalidate xuyên 3 lớp server + client
"use server";
import { revalidateTag } from "next/cache";
export async function addPost(formData: FormData) {
  await db.post.create({ data: parse(formData) });
  revalidateTag("posts");
  // Data Cache purge → Full Route Cache regenerate
  // → Router Cache của client gọi action cũng được làm mới
}
```

### Đáp án mẫu

> "Next.js có 4 lớp cache. Một, **Request Memoization** — server, dedupe fetch trùng trong 1 render pass, tự xoá khi render xong, không bao giờ gây stale. Hai, **Data Cache** — server, lưu response fetch persist qua request và deploy, điều khiển bằng `revalidate`, `tags`, invalidate bằng `revalidatePath`/`revalidateTag`. Ba, **Full Route Cache** — server, lưu HTML và RSC payload của route static từ lúc build hoặc ISR, xoá khi redeploy hoặc khi Data Cache của route bị revalidate; route dynamic bỏ qua lớp này. Bốn, **Router Cache** — nằm ở **client**, lưu RSC payload trong memory để Back/Forward và navigation tức thì. Điểm Next 15 thay đổi mà interviewer hay hỏi: staleTime của page segment mặc định về **0** — Next 14 là 30 giây nên hay bị kêu 'mutate xong navigate lại vẫn thấy data cũ'; giờ navigate luôn lấy mới, muốn behavior cũ thì chỉnh `experimental.staleTimes`. Em cũng luôn phân biệt rõ Router Cache ở browser với Full Route Cache ở server — tên giống nhau nhưng là hai thứ khác hẳn."

---

## Câu 66: Parallel và sequential data fetching khác nhau thế nào? `[Intermediate]`

### Câu hỏi

> Trang profile cần 3 nguồn data: thông tin user, danh sách bài viết, và thống kê. Em viết 3 dòng `await` liên tiếp thì trang chậm. Giải thích vấn đề waterfall và cách fetch song song. Khi nào sequential là bắt buộc?

### Giải thích lý thuyết

**Sequential fetching (waterfall):** các request chạy **nối đuôi** — request sau chỉ bắt đầu khi request trước xong. 3 request × 300ms = **900ms**.

**Parallel fetching:** các request **khởi động cùng lúc** — tổng thời gian = request chậm nhất = **300ms**.

Nguyên nhân waterfall phổ biến:

1. **`await` tuần tự trong cùng function** — lỗi dễ thấy nhất:
   ```
   const user = await getUser();    // 300ms
   const posts = await getPosts();  // chờ xong mới chạy → +300ms
   ```
   `await` chặn dòng code phía dưới, dù 2 request không phụ thuộc nhau.

2. **Waterfall ngầm qua cây component cha–con** — khó thấy hơn: component con chỉ bắt đầu render (và fetch) **sau khi cha render xong**. Cha `await getUser()` rồi mới render con, con lại `await getPosts()` → waterfall dù mỗi component nhìn riêng đều "sạch".

**Các pattern fix:**

- **`Promise.all` / `Promise.allSettled`**: khởi động đồng thời, chờ tất cả. Lưu ý `Promise.all` fail-fast — 1 promise reject là reject hết; cần partial success thì dùng `allSettled`.
- **Khởi tạo promise sớm, await sau**: gọi function (không await) để request bắt đầu chạy, await ở chỗ thực sự cần kết quả — linh hoạt hơn `Promise.all` khi các phần dùng data ở vị trí khác nhau.
- **Truyền promise xuống con + Suspense / `use()`**: cha khởi động fetch, truyền promise (không await) xuống Client Component, con `use(promise)` — fetch chạy song song với render phần khác, kết quả stream xuống.
- **Preload pattern**: export hàm `preload()` gọi sớm ở cha để "hâm nóng" request memoization, con gọi lại sẽ hit memo — phá waterfall cha–con mà không phải truyền props.

**Khi nào sequential là bắt buộc:** khi request sau **phụ thuộc kết quả** request trước — ví dụ cần `user.teamId` mới fetch được team. Lúc đó waterfall là bản chất bài toán, không phải bug. Giảm đau bằng: gộp ở backend (1 endpoint trả đủ), hoặc bọc phần phụ thuộc trong `Suspense` để phần còn lại của trang không bị chặn.

### Code minh hoạ

```typescript
// ❌ Sequential không cần thiết — 3 request độc lập nhưng nối đuôi: ~900ms
export default async function ProfilePageBad({ params }) {
  const { id } = await params;
  const user = await getUser(id);      // 300ms
  const posts = await getPosts(id);    // 300ms — chỉ chạy sau khi user xong
  const stats = await getStats(id);    // 300ms — chạy cuối cùng
  return <Profile user={user} posts={posts} stats={stats} />;
}

// ✅ Parallel với Promise.all — ~300ms (bằng request chậm nhất)
export default async function ProfilePage({ params }) {
  const { id } = await params;
  const [user, posts, stats] = await Promise.all([
    getUser(id),
    getPosts(id),
    getStats(id),
  ]);
  return <Profile user={user} posts={posts} stats={stats} />;
}

// ✅ Khởi tạo promise sớm — await sau, linh hoạt hơn
export default async function ProfilePage2({ params }) {
  const { id } = await params;
  const postsPromise = getPosts(id); // Bắt đầu chạy NGAY (không await)
  const statsPromise = getStats(id); // Chạy song song

  const user = await getUser(id);    // Trong lúc này 2 request kia vẫn chạy
  if (!user) notFound();             // Logic phụ thuộc user vẫn viết được

  return (
    <>
      <Header user={user} />
      {/* Truyền promise xuống, con tự await/use → stream */}
      <Suspense fallback={<PostsSkeleton />}>
        <Posts postsPromise={postsPromise} />
      </Suspense>
      <Suspense fallback={<StatsSkeleton />}>
        <Stats statsPromise={statsPromise} />
      </Suspense>
    </>
  );
}

// Client Component nhận promise — React 19 use()
"use client";
import { use } from "react";
function Posts({ postsPromise }: { postsPromise: Promise<Post[]> }) {
  const posts = use(postsPromise); // Suspend đến khi resolve
  return <PostList posts={posts} />;
}

// ✅ Preload pattern — phá waterfall cha–con ngầm
// lib/data/team.ts
import { cache } from "react";
export const getTeam = cache(async (id: string) => db.team.findUnique({ where: { id } }));
export function preloadTeam(id: string) {
  void getTeam(id); // Hâm nóng memo, không chờ kết quả
}

// Cha: kích hoạt fetch của con TRƯỚC khi con render
export default async function Page({ params }) {
  const { id } = await params;
  preloadTeam(id);              // Team bắt đầu fetch ngay
  const user = await getUser(id); // Song song với getTeam
  return <TeamSection teamId={id} />; // Con gọi getTeam(id) → hit memo
}

// ⚠️ Sequential BẮT BUỘC: request sau cần kết quả request trước
export default async function TeamPage({ params }) {
  const { id } = await params;
  const user = await getUser(id);
  const team = await getTeam(user.teamId); // Cần user.teamId → không song song được
  return <TeamView team={team} />;
}
```

### Đáp án mẫu

> "Sequential là các request chạy nối đuôi — 3 dòng `await` liên tiếp với request 300ms thì trang mất 900ms; parallel là khởi động cùng lúc, tổng thời gian bằng request chậm nhất. Fix cơ bản là `Promise.all`, nhưng em hay dùng pattern linh hoạt hơn: **khởi tạo promise sớm rồi await sau** — gọi function không await để request bắt đầu chạy, await ở đúng chỗ cần kết quả, hoặc truyền thẳng promise xuống Client Component dùng `use()` kết hợp Suspense để stream. Cái khó thấy hơn là **waterfall ngầm cha–con**: con chỉ fetch sau khi cha render xong — em phá bằng preload pattern: export hàm `preload()` gọi ở cha để hâm nóng `cache()` memo, con gọi lại là hit memo ngay. Sequential chỉ bắt buộc khi request sau **phụ thuộc kết quả** request trước, ví dụ cần `user.teamId` mới fetch được team — lúc đó em gộp ở backend thành 1 query hoặc bọc Suspense để phần đó không chặn cả trang."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                       | Đúng là                                                                          |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| "fetch trong Next 15 mặc định được cache"                     | Next 15 mặc định **không cache** — đó là default của Next 14                      |
| "React cache() persist qua request"                           | Chỉ sống trong 1 render pass; persist là `unstable_cache`/`'use cache'`           |
| "revalidate: 60 đảm bảo data tối đa 60 giây tuổi"             | Stale-while-revalidate: request đầu sau hết hạn vẫn nhận data cũ                  |
| "revalidateTag hoạt động với mọi DB query"                    | Chỉ với fetch có tags hoặc query wrap `unstable_cache` kèm tags                   |
| "Router Cache và Full Route Cache là một"                     | Router Cache ở **client memory**, Full Route Cache ở **server**                   |
| "Next 15 navigate vẫn dính cache 30 giây như Next 14"         | staleTime page segment mặc định = 0 ở Next 15                                     |
| "Cứ await lần lượt, React tự tối ưu song song"                | `await` tuần tự tạo waterfall — phải Promise.all / preload / truyền promise       |
