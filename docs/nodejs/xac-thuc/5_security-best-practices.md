---
sidebar_position: 5
title: "5. Security Best Practices"
---

# Security Best Practices

Bài này tổng hợp những thực hành bảo mật quan trọng nhất khi xây dựng API với Node.js để bảo vệ ứng dụng khỏi các lỗ hổng phổ biến. Bạn sẽ học cách thêm security headers với Helmet, cấu hình CORS, làm sạch input để chống injection, dùng parameterized query và chạy npm audit. Kèm theo là một checklist cần rà soát trước khi deploy lên production.

---

## Mục lục

- [Helmet — Security Headers](#helmet-security-headers)
- [CORS](#cors)
- [Input Sanitization](#input-sanitization)
- [SQL Injection Prevention](#sql-injection-prevention)
- [Security Checklist](#security-checklist)
- [npm audit](#npm-audit)
- [Tóm tắt](#tóm-tắt)

---

## Helmet — Security Headers

```bash
npm install helmet
```

```js
const helmet = require('helmet');
app.use(helmet());
```

Helmet tự động set các headers bảo mật:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security`
- `Content-Security-Policy`

## CORS

```bash
npm install cors
```

```js
const cors = require('cors');

// Chỉ cho phép origins cụ thể
app.use(cors({
  origin: ['https://myapp.com', 'https://admin.myapp.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
```

## Input Sanitization

```bash
npm install express-mongo-sanitize xss-clean
```

```js
const mongoSanitize = require('express-mongo-sanitize');

// Ngăn NoSQL injection
app.use(mongoSanitize());

// Input: { "email": { "$gt": "" } }
// Sau sanitize: { "email": {} }  → an toàn
```

## SQL Injection Prevention

```js
// LUÔN dùng parameterized queries
// BAD
const query = `SELECT * FROM users WHERE id = ${userId}`;

// GOOD (Prisma — tự động parameterized)
const user = await prisma.user.findUnique({ where: { id: userId } });

// GOOD (raw query parameterized)
const result = await prisma.$queryRaw`
  SELECT * FROM users WHERE id = ${userId}
`;
```

## Security Checklist

Trước khi deploy:
- [ ] Helmet enabled
- [ ] CORS configured (không dùng `*` trong production)
- [ ] Rate limiting trên tất cả endpoints
- [ ] Input validation (Joi/Zod)
- [ ] Password hashing (bcrypt, >= 12 rounds)
- [ ] JWT secret đủ mạnh (>= 32 characters)
- [ ] Không expose error stack trong production
- [ ] HTTPS only
- [ ] Không hardcode secrets
- [ ] Dependencies up-to-date (`npm audit`)

## npm audit

```bash
# Kiểm tra vulnerabilities
npm audit

# Tự động fix
npm audit fix
```

## Tóm tắt

- Helmet cho security headers
- CORS restrict origins trong production
- Validate và sanitize tất cả input
- Dùng parameterized queries
- Chạy `npm audit` định kỳ
