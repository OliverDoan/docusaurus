---
sidebar_position: 18
title: "Quản lý State"
---

# Quản lý State (State Management)

## Các loại state

| Loại | Ví dụ | Giải pháp |
|------|-------|-----------|
| **Local state** | Form input, toggle, modal | `useState`, `useReducer` |
| **Shared state** | Theme, auth, language | Context API |
| **Server state** | API data, cache | TanStack Query, SWR |
| **URL state** | Filters, pagination, search | React Router (`useSearchParams`) |
| **Global state** | Complex app state | Zustand, Redux Toolkit |

## Cây quyết định

```
Cần chia sẻ state giữa components?
├── Không → useState/useReducer (local)
└── Có
    ├── Chỉ 2-3 component gần nhau → Lifting state up
    └── Nhiều component xa nhau
        ├── Data từ server (API) → TanStack Query / SWR
        └── Client state
            ├── Ít thay đổi (theme, auth) → Context API
            └── Thay đổi thường xuyên, phức tạp → Zustand / Redux Toolkit
```

## 1. Lifting State Up

Đơn giản nhất — đưa state lên component cha chung gần nhất:

```tsx
function Parent() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div>
      <Sidebar items={items} onSelect={setSelectedId} />
      <Content selectedId={selectedId} />
    </div>
  );
}
```

## 2. Context API

Tốt cho state ít thay đổi, chia sẻ rộng (xem bài 12):

```tsx
// Phù hợp: theme, auth, locale
<ThemeProvider>
  <AuthProvider>
    <App />
  </AuthProvider>
</ThemeProvider>
```

## 3. TanStack Query (React Query)

Giải pháp tốt nhất cho **server state** — data fetching, caching, synchronization:

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch data
function UserList() {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then((r) => r.json()),
    staleTime: 5 * 60 * 1000, // Cache 5 phút
  });

  if (isLoading) return <Spinner />;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// Mutation (create, update, delete)
function CreateUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newUser: CreateUserDto) =>
      fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(newUser),
      }).then((r) => r.json()),
    onSuccess: () => {
      // Invalidate cache → refetch user list
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return (
    <button
      onClick={() => mutation.mutate({ name: 'New User' })}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? 'Creating...' : 'Create User'}
    </button>
  );
}
```

**TanStack Query cung cấp:**
- Caching tự động
- Refetch khi window focus lại
- Retry khi lỗi
- Pagination, infinite scroll
- Optimistic updates
- Request deduplication

## 4. Zustand

Lightweight state management — đơn giản, ít boilerplate:

```tsx
import { create } from 'zustand';

// Tạo store
interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: () => number;
}

const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) =>
    set((state) => ({ items: [...state.items, item] })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),

  clearCart: () => set({ items: [] }),

  total: () =>
    get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
}));

// Sử dụng trong component — chỉ re-render khi slice thay đổi
function CartIcon() {
  const itemCount = useCartStore((state) => state.items.length);
  return <span>Cart ({itemCount})</span>;
}

function CartTotal() {
  const total = useCartStore((state) => state.total());
  return <p>Total: ${total}</p>;
}

function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  return <button onClick={() => addItem(product)}>Add to Cart</button>;
}
```

**Tại sao Zustand:**
- Không cần Provider wrapper
- API đơn giản, ít boilerplate
- Selector tự động → ít re-render thừa
- TypeScript support tốt
- Nhỏ gọn (~1KB)

## 5. Redux Toolkit (cho ứng dụng lớn)

```tsx
import { configureStore, createSlice } from '@reduxjs/toolkit';

// Slice
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1; }, // Immer handles immutability
    decrement: (state) => { state.value -= 1; },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    },
  },
});

// Store
const store = configureStore({
  reducer: { counter: counterSlice.reducer },
});

// Component
import { useSelector, useDispatch } from 'react-redux';

function Counter() {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <button onClick={() => dispatch(counterSlice.actions.increment())}>
      Count: {count}
    </button>
  );
}
```

## So sánh

| | Context | Zustand | Redux Toolkit | TanStack Query |
|---|---|---|---|---|
| Boilerplate | Thấp | Rất thấp | Trung bình | Thấp |
| Performance | Re-render toàn bộ consumer | Selector-based | Selector-based | Smart cache |
| DevTools | ❌ | ✅ | ✅ | ✅ |
| Dùng cho | Theme, auth | Client state | App state phức tạp | Server state |
| Learning curve | Dễ | Dễ | Trung bình | Trung bình |
