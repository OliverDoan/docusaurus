---
sidebar_position: 4
title: "4. Hiệu suất Landing Page"
---

# Hiệu suất Landing Page

Tốc độ tải trang giờ đây là yếu tố xếp hạng chính thức của Google (Core Web Vitals), đồng thời ảnh hưởng trực tiếp tới tỷ lệ chuyển đổi — trang càng chậm thì khách càng bỏ đi. Bài này chỉ bạn cách tối ưu hero image, chiến lược tải font, giảm dung lượng JavaScript và CSS, lazy load nội dung dưới màn hình, cùng các resource hint hữu ích. Đây là phần kỹ thuật giúp landing page vừa nhanh vừa giữ chân người dùng.

## Mục lục

- [Performance metrics ảnh hưởng SEO ranking](#performance-metrics-ảnh-hưởng-seo-ranking)
- [Hero image optimization](#hero-image-optimization)
- [Font loading strategies](#font-loading-strategies)
- [Reducing JavaScript bundle](#reducing-javascript-bundle)
- [CSS optimization](#css-optimization)
- [Lazy loading below-the-fold content](#lazy-loading-below-the-fold-content)
- [Resource hints tổng hợp](#resource-hints-tổng-hợp)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Performance metrics ảnh hưởng SEO ranking

Google sử dụng Core Web Vitals như ranking signal chính thức từ 2021. Với landing page, mỗi millisecond đều quan trọng vì ảnh hưởng cả ranking lẫn conversion rate.

### Core Web Vitals

| Metric | Đo gì | Ngưỡng tốt | Ngưỡng kém | Ảnh hưởng landing page |
|--------|--------|------------|------------|----------------------|
| **LCP** (Largest Contentful Paint) | Thời gian render element lớn nhất | dưới 2.5s | trên 4.0s | Hero image, H1 heading |
| **INP** (Interaction to Next Paint) | Độ trễ khi tương tác | dưới 200ms | trên 500ms | CTA click, form submit |
| **CLS** (Cumulative Layout Shift) | Layout dịch chuyển bất ngờ | dưới 0.1 | trên 0.25 | Font loading, image resize |

### Metrics bổ sung quan trọng

| Metric | Đo gì | Target |
|--------|--------|--------|
| **FCP** (First Contentful Paint) | Render nội dung đầu tiên | dưới 1.8s |
| **TTFB** (Time to First Byte) | Server response time | dưới 800ms |
| **TBT** (Total Blocking Time) | JavaScript blocking main thread | dưới 200ms |
| **Speed Index** | Tốc độ visual load | dưới 3.4s |

### Đo lường thực tế

```bash
# Lighthouse CLI
npx lighthouse https://example.com --output=json --output-path=./report.json

# PageSpeed Insights API
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://example.com&strategy=mobile"

# Web Vitals trong code
npm install web-vitals
```

```javascript
// Đo Core Web Vitals trong production
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals'

function sendToAnalytics(metric) {
  // Gửi về GA4 hoặc custom analytics
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating, // "good", "needs-improvement", "poor"
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  })

  // Dùng sendBeacon để không block page unload
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/vitals', body)
  } else {
    fetch('/api/analytics/vitals', { body, method: 'POST', keepalive: true })
  }
}

onCLS(sendToAnalytics)
onINP(sendToAnalytics)
onLCP(sendToAnalytics)
onFCP(sendToAnalytics)
onTTFB(sendToAnalytics)
```

## Hero image optimization

Hero image thường là LCP element trên landing page. Tối ưu hero image = cải thiện LCP trực tiếp.

### Format comparison

| Format | Compression | Browser support | Transparency | Animation | Use case |
|--------|------------|----------------|-------------|-----------|----------|
| JPEG | Lossy | 100% | Không | Không | Ảnh chụp |
| PNG | Lossless | 100% | Có | Không | Logo, icon |
| WebP | Lossy + Lossless | 97%+ | Có | Có | Mọi trường hợp |
| AVIF | Lossy + Lossless | 92%+ | Có | Có | Tốt nhất nếu support |

### Chiến lược tối ưu hero image

```html
<!-- 1. Responsive images với srcset -->
<img
  src="hero-800.webp"
  srcset="
    hero-400.webp 400w,
    hero-800.webp 800w,
    hero-1200.webp 1200w,
    hero-1600.webp 1600w
  "
  sizes="(max-width: 768px) 100vw, 50vw"
  alt="Landing page builder interface"
  width="1200"
  height="600"
  loading="eager"
  fetchpriority="high"
  decoding="async"
>

<!-- 2. Picture element với fallback -->
<picture>
  <source
    srcset="hero-400.avif 400w, hero-800.avif 800w, hero-1200.avif 1200w"
    sizes="(max-width: 768px) 100vw, 50vw"
    type="image/avif"
  >
  <source
    srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1200.webp 1200w"
    sizes="(max-width: 768px) 100vw, 50vw"
    type="image/webp"
  >
  <img
    src="hero-800.jpg"
    alt="Landing page builder interface"
    width="1200"
    height="600"
    loading="eager"
    fetchpriority="high"
  >
</picture>
```

### Preload hero image

```html
<!-- Preload hero image trong head (QUAN TRỌNG cho LCP) -->
<head>
  <!-- Preload với đúng format -->
  <link
    rel="preload"
    as="image"
    href="hero-1200.webp"
    type="image/webp"
    imagesrcset="hero-400.webp 400w, hero-800.webp 800w, hero-1200.webp 1200w"
    imagesizes="(max-width: 768px) 100vw, 50vw"
    fetchpriority="high"
  >
</head>
```

### Convert và optimize images với CLI

```bash
# Install tools
npm install -g sharp-cli

# Convert sang WebP (quality 80, resize)
npx sharp -i hero-original.jpg -o hero-1200.webp --webp --quality 80 --resize 1200
npx sharp -i hero-original.jpg -o hero-800.webp --webp --quality 80 --resize 800
npx sharp -i hero-original.jpg -o hero-400.webp --webp --quality 80 --resize 400

# Hoặc dùng squoosh CLI
npx @aspect-build/squoosh-cli --webp '{"quality":80}' --resize '{"width":1200}' hero-original.jpg

# Convert sang AVIF
npx sharp -i hero-original.jpg -o hero-1200.avif --avif --quality 65 --resize 1200
```

### Image size budget

Quy tắc: hero image nên dưới **150KB** sau khi optimize.

| Viewport | Max width | Target file size |
|----------|----------|-----------------|
| Mobile | 400px | 30-50KB |
| Tablet | 800px | 60-80KB |
| Desktop | 1200px | 100-150KB |
| Large | 1600px | 150-200KB |

## Font loading strategies

Font loading sai cách gây CLS (layout shift) và chậm FCP.

### font-display values

```css
/* swap: Hiển thị text ngay với fallback, swap khi custom font ready */
/* Tốt nhất cho landing page - user thấy content ngay */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap;
}

/* optional: Nếu font chưa load trong 100ms, dùng fallback mãi */
/* Tốt cho performance, nhưng user có thể không thấy custom font */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: optional;
}
```

| font-display | Block period | Swap period | CLS risk | Dùng khi |
|-------------|-------------|-------------|----------|----------|
| `auto` | Browser quyết định | Browser quyết định | Cao | Không recommend |
| `block` | 3 giây | Vô hạn | Trung bình | Icon fonts |
| `swap` | Cực ngắn | Vô hạn | Có | Body text, headings |
| `fallback` | 100ms | 3 giây | Thấp | Secondary text |
| `optional` | Cực ngắn | Không swap | Không | Performance-first |

### Preload critical fonts

```html
<head>
  <!-- Preload font file quan trọng nhất -->
  <link
    rel="preload"
    href="/fonts/inter-var-latin.woff2"
    as="font"
    type="font/woff2"
    crossorigin="anonymous"
  >

  <!-- Chỉ preload 1-2 font files, KHÔNG preload tất cả weights -->
</head>
```

### Fallback font matching (giảm CLS)

```css
/* Tạo fallback font có cùng metrics với custom font */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: swap;
}

/* Override system font metrics để match Inter */
@font-face {
  font-family: 'Inter-fallback';
  src: local('Arial');
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
  size-adjust: 107%;
}

body {
  font-family: 'Inter', 'Inter-fallback', system-ui, sans-serif;
}
```

### Self-host vs Google Fonts

```
Self-host (recommended):
+ Không có DNS lookup đến fonts.googleapis.com
+ Không có thêm TCP connection
+ Có thể preload ngay
+ GDPR compliant (không gửi IP đến Google)
- Phải tự manage font files

Google Fonts:
+ Dễ dùng
+ CDN cache shared giữa các sites (KHÔNG còn đúng từ Chrome 86+)
- DNS lookup + TCP connection thêm
- Privacy concerns (GDPR)
- Render-blocking nếu không xử lý đúng
```

## Reducing JavaScript bundle

JavaScript là kẻ thù số 1 của landing page performance. Mỗi KB JavaScript đều tốn thời gian download, parse, và execute.

### Analyze bundle

```bash
# Next.js bundle analysis
npm install @next/bundle-analyzer --save-dev
```

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // config
})
```

```bash
# Chạy analyze
ANALYZE=true npm run build

# Vite bundle analysis
npx vite-bundle-visualizer
```

### Strategies giảm JavaScript

**1. Remove unnecessary libraries**

```javascript
// SAI: Import toàn bộ lodash (70KB gzipped)
import _ from 'lodash'
const result = _.debounce(fn, 300)

// ĐÚNG: Import chỉ function cần
import debounce from 'lodash/debounce'
const result = debounce(fn, 300)

// TỐT HƠN: Tự viết debounce (20 dòng thay vì import library)
function debounce(fn, delay) {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), delay)
  }
}
```

**2. Dynamic import cho below-the-fold**

```tsx
// components/LazyTestimonials.tsx
import { lazy, Suspense } from 'react'

const Testimonials = lazy(() => import('./Testimonials'))
const PricingTable = lazy(() => import('./PricingTable'))

export function LandingPage() {
  return (
    <main>
      {/* Above-the-fold: load ngay */}
      <Hero />
      <Features />

      {/* Below-the-fold: lazy load */}
      <Suspense fallback={<div className="skeleton" />}>
        <Testimonials />
      </Suspense>
      <Suspense fallback={<div className="skeleton" />}>
        <PricingTable />
      </Suspense>
    </main>
  )
}
```

**3. Defer third-party scripts**

```html
<!-- SAI: Block rendering -->
<script src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>

<!-- ĐÚNG: Async loading -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>

<!-- TỐT HƠN: Defer cho non-critical scripts -->
<script>
  // Load GA sau khi trang render xong
  window.addEventListener('load', function() {
    const script = document.createElement('script')
    script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_ID'
    script.async = true
    document.head.appendChild(script)
  })
</script>
```

### JavaScript budget cho landing page

| Loại | Budget (gzipped) | Ghi chú |
|------|------------------|---------|
| Framework (React) | 40-45KB | Không thể giảm nhiều |
| App code | 20-30KB | Giảm tối đa |
| Third-party | 30-50KB | GA, chatbot, etc. |
| **Tổng** | **dưới 130KB** | Target cho mobile |

## CSS optimization

### Critical CSS inline

Critical CSS là CSS cần thiết để render above-the-fold content. Inline nó vào `<head>` để trang hiển thị ngay mà không cần đợi external CSS file.

```html
<head>
  <!-- Critical CSS inline: render above-the-fold ngay -->
  <style>
    /* Reset tối thiểu */
    *, *::before, *::after { box-sizing: border-box; margin: 0; }

    /* Hero section styles */
    .hero {
      display: flex;
      align-items: center;
      min-height: 80vh;
      padding: 2rem;
    }
    .hero h1 {
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 700;
      line-height: 1.2;
    }
    .hero .subtitle {
      font-size: 1.125rem;
      color: #666;
      margin-top: 1rem;
    }
    .cta-primary {
      display: inline-block;
      padding: 0.875rem 2rem;
      background: #2563eb;
      color: white;
      border-radius: 0.5rem;
      font-weight: 600;
      text-decoration: none;
      margin-top: 1.5rem;
    }
    /* Navigation */
    header { display: flex; justify-content: space-between; padding: 1rem 2rem; }
    nav ul { display: flex; gap: 1.5rem; list-style: none; }
  </style>

  <!-- Non-critical CSS: load async -->
  <link
    rel="preload"
    href="/styles/main.css"
    as="style"
    onload="this.onload=null;this.rel='stylesheet'"
  >
  <noscript>
    <link rel="stylesheet" href="/styles/main.css">
  </noscript>
</head>
```

### Extract critical CSS tự động

```bash
# Dùng critical (by Addy Osmani)
npm install critical --save-dev
```

```javascript
// scripts/extract-critical.js
const critical = require('critical')

critical.generate({
  base: 'build/',
  src: 'index.html',
  css: ['build/static/css/main.css'],
  width: 1300,
  height: 900,
  inline: true,
  target: {
    html: 'build/index.html',
  },
  // Penthouse options
  penthouse: {
    blockJSRequests: false,
  },
})
```

### Purge unused CSS

```bash
# Dùng PurgeCSS
npm install purgecss --save-dev
```

```javascript
// purgecss.config.js
module.exports = {
  content: ['./build/**/*.html', './build/**/*.js'],
  css: ['./build/static/css/*.css'],
  output: './build/static/css/',
  safelist: {
    standard: [/^active/, /^open/, /^show/],
  },
}
```

## Lazy loading below-the-fold content

### Native lazy loading cho images

```html
<!-- Above-the-fold: load ngay -->
<img src="hero.webp" alt="Hero" loading="eager" fetchpriority="high">

<!-- Below-the-fold: lazy load -->
<img src="feature-1.webp" alt="Feature 1" loading="lazy" width="600" height="400">
<img src="feature-2.webp" alt="Feature 2" loading="lazy" width="600" height="400">
```

### Intersection Observer cho sections

```javascript
// Lazy load entire sections khi user scroll đến
function lazyLoadSection(sectionId) {
  const section = document.getElementById(sectionId)
  if (!section) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Load content
          section.classList.add('loaded')
          // Load thêm data nếu cần
          loadSectionData(sectionId)
          observer.unobserve(entry.target)
        }
      })
    },
    {
      rootMargin: '200px', // Load trước 200px khi user scroll đến
      threshold: 0.1,
    }
  )

  observer.observe(section)
}

// Apply cho các sections below-the-fold
lazyLoadSection('testimonials')
lazyLoadSection('pricing')
lazyLoadSection('faq')
```

### Lazy load iframes (video embeds, maps)

```html
<!-- SAI: YouTube iframe load ngay, block rendering -->
<iframe src="https://www.youtube.com/embed/VIDEO_ID" width="560" height="315"></iframe>

<!-- ĐÚNG: Lazy load iframe -->
<iframe
  src="https://www.youtube.com/embed/VIDEO_ID"
  width="560"
  height="315"
  loading="lazy"
  title="Video demo sản phẩm"
></iframe>

<!-- TỐT HƠN: Facade pattern - load thumbnail trước, iframe khi click -->
```

```tsx
// components/YouTubeFacade.tsx
import { useState } from 'react'

interface YouTubeFacadeProps {
  videoId: string
  title: string
}

export function YouTubeFacade({ videoId, title }: YouTubeFacadeProps) {
  const [showIframe, setShowIframe] = useState(false)

  if (showIframe) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        width="560"
        height="315"
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    )
  }

  return (
    <button
      onClick={() => setShowIframe(true)}
      className="youtube-facade"
      aria-label={`Play video: ${title}`}
      style={{
        backgroundImage: `url(https://img.youtube.com/vi/${videoId}/maxresdefault.jpg)`,
      }}
    >
      {/* Play button overlay */}
      <svg viewBox="0 0 68 48" width="68" height="48">
        <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"/>
        <path d="M 45,24 27,14 27,34" fill="#fff"/>
      </svg>
    </button>
  )
}
```

## Resource hints tổng hợp

```html
<head>
  <!-- DNS Prefetch: resolve DNS sớm cho third-party domains -->
  <link rel="dns-prefetch" href="//www.google-analytics.com">
  <link rel="dns-prefetch" href="//fonts.googleapis.com">

  <!-- Preconnect: DNS + TCP + TLS handshake sớm -->
  <link rel="preconnect" href="https://api.example.com" crossorigin>

  <!-- Preload: download sớm resources critical -->
  <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/images/hero.webp" as="image" type="image/webp">

  <!-- Prefetch: download resources cho next navigation -->
  <link rel="prefetch" href="/signup">
  <link rel="prefetch" href="/styles/signup.css" as="style">

  <!-- Modulepreload: preload ES modules -->
  <link rel="modulepreload" href="/js/landing.js">
</head>
```

| Hint | Khi nào dùng | Priority |
|------|-------------|----------|
| `dns-prefetch` | Third-party domains | Thấp |
| `preconnect` | Domains sẽ fetch sớm | Trung bình |
| `preload` | Critical resources (font, hero image) | Cao |
| `prefetch` | Resources cho trang tiếp theo | Thấp |
| `modulepreload` | Critical JS modules | Cao |

## Lỗi thường gặp

### 1. Preload quá nhiều resources

```html
<!-- SAI: Preload mọi thứ = không preload gì cả -->
<link rel="preload" href="font-1.woff2" as="font">
<link rel="preload" href="font-2.woff2" as="font">
<link rel="preload" href="font-3.woff2" as="font">
<link rel="preload" href="hero.webp" as="image">
<link rel="preload" href="feature-1.webp" as="image">
<link rel="preload" href="feature-2.webp" as="image">
<link rel="preload" href="main.css" as="style">
<link rel="preload" href="app.js" as="script">

<!-- ĐÚNG: Chỉ preload 2-4 critical resources -->
<link rel="preload" href="font-1.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="hero.webp" as="image" type="image/webp">
```

### 2. Hero image không có width/height

```html
<!-- SAI: Gây CLS khi image load -->
<img src="hero.webp" alt="Hero">

<!-- ĐÚNG: Browser biết kích thước trước, reserve space -->
<img src="hero.webp" alt="Hero" width="1200" height="600">
```

### 3. Dùng `loading="lazy"` cho hero image

```html
<!-- SAI: Hero image bị lazy load -> LCP chậm -->
<img src="hero.webp" loading="lazy" alt="Hero">

<!-- ĐÚNG: Hero image load eager với high priority -->
<img src="hero.webp" loading="eager" fetchpriority="high" alt="Hero">
```

### 4. CSS render-blocking không cần thiết

Mọi `<link rel="stylesheet">` trong `<head>` đều render-blocking. Nếu CSS file lớn, trang sẽ trắng cho đến khi download xong.

### 5. Không measure Real User Metrics (RUM)

Lighthouse chỉ cho lab data. Cần đo real user data bằng `web-vitals` library hoặc CrUX Report.

## Câu hỏi phỏng vấn

### Câu 1: LCP trên landing page là 4.5 giây. Bạn sẽ debug và fix như thế nào?

**Trả lời:** Bước 1: Xác định LCP element bằng Lighthouse hoặc DevTools Performance tab (thường là hero image hoặc large text block). Bước 2: Nếu LCP là image: (a) preload image trong `<head>`, (b) dùng `fetchpriority="high"`, (c) convert sang WebP/AVIF, (d) dùng responsive srcset, (e) set `loading="eager"`. Bước 3: Nếu LCP là text: (a) inline critical CSS, (b) preload font, (c) dùng `font-display: swap`. Bước 4: Kiểm tra TTFB - nếu server chậm, cần CDN hoặc static generation. Bước 5: Remove render-blocking resources (JS, CSS không cần thiết above-the-fold).

### Câu 2: Giải thích sự khác biệt giữa preload, prefetch, và preconnect.

**Trả lời:** `preload` download resource ngay vì current page CẦN nó sớm (high priority) - dùng cho hero image, critical font. `prefetch` download resource TRƯỚC vì trang TIẾP THEO có thể cần (low priority, idle time) - dùng cho resources của trang signup khi user đang ở landing page. `preconnect` chỉ thực hiện DNS lookup + TCP connection + TLS handshake, chưa download gì - dùng cho domains sẽ fetch API sớm. Sai lầm phổ biến: dùng preload cho mọi thứ, gây bandwidth contention; hoặc nhầm prefetch với preload dẫn đến resource tải muộn.

### Câu 3: Critical CSS là gì? Tại sao quan trọng cho landing page?

**Trả lời:** Critical CSS là tập CSS tối thiểu cần để render above-the-fold content. Inline nó vào `<style>` tag trong `<head>` giúp browser render ngay mà không cần đợi external CSS file download. Non-critical CSS được load async bằng `<link rel="preload" as="style">`. Đặc biệt quan trọng cho landing page vì: (1) giảm FCP đáng kể (user thấy content ngay), (2) cải thiện LCP nếu LCP element là text, (3) giảm render-blocking resources. Tools: critical (by Addy Osmani), critters (webpack plugin).

### Câu 4: CLS score trên landing page là 0.35. Nguyên nhân và cách fix?

**Trả lời:** Nguyên nhân thường gặp: (1) Image không có width/height -> browser không reserve space; (2) Web fonts gây layout shift khi swap -> dùng `size-adjust` hoặc `font-display: optional`; (3) Dynamic content inject (ads, banners) -> reserve space trước; (4) Late-loading CSS thay đổi layout -> inline critical CSS. Fix: set width/height cho mọi image/video, match fallback font metrics, dùng `aspect-ratio` CSS, `contain-intrinsic-size` cho lazy-loaded elements, tránh insert content above existing content.

### Câu 5: Landing page dùng 5 Google Fonts. Tối ưu như thế nào?

**Trả lời:** (1) Giảm xuống 2 fonts maximum (1 heading, 1 body). (2) Self-host thay vì load từ Google Fonts CDN để giảm DNS lookup và connection. (3) Chỉ load weights cần thiết (thường 400, 600, 700 là đủ). (4) Subset fonts - chỉ include characters cần dùng (latin + vietnamese). (5) Preload 1 font file quan trọng nhất. (6) Dùng `font-display: swap` để text hiển thị ngay. (7) Dùng variable fonts nếu cần nhiều weights (1 file thay vì nhiều files). (8) Nếu dùng Next.js, `next/font` xử lý tất cả tự động.
