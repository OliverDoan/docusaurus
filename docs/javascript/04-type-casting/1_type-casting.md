---
sidebar_position: 1
title: "1. Type Casting"
---

# Type Casting

**Type Casting** (ép kiểu — chuyển đổi kiểu dữ liệu) là việc **chuyển một giá trị từ kiểu dữ liệu này sang kiểu khác**, ví dụ từ chuỗi `"42"` (string) sang số `42` (number), hoặc từ số sang chuỗi.

Vì sao cần? Vì dữ liệu thường đến ở dạng không mong muốn — ví dụ ô nhập liệu trên web luôn trả về **chuỗi**, nên muốn tính toán bạn phải đổi nó sang **số** trước.

```js
"42" + 1            // "421"  -> bị nối chuỗi vì "42" là string
Number("42") + 1    // 43     -> đã ép sang số nên cộng đúng
```

Trong JavaScript, việc ép kiểu xảy ra theo **hai cách**: do bạn chủ động làm, hoặc do JavaScript **tự động** làm ngầm — đó chính là nội dung phần dưới đây.

---

## Mục lục

- [Vì sao cần hiểu ép kiểu (type coercion)?](#vì-sao-cần-hiểu-ép-kiểu-type-coercion)
- [Conversion vs Coercion](#conversion-vs-coercion)
- [Explicit casting](#explicit-casting)
- [Implicit coercion](#implicit-coercion)
- [Quy tắc của ==](#quy-tắc-của-)
- [Mẹo tránh bug](#mẹo-tránh-bug)

---

## Vì sao cần hiểu ép kiểu (type coercion)?

**Vấn đề:**

JavaScript **tự động ép kiểu** (implicit coercion) trong rất nhiều phép toán. Nếu không nắm quy tắc, bạn nhận về kết quả bất ngờ và những bug rất khó truy vết — nhất là khi dữ liệu từ input/form/API hầu hết đều là **string**.

```js
"5" + 3;   // "53" — nối chuỗi, KHÔNG phải 8
"5" - 3;   // 2    — cùng dữ liệu nhưng lại ra số
[] + {};   // "[object Object]" — khó đoán
1 == "1";  // true — khác kiểu vẫn bằng nhau
```

**Giải pháp:**

Hiểu quy tắc coercion và chủ động **ép kiểu tường minh** (explicit), dùng `===` thay cho `==` để JavaScript không phải "đoán" giúp bạn.

```js
Number("5") + 3;          // 8    — ép sang số trước khi cộng
String(42) + " điểm";     // "42 điểm"
Boolean(0);               // false — kiểm soát truthy/falsy
parseInt("42px", 10);     // 42   — đọc số từ chuỗi có hậu tố

1 === "1";                // false — so sánh đúng kiểu, an toàn
```

:::tip[Dùng thực tế]

- **Tính toán từ form**: ô input trả về string, ép `Number()` trước khi cộng/nhân để tránh nối chuỗi nhầm.
- **Kiểm tra giá trị falsy**: phân biệt `0`, `""`, `null`, `undefined` khi validate dữ liệu rỗng.
- **Hiển thị ra UI**: ép số sang chuỗi bằng `String()` hoặc `.toString()` khi ghép nội dung hiển thị.
- **So sánh dữ liệu API**: dùng `===` và ép kiểu rõ ràng để tránh bug khi backend trả `"1"` thay vì `1`.

:::

---

## Conversion vs Coercion

| | Type Conversion | Type Coercion |
|--|----------------|---------------|
| Cách gọi | Explicit (tường minh) | Implicit (ngầm) |
| Ai làm | Lập trình viên | JavaScript engine |
| Ví dụ | `Number("42")` | `"42" * 1` |

Cả hai đều chuyển kiểu, nhưng **conversion là chủ ý**, **coercion là tự động**.

---

## Explicit casting

**Convert sang Number:**

```js
Number("42");      // 42
Number("42px");    // NaN
Number("");        // 0
Number(true);      // 1
Number(false);     // 0
Number(null);      // 0
Number(undefined); // NaN
Number([1]);       // 1
Number([1, 2]);    // NaN
Number({});        // NaN

parseInt("42px");  // 42 — chấp nhận trailing
parseFloat("3.14abc"); // 3.14
```

**Convert sang String:**

```js
String(42);        // "42"
String(true);      // "true"
String(null);      // "null"
String(undefined); // "undefined"
String([1, 2]);    // "1,2"
String({});        // "[object Object]"

(42).toString();   // "42"
(42).toString(2);  // "101010" — binary
(42).toString(16); // "2a" — hex
```

**Convert sang Boolean:**

```js
Boolean(0);     // false
Boolean("");    // false
Boolean(null);  // false
Boolean(NaN);   // false
Boolean({});    // true (mọi object đều truthy)
Boolean([]);    // true (kể cả array rỗng)

!!"hello";      // true (idiom)
```

:::info[Phân tích]

**8 falsy values** trong JavaScript:

1. `false`
2. `0`
3. `-0`
4. `0n` (BigInt zero)
5. `""` (string rỗng)
6. `null`
7. `undefined`
8. `NaN`

Mọi giá trị khác đều **truthy** — bao gồm:

- `"0"` (string chứa số 0)
- `"false"` (string)
- `[]` (array rỗng)
- `{}` (object rỗng)
- `function() {}`

Đây là nguồn gốc nhiều bug — đặc biệt với `[]` và `{}`:

```js
if ([] == false) { /* true! */ }
if ([]) { /* cũng true! */ }
```

Nhớ thuộc lòng 8 falsy values là kiến thức nền tảng để đoán đúng coercion.

:::

---

## Implicit coercion

JS tự động convert khi cần:

```js
"5" + 3;      // "53" — string concat
"5" - 3;      // 2 — số học, "5" → 5
"5" * "2";    // 10
"abc" - 1;    // NaN

1 + null;     // 1 (null → 0)
1 + undefined; // NaN

[] + [];      // "" — cả hai thành ""
[] + {};      // "[object Object]"
{} + [];      // 0 (trong console — {} bị parse là block)

true + 1;     // 2
false + 1;    // 1
```

:::warning[Cần lưu ý]

**Toán tử `+`** có quy tắc đặc biệt:

- Nếu **một bên là string** → concat.
- Ngược lại → cộng số.

```js
1 + 2;       // 3
1 + "2";     // "12"
"1" + 2;     // "12"
1 + 2 + "3"; // "33" — trái sang phải: (1+2) + "3"
"1" + 2 + 3; // "123" — đã thành string từ đầu
```

Các toán tử khác (`-`, `*`, `/`, `%`, `**`) **luôn cố convert sang number**.

:::

---

## Quy tắc của ==

`==` (loose equality) áp dụng **coercion** khi hai vế khác kiểu:

```js
1 == "1";        // true
0 == false;      // true
0 == "";         // true
null == undefined; // true
null == 0;       // false (!)
"" == 0;         // true (!)
[] == false;     // true
[1] == 1;        // true
```

Quy tắc cơ bản (đơn giản hoá):

1. Hai vế cùng kiểu → so sánh trực tiếp (= `===`).
2. `null == undefined` → `true`.
3. Number + String → String chuyển thành Number.
4. Boolean → chuyển thành Number trước.
5. Object → gọi `valueOf()` rồi `toString()`.

:::info[Phân tích]

**Tại sao `null == 0` lại `false` mà `null == undefined` lại `true`?**

Spec ES định nghĩa `null == undefined` là **trường hợp đặc biệt** —
được hard-code trả về `true`, không qua coercion. Với mọi cặp khác,
`null` **không** coerce sang number, nên `null == 0` so sánh khác kiểu
→ `false`.

Quy tắc thực tế: **luôn dùng `===`** trong code mới. ESLint rule `eqeqeq`
sẽ bắt buộc điều này. Chỉ giữ `==` trong một trường hợp đặc biệt:

```js
// Kiểm tra "null hoặc undefined" trong một dòng
if (value == null) { /* ... */ }
// Tương đương: value === null || value === undefined
```

:::

---

## Mẹo tránh bug

**1. Luôn `===` thay vì `==`**:

```js
// Tệ
if (count == "0") {}

// Tốt
if (count === 0) {}
```

**2. Convert tường minh trước khi so sánh**:

```js
const input = "42";
if (Number(input) > 10) {}  // rõ ràng
```

**3. Validate đầu vào tại boundary**:

```js
function setAge(age) {
  if (typeof age !== "number" || Number.isNaN(age)) {
    throw new TypeError("age must be a number");
  }
  // ...
}
```

**4. Cẩn thận với toán tử `+`**:

```js
const total = items.reduce((sum, item) => sum + item.price, 0);
// Nếu item.price là string "10" → bug nghiêm trọng
```

:::tip[Mẹo]

Khi viết TypeScript, coercion implicit gần như biến mất — TS bắt mọi
trường hợp khác kiểu tại compile time. Đây là một trong những lý do
project lớn nên migrate sang TS.

Nhưng vẫn cần hiểu coercion vì:
- Code review JS thuần.
- Đọc thư viện cũ.
- Debug khi data từ API về có kiểu sai.
- Phỏng vấn — chủ đề "value comparison" rất phổ biến.

:::
