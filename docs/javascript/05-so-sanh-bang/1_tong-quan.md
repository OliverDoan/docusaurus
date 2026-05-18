---
sidebar_position: 1
title: "1. Tổng quan So sánh bằng"
---

# Tổng quan So sánh bằng (Equality Comparisons)

---

## Mục lục

- [4 loại so sánh trong JS](#4-loại-so-sánh-trong-js)
- [Bảng tổng kết nhanh](#bảng-tổng-kết-nhanh)
- [Khi nào dùng cái nào?](#khi-nào-dùng-cái-nào)
- [Các quirk thường gặp](#các-quirk-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 4 loại so sánh trong JS

JavaScript có **bốn thuật toán so sánh bằng**:

| Tên | Cú pháp | Còn gọi là |
|-----|---------|------------|
| 1. Loose equality | `==`, `!=` | Abstract Equality |
| 2. Strict equality | `===`, `!==` | IsStrictlyEqual |
| 3. SameValue | `Object.is(a, b)` | — |
| 4. SameValueZero | `Map`/`Set` key, `Array.includes` | — |

### 1. `==` — Loose equality

Cho phép **ép kiểu (coercion)** trước khi so sánh:

```js
"5" == 5;       // true (chuỗi → số)
true == 1;      // true (boolean → số)
null == undefined; // true (đặc biệt)
```

### 2. `===` — Strict equality

So sánh giá trị **không ép kiểu** — khác kiểu là `false` ngay:

```js
"5" === 5;      // false
true === 1;     // false
null === undefined; // false
```

### 3. `Object.is()` — SameValue

Giống `===`, nhưng xử lý hai trường hợp đặc biệt:

```js
Object.is(NaN, NaN);     // true   (=== trả false)
Object.is(+0, -0);       // false  (=== trả true)
Object.is(1, 1);         // true
Object.is("a", "a");     // true
```

### 4. SameValueZero

Giống `===` nhưng coi `NaN === NaN` (như `Object.is`), trong khi `+0 === -0`:

```js
[NaN].includes(NaN);          // true
new Set([NaN, NaN]).size;     // 1 (chỉ một NaN)
new Map([[NaN, "a"]]).get(NaN); // "a"
```

## Bảng tổng kết nhanh

| Ví dụ | `==` | `===` | `Object.is` | SameValueZero |
|-------|------|-------|-------------|---------------|
| `1 == 1` | ✅ | ✅ | ✅ | ✅ |
| `"a" == "a"` | ✅ | ✅ | ✅ | ✅ |
| `1 == "1"` | ✅ | ❌ | ❌ | ❌ |
| `null == undefined` | ✅ | ❌ | ❌ | ❌ |
| `0 == false` | ✅ | ❌ | ❌ | ❌ |
| `NaN == NaN` | ❌ | ❌ | ✅ | ✅ |
| `+0 == -0` | ✅ | ✅ | ❌ | ✅ |

## Khi nào dùng cái nào?

### `===` (mặc định)

```js
// ✅ Trường hợp 99% — luôn dùng ===
if (status === "active") { /* ... */ }
if (count === 0) { /* ... */ }
```

### `==` (chỉ một trường hợp hợp lý)

```js
// ✅ Check cả null và undefined
if (value == null) {
  // value là null hoặc undefined
}

// ❌ Mọi trường hợp khác — tránh dùng
```

### `Object.is`

```js
// ✅ Khi cần phân biệt NaN, +0/-0
function detectChange(a, b) {
  return !Object.is(a, b);
}

// React dùng Object.is để so sánh state
```

### SameValueZero (gián tiếp qua Set/Map/includes)

```js
// ✅ Khi muốn NaN coi là bằng NaN
[NaN, 1, 2].includes(NaN);    // true

const set = new Set();
set.add(NaN);
set.add(NaN);
set.size;   // 1
```

## Các quirk thường gặp

### 1. `NaN !== NaN`

```js
NaN === NaN;     // false ⚠️
NaN == NaN;      // false

// Cách check NaN đúng:
Number.isNaN(NaN);    // true
Object.is(NaN, NaN);  // true
```

### 2. `+0` và `-0`

```js
+0 === -0;            // true
+0 == -0;             // true
Object.is(+0, -0);    // false ⚠️

// Khi nào quan trọng?
1 / +0;    // Infinity
1 / -0;    // -Infinity
```

### 3. Object/Array — so sánh tham chiếu

```js
{} === {};        // false (khác object)
[] === [];        // false
[1] === [1];      // false

const a = { x: 1 };
const b = a;
a === b;          // true (cùng tham chiếu)
```

### 4. `[] == false`

```js
[] == false;
// 1. false → 0
// 2. [] → "" (toPrimitive)
// 3. "" → 0
// 4. 0 == 0 → true
```

## So sánh sâu (deep equal)

JS **không có** so sánh object sâu built-in:

```js
// ❌ Không hoạt động
{ a: 1 } === { a: 1 };   // false

// ✅ Trick (hạn chế):
JSON.stringify({ a: 1 }) === JSON.stringify({ a: 1 });   // true
// Nhưng: không xử lý function, undefined, Date, Map, circular...

// ✅ Tốt hơn: dùng thư viện
import { isEqual } from "lodash";
isEqual({ a: 1 }, { a: 1 });   // true
```

---

## Câu hỏi phỏng vấn

### Câu 1: 4 loại so sánh trong JS là gì?

**Đáp án:**

1. **Loose equality (`==`)** — ép kiểu trước khi so sánh
2. **Strict equality (`===`)** — không ép kiểu
3. **SameValue (`Object.is`)** — như `===` nhưng phân biệt `+0/-0` và `NaN === NaN`
4. **SameValueZero** — như `===` nhưng `NaN === NaN`; dùng nội bộ bởi `Map`, `Set`, `Array.includes`

### Câu 2: Khi nào nên dùng `==` thay vì `===`?

**Đáp án:**

Hầu như **không bao giờ** — trừ trường hợp duy nhất: kiểm tra cả `null` lẫn `undefined`:

```js
if (value == null) {
  // ngắn gọn hơn value === null || value === undefined
}
```

Mọi trường hợp khác → dùng `===` để tránh bug do ép kiểu.

### Câu 3: Đoán kết quả

```js
console.log(NaN === NaN);
console.log(Object.is(NaN, NaN));
console.log(+0 === -0);
console.log(Object.is(+0, -0));
console.log([NaN].includes(NaN));
```

**Đáp án:**

```
false      (=== không bằng cho NaN)
true       (Object.is xử lý NaN)
true       (=== không phân biệt 0)
false      (Object.is phân biệt)
true       (includes dùng SameValueZero)
```

### Câu 4: Vì sao `{} === {}` trả false?

**Đáp án:**

Object trong JS so sánh **theo tham chiếu** (reference), không theo nội dung. Hai object literal `{}` tạo ra **hai vùng nhớ khác nhau**, dù trông giống hệt.

```js
const a = {};
const b = a;       // cùng tham chiếu
a === b;           // true

const c = {};      // tham chiếu mới
a === c;           // false
```

Để so sánh nội dung sâu, cần viết hàm riêng hoặc dùng `lodash.isEqual`.
