---
sidebar_position: 2
title: "2. Module System"
---

# Module System trong Node.js

Module system là cách Node.js chia code thành nhiều file nhỏ rồi import/export dùng lại với nhau. Bài này giới thiệu hai kiểu module là CommonJS (`require`) và ES Modules (`import`), cùng vài built-in module quan trọng như `path`, `fs`, `os` và `events`. Hiểu phần này giúp bạn tổ chức dự án gọn gàng và dễ bảo trì.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Mỗi file là một module có scope riêng** — khai báo phụ thuộc rõ ràng, tránh đụng và đè biến global.
- **CommonJS** — dùng `require` / `module.exports`, là hệ thống module mặc định của Node.
- **ES Modules** — dùng `import` / `export`, bật bằng `"type": "module"` trong `package.json`.
- **Built-in module quan trọng** — `path`, `fs` (dùng `fs/promises` cho async), `os`, `events`.
- **Khác biệt tải module** — CJS load đồng bộ, ESM load bất đồng bộ và hỗ trợ top-level await.

:::

---

## Mục lục

- [Vì sao Node có module system?](#vì-sao-node-có-module-system)
- [CommonJS (CJS)](#commonjs-cjs)
- [ES Modules (ESM)](#es-modules-esm)
- [Built-in Modules quan trọng](#built-in-modules-quan-trọng)
- [So sánh CJS vs ESM](#so-sánh-cjs-vs-esm)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao Node có module system?

**Vấn đề:**

```js
// Thời JS trình duyệt đầu tiên: KHÔNG có module chuẩn.
// Mọi file dùng chung một global, dễ đụng tên và đè biến của nhau.

// utils.js
var total = 0; // biến global

// cart.js
var total = []; // CŨNG là global → ghi đè total ở trên!

// Phải tự load đúng thứ tự thẻ <script>, sai thứ tự là vỡ:
// <script src="utils.js"></script>
// <script src="cart.js"></script>
// Không cách nào biết file nào phụ thuộc file nào.
```

**Giải pháp:**

```js
// Node ra đời với CommonJS: mỗi file là MỘT module có scope riêng,
// khai báo phụ thuộc rõ ràng bằng require/module.exports.

// utils.js
let total = 0; // chỉ tồn tại trong module này, không rò ra global
module.exports = { total };

// cart.js
const { total } = require('./utils'); // nêu rõ "tôi cần utils"
// Node tự lo thứ tự nạp dựa trên các require — không phải xếp tay.

// Sau này Node hỗ trợ thêm ESM theo chuẩn ngôn ngữ:
// import { total } from './utils.js';
```

:::tip[Dùng thực tế]

- Tách logic thành nhiều file nhỏ (`routes`, `services`, `models`) thay vì gom hết vào một file khổng lồ.
- Import thư viện npm gọn gàng: `const express = require('express')` hoặc `import express from 'express'`.
- Chia module theo chức năng để tái sử dụng và test từng phần độc lập.
- Chọn CJS hay ESM tùy dự án: thêm `"type": "module"` trong `package.json` để bật ESM.

:::

## CommonJS (CJS)

Hệ thống module mặc định của Node.js:

```js
// math.js — export
function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

module.exports = { add, multiply };
```

```js
// app.js — import
const { add, multiply } = require('./math');

console.log(add(2, 3));       // 5
console.log(multiply(4, 5));  // 20
```

## ES Modules (ESM)

Cú pháp hiện đại, hỗ trợ từ Node.js 14+:

```json
// package.json — bật ESM
{
  "type": "module"
}
```

```js
// math.mjs (hoặc .js nếu đã set "type": "module")
export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}

export default { add, multiply };
```

```js
// app.mjs
import { add, multiply } from './math.mjs';
import math from './math.mjs';

console.log(add(2, 3));
console.log(math.multiply(4, 5));
```

## Built-in Modules quan trọng

### `path` — Xử lý đường dẫn

```js
const path = require('path');

path.join('/users', 'admin', 'docs');    // /users/admin/docs
path.resolve('src', 'index.js');          // /absolute/path/src/index.js
path.extname('file.txt');                 // .txt
path.basename('/home/user/file.txt');     // file.txt
```

### `fs` — File System

```js
const fs = require('fs');
const fsPromises = require('fs/promises');

// Đọc file (async với callback)
fs.readFile('data.json', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(JSON.parse(data));
});

// Đọc file (async với Promise)
async function readData() {
  const data = await fsPromises.readFile('data.json', 'utf8');
  return JSON.parse(data);
}

// Ghi file
await fsPromises.writeFile('output.txt', 'Hello World');

// Kiểm tra file tồn tại
await fsPromises.access('file.txt'); // throws nếu không tồn tại
```

### `os` — Thông tin hệ thống

```js
const os = require('os');

console.log(os.platform());  // darwin, linux, win32
console.log(os.cpus().length); // số CPU cores
console.log(os.totalmem());   // tổng RAM (bytes)
console.log(os.homedir());    // thư mục home
```

### `events` — Event Emitter

```js
const EventEmitter = require('events');

class OrderService extends EventEmitter {
  placeOrder(order) {
    // Xử lý đơn hàng...
    this.emit('orderPlaced', order);
  }
}

const service = new OrderService();

service.on('orderPlaced', (order) => {
  console.log('Gửi email xác nhận:', order.id);
});

service.on('orderPlaced', (order) => {
  console.log('Cập nhật kho:', order.id);
});

service.placeOrder({ id: 1, product: 'Laptop' });
```

## So sánh CJS vs ESM

| Tính năng | CommonJS | ES Modules |
|-----------|----------|------------|
| Cú pháp | `require()` / `module.exports` | `import` / `export` |
| Loading | Synchronous | Asynchronous |
| Top-level await | Không | Có |
| File extension | `.js`, `.cjs` | `.mjs`, `.js` (với `"type": "module"`) |
| `__dirname` | Có sẵn | Dùng `import.meta.url` |

## Tóm tắt

- CommonJS là mặc định, ESM là tương lai
- Node.js có nhiều built-in modules hữu ích
- Nên dùng ESM cho project mới
- `fs/promises` cho async file operations
