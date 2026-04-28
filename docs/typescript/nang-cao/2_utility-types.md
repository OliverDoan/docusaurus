---
sidebar_position: 2
title: "2. Utility Types"
---

# Utility Types

---

## Mục lục

- [Partial & Required](#partial--required)
- [Readonly & Record](#readonly--record)
- [Pick & Omit](#pick--omit)
- [Extract & Exclude](#extract--exclude)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Partial & Required

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

// Partial<T> — tất cả properties optional
type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string; }

const update: PartialUser = { name: "Minh" }; // ✅

// Required<T> — tất cả properties bắt buộc
type RequiredUser = Required<PartialUser>;
// { id: number; name: string; email: string; }
```

---

## Readonly & Record

```typescript
interface Config {
  host: string;
  port: number;
}

// Readonly<T> — tất cả properties readonly
type ReadonlyConfig = Readonly<Config>;

const config: ReadonlyConfig = { host: "localhost", port: 3000 };
// config.host = "example.com"; // ❌ Error

// Record<K, T> — object với keys K, values type T
type Status = "pending" | "completed" | "failed";
type StatusCount = Record<Status, number>;

const counts: StatusCount = {
  pending: 5,
  completed: 10,
  failed: 2
};
```

---

## Pick & Omit

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// Pick<T, Keys> — chọn properties
type UserPublic = Pick<User, "id" | "name" | "email">;
// { id: number; name: string; email: string; }

// Omit<T, Keys> — loại bỏ properties
type UserWithoutPassword = Omit<User, "password">;
// { id: number; name: string; email: string; }
```

---

## Extract & Exclude

```typescript
type Status = "pending" | "completed" | "failed";

// Extract<T, U> — lấy types in both
type TerminalStatus = Extract<Status, "completed" | "failed">;
// "completed" | "failed"

// Exclude<T, U> — loại bỏ types
type ActiveStatus = Exclude<Status, "failed">;
// "pending" | "completed"
```

---

## Lỗi thường gặp

### 1. Quên type parameter

```typescript
// ❌ Sai
type Partial<T> = {};

// ✅ Đúng — cần generic
type Partial<T> = { [K in keyof T]?: T[K]; };
```

---

## Câu hỏi phỏng vấn

### Câu 1: Partial vs Omit khác gì?

**Đáp án:** **Partial** làm **tất cả** properties optional (`?`). **Omit** **xóa** một số properties. VD: `Partial<User>` khiến `id?`, `name?`, `email?` optional. `Omit<User, "password">` xóa password property hoàn toàn.

### Câu 2: Record dùng để làm gì?

**Đáp án:** **Record** tạo object với **keys cụ thể** (literal union). VD: `Record<"a" | "b" | "c", number>` = `{ a: number; b: number; c: number; }`. Dùng khi keys đã biết trước, thay vì dynamic object.
