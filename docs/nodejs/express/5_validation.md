---
sidebar_position: 5
title: "Input Validation"
---

# Input Validation

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
