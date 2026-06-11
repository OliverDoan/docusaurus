---
sidebar_position: 1
title: "1. Routing & Layouts"
---

# Routing & Layouts

> *App Router là trái tim của Next.js hiện đại. Interviewer hỏi routing không phải để xem bạn thuộc file convention — mà để xem bạn hiểu cách Next.js tổ chức UI thành cây segment, và tận dụng nó để build app nhanh, ít bug.*

---

## Câu 1: File-based routing trong Next.js App Router hoạt động như thế nào? `[Basic]`

### Câu hỏi

> File-based routing trong Next.js App Router hoạt động như thế nào? Kể các file convention quan trọng và vai trò của chúng.

### Giải thích lý thuyết

Trong App Router, **mỗi folder trong `app/` là một route segment** — URL được map trực tiếp từ cấu trúc thư mục. Nhưng folder **chỉ trở thành route public khi có file `page.tsx`** (hoặc `route.ts` cho API). Folder không có `page.tsx` chỉ là segment trung gian để chia layout/tổ chức code.

Các **file convention** quan trọng (Next.js tự nhận diện theo tên file):

| File            | Vai trò                                                        |
| --------------- | -------------------------------------------------------------- |
| `page.tsx`      | UI của route, làm segment thành public URL                     |
| `layout.tsx`    | UI bọc ngoài, **persist** khi navigate, nhận `children`        |
| `loading.tsx`   | Loading UI — tự động wrap page trong Suspense boundary         |
| `error.tsx`     | Error Boundary cho segment (phải là Client Component)          |
| `not-found.tsx` | UI 404 cho segment, kích hoạt bởi `notFound()`                 |
| `route.ts`      | API endpoint (Route Handler) — không được tồn tại cùng `page`  |
| `template.tsx`  | Giống layout nhưng **re-mount** mỗi lần navigate (reset state) |

Ngoài ra có 2 cơ chế tổ chức code mà interviewer hay đào sâu:

- **Route groups `(group)`**: folder bọc trong ngoặc đơn **không xuất hiện trong URL**. Dùng để chia app thành nhóm có layout riêng — ví dụ `(marketing)` và `(dashboard)` cùng cấp nhưng layout khác nhau.
- **Private folder `_folder`**: prefix underscore loại folder và toàn bộ con của nó khỏi routing — dùng chứa components, utils.
- **Colocation**: vì chỉ `page.tsx`/`route.ts` mới public, bạn có thể đặt component, test, style **ngay cạnh route dùng nó** mà không sợ lộ thành URL. Đây là điểm khác lớn so với Pages Router (mọi file trong `pages/` đều thành route).

**Insight phỏng vấn**: câu này interviewer muốn nghe bạn phân biệt được "folder = segment" vs "page.tsx = route public", và biết route groups + colocation — chứng tỏ đã tổ chức project thật chứ không chỉ làm tutorial.

### Code minh hoạ

```text
app/
├── layout.tsx              # Root layout (bắt buộc, có <html><body>)
├── page.tsx                # → /
├── (marketing)/            # Route group — KHÔNG vào URL
│   ├── layout.tsx          # Layout riêng cho nhóm marketing
│   ├── about/page.tsx      # → /about (không phải /marketing/about)
│   └── pricing/page.tsx    # → /pricing
├── (shop)/
│   ├── layout.tsx          # Layout riêng cho nhóm shop
│   └── products/
│       ├── page.tsx        # → /products
│       ├── loading.tsx     # Suspense fallback cho /products
│       ├── error.tsx       # Error boundary cho /products
│       └── _components/    # Private — không bao giờ thành route
│           └── ProductCard.tsx
├── dashboard/
│   └── settings/page.tsx   # → /dashboard/settings
│                           # (dashboard không có page.tsx → /dashboard là 404)
└── api/
    └── orders/route.ts     # → API endpoint /api/orders
```

```tsx
// app/(shop)/products/page.tsx — Server Component mặc định
// Colocation: import component ngay cạnh, không qua src/components chung
import { ProductCard } from "./_components/ProductCard";

export default async function ProductsPage() {
  const products = await fetchProducts(); // fetch trực tiếp ở server
  return (
    <ul>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </ul>
  );
}
```

### Đáp án mẫu

> "Trong App Router, mỗi folder trong `app/` là một route segment, URL map theo cấu trúc thư mục — nhưng folder chỉ thành route public khi có `page.tsx`. Next.js dùng file convention: `layout.tsx` bọc UI và persist khi navigate, `loading.tsx` tự wrap page trong Suspense, `error.tsx` là Error Boundary, `not-found.tsx` cho 404, `route.ts` cho API, `template.tsx` giống layout nhưng re-mount mỗi navigation. Em hay dùng route groups `(group)` để chia app thành nhóm có layout riêng mà không ảnh hưởng URL — ví dụ `(marketing)` và `(dashboard)`. Private folder `_folder` thì loại khỏi routing. Điểm em thích nhất là colocation: vì chỉ `page.tsx` mới public nên em đặt component, test ngay cạnh route dùng nó — code theo feature, không bị phân mảnh như Pages Router."

---

## Câu 11: App Router khác Pages Router trong Next.js như thế nào? `[Basic]`

### Câu hỏi

> App Router khác Pages Router trong Next.js như thế nào? Nêu các khác biệt chính về kiến trúc, data fetching và file convention.

### Giải thích lý thuyết

Đây là 2 hệ thống routing **tồn tại song song** trong Next.js (có thể dùng cùng lúc khi migrate dần). Khác biệt cốt lõi:

| Khía cạnh         | Pages Router (`pages/`)                                  | App Router (`app/`)                                              |
| ----------------- | -------------------------------------------------------- | ---------------------------------------------------------------- |
| Component model   | Mọi component đều là **Client Component**                | Mặc định **React Server Component (RSC)**, opt-in `'use client'` |
| Route = ?         | Mỗi **file** trong `pages/` là một route                 | Mỗi **folder** là segment, cần `page.tsx` mới thành route        |
| Layout            | `_app.tsx` + `_document.tsx` toàn cục, hoặc `getLayout` pattern thủ công | `layout.tsx` **nested theo segment**, persist khi navigate |
| Data fetching     | `getServerSideProps` / `getStaticProps` / `getStaticPaths` — chỉ ở cấp page | `async`/`await` + `fetch` **ngay trong component**, ở mọi cấp; `generateStaticParams` thay `getStaticPaths` |
| Loading / Error   | Tự xử lý (state, ErrorBoundary tự viết)                  | File convention: `loading.tsx`, `error.tsx`, `not-found.tsx`     |
| Metadata / SEO    | `<Head>` từ `next/head`, lặp lại từng page               | **Metadata API**: `export const metadata` / `generateMetadata`, merge theo cây segment |
| Streaming         | Không hỗ trợ tốt (render cả page xong mới gửi)           | **Streaming + Suspense** là first-class                          |
| Tính năng nâng cao| Không có                                                  | Route groups, Parallel Routes `@slot`, Intercepting Routes `(.)`, Server Actions |

Vì sao App Router ra đời: Pages Router gửi **toàn bộ JS của page xuống client**; RSC cho phép phần lớn UI render ở server, **không ship JS** xuống client — bundle nhỏ hơn, fetch data gần DB hơn, không waterfall client-side.

**Timeline đáng nhớ**: Next 13 (10/2022) giới thiệu App Router beta → Next 13.4 (5/2023) App Router **stable** → Next 14 (10/2023) Server Actions stable → Next 15 (10/2024) React 19, `params`/`searchParams` thành **Promise**, `fetch` **không còn cache mặc định** (đổi từ cache-by-default sang uncached-by-default).

**Insight phỏng vấn**: điểm ăn tiền là nói được khác biệt **mental model** — Pages Router là "page + hàm fetch đặc biệt", App Router là "cây component server-first, fetch ở bất kỳ đâu" — chứ không chỉ liệt kê tên folder.

### Code minh hoạ

```tsx
// ===== Pages Router (cũ) =====
// pages/products/[id].tsx — data fetching qua hàm đặc biệt cấp page
export async function getServerSideProps({ params }) {
  const product = await fetchProduct(params.id);
  if (!product) return { notFound: true };
  return { props: { product } };
}

export default function ProductPage({ product }) {
  // Toàn bộ component này + dependencies đều ship JS xuống client
  return <ProductDetail product={product} />;
}

// ===== App Router (mới) =====
// app/products/[id]/page.tsx — fetch ngay trong Server Component
import { notFound } from "next/navigation";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>; // Next 15: Promise
}) {
  const { id } = await params;
  const product = await fetchProduct(id); // chạy ở server, 0 JS xuống client
  if (!product) notFound();
  return <ProductDetail product={product} />;
}

// Metadata API thay cho next/head
export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await fetchProduct(id); // fetch trùng URL được dedupe
  return { title: product.name, description: product.summary };
}
```

### Đáp án mẫu

> "Khác biệt lớn nhất là mental model. Pages Router: mỗi file trong `pages/` là một route, mọi component là Client Component, data fetch qua các hàm đặc biệt cấp page như `getServerSideProps`, `getStaticProps`. App Router: mỗi folder là segment, mặc định là React Server Component, em `await fetch` ngay trong component ở bất kỳ tầng nào — không ship JS không cần thiết xuống client. Layout cũng khác hẳn: thay vì `_app.tsx` toàn cục, App Router có `layout.tsx` nested theo segment và persist khi navigate. Thêm các file convention `loading.tsx`, `error.tsx`, Metadata API thay `next/head`, và các tính năng chỉ App Router có như route groups, parallel routes, Server Actions. Về timeline: App Router ra beta ở Next 13, stable từ 13.4, đến Next 15 thì `params` thành Promise và `fetch` không còn cache mặc định. Dự án mới em luôn chọn App Router; Pages Router giờ chỉ ở chế độ maintain."

---

## Câu 12: Layouts trong Next.js App Router là gì? `[Basic]`

### Câu hỏi

> Layouts trong Next.js App Router là gì? Root layout có gì đặc biệt, nested layouts mang lại lợi ích gì và layout có những giới hạn nào?

### Giải thích lý thuyết

`layout.tsx` là UI **bọc ngoài các page con trong cùng segment**, nhận prop `children`. Layout ở segment cha tự động bọc layout/page ở segment con — tạo thành cây lồng nhau (**nested layouts**) khớp với cây URL.

**Root layout** (`app/layout.tsx`):
- **Bắt buộc** phải có trong mọi app.
- Phải render **`<html>` và `<body>`** — Next.js không tự thêm. Đây là nơi đặt font, provider toàn cục, analytics.

Đặc tính quan trọng nhất (interviewer rất hay đào): **layout KHÔNG re-render khi navigate giữa các page con của nó**. Khi đi từ `/dashboard/users` sang `/dashboard/settings`, `dashboard/layout.tsx` được **giữ nguyên** — không re-mount, state trong layout không mất, chỉ phần `children` thay đổi. Đây là "partial rendering" của App Router. Nếu cần reset/re-mount mỗi navigation (animation, form state) → dùng `template.tsx`.

Lợi ích của **nested layouts**:

1. **UI persist + navigation nhanh**: layout phía trên không re-mount — sidebar giữ trạng thái mở/đóng, audio player tiếp tục phát; Next chỉ fetch và render **phần cây thay đổi** nên payload nhỏ, navigation nhanh.
2. **Code-sharing đúng phạm vi**: navbar ở root, sidebar ở `(dashboard)`, tabs ở `settings/` — UI chung sống đúng tầng, không cần `getLayout` pattern thủ công như Pages Router.
3. **Fetch data per layout**: layout là Server Component nên tự fetch data nó cần (layout dashboard fetch session, layout shop fetch categories); fetch chạy song song với page, trùng URL được dedupe.

Giới hạn của layout:
- **Không nhận `searchParams`** — vì layout không re-render khi navigate, searchParams cũ sẽ stale. Chỉ page nhận `searchParams`; layout vẫn nhận `params` của các segment phía trên.
- **Không biết pathname hiện tại** (Server Component) — muốn active link phải dùng Client Component với `usePathname()`.
- Không truyền data từ layout xuống page qua props — mỗi bên tự fetch (fetch được dedupe/cache nên không lo gọi trùng).
- Vì layout persist, **side effect trong layout không chạy lại khi navigate** — logic "mỗi lần đổi trang làm X" thuộc về `template.tsx` hoặc page.

### Code minh hoạ

```tsx
// app/layout.tsx — Root layout (BẮT BUỘC)
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "My App", template: "%s | My App" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Root layout PHẢI có <html> và <body>
    <html lang="vi">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

// app/dashboard/layout.tsx — nested layout, tự fetch data nó cần
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession(); // chạy song song với fetch của page

  return (
    <div className="flex">
      {/* Sidebar KHÔNG re-render khi đi giữa /dashboard/users ↔ /dashboard/settings
          → state mở/đóng menu, scroll position được giữ nguyên */}
      <Sidebar user={session.user} />
      <main>{children}</main> {/* chỉ phần này swap khi navigate */}
    </div>
  );
}

// ❌ Layout KHÔNG nhận searchParams — code này không hoạt động
// export default function Layout({ children, searchParams }) { ... }

// ✅ Active link trong layout → tách Client Component
// app/dashboard/NavLink.tsx
("use client");
import { usePathname } from "next/navigation";
import Link from "next/link";

export function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname(); // layout server không biết pathname, client thì có
  return (
    <Link href={href} className={pathname === href ? "active" : ""}>
      {label}
    </Link>
  );
}
```

### Đáp án mẫu

> "Layout là UI bọc ngoài các page con trong cùng segment, nhận prop `children`, và lồng nhau theo cây thư mục. Root layout `app/layout.tsx` bắt buộc phải có và phải tự render `<html>`, `<body>` — nơi em đặt font, providers, analytics. Điểm quan trọng nhất: layout **không re-render khi navigate** giữa các page con — đi từ `/dashboard/users` sang `/dashboard/settings` thì sidebar trong layout giữ nguyên state, chỉ `children` swap, Next chỉ render lại phần cây thay đổi nên navigation rất nhanh. Nested layouts còn cho em code-sharing đúng phạm vi — navbar ở root, sidebar ở nhóm dashboard — và mỗi layout là Server Component nên tự fetch data nó cần, chạy song song với page. Giới hạn em luôn nhớ: layout không nhận `searchParams` vì nó không re-render nên sẽ stale; không biết pathname ở server — active link phải tách Client Component dùng `usePathname()`; cần re-mount mỗi navigation thì dùng `template.tsx`."

---

## Câu 13: loading.tsx và Suspense trong Next.js App Router? `[Intermediate]`

### Câu hỏi

> loading.tsx và Suspense trong Next.js App Router? `loading.tsx` hoạt động như thế nào bên dưới, và khi nào nên tự đặt `<Suspense>` thủ công?

### Giải thích lý thuyết

`loading.tsx` là file convention: Next.js **tự động wrap `page.tsx` (và children) trong một React Suspense boundary**, với nội dung `loading.tsx` làm fallback. Tương đương:

```tsx
<Layout>
  <Suspense fallback={<Loading />}>
    <Page />
  </Suspense>
</Layout>
```

Cơ chế tạo ra **instant loading state**:
- Khi navigate đến route có page đang `await` data, Next.js hiển thị `loading.tsx` **ngay lập tức** — navigation cảm giác tức thì, không bị "đơ" chờ server. Layout phía trên vẫn interactive (sidebar bấm được).
- Với SSR lần đầu, đây chính là **streaming**: server gửi HTML chứa layout + fallback trước, khi page render xong thì stream phần HTML đó vào thay fallback (out-of-order streaming qua cùng 1 response) — cải thiện TTFB và perceived performance.

**Quan hệ với Suspense thủ công**: `loading.tsx` chỉ là **sugar cho 1 boundary ở mức page** — granularity thô, cả page chờ chung một fallback. Khi page có nhiều khối data với tốc độ khác nhau, tự đặt `<Suspense>` quanh **từng async Server Component** để có **granular boundaries**:

- Phần tĩnh (header, filter) render ngay, không chờ data.
- Chart và table stream vào **độc lập** — cái nào xong trước hiện trước, không block lẫn nhau.
- Có thể dùng **cả hai cùng lúc**: `loading.tsx` cho first-paint của route, Suspense thủ công cho từng panel bên trong.

Best practice: fallback nên là **skeleton** mô phỏng đúng kích thước/bố cục content thật — tránh spinner chung chung và tránh CLS khi content thay vào.

Giới hạn & lưu ý:
- `loading.tsx` bọc **page, không bọc layout cùng cấp** — layout render trước rồi mới đến boundary.
- Hoạt động tốt nhất khi page là async Server Component; page static thì fallback gần như không xuất hiện.
- Suspense boundary còn là điểm neo của **Partial Prerendering (PPR)**: phần ngoài boundary prerender static, phần trong stream động.

**Insight phỏng vấn**: interviewer muốn nghe từ khoá "Suspense boundary tự động" và "streaming" — nếu chỉ nói "nó hiện spinner khi loading" là chưa đạt mức hiểu cơ chế.

### Code minh hoạ

```tsx
// app/dashboard/loading.tsx — skeleton mô phỏng layout thật, tránh CLS
export default function DashboardLoading() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Kích thước khớp với card thật → content thay vào không bị nhảy layout */}
      <div className="h-32 animate-pulse rounded bg-gray-200" />
      <div className="h-32 animate-pulse rounded bg-gray-200" />
      <div className="h-32 animate-pulse rounded bg-gray-200" />
    </div>
  );
}

// app/dashboard/page.tsx — page await data → loading.tsx hiện ngay khi navigate
export default async function DashboardPage() {
  const stats = await fetchStats(); // chậm 800ms → user thấy skeleton trong lúc chờ
  return <StatsGrid stats={stats} />;
}

// Granular boundaries: tự đặt Suspense trong page thay vì 1 loading.tsx cho cả segment
import { Suspense } from "react";

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader /> {/* render ngay, không chờ data */}
      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart /> {/* async — stream vào khi xong */}
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <OrdersTable /> {/* async — stream độc lập, không chờ chart */}
      </Suspense>
    </>
  );
}

async function RevenueChart() {
  const data = await fetchRevenue(); // mỗi component tự fetch
  return <Chart data={data} />;
}
```

### Đáp án mẫu

> "Bản chất `loading.tsx` là Next.js tự động wrap page trong một React Suspense boundary, lấy nội dung file đó làm fallback. Hai hệ quả: thứ nhất, **instant loading state** — navigate đến route có page đang await data thì skeleton hiện ngay, layout phía trên vẫn interactive. Thứ hai, với SSR lần đầu nó chính là **streaming**: server gửi layout + fallback trước, page render xong thì stream HTML vào thay thế trong cùng response — cải thiện TTFB và perceived performance. Nhưng `loading.tsx` chỉ là sugar cho một boundary ở mức page — granularity thô. Khi cần chart load trước, table load sau, em tự đặt `<Suspense>` quanh từng async component để có granular boundaries, từng phần stream độc lập; hai cách dùng được cùng lúc. Em luôn làm fallback dạng skeleton khớp kích thước content thật để tránh CLS, thay vì spinner chung chung."

---

## Câu 14: error.tsx và not-found.tsx trong Next.js hoạt động như thế nào? `[Intermediate]`

### Câu hỏi

> error.tsx và not-found.tsx trong Next.js hoạt động như thế nào? Tại sao `error.tsx` phải là Client Component, `reset` và `global-error.tsx` dùng làm gì, và `notFound()` liên quan gì đến SEO?

### Giải thích lý thuyết

**`error.tsx`** khiến Next.js **tự động wrap segment trong một React Error Boundary**. Khi page hoặc component con throw lỗi lúc render (kể cả lỗi trong async Server Component), UI fallback của `error.tsx` hiện ra thay vì crash cả app — các phần ngoài boundary (layout cha, navbar) **vẫn hoạt động bình thường**.

Đặc điểm bắt buộc nhớ:

- **Phải có `'use client'`**: Error Boundary trong React là cơ chế class component với lifecycle (`componentDidCatch`) — chỉ tồn tại ở client.
- Nhận 2 props: **`error`** (ở production message của lỗi server bị strip, chỉ còn `error.digest` để trace log — tránh lộ thông tin nhạy cảm) và **`reset`** (function re-render lại segment — cho user "Thử lại" mà không reload trang, hữu ích với lỗi tạm thời).
- **Không bắt lỗi của layout cùng segment**: boundary nằm **bên trong** layout (`<Layout><ErrorBoundary><Page/></ErrorBoundary></Layout>`), nên lỗi throw trong `layout.tsx` cùng cấp phải được `error.tsx` của **segment cha** bắt.
- **`global-error.tsx`**: bắt lỗi của chính root layout — vì khi root layout crash thì cả `<html><body>` mất, nên file này phải tự render `<html>` và `<body>`. Chỉ active ở production.
- Lỗi **không phải lỗi render** (event handler, async callback) Error Boundary **không bắt** — phải try/catch thủ công.

**`not-found.tsx`** xử lý 2 tình huống 404:

1. **URL không match route nào**: Next.js tự render `app/not-found.tsx` (root) — không cần code gì thêm.
2. **Route match nhưng data không tồn tại**: trong page gọi **`notFound()`** từ `next/navigation` — function này **throw một error đặc biệt**, dừng render ngay và Next render `not-found.tsx` **gần nhất** trong cây segment (có thể đặt 404 riêng per segment, ví dụ `app/blog/not-found.tsx` gợi ý bài viết khác).

**Liên quan SEO — điểm ăn tiền**: khi `notFound()` được gọi, Next trả về **HTTP status 404 thật** (với streaming, Next chèn `<meta name="robots" content="noindex">` vì status đã gửi đi trước). Nếu chỉ render component "Không tìm thấy" với status **200** (soft 404), Google vẫn index trang rỗng đó → loãng index, hại SEO — lỗi rất phổ biến ở SPA thuần.

**Insight phỏng vấn**: ba ý ăn điểm là (1) giải thích được *tại sao* `error.tsx` phải `'use client'`, (2) biết nó không bắt lỗi layout cùng cấp, (3) phân biệt 404 thật vs soft 404.

### Code minh hoạ

```tsx
// app/dashboard/error.tsx
"use client"; // BẮT BUỘC — Error Boundary là cơ chế client-side

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }; // digest: mã trace lỗi server ở production
  reset: () => void; // re-render lại segment
}) {
  useEffect(() => {
    reportError(error); // gửi lên monitoring (Sentry...), đối chiếu theo digest
  }, [error]);

  return (
    <div role="alert">
      <h2>Đã có lỗi xảy ra ở dashboard</h2>
      <p>Mã lỗi: {error.digest}</p>
      <button onClick={() => reset()}>Thử lại</button>
    </div>
  );
}

// Cây render thực tế — vì sao error.tsx không bắt lỗi layout cùng cấp:
// <DashboardLayout>            ← lỗi ở đây: error.tsx của segment CHA mới bắt
//   <ErrorBoundary fallback={<DashboardError />}>
//     <DashboardPage />        ← lỗi ở đây: DashboardError bắt ✅
//   </ErrorBoundary>
// </DashboardLayout>

// app/global-error.tsx — lưới an toàn cuối cùng khi ROOT layout crash
("use client");

export default function GlobalError({ error, reset }) {
  return (
    // Root layout đã chết → phải tự render html/body
    <html lang="vi">
      <body>
        <h2>Ứng dụng gặp sự cố nghiêm trọng</h2>
        <button onClick={() => reset()}>Tải lại</button>
      </body>
    </html>
  );
}

// app/blog/[slug]/page.tsx — notFound() khi data không tồn tại
import { notFound } from "next/navigation";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchPost(slug);

  if (!post) {
    // throw error đặc biệt → dừng render, hiển thị not-found.tsx gần nhất
    // Response trả HTTP 404 / noindex → Google KHÔNG index trang rỗng
    notFound();
  }

  return <article>{post.content}</article>;
}

// app/blog/not-found.tsx — 404 riêng cho segment blog
import Link from "next/link";

export default function BlogNotFound() {
  return (
    <div>
      <h2>Không tìm thấy bài viết</h2>
      <Link href="/blog">Xem các bài viết khác</Link>
    </div>
  );
}

// ❌ Anti-pattern: soft 404 — trả 200 với UI "not found"
// if (!post) return <p>Không tìm thấy</p>; // Google index trang rỗng này!
```

### Đáp án mẫu

> "`error.tsx` khiến Next tự wrap segment trong React Error Boundary — page throw lỗi lúc render thì fallback hiện ra, phần còn lại của app vẫn sống. Nó bắt buộc `'use client'` vì Error Boundary là cơ chế class component với `componentDidCatch`, chỉ tồn tại ở client. Props gồm `error` — production strip message lỗi server, chỉ còn `digest` để đối chiếu log — và `reset` để re-render segment cho user thử lại. Lưu ý: boundary nằm bên trong layout nên không bắt lỗi layout cùng cấp; lỗi root layout cần `global-error.tsx` tự render `<html><body>`. Còn `not-found.tsx`: URL không match thì Next tự render bản root, route match nhưng data không có thì em gọi `notFound()` — nó throw error đặc biệt, render `not-found.tsx` gần nhất và trả **HTTP 404 thật** hoặc meta noindex. Khác hẳn soft 404 trả 200 khiến Google index trang rỗng. Thói quen của em: mọi dynamic route đều có `if (!data) notFound()` ngay sau fetch."

---

## Câu 15: Route Groups trong Next.js là gì? `[Basic]`

### Câu hỏi

> Route Groups trong Next.js là gì? Cú pháp `(folder)` dùng để làm gì và các use case thực tế?

### Giải thích lý thuyết

Route group là folder đặt tên **trong ngoặc đơn `(folder)`** — Next.js coi nó là công cụ **tổ chức code thuần tuý**, **không xuất hiện trong URL**. `app/(marketing)/about/page.tsx` map ra `/about`, không phải `/marketing/about`.

Ba use case chính:

1. **Tách layout theo nhóm route**: app thường có 2 "thế giới" — trang public `(marketing)` với navbar + footer, và trang app `(shop)` hay `(dashboard)` với sidebar + auth. Route groups cho mỗi nhóm một `layout.tsx` riêng dù URL của chúng cùng nằm ở root level (`/about`, `/products` đều phẳng).

2. **Nhiều root layout**: nếu **bỏ `layout.tsx` ở cấp `app/`** và đặt root layout riêng trong từng group (mỗi cái tự render `<html><body>`), bạn có nhiều root layout thật sự — ví dụ landing page dùng bộ font/theme khác hẳn app chính. Lưu ý: navigate **giữa 2 root layout khác nhau** gây **full page load** (không còn client-side navigation), vì cả cây `<html>` phải thay.

3. **Tổ chức code theo team/feature**: nhóm route theo concern (`(auth)`, `(admin)`) để codebase dễ đọc, kể cả khi không cần layout riêng.

Pitfalls cần nhớ:
- Tên group **thuần tổ chức**, đổi tên không ảnh hưởng URL — nhưng **2 route trong 2 group khác nhau không được resolve ra cùng URL**: `(marketing)/about/page.tsx` và `(shop)/about/page.tsx` cùng ra `/about` → build error.
- Group **không phải route segment**: không tính một cấp khi đếm `(..)` trong intercepting routes, không nhận `params`.
- Page nằm cạnh group cùng cấp (ví dụ `app/page.tsx` và `app/(marketing)/page.tsx`) cũng conflict vì cùng match `/`.

**Insight phỏng vấn**: câu này check bạn có tổ chức project thật chưa. Điểm cộng là nhắc được "nhiều root layout" và hệ quả full page load khi điều hướng giữa các root layout.

### Code minh hoạ

```text
app/
├── (marketing)/                # KHÔNG vào URL
│   ├── layout.tsx              # Root layout 1: navbar public + footer, font serif
│   │                           #   (tự render <html><body>)
│   ├── page.tsx                # → /
│   ├── about/page.tsx          # → /about
│   └── pricing/page.tsx        # → /pricing
├── (shop)/
│   ├── layout.tsx              # Root layout 2: AppShell + sidebar + auth check
│   ├── products/page.tsx       # → /products
│   └── cart/page.tsx           # → /cart
└── (auth)/
    ├── layout.tsx              # Layout tối giản giữa màn hình
    ├── login/page.tsx          # → /login
    └── register/page.tsx       # → /register

# Không có app/layout.tsx → mỗi group là một ROOT layout riêng
# Navigate /pricing → /products: đổi root layout → FULL PAGE LOAD
```

```tsx
// app/(marketing)/layout.tsx — root layout cho nhóm marketing
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="font-serif">
      <body>
        <PublicNavbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}

// app/(shop)/layout.tsx — root layout cho nhóm shop, có auth guard
import { redirect } from "next/navigation";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login"); // guard chung cho cả nhóm (shop)

  return (
    <html lang="vi">
      <body>
        <AppShell user={session.user}>{children}</AppShell>
      </body>
    </html>
  );
}

// ❌ Conflict: cả hai cùng resolve ra /about → build error
// app/(marketing)/about/page.tsx
// app/(shop)/about/page.tsx
```

### Đáp án mẫu

> "Route group là folder trong ngoặc đơn `(folder)` — chỉ để tổ chức code, hoàn toàn không vào URL: `(marketing)/about` vẫn là `/about`. Use case chính của em là tách layout theo nhóm: `(marketing)` có navbar public và footer, `(shop)` có AppShell với sidebar và auth guard — URL hai nhóm vẫn phẳng cùng cấp. Nâng cao hơn, nếu bỏ `layout.tsx` ở cấp `app/` và cho mỗi group tự render `<html><body>`, em có nhiều root layout thật sự — landing page theme khác hẳn app chính. Nhưng phải nhớ navigate giữa hai root layout là full page load chứ không còn client-side navigation. Vài pitfall: hai group không được chứa route resolve ra cùng URL — `(a)/about` và `(b)/about` là build error; và group không phải route segment nên không tính cấp khi đếm `(..)` trong intercepting routes."

---

## Câu 16: Dynamic routes và catch-all routes trong Next.js App Router? `[Intermediate]`

### Câu hỏi

> Dynamic routes và catch-all routes trong Next.js App Router? Phân biệt `[slug]`, `[...slug]`, `[[...slug]]` và cách đọc params trong Next.js 15.

### Giải thích lý thuyết

Có 3 mức dynamic segment, đều khai báo bằng **tên folder trong ngoặc vuông**:

| Pattern                     | `/docs` | `/docs/a` | `/docs/a/b/c` | `slug` nhận được          |
| --------------------------- | ------- | --------- | ------------- | ------------------------- |
| `docs/[slug]/page.tsx`      | ❌ 404  | ✅        | ❌            | `"a"` (string)            |
| `docs/[...slug]/page.tsx`   | ❌ 404  | ✅        | ✅            | `["a"]`, `["a","b","c"]`  |
| `docs/[[...slug]]/page.tsx` | ✅      | ✅        | ✅            | `undefined`, `["a"]`, ... |

- **Dynamic `[slug]`**: match **đúng 1 segment**, giá trị là string. Có thể lồng nhiều cấp: `[category]/[id]`.
- **Catch-all `[...slug]`**: match **nhiều segment**, giá trị là mảng string, yêu cầu **ít nhất 1 segment** — `/docs` sẽ 404 (muốn `/docs` có trang riêng phải tạo thêm `docs/page.tsx`).
- **Optional catch-all `[[...slug]]`**: match cả root. Khi vào `/docs`, `slug` là `undefined` (không phải mảng rỗng) — phải handle case này. **Không được** tồn tại đồng thời `docs/page.tsx` và `docs/[[...slug]]/page.tsx` — conflict vì cùng match `/docs`.

Độ ưu tiên matching: **route tĩnh > dynamic `[slug]` > catch-all `[...slug]`**.

**Thay đổi quan trọng trong Next.js 15**: `params` và `searchParams` là **Promise** — phải `await` trong Server Component (hoặc `React.use()` trong Client Component). Next 14 trở về trước là object đồng bộ. Lý do: Next chuyển các "dynamic API" sang async để hỗ trợ streaming/PPR — server render được phần không phụ thuộc params trước khi resolve request. Next 15 vẫn cho truy cập đồng bộ kèm warning (backward compat), nhưng code mới **bắt buộc viết async**; codemod `next-async-request-api` migrate tự động.

Use case kinh điển của catch-all: **docs site** — nội dung từ CMS với đường dẫn sâu tuỳ ý (`/docs/getting-started/installation/macos`), một file `[[...slug]]/page.tsx` xử lý cả trang index lẫn mọi trang con. Lưu ý thêm: đọc `searchParams` trong page sẽ **opt route vào dynamic rendering** (phụ thuộc request) — khác với `params`.

**Insight phỏng vấn**: hai điểm ăn tiền — `[[...slug]]` match cả root còn `[...slug]` thì không (và `slug` là `undefined` ở root), cùng với "params là Promise trong Next 15 và tại sao".

### Code minh hoạ

```tsx
// app/blog/[slug]/page.tsx — dynamic route 1 segment, Next.js 15
type Props = {
  params: Promise<{ slug: string }>; // Next 15: Promise, PHẢI await
};

export default async function PostPage({ params }: Props) {
  const { slug } = await params; // ✅ Next 15: bắt buộc await
  const post = await fetchPost(slug);
  return <article>{post.content}</article>;
}

// So sánh Next 14 (cũ — KHÔNG còn đúng chuẩn Next 15):
// export default function PostPage({ params }: { params: { slug: string } }) {
//   const slug = params.slug; // đồng bộ — Next 15 sẽ warning
// }

// Client Component muốn đọc params Promise → dùng React.use()
("use client");
import { use } from "react";

export function LikeButton({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params); // unwrap Promise trong Client Component
  return <button onClick={() => like(slug)}>Thích</button>;
}

// app/docs/[[...slug]]/page.tsx — optional catch-all cho docs site
export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>; // optional → có thể undefined
}) {
  const { slug } = await params;

  // /docs → slug = undefined → trang index của docs
  if (!slug) {
    return <DocsHome />;
  }

  // /docs/getting-started/installation → slug = ["getting-started", "installation"]
  const doc = await fetchDoc(slug.join("/"));
  if (!doc) notFound();

  return (
    <article>
      <Breadcrumbs segments={slug} />
      <DocContent doc={doc} />
    </article>
  );
}

// So sánh: nếu dùng [...slug] (KHÔNG optional)
// app/docs/[...slug]/page.tsx → /docs sẽ 404
// → phải tạo thêm app/docs/page.tsx cho trang index
// (đôi khi đây lại là điều bạn MUỐN: index và detail logic khác hẳn nhau)
```

### Đáp án mẫu

> "Dynamic route khai báo bằng folder ngoặc vuông: `[slug]` match đúng 1 segment và trả string; `[...slug]` catch-all match nhiều segment trả mảng nhưng yêu cầu ít nhất 1 segment — `/docs` sẽ 404; `[[...slug]]` optional match luôn cả root, lúc đó `slug` là `undefined` chứ không phải mảng rỗng — pitfall hay quên handle. Route tĩnh luôn ưu tiên hơn dynamic, dynamic hơn catch-all. Điểm quan trọng ở Next.js 15: `params` và `searchParams` giờ là **Promise**, phải `await` trong Server Component hoặc `React.use()` trong Client Component — lý do là Next chuyển dynamic API sang async để stream được phần UI không phụ thuộc request, phục vụ PPR. Use case em hay dùng catch-all là docs site: một file `[[...slug]]/page.tsx` xử lý cả `/docs` lẫn `/docs/a/b/c`; còn khi trang index khác hẳn detail về logic thì em chọn `[...slug]` và tách riêng `docs/page.tsx`."

---

## Câu 17: generateStaticParams trong Next.js App Router dùng để làm gì? `[Intermediate]`

### Câu hỏi

> generateStaticParams trong Next.js App Router dùng để làm gì? Nó liên quan thế nào đến `dynamicParams` và ISR?

### Giải thích lý thuyết

`generateStaticParams` là function export từ file dynamic route, **trả về mảng các object params** mà Next.js sẽ **prerender thành HTML tĩnh lúc build** (SSG). Đây là phiên bản App Router của **`getStaticPaths`** bên Pages Router — nhưng gọn hơn: chỉ trả mảng params, không cần `paths`/`fallback`.

Cách hoạt động:
- Chạy **lúc build** (và khi revalidate trong ISR). Bên trong có thể fetch API/DB thoải mái; fetch trùng URL với page được **dedupe** nên không lo gọi double.
- Mỗi object trong mảng tương ứng một trang static: `[{ slug: "a" }, { slug: "b" }]` → prerender `/blog/a`, `/blog/b`.
- Với **nested dynamic segments** (`[category]/[product]`), có thể generate từ segment cha xuống con — child nhận params của cha.

**`dynamicParams`** — điều khiển hành vi với **path KHÔNG nằm trong danh sách** đã generate:
- `true` (mặc định): path lạ được **render on-demand** lần đầu rồi cache lại — về sau serve như static. Đây chính là tinh thần `fallback: 'blocking'` của Pages Router.
- `false`: path lạ trả **404** thẳng — dùng khi tập route là hữu hạn và đã biết trước (tránh cache bẩn, tránh bị spam path).

**Kết hợp ISR**: thêm `export const revalidate = 3600` (hoặc revalidate per-fetch) — trang static được build sẵn nhưng tự làm mới mỗi giờ; path mới (khi `dynamicParams: true`) cũng theo cùng cơ chế. Combo `generateStaticParams` + `revalidate` + on-demand `revalidatePath()` là pattern chuẩn cho blog/e-commerce: build sẵn top N trang hot, phần còn lại on-demand, content cập nhật mà không cần rebuild.

Chiến thuật thực tế: **không cần generate hết** — site có 1 triệu sản phẩm thì chỉ generate vài nghìn trang truy cập nhiều nhất để build nhanh, phần còn lại render lần đầu khi có người vào.

**Insight phỏng vấn**: interviewer muốn nghe đủ bộ ba — generate gì lúc build, `dynamicParams` xử lý path lạ thế nào, và kết hợp ISR ra sao. Map được sang `getStaticPaths`/`fallback` của Pages Router là điểm cộng cho thấy hiểu cả 2 thế hệ.

### Code minh hoạ

```tsx
// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";

// Chạy LÚC BUILD: prerender các slug này thành HTML tĩnh (SSG)
export async function generateStaticParams() {
  const posts = await fetchAllPosts();
  // Chiến thuật: chỉ build sẵn top bài hot, phần còn lại on-demand
  return posts.slice(0, 100).map((post) => ({ slug: post.slug }));
}

// true (mặc định): slug ngoài danh sách → render on-demand lần đầu rồi cache
// false: slug ngoài danh sách → 404 thẳng
export const dynamicParams = true;

// ISR: trang static tự làm mới mỗi giờ, không cần rebuild
export const revalidate = 3600;

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>; // Next 15: await params
}) {
  const { slug } = await params;
  const post = await fetchPost(slug); // fetch trùng với generateStaticParams → dedupe
  if (!post) notFound(); // quan trọng khi dynamicParams = true
  return <article>{post.content}</article>;
}

// Nested dynamic segments: generate từ cha xuống con
// app/products/[category]/[product]/page.tsx
export async function generateStaticParams() {
  const products = await fetchProducts();
  return products.map((p) => ({
    category: p.categorySlug, // params cho cả 2 segment
    product: p.slug,
  }));
}

// So sánh Pages Router (cũ):
// export async function getStaticPaths() {
//   return {
//     paths: posts.map((p) => ({ params: { slug: p.slug } })),
//     fallback: "blocking", // ≈ dynamicParams: true
//   };
// }
```

### Đáp án mẫu

> "`generateStaticParams` export từ file dynamic route, trả về mảng params để Next **prerender thành HTML tĩnh lúc build** — nó thay thế `getStaticPaths` của Pages Router nhưng gọn hơn, chỉ cần trả mảng `[{ slug: 'a' }]`. Với path không nằm trong danh sách, hành vi do `dynamicParams` quyết định: mặc định `true` thì render on-demand lần đầu rồi cache — tương đương `fallback: 'blocking'` cũ; `false` thì 404 thẳng, dùng khi tập route hữu hạn. Em hay kết hợp ISR: thêm `revalidate = 3600` để trang static tự làm mới mỗi giờ, cộng `revalidatePath()` khi editor bấm publish. Chiến thuật thực tế của em với e-commerce: chỉ generate vài nghìn trang hot nhất để build nhanh, phần đuôi dài render on-demand — và luôn có `if (!data) notFound()` vì path lạ có thể là rác. Fetch trong `generateStaticParams` trùng với page được dedupe nên không lo gọi double."

---

## Câu 52: Parallel Routes và Intercepting Routes trong Next.js là gì? `[Advanced]`

### Câu hỏi

> Parallel Routes (`@slot`) và Intercepting Routes (`(.)`) là gì? Cho ví dụ thực tế khi kết hợp cả hai.

### Giải thích lý thuyết

**Parallel Routes** — render **nhiều page độc lập trong cùng một layout** đồng thời:

- Khai báo bằng folder **`@slot`** (ví dụ `@analytics`, `@team`). Slot **không vào URL** (`@analytics/page.tsx` vẫn ở URL của layout cha).
- Layout cha nhận mỗi slot như một **prop** ngang hàng `children` (bản thân `children` cũng là slot ngầm `@children`).
- Mỗi slot có `loading.tsx`/`error.tsx` **riêng** → từng panel stream và fail **độc lập** — dashboard có panel lỗi không kéo sập các panel khác.
- **`default.tsx`**: fallback cho slot khi nó **không match** URL hiện tại (đặc biệt sau hard reload — Next không biết slot nên render gì). Thiếu `default.tsx` → 404. Đây là pitfall số 1 của parallel routes.
- Slot còn dùng cho **conditional rendering**: layout chọn render `@admin` hay `@user` theo role.

**Intercepting Routes** — "chặn" navigation đến một route và hiển thị UI khác **trong context hiện tại**:

- Convention: `(.)` chặn route **cùng cấp**, `(..)` cấp **trên một bậc** (tính theo *route segment*, không phải filesystem), `(..)(..)` trên hai bậc, `(...)` tính **từ root**.
- Cốt lõi: khi **soft navigation** (click `<Link>` trong app) → render route bị chặn (thường là modal); khi **hard navigation** (paste URL, reload, share link) → render route gốc full page. **URL vẫn đổi thật** — share được, back/forward hoạt động đúng.

**Ví dụ kinh điển — photo modal kiểu Instagram** (kết hợp cả hai): click ảnh trong feed → modal mở đè lên feed, URL đổi thành `/photo/123`; reload chính URL đó → trang photo đầy đủ. Modal render qua slot `@modal`, intercepting route `(.)photo/[id]` chặn navigation.

**Insight phỏng vấn**: đây là câu phân loại Senior. Interviewer muốn nghe: slot là prop của layout, vai trò của `default.tsx`, và đặc biệt là phân biệt **soft vs hard navigation** — nói được "URL thật, shareable, reload ra full page" là đúng trọng tâm.

### Code minh hoạ

```text
app/
├── layout.tsx
├── @modal/                      # Parallel slot cho modal
│   ├── default.tsx              # BẮT BUỘC: trả null khi không có modal
│   └── (.)photo/[id]/page.tsx   # Intercept /photo/[id] khi soft navigation
├── page.tsx                     # Feed: lưới ảnh
└── photo/[id]/page.tsx          # Trang photo full — hard navigation vào đây
```

```tsx
// app/layout.tsx — nhận slot @modal như một prop
export default function RootLayout({
  children,
  modal, // slot @modal — render SONG SONG với children
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        {children}
        {modal} {/* modal đè lên page hiện tại */}
      </body>
    </html>
  );
}

// app/@modal/default.tsx — khi không có modal active (và sau hard reload)
export default function Default() {
  return null; // thiếu file này → 404!
}

// app/@modal/(.)photo/[id]/page.tsx — bản BỊ CHẶN: render dạng modal
import { Modal } from "@/components/Modal";

export default async function PhotoModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // Next 15: await params
  const photo = await fetchPhoto(id);
  return (
    <Modal>
      {/* Click ảnh từ feed (soft nav): URL → /photo/123 nhưng render modal này,
          feed phía sau giữ nguyên state và scroll position */}
      <img src={photo.url} alt={photo.title} />
    </Modal>
  );
}

// app/photo/[id]/page.tsx — bản GỐC: hard reload / share link vào thẳng đây
export default async function PhotoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const photo = await fetchPhoto(id);
  return <PhotoDetailFull photo={photo} />; // full page, đủ SEO/metadata
}

// components/Modal.tsx — đóng modal = router.back()
("use client");
import { useRouter } from "next/navigation";

export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <div className="overlay" onClick={() => router.back()}>
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}
```

### Đáp án mẫu

> "Parallel Routes cho phép render nhiều page độc lập trong cùng layout qua folder `@slot` — layout nhận mỗi slot như một prop ngang hàng `children`, slot không vào URL. Mỗi slot có loading/error riêng nên dashboard nhiều panel stream và fail độc lập. Pitfall lớn nhất là phải có `default.tsx` — fallback khi slot không match URL, nhất là sau hard reload, thiếu là 404. Intercepting Routes thì 'chặn' navigation bằng convention `(.)` cùng cấp, `(..)` trên một bậc segment, `(...)` từ root: **soft navigation** trong app render bản bị chặn, **hard reload** render route gốc full page. Combo kinh điển là photo modal kiểu Instagram: click ảnh trong feed thì modal mở qua slot `@modal` với `(.)photo/[id]`, URL đổi thành `/photo/123` thật — share được, back để đóng modal bằng `router.back()`; còn paste URL hay reload thì ra trang photo đầy đủ, tốt cho SEO. Em đã dùng pattern này cho gallery và quick-view sản phẩm — UX modal nhưng URL vẫn chuẩn."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                      | Đúng là                                                                          |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| "Mọi folder trong app/ đều là route"                         | Folder chỉ thành route public khi có `page.tsx`/`route.ts`; `(group)` và `_folder` không vào URL |
| "App Router chỉ là đổi tên folder pages thành app"           | Đổi cả mental model: RSC mặc định, nested layout, fetch trong component, streaming — không chỉ là cấu trúc thư mục |
| "Layout re-render mỗi lần đổi trang"                         | Layout persist khi navigate giữa page con — vì vậy nó không nhận `searchParams`   |
| "`loading.tsx` chỉ là spinner tiện lợi"                      | Là Suspense boundary tự động — nền tảng của streaming; cần granular thì tự đặt `<Suspense>` trong page |
| "`error.tsx` bắt mọi lỗi của segment"                        | Không bắt lỗi layout cùng cấp (boundary nằm trong layout) và lỗi event handler    |
| "Render UI 'không tìm thấy' là đủ cho 404"                   | Phải gọi `notFound()` để trả HTTP 404/noindex thật — tránh soft 404 hại SEO       |
| "Route group chỉ là folder đặt tên đẹp, vô hại"              | 2 group chứa route resolve cùng URL → build error; đổi root layout giữa các group → full page load |
| "params là object, đọc trực tiếp `params.slug`"              | Next 15: `params`/`searchParams` là Promise — phải `await` hoặc `React.use()`     |
| "`[[...slug]]` ở root trả mảng rỗng"                         | Trả `undefined` — phải handle; và không được tồn tại cùng `page.tsx` cùng cấp     |
| "Path không có trong generateStaticParams sẽ 404"            | Mặc định `dynamicParams: true` → render on-demand rồi cache; chỉ 404 khi set `false` |
| "Parallel routes không cần default.tsx"                      | Thiếu `default.tsx` → 404 khi slot không match (nhất là sau hard reload)          |
| "`(..)` trong intercepting tính theo cấp thư mục"            | Tính theo **route segment** — route groups, `@slot` không tính là một cấp         |
