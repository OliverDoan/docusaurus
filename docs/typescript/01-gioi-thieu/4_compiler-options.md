---
sidebar_position: 4
title: "4. tsconfig.json và Compiler Options"
---

# tsconfig.json và Compiler Options

---

## Mục lục

- [tsconfig.json là gì?](#tsconfigjson-là-gì)
- [Cấu trúc cơ bản](#cấu-trúc-cơ-bản)
- [Các option quan trọng nhất](#các-option-quan-trọng-nhất)
- [Strict mode](#strict-mode)
- [Module và Target](#module-và-target)
- [Kế thừa cấu hình](#kế-thừa-cấu-hình)

---

## tsconfig.json là gì?

`tsconfig.json` là **file cấu hình** đặt ở thư mục gốc project, báo cho
`tsc` biết:

- Compile file nào (`include`, `exclude`, `files`).
- Compile ra phiên bản JS nào (`target`).
- Module system gì (`module`).
- Kiểm tra type nghiêm ngặt đến đâu (`strict`).
- Đặt output ở đâu (`outDir`).

Có file này → chỉ cần gõ `tsc` không tham số là compile cả project.

---

## Cấu trúc cơ bản

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Các option quan trọng nhất

| Option | Tác dụng |
|--------|----------|
| `target` | Phiên bản JS output (`ES5`, `ES2022`, `ESNext`) |
| `module` | Hệ module output (`CommonJS`, `ESNext`, `NodeNext`) |
| `moduleResolution` | Cách resolve `import` (`Node`, `Bundler`, `NodeNext`) |
| `strict` | Bật toàn bộ option strict (xem dưới) |
| `outDir` | Thư mục chứa file `.js` sau khi compile |
| `rootDir` | Thư mục source code đầu vào |
| `esModuleInterop` | Cho phép `import x from 'cjs-module'` |
| `skipLibCheck` | Bỏ qua check `.d.ts` của thư viện → build nhanh hơn |
| `declaration` | Sinh file `.d.ts` (cần khi publish thư viện) |
| `sourceMap` | Sinh `.map` cho debug |
| `noEmit` | Chỉ type-check, không sinh file (cho IDE/CI) |
| `jsx` | Cách xử lý `.tsx` (`preserve`, `react-jsx`, `react`) |
| `paths` + `baseUrl` | Alias import (`@/utils/...`) |

---

## Strict mode

`"strict": true` bật tất cả các flag strict cùng lúc:

| Flag con | Tác dụng |
|----------|----------|
| `strictNullChecks` | `null` / `undefined` là kiểu riêng, không gán bừa |
| `noImplicitAny` | Báo lỗi khi không infer được type, không cho ngầm `any` |
| `strictFunctionTypes` | Kiểm tra tham số hàm theo contravariance đúng chuẩn |
| `strictBindCallApply` | Check type khi dùng `.bind()`, `.call()`, `.apply()` |
| `strictPropertyInitialization` | Property class phải được khởi tạo |
| `alwaysStrict` | Tự thêm `"use strict"` vào file output |
| `useUnknownInCatchVariables` | Biến `catch (e)` là `unknown` thay vì `any` |

:::info[Phân tích]

**Luôn bật `"strict": true` cho project mới.** Nếu migrate codebase JS
lớn, bật **từng flag một** theo thứ tự:

1. `noImplicitAny` — buộc khai báo type rõ ràng.
2. `strictNullChecks` — tốn công nhất nhưng quan trọng nhất.
3. Các flag còn lại bật sau cùng.

Bật `strict` từ đầu rẻ hơn rất nhiều so với bật lại sau 6 tháng.

:::

:::warning[Cần lưu ý]

Bật `strict` nhưng **chưa đủ** — vẫn cần bật thủ công các flag sau, chúng
**không** nằm trong `strict`:

- `noUncheckedIndexedAccess` — truy cập `array[i]` trả về `T | undefined`.
- `exactOptionalPropertyTypes` — phân biệt `{ x?: number }` với `{ x: number | undefined }`.
- `noImplicitOverride` — buộc dùng `override` keyword khi override method.
- `noFallthroughCasesInSwitch` — bắt case thiếu `break`.

Đây là những flag "siêu strict" thường thấy ở team senior.

:::

---

## Module và Target

```json
{
  "target": "ES2022",
  "module": "ESNext",
  "moduleResolution": "Bundler"
}
```

- `target`: trình duyệt/Node bạn deploy đến — JS sinh ra sẽ dùng cú pháp
  của phiên bản này.
- `module`: định dạng module trong output (`CommonJS` cho Node cũ,
  `ESNext`/`NodeNext` cho hiện đại).
- `moduleResolution`: cách TS tìm file khi gặp `import`. `Bundler` phù
  hợp khi dùng Vite/Webpack/Next; `NodeNext` cho thuần Node ESM.

:::tip[Mẹo]

**Preset chuẩn 2026** cho từng môi trường:

- **Frontend (Vite/Next.js)**: `target: ES2022`, `module: ESNext`,
  `moduleResolution: Bundler`, `jsx: react-jsx`, `noEmit: true`.
- **Backend Node**: `target: ES2022`, `module: NodeNext`,
  `moduleResolution: NodeNext`.
- **Thư viện publish npm**: thêm `declaration: true`, `sourceMap: true`,
  `outDir: ./dist`.

:::

---

## Kế thừa cấu hình

Bạn không cần viết lại từ đầu — kế thừa từ preset có sẵn:

```bash
npm install --save-dev @tsconfig/node20
```

```json
{
  "extends": "@tsconfig/node20/tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist"
  }
}
```

Repo **tsconfig/bases** (https://github.com/tsconfig/bases) chứa preset
sẵn cho Node, Deno, Next.js, React Native, Astro, Svelte...

:::info[Phân tích]

Trong monorepo lớn, dùng **project references**:

```json
{
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/ui" }
  ]
}
```

Cho phép TS build **incremental** — chỉ rebuild package thay đổi, tiết
kiệm hàng phút build cho monorepo nhiều package.

:::
