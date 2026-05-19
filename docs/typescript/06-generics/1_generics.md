---
sidebar_position: 1
title: "1. Generics"
---

# Generics

---

## Mục lục

- [Generic là gì?](#generic-là-gì)
- [Generic function](#generic-function)
- [Generic interface và type](#generic-interface-và-type)
- [Generic class](#generic-class)
- [Generic Constraints](#generic-constraints)
- [Default type parameter](#default-type-parameter)

---

## Generic là gì?

Generic là **biến của type** — cho phép viết một đoạn code làm việc với
**nhiều kiểu**, mà vẫn giữ type-safe.

Vấn đề khi không có generic:

```ts
function identityNum(x: number): number { return x; }
function identityStr(x: string): string { return x; }
function identityBool(x: boolean): boolean { return x; }
// ... lặp lại mãi
```

Giải pháp — generic:

```ts
function identity<T>(x: T): T {
  return x;
}

identity<number>(42);   // T = number
identity("hello");      // T = "hello" (TS infer)
```

---

## Generic function

`<T>` đặt sau tên hàm — TS sẽ infer hoặc bạn truyền tường minh.

```ts
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const a = first([1, 2, 3]);       // T = number → number | undefined
const b = first(["a", "b"]);      // T = string → string | undefined
```

Nhiều type parameter:

```ts
function pair<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}

pair(1, "x"); // [number, string]
```

---

## Generic interface và type

```ts
interface ApiResponse<T> {
  data: T;
  error: string | null;
}

const userResp: ApiResponse<User> = {
  data: { id: 1, name: "An" },
  error: null,
};
```

```ts
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

---

## Generic class

```ts
class Stack<T> {
  private items: T[] = [];

  push(item: T) { this.items.push(item); }
  pop(): T | undefined { return this.items.pop(); }
  peek(): T | undefined { return this.items[this.items.length - 1]; }
}

const s = new Stack<number>();
s.push(1);
const top = s.peek(); // type: number | undefined
```

---

## Generic Constraints

Dùng `extends` để **giới hạn** type parameter.

```ts
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

longest("hello", "world");        // OK — string có length
longest([1, 2, 3], [4]);          // OK — array có length
longest(10, 20);                  // Error — number không có length
```

Constraint với `keyof`:

```ts
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { id: 1, name: "An" };
getProp(user, "id");      // type: number
getProp(user, "email");   // Error — không phải key
```

:::info[Phân tích]

Constraint **không làm hẹp** type bạn nhận — nó chỉ là điều kiện đầu vào.
Type parameter `T` vẫn là chính nó, không bị "thu hẹp" về constraint:

```ts
function getName<T extends { name: string }>(x: T) {
  return x.name; // OK
  // Nhưng nếu x có thêm field khác, vẫn giữ trong T
}

const u = getName({ name: "An", age: 25 });
// TS biết kết quả vẫn là từ object có name + age
```

Đây là khác biệt quan trọng so với việc khai báo trực tiếp:

```ts
function getName2(x: { name: string }) {
  // x bị "thu hẹp" — TS quên các field khác
}
```

→ Khi viết util hàm cần **giữ nguyên type đầu vào**, luôn dùng generic
+ constraint thay vì khai báo type cụ thể.

:::

---

## Default type parameter

Có thể đặt **giá trị mặc định** cho type parameter:

```ts
interface Container<T = string> {
  value: T;
}

const a: Container = { value: "hello" };        // T = string (mặc định)
const b: Container<number> = { value: 42 };     // T = number
```

Hữu dụng khi viết library — caller chỉ cần override khi muốn khác:

```ts
type Event<TPayload = unknown> = {
  type: string;
  payload: TPayload;
};
```

:::tip[Mẹo]

**Quy ước đặt tên** type parameter:

- `T` — type chung (default).
- `K` — key (dùng với `keyof`).
- `V` — value.
- `E` — element (mảng).
- `P` — property.
- `R` — return type.

Hoặc tên đầy đủ khi nhiều parameter: `<TUser, TOrder, TPayment>` — giúp
đọc dễ hơn `<T, U, V>` khi generic phức tạp.

:::

:::warning[Cần lưu ý]

**Inference fail** thường gặp với generic — khi TS không có đủ thông tin
để suy ra `T`, nó sẽ widen lên `unknown`:

```ts
function wrap<T>(value: T): { value: T } {
  return { value };
}

const a = wrap("hi");       // T = string ✓
const b = wrap(null);       // T = null (literal, ít hữu dụng)
```

Khi cần fallback rõ ràng, truyền tường minh hoặc dùng default:

```ts
wrap<string | null>(null); // T = string | null
```

:::
