---
sidebar_position: 4
title: "4. Decorators (Advanced)"
---

# Decorators (Advanced)

---

## Mục lục

- [Decorators là gì?](#decorators-là-gì)
- [Class Decorators](#class-decorators)
- [Method Decorators](#method-decorators)
- [Property Decorators](#property-decorators)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Decorators là gì?

**Decorator** là hàm modify **class, method, property, parameter** tại declaration time. TypeScript experimental feature (phải enable `experimentalDecorators`).

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

---

## Class Decorators

```typescript
// Decorator nhận class, có thể modify
function Logger<T extends { new(...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    constructor(...args: any[]) {
      super(...args);
      console.log(`${constructor.name} instance created`);
    }
  };
}

@Logger
class User {
  constructor(public name: string) {}
}

new User("Minh"); // Logs: User instance created
```

---

## Method Decorators

```typescript
function Benchmark(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function(...args: any[]) {
    const start = Date.now();
    const result = originalMethod.apply(this, args);
    console.log(`${propertyKey} took ${Date.now() - start}ms`);
    return result;
  };

  return descriptor;
}

class Calculator {
  @Benchmark
  slowAdd(a: number, b: number): number {
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
      sum += a + b;
    }
    return a + b;
  }
}

new Calculator().slowAdd(5, 3); // Logs: slowAdd took 1ms
```

---

## Property Decorators

```typescript
function Validate(target: any, propertyKey: string) {
  let value: any;

  const getter = () => value;
  const setter = (newValue: any) => {
    if (typeof newValue !== "number") {
      throw new TypeError(`${propertyKey} must be a number`);
    }
    value = newValue;
  };

  Object.defineProperty(target, propertyKey, {
    get: getter,
    set: setter,
    enumerable: true,
    configurable: true
  });
}

class Product {
  @Validate
  price: number = 0;
}

const p = new Product();
p.price = 100; // ✅
// p.price = "expensive"; // ❌ Error
```

---

## Lỗi thường gặp

### 1. Quên enable experimentalDecorators

```json
// ❌ Sai — tsconfig.json
{
  "compilerOptions": {}
}

// ✅ Đúng
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: Decorators là gì? Khi nào dùng?

**Đáp án:** Decorators là hàm modify class/method/property tại declaration time. Dùng cho: (1) Logging/Monitoring, (2) Validation, (3) Performance measurement, (4) Dependency injection. Experimental feature, phải enable `experimentalDecorators: true`.

### Câu 2: Method decorator nhận tham số gì?

**Đáp án:** Method decorator nhận 3 tham số: (1) `target` — prototype của class, (2) `propertyKey` — tên method (string), (3) `descriptor` — PropertyDescriptor (có `value` = function). Modify descriptor.value để wrap method.
