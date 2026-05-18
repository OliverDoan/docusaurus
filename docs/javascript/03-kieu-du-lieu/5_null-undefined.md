---
sidebar_position: 5
title: "5. Null & Undefined"
---

# Null & Undefined

---

## Mục lục

- [Tổng quan](#tổng-quan)
- [`undefined` — không có giá trị](#undefined--không-có-giá-trị)
- [`null` — không có gì có chủ đích](#null--không-có-gì-có-chủ-đích)
- [So sánh `null` và `undefined`](#so-sánh-null-và-undefined)
- [Bug lịch sử: `typeof null === "object"`](#bug-lịch-sử-typeof-null--object)
- [Kiểm tra null/undefined](#kiểm-tra-nullundefined)
- [Optional chaining & Nullish coalescing](#optional-chaining--nullish-coalescing)
- [Best practices](#best-practices)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Tổng quan

JavaScript có **hai cách** để thể hiện "không có giá trị":

| | `undefined` | `null` |
|---|-------------|--------|
| Ý nghĩa | Chưa được gán | Cố ý không có gì |
| Ai gán? | JS engine (tự động) | Lập trình viên (chủ động) |
| `typeof` | `"undefined"` | `"object"` (bug lịch sử) |
| Là falsy? | ✅ | ✅ |
| Là primitive? | ✅ | ✅ |

## `undefined` — không có giá trị

`undefined` xuất hiện **tự động** khi một thứ gì đó chưa có giá trị.

### Các trường hợp tạo ra `undefined`

```js
// 1. Biến khai báo nhưng chưa gán
let x;
console.log(x);   // undefined

// 2. Tham số không truyền
function test(a, b) {
  console.log(a, b);
}
test(1);   // 1, undefined

// 3. Hàm không return
function noReturn() {}
console.log(noReturn());   // undefined

// 4. Truy cập property không tồn tại
const obj = { name: "Alice" };
console.log(obj.age);   // undefined

// 5. Truy cập phần tử mảng ngoài phạm vi
const arr = [1, 2];
console.log(arr[10]);   // undefined

// 6. void operator
console.log(void 0);    // undefined
```

### Đặc điểm

```js
typeof undefined;        // "undefined"
undefined === undefined; // true
undefined == null;       // true (chỉ với ==)
undefined === null;      // false
Boolean(undefined);      // false
Number(undefined);       // NaN
String(undefined);       // "undefined"
```

## `null` — không có gì có chủ đích

`null` được lập trình viên gán **chủ động** để chỉ rõ "biến này cố ý rỗng".

### Khi nào dùng `null`?

```js
// 1. Khởi tạo biến sẽ có giá trị sau
let user = null;
fetchUser().then(data => { user = data; });

// 2. Đánh dấu "không có kết quả"
function findUser(id) {
  const found = users.find(u => u.id === id);
  return found || null;   // null nếu không tìm thấy
}

// 3. Xoá tham chiếu (giải phóng memory)
let bigObject = { /* nhiều dữ liệu */ };
// ... dùng xong ...
bigObject = null;   // Cho phép GC dọn dẹp

// 4. Giá trị cho DOM API
document.getElementById("notExist");   // null (không phải undefined!)
```

### Đặc điểm

```js
typeof null;             // "object" ⚠️ BUG LỊCH SỬ
null === null;           // true
null == undefined;       // true
null === undefined;      // false
Boolean(null);           // false
Number(null);            // 0 ⚠️
String(null);            // "null"
```

## So sánh `null` và `undefined`

```js
// Loose equality (==): bằng nhau
null == undefined;    // true
null == null;         // true
undefined == undefined; // true

// Strict equality (===): khác nhau
null === undefined;   // false

// Toán học
null + 1;             // 1  (null → 0)
undefined + 1;        // NaN (undefined → NaN)

// Chuỗi
"a" + null;           // "anull"
"a" + undefined;      // "aundefined"

// JSON
JSON.stringify({ a: null, b: undefined });   // '{"a":null}'  ← undefined bị bỏ
```

> **Quan trọng:** `JSON.stringify` **bỏ qua** giá trị `undefined` — đây là lý do API thường dùng `null` thay vì `undefined` cho dữ liệu trống.

## Bug lịch sử: `typeof null === "object"`

```js
typeof null;   // "object" — KHÔNG phải "null"!
```

**Lý do:** Trong phiên bản đầu tiên của JS (1995), Brendan Eich biểu diễn giá trị bằng "type tag":

| Tag (3 bit) | Loại |
|-------------|------|
| 000 | object |
| 001 | int |
| 010 | double |
| 100 | string |
| 110 | boolean |

`null` được biểu diễn là **toàn bit 0** → trùng tag với object → `typeof` trả `"object"`.

**Tại sao không sửa?** Sửa sẽ **phá vỡ** code của hàng triệu website đã dependency vào bug này.

### Cách kiểm tra null đúng

```js
// ❌ Sai
typeof value === "null";  // luôn false

// ✅ Đúng
value === null;
```

## Kiểm tra null/undefined

### Kiểm tra cụ thể

```js
// Chỉ null
value === null;

// Chỉ undefined
value === undefined;
typeof value === "undefined";  // an toàn ngay cả khi value chưa khai báo

// Cả hai (gọn nhất)
value == null;          // true cho cả null và undefined
value === null || value === undefined;  // tương đương
```

### Kiểm tra "có giá trị thực sự"

```js
// Có thể là 0, "" — vẫn coi là "có giá trị"
if (value != null) {
  console.log("Có giá trị:", value);
}

// Hoặc dùng nullish coalescing
const name = user?.name ?? "Guest";
```

### `Object.is()` — phân biệt rõ ràng

```js
Object.is(null, null);          // true
Object.is(undefined, undefined); // true
Object.is(null, undefined);      // false
Object.is(NaN, NaN);             // true (khác === vì NaN !== NaN)
```

## Optional chaining & Nullish coalescing

### Optional chaining `?.`

Truy cập property an toàn — trả `undefined` thay vì lỗi:

```js
const user = null;

// ❌ Cách cũ
const name = user && user.profile && user.profile.name;

// ✅ ES2020
const name = user?.profile?.name;   // undefined

// Hoạt động với:
obj?.prop;            // property
obj?.[expr];          // computed property
arr?.[0];             // mảng
func?.();             // function call
obj?.method?.();      // method call
```

### Nullish coalescing `??`

Fallback chỉ khi `null/undefined`:

```js
const name = user?.name ?? "Guest";
const port = process.env.PORT ?? 3000;

// So với ||
const count = 0 ?? 10;   // 0  (giữ 0)
const count = 0 || 10;   // 10 (0 là falsy)
```

### Logical nullish assignment `??=`

```js
let config = { timeout: 0 };

config.timeout ??= 5000;  // Không đổi (0 không phải null/undefined)
config.retries ??= 3;     // retries = 3
```

## Best practices

### 1. Ưu tiên `undefined` cho "chưa có", `null` cho "cố ý rỗng"

```js
// ✅ Tham số chưa truyền → undefined
function fetch(url, options) {
  options ??= {};  // dùng default
}

// ✅ Đánh dấu "không có kết quả" → null
function findById(id) {
  return database.find(x => x.id === id) ?? null;
}
```

### 2. Dùng `== null` để check cả hai

```js
if (value == null) {
  // value là null hoặc undefined
}
// gọn hơn `value === null || value === undefined`
```

### 3. Khi serialize → cân nhắc `null` vs `undefined`

```js
const obj = { a: 1, b: null, c: undefined };
JSON.stringify(obj);   // '{"a":1,"b":null}'  ← c biến mất

// Nếu cần giữ undefined → convert thành null
const safe = JSON.parse(JSON.stringify(obj, (k, v) => v === undefined ? null : v));
```

### 4. TypeScript

```typescript
// Cho phép null/undefined explicit
type Maybe<T> = T | null | undefined;

function getUser(id: string): User | null {
  return users.find(u => u.id === id) ?? null;
}

// strictNullChecks: true (khuyến nghị)
```

---

## Câu hỏi phỏng vấn

### Câu 1: `typeof null` trả về gì? Tại sao?

**Đáp án:** `"object"`.

Đây là **bug lịch sử** từ JS đời đầu (1995). Trong V1, các giá trị được phân loại bằng "type tag" (3 bit đầu). `null` được biểu diễn toàn số 0, trùng với type tag của object → `typeof` trả `"object"`. Không sửa được vì sẽ phá vỡ code đã viết.

### Câu 2: Khác biệt giữa `null` và `undefined`?

**Đáp án:**

| | `undefined` | `null` |
|---|-------------|--------|
| Ai gán | JS engine tự động | Lập trình viên |
| Ý nghĩa | Chưa có giá trị | Cố ý không có gì |
| `Number()` | `NaN` | `0` |
| JSON | Bị bỏ qua | Giữ lại |
| `typeof` | `"undefined"` | `"object"` |

### Câu 3: Đoán kết quả

```js
console.log(null == undefined);
console.log(null === undefined);
console.log(null + undefined);
console.log(null + 1);
```

**Đáp án:**

```
true       (== thực hiện chuyển đổi đặc biệt)
false      (=== không chuyển đổi)
NaN        (null → 0, undefined → NaN, 0 + NaN = NaN)
1          (null → 0, 0 + 1 = 1)
```

### Câu 4: Khi nào dùng `?.` so với `&&`?

**Đáp án:**

```js
// Cũ: && phải lặp lại biến nhiều lần
const street = user && user.address && user.address.street;

// Mới: ?. gọn hơn, an toàn hơn
const street = user?.address?.street;

// ?. trả `undefined` nếu bất kì link nào null/undefined
// && trả luôn giá trị falsy đó (có thể là 0, "")
```

`?.` rõ ràng hơn về ý đồ — "chỉ truy cập nếu tồn tại".
