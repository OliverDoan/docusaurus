---
sidebar_position: 1
title: "1. JWT Authentication"
---

# JWT Authentication

JWT (JSON Web Token) là cách phổ biến để xác thực người dùng trong ứng dụng Node.js mà không cần lưu session trên server. Bài này hướng dẫn bạn dùng JWT cùng bcrypt để làm chức năng đăng ký, đăng nhập và bảo vệ route bằng middleware. Đây là nền tảng quan trọng cho bất kỳ API nào cần biết "người dùng này là ai".

---

## Mục lục

- [JWT là gì?](#jwt-là-gì)
- [Cài đặt](#cài-đặt)
- [Đăng ký (Register)](#đăng-ký-register)
- [Đăng nhập (Login)](#đăng-nhập-login)
- [Auth Middleware](#auth-middleware)
- [Tóm tắt](#tóm-tắt)

---

## JWT là gì?

**JSON Web Token** (JWT) là chuẩn mở để truyền thông tin an toàn giữa các bên dưới dạng JSON object, được ký số (signed).

Cấu trúc: `header.payload.signature`

## Cài đặt

```bash
npm install jsonwebtoken bcryptjs
```

## Đăng ký (Register)

```js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Kiểm tra email đã tồn tại
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Tạo user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  // Tạo JWT
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({ token, user: { id: user.id, name, email } });
});
```

## Đăng nhập (Login)

```js
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Tìm user
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // So sánh password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Tạo JWT
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token });
});
```

## Auth Middleware

```js
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Protected route
router.get('/profile', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});
```

## Tóm tắt

- JWT cho stateless authentication
- Luôn hash password với bcrypt (salt rounds >= 12)
- Token gửi qua `Authorization: Bearer <token>`
- Middleware `requireAuth` bảo vệ routes
- Không lưu sensitive data trong JWT payload
