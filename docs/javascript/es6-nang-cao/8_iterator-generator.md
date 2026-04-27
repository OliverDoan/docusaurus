---
sidebar_position: 8
title: "8. Iterator & Generator"
---

# Iterator & Generator


---

## Mục lục

- [Iterator là gì?](#iterator-là-gì)
- [Iterable Protocol — Giao thức Iterable](#iterable-protocol--giao-thức-iterable)
- [Tự tạo Iterator](#tự-tạo-iterator)
- [Generator Function — function*](#generator-function--function)
- [yield — Tạm dừng và tiếp tục](#yield--tạm-dừng-và-tiếp-tục)
- [yield* — Ủy quyền cho generator khác](#yield--ủy-quyền-cho-generator-khác)
- [Use Cases thực tế](#use-cases-thực-tế)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Iterator là gì?

**Iterator** là một object cung cấp cách **duyệt tuần tự** qua một tập hợp dữ liệu, mỗi lần trả về **một phần tử**. Iterator có method `next()` trả về object `{ value, done }`.

> **Ví dụ thực tế:** Iterator giống như **máy bán hàng tự động** — mỗi lần bạn bỏ xu (gọi `next()`), máy nhả ra **một món đồ** (`value`). Khi hết đồ, máy báo **"hết hàng"** (`done: true`).

```javascript
// Mảng là iterable — có thể tạo iterator từ nó
const mang = ["🍎", "🍌", "🍊"];
const iterator = mang[Symbol.iterator]();

console.log(iterator.next()); // { value: "🍎", done: false }
console.log(iterator.next()); // { value: "🍌", done: false }
console.log(iterator.next()); // { value: "🍊", done: false }
console.log(iterator.next()); // { value: undefined, done: true } — hết!
```

---

## Iterable Protocol — Giao thức Iterable

Một object là **iterable** khi nó implement method `[Symbol.iterator]()` trả về một iterator. Các iterable built-in: `Array`, `String`, `Map`, `Set`, `arguments`, `NodeList`.

### Những gì dùng được với iterable

```javascript
const ten = "Minh";

// 1. for...of — duyệt từng phần tử
for (const kyTu of ten) {
  console.log(kyTu); // "M", "i", "n", "h"
}

// 2. Spread operator
console.log([...ten]); // ["M", "i", "n", "h"]

// 3. Destructuring
const [a, b, c] = ten;
console.log(a, b, c); // "M" "i" "n"

// 4. Array.from()
console.log(Array.from(ten)); // ["M", "i", "n", "h"]

// 5. Promise.all(), Map(), Set()
const set = new Set(ten);
console.log(set); // Set { "M", "i", "n", "h" }
```

### Object KHÔNG phải iterable mặc định

```javascript
const user = { ten: "Minh", tuoi: 25 };

// ❌ Lỗi — object không có Symbol.iterator
// for (const val of user) {} // TypeError: user is not iterable

// ✅ Duyệt object bằng cách khác
for (const key of Object.keys(user)) {
  console.log(key, user[key]); // "ten Minh", "tuoi 25"
}

for (const [key, val] of Object.entries(user)) {
  console.log(key, val);
}
```

---

## Tự tạo Iterator

```javascript
// Tạo object iterable: đếm từ 1 đến max
function demTuMot(max) {
  return {
    // Implement iterable protocol
    [Symbol.iterator]() {
      let hienTai = 1;
      return {
        // Iterator protocol — phải có next()
        next() {
          if (hienTai <= max) {
            return { value: hienTai++, done: false };
          }
          return { value: undefined, done: true };
        }
      };
    }
  };
}

const dem = demTuMot(5);

// Dùng được với for...of
for (const so of dem) {
  console.log(so); // 1, 2, 3, 4, 5
}

// Dùng được với spread
console.log([...demTuMot(3)]); // [1, 2, 3]
```

### Ví dụ: Range iterator

```javascript
class Range {
  constructor(start, end, step = 1) {
    this.start = start;
    this.end = end;
    this.step = step;
  }

  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    const step = this.step;

    return {
      next() {
        if (current <= end) {
          const value = current;
          current += step;
          return { value, done: false };
        }
        return { done: true };
      }
    };
  }
}

// Dùng như Python range()
for (const n of new Range(0, 10, 2)) {
  console.log(n); // 0, 2, 4, 6, 8, 10
}

console.log([...new Range(1, 5)]); // [1, 2, 3, 4, 5]
```

---

## Generator Function — function*

**Generator** là cách **đơn giản hơn** để tạo iterator. Dùng keyword `function*` và `yield` để tạm dừng / tiếp tục hàm.

```javascript
// function* — Generator function
function* demSo() {
  yield 1;    // Tạm dừng, trả về 1
  yield 2;    // Tạm dừng, trả về 2
  yield 3;    // Tạm dừng, trả về 3
}

// Gọi generator function → trả về generator object (iterator)
const gen = demSo();

console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: false }
console.log(gen.next()); // { value: undefined, done: true }

// Generator là iterable → dùng được for...of
for (const so of demSo()) {
  console.log(so); // 1, 2, 3
}
```

### Range với Generator — Ngắn gọn hơn

```javascript
// So sánh: class Range ở trên vs generator
function* range(start, end, step = 1) {
  for (let i = start; i <= end; i += step) {
    yield i;
  }
}

console.log([...range(1, 5)]);      // [1, 2, 3, 4, 5]
console.log([...range(0, 10, 3)]);  // [0, 3, 6, 9]

for (const n of range(10, 15)) {
  console.log(n); // 10, 11, 12, 13, 14, 15
}
```

---

## yield — Tạm dừng và tiếp tục

`yield` **tạm dừng** generator và trả về giá trị. Khi gọi `next()` tiếp, generator **tiếp tục** từ chỗ đã dừng.

### Truyền giá trị vào generator qua next()

```javascript
function* hoiDap() {
  const ten = yield "Tên bạn là gì?";
  const tuoi = yield `Chào ${ten}! Bạn bao nhiêu tuổi?`;
  yield `${ten}, ${tuoi} tuổi. Cảm ơn bạn!`;
}

const gen = hoiDap();

console.log(gen.next().value);
// "Tên bạn là gì?" — yield đầu tiên

console.log(gen.next("Minh").value);
// "Chào Minh! Bạn bao nhiêu tuổi?" — "Minh" gán cho biến ten

console.log(gen.next(25).value);
// "Minh, 25 tuổi. Cảm ơn bạn!" — 25 gán cho biến tuoi
```

### return() — Kết thúc sớm

```javascript
function* demVoCung() {
  let i = 0;
  while (true) {
    yield i++;
  }
}

const gen = demVoCung();
console.log(gen.next()); // { value: 0, done: false }
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.return("Dừng!")); // { value: "Dừng!", done: true }
console.log(gen.next()); // { value: undefined, done: true } — đã kết thúc
```

---

## yield* — Ủy quyền cho generator khác

`yield*` cho phép một generator **ủy quyền** (delegate) cho một iterable hoặc generator khác.

```javascript
function* traVang() {
  yield "🍎";
  yield "🍐";
}

function* rauCu() {
  yield "🥕";
  yield "🥦";
}

// yield* ủy quyền cho generator khác
function* sieuThi() {
  yield "Trái cây:";
  yield* traVang();  // Yield tất cả từ traVang
  yield "Rau củ:";
  yield* rauCu();    // Yield tất cả từ rauCu
}

for (const item of sieuThi()) {
  console.log(item);
}
// "Trái cây:"
// "🍎"
// "🍐"
// "Rau củ:"
// "🥕"
// "🥦"
```

### yield* với mảng và string

```javascript
function* flatten(arr) {
  for (const item of arr) {
    if (Array.isArray(item)) {
      yield* flatten(item); // Đệ quy với yield*
    } else {
      yield item;
    }
  }
}

const nested = [1, [2, 3], [4, [5, 6]]];
console.log([...flatten(nested)]); // [1, 2, 3, 4, 5, 6]
```

---

## Use Cases thực tế

### 1. Lazy Evaluation — Tính khi cần

Generator chỉ tính giá trị **khi được yêu cầu**, tiết kiệm bộ nhớ cho tập dữ liệu lớn.

```javascript
// ❌ Tạo mảng 1 triệu phần tử — tốn bộ nhớ
const tatCa = Array.from({ length: 1000000 }, (_, i) => i * i);
// Mảng 1 triệu phần tử nằm trong RAM!

// ✅ Generator — chỉ tính khi cần
function* binhPhuong(n) {
  for (let i = 0; i < n; i++) {
    yield i * i;
  }
}

// Chỉ lấy 5 phần tử đầu — không tính 999,995 phần tử còn lại!
const gen = binhPhuong(1000000);
for (let i = 0; i < 5; i++) {
  console.log(gen.next().value); // 0, 1, 4, 9, 16
}
```

### 2. Infinite Sequences — Dãy vô hạn

```javascript
// Dãy Fibonacci vô hạn
function* fibonacci() {
  let a = 0, b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// Lấy 10 số Fibonacci đầu tiên
function lay(n, gen) {
  const ketQua = [];
  for (const val of gen) {
    ketQua.push(val);
    if (ketQua.length === n) break;
  }
  return ketQua;
}

console.log(lay(10, fibonacci()));
// [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

### 3. ID Generator — Tạo ID tự tăng

```javascript
function* taoId(prefix = "ID") {
  let id = 1;
  while (true) {
    yield `${prefix}-${String(id++).padStart(5, "0")}`;
  }
}

const userId = taoId("USER");
console.log(userId.next().value); // "USER-00001"
console.log(userId.next().value); // "USER-00002"
console.log(userId.next().value); // "USER-00003"

const orderId = taoId("ORD");
console.log(orderId.next().value); // "ORD-00001"
```

### 4. Phân trang (Pagination)

```javascript
function* phanTrang(data, soLuongMotTrang) {
  for (let i = 0; i < data.length; i += soLuongMotTrang) {
    yield data.slice(i, i + soLuongMotTrang);
  }
}

const danhSach = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const trang = phanTrang(danhSach, 3);

console.log(trang.next().value); // [1, 2, 3] — Trang 1
console.log(trang.next().value); // [4, 5, 6] — Trang 2
console.log(trang.next().value); // [7, 8, 9] — Trang 3
console.log(trang.next().value); // [10]      — Trang 4
```

### 5. State Machine

```javascript
function* denGiaoThong() {
  while (true) {
    yield "🔴 Đỏ — Dừng lại";
    yield "🟢 Xanh — Đi";
    yield "🟡 Vàng — Chuẩn bị dừng";
  }
}

const den = denGiaoThong();
console.log(den.next().value); // "🔴 Đỏ — Dừng lại"
console.log(den.next().value); // "🟢 Xanh — Đi"
console.log(den.next().value); // "🟡 Vàng — Chuẩn bị dừng"
console.log(den.next().value); // "🔴 Đỏ — Dừng lại" — lặp lại
```

---

## Lỗi thường gặp

### 1. Quên dấu * trong function declaration

```javascript
// ❌ Sai — function thường, yield là syntax error
function gen() {
  yield 1; // SyntaxError: Unexpected number
}

// ✅ Đúng — function* (có dấu *)
function* gen() {
  yield 1;
}
```

### 2. Generator chỉ duyệt được MỘT LẦN

```javascript
function* numbers() {
  yield 1;
  yield 2;
  yield 3;
}

const gen = numbers();

console.log([...gen]); // [1, 2, 3]
console.log([...gen]); // [] — ĐÃ HẾT! Generator đã "exhausted"

// ✅ Muốn duyệt lại → tạo generator MỚI
console.log([...numbers()]); // [1, 2, 3]
```

### 3. Arrow function không thể là generator

```javascript
// ❌ Sai — arrow function không hỗ trợ function*
// const gen = *() => { yield 1; }; // SyntaxError

// ✅ Phải dùng function declaration hoặc expression
function* gen() { yield 1; }
const gen2 = function*() { yield 1; };
```

---

## Câu hỏi phỏng vấn

### Câu 1: Iterator và Iterable khác nhau thế nào?

**Đáp án:** **Iterable** là object có method `[Symbol.iterator]()` trả về iterator. **Iterator** là object có method `next()` trả về `{ value, done }`. Một object có thể vừa là iterable vừa là iterator (generator object). Ví dụ: Array là iterable (có `Symbol.iterator`), khi gọi `array[Symbol.iterator]()` ta được iterator.

### Câu 2: Generator function khác gì function thường?

**Đáp án:** Generator function (khai báo bằng `function*`) **không chạy ngay** khi gọi — trả về generator object (iterator). Mỗi lần gọi `next()`, code chạy đến `yield` tiếp theo rồi **tạm dừng**, giữ nguyên context. Function thường chạy từ đầu đến cuối, không thể tạm dừng. Generator hỗ trợ **two-way communication** qua `next(value)`.

### Câu 3: Lazy evaluation nghĩa là gì? Generator giúp gì?

**Đáp án:** Lazy evaluation là chiến lược **tính toán khi cần** thay vì tính trước tất cả. Generator cho phép tạo chuỗi giá trị vô hạn mà không chiếm bộ nhớ — mỗi giá trị chỉ được tính khi gọi `next()`. Ví dụ: dãy Fibonacci vô hạn chỉ tốn bộ nhớ cho 2 biến, thay vì mảng chứa tất cả số.

### Câu 4: Viết generator function flatten mảng đa chiều

**Đáp án:**

```javascript
function* flatten(arr) {
  for (const item of arr) {
    if (Array.isArray(item)) {
      yield* flatten(item);
    } else {
      yield item;
    }
  }
}

console.log([...flatten([1, [2, [3, [4]]]])]); // [1, 2, 3, 4]
```

Dùng `yield*` để đệ quy ủy quyền cho generator con, tạo ra chuỗi phẳng từ mảng lồng nhau.

### Câu 5: `yield*` khác gì `yield`?

**Đáp án:** `yield` trả về **một giá trị** duy nhất. `yield*` **ủy quyền** cho một iterable khác — nó duyệt qua iterable đó và yield từng phần tử. `yield* [1,2,3]` tương đương `yield 1; yield 2; yield 3`. `yield* gen()` ủy quyền cho generator khác, cho phép **tổ hợp (compose)** nhiều generator.
