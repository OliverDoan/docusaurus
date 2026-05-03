---
sidebar_position: 5
title: "5. memo, lazy, Suspense, Code Splitting, Profiler"
---

# memo, lazy, Suspense, Code Splitting, Profiler

Performance optimization trong React là chủ đề "senior-level" -- không phải vì khó, mà vì cần hiểu **khi nào** optimize và **khi nào** không. Trong phỏng vấn, người ta muốn biết bạn có hiểu React rendering model đủ để biết optimize đúng cho không.

---

## Mục lục

- [Câu 1: React.memo -- khi nào dùng, khi nào không nên dùng? `[Intermediate]`](#câu-1-reactmemo-khi-nào-dùng-khi-nào-không-nên-dùng-intermediate)
- [Câu 2: useMemo và useCallback để optimize performance -- best practices? `[Senior]`](#câu-2-usememo-và-usecallback-để-optimize-performance-best-practices-senior)
- [Câu 3: React.lazy và Suspense cho code splitting `[Intermediate]`](#câu-3-reactlazy-và-suspense-cho-code-splitting-intermediate)
- [Câu 4: Dynamic Imports -- ngoài React.lazy còn dùng thế nào? `[Senior]`](#câu-4-dynamic-imports-ngoài-reactlazy-còn-dùng-thế-nào-senior)
- [Câu 5: React Profiler -- debug performance như thế nào? `[Senior]`](#câu-5-react-profiler-debug-performance-như-thế-nào-senior)
- [Câu 6: Virtualization -- render danh sách lớn hiệu quả `[Senior]`](#câu-6-virtualization-render-danh-sách-lớn-hiệu-quả-senior)
- [Bảng tổng hợp các chiến lược Performance Optimization](#bảng-tổng-hợp-các-chiến-lược-performance-optimization)
- [Lỗi thường gặp khi trả lời](#lỗi-thường-gặp-khi-trả-lời)

---

## Câu 1: React.memo -- khi nào dùng, khi nào không nên dùng? `[Intermediate]`

### Giải thích lý thuyết

`React.memo` là HOC bọc quanh function component. Nó **skip re-render** nếu props không thay đổi (shallow comparison mặc định).

**Khi nào dùng:**

- Component render nặng (nhiều DOM elements, tính toán phức tạp)
- Component nhận cùng props từ parent render thường xuyên
- Component ở sâu trong tree nhưng parent re-render nhiều

**Khi nào KHÔNG dùng:**

- Component re-render nhanh (đơn giản, ít DOM)
- Props thay đổi gần như mỗi lần render
- Premature optimization -- memo có overhead riêng (so sánh props)

**Lưu ý:** memo chỉ shallow compare. Nếu truyền object/array/function mới mỗi render, memo vô tác dụng => cần `useMemo`/`useCallback` cho props đó.

### Code ví dụ

```tsx
import { memo, useState, useCallback, useMemo } from "react";

// Component nặng -- nên memo
const ExpensiveChart = memo(function ExpensiveChart({
  data,
  onSelect,
}: {
  data: number[];
  onSelect: (index: number) => void;
}) {
  console.log("Chart rendered!");
  // Giả sử: render SVG phức tạp với 10,000 điểm
  return (
    <svg width={800} height={400}>
      {data.map((value, i) => (
        <rect
          key={i}
          x={i * 2}
          y={400 - value}
          width={1.5}
          height={value}
          fill="blue"
          onClick={() => onSelect(i)}
        />
      ))}
    </svg>
  );
});

// Parent component
function Dashboard() {
  const [count, setCount] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // useMemo: giữ reference của data stable
  const chartData = useMemo(() => {
    return Array.from({ length: 10000 }, () => Math.random() * 400);
  }, []); // Chỉ tạo 1 lần

  // useCallback: giữ reference của function stable
  const handleSelect = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  return (
    <div>
      {/* Click button này KHÔNG re-render chart (nhờ memo + stable props) */}
      <button onClick={() => setCount((c) => c + 1)}>Count: {count}</button>

      <p>Selected: {selectedIndex}</p>

      {/* ExpensiveChart chỉ re-render khi chartData hoặc handleSelect thay đổi */}
      <ExpensiveChart data={chartData} onSelect={handleSelect} />
    </div>
  );
}

// Custom comparison function
const UserCard = memo(
  function UserCard({ user }: { user: User }) {
    return (
      <div>
        <h3>{user.name}</h3>
        <p>{user.email}</p>
      </div>
    );
  },
  // Chỉ re-render khi user.id thay đổi (bỏ qua các field khác)
  (prevProps, nextProps) => prevProps.user.id === nextProps.user.id,
);
```

### Đáp án mẫu

> "React.memo skip re-render khi props không đổi (shallow compare). Dùng cho components render nặng mà parent re-render thường xuyên. Cần kết hợp với useMemo/useCallback để đảm bảo object/function props stable. Không nên dùng cho mọi component -- memo có overhead, chỉ dùng khi đó được improvement. Có thể truyền custom comparison function cho trường hợp đặc biệt."

---

## Câu 2: useMemo và useCallback để optimize performance -- best practices? `[Senior]`

### Giải thích lý thuyết

**Nguyên tắc vàng**: Đo trước, optimize sau.

`useMemo` và `useCallback` có **overhead riêng**:

- Lưu function/value trong memory
- So sánh dependencies mỗi render
- Tăng độ phức tạp code

**Chỉ dùng khi:**

1. Kết hợp với `React.memo` (đảm bảo props stable)
2. Tính toán thực sự nặng (>1ms) -- sort/filter danh sách lớn
3. Value/function được dùng làm dependency của hook khác
4. Tạo context value (tránh re-render tất cả consumers)

**KHÔNG dùng khi:**

- Phép tính đơn giản (số học, string concat)
- Component không dùng memo
- "Phải memo mọi thứ" mentality

### Code ví dụ

```tsx
import { useState, useMemo, useCallback, memo } from "react";

// --- KHI NÊN DÙNG ---

// 1. Tính toán nặng
function SearchResults({ items, query }: { items: Item[]; query: string }) {
  // DÙNG: filter 100,000 items là nặng
  const filtered = useMemo(() => {
    return items
      .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, query]);

  return <List items={filtered} />;
}

// 2. Stable reference cho memo child
const MemoChild = memo(({ onClick }: { onClick: () => void }) => {
  console.log("MemoChild rendered");
  return <button onClick={onClick}>Click</button>;
});

function Parent() {
  const [count, setCount] = useState(0);

  // DÙNG: MemoChild là memo, cần stable function reference
  const handleClick = useCallback(() => {
    console.log("clicked");
  }, []);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount((c) => c + 1)}>+</button>
      <MemoChild onClick={handleClick} />
    </div>
  );
}

// 3. Context value
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState("light");

  // DÙNG: tránh tất cả consumers re-render mỗi lần provider render
  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// --- KHI KHÔNG NÊN DÙNG ---

function SimpleComponent({ name }: { name: string }) {
  // KHÔNG CẦN: phép tính này cực nhanh
  // const greeting = useMemo(() => `Hello, ${name}!`, [name]);
  const greeting = `Hello, ${name}!`; // Nhanh hơn, đơn giản hơn

  // KHÔNG CẦN: child không dùng memo
  // const handleClick = useCallback(() => alert('hi'), []);
  const handleClick = () => alert("hi"); // OK vì child không memo

  return (
    <div>
      <p>{greeting}</p>
      <button onClick={handleClick}>Greet</button>
    </div>
  );
}
```

### Đáp án mẫu

> "useMemo và useCallback chỉ hữu ích khi có performance problem thực sự -- đo bằng Profiler trước. 3 trường hợp chính: tính toán nặng (>1ms), stable props cho memo child, và context value. Không memo mọi thứ -- overhead của memo có thể lớn hơn benefit. Nguyên tắc: đo trước, optimize sau."

---

## Câu 3: React.lazy và Suspense cho code splitting `[Intermediate]`

### Giải thích lý thuyết

**Code splitting** là kỹ thuật chia bundle thành các chunk nhỏ, chỉ load khi cần. Giảm thời gian load trang ban đầu.

**React.lazy**: cho phép import component động (dynamic import). Component chỉ được download khi render lần đầu.

**Suspense**: wrapper hiện thị fallback UI trong khi component đang load.

**Khi nào dùng:**

- Routes -- mỗi page là 1 chunk
- Components lớn (editor, chart library)
- Features ít dùng (settings, admin panel)
- Modals, dialogs (chỉ load khi mở)

### Code ví dụ

```tsx
import { lazy, Suspense, useState } from "react";

// Dynamic import -- tạo chunk riêng
const HeavyEditor = lazy(() => import("./HeavyEditor"));
const AdminPanel = lazy(() => import("./AdminPanel"));
const ChartDashboard = lazy(() => import("./ChartDashboard"));

// Named export -- cần wrapper
const Settings = lazy(() =>
  import("./Settings").then((module) => ({
    default: module.SettingsPage, // Convert named to default export
  })),
);

// Route-based code splitting
function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Mỗi route là 1 chunk riêng */}
        <Route path="/editor" element={<HeavyEditor />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/dashboard" element={<ChartDashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}

// Component-based code splitting
function ProductPage() {
  const [showReviews, setShowReviews] = useState(false);

  // ReviewSection chỉ load khi user click "Show Reviews"
  const ReviewSection = lazy(() => import("./ReviewSection"));

  return (
    <div>
      <ProductInfo />

      <button onClick={() => setShowReviews(true)}>Show Reviews</button>

      {showReviews && (
        <Suspense fallback={<p>Loading reviews...</p>}>
          <ReviewSection productId="123" />
        </Suspense>
      )}
    </div>
  );
}

// Loading component đẹp hơn
function LoadingSpinner() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "200px",
      }}
    >
      <div className="spinner" />
      <p>Đang tải...</p>
    </div>
  );
}

// Error Boundary cho lazy components
import { Component, ErrorInfo } from "react";

class LazyErrorBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Lazy load failed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Sử dụng với Error Boundary
function SafeApp() {
  return (
    <LazyErrorBoundary fallback={<p>Không thể tải module. Thử lại sau.</p>}>
      <Suspense fallback={<LoadingSpinner />}>
        <HeavyEditor />
      </Suspense>
    </LazyErrorBoundary>
  );
}
```

### Đáp án mẫu

> "React.lazy cho dynamic import components, Suspense hiện fallback khi loading. Dùng cho route-based splitting (mỗi page 1 chunk) và component-based splitting (features lớn, ít dùng). Luôn wrap với Error Boundary để xử lý lỗi load. Kết hợp với bundler (webpack, vite) để tự động tạo chunks."

---

## Câu 4: Dynamic Imports -- ngoài React.lazy còn dùng thế nào? `[Senior]`

### Giải thích lý thuyết

**Dynamic import** (`import()`) là JavaScript feature, không chỉ của React. Có thể dùng cho:

- Load library khi cần (VD: moment, lodash)
- Conditional imports (VD: polyfills cho browser cũ)
- Prefetching (load trước khi user cần)

**Khác với React.lazy**: dynamic import trả về Promise của module, có thể dùng ở bất kỳ đâu, không chỉ cho components.

### Code ví dụ

```tsx
import { useState, useEffect, useCallback } from "react";

// 1. Load heavy library khi cần
function MarkdownEditor() {
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState("");

  const renderPreview = useCallback(async () => {
    // Chỉ load 'marked' library khi user click Preview
    const { marked } = await import("marked");
    setPreview(marked.parse(content));
  }, [content]);

  return (
    <div>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} />
      <button onClick={renderPreview}>Preview</button>
      <div dangerouslySetInnerHTML={{ __html: preview }} />
    </div>
  );
}

// 2. Conditional import -- polyfill
async function initApp() {
  if (!window.IntersectionObserver) {
    await import("intersection-observer"); // Polyfill
  }

  // Tiếp tục khởi tạo app
  const { createRoot } = await import("react-dom/client");
  const { default: App } = await import("./App");

  createRoot(document.getElementById("root")!).render(<App />);
}

// 3. Prefetch -- load trước khi user cần
function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const prefetch = () => {
    // Khi user hover, bắt đầu load chunk
    switch (to) {
      case "/dashboard":
        import("./pages/Dashboard");
        break;
      case "/settings":
        import("./pages/Settings");
        break;
    }
  };

  return (
    <a href={to} onMouseEnter={prefetch}>
      {children}
    </a>
  );
}

// 4. Webpack magic comments
const AdminPanel = lazy(
  () =>
    import(
      /* webpackChunkName: "admin" */
      /* webpackPrefetch: true */
      "./AdminPanel"
    ),
);

// 5. Feature flags -- load feature conditionally
async function loadFeature(featureName: string) {
  const features: Record<string, () => Promise<any>> = {
    "new-editor": () => import("./features/NewEditor"),
    analytics: () => import("./features/Analytics"),
    "ai-assist": () => import("./features/AIAssist"),
  };

  const loader = features[featureName];
  if (!loader) throw new Error(`Unknown feature: ${featureName}`);

  const module = await loader();
  return module.default;
}
```

### Đáp án mẫu

> "Dynamic import là JavaScript feature trả về Promise của module. Ngoài React.lazy, dùng cho: load heavy libraries khi cần, conditional polyfills, prefetching trên hover, và feature flags. Webpack magic comments (`webpackChunkName`, `webpackPrefetch`) giúp kiểm soát chunk naming và loading strategy. Prefetch khi hover là kỹ thuật đơn giản nhưng rất hiệu quả."

---

## Câu 5: React Profiler -- debug performance như thế nào? `[Senior]`

### Giải thích lý thuyết

**React Profiler** có 2 dạng:

1. **React DevTools Profiler** (browser extension) -- GUI, dễ dùng
2. **Profiler component** (API) -- programmatic, log data

**Cách dùng DevTools Profiler:**

1. Mở React DevTools > tab Profiler
2. Click Record
3. Thực hiện thao tác cần đo
4. Click Stop
5. Phân tích: commit nào lâu, component nào render nhiều

**Metrics quan trọng:**

- **Commit duration**: tổng thời gian render 1 commit
- **Render duration**: thời gian render 1 component
- **Why did this render?**: checkbox trong DevTools settings

### Code ví dụ

```tsx
import { Profiler, ProfilerOnRenderCallback, useState } from "react";

// Profiler component -- log render data
const onRender: ProfilerOnRenderCallback = (
  id, // Profiler id
  phase, // "mount" | "update"
  actualDuration, // Thời gian render thực tế (ms)
  baseDuration, // Thời gian render không có memo (ms)
  startTime, // Khi React bắt đầu render commit này
  commitTime, // Khi React commit DOM
) => {
  // Log hoặc gửi metrics lên monitoring service
  console.table({
    id,
    phase,
    actualDuration: `${actualDuration.toFixed(2)}ms`,
    baseDuration: `${baseDuration.toFixed(2)}ms`,
    startTime,
    commitTime,
  });

  // Cảnh báo nếu render quá lâu
  if (actualDuration > 16) {
    console.warn(
      `[Performance] ${id} took ${actualDuration.toFixed(2)}ms ` +
        `(target: 16ms for 60fps)`,
    );
  }
};

function App() {
  return (
    <Profiler id="App" onRender={onRender}>
      <Header />
      <Profiler id="MainContent" onRender={onRender}>
        <ProductList />
      </Profiler>
      <Profiler id="Sidebar" onRender={onRender}>
        <Sidebar />
      </Profiler>
    </Profiler>
  );
}

// Custom hook: đo render count
function useRenderCount(componentName: string) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  useEffect(() => {
    console.log(`${componentName} rendered ${renderCount.current} times`);
  });

  return renderCount.current;
}

// Custom hook: đo render time
function useRenderTime(componentName: string) {
  const startTime = performance.now();

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (duration > 16) {
      console.warn(`[Slow Render] ${componentName}: ${duration.toFixed(2)}ms`);
    }
  });
}

// Sử dụng
function ProductList() {
  useRenderCount("ProductList");
  useRenderTime("ProductList");

  // ... render logic
  return <div>Products</div>;
}
```

### Debug workflow

1. **Xác định vấn đề**: user báo lag, hay bạn thấy janky scroll
2. **Đo bằng Profiler**: Record interaction, xem commit nào lâu
3. **Tìm component chậm**: sort by render duration
4. **Hiểu nguyên nhân**: "Why did this render?" trong DevTools
5. **Optimize**: memo, useMemo, useCallback, hoặc restructure
6. **Đo lại**: verify improvement

### Đáp án mẫu

> "React Profiler (DevTools và API) đo render duration của từng component. Workflow: đo trước, tìm bottleneck, optimize, đo lại. DevTools Profiler có 'Why did this render?' để hiểu nguyên nhân. Profiler API cho phép log metrics programmatically và gửi lên monitoring. Target: mỗi commit dưới 16ms cho 60fps."

---

## Câu 6: Virtualization -- render danh sách lớn hiệu quả `[Senior]`

### Giải thích lý thuyết

Khi render danh sách 10,000+ items, DOM quá nhiều elements sẽ lag. **Virtualization** (windowing) chỉ render những items **trong viewport** -- giảm DOM nodes từ 10,000 xuống còn ~20-50.

**Thư viện phổ biến:**

- `react-window`: nhẹ, đơn giản (Recommendation của React docs)
- `react-virtuoso`: nhiều tính năng hơn (auto-size, grouped, infinite scroll)
- `@tanstack/react-virtual`: headless, framework-agnostic

### Code ví dụ

```tsx
// --- react-window: FixedSizeList ---
import { FixedSizeList } from "react-window";

interface Item {
  id: number;
  name: string;
  email: string;
}

function VirtualizedList({ items }: { items: Item[] }) {
  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => (
    <div style={style} className="row">
      <span>{items[index].name}</span>
      <span>{items[index].email}</span>
    </div>
  );

  return (
    <FixedSizeList
      height={600} // Chiều cao container
      width="100%"
      itemCount={items.length}
      itemSize={50} // Chiều cao mỗi item (fixed)
    >
      {Row}
    </FixedSizeList>
  );
}

// --- react-virtuoso: VariableSizeList voi auto-sizing ---
import { Virtuoso } from "react-virtuoso";

function AutoSizeList({ items }: { items: Item[] }) {
  return (
    <Virtuoso
      style={{ height: "600px" }}
      totalCount={items.length}
      itemContent={(index) => (
        <div className="row" style={{ padding: "10px" }}>
          <h4>{items[index].name}</h4>
          <p>{items[index].email}</p>
          {/* Mỗi row có thể có chiều cao khác nhau */}
        </div>
      )}
    />
  );
}

// --- @tanstack/react-virtual: headless ---
import { useVirtualizer } from "@tanstack/react-virtual";

function TanStackVirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5, // Render thêm 5 items trên và dưới viewport
  });

  return (
    <div ref={parentRef} style={{ height: "600px", overflow: "auto" }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {items[virtualRow.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Infinite scroll voi react-virtuoso ---
function InfiniteList() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    const res = await fetch(`/api/items?offset=${items.length}&limit=50`);
    const newItems = await res.json();

    setItems((prev) => [...prev, ...newItems]);
    setLoading(false);
  }, [items.length, loading]);

  return (
    <Virtuoso
      style={{ height: "100vh" }}
      data={items}
      endReached={loadMore}
      itemContent={(index, item) => (
        <div className="row">
          <span>{item.name}</span>
        </div>
      )}
      components={{
        Footer: () => (loading ? <p>Loading more...</p> : null),
      }}
    />
  );
}
```

### Bảng so sánh thư viện virtualization

| Tiêu chí        | react-window                 | react-virtuoso  | @tanstack/react-virtual |
| --------------- | ---------------------------- | --------------- | ----------------------- |
| Bundle size     | ~6KB                         | ~15KB           | ~5KB                    |
| API style       | Component-based              | Component-based | Headless (hook)         |
| Auto-size items | Không (cần VariableSizeList) | Có              | Có (estimate)           |
| Infinite scroll | Cần tự viết                  | Built-in        | Cần tự viết             |
| Grouped items   | Không                        | Có              | Có                      |
| Learning curve  | Thấp                         | Thấp            | Trung bình              |
| Flexibility     | Trung bình                   | Cao             | Rất cao                 |

### Đáp án mẫu

> "Virtualization chỉ render items trong viewport, giảm DOM nodes từ hàng ngàn xuống hàng chục. react-window cho trường hợp đơn giản, react-virtuoso cho auto-sizing và infinite scroll, @tanstack/react-virtual cho headless approach. Cần virtualization khi render > 100-200 items. Kết hợp với useMemo cho data và memo cho Row component để tối ưu tối đa."

---

## Bảng tổng hợp các chiến lược Performance Optimization

| Chiến lược         | Vấn đề giải quyết                 | Độ phức tạp | Khi nào dùng                         |
| ------------------ | --------------------------------- | ----------- | ------------------------------------ |
| `React.memo`       | Child re-render không cần thiết   | Thấp        | Component nặng, parent render nhiều  |
| `useMemo`          | Tính toán lại không cần thiết     | Thấp        | Sort/filter danh sách lớn            |
| `useCallback`      | Function reference mới mỗi render | Thấp        | Props cho memo child                 |
| `React.lazy`       | Bundle lớn, load chậm             | Thấp        | Route splitting, features lớn        |
| `Suspense`         | Loading state management          | Thấp        | Kết hợp với lazy, data fetching      |
| `useTransition`    | UI block khi render nặng          | Trung bình  | Search, filter realtime              |
| `useDeferredValue` | Input lag do render nặng          | Trung bình  | Heavy child với changing props       |
| Virtualization     | Danh sách quá nhiều DOM nodes     | Trung bình  | > 100-200 items                      |
| Code splitting     | Initial bundle quá lớn            | Thấp        | Mỗi dự án nên làm                    |
| Profiler           | Không biết optimize ở đâu         | Thấp        | Bước đầu tiên trước mỗi optimization |

### Thứ tự ưu tiên khi optimize

1. **Đo trước** -- dùng Profiler, xác định bottleneck
2. **Code splitting** -- giảm initial load (làm luôn, không cần đo)
3. **Virtualization** -- nếu có danh sách lớn
4. **React.memo + useMemo/useCallback** -- cho components cụ thể
5. **Concurrent features** -- cho UX improvements

---

## Lỗi thường gặp khi trả lời

1. **"Memo mọi thứ cho an toàn"** -- Sai. Memo có overhead: lưu giá trị + so sánh deps. Nếu props thay đổi thường xuyên, memo làm chậm hơn. Đo trước, optimize sau.

2. **Không biết React.lazy cần Suspense** -- lazy component PHẢI wrap trong Suspense, nếu không sẽ throw error khi loading.

3. **Nhầm code splitting với tree shaking** -- Code splitting chia bundle thành chunks (load khi cần). Tree shaking loại bỏ unused code (build time). Hai thứ khác nhau.

4. **Không biết Profiler** -- Nếu bạn nói "tôi optimize" nhưng không nói về cách đo, interviewer sẽ nghĩ bạn đang "guess". Luôn đo trước.

5. **Nói virtualization là "render thêm DOM khi scroll"** -- Sai. Virtualization **chỉ render items trong viewport**, và **recycle** DOM nodes khi scroll. Tổng số DOM nodes luôn nhỏ.

6. **Không nói về Error Boundary với lazy** -- Khi network lỗi, lazy component fail. Cần Error Boundary để xử lý gracefully thay vì white screen.
