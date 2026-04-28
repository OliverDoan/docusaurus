---
sidebar_position: 3
title: "3. Các kiểu cơ bản"
---

# Các kiểu cơ bản


---

## Mục lục

- [Primitive Types — Kiểu nguyên thủy](#primitive-types--kiểu-nguyên-thủy)
- [Special Types](#special-types)
- [Type annotations — Gán type cho variable](#type-annotations--gán-type-cho-variable)
- [Type inference — TypeScript tự suy luận type](#type-inference--typescript-tự-suy-luận-type)
- [Union Types — Nhiều type cho một variable](#union-types--nhiều-type-cho-một-variable)
- [Literal Types — Giá trị cụ thể làm type](#literal-types--giá-trị-cụ-thể-làm-type)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Primitive Types — Kiểu nguyên thủy

TypeScript hỗ trợ tất cả JavaScript primitive types, cộng thêm một vài type riêng:

```typescript
// String
const ten: string = "Minh";
const mo: string = `Hello ${ten}`;

// Number — bao gồm integer, float, Infinity, NaN
const tuoi: number = 25;
const pi: number = 3.14;
const voTan: number = Infinity;

// Boolean
const isDone: boolean = true;
const isValid: boolean = false;

// Null & Undefined
const nothing: null = null;
const notDefined: undefined = undefined;

// Symbol
const id: symbol = Symbol("id");

// BigInt
const bigNumber: bigint = 100n;
```

---

## Special Types

### any — Tắt type checking

```typescript
// ❌ Tránh dùng any — vô tình "tắt" TypeScript
let x: any = "hello";
x = 5;              // OK — any có thể là bất kỳ type
x.toUpperCase();    // Không có error (nhưng sai khi run!)

// ✅ Nên dùng khi thực sự không biết type
let value: any = JSON.parse('{"name": "Minh"}');
```

### unknown — Type-safe any

```typescript
// unknown — yêu cầu type check trước khi dùng
let value: unknown = "hello";

// ❌ Sai — không được dùng unknown trực tiếp
// console.log(value.toUpperCase()); // Error

// ✅ Phải check type trước
if (typeof value === "string") {
  console.log(value.toUpperCase()); // OK
}
```

### never — Type không bao giờ xảy ra

```typescript
// Function throw error — return type là never
function throwError(message: string): never {
  throw new Error(message);
}

// Infinite loop — return type là never
function infiniteLoop(): never {
  while (true) {}
}

// Exhaustive check với union types
function handleStatus(status: "success" | "error"): string {
  switch (status) {
    case "success": return "OK";
    case "error": return "Error";
    default:
      const _exhaustive: never = status; // Catch lỗi nếu thêm case
      return _exhaustive;
  }
}
```

### void — Function không return gì

```typescript
// void = không return gì
function greet(name: string): void {
  console.log(`Hello ${name}`);
  // Không return
}

// variable void (hiếm khi dùng)
const nothing: void = undefined;
```

---

## Type annotations — Gán type cho variable

```typescript
// Biến
const soNguyen: number = 42;
const soThapPhan: number = 3.14;
const ten: string = "Minh";
const isDone: boolean = true;

// Array
const numbers: number[] = [1, 2, 3];
const strings: Array<string> = ["a", "b", "c"];
const mixed: (number | string)[] = [1, "a", 2];

// Tuple — array có độ dài cố định + type cố định
const tuple: [string, number] = ["Minh", 25];
const tuple2: [string, number, boolean] = ["Minh", 25, true];

// Object
const user: { name: string; age: number } = {
  name: "Minh",
  age: 25
};

// Optional property
const config: { host: string; port?: number } = {
  host: "localhost"
  // port không bắt buộc
};

// Function
const add: (a: number, b: number) => number = (a, b) => a + b;

// Readonly
const readonlyString: readonly string[] = ["a", "b", "c"];
// readonlyString.push("d"); // ❌ Error
```

---

## Type inference — TypeScript tự suy luận type

TypeScript thông minh có thể **suy ra type tự động** từ giá trị gán:

```typescript
// TypeScript suy ra: number
let x = 42;
// x = "hello"; // ❌ Error — TypeScript biết x là number

// TypeScript suy ra: string
const name = "Minh";
// name = 25; // ❌ Error

// TypeScript suy ra: (number | string)[]
const mixed = [1, "a", 2, "b"];

// Không cần annotate nếu TypeScript suy đúng
function add(a: number, b: number) {
  return a + b; // TypeScript suy ra return type: number
}

// Nên explicit khi có ambiguity
const ambiguous = [1, "a"]; // any[] hoặc (number | string)[]?
const explicit: (number | string)[] = [1, "a"]; // Rõ ràng
```

---

## Union Types — Nhiều type cho một variable

**Union** cho phép variable có **nhiều kiểu** — giá trị có thể là loại này hoặc loại khác:

```typescript
// id có thể là number hoặc string
let id: number | string;
id = 123;       // ✅ OK
id = "ABC123";  // ✅ OK
// id = true;   // ❌ Error

// Function parameter
function printId(id: number | string) {
  // ❌ Lỗi — TypeScript không biết id là số hay chuỗi
  // console.log(id.toUpperCase());

  // ✅ Phải check type trước
  if (typeof id === "string") {
    console.log(id.toUpperCase());
  } else {
    console.log(id.toFixed(2));
  }
}

printId(42);
printId("ABC");
```

### Type narrowing

```typescript
function processValue(value: string | number) {
  if (typeof value === "string") {
    // Trong block này, value là string
    return value.toUpperCase();
  } else {
    // Trong block này, value là number
    return value.toFixed(2);
  }
}
```

---

## Literal Types — Giá trị cụ thể làm type

```typescript
// Literal type — chỉ chấp nhận giá trị cụ thể
let direction: "up" | "down" | "left" | "right";
direction = "up";      // ✅ OK
// direction = "forward"; // ❌ Error

// Boolean literal
let state: true;
state = true;    // ✅ OK
// state = false; // ❌ Error

// Number literal
let httpStatus: 200 | 404 | 500;
httpStatus = 200; // ✅ OK
// httpStatus = 201; // ❌ Error

// Ứng dụng thực tế
type Role = "admin" | "user" | "guest";

function hasAccess(role: Role): boolean {
  if (role === "admin") return true;
  if (role === "user") return true;
  if (role === "guest") return false;
}

hasAccess("admin");     // ✅ OK
// hasAccess("moderator"); // ❌ Error
```

---

## Lỗi thường gặp

### 1. Quên type annotation

```typescript
// ❌ Sai — TypeScript suy luận, có thể không như mong
let data = [1, 2, 3]; // any[]?

// ✅ Đúng — explicit type
let data: number[] = [1, 2, 3];
```

### 2. any thay vì union

```typescript
// ❌ Tránh — any tắt type checking
function process(value: any) { }

// ✅ Dùng union
function process(value: number | string) { }
```

### 3. Quên type narrowing với union

```typescript
// ❌ Sai — không check type
function getLength(value: string | number): number {
  return value.length; // Error — number không có .length
}

// ✅ Đúng — check type
function getLength(value: string | number): number {
  if (typeof value === "string") return value.length;
  return value.toString().length;
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: "any" và "unknown" khác nhau thế nào?

**Đáp án:** Cả hai đại diện cho "không biết type". Nhưng: **any** tắt hoàn toàn type checking — có thể gọi bất kỳ method nào, gán vào bất kỳ type nào. **unknown** an toàn hơn — buộc type check trước khi dùng. Nên dùng unknown để giữ type safety.

### Câu 2: Union Types là gì? Khi nào dùng?

**Đáp án:** Union cho phép variable chứa **nhiều type**. VD: `number | string`. Dùng khi value có thể là một trong vài type nhất định. Phải **type narrow** (check type) trước khi dùng property riêng của type nào đó. Union types tốt hơn any vì vẫn có type safety.

### Câu 3: Type inference vs Type annotation — nên dùng cái nào?

**Đáp án:** Nên dùng **type inference** khi TypeScript suy đúng (biến đơn giản, return type từ function). Nên dùng **type annotation** khi: (1) ambiguous (VD: `[]` có thể là array gì?), (2) function parameters bắt buộc, (3) public API (libraries). Rule: comment type annotation cho clarity, dùng inference nơi rõ ràng.

### Câu 4: Literal types dùng để làm gì?

**Đáp án:** Literal types giới hạn variable chỉ có thể là **giá trị cụ thể**. VD: `"admin" | "user" | "guest"` thay vì `string`. Lợi ích: type-safe enums (tránh typo), exhaustive checking (catch khi quên case), auto-completion tốt. Ứng dụng: status codes, roles, states.

### Câu 5: Type narrowing là gì? Cho ví dụ.

**Đáp án:** Type narrowing là kỹ thuật **giới hạn** type của variable trong code block bằng cách check. Methods: `typeof`, `instanceof`, truthiness check, explicit type guards. VD:

```typescript
function process(value: string | number) {
  if (typeof value === "string") {
    // Tại đây, value chắc chắn là string
    return value.toUpperCase();
  }
  // Tại đây, value chắc chắn là number
  return value.toFixed(2);
}
```
