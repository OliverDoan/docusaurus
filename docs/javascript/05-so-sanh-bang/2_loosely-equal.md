---
sidebar_position: 2
title: "2. Loose Equality (==)"
---

# Loose Equality (`==`)

---

## Mục lục

- [`==` là gì?](#-là-gì)
- [Thuật toán Abstract Equality](#thuật-toán-abstract-equality)
- [Bảng so sánh đầy đủ](#bảng-so-sánh-đầy-đủ)
- [Các quirk thường gây bug](#các-quirk-thường-gây-bug)
- [Khi nào CHẤP NHẬN dùng `==`?](#khi-nào-chấp-nhận-dùng-)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## `==` là gì?

**Loose equality** (`==`) là toán tử so sánh **có ép kiểu** — nếu hai toán hạng khác kiểu, JS sẽ cố gắng chuyển đổi rồi mới so sánh.

```js
"5" == 5;        // true  (chuỗi → số)
1 == true;       // true  (boolean → số)
null == undefined; // true (đặc biệt)
```

> ⚠️ **Coding style hiện đại khuyến nghị KHÔNG dùng `==`** — vì các quy tắc ép kiểu phức tạp và dễ gây bug.

## Thuật toán Abstract Equality

Theo spec ECMAScript, khi gặp `x == y`:

1. **Cùng kiểu** → giống như `===`
2. `null == undefined` → `true`
3. **Số vs Chuỗi** → chuỗi chuyển sang số
4. **Boolean vs bất kỳ** → boolean chuyển sang số (`true → 1`, `false → 0`)
5. **Object vs primitive** → object gọi `valueOf()` rồi `toString()`
6. **BigInt vs Number** → so sánh giá trị toán học
7. Còn lại → `false`

### Minh hoạ từng bước

```js
// "5" == 5
// 1. Khác kiểu (string vs number)
// 2. → chuyển "5" thành 5
// 3. 5 === 5 → true

// [] == false
// 1. Khác kiểu (object vs boolean)
// 2. false → 0
// 3. Khác kiểu (object vs number)
// 4. [] → toPrimitive → "" → 0
// 5. 0 === 0 → true

// null == 0
// 1. Khác kiểu
// 2. Không nằm trong rule 2 (chỉ null == undefined)
// 3. Không có rule nào áp dụng → false
```

## Bảng so sánh đầy đủ

| | undefined | null | true | false | 1 | 0 | "1" | "0" | "" | NaN | [] |
|---|-----|-----|------|------|---|---|-----|-----|-----|-----|-----|
| **undefined** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **null** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **true** | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **false** | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ |
| **1** | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **0** | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ |
| **"1"** | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **"0"** | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **""** | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ |
| **NaN** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **[]** | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |

## Các quirk thường gây bug

### 1. `null == 0` là `false`

```js
null == 0;       // false ⚠️ (lẽ ra phải true nếu null → 0?)
null > 0;        // false
null >= 0;       // true ⚠️
null < 1;        // true
```

Lý do: `==` có rule **đặc biệt** rằng `null` chỉ bằng `undefined`. Còn `<`, `>`, `>=`, `<=` không có rule này → ép `null` thành `0`.

### 2. Chuỗi rỗng

```js
"" == 0;         // true
"" == false;     // true
"" == null;      // false ⚠️
"" == undefined; // false
"" == [];        // true ⚠️
" " == 0;        // true (chuỗi chỉ space → 0)
```

### 3. `[] == false` nhưng `[] == ![]`

```js
[] == false;     // true
[] == ![];       // true ⚠️ (cả hai true!)

// ![] = false (vì [] truthy, ![] là false)
// → [] == false → cùng kết quả như trên
```

### 4. Object vs primitive

```js
const obj = {
  valueOf() { return 42; }
};

obj == 42;       // true (gọi valueOf)
obj == "42";     // true (42 == "42" → "42" → 42)

const obj2 = {
  toString() { return "hello"; }
};

obj2 == "hello"; // true (valueOf trả {}, fallback toString)
```

### 5. BigInt vs Number

```js
1n == 1;          // true  (so sánh giá trị toán học)
1n === 1;         // false (khác kiểu)
2n == "2";        // true  ("2" → 2 → 2n == 2)
1n == 1.5;        // false (giá trị khác)
```

## Khi nào CHẤP NHẬN dùng `==`?

### 1. Check `null` hoặc `undefined`

```js
// Pattern phổ biến
if (value == null) {
  // value là null hoặc undefined
}

// Tương đương:
if (value === null || value === undefined) { /* ... */ }

// Ngắn hơn → nhiều dev chấp nhận pattern này
```

### 2. Khi đảm bảo cùng kiểu

Không cần dùng `==` — vẫn nên dùng `===` để rõ ý.

## So sánh `==` với `===`

```js
// Số khác chuỗi cùng giá trị
1 == "1";          // true
1 === "1";         // false

// Boolean
true == 1;         // true
true === 1;        // false

// Null/Undefined
null == undefined; // true
null === undefined; // false

// Object
{} == {};          // false (khác reference)
{} === {};         // false (cùng kết quả!)
```

---

## Câu hỏi phỏng vấn

### Câu 1: Tại sao `null == 0` lại `false` nhưng `null >= 0` lại `true`?

**Đáp án:**

Thuật toán `==` có rule đặc biệt: `null` **chỉ** bằng `null` và `undefined`, không bằng số. Đây là quy tắc cứng trong spec.

Nhưng các toán tử so sánh quan hệ (`<`, `>`, `>=`, `<=`) **không có rule này** — chúng ép `null → 0`:

```js
null == 0;    // false (rule đặc biệt)
null < 1;     // true  (null → 0, 0 < 1)
null >= 0;    // true  (null → 0, 0 >= 0)
null > -1;    // true  (null → 0)
```

### Câu 2: Đoán kết quả

```js
console.log("" == 0);
console.log("" == false);
console.log(0 == false);
console.log(0 == "0");
console.log("0" == false);
console.log(null == 0);
console.log(null == false);
console.log(undefined == false);
```

**Đáp án:**

```
true     ("" → 0, 0 == 0)
true     (false → 0, "" → 0)
true     (false → 0)
true     ("0" → 0)
true     ("0" → 0, false → 0)
false    (null chỉ bằng undefined với ==)
false    (rule đặc biệt của null)
false    (rule đặc biệt của undefined)
```

### Câu 3: Vì sao `[] == ![]` lại true?

**Đáp án:**

```js
// Bước 1: ![] = false (vì [] là object → truthy → !truthy = false)
// Bước 2: [] == false
// Bước 3: false → 0 (boolean → number)
// Bước 4: [] → "" (object → toPrimitive)
// Bước 5: "" → 0 (string → number)
// Bước 6: 0 == 0 → true
```

Đây là ví dụ kinh điển cho thấy `==` có thể gây nhầm lẫn nghiêm trọng.

### Câu 4: Nên dùng `==` khi nào?

**Đáp án:**

Hiện nay, đa số style guide (Airbnb, Google, ESLint default) **cấm dùng `==`** hoàn toàn. Trường hợp duy nhất được chấp nhận:

```js
if (value == null) {
  // shortcut cho null || undefined
}
```

Và ngay cả trường hợp này, nhiều dev vẫn ưu tiên rõ ràng:

```js
if (value === null || value === undefined) { /* ... */ }
// hoặc
if (value === undefined || value === null) { /* ... */ }
```
