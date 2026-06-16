---
sidebar_position: 4
title: "4. Error Handling"
---

# Error Handling trong Express

Xử lý lỗi đúng cách giúp server không bị crash và luôn trả về thông báo lỗi rõ ràng cho client. Nếu bỏ qua việc này, một lỗi nhỏ trong code async cũng có thể làm sập cả ứng dụng. Bài này hướng dẫn tạo custom error class, viết global error handler, dùng wrapper để bắt lỗi async, cùng cách xử lý 404 và các lỗi chưa được catch.

---

## Mục lục

- [Vì sao cần xử lý lỗi tập trung?](#vì-sao-cần-xử-lý-lỗi-tập-trung)
- [Vấn đề](#vấn-đề)
- [Custom Error Class](#custom-error-class)
- [Sử dụng trong Routes](#sử-dụng-trong-routes)
- [Global Error Handler](#global-error-handler)
- [Async Error Wrapper](#async-error-wrapper)
- [404 Handler](#404-handler)
- [Unhandled Errors (Safety Net)](#unhandled-errors-safety-net)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao cần xử lý lỗi tập trung?

**Vấn đề:** Khi mỗi route tự đặt `try/catch` và `res.status(500)`, code bị lặp khắp nơi, lỗi async không bắt được sẽ gây `unhandledRejection` làm **crash server**, và định dạng lỗi trả về cho client không nhất quán.

```js
// Lặp try/catch ở MỌI route, định dạng lỗi khác nhau
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message }); // format kiểu A
  }
});

router.get('/products', async (req, res) => {
  // Quên try/catch → lỗi async không được bắt → CRASH server
  const products = await Product.find();
  res.json({ error: 'lỗi' }); // format kiểu B, không nhất quán
});
```

**Giải pháp:** Dùng **error handling middleware** tập trung (4 tham số `(err, req, res, next)`). Mọi route chỉ cần gọi `next(err)` (hoặc bọc bằng async wrapper); một chỗ duy nhất sẽ format lỗi nhất quán, log chi tiết và phân loại lỗi qua custom `AppError`.

```js
// utils/AppError.js — phân loại lỗi
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// utils/catchAsync.js — bọc route async, tự forward lỗi vào next()
const catchAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// route gọn, không lặp try/catch
router.get('/users', catchAsync(async (req, res) => {
  const users = await User.find();
  res.json(users);
}));

// middleware lỗi cuối cùng — một chỗ format & trả lỗi nhất quán
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error('Error:', err); // log chi tiết phía server
  res.status(statusCode).json({
    success: false,
    error: { message: err.isOperational ? err.message : 'Internal Server Error' },
    // KHÔNG lộ err.stack ra client ở production
  });
});
```

:::tip[Dùng thực tế]

- **Middleware lỗi cuối cùng:** đặt `app.use(errorHandler)` sau tất cả routes để gom mọi lỗi về một nơi format và trả về.
- **`asyncHandler` bọc route:** dùng `catchAsync(...)` cho mọi handler async, khỏi viết `try/catch` lặp lại và không lo quên bắt lỗi.
- **Custom `AppError` với `statusCode`:** `next(new AppError('User not found', 404))` để phân loại lỗi nghiệp vụ và trả đúng mã trạng thái.
- **Không lộ stack ở production:** chỉ trả `err.stack` khi `NODE_ENV === 'development'`, tránh rò rỉ thông tin nhạy cảm cho client.

:::

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
