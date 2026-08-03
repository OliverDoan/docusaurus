---
sidebar_position: 7
title: "7. Zustand"
---

# Zustand

> *Thư viện quản lý state tối giản cho React — không boilerplate, không provider, chỉ cần một hook.*

:::note[Ghi nhớ nhanh]

- ⭐ **Không cần Provider** — `create()` trả về một hook dùng trực tiếp trong component, khác Redux/Context phải bọc `<Provider>`.
- ⭐ **Selector để tối ưu re-render** — chọn đúng phần state cần (`useStore(s => s.count)`), component chỉ re-render khi phần đó đổi.
- **`useShallow` / so sánh nông** — tránh re-render thừa khi selector trả về object/array mới mỗi lần.
- **Middleware linh hoạt** — `persist` (lưu localStorage), `immer` (viết mutate an toàn), `devtools`.
- **Bundle nhỏ (~1KB)** — nhẹ, ít boilerplate; phù hợp client state đơn giản đến vừa.

:::

---

## Câu 1: Zustand là gì? So sánh với Redux về độ phức tạp? `[Basic]`

### Câu hỏi

> Zustand là gì? Tại sao nhiều dự án chuyển từ Redux sang Zustand? Hãy so sánh độ phức tạp giữa hai thư viện.

### Giải thích lý thuyết

**Zustand** (tiếng Đức: "trạng thái") là thư viện quản lý state nhỏ gọn cho React, được tạo bởi Jotai/Zustand team (Poimandres). Điểm nổi bật:

- Không cần wrap app trong `Provider`
- API cực kỳ đơn giản: tạo store → dùng hook
- Bundle size nhỏ (~1KB gzip)
- Hỗ trợ TypeScript tốt, middleware linh hoạt

| Tiêu chí | Redux Toolkit | Zustand |
|---|---|---|
| Boilerplate | Trung bình (slice, action, reducer) | Tối thiểu (chỉ `create`) |
| Provider | Cần `<Provider>` bọc app | Không cần |
| DevTools | Tích hợp sẵn | Cần thêm middleware |
| Learning curve | Cao | Thấp |
| Bundle size | ~13KB | ~1KB |
| Phù hợp | App lớn, nhiều team | App vừa/nhỏ, prototype nhanh |

### Code minh hoạ

```ts
// Redux Toolkit — cần nhiều bước
import { createSlice, configureStore } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1 },
  },
})

export const store = configureStore({ reducer: { counter: counterSlice.reducer } })

// Zustand — chỉ một bước
import { create } from 'zustand'

const useCounterStore = create((set) => ({
  value: 0,
  increment: () => set((state) => ({ value: state.value + 1 })),
}))
```

### Đáp án mẫu

> Zustand là thư viện state management tối giản, không yêu cầu Provider và có API đơn giản hơn Redux nhiều. Redux phù hợp cho dự án lớn cần traceability cao; Zustand phù hợp khi cần triển khai nhanh với ít boilerplate.

---

## Câu 2: Cách tạo một store với Zustand như thế nào? `[Basic]`

### Câu hỏi

> Hãy trình bày các bước tạo một Zustand store đơn giản và sử dụng nó trong component React.

### Giải thích lý thuyết

Quy trình tạo store Zustand:

1. Gọi `create()` với một callback nhận `set` (và tuỳ chọn `get`)
2. Callback trả về object chứa **state** và **actions**
3. Dùng hook trả về từ `create()` trong bất kỳ component nào — không cần Provider

### Code minh hoạ

```ts
// store/useBearStore.ts
import { create } from 'zustand'

interface BearState {
  bears: number
  addBear: () => void
  resetBears: () => void
}

const useBearStore = create<BearState>((set) => ({
  bears: 0,
  addBear: () => set((state) => ({ bears: state.bears + 1 })),
  resetBears: () => set({ bears: 0 }),
}))

export default useBearStore
```

```tsx
// components/BearCounter.tsx
import useBearStore from '../store/useBearStore'

export function BearCounter() {
  const bears = useBearStore((state) => state.bears)
  const addBear = useBearStore((state) => state.addBear)
  const resetBears = useBearStore((state) => state.resetBears)

  return (
    <div>
      <p>Số gấu: {bears}</p>
      <button onClick={addBear}>Thêm gấu</button>
      <button onClick={resetBears}>Reset</button>
    </div>
  )
}
```

### Đáp án mẫu

> Gọi `create<State>()` với callback trả về state và actions. Hook kết quả có thể dùng trực tiếp trong component với selector để lấy phần state cần thiết, không cần Provider bao bọc.

---

## Câu 3: Cách định nghĩa actions trong Zustand store? `[Basic]`

### Câu hỏi

> Có những cách nào để định nghĩa actions trong Zustand? So sánh ưu nhược điểm của từng cách.

### Giải thích lý thuyết

Zustand có **3 cách** định nghĩa actions:

1. **Actions nằm trong store** (khuyến nghị): actions và state cùng một chỗ, dễ quản lý
2. **Actions bên ngoài store**: gọi `store.setState()` từ bên ngoài, linh hoạt hơn nhưng khó trace
3. **Kết hợp `get`**: dùng `get()` để đọc state hiện tại trong action phức tạp

### Code minh hoạ

```ts
import { create } from 'zustand'

interface CartState {
  items: string[]
  total: number
  addItem: (item: string, price: number) => void
  removeItem: (item: string, price: number) => void
  clearCart: () => void
}

const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,

  // Cách 1: action đơn giản dùng set với updater function (immutable)
  addItem: (item, price) =>
    set((state) => ({
      items: [...state.items, item],
      total: state.total + price,
    })),

  // Cách 2: dùng get() để đọc state hiện tại trong logic phức tạp
  removeItem: (item, price) => {
    const { items } = get()
    const index = items.indexOf(item)
    if (index === -1) return
    set((state) => ({
      items: state.items.filter((_, i) => i !== index),
      total: state.total - price,
    }))
  },

  // Cách 3: reset về initial state
  clearCart: () => set({ items: [], total: 0 }),
}))
```

### Đáp án mẫu

> Actions nên được định nghĩa bên trong callback của `create()`, sử dụng `set` với updater function để đảm bảo immutability. Dùng `get()` khi action cần đọc state hiện tại trước khi tính toán.

---

## Câu 4: Zustand khác Redux như thế nào về kiến trúc? `[Intermediate]`

### Câu hỏi

> Hãy phân tích sự khác biệt kiến trúc giữa Zustand và Redux. Zustand quản lý state và subscription như thế nào internally?

### Giải thích lý thuyết

**Redux** theo mô hình Flux thuần tuý:
- Single global store
- State chỉ thay đổi qua dispatch action → reducer → new state
- Component subscribe qua `react-redux` selector
- Yêu cầu Provider truyền store xuống cây component

**Zustand** theo mô hình pub-sub đơn giản hơn:
- Store là một closure bên ngoài React
- `set` gọi → state mới → notify tất cả subscriber
- Component tự subscribe trực tiếp vào store qua hook
- Không cần Provider vì store không phụ thuộc React context

| Khía cạnh | Redux | Zustand |
|---|---|---|
| Pattern | Flux/Event Sourcing | Pub-Sub |
| State update | dispatch → reducer | `set()` trực tiếp |
| Subscription | react-redux connect | Hook selector |
| Context phụ thuộc | Có (Provider) | Không |
| Time-travel debug | Tốt | Cần middleware |
| Middleware | applyMiddleware | `create(middleware(...))` |

### Code minh hoạ

```ts
// Zustand hoạt động như một pub-sub store đơn giản
// Bên trong Zustand (simplified):
function createStore(createState) {
  let state
  const listeners = new Set()

  const setState = (partial) => {
    const nextState = typeof partial === 'function' ? partial(state) : partial
    if (nextState !== state) {
      state = { ...state, ...nextState }
      listeners.forEach((listener) => listener(state))
    }
  }

  const getState = () => state
  const subscribe = (listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener) // unsubscribe
  }

  state = createState(setState, getState)
  return { getState, setState, subscribe }
}
```

### Đáp án mẫu

> Zustand dùng mô hình pub-sub với closure, store tồn tại ngoài React tree nên không cần Provider. Redux dùng mô hình Flux với reducer function thuần tuý, phù hợp khi cần audit trail rõ ràng của mọi state change.

---

## Câu 5: Làm thế nào để tránh re-render không cần thiết trong Zustand (selector)? `[Intermediate]`

### Câu hỏi

> Zustand re-render component theo cơ chế nào? Làm sao dùng selector để tối ưu performance?

### Giải thích lý thuyết

Mặc định, Zustand so sánh **shallow equality** (`===`) kết quả của selector sau mỗi lần state thay đổi:

- Nếu selector trả về **primitive**: re-render khi giá trị thay đổi
- Nếu selector trả về **object/array mới**: re-render mỗi lần (dù nội dung giống nhau!)
- Giải pháp: dùng `useShallow` hoặc tách selector thành nhiều hook riêng

### Code minh hoạ

```ts
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

interface UserState {
  name: string
  email: string
  age: number
  updateName: (name: string) => void
}

const useUserStore = create<UserState>((set) => ({
  name: 'Alice',
  email: 'alice@example.com',
  age: 30,
  updateName: (name) => set({ name }),
}))

// BAD: tạo object mới mỗi lần → re-render liên tục dù name/email không đổi
function ProfileBad() {
  const { name, email } = useUserStore((state) => ({
    name: state.name,
    email: state.email,
  }))
  return <p>{name} - {email}</p>
}

// GOOD: dùng useShallow để so sánh shallow
function ProfileGood() {
  const { name, email } = useUserStore(
    useShallow((state) => ({ name: state.name, email: state.email }))
  )
  return <p>{name} - {email}</p>
}

// BEST: tách thành selector độc lập cho từng giá trị
function ProfileBest() {
  const name = useUserStore((state) => state.name)
  const email = useUserStore((state) => state.email)
  return <p>{name} - {email}</p>
}
```

### Đáp án mẫu

> Zustand re-render khi giá trị selector thay đổi theo `===`. Để tránh re-render thừa: ưu tiên selector trả về primitive, dùng `useShallow` khi cần chọn nhiều field, hoặc tách thành nhiều `useStore` call riêng biệt.

---

## Câu 6: Zustand middleware là gì? Cho ví dụ về devtools middleware? `[Intermediate]`

### Câu hỏi

> Middleware trong Zustand hoạt động như thế nào? Hãy trình bày cách tích hợp Redux DevTools với Zustand.

### Giải thích lý thuyết

Middleware trong Zustand là higher-order function bọc quanh `create`, can thiệp vào quá trình `set`/`get`:

```
create(middleware(storeInitializer))
```

Các middleware có sẵn trong `zustand/middleware`:
- `devtools` — tích hợp Redux DevTools Extension
- `persist` — lưu state vào localStorage/sessionStorage
- `immer` — dùng Immer để viết mutation-style code
- `subscribeWithSelector` — subscribe với selector chi tiết

### Code minh hoạ

```ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface CounterState {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
}

const useCounterStore = create<CounterState>()(
  devtools(
    (set) => ({
      count: 0,
      // Tên action hiển thị trong DevTools
      increment: () => set((state) => ({ count: state.count + 1 }), false, 'counter/increment'),
      decrement: () => set((state) => ({ count: state.count - 1 }), false, 'counter/decrement'),
      reset: () => set({ count: 0 }, false, 'counter/reset'),
    }),
    { name: 'CounterStore' } // Tên store trong DevTools
  )
)

export default useCounterStore
```

```ts
// Kết hợp nhiều middleware
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

const useStore = create<CounterState>()(
  devtools(
    persist(
      (set) => ({
        count: 0,
        increment: () => set((s) => ({ count: s.count + 1 })),
      }),
      { name: 'counter-storage' }
    ),
    { name: 'CounterStore' }
  )
)
```

### Đáp án mẫu

> Middleware Zustand là HOF bọc quanh initializer, can thiệp vào `set`/`get`. `devtools` middleware kết nối store với Redux DevTools Extension — truyền tên action làm tham số thứ 3 của `set` để DevTools hiển thị đúng tên action.

---

## Câu 7: persist middleware trong Zustand hoạt động như thế nào? `[Intermediate]`

### Câu hỏi

> Hãy giải thích cơ chế hoạt động của `persist` middleware. Làm thế nào để chỉ persist một phần state?

### Giải thích lý thuyết

`persist` middleware tự động:
1. **Hydrate**: đọc state từ storage khi app khởi động
2. **Persist**: ghi state vào storage sau mỗi lần `set`

Mặc định dùng `localStorage`. Có thể tuỳ chỉnh:
- `storage`: thay bằng `sessionStorage`, AsyncStorage (React Native), IndexedDB
- `partialize`: chỉ lưu một phần state (bỏ qua sensitive data hoặc computed values)
- `version` + `migrate`: xử lý migration khi schema thay đổi

### Code minh hoạ

```ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AuthState {
  token: string | null
  user: { id: string; name: string } | null
  tempData: string // KHÔNG muốn persist cái này
  setToken: (token: string) => void
  logout: () => void
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      tempData: '',
      setToken: (token) => set({ token }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage', // key trong localStorage

      // Chỉ persist token và user, bỏ qua tempData và actions
      partialize: (state) => ({ token: state.token, user: state.user }),

      // Tuỳ chỉnh storage (ví dụ: sessionStorage)
      storage: createJSONStorage(() => sessionStorage),

      // Migration khi schema thay đổi
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 1) {
          // Migrate từ v1 sang v2
          const old = persistedState as { authToken: string }
          return { token: old.authToken, user: null }
        }
        return persistedState as AuthState
      },
    }
  )
)

export default useAuthStore
```

### Đáp án mẫu

> `persist` tự động hydrate state từ storage khi khởi động và sync lại sau mỗi update. Dùng `partialize` để chỉ lưu các field cần thiết (tránh lưu sensitive/transient data). Khi schema thay đổi, dùng `version` + `migrate` để handle backward compatibility.

---

## Câu 8: Cách chia nhỏ Zustand store thành nhiều slices? `[Advanced]`

### Câu hỏi

> Khi app phức tạp, làm thế nào để tổ chức Zustand store thành các slices tách biệt mà vẫn dùng chung một store?

### Giải thích lý thuyết

Zustand hỗ trợ **slice pattern**: tạo từng slice riêng rồi merge vào một store duy nhất.

Lợi ích:
- Mỗi domain (auth, cart, UI...) có file riêng
- Dễ test từng slice độc lập
- Vẫn là một store thống nhất, tránh re-render cross-slice không cần thiết

### Code minh hoạ

```ts
// store/slices/authSlice.ts
import { StateCreator } from 'zustand'
import { RootState } from '../useStore'

export interface AuthSlice {
  token: string | null
  setToken: (token: string) => void
  logout: () => void
}

export const createAuthSlice: StateCreator<
  RootState,
  [],
  [],
  AuthSlice
> = (set) => ({
  token: null,
  setToken: (token) => set({ token }),
  logout: () => set({ token: null }),
})
```

```ts
// store/slices/cartSlice.ts
import { StateCreator } from 'zustand'
import { RootState } from '../useStore'

export interface CartSlice {
  items: string[]
  addItem: (item: string) => void
  clearCart: () => void
}

export const createCartSlice: StateCreator<
  RootState,
  [],
  [],
  CartSlice
> = (set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  clearCart: () => set({ items: [] }),
})
```

```ts
// store/useStore.ts — merge tất cả slices
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { AuthSlice, createAuthSlice } from './slices/authSlice'
import { CartSlice, createCartSlice } from './slices/cartSlice'

export type RootState = AuthSlice & CartSlice

const useStore = create<RootState>()(
  devtools(
    (...args) => ({
      ...createAuthSlice(...args),
      ...createCartSlice(...args),
    }),
    { name: 'AppStore' }
  )
)

export default useStore
```

```tsx
// Sử dụng trong component
function CheckoutButton() {
  const token = useStore((state) => state.token)
  const items = useStore((state) => state.items)
  const clearCart = useStore((state) => state.clearCart)

  const handleCheckout = () => {
    if (!token) return
    // process...
    clearCart()
  }

  return <button onClick={handleCheckout}>Checkout ({items.length})</button>
}
```

### Đáp án mẫu

> Dùng `StateCreator` type để định nghĩa từng slice với generic `RootState`. Merge các slice bằng spread operator trong `create()`. Mỗi slice có file riêng nhưng chia sẻ cùng một store instance, giúp tổ chức code theo domain mà không cần nhiều store riêng biệt.

---

## Câu 9: Cách sử dụng Zustand với TypeScript để có type safety? `[Advanced]`

### Câu hỏi

> Hãy trình bày các kỹ thuật TypeScript nâng cao khi dùng Zustand: typed store, middleware typing, và generic store pattern.

### Giải thích lý thuyết

Zustand + TypeScript cần chú ý:

1. **Double currying pattern**: `create<State>()( ... )` — cần dấu ngoặc thứ hai khi dùng TypeScript để TypeScript suy luận đúng type
2. **Middleware typing**: mỗi middleware thêm type layer, cần khai báo đúng thứ tự
3. **`StateCreator` type**: dùng khi tách slice ra file riêng
4. **Readonly pattern**: ngăn mutation ngoài ý muốn

### Code minh hoạ

```ts
import { create, StateCreator } from 'zustand'
import { devtools, persist, DevtoolsOptions } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// 1. Định nghĩa interface rõ ràng, tách state và actions
interface TodoItem {
  readonly id: string
  readonly text: string
  readonly done: boolean
}

interface TodoState {
  readonly todos: ReadonlyArray<TodoItem>
}

interface TodoActions {
  addTodo: (text: string) => void
  toggleTodo: (id: string) => void
  removeTodo: (id: string) => void
}

type TodoStore = TodoState & TodoActions

// 2. Double currying với middleware — thứ tự type parameters quan trọng
const useTodoStore = create<TodoStore>()(
  devtools(
    immer<TodoStore>((set) => ({
      todos: [],

      // Với immer middleware: viết mutation-style nhưng vẫn immutable thực tế
      addTodo: (text) =>
        set((state) => {
          state.todos.push({ id: crypto.randomUUID(), text, done: false })
        }, false, 'todos/add'),

      toggleTodo: (id) =>
        set((state) => {
          const todo = state.todos.find((t) => t.id === id)
          if (todo) todo.done = !todo.done
        }, false, 'todos/toggle'),

      removeTodo: (id) =>
        set((state) => {
          state.todos = state.todos.filter((t) => t.id !== id)
        }, false, 'todos/remove'),
    })),
    { name: 'TodoStore' } satisfies DevtoolsOptions
  )
)

// 3. Typed selector helper để reuse
const selectDoneTodos = (state: TodoStore) => state.todos.filter((t) => t.done)
const selectPendingCount = (state: TodoStore) =>
  state.todos.filter((t) => !t.done).length

// 4. Sử dụng với type-safe selectors
function TodoStats() {
  const pendingCount = useTodoStore(selectPendingCount)
  const doneTodos = useTodoStore(selectDoneTodos)
  return <p>Còn {pendingCount} việc, đã xong {doneTodos.length}</p>
}
```

### Đáp án mẫu

> Dùng `create<State>()()` (double currying) để TypeScript suy luận đúng type qua middleware. Tách interface state và actions riêng biệt, dùng `ReadonlyArray` và `readonly` để ngăn mutation. Tạo typed selector functions bên ngoài component để reuse và dễ test.

---

## Câu 10: Khi nào nên chọn Zustand thay vì Redux Toolkit? `[Intermediate]`

### Câu hỏi

> Hãy phân tích các yếu tố quyết định khi lựa chọn giữa Zustand và Redux Toolkit cho một dự án React.

### Giải thích lý thuyết

Không có câu trả lời tuyệt đối — phụ thuộc vào context dự án:

| Yếu tố | Chọn Zustand | Chọn Redux Toolkit |
|---|---|---|
| Quy mô team | Small/solo (1-5 người) | Medium/Large (5+ người) |
| Độ phức tạp state | Trung bình, tập trung | Phức tạp, nhiều domain |
| Audit trail | Không cần | Cần log mọi state change |
| Time-travel debug | Ít dùng | Quan trọng |
| Async logic | Đơn giản | Phức tạp (saga, thunk nâng cao) |
| Learning curve | Muốn onboard nhanh | Team đã quen Redux |
| Server state | Kết hợp React Query | Kết hợp RTK Query |
| Bundle size | Ưu tiên nhỏ | Không phải ưu tiên hàng đầu |

### Code minh hoạ

```ts
// Zustand: phù hợp cho UI state đơn giản
const useModalStore = create<{ isOpen: boolean; toggle: () => void }>()((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))

// Zustand: phù hợp kết hợp với React Query cho server state
function UserProfile({ userId }: { userId: string }) {
  // Server state → React Query
  const { data: user } = useQuery({ queryKey: ['user', userId], queryFn: fetchUser })

  // Client state → Zustand
  const isEditing = useUIStore((state) => state.isEditing)
  const setEditing = useUIStore((state) => state.setEditing)

  return isEditing
    ? <EditForm user={user} onCancel={() => setEditing(false)} />
    : <UserCard user={user} onEdit={() => setEditing(true)} />
}
```

### Đáp án mẫu

> Chọn Zustand khi team nhỏ, cần prototype nhanh, state không quá phức tạp, hoặc kết hợp với React Query cho server state. Chọn Redux Toolkit khi cần audit trail rõ ràng, team lớn cần convention thống nhất, hoặc đã có ecosystem Redux (saga, RTK Query...).

---

## Câu 11: So sánh các thư viện: Redux Toolkit, Zustand, Context API, Jotai — khi nào dùng gì? `[Intermediate]`

### Câu hỏi

> Hãy so sánh toàn diện 4 giải pháp quản lý state phổ biến: Redux Toolkit, Zustand, Context API, và Jotai. Khi nào nên dùng từng cái?

### Giải thích lý thuyết

| Thư viện | Mô hình | Bundle | Re-render | Phù hợp |
|---|---|---|---|---|
| Context API | React built-in | 0KB | Toàn bộ consumer khi context thay đổi | State hiếm thay đổi, theme/locale |
| Zustand | Pub-sub store | ~1KB | Chỉ component dùng selector thay đổi | Client state vừa/lớn, đơn giản |
| Jotai | Atomic (bottom-up) | ~3KB | Chỉ component dùng atom thay đổi | State phân tán, fine-grained |
| Redux Toolkit | Flux/Event | ~13KB | Chỉ selector thay đổi | App lớn, nhiều team, cần audit |

**Context API** — khi nào dùng:
- Theme, locale, auth user (hiếm thay đổi)
- Không muốn thêm dependency
- Tránh dùng cho state thay đổi thường xuyên (gây re-render)

**Zustand** — khi nào dùng:
- Global state thường xuyên thay đổi
- Muốn đơn giản, ít boilerplate
- Kết hợp với React Query (server state)

**Jotai** — khi nào dùng:
- Nhiều state nhỏ, độc lập (atoms)
- Cần derived state (computed) mạnh
- React Suspense integration

**Redux Toolkit** — khi nào dùng:
- App enterprise, nhiều developer
- Cần strict conventions và DevTools mạnh
- RTK Query thay thế React Query

### Code minh hoạ

```tsx
// Context API: theme (hiếm thay đổi)
const ThemeContext = React.createContext<'light' | 'dark'>('light')

// Zustand: cart state (thay đổi thường)
const useCartStore = create<CartState>()((set) => ({
  items: [],
  addItem: (item) => set((s) => ({ items: [...s.items, item] })),
}))

// Jotai: atomic state (fine-grained)
import { atom, useAtom } from 'jotai'
const countAtom = atom(0)
const doubleCountAtom = atom((get) => get(countAtom) * 2) // derived

function Counter() {
  const [count, setCount] = useAtom(countAtom)
  const [double] = useAtom(doubleCountAtom)
  return <p>{count} × 2 = {double}</p>
}

// Redux Toolkit: complex domain state
const userSlice = createSlice({
  name: 'user',
  initialState: { list: [], loading: false },
  reducers: { /* ... */ },
  extraReducers: (builder) => { /* async thunks */ },
})
```

### Đáp án mẫu

> Không có thư viện "tốt nhất" tuyệt đối: Context API cho state tĩnh built-in; Zustand cho global state đơn giản với API minimal; Jotai cho state phân tán atomic; Redux Toolkit cho app lớn cần conventions chặt chẽ. Trong thực tế, có thể dùng kết hợp: React Query (server state) + Zustand (client state) là pattern phổ biến nhất hiện nay.

---
