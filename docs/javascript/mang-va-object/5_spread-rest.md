---
sidebar_position: 5
title: "5. Spread title: "Spread & Rest Operators" Rest Operators"
---

# Spread & Rest Operators

## Spread operator là gì?

Hãy tưởng tượng bạn có một **hộp bi** chứa 5 viên bi. **Spread** giống như việc bạn **đổ tất cả bi ra bàn** — từ một nhóm gọn gàng thành từng viên riêng lẻ.

```js
let bi = [1, 2, 3, 4, 5];

// Spread — "đổ" mảng ra thành từng phần tử riêng
console.log(...bi); // 1 2 3 4 5 (không phải [1, 2, 3, 4, 5])
```

Spread operator (`...`) dùng để **trải (spread)** các phần tử của array hoặc property của object ra.

## Rest operator là gì?

Ngược lại với spread, **rest** giống như việc bạn **gom các viên bi còn lại** vào một túi. Bạn lấy 2 viên đầu, phần còn lại gom hết vào túi.

```js
// Rest — "gom" phần tử còn lại vào một mảng
let [vien1, vien2, ...conLai] = [1, 2, 3, 4, 5];
console.log(vien1);   // 1
console.log(vien2);   // 2
console.log(conLai);  // [3, 4, 5]
```

Rest operator (`...`) dùng để **gom (rest)** các phần tử còn lại vào một array hoặc object.

## Tại sao Spread & Rest ra đời?

Trước ES6, muốn copy mảng hoặc merge object rất phiền phức:

```js
// Trước ES6 — copy mảng
let goc = [1, 2, 3];
let banSao = goc.slice(); // hoặc [].concat(goc)

// Trước ES6 — merge object
let obj1 = { a: 1 };
let obj2 = { b: 2 };
let merged = Object.assign({}, obj1, obj2);

// Trước ES6 — hàm nhận số tham số không cố định
function tong() {
  var args = Array.prototype.slice.call(arguments);
  // ... phức tạp!
}
```

ES6 giới thiệu `...` để giải quyết các vấn đề này một cách **đơn giản và dễ đọc**.

## Cách sử dụng

### Spread với Array

```js
// Copy mảng
let goc = [1, 2, 3];
let banSao = [...goc];
console.log(banSao); // [1, 2, 3]

banSao.push(4);
console.log(goc);    // [1, 2, 3] — mảng gốc KHÔNG bị thay đổi
console.log(banSao); // [1, 2, 3, 4]

// Nối (merge) mảng
let rauCu = ["Cà rốt", "Bắp cải"];
let traicay = ["Táo", "Cam"];
let thucPham = [...rauCu, ...traicay];
console.log(thucPham); // ["Cà rốt", "Bắp cải", "Táo", "Cam"]

// Thêm phần tử vào mảng mới
let so = [2, 3, 4];
let soMoi = [1, ...so, 5];
console.log(soMoi); // [1, 2, 3, 4, 5]

// Truyền mảng vào function
let diemSo = [75, 82, 91, 67, 88];
let diemCaoNhat = Math.max(...diemSo);
console.log(diemCaoNhat); // 91
```

### Spread với Object

```js
// Copy object
let user = { ten: "An", tuoi: 25 };
let userCopy = { ...user };
console.log(userCopy); // { ten: "An", tuoi: 25 }

// Merge object
let thongTinCoBan = { ten: "An", tuoi: 25 };
let thongTinLienLac = { email: "an@email.com", sdt: "0123456789" };
let hoSo = { ...thongTinCoBan, ...thongTinLienLac };
console.log(hoSo);
// { ten: "An", tuoi: 25, email: "an@email.com", sdt: "0123456789" }

// Ghi đè property (property sau ghi đè property trước)
let macDinh = { theme: "light", fontSize: 14, lang: "vi" };
let tuyChinh = { theme: "dark", fontSize: 16 };
let caiDat = { ...macDinh, ...tuyChinh };
console.log(caiDat);
// { theme: "dark", fontSize: 16, lang: "vi" }

// Cập nhật 1 property mà không thay đổi object gốc (immutable update)
let sanPham = { ten: "Cà phê", gia: 35000, soLuong: 10 };
let sanPhamCapNhat = { ...sanPham, gia: 40000 };
console.log(sanPham);         // { ten: "Cà phê", gia: 35000, soLuong: 10 } — không đổi
console.log(sanPhamCapNhat);  // { ten: "Cà phê", gia: 40000, soLuong: 10 }
```

### Rest trong Function Parameters

```js
// Gom tham số còn lại vào mảng
function giamGia(phanTram, ...giaGoc) {
  return giaGoc.map(function (g) {
    return g * (1 - phanTram / 100);
  });
}

console.log(giamGia(10, 100000, 200000, 300000));
// [90000, 180000, 270000]

// Hàm nhận số tham số không giới hạn
function tinhTong(...so) {
  return so.reduce(function (tong, s) {
    return tong + s;
  }, 0);
}

console.log(tinhTong(1, 2, 3));       // 6
console.log(tinhTong(10, 20, 30, 40)); // 100
```

### Rest trong Destructuring

```js
// Array destructuring + rest
let [dau, ...duoi] = [1, 2, 3, 4, 5];
console.log(dau);  // 1
console.log(duoi); // [2, 3, 4, 5]

// Object destructuring + rest
let user = { ten: "An", tuoi: 25, email: "an@email.com", sdt: "012" };
let { ten, ...thongTinKhac } = user;
console.log(ten);         // "An"
console.log(thongTinKhac); // { tuoi: 25, email: "an@email.com", sdt: "012" }
```

## Spread vs Rest — Cùng cú pháp, khác ngữ cảnh

| Đặc điểm      | Spread (`...`)               | Rest (`...`)                    |
|---------------|-----------------------------|---------------------------------|
| Ý nghĩa       | Trải ra (expand)            | Gom lại (collect)               |
| Vị trí        | Bên phải dấu `=`           | Bên trái dấu `=` hoặc tham số  |
| Kết quả       | Tách thành phần tử riêng lẻ | Gom thành array/object          |

```js
// SPREAD — bên phải, trải ra
let arr = [1, ...[2, 3], 4]; // [1, 2, 3, 4]

// REST — bên trái, gom lại
let [a, ...b] = [1, 2, 3, 4]; // a = 1, b = [2, 3, 4]
```

## Khi nào dùng?

### Spread

- **Clone array/object** mà không ảnh hưởng bản gốc
- **Merge** nhiều array/object lại
- **Immutable update** — cập nhật mà không thay đổi gốc (quan trọng trong React!)
- Truyền **mảng vào function** nhận nhiều tham số riêng lẻ

### Rest

- Hàm nhận **số tham số không cố định**
- **Tách phần tử** khi destructuring: lấy một vài cái, gom phần còn lại
- **Loại bỏ property** khỏi object

```js
// Loại bỏ password khỏi user object
let user = { ten: "An", email: "an@email.com", password: "secret" };
let { password, ...safeUser } = user;
console.log(safeUser); // { ten: "An", email: "an@email.com" }
```

## Lỗi thường gặp

### Lỗi 1: Nghĩ spread tạo deep copy

```js
let goc = { ten: "An", diaChi: { thanhPho: "HN" } };

// ❌ Sai — spread chỉ tạo SHALLOW copy
let banSao = { ...goc };
banSao.diaChi.thanhPho = "HCM";
console.log(goc.diaChi.thanhPho); // "HCM" — bị thay đổi!

// ✅ Đúng — deep copy nếu cần
let banSaoSau = structuredClone(goc);
// Hoặc spread lồng nhau
let banSao2 = { ...goc, diaChi: { ...goc.diaChi } };
```

### Lỗi 2: Đặt rest ở sai vị trí

```js
// ❌ Sai — rest phải ở VỊ TRÍ CUỐI CÙNG
// let [...dau, cuoi] = [1, 2, 3]; // SyntaxError!

// ✅ Đúng — rest luôn ở cuối
let [dau, ...conLai] = [1, 2, 3];
```

### Lỗi 3: Nhầm spread array và object

```js
// ❌ Sai — spread array vào object
let arr = [1, 2, 3];
let obj = { ...arr };
console.log(obj); // { 0: 1, 1: 2, 2: 3 } — không phải kết quả mong muốn!

// ✅ Đúng — spread array vào array
let arr2 = [...arr];
console.log(arr2); // [1, 2, 3]
```

---

## Câu hỏi phỏng vấn

### Câu 1: Spread operator và Rest operator khác nhau thế nào?

**Đáp án:** Cả hai dùng cú pháp `...` nhưng hoạt động **ngược nhau**:

```js
// SPREAD — trải ra, dùng ở nơi CẦN các giá trị riêng lẻ
let merged = [...arr1, ...arr2]; // trải arr1 và arr2 ra

// REST — gom lại, dùng ở nơi KHAI BÁO biến hoặc tham số
function sum(...numbers) {} // gom tham số vào mảng numbers
let [first, ...rest] = arr; // gom phần còn lại vào rest
```

### Câu 2: Spread có tạo deep copy không?

**Đáp án:** Không! Spread chỉ tạo **shallow copy** (sao chép cấp 1). Object/array lồng nhau vẫn là tham chiếu:

```js
let a = { x: 1, y: { z: 2 } };
let b = { ...a };

b.x = 100;
console.log(a.x); // 1 — OK, không bị ảnh hưởng (cấp 1)

b.y.z = 200;
console.log(a.y.z); // 200 — BỊ ảnh hưởng (cấp 2, vẫn là tham chiếu!)
```

Để deep copy, dùng `structuredClone()` hoặc `JSON.parse(JSON.stringify())`.

### Câu 3: Làm sao merge 2 object mà property sau ghi đè property trước?

**Đáp án:**

```js
let config1 = { theme: "light", lang: "vi", fontSize: 14 };
let config2 = { theme: "dark", fontSize: 16 };

// Spread — property sau ghi đè property trước
let ketQua = { ...config1, ...config2 };
console.log(ketQua);
// { theme: "dark", lang: "vi", fontSize: 16 }

// Thứ tự quan trọng!
let nguoc = { ...config2, ...config1 };
console.log(nguoc);
// { theme: "light", lang: "vi", fontSize: 14 }
// → config1 ghi đè config2 vì config1 đứng SAU
```

### Câu 4: Rest parameter khác gì với arguments object?

**Đáp án:**

```js
// arguments — object giống mảng (array-like), KHÔNG phải mảng thật
function oldWay() {
  console.log(arguments);        // { 0: 1, 1: 2, 2: 3, length: 3 }
  // arguments.map(...) // TypeError! Không có method của mảng
  console.log(Array.isArray(arguments)); // false
}

// rest parameter — mảng THẬT, có đầy đủ method
function newWay(...args) {
  console.log(args);             // [1, 2, 3]
  console.log(args.map(function (x) { return x * 2; })); // [2, 4, 6]
  console.log(Array.isArray(args)); // true
}

oldWay(1, 2, 3);
newWay(1, 2, 3);
```

| Đặc điểm           | `arguments`         | Rest `...args`    |
|--------------------|---------------------|-------------------|
| Kiểu               | Array-like object   | Array thật        |
| Có map/filter?     | Không               | Có                |
| Arrow function?    | Không có            | Có                |
| Chọn phần nào?     | Lấy tất cả         | Linh hoạt         |

### Câu 5: Cho ví dụ thực tế khi cần dùng spread operator?

**Đáp án:** Ví dụ phổ biến nhất là **immutable state update** (rất quan trọng trong React):

```js
// State ban đầu
let gioHang = {
  sanPham: [
    { id: 1, ten: "Sữa", soLuong: 2 },
    { id: 2, ten: "Trứng", soLuong: 1 },
  ],
  tongTien: 60000,
};

// Thêm sản phẩm mới — KHÔNG thay đổi state gốc
let gioHangMoi = {
  ...gioHang,
  sanPham: [...gioHang.sanPham, { id: 3, ten: "Bánh mì", soLuong: 3 }],
  tongTien: gioHang.tongTien + 45000,
};

console.log(gioHang.sanPham.length);    // 2 — không đổi
console.log(gioHangMoi.sanPham.length); // 3 — thêm mới
```
