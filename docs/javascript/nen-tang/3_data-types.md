---
sidebar_position: 3
title: "Kiểu dữ liệu"
---

# Kiểu dữ liệu

## Kiểu dữ liệu là gì?

**Kiểu dữ liệu** (data type) cho JavaScript biết **loại giá trị** mà biến đang lưu trữ — là số, chữ, đúng/sai, hay không có gì.

> **Ví dụ thực tế:** Giống như các loại hộp khác nhau trong nhà kho. Hộp đựng sách (string/chữ), hộp đựng tiền (number/số), hộp rỗng (null/undefined). Mỗi loại hộp có cách xử lý khác nhau.

JavaScript có **2 nhóm** kiểu dữ liệu chính:

| Nhóm | Kiểu | Lưu trữ |
|------|------|---------|
| **Primitive** (Nguyên thủy) | string, number, boolean, null, undefined, symbol, bigint | Lưu **giá trị** trực tiếp |
| **Reference** (Tham chiếu) | object, array, function | Lưu **địa chỉ** (con trỏ) đến vùng nhớ |

## Tại sao cần phân biệt kiểu dữ liệu?

JavaScript là ngôn ngữ **dynamic typing** — bạn không cần khai báo kiểu, JS tự xác định. Nhưng nếu không hiểu kiểu dữ liệu, bạn sẽ gặp những bug rất khó tìm:

```js
// Bug do không hiểu kiểu dữ liệu
console.log("5" + 3);  // "53" (nối chuỗi, không phải cộng số!)
console.log("5" - 3);  // 2   (trừ thì JS lại chuyển thành số!)
```

## Kiểu Primitive (Nguyên thủy)

### 1. String (Chuỗi)

Dùng để lưu trữ **văn bản**. Có 3 cách viết:

```js
// Dấu nháy đơn
const ten = 'Thuan';

// Dấu nháy kép
const chao = "Xin chào";

// Backtick — Template literal (ES6, khuyên dùng)
const tuoi = 25;
const gioiThieu = `Tôi tên ${ten}, ${tuoi} tuổi`;
console.log(gioiThieu); // "Tôi tên Thuan, 25 tuổi"
```

### 2. Number (Số)

Lưu trữ **số nguyên và số thập phân**. JavaScript không phân biệt int/float — tất cả đều là `number`:

```js
const soNguyen = 42;
const soThapPhan = 3.14;
const soAm = -10;

// Giá trị đặc biệt
const voHan = Infinity;       // Vô cực
const voHanAm = -Infinity;    // Âm vô cực
const khongPhaiSo = NaN;      // Not a Number

console.log(1 / 0);           // Infinity
console.log("abc" * 2);       // NaN
```

### 3. Boolean (Đúng/Sai)

Chỉ có **2 giá trị**: `true` (đúng) hoặc `false` (sai):

```js
const isLoggedIn = true;
const hasPermission = false;

// Dùng trong điều kiện
if (isLoggedIn) {
  console.log("Đã đăng nhập");
}

// So sánh trả về boolean
console.log(5 > 3);   // true
console.log(2 === 3);  // false
```

### 4. Null (Rỗng có chủ đích)

`null` nghĩa là **"không có giá trị"** — do lập trình viên **cố ý** đặt:

```js
// Khai báo biến nhưng chưa có giá trị cụ thể
let selectedUser = null; // Chưa chọn user nào

// Sau khi user click chọn
selectedUser = { name: "Thuan" };

// Reset về trạng thái ban đầu
selectedUser = null;
```

> **Ví dụ thực tế:** `null` giống như một cái ghế trống trong rạp phim — ghế tồn tại nhưng chưa ai ngồi (và bạn biết rõ điều đó).

### 5. Undefined (Chưa xác định)

`undefined` nghĩa là biến **đã khai báo nhưng chưa gán giá trị** — do JavaScript tự đặt:

```js
let x;
console.log(x); // undefined — chưa gán giá trị

// Hàm không return gì → trả về undefined
function noReturn() {
  console.log("hello");
}
const result = noReturn(); // undefined

// Truy cập thuộc tính không tồn tại → undefined
const user = { name: "Thuan" };
console.log(user.age); // undefined
```

> **Ví dụ thực tế:** `undefined` giống như một cái ghế mà bạn **quên** đặt vào rạp phim — vị trí có nhưng ghế chưa được đặt.

### 6. Symbol (ES6)

Tạo giá trị **duy nhất**, không bao giờ trùng lặp. Ít dùng khi mới học:

```js
const id1 = Symbol("id");
const id2 = Symbol("id");
console.log(id1 === id2); // false — mỗi Symbol là duy nhất

// Dùng làm key cho object (tránh trùng tên)
const SECRET_KEY = Symbol("secret");
const config = {
  [SECRET_KEY]: "abc123",
  name: "App"
};
```

### 7. BigInt (ES2020)

Lưu trữ **số nguyên rất lớn** mà `number` không xử lý được:

```js
// Number có giới hạn
console.log(9007199254740991 + 1); // 9007199254740992
console.log(9007199254740991 + 2); // 9007199254740992 — SAI!

// BigInt không có giới hạn
const soCucLon = 9007199254740991n; // Thêm "n" ở cuối
console.log(soCucLon + 2n);        // 9007199254740993n — ĐÚNG!
```

## Kiểu Reference (Tham chiếu)

### Object (Đối tượng)

```js
const user = {
  name: "Thuan",
  age: 25,
  isStudent: false
};

console.log(user.name);    // "Thuan"
console.log(user["age"]);  // 25
```

### Array (Mảng)

```js
const fruits = ["Táo", "Cam", "Xoài"];

console.log(fruits[0]);    // "Táo" (index bắt đầu từ 0)
console.log(fruits.length); // 3
```

### Function (Hàm)

```js
function greet(name) {
  return `Xin chào ${name}!`;
}

console.log(typeof greet); // "function"
```

## Kiểm tra kiểu với typeof

```js
console.log(typeof "Hello");     // "string"
console.log(typeof 42);          // "number"
console.log(typeof true);        // "boolean"
console.log(typeof undefined);   // "undefined"
console.log(typeof null);        // "object"   ← BUG lịch sử!
console.log(typeof {});          // "object"
console.log(typeof []);          // "object"   ← Array cũng là object!
console.log(typeof function(){}); // "function"
console.log(typeof Symbol());    // "symbol"
console.log(typeof 10n);         // "bigint"
```

> **typeof null === "object"** là một **bug** từ phiên bản đầu tiên của JavaScript (1995). Nó không bao giờ được sửa vì sẽ phá vỡ hàng triệu website cũ.

## Type Coercion (Ép kiểu tự động)

JavaScript tự động chuyển đổi kiểu dữ liệu khi cần. Đây là nguồn gốc của nhiều bug:

```js
// Nối chuỗi (toán tử + với string)
console.log("5" + 3);     // "53" — số 3 bị ép thành string
console.log("5" + true);  // "5true"
console.log("5" + null);  // "5null"

// Chuyển thành số (toán tử -, *, /)
console.log("5" - 3);     // 2 — string "5" bị ép thành number
console.log("5" * 2);     // 10
console.log(true + 1);    // 2 — true bị ép thành 1
console.log(false + 1);   // 1 — false bị ép thành 0

// Ép kiểu tường minh (explicit) — nên dùng cách này
console.log(Number("5") + 3);  // 8
console.log(String(42));       // "42"
console.log(Boolean(1));       // true
```

## Truthy và Falsy

Mọi giá trị trong JavaScript đều có thể chuyển thành boolean:

### Falsy values (chuyển thành false)

```js
// Chỉ có 8 giá trị falsy:
Boolean(false);     // false
Boolean(0);         // false
Boolean(-0);        // false
Boolean(0n);        // false (BigInt zero)
Boolean("");        // false (chuỗi rỗng)
Boolean(null);      // false
Boolean(undefined); // false
Boolean(NaN);       // false
```

### Truthy values (chuyển thành true)

```js
// TẤT CẢ giá trị còn lại đều truthy
Boolean(true);      // true
Boolean(42);        // true
Boolean("hello");   // true
Boolean([]);        // true — mảng rỗng vẫn truthy!
Boolean({});        // true — object rỗng vẫn truthy!
Boolean("0");       // true — chuỗi "0" vẫn truthy!
Boolean("false");   // true — chuỗi "false" vẫn truthy!
```

## Lỗi thường gặp

### 1. Nhầm null và undefined

```js
// ❌ Dùng == để so sánh (không phân biệt null/undefined)
console.log(null == undefined);  // true

// ✅ Dùng === để so sánh chính xác
console.log(null === undefined); // false

// ✅ Kiểm tra cả hai
if (value === null || value === undefined) {
  console.log("Không có giá trị");
}

// ✅ Hoặc dùng == null (trường hợp đặc biệt duy nhất nên dùng ==)
if (value == null) {
  console.log("null hoặc undefined");
}
```

### 2. So sánh kiểu reference

```js
// ❌ So sánh object/array bằng === (so sánh địa chỉ, không phải giá trị)
console.log([1, 2] === [1, 2]);         // false — hai mảng khác nhau
console.log({ a: 1 } === { a: 1 });     // false — hai object khác nhau

// ✅ So sánh nội dung bằng JSON.stringify
console.log(JSON.stringify([1, 2]) === JSON.stringify([1, 2])); // true

// ✅ Hoặc so sánh từng phần tử
const arr1 = [1, 2, 3];
const arr2 = [1, 2, 3];
const isEqual = arr1.length === arr2.length &&
                arr1.every((val, i) => val === arr2[i]);
```

### 3. Kiểm tra array

```js
// ❌ typeof không phân biệt object và array
console.log(typeof []);  // "object"
console.log(typeof {});  // "object"

// ✅ Dùng Array.isArray()
console.log(Array.isArray([]));  // true
console.log(Array.isArray({}));  // false
```

---

## Câu hỏi phỏng vấn

### Câu 1: Sự khác nhau giữa null và undefined?

**Đáp án:**

| | `null` | `undefined` |
|---|--------|-------------|
| **Ý nghĩa** | Cố ý không có giá trị | Chưa được gán giá trị |
| **Ai đặt** | Lập trình viên | JavaScript engine |
| **typeof** | `"object"` (bug lịch sử) | `"undefined"` |
| **Khi nào xuất hiện** | Khi bạn muốn "xóa" giá trị | Biến chưa gán, tham số thiếu, thuộc tính không tồn tại |

```js
let a;              // undefined — JS tự đặt
let b = null;       // null — lập trình viên đặt
let c = undefined;  // undefined — cũng hợp lệ nhưng nên dùng null

console.log(typeof a); // "undefined"
console.log(typeof b); // "object" — bug nổi tiếng của JS!
```

### Câu 2: typeof null trả về gì? Tại sao?

**Đáp án:**

`typeof null` trả về `"object"`. Đây là một **bug** từ phiên bản JavaScript đầu tiên (1995).

Nguyên nhân kỹ thuật: Trong JS engine ban đầu, mỗi giá trị được lưu với một "type tag" (3 bit đầu). Object có tag `000`, và `null` được biểu diễn bằng con trỏ NULL (toàn bộ bit là 0) — nên type tag của null cũng là `000`, trùng với object.

Bug này không bao giờ được sửa vì sẽ phá vỡ hàng triệu website đang tồn tại.

```js
// Cách kiểm tra null chính xác
const value = null;

// ❌ Không dùng typeof
console.log(typeof value === "null"); // false!

// ✅ So sánh trực tiếp
console.log(value === null); // true
```

### Câu 3: Liệt kê tất cả giá trị falsy trong JavaScript?

**Đáp án:**

JavaScript có đúng **8 giá trị falsy**:

```js
// 8 giá trị falsy
false       // Boolean false
0           // Số 0
-0          // Số -0
0n          // BigInt zero
""          // Chuỗi rỗng (empty string)
null        // Null
undefined   // Undefined
NaN         // Not a Number

// Bẫy thường gặp — những giá trị TRUTHY mà nhiều người nghĩ là falsy:
Boolean([]);      // true — mảng rỗng là TRUTHY!
Boolean({});      // true — object rỗng là TRUTHY!
Boolean("0");     // true — chuỗi "0" là TRUTHY!
Boolean("false"); // true — chuỗi "false" là TRUTHY!
Boolean(new Date()); // true
```

### Câu 4: Primitive và Reference type khác nhau như thế nào?

**Đáp án:**

| | Primitive | Reference |
|---|-----------|-----------|
| **Lưu trữ** | Giá trị trực tiếp | Địa chỉ (tham chiếu) đến vùng nhớ |
| **Copy** | Copy giá trị (độc lập) | Copy địa chỉ (cùng trỏ đến 1 nơi) |
| **So sánh** | So giá trị | So địa chỉ |
| **Immutable** | Có (không thể thay đổi) | Không (có thể thay đổi nội dung) |

```js
// Primitive — copy giá trị
let a = 5;
let b = a;   // b = 5 (copy giá trị)
b = 10;
console.log(a); // 5 — không bị ảnh hưởng

// Reference — copy địa chỉ
let obj1 = { name: "Thuan" };
let obj2 = obj1;  // obj2 trỏ đến CÙNG object
obj2.name = "Khác";
console.log(obj1.name); // "Khác" — bị ảnh hưởng!

// Tạo bản sao độc lập
let obj3 = { ...obj1 }; // Spread operator (shallow copy)
obj3.name = "Mới";
console.log(obj1.name); // "Khác" — không bị ảnh hưởng
```
