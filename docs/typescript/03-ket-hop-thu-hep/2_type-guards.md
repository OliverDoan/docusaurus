---
sidebar_position: 2
title: "2. Type Guards và Narrowing"
---

# Type Guards và Narrowing

---

## Mục lục

- [Narrowing là gì?](#narrowing-là-gì)
- [typeof guard](#typeof-guard)
- [instanceof guard](#instanceof-guard)
- [in operator](#in-operator)
- [Equality check](#equality-check)
- [Truthiness check](#truthiness-check)
- [User-defined type predicates](#user-defined-type-predicates)
- [Assertion functions](#assertion-functions)

---

## Narrowing là gì?

**Narrowing** là quá trình TS **thu hẹp** type của một biến dựa vào
điều kiện kiểm tra.

```ts
function format(x: string | number) {
  if (typeof x === "string") {
    // Trong nhánh này, x: string
    return x.toUpperCase();
  }
  // Ngoài nhánh, x: number
  return x.toFixed(2);
}
```

TS tự động theo dõi dòng chảy code (**control flow analysis**) để biết
type tại mỗi điểm.

---

## typeof guard

Dùng cho **primitive**.

```ts
function pad(value: string | number) {
  if (typeof value === "string") {
    return value.padStart(5);
  }
  return value.toString();
}
```

`typeof` chỉ trả về 8 giá trị: `"string"`, `"number"`, `"boolean"`,
`"bigint"`, `"symbol"`, `"undefined"`, `"object"`, `"function"`.

---

## instanceof guard

Dùng cho **class instance**.

```ts
class Dog { bark() {} }
class Cat { meow() {} }

function speak(a: Dog | Cat) {
  if (a instanceof Dog) {
    a.bark();
  } else {
    a.meow();
  }
}
```

:::warning[Cần lưu ý]

`instanceof` **không** hoạt động cho:

- Interface, type alias (chúng bị xoá lúc compile).
- Object literal không gắn với class.
- Class qua iframe/worker (mỗi context có constructor riêng).

→ Với object literal hoặc shape thuần, dùng `in` hoặc type predicate.

:::

---

## in operator

Kiểm tra **sự tồn tại của property**.

```ts
type Admin = { role: "admin"; permissions: string[] };
type User = { role: "user"; email: string };

function check(p: Admin | User) {
  if ("permissions" in p) {
    console.log(p.permissions); // p: Admin
  } else {
    console.log(p.email);       // p: User
  }
}
```

---

## Equality check

So sánh **giá trị literal** cũng narrow được.

```ts
function move(dir: "left" | "right" | "up") {
  if (dir === "left") {
    // dir: "left"
  } else {
    // dir: "right" | "up"
  }
}
```

Đây là cơ chế đằng sau **discriminated union** (xem dưới).

---

## Truthiness check

Kiểm tra giá trị "đúng/sai" trong `if`.

```ts
function greet(name: string | null) {
  if (name) {
    console.log(name.toUpperCase()); // name: string (null bị loại)
  }
}
```

:::warning[Cần lưu ý]

Truthiness check loại bỏ **toàn bộ falsy values**: `0`, `""`, `null`,
`undefined`, `NaN`, `false`. Coi chừng với `number`:

```ts
function setCount(n: number | undefined) {
  if (n) {
    // n: number, NHƯNG đã loại bỏ luôn n === 0
    console.log(n);
  }
}
```

Nếu `0` là giá trị hợp lệ, phải kiểm tra rõ:

```ts
if (n !== undefined) { /* ... */ }
```

:::

---

## User-defined type predicates

Khi `typeof` / `instanceof` không đủ, viết hàm trả về **type predicate**.

```ts
interface Fish { swim(): void }
interface Bird { fly(): void }

function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}

function move(pet: Fish | Bird) {
  if (isFish(pet)) {
    pet.swim();   // pet: Fish
  } else {
    pet.fly();    // pet: Bird
  }
}
```

Cú pháp `pet is Fish` là **type predicate** — báo TS biết hàm này dùng
để narrow.

:::info[Phân tích]

**Discriminated union** là pattern mạnh nhất khi cần type guard nhiều
nhánh. Mỗi nhánh có một field **literal chung** (gọi là "tag" hoặc
"discriminator"):

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; size: number }
  | { kind: "rect"; w: number; h: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.radius ** 2;
    case "square": return s.size ** 2;
    case "rect":   return s.w * s.h;
  }
}
```

TS tự narrow trong từng `case` — không cần predicate. Đây là pattern
ưa thích của hàm xử lý state, action (Redux), AST...

:::

---

## Assertion functions

Hàm dạng `asserts x is T` — nếu chạy qua được, TS coi biến đã có type `T`.

```ts
function assertString(val: unknown): asserts val is string {
  if (typeof val !== "string") {
    throw new Error("Not a string");
  }
}

function upper(x: unknown) {
  assertString(x);
  return x.toUpperCase(); // x: string
}
```

:::info[Phân tích]

Assertion function khác type predicate ở chỗ:

- **Predicate** (`is`): trả về boolean → narrow trong nhánh `if`.
- **Assertion** (`asserts`): không trả về (hoặc throw) → narrow **sau
  khi gọi**.

Hữu dụng cho validation: kết hợp với Zod, io-ts, hoặc custom logic để
đảm bảo dữ liệu đúng kiểu trước khi tiếp tục.

:::
