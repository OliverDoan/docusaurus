---
sidebar_position: 3
title: "3. Strict Equality (===)"
---

# Strict Equality (`===`)

---

## Mục lục

- [`===` là gì?](#-là-gì)
- [Thuật toán Strict Equality](#thuật-toán-strict-equality)
- [So sánh giữa các kiểu primitive](#so-sánh-giữa-các-kiểu-primitive)
- [So sánh object — theo reference](#so-sánh-object--theo-reference)
- [Hai trường hợp đặc biệt](#hai-trường-hợp-đặc-biệt)
- [Best practices](#best-practices)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## `===` là gì?

**Strict equality** (`===`) là toán tử so sánh **không ép kiểu** — nếu hai toán hạng khác kiểu, kết quả **luôn là `false`**.

```js
5 === 5;         // true
"5" === 5;       // false (khác kiểu)
true === 1;      // false
null === undefined; // false
```

> ✅ **Hầu hết style guide đều khuyến nghị dùng `===` mặc định.**

## Thuật toán Strict Equality

Theo spec ECMAScript:

1. Nếu **khác kiểu** → `false`
2. Nếu cùng kiểu:
   - `Number`: so sánh giá trị (trừ `NaN` và `+0/-0`)
   - `String`: so sánh từng ký tự
   - `Boolean`: so sánh trực tiếp
   - `Object`: so sánh tham chiếu
   - `null`: cả hai null → `true`
   - `undefined`: cả hai undefined → `true`
   - `BigInt`: so sánh giá trị toán học
   - `Symbol`: so sánh tham chiếu

## So sánh giữa các kiểu primitive

### Number

```js
1 === 1;             // true
1.5 === 1.5;         // true
1 === 1.0;           // true (cùng giá trị)
1 === 2;             // false
0 === -0;            // true ⚠️
NaN === NaN;         // false ⚠️ (luôn false!)
Infinity === Infinity; // true
```

### String

```js
"hello" === "hello";       // true
"hello" === "Hello";       // false (case-sensitive)
"abc" === "abc";           // true
"" === "";                 // true

// Khác cách viết → cùng giá trị
"a" === 'a';          // true
"😀" === "😀";   // true (UTF-16)
```

### Boolean

```js
true === true;       // true
true === false;      // false
true === 1;          // false (khác kiểu!)
```

### BigInt

```js
1n === 1n;           // true
1n === 1;            // false (khác kiểu)
1n === 1.0;          // false
```

### Symbol

```js
const s = Symbol("a");
s === s;              // true (cùng tham chiếu)
Symbol("a") === Symbol("a");   // false (mỗi symbol unique)
```

## So sánh object — theo reference

`===` cho object so sánh **tham chiếu** (cùng vùng nhớ), KHÔNG so sánh nội dung:

```js
{} === {};            // false (khác object)
[] === [];            // false
[1] === [1];          // false
{ a: 1 } === { a: 1 }; // false

// Cùng reference → true
const obj = { a: 1 };
const ref = obj;
obj === ref;          // true

// Truyền vào hàm
function isSame(a, b) {
  return a === b;
}
isSame(obj, obj);     // true
isSame({}, {});       // false
```

### Function cũng là object

```js
function foo() {}
foo === foo;          // true

function bar() {}
foo === bar;          // false

// Arrow function
const f = () => {};
const g = () => {};
f === g;              // false
```

### Built-in object

```js
new Date() === new Date();   // false (khác instance)

const d = new Date();
d === d;              // true
```

### So sánh array element

```js
const a = { x: 1 };
const arr = [a, { x: 2 }];

arr.indexOf(a);              // 0 (so sánh ===)
arr.indexOf({ x: 1 });       // -1 (khác reference)
arr.includes(a);             // true
arr.includes({ x: 1 });      // false
```

## Hai trường hợp đặc biệt

### 1. `NaN === NaN` là `false`

```js
NaN === NaN;         // false ⚠️
NaN === Number.NaN;  // false

// Cách check NaN:
Number.isNaN(NaN);        // true (KHUYẾN NGHỊ)
isNaN(NaN);               // true (cũ — ép kiểu trước)
Object.is(NaN, NaN);      // true

// Tự dùng tính chất NaN !== NaN:
function isNaNValue(x) {
  return x !== x;
}
isNaNValue(NaN);  // true
```

### 2. `+0 === -0` là `true`

```js
+0 === -0;        // true ⚠️
+0 == -0;         // true
Object.is(+0, -0); // false ⚠️

// Khi nào khác nhau quan trọng?
1 / +0;           // Infinity
1 / -0;           // -Infinity
1 / +0 === 1 / -0; // false (Infinity !== -Infinity)
```

## Best practices

### 1. Mặc định dùng `===`

```js
// ❌
if (status == "active") { /* ... */ }

// ✅
if (status === "active") { /* ... */ }
```

### 2. Check NaN đúng

```js
// ❌ Không hoạt động
if (value === NaN) { /* không bao giờ chạy */ }

// ✅ Cách 1
if (Number.isNaN(value)) { /* ... */ }

// ✅ Cách 2: dùng Object.is
if (Object.is(value, NaN)) { /* ... */ }

// ✅ Cách 3: trick
if (value !== value) { /* chỉ NaN có đặc tính này */ }
```

### 3. So sánh object đúng cách

```js
// ❌ Không so sánh nội dung
const a = { x: 1 };
const b = { x: 1 };
a === b;   // false

// ✅ Dùng so sánh sâu (lodash)
import { isEqual } from "lodash";
isEqual(a, b);   // true

// ✅ Hoặc JSON (hạn chế: không xử lý function, undefined, circular)
JSON.stringify(a) === JSON.stringify(b);   // true cho object đơn giản
```

### 4. ESLint rule

```json
{
  "rules": {
    "eqeqeq": ["error", "always"]
  }
}
```

Tự động báo lỗi khi dùng `==`.

---

## Câu hỏi phỏng vấn

### Câu 1: Vì sao `NaN === NaN` lại false?

**Đáp án:**

Theo chuẩn **IEEE 754** (chuẩn float của hầu hết ngôn ngữ), `NaN` được định nghĩa là "Not a Number" — đại diện cho **bất kỳ giá trị không hợp lệ nào**.

Vì có **vô vàn** kết quả không hợp lệ khác nhau (`0/0`, `√-1`, `parseInt("abc")`...), spec quy định **không có hai `NaN` nào bằng nhau** — kể cả chính nó.

Đây là **đặc tính chuẩn IEEE 754**, JS chỉ tuân theo. Để kiểm tra `NaN`, dùng:

```js
Number.isNaN(x);
Object.is(x, NaN);
x !== x;
```

### Câu 2: Đoán kết quả

```js
console.log([] === []);
console.log("1" === 1);
console.log(null === null);
console.log(null === undefined);
console.log(NaN === NaN);
console.log(+0 === -0);
console.log(1n === 1);
```

**Đáp án:**

```
false      (khác object)
false      (khác kiểu)
true       (null === null)
false      (=== khác kiểu)
false      (NaN không bằng bất kỳ)
true       (=== không phân biệt +/-0)
false      (BigInt khác Number kiểu)
```

### Câu 3: So sánh hai object như thế nào?

**Đáp án:**

JS không có so sánh object theo nội dung built-in. Các cách:

```js
// 1. JSON.stringify (giới hạn)
JSON.stringify(a) === JSON.stringify(b);
// ❌ Không xử lý: function, undefined, Date, Map, Set, circular

// 2. Lodash isEqual (tốt nhất)
import { isEqual } from "lodash";
isEqual(a, b);

// 3. Tự viết deep equal
function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object") return false;
  if (a === null || b === null) return false;
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  
  return keysA.every(key => deepEqual(a[key], b[key]));
}
```

### Câu 4: Khi nào `===` và `==` cho kết quả giống nhau?

**Đáp án:**

Khi **cùng kiểu** — `===` và `==` luôn cho cùng kết quả:

```js
1 == 1;     // true === true
"a" == "a"; // true === true
{} == {};   // false === false
NaN == NaN; // false === false
```

`==` chỉ khác `===` khi **khác kiểu** — lúc đó `==` ép kiểu rồi so sánh, còn `===` trả `false` ngay.
