---
sidebar_position: 1
title: "Node.js là gì?"
---

# Node.js là gì?

## Giới thiệu

Node.js là một **runtime environment** cho phép chạy JavaScript bên ngoài trình duyệt, được xây dựng trên **V8 JavaScript Engine** của Google Chrome.

### Tại sao Node.js quan trọng?

- **JavaScript everywhere** — Dùng cùng ngôn ngữ cho cả frontend và backend
- **Non-blocking I/O** — Xử lý hàng ngàn kết nối đồng thời
- **NPM ecosystem** — Hệ sinh thái package lớn nhất thế giới
- **Real-time applications** — Lý tưởng cho chat, game, streaming

## Kiến trúc Node.js

```
┌──────────────────────────────────┐
│          Application Code        │
├──────────────────────────────────┤
│          Node.js APIs            │
│    (fs, http, path, crypto...)   │
├──────────────────────────────────┤
│    libuv (Event Loop, Thread     │
│     Pool, Async I/O)             │
├──────────────────────────────────┤
│       V8 JavaScript Engine       │
└──────────────────────────────────┘
```

### Event Loop

Node.js hoạt động theo mô hình **single-threaded event loop**:

```js
// Node.js không block khi đọc file
const fs = require('fs');

console.log('Bắt đầu');

fs.readFile('data.txt', 'utf8', (err, data) => {
  console.log('Đọc file xong:', data);
});

console.log('Tiếp tục xử lý'); // Chạy ngay, không đợi readFile
```

Output:
```
Bắt đầu
Tiếp tục xử lý
Đọc file xong: [nội dung file]
```

## Cài đặt Node.js

### Cách 1: Tải từ trang chủ

Truy cập [nodejs.org](https://nodejs.org) và tải phiên bản **LTS** (Long Term Support).

### Cách 2: Dùng nvm (khuyến khích)

```bash
# Cài nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Cài Node.js LTS
nvm install --lts

# Kiểm tra
node --version
npm --version
```

## Chạy chương trình đầu tiên

```js
// hello.js
const message = 'Hello from Node.js!';
console.log(message);
console.log(`Node version: ${process.version}`);
console.log(`Platform: ${process.platform}`);
```

```bash
node hello.js
```

## Node.js vs Browser JavaScript

| Tính năng | Browser | Node.js |
|-----------|---------|---------|
| DOM API | Có | Không |
| `window` / `document` | Có | Không |
| File System | Không | Có (`fs`) |
| Network (server) | Hạn chế | Đầy đủ (`http`, `net`) |
| `require` / `import` | `import` | Cả hai |
| `process` | Không | Có |

## Tóm tắt

- Node.js cho phép chạy JS trên server
- Dùng V8 engine, non-blocking I/O với libuv
- Lý tưởng cho ứng dụng I/O-intensive, real-time
- NPM cung cấp hệ sinh thái package khổng lồ
