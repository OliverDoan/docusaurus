---
sidebar_position: 1
title: "Landing Page chuẩn SEO"
---

# Landing Page chuẩn SEO

## Landing page SEO-friendly vs Landing page chạy ads

Rất nhiều bạn nhầm lẫn giữa hai loại landing page này. Cùng mổ xẻ sự khác biệt:

**Landing page chạy ads (paid-only):**
- Không cần Google index, vì traffic đến từ quảng cáo
- Thường là single page, không có navigation
- Tập trung 100% vào conversion (mua hàng, đăng ký)
- Có thể dùng JavaScript rendering thoải mái

**Landing page chuẩn SEO:**
- Cần Google crawl và index được
- Có cấu trúc semantic HTML rõ ràng
- Nội dung phải có giá trị cho người đọc, không chỉ là quảng cáo
- Tốc độ tải trang ảnh hưởng trực tiếp đến ranking
- Cần internal linking và sitemap

| Tiêu chí | Landing page Ads | Landing page SEO |
|-----------|-----------------|-------------------|
| Traffic source | Google Ads, Facebook Ads | Organic search |
| Indexing | Thường `noindex` | Bắt buộc `index, follow` |
| Content depth | Ngắn gọn, tập trung CTA | Chi tiết, có giá trị thông tin |
| Page speed | Quan trọng (UX) | Cực kỳ quan trọng (ranking factor) |
| Structured data | Không cần thiết | Nên có (FAQ, Product, Review) |
| Internal links | Ít hoặc không có | Cần liên kết với các trang khác |
| URL structure | Không quan trọng | Clean URL, chứa keyword |
| Meta tags | Cơ bản | Tối ưu đầy đủ title, description, OG |

Điểm mấu chốt: landing page SEO vừa phải convert được visitor, vừa phải thân thiện với search engine. Đây là bài toán cân bằng mà nhiều developer hay bỏ qua.

## Above-the-fold content optimization

Above-the-fold là phần nội dung người dùng thấy ngay khi trang load xong, không cần scroll. Đây là vùng quan trọng nhất của landing page.

### Tại sao above-the-fold quan trọng cho SEO?

1. **First Contentful Paint (FCP):** Google đo thời gian render nội dung đầu tiên
2. **Largest Contentful Paint (LCP):** Thường là hero image hoặc heading lớn nhất
3. **Bounce rate:** Nếu above-the-fold không hấp dẫn, user rời đi ngay -> tăng bounce rate -> giảm ranking
4. **Dwell time:** Content tốt giữ user ở lại lâu hơn

### Nguyên tắc tối ưu above-the-fold

```
+--------------------------------------------------+
|  Logo    |    Navigation Menu    |   CTA Button   |  <- Header
+--------------------------------------------------+
|                                                    |
|     H1: Primary Keyword Heading                    |  <- Hero Section
|     Subtitle: Supporting text                      |
|     [Primary CTA Button]                           |
|                                                    |
|     Hero Image / Illustration                      |
|                                                    |
+--------------------------------------------------+
|  Social proof: "10,000+ developers trust us"       |  <- Trust bar
+--------------------------------------------------+
```

Những thứ PHẢI có trong above-the-fold:
- **H1 tag** chứa primary keyword
- **Subtitle** mô tả giá trị cốt lõi (1-2 câu)
- **Primary CTA** rõ ràng, nổi bật
- **Hero image** đã được optimize (WebP, lazy load nếu dưới fold)
- **Social proof** ngắn gọn (số liệu, logo khách hàng)

## Hero section: H1 và primary keyword

H1 là element quan trọng nhất trên landing page từ góc nhìn SEO. Google dùng H1 để hiểu trang nói về cái gì.

### Quy tắc viết H1 cho landing page

```html
<!-- SAI: H1 quá generic -->
<h1>Welcome to our website</h1>

<!-- SAI: Nhồi keyword -->
<h1>SEO Landing Page - Best SEO Landing Page Builder - Create SEO Landing Page</h1>

<!-- ĐÚNG: Chứa primary keyword, tự nhiên, hấp dẫn -->
<h1>Xây dựng Landing Page chuẩn SEO trong 30 phút</h1>

<!-- ĐÚNG: Keyword ở đầu, có value proposition -->
<h1>Landing Page Builder: Tạo trang đích chuyển đổi cao, tối ưu SEO</h1>
```

Quy tắc:
- Chỉ có **1 H1 duy nhất** trên mỗi trang
- Đặt primary keyword **gần đầu** H1 càng tốt
- Độ dài lý tưởng: **20-70 ký tự**
- Phải mô tả chính xác nội dung trang
- Không trùng với title tag (nhưng có thể liên quan)

## CTA placement và SEO considerations

CTA (Call-to-Action) không trực tiếp ảnh hưởng SEO ranking, nhưng ảnh hưởng gián tiếp qua user behavior signals.

### Vị trí CTA tối ưu

```html
<!-- Hero section: Primary CTA -->
<section class="hero">
  <h1>Tạo Landing Page chuẩn SEO</h1>
  <p>Công cụ kéo thả, không cần code, tối ưu tốc độ tự động</p>
  <a href="/signup" class="cta-primary">Bắt đầu miễn phí</a>
  <span class="cta-note">Không cần thẻ tín dụng</span>
</section>

<!-- Sau features section: Secondary CTA -->
<section class="features">
  <!-- ...features content... -->
  <a href="/demo" class="cta-secondary">Xem demo</a>
</section>

<!-- Sau testimonials: Reinforcement CTA -->
<section class="testimonials">
  <!-- ...testimonials content... -->
  <a href="/signup" class="cta-primary">Tham gia cùng 10,000+ developers</a>
</section>

<!-- Footer: Final CTA -->
<footer>
  <div class="footer-cta">
    <h2>Sẵn sàng bắt đầu?</h2>
    <a href="/signup" class="cta-primary">Đăng ký ngay</a>
  </div>
</footer>
```

### SEO considerations cho CTA

| Yếu tố | Nên | Không nên |
|---------|-----|-----------|
| Anchor text | Mô tả hành động rõ ràng | "Click here", "Xem thêm" |
| Thuộc tính href | URL thật, crawlable | `javascript:void(0)` |
| Render | Server-side | Client-only JavaScript |
| Accessibility | Có `aria-label` nếu cần | Button không có text |

```html
<!-- SAI: Google không crawl được -->
<button onclick="openSignup()">Đăng ký</button>

<!-- ĐÚNG: Link thật, crawlable -->
<a href="/signup" class="btn-primary">Đăng ký miễn phí</a>

<!-- ĐÚNG: Button với form action -->
<form action="/signup" method="GET">
  <button type="submit" class="btn-primary">Đăng ký miễn phí</button>
</form>
```

## Page structure chuẩn cho landing page

Một landing page chuẩn SEO cần có cấu trúc rõ ràng, giúp cả user và search engine hiểu nội dung.

### Cấu trúc recommended

1. **Header** - Logo, navigation, CTA nhỏ
2. **Hero Section** - H1, subtitle, primary CTA, hero image
3. **Social Proof Bar** - Số liệu, logo khách hàng
4. **Features/Benefits** - 3-6 feature chính với H2/H3
5. **How It Works** - Quy trình 3-5 bước
6. **Testimonials** - Review từ khách hàng thật
7. **Pricing** (nếu có) - Bảng giá rõ ràng
8. **FAQ** - Câu hỏi thường gặp (cực tốt cho SEO)
9. **Final CTA** - Kêu gọi hành động cuối cùng
10. **Footer** - Links, contact, legal

### Heading hierarchy

```
H1: Landing Page chuẩn SEO - Tạo trang đích chuyển đổi cao
  H2: Tại sao chọn chúng tôi?
    H3: Tốc độ tải nhanh
    H3: Tối ưu SEO tự động
    H3: Giao diện kéo thả
  H2: Cách hoạt động
    H3: Bước 1: Chọn template
    H3: Bước 2: Tùy chỉnh nội dung
    H3: Bước 3: Publish
  H2: Khách hàng nói gì?
  H2: Câu hỏi thường gặp
    (FAQ items dùng dt/dd hoặc details/summary)
```

Không bao giờ bỏ qua level heading. Ví dụ: **không** nhảy từ H1 sang H3 mà bỏ qua H2.

## Semantic HTML cho landing page

Semantic HTML giúp search engine hiểu cấu trúc và ý nghĩa nội dung trang. Đây là nền tảng của on-page SEO.

### Full semantic HTML landing page skeleton

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tạo Landing Page chuẩn SEO | TenSanPham</title>
  <meta name="description" content="Công cụ tạo landing page chuẩn SEO, tốc độ tải nhanh, tối ưu chuyển đổi. Bắt đầu miễn phí, không cần code.">
  <link rel="canonical" href="https://example.com/landing-page-seo">

  <!-- Open Graph -->
  <meta property="og:title" content="Tạo Landing Page chuẩn SEO">
  <meta property="og:description" content="Công cụ tạo landing page chuẩn SEO, tốc độ tải nhanh.">
  <meta property="og:image" content="https://example.com/og-image.jpg">
  <meta property="og:url" content="https://example.com/landing-page-seo">
  <meta property="og:type" content="website">

  <!-- Structured Data: FAQ -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Landing page chuẩn SEO là gì?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Landing page chuẩn SEO là trang đích được tối ưu cả về nội dung, cấu trúc HTML, tốc độ tải và trải nghiệm người dùng để xếp hạng tốt trên Google."
        }
      },
      {
        "@type": "Question",
        "name": "Làm sao để tối ưu tốc độ landing page?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sử dụng hình ảnh WebP, lazy loading, critical CSS inline, và giảm thiểu JavaScript không cần thiết."
        }
      }
    ]
  }
  </script>
</head>
<body>
  <!-- Header -->
  <header role="banner">
    <nav aria-label="Main navigation">
      <a href="/" class="logo" aria-label="TenSanPham - Trang chủ">
        <img src="/logo.svg" alt="TenSanPham" width="120" height="40">
      </a>
      <ul>
        <li><a href="#features">Tính năng</a></li>
        <li><a href="#pricing">Bảng giá</a></li>
        <li><a href="#faq">FAQ</a></li>
      </ul>
      <a href="/signup" class="cta-header">Dùng thử miễn phí</a>
    </nav>
  </header>

  <main>
    <!-- Hero Section -->
    <section class="hero" aria-labelledby="hero-heading">
      <h1 id="hero-heading">Tạo Landing Page chuẩn SEO trong 30 phút</h1>
      <p class="hero-subtitle">
        Công cụ kéo thả dễ dùng. Tối ưu tốc độ và SEO tự động.
        Không cần kiến thức lập trình.
      </p>
      <a href="/signup" class="cta-primary">Bắt đầu miễn phí</a>
      <p class="cta-note">Không cần thẻ tín dụng. Hủy bất cứ lúc nào.</p>
    </section>

    <!-- Social Proof -->
    <section class="social-proof" aria-label="Social proof">
      <p><strong>10,000+</strong> developers đã tin dùng</p>
      <div class="client-logos">
        <img src="/clients/company-a.svg" alt="Company A" width="100" height="32">
        <img src="/clients/company-b.svg" alt="Company B" width="100" height="32">
        <img src="/clients/company-c.svg" alt="Company C" width="100" height="32">
      </div>
    </section>

    <!-- Features -->
    <section id="features" aria-labelledby="features-heading">
      <h2 id="features-heading">Tại sao chọn chúng tôi?</h2>
      <div class="features-grid">
        <article>
          <h3>Tốc độ tải nhanh</h3>
          <p>Trang load dưới 1 giây với static generation và CDN toàn cầu.</p>
        </article>
        <article>
          <h3>SEO tự động</h3>
          <p>Meta tags, structured data, sitemap được tạo tự động.</p>
        </article>
        <article>
          <h3>Responsive hoàn hảo</h3>
          <p>Hiển thị đẹp trên mọi thiết bị, từ mobile đến desktop.</p>
        </article>
      </div>
    </section>

    <!-- How It Works -->
    <section aria-labelledby="how-it-works-heading">
      <h2 id="how-it-works-heading">Cách hoạt động</h2>
      <ol class="steps">
        <li>
          <h3>Chọn template</h3>
          <p>Hơn 50 template landing page chuẩn SEO.</p>
        </li>
        <li>
          <h3>Tùy chỉnh nội dung</h3>
          <p>Kéo thả, chỉnh sửa text, thêm hình ảnh.</p>
        </li>
        <li>
          <h3>Publish và theo dõi</h3>
          <p>Một click publish. Dashboard analytics real-time.</p>
        </li>
      </ol>
    </section>

    <!-- Testimonials -->
    <section aria-labelledby="testimonials-heading">
      <h2 id="testimonials-heading">Khách hàng nói gì?</h2>
      <div class="testimonials">
        <blockquote>
          <p>Trang landing page load cực nhanh, ranking lên top 3 sau 2 tháng.</p>
          <footer>
            <cite>Nguyễn Văn A</cite>, CTO tại StartupXYZ
          </footer>
        </blockquote>
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" aria-labelledby="faq-heading">
      <h2 id="faq-heading">Câu hỏi thường gặp</h2>
      <details>
        <summary>Landing page chuẩn SEO là gì?</summary>
        <p>Landing page chuẩn SEO là trang đích được tối ưu để xếp hạng
           tốt trên kết quả tìm kiếm Google, bao gồm tối ưu nội dung,
           cấu trúc HTML, tốc độ tải và trải nghiệm người dùng.</p>
      </details>
      <details>
        <summary>Có cần biết code không?</summary>
        <p>Không. Công cụ kéo thả giúp bạn tạo landing page mà
           không cần viết một dòng code nào.</p>
      </details>
    </section>

    <!-- Final CTA -->
    <section class="final-cta" aria-labelledby="final-cta-heading">
      <h2 id="final-cta-heading">Sẵn sàng tạo landing page chuẩn SEO?</h2>
      <p>Tham gia cùng 10,000+ developers. Bắt đầu miễn phí ngay hôm nay.</p>
      <a href="/signup" class="cta-primary">Đăng ký miễn phí</a>
    </section>
  </main>

  <!-- Footer -->
  <footer role="contentinfo">
    <nav aria-label="Footer navigation">
      <div class="footer-links">
        <div>
          <h4>Sản phẩm</h4>
          <ul>
            <li><a href="/features">Tính năng</a></li>
            <li><a href="/pricing">Bảng giá</a></li>
            <li><a href="/templates">Templates</a></li>
          </ul>
        </div>
        <div>
          <h4>Hỗ trợ</h4>
          <ul>
            <li><a href="/docs">Tài liệu</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/contact">Liên hệ</a></li>
          </ul>
        </div>
      </div>
    </nav>
    <p>&copy; 2024 TenSanPham. All rights reserved.</p>
  </footer>
</body>
</html>
```

### Giải thích các element semantic quan trọng

| Element | Mục đích SEO |
|---------|-------------|
| `<header>` | Xác định vùng header, chứa navigation |
| `<nav>` | Giúp Google hiểu cấu trúc liên kết nội bộ |
| `<main>` | Nội dung chính, Google ưu tiên crawl |
| `<section>` | Phân chia nội dung theo chủ đề |
| `<article>` | Nội dung độc lập, có thể tái sử dụng |
| `<aside>` | Nội dung phụ, sidebar |
| `<footer>` | Footer, chứa links quan trọng |
| `<blockquote>` | Trích dẫn, testimonials |
| `<details>` / `<summary>` | FAQ accordion, Google có thể hiển thị rich result |
| `<figure>` / `<figcaption>` | Hình ảnh với caption mô tả |

## Lỗi thường gặp

### 1. Sử dụng `<div>` cho mọi thứ

```html
<!-- SAI: Div soup - Google không hiểu cấu trúc -->
<div class="header">
  <div class="nav">
    <div class="link">Trang chủ</div>
  </div>
</div>
<div class="content">
  <div class="title">Landing Page SEO</div>
</div>

<!-- ĐÚNG: Semantic HTML -->
<header>
  <nav>
    <a href="/">Trang chủ</a>
  </nav>
</header>
<main>
  <h1>Landing Page SEO</h1>
</main>
```

### 2. Nhiều H1 trên một trang

Mỗi trang chỉ nên có **đúng 1 H1**. Nếu bạn có nhiều section quan trọng, dùng H2.

### 3. Hero image không optimize

Hero image thường là element lớn nhất above-the-fold. Nếu không optimize, LCP sẽ rất cao.

```html
<!-- SAI: Ảnh PNG 2MB, không responsive -->
<img src="hero.png">

<!-- ĐÚNG: WebP, responsive, preload -->
<link rel="preload" as="image" href="hero.webp" type="image/webp">
<img
  src="hero.webp"
  alt="Minh họa landing page chuẩn SEO"
  width="1200"
  height="600"
  loading="eager"
  fetchpriority="high"
>
```

### 4. CTA dùng JavaScript thay vì link thật

Google không thể theo dõi `onclick` handlers. Luôn dùng `<a href>` cho CTA chính.

### 5. Bỏ qua FAQ section

FAQ section là cơ hội tuyệt vời để:
- Target long-tail keywords
- Có rich results trên Google (FAQ rich snippet)
- Giảm bounce rate vì user tìm được câu trả lời

## Câu hỏi phỏng vấn

### Câu 1: Sự khác biệt giữa landing page chạy ads và landing page SEO là gì?

**Trả lời:** Landing page chạy ads tập trung 100% vào conversion, traffic đến từ quảng cáo nên không cần Google index (thường set `noindex`). Landing page SEO cần Google crawl và index được, yêu cầu semantic HTML, content có giá trị, tốc độ tải nhanh, structured data, và internal linking. Landing page SEO phải cân bằng giữa conversion optimization và search engine optimization.

### Câu 2: Tại sao chỉ nên có 1 H1 trên mỗi trang?

**Trả lời:** H1 cho search engine biết chủ đề chính của trang. Nhiều H1 gây nhầm lẫn cho Google về nội dung chính. Mặc dù HTML5 spec cho phép nhiều H1, nhưng từ góc nhìn SEO, best practice vẫn là 1 H1 duy nhất chứa primary keyword. Các section khác dùng H2, H3 theo hierarchy.

### Câu 3: Above-the-fold content ảnh hưởng SEO như thế nào?

**Trả lời:** Above-the-fold ảnh hưởng qua nhiều tín hiệu: LCP (Largest Contentful Paint) thường đo element lớn nhất above-the-fold, FCP (First Contentful Paint) đo thời gian render nội dung đầu tiên. Nếu above-the-fold content không hấp dẫn hoặc load chậm, bounce rate tăng, dwell time giảm, gián tiếp ảnh hưởng ranking.

### Câu 4: Semantic HTML có thực sự ảnh hưởng SEO ranking không?

**Trả lời:** Không trực tiếp là ranking factor, nhưng ảnh hưởng mạnh gián tiếp. Semantic HTML giúp Google hiểu cấu trúc trang tốt hơn, tăng khả năng hiển thị rich results (FAQ, breadcrumb), cải thiện accessibility (ảnh hưởng user experience signals). Google đã confirm rằng họ sử dụng HTML5 semantic elements để hiểu content structure.

### Câu 5: Làm sao tối ưu CTA cho cả SEO và conversion?

**Trả lời:** Dùng `<a href>` thay vì `<button onclick>` để Google crawl được. Anchor text phải mô tả hành động cụ thể thay vì generic text. Đặt CTA ở nhiều vị trí: hero section, sau features, sau testimonials, và trước footer. Đảm bảo CTA render server-side, không phụ thuộc JavaScript. Thêm `aria-label` cho accessibility nếu text ngắn gọn.
