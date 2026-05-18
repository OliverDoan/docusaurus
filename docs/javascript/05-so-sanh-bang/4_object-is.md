---
sidebar_position: 4
title: "4. Object.is & SameValueZero"
---

# `Object.is` & SameValueZero

---

## Mục lục

- [Vì sao cần thêm thuật toán so sánh?](#vì-sao-cần-thêm-thuật-toán-so-sánh)
- [`Object.is()` — SameValue](#objectis--samevalue)
- [SameValueZero — dùng trong Map/Set/Array](#samevaluezero--dùng-trong-mapsetarray)
- [Bảng tổng kết 4 thuật toán](#bảng-tổng-kết-4-thuật-toán)
- [Khi nào dùng `Object.is`?](#khi-nào-dùng-objectis)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vì sao cần thêm thuật toán so sánh?

`===` có **hai trường hợp đặc biệt** mâu thuẫn với "đúng nghĩa toán học":

```js
NaN === NaN;    // false ⚠️ (NaN không bằng chính nó)
+0 === -0;      // true  ⚠️ (nhưng 1/+0 ≠ 1/-0)
```

ES6 thêm hai thuật toán mới để giải quyết:

| Thuật toán | API | NaN === NaN | +0 vs -0 |
|------------|-----|-------------|----------|
| `===` | `a === b` | `false` | `true` |
| **SameValue** | `Object.is(a, b)` | `true` | `false` |
| **SameValueZero** | `Set/Map/includes` | `true` | `true` |

## `Object.is()` — SameValue

`Object.is(a, b)` hoạt động **giống `===`** trừ hai trường hợp:

```js
Object.is(NaN, NaN);     // true   (=== trả false)
Object.is(+0, -0);       // false  (=== trả true)

// Mọi trường hợp khác như ===
Object.is(1, 1);         // true
Object.is("a", "a");     // true
Object.is({}, {});       // false (khác reference)
Object.is(null, null);   // true
Object.is(null, undefined); // false
```

### Use case của `Object.is`

#### 1. Phân biệt `+0` và `-0`

```js
function isNegativeZero(n) {
  return Object.is(n, -0);
}

isNegativeZero(0);    // false
isNegativeZero(-0);   // true
```

#### 2. Check NaN chính xác

```js
Object.is(NaN, NaN);        // true
Object.is(Number.NaN, NaN); // true

// Trước đây phải dùng:
Number.isNaN(NaN);          // true
```

#### 3. React dùng Object.is cho so sánh state

React 16+ dùng `Object.is` để quyết định re-render:

```js
// React source code (simplified)
function objectIs(a, b) {
  return Object.is(a, b);
}

// shouldComponentUpdate / useEffect dependency check
if (!objectIs(prevState, nextState)) {
  // re-render
}
```

### Polyfill `Object.is`

```js
if (!Object.is) {
  Object.is = function(a, b) {
    if (a === b) {
      // Phân biệt +0 và -0
      return a !== 0 || 1 / a === 1 / b;
    }
    // Coi NaN === NaN
    return a !== a && b !== b;
  };
}
```

## SameValueZero — dùng trong Map/Set/Array

**SameValueZero** giống `===` nhưng **coi `NaN === NaN`** (như `Object.is`), trong khi vẫn `+0 === -0` (như `===`).

Đây là thuật toán **không expose trực tiếp** — bạn không gọi được như `SameValueZero(a, b)`. Thay vào đó nó được dùng **nội bộ** bởi:

| API | Sử dụng SameValueZero |
|-----|----------------------|
| `Array.prototype.includes` | ✅ |
| `Set.prototype.add/has/delete` | ✅ |
| `Map.prototype.set/get/has` | ✅ |
| `TypedArray.prototype.includes` | ✅ |

### Ví dụ

```js
// includes coi NaN bằng NaN
[1, 2, NaN].includes(NaN);   // true
[1, 2, NaN].indexOf(NaN);    // -1 ⚠️ (indexOf dùng ===)

// Set deduplicate NaN
new Set([NaN, NaN, NaN]).size;   // 1 ✅

// Map cũng vậy
const m = new Map();
m.set(NaN, "value");
m.get(NaN);   // "value" ✅
m.has(NaN);   // true ✅

// Coi +0 và -0 là cùng
new Set([+0, -0]).size;       // 1 (cùng entry)
[+0, -0].includes(-0);        // true
```

### So với indexOf (dùng `===`)

```js
const arr = [NaN, 1, 2];

arr.indexOf(NaN);     // -1 ⚠️ (===: NaN !== NaN)
arr.includes(NaN);    // true ✅ (SameValueZero)

// Workaround cũ cho indexOf:
arr.findIndex(x => Number.isNaN(x));   // 0
```

## Bảng tổng kết 4 thuật toán

| | `==` | `===` | `Object.is` | SameValueZero |
|---|------|-------|-------------|---------------|
| `1, 1` | ✅ | ✅ | ✅ | ✅ |
| `"a", "a"` | ✅ | ✅ | ✅ | ✅ |
| `1, "1"` | ✅ | ❌ | ❌ | ❌ |
| `null, undefined` | ✅ | ❌ | ❌ | ❌ |
| `0, false` | ✅ | ❌ | ❌ | ❌ |
| `NaN, NaN` | ❌ | ❌ | ✅ | ✅ |
| `+0, -0` | ✅ | ✅ | ❌ | ✅ |
| `[1], [1]` | ❌ | ❌ | ❌ | ❌ |
| `null, null` | ✅ | ✅ | ✅ | ✅ |

## Khi nào dùng `Object.is`?

### ✅ Dùng khi:

1. **Cần phân biệt `+0` và `-0`** (hiếm)
2. **Cần coi `NaN === NaN`** mà không muốn dùng `Number.isNaN`
3. **So sánh state trong framework** (React style)
4. **Polyfill / engine code**

```js
function detectChange(prev, next) {
  return !Object.is(prev, next);
}

// State comparison
if (detectChange(prevValue, nextValue)) {
  // trigger update
}
```

### ❌ Không cần dùng khi:

```js
// Use case thông thường — dùng === cho ngắn gọn
if (status === "active") { /* ... */ }

// Check NaN — dùng Number.isNaN rõ ràng hơn
if (Number.isNaN(value)) { /* ... */ }
```

---

## Câu hỏi phỏng vấn

### Câu 1: 3 trường hợp `Object.is` khác `===`?

**Đáp án:**

Thực ra chỉ có **2 trường hợp** khác biệt:

```js
// 1. NaN
Object.is(NaN, NaN);   // true
NaN === NaN;           // false

// 2. +0 / -0
Object.is(+0, -0);     // false
+0 === -0;             // true
```

Tất cả trường hợp khác — `Object.is` và `===` giống hệt.

### Câu 2: Vì sao `[1, 2, NaN].indexOf(NaN)` trả `-1` nhưng `.includes(NaN)` trả `true`?

**Đáp án:**

- `indexOf` dùng thuật toán **strict equality (`===`)** → `NaN === NaN` là `false` → không tìm thấy → `-1`.
- `includes` dùng **SameValueZero** → coi `NaN === NaN` là `true` → tìm thấy → `true`.

Quy luật: các API **mới hơn** (ES6+) thường dùng SameValueZero để xử lý NaN tốt hơn:
- `Array.includes` (ES2016)
- `Set`, `Map` (ES6)
- `String.includes` (ES6)

### Câu 3: React dùng thuật toán so sánh nào để check state?

**Đáp án:**

React dùng `Object.is` (SameValue) — để:
- Coi `NaN === NaN` (tránh re-render vô tận khi state là NaN)
- Phân biệt `+0` và `-0` (rất hiếm trường hợp)

```js
// React internal (simplified)
function is(x, y) {
  return Object.is(x, y);
}

// Trong useState, useMemo, useCallback...
if (!is(prevDep, nextDep)) {
  // run effect / recompute
}
```

### Câu 4: Đoán kết quả

```js
const set = new Set();
set.add(NaN);
set.add(NaN);
set.add(+0);
set.add(-0);

console.log(set.size);
console.log([...set]);
```

**Đáp án:**

```
2
[NaN, 0]
```

- `Set` dùng SameValueZero → `NaN === NaN`, `+0 === -0` → chỉ giữ 2 entry duy nhất
- Lần `add(NaN)` thứ hai và `add(-0)` đều bị bỏ qua vì đã có
