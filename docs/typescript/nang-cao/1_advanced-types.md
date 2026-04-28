---
sidebar_position: 1
title: "1. Advanced Types"
---

# Advanced Types

---

## Mục lục

- [Type Guards — Kiểm tra types](#type-guards--kiểm-tra-types)
- [Typeof Type Guards](#typeof-type-guards)
- [Instanceof Type Guards](#instanceof-type-guards)
- [Custom Type Guards](#custom-type-guards)
- [Discriminated Unions](#discriminated-unions)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Type Guards — Kiểm tra types

**Type guard** là code kiểm tra type của variable, giúp TypeScript **narrow** type trong code block.

```typescript
// Type guard — sau check, TypeScript biết type chính xác
function processValue(value: string | number) {
  if (typeof value === "string") {
    // Trong block này: value là string
    console.log(value.toUpperCase());
  } else {
    // Trong block này: value là number
    console.log(value.toFixed(2));
  }
}
```

---

## Typeof Type Guards

```typescript
function process(value: string | number | boolean) {
  if (typeof value === "string") {
    return value.toUpperCase();
  }

  if (typeof value === "number") {
    return value.toFixed(2);
  }

  // value là boolean tại đây
  return value ? "true" : "false";
}
```

---

## Instanceof Type Guards

```typescript
class Dog {
  bark() { console.log("Woof!"); }
}

class Cat {
  meow() { console.log("Meow!"); }
}

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark(); // animal là Dog
  } else {
    animal.meow(); // animal là Cat
  }
}
```

---

## Custom Type Guards

```typescript
// Type predicate: parameterName is Type
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

function process(value: unknown) {
  if (isString(value)) {
    console.log(value.toUpperCase()); // value: string
  }

  if (isNumber(value)) {
    console.log(value.toFixed(2)); // value: number
  }
}

// Check object shape
interface User {
  id: number;
  name: string;
}

function isUser(obj: unknown): obj is User {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "name" in obj &&
    typeof (obj as any).id === "number" &&
    typeof (obj as any).name === "string"
  );
}

const data = JSON.parse('{"id":1,"name":"Minh"}');
if (isUser(data)) {
  console.log(data.name); // TypeScript: data.name exists
}
```

---

## Discriminated Unions

**Discriminated union** dùng **literal type property** để distinguish giữa union members:

```typescript
// Mỗi type có property "type" khác nhau — discriminator
type Circle = {
  type: "circle";
  radius: number;
};

type Rectangle = {
  type: "rectangle";
  width: number;
  height: number;
};

type Shape = Circle | Rectangle;

function getArea(shape: Shape): number {
  // TypeScript narrow type dựa vào shape.type
  if (shape.type === "circle") {
    return Math.PI * shape.radius ** 2;
  } else {
    return shape.width * shape.height;
  }
}

// Real-world example: API responses
type SuccessResponse = {
  status: "success";
  data: any;
};

type ErrorResponse = {
  status: "error";
  error: string;
};

type ApiResponse = SuccessResponse | ErrorResponse;

function handleResponse(response: ApiResponse) {
  if (response.status === "success") {
    console.log(response.data); // OK
    // console.log(response.error); // ❌ Property doesn't exist
  } else {
    console.log(response.error); // OK
    // console.log(response.data); // ❌ Property doesn't exist
  }
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: Type guard là gì? Lợi ích?

**Đáp án:** Type guard là code kiểm tra type của value tại runtime, giúp TypeScript **narrow** type trong code block. Lợi ích: (1) Safety — TypeScript catch lỗi nếu dùng property không tồn tại, (2) Autocomplete — IDE gợi ý property đúng, (3) Readability — code rõ ràng intent.

### Câu 2: Discriminated union vs Union types?

**Đáp án:** **Union** (`Type1 | Type2`) generic. **Discriminated union** có thêm **literal property** để dễ distinguish. VD: `type: "success" | "error"`. Discriminated unions tốt hơn vì: (1) Exhaustive checking dễ, (2) Compiler help khi narrow (tự suggest properties), (3) Prevent invalid combinations.

### Câu 3: Custom type predicate là gì?

**Đáp án:** Custom type predicate (`parameterName is Type`) define function kiểm tra type, trả về `true` nếu value match type. TypeScript dùng return value để narrow type. Use case: check complex object shapes (JSON parsing), library-specific type checks.
