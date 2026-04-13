---
sidebar_position: 4
title: "4. Classes"
---

# Classes

## Class là gì?

**Class** là một **bản thiết kế** (blueprint) để tạo ra các **object** có cùng cấu trúc và hành vi. Từ class, bạn có thể tạo ra **nhiều object** (gọi là **instance**), mỗi object có dữ liệu riêng nhưng chia sẻ cùng các phương thức (method).

Hãy tưởng tượng class như **bản vẽ nhà**. Từ một bản vẽ, bạn có thể xây **nhiều căn nhà** giống nhau về cấu trúc (đều có phòng khách, phòng ngủ, bếp), nhưng mỗi nhà có **nội thất riêng** (màu sơn, đồ đạc khác nhau).

```javascript
// Class = bản vẽ nhà
class Nha {
  constructor(mauSon, soPhong) {
    this.mauSon = mauSon;   // Thuộc tính riêng của mỗi nhà
    this.soPhong = soPhong;
  }

  moTa() {
    return `Nha mau ${this.mauSon}, co ${this.soPhong} phong`;
  }
}

// Tạo các instance (căn nhà cụ thể)
const nha1 = new Nha("trang", 3);
const nha2 = new Nha("xanh", 5);

console.log(nha1.moTa()); // "Nha mau trang, co 3 phong"
console.log(nha2.moTa()); // "Nha mau xanh, co 5 phong"
```

---

## Tại sao Classes ra đời?

Trước ES6, để tạo object theo khuôn mẫu, JavaScript dùng **function constructor** và **prototype**. Cú pháp này rất **khó đọc và khó hiểu**:

```javascript
// Cách cũ: function constructor + prototype (trước ES6)
function NguoiDung(ten, tuoi) {
  this.ten = ten;
  this.tuoi = tuoi;
}

NguoiDung.prototype.chao = function () {
  return "Xin chao, toi la " + this.ten;
};

// Kế thừa: cực kỳ phức tạp
function Admin(ten, tuoi, quyen) {
  NguoiDung.call(this, ten, tuoi); // Gọi constructor cha
  this.quyen = quyen;
}
Admin.prototype = Object.create(NguoiDung.prototype);
Admin.prototype.constructor = Admin;
```

ES6 giới thiệu cú pháp **class** để viết code OOP dễ đọc hơn. **Lưu ý:** Class trong JavaScript chỉ là **syntactic sugar** (cú pháp đẹp hơn) -- bên dưới vẫn dùng **prototype**.

---

## Cách sử dụng

### 1. Constructor, Methods, Properties

```javascript
class SinhVien {
  // Constructor: hàm đặc biệt chạy khi tạo object bằng "new"
  constructor(ten, maSV, diem) {
    this.ten = ten;       // Thuộc tính (property)
    this.maSV = maSV;
    this.diem = diem;
  }

  // Method (phương thức)
  xepLoai() {
    if (this.diem >= 8.5) return "Gioi";
    if (this.diem >= 7.0) return "Kha";
    if (this.diem >= 5.0) return "Trung binh";
    return "Yeu";
  }

  hienThi() {
    return `${this.ten} (${this.maSV}) - ${this.xepLoai()}`;
  }
}

const sv = new SinhVien("Nguyen Van A", "SV001", 8.7);
console.log(sv.hienThi()); // "Nguyen Van A (SV001) - Gioi"
```

### 2. Kế thừa: extends và super

```javascript
// Lớp cha
class DongVat {
  constructor(ten, loai) {
    this.ten = ten;
    this.loai = loai;
  }

  keu() {
    return `${this.ten} dang keu...`;
  }
}

// Lớp con kế thừa lớp cha
class Cho extends DongVat {
  constructor(ten, giong) {
    super(ten, "Cho");  // Gọi constructor của lớp cha
    this.giong = giong; // Thuộc tính riêng của lớp con
  }

  // Override (ghi đè) method của lớp cha
  keu() {
    return `${this.ten} (${this.giong}): Go Go!`;
  }

  // Method riêng của lớp con
  vayDuoi() {
    return `${this.ten} dang vay duoi!`;
  }
}

const lucky = new Cho("Lucky", "Corgi");
console.log(lucky.keu());      // "Lucky (Corgi): Go Go!"
console.log(lucky.vayDuoi());  // "Lucky dang vay duoi!"
console.log(lucky.loai);       // "Cho" -- kế thừa từ lớp cha
```

### 3. Static Methods (phương thức tĩnh)

Static method thuộc về **class**, không thuộc về instance. Gọi trực tiếp trên class:

```javascript
class TienIch {
  // Static method -- gọi trên class, không cần tạo instance
  static tinhTuoi(namSinh) {
    return new Date().getFullYear() - namSinh;
  }

  static taoId() {
    return Math.random().toString(36).substring(2, 9);
  }
}

// Gọi trực tiếp trên class
console.log(TienIch.tinhTuoi(1999)); // 27
console.log(TienIch.taoId());        // "a3f8x2k"

// ❌ Không thể gọi trên instance
const t = new TienIch();
// t.tinhTuoi(1999); // TypeError: t.tinhTuoi is not a function
```

### 4. Getter và Setter

Getter/Setter cho phép truy cập thuộc tính như bình thường nhưng **có logic xử lý** bên trong:

```javascript
class HinhTron {
  constructor(banKinh) {
    this._banKinh = banKinh; // Quy ước: _ = "private"
  }

  // Getter -- đọc giá trị như thuộc tính (không cần gọi hàm)
  get dienTich() {
    return Math.PI * this._banKinh ** 2;
  }

  get chuVi() {
    return 2 * Math.PI * this._banKinh;
  }

  // Setter -- gán giá trị như thuộc tính, có kiểm tra
  set banKinh(giaTri) {
    if (giaTri <= 0) {
      throw new Error("Ban kinh phai lon hon 0");
    }
    this._banKinh = giaTri;
  }

  get banKinh() {
    return this._banKinh;
  }
}

const hinh = new HinhTron(5);
console.log(hinh.dienTich); // 78.54 -- truy cập như thuộc tính
console.log(hinh.chuVi);   // 31.42

hinh.banKinh = 10;         // Dùng setter
console.log(hinh.dienTich); // 314.16

// hinh.banKinh = -1;      // Error: Ban kinh phai lon hon 0
```

### 5. Private Fields (#)

Từ ES2022, JavaScript hỗ trợ **trường private thật sự** với dấu `#`:

```javascript
class TaiKhoanNganHang {
  #soDu;        // Private -- không truy cập được từ bên ngoài
  #maPin;

  constructor(tenChuTK, soDuBanDau, maPin) {
    this.tenChuTK = tenChuTK;  // Public
    this.#soDu = soDuBanDau;   // Private
    this.#maPin = maPin;        // Private
  }

  // Public method -- cách duy nhất để tương tác với dữ liệu private
  xemSoDu(pin) {
    if (pin !== this.#maPin) {
      throw new Error("Ma PIN khong dung!");
    }
    return this.#soDu;
  }

  napTien(soTien) {
    if (soTien <= 0) throw new Error("So tien khong hop le");
    this.#soDu += soTien;
    return `Da nap ${soTien}. So du moi: ${this.#soDu}`;
  }

  rutTien(soTien, pin) {
    if (pin !== this.#maPin) throw new Error("Ma PIN khong dung!");
    if (soTien > this.#soDu) throw new Error("So du khong du!");
    this.#soDu -= soTien;
    return `Da rut ${soTien}. So du con lai: ${this.#soDu}`;
  }
}

const tk = new TaiKhoanNganHang("Minh", 5000000, "1234");
console.log(tk.tenChuTK);        // "Minh" -- OK, public
console.log(tk.xemSoDu("1234")); // 5000000

// ❌ Không truy cập được private field từ bên ngoài
// console.log(tk.#soDu);  // SyntaxError!
// console.log(tk.#maPin); // SyntaxError!
```

---

## Class vs Function Constructor

| Tiêu chí | Function Constructor | Class (ES6) |
|----------|---------------------|-------------|
| Cú pháp | `function User() \{}` | `class User \{}` |
| Method | `User.prototype.greet = ...` | Đặt trực tiếp trong class |
| Kế thừa | `Object.create()` + manual | `extends` + `super` |
| Private | Không có (quy ước `_`) | Có (`#field`) |
| Hoisting | Có (function hoisting) | **Không** (phải khai báo trước) |
| `new` bắt buộc | Không (có thể quên) | **Có** (tự động báo lỗi) |

```javascript
// Function constructor: quên "new" không báo lỗi
function User(ten) {
  this.ten = ten;
}
const u1 = User("Minh"); // Quên new -> this = window -> NGUY HIỂM!

// Class: báo lỗi nếu quên "new"
class UserClass {
  constructor(ten) {
    this.ten = ten;
  }
}
// const u2 = UserClass("Minh"); // TypeError: Class constructor cannot be invoked without 'new'
```

---

## Khi nào dùng?

| Trường hợp | Ví dụ |
|------------|-------|
| Tạo nhiều object cùng kiểu | User, Product, Order |
| Cần kế thừa | Animal -> Dog, Cat |
| Đóng gói dữ liệu + hành vi | TaiKhoanNganHang (số dư + nạp/rút tiền) |
| Thiết kế component | React class component (cũ) |
| Design patterns | Singleton, Factory, Observer |

---

## Lỗi thường gặp

### Lỗi 1: Quên "new" khi tạo instance

```javascript
class User {
  constructor(ten) {
    this.ten = ten;
  }
}

// ❌ SAI: quên new
// const u = User("Minh"); // TypeError!

// ✅ ĐÚNG: luôn dùng new
const u = new User("Minh");
```

### Lỗi 2: Quên "super" trong constructor lớp con

```javascript
class Animal {
  constructor(ten) {
    this.ten = ten;
  }
}

class Dog extends Animal {
  constructor(ten, giong) {
    // ❌ SAI: thiếu super -> ReferenceError
    // this.giong = giong; // Lỗi!

    // ✅ ĐÚNG: gọi super trước khi dùng this
    super(ten);
    this.giong = giong;
  }
}
```

### Lỗi 3: "this" bị mất khi truyền method làm callback

```javascript
class Counter {
  constructor() {
    this.count = 0;
  }

  tang() {
    this.count++;
    console.log(this.count);
  }
}

const c = new Counter();

// ❌ SAI: "this" bị mất khi truyền làm callback
// document.getElementById("btn").addEventListener("click", c.tang);
// -> this = button element, không phải Counter!

// ✅ ĐÚNG: bind hoặc arrow function
document.getElementById("btn").addEventListener("click", () => c.tang());
// Hoặc: addEventListener("click", c.tang.bind(c));
```

---

## Câu hỏi phỏng vấn

### Câu 1: Class trong JavaScript có phải OOP thật không?

**Đáp án:** Class trong JavaScript là **syntactic sugar** (cú pháp đẹp) trên hệ thống **prototype**. JavaScript dùng **prototype-based OOP**, không phải **class-based OOP** như Java/C++.

```javascript
class User {
  greet() {
    return "Hello";
  }
}

// Chứng minh: method nằm trên prototype
console.log(typeof User);                    // "function" -- không phải "class"!
console.log(User.prototype.greet);           // [Function: greet]
console.log(new User().__proto__ === User.prototype); // true
```

Bên dưới, JavaScript vẫn dùng prototype chain để tìm method. Class chỉ làm cú pháp dễ đọc hơn.

---

### Câu 2: extends và super hoạt động như thế nào?

**Đáp án:**
- `extends` thiết lập **prototype chain** -- lớp con kế thừa method từ lớp cha
- `super()` trong constructor gọi **constructor của lớp cha** để khởi tạo thuộc tính
- `super.method()` gọi **method của lớp cha** từ lớp con

```javascript
class Animal {
  constructor(ten) {
    this.ten = ten;
  }
  keu() {
    return "...";
  }
}

class Cat extends Animal {
  constructor(ten, mau) {
    super(ten);        // Gọi Animal.constructor(ten)
    this.mau = mau;
  }
  keu() {
    return super.keu() + " Meo Meo!"; // Gọi Animal.keu()
  }
}

const miu = new Cat("Miu", "trang");
console.log(miu.keu()); // "... Meo Meo!"
```

---

### Câu 3: Static method dùng để làm gì?

**Đáp án:** Static method là **tiện ích của class**, không liên quan đến instance cụ thể. Thường dùng để:
- Tạo factory method (tạo instance theo cách đặc biệt)
- Tiện ích tính toán
- Validation

```javascript
class User {
  constructor(ten, email) {
    this.ten = ten;
    this.email = email;
  }

  // Factory method -- tạo User từ JSON
  static tuJSON(json) {
    const data = JSON.parse(json);
    return new User(data.ten, data.email);
  }

  // Tiện ích -- không cần instance
  static kiemTraEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

const user = User.tuJSON('{"ten":"Minh","email":"minh@email.com"}');
console.log(User.kiemTraEmail("abc"));         // false
console.log(User.kiemTraEmail("a@b.com"));     // true
```

---

### Câu 4: Private field (#) khác gì quy ước underscore (_)?

**Đáp án:**

| Tiêu chí | `_property` (quy ước) | `#property` (thật sự) |
|----------|----------------------|----------------------|
| Truy cập từ bên ngoài | **Được** (chỉ là quy ước) | **Không** (SyntaxError) |
| Bảo mật | Không (ai cũng truy cập được) | Có (JS engine bảo vệ) |
| Hỗ trợ | Mọi phiên bản | ES2022+ |

```javascript
class A {
  _quenBiet = "thay duoc";  // Ai cũng đọc được
  #biMat = "khong thay";    // Chỉ class A truy cập được
}

const a = new A();
console.log(a._quenBiet); // "thay duoc" -- không bảo mật!
// console.log(a.#biMat); // SyntaxError -- thật sự private
```

---

### Câu 5: Prototype chain là gì?

**Đáp án:** Khi truy cập một thuộc tính/method trên object, JavaScript **tìm từ object đó đi lên** qua prototype chain cho đến khi tìm thấy hoặc đến `null`:

```javascript
class Animal {
  an() { return "dang an..."; }
}

class Dog extends Animal {
  sua() { return "Go Go!"; }
}

const d = new Dog();

// Prototype chain:
// d -> Dog.prototype -> Animal.prototype -> Object.prototype -> null

console.log(d.sua()); // Tìm thấy trên Dog.prototype
console.log(d.an());  // Tìm thấy trên Animal.prototype
console.log(d.toString()); // Tìm thấy trên Object.prototype

// Kiểm tra prototype chain
console.log(d instanceof Dog);    // true
console.log(d instanceof Animal); // true
console.log(d instanceof Object); // true
```
