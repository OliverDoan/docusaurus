---
sidebar_position: 1
title: "1. Biến (var, let, const)"
---

# Biến (var, let, const)


---

## Mục lục

- [Biến là gì?](#biến-là-gì)
- [Ba cách khai báo biến: var, let, const](#ba-cách-khai-báo-biến-var-let-const)
- [Tại sao let và const ra đời?](#tại-sao-let-và-const-ra-đời)
- [Cách sử dụng](#cách-sử-dụng)
- [Hoisting (Kéo lên)](#hoisting-kéo-lên)
- [Khi nào dùng?](#khi-nào-dùng)
- [Quy tắc đặt tên biến](#quy-tắc-đặt-tên-biến)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Biến là gì?

**Biến** (variable) là một "hộp chứa" dùng để **lưu trữ dữ liệu** trong chương trình. Mỗi biến có một **tên** và một **giá trị**.

> **Ví dụ thực tế:** Biến giống như một chiếc hộp có dán nhãn. Nhãn là tên biến, đồ bên trong là giá trị. Hộp có nhãn "tuoi" chứa số 25, hộp có nhãn "ten" chứa chữ "Thuan".

```js
// Tạo biến tên "ten" và gán giá trị "Thuan"
let ten = "Thuan";

// Tạo biến tên "tuoi" và gán giá trị 25
let tuoi = 25;

// Sử dụng biến
console.log(ten);  // "Thuan"
console.log(tuoi); // 25
```

## Ba cách khai báo biến: var, let, const

JavaScript có **3 từ khóa** để khai báo biến:

```js
var tenCu = "dùng từ 1995";     // Cách cũ (tránh dùng)
let tenMoi = "dùng từ ES6";     // Cách mới cho biến thay đổi được
const TEN_CO_DINH = "không đổi"; // Cách mới cho hằng số
```

## Tại sao let và const ra đời?

### Vấn đề của var

`var` có nhiều hành vi **khó đoán** khiến lập trình viên thường gặp bug:

```js
// ❌ Vấn đề 1: var không có block scope
if (true) {
  var x = 10;
}
console.log(x); // 10 — vẫn truy cập được bên ngoài if! Nguy hiểm!

// ✅ let có block scope — an toàn hơn
if (true) {
  let y = 10;
}
console.log(y); // Lỗi! y không tồn tại bên ngoài if
```

```js
// ❌ Vấn đề 2: var cho phép khai báo lại
var name = "Thuan";
var name = "Khác";  // Không báo lỗi — dễ ghi đè nhầm!

// ✅ let không cho khai báo lại
let name = "Thuan";
let name = "Khác";  // Lỗi! Đã khai báo rồi
```

### ES6 (2015) giải quyết

Năm 2015, phiên bản **ES6** ra đời, mang theo `let` và `const` để khắc phục các vấn đề của `var`:

- `let` — có **block scope**, không cho khai báo lại
- `const` — giống `let` nhưng **không cho gán lại giá trị**

## Cách sử dụng

### var — Function scope (phạm vi hàm)

```js
function demoVar() {
  var x = 1;

  if (true) {
    var x = 2;     // Cùng biến x! (function scope)
    console.log(x); // 2
  }

  console.log(x);   // 2 — bị thay đổi bởi if block!
}
```

### let — Block scope (phạm vi khối)

```js
function demoLet() {
  let x = 1;

  if (true) {
    let x = 2;     // Biến x KHÁC! (block scope)
    console.log(x); // 2
  }

  console.log(x);   // 1 — không bị ảnh hưởng
}
```

### const — Block scope + không gán lại được

```js
const PI = 3.14159;
PI = 3.14; // ❌ Lỗi! Không thể gán lại giá trị cho const

const TEN = "Thuan";
TEN = "Khác"; // ❌ Lỗi!

// ⚠️ CHÚ Ý: const với object/array vẫn có thể thay đổi thuộc tính bên trong
const user = { name: "Thuan", age: 25 };
user.age = 26;          // ✅ Được! Thay đổi thuộc tính bên trong
user = { name: "Khác" }; // ❌ Lỗi! Không thể gán lại biến user
```

> **Ví dụ thực tế:** `const` giống như một chiếc hộp bị **dán keo** — bạn không thể thay hộp khác, nhưng vẫn có thể thay đồ bên trong hộp (nếu hộp chứa object/array).

## Hoisting (Kéo lên)

**Hoisting** là hành vi của JavaScript khi nó "kéo" khai báo biến lên đầu phạm vi trước khi thực thi code.

### var — Hoisted với giá trị undefined

```js
console.log(x); // undefined (không lỗi, nhưng chưa có giá trị)
var x = 5;
console.log(x); // 5

// JavaScript hiểu code trên như thế này:
// var x;            ← khai báo được "kéo lên" đầu
// console.log(x);   ← undefined
// x = 5;            ← gán giá trị tại vị trí gốc
// console.log(x);   ← 5
```

### let/const — Hoisted nhưng trong Temporal Dead Zone (TDZ)

```js
console.log(y); // ❌ ReferenceError! Không thể truy cập trước khi khai báo
let y = 5;

console.log(z); // ❌ ReferenceError!
const z = 10;
```

> **Temporal Dead Zone (TDZ)** là khoảng thời gian từ đầu block đến dòng khai báo `let`/`const`. Trong khoảng này, biến tồn tại nhưng **không thể truy cập**.

### Bảng so sánh hoisting

| Từ khóa | Hoisted? | Giá trị trước khai báo | TDZ? |
|---------|----------|------------------------|------|
| `var` | Có | `undefined` | Không |
| `let` | Có | Không truy cập được | Có |
| `const` | Có | Không truy cập được | Có |

## Khi nào dùng?

### Quy tắc vàng

```
1. Mặc định luôn dùng const
2. Chỉ dùng let khi CẦN gán lại giá trị
3. KHÔNG BAO GIỜ dùng var
```

```js
// ✅ const — giá trị không thay đổi
const API_URL = "https://api.example.com";
const MAX_RETRY = 3;
const user = { name: "Thuan" }; // Object có thể thay đổi thuộc tính

// ✅ let — giá trị cần thay đổi
let count = 0;
count = count + 1;  // Cần gán lại

let isLoggedIn = false;
isLoggedIn = true;  // Cần gán lại

// Vòng lặp cần let
for (let i = 0; i < 10; i++) {
  console.log(i);
}

// ❌ var — TRÁNH dùng trong code mới
var oldStyle = "đừng dùng nữa";
```

## Quy tắc đặt tên biến

```js
// ✅ Tên hợp lệ
let userName = "Thuan";     // camelCase (khuyên dùng)
let _private = true;        // Bắt đầu bằng dấu gạch dưới
let $element = "div";       // Bắt đầu bằng $
let soLuong = 5;            // Tiếng Việt không dấu

// ❌ Tên KHÔNG hợp lệ
let 1user = "Thuan";        // Không được bắt đầu bằng số
let user-name = "Thuan";    // Không được dùng dấu gạch ngang
let let = "value";          // Không được dùng từ khóa

// ✅ Quy ước đặt tên
const MAX_SIZE = 100;       // UPPER_CASE cho hằng số
let firstName = "Thuan";    // camelCase cho biến
let isActive = true;        // Prefix "is" cho boolean
let hasPermission = false;  // Prefix "has" cho boolean
```

## Lỗi thường gặp

### 1. Dùng var trong vòng lặp

```js
// ❌ Sai: var trong vòng lặp async
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i); // In ra: 3, 3, 3 (không phải 0, 1, 2!)
  }, 1000);
}

// ✅ Đúng: let trong vòng lặp
for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i); // In ra: 0, 1, 2 ✓
  }, 1000);
}
```

### 2. Nghĩ const là "không thay đổi được"

```js
// ❌ Hiểu sai: const nghĩa là hoàn toàn bất biến
const arr = [1, 2, 3];
arr.push(4);        // ✅ Được! arr = [1, 2, 3, 4]
arr[0] = 99;        // ✅ Được! arr = [99, 2, 3, 4]
arr = [5, 6];       // ❌ Lỗi! Không thể gán lại biến arr

// const chỉ ngăn GÁN LẠI biến, không ngăn thay đổi NỘI DUNG bên trong
```

### 3. Quên khai báo biến

```js
// ❌ Sai: Không khai báo → tạo biến global (rất nguy hiểm!)
function demo() {
  x = 10; // Tạo biến global! Ảnh hưởng toàn bộ chương trình
}

// ✅ Đúng: Luôn khai báo biến
function demo() {
  const x = 10; // Chỉ tồn tại trong hàm
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: Sự khác nhau giữa var, let và const?

**Đáp án:**

| Đặc điểm | `var` | `let` | `const` |
|-----------|-------|-------|---------|
| **Scope** | Function scope | Block scope | Block scope |
| **Hoisting** | Có (undefined) | Có (TDZ) | Có (TDZ) |
| **Khai báo lại** | Được | Không | Không |
| **Gán lại giá trị** | Được | Được | Không |
| **Ra đời** | ES1 (1997) | ES6 (2015) | ES6 (2015) |

```js
// Minh họa sự khác nhau
var a = 1;
var a = 2;    // ✅ Được

let b = 1;
// let b = 2; // ❌ SyntaxError

const c = 1;
// c = 2;     // ❌ TypeError
```

### Câu 2: Temporal Dead Zone (TDZ) là gì?

**Đáp án:**

TDZ là khoảng thời gian từ **đầu block scope** đến **dòng khai báo** `let`/`const`. Trong khoảng này, biến tồn tại (đã được hoisted) nhưng **không thể truy cập** — nếu cố truy cập sẽ nhận `ReferenceError`.

```js
{
  // ---- TDZ bắt đầu cho biến `name` ----
  console.log(name); // ❌ ReferenceError (đang trong TDZ)
  // ---- TDZ kết thúc ----
  let name = "Thuan"; // Khai báo tại đây → TDZ kết thúc
  console.log(name);  // ✅ "Thuan"
}
```

TDZ giúp phát hiện bug sớm — nếu bạn dùng biến trước khi khai báo, JS sẽ báo lỗi ngay thay vì trả về `undefined` như `var`.

### Câu 3: Tại sao const object vẫn thay đổi được thuộc tính?

**Đáp án:**

`const` ngăn **gán lại tham chiếu** (reassignment), không ngăn **thay đổi nội dung** (mutation).

Khi bạn khai báo `const obj = { a: 1 }`, biến `obj` lưu **địa chỉ** (tham chiếu) đến object trong bộ nhớ. `const` chỉ khóa địa chỉ đó, không khóa nội dung tại địa chỉ.

```js
const user = { name: "Thuan", age: 25 };

// Thay đổi nội dung (mutation) → OK
user.age = 26;        // ✅ Thay đổi thuộc tính
user.email = "a@b.c"; // ✅ Thêm thuộc tính mới

// Gán lại tham chiếu (reassignment) → LỖI
user = { name: "Khác" }; // ❌ TypeError

// Nếu muốn object hoàn toàn bất biến:
const frozenUser = Object.freeze({ name: "Thuan", age: 25 });
frozenUser.age = 26; // Không có lỗi nhưng giá trị KHÔNG thay đổi
console.log(frozenUser.age); // 25
```

### Câu 4: Output của đoạn code sau là gì?

```js
console.log(a);
console.log(b);
var a = 1;
let b = 2;
```

**Đáp án:**

- `console.log(a)` → `undefined` (var được hoisted với giá trị undefined)
- `console.log(b)` → **ReferenceError** (let được hoisted nhưng nằm trong TDZ, không thể truy cập)

Code sẽ **dừng lại** tại dòng thứ 2 với lỗi `ReferenceError: Cannot access 'b' before initialization`.

### Câu 5: var trong vòng lặp setTimeout cho kết quả gì?

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
```

**Đáp án:**

Kết quả: `3, 3, 3` (không phải `0, 1, 2`).

Giải thích: `var` có function scope, nên chỉ có **một biến `i` duy nhất** cho cả vòng lặp. Khi `setTimeout` callback chạy (sau 100ms), vòng lặp đã kết thúc và `i = 3`.

Sửa bằng `let` (mỗi vòng lặp tạo biến `i` riêng):

```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Kết quả: 0, 1, 2 ✓
```
