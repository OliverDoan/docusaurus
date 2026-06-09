---
sidebar_position: 1
title: "1. Express.js cơ bản"
---

# Express.js cơ bản

Express.js là web framework phổ biến nhất cho Node.js, nổi bật vì tối giản, linh hoạt và dễ học. Nó giúp bạn xây dựng API và web server nhanh chóng bằng cách xử lý các request HTTP một cách rõ ràng. Bài này giới thiệu những kiến thức nền tảng: cài đặt, viết server đầu tiên, các HTTP method, đối tượng request/response và cách đọc dữ liệu JSON.

---

## Mục lục

- [Express là gì?](#express-là-gì)
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
