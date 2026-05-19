---
sidebar_position: 2
title: "2. Exception Handling"
---

# Exception Handling

---

## Mục lục

- [throw](#throw)
- [try / catch / finally](#try--catch--finally)
- [Error Objects](#error-objects)
- [Custom Error](#custom-error)
- [Async error handling](#async-error-handling)

---

## throw

Dùng `throw` để **phát sinh lỗi**:

```js
function divide(a, b) {
  if (b === 0) {
    throw new Error("Không chia cho 0");
  }
  return a / b;
}
```

Có thể throw bất kỳ giá trị (không khuyến khích):

```js
throw "lỗi";       // tệ — mất stack trace
throw 42;          // tệ
throw { code: 1 }; // tệ
throw new Error("..."); // tốt — có stack
```

---

## try / catch / finally

```js
try {
  const data = JSON.parse(input);
  console.log(data);
} catch (err) {
  console.error("Parse failed:", err.message);
} finally {
  console.log("Luôn chạy");
}
```

`finally` chạy **dù có lỗi hay không**, kể cả khi `return` trong `try`:

```js
function load() {
  try {
    return fetchData();
  } catch (err) {
    console.error(err);
  } finally {
    closeConnection(); // luôn chạy
  }
}
```

Optional catch binding (ES2019) — bỏ tham số nếu không dùng:

```js
try {
  // ...
} catch {
  // không cần err
}
```

:::warning[Cần lưu ý]

**Đừng catch để swallow lỗi**:

```js
// Tệ — mất thông tin lỗi
try {
  doSomething();
} catch (err) {
  // im lặng
}

// Tệ — log rồi nuốt
try {
  doSomething();
} catch (err) {
  console.log(err);
}

// Tốt — xử lý hoặc rethrow
try {
  doSomething();
} catch (err) {
  if (err instanceof NetworkError) {
    return retry();
  }
  throw err; // rethrow nếu không biết xử lý
}
```

Quy tắc: **chỉ catch khi bạn biết xử lý**. Còn lại để bubble lên cho
nơi biết cách (top-level error handler, framework, monitoring).

:::

---

## Error Objects

JS có sẵn các class Error:

| Class | Khi nào |
|-------|---------|
| `Error` | Lỗi chung |
| `TypeError` | Kiểu sai (gọi non-function, đọc property của null) |
| `ReferenceError` | Biến không tồn tại |
| `SyntaxError` | Cú pháp sai (parse, JSON, eval) |
| `RangeError` | Giá trị ngoài phạm vi (`new Array(-1)`) |
| `URIError` | `decodeURI` lỗi |
| `AggregateError` | Gộp nhiều lỗi (`Promise.any`) |

```js
try {
  null.foo;
} catch (err) {
  err instanceof TypeError;  // true
  err.name;                  // "TypeError"
  err.message;               // "Cannot read properties of null..."
  err.stack;                 // stack trace
}
```

`Error.cause` (ES2022) — gắn lỗi gốc:

```js
try {
  await fetch(url);
} catch (err) {
  throw new Error("Failed to load user", { cause: err });
}
```

---

## Custom Error

Tạo class kế thừa `Error`:

```js
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

try {
  throw new ValidationError("Email không hợp lệ", "email");
} catch (err) {
  if (err instanceof ValidationError) {
    console.log(err.field); // "email"
  }
}
```

:::info[Phân tích]

**Pattern Error hierarchy** là chuẩn của library lớn:

```js
class AppError extends Error {
  constructor(message, options = {}) {
    super(message, { cause: options.cause });
    this.name = this.constructor.name;
    this.statusCode = options.statusCode ?? 500;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, { statusCode: 404 });
  }
}

class ValidationError extends AppError {
  constructor(field, message) {
    super(message, { statusCode: 400 });
    this.field = field;
  }
}
```

Lợi ích:

- Phân loại lỗi qua `instanceof`.
- Trung tâm hoá metadata (statusCode, code, retryable...).
- Stack trace sạch — không có frame của `AppError` constructor (nhờ
  `Error.captureStackTrace`).

Trong API server (Express, Fastify, Nest), middleware bắt error sẽ map
class → HTTP response.

:::

---

## Async error handling

Promise chain — `.catch()`:

```js
fetch(url)
  .then(r => r.json())
  .then(data => process(data))
  .catch(err => console.error(err));
```

Async/await — `try/catch`:

```js
async function load() {
  try {
    const r = await fetch(url);
    const data = await r.json();
    return process(data);
  } catch (err) {
    console.error(err);
    throw err;
  }
}
```

:::warning[Cần lưu ý]

**Unhandled promise rejection** — Promise bị reject mà không có `.catch`
hoặc `try/catch`:

```js
async function load() {
  await fetch("/bad-url"); // throw
}

load(); // không await, không catch → unhandled rejection
```

Trong Node.js ≥ 15, unhandled rejection sẽ **crash app** mặc định.
Browser hiện đại cũng warn trong console.

Bắt tổng:

```js
// Browser
window.addEventListener("unhandledrejection", e => {
  console.error("Unhandled:", e.reason);
});

// Node.js
process.on("unhandledRejection", err => {
  console.error("Unhandled:", err);
});
```

Đây là **safety net**, không phải replacement cho `try/catch` đúng vị trí.

:::

:::tip[Mẹo]

**Promise.allSettled** khi muốn chờ nhiều promise mà không "fail-fast":

```js
const results = await Promise.allSettled([
  fetch(url1),
  fetch(url2),
  fetch(url3),
]);

results.forEach((r, i) => {
  if (r.status === "fulfilled") {
    console.log(i, r.value);
  } else {
    console.error(i, r.reason);
  }
});
```

`Promise.all` reject ngay khi có 1 promise fail → mất kết quả các promise
còn lại. `allSettled` chờ tất cả, không reject.

:::
