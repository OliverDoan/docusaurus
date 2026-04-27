---
sidebar_position: 10
title: "10. Custom Hooks"
---

# Custom Hooks


---

## Mục lục

- [Custom Hook là gì?](#custom-hook-là-gì)
- [Rules](#rules)
- [Các Custom Hook phổ biến](#các-custom-hook-phổ-biến)
- [Tổ chức Custom Hooks](#tổ-chức-custom-hooks)
- [Nguyên tắc thiết kế](#nguyên-tắc-thiết-kế)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Custom Hook là gì?

Custom hook là function bắt đầu bằng `use`, chứa logic tái sử dụng dùng các React hooks bên trong. Cho phép **tách logic ra khỏi component** và chia sẻ giữa nhiều components.

```tsx
// Custom hook — tách logic
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount((c) => c + 1);
  const decrement = () => setCount((c) => c - 1);
  const reset = () => setCount(initialValue);

  return { count, increment, decrement, reset };
}

// Component chỉ lo render
function Counter() {
  const { count, increment, decrement, reset } = useCounter(0);

  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

## Rules

1. Tên **bắt buộc** bắt đầu bằng `use` — React dựa vào quy ước này
2. Chỉ gọi hooks ở **top level** — không trong if/else, loop, nested function
3. Chỉ gọi trong **React function component** hoặc **custom hook** khác

## Các Custom Hook phổ biến

### useLocalStorage

```tsx
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

// Sử dụng
const [theme, setTheme] = useLocalStorage('theme', 'light');
```

### useDebounce

```tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Sử dụng — search input
function SearchBar() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      searchAPI(debouncedQuery);
    }
  }, [debouncedQuery]);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```

### useToggle

```tsx
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue((v) => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, toggle, setTrue, setFalse };
}

// Sử dụng
const { value: isOpen, toggle, setFalse: close } = useToggle();
```

### useFetch

```tsx
interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Sử dụng
function UserList() {
  const { data: users, loading, error, refetch } = useFetch<User[]>('/api/users');

  if (loading) return <Spinner />;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      {users?.map((user) => <UserCard key={user.id} user={user} />)}
    </div>
  );
}
```

### useMediaQuery

```tsx
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// Sử dụng
function Layout() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return isMobile ? <MobileNav /> : <DesktopNav />;
}
```

### useOnClickOutside

```tsx
function useOnClickOutside(
  ref: React.RefObject<HTMLElement>,
  handler: () => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// Sử dụng — đóng dropdown khi click ngoài
function Dropdown() {
  const ref = useRef<HTMLDivElement>(null);
  const { value: isOpen, setFalse: close, toggle } = useToggle();

  useOnClickOutside(ref, close);

  return (
    <div ref={ref}>
      <button onClick={toggle}>Menu</button>
      {isOpen && <DropdownMenu />}
    </div>
  );
}
```

## Tổ chức Custom Hooks

```
src/
├── hooks/
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── useMediaQuery.ts
│   └── index.ts          # Re-export tất cả
├── features/
│   └── auth/
│       └── useAuth.ts     # Hook gắn với feature cụ thể
```

## Nguyên tắc thiết kế

- **Single responsibility** — mỗi hook làm một việc
- **Return value rõ ràng** — object cho nhiều values, tuple cho 2 values
- **Naming convention** — `use` + mô tả chức năng: `useAuth`, `useDebounce`, `useLocalStorage`
- **Không lạm dụng** — nếu logic chỉ dùng ở 1 component, để trong component

---

## Câu hỏi phỏng vấn

### Câu 1: Rules of Hooks là gì?
**Đáp án:**
React có 2 quy tắc bắt buộc khi sử dụng hooks:

1. **Chỉ gọi hooks ở top level** — không gọi trong `if`, `for`, `while`, hoặc nested functions. React dựa vào thứ tự gọi hooks để theo dõi state.
2. **Chỉ gọi hooks trong React function components hoặc custom hooks** — không gọi trong class components hay functions thường.

```tsx
// SAI: hook trong điều kiện
function Component({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (isLoggedIn) {
    const [name, setName] = useState(''); // Vi phạm rule 1!
  }
}

// ĐÚNG: luôn gọi hook, dùng điều kiện bên trong
function Component({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [name, setName] = useState('');

  if (isLoggedIn) {
    // Dùng name ở đây
  }
}
```

Lý do: React dùng thứ tự gọi hooks để map state với hook tương ứng. Nếu thứ tự thay đổi giữa các render, state sẽ bị sai lệch.

### Câu 2: Tại sao tên custom hook phải bắt đầu bằng "use"?
**Đáp án:**
Quy ước `use` prefix có 2 mục đích:

1. **React ESLint plugin** dựa vào prefix `use` để kiểm tra Rules of Hooks. Nếu không bắt đầu bằng `use`, linter không biết đó là hook và không cảnh báo khi vi phạm rules.
2. **Developer experience** — nhìn vào tên function biết ngay đó là hook, có thể gọi hooks bên trong, và phải tuân theo Rules of Hooks.

```tsx
// useWindowSize — React biết đây là hook, linter kiểm tra rules
function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const handler = () => setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return size;
}

// getWindowSize — linter KHÔNG kiểm tra, dễ vi phạm rules mà không biết
function getWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 }); // Linter bỏ qua!
  // ...
}
```

### Câu 3: Custom hook khác utility function như thế nào?
**Đáp án:**
- **Custom hook** sử dụng React hooks bên trong (`useState`, `useEffect`, `useRef`,...). Nó gắn với React lifecycle và có thể giữ state, chạy side effects.
- **Utility function** là pure function, không dùng React hooks, không gắn với lifecycle. Có thể dùng ở bất kỳ đâu, không riêng React.

```tsx
// Custom hook — dùng React hooks, gắn với component lifecycle
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// Utility function — pure, không dùng hooks, dùng ở bất kỳ đâu
function formatCurrency(amount: number, currency = 'VND'): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
  }).format(amount);
}
```

Quy tắc: nếu function cần React hooks (state, effects, context,...) thì tạo custom hook. Nếu chỉ là logic tính toán thuần thì tạo utility function.

### Câu 4: Hãy viết custom hook useDebounce và giải thích cách hoạt động.
**Đáp án:**

```tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Đặt timer delay ms sau mới cập nhật debouncedValue
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: nếu value thay đổi trước khi hết delay,
    // clear timer cũ → bắt đầu đếm lại
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Ứng dụng: search input — chỉ gọi API sau khi user ngừng gõ 300ms
function SearchPage() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      fetch(`/api/search?q=${debouncedQuery}`)
        .then((res) => res.json())
        .then((data) => console.log(data));
    }
  }, [debouncedQuery]); // Chỉ fetch khi debouncedQuery thay đổi

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

**Cách hoạt động:** Mỗi khi `value` thay đổi, useEffect tạo một `setTimeout`. Nếu `value` thay đổi lại trước khi hết `delay`, cleanup function clear timer cũ và tạo timer mới. Kết quả: `debouncedValue` chỉ cập nhật khi `value` ngừng thay đổi trong `delay` ms.
