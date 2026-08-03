---
sidebar_position: 7
title: "7. JSX & Render cơ bản"
---

# JSX & Render cơ bản

> *Trước khi đi sâu vào hooks hay performance, mọi thứ đều bắt đầu từ JSX — hiểu đúng nền tảng này giúp bạn tránh hàng chục lỗi thường gặp khi viết React.*

:::note[Ghi nhớ nhanh]

- ⭐ **JSX không phải HTML** — nó được Babel/TypeScript transpile thành `React.createElement(...)`; trình duyệt không hiểu JSX trực tiếp.
- **JSX chỉ nhận expression** — dùng được biến/hàm/ternary trong `{}`, nhưng không đặt statement (if, for) trực tiếp.
- **Conditional rendering** — dùng `&&`, ternary hoặc biến; lưu ý `0`/`NaN` với `&&` có thể render ra số.
- **Render ra gì** — `null`, `undefined`, `false`, chuỗi rỗng không render gì; component có thể return string, number, array, `Fragment`.
- **`Fragment`** (`<>...</>`) — nhóm nhiều element mà không thêm DOM node thừa.
- **`props.children`** — nội dung lồng giữa thẻ mở/đóng của component, cho phép composition.

:::

---

## Câu 1: JSX là gì và tại sao React sử dụng nó? `[Basic]`

### Câu hỏi

> Bạn có thể giải thích JSX là gì không? Tại sao React chọn dùng JSX thay vì HTML thuần?

### Giải thích lý thuyết

**JSX** (JavaScript XML) là một cú pháp mở rộng của JavaScript, cho phép viết cấu trúc giống HTML ngay bên trong file `.js` hoặc `.tsx`. JSX **không phải** HTML thật — trình duyệt không hiểu nó. Nó cần được transpile (biên dịch) bởi Babel hoặc TypeScript thành các lời gọi JavaScript thuần.

Lý do React chọn JSX:

- **Kết hợp UI và logic:** HTML và JavaScript logic nằm cùng một chỗ, dễ đọc và bảo trì hơn so với tách thành template riêng biệt.
- **Tận dụng toàn bộ sức mạnh JavaScript:** Có thể dùng biến, biểu thức, hàm, destructuring ngay bên trong markup.
- **Phát hiện lỗi sớm:** Vì JSX được compile, nhiều lỗi cú pháp được bắt ở build time thay vì runtime.
- **Không phải template engine:** Không có cú pháp `{{}}` đặc biệt hay directive — chỉ là JavaScript.

JSX là tùy chọn trong React — bạn có thể viết `React.createElement(...)` trực tiếp — nhưng JSX làm code dễ đọc hơn rất nhiều.

### Code minh hoạ

```jsx
// ✅ Viết bằng JSX (dễ đọc)
function Welcome({ name }) {
  return (
    <div className="card">
      <h1>Xin chào, {name}!</h1>
      <p>Chào mừng bạn đến với React.</p>
    </div>
  );
}

// Tương đương khi KHÔNG dùng JSX (khó đọc hơn)
function WelcomeNoJSX({ name }) {
  return React.createElement(
    "div",
    { className: "card" },
    React.createElement("h1", null, "Xin chào, ", name, "!"),
    React.createElement("p", null, "Chào mừng bạn đến với React.")
  );
}
```

### Đáp án mẫu

> "JSX là cú pháp mở rộng JavaScript cho phép viết UI trông giống HTML trong file JS. Trình duyệt không đọc được JSX — nó cần được Babel biên dịch thành `React.createElement(...)`. React dùng JSX vì nó giúp kết hợp UI và logic ở cùng một nơi, tận dụng toàn bộ sức mạnh JavaScript mà không cần template engine riêng. Kết quả là code dễ đọc, dễ debug hơn."

---

## Câu 2: JSX được transpile (biên dịch) thành gì? Cho ví dụ minh họa. `[Basic]`

### Câu hỏi

> Khi bạn viết JSX, thứ thực sự chạy trong trình duyệt là gì? Hãy cho tôi xem JSX được biên dịch ra sao.

### Giải thích lý thuyết

Từ React 17 trở đi, Babel không còn transpile JSX thành `React.createElement` mà thành `_jsx` từ package `react/jsx-runtime`. Điều này có nghĩa là **không cần import React** ở đầu mỗi file nữa (trước đây bắt buộc).

Cả hai dạng đều tạo ra một **React element** — một plain JavaScript object mô tả UI:

```js
{
  type: "div",        // tag hoặc component
  props: { ... },     // các thuộc tính
  key: null,
  ref: null,
}
```

React dùng các object này để xây dựng Virtual DOM, rồi so sánh (diffing) và cập nhật DOM thật.

### Code minh hoạ

```jsx
// ✅ Bạn viết (JSX)
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Đã bấm: {count} lần
    </button>
  );
}

// Babel biên dịch thành (React 17+ transform)
import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return _jsx("button", {
    onClick: () => setCount(count + 1),
    children: ["Đã bấm: ", count, " lần"],
  });
}

// Kết quả là một React element object:
// {
//   type: "button",
//   props: {
//     onClick: [Function],
//     children: ["Đã bấm: ", 0, " lần"]
//   }
// }
```

### Đáp án mẫu

> "JSX được Babel biên dịch thành lời gọi hàm JavaScript. Từ React 17+, thay vì `React.createElement` thì dùng `_jsx` từ `react/jsx-runtime`, nên không cần import React thủ công nữa. Kết quả là một plain JavaScript object gọi là React element, mô tả type, props và children của node UI. React dùng các element này để dựng Virtual DOM và so sánh với DOM thật khi re-render."

---

## Câu 3: Conditional rendering trong React được thực hiện như thế nào? `[Basic]`

### Câu hỏi

> Trong React, làm thế nào để render một component chỉ khi điều kiện đúng? Có những cách nào?

### Giải thích lý thuyết

Vì JSX chỉ là JavaScript, React tận dụng các cấu trúc điều kiện thông thường. Có 4 cách phổ biến:

1. **`if/else` bên ngoài return** — dùng khi logic phức tạp.
2. **Toán tử `&&` (short-circuit)** — render phần bên phải nếu điều kiện đúng. Chú ý: nếu điều kiện là số `0`, React sẽ **render số 0** ra màn hình (gotcha phổ biến).
3. **Toán tử ba ngôi `? :`** — dùng khi cần hai nhánh.
4. **Hàm trả về JSX** — tái sử dụng, giữ JSX chính gọn hơn.

### Code minh hoạ

```jsx
function UserGreeting({ user, count }) {
  // Cách 1: if/else bên ngoài (tốt cho logic phức tạp)
  if (!user) {
    return <p>Vui lòng đăng nhập.</p>;
  }

  return (
    <div>
      {/* Cách 2: toán tử && */}
      {user.isAdmin && <span className="badge">Admin</span>}

      {/* ❌ Gotcha: nếu count = 0, sẽ render ra số 0 trên màn hình */}
      {count && <p>Có {count} thông báo</p>}

      {/* ✅ Sửa: ép kiểu boolean để tránh render số 0 */}
      {count > 0 && <p>Có {count} thông báo</p>}
      {!!count && <p>Có {count} thông báo</p>}

      {/* Cách 3: toán tử ba ngôi */}
      {user.isVerified ? (
        <p>Tài khoản đã xác minh.</p>
      ) : (
        <p>Chưa xác minh. <a href="/verify">Xác minh ngay</a></p>
      )}
    </div>
  );
}
```

### Đáp án mẫu

> "React không có directive riêng cho conditional rendering — mình dùng JavaScript thuần. Ba cách chính: `if/else` bên ngoài return cho logic phức tạp; toán tử `&&` cho một nhánh đơn giản (cẩn thận với giá trị falsy là số, vì `0 && ...` render ra số 0); toán tử ba ngôi `? :` khi cần hai nhánh. Tôi thích dùng `if` sớm return null để giữ phần render chính gọn hơn."

---

## Câu 4: React Fragment là gì và khi nào nên sử dụng? `[Basic]`

### Câu hỏi

> Bạn có biết React Fragment không? Tại sao lại cần nó thay vì dùng một `div` bao ngoài?

### Giải thích lý thuyết

**React Fragment** (`<Fragment>` hoặc cú pháp rút gọn `<>...</>`) là một "container vô hình" — nhóm nhiều element lại mà **không tạo thêm DOM node thật**.

Khi nào dùng Fragment:
- Một component cần return nhiều element nhưng không muốn thêm `div` thừa vào DOM.
- Cấu trúc HTML yêu cầu các element là con trực tiếp (ví dụ: `td` trong `tr`, `li` trong `ul`).
- Giảm DOM nesting không cần thiết, cải thiện hiệu năng và CSS layout.

Fragment dài (`<Fragment key={...}>`) cần thiết khi render danh sách và cần truyền `key` prop.

### Code minh hoạ

```jsx
import { Fragment } from "react";

// ❌ Thêm div thừa vào DOM — phá vỡ cấu trúc table
function TableRows({ items }) {
  return (
    <div>
      <tr><td>{items[0]}</td></tr>
      <tr><td>{items[1]}</td></tr>
    </div>
  );
}

// ✅ Dùng Fragment ngắn — không node thừa
function TableRows({ items }) {
  return (
    <>
      <tr><td>{items[0]}</td></tr>
      <tr><td>{items[1]}</td></tr>
    </>
  );
}

// ✅ Dùng Fragment dài khi cần truyền key (cú pháp <> không hỗ trợ key)
function DefinitionList({ terms }) {
  return (
    <dl>
      {terms.map((term) => (
        <Fragment key={term.id}>
          <dt>{term.name}</dt>
          <dd>{term.description}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
```

### Đáp án mẫu

> "Fragment là wrapper ảo, cho phép return nhiều element mà không thêm node vào DOM thật. Tôi dùng khi component cần return nhiều phần tử hoặc khi cấu trúc HTML không cho phép có thêm wrapper (như `tr` trong `table`). Cú pháp rút gọn `<>...</>` dùng khi không cần key; còn khi render list mà cần key thì phải dùng `<Fragment key={...}>`."

---

## Câu 5: Sự khác nhau giữa biểu thức (expression) và câu lệnh (statement) trong JSX là gì? `[Basic]`

### Câu hỏi

> Tại sao tôi không thể dùng `if` hay `for` trực tiếp bên trong JSX mà phải dùng cách khác?

### Giải thích lý thuyết

JSX chỉ chấp nhận **expression** (biểu thức) bên trong dấu `{}` — tức là bất cứ thứ gì trả về một giá trị.

**Expression** (có giá trị, dùng được trong JSX):
- Biến: `name`
- Phép tính: `a + b`, `count * 2`
- Toán tử ba ngôi: `condition ? a : b`
- Toán tử `&&`: `condition && element`
- Gọi hàm: `formatDate(date)`, `items.map(...)`
- IIFE (Immediately Invoked Function Expression)

**Statement** (không có giá trị, KHÔNG dùng được trong JSX):
- `if/else`
- `for`, `while`
- `switch`
- `const`, `let`, `var` khai báo biến

### Code minh hoạ

```jsx
function Demo({ items, isLoading }) {
  // ❌ KHÔNG được — if là statement, không phải expression
  // return <div>{if (isLoading) <Spinner />}</div>;

  // ❌ KHÔNG được — for là statement
  // return <ul>{for (let i of items) <li>{i}</li>}</ul>;

  // ✅ Dùng biểu thức toán tử ba ngôi thay cho if/else
  return (
    <div>
      {isLoading ? <Spinner /> : <Content />}

      {/* ✅ Dùng .map() thay cho for loop — map là hàm trả về array */}
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>

      {/* ✅ IIFE nếu thực sự cần logic phức tạp bên trong JSX */}
      {(() => {
        if (items.length === 0) return <p>Danh sách trống.</p>;
        if (items.length === 1) return <p>Chỉ có 1 phần tử.</p>;
        return <p>Có {items.length} phần tử.</p>;
      })()}
    </div>
  );
}
```

### Đáp án mẫu

> "JSX chỉ nhận expression trong `{}` vì sau khi compile, `{}` là tham số của `_jsx(...)` — một hàm chỉ nhận giá trị, không nhận câu lệnh. Vì vậy `if` và `for` không dùng được trực tiếp — phải thay bằng toán tử ba ngôi, `&&`, hoặc `.map()`. Nếu logic quá phức tạp, nên tách ra hàm riêng hoặc tính toán trước phần JSX return."

---

## Câu 6: Event handling trong JSX khác gì so với HTML thông thường? `[Basic]`

### Câu hỏi

> Bạn có thể kể ra những điểm khác biệt khi xử lý sự kiện trong JSX so với HTML thuần không?

### Giải thích lý thuyết

Có 5 điểm khác biệt chính:

| Khía cạnh | HTML thuần | JSX React |
|---|---|---|
| Tên event | `onclick`, `onchange` (chữ thường) | `onClick`, `onChange` (camelCase) |
| Giá trị | Chuỗi: `"handleClick()"` | Hàm: `{handleClick}` |
| Prevent default | `return false` trong handler | Gọi `e.preventDefault()` |
| Event object | `Event` native | `SyntheticEvent` (React wrapper) |
| Event delegation | Gắn trực tiếp lên element | React gắn một listener ở root |

**SyntheticEvent** là wrapper của React bao quanh native event, cung cấp API nhất quán trên mọi trình duyệt. Nếu cần event gốc, dùng `e.nativeEvent`.

### Code minh hoạ

```jsx
// ❌ HTML thuần — không dùng trong React
// <button onclick="handleClick()">Bấm</button>

// ✅ JSX — truyền tham chiếu hàm, không gọi hàm ngay
function Form() {
  // ❌ Sai: gọi hàm ngay khi render (thêm dấu gọi hàm)
  // <button onClick={handleClick()}>Bấm</button>

  function handleSubmit(e) {
    // ✅ Phải gọi preventDefault() — không thể dùng return false
    e.preventDefault();
    console.log("Form đã submit");
  }

  function handleChange(e) {
    // e là SyntheticEvent, truy cập giá trị qua e.target.value
    console.log(e.target.value);
    // Nếu cần event gốc:
    console.log(e.nativeEvent);
  }

  // ✅ Truyền hàm tham chiếu (không có dấu gọi hàm)
  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} />
      {/* Truyền tham số: bọc trong arrow function */}
      <button onClick={() => handleDelete(item.id)}>Xóa</button>
    </form>
  );
}
```

### Đáp án mẫu

> "Ba điểm khác biệt quan trọng nhất: một, tên event dùng camelCase như `onClick`, `onChange` thay vì chữ thường. Hai, giá trị là tham chiếu hàm thay vì chuỗi — viết `{handleClick}` không phải `'handleClick()'`. Ba, để ngăn hành vi mặc định phải gọi `e.preventDefault()` chứ không thể dùng `return false`. Ngoài ra, React gắn event listener ở root document thay vì từng element, và bọc event gốc trong SyntheticEvent để đảm bảo cross-browser compatibility."

---

## Câu 7: Spread operator trong JSX props được dùng như thế nào? `[Basic]`

### Câu hỏi

> Tôi thấy code có chỗ viết `{...props}` trong JSX. Cách này dùng để làm gì và có cần cẩn thận gì không?

### Giải thích lý thuyết

**Spread operator** (`...`) trong JSX props cho phép truyền toàn bộ các thuộc tính của một object xuống component con cùng một lúc, thay vì liệt kê từng prop.

Ưu điểm:
- Tiết kiệm code khi cần forward nhiều props (prop forwarding).
- Hữu ích khi viết wrapper component.

Rủi ro cần lưu ý:
- Có thể vô tình truyền props không liên quan xuống DOM element, gây warning (ví dụ: truyền prop `isActive` xuống `div`).
- Khó đọc — người đọc không biết component nhận những prop nào.
- Nên kết hợp với destructuring để loại bỏ props không cần forward.

### Code minh hoạ

```jsx
// ✅ Prop forwarding cơ bản — hữu ích cho wrapper component
function Button({ children, ...rest }) {
  // Destructure "children" ra riêng, spread phần còn lại xuống button
  return (
    <button className="btn" {...rest}>
      {children}
    </button>
  );
}

// Dùng Button: tất cả props như onClick, disabled... được forward tự động
<Button onClick={handleClick} disabled={isLoading} type="submit">
  Lưu
</Button>

// ✅ Merge props có kiểm soát — override className
function Card({ className, ...rest }) {
  return <div className={`card ${className ?? ""}`} {...rest} />;
}

// ❌ Tránh spread toàn bộ props từ nguồn bên ngoài xuống DOM
function BadWrapper(props) {
  // isActive không phải thuộc tính HTML hợp lệ → React cảnh báo
  return <div {...props} />;
}

// ✅ Lọc props trước khi spread xuống DOM element
function GoodWrapper({ isActive, children, ...htmlProps }) {
  return (
    <div style={{ opacity: isActive ? 1 : 0.5 }} {...htmlProps}>
      {children}
    </div>
  );
}
```

### Đáp án mẫu

> "Spread props dùng để forward toàn bộ props xuống component hoặc element con, hữu ích khi viết wrapper component. Mình thường kết hợp với destructuring: destructure ra những gì cần dùng, còn lại spread xuống. Cần cẩn thận không spread props không hợp lệ xuống DOM element thật — React sẽ cảnh báo. Ngoài ra dùng quá nhiều spread làm code khó đọc vì người xem không biết component nhận props gì."

---

## Câu 8: Sự khác biệt giữa null, undefined, false và chuỗi rỗng khi render trong JSX là gì? `[Intermediate]`

### Câu hỏi

> Nếu tôi return `null`, `undefined`, `false`, hay chuỗi rỗng `""` trong JSX, điều gì sẽ xảy ra? Chúng có giống nhau không?

### Giải thích lý thuyết

Đây là một trong những gotcha phổ biến nhất khi mới học React:

| Giá trị | Render ra DOM | Ghi chú |
|---|---|---|
| `null` | Không render gì | An toàn, phổ biến để "render nothing" |
| `undefined` | Không render gì | Như `null`, nhưng ít dùng có chủ ý hơn |
| `false` | Không render gì | Thường dùng trong conditional với `&&` |
| `""` (chuỗi rỗng) | Không render gì có thể thấy | Vẫn tạo text node rỗng trong DOM |
| `0` | **Render ra số 0** | Gotcha! `count && <El />` khi count=0 |
| `NaN` | **Render ra "NaN"** | Ít gặp hơn nhưng cũng là bẫy |

Giá trị falsy duy nhất React vẫn render ra màn hình là **số** (`0`, `NaN`).

### Code minh hoạ

```jsx
function RenderDemo({ count, name, flag }) {
  return (
    <div>
      {/* Không render gì cả — an toàn */}
      {null}
      {undefined}
      {false}
      {""}

      {/* ❌ Gotcha phổ biến: khi count = 0, render ra số 0 trên màn hình */}
      {count && <span>Có {count} thông báo</span>}

      {/* ✅ Sửa: dùng so sánh tường minh */}
      {count > 0 && <span>Có {count} thông báo</span>}

      {/* ✅ Hoặc ép về boolean */}
      {Boolean(count) && <span>Có {count} thông báo</span>}

      {/* ✅ Hoặc toán tử ba ngôi */}
      {count ? <span>Có {count} thông báo</span> : null}
    </div>
  );
}

// Component return null để không render gì
function Hidden({ isVisible, children }) {
  if (!isVisible) return null; // ✅ Không render, không chiếm không gian DOM
  return <div>{children}</div>;
}
```

### Đáp án mẫu

> "Trong JSX, `null`, `undefined`, và `false` đều không render gì lên màn hình — đây là cách thông dụng để 'render nothing'. Tuy nhiên số `0` và `NaN` thì khác — React sẽ render chúng ra text. Đây là bẫy rất phổ biến: viết `count && <El />` khi `count` là `0` sẽ render ra chữ 0 thay vì không có gì. Cách fix là so sánh tường minh `count > 0 && <El />` hoặc dùng toán tử ba ngôi."

---

## Câu 9: `props.children` là gì và cách sử dụng như thế nào? `[Basic]`

### Câu hỏi

> Tôi thấy nhiều component dùng `props.children`. Bạn có thể giải thích nó là gì và khi nào thì cần dùng không?

### Giải thích lý thuyết

**`props.children`** là một prop đặc biệt mà React tự động truyền vào — giá trị của nó là nội dung nằm **giữa thẻ mở và thẻ đóng** của component khi dùng nó.

`children` có thể là:
- Một React element đơn lẻ
- Một mảng các element
- Chuỗi văn bản
- Hàm (pattern: render props)
- `null` hoặc `undefined` nếu không có nội dung

Dùng `children` khi muốn xây dựng **container component** — component định nghĩa layout, style, hành vi bao ngoài mà không cần biết nội dung cụ thể bên trong.

### Code minh hoạ

```jsx
// ✅ Container component nhận children
function Card({ title, children }) {
  return (
    <div className="card">
      <div className="card-header">
        <h2>{title}</h2>
      </div>
      <div className="card-body">
        {/* Render bất kỳ thứ gì được truyền vào giữa thẻ */}
        {children}
      </div>
    </div>
  );
}

// Dùng Card: nội dung bên trong tự động thành children
function App() {
  return (
    <Card title="Hồ sơ người dùng">
      <img src="/avatar.jpg" alt="Avatar" />
      <p>Thuan Doan — Frontend Developer</p>
      <button>Chỉnh sửa hồ sơ</button>
    </Card>
  );
}

// ✅ Kiểm tra có children không trước khi render
function Tooltip({ children, tip }) {
  if (!children) return null;
  return (
    <span title={tip} className="tooltip-wrapper">
      {children}
    </span>
  );
}

// ✅ TypeScript: khai báo kiểu cho children
interface ModalProps {
  children: React.ReactNode; // kiểu tổng quát nhất cho children
  onClose: () => void;
}
```

### Đáp án mẫu

> "`props.children` là prop đặc biệt React tự truyền — là nội dung nằm giữa thẻ mở và đóng của component. Tôi dùng nó để xây dựng container component như `Card`, `Modal`, `Layout` — những component quan tâm đến cấu trúc bao ngoài mà không cần biết cụ thể bên trong là gì. Trong TypeScript, khai báo kiểu là `React.ReactNode` để nhận mọi thứ có thể render được."

---

## Câu 10: React component có thể return gì ngoài JSX? `[Basic]`

### Câu hỏi

> Ngoài việc return JSX, React component còn có thể trả về những gì khác?

### Giải thích lý thuyết

React component có thể return các kiểu sau:

| Kiểu trả về | Mô tả |
|---|---|
| JSX element | Thông thường nhất |
| `null` | Không render gì, component vẫn tồn tại trong cây |
| `string` | Render text node trực tiếp |
| `number` | Render text node số |
| `boolean` | Không render gì (`true`/`false`) |
| Array hoặc Fragment | Nhiều element cùng cấp |
| Portal (qua `ReactDOM.createPortal`) | Render vào DOM node ngoài cây hiện tại |

Từ React 18+, component có thể return `undefined` ở chế độ development nhưng không khuyến khích.

### Code minh hoạ

```jsx
import { createPortal } from "react-dom";

// ✅ Return null — không render, dùng để ẩn có điều kiện
function ConditionalBanner({ show }) {
  if (!show) return null;
  return <div className="banner">Thông báo quan trọng!</div>;
}

// ✅ Return string — render text node thuần
function Greeting({ name }) {
  return `Xin chào, ${name}!`; // Không cần JSX
}

// ✅ Return number — render số ra màn hình
function ItemCount({ count }) {
  return count; // Render ra "42" chẳng hạn
}

// ✅ Return array — nhiều element cùng cấp (mỗi phần tử cần key)
function TagList({ tags }) {
  return tags.map((tag) => (
    <span key={tag} className="tag">{tag}</span>
  ));
}

// ✅ Return Portal — render vào node DOM khác (dùng cho Modal, Tooltip)
function Modal({ children }) {
  return createPortal(
    <div className="modal-overlay">{children}</div>,
    document.getElementById("modal-root") // render ra ngoài #root
  );
}

// ❌ Tránh: return undefined tường minh
function Bad() {
  return undefined; // Không rõ ràng, dễ nhầm lẫn
}
// ✅ Dùng null thay thế
function Good() {
  return null;
}
```

### Đáp án mẫu

> "Ngoài JSX, component có thể return `null` để không render gì, string hoặc number để render text node trực tiếp, mảng các element (cần `key`), hoặc Portal để render vào vị trí khác trong DOM. `null` hay dùng nhất khi muốn ẩn component. Portal hữu ích cho Modal và Tooltip — render ra ngoài cây DOM hiện tại để tránh vấn đề với `overflow: hidden` hay `z-index`."

---
