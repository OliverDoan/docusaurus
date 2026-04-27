---
sidebar_position: 3
title: "3. Core Web Vitals, Bundle Analysis, Lazy Loading"
---

# Core Web Vitals, Bundle Analysis, Lazy Loading

Performance là một trong những chủ đề mà interviewer Senior rất thích hỏi, vì nó đòi hỏi hiểu biết sâu về browser, bundler, network, và cách chúng tương tác với nhau. Bài này cover từ metrics đo lường đến các chiến lược tối ưu thực tế.

---


---

## Mục lục

- [Câu 1: Core Web Vitals là gì? Đo bằng cách nào? `[Intermediate]`](#câu-1-core-web-vitals-là-gì-đo-bằng-cách-nào-intermediate)
- [Câu 2: Bundle analysis -- làm sao biết bundle quá lớn ở đâu? `[Intermediate]`](#câu-2-bundle-analysis-làm-sao-biết-bundle-quá-lớn-ở-đâu-intermediate)
- [Câu 3: Tree shaking hoạt động như thế nào? `[Intermediate]`](#câu-3-tree-shaking-hoạt-động-như-thế-nào-intermediate)
- [Câu 4: Code splitting strategies -- khi nào split, split ở đâu? `[Senior]`](#câu-4-code-splitting-strategies-khi-nào-split-split-ở-đâu-senior)
- [Câu 5: Image optimization -- best practices hiện đại? `[Intermediate]`](#câu-5-image-optimization-best-practices-hiện-đại-intermediate)
- [Câu 6: Font optimization -- tại sao font gây layout shift? `[Intermediate]`](#câu-6-font-optimization-tại-sao-font-gây-layout-shift-intermediate)
- [Lỗi thường gặp khi trả lời](#lỗi-thường-gặp-khi-trả-lời)

---

## Câu 1: Core Web Vitals là gì? Đo bằng cách nào? `[Intermediate]`

### Giải thích lý thuyết

**Core Web Vitals** là bộ 3 metrics của Google đo lường trải nghiệm người dùng thực tế:

1. **LCP (Largest Contentful Paint)**: Thời gian render element lớn nhất trong viewport. Đo **loading performance**. Target: dưới 2.5 giây.

2. **INP (Interaction to Next Paint)**: Thời gian từ lúc user tương tác (click, tap, keypress) đến lúc browser paint kết quả. Đo **responsiveness**. Target: dưới 200ms. (INP thay thế FID từ tháng 3/2024).

3. **CLS (Cumulative Layout Shift)**: Tổng layout shift bất ngờ trong suốt page lifecycle. Đo **visual stability**. Target: dưới 0.1.

### Bảng tổng hợp Core Web Vitals

| Metric | Đo cái gì | Good | Needs Improvement | Poor |
|--------|-----------|------|-------------------|------|
| **LCP** | Loading speed | ≤ 2.5s | 2.5s - 4s | > 4s |
| **INP** | Responsiveness | ≤ 200ms | 200ms - 500ms | > 500ms |
| **CLS** | Visual stability | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |

### Code ví dụ

**Đo Core Web Vitals bằng web-vitals library:**

```typescript
// utils/web-vitals.ts
import { onLCP, onINP, onCLS, type Metric } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  const body = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,     // 'good' | 'needs-improvement' | 'poor'
    delta: metric.delta,       // Thay đổi so với lần đo trước
    id: metric.id,             // Unique ID cho mỗi metric instance
    navigationType: metric.navigationType,
  };

  // Gửi lên analytics service
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics', JSON.stringify(body));
  } else {
    fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify(body),
      keepalive: true,
    });
  }
}

// Đăng ký đo
onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);
```

**Fix LCP -- preload critical resources:**

```html
<!-- Preload hero image (LCP element phổ biến nhất) -->
<link
  rel="preload"
  as="image"
  href="/hero-image.webp"
  fetchpriority="high"
/>

<!-- Preload critical font -->
<link
  rel="preload"
  as="font"
  href="/fonts/Inter-Bold.woff2"
  type="font/woff2"
  crossorigin
/>
```

**Fix CLS -- reserve space cho dynamic content:**

```css
/* Luôn set dimensions cho images */
img {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;  /* Reserve space trước khi load */
}

/* Skeleton placeholder cho async content */
.card-skeleton {
  min-height: 200px;  /* Reserve space */
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

**Fix INP -- defer non-critical work:**

```typescript
// Defer heavy computation khỏi main thread
function handleSearch(query: string) {
  // BAD: Block main thread
  // const results = expensiveFilter(allProducts, query);
  // setResults(results);

  // GOOD: Dùng startTransition để không block input
  startTransition(() => {
    const results = expensiveFilter(allProducts, query);
    setResults(results);
  });
}

// Hoặc dùng requestIdleCallback cho non-urgent work
function trackAnalytics(event: AnalyticsEvent) {
  requestIdleCallback(() => {
    sendToAnalytics(event);
  });
}
```

### Đáp án mẫu

> "Core Web Vitals gồm LCP (loading -- dưới 2.5s), INP (responsiveness -- dưới 200ms), và CLS (stability -- dưới 0.1). Để improve LCP, tôi preload critical resources, optimize images, và dùng SSR/SSG. Với INP, tôi dùng startTransition cho heavy updates, break long tasks, và tránh synchronous operations trong event handlers. CLS fix bằng cách luôn set dimensions cho images/ads và dùng skeleton placeholders. Tôi đo bằng web-vitals library gửi lên custom analytics, kết hợp Chrome UX Report cho field data."

---

## Câu 2: Bundle analysis -- làm sao biết bundle quá lớn ở đâu? `[Intermediate]`

### Giải thích lý thuyết

**Bundle analysis** là quá trình kiểm tra xem JavaScript bundle chứa những gì, module nào chiếm bao nhiêu space. Đây là bước đầu tiên trước khi optimize -- bạn phải biết vấn đề ở đâu trước khi fix.

### Code ví dụ

**webpack-bundle-analyzer:**

```bash
# Install
npm install --save-dev webpack-bundle-analyzer

# Tạo stats file
npx webpack --json > stats.json

# Visualize
npx webpack-bundle-analyzer stats.json
```

```javascript
// webpack.config.js
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',       // Tạo HTML report
      reportFilename: 'bundle-report.html',
      openAnalyzer: false,
    }),
  ],
};
```

**Next.js bundle analysis:**

```bash
# Install
npm install --save-dev @next/bundle-analyzer

# Chạy analysis
ANALYZE=true npm run build
```

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // next config...
});
```

**Import cost awareness -- các thư viện "nặng" phổ biến:**

```typescript
// BAD: Import cả lodash (71KB gzipped)
import _ from 'lodash';
const result = _.get(obj, 'a.b.c');

// GOOD: Import chỉ function cần (2KB)
import get from 'lodash/get';
const result = get(obj, 'a.b.c');

// BETTER: Dùng native (0KB)
const result = obj?.a?.b?.c;

// BAD: Import cả moment.js (67KB gzipped + locales)
import moment from 'moment';

// GOOD: Dùng date-fns (tree-shakeable) hoặc dayjs (2KB)
import { format } from 'date-fns';
import dayjs from 'dayjs';
```

**Budget enforcement trong CI:**

```json
{
  "scripts": {
    "build": "next build",
    "analyze": "ANALYZE=true next build",
    "check-bundle": "bundlesize"
  },
  "bundlesize": [
    {
      "path": ".next/static/chunks/*.js",
      "maxSize": "250 kB",
      "compression": "gzip"
    }
  ]
}
```

### Đáp án mẫu

> "Tôi dùng webpack-bundle-analyzer (hoặc @next/bundle-analyzer cho Next.js) để visualize treemap -- nhìn ngay module nào chiếm nhiều space. Common culprits: lodash (nên import per-function hoặc dùng native), moment.js (thay bằng dayjs), và icon libraries (nên import specific icons). Tôi set bundle budget trong CI -- nếu bundle vượt 250KB gzipped thì build fail. Ngoài ra, tôi check import cost extension trong VS Code để awareness từ lúc code."

---

## Câu 3: Tree shaking hoạt động như thế nào? `[Intermediate]`

### Giải thích lý thuyết

**Tree shaking** là quá trình bundler loại bỏ code không được sử dụng (dead code elimination) dựa trên **ES module static analysis**.

Bundler phân tích `import`/`export` statements (static, không thay đổi runtime) để xác định function/variable nào thực sự được dùng, rồi loại bỏ phần còn lại.

**Điều kiện để tree shaking hoạt động:**
1. Dùng ES modules (`import`/`export`), không phải CommonJS (`require`/`module.exports`)
2. Package có `"sideEffects": false` trong `package.json`
3. Code không có side effects ở top-level
4. Bundler phải được config production mode

### Code ví dụ

**Tree-shakeable code:**

```typescript
// utils/math.ts (ES modules)
export function add(a: number, b: number): number {
  return a + b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

// app.ts -- chỉ import add
import { add } from './utils/math';
console.log(add(1, 2));

// Sau tree shaking: subtract và multiply bị loại bỏ khỏi bundle
```

**Không tree-shakeable (CommonJS):**

```javascript
// utils/math.js (CommonJS) -- KHÔNG tree-shake được
module.exports = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
};

// Bundler phải include cả object vì không biết property nào sẽ được access runtime
const math = require('./utils/math');
```

**Side effects ngăn tree shaking:**

```typescript
// BAD: Side effect ở top-level
import './polyfills';  // File này modify globals -- không thể remove

// BAD: Side effect trong module
export function add(a: number, b: number) {
  return a + b;
}

// Side effect: modify global object
window.mathUtils = { add };  // Bundler không dám remove module này

// GOOD: Mark package as side-effect-free
// package.json
{
  "name": "my-utils",
  "sideEffects": false  // Tell bundler: safe to tree-shake
}

// Hoặc mark specific files có side effects
{
  "sideEffects": [
    "*.css",
    "./src/polyfills.ts"
  ]
}
```

**Kiểm tra tree shaking có hoạt động:**

```bash
# Build và check bundle size
npm run build

# So sánh: import all vs import specific
# File A: import { Button } from '@mylib/ui'     --> 5KB
# File B: import * as UI from '@mylib/ui'         --> 50KB (nếu tree shaking fail)
```

### Đáp án mẫu

> "Tree shaking dựa trên ES modules static analysis -- bundler trace import/export graph, xác định code nào unreachable rồi loại bỏ. 3 điều kiện: dùng ES modules (không CommonJS), package khai báo sideEffects: false, và code không có top-level side effects. Thực tế hay gặp: import lodash cả bundle vì nó dùng CommonJS -- phải import lodash/get thay vì destructure. Tôi luôn verify tree shaking bằng bundle analyzer sau build."

---

## Câu 4: Code splitting strategies -- khi nào split, split ở đâu? `[Senior]`

### Giải thích lý thuyết

**Code splitting** chia JavaScript bundle thành nhiều chunks nhỏ, load on-demand thay vì load tất cả upfront. Mục tiêu: giảm **initial load time** bằng cách chỉ load code cần cho page hiện tại.

**3 chiến lược chính:**
1. **Route-based splitting**: Mỗi route là 1 chunk (phổ biến nhất)
2. **Component-based splitting**: Lazy load heavy components (charts, editors, modals)
3. **Library-based splitting**: Tách vendor code ra chunk riêng

### Code ví dụ

**Route-based splitting (React Router):**

```typescript
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load mỗi route
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Suspense>
  );
}
```

**Component-based splitting:**

```typescript
// Heavy component -- chỉ load khi cần
const ChartDashboard = lazy(() => import('./components/ChartDashboard'));
const MarkdownEditor = lazy(() => import('./components/MarkdownEditor'));
const PDFViewer = lazy(() => import('./components/PDFViewer'));

function DocumentPage({ type }: { type: 'chart' | 'markdown' | 'pdf' }) {
  return (
    <Suspense fallback={<Spinner />}>
      {type === 'chart' && <ChartDashboard />}
      {type === 'markdown' && <MarkdownEditor />}
      {type === 'pdf' && <PDFViewer />}
    </Suspense>
  );
}

// Prefetch khi user hover (anticipate navigation)
function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const prefetch = () => {
    // Trigger dynamic import để browser cache chunk
    if (to === '/dashboard') {
      import('./pages/Dashboard');
    }
  };

  return (
    <Link to={to} onMouseEnter={prefetch}>
      {children}
    </Link>
  );
}
```

**Webpack magic comments:**

```typescript
// Named chunks cho debugging
const Dashboard = lazy(() =>
  import(/* webpackChunkName: "dashboard" */ './pages/Dashboard')
);

// Prefetch hint -- load trong background khi browser idle
const Settings = lazy(() =>
  import(/* webpackPrefetch: true */ './pages/Settings')
);

// Preload hint -- load song song với current chunk
const CriticalFeature = lazy(() =>
  import(/* webpackPreload: true */ './components/CriticalFeature')
);
```

### Bảng so sánh các chiến lược

| Chiến lược | Khi nào dùng | Ưu điểm | Nhược điểm |
|-----------|-------------|---------|------------|
| **Route-based** | Luôn dùng (default) | Dễ implement, natural split point | Không optimize within-page |
| **Component-based** | Heavy components (charts, editors) | Giảm initial bundle đáng kể | Cần Suspense boundaries |
| **Vendor splitting** | Large dependencies | Cache tốt (vendor ít thay đổi) | Config phức tạp |
| **Prefetch** | Predictable navigation | No loading delay | Waste bandwidth nếu user không navigate |

### Đáp án mẫu

> "Tôi dùng 3 levels code splitting: route-based (mỗi page 1 chunk -- default), component-based (lazy load heavy widgets như chart, editor, PDF viewer), và vendor splitting (React, lodash vào vendor chunk riêng cho caching). Prefetch strategy: khi user hover nav link, trigger import() để browser pre-download chunk. Trong Next.js, route splitting là automatic. Key insight: code splitting giảm initial load nhưng tăng number of requests -- cần balance, đừng split quá granular."

---

## Câu 5: Image optimization -- best practices hiện đại? `[Intermediate]`

### Giải thích lý thuyết

Images thường chiếm **50-70% page weight**. Optimize images là cách nhanh nhất để improve Core Web Vitals, đặc biệt LCP.

**Hierarchy of image optimization:**
1. **Chọn format đúng**: WebP > JPEG cho photos, SVG cho icons/illustrations
2. **Responsive images**: Serve size phù hợp với viewport
3. **Lazy loading**: Chỉ load images trong viewport
4. **CDN + caching**: Serve từ edge locations

### Code ví dụ

**Next.js Image component (best practice):**

```typescript
import Image from 'next/image';

// Automatic optimization: resize, format conversion, lazy loading
function ProductCard({ product }: { product: Product }) {
  return (
    <div className="product-card">
      <Image
        src={product.imageUrl}
        alt={product.name}
        width={400}
        height={300}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        placeholder="blur"
        blurDataURL={product.blurHash}
        priority={false}  // true cho hero image (LCP element)
      />
      <h3>{product.name}</h3>
    </div>
  );
}

// Hero image -- priority loading (LCP element)
function HeroBanner() {
  return (
    <Image
      src="/hero.jpg"
      alt="Welcome banner"
      fill
      sizes="100vw"
      priority  // Preload, no lazy loading
      quality={85}
    />
  );
}
```

**Native HTML responsive images:**

```html
<!-- srcset + sizes cho responsive images -->
<img
  src="/product-800.jpg"
  srcset="
    /product-400.jpg 400w,
    /product-800.jpg 800w,
    /product-1200.jpg 1200w
  "
  sizes="(max-width: 640px) 100vw,
         (max-width: 1024px) 50vw,
         33vw"
  alt="Product photo"
  loading="lazy"
  decoding="async"
  width="800"
  height="600"
/>

<!-- picture element cho format fallback -->
<picture>
  <source srcset="/hero.avif" type="image/avif" />
  <source srcset="/hero.webp" type="image/webp" />
  <img src="/hero.jpg" alt="Hero image" width="1200" height="600" />
</picture>
```

**Lazy loading với Intersection Observer:**

```typescript
// Custom hook cho lazy loading
function useLazyImage(src: string) {
  const [loaded, setLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(undefined);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCurrentSrc(src);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }  // Start loading 200px before viewport
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return { imgRef, currentSrc, loaded, onLoad: () => setLoaded(true) };
}

function LazyImage({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const { imgRef, currentSrc, loaded, onLoad } = useLazyImage(src || '');

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      onLoad={onLoad}
      style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.3s' }}
      {...props}
    />
  );
}
```

### Bảng so sánh image formats

| Format | Compression | Transparency | Animation | Browser Support | Use Case |
|--------|------------|--------------|-----------|----------------|----------|
| **JPEG** | Lossy, tốt | Không | Không | 100% | Photos (fallback) |
| **PNG** | Lossless | Có | Không | 100% | Screenshots, logos |
| **WebP** | Lossy + Lossless | Có | Có | 97%+ | Photos (modern) |
| **AVIF** | Lossy, tốt nhất | Có | Có | 92%+ | Photos (next-gen) |
| **SVG** | Vector | Có | Có (SMIL) | 100% | Icons, illustrations |

### Đáp án mẫu

> "Image optimization theo 4 bước: format (WebP/AVIF với fallback JPEG), sizing (srcset + sizes cho responsive), loading (lazy loading cho below-fold, priority cho LCP element), và delivery (CDN + immutable cache). Trong Next.js, Image component handle hết. Quan trọng nhất cho CLS: luôn set width/height hoặc aspect-ratio để reserve space. Cho LCP: hero image phải có priority, preload hint, và fetch từ same domain (tránh DNS lookup)."

---

## Câu 6: Font optimization -- tại sao font gây layout shift? `[Intermediate]`

### Giải thích lý thuyết

Custom fonts là nguyên nhân phổ biến gây **CLS** (layout shift) và **LCP delay**. Khi font chưa load xong, browser hiển thị fallback font (system font), rồi swap sang custom font khi download xong -- gây text "nhảy" (FOUT -- Flash of Unstyled Text).

### Code ví dụ

**Preload critical fonts:**

```html
<head>
  <!-- Preload font file quan trọng nhất -->
  <link
    rel="preload"
    href="/fonts/Inter-Regular.woff2"
    as="font"
    type="font/woff2"
    crossorigin
  />

  <style>
    @font-face {
      font-family: 'Inter';
      src: url('/fonts/Inter-Regular.woff2') format('woff2');
      font-weight: 400;
      font-style: normal;
      font-display: swap;  /* Show fallback immediately, swap when loaded */
    }

    @font-face {
      font-family: 'Inter';
      src: url('/fonts/Inter-Bold.woff2') format('woff2');
      font-weight: 700;
      font-style: normal;
      font-display: swap;
    }
  </style>
</head>
```

**Giảm CLS với font-display và size-adjust:**

```css
/* Matching fallback font metrics để giảm layout shift */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Regular.woff2') format('woff2');
  font-display: swap;
}

/* Adjust fallback font để match custom font metrics */
@font-face {
  font-family: 'Inter Fallback';
  src: local('Arial');
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
  size-adjust: 107%;
}

body {
  font-family: 'Inter', 'Inter Fallback', sans-serif;
}
```

**Next.js font optimization (tự động):**

```typescript
// next/font tự động optimize: inline, preload, no layout shift
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### Bảng so sánh font-display values

| Value | Behavior | FOUT | FOIT | CLS Risk | Use Case |
|-------|----------|------|------|----------|----------|
| `swap` | Fallback ngay, swap khi ready | Có | Không | Trung bình | Text content (default) |
| `optional` | Fallback ngay, swap chỉ nếu cực nhanh | Ít | Không | Thấp nhất | Body text, CLS-critical |
| `block` | Invisible 3s, rồi fallback | Không | Có (3s) | Không | Icons, brand text |
| `fallback` | Invisible 100ms, swap trong 3s | Ít | Ít | Thấp | Balance giữa swap và block |
| `auto` | Browser quyết định | Tùy | Tùy | Tùy | Không recommend |

### Đáp án mẫu

> "Font optimization có 3 pillars: preload (tải font critical sớm), font-display: swap hoặc optional (hiển thị fallback ngay, không chờ), và size-adjust (match fallback font metrics với custom font để giảm layout shift). Trong Next.js, next/font handle tất cả -- inline CSS, preload, và auto-generate fallback font metrics. Tip: dùng font-display: optional cho body text (chấp nhận dùng fallback nếu font load chậm) và swap cho headings (vì shift heading ít gây CLS)."

---

## Lỗi thường gặp khi trả lời

1. **Nhầm FID với INP.** FID đã bị thay thế bởi INP từ tháng 3/2024. FID chỉ đo first interaction, INP đo toàn bộ interactions trong page lifecycle. Nếu còn nói FID, interviewer biết bạn chưa update.

2. **Nói "dùng lazy loading cho mọi images".** Hero image (LCP element) phải dùng `priority` / `fetchpriority="high"`, KHÔNG lazy load. Lazy load chỉ cho below-the-fold images.

3. **Chỉ nói lý thuyết, không nói đo lường.** Performance optimization phải bắt đầu bằng measurement (Lighthouse, web-vitals, bundle analyzer), không phải guess. Nếu không đo, không biết có improve hay không.

4. **Quên tree shaking yêu cầu ES modules.** Nhiều dev nghĩ `import { x } from 'library'` là đủ. Nhưng nếu library dùng CommonJS internally, tree shaking sẽ không hoạt động.

5. **Code split quá nhiều.** Mỗi chunk là 1 HTTP request. Nếu split thành 100 chunks nhỏ, waterfall latency sẽ tệ hơn 1 bundle lớn. Cần balance giữa initial size và number of requests.

6. **Không nhắc đến caching.** Bundle optimization không chỉ về size mà còn về caching. Vendor chunk ít thay đổi nên dùng long-term cache. App code thay đổi thường xuyên nên dùng content hash.
