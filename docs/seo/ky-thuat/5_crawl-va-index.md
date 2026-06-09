---
sidebar_position: 5
title: "5. Crawl và Index"
---

# Crawl và Index

Crawl và Index là hai bước riêng biệt trong cách Google xử lý website: crawl là việc bot tải nội dung trang, còn index là việc Google lưu trang vào cơ sở dữ liệu để có thể xuất hiện trong kết quả tìm kiếm. Hiểu rõ sự khác biệt này giúp bạn kiểm soát đúng cách trang nào được Google đọc và hiển thị. Bài này hướng dẫn các công cụ như robots.txt, XML sitemap, canonical URL, meta robots và crawl budget; phần chi tiết nằm bên dưới.

## Mục lục

- [Crawl và Index khác nhau thế nào?](#crawl-và-index-khác-nhau-thế-nào)
- [robots.txt](#robotstxt)
- [XML Sitemap](#xml-sitemap)
- [Canonical URLs](#canonical-urls)
- [Meta Robots Directives](#meta-robots-directives)
- [Crawl Budget](#crawl-budget)
- [Google Search Console — Index Coverage](#google-search-console-index-coverage)
- [Tổng hợp: Quy trình kiểm tra Technical SEO](#tổng-hợp-quy-trình-kiểm-tra-technical-seo)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Crawl và Index khác nhau thế nào?

Nhiều developer nhầm lẫn giữa crawl và index. Đây là 2 bước riêng biệt:

```
Crawl → Render → Index → Rank

1. Crawl: Googlebot tải HTML của trang
2. Render: Googlebot chạy JavaScript (nếu có)
3. Index: Google phân tích nội dung và lưu vào database
4. Rank: Google xếp hạng trang cho các truy vấn phù hợp
```

| Bước | Ý nghĩa | Kiểm soát bằng |
|------|---------|----------------|
| **Crawl** | Bot có thể truy cập trang không? | `robots.txt`, crawl budget |
| **Index** | Google có lưu trang vào database không? | `meta robots`, `X-Robots-Tag`, `noindex` |
| **Rank** | Trang có xuất hiện trong kết quả tìm kiếm không? | Content quality, backlinks, UX |

**Lưu ý quan trọng**: Chặn crawl bằng `robots.txt` KHÔNG có nghĩa là chặn index. Google vẫn có thể index URL (nhưng không thấy nội dung) nếu có link trỏ đến từ trang khác.

## robots.txt

### robots.txt là gì?

File `robots.txt` nằm ở root domain (`example.com/robots.txt`), hướng dẫn các bot nên crawl gì và không nên crawl gì.

### Cú pháp cơ bản

```bash
# robots.txt

# Áp dụng cho tất cả bot
User-agent: *

# Không cho crawl thư mục admin
Disallow: /admin/
Disallow: /api/
Disallow: /internal/

# Không cho crawl file có query params
Disallow: /*?*sort=
Disallow: /*?*filter=

# Cho phép crawl CSS và JS (BẮT BUỘC cho rendering)
Allow: /assets/
Allow: /*.css$
Allow: /*.js$

# Sitemap location
Sitemap: https://example.com/sitemap.xml
```

### robots.txt cho các trường hợp phổ biến

```bash
# === Website thương mại ===
User-agent: *
Disallow: /cart/
Disallow: /checkout/
Disallow: /account/
Disallow: /admin/
Disallow: /api/
Disallow: /search?*
Disallow: /*?sort=
Disallow: /*?filter=
Disallow: /*?page=     # Hoặc cho phép nếu muốn index pagination

Allow: /
Sitemap: https://shop.example.com/sitemap.xml

# === Blog / Documentation site ===
User-agent: *
Disallow: /draft/
Disallow: /preview/
Disallow: /admin/
Disallow: /api/

Allow: /
Sitemap: https://blog.example.com/sitemap.xml

# === Chặn bot cụ thể ===
User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

# === Staging/Dev environment ===
User-agent: *
Disallow: /
# Chặn tất cả bot trên staging
```

### Kiểm tra robots.txt

```bash
# Test robots.txt bằng Google Search Console
# Search Console → Settings → robots.txt Tester

# Hoặc kiểm tra trực tiếp
curl -s https://example.com/robots.txt
```

### Quy tắc ưu tiên trong robots.txt

```bash
# Quy tắc: Allow cụ thể hơn sẽ override Disallow chung hơn

User-agent: *
Disallow: /private/         # Chặn toàn bộ /private/
Allow: /private/public.html # Nhưng cho phép file cụ thể này

# Wildcard pattern
Disallow: /*.pdf$           # Chặn tất cả file PDF
Disallow: /temp*            # Chặn URL bắt đầu bằng /temp
Allow: /temporary-sale/     # Nhưng cho phép /temporary-sale/
```

## XML Sitemap

### Sitemap là gì?

XML Sitemap là file liệt kê tất cả URL bạn muốn Google index. Nó giúp Googlebot **discover** các trang mà có thể không tìm được qua internal links.

### Cấu trúc sitemap cơ bản

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2025-01-15</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/products</loc>
    <lastmod>2025-01-14</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://example.com/blog/javascript-seo</loc>
    <lastmod>2025-01-10</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

### Sitemap Index (cho site lớn)

Mỗi sitemap tối đa 50,000 URL hoặc 50MB. Site lớn cần chia thành nhiều sitemap:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://example.com/sitemap-pages.xml</loc>
    <lastmod>2025-01-15</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap-products.xml</loc>
    <lastmod>2025-01-14</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap-blog.xml</loc>
    <lastmod>2025-01-10</lastmod>
  </sitemap>
</sitemapindex>
```

### Tự động generate sitemap với Next.js

```javascript
// app/sitemap.js (Next.js App Router)
export default async function sitemap() {
  const baseUrl = 'https://example.com';

  // Trang tĩnh
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), priority: 0.5 },
  ];

  // Trang động từ database/CMS
  const posts = await getAllPosts();
  const postPages = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const products = await getAllProducts();
  const productPages = products.map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  return [...staticPages, ...postPages, ...productPages];
}
```

### Sitemap Best Practices

| Nên | Không nên |
|-----|-----------|
| Chỉ include URL muốn index | Include URL bị `noindex` |
| `lastmod` chính xác (khi nội dung thực sự thay đổi) | `lastmod` luôn là ngày hôm nay |
| Submit sitemap qua Search Console | Chỉ đặt sitemap mà không submit |
| Tự động generate từ CMS/database | Viết tay và quên cập nhật |
| Chia sitemap khi quá 10,000 URLs | Để 1 sitemap 200,000 URLs |
| Include canonical URL (không có query params) | Include URL redirect hoặc duplicate |

## Canonical URLs

### Vấn đề Duplicate Content

Một trang có thể truy cập qua nhiều URL khác nhau:

```
https://example.com/products/shoes
https://example.com/products/shoes?color=red
https://example.com/products/shoes?color=red&size=42
https://example.com/products/shoes?utm_source=google
http://example.com/products/shoes  (HTTP)
https://www.example.com/products/shoes  (www)
https://example.com/products/shoes/  (trailing slash)
```

Tất cả đều hiển thị nội dung giống nhau (hoặc gần giống). Google không biết URL nào là "chính", dẫn đến:
- Chia sẻ link equity (backlink juice) giữa nhiều URL
- Google có thể chọn URL sai làm đại diện
- Crawl budget lãng phí vào URL trùng lặp

### Giải pháp: Canonical Tag

```html
<head>
  <!-- Khai báo URL canonical — URL "chính" của nội dung này -->
  <link rel="canonical" href="https://example.com/products/shoes" />
</head>
```

### Cài đặt canonical trong Next.js

```javascript
// app/products/[id]/page.js
export async function generateMetadata({ params }) {
  const product = await getProduct(params.id);

  return {
    title: product.name,
    alternates: {
      canonical: `https://example.com/products/${params.id}`,
    },
  };
}
```

### Canonical cho pagination

```html
<!-- Trang 1: canonical trỏ về chính nó -->
<!-- URL: /blog?page=1 -->
<link rel="canonical" href="https://example.com/blog" />

<!-- Trang 2: canonical trỏ về chính nó (KHÔNG trỏ về trang 1) -->
<!-- URL: /blog?page=2 -->
<link rel="canonical" href="https://example.com/blog?page=2" />
```

**Lưu ý**: Mỗi trang pagination có nội dung khác nhau (bài viết khác nhau), nên canonical phải trỏ về chính nó. Không set tất cả trang pagination canonical về trang 1.

### Self-referencing canonical

```html
<!-- LUÔN đặt canonical ngay cả khi trang không có duplicate -->
<!-- Gọi là self-referencing canonical -->
<link rel="canonical" href="https://example.com/about" />

<!-- Lợi ích: phòng ngừa duplicate từ query params, trailing slash, v.v. -->
```

## Meta Robots Directives

### Thẻ `<meta name="robots">`

```html
<head>
  <!-- Cho phép index và follow links (mặc định) -->
  <meta name="robots" content="index, follow" />

  <!-- Không index trang này, nhưng follow links -->
  <meta name="robots" content="noindex, follow" />

  <!-- Index trang nhưng không follow links -->
  <meta name="robots" content="index, nofollow" />

  <!-- Không index, không follow -->
  <meta name="robots" content="noindex, nofollow" />

  <!-- Không hiện snippet trong kết quả tìm kiếm -->
  <meta name="robots" content="nosnippet" />

  <!-- Giới hạn snippet tối đa 160 ký tự -->
  <meta name="robots" content="max-snippet:160" />

  <!-- Không hiện cached version -->
  <meta name="robots" content="noarchive" />

  <!-- Không index ảnh trên trang này -->
  <meta name="robots" content="noimageindex" />
</head>
```

### X-Robots-Tag (HTTP Header)

Dùng khi không thể thêm meta tag vào HTML (ví dụ: file PDF, ảnh):

```
# Nginx: noindex cho tất cả PDF
location ~* \.pdf$ {
    add_header X-Robots-Tag "noindex, nofollow";
}

# Nginx: noindex cho staging subdomain
server {
    server_name staging.example.com;
    add_header X-Robots-Tag "noindex, nofollow" always;
}
```

### Khi nào dùng noindex?

| Trang | Nên noindex? | Lý do |
|-------|-------------|-------|
| Trang thanh toán/giỏ hàng | Co | Không có giá trị SEO, mỗi user khác nhau |
| Trang cảm ơn (thank you) | Co | Nội dung mỏng, không cần index |
| Trang tìm kiếm nội bộ | Co | Duplicate content, nội dung thay đổi liên tục |
| Trang tag/archive trùng nội dung | Co | Duplicate với category page |
| Trang chính sách, T&C | Tùy | Index nếu muốn hiện trong search |
| Trang pagination | Tùy | Có thể index nếu mỗi trang có nội dung khác |
| Trang 404 | Khong can | Google tự hiểu, không cần noindex |
| Trang đăng nhập | Co | Không có giá trị cho user tìm kiếm |

### Cài đặt noindex trong Next.js

```javascript
// app/admin/page.js — trang admin không cần SEO
export const metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

// app/search/page.js — trang search nội bộ
export const metadata = {
  robots: {
    index: false,
    follow: true, // Vẫn follow links để discover content
  },
};
```

## Crawl Budget

### Crawl Budget là gì?

Crawl budget là số lượng trang Googlebot sẽ crawl trên website của bạn trong một khoảng thời gian. Nó phụ thuộc vào:

- **Crawl capacity limit**: Googlebot không muốn crawl quá nhanh gây quá tải server
- **Crawl demand**: Trang phổ biến, cập nhật thường xuyên sẽ được crawl nhiều hơn

### Ai cần quan tâm crawl budget?

| Quy mô site | Cần tối ưu crawl budget? |
|-------------|-------------------------|
| Dưới 1,000 trang | Không cần — Google crawl thoải mái |
| 1,000 - 10,000 trang | Nên kiểm tra — có thể có vấn đề |
| Trên 10,000 trang | Bắt buộc — crawl budget ảnh hưởng rõ rệt |
| Trên 100,000 trang | Cực kỳ quan trọng — trang quan trọng có thể không được crawl |

### Tối ưu Crawl Budget

**1. Loại bỏ trang không cần crawl:**

```bash
# robots.txt — chặn URL không có giá trị SEO
User-agent: *
Disallow: /search?*          # Trang search nội bộ
Disallow: /*?sort=*          # URL với sort parameter
Disallow: /*?filter=*        # URL với filter parameter
Disallow: /tag/*             # Tag pages trùng nội dung
Disallow: /print/*           # Print versions
```

**2. Fix redirect chains:**

```
# SAI: Redirect chain 3 bước — lãng phí 3 crawl
/old-page → /newer-page → /newest-page → /final-page

# ĐÚNG: Redirect trực tiếp 1 bước
/old-page → /final-page
/newer-page → /final-page
/newest-page → /final-page
```

**3. Xử lý soft 404:**

```javascript
// SAI: Trang không tồn tại nhưng trả về 200 OK
app.get('/products/:id', async (req, res) => {
  const product = await getProduct(req.params.id);
  if (!product) {
    // Trả về trang "Không tìm thấy" nhưng status 200
    res.render('not-found'); // Googlebot nghĩ đây là trang hợp lệ!
  }
  res.render('product', { product });
});

// ĐÚNG: Trả về 404 status code
app.get('/products/:id', async (req, res) => {
  const product = await getProduct(req.params.id);
  if (!product) {
    res.status(404).render('not-found'); // Googlebot hiểu và bỏ qua
    return;
  }
  res.render('product', { product });
});
```

**4. Internal linking hợp lý:**

```html
<!-- Trang quan trọng nên có nhiều internal links trỏ đến -->
<!-- Navigation -->
<nav>
  <a href="/products">Sản phẩm</a>  <!-- Link từ mọi trang -->
  <a href="/blog">Blog</a>
</nav>

<!-- Breadcrumb giúp distribute crawl budget -->
<nav aria-label="Breadcrumb">
  <a href="/">Trang chủ</a> >
  <a href="/products">Sản phẩm</a> >
  <span>Giày thể thao</span>
</nav>

<!-- Related links trong nội dung -->
<p>Xem thêm: <a href="/products/running-shoes">Giày chạy bộ</a></p>
```

## Google Search Console — Index Coverage

### Các trạng thái phổ biến

| Trạng thái | Ý nghĩa | Hành động |
|-----------|---------|-----------|
| **Submitted and indexed** | URL trong sitemap đã được index | Tốt, không cần làm gì |
| **Indexed, not submitted in sitemap** | Đã index nhưng không có trong sitemap | Thêm vào sitemap |
| **Discovered - currently not indexed** | Google biết URL nhưng chưa crawl | Cải thiện internal linking, submit URL |
| **Crawled - currently not indexed** | Đã crawl nhưng không index | Cải thiện nội dung, kiểm tra quality |
| **Excluded by noindex tag** | Có `noindex` meta tag | Đúng nếu bạn muốn, bỏ noindex nếu muốn index |
| **Blocked by robots.txt** | robots.txt chặn crawl | Mở nếu muốn Google crawl |
| **Duplicate, submitted URL not selected as canonical** | URL trùng, Google chọn canonical khác | Kiểm tra canonical tag |
| **Redirect** | URL redirect sang URL khác | Cập nhật internal links trỏ thẳng đến URL đích |

### robots.txt trong Next.js

```javascript
// app/robots.js
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/search?'],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
    ],
    sitemap: 'https://example.com/sitemap.xml',
  };
}
```

### Kiểm tra index status bằng script

```javascript
// Kiểm tra URL đã được Google index chưa
// Dùng Google Search Console API

const { google } = require('googleapis');

async function checkIndexStatus(siteUrl, inspectionUrl) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/webmasters'],
  });

  const searchconsole = google.searchconsole({ version: 'v1', auth });

  const result = await searchconsole.urlInspection.index.inspect({
    requestBody: {
      siteUrl: siteUrl,
      inspectionUrl: inspectionUrl,
    },
  });

  const inspection = result.data.inspectionResult;
  console.log('Index Status:', inspection.indexStatusResult.coverageState);
  console.log('Crawled As:', inspection.indexStatusResult.crawledAs);
  console.log('Robots:', inspection.indexStatusResult.robotsTxtState);
  console.log('Page Fetch:', inspection.indexStatusResult.pageFetchState);

  return inspection;
}

// Sử dụng
checkIndexStatus(
  'https://example.com/',
  'https://example.com/blog/javascript-seo'
);
```

## Tổng hợp: Quy trình kiểm tra Technical SEO

```
1. robots.txt
   └─ Có chặn URL quan trọng không?
   └─ Có cho phép crawl CSS/JS không?
   └─ Có khai báo sitemap không?

2. Sitemap
   └─ Đã submit lên Search Console?
   └─ lastmod có chính xác không?
   └─ Có chứa URL bị noindex/redirect không?

3. Canonical
   └─ Mỗi trang có self-referencing canonical?
   └─ Canonical trỏ đúng URL không (HTTPS, non-www)?
   └─ Pagination có canonical riêng cho mỗi trang?

4. Meta Robots
   └─ Trang nào cần noindex?
   └─ Trang noindex có đang trong sitemap không? (Nên bỏ)

5. Crawl Budget
   └─ Có redirect chains không?
   └─ Có soft 404 không?
   └─ Internal linking có hợp lý không?

6. Search Console
   └─ Index Coverage có lỗi gì?
   └─ Bao nhiêu trang "Discovered - not indexed"?
   └─ Bao nhiêu trang "Crawled - not indexed"?
```

## Lỗi thường gặp

1. **Chặn CSS/JS trong robots.txt** — Googlebot không render được trang, không thấy nội dung, ảnh hưởng mobile-friendly test
2. **Nhầm lẫn robots.txt Disallow với noindex** — `Disallow` chỉ chặn crawl, không chặn index. Muốn chặn index phải dùng `noindex` meta tag
3. **Canonical trỏ đến trang noindex** — Google nhận tín hiệu mâu thuẫn, có thể bỏ qua canonical
4. **`lastmod` trong sitemap luôn là ngày hôm nay** — Google mất tin tưởng vào `lastmod` và bỏ qua hoàn toàn
5. **Không submit sitemap qua Search Console** — Google có thể tự tìm sitemap qua robots.txt, nhưng submit trực tiếp giúp Google discover nhanh hơn
6. **Để trang search nội bộ được index** — Tạo hàng nghìn URL trùng lặp (`/search?q=abc`, `/search?q=xyz`), lãng phí crawl budget
7. **Redirect chain dài** — Mỗi redirect tốn 1 crawl, chain 5 bước = lãng phí 5 crawl cho 1 URL, và Google có thể dừng follow sau 5 redirects

## Câu hỏi phỏng vấn

### Câu 1: robots.txt Disallow có ngăn Google index URL không?

**Trả lời:**
Không. `Disallow` trong robots.txt chỉ ngăn Googlebot **crawl** (tải nội dung) URL đó, nhưng Google vẫn có thể **index** URL nếu có backlink từ trang khác trỏ đến. URL sẽ xuất hiện trong search results với tiêu đề và snippet rỗng (vì Google không đọc được nội dung). Muốn ngăn index hoàn toàn, phải dùng `<meta name="robots" content="noindex">` hoặc `X-Robots-Tag: noindex` HTTP header. Nhưng để meta robots hoạt động, không được chặn crawl URL đó trong robots.txt (vì Googlebot phải crawl được mới thấy meta tag).

### Câu 2: Website có 500,000 trang sản phẩm nhưng chỉ 10,000 được index. Nguyên nhân và giải pháp?

**Trả lời:**
Nguyên nhân có thể: (1) Crawl budget không đủ — Googlebot không kịp crawl hết; (2) Nội dung mỏng/trùng lặp — Google chọn không index; (3) Internal linking yếu — nhiều trang không có link nào trỏ đến (orphan pages); (4) Server chậm — Googlebot giảm crawl rate. Giải pháp: (1) Tối ưu robots.txt, chặn URL không cần thiết; (2) Chia sitemap theo danh mục, submit riêng; (3) Cải thiện internal linking với breadcrumb và related products; (4) Fix redirect chains; (5) Cải thiện server response time; (6) Thêm unique content cho mỗi sản phẩm (mô tả, review).

### Câu 3: Giải thích canonical tag. Khi nào cần dùng?

**Trả lời:**
Canonical tag (`<link rel="canonical" href="...">`) chỉ định URL "chính" khi cùng nội dung có nhiều URL. Google sẽ tập trung link equity vào canonical URL và hiện nó trong search results. Cần dùng khi: (1) URL có query parameters (`?color=red`, `?utm_source=google`); (2) HTTP và HTTPS cùng tồn tại; (3) www và non-www; (4) URL có trailing slash và không có; (5) Content syndication (bài đăng lại trên trang khác). Best practice: luôn đặt self-referencing canonical trên mọi trang để phòng ngừa duplicate.

### Câu 4: Sự khác biệt giữa `noindex` và `Disallow` trong robots.txt? Khi nào dùng cái nào?

**Trả lời:**
`Disallow` (robots.txt): ngăn bot crawl URL, nhưng URL vẫn có thể được index nếu có external links. Bot không tải được nội dung nên không thấy meta tags. Dùng cho: trang server-heavy mà bạn muốn tiết kiệm crawl budget (API endpoints, asset directories). `noindex` (meta robots): cho phép bot crawl và đọc nội dung, nhưng yêu cầu không index. Dùng cho: trang bạn muốn Google biết nhưng không hiện trong search (thank you pages, internal search, staging). Lưu ý: KHÔNG kết hợp Disallow + noindex — nếu Disallow thì bot không crawl được, không thấy noindex tag.

### Câu 5: lastmod trong sitemap có ảnh hưởng đến crawl frequency không?

**Trả lời:**
Co, nhưng chỉ khi `lastmod` chính xác. Google dùng `lastmod` để ưu tiên crawl trang thay đổi gần đây. Nếu `lastmod` luôn cập nhật (dù nội dung không thay đổi), Google sẽ mất tin tưởng và bỏ qua hoàn toàn `lastmod` cho toàn bộ sitemap. Best practice: chỉ cập nhật `lastmod` khi nội dung thực sự thay đổi đáng kể (không đếm thay đổi CSS/layout), dùng timestamp chính xác từ database (`updated_at`), không dùng ngày hiện tại cho tất cả URLs.
