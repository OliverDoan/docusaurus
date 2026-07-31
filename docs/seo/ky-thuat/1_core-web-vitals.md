---
sidebar_position: 1
title: "1. Core Web Vitals"
---

# Core Web Vitals

Core Web Vitals là bộ ba chỉ số (LCP, INP, CLS) do Google đặt ra để đo trải nghiệm thực tế của người dùng khi vào website: trang tải nhanh không, bấm vào có phản hồi mượt không, và bố cục có nhảy lung tung không. Từ năm 2021, các chỉ số này được Google dùng làm tín hiệu xếp hạng, nên hiểu và tối ưu chúng giúp web vừa thân thiện với người dùng vừa lên top tốt hơn. Bài này giải thích từng chỉ số, cách đo và cách tối ưu cho developer; phần chi tiết nằm bên dưới.

:::note[Ghi nhớ nhanh]

- ⭐ **3 chỉ số Core Web Vitals** — `LCP` dưới 2.5s (tốc độ tải), `INP` dưới 200ms (phản hồi tương tác), `CLS` dưới 0.1 (ổn định bố cục).
- ⭐ **Field data mới là thứ Google dùng để xếp hạng** — dữ liệu thực từ `CrUX`/`web-vitals`, không phải điểm Lighthouse (lab data).
- **Tối ưu `LCP`** — `preload` ảnh hero, thêm `fetchpriority="high"`, tuyệt đối không `loading="lazy"` cho ảnh LCP.
- **Tối ưu `INP`** — chia nhỏ long task, dùng `scheduler.yield()` để nhường main thread (INP thay `FID` từ 3/2024).
- **Tối ưu `CLS`** — luôn khai báo `width`/`height` cho ảnh, giữ chỗ `min-height` cho quảng cáo, dùng `font-display: optional`.

:::

## Mục lục

- [Core Web Vitals là gì?](#core-web-vitals-là-gì)
- [LCP — Largest Contentful Paint](#lcp-largest-contentful-paint)
- [INP — Interaction to Next Paint](#inp-interaction-to-next-paint)
- [CLS — Cumulative Layout Shift](#cls-cumulative-layout-shift)
- [Đo lường Core Web Vitals](#đo-lường-core-web-vitals)
- [Ảnh hưởng đến Google Ranking](#ảnh-hưởng-đến-google-ranking)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Core Web Vitals là gì?

Core Web Vitals là bộ 3 chỉ số đo lường trải nghiệm người dùng thực tế trên website, do Google định nghĩa. Từ năm 2021, Google chính thức đưa các chỉ số này vào thuật toán xếp hạng tìm kiếm.

Ba chỉ số chính:

| Chỉ số | Đo lường | Mục tiêu | Ý nghĩa |
|--------|----------|-----------|----------|
| **LCP** | Tốc độ tải nội dung chính | dưới 2.5 giây | Loading performance |
| **INP** | Phản hồi tương tác | dưới 200ms | Interactivity |
| **CLS** | Độ ổn định bố cục | dưới 0.1 | Visual stability |

Nếu bạn là developer, hãy hiểu đơn giản: Google muốn trang web **tải nhanh**, **phản hồi mượt**, và **không nhảy lung tung** khi người dùng đang đọc.

## LCP — Largest Contentful Paint

### LCP đo cái gì?

LCP đo thời gian từ khi người dùng bắt đầu tải trang cho đến khi phần tử nội dung lớn nhất trong viewport được render xong. Phần tử đó có thể là:

- Thẻ `<img>`
- Thẻ `<video>` (poster image)
- Block-level element chứa text (như `<h1>`, `<p>`)
- Background image qua `url()` trong CSS

### Phân loại LCP

| Khoảng thời gian | Đánh giá |
|-------------------|----------|
| 0 - 2.5 giây | Tốt (Good) |
| 2.5 - 4.0 giây | Cần cải thiện (Needs Improvement) |
| Trên 4.0 giây | Kém (Poor) |

### Nguyên nhân LCP chậm

1. **Server response time chậm** — TTFB (Time to First Byte) cao
2. **Render-blocking resources** — CSS, JS chặn render
3. **Ảnh nặng chưa tối ưu** — ảnh lớn, chưa nén, không lazy load
4. **Client-side rendering** — phải đợi JS tải xong mới render nội dung

### Tối ưu LCP

**Preload hình ảnh LCP:**

```html
<head>
  <!-- Preload ảnh hero banner — phần tử LCP chính -->
  <link rel="preload" as="image" href="/images/hero-banner.webp" />

  <!-- Preload với srcset cho responsive -->
  <link
    rel="preload"
    as="image"
    href="/images/hero-banner-800.webp"
    imagesrcset="/images/hero-banner-400.webp 400w,
                 /images/hero-banner-800.webp 800w,
                 /images/hero-banner-1200.webp 1200w"
    imagesizes="100vw"
  />
</head>
```

**Tối ưu hình ảnh:**

```html
<!-- Dùng format hiện đại + lazy load cho ảnh KHÔNG phải LCP -->
<picture>
  <source srcset="/images/photo.avif" type="image/avif" />
  <source srcset="/images/photo.webp" type="image/webp" />
  <img
    src="/images/photo.jpg"
    alt="Mô tả ảnh"
    width="800"
    height="600"
    loading="lazy"
    decoding="async"
  />
</picture>

<!-- Ảnh LCP: KHÔNG dùng lazy load, thêm fetchpriority -->
<img
  src="/images/hero.webp"
  alt="Hero banner"
  width="1200"
  height="600"
  fetchpriority="high"
/>
```

**Preconnect đến origin bên thứ ba:**

```html
<head>
  <!-- Preconnect đến CDN chứa font -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

  <!-- Preconnect đến CDN chứa ảnh -->
  <link rel="preconnect" href="https://cdn.example.com" />
</head>
```

## INP — Interaction to Next Paint

### INP thay thế FID

Từ tháng 3/2024, Google chính thức thay FID (First Input Delay) bằng INP. Lý do:

| Đặc điểm | FID | INP |
|-----------|-----|-----|
| Đo gì | Chỉ input delay đầu tiên | Toàn bộ tương tác trong session |
| Bao gồm | Chỉ delay trước xử lý | Delay + processing + render |
| Đại diện | Một lần tương tác | Tất cả tương tác |
| Chính xác | Thấp (chỉ lần đầu) | Cao (toàn bộ session) |

### Phân loại INP

| Khoảng thời gian | Đánh giá |
|-------------------|----------|
| 0 - 200ms | Tốt |
| 200 - 500ms | Cần cải thiện |
| Trên 500ms | Kém |

### Quy trình xử lý một tương tác

```
Người dùng click/tap/keypress
     ↓
Input Delay (chờ main thread rảnh)
     ↓
Processing Time (chạy event handler)
     ↓
Presentation Delay (render kết quả lên màn hình)
     ↓
Next Paint (frame mới hiển thị)
```

INP = Input Delay + Processing Time + Presentation Delay

### Tối ưu INP

**Chia nhỏ long task bằng `scheduler.yield()`:**

```javascript
// SAI: Long task chặn main thread
function processLargeList(items) {
  items.forEach(item => {
    // Xử lý nặng cho mỗi item
    heavyComputation(item);
    updateDOM(item);
  });
}

// ĐÚNG: Yield control để browser xử lý tương tác
async function processLargeList(items) {
  for (const item of items) {
    heavyComputation(item);
    updateDOM(item);

    // Nhường main thread cho browser
    if (navigator.scheduling?.isInputPending()) {
      await scheduler.yield();
    }
  }
}
```

**Dùng `requestIdleCallback` cho tác vụ không khẩn cấp:**

```javascript
// Gửi analytics khi browser rảnh, không chặn tương tác
function sendAnalytics(data) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      fetch('/api/analytics', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    });
  } else {
    // Fallback cho Safari
    setTimeout(() => {
      fetch('/api/analytics', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }, 0);
  }
}
```

## CLS — Cumulative Layout Shift

### CLS là gì?

CLS đo tổng mức độ dịch chuyển bất ngờ của bố cục trang trong suốt vòng đời của trang. Khi bạn đang đọc một bài viết, tự nhiên nội dung nhảy xuống vì một quảng cáo load muộn — đó là layout shift.

### Phân loại CLS

| Điểm số | Đánh giá |
|---------|----------|
| 0 - 0.1 | Tốt |
| 0.1 - 0.25 | Cần cải thiện |
| Trên 0.25 | Kém |

### Nguyên nhân phổ biến gây CLS

1. **Ảnh không có kích thước** — trình duyệt không biết dành bao nhiêu không gian
2. **Quảng cáo, iframe, embed** — load muộn và đẩy nội dung
3. **Font tải muộn** — FOUT (Flash of Unstyled Text) thay đổi kích thước text
4. **Nội dung inject động** — banner, notification bar chèn vào trên cùng

### Sửa CLS

**Luôn khai báo width/height cho ảnh và video:**

```html
<!-- SAI: Không có kích thước, gây layout shift -->
<img src="/photo.jpg" alt="Photo" />

<!-- ĐÚNG: Có width/height, browser giữ chỗ sẵn -->
<img src="/photo.jpg" alt="Photo" width="800" height="600" />

<!-- ĐÚNG: Dùng aspect-ratio trong CSS -->
<style>
  .responsive-img {
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 9;
  }
</style>
<img class="responsive-img" src="/photo.jpg" alt="Photo" />
```

**Giữ chỗ cho quảng cáo và nội dung động:**

```css
/* Giữ chỗ cố định cho quảng cáo */
.ad-slot {
  min-height: 250px; /* Kích thước tối thiểu của ad */
  width: 100%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ad-slot::before {
  content: "Advertisement";
  color: #999;
  font-size: 12px;
}
```

**Xử lý font loading không gây CLS:**

```css
/* Dùng font-display: optional để tránh layout shift hoàn toàn */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: optional; /* Không swap nếu font chưa sẵn sàng */
}

/* Hoặc dùng size-adjust để fallback font cùng kích thước */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap;
  size-adjust: 105%; /* Điều chỉnh để fallback font cùng kích thước */
}
```

## Đo lường Core Web Vitals

### Dùng thư viện web-vitals

```javascript
import { onLCP, onINP, onCLS } from 'web-vitals';

// Gửi metrics về analytics server
function sendToAnalytics(metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating, // 'good', 'needs-improvement', 'poor'
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  });

  // Dùng sendBeacon để không bị mất data khi user rời trang
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/web-vitals', body);
  } else {
    fetch('/api/web-vitals', {
      method: 'POST',
      body,
      keepalive: true,
    });
  }
}

// Đăng ký đo lường
onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);
```

### Tích hợp với Next.js

```tsx
// app/components/WebVitals.tsx
'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log(metric.name, metric.value, metric.rating);

    // Gửi về Google Analytics 4
    if (typeof window.gtag === 'function') {
      window.gtag('event', metric.name, {
        value: Math.round(
          metric.name === 'CLS' ? metric.value * 1000 : metric.value
        ),
        event_label: metric.id,
        non_interaction: true,
      });
    }
  });

  return null;
}
```

### Dùng PerformanceObserver trực tiếp

```javascript
// Đo LCP thủ công
const lcpObserver = new PerformanceObserver((entryList) => {
  const entries = entryList.getEntries();
  const lastEntry = entries[entries.length - 1];
  console.log('LCP:', lastEntry.startTime, 'ms');
  console.log('LCP Element:', lastEntry.element);
});
lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

// Đo Layout Shift thủ công
let clsScore = 0;
const clsObserver = new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    // Chỉ đếm shift KHÔNG do user interaction
    if (!entry.hadRecentInput) {
      clsScore += entry.value;
      console.log('Layout shift:', entry.value, 'Total CLS:', clsScore);
      // Xem element nào gây shift
      entry.sources?.forEach(source => {
        console.log('Shifted element:', source.node);
      });
    }
  }
});
clsObserver.observe({ type: 'layout-shift', buffered: true });
```

### Các công cụ đo lường

| Công cụ | Loại dữ liệu | Miễn phí | Ghi chú |
|---------|---------------|----------|---------|
| Lighthouse | Lab data | Co | Chạy trong DevTools hoặc CI |
| PageSpeed Insights | Lab + Field | Co | Dùng dữ liệu CrUX thực tế |
| Chrome UX Report (CrUX) | Field data | Co | Dữ liệu thực từ Chrome users |
| Google Search Console | Field data | Co | Báo cáo Core Web Vitals |
| web-vitals library | Field data | Co | Tích hợp vào code |
| WebPageTest | Lab data | Co | Phân tích chi tiết waterfall |

**Lưu ý quan trọng**: Lab data (Lighthouse) cho kết quả trên máy bạn, không phản ánh trải nghiệm thực tế. Field data (CrUX, web-vitals) mới là dữ liệu Google dùng để xếp hạng.

## Ảnh hưởng đến Google Ranking

Core Web Vitals là một trong nhiều yếu tố xếp hạng (ranking signal). Google kết hợp chúng vào nhóm **Page Experience signals**:

- Core Web Vitals (LCP, INP, CLS)
- HTTPS
- Mobile-friendly
- No intrusive interstitials (không popup che nội dung)

**Thực tế**: Core Web Vitals là "tiebreaker" — khi 2 trang có nội dung tương đương, trang nào có CWV tốt hơn sẽ được ưu tiên. Nội dung chất lượng vẫn là yếu tố số 1.

## Lỗi thường gặp

1. **Chỉ đo Lighthouse, không đo field data** — Lighthouse score 100 nhưng CrUX data vẫn kém vì người dùng thật trên thiết bị yếu hơn
2. **Lazy load ảnh LCP** — Ảnh hero banner dùng `loading="lazy"` khiến LCP chậm hẳn đi
3. **Quên khai báo width/height cho ảnh** — Nguyên nhân số 1 gây CLS
4. **Load quá nhiều third-party script** — Mỗi script thêm vào là thêm long task, ảnh hưởng INP
5. **Dùng font-display: swap cho mọi font** — Swap gây layout shift, nên dùng `optional` cho font không quan trọng
6. **Tối ưu cho mobile nhưng quên desktop** — CrUX tách riêng mobile và desktop, cần tối ưu cả hai

## Câu hỏi phỏng vấn

### Câu 1: LCP, INP, CLS đo lường cái gì? Giá trị mục tiêu của mỗi chỉ số?

**Trả lời:**
- **LCP (Largest Contentful Paint)**: Đo thời gian render phần tử nội dung lớn nhất trong viewport. Mục tiêu: dưới 2.5 giây.
- **INP (Interaction to Next Paint)**: Đo thời gian phản hồi tương tác (click, tap, keypress) tính từ lúc user tương tác đến khi frame mới được paint. Mục tiêu: dưới 200ms.
- **CLS (Cumulative Layout Shift)**: Đo tổng mức độ dịch chuyển bất ngờ của bố cục trang. Mục tiêu: dưới 0.1.

### Câu 2: Tại sao Google thay FID bằng INP?

**Trả lời:**
FID chỉ đo input delay của tương tác đầu tiên, bỏ qua processing time và presentation delay. INP đo toàn bộ lifecycle của mọi tương tác trong session, chọn giá trị xấu nhất (gần percentile thứ 98) làm đại diện. INP phản ánh chính xác hơn trải nghiệm thực tế vì user không chỉ tương tác một lần.

### Câu 3: Làm sao tối ưu CLS khi trang có quảng cáo load muộn?

**Trả lời:**
- Dành sẵn không gian (placeholder) cho vùng quảng cáo bằng CSS `min-height`
- Dùng CSS `aspect-ratio` hoặc `padding-bottom` trick để giữ tỷ lệ
- Đặt quảng cáo bên dưới viewport (below the fold) để shift không ảnh hưởng score
- Tránh inject quảng cáo vào giữa nội dung đang hiển thị
- Nếu ad slot trống (không có ad), giữ nguyên placeholder thay vì collapse

### Câu 4: Sự khác nhau giữa Lab data và Field data? Google dùng loại nào để xếp hạng?

**Trả lời:**
- **Lab data**: Đo trên môi trường giả lập (Lighthouse, WebPageTest), kết quả nhất quán nhưng không phản ánh thiết bị thực
- **Field data**: Thu thập từ người dùng thật (CrUX, web-vitals library), phản ánh trải nghiệm thực nhưng biến động theo thiết bị và mạng
- Google dùng **field data từ CrUX** (Chrome User Experience Report) để xếp hạng, không dùng Lighthouse score

### Câu 5: Giải thích cách hoạt động của INP. Tại sao một event handler chạy 300ms sẽ cho INP kém?

**Trả lời:**
INP bao gồm 3 giai đoạn: Input Delay (chờ main thread rảnh) + Processing Time (chạy handler) + Presentation Delay (browser render frame mới). Nếu handler chạy 300ms, chỉ riêng processing time đã vượt ngưỡng 200ms, chưa kể input delay và presentation delay. Giải pháp: chia handler thành nhiều phần nhỏ, dùng `scheduler.yield()` hoặc `requestAnimationFrame` để nhường main thread cho browser paint frame trung gian.
