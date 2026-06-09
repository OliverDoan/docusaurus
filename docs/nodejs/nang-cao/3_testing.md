---
sidebar_position: 3
title: "3. Testing"
---

# Testing Node.js Applications

Testing giúp bạn kiểm tra code chạy đúng và phát hiện lỗi sớm trước khi đưa lên production. Bài này giới thiệu Jest để viết unit test, Supertest để test API, và cách dùng mock cho các dịch vụ bên ngoài. Code có test đầy đủ sẽ dễ bảo trì và an tâm hơn khi sửa đổi.

---

## Mục lục

- [Jest](#jest)
- [Supertest — API Testing](#supertest-api-testing)
- [Mocking](#mocking)
- [Tóm tắt](#tóm-tắt)

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
