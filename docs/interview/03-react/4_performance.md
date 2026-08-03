---
sidebar_position: 4
title: "4. React Performance"
---

# React Performance

> *Interviewer thường hỏi câu này ở vòng senior — và cách bạn trả lời cho thấy bạn đã làm production thật hay chỉ làm tutorial.*

:::note[Ghi nhớ nhanh]

- ⭐ **Đo trước, tối ưu sau** — dùng Network tab, Lighthouse, React DevTools Profiler, Chrome Performance; không tối ưu mò.
- **Giảm bundle size** — code splitting, lazy load, tree-shaking, phân tích bundle để cắt phần không dùng.
- **List rất dài** — virtualization (chỉ render item trong viewport) thay vì render toàn bộ 10.000 item.
- **Image optimization** — chọn format phù hợp, lazy load, responsive size, đặt kích thước tránh layout shift.
- **INP (Interaction to Next Paint)** — Core Web Vital đo độ trễ phản hồi tương tác; cải thiện bằng cắt long task, `useTransition`.
- **Server Components + streaming** — giảm JS gửi xuống client và cải thiện thời gian hiển thị.

:::

---

## Câu 1: App em chậm. Em debug từ đâu? `[Intermediate]`

### Câu hỏi

> Page dashboard load chậm, user complain. Em không biết chậm ở đâu. Quy trình debug của em?

### Giải thích lý thuyết

Đo trước, đoán sau. Không tối ưu mò.

Công cụ + tầng cần check:

1. **Network tab** — request có chậm/nhiều/lớn không?
2. **Lighthouse / WebPageTest** — Core Web Vitals (LCP, FID, CLS, INP).
3. **React DevTools Profiler** — component re-render bao nhiêu lần, mỗi lần mất bao lâu.
4. **Chrome Performance tab** — flamegraph, long task, layout/paint.
5. **Coverage tab** — JS/CSS không dùng.

Thường thì chậm do:
- Bundle quá lớn → JS download/parse chậm.
- Quá nhiều request waterfall.
- Re-render lan tràn.
- Layout thrashing, expensive paint.

### Code minh hoạ

```javascript
// React Profiler API — programmatic
import { Profiler } from "react";

function App() {
  return (
    <Profiler id="Dashboard" onRender={(id, phase, duration) => {
      console.log({ id, phase, duration });
      // send to analytics if duration > threshold
    }}>
      <Dashboard />
    </Profiler>
  );
}

// Web Vitals
import { onLCP, onINP, onCLS } from "web-vitals";

onLCP((metric) => console.log("LCP", metric.value));
onINP((metric) => console.log("INP", metric.value)); // replace FID in 2024+
onCLS((metric) => console.log("CLS", metric.value));

// Measure user-perceived "Time to Interactive"
performance.mark("dashboard-ready");
performance.measure("ttf-dashboard", "navigationStart", "dashboard-ready");

// User Timing API in DevTools timeline
```

### Đáp án mẫu

> "Em không tối ưu mò — em **đo trước**. Quy trình: mở Lighthouse để biết Core Web Vitals nào fail (LCP, INP, CLS). Sau đó mở Network tab xem có request waterfall, request lớn không. Rồi mở React DevTools Profiler record session, xem component nào render thường xuyên + lâu. Nếu là JS heavy → Chrome Performance tab record flamegraph để biết function nào tốn thời gian. Trải nghiệm cá nhân: 70% trường hợp 'app chậm' không phải code React mà là bundle quá lớn (300kb+ JS download chậm trên 3G) hoặc request waterfall (gọi tuần tự 5 API). Chỉ ~20% thực sự là re-render. Optimize sai chỗ thì code phức tạp hơn mà user không cảm thấy nhanh hơn."

---

## Câu 2: Bundle size — chiến lược giảm `[Intermediate]`

### Câu hỏi

> Bundle JS đang 800kb gzipped. Em muốn giảm xuống 200kb. Em làm gì?

### Giải thích lý thuyết

Bundle bloat đến từ:
1. Library quá nặng (lodash, moment).
2. Import nguyên thư viện thay vì cherry-pick.
3. Tree-shaking không hoạt động (CJS, side effects).
4. Polyfill không cần thiết.
5. Bundle tất cả route vào 1 chunk thay vì code-split.
6. Duplicate dependency (lock file lỗi).

### Code minh hoạ

```javascript
// 1. Analyze trước
// vite-bundle-visualizer / webpack-bundle-analyzer
// Xem chiếm chỗ thực sự ai

// 2. Cherry-pick import
// ❌
import _ from "lodash";              // 70kb
import moment from "moment";          // 90kb

// ✅
import debounce from "lodash/debounce"; // chỉ debounce
// Hoặc dùng lib nhẹ hơn:
import { format } from "date-fns";    // tree-shake tốt, ~5kb thực dùng
// Hoặc native:
new Intl.DateTimeFormat("vi-VN").format(new Date());

// 3. Route-based code split
const Dashboard = React.lazy(() => import("./Dashboard"));
const Settings = React.lazy(() => import("./Settings"));

<Suspense fallback={<Spinner />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/settings" element={<Settings />} />
  </Routes>
</Suspense>

// 4. Component-level split — heavy modal
function App() {
  const [showChart, setShowChart] = useState(false);
  const Chart = useMemo(() => React.lazy(() => import("./Chart")), []);

  return (
    <>
      <button onClick={() => setShowChart(true)}>Show chart</button>
      {showChart && (
        <Suspense fallback={<Spinner />}>
          <Chart />
        </Suspense>
      )}
    </>
  );
}

// 5. Dynamic import polyfill
async function loadPolyfill() {
  if (!window.IntersectionObserver) {
    await import("intersection-observer");
  }
}

// 6. Browser-list — tránh transpile thừa cho browser mới
// package.json
"browserslist": ["last 2 Chrome versions", "last 2 Safari versions"]
// → SWC/Babel emit ES2020+ code, bundle nhỏ hơn

// 7. Drop dependency thừa
// `moment` → `date-fns` hoặc `dayjs` (~2kb)
// `axios` → native `fetch`
// `lodash` → native Array methods hoặc cherry-pick
// `uuid` → `crypto.randomUUID()` (browser native)
```

### Đáp án mẫu

> "Em chạy bundle analyzer (`vite-bundle-visualizer` hoặc `webpack-bundle-analyzer`) để biết ai chiếm chỗ. Sau đó tấn công theo thứ tự: thứ nhất là **route-based code splitting** — chỉ load JS của route hiện tại, route khác lazy. Thường giảm 30-50% initial bundle. Thứ hai là **thay lib nặng**: `moment` (90kb) → `date-fns` hoặc native `Intl.DateTimeFormat`; `lodash` import nguyên → cherry-pick `lodash/debounce`; `axios` → native `fetch`. Thứ ba là **lazy load heavy modal/dialog** — Chart, Editor, PDF viewer chỉ load khi user trigger. Thứ tư là update **browserslist** để target browser hiện đại hơn, giảm polyfill. Cuối cùng: kiểm tra duplicate deps trong lock file (`npm ls react` xem có 2 version không). Một bundle 800kb → 200kb hoàn toàn realistic với mọi technique trên."

---

## Câu 3: List render 10,000 item — chiến lược `[Intermediate]`

### Câu hỏi

> Em hiển thị list 10,000 user. Render thẳng thì DOM lag. Em làm gì?

### Giải thích lý thuyết

3 chiến lược chính:

1. **Pagination** — chia page, mỗi page 20-50 item. Đơn giản nhất.
2. **Infinite scroll** — load thêm khi scroll tới gần đáy.
3. **Virtualization** (windowing) — render chỉ phần trong viewport, dù list 100k vẫn smooth. Lib: `react-window`, `@tanstack/react-virtual`.

Trade-off:
- Pagination: UX click "next page", search trong page khó.
- Infinite scroll: SEO khó, scroll position lệch khi back.
- Virtualization: phức tạp với row height động, hard to print/Ctrl+F.

### Code minh hoạ

```javascript
// Virtualization với @tanstack/react-virtual
import { useVirtualizer } from "@tanstack/react-virtual";

function BigList({ items }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // chiều cao mỗi row
    overscan: 5,
  });

  return (
    <div ref={parentRef} style={{ height: 600, overflow: "auto" }}>
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: "absolute",
              top: 0,
              transform: `translateY(${virtualRow.start}px)`,
              height: virtualRow.size,
              width: "100%",
            }}
          >
            {items[virtualRow.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}

// Infinite scroll với IntersectionObserver
function InfiniteList() {
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["users"],
    queryFn: ({ pageParam = 0 }) => api.get(`/users?offset=${pageParam}`),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const sentinelRef = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && hasNextPage && fetchNextPage()
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  return (
    <>
      {data?.pages.flatMap((page) => page.items).map((item) => <Row key={item.id} {...item} />)}
      <div ref={sentinelRef} /> {/* trigger when in view */}
    </>
  );
}
```

### Đáp án mẫu

> "Em không render 10k row trực tiếp — DOM với 10k node sẽ slow scroll, drain memory. Em chọn dựa trên UX requirements: nếu user cần Ctrl+F tìm trong list → pagination (chia trang). Nếu cần scroll mượt và list có thể dài tùy ý → **virtualization** với `@tanstack/react-virtual` hoặc `react-window` — render chỉ phần trong viewport (~20-30 row tại bất kỳ thời điểm), dù list 100k vẫn smooth. Trade-off của virtualization: hard to print, Ctrl+F của browser không hoạt động (vì DOM chỉ có visible row). Nếu UX là feed kiểu Facebook/Twitter → infinite scroll với IntersectionObserver. Em từng làm admin table với 50k row + sort/filter — virtualization là lựa chọn duy nhất chạy được smooth, và phải dùng `estimateSize` chính xác để scrollbar không nhảy."

---

## Câu 4: Image optimization — chiến lược `[Intermediate]`

### Câu hỏi

> Trang em có 30 ảnh. Page mất 5 giây để load. Em làm gì?

### Giải thích lý thuyết

Image chiếm > 50% byte của hầu hết website. Các technique:

1. **Format hiện đại**: WebP (~30% nhỏ hơn JPEG), AVIF (~50% nhỏ hơn).
2. **Responsive image**: `srcset` + `sizes` — browser chọn ảnh phù hợp viewport.
3. **Lazy loading**: `loading="lazy"` native, hoặc IntersectionObserver.
4. **CDN với on-the-fly resize**: Cloudinary, Imgix, Vercel Image, Next/Image.
5. **Placeholder**: LQIP (low-quality image placeholder), blurhash, dominant color.
6. **Compression**: tinify, mozjpeg, sharp.
7. **Priority hint**: `fetchpriority="high"` cho LCP image.

### Code minh hoạ

```html
<!-- 1. Modern format với fallback -->
<picture>
  <source type="image/avif" srcset="hero.avif" />
  <source type="image/webp" srcset="hero.webp" />
  <img src="hero.jpg" alt="Hero" />
</picture>

<!-- 2. Responsive image -->
<img
  src="img-800w.jpg"
  srcset="img-400w.jpg 400w, img-800w.jpg 800w, img-1200w.jpg 1200w"
  sizes="(max-width: 600px) 100vw, 800px"
  alt="Hero"
/>

<!-- 3. Native lazy loading -->
<img src="below-fold.jpg" loading="lazy" decoding="async" alt="" />

<!-- 4. Priority for LCP image -->
<img src="hero.jpg" fetchpriority="high" alt="Hero" />
```

```jsx
// Next.js Image — tự handle responsive, format, lazy, blur placeholder
import Image from "next/image";

<Image
  src="/hero.jpg"
  width={1200}
  height={600}
  alt="Hero"
  priority         // tải sớm cho LCP
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// Custom blur placeholder
function ProgressiveImage({ src, blurSrc, alt }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <img
        src={blurSrc}
        alt=""
        style={{ filter: "blur(20px)", opacity: loaded ? 0 : 1 }}
      />
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        style={{ position: "absolute", top: 0, opacity: loaded ? 1 : 0 }}
      />
    </div>
  );
}
```

### Đáp án mẫu

> "Em check 3 tầng: format, size, loading strategy. **Format**: chuyển sang WebP (30% nhỏ hơn JPEG) hoặc AVIF (50% nhỏ hơn). Dùng `<picture>` với fallback cho browser cũ. **Size**: responsive image với `srcset` + `sizes` — mobile không tải ảnh 1200px. **Loading**: `loading='lazy'` cho image dưới fold, `fetchpriority='high'` + `priority` cho LCP image (hero). **CDN**: dùng Cloudinary/Vercel Image để serve on-the-fly resize + format negotiation — không cần generate manual nhiều variant. Với Next.js dùng `next/image` đã handle hết. Một detail bị bỏ quên: thêm `width`/`height` explicit để browser reserve space → tránh CLS (layout shift). Em từng tối ưu một trang ảnh-heavy từ 8MB xuống 800KB chỉ bằng đổi format + responsive, page load 5s → 1.5s mà chất lượng visual không khác."

---

## Câu 5: INP — Interaction to Next Paint `[Senior]`

### Câu hỏi

> Google đã thay FID bằng INP làm Core Web Vital. Em hiểu INP là gì? Cách tối ưu?

### Giải thích lý thuyết

**INP** = thời gian từ khi user **bắt đầu interaction** (click, tap, keypress) đến khi browser **paint frame tiếp theo**. Khác với FID (chỉ đo delay), INP đo toàn bộ chu kỳ.

Mục tiêu:
- Good: ≤ 200ms.
- Needs improvement: 200-500ms.
- Poor: > 500ms.

Causes phổ biến:
- Heavy event handler (filter list trong click).
- React render đắt sau setState.
- Long task block main thread.
- Sync layout (forced reflow).

Cách tối ưu:
- Defer non-urgent work (`startTransition`, `setTimeout`, `requestIdleCallback`).
- Chunk large task.
- Virtualize list.
- Tránh layout thrashing.
- Optimistic UI để user thấy response ngay.

### Code minh hoạ

```javascript
// ❌ Click → block UI
function BadFilter({ items }) {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState(items);

  return (
    <input
      onChange={(e) => {
        const q = e.target.value;
        setQuery(q);
        // Synchronous filter 100k items → main thread block → INP cao
        setFiltered(items.filter((i) => i.name.includes(q)));
      }}
    />
  );
}

// ✅ useTransition để defer
function GoodFilter({ items }) {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState(items);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);              // urgent
          startTransition(() => {                 // not urgent
            setFiltered(items.filter((i) => i.name.includes(e.target.value)));
          });
        }}
      />
      {isPending && <Spinner />}
    </>
  );
}

// ✅ Chunk heavy work
async function processChunked(items, onProgress) {
  const chunk = 200;
  const results = [];
  for (let i = 0; i < items.length; i += chunk) {
    results.push(...items.slice(i, i + chunk).map(process));
    onProgress?.(i / items.length);
    await new Promise((r) => setTimeout(r, 0)); // yield
  }
  return results;
}

// Modern: scheduler.postTask
async function process(items) {
  for (const item of items) {
    if (navigator.scheduling?.isInputPending()) {
      await new Promise((r) => scheduler.postTask(r, { priority: "user-blocking" }));
    }
    processItem(item);
  }
}

// Tránh forced layout
// ❌
elements.forEach((el) => {
  el.style.width = (el.offsetWidth + 10) + "px"; // read + write trong loop
});

// ✅ batch read trước
const widths = elements.map((el) => el.offsetWidth); // tất cả read
elements.forEach((el, i) => { el.style.width = (widths[i] + 10) + "px"; }); // tất cả write
```

### Đáp án mẫu

> "INP đo toàn bộ chu kỳ từ user interaction tới paint tiếp theo — gồm cả input delay, processing, và rendering. Khác FID (chỉ đo delay đầu). Threshold tốt là 200ms. Causes em thấy nhiều nhất: heavy work trong event handler (filter list 10k item), React render đắt sau setState (component to + children không memo). Cách fix: thứ nhất, `useTransition` đánh dấu setState không khẩn cấp — React schedule lúc rảnh, không block input. Thứ hai, chunk large task với `setTimeout(0)` hoặc `scheduler.postTask` để yield cho input giữa các chunk. Thứ ba, virtualize list để giảm re-render cost. Thứ tư, tránh forced layout (read offsetWidth → write style → loop) — batch read trước, write sau. Đo INP với `web-vitals` lib và gửi về analytics để track ở field, không chỉ lab."

---

## Câu 6: Server Components & Streaming — performance impact `[Senior]`

### Câu hỏi

> Next.js App Router push Server Components và streaming SSR. Em hiểu performance benefit là gì? Trade-off?

### Giải thích lý thuyết

**React Server Components (RSC)**: component render trên server, **không** ship JS xuống client.

Benefits:
- **Smaller bundle** — server-only code (DB query, heavy lib) không vào client.
- **Direct data access** — fetch DB/file system trong component, không cần API endpoint.
- **Better LCP** — HTML được render sẵn, không chờ client hydrate.

**Streaming SSR** với Suspense:
- Server gửi HTML từng phần khi data ready, không chờ toàn page xong.
- User thấy header/skeleton ngay, body fill dần.

Trade-off:
- Mental model mới (client/server boundary `'use client'`).
- Không phải mọi lib support RSC.
- Debug khó hơn (server log vs client log).
- Coupling với framework (Next.js/Remix).

### Code minh hoạ

```jsx
// Server Component — không có 'use client'
// app/users/page.tsx
import { db } from "@/lib/db";

export default async function UsersPage() {
  const users = await db.user.findMany(); // chạy trên server, không ship code

  return (
    <ul>
      {users.map((u) => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
}

// Client Component — interactive
// app/components/UserCard.tsx
"use client";
import { useState } from "react";

export function UserCard({ user }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div onClick={() => setExpanded(!expanded)}>
      {user.name}
      {expanded && <Details user={user} />}
    </div>
  );
}

// Streaming với Suspense
// app/dashboard/page.tsx
import { Suspense } from "react";

export default function Dashboard() {
  return (
    <>
      <Header />  {/* render ngay */}
      <Suspense fallback={<RevenueSkeleton />}>
        <Revenue />  {/* fetch chậm, stream sau */}
      </Suspense>
      <Suspense fallback={<OrdersSkeleton />}>
        <Orders />   {/* fetch chậm, stream sau */}
      </Suspense>
    </>
  );
}

async function Revenue() {
  const data = await fetchRevenue(); // 2s
  return <RevenueChart data={data} />;
}

// User flow:
// t=0: HTML có header + 2 skeleton → first paint
// t=2s: Revenue stream xong → fill chart
// t=3s: Orders stream xong → fill orders
// LCP cải thiện rõ ràng so với "chờ tất cả mới render"
```

### Đáp án mẫu

> "RSC chính là **không ship code xuống client** cho component server. Lợi ích trực tiếp: bundle nhỏ hơn (không có db driver, markdown parser, heavy lib trong client bundle), và **direct data access** — `await db.findMany()` ngay trong component, không cần API endpoint trung gian, ít waterfall. Combine với **streaming SSR + Suspense**, server gửi HTML từng phần khi ready — user thấy header ngay, slow widget fill sau. LCP cải thiện rõ. Trade-off: mental model mới, phải nhớ component nào client/server (boundary `'use client'`), không phải lib nào cũng tương thích (Zustand cần wrap context để bridge server props vào client store). Debugging cũng phức tạp hơn — log server và client tách biệt. Em hiện đang dùng cho dự án mới và thấy performance tốt rõ rệt, nhưng team phải onboard pattern mới mất 2-3 tuần."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                | Đúng là                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| "Memo mọi thứ để tối ưu"                               | Chỉ tối ưu chỗ profile chỉ ra; memo bừa thêm overhead                |
| "Bundle nhỏ luôn cần Webpack config phức tạp"          | Cherry-pick import + lazy route đã giảm 50%+                         |
| "Lazy load là chậm hơn vì có loading state"            | Tốt cho overall — initial bundle nhỏ, user thấy page nhanh hơn       |
| "INP = FID rename"                                     | INP đo toàn cycle, FID chỉ đo delay đầu                              |
| "RSC thay thế hết client component"                    | Component interactive vẫn cần client; RSC bổ sung, không thay thế    |
