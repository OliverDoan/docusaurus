---
sidebar_position: 1
title: "1. TypeScript là gì?"
---

# TypeScript là gì?


---

## Mục lục

- [TypeScript là gì?](#typescript-là-gì)
- [Tại sao TypeScript ra đời?](#tại-sao-typescript-ra-đời)
- [TypeScript vs JavaScript](#typescript-vs-javascript)
- [Workflow TypeScript](#workflow-typescript)
- [Lợi ích của TypeScript](#lợi-ích-của-typescript)
- [Nhược điểm của TypeScript](#nhược-điểm-của-typescript)
- [Khi nào nên dùng TypeScript?](#khi-nào-nên-dùng-typescript)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## TypeScript là gì?

**TypeScript** là một **superset** (tập cha) của JavaScript — nó mở rộng JavaScript bằng cách thêm **type safety** (kiểm tra kiểu dữ liệu). Code TypeScript được **compile** thành JavaScript trước khi chạy.

> **Ví dụ thực tế:** TypeScript giống như **đeo kính bảo vệ** khi làm việc — bạn vẫn làm cùng công việc (viết code), nhưng TypeScript giúp phát hiện lỗi **sớm hơn** trước khi mắt (browser) bị tổn thương.

```typescript
// JavaScript — runtime error (lỗi khi chạy)
function themSo(a, b) {
  return a + b;
}
themSo("5", 3); // "53" — lỗi logic, không báo lỗi!

// TypeScript — compile-time error (lỗi ngay lập tức)
function themSo(a: number, b: number): number {
  return a + b;
}
themSo("5", 3); // ❌ Error: Argument of type 'string' is not assignable to parameter of type 'number'
```

---

## Tại sao TypeScript ra đời?

JavaScript ra đời năm 1995 với mục đích **đơn giản, nhanh chóng**. Nhưng khi dự án JavaScript phát triển thành **hàng triệu dòng code**, thiếu **type checking** gây ra nhiều lỗi khó debug.

| Vấn đề JavaScript | TypeScript giải quyết |
|---|---|
| Không biết function cần tham số gì | Type annotation rõ ràng |
| Lỗi không phát hiện đến runtime | Lỗi catch ngay ở compile time |
| IDE khó suggest (autocomplete) | IDE có full context về types |
| Refactor rủi ro (đổi code dễ break) | Type checking giảm risk |
| Không có self-documenting | Types = living documentation |

TypeScript được **Microsoft** tạo ra năm 2012 để giải quyết những vấn đề này.

---

## TypeScript vs JavaScript

| Tiêu chí | JavaScript | TypeScript |
|:---:|:---|:---|
| Type checking | ❌ Dynamic (runtime) | ✅ Static (compile-time) |
| Cú pháp | Cơ bản | Mở rộng + types |
| Compilation | Không cần | Cần compile → JavaScript |
| Error detection | Runtime | Compile time |
| IDE support | Tốt | Tuyệt vời |
| Learning curve | Dễ | Trung bình → khó |
| File size | Nhỏ | Lớn hơn (phải bundle) |
| Browser support | Trực tiếp | Qua transpiler |

```typescript
// JavaScript — không lỗi biên dịch
const user = { name: "Minh" };
console.log(user.age); // undefined — không lỗi!

// TypeScript — phát hiện lỗi sớm
const user: { name: string } = { name: "Minh" };
console.log(user.age); // ❌ Property 'age' does not exist
```

---

## Workflow TypeScript

```
┌─────────────────┐
│ TypeScript Code │  (.ts files)
│ (với types)     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  TypeScript     │  Kiểm tra types, báo lỗi
│  Compiler (tsc) │  Nếu có lỗi → dừng tại đây
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ JavaScript Code │  (.js files)
│ (types bị xóa)  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Browser/Node  │  Chạy như JS thường
│   Runtime       │
└─────────────────┘
```

1. **Viết TypeScript** — file `.ts` với types
2. **Compile (tsc)** — kiểm tra types, output JavaScript
3. **Chạy JavaScript** — browser/Node.js chạy `.js` output

```bash
# File TypeScript
$ cat hello.ts
function greet(name: string): string {
  return "Hello, " + name;
}

# Compile thành JavaScript
$ tsc hello.ts
# Tạo hello.js

$ cat hello.js
function greet(name) {
  return "Hello, " + name;
}
# Types bị xóa hết!

# Chạy JavaScript
$ node hello.js
Hello, World!
```

---

## Lợi ích của TypeScript

### 1. Early Error Detection — Phát hiện lỗi sớm

```typescript
// ❌ JavaScript — bug tìm được sau vài tháng
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
const total = calculateTotal([{ name: "Apple" }]); // undefined + 0 = NaN

// ✅ TypeScript — lỗi catch ngay khi viết
interface Item {
  price: number;
}
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
const total = calculateTotal([{ name: "Apple" }]);
// ❌ Error: Property 'price' is missing
```

### 2. Better IDE Support — Autocomplete tốt hơn

```typescript
const user: { name: string; email: string } = {
  name: "Minh",
  email: "minh@gmail.com"
};

// IDE gợi ý: .name, .email (biết chính xác properties)
user.
// ↑ Bạn sẽ thấy autocomplete đầy đủ
```

### 3. Self-Documenting Code — Code tự mô tả

```typescript
// JavaScript — phải đoán parameters là gì
function processUser(user, options) {
  // ...
}

// TypeScript — rõ ràng chính xác
interface User {
  id: number;
  name: string;
  email: string;
}

interface ProcessOptions {
  sendEmail?: boolean;
  logActivity?: boolean;
}

function processUser(user: User, options: ProcessOptions): void {
  // Types = documentation
}
```

### 4. Refactoring Confidence — Tự tin refactor

```typescript
// Đổi tên property → compiler báo tất cả chỗ phải sửa
interface User {
  fullName: string; // Đổi từ "name"
}

// TypeScript sẽ báo tất cả chỗ dùng "user.name" bị lỗi
// → Bạn fix hết, refactor không break
```

---

## Nhược điểm của TypeScript

### 1. Setup phức tạp hơn

```bash
# JavaScript — run ngay
$ node script.js

# TypeScript — phải cài, config, compile
$ npm install -g typescript
$ tsc --init
$ tsc script.ts
$ node script.js
```

### 2. Overhead learning curve

TypeScript có concepts mới: types, interfaces, generics, decorators... cần thời gian học.

### 3. Build time tăng

Compile TypeScript mất thời gian, lớn dự án càng lâu.

### 4. Bundle size

Types bị xóa nhưng infrastructure (tslib, helpers) có thể làm file lớn hơn.

---

## Khi nào nên dùng TypeScript?

### ✅ NÊN dùng TypeScript

- **Dự án lớn** (10k+ dòng code, nhiều developers)
- **Long-term projects** — dự án tồn tại lâu dài, cần bảo trì
- **Team lớn** — dễ giao tiếp intent qua types
- **Critical systems** — financial, healthcare, e-commerce
- **Library/Framework** — code dùng bởi nhiều người

### ❌ Không cần TypeScript

- **Prototype/MVP** — nhanh chóng, thiết kế thay đổi liên tục
- **Một file script nhỏ** — overkill
- **Dự án JS chỉ frontend đơn giản** — React + fetch, không phức tạp
- **Team quen JS, không quen TypeScript** — setup overhead

---

## Câu hỏi phỏng vấn

### Câu 1: TypeScript là gì? Nó khác JavaScript như thế nào?

**Đáp án:** TypeScript là superset của JavaScript — nó mở rộng JavaScript bằng cách thêm **static type checking**. TypeScript code được compile thành JavaScript trước khi chạy. Khác biệt chính: JavaScript có dynamic typing (lỗi ở runtime), TypeScript có static typing (lỗi ở compile time). Điều này giúp phát hiện lỗi sớm hơn và IDE support tốt hơn.

### Câu 2: TypeScript được compile thành cái gì?

**Đáp án:** TypeScript được compile (transpile) thành **JavaScript thường**. Quá trình compile gọi là transpilation — TypeScript compiler (tsc) đọc `.ts` files, kiểm tra types, sau đó output `.js` files. Types bị loại bỏ hoàn toàn trong JavaScript output — browser/Node.js chỉ chạy JavaScript bình thường.

### Câu 3: Lợi ích lớn nhất của TypeScript là gì?

**Đáp án:** **Early error detection** — phát hiện lỗi tại compile time thay vì runtime. Điều này tiết kiệm thời gian debug, giảm bug trong production, tăng code quality. Lợi ích phụ: better IDE support (autocomplete, refactoring tools), self-documenting code (types = documentation), increased confidence khi refactoring.

### Câu 4: Khi nào KHÔNG nên dùng TypeScript?

**Đáp án:** Không nên dùng TypeScript cho: (1) Prototype/MVP — TypeScript overhead không đáng, (2) Small script — setup phức tạp cho code 50 dòng là overkill, (3) Team không familiar với TypeScript — learning curve + setup time không xứng, (4) Dự án thay đổi nhanh — types cần update thường xuyên. Rule of thumb: TypeScript worth it ở dự án **lâu dài, lớn, hay team lớn**.

### Câu 5: TypeScript compiler làm gì?

**Đáp án:** TypeScript compiler (tsc):
1. **Parse** — đọc `.ts` files
2. **Type check** — kiểm tra types, báo errors nếu có
3. **Emit** — output `.js` files nếu không có lỗi
4. **Xóa types** — types không có trong output (JavaScript không hiểu types)

Nếu có type errors, compiler có thể vẫn output `.js` (config `noEmitOnError: false`), hoặc dừng lại (config `noEmitOnError: true`).
