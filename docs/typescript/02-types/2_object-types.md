---
sidebar_position: 2
title: "2. Object Types"
---

# Object Types

---

## Mục lục

- [Interface](#interface)
- [Class](#class)
- [Enum](#enum)
- [Array](#array)
- [Tuple](#tuple)

---

## Interface

`interface` mô tả **hình dạng (shape)** của một object.

```ts
interface User {
  id: number;
  name: string;
  isActive: boolean;
}

const user: User = {
  id: 1,
  name: "An",
  isActive: true,
};
```

Property tùy chọn (`?`) và read-only (`readonly`):

```ts
interface Product {
  readonly id: number;
  name: string;
  description?: string;
}
```

:::info[Phân tích]

TypeScript dùng **structural typing** — hai object có cùng shape thì
tương thích, không cần `implements` interface tường minh:

```ts
interface Point { x: number; y: number; }
function distance(p: Point): number { return Math.hypot(p.x, p.y); }

distance({ x: 1, y: 2 }); // OK, không cần khai báo type
```

Đây là khác biệt lớn so với Java/C# (nominal typing).

:::

---

## Class

`class` định nghĩa cả **kiểu** lẫn **giá trị** (cấu trúc dữ liệu + logic).

```ts
class User {
  constructor(
    public id: number,
    public name: string,
  ) {}

  greet(): string {
    return `Hello ${this.name}`;
  }
}

const u = new User(1, "An");
```

Class vừa dùng làm type, vừa dùng làm constructor:

```ts
function printUser(user: User) {
  console.log(user.name);
}
```

---

## Enum

Enum là tập hằng số được đặt tên.

```ts
enum Status {
  Active,    // 0
  Inactive,  // 1
  Pending,   // 2
}

let s: Status = Status.Active;
```

Enum dạng string (rõ nghĩa hơn):

```ts
enum Role {
  Admin = "ADMIN",
  User = "USER",
}
```

:::warning[Cần lưu ý]

**Numeric enum** có behavior gọi là **reverse mapping** — vừa tra theo
key, vừa tra theo value:

```ts
enum Status { Active, Inactive }
Status.Active     // 0
Status[0]         // "Active"
```

Điều này khiến enum sinh ra **runtime code** (object 2 chiều), không
phải zero-cost như nhiều người tưởng. Trong codebase hiện đại, nhiều
team dùng **union of string literal** thay cho enum:

```ts
type Status = "Active" | "Inactive";
```

Nhẹ hơn, không có runtime cost, type-safe ngang nhau.

:::

---

## Array

Hai cách khai báo, tương đương:

```ts
let nums: number[] = [1, 2, 3];
let names: Array<string> = ["An", "Bình"];
```

Array các object:

```ts
const users: User[] = [
  { id: 1, name: "An" },
  { id: 2, name: "Bình" },
];
```

:::info[Phân tích]

Bật flag `noUncheckedIndexedAccess: true` để TS hiểu rằng truy cập
phần tử mảng có thể trả về `undefined`:

```ts
// noUncheckedIndexedAccess: true
const arr: number[] = [1, 2, 3];
const first = arr[0]; // type: number | undefined
```

Flag này không nằm trong `strict` nhưng cực kỳ quan trọng để tránh
crash khi truy cập index ngoài phạm vi.

:::

---

## Tuple

Tuple là mảng có **độ dài cố định** và **kiểu cho từng vị trí**.

```ts
let pair: [string, number] = ["age", 25];

// Sai thứ tự — Error
let wrong: [string, number] = [25, "age"];
```

Tuple với label (rõ nghĩa hơn):

```ts
type Coord = [x: number, y: number];
const p: Coord = [10, 20];
```

Rest tuple — hỗn hợp:

```ts
type StringFirst = [string, ...number[]];
const data: StringFirst = ["scores", 90, 85, 70];
```

:::tip[Mẹo]

Tuple rất hữu dụng cho hàm trả về **nhiều giá trị có ý nghĩa khác nhau**,
giống pattern `useState` của React:

```ts
function useCounter(): [number, () => void] {
  let count = 0;
  return [count, () => { count++; }];
}

const [count, increment] = useCounter();
```

:::
