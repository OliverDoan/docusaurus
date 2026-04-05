---
sidebar_position: 3
title: "Context vs Redux vs Zustand vs Jotai"
---

# Context vs Redux vs Zustand vs Jotai

State management la mot trong nhung chu de duoc hoi nhieu nhat trong phong van React. Khong chi la "ban dung Redux hay Context", ma la **tai sao** chon cai nay thay vi cai kia, **performance implications** la gi, va **khi nao dung cai gi** la hop ly.

---

## Cau 1: React Context API -- khi nao dung, khi nao khong? Tai sao Context gay performance issues? `[Intermediate]`

### Giai thich ly thuyet

**Context API** cho phep truyen data xuong component tree ma khong can prop drilling. No gom 2 phan: `createContext` + `Provider` (cung cap data) va `useContext` (tieu thu data).

**Van de lon nhat**: khi Context value thay doi, **TAT CA** components dung `useContext` deu re-render -- ke ca khi chung chi dung mot phan nho cua value. Khong co "selector" nhu Redux.

**Khi nao dung Context?**
- Theme (light/dark) -- it thay doi
- Authentication state -- it thay doi
- Locale/language -- it thay doi
- Cac gia tri it thay doi, nhieu component can

**Khi nao KHONG dung?**
- State thay doi thuong xuyen (form input, search, counters)
- State lon voi nhieu fields ma components chi can 1-2 fields
- Khi performance la quan trong

### Code vi du

```tsx
import { createContext, useContext, useState, useMemo } from 'react';

// --- VAN DE: Tat ca consumers re-render ---
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

  // Moi lan notifications tang, ThemeButton CUNG re-render
  // du no chi dung theme
  return (
    <AppContext.Provider value={state}>
      {children}
    </AppContext.Provider>
  );
}

// --- GIAI PHAP 1: Tach Context ---
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

// --- GIAI PHAP 2: Memo hoa value ---
function OptimizedProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('light');
  const [count, setCount] = useState(0);

  // useMemo de tranh tao object moi moi lan render
  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### Dap an mau

> "Context tot cho data it thay doi nhu theme, auth, locale. Van de chinh la khong co selector -- khi value thay doi, tat ca consumers re-render. Giai phap: tach nhieu context nho, useMemo cho value, hoac chuyen sang state management library khi can fine-grained subscriptions."

---

## Cau 2: Redux -- core concepts la gi? Redux Toolkit thay doi gi? `[Intermediate]`

### Giai thich ly thuyet

**Redux** dua tren 3 nguyen tac:
1. **Single source of truth**: toan bo state nam trong 1 store
2. **State is read-only**: chi thay doi state qua dispatching actions
3. **Pure reducers**: reducers la pure functions (state cu + action => state moi)

**Redux Toolkit (RTK)** la cach chuan de viet Redux hien dai:
- `createSlice`: gom reducer + actions, cho phep "mutate" state (dung Immer ben trong)
- `configureStore`: thay `createStore`, auto setup middleware
- `createAsyncThunk`: xu ly async logic
- RTK Query: data fetching va caching (thay React Query trong mot so truong hop)

### Code vi du

```tsx
// Redux Toolkit -- cach viet Redux hien dai
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
    // "Mutation" syntax -- Immer tao immutable update ben trong
    addUser(state, action) {
      state.list.push(action.payload); // OK vi Immer
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

// Component -- selector chi re-render khi users.list thay doi
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

### Dap an mau

> "Redux co single store, read-only state, va pure reducers. Redux Toolkit don gian hoa viet Redux voi createSlice (dung Immer cho immutable updates voi syntax 'mutation'), configureStore (auto setup), va createAsyncThunk (async logic). useSelector cho phep fine-grained subscriptions -- chi re-render khi selected data thay doi, khac voi Context."

---

## Cau 3: Zustand -- don gian hon Redux nhu the nao? `[Intermediate]`

### Giai thich ly thuyet

**Zustand** la lightweight state management (< 1KB). Khac voi Redux:
- Khong can Provider wrapper
- Khong can actions/reducers boilerplate
- API don gian: `create` store, dung hook de access
- Co selector built-in (fine-grained re-renders)
- Co the dung ngoai React (vanilla JS)

Zustand phu hop cho:
- Ung dung vua va nho
- Khi muon it boilerplate
- Khi can shared state giua components ma khong muon Redux overhead

### Code vi du

```tsx
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Dinh nghia store -- don gian, khong can Provider
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

// Component -- selector chi lay nhung gi can
function TodoList() {
  // Chi re-render khi todos thay doi, khong khi filter thay doi
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
  // Chi re-render khi filter thay doi
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

// Dung ngoai React
const currentTodos = useTodoStore.getState().todos;
useTodoStore.subscribe((state) => console.log('State changed:', state));
```

### Dap an mau

> "Zustand la lightweight alternative cho Redux voi API don gian -- khong can Provider, reducers, hay actions boilerplate. No co built-in selector de fine-grained re-renders, middleware ecosystem (devtools, persist, immer), va co the dung ngoai React. Phu hop cho ung dung khong can full Redux ecosystem."

---

## Cau 4: Jotai -- atomic state model khac gi? `[Senior]`

### Giai thich ly thuyet

**Jotai** dung **atomic model** -- moi piece of state la mot "atom" doc lap. Khac voi Redux (1 store lon) hay Zustand (store functions):

- **Bottom-up**: tao atoms nho, compose thanh state phuc tap
- **Khong can Provider** (tu Jotai v2)
- **Fine-grained**: component chi re-render khi atom no subscribe thay doi
- **Derived atoms**: tinh toan tu cac atoms khac (giong computed/selector)
- **Async atoms**: built-in async support

Jotai lay cam hung tu Recoil (Meta) nhung nhe hon va don gian hon.

### Code vi du

```tsx
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Atoms -- moi atom la 1 don vi state doc lap
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
  null, // khong co read
  (get, set) => {
    set(countAtom, get(countAtom) + 1);
  }
);

// Component -- chi re-render khi countAtom thay doi
function Counter() {
  const [count, setCount] = useAtom(countAtom);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
    </div>
  );
}

// Component -- chi re-render khi doubleCount thay doi
function DoubleDisplay() {
  const doubleCount = useAtomValue(doubleCountAtom); // read-only
  return <p>Double: {doubleCount}</p>;
}

// Component -- khong re-render vi chi set, khong read
function IncrementButton() {
  const increment = useSetAtom(incrementAtom); // write-only
  return <button onClick={increment}>Increment</button>;
}

// Async atom -- tu dong Suspense
function UserProfile() {
  const user = useAtomValue(userAtom); // Suspense while loading
  return <p>{user.name}</p>;
}

// Wrap voi Suspense
function App() {
  return (
    <React.Suspense fallback={<p>Loading user...</p>}>
      <UserProfile />
    </React.Suspense>
  );
}
```

### Dap an mau

> "Jotai dung atomic model -- moi atom la mot don vi state doc lap, components chi re-render khi atom chung subscribe thay doi. Derived atoms cho computed values, async atoms tich hop voi Suspense. So voi Redux, Jotai co it boilerplate hon va fine-grained re-renders tu nhien. Phu hop cho ung dung can nhieu pieces of independent state."

---

## Cau 5: Khi nao dung gi? So sanh chi tiet cac giai phap state management `[Senior]`

### Bang so sanh chi tiet

| Tieu chi | Context | Redux (RTK) | Zustand | Jotai |
|----------|---------|-------------|---------|-------|
| **Bundle size** | 0 (built-in) | ~11KB | ~1KB | ~3KB |
| **Boilerplate** | It | Trung binh (RTK giam nhieu) | Rat it | Rat it |
| **Learning curve** | Thap | Trung binh - Cao | Thap | Thap |
| **DevTools** | React DevTools | Redux DevTools (manh) | Redux DevTools (middleware) | Jotai DevTools |
| **Selector / Fine-grained** | Khong co | useSelector | Built-in selector | Atomic (tu nhien) |
| **Middleware** | Khong | Phong phu (thunk, saga, RTK Query) | persist, devtools, immer | utils (storage, async) |
| **Server state** | Khong | RTK Query | Khong (dung React Query) | Async atoms |
| **Dung ngoai React** | Khong | Co | Co | Khong (React-first) |
| **TypeScript** | Tot | Tot | Tot | Rat tot |
| **Ecosystem** | React core | Lon nhat | Dang lon | Trung binh |

### Khi nao dung gi?

| Tinh huong | Chon |
|------------|------|
| Theme, auth, locale (it thay doi) | **Context** |
| App lon, nhieu team, can predictability | **Redux Toolkit** |
| App vua, muon don gian, it boilerplate | **Zustand** |
| Nhieu state doc lap, atomic mental model | **Jotai** |
| Server state (data fetching + caching) | **React Query / TanStack Query** |
| Form state | **React Hook Form / Formik** |

### Dap an mau

> "Khong co 'best' solution -- tuy vao yeu cau. Context cho data it thay doi. Redux cho app lon can predictability va devtools manh. Zustand cho app muon don gian ma van co selector va middleware. Jotai cho atomic state voi fine-grained re-renders. Va server state nen dung React Query thay vi luu trong client state."

---

## Cau 6: Server State -- React Query / TanStack Query giai quyet van de gi? `[Intermediate]`

### Giai thich ly thuyet

**Server state** khac **client state**:
- Client state: UI state, form state -- ban kiem soat hoan toan
- Server state: data tu API -- co the outdated, can sync, co loading/error states

**Van de** khi luu server data trong Redux/Zustand:
- Phai tu viet loading, error, refetch logic
- Stale data (data cu)
- Cache invalidation
- Deduplication (nhieu components fetch cung data)
- Background refetching

**TanStack Query** giai quyet tat ca:
- Auto caching va deduplication
- Stale-while-revalidate strategy
- Background refetching
- Optimistic updates
- Infinite queries / pagination
- Prefetching

### Code vi du

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
      staleTime: 5 * 60 * 1000, // 5 phut truoc khi data "stale"
      gcTime: 10 * 60 * 1000, // 10 phut giu trong cache
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

// Fetch data voi useQuery
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

// Mutation voi optimistic update
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
      // Rollback khi loi
      queryClient.setQueryData(['users'], context?.previous);
    },
    onSettled: () => {
      // Refetch de dam bao data dung
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

### Dap an mau

> "TanStack Query chuyen hoa cho server state management -- tu dong caching, deduplication, background refetching, va stale-while-revalidate. Thay vi luu server data trong Redux/Zustand va tu viet loading/error logic, dung React Query de co out-of-the-box caching, optimistic updates, va cache invalidation. Client state (UI, forms) van dung Context/Zustand/Redux."

---

## Loi thuong gap khi tra loi

1. **Noi "Redux la over-engineering, dung Context la du"** -- Sai khi app lon. Context khong co selector, gay re-render khong can thiet. Redux Toolkit da giam boilerplate dang ke.

2. **Khong phan biet client state va server state** -- Day la insight quan trong. Server state can caching, sync, refetch -- nhung thu ma Redux khong duoc thiet ke de lam.

3. **So sanh Redux voi Zustand ma khong noi ve use case** -- Moi tool co use case rieng. Quan trong la giai thich **khi nao** dung cai nao, khong phai cai nao "tot hon."

4. **Khong biet Context gay re-render tat ca consumers** -- Day la van de performance so 1 cua Context. Can noi ro va de xuat giai phap (tach context, useMemo).

5. **Noi "Jotai giong Recoil"** -- Giong ve concept (atomic), nhung Jotai nhe hon, khong can Provider (v2+), va API khac. Can noi ro su khac biet.

6. **Lam dung Redux cho moi state** -- Form state nen dung React Hook Form, server state nen dung React Query. Redux/Zustand cho shared client state.
