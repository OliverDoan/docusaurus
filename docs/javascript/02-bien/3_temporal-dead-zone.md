---
sidebar_position: 3
title: "3. Temporal Dead Zone (TDZ)"
---

# Temporal Dead Zone (TDZ)

---

## Mục lục

- [TDZ là gì?](#tdz-là-gì)
- [TDZ áp dụng cho ai?](#tdz-áp-dụng-cho-ai)
- [Tại sao có TDZ?](#tại-sao-có-tdz)
- [Các ví dụ TDZ thường gặp](#các-ví-dụ-tdz-thường-gặp)
- [TDZ với function parameters](#tdz-với-function-parameters)
- [TDZ vs Hoisting](#tdz-vs-hoisting)
- [Tránh lỗi TDZ](#tránh-lỗi-tdz)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## TDZ là gì?

**Temporal Dead Zone (TDZ)** — tạm dịch: **"vùng chết tạm thời"** — là khoảng thời gian từ khi biến `let`/`const`/`class` được **hoisted** đến khi gặp dòng **khai báo thực sự** trong code.

Trong khoảng này, biến **tồn tại nhưng không thể truy cập** — mọi nỗ lực đọc/ghi đều ném `ReferenceError`.

> **Ví dụ thực tế:** Hãy tưởng tượng bạn đặt phòng khách sạn. Phòng đã được dành cho bạn (biến tồn tại), nhưng phải đến giờ check-in mới được vào (sau dòng khai báo). Cố vào trước → bị từ chối (ReferenceError).

```js
// === Bắt đầu TDZ của x ===
console.log(typeof x);  // ReferenceError
x = 10;                  // ReferenceError
// === Kết thúc TDZ ===
let x = 5;
console.log(x);          // ✅ 5
```

## TDZ áp dụng cho ai?

| Khai báo | Có TDZ? |
|----------|---------|
| `var` | ❌ Không (hoisted với `undefined`) |
| `let` | ✅ Có |
| `const` | ✅ Có |
| `class` | ✅ Có |
| `function` declaration | ❌ Không (hoisted cả body) |
| Function expression (`const f = ...`) | ✅ Có (do dùng `const`) |
| Tham số default | ✅ Có (giữa các tham số) |

### Ví dụ với class

```js
const a = new Animal();  // ❌ ReferenceError
class Animal {}
```

### Ví dụ với function expression

```js
foo();  // ❌ ReferenceError
const foo = () => console.log("hi");
```

## Tại sao có TDZ?

TDZ ra đời cùng `let`/`const` (ES6) để **khắc phục các bug khó tìm** của `var`:

### Bug của `var`

```js
function legacy() {
  console.log(count);  // undefined (lẽ ra phải lỗi rõ ràng!)
  // ... 200 dòng code ...
  var count = 0;
}
```

Với `var`, bạn vô tình dùng biến trước khi khai báo → trả về `undefined` → bug âm thầm. Có thể không phát hiện trong nhiều tháng.

### Cải tiến với `let`

```js
function modern() {
  console.log(count);  // ❌ ReferenceError ngay lập tức
  let count = 0;
}
```

Lỗi **ném ngay lập tức**, không có giá trị "ma" `undefined` để gây nhầm lẫn.

## Các ví dụ TDZ thường gặp

### 1. Dùng biến trong block trước khai báo

```js
{
  // TDZ bắt đầu
  console.log(x);  // ❌ ReferenceError
  let x = 10;
  // TDZ kết thúc
  console.log(x);  // ✅ 10
}
```

### 2. typeof trên biến trong TDZ

```js
// Với var: typeof an toàn
console.log(typeof undeclared);  // "undefined" (an toàn)

// Với let trong TDZ: typeof cũng ném lỗi!
console.log(typeof x);  // ❌ ReferenceError
let x = 10;
```

> **Lưu ý:** Đây là sự khác biệt quan trọng — `typeof` không còn "safe" với `let/const`.

### 3. Hoisted nhưng vẫn TDZ trong cùng scope

```js
let x = "outer";

function test() {
  console.log(x);  // ❌ ReferenceError (KHÔNG phải "outer")
  let x = "inner";  // x cục bộ được hoisted vào đầu function → shadow x ngoài
}

test();
```

Đây là pitfall lớn: nhiều người nghĩ sẽ in ra `"outer"`, nhưng vì `let x` cục bộ được hoisted vào đầu hàm, **shadow** biến ngoài → tạo TDZ.

### 4. const phải khởi tạo ngay

```js
const x;  // ❌ SyntaxError: Missing initializer in const declaration
```

### 5. Truy cập trong dòng khai báo (initializer)

```js
let a = a + 1;  // ❌ ReferenceError — `a` bên phải vẫn trong TDZ
```

## TDZ với function parameters

Default parameter cũng có TDZ — bạn không thể tham chiếu **tham số sau** trong tham số trước:

```js
// ❌ Lỗi: b chưa được khởi tạo khi a tham chiếu
function test(a = b, b = 1) {
  return [a, b];
}
test();  // ❌ ReferenceError

// ✅ Đúng: a được khởi tạo trước, b dùng a
function test2(a = 1, b = a) {
  return [a, b];
}
test2();  // [1, 1]
```

## TDZ vs Hoisting

| Đặc điểm | `var` (hoisting cũ) | `let`/`const` (TDZ) |
|----------|---------------------|---------------------|
| Hoisted? | ✅ Có | ✅ Có |
| Giá trị khi hoisted | `undefined` | Không có (TDZ) |
| Truy cập trước khai báo | Trả `undefined` | ❌ ReferenceError |
| `typeof` trước khai báo | `"undefined"` | ❌ ReferenceError |
| Scope | Function | Block |

### Minh hoạ trực quan

```js
function example() {
  // === Hoisting phase ===
  // var x;           ← hoisted, value = undefined
  // let y;           ← hoisted, TDZ
  // const z;         ← hoisted, TDZ

  // === Execution phase ===
  console.log(x);   // undefined
  console.log(y);   // ❌ ReferenceError — TDZ
  console.log(z);   // ❌ ReferenceError — TDZ

  var x = 1;        // x = 1
  let y = 2;        // y ra khỏi TDZ
  const z = 3;      // z ra khỏi TDZ

  console.log(x, y, z);  // 1, 2, 3
}
```

## Tránh lỗi TDZ

### 1. Khai báo trước khi dùng

```js
// ❌
{
  console.log(x);
  let x = 10;
}

// ✅
{
  let x = 10;
  console.log(x);
}
```

### 2. Khai báo ở đầu scope

```js
// ✅ Best practice: khai báo tất cả biến ở đầu function/block
function process(data) {
  const result = [];          // khai báo đầu
  const errors = [];          // khai báo đầu
  let count = 0;              // khai báo đầu

  for (const item of data) {
    // ... logic
  }

  return { result, errors, count };
}
```

### 3. Bật ESLint rule

```json
// .eslintrc.json
{
  "rules": {
    "no-use-before-define": ["error", { "functions": false, "classes": true }],
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### 4. Tránh shadow biến

```js
// ❌ Dễ gây TDZ khó hiểu
let value = "outer";
function process() {
  console.log(value);  // TDZ vì shadow
  let value = "inner";
}

// ✅ Đặt tên rõ ràng
let outerValue = "outer";
function process() {
  console.log(outerValue);  // "outer" — không TDZ
  let innerValue = "inner";
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: TDZ khác hoisting như thế nào?

**Đáp án:**

- **Hoisting** là cơ chế tổng quát: tất cả khai báo (var, let, const, function, class) đều được **đăng ký vào memory** ở đầu scope trước khi thực thi.
- **TDZ** chỉ áp dụng cho `let`, `const`, `class` — chúng được hoisted **nhưng không có giá trị**, không cho phép truy cập cho đến khi gặp dòng khai báo.

Nói cách khác: `let/const` **vẫn được hoisted** nhưng có thêm cơ chế TDZ để chặn truy cập sớm.

### Câu 2: Đoán kết quả

```js
let x = "hello";

function test() {
  console.log(x);
  let x = "world";
}

test();
```

**Đáp án:** `ReferenceError: Cannot access 'x' before initialization`.

Mặc dù có `let x = "hello"` ở scope ngoài, biến `x` cục bộ trong `test()` **shadow** biến ngoài. `console.log(x)` đang truy cập `x` cục bộ trong TDZ → lỗi.

### Câu 3: Vì sao `typeof` với `let` lại ném lỗi?

**Đáp án:**

Trước ES6, `typeof undeclared` an toàn vì JS engine xem `undeclared` là chưa tồn tại → trả `"undefined"`.

Với `let/const`, biến **đã tồn tại** trong scope (do hoisting) nhưng đang trong TDZ. JS thiết kế `typeof` cũng phải tuân theo TDZ — đảm bảo lỗi rõ ràng thay vì trả giá trị giả "undefined".

```js
console.log(typeof a);   // "undefined" (chưa khai báo)
console.log(typeof b);   // ❌ ReferenceError
let b = 10;
```

### Câu 4: Có thể dùng TDZ làm tính năng có lợi không?

**Đáp án:**

Có. TDZ giúp:

1. **Phát hiện sớm bug** — dùng biến trước khi khai báo → lỗi ngay
2. **Bắt buộc khai báo có thứ tự** — code dễ đọc hơn
3. **Loại bỏ "magic" của var** — không còn `undefined` âm thầm
4. **An toàn cho refactor** — khi đổi tên biến, lỗi sẽ rõ ràng

Đây là lý do **hầu hết coding style guide hiện đại cấm `var`**, ưu tiên `let`/`const`.
