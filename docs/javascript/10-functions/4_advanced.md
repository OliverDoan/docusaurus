---
sidebar_position: 4
title: "4. Recursion, Lexical Scope, Closures"
---

# Recursion, Lexical Scope, Closures

---

## Mục lục

- [Recursion (Đệ quy)](#recursion-đệ-quy)
- [Lexical Scope](#lexical-scope)
- [Closures](#closures)
- [Use cases của Closure](#use-cases-của-closure)
- [Closure pitfalls](#closure-pitfalls)

---

## Recursion (Đệ quy)

Function **gọi lại chính nó** với input nhỏ dần đến base case.

```js
function factorial(n) {
  if (n <= 1) return 1;       // base case
  return n * factorial(n - 1); // recursive case
}

factorial(5); // 120
```

Cấu trúc đệ quy:

1. **Base case** — điều kiện dừng (bắt buộc).
2. **Recursive case** — gọi chính nó với input nhỏ hơn.

Ví dụ duyệt cây:

```js
function sumTree(node) {
  if (!node) return 0;
  return node.value + sumTree(node.left) + sumTree(node.right);
}
```

---

## Lexical Scope

**Lexical** = "theo cú pháp" — scope của biến được xác định **tại nơi
viết code**, không phải tại nơi gọi.

```js
const x = "outer";

function outer() {
  const x = "inner outer";

  function inner() {
    console.log(x); // tìm trong scope viết code
  }

  return inner;
}

const fn = outer();
fn(); // "inner outer" — không phải "outer"
```

Khi `inner` được viết bên trong `outer`, nó **vĩnh viễn** truy cập được
biến của `outer`, dù `outer` đã return.

---

## Closures

**Closure** = function **giữ tham chiếu** đến biến của scope ngoài, kể
cả khi scope đó đã kết thúc.

```js
function makeCounter() {
  let count = 0;

  return function () {
    count++;
    return count;
  };
}

const counter = makeCounter();
counter(); // 1
counter(); // 2
counter(); // 3
```

Khi `makeCounter` chạy xong, biến `count` **đáng lẽ bị GC**. Nhưng vì
function trả về vẫn tham chiếu `count`, nó được **giữ sống** trong
closure.

Mỗi lần gọi `makeCounter` tạo một closure mới:

```js
const a = makeCounter();
const b = makeCounter();
a(); // 1
a(); // 2
b(); // 1 — độc lập với a
```

:::info[Phân tích]

**Closure là khái niệm trung tâm của JS**. Mọi function tạo trong JS
thực ra đều là closure — chỉ là có hoặc không truy cập biến outer.

Mechanism kỹ thuật:

1. Mỗi function khi gọi tạo một **Lexical Environment** chứa biến local.
2. Function tham chiếu đến environment của scope cha (lexical link).
3. Khi function chứa được giữ ở đâu đó (callback, return value, event
   listener), environment cha không bị GC.

**Câu hỏi phỏng vấn kinh điển:**

```js
function createFunctions() {
  const fns = [];
  for (var i = 0; i < 3; i++) {
    fns.push(function () { return i; });
  }
  return fns;
}

const [a, b, c] = createFunctions();
a(); // 3
b(); // 3
c(); // 3 — vì var i được share, đã là 3 khi return
```

Đổi `var` thành `let`:

```js
for (let i = 0; i < 3; i++) {
  fns.push(function () { return i; });
}
// Kết quả: 0, 1, 2 — mỗi iteration tạo binding i mới
```

Hiểu được cơ chế "binding mới mỗi iteration của `for (let)`" là nắm
chắc closure + scope.

:::

---

## Use cases của Closure

**1. Private state** — biến không truy cập từ ngoài:

```js
function createAccount(initial) {
  let balance = initial;

  return {
    deposit(n) { balance += n; },
    withdraw(n) { balance -= n; },
    getBalance() { return balance; },
  };
}

const acc = createAccount(100);
acc.deposit(50);
acc.getBalance(); // 150
acc.balance;      // undefined — không truy cập được trực tiếp
```

**2. Memoization** — cache kết quả:

```js
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

const slowFib = (n) => n < 2 ? n : slowFib(n - 1) + slowFib(n - 2);
const fastFib = memoize(slowFib);
```

**3. Currying** — chia argument thành nhiều bước:

```js
const add = (a) => (b) => (c) => a + b + c;
add(1)(2)(3); // 6

const greet = (greeting) => (name) => `${greeting}, ${name}!`;
const hi = greet("Hi");
hi("An");    // "Hi, An!"
hi("Bình");  // "Hi, Bình!"
```

**4. Event handler giữ context**:

```js
function setupButton(id, label) {
  document.getElementById(id).addEventListener("click", () => {
    console.log(`Clicked ${label}`); // label được closure giữ
  });
}
```

**5. React hooks** — `useState`, `useEffect` đều dựa trên closure để
giữ state giữa các render.

---

## Closure pitfalls

:::warning[Cần lưu ý]

**Memory leak** — closure giữ biến to:

```js
function setup() {
  const hugeData = new Array(1000000).fill(0);

  document.getElementById("btn").addEventListener("click", () => {
    console.log("clicked"); // không dùng hugeData
    // nhưng closure vẫn giữ tham chiếu → hugeData không được GC
  });
}
```

Engine có thể **không tối ưu** — khó biết closure dùng biến nào. Cách
phòng:

```js
function setup() {
  let hugeData = new Array(1000000).fill(0);
  processInitial(hugeData);
  hugeData = null; // giải phóng tham chiếu

  document.getElementById("btn").addEventListener("click", () => {
    console.log("clicked");
  });
}
```

**Stale closure** trong React — capture state cũ:

```js
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(count + 1); // count = 0 mãi mãi
    }, 1000);
    return () => clearInterval(timer);
  }, []); // deps rỗng → closure capture count = 0
}

// Fix: dùng updater function
setCount(c => c + 1);
```

Đây là pitfall **rất phổ biến** trong React hooks — nguồn của nhiều bug
khó debug.

:::

:::tip[Mẹo]

**Đọc closure như đọc tree** — từ function trong cùng, ngược lên outer
scope, đến global. Mỗi biến truy cập, hỏi: "Biến này được khai báo ở
đâu? Có nằm trong scope chain của function này không?"

Pattern hay dùng trong phỏng vấn:

```js
// Implement throttle dùng closure
function throttle(fn, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return fn(...args);
    }
  };
}

// Implement once
function once(fn) {
  let called = false;
  let result;
  return function (...args) {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
}
```

Closure giữ `lastCall`/`called` qua các lần gọi — không cần biến global.

:::
