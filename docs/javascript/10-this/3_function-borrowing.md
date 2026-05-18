---
sidebar_position: 3
title: "3. Function Borrowing"
---

# Function Borrowing — Mượn hàm

---

## Mục lục

- [Khái niệm](#khái-niệm)
- [Mượn method từ object khác](#mượn-method-từ-object-khác)
- [Mượn method từ prototype](#mượn-method-từ-prototype)
- [Use case: array-like → array](#use-case-array-like--array)
- [Spread thay cho function borrowing](#spread-thay-cho-function-borrowing)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Khái niệm

**Function borrowing** là kỹ thuật **mượn method** từ một object/class để dùng cho một object khác — bằng cách dùng `.call()`, `.apply()`, hoặc `.bind()` để **đổi `this`**.

```js
const person1 = {
  name: "Alice",
  greet() {
    return `Hello, ${this.name}`;
  }
};

const person2 = { name: "Bob" };

// Mượn greet của person1, áp dụng vào person2
person1.greet.call(person2);   // "Hello, Bob"
```

> **Ví dụ thực tế:** Hãy tưởng tượng bạn mượn **máy hút bụi** của hàng xóm để dọn nhà mình — máy không thay đổi, nhưng nó hoạt động trên **nhà bạn** (`this` = nhà bạn).

## Mượn method từ object khác

### Cú pháp

```js
otherObject.method.call(thisArg, ...args);
otherObject.method.apply(thisArg, [args]);
const bound = otherObject.method.bind(thisArg);
```

### Ví dụ

```js
const car = {
  speed: 100,
  describe(unit) {
    return `${this.name}: ${this.speed} ${unit}`;
  }
};

const plane = { name: "Boeing", speed: 900 };

// Mượn describe
car.describe.call(plane, "km/h");
// "Boeing: 900 km/h"

car.describe.apply(plane, ["km/h"]);
// "Boeing: 900 km/h"

const planeDesc = car.describe.bind(plane);
planeDesc("km/h");
// "Boeing: 900 km/h"
```

## Mượn method từ prototype

Thường gặp khi muốn dùng **Array methods** cho object không phải mảng:

```js
const arrayLike = { 0: "a", 1: "b", 2: "c", length: 3 };

// Không có .forEach
arrayLike.forEach(...);   // ❌ TypeError

// ✅ Mượn từ Array.prototype
Array.prototype.forEach.call(arrayLike, (item, i) => {
  console.log(i, item);
});
// 0 "a"
// 1 "b"
// 2 "c"

// Tương tự với map, filter, slice...
const mapped = Array.prototype.map.call(arrayLike, x => x.toUpperCase());
// ["A", "B", "C"]
```

### Mượn `Object.prototype.toString` để check kiểu

```js
Object.prototype.toString.call([]);          // "[object Array]"
Object.prototype.toString.call({});          // "[object Object]"
Object.prototype.toString.call("hello");     // "[object String]"
Object.prototype.toString.call(null);        // "[object Null]"
Object.prototype.toString.call(undefined);   // "[object Undefined]"
Object.prototype.toString.call(new Date());  // "[object Date]"
Object.prototype.toString.call(/regex/);     // "[object RegExp]"
Object.prototype.toString.call(new Map());   // "[object Map]"

// Hàm helper
function getType(value) {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

getType([]);          // "array"
getType({});          // "object"
getType(null);        // "null"
getType(new Date());  // "date"
```

## Use case: array-like → array

### 1. `arguments` (cũ)

```js
function test() {
  // arguments không phải Array
  const args = Array.prototype.slice.call(arguments);
  // hoặc Array.from(arguments)
  // hoặc [...arguments]
  
  args.map(x => x * 2);
}
```

### 2. `NodeList` (DOM)

```js
const divs = document.querySelectorAll("div");

// Cách cũ — mượn slice
const arr = Array.prototype.slice.call(divs);
arr.filter(d => d.classList.contains("active"));

// Hoặc mượn forEach
Array.prototype.forEach.call(divs, div => {
  div.style.color = "red";
});
```

### 3. String (xử lý ký tự)

```js
const str = "hello";

// "h", "e", "l", "l", "o"
const chars = Array.prototype.slice.call(str);
// hoặc [...str]
```

### 4. Object có `length`

```js
const list = { 0: "a", 1: "b", 2: "c", length: 3 };

Array.prototype.join.call(list, ",");      // "a,b,c"
Array.prototype.indexOf.call(list, "b");   // 1
Array.prototype.reverse.call(list);        // mutates! ⚠️
```

## Spread thay cho function borrowing

ES6+ cung cấp cách **dễ đọc hơn** thay cho function borrowing:

### Convert array-like → array

```js
// Cách cũ
const arr1 = Array.prototype.slice.call(arrayLike);

// ✅ ES6
const arr2 = Array.from(arrayLike);

// ✅ Spread (nếu iterable)
const arr3 = [...arrayLike];   // chỉ khi có [Symbol.iterator]
```

### Tìm max trong mảng

```js
const nums = [1, 5, 3, 9, 2];

// Cũ — mượn apply
Math.max.apply(null, nums);   // 9

// ✅ ES6
Math.max(...nums);            // 9
```

### Concat mảng

```js
const a = [1, 2];
const b = [3, 4];

// Cũ
Array.prototype.push.apply(a, b);   // a = [1, 2, 3, 4]

// ✅ ES6
a.push(...b);                        // a = [1, 2, 3, 4]
// Hoặc
const c = [...a, ...b];              // không mutate
```

### Khi nào CÒN nên dùng function borrowing?

Khi tham số là object thực sự **array-like** chưa thể spread (không iterable) — vd `arguments` (đã ít dùng), `NodeList` cũ:

```js
function legacy() {
  // arguments là array-like nhưng không iterable trong strict mode cũ
  Array.prototype.forEach.call(arguments, console.log);
}
```

Hoặc khi cần **gọi với `this` riêng**:

```js
const result = arr.reduce.call(thisArg, callback, initial);
```

---

## Câu hỏi phỏng vấn

### Câu 1: Function borrowing là gì?

**Đáp án:**

Function borrowing là **mượn method** của object A để dùng cho object B — bằng cách dùng `.call()`, `.apply()`, hoặc `.bind()` để gắn `this` thành B.

```js
const a = { name: "A", greet() { return this.name; } };
const b = { name: "B" };

a.greet.call(b);   // "B"  (mượn greet của a, this = b)
```

### Câu 2: Vì sao thường mượn `Array.prototype.slice` để convert array-like?

**Đáp án:**

`slice()` không cần arguments — gọi `slice()` không tham số trả về **bản sao** của mảng. Bằng cách dùng `.call()` với `this` là array-like, ta tạo được mảng thực sự:

```js
// arguments → array
function test() {
  const args = Array.prototype.slice.call(arguments);
  // hoặc [].slice.call(arguments) — viết gọn
}

// NodeList → array
const arr = Array.prototype.slice.call(nodeList);
```

Trong code hiện đại, có thể thay bằng:
- `Array.from(arrayLike)`
- `[...iterable]`

### Câu 3: Đoán kết quả

```js
const numbers = { 0: 10, 1: 20, 2: 30, length: 3 };

const sum = Array.prototype.reduce.call(numbers, (acc, n) => acc + n, 0);
console.log(sum);

const max = Math.max.apply(null, numbers);
console.log(max);
```

**Đáp án:**

```
60
NaN
```

- `reduce.call(numbers, ...)` hoạt động vì `reduce` có `this` là `numbers`
- `Math.max.apply(null, numbers)` không hoạt động đúng — `apply` cần **array thực** hoặc **array-like với length**. Trên một số engine `apply` chấp nhận array-like nhưng kết quả thường là `NaN` hoặc lỗi.

Sửa lại:

```js
Math.max.apply(null, Array.from(numbers));   // 30
Math.max(...Array.from(numbers));            // 30
```

### Câu 4: Tại sao `Object.prototype.toString.call(value)` là cách check type tốt nhất?

**Đáp án:**

`typeof` có nhiều giới hạn:

```js
typeof [];      // "object"
typeof null;    // "object"
typeof new Date();   // "object"
```

`Object.prototype.toString.call()` trả về **type chính xác**:

```js
Object.prototype.toString.call([]);          // "[object Array]"
Object.prototype.toString.call(null);        // "[object Null]"
Object.prototype.toString.call(new Date());  // "[object Date]"
Object.prototype.toString.call(/x/);         // "[object RegExp]"
```

Đây là kỹ thuật chuẩn để **phân biệt các built-in object** một cách chính xác.
