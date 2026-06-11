---
sidebar_position: 5
title: "5. SEO trong Next.js"
---

# SEO trong Next.js

> *Next.js là framework "SEO-first" phổ biến nhất hệ React — Metadata API, file conventions cho sitemap/robots, next/image, ISR. Phỏng vấn vị trí Next.js gần như chắc chắn chạm nhóm câu này.*

---

## Câu 12: Metadata API trong Next.js App Router hoạt động như thế nào? `[Intermediate]`

### Câu hỏi

> Metadata API trong App Router là gì? Phân biệt static và dynamic metadata? Metadata được merge giữa layout và page thế nào?

### Giải thích lý thuyết

**Metadata API** là cách khai báo thẻ `<head>` (title, description, OG, canonical, robots...) trong App Router — thay thế `next/head` của Pages Router. Metadata được render **server-side vào HTML thô**, nên crawler nào cũng đọc được.

**Hai cách khai báo** (trong `layout.tsx` hoặc `page.tsx` — chỉ Server Component):

1. **Static** — export object `metadata`: dùng khi nội dung cố định.
2. **Dynamic** — export function `generateMetadata({ params, searchParams })`: dùng khi metadata phụ thuộc data (trang sản phẩm, bài viết). Có thể `async` và fetch data — **fetch trùng với page được dedupe tự động** (React `cache` / fetch memoization), không lo gọi API hai lần.

**Cơ chế merge**: metadata được resolve **từ root layout xuống page**, theo từng field — field nào page định nghĩa sẽ **ghi đè** layout (shallow merge theo key, ví dụ định nghĩa lại `openGraph` trong page là thay cả object `openGraph`).

**Title template** — pattern quan trọng nhất:

```ts
// app/layout.tsx
export const metadata = {
  title: {
    template: "%s | SportShop",  // page con chỉ cần set phần %s
    default: "SportShop - Đồ thể thao chính hãng", // khi page không set title
  },
};
```

Ngoài ra còn **file-based metadata** (conventions): `favicon.ico`, `opengraph-image.tsx`, `sitemap.ts`, `robots.ts` — ưu tiên cao hơn config tương ứng.

### Code minh hoạ

```tsx
// app/products/[slug]/page.tsx — dynamic metadata
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug); // dedupe với fetch trong Page

  return {
    title: product.name, // → "Giày Pegasus 41 | SportShop" nhờ template ở layout
    description: product.shortDescription,
    alternates: { canonical: `https://sportshop.vn/products/${slug}` },
    openGraph: {
      title: product.name,
      images: [{ url: product.ogImage, width: 1200, height: 630 }],
    },
    robots: product.discontinued ? { index: false } : undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug); // không gọi API lần 2 nhờ memoization
  return <h1>{product.name}</h1>;
}
```

### Đáp án mẫu

> "Metadata API là cách App Router khai báo thẻ head — render server-side vào HTML thô nên mọi crawler đọc được. Có hai dạng: export object `metadata` cho nội dung tĩnh, và `generateMetadata` async cho metadata phụ thuộc data như trang sản phẩm — fetch trong đó được dedupe với fetch của page nhờ memoization nên không gọi API hai lần. Metadata merge từ root layout xuống page theo từng field, page ghi đè layout — pattern em luôn setup là title template ở root layout, dạng `%s | tên brand`, để mọi page con chỉ cần set phần riêng và không bao giờ có title trùng. Bên cạnh config-based còn file-based conventions như `opengraph-image.tsx`, `sitemap.ts`, `robots.ts`. Một lưu ý: metadata chỉ dùng được trong Server Component — component có `use client` thì phải đẩy metadata lên page hoặc layout cha."

---

## Câu 13: Cách tạo dynamic sitemap và robots.txt trong Next.js App Router? `[Intermediate]`

### Câu hỏi

> Trong Next.js App Router, em tạo sitemap và robots.txt động như thế nào? Site có hàng trăm nghìn URL thì sao?

### Giải thích lý thuyết

App Router cung cấp 2 file conventions, đều là code TypeScript nên **generate động từ database/CMS**:

**1. `app/sitemap.ts`** — export default function (có thể async) trả về mảng object, Next render thành `/sitemap.xml`:

- Fetch toàn bộ slug từ DB/CMS lúc build (hoặc lúc request nếu dynamic).
- Trả về `url`, `lastModified` (field Google thực sự dùng), `changeFrequency`/`priority` (Google bỏ qua nhưng API vẫn cho khai).

**2. `app/robots.ts`** — trả về object rules, Next render thành `/robots.txt`. Lợi thế lớn nhất so với file tĩnh: **logic theo môi trường** — staging tự động `Disallow: /` để không bị index nhầm, production mở bình thường.

**Site lớn (> 50.000 URL)**: dùng `generateSitemaps()` — export thêm function trả về danh sách `{ id }`, Next generate **nhiều sitemap con** (`/sitemap/0.xml`, `/sitemap/1.xml`...); mỗi sitemap function nhận `{ id }` để query đúng phân đoạn dữ liệu.

Sau khi deploy: submit `/sitemap.xml` lên Google Search Console và khai trong robots.txt.

### Code minh hoạ

```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await db.post.findMany({ select: { slug: true, updatedAt: true } });

  const postUrls = posts.map((post) => ({
    url: `https://example.com/blog/${post.slug}`,
    lastModified: post.updatedAt,
  }));

  return [
    { url: "https://example.com", lastModified: new Date() },
    { url: "https://example.com/blog", lastModified: new Date() },
    ...postUrls,
  ];
}
```

```ts
// app/robots.ts — khác nhau theo môi trường
import type { MetadataRoute } from "next";

const isProd = process.env.VERCEL_ENV === "production";

export default function robots(): MetadataRoute.Robots {
  if (!isProd) {
    // staging/preview: chặn toàn bộ, tránh bị index nhầm
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] },
    sitemap: "https://example.com/sitemap.xml",
  };
}
```

```ts
// Site lớn: chia nhiều sitemap với generateSitemaps
// app/products/sitemap.ts
export async function generateSitemaps() {
  const count = await db.product.count();
  const SITEMAP_SIZE = 50000;
  return Array.from({ length: Math.ceil(count / SITEMAP_SIZE) }, (_, id) => ({ id }));
}

export default async function sitemap({ id }: { id: number }) {
  const products = await db.product.findMany({
    skip: id * 50000,
    take: 50000,
    select: { slug: true, updatedAt: true },
  });
  return products.map((p) => ({
    url: `https://example.com/products/${p.slug}`,
    lastModified: p.updatedAt,
  }));
}
```

### Đáp án mẫu

> "App Router có hai file conventions: `app/sitemap.ts` và `app/robots.ts` — đều là code nên generate động được. Với sitemap, em fetch toàn bộ slug từ database, trả về mảng url kèm `lastModified` — field duy nhất Google thực sự dùng. Với robots, lợi thế lớn nhất so với file tĩnh là logic theo môi trường: staging tự động disallow tất cả để không bị index nhầm — lỗi này ngoài thực tế gặp rất nhiều. Site vượt 50.000 URL thì dùng `generateSitemaps` để chia thành nhiều sitemap con, mỗi function nhận id để query đúng phân đoạn. Sau khi deploy em submit sitemap lên Search Console để theo dõi index coverage và phát hiện sớm trang bị loại."

---

## Câu 14: next/image tối ưu SEO và performance như thế nào? `[Intermediate]`

### Câu hỏi

> `next/image` làm gì khác thẻ `<img>` thường? Nó giúp gì cho SEO và Core Web Vitals?

### Giải thích lý thuyết

`next/image` là wrapper quanh `<img>` tự động hoá các tối ưu mà làm tay rất dễ sai — ảnh hưởng trực tiếp **LCP** và **CLS**, hai metric ranking:

| Tối ưu | Cơ chế | Ảnh hưởng |
| --- | --- | --- |
| **Chống layout shift** | Bắt buộc `width`/`height` (hoặc `fill`) → browser giữ chỗ trước khi ảnh tải | **CLS** |
| **Resize theo thiết bị** | Generate nhiều size, serve qua `srcset` + `sizes` — mobile không phải tải ảnh desktop | **LCP**, bandwidth |
| **Format hiện đại** | Tự convert sang **WebP/AVIF** nếu browser hỗ trợ (qua image optimizer, on-demand + cache) | **LCP** |
| **Lazy load mặc định** | Ảnh ngoài viewport chỉ tải khi gần scroll tới | Tải trang nhanh hơn |
| **`priority` cho ảnh LCP** | Tắt lazy load + thêm `<link rel="preload">` + `fetchpriority="high"` | **LCP** |
| **`placeholder="blur"`** | Hiện bản blur tí hon trong lúc tải | Perceived performance |

Về **SEO trực tiếp**: bắt buộc prop `alt` (accessibility + Google Images), và ảnh nhẹ/đúng size góp vào Core Web Vitals — ranking signal.

**Lỗi hay gặp cần nói trong phỏng vấn:**

- Quên `priority` cho ảnh hero → ảnh LCP bị lazy load → LCP tệ đi (lỗi phổ biến nhất).
- Đặt `priority` cho quá nhiều ảnh → preload cạnh tranh bandwidth, mất tác dụng.
- Dùng `fill` mà quên `sizes` → browser tải ảnh to nhất trong srcset.

### Code minh hoạ

```tsx
import Image from "next/image";

// Ảnh hero = LCP element: priority để preload, KHÔNG lazy load
<Image
  src="/hero.jpg"
  alt="Bộ sưu tập giày chạy bộ 2026"
  width={1200}
  height={600}
  priority
  placeholder="blur"
  blurDataURL={heroBlur}
/>

// Ảnh trong danh sách: lazy load mặc định, sizes cho responsive
<Image
  src={product.image}
  alt={product.name}
  fill
  sizes="(max-width: 768px) 50vw, 25vw"
  className="object-cover"
/>
```

```html
<!-- HTML thực tế next/image render ra (rút gọn) -->
<img
  srcset="/_next/image?url=/hero.jpg&w=640 640w, /_next/image?url=/hero.jpg&w=1200 1200w"
  sizes="100vw"
  fetchpriority="high"
  width="1200" height="600"
  alt="Bộ sưu tập giày chạy bộ 2026"
/>
```

### Đáp án mẫu

> "`next/image` tự động hoá những tối ưu ảnh mà làm tay dễ sai, đánh thẳng vào hai Core Web Vitals: với CLS, nó bắt buộc width/height nên browser giữ chỗ trước, ảnh tải xong không làm layout nhảy; với LCP, nó generate srcset nhiều size để mobile không tải ảnh desktop, tự convert WebP/AVIF, và lazy load mặc định cho ảnh ngoài viewport. Ảnh hero là LCP element thì em set `priority` — tắt lazy load, thêm preload và fetchpriority high; quên prop này là lỗi LCP phổ biến nhất em gặp khi audit. Về SEO trực tiếp, nó bắt buộc alt nên không bao giờ sót, và toàn bộ tối ưu trên cải thiện Core Web Vitals — là ranking signal. Hai lỗi ngược lại cần tránh: set priority cho quá nhiều ảnh làm preload cạnh tranh nhau, và dùng fill mà quên sizes khiến browser tải ảnh to nhất."

---

## Câu 20: generateStaticParams và ISR ảnh hưởng SEO thế nào? `[Advanced]`

### Câu hỏi

> `generateStaticParams` và ISR là gì? Tại sao chúng quan trọng cho SEO của site nhiều trang động?

### Giải thích lý thuyết

**`generateStaticParams`** khai báo danh sách params của dynamic route (`[slug]`) để Next **pre-render thành HTML tĩnh lúc build** (SSG). **ISR (Incremental Static Regeneration)** cho phép trang tĩnh **tự làm mới sau khoảng `revalidate`** hoặc khi gọi `revalidatePath`/`revalidateTag` (on-demand) — không cần rebuild toàn site.

Tại sao quan trọng cho SEO:

1. **HTML đầy đủ ngay từ đợt crawl đầu** — như SSG, không phụ thuộc render queue (xem câu 7).
2. **TTFB cực nhanh** (serve từ cache/CDN) → cải thiện LCP → Core Web Vitals tốt → ranking signal. SSR thuần phải render mỗi request, TTFB chậm hơn và dễ dao động.
3. **Content tươi mà vẫn tĩnh** — ISR giải bài toán "SSG thì content cũ, SSR thì chậm": sản phẩm đổi giá, bài viết cập nhật vẫn được Google thấy bản mới (kèm `lastmod` sitemap chính xác).
4. **Scale hàng trăm nghìn trang**: không cần build hết — build trước top trang quan trọng, phần còn lại generate **on-demand lần đầu được request** rồi cache (`dynamicParams = true` mặc định).

Cơ chế ISR cần nói đúng: hoạt động kiểu **stale-while-revalidate** — request sau khi hết hạn vẫn nhận **bản cũ ngay lập tức**, Next regenerate ở background, request kế tiếp nhận bản mới. Googlebot vì thế cũng luôn nhận response nhanh.

Trade-off: Googlebot **có thể crawl được bản stale** trong khoảng revalidate — với content nhạy thời gian (giá, tồn kho) nên dùng **on-demand revalidation** (webhook từ CMS gọi `revalidatePath`) thay vì chỉ dựa vào interval.

### Code minh hoạ

```tsx
// app/blog/[slug]/page.tsx
export const revalidate = 3600; // ISR: làm mới mỗi giờ

// Pre-render các bài viết lúc build
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
  // Slug không có ở đây vẫn được generate on-demand lần đầu request
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  return <article><h1>{post.title}</h1>...</article>;
}
```

```ts
// On-demand revalidation: CMS webhook gọi khi content đổi
// app/api/revalidate/route.ts
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  const { slug, secret } = await request.json();
  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ error: "Invalid secret" }, { status: 401 });
  }
  revalidatePath(`/blog/${slug}`);
  return Response.json({ revalidated: true });
}
```

### Đáp án mẫu

> "`generateStaticParams` khai báo trước danh sách slug để Next pre-render dynamic route thành HTML tĩnh lúc build, còn ISR cho phép các trang tĩnh đó tự làm mới theo `revalidate` interval hoặc on-demand. Với SEO, combo này cho điều tốt nhất của cả hai thế giới: HTML đầy đủ ngay từ đợt crawl đầu như SSG, TTFB nhanh từ CDN giúp LCP và Core Web Vitals tốt, mà content vẫn tươi — không bị kẹt bản build cũ. Với site hàng trăm nghìn trang, em chỉ build trước top trang quan trọng, phần còn lại generate on-demand lần đầu được request rồi cache. ISR chạy kiểu stale-while-revalidate nên Googlebot luôn nhận response nhanh, nhưng có thể nhận bản stale trong khoảng revalidate — content nhạy thời gian như giá sản phẩm thì em dùng on-demand revalidation qua webhook từ CMS gọi `revalidatePath` thay vì chỉ dựa interval."
