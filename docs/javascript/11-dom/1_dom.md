---
sidebar_position: 1
title: "1. DOM Manipulation và Events"
---

# DOM Manipulation và Events

**DOM** (Document Object Model — cây cấu trúc biểu diễn toàn bộ các phần tử của một trang web) là cầu nối giúp JavaScript đọc và thay đổi nội dung, kiểu dáng của trang. **DOM Manipulation** (thao tác DOM) là việc dùng JavaScript để chọn, thêm, sửa hoặc xóa các phần tử HTML. **Events** (sự kiện) là các hành động của người dùng như nhấp chuột hay gõ phím, và bạn dùng **event listener** (bộ lắng nghe sự kiện) để chạy code phản hồi lại những hành động đó.

---

## Mục lục

- [DOM là gì?](#dom-là-gì)
- [Selectors](#selectors)
- [DOM Manipulation](#dom-manipulation)
- [Event Listeners](#event-listeners)
- [Event Bubbling và Capturing](#event-bubbling-và-capturing)
- [Event Delegation](#event-delegation)

---

## DOM là gì?

**DOM (Document Object Model)** là cấu trúc cây mà trình duyệt tạo ra
từ HTML — mỗi thẻ là một **node**.

```html
<div id="app">
  <h1>Title</h1>
  <p>Para</p>
</div>
```

JavaScript truy cập DOM qua `document`:

```js
document.title;
document.body;
document.documentElement; // <html>
```

---

## Selectors

API tìm element trong DOM:

```js
// Tìm 1 element
document.getElementById("app");
document.querySelector("#app");
document.querySelector(".btn.primary");
document.querySelector("ul > li:first-child");

// Tìm nhiều element
document.querySelectorAll(".btn");          // NodeList
document.getElementsByClassName("btn");     // HTMLCollection (live)
document.getElementsByTagName("li");        // HTMLCollection (live)
```

| API | Trả về | Live? | Hỗ trợ CSS selector |
|-----|--------|-------|---------------------|
| `getElementById` | Element \| null | - | Không |
| `getElementsByClassName` | HTMLCollection | **Có** | Không |
| `getElementsByTagName` | HTMLCollection | **Có** | Không |
| `querySelector` | Element \| null | - | **Có** |
| `querySelectorAll` | NodeList | Không | **Có** |

:::info[Phân tích]

**Live vs Static collection**:

- **Live** (`getElementsBy*`): tự cập nhật khi DOM thay đổi.
- **Static** (`querySelectorAll`): chụp ảnh tại thời điểm gọi.

```js
const items = document.getElementsByClassName("item");
console.log(items.length); // 3

document.body.appendChild(newItem); // thêm 1 item

console.log(items.length); // 4 — tự cập nhật

const items2 = document.querySelectorAll(".item");
// items2.length vẫn = 3 dù DOM thay đổi
```

Live collection thuận tiện nhưng **chậm hơn** vì phải invalidate cache.
Trong code mới, hầu như chỉ dùng `querySelector`/`querySelectorAll` để
tránh nhầm.

:::

---

## DOM Manipulation

**Tạo và chèn element:**

```js
const div = document.createElement("div");
div.textContent = "Hello";
div.className = "box";

document.body.appendChild(div);
document.body.prepend(div);            // chèn đầu
document.body.insertBefore(div, ref);  // chèn trước ref

div.remove();                          // xoá khỏi DOM
```

**Sửa nội dung:**

```js
el.textContent = "plain text";        // an toàn
el.innerHTML = "<b>html</b>";          // nguy hiểm (XSS)
el.innerText = "rendered text";        // tính cả CSS

el.setAttribute("data-id", "1");
el.getAttribute("data-id");
el.dataset.id;                          // tương đương data-* attribute
el.classList.add("active");
el.classList.remove("disabled");
el.classList.toggle("hidden");
el.classList.contains("active");

el.style.color = "red";                 // inline style
```

:::warning[Cần lưu ý]

**`innerHTML` rất nguy hiểm với input người dùng** — gây **XSS**:

```js
const userInput = "<img src=x onerror='alert(1)'>";
el.innerHTML = userInput; // XSS — alert chạy!
```

Cách an toàn:

```js
el.textContent = userInput;  // luôn an toàn

// Hoặc sanitize trước
import DOMPurify from "dompurify";
el.innerHTML = DOMPurify.sanitize(userInput);
```

React/Vue dùng `textContent` mặc định — `dangerouslySetInnerHTML` /
`v-html` mới dùng `innerHTML` (kèm warning rõ trong tên).

:::

---

## Event Listeners

```js
button.addEventListener("click", (e) => {
  console.log("Clicked");
  console.log(e.target);
});

// Remove listener — cần cùng reference function
function handler(e) {}
button.addEventListener("click", handler);
button.removeEventListener("click", handler);
```

Options:

```js
button.addEventListener("click", handler, {
  once: true,      // chỉ chạy 1 lần
  capture: true,   // ở pha capture (mặc định bubble)
  passive: true,   // không gọi preventDefault → tối ưu scroll
  signal: controller.signal, // cancel qua AbortController
});

// Cancel listener qua AbortController (hiện đại)
const controller = new AbortController();
button.addEventListener("click", handler, { signal: controller.signal });
controller.abort(); // remove listener
```

:::tip[Mẹo]

**`AbortController` để cancel nhiều listener** cùng lúc — pattern hiện
đại:

```js
function setupComponent() {
  const ctrl = new AbortController();
  const opts = { signal: ctrl.signal };

  button.addEventListener("click", handleClick, opts);
  input.addEventListener("change", handleChange, opts);
  window.addEventListener("resize", handleResize, opts);

  // Khi component unmount
  return () => ctrl.abort(); // hủy cả 3 listener
}
```

Tương tự `useEffect` cleanup trong React — gọn hơn maintain 3 cleanup
function.

:::

---

## Event Bubbling và Capturing

Khi event xảy ra, nó **đi qua 3 pha**:

1. **Capture** — từ `document` xuống target.
2. **Target** — tại element phát sinh event.
3. **Bubble** — từ target trở lại `document`.

```html
<div id="outer">
  <button id="inner">Click</button>
</div>
```

```js
outer.addEventListener("click", () => console.log("outer"));
inner.addEventListener("click", () => console.log("inner"));

// Click vào inner:
// "inner" → "outer" (bubble)

// Bắt ở capture phase
outer.addEventListener("click", () => console.log("outer capture"), true);
// "outer capture" → "inner" → "outer"
```

`e.stopPropagation()` — chặn lan toả:

```js
inner.addEventListener("click", (e) => {
  e.stopPropagation();
  console.log("inner");
});
// Outer không nhận event
```

`e.preventDefault()` — chặn behavior mặc định:

```js
form.addEventListener("submit", (e) => {
  e.preventDefault();
  // không submit reload page
});

link.addEventListener("click", (e) => {
  e.preventDefault();
  // không navigate
});
```

---

## Event Delegation

**Pattern**: gắn một listener ở parent, xử lý event của nhiều children.

```html
<ul id="list">
  <li>A</li>
  <li>B</li>
  <li>C</li>
</ul>
```

```js
// Tệ — gắn n listener
document.querySelectorAll("#list li").forEach(li => {
  li.addEventListener("click", handler);
});

// Tốt — 1 listener
document.getElementById("list").addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    console.log(e.target.textContent);
  }
});
```

Lợi ích:

- Ít memory hơn (1 listener vs n).
- Hoạt động với **element thêm động** (không cần re-attach).
- Code gọn hơn.

:::info[Phân tích]

Event delegation là **cơ chế chính** mà React dùng dưới hood. Trong
React 17+, mọi event được gắn ở **root** (`#root`), không phải từng
element:

```jsx
<button onClick={handleClick}>Click</button>
```

React thực ra không gắn `onclick` lên button — nó dùng synthetic event
system với 1 listener ở root, sau đó dispatch về component đúng vị trí
trong tree.

Lợi ích React tận dụng:
- Tối ưu memory (1 listener cho cả app).
- Cross-browser event normalization.
- React batches state updates trong cùng event.

Hiểu cơ chế này giúp debug khi gặp lỗi event trong React (vd
`stopPropagation` không hoạt động như mong đợi vì event đã bubble qua
React root).

:::
