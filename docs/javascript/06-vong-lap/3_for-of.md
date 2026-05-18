---
sidebar_position: 3
title: "3. for...of"
---

# Vòng lặp `for...of`

---

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Cú pháp](#cú-pháp)
- [Lặp qua các iterable](#lặp-qua-các-iterable)
- [Với index — `entries()`](#với-index--entries)
- [Iterable Protocol](#iterable-protocol)
- [Tự tạo iterable](#tự-tạo-iterable)
- [`for await...of` cho async](#for-awaitof-cho-async)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Giới thiệu

`for...of` (ES6) lặp qua **giá trị** của các **iterable** — bao gồm:
- Array
- String
- Map, Set, WeakMap, WeakSet (chỉ WeakMap/Set không iterable)
- TypedArray
- arguments
- Generator
- NodeList, HTMLCollection
- Bất kỳ object nào có `[Symbol.iterator]`

> **Lưu ý:** **Object thuần** (`{}`) **không phải** iterable mặc định — phải dùng `Object.keys/values/entries`.

```js
for (const value of [1, 2, 3]) {
  console.log(value);
}
// 1
// 2
// 3
```

## Cú pháp

```js
for (const value of iterable) {
  // dùng value
}

// Cũng có thể destructuring
for (const { name, age } of users) { /* ... */ }
for (const [k, v] of map) { /* ... */ }
```

## Lặp qua các iterable

### Array

```js
const fruits = ["táo", "chuối", "cam"];
for (const fruit of fruits) {
  console.log(fruit);
}
// táo
// chuối
// cam
```

### String

```js
for (const char of "hello") {
  console.log(char);
}
// h, e, l, l, o

// Hỗ trợ Unicode đúng (khác for cổ điển):
for (const char of "😀😎🎉") console.log(char);
// 😀, 😎, 🎉 (mỗi emoji là 1 char)

// So với for cổ điển:
for (let i = 0; i < "😀".length; i++) {
  console.log("😀"[i]);  // ⚠️ in ra 2 surrogate code units
}
```

### Map

```js
const map = new Map([
  ["a", 1],
  ["b", 2],
  ["c", 3]
]);

// Mặc định: lặp qua [key, value]
for (const [key, value] of map) {
  console.log(key, value);
}
// a 1, b 2, c 3

// Chỉ key
for (const key of map.keys()) console.log(key);

// Chỉ value
for (const value of map.values()) console.log(value);

// Cả hai
for (const entry of map.entries()) console.log(entry);
```

### Set

```js
const set = new Set([1, 2, 3]);
for (const value of set) {
  console.log(value);
}
```

### NodeList (DOM)

```js
const divs = document.querySelectorAll("div");

// ✅ NodeList có thể iterate
for (const div of divs) {
  div.style.color = "red";
}

// ❌ HTMLCollection cũ KHÔNG iterable — phải convert:
const items = document.getElementsByClassName("item");
for (const item of [...items]) { /* ... */ }
// hoặc
for (const item of Array.from(items)) { /* ... */ }
```

### Generator

```js
function* range(start, end) {
  for (let i = start; i < end; i++) yield i;
}

for (const n of range(1, 5)) console.log(n);
// 1, 2, 3, 4
```

### arguments

```js
function logArgs() {
  for (const arg of arguments) {
    console.log(arg);
  }
}
logArgs("a", "b", "c");
```

## Với index — `entries()`

`for...of` không có index sẵn. Dùng `.entries()`:

```js
const arr = ["a", "b", "c"];

for (const [index, value] of arr.entries()) {
  console.log(index, value);
}
// 0 "a"
// 1 "b"
// 2 "c"
```

Cũng hoạt động với `String`:

```js
for (const [i, char] of "abc".entries()) {
  console.log(i, char);
}
// 0 "a", 1 "b", 2 "c"
```

## Iterable Protocol

Một object là **iterable** khi nó có method `[Symbol.iterator]()` trả về **iterator**:

```js
const iterable = {
  [Symbol.iterator]() {
    let i = 0;
    return {
      next() {
        if (i < 3) {
          return { value: i++, done: false };
        }
        return { value: undefined, done: true };
      }
    };
  }
};

for (const v of iterable) console.log(v);
// 0, 1, 2
```

Iterator phải có method `next()` trả về `{ value, done }`:
- `done: false` → tiếp tục với `value`
- `done: true` → dừng vòng lặp

## Tự tạo iterable

### Cách 1: object với Symbol.iterator

```js
const range = {
  start: 1,
  end: 5,
  [Symbol.iterator]() {
    let current = this.start;
    const last = this.end;
    return {
      next() {
        return current <= last
          ? { value: current++, done: false }
          : { value: undefined, done: true };
      }
    };
  }
};

for (const n of range) console.log(n);  // 1, 2, 3, 4, 5
[...range];                              // [1, 2, 3, 4, 5]
Array.from(range);                       // [1, 2, 3, 4, 5]
```

### Cách 2: Generator (gọn hơn)

```js
const range = {
  *[Symbol.iterator]() {
    for (let i = this.start; i <= this.end; i++) {
      yield i;
    }
  },
  start: 1,
  end: 5
};

for (const n of range) console.log(n);
```

### Tạo class iterable

```js
class LinkedList {
  constructor() { this.head = null; }
  
  push(value) {
    this.head = { value, next: this.head };
  }
  
  *[Symbol.iterator]() {
    let node = this.head;
    while (node) {
      yield node.value;
      node = node.next;
    }
  }
}

const list = new LinkedList();
list.push(3);
list.push(2);
list.push(1);

for (const v of list) console.log(v);  // 1, 2, 3
[...list];                              // [1, 2, 3]
```

## `for await...of` cho async

ES2018 thêm `for await...of` để lặp qua **async iterable**:

```js
async function* fetchPages() {
  for (let i = 1; i <= 3; i++) {
    const res = await fetch(`/api/page/${i}`);
    yield res.json();
  }
}

(async () => {
  for await (const page of fetchPages()) {
    console.log(page);
  }
})();
```

### Lặp qua stream

```js
async function processStream(stream) {
  for await (const chunk of stream) {
    process(chunk);
  }
}
```

### Lặp qua promises

```js
const promises = [
  fetch("/api/1"),
  fetch("/api/2"),
  fetch("/api/3")
];

// Tuần tự
for await (const res of promises) {
  console.log(await res.json());
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: `for...in` vs `for...of` khác nhau như thế nào?

**Đáp án:**

| | `for...in` | `for...of` |
|---|-----------|------------|
| Lặp qua | Key (string) | Value |
| Hỗ trợ | Object | Iterable (Array, Map, Set, String, Generator...) |
| Object thuần | ✅ | ❌ (cần `Object.values/entries`) |
| Prototype chain | ✅ Có | ❌ Không |
| Đảm bảo thứ tự | Integer trước | Theo iterator |

### Câu 2: Vì sao `for...of` không hoạt động với object?

**Đáp án:**

Object thuần (`{}`) **không có** `[Symbol.iterator]` — nên không phải iterable.

```js
const obj = { a: 1, b: 2 };
for (const v of obj) {}  // ❌ TypeError: obj is not iterable

// ✅ Cách dùng:
for (const v of Object.values(obj)) { /* ... */ }
for (const k of Object.keys(obj)) { /* ... */ }
for (const [k, v] of Object.entries(obj)) { /* ... */ }
```

Có thể tự thêm `[Symbol.iterator]` cho object nếu cần.

### Câu 3: Đoán kết quả

```js
const arr = ["a", "b", "c"];

for (const v of arr) {
  if (v === "b") break;
  console.log(v);
}

console.log("---");

arr.forEach(v => {
  if (v === "b") return;  // chỉ skip lần này
  console.log(v);
});
```

**Đáp án:**

```
a
---
a
c
```

- `for...of` hỗ trợ `break`, `continue`, `return`.
- `forEach` thì **không** — `return` chỉ là skip callback hiện tại (giống `continue`).

### Câu 4: Tự viết một iterable đếm Fibonacci

**Đáp án:**

```js
function fibonacci(limit) {
  return {
    *[Symbol.iterator]() {
      let [a, b] = [0, 1];
      while (a < limit) {
        yield a;
        [a, b] = [b, a + b];
      }
    }
  };
}

for (const n of fibonacci(50)) {
  console.log(n);
}
// 0, 1, 1, 2, 3, 5, 8, 13, 21, 34

[...fibonacci(20)];   // [0, 1, 1, 2, 3, 5, 8, 13]
```
