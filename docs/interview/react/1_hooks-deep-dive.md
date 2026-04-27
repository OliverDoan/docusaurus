---
sidebar_position: 1
title: "1. Hooks: useState, useEffect, useRef, useCallback, useMemo"
---

# Hooks: useState, useEffect, useRef, useCallback, useMemo

React Hooks ra đời từ phiên bản 16.8, và bây giờ là cách viết React phổ biến nhất. Nhưng trong phỏng vấn, người ta không hỏi bạn "hooks là gì" nữa -- họ sẽ hỏi sâu hơn, kiểu như batching hoạt động ra sao, tại sao useEffect chạy 2 lần, hay khi nào thì cần useCallback. Cùng đi vào từng câu hỏi nhé.

---


---

## Mục lục

- [Câu 1: useState hoạt động như thế nào bên trong? Giải thích batching, functional updates và lazy initialization. `[Senior]`](#câu-1-usestate-hoạt-động-như-thế-nào-bên-trong-giải-thích-batching-functional-updates-và-lazy-initialization-senior)
- [Câu 2: useEffect -- dependency array hoạt động ra sao? Cleanup function chạy khi nào? `[Intermediate]`](#câu-2-useeffect-dependency-array-hoạt-động-ra-sao-cleanup-function-chạy-khi-nào-intermediate)
- [Câu 3: useRef -- DOM refs và mutable values. Khi nào dùng useRef thay vì useState? `[Intermediate]`](#câu-3-useref-dom-refs-và-mutable-values-khi-nào-dùng-useref-thay-vì-usestate-intermediate)
- [Câu 4: useCallback vs useMemo -- khác nhau gì? Khi nào thực sự cần? `[Senior]`](#câu-4-usecallback-vs-usememo-khác-nhau-gì-khi-nào-thực-sự-cần-senior)
- [Câu 5: useLayoutEffect vs useEffect -- khác nhau ở đâu? `[Senior]`](#câu-5-uselayouteffect-vs-useeffect-khác-nhau-ở-đâu-senior)
- [Câu 6: Custom Hooks -- rules là gì? Khi nào tạo custom hook? `[Intermediate]`](#câu-6-custom-hooks-rules-là-gì-khi-nào-tạo-custom-hook-intermediate)
- [Bảng tổng hợp các Hooks](#bảng-tổng-hợp-các-hooks)
- [Lỗi thường gặp khi trả lời](#lỗi-thường-gặp-khi-trả-lời)

---

## Câu 1: useState hoạt động như thế nào bên trong? Giải thích batching, functional updates và lazy initialization. `[Senior]`

### Giải thích lý thuyết

`useState` không đơn giản chỉ là "lưu một giá trị". Bên trong React, mỗi lần gọi `useState`, React lưu giá trị đó vào một "fiber node" tương ứng với component. Khi bạn gọi `setState`, React không cập nhật ngay lập tức mà **batch** (gom nhóm) các cập nhật lại.

**Batching** là gì? Từ React 18 trở đi, tất cả các state updates đều được batch -- kể cả trong `setTimeout`, `Promise`, hay event handler. Trước React 18, chỉ batch trong React event handlers thôi.

**Functional updates** là khi bạn truyền một function vào `setState` thay vì giá trị trực tiếp. Điều này quan trọng khi giá trị mới phụ thuộc vào giá trị cũ.

**Lazy initialization** là khi bạn truyền một function vào `useState(fn)` -- function này chỉ chạy 1 lần duy nhất khi component mount.

### Code ví dụ

```tsx
import { useState } from 'react';

// Lazy initialization -- hàm này chỉ chạy 1 lần
function ExpensiveComponent() {
  const [data, setData] = useState(() => {
    console.log('Chỉ chạy 1 lần khi mount');
    return heavyComputation(); // VD: parse JSON lớn từ localStorage
  });

  return <div>{data}</div>;
}

// Functional update -- đảm bảo luôn lấy giá trị mới nhất
function Counter() {
  const [count, setCount] = useState(0);

  const incrementThreeTimes = () => {
    // SAI: chỉ tăng 1 lần vì batching
    // setCount(count + 1);
    // setCount(count + 1);
    // setCount(count + 1);

    // ĐÚNG: tăng 3 lần nhờ functional update
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
  };

  return <button onClick={incrementThreeTimes}>{count}</button>;
}

// Batching trong React 18
function BatchingDemo() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  const handleClick = () => {
    // React 18: chỉ re-render 1 lần (batched)
    setCount(c => c + 1);
    setFlag(f => !f);
    // Trước React 18 trong setTimeout sẽ render 2 lần
    // React 18+ luôn batch
  };

  return <button onClick={handleClick}>Click</button>;
}
```

### Đáp án mẫu

> "useState lưu state vào fiber node của component. Từ React 18, tất cả state updates đều được automatic batching, kể cả trong async code. Khi cần cập nhật dựa trên giá trị trước đó, dùng functional update `setState(prev => ...)` để tránh stale state. Với các giá trị khởi tạo tốn kém, dùng lazy initialization `useState(() => expensiveComputation())` để chỉ tính 1 lần khi mount."

---

## Câu 2: useEffect -- dependency array hoạt động ra sao? Cleanup function chạy khi nào? `[Intermediate]`

### Giải thích lý thuyết

`useEffect` chạy **sau** khi React đã commit (paint) DOM lên màn hình. Nó nhận 2 tham số: effect function và dependency array.

- **Không có dependency array**: effect chạy sau mỗi lần render
- **Dependency array rỗng `[]`**: effect chỉ chạy 1 lần sau mount
- **Có dependency**: effect chạy khi bất kỳ dependency nào thay đổi (so sánh bằng `Object.is`)

**Cleanup function** chạy:
1. Trước khi effect chạy lại (khi dependency thay đổi)
2. Khi component unmount

Trong React 18 Strict Mode (development), component mount -> unmount -> mount lại, nên effect chạy 2 lần. Đây là by design để giúp bạn phát hiện bug.

### Code ví dụ

```tsx
import { useState, useEffect } from 'react';

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Dùng AbortController để cancel request khi userId thay đổi
    const controller = new AbortController();

    async function fetchUser() {
      try {
        const res = await fetch(`/api/users/${userId}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setUser(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Fetch failed:', err);
        }
      }
    }

    fetchUser();

    // Cleanup: cancel request cũ khi userId thay đổi hoặc unmount
    return () => {
      controller.abort();
    };
  }, [userId]); // Chỉ chạy lại khi userId thay đổi

  return <div>{user?.name}</div>;
}

// PITFALL: Object/array trong dependency
function BadExample({ config }: { config: { theme: string } }) {
  // SAI: config là object mới mỗi lần parent render
  // => effect chạy mỗi lần render
  useEffect(() => {
    applyTheme(config);
  }, [config]); // config luôn "thay đổi" vì reference mới

  // ĐÚNG: chỉ depend vào primitive value
  useEffect(() => {
    applyTheme(config.theme);
  }, [config.theme]); // string primitive, so sánh chính xác
}
```

### Đáp án mẫu

> "useEffect chạy sau khi DOM đã paint. Dependency array quyết định khi nào effect re-run -- React dùng Object.is để so sánh từng dependency. Cleanup function chạy trước mỗi lần effect re-run và khi unmount. Cần lưu ý: object/array trong dependency sẽ luôn 'thay đổi' vì reference mới, nên dùng primitive values hoặc useMemo. Trong Strict Mode, effect chạy 2 lần để detect side effect bugs."

---

## Câu 3: useRef -- DOM refs và mutable values. Khi nào dùng useRef thay vì useState? `[Intermediate]`

### Giải thích lý thuyết

`useRef` trả về một object `{ current: initialValue }` mà **không thay đổi identity** qua các lần render. Nó có 2 use case chính:

1. **DOM refs**: truy cập trực tiếp DOM element
2. **Mutable values**: lưu giá trị mà không gây re-render (interval IDs, previous values, flags...)

Khác biệt lớn nhất với `useState`: thay đổi `ref.current` **KHÔNG** gây re-render. Giá trị được cập nhật ngay lập tức (đồng bộ), không như state (bất đồng bộ, batched).

### Code ví dụ

```tsx
import { useRef, useState, useEffect } from 'react';

// Use case 1: DOM ref
function AutoFocusInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} placeholder="Auto focused!" />;
}

// Use case 2: Lưu giá trị trước đó (previous value)
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}

// Use case 3: Interval ID -- không cần re-render khi lưu ID
function Timer() {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const start = () => {
    if (intervalRef.current !== null) return;
    intervalRef.current = window.setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
  };

  const stop = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => stop(); // Cleanup khi unmount
  }, []);

  return (
    <div>
      <p>{seconds}s</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
```

### Đáp án mẫu

> "useRef tạo một container có `.current` property mà persist qua các lần render. Dùng cho DOM refs và mutable values không cần trigger re-render. Khác với useState, thay đổi ref.current là đồng bộ và không re-render. Dùng khi cần lưu interval IDs, previous values, hoặc bất kỳ giá trị nào không ảnh hưởng UI."

---

## Câu 4: useCallback vs useMemo -- khác nhau gì? Khi nào thực sự cần? `[Senior]`

### Giải thích lý thuyết

- `useMemo(fn, deps)`: **ghi nhớ giá trị** trả về của function `fn`. Chỉ tính lại khi deps thay đổi.
- `useCallback(fn, deps)`: **ghi nhớ chính function** `fn`. Tương đương `useMemo(() => fn, deps)`.

**Khi nào cần?**
- `useMemo`: khi tính toán nặng (filter/sort danh sách lớn, complex calculation)
- `useCallback`: khi truyền callback xuống child component được wrap bởi `React.memo`

**Khi nào KHÔNG cần?** -- Đây là câu hỏi quan trọng:
- Khi child component không dùng `React.memo`
- Khi tính toán rẻ (đơn giản)
- Khi premature optimization làm code khó đọc hơn

### Code ví dụ

```tsx
import { useState, useMemo, useCallback, memo } from 'react';

// useMemo: ghi nhớ giá trị tính toán nặng
function ProductList({ products, query }: Props) {
  // Chỉ filter lại khi products hoặc query thay đổi
  const filtered = useMemo(() => {
    console.log('Filtering...');
    return products.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [products, query]);

  return (
    <ul>
      {filtered.map(p => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}

// useCallback: ghi nhớ function để React.memo hoạt động
const ExpensiveChild = memo(({ onClick }: { onClick: () => void }) => {
  console.log('Child rendered');
  return <button onClick={onClick}>Click me</button>;
});

function Parent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  // Không có useCallback: ExpensiveChild re-render mỗi lần Parent render
  // Có useCallback: ExpensiveChild chỉ render khi count thay đổi
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  return (
    <div>
      <input value={name} onChange={e => setName(e.target.value)} />
      <ExpensiveChild onClick={handleClick} />
      <p>Count: {count}</p>
    </div>
  );
}
```

### Bảng so sánh

| Tiêu chí | `useMemo` | `useCallback` |
|----------|-----------|---------------|
| Ghi nhớ | **Giá trị** trả về của function | **Chính function** |
| Tương đương | `useMemo(() => computeValue(), deps)` | `useMemo(() => fn, deps)` |
| Use case | Tính toán nặng, derived data | Callback truyền xuống memo child |
| Khi nào cần | Sort/filter danh sách lớn | Child dùng React.memo |
| Khi nào không cần | Phép tính đơn giản | Child không dùng memo |

### Đáp án mẫu

> "useMemo ghi nhớ giá trị, useCallback ghi nhớ function. useCallback(fn, deps) tương đương useMemo(() => fn, deps). useCallback chỉ hữu ích khi truyền callback xuống child component có React.memo. Nếu không có memo, useCallback là vô nghĩa vì child vẫn re-render do parent render. Không nên lạm dụng -- mỗi hook đều có overhead, chỉ dùng khi đo được performance improvement thực sự."

---

## Câu 5: useLayoutEffect vs useEffect -- khác nhau ở đâu? `[Senior]`

### Giải thích lý thuyết

Cả hai đều là side effect hooks, nhưng khác nhau ở **thời điểm chạy**:

- `useEffect`: chạy **sau** khi browser đã paint DOM. Non-blocking.
- `useLayoutEffect`: chạy **trước** khi browser paint, **sau** khi DOM đã update. Blocking.

`useLayoutEffect` dùng khi bạn cần **đọc layout từ DOM và re-render đồng bộ** trước khi user nhìn thấy. Ví dụ: đo kích thước element, điều chỉnh position, tránh flickering.

### Code ví dụ

```tsx
import { useState, useEffect, useLayoutEffect, useRef } from 'react';

// useLayoutEffect: tránh flicker khi đo và set kích thước
function Tooltip({ text, targetRect }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [tooltipHeight, setTooltipHeight] = useState(0);

  // Dùng useLayoutEffect để đo height TRƯỚC khi paint
  // Nếu dùng useEffect, user sẽ thấy tooltip nhảy vị trí (flicker)
  useLayoutEffect(() => {
    if (ref.current) {
      const { height } = ref.current.getBoundingClientRect();
      setTooltipHeight(height);
    }
  }, [text]);

  let top = targetRect.top - tooltipHeight;
  if (top < 0) top = targetRect.bottom; // Flip nếu không đủ chỗ

  return (
    <div ref={ref} style={{ position: 'absolute', top, left: targetRect.left }}>
      {text}
    </div>
  );
}

// useEffect: data fetching, subscriptions (không cần đồng bộ với paint)
function DataFetcher() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);

  return <div>{JSON.stringify(data)}</div>;
}
```

### Bảng so sánh

| Tiêu chí | `useEffect` | `useLayoutEffect` |
|----------|-------------|-------------------|
| Thời điểm | Sau paint | Trước paint, sau DOM update |
| Blocking | Không | Có (block paint) |
| Use case | Data fetching, subscriptions, logging | Đo layout, tránh flicker |
| Performance | Tốt hơn (non-blocking) | Cẩn thận (block render) |
| SSR | Hoạt động bình thường | Warning trên server |

### Đáp án mẫu

> "useEffect chạy sau khi browser paint, useLayoutEffect chạy trước paint nhưng sau DOM update. Dùng useLayoutEffect khi cần đọc layout (getBoundingClientRect) và cập nhật UI đồng bộ để tránh flickering. Hầu hết trường hợp dùng useEffect là đủ, chỉ dùng useLayoutEffect khi thực sự cần."

---

## Câu 6: Custom Hooks -- rules là gì? Khi nào tạo custom hook? `[Intermediate]`

### Giải thích lý thuyết

Custom hooks là function bắt đầu bằng `use` và có thể gọi các hooks khác bên trong. Đây là cách **tái sử dụng stateful logic** giữa các component.

**Rules of Hooks** (bắt buộc):
1. Chỉ gọi hooks ở **top level** -- không trong if/for/nested function
2. Chỉ gọi hooks trong **React function components** hoặc **custom hooks**
3. Đặt tên bắt đầu bằng `use` (convention, và ESLint plugin dựa vào đây)

### Code ví dụ

```tsx
import { useState, useEffect, useCallback } from 'react';

// Custom hook: useLocalStorage
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue(prev => {
      const valueToStore = value instanceof Function ? value(prev) : value;
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      return valueToStore;
    });
  }, [key]);

  return [storedValue, setValue] as const;
}

// Custom hook: useFetch
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err as Error);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
}

// Sử dụng
function UserList() {
  const { data: users, loading, error } = useFetch<User[]>('/api/users');
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {users?.map(u => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
}
```

### Đáp án mẫu

> "Custom hooks là cách extract và tái sử dụng stateful logic. Chúng tuân theo Rules of Hooks: gọi ở top level, chỉ trong components hoặc hooks khác, và đặt tên bắt đầu bằng 'use'. Mỗi component gọi custom hook sẽ có state riêng biệt -- hooks không share state, chỉ share logic. Custom hooks thay thế hoàn toàn HOC và render props cho việc reuse logic."

---

## Bảng tổng hợp các Hooks

| Hook | Mục đích | Trigger re-render? | Timing |
|------|----------|-------------------|--------|
| `useState` | Lưu và cập nhật state | Có | Batched |
| `useEffect` | Side effects | Không (chỉ chạy effect) | Sau paint |
| `useLayoutEffect` | Side effects đồng bộ | Không (chỉ chạy effect) | Trước paint |
| `useRef` | Lưu mutable value / DOM ref | Không | Đồng bộ |
| `useMemo` | Ghi nhớ giá trị tính toán | Không trực tiếp | Trong render |
| `useCallback` | Ghi nhớ function reference | Không trực tiếp | Trong render |
| `useReducer` | State phức tạp (như Redux) | Có | Batched |
| `useContext` | Đọc giá trị từ Context | Có (khi context thay đổi) | Trong render |

---

## Lỗi thường gặp khi trả lời

1. **Nói "useState cập nhật ngay lập tức"** -- Sai. State updates là batched và asynchronous. Giá trị mới chỉ có ở lần render tiếp theo.

2. **Không biết tại sao useEffect chạy 2 lần** -- Do Strict Mode trong development. Giải thích được điều này cho thấy bạn hiểu React lifecycle.

3. **Nhầm lẫn useCallback và useMemo** -- useCallback ghi nhớ function, useMemo ghi nhớ giá trị. Nhớ: `useCallback(fn, deps)` = `useMemo(() => fn, deps)`.

4. **Lạm dụng useMemo/useCallback** -- Không phải mọi tính toán đều cần memo. Chỉ dùng khi có performance issue thực sự hoặc truyền props xuống memo child.

5. **Không nói về cleanup trong useEffect** -- Cleanup là phần cực kỳ quan trọng. Không cleanup dẫn đến memory leaks, race conditions, và stale closures.

6. **Nói useRef "giống biến global"** -- Không đúng. Mỗi component instance có ref riêng. useRef là per-component mutable container.
