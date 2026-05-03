---
sidebar_position: 2
title: "2. Virtual DOM, Reconciliation, React Fiber"
---

# Virtual DOM, Reconciliation, React Fiber

Khi phỏng vấn React ở level senior, bạn sẽ gặp các câu hỏi về cách React hoạt động bên dưới -- Virtual DOM, diffing algorithm, Fiber architecture, và Concurrent features. Đây là những kiến thức giúp bạn hiểu **tại sao** React nhanh, chứ không chỉ **cách dùng** React.

---

## Mục lục

- [Câu 1: Virtual DOM là gì? Tại sao React cần nó? `[Intermediate]`](#câu-1-virtual-dom-là-gì-tại-sao-react-cần-nó-intermediate)
- [Câu 2: Reconciliation Algorithm (Diffing) hoạt động như thế nào? `[Senior]`](#câu-2-reconciliation-algorithm-diffing-hoạt-động-như-thế-nào-senior)
- [Câu 3: React Fiber là gì? Tại sao React cần viết lại core algorithm? `[Senior]`](#câu-3-react-fiber-là-gì-tại-sao-react-cần-viết-lại-core-algorithm-senior)
- [Câu 4: Key prop -- tại sao quan trọng? Khi nào dùng index làm key là ok? `[Intermediate]`](#câu-4-key-prop-tại-sao-quan-trọng-khi-nào-dùng-index-làm-key-là-ok-intermediate)
- [Câu 5: Điều gì trigger re-render trong React? Batching hoạt động ra sao? `[Intermediate]`](#câu-5-điều-gì-trigger-re-render-trong-react-batching-hoạt-động-ra-sao-intermediate)
- [Câu 6: Concurrent Features -- useTransition và useDeferredValue `[Senior]`](#câu-6-concurrent-features-usetransition-và-usedeferredvalue-senior)
- [Lỗi thường gặp khi trả lời](#lỗi-thường-gặp-khi-trả-lời)

---

## Câu 1: Virtual DOM là gì? Tại sao React cần nó? `[Intermediate]`

### Giải thích lý thuyết

**Virtual DOM (VDOM)** là một cây JavaScript object mô tả cấu trúc UI. Mỗi khi state thay đổi, React tạo một cây VDOM mới, **so sánh** với cây cũ (diffing), rồi chỉ cập nhật những phần DOM thật sự thay đổi (patching).

Tại sao cần? Vì thao tác DOM thật (Real DOM) rất **chậm** -- mỗi lần thay đổi DOM, browser phải tính lại layout, paint, composite. Với VDOM, React **gom nhóm** (batch) các thay đổi và chỉ apply một lần, giảm số lần browser phải làm việc.

**Lưu ý quan trọng**: VDOM không phải lúc nào cũng nhanh hơn thao tác DOM trực tiếp. Frameworks như Svelte hay SolidJS không dùng VDOM mà vẫn nhanh. Lợi thế của VDOM là cho phép viết code **declarative** mà vẫn có performance tốt.

### Code ví dụ

```tsx
// Khi bạn viết JSX như này:
function App() {
  return (
    <div className="app">
      <h1>Hello</h1>
      <p>World</p>
    </div>
  );
}

// React chuyển thành VDOM object (đơn giản hóa):
// {
//   type: 'div',
//   props: {
//     className: 'app',
//     children: [
//       { type: 'h1', props: { children: 'Hello' } },
//       { type: 'p', props: { children: 'World' } }
//     ]
//   }
// }

// Khi state thay đổi, React tạo cây VDOM mới, diff với cây cũ,
// và chỉ update phần khác biệt trên Real DOM.
```

### Đáp án mẫu

> "Virtual DOM là một lightweight JavaScript representation của Real DOM. Khi state thay đổi, React tạo VDOM mới, dùng reconciliation algorithm để tìm sự khác biệt với VDOM cũ, rồi batch update Real DOM. Điều này cho phép viết code declarative trong khi vẫn có performance tốt. Tuy nhiên, VDOM có overhead riêng -- nó là trade-off giữa developer experience và raw performance."

---

## Câu 2: Reconciliation Algorithm (Diffing) hoạt động như thế nào? `[Senior]`

### Giải thích lý thuyết

Diffing algorithm của React dựa trên 2 giả định (heuristics) để đạt O(n) thay vì O(n^3):

1. **Hai element khác type** => destroy cây cũ, build cây mới hoàn toàn
2. **Hai element cùng type** => giữ nguyên DOM node, chỉ update attributes/props thay đổi
3. **key prop** giúp React nhận diện element nào đã thay đổi/thêm/xóa trong danh sách

**Quy trình diffing**:

- So sánh root element trước
- Nếu cùng type: diff props, rồi diff children đệ quy
- Nếu khác type: unmount cây cũ, mount cây mới
- Với danh sách children: dùng `key` để matching. Không có key => so sánh theo thứ tự (index)

### Code ví dụ

```tsx
// Case 1: Khác type => destroy và rebuild
// Trước
<div>
  <Counter />
</div>

// Sau -- React destroy Counter và tạo mới span + Counter
<span>
  <Counter />
</span>

// Case 2: Cùng type => chỉ update props
// Trước
<div className="old" title="stuff" />
// Sau -- React chỉ update className, giữ nguyên DOM node
<div className="new" title="stuff" />

// Case 3: List không có key (CHẬM)
// React so sánh theo index, nên insert đầu danh sách
// sẽ khiến TẤT CẢ items re-render
<ul>
  <li>Duke</li>   {/* index 0 */}
  <li>Villanova</li> {/* index 1 */}
</ul>
// Thêm "Connecticut" ở đầu => React tưởng: Duke->Connecticut, Villanova->Duke, thêm Villanova
// => Update 2 items + insert 1 = 3 operations

// Case 4: List CÓ key (NHANH)
<ul>
  <li key="duke">Duke</li>
  <li key="villanova">Villanova</li>
</ul>
// Thêm "Connecticut" ở đầu => React biết chỉ cần insert 1 item mới
// => 1 operation
<ul>
  <li key="connecticut">Connecticut</li>
  <li key="duke">Duke</li>
  <li key="villanova">Villanova</li>
</ul>
```

### Đáp án mẫu

> "React reconciliation dùng 2 heuristics để đạt O(n): khác type thì rebuild, cùng type thì diff props. Với danh sách, key prop giúp React map element cũ với mới một cách chính xác, tránh unnecessary re-renders. Không nên dùng index làm key khi danh sách có thể thay đổi thứ tự, vì nó làm sai lệch việc matching và gây bug."

---

## Câu 3: React Fiber là gì? Tại sao React cần viết lại core algorithm? `[Senior]`

### Giải thích lý thuyết

**React Fiber** là phiên bản viết lại hoàn toàn của reconciliation engine, ra mắt từ React 16. Trước Fiber, reconciliation là **đồng bộ** (synchronous) -- khi bắt đầu render, React phải chạy hết mới dừng được. Với component tree lớn, điều này làm **block main thread**, gây lag UI.

**Fiber** biến render thành **incremental** -- có thể:

- **Chia nhỏ** công việc thành các "units of work"
- **Tạm dừng** và tiếp tục sau
- **Ưu tiên** công việc (user input > animation > data fetching)
- **Hủy** công việc không còn cần

Mỗi Fiber node là một JavaScript object đại diện cho một component, chứa thông tin về type, state, props, parent, child, sibling, và effect flags.

**2 phase của Fiber**:

1. **Render phase** (có thể bị interrupt): tạo Fiber tree mới, diff với cây cũ, đánh dấu changes. Không thay đổi DOM.
2. **Commit phase** (đồng bộ, không bị interrupt): apply tất cả changes lên Real DOM một lần.

### Code ví dụ

```tsx
// Fiber node (đơn giản hóa) -- đây là cấu trúc nội bộ React
// {
//   type: 'div',               // Component type
//   key: null,
//   stateNode: HTMLDivElement,  // DOM node thực tế
//   child: Fiber | null,       // Con đầu tiên
//   sibling: Fiber | null,     // Anh em kế tiếp
//   return: Fiber | null,      // Parent
//   pendingProps: {},           // Props mới
//   memoizedProps: {},          // Props cũ
//   memoizedState: {},          // State hiện tại
//   flags: 0,                  // Side effect flags (Placement, Update, Deletion)
//   lanes: 0,                  // Priority level
// }

// Ví dụ: component tree
function App() {
  return (
    <div>
      <Header />
      <Main>
        <Article />
        <Sidebar />
      </Main>
    </div>
  );
}

// Fiber duyệt theo thứ tự: App -> div -> Header -> Main -> Article -> Sidebar
// Mỗi node là 1 unit of work, có thể pause giữa các nodes
```

### Đáp án mẫu

> "Fiber là phiên bản viết lại của React reconciler để hỗ trợ incremental rendering. Nó chia công việc thành các units nhỏ, có thể pause, resume, và prioritize. Fiber có 2 phase: render phase (có thể interrupt, tính toán changes) và commit phase (đồng bộ, apply DOM). Điều này là nền tảng cho Concurrent features như useTransition và Suspense."

---

## Câu 4: Key prop -- tại sao quan trọng? Khi nào dùng index làm key là ok? `[Intermediate]`

### Giải thích lý thuyết

`key` giúp React **identify** element nào đã thay đổi, được thêm, hoặc bị xóa trong một danh sách. Không có key, React dùng **index** làm key mặc định, và điều này có thể gây:

1. **Performance xấu**: khi insert đầu danh sách, tất cả items bị "shift" index => React tưởng tất cả đều thay đổi
2. **Bug**: khi items có internal state (input values, checkbox state), state bị gán sai cho item khác

**Khi nào dùng index là ok?**

- Danh sách **static** (không thêm/xóa/sắp xếp)
- Items **không có** internal state
- Items **không bao giờ** thay đổi thứ tự

### Code ví dụ

```tsx
// BUG với index key
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: "Learn React" },
    { id: 2, text: "Build app" },
  ]);

  const addTodo = () => {
    // Thêm item vào ĐẦU danh sách
    setTodos([{ id: Date.now(), text: "New todo" }, ...todos]);
  };

  return (
    <ul>
      {/* SAI: dùng index làm key */}
      {todos.map((todo, index) => (
        <li key={index}>
          {/* Input state sẽ bị "nhầm" khi thêm item ở đầu */}
          <input defaultValue={todo.text} />
        </li>
      ))}

      {/* ĐÚNG: dùng unique ID */}
      {todos.map((todo) => (
        <li key={todo.id}>
          <input defaultValue={todo.text} />
        </li>
      ))}
    </ul>
  );
}

// Key còn dùng để "reset" component
function UserProfile({ userId }: { userId: string }) {
  // Khi userId thay đổi, key thay đổi => React unmount và mount mới component
  // => tất cả internal state được reset
  return <Profile key={userId} userId={userId} />;
}
```

### Đáp án mẫu

> "key giúp React track element trong danh sách qua các lần render. Dùng unique, stable ID làm key -- không dùng index khi danh sách có thể thay đổi thứ tự hoặc items có internal state. key còn được dùng để force reset component bằng cách thay đổi key. Một mẹo hay là dùng key trên component để reset state thay vì dùng useEffect."

---

## Câu 5: Điều gì trigger re-render trong React? Batching hoạt động ra sao? `[Intermediate]`

### Giải thích lý thuyết

**Các trigger re-render**:

1. `setState` / `dispatch` được gọi
2. Parent component re-render (mặc định, tất cả children re-render)
3. Context value thay đổi (tất cả consumers re-render)
4. Custom hook state thay đổi

**KHÔNG trigger re-render**:

- Thay đổi `ref.current`
- Thay đổi biến ngoài component
- Thay đổi props của component (chỉ khi parent re-render truyền props mới)

**Batching** (từ React 18):

- Tất cả state updates được gom lại, chỉ render 1 lần
- Áp dụng trong mọi ngữ cảnh: event handlers, setTimeout, Promises, native events
- Dùng `flushSync` nếu cần force render ngay (hiếm khi cần)

### Code ví dụ

```tsx
import { useState } from "react";
import { flushSync } from "react-dom";

function BatchingExample() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  console.log("Render!"); // Chỉ log 1 lần cho mỗi click

  const handleClick = () => {
    // React 18: batched => 1 render
    setCount((c) => c + 1);
    setFlag((f) => !f);
    // 2 state updates, 1 render
  };

  const handleAsync = () => {
    setTimeout(() => {
      // React 18: VẪN batched => 1 render
      setCount((c) => c + 1);
      setFlag((f) => !f);
    }, 100);
  };

  // Force immediate render (hiếm khi cần)
  const handleFlush = () => {
    flushSync(() => {
      setCount((c) => c + 1);
    });
    // DOM đã update tại đây
    console.log("DOM updated with new count");

    flushSync(() => {
      setFlag((f) => !f);
    });
    // => 2 renders riêng biệt
  };

  return <button onClick={handleClick}>{count}</button>;
}

// Parent re-render => children re-render (kể cả khi props không đổi)
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>+</button>
      {/* Child re-render mỗi lần Parent render, dù name không đổi */}
      <Child name="static" />
    </div>
  );
}

function Child({ name }: { name: string }) {
  console.log("Child rendered!"); // Log mỗi lần parent click
  return <p>{name}</p>;
}
```

### Đáp án mẫu

> "Re-render xảy ra khi state thay đổi, parent re-render, hoặc context value thay đổi. Từ React 18, tất cả state updates đều được automatic batching -- kể cả trong async code. Dùng React.memo để ngăn child re-render khi props không đổi. flushSync có thể force immediate render nhưng hiếm khi cần dùng."

---

## Câu 6: Concurrent Features -- useTransition và useDeferredValue `[Senior]`

### Giải thích lý thuyết

**Concurrent React** cho phép React **ngắt** render không khẩn cấp để xử lý công việc khẩn cấp trước (như user input). 2 hooks chính:

**useTransition**:

- Đánh dấu state update là "non-urgent" (transition)
- React ưu tiên render urgent updates trước (như typing)
- Trả về `[isPending, startTransition]`

**useDeferredValue**:

- Tạo một phiên bản "lag" của giá trị
- Giống useTransition nhưng cho **giá trị** thay vì **action**
- Hữu ích khi không kiểm soát được state update (VD: props từ parent)

### Code ví dụ

```tsx
import { useState, useTransition, useDeferredValue, memo } from "react";

// useTransition: ưu tiên input, defer kết quả tìm kiếm
function SearchPage() {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Urgent: cập nhật input ngay lập tức
    setQuery(e.target.value);

    // Non-urgent: cập nhật kết quả tìm kiếm
    startTransition(() => {
      // React có thể interrupt render này nếu có input mới
      setSearchResults(filterResults(e.target.value));
    });
  };

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <p>Đang tìm kiếm...</p>}
      <SearchResults />
    </div>
  );
}

// useDeferredValue: defer giá trị heavy to render
function SearchResults({ query }: { query: string }) {
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  // HeavyList render với giá trị "cũ" trong khi user đang gõ
  // Khi user ngừng gõ, React render lại với giá trị mới
  return (
    <div style={{ opacity: isStale ? 0.7 : 1 }}>
      <HeavyList query={deferredQuery} />
    </div>
  );
}

const HeavyList = memo(({ query }: { query: string }) => {
  // Giả sử: render 10,000 items
  const items = generateItems(query); // heavy computation

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
});
```

### Bảng so sánh

| Tiêu chí  | `useTransition`                | `useDeferredValue`                 |
| --------- | ------------------------------ | ---------------------------------- |
| Kiểm soát | **State update** (action)      | **Giá trị** (value)                |
| Khi dùng  | Khi bạn kiểm soát setState     | Khi nhận giá trị từ props/parent   |
| Trả về    | `[isPending, startTransition]` | Deferred value                     |
| isPending | Có                             | Tự tính: `value !== deferredValue` |
| Ví dụ     | Filter khi search              | Defer props cho heavy child        |

### Đáp án mẫu

> "Concurrent features cho phép React ưu tiên công việc quan trọng (user input) và defer công việc ít khẩn cấp (render danh sách lớn). useTransition đánh dấu state update là non-urgent, useDeferredValue tạo phiên bản 'lag' của giá trị. Cả hai giúp giữ UI responsive khi render nặng. Chúng là nền tảng của Fiber architecture -- khả năng interrupt và prioritize render."

---

## Lỗi thường gặp khi trả lời

1. **Nói "Virtual DOM nhanh hơn Real DOM"** -- Không chính xác. VDOM có overhead riêng. Đúng hơn là "VDOM cho phép declarative code với performance chấp nhận được bằng cách batch DOM updates."

2. **Không biết Fiber là gì** -- Fiber là nền tảng của React hiện đại. Nếu bạn dùng useTransition, Suspense, hay bất kỳ concurrent feature nào, bạn đang dùng Fiber.

3. **Nhầm "render" với "DOM update"** -- Render phase tính toán VDOM, commit phase mới update DOM. Component có thể render nhiều lần mà DOM không đổi.

4. **Dùng index làm key rồi nói "không sao đâu"** -- Chỉ ok khi danh sách static. Với danh sách dynamic, index key gây bug khó debug liên quan đến internal state.

5. **Không biết batching trong React 18** -- Trước 18, chỉ batch trong event handlers. Từ 18, automatic batching mọi nơi. Đây là thay đổi quan trọng cần biết.

6. **Nhầm useTransition và useDeferredValue** -- useTransition cho action (setState), useDeferredValue cho value (props). Chọn sai hook sẽ không đạt hiệu quả mong muốn.
