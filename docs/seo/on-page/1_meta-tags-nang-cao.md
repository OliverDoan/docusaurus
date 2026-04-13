---
sidebar_position: 1
title: "1. Meta Tags nâng cao"
---

# Meta Tags nâng cao

## Meta tags là gì và tại sao quan trọng?

Nếu bạn chỉ biết đến `<title>` và `<meta name="description">` thì bạn mới chỉ biết phần nổi của SEO meta tags. Trong thực tế, một trang web muốn rank tốt và hiển thị đẹp trên mạng xã hội cần rất nhiều loại meta tags khác nhau.

Meta tags là những thẻ HTML nằm trong `<head>` của trang, cung cấp thông tin cho search engines và các nền tảng mạng xã hội về nội dung trang web. Chúng không hiển thị trực tiếp cho người dùng nhưng ảnh hưởng cực lớn đến cách trang của bạn xuất hiện trên kết quả tìm kiếm và khi được chia sẻ.

## Open Graph Tags

### Open Graph là gì?

Open Graph (OG) là giao thức do Facebook phát triển, cho phép bạn kiểm soát cách trang web hiển thị khi được chia sẻ trên mạng xã hội. Nếu không có OG tags, Facebook/LinkedIn sẽ tự động lấy thông tin — và thường lấy sai.

### Các OG tags chính

```html
<head>
  <!-- OG co ban -->
  <meta property="og:title" content="Huong dan SEO On-Page cho Developer" />
  <meta property="og:description" content="Hoc cach toi uu meta tags, structured data va URL de tang thu hang Google." />
  <meta property="og:image" content="https://example.com/images/seo-guide-cover.jpg" />
  <meta property="og:url" content="https://example.com/seo/on-page" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="DevSEO Blog" />
  <meta property="og:locale" content="vi_VN" />

  <!-- OG cho bai viet -->
  <meta property="article:published_time" content="2026-04-01T10:00:00Z" />
  <meta property="article:modified_time" content="2026-04-05T08:30:00Z" />
  <meta property="article:author" content="https://example.com/author/thuan" />
  <meta property="article:section" content="SEO" />
  <meta property="article:tag" content="meta-tags" />
  <meta property="article:tag" content="on-page-seo" />
</head>
```

### Kích thước og:image tối ưu

| Nền tảng | Kích thước khuyến nghị | Tỉ lệ |
|----------|----------------------|-------|
| Facebook | 1200 x 630 px | 1.91:1 |
| LinkedIn | 1200 x 627 px | 1.91:1 |
| WhatsApp | 300 x 200 px (tối thiểu) | 1.5:1 |
| Zalo | 600 x 315 px | 1.91:1 |

:::tip Mẹo thực tế
Luôn sử dụng hình có kích thước 1200x630 px — đây là kích thước "universal" hoạt động tốt trên hầu hết các nền tảng. Tránh dùng hình có text nhỏ vì sẽ bị cắt trên mobile.
:::

## Twitter Card Meta Tags

### Các loại Twitter Card

| Loại | Mô tả | Khi nào dùng |
|------|-------|-------------|
| `summary` | Hình nhỏ + title + description | Bài blog, trang thông tin |
| `summary_large_image` | Hình lớn + title + description | Bài có hình ảnh đẹp |
| `player` | Nhúng video/audio | Nội dung media |
| `app` | Hiển thị app info | Landing page ứng dụng |

### Code mẫu

```html
<head>
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@devseo_vn" />
  <meta name="twitter:creator" content="@thuan_dev" />
  <meta name="twitter:title" content="Huong dan SEO On-Page cho Developer" />
  <meta name="twitter:description" content="Hoc cach toi uu meta tags de tang thu hang Google." />
  <meta name="twitter:image" content="https://example.com/images/seo-guide-twitter.jpg" />
  <meta name="twitter:image:alt" content="Minh hoa SEO On-Page voi code examples" />
</head>
```

:::info Lưu ý
Twitter (X) sẽ sử dụng OG tags làm fallback nếu không tìm thấy Twitter-specific tags. Tuy nhiên, nên khai báo riêng để kiểm soát chính xác nội dung hiển thị trên mỗi nền tảng.
:::

## Canonical Tags

### Vấn đề duplicate content

Duplicate content xảy ra khi cùng một nội dung có thể truy cập qua nhiều URL khác nhau:

```
https://example.com/seo-guide
https://example.com/seo-guide?utm_source=facebook
https://example.com/seo-guide?page=1
https://www.example.com/seo-guide
http://example.com/seo-guide
```

Google sẽ không biết URL nào là "chính" và có thể chia nhỏ link equity hoặc chọn sai URL để hiển thị.

### Cách sử dụng canonical tag

```html
<head>
  <!-- Dat tren MOI trang, ke ca trang goc -->
  <link rel="canonical" href="https://example.com/seo-guide" />
</head>
```

### Quy tắc canonical

```html
<!-- Trang goc: tro ve chinh no -->
<!-- URL: https://example.com/seo-guide -->
<link rel="canonical" href="https://example.com/seo-guide" />

<!-- Trang co query params: tro ve trang goc -->
<!-- URL: https://example.com/seo-guide?utm_source=facebook -->
<link rel="canonical" href="https://example.com/seo-guide" />

<!-- Trang phan trang: tro ve trang dau tien HOAC chinh no -->
<!-- URL: https://example.com/blog?page=2 -->
<link rel="canonical" href="https://example.com/blog?page=2" />

<!-- Cross-domain: khi noi dung duoc syndicate -->
<!-- Tren trang partner.com -->
<link rel="canonical" href="https://example.com/original-article" />
```

### Self-referencing canonical

Một sai lầm phổ biến là chỉ đặt canonical trên trang duplicate mà quên đặt trên trang gốc. **Mỗi trang đều nên có self-referencing canonical** — tức là canonical trỏ về chính URL của nó.

## Hreflang cho trang đa ngôn ngữ

### Khi nào cần hreflang?

Hreflang cho Google biết bạn có nhiều phiên bản ngôn ngữ của cùng một nội dung. Điều này giúp Google hiển thị đúng phiên bản cho người dùng dựa trên ngôn ngữ và khu vực của họ.

```html
<head>
  <!-- Trang tieng Viet -->
  <link rel="alternate" hreflang="vi" href="https://example.com/vi/seo-guide" />
  <!-- Trang tieng Anh -->
  <link rel="alternate" hreflang="en" href="https://example.com/en/seo-guide" />
  <!-- Trang tieng Nhat -->
  <link rel="alternate" hreflang="ja" href="https://example.com/ja/seo-guide" />
  <!-- Trang mac dinh (fallback) -->
  <link rel="alternate" hreflang="x-default" href="https://example.com/en/seo-guide" />
</head>
```

### Quy tắc hreflang quan trọng

1. **Hai chiều (bidirectional)**: Nếu trang A chỉ đến trang B, thì trang B cũng phải chỉ ngược lại trang A.
2. **Self-referencing**: Mỗi trang phải có hreflang trỏ về chính nó.
3. **x-default**: Luôn khai báo trang mặc định cho người dùng không khớp ngôn ngữ nào.
4. **Mã ngôn ngữ**: Sử dụng chuẩn ISO 639-1 (vi, en, ja) và tùy chọn ISO 3166-1 cho khu vực (en-US, pt-BR).

```html
<!-- SAI: Chi co mot chieu -->
<!-- Trang /vi/ -->
<link rel="alternate" hreflang="en" href="https://example.com/en/seo-guide" />
<!-- Trang /en/ khong co hreflang nao -->

<!-- DUNG: Hai chieu day du -->
<!-- Trang /vi/ -->
<link rel="alternate" hreflang="vi" href="https://example.com/vi/seo-guide" />
<link rel="alternate" hreflang="en" href="https://example.com/en/seo-guide" />
<link rel="alternate" hreflang="x-default" href="https://example.com/en/seo-guide" />

<!-- Trang /en/ -->
<link rel="alternate" hreflang="vi" href="https://example.com/vi/seo-guide" />
<link rel="alternate" hreflang="en" href="https://example.com/en/seo-guide" />
<link rel="alternate" hreflang="x-default" href="https://example.com/en/seo-guide" />
```

## Triển khai với Next.js Metadata API

### App Router (Next.js 14+)

```tsx
// app/seo-guide/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Huong dan SEO On-Page cho Developer',
  description: 'Hoc cach toi uu meta tags, structured data va URL de tang thu hang Google.',
  keywords: ['seo', 'on-page', 'meta-tags', 'developer'],

  // Open Graph
  openGraph: {
    title: 'Huong dan SEO On-Page cho Developer',
    description: 'Hoc cach toi uu meta tags de tang thu hang Google.',
    url: 'https://example.com/seo-guide',
    siteName: 'DevSEO Blog',
    images: [
      {
        url: 'https://example.com/images/seo-guide-cover.jpg',
        width: 1200,
        height: 630,
        alt: 'SEO On-Page Guide Cover',
      },
    ],
    locale: 'vi_VN',
    type: 'article',
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'Huong dan SEO On-Page cho Developer',
    description: 'Hoc cach toi uu meta tags de tang thu hang Google.',
    images: ['https://example.com/images/seo-guide-twitter.jpg'],
    creator: '@thuan_dev',
  },

  // Canonical
  alternates: {
    canonical: 'https://example.com/seo-guide',
    languages: {
      'vi': 'https://example.com/vi/seo-guide',
      'en': 'https://example.com/en/seo-guide',
    },
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function SEOGuidePage() {
  return (
    <article>
      <h1>Huong dan SEO On-Page</h1>
      {/* Noi dung bai viet */}
    </article>
  )
}
```

### Dynamic Metadata

```tsx
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next'

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug)

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.coverImage }],
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      tags: post.tags,
    },
    alternates: {
      canonical: `https://example.com/blog/${params.slug}`,
    },
  }
}
```

## Triển khai với React Helmet

```tsx
// components/SEOHead.tsx
import { Helmet } from 'react-helmet-async'

interface SEOHeadProps {
  title: string
  description: string
  image: string
  url: string
  type?: string
  locale?: string
}

function SEOHead({
  title,
  description,
  image,
  url,
  type = 'website',
  locale = 'vi_VN',
}: SEOHeadProps) {
  return (
    <Helmet>
      {/* Co ban */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content={locale} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  )
}

export default SEOHead
```

## Robots Meta Tag

Ngoài robots.txt (kiểm soát crawling), bạn cũng có thể dùng `<meta name="robots">` để kiểm soát indexing từng trang.

```html
<!-- Cho phep index va follow (mac dinh) -->
<meta name="robots" content="index, follow" />

<!-- Khong index nhung van follow links -->
<meta name="robots" content="noindex, follow" />

<!-- Index nhung khong follow links tren trang -->
<meta name="robots" content="index, nofollow" />

<!-- Khong hien thi snippet trong ket qua tim kiem -->
<meta name="robots" content="nosnippet" />

<!-- Khong cache trang -->
<meta name="robots" content="noarchive" />

<!-- Ket hop nhieu chi thi -->
<meta name="robots" content="noindex, nofollow, noarchive" />

<!-- Chi dinh rieng cho Googlebot -->
<meta name="googlebot" content="noindex" />
```

### Khi nào dùng noindex?

| Trang | Robots |
|-------|--------|
| Trang nội dung chính | `index, follow` |
| Trang thanh toán/cart | `noindex, nofollow` |
| Trang tìm kiếm nội bộ | `noindex, follow` |
| Trang admin/dashboard | `noindex, nofollow` |
| Trang tag/archive trùng nội dung | `noindex, follow` |
| Trang thank you | `noindex, nofollow` |

## Lỗi thường gặp

### 1. Thiếu og:image hoặc og:image sai kích thước

```html
<!-- SAI: Hinh qua nho -->
<meta property="og:image" content="https://example.com/logo-50x50.png" />

<!-- SAI: Dung duong dan tuong doi -->
<meta property="og:image" content="/images/cover.jpg" />

<!-- DUNG: Hinh lon, duong dan tuyet doi -->
<meta property="og:image" content="https://example.com/images/cover-1200x630.jpg" />
```

### 2. Canonical trỏ sai URL

```html
<!-- SAI: Canonical tro den trang 404 -->
<link rel="canonical" href="https://example.com/old-deleted-page" />

<!-- SAI: Canonical loop (A tro den B, B tro den A) -->
<!-- Trang A -->
<link rel="canonical" href="https://example.com/page-b" />
<!-- Trang B -->
<link rel="canonical" href="https://example.com/page-a" />

<!-- DUNG: Canonical tro den trang ton tai, co noi dung -->
<link rel="canonical" href="https://example.com/main-page" />
```

### 3. Duplicate title và description

Mỗi trang **phải có title và description duy nhất**. Việc copy-paste cùng một description cho nhiều trang là một lỗi phổ biến khiến Google khó phân biệt các trang.

### 4. Title quá dài hoặc quá ngắn

| Yếu tố | Độ dài tối ưu | Giới hạn hiển thị |
|--------|--------------|-------------------|
| Title | 50-60 ký tự | ~60 ký tự trên desktop |
| Description | 120-160 ký tự | ~155 ký tự trên desktop |
| OG Title | 40-60 ký tự | Tùy nền tảng |
| OG Description | 80-200 ký tự | Tùy nền tảng |

### 5. Không kiểm tra preview trước khi deploy

Luôn kiểm tra cách trang hiển thị trên mạng xã hội trước khi launch:

```bash
# Kiem tra OG tags
curl -s https://example.com/seo-guide | grep -i "og:"

# Dung cac tool online
# - Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
# - Twitter Card Validator: https://cards-dev.twitter.com/validator
# - LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/
```

## Câu hỏi phỏng vấn

### Câu 1: Sự khác nhau giữa `<meta name="description">` và `<meta property="og:description">` là gì?

**Trả lời:** `<meta name="description">` là description hiển thị trên kết quả tìm kiếm Google (SERP). `<meta property="og:description">` là description hiển thị khi chia sẻ trang trên mạng xã hội (Facebook, LinkedIn, Zalo). Chúng có thể có nội dung giống hoặc khác nhau. Nên tối ưu description cho SERP ngắn gọn hơn (120-160 ký tự), còn OG description có thể dài hơn và hấp dẫn hơn để thu hút click trên social.

### Câu 2: Canonical tag giúp gì cho SEO? Khi nào cần sử dụng?

**Trả lời:** Canonical tag (`<link rel="canonical">`) cho Google biết URL nào là phiên bản "chính thức" khi có nhiều URL dẫn đến cùng nội dung. Nên dùng khi: (1) Trang có query parameters (`?utm_source=...`), (2) Trang có www và non-www, (3) Nội dung được syndicate trên nhiều domain, (4) Trang phân trang. Mỗi trang nên có self-referencing canonical để tránh vấn đề duplicate content.

### Câu 3: Tại sao cần khai báo hreflang hai chiều? Nếu chỉ khai báo một chiều thì sao?

**Trả lời:** Google yêu cầu hreflang phải là bidirectional (hai chiều) để xác nhận mối quan hệ giữa các phiên bản ngôn ngữ. Nếu trang tiếng Việt chỉ đến trang tiếng Anh nhưng trang tiếng Anh không chỉ ngược lại, Google có thể bỏ qua hreflang vì không có sự "xác nhận" từ cả hai phía. Kết quả là Google có thể hiển thị sai phiên bản ngôn ngữ cho người dùng.

### Câu 4: Làm sao biết meta tags đã được setup đúng?

**Trả lời:** Có nhiều cách kiểm tra: (1) Xem page source (`Ctrl+U`) và kiểm tra trong `<head>`, (2) Dùng Facebook Sharing Debugger để xem OG tags, (3) Dùng Google Search Console để phát hiện vấn đề indexing, (4) Dùng Lighthouse audit để kiểm tra SEO cơ bản, (5) Dùng extension như SEO Meta in 1 Click. Trong CI/CD, có thể viết test kiểm tra sự tồn tại của các meta tags bắt buộc.

### Câu 5: `<meta name="robots" content="noindex">` khác gì với `Disallow` trong robots.txt?

**Trả lời:** `robots.txt Disallow` ngăn crawler truy cập trang (không crawl), nhưng nếu có trang khác link đến trang đó, Google vẫn có thể index URL (chỉ không biết nội dung). `noindex` cho phép crawler truy cập trang nhưng yêu cầu không đưa trang vào index. Để đảm bảo trang không xuất hiện trên Google, nên dùng `noindex` thay vì `Disallow`. Lưu ý: nếu đã Disallow trang trong robots.txt thì Google sẽ không đọc được thẻ `noindex` trên trang đó.
