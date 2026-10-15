---
sidebar_position: 4
title: "4. Component Basics"
---

# 4. Component Basics

## 1. JSX

Bài học: [1. JSX](../../react/04-component-basics/1_jsx.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `JSX` là gì? Nó là HTML, là string hay là JavaScript, và vì sao trình duyệt không chạy trực tiếp được?**

<details className="qa">
<summary>Xem đáp án</summary>

**JSX (JavaScript XML)** là cú pháp mở rộng của JavaScript, cho phép viết markup giống HTML ngay trong file JS. Nó **không phải HTML** (attribute là `className`, `htmlFor`, mọi thẻ phải đóng) và **không phải string** (không có dấu nháy bao quanh, IDE/TypeScript vẫn check được). Bản chất nó là **JavaScript**: mỗi thẻ JSX được Babel/SWC biên dịch thành một lời gọi hàm `React.createElement` (hoặc `_jsx` với new transform).

Trình duyệt chỉ hiểu JavaScript chuẩn ECMAScript. Với engine, đoạn `<h1>Hi</h1>` nằm giữa code JS là **lỗi cú pháp** — không có spec nào định nghĩa nó. Vì vậy JSX bắt buộc đi qua bước build (Vite, Webpack, Next.js... với plugin Babel/SWC) để chuyển về function call thuần trước khi chạy.

```jsx
const el = <h1>Hi</h1>;          // JSX — trình duyệt không hiểu
const el = _jsx("h1", { children: "Hi" }); // sau biên dịch — chạy được
```

</details>

**2. Đoạn `const el = <h1 className="title">Hi</h1>;` sau khi biên dịch trở thành gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Tuỳ cấu hình transform:

Với transform cũ (trước React 17, `jsx: "react"`):

```jsx
const el = React.createElement("h1", { className: "title" }, "Hi");
```

Đối số lần lượt là: `type` (chuỗi `"h1"` vì là thẻ HTML), `props` (object attribute), rồi các `children`. Vì kết quả có nhắc tới `React`, file bắt buộc phải `import React from "react"`.

Với new JSX transform (React 17+, `jsx: "react-jsx"`):

```jsx
import { jsx as _jsx } from "react/jsx-runtime";

const el = _jsx("h1", { className: "title", children: "Hi" });
```

Ở dạng mới, `children` nằm luôn trong object props và hàm `_jsx` được compiler tự import — không cần `import React`. Cả hai cách đều trả về cùng một thứ: một **React element**, tức object JS mô tả UI.

</details>

**3. `React.createElement` trả về cái gì? React element khác DOM node thật ở điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Nó trả về một **React element** — object JavaScript thuần, bất biến, chỉ *mô tả* UI cần hiển thị:

```jsx
const el = <h1 className="title">Hi</h1>;

// el xấp xỉ:
// { type: "h1", key: null, ref: null,
//   props: { className: "title", children: "Hi" } }
```

Khác biệt với DOM node thật:

| | React element | DOM node |
|---|---|---|
| Bản chất | Object JS thuần (Virtual DOM) | Đối tượng do trình duyệt tạo |
| Chi phí | Rất nhẹ, tạo/vứt thoải mái | Nặng, tạo nhiều gây chậm |
| API | Không có `appendChild`, không đo được kích thước | Đầy đủ API DOM |
| Vòng đời | Bất biến — muốn đổi thì tạo element mới | Thay đổi trực tiếp tại chỗ |

React nhận cây element mới, so sánh với cây cũ (reconciliation), rồi mới sinh hoặc vá đúng phần DOM cần đổi. Nhờ vậy ta viết UI theo kiểu "mô tả trạng thái", còn thao tác DOM do React lo.

</details>

**4. Vì sao `JSX` dùng `className` thay cho `class` và `htmlFor` thay cho `for`?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì JSX **là JavaScript**, mà `class` và `for` đều là **từ khoá dành riêng** của ngôn ngữ (`class` cho ES6 class, `for` cho vòng lặp). Attribute trong JSX được biên dịch thành key của object props, nên dùng thẳng từ khoá dễ gây xung đột và rắc rối cho parser thời JSX ra đời.

React chọn cách đặt tên theo **property của DOM API** thay vì theo tên attribute HTML — mà trong DOM, hai property tương ứng chính là `element.className` và `label.htmlFor`. Quy ước này khớp luôn với quy tắc camelCase chung của JSX (`onClick`, `tabIndex`, `readOnly`).

Hệ quả thực tế: khi copy HTML từ web dán vào JSX, phải nhớ đổi:

- `class=` thành `className=`
- `for=` thành `htmlFor=`
- `tabindex=` thành `tabIndex=`
- `style="color: red"` thành ``style={{ color: "red" }}``

Nhiều extension VSCode có sẵn lệnh convert HTML sang JSX để khỏi làm tay.

</details>

**5. Vì sao một component chỉ được trả về một root element? Có những cách nào để trả nhiều element cùng cấp?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì JSX biên dịch thành **một lời gọi hàm**, và một hàm JavaScript chỉ `return` được **một giá trị**. Hai element viết cạnh nhau sẽ thành hai expression độc lập — không hợp lệ về cú pháp:

```jsx
// Sai — 2 root, không phải một expression
return (
  <h1>Title</h1>
  <p>Body</p>
);
```

Các cách trả về nhiều element cùng cấp:

- **Bọc trong một thẻ bao** (`div`, `section`...) — đơn giản nhưng thêm một DOM node.
- **Fragment ngắn** `<>...</>` — nhóm element mà không tạo node thật, lựa chọn mặc định.
- **Fragment đầy đủ** `<Fragment key={id}>` — khi cần truyền `key` trong list.
- **Trả về mảng** element, ví dụ kết quả của `.map()`; mỗi phần tử cần `key`.

```jsx
return (
  <>
    <h1>Title</h1>
    <p>Body</p>
  </>
);
```

</details>

**6. `Fragment` khác gì so với bọc bằng một thẻ `div`? Khi nào bắt buộc dùng dạng đầy đủ `<Fragment>` thay vì `<>`?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Fragment | `div` bao ngoài |
|---|---|---|
| DOM sinh ra | Không có node nào | Thêm một node thật |
| Ảnh hưởng layout | Không — con vẫn là con trực tiếp của cha | Phá quan hệ cha–con của flex/grid |
| HTML hợp lệ | Giữ được `ul > li`, `tbody > tr` | Chèn `div` vào giữa là sai chuẩn |
| Style / ref | Không nhận `className`, `style`, `ref` | Nhận đầy đủ |

Nói ngắn: dùng Fragment khi chỉ cần **nhóm** element về mặt cú pháp; dùng `div` khi thật sự cần một node để style hoặc gắn `ref`.

Bắt buộc dùng dạng đầy đủ `<Fragment>` khi cần truyền **`key`** — điển hình là render list:

```jsx
import { Fragment } from "react";

items.map((item) => (
  <Fragment key={item.id}>
    <dt>{item.term}</dt>
    <dd>{item.desc}</dd>
  </Fragment>
));
```

Cú pháp ngắn `<>...</>` không nhận bất kỳ attribute nào, kể cả `key`.

</details>

**7. Trong cặp `{}` của JSX viết được những gì? Vì sao viết được ternary và `.map` nhưng không viết được `if` hay `for`?**

<details className="qa">
<summary>Xem đáp án</summary>

Trong `{}` viết được **mọi expression JavaScript** — thứ sinh ra một giá trị: biến, phép tính, gọi hàm, truy cập property, template literal, ternary, `&&`, `||`, `??`, `.map()`, thậm chí một JSX element khác.

Lý do: nội dung trong `{}` sau khi biên dịch trở thành **đối số** truyền vào `createElement`/`_jsx`. Đối số của hàm bắt buộc phải là một giá trị. Ternary và `.map()` là expression — chúng *trả về* giá trị (một element, một mảng element). Còn `if`, `for`, `switch`, `try` là **statement** — chúng điều khiển luồng chứ không sinh ra giá trị, nên không thể làm đối số.

```jsx
// Đúng — expression, có giá trị
<div>{cond ? <A /> : <B />}</div>
<ul>{items.map((i) => <li key={i}>{i}</li>)}</ul>

// Sai — statement, không có giá trị
<div>{if (cond) { ... }}</div>
```

Cần logic phức tạp thì đưa `if`/`for` ra **ngoài** phần JSX, gán kết quả vào biến rồi nhúng biến đó vào `{}`.

</details>

**8. Vì sao `style` trong JSX nhận một object (`style={{ color: "red" }}`) chứ không nhận string như HTML?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì React đặt style qua **property của DOM** (`element.style.color = "red"`) chứ không gán chuỗi vào attribute. Property `style` của DOM vốn là một object, nên React nhận đúng hình dạng đó: các cặp key–value với key viết **camelCase** (`fontSize`, `backgroundColor`) đúng như tên property trong `CSSStyleDeclaration`.

Lưu ý hai lớp ngoặc nhọn: lớp ngoài là **JSX expression**, lớp trong là **object literal**.

```jsx
const color = "red";

<div style={{ color, fontSize: 16, marginTop: "1rem" }}>Hello</div>
```

Lợi ích của dạng object:

- Giá trị là JS nên tính động, ghép object, spread rất tự nhiên — không phải nối chuỗi.
- Tránh lỗi chính tả khó thấy trong string CSS; TypeScript check được tên property.
- React tự thêm đơn vị `px` cho các property số phù hợp (`fontSize: 16` thành `16px`), trừ các property không đơn vị như `lineHeight`, `zIndex`, `flex`.

Với style phức tạp, thực tế vẫn nên dùng class CSS thay vì inline style.

</details>

**9. Vì sao tên component phải viết hoa chữ cái đầu? Điều gì xảy ra nếu viết `<myButton />`?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì compiler JSX dùng **chữ cái đầu** để phân biệt thẻ HTML với component:

- Chữ thường thành **chuỗi**: `<div />` biên dịch thành `_jsx("div", ...)` — React hiểu là thẻ DOM.
- Chữ hoa thành **biến JS**: `<Button />` biên dịch thành `_jsx(Button, ...)` — React hiểu là component và sẽ gọi hàm đó.

Nếu viết `<myButton />`, compiler sinh ra `_jsx("myButton", ...)`. React coi `"myButton"` là tên thẻ DOM, cố tạo một phần tử không tồn tại trong HTML, và cảnh báo đại loại *"The tag `<myButton>` is unrecognized in this browser"*. Component `myButton` bạn định nghĩa **không hề được gọi**, props truyền vào bị coi là attribute DOM lạ, và màn hình không render ra nội dung mong muốn.

```jsx
function myButton() { return <button>OK</button>; }

<myButton />  // sai — render thẻ DOM "myButton" rỗng
<MyButton />  // đúng — gọi component
```

Ngoại lệ: truy cập qua object như `<Form.Input />` vẫn được coi là component.

</details>

**10. Dự đoán kết quả: render `{null}`, `{undefined}`, `{false}`, `{0}`, `{""}` bên trong JSX — giá trị nào hiện ra màn hình?**

<details className="qa">
<summary>Xem đáp án</summary>

| Giá trị | Hiển thị |
|---|---|
| `null` | Không render gì |
| `undefined` | Không render gì |
| `false` (và `true`) | Không render gì |
| `0` | **Hiện ra chữ `0`** |
| `""` | Không thấy gì (chuỗi rỗng) |

React cố ý bỏ qua `null`, `undefined`, `true`, `false` để cú pháp `cond && <X />` hoạt động gọn gàng. Nhưng `0` là **số** — React render mọi số và chuỗi thành text node, nên `0` hiện lên màn hình.

Đây là cái bẫy kinh điển:

```jsx
{items.length && <List items={items} />}
// items rỗng → 0 && ... → trả về 0 → in ra "0" trên UI

{items.length > 0 && <List items={items} />}  // đúng
{items.length ? <List items={items} /> : null} // hoặc dùng ternary
```

Quy tắc an toàn: luôn ép vế trái của `&&` về boolean thật.

</details>

**11. Lỗi `Objects are not valid as a React child` xảy ra khi nào và sửa như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Xảy ra khi bạn nhúng một **object JS thường** vào vị trí children của JSX. React chỉ render được string, number, React element, mảng các thứ đó, hoặc `null`/`undefined`/boolean (bỏ qua) — chứ không biết biến một object bất kỳ thành text.

Các tình huống hay gặp:

- Quên truy cập property: viết `{user}` thay vì `{user.name}`.
- Render thẳng một `Date`, `Error`, `Map`, `Set`.
- Render kết quả `fetch` chưa xử lý, hoặc một Promise.
- Nhầm khi map: trả về object thay vì element.

```jsx
const user = { name: "An", age: 25 };

<p>{user}</p>                     // 💥 Objects are not valid as a React child
<p>{user.name}</p>                // ✅
<p>{JSON.stringify(user)}</p>     // ✅ để debug
<p>{date.toLocaleDateString()}</p> // ✅ với Date
```

Cách sửa chung: chuyển object thành thứ React hiểu — lấy đúng field, gọi phương thức format, hoặc `.map()` thành danh sách element.

</details>

**12. `new JSX transform` từ React 17 khác bản cũ ở chỗ nào? Vì sao không cần `import React` nữa và điều đó giúp gì cho bundle size?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Transform cũ (`jsx: "react"`) | New transform (`jsx: "react-jsx"`) |
|---|---|---|
| Hàm sinh ra | `React.createElement(type, props, ...children)` | `_jsx` / `_jsxs` từ `react/jsx-runtime` |
| Import | Phải tự `import React from "react"` | Compiler tự chèn import |
| `children` | Là đối số riêng | Nằm trong object props |

Bản cũ luôn tạo ra code tham chiếu tới biến `React`, nên mọi file JSX bắt buộc có `React` trong scope — dù file đó không gọi API nào của React. New transform gọi thẳng hàm `_jsx` do compiler tự import từ `react/jsx-runtime`, nên dòng `import React` trở nên thừa.

Lợi ích:

- Bớt boilerplate và bớt lỗi "React is not defined".
- Bundler không phải giữ lại toàn bộ namespace `React` chỉ để render JSX, tree-shaking tốt hơn nên bundle nhỏ hơn một chút.
- Runtime có thể tối ưu riêng từng trường hợp (`jsx`, `jsxs`, `jsxDEV`).

Bật bằng `"jsx": "react-jsx"` trong `tsconfig.json`; Vite và Next.js đã bật sẵn.

</details>

**13. Phân biệt `jsx`, `jsxs`, `jsxDEV` trong `react/jsx-runtime` — mỗi hàm được dùng trong tình huống nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả ba đều tạo ra React element, khác nhau ở tình huống compiler chọn dùng:

- **`jsx`** — dùng khi element có **0 hoặc 1 child tĩnh**. Đây là trường hợp phổ biến nhất, đường đi nhanh nhất.
- **`jsxs`** (s = static children) — dùng khi element có **nhiều child viết tĩnh trong code**. Vì mảng children do chính compiler sinh ra, React biết nó cố định và **bỏ qua kiểm tra `key`**, tiết kiệm công so với mảng động từ `.map()`.
- **`jsxDEV`** — phiên bản chỉ có trong **bản development**, nằm ở `react/jsx-dev-runtime`. Nó nhận thêm tham số `source` (tên file, dòng, cột) và cờ `self`, nhờ đó cảnh báo và stack trace chỉ đúng vị trí trong code gốc. Bản production không dùng hàm này để tránh phình bundle.

```jsx
_jsx("h1", { children: "Hi" });                    // 1 child
_jsxs("div", { children: [_jsx("h1", {}), <p />] }); // nhiều child tĩnh
```

Bạn không bao giờ gọi trực tiếp các hàm này — compiler tự chọn.

</details>

**14. JSX tự escape nội dung ra sao để chống `XSS`? `dangerouslySetInnerHTML` phá vỡ điều đó thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Mọi giá trị nhúng bằng `{}` đều được React coi là **text thuần**, không phải markup. Khi dựng DOM, React gán chúng qua `textContent` (hoặc tạo text node), nên ký tự đặc biệt không bao giờ được trình duyệt parse thành thẻ:

```jsx
const input = "<img src=x onerror=alert(1) />";

<div>{input}</div>
// Hiển thị nguyên văn chuỗi trên màn hình, không tạo thẻ img, không chạy JS
```

Nhờ vậy, mặc định React an toàn với XSS cho dữ liệu người dùng.

`dangerouslySetInnerHTML` bỏ qua toàn bộ cơ chế đó: React gán chuỗi thẳng vào `innerHTML`, trình duyệt **parse nó thành HTML thật**:

```jsx
<div dangerouslySetInnerHTML={{ __html: input }} />
// Thẻ img được tạo thật → onerror chạy → XSS
```

Tên prop dài dòng và chữ "dangerously" là cố ý, để bạn phải cân nhắc. Nếu buộc phải render HTML (nội dung từ CMS, rich text editor), hãy **sanitize** trước bằng thư viện như DOMPurify, và tuyệt đối không truyền thẳng dữ liệu người dùng vào.

</details>

**15. `JSX` có phải đặc quyền riêng của React không? So với template syntax của Vue hay Svelte thì khác biệt cốt lõi là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** JSX chỉ là cú pháp, ai cũng dùng được: Solid.js, Preact, Stencil, Qwik đều hỗ trợ JSX; compiler thì có Babel, SWC, esbuild, TypeScript. Ngữ nghĩa runtime mới là thứ khác nhau — ví dụ Solid biên dịch JSX thẳng thành thao tác DOM với hệ reactive, không dùng Virtual DOM như React.

Vue dùng **template syntax** riêng (`<template>` với `v-if`, `v-for`, `v-bind`), Svelte dùng **định dạng file `.svelte`**. Khác biệt cốt lõi:

| | JSX | Template (Vue, Svelte) |
|---|---|---|
| Bản chất | Là JavaScript | Là DSL riêng, compiler phân tích |
| Logic | Dùng trọn cú pháp JS: biến, hàm, ternary, `.map` | Dùng directive có sẵn (`v-if`, `each`) |
| Kiểm tra kiểu | TypeScript check tự nhiên | Cần tooling riêng của framework |
| Tối ưu | Khó đoán trước vì là code JS tuỳ ý | Compiler biết cấu trúc, tối ưu tốt hơn |

Tóm lại: JSX đánh đổi lấy **sự linh hoạt của ngôn ngữ**, template đánh đổi lấy **khả năng tối ưu và tính dễ đọc** cho người quen HTML.

</details>

---

## 2. Props vs State

Bài học: [2. Props vs State](../../react/04-component-basics/2_props-state.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Phân biệt `props` và `state` theo bốn tiêu chí: nguồn dữ liệu, quyền sửa, ai điều khiển, và ảnh hưởng tới re-render.**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | Props | State |
|---|---|---|
| Nguồn dữ liệu | Từ component cha truyền xuống | Sinh ra và lưu bên trong chính component |
| Quyền sửa | **Readonly** — con không được gán lại | **Sửa được** nhưng chỉ qua setter (`setCount`) |
| Ai điều khiển | Component cha | Chính component đó |
| Re-render | Cha re-render với props mới thì con render lại | Gọi setter làm React schedule re-render component |

Cách nhớ: props giống **tham số của hàm** — bên ngoài đưa vào, hàm chỉ đọc; state giống **biến nhớ riêng** của component, tồn tại qua các lần render và đổi được theo thời gian.

Một dữ liệu là state ở component này hoàn toàn có thể trở thành props ở component con:

```jsx
function App() {
  const [filter, setFilter] = useState(""); // state của App
  return <ItemList filter={filter} />;      // props của ItemList
}
```

</details>

**2. Vì sao `props` là readonly? Điều gì xảy ra nếu gán trực tiếp `props.size = 100` bên trong component con?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì React xây trên mô hình **luồng dữ liệu một chiều**: dữ liệu chỉ chảy từ cha xuống con. Nếu con sửa được props, cha sẽ không còn là nguồn sự thật duy nhất — UI và dữ liệu dễ lệch nhau, và việc truy vết "ai đã đổi giá trị này" trở nên rất khó. React yêu cầu component hành xử như **pure function**: cùng props thì cho cùng kết quả.

Gán `props.size = 100` thì: giá trị đó **không** làm React re-render (React không theo dõi việc gán này), lần render sau cha truyền xuống lại thì thay đổi của bạn biến mất, và ở Strict Mode / dev build React có thể cảnh báo do object props được đóng băng. Kết quả là một bug âm thầm, khó tìm.

Cách đúng: tạo biến mới, hoặc báo lên cha qua callback.

```jsx
function Avatar({ size }) {
  const finalSize = Math.min(size, 200); // biến mới, không đụng props
  return <img width={finalSize} />;
}
```

</details>

**3. "Luồng dữ liệu một chiều" của React nghĩa là gì? Component con muốn báo thay đổi ngược lên cha thì làm thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Nghĩa là dữ liệu chỉ đi theo **một hướng: từ trên xuống dưới** trong cây component. Cha giữ state, truyền xuống con bằng props; con chỉ đọc. Nhờ vậy mỗi mẩu dữ liệu có đúng **một nguồn sự thật**, và khi UI sai bạn chỉ cần lần ngược lên cây để tìm nơi state được giữ.

Con không sửa props được, nên muốn báo thay đổi lên cha thì cha phải **truyền xuống một callback**. Con gọi callback đó, cha tự cập nhật state của mình, rồi giá trị mới lại chảy xuống. Đây chính là cặp nguyên tắc **state down, event up**:

```jsx
function App() {
  const [filter, setFilter] = useState("");
  return <SearchBar value={filter} onChange={setFilter} />;
}

function SearchBar({ value, onChange }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} />;
}
```

Trái ngược với **two-way binding** của Angular/Vue (`v-model`), React chọn một chiều để đánh đổi lấy tính dự đoán được.

</details>

**4. `useState` trả về những gì? Vì sao React bắt buộc gọi hook ở top level, không được gọi trong `if` hay vòng lặp?**

<details className="qa">
<summary>Xem đáp án</summary>

`useState(initial)` trả về một **mảng hai phần tử**: giá trị state hiện tại và **hàm setter** để cập nhật nó. Ta thường destructure ngay:

```jsx
const [count, setCount] = useState(0);
```

React **không** lưu state theo tên biến — nó lưu theo **thứ tự gọi hook** trong mỗi component. Lần render đầu, React tạo một danh sách: hook thứ nhất giữ `count`, hook thứ hai giữ `name`... Ở các lần render sau, React duyệt lại danh sách theo đúng thứ tự đó để trả về đúng giá trị.

Vì vậy nếu đặt hook trong `if`, vòng lặp hay sau một `return` sớm, số lượng và thứ tự hook có thể khác nhau giữa các lần render — React sẽ trả nhầm state của hook này cho hook kia, sinh lỗi rất khó hiểu.

```jsx
if (isLoggedIn) {
  const [user, setUser] = useState(null); // 💥 sai
}
```

Quy tắc: luôn gọi hook ở **top level** của component; điều kiện đặt **bên trong** hook, không bọc ngoài hook.

</details>

**5. Vì sao setter của `useState` là bất đồng bộ? `console.log(count)` ngay sau `setCount(count + 1)` in ra giá trị nào?**

<details className="qa">
<summary>Xem đáp án</summary>

In ra **giá trị cũ** — nếu `count` đang là 0 thì in ra `0`.

Lý do: gọi setter **không** gán lại biến `count`. Nó chỉ **đặt lịch (schedule)** một lần render mới. Biến `count` trong lần render hiện tại là một hằng số thuộc closure của lần render đó — nó sẽ không bao giờ đổi giá trị. Chỉ khi component chạy lại, `useState` mới trả về giá trị mới.

React làm vậy để có thể **gộp nhiều lần cập nhật (batching)** trong cùng một sự kiện thành một lần render duy nhất, tránh render thừa và tránh UI nhấp nháy qua nhiều trạng thái trung gian.

```jsx
function increment() {
  setCount(count + 1);
  console.log(count); // 0 — vẫn là giá trị của render hiện tại
}
```

Muốn làm gì đó với giá trị mới, hãy tính ra biến riêng (`const next = count + 1`) hoặc xử lý trong `useEffect` phụ thuộc `count`.

</details>

**6. Dự đoán output: gọi `setCount(count + 1)` ba lần liên tiếp trong một event handler khi `count` đang là 0 — kết quả cuối cùng bằng bao nhiêu? Nếu đổi sang `setCount(c => c + 1)` thì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Kết quả lần lượt là **1** và **3**.

```jsx
// count đang là 0
setCount(count + 1); // count là 0 → yêu cầu set thành 1
setCount(count + 1); // count VẪN là 0 → set thành 1
setCount(count + 1); // count VẪN là 0 → set thành 1
// → kết quả cuối: 1
```

Vì `count` là hằng số của render hiện tại, cả ba lời gọi đều đọc cùng giá trị 0 và cùng yêu cầu "hãy đặt state thành 1". React gộp lại, kết quả là 1.

```jsx
setCount((c) => c + 1); // 0 → 1
setCount((c) => c + 1); // 1 → 2
setCount((c) => c + 1); // 2 → 3
// → kết quả cuối: 3
```

Dạng **updater function** khác ở chỗ React xếp các hàm này vào hàng đợi rồi chạy lần lượt, hàm sau nhận kết quả của hàm trước — không phụ thuộc biến trong closure.

Quy tắc: state mới phụ thuộc state cũ thì **luôn dùng `setX(prev => ...)`**.

</details>

**7. `batching` là gì? React 18 khác các bản trước thế nào khi gọi nhiều setter trong `setTimeout` hoặc trong promise?**

<details className="qa">
<summary>Xem đáp án</summary>

**Batching** là việc React gom nhiều lần gọi setter xảy ra gần nhau thành **một lần re-render duy nhất**, thay vì render lại sau mỗi setter. Mục đích: giảm số lần render, tránh UI nhấp nháy qua các trạng thái trung gian.

| | Trước React 18 | Từ React 18 |
|---|---|---|
| Trong event handler của React | Có batching | Có batching |
| Trong `setTimeout`, promise, `fetch().then` | **Không** batching — mỗi setter một lần render | Có batching |
| Trong native event listener | Không batching | Có batching |

React 18 gọi đây là **automatic batching** — bật mặc định khi dùng `createRoot`.

```jsx
setTimeout(() => {
  setCount((c) => c + 1);
  setFlag((f) => !f);
  // React 17: render 2 lần — React 18: render 1 lần
}, 0);
```

Nếu thật sự cần render ngay lập tức sau một setter (hiếm), React cung cấp `flushSync` từ `react-dom` để thoát khỏi batching.

</details>

**8. Vì sao không được `items.push(item)` rồi `setItems(items)`? React so sánh state cũ và mới bằng cơ chế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì `push` **mutate** mảng tại chỗ — nội dung đổi nhưng **tham chiếu vẫn là mảng cũ**. React so sánh state cũ và mới bằng **so sánh nông (shallow comparison)** với `Object.is`, tức chỉ nhìn tham chiếu chứ không duyệt sâu vào bên trong. Thấy cùng một tham chiếu, React kết luận "không có gì đổi" và **bỏ qua re-render** — dữ liệu đã thay đổi nhưng màn hình đứng yên.

```jsx
// Sai — mutate, React không nhận ra thay đổi
items.push(item);
setItems(items);

// Đúng — tạo mảng mới, tham chiếu mới
setItems([...items, item]);
setItems((prev) => [...prev, item]); // an toàn hơn

// Object cũng vậy
setUser((prev) => ({ ...prev, name }));
```

So sánh nông là lựa chọn có chủ đích: kiểm tra một tham chiếu chỉ tốn O(1), trong khi so sánh sâu mọi state sau mỗi lần cập nhật sẽ rất đắt. Đổi lại, lập trình viên phải tuân thủ nguyên tắc **bất biến (immutability)**. Nguyên tắc này cũng là nền tảng cho `React.memo`, `useMemo`, `useEffect` so sánh dependency.

</details>

**9. Cập nhật một object lồng nhiều tầng trong state thế nào cho đúng? Khi nào nên cân nhắc `Immer` hoặc flatten state?**

<details className="qa">
<summary>Xem đáp án</summary>

Phải **tạo bản sao mới cho mọi tầng nằm trên đường đi** tới field cần đổi — spread từng cấp một:

```jsx
setUser((prev) => ({
  ...prev,
  address: {
    ...prev.address,
    city: "HN",
  },
}));
```

Lý do: React chỉ so sánh tham chiếu ở tầng ngoài cùng, nên nếu bạn chỉ sửa `prev.address.city` mà giữ nguyên object `user`, React sẽ không thấy thay đổi. Ngoài ra, các component con đang nhận `address` làm prop cũng cần một tham chiếu mới để `React.memo` hoạt động đúng.

Khi nào cần giải pháp khác:

- **Immer** (hoặc `useImmer`): khi state lồng từ ba tầng trở lên, chuỗi spread trở nên dài và dễ sót. Immer cho viết cú pháp "mutate" trên bản nháp rồi tự sinh ra object bất biến.
- **Flatten state**: khi dữ liệu là danh sách có quan hệ, hãy chuẩn hoá về dạng phẳng (map theo `id`) thay vì lồng sâu — cập nhật và tra cứu đều nhanh hơn.
- **Tách state**: state không liên quan nhau thì nên là các `useState` riêng.

</details>

**10. Khi nào một dữ liệu nên là state, khi nào nên derive (tính ra) ngay trong lúc render? Nêu tiêu chí quyết định.**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc: **giữ state nhỏ nhất có thể**, mọi thứ suy ra được thì tính lại trong render. Ba câu hỏi để quyết định:

1. **Có thay đổi theo thời gian không?** Không đổi thì dùng hằng số thường, không cần state.
2. **Có tính được từ props hoặc state khác không?** Có thì **derive**, đừng tạo state.
3. **Có được truyền từ cha xuống không?** Có thì đó là props.

Chỉ những gì còn lại — dữ liệu thay đổi theo thời gian, không suy ra được từ đâu khác — mới xứng đáng là state.

```jsx
const [items, setItems] = useState([]);
const [filter, setFilter] = useState("");

// KHÔNG tạo state cho filteredItems — tính ra là đủ
const filteredItems = items.filter((x) => x.name.includes(filter));
```

Vì sao quan trọng: mỗi state thừa là một nguồn sự thật thứ hai, và bạn phải tự tay đồng bộ nó — quên một nhánh là UI lệch ngay. Nếu phép tính thật sự nặng, bọc bằng `useMemo` chứ vẫn không nên biến nó thành state.

</details>

**11. Vì sao khởi tạo state từ props kiểu `useState(props.value)` thường là anti-pattern? Trường hợp nào chấp nhận được và xử lý ra sao khi prop đổi?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì giá trị khởi tạo chỉ được dùng ở **lần render đầu tiên**. Những lần sau React bỏ qua nó hoàn toàn, nên khi cha truyền xuống prop mới, state bên trong vẫn giữ giá trị cũ — UI hiển thị dữ liệu lỗi thời. Đây là bug kinh điển:

```jsx
function UserCard({ firstName, lastName }) {
  const [fullName] = useState(`${firstName} ${lastName}`);
  return <p>{fullName}</p>; // không đổi khi prop đổi
}
```

Nếu giá trị **suy ra được** từ props, hãy tính thẳng trong render, đừng tạo state.

Trường hợp chấp nhận được: khi prop chỉ đóng vai trò **giá trị khởi tạo** rồi sau đó component tự quản — ví dụ ô input có `defaultValue`, form edit khởi tạo từ dữ liệu server. Quy ước là đặt tên prop có tiền tố `initial` hoặc `default` để nói rõ ý định.

Khi cần reset state lúc prop đổi, cách sạch nhất là **đổi `key`** của component để React tạo instance mới:

```jsx
<EditForm key={user.id} initialName={user.name} />
```

</details>

**12. Phân biệt `useState(computeExpensive())` và `useState(() => computeExpensive())` — lazy initialization giải quyết vấn đề gì?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `useState(computeExpensive())` | `useState(() => computeExpensive())` |
|---|---|---|
| Khi nào hàm chạy | **Mọi lần render** | Chỉ **lần render đầu tiên** |
| React dùng kết quả | Chỉ lần đầu, các lần sau vứt đi | Lần đầu |

Ở dạng thứ nhất, bạn **gọi hàm ngay** rồi truyền kết quả vào `useState`. JavaScript phải thực thi nó trước, ở mọi lần render — dù từ lần thứ hai trở đi React đã có state và ném kết quả đi. Với phép tính nặng (đọc `localStorage`, parse JSON lớn, tạo mảng nghìn phần tử), đây là lãng phí thấy rõ.

Ở dạng thứ hai, bạn truyền **chính hàm** đó vào. React chỉ gọi nó đúng một lần, lúc khởi tạo state — gọi là **lazy initialization**.

```jsx
// Chạy mỗi lần render — lãng phí
const [data, setData] = useState(JSON.parse(localStorage.getItem("todos")));

// Chỉ chạy lần đầu
const [data, setData] = useState(() => JSON.parse(localStorage.getItem("todos")));
```

Lưu ý: nếu state là **một hàm**, bắt buộc dùng dạng `useState(() => myFn)`, nếu không React sẽ hiểu nhầm là initializer.

</details>

**13. Nếu gọi setter với đúng giá trị đang có, React có re-render không? Cơ chế `bail out` hoạt động thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Về nguyên tắc là **không**. React so sánh giá trị mới với giá trị hiện tại bằng `Object.is`; nếu bằng nhau, nó **bail out** — bỏ qua việc cập nhật state và không render lại cây con.

```jsx
const [count, setCount] = useState(0);
setCount(0); // giá trị không đổi → bail out
```

Hai lưu ý quan trọng:

- So sánh là **theo tham chiếu** với object/array. `setUser({ ...user })` tạo object mới nên `Object.is` trả về `false` — React vẫn render lại dù nội dung y hệt.
- React có thể vẫn **chạy lại component thêm một lần** trước khi nhận ra không cần cập nhật, rồi mới dừng và không đụng tới DOM hay các component con. Vì vậy đừng đặt side effect ngay trong thân component và cho rằng nó chắc chắn không chạy.

Cơ chế này lý giải vì sao tính bất biến lại quan trọng cả hai chiều: mutate thì React bỏ sót thay đổi, còn tạo object mới vô tội vạ thì React render thừa.

</details>

**14. `lifting state up` là gì? Nguyên tắc chọn nơi đặt state khi hai component anh em cùng cần dữ liệu đó?**

<details className="qa">
<summary>Xem đáp án</summary>

**Lifting state up** là kỹ thuật **chuyển state lên component cha chung** khi từ hai component trở lên cần cùng một dữ liệu. Vì dữ liệu chỉ chảy xuống, hai component anh em không thể nói chuyện trực tiếp — chúng phải chia sẻ qua tổ tiên chung.

Nguyên tắc chọn chỗ đặt: tìm **tổ tiên chung gần nhất** của tất cả component cần dữ liệu đó, và đặt state ở đúng đó — không cao hơn. Đặt quá cao thì mọi thứ dưới nó render lại vô ích và sinh prop drilling.

```jsx
function App() {
  const [filter, setFilter] = useState(""); // tổ tiên chung của cả hai

  return (
    <>
      <SearchBar value={filter} onChange={setFilter} />
      <ItemList filter={filter} />
    </>
  );
}
```

Mô hình quen thuộc: **state down** qua props, **event up** qua callback. Component con trở thành controlled — nó chỉ hiển thị và báo sự kiện, còn nguồn sự thật duy nhất nằm ở cha.

</details>

**15. `prop drilling` là gì? Liệt kê các hướng xử lý (Context, thư viện state, URL state, server state) và đánh đổi của từng hướng.**

<details className="qa">
<summary>Xem đáp án</summary>

**Prop drilling** là tình trạng phải truyền một prop qua nhiều tầng component trung gian chỉ để tới được component thật sự cần nó — các tầng ở giữa "khuân hộ" mà chẳng dùng đến.

```jsx
<Layout>
  <Header>
    <Nav>
      <UserMenu user={user} /> {/* user đi từ App xuống, qua 3 cấp */}
    </Nav>
  </Header>
</Layout>
```

Các hướng xử lý và đánh đổi:

- **Context API** — chia sẻ giá trị cho cả một nhánh cây, không cần truyền tay. Đổi lại: mọi consumer re-render khi giá trị đổi, nên hợp với dữ liệu ít thay đổi (theme, locale, user đăng nhập) hơn là state đổi liên tục.
- **Thư viện state (Zustand, Jotai, Redux)** — có subscribe chọn lọc nên tối ưu re-render, devtools tốt. Đổi lại: thêm dependency và khái niệm mới.
- **URL state (query string)** — hợp với filter, phân trang, tab: chia sẻ link được, back/forward hoạt động đúng. Đổi lại: chỉ chứa được dữ liệu dạng chuỗi, đơn giản.
- **Server state (TanStack Query)** — lo cache, refetch, trạng thái loading/error cho dữ liệu từ API, khỏi nhét vào state toàn cục.

Đôi khi cách rẻ nhất là bố trí lại component hoặc dùng `children` để khỏi khoan qua nhiều tầng.

</details>

**16. Phân biệt controlled component và uncontrolled component. Vì sao React khuyến nghị controlled cho form, và khi nào uncontrolled lại hợp lý hơn?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Controlled | Uncontrolled |
|---|---|---|
| Nguồn sự thật | State của React | DOM tự giữ giá trị |
| Cú pháp | `value` + `onChange` | `defaultValue` + `ref` |
| Đọc giá trị | Đọc state bất cứ lúc nào | Đọc qua `ref.current.value` khi cần |

```jsx
// Controlled
const [name, setName] = useState("");
<input value={name} onChange={(e) => setName(e.target.value)} />;

// Uncontrolled
const ref = useRef(null);
<input defaultValue="" ref={ref} />;
```

React khuyến nghị **controlled** vì giá trị nằm trong state nên bạn làm được mọi thứ ngay khi người dùng gõ: validate tức thời, format (viết hoa, thêm dấu phân cách), bật/tắt nút submit, đồng bộ nhiều field với nhau. UI luôn khớp dữ liệu, đúng tinh thần `UI = f(state)`.

**Uncontrolled** hợp lý khi: form đơn giản chỉ cần đọc lúc submit, `input type="file"` (bắt buộc uncontrolled), tích hợp thư viện bên thứ ba thao tác DOM trực tiếp, hoặc form rất lớn mà việc render lại mỗi ký tự gây chậm — đây cũng là lý do React Hook Form chọn hướng uncontrolled.

</details>

**17. Prop `key` có phải một prop bình thường không? Đổi `key` của một component gây ra chuyện gì với state bên trong nó?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** `key` là một prop **dành riêng** cho React, giống `ref`. Nó không nằm trong object props mà component nhận được — đọc `props.key` bên trong component sẽ ra `undefined` (và React cảnh báo). `key` chỉ dành cho React dùng trong quá trình reconciliation để nhận diện "đây có phải cùng một component với lần render trước không".

Khi `key` đổi, React coi đó là **một component hoàn toàn khác**: nó **unmount** instance cũ (huỷ toàn bộ state, chạy cleanup của effect) và **mount** một instance mới với state khởi tạo lại từ đầu.

```jsx
// Đổi user → key đổi → form được tạo mới, state bên trong reset sạch
<EditForm key={user.id} initialName={user.name} />
```

Đây vừa là cái bẫy (dùng `Math.random()` làm key khiến component mount lại liên tục, mất state và mất focus), vừa là một kỹ thuật hữu ích — cách gọn gàng nhất để **reset state** một cây component mà không cần `useEffect` đồng bộ thủ công.

</details>

**18. Phân biệt `client state` và `server state` — vì sao nên dùng công cụ khác nhau cho hai loại này?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Client state | Server state |
|---|---|---|
| Ví dụ | Modal đang mở, tab đang chọn, nội dung form, theme | Danh sách sản phẩm, thông tin user, đơn hàng |
| Chủ sở hữu | Chỉ trình duyệt này biết | Server — client chỉ giữ **bản sao** |
| Tính đồng bộ | Luôn chính xác, đồng bộ | Có thể **cũ** bất cứ lúc nào (người khác vừa sửa) |
| Vòng đời | Mất khi reload | Tồn tại độc lập với phiên làm việc |
| Thao tác | Gán giá trị là xong | Bất đồng bộ: loading, error, retry, refetch, cache |

Vì bản chất khác nhau nên công cụ cũng khác. `useState`/Context/Zustand được thiết kế cho dữ liệu **bạn sở hữu** — chỉ là nơi cất giá trị. Còn server state cần cả một bộ máy: cache theo key, khử trùng lặp request, đánh dấu dữ liệu cũ (stale), refetch khi quay lại tab, retry khi lỗi, cập nhật lạc quan. Tự viết những thứ này bằng `useState` + `useEffect` là tái phát minh một thư viện cache, và thường thiếu sót.

Vì vậy thực tế hay dùng TanStack Query (hoặc SWR, RTK Query) cho server state, và để client state ở `useState`/Context — app gọn hơn rất nhiều.

</details>

---

## 3. Conditional Rendering

Bài học: [3. Conditional Rendering](../../react/04-component-basics/3_conditional-rendering.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. React có cú pháp template riêng cho điều kiện không? Kể các cách render có điều kiện thường dùng.**

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** Khác với Vue (`v-if`, `v-else`) hay Angular (`*ngIf`), React **không có directive nào cho điều kiện**. Vì JSX chỉ là JavaScript, bạn dùng thẳng cú pháp sẵn có của ngôn ngữ — không phải học thêm DSL.

Các cách thường dùng:

- **Ternary `? :`** — có hai nhánh, viết inline ngay trong JSX.
- **Toán tử `&&`** — chỉ render khi điều kiện đúng, không cần nhánh else.
- **Early return** — trả về sớm cho các trạng thái loading, error, empty; happy path để cuối.
- **Biến trung gian** — gán JSX vào biến bằng `if/else` ở trên rồi nhúng biến vào JSX.
- **Lookup object hoặc `switch`** — khi có nhiều nhánh theo một giá trị.

```jsx
function Greeting({ user }) {
  if (!user) return <p>Vui lòng đăng nhập</p>;
  return <p>Xin chào {user.name}</p>;
}
```

Ưu điểm của cách tiếp cận này: mọi kỹ thuật JS bạn đã biết đều dùng lại được; nhược điểm: dễ viết ra JSX rối nếu không tự đặt kỷ luật.

</details>

**2. So sánh ternary, `&&`, early return và lookup object — mỗi cách hợp với tình huống nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| Cách | Hợp với | Hạn chế |
|---|---|---|
| Ternary `? :` | Đúng hai nhánh, nội dung ngắn, viết inline | Lồng nhiều tầng là rất khó đọc |
| `&&` | Có thì hiện, không có thì thôi (badge, banner) | Bẫy với `0` và `""`; không có nhánh else |
| Early return | Component nhiều trạng thái loading/error/empty | Chỉ dùng được ở đầu component, không inline giữa JSX |
| Lookup object / `switch` | Từ ba nhánh trở lên theo một giá trị | Object tạo lại mỗi lần render; `switch` không viết được trong JSX |

Kinh nghiệm chọn nhanh:

- Một dòng, hai khả năng thì ternary.
- Chỉ hiện/ẩn một mẩu UI thì `&&` (nhớ ép boolean).
- Component rẽ theo trạng thái toàn cục của nó thì early return.
- Trạng thái dạng enum (`pending`, `active`, `done`...) thì lookup object, hoặc `switch` khi cần exhaustive check với TypeScript.

Quy tắc chung: ưu tiên cách khiến người đọc sau hiểu nhanh nhất, không phải cách ngắn nhất.

</details>

**3. Dự đoán output: `{items.length && <List />}` khi `items` là mảng rỗng — màn hình hiện gì và vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Màn hình hiện ra **chữ số `0`**.

Lý do nằm ở ngữ nghĩa của `&&` trong JavaScript: nó **không trả về boolean**, mà trả về **toán hạng bên trái nếu toán hạng đó falsy**, ngược lại trả về toán hạng bên phải. Với mảng rỗng, `items.length` là `0` — falsy — nên biểu thức trả về chính số `0`.

Đến lượt React: nó bỏ qua `null`, `undefined`, `true`, `false`, nhưng **số và chuỗi thì render thành text node**. Vậy nên `0` hiện lên màn hình.

```jsx
const items = [];

<div>{items.length && <List items={items} />}</div>
// items.length là 0 → biểu thức trả về 0 → render "0"

<div>{items.length > 0 && <List items={items} />}</div>
// false && ... → false → React bỏ qua, không render gì
```

Cùng bẫy này xảy ra với chuỗi rỗng `""` và `NaN`. Đây là một trong những lỗi hay gặp nhất khi mới học React, và rất khó nhận ra vì con số `0` lọt thỏm giữa giao diện.

</details>

**4. Những giá trị nào React bỏ qua không render, những giá trị nào bị in ra thành text? Vì sao `0` render ra nhưng `false` thì không?**

<details className="qa">
<summary>Xem đáp án</summary>

| Giá trị | Kết quả |
|---|---|
| `null`, `undefined`, `true`, `false` | Bỏ qua, không render gì |
| Số (kể cả `0`, `NaN`) | Render thành text |
| Chuỗi (kể cả `""`) | Render thành text |
| Mảng | Render lần lượt từng phần tử |
| Object thường | **Lỗi** `Objects are not valid as a React child` |

Đây là quyết định thiết kế có chủ đích, **không liên quan tới truthy/falsy**. React cần một cách để nói "chỗ này không hiển thị gì", nên chọn bốn giá trị `null`, `undefined`, `true`, `false` làm ký hiệu cho ý đó — chính nhờ vậy mà `cond && <X />` và `cond ? <X /> : null` chạy gọn gàng.

Còn số và chuỗi là **nội dung thật**: nếu React bỏ qua mọi giá trị falsy thì `{count}` khi `count` bằng 0 sẽ mất luôn số 0 trên giao diện — điều đó còn tệ hơn nhiều. Vậy nên `0` hiển thị, `false` thì không.

Cách nhớ: React lọc theo **kiểu dữ liệu**, không lọc theo tính truthy.

</details>

**5. Nêu ba cách sửa lỗi `&&` với số 0 và cho biết cách nào an toàn nhất trong dự án thật.**

<details className="qa">
<summary>Xem đáp án</summary>

```jsx
// 1. So sánh tường minh — biểu thức trả về boolean thật
{items.length > 0 && <List items={items} />}

// 2. Ép kiểu boolean
{Boolean(items.length) && <List items={items} />}
{!!items.length && <List items={items} />}

// 3. Dùng ternary với null
{items.length > 0 ? <List items={items} /> : null}
```

**An toàn và dễ đọc nhất trong dự án thật là cách 1** — so sánh tường minh. Nó nói rõ ý định ("khi có ít nhất một phần tử"), không phụ thuộc vào việc người đọc nhớ quy tắc falsy, và không thêm ký hiệu lạ như `!!`.

Cách `!!` ngắn nhưng dễ bị hiểu nhầm hoặc bị người khác xoá nhầm khi refactor. Cách ternary với `null` rõ ràng nhưng dài hơn; nó đáng dùng khi sau này có thể cần thêm nhánh else.

Nguyên tắc chung nên ghi nhớ: **vế trái của `&&` trong JSX phải luôn là boolean**. Nếu dự án dùng ESLint, quy tắc `react/jsx-no-leaked-render` sẽ tự bắt lỗi này cho bạn.

</details>

**6. Vì sao lồng ternary nhiều tầng bị coi là code smell? Refactor theo hướng nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì ternary lồng nhau tạo ra "kim tự tháp" — người đọc phải giữ nhiều điều kiện trong đầu cùng lúc mới biết nhánh nào đang chạy. Nó cũng khó thêm nhánh mới, khó debug (không đặt được breakpoint giữa chừng) và dễ sai dấu ngoặc:

```jsx
{status === "loading" ? <Loading />
  : status === "error" ? <Error />
  : status === "success" ? <Content />
  : null}
```

Các hướng refactor:

- **Early return / guard clause**: loại các trạng thái đặc biệt trước, happy path ở cuối. Đây là cách sạch nhất khi điều kiện chi phối toàn bộ component.
- **Lookup object**: ánh xạ giá trị sang component, tra cứu bằng key.
- **`switch`**: đặt trong một hàm phụ hoặc component con; kết hợp TypeScript để có exhaustive check.
- **Tách component con**: mỗi nhánh phức tạp thành một component riêng, tên component nói rõ ý nghĩa.

Kinh nghiệm: **một tầng ternary thì ổn, hai tầng nên xem lại, ba tầng thì refactor**. Nếu indent vượt quá ba cấp, gần như chắc chắn nên dùng early return.

</details>

**7. `early return` (guard clause) giúp gì cho component nhiều trạng thái loading / error / empty?**

<details className="qa">
<summary>Xem đáp án</summary>

Nó biến một khối điều kiện lồng nhau thành **danh sách phẳng, đọc từ trên xuống**. Mỗi dòng xử lý đúng một trạng thái bất thường rồi thoát ngay, nên phần còn lại của hàm luôn là **happy path** với các giả định đã được đảm bảo.

```jsx
function UserProfile({ user, isLoading, error }) {
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return null;

  // Tới đây chắc chắn có user, không lo user?.name
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.bio}</p>
    </div>
  );
}
```

Lợi ích cụ thể:

- Không indent sâu, không "pyramid of doom".
- Thêm trạng thái mới chỉ là thêm một dòng, không phải sửa cấu trúc.
- Phần chính không cần optional chaining phòng thủ khắp nơi.
- Thứ tự guard thể hiện rõ độ ưu tiên — ví dụ `error` phải được kiểm trước `empty`.

Lưu ý quan trọng: **mọi hook phải gọi trước dòng return đầu tiên**, nếu không sẽ vi phạm Rules of Hooks.

</details>

**8. Vì sao không được gọi hook sau một `return` có điều kiện? Rules of Hooks liên quan thế nào tới conditional rendering?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì React lưu state của hook theo **thứ tự gọi** trong mỗi lần render, không theo tên. Nếu có một `return` sớm ở giữa, số lượng hook được gọi sẽ khác nhau giữa các lần render — React sẽ trả nhầm giá trị của hook này cho hook kia, hoặc báo lỗi *"Rendered fewer hooks than expected"*.

```jsx
function Profile({ user, isLoading }) {
  if (isLoading) return <Spinner />;   // lần này chỉ 0 hook chạy

  const [tab, setTab] = useState("info"); // 💥 lần khác mới chạy
  ...
}
```

Cách đúng: **đưa toàn bộ hook lên trên mọi guard clause**.

```jsx
function Profile({ user, isLoading }) {
  const [tab, setTab] = useState("info"); // hook luôn chạy

  if (isLoading) return <Spinner />;
  ...
}
```

Liên hệ với conditional rendering: early return là kỹ thuật rất tốt, nhưng nó tạo ra nhiều đường thoát khỏi hàm — mỗi lần thêm một hook mới, phải kiểm tra xem nó có bị đẩy xuống dưới guard không. ESLint plugin `react-hooks` bắt được lỗi này tự động, nên hãy bật nó.

</details>

**9. Component trả về `null` thì React xử lý ra sao? Khác gì với trả về `false` hoặc không return gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Trả về `null` nghĩa là **"không render gì ra DOM"** — nhưng component vẫn **được mount bình thường**: nó vẫn nằm trong cây React, state vẫn giữ nguyên, các `useEffect` vẫn chạy. Đây khác hẳn với việc cha không render component đó (khi ấy component bị unmount, state mất sạch).

| Giá trị trả về | Kết quả |
|---|---|
| `null` | Không render gì — cách viết chuẩn, rõ ý định |
| `false` | Cũng không render gì; React đối xử y như `null` nhưng ý nghĩa mơ hồ hơn |
| Không `return` (tức `undefined`) | React 17 trở về trước **ném lỗi** *"Nothing was returned from render"*; từ React 18 được chấp nhận và coi như không render gì |

```jsx
function Banner({ show }) {
  if (!show) return null; // rõ ràng, nên dùng
  return <div className="banner">Khuyến mãi!</div>;
}
```

Quy ước: luôn viết `return null` cho tường minh. Trả về `undefined` vì quên `return` thường là **lỗi thật sự**, nên đừng dựa vào việc React 18 tha cho nó.

</details>

**10. Khi nào nên dùng `switch` thay cho lookup object? TypeScript discriminated union và exhaustive check hoạt động thế nào ở đây?**

<details className="qa">
<summary>Xem đáp án</summary>

| Tình huống | Nên dùng |
|---|---|
| Ánh xạ giá trị sang giá trị tĩnh hoặc component | Lookup object |
| Mỗi nhánh có logic riêng, nhiều dòng, có fall-through | `switch` |
| Cần TypeScript ép xử lý hết mọi nhánh | `switch` |

`switch` mạnh hơn ở chỗ TypeScript **thu hẹp kiểu (narrowing)** theo từng `case`. Với một discriminated union, trong mỗi nhánh TS biết chính xác object đang là biến thể nào, nên truy cập field an toàn. Kết hợp với biến `never` ở `default`, ta có **exhaustive check**:

```tsx
type Status = "pending" | "active" | "done" | "failed";

function badge(s: Status): string {
  switch (s) {
    case "pending": return "yellow";
    case "active":  return "green";
    case "done":    return "blue";
    case "failed":  return "red";
    default:
      const _exhaustive: never = s; // chỉ gán được khi đã xử lý hết
      throw new Error("Unhandled");
  }
}
```

Thêm một giá trị mới vào `Status`, TS lập tức báo lỗi tại `_exhaustive` vì `s` không còn là `never` — buộc bạn bổ sung nhánh. Lookup object không có cơ chế này (trừ khi khai báo `Record<Status, T>` để bắt thiếu key).

</details>

**11. Với lookup object dạng `pages = { home: <HomePage /> }`, tất cả element trong object có bị tạo hết không? Nên map sang component type thay vì element trong trường hợp nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Có** — object literal được dựng lại ở **mỗi lần render**, nên `_jsx(HomePage)`, `_jsx(AboutPage)`, `_jsx(ContactPage)` đều được gọi, kể cả với các trang không hiển thị. Cần phân biệt: việc này chỉ **tạo React element** (object mô tả nhẹ nhàng), **chưa gọi thân component** — `HomePage()` chỉ chạy khi React thật sự render nó.

Dù vậy, nên map sang **component type** khi:

- Danh sách nhánh dài, hoặc props truyền vào phải tính toán tốn kém.
- Mỗi nhánh cần props khác nhau — với element dựng sẵn thì props bị cố định.
- Muốn `React.lazy` để code-split từng trang.
- Muốn đặt object ra ngoài component để khỏi tạo lại mỗi render.

```jsx
const pages = { home: HomePage, about: AboutPage }; // map sang type

function Page({ route, user }) {
  const Component = pages[route] ?? NotFound;
  return <Component user={user} />;
}
```

Lưu ý cú pháp: biến chứa component phải **viết hoa chữ cái đầu** thì JSX mới coi là component.

</details>

**12. Ẩn element bằng CSS `display: none` khác gì với không render nó? Ảnh hưởng tới state con, DOM và hiệu năng ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `display: none` | Không render (conditional) |
|---|---|---|
| DOM | Node vẫn tồn tại | Node bị gỡ khỏi DOM |
| State component con | **Giữ nguyên** | **Mất sạch** (unmount) |
| Effect | Vẫn chạy, không cleanup | Chạy cleanup khi unmount |
| Chi phí | Vẫn render, vẫn tốn bộ nhớ DOM | Không tốn gì khi đang ẩn |
| Accessibility | Screen reader bỏ qua, nhưng vẫn còn trong DOM | Sạch hoàn toàn |

Chọn `display: none` khi: nội dung **bật/tắt liên tục** (tab, accordion) và bạn muốn **giữ state** bên trong (nội dung form đang gõ dở, vị trí cuộn), hoặc khi việc dựng lại cây con tốn kém.

Chọn không render khi: nội dung nặng, ít khi hiện (modal, dialog), dữ liệu nhạy cảm không nên nằm trong DOM (HTML vẫn xem được bằng DevTools dù đang ẩn), hoặc khi mỗi lần mở cần trạng thái sạch.

Lưu ý một cái bẫy hiệu năng ngược: giữ hàng trăm node ẩn trong DOM cũng làm chậm trang, còn unmount/mount liên tục một cây lớn lại gây giật. Chọn theo tần suất bật/tắt và kích thước cây con.

</details>

**13. Vì sao gọi setter của state ngay trong thân render để rẽ nhánh lại gây vòng lặp vô hạn? Quy tắc "render phải pure" nghĩa là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì gọi setter làm React **đặt lịch render lại** component. Component chạy lại thì đoạn code đó lại chạy, lại gọi setter, lại render — vòng lặp không có điểm dừng. React thường chặn lại bằng lỗi *"Too many re-renders"*.

```jsx
// SAI — vòng lặp vô hạn
function Component({ data }) {
  if (data.length === 0) {
    setHasData(false); // → re-render → chạy lại → setState...
  }
  return <div />;
}

// ĐÚNG — derive, không cần state
function Component({ data }) {
  const hasData = data.length > 0;
  return <div>{hasData ? <List /> : <Empty />}</div>;
}
```

**"Render phải pure"** nghĩa là: với cùng props và state, thân component phải luôn trả về cùng JSX và **không gây tác dụng phụ** — không gọi setState, không sửa DOM, không gọi API, không mutate biến bên ngoài hay mutate props. Mọi side effect thuộc về event handler hoặc `useEffect`.

Tính thuần khiết này là điều kiện để React tự do gọi lại component nhiều lần, bỏ dở rồi chạy lại (concurrent rendering), hoặc chạy hai lần trong Strict Mode để phát hiện lỗi.

</details>

**14. Khi điều kiện đổi làm React unmount rồi mount lại một cây con, state bên trong cây con đó ra sao? `key` ảnh hưởng thế nào tới reconciliation trong tình huống này?**

<details className="qa">
<summary>Xem đáp án</summary>

State bên trong **mất hoàn toàn**: React chạy cleanup của các effect, huỷ instance, rồi tạo instance mới với state khởi tạo lại từ đầu. Refs cũng bị reset, focus bị mất.

Điều quyết định React giữ hay huỷ là **vị trí trong cây và kiểu component**, chứ không phải nội dung. Nếu cùng vị trí và cùng type, React **giữ lại** state dù props đổi:

```jsx
// Cùng vị trí, cùng type Input → state bên trong được giữ
{isEditing ? <Input label="Sửa" /> : <Input label="Xem" />}
```

`key` cho phép bạn can thiệp vào quyết định đó:

- **Đổi `key`** thì React coi là component khác hẳn, buộc unmount cái cũ và mount cái mới — cách gọn gàng để **reset state** chủ ý (ví dụ `<Form key={user.id} />` khi chuyển sang user khác).
- **Giữ `key` giống nhau** cho hai nhánh khác nhau thì React cố giữ lại state.

Trong danh sách, dùng index làm `key` khi thứ tự có thể đổi sẽ khiến state gán nhầm cho item khác — luôn ưu tiên id ổn định.

</details>

**15. Bạn xử lý bốn trạng thái loading / error / empty / success của một màn hình danh sách như thế nào cho dễ đọc và dễ mở rộng?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng **guard clause theo đúng thứ tự ưu tiên**, mỗi trạng thái một dòng, happy path ở cuối:

```jsx
function ItemList({ items, isLoading, error }) {
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;
  if (items.length === 0) return <EmptyState />;

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

Vài nguyên tắc để dễ mở rộng:

- **Thứ tự quan trọng**: loading trước error, error trước empty — nếu không, lúc đang tải bạn sẽ chớp qua màn hình "chưa có dữ liệu".
- **Mỗi trạng thái là một component riêng** (`Skeleton`, `ErrorMessage`, `EmptyState`) để tái dùng và test độc lập.
- **Dùng `status` dạng union** (`"loading" | "error" | "empty" | "success"`) thay vì nhiều boolean rời rạc — tránh các tổ hợp vô nghĩa như vừa loading vừa error.
- **Tách logic ra hook** (`useItems`) để component chỉ còn việc hiển thị; thư viện như TanStack Query trả sẵn `isLoading`, `error`, `data`.

Với nhiều nhánh hơn nữa, chuyển sang `switch` trên `status` kèm exhaustive check của TypeScript.

</details>

---

## 4. Composition

Bài học: [4. Composition](../../react/04-component-basics/4_composition.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Composition trong React là gì? Vì sao React khuyến nghị composition thay vì inheritance để tái sử dụng UI?**

<details className="qa">
<summary>Xem đáp án</summary>

**Composition** là ghép nhiều component nhỏ lại thành component lớn hơn, thay vì cho component này kế thừa component kia. Component cha chừa sẵn "chỗ trống" (`children`, props dạng JSX) để nơi sử dụng quyết định nội dung.

Vì sao không dùng inheritance:

- **Cứng nhắc**: mỗi biến thể lại phải tạo một subclass mới (`WarningDialog extends Dialog`), số lớp phình ra rất nhanh.
- **Coupling chặt**: subclass phụ thuộc vào chi tiết bên trong lớp cha; sửa lớp cha có nguy cơ làm vỡ mọi lớp con.
- **Khó tổ hợp**: cần hai hành vi từ hai lớp cha khác nhau thì bế tắc, còn composition chỉ việc lồng thêm.
- **Không hợp với function component**: React hiện đại không còn dùng class, nên `extends` cũng không còn chỗ đứng.

```jsx
function Dialog({ title, children }) {
  return <div className="dialog">{title}{children}</div>;
}

<Dialog title={<h1 className="warn">Cảnh báo</h1>}>
  <p>Nội dung tùy ý.</p>
</Dialog>
```

React docs nói rõ: chưa từng gặp trường hợp nào cần inheritance mà composition không giải quyết được.

</details>

**2. `children` là prop đặc biệt hay prop bình thường? Có mấy cách truyền nội dung vào bên trong một component?**

<details className="qa">
<summary>Xem đáp án</summary>

`children` là **một prop bình thường** — chỉ khác ở chỗ JSX có cú pháp riêng để gán cho nó: mọi thứ nằm giữa thẻ mở và thẻ đóng đều được compiler gom vào `props.children`. Hai cách viết dưới đây là tương đương:

```jsx
<Card>Nội dung</Card>
<Card children="Nội dung" />   // hợp lệ, nhưng không ai viết thế
```

Các cách truyền nội dung vào bên trong component:

- **`children`** — cách tự nhiên nhất khi chỉ có một vùng nội dung.
- **Props dạng JSX (slot pattern)** — `header={<NavBar />}` khi cần nhiều vùng riêng biệt.
- **Render props** — truyền một hàm, component gọi hàm đó với dữ liệu nội bộ để nơi dùng tự quyết định render gì.
- **`children` là hàm** — biến thể của render props: `` {(data) => <List data={data} />} ``.
- **Compound components** — nội dung là các sub-component chuyên biệt (`Card.Header`), chia sẻ state qua Context.

Chọn cách nào tuỳ số lượng vùng cần tuỳ biến và việc con có cần đọc state nội bộ của cha hay không.

</details>

**3. So sánh `children` prop và slot pattern (truyền JSX qua các props có tên) — khi nào chọn cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `children` | Slot pattern |
|---|---|---|
| Số vùng tuỳ biến | Một | Nhiều, mỗi vùng một tên |
| Cú pháp nơi dùng | Tự nhiên, giống HTML | Dài hơn, dạng attribute |
| Ý nghĩa từng vùng | Ngầm hiểu | Tường minh qua tên prop |
| Kiểm soát thứ tự | Nơi dùng quyết định | Component quyết định vị trí từng slot |

```jsx
// children — một vùng
<Card><p>Nội dung</p></Card>

// slot — nhiều vùng có tên
<Layout
  header={<NavBar />}
  sidebar={<Sidebar />}
  main={<HomePage />}
/>
```

Chọn `children` khi component chỉ là lớp bọc quanh một khối nội dung: `Card`, `Modal`, `Button`, `Container`. Chọn slot khi bố cục có **nhiều vùng cố định** mà component phải tự đặt đúng chỗ: layout trang, bảng có toolbar và footer, dialog có title/body/actions.

Hai cách hoàn toàn kết hợp được: `children` cho phần thân chính, thêm vài prop slot cho các vùng phụ. Tránh dùng quá nhiều slot — trên bốn, năm vùng thì compound components thường dễ đọc hơn.

</details>

**4. `children` có thể mang những kiểu giá trị nào? `React.Children` cung cấp các tiện ích gì và vì sao chúng ít được khuyến khích?**

<details className="qa">
<summary>Xem đáp án</summary>

`children` có thể là bất cứ thứ gì React render được: chuỗi, số, một React element, **mảng** element, `null`/`undefined`/boolean (không render), Fragment, hoặc thậm chí **một hàm** (render props). Vì hình dạng không cố định, đừng bao giờ giả định `children` luôn là mảng hay luôn có đúng một phần tử.

`React.Children` là bộ tiện ích để xử lý sự lộn xộn đó:

- `React.Children.map` — duyệt an toàn dù `children` là một phần tử hay mảng, tự bỏ qua `null`.
- `React.Children.count` — đếm số con.
- `React.Children.toArray` — chuyển thành mảng phẳng, tự gán key.
- `React.Children.only` — khẳng định chỉ có đúng một con.

Vì sao ít khuyến khích: chúng khiến component **phụ thuộc vào hình dạng cây con**. Chỉ cần nơi dùng bọc thêm một `div` hay một Fragment, hoặc render qua `.map`, mọi giả định đều vỡ. Code cũng khó gõ kiểu với TypeScript và khó debug.

Hướng thay thế: dùng **Context** để chia sẻ dữ liệu xuống sâu bao nhiêu tầng cũng được, hoặc dùng **slot props** để nhận đúng thứ mình cần.

</details>

**5. Compound components là gì? Các sub-component chia sẻ state ngầm với nhau bằng cơ chế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Compound components** là nhóm các component được thiết kế để dùng cùng nhau, mỗi cái đảm nhiệm một phần của một khối UI: `Accordion` với `Accordion.Item`, `Tabs` với `Tabs.List` và `Tabs.Panel`. Nơi dùng chỉ việc sắp xếp chúng như HTML, không phải truyền state qua lại.

Cơ chế chia sẻ state ngầm là **Context API**: component cha giữ state và bọc con trong một Provider; các sub-component gọi `useContext` để đọc.

```jsx
const AccordionContext = createContext();

function Accordion({ children }) {
  const [openItem, setOpenItem] = useState(null);
  return (
    <AccordionContext.Provider value={{ openItem, setOpenItem }}>
      <div className="accordion">{children}</div>
    </AccordionContext.Provider>
  );
}

function AccordionItem({ id, title, children }) {
  const { openItem, setOpenItem } = useContext(AccordionContext);
  const isOpen = openItem === id;
  ...
}

Accordion.Item = AccordionItem;
```

Nhờ Context, sub-component nằm sâu bao nhiêu tầng vẫn đọc được state, và nơi dùng có toàn quyền bố trí markup xen giữa. Nên kiểm tra context rỗng để báo lỗi rõ ràng khi ai đó dùng `Accordion.Item` ngoài `Accordion`.

</details>

**6. Vì sao Radix UI và Headless UI chọn compound components làm kiểu API chính? Ưu điểm cho người dùng thư viện là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì các thư viện này theo triết lý **headless**: cung cấp hành vi, trạng thái và accessibility, còn giao diện để người dùng tự quyết. Compound components là API hợp nhất với triết lý đó — mỗi phần của widget là một component riêng, người dùng tự sắp xếp và tự style.

Ưu điểm cho người dùng thư viện:

- **Toàn quyền về markup và style**: muốn chèn icon giữa title và nội dung, muốn đổi thứ tự, muốn bọc thêm lớp — cứ việc, không phải chờ thư viện thêm prop.
- **Tránh "bùng nổ props"**: thay vì một component nhận `titleClassName`, `bodyStyle`, `renderFooter`..., mỗi phần tự nhận props của mình.
- **API tự mô tả**: nhìn JSX là hiểu cấu trúc, gõ `Dialog.` là autocomplete gợi ra các phần.
- **Accessibility miễn phí**: thư viện tự lo `aria-*`, quản lý focus, điều hướng bàn phím — phần khó nhất và hay bị làm sai nhất.
- **Không phụ thuộc state thủ công**: trạng thái mở/đóng, tab đang chọn đi ngầm qua Context.

Đánh đổi: JSX dài hơn, và người dùng phải học cấu trúc của từng widget.

</details>

**7. `React.cloneElement` giải quyết vấn đề gì? Nêu ba nhược điểm và cách thay thế bằng Context.**

<details className="qa">
<summary>Xem đáp án</summary>

Nó được dùng để **tiêm thêm props vào các element con** mà component cha nhận qua `children` — cha muốn "cấu hình" con nhưng con lại do nơi khác viết ra:

```jsx
function Form({ children }) {
  return (
    <form>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { className: "field" })
      )}
    </form>
  );
}
```

Ba nhược điểm:

- **Không type-safe**: TypeScript không biết props nào được tiêm vào, nên không kiểm tra được gì.
- **Khó suy luận và debug**: đọc code nơi dùng không thấy props đó ở đâu ra; props tiêm vào có thể vô tình ghi đè props người dùng đặt.
- **Ràng buộc hình dạng children**: chỉ chạy khi con là element trực tiếp — bọc thêm một `div`, một Fragment hay một text node là hỏng.

Thay bằng **Context**: cha đặt giá trị vào Provider, con nào cần thì tự đọc — sâu bao nhiêu tầng cũng được, có kiểu rõ ràng, và nhìn code con là biết nó phụ thuộc gì.

```jsx
const FormContext = createContext();

function Form({ children }) {
  return (
    <FormContext.Provider value={{ className: "field" }}>
      <form>{children}</form>
    </FormContext.Provider>
  );
}
```

</details>

**8. `render props` là gì? Cho một ví dụ và so sánh với custom hook về khả năng tái dùng.**

<details className="qa">
<summary>Xem đáp án</summary>

**Render props** là kỹ thuật truyền **một hàm** làm prop; component giữ logic sẽ gọi hàm đó với dữ liệu nội bộ, còn nơi dùng quyết định render ra gì.

```jsx
function DataLoader({ url, render }) {
  const [data, setData] = useState(null);
  // ...gọi API rồi setData
  return render(data);
}

<DataLoader url="/api/users" render={(data) => <List data={data} />} />
```

So với custom hook:

| | Render props | Custom hook |
|---|---|---|
| Chia sẻ | Logic **và** một chỗ đặt UI | Chỉ logic |
| Cú pháp | Lồng nhiều tầng khi kết hợp nhiều nguồn | Gọi song song, phẳng |
| Kiểu dữ liệu | Gõ kiểu rườm rà hơn | Suy luận kiểu tự nhiên |
| Cây component | Tạo thêm tầng bọc | Không thêm tầng nào |

Ba render props lồng nhau tạo ra "callback hell" trong JSX, trong khi ba custom hook chỉ là ba dòng liền nhau. Vì vậy từ khi có hooks (React 16.8), custom hook gần như thay thế hoàn toàn render props cho việc tái dùng **logic**.

Render props vẫn còn giá trị khi component thật sự cần kiểm soát **thời điểm và vị trí** render — ví dụ danh sách ảo hoá tự quyết định render dòng nào.

</details>

**9. HOC là gì? Nêu nhược điểm (wrapper hell, mất `ref`, khó gõ kiểu) so với custom hook.**

<details className="qa">
<summary>Xem đáp án</summary>

**HOC (Higher-Order Component)** là hàm nhận vào một component và trả về một component mới đã được bổ sung hành vi hoặc props:

```jsx
const EnhancedComponent = withAuth(MyComponent);
```

Nhược điểm:

- **Wrapper hell**: chồng nhiều HOC (`withAuth(withTheme(withRouter(C)))`) làm React DevTools đầy các tầng bọc vô nghĩa, khó lần ra component thật.
- **Mất `ref`**: `ref` không đi qua HOC như props thường — phải bọc thêm `forwardRef` thì mới xuyên xuống được.
- **Khó gõ kiểu**: TypeScript phải mô tả "component nhận props X, trả về component nhận props X trừ đi Y", rất rối và dễ sai.
- **Xung đột tên props**: hai HOC cùng tiêm một tên prop thì cái sau ghi đè cái trước, âm thầm.
- **Không rõ nguồn gốc props**: nhìn component không biết prop đến từ HOC nào.

Custom hook giải quyết hết: không thêm tầng nào vào cây, `ref` không liên quan, kiểu suy luận tự nhiên, và dòng `const user = useAuth()` nói rõ dữ liệu từ đâu ra. HOC ngày nay chủ yếu còn thấy trong code cũ hoặc ở các API buộc phải bọc như `React.memo`.

</details>

**10. Nếu chỉ cần tái dùng logic chứ không phải UI thì nên dùng gì? Vì sao custom hook được ưa chuộng nhất hiện nay?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng **custom hook** — một hàm thường có tên bắt đầu bằng `use`, bên trong gọi các hook có sẵn của React và trả về dữ liệu hoặc hàm xử lý.

```jsx
function useUser(id) {
  const [user, setUser] = useState(null);
  const [isLoading, setLoading] = useState(true);
  // gọi API trong useEffect...
  return { user, isLoading };
}

function Profile({ id }) {
  const { user, isLoading } = useUser(id); // tái dùng ở bao nhiêu component cũng được
}
```

Vì sao được ưa chuộng nhất:

- **Không đụng tới cây component**: khác HOC và render props, hook không thêm tầng bọc nào.
- **Phẳng và dễ đọc**: gọi năm hook là năm dòng liền nhau, không lồng nhau.
- **Type-safe tự nhiên**: chỉ là hàm JS bình thường, TypeScript suy luận kiểu dễ dàng.
- **Ghép được**: hook này gọi hook kia thoải mái.
- **Tách rõ logic và UI**: component chỉ còn việc hiển thị, logic test được độc lập.

Lưu ý: hook chia sẻ **logic**, không chia sẻ **state** — mỗi component gọi hook sẽ có state riêng. Muốn dùng chung state thì cần Context hoặc thư viện quản lý state.

</details>

**11. "Specialization" (ví dụ tạo `WarningDialog` từ `Dialog`) được làm thế nào trong React mà không cần `extends`?**

<details className="qa">
<summary>Xem đáp án</summary>

Chỉ cần viết một component **bọc lại** component tổng quát và truyền sẵn props cụ thể — không cần kế thừa gì cả:

```jsx
function Dialog({ title, icon, children, ...rest }) {
  return (
    <div className="dialog" {...rest}>
      {icon}
      {title}
      {children}
    </div>
  );
}

function WarningDialog({ children, ...rest }) {
  return (
    <Dialog
      title={<h1 className="warn">Cảnh báo</h1>}
      icon={<WarningIcon />}
      {...rest}
    >
      {children}
    </Dialog>
  );
}
```

Đây chính là quan hệ "is-a" của inheritance được diễn đạt bằng composition: `WarningDialog` **dùng** `Dialog` thay vì **kế thừa** nó.

Vài lưu ý để bản chuyên biệt vẫn linh hoạt:

- **Spread `...rest`** xuống component gốc để nơi dùng vẫn truyền được props khác.
- Đặt `{...rest}` **sau** các props mặc định nếu muốn cho phép ghi đè, đặt trước nếu muốn khoá cứng.
- Giữ `children` nguyên vẹn để nội dung vẫn tuỳ biến được.

Cách này linh hoạt hơn subclass vì bạn bọc bao nhiêu tầng, kết hợp bao nhiêu component tuỳ ý.

</details>

**12. Truyền component qua prop (`component={Icon}`) khác gì truyền element (`icon={<Icon />}`)? Mỗi cách phù hợp khi nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Truyền component (`component={Icon}`) | Truyền element (`icon={<Icon />}`) |
|---|---|---|
| Giá trị truyền đi | Chính hàm component | React element đã tạo sẵn |
| Ai quyết định props | Component nhận | Nơi dùng |
| Render nhiều lần với props khác nhau | Được | Không — element đã cố định |
| Biến trong JSX | Phải viết hoa: `const C = component` | Nhúng thẳng `{icon}` |

```jsx
// Truyền component — nơi nhận tự quyết props
function Button({ component: Icon, label }) {
  return <button><Icon size={16} /> {label}</button>;
}
<Button component={SearchIcon} label="Tìm" />

// Truyền element — nơi dùng đã quyết props
function Button({ icon, label }) {
  return <button>{icon} {label}</button>;
}
<Button icon={<SearchIcon size={24} color="red" />} label="Tìm" />
```

Chọn **truyền component** khi nơi nhận cần tự truyền props (kích thước, dữ liệu của từng dòng trong danh sách), hoặc cần render nó nhiều lần. Chọn **truyền element** khi nơi dùng muốn toàn quyền cấu hình và nơi nhận chỉ việc đặt vào đúng chỗ — đây cũng chính là slot pattern, đơn giản và đủ dùng trong đa số trường hợp.

</details>

**13. Vì sao truyền một cây JSX từ cha xuống qua `children` có thể giúp phần cây đó không re-render khi state của component bọc thay đổi?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì `children` lúc đó là một **element đã được tạo ở component cha**. Khi state của component bọc đổi, chỉ mình nó chạy lại; nó không tạo lại element `children` mà chỉ nhận lại **đúng tham chiếu cũ**. React so sánh element mới với element cũ, thấy giống hệt nhau, nên **bỏ qua** việc render lại cây con đó.

```jsx
// Cây con nằm trong ExpensiveTree được tạo ở App, không phải trong Wrapper
function App() {
  return (
    <Wrapper>
      <ExpensiveTree />   {/* App không re-render → element này giữ nguyên */}
    </Wrapper>
  );
}

function Wrapper({ children }) {
  const [count, setCount] = useState(0); // state đổi liên tục
  return (
    <div onClick={() => setCount(count + 1)}>
      {count}
      {children}   {/* không render lại */}
    </div>
  );
}
```

Nếu viết `<ExpensiveTree />` **bên trong** `Wrapper`, mỗi lần `count` đổi element sẽ được tạo mới và cây con render lại.

Kỹ thuật này gọi là **"lifting content up"** hay "children as a prop" — một cách tối ưu hiệu năng không cần `memo`, chỉ cần bố trí lại component.

</details>

**14. Gán sub-component bằng dot notation (`Card.Header = ...`) so với named export — khác nhau thế nào về tree-shaking, kiểu dữ liệu và khả năng kiểm tra thứ tự con?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Dot notation | Named export |
|---|---|---|
| Tree-shaking | Kém — import `Card` là kéo theo mọi sub-component | Tốt — bundler bỏ được phần không dùng |
| Kiểu dữ liệu (TS) | Phải khai báo thêm kiểu cho các thuộc tính gắn vào hàm | Mỗi component một kiểu độc lập, đơn giản |
| Khám phá API | Rất tốt — gõ `Card.` là thấy hết các phần | Phải nhớ tên hoặc xem tài liệu |
| Quan hệ nhóm | Thể hiện rõ ngay trong cú pháp | Chỉ thể hiện qua quy ước đặt tên |

```jsx
// Dot notation
Card.Header = function CardHeader({ children }) { ... };

// Named export
export function CardHeader({ children }) { ... }
```

Về **kiểm tra thứ tự / kiểu của children**: cả hai đều cho phép so sánh `child.type === CardHeader` khi duyệt `React.Children`, dot notation chỉ tiện hơn ở chỗ tham chiếu luôn sẵn trên `Card`. Nhưng đây là cách làm **không nên khuyến khích**: chỉ cần nơi dùng bọc thêm một lớp, dùng Fragment hay render qua `.map` là kiểm tra sai ngay. Muốn ràng buộc quan hệ cha–con, hãy dùng **Context** và báo lỗi khi sub-component không tìm thấy provider.

Thực tế nhiều thư viện dùng cả hai: export rời để tree-shake, đồng thời gắn dot notation cho tiện dùng.

</details>

**15. Dấu hiệu nào cho thấy bạn đã composition quá đà (over-abstraction)? Cân bằng giữa linh hoạt và đơn giản ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Các dấu hiệu cảnh báo:

- Component chỉ có **một nơi dùng** nhưng đã có sáu, bảy props để "phòng khi cần".
- Phải mở ba, bốn file mới hiểu một khối UI đơn giản làm gì.
- Component bọc chỉ để truyền tiếp props, không thêm giá trị nào (`{...props}` rồi thôi).
- Props kiểu `renderX`, `isY`, `variantZ` chồng chất, nhiều tổ hợp không bao giờ được dùng.
- Sửa một yêu cầu nhỏ lại phải đụng vào nhiều tầng trừu tượng.
- Người mới vào dự án không đoán được nên dùng component nào.

Cách cân bằng:

- **Đợi tới lần thứ ba mới trừu tượng hoá**: lặp lại một lần thì cứ copy, ba lần mới rút ra pattern — lúc đó bạn đã đủ dữ kiện để thiết kế đúng.
- **Thêm props theo nhu cầu thật**, không theo dự đoán tương lai.
- Ưu tiên **nhiều component nhỏ, rõ ràng** hơn một component khổng lồ đầy `variant`.
- Trùng lặp một chút còn rẻ hơn một trừu tượng hoá sai — gỡ một abstraction sai tốn hơn nhiều so với viết lại vài dòng giống nhau.

Mục tiêu cuối cùng là **dễ đọc và dễ sửa**, không phải linh hoạt tối đa.

</details>
