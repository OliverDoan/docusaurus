---
sidebar_position: 4
title: "4. Boolean"
---

# Boolean

---

## Mục lục

- [Boolean là gì?](#boolean-là-gì)
- [Tạo boolean](#tạo-boolean)
- [Toán tử boolean](#toán-tử-boolean)
- [Boolean primitive vs Boolean object](#boolean-primitive-vs-boolean-object)
- [Truthy & Falsy](#truthy--falsy)
- [Logical operators tận dụng truthy/falsy](#logical-operators-tận-dụng-truthyfalsy)
- [Best practices](#best-practices)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Boolean là gì?

`Boolean` là **kiểu dữ liệu nguyên thuỷ** (primitive) chỉ có **hai giá trị**: `true` và `false`.

Đặt theo tên nhà toán học **George Boole** (Boolean Algebra — đại số logic).

```js
const isActive = true;
const isAdmin = false;

typeof isActive;   // "boolean"
```

## Tạo boolean

### 1. Trực tiếp (literal)

```js
const yes = true;
const no = false;
```

### 2. Từ phép so sánh

```js
const isAdult = age >= 18;       // true hoặc false
const isEqual = a === b;
const hasPermission = role === "admin";
```

### 3. Hàm `Boolean()` — ép kiểu

```js
Boolean(1);          // true
Boolean(0);          // false
Boolean("");         // false
Boolean("hello");    // true
Boolean(null);       // false
Boolean(undefined);  // false
Boolean({});         // true (object luôn truthy!)
Boolean([]);         // true (mảng rỗng cũng truthy!)
```

### 4. Toán tử `!!` — shortcut ép kiểu

```js
!!1;        // true
!!"";       // false
!!"text";   // true
!!null;     // false
```

`!!` hoạt động bằng cách: `!` đầu tiên đảo + ép sang boolean, `!` thứ hai đảo lại → giữ giá trị boolean đúng.

## Toán tử boolean

### NOT (`!`)

```js
!true;      // false
!false;     // true
!"hello";   // false (vì "hello" truthy)
!0;         // true (vì 0 falsy)
```

### AND (`&&`)

Trả về **toán hạng đầu tiên falsy** hoặc **toán hạng cuối**:

```js
true && true;     // true
true && false;    // false
1 && 2;           // 2 (cả hai truthy → trả toán hạng cuối)
0 && 2;           // 0 (gặp falsy → trả ngay)
"a" && "b";       // "b"
null && "b";      // null
```

### OR (`||`)

Trả về **toán hạng đầu tiên truthy** hoặc **toán hạng cuối**:

```js
true || false;    // true
false || true;    // true
0 || "fallback";  // "fallback"
"a" || "b";       // "a" (truthy đầu tiên)
null || 0;        // 0 (tất cả falsy → trả cuối)
```

### Nullish Coalescing (`??`)

Chỉ fallback khi **null hoặc undefined** (khác với `||`):

```js
0 || "x";   // "x"  (0 là falsy)
0 ?? "x";   // 0    (0 không phải null/undefined)

"" || "x";  // "x"
"" ?? "x";  // ""

null ?? "x";       // "x"
undefined ?? "x";  // "x"
```

### XOR — không có toán tử riêng

```js
// Cách 1: chuyển sang boolean rồi so sánh
function xor(a, b) {
  return !!a !== !!b;
}

// Cách 2: bitwise (chỉ đúng với 0/1)
1 ^ 1;  // 0
1 ^ 0;  // 1
```

## Boolean primitive vs Boolean object

```js
const a = true;                  // primitive
const b = new Boolean(true);     // ⚠️ object!

typeof a;   // "boolean"
typeof b;   // "object"

a === true;    // true
b === true;    // false (b là object)
b.valueOf();   // true (lấy primitive bên trong)
```

> ❌ **Đừng dùng `new Boolean()`** — rất dễ gây bug, đặc biệt trong điều kiện:

```js
const x = new Boolean(false);
if (x) {
  console.log("Đây sẽ chạy!");  // ⚠️ x là object → truthy
}
```

## Truthy & Falsy

JavaScript có khái niệm **truthy** (coi như true) và **falsy** (coi như false) khi dùng trong ngữ cảnh boolean (`if`, `while`, `&&`, `||`...).

### 8 giá trị Falsy

```js
false
0, -0, 0n          // số 0 (kể cả BigInt)
"", '', ``         // chuỗi rỗng
null
undefined
NaN
document.all       // ⚠️ legacy, chỉ trên browser
```

### Mọi thứ khác đều Truthy

```js
"0"        // chuỗi "0" → truthy!
"false"    // chuỗi "false" → truthy!
[]         // mảng rỗng → truthy!
{}         // object rỗng → truthy!
function(){}  // function → truthy
```

### Ví dụ thực tế

```js
// ❌ Bug: kiểm tra mảng rỗng sai cách
const arr = [];
if (arr) {
  console.log("Mảng có phần tử");  // ⚠️ in ra mặc dù arr rỗng!
}

// ✅ Đúng
if (arr.length > 0) {
  console.log("Mảng có phần tử");
}
```

## Logical operators tận dụng truthy/falsy

### Short-circuit evaluation

```js
// 1. Default value với ||
function greet(name) {
  name = name || "Guest";  // Nếu name falsy → "Guest"
  console.log(`Hello, ${name}`);
}

// 2. Conditional execution với &&
isLoggedIn && showWelcome();  // Chỉ chạy showWelcome khi truthy

// 3. Safe navigation với ?.
user?.profile?.name;  // Không lỗi nếu user/profile null
```

### Default parameter (cách hiện đại)

```js
// Cách cũ
function greet(name) {
  name = name || "Guest";
}

// ES6+ (chỉ thay khi undefined)
function greet(name = "Guest") {
  console.log(`Hello, ${name}`);
}

greet();          // "Hello, Guest"
greet("Alice");   // "Hello, Alice"
greet("");        // "Hello, "      (KHÔNG fallback vì "" ≠ undefined)
greet(null);      // "Hello, null"  (KHÔNG fallback vì null ≠ undefined)
```

## Best practices

### 1. Dùng `Boolean()` thay `new Boolean()`

```js
// ❌
const x = new Boolean(true);

// ✅
const x = Boolean(value);
// hoặc
const x = !!value;
```

### 2. Kiểm tra rõ ràng

```js
// ❌ Mơ hồ
if (data) { /* ... */ }

// ✅ Rõ ràng theo ý đồ
if (data !== null && data !== undefined) { /* tồn tại */ }
if (Array.isArray(data) && data.length > 0) { /* mảng có phần tử */ }
if (typeof data === "string" && data.length > 0) { /* chuỗi không rỗng */ }
```

### 3. Đặt tên biến boolean theo quy ước

```js
// ✅ Bắt đầu bằng is/has/can/should
const isLoggedIn = true;
const hasPermission = false;
const canEdit = checkPermission();
const shouldRender = items.length > 0;

// ❌ Tên mơ hồ
const login = true;
const permission = false;
```

### 4. Tránh so sánh trực tiếp với `true`/`false`

```js
// ❌ Dư thừa
if (isReady === true) { /* ... */ }
if (isError === false) { /* ... */ }

// ✅ Gọn hơn
if (isReady) { /* ... */ }
if (!isError) { /* ... */ }
```

---

## Câu hỏi phỏng vấn

### Câu 1: `[] == false` trả về gì? Vì sao?

**Đáp án:** `true`.

Quy tắc so sánh `==` với boolean:
1. `false` được ép thành số → `0`
2. `[]` được ép thành chuỗi `""` → ép thành số `0`
3. `0 == 0` → `true`

Đây là lý do nên dùng `===` thay vì `==`.

### Câu 2: Sự khác biệt giữa `||` và `??`?

**Đáp án:**

- `||` fallback khi **falsy** (bao gồm `0`, `""`, `false`, `null`, `undefined`, `NaN`)
- `??` chỉ fallback khi **null hoặc undefined**

```js
const port = process.env.PORT ?? 3000;   // Giữ 0 nếu user set PORT=0
const port = process.env.PORT || 3000;   // Sẽ fallback về 3000 nếu PORT=0
```

### Câu 3: Tại sao `new Boolean(false)` lại truthy?

**Đáp án:**

`new Boolean(false)` tạo ra một **object** chứa giá trị `false`. Trong ngữ cảnh boolean, **mọi object đều truthy** (bao gồm `{}`, `[]`, `new Boolean(false)`).

```js
const b = new Boolean(false);
typeof b;     // "object"
Boolean(b);   // true  (object → truthy)
b.valueOf();  // false (lấy primitive bên trong)
```

Đây là lý do **không bao giờ dùng `new Boolean()`** trong code thực tế.
