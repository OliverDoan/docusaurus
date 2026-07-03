---
sidebar_position: 1
title: "1. TypeScript là gì?"
---

# TypeScript là gì?

**TypeScript** là một ngôn ngữ mở rộng của JavaScript, bổ sung **hệ thống kiểu tĩnh** (static typing) để bắt lỗi ngay khi viết code thay vì lúc chạy. Bài này giúp người mới nắm bản chất của TypeScript và cách nó phối hợp với JavaScript.

---

## Mục lục

- [Định nghĩa](#định-nghĩa)
- [Mục tiêu của TypeScript](#mục-tiêu-của-typescript)
- [TypeScript hoạt động ra sao?](#typescript-hoạt-động-ra-sao)
- [Tương tác với JavaScript](#tương-tác-với-javascript)

---

## Định nghĩa

**TypeScript (TS)** là một **superset** của JavaScript do Microsoft phát
triển từ năm 2012. "Superset" nghĩa là **mọi code JavaScript hợp lệ đều
là code TypeScript hợp lệ** — TS chỉ thêm vào, không bỏ đi.

TS bổ sung hai thứ chính:

1. **Hệ thống type tĩnh** (static typing) — kiểm tra kiểu tại compile-time.
2. **Tính năng ngôn ngữ hiện đại** — sau đó được compile (transpile) về
   JavaScript chạy được trên trình duyệt/Node.

```ts
// TypeScript
function greet(name: string): string {
  return `Hello ${name}`;
}
```

```js
// Sau khi compile → JavaScript
function greet(name) {
  return "Hello " + name;
}
```

---

## Mục tiêu của TypeScript

TypeScript ra đời để giải quyết vấn đề của JavaScript khi dự án lớn lên:

- **Phát hiện lỗi sớm** ngay khi code, không đợi runtime.
- **Tự động hoàn thành code (IntelliSense)** chính xác hơn nhờ biết kiểu.
- **Refactor an toàn** — đổi tên hàm/biến không sợ vỡ chỗ khác.
- **Tài liệu hóa code bằng chính type** — type vừa là constraint, vừa là doc.

---

## TypeScript hoạt động ra sao?

TypeScript là ngôn ngữ **compile-time** — không có runtime riêng. Quá
trình chạy gồm 3 bước:

```
[file .ts]  →  tsc (compiler)  →  [file .js]  →  Node / Browser chạy
```

Sơ đồ dưới đây tóm tắt luồng biên dịch: `tsc` vừa **check type** (báo lỗi ngay lúc compile), vừa **sinh ra file .js** đã bị xoá sạch type để runtime chạy:

```mermaid
flowchart LR
    A["File .ts<br/>(có type annotation)"] --> B["tsc (compiler)"]
    B --> C["Type check<br/>báo lỗi ngay lúc compile"]
    B --> D["File .js<br/>(type bị xoá sạch — type erasure)"]
    D --> E["Node / Browser<br/>chạy tại runtime"]
```

:::info[Phân tích]

**Type erasure**: tất cả type annotation (`: string`, `: number`,
`interface`, `type`) bị **xoá hoàn toàn** khi compile. Code JS sinh ra
không biết gì về type. Hệ quả:

- **Không thể** check type tại runtime bằng `typeof MyInterface`.
- Muốn validate dữ liệu runtime (API response, user input) phải dùng
  thư viện như **Zod**, **io-ts**, hoặc viết type guard thủ công.

```ts
interface User { id: number; name: string; }

function isUser(x: unknown): x is User {
  return typeof x === "object" && x !== null
    && "id" in x && "name" in x;
}
```

:::

---

## Tương tác với JavaScript

TS và JS sống chung được trong cùng project — gọi là **interoperability**.

**Bạn có thể:**

- Đổi tên file `.js` → `.ts` và TS sẽ chấp nhận (nhưng kiểu mặc định là
  `any`).
- Import file `.js` từ file `.ts` bình thường.
- Dùng thư viện JS thuần có sẵn trên npm.

**Để TS hiểu type của thư viện JS**, cần file **type declaration** (đuôi
`.d.ts`). Phần lớn thư viện phổ biến đã có sẵn trên **DefinitelyTyped**
(npm namespace `@types/*`):

```bash
npm install lodash
npm install --save-dev @types/lodash
```

:::tip[Mẹo]

Bật flag `allowJs: true` trong `tsconfig.json` để TS compile cả file `.js`.
Kết hợp `checkJs: true` để TS check type cả trong file `.js` qua JSDoc —
chiến lược **migration dần dần** từ JS sang TS mà không phải đổi toàn bộ
codebase một lúc.

:::

:::warning[Cần lưu ý]

Khai báo `: any` hoặc gặp **implicit any** sẽ **vô hiệu hoá toàn bộ
type-check** cho biến đó — TS sẽ im lặng cho qua mọi thứ. Đây là cách
"lách luật" nguy hiểm nhất. Bật `noImplicitAny: true` trong `tsconfig.json`
để TS báo lỗi khi gặp implicit any.

:::
