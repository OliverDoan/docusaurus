---
sidebar_position: 1
title: "1. Typing Functions"
---

# Typing Functions

---

## Mục lục

- [Tham số và return type](#tham-số-và-return-type)
- [Optional và default parameter](#optional-và-default-parameter)
- [Rest parameter](#rest-parameter)
- [Function type expression](#function-type-expression)
- [Function Overloading](#function-overloading)

---

## Tham số và return type

```ts
function add(a: number, b: number): number {
  return a + b;
}
```

Return type thường được **infer tự động**, không bắt buộc khai báo trong
hàm cục bộ. Với hàm export, nên khai báo rõ để làm contract.

Arrow function:

```ts
const multiply = (a: number, b: number): number => a * b;
```

---

## Optional và default parameter

Tham số có `?` là **optional** — có thể không truyền.

```ts
function greet(name: string, title?: string) {
  return title ? `${title} ${name}` : name;
}

greet("An");           // OK
greet("An", "Mr.");    // OK
```

Default value (TS infer luôn type):

```ts
function greet(name: string, title = "Mr.") {
  return `${title} ${name}`;
}
```

:::warning[Cần lưu ý]

**Optional (`?`)** khác **`| undefined`**:

```ts
function a(x?: string) {}
function b(x: string | undefined) {}

a();           // OK
b();           // Error — phải truyền argument
b(undefined);  // OK
```

`?` cho phép **không truyền**; `| undefined` bắt buộc truyền nhưng có
thể là `undefined`. Trong public API, dùng `?` để cho phép caller bỏ qua.

:::

---

## Rest parameter

Gộp nhiều argument vào một mảng.

```ts
function sum(...nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}

sum(1, 2, 3, 4); // 10
```

Có thể dùng tuple để giới hạn vị trí:

```ts
function log(level: "info" | "error", ...messages: string[]) {
  console.log(`[${level}]`, ...messages);
}
```

---

## Function type expression

Khai báo **type của một hàm** để tái sử dụng.

```ts
type BinaryOp = (a: number, b: number) => number;

const add: BinaryOp = (a, b) => a + b;
const sub: BinaryOp = (a, b) => a - b;
```

Tương đương dùng `interface`:

```ts
interface BinaryOp {
  (a: number, b: number): number;
}
```

---

## Function Overloading

Một hàm có nhiều **signature** khác nhau, thân implementation chỉ một.

```ts
function parse(input: string): string[];
function parse(input: number): number[];
function parse(input: string | number): string[] | number[] {
  if (typeof input === "string") {
    return input.split(",");
  }
  return [input];
}

const a = parse("a,b,c"); // type: string[]
const b = parse(42);      // type: number[]
```

:::info[Phân tích]

Overload trong TS **chỉ tồn tại ở compile-time** — runtime vẫn là một
hàm JS duy nhất. Quy tắc viết overload:

1. Liệt kê signature **cụ thể nhất trước**, **tổng quát nhất sau**.
2. Signature implementation (cuối cùng) **không hiển thị** với caller —
   nó chỉ là chỗ chứa logic.
3. Implementation phải **tương thích** với mọi overload signature.

Nhiều trường hợp **generic** hoặc **union return type** thay thế được
overload và dễ đọc hơn:

```ts
// Generic — dễ đọc hơn overload
function parse<T extends string | number>(
  input: T
): T extends string ? string[] : number[] {
  // ...
  return null as any;
}
```

Chỉ dùng overload khi **return type khác hẳn nhau** và không biểu diễn
được bằng generic.

:::

:::tip[Mẹo]

**Call signature** trong interface dùng để mô tả hàm có thêm property
(callable object) — pattern hay gặp khi typing thư viện cũ:

```ts
interface Counter {
  (): number;        // gọi như hàm
  count: number;     // có property
  reset(): void;     // có method
}
```

:::
