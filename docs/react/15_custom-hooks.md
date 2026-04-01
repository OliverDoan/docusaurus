---
sidebar_position: 15
title: "Custom Hooks"
---

# Custom Hooks

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
