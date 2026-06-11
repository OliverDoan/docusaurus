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

## Câu 10: Dynamic routes trong Next.js được khai báo như thế nào? `[Basic]`

### Câu hỏi

> Dynamic routes trong Next.js được khai báo như thế nào? Cách đọc params trong Next.js 15 có gì khác trước?

### Giải thích lý thuyết

Dynamic route khai báo bằng **folder tên trong ngoặc vuông**: `app/blog/[slug]/page.tsx` match `/blog/hello`, `/blog/abc`... Giá trị segment được truyền vào page qua prop `params`.

**Thay đổi quan trọng trong Next.js 15**: `params` và `searchParams` là **Promise** — phải `await` (hoặc dùng `React.use()` trong Client Component). Ở Next 14 trở về trước chúng là object đồng bộ. Lý do: Next.js chuyển các "dynamic API" sang async để hỗ trợ tốt hơn streaming/PPR — server có thể render phần không phụ thuộc params trước khi resolve request. Next 15 vẫn cho truy cập đồng bộ kèm warning (backward compat), nhưng code mới **bắt buộc viết async**.

**`generateStaticParams`**: export function này để khai báo trước danh sách params cần **prerender lúc build** (thay thế `getStaticPaths` của Pages Router). Route trở thành SSG cho các params đã liệt kê; params lạ mặc định render on-demand rồi cache (điều khiển bằng `dynamicParams = false` nếu muốn 404 với params không khai báo).

Pitfalls hay gặp:
- Quên `await params` khi upgrade lên Next 15 — codemod `next-async-request-api` fix tự động.
- Đọc `searchParams` trong page sẽ **opt route vào dynamic rendering** (vì phụ thuộc request) — khác với params.
- Có thể có nhiều dynamic segment lồng nhau: `[category]/[id]`.

**Insight phỏng vấn**: nói được "params là Promise trong Next 15 và tại sao" là điểm cộng lớn — chứng tỏ bạn theo sát version thật chứ không học tài liệu cũ.

### Code minh hoạ

```tsx
// app/blog/[slug]/page.tsx — Next.js 15
type Props = {
  params: Promise<{ slug: string }>; // Next 15: Promise, PHẢI await
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Prerender các slug này lúc build (SSG)
export async function generateStaticParams() {
  const posts = await fetchAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

// Nếu true (mặc định): slug lạ render on-demand rồi cache
// Nếu false: slug không có trong generateStaticParams → 404
export const dynamicParams = true;

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
// app/blog/[slug]/LikeButton.tsx
("use client");
import { use } from "react";

export function LikeButton({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params); // unwrap Promise trong Client Component
  return <button onClick={() => like(slug)}>Thích</button>;
}
```

### Đáp án mẫu

> "Dynamic route khai báo bằng folder trong ngoặc vuông — `app/blog/[slug]/page.tsx` match `/blog/bat-ky-gi`, giá trị nằm trong prop `params`. Điểm quan trọng ở Next.js 15: `params` và `searchParams` giờ là **Promise**, phải `await` trong Server Component hoặc `React.use()` trong Client Component — Next 14 trở về trước là object đồng bộ. Lý do Next chuyển sang async là để server stream được phần UI không phụ thuộc request trước, phục vụ PPR. Muốn prerender lúc build, em export `generateStaticParams` trả về mảng params — tương đương `getStaticPaths` cũ; kết hợp `dynamicParams = false` nếu muốn 404 với params lạ. Một lưu ý em hay nhắc team: đọc `searchParams` sẽ khiến route thành dynamic rendering vì nó phụ thuộc request, còn `params` với `generateStaticParams` thì vẫn static được."

---

## Câu 11: Catch-all routes và optional catch-all routes khác nhau thế nào? `[Intermediate]`

### Câu hỏi

> Phân biệt catch-all route `[...slug]` và optional catch-all route `[[...slug]]`. Khi nào dùng từng loại?

### Giải thích lý thuyết

Cả hai đều match **nhiều segment** một lúc, params trả về **mảng string**. Khác biệt duy nhất nhưng quyết định: **có match route gốc (segment rỗng) hay không**.

| Pattern                    | `/docs` | `/docs/a` | `/docs/a/b/c` | `slug` nhận được          |
| -------------------------- | ------- | --------- | ------------- | ------------------------- |
| `docs/[...slug]/page.tsx`  | ❌ 404  | ✅        | ✅            | `["a"]`, `["a","b","c"]`  |
| `docs/[[...slug]]/page.tsx`| ✅      | ✅        | ✅            | `undefined`, `["a"]`, ... |

- **Catch-all `[...slug]`**: yêu cầu **ít nhất 1 segment**. `/docs` không match — nếu muốn `/docs` có trang riêng phải tạo thêm `docs/page.tsx`.
- **Optional catch-all `[[...slug]]`**: match cả root. Khi vào `/docs`, `slug` là `undefined` (không phải mảng rỗng) — phải handle case này. Lưu ý: **không được** tồn tại đồng thời `docs/page.tsx` và `docs/[[...slug]]/page.tsx` — conflict vì cả hai cùng match `/docs`.

Use case kinh điển: **docs site** — nội dung lấy từ CMS/filesystem với đường dẫn sâu tuỳ ý (`/docs/getting-started/installation/macos`). Một file `[[...slug]]/page.tsx` xử lý cả trang chủ docs lẫn mọi trang con, thay vì tạo hàng trăm folder.

**Insight phỏng vấn**: interviewer muốn nghe đúng 1 ý — `[[...slug]]` match cả root còn `[...slug]` thì không — kèm 1 ví dụ thực tế (docs/CMS). Bonus: nhắc được `slug` là `undefined` ở root (pitfall hay quên) và độ ưu tiên matching (route tĩnh > dynamic > catch-all).

### Code minh hoạ

```tsx
// app/docs/[[...slug]]/page.tsx — docs site lấy content từ CMS
type Props = {
  params: Promise<{ slug?: string[] }>; // optional → có thể undefined
};

export async function generateStaticParams() {
  const pages = await fetchDocPages();
  // CMS trả về: ["getting-started"], ["getting-started", "installation"]...
  return [
    { slug: undefined }, // prerender cả trang gốc /docs
    ...pages.map((p) => ({ slug: p.path })),
  ];
}

export default async function DocsPage({ params }: Props) {
  const { slug } = await params; // Next 15: await

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

> "Cả hai đều match nhiều segment và trả `slug` là mảng string. Khác biệt duy nhất: `[...slug]` yêu cầu ít nhất 1 segment — `/docs` sẽ 404; còn `[[...slug]]` match luôn cả root, lúc đó `slug` là `undefined` chứ không phải mảng rỗng — pitfall hay quên handle. Use case em hay dùng là docs site: content nằm trong CMS với đường dẫn sâu tuỳ ý, một file `app/docs/[[...slug]]/page.tsx` xử lý cả `/docs` lẫn `/docs/a/b/c`, kết hợp `generateStaticParams` để prerender hết lúc build. Em chọn `[...slug]` khi trang index khác hẳn trang detail về logic — tách riêng `docs/page.tsx` cho rõ ràng; chọn `[[...slug]]` khi index chỉ là một node trong cùng cây content. Lưu ý nhỏ: không được có cả `docs/page.tsx` và `[[...slug]]` cùng lúc vì conflict ở `/docs`, và route tĩnh luôn ưu tiên hơn catch-all khi matching."

---

## Câu 12: Layouts trong App Router hoạt động như thế nào? `[Basic]`

### Câu hỏi

> Layout trong App Router hoạt động như thế nào? Root layout có gì đặc biệt, và layout có những giới hạn gì?

### Giải thích lý thuyết

`layout.tsx` là UI **bọc ngoài các page con trong cùng segment**, nhận prop `children`. Layout ở segment cha tự động bọc layout/page ở segment con — tạo thành cây lồng nhau.

**Root layout** (`app/layout.tsx`):
- **Bắt buộc** phải có trong mọi app.
- Phải render **`<html>` và `<body>`** — Next.js không tự thêm. Đây là nơi đặt font, provider toàn cục, analytics.

Đặc tính quan trọng nhất (interviewer rất hay đào): **layout KHÔNG re-render khi navigate giữa các page con của nó**. Khi đi từ `/dashboard/users` sang `/dashboard/settings`, `dashboard/layout.tsx` được **giữ nguyên** — không re-mount, state trong layout không mất, chỉ phần `children` thay đổi. Đây là "partial rendering" của App Router. Nếu cần reset/re-mount mỗi navigation (animation, form state) → dùng `template.tsx`.

Giới hạn của layout:
- **Không nhận `searchParams`** — vì layout không re-render khi navigate, searchParams cũ sẽ stale. Chỉ page nhận `searchParams`; layout vẫn nhận `params` của các segment phía trên.
- **Không biết pathname hiện tại** (Server Component) — muốn active link phải dùng Client Component với `usePathname()`.
- Không truyền data từ layout xuống page qua props — mỗi bên tự fetch (fetch được dedupe/cache nên không lo gọi trùng).

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

// app/dashboard/layout.tsx — nested layout
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      {/* Sidebar KHÔNG re-render khi đi giữa /dashboard/users ↔ /dashboard/settings
          → state mở/đóng menu, scroll position được giữ nguyên */}
      <Sidebar />
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

> "Layout là UI bọc ngoài các page con trong cùng segment, nhận prop `children`, và lồng nhau theo cây thư mục. Root layout `app/layout.tsx` bắt buộc phải có và phải tự render `<html>`, `<body>` — nơi em đặt font, providers, analytics. Điểm quan trọng nhất: layout **không re-render khi navigate** giữa các page con — đi từ `/dashboard/users` sang `/dashboard/settings` thì sidebar trong layout giữ nguyên state, chỉ `children` swap. Nếu cần re-mount mỗi navigation thì dùng `template.tsx`. Layout có vài giới hạn em luôn nhớ: không nhận `searchParams` — chính vì nó không re-render nên searchParams sẽ stale; không biết pathname ở server — active link phải tách Client Component dùng `usePathname()`; và không truyền data xuống page qua props — mỗi bên tự fetch, Next dedupe request nên không bị gọi API trùng."

---

## Câu 13: Nested layouts có lợi ích gì? `[Intermediate]`

### Câu hỏi

> Nested layouts trong App Router mang lại lợi ích gì so với cách làm layout truyền thống (1 layout chung hoặc bọc thủ công từng page)?

### Giải thích lý thuyết

Nested layout = mỗi route segment có thể có `layout.tsx` riêng, layout cha bọc layout con, tạo cây UI khớp với cây URL. Bốn lợi ích chính:

1. **UI persist + state giữ nguyên khi navigate**: đây là lợi ích lớn nhất. Khi chuyển page trong cùng segment, các layout phía trên **không re-mount** — sidebar giữ trạng thái mở/đóng, audio player tiếp tục phát, scroll position của panel không reset. Next.js chỉ fetch và render **phần cây thay đổi** (partial rendering) → navigation nhanh hơn vì payload nhỏ hơn.

2. **Code-sharing đúng phạm vi (per segment)**: UI chung cho nhóm route đặt đúng tầng — navbar ở root, sidebar ở `(dashboard)`, tabs ở `settings/`. Không phải copy navbar vào từng page (Pages Router xưa phải làm `getLayout` pattern thủ công), cũng không phải nhét điều kiện `if (isDashboard)` vào 1 layout to.

3. **Fetch data per layout**: layout là Server Component nên **tự fetch data nó cần** — layout dashboard fetch user session, layout shop fetch categories. Data fetch song song với page (không waterfall theo tree như client-side), và fetch trùng URL được dedupe tự động.

4. **Kết hợp route groups**: `(marketing)` và `(app)` cho phép 2 nhánh có root-level layout khác hẳn nhau mà URL vẫn phẳng.

Pitfall: vì layout persist, **side effect trong layout không chạy lại khi navigate** — đừng đặt logic "mỗi lần đổi trang làm X" trong layout (dùng `template.tsx` hoặc hook trong page).

### Code minh hoạ

```text
app/
├── layout.tsx                  # Root: html/body, font, providers
├── (marketing)/
│   ├── layout.tsx              # Navbar public + footer
│   └── pricing/page.tsx
└── (app)/
    ├── layout.tsx              # Fetch session, render AppShell + Sidebar
    └── dashboard/
        ├── layout.tsx          # Tabs của dashboard
        ├── analytics/page.tsx  # /dashboard/analytics
        └── reports/page.tsx    # /dashboard/reports
```

```tsx
// app/(app)/layout.tsx — fetch data per layout
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Layout tự fetch data nó cần — chạy song song với fetch của page
  const session = await getSession();

  return (
    <AppShell user={session.user}>
      <Sidebar /> {/* state mở/đóng GIỮ NGUYÊN khi đổi page */}
      {children}
    </AppShell>
  );
}

// app/(app)/dashboard/layout.tsx — tabs chỉ cho nhóm dashboard
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <DashboardTabs /> {/* /dashboard/analytics ↔ /reports: tabs không re-mount */}
      {children}        {/* chỉ phần này thay đổi → navigation rất nhanh */}
    </section>
  );
}

// Demo state persist: component client trong layout
// app/(app)/Sidebar.tsx
("use client");
import { useState } from "react";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  // Navigate giữa các page con → collapsed KHÔNG reset
  // (nếu Sidebar nằm trong từng page thì mỗi navigation sẽ mất state)
  return <aside data-collapsed={collapsed}>...</aside>;
}
```

### Đáp án mẫu

> "Lợi ích lớn nhất là **UI persist**: khi navigate giữa các page con, layout phía trên không re-mount — sidebar giữ state mở/đóng, player tiếp tục phát nhạc, và Next chỉ render lại phần cây thay đổi nên navigation nhanh hơn hẳn. Thứ hai là code-sharing đúng phạm vi: navbar ở root, sidebar ở nhóm dashboard, tabs ở segment settings — mỗi UI chung sống đúng tầng của nó, thay vì pattern `getLayout` thủ công như Pages Router. Thứ ba, layout là Server Component nên tự fetch data nó cần — layout app fetch session, layout shop fetch categories — và fetch chạy song song với page, trùng URL thì được dedupe. Kết hợp route groups, em tách `(marketing)` và `(app)` có layout gốc khác hẳn nhau mà URL vẫn sạch. Một pitfall em hay nhắc: vì layout persist, đừng đặt side effect kiểu 'mỗi lần đổi trang' trong layout — cái đó thuộc về `template.tsx` hoặc page."

---

## Câu 14: Loading UI với loading.tsx hoạt động như thế nào? `[Intermediate]`

### Câu hỏi

> File `loading.tsx` hoạt động như thế nào bên dưới? Nó liên quan gì đến Suspense và streaming?

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

Best practice: fallback nên là **skeleton** mô phỏng đúng kích thước/bố cục content thật — tránh spinner chung chung và tránh CLS khi content thay vào.

Giới hạn & lưu ý:
- `loading.tsx` áp dụng cho **cả segment** — granularity thô. Muốn loading riêng từng phần (chart load trước, table load sau) → tự đặt `<Suspense>` quanh từng async component trong page.
- `loading.tsx` bọc **page, không bọc layout cùng cấp** — layout render trước rồi mới đến boundary.
- Hoạt động tốt nhất khi page là async Server Component; page static thì fallback gần như không xuất hiện.

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

// Granular hơn: tự đặt Suspense trong page thay vì 1 loading.tsx cho cả segment
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

> "Bản chất `loading.tsx` là Next.js tự động wrap page trong một React Suspense boundary, lấy nội dung file đó làm fallback. Hai hệ quả: thứ nhất, **instant loading state** — navigate đến route có page đang await data thì skeleton hiện ngay, layout phía trên vẫn interactive, app không bị cảm giác đơ. Thứ hai, với SSR lần đầu nó chính là **streaming**: server gửi layout + fallback trước, page render xong thì stream HTML vào thay thế trong cùng response — cải thiện TTFB và perceived performance. Em luôn làm fallback dạng skeleton khớp kích thước content thật để tránh CLS, thay vì spinner chung chung. Giới hạn của nó là granularity theo cả segment — khi cần chart load trước, table load sau, em tự đặt `<Suspense>` quanh từng async component trong page; `loading.tsx` chỉ là sugar cho boundary ở mức page thôi."

---

## Câu 15: Error handling với error.tsx hoạt động ra sao? `[Intermediate]`

### Câu hỏi

> File `error.tsx` hoạt động như thế nào? Tại sao phải là Client Component, và `global-error.tsx` dùng khi nào?

### Giải thích lý thuyết

`error.tsx` khiến Next.js **tự động wrap segment trong một React Error Boundary**. Khi page hoặc component con throw lỗi lúc render (kể cả lỗi trong async Server Component), UI fallback của `error.tsx` hiện ra thay vì crash cả app — các phần ngoài boundary (layout cha, navbar) **vẫn hoạt động bình thường**.

Đặc điểm bắt buộc nhớ:

- **Phải có `'use client'`**: Error Boundary trong React là cơ chế class component với lifecycle (`componentDidCatch`) — chỉ tồn tại ở client. Server Component không có khái niệm boundary bắt lỗi runtime kiểu này.
- Nhận 2 props: **`error`** (object Error; ở production message của lỗi server bị strip, chỉ còn `error.digest` để trace log — tránh lộ thông tin nhạy cảm) và **`reset`** (function re-render lại segment — cho user "Thử lại" mà không reload trang).
- **Không bắt lỗi của layout cùng segment**: boundary nằm **bên trong** layout (`<Layout><ErrorBoundary><Page/></ErrorBoundary></Layout>`), nên lỗi throw trong `layout.tsx` cùng cấp phải được `error.tsx` của **segment cha** bắt.
- **`global-error.tsx`**: bắt lỗi của chính root layout — vì khi root layout crash thì cả `<html><body>` mất, nên `global-error.tsx` phải tự render `<html>` và `<body>`. Chỉ active ở production.
- Lỗi **không phải lỗi render** (event handler, async callback) Error Boundary **không bắt** — phải try/catch thủ công.

**Insight phỏng vấn**: hai ý ăn điểm nhất là (1) giải thích được *tại sao* phải `'use client'`, (2) biết error.tsx không bắt lỗi layout cùng cấp — đa số candidate trượt ý thứ hai.

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
    // Gửi lỗi lên monitoring (Sentry...) — message thật nằm ở server log theo digest
    reportError(error);
  }, [error]);

  return (
    <div role="alert">
      <h2>Đã có lỗi xảy ra ở dashboard</h2>
      <p>Mã lỗi: {error.digest}</p>
      {/* Thử render lại segment — hữu ích với lỗi tạm thời (network chập chờn) */}
      <button onClick={() => reset()}>Thử lại</button>
    </div>
  );
}

// Cây render thực tế — giải thích vì sao error.tsx không bắt lỗi layout cùng cấp:
// <DashboardLayout>            ← lỗi ở đây: error.tsx của segment CHA mới bắt
//   <ErrorBoundary fallback={<DashboardError />}>
//     <DashboardPage />        ← lỗi ở đây: DashboardError bắt ✅
//   </ErrorBoundary>
// </DashboardLayout>

// app/global-error.tsx — lưới an toàn cuối cùng khi ROOT layout crash
("use client");

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
```

### Đáp án mẫu

> "`error.tsx` khiến Next tự wrap segment trong React Error Boundary — page hay component con throw lỗi lúc render thì fallback hiện ra, phần còn lại của app vẫn sống. Nó bắt buộc `'use client'` vì Error Boundary là cơ chế class component với `componentDidCatch`, chỉ tồn tại ở client. Nó nhận 2 props: `error` — ở production lỗi server bị strip message, chỉ còn `digest` để đối chiếu server log, tránh lộ thông tin; và `reset` để re-render segment, cho user thử lại với lỗi tạm thời. Hai điểm em luôn lưu ý: boundary nằm **bên trong** layout nên `error.tsx` không bắt được lỗi của layout cùng segment — phải để segment cha bắt; và lỗi root layout thì cần `global-error.tsx`, file này phải tự render `<html><body>` vì root layout đã chết. Cuối cùng, Error Boundary chỉ bắt lỗi render — lỗi trong event handler vẫn phải try/catch thủ công."

---

## Câu 16: not-found.tsx dùng khi nào? `[Basic]`

### Câu hỏi

> File `not-found.tsx` và function `notFound()` dùng khi nào? Nó liên quan gì đến SEO?

### Giải thích lý thuyết

Có **2 tình huống** kích hoạt UI 404:

1. **URL không match route nào**: Next.js tự động render `app/not-found.tsx` (root). Đây là 404 "tự nhiên" — không cần code gì thêm.
2. **Route match nhưng data không tồn tại**: ví dụ `/blog/[slug]` với slug không có trong DB. Trong page, gọi **`notFound()`** từ `next/navigation` — function này **throw một error đặc biệt**, dừng render ngay tại đó và Next render `not-found.tsx` **gần nhất** trong cây segment. Vì nó throw nên code sau lời gọi không chạy — TypeScript hiểu kiểu trả về là `never`, không cần `return`.

`not-found.tsx` có thể đặt theo segment — `app/blog/not-found.tsx` cho UI 404 riêng của blog (gợi ý bài viết khác), root `app/not-found.tsx` cho phần còn lại. Lưu ý: bản thân file `not-found.tsx` của segment chỉ được kích hoạt bởi `notFound()` trong segment đó; URL hoàn toàn không match thì dùng root not-found.

**Liên quan SEO — điểm ăn tiền của câu này**: khi `notFound()` được gọi, Next trả về **HTTP status 404 thật** (với streaming, Next chèn `<meta name="robots" content="noindex">` vì status đã gửi đi trước). Điều này quan trọng vì nếu bạn chỉ render component "Không tìm thấy" với status **200** (soft 404), Google vẫn index trang rỗng đó → loãng index, hại SEO. Đây là lỗi rất phổ biến ở SPA thuần.

Pitfall: quên gọi `notFound()` khi fetch trả null → page crash hoặc render trang trống status 200.

### Code minh hoạ

```tsx
// app/blog/[slug]/page.tsx
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

  // TypeScript hiểu sau notFound() thì post chắc chắn tồn tại (never)
  return <article>{post.content}</article>;
}

// app/blog/not-found.tsx — 404 riêng cho segment blog
import Link from "next/link";

export default function BlogNotFound() {
  return (
    <div>
      <h2>Không tìm thấy bài viết</h2>
      <p>Bài viết có thể đã bị xoá hoặc đổi đường dẫn.</p>
      <Link href="/blog">Xem các bài viết khác</Link>
    </div>
  );
}

// app/not-found.tsx — 404 toàn cục (URL không match route nào)
export default function NotFound() {
  return (
    <div>
      <h2>404 — Trang không tồn tại</h2>
      <Link href="/">Về trang chủ</Link>
    </div>
  );
}

// ❌ Anti-pattern: soft 404 — trả 200 với UI "not found"
// if (!post) return <p>Không tìm thấy</p>; // Google index trang rỗng này!
```

### Đáp án mẫu

> "Có 2 tình huống: URL không match route nào thì Next tự render `app/not-found.tsx`; còn route match nhưng data không tồn tại — ví dụ slug không có trong DB — thì em gọi `notFound()` từ `next/navigation`. Function này throw một error đặc biệt, dừng render ngay và hiển thị `not-found.tsx` gần nhất trong cây segment, nên em có thể làm 404 riêng cho blog với gợi ý bài khác. Điểm quan trọng nhất về SEO: `notFound()` trả **HTTP status 404 thật** (hoặc meta noindex khi đang streaming) — khác hẳn việc tự render component 'Không tìm thấy' với status 200, tức soft 404, khiến Google index trang rỗng và loãng index. Đây là lỗi SPA thuần rất hay mắc mà Next giải quyết gọn. Thói quen của em: mọi dynamic route fetch data đều có nhánh `if (!data) notFound()` ngay sau fetch."

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
| "params là object, đọc trực tiếp `params.slug`"              | Next 15: `params`/`searchParams` là Promise — phải `await` hoặc `React.use()`     |
| "Layout re-render mỗi lần đổi trang"                         | Layout persist khi navigate giữa page con — vì vậy nó không nhận `searchParams`   |
| "`loading.tsx` chỉ là spinner tiện lợi"                      | Là Suspense boundary tự động — nền tảng của streaming và instant loading state    |
| "`error.tsx` bắt mọi lỗi của segment"                        | Không bắt lỗi layout cùng cấp (boundary nằm trong layout) và lỗi event handler    |
| "Render UI 'không tìm thấy' là đủ cho 404"                   | Phải gọi `notFound()` để trả HTTP 404/noindex thật — tránh soft 404 hại SEO       |
| "Parallel routes không cần default.tsx"                      | Thiếu `default.tsx` → 404 khi slot không match (nhất là sau hard reload)          |
| "`(..)` trong intercepting tính theo cấp thư mục"            | Tính theo **route segment** — route groups, `@slot` không tính là một cấp         |
