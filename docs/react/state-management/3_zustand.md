---
sidebar_position: 3
title: "Zustand"
---

# Zustand

## Zustand là gì?

Zustand là thư viện state management siêu nhẹ (~1KB). Không cần Provider, không cần boilerplate, API đơn giản.

```bash
npm install zustand
```

## Tạo Store

```tsx
import { create } from 'zustand';

interface CounterStore {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

const useCounterStore = create<CounterStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
```

## Sử dụng trong Component

```tsx
function Counter() {
  // Chỉ subscribe vào count → chỉ re-render khi count thay đổi
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);

  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>+</button>
    </div>
  );
}
```

### Selector pattern

```tsx
// ✅ Lấy từng field → re-render tối thiểu
const count = useCounterStore((state) => state.count);
const increment = useCounterStore((state) => state.increment);

// ⚠️ Lấy toàn bộ store → re-render khi BẤT KỲ field nào thay đổi
const store = useCounterStore(); // Tránh dùng
```

## Ví dụ thực tế: Shopping Cart

```tsx
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (product) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...product, quantity: 1 }] };
    }),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),

  updateQuantity: (id, quantity) =>
    set((state) => ({
      items: quantity <= 0
        ? state.items.filter((i) => i.id !== id)
        : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
    })),

  clearCart: () => set({ items: [] }),

  // Computed values dùng get()
  get total() {
    return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  },

  get itemCount() {
    return get().items.reduce((sum, i) => sum + i.quantity, 0);
  },
}));

// Components
function CartIcon() {
  const itemCount = useCartStore((state) => state.itemCount);
  return <span>Cart ({itemCount})</span>;
}

function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  return <button onClick={() => addItem(product)}>Add to Cart</button>;
}
```

## Persist State (lưu vào localStorage)

```tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => set(/* ... */),
      // ... other actions
    }),
    {
      name: 'cart-storage', // Key trong localStorage
      // Chỉ lưu một số fields
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// Cart items tự động khôi phục khi reload trang!
```

## Middleware

### devtools — Redux DevTools

```tsx
import { devtools } from 'zustand/middleware';

const useStore = create<MyStore>()(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 }), false, 'increment'),
    }),
    { name: 'MyStore' }
  )
);
```

### Kết hợp nhiều middleware

```tsx
const useStore = create<MyStore>()(
  devtools(
    persist(
      (set) => ({
        // ... store definition
      }),
      { name: 'my-storage' }
    ),
    { name: 'MyStore' }
  )
);
```

## Async Actions

```tsx
interface UserStore {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
}

const useUserStore = create<UserStore>((set) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      set({ users: data, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false,
      });
    }
  },
}));

// Component
function UserList() {
  const { users, loading, fetchUsers } = useUserStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (loading) return <Spinner />;
  return <ul>{users.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

## Truy cập store ngoài React

```tsx
// Đọc state ngoài component
const count = useCounterStore.getState().count;

// Cập nhật state ngoài component
useCounterStore.setState({ count: 10 });

// Subscribe (lắng nghe thay đổi)
const unsubscribe = useCounterStore.subscribe((state) => {
  console.log('State changed:', state.count);
});
```

## Zustand vs Redux Toolkit

| | Zustand | Redux Toolkit |
|---|---|---|
| Bundle size | ~1 KB | ~11 KB |
| Boilerplate | Rất ít | Trung bình |
| Provider | Không cần | Cần `<Provider>` |
| DevTools | Middleware | Tích hợp sẵn |
| Async | Viết trực tiếp | createAsyncThunk |
| Middleware | persist, devtools | Nhiều hơn (RTK Query) |
| Dùng khi | Dự án nhỏ-trung bình | Dự án lớn, team đông |
