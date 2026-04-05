---
sidebar_position: 1
title: "Hooks: useState, useEffect, useRef, useCallback, useMemo"
---

# Hooks: useState, useEffect, useRef, useCallback, useMemo

React Hooks ra doi tu phien ban 16.8, va bay gio la cach viet React pho bien nhat. Nhung trong phong van, nguoi ta khong hoi ban "hooks la gi" nua -- ho se hoi sau hon, kieu nhu batching hoat dong ra sao, tai sao useEffect chay 2 lan, hay khi nao thi can useCallback. Cung di vao tung cau hoi nhe.

---

## Cau 1: useState hoat dong nhu the nao ben trong? Giai thich batching, functional updates va lazy initialization. `[Senior]`

### Giai thich ly thuyet

`useState` khong don gian chi la "luu mot gia tri". Ben trong React, moi lan goi `useState`, React luu gia tri do vao mot "fiber node" tuong ung voi component. Khi ban goi `setState`, React khong cap nhat ngay lap tuc ma **batch** (gom nhom) cac cap nhat lai.

**Batching** la gi? Tu React 18 tro di, tat ca cac state updates deu duoc batch -- ke ca trong `setTimeout`, `Promise`, hay event handler. Truoc React 18, chi batch trong React event handlers thoi.

**Functional updates** la khi ban truyen mot function vao `setState` thay vi gia tri truc tiep. Dieu nay quan trong khi gia tri moi phu thuoc vao gia tri cu.

**Lazy initialization** la khi ban truyen mot function vao `useState(fn)` -- function nay chi chay 1 lan duy nhat khi component mount.

### Code vi du

```tsx
import { useState } from 'react';

// Lazy initialization -- ham nay chi chay 1 lan
function ExpensiveComponent() {
  const [data, setData] = useState(() => {
    console.log('Chi chay 1 lan khi mount');
    return heavyComputation(); // VD: parse JSON lon tu localStorage
  });

  return <div>{data}</div>;
}

// Functional update -- dam bao luon lay gia tri moi nhat
function Counter() {
  const [count, setCount] = useState(0);

  const incrementThreeTimes = () => {
    // SAI: chi tang 1 lan vi batching
    // setCount(count + 1);
    // setCount(count + 1);
    // setCount(count + 1);

    // DUNG: tang 3 lan nho functional update
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
    // React 18: chi re-render 1 lan (batched)
    setCount(c => c + 1);
    setFlag(f => !f);
    // Truoc React 18 trong setTimeout se render 2 lan
    // React 18+ luon batch
  };

  return <button onClick={handleClick}>Click</button>;
}
```

### Dap an mau

> "useState luu state vao fiber node cua component. Tu React 18, tat ca state updates deu duoc automatic batching, ke ca trong async code. Khi can cap nhat dua tren gia tri truoc do, dung functional update `setState(prev => ...)` de tranh stale state. Voi cac gia tri khoi tao ton kem, dung lazy initialization `useState(() => expensiveComputation())` de chi tinh 1 lan khi mount."

---

## Cau 2: useEffect -- dependency array hoat dong ra sao? Cleanup function chay khi nao? `[Intermediate]`

### Giai thich ly thuyet

`useEffect` chay **sau** khi React da commit (paint) DOM len man hinh. No nhan 2 tham so: effect function va dependency array.

- **Khong co dependency array**: effect chay sau moi lan render
- **Dependency array rong `[]`**: effect chi chay 1 lan sau mount
- **Co dependency**: effect chay khi bat ky dependency nao thay doi (so sanh bang `Object.is`)

**Cleanup function** chay:
1. Truoc khi effect chay lai (khi dependency thay doi)
2. Khi component unmount

Trong React 18 Strict Mode (development), component mount -> unmount -> mount lai, nen effect chay 2 lan. Day la by design de giup ban phat hien bug.

### Code vi du

```tsx
import { useState, useEffect } from 'react';

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Dung AbortController de cancel request khi userId thay doi
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

    // Cleanup: cancel request cu khi userId thay doi hoac unmount
    return () => {
      controller.abort();
    };
  }, [userId]); // Chi chay lai khi userId thay doi

  return <div>{user?.name}</div>;
}

// PITFALL: Object/array trong dependency
function BadExample({ config }: { config: { theme: string } }) {
  // SAI: config la object moi moi lan parent render
  // => effect chay moi lan render
  useEffect(() => {
    applyTheme(config);
  }, [config]); // config luon "thay doi" vi reference moi

  // DUNG: chi depend vao primitive value
  useEffect(() => {
    applyTheme(config.theme);
  }, [config.theme]); // string primitive, so sanh chinh xac
}
```

### Dap an mau

> "useEffect chay sau khi DOM da paint. Dependency array quyet dinh khi nao effect re-run -- React dung Object.is de so sanh tung dependency. Cleanup function chay truoc moi lan effect re-run va khi unmount. Can luu y: object/array trong dependency se luon 'thay doi' vi reference moi, nen dung primitive values hoac useMemo. Trong Strict Mode, effect chay 2 lan de detect side effect bugs."

---

## Cau 3: useRef -- DOM refs va mutable values. Khi nao dung useRef thay vi useState? `[Intermediate]`

### Giai thich ly thuyet

`useRef` tra ve mot object `{ current: initialValue }` ma **khong thay doi identity** qua cac lan render. No co 2 use case chinh:

1. **DOM refs**: truy cap truc tiep DOM element
2. **Mutable values**: luu gia tri ma khong gay re-render (interval IDs, previous values, flags...)

Khac biet lon nhat voi `useState`: thay doi `ref.current` **KHONG** gay re-render. Gia tri duoc cap nhat ngay lap tuc (dong bo), khong nhu state (bat dong bo, batched).

### Code vi du

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

// Use case 2: Luu gia tri truoc do (previous value)
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}

// Use case 3: Interval ID -- khong can re-render khi luu ID
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

### Dap an mau

> "useRef tao mot container co `.current` property ma persist qua cac lan render. Dung cho DOM refs va mutable values khong can trigger re-render. Khac voi useState, thay doi ref.current la dong bo va khong re-render. Dung khi can luu interval IDs, previous values, hoac bat ky gia tri nao khong anh huong UI."

---

## Cau 4: useCallback vs useMemo -- khac nhau gi? Khi nao thuc su can? `[Senior]`

### Giai thich ly thuyet

- `useMemo(fn, deps)`: **ghi nho gia tri** tra ve cua function `fn`. Chi tinh lai khi deps thay doi.
- `useCallback(fn, deps)`: **ghi nho chinh function** `fn`. Tuong duong `useMemo(() => fn, deps)`.

**Khi nao can?**
- `useMemo`: khi tinh toan nang (filter/sort danh sach lon, complex calculation)
- `useCallback`: khi truyen callback xuong child component duoc wrap boi `React.memo`

**Khi nao KHONG can?** -- Day la cau hoi quan trong:
- Khi child component khong dung `React.memo`
- Khi tinh toan re (don gian)
- Khi premature optimization lam code kho doc hon

### Code vi du

```tsx
import { useState, useMemo, useCallback, memo } from 'react';

// useMemo: ghi nho gia tri tinh toan nang
function ProductList({ products, query }: Props) {
  // Chi filter lai khi products hoac query thay doi
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

// useCallback: ghi nho function de React.memo hoat dong
const ExpensiveChild = memo(({ onClick }: { onClick: () => void }) => {
  console.log('Child rendered');
  return <button onClick={onClick}>Click me</button>;
});

function Parent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  // Khong co useCallback: ExpensiveChild re-render moi lan Parent render
  // Co useCallback: ExpensiveChild chi render khi count thay doi
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

### Bang so sanh

| Tieu chi | `useMemo` | `useCallback` |
|----------|-----------|---------------|
| Ghi nho | **Gia tri** tra ve cua function | **Chinh function** |
| Tuong duong | `useMemo(() => computeValue(), deps)` | `useMemo(() => fn, deps)` |
| Use case | Tinh toan nang, derived data | Callback truyen xuong memo child |
| Khi nao can | Sort/filter danh sach lon | Child dung React.memo |
| Khi nao khong can | Phep tinh don gian | Child khong dung memo |

### Dap an mau

> "useMemo ghi nho gia tri, useCallback ghi nho function. useCallback(fn, deps) tuong duong useMemo(() => fn, deps). useCallback chi huu ich khi truyen callback xuong child component co React.memo. Neu khong co memo, useCallback la vo nghia vi child van re-render do parent render. Khong nen lam dung -- moi hook deu co overhead, chi dung khi do duoc performance improvement thuc su."

---

## Cau 5: useLayoutEffect vs useEffect -- khac nhau o dau? `[Senior]`

### Giai thich ly thuyet

Ca hai deu la side effect hooks, nhung khac nhau o **thoi diem chay**:

- `useEffect`: chay **sau** khi browser da paint DOM. Non-blocking.
- `useLayoutEffect`: chay **truoc** khi browser paint, **sau** khi DOM da update. Blocking.

`useLayoutEffect` dung khi ban can **doc layout tu DOM va re-render dong bo** truoc khi user nhin thay. Vi du: do kich thuoc element, dieu chinh position, tranh flickering.

### Code vi du

```tsx
import { useState, useEffect, useLayoutEffect, useRef } from 'react';

// useLayoutEffect: tranh flicker khi do va set kich thuoc
function Tooltip({ text, targetRect }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [tooltipHeight, setTooltipHeight] = useState(0);

  // Dung useLayoutEffect de do height TRUOC khi paint
  // Neu dung useEffect, user se thay tooltip nhay vi tri (flicker)
  useLayoutEffect(() => {
    if (ref.current) {
      const { height } = ref.current.getBoundingClientRect();
      setTooltipHeight(height);
    }
  }, [text]);

  let top = targetRect.top - tooltipHeight;
  if (top < 0) top = targetRect.bottom; // Flip neu khong du cho

  return (
    <div ref={ref} style={{ position: 'absolute', top, left: targetRect.left }}>
      {text}
    </div>
  );
}

// useEffect: data fetching, subscriptions (khong can dong bo voi paint)
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

### Bang so sanh

| Tieu chi | `useEffect` | `useLayoutEffect` |
|----------|-------------|-------------------|
| Thoi diem | Sau paint | Truoc paint, sau DOM update |
| Blocking | Khong | Co (block paint) |
| Use case | Data fetching, subscriptions, logging | Do layout, tranh flicker |
| Performance | Tot hon (non-blocking) | Can than (block render) |
| SSR | Hoat dong binh thuong | Warning tren server |

### Dap an mau

> "useEffect chay sau khi browser paint, useLayoutEffect chay truoc paint nhung sau DOM update. Dung useLayoutEffect khi can doc layout (getBoundingClientRect) va cap nhat UI dong bo de tranh flickering. Hau het truong hop dung useEffect la du, chi dung useLayoutEffect khi thuc su can."

---

## Cau 6: Custom Hooks -- rules la gi? Khi nao tao custom hook? `[Intermediate]`

### Giai thich ly thuyet

Custom hooks la function bat dau bang `use` va co the goi cac hooks khac ben trong. Day la cach **tai su dung stateful logic** giua cac component.

**Rules of Hooks** (bat buoc):
1. Chi goi hooks o **top level** -- khong trong if/for/nested function
2. Chi goi hooks trong **React function components** hoac **custom hooks**
3. Dat ten bat dau bang `use` (convention, va ESLint plugin dua vao day)

### Code vi du

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

// Su dung
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

### Dap an mau

> "Custom hooks la cach extract va tai su dung stateful logic. Chung tuan theo Rules of Hooks: goi o top level, chi trong components hoac hooks khac, va dat ten bat dau bang 'use'. Moi component goi custom hook se co state rieng biet -- hooks khong share state, chi share logic. Custom hooks thay the hoan toan HOC va render props cho viec reuse logic."

---

## Bang tong hop cac Hooks

| Hook | Muc dich | Trigger re-render? | Timing |
|------|----------|-------------------|--------|
| `useState` | Luu va cap nhat state | Co | Batched |
| `useEffect` | Side effects | Khong (chi chay effect) | Sau paint |
| `useLayoutEffect` | Side effects dong bo | Khong (chi chay effect) | Truoc paint |
| `useRef` | Luu mutable value / DOM ref | Khong | Dong bo |
| `useMemo` | Ghi nho gia tri tinh toan | Khong truc tiep | Trong render |
| `useCallback` | Ghi nho function reference | Khong truc tiep | Trong render |
| `useReducer` | State phuc tap (nhu Redux) | Co | Batched |
| `useContext` | Doc gia tri tu Context | Co (khi context thay doi) | Trong render |

---

## Loi thuong gap khi tra loi

1. **Noi "useState cap nhat ngay lap tuc"** -- Sai. State updates la batched va asynchronous. Gia tri moi chi co o lan render tiep theo.

2. **Khong biet tai sao useEffect chay 2 lan** -- Do Strict Mode trong development. Giai thich duoc dieu nay cho thay ban hieu React lifecycle.

3. **Nham lan useCallback va useMemo** -- useCallback ghi nho function, useMemo ghi nho gia tri. Nho: `useCallback(fn, deps)` = `useMemo(() => fn, deps)`.

4. **Lam dung useMemo/useCallback** -- Khong phai moi tinh toan deu can memo. Chi dung khi co performance issue thuc su hoac truyen props xuong memo child.

5. **Khong noi ve cleanup trong useEffect** -- Cleanup la phan cuc ky quan trong. Khong cleanup dan den memory leaks, race conditions, va stale closures.

6. **Noi useRef "giong bien global"** -- Khong dung. Moi component instance co ref rieng. useRef la per-component mutable container.
