---
sidebar_position: 5
title: "Câu lệnh điều kiện"
---

# Câu lệnh điều kiện

## Câu lệnh điều kiện là gì?

**Câu lệnh điều kiện** (conditional statement) cho phép chương trình **đưa ra quyết định** — thực hiện code khác nhau tùy thuộc vào điều kiện đúng hay sai.

> **Ví dụ thực tế:** Giống như khi bạn ra khỏi nhà: "**Nếu** trời mưa **thì** mang ô, **nếu không** thì mang kính râm." Đó chính là logic điều kiện — chương trình cũng "suy nghĩ" tương tự.

## Cách sử dụng

### if — Nếu

```js
const temperature = 35;

// Nếu nhiệt độ > 30 thì in ra cảnh báo
if (temperature > 30) {
  console.log("Trời nóng quá! Nhớ uống nhiều nước");
}
```

### if...else — Nếu... nếu không

```js
const age = 16;

if (age >= 18) {
  console.log("Bạn đủ tuổi lái xe");
} else {
  console.log("Bạn chưa đủ tuổi lái xe");
}
// Kết quả: "Bạn chưa đủ tuổi lái xe"
```

### if...else if...else — Nhiều điều kiện

```js
const score = 75;

if (score >= 90) {
  console.log("Xuất sắc - Loại A");
} else if (score >= 80) {
  console.log("Giỏi - Loại B");
} else if (score >= 70) {
  console.log("Khá - Loại C");
} else if (score >= 60) {
  console.log("Trung bình - Loại D");
} else {
  console.log("Yếu - Loại F");
}
// Kết quả: "Khá - Loại C"
```

### switch...case — Nhiều giá trị cụ thể

```js
const dayNumber = 3;

switch (dayNumber) {
  case 1:
    console.log("Thứ Hai");
    break;
  case 2:
    console.log("Thứ Ba");
    break;
  case 3:
    console.log("Thứ Tư");
    break;
  case 4:
    console.log("Thứ Năm");
    break;
  case 5:
    console.log("Thứ Sáu");
    break;
  case 6:
    console.log("Thứ Bảy");
    break;
  case 7:
    console.log("Chủ Nhật");
    break;
  default:
    console.log("Số không hợp lệ");
}
// Kết quả: "Thứ Tư"
```

> **Quan trọng:** Luôn nhớ đặt `break` sau mỗi `case`. Nếu quên, code sẽ "chạy tiếp" xuống các case bên dưới (fall-through).

### Ternary operator — Viết tắt if...else

```js
// Cú pháp: điều_kiện ? giá_trị_true : giá_trị_false

const age = 20;
const message = age >= 18 ? "Người lớn" : "Trẻ em";
console.log(message); // "Người lớn"

// Ứng dụng thực tế
const greeting = isLoggedIn ? `Chào ${name}` : "Vui lòng đăng nhập";
const discount = isMember ? 0.1 : 0;
const label = count === 1 ? "item" : "items";
```

## Truthy và Falsy trong điều kiện

JavaScript tự động chuyển giá trị thành boolean khi dùng trong `if`:

```js
// Tất cả các giá trị FALSY (coi như false)
if (false) {}       // false
if (0) {}           // false
if ("") {}          // false
if (null) {}        // false
if (undefined) {}   // false
if (NaN) {}         // false

// Tất cả các giá trị TRUTHY (coi như true)
if (true) {}        // true
if (42) {}          // true
if ("hello") {}     // true
if ([]) {}          // true — mảng rỗng là TRUTHY!
if ({}) {}          // true — object rỗng là TRUTHY!

// Ứng dụng: kiểm tra giá trị tồn tại
const username = "Thuan";
if (username) {
  console.log(`Xin chào ${username}`);
}

// Kiểm tra mảng có phần tử
const items = [1, 2, 3];
if (items.length) {
  console.log(`Có ${items.length} phần tử`);
}
```

## Khi nào dùng switch vs if...else?

| Tình huống | Nên dùng |
|-----------|----------|
| So sánh **một biến** với **nhiều giá trị cụ thể** | `switch` |
| Điều kiện phức tạp (`>`, `<`, `&&`, `\|\|`) | `if...else` |
| Chỉ 2-3 nhánh | `if...else` hoặc ternary |
| Giá trị là string/number cố định | `switch` |

```js
// ✅ Nên dùng switch — so sánh 1 biến với nhiều giá trị
const status = "pending";
switch (status) {
  case "pending":
    showLoading();
    break;
  case "success":
    showData();
    break;
  case "error":
    showError();
    break;
  default:
    showDefault();
}

// ✅ Nên dùng if...else — điều kiện phức tạp
const user = { age: 25, role: "admin", isActive: true };
if (user.age >= 18 && user.role === "admin") {
  grantFullAccess();
} else if (user.isActive) {
  grantLimitedAccess();
} else {
  denyAccess();
}
```

### Gom nhiều case (Fall-through có chủ đích)

```js
const fruit = "Cam";

switch (fruit) {
  case "Cam":
  case "Quýt":
  case "Bưởi":
    console.log("Họ cam quýt — giàu vitamin C");
    break;
  case "Táo":
  case "Lê":
    console.log("Họ táo — giòn ngọt");
    break;
  default:
    console.log("Loại trái cây khác");
}
// Kết quả: "Họ cam quýt — giàu vitamin C"
```

## Lỗi thường gặp

### 1. Quên break trong switch

```js
// ❌ Thiếu break — fall-through không mong muốn
const color = "đỏ";
switch (color) {
  case "đỏ":
    console.log("Dừng lại");
    // Quên break! Code chạy tiếp xuống dưới
  case "vàng":
    console.log("Chuẩn bị");
  case "xanh":
    console.log("Đi");
}
// Kết quả: "Dừng lại", "Chuẩn bị", "Đi" — In ra cả 3!

// ✅ Có break
switch (color) {
  case "đỏ":
    console.log("Dừng lại");
    break;
  case "vàng":
    console.log("Chuẩn bị");
    break;
  case "xanh":
    console.log("Đi");
    break;
}
// Kết quả: "Dừng lại" (chỉ 1 dòng)
```

### 2. Dùng = thay vì ===

```js
// ❌ Gán giá trị thay vì so sánh
const x = 10;
if (x = 5) {
  console.log("x bằng 5");
}
// Luôn chạy! Vì x = 5 gán giá trị 5 cho x, và 5 là truthy

// ✅ So sánh đúng cách
if (x === 5) {
  console.log("x bằng 5");
}
```

### 3. Nesting quá sâu

```js
// ❌ Quá nhiều if lồng nhau — khó đọc
function processOrder(order) {
  if (order) {
    if (order.items.length > 0) {
      if (order.payment) {
        if (order.payment.isValid) {
          // Code xử lý ở đây...
        }
      }
    }
  }
}

// ✅ Dùng early return — dễ đọc hơn
function processOrder(order) {
  if (!order) return;
  if (order.items.length === 0) return;
  if (!order.payment) return;
  if (!order.payment.isValid) return;

  // Code xử lý ở đây — không cần nesting
}
```

### 4. Nhầm kiểu so sánh của switch

```js
// ❌ switch dùng === (strict equality), không phải ==
const value = "1"; // string
switch (value) {
  case 1: // number — KHÔNG match vì "1" !== 1
    console.log("Là số 1");
    break;
  case "1": // string — match!
    console.log("Là chuỗi 1");
    break;
}
// Kết quả: "Là chuỗi 1"
```

### 5. Kiểm tra mảng/object rỗng sai cách

```js
// ❌ Sai: [] và {} là truthy!
const arr = [];
if (arr) {
  console.log("Mảng có dữ liệu"); // Luôn chạy — NGAY CẢ khi mảng rỗng!
}

// ✅ Đúng: kiểm tra .length
if (arr.length > 0) {
  console.log("Mảng có dữ liệu");
}

// ❌ Sai cho object
const obj = {};
if (obj) {
  console.log("Object có dữ liệu"); // Luôn chạy!
}

// ✅ Đúng: kiểm tra Object.keys
if (Object.keys(obj).length > 0) {
  console.log("Object có dữ liệu");
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: Liệt kê tất cả giá trị falsy trong JavaScript?

**Đáp án:**

JavaScript có đúng **8 giá trị falsy**:

| Giá trị | Loại |
|---------|------|
| `false` | Boolean |
| `0` | Number |
| `-0` | Number |
| `0n` | BigInt |
| `""` (chuỗi rỗng) | String |
| `null` | Null |
| `undefined` | Undefined |
| `NaN` | Number |

```js
// Bẫy phổ biến:
if ([]) console.log("truthy");  // ✅ Chạy! Mảng rỗng là truthy
if ({}) console.log("truthy");  // ✅ Chạy! Object rỗng là truthy
if ("0") console.log("truthy"); // ✅ Chạy! Chuỗi "0" là truthy
if ("false") console.log("truthy"); // ✅ Chạy! Chuỗi "false" là truthy
```

### Câu 2: switch khác if...else ở điểm nào?

**Đáp án:**

| Đặc điểm | `switch` | `if...else` |
|-----------|----------|-------------|
| **So sánh** | Dùng `===` (strict) | Dùng bất kỳ biểu thức nào |
| **Kiểu điều kiện** | So sánh 1 biến với nhiều giá trị | Điều kiện phức tạp, range |
| **Fall-through** | Có (nếu quên `break`) | Không |
| **Hiệu suất** | Nhanh hơn với nhiều case (jump table) | Kiểm tra tuần tự từ trên xuống |
| **Đọc code** | Rõ ràng khi so sánh cùng 1 biến | Linh hoạt hơn |

```js
// switch chỉ so sánh === với 1 biến
switch (status) {
  case "active": /* ... */ break;
  case "inactive": /* ... */ break;
}

// if...else linh hoạt hơn
if (age >= 18 && role === "admin") { /* ... */ }
else if (age >= 13 || hasParentConsent) { /* ... */ }
```

### Câu 3: Early return pattern là gì?

**Đáp án:**

Early return là kỹ thuật **return sớm** khi gặp điều kiện không hợp lệ, giúp tránh nesting sâu:

```js
// ❌ Không dùng early return — nesting sâu
function getDiscount(user) {
  if (user) {
    if (user.isActive) {
      if (user.membershipLevel === "gold") {
        return 0.2;
      } else if (user.membershipLevel === "silver") {
        return 0.1;
      } else {
        return 0.05;
      }
    } else {
      return 0;
    }
  } else {
    return 0;
  }
}

// ✅ Dùng early return — phẳng, dễ đọc
function getDiscount(user) {
  if (!user) return 0;
  if (!user.isActive) return 0;

  if (user.membershipLevel === "gold") return 0.2;
  if (user.membershipLevel === "silver") return 0.1;
  return 0.05;
}
```

Ưu điểm:
- Giảm nesting, code dễ đọc hơn
- Logic "happy path" nằm ở cuối hàm
- Dễ thêm điều kiện mới mà không làm thay đổi cấu trúc

### Câu 4: Output của đoạn code sau là gì?

```js
const x = 10;
const result = x > 5 ? "lớn" : x > 3 ? "vừa" : "nhỏ";
console.log(result);
```

**Đáp án:**

Kết quả: `"lớn"`

Ternary lồng nhau được đánh giá **từ phải sang trái**:

```js
// Tương đương:
const result = x > 5 ? "lớn" : (x > 3 ? "vừa" : "nhỏ");

// x = 10, 10 > 5 là true → result = "lớn"
// Phần sau dấu : không được đánh giá
```

> **Lưu ý:** Tránh dùng ternary lồng nhau quá 2 tầng. Nếu logic phức tạp, hãy dùng `if...else` cho dễ đọc.
