---
sidebar_position: 1
title: "1. Redux Core"
---

# Redux Core

> _Redux là thư viện quản lý state phổ biến nhất trong hệ sinh thái React — hiểu vững các khái niệm cốt lõi giúp bạn tự tin giải quyết mọi bài toán state phức tạp trong dự án thực tế._

---

## Câu 1: Redux là gì? Tại sao chúng ta cần sử dụng Redux? `[Basic]`

### Câu hỏi

> Redux là gì và trong trường hợp nào bạn sẽ chọn dùng Redux thay vì `useState` hay `useContext`?

### Giải thích lý thuyết

Redux là một **thư viện quản lý state** (state management library) theo mô hình **Flux**, được thiết kế để lưu trữ toàn bộ state của ứng dụng trong một **single source of truth** duy nhất gọi là `Store`.

**Vấn đề Redux giải quyết:**

| Vấn đề | Giải pháp của Redux |
|---|---|
| Prop drilling — truyền props qua nhiều tầng | Store toàn cục, component nào cũng truy cập được |
| State chia sẻ giữa nhiều component không liên quan | Một store duy nhất, dễ đồng bộ |
| Khó debug khi state thay đổi | Mọi thay đổi đều qua action, dễ trace |
| Logic side-effect lẫn lộn với UI | Tách biệt qua middleware (redux-thunk, redux-saga) |

**Luồng dữ liệu một chiều (unidirectional data flow):**

```
UI → dispatch(action) → Reducer → Store → UI re-render
```

### Code minh hoạ

```ts
// Không dùng Redux: prop drilling qua 3 tầng
// App → Parent → Child → GrandChild (chỉ GrandChild dùng user)

// Dùng Redux: GrandChild lấy thẳng từ store
import { useSelector } from 'react-redux';

const GrandChild = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  return <div>Xin chào, {user.name}</div>;
};
```

### Đáp án mẫu

> Redux là thư viện quản lý state tập trung theo mô hình Flux, lưu toàn bộ state trong một store duy nhất. Tôi chọn Redux khi ứng dụng có nhiều state được chia sẻ giữa các component không liên quan, cần debug rõ ràng, hoặc có logic async phức tạp. Với state đơn giản hoặc cục bộ, `useState` hay `useContext` là đủ.

---

## Câu 2: Ba nguyên tắc cốt lõi của Redux là gì? `[Basic]`

### Câu hỏi

> Hãy nêu và giải thích ba nguyên tắc cốt lõi (three principles) của Redux.

### Giải thích lý thuyết

Redux được xây dựng trên ba nguyên tắc bất biến:

**1. Single source of truth (Một nguồn sự thật duy nhất)**
Toàn bộ state của ứng dụng được lưu trong một object tree duy nhất bên trong một `store`. Giúp dễ debug, dễ hydrate state từ server.

**2. State is read-only (State chỉ đọc)**
Cách duy nhất để thay đổi state là `dispatch` một `action` — một object mô tả điều gì đó đã xảy ra. Không ai được trực tiếp ghi vào state.

**3. Changes are made with pure functions (Thay đổi thực hiện bằng pure function)**
Reducer phải là pure function: cùng input thì luôn cho cùng output, không có side effect. Reducer nhận `(state, action)` và trả về state mới.

### Code minh hoạ

```ts
// Nguyên tắc 2: dispatch action thay vì sửa state trực tiếp
store.dispatch({ type: 'counter/increment' }); // ĐÚNG

// Nguyên tắc 3: Reducer là pure function
const counterReducer = (state = 0, action: Action): number => {
  switch (action.type) {
    case 'counter/increment':
      return state + 1; // trả về state MỚI
    case 'counter/decrement':
      return state - 1;
    default:
      return state; // không thay đổi, trả về state cũ
  }
};
```

### Đáp án mẫu

> Ba nguyên tắc của Redux là: một, Single source of truth — toàn bộ state trong một store; hai, State is read-only — chỉ thay đổi qua dispatch action; ba, Pure functions — reducer không được có side effect, cùng input luôn cho cùng output. Ba nguyên tắc này đảm bảo luồng dữ liệu có thể dự đoán và dễ debug.

---

## Câu 3: Action trong Redux là gì? Cấu trúc của một action như thế nào? `[Basic]`

### Câu hỏi

> Action trong Redux là gì? Action Creator là gì? Chuẩn Flux Standard Action (FSA) quy định gì?

### Giải thích lý thuyết

**Action** là một plain JavaScript object mô tả **ý định thay đổi state**. Action bắt buộc có trường `type` (string) định danh hành động.

**Action Creator** là function trả về action object, giúp tái sử dụng và tránh lỗi typo khi viết type string.

**Flux Standard Action (FSA)** — quy ước phổ biến:

| Trường | Bắt buộc | Mô tả |
|---|---|---|
| `type` | Có | Tên hành động, thường viết hoa với `/` phân cấp |
| `payload` | Không | Dữ liệu đi kèm |
| `error` | Không | `true` nếu action là lỗi |
| `meta` | Không | Thông tin bổ sung không phải payload |

### Code minh hoạ

```ts
// Action thông thường
const incrementAction = { type: 'counter/increment' };

// Action với payload (FSA)
const addTodoAction = {
  type: 'todos/add',
  payload: { id: 1, text: 'Học Redux', completed: false },
};

// Action Creator
const addTodo = (text: string) => ({
  type: 'todos/add' as const,
  payload: { id: Date.now(), text, completed: false },
});

// Dùng với Redux Toolkit (createAction)
import { createAction } from '@reduxjs/toolkit';

const increment = createAction<number>('counter/increment');
console.log(increment(5));
// { type: 'counter/increment', payload: 5 }
```

### Đáp án mẫu

> Action là plain object bắt buộc có trường `type` mô tả hành động xảy ra. Dữ liệu thêm được đặt trong `payload` theo chuẩn FSA. Action Creator là function tạo ra action, giúp code gọn và tránh lỗi typo. Trong Redux Toolkit, `createAction` giúp tạo action creator kèm type-safe tự động.

---

## Câu 4: Reducer trong Redux là gì? Cách viết một reducer đúng chuẩn? `[Basic]`

### Câu hỏi

> Reducer là gì? Những điều tuyệt đối không được làm trong reducer?

### Giải thích lý thuyết

**Reducer** là pure function nhận `(currentState, action)` và trả về `nextState`. Reducer quyết định state thay đổi như thế nào dựa trên action được dispatch.

**Quy tắc bắt buộc của reducer:**

- **Không được mutation** state trực tiếp — luôn trả về object mới
- **Không được** gọi API, đọc file, hoặc bất kỳ side effect nào
- **Không được** gọi các function không thuần (như `Date.now()`, `Math.random()`)
- **Phải** trả về `default state` khi `state = undefined`
- **Phải** trả về state hiện tại trong trường hợp `default`

### Code minh hoạ

```ts
interface TodoState {
  items: { id: number; text: string; completed: boolean }[];
  loading: boolean;
}

const initialState: TodoState = {
  items: [],
  loading: false,
};

// ĐÚNG: Reducer thuần, không mutation
const todosReducer = (
  state = initialState,
  action: Action
): TodoState => {
  switch (action.type) {
    case 'todos/add':
      return {
        ...state,
        items: [...state.items, action.payload], // spread tạo array mới
      };

    case 'todos/toggle':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload
            ? { ...item, completed: !item.completed } // object mới
            : item
        ),
      };

    case 'todos/remove':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };

    default:
      return state; // bắt buộc có default
  }
};
```

### Đáp án mẫu

> Reducer là pure function nhận state hiện tại và action, trả về state mới. Tuyệt đối không được mutation state trực tiếp — phải trả về object mới bằng spread hoặc immutable methods. Không được có side effect như gọi API hay random. Redux Toolkit dùng Immer bên dưới nên cho phép viết "mutation style" nhưng thực tế vẫn tạo object mới.

---

## Câu 5: Store trong Redux là gì? Các phương thức chính của store là gì? `[Basic]`

### Câu hỏi

> Store trong Redux có vai trò gì? Hãy liệt kê các phương thức chính của store và giải thích công dụng từng phương thức.

### Giải thích lý thuyết

**Store** là object trung tâm lưu trữ toàn bộ state tree của ứng dụng. Store được tạo một lần duy nhất bằng `configureStore` (Redux Toolkit) hoặc `createStore` (legacy).

**Bốn phương thức chính:**

| Phương thức | Mô tả |
|---|---|
| `getState()` | Trả về state hiện tại |
| `dispatch(action)` | Gửi action để thay đổi state |
| `subscribe(listener)` | Đăng ký callback chạy khi state thay đổi |
| `replaceReducer(nextReducer)` | Thay thế reducer (dùng cho code splitting) |

### Code minh hoạ

```ts
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';
import todosReducer from './todosSlice';

// Tạo store
const store = configureStore({
  reducer: {
    counter: counterReducer,
    todos: todosReducer,
  },
});

// getState — lấy state hiện tại
console.log(store.getState());
// { counter: { value: 0 }, todos: { items: [], loading: false } }

// dispatch — gửi action
store.dispatch({ type: 'counter/increment' });

// subscribe — lắng nghe thay đổi (React-Redux làm tự động)
const unsubscribe = store.subscribe(() => {
  console.log('State đã thay đổi:', store.getState());
});

// Hủy lắng nghe
unsubscribe();

// Infer types từ store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Đáp án mẫu

> Store là nơi lưu trữ toàn bộ state, có bốn phương thức chính: `getState()` để đọc state, `dispatch()` để gửi action thay đổi state, `subscribe()` để lắng nghe thay đổi, và `replaceReducer()` để hot-reload reducer. Trong React app thực tế, chúng ta không gọi trực tiếp mà dùng hooks `useSelector` và `useDispatch` từ React-Redux.

---

## Câu 6: useSelector và useDispatch hook trong React-Redux hoạt động như thế nào? `[Intermediate]`

### Câu hỏi

> Giải thích cơ chế hoạt động của `useSelector` và `useDispatch`. Tại sao `useSelector` có thể gây re-render không cần thiết và cách tránh?

### Giải thích lý thuyết

**`useSelector(selectorFn)`**
- Gọi `selectorFn(state)` để lấy dữ liệu từ store
- Đăng ký `subscribe` với store — mỗi khi state thay đổi, nó chạy lại `selectorFn`
- **So sánh bằng tham chiếu (`===`)**: nếu kết quả trả về khác tham chiếu → component re-render
- **Nguy cơ**: selector trả về object/array mới mỗi lần (dù dữ liệu giống nhau) → re-render vô ích

**`useDispatch()`**
- Trả về hàm `dispatch` của store
- Tham chiếu ổn định — không thay đổi giữa các render

**Cách tránh re-render không cần thiết:**
- Chọn primitive values thay vì object (`state.user.name` thay vì `state.user`)
- Dùng `createSelector` (reselect) để memoize kết quả
- Dùng `shallowEqual` từ react-redux làm equality function

### Code minh hoạ

```ts
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { RootState } from '../store';

// VẤN ĐỀ: trả về object mới mỗi lần → luôn re-render
const BadComponent = () => {
  const user = useSelector((state: RootState) => ({
    name: state.auth.name,
    email: state.auth.email,
  }));
  // ...
};

// GIẢI PHÁP 1: chọn primitive
const GoodComponent1 = () => {
  const name = useSelector((state: RootState) => state.auth.name);
  const email = useSelector((state: RootState) => state.auth.email);
  // ...
};

// GIẢI PHÁP 2: shallowEqual
const GoodComponent2 = () => {
  const user = useSelector(
    (state: RootState) => ({ name: state.auth.name, email: state.auth.email }),
    shallowEqual // so sánh shallow thay vì ===
  );
  // ...
};

// useDispatch
const CounterButton = () => {
  const dispatch = useDispatch();
  return (
    <button onClick={() => dispatch({ type: 'counter/increment' })}>
      Tăng
    </button>
  );
};
```

### Đáp án mẫu

> `useSelector` subscribe vào store và re-render component khi selector trả về giá trị khác (so sánh `===`). Nếu selector trả về object mới mỗi lần dù dữ liệu không đổi, component sẽ re-render vô ích. Tôi tránh điều này bằng cách chọn primitive values, dùng `shallowEqual`, hoặc memoize bằng `createSelector`. `useDispatch` trả về hàm dispatch ổn định, không gây re-render.

---

## Câu 7: Selector trong Redux là gì? Tại sao nên dùng createSelector (reselect)? `[Intermediate]`

### Câu hỏi

> Selector là gì? `createSelector` từ thư viện reselect giúp gì và hoạt động theo cơ chế nào?

### Giải thích lý thuyết

**Selector** là function nhận `state` và trả về dữ liệu cần thiết. Selector đóng vai trò tầng truy cập dữ liệu — encapsulate cách đọc state.

**Vấn đề với selector thông thường:**

Mỗi lần component render, selector chạy lại. Nếu selector tính toán phức tạp (filter, sort, map) → tốn hiệu năng.

**`createSelector` (reselect):**
- Nhận danh sách **input selectors** và một **result function**
- **Memoize** kết quả: chỉ chạy lại `result function` khi ít nhất một input thay đổi
- Nếu input giống cũ → trả về kết quả cache → component không re-render

### Code minh hoạ

```ts
import { createSelector } from '@reduxjs/toolkit'; // tích hợp sẵn trong RTK
import { RootState } from '../store';

// Input selectors (đơn giản)
const selectTodos = (state: RootState) => state.todos.items;
const selectFilter = (state: RootState) => state.todos.filter;

// Memoized selector — chỉ tính lại khi todos hoặc filter thay đổi
export const selectFilteredTodos = createSelector(
  [selectTodos, selectFilter],
  (todos, filter) => {
    console.log('Đang tính toán filtered todos...'); // chỉ log khi cần
    switch (filter) {
      case 'active':
        return todos.filter((todo) => !todo.completed);
      case 'completed':
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  }
);

// Selector có tham số (parameterized selector)
const selectTodoById = (id: number) =>
  createSelector(selectTodos, (todos) => todos.find((todo) => todo.id === id));

// Dùng trong component
const TodoList = () => {
  const filteredTodos = useSelector(selectFilteredTodos);
  return (
    <ul>
      {filteredTodos.map((todo) => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
};
```

### Đáp án mẫu

> Selector là function truy cập state, giúp encapsulate cấu trúc state khỏi component. `createSelector` từ reselect tạo memoized selector — chỉ tính lại khi input thay đổi, trả về kết quả cache nếu input giống cũ. Điều này tránh tính toán lặp lại và ngăn re-render không cần thiết, đặc biệt quan trọng với các phép tính phức tạp như filter hay sort.

---

## Câu 8: Redux middleware là gì? Cho ví dụ về middleware phổ biến? `[Intermediate]`

### Câu hỏi

> Middleware trong Redux hoạt động như thế nào? Hãy so sánh `redux-thunk` và `redux-saga`.

### Giải thích lý thuyết

**Middleware** là lớp nằm giữa `dispatch` và `reducer`, cho phép can thiệp vào quá trình xử lý action. Middleware có thể:
- Log action
- Xử lý async (gọi API)
- Hủy action
- Dispatch thêm action khác

**Cơ chế hoạt động:**

```
dispatch(action) → middleware1 → middleware2 → reducer
```

**So sánh hai middleware phổ biến nhất:**

| Tiêu chí | redux-thunk | redux-saga |
|---|---|---|
| Cú pháp | Function (thunk) | Generator function |
| Độ phức tạp | Đơn giản | Phức tạp hơn |
| Testing | Khó hơn | Dễ hơn (effects thuần) |
| Hủy request | Khó | Dễ (`takeLatest`, `cancel`) |
| Luồng phức tạp | Khó quản lý | Rất tốt |

### Code minh hoạ

```ts
// === Redux Thunk ===
// Thunk: action creator trả về function thay vì object
export const fetchUser = (userId: number) => async (dispatch: AppDispatch) => {
  dispatch({ type: 'user/fetchStart' });
  try {
    const response = await fetch(`/api/users/${userId}`);
    const user = await response.json();
    dispatch({ type: 'user/fetchSuccess', payload: user });
  } catch (error) {
    dispatch({ type: 'user/fetchFailure', payload: (error as Error).message });
  }
};

// Dùng trong component
dispatch(fetchUser(1));

// === Redux Saga ===
import { call, put, takeEvery } from 'redux-saga/effects';

function* fetchUserSaga(action: { payload: number }) {
  try {
    const user: User = yield call(fetch, `/api/users/${action.payload}`);
    yield put({ type: 'user/fetchSuccess', payload: user });
  } catch (error) {
    yield put({ type: 'user/fetchFailure', payload: error });
  }
}

function* watchFetchUser() {
  yield takeEvery('user/fetchRequest', fetchUserSaga);
}

// Custom middleware (ví dụ logger)
const loggerMiddleware =
  (store: MiddlewareAPI) =>
  (next: Dispatch) =>
  (action: Action) => {
    console.log('Dispatch:', action.type);
    const result = next(action);
    console.log('State sau:', store.getState());
    return result;
  };
```

### Đáp án mẫu

> Middleware là lớp nằm giữa dispatch và reducer, xử lý side effect như async API call hay logging. `redux-thunk` đơn giản — action creator trả về function thay vì object, phù hợp với flow đơn giản. `redux-saga` dùng generator function, mạnh hơn cho flow phức tạp, có thể hủy request và dễ test hơn. Trong các dự án mới với Redux Toolkit, `redux-thunk` đã được tích hợp sẵn.

---

## Câu 9: Redux DevTools hoạt động như thế nào? Tính năng time-travel debugging là gì? `[Intermediate]`

### Câu hỏi

> Redux DevTools cung cấp những tính năng gì? Time-travel debugging là gì và hữu ích như thế nào?

### Giải thích lý thuyết

**Redux DevTools** là browser extension (Chrome/Firefox) kết nối với Redux store qua `devtools enhancer`. Mọi action được dispatch đều được ghi lại cùng state trước và sau.

**Các tính năng chính:**

| Tính năng | Mô tả |
|---|---|
| Action log | Xem danh sách tất cả action đã dispatch |
| State diff | So sánh state trước/sau mỗi action |
| Time-travel | Quay lại/tiến tới bất kỳ state nào trong lịch sử |
| Dispatch manual | Dispatch action trực tiếp từ DevTools |
| Import/Export | Lưu và tải lại session state |
| Skip action | Bỏ qua một action cụ thể trong lịch sử |

**Time-travel debugging:** Cho phép "đi ngược thời gian" về state cũ mà không cần reload app, cực kỳ hữu ích khi reproduce bug.

### Code minh hoạ

```ts
import { configureStore } from '@reduxjs/toolkit';

// Redux Toolkit tự động enable DevTools trong development
const store = configureStore({
  reducer: rootReducer,
  // devTools được bật tự động khi NODE_ENV !== 'production'
  // Có thể cấu hình thêm:
  devTools: {
    name: 'MyApp Store',       // tên hiển thị trên DevTools
    maxAge: 50,                // số lượng action lưu tối đa
    trace: true,               // hiện stack trace của dispatch
    traceLimit: 25,
  },
});

// Với createStore legacy:
import { createStore } from 'redux';
import { composeWithDevTools } from '@redux-devtools/extension';

const storeWithDevTools = createStore(
  rootReducer,
  composeWithDevTools(
    applyMiddleware(thunk)
  )
);
```

### Đáp án mẫu

> Redux DevTools là extension cho phép xem toàn bộ lịch sử action và state của ứng dụng. Time-travel debugging cho phép nhảy về bất kỳ state nào trong quá khứ mà không reload app — rất hữu ích khi reproduce bug. Tôi có thể skip một action cụ thể để xem state thay đổi như thế nào. Redux Toolkit tự động tích hợp DevTools trong development.

---

## Câu 10: Khi nào nên dùng Redux và khi nào không cần? `[Intermediate]`

### Câu hỏi

> Làm thế nào để quyết định có nên dùng Redux hay không? Các lựa chọn thay thế là gì?

### Giải thích lý thuyết

Redux phù hợp khi ứng dụng có đủ độ phức tạp cần thiết. Dùng Redux quá sớm gây overhead không cần thiết (boilerplate, learning curve).

**Nên dùng Redux khi:**
- State được chia sẻ giữa nhiều component không có quan hệ trực tiếp
- State thay đổi theo nhiều cách phức tạp
- Cần debug rõ ràng, trace từng thay đổi
- Ứng dụng lớn với nhiều team làm việc cùng lúc
- Cần persist state (local storage, server)
- Logic async phức tạp, nhiều request liên quan

**Không cần Redux khi:**
- State chỉ dùng trong một component → `useState`
- State chia sẻ giữa vài component gần nhau → `prop drilling` hoặc `useContext`
- Ứng dụng nhỏ, ít biến động state

**Các giải pháp thay thế:**

| Giải pháp | Phù hợp với |
|---|---|
| `useState` + `prop drilling` | Component-local state đơn giản |
| `useContext` + `useReducer` | State chia sẻ cấp trung bình |
| Zustand | Redux nhẹ hơn, ít boilerplate |
| Jotai / Recoil | Atomic state, granular updates |
| React Query / TanStack Query | Server state (fetching, caching) |
| Redux Toolkit | Redux hiện đại với ít boilerplate |

### Code minh hoạ

```ts
// KHÔNG cần Redux: state local
const Counter = () => {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
};

// KHÔNG cần Redux: vài component chia sẻ qua Context
const ThemeContext = createContext<'light' | 'dark'>('light');
const App = () => (
  <ThemeContext.Provider value="dark">
    <Layout />
  </ThemeContext.Provider>
);

// CẦN Redux: nhiều loại state phức tạp, nhiều async flows
// auth state + user data + notifications + cart + orders
// → Redux với RTK slice cho từng domain

// Zustand — thay thế nhẹ hơn
import { create } from 'zustand';

const useCounterStore = create<{ count: number; increment: () => void }>(
  (set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
  })
);
```

### Đáp án mẫu

> Tôi dùng Redux khi ứng dụng đủ lớn: state chia sẻ giữa nhiều component không liên quan, logic async phức tạp, cần debug rõ ràng. Với state cục bộ dùng `useState`, chia sẻ đơn giản dùng `useContext`. Nếu cần Redux nhưng muốn ít boilerplate hơn, tôi cân nhắc Zustand. Với server state như fetching/caching API, tôi dùng TanStack Query thay vì Redux.

---
