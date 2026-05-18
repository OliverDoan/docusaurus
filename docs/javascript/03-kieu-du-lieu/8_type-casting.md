---
sidebar_position: 8
title: "8. Type Casting & Coercion"
---

# Type Casting & Type Coercion

---

## Mục lục

- [Phân biệt Casting & Coercion](#phân-biệt-casting--coercion)
- [Explicit Type Casting](#explicit-type-casting)
- [Implicit Type Coercion](#implicit-type-coercion)
- [Quy tắc chuyển sang String](#quy-tắc-chuyển-sang-string)
- [Quy tắc chuyển sang Number](#quy-tắc-chuyển-sang-number)
- [Quy tắc chuyển sang Boolean](#quy-tắc-chuyển-sang-boolean)
- [Object → Primitive](#object--primitive)
- [Best practices](#best-practices)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Phân biệt Casting & Coercion

| | Explicit (Type Casting) | Implicit (Type Coercion) |
|---|------------------------|--------------------------|
| Ai làm? | Lập trình viên | JS engine tự động |
| Dễ đọc? | ✅ Rõ ràng | ❌ Hay gây bug |
| Ví dụ | `Number("123")` | `"5" * 2 → 10` |

```js
// Explicit
Number("42");        // 42 — bạn chủ động chuyển

// Implicit  
"5" - 3;             // 2 — JS tự ép "5" thành 5
"5" + 3;             // "53" — JS tự ép 3 thành "3"
```

## Explicit Type Casting

### → String

```js
String(123);             // "123"
String(true);            // "true"
String(null);            // "null"
String(undefined);       // "undefined"
String([1, 2, 3]);       // "1,2,3"
String({ a: 1 });        // "[object Object]"

(123).toString();        // "123"
(123).toString(2);       // "1111011"  (binary)
(255).toString(16);      // "ff"       (hex)

`${123}`;                // "123"  (template literal)
123 + "";                // "123"  (trick, không khuyến nghị)
```

### → Number

```js
Number("42");            // 42
Number("42.5");          // 42.5
Number("");              // 0   ⚠️
Number(" ");             // 0   ⚠️
Number("abc");           // NaN
Number("42abc");         // NaN
Number(true);            // 1
Number(false);           // 0
Number(null);            // 0   ⚠️
Number(undefined);       // NaN
Number([]);              // 0   ⚠️
Number([42]);            // 42  ⚠️
Number([1, 2]);          // NaN
Number({});              // NaN

parseInt("42px");        // 42  (parse cho đến khi gặp ký tự không phải số)
parseInt("0xff");        // 255 (hex tự động)
parseInt("101", 2);      // 5   (binary)
parseFloat("3.14em");    // 3.14

+"42";                   // 42  (unary plus — trick)
+true;                   // 1
-"42";                   // -42
```

### → Boolean

```js
Boolean(1);              // true
Boolean(0);              // false
Boolean("");             // false
Boolean("anything");     // true
Boolean(null);           // false
Boolean(undefined);      // false
Boolean(NaN);            // false
Boolean([]);             // true  ⚠️ mảng rỗng vẫn truthy
Boolean({});             // true

!!"text";                // true   (trick phổ biến)
!!0;                     // false
```

## Implicit Type Coercion

JS tự động ép kiểu trong các tình huống:

### 1. Toán tử `+` đặc biệt

```js
// Có chuỗi → tất cả thành chuỗi
"5" + 3;          // "53"
3 + "5";          // "35"
"a" + 1 + 2;      // "a12"  (trái sang phải)
1 + 2 + "a";      // "3a"   (1+2=3 trước, sau ép chuỗi)
"" + 123;         // "123"

// Có object → gọi toString/valueOf
[1] + [2];        // "12"   (mảng → chuỗi)
{} + [];          // 0      ⚠️ (trong console; depends on parser)
```

### 2. Các toán tử khác → ép sang Number

```js
"5" - 3;          // 2
"5" * "3";        // 15
"10" / "2";       // 5
"5" % 2;          // 1
"6" ** "2";       // 36

true + 1;         // 2
null + 1;         // 1  (null → 0)
undefined + 1;    // NaN

[] - [];          // 0
[5] - [3];        // 2
```

### 3. So sánh `==` (loose equality)

```js
"5" == 5;         // true
true == 1;        // true
false == 0;       // true
null == undefined; // true
null == 0;        // false ⚠️ (đặc biệt)
"" == 0;          // true
"" == false;      // true
[] == false;      // true
[] == 0;          // true
[1] == 1;         // true

NaN == NaN;       // false (luôn false!)
```

### 4. Trong điều kiện (boolean context)

```js
if ("hello") {}    // truthy → chạy
if (0) {}          // falsy → bỏ qua
while (count) {}   // dừng khi 0

// Logical operators
"a" && "b";        // "b"   (cả hai truthy)
"" || "default";   // "default"
```

## Quy tắc chuyển sang String

| Giá trị | → String |
|---------|----------|
| `123` | `"123"` |
| `true` | `"true"` |
| `false` | `"false"` |
| `null` | `"null"` |
| `undefined` | `"undefined"` |
| `[1, 2]` | `"1,2"` |
| `[]` | `""` |
| `{}` | `"[object Object]"` |
| `{ a: 1 }` | `"[object Object]"` |
| `Symbol("x")` | ❌ TypeError với `+`, OK với `String()` |

## Quy tắc chuyển sang Number

| Giá trị | → Number |
|---------|----------|
| `"123"` | `123` |
| `"123.45"` | `123.45` |
| `"123abc"` | `NaN` |
| `""` | `0` |
| `"  "` | `0` |
| `true` | `1` |
| `false` | `0` |
| `null` | `0` |
| `undefined` | `NaN` |
| `[]` | `0` |
| `[42]` | `42` |
| `[1, 2]` | `NaN` |
| `{}` | `NaN` |

### Cheatsheet so sánh

```js
// "Bộ ba lạ":
Number("");          // 0
Number(null);        // 0
Number(false);       // 0

// "NaN":
Number(undefined);   // NaN
Number({});          // NaN
Number("abc");       // NaN
```

## Quy tắc chuyển sang Boolean

**8 giá trị falsy** — mọi thứ khác đều truthy:

```js
false
0, -0, 0n
"", '', ``
null
undefined
NaN
document.all   // legacy
```

```js
Boolean(0);            // false
Boolean("0");          // true ⚠️
Boolean("");           // false
Boolean(" ");          // true ⚠️
Boolean("false");      // true ⚠️
Boolean([]);           // true ⚠️
Boolean({});           // true ⚠️
Boolean(NaN);          // false
Boolean(new Boolean(false));  // true ⚠️ (object → truthy)
```

## Object → Primitive

Khi cần chuyển object thành primitive, JS gọi:

1. `Symbol.toPrimitive(hint)` (nếu có)
2. `valueOf()` (cho number hint)
3. `toString()`

```js
const obj = {
  valueOf() { return 42; },
  toString() { return "fourty-two"; }
};

+obj;             // 42 (number hint → valueOf)
`${obj}`;         // "fourty-two" (string hint → toString)
obj + "";         // 42 (default → valueOf trước)
obj + "!";        // "42!" (giống trên)
```

### Tuỳ biến với `Symbol.toPrimitive`

```js
const money = {
  amount: 100,
  currency: "USD",
  [Symbol.toPrimitive](hint) {
    if (hint === "number") return this.amount;
    if (hint === "string") return `${this.amount} ${this.currency}`;
    return `${this.amount} ${this.currency}`;
  }
};

+money;         // 100
`${money}`;     // "100 USD"
money + 50;     // 150  (default → number)
```

### Array → String

```js
[].toString();       // ""
[1].toString();      // "1"
[1, 2].toString();   // "1,2"
[1, [2, 3]].toString();  // "1,2,3" (recursive)
```

## Best practices

### 1. Ưu tiên explicit casting

```js
// ❌ Khó đọc
const num = "42" * 1;
const str = 42 + "";

// ✅ Rõ ràng
const num = Number("42");
const str = String(42);
```

### 2. Dùng `===` thay `==`

```js
// ❌
if (value == null) { /* match null & undefined */ }

// ✅ Nếu muốn rõ ràng
if (value === null || value === undefined) { /* ... */ }
// hoặc
if (value == null) { /* OK — pattern phổ biến cho null/undefined */ }
```

### 3. Validate input trước khi dùng

```js
function calculatePrice(quantity) {
  const n = Number(quantity);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error("Invalid quantity");
  }
  return n * 100;
}
```

### 4. Dùng `Number.isFinite` thay `isFinite`

```js
isFinite("42");          // true ⚠️ (ép kiểu)
Number.isFinite("42");   // false ✅ (không ép kiểu)

isNaN("abc");            // true ⚠️ (ép kiểu trước)
Number.isNaN("abc");     // false ✅
```

---

## Câu hỏi phỏng vấn

### Câu 1: Đoán kết quả

```js
console.log([] + []);
console.log([] + {});
console.log({} + []);
console.log(1 + "2" + 3);
console.log(1 + +"2" + 3);
```

**Đáp án:**

```
""                  (mảng rỗng → "", "" + "" = "")
"[object Object]"   ([] → "", {} → "[object Object]")
"[object Object]"   (tùy parser, đôi khi 0 trong REPL)
"123"               (1 + "2" = "12", "12" + 3 = "123")
6                   (+"2" = 2, 1+2+3 = 6)
```

### Câu 2: Vì sao `"5" + 3` ≠ `"5" - 3`?

**Đáp án:**

Toán tử `+` là **đặc biệt**: nếu có **bất kỳ toán hạng nào là chuỗi**, JS sẽ **nối chuỗi** thay vì cộng số:

```js
"5" + 3;   // "53"  (string concat)
"5" - 3;   // 2     (toán tử khác → ép sang number)
"5" * 3;   // 15
"5" / 3;   // 1.666...
```

### Câu 3: `null == 0` trả về gì?

**Đáp án:** `false`.

Đây là **đặc biệt**: dù `Number(null) === 0`, nhưng `null` và `0` **không bằng nhau với `==`**.

Lý do: spec ECMAScript định nghĩa `null` chỉ bằng `undefined` và chính nó:

```js
null == undefined;   // true
null == null;        // true
null == 0;           // false ⚠️
null < 1;            // true  (lúc này null → 0)
null <= 0;           // true
```

So sánh quan hệ (`<`, `>`, `<=`, `>=`) ép `null` thành số, nhưng `==` thì không.

### Câu 4: `parseInt` vs `Number` khác nhau thế nào?

**Đáp án:**

```js
Number("42px");    // NaN
parseInt("42px");  // 42  (parse đến khi gặp ký tự không phải số)

Number("");        // 0
parseInt("");      // NaN

Number("0x1F");    // 31  (hex)
parseInt("0x1F");  // 31  (hex)

Number("1e2");     // 100 (scientific)
parseInt("1e2");   // 1   ⚠️ (dừng ở "e")

Number(null);      // 0
parseInt(null);    // NaN
```

- `Number`: chuyển toàn bộ, fail → `NaN`
- `parseInt`: parse từ đầu cho đến khi gặp ký tự không hợp lệ
