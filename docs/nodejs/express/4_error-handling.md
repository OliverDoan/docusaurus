---
sidebar_position: 4
title: "4. Error Handling"
---

# Error Handling trong Express

## Vấn đề

Nếu không xử lý lỗi đúng cách, server có thể crash hoặc trả về lỗi không rõ ràng.

## Custom Error Class

```js
// utils/AppError.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
```

## Sử dụng trong Routes

```js
const AppError = require('./utils/AppError');

router.get('/users/:id', (req, res, next) => {
  const user = users.find(u => u.id === parseInt(req.params.id));

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.json(user);
});
```

## Global Error Handler

```js
// middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal Server Error';

  // Log lỗi (chỉ log chi tiết trong development)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  } else {
    console.error('Error:', err.message);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}

module.exports = errorHandler;
```

```js
// app.js — đặt sau tất cả routes
app.use(errorHandler);
```

## Async Error Wrapper

Tự động catch lỗi trong async route handlers:

```js
// utils/catchAsync.js
function catchAsync(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

module.exports = catchAsync;
```

```js
const catchAsync = require('./utils/catchAsync');

// Không cần try/catch thủ công
router.get('/users', catchAsync(async (req, res) => {
  const users = await User.find();
  res.json(users);
}));

router.post('/users', catchAsync(async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json(user);
}));
```

## 404 Handler

```js
// Đặt sau tất cả routes, trước error handler
app.use((req, res, next) => {
  next(new AppError(`Cannot ${req.method} ${req.url}`, 404));
});
```

## Unhandled Errors (Safety Net)

```js
// Xử lý Promise rejection chưa được catch
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

// Xử lý exception chưa được catch
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
```

## Tóm tắt

- Tạo `AppError` class để phân biệt lỗi operational vs programming
- Dùng global error handler middleware (4 tham số)
- `catchAsync` wrapper giúp tránh try/catch lặp lại
- Luôn có 404 handler và unhandled rejection handler
