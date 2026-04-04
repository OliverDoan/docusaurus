---
sidebar_position: 6
title: "HOC & Render Props"
---

# HOC & Render Props

> Đây là các patterns **legacy** — custom hooks đã thay thế hầu hết use cases. Tuy nhiên cần biết vì nhiều codebase và thư viện cũ vẫn sử dụng.

## Higher-Order Component (HOC)

HOC là function nhận một component và trả về component mới với logic bổ sung:

```tsx
// HOC pattern
function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    return <WrappedComponent {...props} user={user} />;
  };
}

// Sử dụng
const ProtectedDashboard = withAuth(Dashboard);
<ProtectedDashboard />
```

### HOC phổ biến trong thực tế

```tsx
// withLoading
function withLoading<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithLoading(props: P & { isLoading: boolean }) {
    const { isLoading, ...rest } = props;

    if (isLoading) return <Spinner />;
    return <WrappedComponent {...(rest as P)} />;
  };
}

// React.memo — HOC có sẵn
const MemoizedComponent = React.memo(MyComponent);

// connect từ react-redux (legacy)
const ConnectedComponent = connect(mapStateToProps)(MyComponent);
```

### Nhược điểm HOC

- **Wrapper hell** — nhiều HOC lồng nhau khó debug
- **Props collision** — HOC có thể override props của component
- **Khó đọc** — logic ẩn trong HOC, không rõ component nhận props gì

```tsx
// Wrapper hell
export default withAuth(withTheme(withRouter(withLoading(MyComponent))));
```

## Render Props

Component nhận function qua props để quyết định render gì:

```tsx
// Render prop pattern
interface MouseTrackerProps {
  render: (position: { x: number; y: number }) => ReactNode;
}

function MouseTracker({ render }: MouseTrackerProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return <>{render(position)}</>;
}

// Sử dụng
<MouseTracker
  render={({ x, y }) => (
    <p>Mouse position: {x}, {y}</p>
  )}
/>
```

### Variant: Children as function

```tsx
function Toggle({ children }: { children: (props: ToggleProps) => ReactNode }) {
  const [on, setOn] = useState(false);
  const toggle = () => setOn((v) => !v);

  return <>{children({ on, toggle })}</>;
}

<Toggle>
  {({ on, toggle }) => (
    <button onClick={toggle}>{on ? 'ON' : 'OFF'}</button>
  )}
</Toggle>
```

## Custom Hook — Giải pháp thay thế

Hầu hết HOC và render props có thể thay bằng custom hook đơn giản hơn:

```tsx
// ❌ HOC
const EnhancedComponent = withWindowSize(MyComponent);

// ❌ Render props
<WindowSize render={({ width, height }) => <MyComponent width={width} height={height} />} />

// ✅ Custom hook — đơn giản, rõ ràng
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handler = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return size;
}

function MyComponent() {
  const { width, height } = useWindowSize();
  return <p>{width}x{height}</p>;
}
```

## Khi nào vẫn dùng HOC?

- `React.memo` — performance optimization
- Library wrappers — khi thư viện yêu cầu
- Cross-cutting concerns — logging, error tracking
- Khi cần **thay đổi component tree** (thêm wrapper div, thêm provider)

## So sánh

| | HOC | Render Props | Custom Hooks |
|---|---|---|---|
| Chia sẻ logic | ✅ | ✅ | ✅ |
| Dễ đọc | ❌ Ẩn logic | ⚠️ Verbose | ✅ Rõ ràng |
| Compose | ❌ Wrapper hell | ⚠️ Callback hell | ✅ Gọi nhiều hooks |
| TypeScript | ❌ Phức tạp | ⚠️ OK | ✅ Tốt |
| Status | Legacy | Legacy | **Tiêu chuẩn** |

---

## Câu hỏi phỏng vấn

### Câu 1: HOC là gì? Cho ví dụ?
**Đáp án:**

HOC (Higher-Order Component) là **function nhận một component và trả về component mới** với logic bổ sung. HOC không thay đổi component gốc mà "wrap" nó lại.

```tsx
// HOC withAuth — thêm logic kiểm tra đăng nhập
function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    return <WrappedComponent {...props} user={user} />;
  };
}

// Sử dụng — Dashboard giờ tự động check auth
const ProtectedDashboard = withAuth(Dashboard);

// HOC phổ biến trong thực tế:
// - React.memo(Component) — cache render
// - connect(mapState)(Component) — Redux (legacy)
// - withRouter(Component) — React Router v5 (legacy)
```

### Câu 2: Tại sao custom hooks thay thế HOC và render props?
**Đáp án:**

Custom hooks giải quyết được các nhược điểm chính của HOC và render props:

```tsx
// ❌ HOC — wrapper hell, props collision, khó debug
export default withAuth(withTheme(withRouter(withLoading(MyComponent))));
// Không rõ MyComponent nhận props gì từ đâu

// ❌ Render props — callback hell, verbose
<MouseTracker render={({ x, y }) => (
  <WindowSize render={({ width }) => (
    <p>{x}, {y}, {width}</p>
  )} />
)} />

// ✅ Custom hooks — đơn giản, rõ ràng, composable
function MyComponent() {
  const { isAuthenticated, user } = useAuth();    // Logic auth
  const { theme } = useTheme();                   // Logic theme
  const { width } = useWindowSize();              // Logic window size
  const { x, y } = useMousePosition();            // Logic mouse

  // Rõ ràng: biết data đến từ đâu
  // Không wrapper hell
  // TypeScript support tốt
  // Dễ test
}
```

**Ưu điểm hooks:** Không thêm wrapper vào component tree, không props collision, dễ compose (gọi nhiều hooks), TypeScript infer type tốt, dễ test riêng lẻ.

### Câu 3: Khi nào vẫn cần dùng HOC?
**Đáp án:**

Mặc dù custom hooks đã thay thế hầu hết use cases, HOC vẫn hữu ích trong một số trường hợp:

1. **React.memo** — optimization, wrap component để skip re-render.
2. **Thay đổi component tree** — khi cần thêm wrapper element, provider, hoặc layout.
3. **Library wrappers** — khi thư viện yêu cầu (vd: styled-components, Redux connect).
4. **Cross-cutting concerns** — logging, error tracking, analytics wrapper.

```tsx
// React.memo — HOC tiêu chuẩn
const MemoizedList = memo(ExpensiveList);

// HOC thêm layout/wrapper — hooks không làm được
function withPageLayout<P extends object>(Component: React.ComponentType<P>) {
  return function WithLayout(props: P) {
    return (
      <div className="page-layout">
        <Sidebar />
        <main>
          <Component {...props} />
        </main>
      </div>
    );
  };
}

// HOC cho logging — cross-cutting concern
function withLogger<P extends object>(Component: React.ComponentType<P>) {
  return function WithLogger(props: P) {
    useEffect(() => {
      console.log(`${Component.name} mounted`);
      return () => console.log(`${Component.name} unmounted`);
    }, []);
    return <Component {...props} />;
  };
}
```

**Quy tắc:** Ưu tiên custom hooks. Chỉ dùng HOC khi cần thay đổi component tree hoặc wrap component với element/provider bên ngoài.
