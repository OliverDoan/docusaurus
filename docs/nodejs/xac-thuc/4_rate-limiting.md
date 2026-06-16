---
sidebar_position: 4
title: "4. Rate Limiting"
---

# Rate Limiting

Rate limiting là kỹ thuật giới hạn số lần một client được gọi API trong một khoảng thời gian, giúp chống brute-force, DDoS và kiểm soát chi phí. Bài này hướng dẫn dùng express-rate-limit để đặt giới hạn cho toàn app, siết chặt hơn cho các endpoint nhạy cảm như login/register, và dùng Redis store khi chạy nhiều server. Đây là lớp phòng thủ cần thiết cho API trong môi trường thực tế.

---

## Mục lục

- [Vì sao cần rate limiting?](#vì-sao-cần-rate-limiting)
- [Tại sao cần Rate Limiting?](#tại-sao-cần-rate-limiting)
- [express-rate-limit](#express-rate-limit)
- [Rate limit cho endpoints nhạy cảm](#rate-limit-cho-endpoints-nhạy-cảm)
- [Rate Limiting với Redis](#rate-limiting-với-redis)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao cần rate limiting?

**Vấn đề:**

```js
// API không giới hạn số request → bị lạm dụng
app.post('/login', authController.login);

// Kẻ tấn công có thể spam vô hạn:
// - Brute-force mật khẩu / OTP (thử hàng nghìn lần/giây)
// - Spam đăng ký tài khoản ảo
// - Scrape toàn bộ dữ liệu
// - Tấn công DoS → cạn tài nguyên server, tăng chi phí
```

**Giải pháp:**

```js
// Rate limiting: giới hạn số request trong một khoảng thời gian
// theo IP / user / API key (token bucket, sliding window)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // cửa sổ 15 phút
  max: 100,                 // tối đa 100 request mỗi IP
  // vượt giới hạn → trả về 429 Too Many Requests
});

// Lưu bộ đếm ở Redis để dùng chung cho nhiều server
// → bảo vệ hệ thống và chia sẻ tài nguyên công bằng
app.use(limiter);
```

:::tip[Dùng thực tế]

- **Login**: giới hạn số lần đăng nhập để chống brute-force mật khẩu.
- **API công khai**: đặt quota theo API key để tránh bị quá tải.
- **Gửi OTP/email**: throttle endpoint để tránh spam và lạm dụng.
- **Chống scrape**: chặn bot quét dữ liệu hàng loạt.

:::

## Tại sao cần Rate Limiting?

- Ngăn chặn **brute-force attacks** (đoán password)
- Bảo vệ khỏi **DDoS**
- Kiểm soát chi phí API

## express-rate-limit

```bash
npm install express-rate-limit
```

```js
const rateLimit = require('express-rate-limit');

// Global rate limit: 100 requests / 15 phút
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100,
  message: {
    error: 'Too many requests, please try again later',
  },
  standardHeaders: true, // Trả RateLimit-* headers
});

app.use(globalLimiter);
```

## Rate limit cho endpoints nhạy cảm

```js
// Login: 5 lần / 15 phút
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
});

router.post('/login', loginLimiter, authController.login);

// Register: 3 lần / giờ
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: 'Too many accounts created. Try again in 1 hour.' },
});

router.post('/register', registerLimiter, authController.register);
```

## Rate Limiting với Redis

Cho production (nhiều server instances):

```bash
npm install rate-limit-redis
```

```js
const RedisStore = require('rate-limit-redis');

const limiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
  windowMs: 15 * 60 * 1000,
  max: 100,
});
```

## Tóm tắt

- Rate limit global cho toàn app
- Rate limit nghiêm ngặt hơn cho login/register
- Dùng Redis store cho multi-server deployment
- Trả RateLimit headers để client biết quota còn lại
