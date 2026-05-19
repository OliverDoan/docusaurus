---
sidebar_position: 1
title: "1. Khai báo biến: var, let, const"
---

# Khai báo biến: var, let, const

---

## Mục lục

- [Tổng quan](#tổng-quan)
- [var](#var)
- [let](#let)
- [const](#const)
- [Khi nào dùng cái nào?](#khi-nào-dùng-cái-nào)

---

## Tổng quan

JavaScript có **3 từ khoá** để khai báo biến:

| Từ khoá | Scope | Hoisting | Reassign | TDZ |
|---------|-------|----------|----------|-----|
| `var` | Function | Có (giá trị `undefined`) | Có | Không |
| `let` | Block | Có (TDZ) | Có | **Có** |
| `const` | Block | Có (TDZ) | **Không** | **Có** |

---

## var

`var` là cách khai báo **cũ** (trước ES6). Scope theo **function**:

```js
function test() {
  if (true) {
    var x = 10;
  }
  console.log(x); // 10 — vẫn truy cập được
}
```

`var` có thể khai báo lại cùng tên không lỗi:

```js
var name = "An";
var name = "Bình"; // OK
```

---

## let

`let` (ES6) có scope theo **block** — chỉ tồn tại trong `{}`:

```js
function test() {
  if (true) {
    let x = 10;
  }
  console.log(x); // ReferenceError
}
```

Không cho khai báo lại cùng tên trong cùng scope:

```js
let name = "An";
let name = "Bình"; // SyntaxError
```

Có thể gán lại giá trị:

```js
let count = 0;
count = 1; // OK
```

---

## const

`const` cũng scope block, nhưng **không gán lại được**:

```js
const PI = 3.14;
PI = 3.15; // TypeError
```

:::warning[Cần lưu ý]

`const` **không** có nghĩa là "immutable" — nó chỉ chặn **gán lại biến**.
Object hoặc array bên trong vẫn sửa được:

```js
const user = { name: "An" };
user.name = "Bình";  // OK — sửa property
user.age = 25;       // OK — thêm property

const arr = [1, 2, 3];
arr.push(4);         // OK — sửa nội dung
arr = [];            // Error — gán lại biến
```

Muốn immutable thực sự, dùng `Object.freeze()`:

```js
const config = Object.freeze({ url: "/api" });
config.url = "x"; // Silently fail (strict mode: TypeError)
```

`Object.freeze` cũng chỉ **shallow** — nested object vẫn sửa được. Cần
deep freeze tự viết hoặc dùng thư viện (Immer, Immutable.js).

:::

---

## Khi nào dùng cái nào?

**Quy tắc 2026:**

1. **Mặc định dùng `const`**.
2. **Chỉ dùng `let`** khi biết chắc sẽ gán lại (counter, accumulator, biến
   trong loop...).
3. **Không bao giờ dùng `var`** trong code mới.

```js
const users = await fetchUsers(); // không gán lại → const
let total = 0;                     // sẽ thay đổi → let
for (let i = 0; i < users.length; i++) {
  total += users[i].score;
}
```

:::info[Phân tích]

**Temporal Dead Zone (TDZ)** là khoảng từ đầu block tới dòng khai báo
`let`/`const`. Truy cập biến trong TDZ ném `ReferenceError`:

```js
console.log(x); // ReferenceError: Cannot access 'x' before initialization
let x = 10;
```

So với `var`:

```js
console.log(y); // undefined (hoisted với giá trị undefined)
var y = 10;
```

→ TDZ giúp **phát hiện sớm bug** dùng biến trước khi khai báo. Đây là
một trong các lý do `let`/`const` an toàn hơn `var`.

Senior thường được hỏi: "Tại sao `typeof` an toàn với biến chưa khai báo
nhưng không an toàn với `let` trong TDZ?":

```js
typeof undeclared; // "undefined" (an toàn)
typeof x;          // ReferenceError (TDZ với let/const)
let x = 1;
```

Lý do: TDZ là **trạng thái thực sự** của biến đã được tạo nhưng chưa
khởi tạo — không phải "không tồn tại".

:::

:::tip[Mẹo]

Trong codebase hiện đại, ESLint rule **`no-var`** và **`prefer-const`**
sẽ tự ép quy tắc trên. Bật chúng trong ESLint config:

```js
// eslint.config.js
{
  rules: {
    "no-var": "error",
    "prefer-const": "warn",
  }
}
```

:::
