---
sidebar_position: 2
title: "2. Hoisting và Quy tắc đặt tên"
---

# Hoisting và Quy tắc đặt tên

---

## Mục lục

- [Hoisting là gì?](#hoisting-là-gì)
- [Hoisting với var](#hoisting-với-var)
- [Hoisting với let / const](#hoisting-với-let--const)
- [Hoisting với function](#hoisting-với-function)
- [Quy tắc đặt tên](#quy-tắc-đặt-tên)

---

## Hoisting là gì?

**Hoisting** ("cẩu lên") là cơ chế JavaScript engine **đưa khai báo
biến và hàm lên đầu scope** trước khi chạy code.

Code thật:

```js
console.log(x);
var x = 10;
```

Engine xử lý như:

```js
var x;          // khai báo được "cẩu" lên đầu
console.log(x); // undefined (chưa gán)
x = 10;         // gán xảy ra ở đúng dòng
```

---

## Hoisting với var

`var` được hoist với giá trị **`undefined`** — truy cập trước khai báo
không lỗi, nhưng giá trị là `undefined`:

```js
console.log(name); // undefined
var name = "An";
```

---

## Hoisting với let / const

`let` và `const` cũng được hoist, **nhưng** ở trong **Temporal Dead
Zone (TDZ)** — truy cập trước khai báo ném `ReferenceError`:

```js
console.log(x); // ReferenceError
let x = 10;
```

:::info[Phân tích]

Khẳng định "let/const không hoist" thường gặp trong tài liệu cũ là **sai**.

Thực tế:

1. Engine vẫn **scan toàn block** trước khi chạy → biến đã tồn tại.
2. Nhưng biến ở trạng thái **uninitialized** (TDZ) cho đến dòng khai báo.
3. Truy cập biến uninitialized ném `ReferenceError`.

So với `var`:

| | `var` | `let` / `const` |
|--|--|--|
| Được hoist? | Có | **Có** |
| Giá trị ban đầu | `undefined` | TDZ (không truy cập được) |
| Truy cập trước khai báo | Trả về `undefined` | **ReferenceError** |

Câu trả lời chuẩn cho phỏng vấn: "**Tất cả đều hoist**, nhưng `let`/`const`
ở trong TDZ cho đến dòng khai báo."

:::

---

## Hoisting với function

Function declaration được **hoist toàn bộ** (cả tên + body):

```js
greet(); // "Hi" — chạy được!

function greet() {
  console.log("Hi");
}
```

Function expression (gán cho biến) **không** được hoist như function:

```js
greet(); // TypeError: greet is not a function

var greet = function () {
  console.log("Hi");
};
```

Vì `var greet` được hoist với giá trị `undefined`, tại thời điểm gọi
`greet()` thì giá trị là `undefined`, không phải function.

Arrow function (`const`/`let`) còn ném `ReferenceError`:

```js
greet(); // ReferenceError (TDZ)

const greet = () => console.log("Hi");
```

:::warning[Cần lưu ý]

**Function trong block scope** behavior khác nhau giữa strict mode và
sloppy mode. Trong strict mode, function declaration trong `if`/`for`
được scope vào block:

```js
"use strict";

if (true) {
  function foo() {}
}
foo(); // ReferenceError trong strict
       // OK trong sloppy mode (foo bị hoist ra ngoài)
```

→ Không nên khai báo function trong block. Dùng function expression
hoặc arrow function gán vào biến.

:::

---

## Quy tắc đặt tên

**Hợp lệ:**

- Chứa chữ cái (a-z, A-Z), số (0-9), `_`, `$`.
- **Không** bắt đầu bằng số.
- Hỗ trợ Unicode (tên tiếng Việt có dấu chạy được).

```js
let name;
let _private;
let $element;
let user1;
let người_dùng; // OK nhưng không khuyến nghị
```

**Không hợp lệ:**

```js
let 1user;    // SyntaxError — bắt đầu bằng số
let my-name;  // SyntaxError — chứa dấu trừ
let class;    // SyntaxError — từ khoá dành riêng
```

**Reserved keywords không được dùng làm tên biến:**

```
break case catch class const continue debugger default delete do
else export extends false finally for function if import in instanceof
new null return super switch this throw true try typeof var void
while with yield let static
```

---

## Convention đặt tên

| Loại | Convention | Ví dụ |
|------|-----------|-------|
| Biến, hàm | camelCase | `userName`, `getCurrentUser()` |
| Class, constructor | PascalCase | `User`, `UserService` |
| Hằng số global | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_URL` |
| Private (theo quy ước) | `_camelCase` | `_internalState` |
| Private thật (class) | `#camelCase` | `#password` |
| Boolean | `is/has/can` prefix | `isActive`, `hasPermission` |

:::tip[Mẹo]

**Tên biến tốt** đáng giá hơn comment. Một tên rõ ràng giúp người đọc
hiểu code mà không cần đọc context:

```js
// Tệ
const d = new Date() - user.createdAt;

// Tốt
const accountAgeMs = Date.now() - user.createdAt.getTime();
```

Trong code review, đổi tên thường là feedback **dễ nhất và hiệu quả
nhất**. Đừng tiếc thời gian đặt tên cho rõ.

:::
