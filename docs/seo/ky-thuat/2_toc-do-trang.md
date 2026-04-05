---
sidebar_position: 2
title: "Tốc độ trang"
---

# Tốc độ trang

## Tại sao tốc độ trang quan trọng?

Tốc độ trang ảnh hưởng trực tiếp đến cả trải nghiệm người dùng và SEO. Theo nghiên cứu của Google:

- 53% người dùng mobile rời trang nếu tải trên 3 giây
- Mỗi giây delay tăng, bounce rate tăng khoảng 32%
- Google đã xác nhận tốc độ trang là ranking signal từ 2010 (desktop) và 2018 (mobile)

Với developer, tối ưu tốc độ không chỉ là chạy Lighthouse rồi sửa — mà là hiểu **critical rendering path** để biết tối ưu ở đâu cho hiệu quả nhất.

## Critical Rendering Path

### Trình duyệt render trang như thế nào?

```
HTML → DOM Tree
                ↘
                  Render Tree → Layout → Paint → Composite
                ↗
CSS  → CSSOM
```

Các bước chi tiết:

1. **Parse HTML** thành DOM Tree
2. **Parse CSS** thành CSSOM (CSS Object Model)
3. **Kết hợp** DOM + CSSOM thành Render Tree
4. **Layout**: Tính toán vị trí, kích thước mỗi element
5. **Paint**: Vẽ pixel lên màn hình
6. **Composite**: Ghép các layer lại

### Render-blocking resources

CSS và synchronous JS chặn quá trình render:

```html
<!-- CHẶN RENDER: Browser phải tải + parse CSS xong mới render -->
<link rel="stylesheet" href="/styles/main.css" />

<!-- CHẶN RENDER: Browser dừng parse HTML, tải + chạy JS xong mới tiếp -->
<script src="/scripts/app.js"></script>

<!-- KHÔNG CHẶN: defer — tải song song, chạy sau khi HTML parse xong -->
<script defer src="/scripts/app.js"></script>

<!-- KHÔNG CHẶN: async — tải song song, chạy ngay khi tải xong -->
<script async src="/scripts/analytics.js"></script>
```

### Sự khác nhau giữa `defer` và `async`

| Đặc điểm | `defer` | `async` |
|-----------|---------|---------|
| Tải | Song song với HTML parsing | Song song với HTML parsing |
| Chạy | Sau khi HTML parse xong | Ngay khi JS tải xong (có thể chặn parsing) |
| Thứ tự | Giữ nguyên thứ tự script | Không đảm bảo thứ tự |
| Dùng cho | App logic, framework | Analytics, ads, script độc lập |

```html
<head>
  <!-- Framework phải chạy đúng thứ tự → dùng defer -->
  <script defer src="/scripts/vendor.js"></script>
  <script defer src="/scripts/app.js"></script>

  <!-- Analytics không phụ thuộc gì → dùng async -->
  <script async src="https://www.googletagmanager.com/gtag/js"></script>
</head>
```

## Code Splitting và Lazy Loading

### Tại sao cần code splitting?

Một SPA React thông thường bundle tất cả code vào 1 file JS lớn. Trang chủ chỉ cần 50KB code nhưng user phải tải 500KB bundle chứa cả trang admin, dashboard, settings.

### React.lazy + Suspense

```javascript
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// TRƯỚC: Import tất cả ngay từ đầu
// import Home from './pages/Home';
// import Dashboard from './pages/Dashboard';
// import Settings from './pages/Settings';

// SAU: Lazy load — chỉ tải khi user navigate đến
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

### Next.js Dynamic Import

```javascript
import dynamic from 'next/dynamic';

// Component nặng — lazy load với custom loading
const HeavyChart = dynamic(() => import('../components/HeavyChart'), {
  loading: () => <p>Đang tải biểu đồ...</p>,
  ssr: false, // Không render trên server (chỉ client)
});

// Component chỉ dùng trên mobile
const MobileMenu = dynamic(() => import('../components/MobileMenu'), {
  ssr: false,
});

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <HeavyChart />
    </div>
  );
}
```

### Webpack Code Splitting Config

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Tách vendor libraries ra file riêng
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        // Tách code dùng chung giữa nhiều entry points
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
  },
};
```

## Tối ưu CSS

### Critical CSS — Inline CSS cần thiết cho above-the-fold

```html
<head>
  <!-- Critical CSS inline — render ngay không cần đợi file CSS -->
  <style>
    /* Chỉ CSS cho phần trên cùng màn hình */
    body { margin: 0; font-family: system-ui, sans-serif; }
    .header { background: #1a1a2e; color: white; padding: 1rem; }
    .hero { padding: 2rem; text-align: center; }
    .hero h1 { font-size: 2.5rem; margin-bottom: 1rem; }
  </style>

  <!-- CSS còn lại — tải async, không chặn render -->
  <link
    rel="preload"
    href="/styles/main.css"
    as="style"
    onload="this.onload=null;this.rel='stylesheet'"
  />
  <noscript>
    <link rel="stylesheet" href="/styles/main.css" />
  </noscript>
</head>
```

### Loại bỏ CSS không dùng với PurgeCSS

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer'),
    // PurgeCSS loại bỏ CSS không dùng đến
    process.env.NODE_ENV === 'production' && require('@fullhuman/postcss-purgecss')({
      content: [
        './src/**/*.{js,jsx,ts,tsx}',
        './public/index.html',
      ],
      defaultExtractor: (content) => {
        // Giữ lại class có dạng: class-name, hover:class-name
        return content.match(/[\w-/:]+(?<!:)/g) || [];
      },
      // Safelist: CSS class được generate động
      safelist: {
        standard: [/^modal-/, /^tooltip-/, /^animate-/],
        deep: [/^data-theme/],
      },
    }),
  ],
};
```

## Tối ưu JavaScript

### Tree Shaking — Loại bỏ dead code

```javascript
// utils.js — export nhiều function
export function formatDate(date) {
  return new Intl.DateTimeFormat('vi-VN').format(date);
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

export function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, '-');
}

// page.js — chỉ import function cần dùng
// Tree shaking sẽ loại bỏ formatCurrency và slugify khỏi bundle
import { formatDate } from './utils';
```

**Điều kiện để tree shaking hoạt động:**
- Dùng ES module (`import`/`export`), không phải CommonJS (`require`)
- Package phải có `"sideEffects": false` trong `package.json`
- Bundler (Webpack, Rollup, esbuild) phải ở production mode

```json
{
  "name": "my-library",
  "sideEffects": false
}
```

### Compression — Giảm kích thước transfer

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true, // Bật gzip compression (mặc định đã bật)

  // Tối ưu hình ảnh
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // Cache 30 ngày
  },

  // Tối ưu webpack
  webpack: (config, { isServer }) => {
    // Analyzer — xem bundle size
    if (process.env.ANALYZE) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer
            ? '../analyze/server.html'
            : './analyze/client.html',
        })
      );
    }
    return config;
  },
};

module.exports = nextConfig;
```

## CDN — Content Delivery Network

### CDN hoạt động thế nào?

```
Không có CDN:
User ở Việt Nam → Server ở Mỹ (200ms latency mỗi request)

Có CDN:
User ở Việt Nam → Edge server ở Singapore (20ms latency)
                   ↓ (cache miss)
                   Origin server ở Mỹ (lần đầu tiên)
```

### Cấu hình CDN headers

```
# Nginx — cấu hình cache cho static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
    add_header Vary "Accept-Encoding";
}

# HTML pages — không cache lâu
location ~* \.html$ {
    add_header Cache-Control "public, max-age=0, must-revalidate";
}
```

## Caching Strategies

### Cache-Control Headers

```
# Static assets có hash trong filename — cache vĩnh viễn
# Ví dụ: app.a1b2c3.js
Cache-Control: public, max-age=31536000, immutable

# HTML pages — luôn validate lại
Cache-Control: public, max-age=0, must-revalidate

# API responses — cache ngắn
Cache-Control: public, max-age=60, s-maxage=300

# Dữ liệu nhạy cảm — không cache
Cache-Control: private, no-store
```

| Directive | Ý nghĩa |
|-----------|---------|
| `public` | CDN và browser đều có thể cache |
| `private` | Chỉ browser cache, CDN không cache |
| `max-age` | Thời gian cache tính bằng giây |
| `s-maxage` | max-age riêng cho CDN/proxy |
| `immutable` | Nội dung không bao giờ thay đổi |
| `must-revalidate` | Phải kiểm tra lại khi hết hạn |
| `no-store` | Tuyệt đối không cache |

### Service Worker Cache

```javascript
// service-worker.js
const CACHE_NAME = 'my-site-v1';
const PRECACHE_URLS = [
  '/',
  '/styles/main.css',
  '/scripts/app.js',
  '/images/logo.svg',
];

// Install: Pre-cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

// Fetch: Cache-first cho static, network-first cho API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/')) {
    // API calls: Network first, fallback to cache
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
  } else {
    // Static assets: Cache first, fallback to network
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
  }
});

// Activate: Xóa cache cũ
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
});
```

## Đo lường và phân tích

### Lighthouse CI trong pipeline

```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000/", "http://localhost:3000/blog"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "first-contentful-paint": ["warn", { "maxNumericValue": 1500 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }]
      }
    }
  }
}
```

```bash
# Chạy Lighthouse CI
npm install -g @lhci/cli
lhci autorun --config=lighthouserc.json
```

### Bundle Size Analysis

```bash
# Next.js: xem bundle size
ANALYZE=true npm run build

# Webpack: xem tổng size
npx webpack --profile --json > stats.json
npx webpack-bundle-analyzer stats.json
```

## Lỗi thường gặp

1. **Tối ưu quá sớm (premature optimization)** — Chưa đo lường đã tối ưu, lãng phí thời gian vào chỗ không bottleneck
2. **Bundle tất cả vào 1 file** — Không code splitting, user tải 2MB JS cho trang chỉ cần 100KB
3. **Dùng `import *` thay vì named import** — Tree shaking không hoạt động khi import toàn bộ module
4. **Quên set Cache-Control cho static assets** — Browser phải tải lại CSS/JS mỗi lần visit
5. **Load font từ Google Fonts không preconnect** — Thêm 1-2 giây delay không cần thiết
6. **Inline quá nhiều CSS** — Critical CSS nên dưới 14KB (1 TCP round trip), inline cả file CSS 100KB là phản tác dụng
7. **Dùng `async` cho script phụ thuộc nhau** — `async` không đảm bảo thứ tự, dùng `defer` nếu script A phụ thuộc script B

## Câu hỏi phỏng vấn

### Câu 1: Giải thích Critical Rendering Path. Tại sao CSS được gọi là render-blocking?

**Trả lời:**
Critical Rendering Path là chuỗi bước browser thực hiện để chuyển HTML, CSS, JS thành pixel trên màn hình: Parse HTML thành DOM, parse CSS thành CSSOM, kết hợp thành Render Tree, rồi Layout và Paint. CSS là render-blocking vì browser phải xây dựng CSSOM hoàn chỉnh trước khi tạo Render Tree — nếu thiếu CSSOM, browser không biết element nào visible, kích thước bao nhiêu, nên nó chờ. Giải pháp: inline critical CSS, preload CSS file, dùng media query để tải CSS có điều kiện (ví dụ `media="print"` cho print stylesheet).

### Câu 2: So sánh `defer` vs `async` khi load JavaScript. Khi nào dùng cái nào?

**Trả lời:**
Cả hai đều tải JS song song với HTML parsing (không chặn parser). Khác biệt: `defer` chạy JS sau khi HTML parse xong và giữ nguyên thứ tự các script; `async` chạy ngay khi JS tải xong (có thể giữa lúc parse HTML) và không đảm bảo thứ tự. Dùng `defer` cho application code (React bundle, utility libraries) cần thứ tự chính xác. Dùng `async` cho script độc lập (analytics, A/B testing, ads) không phụ thuộc nhau và không phụ thuộc DOM.

### Câu 3: Tree Shaking là gì? Điều kiện nào để tree shaking hoạt động?

**Trả lời:**
Tree shaking là kỹ thuật loại bỏ code không được import (dead code) khỏi production bundle. Điều kiện: (1) dùng ES Module syntax (`import`/`export`) thay vì CommonJS (`require`/`module.exports`), vì ES Module cho phép static analysis; (2) package phải khai báo `"sideEffects": false` trong `package.json` hoặc liệt kê cụ thể file có side effects; (3) bundler phải ở production mode; (4) import cụ thể (`import { map } from 'lodash-es'`) thay vì import toàn bộ (`import _ from 'lodash'`).

### Câu 4: Service Worker cache strategy nào phù hợp cho static assets? Cho API calls?

**Trả lời:**
Static assets (JS, CSS, images, fonts): dùng **Cache First** — kiểm tra cache trước, chỉ fetch network nếu cache miss. Vì static assets có content hash trong filename, khi code thay đổi thì filename thay đổi, tự động bypass cache. API calls: dùng **Network First** — luôn fetch từ server, nếu offline thì fallback về cache. Một số API ít thay đổi (danh sách tỉnh/thành, cấu hình) có thể dùng **Stale While Revalidate** — trả về cache ngay, đồng thời fetch network để update cache cho lần sau.

### Câu 5: Trang web tải 2MB JavaScript. Bạn sẽ tối ưu như thế nào?

**Trả lời:**
Quy trình: (1) Phân tích bundle bằng webpack-bundle-analyzer để tìm module nặng nhất; (2) Code split theo route — mỗi trang chỉ tải JS cần thiết; (3) Lazy load component nặng (charts, editors, maps) bằng `React.lazy` hoặc `dynamic import`; (4) Thay thế library nặng (moment.js 300KB thành date-fns 20KB, lodash thành lodash-es với tree shaking); (5) Bật compression (gzip/brotli) giảm transfer size 60-80%; (6) Kiểm tra và loại bỏ polyfill không cần thiết nếu chỉ hỗ trợ browser hiện đại.
