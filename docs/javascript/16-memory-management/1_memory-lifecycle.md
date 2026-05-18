---
sidebar_position: 1
title: "1. Memory Lifecycle"
---

# Memory Lifecycle — Vòng đời bộ nhớ

---

## Mục lục

- [Bộ nhớ trong JS](#bộ-nhớ-trong-js)
- [3 giai đoạn của bộ nhớ](#3-giai-đoạn-của-bộ-nhớ)
- [Stack vs Heap](#stack-vs-heap)
- [Cách JS cấp phát](#cách-js-cấp-phát)
- [Cách JS sử dụng](#cách-js-sử-dụng)
- [Cách JS giải phóng](#cách-js-giải-phóng)
- [Memory leak phổ biến](#memory-leak-phổ-biến)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Bộ nhớ trong JS

Khác với C/C++ (phải `malloc`/`free` thủ công), JavaScript **tự động** quản lý bộ nhớ thông qua **Garbage Collector (GC)**.

Tuy nhiên hiểu rõ vòng đời bộ nhớ giúp:
- Viết code hiệu quả hơn
- Tránh **memory leak** (rò rỉ bộ nhớ)
- Debug performance issue
- Hiểu được tại sao app chậm dần theo thời gian

## 3 giai đoạn của bộ nhớ

```
1. Allocate (Cấp phát)
   ↓
2. Use (Sử dụng)
   ↓
3. Release (Giải phóng — GC)
```

### Ví dụ minh hoạ

```js
// 1. Allocate
let user = { name: "Alice", age: 30 };   // tạo object trên heap
let nums = new Array(1000);              // tạo mảng

// 2. Use
user.age++;                              // đọc/ghi
nums[0] = 1;

// 3. Release (tự động khi không còn ai tham chiếu)
user = null;
nums = null;
// Object và array sẽ bị GC dọn dẹp khi GC chạy
```

## Stack vs Heap

JS lưu dữ liệu ở **hai vùng** khác nhau:

### Stack — Primitive values

Lưu các **primitive** trực tiếp (giá trị tự thân):

```js
let x = 42;          // số → stack
let name = "Alice";  // chuỗi nhỏ → stack
let flag = true;     // boolean → stack
let n = null;        // null → stack
```

Đặc điểm:
- Truy cập **rất nhanh**
- Kích thước cố định, biết trước
- LIFO (Last In First Out)
- Tự dọn khi hàm trả về

### Heap — Reference values

Lưu các **object** (mảng, function, object) — biến chỉ giữ **địa chỉ**:

```js
let arr = [1, 2, 3];       // arr (stack) → trỏ đến mảng (heap)
let obj = { x: 1 };        // obj (stack) → trỏ đến object (heap)
let fn = function() {};    // fn (stack) → trỏ đến function (heap)
```

Đặc điểm:
- Kích thước thay đổi
- Truy cập chậm hơn
- Cần GC dọn dẹp
- Có thể có **circular reference**

### Minh hoạ

```
Stack:                    Heap:
┌────────────────┐
│ x = 42         │
├────────────────┤        ┌─────────────────┐
│ obj → 0x1234   │───────→│ { name: "Alice" }│
├────────────────┤        └─────────────────┘
│ arr → 0x5678   │───────→ [1, 2, 3]
└────────────────┘
```

### Pass by value vs reference

```js
// Primitive: pass by value (copy)
let a = 10;
let b = a;
b = 20;
console.log(a);   // 10 (không đổi)

// Object: pass by reference (copy địa chỉ)
let obj1 = { x: 1 };
let obj2 = obj1;
obj2.x = 2;
console.log(obj1.x);   // 2 ⚠️ (cùng object!)

// Nhưng gán mới thì khác:
obj2 = { x: 3 };
console.log(obj1.x);   // 2 (obj1 vẫn trỏ object cũ)
```

## Cách JS cấp phát

### Khai báo biến

```js
let n = 123;                       // số (stack)
let s = "string";                  // chuỗi
let bool = true;                   // boolean
let obj = { name: "Alice" };       // object (heap)
let arr = [1, 2, 3];               // array (heap)
let fn = function() {};            // function (heap)
```

### Object constructor

```js
const d = new Date();              // Date object
const map = new Map();             // Map
const buf = new ArrayBuffer(1024); // 1KB buffer
```

### Function call

```js
function process() {
  const local = new Array(100);    // cấp phát trong scope function
  // ... dùng local ...
}
// Khi function kết thúc, local hết tham chiếu → có thể GC
```

## Cách JS sử dụng

```js
const arr = [1, 2, 3];

// Đọc
arr[0];                  // 1
arr.length;              // 3

// Ghi
arr[1] = 99;
arr.push(4);

// Truyền
function process(data) { /* ... */ }
process(arr);            // truyền reference (địa chỉ heap)
```

## Cách JS giải phóng

### Garbage Collection tự động

Khi object **không còn ai tham chiếu**, GC sẽ dọn dẹp:

```js
let user = { name: "Alice" };  // 1 reference đến object

user = null;                    // 0 reference → có thể GC
```

### Khi nào GC chạy?

GC chạy **không xác định** — engine quyết định:
- Khi heap đầy (tới ngưỡng)
- Khi idle (không có công việc)
- Theo chu kì (tuỳ engine)

Không gọi GC thủ công được trong JS (Node có `global.gc()` nếu chạy với `--expose-gc`).

### Phân biệt với delete

```js
const obj = { a: 1, b: 2 };
delete obj.a;        // xoá property a — không phải GC object

// vs

let obj = { a: 1 };
obj = null;          // remove reference → GC sẽ dọn object
```

## Memory leak phổ biến

### 1. Global variable không cần thiết

```js
// ❌ Lỡ quên var/let/const → biến global
function leak() {
  data = new Array(1000000);   // global "data"!
}

// ✅ Khai báo rõ ràng
function noLeak() {
  const data = new Array(1000000);   // local, GC sau khi return
}
```

Strict mode giúp tránh trường hợp này (ném ReferenceError).

### 2. Event listener không cleanup

```js
function attach() {
  const button = document.getElementById("btn");
  const data = new Array(1000000);   // dữ liệu lớn
  
  button.addEventListener("click", () => {
    console.log(data.length);   // closure giữ "data"
  });
  
  // ❌ Không bao giờ remove listener
  // → data không thể GC kể cả khi component bị xoá
}

// ✅ Cleanup
function attachSafe() {
  const button = document.getElementById("btn");
  const handler = () => { /* ... */ };
  button.addEventListener("click", handler);
  
  return () => {
    button.removeEventListener("click", handler);
  };
}
```

### 3. Detached DOM nodes

```js
let detached = document.getElementById("item");
detached.parentNode.removeChild(detached);
// detached vẫn giữ reference → memory leak

detached = null;   // ✅ giải phóng
```

### 4. Closures giữ reference lớn

```js
function outer() {
  const huge = new Array(1000000);
  
  return function inner() {
    return 42;   // không dùng "huge"
  };
}

const fn = outer();
// V8 thường tối ưu, nhưng vẫn nên cẩn thận
```

### 5. Timer / interval quên clear

```js
const timer = setInterval(() => {
  // ...
}, 1000);

// ❌ Quên clear → timer chạy mãi, giữ reference

clearInterval(timer);   // ✅
```

### 6. Cache không có limit

```js
const cache = {};

function expensiveCalc(key) {
  if (!cache[key]) {
    cache[key] = doCalc(key);
  }
  return cache[key];
}
// ❌ Cache lớn vô hạn

// ✅ Dùng WeakMap hoặc LRU cache
const cache = new Map();
const MAX_SIZE = 100;

function get(key) {
  if (cache.size >= MAX_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  // ...
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: Vòng đời bộ nhớ trong JS gồm những giai đoạn nào?

**Đáp án:**

3 giai đoạn:

1. **Allocate** — Cấp phát: khi tạo biến, object, function
2. **Use** — Sử dụng: đọc/ghi giá trị
3. **Release** — Giải phóng: GC tự động dọn khi không còn ai tham chiếu

Khác C/C++, JS tự động hoá giai đoạn 3 thông qua Garbage Collector.

### Câu 2: Primitive lưu ở đâu? Object lưu ở đâu?

**Đáp án:**

- **Primitive** (`number`, `string`, `boolean`, `null`, `undefined`, `symbol`, `bigint`) → lưu trên **stack** (giá trị trực tiếp).
- **Object** (mảng, function, object) → lưu trên **heap**, biến chỉ giữ **địa chỉ** (reference) ở stack.

Khi truyền vào function:
- Primitive: pass by **value** (copy giá trị)
- Object: pass by **reference value** (copy địa chỉ)

### Câu 3: Memory leak là gì?

**Đáp án:**

**Memory leak** là khi bộ nhớ được cấp phát nhưng **không được giải phóng** dù không còn cần thiết — gây tốn RAM, app chậm dần.

Các nguyên nhân phổ biến:
1. Global variable không cần
2. Event listener không cleanup
3. Detached DOM nodes
4. Closure giữ object lớn
5. Timer/interval quên clear
6. Cache không có limit

Cách debug: **Chrome DevTools → Memory tab → Heap snapshot**.

### Câu 4: Đoán xem nào có thể GC?

```js
let a = { x: 1 };
let b = a;
a = null;
console.log(b);
```

**Đáp án:**

Object `{ x: 1 }` **KHÔNG thể GC** vì `b` vẫn tham chiếu nó. Mặc dù `a` đã `null`, `b` giữ reference → object còn sống.

Để GC dọn:
```js
b = null;
// Bây giờ object không còn ai tham chiếu → có thể GC
```
