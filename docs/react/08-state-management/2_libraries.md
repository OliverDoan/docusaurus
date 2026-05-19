---
sidebar_position: 2
title: "2. State Management Libraries"
---

# State Management Libraries

---

## Mục lục

- [Tổng quan](#tổng-quan)
- [Zustand (khuyến nghị)](#zustand-khuyến-nghị)
- [Jotai](#jotai)
- [Redux Toolkit](#redux-toolkit)
- [MobX](#mobx)
- [Khi nào cần state management?](#khi-nào-cần-state-management)

---

## Tổng quan

| Lib | Style | Khuyến nghị | Khi nào? |
|-----|-------|-------------|----------|
| **Zustand** | Store đơn giản | **Có** | 90% trường hợp |
| **Jotai** | Atomic state | Có | Form lớn, fine-grained reactivity |
| **Redux Toolkit** | Flux pattern | Có | Codebase lớn, cần devtools mạnh |
| **MobX** | Observable/reactive | Có | OOP style, large state |
| **Recoil** | Atomic (FB) | Không | Maintain mode |

---

## Zustand (khuyến nghị)

[Zustand](https://zustand-demo.pmnd.rs) — nhẹ (~1KB), API đơn giản, **không
cần Provider**.

```bash
npm install zustand
```

```jsx
import { create } from "zustand";

const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set(s => ({ count: s.count + 1 })),
  decrement: () => set(s => ({ count: s.count - 1 })),
  reset: () => set({ count: 0 }),
}));

// Dùng
function Counter() {
  const count = useCounterStore(s => s.count);
  const increment = useCounterStore(s => s.increment);

  return (
    <button onClick={increment}>
      Count: {count}
    </button>
  );
}
```

**Selector** — chỉ re-render khi field cụ thể đổi:

```jsx
// Chỉ subscribe count, không phải toàn bộ store
const count = useCounterStore(s => s.count);

// Multiple field
const { user, theme } = useCounterStore(s => ({ user: s.user, theme: s.theme }), shallow);
```

:::tip[Mẹo]

**Pattern slices** — chia store thành nhiều slice:

```jsx
const createUserSlice = (set) => ({
  user: null,
  login: (u) => set({ user: u }),
});

const createCartSlice = (set) => ({
  cart: [],
  addToCart: (item) => set(s => ({ cart: [...s.cart, item] })),
});

const useStore = create((set) => ({
  ...createUserSlice(set),
  ...createCartSlice(set),
}));
```

Cho phép store lớn vẫn tổ chức được — mỗi file 1 slice.

:::

:::info[Phân tích]

**Tại sao Zustand thắng?**

- **API tối giản** — `create()` + selector. Không action, reducer, dispatch.
- **No Provider** — không phải wrap `<Provider store={...}>`.
- **TS support** tốt từ ngày đầu.
- **Middleware** — persist, devtools, immer, subscribe.
- **Outside React** — gọi `useStore.getState()` từ utility, hook không phải component.
- **Bundle nhẹ** — ~1KB minified gzipped vs Redux ~10KB.

Trade-off: ít "structure" → team lớn cần quy ước. Đa số dự án hiện đại 2024+
chọn Zustand làm default cho client state.

:::

---

## Jotai

[Jotai](https://jotai.org) — **atomic state** từ Recoil team alumni.

```bash
npm install jotai
```

```jsx
import { atom, useAtom } from "jotai";

const countAtom = atom(0);
const doubleAtom = atom(get => get(countAtom) * 2);

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const [double] = useAtom(doubleAtom);

  return (
    <>
      <p>{count} × 2 = {double}</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </>
  );
}
```

Mỗi atom là **đơn vị nhỏ nhất** — chỉ component đọc atom mới re-render khi
atom đổi. Tốt cho:

- **Form lớn** — mỗi field 1 atom.
- **Real-time data** — fine-grained subscription.
- **Computed/derived** — atom phụ thuộc atom khác.

---

## Redux Toolkit

[Redux Toolkit (RTK)](https://redux-toolkit.js.org) — Redux **chính thức**
khuyến nghị từ team Redux. Đã bao gồm Immer + Thunk + DevTools.

```bash
npm install @reduxjs/toolkit react-redux
```

```jsx
import { createSlice, configureStore } from "@reduxjs/toolkit";
import { Provider, useSelector, useDispatch } from "react-redux";

const counterSlice = createSlice({
  name: "counter",
  initialState: { count: 0 },
  reducers: {
    increment: (state) => { state.count++; }, // Immer cho phép "mutate"
    setCount: (state, action) => { state.count = action.payload; },
  },
});

const store = configureStore({
  reducer: { counter: counterSlice.reducer },
});

function App() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  );
}

function Counter() {
  const count = useSelector(s => s.counter.count);
  const dispatch = useDispatch();
  return (
    <button onClick={() => dispatch(counterSlice.actions.increment())}>
      {count}
    </button>
  );
}
```

:::info[Phân tích]

**RTK so với Zustand:**

| | Redux Toolkit | Zustand |
|--|---------------|---------|
| Boilerplate | Trung bình | Cực ít |
| DevTools | Cực mạnh (time-travel) | Có (qua middleware) |
| Middleware ecosystem | Phong phú (saga, observable...) | Cơ bản |
| Learning curve | Cao hơn | Thấp |
| RTK Query | Built-in data fetching | Phải kết hợp TanStack Query |
| Bundle size | ~10KB | ~1KB |
| 2026 popular | Vẫn nhiều legacy | Mới phổ biến |

Chọn RTK khi:

- Team đã quen Redux.
- Dự án rất lớn, cần devtools mạnh.
- Cần RTK Query (built-in caching).
- Cần middleware đặc biệt (saga, listener middleware).

Còn lại → Zustand đơn giản hơn.

:::

---

## MobX

[MobX](https://mobx.js.org) — reactive/observable state, OOP-style.

```bash
npm install mobx mobx-react
```

```jsx
import { makeAutoObservable } from "mobx";
import { observer } from "mobx-react";

class CounterStore {
  count = 0;

  constructor() {
    makeAutoObservable(this);
  }

  increment() {
    this.count++;
  }
}

const counter = new CounterStore();

const Counter = observer(() => (
  <button onClick={() => counter.increment()}>
    {counter.count}
  </button>
));
```

MobX dùng **getter/setter proxy** để track dependency tự động — viết JS
thường, MobX biết component nào dùng field nào.

Phù hợp:

- Codebase quen OOP (chuyển từ Angular, Java).
- State có quan hệ phức tạp (model, relationships).
- Game, editor — UI có nhiều state nested.

---

## Khi nào cần state management?

**Không cần** state management:

- App nhỏ, state cục bộ trong component.
- State chỉ share giữa parent-child gần.
- Server state — dùng **TanStack Query** thay vì state global.

**Cần** state management khi:

- State share giữa **nhiều subtree** không có quan hệ parent-child.
- Logic phức tạp (cart, checkout, multi-step form).
- Cần **persist** state (localStorage).
- Cần **time-travel debug** (Redux DevTools).
- State có **derived values** phức tạp (Jotai/MobX shine).

:::warning[Cần lưu ý]

**Đừng bê state management ngay từ ngày 1**:

```jsx
// Tệ — over-engineer cho counter đơn giản
const useCounter = create(set => ({
  count: 0,
  inc: () => set(s => ({ count: s.count + 1 })),
}));

// Tốt — local state đủ
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

Tiến trình tự nhiên:

1. `useState` local.
2. Lift state up khi share giữa siblings.
3. Context cho cross-tree (theme, auth).
4. State manager (Zustand/Jotai) khi context không đủ.

Hầu hết app stop ở bước 2-3. Bước 4 chỉ dành cho app phức tạp thật sự.

:::

:::tip[Mẹo]

**Phân biệt 3 loại state**:

| Loại | Mô tả | Tool |
|------|-------|------|
| **Server state** | Data từ API (user, posts, products) | **TanStack Query**, SWR |
| **URL state** | Filter, page, search trong URL | React Router `useSearchParams` |
| **Client state** | UI state, form, modal | `useState`, Zustand, Jotai |

Quy tắc: **dùng đúng tool cho đúng loại state**. Đa số bug "state management"
xảy ra vì lẫn lộn — vd lưu data từ API vào Redux thay vì TanStack Query.

:::
