---
sidebar_position: 1
title: "1. SEO Fundamentals"
---

# SEO Fundamentals

> *SEO không phải việc riêng của marketing — phần lớn technical SEO nằm trong tay frontend developer: meta tags, rendering, performance, semantic HTML. Interviewer hỏi SEO để xem bạn có nhìn sản phẩm xa hơn cái component hay không.*

---

## Câu 1: SEO là gì? Tại sao frontend developer cần hiểu SEO? `[Basic]`

### Câu hỏi

> Em hiểu SEO là gì? Là một frontend developer, tại sao em cần quan tâm đến SEO trong khi đã có team marketing?

### Giải thích lý thuyết

**SEO (Search Engine Optimization)** là tập hợp kỹ thuật giúp website được search engine **crawl, index và rank** tốt hơn, từ đó tăng organic traffic (traffic không trả tiền từ kết quả tìm kiếm).

Quy trình search engine xử lý một trang gồm 3 bước:

1. **Crawling** — Googlebot tải HTML của trang, theo các link để khám phá trang mới.
2. **Indexing** — phân tích nội dung (text, meta tags, structured data) và lưu vào index.
3. **Ranking** — khi user search, thuật toán xếp hạng các trang trong index theo độ liên quan và chất lượng.

SEO chia làm 3 mảng, trong đó **technical SEO gần như hoàn toàn thuộc về frontend developer**:

| Mảng | Nội dung | Ai chịu trách nhiệm chính |
| ---- | -------- | ------------------------- |
| **Technical SEO** | Rendering strategy, meta tags, sitemap, robots.txt, Core Web Vitals, semantic HTML, mobile-friendly | **Frontend developer** |
| **On-page SEO** | Nội dung, keywords, heading structure, internal linking | Content + Frontend |
| **Off-page SEO** | Backlinks, social signals | Marketing |

Frontend developer ảnh hưởng trực tiếp đến SEO qua:

- **Rendering**: chọn sai CSR có thể khiến Google không thấy content.
- **Performance**: Core Web Vitals là ranking signal chính thức.
- **Semantic HTML**: heading hierarchy, landmark elements giúp Google hiểu cấu trúc trang.
- **Meta tags & structured data**: quyết định trang hiển thị thế nào trên SERP (Search Engine Results Page).

### Code minh hoạ

```html
<!-- Cùng một nội dung, hai cách viết — Google "hiểu" rất khác nhau -->

<!-- ❌ Div soup: không có ngữ nghĩa -->
<div class="title">iPhone 17 Pro Review</div>
<div class="text">...</div>

<!-- ✅ Semantic HTML: Google hiểu đây là bài viết, có heading chính -->
<article>
  <h1>iPhone 17 Pro Review</h1>
  <p>...</p>
</article>
```

### Đáp án mẫu

> "SEO là tối ưu để search engine crawl, index và rank trang web tốt hơn, mang lại organic traffic. Em cần hiểu SEO vì technical SEO nằm gần như hoàn toàn trong tay frontend: em quyết định rendering strategy — nếu chọn CSR thuần thì Google có thể không thấy content; em chịu trách nhiệm Core Web Vitals — là ranking signal chính thức của Google; em viết meta tags, semantic HTML, structured data — quyết định trang hiển thị thế nào trên kết quả tìm kiếm. Marketing có thể làm content và backlinks, nhưng nếu nền tảng kỹ thuật kém thì content tốt mấy cũng không được index đúng. Nên với em, SEO là một phần của định nghĩa 'done' khi build trang public."

---

## Câu 2: Meta tags quan trọng nhất cho SEO là gì? Cách viết title và description hiệu quả? `[Basic]`

### Câu hỏi

> Em kể những meta tags quan trọng nhất cho SEO? Viết title và meta description thế nào cho hiệu quả?

### Giải thích lý thuyết

Các meta tags quan trọng nhất:

| Tag | Vai trò | Lưu ý |
| --- | ------- | ----- |
| `<title>` | **Ranking signal mạnh** + hiển thị trên SERP và tab browser | 50–60 ký tự, keyword chính đặt đầu |
| `<meta name="description">` | Không phải ranking signal trực tiếp, nhưng ảnh hưởng **CTR** (click-through rate) | 150–160 ký tự, có call-to-action |
| `<meta name="robots">` | Điều khiển index/follow từng trang | `noindex`, `nofollow`, `max-image-preview`... |
| `<link rel="canonical">` | Chỉ định URL chính thức, tránh duplicate content | Xem câu 5 |
| `<meta name="viewport">` | Mobile-friendly — Google index mobile-first | Bắt buộc cho mọi trang |
| `<meta charset="utf-8">` | Encoding đúng | Đặt đầu `<head>` |

Nguyên tắc viết **title** hiệu quả:

- **Unique cho từng trang** — title trùng lặp là lỗi SEO phổ biến nhất.
- Keyword chính đặt **gần đầu**, tên brand đặt cuối: `Giày chạy bộ nam | Tên Shop`.
- 50–60 ký tự — dài hơn sẽ bị Google cắt (`...`) trên SERP.
- Mô tả đúng nội dung — Google có thể tự viết lại title nếu thấy không khớp.

Nguyên tắc viết **description**:

- 150–160 ký tự, tóm tắt giá trị trang mang lại + lý do để click.
- Chứa keyword (được bôi đậm trên SERP khi khớp query → tăng CTR).
- Mỗi trang một description riêng; thiếu thì Google tự lấy đoạn text bất kỳ — thường không đẹp.

Lưu ý: `<meta name="keywords">` **đã bị Google bỏ qua từ lâu** — nhắc đến nó như tag quan trọng là điểm trừ trong phỏng vấn.

### Code minh hoạ

```html
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <!-- Title: keyword đầu, brand cuối, ~55 ký tự -->
  <title>Giày chạy bộ nam chính hãng, giá tốt | SportShop</title>

  <!-- Description: ~155 ký tự, có giá trị + CTA -->
  <meta
    name="description"
    content="Top giày chạy bộ nam Nike, Adidas, Asics chính hãng. Freeship toàn quốc, đổi trả 30 ngày. Xem ngay bộ sưu tập mới nhất 2026."
  />

  <!-- Trang không muốn index (trang search nội bộ, trang filter...) -->
  <meta name="robots" content="noindex, follow" />

  <link rel="canonical" href="https://sportshop.vn/giay-chay-bo-nam" />
</head>
```

```tsx
// Next.js App Router: Metadata API thay vì viết tay thẻ <head>
export const metadata = {
  title: "Giày chạy bộ nam chính hãng, giá tốt | SportShop",
  description: "Top giày chạy bộ nam Nike, Adidas, Asics chính hãng...",
};
```

### Đáp án mẫu

> "Quan trọng nhất là `<title>` — vừa là ranking signal mạnh vừa là dòng hiển thị trên kết quả tìm kiếm; em viết 50–60 ký tự, keyword chính đặt đầu, brand đặt cuối, và unique cho từng trang. Thứ hai là meta description — không phải ranking signal trực tiếp nhưng quyết định CTR, em viết 150–160 ký tự có giá trị rõ ràng và call-to-action. Ngoài ra có meta robots để kiểm soát index từng trang, canonical để xử lý duplicate content, và viewport vì Google index mobile-first. Một điểm em luôn lưu ý: meta keywords đã bị Google bỏ qua từ lâu nên không cần thêm. Trong Next.js em dùng Metadata API với title template để mọi trang đều có title/description riêng thay vì hardcode."

---

## Câu 3: robots.txt là gì? Cách cấu hình đúng? `[Basic]`

### Câu hỏi

> robots.txt dùng để làm gì? Phân biệt `Disallow` trong robots.txt với `noindex`? Lỗi cấu hình phổ biến là gì?

### Giải thích lý thuyết

**robots.txt** là file text đặt tại **root domain** (`https://example.com/robots.txt`) hướng dẫn crawler **được phép/không được phép crawl** những đường dẫn nào. Đây là "lời đề nghị" — crawler tử tế (Googlebot, Bingbot) tuân theo, crawler xấu thì không.

Cú pháp chính:

- `User-agent` — chỉ định crawler nào (`*` = tất cả).
- `Disallow` / `Allow` — chặn/cho phép crawl path.
- `Sitemap` — khai báo URL sitemap.

**Điểm hay bị hỏi xoáy — `Disallow` ≠ `noindex`:**

| | `Disallow` (robots.txt) | `noindex` (meta robots) |
| --- | --- | --- |
| Ý nghĩa | Đừng **crawl** (đừng tải trang) | Crawl được, nhưng đừng **index** |
| Trang còn xuất hiện trên Google? | **Có thể vẫn xuất hiện** (không có description) nếu có trang khác link tới | Không xuất hiện |
| Dùng khi | Tiết kiệm crawl budget, chặn khu vực không cần crawl | Muốn loại trang khỏi kết quả tìm kiếm |

⚠️ Bẫy kinh điển: muốn gỡ trang khỏi Google mà lại `Disallow` trong robots.txt → Googlebot **không thể crawl để thấy thẻ `noindex`** → trang vẫn nằm trong index. Đúng là phải **cho crawl + đặt `noindex`**.

Lỗi cấu hình phổ biến:

- `Disallow: /` để quên từ môi trường staging → mất index toàn site khi lên production.
- Chặn file CSS/JS → Google render trang không đúng, ảnh hưởng đánh giá mobile-friendly.
- Dùng robots.txt để "giấu" trang nhạy cảm — robots.txt là file public, ai cũng đọc được.

### Code minh hoạ

```txt
# https://example.com/robots.txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /cart
Disallow: /*?sort=        # chặn URL có query param sort (tránh duplicate)

# Chặn riêng một bot
User-agent: GPTBot
Disallow: /

Sitemap: https://example.com/sitemap.xml
```

```ts
// Next.js App Router: app/robots.ts — sinh robots.txt tự động
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] }],
    sitemap: "https://example.com/sitemap.xml",
  };
}
```

### Đáp án mẫu

> "robots.txt là file đặt ở root domain hướng dẫn crawler được crawl những path nào — dùng `User-agent`, `Disallow`, `Allow` và khai báo `Sitemap`. Điểm quan trọng em luôn nhấn mạnh: `Disallow` chỉ chặn crawl chứ không chặn index — trang bị disallow vẫn có thể xuất hiện trên Google nếu có link trỏ tới. Muốn loại trang khỏi kết quả tìm kiếm thì phải dùng meta `noindex` và **phải cho phép crawl** để Googlebot đọc được thẻ đó — đây là bẫy kinh điển nhiều người dính. Lỗi phổ biến khác: quên xoá `Disallow: /` từ staging khi deploy production, và chặn CSS/JS khiến Google render sai trang. Trong Next.js em dùng `app/robots.ts` để generate tự động theo môi trường, tránh hardcode."

---

## Câu 4: Sitemap XML là gì? Khi nào cần và cách tạo? `[Basic]`

### Câu hỏi

> Sitemap XML là gì, giải quyết vấn đề gì? Website nào cần sitemap? Cách tạo và submit?

### Giải thích lý thuyết

**Sitemap XML** là file liệt kê các URL quan trọng của website giúp search engine **khám phá trang nhanh và đầy đủ hơn**, đặc biệt những trang khó tiếp cận qua link thông thường.

Sitemap **không đảm bảo trang được index** — chỉ là gợi ý "những trang này tồn tại, hãy crawl chúng". Google tự quyết định có index hay không.

Khi nào sitemap đặc biệt quan trọng:

- Site **lớn** (hàng nghìn trang) — Google có thể bỏ sót trang.
- Site **mới**, ít backlink — Google khó khám phá qua link.
- Trang **orphan** (không có internal link trỏ tới).
- Content **thay đổi thường xuyên** (tin tức, e-commerce) — `lastmod` báo Google trang nào cần re-crawl.

Cấu trúc và giới hạn:

- Mỗi sitemap tối đa **50.000 URL hoặc 50MB** — site lớn dùng **sitemap index** trỏ tới nhiều sitemap con.
- Field hữu ích nhất là `lastmod` (Google dùng thật); `priority` và `changefreq` Google **bỏ qua**.
- Chỉ liệt kê URL **canonical, trả về 200, được phép index** — đưa URL redirect/404/noindex vào sitemap là lỗi.

Cách submit: khai báo trong robots.txt (`Sitemap: ...`) hoặc submit qua **Google Search Console** (nên làm cả hai — Search Console còn cho xem báo cáo lỗi index).

### Code minh hoạ

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-06-10</lastmod>
  </url>
  <url>
    <loc>https://example.com/blog/seo-cho-frontend</loc>
    <lastmod>2026-06-08</lastmod>
  </url>
</urlset>
```

```xml
<!-- Sitemap index cho site lớn -->
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>https://example.com/sitemap-products.xml</loc></sitemap>
  <sitemap><loc>https://example.com/sitemap-blog.xml</loc></sitemap>
</sitemapindex>
```

### Đáp án mẫu

> "Sitemap XML là file liệt kê các URL quan trọng giúp search engine khám phá trang nhanh và đầy đủ — nó là gợi ý chứ không đảm bảo index. Sitemap đặc biệt cần cho site lớn nhiều trang, site mới ít backlink, trang orphan không có internal link, và site có content thay đổi thường xuyên vì `lastmod` báo Google trang nào cần re-crawl. Giới hạn 50.000 URL mỗi file, site lớn thì dùng sitemap index. Em chỉ đưa vào sitemap những URL canonical, trả 200 và được index — đưa URL redirect hay noindex vào là lỗi hay gặp. `priority` và `changefreq` Google đã bỏ qua nên em không tốn công set. Sau khi tạo, em khai báo trong robots.txt và submit lên Google Search Console để theo dõi báo cáo index coverage."

---

## Câu 5: Canonical URL là gì? Khi nào cần sử dụng? `[Intermediate]`

### Câu hỏi

> Canonical URL là gì? Duplicate content gây hại gì cho SEO và canonical giải quyết thế nào?

### Giải thích lý thuyết

**Canonical URL** là cách khai báo với search engine: "trong số các URL có nội dung giống/gần giống nhau, **đây là URL chính thức** nên được index và nhận toàn bộ ranking signal".

**Vấn đề duplicate content**: cùng một nội dung truy cập được qua nhiều URL:

```
https://shop.vn/ao-thun
https://shop.vn/ao-thun?utm_source=facebook
https://shop.vn/ao-thun?sort=price
https://www.shop.vn/ao-thun
http://shop.vn/ao-thun
```

Hậu quả nếu không xử lý:

- **Phân tán ranking signal** — backlink chia cho nhiều URL thay vì dồn về một.
- Google **tự chọn** URL canonical — có thể chọn sai URL bạn muốn.
- Lãng phí **crawl budget** vào các bản trùng lặp.

Cách khai báo canonical:

1. `<link rel="canonical" href="...">` trong `<head>` — phổ biến nhất.
2. HTTP header `Link: <url>; rel="canonical"` — cho file không phải HTML (PDF...).
3. **301 redirect** — khi URL cũ không cần tồn tại nữa (mạnh hơn canonical).

Các trường hợp cần dùng:

- URL có **query params** (tracking, sort, filter, pagination).
- **http vs https**, **www vs non-www** (nên kết hợp 301 redirect).
- Nội dung đăng lại trên nhiều nơi (cross-domain canonical về bài gốc).
- Trang sản phẩm thuộc nhiều category với URL khác nhau.

Lưu ý: canonical là **gợi ý (hint)**, không phải lệnh — Google có thể bỏ qua nếu thấy không hợp lý. Canonical phải là **absolute URL**, trỏ tới trang trả 200, và mỗi trang chỉ có **một** thẻ canonical (nhiều thẻ → Google bỏ qua tất cả).

### Code minh hoạ

```html
<!-- Trang /ao-thun?utm_source=facebook khai báo bản gốc -->
<link rel="canonical" href="https://shop.vn/ao-thun" />
```

```tsx
// Next.js App Router
export async function generateMetadata({ params }) {
  const product = await getProduct(params.slug);
  return {
    title: product.name,
    alternates: {
      canonical: `https://shop.vn/products/${product.slug}`,
    },
  };
}
```

### Đáp án mẫu

> "Canonical URL là khai báo cho search engine biết URL nào là bản chính thức khi nhiều URL có nội dung trùng nhau — ví dụ URL có UTM params, sort/filter, www vs non-www. Nếu không xử lý, ranking signal bị phân tán giữa các URL, Google tự chọn canonical có thể sai ý mình, và lãng phí crawl budget. Em khai báo bằng `<link rel="canonical">` trong head với absolute URL, mỗi trang đúng một thẻ, self-canonical cho cả trang gốc. Với www/non-www hay http/https em dùng 301 redirect vì mạnh hơn canonical. Một điểm cần nhớ là canonical chỉ là hint — Google có thể bỏ qua nếu hai trang khác nhau quá nhiều. Trong Next.js em set qua `alternates.canonical` trong `generateMetadata` cho dynamic routes."

---

## Câu 6: Alt text cho images: tại sao quan trọng và cách viết đúng? `[Basic]`

### Câu hỏi

> Alt text là gì? Tại sao quan trọng cho cả SEO lẫn accessibility? Cách viết alt text đúng?

### Giải thích lý thuyết

**Alt text** (`alt` attribute trên `<img>`) là văn bản thay thế mô tả nội dung hình ảnh, phục vụ 3 mục đích:

1. **Accessibility** — screen reader đọc alt text cho người khiếm thị (yêu cầu WCAG).
2. **SEO** — Google không "nhìn" ảnh như người; alt text giúp hiểu nội dung ảnh → rank trên **Google Images** (nguồn traffic đáng kể với e-commerce) và bổ sung ngữ cảnh cho trang.
3. **Fallback** — hiển thị khi ảnh lỗi không tải được.

Cách viết alt text đúng:

- **Mô tả cụ thể, ngắn gọn** (~125 ký tự): nói ảnh chứa gì, trong ngữ cảnh nào.
- Chứa keyword **một cách tự nhiên** nếu phù hợp — không nhồi nhét (keyword stuffing bị phạt).
- **Không** bắt đầu bằng "Hình ảnh của..." / "Image of..." — screen reader đã tự thông báo đây là ảnh.
- **Ảnh trang trí** (decorative — icon, background, divider): dùng `alt=""` (rỗng) để screen reader bỏ qua — **không được bỏ hẳn attribute** (bỏ hẳn thì screen reader đọc filename).
- Ảnh là **link/button**: alt mô tả **chức năng**, không phải hình ảnh (`alt="Về trang chủ"` thay vì `alt="logo"`).

### Code minh hoạ

```html
<!-- ❌ Tệ -->
<img src="img_1234.jpg" />                          <!-- thiếu alt -->
<img src="shoes.jpg" alt="giày giày nam giày chạy bộ giày thể thao" /> <!-- nhồi keyword -->
<img src="shoes.jpg" alt="Hình ảnh của một đôi giày" /> <!-- thừa "hình ảnh của" -->

<!-- ✅ Tốt -->
<img src="shoes.jpg" alt="Giày chạy bộ Nike Pegasus 41 màu xanh navy, góc nghiêng" />

<!-- ✅ Ảnh trang trí: alt rỗng để screen reader bỏ qua -->
<img src="divider.svg" alt="" />

<!-- ✅ Ảnh là link: mô tả chức năng -->
<a href="/">
  <img src="logo.svg" alt="SportShop - Về trang chủ" />
</a>
```

```tsx
// Next.js: next/image bắt buộc prop alt — thiếu là lỗi ngay lúc dev
import Image from "next/image";

<Image src="/shoes.jpg" alt="Giày chạy bộ Nike Pegasus 41 màu xanh navy" width={800} height={600} />;
```

### Đáp án mẫu

> "Alt text là văn bản thay thế cho ảnh, phục vụ ba mục đích: screen reader đọc cho người khiếm thị — yêu cầu accessibility theo WCAG; giúp Google hiểu nội dung ảnh để rank trên Google Images — nguồn traffic lớn với e-commerce; và là fallback khi ảnh lỗi. Cách viết đúng: mô tả cụ thể khoảng dưới 125 ký tự, keyword tự nhiên không nhồi nhét, không mở đầu bằng 'hình ảnh của' vì screen reader đã tự thông báo. Hai trường hợp đặc biệt em luôn lưu ý: ảnh trang trí thì dùng `alt=""` rỗng chứ không bỏ hẳn attribute, và ảnh đóng vai trò link thì alt mô tả chức năng thay vì hình ảnh. `next/image` bắt buộc prop alt nên trong dự án Next.js em không bao giờ sót."
