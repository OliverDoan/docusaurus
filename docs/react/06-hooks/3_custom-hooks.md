---
sidebar_position: 3
title: "3. Custom Hooks"
---

# Custom Hooks

---

## Mục lục

- [Custom Hook là gì?](#custom-hook-là-gì)
- [Naming convention](#naming-convention)
- [Ví dụ thường gặp](#ví-dụ-thường-gặp)
- [Share state giữa các hook](#share-state-giữa-các-hook)
- [Best practices](#best-practices)

---

## Custom Hook là gì?

**Custom Hook** = function JS bắt đầu bằng `use*`, có thể gọi các hook
khác bên trong. Mục đích: **tái sử dụng logic** giữa nhiều component.

```jsx
function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  const reset = () => setCount(initial);

  return { count, increment, decrement, reset };
}

// Dùng
function App() {
  const { count, increment, decrement } = useCounter(10);

  return (
    <>
      <p>{count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </>
  );
}
```

---

## Naming convention

| Rule | Lý do |
|------|-------|
| Bắt đầu bằng `use` | Để ESLint biết áp dụng Rules of Hooks |
| `use<Noun>` cho data | `useUser`, `useTheme` |
| `use<Verb>` cho action | `useFetch`, `useDebounce` |

```jsx
// Đúng
function useUser() {}
function useDebounce(value, delay) {}
function useLocalStorage(key) {}

// Sai — ESLint sẽ không nhận ra là hook
function fetchUser() { useState(); } // không bắt đầu bằng `use`
```

---

## Ví dụ thường gặp

**`useDebounce`** — defer giá trị:

```jsx
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// Dùng — search input
function Search() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery) {
      search(debouncedQuery);
    }
  }, [debouncedQuery]);

  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}
```

**`useLocalStorage`** — sync state với localStorage:

```jsx
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(err);
    }
  }, [key, value]);

  return [value, setValue];
}

// Dùng
function Settings() {
  const [theme, setTheme] = useLocalStorage("theme", "light");
  return <button onClick={() => setTheme("dark")}>{theme}</button>;
}
```

**`useFetch`** — đơn giản (production nên dùng TanStack Query):

```jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);

    fetch(url, { signal: ctrl.signal })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch(err => {
        if (err.name !== "AbortError") setError(err);
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, [url]);

  return { data, error, loading };
}
```

**`usePrevious`** — track giá trị trước:

```jsx
function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return <p>Now: {count}, Before: {prevCount}</p>;
}
```

**`useToggle`** — boolean state:

```jsx
function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle, setValue];
}

function Modal() {
  const [isOpen, toggle] = useToggle();
  return (
    <>
      <button onClick={toggle}>{isOpen ? "Close" : "Open"}</button>
      {isOpen && <Dialog />}
    </>
  );
}
```

:::tip[Mẹo]

**Đừng tự viết lại các hook phổ biến** — đã có thư viện chất lượng cao:

| Thư viện | Có gì |
|----------|-------|
| **usehooks-ts** | 30+ hooks TS-first |
| **react-use** | 90+ hooks (hơi nặng) |
| **@uidotdev/usehooks** | Hooks chất lượng cao |
| **ahooks** | Của Alibaba, đầy đủ |

Cài và dùng:

```bash
npm install usehooks-ts
```

```jsx
import { useDebounce, useLocalStorage, useToggle } from "usehooks-ts";
```

Tự viết khi: cần custom hành vi, hoặc thư viện không có cái cần.

:::

---

## Share state giữa các hook

Custom hook **không tự share state** giữa nhiều component — mỗi component
gọi hook là một instance độc lập:

```jsx
function useCounter() {
  const [count, setCount] = useState(0);
  return { count, setCount };
}

function A() {
  const { count } = useCounter(); // count riêng cho A
}

function B() {
  const { count } = useCounter(); // count riêng cho B
}
```

Muốn share, dùng **Context** hoặc **state management library**:

```jsx
// Cách 1 — Context
const CounterContext = createContext();

function CounterProvider({ children }) {
  const [count, setCount] = useState(0);
  return (
    <CounterContext.Provider value={{ count, setCount }}>
      {children}
    </CounterContext.Provider>
  );
}

function useCounter() {
  return useContext(CounterContext);
}

// Cách 2 — Zustand
import { create } from "zustand";

const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set(s => ({ count: s.count + 1 })),
}));

// Dùng — share state tự nhiên
function A() {
  const count = useCounterStore(s => s.count);
}
```

---

## Best practices

**1. Hook nên có 1 trách nhiệm rõ ràng:**

```jsx
// Tệ — làm quá nhiều
function useEverything() {
  // fetch + form + theme + auth
}

// Tốt — chia nhỏ
function useUser() { /* auth */ }
function useTheme() { /* theme */ }
function useForm() { /* form */ }
```

**2. Hook trả về object hoặc tuple — chọn theo số lượng:**

```jsx
// Tuple — 2 phần tử cố định (giống useState)
function useToggle() {
  return [value, toggle]; // user destructure tên tùy ý
}
const [isOpen, toggleOpen] = useToggle();
const [isDark, toggleDark] = useToggle();

// Object — > 2 phần tử
function useUser() {
  return { user, login, logout, isLoading };
}
const { user, login } = useUser();
```

**3. Memoize giá trị nếu user dùng làm dep:**

```jsx
function useUser() {
  const [user, setUser] = useState(null);

  // Tệ — function mới mỗi render
  const logout = () => setUser(null);

  // Tốt — useCallback
  const logout = useCallback(() => setUser(null), []);

  return { user, logout };
}
```

**4. Type rõ ràng (TypeScript):**

```tsx
interface UseFetchResult<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  refetch: () => void;
}

function useFetch<T>(url: string): UseFetchResult<T> {
  // ...
}

// Dùng — TS infer được type
const { data } = useFetch<User>("/api/user"); // data: User | null
```

:::info[Phân tích]

**Custom hook là cốt lõi của "logic reuse" trong React.** Nguyên tắc:

- **Component** = render logic + state.
- **Custom hook** = stateful logic không phải UI.
- **Util function** = pure logic không có state.

Khi viết code:

1. Logic pure → util function.
2. Logic có state + side effect → custom hook.
3. UI + state local → component.
4. UI nhận state từ ngoài → controlled component.

Phân biệt rõ 4 loại giúp codebase scale tốt — mỗi file 1 trách nhiệm,
dễ test, dễ refactor.

:::
