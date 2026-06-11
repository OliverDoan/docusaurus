---
sidebar_position: 4
title: "4. Rendering Pipeline & Lighthouse"
---

# Rendering Pipeline & Lighthouse

> *Hiểu browser render thế nào là nền của mọi câu trả lời performance — vì sao `transform` mượt còn `top` giật, vì sao CSS block render còn ảnh thì không. Lighthouse là công cụ chứng minh bạn đã fix được.*

---

## Câu 1: Browser rendering pipeline — Critical Rendering Path? `[Intermediate]`

### Câu hỏi

> Em giải thích browser render một trang web qua những bước nào (Critical Rendering Path)? Tại sao CSS được gọi là render-blocking? `transform` khác `top/left` thế nào về mặt pipeline?

### Giải thích lý thuyết

**Critical Rendering Path (CRP)** là chuỗi bước browser phải đi qua từ khi nhận HTML đến khi pixel hiện trên màn hình:

1. **Parse HTML → DOM tree**. Parser dừng khi gặp `<script>` không có `defer/async` (JS có thể `document.write` sửa DOM).
2. **Parse CSS → CSSOM tree**. **CSS là render-blocking**: browser không render gì khi CSSOM chưa xong — tránh FOUC (flash of unstyled content). JS còn bị block bởi CSS vì script có thể đọc computed style.
3. **DOM + CSSOM → Render tree** — chỉ chứa node hiển thị (`display: none` bị loại).
4. **Layout (reflow)** — tính toán vị trí, kích thước hình học của từng node.
5. **Paint** — vẽ pixel (màu, chữ, shadow, border) vào các layer.
6. **Composite** — GPU ghép các layer thành frame cuối cùng.

Điểm then chốt cho performance:

- **Pipeline có thể đi tắt**: đổi property hình học (`width`, `top`, `left`) → chạy lại **Layout → Paint → Composite** (đắt nhất); đổi `color`, `background` → chỉ **Paint → Composite**; đổi `transform`, `opacity` → **chỉ Composite** — chạy trên GPU, không đụng main thread → animation mượt 60fps kể cả khi main thread bận.
- **Layout thrashing**: xen kẽ đọc (`offsetHeight`) và ghi (`style.height`) trong loop ép browser sync layout liên tục — phải batch read rồi batch write.
- **Tối ưu CRP** = giảm số resource blocking + giảm kích thước + giảm số round-trip: inline critical CSS, `defer` JS, preload resource quan trọng.

### Code minh hoạ

```html
<!-- Tối ưu CRP -->
<head>
  <style>/* Critical CSS inline — render above-the-fold không chờ network */</style>

  <!-- CSS không critical: load không block render -->
  <link rel="preload" href="/full.css" as="style" onload="this.rel='stylesheet'" />

  <!-- defer: download song song, execute sau khi parse HTML xong, giữ thứ tự -->
  <script defer src="/app.js"></script>
</head>
```

```js
// WRONG: layout thrashing — mỗi vòng lặp ép 1 lần forced synchronous layout
boxes.forEach((box) => {
  const h = box.offsetHeight;      // read → ép browser tính layout ngay
  box.style.height = h * 2 + "px"; // write → invalidate layout
});

// CORRECT: batch read trước, batch write sau — 1 lần layout duy nhất
const heights = boxes.map((box) => box.offsetHeight); // all reads
boxes.forEach((box, i) => (box.style.height = heights[i] * 2 + "px")); // all writes
```

```css
/* WRONG: animate top/left → Layout + Paint + Composite mỗi frame, chạy main thread */
.slide { transition: left 0.3s; }

/* CORRECT: transform/opacity → chỉ Composite, GPU xử lý, không block main thread */
.slide { transition: transform 0.3s; will-change: transform; }
```

### Đáp án mẫu

> "Pipeline gồm 6 bước: parse HTML ra DOM, parse CSS ra CSSOM, ghép thành render tree, rồi Layout tính hình học, Paint vẽ pixel, Composite ghép layer trên GPU. CSS là render-blocking vì browser không paint gì khi CSSOM chưa xong để tránh flash of unstyled content — và JS cũng bị CSS block vì script có thể đọc computed style. Phần em hay áp dụng nhất là pipeline đi tắt: đổi `top/left` trigger cả Layout-Paint-Composite, đổi `transform/opacity` chỉ trigger Composite trên GPU — nên animation luôn dùng transform, mượt 60fps kể cả khi main thread bận. Hai bug kinh điển: layout thrashing do xen kẽ đọc-ghi style trong loop — fix bằng batch read rồi batch write; và quên `defer` cho script làm parser dừng giữa chừng. Tối ưu CRP tổng quát: inline critical CSS, defer JS, preload resource quan trọng để giảm round-trip blocking."

---

## Câu 2: Lighthouse là gì? Cải thiện điểm Lighthouse thế nào? `[Intermediate]`

### Câu hỏi

> Lighthouse là gì, đo những gì? Sếp yêu cầu "đưa điểm Performance lên 90+" — em tiếp cận thế nào? Điểm Lighthouse có phản ánh đúng trải nghiệm user thật không?

### Giải thích lý thuyết

**Lighthouse** là công cụ audit tự động của Google (có trong Chrome DevTools, CLI, CI, PageSpeed Insights), chấm 4 category: **Performance, Accessibility, Best Practices, SEO**. Điểm Performance được tính có trọng số từ 5 metrics (Lighthouse 10+):

| Metric | Trọng số |
| ------ | -------- |
| **TBT** (Total Blocking Time) | 30% |
| **LCP** | 25% |
| **CLS** | 25% |
| **FCP** | 10% |
| **Speed Index** | 10% |

Điều quan trọng nhất phải nói: **Lighthouse là lab data** — chạy trên môi trường mô phỏng (CPU throttle, mạng giả lập), **không phải user thật**. Field data (CrUX/RUM) mới là cái Google dùng để ranking và mới phản ánh trải nghiệm thật. Lab dùng để **debug và reproduce**, field dùng để **đo sự thật**. TBT (lab) là proxy của INP (field).

Cách tiếp cận "lên 90+":

1. **Chạy đúng cách**: incognito (extension làm sai số), mobile preset, nhiều lần lấy median — điểm dao động giữa các lần chạy là bình thường.
2. **Fix theo trọng số**: TBT + LCP + CLS = 80% điểm — tập trung vào đó. TBT cao → giảm JS, code-split, defer third-party. LCP → hero image + TTFB. CLS → kích thước media.
3. **Đọc panel Opportunities/Diagnostics** — Lighthouse chỉ thẳng việc cần làm kèm ước lượng tiết kiệm.
4. **Giữ điểm**: Lighthouse CI trong pipeline với budget assertion.

Caveat senior: điểm 100 lab vẫn có thể INP tệ trên field (Lighthouse load trang chứ không tương tác lâu như user thật); ngược lại đừng "tối ưu cho cái máy đo" — mục tiêu là user, không phải con số.

### Code minh hoạ

```bash
# Chạy Lighthouse từ CLI — ổn định hơn DevTools, dùng được trong script
npx lighthouse https://example.com \
  --preset=perf --form-factor=mobile \
  --output=json --output-path=./report.json

# Lighthouse CI cho pipeline
npm i -D @lhci/cli
```

```yaml
# lighthouserc.yml — chạy 3 lần lấy median, fail nếu vượt budget
ci:
  collect:
    numberOfRuns: 3
    url:
      - https://staging.example.com/
      - https://staging.example.com/product/123
  assert:
    assertions:
      categories:performance: ["error", { minScore: 0.9 }]
      total-blocking-time: ["error", { maxNumericValue: 300 }]
      largest-contentful-paint: ["error", { maxNumericValue: 2500 }]
  upload:
    target: temporary-public-storage
```

```js
// Đừng quên field data: RUM thật mới là thước đo cuối cùng
import { onLCP, onINP, onCLS } from "web-vitals";
[onLCP, onINP, onCLS].forEach((fn) =>
  fn((m) => navigator.sendBeacon("/rum", JSON.stringify({ name: m.name, value: m.value, rating: m.rating })))
);
```

### Đáp án mẫu

> "Lighthouse là công cụ audit của Google chấm Performance, Accessibility, Best Practices, SEO. Điểm Performance tính theo trọng số: TBT 30%, LCP và CLS mỗi cái 25%, FCP với Speed Index 10% — nên muốn lên 90+ thì 80% nỗ lực nằm ở TBT, LCP, CLS. Cách em làm: chạy đúng chuẩn — incognito, mobile preset, nhiều lần lấy median; rồi fix theo panel Opportunities: TBT cao thì giảm JS và defer third-party, LCP thì hero image với TTFB, CLS thì kích thước media; cuối cùng khoá thành quả bằng Lighthouse CI với budget trong pipeline. Nhưng em sẽ nói thẳng với sếp một điều quan trọng: **Lighthouse là lab data** — môi trường mô phỏng để debug, còn Google ranking và trải nghiệm thật nằm ở field data từ CrUX/RUM. Điểm 100 lab vẫn có thể INP tệ trên user thật. Nên KPI đúng phải là Core Web Vitals p75 trên field data, Lighthouse chỉ là công cụ chẩn đoán."
