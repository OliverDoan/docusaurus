---
sidebar_position: 2
title: "2. Event Loop"
---

# Event Loop

---

## Mục lục

- [Vì sao JS cần Event Loop?](#vì-sao-js-cần-event-loop)
- [Các thành phần](#các-thành-phần)
- [Cách Event Loop hoạt động](#cách-event-loop-hoạt-động)
- [Microtask vs Macrotask](#microtask-vs-macrotask)
- [Đoán thứ tự thực thi](#đoán-thứ-tự-thực-thi)
- [Pitfall thường gặp](#pitfall-thường-gặp)
- [Trong Node.js](#trong-nodejs)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vì sao JS cần Event Loop?

JavaScript là **single-threaded** — chỉ có **một luồng xử lý duy nhất**. Nhưng JS có thể làm nhiều việc "đồng thời":
- Fetch API
- `setTimeout`, `setInterval`
- DOM events
- Promises

→ Cách JS làm được: **Event Loop** — cho phép "đợi" mà không block thread chính.

> **Ví dụ thực tế:** Hãy tưởng tượng JS như một **đầu bếp duy nhất** trong nhà hàng. Khi cần nướng bánh (10 phút), đầu bếp không đứng đợi — đặt bánh vào lò (delegate cho Web API), tiếp tục làm món khác. Khi lò kêu (callback ready), đầu bếp quay lại lấy bánh.

```js
console.log("1");

setTimeout(() => console.log("2"), 0);

console.log("3");

// Output:
// 1
// 3
// 2  ← setTimeout chạy sau, dù delay = 0
```

## Các thành phần

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│   JavaScript Engine (V8)                               │
│   ┌────────────┐       ┌──────────────┐                │
│   │ Call Stack │       │   Heap       │                │
│   │            │       │ (memory)     │                │
│   └────────────┘       └──────────────┘                │
│                                                        │
└────────────────────────────────────────────────────────┘
              ↓ ↑
┌────────────────────────────────────────────────────────┐
│   Event Loop                                           │
│                                                        │
│   ┌────────────────┐    ┌──────────────────┐           │
│   │ Microtask Queue│    │ Macrotask Queue  │           │
│   │ (Promise, MO)  │    │ (setTimeout, IO) │           │
│   └────────────────┘    └──────────────────┘           │
│                                                        │
└────────────────────────────────────────────────────────┘
              ↑
┌────────────────────────────────────────────────────────┐
│   Web APIs (browser) / C++ APIs (Node)                 │
│   - setTimeout, fetch, DOM events, ...                 │
└────────────────────────────────────────────────────────┘
```

### Thành phần chi tiết

1. **Call Stack** — LIFO stack chứa function đang thực thi
2. **Heap** — nơi lưu object
3. **Web API / C++ API** — môi trường ngoài JS engine (setTimeout, fetch...)
4. **Macrotask Queue** (Task Queue / Callback Queue) — setTimeout, setInterval, I/O, UI rendering
5. **Microtask Queue** — Promise callbacks, queueMicrotask, MutationObserver
6. **Event Loop** — vòng lặp điều phối tất cả

## Cách Event Loop hoạt động

### Thuật toán đơn giản

```
while (true) {
  // 1. Chạy code trên Call Stack đến khi hết
  while (callStack.length > 0) {
    execute(callStack.pop());
  }
  
  // 2. Chạy TẤT CẢ microtask
  while (microtaskQueue.length > 0) {
    execute(microtaskQueue.shift());
  }
  
  // 3. Chạy MỘT macrotask
  if (macrotaskQueue.length > 0) {
    execute(macrotaskQueue.shift());
  }
  
  // 4. Render (nếu cần)
  if (shouldRender) render();
}
```

### Ví dụ thực thi

```js
console.log("1");   // Call stack

setTimeout(() => console.log("2"), 0);   // → Web API → Macrotask Queue

Promise.resolve().then(() => console.log("3"));   // → Microtask Queue

console.log("4");   // Call stack
```

#### Bước 1: Chạy đồng bộ

```
Call Stack: console.log("1")  → in "1"
Call Stack: setTimeout(...)   → delegate, không block
Call Stack: Promise.resolve().then(...) → callback vào microtask queue
Call Stack: console.log("4") → in "4"

Output: 1, 4
Microtask Queue: [() => log("3")]
Macrotask Queue: [() => log("2")]
```

#### Bước 2: Hết stack → chạy microtask

```
Microtask: log("3")  → in "3"

Output: 1, 4, 3
Macrotask Queue: [() => log("2")]
```

#### Bước 3: Chạy 1 macrotask

```
Macrotask: log("2")  → in "2"

Output: 1, 4, 3, 2
```

## Microtask vs Macrotask

### Macrotask (Task)

```js
setTimeout(() => {}, 0);
setInterval(() => {}, 1000);
setImmediate(() => {});       // Node only
requestAnimationFrame(...);   // browser only

// I/O callbacks (Node)
fs.readFile(file, callback);
```

### Microtask

```js
Promise.resolve().then(() => {});
queueMicrotask(() => {});
MutationObserver callbacks    // browser
process.nextTick(() => {});   // Node (đặc biệt)
```

### Khác biệt quan trọng

**Tất cả microtask** chạy hết **trước khi** chạy macrotask tiếp theo:

```js
setTimeout(() => console.log("macro 1"), 0);
setTimeout(() => console.log("macro 2"), 0);

Promise.resolve().then(() => console.log("micro 1"));
Promise.resolve().then(() => console.log("micro 2"));

console.log("sync");

// Output:
// sync
// micro 1     ← tất cả microtask trước
// micro 2
// macro 1     ← rồi mới macrotask
// macro 2
```

### Microtask đệ quy → block macrotask

```js
function recurse() {
  Promise.resolve().then(recurse);   // tạo microtask mới
}
recurse();
// Macrotask (setTimeout) sẽ KHÔNG bao giờ chạy → block UI
```

> Cẩn thận! Promise lồng nhau có thể block UI.

## Đoán thứ tự thực thi

### Ví dụ 1

```js
console.log("A");

setTimeout(() => console.log("B"), 0);

Promise.resolve().then(() => console.log("C"));

console.log("D");
```

**Output:**
```
A
D
C
B
```

### Ví dụ 2 — phức tạp hơn

```js
console.log("1");

setTimeout(() => {
  console.log("2");
  Promise.resolve().then(() => console.log("3"));
}, 0);

Promise.resolve().then(() => {
  console.log("4");
  setTimeout(() => console.log("5"), 0);
});

console.log("6");
```

**Output:**
```
1
6
4
2
3
5
```

**Giải thích:**
1. Sync: `1`, `6`
2. Microtask: `4` → tạo macrotask "5"
3. Macrotask "2": `2` → tạo microtask "3"
4. Microtask "3"
5. Macrotask "5"

### Ví dụ 3 — async/await

```js
async function foo() {
  console.log("1");
  await Promise.resolve();
  console.log("2");
}

foo();
console.log("3");
```

**Output:**
```
1
3
2
```

`await` chia function thành hai phần: phần sau `await` chạy như microtask.

## Pitfall thường gặp

### 1. `setTimeout(fn, 0)` không phải "ngay lập tức"

```js
console.log("1");
setTimeout(() => console.log("2"), 0);
console.log("3");
// 1, 3, 2 — setTimeout đi qua macrotask queue
```

Tối thiểu **4ms** delay trong browser (clamp).

### 2. Promise chain "kéo dài"

```js
console.log("1");

Promise.resolve()
  .then(() => console.log("2"))
  .then(() => console.log("3"))
  .then(() => console.log("4"));

setTimeout(() => console.log("5"), 0);

console.log("6");

// Output: 1, 6, 2, 3, 4, 5
// Tất cả .then() chạy trong 1 lượt microtask
```

### 3. UI freeze khi loop dài

```js
// ❌ Block UI 5 giây
for (let i = 0; i < 1e9; i++) { /* ... */ }

// ✅ Chia nhỏ qua setTimeout
function processChunk(start, end) {
  for (let i = start; i < end; i++) { /* ... */ }
  if (end < 1e9) {
    setTimeout(() => processChunk(end, end + 1e6), 0);
  }
}
processChunk(0, 1e6);
```

## Trong Node.js

Node.js có Event Loop **phức tạp hơn** browser — chia thành **6 phase**:

```
┌──────────────────────────┐
│ 1. Timers (setTimeout)   │
├──────────────────────────┤
│ 2. Pending callbacks     │
├──────────────────────────┤
│ 3. Idle, prepare         │
├──────────────────────────┤
│ 4. Poll (I/O)            │
├──────────────────────────┤
│ 5. Check (setImmediate)  │
├──────────────────────────┤
│ 6. Close callbacks       │
└──────────────────────────┘
```

### `process.nextTick` vs `setImmediate`

```js
console.log("1");
setImmediate(() => console.log("2"));
process.nextTick(() => console.log("3"));
Promise.resolve().then(() => console.log("4"));
console.log("5");

// Output:
// 1
// 5
// 3         ← nextTick chạy NGAY trước cả microtask
// 4         ← Promise microtask
// 2         ← setImmediate (check phase)
```

`process.nextTick` có **ưu tiên cao nhất** — chạy trước cả Promise.

---

## Câu hỏi phỏng vấn

### Câu 1: Event Loop là gì?

**Đáp án:**

Event Loop là **cơ chế điều phối** trong JS, cho phép single-threaded JS xử lý các tác vụ bất đồng bộ (timer, I/O, Promise...):

1. JS chạy code đồng bộ trên Call Stack
2. Khi gặp tác vụ async (setTimeout, fetch...), delegate cho Web API
3. Khi async xong, callback được đẩy vào queue (microtask hoặc macrotask)
4. Khi Call Stack rỗng, Event Loop lấy callback từ queue → push vào Stack
5. Lặp lại

### Câu 2: Microtask và Macrotask khác nhau như thế nào?

**Đáp án:**

| | Microtask | Macrotask |
|---|-----------|-----------|
| Ví dụ | Promise, queueMicrotask | setTimeout, setInterval, I/O |
| Khi nào chạy | **Tất cả** sau mỗi macrotask | **Một** sau khi hết microtask |
| Priority | Cao | Thấp hơn |

Trong mỗi vòng Event Loop:
1. Chạy macrotask
2. Chạy **tất cả** microtask trong queue
3. Render (browser)
4. Chạy macrotask tiếp theo

### Câu 3: Đoán kết quả

```js
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}

async function async2() {
  console.log("async2");
}

console.log("start");

setTimeout(() => console.log("timeout"), 0);

async1();

new Promise(resolve => {
  console.log("promise1");
  resolve();
}).then(() => console.log("promise2"));

console.log("end");
```

**Đáp án:**

```
start
async1 start
async2
promise1
end
async1 end
promise2
timeout
```

### Câu 4: Vì sao `setTimeout(fn, 0)` không chạy ngay?

**Đáp án:**

`setTimeout` luôn đi qua **macrotask queue** — kể cả với delay = 0:

1. Code sync chạy hết
2. Mọi microtask chạy hết
3. **Sau đó** macrotask (setTimeout) mới chạy

Thêm nữa, browser **clamp** delay tối thiểu **~4ms** (sau lần lồng thứ 5) để tránh DoS.

Để chạy "gần nhất" sau microtask, dùng `queueMicrotask`.
