---
sidebar_position: 3
title: "3. Conditional Types"
---

# Conditional Types

---

## Mục lục

- [Conditional Types là gì?](#conditional-types-là-gì)
- [Distributed Conditional Types](#distributed-conditional-types)
- [infer Keyword](#infer-keyword)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Conditional Types là gì?

**Conditional type** tạo type dựa trên **condition** — `T extends U ? X : Y`.

```typescript
// Nếu T extends string, type là boolean, ngược lại string
type IsString<T> = T extends string ? boolean : string;

type A = IsString<"hello">; // boolean
type B = IsString<42>;      // string

// Ứng dụng thực tế
type Flatten<T> = T extends Array<infer U> ? U : T;

type Str = Flatten<string[]>; // string
type Num = Flatten<42>;       // 42
```

---

## Distributed Conditional Types

```typescript
// Conditional types "distribute" qua unions
type ToArray<T> = T extends any ? T[] : never;

type StrArray = ToArray<string | number>;
// = (string extends any ? string[] : never) | (number extends any ? number[] : never)
// = string[] | number[]
```

---

## infer Keyword

```typescript
// infer — extract type từ conditional
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type Fn = () => string;
type ReturnType = GetReturnType<Fn>; // string

// Extract parameter type
type GetFirstParam<T> = T extends (first: infer P, ...args: any[]) => any ? P : never;

type FirstParam = GetFirstParam<(x: string, y: number) => void>; // string
```

---

## Lỗi thường gặp

### 1. Quên infer để extract type

```typescript
// ❌ Sai — không extract type
type GetElement<T> = T extends Array<T> ? T : never;

// ✅ Đúng
type GetElement<T> = T extends Array<infer U> ? U : never;
```

---

## Câu hỏi phỏng vấn

### Câu 1: Conditional types dùng để làm gì?

**Đáp án:** Conditional types select type dựa trên **condition** — giống if-else nhưng cho types. Use cases: (1) Extract types từ generics (infer), (2) Flatten/unwrap types, (3) Function overloading at type-level.

### Câu 2: infer là gì?

**Đáp án:** **infer** extract/capture type từ complex type expression. Dùng trong conditional type để lấy type từ union, array, function return, etc. VD: `T extends Array<infer U>` captures element type `U` từ array `T`.
