---
sidebar_position: 1
title: "1. Express.js cơ bản"
---

# Express.js cơ bản

Express.js là web framework phổ biến nhất cho Node.js, nổi bật vì tối giản, linh hoạt và dễ học. Nó giúp bạn xây dựng API và web server nhanh chóng bằng cách xử lý các request HTTP một cách rõ ràng. Bài này giới thiệu những kiến thức nền tảng: cài đặt, viết server đầu tiên, các HTTP method, đối tượng request/response và cách đọc dữ liệu JSON.

---

## Mục lục

- [Express là gì?](#express-là-gì)
- [Vì sao dùng Express?](#vì-sao-dùng-express)
- [Cài đặt](#cài-đặt)
- [Hello World](#hello-world)
- [HTTP Methods](#http-methods)
- [Request Object](#request-object)
- [Response Object](#response-object)
- [Parse JSON body](#parse-json-body)
- [Tóm tắt](#tóm-tắt)

---

## Express là gì?

Express.js là **web framework** phổ biến nhất cho Node.js — tối giản, linh hoạt, mạnh mẽ.

## Vì sao dùng Express?

**Vấn đề:** Dùng module `http` thuần của Node, bạn phải tự phân tích URL/method, tự định tuyến bằng `if/else`, tự parse body, tự set header... rất dài dòng và lặp lại cho mọi app.

```js
const http = require('http');

const server = http.createServer((req, res) => {
  // Tự định tuyến theo method + path
  if (req.method === 'GET' && req.url === '/users') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([{ id: 1, name: 'Alice' }]));
  } else if (req.method === 'POST' && req.url === '/users') {
    // Tự parse body từng chunk
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      const data = JSON.parse(body);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(3000);
```

**Giải pháp:** Express là framework tối giản dựng trên `http`, cung cấp routing (`app.get`/`app.post`), middleware, parse body (`express.json`) và quản lý `req`/`res` gọn gàng → dựng API/web server nhanh, lại có hệ sinh thái middleware lớn.

```js
const express = require('express');
const app = express();

app.use(express.json()); // Parse JSON body tự động

app.get('/users', (req, res) => {
  res.json([{ id: 1, name: 'Alice' }]);
});

app.post('/users', (req, res) => {
  res.status(201).json(req.body);
});

app.listen(3000);
```

:::tip[Dùng thực tế]

- **Xây REST API:** định nghĩa endpoint theo tài nguyên một cách rõ ràng.
- **Định tuyến gọn:** khớp theo method/path (`app.get('/users/:id')`) thay vì `if/else`.
- **Gắn middleware:** thêm auth, logging, validate vào pipeline xử lý request.
- **Phục vụ static/file:** trả file tĩnh hoặc tải file với `express.static` / `res.sendFile`.

:::

## Cài đặt

```bash
npm init -y
npm install express
```

## Hello World

```js
const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

## HTTP Methods

```js
// GET — Lấy dữ liệu
app.get('/users', (req, res) => {
  res.json([{ id: 1, name: 'Alice' }]);
});

// POST — Tạo mới
app.post('/users', (req, res) => {
  const newUser = req.body;
  res.status(201).json(newUser);
});

// PUT — Cập nhật toàn bộ
app.put('/users/:id', (req, res) => {
  res.json({ id: req.params.id, ...req.body });
});

// PATCH — Cập nhật một phần
app.patch('/users/:id', (req, res) => {
  res.json({ updated: true });
});

// DELETE — Xoá
app.delete('/users/:id', (req, res) => {
  res.status(204).send();
});
```

## Request Object

```js
app.get('/search', (req, res) => {
  // Query parameters: /search?q=nodejs&page=1
  const { q, page } = req.query;

  // Headers
  const authHeader = req.headers['authorization'];

  // IP
  const ip = req.ip;

  res.json({ query: q, page, ip });
});

// Route parameters: /users/42
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  res.json({ id: userId });
});
```

## Response Object

```js
// JSON response
res.json({ message: 'OK' });

// Status code + JSON
res.status(201).json({ created: true });

// Redirect
res.redirect('/login');

// Send file
res.sendFile('/path/to/file.pdf');

// Set header
res.set('X-Custom-Header', 'value');
```

## Parse JSON body

```js
// Middleware để parse JSON body
app.use(express.json());

app.post('/users', (req, res) => {
  const { name, email } = req.body;
  res.status(201).json({ name, email });
});
```

## Tóm tắt

- Express là framework tối giản cho Node.js
- Hỗ trợ đầy đủ HTTP methods (GET, POST, PUT, DELETE...)
- `req` chứa thông tin request, `res` dùng để trả response
- Dùng `express.json()` middleware để parse JSON body
