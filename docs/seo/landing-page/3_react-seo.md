---
sidebar_position: 3
title: "3. SEO cho React SPA"
---

# SEO cho React SPA

React SPA (Single Page Application) render nội dung bằng JavaScript ngay trên trình duyệt, nên khi Google ghé thăm thì ban đầu chỉ thấy một trang HTML gần như trống rỗng — đây là điểm yếu lớn về SEO. Bài này giải thích vì sao SPA khó lên top, rồi giới thiệu các giải pháp như react-helmet-async để quản lý meta tag, prerendering, và cách chọn giữa SPA, SSR, SSG. Đọc xong bạn sẽ biết khi nào nên dùng SPA và khi nào nên chuyển sang Next.js.

:::note[Ghi nhớ nhanh]

- ⭐ **SPA trả HTML gần trống** — nội dung render bằng JS nên bị two-wave indexing (delay), và bot mạng xã hội (Facebook/Twitter) không chạy JS nên không thấy OG tags.
- ⭐ **`react-helmet-async` chỉ giải quyết một phần** — quản lý meta/OG tags client-side nhưng không sửa được HTML trống ban đầu; cần kết hợp prerendering hoặc SSR.
- **Prerendering** — `react-snap` (build time, site nhỏ, miễn phí) hoặc `prerender.io` (SaaS, site lớn, serve HTML cho bot).
- **Chọn kiến trúc theo nhu cầu** — không cần SEO thì SPA; cần SEO thì `SSG` (tĩnh), `SSR` (cá nhân hóa), `ISR` (cập nhật từ CMS).
- **Việc cần làm cho SPA** — tạo `sitemap.xml` thủ công tại build time, dùng `BrowserRouter`, trả HTTP 404 thật (không phải status 200).

:::

## Mục lục

- [Vấn đề SEO của Single Page Application](#vấn-đề-seo-của-single-page-application)
- [React Helmet / react-helmet-async cho meta tags](#react-helmet-react-helmet-async-cho-meta-tags)
- [React Router và SEO](#react-router-và-seo)
- [Prerendering solutions](#prerendering-solutions)
- [Khi nào chọn SPA vs SSR vs SSG?](#khi-nào-chọn-spa-vs-ssr-vs-ssg)
- [So sánh: Next.js vs Gatsby vs Remix cho SEO](#so-sánh-nextjs-vs-gatsby-vs-remix-cho-seo)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vấn đề SEO của Single Page Application

React SPA (Single Page Application) có một vấn đề cốt lõi với SEO: nội dung được render bằng JavaScript trên browser. Khi Googlebot crawl trang, ban đầu nó nhận được một file HTML gần như trống rỗng.

### Điều gì xảy ra khi Google crawl React SPA?

```html
<!-- HTML mà Googlebot nhận được ban đầu -->
<!DOCTYPE html>
<html>
<head>
  <title>React App</title>
</head>
<body>
  <div id="root"></div>
  <script src="/static/js/bundle.js"></script>
</body>
</html>
```

Googlebot phải:
1. Download file HTML (gần trống)
2. Download JavaScript bundle (thường 200KB - 2MB)
3. Parse và execute JavaScript
4. Đợi React render DOM
5. Đợi API calls hoàn thành (nếu có)
6. Mới thấy được nội dung thực

### Vấn đề cụ thể

| Vấn đề | Mô tả | Ảnh hưởng SEO |
|---------|--------|---------------|
| Render budget | Googlebot có giới hạn thời gian render JS | Trang có thể không được index |
| Two-wave indexing | HTML crawl trước, JS render sau | Delay indexing vài ngày đến vài tuần |
| Meta tags động | `<title>` và `<meta>` set bằng JS | Google có thể không thấy |
| Dynamic routing | React Router chỉ chạy client-side | Google thấy tất cả route là cùng 1 trang |
| API-dependent content | Nội dung phụ thuộc fetch | Googlebot có thể timeout |
| Social sharing | Facebook, Twitter không chạy JS | OG tags không hiển thị khi share link |

### Kiểm tra SPA có indexable không

Dùng Google Search Console URL Inspection Tool hoặc test nhanh:

```bash
# Xem HTML mà bot nhận được (không chạy JavaScript)
curl -s https://your-spa.com | grep -c "<h1>"
# Nếu kết quả = 0, bot không thấy heading nào

# So sánh với rendered HTML
# Mở Chrome DevTools > View Page Source (Ctrl+U) vs Inspect Element
# Nếu khác nhau nhiều -> SPA rendering problem
```

## React Helmet / react-helmet-async cho meta tags

`react-helmet-async` là giải pháp phổ biến nhất để quản lý `<head>` tags trong React SPA.

### Cài đặt

```bash
npm install react-helmet-async
```

### Setup HelmetProvider

```tsx
// src/main.tsx hoặc src/index.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
)
```

### SEO component tái sử dụng

```tsx
// src/components/SEO.tsx
import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title: string
  description: string
  canonical?: string
  ogImage?: string
  ogType?: string
  noindex?: boolean
  jsonLd?: Record<string, unknown>
}

export function SEO({
  title,
  description,
  canonical,
  ogImage = '/default-og.jpg',
  ogType = 'website',
  noindex = false,
  jsonLd,
}: SEOProps) {
  const siteUrl = 'https://example.com'
  const fullTitle = `${title} | TenSanPham`

  return (
    <Helmet>
      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonical && <link rel="canonical" href={`${siteUrl}${canonical}`} />}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      {canonical && <meta property="og:url" content={`${siteUrl}${canonical}`} />}
      <meta property="og:locale" content="vi_VN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  )
}
```

### Sử dụng trong landing page

```tsx
// src/pages/LandingPage.tsx
import { SEO } from '../components/SEO'

export function LandingPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Sản phẩm có miễn phí không?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Có, gói miễn phí với đầy đủ tính năng cơ bản.',
        },
      },
    ],
  }

  return (
    <>
      <SEO
        title="Tạo Landing Page chuẩn SEO"
        description="Công cụ kéo thả tạo landing page. Tối ưu SEO tự động, tốc độ tải dưới 1 giây."
        canonical="/landing"
        ogImage="/og-landing.jpg"
        jsonLd={faqJsonLd}
      />
      <main>
        <h1>Tạo Landing Page chuẩn SEO trong 30 phút</h1>
        {/* ... */}
      </main>
    </>
  )
}
```

### Hạn chế của React Helmet

React Helmet chỉ giải quyết **một phần** vấn đề:
- Meta tags vẫn được set bằng JavaScript
- Googlebot có thể thấy (vì Google chạy JS), nhưng Facebook/Twitter thì **không**
- Không giải quyết vấn đề initial HTML trống
- Cần kết hợp với prerendering hoặc SSR

## React Router và SEO

React Router v6+ cung cấp các patterns hữu ích cho SEO.

### Route-based code splitting

```tsx
// src/App.tsx
import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const PricingPage = lazy(() => import('./pages/PricingPage'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
```

### Tạo sitemap cho SPA

Vì React Router routes chỉ tồn tại trong JavaScript, bạn cần tạo sitemap thủ công:

```javascript
// scripts/generate-sitemap.js
const fs = require('fs')

const routes = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/pricing', priority: '0.9', changefreq: 'weekly' },
  { path: '/features', priority: '0.8', changefreq: 'monthly' },
  { path: '/contact', priority: '0.6', changefreq: 'monthly' },
]

const siteUrl = 'https://example.com'
const today = new Date().toISOString().split('T')[0]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url>
    <loc>${siteUrl}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`

fs.writeFileSync('public/sitemap.xml', sitemap)
console.log('Sitemap generated successfully')
```

```json
// package.json
{
  "scripts": {
    "build": "node scripts/generate-sitemap.js && react-scripts build",
    "generate-sitemap": "node scripts/generate-sitemap.js"
  }
}
```

## Prerendering solutions

Prerendering là giải pháp trung gian: giữ nguyên SPA architecture nhưng tạo sẵn HTML cho mỗi route.

### react-snap

```bash
npm install react-snap --save-dev
```

```json
// package.json
{
  "scripts": {
    "postbuild": "react-snap"
  },
  "reactSnap": {
    "source": "build",
    "inlineCss": true,
    "puppeteerArgs": ["--no-sandbox", "--disable-setuid-sandbox"],
    "skipThirdPartyRequests": true,
    "include": [
      "/",
      "/about",
      "/pricing",
      "/features"
    ]
  }
}
```

**Cách hoạt động:** react-snap chạy Puppeteer (headless Chrome) sau khi build, navigate đến mỗi route, đợi render xong, rồi save HTML output. Kết quả là mỗi route có file HTML đầy đủ nội dung.

### prerender.io (SaaS)

Dùng cho production scale, không cần self-host:

```html
<!-- Thêm vào index.html -->
<meta name="fragment" content="!">
```

```javascript
// Server middleware (Express example)
const prerender = require('prerender-node')

app.use(prerender
  .set('prerenderToken', process.env.PRERENDER_TOKEN)
  .set('protocol', 'https')
)

// prerender.io sẽ:
// 1. Detect bot user-agent (Googlebot, Facebookbot, etc.)
// 2. Serve pre-rendered HTML cho bots
// 3. Serve SPA bình thường cho users
```

### So sánh prerendering solutions

| Giải pháp | Chi phí | Setup | Maintenance | Scale |
|-----------|---------|-------|-------------|-------|
| react-snap | Free | Dễ | Build time tăng | Hàng trăm pages |
| prerender.io | Trả phí | Rất dễ | Không cần maintain | Không giới hạn |
| rendertron (self-host) | Free + hosting | Trung bình | Cần maintain server | Phụ thuộc server |
| Puppeteer custom | Free | Khó | Cần maintain script | Tùy chỉnh |

## Khi nào chọn SPA vs SSR vs SSG?

Đây là câu hỏi quan trọng nhất khi bắt đầu dự án.

### Decision matrix

```
Cần SEO?
├── Không (dashboard, admin, internal tool)
│   └── SPA (React + Vite) ✓
│
└── Có
    ├── Nội dung tĩnh, ít thay đổi?
    │   ├── Có (blog, docs, marketing pages)
    │   │   └── SSG (Next.js static / Astro / Docusaurus) ✓
    │   │
    │   └── Không, nội dung thay đổi thường xuyên
    │       ├── Nội dung cá nhân hóa theo user?
    │       │   ├── Có (e-commerce product page, personalized feed)
    │       │   │   └── SSR (Next.js SSR) ✓
    │       │   │
    │       │   └── Không, nhưng cập nhật từ CMS
    │       │       └── ISR (Next.js ISR) ✓
    │       │
    │       └── SPA + prerendering nếu migration cost quá cao
    └──
```

### So sánh chi tiết

| Tiêu chí | SPA (React) | SSG (Next.js static) | SSR (Next.js) | ISR (Next.js) |
|-----------|-------------|---------------------|---------------|---------------|
| SEO | Kém (cần workaround) | Tốt nhất | Rất tốt | Rất tốt |
| TTFB | Nhanh (HTML nhẹ) | Nhanh nhất (CDN) | Chậm hơn (server render) | Nhanh (cached) |
| FCP | Chậm (đợi JS) | Nhanh nhất | Nhanh | Nhanh |
| Build time | Nhanh | Chậm nếu nhiều pages | Nhanh | Nhanh |
| Hosting | Static hosting | Static hosting / CDN | Node.js server | Vercel / Node.js |
| Dynamic data | Client fetch | Build time only | Mỗi request | Revalidate interval |
| Cost | Thấp | Thấp | Trung bình | Trung bình |

## So sánh: Next.js vs Gatsby vs Remix cho SEO

### Next.js

```
Ưu điểm:
+ Hỗ trợ SSG, SSR, ISR trong cùng 1 project
+ Metadata API mạnh mẽ (App Router)
+ Image và Font optimization tích hợp
+ Edge Runtime cho performance
+ Ecosystem lớn nhất

Nhược điểm:
- Complexity cao cho dự án đơn giản
- Vercel-centric (tối ưu nhất trên Vercel)
```

### Gatsby

```
Ưu điểm:
+ SSG thuần, build time optimization tốt
+ GraphQL data layer linh hoạt
+ Plugin ecosystem phong phú
+ Image optimization tốt (gatsby-image)

Nhược điểm:
- Build time rất chậm cho sites lớn
- Không hỗ trợ SSR natively (Gatsby 5 có DSG nhưng limited)
- Đang mất momentum, community thu hẹp
- GraphQL learning curve
```

### Remix

```
Ưu điểm:
+ Nested routing = parallel data loading
+ Progressive enhancement mặc định
+ Form handling tốt (không cần client JS cho forms)
+ Web standards focused

Nhược điểm:
- Luôn cần server (không có SSG thuần)
- Ecosystem nhỏ hơn Next.js
- Meta tags qua meta() function, ít flexible hơn
```

### So sánh nhanh cho SEO landing page

| Feature | Next.js | Gatsby | Remix |
|---------|---------|--------|-------|
| Static landing page | SSG | SSG | SSR only |
| Dynamic meta tags | generateMetadata | gatsby-plugin-react-helmet | meta() function |
| Image optimization | next/image (built-in) | gatsby-image (plugin) | Tự xử lý |
| Structured data | JSON-LD component | gatsby-plugin-schema-org | JSON-LD component |
| Sitemap | next-sitemap | gatsby-plugin-sitemap | Tự tạo / remix-sitemap |
| Performance | Rất tốt | Tốt (build time chậm) | Tốt |
| Learning curve | Trung bình | Cao (GraphQL) | Thấp |

**Kết luận:** Cho landing page SEO, Next.js là lựa chọn an toàn nhất vì hỗ trợ đa dạng rendering strategy và có ecosystem lớn nhất. Gatsby phù hợp nếu bạn cần SSG thuần với nhiều data sources. Remix tốt nếu bạn ưu tiên progressive enhancement và web standards.

## Lỗi thường gặp

### 1. Quên HelmetProvider

```tsx
// SAI: Helmet không hoạt động nếu thiếu Provider
import { Helmet } from 'react-helmet-async'
function App() {
  return (
    <Helmet>
      <title>My App</title>
    </Helmet>
  )
}

// ĐÚNG: Wrap với HelmetProvider
import { HelmetProvider } from 'react-helmet-async'
function App() {
  return (
    <HelmetProvider>
      {/* Helmet components bên trong */}
    </HelmetProvider>
  )
}
```

### 2. Sử dụng react-helmet thay vì react-helmet-async

`react-helmet` (không có async) đã deprecated và có memory leak issues. Luôn dùng `react-helmet-async`.

### 3. Không handle 404 cho React Router

```tsx
// SAI: Mọi URL đều trả về 200 (SPA default)
// Google index hàng loạt trang không tồn tại

// ĐÚNG: Có route 404 + server config
<Route path="*" element={<NotFound />} />

// Trong NotFound component, set meta noindex
<Helmet>
  <meta name="robots" content="noindex" />
  <title>404 - Trang không tồn tại</title>
</Helmet>
```

Ngoài ra cần config server trả HTTP 404 status code (không chỉ hiển thị 404 page với status 200).

### 4. Social sharing không hiển thị OG tags

Facebook, Twitter, LinkedIn **không chạy JavaScript**. React Helmet chỉ set OG tags client-side. Giải pháp: prerendering hoặc SSR.

### 5. Bundle size quá lớn

```bash
# Analyze bundle size
npx source-map-explorer 'build/static/js/*.js'

# Hoặc với webpack-bundle-analyzer
npm install webpack-bundle-analyzer --save-dev
```

Nếu JavaScript bundle lớn hơn 200KB (gzipped), Googlebot có thể timeout khi render.

## Câu hỏi phỏng vấn

### Câu 1: Tại sao React SPA gặp khó khăn với SEO? Có những giải pháp nào?

**Trả lời:** React SPA render nội dung bằng JavaScript trên browser. Khi crawler truy cập, nó nhận được HTML gần trống với chỉ 1 `<div id="root">`. Googlebot có thể render JS nhưng với delay (two-wave indexing), và các bot khác (Facebook, Twitter) không chạy JS. Giải pháp: (1) SSR với Next.js/Remix - render trên server mỗi request, (2) SSG - pre-render tại build time, (3) Prerendering - dùng headless browser tạo HTML snapshots, (4) react-helmet-async - quản lý meta tags (chỉ giải quyết một phần).

### Câu 2: So sánh react-snap và prerender.io. Khi nào dùng cái nào?

**Trả lời:** react-snap chạy Puppeteer tại build time, tạo HTML cho mỗi route, output là static files. Phù hợp cho site nhỏ (dưới vài trăm pages), miễn phí, nhưng tăng build time. prerender.io là SaaS middleware, detect bot user-agent và serve pre-rendered HTML on-the-fly. Phù hợp cho site lớn, dynamic content, không tăng build time nhưng tốn phí. Dùng react-snap cho side projects và sites nhỏ. Dùng prerender.io cho production sites cần scale.

### Câu 3: Google có thể render JavaScript không? Vậy tại sao SPA vẫn có vấn đề SEO?

**Trả lời:** Google sử dụng Web Rendering Service (WRS) dựa trên Chromium để render JavaScript. Tuy nhiên có vấn đề: (1) Two-wave indexing: Google crawl HTML trước, schedule render JS sau, có thể delay vài ngày đến vài tuần; (2) Render budget: Google có giới hạn tài nguyên cho mỗi site, trang nặng JS có thể bị skip; (3) Timeout: nếu JS execution quá lâu hoặc API calls chậm, nội dung bị miss; (4) Other bots: Facebook, Twitter, Slack preview không chạy JS. Vì vậy best practice vẫn là server-render HTML.

### Câu 4: Làm sao tạo sitemap cho React SPA khi routes chỉ tồn tại trong JavaScript?

**Trả lời:** Cần tạo sitemap tại build time bằng script riêng. Định nghĩa danh sách routes trong file config hoặc tự động extract từ React Router config. Dùng script Node.js generate file `sitemap.xml` vào thư mục `public/`. Thêm script vào build pipeline (chạy trước hoặc sau build). Đối với dynamic routes (ví dụ blog posts), fetch data từ CMS/API rồi generate URL cho mỗi item. Submit sitemap lên Google Search Console.

### Câu 5: Nếu đang có React SPA cần cải thiện SEO, nên migrate sang Next.js hay dùng prerendering?

**Trả lời:** Phụ thuộc vào nhiều yếu tố: (1) Nếu project nhỏ, ít routes -> prerendering với react-snap là đủ, chi phí migration thấp; (2) Nếu project lớn, cần dynamic SEO, có team resources -> migrate sang Next.js, được lợi lâu dài; (3) Nếu cần SEO ngay, không có thời gian migrate -> prerender.io middleware, deploy nhanh; (4) Nếu chỉ cần SEO cho một số trang (landing, blog) -> hybrid approach: Next.js cho public pages, SPA cho authenticated app. Migration sang Next.js là investment lớn nhưng giải quyết triệt để, prerendering là band-aid nhưng nhanh.
