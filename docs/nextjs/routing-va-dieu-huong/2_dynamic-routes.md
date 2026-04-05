---
sidebar_position: 2
title: "Dynamic Routes"
---

# Dynamic Routes

## Dynamic Segments

Dynamic Routes cho phép tạo route từ **dữ liệu động** — không cần biết trước tất cả URL. Thay vì tạo file cho mỗi bài viết blog, bạn tạo **một route template** xử lý tất cả.

### Cú pháp: `[paramName]`

Đặt tên folder trong dấu ngoặc vuông để tạo dynamic segment:

```
app/
├── blog/
│   ├── page.tsx           → /blog (danh sách bài viết)
│   └── [slug]/
│       └── page.tsx       → /blog/bai-viet-1, /blog/hoc-nextjs, ...
├── products/
│   └── [id]/
│       └── page.tsx       → /products/1, /products/abc, ...
└── users/
    └── [userId]/
        ├── page.tsx       → /users/123
        └── posts/
            └── page.tsx   → /users/123/posts
```

### Đọc params trong Server Component

```tsx
// app/blog/[slug]/page.tsx

// Next.js 15+: params là Promise, cần await
export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch dữ liệu dựa trên slug
  const post = await fetch(
    `https://api.example.com/posts/${slug}`
  ).then((res) => res.json());

  return (
    <article>
      <h1>{post.title}</h1>
      <p>Slug: {slug}</p>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
```

### Đọc params trong Client Component

```tsx
"use client";

import { useParams } from "next/navigation";

// Trong Client Component, dùng useParams hook
export default function ProductDetail() {
  const params = useParams<{ id: string }>();

  return (
    <div>
      <h1>Sản phẩm #{params.id}</h1>
    </div>
  );
}
```

### Nested Dynamic Routes

Dynamic routes có thể lồng nhau:

```
app/
└── shop/
    └── [category]/
        ├── page.tsx              → /shop/ao-thun
        └── [productId]/
            └── page.tsx          → /shop/ao-thun/sp-001
```

```tsx
// app/shop/[category]/[productId]/page.tsx
export default async function ProductPage({
  params,
}: {
  params: Promise<{ category: string; productId: string }>;
}) {
  const { category, productId } = await params;

  return (
    <div>
      <nav>
        {/* Breadcrumb */}
        <span>Cửa hàng</span> / <span>{category}</span> / <span>{productId}</span>
      </nav>
      <h1>Sản phẩm: {productId}</h1>
      <p>Danh mục: {category}</p>
    </div>
  );
}
```

## Catch-all Segments `[...slug]`

Catch-all segments bắt **tất cả các segment con** vào một mảng. Dùng dấu `...` trước tên param.

```
app/docs/[...slug]/page.tsx
```

| URL | `params.slug` |
|-----|---------------|
| `/docs/a` | `['a']` |
| `/docs/a/b` | `['a', 'b']` |
| `/docs/a/b/c` | `['a', 'b', 'c']` |
| `/docs` | **404** (catch-all yêu cầu ít nhất 1 segment) |

### Ví dụ thực tế: Trang tài liệu

```tsx
// app/docs/[...slug]/page.tsx
export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;

  // slug = ['nextjs', 'routing', 'dynamic-routes']
  // → Tìm file: docs/nextjs/routing/dynamic-routes.md
  const docPath = slug.join("/");

  const content = await fetch(
    `https://api.example.com/docs/${docPath}`
  ).then((res) => res.json());

  return (
    <div className="flex">
      {/* Sidebar điều hướng */}
      <aside className="w-64">
        <nav>
          <h3>Tài liệu</h3>
          {/* Tự động tạo breadcrumb từ slug */}
          <ol>
            {slug.map((segment, index) => (
              <li key={index}>
                {segment.replace(/-/g, " ")}
              </li>
            ))}
          </ol>
        </nav>
      </aside>

      {/* Nội dung tài liệu */}
      <article className="flex-1 p-6">
        <h1>{content.title}</h1>
        <div>{content.body}</div>
      </article>
    </div>
  );
}
```

## Optional Catch-all `[[...slug]]`

Thêm dấu ngoặc vuông kép để làm catch-all trở thành **optional** — route cha (không có segment nào) cũng match.

```
app/docs/[[...slug]]/page.tsx
```

| URL | `params.slug` |
|-----|---------------|
| `/docs` | `undefined` (hoặc `[]` tùy version) |
| `/docs/a` | `['a']` |
| `/docs/a/b` | `['a', 'b']` |
| `/docs/a/b/c` | `['a', 'b', 'c']` |

### So sánh catch-all vs optional catch-all

```tsx
// app/docs/[[...slug]]/page.tsx
export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;

  // Nếu không có slug → hiện trang tổng quan
  if (!slug || slug.length === 0) {
    return (
      <div>
        <h1>Tài liệu</h1>
        <p>Chọn một mục từ sidebar để bắt đầu đọc.</p>
      </div>
    );
  }

  // Có slug → hiện nội dung tương ứng
  const docPath = slug.join("/");
  return (
    <div>
      <h1>Tài liệu: {docPath}</h1>
    </div>
  );
}
```

## generateStaticParams — Static Generation cho Dynamic Routes

`generateStaticParams` cho phép **tạo trước các trang tĩnh** (Static Site Generation) cho dynamic routes tại build time.

### Cách hoạt động

```tsx
// app/blog/[slug]/page.tsx

// Hàm này chạy tại BUILD TIME
// Trả về mảng các params cần pre-render
export async function generateStaticParams() {
  // Fetch danh sách bài viết từ API hoặc CMS
  const posts = await fetch("https://api.example.com/posts").then((res) =>
    res.json()
  );

  // Trả về mảng object, mỗi object chứa params
  return posts.map((post: { slug: string }) => ({
    slug: post.slug,
  }));
  // Kết quả: [{ slug: 'bai-1' }, { slug: 'bai-2' }, ...]
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetch(
    `https://api.example.com/posts/${slug}`
  ).then((res) => res.json());

  return (
    <article>
      <h1>{post.title}</h1>
      <time>{post.publishedAt}</time>
      <div>{post.content}</div>
    </article>
  );
}
```

### generateStaticParams cho Nested Dynamic Routes

```tsx
// app/shop/[category]/[productId]/page.tsx

// Có thể tạo params cho nested dynamic routes
export async function generateStaticParams() {
  const categories = await fetch(
    "https://api.example.com/categories"
  ).then((res) => res.json());

  // Tạo tổ hợp category + product
  const paths: { category: string; productId: string }[] = [];

  for (const cat of categories) {
    const products = await fetch(
      `https://api.example.com/categories/${cat.slug}/products`
    ).then((res) => res.json());

    for (const product of products) {
      paths.push({
        category: cat.slug,
        productId: product.id.toString(),
      });
    }
  }

  return paths;
  // [{ category: 'ao-thun', productId: '1' }, { category: 'ao-thun', productId: '2' }, ...]
}
```

### Tối ưu: generateStaticParams ở từng cấp

```tsx
// app/shop/[category]/page.tsx
// Cấp 1: Tạo params cho category
export async function generateStaticParams() {
  const categories = await fetch(
    "https://api.example.com/categories"
  ).then((res) => res.json());

  return categories.map((cat: { slug: string }) => ({
    category: cat.slug,
  }));
}
```

```tsx
// app/shop/[category]/[productId]/page.tsx
// Cấp 2: Nhận params từ cấp cha, tạo params cho cấp con
export async function generateStaticParams({
  params: { category },
}: {
  params: { category: string };
}) {
  const products = await fetch(
    `https://api.example.com/categories/${category}/products`
  ).then((res) => res.json());

  return products.map((product: { id: number }) => ({
    productId: product.id.toString(),
  }));
}
```

### dynamicParams — Kiểm soát fallback behavior

```tsx
// app/blog/[slug]/page.tsx

// true (mặc định): Nếu URL không nằm trong generateStaticParams,
//   Next.js sẽ render on-demand (SSR) và cache
// false: Trả về 404 nếu URL không nằm trong generateStaticParams
export const dynamicParams = false;

export async function generateStaticParams() {
  // Chỉ các slug này mới accessible
  return [{ slug: "bai-1" }, { slug: "bai-2" }];
}
```

## searchParams — Query String

Ngoài dynamic segments (path params), Next.js cung cấp truy cập **search params** (query string) qua props.

```tsx
// URL: /products?category=ao-thun&sort=price&page=2

// Server Component
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const { category, sort, page } = await searchParams;

  const currentPage = Number(page) || 1;
  const sortBy = sort || "newest";

  const products = await fetch(
    `https://api.example.com/products?category=${category}&sort=${sortBy}&page=${currentPage}`
  ).then((res) => res.json());

  return (
    <div>
      <h1>Sản phẩm {category ? `— ${category}` : ""}</h1>
      <p>Sắp xếp: {sortBy} | Trang: {currentPage}</p>
      <ul>
        {products.map((p: { id: number; name: string }) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

```tsx
"use client";

// Client Component — dùng useSearchParams hook
import { useSearchParams } from "next/navigation";

export default function FilterBar() {
  const searchParams = useSearchParams();

  const category = searchParams.get("category"); // 'ao-thun'
  const sort = searchParams.get("sort");           // 'price'

  return (
    <div>
      <p>Danh mục hiện tại: {category || "Tất cả"}</p>
      <p>Sắp xếp theo: {sort || "Mới nhất"}</p>
    </div>
  );
}
```

## TypeScript Types cho Params

### Định nghĩa types rõ ràng

```tsx
// types/routes.ts — Tập trung types cho tất cả routes

// Single dynamic segment
type BlogPostParams = {
  slug: string;
};

// Multiple dynamic segments
type ProductParams = {
  category: string;
  productId: string;
};

// Catch-all segment
type DocsParams = {
  slug: string[];
};

// Optional catch-all
type OptionalDocsParams = {
  slug?: string[];
};

// Search params (luôn là string hoặc string[] hoặc undefined)
type ProductSearchParams = {
  category?: string;
  sort?: string;
  page?: string;
  q?: string;
};
```

```tsx
// app/blog/[slug]/page.tsx
import type { BlogPostParams } from "@/types/routes";

// Next.js 15+: Cả params và searchParams đều là Promise
type BlogPostPageProps = {
  params: Promise<BlogPostParams>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function BlogPost({
  params,
  searchParams,
}: BlogPostPageProps) {
  const { slug } = await params;
  const query = await searchParams;

  return <article>Bài viết: {slug}</article>;
}
```

### generateMetadata với Dynamic Routes

```tsx
// app/blog/[slug]/page.tsx
import type { Metadata } from "next";

// Tạo metadata động (SEO) dựa trên params
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const post = await fetch(
    `https://api.example.com/posts/${slug}`
  ).then((res) => res.json());

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
```

## Ví dụ thực tế: Blog hoàn chỉnh

```tsx
// app/blog/page.tsx — Trang danh sách bài viết
import Link from "next/link";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  category: string;
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { category, page } = await searchParams;
  const currentPage = Number(page) || 1;

  // Fetch với filter và phân trang
  const url = new URL("https://api.example.com/posts");
  if (category) url.searchParams.set("category", category);
  url.searchParams.set("page", currentPage.toString());

  const { posts, total } = await fetch(url).then((res) => res.json());

  return (
    <div>
      <h1>Blog</h1>

      {/* Bộ lọc danh mục */}
      <nav className="flex gap-2 mb-6">
        <Link href="/blog">Tất cả</Link>
        <Link href="/blog?category=nextjs">Next.js</Link>
        <Link href="/blog?category=react">React</Link>
        <Link href="/blog?category=typescript">TypeScript</Link>
      </nav>

      {/* Danh sách bài viết */}
      <div className="space-y-4">
        {posts.map((post: Post) => (
          <article key={post.slug} className="border rounded-lg p-4">
            <Link href={`/blog/${post.slug}`}>
              <h2 className="text-xl font-bold">{post.title}</h2>
            </Link>
            <p className="text-gray-600">{post.excerpt}</p>
            <time className="text-sm text-gray-400">
              {post.publishedAt}
            </time>
          </article>
        ))}
      </div>

      {/* Phân trang */}
      <div className="flex gap-2 mt-8">
        {currentPage > 1 && (
          <Link
            href={`/blog?${category ? `category=${category}&` : ""}page=${currentPage - 1}`}
          >
            Trang trước
          </Link>
        )}
        <Link
          href={`/blog?${category ? `category=${category}&` : ""}page=${currentPage + 1}`}
        >
          Trang sau
        </Link>
      </div>
    </div>
  );
}
```

```tsx
// app/blog/[slug]/page.tsx — Trang chi tiết bài viết
import Link from "next/link";
import type { Metadata } from "next";

type Post = {
  slug: string;
  title: string;
  content: string;
  publishedAt: string;
  author: { name: string; avatar: string };
  category: string;
  tags: string[];
};

// Static generation cho tất cả bài viết
export async function generateStaticParams() {
  const posts = await fetch("https://api.example.com/posts").then(
    (res) => res.json()
  );
  return posts.map((post: { slug: string }) => ({
    slug: post.slug,
  }));
}

// SEO metadata động
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post: Post = await fetch(
    `https://api.example.com/posts/${slug}`
  ).then((res) => res.json());

  return {
    title: `${post.title} | Blog`,
    description: post.content.slice(0, 160),
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post: Post = await fetch(
    `https://api.example.com/posts/${slug}`
  ).then((res) => res.json());

  return (
    <article className="max-w-3xl mx-auto p-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/blog">Blog</Link>
        {" / "}
        <Link href={`/blog?category=${post.category}`}>
          {post.category}
        </Link>
        {" / "}
        <span>{post.title}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

      {/* Thông tin tác giả */}
      <div className="flex items-center gap-3 mb-6">
        <span className="font-medium">{post.author.name}</span>
        <time className="text-gray-500">{post.publishedAt}</time>
      </div>

      {/* Nội dung */}
      <div className="prose">{post.content}</div>

      {/* Tags */}
      <div className="flex gap-2 mt-8">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="bg-gray-100 px-3 py-1 rounded-full text-sm"
          >
            #{tag}
          </span>
        ))}
      </div>
    </article>
  );
}
```

## Lỗi thường gặp

### 1. Quên await params trong Next.js 15+

```tsx
// SAI: params không phải object trực tiếp nữa
export default function Page({ params }: { params: { slug: string } }) {
  return <h1>{params.slug}</h1>; // Lỗi hoặc undefined
}

// ĐÚNG: await params (Next.js 15+)
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <h1>{slug}</h1>;
}
```

### 2. Nhầm catch-all và optional catch-all

```
[...slug]    → /docs         sẽ 404
[[...slug]]  → /docs         OK, slug = undefined
```

Nếu cần route cha cũng accessible, dùng `[[...slug]]`.

### 3. generateStaticParams trả về sai kiểu

```tsx
// SAI: Trả về number thay vì string
export async function generateStaticParams() {
  return [{ id: 1 }, { id: 2 }]; // id phải là string!
}

// ĐÚNG: Luôn trả về string
export async function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }];
}
```

### 4. searchParams là string, không phải number

```tsx
// SAI: Dùng trực tiếp làm number
const page = searchParams.page + 1; // "2" + 1 = "21" (string concat!)

// ĐÚNG: Convert sang number
const page = Number(searchParams.page) || 1;
```

### 5. Thiếu xử lý khi dữ liệu không tìm thấy

```tsx
// SAI: Không xử lý 404
export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  return <h1>{post.title}</h1>; // Crash nếu post = null
}

// ĐÚNG: Gọi notFound() khi không tìm thấy
import { notFound } from "next/navigation";

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound(); // Hiển thị not-found.tsx
  }

  return <h1>{post.title}</h1>;
}
```

## Câu hỏi phỏng vấn

### Câu 1: Sự khác biệt giữa `[slug]`, `[...slug]`, và `[[...slug]]`?

**Trả lời:**
- `[slug]` — Dynamic segment, match **đúng 1 segment**. VD: `/blog/bai-1` match, `/blog/a/b` không match.
- `[...slug]` — Catch-all segment, match **1 hoặc nhiều segment**. VD: `/docs/a`, `/docs/a/b`, `/docs/a/b/c` đều match. Nhưng `/docs` (không có segment) sẽ 404.
- `[[...slug]]` — Optional catch-all, match **0 hoặc nhiều segment**. Giống catch-all nhưng `/docs` (không segment) cũng match, `slug` sẽ là `undefined`.

Dùng `[slug]` cho đa số trường hợp (blog, product). Dùng `[...slug]` cho cấu trúc phân cấp (docs). Dùng `[[...slug]]` khi cần cả trang cha lẫn trang con dùng chung component.

### Câu 2: generateStaticParams dùng để làm gì? Khi nào nên dùng?

**Trả lời:** `generateStaticParams` chạy tại **build time** để tạo danh sách params cần pre-render thành HTML tĩnh (Static Site Generation). Nên dùng khi:
- Nội dung ít thay đổi (blog, docs, landing pages)
- Cần tốc độ tải nhanh (HTML tĩnh serve từ CDN)
- Muốn SEO tốt (full HTML available cho crawler)

Kết hợp với `dynamicParams`:
- `true` (mặc định): Params không nằm trong danh sách sẽ SSR on-demand rồi cache
- `false`: Trả 404 cho params không có trong danh sách (hữu ích khi biết chính xác tất cả URL)

### Câu 3: params và searchParams khác nhau thế nào?

**Trả lời:**
- **params** (path params): Lấy từ dynamic segments trong URL path. VD: `/blog/[slug]` → `params.slug`. Luôn có giá trị nếu route match.
- **searchParams** (query params): Lấy từ query string sau dấu `?`. VD: `/products?sort=price` → `searchParams.sort`. Có thể `undefined`.

Trong Next.js 15+, cả hai đều là **Promise** trong Server Components, cần `await`. Trong Client Components, dùng `useParams()` và `useSearchParams()`.

params dùng cho định danh tài nguyên (slug, id). searchParams dùng cho filter, sort, pagination — những thứ thay đổi thường xuyên.

### Câu 4: Làm sao tối ưu performance cho trang có nhiều dynamic routes?

**Trả lời:** Các chiến lược tối ưu:

1. **generateStaticParams** — Pre-render các trang phổ biến nhất tại build time (ví dụ: 100 bài viết mới nhất)
2. **dynamicParams = true** — Để các trang còn lại được render on-demand và cache (ISR pattern)
3. **Segment-level caching** — Dùng `revalidate` để kiểm soát cache TTL cho từng route
4. **Parallel data fetching** — Dùng `Promise.all()` thay vì await tuần tự khi fetch nhiều dữ liệu
5. **Streaming** — Kết hợp Suspense để hiện loading UI cho phần chậm, phần nhanh hiện ngay

```tsx
export const revalidate = 3600; // Revalidate mỗi 1 giờ

export async function generateStaticParams() {
  // Chỉ pre-render 50 bài mới nhất
  const posts = await getTopPosts(50);
  return posts.map((p) => ({ slug: p.slug }));
}
// dynamicParams mặc định true → bài còn lại SSR + cache
```

### Câu 5: Giải thích flow khi user truy cập một dynamic route chưa được pre-render.

**Trả lời:** Khi `dynamicParams = true` (mặc định), flow như sau:

1. User request `/blog/bai-moi` — slug `bai-moi` không nằm trong `generateStaticParams`
2. Next.js **không tìm thấy HTML tĩnh** cho slug này
3. Next.js chạy **Server-Side Rendering** (SSR) cho request này — gọi component, fetch data, render HTML
4. HTML được trả về cho user
5. Đồng thời, Next.js **cache kết quả** (static cache)
6. Request tiếp theo đến `/blog/bai-moi` sẽ được serve từ cache (nhanh như static page)
7. Cache invalidate theo `revalidate` config hoặc `revalidatePath()`/`revalidateTag()`

Nếu `dynamicParams = false`, bước 2 sẽ trả về 404 ngay lập tức.
