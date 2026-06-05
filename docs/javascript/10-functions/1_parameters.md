---
sidebar_position: 1
title: "1. Function Parameters"
---

# Function Parameters

**Parameter** (tham số) là các biến mà bạn khai báo trong dấu ngoặc của một hàm để nhận dữ liệu đầu vào khi hàm được gọi. JavaScript cho phép bạn đặt giá trị mặc định (**default parameters**), gom nhiều giá trị thành một mảng (**rest parameters**), hay tách dữ liệu từ object/array ngay tại tham số (**destructuring**). Hiểu rõ tham số giúp bạn viết hàm linh hoạt và dễ tái sử dụng hơn.

---

## Mục lục

- [Khai báo hàm](#khai-báo-hàm)
- [Default parameters](#default-parameters)
- [Rest parameters](#rest-parameters)
- [Destructuring parameters](#destructuring-parameters)
- [Named arguments pattern](#named-arguments-pattern)

---

## Khai báo hàm

JavaScript có nhiều cách khai báo hàm:

```js
// Function declaration — hoisted
function greet(name) {
  return `Hi ${name}`;
}

// Function expression
const greet = function (name) {
  return `Hi ${name}`;
};

// Arrow function
const greet = (name) => `Hi ${name}`;

// Method shorthand (trong object/class)
const obj = {
  greet(name) {
    return `Hi ${name}`;
  },
};
```

---

## Default parameters

ES6 — gán giá trị mặc định khi không truyền:

```js
function greet(name = "Anonymous", greeting = "Hi") {
  return `${greeting} ${name}`;
}

greet();              // "Hi Anonymous"
greet("An");          // "Hi An"
greet("An", "Hello"); // "Hello An"
```

Default được **đánh giá mỗi lần gọi** — có thể là expression:

```js
function log(msg, time = new Date()) {
  console.log(time, msg);
}
```

Default có thể tham chiếu **parameter trước**:

```js
function range(start, end = start + 10) {
  // ...
}
```

:::warning[Cần lưu ý]

Default **chỉ apply khi giá trị là `undefined`**, không phải mọi falsy:

```js
function test(x = 10) {
  console.log(x);
}

test();          // 10
test(undefined); // 10
test(null);      // null (!)
test(0);         // 0
test("");        // ""
test(false);     // false
```

Nếu muốn apply default cho cả `null`, dùng `??`:

```js
function test(x) {
  const value = x ?? 10;
  // ...
}
```

:::

---

## Rest parameters

Gộp các argument còn lại vào một **mảng**:

```js
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}

sum(1, 2, 3, 4); // 10
```

Có thể kết hợp với parameter thường (phải đặt **cuối**):

```js
function log(level, ...messages) {
  console.log(`[${level}]`, ...messages);
}

log("info", "Hello", "World", 42);
```

Rest **khác** `arguments` object:

| | `...rest` | `arguments` |
|--|-----------|-------------|
| Là Array? | **Có** (Array thật) | Không (Array-like) |
| Hỗ trợ arrow? | Có | **Không** |
| Có method Array? | Có (`map`, `filter`...) | Không |
| Khuyến nghị | **Có** | Tránh |

---

## Destructuring parameters

Tách property trực tiếp trong parameter:

```js
// Thay vì
function createUser(options) {
  const name = options.name;
  const age = options.age;
}

// Viết
function createUser({ name, age }) {
  // ...
}

createUser({ name: "An", age: 25 });
```

Với default:

```js
function createUser({ name = "Anonymous", age = 0 } = {}) {
  // ...
}

createUser();              // không lỗi
createUser({ name: "An" }); // age = 0
```

`= {}` ở cuối quan trọng — tránh `TypeError` khi không truyền gì.

Array destructuring:

```js
function head([first, ...rest]) {
  return first;
}

head([1, 2, 3]); // 1
```

---

## Named arguments pattern

JavaScript **không có named arguments** như Python (`fn(name="x")`).
Pattern thay thế — **destructure object**:

```js
// Không tốt — thứ tự dễ nhớ sai
function createButton(text, color, size, disabled, onClick) {}

createButton("Save", "blue", "lg", false, handleClick);

// Tốt — named arguments qua object
function createButton({ text, color, size, disabled, onClick }) {}

createButton({
  text: "Save",
  color: "blue",
  size: "lg",
  disabled: false,
  onClick: handleClick,
});
```

:::tip[Mẹo]

**Quy tắc thực dụng**:

- Hàm ≤ 2 param → dùng positional `fn(a, b)`.
- Hàm ≥ 3 param hoặc nhiều optional → dùng object destructuring.
- Boolean parameter → **luôn** dùng object (`fn({ enabled: true })` rõ
  hơn `fn(true)`).

```js
// Tệ — boolean lạc lõng
slice(arr, 0, 5, true);

// Tốt
slice(arr, 0, 5, { inPlace: true });
```

Bool argument ở vị trí giữa là "code smell" — khi đọc call site,
không ai biết `true` nghĩa gì.

:::

:::info[Phân tích]

**Function length** — số param không có default:

```js
function a(x, y) {}              a.length;  // 2
function b(x, y = 10) {}         b.length;  // 1 (y có default)
function c(x, ...rest) {}        c.length;  // 1 (rest không tính)
function d({ x, y } = {}) {}     d.length;  // 0 (default = {})
```

Quan trọng cho framework tự động — vd Express middleware:

```js
function middleware(err, req, res, next) {} // length = 4 → error handler
function middleware(req, res, next) {}      // length = 3 → normal
```

Express dùng `length` để phân biệt error middleware. Đây là lý do thứ
tự parameter trong Express cố định — không thể đảo.

:::
