---
sidebar_position: 3
title: "3. Modules (import/export)"
---

# Modules (import/export)


---

## Mục lục

- [Module là gì?](#module-là-gì)
- [Tại sao Modules ra đời?](#tại-sao-modules-ra-đời)
- [Cách sử dụng](#cách-sử-dụng)
- [CommonJS vs ES Modules](#commonjs-vs-es-modules)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Module là gì?

**Module** là cách chia ứng dụng JavaScript thành **nhiều file nhỏ**, mỗi file đảm nhận **một chức năng riêng**. Các file này có thể **xuất** (export) những thứ cần chia sẻ và **nhập** (import) những thứ cần sử dụng từ file khác.

Hãy tưởng tượng bạn đang xây một **nhà máy sản xuất**. Thay vì một phòng làm tất cả mọi việc, bạn chia thành **nhiều phòng ban**: phòng thiết kế, phòng sản xuất, phòng kiểm tra chất lượng. Mỗi phòng ban (module) **làm việc độc lập**, nhưng có thể **gửi sản phẩm** (export) cho phòng ban khác và **nhận nguyên liệu** (import) từ phòng ban khác.

```
ung-dung/
├── utils.js         // Phòng ban tiện ích -- export các hàm dùng chung
├── api.js           // Phòng ban kết nối -- export các hàm gọi API
├── validation.js    // Phòng ban kiểm tra -- export các hàm validate
└── main.js          // Phòng ban chính -- import từ các file trên
```

---

## Tại sao Modules ra đời?

Trước ES6 (2015), JavaScript **không có hệ thống module chuẩn**. Tất cả code thường được viết trong **một file** hoặc nhiều file nhưng **chia sẻ biến toàn cục** (global variables).

**Vấn đề của cách cũ:**

| Vấn đề | Mô tả |
|--------|-------|
| Xung đột tên | 2 file cùng đặt tên biến `data` -> ghi đè nhau |
| Khó bảo trì | File 5000 dòng, không biết hàm nào ở đâu |
| Không tái sử dụng | Copy-paste code giữa các dự án |
| Thứ tự load quan trọng | File A phải load trước file B -> dễ sai |

```html
<!-- Cách cũ: nhiều thẻ script, biến toàn cục xung đột -->
<script src="utils.js"></script>     <!-- var helper = ... -->
<script src="api.js"></script>       <!-- var helper = ... OVERWRITE! -->
<script src="main.js"></script>      <!-- helper là của ai? -->
```

ES6 giới thiệu **ES Modules** (ESM) để giải quyết tất cả vấn đề này.

---

## Cách sử dụng

### 1. Named Export (xuất có tên)

Mỗi file có thể export **nhiều thứ** với tên cụ thể:

```javascript
// 📁 math.js -- xuất nhiều hàm
export const PI = 3.14159;

export function cong(a, b) {
  return a + b;
}

export function tru(a, b) {
  return a - b;
}

// Hoặc export ở cuối file (tương đương)
const nhan = (a, b) => a * b;
const chia = (a, b) => a / b;
export { nhan, chia };
```

Import named export phải dùng **đúng tên** và **dấu ngoặc nhọn** `{}`:

```javascript
// 📁 main.js -- nhập các hàm đã export
import { cong, tru, PI } from "./math.js";

console.log(cong(2, 3));  // 5
console.log(PI);           // 3.14159

// Đổi tên khi import (alias)
import { nhan as multiply } from "./math.js";
console.log(multiply(4, 5)); // 20
```

### 2. Default Export (xuất mặc định)

Mỗi file chỉ có **một default export**:

```javascript
// 📁 Calculator.js -- export mặc định một class/hàm/giá trị
export default class Calculator {
  cong(a, b) { return a + b; }
  tru(a, b) { return a - b; }
}
```

Import default **không cần dấu ngoặc nhọn** và **có thể đặt tên tùy ý**:

```javascript
// 📁 main.js
import Calculator from "./Calculator.js";    // Tên tùy ý
import MayTinh from "./Calculator.js";       // Tên khác cũng được!

const calc = new Calculator();
console.log(calc.cong(2, 3)); // 5
```

### 3. Kết hợp Named và Default Export

```javascript
// 📁 api.js
export default function fetchData(url) {
  return fetch(url).then((res) => res.json());
}

export const BASE_URL = "https://api.example.com";
export const TIMEOUT = 5000;
```

```javascript
// 📁 main.js -- import cả default lẫn named
import fetchData, { BASE_URL, TIMEOUT } from "./api.js";

const data = await fetchData(`${BASE_URL}/users`);
```

### 4. Import tất cả (Namespace Import)

```javascript
// 📁 main.js -- import tất cả vào một object
import * as MathUtils from "./math.js";

console.log(MathUtils.cong(1, 2));  // 3
console.log(MathUtils.PI);          // 3.14159
```

### 5. Re-export và Barrel Files

**Barrel file** là file tập trung export từ nhiều file con, giúp import gọn hơn:

```javascript
// 📁 utils/formatDate.js
export function formatDate(date) {
  return date.toLocaleDateString("vi-VN");
}

// 📁 utils/formatNumber.js
export function formatNumber(num) {
  return num.toLocaleString("vi-VN");
}

// 📁 utils/index.js -- Barrel file: re-export tất cả
export { formatDate } from "./formatDate.js";
export { formatNumber } from "./formatNumber.js";
```

```javascript
// 📁 main.js -- import gọn từ barrel file
import { formatDate, formatNumber } from "./utils/index.js";
// Thay vì phải import từ từng file riêng lẻ
```

### 6. Dynamic Import (import động)

```javascript
// Chỉ load module khi cần thiết (lazy loading)
async function moTrangAdmin() {
  // Module chỉ được tải khi hàm này chạy
  const { AdminPanel } = await import("./AdminPanel.js");
  const panel = new AdminPanel();
  panel.render();
}

// Thường dùng với sự kiện
document.getElementById("btn-admin").addEventListener("click", moTrangAdmin);
```

---

## CommonJS vs ES Modules

| Tiêu chí | CommonJS (`require`) | ES Modules (`import`) |
|----------|---------------------|----------------------|
| Cú pháp | `const x = require('x')` | `import x from 'x'` |
| Môi trường | Node.js (mặc định) | Trình duyệt + Node.js |
| Thời điểm load | Động (runtime) | Tĩnh (compile time) |
| Tree-shaking | Không hỗ trợ | Hỗ trợ (xóa code không dùng) |
| Top-level await | Không | Có (ESM) |
| File extension | `.js` | `.mjs` hoặc `"type": "module"` |

```javascript
// CommonJS (Node.js truyền thống)
const express = require("express");
module.exports = { myFunction };

// ES Modules (hiện đại)
import express from "express";
export { myFunction };
```

---

## Khi nào dùng?

| Trường hợp | Gợi ý |
|------------|-------|
| Dự án mới | **Luôn dùng ES Modules** |
| Dự án Node.js cũ | CommonJS (chuyển dần sang ESM) |
| Trình duyệt | ES Modules (hỗ trợ tất cả trình duyệt hiện đại) |
| Thư viện chia sẻ | Export cả ESM lẫn CJS |
| Tối ưu hiệu năng | Dynamic import cho code ít dùng |

---

## Lỗi thường gặp

### Lỗi 1: Quên dấu ngoặc nhọn với Named Export

```javascript
// 📁 utils.js
export function tinh(x) { return x * 2; }

// ❌ SAI: thiếu {} -- JavaScript tưởng bạn import default
import tinh from "./utils.js"; // undefined hoặc sai!

// ✅ ĐÚNG: named export cần {}
import { tinh } from "./utils.js";
```

### Lỗi 2: Nhiều default export trong một file

```javascript
// ❌ SAI: chỉ được 1 default export
export default function a() {}
export default function b() {} // Lỗi!

// ✅ ĐÚNG: 1 default + nhiều named
export default function a() {}
export function b() {}
```

### Lỗi 3: Import circular (vòng tròn)

```javascript
// ❌ NGUY HIỂM: A import B, B import A
// 📁 a.js
import { funcB } from "./b.js";
export const funcA = () => funcB();

// 📁 b.js
import { funcA } from "./a.js"; // Vòng tròn! Có thể là undefined
export const funcB = () => funcA();

// ✅ GIẢI PHÁP: tách logic chung ra file thứ 3
// 📁 shared.js
export const sharedFunc = () => { /* ... */ };
```

---

## Câu hỏi phỏng vấn

### Câu 1: Named Export khác Default Export như thế nào?

**Đáp án:**

| Tiêu chí | Named Export | Default Export |
|----------|-------------|----------------|
| Số lượng/file | Nhiều | Chỉ 1 |
| Cú pháp export | `export const x = ...` | `export default ...` |
| Cú pháp import | `import \{ x \} from '...'` | `import x from '...'` |
| Đổi tên | `import \{ x as y \}` | Tự do đặt tên |
| Khi nào dùng | Export nhiều thứ | Export thứ chính |

```javascript
// Named: export nhiều tiện ích
export const add = (a, b) => a + b;
export const sub = (a, b) => a - b;

// Default: export thứ chính của file
export default class Calculator { /* ... */ }
```

---

### Câu 2: CommonJS khác ES Modules ở điểm nào?

**Đáp án:**
- **CommonJS** load **động** (runtime) -- `require()` có thể đặt trong `if`, vòng lặp
- **ES Modules** load **tĩnh** (compile time) -- `import` phải ở **đầu file**, giúp công cụ tối ưu (tree-shaking)

```javascript
// CommonJS: động -- có thể import có điều kiện
if (condition) {
  const module = require("./moduleA"); // Hợp lệ
}

// ESM: tĩnh -- import phải ở top-level
import { func } from "./moduleA"; // Luôn ở đầu file

// ESM động: dùng dynamic import
if (condition) {
  const module = await import("./moduleA"); // Hợp lệ
}
```

---

### Câu 3: Dynamic Import là gì? Dùng khi nào?

**Đáp án:** Dynamic Import dùng `import()` như một **hàm** (trả về Promise), cho phép load module **khi cần** thay vì load hết từ đầu.

**Dùng khi:**
- **Code splitting**: chỉ load trang admin khi user là admin
- **Lazy loading**: load component khi user cuộn đến
- **Điều kiện**: load polyfill chỉ khi trình duyệt cũ

```javascript
// Chỉ load thư viện chart khi user bấm nút "Xem biểu đồ"
async function xemBieuDo() {
  const { Chart } = await import("chart.js");
  const chart = new Chart(canvas, config);
}
```

---

### Câu 4: Tree-shaking là gì?

**Đáp án:** Tree-shaking là kỹ thuật **loại bỏ code không được sử dụng** khi build. Chỉ hoạt động với **ES Modules** vì import/export là **tĩnh** (phân tích được khi build).

```javascript
// 📁 utils.js
export function dung1() { /* ... */ }  // Được sử dụng
export function dung2() { /* ... */ }  // KHÔNG được sử dụng

// 📁 main.js
import { dung1 } from "./utils.js";
// -> Bundler (Webpack, Vite) sẽ TỰ ĐỘNG xóa dung2 khỏi bản build
```

---

### Câu 5: Làm sao để sử dụng ES Modules trong Node.js?

**Đáp án:** Có 2 cách:

```javascript
// Cách 1: Đổi đuôi file thành .mjs
// 📁 server.mjs
import express from "express";

// Cách 2: Thêm "type": "module" trong package.json
// 📁 package.json
// { "type": "module" }

// 📁 server.js -- bây giờ có thể dùng import
import express from "express";
```
