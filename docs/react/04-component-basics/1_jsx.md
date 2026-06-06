---
sidebar_position: 1
title: "1. JSX"
---

# JSX

**JSX** (cú pháp cho phép viết HTML ngay trong JavaScript) là cách React mô tả giao diện sẽ hiển thị. Nó trông giống HTML nhưng thực chất là JavaScript, nên được trình biên dịch (Babel hoặc SWC) chuyển thành các lời gọi hàm trước khi chạy trên trình duyệt. Bài này giải thích JSX là gì, các quy tắc cú pháp, cách nhúng JavaScript vào JSX và cách nó được biên dịch.

---

## Mục lục

- [JSX là gì?](#jsx-là-gì)
- [Quy tắc cú pháp](#quy-tắc-cú-pháp)
- [Embed JavaScript trong JSX](#embed-javascript-trong-jsx)
- [Fragment](#fragment)
- [JSX biên dịch thành gì?](#jsx-biên-dịch-thành-gì)

---

## JSX là gì?

**JSX (JavaScript XML)** là cú pháp **mở rộng JavaScript** cho phép viết
"HTML" trong JS:

```jsx
const element = <h1>Hello, world!</h1>;
```

JSX không phải string, cũng không phải HTML thuần — nó được **biên dịch
thành function call**:

```jsx
const element = <h1 className="title">Hi</h1>;

// Biên dịch thành:
const element = React.createElement("h1", { className: "title" }, "Hi");
```

---

## Quy tắc cú pháp

**1. Chỉ trả về 1 root element**:

```jsx
// Sai — 2 root
return (
  <h1>Title</h1>
  <p>Body</p>
);

// Đúng — wrap trong div
return (
  <div>
    <h1>Title</h1>
    <p>Body</p>
  </div>
);

// Đúng — Fragment (không thêm DOM node)
return (
  <>
    <h1>Title</h1>
    <p>Body</p>
  </>
);
```

**2. Đóng mọi thẻ**:

```jsx
<img src="..." />     // self-closing bắt buộc
<br />
<input type="text" /> // không phải <input>
```

**3. Attribute camelCase** (vì là JS property):

```jsx
<div className="box">        {/* không phải class */}
<label htmlFor="email">      {/* không phải for */}
<button onClick={handle}>    {/* không phải onclick */}
<input tabIndex={1} />       {/* không phải tabindex */}
<svg viewBox="...">          {/* SVG vẫn dùng kebab cho 1 số attr */}
```

**4. Inline style là object**:

```jsx
<div style={{ color: "red", fontSize: "16px" }}>
  Hello
</div>
```

Hai dấu ngoặc nhọn — ngoài là JSX expression, trong là object literal.

:::warning[Cần lưu ý]

**`class` là từ khoá JS** (cho ES6 class) → React dùng `className` thay thế.

Tương tự `for` (vòng lặp) → `htmlFor`.

Khi copy-paste HTML từ web vào JSX, **dùng tool convert** (nhiều plugin
VSCode có sẵn). Hoặc nhớ replace:

- `class=` → `className=`
- `for=` → `htmlFor=`
- `tabindex=` → `tabIndex=`
- `style="color: red"` → `style={{ color: "red" }}`

:::

---

## Embed JavaScript trong JSX

Dùng `{}` để chèn biểu thức JS:

```jsx
const name = "An";
const age = 25;
const isAdmin = true;

return (
  <div>
    <h1>Hello {name}</h1>
    <p>Age: {age}</p>
    <p>Status: {isAdmin ? "Admin" : "User"}</p>
    <p>Next year: {age + 1}</p>
    <p>Upper: {name.toUpperCase()}</p>
  </div>
);
```

**Không được dùng**:

- `if/else` statement (dùng ternary hoặc `&&`).
- `for` loop (dùng `.map`).
- Statement (only expression).

```jsx
// Sai — statement
return (
  <div>
    {if (cond) { ... }}
  </div>
);

// Đúng — expression
return (
  <div>
    {cond ? <A /> : <B />}
  </div>
);
```

:::tip[Mẹo]

**Render list bằng `.map`**:

```jsx
const items = ["Apple", "Banana", "Cherry"];

return (
  <ul>
    {items.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
);
```

Mỗi item cần `key` duy nhất — sẽ học chi tiết ở phần Lists and Keys.

:::

---

## Fragment

`<>...</>` (short) hoặc `<Fragment>...</Fragment>` — wrap nhiều element
**không tạo extra DOM node**:

```jsx
return (
  <>
    <h1>Title</h1>
    <p>Body</p>
  </>
);
```

Khi cần `key` (trong list), dùng dạng đầy đủ:

```jsx
import { Fragment } from "react";

items.map(item => (
  <Fragment key={item.id}>
    <dt>{item.term}</dt>
    <dd>{item.desc}</dd>
  </Fragment>
));
```

---

## JSX biên dịch thành gì?

JSX **không chạy trực tiếp** trong trình duyệt — phải qua bundler (Vite,
Webpack) với plugin Babel/SWC.

**Trước React 17:**

```jsx
<div className="box">
  <h1>Hi</h1>
</div>

// Compile thành:
React.createElement("div", { className: "box" },
  React.createElement("h1", null, "Hi")
);
```

→ Mọi file JSX phải `import React from "react"` dù không dùng `React`
trực tiếp.

**Từ React 17 (new JSX transform):**

```jsx
// Không cần import React
function App() {
  return <div>Hi</div>;
}

// Compile thành:
import { jsx as _jsx } from "react/jsx-runtime";
const App = () => _jsx("div", { children: "Hi" });
```

→ Không cần `import React`, bundle nhỏ hơn, tối ưu hơn.

:::info[Phân tích]

**Sự ra đời của JSX transform mới (React 17)** giải quyết:

1. **Bundle size**: cũ luôn cần `React` trong scope — bundler không
   loại bỏ được dù file chỉ dùng JSX không gọi method React.
2. **Phân biệt prop key reserved** — `children` được tách rõ ràng.
3. **Tối ưu compile**: phân biệt `jsx` (1 child static), `jsxs` (children
   là array), `jsxDEV` (chứa source location cho dev).

Để bật:

```json
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx"
  }
}
```

Phần lớn project mới (Vite, Next.js) đã bật mặc định. Bạn vẫn thấy
`import React from "react"` trong example cũ vì lý do legacy.

:::

:::tip[Mẹo]

**JSX không phải duy nhất của React** — Solid.js, Preact, Stencil đều
dùng JSX. Compiler khác nhau (Babel, SWC, esbuild, swc-jsx) nhưng cú
pháp giống nhau.

Vue có **template syntax** riêng, Svelte có **template Svelte** — không
phải JSX. Khi đọc tài liệu UI library, kiểm tra trước:

- React → JSX.
- Vue → `<template>`.
- Svelte → `.svelte` file format.
- Solid → JSX (giống React).

:::
