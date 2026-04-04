---
sidebar_position: 1
title: "Redux Toolkit"
---

# Redux Toolkit

## Redux Toolkit là gì?

Redux Toolkit (RTK) là cách chính thức, đơn giản hóa để viết Redux. Giảm boilerplate so với Redux thuần.

```bash
npm install @reduxjs/toolkit react-redux
```

## Khái niệm cốt lõi

```
UI → dispatch(action) → Reducer → Store (new state) → UI re-render
```

- **Store**: Nơi lưu toàn bộ state
- **Action**: Object mô tả "chuyện gì đã xảy ra" `{ type: 'counter/increment' }`
- **Reducer**: Pure function nhận (state, action) → trả về state mới
- **Dispatch**: Gửi action đến store
- **Selector**: Function lấy data từ store

## createSlice

Tạo reducer + actions trong một lần:

```tsx
// features/counter/counterSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CounterState {
  value: number;
}

const initialState: CounterState = { value: 0 };

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1; // Immer cho phép "mutate" — thực tế tạo object mới
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
    reset: () => initialState,
  },
});

// Export actions (auto-generated)
export const { increment, decrement, incrementByAmount, reset } = counterSlice.actions;

// Export reducer
export default counterSlice.reducer;
```

## configureStore

```tsx
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import todosReducer from '../features/todos/todosSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    todos: todosReducer,
  },
});

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Provider

```tsx
// main.tsx
import { Provider } from 'react-redux';
import { store } from './store';

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <App />
  </Provider>
);
```

## useSelector & useDispatch

```tsx
// Typed hooks (tạo một lần, dùng mọi nơi)
// store/hooks.ts
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

```tsx
// Component
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { increment, decrement, incrementByAmount } from './counterSlice';

function Counter() {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => dispatch(increment())}>+1</button>
      <button onClick={() => dispatch(decrement())}>-1</button>
      <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
    </div>
  );
}
```

## Ví dụ thực tế: Todo Slice

```tsx
// features/todos/todosSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Todo {
  id: string;
  text: string;
  done: boolean;
}

interface TodosState {
  items: Todo[];
  filter: 'all' | 'active' | 'completed';
}

const initialState: TodosState = {
  items: [],
  filter: 'all',
};

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    addTodo: (state, action: PayloadAction<string>) => {
      state.items.push({
        id: crypto.randomUUID(),
        text: action.payload,
        done: false,
      });
    },
    toggleTodo: (state, action: PayloadAction<string>) => {
      const todo = state.items.find((t) => t.id === action.payload);
      if (todo) todo.done = !todo.done;
    },
    deleteTodo: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
    setFilter: (state, action: PayloadAction<TodosState['filter']>) => {
      state.filter = action.payload;
    },
  },
});

export const { addTodo, toggleTodo, deleteTodo, setFilter } = todosSlice.actions;

// Selectors
export const selectFilteredTodos = (state: RootState) => {
  const { items, filter } = state.todos;
  switch (filter) {
    case 'active': return items.filter((t) => !t.done);
    case 'completed': return items.filter((t) => t.done);
    default: return items;
  }
};

export default todosSlice.reducer;
```

## createAsyncThunk

Xử lý async operations (API calls):

```tsx
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Async thunk
export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed');
      return await response.json();
    } catch (error) {
      return rejectWithValue('Failed to fetch users');
    }
  }
);

interface UsersState {
  items: User[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const usersSlice = createSlice({
  name: 'users',
  initialState: { items: [], status: 'idle', error: null } as UsersState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});
```

```tsx
// Component
function UserList() {
  const dispatch = useAppDispatch();
  const { items: users, status, error } = useAppSelector((state) => state.users);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchUsers());
    }
  }, [status, dispatch]);

  if (status === 'loading') return <Spinner />;
  if (status === 'failed') return <p>Error: {error}</p>;

  return (
    <ul>
      {users.map((user) => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}
```

## Redux DevTools

Redux DevTools Extension tự động hoạt động với `configureStore`:

- Xem state tree
- Time-travel debugging (quay lại trạng thái trước)
- Xem lịch sử actions
- Diff giữa các states

Cài extension: [Chrome](https://chrome.google.com/webstore/detail/redux-devtools) / [Firefox](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

## Cấu trúc thư mục

```
src/
├── store/
│   ├── index.ts          # configureStore
│   └── hooks.ts          # Typed hooks
├── features/
│   ├── counter/
│   │   └── counterSlice.ts
│   ├── todos/
│   │   └── todosSlice.ts
│   └── users/
│       └── usersSlice.ts
```

---

## Câu hỏi phỏng vấn

### Câu 1: Redux data flow: action → reducer → store hoạt động thế nào?
**Đáp án:**

Redux tuân theo **one-way data flow** (luồng dữ liệu một chiều):

1. **UI dispatch action**: Khi user tương tác (click button), component gọi `dispatch(action)`
2. **Reducer xử lý**: Store chuyển action đến reducer. Reducer là pure function nhận `(currentState, action)` và trả về **state mới** (không mutate state cũ)
3. **Store cập nhật**: Store lưu state mới từ reducer trả về
4. **UI re-render**: Các component đang subscribe (qua `useSelector`) nhận state mới và re-render

```tsx
// 1. Component dispatch action
dispatch(increment()); // { type: 'counter/increment' }

// 2. Reducer nhận và xử lý
function counterReducer(state = { value: 0 }, action) {
  switch (action.type) {
    case 'counter/increment':
      return { value: state.value + 1 }; // Trả về state MỚI
    default:
      return state;
  }
}

// 3. Store tự cập nhật state
// 4. useSelector tự detect thay đổi → component re-render
const count = useSelector((state) => state.counter.value);
```

Điểm quan trọng: State chỉ thay đổi qua dispatch action, không bao giờ mutate trực tiếp. Điều này giúp **dễ debug** (time-travel debugging) và **predictable**.

### Câu 2: createSlice của RTK khác gì Redux thuần?
**Đáp án:**

`createSlice` giải quyết 3 vấn đề lớn của Redux thuần:

| Redux thuần | Redux Toolkit (createSlice) |
|---|---|
| Tự viết action types (string constants) | Auto-generate action types từ tên slice + reducer |
| Tự viết action creators | Auto-generate action creators |
| Phải dùng spread operator để tạo state mới | Dùng Immer, viết code "mutate" nhưng vẫn immutable |

```tsx
// ❌ Redux thuần — rất nhiều boilerplate
const INCREMENT = 'counter/increment';
const increment = () => ({ type: INCREMENT });

function counterReducer(state = { value: 0 }, action) {
  switch (action.type) {
    case INCREMENT:
      return { ...state, value: state.value + 1 };
    default:
      return state;
  }
}

// ✅ Redux Toolkit — gọn gàng
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1; // Immer xử lý immutability
    },
  },
});

export const { increment } = counterSlice.actions; // Auto-generated
export default counterSlice.reducer;
```

Ngoài ra, `createSlice` còn hỗ trợ `extraReducers` để xử lý actions từ `createAsyncThunk` hoặc từ slice khác.

### Câu 3: Tại sao Immer cho phép "mutate" state trong slice mà vẫn immutable?
**Đáp án:**

Immer hoạt động dựa trên **Proxy pattern**:

1. Khi reducer chạy, Immer tạo một **draft** (bản nháp) của state hiện tại bằng `Proxy`
2. Mọi thao tác "mutate" (như `state.value += 1`) thực chất đang thay đổi **draft**, không phải state gốc
3. Sau khi reducer hoàn thành, Immer so sánh draft với state gốc và tạo ra **object mới** chỉ chứa phần thay đổi
4. State gốc **không bao giờ bị thay đổi**

```tsx
const todosSlice = createSlice({
  name: 'todos',
  initialState: { items: [] },
  reducers: {
    addTodo: (state, action) => {
      // Trông như mutate, nhưng Immer tạo object mới bên dưới
      state.items.push(action.payload);
      // Tương đương immutable:
      // return { ...state, items: [...state.items, action.payload] };
    },
    toggleTodo: (state, action) => {
      const todo = state.items.find((t) => t.id === action.payload);
      if (todo) todo.done = !todo.done;
      // Không cần nested spread: { ...state, items: state.items.map(...) }
    },
  },
});
```

Lợi ích: Code **dễ đọc hơn** rất nhiều, đặc biệt với nested objects. Không cần spread operator nhiều tầng.

### Câu 4: createAsyncThunk dùng khi nào?
**Đáp án:**

`createAsyncThunk` dùng khi cần xử lý **async operations** (API calls, đọc file, timer...) và muốn Redux tự quản lý lifecycle (pending, fulfilled, rejected).

Dùng khi:
- Gọi API để fetch/create/update/delete data
- Cần track loading state, error state tự động
- Cần cancel request hoặc xử lý race conditions

```tsx
// Tạo async thunk
export const fetchUsers = createAsyncThunk(
  'users/fetchAll', // action type prefix
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed');
      return await response.json(); // → fulfilled payload
    } catch (error) {
      return rejectWithValue('Không thể tải users'); // → rejected payload
    }
  }
);

// Xử lý 3 trạng thái trong slice
extraReducers: (builder) => {
  builder
    .addCase(fetchUsers.pending, (state) => {
      state.status = 'loading';  // Tự dispatch khi bắt đầu
    })
    .addCase(fetchUsers.fulfilled, (state, action) => {
      state.status = 'succeeded'; // Tự dispatch khi thành công
      state.items = action.payload;
    })
    .addCase(fetchUsers.rejected, (state, action) => {
      state.status = 'failed';    // Tự dispatch khi lỗi
      state.error = action.payload as string;
    });
}
```

Lưu ý: Nếu dự án cần data fetching/caching phức tạp, nên dùng **RTK Query** thay vì tự viết `createAsyncThunk`.

### Câu 5: useSelector selector function có vai trò gì?
**Đáp án:**

Selector function trong `useSelector` có 2 vai trò chính:

**1. Trích xuất data** từ store (chỉ lấy phần cần thiết):

```tsx
// Lấy đúng phần state cần dùng
const count = useSelector((state: RootState) => state.counter.value);
const users = useSelector((state: RootState) => state.users.items);
```

**2. Tối ưu re-render** — Component chỉ re-render khi giá trị selector trả về thay đổi:

```tsx
// ✅ Chỉ re-render khi counter.value thay đổi
const count = useSelector((state: RootState) => state.counter.value);

// ❌ Re-render khi BẤT KỲ state nào thay đổi (tạo object mới mỗi lần)
const { value, status } = useSelector((state: RootState) => ({
  value: state.counter.value,
  status: state.users.status,
}));
```

**Derived data** — Tính toán dữ liệu từ state (nên dùng `createSelector` để memoize):

```tsx
import { createSelector } from '@reduxjs/toolkit';

// Memoized selector — chỉ tính lại khi items hoặc filter thay đổi
const selectFilteredTodos = createSelector(
  [(state: RootState) => state.todos.items, (state: RootState) => state.todos.filter],
  (items, filter) => {
    switch (filter) {
      case 'active': return items.filter((t) => !t.done);
      case 'completed': return items.filter((t) => t.done);
      default: return items;
    }
  }
);

// Component dùng memoized selector
const filteredTodos = useSelector(selectFilteredTodos);
```

Best practice: Luôn dùng **typed hooks** (`useAppSelector`) và **tách selector ra file riêng** để tái sử dụng.
