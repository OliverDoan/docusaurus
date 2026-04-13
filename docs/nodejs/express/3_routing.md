---
sidebar_position: 3
title: "3. Routing"
---

# Routing trong Express

## Router cơ bản

Express Router cho phép tổ chức routes thành modules riêng biệt:

```js
// routes/users.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json([{ id: 1, name: 'Alice' }]);
});

router.get('/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'Alice' });
});

router.post('/', (req, res) => {
  res.status(201).json(req.body);
});

module.exports = router;
```

```js
// app.js
const userRouter = require('./routes/users');

app.use('/api/users', userRouter);
// GET /api/users → router.get('/')
// GET /api/users/42 → router.get('/:id')
```

## Cấu trúc thư mục

```
src/
├── routes/
│   ├── index.js         # Gộp tất cả routes
│   ├── users.js
│   ├── products.js
│   └── orders.js
├── controllers/
│   ├── userController.js
│   └── productController.js
├── middleware/
│   ├── auth.js
│   └── validate.js
└── app.js
```

## Controller Pattern

Tách logic ra khỏi route definitions:

```js
// controllers/userController.js
const users = [];

const getAll = (req, res) => {
  res.json(users);
};

const getById = (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
};

const create = (req, res) => {
  const user = { id: Date.now(), ...req.body };
  users.push(user);
  res.status(201).json(user);
};

module.exports = { getAll, getById, create };
```

```js
// routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', userController.create);

module.exports = router;
```

## Route Parameters

```js
// Bắt buộc: /users/42
router.get('/users/:id', handler);

// Nhiều params: /users/42/posts/7
router.get('/users/:userId/posts/:postId', (req, res) => {
  const { userId, postId } = req.params;
  res.json({ userId, postId });
});

// Optional param: /posts hoặc /posts/2024
router.get('/posts/:year?', (req, res) => {
  const year = req.params.year || new Date().getFullYear();
  res.json({ year });
});
```

## Query Parameters

```js
// GET /products?category=electronics&sort=price&page=2
router.get('/products', (req, res) => {
  const { category, sort, page = 1, limit = 10 } = req.query;
  res.json({ category, sort, page: Number(page), limit: Number(limit) });
});
```

## Route Grouping

```js
// routes/index.js
const express = require('express');
const router = express.Router();

router.use('/users', require('./users'));
router.use('/products', require('./products'));
router.use('/orders', require('./orders'));

module.exports = router;
```

```js
// app.js
app.use('/api/v1', require('./routes'));
// Tất cả routes prefix với /api/v1
```

## Tóm tắt

- Dùng `express.Router()` để modularize routes
- Tách logic vào controllers
- Tổ chức theo feature: routes/, controllers/, middleware/
- Route params (`:id`) cho resource identification
- Query params (`?key=value`) cho filtering/sorting
