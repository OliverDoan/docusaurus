---
sidebar_position: 1
title: "1. Node.js là gì?"
---

# Node.js là gì?

Node.js là môi trường runtime cho phép chạy JavaScript bên ngoài trình duyệt, xây trên V8 engine của Chrome. Nhờ đó bạn có thể dùng cùng một ngôn ngữ cho cả frontend lẫn backend, và viết server xử lý được hàng ngàn kết nối cùng lúc. Bài này giới thiệu tổng quan kiến trúc, cách cài đặt và điểm khác biệt so với JavaScript trên trình duyệt.

---

## Mục lục

- [Vì sao Node.js ra đời?](#vì-sao-nodejs-ra-đời)
- [Giới thiệu](#giới-thiệu)
- [Kiến trúc Node.js](#kiến-trúc-nodejs)
- [Cài đặt Node.js](#cài-đặt-nodejs)
- [Chạy chương trình đầu tiên](#chạy-chương-trình-đầu-tiên)
- [Node.js vs Browser JavaScript](#nodejs-vs-browser-javascript)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao Node.js ra đời?

**Vấn đề:**

- JavaScript ngày xưa **chỉ** chạy được trong trình duyệt, không thể viết server.
- Server truyền thống (Apache + PHP) tạo **một thread cho mỗi request** — tốn RAM và CPU khi có nhiều kết nối I/O đồng thời (chat, realtime).
- Phải dùng **hai ngôn ngữ khác nhau** cho frontend và backend.

```js
// Mô hình cũ: mỗi kết nối tốn một thread, chờ I/O xong mới làm tiếp
function handleRequest(req) {
  const data = db.querySync(req.id); // BLOCK: thread đứng chờ DB
  return render(data);
}
// 1000 kết nối → cần ~1000 thread → ngốn tài nguyên
```

**Giải pháp:**

```js
// Node.js (2009): V8 chạy JS ngoài trình duyệt, event loop non-blocking, đơn luồng
const http = require('http');

http.createServer((req, res) => {
  db.query(req.id, (err, data) => { // KHÔNG block: trả callback khi xong
    res.end(render(data));
  });
}).listen(3000);
// 1000 kết nối → vẫn một luồng, xử lý nhẹ nhàng nhờ event loop
```

- Đưa **V8 engine** ra ngoài trình duyệt, chạy JavaScript ở **server**.
- Mô hình **event loop non-blocking I/O đơn luồng** → xử lý hàng nghìn kết nối nhẹ nhàng.
- Một ngôn ngữ **full-stack**, dùng chung hệ sinh thái **npm**.

:::tip[Dùng thực tế]

- **API / realtime nhiều kết nối**: chat, thông báo, streaming, game online.
- **Full-stack JavaScript**: cùng một ngôn ngữ cho cả frontend lẫn backend.
- **Công cụ CLI**: build tool, script tự động hóa (Webpack, ESLint, npm scripts).
- **Microservice**: service nhẹ, khởi động nhanh, dễ scale theo chiều ngang.

:::

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
