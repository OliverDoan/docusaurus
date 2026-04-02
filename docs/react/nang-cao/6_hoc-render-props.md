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
