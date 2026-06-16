---
sidebar_position: 1
title: "1. Combining Types"
---

# Combining Types

**Combining types** (kết hợp kiểu) là cách ghép nhiều kiểu lại với nhau để mô tả dữ liệu linh hoạt hơn. Hai cách phổ biến là **union type** (kiểu hợp — giá trị có thể là một trong nhiều kiểu) và **intersection type** (kiểu giao — giá trị phải thỏa mãn đồng thời nhiều kiểu). Nhờ vậy bạn có thể diễn đạt chính xác những trường hợp mà một kiểu đơn lẻ không đủ.

---

## Mục lục

- [Vì sao có union, intersection & literal types?](#vì-sao-có-union-intersection--literal-types)
- [Union Types](#union-types)
- [Intersection Types](#intersection-types)
- [Type Aliases](#type-aliases)
- [keyof Operator](#keyof-operator)

---

## Vì sao có union, intersection & literal types?

**Vấn đề:** dữ liệu thực tế thường "đa dạng": một `id` có thể là `string` HOẶC `number`, một biến trạng thái chỉ nhận vài giá trị cố định. Nếu ép một kiểu cứng thì không mô tả nổi, mà dùng `any` thì mất hết an toàn kiểu.

```ts
function fetchUser(id: any) {       // any — TS không kiểm tra gì
  // ...
}
fetchUser(1);
fetchUser("abc");
fetchUser(true);                    // lọt — không ai chặn

let status = "loading";             // chỉ là string chung chung
status = "succes";                  // sai chính tả nhưng vẫn hợp lệ
```

**Giải pháp:** dùng **union** `A | B` (một trong nhiều kiểu), **literal types** (chỉ nhận đúng vài giá trị cụ thể) và **intersection** `A & B` (gộp nhiều kiểu thành một) để mô hình hoá dữ liệu chính xác.

```ts
function fetchUser(id: string | number) {   // union: chỉ string hoặc number
  // ...
}
fetchUser(1);
fetchUser("abc");
// fetchUser(true);                          // Error — bị chặn ngay

type Status = "loading" | "success" | "error"; // literal union
let status: Status = "loading";
// status = "succes";                        // Error — sai chính tả bị bắt

type WithId = { id: string | number };
type WithTimestamps = { createdAt: Date };
type Entity = WithId & WithTimestamps;       // intersection: gộp cả hai
const e: Entity = { id: 1, createdAt: new Date() };
```

:::tip[Dùng thực tế]

- **ID linh hoạt:** `id: string | number` cho key vừa là UUID chuỗi vừa là số tự tăng.
- **Trạng thái request:** `"idle" | "loading" | "success" | "error"` — chặn mọi giá trị sai chính tả ngay khi gõ.
- **Gộp props:** `BaseProps & { onClose: () => void }` để mở rộng component mà không lặp lại field.
- **Hàm nhận nhiều dạng input:** tham số `string | string[]` để vừa nhận một giá trị vừa nhận danh sách.

:::

---

## Union Types

Ký hiệu `|` — biến có thể là **một trong nhiều kiểu**.

```ts
let id: number | string;
id = 1;       // OK
id = "abc";   // OK
id = true;    // Error
```

Trong tham số hàm:

```ts
function print(value: number | string) {
  console.log(value);
}
```

:::info[Phân tích]

Union là **disjunction (OR)** trong type theory. Khi truy cập thuộc tính
của union, TS chỉ cho phép các thuộc tính **chung của mọi nhánh**:

```ts
type Animal = { name: string; legs: number };
type Fish = { name: string; fins: number };

function describe(x: Animal | Fish) {
  console.log(x.name);  // OK — cả hai đều có name
  console.log(x.legs);  // Error — Fish không có legs
}
```

→ Phải dùng **type guard** để narrow xuống một nhánh trước khi truy cập
thuộc tính riêng.

:::

---

## Intersection Types

Ký hiệu `&` — kết hợp **mọi thuộc tính** từ nhiều type.

```ts
type Named = { name: string };
type Aged = { age: number };

type Person = Named & Aged;

const p: Person = { name: "An", age: 25 };
```

Khác Union: Intersection là **conjunction (AND)** — phải có **đủ** các
thuộc tính.

---

## Type Aliases

`type` đặt **bí danh** cho bất kỳ type nào.

```ts
type ID = number | string;
type User = { id: ID; name: string };
type Callback = (data: User) => void;
```

Khác `interface`:

| | `type` | `interface` |
|--|--|--|
| Cho object | OK | OK |
| Cho union/primitive | **OK** | Không |
| Cho tuple/function | **OK** | Khó |
| Mở rộng | `&` (intersection) | `extends` |
| Khai báo nhiều lần (merge) | Không | **Có** |

:::tip[Mẹo]

**Khi nào dùng `type` vs `interface`?**

- `interface`: shape của object có thể bị extend/implement, đặc biệt
  cho **public API thư viện** (cho phép consumer "vá" thêm field).
- `type`: union, intersection, tuple, mapped, conditional — mọi thứ
  không phải shape thuần.

Trong code app, dùng cái nào cũng được — chọn một và **nhất quán** trong
codebase.

:::

---

## keyof Operator

`keyof T` trả về **union các key** của type `T`.

```ts
type User = { id: number; name: string; email: string };

type UserKey = keyof User; // "id" | "name" | "email"
```

Ứng dụng phổ biến — hàm truy cập property an toàn:

```ts
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { id: 1, name: "An" };
const id = getProp(user, "id");      // type: number
const x = getProp(user, "email");    // Error: "email" không phải key
```

:::info[Phân tích]

`keyof` kết hợp với **indexed access type** (`T[K]`) là nền tảng của
TypeScript metaprogramming:

```ts
type Values<T> = T[keyof T]; // Union các value type của T

type Color = { red: 1; green: 2; blue: 3 };
type ColorValue = Values<Color>; // 1 | 2 | 3
```

Khi áp dụng `keyof` lên type có **index signature**, kết quả là
`string | number` thay vì literal cụ thể:

```ts
type Dict = { [key: string]: number };
type K = keyof Dict; // string | number (không phải string!)
```

`number` xuất hiện vì JS tự convert key số thành chuỗi khi truy cập object.

:::
