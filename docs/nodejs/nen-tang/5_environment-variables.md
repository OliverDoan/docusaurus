---
sidebar_position: 5
title: "5. Environment Variables"
---

# Environment Variables

Environment variables (biến môi trường) là cách lưu cấu hình và thông tin nhạy cảm như mật khẩu, API key bên ngoài source code. Bài này hướng dẫn truy cập biến qua `process.env`, dùng thư viện dotenv cho local, validate biến bắt buộc khi khởi động và quản lý nhiều môi trường khác nhau. Cách làm này vừa bảo mật vừa giúp app linh hoạt theo từng môi trường.

---

## Mục lục

- [Tại sao cần Environment Variables?](#tại-sao-cần-environment-variables)
- [process.env](#processenv)
- [Sử dụng dotenv](#sử-dụng-dotenv)
- [Validate Environment Variables](#validate-environment-variables)
- [Nhiều môi trường](#nhiều-môi-trường)
- [Tóm tắt](#tóm-tắt)

---

## Tại sao cần Environment Variables?

- **Bảo mật** — Không hardcode secrets vào source code
- **Linh hoạt** — Thay đổi config theo môi trường (dev, staging, production)
- **Best practice** — Tuân theo [12-Factor App](https://12factor.net/config)

## process.env

Node.js truy cập biến môi trường qua `process.env`:

```js
const port = process.env.PORT || 3000;
const dbUrl = process.env.DATABASE_URL;
const nodeEnv = process.env.NODE_ENV;

console.log(`Server running on port ${port}`);
console.log(`Environment: ${nodeEnv}`);
```

## Sử dụng dotenv

```bash
npm install dotenv
```

```
# .env
PORT=3000
DATABASE_URL=mongodb://localhost:27017/myapp
JWT_SECRET=my-super-secret-key
NODE_ENV=development
```

```js
// index.js — load .env ở đầu file
require('dotenv').config();

const port = process.env.PORT;
const dbUrl = process.env.DATABASE_URL;
```

### Quan trọng: Bảo mật .env

```gitignore
# .gitignore — LUÔN thêm .env
.env
.env.local
.env.production
```

Tạo file `.env.example` (commit vào git) để team biết cần set biến nào:

```
# .env.example
PORT=3000
DATABASE_URL=
JWT_SECRET=
NODE_ENV=development
```

## Validate Environment Variables

```js
function validateEnv() {
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

validateEnv();
```

## Nhiều môi trường

```bash
# Development
NODE_ENV=development node index.js

# Production
NODE_ENV=production node index.js
```

```js
const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

if (isDev) {
  // Chỉ chạy trong development
  console.log('Debug mode enabled');
}
```

## Tóm tắt

- Dùng `process.env` để truy cập biến môi trường
- Dùng `dotenv` cho local development
- **Không bao giờ** commit `.env` vào git
- Validate required env vars khi khởi động app
- Tạo `.env.example` cho team reference
