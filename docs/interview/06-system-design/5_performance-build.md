---
sidebar_position: 5
title: "5. Performance & Build Optimization"
---

# Performance & Build Optimization

> *Câu hỏi performance ở Senior không phải "memoize React". Là **đo Core Web Vitals của user thật**, **tối ưu bundle**, **chọn build tool đúng**, và **cải thiện số liệu cụ thể** từ X xuống Y với justification.*

:::note[Ghi nhớ nhanh]

- ⭐ **`Core Web Vitals`** — 3 metric `LCP` (≤2.5s), `INP` (≤200ms), `CLS` (≤0.1); prioritize LCP → CLS → INP, mỗi cái có kỹ thuật fix riêng.
- ⭐ **Giảm bundle theo ROI** — `bundle analyzer` trước, rồi route code-splitting, cherry-pick import, thay lib nặng, lazy load, Server Component, browserslist.
- **Build tool** — Vite/Turbopack cho dev speed (ESM + Rust/Go), Webpack chỉ giữ cho legacy; `SWC` thay Babel nhanh 10-20x.
- **Resource hints** — `preconnect`/`dns-prefetch`/`preload`/`prefetch`/`modulepreload`; bẫy lớn là over-preload gây bandwidth contention → LCP tệ hơn.
- **CI build cache** — dep cache, Turbo remote cache, parallel jobs, test sharding, affected-only đưa 8 phút xuống dưới 2 phút.
- **CDN + performance budget** — layered cache (browser/edge/origin) với `stale-while-revalidate`; enforce budget qua `size-limit`, Lighthouse CI, và `p75` từ RUM (không chỉ lab).

:::

---

## Câu 1: Core Web Vitals — em optimize từng metric như thế nào? `[Senior]`

### Câu hỏi

> Lighthouse báo LCP 4.2s, INP 350ms, CLS 0.25. Em prioritize fix cái nào trước, làm gì cụ thể?

### Giải thích lý thuyết

3 Core Web Vitals (2024+):

| Metric  | Good     | Needs Improvement | Poor      | Đo gì                              |
| ------- | -------- | ----------------- | --------- | ---------------------------------- |
| **LCP** | ≤ 2.5s   | 2.5-4.0s          | dưới 4.0s | Largest element render khi nào     |
| **INP** | ≤ 200ms  | 200-500ms         | dưới 500ms| Interaction → paint tiếp theo      |
| **CLS** | ≤ 0.1    | 0.1-0.25          | dưới 0.25 | Layout shift accumulated           |

Prioritize:
- **LCP** ảnh hưởng perceived load — fix trước.
- **CLS** ảnh hưởng UX (user click nhầm vì element shift) — fix sớm, thường easy fix.
- **INP** ảnh hưởng responsiveness — phức tạp hơn, fix sau.

### Code minh hoạ

```typescript
// 1. LCP optimization
// Identify LCP element — Chrome DevTools > Performance > LCP marker
// Hoặc programmatic:
import { onLCP } from "web-vitals";
onLCP((metric) => {
  console.log("LCP element:", metric.entries[0].element);
  console.log("LCP value:", metric.value);
});

// Fix LCP — common patterns:

// (a) Preload LCP image
<head>
  <link
    rel="preload"
    as="image"
    href="/hero.avif"
    type="image/avif"
    fetchpriority="high"
    imagesrcset="/hero-mobile.avif 600w, /hero-desktop.avif 1200w"
    imagesizes="100vw"
  />
</head>

// (b) Modern image format
<Image
  src="/hero.jpg"
  width={1200}
  height={600}
  priority                    // Next.js: ưu tiên
  placeholder="blur"
  blurDataURL="..."
  fetchPriority="high"
/>

// (c) Remove render-blocking resources
// Critical CSS inline, non-critical async
<style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
<link rel="preload" href="/styles/main.css" as="style" onLoad="this.rel='stylesheet'" />

// (d) Server-side render LCP
// RSC trả HTML có LCP element ngay, không chờ JS

// 2. CLS optimization
// Identify shift source
import { onCLS } from "web-vitals";
onCLS((metric) => {
  metric.entries.forEach((entry) => {
    entry.sources?.forEach((source) => {
      console.log("Shifted node:", source.node);
      console.log("From:", source.previousRect, "To:", source.currentRect);
    });
  });
});

// Fix CLS — common causes:

// (a) Image without dimensions
<img src="/photo.jpg" alt="" />  // ❌ no size
<img src="/photo.jpg" width="400" height="300" alt="" />  // ✅
// Hoặc CSS aspect-ratio
<div style={{ aspectRatio: "4/3" }}>
  <img src="/photo.jpg" alt="" style={{ width: "100%", height: "100%" }} />
</div>

// (b) Font swap shift (FOUT)
// next/font với size-adjust tự handle
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], adjustFontFallback: true });

// (c) Dynamic content inject above existing content
// ❌ Banner sau khi page load đẩy content xuống
{showBanner && <Banner />}

// ✅ Reserve space hoặc render bottom
{showBanner && <Banner />}  // → render fixed position bottom
// hoặc placeholder reserved
<div style={{ minHeight: showBanner ? 80 : 0, transition: "min-height 0.3s" }}>
  {showBanner && <Banner />}
</div>

// (d) Ads / Embed iframe
<div style={{ minHeight: 250 }}>
  <AdSlot />
</div>

// 3. INP optimization
// Identify slow interaction
import { onINP } from "web-vitals";
onINP((metric) => {
  console.log("INP:", metric.value);
  console.log("Event:", metric.entries[0]);
});

// Fix INP:

// (a) Defer non-urgent update với useTransition
function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [pending, startTransition] = useTransition();

  return (
    <input
      value={query}
      onChange={(e) => {
        setQuery(e.target.value);          // urgent — input responsive
        startTransition(() => {
          setResults(filter(items, e.target.value)); // non-urgent
        });
      }}
    />
  );
}

// (b) Chunk heavy work + yield
async function processLargeList(items) {
  for (let i = 0; i < items.length; i += 100) {
    const chunk = items.slice(i, i + 100);
    chunk.forEach(process);
    await new Promise((r) => setTimeout(r, 0)); // yield to browser
  }
}

// Modern API
async function processWithScheduler(items) {
  for (const item of items) {
    if (navigator.scheduling?.isInputPending()) {
      await new Promise((r) => scheduler.postTask(r, { priority: "user-blocking" }));
    }
    process(item);
  }
}

// (c) Offload to Web Worker
// worker.js
self.onmessage = (e) => {
  const result = expensiveCompute(e.data);
  self.postMessage(result);
};

// main
const worker = new Worker("/worker.js");
worker.postMessage(data);
worker.onmessage = (e) => setResult(e.data);

// (d) Avoid forced layout
// ❌
elements.forEach((el) => {
  el.style.width = (el.offsetWidth + 10) + "px"; // read-write loop
});

// ✅ batch
const widths = elements.map((el) => el.offsetWidth); // all reads
elements.forEach((el, i) => {
  el.style.width = (widths[i] + 10) + "px"; // all writes
});
```

### Đáp án mẫu

> "Em prioritize **LCP** trước (4.2s là poor), rồi **CLS** (0.25 cao), rồi **INP**. **LCP fix**: identify LCP element qua DevTools Performance. Thường là hero image hoặc heading. Fix bằng `<link rel='preload' fetchpriority='high'>` cho image, dùng `next/image priority` (Next inject preload tự động), serve AVIF/WebP, **inline critical CSS** (không render-blocking external stylesheet), và đảm bảo LCP element được SSR (không chờ JS). Target 4.2s → 1.5s. **CLS fix**: identify shift source qua `PerformanceObserver` `layout-shift` entry. Top causes: image không có width/height (luôn set hoặc dùng `aspectRatio`), font swap (dùng `next/font` với `adjustFontFallback`), dynamic content inject above existing (reserve space hoặc render absolute). Target 0.25 → dưới 0.05. **INP fix** phức tạp hơn: identify slow event qua `PerformanceObserver` `event`. Defer non-urgent update với `useTransition`, chunk heavy work với `setTimeout(0)` hoặc `scheduler.yield()`, move CPU-intensive sang **Web Worker**, batch DOM read/write tránh layout thrashing. Target 350ms → dưới 150ms. Em luôn đo trước-sau với real user monitoring, không chỉ Lighthouse local."

---

## Câu 2: Bundle size từ 800KB → 200KB — em làm gì? `[Senior]`

### Câu hỏi

> Bundle JS production gzipped 800KB, mục tiêu 200KB. Strategy của em theo thứ tự ROI?

### Giải thích lý thuyết

ROI từ cao xuống thấp:

| Technique                       | Typical reduction | Effort      |
| ------------------------------- | ----------------- | ----------- |
| Route-based code splitting      | 30-50%            | Low         |
| Cherry-pick imports             | 10-20%            | Low         |
| Replace heavy libs              | 20-40%            | Medium      |
| Component-level lazy load       | 10-20%            | Low         |
| Tree-shake config               | 5-15%             | Low         |
| RSC (Next.js)                   | 20-40%            | High        |
| Browserslist modernize          | 5-10%             | Very Low    |
| Remove unused deps              | 5-15%             | Low         |

### Code minh hoạ

```bash
# Step 0: Analyze
# Next.js
ANALYZE=true pnpm build

# Vite
pnpm vite build --mode=analyze
# Hoặc rollup-plugin-visualizer

# Xem báo cáo HTML — biết ai chiếm chỗ
```

```javascript
// Step 1: Route-based code splitting (LARGEST WIN)
// Next.js App Router — tự động split per route ✅
// React + Vite — dùng React.lazy

const Dashboard = lazy(() => import("./Dashboard"));
const Settings = lazy(() => import("./Settings"));

<Suspense fallback={<Spinner />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/settings" element={<Settings />} />
  </Routes>
</Suspense>
```

```javascript
// Step 2: Cherry-pick imports
// ❌ Import nguyên thư viện
import _ from "lodash";                // 70KB
import * as MUI from "@mui/material";  // 200KB+
import moment from "moment";           // 90KB
import { Button } from "antd";         // bundled antd

// ✅ Cherry-pick
import debounce from "lodash/debounce";       // 5KB
import Button from "@mui/material/Button";    // 15KB
import { format } from "date-fns";            // 5KB

// Step 3: Modularize imports (next.config.js)
module.exports = {
  modularizeImports: {
    "lodash": {
      transform: "lodash/{{member}}",
    },
    "@mui/icons-material": {
      transform: "@mui/icons-material/{{member}}",
    },
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@mui/material",
      "date-fns",
      "lodash",
    ],
  },
};
```

```javascript
// Step 4: Replace heavy libs
// moment (90KB) → date-fns hoặc dayjs
- import moment from "moment";
+ import { format, addDays } from "date-fns";
// hoặc
+ import dayjs from "dayjs";

// axios (~15KB) → fetch native (0KB)
- import axios from "axios";
- const data = await axios.get(url).then(r => r.data);
+ const data = await fetch(url).then(r => r.json());

// uuid → crypto.randomUUID
- import { v4 } from "uuid";
+ crypto.randomUUID();

// chart.js (~200KB) → lightweight alternative cho simple chart
// Chỉ dùng full chart lib khi cần feature đầy đủ

// lodash → native ES + small util
// _.get(obj, "a.b.c") → obj?.a?.b?.c
// _.cloneDeep(obj) → structuredClone(obj)
// _.isEqual(a, b) → fast-deep-equal (1KB) hoặc tự viết
```

```javascript
// Step 5: Component-level lazy load
function App() {
  const [showChart, setShowChart] = useState(false);

  return (
    <>
      <button onClick={() => setShowChart(true)}>Show analytics</button>
      {showChart && (
        <Suspense fallback={<Skeleton />}>
          <LazyChart />
        </Suspense>
      )}
    </>
  );
}

const LazyChart = lazy(() => import("./Chart"));

// Conditional polyfill
async function setupApp() {
  if (!window.IntersectionObserver) {
    await import("intersection-observer");
  }
}
```

```javascript
// Step 6: Server Component (Next.js App Router)
// Trước:
"use client";
import { marked } from "marked";          // 50KB
import DOMPurify from "dompurify";        // 20KB

function Article({ markdown }) {
  const html = DOMPurify.sanitize(marked(markdown));
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
// → marked + dompurify ship xuống client

// Sau: Server Component
async function Article({ markdown }) {
  // Render server, lib không trong client bundle
  const html = DOMPurify.sanitize(marked(markdown));
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
// → Client chỉ nhận HTML string, không có marked/dompurify
```

```javascript
// Step 7: Browserslist modernize
// package.json
"browserslist": [
  "last 2 Chrome versions",
  "last 2 Safari versions",
  "last 2 Firefox versions",
  "not IE 11"
]
// → SWC/Babel emit ES2022+ code (không polyfill cho IE)
// Bundle nhỏ hơn ~10-15%

// Step 8: Remove unused deps
pnpm dlx depcheck
# Liệt kê deps trong package.json không được import

pnpm dlx knip
# Tìm unused export, dead code

# Manual review trước khi remove
```

```javascript
// Verify final bundle
// Next.js
First Load JS shared by all
├ chunks/main-app.js               80 kB
├ chunks/webpack.js                3 kB
└ other shared chunks (total)      5 kB

Route (app)                        Size       First Load JS
┌ ○ /                             1.2 kB      150 kB
├ ○ /dashboard                    4.5 kB      180 kB
└ λ /api/...                      0 B         0 B
```

### Đáp án mẫu

> "Theo ROI: thứ nhất **bundle analyzer** chạy trước, biết ai chiếm. Sau đó action: (1) **Route-based code splitting** — App Router tự, Vite dùng `React.lazy`. Giảm 30-50% initial. (2) **Cherry-pick imports** — `lodash/debounce` thay `import _ from 'lodash'`. Combined với `modularizeImports` config tự transform. (3) **Replace heavy libs**: `moment` 90KB → `date-fns` 5KB thực dùng; `axios` → fetch native; `uuid` → `crypto.randomUUID()`. (4) **Lazy load component** heavy (Editor, Chart, PDF Viewer) chỉ load khi user trigger. (5) **Convert Client to Server Component** với Next.js App Router — `marked` + `DOMPurify` (~70KB) khỏi client bundle khi render markdown trên server. (6) **Browserslist modernize** — target Chrome/Safari 2 versions, không IE → SWC emit ES2022+, giảm polyfill ~10%. (7) **Remove unused deps** với `knip` và `depcheck`. Real story: app em đã làm 800KB → 180KB chỉ với 5 thay đổi đầu — phần lớn là remove moment, lazy load chart, route split. RSC chuyển sau khi migrate App Router stable."

---

## Câu 3: Webpack vs Vite vs Turbopack — chọn cái nào? `[Senior]`

### Câu hỏi

> Em start project mới. Webpack, Vite, hay Turbopack? Tradeoff?

### Giải thích lý thuyết

| Tool          | Dev speed             | Prod build           | Ecosystem | Use case                       |
| ------------- | --------------------- | -------------------- | --------- | ------------------------------ |
| **Webpack**   | Slow (full bundle)    | Mature, slow         | Lớn nhất  | Legacy, complex config         |
| **Vite**      | Cực nhanh (ESM dev)   | Rollup-based         | Lớn       | Vue/Svelte/React SPA           |
| **Turbopack** | Cực nhanh (Rust)      | Beta-Stable Next 16+ | Đang phát triển | Next.js mới                  |
| **Bun**       | Nhanh (native bundler)| Beta                 | Mới       | Server-side, bundle quick      |
| **esbuild**   | Cực nhanh (Go)        | Lib bundling chính   | Lib       | Used by Vite/tsup              |
| **Rolldown**  | Cực nhanh (Rust)      | Beta                 | Vite v6+  | Future Vite default            |

Tradeoff cốt lõi:
- **Dev speed**: Vite/Turbopack dùng ESM native + Rust/Go → cold start dưới 1s, HMR dưới 100ms.
- **Webpack dev** với HMR có thể tốn nhiều giây khi app to.
- **Prod build**: cần đảm bảo correctness — Webpack mature nhất, Vite (Rollup) tốt, Turbopack đang catch up.

### Code minh hoạ

```typescript
// Vite project
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: { "/api": "http://localhost:8080" },
  },
  build: {
    target: "es2022",
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          // Chia vendor chunk riêng cho cache
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom"], // pre-bundle để dev fast
  },
});
```

```javascript
// Next.js Turbopack
// package.json
"scripts": {
  "dev": "next dev --turbo",
  "build": "next build"  // Turbopack build stable Next 16+
}

// next.config.js — Turbopack-specific
module.exports = {
  experimental: {
    turbo: {
      rules: {
        "*.svg": ["@svgr/webpack"],
      },
    },
  },
};
```

```javascript
// Webpack — vẫn dùng cho legacy / complex setup
// webpack.config.js
module.exports = {
  entry: "./src/index.tsx",
  output: {
    filename: "[name].[contenthash].js",
    clean: true,
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: "swc-loader" }, // SWC thay Babel — nhanh hơn 10-20x
    ],
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
        },
      },
    },
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new BundleAnalyzerPlugin({ analyzerMode: "static" }),
  ],
};
```

### Đáp án mẫu

> "Dự án mới em chọn tuỳ stack. **Next.js** → Turbopack (dev `--turbo`, build Turbopack stable Next 16+). Cold start dưới 500ms, HMR ngon. **React SPA / Vue / Svelte** → Vite. Vite chín muồi, ecosystem plugin phong phú, Rolldown sẽ replace Rollup làm production build trong v6+ → đỡ chậm prod build. **Library / package** → tsup hoặc unbuild — wrap esbuild, output đa format (CJS+ESM+DTS) tự động. **Webpack** em chỉ giữ cho **legacy** đã có config phức tạp — migrate sang Vite/Turbopack tốn effort không justify nếu app đang work. Tradeoff thực tế: Vite/Turbopack dev experience vô địch (HMR dưới 100ms vs Webpack vài giây) — productivity team tăng hẳn. Prod build correctness Webpack vẫn mature nhất với edge case (CSS extraction, polyfill, dynamic require), Vite sau, Turbopack đang catch up. **SWC** thay Babel cho mọi tool — TypeScript transform nhanh hơn 10-20x. Em không chạy Babel trừ khi cần plugin Babel-only như Emotion compiler."

---

## Câu 4: Resource hints chiến lược `[Senior]`

### Câu hỏi

> `preload`, `prefetch`, `preconnect`, `dns-prefetch`, `modulepreload` — khi nào dùng cái nào?

### Giải thích lý thuyết

| Hint               | Khi nào dùng                                                | Priority |
| ------------------ | ----------------------------------------------------------- | -------- |
| `preconnect`       | Thiết lập connection (DNS+TCP+TLS) cho origin sắp dùng     | High     |
| `dns-prefetch`     | Chỉ resolve DNS (fallback của preconnect cho old browser)  | Low      |
| `preload`          | Tải resource quan trọng cho current page                   | High     |
| `prefetch`         | Tải resource cho navigation tương lai (low priority)       | Low      |
| `modulepreload`    | Preload ES module + dependencies                            | High     |

### Code minh hoạ

```html
<head>
  <!-- 1. preconnect: third-party domain sẽ dùng -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://api.example.com" crossorigin />
  <link rel="preconnect" href="https://cdn.example.com" />

  <!-- dns-prefetch: fallback cho browser cũ -->
  <link rel="dns-prefetch" href="https://analytics.example.com" />

  <!-- 2. preload: critical resource cho current page -->
  <!-- LCP image -->
  <link
    rel="preload"
    as="image"
    href="/hero.avif"
    type="image/avif"
    fetchpriority="high"
  />

  <!-- Critical font -->
  <link
    rel="preload"
    as="font"
    href="/fonts/inter-bold.woff2"
    type="font/woff2"
    crossorigin
  />

  <!-- Critical CSS -->
  <link rel="preload" as="style" href="/styles/critical.css" />

  <!-- 3. modulepreload: ES module + dependencies -->
  <link rel="modulepreload" href="/_next/static/chunks/main.js" />

  <!-- 4. prefetch: resource cho navigation tương lai -->
  <link rel="prefetch" href="/dashboard" as="document" />
  <link rel="prefetch" as="script" href="/_next/static/chunks/dashboard.js" />
</head>
```

```jsx
// Next.js auto resource hint
import Link from "next/link";

// next/link tự prefetch route khi link visible trong viewport
<Link href="/dashboard" prefetch>Dashboard</Link>

// Hover-based prefetch (giảm waste)
<Link href="/dashboard" prefetch={false} onMouseEnter={() => prefetch("/dashboard")}>
  Dashboard
</Link>

// Image với priority
<Image src="/hero.jpg" priority />
// Next tự inject <link rel="preload" as="image" fetchpriority="high">

// next/font tự preload
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
// Next inject <link rel="preload" as="font" crossorigin>

// Dynamic preload qua JS
function PrefetchOnIdle({ urls }) {
  useEffect(() => {
    if (!("requestIdleCallback" in window)) return;
    requestIdleCallback(() => {
      urls.forEach((url) => {
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = url;
        document.head.appendChild(link);
      });
    });
  }, [urls]);
  return null;
}

// Predictive prefetch dựa ML user behavior — Quicklink lib
import { listen } from "quicklink";
listen({
  // Prefetch link trong viewport khi user idle
  origins: ["example.com"],
  ignores: [/\/api\//, /#$/],
});
```

```typescript
// Bẫy: over-preload
// Quá nhiều preload → cạnh tranh bandwidth với critical resource
// → LCP TỆ HƠN

// ❌ Anti-pattern: preload everything
<link rel="preload" as="image" href="/hero.jpg" />
<link rel="preload" as="image" href="/photo1.jpg" />
<link rel="preload" as="image" href="/photo2.jpg" />
<link rel="preload" as="image" href="/photo3.jpg" />
<link rel="preload" as="script" href="/script1.js" />
<link rel="preload" as="script" href="/script2.js" />
// → Bandwidth contention, không có gì ưu tiên

// ✅ Chỉ preload TOP 1-2 critical resource
// LCP image + critical font
// Còn lại để browser scheduler tự quyết
```

### Đáp án mẫu

> "5 hint khác nhau, em dùng chiến lược cụ thể. **`preconnect`**: third-party origin mà em **chắc chắn** sẽ request sớm — Google Fonts, API, CDN. Setup DNS+TCP+TLS handshake trước → giảm RTT ~100-300ms. **`dns-prefetch`**: chỉ resolve DNS, dùng cho domain less critical hoặc fallback browser cũ. **`preload`**: resource **critical cho current page**, đặc biệt LCP image (`as='image' fetchpriority='high'`) và critical font (`as='font' crossorigin`). KHÔNG preload tất cả image — bandwidth contention làm tệ hơn. Em chỉ preload 1-2 resource quan trọng nhất. **`modulepreload`**: ES module + dependencies — browser tự load transitive dep. **`prefetch`**: navigation tương lai, low priority — Next.js `<Link prefetch>` tự handle khi link visible viewport. Trong production em làm hover-based prefetch cho route ít visit (tránh waste bandwidth), và **predictive prefetch** với Quicklink lib cho route được visit thường xuyên. Bẫy lớn nhất: **over-preload** — cạnh tranh bandwidth với LCP → LCP tệ hơn. Quy tắc: preload tối đa 2-3 critical resource."

---

## Câu 5: Build optimization — caching strategy `[Senior]`

### Câu hỏi

> CI build em chậm — 8 phút mỗi PR. Em làm sao giảm xuống dưới 2 phút?

### Giải thích lý thuyết

Layers caching trong build:

1. **Dependency cache** — node_modules.
2. **Build cache** — Webpack/Turborepo persistent cache.
3. **Test cache** — chỉ chạy test affected files.
4. **Docker layer cache** — image build.
5. **Remote cache** — share giữa CI runners.

### Code minh hoạ

```yaml
# .github/workflows/ci.yml
name: CI
on: [pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2  # cần history cho turbo affected detection

      - uses: pnpm/action-setup@v3
        with: { version: 9 }

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm  # cache ~/.pnpm-store automatic

      # 1. Cache node_modules theo pnpm-lock hash
      - name: Get pnpm store directory
        id: pnpm-cache
        run: echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_OUTPUT

      - uses: actions/cache@v4
        with:
          path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: ${{ runner.os }}-pnpm-

      - run: pnpm install --frozen-lockfile --prefer-offline

      # 2. Turbo cache
      - uses: actions/cache@v4
        with:
          path: |
            .next/cache
            .turbo
            node_modules/.cache
          key: ${{ runner.os }}-build-${{ hashFiles('**/pnpm-lock.yaml') }}-${{ github.sha }}
          restore-keys: |
            ${{ runner.os }}-build-${{ hashFiles('**/pnpm-lock.yaml') }}-
            ${{ runner.os }}-build-

      # 3. Turborepo remote cache (cross-runner share)
      - run: pnpm turbo build
        env:
          TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
          TURBO_TEAM: ${{ vars.TURBO_TEAM }}

      # 4. Run only affected tests
      - run: pnpm turbo test --filter=...[origin/main]
```

```json
// turbo.json — task pipeline với cache
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**", "!.next/cache/**"],
      "inputs": ["src/**", "package.json", "next.config.js"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "inputs": ["src/**", "tests/**"]
    },
    "lint": {
      "outputs": []
    }
  },
  "globalDependencies": ["tsconfig.json", ".eslintrc.json"]
}
// Turbo hash inputs + dependencies → reuse output nếu hash match
```

```dockerfile
# Dockerfile multi-stage với cache mount
FROM node:20-alpine AS base
WORKDIR /app

# Cache deps layer
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile --prefer-offline

# Cache build layer
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN --mount=type=cache,target=/app/.next/cache \
    pnpm build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
CMD ["node", "server.js"]
```

```javascript
// next.config.js — optimize build
module.exports = {
  output: "standalone",  // smaller Docker image
  swcMinify: true,        // SWC minify thay Terser — 4x nhanh hơn
  experimental: {
    turbo: { ... },
    optimizePackageImports: ["@mui/material", "lucide-react"],
    parallelServerCompiles: true,
  },
  // Skip lint trong build (lint chạy riêng job parallel)
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },  // KHÔNG skip typecheck
};
```

```yaml
# Parallel jobs trong CI
jobs:
  lint:
    runs-on: ubuntu-latest
    steps: [...]

  typecheck:
    runs-on: ubuntu-latest
    steps: [...]

  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - run: pnpm test --shard=${{ matrix.shard }}/4
    # → test chia 4 shard chạy song song

  build:
    runs-on: ubuntu-latest
    steps: [...]

  e2e:
    needs: build
    steps: [...]
```

### Đáp án mẫu

> "8 phút → 2 phút theo strategy. **Step 1 — Cache deps**: cache `~/.pnpm-store` theo `pnpm-lock.yaml` hash, restore key fallback. `pnpm install --frozen-lockfile --prefer-offline` ăn cache là ~10s thay vì 2 phút. **Step 2 — Cache build artifacts**: `.next/cache`, `.turbo`, `node_modules/.cache` — Turborepo và Next.js đều tận dụng. **Step 3 — Turborepo Remote Cache** (Vercel hoặc self-host) — share cache giữa runners CI: nếu PR thứ 2 cùng commit, runner khác tải artifact từ remote, không build. Đây là game-changer cho monorepo. **Step 4 — Parallelize jobs**: lint + typecheck + build + test chạy song song thay vì sequential. **Step 5 — Test sharding**: `pnpm test --shard=N/4` chia test ra 4 shard matrix runner — test 4 phút → 1 phút. **Step 6 — Affected only**: với Turbo `--filter=...[origin/main]` chỉ chạy package changed. **Step 7 — SWC minify** thay Terser ở Next config — 4x nhanh hơn. **Step 8 — Docker cache mount** với BuildKit cho deps layer. Real result: project em đã apply → 8 phút → 1.5 phút. Trick lớn nhất: **remote cache + parallel jobs** combine."

---

## Câu 6: CDN strategy cho global app `[Senior]`

### Câu hỏi

> App em user toàn cầu. Em design CDN strategy thế nào?

### Giải thích lý thuyết

CDN responsibilities:

1. **Static assets** — JS/CSS/image — cached forever ở edge.
2. **HTML cache** — full page hoặc fragment, ISR.
3. **API response cache** — short TTL cho data public.
4. **Image optimization** — on-the-fly resize/format conversion.
5. **Edge functions** — auth check, A/B test, geo routing.
6. **DDoS protection** + WAF.

Provider:
- **Vercel** — tích hợp Next.js, edge function global.
- **Cloudflare** — robust DDoS, Workers, R2 storage.
- **CloudFront + S3** — AWS integration.
- **Fastly** — VCL flexible, advanced caching.

### Code minh hoạ

```javascript
// next.config.js — cache header per route type
module.exports = {
  async headers() {
    return [
      // Static assets có hash trong filename → immutable
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // User-uploaded images
      {
        source: "/uploads/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, s-maxage=31536000" },
        ],
      },
      // HTML page — cache CDN, revalidate browser
      {
        source: "/blog/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      // API user-specific
      {
        source: "/api/me",
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
      // API public data
      {
        source: "/api/posts",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=300",
          },
        ],
      },
    ];
  },
};
```

```typescript
// Cloudflare Worker — edge logic
export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    // 1. Geo routing
    const country = request.cf?.country;
    if (country === "VN" && !url.pathname.startsWith("/vi")) {
      return Response.redirect(`${url.origin}/vi${url.pathname}`, 302);
    }

    // 2. A/B test
    let variant = request.headers.get("cookie")?.match(/ab=([AB])/)?.[1];
    if (!variant) {
      variant = Math.random() < 0.5 ? "A" : "B";
      const res = await fetch(`${url.origin}/variant-${variant}${url.pathname}`);
      return new Response(res.body, {
        ...res,
        headers: { ...res.headers, "Set-Cookie": `ab=${variant}; Path=/; Max-Age=2592000` },
      });
    }

    // 3. Cache key custom
    const cache = caches.default;
    const cacheKey = new Request(url.toString() + `&variant=${variant}`, request);

    let response = await cache.match(cacheKey);
    if (response) return response;

    response = await fetch(request);

    // Edge cache
    if (response.status === 200) {
      const cacheable = response.clone();
      ctx.waitUntil(cache.put(cacheKey, cacheable));
    }

    return response;
  },
};
```

```typescript
// Vercel — image optimization tự động qua next/image
// CDN edge cache tự handle, không cần config tay

import Image from "next/image";

<Image
  src="/photo.jpg"
  width={1200}
  height={600}
  alt=""
  // Vercel serve qua /_next/image với resize on-the-fly
  // Cache 1 năm at edge
/>

// Hoặc Cloudinary
<img
  src="https://res.cloudinary.com/example/image/upload/w_1200,f_auto,q_auto/photo.jpg"
  alt=""
/>
// Cloudinary tự pick AVIF/WebP cho browser, resize, optimize quality
```

```typescript
// ISR + on-demand revalidation
// app/products/[id]/page.tsx
export default async function Product({ params }) {
  const product = await fetch(`https://api.example.com/products/${params.id}`, {
    next: {
      revalidate: 3600,           // 1h
      tags: [`product-${params.id}`, "products"],
    },
  }).then(r => r.json());

  return <ProductView product={product} />;
}

// app/api/webhook/route.ts
import { revalidateTag } from "next/cache";

export async function POST(req) {
  const { productId } = await req.json();
  // CMS publish → webhook → invalidate
  revalidateTag(`product-${productId}`);
  return Response.json({ revalidated: true });
}
```

### Đáp án mẫu

> "Em design layered cache. **Layer 1 — Browser cache**: HTML `max-age=0`, asset có hash `max-age=31536000, immutable`. **Layer 2 — CDN edge cache**: HTML với `s-maxage=3600, stale-while-revalidate=86400` — CDN serve cache 1h, sau đó vẫn serve stale + refresh background. **Layer 3 — Origin cache**: Next.js Data Cache cho fetch với `revalidate` + `tags`. **Layer 4 — DB query cache**: Redis cho expensive query. **CDN provider**: Vercel cho Next.js (Edge Functions global, Image Optimization integrated), Cloudflare cho separate static + Workers cho edge logic (geo routing, A/B test, rate limit). **Image**: Vercel Image hoặc Cloudinary với `f_auto,q_auto` — auto WebP/AVIF + quality phù hợp. **Static asset** với hash filename → `immutable` 1 năm — đổi nội dung tự đổi URL. **Edge function** cho: geo redirect, A/B test, auth check (verify JWT trên edge). **Invalidation**: tag-based — `revalidateTag('products')` invalidate mọi page tag đó. Plus CMS webhook → instant update. **DDoS/WAF**: Cloudflare WAF với rule custom + rate limit. Bonus: log cache hit ratio (Cloudflare analytics) — target dưới 90% cho static, 60-80% cho dynamic page."

---

## Câu 7: Performance budget và monitoring `[Senior]`

### Câu hỏi

> Em set performance budget cho team. Threshold gì, enforce thế nào?

### Giải thích lý thuyết

**Performance budget** = threshold cho metric, fail CI nếu vượt. Prevent regression.

Budget types:

| Budget                  | Threshold ví dụ          | Enforce ở đâu              |
| ----------------------- | ------------------------ | -------------------------- |
| Bundle size             | 200KB gzipped initial    | CI build                   |
| Lighthouse score        | Performance ≥ 90         | CI Lighthouse              |
| Core Web Vitals lab     | LCP ≤ 2.5s, INP ≤ 200ms  | CI Lighthouse              |
| Core Web Vitals field   | p75 LCP ≤ 2.5s           | Real User Monitoring       |
| Request count           | ≤ 50 requests per page   | Lighthouse                 |
| Time to Interactive     | ≤ 3.5s                   | Lighthouse                 |
| Error rate              | ≤ 0.1%                   | Sentry alert               |
| Build time              | ≤ 3 phút                 | CI script                  |

### Code minh hoạ

```yaml
# .github/workflows/perf-budget.yml
name: Performance Budget
on: [pull_request]

jobs:
  bundle-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install
      - run: pnpm build

      # size-limit check
      - uses: andresz1/size-limit-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: treosh/lighthouse-ci-action@v11
        with:
          urls: |
            https://my-app-preview.vercel.app/
            https://my-app-preview.vercel.app/dashboard
          uploadArtifacts: true
          temporaryPublicStorage: true
          configPath: ./lighthouserc.json
```

```json
// .size-limit.json
[
  {
    "name": "Initial JS",
    "path": ".next/static/chunks/main-*.js",
    "limit": "100 KB"
  },
  {
    "name": "Vendor JS",
    "path": ".next/static/chunks/framework-*.js",
    "limit": "80 KB"
  },
  {
    "name": "First load (homepage)",
    "path": [".next/static/chunks/main-*.js", ".next/static/chunks/pages/index-*.js"],
    "limit": "150 KB",
    "gzip": true
  }
]
```

```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:no-pwa",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["warn", { "minScore": 0.9 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "interaction-to-next-paint": ["error", { "maxNumericValue": 200 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["warn", { "maxNumericValue": 300 }]
      }
    }
  }
}
```

```typescript
// Real User Monitoring với web-vitals + custom analytics
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";

const ANALYTICS_URL = "https://api.example.com/analytics/vitals";

function reportVital(metric: any) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    url: location.pathname,
    timestamp: Date.now(),

    // Context
    connectionType: (navigator as any).connection?.effectiveType,
    deviceMemory: (navigator as any).deviceMemory,
    userAgent: navigator.userAgent,
  });

  // Use sendBeacon — non-blocking, survive page unload
  if (navigator.sendBeacon) {
    navigator.sendBeacon(ANALYTICS_URL, body);
  } else {
    fetch(ANALYTICS_URL, { body, method: "POST", keepalive: true });
  }
}

onLCP(reportVital);
onINP(reportVital);
onCLS(reportVital);
onFCP(reportVital);
onTTFB(reportVital);

// Backend aggregate
// Daily job: calculate p75 LCP/INP/CLS, alert nếu vượt threshold
```

```typescript
// Slack alert khi regression
// Cron daily
async function checkVitalsRegression() {
  const yesterday = await getMetrics({ date: yesterdayDate });
  const today = await getMetrics({ date: todayDate });

  for (const metric of ["lcp", "inp", "cls"]) {
    const regression = (today.p75[metric] - yesterday.p75[metric]) / yesterday.p75[metric];
    if (regression > 0.2) {  // 20% degradation
      await slack.send(`⚠️ ${metric.toUpperCase()} p75 regressed ${(regression * 100).toFixed(1)}%`);
    }
  }
}
```

### Đáp án mẫu

> "Em set budget multi-layer + enforce ở CI. **Bundle size**: `size-limit` action — initial JS ≤ 150KB gzipped, vendor ≤ 80KB. PR comment diff size từ main → reviewer thấy ngay impact. **Lighthouse CI**: `treosh/lighthouse-ci-action` chạy 3 runs, assert Performance ≥ 90, LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 — fail PR nếu vượt. Lab metric không phản ánh user thật nên thêm **RUM**: `web-vitals` lib gửi LCP/INP/CLS từ real user về backend, calculate **p75** (75th percentile — 75% user experience tốt hơn metric này). Cron daily compare p75 với hôm qua — Slack alert nếu regression dưới 20%. **Bonus segment**: emit metric kèm context (connection type, device memory, country) — phát hiện regression chỉ ảnh hưởng segment cụ thể (Android cũ, mạng 3G). **Build time budget**: 3 phút — CI job lưu time, alert nếu trend tăng. Em tránh: chase Lighthouse 100 score — diminishing return; bỏ qua p99 — outlier ảnh hưởng user thực sự đau; only lab metric — không phản ánh real user. Quy tắc: lab catch regression sớm (PR), RUM verify trên user thật."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                | Đúng là                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| "Memo mọi thứ để fast"                                 | Đo trước; memo là một technique, không bullet point đầu              |
| "Webpack đã chết, dùng Vite cho mọi project"           | Webpack vẫn mature; migrate có cost                                  |
| "Preload tất cả critical resource"                     | Over-preload gây bandwidth contention → LCP tệ hơn                    |
| "Cache 1 năm là an toàn"                               | Chỉ cho asset có hash; HTML/API cần invalidation strategy             |
| "Lighthouse 100 = user happy"                          | Lab khác RUM; user thật có thể vẫn slow                              |
| "Bundle nhỏ là tốt nhất"                               | Balance với UX — sometimes 1 file lớn tốt hơn nhiều file nhỏ vì HTTP overhead |
| "Cache hit ratio cao là good"                          | Cache stale data cũng gây bug; cần đo cùng error rate                |
