---
sidebar_position: 4
title: "4. Structured Data & Social Sharing"
---

# Structured Data & Social Sharing

> *Nhóm câu hỏi về cách trang web "nói chuyện" với máy: structured data cho Google rich results, Open Graph cho social preview, và dynamic OG images trong Next.js.*

---

## Câu 9: Structured Data (Schema.org) là gì? Lợi ích cho SEO? `[Intermediate]`

### Câu hỏi

> Structured data là gì? Lợi ích cụ thể cho SEO? Cách implement và validate?

### Giải thích lý thuyết

**Structured data** là dữ liệu có cấu trúc nhúng vào trang theo từ vựng chuẩn **Schema.org**, giúp search engine hiểu **ngữ nghĩa** nội dung thay vì đoán từ text: "đây là sản phẩm giá 990.000đ, rating 4.8, còn hàng" thay vì một đống chữ.

**Lợi ích chính — Rich Results (rich snippets):** kết quả tìm kiếm hiển thị phong phú hơn:

| Schema type | Rich result |
| --- | --- |
| `Product` + `Offer` + `AggregateRating` | Giá, tình trạng kho, sao đánh giá |
| `Article` / `NewsArticle` | Ảnh lớn, ngày đăng, carousel Top Stories |
| `FAQPage` | Câu hỏi mở rộng ngay trên SERP |
| `BreadcrumbList` | Breadcrumb thay URL thô trên SERP |
| `Recipe`, `Event`, `JobPosting`, `LocalBusiness` | Card chuyên biệt theo loại |

Structured data **không phải ranking signal trực tiếp** — nhưng rich results tăng **CTR** đáng kể (nổi bật hơn, chiếm nhiều diện tích hơn), và CTR/traffic tốt gián tiếp giúp SEO. Nó cũng giúp Google hiểu entity → xuất hiện trong Knowledge Graph và các kết quả đặc biệt.

**3 format**, Google khuyến nghị **JSON-LD**:

- **JSON-LD** ✅ — script tag riêng, không trộn vào markup HTML, dễ generate từ data, dễ maintain.
- Microdata, RDFa — attribute rải trong HTML, khó maintain.

**Quy tắc quan trọng**: structured data phải **khớp với nội dung hiển thị trên trang** — khai rating 5 sao mà trang không có review nào là vi phạm guideline, có thể bị manual action.

**Validate**: Google **Rich Results Test** (kiểm tra eligibility cho rich results) và **Schema Markup Validator** (schema.org). Theo dõi lỗi dài hạn trong Search Console → Enhancements.

### Code minh hoạ

```tsx
// Next.js: JSON-LD generate từ data thật của trang
export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "VND",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1>{product.name}</h1>
      {/* nội dung trang PHẢI khớp với JSON-LD */}
    </>
  );
}
```

### Đáp án mẫu

> "Structured data là dữ liệu nhúng theo từ vựng Schema.org giúp Google hiểu ngữ nghĩa nội dung — đây là sản phẩm, giá bao nhiêu, rating mấy sao. Lợi ích lớn nhất là rich results: sao đánh giá, giá, FAQ mở rộng, breadcrumb hiển thị ngay trên kết quả tìm kiếm — không phải ranking signal trực tiếp nhưng tăng CTR đáng kể vì kết quả nổi bật hơn. Em dùng format JSON-LD theo khuyến nghị của Google — script tag riêng, generate từ data thật nên dễ maintain, đặt ngay trong Server Component của Next.js. Quy tắc em luôn tuân thủ: structured data phải khớp nội dung hiển thị trên trang, khai khống rating là có thể ăn manual action. Sau khi implement em validate bằng Rich Results Test và theo dõi lỗi trong Search Console."

---

## Câu 10: Open Graph và Twitter Cards là gì? Cách implement trong Next.js? `[Intermediate]`

### Câu hỏi

> Open Graph và Twitter Cards dùng để làm gì? Có ảnh hưởng SEO không? Implement trong Next.js thế nào?

### Giải thích lý thuyết

**Open Graph (OG)** là protocol (do Facebook tạo) định nghĩa meta tags để kiểm soát **link preview** khi share trang lên social: Facebook, Zalo, LinkedIn, Messenger, Slack, Discord... **Twitter Cards** là bộ tags tương tự riêng của Twitter/X (nhưng X cũng fallback về OG nếu thiếu).

Các tag chính:

| Tag | Vai trò |
| --- | --- |
| `og:title`, `og:description` | Tiêu đề + mô tả của preview card (có thể khác title SEO — viết "social-friendly" hơn) |
| `og:image` | Ảnh preview — **quan trọng nhất**, quyết định card to hay nhỏ. Khuyến nghị **1200×630** (tỷ lệ 1.91:1), absolute URL |
| `og:url` | URL canonical của trang |
| `og:type` | `website`, `article`, `product`... |
| `twitter:card` | `summary` (card nhỏ) hoặc `summary_large_image` (card ảnh lớn) |

**Ảnh hưởng SEO**: OG tags **không phải ranking signal** của Google. Nhưng ảnh hưởng gián tiếp: preview đẹp → nhiều click & share → traffic và brand awareness → tín hiệu tốt cho SEO. Với content site, social traffic có thể ngang organic.

**Lưu ý kỹ thuật quan trọng**: social crawler (facebookexternalhit, Twitterbot, Zalo) **không chạy JavaScript** → OG tags **bắt buộc phải có trong HTML thô** (SSR/SSG). SPA thuần set OG bằng JS client là vô dụng. Debug bằng **Facebook Sharing Debugger** (còn để xoá cache scrape) và **opengraph.xyz**.

### Code minh hoạ

```tsx
// Next.js App Router: openGraph + twitter trong Metadata API
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://example.com/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      images: [
        {
          url: `https://example.com/og/${post.slug}.png`, // absolute URL
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [`https://example.com/og/${post.slug}.png`],
    },
  };
}
```

```html
<!-- HTML render ra (phải có trong HTML thô, không phải sau JS) -->
<meta property="og:title" content="Tối ưu LCP trong Next.js" />
<meta property="og:image" content="https://example.com/og/toi-uu-lcp.png" />
<meta name="twitter:card" content="summary_large_image" />
```

### Đáp án mẫu

> "Open Graph là bộ meta tags kiểm soát link preview khi share lên Facebook, Zalo, LinkedIn, Slack; Twitter Cards là bộ tương tự của X nhưng X cũng fallback về OG. Quan trọng nhất là `og:image` kích thước 1200 nhân 630 với absolute URL — quyết định card hiển thị to đẹp hay không. OG không phải ranking signal của Google nhưng ảnh hưởng gián tiếp: preview đẹp thì share và click nhiều hơn, kéo traffic về. Điểm kỹ thuật then chốt: social crawler không chạy JavaScript, nên OG tags phải nằm trong HTML thô — đây là lý do SPA thuần set OG bằng JS client không hoạt động. Trong Next.js App Router em khai báo qua `openGraph` và `twitter` trong `generateMetadata` cho dynamic routes, và debug bằng Facebook Sharing Debugger — tool này còn dùng để purge cache khi đổi ảnh."

---

## Câu 19: Dynamic OG images trong Next.js là gì? Cách tạo? `[Advanced]`

### Câu hỏi

> Dynamic OG image là gì? Next.js hỗ trợ tạo OG image động như thế nào?

### Giải thích lý thuyết

**Dynamic OG image** là ảnh preview được **generate tự động theo nội dung từng trang** (title, author, giá sản phẩm...) thay vì designer làm tay từng ảnh — bài toán không thể làm thủ công khi site có hàng nghìn trang.

Next.js hỗ trợ qua **`ImageResponse`** (package `next/og`, dựa trên **Satori** — engine convert JSX + subset CSS thành SVG rồi PNG, chạy được trên Edge Runtime):

Hai cách dùng trong App Router:

1. **File convention `opengraph-image.tsx`** đặt cạnh `page.tsx` — Next tự inject meta tag `og:image` với URL đúng, kèm `twitter-image.tsx` tương tự.
2. **Route Handler** (vd `app/api/og/route.tsx`) — linh hoạt hơn, nhận params qua query string, dùng được cho nhiều trang.

Đặc điểm & giới hạn của Satori cần biết:

- Chỉ hỗ trợ **subset CSS**: flexbox (không grid), absolute positioning, màu, border, gradient... — không phải browser đầy đủ.
- Mặc định phải set `display: flex` cho element có nhiều con.
- Font phải **load thủ công** (fetch file font, truyền vào option `fonts`) nếu muốn font ngoài mặc định.
- Ảnh được **cache** như static asset (với `opengraph-image.tsx` static) hoặc theo cache header của route handler.

### Code minh hoạ

```tsx
// app/blog/[slug]/opengraph-image.tsx — file convention
import { ImageResponse } from "next/og";
import { getPost } from "@/lib/posts";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }) {
  const post = await getPost(params.slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #0f172a, #1e3a8a)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.8 }}>myblog.dev</div>
        <div style={{ fontSize: 64, fontWeight: 700, marginTop: 24 }}>
          {post.title}
        </div>
        <div style={{ fontSize: 28, marginTop: 24 }}>
          {post.author} · {post.readingTime} phút đọc
        </div>
      </div>
    ),
    size
  );
}
// Next tự thêm: <meta property="og:image" content=".../blog/slug/opengraph-image" />
```

### Đáp án mẫu

> "Dynamic OG image là ảnh preview generate tự động theo nội dung từng trang — bắt buộc khi site có hàng nghìn bài viết hay sản phẩm, không thể nhờ designer làm tay. Next.js hỗ trợ qua `ImageResponse` từ `next/og`, nền tảng là engine Satori convert JSX và một subset CSS thành PNG, chạy được trên Edge. Cách em hay dùng là file convention `opengraph-image.tsx` đặt cạnh page — Next tự inject meta tag og:image đúng URL; cần linh hoạt hơn thì làm Route Handler nhận params qua query. Vài giới hạn cần biết: Satori chỉ hỗ trợ flexbox không có grid, element nhiều con phải set display flex, và font tuỳ chỉnh phải fetch thủ công truyền vào option fonts. Kết quả được cache như static asset nên không lo tốn compute mỗi lần share."
