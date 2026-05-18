---
sidebar_position: 3
title: "3. setTimeout & setInterval"
---

# `setTimeout` & `setInterval`

---

## Mục lục

- [setTimeout — Hẹn giờ một lần](#settimeout--hẹn-giờ-một-lần)
- [setInterval — Lặp lại định kì](#setinterval--lặp-lại-định-kì)
- [Truyền tham số cho callback](#truyền-tham-số-cho-callback)
- [`this` trong callback](#this-trong-callback)
- [Pitfall thường gặp](#pitfall-thường-gặp)
- [setTimeout 0 — không phải "ngay"](#settimeout-0--không-phải-ngay)
- [Promise-based timer](#promise-based-timer)
- [Trong Node.js — bonus APIs](#trong-nodejs--bonus-apis)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## setTimeout — Hẹn giờ một lần

`setTimeout(callback, delay)` thực thi callback **một lần** sau `delay` ms:

```js
setTimeout(() => {
  console.log("Sau 2 giây");
}, 2000);

console.log("Ngay lập tức");

// Output:
// Ngay lập tức
// Sau 2 giây  (~2s sau)
```

### Trả về timer ID

```js
const timerId = setTimeout(() => {
  console.log("Sẽ chạy");
}, 5000);

// Huỷ trước khi chạy
clearTimeout(timerId);
// → Callback không bao giờ chạy
```

### Use case

```js
// 1. Debounce — chờ user gõ xong
let debounceTimer;
function search(query) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchResults(query);
  }, 300);
}

// 2. Delay animation
button.addEventListener("click", () => {
  button.classList.add("loading");
  setTimeout(() => {
    button.classList.remove("loading");
  }, 1000);
});

// 3. Trì hoãn để DOM render
setTimeout(() => {
  element.focus();   // sau khi browser render xong
}, 0);
```

## setInterval — Lặp lại định kì

`setInterval(callback, delay)` chạy callback **lặp đi lặp lại** mỗi `delay` ms:

```js
let count = 0;
const intervalId = setInterval(() => {
  count++;
  console.log(count);
  if (count >= 5) {
    clearInterval(intervalId);
  }
}, 1000);

// 1 (sau 1s)
// 2 (sau 2s)
// ...
// 5 (sau 5s, dừng)
```

### Use case

```js
// 1. Đồng hồ
setInterval(() => {
  document.getElementById("clock").textContent = new Date().toLocaleTimeString();
}, 1000);

// 2. Auto-refresh dữ liệu
const refreshTimer = setInterval(async () => {
  const data = await fetch("/api/status").then(r => r.json());
  updateUI(data);
}, 5000);

// 3. Animation đơn giản
let angle = 0;
setInterval(() => {
  angle = (angle + 1) % 360;
  element.style.transform = `rotate(${angle}deg)`;
}, 16);  // ~60 FPS
```

### Vấn đề với setInterval

```js
// Callback chạy chậm hơn interval → chồng chéo
setInterval(async () => {
  await heavyTask();   // mất 2 giây
}, 1000);
// ⚠️ Sau 1s, callback đầu chưa xong, callback thứ 2 đã được queue
```

### Thay thế bằng setTimeout đệ quy

```js
// ✅ Đảm bảo có khoảng nghỉ thật giữa các lần chạy
async function loop() {
  await heavyTask();
  setTimeout(loop, 1000);
}
loop();
```

So sánh:

| | `setInterval` | `setTimeout` đệ quy |
|---|--------------|---------------------|
| Khoảng nghỉ | Cố định | Sau khi xong + delay |
| Chồng chéo | Có thể | Không |
| Linh hoạt delay | Cố định | Có thể đổi mỗi lần |
| Phổ biến hơn | Lịch sử | ✅ Khuyến nghị |

## Truyền tham số cho callback

### Cách 1: Tham số thứ 3+ (ES6+)

```js
setTimeout((a, b) => {
  console.log(a + b);
}, 1000, 10, 20);
// In ra 30 sau 1s
```

### Cách 2: Arrow + closure (rõ hơn)

```js
const x = 10, y = 20;
setTimeout(() => {
  console.log(x + y);
}, 1000);
```

### Cách 3: Bind

```js
setTimeout(function(a, b) {
  console.log(a + b);
}.bind(null, 10, 20), 1000);
```

## `this` trong callback

### `setTimeout` với arrow — giữ `this`

```js
class Timer {
  constructor() {
    this.value = 42;
  }
  
  start() {
    setTimeout(() => {
      console.log(this.value);   // 42 ✅
    }, 1000);
  }
}

new Timer().start();
```

### `setTimeout` với function thường — mất `this`

```js
class Timer {
  start() {
    setTimeout(function() {
      console.log(this);   // undefined (strict) hoặc window
    }, 1000);
  }
}

// Fix với .bind:
setTimeout(function() {
  console.log(this);   // Timer instance
}.bind(this), 1000);
```

## Pitfall thường gặp

### 1. `setInterval` không pause khi tab inactive

```js
setInterval(() => console.log("tick"), 1000);
// Khi tab background, browser giảm tần số (~1 lần/giây hoặc lâu hơn)
// → Đếm sai!
```

Dùng `Date.now()` cho time-based logic:

```js
const startTime = Date.now();
const interval = setInterval(() => {
  const elapsed = (Date.now() - startTime) / 1000;
  console.log(`Đã trôi ${elapsed.toFixed(0)}s`);
}, 1000);
```

### 2. Memory leak khi không clear

```js
// ❌ Quên clear khi component unmount
class Widget {
  mount() {
    this.timer = setInterval(() => this.update(), 1000);
  }
  // Không có unmount → leak
}

// ✅
class Widget {
  mount() {
    this.timer = setInterval(() => this.update(), 1000);
  }
  unmount() {
    clearInterval(this.timer);
  }
}
```

### 3. React — quên cleanup

```jsx
// ❌
useEffect(() => {
  setInterval(() => setCount(c => c + 1), 1000);
}, []);   // setInterval không bao giờ clear!

// ✅
useEffect(() => {
  const timer = setInterval(() => setCount(c => c + 1), 1000);
  return () => clearInterval(timer);
}, []);
```

### 4. Drift trong setInterval

```js
let count = 0;
setInterval(() => {
  count++;
  console.log(`${count}s`);   // có thể bị drift
}, 1000);
// Sau 60 lần, thực tế đã > 60s (drift)
```

## setTimeout 0 — không phải "ngay"

```js
console.log("1");
setTimeout(() => console.log("2"), 0);
console.log("3");

// Output: 1, 3, 2
```

### Vì sao?

1. `setTimeout(fn, 0)` đi qua **macrotask queue**
2. Code đồng bộ và microtask chạy xong **trước**
3. Browser **clamp** delay tối thiểu ~4ms (sau ~5 lần lồng)

### Thay thế hiện đại

```js
// "Ngay sau" sync — dùng queueMicrotask
queueMicrotask(() => console.log("microtask"));

// Hoặc Promise
Promise.resolve().then(() => console.log("via promise"));

// "Trước paint" — animation
requestAnimationFrame(() => console.log("before paint"));

// "Khi idle"
requestIdleCallback(() => console.log("when idle"));
```

## Promise-based timer

setTimeout/setInterval là callback-based — có thể wrap thành Promise:

```js
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function demo() {
  console.log("Bắt đầu");
  await sleep(1000);
  console.log("Sau 1s");
  await sleep(2000);
  console.log("Sau 3s tổng");
}

demo();
```

### Trong Node.js có sẵn

```js
import { setTimeout as sleep } from "timers/promises";

await sleep(1000);
console.log("done");
```

## Trong Node.js — bonus APIs

### `setImmediate(callback)`

Chạy callback sau **I/O phase** trong Event Loop:

```js
setImmediate(() => console.log("immediate"));
setTimeout(() => console.log("timeout"), 0);

// Thứ tự không đảm bảo (tùy môi trường)
// Trong I/O callback, setImmediate luôn chạy trước setTimeout
```

### `process.nextTick(callback)`

Chạy **ngay sau** operation hiện tại — trước cả Promise:

```js
process.nextTick(() => console.log("nextTick"));
Promise.resolve().then(() => console.log("promise"));

// Output:
// nextTick
// promise
```

⚠️ `process.nextTick` đệ quy có thể **block** I/O — cẩn thận.

---

## Câu hỏi phỏng vấn

### Câu 1: setTimeout có guarantee chính xác thời gian không?

**Đáp án:**

**Không** — `setTimeout` chỉ đảm bảo callback chạy **sau ít nhất** `delay` ms, không phải **đúng** lúc đó.

Lý do:
1. Callback phải vào **macrotask queue** — chờ event loop
2. Nếu thread bị block (loop dài, sync work), callback bị trì hoãn
3. Browser **clamp** delay tối thiểu (~4ms sau lồng nhiều lần)
4. Tab background → tần số giảm

Để chính xác hơn, dùng `requestAnimationFrame` (animation) hoặc tính thời gian thực bằng `Date.now()`.

### Câu 2: setInterval vs setTimeout đệ quy?

**Đáp án:**

- **`setInterval(fn, 1000)`** — fn chạy mỗi giây, **không quan tâm** fn chạy mất bao lâu → có thể chồng chéo.
- **`setTimeout(fn, 1000)` đệ quy** — sau khi fn xong, đợi 1s rồi chạy tiếp → đảm bảo có khoảng nghỉ thật.

```js
// ❌ setInterval khi fn chậm
setInterval(async () => {
  await heavyTask();   // 2 giây
}, 1000);   // chồng chéo

// ✅ setTimeout đệ quy
async function loop() {
  await heavyTask();
  setTimeout(loop, 1000);
}
loop();
```

### Câu 3: Đoán kết quả

```js
console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => {
  console.log("3");
  setTimeout(() => console.log("4"), 0);
});

queueMicrotask(() => console.log("5"));

console.log("6");
```

**Đáp án:**

```
1
6
3
5
2
4
```

1. Sync: `1`, `6`
2. Microtask: `3` (tạo macrotask "4"), `5`
3. Macrotask: `2`
4. Macrotask: `4`

### Câu 4: Cách "đợi 1 giây" trong async function?

**Đáp án:**

```js
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function demo() {
  console.log("start");
  await sleep(1000);
  console.log("after 1s");
}
```

Hoặc trong Node 16+:

```js
import { setTimeout } from "node:timers/promises";

await setTimeout(1000);
```

Lưu ý: **không có** `Promise.sleep` hoặc `await 1000` built-in trong spec — phải tự wrap.
