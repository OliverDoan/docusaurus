---
sidebar_position: 19
title: "Tối ưu hiệu suất"
---

# Tối ưu hiệu suất (Performance Optimization)

## React.memo

Ngăn component re-render khi props không thay đổi:

```tsx
import { memo } from 'react';

// Chỉ re-render khi props thay đổi (shallow comparison)
const UserCard = memo(function UserCard({ user }: { user: User }) {
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
});

// Custom comparison function
const ExpensiveChart = memo(
  function Chart({ data }: { data: number[] }) {
    return <canvas>{/* render chart */}</canvas>;
  },
  (prevProps, nextProps) => {
    // Return true nếu KHÔNG cần re-render
    return prevProps.data.length === nextProps.data.length
      && prevProps.data.every((v, i) => v === nextProps.data[i]);
  }
);
```

### Khi nào dùng React.memo?

- Component render **nặng** (charts, large lists)
- Component nhận **cùng props** nhưng cha re-render thường xuyên
- Component ở **giữa tree** với nhiều children

### Khi nào KHÔNG dùng?

- Component render nhẹ, nhanh
- Props thay đổi mỗi render (memo check thừa)
- Component luôn nhận children khác nhau

## Code Splitting với lazy()

Tách bundle thành chunks nhỏ, load khi cần:

```tsx
import { lazy, Suspense } from 'react';

// Component chỉ load khi được render
const HeavyChart = lazy(() => import('./components/HeavyChart'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Suspense>
  );
}

// Lazy load khi cần (click, scroll, hover)
function Dashboard() {
  const [showChart, setShowChart] = useState(false);

  return (
    <div>
      <button onClick={() => setShowChart(true)}>Show Chart</button>
      {showChart && (
        <Suspense fallback={<Spinner />}>
          <HeavyChart data={data} />
        </Suspense>
      )}
    </div>
  );
}
```

## Virtualization cho danh sách dài

Chỉ render items hiển thị trên màn hình:

```tsx
// Dùng @tanstack/react-virtual
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Chiều cao ước tính mỗi item
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              transform: `translateY(${virtualItem.start}px)`,
              height: `${virtualItem.size}px`,
            }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Khi nào dùng:** Danh sách > 100 items hoặc items render phức tạp.

## Tránh re-render thừa

### 1. Đưa state xuống component cần nó

```tsx
// ❌ Toàn bộ App re-render khi input thay đổi
function App() {
  const [search, setSearch] = useState('');
  return (
    <div>
      <input value={search} onChange={(e) => setSearch(e.target.value)} />
      <ExpensiveComponent /> {/* Re-render thừa! */}
    </div>
  );
}

// ✅ Tách SearchBar ra — chỉ SearchBar re-render
function App() {
  return (
    <div>
      <SearchBar />
      <ExpensiveComponent /> {/* Không bị re-render */}
    </div>
  );
}

function SearchBar() {
  const [search, setSearch] = useState('');
  return <input value={search} onChange={(e) => setSearch(e.target.value)} />;
}
```

### 2. Truyền children thay vì render trong component

```tsx
// ❌ SlowComponent re-render mỗi khi count thay đổi
function Parent() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <SlowComponent />
    </div>
  );
}

// ✅ SlowComponent truyền vào từ ngoài → không bị re-render
function Counter({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      {children}
    </div>
  );
}

function Parent() {
  return (
    <Counter>
      <SlowComponent /> {/* Tạo trước khi Counter render → stable */}
    </Counter>
  );
}
```

## Image Optimization

```tsx
// Lazy loading images
<img src={url} loading="lazy" alt="description" />

// Responsive images
<img
  src={url}
  srcSet={`${url300} 300w, ${url600} 600w, ${url900} 900w`}
  sizes="(max-width: 600px) 300px, (max-width: 900px) 600px, 900px"
  alt="description"
/>
```

## Profiling

### React DevTools Profiler

1. Mở React DevTools → Profiler tab
2. Nhấn Record → thực hiện thao tác → Stop
3. Xem component nào render lâu nhất
4. Xem tại sao component re-render (Props changed? State changed? Parent re-rendered?)

### Highlight re-renders

Trong React DevTools → Settings → bật "Highlight updates when components render" để thấy trực quan component nào đang re-render.
