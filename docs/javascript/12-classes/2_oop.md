---
sidebar_position: 2
title: "2. OOP trong JavaScript"
---

# OOP trong JavaScript


---

## Mục lục

- [OOP là gì?](#oop-là-gì)
- [Prototype — Nền tảng OOP của JavaScript](#prototype--nền-tảng-oop-của-javascript)
- [Constructor Function](#constructor-function)
- [Class (ES6) — Cú pháp hiện đại](#class-es6--cú-pháp-hiện-đại)
- [4 tính chất OOP](#4-tính-chất-oop)
- [So sánh Class vs Prototype](#so-sánh-class-vs-prototype)
- [Kế thừa — Prototype Chain](#kế-thừa--prototype-chain)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## OOP là gì?

**Object-Oriented Programming** (lập trình hướng đối tượng) là paradigm tổ chức code xung quanh **objects** — các thực thể chứa **dữ liệu** (properties) và **hành vi** (methods).

> **Ví dụ thực tế:** Hãy tưởng tượng **lớp "Xe"** trong thế giới thực. Mọi xe đều có thuộc tính (màu, hãng, số km) và hành vi (khởi động, tăng tốc, phanh). Bạn tạo một **bản mẫu** (class), sau đó sản xuất nhiều **xe cụ thể** (instances) từ bản mẫu đó.

```javascript
// "Bản mẫu" — Class
class Xe {
  constructor(hang, mau) {
    this.hang = hang;
    this.mau = mau;
    this.tocDo = 0;
  }

  tangToc(km) {
    this.tocDo += km;
    console.log(`${this.hang} đang chạy ${this.tocDo} km/h`);
  }
}

// "Xe cụ thể" — Instances
const xe1 = new Xe("Toyota", "Trắng");
const xe2 = new Xe("Honda", "Đen");

xe1.tangToc(60); // "Toyota đang chạy 60 km/h"
xe2.tangToc(80); // "Honda đang chạy 80 km/h"
```

---

## Prototype — Nền tảng OOP của JavaScript

JavaScript **không có class thật** (trước ES6). Thay vào đó, nó dùng **prototype** — mỗi object có một liên kết ẩn `[[Prototype]]` trỏ đến một object khác. Khi truy cập property không tồn tại, JavaScript tự động tìm lên **prototype chain**.

```javascript
const dongVat = {
  anUong: function() {
    console.log(this.ten + " đang ăn");
  }
};

const meo = Object.create(dongVat); // meo kế thừa từ dongVat
meo.ten = "Miu";

meo.anUong(); // "Miu đang ăn" — tìm thấy anUong trên prototype

// Kiểm tra prototype chain
console.log(meo.__proto__ === dongVat); // true
console.log(meo.hasOwnProperty("ten")); // true — ten là của riêng meo
console.log(meo.hasOwnProperty("anUong")); // false — anUong nằm trên prototype
```

### Prototype Chain

```javascript
// meo → dongVat → Object.prototype → null
console.log(meo.__proto__);                    // dongVat
console.log(meo.__proto__.__proto__);          // Object.prototype
console.log(meo.__proto__.__proto__.__proto__); // null — kết thúc chain
```

```
┌─────────┐     ┌──────────┐     ┌──────────────────┐
│  meo    │ ──→ │ dongVat  │ ──→ │ Object.prototype │ ──→ null
│ ten:Miu │     │ anUong() │     │ toString()       │
└─────────┘     └──────────┘     │ hasOwnProperty() │
                                 └──────────────────┘
```

---

## Constructor Function

Trước ES6, JavaScript tạo "class" bằng **constructor function** — một hàm thường kết hợp với `new`.

```javascript
// Constructor function — viết hoa chữ đầu theo convention
function SinhVien(ten, nganh) {
  // this = object mới được tạo bởi "new"
  this.ten = ten;
  this.nganh = nganh;
}

// Method đặt trên prototype — chia sẻ cho tất cả instances
SinhVien.prototype.gioiThieu = function() {
  console.log(`${this.ten} — ngành ${this.nganh}`);
};

const sv1 = new SinhVien("An", "CNTT");
const sv2 = new SinhVien("Bình", "Kinh tế");

sv1.gioiThieu(); // "An — ngành CNTT"
sv2.gioiThieu(); // "Bình — ngành Kinh tế"

// Cả 2 instance chia sẻ CÙNG MỘT hàm gioiThieu
console.log(sv1.gioiThieu === sv2.gioiThieu); // true
```

### Kế thừa với Constructor Function

```javascript
function NguoiDung(ten, email) {
  this.ten = ten;
  this.email = email;
}

NguoiDung.prototype.chao = function() {
  console.log(`Xin chào, tôi là ${this.ten}`);
};

// Admin kế thừa NguoiDung
function Admin(ten, email, quyen) {
  NguoiDung.call(this, ten, email); // Gọi constructor cha
  this.quyen = quyen;
}

// Kết nối prototype chain
Admin.prototype = Object.create(NguoiDung.prototype);
Admin.prototype.constructor = Admin;

// Thêm method riêng cho Admin
Admin.prototype.xoaUser = function(userId) {
  console.log(`${this.ten} đã xóa user ${userId}`);
};

const admin = new Admin("Boss", "boss@gmail.com", "full");
admin.chao();      // "Xin chào, tôi là Boss" — kế thừa từ NguoiDung
admin.xoaUser(42); // "Boss đã xóa user 42" — method riêng
```

---

## Class (ES6) — Cú pháp hiện đại

`class` trong ES6 là **syntactic sugar** — cú pháp sạch hơn, nhưng bên dưới vẫn dùng prototype.

```javascript
class NguoiDung {
  // Constructor — chạy khi new NguoiDung()
  constructor(ten, email) {
    this.ten = ten;
    this.email = email;
  }

  // Method — tự động đặt trên prototype
  chao() {
    console.log(`Xin chào, tôi là ${this.ten}`);
  }

  // Getter
  get thongTin() {
    return `${this.ten} (${this.email})`;
  }

  // Setter
  set doiTen(tenMoi) {
    if (tenMoi.length < 2) throw new Error("Tên quá ngắn");
    this.ten = tenMoi;
  }

  // Static method — gọi trên class, không phải instance
  static taoKhachVangLai() {
    return new NguoiDung("Khách", "guest@example.com");
  }
}

const user = new NguoiDung("Minh", "minh@gmail.com");
user.chao();                    // "Xin chào, tôi là Minh"
console.log(user.thongTin);    // "Minh (minh@gmail.com)"
user.doiTen = "Minh Nguyen";   // Dùng setter
console.log(user.ten);         // "Minh Nguyen"

const khach = NguoiDung.taoKhachVangLai(); // Gọi static method
```

### Private Fields (#) — ES2022

```javascript
class TaiKhoanNganHang {
  #soDu = 0; // Private — không thể truy cập từ bên ngoài

  constructor(tenChuTK, soDuBanDau) {
    this.tenChuTK = tenChuTK;
    this.#soDu = soDuBanDau;
  }

  napTien(soTien) {
    if (soTien <= 0) throw new Error("Số tiền phải dương");
    this.#soDu += soTien;
    console.log(`Đã nạp ${soTien}. Số dư: ${this.#soDu}`);
  }

  rutTien(soTien) {
    if (soTien > this.#soDu) throw new Error("Không đủ tiền");
    this.#soDu -= soTien;
    console.log(`Đã rút ${soTien}. Số dư: ${this.#soDu}`);
  }

  get soDu() {
    return this.#soDu;
  }
}

const tk = new TaiKhoanNganHang("Minh", 1000000);
tk.napTien(500000);    // "Đã nạp 500000. Số dư: 1500000"
console.log(tk.soDu);  // 1500000 (qua getter)
// tk.#soDu;            // SyntaxError — không thể truy cập private field!
```

---

## 4 tính chất OOP

### 1. Encapsulation — Đóng gói

Ẩn dữ liệu bên trong, chỉ cho phép truy cập qua các phương thức công khai.

```javascript
class NguoiChoi {
  #mang = 100; // Private

  tanCong(doiThu, satthuong) {
    if (this.#mang <= 0) {
      console.log("Đã chết, không thể tấn công!");
      return;
    }
    doiThu.nhanSatThuong(satthuong);
  }

  nhanSatThuong(satthuong) {
    this.#mang = Math.max(0, this.#mang - satthuong);
    console.log(`Còn ${this.#mang} máng`);
  }

  get conSong() {
    return this.#mang > 0;
  }
}
```

### 2. Inheritance — Kế thừa

Class con kế thừa properties và methods từ class cha.

```javascript
class DongVat {
  constructor(ten) {
    this.ten = ten;
  }

  keu() {
    console.log(`${this.ten} đang kêu...`);
  }
}

class Cho extends DongVat {
  constructor(ten, giong) {
    super(ten); // Gọi constructor cha
    this.giong = giong;
  }

  // Override method cha
  keu() {
    console.log(`${this.ten} sủa: Gâu gâu!`);
  }

  layBong() {
    console.log(`${this.ten} đi lấy bóng`);
  }
}

class Meo extends DongVat {
  keu() {
    console.log(`${this.ten} kêu: Meo meo!`);
  }
}

const dog = new Cho("Buddy", "Golden");
dog.keu();      // "Buddy sủa: Gâu gâu!"
dog.layBong();  // "Buddy đi lấy bóng"

const cat = new Meo("Kitty");
cat.keu();      // "Kitty kêu: Meo meo!"
```

### 3. Polymorphism — Đa hình

Cùng một method nhưng hành vi khác nhau ở các class khác nhau.

```javascript
class HinhHoc {
  dienTich() {
    throw new Error("Phải override method dienTich()");
  }
}

class HinhTron extends HinhHoc {
  constructor(banKinh) {
    super();
    this.banKinh = banKinh;
  }

  dienTich() {
    return Math.PI * this.banKinh ** 2;
  }
}

class HinhChuNhat extends HinhHoc {
  constructor(dai, rong) {
    super();
    this.dai = dai;
    this.rong = rong;
  }

  dienTich() {
    return this.dai * this.rong;
  }
}

// Polymorphism — cùng gọi dienTich() nhưng kết quả khác nhau
const cacHinh = [
  new HinhTron(5),
  new HinhChuNhat(4, 6),
  new HinhTron(3)
];

cacHinh.forEach(hinh => {
  console.log(`Diện tích: ${hinh.dienTich().toFixed(2)}`);
});
// "Diện tích: 78.54"
// "Diện tích: 24.00"
// "Diện tích: 28.27"
```

### 4. Abstraction — Trừu tượng

Ẩn chi tiết phức tạp, chỉ hiển thị interface đơn giản.

```javascript
class MayPha {
  #nhietDo;
  #apSuat;

  constructor() {
    this.#nhietDo = 0;
    this.#apSuat = 0;
  }

  // Interface đơn giản cho người dùng
  phaCaPhe(loai) {
    this.#dungMay();
    this.#xayHat();
    this.#dunNuoc();
    this.#chietXuat();
    console.log(`☕ ${loai} đã sẵn sàng!`);
    return `${loai} nóng`;
  }

  // Chi tiết phức tạp được ẨN bên trong
  #dungMay() { this.#nhietDo = 95; }
  #xayHat() { console.log("Đang xay hạt..."); }
  #dunNuoc() { this.#apSuat = 9; }
  #chietXuat() { console.log("Đang chiết xuất..."); }
}

const may = new MayPha();
may.phaCaPhe("Espresso"); // Người dùng chỉ cần gọi 1 method!
// "Đang xay hạt..."
// "Đang chiết xuất..."
// "☕ Espresso đã sẵn sàng!"
```

---

## So sánh Class vs Prototype

| Tiêu chí | Constructor Function + Prototype | Class (ES6) |
|----------|--------------------------------|-------------|
| Cú pháp | Dài dòng | Gọn, rõ ràng |
| Kế thừa | `Object.create()` + thủ công | `extends` + `super()` |
| Private | Convention `_` (không thật sự private) | `#field` (private thật) |
| Static | Gán trực tiếp: `Func.method = ...` | `static method()` |
| Hoisting | Có hoisting (function declaration) | ❌ Không hoisting |
| Bản chất | Function | Function (syntactic sugar) |

```javascript
// Constructor Function
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function() {
  console.log(this.name + " speaks");
};

// Class — TƯƠNG ĐƯƠNG nhưng dễ đọc hơn
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    console.log(this.name + " speaks");
  }
}

// Cả 2 đều dùng prototype bên dưới
console.log(typeof Animal); // "function" — cả 2 cách!
```

---

## Kế thừa — Prototype Chain

```javascript
class A {
  methodA() { return "A"; }
}

class B extends A {
  methodB() { return "B"; }
}

class C extends B {
  methodC() { return "C"; }
}

const c = new C();
console.log(c.methodC()); // "C" — tìm thấy trên C
console.log(c.methodB()); // "B" — tìm trên B (prototype của C)
console.log(c.methodA()); // "A" — tìm trên A (prototype của B)

// Kiểm tra kế thừa
console.log(c instanceof C); // true
console.log(c instanceof B); // true
console.log(c instanceof A); // true
```

---

## Lỗi thường gặp

### 1. Quên dùng `new`

```javascript
function NguoiDung(ten) {
  this.ten = ten;
}

// ❌ Quên new — this = window, gán lên global!
const user = NguoiDung("Minh");
console.log(user);       // undefined
console.log(window.ten); // "Minh" — lỗi nghiêm trọng!

// ✅ Dùng class thì JavaScript tự báo lỗi
class NguoiDung2 {
  constructor(ten) { this.ten = ten; }
}
// const user2 = NguoiDung2("Minh"); // TypeError: must use 'new'
```

### 2. Quên gọi `super()` trong constructor con

```javascript
class Cha {
  constructor(ten) {
    this.ten = ten;
  }
}

// ❌ Sai — phải gọi super() trước khi dùng this
class Con extends Cha {
  constructor(ten, tuoi) {
    // this.tuoi = tuoi; // ReferenceError!
    super(ten); // ✅ Phải gọi super() trước
    this.tuoi = tuoi;
  }
}
```

### 3. Arrow function làm method trong class

```javascript
class App {
  constructor() {
    this.name = "MyApp";
  }

  // ❌ Tránh — mỗi instance tạo hàm riêng, tốn bộ nhớ
  // greet = () => { console.log(this.name); };

  // ✅ Tốt hơn — chia sẻ qua prototype
  greet() {
    console.log(this.name);
  }
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: JavaScript có phải ngôn ngữ OOP thật sự không?

**Đáp án:** JavaScript là ngôn ngữ **prototype-based OOP**, không phải class-based như Java/C++. Mặc dù ES6 có keyword `class`, bên dưới vẫn dùng prototype chain. JavaScript hỗ trợ đầy đủ 4 tính chất OOP (Encapsulation, Inheritance, Polymorphism, Abstraction) nhưng triển khai theo cách khác — thông qua prototype delegation thay vì class inheritance.

### Câu 2: Prototype chain hoạt động như thế nào?

**Đáp án:** Mỗi object có một liên kết ẩn `[[Prototype]]` trỏ đến prototype object. Khi truy cập property, JavaScript tìm trên object trước, nếu không có thì tìm lên prototype, rồi tiếp tục lên prototype của prototype... cho đến khi gặp `null`. Chuỗi liên kết này gọi là prototype chain. Ví dụ: `instance → Class.prototype → ParentClass.prototype → Object.prototype → null`.

### Câu 3: Sự khác nhau giữa `__proto__` và `prototype`?

**Đáp án:** `prototype` là property của **function** (constructor), chứa methods sẽ được chia sẻ cho tất cả instances. `__proto__` (hoặc `Object.getPrototypeOf()`) là property của **object/instance**, trỏ đến prototype object mà nó kế thừa. Khi `new Func()`, JavaScript set `instance.__proto__ = Func.prototype`.

### Câu 4: `class` trong ES6 khác gì constructor function?

**Đáp án:** Về bản chất, `class` là syntactic sugar cho constructor function + prototype. Khác biệt:
- Class **bắt buộc** dùng `new` (function thì không)
- Class **không hoisting** (function declaration thì có)
- Class body mặc định ở **strict mode**
- Class hỗ trợ `#private` fields (ES2022)
- Cú pháp `extends`/`super` thay cho `Object.create()` thủ công

### Câu 5: Khi nào nên dùng composition thay vì inheritance?

**Đáp án:** Nên ưu tiên **composition** (kết hợp) khi: objects cần nhiều behaviors không liên quan (VD: object vừa bay vừa bơi — kế thừa đơn không đủ), khi quan hệ "has-a" phù hợp hơn "is-a", khi muốn tránh deep inheritance chain (>2-3 levels). Nguyên tắc: "Favor composition over inheritance" — kết hợp các function/object nhỏ thay vì xây class hierarchy phức tạp.
