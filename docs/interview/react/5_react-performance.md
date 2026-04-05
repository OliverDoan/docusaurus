---
sidebar_position: 5
title: "memo, lazy, Suspense, Code Splitting, Profiler"
---

# memo, lazy, Suspense, Code Splitting, Profiler

Performance optimization trong React la chu de "senior-level" -- khong phai vi kho, ma vi can hieu **khi nao** optimize va **khi nao** khong. Trong phong van, nguoi ta muon biet ban co hieu React rendering model du de biet optimize dung cho khong.

---

## Cau 1: React.memo -- khi nao dung, khi nao khong nen dung? `[Intermediate]`

### Giai thich ly thuyet

`React.memo` la HOC boc quanh function component. No **skip re-render** neu props khong thay doi (shallow comparison mac dinh).

**Khi nao dung:**
- Component render nang (nhieu DOM elements, tinh toan phuc tap)
- Component nhan cung props tu parent render thuong xuyen
- Component o sau trong tree nhung parent re-render nhieu

**Khi nao KHONG dung:**
- Component re-render nhanh (don gian, it DOM)
- Props thay doi gần nhu moi lan render
- Premature optimization -- memo co overhead rieng (so sanh props)

**Luu y:** memo chi shallow compare. Neu truyen object/array/function moi moi render, memo vo tac dung => can `useMemo`/`useCallback` cho props do.

### Code vi du

```tsx
import { memo, useState, useCallback, useMemo } from 'react';

// Component nang -- nen memo
const ExpensiveChart = memo(function ExpensiveChart({
  data,
  onSelect,
}: {
  data: number[];
  onSelect: (index: number) => void;
}) {
  console.log('Chart rendered!');
  // Gia su: render SVG phuc tap voi 10,000 diem
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

  // useMemo: giu reference cua data stable
  const chartData = useMemo(() => {
    return Array.from({ length: 10000 }, () => Math.random() * 400);
  }, []); // Chi tao 1 lan

  // useCallback: giu reference cua function stable
  const handleSelect = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  return (
    <div>
      {/* Click button nay KHONG re-render chart (nho memo + stable props) */}
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>

      <p>Selected: {selectedIndex}</p>

      {/* ExpensiveChart chi re-render khi chartData hoac handleSelect thay doi */}
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
  // Chi re-render khi user.id thay doi (bo qua cac field khac)
  (prevProps, nextProps) => prevProps.user.id === nextProps.user.id
);
```

### Dap an mau

> "React.memo skip re-render khi props khong doi (shallow compare). Dung cho components render nang ma parent re-render thuong xuyen. Can ket hop voi useMemo/useCallback de dam bao object/function props stable. Khong nen dung cho moi component -- memo co overhead, chi dung khi do duoc improvement. Co the truyen custom comparison function cho truong hop dac biet."

---

## Cau 2: useMemo va useCallback de optimize performance -- best practices? `[Senior]`

### Giai thich ly thuyet

**Nguyen tac vang**: Do truoc, optimize sau.

`useMemo` va `useCallback` co **overhead rieng**:
- Luu function/value trong memory
- So sanh dependencies moi render
- Tang do phuc tap code

**Chi dung khi:**
1. Ket hop voi `React.memo` (dam bao props stable)
2. Tinh toan thuc su nang (>1ms) -- sort/filter danh sach lon
3. Value/function duoc dung lam dependency cua hook khac
4. Tao context value (tranh re-render tat ca consumers)

**KHONG dung khi:**
- Phep tinh don gian (so hoc, string concat)
- Component khong dung memo
- "Phai memo moi thu" mentality

### Code vi du

```tsx
import { useState, useMemo, useCallback, memo } from 'react';

// --- KHI NEN DUNG ---

// 1. Tinh toan nang
function SearchResults({ items, query }: { items: Item[]; query: string }) {
  // DUNG: filter 100,000 items la nang
  const filtered = useMemo(() => {
    return items
      .filter(item => item.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, query]);

  return <List items={filtered} />;
}

// 2. Stable reference cho memo child
const MemoChild = memo(({ onClick }: { onClick: () => void }) => {
  console.log('MemoChild rendered');
  return <button onClick={onClick}>Click</button>;
});

function Parent() {
  const [count, setCount] = useState(0);

  // DUNG: MemoChild la memo, can stable function reference
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
      <MemoChild onClick={handleClick} />
    </div>
  );
}

// 3. Context value
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('light');

  // DUNG: tranh tat ca consumers re-render moi lan provider render
  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// --- KHI KHONG NEN DUNG ---

function SimpleComponent({ name }: { name: string }) {
  // KHONG CAN: phep tinh nay cuc nhanh
  // const greeting = useMemo(() => `Hello, ${name}!`, [name]);
  const greeting = `Hello, ${name}!`; // Nhanh hon, don gian hon

  // KHONG CAN: child khong dung memo
  // const handleClick = useCallback(() => alert('hi'), []);
  const handleClick = () => alert('hi'); // OK vi child khong memo

  return (
    <div>
      <p>{greeting}</p>
      <button onClick={handleClick}>Greet</button>
    </div>
  );
}
```

### Dap an mau

> "useMemo va useCallback chi huu ich khi co performance problem thuc su -- do bang Profiler truoc. 3 truong hop chinh: tinh toan nang (>1ms), stable props cho memo child, va context value. Khong memo moi thu -- overhead cua memo co the lon hon benefit. Nguyen tac: do truoc, optimize sau."

---

## Cau 3: React.lazy va Suspense cho code splitting `[Intermediate]`

### Giai thich ly thuyet

**Code splitting** la ky thuat chia bundle thanh cac chunk nho, chi load khi can. Giam thoi gian load trang ban dau.

**React.lazy**: cho phep import component dong (dynamic import). Component chi duoc download khi render lan dau.

**Suspense**: wrapper hien thi fallback UI trong khi component dang load.

**Khi nao dung:**
- Routes -- moi page la 1 chunk
- Components lon (editor, chart library)
- Features it dung (settings, admin panel)
- Modals, dialogs (chi load khi mo)

### Code vi du

```tsx
import { lazy, Suspense, useState } from 'react';

// Dynamic import -- tao chunk rieng
const HeavyEditor = lazy(() => import('./HeavyEditor'));
const AdminPanel = lazy(() => import('./AdminPanel'));
const ChartDashboard = lazy(() => import('./ChartDashboard'));

// Named export -- can wrapper
const Settings = lazy(() =>
  import('./Settings').then(module => ({
    default: module.SettingsPage, // Convert named to default export
  }))
);

// Route-based code splitting
function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Moi route la 1 chunk rieng */}
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

  // ReviewSection chi load khi user click "Show Reviews"
  const ReviewSection = lazy(() => import('./ReviewSection'));

  return (
    <div>
      <ProductInfo />

      <button onClick={() => setShowReviews(true)}>
        Show Reviews
      </button>

      {showReviews && (
        <Suspense fallback={<p>Loading reviews...</p>}>
          <ReviewSection productId="123" />
        </Suspense>
      )}
    </div>
  );
}

// Loading component dep hon
function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px',
    }}>
      <div className="spinner" />
      <p>Dang tai...</p>
    </div>
  );
}

// Error Boundary cho lazy components
import { Component, ErrorInfo } from 'react';

class LazyErrorBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Lazy load failed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Su dung voi Error Boundary
function SafeApp() {
  return (
    <LazyErrorBoundary fallback={<p>Khong the tai module. Thu lai sau.</p>}>
      <Suspense fallback={<LoadingSpinner />}>
        <HeavyEditor />
      </Suspense>
    </LazyErrorBoundary>
  );
}
```

### Dap an mau

> "React.lazy cho dynamic import components, Suspense hien fallback khi loading. Dung cho route-based splitting (moi page 1 chunk) va component-based splitting (features lon, it dung). Luon wrap voi Error Boundary de xu ly loi load. Ket hop voi bundler (webpack, vite) de tu dong tao chunks."

---

## Cau 4: Dynamic Imports -- ngoai React.lazy con dung the nao? `[Senior]`

### Giai thich ly thuyet

**Dynamic import** (`import()`) la JavaScript feature, khong chi cua React. Co the dung cho:
- Load library khi can (VD: moment, lodash)
- Conditional imports (VD: polyfills cho browser cu)
- Prefetching (load truoc khi user can)

**Khac voi React.lazy**: dynamic import tra ve Promise cua module, co the dung o bat ky dau, khong chi cho components.

### Code vi du

```tsx
import { useState, useEffect, useCallback } from 'react';

// 1. Load heavy library khi can
function MarkdownEditor() {
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState('');

  const renderPreview = useCallback(async () => {
    // Chi load 'marked' library khi user click Preview
    const { marked } = await import('marked');
    setPreview(marked.parse(content));
  }, [content]);

  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button onClick={renderPreview}>Preview</button>
      <div dangerouslySetInnerHTML={{ __html: preview }} />
    </div>
  );
}

// 2. Conditional import -- polyfill
async function initApp() {
  if (!window.IntersectionObserver) {
    await import('intersection-observer'); // Polyfill
  }

  // Tiep tuc khoi tao app
  const { createRoot } = await import('react-dom/client');
  const { default: App } = await import('./App');

  createRoot(document.getElementById('root')!).render(<App />);
}

// 3. Prefetch -- load truoc khi user can
function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const prefetch = () => {
    // Khi user hover, bat dau load chunk
    switch (to) {
      case '/dashboard':
        import('./pages/Dashboard');
        break;
      case '/settings':
        import('./pages/Settings');
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
const AdminPanel = lazy(() =>
  import(
    /* webpackChunkName: "admin" */
    /* webpackPrefetch: true */
    './AdminPanel'
  )
);

// 5. Feature flags -- load feature conditionally
async function loadFeature(featureName: string) {
  const features: Record<string, () => Promise<any>> = {
    'new-editor': () => import('./features/NewEditor'),
    'analytics': () => import('./features/Analytics'),
    'ai-assist': () => import('./features/AIAssist'),
  };

  const loader = features[featureName];
  if (!loader) throw new Error(`Unknown feature: ${featureName}`);

  const module = await loader();
  return module.default;
}
```

### Dap an mau

> "Dynamic import la JavaScript feature tra ve Promise cua module. Ngoai React.lazy, dung cho: load heavy libraries khi can, conditional polyfills, prefetching tren hover, va feature flags. Webpack magic comments (`webpackChunkName`, `webpackPrefetch`) giup kiem soat chunk naming va loading strategy. Prefetch khi hover la ky thuat don gian nhung rat hieu qua."

---

## Cau 5: React Profiler -- debug performance nhu the nao? `[Senior]`

### Giai thich ly thuyet

**React Profiler** co 2 dang:
1. **React DevTools Profiler** (browser extension) -- GUI, de dung
2. **Profiler component** (API) -- programmatic, log data

**Cach dung DevTools Profiler:**
1. Mo React DevTools > tab Profiler
2. Click Record
3. Thuc hien thao tac can do
4. Click Stop
5. Phan tich: commit nao lau, component nao render nhieu

**Metrics quan trong:**
- **Commit duration**: tong thoi gian render 1 commit
- **Render duration**: thoi gian render 1 component
- **Why did this render?**: checkbox trong DevTools settings

### Code vi du

```tsx
import { Profiler, ProfilerOnRenderCallback, useState } from 'react';

// Profiler component -- log render data
const onRender: ProfilerOnRenderCallback = (
  id,            // Profiler id
  phase,         // "mount" | "update"
  actualDuration,  // Thoi gian render thuc te (ms)
  baseDuration,    // Thoi gian render khong co memo (ms)
  startTime,       // Khi React bat dau render commit nay
  commitTime       // Khi React commit DOM
) => {
  // Log hoac gui metrics len monitoring service
  console.table({
    id,
    phase,
    actualDuration: `${actualDuration.toFixed(2)}ms`,
    baseDuration: `${baseDuration.toFixed(2)}ms`,
    startTime,
    commitTime,
  });

  // Canh bao neu render qua lau
  if (actualDuration > 16) {
    console.warn(
      `[Performance] ${id} took ${actualDuration.toFixed(2)}ms ` +
      `(target: 16ms for 60fps)`
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

// Custom hook: do render count
function useRenderCount(componentName: string) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  useEffect(() => {
    console.log(`${componentName} rendered ${renderCount.current} times`);
  });

  return renderCount.current;
}

// Custom hook: do render time
function useRenderTime(componentName: string) {
  const startTime = performance.now();

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (duration > 16) {
      console.warn(
        `[Slow Render] ${componentName}: ${duration.toFixed(2)}ms`
      );
    }
  });
}

// Su dung
function ProductList() {
  useRenderCount('ProductList');
  useRenderTime('ProductList');

  // ... render logic
  return <div>Products</div>;
}
```

### Debug workflow

1. **Xac dinh van de**: user bao lag, hay ban thay janky scroll
2. **Do bang Profiler**: Record interaction, xem commit nao lau
3. **Tim component cham**: sort by render duration
4. **Hieu nguyen nhan**: "Why did this render?" trong DevTools
5. **Optimize**: memo, useMemo, useCallback, hoac restructure
6. **Do lai**: verify improvement

### Dap an mau

> "React Profiler (DevTools va API) do render duration cua tung component. Workflow: do truoc, tim bottleneck, optimize, do lai. DevTools Profiler co 'Why did this render?' de hieu nguyen nhan. Profiler API cho phep log metrics programmatically va gui len monitoring. Target: moi commit duoi 16ms cho 60fps."

---

## Cau 6: Virtualization -- render danh sach lon hieu qua `[Senior]`

### Giai thich ly thuyet

Khi render danh sach 10,000+ items, DOM qua nhieu elements se lag. **Virtualization** (windowing) chi render nhung items **trong viewport** -- giam DOM nodes tu 10,000 xuong con ~20-50.

**Thu vien pho bien:**
- `react-window`: nhe, don gian (Recommendation cua React docs)
- `react-virtuoso`: nhieu tinh nang hon (auto-size, grouped, infinite scroll)
- `@tanstack/react-virtual`: headless, framework-agnostic

### Code vi du

```tsx
// --- react-window: FixedSizeList ---
import { FixedSizeList } from 'react-window';

interface Item {
  id: number;
  name: string;
  email: string;
}

function VirtualizedList({ items }: { items: Item[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style} className="row">
      <span>{items[index].name}</span>
      <span>{items[index].email}</span>
    </div>
  );

  return (
    <FixedSizeList
      height={600}      // Chieu cao container
      width="100%"
      itemCount={items.length}
      itemSize={50}     // Chieu cao moi item (fixed)
    >
      {Row}
    </FixedSizeList>
  );
}

// --- react-virtuoso: VariableSizeList voi auto-sizing ---
import { Virtuoso } from 'react-virtuoso';

function AutoSizeList({ items }: { items: Item[] }) {
  return (
    <Virtuoso
      style={{ height: '600px' }}
      totalCount={items.length}
      itemContent={(index) => (
        <div className="row" style={{ padding: '10px' }}>
          <h4>{items[index].name}</h4>
          <p>{items[index].email}</p>
          {/* Moi row co the co chieu cao khac nhau */}
        </div>
      )}
    />
  );
}

// --- @tanstack/react-virtual: headless ---
import { useVirtualizer } from '@tanstack/react-virtual';

function TanStackVirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5, // Render them 5 items tren va duoi viewport
  });

  return (
    <div
      ref={parentRef}
      style={{ height: '600px', overflow: 'auto' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
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

    setItems(prev => [...prev, ...newItems]);
    setLoading(false);
  }, [items.length, loading]);

  return (
    <Virtuoso
      style={{ height: '100vh' }}
      data={items}
      endReached={loadMore}
      itemContent={(index, item) => (
        <div className="row">
          <span>{item.name}</span>
        </div>
      )}
      components={{
        Footer: () => loading ? <p>Loading more...</p> : null,
      }}
    />
  );
}
```

### Bang so sanh thu vien virtualization

| Tieu chi | react-window | react-virtuoso | @tanstack/react-virtual |
|----------|-------------|---------------|------------------------|
| Bundle size | ~6KB | ~15KB | ~5KB |
| API style | Component-based | Component-based | Headless (hook) |
| Auto-size items | Khong (can VariableSizeList) | Co | Co (estimate) |
| Infinite scroll | Can tu viet | Built-in | Can tu viet |
| Grouped items | Khong | Co | Co |
| Learning curve | Thap | Thap | Trung binh |
| Flexibility | Trung binh | Cao | Rat cao |

### Dap an mau

> "Virtualization chi render items trong viewport, giam DOM nodes tu hang ngan xuong hang chuc. react-window cho truong hop don gian, react-virtuoso cho auto-sizing va infinite scroll, @tanstack/react-virtual cho headless approach. Can virtualization khi render > 100-200 items. Ket hop voi useMemo cho data va memo cho Row component de toi uu toi da."

---

## Bang tong hop cac chien luoc Performance Optimization

| Chien luoc | Van de giai quyet | Do phuc tap | Khi nao dung |
|------------|------------------|-------------|-------------|
| `React.memo` | Child re-render khong can thiet | Thap | Component nang, parent render nhieu |
| `useMemo` | Tinh toan lai khong can thiet | Thap | Sort/filter danh sach lon |
| `useCallback` | Function reference moi moi render | Thap | Props cho memo child |
| `React.lazy` | Bundle lon, load cham | Thap | Route splitting, features lon |
| `Suspense` | Loading state management | Thap | Ket hop voi lazy, data fetching |
| `useTransition` | UI block khi render nang | Trung binh | Search, filter realtime |
| `useDeferredValue` | Input lag do render nang | Trung binh | Heavy child voi changing props |
| Virtualization | Danh sach qua nhieu DOM nodes | Trung binh | > 100-200 items |
| Code splitting | Initial bundle qua lon | Thap | Moi du an nen lam |
| Profiler | Khong biet optimize o dau | Thap | Buoc dau tien truoc moi optimization |

### Thu tu uu tien khi optimize

1. **Do truoc** -- dung Profiler, xac dinh bottleneck
2. **Code splitting** -- giam initial load (lam luon, khong can do)
3. **Virtualization** -- neu co danh sach lon
4. **React.memo + useMemo/useCallback** -- cho components cu the
5. **Concurrent features** -- cho UX improvements

---

## Loi thuong gap khi tra loi

1. **"Memo moi thu cho an toan"** -- Sai. Memo co overhead: luu gia tri + so sanh deps. Neu props thay doi thuong xuyen, memo lam cham hon. Do truoc, optimize sau.

2. **Khong biet React.lazy can Suspense** -- lazy component PHAI wrap trong Suspense, neu khong se throw error khi loading.

3. **Nham code splitting voi tree shaking** -- Code splitting chia bundle thanh chunks (load khi can). Tree shaking loai bo unused code (build time). Hai thu khac nhau.

4. **Khong biet Profiler** -- Neu ban noi "toi optimize" nhung khong noi ve cach do, interviewer se nghi ban dang "guess". Luon do truoc.

5. **Noi virtualization la "render them DOM khi scroll"** -- Sai. Virtualization **chi render items trong viewport**, va **recycle** DOM nodes khi scroll. Tong so DOM nodes luon nho.

6. **Khong noi ve Error Boundary voi lazy** -- Khi network loi, lazy component fail. Can Error Boundary de xu ly gracefully thay vi white screen.
