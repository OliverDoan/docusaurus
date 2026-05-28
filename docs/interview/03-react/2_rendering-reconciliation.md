---
sidebar_position: 2
title: "2. Rendering & Reconciliation"
---

# Rendering & Reconciliation

> *Câu hỏi loại này phân biệt dev "đã đọc React docs" và dev "đã debug performance trên dự án thật".*

---

## Câu 1: Khi nào một component re-render? `[Intermediate]`

### Câu hỏi

> Em hãy liệt kê tất cả lý do khiến một React component re-render.

### Giải thích lý thuyết

Component re-render khi:

1. **State của chính nó thay đổi** (setState với value khác).
2. **Props thay đổi** từ parent (parent re-render kéo theo).
3. **Context value mà nó subscribe thay đổi** (qua `useContext`).
4. **Parent re-render** — mặc định kéo theo cả subtree (trừ khi `React.memo`).
5. **Force re-render** (`forceUpdate` ở class, hoặc tăng key).

Re-render **không** đồng nghĩa **DOM update**. React compute virtual DOM, diff với cũ, chỉ patch chỗ thay đổi → re-render rẻ hơn nhiều người tưởng.

### Code minh hoạ

```javascript
// 1. State thay đổi
function Counter() {
  const [count, setCount] = useState(0);
  // Mỗi lần setCount(value MỚI) → re-render
  // setCount(value cũ) → React bail out, không re-render
}

// setState bail-out behavior
function NoReRender() {
  const [obj] = useState({ x: 1 });
  const update = () => setObj({ x: 1 }); // object MỚI nhưng giá trị same
  // → vẫn re-render vì Object.is khác (reference khác)
}

// 2. Props thay đổi → parent re-render kéo theo
function Parent() {
  const [n, setN] = useState(0);
  return <Child value={n} />;
}
function Child({ value }) {
  // Re-render mỗi khi Parent re-render (kể cả value không đổi)
  return <div>{value}</div>;
}

// 3. Context
const ThemeContext = createContext("light");
function ThemedButton() {
  const theme = useContext(ThemeContext);
  // Re-render mỗi khi Provider value đổi (theo Object.is)
}

// 4. Parent re-render — default cascade
function Tree() {
  const [x, setX] = useState(0);
  return (
    <>
      <button onClick={() => setX(x + 1)}>{x}</button>
      <Static /> {/* re-render mặc dù không phụ thuộc x */}
    </>
  );
}

// Stop cascade với React.memo
const StaticMemo = React.memo(function Static() {
  return <div>I never re-render</div>;
});

// 5. Force via key
<Component key={resetKey} /> // tăng resetKey → React unmount + mount lại
```

### Đáp án mẫu

> "5 nguyên nhân: state đổi (setState với value khác theo `Object.is`), props đổi (do parent re-render), context value đổi, parent re-render kéo theo cả subtree mặc định, hoặc force qua key. Quan trọng: re-render **không** đồng nghĩa DOM update — React compute virtual DOM, diff, chỉ patch phần thay đổi. Nhiều dev tối ưu re-render khi nó không phải bottleneck. Em chỉ tối ưu khi profile chỉ ra component re-render thực sự gây lag. Một detail tinh tế: `setState(sameValue)` mà cùng reference (`Object.is(prev, next)`) thì React bail-out, không re-render — đó là lý do nên dùng immutable update."

---

## Câu 2: Reconciliation và vai trò của `key` `[Intermediate]`

### Câu hỏi

> Tại sao React cảnh báo dùng `index` làm `key` cho list? Cho ví dụ một bug cụ thể.

### Giải thích lý thuyết

React reconcile (so sánh) virtual DOM cũ và mới:
- **Same type + same key** → update props, giữ state.
- **Different type** hoặc **different key** → unmount + mount lại (mất state local).

Khi dùng `index` làm key, nếu list được reorder/insert/delete giữa chừng:
- Item ở index 0 trước đây = "Apple", giờ là "Banana".
- React thấy key 0 cùng tồn tại → giữ component cũ, chỉ update prop.
- State local của component (input value, focus, animation) bị "kẹt" sai vị trí.

### Code minh hoạ

```javascript
// ❌ BAD: index key + add to front
function BadList() {
  const [items, setItems] = useState([
    { id: "a", label: "Apple" },
    { id: "b", label: "Banana" },
  ]);

  return (
    <>
      <button onClick={() => setItems((prev) => [{ id: "c", label: "Cherry" }, ...prev])}>
        Add to front
      </button>
      {items.map((item, i) => (
        <Row key={i} item={item} />  // ❌ index
      ))}
    </>
  );
}

function Row({ item }) {
  const [note, setNote] = useState(""); // local state
  return (
    <div>
      {item.label}
      <input value={note} onChange={(e) => setNote(e.target.value)} />
    </div>
  );
}

// Reproduce bug:
// 1. Gõ "for Apple" vào input của row "Apple" (index 0)
// 2. Click Add → "Cherry" thành index 0, "Apple" thành 1
// 3. React thấy key 0 vẫn tồn tại → giữ component cũ với note="for Apple"
// → Note "for Apple" bây giờ gắn vào Cherry row ❌

// ✅ GOOD: stable key
{items.map((item) => <Row key={item.id} item={item} />)}

// Khi nào index key OK?
// - List không reorder/insert/delete giữa chừng (chỉ append/pop cuối)
// - List static (không thay đổi)
// - Item không có state local
```

### Đáp án mẫu

> "React reconcile so sánh key cùng position. Khi reorder/insert, index key gây 'shift identity' — component giữ state cũ nhưng nhận prop mới của item khác → state sai vị trí. Ví dụ thực tế: list todo với input note. Gõ note 'Apple' ở row 0, sau đó thêm 'Cherry' lên đầu — note 'Apple' bây giờ hiển thị ở row Cherry. Quy tắc: dùng key **stable và unique** — id từ database tốt nhất. Index OK chỉ khi list không reorder/insert/delete giữa chừng và item không có state local. Bẫy ít người biết: dùng `Math.random()` làm key còn tệ hơn index — mỗi render key mới, React unmount+mount toàn bộ → mất hết state, mất hết transition."

---

## Câu 3: Batching — React 18 thay đổi thế nào? `[Senior]`

### Câu hỏi

> ```javascript
> setTimeout(() => {
>   setA(1);
>   setB(2);
> }, 1000);
> ```
>
> Trên React 17 và React 18 thì component render bao nhiêu lần?

### Giải thích lý thuyết

**Batching** = nhiều `setState` trong cùng một event được gộp thành 1 render.

| React 17                            | React 18                                  |
| ----------------------------------- | ----------------------------------------- |
| Batch chỉ trong event handler React | Batch ở **mọi context** (timeout, Promise, native event) |
| → 2 setState trong timeout = 2 render | → 2 setState trong timeout = 1 render    |

Muốn opt-out batching (hiếm khi cần) → `flushSync`.

### Code minh hoạ

```javascript
// React 17 — không batch trong async
setTimeout(() => {
  setA(1); // re-render 1
  setB(2); // re-render 2
}, 1000);

// React 18 — automatic batching ở mọi context
setTimeout(() => {
  setA(1);
  setB(2); // chỉ 1 re-render
}, 1000);

fetch("/api").then(() => {
  setA(1);
  setB(2); // 1 re-render
});

document.addEventListener("click", () => {
  setA(1);
  setB(2); // 1 re-render
});

// Opt-out với flushSync (cần update DOM ngay)
import { flushSync } from "react-dom";

flushSync(() => setCount((c) => c + 1));
// DOM đã update tại đây
node.scrollTop = node.scrollHeight; // an toàn

// Bị batch khi không nên: animation
function ScrollToBottom() {
  setMessages([...messages, newMsg]);
  // ❌ Chưa render xong, scroll sai
  ref.current.scrollTop = ref.current.scrollHeight;
}

function FixedScroll() {
  flushSync(() => setMessages([...messages, newMsg]));
  // ✅ Render xong, DOM updated
  ref.current.scrollTop = ref.current.scrollHeight;
}
```

### Đáp án mẫu

> "Trên React 17, 2 setState trong setTimeout → 2 re-render vì React 17 chỉ batch trong event handler React, không batch trong async context. Trên React 18, **automatic batching** áp dụng mọi context — timeout, Promise, native event đều được batch → 1 re-render. Tính năng này giảm thiểu re-render thừa mà không cần dev làm gì, nhưng có thể break code cũ phụ thuộc vào việc render xong sau mỗi setState (đặc biệt code scroll/measure DOM). Khi cần render đồng bộ ngay (ví dụ scroll to bottom sau khi add message), dùng `flushSync` để opt-out batching cho lệnh đó. Em chỉ dùng `flushSync` cho integration với DOM API như scroll, không lạm dụng vì nó kill performance."

---

## Câu 4: `React.memo`, `useMemo`, `useCallback` — sự thật về tối ưu `[Senior]`

### Câu hỏi

> Em thấy nhiều codebase wrap mọi component bằng `React.memo` và mọi callback bằng `useCallback`. Em có làm vậy không? Khi nào nên, khi nào không?

### Giải thích lý thuyết

`React.memo` skip re-render nếu **props shallow-equal**. Để memo có tác dụng:

1. Component thực sự đáng skip (render đắt).
2. Props phải **stable** giữa render (primitive value, hoặc object/function được memo).

Vấn đề chung của codebase "memo everywhere":
- Mỗi memo có cost so sánh shallow.
- Một prop sai (function inline không memo) → memo vô tác dụng.
- Tăng cognitive load, code review khó.

### Code minh hoạ

```javascript
// ❌ Memo vô tác dụng — onClick mới mỗi render
const Button = React.memo(function Button({ onClick, label }) {
  return <button onClick={onClick}>{label}</button>;
});

function Parent() {
  const [count, setCount] = useState(0);
  return (
    <>
      <Button onClick={() => doSomething()} label="Click" />
      {/* arrow function MỚI mỗi render → memo skip không hoạt động */}
    </>
  );
}

// ✅ Memo + useCallback
function Parent2() {
  const handleClick = useCallback(() => doSomething(), []);
  return <Button onClick={handleClick} label="Click" />;
}

// ❌ Memo vô tác dụng — children là JSX (object mới mỗi render)
const Card = React.memo(function Card({ children }) { return <div>{children}</div>; });

function Parent3() {
  return <Card><div>Hello</div></Card>; // div MỚI mỗi render → Card re-render
}

// ✅ Đáng memo: pure expensive list item
const Row = React.memo(function Row({ user, onSelect }) {
  // Expensive computation
  const initials = expensiveCompute(user);
  return <div onClick={() => onSelect(user.id)}>{initials}</div>;
}, (prev, next) => prev.user.id === next.user.id && prev.user.name === next.user.name);

// React Compiler (React 19) — tự memoize
// Component và hooks không cần wrap thủ công, compiler phân tích deps và inject memo
```

### Đáp án mẫu

> "Em không memo mọi thứ. `React.memo` chỉ hiệu quả khi: thứ nhất, component render đắt thực sự (đo bằng Profiler, không guess); thứ hai, mọi prop phải stable. Bẫy phổ biến nhất em từng debug: team wrap `React.memo` quanh component, nhưng vẫn truyền `onClick={() => ...}` inline — function mới mỗi render → memo skip vô tác dụng, chỉ thêm overhead. Quy tắc của em: bắt đầu **không** memo. Chỉ wrap khi React DevTools Profiler chỉ ra component re-render gây lag thực sự. React 19 có React Compiler tự memoize — đang dần xoá nhu cầu wrap tay. Ngay bây giờ thì viết code rõ ràng, đo, rồi mới tối ưu."

---

## Câu 5: Virtual DOM — sự thật và hiểu lầm `[Senior]`

### Câu hỏi

> "Virtual DOM nhanh hơn DOM thật" — câu này đúng hay sai? Em giải thích.

### Giải thích lý thuyết

Quan niệm "VDOM nhanh hơn DOM" là **không chính xác**. Sự thật:

- VDOM = JS object đại diện UI. Tạo và diff VDOM cũng tốn CPU.
- VDOM giúp dev viết **declarative** (mô tả UI, không phải mutation thủ công).
- React batch các update DOM thành ít operation hơn — đây mới là điểm thắng.
- Mutation DOM trực tiếp (vanilla) có thể nhanh hơn React nếu update chính xác đến node.

Lý do thực sự React dùng VDOM:
- Cross-platform abstraction (React Native, React DOM).
- Declarative API — dễ maintain hơn imperative.
- Cho phép feature như batching, concurrent mode, suspense.

### Code minh hoạ

```javascript
// Vanilla DOM — update trực tiếp, nhanh nhất nếu làm đúng
const counter = document.getElementById("counter");
counter.textContent = "42"; // 1 thao tác DOM

// React — virtual DOM → diff → patch
function Counter() {
  const [n, setN] = useState(42);
  return <div id="counter">{n}</div>;
}
// React: tạo new VDOM tree → diff với old → identify chỉ text node thay đổi → patch
// Tốn CPU cho VDOM, nhưng dev viết declarative ngắn gọn

// React vs Vanilla: chỉ thắng khi UI phức tạp + nhiều update batch lại
// Đơn giản 1 phần tử update → vanilla nhanh hơn

// Modern alternatives (Solid, Svelte) — fine-grained reactivity, không VDOM
// Update chính xác node thay đổi, bỏ qua diffing
// Trade-off: compile-time setup phức tạp hơn

// React 19 với React Compiler giảm overhead VDOM thêm — chỉ re-render đúng phần cần
```

### Đáp án mẫu

> "Không hoàn toàn đúng. Virtual DOM là JS object, tạo và diff vẫn tốn CPU. Mutation DOM trực tiếp với code tối ưu có thể nhanh hơn React. Lý do thực sự React thắng không phải tốc độ raw, mà là **batching + declarative + cross-platform**. Dev viết 'UI là function của state', React lo phần khó: diff, batch update, schedule. Kết quả: code dễ maintain hơn vanilla 100 lần, performance đủ tốt cho 95% use case. Frameworks mới như Solid, Svelte bỏ VDOM, dùng fine-grained reactivity — thường nhanh hơn React trong benchmark vì update precise đến node. Nhưng trade-off: setup phức tạp hơn, ecosystem nhỏ hơn. Trả lời câu hỏi: 'VDOM nhanh hơn DOM' là marketing, không phải kỹ thuật."

---

## Câu 6: Concurrent Rendering & `useTransition` `[Senior]`

### Câu hỏi

> Em đã dùng `useTransition` chưa? Concurrent rendering trong React 18 cho phép làm gì mà trước không làm được?

### Giải thích lý thuyết

Trước React 18, render là **synchronous + blocking**: bắt đầu render → không thể dừng → chặn main thread cho đến khi xong.

Concurrent rendering cho phép React:
- **Interrupt** render đang chạy nếu có update ưu tiên cao hơn.
- **Schedule** render với priority khác nhau.
- **Cancel** render không cần thiết.

API user-facing:
- `useTransition` / `startTransition` — đánh dấu update "không khẩn cấp" (UI update lớn).
- `useDeferredValue` — defer value, UI vẫn responsive với input mới.
- `Suspense` với data fetching — show fallback trong khi load.

### Code minh hoạ

```javascript
// Vấn đề trước concurrent: input lag khi list lớn
function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  return (
    <>
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setResults(expensiveFilter(allItems, e.target.value)); // chặn typing
        }}
      />
      <List items={results} />
    </>
  );
}

// Fix với useTransition
function SearchFast() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value); // urgent — UI input responsive ngay
          startTransition(() => {
            // không khẩn cấp — React có thể interrupt nếu có input mới
            setResults(expensiveFilter(allItems, e.target.value));
          });
        }}
      />
      {isPending && <Spinner />}
      <List items={results} />
    </>
  );
}

// useDeferredValue — đơn giản hơn, không cần wrap update
function SearchDeferred({ query }) {
  const deferredQuery = useDeferredValue(query);
  // deferredQuery "trễ" so với query — render List dùng cái này
  const results = useMemo(() => expensiveFilter(allItems, deferredQuery), [deferredQuery]);
  return <List items={results} />;
}

// Suspense + data fetching (React 19)
function UserProfile({ id }) {
  const user = use(fetchUser(id)); // throw Promise nếu chưa có
  return <div>{user.name}</div>;
}

<Suspense fallback={<Spinner />}>
  <UserProfile id={1} />
</Suspense>
```

### Đáp án mẫu

> "Concurrent rendering cho phép React **interrupt và reschedule** render. Trước React 18, render là sync block — list lớn render xong main thread mới giải phóng để xử lý input → input lag. Với `useTransition`, em đánh dấu update nào không khẩn cấp (filter list) — React tạm dừng nó khi có input mới, ưu tiên responsive. Use case kinh điển: search box với list filter — gõ chữ smooth dù list filter chạy chậm. `useDeferredValue` là API đơn giản hơn cho cùng pattern — không cần wrap update, chỉ defer giá trị. `Suspense` thì cho phép tách 'data đang load' ra ngoài component, show fallback declaratively. React 19 với hook `use()` mới còn cho phép `await` Promise ngay trong component."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                  | Đúng là                                                              |
| -------------------------------------------------------- | -------------------------------------------------------------------- |
| "Re-render = DOM update"                                 | Re-render compute VDOM; DOM chỉ update phần diff                     |
| "Index key OK nếu list không quá dài"                    | Bug xảy ra dựa trên reorder, không phải độ dài                       |
| "`React.memo` luôn cải thiện performance"                | Cost vs benefit; cần đo Profiler trước khi wrap                      |
| "VDOM nhanh hơn DOM"                                     | Marketing claim. Thực ra trade-off declarative > raw speed           |
| "`useTransition` thay thế debounce"                      | Không — debounce delay; useTransition interrupt. Đôi khi combine cả 2 |
