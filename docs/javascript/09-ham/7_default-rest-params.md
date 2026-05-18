---
sidebar_position: 7
title: "7. Default & Rest Parameters"
---

# Default & Rest Parameters

---

## Mục lục

- [Default Parameters](#default-parameters)
- [Rest Parameters](#rest-parameters)
- [`arguments` object — cũ](#arguments-object--cũ)
- [Default + Rest + Destructuring](#default--rest--destructuring)
- [TDZ với default params](#tdz-với-default-params)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Default Parameters

ES6 cho phép gán **giá trị mặc định** cho tham số khi không truyền hoặc truyền `undefined`:

```js
function greet(name = "Guest", greeting = "Hello") {
  console.log(`${greeting}, ${name}!`);
}

greet();                    // Hello, Guest!
greet("Alice");             // Hello, Alice!
greet("Bob", "Hi");         // Hi, Bob!
greet(undefined, "Hey");    // Hey, Guest!  ← chỉ fallback khi undefined
greet(null);                // Hello, null! ← KHÔNG fallback (null khác undefined)
```

### Tính toán default

Default value được **tính khi gọi** — có thể dùng biểu thức:

```js
function log(message, time = new Date().toISOString()) {
  console.log(`[${time}] ${message}`);
}

log("Started");
// [2026-05-18T07:30:00.000Z] Started
```

### Default dùng tham số trước đó

```js
function rectangle(width, height = width) {
  return width * height;
}

rectangle(5);     // 25 (vuông)
rectangle(5, 10); // 50
```

### Default từ function call

```js
function getDefault() {
  return Math.random();
}

function test(x = getDefault()) {
  return x;
}

test();    // số random
test(5);   // 5 (không gọi getDefault)
```

### So với cách cũ

```js
// ❌ ES5
function greet(name) {
  name = name || "Guest";   // ⚠️ fallback cả khi "" hoặc 0
  console.log("Hi, " + name);
}

greet("");     // "Hi, Guest" ⚠️ (lẽ ra phải "Hi, ")

// ✅ ES6
function greet(name = "Guest") {
  console.log(`Hi, ${name}`);
}

greet("");     // "Hi, "  (giữ chuỗi rỗng — chỉ undefined fallback)
```

## Rest Parameters

Cú pháp `...rest` thu thập **các tham số còn lại** thành một **mảng thực sự**:

```js
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}

sum(1, 2, 3);          // 6
sum(1, 2, 3, 4, 5);    // 15
sum();                  // 0
```

### Phải là **tham số cuối cùng**

```js
// ✅ OK
function foo(a, b, ...rest) {}

// ❌ SyntaxError
function bar(...rest, a) {}
function baz(...rest1, ...rest2) {}
```

### Khác `arguments`

```js
function rest(...args) {
  console.log(Array.isArray(args));   // true ✅
  console.log(args.map(x => x * 2));  // hoạt động
}

function classic() {
  console.log(Array.isArray(arguments));  // false ⚠️
  console.log(arguments.map);             // undefined ⚠️
}
```

### Kết hợp với tham số bình thường

```js
function intro(name, age, ...hobbies) {
  console.log(name, age, hobbies);
}

intro("Alice", 30, "reading", "music", "code");
// Alice 30 ["reading", "music", "code"]
```

### Rest với destructuring

```js
function process([first, ...rest]) {
  console.log(first);  // phần tử đầu
  console.log(rest);   // mảng còn lại
}

process([1, 2, 3, 4]);
// 1
// [2, 3, 4]

function userInfo({ name, ...details }) {
  console.log(name);
  console.log(details);
}

userInfo({ name: "Alice", age: 30, city: "Hà Nội" });
// Alice
// { age: 30, city: "Hà Nội" }
```

## `arguments` object — cũ

`arguments` là biến tự động trong **function thường** (không phải arrow), chứa tất cả argument đã truyền:

```js
function test() {
  console.log(arguments);          // Arguments-like object
  console.log(arguments.length);   // số argument
  console.log(arguments[0]);       // argument đầu tiên
}

test(1, 2, 3);
```

### Hạn chế của `arguments`

```js
function test() {
  // 1. KHÔNG phải mảng thực sự
  arguments.map(x => x * 2);   // ❌ TypeError
  arguments.forEach(...);       // ❌ TypeError
  
  // Phải convert:
  Array.from(arguments).map(...);   // ✅
  [...arguments].map(...);          // ✅
  
  // 2. KHÔNG tồn tại trong arrow function
  const arrow = () => {
    console.log(arguments);   // ❌ ReferenceError (hoặc lấy từ scope ngoài)
  };
  arrow();
}

// 3. Có thể bị thay đổi (gây bug)
function bad(a, b) {
  arguments[0] = 99;
  console.log(a);   // 99 ⚠️ (trong non-strict mode)
}
```

### Khi nào dùng arguments vs rest?

| | `arguments` | `...rest` |
|---|------------|-----------|
| Là mảng? | ❌ (array-like) | ✅ |
| Hoạt động trong arrow? | ❌ | ✅ |
| Hỗ trợ destructuring | ❌ | ✅ |
| Modern code | Tránh | Khuyến nghị |

**Khuyến nghị:** dùng `...rest` cho code mới.

## Default + Rest + Destructuring

Kết hợp cả ba cho API mạnh mẽ:

```js
function createUser({
  name = "Anonymous",
  age = 18,
  ...extras
} = {}) {
  return { name, age, ...extras };
}

createUser();
// { name: "Anonymous", age: 18 }

createUser({ name: "Alice", age: 30, city: "Hà Nội", job: "Dev" });
// { name: "Alice", age: 30, city: "Hà Nội", job: "Dev" }
```

### Pattern thực tế: API wrapper

```js
async function fetchAPI(url, {
  method = "GET",
  headers = {},
  body,
  timeout = 5000,
  ...options
} = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  
  try {
    return await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", ...headers },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      ...options
    });
  } finally {
    clearTimeout(timer);
  }
}

// Sử dụng đơn giản
await fetchAPI("/users");

// Hoặc tuỳ biến
await fetchAPI("/users", {
  method: "POST",
  body: { name: "Alice" },
  timeout: 10000,
  credentials: "include"   // vào ...options
});
```

## TDZ với default params

Default params hoạt động trong scope riêng — có **TDZ giữa các tham số**:

```js
// ❌ a chưa khai báo khi b tham chiếu
function test(b = a, a = 1) {
  return [a, b];
}
test();  // ❌ ReferenceError

// ✅ a có default trước, b dùng a
function test(a = 1, b = a) {
  return [a, b];
}
test();  // [1, 1]

// ✅ Bỏ qua a, dùng tham số đã truyền
test(undefined, 5);  // [1, 5]
test(2);              // [2, 2]
```

### Default không thấy biến ngoài cùng scope

```js
const x = 10;

function test(a = x) {   // ✅ thấy biến outer
  return a;
}

function test2(a = x) {
  const x = 20;          // không ảnh hưởng default
  return a;
}

test();    // 10
test2();   // 10 (vẫn dùng x outer)
```

---

## Câu hỏi phỏng vấn

### Câu 1: Default param và `||` khác nhau như thế nào?

**Đáp án:**

```js
// || fallback khi falsy (0, "", false, null, undefined, NaN)
function a(name) {
  name = name || "Guest";
}
a("");    // "Guest" ⚠️

// Default param chỉ fallback khi undefined
function b(name = "Guest") { /* ... */ }
b("");    // ""        (giữ chuỗi rỗng)
b(null);  // null      (giữ null)
b(0);     // 0         (giữ 0)
```

Default param **rõ ràng và chính xác** hơn `||` — chỉ fallback khi tham số "không được truyền".

### Câu 2: Đoán kết quả

```js
function test(a, b = 10, ...rest) {
  return [a, b, rest];
}

console.log(test(1));
console.log(test(1, 2));
console.log(test(1, 2, 3, 4, 5));
console.log(test(1, undefined, 3));
```

**Đáp án:**

```
[1, 10, []]
[1, 2, []]
[1, 2, [3, 4, 5]]
[1, 10, [3]]
```

### Câu 3: Rest và Spread khác nhau như thế nào?

**Đáp án:**

Cùng cú pháp `...` nhưng dùng khác chỗ:

```js
// Rest: GOM tham số → mảng (trong định nghĩa function/destructuring)
function sum(...nums) { }      // gom args thành nums[]
const [head, ...tail] = arr;   // gom phần còn lại
const { name, ...rest } = obj; // gom property còn lại

// Spread: TÁCH mảng/object thành phần tử (khi gọi/khởi tạo)
sum(...nums);                  // tách nums[] thành args
const arr2 = [...arr1, 5];     // tách arr1 vào arr2
const obj2 = { ...obj1, age: 30 };
```

### Câu 4: Vì sao rest phải là tham số cuối?

**Đáp án:**

Rest "gom **tất cả** tham số còn lại" — nếu có tham số sau nó, **không có cách nào biết khi nào rest dừng**:

```js
// ❌ Giả sử cho phép:
function foo(...rest, a) {}
foo(1, 2, 3, 4);   // rest = ?, a = ?

// Không thể quyết định:
// rest = [1, 2, 3], a = 4?
// rest = [1, 2], a = 4 (3 đâu)?
// rest = [], a = 1, ngươi không truyền 2, 3, 4?

// → SyntaxError
```

Vì vậy spec quy định: **rest phải là tham số cuối cùng**.
