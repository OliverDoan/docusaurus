---
sidebar_position: 13
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
