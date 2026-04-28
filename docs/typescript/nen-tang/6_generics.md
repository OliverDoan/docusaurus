---
sidebar_position: 6
title: "6. Generics"
---

# Generics


---

## Mục lục

- [Generics là gì?](#generics-là-gì)
- [Generic Functions](#generic-functions)
- [Generic Interfaces & Types](#generic-interfaces--types)
- [Generic Classes](#generic-classes)
- [Constraints — Giới hạn type parameters](#constraints--giới-hạn-type-parameters)
- [Default Type Parameters](#default-type-parameters)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Generics là gì?

**Generics** cho phép viết code **reusable** hoạt động với nhiều types mà vẫn giữ type safety. Tham số type `<T>` là placeholder cho type thực tế sẽ được provide khi sử dụng.

> **Ví dụ thực tế:** Generics giống như **template trong máy in** — bạn tạo 1 template, sau đó fill vào dữ liệu khác nhau (text, image, ...) mà không cần tạo template mới.

```typescript
// Không dùng generics — viết hàm riêng cho mỗi type
function getFirstString(arr: string[]): string {
  return arr[0];
}

function getFirstNumber(arr: number[]): number {
  return arr[0];
}

function getFirstBoolean(arr: boolean[]): boolean {
  return arr[0];
}

// Dùng generics — 1 hàm cho tất cả types
function getFirst<T>(arr: T[]): T {
  return arr[0];
}

const str = getFirst(["a", "b"]); // TypeScript suy ra: string
const num = getFirst([1, 2, 3]);  // TypeScript suy ra: number
```

---

## Generic Functions

```typescript
// Generic function — <T> là type parameter
function reverse<T>(arr: T[]): T[] {
  return arr.reverse();
}

reverse([1, 2, 3]);        // number[]
reverse(["a", "b", "c"]); // string[]

// Multiple type parameters
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

pair(1, "hello");           // [number, string]
pair("hello", true);        // [string, boolean]

// Explicit type parameter
const result = pair<number, string>(42, "answer");
```

---

## Generic Interfaces & Types

```typescript
// Generic interface
interface Repository<T> {
  getAll(): T[];
  getById(id: number): T | null;
  create(item: T): T;
  update(id: number, item: T): T;
}

// Implement generic interface
class UserRepository implements Repository<User> {
  getAll(): User[] { /* ... */ }
  getById(id: number): User | null { /* ... */ }
  create(item: User): User { /* ... */ }
  update(id: number, item: User): User { /* ... */ }
}

class ProductRepository implements Repository<Product> {
  getAll(): Product[] { /* ... */ }
  getById(id: number): Product | null { /* ... */ }
  create(item: Product): Product { /* ... */ }
  update(id: number, item: Product): Product { /* ... */ }
}

// Generic type
type Response<T> = {
  status: "success" | "error";
  data?: T;
  error?: string;
};

const userResponse: Response<User> = {
  status: "success",
  data: { id: 1, name: "Minh" }
};

const errorResponse: Response<null> = {
  status: "error",
  error: "Not found"
};
```

---

## Generic Classes

```typescript
// Generic class
class Box<T> {
  constructor(private value: T) {}

  getValue(): T {
    return this.value;
  }

  setValue(value: T): void {
    this.value = value;
  }
}

const stringBox = new Box("hello");
stringBox.getValue(); // string

const numberBox = new Box(42);
numberBox.getValue(); // number

// Multiple type parameters
class Pair<T, U> {
  constructor(public first: T, public second: U) {}

  swap(): Pair<U, T> {
    return new Pair(this.second, this.first);
  }
}

const pair = new Pair(1, "hello");
const swapped = pair.swap(); // Pair<string, number>
```

---

## Constraints — Giới hạn type parameters

Constraints đảm bảo type parameter chỉ chấp nhận types cụ thể:

```typescript
// Constraint: T phải có property length
function getLength<T extends { length: number }>(value: T): number {
  return value.length;
}

getLength("hello");           // ✅ OK — string có length
getLength([1, 2, 3]);         // ✅ OK — array có length
// getLength(42);             // ❌ Error — number không có length

// Constraint: T phải extend type cụ thể
interface Named {
  name: string;
}

function getName<T extends Named>(obj: T): string {
  return obj.name;
}

getName({ name: "Minh", age: 25 }); // ✅ OK

// Constraint: T phải extend key của object
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "Minh", age: 25 };
getProperty(user, "name"); // ✅ OK — name là key
// getProperty(user, "email"); // ❌ Error — email không phải key
```

---

## Default Type Parameters

```typescript
// T có default type: string
type Response<T = string> = {
  data: T;
  message: string;
};

const res1: Response = { data: "ok", message: "Success" }; // T = string
const res2: Response<number> = { data: 200, message: "Success" }; // T = number

// Generic function với default
function create<T = string>(value?: T): T {
  return value ?? ("" as T);
}

create();        // string
create("hello"); // string
create(42);      // number
```

---

## Lỗi thường gặp

### 1. Quên generic parameter

```typescript
// ❌ Sai — T không biết type gì
function getFirst<T>(arr: any[]): T {
  return arr[0];
}

// ✅ Đúng
function getFirst<T>(arr: T[]): T {
  return arr[0];
}
```

### 2. Constraint quá hạn chế

```typescript
// ❌ Sai — U constraint quá cắt racdứ
function process<T, U extends T>(first: T, second: U): void { }

process(1, "hello"); // ❌ — string không extend number

// ✅ Đúng — constraint nên rõ ràng
function process<T, U extends string | number>(first: T, second: U): void { }
```

---

## Câu hỏi phỏng vấn

### Câu 1: Generics là gì? Lợi ích là gì?

**Đáp án:** Generics cho phép viết code reusable với **placeholders cho types** — `<T>`. Khi dùng, TypeScript suy luận hoặc explicit type. Lợi ích: (1) Reusability — 1 function hoạt động cho nhiều types, (2) Type safety — vẫn có full type checking, (3) No casts — không cần `as any` để "escape" type checking.

### Câu 2: Generic constraints hoạt động thế nào?

**Đáp án:** Constraint (`<T extends SomeType>`) giới hạn type parameter phải match điều kiện. VD: `<T extends { length: number }>` chỉ chấp nhận types có property `length`. Constraint giúp: (1) Tránh invalid operations (không thể call `.length` nếu T không có nó), (2) Code safety — TypeScript check, (3) Intent clarity — code mô tả expectations.

### Câu 3: Generic vs Function overload — nên dùng cái nào?

**Đáp án:** **Generics** tốt khi: logic giống nhau, chỉ type khác. **Overloading** tốt khi: logic khác nhau dựa trên input types. Generics reusable hơn (1 implementation), overloads explicit hơn (mỗi signature rõ ràng).
