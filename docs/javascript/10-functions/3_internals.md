---
sidebar_position: 3
title: "3. Function Internals: arguments, Stack"
---

# Function Internals: arguments, Stack

---

## Mục lục

- [arguments object](#arguments-object)
- [Call Stack](#call-stack)
- [Stack Overflow](#stack-overflow)
- [Built-in Functions thường dùng](#built-in-functions-thường-dùng)

---

## arguments object

`arguments` là **array-like** chứa mọi argument truyền vào function:

```js
function show() {
  console.log(arguments.length); // số argument
  console.log(arguments[0]);     // argument đầu
}

show("a", "b", "c"); // 3, "a"
```

`arguments` **không phải array** — không có `map`, `filter`, `forEach`:

```js
function sum() {
  return arguments.reduce((a, b) => a + b, 0); // TypeError
}

// Convert sang array
function sum() {
  return Array.from(arguments).reduce((a, b) => a + b, 0);
}

// Hoặc spread
function sum() {
  return [...arguments].reduce((a, b) => a + b, 0);
}
```

:::warning[Cần lưu ý]

`arguments` **không tồn tại trong arrow function**:

```js
const fn = () => {
  console.log(arguments); // ReferenceError trong strict mode
                          // hoặc lấy của outer scope
};
```

**Khuyên: thay `arguments` bằng rest parameter**:

```js
// Cũ
function sum() {
  return [...arguments].reduce((a, b) => a + b, 0);
}

// Mới
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}
```

Rest:
- Là Array thật.
- Hoạt động trong arrow.
- Rõ ý đồ (tên có nghĩa).

:::

---

## Call Stack

**Call Stack** = ngăn xếp các function đang chạy. Khi gọi function, một
**stack frame** được push; khi return, frame bị pop.

```js
function third() {
  console.log("third");
}

function second() {
  third();
}

function first() {
  second();
}

first();
```

Stack tại thời điểm `console.log` chạy:

```
| third  |  ← top
| second |
| first  |
| <main> |  ← bottom
```

Khi crash, **stack trace** liệt kê chuỗi gọi này — đọc từ trên xuống là
biết hàm nào gọi hàm nào:

```
Error: oops
    at third (file.js:2)
    at second (file.js:6)
    at first (file.js:10)
    at file.js:13
```

:::info[Phân tích]

**JS là single-threaded** — chỉ có **1 call stack** chính. Khi nó busy,
mọi thứ khác (event, callback, render) phải đợi.

Đó là lý do code blocking gây "freeze" trình duyệt:

```js
function blockUI() {
  const end = Date.now() + 3000;
  while (Date.now() < end) {}
  // 3 giây trình duyệt không phản hồi
}
```

Để tránh block: dùng **async**, **setTimeout**, **Web Worker**:

```js
// Defer phần việc nặng
setTimeout(heavyTask, 0); // chạy sau khi browser nghỉ một nhịp

// Worker thread thật
const worker = new Worker("worker.js");
worker.postMessage(data);
```

Trong Node.js, tương tự: code đồng bộ block toàn bộ event loop. Dùng
`worker_threads` cho CPU-bound, `async I/O` cho I/O-bound.

:::

---

## Stack Overflow

Mỗi engine có **giới hạn độ sâu** của call stack (~10k-50k frame). Vượt
quá → `RangeError: Maximum call stack size exceeded`.

```js
function recurse() {
  return recurse(); // không có điều kiện dừng
}

recurse(); // RangeError
```

Thường gặp khi:

- Đệ quy thiếu base case.
- Đệ quy quá sâu trên dữ liệu lớn (cây deep nested).
- Vòng tròn function gọi nhau.

:::tip[Mẹo]

**Iterative thay cho recursive** với cấu trúc lớn:

```js
// Đệ quy — stack overflow với cây sâu
function depth(node) {
  if (!node) return 0;
  return 1 + Math.max(depth(node.left), depth(node.right));
}

// Lặp — dùng stack thủ công
function depth(root) {
  const stack = [[root, 0]];
  let max = 0;
  while (stack.length) {
    const [node, d] = stack.pop();
    if (!node) continue;
    max = Math.max(max, d);
    stack.push([node.left, d + 1]);
    stack.push([node.right, d + 1]);
  }
  return max;
}
```

JS **không có tail-call optimization** trong các engine phổ biến (Safari
có, V8/Firefox không). Đừng dựa vào TCO — viết iterative khi cần.

:::

---

## Built-in Functions thường dùng

```js
// Type conversion
Number(x)
String(x)
Boolean(x)
parseInt(x, 10)
parseFloat(x)

// Number checks
isNaN(x)
isFinite(x)
Number.isInteger(x)
Number.isSafeInteger(x)

// Encoding
encodeURIComponent("hello world") // "hello%20world"
decodeURIComponent("hello%20world")
btoa("hello")  // base64 encode (browser)
atob("aGVsbG8=") // base64 decode (browser)

// Timer
setTimeout(fn, ms)
setInterval(fn, ms)
clearTimeout(id)
clearInterval(id)
queueMicrotask(fn)
requestAnimationFrame(fn) // browser

// Iteration
Array.from(iterable)
Array.isArray(x)
Object.keys(o), Object.values(o), Object.entries(o)
Object.fromEntries(pairs)
Object.assign(target, ...sources)

// Structured clone (Node 17+, browsers)
structuredClone(obj)
```

:::warning[Cần lưu ý]

**`isNaN`** vs **`Number.isNaN`**:

```js
isNaN("hello");          // true — vì String → NaN
isNaN(undefined);        // true

Number.isNaN("hello");   // false — chỉ true với giá trị NaN thật
Number.isNaN(NaN);       // true
Number.isNaN(undefined); // false
```

Tương tự `isFinite` vs `Number.isFinite`. **Luôn dùng phiên bản
`Number.*`** — chính xác hơn và không coerce.

:::
