---
sidebar_position: 3
title: "3. Zustand"
---

# Zustand


---

## Mục lục

- [Zustand là gì?](#zustand-là-gì)
- [Tạo Store](#tạo-store)
- [Sử dụng trong Component](#sử-dụng-trong-component)
- [Ví dụ thực tế: Shopping Cart](#ví-dụ-thực-tế-shopping-cart)
- [Persist State (lưu vào localStorage)](#persist-state-lưu-vào-localstorage)
- [Middleware](#middleware)
- [Async Actions](#async-actions)
- [Truy cập store ngoài React](#truy-cập-store-ngoài-react)
- [Zustand vs Redux Toolkit](#zustand-vs-redux-toolkit)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

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

---

## Câu hỏi phỏng vấn

### Câu 1: Zustand khác Redux Toolkit ở điểm nào?
**Đáp án:**

Zustand và Redux Toolkit khác nhau ở **triết lý thiết kế** và **mức độ phức tạp**:

| Tiêu chí | Zustand | Redux Toolkit |
|---|---|---|
| Setup | Chỉ cần `create()` | Cần store, Provider, slice |
| Provider | **Không cần** wrap app | Bắt buộc `<Provider>` |
| Boilerplate | Cực ít | Trung bình (ít hơn Redux thuần) |
| Bundle size | ~1 KB | ~11 KB |
| DevTools | Opt-in middleware | Tích hợp sẵn |
| Async | Viết trực tiếp trong store | Cần `createAsyncThunk` |
| Data fetching | Không có built-in | RTK Query tích hợp |
| Middleware | persist, devtools, immer | Nhiều hơn, mạnh hơn |

```tsx
// Zustand — đơn giản, trực tiếp
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  fetchData: async () => {
    const data = await fetch('/api/data').then((r) => r.json());
    set({ data });
  },
}));

// Redux Toolkit — cấu trúc rõ ràng hơn, nhiều bước hơn
const slice = createSlice({
  name: 'counter',
  initialState: { count: 0 },
  reducers: {
    increment: (state) => { state.count += 1; },
  },
});
// + configureStore + Provider + typed hooks
```

**Chọn Zustand**: Dự án nhỏ-trung bình, cần nhanh, ít boilerplate.
**Chọn Redux Toolkit**: Dự án lớn, team đông, cần DevTools mạnh, RTK Query.

### Câu 2: Selector pattern trong Zustand tại sao quan trọng?
**Đáp án:**

Selector pattern quan trọng vì nó **kiểm soát re-render**. Zustand mặc định so sánh bằng `===` (strict equality). Nếu không dùng selector, component re-render khi **bất kỳ field nào** trong store thay đổi.

```tsx
// ❌ KHÔNG dùng selector — re-render khi BẤT KỲ state nào thay đổi
function Component() {
  const store = useStore(); // Subscribe toàn bộ store
  return <p>{store.count}</p>;
  // → Dù chỉ dùng count, nhưng nếu `name` thay đổi → vẫn re-render
}

// ✅ Dùng selector — chỉ re-render khi count thay đổi
function Component() {
  const count = useStore((state) => state.count);
  return <p>{count}</p>;
  // → name thay đổi → KHÔNG re-render
}

// ✅ Lấy nhiều fields — dùng shallow compare
import { useShallow } from 'zustand/react/shallow';

function Component() {
  const { count, name } = useStore(
    useShallow((state) => ({ count: state.count, name: state.name }))
  );
  // → Chỉ re-render khi count HOẶC name thay đổi
}

// ✅ Tách actions riêng — actions không bao giờ thay đổi reference
function Component() {
  const increment = useStore((state) => state.increment);
  // → Không bao giờ re-render vì function reference ổn định
}
```

Nguyên tắc: **Luôn dùng selector để lấy đúng phần state cần thiết**, tránh subscribe toàn bộ store.

### Câu 3: Zustand persist middleware dùng để làm gì?
**Đáp án:**

`persist` middleware tự động **lưu state vào storage** (localStorage, sessionStorage, AsyncStorage...) và **khôi phục** khi app reload. Rất hữu ích cho: giỏ hàng, theme preference, user settings, form draft.

```tsx
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsStore {
  theme: 'light' | 'dark';
  language: string;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (lang: string) => void;
}

const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'vi',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'settings-storage', // Key trong localStorage

      // Chỉ lưu một số fields (không lưu functions)
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
      }),

      // Tùy chọn storage (mặc định: localStorage)
      storage: createJSONStorage(() => sessionStorage),

      // Migration khi schema thay đổi
      version: 1,
      migrate: (persistedState, version) => {
        if (version === 0) {
          // Migrate từ version 0 → 1
          return { ...persistedState, language: 'vi' };
        }
        return persistedState;
      },
    }
  )
);

// User đổi theme → lưu vào localStorage
// Reload trang → theme tự động khôi phục
```

Lưu ý: Dùng `partialize` để **chỉ lưu data cần thiết**, tránh lưu functions hoặc derived state.

### Câu 4: Cách truy cập Zustand store ngoài React component?
**Đáp án:**

Zustand store hoạt động **độc lập với React**, nên có thể truy cập ở bất kỳ đâu trong app (utility functions, API interceptors, middleware, event handlers...):

```tsx
import { create } from 'zustand';

const useAuthStore = create((set) => ({
  token: null,
  user: null,
  setAuth: (token, user) => set({ token, user }),
  logout: () => set({ token: null, user: null }),
}));

// 1. ĐỌC state ngoài component
const token = useAuthStore.getState().token;

// 2. CẬP NHẬT state ngoài component
useAuthStore.getState().logout();
// hoặc
useAuthStore.setState({ token: 'new-token' });

// 3. SUBSCRIBE — lắng nghe thay đổi
const unsubscribe = useAuthStore.subscribe((state, prevState) => {
  if (state.token !== prevState.token) {
    console.log('Token changed:', state.token);
  }
});
// Hủy subscribe khi không cần
unsubscribe();

// Ví dụ thực tế: API interceptor
const apiClient = axios.create({ baseURL: '/api' });

apiClient.interceptors.request.use((config) => {
  // Đọc token từ store — không cần React hook
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Tự động logout khi token hết hạn
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
```

Đây là lợi thế lớn so với Redux, nơi bạn cần import `store` instance hoặc dùng middleware để truy cập state ngoài component.
