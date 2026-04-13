---
sidebar_position: 13
title: "13. Vòng đời Component"
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

---

## Câu hỏi phỏng vấn

### Câu 1: Mô tả 3 giai đoạn lifecycle của React component.
**Đáp án:**

1. **Mounting** — Component được tạo và thêm vào DOM lần đầu tiên.
   - Function component chạy (render)
   - React cập nhật DOM
   - `useEffect` callbacks chạy

2. **Updating** — Component re-render khi state hoặc props thay đổi.
   - Function component chạy lại
   - React cập nhật DOM (chỉ phần thay đổi nhờ Virtual DOM diffing)
   - Cleanup functions của effects cũ chạy
   - `useEffect` callbacks mới chạy

3. **Unmounting** — Component bị xóa khỏi DOM.
   - Cleanup functions của tất cả effects chạy
   - React xóa DOM nodes

```tsx
useEffect(() => {
  console.log('Mounted hoặc Updated'); // Chạy ở giai đoạn 1 và 2
  return () => {
    console.log('Cleanup trước update hoặc Unmount'); // Chạy ở giai đoạn 2 và 3
  };
}, [dependency]);
```

### Câu 2: useEffect và useLayoutEffect khác nhau thế nào?
**Đáp án:**
- `useEffect` chạy **sau khi browser paint** (non-blocking). User thấy UI trước, sau đó effect mới chạy.
- `useLayoutEffect` chạy **sau DOM update nhưng trước browser paint** (blocking). Effect chạy xong, browser mới paint.

```tsx
// useEffect: user có thể thấy "flash" nếu effect thay đổi UI
useEffect(() => {
  // Fetch data, set up subscription, logging
  // Không cần chặn paint
}, []);

// useLayoutEffect: ngăn flash UI
useLayoutEffect(() => {
  // Đo kích thước DOM rồi set state trước khi user thấy
  const { height } = ref.current!.getBoundingClientRect();
  setHeight(height); // Không bị flash vì chạy trước paint
}, []);
```

**Quy tắc:** Luôn dùng `useEffect` trước. Chỉ chuyển sang `useLayoutEffect` khi thấy UI nhấp nháy (flickering) do effect thay đổi DOM.

### Câu 3: Thứ tự chạy effects như thế nào khi component mount?
**Đáp án:**
Khi mount, React chạy theo thứ tự:
1. Render function chạy (tính toán JSX)
2. React commit changes vào DOM
3. Browser paint (user thấy UI)
4. `useEffect` callbacks chạy **theo thứ tự khai báo**

```tsx
function Example() {
  useEffect(() => {
    console.log('Effect 1'); // Chạy thứ 3 (sau paint)
  }, []);

  useEffect(() => {
    console.log('Effect 2'); // Chạy thứ 4 (sau Effect 1)
  }, []);

  console.log('Render'); // Chạy thứ 1

  return <div>Hello</div>; // Chạy thứ 2 (commit to DOM → paint)
}
// Output: "Render" → (paint) → "Effect 1" → "Effect 2"
```

Với `useLayoutEffect`, thứ tự là: Render → DOM update → `useLayoutEffect` → Paint → `useEffect`.

### Câu 4: So sánh Class lifecycle methods với Hooks tương đương.
**Đáp án:**

| Class Lifecycle | Hooks tương đương | Giải thích |
|---|---|---|
| `constructor` | `useState(initialValue)` | Khởi tạo state |
| `componentDidMount` | `useEffect(() => {}, [])` | Chạy 1 lần sau mount |
| `componentDidUpdate` | `useEffect(() => {}, [deps])` | Chạy khi deps thay đổi |
| `componentWillUnmount` | `return () => cleanup` trong `useEffect` | Dọn dẹp khi unmount |
| `shouldComponentUpdate` | `React.memo()` | Tránh re-render không cần thiết |

```tsx
// Class component
class UserProfile extends React.Component {
  state = { user: null }; // constructor

  componentDidMount() {
    fetchUser(this.props.userId).then((user) => this.setState({ user }));
  }

  componentDidUpdate(prevProps) {
    if (prevProps.userId !== this.props.userId) {
      fetchUser(this.props.userId).then((user) => this.setState({ user }));
    }
  }

  componentWillUnmount() {
    // cleanup
  }
}

// Function component — gộp cả 3 lifecycle vào 1 useEffect
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser(userId).then(setUser); // mount + update
    return () => { /* cleanup */ }; // unmount + trước update
  }, [userId]);
}
```

Ưu điểm hooks: gộp logic liên quan vào 1 chỗ thay vì rải rác qua nhiều lifecycle methods.
