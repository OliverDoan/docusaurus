---
sidebar_position: 2
title: "useReducer"
---

# useReducer

## useReducer là gì?

`useReducer` là alternative cho `useState` khi state logic phức tạp — nhiều sub-values hoặc state tiếp theo phụ thuộc vào state trước đó. Lấy cảm hứng từ Redux pattern.

```tsx
const [state, dispatch] = useReducer(reducer, initialState);
```

## Ví dụ cơ bản: Counter

```tsx
// 1. Định nghĩa types
type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset' }
  | { type: 'set'; payload: number };

interface State {
  count: number;
}

// 2. Reducer function — PURE, không side effects
function counterReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: 0 };
    case 'set':
      return { count: action.payload };
    default:
      return state;
  }
}

// 3. Sử dụng trong component
function Counter() {
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
      <button onClick={() => dispatch({ type: 'set', payload: 100 })}>
        Set to 100
      </button>
    </div>
  );
}
```

## Ví dụ thực tế: Todo App

```tsx
interface Todo {
  id: string;
  text: string;
  done: boolean;
}

type TodoAction =
  | { type: 'add'; payload: string }
  | { type: 'toggle'; payload: string }
  | { type: 'delete'; payload: string }
  | { type: 'edit'; payload: { id: string; text: string } }
  | { type: 'clear_completed' };

function todoReducer(state: Todo[], action: TodoAction): Todo[] {
  switch (action.type) {
    case 'add':
      return [
        ...state,
        { id: crypto.randomUUID(), text: action.payload, done: false },
      ];
    case 'toggle':
      return state.map((todo) =>
        todo.id === action.payload
          ? { ...todo, done: !todo.done }
          : todo
      );
    case 'delete':
      return state.filter((todo) => todo.id !== action.payload);
    case 'edit':
      return state.map((todo) =>
        todo.id === action.payload.id
          ? { ...todo, text: action.payload.text }
          : todo
      );
    case 'clear_completed':
      return state.filter((todo) => !todo.done);
    default:
      return state;
  }
}

function TodoApp() {
  const [todos, dispatch] = useReducer(todoReducer, []);
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (input.trim()) {
      dispatch({ type: 'add', payload: input.trim() });
      setInput('');
    }
  };

  return (
    <div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={handleAdd}>Add</button>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <span
              style={{ textDecoration: todo.done ? 'line-through' : 'none' }}
              onClick={() => dispatch({ type: 'toggle', payload: todo.id })}
            >
              {todo.text}
            </span>
            <button
              onClick={() => dispatch({ type: 'delete', payload: todo.id })}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      <button onClick={() => dispatch({ type: 'clear_completed' })}>
        Clear Completed
      </button>
    </div>
  );
}
```

## Ví dụ: Fetch data với useReducer

```tsx
type FetchState<T> =
  | { status: 'idle'; data: null; error: null }
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: null; error: string };

type FetchAction<T> =
  | { type: 'fetch' }
  | { type: 'success'; payload: T }
  | { type: 'error'; payload: string };

function fetchReducer<T>(
  state: FetchState<T>,
  action: FetchAction<T>
): FetchState<T> {
  switch (action.type) {
    case 'fetch':
      return { status: 'loading', data: null, error: null };
    case 'success':
      return { status: 'success', data: action.payload, error: null };
    case 'error':
      return { status: 'error', data: null, error: action.payload };
    default:
      return state;
  }
}
```

## useState vs useReducer

| | `useState` | `useReducer` |
|---|---|---|
| State đơn giản | ✅ | Overkill |
| Nhiều sub-values liên quan | Phức tạp | ✅ |
| State logic phức tạp | Khó maintain | ✅ Tách riêng reducer |
| Testable | Khó test logic | ✅ Pure function, dễ test |
| Debug | Console.log | Log actions |

**Quy tắc:** Nếu bạn có nhiều `setState` gọi cùng lúc trong một event handler, hoặc state tiếp theo phụ thuộc phức tạp vào state trước → dùng `useReducer`.

## Reducer rules

1. **Pure function** — cùng input luôn cho cùng output
2. **Không mutate state** — luôn trả về object mới
3. **Không side effects** — không fetch data, không localStorage trong reducer
4. Mỗi action mô tả **"what happened"**, không phải "what to do"

```tsx
// ❌ Action mô tả "what to do"
dispatch({ type: 'set_count', payload: state.count + 1 });

// ✅ Action mô tả "what happened"
dispatch({ type: 'increment' });
```

---

## Câu hỏi phỏng vấn

### Câu 1: useReducer vs useState: khi nào dùng cái nào?
**Đáp án:**

- **useState**: state đơn giản (string, number, boolean), ít logic chuyển đổi.
- **useReducer**: state phức tạp (nhiều sub-values liên quan), logic chuyển đổi phức tạp, state tiếp theo phụ thuộc vào state trước.

```tsx
// useState — đủ tốt cho state đơn giản
const [name, setName] = useState('');
const [isOpen, setIsOpen] = useState(false);

// useReducer — phù hợp khi có nhiều setState liên quan
// Ví dụ: form với nhiều fields + validation + submit status
type FormAction =
  | { type: 'set_field'; field: string; value: string }
  | { type: 'submit' }
  | { type: 'success' }
  | { type: 'error'; message: string };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'set_field':
      return { ...state, [action.field]: action.value };
    case 'submit':
      return { ...state, isSubmitting: true, error: null };
    case 'success':
      return { ...state, isSubmitting: false, isSubmitted: true };
    case 'error':
      return { ...state, isSubmitting: false, error: action.message };
  }
}
```

**Quy tắc:** Nếu bạn gọi nhiều `setState` cùng lúc trong một event handler, hoặc cần logic phức tạp để tính state tiếp theo, hãy dùng `useReducer`.

### Câu 2: Reducer rules là gì?
**Đáp án:**

Reducer phải tuân theo 4 quy tắc:

1. **Pure function** — cùng input (state, action) luôn trả về cùng output, không phụ thuộc yếu tố bên ngoài.
2. **Không mutate state** — luôn trả về object mới, không sửa state cũ.
3. **Không side effects** — không fetch API, không localStorage, không console.log trong reducer.
4. **Action mô tả "what happened"** — action diễn tả sự kiện đã xảy ra, không phải lệnh cần thực hiện.

```tsx
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      // ✅ Trả về object mới
      return { count: state.count + 1 };

    case 'set':
      // ❌ KHÔNG mutate state
      // state.count = action.payload; // SAI!
      return { count: action.payload };

    default:
      return state;
  }
}
```

### Câu 3: Dispatch action mô tả "what happened" nghĩa là gì?
**Đáp án:**

Action nên mô tả **sự kiện đã xảy ra** (what happened) chứ không phải **lệnh cần thực hiện** (what to do). Reducer sẽ quyết định state thay đổi thế nào dựa trên sự kiện đó.

```tsx
// ❌ Action mô tả "what to do" — component đang tự tính toán state mới
dispatch({ type: 'set_count', payload: state.count + 1 });
dispatch({ type: 'set_todos', payload: [...todos, newTodo] });

// ✅ Action mô tả "what happened" — reducer quyết định state mới
dispatch({ type: 'incremented' });
dispatch({ type: 'todo_added', payload: 'Learn React' });

// Ví dụ thực tế: shopping cart
// ❌ Sai
dispatch({ type: 'set_items', payload: [...items, product] });
dispatch({ type: 'set_total', payload: total + product.price });

// ✅ Đúng — một action, reducer xử lý tất cả
dispatch({ type: 'added_to_cart', payload: product });
// Reducer cập nhật cả items VÀ total
```

Lợi ích: logic tập trung trong reducer, dễ debug (log actions), dễ test, dễ replay.

### Câu 4: useReducer + Context tạo state management thế nào?
**Đáp án:**

Kết hợp `useReducer` để quản lý state phức tạp và `Context` để chia sẻ state xuống component tree, tạo ra mini state management giống Redux:

```tsx
// 1. Tạo context
interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
}

type AppAction =
  | { type: 'login'; payload: User }
  | { type: 'logout' }
  | { type: 'toggle_theme' };

const StateContext = createContext<AppState | null>(null);
const DispatchContext = createContext<React.Dispatch<AppAction> | null>(null);

// 2. Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'login':
      return { ...state, user: action.payload };
    case 'logout':
      return { ...state, user: null };
    case 'toggle_theme':
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };
  }
}

// 3. Provider
function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, {
    user: null,
    theme: 'light',
  });

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

// 4. Custom hooks
function useAppState() {
  const context = useContext(StateContext);
  if (!context) throw new Error('useAppState must be within AppProvider');
  return context;
}

function useAppDispatch() {
  const context = useContext(DispatchContext);
  if (!context) throw new Error('useAppDispatch must be within AppProvider');
  return context;
}

// 5. Sử dụng trong component
function Header() {
  const { user, theme } = useAppState();
  const dispatch = useAppDispatch();

  return (
    <header>
      {user ? <span>{user.name}</span> : <span>Guest</span>}
      <button onClick={() => dispatch({ type: 'toggle_theme' })}>
        {theme}
      </button>
    </header>
  );
}
```

**Tách State và Dispatch context** giúp component chỉ đọc state không bị re-render khi dispatch thay đổi, và ngược lại.
