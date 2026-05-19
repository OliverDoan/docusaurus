---
sidebar_position: 2
title: "2. Interfaces"
---

# Interfaces

---

## Mục lục

- [Khai báo interface](#khai-báo-interface)
- [Extending interface](#extending-interface)
- [Declaration Merging](#declaration-merging)
- [Hybrid Types](#hybrid-types)
- [Type vs Interface](#type-vs-interface)

---

## Khai báo interface

```ts
interface User {
  id: number;
  name: string;
  email?: string;        // optional
  readonly createdAt: Date; // không sửa được
}

const u: User = {
  id: 1,
  name: "An",
  createdAt: new Date(),
};
```

Interface chứa method:

```ts
interface Repository {
  findById(id: number): User | null;
  save(user: User): void;
}
```

Interface là index signature (dictionary):

```ts
interface StringDict {
  [key: string]: string;
}

const d: StringDict = { name: "An", city: "HN" };
```

---

## Extending interface

`extends` để kế thừa từ interface khác. Khác `&` (intersection), `extends`
phát hiện xung đột type ngay tại khai báo.

```ts
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

const d: Dog = { name: "Lulu", breed: "Husky" };
```

Một interface có thể `extends` **nhiều interface** cùng lúc:

```ts
interface Swimmer { swim(): void }
interface Flyer { fly(): void }

interface Duck extends Swimmer, Flyer {
  name: string;
}
```

---

## Declaration Merging

Khai báo interface **cùng tên nhiều lần** — TS tự gộp.

```ts
interface User {
  id: number;
}

interface User {
  name: string;
}

// Tự động thành: { id: number; name: string }
const u: User = { id: 1, name: "An" };
```

`type` **không có** tính năng này — sẽ báo lỗi "Duplicate identifier".

:::info[Phân tích]

Declaration merging cực hữu dụng để **mở rộng type của thư viện bên ngoài**
(module augmentation):

```ts
// Mở rộng Window global
declare global {
  interface Window {
    myApp: { version: string };
  }
}

window.myApp = { version: "1.0" }; // TS hiểu
```

Hoặc augment module npm:

```ts
declare module "express" {
  interface Request {
    userId?: string;
  }
}
```

Đây là kỹ thuật **không thay thế được bằng `type`** — lý do chính nên
biết cả hai.

:::

---

## Hybrid Types

Interface mô tả giá trị **vừa là hàm vừa là object** (callable object).

```ts
interface Counter {
  (start: number): string;  // gọi như hàm
  interval: number;          // property
  reset(): void;             // method
}

function createCounter(): Counter {
  const fn = ((start: number) => `${start}`) as Counter;
  fn.interval = 100;
  fn.reset = () => {};
  return fn;
}

const c = createCounter();
c(5);
c.interval;
c.reset();
```

Pattern này hay gặp khi typing thư viện kiểu **jQuery**, **lodash chain**...

---

## Type vs Interface

| Tính năng | `interface` | `type` |
|-----------|-------------|--------|
| Object shape | OK | OK |
| Function type | OK (call sig) | OK |
| Union | **Không** | OK |
| Intersection | `extends` | `&` |
| Tuple | Khó | OK |
| Mapped type | Không | OK |
| Declaration merging | **Có** | Không |
| Module augmentation | **Có** | Không |

:::tip[Mẹo]

**Quy tắc gọn**:

- Dùng `interface` cho **object public API** (cần mở rộng, augment).
- Dùng `type` cho **mọi thứ khác** (union, tuple, mapped, conditional).
- Trong một codebase, hãy **chọn quy ước nhất quán** và áp dụng toàn dự án.

:::

:::warning[Cần lưu ý]

Hiệu năng compile: với type chứa **nhiều intersection lồng nhau**,
`interface` thường compile **nhanh hơn** `type` đáng kể, vì TS cache
shape của interface tốt hơn intersection của type. Trong codebase lớn
(monorepo > 100k LOC), khác biệt này có thể nhân lên hàng giây mỗi
build.

:::
