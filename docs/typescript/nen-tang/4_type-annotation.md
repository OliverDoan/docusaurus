---
sidebar_position: 4
title: "4. Type Annotations"
---

# Type Annotations


---

## Mục lục

- [Function Parameters & Return Type](#function-parameters--return-type)
- [Object & Array Annotations](#object--array-annotations)
- [Optional & Default Parameters](#optional--default-parameters)
- [Rest Parameters](#rest-parameters)
- [Function Overloading](#function-overloading)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Function Parameters & Return Type

```typescript
// Function với type annotations
function greet(name: string): string {
  return `Hello, ${name}`;
}

greet("Minh");    // ✅ OK
// greet(42);     // ❌ Error: Argument of type 'number' is not assignable to parameter of type 'string'

// Multiple parameters
function add(a: number, b: number): number {
  return a + b;
}

// Return type: void (không return gì)
function logMessage(message: string): void {
  console.log(message);
}

// Return type: never (never return)
function throwError(msg: string): never {
  throw new Error(msg);
}

// Arrow function
const multiply = (a: number, b: number): number => a * b;

// Function type annotation (đặt type của function variable)
const divide: (a: number, b: number) => number = (a, b) => {
  if (b === 0) throw new Error("Division by zero");
  return a / b;
};
```

---

## Object & Array Annotations

```typescript
// Object inline
function printUser(user: { name: string; age: number }) {
  console.log(`${user.name}, ${user.age}`);
}

printUser({ name: "Minh", age: 25 }); // ✅
// printUser({ name: "Minh" }); // ❌ Missing property 'age'

// Array
function sumNumbers(numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

sumNumbers([1, 2, 3]); // ✅

// Array of objects
function processUsers(users: Array<{ id: number; name: string }>) {
  users.forEach(user => console.log(user.name));
}

processUsers([
  { id: 1, name: "Minh" },
  { id: 2, name: "Lan" }
]); // ✅

// Tuple
function getCoordinates(): [number, number] {
  return [10, 20];
}

const [x, y] = getCoordinates();
```

---

## Optional & Default Parameters

```typescript
// Optional parameter (?)
function greetOptional(name?: string): string {
  if (!name) return "Hello!";
  return `Hello, ${name}`;
}

greetOptional();       // ✅ OK
greetOptional("Minh"); // ✅ OK

// Default parameter
function withDefault(name: string = "Guest"): string {
  return `Hello, ${name}`;
}

// Optional parameter in object
interface User {
  name: string;
  email?: string;
  phone?: string;
}

function createUser(user: User): User {
  return {
    ...user,
    email: user.email ?? "no-email@example.com"
  };
}

createUser({ name: "Minh" });                    // ✅
createUser({ name: "Minh", email: "..." });     // ✅
```

---

## Rest Parameters

```typescript
// Rest parameter
function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

sum(1, 2, 3, 4);           // ✅
sum(1, 2, 3, 4, 5, 6, 7); // ✅
// sum(1, 2, "3");         // ❌ Error

// Mix regular + rest
function logMessages(prefix: string, ...messages: string[]): void {
  messages.forEach(msg => console.log(`${prefix}: ${msg}`));
}

logMessages("INFO", "App started", "User logged in");

// Rest in object (using spread)
function createConfig(base: { host: string }, ...options: any[]) {
  return { ...base, ...Object.assign({}, ...options) };
}
```

---

## Function Overloading

```typescript
// Overload signatures — mô tả cách gọi function
function format(value: string): string;
function format(value: number, precision?: number): string;

// Implementation — thực tế function
function format(value: string | number, precision?: number): string {
  if (typeof value === "string") return value.toUpperCase();
  return value.toFixed(precision ?? 2);
}

format("hello");     // ✅ "HELLO"
format(3.14159);     // ✅ "3.14"
format(3.14159, 3);  // ✅ "3.142"
// format("hello", 2); // ❌ Error: Overload expects 1 argument
```

---

## Lỗi thường gặp

### 1. Quên type parameter function

```typescript
// ❌ Sai — không biết parameter type
function process(value) { }

// ✅ Đúng
function process(value: string): void { }
```

### 2. Optional vs required

```typescript
// ❌ Sai — mặc định yêu cầu bắt buộc
function greet(name: string) { }
greet();  // ❌ Error

// ✅ Đúng — làm optional
function greet(name?: string) { }
greet(); // ✅ OK
```

### 3. Unused parameter (noUnusedParameters: true)

```typescript
// ❌ Sai — callback parameter không dùng
function process(data: string[], callback: (item: string, index: number) => void) {
  data.forEach(callback);
  // Nhưng callback không dùng index
}

// ✅ Đúng — dùng underscore nếu không cần
function process(data: string[], callback: (item: string, _index: number) => void) {
  data.forEach((item, index) => callback(item, index));
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: Function parameter annotation format là gì?

**Đáp án:** `parameterName: Type`. VD: `function greet(name: string, age: number): string { ... }`. Có thể annotate: individual parameters, return type (`:Type` sau closing paren), rest parameters (`...args: Type[]`), optional parameters (`param?: Type`).

### Câu 2: Function overloading hoạt động thế nào?

**Đáp án:** Overload signatures mô tả **tất cả** cách hợp lệ gọi function. Implementation (function thực tế) phải compatible với tất cả overload signatures. TypeScript check call site chống lại overload signatures (không phải implementation). Use case: function xử lý khác nhau dựa trên parameter types.

### Câu 3: Optional parameter (?) vs Default parameter khác gì?

**Đáp án:** **Optional** (`name?: string`) — parameter có thể omitted, nếu pass undefined. **Default** (`name = "Guest"`) — parameter có default value nếu omitted. Cả hai không bắt buộc, nhưng default param thường dùng hơn (có default value, parameter không thể undefined trong function body).
