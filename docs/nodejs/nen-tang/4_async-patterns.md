---
sidebar_position: 4
title: "4. Async Patterns"
---

# Async Patterns trong Node.js

Node.js là non-blocking, nên xử lý bất đồng bộ là kỹ năng cốt lõi.

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
