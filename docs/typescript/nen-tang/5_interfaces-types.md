---
sidebar_position: 5
title: "5. Interfaces & Types"
---

# Interfaces & Types


---

## Mục lục

- [Interface — Mô tả cấu trúc object](#interface--mô-tả-cấu-trúc-object)
- [Type — Định nghĩa type riêng](#type--định-nghĩa-type-riêng)
- [Interface vs Type — Khi nào dùng cái nào?](#interface-vs-type--khi-nào-dùng-cái-nào)
- [Extending & Implementing](#extending--implementing)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Interface — Mô tả cấu trúc object

**Interface** mô tả hình dạng của một object — properties nó có, method nó có, types của chúng.

```typescript
// Định nghĩa interface
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;              // Optional property
  readonly createdAt: Date;  // Readonly
}

// Sử dụng interface
const user: User = {
  id: 1,
  name: "Minh",
  email: "minh@gmail.com",
  createdAt: new Date()
};

// Function với interface
function greetUser(user: User): void {
  console.log(`Hello ${user.name}`);
}

greetUser(user);
```

### Interface với methods

```typescript
interface Logger {
  log(message: string): void;
  error(message: string): void;
}

const logger: Logger = {
  log: (message: string) => console.log(`[LOG] ${message}`),
  error: (message: string) => console.error(`[ERROR] ${message}`)
};

logger.log("Hello");
```

### Optional & Readonly

```typescript
interface Config {
  host: string;
  port: number;
  ssl?: boolean;           // Optional — có thể omitted
  readonly timeout: number; // Readonly — không thể thay đổi sau tạo
}

const config: Config = {
  host: "localhost",
  port: 3000,
  timeout: 5000
};

config.host = "example.com";    // ✅ OK
// config.timeout = 10000;      // ❌ Error: readonly
```

---

## Type — Định nghĩa type riêng

**Type** alias tạo alias cho một type — có thể là primitive, union, intersection, function, etc.

```typescript
// Union type
type Status = "pending" | "completed" | "failed";

let currentStatus: Status = "pending";
currentStatus = "completed";  // ✅
// currentStatus = "unknown"; // ❌ Error

// Object type
type Product = {
  id: number;
  name: string;
  price: number;
};

const product: Product = {
  id: 1,
  name: "Laptop",
  price: 20000
};

// Function type
type Formatter = (value: number) => string;

const formatCurrency: Formatter = (value) => `$${value}`;

// Intersection (kết hợp types)
type Person = { name: string };
type Worker = { jobTitle: string };
type Employee = Person & Worker;

const emp: Employee = {
  name: "Minh",
  jobTitle: "Developer"
};
```

---

## Interface vs Type — Khi nào dùng cái nào?

| Aspect | Interface | Type |
|:---:|:---|:---|
| Mục đích | Object shape | Bất kỳ type nào |
| Union types | ❌ | ✅ |
| Intersection | ❌ (extends) | ✅ (&) |
| Primitive alias | ❌ | ✅ |
| Declaration merging | ✅ | ❌ |
| Performance | Nhẹ hơn | Nặng hơn |
| Use case | Objects, classes | Complex types |

```typescript
// Interface — tốt cho objects
interface User {
  id: number;
  name: string;
}

// Type — tốt cho unions, aliases
type ID = string | number;
type Result = Success | Error;
type Formatter = (value: number) => string;

// Hybrid — kết hợp
interface ApiResponse {
  data: User[];
  status: "success" | "error";
}
```

---

## Extending & Implementing

### Interface extending interface

```typescript
interface Entity {
  id: number;
  createdAt: Date;
}

interface User extends Entity {
  name: string;
  email: string;
}

// User có id, createdAt, name, email
```

### Type extending type (intersection)

```typescript
type Person = { name: string };
type Timestamped = { createdAt: Date };
type User = Person & Timestamped;

// User có name, createdAt
```

### Implementing interface

```typescript
interface Animal {
  name: string;
  sound(): void;
}

class Dog implements Animal {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  sound(): void {
    console.log(`${this.name} barks!`);
  }
}
```

---

## Lỗi thường gặp

### 1. Type mismatch khi implement

```typescript
// ❌ Sai — missing property
interface User {
  id: number;
  name: string;
}

const user: User = {
  id: 1
  // Thiếu name
};

// ✅ Đúng
const user: User = {
  id: 1,
  name: "Minh"
};
```

### 2. Mutating readonly

```typescript
// ❌ Sai
interface Config {
  readonly timeout: number;
}

const config: Config = { timeout: 5000 };
config.timeout = 10000; // ❌ Error

// ✅ Đúng — tạo object mới
const newConfig = { ...config, timeout: 10000 };
```

---

## Câu hỏi phỏng vấn

### Câu 1: Interface là gì? Dùng để làm gì?

**Đáp án:** Interface mô tả **hình dạng (shape)** của object — properties, methods, types của chúng. Dùng để: (1) Type objects, (2) Define contracts cho classes, (3) Ensure duck typing (nếu object có properties/methods này thì có thể dùng). Interface là compile-time construct — xóa hết khi compile thành JavaScript.

### Câu 2: Type vs Interface — nên dùng cái nào?

**Đáp án:** **Hướng dẫn:**
- Dùng **interface** cho objects, classes, contracts
- Dùng **type** cho unions, function types, primitives
- Ưu tiên interface (performance, readability) nếu không cần union/intersection
- Type ngoại lệ: khi cần union/intersection hoặc primitive alias

### Câu 3: Declaration merging trong interface là gì?

**Đáp án:** Interface có thể định nghĩa **nhiều lần** với cùng tên — các định nghĩa tự động **merge** lại. Use case: extend library interfaces, plugin systems. **Type không support** declaration merging.

```typescript
interface User { name: string; }
interface User { email: string; }
// User hiệu chỉnh có cả name và email
```
