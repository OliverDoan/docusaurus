---
sidebar_position: 3
title: "3. Phiên bản JavaScript"
---

# Phiên bản JavaScript

---

## Mục lục

- [ECMAScript là gì?](#ecmascript-là-gì)
- [Cách đặt tên phiên bản](#cách-đặt-tên-phiên-bản)
- [ES5 (2009) — Nền tảng hiện đại](#es5-2009--nền-tảng-hiện-đại)
- [ES6 / ES2015 — Bước nhảy lớn](#es6--es2015--bước-nhảy-lớn)
- [ES2016 → ES2024 — Tính năng theo năm](#es2016--es2024--tính-năng-theo-năm)
- [Cách kiểm tra trình duyệt hỗ trợ tính năng](#cách-kiểm-tra-trình-duyệt-hỗ-trợ-tính-năng)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## ECMAScript là gì?

**ECMAScript (ES)** là **chuẩn (specification)** của ngôn ngữ JavaScript, được quản lý bởi tổ chức **ECMA International** thông qua uỷ ban kĩ thuật **TC39**.

Mỗi năm TC39 phát hành một phiên bản mới với các tính năng đã "chín muồi" (đạt **Stage 4** trong quy trình 5 giai đoạn 0→4).

> **Ví dụ:** ES2024 ra mắt tháng 6/2024 với `Object.groupBy()` và `Promise.withResolvers()`.

## Cách đặt tên phiên bản

Có hai cách đặt tên — đôi khi gây nhầm lẫn:

| Tên ngắn | Tên theo năm | Khi nào dùng |
|----------|--------------|--------------|
| ES5 | (không có) | Phổ biến nhất khi nói về ES5 |
| ES6 | ES2015 | Cả hai đều dùng |
| ES7 | ES2016 | Thường dùng "ES2016" hơn |
| ES8 | ES2017 | Thường dùng "ES2017" hơn |
| ... | ES2018, ES2019, ... | Từ ES2016 trở đi, dùng theo năm |

> **Quy tắc:** Từ năm 2015, TC39 chuyển sang chu kì **release hằng năm** vào tháng 6 — vì vậy đặt tên theo năm dễ nhớ hơn.

## ES5 (2009) — Nền tảng hiện đại

ES5 là phiên bản đầu tiên có nhiều cải tiến quan trọng, vẫn được hỗ trợ trên **mọi trình duyệt hiện đại** (kể cả IE9+).

### Tính năng nổi bật

```js
// 1. Strict mode
"use strict";
x = 10;  // Lỗi: x chưa khai báo

// 2. JSON
const data = JSON.parse('{"name":"Alice"}');
const text = JSON.stringify({ age: 30 });

// 3. Array methods
[1, 2, 3].forEach((x) => console.log(x));
const doubled = [1, 2, 3].map((x) => x * 2);
const evens = [1, 2, 3, 4].filter((x) => x % 2 === 0);

// 4. Object methods
Object.keys({ a: 1, b: 2 });   // ["a", "b"]
Object.create(prototype);

// 5. Getter / Setter
const obj = {
  _value: 0,
  get value() { return this._value; },
  set value(v) { this._value = v; }
};
```

## ES6 / ES2015 — Bước nhảy lớn

ES6 là phiên bản **lớn nhất** trong lịch sử ECMAScript, đưa JS từ "ngôn ngữ script đơn giản" thành "ngôn ngữ hiện đại đầy đủ".

### Tổng quan tính năng ES6

```js
// 1. let / const
let x = 10;
const PI = 3.14;

// 2. Arrow function
const add = (a, b) => a + b;

// 3. Template literal
const name = "Alice";
console.log(`Hello, ${name}!`);

// 4. Destructuring
const { x, y } = point;
const [a, b] = array;

// 5. Default params
function greet(name = "Guest") { /* ... */ }

// 6. Rest / Spread
function sum(...nums) { return nums.reduce((a, b) => a + b); }
const arr = [...arr1, ...arr2];

// 7. Class
class Animal {
  constructor(name) { this.name = name; }
  speak() { console.log(`${this.name} kêu`); }
}

// 8. Promise
fetch(url).then(res => res.json()).then(data => console.log(data));

// 9. Module
import { foo } from './foo.js';
export const bar = 42;

// 10. Map / Set
const map = new Map([[1, "a"], [2, "b"]]);
const set = new Set([1, 2, 3]);

// 11. for...of
for (const item of [1, 2, 3]) { /* ... */ }

// 12. Symbol
const id = Symbol("id");
```

## ES2016 → ES2024 — Tính năng theo năm

### ES2016 (ES7)

```js
// Exponent operator
2 ** 10;  // 1024 (thay cho Math.pow(2, 10))

// Array.includes
[1, 2, 3].includes(2);  // true (thay cho indexOf !== -1)
```

### ES2017 (ES8)

```js
// async/await
async function fetchData() {
  const res = await fetch(url);
  return res.json();
}

// Object.values / Object.entries
Object.values({ a: 1, b: 2 });   // [1, 2]
Object.entries({ a: 1, b: 2 });  // [["a", 1], ["b", 2]]

// String padding
"5".padStart(3, "0");  // "005"
"5".padEnd(3, "0");    // "500"
```

### ES2018 (ES9)

```js
// Object spread
const merged = { ...obj1, ...obj2 };

// Rest properties
const { a, ...rest } = { a: 1, b: 2, c: 3 };

// Promise.finally
fetch(url).finally(() => console.log("done"));

// for await...of
for await (const chunk of stream) { /* ... */ }
```

### ES2019 (ES10)

```js
// Array.flat / flatMap
[1, [2, [3]]].flat(2);  // [1, 2, 3]
[1, 2, 3].flatMap(x => [x, x * 2]);  // [1, 2, 2, 4, 3, 6]

// Object.fromEntries
Object.fromEntries([["a", 1], ["b", 2]]);  // { a: 1, b: 2 }

// Optional catch binding
try { /* ... */ } catch { /* không cần (e) */ }

// String.trimStart / trimEnd
"  hi  ".trimStart();  // "hi  "
```

### ES2020 (ES11)

```js
// Optional chaining
user?.address?.city;

// Nullish coalescing
const port = process.env.PORT ?? 3000;

// BigInt
const big = 9007199254740993n;

// Promise.allSettled
Promise.allSettled([p1, p2, p3]);

// globalThis
globalThis.foo = "bar";  // Hoạt động ở cả browser & Node
```

### ES2021 (ES12)

```js
// String.replaceAll
"foo bar foo".replaceAll("foo", "baz");

// Promise.any
Promise.any([p1, p2, p3]);  // Resolve khi promise đầu tiên thành công

// Logical assignment
x ||= 10;   // x = x || 10
x &&= 10;   // x = x && 10
x ??= 10;   // x = x ?? 10

// Numeric separator
const million = 1_000_000;
```

### ES2022 (ES13)

```js
// Top-level await (trong module)
const data = await fetch(url).then(r => r.json());

// Class private fields
class Counter {
  #count = 0;
  increment() { this.#count++; }
}

// at() method
[1, 2, 3].at(-1);  // 3
"hello".at(-1);    // "o"

// Object.hasOwn
Object.hasOwn(obj, "key");  // Thay thế hasOwnProperty
```

### ES2023 (ES14)

```js
// Array.findLast / findLastIndex
[1, 2, 3, 4].findLast(x => x < 3);  // 2

// Immutable array methods
const arr = [3, 1, 2];
arr.toSorted();     // [1, 2, 3] — không thay đổi arr
arr.toReversed();   // [2, 1, 3]
arr.toSpliced(0, 1);
arr.with(0, 99);    // [99, 1, 2]
```

### ES2024 (ES15)

```js
// Object.groupBy
const items = [{ type: "a", n: 1 }, { type: "b", n: 2 }, { type: "a", n: 3 }];
Object.groupBy(items, ({ type }) => type);
// { a: [{...}, {...}], b: [{...}] }

// Promise.withResolvers
const { promise, resolve, reject } = Promise.withResolvers();
```

## Cách kiểm tra trình duyệt hỗ trợ tính năng

### 1. Trang [caniuse.com](https://caniuse.com)

Gõ tên tính năng (vd: `optional chaining`) → xem trình duyệt nào hỗ trợ.

### 2. Trang [compat-table.github.io/compat-table](https://compat-table.github.io/compat-table/es2016plus/)

Bảng chi tiết theo phiên bản ECMAScript.

### 3. Trong code — feature detection

```js
// Kiểm tra optional chaining có hoạt động không
if (typeof Array.prototype.at === "function") {
  console.log("at() được hỗ trợ");
}

// Kiểm tra BigInt
if (typeof BigInt !== "undefined") {
  console.log("BigInt được hỗ trợ");
}
```

### 4. Babel & Polyfill

Nếu cần dùng tính năng mới trên trình duyệt cũ:
- **Babel**: chuyển code ES2024 → ES5 (transpile)
- **core-js**: polyfill cho các API mới (vd: `Promise`, `Array.flat`)

---

## Câu hỏi phỏng vấn

### Câu 1: ES6 và ES2015 có giống nhau không?

**Đáp án:**

Có — hai tên này là **giống nhau**, cùng chỉ phiên bản ECMAScript thứ 6 ra mắt tháng 6/2015. Từ năm 2015, TC39 chuyển sang quy ước đặt tên theo **năm phát hành** thay vì số thứ tự.

### Câu 2: Khi nào nên dùng `??` thay vì `||`?

**Đáp án:**

```js
// || coi 0, "", false là falsy → fallback
0 || 10;           // 10
"" || "default";   // "default"

// ?? chỉ fallback khi null hoặc undefined
0 ?? 10;           // 0
"" ?? "default";   // ""
null ?? "default"; // "default"
```

Dùng `??` khi muốn **giữ giá trị 0 hoặc chuỗi rỗng** mà chỉ thay khi `null/undefined`.

### Câu 3: Top-level await chỉ chạy được ở đâu?

**Đáp án:**

`top-level await` (ES2022) chỉ hoạt động trong **ES Module** — tức là file có:
- `<script type="module">` (browser)
- `package.json` có `"type": "module"` (Node.js)
- File đuôi `.mjs`

Trong CommonJS hoặc script thường, dùng `await` ở top-level sẽ lỗi `SyntaxError`.
