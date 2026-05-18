---
sidebar_position: 1
title: "1. Strict Mode"
---

# Strict Mode

---

## Mục lục

- [Strict Mode là gì?](#strict-mode-là-gì)
- [Cách kích hoạt](#cách-kích-hoạt)
- [Các thay đổi quan trọng](#các-thay-đổi-quan-trọng)
- [Module và class — strict mặc định](#module-và-class--strict-mặc-định)
- [Khi nào không cần `"use strict"`?](#khi-nào-không-cần-use-strict)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Strict Mode là gì?

**Strict Mode** ra mắt trong **ES5 (2009)** — một chế độ thực thi JS **nghiêm ngặt hơn**, giúp:
- Phát hiện sớm các lỗi tiềm ẩn
- Cấm các cú pháp dễ gây bug
- Bỏ các tính năng "ma" của JS cũ
- Cho phép engine optimize tốt hơn

```js
"use strict";

x = 10;   // ❌ ReferenceError: x is not defined
```

## Cách kích hoạt

### 1. Toàn file

Đặt `"use strict";` ở **dòng đầu tiên** của file:

```js
"use strict";

// Toàn bộ file chạy trong strict mode
function foo() { /* ... */ }
```

### 2. Trong một function

```js
function strictFunc() {
  "use strict";
  // Chỉ function này strict
  
  function inner() {
    // inner cũng strict (inherit)
  }
}
```

### 3. Tự động trong `module`

```html
<script type="module">
  // ✅ Tự động strict
  x = 10;   // ReferenceError
</script>
```

```json
// package.json
{ "type": "module" }
```

### 4. Tự động trong `class`

```js
class Foo {
  bar() {
    // Tự động strict
  }
}
```

## Các thay đổi quan trọng

### 1. Cấm dùng biến chưa khai báo

```js
// Non-strict
function loose() {
  x = 10;   // Tạo global "x" — bug âm thầm
}

// Strict
"use strict";
function strict() {
  x = 10;   // ❌ ReferenceError: x is not defined
}
```

### 2. `this` trong function thường là `undefined`

```js
// Non-strict
function loose() {
  console.log(this);   // window/globalThis
}

// Strict
"use strict";
function strict() {
  console.log(this);   // undefined
}
```

### 3. Lỗi rõ ràng khi gán vào readonly/getter-only

```js
"use strict";

const obj = {};
Object.defineProperty(obj, "x", { value: 1, writable: false });
obj.x = 2;   // ❌ TypeError (non-strict: silently fail)

NaN = 1;     // ❌ TypeError
undefined = "a";   // ❌ TypeError
```

### 4. Cấm trùng tên tham số

```js
// Non-strict — OK
function foo(a, a) { return a; }
foo(1, 2);   // 2

// Strict
"use strict";
function bar(a, a) {}   // ❌ SyntaxError
```

### 5. Cấm số bát phân với `0` đầu

```js
"use strict";
const n = 0755;   // ❌ SyntaxError

// Phải dùng "0o" prefix
const n = 0o755;   // ✅ ES6
```

### 6. Cấm `delete` trên biến/function

```js
"use strict";

let x = 10;
delete x;   // ❌ SyntaxError

function foo() {}
delete foo;   // ❌ SyntaxError
```

### 7. Cấm `with` statement

```js
// Non-strict (deprecated)
with (obj) {
  x = 10;   // x là obj.x?
}

// Strict
"use strict";
with (obj) { /* ... */ }   // ❌ SyntaxError
```

### 8. `eval` có scope riêng

```js
"use strict";

eval("var x = 10;");
console.log(typeof x);   // "undefined" — x chỉ tồn tại trong eval
```

### 9. Không thể thêm property vào primitive

```js
"use strict";

(42).foo = 1;       // ❌ TypeError
"hello".bar = 1;    // ❌ TypeError
true.x = 1;         // ❌ TypeError
```

### 10. `arguments` không bind với tham số

```js
// Non-strict
function loose(a) {
  arguments[0] = 99;
  console.log(a);   // 99 ⚠️
}

// Strict
"use strict";
function strict(a) {
  arguments[0] = 99;
  console.log(a);   // giá trị gốc — không sync
}
```

### 11. Reserved words không dùng làm tên biến

```js
"use strict";

let private = 1;     // ❌ SyntaxError
let public = 1;      // ❌ SyntaxError
let yield = 1;       // ❌ SyntaxError
let static = 1;      // ❌ SyntaxError
let interface = 1;   // ❌ SyntaxError
```

## Module và class — strict mặc định

### ES Modules

```js
// app.mjs (hoặc <script type="module">)
// Không cần "use strict" — tự động strict

x = 10;   // ❌ ReferenceError
```

### `class` body

```js
class Foo {
  bar() {
    x = 10;   // ❌ ReferenceError (class luôn strict)
    
    // this trong method là instance
    // this trong static là class
  }
}
```

### Function trong module/class — cũng strict

```js
// module.mjs
function inner() {
  this;   // undefined (strict mặc định từ module)
}
```

## Khi nào không cần `"use strict"`?

| Tình huống | Cần `"use strict"`? |
|------------|---------------------|
| ES Module (`type="module"`, `.mjs`) | ❌ Tự động |
| `class` body | ❌ Tự động |
| TypeScript output (target ES6+) | Tuỳ config |
| Script bình thường (`<script>`) | ✅ Nên thêm |
| Node.js CommonJS | ✅ Nên thêm |
| React JSX (bundled bởi Webpack/Vite) | Bundler thường thêm tự động |

```js
// Modern code (ESM) — không cần
// app.mjs
export function foo() {
  // strict by default
}

// Legacy code (script) — nên thêm
// legacy.js
"use strict";
function foo() { /* ... */ }
```

---

## Câu hỏi phỏng vấn

### Câu 1: Strict mode mang lại lợi ích gì?

**Đáp án:**

1. **Phát hiện lỗi sớm** — biến chưa khai báo, gán readonly, trùng tham số... đều ném lỗi
2. **`this` an toàn hơn** — `undefined` thay vì `window` trong function thường
3. **Loại bỏ cú pháp gây bug** — `with`, octal cũ, `arguments` mutation
4. **Engine optimize tốt hơn** — V8 tối ưu code strict cao hơn
5. **Tương thích tốt với module/class** — chuẩn bị cho ES6+

### Câu 2: Trong strict mode, `this` trong function thường là gì?

**Đáp án:**

`undefined` (không phải `window`/`globalThis` như non-strict):

```js
"use strict";

function foo() {
  console.log(this);   // undefined
}
foo();

// Khác với non-strict:
function bar() {
  console.log(this);   // window (browser) hoặc global (Node)
}
```

Khi gọi method `obj.foo()` thì `this` vẫn là `obj`.

### Câu 3: Đoán kết quả

```js
"use strict";

function test() {
  x = 10;          // line 1
  console.log(x);  // line 2
}

test();
```

**Đáp án:**

`ReferenceError: x is not defined` — ném lỗi tại line 1. Trong strict mode, không cho phép tạo biến global bằng cách gán không khai báo.

(Trong non-strict: `x` trở thành biến global, in `10`.)

### Câu 4: Có cần thêm `"use strict"` trong file ES module không?

**Đáp án:**

**Không cần** — ES module **tự động** chạy ở strict mode. Trong:
- File `.mjs`
- File `.js` với `package.json` có `"type": "module"`
- `<script type="module">`

→ Đã strict sẵn. Thêm `"use strict"` cũng không sai, chỉ dư thừa.
