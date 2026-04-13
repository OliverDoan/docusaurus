---
sidebar_position: 2
title: "2. Map title: "Map & Set" Set"
---

# Map & Set

## Map là gì?

**Map** là một cấu trúc dữ liệu lưu trữ các cặp **key-value** (khóa-giá trị), tương tự như Object, nhưng **mạnh mẽ hơn** vì key có thể là **bất kỳ kiểu dữ liệu nào** -- số, object, hàm, không chỉ là string.

Hãy tưởng tượng Map như một **cuốn từ điển** -- bạn tra một **từ** (key) và tìm được **nghĩa** (value) của nó. Điểm đặc biệt là "từ" trong cuốn từ điển này không chỉ là chữ cái, mà có thể là **hình ảnh, số, hay bất kỳ thứ gì**.

```javascript
// Tạo một Map mới
const tuDien = new Map();

// Thêm cặp key-value
tuDien.set("xin chao", "hello");
tuDien.set("tam biet", "goodbye");

// Lấy giá trị theo key
console.log(tuDien.get("xin chao")); // "hello"
```

---

## Set là gì?

**Set** là một cấu trúc dữ liệu lưu tập hợp các giá trị **không trùng lặp**. Nếu bạn thêm giá trị đã tồn tại, Set sẽ **tự động bỏ qua**.

Hãy tưởng tượng Set như một **bộ sưu tập tem** -- mỗi con tem chỉ xuất hiện **một lần duy nhất**. Nếu bạn có thêm con tem giống hệt, nó không được tính.

```javascript
// Tạo một Set mới
const boSuuTap = new Set();

boSuuTap.add("tem A");
boSuuTap.add("tem B");
boSuuTap.add("tem A"); // Bị bỏ qua vì đã tồn tại

console.log(boSuuTap.size); // 2 (chỉ có "tem A" và "tem B")
```

---

## Tại sao Map & Set ra đời?

Trước ES6, JavaScript chỉ có **Object** và **Array**. Nhưng chúng có nhiều hạn chế:

| Vấn đề của Object | Map giải quyết |
|-------------------|----------------|
| Key chỉ là string hoặc Symbol | Key là bất kỳ kiểu nào (số, object, hàm...) |
| Không có thuộc tính `.size` | Có `.size` để đếm số phần tử |
| Không đảm bảo thứ tự | Đảm bảo thứ tự thêm vào |
| Khó duyệt (for...in có vấn đề prototype) | Duyệt dễ dàng bằng `.forEach`, `for...of` |

| Vấn đề của Array | Set giải quyết |
|------------------|----------------|
| Cho phép giá trị trùng lặp | Tự động loại bỏ trùng lặp |
| Kiểm tra tồn tại: `indexOf` chậm (O(n)) | `has()` nhanh (O(1)) |

---

## Cách sử dụng Map

### Tạo Map và các method cơ bản

```javascript
// Cách 1: Tạo rỗng rồi thêm dần
const bangDiem = new Map();
bangDiem.set("Minh", 9.5);
bangDiem.set("Lan", 8.0);
bangDiem.set("Tuan", 7.5);

// Cách 2: Tạo với dữ liệu ban đầu
const bangDiem2 = new Map([
  ["Minh", 9.5],
  ["Lan", 8.0],
  ["Tuan", 7.5],
]);

// Lấy giá trị
console.log(bangDiem.get("Minh")); // 9.5
console.log(bangDiem.get("Khong co")); // undefined

// Kiểm tra key có tồn tại không
console.log(bangDiem.has("Lan")); // true
console.log(bangDiem.has("An")); // false

// Đếm số phần tử
console.log(bangDiem.size); // 3

// Xóa một phần tử
bangDiem.delete("Tuan");
console.log(bangDiem.size); // 2

// Xóa tất cả
bangDiem.clear();
console.log(bangDiem.size); // 0
```

### Key có thể là bất kỳ kiểu nào

```javascript
const map = new Map();

// Key là số
map.set(1, "mot");
map.set(2, "hai");

// Key là object
const user = { id: 1 };
map.set(user, "thong tin user");

// Key là hàm
const fn = () => {};
map.set(fn, "thong tin ham");

console.log(map.get(1));    // "mot"
console.log(map.get(user)); // "thong tin user"
```

### Duyệt Map

```javascript
const monHoc = new Map([
  ["Toan", 9],
  ["Van", 7],
  ["Anh", 8],
]);

// forEach
monHoc.forEach((diem, ten) => {
  console.log(`${ten}: ${diem} diem`);
});

// for...of
for (const [ten, diem] of monHoc) {
  console.log(`${ten}: ${diem} diem`);
}

// Lấy keys, values, entries
console.log([...monHoc.keys()]);    // ["Toan", "Van", "Anh"]
console.log([...monHoc.values()]);  // [9, 7, 8]
console.log([...monHoc.entries()]); // [["Toan", 9], ["Van", 7], ["Anh", 8]]
```

---

## Map vs Object -- bảng so sánh chi tiết

| Tiêu chí | Object | Map |
|----------|--------|-----|
| Kiểu key | Chỉ string/Symbol | Bất kỳ kiểu nào |
| Thứ tự key | Không đảm bảo (trước ES6) | Theo thứ tự thêm vào |
| Đếm số phần tử | `Object.keys(obj).length` | `map.size` |
| Duyệt | `for...in` (kể cả prototype) | `forEach`, `for...of` |
| Hiệu năng thêm/xóa nhiều | Chậm hơn | Nhanh hơn |
| Chuyển JSON | Hỗ trợ trực tiếp | Phải chuyển thủ công |
| Khi nào dùng? | Dữ liệu có cấu trúc cố định | Dữ liệu động, key phức tạp |

```javascript
// ❌ Object: key tự động chuyển thành string
const obj = {};
obj[1] = "mot";
obj["1"] = "mot (string)";
console.log(Object.keys(obj)); // ["1"] -- chỉ còn 1 key!

// ✅ Map: phân biệt kiểu key
const map = new Map();
map.set(1, "mot (so)");
map.set("1", "mot (string)");
console.log(map.size); // 2 -- 2 key khác nhau!
```

---

## Cách sử dụng Set

### Tạo Set và các method cơ bản

```javascript
// Tạo Set
const mauSac = new Set();

// Thêm phần tử
mauSac.add("do");
mauSac.add("xanh");
mauSac.add("vang");
mauSac.add("do"); // Bị bỏ qua -- đã tồn tại

console.log(mauSac.size); // 3

// Kiểm tra tồn tại
console.log(mauSac.has("do"));  // true
console.log(mauSac.has("tim")); // false

// Xóa phần tử
mauSac.delete("vang");
console.log(mauSac.size); // 2

// Tạo Set từ array
const soLieuGoc = [1, 2, 3, 2, 1, 4, 3, 5];
const soKhongTrung = new Set(soLieuGoc);
console.log(soKhongTrung); // Set {1, 2, 3, 4, 5}
```

### Loại bỏ phần tử trùng lặp từ Array (rất hay dùng)

```javascript
const mangGoc = [1, 2, 3, 2, 4, 1, 5, 3];

// ✅ Cách ngắn gọn nhất: Set + spread
const mangMoi = [...new Set(mangGoc)];
console.log(mangMoi); // [1, 2, 3, 4, 5]

// Cũng dùng được với string
const ten = ["Minh", "Lan", "Minh", "Tuan", "Lan"];
const tenDuyNhat = [...new Set(ten)];
console.log(tenDuyNhat); // ["Minh", "Lan", "Tuan"]
```

### Duyệt Set

```javascript
const traicay = new Set(["tao", "cam", "chuoi"]);

// forEach
traicay.forEach((qua) => {
  console.log(qua);
});

// for...of
for (const qua of traicay) {
  console.log(qua);
}
```

---

## WeakMap và WeakSet (giới thiệu ngắn)

**WeakMap** và **WeakSet** là phiên bản "yếu" của Map và Set:

- Key (WeakMap) hoặc giá trị (WeakSet) **phải là object**
- Cho phép **garbage collector** tự động dọn dẹp khi object không còn được sử dụng
- **Không thể duyệt** (không có `forEach`, `size`, `keys`...)

```javascript
// WeakMap -- dùng để lưu metadata cho object mà không cần lo memory leak
const cache = new WeakMap();

function tinhToan(obj) {
  if (cache.has(obj)) {
    return cache.get(obj); // Trả về kết quả đã tính
  }
  const ketQua = /* tính toán phức tạp */ obj.value * 2;
  cache.set(obj, ketQua);
  return ketQua;
}

let data = { value: 42 };
tinhToan(data); // Tính và lưu cache

data = null; // Khi data bị xóa, cache cũng tự động được dọn dẹp
```

**Khi nào dùng WeakMap/WeakSet?**
- Lưu cache cho object (tự động giải phóng memory)
- Đánh dấu object đã xử lý
- Lưu dữ liệu private cho class

---

## Khi nào dùng?

| Cấu trúc | Khi nào dùng |
|----------|-------------|
| **Map** | Cần key không phải string, cần đảm bảo thứ tự, thêm/xóa nhiều |
| **Object** | Dữ liệu có cấu trúc cố định, cần chuyển JSON |
| **Set** | Cần tập hợp giá trị duy nhất, loại bỏ trùng lặp |
| **Array** | Cần thứ tự, index, phần tử trùng lặp được |

---

## Lỗi thường gặp

### Lỗi 1: Dùng dot notation với Map

```javascript
const map = new Map();

// ❌ SAI: dot notation không hoạt động với Map
map.ten = "Minh";
console.log(map.get("ten")); // undefined

// ✅ ĐÚNG: dùng method set/get
map.set("ten", "Minh");
console.log(map.get("ten")); // "Minh"
```

### Lỗi 2: So sánh object trong Set

```javascript
const set = new Set();

// ❌ Hai object khác nhau (dù nội dung giống nhau)
set.add({ ten: "Minh" });
set.add({ ten: "Minh" });
console.log(set.size); // 2! Vì là 2 object khác nhau trong bộ nhớ

// ✅ Cùng một tham chiếu object
const user = { ten: "Minh" };
set.add(user);
set.add(user); // Cùng tham chiếu -> bị bỏ qua
console.log(set.size); // 3 (2 object trước + 1 user)
```

---

## Câu hỏi phỏng vấn

### Câu 1: Map khác Object như thế nào? Khi nào nên dùng Map?

**Đáp án:**

- **Object:** Key chỉ là string/Symbol, không có `.size`, duyệt phức tạp
- **Map:** Key là bất kỳ kiểu nào, có `.size`, đảm bảo thứ tự, duyệt dễ dàng

Nên dùng Map khi:
- Key không phải string (ví dụ: object làm key)
- Cần thêm/xóa nhiều cặp key-value (Map nhanh hơn)
- Cần biết số lượng phần tử nhanh (`.size`)

```javascript
// Ví dụ: đếm số lần xuất hiện của từng từ
function demTu(chuoi) {
  const dem = new Map();
  const words = chuoi.split(" ");
  for (const tu of words) {
    dem.set(tu, (dem.get(tu) || 0) + 1);
  }
  return dem;
}

console.log(demTu("tao thich tao thich cam"));
// Map { "tao" => 2, "thich" => 2, "cam" => 1 }
```

---

### Câu 2: Cách nhanh nhất để loại bỏ phần tử trùng lặp từ array?

**Đáp án:** Dùng **Set** kết hợp với **spread operator**:

```javascript
const arr = [1, 2, 3, 2, 1, 4];
const unique = [...new Set(arr)];
console.log(unique); // [1, 2, 3, 4]
```

Đây là cách **ngắn gọn nhất và hiệu năng tốt** vì `Set` kiểm tra trùng lặp bằng hash (O(1) mỗi phần tử).

---

### Câu 3: Set so sánh các giá trị như thế nào?

**Đáp án:** Set dùng thuật toán **SameValueZero** (gần giống `===`), ngoại trừ **NaN được coi là bằng NaN**:

```javascript
const set = new Set();

set.add(NaN);
set.add(NaN);
console.log(set.size); // 1 -- NaN === NaN trong Set

set.add(0);
set.add(-0);
console.log(set.size); // 2 -- 0 và -0 được coi là giống nhau

// Nhưng object khác nhau luôn khác nhau
set.add({});
set.add({});
console.log(set.size); // 4 -- 2 object khác tham chiếu
```

---

### Câu 4: WeakMap khác Map như thế nào?

**Đáp án:**

| Tiêu chí | Map | WeakMap |
|----------|-----|---------|
| Kiểu key | Bất kỳ | Chỉ object |
| Garbage collection | Không tự động | Tự động khi key bị xóa |
| Duyệt (forEach, size) | Có | Không có |
| Dùng khi | Lưu dữ liệu chung | Cache, metadata, private data |

WeakMap cho phép **garbage collector** tự động dọn dẹp, tránh **memory leak**.

---

### Câu 5: Chuyển Map thành Object và ngược lại như thế nào?

**Đáp án:**

```javascript
// Object -> Map
const obj = { ten: "Minh", tuoi: 25 };
const map = new Map(Object.entries(obj));
console.log(map.get("ten")); // "Minh"

// Map -> Object
const mapMoi = new Map([["a", 1], ["b", 2]]);
const objMoi = Object.fromEntries(mapMoi);
console.log(objMoi); // { a: 1, b: 2 }

// Map -> JSON (qua Object)
const json = JSON.stringify(Object.fromEntries(mapMoi));
console.log(json); // '{"a":1,"b":2}'
```
