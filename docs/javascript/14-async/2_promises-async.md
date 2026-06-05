---
sidebar_position: 2
title: "2. Callbacks, Promises, async/await"
---

# Callbacks, Promises, async/await

Đây là ba cách viết code **bất đồng bộ** (xử lý những việc cần chờ, như tải dữ liệu, mà không làm "đứng" chương trình) trong JavaScript. **Callback** (hàm được truyền vào để gọi lại sau khi xong việc) là cách cũ nhất; **Promise** (đối tượng đại diện cho kết quả sẽ có trong tương lai) giúp code gọn và dễ kiểm soát lỗi hơn; còn **async/await** (cú pháp viết code bất đồng bộ trông như đồng bộ) giúp người mới đọc và viết dễ hiểu nhất.

---

## Mục lục

- [Callbacks](#callbacks)
- [Callback Hell](#callback-hell)
- [Promises](#promises)
- [Promise composition](#promise-composition)
- [async / await](#async--await)
- [Best practices](#best-practices)

---

## Callbacks

Callback = function được truyền vào function khác, gọi **sau khi** xong
việc:

```js
function loadUser(id, callback) {
  setTimeout(() => {
    callback(null, { id, name: "An" });
  }, 1000);
}

loadUser(1, (err, user) => {
  if (err) return console.error(err);
  console.log(user);
});
```

**Node-style callback** — quy ước (err, result):

```js
fs.readFile("file.txt", "utf-8", (err, data) => {
  if (err) return console.error(err);
  console.log(data);
});
```

---

## Callback Hell

Khi nhiều async lồng nhau → "pyramid of doom":

```js
loadUser(1, (err, user) => {
  if (err) return handle(err);
  loadOrders(user.id, (err, orders) => {
    if (err) return handle(err);
    loadPayments(orders[0].id, (err, payments) => {
      if (err) return handle(err);
      // ...
    });
  });
});
```

Vấn đề: khó đọc, khó error-handle, dễ lặp code.

Promise + async/await ra đời để giải quyết.

---

## Promises

`Promise` là object đại diện cho **kết quả tương lai** của async op.

3 trạng thái:

- **Pending** — đang chạy.
- **Fulfilled** — thành công (có giá trị).
- **Rejected** — thất bại (có lý do).

```js
const p = new Promise((resolve, reject) => {
  setTimeout(() => {
    if (Math.random() > 0.5) {
      resolve("OK");
    } else {
      reject(new Error("Fail"));
    }
  }, 1000);
});

p.then(value => console.log(value))
 .catch(err => console.error(err))
 .finally(() => console.log("Done"));
```

`.then` trả về promise mới — chain được:

```js
fetch("/api/user/1")
  .then(res => res.json())
  .then(user => fetch(`/api/orders/${user.id}`))
  .then(res => res.json())
  .then(orders => console.log(orders))
  .catch(err => console.error(err));
```

---

## Promise composition

**`Promise.all`** — chờ tất cả; fail-fast nếu có 1 reject:

```js
const [users, posts] = await Promise.all([
  fetch("/users").then(r => r.json()),
  fetch("/posts").then(r => r.json()),
]);
```

**`Promise.allSettled`** — chờ tất cả, không reject:

```js
const results = await Promise.allSettled(promises);
// [{ status: "fulfilled", value }, { status: "rejected", reason }, ...]
```

**`Promise.race`** — lấy promise đầu tiên settle (fulfill hoặc reject):

```js
const result = await Promise.race([
  fetch(url),
  new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000)),
]);
```

**`Promise.any`** — lấy fulfilled đầu tiên; reject nếu tất cả reject
(với `AggregateError`):

```js
const fastest = await Promise.any([
  fetch(server1),
  fetch(server2),
  fetch(server3),
]);
```

:::info[Phân tích]

**4 method composition** so sánh:

| | Resolve khi | Reject khi | Use case |
|--|-------------|-----------|----------|
| `all` | Tất cả fulfilled | **Bất kỳ** reject | Cần tất cả thành công |
| `allSettled` | Tất cả settle | **Không bao giờ** | Cần biết kết quả từng cái |
| `race` | **Bất kỳ** settle | **Bất kỳ** settle (đầu tiên) | Timeout pattern |
| `any` | **Bất kỳ** fulfilled | Tất cả reject | Fallback / fastest wins |

Lựa chọn đúng method ảnh hưởng cách app xử lý lỗi mạng. Vd dashboard:

```js
// Tệ — 1 widget lỗi → cả dashboard lỗi
const data = await Promise.all([
  fetchUser(), fetchStats(), fetchNotifs(),
]);

// Tốt — render được phần thành công
const results = await Promise.allSettled([
  fetchUser(), fetchStats(), fetchNotifs(),
]);

results.forEach((r, i) => {
  if (r.status === "fulfilled") render(i, r.value);
  else renderError(i, r.reason);
});
```

:::

---

## async / await

ES2017 — syntactic sugar cho Promise, viết async như sync:

```js
async function loadUserOrders(userId) {
  try {
    const user = await fetchUser(userId);
    const orders = await fetchOrders(user.id);
    return orders;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
```

`async function` luôn **trả về Promise**:

```js
async function getValue() {
  return 42;
}

getValue(); // Promise<42> — không phải 42
const x = await getValue(); // 42
```

`await` chỉ dùng được:

- Trong `async function`.
- **Top-level** trong ES Module (top-level await, ES2022).

**Top-level await:**

```js
// module.mjs hoặc "type": "module"
const config = await fetch("/config.json").then(r => r.json());
export { config };
```

:::warning[Cần lưu ý]

**`await` trong loop tuần tự — không phải lúc nào cũng đúng:**

```js
// Tuần tự — chậm
for (const id of ids) {
  const user = await fetchUser(id);
  console.log(user);
}

// Song song — nhanh hơn nhiều
const users = await Promise.all(ids.map(id => fetchUser(id)));
```

Trừ khi:

- Cần thứ tự tuyệt đối.
- Cần kết quả của bước trước cho bước sau.
- Bị rate limit (quá nhiều request đồng thời).

Cho rate limit, dùng `p-limit` hoặc tự viết:

```js
import pLimit from "p-limit";

const limit = pLimit(5); // tối đa 5 song song
const users = await Promise.all(
  ids.map(id => limit(() => fetchUser(id)))
);
```

:::

---

## Best practices

**1. Luôn handle error**:

```js
// Tệ — unhandled rejection
loadData();

// Tốt
loadData().catch(handleError);

// Hoặc trong async
async function main() {
  try {
    await loadData();
  } catch (err) {
    handleError(err);
  }
}
```

**2. Đừng "nuốt" reject bằng try empty:**

```js
// Tệ
try {
  await op();
} catch {}

// Tốt — log hoặc rethrow
try {
  await op();
} catch (err) {
  logger.error(err);
}
```

**3. Đừng mix `.then` và `await` trong một function:**

```js
// Tệ — khó đọc
async function load() {
  return fetch(url).then(r => r.json());
}

// Tốt
async function load() {
  const res = await fetch(url);
  return res.json();
}
```

**4. `Promise.withResolvers` (ES2024) — tạo Promise có resolve/reject ngoài:**

```js
const { promise, resolve, reject } = Promise.withResolvers();

setTimeout(() => resolve("OK"), 1000);

await promise; // "OK"
```

Thay thế pattern cũ:

```js
let resolve, reject;
const p = new Promise((r, rj) => { resolve = r; reject = rj; });
```

:::tip[Mẹo]

**Đo thời gian async**:

```js
console.time("fetch");
await fetch(url);
console.timeEnd("fetch"); // fetch: 234.5ms

// Hoặc performance.now
const start = performance.now();
await fetch(url);
console.log(performance.now() - start);
```

`performance.now()` chính xác hơn `Date.now()` (microsecond resolution),
phù hợp đo performance.

:::
