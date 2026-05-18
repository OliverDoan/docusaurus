---
sidebar_position: 2
title: "2. Destructuring"
---

# Destructuring


---

## Mục lục

- [Destructuring là gì?](#destructuring-là-gì)
- [Tại sao destructuring ra đời?](#tại-sao-destructuring-ra-đời)
- [Cách sử dụng](#cách-sử-dụng)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Destructuring là gì?

Hãy tưởng tượng bạn nhận được một **hộp quà** có 3 món bên trong: áo, giày, và mũ. Thay vì mở hộp ra rồi lấy từng món:

```
Mở hộp → lấy món 1 → lấy món 2 → lấy món 3
```

Bạn **mở hộp và lấy tất cả cùng lúc**:

```
Mở hộp → áo, giày, mũ (lấy ra cùng lúc!)
```

Trong JavaScript, **destructuring** cho phép bạn "mở" array hoặc object và lấy giá trị bên trong ra thành các biến riêng lẻ trong **một dòng code**.

```js
// Không dùng destructuring — phải lấy từng cái
let mau = ["Đỏ", "Xanh", "Vàng"];
let mau1 = mau[0];
let mau2 = mau[1];
let mau3 = mau[2];

// Dùng destructuring — gọn hơn nhiều!
let [mau1, mau2, mau3] = ["Đỏ", "Xanh", "Vàng"];
```

## Tại sao destructuring ra đời?

Trước ES6 (2015), việc truy cập giá trị từ array/object rất **dài dòng và lặp lại**:

```js
// Trước ES6 — phải viết lặp đi lặp lại
let nguoiDung = { ten: "An", tuoi: 25, email: "an@email.com" };
let ten = nguoiDung.ten;
let tuoi = nguoiDung.tuoi;
let email = nguoiDung.email;
```

ES6 giới thiệu destructuring để:
- Code **ngắn gọn** hơn
- **Tránh lặp** `object.property` nhiều lần
- Kết hợp tốt với **functional programming**

## Cách sử dụng

### Array Destructuring

```js
// Cơ bản — lấy phần tử theo thứ tự
let [a, b, c] = [10, 20, 30];
console.log(a); // 10
console.log(b); // 20
console.log(c); // 30

// Bỏ qua phần tử — dùng dấu phẩy
let [dau, , cuoi] = ["Phở", "Bún", "Cơm"];
console.log(dau);  // "Phở"
console.log(cuoi); // "Cơm" — bỏ qua "Bún"

// Giá trị mặc định — dùng khi phần tử không tồn tại
let [x, y, z = 99] = [1, 2];
console.log(z); // 99 — vì phần tử thứ 3 không có

// Rest operator (...) — gom phần tử còn lại
let [first, ...rest] = [1, 2, 3, 4, 5];
console.log(first); // 1
console.log(rest);  // [2, 3, 4, 5]
```

### Object Destructuring

```js
let nguoiDung = {
  ten: "Bình",
  tuoi: 28,
  email: "binh@email.com",
  thanhPho: "Hà Nội",
};

// Cơ bản — lấy theo tên property
let { ten, tuoi, email } = nguoiDung;
console.log(ten);   // "Bình"
console.log(tuoi);  // 28
console.log(email); // "binh@email.com"

// Đổi tên biến — khi muốn tên khác property
let { ten: hoTen, tuoi: namTuoi } = nguoiDung;
console.log(hoTen);   // "Bình"
console.log(namTuoi);  // 28

// Giá trị mặc định — khi property không tồn tại
let { ten: t, sdt = "Chưa có" } = nguoiDung;
console.log(t);   // "Bình"
console.log(sdt); // "Chưa có" — vì nguoiDung không có property "sdt"

// Rest operator — gom property còn lại
let { ten: name, ...conLai } = nguoiDung;
console.log(name);   // "Bình"
console.log(conLai); // { tuoi: 28, email: "binh@email.com", thanhPho: "Hà Nội" }
```

### Nested Destructuring (lồng nhau)

```js
let hocSinh = {
  ten: "Chi",
  diem: {
    toan: 9,
    van: 8,
    anh: 7,
  },
  sothich: ["đọc sách", "vẽ", "bơi"],
};

// Destructuring lồng nhau
let {
  ten,
  diem: { toan, van },
  sothich: [soThich1, soThich2],
} = hocSinh;

console.log(ten);      // "Chi"
console.log(toan);     // 9
console.log(van);      // 8
console.log(soThich1); // "đọc sách"
console.log(soThich2); // "vẽ"
```

### Function Parameter Destructuring

Đây là một trong những ứng dụng **hay nhất** của destructuring:

```js
// ❌ Không dùng destructuring — phải truy cập từng property
function gioiThieu(nguoi) {
  return "Tôi là " + nguoi.ten + ", " + nguoi.tuoi + " tuổi, ở " + nguoi.thanhPho;
}

// ✅ Dùng destructuring trong tham số — gọn hơn!
function gioiThieu({ ten, tuoi, thanhPho }) {
  return "Tôi là " + ten + ", " + tuoi + " tuổi, ở " + thanhPho;
}

let an = { ten: "An", tuoi: 25, thanhPho: "HCM", email: "an@email.com" };
console.log(gioiThieu(an));
// "Tôi là An, 25 tuổi, ở HCM"
```

```js
// Destructuring với giá trị mặc định trong tham số
function taoUser({ ten, tuoi = 18, vaiTro = "user" } = {}) {
  return { ten, tuoi, vaiTro };
}

console.log(taoUser({ ten: "An" }));
// { ten: "An", tuoi: 18, vaiTro: "user" }

console.log(taoUser({ ten: "Bình", tuoi: 30, vaiTro: "admin" }));
// { ten: "Bình", tuoi: 30, vaiTro: "admin" }
```

## Khi nào dùng?

- **Import nhiều giá trị** từ module: `const { useState, useEffect } = React`
- **Lấy dữ liệu từ API**: `const { data, error, loading } = response`
- **Function nhận object** làm tham số
- **Swap giá trị** giữa 2 biến
- **Lấy phần tử** từ mảng kết quả

## Lỗi thường gặp

### Lỗi 1: Destructuring object nhưng viết giống array

```js
let user = { ten: "An", tuoi: 25 };

// ❌ Sai — dùng [] cho object
let [ten, tuoi] = user; // TypeError!

// ✅ Đúng — dùng {} cho object
let { ten, tuoi } = user;
```

### Lỗi 2: Tên biến không khớp với key

```js
let obj = { name: "An", age: 25 };

// ❌ Sai — tên không khớp → undefined
let { ten, tuoi } = obj;
console.log(ten);  // undefined
console.log(tuoi); // undefined

// ✅ Đúng — dùng đúng tên key hoặc đổi tên
let { name: ten, age: tuoi } = obj;
console.log(ten);  // "An"
console.log(tuoi); // 25
```

### Lỗi 3: Destructuring null/undefined

```js
// ❌ Sai — crash khi giá trị là null/undefined
let data = null;
// let { ten } = data; // TypeError: Cannot destructure property 'ten' of null

// ✅ Đúng — dùng giá trị mặc định
let { ten } = data || {};
console.log(ten); // undefined (không crash)
```

---

## Câu hỏi phỏng vấn

### Câu 1: Destructuring hoạt động thế nào bên trong?

**Đáp án:** Destructuring là **cú pháp rút gọn (syntactic sugar)** được JavaScript engine chuyển đổi thành code truyền thống:

```js
// Bạn viết:
let { ten, tuoi } = { ten: "An", tuoi: 25 };

// JavaScript engine hiểu:
let ten = { ten: "An", tuoi: 25 }.ten;
let tuoi = { ten: "An", tuoi: 25 }.tuoi;
```

Với array, destructuring dựa trên **thứ tự index**. Với object, dựa trên **tên key**.

### Câu 2: Swap 2 biến không dùng biến tạm?

**Đáp án:**

```js
let a = 1;
let b = 2;

// ❌ Cách truyền thống — cần biến tạm
let temp = a;
a = b;
b = temp;

// ✅ Dùng array destructuring — không cần biến tạm!
[a, b] = [b, a];

console.log(a); // 2
console.log(b); // 1
```

Đây là bài trick interview rất phổ biến!

### Câu 3: Destructuring có thể dùng với giá trị trả về từ function không?

**Đáp án:** Hoàn toàn được! Đây là pattern rất phổ biến:

```js
// Function trả về array
function layToaDo() {
  return [10.5, 106.7];
}
let [viDo, kinhDo] = layToaDo();
console.log(viDo);   // 10.5
console.log(kinhDo); // 106.7

// Function trả về object
function layThongTin() {
  return { ten: "An", tuoi: 25, email: "an@email.com" };
}
let { ten, email } = layThongTin(); // chỉ lấy cái cần
console.log(ten);   // "An"
console.log(email); // "an@email.com"
```

### Câu 4: Nested destructuring có giới hạn không?

**Đáp án:** Không có giới hạn kỹ thuật, nhưng destructuring quá sâu sẽ **khó đọc**:

```js
// ❌ Quá phức tạp — khó đọc, khó bảo trì
let {
  a: {
    b: {
      c: {
        d: value,
      },
    },
  },
} = obj;

// ✅ Tốt hơn — destructuring từng bước
let { a } = obj;
let { b } = a;
let { c } = b;
let { d: value } = c;
```

Quy tắc: destructuring tối đa **2 cấp**. Sâu hơn nên tách ra.

### Câu 5: Khi nào KHÔNG nên dùng destructuring?

**Đáp án:**

```js
// ❌ Chỉ cần 1 property — destructuring không cần thiết
let { ten } = nguoiDung;
// Viết thẳng đơn giản hơn:
let ten = nguoiDung.ten;

// ❌ Tên property quá dài hoặc cần xử lý thêm
let { danhSachSanPhamDaMua: ds } = gioHang;
// Khó đọc hơn:
let ds = gioHang.danhSachSanPhamDaMua;

// ✅ NÊN dùng khi lấy nhiều property cùng lúc
let { ten, tuoi, email, sdt, diaChi } = nguoiDung;
```
