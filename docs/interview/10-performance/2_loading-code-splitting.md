---
sidebar_position: 2
title: "2. Lazy Loading & Code Splitting"
---

# Lazy Loading & Code Splitting

> *"Bundle 2MB thì tối ưu kiểu gì?" — nhóm câu hỏi này kiểm tra bạn có hiểu JS được load, parse, execute như thế nào, và có biết dùng đúng công cụ để chỉ ship cái user cần hay không.*

---

## Câu 1: Lazy loading là gì? Cách implement trong React? `[Intermediate]`

### Câu hỏi

> Lazy loading là gì? Em implement lazy loading trong React như thế nào — cho cả component và resource (ảnh, data)?

### Giải thích lý thuyết

**Lazy loading** = trì hoãn việc load một resource cho đến khi **thực sự cần** (user sắp nhìn thấy hoặc tương tác). Mục tiêu: giảm initial load — ship ít byte hơn lúc đầu, trang interactive nhanh hơn.

Các tầng lazy loading trong web app:

1. **Component/route level** — `React.lazy()` + `Suspense`: component chỉ được download khi render lần đầu. Webpack/Vite tự tách thành chunk riêng tại điểm `import()`.
2. **Image/iframe** — `loading="lazy"` attribute (native browser support): chỉ load khi gần viewport.
3. **Data** — fetch khi component mount hoặc khi element vào viewport (IntersectionObserver).
4. **Third-party script** — load analytics, chat widget sau khi trang interactive hoặc khi user scroll/tương tác.

Lưu ý quan trọng (điểm trừ nếu không biết):

- **KHÔNG lazy-load LCP element** (ảnh hero) — làm LCP tệ hơn.
- `React.lazy` chỉ hỗ trợ **default export**; cần error boundary bao ngoài vì chunk có thể load fail (network, deploy mới làm chunk cũ 404).
- Nên **preload khi user hover/focus** vào link để che network latency.

### Code minh hoạ

```jsx
import { lazy, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

// Tách chunk tại điểm import() — chỉ download khi render
const HeavyChart = lazy(() => import("./HeavyChart"));
const SettingsModal = lazy(() => import("./SettingsModal"));

function Dashboard() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <ErrorBoundary fallback={<p>Tải thất bại — thử lại</p>}>
      <Suspense fallback={<ChartSkeleton />}>
        <HeavyChart />
      </Suspense>

      {/* Modal chỉ download khi user mở lần đầu */}
      <button
        onClick={() => setShowSettings(true)}
        onMouseEnter={() => import("./SettingsModal")} // preload khi hover
      >
        Settings
      </button>
      {showSettings && (
        <Suspense fallback={<Spinner />}>
          <SettingsModal />
        </Suspense>
      )}
    </ErrorBoundary>
  );
}
```

```jsx
// Lazy load bất kỳ thứ gì khi vào viewport bằng IntersectionObserver
function useInView(options) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect(); // chỉ cần trigger 1 lần
      }
    }, options);
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, inView];
}

function CommentsSection({ postId }) {
  const [ref, inView] = useInView({ rootMargin: "200px" }); // load trước 200px
  return <div ref={ref}>{inView ? <Comments postId={postId} /> : <CommentsSkeleton />}</div>;
}
```

### Đáp án mẫu

> "Lazy loading là trì hoãn load resource đến khi thực sự cần, để giảm initial bundle và tăng tốc trang. Trong React em làm ở 3 tầng: **component** với `React.lazy` + `Suspense` — bundler tách chunk tại `import()`, modal hay chart nặng chỉ download khi user mở; **ảnh** với native `loading="lazy"`; **data và section dưới fold** với IntersectionObserver, set `rootMargin` để load trước khi user scroll tới. Ba lưu ý em luôn áp dụng: không bao giờ lazy-load LCP element vì sẽ phá LCP; bọc error boundary vì chunk có thể 404 sau deploy mới; và preload chunk khi user hover vào trigger để che latency — UX cảm giác instant. Với route-based app thì lazy theo route là mặc định, sau đó mới lazy tiếp các component nặng trong từng route."

---

## Câu 2: Code splitting là gì? Các chiến lược code splitting? `[Intermediate]`

### Câu hỏi

> Code splitting là gì và tại sao cần? Em hãy nêu các chiến lược code splitting phổ biến trong web app và trade-off của chúng.

### Giải thích lý thuyết

**Code splitting** = tách bundle JS thành nhiều **chunk nhỏ**, load theo nhu cầu thay vì một file khổng lồ. Lý do: JS không chỉ tốn thời gian download mà còn tốn **parse + compile + execute** trên main thread — 1MB JS "đắt" hơn nhiều so với 1MB ảnh. Bundle lớn → TTI/INP tệ, đặc biệt trên mobile.

Các chiến lược chính:

1. **Route-based splitting** (phổ biến nhất, hiệu quả nhất): mỗi route một chunk. Next.js/Remix làm tự động theo file-system routing. User vào `/home` không cần code của `/admin`.
2. **Component-based splitting**: tách component nặng, hiếm dùng (modal, chart, rich editor) bằng `React.lazy`/`dynamic import`.
3. **Vendor splitting**: tách `node_modules` thành chunk riêng — code app đổi thường xuyên nhưng vendor ổn định → cache vendor chunk lâu dài.
4. **Conditional/interaction-based**: load khi user tương tác (mở dropdown nặng, bật feature flag) hoặc theo điều kiện (polyfill chỉ cho browser cũ, locale chỉ cho ngôn ngữ đang dùng).

Trade-off cần nói:

- Quá nhiều chunk nhỏ → nhiều request, waterfall (chunk A load xong mới biết cần chunk B). HTTP/2 multiplexing giảm chi phí request nhưng waterfall vẫn là vấn đề → cần **preload/prefetch**.
- Chunk chung giữa nhiều route → bundler tự tách shared chunk (`splitChunks` của webpack, Vite tự động qua Rollup).
- Lazy route làm navigation có "khựng" → prefetch route khi link vào viewport (Next.js `<Link>` làm sẵn).

### Code minh hoạ

```jsx
// 1. Route-based với React Router
import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

const Home = lazy(() => import("./pages/Home"));
const Admin = lazy(() => import("./pages/Admin")); // user thường không bao giờ tải chunk này

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/admin", element: <Admin /> },
]);
```

```js
// 2. Next.js: dynamic import với ssr: false cho lib chỉ chạy client
import dynamic from "next/dynamic";

const RichEditor = dynamic(() => import("@/components/RichEditor"), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});
```

```js
// 3. Vendor splitting với Vite (rollup manualChunks)
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-charts": ["recharts"], // lib nặng, ít đổi → cache lâu
        },
      },
    },
  },
});
```

```js
// 4. Interaction-based: chỉ load lib khi user thực sự dùng
button.addEventListener("click", async () => {
  const { default: confetti } = await import("canvas-confetti");
  confetti();
});
```

### Đáp án mẫu

> "Code splitting là tách bundle thành nhiều chunk load theo nhu cầu. Lý do quan trọng: JS đắt gấp nhiều lần ảnh cùng size vì tốn parse và execute trên main thread — bundle lớn phá TTI và INP. Em dùng 4 chiến lược theo thứ tự ưu tiên: **route-based** là mặc định và hiệu quả nhất — Next.js làm tự động; **component-based** cho thứ nặng và hiếm dùng như modal, chart, editor; **vendor splitting** để tách `node_modules` thành chunk ổn định, cache được lâu dù app code đổi liên tục; và **interaction-based** — lib như confetti hay export-excel chỉ load lúc click. Trade-off phải quản: nhiều chunk gây waterfall nên cần prefetch — Next.js `Link` tự prefetch khi vào viewport; và chunk có thể 404 sau deploy nên cần error boundary với retry. Nguyên tắc của em: đo bằng bundle analyzer trước, split chỗ có impact thật thay vì split mọi thứ."

---

## Câu 3: Bundle analysis — phát hiện và giảm bundle size? `[Intermediate]`

### Câu hỏi

> Bundle production của app là 2MB. Em dùng công cụ gì để phân tích, và có những kỹ thuật nào để giảm bundle size?

### Giải thích lý thuyết

**Bước 1 — Đo và visualize:**

- `webpack-bundle-analyzer`, `rollup-plugin-visualizer` (Vite), `@next/bundle-analyzer` — treemap cho thấy package nào chiếm bao nhiêu.
- `source-map-explorer` — phân tích theo source map, chính xác theo file thật.
- Import cost extension / bundlephobia.com — check size trước khi cài lib.

**Bước 2 — Các "thủ phạm" kinh điển:**

- Lib nặng có bản thay thế nhẹ: `moment` (≈70KB + locales) → `date-fns`/`dayjs`; `lodash` full → `lodash-es` import lẻ hoặc native methods.
- **Import sai cách phá tree-shaking**: `import _ from "lodash"` kéo cả lib; `import { debounce } from "lodash"` với CommonJS cũng kéo cả lib.
- Duplicate dependencies: 2 version của cùng package trong lockfile.
- Locale/timezone data, source map, polyfill thừa cho browser hiện đại.
- Icon library import toàn bộ thay vì từng icon.

**Bước 3 — Kỹ thuật giảm:**

- **Tree-shaking**: hoạt động với ESM + `sideEffects: false`; kiểm tra lib có ship ESM không.
- **Code splitting** (câu trước) — giảm initial chunk, không giảm tổng.
- **Compression**: Brotli tốt hơn gzip ~15-20%.
- **Hạ target transpile**: bỏ polyfill/transform thừa khi chỉ support browser modern (`browserslist`).
- **Performance budget trong CI**: fail build nếu chunk vượt ngưỡng — chặn regression.

### Code minh hoạ

```bash
# Vite: visualize bundle
npm i -D rollup-plugin-visualizer
```

```js
// vite.config.ts
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [react(), visualizer({ open: true, gzipSize: true, brotliSize: true })],
});
```

```js
// WRONG: kéo cả lodash (~70KB min) vào bundle
import _ from "lodash";
_.debounce(fn, 300);

// CORRECT: chỉ lấy hàm cần (ESM, tree-shakeable)
import debounce from "lodash-es/debounce";
debounce(fn, 300);

// WRONG: import cả icon set
import * as Icons from "lucide-react";

// CORRECT: import từng icon
import { Search, Menu } from "lucide-react";
```

```json
// package.json — performance budget với size-limit, chạy trong CI
{
  "size-limit": [
    { "path": "dist/assets/index-*.js", "limit": "180 KB" },
    { "path": "dist/assets/vendor-*.js", "limit": "250 KB" }
  ],
  "scripts": { "size": "size-limit" }
}
```

### Đáp án mẫu

> "Em làm theo quy trình đo → tìm thủ phạm → fix → chặn regression. **Đo** bằng bundle analyzer treemap — với Vite là `rollup-plugin-visualizer`, Next.js có `@next/bundle-analyzer` — nhìn phát biết ngay package nào chiếm nhiều nhất. **Thủ phạm kinh điển** em hay thấy: moment kèm toàn bộ locale thay vì dayjs; import lodash sai cách phá tree-shaking; icon library import nguyên set; duplicate version trong lockfile; polyfill thừa cho browser modern. **Fix**: thay lib nhẹ hơn — check bundlephobia trước khi cài; đảm bảo import ESM để tree-shake; code-split để giảm initial load; Brotli compression. Quan trọng nhất là **chặn regression**: em set performance budget bằng `size-limit` trong CI — PR nào làm chunk vượt ngưỡng là fail build, vì bundle size không giữ thì 6 tháng sau lại phình về 2MB."

---

## Câu 4: Virtual scrolling (windowing) là gì? Khi nào cần dùng? `[Intermediate]`

### Câu hỏi

> Virtual scrolling là gì? Khi nào em quyết định dùng nó, và khi nào không cần? Có những trade-off gì?

### Giải thích lý thuyết

**Virtual scrolling (windowing)** = chỉ render các item **đang hiển thị trong viewport** (+ vài item đệm gọi là overscan), thay vì render toàn bộ list. Container giữ chiều cao tổng bằng spacer/transform để scrollbar đúng tỉ lệ; khi user scroll, item ra khỏi viewport bị unmount, item mới vào được mount.

Tại sao cần: 10.000 row × mỗi row vài chục DOM node = hàng trăm nghìn node → tốn RAM, layout/paint chậm, scroll giật, INP tệ. Với windowing, DOM chỉ giữ ~20-40 node bất kể list dài bao nhiêu.

**Khi nào dùng:**

- List/table > ~500-1000 item render cùng lúc, đặc biệt khi mỗi item phức tạp (ảnh, nested component).
- Infinite feed, log viewer, bảng dữ liệu lớn, dropdown nhiều option.

**Khi nào KHÔNG cần:**

- List ngắn (< vài trăm item đơn giản) — windowing thêm phức tạp vô ích.
- **Pagination đã giải quyết được** — nếu UX cho phép phân trang thì đơn giản hơn nhiều.
- SEO quan trọng — item không render thì crawler không thấy.

**Trade-off:**

- `Ctrl+F` của browser không tìm được content chưa render; accessibility cần xử lý thêm (`aria-rowcount`...).
- **Dynamic height** là phần khó nhất — phải measure thực tế (`measureElement` của TanStack Virtual).
- Scroll quá nhanh có thể thấy khoảng trắng (blank flash) — tăng overscan để giảm.

Thư viện: `@tanstack/react-virtual`, `react-window`. CSS thuần có `content-visibility: auto` cho case đơn giản.

### Code minh hoạ

```jsx
import { useVirtualizer } from "@tanstack/react-virtual";

function BigList({ items }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: items.length, // 100k item vẫn OK
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48, // ước lượng height mỗi row
    overscan: 8, // render đệm 8 item ngoài viewport — giảm blank flash
  });

  return (
    <div ref={parentRef} style={{ height: 600, overflow: "auto" }}>
      {/* Spacer giữ tổng chiều cao để scrollbar đúng */}
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((vRow) => (
          <div
            key={vRow.key}
            ref={virtualizer.measureElement} // đo height thật cho dynamic content
            data-index={vRow.index}
            style={{
              position: "absolute",
              top: 0,
              width: "100%",
              transform: `translateY(${vRow.start}px)`,
            }}
          >
            <Row item={items[vRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

```css
/* Giải pháp CSS thuần cho case đơn giản: browser skip render phần off-screen */
.list-item {
  content-visibility: auto;
  contain-intrinsic-size: auto 48px; /* giữ chỗ để scrollbar không nhảy */
}
```

### Đáp án mẫu

> "Virtual scrolling là chỉ render item trong viewport cộng vài item đệm, giữ scrollbar đúng bằng spacer — 100k row thì DOM cũng chỉ có ~30 node, nên RAM và paint cost gần như không đổi theo độ dài list. Em dùng khi list trên dưới nghìn item trở lên mà phải scroll liền mạch — feed, log viewer, data table — và **không** dùng khi list ngắn hoặc khi pagination giải quyết được, vì windowing có giá: `Ctrl+F` không tìm thấy content chưa render, accessibility phải xử lý thêm, và dynamic height khó — phải dùng `measureElement` để đo thật. Thư viện em chọn là `@tanstack/react-virtual`, chỉnh `overscan` để tránh blank flash khi scroll nhanh. Với case đơn giản em cân nhắc `content-visibility: auto` của CSS — không cần JS. Em từng áp dụng cho bảng 50k row, scroll mượt cả trên thiết bị Android yếu."
