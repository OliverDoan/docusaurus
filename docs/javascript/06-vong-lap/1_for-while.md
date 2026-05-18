---
sidebar_position: 1
title: "1. Vòng lặp (for, while, do...while)"
---

# Vòng lặp


---

## Mục lục

- [Vòng lặp là gì?](#vòng-lặp-là-gì)
- [Tại sao có nhiều loại vòng lặp?](#tại-sao-có-nhiều-loại-vòng-lặp)
- [Cách sử dụng](#cách-sử-dụng)
- [break và continue](#break-và-continue)
- [Khi nào dùng loại nào?](#khi-nào-dùng-loại-nào)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vòng lặp là gì?

**Vòng lặp** (loop) cho phép chương trình **lặp lại** một đoạn code nhiều lần mà không cần viết lại.

> **Ví dụ thực tế:** Giống như khi bạn rửa 10 cái bát — bạn không cần 10 hướng dẫn riêng biệt. Chỉ cần 1 hướng dẫn: "**Lặp lại** thao tác rửa bát cho đến khi hết bát." Đó chính là vòng lặp.

```js
// Không có vòng lặp — phải viết lặp lại
console.log("Lần 1");
console.log("Lần 2");
console.log("Lần 3");
console.log("Lần 4");
console.log("Lần 5");

// Có vòng lặp — gọn gàng
for (let i = 1; i <= 5; i++) {
  console.log(`Lần ${i}`);
}
```

## Tại sao có nhiều loại vòng lặp?

Mỗi loại vòng lặp phù hợp với một tình huống khác nhau. JavaScript có nhiều loại vì ngôn ngữ đã phát triển qua nhiều phiên bản, mỗi phiên bản bổ sung vòng lặp mới để giải quyết hạn chế của vòng lặp cũ.

## Cách sử dụng

### for — Vòng lặp cơ bản nhất

Dùng khi bạn **biết trước** số lần lặp:

```js
// Cú pháp: for (khởi tạo; điều kiện; bước nhảy)
for (let i = 0; i < 5; i++) {
  console.log(`Lần lặp thứ ${i}`);
}
// Lần lặp thứ 0
// Lần lặp thứ 1
// Lần lặp thứ 2
// Lần lặp thứ 3
// Lần lặp thứ 4

// Ví dụ: In bảng cửu chương 5
for (let i = 1; i <= 10; i++) {
  console.log(`5 x ${i} = ${5 * i}`);
}

// Lặp ngược
for (let i = 10; i >= 1; i--) {
  console.log(i); // Đếm ngược: 10, 9, 8, ..., 1
}
```

### while — Lặp khi điều kiện còn đúng

Dùng khi bạn **không biết trước** số lần lặp:

```js
// Cú pháp: while (điều kiện) { ... }
let password = "";

// Hỏi mật khẩu cho đến khi đúng
while (password !== "12345") {
  password = prompt("Nhập mật khẩu:");
}
console.log("Đăng nhập thành công!");

// Ví dụ: Chia đôi cho đến khi nhỏ hơn 1
let number = 100;
let count = 0;
while (number >= 1) {
  number = number / 2;
  count++;
}
console.log(`Chia ${count} lần`); // "Chia 7 lần"
```

### do...while — Chạy ít nhất 1 lần

Giống `while` nhưng **kiểm tra điều kiện SAU** khi chạy:

```js
// Cú pháp: do { ... } while (điều kiện)
let input;

// Luôn hỏi ít nhất 1 lần, sau đó lặp lại nếu input rỗng
do {
  input = prompt("Nhập tên của bạn (không để trống):");
} while (!input);

console.log(`Xin chào ${input}!`);
```

### So sánh while vs do...while

```js
// while — có thể không chạy lần nào
let x = 10;
while (x < 5) {
  console.log(x); // KHÔNG chạy! Vì 10 < 5 là false ngay từ đầu
  x++;
}

// do...while — luôn chạy ít nhất 1 lần
let y = 10;
do {
  console.log(y); // Chạy 1 lần: in ra 10
  y++;
} while (y < 5);
```

### for...in — Lặp qua KEY của object

Dùng để lặp qua **tên thuộc tính** (keys) của object:

```js
const student = {
  name: "Thuan",
  age: 25,
  class: "CNTT"
};

for (const key in student) {
  console.log(`${key}: ${student[key]}`);
}
// name: Thuan
// age: 25
// class: CNTT
```

> **Cảnh báo:** `for...in` cũng lặp qua các thuộc tính kế thừa từ prototype. Dùng `hasOwnProperty` để lọc:

```js
for (const key in student) {
  if (student.hasOwnProperty(key)) {
    console.log(`${key}: ${student[key]}`);
  }
}
```

### for...of — Lặp qua VALUE (ES6)

**Tại sao for...of ra đời?** `for...in` được thiết kế cho object nhưng nhiều người dùng nhầm cho array (lặp qua index thay vì value). ES6 (2015) tạo ra `for...of` để lặp qua **giá trị** của các iterable (array, string, Map, Set...).

```js
const fruits = ["Táo", "Cam", "Xoài"];

// for...of — lặp qua VALUE (khuyên dùng cho array)
for (const fruit of fruits) {
  console.log(fruit);
}
// Táo
// Cam
// Xoài

// Lặp qua string
const name = "Thuan";
for (const char of name) {
  console.log(char); // T, h, u, a, n
}

// Lặp qua Map
const scores = new Map([
  ["Toán", 9],
  ["Lý", 8],
  ["Hóa", 7]
]);

for (const [subject, score] of scores) {
  console.log(`${subject}: ${score}`);
}
```

### Bảng so sánh for...in vs for...of

| | `for...in` | `for...of` |
|---|-----------|-----------|
| **Lặp qua** | Keys (tên thuộc tính) | Values (giá trị) |
| **Dùng cho** | Object | Array, String, Map, Set |
| **Ra đời** | ES1 (1997) | ES6 (2015) |
| **Prototype** | Lặp cả thuộc tính kế thừa | Không |

```js
const arr = ["a", "b", "c"];

// for...in — lặp qua INDEX (key)
for (const index in arr) {
  console.log(index); // "0", "1", "2" (string!)
}

// for...of — lặp qua VALUE
for (const value of arr) {
  console.log(value); // "a", "b", "c"
}
```

## break và continue

### break — Thoát vòng lặp ngay lập tức

```js
// Tìm số chia hết cho 7 đầu tiên trong khoảng 1-100
for (let i = 1; i <= 100; i++) {
  if (i % 7 === 0) {
    console.log(`Tìm thấy: ${i}`); // "Tìm thấy: 7"
    break; // Thoát ngay, không lặp tiếp
  }
}
```

### continue — Bỏ qua lần lặp hiện tại

```js
// In các số từ 1-10, BỎ QUA số chẵn
for (let i = 1; i <= 10; i++) {
  if (i % 2 === 0) {
    continue; // Bỏ qua, nhảy đến lần lặp kế tiếp
  }
  console.log(i); // 1, 3, 5, 7, 9
}
```

## Khi nào dùng loại nào?

| Tình huống | Nên dùng |
|-----------|----------|
| Biết trước số lần lặp | `for` |
| Không biết trước, lặp theo điều kiện | `while` |
| Cần chạy ít nhất 1 lần | `do...while` |
| Lặp qua thuộc tính object | `for...in` |
| Lặp qua phần tử array/string | `for...of` |
| Biến đổi array (map, filter, reduce) | Array methods (bài sau) |

## Lỗi thường gặp

### 1. Vòng lặp vô hạn (Infinite loop)

```js
// ❌ Quên tăng biến đếm — vòng lặp chạy mãi!
let i = 0;
while (i < 10) {
  console.log(i);
  // Quên i++ → i luôn = 0 → điều kiện luôn true → loop vô hạn!
}

// ✅ Luôn nhớ cập nhật biến điều kiện
let i = 0;
while (i < 10) {
  console.log(i);
  i++; // Quan trọng!
}

// ❌ Điều kiện luôn true
for (let i = 0; i >= 0; i++) {
  // i luôn >= 0 vì i tăng dần → vòng lặp vô hạn!
}
```

### 2. Off-by-one error (Sai 1 đơn vị)

```js
const arr = ["a", "b", "c"]; // length = 3, index: 0, 1, 2

// ❌ Dùng <= thay vì < → truy cập index không tồn tại
for (let i = 0; i <= arr.length; i++) {
  console.log(arr[i]); // i=3 → arr[3] = undefined
}

// ✅ Dùng < (index từ 0 đến length-1)
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i]); // "a", "b", "c"
}

// ✅ Hoặc dùng for...of (không cần lo index)
for (const item of arr) {
  console.log(item);
}
```

### 3. Dùng for...in cho array

```js
const arr = [10, 20, 30];
arr.customProp = "test"; // Thêm thuộc tính vào array

// ❌ for...in lặp cả thuộc tính custom
for (const key in arr) {
  console.log(key); // "0", "1", "2", "customProp" — có thêm "customProp"!
}

// ✅ for...of chỉ lặp qua giá trị
for (const value of arr) {
  console.log(value); // 10, 20, 30
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: Sự khác nhau giữa for...in và for...of?

**Đáp án:**

| | `for...in` | `for...of` |
|---|-----------|-----------|
| **Lặp qua** | **Keys** (tên thuộc tính / index) | **Values** (giá trị) |
| **Kiểu trả về key** | Luôn là **string** | Giá trị gốc |
| **Dùng cho** | Object | Iterables (Array, String, Map, Set) |
| **Prototype** | Lặp cả thuộc tính kế thừa | Không |
| **Khi dùng cho array** | Lặp qua **index** (dạng string) | Lặp qua **value** |

```js
const arr = ["a", "b", "c"];

for (const x in arr) {
  console.log(typeof x, x); // "string" "0", "string" "1", "string" "2"
}

for (const x of arr) {
  console.log(typeof x, x); // "string" "a", "string" "b", "string" "c"
}

// for...of KHÔNG dùng được cho plain object
const obj = { a: 1 };
// for (const x of obj) {} // ❌ TypeError: obj is not iterable
```

### Câu 2: Khi nào dùng while thay vì for?

**Đáp án:**

Dùng `while` khi **không biết trước số lần lặp** — vòng lặp phụ thuộc vào điều kiện thay đổi runtime:

```js
// ✅ while phù hợp — không biết trước khi nào user nhập đúng
let guess;
while (guess !== secretNumber) {
  guess = getInput();
}

// ✅ while phù hợp — đọc dữ liệu đến khi hết
while (hasMoreData()) {
  const data = readNext();
  process(data);
}

// ✅ for phù hợp — biết trước lặp 10 lần
for (let i = 0; i < 10; i++) {
  doSomething(i);
}
```

**Quy tắc:** Nếu có **biến đếm** và **biết trước khi nào dừng** → dùng `for`. Nếu **phụ thuộc vào điều kiện** bên ngoài → dùng `while`.

### Câu 3: Output của đoạn code sau là gì?

```js
for (let i = 0; i < 5; i++) {
  if (i === 3) continue;
  if (i === 4) break;
  console.log(i);
}
```

**Đáp án:**

```
0
1
2
```

Giải thích từng bước:
- `i = 0`: Không match continue/break → in `0`
- `i = 1`: Không match → in `1`
- `i = 2`: Không match → in `2`
- `i = 3`: Match `continue` → **bỏ qua** `console.log`, nhảy đến `i = 4`
- `i = 4`: Match `break` → **thoát vòng lặp** ngay lập tức

### Câu 4: Làm thế nào để lặp qua object bằng for...of?

**Đáp án:**

`for...of` không trực tiếp dùng được cho plain object vì object không phải iterable. Nhưng có thể dùng `Object.keys()`, `Object.values()`, hoặc `Object.entries()`:

```js
const user = { name: "Thuan", age: 25, city: "HCM" };

// Lặp qua keys
for (const key of Object.keys(user)) {
  console.log(key); // "name", "age", "city"
}

// Lặp qua values
for (const value of Object.values(user)) {
  console.log(value); // "Thuan", 25, "HCM"
}

// Lặp qua cặp [key, value] — phổ biến nhất
for (const [key, value] of Object.entries(user)) {
  console.log(`${key}: ${value}`);
}
// name: Thuan
// age: 25
// city: HCM
```
