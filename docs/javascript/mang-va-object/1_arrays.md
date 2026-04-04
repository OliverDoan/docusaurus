---
sidebar_position: 1
title: "Mảng (Array)"
---

# Mảng (Array)

## Mảng là gì?

Hãy tưởng tượng bạn có **danh sách mua sắm** ghi trên giấy:

```
1. Sữa
2. Trứng
3. Bánh mì
4. Bơ
```

Trong JavaScript, **mảng (array)** chính là cách lưu trữ một danh sách như vậy. Thay vì tạo 4 biến riêng biệt, bạn gom tất cả vào **một biến duy nhất**.

```js
// Không dùng mảng — phải tạo nhiều biến
let mon1 = "Sữa";
let mon2 = "Trứng";
let mon3 = "Bánh mì";
let mon4 = "Bơ";

// Dùng mảng — gọn gàng hơn nhiều!
let danhSachMuaSam = ["Sữa", "Trứng", "Bánh mì", "Bơ"];
```

> Ví dụ thực tế khác: **hàng ghế trong rạp phim** — mỗi ghế có số thứ tự (0, 1, 2...) và mỗi ghế chứa tên người ngồi.

## Tại sao mảng ra đời?

Trước khi có mảng, lập trình viên phải tạo hàng trăm biến riêng lẻ để lưu dữ liệu cùng loại. Ví dụ: lưu điểm 100 học sinh cần 100 biến!

Mảng ra đời để giải quyết bài toán: **lưu trữ danh sách dữ liệu cùng loại trong một cấu trúc duy nhất**, giúp dễ dàng thêm, xóa, tìm kiếm và duyệt qua từng phần tử.

## Cách sử dụng

### Tạo mảng

```js
// Cách 1: Dùng dấu ngoặc vuông [] (khuyến khích)
let trai_cay = ["Táo", "Cam", "Xoài"];

// Cách 2: Dùng Array constructor (ít dùng)
let so = new Array(1, 2, 3);

// Mảng rỗng
let mangRong = [];

// Mảng chứa nhiều kiểu dữ liệu (JS cho phép, nhưng không nên)
let honHop = ["Hà Nội", 25, true, null];
```

### Truy cập phần tử (index bắt đầu từ 0)

```js
let mauSac = ["Đỏ", "Xanh", "Vàng", "Tím"];

// Index:      0       1       2       3

console.log(mauSac[0]); // "Đỏ"   — phần tử đầu tiên
console.log(mauSac[2]); // "Vàng" — phần tử thứ 3
console.log(mauSac[4]); // undefined — vượt quá phạm vi
```

> **Lưu ý quan trọng:** Index bắt đầu từ **0**, không phải 1. Đây là điều nhiều người mới hay nhầm!

### Độ dài mảng (length)

```js
let hoaQua = ["Táo", "Cam", "Xoài"];
console.log(hoaQua.length); // 3

// Phần tử cuối cùng
console.log(hoaQua[hoaQua.length - 1]); // "Xoài"
```

### Thêm phần tử

```js
let dongVat = ["Mèo", "Chó"];

// push — thêm vào CUỐI mảng
dongVat.push("Cá");
console.log(dongVat); // ["Mèo", "Chó", "Cá"]

// unshift — thêm vào ĐẦU mảng
dongVat.unshift("Gà");
console.log(dongVat); // ["Gà", "Mèo", "Chó", "Cá"]
```

### Xóa phần tử

```js
let so = [10, 20, 30, 40, 50];

// pop — xóa phần tử CUỐI, trả về phần tử bị xóa
let cuoi = so.pop();
console.log(cuoi); // 50
console.log(so);   // [10, 20, 30, 40]

// shift — xóa phần tử ĐẦU, trả về phần tử bị xóa
let dau = so.shift();
console.log(dau); // 10
console.log(so);  // [20, 30, 40]
```

### splice — thêm/xóa ở vị trí bất kỳ

```js
let mon = ["Phở", "Bún", "Cơm", "Mì"];

// Xóa 1 phần tử tại vị trí index 1
mon.splice(1, 1);
console.log(mon); // ["Phở", "Cơm", "Mì"]

// Thêm "Bánh cuốn" tại vị trí index 1 (không xóa phần tử nào)
mon.splice(1, 0, "Bánh cuốn");
console.log(mon); // ["Phở", "Bánh cuốn", "Cơm", "Mì"]

// Thay thế: xóa 1 phần tử tại index 2, thêm "Cháo" vào đó
mon.splice(2, 1, "Cháo");
console.log(mon); // ["Phở", "Bánh cuốn", "Cháo", "Mì"]
```

### Bảng tóm tắt

| Phương thức | Vị trí     | Hành động      | Trả về             |
|-------------|-----------|----------------|---------------------|
| `push()`    | Cuối      | Thêm phần tử   | Độ dài mới          |
| `pop()`     | Cuối      | Xóa phần tử    | Phần tử bị xóa     |
| `unshift()` | Đầu       | Thêm phần tử   | Độ dài mới          |
| `shift()`   | Đầu       | Xóa phần tử    | Phần tử bị xóa     |
| `splice()`  | Bất kỳ    | Thêm/Xóa/Thay  | Mảng phần tử bị xóa|

## Khi nào dùng?

- **Danh sách sản phẩm** trong giỏ hàng
- **Danh sách bài viết** trên trang blog
- **Danh sách người dùng** trong ứng dụng
- **Điểm số học sinh** trong lớp học
- Bất kỳ lúc nào bạn cần lưu **nhiều giá trị cùng loại**

## Lỗi thường gặp

### Lỗi 1: Nhầm index bắt đầu từ 1

```js
let mau = ["Đỏ", "Xanh", "Vàng"];

// ❌ Sai — nghĩ index bắt đầu từ 1
console.log(mau[1]); // "Xanh", không phải "Đỏ"!

// ✅ Đúng — index bắt đầu từ 0
console.log(mau[0]); // "Đỏ"
```

### Lỗi 2: Dùng typeof để kiểm tra mảng

```js
let arr = [1, 2, 3];

// ❌ Sai — typeof trả về "object" cho mảng
console.log(typeof arr); // "object" — không biết đây là mảng!

// ✅ Đúng — dùng Array.isArray()
console.log(Array.isArray(arr)); // true
```

### Lỗi 3: So sánh hai mảng bằng ===

```js
// ❌ Sai — so sánh tham chiếu, không phải giá trị
let a = [1, 2, 3];
let b = [1, 2, 3];
console.log(a === b); // false!

// ✅ Đúng — so sánh từng phần tử
console.log(JSON.stringify(a) === JSON.stringify(b)); // true
```

---

## Câu hỏi phỏng vấn

### Câu 1: Array trong JavaScript có phải là object không?

**Đáp án:** Có! Array trong JavaScript thực chất là một **loại object đặc biệt**. Nó có các tính chất giống object (key-value pairs) nhưng key là các chỉ số (index) dạng số.

```js
let arr = ["a", "b", "c"];

console.log(typeof arr); // "object"

// Thực chất bên trong, mảng giống như:
// { 0: "a", 1: "b", 2: "c", length: 3 }
```

### Câu 2: Làm thế nào để kiểm tra một biến có phải là mảng?

**Đáp án:** Có 2 cách phổ biến:

```js
let arr = [1, 2, 3];
let obj = { name: "An" };

// Cách 1: Array.isArray() — KHUYẾN KHÍCH
console.log(Array.isArray(arr)); // true
console.log(Array.isArray(obj)); // false

// Cách 2: instanceof
console.log(arr instanceof Array); // true
console.log(obj instanceof Array); // false
```

`Array.isArray()` được ưu tiên hơn vì hoạt động đúng cả khi mảng đến từ iframe hoặc window khác.

### Câu 3: Array trong JS có kích thước cố định không?

**Đáp án:** Không! Khác với nhiều ngôn ngữ như C hay Java, mảng trong JavaScript có kích thước **linh hoạt (dynamic)**. Bạn có thể thêm hoặc xóa phần tử bất kỳ lúc nào mà không cần khai báo kích thước trước.

```js
let arr = []; // mảng rỗng
arr.push(1);  // [1]
arr.push(2);  // [1, 2]
arr.push(3);  // [1, 2, 3]
// Không cần khai báo kích thước!
```

### Câu 4: Sự khác nhau giữa push/pop và unshift/shift?

**Đáp án:**

```js
let arr = [2, 3, 4];

// push/pop — thao tác ở CUỐI mảng (nhanh hơn)
arr.push(5);    // [2, 3, 4, 5]
arr.pop();      // [2, 3, 4]

// unshift/shift — thao tác ở ĐẦU mảng (chậm hơn vì phải dịch index)
arr.unshift(1); // [1, 2, 3, 4]
arr.shift();    // [2, 3, 4]
```

`unshift`/`shift` chậm hơn vì phải **dịch chuyển index** của tất cả phần tử còn lại.

### Câu 5: splice() và slice() khác nhau thế nào?

**Đáp án:**

```js
let arr = [1, 2, 3, 4, 5];

// splice() — THAY ĐỔI mảng gốc (thêm/xóa phần tử)
arr.splice(1, 2);
console.log(arr); // [1, 4, 5] — mảng gốc bị thay đổi!

// slice() — KHÔNG thay đổi mảng gốc (cắt ra mảng con)
let arr2 = [1, 2, 3, 4, 5];
let ketQua = arr2.slice(1, 3);
console.log(ketQua); // [2, 3]
console.log(arr2);   // [1, 2, 3, 4, 5] — mảng gốc giữ nguyên
```

| Đặc điểm       | `splice()`            | `slice()`              |
|----------------|-----------------------|------------------------|
| Thay đổi gốc?  | Có                    | Không                  |
| Mục đích        | Thêm/Xóa phần tử     | Cắt ra mảng con        |
| Trả về          | Mảng phần tử bị xóa  | Mảng con mới           |
