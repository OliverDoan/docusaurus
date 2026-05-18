---
sidebar_position: 1
title: "1. Hàm (Functions)"
---

# Hàm (Functions)


---

## Mục lục

- [Hàm là gì?](#hàm-là-gì)
- [Tại sao cần hàm?](#tại-sao-cần-hàm)
- [Cách sử dụng](#cách-sử-dụng)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Hàm là gì?

Hàm (function) là một **khối lệnh có tên**, được viết một lần và có thể **gọi lại nhiều lần**. Hàm nhận đầu vào, xử lý, rồi trả về kết quả.

**Ví dụ thực tế:** Hãy tưởng tượng hàm như một **công thức nấu ăn**:
- **Nguyên liệu** (đầu vào) = parameters
- **Các bước nấu** (xử lý) = thân hàm
- **Món ăn hoàn thành** (đầu ra) = return value

```
Công thức "Pha cà phê":
  Nguyên liệu: cà phê, nước nóng, đường
  Bước 1: Cho cà phê vào ly
  Bước 2: Đổ nước nóng
  Bước 3: Thêm đường
  Kết quả: Ly cà phê hoàn thành
```

```javascript
// Tương đương trong JavaScript
function phaCafe(cafe, nuocNong, duong) {
  // Bước xử lý
  const lyCafe = cafe + " + " + nuocNong + " + " + duong;
  return lyCafe; // Trả về kết quả
}

const ketQua = phaCafe("Robusta", "nước sôi", "2 muỗng đường");
console.log(ketQua); // "Robusta + nước sôi + 2 muỗng đường"
```

## Tại sao cần hàm?

Trước khi có hàm, lập trình viên phải **viết lại cùng một đoạn code** mỗi khi cần dùng. Hàm ra đời để giải quyết vấn đề **DRY** (Don't Repeat Yourself — Đừng lặp lại chính mình).

```javascript
// ❌ Không dùng hàm — lặp lại code
let gia1 = 100000;
let thue1 = gia1 * 0.1;
let tongTien1 = gia1 + thue1;

let gia2 = 250000;
let thue2 = gia2 * 0.1;
let tongTien2 = gia2 + thue2;

let gia3 = 500000;
let thue3 = gia3 * 0.1;
let tongTien3 = gia3 + thue3;

// ✅ Dùng hàm — viết một lần, gọi nhiều lần
function tinhTongTien(gia) {
  const thue = gia * 0.1;
  return gia + thue;
}

let tongTien1 = tinhTongTien(100000);  // 110000
let tongTien2 = tinhTongTien(250000);  // 275000
let tongTien3 = tinhTongTien(500000);  // 550000
```

Lợi ích của hàm:
- **Tái sử dụng**: Viết một lần, dùng nhiều nơi
- **Dễ bảo trì**: Sửa một chỗ, tất cả nơi gọi hàm đều được cập nhật
- **Dễ đọc**: Đặt tên hàm rõ ràng giúp code tự giải thích
- **Chia nhỏ vấn đề**: Tách chương trình lớn thành nhiều hàm nhỏ

## Cách sử dụng

### Function Declaration (Khai báo hàm)

Cách **truyền thống** và phổ biến nhất để tạo hàm:

```javascript
// Cú pháp: function tênHàm(thamSố) { ... }
function chao(ten) {
  return "Xin chào, " + ten + "!";
}

console.log(chao("Minh")); // "Xin chào, Minh!"
```

### Function Expression (Biểu thức hàm)

Gán một hàm **không tên** (anonymous) vào biến:

```javascript
// Gán hàm vào biến
const chao = function(ten) {
  return "Xin chào, " + ten + "!";
};

console.log(chao("Lan")); // "Xin chào, Lan!"
```

### So sánh Declaration vs Expression

| Đặc điểm | Declaration | Expression |
|-----------|------------|------------|
| Cú pháp | `function tên() {}` | `const tên = function() {}` |
| Hoisting | Có (gọi trước khi khai báo) | Không (phải khai báo trước) |
| Tên hàm | Bắt buộc | Tùy chọn (thường anonymous) |
| Dùng khi | Hàm chính, logic quan trọng | Callback, gán vào biến |

```javascript
// ✅ Declaration — hoisting cho phép gọi trước khi khai báo
console.log(cong(2, 3)); // 5 — hoạt động bình thường!

function cong(a, b) {
  return a + b;
}

// ❌ Expression — KHÔNG hoisting
console.log(tru(5, 2)); // Lỗi: Cannot access 'tru' before initialization

const tru = function(a, b) {
  return a - b;
};
```

### Parameters vs Arguments

- **Parameters** (tham số): Biến khai báo trong định nghĩa hàm — như **ô trống** chờ điền
- **Arguments** (đối số): Giá trị thực tế truyền vào khi gọi hàm — **giá trị điền vào ô trống**

```javascript
//              parameters (tham số)
//                  ↓    ↓
function nhan(soA, soB) {
  return soA * soB;
}

//         arguments (đối số)
//             ↓  ↓
const kq = nhan(4, 5); // 20
```

### Default Parameters (Tham số mặc định)

Đặt giá trị mặc định cho tham số khi người gọi không truyền vào:

```javascript
// Không có default — thiếu tham số sẽ là undefined
function chao(ten) {
  return "Xin chào, " + ten;
}
console.log(chao()); // "Xin chào, undefined" 😱

// ✅ Có default parameter
function chao(ten = "bạn") {
  return "Xin chào, " + ten;
}
console.log(chao());       // "Xin chào, bạn"
console.log(chao("Hùng")); // "Xin chào, Hùng"
```

### Return Statement

`return` dừng hàm và trả về giá trị. Hàm **không có return** sẽ trả về `undefined`.

```javascript
// Hàm CÓ return — trả về giá trị
function tinhDienTich(dai, rong) {
  return dai * rong;
}
const dt = tinhDienTich(5, 3); // dt = 15

// Hàm KHÔNG có return (void function) — chỉ thực hiện hành động
function inThongBao(thongBao) {
  console.log("🔔 " + thongBao);
  // Không có return → trả về undefined
}
const kq = inThongBao("Đã lưu!"); // In ra: "🔔 Đã lưu!"
console.log(kq); // undefined
```

```javascript
// ❌ Code sau return KHÔNG BAO GIỜ được chạy
function kiemTraTuoi(tuoi) {
  if (tuoi < 18) {
    return "Chưa đủ tuổi";
  }
  return "Đủ tuổi";
  console.log("Dòng này không bao giờ chạy"); // Dead code!
}
```

## Khi nào dùng?

| Tình huống | Ví dụ |
|-----------|-------|
| Tái sử dụng logic | Tính thuế, format ngày tháng, validate email |
| Chia nhỏ chương trình | `layDuLieu()`, `xuLyDuLieu()`, `hienThiKetQua()` |
| Xử lý sự kiện | Khi user click button, submit form |
| Callback | Truyền hàm vào `setTimeout`, `addEventListener` |

## Lỗi thường gặp

```javascript
// ❌ Sai: Quên return trong hàm tính toán
function tinhTong(a, b) {
  a + b; // Quên return!
}
console.log(tinhTong(1, 2)); // undefined

// ✅ Đúng: Luôn return khi cần giá trị trả về
function tinhTong(a, b) {
  return a + b;
}
console.log(tinhTong(1, 2)); // 3
```

```javascript
// ❌ Sai: Đặt tên hàm không rõ nghĩa
function xl(d) { /* xử lý dữ liệu */ }
function fn1(x) { /* ??? */ }

// ✅ Đúng: Tên hàm mô tả chính xác hành động
function xuLyDonHang(donHang) { /* ... */ }
function tinhGiamGia(giaBanDau, phanTramGiam) { /* ... */ }
```

```javascript
// ❌ Sai: Hàm làm quá nhiều việc
function xuLyMoiThu(user) {
  // Validate + lưu database + gửi email + tạo log
  // ...200 dòng code...
}

// ✅ Đúng: Mỗi hàm chỉ làm MỘT việc
function validateUser(user) { /* ... */ }
function luuDatabase(user) { /* ... */ }
function guiEmail(user) { /* ... */ }
function taoLog(user) { /* ... */ }
```

---

## Câu hỏi phỏng vấn

### Câu 1: Function Declaration và Function Expression khác nhau thế nào?

**Đáp án:**

Khác biệt chính nằm ở **hoisting**. Function Declaration được hoisting toàn bộ (có thể gọi trước khi khai báo), còn Function Expression thì không.

```javascript
// Function Declaration — hoisting
sayHi(); // ✅ "Hi!" — hoạt động dù gọi trước khai báo
function sayHi() {
  console.log("Hi!");
}

// Function Expression — KHÔNG hoisting
sayBye(); // ❌ ReferenceError!
const sayBye = function() {
  console.log("Bye!");
};
```

### Câu 2: Hoisting ảnh hưởng đến hàm như thế nào?

**Đáp án:**

JavaScript **đẩy khai báo hàm lên đầu scope** trước khi chạy code. Nhưng chỉ **function declaration** được hoisting hoàn toàn. Function expression chỉ hoisting biến (với `var` là `undefined`, với `let/const` là TDZ).

```javascript
// JavaScript "nhìn thấy" code như thế này:
// function chao() { ... }  ← được đưa lên đầu
// var tinh;                 ← chỉ biến được đưa lên, giá trị = undefined

chao();   // ✅ "Xin chào!" — declaration hoisting
tinh(1,2); // ❌ TypeError: tinh is not a function

function chao() {
  console.log("Xin chào!");
}

var tinh = function(a, b) {
  return a + b;
};
```

### Câu 3: "First-class function" nghĩa là gì?

**Đáp án:**

Trong JavaScript, hàm là **first-class citizens** (công dân hạng nhất), nghĩa là hàm được đối xử **giống như mọi giá trị khác**. Hàm có thể:

```javascript
// 1. Gán vào biến
const chao = function() { return "Xin chào!"; };

// 2. Truyền làm tham số cho hàm khác
function thucThi(fn) {
  return fn();
}
console.log(thucThi(chao)); // "Xin chào!"

// 3. Được trả về từ hàm khác
function taoHamNhan(heSo) {
  return function(so) {
    return so * heSo;
  };
}
const nhanDoi = taoHamNhan(2);
console.log(nhanDoi(5)); // 10

// 4. Lưu trong mảng hoặc object
const cacPhepTinh = [
  function(a, b) { return a + b; },
  function(a, b) { return a - b; },
];
console.log(cacPhepTinh[0](3, 4)); // 7
```

### Câu 4: Sự khác nhau giữa parameter và argument?

**Đáp án:**

- **Parameter** là tên biến trong **định nghĩa** hàm (placeholder)
- **Argument** là giá trị thực tế truyền vào khi **gọi** hàm

```javascript
// "ten" và "tuoi" là PARAMETERS
function gioiThieu(ten, tuoi) {
  return `Tôi là ${ten}, ${tuoi} tuổi`;
}

// "Minh" và 25 là ARGUMENTS
gioiThieu("Minh", 25);
```

### Câu 5: Hàm không có return trả về gì?

**Đáp án:**

Hàm không có `return` (hoặc `return` không kèm giá trị) sẽ trả về `undefined`. Đây gọi là **void function** — hàm chỉ thực hiện side effect mà không cần trả về giá trị.

```javascript
function inLog(msg) {
  console.log(msg);
  // Không có return
}

const ketQua = inLog("test"); // In ra "test"
console.log(ketQua);          // undefined

function kiemTra(x) {
  if (x > 10) return; // return không kèm giá trị
  console.log("x <= 10");
}

console.log(kiemTra(20)); // undefined
```
