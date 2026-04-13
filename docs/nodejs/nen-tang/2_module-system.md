---
sidebar_position: 2
title: "2. Module System"
---

# Module System trong Node.js

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
