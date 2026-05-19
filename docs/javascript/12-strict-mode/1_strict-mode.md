---
sidebar_position: 1
title: "1. Strict Mode"
---

# Strict Mode

---

## Mục lục

- [Bật strict mode](#bật-strict-mode)
- [Các thay đổi chính](#các-thay-đổi-chính)
- [Khi nào đã tự động strict?](#khi-nào-đã-tự-động-strict)
- [Tại sao quan trọng?](#tại-sao-quan-trọng)

---

## Bật strict mode

Đặt **`"use strict"`** ở đầu file hoặc function:

```js
"use strict";

// Toàn bộ file strict
function test() {
  // Hoặc chỉ riêng function
  "use strict";
}
```

---

## Các thay đổi chính

**1. Cấm khai báo biến không có `var`/`let`/`const`:**

```js
"use strict";
x = 10; // ReferenceError (sloppy: tạo global)
```

**2. `this` trong function không bound = `undefined`** (sloppy: `window`):

```js
"use strict";
function test() {
  console.log(this); // undefined
}
test();
```

**3. Lỗi khi gán cho readonly/getter-only:**

```js
"use strict";
const obj = Object.freeze({ x: 1 });
obj.x = 2; // TypeError (sloppy: im lặng)

undefined = 1;     // TypeError
NaN = 0;           // TypeError
```

**4. Tham số trùng tên → lỗi:**

```js
"use strict";
function foo(a, a) {} // SyntaxError
```

**5. Cấm `with` và octal literal cũ:**

```js
"use strict";
with (obj) { } // SyntaxError
0123;          // SyntaxError (dùng 0o123)
```

**6. `delete` biến → lỗi:**

```js
"use strict";
let x = 1;
delete x; // SyntaxError
```

**7. Reserved keyword bị bảo vệ:**

```js
"use strict";
let public = 1;     // SyntaxError
let arguments = 1;  // SyntaxError
let eval = 1;       // SyntaxError
```

---

## Khi nào đã tự động strict?

Strict mode được **bật mặc định** trong:

- **ES Module** (file `.mjs` hoặc `"type": "module"`).
- **Class body** (mọi method trong class).
- **`<script type="module">`** trong HTML.

```js
// my-module.js
// Tự động strict — không cần "use strict"

class User {
  // Tự động strict trong toàn class
  greet() {
    // strict mặc định
  }
}
```

:::info[Phân tích]

Trong code hiện đại (ES Module, React, Vue, Node ESM, TypeScript),
**strict mode luôn bật**. Không cần thêm `"use strict"` thủ công.

Chỉ cần khi:

- File **legacy script** (không phải module).
- Embedded JS (vd `<script>` không có `type="module"`).
- Code chạy với `--no-strict-mode` của Node (rất hiếm).

Khi viết library publish, **giữ `"use strict"`** ở đầu file IIFE/UMD để
đảm bảo strict ngay cả khi user load qua `<script>` cũ.

:::

---

## Tại sao quan trọng?

**Phát hiện bug sớm:**

```js
// Sloppy — silent error
function test() {
  count = 0; // tạo global biến — bug
}

// Strict — báo lỗi ngay
"use strict";
function test() {
  count = 0; // ReferenceError
}
```

**Performance** — strict mode giúp engine tối ưu tốt hơn:

- Không phải xử lý `with`, octal literal, eval scope.
- Cho phép static analysis chính xác hơn.
- V8/SpiderMonkey có code path nhanh hơn cho strict code.

:::warning[Cần lưu ý]

**Tránh trộn strict và non-strict** trong cùng dự án:

```js
// Tệ — file strict
"use strict";

// Import từ file sloppy
import "./legacy.js"; // có thể leak global biến
```

Khi migrate code cũ:

1. Chuyển dần sang ES Module (tự động strict).
2. Thêm `"use strict"` cho file còn lại.
3. Test kỹ — strict có thể bộc lộ bug đã ngủ yên.

Trong TypeScript, không cần lo — TS luôn output strict mode.

:::

:::tip[Mẹo]

**Bài test xác định strict mode**:

```js
function isStrict() {
  return (function () { return !this; })();
}

isStrict();
// true → strict (this = undefined)
// false → sloppy (this = global)
```

Hữu dụng khi debug behavior bí ẩn — đôi khi function được load từ
context khác có chế độ ngược lại bạn nghĩ.

:::
