---
sidebar_position: 3
title: "3. Debugging Performance"
---

# Debug Performance

---

## Mục lục

- [Tại sao app chậm?](#tại-sao-app-chậm)
- [Core Web Vitals](#core-web-vitals)
- [Performance tab](#performance-tab)
- [Lighthouse](#lighthouse)
- [Coverage tab — code chết](#coverage-tab--code-chết)
- [Performance API](#performance-api)
- [Anti-pattern phổ biến](#anti-pattern-phổ-biến)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Tại sao app chậm?

Nguyên nhân phổ biến:

| Nhóm | Ví dụ |
|------|-------|
| **Network** | Bundle JS lớn, ảnh không tối ưu, request chậm |
| **JS execution** | Long task, loop nặng, parse JSON lớn |
| **Render** | Layout thrashing, reflow, paint |
| **Memory** | Heap lớn → GC pause |
| **Backend** | API chậm, query không index |

## Core Web Vitals

Google đặt 3 chỉ số chính:

| Chỉ số | Đo | Tốt | Trung bình | Kém |
|--------|----|-----|------------|-----|
| **LCP** (Largest Contentful Paint) | Thời gian render phần tử lớn nhất | < 2.5s | 2.5-4s | > 4s |
| **INP** (Interaction to Next Paint) | Thời gian phản hồi tương tác | < 200ms | 200-500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | Mức độ "nhảy" layout | < 0.1 | 0.1-0.25 | > 0.25 |

### Đo qua DevTools

- **Lighthouse tab** — đo 3 chỉ số trên
- **Performance tab** — record session, xem chi tiết

### Đo trong code

```js
// LCP
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log("LCP:", entry.startTime);
  }
}).observe({ type: "largest-contentful-paint", buffered: true });

// CLS
new PerformanceObserver((list) => {
  let cls = 0;
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) cls += entry.value;
  }
  console.log("CLS:", cls);
}).observe({ type: "layout-shift", buffered: true });

// INP (qua web-vitals lib)
import { onINP } from "web-vitals";
onINP(({ value }) => console.log("INP:", value));
```

## Performance tab

### Record session

1. Mở **Performance tab**
2. Click 🔴 Record
3. Tương tác app
4. Stop → xem timeline

### Đọc timeline

| Section | Nội dung |
|---------|----------|
| **FPS** | Frame rate (60 FPS = mượt) |
| **CPU** | Workload breakdown |
| **Network** | Requests |
| **Frames** | Mỗi frame được render |
| **Interactions** | User input |
| **Main** | JS execution + render |
| **Timings** | Custom marks (vd: First Paint, FCP, LCP) |

### Long tasks (> 50ms)

Hiện ra **viền đỏ** trên thread Main → block UI.

### Flame chart

Mỗi rectangle = 1 function call:
- Rộng → tốn thời gian
- Cao → call stack sâu

Click rectangle → xem chi tiết: source, self time, total time.

### Bottom-Up / Call Tree

- **Bottom-Up**: function nào tốn nhiều nhất (sort theo self time)
- **Call Tree**: cây call từ root xuống
- **Event Log**: tất cả event xảy ra theo thứ tự

## Lighthouse

### Chạy audit

1. Tab **Lighthouse** → chọn:
   - Mode: Navigation / Timespan / Snapshot
   - Categories: Performance, Accessibility, Best Practices, SEO, PWA
   - Device: Mobile / Desktop
2. Click "Analyze" → đợi 30s

### Hiểu report

- **Score** 0-100 cho mỗi category
- **Metrics**: LCP, FCP, TBT, CLS, Speed Index
- **Opportunities**: gợi ý cải thiện (compress, lazy load...)
- **Diagnostics**: chi tiết kĩ thuật

### Một số gợi ý phổ biến

- **Reduce unused JS** — code splitting, tree shaking
- **Defer offscreen images** — lazy loading
- **Use modern image formats** — WebP, AVIF
- **Preload key requests** — `<link rel="preload">`
- **Minify CSS/JS** — bundler tự làm
- **Eliminate render-blocking resources** — `async`/`defer` script

## Coverage tab — code chết

DevTools → `Esc` → Coverage:

1. Click Record
2. Reload page
3. Stop
4. → Hiện % code thực sự dùng vs **code chết**

Click file → xem dòng nào không dùng (đỏ).

Mục tiêu: **giảm bundle size** bằng tree-shaking, code-splitting.

## Performance API

### `performance.now()`

Đo thời gian chính xác (sub-ms):

```js
const start = performance.now();
heavyTask();
const end = performance.now();
console.log(`Took ${end - start}ms`);
```

Khác `Date.now()`:
- `performance.now()`: relative to page load, monotonic
- `Date.now()`: wall clock, có thể bị NTP adjust

### `performance.mark()` / `performance.measure()`

```js
performance.mark("fetchStart");
await fetch(url);
performance.mark("fetchEnd");

performance.measure("fetchDuration", "fetchStart", "fetchEnd");

// Xem trong DevTools Performance → Timings
const measures = performance.getEntriesByType("measure");
console.log(measures);
```

### `PerformanceObserver`

```js
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 100) {
      console.warn("Slow task:", entry.name, entry.duration);
    }
  }
});

observer.observe({ entryTypes: ["measure", "longtask"] });
```

### Long Tasks API

```js
new PerformanceObserver((list) => {
  for (const task of list.getEntries()) {
    console.warn(`Long task: ${task.duration}ms`, task);
  }
}).observe({ entryTypes: ["longtask"] });
```

## Anti-pattern phổ biến

### 1. Layout thrashing (force reflow)

```js
// ❌ Loop với read/write DOM
for (let i = 0; i < items.length; i++) {
  const h = items[i].offsetHeight;       // read (force reflow)
  items[i].style.height = h + 10 + "px"; // write
}
// Mỗi iteration ép browser reflow → cực chậm

// ✅ Batch: read all, write all
const heights = items.map(item => item.offsetHeight);   // batch read
items.forEach((item, i) => {
  item.style.height = heights[i] + 10 + "px";           // batch write
});
```

### 2. Loop dài chặn UI

```js
// ❌ 5 giây không phản hồi
for (let i = 0; i < 1e9; i++) { /* ... */ }

// ✅ Chia chunks với setTimeout
function processChunk(start, end) {
  for (let i = start; i < end; i++) { /* ... */ }
  if (end < 1e9) {
    setTimeout(() => processChunk(end, Math.min(end + 1e6, 1e9)), 0);
  }
}
processChunk(0, 1e6);

// ✅ Tốt hơn: Web Worker
const worker = new Worker("heavy.js");
worker.postMessage(data);
worker.onmessage = (e) => process(e.data);
```

### 3. Bundle quá lớn

```js
// ❌ Import toàn bộ lodash
import _ from "lodash";
_.debounce(...);

// ✅ Import từng function
import debounce from "lodash/debounce";

// Hoặc dùng module nhẹ hơn
import { debounce } from "lodash-es";   // tree-shakable
```

### 4. Image không tối ưu

```html
<!-- ❌ Ảnh lớn nguyên gốc -->
<img src="hero-4k.jpg" />

<!-- ✅ Responsive + lazy + format mới -->
<picture>
  <source type="image/avif" srcset="hero.avif" />
  <source type="image/webp" srcset="hero.webp" />
  <img 
    src="hero.jpg"
    loading="lazy"
    width="800" height="600"
    alt="Hero"
  />
</picture>
```

### 5. Memoize tính toán nặng

```js
import { useMemo, useCallback } from "react";

function Component({ items }) {
  // ❌ Tính mỗi render
  const sorted = items.slice().sort();
  
  // ✅ Memoize
  const sorted = useMemo(() => items.slice().sort(), [items]);
}
```

### 6. Debounce / throttle event listener

```js
// ❌ Chạy mỗi pixel scroll
window.addEventListener("scroll", () => {
  expensiveCalc();
});

// ✅ Debounce
let timer;
window.addEventListener("scroll", () => {
  clearTimeout(timer);
  timer = setTimeout(expensiveCalc, 100);
});

// Hoặc throttle
let lastRun = 0;
window.addEventListener("scroll", () => {
  const now = Date.now();
  if (now - lastRun > 100) {
    expensiveCalc();
    lastRun = now;
  }
});
```

---

## Câu hỏi phỏng vấn

### Câu 1: Quy trình debug app chậm?

**Đáp án:**

1. **Đo trước**: chạy Lighthouse → biết chỉ số đang ở đâu
2. **Phân loại**:
   - Slow load → Network, bundle, image
   - Slow interaction → JS execution
   - Janky animation → reflow/paint
3. **Performance tab**: record session, tìm long task & flame chart
4. **Bottom-Up view**: function tốn time nhất
5. **Fix + đo lại** → so sánh metrics

Bonus: dùng **Coverage tab** để tìm code chết, **Memory tab** nếu nghi leak.

### Câu 2: 60 FPS nghĩa là gì? Mỗi frame có bao nhiêu thời gian?

**Đáp án:**

60 FPS = **60 frames per second** → mỗi frame có **~16.67ms** (1000ms / 60).

Trong 16.67ms, browser phải:
1. Chạy JS
2. Style calculation
3. Layout
4. Paint
5. Composite

Nếu JS chiếm **> 16.67ms** → drop frame → app giật (jank). Đây là lý do task **> 50ms** được gọi là **long task**.

### Câu 3: Layout thrashing là gì?

**Đáp án:**

**Layout thrashing** là gọi đọc/ghi DOM trong loop, ép browser tính layout **nhiều lần liên tục**:

```js
// ❌ Trashing
for (const el of elements) {
  const h = el.offsetHeight;       // force reflow
  el.style.height = h + 10 + "px"; // mutation
}
```

Mỗi `offsetHeight` (sau khi mutation) ép browser **flush layout** → cực chậm với 1000 elements.

**Fix**: tách thành 2 phase — đọc tất cả trước, rồi ghi tất cả:

```js
const heights = elements.map(el => el.offsetHeight);   // batch read
elements.forEach((el, i) => {
  el.style.height = heights[i] + 10 + "px";            // batch write
});
```

### Câu 4: Khi nào dùng Web Worker?

**Đáp án:**

Khi cần **tính toán nặng** mà không muốn block UI thread:

- Parse JSON/XML lớn
- Crypto (encryption, hashing)
- Image processing
- Compression
- Machine learning inference (ONNX, TF.js)

```js
// main.js
const worker = new Worker("heavy.js");
worker.postMessage(data);
worker.onmessage = (e) => updateUI(e.data);

// heavy.js
self.onmessage = (e) => {
  const result = heavyCalc(e.data);
  self.postMessage(result);
};
```

Hạn chế: Worker không có DOM, không share memory (trừ qua SharedArrayBuffer + Atomics).
