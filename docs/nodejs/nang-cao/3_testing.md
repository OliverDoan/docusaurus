---
sidebar_position: 3
title: "3. Testing"
---

# Testing Node.js Applications

Testing giúp bạn kiểm tra code chạy đúng và phát hiện lỗi sớm trước khi đưa lên production. Bài này giới thiệu Jest để viết unit test, Supertest để test API, và cách dùng mock cho các dịch vụ bên ngoài. Code có test đầy đủ sẽ dễ bảo trì và an tâm hơn khi sửa đổi.

---

## Mục lục

- [Vì sao cần test backend?](#vì-sao-cần-test-backend)
- [Jest](#jest)
- [Supertest — API Testing](#supertest-api-testing)
- [Mocking](#mocking)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao cần test backend?

**Vấn đề:** Mỗi lần đổi code lại mở Postman bấm tay từng endpoint vừa chậm vừa dễ sót. Backend xử lý dữ liệu quan trọng (tiền, auth), một regression nhỏ có thể gây hậu quả nặng. Refactor mà không có test thì luôn sợ vỡ chỗ khác mà không hay.

```js
// Kiểm tra thủ công: chạy server, mở Postman, bấm từng route...
// Đổi 1 dòng code -> phải bấm lại tất cả -> mệt và hay quên
POST /api/users   { name: 'Alice' }   // ổn?
POST /api/login   { ... }             // còn ổn không sau khi sửa?
```

**Giải pháp:** Viết test tự động chạy trong vài giây. Unit test cho logic/service (Jest), integration test gọi route thật qua Supertest, mock các dịch vụ ngoài. Bắt lỗi sớm, test trở thành tài liệu sống, tự tin refactor.

```js
// Test tự động: chạy `npm test` là kiểm tra lại toàn bộ
const request = require('supertest');
const app = require('../app');

test('POST /api/users tạo user mới', async () => {
  const res = await request(app)
    .post('/api/users')
    .send({ name: 'Alice', email: 'alice@example.com' })
    .expect(201);

  expect(res.body.name).toBe('Alice');
});
```

:::tip[Dùng thực tế]
- Test service tính toán (giá tiền, thuế) bằng unit test Jest để không sai lệch.
- Test endpoint trả đúng status code và JSON với Supertest gọi route thật.
- Test luồng auth (login, token) để chặn lỗ hổng đăng nhập.
- Chống regression: chạy lại toàn bộ test sau mỗi lần refactor để chắc không vỡ.
:::

---

## Jest

```bash
npm install --save-dev jest
```

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Unit Test

```js
// utils/math.js
function add(a, b) {
  return a + b;
}
module.exports = { add };

// utils/math.test.js
const { add } = require('./math');

describe('add', () => {
  test('adds two positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  test('adds negative numbers', () => {
    expect(add(-1, -2)).toBe(-3);
  });

  test('adds zero', () => {
    expect(add(5, 0)).toBe(5);
  });
});
```

## Supertest — API Testing

```bash
npm install --save-dev supertest
```

```js
const request = require('supertest');
const app = require('../app');

describe('GET /api/users', () => {
  test('returns list of users', async () => {
    const res = await request(app)
      .get('/api/users')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('POST /api/users', () => {
  test('creates a new user', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Alice', email: 'alice@example.com' })
      .expect(201);

    expect(res.body.name).toBe('Alice');
  });

  test('returns 400 for invalid data', async () => {
    await request(app)
      .post('/api/users')
      .send({ name: '' })
      .expect(400);
  });
});
```

## Mocking

```js
// Mock external service
jest.mock('../services/emailService');
const emailService = require('../services/emailService');

test('sends welcome email on registration', async () => {
  emailService.sendWelcome.mockResolvedValue(true);

  const res = await request(app)
    .post('/api/register')
    .send({ name: 'Bob', email: 'bob@example.com', password: 'Pass123!' });

  expect(emailService.sendWelcome).toHaveBeenCalledWith('bob@example.com');
});
```

## Tóm tắt

- Jest cho unit tests, Supertest cho API tests
- TDD: viết test trước, implement sau
- Mock external services
- Mục tiêu coverage >= 80%
