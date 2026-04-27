---
sidebar_position: 3
title: "3. App Router cơ bản"
---

# App Router cơ bản


---

## Mục lục

- [App Router vs Pages Router](#app-router-vs-pages-router)
- [page.tsx — Entry point cho mỗi route](#pagetsx-entry-point-cho-mỗi-route)
- [layout.tsx — Layout dùng chung](#layouttsx-layout-dùng-chung)
- [loading.tsx — Loading UI tự động](#loadingtsx-loading-ui-tự-động)
- [template.tsx vs layout.tsx](#templatetsx-vs-layouttsx)
- [Metadata API](#metadata-api)
- [Route Groups](#route-groups)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tổng kết](#tổng-kết)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## App Router vs Pages Router

Next.js có **hai hệ thống routing**: App Router (mới, khuyến nghị) và Pages Router (cũ, vẫn hỗ trợ). Bài này tập trung vào App Router — hướng đi tương lai của Next.js.

### So sánh tổng quan

| Tieu chi | App Router (`app/`) | Pages Router (`pages/`) |
|---|---|---|
| Ra mắt | Next.js 13+ (2022) | Next.js 1+ (2016) |
| Component mặc định | Server Components | Client Components |
| Data fetching | `async/await` trong component | `getServerSideProps`, `getStaticProps` |
| Layout | Nested layouts (`layout.tsx`) | Một layout duy nhất (`_app.tsx`) |
| Loading UI | `loading.tsx` tự động | Tự code loading state |
| Error handling | `error.tsx` tự động | Tự code Error Boundary |
| Streaming | Hỗ trợ Suspense | Không |
| Metadata | Metadata API | `Head` component |
| File convention | `page.tsx`, `layout.tsx`, ... | Mỗi file = 1 route |

### Ví dụ cùng một trang — hai cách viết

```tsx
// === PAGES ROUTER (cũ) ===
// pages/products.tsx
import { GetServerSideProps } from 'next';

interface Props {
  products: Product[];
}

export default function ProductsPage({ products }: Props) {
  return (
    <div>
      <h1>Sản phẩm</h1>
      {products.map((p) => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  );
}

// Data fetching tách riêng — chỉ chạy trên server
export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch('https://api.example.com/products');
  const products = await res.json();
  return { props: { products } };
};
```

```tsx
// === APP ROUTER (mới) ===
// app/products/page.tsx

// Đơn giản hơn nhiều! Fetch trực tiếp trong component
async function ProductsPage() {
  const res = await fetch('https://api.example.com/products');
  const products = await res.json();

  return (
    <div>
      <h1>Sản phẩm</h1>
      {products.map((p: any) => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  );
}

export default ProductsPage;
```

**Tại sao App Router tốt hơn?**
- Code ngắn gọn, dễ đọc hơn
- Không cần học thêm API đặc biệt (`getServerSideProps`, `getStaticProps`)
- Nested layouts giúp tái sử dụng UI
- Loading và error handling tự động
- Server Components giảm JavaScript gửi đến client

## page.tsx — Entry point cho mỗi route

`page.tsx` là file **bắt buộc** để tạo một route có thể truy cập được. Không có `page.tsx` = không có route.

### Cách hoạt động

```
Thư mục                    → URL
app/page.tsx               → /
app/about/page.tsx         → /about
app/blog/page.tsx          → /blog
app/blog/[slug]/page.tsx   → /blog/bai-viet-bat-ky
app/shop/products/page.tsx → /shop/products
```

### Ví dụ cơ bản

```tsx
// app/page.tsx — Trang chủ
export default function HomePage() {
  return (
    <div>
      <h1>Chào mừng đến website của tôi</h1>
      <p>Trang chủ với Next.js App Router</p>
    </div>
  );
}
```

### Page với dynamic route

```tsx
// app/blog/[slug]/page.tsx
// URL: /blog/hoc-nextjs, /blog/react-co-ban, ...

// params được Next.js tự động truyền vào
interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  // Fetch bài viết dựa trên slug
  const res = await fetch(`https://api.example.com/posts/${slug}`);
  const post = await res.json();

  return (
    <article>
      <h1>{post.title}</h1>
      <p>Slug: {slug}</p>
      <div>{post.content}</div>
    </article>
  );
}
```

### Page nhận search params

```tsx
// app/products/page.tsx
// URL: /products?category=dien-thoai&page=2

interface Props {
  searchParams: Promise<{ category?: string; page?: string }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const { category, page } = await searchParams;
  const currentPage = Number(page) || 1;

  return (
    <div>
      <h1>Sản phẩm</h1>
      {category && <p>Danh mục: {category}</p>}
      <p>Trang: {currentPage}</p>
    </div>
  );
}
```

## layout.tsx — Layout dùng chung

`layout.tsx` bọc xung quanh `page.tsx` và các child routes. Điểm đặc biệt: layout **không re-render** khi navigate giữa các child routes.

### Root Layout (bắt buộc)

Mỗi dự án Next.js **bắt buộc** phải có root layout tại `app/layout.tsx`:

```tsx
// app/layout.tsx — BẮT BUỘC
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Tải font Inter từ Google Fonts (tự động tối ưu)
const inter = Inter({ subsets: ['latin'] });

// Metadata cho SEO — áp dụng cho toàn bộ site
export const metadata: Metadata = {
  title: {
    default: 'My App',           // Title mặc định
    template: '%s | My App',     // Template cho child pages
  },
  description: 'Ứng dụng web tuyệt vời với Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        {/* Header hiển thị trên MỌI trang */}
        <header className="bg-white shadow-sm p-4">
          <nav className="max-w-6xl mx-auto flex gap-4">
            <a href="/">Trang chủ</a>
            <a href="/blog">Blog</a>
            <a href="/about">Về chúng tôi</a>
          </nav>
        </header>

        {/* Nội dung trang thay đổi theo route */}
        <main className="max-w-6xl mx-auto p-4">
          {children}
        </main>

        {/* Footer hiển thị trên MỌI trang */}
        <footer className="bg-gray-100 p-4 text-center">
          <p>2024 My App. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
```

**Quy tắc root layout:**
- **Bắt buộc** có thẻ `<html>` và `<body>`
- Chỉ root layout mới được chứa `<html>` và `<body>`
- `children` là nơi page.tsx hoặc child layout sẽ được render

### Nested Layouts

Bạn có thể tạo layout riêng cho từng section:

```tsx
// app/dashboard/layout.tsx
// Layout riêng cho tất cả trang trong /dashboard/*

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      {/* Sidebar chỉ hiển thị trong dashboard */}
      <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
        <h2 className="text-xl font-bold mb-4">Dashboard</h2>
        <nav className="flex flex-col gap-2">
          <a href="/dashboard">Tổng quan</a>
          <a href="/dashboard/products">Sản phẩm</a>
          <a href="/dashboard/orders">Đơn hàng</a>
          <a href="/dashboard/settings">Cài đặt</a>
        </nav>
      </aside>

      {/* Nội dung dashboard thay đổi theo route */}
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
}
```

```tsx
// app/dashboard/page.tsx — Route: /dashboard
export default function DashboardPage() {
  return <h1>Tổng quan Dashboard</h1>;
}

// app/dashboard/products/page.tsx — Route: /dashboard/products
export default function ProductsPage() {
  return <h1>Quản lý sản phẩm</h1>;
}
```

Kết quả: Khi navigate giữa `/dashboard` và `/dashboard/products`, sidebar **không re-render** — chỉ phần nội dung thay đổi. Mượt mà và nhanh!

### Cách layout lồng nhau (nesting)

```
app/
├── layout.tsx              ← Root layout (header + footer)
├── page.tsx                ← /
├── dashboard/
│   ├── layout.tsx          ← Dashboard layout (sidebar)
│   ├── page.tsx            ← /dashboard
│   └── settings/
│       ├── layout.tsx      ← Settings layout (tabs)
│       └── page.tsx        ← /dashboard/settings

Khi truy cập /dashboard/settings:
┌─────────────────────────────────┐
│ Root Layout (header)            │
│ ┌─────────────────────────────┐ │
│ │ Dashboard Layout (sidebar)  │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ Settings Layout (tabs)  │ │ │
│ │ │ ┌─────────────────────┐ │ │ │
│ │ │ │ Settings Page       │ │ │ │
│ │ │ └─────────────────────┘ │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│ Root Layout (footer)            │
└─────────────────────────────────┘
```

## loading.tsx — Loading UI tự động

Khi bạn tạo file `loading.tsx`, Next.js tự động bọc page trong React Suspense và hiển thị loading UI khi trang đang tải.

### Cách hoạt động

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto" />
        <p className="mt-4 text-gray-500">Đang tải...</p>
      </div>
    </div>
  );
}
```

```tsx
// app/dashboard/page.tsx
// Page này mất thời gian tải do fetch data
async function DashboardPage() {
  // Giả sử API mất 2 giây
  const res = await fetch('https://api.example.com/dashboard', {
    cache: 'no-store',
  });
  const data = await res.json();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Tổng doanh thu: {data.revenue} VND</p>
    </div>
  );
}

export default DashboardPage;
```

Khi truy cập `/dashboard`:
1. Next.js hiển thị `loading.tsx` ngay lập tức
2. Đồng thời fetch data ở server
3. Khi data sẵn sàng, thay thế loading bằng nội dung thực

### Skeleton loading (nâng cao)

```tsx
// app/products/loading.tsx
// Skeleton UI giống cấu trúc trang thật — trải nghiệm tốt hơn spinner
export default function ProductsLoading() {
  return (
    <div>
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6 animate-pulse" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <div className="h-48 bg-gray-200 rounded mb-4" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

## template.tsx vs layout.tsx

`template.tsx` giống `layout.tsx` nhưng có một điểm khác biệt quan trọng: template **re-render mỗi lần navigate**.

### So sánh

| Tieu chi | `layout.tsx` | `template.tsx` |
|---|---|---|
| Re-render khi navigate | **Khong** (giu state) | **Co** (re-mount) |
| DOM giu nguyen | Co | Khong (tao DOM moi) |
| useEffect chay lai | Khong | Co (moi lan navigate) |
| State reset | Khong | Co |
| Dung cho | Header, sidebar, navigation | Animations, page transitions, logging |

### Ví dụ: Khi nào dùng template

```tsx
// app/blog/template.tsx
// Re-render mỗi khi navigate giữa các bài blog
'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function BlogTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Chạy MỖI LẦN navigate — phù hợp cho analytics
    console.log('Đã xem trang blog mới');
    // trackPageView(window.location.pathname);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```

**Quy tắc chọn:**
- Mặc định dùng `layout.tsx` (performance tốt hơn vì không re-render)
- Dùng `template.tsx` khi cần animation enter/exit hoặc cần reset state mỗi lần navigate

## Metadata API

Next.js cung cấp Metadata API để quản lý SEO — thẻ `<title>`, `<meta>`, Open Graph, v.v.

### Static Metadata

```tsx
// app/about/page.tsx
import type { Metadata } from 'next';

// Metadata tĩnh — biết trước nội dung
export const metadata: Metadata = {
  title: 'Về chúng tôi',
  description: 'Tìm hiểu về đội ngũ và sứ mệnh của chúng tôi',
  openGraph: {
    title: 'Về chúng tôi | My App',
    description: 'Tìm hiểu về đội ngũ và sứ mệnh của chúng tôi',
    images: ['/images/about-og.jpg'],
  },
};

export default function AboutPage() {
  return (
    <div>
      <h1>Về chúng tôi</h1>
      <p>Chúng tôi là đội ngũ đam mê công nghệ.</p>
    </div>
  );
}
```

### Dynamic Metadata

```tsx
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

// Metadata động — phụ thuộc vào dữ liệu
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await fetch(`https://api.example.com/posts/${slug}`);
  const post = await res.json();

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const res = await fetch(`https://api.example.com/posts/${slug}`);
  const post = await res.json();

  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  );
}
```

### Metadata kế thừa (inheritance)

```tsx
// app/layout.tsx — Metadata mặc định cho toàn site
export const metadata: Metadata = {
  title: {
    default: 'My App',
    template: '%s | My App',  // %s sẽ được thay bằng title của child
  },
  description: 'Ứng dụng web với Next.js',
};

// app/about/page.tsx
export const metadata: Metadata = {
  title: 'Về chúng tôi',  // Kết quả: "Về chúng tôi | My App"
};

// app/blog/page.tsx
export const metadata: Metadata = {
  title: 'Blog',  // Kết quả: "Blog | My App"
};
```

## Route Groups

Route Groups dùng dấu ngoặc đơn `()` để tổ chức code mà **không ảnh hưởng URL**.

```
app/
├── (marketing)/           ← Route group — không ảnh hưởng URL
│   ├── layout.tsx         ← Layout riêng cho marketing pages
│   ├── page.tsx           ← Route: / (không phải /(marketing))
│   ├── about/
│   │   └── page.tsx       ← Route: /about
│   └── pricing/
│       └── page.tsx       ← Route: /pricing
├── (shop)/                ← Route group khác
│   ├── layout.tsx         ← Layout riêng cho shop pages
│   ├── products/
│   │   └── page.tsx       ← Route: /products
│   └── cart/
│       └── page.tsx       ← Route: /cart
└── (auth)/
    ├── login/
    │   └── page.tsx       ← Route: /login
    └── register/
        └── page.tsx       ← Route: /register
```

```tsx
// app/(marketing)/layout.tsx
// Layout cho marketing pages — có hero section, CTA buttons
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
        <p>Khuyến mãi đặc biệt! Giảm 50% cho đơn hàng đầu tiên</p>
      </div>
      {children}
    </div>
  );
}

// app/(shop)/layout.tsx
// Layout cho shop pages — có cart icon, breadcrumbs
export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex justify-between p-4 border-b">
        <span>Shop</span>
        <span>Giỏ hàng (0)</span>
      </div>
      {children}
    </div>
  );
}
```

## Lỗi thường gặp

### 1. Quên tạo Root Layout

```tsx
// SAI: Không có root layout
// app/page.tsx chạy không có layout bọc → lỗi

// ĐÚNG: Luôn phải có app/layout.tsx
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
```

### 2. Thêm html/body vào nested layout

```tsx
// SAI: Nested layout có <html> và <body>
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>        {/* SAI! Chỉ root layout mới có html */}
      <body>      {/* SAI! Chỉ root layout mới có body */}
        <div>{children}</div>
      </body>
    </html>
  );
}

// ĐÚNG: Nested layout không có html/body
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <aside>Sidebar</aside>
      <main>{children}</main>
    </div>
  );
}
```

### 3. Nhầm layout với template

```tsx
// SAI: Dùng layout khi cần animation mỗi lần navigate
// app/blog/layout.tsx — KHÔNG re-render → animation chỉ chạy 1 lần
'use client';
import { motion } from 'framer-motion';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {children}  {/* Animation chỉ chạy lần đầu! */}
    </motion.div>
  );
}

// ĐÚNG: Dùng template cho animation mỗi lần navigate
// app/blog/template.tsx — RE-RENDER mỗi lần navigate
'use client';
import { motion } from 'framer-motion';

export default function BlogTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {children}  {/* Animation chạy mỗi lần chuyển trang */}
    </motion.div>
  );
}
```

### 4. Tạo thư mục nhưng quên page.tsx

```
# SAI: Có thư mục nhưng không có page.tsx → truy cập /about bị 404
app/about/
└── layout.tsx    ← Có layout nhưng không có page!

# ĐÚNG: Phải có page.tsx để tạo route truy cập được
app/about/
├── layout.tsx
└── page.tsx      ← Route /about hoạt động ✓
```

### 5. Metadata trong Client Component

```tsx
// SAI: export metadata trong Client Component
'use client'; // ← Client Component

export const metadata = {  // LỖI! Metadata chỉ dùng trong Server Component
  title: 'About',
};

export default function AboutPage() {
  return <h1>About</h1>;
}

// ĐÚNG: Tách metadata ra — page mặc định là Server Component
// Bỏ 'use client' ở page, hoặc dùng generateMetadata
export const metadata = {
  title: 'About',
};

export default function AboutPage() {
  return <h1>About</h1>;
}
```

## Tổng kết

| Khai niem | Mo ta |
|---|---|
| App Router | He thong routing moi dung `app/` directory |
| `page.tsx` | File bat buoc de tao route truy cap duoc |
| `layout.tsx` | Layout boc page, KHONG re-render khi navigate |
| `template.tsx` | Giong layout nhung RE-RENDER moi lan navigate |
| `loading.tsx` | Loading UI tu dong voi React Suspense |
| `error.tsx` | Error handling UI tu dong |
| Route Groups `()` | To chuc code khong anh huong URL |
| Metadata API | Quan ly SEO (title, description, Open Graph) |
| Nested Layouts | Layout long nhau theo cay thu muc |

## Câu hỏi phỏng vấn

### Câu 1: Giải thích cách layout hoạt động trong Next.js App Router?

**Trả lời:**

Layout trong App Router bọc xung quanh page và child routes. Đặc điểm quan trọng nhất: layout **giữ state và không re-render** khi navigate giữa các child routes.

- **Root layout** (`app/layout.tsx`): Bắt buộc, chứa `<html>` và `<body>`, áp dụng cho toàn bộ site.
- **Nested layout**: Layout trong thư mục con, tự động lồng vào parent layout.
- Layout nhận prop `children` — là nơi page hoặc child layout được render.
- Khi navigate từ `/dashboard` sang `/dashboard/settings`, dashboard layout **giữ nguyên** (sidebar không re-render), chỉ phần `children` thay đổi.

### Câu 2: Sự khác nhau giữa layout.tsx và template.tsx?

**Trả lời:**

- **`layout.tsx`**: Persist giữa các navigation. State được giữ, DOM không thay đổi, useEffect không chạy lại. Dùng cho header, sidebar, navigation.
- **`template.tsx`**: Re-mount mỗi lần navigate. State reset, DOM tạo mới, useEffect chạy lại. Dùng cho page transitions, animations, logging/analytics.

Mặc định luôn dùng `layout.tsx` vì performance tốt hơn. Chỉ dùng `template.tsx` khi có lý do cụ thể.

### Câu 3: loading.tsx hoạt động như thế nào?

**Trả lời:**

`loading.tsx` tự động tạo loading UI bằng React Suspense. Khi Next.js render một page:

1. Hiển thị `loading.tsx` ngay lập tức (instant loading state)
2. Đồng thời fetch data trên server (streaming)
3. Khi data sẵn sàng, thay thế loading bằng nội dung thực
4. Nếu navigate sang route khác trước khi load xong, navigation vẫn diễn ra ngay (không bị block)

Cơ chế này gọi là **Streaming SSR** — server gửi HTML theo từng phần, không cần đợi tất cả data sẵn sàng.

### Câu 4: Route Groups dùng để làm gì?

**Trả lời:**

Route Groups (thư mục bọc trong dấu ngoặc đơn `()`) dùng để:

1. **Tổ chức code** theo logic mà không ảnh hưởng URL: `(marketing)/about/page.tsx` tạo route `/about`, không phải `/(marketing)/about`.
2. **Layout riêng** cho từng nhóm: marketing pages có layout khác shop pages.
3. **Tách root layout**: Có thể có nhiều root layout cho các section khác nhau (ví dụ: marketing dùng layout A, app dùng layout B).

### Câu 5: Metadata API trong Next.js hoạt động ra sao?

**Trả lời:**

Metadata API quản lý SEO thông qua hai cách:

1. **Static Metadata**: Export object `metadata` từ `page.tsx` hoặc `layout.tsx` (Server Components).
2. **Dynamic Metadata**: Export function `generateMetadata` khi cần fetch data để tạo metadata.

Metadata có tính **kế thừa** — child page kế thừa metadata từ parent layout. Child có thể override bằng cách export metadata riêng. Dùng `title.template` ở layout để tạo pattern thống nhất (ví dụ: `"%s | My App"`).
