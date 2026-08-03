---
sidebar_position: 1
title: "1. Hooks Deep Dive"
---

# Hooks Deep Dive

> *"Em đã dùng React" là một câu, "em hiểu React hoạt động thế nào" là câu khác. Phần hooks này quyết định bạn ở nhóm nào.*

:::note[Ghi nhớ nhanh]

- ⭐ **Rules of Hooks** — React lưu state hook theo *thứ tự gọi*, không theo tên → tuyệt đối không gọi hook trong `if`/loop/try.
- ⭐ **Stale closure** — `useEffect` deps rỗng capture giá trị cũ; fix bằng functional update `setCount(c => c + 1)` hoặc ref pattern.
- **`useMemo`/`useCallback`** — chỉ cần khi giữ tham chiếu ổn định (cho `React.memo`/deps) hoặc computation thực sự đắt; bản thân memo có cost.
- **Custom hook & `useReducer`** — mỗi caller custom hook có state riêng; dùng `useReducer` khi state nhiều "mode"/action, và lazy init `useState(() => compute())` khi giá trị khởi tạo đắt.
- **`useRef`** — giữ giá trị mutable không gây re-render + truy cập DOM; đọc `.current` trong `useEffect`, không trong render.
- **FC vs Class** — hook map được lifecycle, nhưng Error Boundary (`componentDidCatch`) vẫn bắt buộc là class.

:::

---

## Câu 1: Vì sao hook không được gọi trong condition hoặc loop? `[Intermediate]`

### Câu hỏi

> Em thử gọi `useState` trong `if` xem, sẽ bị eslint cảnh báo. Tại sao React lại yêu cầu hooks gọi cùng thứ tự?

### Giải thích lý thuyết

React **không** lưu hook theo tên — nó lưu theo **thứ tự gọi** trong một mảng nội bộ của fiber. Mỗi lần render, React đi qua mảng đó tuần tự.

Nếu gọi hook trong condition → giữa 2 render, thứ tự có thể lệch → state của hook 1 bị "đọc nhầm" thành state của hook 2 → bug khó debug.

### Code minh hoạ

```javascript
// ❌ SAI — thứ tự không ổn định
function Bad({ showName }) {
  if (showName) {
    const [name, setName] = useState("");  // chỉ tồn tại khi showName=true
  }
  const [age, setAge] = useState(0);

  // Render 1 (showName=true): hooks = [name, age]
  // Render 2 (showName=false): hooks = [age]  → React đọc age từ slot của name → bug
}

// ✅ ĐÚNG — luôn gọi cùng thứ tự, condition nằm BÊN TRONG hook
function Good({ showName }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState(0);

  return (
    <>
      {showName && <input value={name} onChange={(e) => setName(e.target.value)} />}
      <input type="number" value={age} onChange={(e) => setAge(+e.target.value)} />
    </>
  );
}

// Pattern: condition ở render output, không ở hook call
// Nếu thực sự cần "hook conditional", tách thành component con
function ConditionalForm({ showName }) {
  return showName ? <NameForm /> : <AgeOnly />;
}
function NameForm() {
  const [name, setName] = useState(""); // luôn gọi
  const [age, setAge] = useState(0);
  return (...);
}
```

### Đáp án mẫu

> "Vì React lưu state của hook theo **thứ tự gọi**, không theo tên. Mỗi fiber có một mảng hook state, render lần n React đi qua mảng đó tuần tự. Nếu render 1 có `[useState_name, useState_age]` còn render 2 có `[useState_age]`, React sẽ đọc state slot 0 (vốn của name) gán cho age — bug rất khó debug. Quy tắc: hook luôn ở top-level function component, không trong condition/loop/try. Nếu logic cần conditional, tách thành component con — hook gọi tất cả trong subtree, condition nằm ở chỗ render component đó. ESLint plugin `react-hooks/rules-of-hooks` enforce rule này, đừng disable nó."

---

## Câu 2: `useEffect` dependency array — bẫy phổ biến `[Intermediate]`

### Câu hỏi

> ```javascript
> useEffect(() => {
>   const id = setInterval(() => setCount(count + 1), 1000);
>   return () => clearInterval(id);
> }, []);
> ```
>
> Có bug gì? Liệt kê các cách fix.

### Giải thích lý thuyết

Bug: dependency rỗng `[]` → effect chạy 1 lần, closure capture `count = 0` ban đầu. Mỗi tick set count = 0 + 1 = 1, không bao giờ tăng tiếp.

3 cách fix:

1. **Thêm `count` vào deps** — effect re-run mỗi tick, recreate interval (chậm).
2. **Functional update `setCount(c => c + 1)`** — không cần đọc `count` trong closure.
3. **Ref pattern** — lưu giá trị mới vào `useRef` để closure đọc.

### Code minh hoạ

```javascript
// ❌ Bug stale closure
function BadCounter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCount(count + 1), 1000);
    return () => clearInterval(id);
  }, []); // count = 0 bị capture
  return <div>{count}</div>;
}

// ✅ Fix 1: functional update (preferred)
function GoodCounter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCount((c) => c + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return <div>{count}</div>;
}

// ✅ Fix 2: deps = [count] — recreate interval mỗi tick (không lý tưởng nhưng hợp lệ)
function CountOnDeps() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setCount(count + 1), 1000);
    return () => clearTimeout(id);
  }, [count]);
}

// ✅ Fix 3: ref pattern khi không tránh được closure
function RefPattern({ onTick }) {
  const onTickRef = useRef(onTick);
  useEffect(() => { onTickRef.current = onTick; }); // sync ref mỗi render

  useEffect(() => {
    const id = setInterval(() => onTickRef.current(), 1000);
    return () => clearInterval(id);
  }, []); // deps rỗng, nhưng ref luôn mới
}
```

### Đáp án mẫu

> "Bug là **stale closure**: `count` được capture lúc effect chạy đầu tiên (= 0), mỗi tick callback đọc 0 chứ không phải value hiện tại — set thành 1 mãi mãi. Em fix bằng **functional update** `setCount(c => c + 1)` — không cần đọc count từ closure nữa nên dependency array `[]` vẫn đúng. Đây là pattern em luôn dùng cho setInterval/setTimeout/event subscription. Hai cách khác: thêm `count` vào deps (recreate interval mỗi tick — wasteful nhưng đúng), hoặc dùng ref pattern khi callback là từ prop (lưu latest callback vào ref, effect đọc ref). React docs gọi cái cuối là 'latest ref pattern'."

---

## Câu 3: `useMemo` vs `useCallback` — khi nào thực sự cần? `[Intermediate]`

### Câu hỏi

> Em hay dùng `useMemo`/`useCallback` ở đâu? Có phải lúc nào cũng nên wrap không?

### Giải thích lý thuyết

Cả 2 đều cache giá trị giữa renders dựa trên dependency. Khác biệt:

- `useMemo(() => compute(), deps)` — cache **kết quả**.
- `useCallback(fn, deps)` — cache **function** (tương đương `useMemo(() => fn, deps)`).

3 trường hợp **thực sự cần**:

1. **Tham chiếu ổn định** truyền xuống component memoized (`React.memo`).
2. **Tham chiếu ổn định** dùng làm dependency của `useEffect`/`useMemo` khác.
3. **Computation thực sự đắt** (xử lý array lớn, parse...).

Wrap tràn lan: cache có chi phí, hash check deps có chi phí — thường lose-lose.

### Code minh hoạ

```javascript
// ❌ Không cần memo
function Useless({ a, b }) {
  const sum = useMemo(() => a + b, [a, b]); // overhead > benefit
  return <div>{sum}</div>;
}

// ✅ Cần useMemo — computation đắt
function ExpensiveList({ items, query }) {
  const filtered = useMemo(
    () => items.filter((i) => i.name.includes(query)).sort(),
    [items, query]
  );
  return <List data={filtered} />;
}

// ✅ Cần useCallback — function truyền xuống memoized child
const MemoizedChild = React.memo(function Child({ onClick }) {
  return <button onClick={onClick}>Click</button>;
});

function Parent() {
  const [count, setCount] = useState(0);
  const handleClick = useCallback(() => doSomething(), []); // ổn định

  return (
    <>
      <button onClick={() => setCount((c) => c + 1)}>{count}</button>
      <MemoizedChild onClick={handleClick} />  {/* không re-render */}
    </>
  );
}

// ✅ Cần useMemo — dependency của hook khác
function Component({ user }) {
  const config = useMemo(() => ({ id: user.id, theme: "dark" }), [user.id]);

  useEffect(() => {
    subscribe(config); // nếu không memo, config object mới mỗi render → effect chạy lại
  }, [config]);
}

// React Compiler (React 19) tự memoize → mất dần lý do viết tay
```

### Đáp án mẫu

> "Không phải lúc nào cũng nên wrap — `useMemo`/`useCallback` có cost (hash check deps + tốn memory). Em chỉ dùng trong 3 trường hợp: thứ nhất là **tham chiếu ổn định** khi truyền props xuống component được `React.memo` — nếu function/object mới mỗi render thì memo của con vô tác dụng. Thứ hai là khi value là **dependency** của useEffect/useMemo khác — object literal mới mỗi render sẽ trigger effect liên tục. Thứ ba là **computation thực sự đắt** (filter array nghìn item, parse JSON to). Cho computation rẻ (sum 2 số, format string), wrap là negative — overhead lớn hơn benefit. React Compiler trong React 19 đang tự động memoize → tương lai có thể không cần viết tay nữa, nhưng hiện tại em vẫn áp dụng quy tắc trên."

---

## Câu 4: Custom Hook — quy tắc và pattern `[Intermediate]`

### Câu hỏi

> Viết custom hook `useDebounce(value, delay)`. Sau đó: rules of hooks áp dụng cho custom hook không?

### Giải thích lý thuyết

Custom hook = function `useXxx` mà bên trong dùng hook khác. React phân biệt custom hook qua prefix `use` (eslint check), không phải reflection.

Rule áp dụng:
- Custom hook **phải** tuân rules of hooks (gọi top-level, không condition).
- Mỗi caller của custom hook có **state độc lập** — không share state qua module.

### Code minh hoạ

```javascript
// useDebounce — delay value
import { useState, useEffect } from "react";

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

// Usage
function Search() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) fetchResults(debouncedQuery);
  }, [debouncedQuery]);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}

// Composition: custom hook gọi custom hook khác
function useDebouncedSearch(delay = 300) {
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, delay);
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!debounced) return;
    let cancelled = false;
    fetchResults(debounced).then((data) => !cancelled && setResults(data));
    return () => { cancelled = true; };
  }, [debounced]);

  return { query, setQuery, results };
}

// State riêng cho mỗi caller
function Page() {
  const a = useDebouncedSearch(); // state riêng
  const b = useDebouncedSearch(); // state riêng — không share với a
}

// ❌ Bẫy: gọi custom hook trong if
function Bad({ enabled }) {
  if (enabled) {
    const result = useDebounce(value); // ❌ vi phạm rules
  }
}
```

### Đáp án mẫu

> "Custom hook là function `useXxx` gọi hook khác bên trong. React identify qua prefix `use` (ESLint check, không phải runtime), nên không viết `useDebounce` mà `getDebounce` thì rules-of-hooks plugin sẽ không bảo vệ. Quy tắc của hook áp dụng đầy đủ — không gọi trong if/loop/try. Mỗi caller của custom hook có state hoàn toàn độc lập — gọi `useDebounce` ở 2 component thì có 2 instance state riêng, không phải singleton. Đây là sức mạnh chính: tách logic stateful ra ngoài UI, reuse mà không bị share-state. Pattern tốt: custom hook trả về object/tuple — pattern `[value, setter]` cho hook giống useState, hoặc object `{ data, loading, error }` cho hook async."

---

## Câu 5: `useState` lazy initial + `useReducer` — khi nào dùng cái nào? `[Senior]`

### Câu hỏi

> Em có state gồm nhiều field liên quan đến nhau (form, wizard). Em dùng nhiều `useState` riêng, một `useState` object, hay `useReducer`? Tiêu chí?

### Giải thích lý thuyết

Tiêu chí chọn:

| Tình huống                                                  | Chọn                            |
| ----------------------------------------------------------- | ------------------------------- |
| 1-2 field độc lập                                           | Nhiều `useState`                |
| Nhiều field nhưng update từng cái độc lập                   | Nhiều `useState`                |
| Nhiều field thay đổi cùng nhau, có "actions" phức tạp       | `useReducer`                    |
| Cần test logic transition riêng                             | `useReducer` (reducer là pure fn) |
| State có nhiều "mode"/state machine                         | `useReducer` (+ discriminated union) |

`useState` lazy initial: pass function khi initial value đắt:
```javascript
useState(() => expensiveCompute()); // chỉ chạy 1 lần
```

### Code minh hoạ

```javascript
// Anti-pattern: object state với spread lan tràn
function BadForm() {
  const [form, setForm] = useState({ name: "", email: "", age: 0, address: "" });

  return (
    <input onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
    // verbose, dễ quên field
  );
}

// Tốt hơn: nhiều useState
function MultiState() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  // Update đơn giản, mỗi field độc lập
}

// useReducer khi có "actions" phức tạp
type State =
  | { status: "idle" }
  | { status: "filling"; data: Partial<Form>; step: number }
  | { status: "submitting" }
  | { status: "success"; result: Result }
  | { status: "error"; error: string };

type Action =
  | { type: "START_FILL" }
  | { type: "UPDATE_FIELD"; field: keyof Form; value: string }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SUBMIT" }
  | { type: "SUCCESS"; result: Result }
  | { type: "ERROR"; error: string }
  | { type: "RESET" };

function reducer(state: State, action: Action): State {
  switch (state.status) {
    case "idle":
      if (action.type === "START_FILL") return { status: "filling", data: {}, step: 0 };
      return state;
    case "filling":
      if (action.type === "UPDATE_FIELD")
        return { ...state, data: { ...state.data, [action.field]: action.value } };
      if (action.type === "NEXT_STEP") return { ...state, step: state.step + 1 };
      if (action.type === "SUBMIT") return { status: "submitting" };
      return state;
    // ... handle all transitions
    default:
      return state;
  }
}

function Wizard() {
  const [state, dispatch] = useReducer(reducer, { status: "idle" });
  // ...
}

// Lazy initial — chỉ chạy 1 lần
const [value] = useState(() => expensiveCompute()); // ✅
const [value2] = useState(expensiveCompute());      // ❌ Compute mỗi render
```

### Đáp án mẫu

> "Em chọn theo độ phức tạp của transition. Nếu chỉ 1-2 field độc lập (input search, toggle), em dùng `useState` riêng — đơn giản nhất. Nếu nhiều field nhưng update từng cái độc lập, em vẫn `useState` riêng — code rõ hơn `setForm({...form, field: val})` lan tràn. Em chuyển sang `useReducer` khi state có 'actions' phức tạp hoặc nhiều mode — wizard, async flow (idle/loading/success/error), undo-redo. Reducer là pure function nên test được riêng khỏi component. Em kết hợp discriminated union TS với reducer — mỗi action có shape rõ, exhaustive check khi switch. Một detail: dùng lazy initial `useState(() => compute())` khi initial value đắt — chỉ chạy 1 lần thay vì mỗi render."

---

## Câu 6: `useRef` — 2 use case khác nhau và bẫy với DOM `[Senior]`

### Câu hỏi

> `useRef` có 2 nhóm use case lớn. Em liệt kê và cho ví dụ. Bẫy phổ biến khi dùng ref với DOM?

### Giải thích lý thuyết

2 nhóm use case:

1. **Lưu giá trị mutable không trigger re-render** — counter giữa render, timer id, previous value, latest callback.
2. **Truy cập DOM/component instance** — focus, scroll, measure, integrate với non-React lib.

Bẫy:
- Đọc `ref.current` trong render → có thể chưa attach (đặc biệt với conditional render).
- Mutate ref trong render → unsafe (React concurrent mode có thể discard render).
- `forwardRef` cần đúng để parent forward ref vào DOM con.

### Code minh hoạ

```javascript
// USE CASE 1: Mutable value không trigger re-render
function Timer() {
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => console.log("tick"), 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  return <button onClick={() => clearInterval(intervalRef.current)}>Stop</button>;
}

// Previous value pattern
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => { ref.current = value; });
  return ref.current; // value của render trước
}

// Latest callback (tránh stale closure)
function useLatest(callback) {
  const ref = useRef(callback);
  useEffect(() => { ref.current = callback; });
  return ref;
}

// USE CASE 2: DOM access
function FocusInput() {
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  return <input ref={inputRef} />;
}

// forwardRef để parent truy cập DOM của child
const Button = forwardRef(function Button(props, ref) {
  return <button ref={ref} {...props} />;
});

function Parent() {
  const btnRef = useRef(null);
  return <Button ref={btnRef} />; // OK với forwardRef
}

// React 19: ref là prop bình thường, không cần forwardRef
function ButtonV19({ ref, ...props }) {
  return <button ref={ref} {...props} />;
}

// BẪY 1: đọc ref trong render
function Bad() {
  const ref = useRef(null);
  const width = ref.current?.offsetWidth; // có thể null khi mount
  return <div ref={ref} />;
}

// Fix: dùng useLayoutEffect để đọc sau khi DOM attach
function Good() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    setWidth(ref.current.offsetWidth);
  }, []);
  return <div ref={ref}>Width: {width}</div>;
}

// BẪY 2: callback ref khi node thay đổi
function MeasuredBox() {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const measureRef = useCallback((node) => {
    if (!node) return;
    const rect = node.getBoundingClientRect();
    setSize({ w: rect.width, h: rect.height });
  }, []);
  return <div ref={measureRef}>...</div>;
}
```

### Đáp án mẫu

> "2 nhóm: thứ nhất là **mutable value không trigger re-render** — giữ timer id, previous value, latest callback (chống stale closure trong event handler). Thứ hai là **DOM/instance access** — focus, scroll, measure, integrate non-React lib như chart hay map. Bẫy lớn nhất: đọc `ref.current` trong render body — render chạy trước commit, ref có thể chưa attach. Phải đọc trong `useEffect` (sau paint) hoặc `useLayoutEffect` (trước paint, đo size). Bẫy khác: với element được mount/unmount động, ref pattern không bắt được lần thay đổi node — phải dùng **callback ref** `ref={(node) => {}}` để được notify mỗi khi node thay đổi. Trong React 19, `ref` đã thành prop bình thường, không cần `forwardRef` nữa — code gọn hơn nhiều."

---

## Câu 7: Functional Component vs Class Component — khác gì, chọn cái nào? `[Junior]`

### Câu hỏi

> So sánh Functional Component và Class Component. Hooks thay thế lifecycle method như thế nào? Năm 2026 còn lý do nào để viết Class Component không?

### Giải thích lý thuyết

| Tiêu chí              | Functional Component                          | Class Component                                |
| --------------------- | --------------------------------------------- | ---------------------------------------------- |
| Cú pháp               | Hàm trả về JSX                                | `class extends React.Component`, có `render()` |
| State                 | `useState` / `useReducer`                     | `this.state` + `this.setState`                 |
| Side effect           | `useEffect` / `useLayoutEffect`               | Lifecycle method (`componentDidMount`...)      |
| `this`                | Không có (tránh hẳn bug binding `this`)       | Phải bind `this` cho handler                   |
| Tái dùng logic        | **Custom hook** (gọn, compose được)           | HOC / render props (lồng nhau, "wrapper hell") |
| Code lượng            | Ngắn hơn rõ rệt                               | Nhiều boilerplate                              |
| Tối ưu                | `React.memo`, `useMemo`, React Compiler       | `PureComponent`, `shouldComponentUpdate`       |
| Khuyến nghị 2026      | **Mặc định** — React docs viết bằng FC + hook | Chỉ legacy + 1 ngoại lệ (Error Boundary)       |

**Hooks thay thế lifecycle** như thế nào:

| Class lifecycle                              | Functional (hook) tương đương                                |
| -------------------------------------------- | ------------------------------------------------------------ |
| `componentDidMount`                          | `useEffect(() => {...}, [])`                                 |
| `componentDidUpdate`                         | `useEffect(() => {...}, [deps])`                             |
| `componentWillUnmount`                       | `useEffect(() => { return () => {...} }, [])` (cleanup)      |
| `getDerivedStateFromError` / `componentDidCatch` | **Chưa có** hook tương đương → vẫn phải dùng class      |

**Ngoại lệ duy nhất còn cần class (2026): Error Boundary.** React chưa có hook để catch render error, nên Error Boundary vẫn phải là class (hoặc dùng lib `react-error-boundary` bọc sẵn).

### Code minh hoạ

```jsx
// CLASS COMPONENT — nhiều boilerplate, phải lo this
class Counter extends React.Component {
  state = { count: 0 };

  // phải bind this hoặc dùng class field arrow
  increment = () => this.setState((s) => ({ count: s.count + 1 }));

  componentDidMount() {
    document.title = `Count: ${this.state.count}`;
  }
  componentDidUpdate() {
    document.title = `Count: ${this.state.count}`;
  }

  render() {
    return <button onClick={this.increment}>{this.state.count}</button>;
  }
}

// FUNCTIONAL COMPONENT — ngắn gọn, không this, logic gom theo concern
function Counter() {
  const [count, setCount] = useState(0);

  // gộp mount + update vào 1 effect theo dependency
  useEffect(() => {
    document.title = `Count: ${count}`;
  }, [count]);

  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
}
```

```jsx
// Ngoại lệ vẫn cần class: Error Boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { logError(error, info); }
  render() {
    return this.state.hasError ? <Fallback /> : this.props.children;
  }
}
```

### Đáp án mẫu

> "Khác biệt lớn nhất: Functional Component là **hàm** dùng hooks (`useState`, `useEffect`) cho state và side effect, còn Class Component dùng `this.state`, `setState` và lifecycle method. FC không có `this` nên tránh hẳn lớp bug binding `this` trong event handler, code ngắn hơn nhiều, và tái dùng logic bằng **custom hook** thay vì HOC/render props vốn gây 'wrapper hell'.
>
> Về lifecycle: `componentDidMount` ↔ `useEffect(fn, [])`, `componentDidUpdate` ↔ `useEffect(fn, [deps])`, `componentWillUnmount` ↔ hàm cleanup return trong `useEffect`. Điểm hay của hook là gom logic **theo concern** (data fetch một effect, subscription một effect) thay vì rải rác qua nhiều lifecycle như class.
>
> Năm 2026 em **mặc định dùng Functional Component** — React docs đã viết toàn bộ bằng FC + hooks, React Compiler cũng tối ưu cho FC. Lý do duy nhất còn phải viết class là **Error Boundary**, vì chưa có hook nào catch được render error — nhưng em thường dùng lib `react-error-boundary` để khỏi tự viết class. Còn lại, codebase mới em không viết class component nữa."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                | Đúng là                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| "Có thể gọi hook trong if để optimize"                 | Phá rules of hooks — React không lưu state theo tên, theo thứ tự     |
| "`useMemo` luôn cải thiện performance"                 | Có cost hash check; chỉ giúp khi computation đủ đắt hoặc cần ref ổn định |
| "Hook trong custom hook chia sẻ state"                 | Mỗi caller có state riêng                                            |
| "`useRef` trigger re-render khi `.current` đổi"        | Không — ref change KHÔNG trigger re-render (đó là feature)            |
| "useState lazy initial dùng `useState(compute())`"     | Phải pass function: `useState(() => compute())`                       |
| "Functional Component không có lifecycle"              | Có — qua `useEffect` (mount/update/unmount đều map được)             |
| "Class Component đã bị xoá khỏi React"                 | Vẫn hỗ trợ (không deprecated); chỉ là không nên dùng cho code mới    |
| "Hook thay thế được mọi thứ của class"                 | Chưa — Error Boundary (`componentDidCatch`) vẫn phải là class        |
