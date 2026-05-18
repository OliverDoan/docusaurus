---
sidebar_position: 9
title: "9. Truthy & Falsy"
---

# Truthy & Falsy

---

## Mục lục

- [Khái niệm](#khái-niệm)
- [8 giá trị Falsy](#8-giá-trị-falsy)
- [Mọi thứ khác đều Truthy](#mọi-thứ-khác-đều-truthy)
- [Pitfall thường gặp](#pitfall-thường-gặp)
- [Kiểm tra truthy/falsy đúng cách](#kiểm-tra-truthyfalsy-đúng-cách)
- [Ứng dụng truthy/falsy](#ứng-dụng-truthyfalsy)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Khái niệm

Trong JavaScript, **mọi giá trị** đều có thể được dùng trong **boolean context** (như `if`, `while`, `&&`, `||`...). Khi đó:

- **Truthy** — giá trị được coi như `true`
- **Falsy** — giá trị được coi như `false`

```js
if ("hello") {
  console.log("Chuỗi không rỗng là truthy");
}

if (0) {
  console.log("Sẽ KHÔNG chạy — 0 là falsy");
}
```

## 8 giá trị Falsy

JavaScript có **đúng 8 giá trị falsy**. Mọi thứ khác đều truthy.

```js
false                  // boolean false
0                      // số 0
-0                     // âm 0
0n                     // BigInt 0
""                     // chuỗi rỗng (cả '' và ``)
null                   // null
undefined              // undefined
NaN                    // Not a Number
document.all           // ⚠️ legacy, chỉ trên browser
```

### Verify

```js
Boolean(false);       // false
Boolean(0);           // false
Boolean(-0);          // false
Boolean(0n);          // false
Boolean("");          // false
Boolean(null);        // false
Boolean(undefined);   // false
Boolean(NaN);         // false
```

## Mọi thứ khác đều Truthy

Tất cả giá trị **không nằm trong** danh sách falsy → **truthy**:

```js
// String không rỗng → truthy
Boolean("0");        // true ⚠️
Boolean("false");    // true ⚠️
Boolean(" ");        // true ⚠️ (space)
Boolean("null");     // true

// Số khác 0 → truthy
Boolean(1);          // true
Boolean(-1);         // true
Boolean(0.1);        // true
Boolean(Infinity);   // true
Boolean(-Infinity);  // true

// Object luôn truthy
Boolean({});         // true ⚠️ (object rỗng)
Boolean([]);         // true ⚠️ (mảng rỗng)
Boolean(new Boolean(false));  // true ⚠️ (object → truthy)
Boolean(function() {});       // true
Boolean(Symbol("x"));         // true
Boolean(new Date());          // true

// BigInt khác 0
Boolean(1n);         // true
```

## Pitfall thường gặp

### 1. Mảng rỗng vs. số 0

```js
// Mảng rỗng TRUTHY nhưng .length là 0
if ([]) {
  console.log("Mảng rỗng chạy đây");  // ⚠️ chạy
}

if ([].length) {
  console.log("Không chạy");  // 0 → falsy
}
```

### 2. Chuỗi "0" vs số 0

```js
if (0) console.log("không chạy");
if ("0") console.log("CHẠY");     // ⚠️ chuỗi không rỗng

"0" == false;        // true (loose: ép kiểu)
"0" === false;       // false
Boolean("0");        // true
```

### 3. Object luôn truthy

```js
function getUser() {
  return null;  // hoặc user object
}

const user = getUser();
if (user) {
  // Đảm bảo user không null/undefined
  // Nhưng nếu trả về {} (object rỗng) → vẫn truthy!
}
```

### 4. `new Boolean(false)` là truthy

```js
const flag = new Boolean(false);
if (flag) console.log("CHẠY"); // ⚠️ vì flag là object

// Đừng dùng new Boolean()!
const flag = Boolean(false);  // primitive false
if (flag) console.log("không chạy");
```

### 5. Confusing với `==`

```js
"" == false;    // true (cả hai falsy)
0 == false;     // true
null == false;  // false ⚠️
undefined == false;  // false ⚠️
NaN == false;   // false (NaN không bằng gì)
```

## Kiểm tra truthy/falsy đúng cách

### Kiểm tra "có giá trị thực sự"

```js
// ❌ Mơ hồ
if (value) { /* ... */ }

// ✅ Rõ ràng theo mục đích

// 1. Tồn tại (không null/undefined)
if (value != null) { /* ... */ }
if (value !== null && value !== undefined) { /* ... */ }

// 2. Chuỗi không rỗng
if (typeof value === "string" && value.length > 0) { /* ... */ }
if (value !== "") { /* ... */ }

// 3. Mảng có phần tử
if (Array.isArray(value) && value.length > 0) { /* ... */ }

// 4. Số hợp lệ (không NaN, không null)
if (typeof value === "number" && !isNaN(value)) { /* ... */ }
if (Number.isFinite(value)) { /* ... */ }

// 5. Object không rỗng
if (value && Object.keys(value).length > 0) { /* ... */ }
```

### Ép sang boolean rõ ràng

```js
// !! pattern
const hasItems = !!array.length;
const isValid = !!user?.email;

// Boolean()
const isReady = Boolean(state);
```

## Ứng dụng truthy/falsy

### 1. Default value với `||`

```js
function greet(name) {
  name = name || "Guest";
  console.log(`Hello, ${name}`);
}

greet();        // "Hello, Guest"
greet("Alice"); // "Hello, Alice"
greet("");      // "Hello, Guest" ⚠️ (fallback ngay cả khi "" hợp lệ)
```

### 2. Default chỉ khi null/undefined với `??`

```js
function greet(name) {
  name = name ?? "Guest";   // Giữ "" và 0
  console.log(`Hello, ${name}`);
}

greet("");      // "Hello, "  (giữ chuỗi rỗng)
greet(null);    // "Hello, Guest"
```

### 3. Short-circuit execution với `&&`

```js
// Chỉ chạy function nếu user tồn tại
user && user.notify();

// Render component nếu có data
{data && <UserList data={data} />}

// Conditional CSS class
<div className={isActive && "active"}>...</div>
```

### 4. Optional chaining `?.`

```js
const street = user?.address?.street;

// Trả undefined thay vì lỗi khi có link null
const length = items?.length ?? 0;
```

### 5. Filter falsy values

```js
const arr = [1, 0, "hello", "", null, undefined, false, "world"];
const truthy = arr.filter(Boolean);
// [1, "hello", "world"]
```

### 6. Conditional assignment

```js
// Cũ
if (!user.name) {
  user.name = "Anonymous";
}

// Mới: logical assignment
user.name ||= "Anonymous";    // fallback nếu falsy
user.name ??= "Anonymous";    // fallback chỉ null/undefined
```

### 7. Convert sang boolean

```js
const isValid = !!input.value;        // string → boolean
const hasError = !!errors.length;     // length → boolean

// Trong JSX (React)
{!!errors.length && <ErrorList />}
```

---

## Câu hỏi phỏng vấn

### Câu 1: Liệt kê tất cả giá trị falsy trong JS

**Đáp án:**

Có **8 giá trị falsy** (nhớ theo cụm "FÚB-NUN"):

1. **`F`alse**
2. **`Ú`ndefined**
3. **`B`igInt 0** (`0n`)
4. **`N`aN**
5. **`U`ndefined** (đã có)
6. **`N`ull**

Sửa lại theo thứ tự dễ nhớ:

```js
false           // boolean
0, -0           // số
0n              // BigInt
""              // chuỗi rỗng
null
undefined
NaN
document.all    // legacy
```

### Câu 2: Đoán kết quả

```js
console.log(Boolean([]));
console.log(Boolean({}));
console.log(Boolean("0"));
console.log(Boolean("false"));
console.log(Boolean(new Boolean(false)));
console.log([] == false);
console.log([] === false);
```

**Đáp án:**

```
true       (mảng rỗng → object → truthy)
true       (object rỗng → truthy)
true       (chuỗi không rỗng)
true       (chuỗi không rỗng)
true       (new Boolean → object → truthy)
true       (== ép kiểu: [] → "" → 0 → 0 == 0)
false      (=== khác type)
```

### Câu 3: `||` vs `??` khi nào dùng cái nào?

**Đáp án:**

```js
// ||: fallback khi falsy
const port = config.port || 3000;
// → fallback nếu port là 0, "", false, null, undefined

// ??: fallback CHỈ khi null/undefined
const port = config.port ?? 3000;
// → fallback chỉ khi port là null/undefined; giữ 0, "", false

// Dùng ?? khi giá trị "0", "", false là HỢP LỆ
// Dùng || khi muốn fallback mọi falsy
```

### Câu 4: Cách filter các falsy khỏi mảng?

**Đáp án:**

```js
const arr = [0, 1, "", "hello", null, undefined, false, NaN, "world"];

// Pattern 1: filter(Boolean)
arr.filter(Boolean);
// [1, "hello", "world"]

// Pattern 2: filter với arrow
arr.filter(x => x);

// Pattern 3: rõ ràng hơn
arr.filter(x => x != null && x !== "");
// [0, 1, "hello", false, NaN, "world"]
```

`filter(Boolean)` là idiom phổ biến — gọn nhưng cẩn thận: nó loại bỏ cả `0`!
