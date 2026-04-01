---
sidebar_position: 16
title: "Vòng đời Component"
---

# Vòng đời Component (Component Lifecycle)

## Ba giai đoạn

Mỗi component trải qua 3 giai đoạn:

1. **Mounting** — Component được tạo và thêm vào DOM
2. **Updating** — Component re-render do state/props thay đổi
3. **Unmounting** — Component bị xóa khỏi DOM

## Function Component (Hooks)

```tsx
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);

  // === MOUNTING + UPDATING ===
  // Chạy sau mỗi render mà userId thay đổi
  useEffect(() => {
    fetchUser(userId).then(setUser);

    // === CLEANUP (trước update tiếp theo hoặc unmount) ===
    return () => {
      // Dọn dẹp: cancel request, clear timer, unsubscribe
    };
  }, [userId]);

  // === MOUNTING ONLY ===
  useEffect(() => {
    console.log('Component mounted');
    const handleResize = () => { /* ... */ };
    window.addEventListener('resize', handleResize);

    return () => {
      // === UNMOUNTING ===
      console.log('Component will unmount');
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Mảng rỗng = chỉ mount/unmount

  // === RENDER (mỗi lần) ===
  return <div>{user?.name}</div>;
}
```

### Thứ tự chạy chi tiết

```
=== MOUNT ===
1. Function component chạy (render)
2. React cập nhật DOM
3. useEffect callbacks chạy (theo thứ tự khai báo)

=== UPDATE (state/props thay đổi) ===
1. Function component chạy lại (re-render)
2. React cập nhật DOM (chỉ phần thay đổi)
3. Cleanup functions của effects CŨ chạy
4. useEffect callbacks MỚI chạy

=== UNMOUNT ===
1. Cleanup functions chạy
2. React xóa DOM nodes
```

## So sánh Class Lifecycle vs Hooks

| Class Lifecycle | Hooks tương đương |
|---|---|
| `constructor` | `useState(initialValue)` |
| `componentDidMount` | `useEffect(() => {}, [])` |
| `componentDidUpdate` | `useEffect(() => {}, [deps])` |
| `componentWillUnmount` | `useEffect(() => { return cleanup }, [])` |
| `shouldComponentUpdate` | `React.memo()` |
| `getDerivedStateFromProps` | Tính trong render body |

### Class component lifecycle (reference)

```
MOUNTING:
  constructor() → render() → componentDidMount()

UPDATING:
  shouldComponentUpdate() → render() → componentDidUpdate()

UNMOUNTING:
  componentWillUnmount()
```

## useLayoutEffect vs useEffect

| | `useEffect` | `useLayoutEffect` |
|---|---|---|
| Khi chạy | Sau khi browser paint | Sau DOM update, **trước** browser paint |
| Blocking | ❌ Non-blocking | ✅ Blocking (chặn paint) |
| Dùng cho | Hầu hết side effects | Đo DOM, ngăn flash UI |

```tsx
// useLayoutEffect — chạy TRƯỚC khi user thấy UI
// Dùng khi cần đo/thay đổi DOM trước khi hiển thị
useLayoutEffect(() => {
  const { height } = ref.current.getBoundingClientRect();
  setHeight(height); // Không gây flash vì chạy trước paint
}, []);

// useEffect — chạy SAU khi user thấy UI
// Dùng cho hầu hết trường hợp
useEffect(() => {
  fetchData(); // Không cần blocking paint
}, []);
```

**Quy tắc:** Luôn dùng `useEffect` trước. Chỉ chuyển sang `useLayoutEffect` nếu thấy **flickering** (UI nhấp nháy).

## Patterns với Lifecycle

### Chạy code một lần khi mount

```tsx
useEffect(() => {
  analytics.trackPageView();
}, []);
```

### Chạy cleanup khi unmount

```tsx
useEffect(() => {
  const subscription = eventBus.subscribe('event', handler);
  return () => subscription.unsubscribe();
}, []);
```

### Phản ứng khi props thay đổi

```tsx
useEffect(() => {
  // Fetch data mới khi userId thay đổi
  fetchUser(userId).then(setUser);
}, [userId]);
```

### So sánh giá trị trước và sau

```tsx
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

function PriceDisplay({ price }: { price: number }) {
  const prevPrice = usePrevious(price);

  const direction = prevPrice !== undefined
    ? price > prevPrice ? 'up' : price < prevPrice ? 'down' : 'same'
    : 'same';

  return <span className={`price-${direction}`}>${price}</span>;
}
```
