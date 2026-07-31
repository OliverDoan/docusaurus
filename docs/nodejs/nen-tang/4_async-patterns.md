---
sidebar_position: 4
title: "4. Async Patterns"
---

# Async Patterns trong Node.js

Node.js là non-blocking, nên xử lý bất đồng bộ là kỹ năng cốt lõi.


---

:::note[Ghi nhớ nhanh]

- ⭐ **Ưu tiên `async/await` cho code mới** — viết bất đồng bộ như đồng bộ, bắt lỗi bằng `try/catch`.
- **Tiến hoá** — Callbacks → Promises → Async/Await, giải quyết vấn đề "callback hell".
- **Chạy song song** — `Promise.all` chờ tất cả thành công; `Promise.allSettled` cho phép một số thất bại.
- **Luôn bọc `try/catch` quanh `await`** — để bắt lỗi I/O như mạng, file không tồn tại, DB timeout.
- **Lưới an toàn** — đặt handler `process.on('unhandledRejection', ...)` cho promise chưa được catch.

:::

---

## Mục lục

- [Vì sao có các async pattern?](#vì-sao-có-các-async-pattern)
- [1. Callbacks](#1-callbacks)
- [2. Promises](#2-promises)
- [3. Async/Await](#3-asyncawait)
- [Xử lý song song](#xử-lý-song-song)
- [Error Handling Best Practices](#error-handling-best-practices)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao có các async pattern?

**Vấn đề:** Node làm I/O (đọc file, query DB, gọi API) theo kiểu non-blocking bằng callback. Khi nhiều bước phụ thuộc nhau, callback lồng vào nhau ("callback hell") — khó đọc, khó xử lý lỗi ở từng tầng.

```js
// Mỗi bước phụ thuộc bước trước → lồng sâu, lỗi phải bắt lặp lại
getUser(id, (err, user) => {
  if (err) return done(err);
  getOrders(user.id, (err, orders) => {
    if (err) return done(err);
    getOrderDetails(orders[0].id, (err, details) => {
      if (err) return done(err);
      done(null, details);
    });
  });
});
```

**Giải pháp:** Tiến hoá dần — Promise nối `.then` phẳng và gom lỗi bằng `.catch`; rồi async/await cho viết code bất đồng bộ như đồng bộ với `try/catch` quen thuộc; `Promise.all` chạy nhiều việc song song.

```js
// async/await: phẳng, dễ đọc, một chỗ bắt lỗi
async function getDetails(id) {
  try {
    const user = await getUser(id);
    const orders = await getOrders(user.id);
    return await getOrderDetails(orders[0].id);
  } catch (err) {
    console.error('Lỗi:', err.message);
    throw err;
  }
}
```

:::tip[Dùng thực tế]
- **Đọc file + query DB tuần tự:** dùng `await` từng bước khi bước sau cần kết quả bước trước.
- **Gọi nhiều API độc lập:** dùng `Promise.all` để chạy song song, tổng thời gian bằng request chậm nhất.
- **Xử lý lỗi I/O:** bọc `try/catch` quanh `await` để bắt lỗi mạng, file không tồn tại, DB timeout.
- **Stream dữ liệu lớn:** xử lý theo từng phần thay vì nạp hết vào bộ nhớ, tránh nghẽn event loop.
:::

## 1. Callbacks

Cách cổ điển nhất:

```js
const fs = require('fs');

fs.readFile('data.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Lỗi:', err.message);
    return;
  }
  console.log(data);
});
```

### Callback Hell

```js
// Tránh lồng callback quá sâu
getUser(id, (err, user) => {
  getOrders(user.id, (err, orders) => {
    getOrderDetails(orders[0].id, (err, details) => {
      // Callback hell — khó đọc, khó maintain
    });
  });
});
```

## 2. Promises

```js
const fsPromises = require('fs/promises');

fsPromises.readFile('data.txt', 'utf8')
  .then(data => {
    console.log(data);
    return fsPromises.readFile('other.txt', 'utf8');
  })
  .then(otherData => {
    console.log(otherData);
  })
  .catch(err => {
    console.error('Lỗi:', err.message);
  });
```

### Tạo Promise

```js
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchData(url) {
  return new Promise((resolve, reject) => {
    // Nếu thành công
    resolve({ data: 'result' });
    // Nếu lỗi
    reject(new Error('Network error'));
  });
}
```

## 3. Async/Await

Cú pháp hiện đại, dễ đọc nhất:

```js
const fsPromises = require('fs/promises');

async function processFiles() {
  try {
    const data = await fsPromises.readFile('data.txt', 'utf8');
    const parsed = JSON.parse(data);

    await fsPromises.writeFile('output.json', JSON.stringify(parsed, null, 2));
    console.log('Xử lý xong!');
  } catch (err) {
    console.error('Lỗi:', err.message);
  }
}

processFiles();
```

## Xử lý song song

### `Promise.all` — Tất cả phải thành công

```js
async function fetchAllData() {
  const [users, products, orders] = await Promise.all([
    fetch('/api/users').then(r => r.json()),
    fetch('/api/products').then(r => r.json()),
    fetch('/api/orders').then(r => r.json()),
  ]);

  return { users, products, orders };
}
```

### `Promise.allSettled` — Cho phép một số thất bại

```js
const results = await Promise.allSettled([
  fetch('/api/service-a'),
  fetch('/api/service-b'),
  fetch('/api/service-c'),
]);

results.forEach(result => {
  if (result.status === 'fulfilled') {
    console.log('OK:', result.value);
  } else {
    console.log('Lỗi:', result.reason);
  }
});
```

## Error Handling Best Practices

```js
// Luôn wrap async code trong try/catch
async function main() {
  try {
    const result = await riskyOperation();
    return result;
  } catch (err) {
    // Log chi tiết để debug
    console.error(`[${new Date().toISOString()}] Error:`, err.message);
    throw err; // Re-throw nếu cần
  }
}

// Unhandled rejection handler (safety net)
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});
```

## Tóm tắt

- Callbacks → Promises → Async/Await (tiến hoá)
- Luôn dùng **async/await** cho code mới
- `Promise.all` cho xử lý song song
- Luôn có `try/catch` trong async functions
- Set up `unhandledRejection` handler
