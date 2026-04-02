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
