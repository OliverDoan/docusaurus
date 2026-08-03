---
sidebar_position: 8
title: "8. Jotai"
---

# Jotai

> *Thư viện quản lý state nguyên tử (atomic) cho React — đơn giản, nhẹ, và tối ưu re-render theo từng atom.*

:::note[Ghi nhớ nhanh]

- ⭐ **Atom là đơn vị state độc lập** — component chỉ re-render khi đúng atom nó dùng thay đổi, tối ưu re-render tự nhiên.
- ⭐ **`useAtom` giống `useState`** — trả về `[value, setValue]`; ngoài ra có `useAtomValue`/`useSetAtom` khi chỉ cần đọc hoặc chỉ cần ghi.
- **Derived atom** — atom tính từ atom khác (read-only hoặc read-write), tự cập nhật theo dependency.
- **Không cần key string** — Jotai định danh atom qua reference, khác Recoil bắt buộc `key` duy nhất.
- **Provider tùy chọn & tiện ích** — có thể scope state bằng `Provider`; hỗ trợ `Suspense` cho async atom và `atomWithStorage` để lưu trữ.

:::

---

## Câu 1: Jotai là gì? So sánh với Recoil? `[Intermediate]`

### Câu hỏi

> Jotai là gì? Nó khác gì so với Recoil và tại sao lại ra đời?

### Giải thích lý thuyết

**Jotai** (tiếng Nhật: 状態 — "trạng thái") là thư viện quản lý state theo mô hình nguyên tử (atomic) cho React, được phát triển bởi Daishi Kato (tác giả của Zustand). Mỗi **atom** là một đơn vị state độc lập, component chỉ re-render khi đúng atom đó thay đổi.

**Recoil** do Facebook phát triển với triết lý tương tự nhưng có nhiều điểm khác biệt:

| Tiêu chí | Jotai | Recoil |
|---|---|---|
| Bundle size | ~3KB (minified + gzip) | ~21KB |
| API | Đơn giản, ít boilerplate | Phức tạp hơn, cần `RecoilRoot` + `key` string |
| Atom key | Không cần (dùng reference) | Bắt buộc — chuỗi duy nhất toàn cục |
| Suspense | Hỗ trợ tự nhiên | Hỗ trợ tự nhiên |
| TypeScript | Rất tốt | Tốt |
| Trạng thái dự án | Đang phát triển tích cực | Facebook đã ngừng phát triển tích cực |
| Tích hợp React 18+ | Tốt | Có một số vấn đề |

**Lý do Jotai ra đời:** Recoil yêu cầu đặt `key` string cho mỗi atom — điều này dễ gây lỗi trùng key, khó debug và không thân thiện với TypeScript. Jotai loại bỏ hoàn toàn yêu cầu này bằng cách dùng tham chiếu object (`WeakMap`) thay vì string key.

### Code minh hoạ

```ts
// Recoil — cần key string
import { atom } from 'recoil'
const countAtom = atom({ key: 'count', default: 0 }) // dễ bị trùng key

// Jotai — không cần key
import { atom } from 'jotai'
const countAtom = atom(0) // đơn giản hơn nhiều
```

### Đáp án mẫu

> Jotai là thư viện atomic state management nhẹ (~3KB) cho React, không yêu cầu string key như Recoil. Jotai dùng tham chiếu object để định danh atom, giúp tránh xung đột key, giảm boilerplate và tích hợp tốt hơn với TypeScript và React 18+. Recoil đang giảm phát triển trong khi Jotai tiếp tục được duy trì tích cực.

---

## Câu 2: Cách tạo và sử dụng atom trong Jotai? `[Basic]`

### Câu hỏi

> Làm thế nào để tạo atom và sử dụng nó trong component React với Jotai?

### Giải thích lý thuyết

Jotai cung cấp hai khái niệm cốt lõi:

- **`atom(initialValue)`** — tạo một đơn vị state nguyên tử.
- **`useAtom(atom)`** — hook giống `useState`, trả về `[value, setValue]`.

Ngoài ra còn có:
- **`useAtomValue(atom)`** — chỉ đọc giá trị (không lấy setter, tránh re-render không cần thiết).
- **`useSetAtom(atom)`** — chỉ lấy setter (component không re-render khi value thay đổi).

**Derived atom (atom dẫn xuất):** Atom có thể được tính từ atom khác bằng hàm getter — tương tự `computed` trong Vue hoặc `selector` trong Recoil.

### Code minh hoạ

```tsx
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'

// 1. Tạo atom gốc
const countAtom = atom(0)
const nameAtom = atom('Jotai')

// 2. Derived atom — chỉ đọc
const doubleCountAtom = atom((get) => get(countAtom) * 2)

// 3. Writable derived atom — có getter và setter
const uppercaseNameAtom = atom(
  (get) => get(nameAtom).toUpperCase(),
  (_get, set, newValue: string) => set(nameAtom, newValue.toLowerCase())
)

// 4. Sử dụng trong component
function Counter() {
  const [count, setCount] = useAtom(countAtom)
  const double = useAtomValue(doubleCountAtom)

  return (
    <div>
      <p>Count: {count}</p>
      <p>Double: {double}</p>
      <button onClick={() => setCount((c) => c + 1)}>Tăng</button>
    </div>
  )
}

// 5. Component chỉ dispatch — KHÔNG re-render khi count thay đổi
function ResetButton() {
  const setCount = useSetAtom(countAtom)
  return <button onClick={() => setCount(0)}>Reset</button>
}
```

### Đáp án mẫu

> Tạo atom bằng `atom(initialValue)`, dùng trong component bằng `useAtom` (tương tự `useState`). Dùng `useAtomValue` khi chỉ cần đọc và `useSetAtom` khi chỉ cần ghi để tối ưu re-render. Derived atom được tạo bằng hàm getter nhận `get` để đọc các atom khác.

---

## Câu 3: Jotai Provider là gì? Khi nào cần dùng? `[Intermediate]`

### Câu hỏi

> `Provider` trong Jotai là gì? Có bắt buộc phải dùng không và khi nào nên dùng?

### Giải thích lý thuyết

Jotai có cơ chế **Provider-less** (không cần Provider) — atom được lưu trong một store global mặc định. Điều này khác với Redux hay Recoil đều yêu cầu bọc Provider ở root.

**Khi KHÔNG cần Provider:**
- Ứng dụng đơn giản, một store duy nhất.
- Không cần reset state giữa các test hoặc sub-tree.

**Khi CẦN Provider:**
- **Isolate state giữa các sub-tree:** Mỗi `Provider` tạo ra một scope độc lập — cùng atom nhưng giá trị khác nhau.
- **Testing:** Bọc component trong `Provider` để reset state giữa các test, tránh ô nhiễm state giữa test cases.
- **Server-Side Rendering (SSR):** Cần tạo store riêng cho mỗi request để tránh state bị chia sẻ giữa các user.
- **Micro-frontend:** Mỗi widget độc lập cần store riêng.

### Code minh hoạ

```tsx
import { Provider, createStore, atom, useAtom } from 'jotai'

const themeAtom = atom<'light' | 'dark'>('light')

// --- Không cần Provider (global store) ---
function App() {
  return <ThemeToggle /> // dùng global store
}

// --- Dùng Provider để tạo scope độc lập ---
const adminStore = createStore()
const userStore = createStore()

function MultiTenantApp() {
  return (
    <div>
      {/* Admin panel với store riêng */}
      <Provider store={adminStore}>
        <AdminPanel />
      </Provider>

      {/* User panel với store riêng — state độc lập */}
      <Provider store={userStore}>
        <UserPanel />
      </Provider>
    </div>
  )
}

// --- Testing: reset state giữa các test ---
import { render } from '@testing-library/react'

function renderWithJotai(ui: React.ReactElement) {
  const store = createStore() // store mới cho mỗi test
  return render(<Provider store={store}>{ui}</Provider>)
}
```

### Đáp án mẫu

> Jotai hoạt động không cần `Provider` nhờ global store mặc định. Tuy nhiên, cần dùng `Provider` khi muốn isolate state giữa các sub-tree (micro-frontend, multi-tenant), trong testing để tránh state bị chia sẻ giữa test cases, và trong SSR để tạo store riêng cho mỗi request.

---

## Câu 4: Async atoms (atom bất đồng bộ) trong Jotai hoạt động như thế nào? `[Advanced]`

### Câu hỏi

> Jotai xử lý async state (fetch API, Promise) như thế nào? Tích hợp với React Suspense ra sao?

### Giải thích lý thuyết

Jotai hỗ trợ **async atom** tự nhiên — khi getter của atom trả về `Promise`, Jotai tự động tích hợp với React Suspense và Error Boundary.

**Luồng hoạt động:**
1. Component sử dụng async atom sẽ bị **suspend** (throw Promise) trong khi đang fetch.
2. `Suspense` bắt Promise và hiển thị fallback.
3. Khi Promise resolve, component render lại với dữ liệu.
4. Nếu Promise reject, `ErrorBoundary` bắt lỗi.

**`atomWithRefresh` (Jotai Utils):** Cho phép trigger refetch thủ công.

**`loadable`:** Wrapper để đọc async atom mà không cần Suspense — trả về `{state: 'loading'|'hasData'|'hasError', data, error}`.

### Code minh hoạ

```ts
import { atom, useAtom, useAtomValue } from 'jotai'
import { atomWithRefresh, loadable } from 'jotai/utils'
import { Suspense } from 'react'

// 1. Async atom cơ bản
const userIdAtom = atom(1)

const userAtom = atom(async (get) => {
  const id = get(userIdAtom)
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
  if (!res.ok) throw new Error('Fetch thất bại')
  return res.json() as Promise<{ id: number; name: string }>
})

// 2. Component dùng Suspense
function UserCard() {
  const user = useAtomValue(userAtom) // suspend khi đang load
  return <div>Xin chào, {user.name}</div>
}

function App() {
  return (
    <Suspense fallback={<p>Đang tải...</p>}>
      <UserCard />
    </Suspense>
  )
}

// 3. Dùng loadable — không cần Suspense
const loadableUserAtom = loadable(userAtom)

function UserCardSafe() {
  const state = useAtomValue(loadableUserAtom)

  if (state.state === 'loading') return <p>Đang tải...</p>
  if (state.state === 'hasError') return <p>Lỗi: {String(state.error)}</p>
  return <div>Xin chào, {state.data.name}</div>
}

// 4. atomWithRefresh — refetch thủ công
const refreshableUserAtom = atomWithRefresh(async (get) => {
  const id = get(userIdAtom)
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
  return res.json()
})

function UserWithRefresh() {
  const [user, refresh] = useAtom(refreshableUserAtom)
  return (
    <div>
      <p>{user.name}</p>
      <button onClick={() => refresh()}>Làm mới</button>
    </div>
  )
}
```

### Đáp án mẫu

> Async atom trong Jotai tự động tích hợp với React Suspense — khi getter trả về Promise, component suspend cho đến khi resolve. Dùng `loadable` wrapper để xử lý loading/error state mà không cần Suspense boundary. Dùng `atomWithRefresh` từ `jotai/utils` khi cần refetch thủ công.

---

## Câu 5: So sánh bundle size và performance giữa Jotai và Zustand? `[Intermediate]`

### Câu hỏi

> Bundle size và hiệu năng (performance) của Jotai và Zustand khác nhau như thế nào? Khi nào nên chọn cái nào?

### Giải thích lý thuyết

**Bundle size (minified + gzip):**

| Thư viện | Bundle size | Mô hình |
|---|---|---|
| Zustand | ~1.2KB | Flux/Store — một store tập trung |
| Jotai | ~3KB | Atomic — nhiều atom phân tán |
| Recoil | ~21KB | Atomic — nhiều atom phân tán |
| Redux Toolkit | ~11KB | Flux — một store tập trung |

**Re-render performance:**

- **Zustand:** Dùng selector để subscribe một phần state — component chỉ re-render khi phần state đã chọn thay đổi. Nếu không dùng selector, toàn bộ subscriber re-render.
- **Jotai:** Mỗi atom độc lập — component chỉ re-render khi đúng atom đó thay đổi, không cần viết selector. Tự nhiên granular hơn.

**So sánh theo tiêu chí sử dụng:**

| Tiêu chí | Zustand | Jotai |
|---|---|---|
| Bundle size | Nhỏ hơn (~1.2KB) | Lớn hơn (~3KB) |
| Re-render granularity | Cần selector thủ công | Tự động theo atom |
| Cấu trúc state | Store tập trung, có action | Atom phân tán, không action |
| DevTools | Redux DevTools tích hợp tốt | DevTools còn hạn chế |
| Async state | Cần thêm middleware | Hỗ trợ tự nhiên qua Suspense |
| Học dễ | Rất dễ (giống `useState`) | Dễ (atomic mindset) |
| Phù hợp | State tập trung, có logic phức tạp | State phân tán, nhiều atom nhỏ |

### Code minh hoạ

```ts
// Zustand — store tập trung, cần selector để tối ưu re-render
import { create } from 'zustand'

interface Store {
  count: number
  name: string
  increment: () => void
}

const useStore = create<Store>((set) => ({
  count: 0,
  name: 'App',
  increment: () => set((s) => ({ count: s.count + 1 })),
}))

// Component chỉ re-render khi `count` thay đổi (nhờ selector)
function Counter() {
  const count = useStore((s) => s.count) // selector
  const increment = useStore((s) => s.increment)
  return <button onClick={increment}>{count}</button>
}

// Jotai — atom phân tán, tự động granular
import { atom, useAtom, useAtomValue } from 'jotai'

const countAtom = atom(0)
const nameAtom = atom('App')

// Tự động chỉ re-render khi countAtom thay đổi — không cần selector
function JotaiCounter() {
  const [count, setCount] = useAtom(countAtom)
  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>
}
```

### Đáp án mẫu

> Zustand nhỏ hơn (~1.2KB vs ~3KB) và phù hợp với state tập trung có logic phức tạp, nhưng cần viết selector để tối ưu re-render. Jotai tự nhiên granular hơn (mỗi atom độc lập) nhưng bundle lớn hơn một chút. Chọn Zustand khi cần store tập trung với action rõ ràng; chọn Jotai khi state phân tán thành nhiều atom nhỏ và muốn tích hợp Suspense dễ dàng.

---

## Câu 6: Khi nào nên dùng atomic state management (Jotai) thay vì Redux/Zustand? `[Advanced]`

### Câu hỏi

> Những tình huống thực tế nào phù hợp để chọn Jotai thay vì Redux Toolkit hay Zustand?

### Giải thích lý thuyết

Mỗi mô hình quản lý state phù hợp với một loại bài toán:

**Flux/Store-based (Redux, Zustand):**
- State tập trung trong một object.
- Thay đổi state thông qua action có tên rõ ràng.
- DevTools mạnh — time-travel debugging, action log.
- Tốt cho: e-commerce, dashboard phức tạp, state có nhiều actor thay đổi.

**Atomic (Jotai, Recoil):**
- State phân tán thành nhiều atom nhỏ.
- Không có khái niệm action — gọi setter trực tiếp.
- Component subscribe đúng atom cần — re-render tối thiểu.
- Tốt cho: UI state phân tán, state phụ thuộc nhau phức tạp (derived state), tích hợp Suspense cho async data.

**Chọn Jotai khi:**
1. State là nhiều đơn vị độc lập nhỏ (form field, toggle, modal open state).
2. Có nhiều derived state (atom tính từ atom khác) — thay thế `useMemo` phức tạp.
3. Async data fetching cần tích hợp React Suspense mà không muốn dùng React Query.
4. Muốn share state giữa component không cần prop drilling, nhưng state không đủ lớn để cần Redux.
5. Ứng dụng dùng nhiều `useState` bị "prop drilling" — Jotai là bước nâng cấp tự nhiên.

**Không nên dùng Jotai khi:**
- Cần time-travel debugging hoặc action log chi tiết (dùng Redux).
- Team quen với mô hình Flux/action (dùng Zustand hoặc Redux).
- State cần persist phức tạp với middleware (Zustand middleware phong phú hơn).

### Code minh hoạ

```tsx
import { atom, useAtom, useAtomValue } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// Tình huống 1: Nhiều UI state độc lập — Jotai rất phù hợp
const isModalOpenAtom = atom(false)
const isDrawerOpenAtom = atom(false)
const selectedTabAtom = atom<'overview' | 'details' | 'settings'>('overview')

// Tình huống 2: Derived state phức tạp
const cartItemsAtom = atom<{ id: number; price: number; qty: number }[]>([])

const cartTotalAtom = atom((get) => {
  const items = get(cartItemsAtom)
  return items.reduce((sum, item) => sum + item.price * item.qty, 0)
})

const cartCountAtom = atom((get) => {
  return get(cartItemsAtom).reduce((sum, item) => sum + item.qty, 0)
})

const isCartEmptyAtom = atom((get) => get(cartItemsAtom).length === 0)

// Tình huống 3: Persist state vào localStorage
const themeAtom = atomWithStorage<'light' | 'dark'>('theme', 'light')

function ThemeToggle() {
  const [theme, setTheme] = useAtom(themeAtom)
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Chủ đề: {theme}
    </button>
  )
}

// Tình huống 4: State phụ thuộc nhau — không cần action
const filterAtom = atom('')
const sortAtom = atom<'asc' | 'desc'>('asc')
const rawListAtom = atom(['Banana', 'Apple', 'Cherry', 'Date'])

const processedListAtom = atom((get) => {
  const filter = get(filterAtom).toLowerCase()
  const sort = get(sortAtom)
  const list = get(rawListAtom)

  return list
    .filter((item) => item.toLowerCase().includes(filter))
    .sort((a, b) => sort === 'asc' ? a.localeCompare(b) : b.localeCompare(a))
})

function FilterableList() {
  const [filter, setFilter] = useAtom(filterAtom)
  const [sort, setSort] = useAtom(sortAtom)
  const list = useAtomValue(processedListAtom)

  return (
    <div>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Tìm kiếm..." />
      <button onClick={() => setSort((s) => s === 'asc' ? 'desc' : 'asc')}>
        Sắp xếp: {sort}
      </button>
      <ul>{list.map((item) => <li key={item}>{item}</li>)}</ul>
    </div>
  )
}
```

### Đáp án mẫu

> Chọn Jotai khi state tự nhiên chia thành nhiều đơn vị nhỏ độc lập, khi có nhiều derived state phức tạp (thay thế `useMemo` lồng nhau), và khi muốn tích hợp Suspense cho async data. Jotai là bước nâng cấp tự nhiên từ `useState` bị prop drilling. Chọn Redux khi cần action log và time-travel debugging; chọn Zustand khi cần store tập trung với middleware phong phú.

---
