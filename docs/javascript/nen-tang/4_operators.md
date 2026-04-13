---
sidebar_position: 4
title: "4. Toán tử"
---

# Toán tử

## Toán tử là gì?

**Toán tử** (operator) là các ký hiệu đặc biệt dùng để **thực hiện phép tính** hoặc **so sánh** các giá trị.

> **Ví dụ thực tế:** Toán tử giống như các phép tính trong toán học mà bạn đã học từ tiểu học: `+`, `-`, `*`, `/`. Trong JavaScript, ngoài các phép tính cơ bản, còn có toán tử so sánh, logic, và nhiều loại khác.

## Toán tử số học (Arithmetic)

```js
// Các phép tính cơ bản
console.log(10 + 3);  // 13 — Cộng
console.log(10 - 3);  // 7  — Trừ
console.log(10 * 3);  // 30 — Nhân
console.log(10 / 3);  // 3.3333... — Chia
console.log(10 % 3);  // 1  — Chia lấy dư (modulo)
console.log(2 ** 3);  // 8  — Lũy thừa (2 mũ 3)

// Tăng / giảm
let count = 5;
count++;          // 6 — Tăng 1
count--;          // 5 — Giảm 1

// ⚠️ Prefix vs Postfix
let a = 5;
console.log(a++); // 5 — trả về giá trị CŨ rồi mới tăng
console.log(a);   // 6

let b = 5;
console.log(++b); // 6 — tăng TRƯỚC rồi mới trả về
console.log(b);   // 6
```

### Phép chia lấy dư — Dùng khi nào?

```js
// Kiểm tra số chẵn / lẻ
const isEven = (num) => num % 2 === 0;
console.log(isEven(4)); // true
console.log(isEven(7)); // false

// Giới hạn index trong mảng (circular)
const colors = ["đỏ", "xanh", "vàng"];
for (let i = 0; i < 10; i++) {
  console.log(colors[i % colors.length]);
  // đỏ, xanh, vàng, đỏ, xanh, vàng, đỏ, xanh, vàng, đỏ
}
```

## Toán tử gán (Assignment)

```js
let x = 10;      // Gán giá trị 10

x += 5;           // x = x + 5  → 15
x -= 3;           // x = x - 3  → 12
x *= 2;           // x = x * 2  → 24
x /= 4;           // x = x / 4  → 6
x %= 4;           // x = x % 4  → 2
x **= 3;          // x = x ** 3 → 8

// Dùng phổ biến nhất
let total = 0;
total += 100;     // Cộng dồn tiền vào tổng
total += 50;
console.log(total); // 150
```

## Toán tử so sánh (Comparison)

### == vs === (Câu hỏi phỏng vấn phổ biến nhất!)

```js
// == (Loose equality) — So sánh GIÁ TRỊ, tự động ép kiểu
console.log(5 == "5");     // true  — "5" bị ép thành số 5
console.log(0 == false);   // true  — false bị ép thành 0
console.log("" == false);  // true  — cả hai bị ép thành 0
console.log(null == undefined); // true — quy tắc đặc biệt

// === (Strict equality) — So sánh GIÁ TRỊ VÀ KIỂU, không ép kiểu
console.log(5 === "5");    // false — khác kiểu (number vs string)
console.log(0 === false);  // false — khác kiểu (number vs boolean)
console.log(null === undefined); // false — khác kiểu
```

### Tại sao === ra đời?

`==` có quá nhiều quy tắc ép kiểu phức tạp, gây ra bug khó hiểu:

```js
// ❌ Những kết quả "điên rồ" của ==
console.log("" == 0);       // true
console.log(0 == "0");      // true
console.log("" == "0");     // false — Hả?! Sao "" == 0, 0 == "0", nhưng "" != "0"?!

console.log(false == "0");  // true
console.log(false == []);   // true
console.log([] == "");      // true

// ✅ === cho kết quả dễ hiểu và đáng tin cậy
console.log("" === 0);      // false
console.log(0 === "0");     // false
console.log(false === "0"); // false
```

> **Quy tắc vàng:** LUÔN dùng `===` và `!==`. Chỉ dùng `==` khi kiểm tra `null`/`undefined` (`value == null`).

### Các toán tử so sánh khác

```js
console.log(5 > 3);   // true  — Lớn hơn
console.log(5 < 3);   // false — Nhỏ hơn
console.log(5 >= 5);  // true  — Lớn hơn hoặc bằng
console.log(5 <= 4);  // false — Nhỏ hơn hoặc bằng
console.log(5 !== 3); // true  — Không bằng (strict)
```

## Toán tử logic (Logical)

### AND (&&), OR (||), NOT (!)

```js
// && (AND) — true khi CẢ HAI đều true
console.log(true && true);   // true
console.log(true && false);  // false
console.log(false && true);  // false

// || (OR) — true khi ÍT NHẤT MỘT bên true
console.log(true || false);  // true
console.log(false || false); // false

// ! (NOT) — đảo ngược
console.log(!true);   // false
console.log(!false);  // true
console.log(!0);      // true (0 là falsy)
console.log(!"");     // true ("" là falsy)
```

### Short-circuit evaluation (Đánh giá ngắn mạch)

JavaScript **dừng sớm** khi biết kết quả:

```js
// && — dừng ở giá trị falsy đầu tiên, hoặc trả về giá trị cuối
console.log("hello" && 42);     // 42 (cả hai truthy → trả về giá trị cuối)
console.log(0 && "hello");      // 0 (0 là falsy → dừng ngay)
console.log(null && "hello");   // null

// || — dừng ở giá trị truthy đầu tiên, hoặc trả về giá trị cuối
console.log("hello" || 42);     // "hello" (truthy → dừng ngay)
console.log(0 || "hello");      // "hello" (0 falsy → tiếp tục)
console.log("" || 0 || null);   // null (tất cả falsy → trả về cuối)

// Ứng dụng thực tế: giá trị mặc định
const username = inputName || "Khách";
// Nếu inputName là "" hoặc null → username = "Khách"

// Ứng dụng thực tế: chạy code có điều kiện
isLoggedIn && showDashboard();
// Chỉ gọi showDashboard() nếu isLoggedIn là true
```

## Toán tử ba ngôi (Ternary)

Viết tắt của `if...else` trên **một dòng**:

```js
// Cú pháp: điều_kiện ? giá_trị_nếu_true : giá_trị_nếu_false

const age = 20;
const status = age >= 18 ? "Người lớn" : "Trẻ em";
console.log(status); // "Người lớn"

// Tương đương với:
let status2;
if (age >= 18) {
  status2 = "Người lớn";
} else {
  status2 = "Trẻ em";
}

// Ứng dụng thực tế
const greeting = isLoggedIn ? `Chào ${username}` : "Vui lòng đăng nhập";
const price = isMember ? originalPrice * 0.9 : originalPrice;
```

## Nullish Coalescing (??) — ES2020

Trả về vế phải khi vế trái là `null` hoặc `undefined` (**chỉ** 2 giá trị này):

```js
// ❌ Vấn đề với || : coi 0 và "" là falsy
const count = 0;
const result1 = count || 10;
console.log(result1); // 10 — SAI! Bạn muốn 0, không phải 10

// ✅ ?? chỉ thay thế null/undefined
const result2 = count ?? 10;
console.log(result2); // 0 — ĐÚNG! 0 không phải null/undefined

// Ví dụ thực tế
const config = {
  timeout: 0,      // 0 là giá trị hợp lệ (không timeout)
  retries: null,    // null = chưa thiết lập
  name: "",         // "" là giá trị hợp lệ (tên trống)
};

// || (sai — coi 0, "" là "không có giá trị")
const timeout = config.timeout || 3000;  // 3000 — SAI!
const name = config.name || "default";   // "default" — SAI!

// ?? (đúng — chỉ thay thế null/undefined)
const timeout2 = config.timeout ?? 3000; // 0 — ĐÚNG!
const retries = config.retries ?? 3;     // 3 — ĐÚNG! (null → dùng mặc định)
const name2 = config.name ?? "default";  // "" — ĐÚNG!
```

## Optional Chaining (?.) — ES2020

Truy cập thuộc tính **an toàn** mà không bị lỗi khi giá trị là `null`/`undefined`:

```js
const user = {
  name: "Thuan",
  address: {
    city: "HCM"
  }
};

// ❌ Không có optional chaining — có thể bị lỗi
const street = user.address.street.name;
// TypeError: Cannot read property 'name' of undefined

// ✅ Có optional chaining — an toàn
const street = user?.address?.street?.name;
// undefined (không lỗi!)

// Dùng với method
const result = user.getName?.();
// Nếu getName không tồn tại → undefined (không lỗi)

// Dùng với array index
const firstItem = arr?.[0];

// Kết hợp với ??
const city = user?.address?.city ?? "Không rõ";
console.log(city); // "HCM"

const country = user?.address?.country ?? "Không rõ";
console.log(country); // "Không rõ"
```

## Lỗi thường gặp

### 1. Dùng == thay vì ===

```js
// ❌ Bug tiềm ẩn
if (userInput == 0) {
  // "" cũng vào đây vì "" == 0 là true!
}

// ✅ An toàn
if (userInput === 0) {
  // Chỉ khi userInput thực sự là số 0
}
```

### 2. Nhầm = và ===

```js
// ❌ Gán thay vì so sánh (bug rất phổ biến)
if (x = 5) {
  // Luôn true! Vì x = 5 trả về 5 (truthy)
}

// ✅ So sánh
if (x === 5) {
  // Đúng logic
}
```

### 3. Dùng || thay vì ?? cho giá trị 0 hoặc ""

```js
// ❌ || coi 0 và "" là falsy
const port = config.port || 3000;
// Nếu config.port = 0 → port = 3000 (sai!)

// ✅ ?? chỉ thay thế null/undefined
const port = config.port ?? 3000;
// Nếu config.port = 0 → port = 0 (đúng!)
```

---

## Câu hỏi phỏng vấn

### Câu 1: Sự khác nhau giữa == và ===?

**Đáp án:**

- `==` (loose equality): So sánh **giá trị**, tự động **ép kiểu** (type coercion) trước khi so sánh
- `===` (strict equality): So sánh cả **giá trị lẫn kiểu dữ liệu**, không ép kiểu

```js
console.log(5 == "5");    // true  — "5" bị ép thành 5
console.log(5 === "5");   // false — number !== string

console.log(null == undefined);  // true  — quy tắc đặc biệt
console.log(null === undefined); // false — khác kiểu

console.log(0 == false);  // true  — false bị ép thành 0
console.log(0 === false); // false — number !== boolean
```

**Best practice:** Luôn dùng `===` trừ khi cần kiểm tra `null`/`undefined` cùng lúc (`value == null`).

### Câu 2: Giải thích kết quả: 0 == "" == false?

**Đáp án:**

Phải đánh giá **từ trái sang phải**:

```js
// Bước 1: 0 == ""
// "" ép thành số → Number("") = 0
// 0 == 0 → true

// Bước 2: true == false
// Kết quả bước 1 là true
// true == false → false

console.log((0 == "") == false);
// Kết quả: false... Không phải true!

// Nếu hỏi riêng từng cặp:
console.log(0 == "");    // true
console.log(0 == false); // true
console.log("" == false); // true
// Nhưng 0 == "" == false → false! (vì cách JS đánh giá tuần tự)
```

Đây là lý do nên dùng `===` — tránh hoàn toàn các kết quả khó đoán này.

### Câu 3: Short-circuit evaluation là gì?

**Đáp án:**

Short-circuit evaluation là cơ chế JavaScript **dừng đánh giá biểu thức** ngay khi biết kết quả:

- `&&` dừng ở giá trị **falsy đầu tiên** (vì chỉ cần 1 falsy → kết quả là falsy)
- `||` dừng ở giá trị **truthy đầu tiên** (vì chỉ cần 1 truthy → kết quả là truthy)

```js
// && trả về giá trị falsy đầu tiên, hoặc giá trị cuối cùng
console.log(1 && 2 && 3);     // 3 (tất cả truthy → trả về cuối)
console.log(1 && 0 && 3);     // 0 (gặp 0 falsy → dừng)
console.log(null && "hello");  // null

// || trả về giá trị truthy đầu tiên, hoặc giá trị cuối cùng
console.log(0 || "" || "hi");  // "hi" (gặp truthy → dừng)
console.log(0 || "" || null);  // null (tất cả falsy → trả về cuối)
```

Ứng dụng thực tế:

```js
// Render có điều kiện (giống React)
isLoggedIn && renderDashboard();

// Giá trị mặc định
const name = userName || "Khách";

// Giá trị mặc định an toàn (với ?? cho 0 và "")
const count = inputCount ?? 10;
```

### Câu 4: Sự khác nhau giữa || và ??

**Đáp án:**

| | `\|\|` (OR) | `??` (Nullish Coalescing) |
|---|------------|--------------------------|
| **Dùng mặc định khi** | Giá trị là **falsy** | Giá trị là **null/undefined** |
| **Coi 0 là** | Falsy (dùng mặc định) | Giá trị hợp lệ |
| **Coi "" là** | Falsy (dùng mặc định) | Giá trị hợp lệ |
| **Coi false là** | Falsy (dùng mặc định) | Giá trị hợp lệ |

```js
const a = 0;

console.log(a || 42);  // 42 — 0 là falsy nên dùng 42
console.log(a ?? 42);  // 0  — 0 không phải null/undefined nên giữ nguyên

const b = "";
console.log(b || "mặc định");  // "mặc định"
console.log(b ?? "mặc định");  // ""

const c = null;
console.log(c || "mặc định");  // "mặc định"
console.log(c ?? "mặc định");  // "mặc định" — cả hai giống nhau với null
```
