---
sidebar_position: 6
title: "6. IIFE (Immediately Invoked Function Expression)"
---

# IIFE — Hàm tự gọi ngay

---

## Mục lục

- [IIFE là gì?](#iife-là-gì)
- [Cú pháp](#cú-pháp)
- [Tại sao cần IIFE?](#tại-sao-cần-iife)
- [Các biến thể IIFE](#các-biến-thể-iife)
- [Async IIFE](#async-iife)
- [Khi nào còn cần IIFE trong code hiện đại?](#khi-nào-còn-cần-iife-trong-code-hiện-đại)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## IIFE là gì?

**IIFE** (đọc là "iffy") = **Immediately Invoked Function Expression** — một function được **định nghĩa và gọi ngay lập tức**.

```js
(function() {
  console.log("Tôi chạy ngay khi được định nghĩa!");
})();
```

> **Ví dụ thực tế:** Hãy tưởng tượng IIFE như **dùng một lần rồi bỏ** — giống cốc giấy: pha xong, uống xong, vứt đi. Không cần đặt tên, không cần giữ lại.

## Cú pháp

### Cú pháp cổ điển — bọc trong dấu ngoặc

```js
(function() {
  // code
})();
```

Có hai cặp ngoặc:
1. `(function() {...})` — biến function declaration thành **function expression**
2. `()` — gọi function ngay lập tức

### Hai cách viết tương đương

```js
// Cách 1: Douglas Crockford style
(function() {
  /* ... */
}());

// Cách 2: phổ biến hơn
(function() {
  /* ... */
})();
```

### Với tham số

```js
(function(name) {
  console.log(`Hello, ${name}!`);
})("Alice");
// Hello, Alice!
```

### Với return

```js
const result = (function() {
  return 42;
})();

console.log(result);  // 42
```

## Tại sao cần IIFE?

### 1. Tạo scope riêng (trước ES6)

Trước khi có `let`/`const`, mọi biến `var` đều ở **function scope** hoặc **global scope** → dễ gây xung đột:

```js
// ❌ Trước IIFE
var counter = 0;   // global
function inc() { counter++; }

// ✅ Với IIFE — biến không leak ra ngoài
(function() {
  var counter = 0;
  function inc() { counter++; }
  
  // Có thể expose qua return hoặc gắn vào window
  window.app = { inc };
})();

console.log(typeof counter);   // "undefined" — counter không thấy
```

### 2. Tránh xung đột giữa các library

```js
// jQuery dùng IIFE để tránh đụng `$` với thư viện khác
(function($) {
  $(document).ready(function() {
    // dùng $ an toàn ở đây
  });
})(jQuery);
```

### 3. Module Pattern (trước ES6 modules)

```js
const MyModule = (function() {
  // Private
  let privateVar = 0;
  function privateFunc() { /* ... */ }
  
  // Public API
  return {
    increment() { privateVar++; },
    getValue() { return privateVar; }
  };
})();

MyModule.increment();
MyModule.getValue();     // 1
MyModule.privateVar;     // undefined (ẩn)
```

### 4. Chạy code khởi tạo một lần

```js
// Khởi tạo config khi load page
(function init() {
  const config = loadConfig();
  setupAnalytics(config);
  hideLoader();
})();
```

### 5. Fix bug closure trong loop (cũ)

```js
// ❌ Bug: tất cả callback in ra 5
for (var i = 0; i < 5; i++) {
  setTimeout(() => console.log(i), 100);
}
// 5, 5, 5, 5, 5

// ✅ Cách cũ: IIFE giữ giá trị i
for (var i = 0; i < 5; i++) {
  (function(j) {
    setTimeout(() => console.log(j), 100);
  })(i);
}
// 0, 1, 2, 3, 4

// ✅ Cách mới (ES6): dùng let
for (let i = 0; i < 5; i++) {
  setTimeout(() => console.log(i), 100);
}
// 0, 1, 2, 3, 4
```

## Các biến thể IIFE

### Với arrow function

```js
(() => {
  console.log("Arrow IIFE");
})();

// Hoặc
(async () => {
  await doSomething();
})();
```

### Unary operator trick

```js
// Bất kỳ operator nào cũng biến function thành expression
!function() { console.log("a"); }();
+function() { console.log("b"); }();
-function() { console.log("c"); }();
~function() { console.log("d"); }();
void function() { console.log("e"); }();
```

### Named IIFE (cho recursion)

```js
(function factorial(n) {
  return n <= 1 ? 1 : n * factorial(n - 1);
})(5);
// 120
```

Tên hàm chỉ có thể dùng **bên trong** IIFE, không leak ra ngoài.

## Async IIFE

Trước khi có **top-level await**, async IIFE rất phổ biến để dùng `await` ở top level:

```js
// ❌ Không hoạt động trong script thường
const data = await fetch("/api/data").then(r => r.json());

// ✅ Async IIFE
(async () => {
  const data = await fetch("/api/data").then(r => r.json());
  console.log(data);
})();
```

### Trong ES2022+ với module

```js
// Trong ES module — KHÔNG cần IIFE nữa
const data = await fetch("/api/data").then(r => r.json());
console.log(data);
```

### Top-level await chỉ trong module

```html
<!-- Phải có type="module" -->
<script type="module">
  const data = await fetch("/api/data").then(r => r.json());
</script>
```

```json
// package.json (Node.js)
{
  "type": "module"
}
```

## Khi nào còn cần IIFE trong code hiện đại?

### ✅ Vẫn hữu ích khi:

1. **Code không phải module** (vd: script trong HTML legacy)
2. **Async ở top level** trong môi trường không hỗ trợ top-level await
3. **Khởi tạo một lần** với scope tự dọn

### ❌ Không cần khi:

1. **Trong ES module** — đã có scope riêng
2. **Dùng `let`/`const`** — block scope đủ trong loop
3. **Dùng class/closure** thông thường

```js
// ❌ Không cần IIFE
(function() {
  let x = 10;
  console.log(x);
})();

// ✅ Block đủ rồi
{
  let x = 10;
  console.log(x);
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: IIFE là gì và dùng để làm gì?

**Đáp án:**

**IIFE** (Immediately Invoked Function Expression) là function được **định nghĩa và gọi ngay lập tức**.

Mục đích chính:
1. **Tạo scope riêng** — biến không leak ra global (rất quan trọng trước ES6)
2. **Module pattern** — encapsulate private/public
3. **Tránh xung đột** giữa các library
4. **Chạy code khởi tạo** một lần
5. **Sử dụng `await`** ở top level (trước khi có top-level await)

### Câu 2: Vì sao phải bọc IIFE trong dấu ngoặc?

**Đáp án:**

JS parser xử lý `function` ở đầu statement là **function declaration**, mà function declaration phải có **tên** và **không thể gọi ngay**:

```js
// ❌ SyntaxError: function declaration cần tên
function() { /* ... */ }();
```

Bằng cách bọc trong `()`, ta ép parser hiểu nó là **expression**:

```js
// ✅ (function() {...}) là expression
(function() { /* ... */ })();

// Cũng có thể dùng operator khác:
!function() { /* ... */ }();
+function() { /* ... */ }();
```

### Câu 3: Đoán kết quả

```js
var x = 10;

(function(x) {
  console.log(x);
  var x = 20;
  console.log(x);
})(x);

console.log(x);
```

**Đáp án:**

```
10
20
10
```

- IIFE nhận tham số `x = 10`
- In `10`, sau gán `var x = 20` (cùng scope) → in `20`
- `x` toàn cục không bị đổi → `10`

### Câu 4: Code này có còn cần IIFE không?

```js
(function() {
  const config = {...};
  init(config);
})();
```

**Đáp án:**

Nếu đang dùng **ES module** (`type="module"` hoặc file `.mjs`): **KHÔNG cần** — module đã có scope riêng:

```js
// app.mjs
const config = {...};
init(config);
// config không leak ra global
```

Nếu là **script thường**: **CÓ cần** — không có IIFE, `config` sẽ thành global variable (với `const` thì không, nhưng `var` thì có).

Hoặc dùng block scope:

```js
{
  const config = {...};
  init(config);
}
// config không thấy bên ngoài (vì const là block scope)
```
