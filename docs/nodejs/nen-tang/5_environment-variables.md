---
sidebar_position: 5
title: "5. Environment Variables"
---

# Environment Variables

Environment variables (biến môi trường) là cách lưu cấu hình và thông tin nhạy cảm như mật khẩu, API key bên ngoài source code. Bài này hướng dẫn truy cập biến qua `process.env`, dùng thư viện dotenv cho local, validate biến bắt buộc khi khởi động và quản lý nhiều môi trường khác nhau. Cách làm này vừa bảo mật vừa giúp app linh hoạt theo từng môi trường.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Tách cấu hình và secret khỏi code, đọc qua `process.env`** — không hardcode DB url, API key, port.
- **Dùng `dotenv` cho local** — `require('dotenv').config()` nạp giá trị từ file `.env`.
- **KHÔNG BAO GIỜ commit `.env`** — chỉ commit `.env.example` để team biết cần set biến nào.
- **Validate biến bắt buộc khi khởi động** — thiếu biến thì "fail fast" ngay thay vì lỗi mơ hồ lúc chạy.
- **Phân biệt môi trường bằng `NODE_ENV`** — cùng một code chạy được cho dev, staging, production.

:::

---

## Mục lục

- [Vì sao dùng environment variables?](#vì-sao-dùng-environment-variables)
- [Tại sao cần Environment Variables?](#tại-sao-cần-environment-variables)
- [process.env](#processenv)
- [Sử dụng dotenv](#sử-dụng-dotenv)
- [Validate Environment Variables](#validate-environment-variables)
- [Nhiều môi trường](#nhiều-môi-trường)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao dùng environment variables?

**Vấn đề:** Hardcode cấu hình (DB url, API key, port) ngay trong code khiến secret bị lộ khi push lên git, và phải sửa code mỗi khi đổi môi trường (dev/staging/prod).

```js
// Hardcode — secret lộ trên git, đổi môi trường phải sửa code
const dbUrl = 'mongodb://admin:p@ssw0rd@db-prod:27017/myapp';
const jwtSecret = 'my-super-secret-key';
const port = 3000;
```

**Giải pháp:** Dùng environment variables để tách cấu hình khỏi code. App đọc giá trị qua `process.env`, local dùng file `.env` (qua dotenv) — KHÔNG commit `.env`, chỉ commit `.env.example`. Cùng một code chạy được nhiều môi trường, secret an toàn.

```bash
# .env (local, KHÔNG commit) — .env.example thì commit
DATABASE_URL=mongodb://admin:p@ssw0rd@db-prod:27017/myapp
JWT_SECRET=my-super-secret-key
PORT=3000
```

```js
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;
const jwtSecret = process.env.JWT_SECRET;
const port = process.env.PORT || 3000;
```

:::tip[Dùng thực tế]

- **Tách secret khỏi repo** — `JWT_SECRET`, API key nằm trong `.env`, không bao giờ lên git
- **Nhiều môi trường** — `DATABASE_URL` trỏ DB khác nhau cho dev/staging/prod, code giữ nguyên
- **Port linh hoạt** — `process.env.PORT` để host (Heroku, Docker...) tự gán port khi deploy
- **Feature flag** — bật/tắt tính năng qua biến (ví dụ `ENABLE_NEW_UI=true`) mà không cần sửa code

:::

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
