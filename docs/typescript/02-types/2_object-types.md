---
sidebar_position: 2
title: "2. Object Types"
---

# Object Types

**Object types** (kiểu đối tượng) là các kiểu dùng để mô tả dữ liệu có cấu trúc — gồm nhiều giá trị gộp lại — thay vì một giá trị đơn lẻ như kiểu nguyên thủy. Bài này giới thiệu các kiểu đối tượng thường gặp trong TypeScript: `interface`, `class`, `enum`, `array` (mảng) và `tuple` (mảng cố định kiểu cho từng vị trí).

---

:::note[Ghi nhớ nhanh]

- ⭐ **`interface` mô tả hình dạng (shape)** — bắt lỗi khi thiếu field, thừa field lạ hoặc sai kiểu; hỗ trợ `?` (optional) và `readonly`.
- ⭐ **Structural typing** — hai object cùng shape là tương thích, không cần `implements` tường minh (khác Java/C#).
- **`class` vừa là kiểu vừa là giá trị** — dùng làm type lẫn constructor.
- **`enum` có runtime cost** — numeric enum sinh reverse mapping; nhiều team thay bằng union string literal (`"Active" | "Inactive"`) nhẹ hơn.
- **`array` vs `tuple`** — array độ dài linh hoạt cùng kiểu; tuple độ dài cố định, kiểu theo từng vị trí. Bật `noUncheckedIndexedAccess` để index trả `T | undefined`.

:::

---

## Mục lục

- [Vì sao cần định kiểu cho object?](#vì-sao-cần-định-kiểu-cho-object)
- [Interface](#interface)
- [Class](#class)
- [Enum](#enum)
- [Array](#array)
- [Tuple](#tuple)

---

## Vì sao cần định kiểu cho object?

Object trong JavaScript không có **hình dạng (shape)** cố định: có thể thêm, bớt, sửa thuộc tính bất cứ lúc nào. Truy cập sai tên thuộc tính (gõ nhầm), thiếu field, hay gán sai kiểu cho field đều **không báo lỗi lúc viết code** — chỉ vỡ ra lúc chạy.

**Vấn đề:**

```ts
// JavaScript — không có ràng buộc shape
const user = { id: 1, name: "An", isActive: true };

console.log(user.nmae);     // undefined — gõ nhầm "name" → "nmae", không ai báo
console.log(user.email);    // undefined — field không tồn tại, vẫn chạy
user.isActive = "yes";      // gán sai kiểu (string thay vì boolean), vẫn chạy

// Lỗi chỉ lộ ra lúc runtime, có khi tận production
```

**Giải pháp:**

```ts
// TypeScript — mô tả HÌNH DẠNG object
interface User {
  readonly id: number;        // không cho sửa sau khi tạo
  name: string;               // bắt buộc
  isActive: boolean;          // đúng kiểu
  email?: string;             // optional (?)
  [key: string]: unknown;     // index signature — key động
}

const user: User = { id: 1, name: "An", isActive: true };

console.log(user.nmae);   // Error: thuộc tính 'nmae' không tồn tại
user.isActive = "yes";    // Error: 'string' không gán được cho 'boolean'
user.id = 2;              // Error: 'id' là readonly
```

Compiler bắt lỗi ngay khi **thiếu field bắt buộc, thừa field lạ, hoặc sai kiểu**, đồng thời editor **autocomplete** đúng tên thuộc tính nên gần như không gõ nhầm.

Sơ đồ dưới đây phân loại các kiểu đối tượng thường gặp trong bài này:

```mermaid
flowchart TD
    O["Object Types (kiểu đối tượng)"]
    O --> Shape["Mô tả hình dạng"]
    O --> Coll["Tập hợp nhiều phần tử"]
    O --> Const["Tập hằng số"]

    Shape --> I["interface<br/>mô tả shape object"]
    Shape --> C["class<br/>vừa là kiểu, vừa là giá trị"]

    Coll --> A["array<br/>nhiều phần tử cùng kiểu, độ dài linh hoạt"]
    Coll --> T["tuple<br/>độ dài cố định, kiểu theo từng vị trí"]

    Const --> E["enum<br/>tập hằng số được đặt tên"]
```

:::tip[Dùng thực tế]

- **Định kiểu response API**: mô tả shape JSON trả về để dùng `data.user.name` an toàn, không lo field đổi tên.
- **Props của component**: khai báo props bắt buộc/optional cho React, gọi thiếu prop là báo lỗi ngay.
- **Config object**: ràng buộc các tùy chọn cấu hình hợp lệ, tránh gõ nhầm key như `tiemout` thay vì `timeout`.
- **Dữ liệu lồng nhau (nested)**: mô tả object trong object (ví dụ `user.address.city`) để truy cập sâu vẫn được kiểm tra kiểu.

:::

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
