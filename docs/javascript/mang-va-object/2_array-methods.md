---
sidebar_position: 2
title: "Phương thức mảng"
---

# Phương thức mảng

## Phương thức mảng là gì?

Hãy tưởng tượng bạn có một **danh sách học sinh** và cần thực hiện các thao tác: tìm học sinh giỏi nhất, lọc ra ai đậu, tính điểm trung bình... Thay vì viết vòng lặp `for` thủ công cho mỗi thao tác, JavaScript cung cấp sẵn các **phương thức (methods)** để làm việc này nhanh gọn hơn.

> Giống như chiếc **máy rửa bát** — thay vì rửa từng cái bằng tay (vòng lặp), bạn bỏ tất cả vào máy và chọn chế độ phù hợp (method).

## Tại sao phương thức mảng ra đời?

Trước ES5/ES6, lập trình viên phải viết vòng lặp `for` cho mọi thao tác trên mảng. Code dài, dễ lỗi, khó đọc. Các phương thức mảng ra đời theo phong cách **functional programming** giúp:

- Code **ngắn gọn**, dễ đọc hơn
- **Giảm lỗi** vì không cần quản lý biến đếm
- **Nói rõ ý định**: `filter` nghĩa là lọc, `map` nghĩa là biến đổi — đọc tên là hiểu ngay

## Cách sử dụng

### forEach — Duyệt qua từng phần tử

```js
// Duyệt và in ra từng phần tử
let hoaQua = ["Táo", "Cam", "Xoài"];

hoaQua.forEach(function (qua, index) {
  console.log(index + ": " + qua);
});
// 0: Táo
// 1: Cam
// 2: Xoài
```

### map — Biến đổi từng phần tử thành giá trị mới

```js
let gia = [100, 200, 300];

// Tăng giá 10%
let giaMoi = gia.map(function (g) {
  return g * 1.1;
});

console.log(giaMoi); // [110, 220, 330]
console.log(gia);    // [100, 200, 300] — mảng gốc KHÔNG đổi
```

### filter — Lọc phần tử theo điều kiện

```js
let diem = [45, 82, 67, 91, 38, 75];

// Lọc học sinh đậu (>= 50 điểm)
let dau = diem.filter(function (d) {
  return d >= 50;
});

console.log(dau); // [82, 67, 91, 75]
```

### find — Tìm phần tử ĐẦU TIÊN thỏa điều kiện

```js
let nguoiDung = [
  { ten: "An", tuoi: 20 },
  { ten: "Bình", tuoi: 25 },
  { ten: "Chi", tuoi: 20 },
];

let ketQua = nguoiDung.find(function (ng) {
  return ng.tuoi === 20;
});

console.log(ketQua); // { ten: "An", tuoi: 20 } — chỉ trả về phần tử ĐẦU TIÊN
```

### findIndex — Tìm vị trí phần tử đầu tiên thỏa điều kiện

```js
let so = [10, 20, 30, 40];

let viTri = so.findIndex(function (s) {
  return s > 25;
});

console.log(viTri); // 2 (phần tử 30 ở index 2)
```

### some — Kiểm tra CÓ ÍT NHẤT MỘT phần tử thỏa điều kiện

```js
let tuoi = [15, 18, 22, 12];

let coPhuHop = tuoi.some(function (t) {
  return t >= 18;
});

console.log(coPhuHop); // true — có ít nhất 1 người >= 18 tuổi
```

### every — Kiểm tra TẤT CẢ phần tử đều thỏa điều kiện

```js
let diem = [75, 82, 91, 67];

let tatCaDau = diem.every(function (d) {
  return d >= 50;
});

console.log(tatCaDau); // true — tất cả đều >= 50
```

### reduce — Gom tất cả thành MỘT giá trị duy nhất

```js
let gia = [100, 200, 300, 400];

// Tính tổng
let tong = gia.reduce(function (tichLuy, giaTri) {
  return tichLuy + giaTri;
}, 0); // 0 là giá trị khởi tạo

console.log(tong); // 1000
```

```js
// Ví dụ: Đếm số lần xuất hiện của từng phần tử
let traicay = ["Táo", "Cam", "Táo", "Xoài", "Cam", "Táo"];

let demSoLan = traicay.reduce(function (dem, qua) {
  dem[qua] = (dem[qua] || 0) + 1;
  return dem;
}, {});

console.log(demSoLan); // { Táo: 3, Cam: 2, Xoài: 1 }
```

### sort — Sắp xếp mảng

```js
// ❌ Sai — sort() mặc định sắp xếp theo CHUỖI
let so = [10, 5, 40, 25, 100];
so.sort();
console.log(so); // [10, 100, 25, 40, 5] — sai vì so sánh chuỗi!

// ✅ Đúng — truyền hàm so sánh cho số
let so2 = [10, 5, 40, 25, 100];
so2.sort(function (a, b) {
  return a - b; // tăng dần
});
console.log(so2); // [5, 10, 25, 40, 100]
```

### Các phương thức khác

```js
let a = [1, 2, 3];
let b = [4, 5, 6];

// concat — nối mảng (không đổi mảng gốc)
let c = a.concat(b);
console.log(c); // [1, 2, 3, 4, 5, 6]

// includes — kiểm tra phần tử có tồn tại không
console.log(a.includes(2)); // true
console.log(a.includes(9)); // false

// indexOf — tìm vị trí phần tử
console.log(a.indexOf(3)); // 2
console.log(a.indexOf(9)); // -1 (không tìm thấy)

// reverse — đảo ngược mảng (THAY ĐỔI mảng gốc)
let d = [1, 2, 3];
d.reverse();
console.log(d); // [3, 2, 1]

// flat — làm phẳng mảng lồng nhau
let mangLong = [1, [2, 3], [4, [5, 6]]];
console.log(mangLong.flat());  // [1, 2, 3, 4, [5, 6]]
console.log(mangLong.flat(2)); // [1, 2, 3, 4, 5, 6] — flat 2 cấp
```

## Immutable vs Mutating methods (quan trọng!)

| Không đổi mảng gốc (Immutable)   | Thay đổi mảng gốc (Mutating) |
|-----------------------------------|-------------------------------|
| `map()`, `filter()`, `reduce()`  | `sort()`, `reverse()`         |
| `concat()`, `slice()`, `flat()`  | `splice()`, `push()`, `pop()` |
| `find()`, `findIndex()`          | `shift()`, `unshift()`        |
| `some()`, `every()`, `includes()`| `fill()`                      |

```js
// ❌ Cẩn thận! sort() thay đổi mảng gốc
let goc = [3, 1, 2];
let sapXep = goc.sort();
console.log(goc); // [1, 2, 3] — mảng gốc bị thay đổi!

// ✅ Tạo bản sao trước khi sort
let goc2 = [3, 1, 2];
let sapXep2 = [...goc2].sort();
console.log(goc2);    // [3, 1, 2] — giữ nguyên
console.log(sapXep2); // [1, 2, 3]
```

## Khi nào dùng method nào?

| Mục đích                         | Method          | Ví dụ                          |
|----------------------------------|-----------------|---------------------------------|
| Duyệt qua (không cần kết quả)   | `forEach()`     | In ra danh sách                 |
| Biến đổi mỗi phần tử            | `map()`         | Tăng giá 10%                    |
| Lọc theo điều kiện               | `filter()`      | Lọc sản phẩm còn hàng          |
| Tìm 1 phần tử                   | `find()`        | Tìm user theo email             |
| Tìm vị trí                      | `findIndex()`   | Tìm index để xóa               |
| Kiểm tra có tồn tại             | `some()`        | Có ai online không?             |
| Kiểm tra tất cả                 | `every()`       | Tất cả đã thanh toán chưa?     |
| Gom thành 1 giá trị             | `reduce()`      | Tính tổng giỏ hàng             |
| Kiểm tra phần tử                | `includes()`    | Email đã tồn tại chưa?         |
| Sắp xếp                         | `sort()`        | Sắp xếp theo giá               |

## Lỗi thường gặp

### Lỗi 1: Dùng forEach khi cần kết quả mới

```js
let so = [1, 2, 3];

// ❌ Sai — forEach không trả về mảng mới
let ketQua = so.forEach(function (s) {
  return s * 2;
});
console.log(ketQua); // undefined!

// ✅ Đúng — dùng map khi cần mảng mới
let ketQua2 = so.map(function (s) {
  return s * 2;
});
console.log(ketQua2); // [2, 4, 6]
```

### Lỗi 2: Quên return trong map/filter

```js
let so = [1, 2, 3, 4, 5];

// ❌ Sai — quên return
let chan = so.filter(function (s) {
  s % 2 === 0; // quên return!
});
console.log(chan); // [] — mảng rỗng!

// ✅ Đúng — có return
let chan2 = so.filter(function (s) {
  return s % 2 === 0;
});
console.log(chan2); // [2, 4]
```

---

## Câu hỏi phỏng vấn

### Câu 1: map() và forEach() khác nhau thế nào?

**Đáp án:**

```js
let so = [1, 2, 3];

// forEach — chỉ duyệt, KHÔNG trả về gì (undefined)
let a = so.forEach(function (s) { return s * 2; });
console.log(a); // undefined

// map — trả về MẢNG MỚI với các giá trị đã biến đổi
let b = so.map(function (s) { return s * 2; });
console.log(b); // [2, 4, 6]
```

Dùng `map` khi cần tạo mảng mới. Dùng `forEach` khi chỉ cần thực hiện hành động (in ra, ghi log...).

### Câu 2: filter() và find() khác nhau thế nào?

**Đáp án:**

```js
let so = [1, 2, 3, 4, 5, 6];

// filter — trả về TẤT CẢ phần tử thỏa điều kiện (mảng)
let chan = so.filter(function (s) { return s % 2 === 0; });
console.log(chan); // [2, 4, 6]

// find — trả về phần tử ĐẦU TIÊN thỏa điều kiện (giá trị đơn)
let chanDau = so.find(function (s) { return s % 2 === 0; });
console.log(chanDau); // 2
```

### Câu 3: Giải thích reduce() hoạt động thế nào?

**Đáp án:** `reduce` duyệt qua từng phần tử, **tích lũy** kết quả qua mỗi bước, và cuối cùng trả về **một giá trị duy nhất**.

```js
let so = [1, 2, 3, 4];

let tong = so.reduce(function (tichLuy, hienTai) {
  console.log("Tích lũy:", tichLuy, "| Hiện tại:", hienTai);
  return tichLuy + hienTai;
}, 0);

// Tích lũy: 0 | Hiện tại: 1  → trả về 1
// Tích lũy: 1 | Hiện tại: 2  → trả về 3
// Tích lũy: 3 | Hiện tại: 3  → trả về 6
// Tích lũy: 6 | Hiện tại: 4  → trả về 10

console.log(tong); // 10
```

### Câu 4: Tại sao sort() không hoạt động đúng với số?

**Đáp án:** Mặc định, `sort()` chuyển mọi phần tử thành **chuỗi** rồi so sánh theo thứ tự bảng chữ cái (Unicode). Vì vậy `"10"` đứng trước `"5"` (vì ký tự `"1"` < `"5"`).

```js
// ❌ sort() mặc định — so sánh chuỗi
[10, 5, 40, 25].sort();
// → [10, 25, 40, 5] — sai!

// ✅ Truyền hàm so sánh
[10, 5, 40, 25].sort(function (a, b) { return a - b; });
// → [5, 10, 25, 40] — đúng!
```

### Câu 5: Khi nào nên dùng reduce() thay vì forEach()?

**Đáp án:** Dùng `reduce` khi cần **gom nhiều giá trị thành một kết quả** (tổng, object, mảng mới phức tạp). Dùng `forEach` khi chỉ cần **thực hiện side effect** (in ra, gọi API...).

```js
let sanPham = [
  { ten: "Sữa", gia: 25000 },
  { ten: "Trứng", gia: 35000 },
  { ten: "Bánh mì", gia: 15000 },
];

// reduce — tính tổng tiền
let tong = sanPham.reduce(function (sum, sp) {
  return sum + sp.gia;
}, 0);
console.log(tong); // 75000

// forEach — in danh sách ra console
sanPham.forEach(function (sp) {
  console.log(sp.ten + ": " + sp.gia + "đ");
});
```
