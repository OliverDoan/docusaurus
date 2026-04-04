---
sidebar_position: 8
title: "Số & Math"
---

# Số & Math

## Number trong JavaScript là gì?

**Number** là kiểu dữ liệu dùng để lưu trữ **số** trong JavaScript. Khác với nhiều ngôn ngữ khác (Java, C++), JavaScript **không phân biệt** số nguyên (integer) và số thập phân (float) — tất cả đều là `number`.

> **Ví dụ thực tế:** Trong thế giới thực, chúng ta phân biệt "2 quả táo" (số nguyên) và "1.5 kg gạo" (số thập phân). Nhưng JavaScript coi cả hai đều là cùng một loại — giống như một chiếc hộp "số" có thể chứa bất kỳ con số nào.

```js
const soNguyen = 42;        // Số nguyên
const soThapPhan = 3.14;    // Số thập phân
const soAm = -10;           // Số âm

// Tất cả đều là "number"
console.log(typeof 42);    // "number"
console.log(typeof 3.14);  // "number"
console.log(typeof -10);   // "number"
```

## Các giá trị Number đặc biệt

```js
// Infinity — vô cực
console.log(1 / 0);          // Infinity
console.log(-1 / 0);         // -Infinity
console.log(Infinity + 100); // Infinity (vô cực + bao nhiêu cũng là vô cực)

// NaN — Not a Number (Không phải số)
console.log("abc" * 2);      // NaN
console.log(undefined + 1);  // NaN
console.log(0 / 0);          // NaN

// NaN có tính chất RẤT ĐẶC BIỆT
console.log(NaN === NaN); // false — NaN không bằng chính nó!
console.log(NaN + 5);     // NaN — bất kỳ phép tính nào với NaN đều ra NaN

// Giá trị lớn nhất / nhỏ nhất
console.log(Number.MAX_SAFE_INTEGER); // 9007199254740991
console.log(Number.MIN_SAFE_INTEGER); // -9007199254740991
```

## Chuyển đổi sang Number

### parseInt — Chuyển thành số nguyên

```js
console.log(parseInt("42"));       // 42
console.log(parseInt("42.9"));     // 42 (bỏ phần thập phân)
console.log(parseInt("42abc"));    // 42 (đọc đến khi gặp ký tự không phải số)
console.log(parseInt("abc42"));    // NaN (bắt đầu bằng chữ → không chuyển được)
console.log(parseInt(""));         // NaN

// ⚠️ parseInt với hệ cơ số (radix)
console.log(parseInt("0xFF", 16)); // 255 (hệ 16 — hex)
console.log(parseInt("111", 2));   // 7 (hệ 2 — binary)
console.log(parseInt("077", 8));   // 63 (hệ 8 — octal)

// ✅ LUÔN truyền radix 10 để tránh nhầm lẫn
console.log(parseInt("077", 10));  // 77
```

### parseFloat — Chuyển thành số thập phân

```js
console.log(parseFloat("3.14"));     // 3.14
console.log(parseFloat("42"));       // 42
console.log(parseFloat("3.14abc"));  // 3.14
console.log(parseFloat("abc"));      // NaN
```

### Number() — Chuyển đổi nghiêm ngặt

```js
console.log(Number("42"));       // 42
console.log(Number("3.14"));     // 3.14
console.log(Number("42abc"));    // NaN (nghiêm ngặt hơn parseInt!)
console.log(Number(""));         // 0
console.log(Number(true));       // 1
console.log(Number(false));      // 0
console.log(Number(null));       // 0
console.log(Number(undefined));  // NaN
```

### Bảng so sánh

| Input | `parseInt` | `parseFloat` | `Number()` |
|-------|-----------|-------------|-----------|
| `"42"` | 42 | 42 | 42 |
| `"3.14"` | 3 | 3.14 | 3.14 |
| `"42abc"` | 42 | 42 | **NaN** |
| `""` | NaN | NaN | **0** |
| `true` | NaN | NaN | **1** |
| `null` | NaN | NaN | **0** |

## Kiểm tra số

```js
// isNaN — kiểm tra có phải NaN không
console.log(isNaN(NaN));       // true
console.log(isNaN("abc"));     // true (ép kiểu rồi kiểm tra)
console.log(isNaN("123"));     // false

// Number.isNaN — nghiêm ngặt hơn (KHUYÊN DÙNG)
console.log(Number.isNaN(NaN));     // true
console.log(Number.isNaN("abc"));   // false (không ép kiểu!)
console.log(Number.isNaN("123"));   // false

// isFinite — kiểm tra có phải số hữu hạn
console.log(isFinite(42));        // true
console.log(isFinite(Infinity));  // false
console.log(isFinite(NaN));       // false

// Number.isInteger — kiểm tra số nguyên
console.log(Number.isInteger(42));    // true
console.log(Number.isInteger(42.0));  // true (42.0 === 42)
console.log(Number.isInteger(42.5));  // false
```

## Định dạng số

### toFixed — Làm tròn đến N chữ số thập phân

```js
const price = 19.99876;

console.log(price.toFixed(2));  // "19.99" — trả về STRING!
console.log(price.toFixed(0));  // "20"
console.log(price.toFixed(4));  // "19.9988"

// ⚠️ toFixed trả về STRING, không phải number
const formatted = price.toFixed(2);
console.log(typeof formatted); // "string"

// ✅ Chuyển lại thành number nếu cần tính toán
const num = Number(price.toFixed(2)); // 19.99
const num2 = +price.toFixed(2);       // 19.99 (dùng + unary)
```

### toLocaleString — Format theo locale

```js
const bigNumber = 1234567.89;

// Format theo tiếng Việt
console.log(bigNumber.toLocaleString("vi-VN"));
// "1.234.567,89"

// Format tiền tệ
console.log(bigNumber.toLocaleString("vi-VN", {
  style: "currency",
  currency: "VND"
}));
// "1.234.567,89 ₫"

console.log(bigNumber.toLocaleString("en-US", {
  style: "currency",
  currency: "USD"
}));
// "$1,234,567.89"
```

## Math Object

`Math` là object có sẵn trong JavaScript, chứa các hàm toán học phổ biến:

### Làm tròn số

```js
// Math.round — làm tròn bình thường (>=.5 làm tròn lên)
console.log(Math.round(4.5));  // 5
console.log(Math.round(4.4));  // 4
console.log(Math.round(-4.5)); // -4 (làm tròn về phía 0)

// Math.ceil — làm tròn LÊN (ceiling = trần nhà)
console.log(Math.ceil(4.1));   // 5
console.log(Math.ceil(4.9));   // 5
console.log(Math.ceil(-4.1));  // -4

// Math.floor — làm tròn XUỐNG (floor = sàn nhà)
console.log(Math.floor(4.1));  // 4
console.log(Math.floor(4.9));  // 4
console.log(Math.floor(-4.1)); // -5

// Math.trunc — cắt bỏ phần thập phân (ES6)
console.log(Math.trunc(4.9));  // 4
console.log(Math.trunc(-4.9)); // -4 (khác floor!)
```

> **Mẹo nhớ:** `ceil` = trần nhà (lên trên), `floor` = sàn nhà (xuống dưới), `trunc` = cắt (truncate).

### Tìm giá trị lớn nhất / nhỏ nhất

```js
console.log(Math.max(1, 5, 3, 9, 2));  // 9
console.log(Math.min(1, 5, 3, 9, 2));  // 1

// Dùng với mảng — spread operator
const scores = [85, 92, 78, 96, 88];
console.log(Math.max(...scores)); // 96
console.log(Math.min(...scores)); // 78
```

### Giá trị tuyệt đối và lũy thừa

```js
// Math.abs — giá trị tuyệt đối
console.log(Math.abs(-5));   // 5
console.log(Math.abs(5));    // 5

// Math.pow — lũy thừa
console.log(Math.pow(2, 3)); // 8 (2^3)
console.log(2 ** 3);         // 8 (toán tử ** tương đương)

// Math.sqrt — căn bậc hai
console.log(Math.sqrt(9));   // 3
console.log(Math.sqrt(2));   // 1.4142135623730951
```

### Math.random() — Số ngẫu nhiên

```js
// Math.random() trả về số từ 0 (inclusive) đến 1 (exclusive)
console.log(Math.random()); // 0.7342589... (mỗi lần khác nhau)

// Số ngẫu nhiên từ 0 đến N-1 (số nguyên)
function randomInt(max) {
  return Math.floor(Math.random() * max);
}
console.log(randomInt(10)); // 0-9

// Số ngẫu nhiên trong khoảng [min, max] (bao gồm cả hai đầu)
function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
console.log(randomRange(1, 6));   // 1-6 (gieo xúc xắc)
console.log(randomRange(10, 20)); // 10-20

// Chọn ngẫu nhiên từ mảng
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
const fruits = ["Táo", "Cam", "Xoài", "Chuối"];
console.log(randomItem(fruits)); // Random: "Táo" hoặc "Cam" hoặc...
```

## Floating Point: 0.1 + 0.2 !== 0.3

Đây là vấn đề nổi tiếng nhất của JavaScript (và hầu hết ngôn ngữ lập trình):

```js
console.log(0.1 + 0.2);         // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3); // false!
```

### Tại sao?

Máy tính lưu số thập phân dưới dạng **nhị phân** (binary). Giống như 1/3 = 0.333... không thể biểu diễn chính xác trong hệ thập phân, số 0.1 và 0.2 **không thể biểu diễn chính xác** trong hệ nhị phân → sinh ra sai số rất nhỏ.

### Cách xử lý

```js
// ❌ So sánh trực tiếp
if (0.1 + 0.2 === 0.3) {
  // Không bao giờ chạy!
}

// ✅ Cách 1: So sánh với sai số nhỏ (epsilon)
const EPSILON = Number.EPSILON; // 2.220446049250313e-16
if (Math.abs(0.1 + 0.2 - 0.3) < EPSILON) {
  console.log("Gần bằng nhau!"); // Chạy!
}

// ✅ Cách 2: Làm tròn trước khi so sánh
if ((0.1 + 0.2).toFixed(1) === (0.3).toFixed(1)) {
  console.log("Bằng nhau!"); // Chạy!
}

// ✅ Cách 3: Tính bằng số nguyên (phổ biến nhất cho tiền tệ)
// Thay vì 0.1 + 0.2, tính 10 + 20 (đơn vị: xu/cent)
const priceInCents = 10 + 20; // 30
const priceInDollars = priceInCents / 100; // 0.3 — chính xác!
```

## Lỗi thường gặp

### 1. Quên rằng toFixed trả về string

```js
// ❌ Tính toán với kết quả toFixed
const price = 19.99;
const tax = 1.5;
const total = price.toFixed(2) + tax.toFixed(2);
console.log(total); // "19.991.50" — nối chuỗi!

// ✅ Chuyển về number trước
const total = Number(price.toFixed(2)) + Number(tax.toFixed(2));
console.log(total); // 21.49

// ✅ Hoặc tính xong rồi mới format
const total = (price + tax).toFixed(2);
console.log(total); // "21.49"
```

### 2. parseInt không có radix

```js
// ❌ Thiếu radix — kết quả có thể bất ngờ
console.log(parseInt("08")); // 8 (OK trong browser hiện đại, nhưng...)
// Một số engine cũ có thể hiểu "08" là octal → kết quả 0

// ✅ Luôn truyền radix
console.log(parseInt("08", 10)); // 8 — luôn đúng
```

### 3. Kiểm tra NaN sai cách

```js
const result = parseInt("abc");

// ❌ Sai: NaN không bằng chính nó!
if (result === NaN) {
  console.log("Không phải số"); // KHÔNG BAO GIỜ chạy!
}

// ✅ Đúng: dùng Number.isNaN
if (Number.isNaN(result)) {
  console.log("Không phải số"); // Chạy!
}

// ✅ Hoặc dùng isNaN (nhưng cẩn thận — isNaN ép kiểu)
if (isNaN(result)) {
  console.log("Không phải số"); // Chạy!
}
```

### 4. So sánh số thập phân

```js
// ❌ So sánh trực tiếp số thập phân
const a = 0.1 + 0.2;
const b = 0.3;
if (a === b) {
  // Không chạy!
}

// ✅ Dùng epsilon hoặc tính bằng số nguyên
if (Math.abs(a - b) < Number.EPSILON) {
  console.log("Bằng nhau!");
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: NaN === NaN trả về gì? Tại sao?

**Đáp án:**

`NaN === NaN` trả về **`false`**.

NaN (Not a Number) là giá trị **duy nhất trong JavaScript không bằng chính nó**. Đây là theo tiêu chuẩn **IEEE 754** (tiêu chuẩn số thực dấu phẩy động) — NaN đại diện cho "kết quả không xác định", và hai kết quả không xác định không nhất thiết giống nhau.

```js
console.log(NaN === NaN);  // false
console.log(NaN == NaN);   // false
console.log(NaN !== NaN);  // true — cách duy nhất dùng !== mà kết quả true!

// Cách kiểm tra NaN đúng
console.log(Number.isNaN(NaN));       // true
console.log(Object.is(NaN, NaN));     // true (ES6)

// isNaN vs Number.isNaN
console.log(isNaN("abc"));           // true (ép kiểu "abc" → NaN)
console.log(Number.isNaN("abc"));    // false (không ép kiểu)
```

### Câu 2: typeof NaN trả về gì?

**Đáp án:**

`typeof NaN` trả về **`"number"`** — dù tên là "Not a Number"!

```js
console.log(typeof NaN); // "number"
```

Nghe vô lý nhưng hợp lý: NaN là **kết quả** của phép toán số học thất bại. Nó vẫn thuộc kiểu `number` trong hệ thống kiểu của JavaScript, chỉ là giá trị đặc biệt biểu thị "kết quả không hợp lệ".

Tương tự: `Infinity` và `-Infinity` cũng có `typeof` là `"number"`.

### Câu 3: Viết hàm tạo số ngẫu nhiên trong khoảng [min, max]?

**Đáp án:**

```js
// Số nguyên ngẫu nhiên trong khoảng [min, max] (bao gồm cả min và max)
function getRandomInt(min, max) {
  // Math.random() trả về [0, 1)
  // Math.random() * (max - min + 1) trả về [0, max - min + 1)
  // Math.floor(...) trả về [0, max - min]
  // + min trả về [min, max]
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

console.log(getRandomInt(1, 6));   // 1, 2, 3, 4, 5, hoặc 6
console.log(getRandomInt(10, 20)); // 10 đến 20

// Số thập phân ngẫu nhiên trong khoảng [min, max)
function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

console.log(getRandomFloat(1.5, 3.5)); // Ví dụ: 2.7341...
```

Giải thích công thức:
- `Math.random()` cho [0, 1)
- Nhân với `(max - min + 1)` để mở rộng range
- `Math.floor` để lấy số nguyên
- `+ min` để dịch chuyển về đúng khoảng

### Câu 4: Tại sao 0.1 + 0.2 !== 0.3? Cách xử lý?

**Đáp án:**

Máy tính lưu số thập phân dưới dạng **nhị phân (binary floating-point)** theo tiêu chuẩn IEEE 754. Các số như 0.1 và 0.2 **không thể biểu diễn chính xác** trong hệ nhị phân (giống như 1/3 = 0.333... không chính xác trong hệ thập phân).

```js
console.log(0.1 + 0.2);         // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3); // false
```

Cách xử lý:

```js
// 1. Epsilon comparison (so sánh gần đúng)
function nearlyEqual(a, b) {
  return Math.abs(a - b) < Number.EPSILON;
}
console.log(nearlyEqual(0.1 + 0.2, 0.3)); // true

// 2. Tính bằng số nguyên (tốt nhất cho tiền tệ)
// Lưu giá trị bằng đơn vị nhỏ nhất (xu, cent, đồng)
const priceA = 1000;  // 10.00 đô = 1000 cent
const priceB = 2000;  // 20.00 đô = 2000 cent
const total = priceA + priceB; // 3000 cent = 30.00 đô — chính xác!

// 3. Thư viện chuyên dụng (production)
// - decimal.js
// - big.js
// - dinero.js (cho tiền tệ)
```

### Câu 5: Sự khác nhau giữa parseInt, parseFloat và Number()?

**Đáp án:**

| | `parseInt(str, radix)` | `parseFloat(str)` | `Number(str)` |
|---|----------------------|-------------------|---------------|
| **Cách hoạt động** | Đọc từ đầu, dừng khi gặp ký tự không hợp lệ | Giống parseInt nhưng giữ phần thập phân | Chuyển đổi **toàn bộ** chuỗi |
| **"42abc"** | 42 | 42 | **NaN** |
| **"3.14"** | 3 | 3.14 | 3.14 |
| **""** | NaN | NaN | **0** |
| **true** | NaN | NaN | **1** |
| **null** | NaN | NaN | **0** |
| **Hỗ trợ radix** | Có | Không | Không |

```js
// parseInt: "đọc lấy số" từ đầu chuỗi
console.log(parseInt("42px", 10)); // 42 — hữu ích khi parse CSS

// parseFloat: giống parseInt nhưng giữ phần thập phân
console.log(parseFloat("3.14em")); // 3.14

// Number: nghiêm ngặt — toàn bộ chuỗi phải là số
console.log(Number("42px")); // NaN
```

**Khi nào dùng:**
- `parseInt/parseFloat`: Khi chuỗi **bắt đầu** bằng số nhưng có text phía sau (ví dụ: CSS values `"100px"`, `"3.14em"`)
- `Number()`: Khi muốn **chuyển đổi chính xác** — nếu chuỗi không hoàn toàn là số thì trả NaN
