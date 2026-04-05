---
sidebar_position: 4
title: "HTML SEO cơ bản"
---

# HTML SEO cơ bản

Mỗi dòng HTML bạn viết đều ảnh hưởng đến cách Google "hiểu" trang web. Một `<div>` với text bold không giống một `<h1>` -- dù nhìn giống nhau trên browser. Google đọc **HTML structure**, không phải visual style. Bài này hướng dẫn bạn viết HTML mà cả browser lẫn Google đều "hiểu" đúng ý bạn.

---

## 1. Title Tag -- Tag quan trọng nhất cho SEO

### 1.1. Title tag là gì?

Title tag (`<title>`) là text hiển thị trên **tab browser** và là **dòng tiêu đề màu xanh** trên kết quả Google:

```html
<head>
  <title>Hướng dẫn Docker cho người mới bắt đầu | DevBlog</title>
</head>
```

Trên Google SERP, title tag hiển thị như sau:

```
Hướng dẫn Docker cho người mới bắt đầu | DevBlog    ← Title tag
https://devblog.com/huong-dan-docker                  ← URL
Học Docker từ zero: cài đặt, Dockerfile,              ← Meta description
docker-compose, và deploy container...
```

### 1.2. Best practices cho title tag

| Quy tắc | Giải thích | Ví dụ |
|---------|-----------|-------|
| **Độ dài 50-60 ký tự** | Google cắt title dài hơn 60 ký tự | "Hướng dẫn Docker cho người mới bắt đầu" (40 ký tự) |
| **Keyword ở đầu** | Google weight keyword đầu title cao hơn | "Docker tutorial: Hướng dẫn từ A-Z" |
| **Mỗi trang title khác nhau** | Duplicate title = Google confused | Không dùng "Trang chủ" cho mọi trang |
| **Có brand name** | Tăng nhận diện | "... \| DevBlog" ở cuối |
| **Hấp dẫn click** | Title hay = CTR cao = rank tốt hơn | Thêm năm, số, power words |

### 1.3. Good vs Bad title tags

```html
<!-- BAD: Quá ngắn, không có keyword -->
<title>Trang chủ</title>

<!-- BAD: Quá dài, bị cắt trên Google -->
<title>Hướng dẫn chi tiết cách cài đặt và sử dụng Docker từ cơ bản đến nâng cao cho người mới bắt đầu học lập trình năm 2026</title>

<!-- BAD: Nhồi keyword -->
<title>Docker Docker tutorial Docker hướng dẫn Docker cài Docker</title>

<!-- BAD: Duplicate (nhiều trang cùng title) -->
<title>DevBlog</title>

<!-- GOOD: Có keyword, đúng độ dài, có brand -->
<title>Hướng dẫn Docker cho người mới bắt đầu | DevBlog</title>

<!-- GOOD: Có số, năm, power word -->
<title>10 lỗi Docker phổ biến nhất (2026) | DevBlog</title>

<!-- GOOD: Dạng how-to -->
<title>Cách deploy Next.js lên Vercel trong 5 phút | DevBlog</title>
```

---

## 2. Meta Description -- Quảng cáo miễn phí trên Google

### 2.1. Meta description là gì?

Meta description là đoạn text hiển thị **bên dưới title** trên Google SERP. Nó **không ảnh hưởng trực tiếp đến ranking**, nhưng ảnh hưởng mạnh đến **CTR** (Click-Through Rate) -- mà CTR lại ảnh hưởng đến ranking.

```html
<head>
  <meta name="description" content="Học Docker từ zero: cài đặt Docker Desktop, viết Dockerfile, sử dụng docker-compose, và deploy container lên production. Có ví dụ code step-by-step.">
</head>
```

### 2.2. Best practices cho meta description

| Quy tắc | Giải thích |
|---------|-----------|
| **Độ dài 150-160 ký tự** | Google cắt description dài hơn ~160 ký tự |
| **Chứa keyword chính** | Google bold keyword matching query của user |
| **Có call-to-action** | "Đọc ngay", "Xem hướng dẫn", "Bắt đầu học" |
| **Mô tả chính xác nội dung** | Không clickbait -- user bounce = rank giảm |
| **Mỗi trang description khác nhau** | Duplicate description = Google tự generate (thường xấu) |
| **Viết cho con người** | Đây là "quảng cáo" miễn phí, phải hấp dẫn |

### 2.3. Good vs Bad meta descriptions

```html
<!-- BAD: Không có meta description → Google tự cắt đoạn text ngẫu nhiên -->
<!-- (thiếu hoàn toàn) -->

<!-- BAD: Quá ngắn, không có thông tin -->
<meta name="description" content="Hướng dẫn Docker.">

<!-- BAD: Nhồi keyword -->
<meta name="description" content="Docker tutorial Docker hướng dẫn Docker cài Docker sử dụng Docker học Docker miễn phí Docker.">

<!-- GOOD: Đủ dài, có keyword, có CTA, mô tả rõ ràng -->
<meta name="description" content="Học Docker từ zero: cài đặt Docker Desktop, viết Dockerfile đầu tiên, sử dụng docker-compose cho multi-container. Có ví dụ code thực tế step-by-step.">

<!-- GOOD: Có số, có value proposition -->
<meta name="description" content="10 lỗi Docker phổ biến nhất mà developer hay mắc phải và cách khắc phục chi tiết. Tiết kiệm hàng giờ debug với checklist này.">
```

---

## 3. Heading Hierarchy -- Cấu trúc nội dung

### 3.1. H1 đến H6 nghĩa là gì?

Heading tags tạo **cấu trúc phân cấp** cho nội dung, giống mục lục sách:

```
<h1> Tiêu đề chính (chỉ 1 cái per page)
  <h2> Mục lớn 1
    <h3> Mục con 1.1
    <h3> Mục con 1.2
  <h2> Mục lớn 2
    <h3> Mục con 2.1
      <h4> Chi tiết 2.1.1
  <h2> Mục lớn 3
```

### 3.2. Quy tắc heading cho SEO

| Quy tắc | Giải thích |
|---------|-----------|
| **Chỉ 1 `<h1>` per page** | H1 = tiêu đề chính, chứa keyword chính |
| **Không skip level** | Không nhảy từ H1 → H3 (bỏ qua H2) |
| **Dùng cho structure, không cho style** | Đừng dùng H3 vì muốn font nhỏ hơn H2 |
| **Keyword trong H1 và H2** | Google weight heading tags cao hơn paragraph |
| **Heading phải mô tả nội dung bên dưới** | Đừng dùng heading vô nghĩa |

### 3.3. Good vs Bad heading structure

```html
<!-- BAD: Nhiều H1, skip levels, heading dùng cho style -->
<h1>DevBlog</h1>
<h1>Hướng dẫn Docker</h1>        <!-- BAD: 2 H1 -->
<h3>Cài đặt</h3>                  <!-- BAD: skip H2 -->
<h2>Kết luận</h2>
<h4>Made with love</h4>           <!-- BAD: heading dùng cho style -->

<!-- GOOD: 1 H1, hierarchy đúng, mô tả rõ nội dung -->
<h1>Hướng dẫn Docker cho người mới bắt đầu</h1>

<h2>1. Docker là gì?</h2>
<p>Docker là platform containerization...</p>

<h2>2. Cài đặt Docker</h2>
<h3>2.1. Cài đặt trên macOS</h3>
<p>Download Docker Desktop từ...</p>
<h3>2.2. Cài đặt trên Windows</h3>
<p>Bật WSL2 trước khi...</p>
<h3>2.3. Cài đặt trên Linux</h3>
<p>Dùng apt-get install...</p>

<h2>3. Dockerfile đầu tiên</h2>
<p>Tạo file Dockerfile trong root project...</p>

<h2>4. Docker Compose</h2>
<h3>4.1. docker-compose.yml là gì?</h3>
<p>File cấu hình cho multi-container...</p>
<h3>4.2. Ví dụ thực tế</h3>
<p>Setup Node.js + MongoDB + Redis...</p>
```

### 3.4. Kiểm tra heading structure

```bash
# Kiểm tra heading hierarchy bằng command line
curl -s https://example.com | grep -oP '<h[1-6][^>]*>.*?</h[1-6]>'

# Hoặc dùng Chrome DevTools:
# 1. F12 → Console
# 2. Paste đoạn code này:

# document.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h => {
#   console.log(h.tagName, '-', h.textContent.trim())
# })
```

---

## 4. Semantic HTML5 -- Code có ý nghĩa

### 4.1. Tại sao cần Semantic HTML?

HTML5 cung cấp các tags có **ý nghĩa ngữ nghĩa** -- giúp Google (và screen readers) hiểu **vai trò** của từng phần nội dung:

| Tag | Ý nghĩa | Thay thế cho |
|-----|---------|-------------|
| `<header>` | Phần đầu trang/section | `<div class="header">` |
| `<nav>` | Navigation links | `<div class="nav">` |
| `<main>` | Nội dung chính (chỉ 1 per page) | `<div class="content">` |
| `<article>` | Nội dung độc lập (blog post, news) | `<div class="article">` |
| `<section>` | Nhóm nội dung liên quan | `<div class="section">` |
| `<aside>` | Nội dung phụ (sidebar, related) | `<div class="sidebar">` |
| `<footer>` | Phần cuối trang/section | `<div class="footer">` |
| `<figure>` | Hình ảnh, biểu đồ với caption | `<div class="image-wrapper">` |
| `<figcaption>` | Caption cho figure | `<span class="caption">` |
| `<time>` | Thời gian | `<span class="date">` |
| `<mark>` | Text được highlight | `<span class="highlight">` |
| `<address>` | Thông tin liên hệ | `<div class="contact">` |

### 4.2. Cấu trúc semantic hoàn chỉnh

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hướng dẫn Docker cho người mới | DevBlog</title>
  <meta name="description" content="Học Docker từ zero với ví dụ code thực tế.">
</head>
<body>

  <!-- HEADER: Phần đầu trang -->
  <header>
    <a href="/" aria-label="Trang chủ DevBlog">DevBlog</a>

    <!-- NAV: Navigation chính -->
    <nav aria-label="Main navigation">
      <ul>
        <li><a href="/blog">Blog</a></li>
        <li><a href="/tutorials">Tutorials</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </nav>
  </header>

  <!-- MAIN: Nội dung chính (chỉ 1 per page) -->
  <main>

    <!-- ARTICLE: Nội dung độc lập -->
    <article>
      <header>
        <h1>Hướng dẫn Docker cho người mới bắt đầu</h1>
        <p>Tác giả: <address><a href="/author/thuan">Thuan Doan</a></address></p>
        <time datetime="2026-04-01">1 tháng 4, 2026</time>
      </header>

      <section>
        <h2>1. Docker là gì?</h2>
        <p>Docker là platform cho phép bạn đóng gói ứng dụng...</p>

        <!-- FIGURE: Hình ảnh có caption -->
        <figure>
          <img
            src="/images/docker-architecture.webp"
            alt="Sơ đồ kiến trúc Docker: Client, Daemon, Registry, Images, Containers"
            width="800"
            height="450"
            loading="lazy"
          >
          <figcaption>Hình 1: Kiến trúc tổng quan của Docker</figcaption>
        </figure>
      </section>

      <section>
        <h2>2. Cài đặt Docker</h2>
        <h3>2.1. macOS</h3>
        <p>Download Docker Desktop từ docker.com...</p>
        <h3>2.2. Windows</h3>
        <p>Bật WSL2 trước khi cài...</p>
      </section>

      <section>
        <h2>3. Kết luận</h2>
        <p>Docker là công cụ không thể thiếu...</p>
      </section>
    </article>

    <!-- ASIDE: Nội dung liên quan -->
    <aside>
      <h2>Bài viết liên quan</h2>
      <ul>
        <li><a href="/kubernetes-co-ban">Kubernetes cho người mới</a></li>
        <li><a href="/docker-compose">Docker Compose từ A-Z</a></li>
        <li><a href="/ci-cd-pipeline">CI/CD Pipeline với GitHub Actions</a></li>
      </ul>
    </aside>
  </main>

  <!-- FOOTER: Phần cuối trang -->
  <footer>
    <nav aria-label="Footer navigation">
      <a href="/privacy">Privacy Policy</a>
      <a href="/terms">Terms of Service</a>
    </nav>
    <p>&copy; 2026 DevBlog. All rights reserved.</p>
  </footer>

</body>
</html>
```

### 4.3. Non-semantic vs Semantic -- So sánh

```html
<!-- NON-SEMANTIC: Google không hiểu cấu trúc -->
<div class="header">
  <div class="nav">
    <div class="nav-item"><a href="/blog">Blog</a></div>
  </div>
</div>
<div class="content">
  <div class="post">
    <div class="title"><b>Hướng dẫn Docker</b></div>
    <div class="body">Docker là...</div>
  </div>
</div>
<div class="sidebar">
  <div>Bài viết liên quan</div>
</div>
<div class="footer">
  <div>Copyright 2026</div>
</div>

<!-- SEMANTIC: Google hiểu rõ từng phần -->
<header>
  <nav aria-label="Main navigation">
    <a href="/blog">Blog</a>
  </nav>
</header>
<main>
  <article>
    <h1>Hướng dẫn Docker</h1>
    <p>Docker là...</p>
  </article>
</main>
<aside>
  <h2>Bài viết liên quan</h2>
</aside>
<footer>
  <p>&copy; 2026</p>
</footer>
```

Google ưu tiên nội dung trong `<main>` và `<article>` khi phân tích trang. Content trong `<nav>`, `<footer>`, `<aside>` được coi là **boilerplate** (nội dung lặp lại trên mọi trang).

---

## 5. Image SEO -- Alt text và tối ưu hình ảnh

### 5.1. Alt text là gì?

Alt text (alternative text) là **mô tả bằng text** cho hình ảnh. Nó phục vụ 3 mục đích:
1. **SEO**: Google đọc alt text để hiểu nội dung ảnh
2. **Accessibility**: Screen reader đọc alt text cho người khiếm thị
3. **Fallback**: Hiển thị khi ảnh không load được

### 5.2. Best practices cho Image SEO

```html
<!-- BAD: Không có alt text -->
<img src="image1.jpg">

<!-- BAD: Alt text vô nghĩa -->
<img src="docker.png" alt="image">
<img src="docker.png" alt="photo">
<img src="docker.png" alt="docker.png">

<!-- BAD: Nhồi keyword -->
<img src="docker.png" alt="docker tutorial docker hướng dẫn docker cài docker free docker">

<!-- GOOD: Mô tả chính xác nội dung ảnh -->
<img src="docker-architecture.webp" alt="Sơ đồ kiến trúc Docker gồm Client, Daemon, và Registry">

<!-- GOOD: Với đầy đủ attributes -->
<img
  src="docker-architecture.webp"
  alt="Sơ đồ kiến trúc Docker gồm Client, Daemon, và Registry"
  width="800"
  height="450"
  loading="lazy"
  decoding="async"
>

<!-- GOOD: Decorative image (không cần alt) -->
<img src="divider-line.svg" alt="" role="presentation">
```

### 5.3. Image optimization cho tốc độ tải trang

```html
<!-- 1. Dùng format hiện đại: WebP hoặc AVIF -->
<picture>
  <source srcset="docker.avif" type="image/avif">
  <source srcset="docker.webp" type="image/webp">
  <img src="docker.jpg" alt="Docker logo" width="400" height="300">
</picture>

<!-- 2. Responsive images -->
<img
  src="docker-800.webp"
  srcset="
    docker-400.webp 400w,
    docker-800.webp 800w,
    docker-1200.webp 1200w
  "
  sizes="(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px"
  alt="Docker containers running on server"
  loading="lazy"
  width="800"
  height="450"
>

<!-- 3. Lazy loading: Chỉ load ảnh khi scroll đến -->
<img src="below-fold.webp" loading="lazy" alt="...">

<!-- 4. Ảnh above-the-fold: KHÔNG lazy load -->
<img src="hero-banner.webp" alt="..." fetchpriority="high">
```

### 5.4. File naming cho SEO

```
BAD:
  IMG_20260401_001.jpg
  screenshot.png
  image1.jpg

GOOD:
  docker-architecture-diagram.webp
  nextjs-folder-structure.webp
  react-hooks-lifecycle.webp
```

Google đọc filename như một signal phụ. Dùng dấu gạch ngang (`-`) ngăn cách từ, không dùng underscore (`_`).

---

## 6. Các meta tags khác cho SEO

### 6.1. Meta robots

```html
<!-- Mặc định: index và follow links -->
<meta name="robots" content="index, follow">

<!-- Không index trang này (ví dụ: trang thank you, trang admin) -->
<meta name="robots" content="noindex, nofollow">

<!-- Index trang nhưng không follow links trên trang -->
<meta name="robots" content="index, nofollow">

<!-- Không hiển thị snippet trên SERP -->
<meta name="robots" content="nosnippet">

<!-- Không cache trang -->
<meta name="robots" content="noarchive">
```

### 6.2. Canonical tag

```html
<!-- Khai báo URL chính thức của trang -->
<link rel="canonical" href="https://example.com/bai-viet">
```

### 6.3. Hreflang (đa ngôn ngữ)

```html
<!-- Trang tiếng Việt -->
<link rel="alternate" hreflang="vi" href="https://example.com/vi/bai-viet">
<!-- Trang tiếng Anh -->
<link rel="alternate" hreflang="en" href="https://example.com/en/article">
<!-- Default -->
<link rel="alternate" hreflang="x-default" href="https://example.com/en/article">
```

### 6.4. Open Graph (Social sharing)

```html
<meta property="og:title" content="Hướng dẫn Docker cho người mới">
<meta property="og:description" content="Học Docker từ zero với code thực tế">
<meta property="og:image" content="https://example.com/docker-og.jpg">
<meta property="og:url" content="https://example.com/docker-tutorial">
<meta property="og:type" content="article">
<meta property="og:site_name" content="DevBlog">
<meta property="og:locale" content="vi_VN">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Hướng dẫn Docker cho người mới">
<meta name="twitter:description" content="Học Docker từ zero">
<meta name="twitter:image" content="https://example.com/docker-twitter.jpg">
```

### 6.5. Viewport (Mobile-friendly, bắt buộc)

```html
<!-- BẮT BUỘC cho mobile-first indexing -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

---

## 7. Template HTML hoàn chỉnh cho SEO

Dưới đây là template bạn có thể dùng cho mọi trang web:

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <!-- Basic Meta -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- SEO Meta -->
  <title>[Keyword] - [Mô tả ngắn] | [Brand]</title>
  <meta name="description" content="[150-160 ký tự, chứa keyword, có CTA]">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="[URL chính thức]">

  <!-- Multi-language (nếu cần) -->
  <link rel="alternate" hreflang="vi" href="[URL tiếng Việt]">
  <link rel="alternate" hreflang="en" href="[URL tiếng Anh]">

  <!-- Open Graph -->
  <meta property="og:title" content="[Title cho social]">
  <meta property="og:description" content="[Description cho social]">
  <meta property="og:image" content="[URL ảnh 1200x630]">
  <meta property="og:url" content="[URL trang]">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="vi_VN">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="[Title]">
  <meta name="twitter:description" content="[Description]">
  <meta name="twitter:image" content="[URL ảnh]">

  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "[Tiêu đề bài viết]",
    "description": "[Mô tả]",
    "author": {
      "@type": "Person",
      "name": "[Tên tác giả]"
    },
    "datePublished": "[YYYY-MM-DD]",
    "dateModified": "[YYYY-MM-DD]",
    "publisher": {
      "@type": "Organization",
      "name": "[Tên website]",
      "logo": {
        "@type": "ImageObject",
        "url": "[URL logo]"
      }
    },
    "image": "[URL ảnh chính]"
  }
  </script>

  <!-- Performance -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="dns-prefetch" href="https://analytics.google.com">
</head>
<body>
  <header>
    <nav aria-label="Main navigation">
      <!-- Navigation links -->
    </nav>
  </header>

  <main>
    <article>
      <h1>[Keyword trong H1]</h1>
      <!-- Content với heading hierarchy đúng -->
    </article>

    <aside>
      <!-- Related content -->
    </aside>
  </main>

  <footer>
    <!-- Footer links, copyright -->
  </footer>
</body>
</html>
```

---

## 8. Lỗi thường gặp

### Lỗi 1: Nhiều H1 trên cùng trang

```html
<!-- SAI -->
<h1>DevBlog</h1>
<h1>Hướng dẫn Docker</h1>
<h1>Kết luận</h1>

<!-- ĐÚNG -->
<h1>Hướng dẫn Docker cho người mới</h1>
<h2>1. Docker là gì?</h2>
<h2>2. Cài đặt</h2>
<h2>3. Kết luận</h2>
```

### Lỗi 2: Dùng heading để style text

```html
<!-- SAI: Dùng H3 vì muốn font nhỏ hơn H2 -->
<h3>Lưu ý nhỏ: nhớ restart Docker sau khi cài</h3>

<!-- ĐÚNG: Dùng CSS cho style, heading cho structure -->
<p class="note"><strong>Lưu ý:</strong> nhớ restart Docker sau khi cài.</p>
```

### Lỗi 3: Quên meta viewport

```html
<!-- Thiếu tag này → website không responsive trên mobile -->
<!-- Google dùng mobile-first indexing → ranking giảm mạnh -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### Lỗi 4: Image không có width/height

```html
<!-- SAI: Gây CLS (Cumulative Layout Shift) -->
<img src="photo.jpg" alt="Photo">

<!-- ĐÚNG: Browser biết kích thước trước khi load ảnh -->
<img src="photo.jpg" alt="Photo" width="800" height="600">
```

CLS là một trong 3 Core Web Vitals metrics. Không khai báo width/height cho image là nguyên nhân CLS phổ biến nhất.

### Lỗi 5: Title tag và H1 giống hệt nhau

```html
<!-- Không phải lỗi nghiêm trọng, nhưng bỏ phí cơ hội -->
<title>Hướng dẫn Docker cho người mới</title>
<h1>Hướng dẫn Docker cho người mới</h1>

<!-- TỐT HƠN: Biến thể keyword, cover nhiều search queries hơn -->
<title>Hướng dẫn Docker cho người mới bắt đầu | DevBlog</title>
<h1>Docker Tutorial: Học Docker từ zero đến deploy</h1>
```

---

## 9. Tổng kết

| Element | Vai trò SEO | Quy tắc chính |
|---------|------------|---------------|
| **Title tag** | Ranking factor #1 on-page | 50-60 ký tự, keyword đầu, unique |
| **Meta description** | Ảnh hưởng CTR | 150-160 ký tự, hấp dẫn, có CTA |
| **H1** | Tiêu đề chính, ranking signal | Chỉ 1 per page, chứa keyword |
| **H2-H6** | Cấu trúc nội dung | Hierarchy đúng, không skip level |
| **Semantic HTML** | Google hiểu cấu trúc trang | `<main>`, `<article>`, `<nav>`, `<aside>` |
| **Alt text** | Image SEO + accessibility | Mô tả chính xác, tự nhiên |
| **Canonical** | Xử lý duplicate content | URL chính thức duy nhất |
| **Open Graph** | Social sharing preview | Title, description, image |

---

## 10. Câu hỏi phỏng vấn

### Câu 1: Tại sao semantic HTML quan trọng cho SEO?

**Trả lời:**

Semantic HTML giúp Google hiểu **vai trò và cấu trúc** của từng phần nội dung trên trang. Khi dùng `<article>`, Google biết đó là nội dung chính. Khi dùng `<nav>`, Google biết đó là navigation và không xem là content chính. Khi dùng `<aside>`, Google hiểu đó là nội dung phụ.

Ngoài SEO, semantic HTML còn giúp: screen readers hoạt động tốt hơn (accessibility), code dễ maintain hơn, và browsers có thể optimize rendering. Google cũng coi nội dung trong `<main>` quan trọng hơn nội dung trong `<footer>` khi phân tích relevance.

### Câu 2: Sự khác biệt giữa title tag và H1? Có nên giống nhau không?

**Trả lời:**

**Title tag** (`<title>`) hiển thị trên tab browser và SERP (kết quả Google). **H1** hiển thị trên chính trang web. Cả hai đều là ranking signals quan trọng.

Chúng **có thể** giống nhau (không bị phạt), nhưng **nên khác nhau** để:
- Title tag tối ưu cho SERP: ngắn gọn, có brand name, hấp dẫn click
- H1 tối ưu cho reader: có thể dài hơn, mô tả chi tiết hơn
- Cover nhiều keyword variations hơn

Ví dụ: Title "Docker Tutorial cho người mới | DevBlog" + H1 "Hướng dẫn Docker từ cơ bản đến deploy production" → cover cả "docker tutorial" và "hướng dẫn docker deploy".

### Câu 3: Alt text cho image nên viết như thế nào?

**Trả lời:**

Alt text nên:
- **Mô tả chính xác** nội dung ảnh (như đang giải thích cho người không nhìn thấy)
- **Ngắn gọn**: 50-125 ký tự
- **Tự nhiên**: Chứa keyword nếu phù hợp, nhưng không nhồi keyword
- **Cụ thể**: "Biểu đồ so sánh performance React vs Vue" thay vì "biểu đồ"

Ngoại lệ: Ảnh decorative (đường kẻ, icon trang trí) dùng `alt=""` (alt rỗng) để screen reader bỏ qua.

### Câu 4: Core Web Vitals nào liên quan đến HTML structure? Cách khắc phục?

**Trả lời:**

**CLS (Cumulative Layout Shift)** liên quan trực tiếp nhất. Nguyên nhân phổ biến:
- Image không có `width` và `height` → browser không biết reserved space → layout shift khi ảnh load
- Font chưa load xong → text reflow khi web font apply
- Ads/embeds không có fixed dimensions

**Khắc phục trong HTML**:
- Luôn khai báo `width` và `height` cho `<img>` và `<video>`
- Dùng `<link rel="preload">` cho font
- Reserve space cho dynamic content (ads, lazy-loaded elements)
- Dùng CSS `aspect-ratio` cho responsive containers

### Câu 5: Bạn nhận được task tối ưu SEO cho một trang web hiện tại. Bạn sẽ kiểm tra những HTML elements nào đầu tiên?

**Trả lời:**

Checklist SEO audit cho HTML, theo thứ tự ưu tiên:

1. **Title tag**: Có tồn tại? Đúng độ dài? Chứa keyword? Unique?
2. **Meta description**: Có tồn tại? 150-160 ký tự? Hấp dẫn?
3. **H1**: Chỉ có 1? Chứa keyword? Match search intent?
4. **Heading hierarchy**: H1 → H2 → H3 đúng thứ tự? Không skip level?
5. **Canonical tag**: Có khai báo? URL đúng?
6. **Meta viewport**: Có cho mobile-friendly?
7. **Images**: Có alt text? Có width/height? Có lazy loading?
8. **Semantic HTML**: Dùng `<main>`, `<article>`, `<nav>` hay toàn `<div>`?
9. **Structured data**: Có JSON-LD? Schema type đúng?
10. **Open Graph/Twitter**: Có đầy đủ cho social sharing?

Dùng Lighthouse audit (tab SEO) để kiểm tra tự động phần lớn checklist này.
