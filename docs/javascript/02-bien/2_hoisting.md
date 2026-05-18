---
sidebar_position: 2
title: "2. Hoisting"
---

# Hoisting (Cẩu biến lên đầu)

---

## Mục lục

- [Hoisting là gì?](#hoisting-là-gì)
- [Hoisting với `var`](#hoisting-với-var)
- [Hoisting với `let` và `const`](#hoisting-với-let-và-const)
- [Hoisting với hàm](#hoisting-với-hàm)
- [Hoisting với class](#hoisting-với-class)
- [Cơ chế thực sự — Execution Context](#cơ-chế-thực-sự--execution-context)
- [Best practices](#best-practices)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Hoisting là gì?

**Hoisting** (cẩu lên) là cơ chế của JavaScript: **khai báo biến và hàm được "kéo lên đầu" scope** trước khi code được thực thi.

> **Ví dụ thực tế:** Hãy tưởng tượng bạn đang đọc một cuốn sách. Trước khi đọc nội dung, ai đó đã **liệt kê sẵn danh sách nhân vật** ở đầu sách — bạn biết có những ai (khai báo) nhưng chưa biết họ làm gì (giá trị) cho đến khi đọc đến chỗ đó.

```js
console.log(x);  // undefined (không lỗi!)
var x = 10;
console.log(x);  // 10

// Tương đương:
var x;            // ← hoisted lên đầu
console.log(x);   // undefined
x = 10;
console.log(x);   // 10
```

> **Lưu ý quan trọng:** Chỉ **khai báo** được hoisted, **giá trị gán** thì không.

## Hoisting với `var`

`var` được hoisted **kèm giá trị `undefined`** — có thể truy cập trước khi khai báo (không lỗi).

```js
console.log(name);  // undefined
var name = "Alice";
console.log(name);  // "Alice"
```

### Vấn đề với `var`

```js
// Truy cập trước khi khai báo → không lỗi nhưng undefined
function example() {
  console.log(x);     // undefined (lẽ ra phải lỗi!)
  if (true) {
    var x = 10;
  }
  console.log(x);     // 10 — var không có block scope
}
example();
```

### Hoisting trong scope của hàm

```js
var x = 1;

function test() {
  console.log(x);  // undefined (KHÔNG phải 1!)
  var x = 2;       // var x được hoisted lên đầu hàm
  console.log(x);  // 2
}

test();
```

Lý do: trong hàm `test`, biến `x` cục bộ được hoisted lên đầu hàm, **shadow** biến `x` toàn cục.

## Hoisting với `let` và `const`

`let` và `const` cũng được hoisted, nhưng **KHÔNG có giá trị** — chúng nằm trong **Temporal Dead Zone (TDZ)** cho đến khi gặp dòng khai báo.

```js
console.log(x);   // ❌ ReferenceError: Cannot access 'x' before initialization
let x = 10;

console.log(y);   // ❌ ReferenceError
const y = 20;
```

### Sự khác biệt giữa "không hoisted" và "TDZ"

```js
// Trường hợp 1: Không hoisted
console.log(notDeclared);  // ❌ ReferenceError: notDeclared is not defined

// Trường hợp 2: TDZ (đã hoisted nhưng chưa khởi tạo)
console.log(x);   // ❌ ReferenceError: Cannot access 'x' before initialization
let x = 10;
```

Cả hai đều ném ReferenceError nhưng **thông điệp khác nhau** — TDZ chứng minh `let/const` thực sự được hoisted, chỉ là không cho phép truy cập.

## Hoisting với hàm

### Function Declaration — hoisted hoàn toàn

```js
sayHi();  // ✅ "Hi!" — không lỗi!

function sayHi() {
  console.log("Hi!");
}
```

Function declaration được hoisted **kèm cả body** — gọi trước khi định nghĩa vẫn được.

### Function Expression — chỉ hoisted khai báo biến

```js
sayHi();  // ❌ TypeError: sayHi is not a function

var sayHi = function() {
  console.log("Hi!");
};

// Tương đương:
var sayHi;          // hoisted, value = undefined
sayHi();            // undefined() → TypeError
sayHi = function() { /* ... */ };
```

### Arrow Function — giống function expression

```js
sayHi();  // ❌ ReferenceError (vì dùng const)

const sayHi = () => console.log("Hi!");
```

### So sánh

| Loại | Hoisted? | Có thể gọi trước? |
|------|----------|-------------------|
| Function declaration | ✅ Cả body | ✅ Có |
| Function expression (var) | Chỉ biến (undefined) | ❌ TypeError |
| Function expression (let/const) | TDZ | ❌ ReferenceError |
| Arrow function | TDZ (nếu dùng let/const) | ❌ ReferenceError |

## Hoisting với class

`class` được hoisted nhưng **trong TDZ** — giống `let/const`:

```js
const dog = new Animal();  // ❌ ReferenceError

class Animal {
  constructor() { this.name = "Animal"; }
}
```

## Cơ chế thực sự — Execution Context

JavaScript engine xử lý code theo **hai pha**:

### Pha 1: Creation Phase (Tạo execution context)

- Quét code, **đăng ký** tất cả khai báo `var`, `function`, `let`, `const`, `class`
- `var` → khởi tạo `undefined`
- `function` declaration → khởi tạo bằng function body
- `let`, `const`, `class` → đăng ký nhưng **không khởi tạo** (TDZ)

### Pha 2: Execution Phase (Thực thi từng dòng)

- Chạy code theo thứ tự
- Khi gặp gán giá trị, mới gán giá trị thật
- Khi gặp `let`/`const` declaration, biến mới ra khỏi TDZ

```js
// Code thật:
console.log(a);   // undefined
console.log(b);   // ReferenceError (TDZ)
var a = 1;
let b = 2;

// Pha 1 (Creation):
// a → undefined
// b → TDZ

// Pha 2 (Execution):
// Dòng 1: console.log(a) → undefined ✅
// Dòng 2: console.log(b) → b vẫn trong TDZ → ReferenceError ❌
```

## Best practices

### 1. Luôn khai báo ở đầu scope

```js
// ❌ TỆ: dùng trước khi khai báo
function bad() {
  console.log(name);  // undefined
  // ...100 dòng code
  var name = "Alice";
}

// ✅ TỐT: khai báo ở đầu
function good() {
  const name = "Alice";
  console.log(name);  // "Alice"
}
```

### 2. Ưu tiên `const` → `let` → tránh `var`

```js
// ❌ var: dễ bị hoisting, không block scope
var x = 1;

// ✅ let: block scope, có TDZ
let y = 2;

// ✅ const: bất biến, an toàn nhất
const z = 3;
```

### 3. Bật strict mode

```js
"use strict";
x = 10;  // ❌ ReferenceError (không cho dùng biến chưa khai báo)
```

### 4. Dùng ESLint

Quy tắc khuyến nghị:
- `no-var` — cấm dùng `var`
- `no-use-before-define` — cấm dùng biến trước khi khai báo
- `prefer-const` — ưu tiên `const`

---

## Câu hỏi phỏng vấn

### Câu 1: Đoán kết quả

```js
console.log(a);
console.log(b);
console.log(c);
var a = 1;
let b = 2;
const c = 3;
```

**Đáp án:**

```
undefined
ReferenceError: Cannot access 'b' before initialization
```

(Dòng 1 in `undefined`, dòng 2 ném lỗi → dừng → dòng 3 không chạy.)

### Câu 2: Đoán kết quả của Function Declaration vs Expression

```js
foo();
bar();

function foo() {
  console.log("foo");
}

var bar = function() {
  console.log("bar");
};
```

**Đáp án:**

```
foo
TypeError: bar is not a function
```

`foo` là function declaration → được hoisted hoàn toàn → gọi được.
`bar` là function expression → chỉ khai báo `var bar` được hoisted (giá trị `undefined`) → gọi `undefined()` → lỗi.

### Câu 3: TDZ là gì?

**Đáp án:**

**Temporal Dead Zone (TDZ)** là khoảng từ khi `let`/`const`/`class` được hoisted **đến khi gặp dòng khai báo thực sự**. Trong khoảng này, truy cập biến sẽ ném `ReferenceError`.

```js
console.log(x);  // TDZ → ReferenceError
let x = 10;      // x ra khỏi TDZ tại dòng này
console.log(x);  // ✅ 10
```

TDZ giúp tránh nhiều lỗi nguy hiểm của `var` (truy cập trước khi khai báo trả về `undefined` thay vì lỗi rõ ràng).
