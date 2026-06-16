---
sidebar_position: 5
title: "5. Input Validation"
---

# Input Validation

Kiểm tra dữ liệu đầu vào (validation) là bước bắt buộc để ngăn dữ liệu sai vào database và bảo vệ ứng dụng khỏi các kiểu tấn công injection. Khi dữ liệu không hợp lệ, ta nên trả lỗi rõ ràng cho client thay vì để hệ thống xử lý sai. Bài này hướng dẫn dùng thư viện Joi để định nghĩa schema, viết validation middleware tái sử dụng, và kiểm tra cả body, params lẫn query.

---

## Mục lục

- [Vì sao cần validation?](#vì-sao-cần-validation)
- [Tại sao cần validate?](#tại-sao-cần-validate)
- [Joi — Schema Validation](#joi-schema-validation)
- [Validation Middleware](#validation-middleware)
- [Validate Params & Query](#validate-params-query)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao cần validation?

**Vấn đề:** Không bao giờ được tin dữ liệu từ client. Tự `if`-check thủ công thì lặp code và dễ sót — thiếu field, sai kiểu, giá trị độc hại đều lọt qua, gây crash, dữ liệu bẩn trong DB hoặc lỗ hổng injection.

```js
// Tin dữ liệu client mà không kiểm tra
router.post('/users', (req, res) => {
  const { name, email, age } = req.body;
  // email là undefined? age là chuỗi "abc"? field lạ chứa payload độc?
  db.users.insert({ name, email, age }); // dữ liệu bẩn / crash / injection
  res.status(201).json({ ok: true });
});
```

**Giải pháp:** Validate ngay tại **biên** (boundary) bằng schema. Định nghĩa quy tắc một lần với Joi, tự kiểm tra `body`/`query`/`params`, trả lỗi rõ ràng và "fail fast" trước khi vào business logic.

```js
const Joi = require('joi');

const userSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(0).max(150),
});

router.post('/users', (req, res, next) => {
  const { error, value } = userSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true, // loại bỏ field lạ
  });
  if (error) {
    return res.status(400).json({ error: error.details.map(d => d.message) });
  }
  // value đã sạch, đúng kiểu — an toàn để xử lý tiếp
  next();
});
```

:::tip[Dùng thực tế]

- Validate body đăng ký: email đúng định dạng, password đủ mạnh (độ dài, ký tự).
- Ép kiểu query phân trang: `page`/`limit` thành số nguyên, có giá trị mặc định và giới hạn max.
- Từ chối field lạ với `stripUnknown` để client không nhét dữ liệu ngoài ý muốn.
- Gom toàn bộ lỗi (`abortEarly: false`) trả về một lần cho client dễ hiển thị form.

:::

## Tại sao cần validate?

- Ngăn chặn dữ liệu không hợp lệ vào database
- Bảo vệ khỏi injection attacks
- Trả lỗi rõ ràng cho client

## Joi — Schema Validation

```bash
npm install joi
```

```js
const Joi = require('joi');

// Định nghĩa schema
const userSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(0).max(150),
  role: Joi.string().valid('user', 'admin').default('user'),
});

// Validate
router.post('/users', (req, res, next) => {
  const { error, value } = userSchema.validate(req.body, {
    abortEarly: false, // Trả tất cả lỗi, không dừng ở lỗi đầu tiên
  });

  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(d => d.message),
    });
  }

  // value đã được validate và có default values
  res.status(201).json(value);
});
```

## Validation Middleware

```js
// middleware/validate.js
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true, // Loại bỏ fields không có trong schema
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message,
        })),
      });
    }

    req.body = value; // Gán lại body đã validate
    next();
  };
}

module.exports = validate;
```

```js
// Sử dụng
const validate = require('../middleware/validate');

const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
});

router.post('/users', validate(createUserSchema), userController.create);
```

## Validate Params & Query

```js
const idSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().valid('name', 'createdAt', 'price').default('createdAt'),
});

function validateParams(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params);
    if (error) return res.status(400).json({ error: error.message });
    req.params = value;
    next();
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);
    if (error) return res.status(400).json({ error: error.message });
    req.query = value;
    next();
  };
}

router.get('/users/:id', validateParams(idSchema), userController.getById);
router.get('/users', validateQuery(querySchema), userController.getAll);
```

## Tóm tắt

- Luôn validate input từ client
- Joi cung cấp schema validation mạnh mẽ
- Tạo validation middleware để tái sử dụng
- Validate cả body, params, và query
- `stripUnknown: true` loại bỏ fields không mong muốn
