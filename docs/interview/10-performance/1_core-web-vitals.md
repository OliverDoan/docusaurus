---
sidebar_position: 1
title: "1. Core Web Vitals"
---

# Core Web Vitals

> *Performance là chủ đề mà interviewer dùng để phân biệt dev "làm cho chạy được" với dev "làm cho chạy nhanh". Core Web Vitals là ngôn ngữ chung — biết số, biết ngưỡng, biết cách đo là điểm cộng lớn.*

---

## Câu 1: Core Web Vitals là gì? Ba metrics chính là gì? `[Intermediate]`

### Câu hỏi

> Em giải thích Core Web Vitals là gì? Ba metrics chính hiện tại là gì và ngưỡng "tốt" của từng metric?

### Giải thích lý thuyết

**Core Web Vitals** là bộ metrics do Google định nghĩa để đo **trải nghiệm thực tế của user** trên trang web, tập trung vào 3 khía cạnh: tốc độ tải, độ phản hồi, và độ ổn định layout. Đây không chỉ là chỉ số kỹ thuật — Google dùng Core Web Vitals làm **ranking signal cho SEO**.

Ba metrics chính (từ tháng 3/2024, INP đã thay thế FID):

| Metric | Đo cái gì | Tốt | Cần cải thiện | Kém |
| ------ | --------- | --- | ------------- | ---- |
| **LCP** (Largest Contentful Paint) | Tốc độ tải — thời gian render phần tử content lớn nhất trong viewport | ≤ 2.5s | 2.5s – 4s | > 4s |
| **INP** (Interaction to Next Paint) | Độ phản hồi — độ trễ từ lúc user tương tác (click, tap, gõ phím) đến frame tiếp theo được paint | ≤ 200ms | 200ms – 500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | Độ ổn định visual — tổng điểm các lần layout bị "nhảy" ngoài ý muốn | ≤ 0.1 | 0.1 – 0.25 | > 0.25 |

Điểm quan trọng cần nói trong phỏng vấn:

- Ngưỡng được đánh giá tại **percentile 75** của toàn bộ page load (không phải trung bình) — tức 75% user phải đạt ngưỡng "tốt".
- Có 2 loại dữ liệu: **field data** (RUM — user thật, từ Chrome UX Report/CrUX) và **lab data** (môi trường mô phỏng — Lighthouse). Google ranking dùng **field data**.
- INP thay FID vì FID chỉ đo **độ trễ input đầu tiên**, còn INP đo **toàn bộ interaction trong suốt session** — phản ánh trải nghiệm thực hơn.

### Code minh hoạ

```js
// Đo Core Web Vitals bằng thư viện chính thức của Google
import { onLCP, onINP, onCLS } from "web-vitals";

function sendToAnalytics(metric) {
  // metric = { name, value, rating: 'good' | 'needs-improvement' | 'poor', ... }
  navigator.sendBeacon("/analytics", JSON.stringify(metric));
}

onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);
```

```js
// Hoặc đo thủ công bằng PerformanceObserver
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log("LCP candidate:", entry.element, entry.startTime);
  }
}).observe({ type: "largest-contentful-paint", buffered: true });
```

### Đáp án mẫu

> "Core Web Vitals là bộ 3 metrics Google dùng để đo trải nghiệm user thật và làm ranking signal cho SEO. **LCP** đo tốc độ tải — thời gian render element lớn nhất trong viewport, tốt là dưới 2.5s. **INP** đo độ phản hồi — độ trễ từ interaction đến frame tiếp theo, tốt là dưới 200ms; INP thay FID từ 2024 vì nó đo mọi interaction chứ không chỉ input đầu tiên. **CLS** đo độ ổn định layout — tổng các lần content bị nhảy, tốt là dưới 0.1. Ngưỡng tính ở percentile 75 của user thật, nên em luôn phân biệt field data từ CrUX với lab data từ Lighthouse — ranking dùng field data. Trong dự án em monitor bằng thư viện `web-vitals` gửi về analytics để theo dõi theo thời gian thực."

---

## Câu 2: LCP là gì? Cách cải thiện LCP? `[Intermediate]`

### Câu hỏi

> LCP (Largest Contentful Paint) là gì? Trang của em có LCP 5 giây — em sẽ làm gì để cải thiện?

### Giải thích lý thuyết

**LCP** là thời điểm element content **lớn nhất trong viewport** được render xong. Element được tính: `<img>`, `<video>` (poster), element có `background-image`, hoặc block text lớn nhất. LCP candidate có thể thay đổi trong quá trình load — giá trị cuối cùng là element lớn nhất tại thời điểm user tương tác hoặc trang load xong.

LCP chia thành **4 sub-part** — phải biết phần nào chậm mới fix đúng chỗ:

1. **TTFB** — server trả byte đầu tiên chậm.
2. **Resource load delay** — browser phát hiện resource LCP muộn (ví dụ ảnh load qua JS, background-image trong CSS).
3. **Resource load time** — resource quá nặng hoặc network chậm.
4. **Element render delay** — resource về rồi nhưng bị block render (CSS/JS blocking, client-side rendering chờ JS).

Cách cải thiện theo từng phần:

- **Giảm TTFB**: CDN, cache server-side, streaming SSR, tối ưu database query.
- **Giảm load delay**: đưa ảnh LCP vào HTML tĩnh (không inject bằng JS), `fetchpriority="high"`, `<link rel="preload">` cho ảnh hero, **không** lazy-load ảnh LCP.
- **Giảm load time**: format ảnh hiện đại (AVIF/WebP), responsive `srcset`, nén, preconnect tới CDN domain.
- **Giảm render delay**: inline critical CSS, defer JS không cần thiết, tránh client-side render cho above-the-fold content (dùng SSR/SSG).

### Code minh hoạ

```html
<!-- Ảnh hero là LCP element: ưu tiên cao, KHÔNG lazy load -->
<link rel="preload" as="image" href="/hero.avif" fetchpriority="high" />
<link rel="preconnect" href="https://cdn.example.com" />

<img
  src="/hero.avif"
  srcset="/hero-480.avif 480w, /hero-1080.avif 1080w"
  sizes="100vw"
  fetchpriority="high"
  alt="Hero banner"
/>

<!-- Ảnh dưới fold mới lazy load -->
<img src="/below-fold.webp" loading="lazy" alt="..." />
```

```jsx
// Next.js: priority tự set preload + fetchpriority
import Image from "next/image";

<Image src="/hero.avif" width={1200} height={600} priority alt="Hero" />;
```

### Đáp án mẫu

> "LCP là thời điểm element lớn nhất trong viewport render xong — thường là ảnh hero hoặc heading. Với LCP 5s, em không đoán mò mà **breakdown 4 sub-part**: TTFB, resource load delay, resource load time, render delay — Chrome DevTools Performance panel cho xem từng phần. Lỗi phổ biến nhất em hay gặp: ảnh hero bị `loading="lazy"` hoặc load qua JS nên browser phát hiện muộn — fix bằng cách đưa vào HTML kèm `fetchpriority="high"` và preload. Tiếp theo là tối ưu chính resource: AVIF/WebP, srcset đúng size, CDN. Nếu TTFB cao thì cache server, streaming SSR. Nếu render delay thì inline critical CSS và đừng để above-the-fold phụ thuộc client-side JS. Em từng kéo LCP từ 4.8s xuống 1.9s chủ yếu nhờ bỏ lazy-load nhầm trên hero image và chuyển sang SSR."

---

## Câu 3: CLS là gì? Nguyên nhân và cách fix? `[Intermediate]`

### Câu hỏi

> CLS (Cumulative Layout Shift) là gì? Những nguyên nhân phổ biến gây layout shift và cách fix từng loại?

### Giải thích lý thuyết

**CLS** đo tổng các lần layout bị dịch chuyển **ngoài ý muốn** trong suốt vòng đời trang. Mỗi shift được tính điểm: `impact fraction × distance fraction` (phần viewport bị ảnh hưởng × khoảng cách dịch chuyển). Shift xảy ra **trong vòng 500ms sau user interaction** không bị tính (vì là chủ ý của user).

Nguyên nhân phổ biến và cách fix:

| Nguyên nhân | Cách fix |
| ----------- | -------- |
| Ảnh/video không có kích thước | Luôn set `width`/`height` attribute (browser tự tính `aspect-ratio`) |
| Ads, embeds, iframe inject sau | Reserve chỗ trước bằng `min-height` cho slot |
| Content inject động (banner, notification) | Render placeholder/skeleton có cùng kích thước, hoặc chèn ngoài viewport |
| Web font gây FOUT/layout shift | `font-display: optional` hoặc `swap` + `size-adjust`, preload font, dùng fallback font có metrics tương đồng |
| Animation bằng `top/left/height` | Dùng `transform: translate()/scale()` — không trigger layout |

### Code minh hoạ

```html
<!-- WRONG: không có kích thước → ảnh load xong đẩy content xuống -->
<img src="/banner.jpg" alt="" />

<!-- CORRECT: browser reserve chỗ từ đầu nhờ width/height -->
<img src="/banner.jpg" width="1200" height="400" alt="" />
```

```css
/* Reserve chỗ cho ad slot — ad load chậm không gây shift */
.ad-slot {
  min-height: 250px;
}

/* Modern: aspect-ratio cho responsive media */
.video-wrapper {
  aspect-ratio: 16 / 9;
}

/* Font: giảm shift khi web font swap vào */
@font-face {
  font-family: "Inter";
  src: url("/inter.woff2") format("woff2");
  font-display: swap;
  size-adjust: 100.5%; /* match metrics với fallback font */
}
```

```js
// Debug: tìm element nào gây shift
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) {
      console.log("Shift score:", entry.value, entry.sources?.map((s) => s.node));
    }
  }
}).observe({ type: "layout-shift", buffered: true });
```

### Đáp án mẫu

> "CLS đo tổng các lần layout nhảy ngoài ý muốn — điểm mỗi shift bằng phần viewport bị ảnh hưởng nhân khoảng cách dịch. Shift trong 500ms sau interaction không tính. Bốn nguyên nhân em gặp nhiều nhất: **một**, media không khai báo kích thước — fix bằng `width/height` attribute hoặc `aspect-ratio`; **hai**, ads và embed inject muộn — fix bằng reserve `min-height` cho slot; **ba**, content động chèn vào đầu trang — fix bằng skeleton đúng kích thước; **bốn**, web font swap làm chữ đổi metrics — fix bằng preload font, `font-display: swap` kết hợp `size-adjust`. Khi debug, em dùng PerformanceObserver với `layout-shift` entry hoặc bật 'Layout Shift Regions' trong DevTools để thấy đúng element nào nhảy. Nguyên tắc chung: mọi thứ load async phải có chỗ đứng được reserve từ đầu."

---

## Câu 4: Giải thích bộ metrics LCP, INP, CLS, TTFB `[Intermediate]`

### Câu hỏi

> Ngoài 3 Core Web Vitals, em hãy giải thích TTFB và mối quan hệ giữa các metrics: TTFB ảnh hưởng gì đến LCP? Metric nào do server quyết định, metric nào do client?

### Giải thích lý thuyết

**TTFB (Time To First Byte)** = thời gian từ khi request bắt đầu đến khi browser nhận **byte đầu tiên** của response. Bao gồm: redirect time + DNS lookup + TCP/TLS handshake + server processing + thời gian byte đầu tiên bay về. TTFB tốt là **≤ 800ms**. TTFB không phải Core Web Vital nhưng là **supporting metric** quan trọng.

Mối quan hệ giữa các metrics — đây là phần ăn điểm:

- **TTFB là "sàn" của LCP**: LCP không bao giờ nhanh hơn TTFB. TTFB 2s thì LCP tối thiểu 2s dù tối ưu client tốt đến đâu. Chuỗi phụ thuộc: `TTFB → FCP → LCP`.
- **LCP** = vấn đề **server + network + resource**: CDN, cache, image optimization, render-blocking resources.
- **INP** = vấn đề **client-side JS**: long task chiếm main thread, event handler nặng, re-render lớn. Server nhanh mấy mà JS block main thread thì INP vẫn tệ.
- **CLS** = vấn đề **layout/CSS discipline**: không liên quan tốc độ — trang chậm vẫn có thể CLS = 0 nếu reserve space đúng.

Phân loại theo người chịu trách nhiệm:

| Metric | Chủ yếu do | Fix ở đâu |
| ------ | ---------- | --------- |
| TTFB | Server/Infra | Backend, CDN, cache, edge |
| LCP | Server + Client | Cả hai: TTFB + resource priority + render path |
| INP | Client | JS: long tasks, hydration, event handlers |
| CLS | Client | CSS/HTML: kích thước, reserve space |

### Code minh hoạ

```js
// Đo TTFB và breakdown bằng Navigation Timing API
const [nav] = performance.getEntriesByType("navigation");

console.log({
  redirect: nav.redirectEnd - nav.redirectStart,
  dns: nav.domainLookupEnd - nav.domainLookupStart,
  tcpTls: nav.connectEnd - nav.connectStart,
  ttfb: nav.responseStart - nav.startTime, // TTFB chính thức
  fcpToLcp: "LCP - FCP cho biết resource/render delay",
});
```

```js
// INP: tìm interaction chậm nhất
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 200) {
      console.warn("Slow interaction:", entry.name, entry.duration, "ms");
    }
  }
}).observe({ type: "event", durationThreshold: 200, buffered: true });
```

### Đáp án mẫu

> "TTFB là thời gian nhận byte đầu tiên — gồm DNS, TLS handshake và server processing, tốt là dưới 800ms. Điểm quan trọng: **TTFB là sàn của LCP** — chuỗi phụ thuộc là TTFB → FCP → LCP, nên TTFB 2 giây thì không cách nào LCP dưới 2 giây. Em phân loại để fix đúng chỗ: TTFB là việc của server và CDN; LCP là kết hợp server với resource priority phía client; INP gần như thuần client — long task và hydration block main thread; CLS thuần CSS discipline, không liên quan tốc độ. Trong thực tế khi nhận ticket 'trang chậm', việc đầu tiên em làm là xem metric nào tệ để biết vấn đề nằm ở backend, network hay JS bundle — ba hướng fix hoàn toàn khác nhau."

---

## Câu 5: Chiến lược tối ưu tổng hợp LCP, CLS, INP `[Senior]`

### Câu hỏi

> Trang e-commerce của công ty có cả 3 chỉ số đều "poor": LCP 4.5s, INP 600ms, CLS 0.3. Em lập kế hoạch tối ưu thế nào, ưu tiên gì trước?

### Giải thích lý thuyết

Câu này test khả năng **ưu tiên và lập kế hoạch**, không chỉ kiến thức lẻ. Framework trả lời:

**Bước 1 — Đo trước khi fix**: lấy field data (CrUX, RUM) xem trang nào, device nào, segment nào tệ nhất. Lab data (Lighthouse) để reproduce và debug chi tiết.

**Bước 2 — Ưu tiên theo impact**: LCP và INP thường ảnh hưởng conversion trực tiếp (user bỏ đi khi trang chậm/đơ). CLS gây mis-click — đặc biệt nguy hiểm ở trang checkout.

**Bước 3 — Fix theo nhóm:**

- **LCP 4.5s**: preload + `fetchpriority="high"` cho hero image; AVIF/WebP + CDN; SSR/SSG cho above-the-fold; giảm TTFB bằng edge caching; loại render-blocking CSS/JS.
- **INP 600ms**: tìm long tasks (> 50ms) bằng Performance panel; code-split để giảm hydration cost; `startTransition` cho update không khẩn cấp; debounce input handlers; web worker cho việc nặng (search filter, parse data); virtualize list dài.
- **CLS 0.3**: audit bằng Layout Shift Regions; set kích thước cho mọi media; reserve slot cho ads/banner; fix font swap.

**Bước 4 — Chặn regression**: performance budget trong CI (Lighthouse CI), RUM dashboard, alert khi p75 vượt ngưỡng.

### Code minh hoạ

```jsx
// INP: tách update khẩn cấp khỏi update nặng bằng startTransition
import { useState, useTransition } from "react";

function ProductSearch({ products }) {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState(products);
  const [isPending, startTransition] = useTransition();

  function handleChange(e) {
    setQuery(e.target.value); // urgent: input phải phản hồi ngay
    startTransition(() => {
      // non-urgent: filter 10k item có thể chờ, không block typing
      setFiltered(products.filter((p) => p.name.includes(e.target.value)));
    });
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      <ProductList items={filtered} dimmed={isPending} />
    </>
  );
}
```

```js
// Chia việc nặng để nhường main thread (INP)
async function processLargeData(items) {
  const results = [];
  for (const [i, item] of items.entries()) {
    results.push(expensiveTransform(item));
    if (i % 200 === 0) {
      // yield về main thread để browser xử lý interaction
      await new Promise((r) => (window.scheduler?.yield ? scheduler.yield().then(r) : setTimeout(r, 0)));
    }
  }
  return results;
}
```

```yaml
# Lighthouse CI: chặn regression trong pipeline
# lighthouserc.yml
ci:
  collect:
    url: ["https://staging.example.com/product/123"]
  assert:
    assertions:
      largest-contentful-paint: ["error", { maxNumericValue: 2500 }]
      cumulative-layout-shift: ["error", { maxNumericValue: 0.1 }]
      total-blocking-time: ["error", { maxNumericValue: 300 }]
```

### Đáp án mẫu

> "Em không fix mù mà đi theo 4 bước. **Một — đo**: lấy field data từ CrUX/RUM xem page nào, device nào tệ nhất — thường mobile 3G tệ hơn desktop nhiều. **Hai — ưu tiên theo business impact**: LCP và INP ảnh hưởng conversion trực tiếp, CLS 0.3 ở checkout gây mis-click nguy hiểm. **Ba — fix theo nhóm**: LCP thì preload hero image, AVIF, SSR above-the-fold, edge cache; INP 600ms gần như chắc chắn có long task — em profile tìm task > 50ms, code-split giảm hydration, `startTransition` cho update nặng, web worker cho filter/parse; CLS thì set kích thước media, reserve slot ads, fix font swap. **Bốn — chặn regression**: Lighthouse CI với budget trong pipeline và RUM alert ở p75. Kinh nghiệm của em: 80% improvement đến từ 2-3 fix lớn — hero image và hydration — nên đo trước để tìm đúng 20% đó thay vì tối ưu dàn trải."
