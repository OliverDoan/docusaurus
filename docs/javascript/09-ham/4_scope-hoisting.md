---
sidebar_position: 4
title: "4. Scope & Hoisting"
---

# Scope & Hoisting


---

## Mục lục

- [Scope là gì?](#scope-là-gì)
- [Tại sao cần hiểu Scope?](#tại-sao-cần-hiểu-scope)
- [Các loại Scope](#các-loại-scope)
- [Scope Chain (Chuỗi Scope)](#scope-chain-chuỗi-scope)
- [Hoisting](#hoisting)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Scope là gì?

Scope (phạm vi) là **vùng mà biến có thể được nhìn thấy và sử dụng**. Biến khai báo trong scope nào thì chỉ "sống" trong scope đó.

**Ví dụ thực tế:** Hãy tưởng tượng **ngôi nhà có nhiều phòng**:
- **Phòng khách** (global scope): Ai cũng vào được, đồ vật ai cũng thấy
- **Phòng ngủ** (function scope): Chỉ người trong phòng mới thấy đồ vật
- **Ngăn tủ** (block scope): Chỉ mở ngăn tủ mới thấy đồ bên trong

```
🏠 Ngôi nhà (Global Scope)
├── TV (biến global — ai cũng thấy)
├── 🚪 Phòng ngủ (Function Scope)
│   ├── Gối (biến local — chỉ trong phòng mới thấy)
│   └── 🗄️ Ngăn tủ (Block Scope)
│       └── Nhật ký (biến block — chỉ mở tủ mới thấy)
└── 🚪 Phòng bếp (Function Scope khác)
    └── Nồi cơm (biến local — chỉ trong bếp mới thấy)
```

## Tại sao cần hiểu Scope?

Không hiểu scope sẽ dẫn đến:
- **Bug khó tìm**: Biến bị ghi đè bất ngờ
- **Biến toàn cục tràn lan**: Gây xung đột tên biến
- **Memory leak**: Biến không được giải phóng khi không cần

```javascript
// ❌ Không hiểu scope → bug
var ten = "Minh"; // biến global

function chao() {
  var ten = "Lan"; // biến local — KHÁC biến bên ngoài
  console.log(ten); // "Lan"
}

chao();
console.log(ten); // "Minh" — biến global KHÔNG bị ảnh hưởng

// ❌ Quên var/let/const → vô tình tạo biến global
function tinhToan() {
  ketQua = 42; // Không có var/let/const → biến GLOBAL!
}
tinhToan();
console.log(ketQua); // 42 — rò rỉ ra ngoài 😱
```

## Các loại Scope

### 1. Global Scope (Phạm vi toàn cục)

Biến khai báo **bên ngoài mọi hàm và block** — truy cập được từ mọi nơi.

```javascript
// Global scope
const appName = "Ứng dụng của tôi"; // Biến global

function hienThi() {
  console.log(appName); // ✅ Truy cập được từ trong hàm
}

if (true) {
  console.log(appName); // ✅ Truy cập được từ trong block
}

console.log(appName); // ✅ Truy cập được ở ngoài
```

**Lưu ý:** Hạn chế dùng biến global vì dễ bị ghi đè và gây bug.

### 2. Function Scope (Phạm vi hàm)

Biến khai báo **bên trong hàm** — chỉ truy cập được trong hàm đó.

```javascript
function tinhDiem() {
  const diemToan = 9;   // Chỉ tồn tại trong hàm này
  const diemVan = 8;
  return diemToan + diemVan;
}

console.log(tinhDiem());  // 17
console.log(diemToan);    // ❌ ReferenceError: diemToan is not defined
```

### 3. Block Scope (Phạm vi khối)

Biến `let` và `const` khai báo trong `{}` chỉ tồn tại trong block đó. **`var` KHÔNG có block scope** — đây là nguồn gốc của nhiều bug.

```javascript
if (true) {
  var a = 1;    // var — KHÔNG có block scope, "thoát" ra ngoài
  let b = 2;    // let — có block scope, chỉ trong {}
  const c = 3;  // const — có block scope, chỉ trong {}
}

console.log(a); // 1 ✅ (var thoát ra ngoài block)
console.log(b); // ❌ ReferenceError
console.log(c); // ❌ ReferenceError
```

### So sánh var, let, const về scope

| Đặc điểm | `var` | `let` | `const` |
|-----------|-------|-------|---------|
| Global scope | Có | Có | Có |
| Function scope | Có | Có | Có |
| Block scope | **Không** | Có | Có |
| Hoisting | `undefined` | TDZ | TDZ |
| Gán lại | Có | Có | **Không** |

## Scope Chain (Chuỗi Scope)

Khi JavaScript tìm biến, nó tìm **từ trong ra ngoài** theo chuỗi scope. Nếu không tìm thấy trong scope hiện tại, nó tìm ở scope cha, rồi scope ông, cho đến global scope.

```javascript
const tenApp = "MyApp"; // Global scope

function ngoai() {
  const tenModule = "Auth"; // Scope của hàm ngoai

  function trong() {
    const tenHam = "login"; // Scope của hàm trong

    // Tìm biến: trong → ngoai → global
    console.log(tenHam);    // ✅ Tìm thấy ở scope hiện tại
    console.log(tenModule); // ✅ Tìm thấy ở scope cha (ngoai)
    console.log(tenApp);    // ✅ Tìm thấy ở global scope
  }

  trong();
  console.log(tenHam); // ❌ ReferenceError — không tìm ngược vào scope con
}

ngoai();
```

```
Scope Chain:
  trong() → tìm ở đây trước
    ↓ không thấy
  ngoai() → tìm tiếp ở đây
    ↓ không thấy
  Global → tìm cuối cùng ở đây
    ↓ không thấy
  ReferenceError!
```

## Hoisting

Hoisting là hành vi JavaScript **"đẩy" khai báo lên đầu scope** trước khi chạy code. Nhưng mỗi loại khai báo được hoisting **khác nhau**.

### var — Hoisting với giá trị `undefined`

```javascript
console.log(ten); // undefined (KHÔNG lỗi, nhưng chưa có giá trị)
var ten = "Minh";
console.log(ten); // "Minh"

// JavaScript "nhìn thấy" code như thế này:
var ten;              // ← Khai báo được đẩy lên đầu, giá trị = undefined
console.log(ten);     // undefined
ten = "Minh";         // ← Gán giá trị vẫn ở vị trí cũ
console.log(ten);     // "Minh"
```

### let/const — Hoisting nhưng nằm trong TDZ

```javascript
// ❌ Temporal Dead Zone (TDZ)
console.log(tuoi); // ReferenceError: Cannot access 'tuoi' before initialization
let tuoi = 25;

// let/const ĐƯỢC hoisting, nhưng nằm trong "vùng chết tạm thời" (TDZ)
// từ đầu scope cho đến dòng khai báo
{
  // ← TDZ bắt đầu tại đây
  // console.log(x); // ReferenceError nếu gọi ở đây
  // ← TDZ kết thúc
  let x = 10; // Từ đây trở đi mới dùng được
  console.log(x); // 10 ✅
}
```

### Function Declaration — Hoisting hoàn toàn

```javascript
// ✅ Gọi hàm TRƯỚC khi khai báo — hoạt động!
const kq = tinhTong(3, 5);
console.log(kq); // 8

function tinhTong(a, b) {
  return a + b;
}

// JavaScript "nhìn thấy" code như thế này:
// function tinhTong(a, b) { return a + b; }  ← đưa LÊN ĐẦU hoàn toàn
// const kq = tinhTong(3, 5);
// console.log(kq);
```

### Tổng hợp Hoisting

| Loại khai báo | Hoisting? | Giá trị khi truy cập sớm |
|--------------|-----------|--------------------------|
| `var` | Có | `undefined` |
| `let` | Có (TDZ) | ReferenceError |
| `const` | Có (TDZ) | ReferenceError |
| `function declaration` | Có (hoàn toàn) | Hàm sẵn sàng sử dụng |
| `function expression` | Theo biến (`var`/`let`/`const`) | Tùy thuộc kiểu biến |

## Khi nào dùng?

| Nguyên tắc | Giải thích |
|-----------|------------|
| Luôn dùng `const` mặc định | Tránh gán lại vô tình |
| Dùng `let` khi cần gán lại | Biến đếm, giá trị thay đổi |
| **Không bao giờ** dùng `var` | Không có block scope, dễ gây bug |
| Khai báo biến ở scope nhỏ nhất | Hạn chế biến global |

## Lỗi thường gặp

### Bug kinh điển: `var` trong vòng `for`

```javascript
// ❌ Sai: var không có block scope
for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i); // In ra 3, 3, 3 (KHÔNG phải 0, 1, 2)
  }, 100);
}
// Vì var i là CHUNG cho cả vòng loop
// Khi setTimeout chạy, vòng loop đã kết thúc và i = 3

// ✅ Đúng: let có block scope
for (let i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i); // In ra 0, 1, 2 ✅
  }, 100);
}
// Mỗi vòng lặp tạo một biến i RIÊNG trong block scope
```

```javascript
// ❌ Sai: Vô tình tạo biến global
function tinhGia(soLuong) {
  gia = soLuong * 50000; // Thiếu let/const → biến global!
  return gia;
}

// ✅ Đúng: Luôn khai báo biến
function tinhGia(soLuong) {
  const gia = soLuong * 50000; // Biến local ✅
  return gia;
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: Output của đoạn code sau là gì? Giải thích.

```javascript
console.log(a);
console.log(b);
var a = 1;
let b = 2;
```

**Đáp án:**

- `console.log(a)` in ra `undefined` — `var a` được hoisting, khai báo đưa lên đầu nhưng giá trị chưa gán
- `console.log(b)` gây **ReferenceError** — `let b` nằm trong TDZ (Temporal Dead Zone), không thể truy cập trước dòng khai báo

```javascript
// JavaScript "nhìn thấy":
var a;                // hoisting: khai báo lên đầu, a = undefined
// let b;             // hoisting nhưng TDZ — không truy cập được
console.log(a);       // undefined
console.log(b);       // ReferenceError: Cannot access 'b' before initialization
a = 1;
let b = 2;            // TDZ kết thúc tại đây
```

### Câu 2: Temporal Dead Zone (TDZ) là gì?

**Đáp án:**

TDZ là khoảng thời gian từ **đầu scope** đến **dòng khai báo** biến `let`/`const`. Trong khoảng này, biến **tồn tại** (đã được hoisting) nhưng **không thể truy cập** — truy cập sẽ gây ReferenceError.

```javascript
{
  // TDZ cho biến "x" bắt đầu ở đây ──────┐
  console.log(x); // ReferenceError         │ TDZ
  const y = "ok"; //                        │
  // TDZ cho biến "x" kết thúc ở đây ──────┘
  let x = 10;     // Từ đây x mới dùng được
  console.log(x); // 10 ✅
}
```

TDZ tồn tại để giúp **phát hiện lỗi sớm** — thay vì âm thầm trả về `undefined` như `var`, `let`/`const` ném lỗi ngay để bạn biết mình dùng biến chưa khai báo.

### Câu 3: Tại sao `var` trong vòng for loop gây bug?

**Đáp án:**

Vì `var` **không có block scope** — tất cả các vòng lặp dùng chung **một biến `i`**. Khi callback chạy (sau khi loop kết thúc), tất cả đều tham chiếu đến cùng biến `i` đã bằng giá trị cuối cùng.

```javascript
// var — tất cả dùng chung 1 biến i
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 3, 3, 3
// Giải thích: Khi setTimeout chạy, loop đã xong, i = 3

// let — mỗi vòng lặp có biến i RIÊNG
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 0, 1, 2
// Giải thích: Mỗi iteration tạo block scope mới với giá trị i riêng
```

### Câu 4: Scope chain hoạt động như thế nào?

**Đáp án:**

Khi JavaScript cần tìm một biến, nó sẽ tìm **từ scope hiện tại ra ngoài** theo chuỗi (chain). Nếu scope hiện tại không có, tìm scope cha, rồi scope ông, cho đến global scope. Nếu global scope cũng không có thì ném ReferenceError.

```javascript
const a = "global";

function outer() {
  const b = "outer";

  function inner() {
    const c = "inner";
    console.log(c); // "inner" — tìm thấy ở scope hiện tại
    console.log(b); // "outer" — tìm thấy ở scope cha
    console.log(a); // "global" — tìm thấy ở global scope
    console.log(d); // ReferenceError — không tìm thấy ở bất kỳ đâu
  }

  inner();
}
outer();
// Chain: inner → outer → global
```

### Câu 5: Sự khác nhau giữa global scope, function scope, và block scope?

**Đáp án:**

```javascript
// Global scope — khai báo ngoài cùng, truy cập mọi nơi
const globalVar = "toàn cục";

function myFunc() {
  // Function scope — chỉ trong hàm này
  const funcVar = "trong hàm";

  if (true) {
    // Block scope — chỉ trong block {}
    const blockVar = "trong block";
    var noBlockVar = "thoát khỏi block"; // var KHÔNG có block scope!

    console.log(globalVar); // ✅
    console.log(funcVar);   // ✅
    console.log(blockVar);  // ✅
  }

  console.log(globalVar);  // ✅
  console.log(funcVar);    // ✅
  console.log(blockVar);   // ❌ ReferenceError
  console.log(noBlockVar); // ✅ (var thoát block, nhưng vẫn trong function)
}

console.log(globalVar);  // ✅
console.log(funcVar);    // ❌ ReferenceError
console.log(noBlockVar); // ❌ ReferenceError (var vẫn bị giới hạn bởi function)
```
