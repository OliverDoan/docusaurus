---
sidebar_position: 3
title: "URL và cấu trúc trang"
---

# URL và cấu trúc trang

## URL thân thiện với SEO

URL là một trong những tín hiệu SEO đầu tiên mà Google nhìn thấy. Một URL tốt giúp cả người dùng và search engine hiểu nội dung trang trước khi click vào.

### Nguyên tắc URL tốt

| Nguyên tắc | Ví dụ tốt | Ví dụ xấu |
|-----------|----------|----------|
| Ngắn gọn | `/seo/meta-tags` | `/seo/huong-dan-chi-tiet-ve-meta-tags-trong-seo` |
| Mô tả nội dung | `/blog/nextjs-seo-guide` | `/blog/post-12345` |
| Dùng gạch nối `-` | `/web-development` | `/web_development` hoặc `/webdevelopment` |
| Viết thường | `/seo-guide` | `/SEO-Guide` |
| Không có parameter thừa | `/products/keyboard` | `/products?id=123&ref=home&session=abc` |
| Không có extension | `/about` | `/about.html` hoặc `/about.php` |
| Có cấu trúc phân cấp | `/docs/seo/on-page` | `/docs-seo-on-page` |

### Cấu trúc URL lý tưởng

```
https://example.com/danh-muc/ten-bai-viet
```

```
# Vi du thuc te
https://devseo.vn/seo/on-page/meta-tags
https://devseo.vn/blog/nextjs-14-seo-guide
https://devseo.vn/products/mechanical-keyboard
```

### Những thứ cần tránh trong URL

```
# SAI: URL voi ID khong co nghia
https://example.com/p/12345

# SAI: URL qua dai
https://example.com/blog/2026/04/05/huong-dan-day-du-va-chi-tiet-ve-cach-toi-uu-url-cho-seo

# SAI: URL voi stop words khong can thiet
https://example.com/blog/cach-de-lam-seo-cho-trang-web-cua-ban

# SAI: URL voi ky tu dac biet
https://example.com/blog/seo%20guide%20(2026)

# DUNG: URL ngan, ro rang, co keyword
https://example.com/blog/seo-url-optimization
```

## Internal Linking (Liên kết nội bộ)

### Tại sao internal linking quan trọng?

Internal linking giúp:
1. **Google khám phá trang mới** — Googlebot đi theo links để tìm trang
2. **Phân phối link equity** — Trang có nhiều backlink "truyền" giá trị sang trang được link đến
3. **Thiết lập cấu trúc topic** — Google hiểu mối quan hệ giữa các trang
4. **Giảm bounce rate** — Người dùng có thêm nội dung để đọc

### Chiến lược internal linking

```
Trang tru cot (Pillar Page)
├── /seo/                          ← Trang overview, link den tat ca sub-topics
│   ├── /seo/on-page/meta-tags    ← Link nguoc len /seo/ va sang cac sub-topics khac
│   ├── /seo/on-page/url-structure ← Link nguoc len /seo/ va sang cac sub-topics khac
│   ├── /seo/technical/speed       ← Link nguoc len /seo/ va cross-link sang on-page
│   └── /seo/off-page/backlinks    ← Link nguoc len /seo/
```

### Best practices

```html
<!-- DUNG: Anchor text mo ta noi dung -->
<a href="/seo/on-page/meta-tags">huong dan meta tags nang cao</a>

<!-- SAI: Anchor text chung chung -->
<a href="/seo/on-page/meta-tags">click vao day</a>
<a href="/seo/on-page/meta-tags">doc them</a>

<!-- DUNG: Link tu nhien trong noi dung -->
<p>
  De hieu ro hon ve cach toi uu hinh anh, xem bai
  <a href="/seo/on-page/image-seo">hinh anh va media SEO</a>.
</p>

<!-- SAI: Nhoi link khong tu nhien -->
<p>
  <a href="/seo">SEO</a> la qua trinh <a href="/seo/on-page">toi uu on-page</a>
  de <a href="/seo/ranking">tang ranking</a> tren <a href="/seo/google">Google</a>.
</p>
```

### Số lượng link trên một trang

| Loại trang | Số link khuyến nghị | Ghi chú |
|-----------|-------------------|--------|
| Bài blog | 3-10 internal links | Phân bố đều trong bài |
| Trang danh mục | 20-50 links | Link đến các bài con |
| Trang chủ | 10-20 links | Link đến các section chính |
| Trang sản phẩm | 5-15 links | Related products + categories |

## Breadcrumbs

### Breadcrumbs là gì?

Breadcrumbs là thanh điều hướng hiển thị vị trí hiện tại của người dùng trong cấu trúc trang web:

```
Trang chu > SEO > On-Page > Meta Tags
```

### Lợi ích SEO

1. **Hiển thị trên SERP** — Google thay breadcrumb bằng URL thô trên kết quả tìm kiếm
2. **Internal linking tự động** — Mỗi breadcrumb level là một internal link
3. **UX tốt hơn** — Người dùng dễ dàng quay lại các trang trên

### Triển khai HTML + Schema

```html
<nav aria-label="Breadcrumb">
  <ol class="breadcrumb">
    <li><a href="/">Trang chu</a></li>
    <li><a href="/seo">SEO</a></li>
    <li><a href="/seo/on-page">On-Page</a></li>
    <li aria-current="page">Meta Tags</li>
  </ol>
</nav>

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
      "name": "Meta Tags"
    }
  ]
}
</script>
```

### Breadcrumbs trong Next.js

```tsx
// components/Breadcrumbs.tsx
import Link from 'next/link'

interface BreadcrumbItem {
  name: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

function Breadcrumbs({ items }: BreadcrumbsProps) {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.href ? { item: `https://example.com${item.href}` } : {}),
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <nav aria-label="Breadcrumb">
        <ol style={{ display: 'flex', listStyle: 'none', gap: '0.5rem' }}>
          {items.map((item, index) => (
            <li key={item.name}>
              {index > 0 && <span style={{ marginRight: '0.5rem' }}>&gt;</span>}
              {item.href ? (
                <Link href={item.href}>{item.name}</Link>
              ) : (
                <span aria-current="page">{item.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}

export default Breadcrumbs
```

## XML Sitemap

### Sitemap là gì?

XML Sitemap là file liệt kê tất cả các URL quan trọng trên trang web mà bạn muốn Google index. Nó giống như "bản đồ" giúp Googlebot tìm được tất cả các trang.

### Cấu trúc sitemap cơ bản

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-04-05</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/seo/on-page/meta-tags</loc>
    <lastmod>2026-04-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://example.com/blog/nextjs-seo</loc>
    <lastmod>2026-03-20</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
```

### Sitemap Index (cho trang lớn)

Khi trang có hơn 50,000 URL hoặc sitemap lớn hơn 50MB, cần chia thành nhiều sitemap và dùng sitemap index:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://example.com/sitemap-pages.xml</loc>
    <lastmod>2026-04-05</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap-blog.xml</loc>
    <lastmod>2026-04-05</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap-products.xml</loc>
    <lastmod>2026-04-03</lastmod>
  </sitemap>
</sitemapindex>
```

### Tạo sitemap tự động trong Next.js

```tsx
// app/sitemap.ts
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Lay danh sach bai viet tu database hoac CMS
  const posts = await getAllPosts()
  const products = await getAllProducts()

  const blogUrls = posts.map((post) => ({
    url: `https://example.com/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const productUrls = products.map((product) => ({
    url: `https://example.com/products/${product.slug}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: 'https://example.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://example.com/seo',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...blogUrls,
    ...productUrls,
  ]
}
```

### Submit sitemap lên Google

```bash
# 1. Dat link sitemap trong robots.txt
# File: public/robots.txt
# Sitemap: https://example.com/sitemap.xml

# 2. Submit qua Google Search Console
# Truy cap: https://search.google.com/search-console
# Vao phan Sitemaps > Nhap URL sitemap > Submit

# 3. Ping Google (khong bat buoc, Google tu tim)
curl "https://www.google.com/ping?sitemap=https://example.com/sitemap.xml"
```

## Redirects: 301 vs 302

### Khi nào dùng loại nào?

| Tình huống | Redirect | Lý do |
|-----------|----------|-------|
| Chuyển domain vĩnh viễn | 301 | Chuyển toàn bộ link equity |
| Đổi URL vĩnh viễn | 301 | Google cập nhật index |
| Gộp www và non-www | 301 | Chọn 1 phiên bản chính |
| HTTP sang HTTPS | 301 | Chuyển vĩnh viễn |
| A/B testing tạm thời | 302 | Không chuyển link equity |
| Bảo trì trang tạm thời | 302 | Trang cũ sẽ quay lại |
| Redirect theo geo/device | 302 | Trang gốc vẫn tồn tại |

### Triển khai trong Next.js

```javascript
// next.config.js
module.exports = {
  async redirects() {
    return [
      // 301: Permanent redirect
      {
        source: '/old-blog/:slug',
        destination: '/blog/:slug',
        permanent: true,  // 301
      },
      // 302: Temporary redirect
      {
        source: '/sale',
        destination: '/products?promo=summer2026',
        permanent: false,  // 302
      },
      // Redirect voi regex
      {
        source: '/blog/:slug(\\d{4}-\\d{2}-.*)',
        destination: '/blog/:slug',
        permanent: true,
      },
      // Redirect voi wildcard
      {
        source: '/docs/v1/:path*',
        destination: '/docs/v2/:path*',
        permanent: true,
      },
    ]
  },
}
```

### Triển khai với Nginx

```bash
# 301 Redirect
server {
    # Chuyen www sang non-www
    server_name www.example.com;
    return 301 https://example.com$request_uri;
}

# 301 Redirect URL cu sang moi
location /old-page {
    return 301 /new-page;
}

# 302 Redirect tam thoi
location /maintenance {
    return 302 /coming-soon;
}
```

### Redirect chains và loops

```
# SAI: Redirect chain (A -> B -> C -> D)
/page-a -> 301 -> /page-b -> 301 -> /page-c -> 301 -> /page-d
# Google mat thoi gian crawl, link equity bi giam qua moi buoc

# DUNG: Redirect truc tiep (A -> D)
/page-a -> 301 -> /page-d
/page-b -> 301 -> /page-d
/page-c -> 301 -> /page-d

# SAI: Redirect loop (A -> B -> A)
/page-a -> 301 -> /page-b -> 301 -> /page-a
# Trang se khong load duoc!
```

## Cấu trúc trang SEO-friendly

### Flat vs Deep Architecture

```
# Deep architecture (SAI cho SEO):
example.com/category/sub1/sub2/sub3/sub4/article
# Van de: Google co the khong crawl sau 3-4 cap

# Flat architecture (TOT cho SEO):
example.com/category/article
# Moi trang chi cach trang chu 2-3 click
```

### Quy tắc 3 click

Mỗi trang quan trọng nên có thể truy cập được trong tối đa 3 click từ trang chủ:

```
Click 1: Trang chu -> Danh muc
Click 2: Danh muc -> Danh muc con
Click 3: Danh muc con -> Bai viet
```

### Topic Cluster Architecture

```
                    Pillar Page
                    /seo/
                   /    |    \
                  /     |     \
    /seo/on-page  /seo/technical  /seo/off-page
      /    \         /    \          /    \
  meta-tags url   speed  crawl   backlinks outreach
```

Mỗi cluster có:
- **1 Pillar Page**: Trang tổng quan, link đến tất cả subtopics
- **Nhiều Cluster Pages**: Trang chi tiết, link ngược về Pillar
- **Internal links**: Các cluster pages link sang nhau

## Lỗi thường gặp

### 1. URL có ký tự tiếng Việt không encode

```
# SAI: URL voi dau tieng Viet
https://example.com/hướng-dẫn-seo

# DUNG: URL khong dau
https://example.com/huong-dan-seo
```

### 2. Thay đổi URL mà không redirect

Khi đổi URL từ `/old-page` sang `/new-page` mà không tạo redirect 301, bạn mất toàn bộ link equity và Google sẽ trả về lỗi 404.

### 3. Sitemap chứa URL noindex hoặc 404

Sitemap chỉ nên chứa các URL mà bạn muốn Google index. Không đưa vào sitemap:
- Trang có `noindex`
- Trang 404
- Trang redirect
- Trang duplicate (không có canonical)

### 4. Không có trailing slash nhất quán

```
# Chon MOT kieu va giu nhat quan
https://example.com/blog/    (co trailing slash)
https://example.com/blog     (khong co trailing slash)

# Neu dung ca hai, Google coi la 2 trang khac nhau!
# Cau hinh redirect de dam bao nhat quan
```

### 5. Quá nhiều redirect 301

Mỗi redirect khiến trang tải chậm hơn (thêm 1 HTTP request). Kiểm tra và giảm redirect chains xuống còn 1 bước duy nhất.

## Câu hỏi phỏng vấn

### Câu 1: 301 và 302 redirect khác nhau như thế nào về mặt SEO?

**Trả lời:** 301 (Permanent) báo Google rằng trang đã chuyển vĩnh viễn — Google sẽ chuyển link equity (khoảng 90-99%) từ URL cũ sang URL mới và cập nhật index. 302 (Temporary) báo Google rằng trang chỉ chuyển tạm thời — Google giữ URL cũ trong index và không chuyển link equity. Dùng sai loại redirect là lỗi phổ biến: dùng 302 cho redirect vĩnh viễn sẽ khiến mất link equity.

### Câu 2: Internal linking ảnh hưởng đến SEO như thế nào?

**Trả lời:** Internal linking giúp SEO theo 3 cách: (1) **Khám phá** — Googlebot tìm trang mới bằng cách đi theo internal links, (2) **Link equity** — Trang có nhiều backlinks chuyển "giá trị" sang các trang được link đến, (3) **Ngữ cảnh** — Anchor text của internal link giúp Google hiểu nội dung trang đích. Chiến lược tốt là link từ trang có authority cao đến trang mới/quan trọng, dùng anchor text mô tả cụ thể.

### Câu 3: Sitemap có giúp trang được index nhanh hơn không?

**Trả lời:** Sitemap không đảm bảo trang sẽ được index, nhưng giúp Googlebot khám phá trang nhanh hơn, đặc biệt với: (1) Trang mới chưa có internal link nào trỏ đến, (2) Trang web lớn (100,000+ URL), (3) Trang có cấu trúc phức tạp. Google cũng dùng `lastmod` trong sitemap để biết trang nào đã cập nhật để ưu tiên crawl lại.

### Câu 4: Tại sao URL ngắn lại tốt hơn cho SEO?

**Trả lời:** URL ngắn tốt hơn vì: (1) Dễ đọc và nhớ cho người dùng, (2) Hiển thị đầy đủ trên SERP (URL dài bị cắt), (3) Dễ chia sẻ trên mạng xã hội, (4) Google có thể ưu tiên URL ngắn gọn hơn khi xếp hạng. Tuy nhiên, "ngắn" không có nghĩa là bỏ hết — URL vẫn cần chứa keyword mô tả nội dung. Lý tưởng là 3-5 từ, dưới 60 ký tự.

### Câu 5: Flat site architecture và deep site architecture: cái nào tốt hơn cho SEO?

**Trả lời:** Flat architecture (mỗi trang cách trang chủ 2-3 click) thường tốt hơn vì: (1) Googlebot dễ khám phá tất cả các trang, (2) Link equity được phân phối đều hơn, (3) Người dùng truy cập nhanh hơn. Deep architecture (4-5+ cấp) khiến Googlebot có thể không crawl đến các trang sâu, và link equity bị loãng. Tuy nhiên, trang web lớn (e-commerce với 100,000 sản phẩm) cần sự cân bằng — dùng breadcrumbs và internal linking để rút ngắn "khoảng cách" đến trang sâu.
