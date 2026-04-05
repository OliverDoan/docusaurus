---
sidebar_position: 3
title: "Context vs Redux vs Zustand vs Jotai"
---

# Context vs Redux vs Zustand vs Jotai

State management là một trong những chủ đề được hỏi nhiều nhất trong phỏng vấn React. Không chỉ là "bạn dùng Redux hay Context", mà là **tại sao** chọn cái này thay vì cái kia, **performance implications** là gì, và **khi nào dùng cái gì** là hợp lý.

---

## Câu 1: React Context API -- khi nào dùng, khi nào không? Tại sao Context gây performance issues? `[Intermediate]`

### Giải thích lý thuyết

**Context API** cho phép truyền data xuống component tree mà không cần prop drilling. Nó gồm 2 phần: `createContext` + `Provider` (cung cấp data) và `useContext` (tiêu thụ data).

**Vấn đề lớn nhất**: khi Context value thay đổi, **TẤT CẢ** components dùng `useContext` đều re-render -- kể cả khi chúng chỉ dùng một phần nhỏ của value. Không có "selector" như Redux.

**Khi nào dùng Context?**
- Theme (light/dark) -- ít thay đổi
- Authentication state -- ít thay đổi
- Locale/language -- ít thay đổi
- Các giá trị ít thay đổi, nhiều component cần

**Khi nào KHÔNG dùng?**
- State thay đổi thường xuyên (form input, search, counters)
- State lớn với nhiều fields mà components chỉ cần 1-2 fields
- Khi performance là quan trọng

### Code ví dụ

```tsx
import { createContext, useContext, useState, useMemo } from 'react';

// --- VẤN ĐỀ: Tất cả consumers re-render ---
interface AppState {
  theme: string;
  user: { name: string } | null;
  notifications: number;
}

const AppContext = createContext<AppState | null>(null);

function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    theme: 'light',
    user: null,
    notifications: 0,
  });

  // Mỗi lần notifications tăng, ThemeButton CŨNG re-render
  // dù nó chỉ dùng theme
  return (
    <AppContext.Provider value={state}>
      {children}
    </AppContext.Provider>
  );
}

// --- GIẢI PHÁP 1: Tách Context ---
const ThemeContext = createContext('light');
const UserContext = createContext<{ name: string } | null>(null);

function SplitProviders({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState<{ name: string } | null>(null);

  return (
    <ThemeContext.Provider value={theme}>
      <UserContext.Provider value={user}>
        {children}
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
}

// --- GIẢI PHÁP 2: Memo hóa value ---
function OptimizedProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('light');
  const [count, setCount] = useState(0);

  // useMemo để tránh tạo object mới mỗi lần render
  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### Đáp án mẫu

> "Context tốt cho data ít thay đổi như theme, auth, locale. Vấn đề chính là không có selector -- khi value thay đổi, tất cả consumers re-render. Giải pháp: tách nhiều context nhỏ, useMemo cho value, hoặc chuyển sang state management library khi cần fine-grained subscriptions."

---

## Câu 2: Redux -- core concepts là gì? Redux Toolkit thay đổi gì? `[Intermediate]`

### Giải thích lý thuyết

**Redux** dựa trên 3 nguyên tắc:
1. **Single source of truth**: toàn bộ state nằm trong 1 store
2. **State is read-only**: chỉ thay đổi state qua dispatching actions
3. **Pure reducers**: reducers là pure functions (state cũ + action => state mới)

**Redux Toolkit (RTK)** là cách chuẩn để viết Redux hiện đại:
- `createSlice`: gom reducer + actions, cho phép "mutate" state (dùng Immer bên trong)
- `configureStore`: thay `createStore`, auto setup middleware
- `createAsyncThunk`: xử lý async logic
- RTK Query: data fetching và caching (thay React Query trong một số trường hợp)

### Code ví dụ

```tsx
// Redux Toolkit -- cách viết Redux hiện đại
import { createSlice, configureStore, createAsyncThunk } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';

// Async thunk
const fetchUsers = createAsyncThunk('users/fetch', async () => {
  const res = await fetch('/api/users');
  return res.json();
});

// Slice = reducer + actions
const usersSlice = createSlice({
  name: 'users',
  initialState: {
    list: [] as User[],
    loading: false,
    error: null as string | null,
  },
  reducers: {
    // Cú pháp "Mutation" -- Immer tạo immutable update bên trong
    addUser(state, action) {
      state.list.push(action.payload); // OK vì Immer
    },
    removeUser(state, action) {
      state.list = state.list.filter(u => u.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed';
      });
  },
});

// Store
const store = configureStore({
  reducer: { users: usersSlice.reducer },
});

type RootState = ReturnType<typeof store.getState>;

// Component -- selector chỉ re-render khi users.list thay đổi
function UserList() {
  const users = useSelector((state: RootState) => state.users.list);
  const loading = useSelector((state: RootState) => state.users.loading);
  const dispatch = useDispatch();

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <button onClick={() => dispatch(fetchUsers())}>Load Users</button>
      <ul>
        {users.map(u => (
          <li key={u.id}>{u.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Đáp án mẫu

> "Redux có single store, read-only state, và pure reducers. Redux Toolkit đơn giản hóa viết Redux với createSlice (dùng Immer cho immutable updates với syntax 'mutation'), configureStore (auto setup), và createAsyncThunk (async logic). useSelector cho phép fine-grained subscriptions -- chỉ re-render khi selected data thay đổi, khác với Context."

---

## Câu 3: Zustand -- đơn giản hơn Redux như thế nào? `[Intermediate]`

### Giải thích lý thuyết

**Zustand** là lightweight state management (< 1KB). Khác với Redux:
- Không cần Provider wrapper
- Không cần actions/reducers boilerplate
- API đơn giản: `create` store, dùng hook để access
- Có selector built-in (fine-grained re-renders)
- Có thể dùng ngoài React (vanilla JS)

Zustand phù hợp cho:
- Ứng dụng vừa và nhỏ
- Khi muốn ít boilerplate
- Khi cần shared state giữa components mà không muốn Redux overhead

### Code ví dụ

```tsx
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Định nghĩa store -- đơn giản, không cần Provider
interface TodoStore {
  todos: Todo[];
  filter: 'all' | 'active' | 'done';
  addTodo: (text: string) => void;
  toggleTodo: (id: number) => void;
  setFilter: (filter: 'all' | 'active' | 'done') => void;
}

const useTodoStore = create<TodoStore>()(
  devtools(
    persist(
      (set) => ({
        todos: [],
        filter: 'all',

        addTodo: (text) =>
          set(
            (state) => ({
              todos: [...state.todos, { id: Date.now(), text, done: false }],
            }),
            false,
            'addTodo' // action name cho devtools
          ),

        toggleTodo: (id) =>
          set(
            (state) => ({
              todos: state.todos.map((t) =>
                t.id === id ? { ...t, done: !t.done } : t
              ),
            }),
            false,
            'toggleTodo'
          ),

        setFilter: (filter) => set({ filter }),
      }),
      { name: 'todo-storage' } // persist to localStorage
    )
  )
);

// Component -- selector chỉ lấy những gì cần
function TodoList() {
  // Chỉ re-render khi todos thay đổi, không khi filter thay đổi
  const todos = useTodoStore((state) => state.todos);
  const toggleTodo = useTodoStore((state) => state.toggleTodo);

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id} onClick={() => toggleTodo(todo.id)}>
          {todo.done ? '✓' : '○'} {todo.text}
        </li>
      ))}
    </ul>
  );
}

function FilterBar() {
  // Chỉ re-render khi filter thay đổi
  const filter = useTodoStore((state) => state.filter);
  const setFilter = useTodoStore((state) => state.setFilter);

  return (
    <div>
      {(['all', 'active', 'done'] as const).map((f) => (
        <button
          key={f}
          onClick={() => setFilter(f)}
          style={{ fontWeight: filter === f ? 'bold' : 'normal' }}
        >
          {f}
        </button>
      ))}
    </div>
  );
}

// Dùng ngoài React
const currentTodos = useTodoStore.getState().todos;
useTodoStore.subscribe((state) => console.log('State changed:', state));
```

### Đáp án mẫu

> "Zustand là lightweight alternative cho Redux với API đơn giản -- không cần Provider, reducers, hay actions boilerplate. Nó có built-in selector để fine-grained re-renders, middleware ecosystem (devtools, persist, immer), và có thể dùng ngoài React. Phù hợp cho ứng dụng không cần full Redux ecosystem."

---

## Câu 4: Jotai -- atomic state model khác gì? `[Senior]`

### Giải thích lý thuyết

**Jotai** dùng **atomic model** -- mỗi piece of state là một "atom" độc lập. Khác với Redux (1 store lớn) hay Zustand (store functions):

- **Bottom-up**: tạo atoms nhỏ, compose thành state phức tạp
- **Không cần Provider** (từ Jotai v2)
- **Fine-grained**: component chỉ re-render khi atom nó subscribe thay đổi
- **Derived atoms**: tính toán từ các atoms khác (giống computed/selector)
- **Async atoms**: built-in async support

Jotai lấy cảm hứng từ Recoil (Meta) nhưng nhẹ hơn và đơn giản hơn.

### Code ví dụ

```tsx
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Atoms -- mỗi atom là 1 đơn vị state độc lập
const countAtom = atom(0);
const doubleCountAtom = atom((get) => get(countAtom) * 2); // derived (read-only)
const themeAtom = atomWithStorage('theme', 'light'); // persist to localStorage

// Async atom
const userAtom = atom(async () => {
  const res = await fetch('/api/user');
  return res.json();
});

// Writable derived atom
const incrementAtom = atom(
  null, // không có read
  (get, set) => {
    set(countAtom, get(countAtom) + 1);
  }
);

// Component -- chỉ re-render khi countAtom thay đổi
function Counter() {
  const [count, setCount] = useAtom(countAtom);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
    </div>
  );
}

// Component -- chỉ re-render khi doubleCount thay đổi
function DoubleDisplay() {
  const doubleCount = useAtomValue(doubleCountAtom); // read-only
  return <p>Double: {doubleCount}</p>;
}

// Component -- không re-render vì chỉ set, không read
function IncrementButton() {
  const increment = useSetAtom(incrementAtom); // write-only
  return <button onClick={increment}>Increment</button>;
}

// Async atom -- tự động Suspense
function UserProfile() {
  const user = useAtomValue(userAtom); // Suspense while loading
  return <p>{user.name}</p>;
}

// Wrap với Suspense
function App() {
  return (
    <React.Suspense fallback={<p>Loading user...</p>}>
      <UserProfile />
    </React.Suspense>
  );
}
```

### Đáp án mẫu

> "Jotai dùng atomic model -- mỗi atom là một đơn vị state độc lập, components chỉ re-render khi atom chúng subscribe thay đổi. Derived atoms cho computed values, async atoms tích hợp với Suspense. So với Redux, Jotai có ít boilerplate hơn và fine-grained re-renders tự nhiên. Phù hợp cho ứng dụng cần nhiều pieces of independent state."

---

## Câu 5: Khi nào dùng gì? So sánh chi tiết các giải pháp state management `[Senior]`

### Bảng so sánh chi tiết

| Tiêu chí | Context | Redux (RTK) | Zustand | Jotai |
|----------|---------|-------------|---------|-------|
| **Bundle size** | 0 (built-in) | ~11KB | ~1KB | ~3KB |
| **Boilerplate** | Ít | Trung bình (RTK giảm nhiều) | Rất ít | Rất ít |
| **Learning curve** | Thấp | Trung bình - Cao | Thấp | Thấp |
| **DevTools** | React DevTools | Redux DevTools (mạnh) | Redux DevTools (middleware) | Jotai DevTools |
| **Selector / Fine-grained** | Không có | useSelector | Built-in selector | Atomic (tự nhiên) |
| **Middleware** | Không | Phong phú (thunk, saga, RTK Query) | persist, devtools, immer | utils (storage, async) |
| **Server state** | Không | RTK Query | Không (dùng React Query) | Async atoms |
| **Dùng ngoài React** | Không | Có | Có | Không (React-first) |
| **TypeScript** | Tốt | Tốt | Tốt | Rất tốt |
| **Ecosystem** | React core | Lớn nhất | Đang lớn | Trung bình |

### Khi nào dùng gì?

| Tình huống | Chọn |
|------------|------|
| Theme, auth, locale (ít thay đổi) | **Context** |
| App lớn, nhiều team, cần predictability | **Redux Toolkit** |
| App vừa, muốn đơn giản, ít boilerplate | **Zustand** |
| Nhiều state độc lập, atomic mental model | **Jotai** |
| Server state (data fetching + caching) | **React Query / TanStack Query** |
| Form state | **React Hook Form / Formik** |

### Đáp án mẫu

> "Không có 'best' solution -- tùy vào yêu cầu. Context cho data ít thay đổi. Redux cho app lớn cần predictability và devtools mạnh. Zustand cho app muốn đơn giản mà vẫn có selector và middleware. Jotai cho atomic state với fine-grained re-renders. Và server state nên dùng React Query thay vì lưu trong client state."

---

## Câu 6: Server State -- React Query / TanStack Query giải quyết vấn đề gì? `[Intermediate]`

### Giải thích lý thuyết

**Server state** khác **client state**:
- Client state: UI state, form state -- bạn kiểm soát hoàn toàn
- Server state: data từ API -- có thể outdated, cần sync, có loading/error states

**Vấn đề** khi lưu server data trong Redux/Zustand:
- Phải tự viết loading, error, refetch logic
- Stale data (data cũ)
- Cache invalidation
- Deduplication (nhiều components fetch cùng data)
- Background refetching

**TanStack Query** giải quyết tất cả:
- Auto caching và deduplication
- Stale-while-revalidate strategy
- Background refetching
- Optimistic updates
- Infinite queries / pagination
- Prefetching

### Code ví dụ

```tsx
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

// Setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 phút trước khi data "stale"
      gcTime: 10 * 60 * 1000, // 10 phút giữ trong cache
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserList />
    </QueryClientProvider>
  );
}

// Fetch data với useQuery
function UserList() {
  const {
    data: users,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users'], // Cache key
    queryFn: async () => {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json() as Promise<User[]>;
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {users?.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}

// Mutation với optimistic update
function AddUserForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newUser: { name: string; email: string }) => {
      const res = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(newUser),
        headers: { 'Content-Type': 'application/json' },
      });
      return res.json();
    },
    // Optimistic update
    onMutate: async (newUser) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      const previous = queryClient.getQueryData(['users']);
      queryClient.setQueryData(['users'], (old: User[]) => [
        ...old,
        { ...newUser, id: Date.now() }, // temporary ID
      ]);
      return { previous };
    },
    onError: (_err, _newUser, context) => {
      // Rollback khi lỗi
      queryClient.setQueryData(['users'], context?.previous);
    },
    onSettled: () => {
      // Refetch để đảm bảo data đúng
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutation.mutate({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" required />
      <input name="email" placeholder="Email" required />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Adding...' : 'Add User'}
      </button>
    </form>
  );
}
```

### Đáp án mẫu

> "TanStack Query chuyên hóa cho server state management -- tự động caching, deduplication, background refetching, và stale-while-revalidate. Thay vì lưu server data trong Redux/Zustand và tự viết loading/error logic, dùng React Query để có out-of-the-box caching, optimistic updates, và cache invalidation. Client state (UI, forms) vẫn dùng Context/Zustand/Redux."

---

## Lỗi thường gặp khi trả lời

1. **Nói "Redux là over-engineering, dùng Context là đủ"** -- Sai khi app lớn. Context không có selector, gây re-render không cần thiết. Redux Toolkit đã giảm boilerplate đáng kể.

2. **Không phân biệt client state và server state** -- Đây là insight quan trọng. Server state cần caching, sync, refetch -- những thứ mà Redux không được thiết kế để làm.

3. **So sánh Redux với Zustand mà không nói về use case** -- Mỗi tool có use case riêng. Quan trọng là giải thích **khi nào** dùng cái nào, không phải cái nào "tốt hơn."

4. **Không biết Context gây re-render tất cả consumers** -- Đây là vấn đề performance số 1 của Context. Cần nói rõ và đề xuất giải pháp (tách context, useMemo).

5. **Nói "Jotai giống Recoil"** -- Giống về concept (atomic), nhưng Jotai nhẹ hơn, không cần Provider (v2+), và API khác. Cần nói rõ sự khác biệt.

6. **Lạm dụng Redux cho mọi state** -- Form state nên dùng React Hook Form, server state nên dùng React Query. Redux/Zustand cho shared client state.
