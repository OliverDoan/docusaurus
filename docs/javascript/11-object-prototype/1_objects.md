---
sidebar_position: 1
title: "1. Object"
---

# Object


---

## Mục lục

- [Object là gì?](#object-là-gì)
- [Tại sao object ra đời?](#tại-sao-object-ra-đời)
- [Cách sử dụng](#cách-sử-dụng)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Object là gì?

Hãy tưởng tượng **thẻ sinh viên** của bạn:

```
Tên:        Nguyễn Văn An
Mã SV:      SV001
Lớp:        CNTT-K20
Năm sinh:   2003
```

Thẻ sinh viên gom nhiều **thông tin liên quan** vào một chỗ. Trong JavaScript, **object** hoạt động giống hệt — nó lưu trữ dữ liệu dưới dạng **cặp tên-giá trị (key-value)**.

```js
let sinhVien = {
  ten: "Nguyễn Văn An",
  maSV: "SV001",
  lop: "CNTT-K20",
  namSinh: 2003,
};
```

> Ví dụ khác: **hồ sơ bệnh nhân** (tên, tuổi, nhóm máu, tiền sử bệnh) hoặc **thông tin sản phẩm** (tên, giá, mô tả, số lượng).

## Tại sao object ra đời?

Mảng tốt cho danh sách cùng loại, nhưng khi dữ liệu **khác loại và có ý nghĩa liên quan** (tên, tuổi, email của cùng 1 người), mảng không phù hợp:

```js
// ❌ Dùng mảng — không biết giá trị nào là gì
let nguoi = ["An", 25, "an@email.com"];
// nguoi[0] là gì? nguoi[1] là gì? Rất khó hiểu!

// ✅ Dùng object — rõ ràng
let nguoi = { ten: "An", tuoi: 25, email: "an@email.com" };
// nguoi.ten → dễ hiểu ngay!
```

Object ra đời để **nhóm dữ liệu liên quan lại với nhau**, giúp code dễ đọc và quản lý.

## Cách sử dụng

### Tạo object

```js
// Cách 1: Object literal {} (phổ biến nhất)
let xeHoi = {
  hang: "Toyota",
  mau: "Trắng",
  nam: 2024,
};

// Cách 2: Object constructor (ít dùng)
let xeHoi2 = new Object();
xeHoi2.hang = "Honda";
xeHoi2.mau = "Đen";

// Object rỗng
let mangRong = {};
```

### Truy cập property

```js
let sach = {
  tieuDe: "Dế Mèn Phiêu Lưu Ký",
  tacGia: "Tô Hoài",
  nam: 1941,
  "so-trang": 200, // key có dấu gạch ngang
};

// Cách 1: Dot notation (dấu chấm) — đơn giản, phổ biến
console.log(sach.tieuDe); // "Dế Mèn Phiêu Lưu Ký"
console.log(sach.tacGia); // "Tô Hoài"

// Cách 2: Bracket notation (dấu ngoặc vuông) — linh hoạt hơn
console.log(sach["tieuDe"]);   // "Dế Mèn Phiêu Lưu Ký"
console.log(sach["so-trang"]); // 200 — bắt buộc dùng [] vì key có dấu gạch

// Dùng biến làm key — chỉ bracket notation mới được
let truong = "tacGia";
console.log(sach[truong]); // "Tô Hoài"
console.log(sach.truong);  // undefined — tìm key "truong", không phải giá trị của biến
```

### Thêm, sửa, xóa property

```js
let nguoi = { ten: "An", tuoi: 25 };

// Thêm property mới
nguoi.email = "an@email.com";
console.log(nguoi); // { ten: "An", tuoi: 25, email: "an@email.com" }

// Sửa property
nguoi.tuoi = 26;
console.log(nguoi.tuoi); // 26

// Xóa property
delete nguoi.email;
console.log(nguoi); // { ten: "An", tuoi: 26 }
```

### Object methods và this

```js
let hocSinh = {
  ten: "Bình",
  diem: [8, 9, 7, 10],

  // Method — hàm bên trong object
  tinhDiemTB: function () {
    let tong = 0;
    for (let i = 0; i < this.diem.length; i++) {
      tong += this.diem[i]; // this trỏ đến chính object hocSinh
    }
    return tong / this.diem.length;
  },

  gioiThieu: function () {
    return "Tôi là " + this.ten + ", điểm TB: " + this.tinhDiemTB();
  },
};

console.log(hocSinh.tinhDiemTB()); // 8.5
console.log(hocSinh.gioiThieu()); // "Tôi là Bình, điểm TB: 8.5"
```

> **this** bên trong method trỏ đến **object đang gọi method đó**.

### Object.keys(), Object.values(), Object.entries()

```js
let sanPham = {
  ten: "Cà phê",
  gia: 35000,
  loai: "Đồ uống",
};

// Object.keys() — lấy tất cả key
console.log(Object.keys(sanPham));
// ["ten", "gia", "loai"]

// Object.values() — lấy tất cả value
console.log(Object.values(sanPham));
// ["Cà phê", 35000, "Đồ uống"]

// Object.entries() — lấy cặp [key, value]
console.log(Object.entries(sanPham));
// [["ten", "Cà phê"], ["gia", 35000], ["loai", "Đồ uống"]]

// Duyệt object bằng for...of + entries
for (let [key, value] of Object.entries(sanPham)) {
  console.log(key + ": " + value);
}
// ten: Cà phê
// gia: 35000
// loai: Đồ uống
```

### Kiểm tra property tồn tại

```js
let user = { ten: "An", tuoi: 25 };

// Cách 1: in operator
console.log("ten" in user);    // true
console.log("email" in user);  // false

// Cách 2: hasOwnProperty()
console.log(user.hasOwnProperty("tuoi")); // true

// Cách 3: So sánh với undefined
console.log(user.email !== undefined); // false
```

## Khi nào dùng?

- **Thông tin người dùng**: tên, email, avatar, vai trò
- **Cấu hình ứng dụng**: theme, ngôn ngữ, font size
- **Dữ liệu API**: response từ server thường là object/JSON
- **State trong ứng dụng**: trạng thái UI, form data
- Bất kỳ khi nào cần **nhóm dữ liệu liên quan** với key có ý nghĩa

## Lỗi thường gặp

### Lỗi 1: Nhầm lẫn dot và bracket notation

```js
let obj = { "ten-day-du": "An" };

// ❌ Sai — dot notation không dùng được với key có ký tự đặc biệt
// obj.ten-day-du  // SyntaxError!

// ✅ Đúng — dùng bracket notation
console.log(obj["ten-day-du"]); // "An"
```

### Lỗi 2: Copy object bằng dấu = (copy tham chiếu)

```js
// ❌ Sai — cả hai biến trỏ đến CÙNG object
let a = { ten: "An", tuoi: 25 };
let b = a;
b.tuoi = 30;
console.log(a.tuoi); // 30 — a cũng bị thay đổi!

// ✅ Đúng — tạo bản sao mới
let c = { ten: "An", tuoi: 25 };
let d = { ...c }; // spread operator
d.tuoi = 30;
console.log(c.tuoi); // 25 — c không bị ảnh hưởng
```

### Lỗi 3: Quên dấu phẩy giữa các property

```js
// ❌ Sai — thiếu dấu phẩy
let obj = {
  ten: "An"
  tuoi: 25   // SyntaxError!
};

// ✅ Đúng
let obj2 = {
  ten: "An",
  tuoi: 25,  // dấu phẩy sau property cuối cũng OK (trailing comma)
};
```

---

## Câu hỏi phỏng vấn

### Câu 1: Làm thế nào để clone (sao chép) object?

**Đáp án:** Có nhiều cách:

```js
let goc = { ten: "An", tuoi: 25, sothich: ["đọc sách", "bơi"] };

// Cách 1: Spread operator (shallow copy)
let ban1 = { ...goc };

// Cách 2: Object.assign() (shallow copy)
let ban2 = Object.assign({}, goc);

// Cách 3: JSON (deep copy — có hạn chế)
let ban3 = JSON.parse(JSON.stringify(goc));

// Cách 4: structuredClone() (deep copy — hiện đại)
let ban4 = structuredClone(goc);
```

### Câu 2: Shallow copy và deep copy khác nhau thế nào?

**Đáp án:**

```js
let goc = { ten: "An", diaChi: { thanhPho: "HN", quan: "CG" } };

// Shallow copy — chỉ copy cấp 1, object lồng nhau vẫn là tham chiếu
let shallow = { ...goc };
shallow.diaChi.thanhPho = "HCM";
console.log(goc.diaChi.thanhPho); // "HCM" — bị thay đổi theo!

// Deep copy — copy toàn bộ, không ảnh hưởng nhau
let deep = structuredClone(goc);
deep.diaChi.thanhPho = "ĐN";
console.log(goc.diaChi.thanhPho); // "HCM" — không bị ảnh hưởng
```

| Loại          | Copy cấp 1 | Copy object lồng nhau | Phương thức               |
|---------------|-------------|----------------------|---------------------------|
| Shallow copy  | Tạo mới     | Vẫn tham chiếu       | `{...obj}`, `Object.assign()` |
| Deep copy     | Tạo mới     | Tạo mới hoàn toàn    | `structuredClone()`, `JSON.parse(JSON.stringify())` |

### Câu 3: Object.freeze() và Object.seal() khác nhau thế nào?

**Đáp án:**

```js
// Object.freeze() — ĐÓNG BĂNG hoàn toàn: không thêm, sửa, xóa
let frozen = Object.freeze({ ten: "An", tuoi: 25 });
frozen.tuoi = 30;      // Không có tác dụng (strict mode: TypeError)
frozen.email = "a@b";  // Không có tác dụng
delete frozen.ten;     // Không có tác dụng
console.log(frozen);   // { ten: "An", tuoi: 25 }

// Object.seal() — NIÊM PHONG: không thêm, không xóa, NHƯNG CÓ THỂ SỬA
let sealed = Object.seal({ ten: "An", tuoi: 25 });
sealed.tuoi = 30;      // OK — sửa được
sealed.email = "a@b";  // Không có tác dụng — không thêm được
delete sealed.ten;     // Không có tác dụng — không xóa được
console.log(sealed);   // { ten: "An", tuoi: 30 }
```

| Thao tác        | `Object.freeze()` | `Object.seal()` | Object thường |
|-----------------|--------------------|------------------|---------------|
| Sửa value       | Không              | Có               | Có            |
| Thêm property   | Không              | Không            | Có            |
| Xóa property    | Không              | Không            | Có            |

### Câu 4: Sự khác nhau giữa dot notation và bracket notation?

**Đáp án:**

```js
let obj = { "ho-ten": "An", tuoi: 25 };
let key = "tuoi";

// Dot notation — đơn giản, nhưng key phải là tên biến hợp lệ
console.log(obj.tuoi); // 25

// Bracket notation — linh hoạt hơn
console.log(obj["ho-ten"]); // "An" — key có ký tự đặc biệt
console.log(obj[key]);      // 25 — dùng biến làm key
```

Dùng **dot notation** khi key là tên đơn giản. Dùng **bracket notation** khi key có ký tự đặc biệt hoặc là biến.

### Câu 5: Làm sao duyệt qua tất cả property của object?

**Đáp án:** Có 3 cách phổ biến:

```js
let xe = { hang: "Toyota", mau: "Trắng", nam: 2024 };

// Cách 1: for...in (duyệt cả prototype chain)
for (let key in xe) {
  if (xe.hasOwnProperty(key)) { // kiểm tra để tránh lấy property từ prototype
    console.log(key + ": " + xe[key]);
  }
}

// Cách 2: Object.keys() + forEach
Object.keys(xe).forEach(function (key) {
  console.log(key + ": " + xe[key]);
});

// Cách 3: Object.entries() + for...of (khuyến khích)
for (let [key, value] of Object.entries(xe)) {
  console.log(key + ": " + value);
}
```
