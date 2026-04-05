---
sidebar_position: 2
title: "Structured Data và Schema.org"
---

# Structured Data và Schema.org

## Structured Data là gì?

Khi bạn đọc một trang web, bạn hiểu ngay đâu là tiêu đề, đâu là giá sản phẩm, đâu là đánh giá. Nhưng Google chỉ thấy một dòng HTML — nó không "hiểu" ngữ nghĩa của dữ liệu như con người.

Structured data là cách bạn "giải thích" cho Google biết ý nghĩa của dữ liệu trên trang. Thay vì Google phải đoán "1.200.000d" là giá sản phẩm hay mã bưu điện, bạn nói rõ ràng: "Đây là giá, đơn vị là VND."

### Lợi ích cụ thể

| Lợi ích | Mô tả |
|---------|-------|
| Rich Snippets | Hiển thị sao đánh giá, giá, hình ảnh ngay trên SERP |
| Knowledge Panel | Box thông tin to bên phải SERP |
| FAQ Dropdown | Câu hỏi mở rộng ngay trên kết quả tìm kiếm |
| Breadcrumbs | Hiển thị đường dẫn trang thay vì URL thô |
| Sitelinks Search | Ô tìm kiếm ngay trong kết quả |
| Tăng CTR | Rich results có CTR cao hơn 20-30% so với kết quả thường |

## Schema.org là gì?

Schema.org là bộ từ vựng chung được Google, Microsoft (Bing), Yahoo và Yandex đồng phát triển. Nó định nghĩa các "loại" dữ liệu (types) và "thuộc tính" (properties) mà search engines hiểu được.

### Các format Structured Data

| Format | Ưu điểm | Nhược điểm | Google khuyên dùng? |
|--------|---------|------------|-------------------|
| JSON-LD | Tách biệt khỏi HTML, dễ maintain | Cần thêm script tag | **Có (khuyến nghị)** |
| Microdata | Gắn trực tiếp vào HTML | Khó maintain, HTML phức tạp | Không khuyến nghị |
| RDFa | Linh hoạt, hỗ trợ nhiều vocabulary | Phức tạp, ít người dùng | Không khuyến nghị |

:::tip Vì sao Google thích JSON-LD?
JSON-LD nằm trong một thẻ `<script>` riêng biệt, không làm bẩn HTML markup. Bạn có thể thêm, sửa, xóa structured data mà không ảnh hưởng đến giao diện. Nó cũng dễ tự động hóa và generate từ API.
:::

## JSON-LD Cơ bản

### Cấu trúc

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LoaiSchema",
  "thuocTinh1": "gia tri 1",
  "thuocTinh2": "gia tri 2"
}
</script>
```

- `@context`: Luôn là `"https://schema.org"`
- `@type`: Loại dữ liệu (Article, Product, FAQ, ...)
- Các thuộc tính phụ thuộc vào `@type`

## Các Schema Type phổ biến

### 1. Article Schema

Dùng cho bài blog, bài báo, hướng dẫn kỹ thuật.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Huong dan SEO On-Page cho Developer",
  "description": "Bai viet chi tiet ve cach toi uu meta tags, structured data cho developer.",
  "image": [
    "https://example.com/images/seo-guide-1x1.jpg",
    "https://example.com/images/seo-guide-4x3.jpg",
    "https://example.com/images/seo-guide-16x9.jpg"
  ],
  "datePublished": "2026-04-01T10:00:00+07:00",
  "dateModified": "2026-04-05T08:30:00+07:00",
  "author": {
    "@type": "Person",
    "name": "Thuan Doan",
    "url": "https://example.com/author/thuan"
  },
  "publisher": {
    "@type": "Organization",
    "name": "DevSEO Blog",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://example.com/seo-guide"
  },
  "wordCount": 2500,
  "keywords": ["seo", "on-page", "meta tags", "developer"]
}
</script>
```

### 2. Product Schema

Dùng cho trang sản phẩm thương mại điện tử.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Mechanical Keyboard TKL Custom",
  "description": "Ban phim co TKL voi switch Cherry MX Brown, keycap PBT.",
  "image": "https://example.com/images/keyboard.jpg",
  "brand": {
    "@type": "Brand",
    "name": "KeyVN"
  },
  "sku": "KB-TKL-001",
  "gtin13": "1234567890123",
  "offers": {
    "@type": "Offer",
    "url": "https://example.com/products/keyboard-tkl",
    "priceCurrency": "VND",
    "price": "1200000",
    "priceValidUntil": "2026-12-31",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "KeyVN Store"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "reviewCount": "156"
  },
  "review": [
    {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "author": {
        "@type": "Person",
        "name": "Minh Anh"
      },
      "datePublished": "2026-03-15",
      "reviewBody": "Ban phim gox rat tot, switch mượt, build chat luong."
    }
  ]
}
</script>
```

### 3. FAQ Schema

Dùng cho trang FAQ hoặc bài viết có phần hỏi đáp. Google có thể hiển thị trực tiếp câu hỏi-trả lời trên SERP.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Structured data la gi?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Structured data la cach danh dau du lieu tren trang web theo format ma search engines hieu duoc, giup Google hien thi rich snippets tren ket qua tim kiem."
      }
    },
    {
      "@type": "Question",
      "name": "JSON-LD khac gi Microdata?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "JSON-LD nam trong the script rieng, tach biet khoi HTML. Microdata gan truc tiep vao HTML elements. Google khuyen dung JSON-LD vi de maintain hon."
      }
    },
    {
      "@type": "Question",
      "name": "Structured data co truc tiep giup tang ranking khong?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Structured data khong phai ranking factor truc tiep. Tuy nhien, rich snippets tang CTR (click-through rate), va CTR cao gian tiep giup cai thien ranking."
      }
    }
  ]
}
</script>
```

### 4. HowTo Schema

Dùng cho bài hướng dẫn từng bước.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "Cach them structured data vao trang web",
  "description": "Huong dan tung buoc them JSON-LD structured data cho developer.",
  "totalTime": "PT15M",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "VND",
    "value": "0"
  },
  "step": [
    {
      "@type": "HowToStep",
      "name": "Xac dinh loai schema phu hop",
      "text": "Chon schema type phu hop voi noi dung trang: Article cho blog, Product cho san pham, FAQ cho trang hoi dap.",
      "url": "https://example.com/guide#step-1",
      "image": "https://example.com/images/step1.jpg"
    },
    {
      "@type": "HowToStep",
      "name": "Viet JSON-LD",
      "text": "Tao mot object JSON voi @context, @type va cac thuoc tinh bat buoc theo schema da chon.",
      "url": "https://example.com/guide#step-2",
      "image": "https://example.com/images/step2.jpg"
    },
    {
      "@type": "HowToStep",
      "name": "Them vao HTML",
      "text": "Dat JSON-LD vao the script type application/ld+json trong phan head hoac body cua trang.",
      "url": "https://example.com/guide#step-3"
    },
    {
      "@type": "HowToStep",
      "name": "Kiem tra voi Rich Results Test",
      "text": "Su dung Google Rich Results Test de xac minh structured data hop le va du dieu kien hien thi rich snippets.",
      "url": "https://example.com/guide#step-4"
    }
  ]
}
</script>
```

### 5. Organization Schema

Đặt trên trang chủ để Google hiểu về thương hiệu của bạn.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "DevSEO Vietnam",
  "alternateName": "DevSEO VN",
  "url": "https://devseo.vn",
  "logo": "https://devseo.vn/logo.png",
  "description": "Cong dong developer hoc SEO ky thuat tai Viet Nam.",
  "foundingDate": "2024-01-01",
  "sameAs": [
    "https://www.facebook.com/devseo.vn",
    "https://twitter.com/devseo_vn",
    "https://github.com/devseo-vn",
    "https://www.linkedin.com/company/devseo-vn"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "contact@devseo.vn",
    "availableLanguage": ["Vietnamese", "English"]
  }
}
</script>
```

### 6. BreadcrumbList Schema

Giúp Google hiển thị breadcrumb đẹp trên SERP thay vì URL thô.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Trang chu",
      "item": "https://example.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "SEO",
      "item": "https://example.com/seo"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "On-Page",
      "item": "https://example.com/seo/on-page"
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "Structured Data"
    }
  ]
}
</script>
```

:::info Lưu ý
ListItem cuối cùng (trang hiện tại) không cần thuộc tính `item` vì nó là trang người dùng đang xem.
:::

## Triển khai JSON-LD trong Next.js

### Component tái sử dụng

```tsx
// components/JsonLd.tsx
interface JsonLdProps {
  data: Record<string, unknown>
}

function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export default JsonLd
```

### Sử dụng trong page

```tsx
// app/blog/[slug]/page.tsx
import JsonLd from '@/components/JsonLd'

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Blog', item: 'https://example.com/blog' },
      { '@type': 'ListItem', position: 2, name: post.title },
    ],
  }

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <article>
        <h1>{post.title}</h1>
        {/* Noi dung */}
      </article>
    </>
  )
}
```

## Kiểm tra Structured Data

### Google Rich Results Test

Truy cập [https://search.google.com/test/rich-results](https://search.google.com/test/rich-results) để kiểm tra trang của bạn.

### Kiểm tra bằng command line

```bash
# Lay structured data tu trang web
curl -s https://example.com/seo-guide | \
  grep -oP '(?<=<script type="application/ld\+json">).*?(?=</script>)' | \
  python3 -m json.tool

# Kiem tra validation voi Google API (can API key)
curl "https://searchconsole.googleapis.com/v1/urlTestingTools/mobileFriendlyTest:run" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/seo-guide"}'
```

### Schema Markup Validator

Truy cập [https://validator.schema.org/](https://validator.schema.org/) để kiểm tra cú pháp schema có hợp lệ không (bao gồm cả các schema không liên quan đến Google).

## Lỗi thường gặp

### 1. Thông tin trong JSON-LD không khớp với nội dung trang

```javascript
// SAI: Schema noi gia 500k nhung tren trang hien 1.200k
// Google co the phat vi "spammy structured data"
{
  "@type": "Product",
  "offers": { "price": "500000" }  // Gia that tren trang la 1.200.000
}

// DUNG: Schema phai phan anh chinh xac noi dung hien thi
// Nen generate schema tu cung data source voi UI
```

### 2. Thiếu thuộc tính bắt buộc

Mỗi schema type có các thuộc tính **required** và **recommended**. Thiếu thuộc tính required sẽ khiến Google bỏ qua schema.

| Schema Type | Thuộc tính bắt buộc |
|------------|-------------------|
| Article | `headline`, `image`, `datePublished`, `author` |
| Product | `name`, `offers` (với `price` và `priceCurrency`) |
| FAQ | `mainEntity` với ít nhất 1 Question |
| HowTo | `name`, `step` với ít nhất 1 HowToStep |
| BreadcrumbList | `itemListElement` với ít nhất 1 ListItem |

### 3. JSON không hợp lệ

```javascript
// SAI: Trailing comma
{
  "@type": "Article",
  "headline": "Test",  // <-- dau phay thua
}

// SAI: Single quotes
{
  '@type': 'Article'  // JSON chi chap nhan double quotes
}

// SAI: Comment trong JSON
{
  "@type": "Article",
  // Day la comment  <-- JSON khong ho tro comment
  "headline": "Test"
}
```

### 4. Đặt nhiều schema cùng type trên một trang

```html
<!-- SAI: 2 Product schema tren 1 trang san pham -->
<script type="application/ld+json">
{ "@type": "Product", "name": "San pham A" }
</script>
<script type="application/ld+json">
{ "@type": "Product", "name": "San pham B" }
</script>

<!-- DUNG: Moi trang nen co 1 schema chinh + cac schema bo tro -->
<!-- VD: 1 Product + 1 BreadcrumbList + 1 Organization -->
```

### 5. Không cập nhật schema khi nội dung thay đổi

Nếu bạn thay đổi giá sản phẩm, ngày sửa bài, hoặc tác giả nhưng không cập nhật schema, Google có thể phạt vì thông tin không nhất quán. **Luôn generate schema từ cùng data source với nội dung trang.**

## Câu hỏi phỏng vấn

### Câu 1: Structured data có phải là ranking factor trực tiếp không?

**Trả lời:** Không, structured data không phải là ranking factor trực tiếp — Google đã xác nhận điều này. Tuy nhiên, structured data giúp trang hiển thị rich snippets (sao đánh giá, giá, FAQ dropdown), làm tăng CTR (click-through rate). CTR cao gián tiếp báo hiệu cho Google rằng trang có giá trị, từ đó có thể cải thiện ranking. Ngoài ra, structured data giúp Google hiểu nội dung chính xác hơn, có thể cải thiện relevance.

### Câu 2: Tại sao Google khuyên dùng JSON-LD thay vì Microdata?

**Trả lời:** JSON-LD tách biệt khỏi HTML markup, không làm phức tạp cấu trúc DOM. Điều này giúp: (1) Dễ maintain — có thể thêm/sửa/xóa mà không ảnh hưởng giao diện, (2) Dễ generate tự động từ API hoặc CMS, (3) Dễ test và validate, (4) Không bị ảnh hưởng khi thay đổi giao diện. Microdata phải gắn trực tiếp vào HTML elements nên khi thay đổi layout, structured data có thể bị hỏng.

### Câu 3: Làm sao để biết schema nào phù hợp với trang của mình?

**Trả lời:** Dựa trên loại nội dung: (1) Bài blog/tin tức dùng `Article`, (2) Sản phẩm dùng `Product`, (3) Trang FAQ dùng `FAQPage`, (4) Hướng dẫn từng bước dùng `HowTo`, (5) Trang chủ dùng `Organization` + `WebSite`, (6) Trang danh mục dùng `BreadcrumbList`. Có thể kết hợp nhiều schema trên một trang (ví dụ Article + BreadcrumbList + FAQ). Kiểm tra Google's Search Gallery để xem các rich result types được hỗ trợ.

### Câu 4: Nếu JSON-LD có lỗi cú pháp thì sao?

**Trả lời:** Nếu JSON không hợp lệ (trailing comma, single quotes, syntax error), Google sẽ bỏ qua toàn bộ block structured data đó. Trang vẫn được index bình thường nhưng sẽ không có rich snippets. Để phòng ngừa: (1) Luôn dùng `JSON.stringify()` để generate JSON từ code, không viết tay, (2) Validate bằng Google Rich Results Test trước khi deploy, (3) Thêm validation vào CI/CD pipeline.

### Câu 5: Có thể đặt JSON-LD ở đâu trong HTML?

**Trả lời:** JSON-LD có thể đặt bất kỳ đâu trong HTML — trong `<head>` hoặc `<body>`. Google sẽ đọc được ở cả hai vị trí. Tuy nhiên, Google khuyên đặt trong `<head>` để search engine đọc được sớm nhất. Trong các framework như Next.js, thường đặt trong component render để JSON-LD gần với nội dung liên quan, và điều này hoàn toàn hợp lệ.
