---
sidebar_position: 1
title: "1. Ecosystem"
---

# Ecosystem

**Ecosystem** (hệ sinh thái, tập hợp công cụ xoay quanh ngôn ngữ) là các công cụ thường đi kèm khi làm việc với TypeScript trong thực tế, chứ không phải bản thân ngôn ngữ. Nó gồm những thứ như trình định dạng code (formatter), trình kiểm tra lỗi phong cách (linter), công cụ build và công cụ chạy test. Bài này giúp người mới học hình dung bức tranh tổng thể về các công cụ hỗ trợ để viết và bảo trì dự án TypeScript chuyên nghiệp.

Sơ đồ dưới phác hoạ cây công cụ chính của hệ sinh thái TypeScript theo từng nhóm nhiệm vụ:

```mermaid
flowchart TD
    TS["Hệ sinh thái TypeScript"]
    TS --> F["Formatter<br/>Prettier, Biome"]
    TS --> L["Linter<br/>ESLint + typescript-eslint"]
    TS --> B["Build / Compiler"]
    TS --> T["Test runner<br/>Vitest, Jest, Bun test"]
    TS --> P["Package hữu ích"]
    B --> B1["tsc (type-check chuẩn)"]
    B --> B2["esbuild / swc / Bun<br/>(nhanh, chỉ strip type)"]
    B --> B3["Vite / Webpack / Turbopack<br/>(bundler)"]
    P --> P1["Type utils: type-fest, ts-toolbelt"]
    P --> P2["Validation: Zod, Valibot"]
    P --> P3["API/ORM: tRPC, Drizzle, Prisma"]
```

---

:::note[Ghi nhớ nhanh]

- ⭐ **Formatter (Prettier/Biome) + Linter (ESLint + typescript-eslint)** — chuẩn hoá style và bắt bad pattern; `TSLint` đã deprecated từ 2019.
- **ESLint có 2 chế độ** — syntax-only (nhanh) và type-aware (bật `parserOptions.project`, bắt nhiều bug hơn như `no-floating-promises` nhưng chậm hơn).
- ⭐ **esbuild/swc/Bun chỉ strip type, KHÔNG type-check** — phải chạy `tsc --noEmit` riêng trong CI/pre-commit; sinh `.d.ts` bằng `tsup` hoặc `tsc --declaration`.
- **Test runner** — Vitest (khuyên dùng cho project mới), Jest, Bun test, Node test runner built-in (Node 20+).
- **Package hữu ích** — `type-fest`/`ts-toolbelt` (type utils), `zod` (validation de-facto), `tRPC`, `drizzle`/`prisma` → stack type-safe single source of truth.

:::

---

## Mục lục

- [Formatting (Prettier)](#formatting-prettier)
- [Linting (ESLint)](#linting-eslint)
- [Build Tools](#build-tools)
- [Test Runners](#test-runners)
- [Useful Packages](#useful-packages)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Formatting (Prettier)

[Prettier](https://prettier.io) là tool format code chuẩn — gần như mặc
định cho mọi project TS.

```bash
npm install --save-dev prettier
```

File `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

Chạy:

```bash
npx prettier --write "src/**/*.{ts,tsx}"
```

:::tip[Mẹo]

Bật **format on save** trong VSCode (`editor.formatOnSave: true`) + cài
extension Prettier. Code tự format mỗi lần lưu, không bao giờ phải nghĩ
về style.

:::

---

## Linting (ESLint)

[ESLint](https://eslint.org) — phát hiện lỗi logic, bad pattern, code
smell. **TSLint đã bị deprecated** từ 2019.

Setup cho TypeScript:

```bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

`eslint.config.js` (flat config, ESLint 9+):

```js
import tseslint from "typescript-eslint";

export default tseslint.config(
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
);
```

:::info[Phân tích]

ESLint cho TS hoạt động ở **hai chế độ**:

1. **Syntax-only** — chạy nhanh, không cần `tsc`. Chỉ check rule không
   phụ thuộc type.
2. **Type-aware** — bật `parserOptions.project: true`, cho phép rule
   dùng thông tin type. Bắt được nhiều bug hơn nhưng chậm hơn 5-10 lần.

Rule type-aware mạnh:

- `no-floating-promises` — phát hiện Promise chưa await.
- `no-misused-promises` — Promise dùng sai trong if/for.
- `strict-boolean-expressions` — cấm dùng truthy với nullable.
- `no-unsafe-assignment` / `no-unsafe-call` — chặn lan truyền `any`.

Trong CI nên chạy ESLint type-aware. Trong pre-commit hook nên dùng
phiên bản nhẹ để không chậm dev.

:::

---

## Build Tools

| Tool | Mục đích | Tốc độ |
|------|----------|--------|
| **tsc** | Compiler chính thức của TS | Chậm |
| **esbuild** | Bundler/transpiler viết bằng Go | Cực nhanh |
| **swc** | Compiler bằng Rust (Next.js dùng) | Cực nhanh |
| **Vite** | Dev server + build dùng esbuild/Rollup | Nhanh |
| **Webpack** | Bundler lâu đời, mạnh, chậm | Chậm |
| **Turbopack** | Successor của Webpack bằng Rust | Nhanh |
| **tsup** | Wrapper esbuild, sinh kèm `.d.ts` | Nhanh |
| **Bun** | Runtime + bundler + test runner | Cực nhanh |

:::warning[Cần lưu ý]

**esbuild / swc / Bun không type-check** — chúng chỉ **strip type** rồi
build. Lỗi type **không bị bắt** trong quá trình bundle.

→ Workflow đúng:

1. **Dev/build runtime**: dùng tool nhanh (Vite, esbuild, Bun).
2. **Type-check tách riêng**: `tsc --noEmit` trong CI và pre-commit.
3. **Sinh `.d.ts` cho thư viện**: dùng `tsup` hoặc `tsc --declaration`.

Đừng dựa vào esbuild/swc để phát hiện lỗi type — chúng không làm.

Sơ đồ dưới tóm tắt workflow tách bạch giữa build runtime nhanh và bước type-check riêng:

```mermaid
flowchart LR
    Src["Source .ts"] --> Fast["esbuild / swc / Bun<br/>strip type, build nhanh"]
    Fast --> Out["Bundle chạy được"]
    Src --> Check["tsc --noEmit<br/>(CI và pre-commit)"]
    Check --> Safe["Bắt lỗi type"]
    Src --> Dts["tsup hoặc tsc --declaration"]
    Dts --> DtsOut["Sinh .d.ts cho thư viện"]
```

:::

---

## Test Runners

| Runner | Đặc điểm |
|--------|----------|
| **Vitest** | API giống Jest, dùng Vite/esbuild → nhanh hơn nhiều |
| **Jest** | Chuẩn cũ, cộng đồng lớn, cần `ts-jest` hoặc `@swc/jest` |
| **Bun test** | Tích hợp sẵn trong Bun, cực nhanh |
| **Node test runner** | Built-in từ Node 20+, không cần cài |

Vitest setup (khuyên dùng cho project mới):

```bash
npm install --save-dev vitest
```

```ts
// math.test.ts
import { expect, test } from "vitest";
import { add } from "./math";

test("add", () => {
  expect(add(1, 2)).toBe(3);
});
```

```bash
npx vitest
```

---

## Useful Packages

**Type utilities:**

- [`type-fest`](https://github.com/sindresorhus/type-fest) — bộ utility
  type bổ sung (DeepReadonly, RequireAtLeastOne, Promisable...).
- [`ts-toolbelt`](https://github.com/millsp/ts-toolbelt) — utility cấp
  cao hơn, dùng cho type metaprogramming.

**Validation runtime:**

- [`zod`](https://zod.dev) — schema validation, infer type tự động.
  De-facto standard 2025+.
- [`valibot`](https://valibot.dev) — alternative cho Zod, tree-shakeable
  hơn.
- [`io-ts`](https://github.com/gcanti/io-ts) — functional style.

**HTTP / API:**

- [`trpc`](https://trpc.io) — end-to-end type-safe API, không cần code
  gen.
- [`hono`](https://hono.dev) — framework web siêu nhẹ, type-safe.

**ORM:**

- [`drizzle-orm`](https://orm.drizzle.team) — SQL builder type-safe,
  lightweight, không decorator.
- [`prisma`](https://www.prisma.io) — ORM phổ biến với schema riêng.

:::tip[Mẹo]

**Bộ "starter kit" type-safe** hiện đại cho project mới (2026):

- Framework: **Next.js** hoặc **Hono**.
- ORM: **Drizzle**.
- Validation: **Zod**.
- API layer: **tRPC**.
- Form: **react-hook-form** + **Zod resolver**.
- Linter: **ESLint type-aware**.
- Formatter: **Prettier** (hoặc **Biome** thay cho cả ESLint + Prettier).
- Build: **Vite** / **Next** (Turbopack) / **Bun**.
- Test: **Vitest**.

Stack này tận dụng tối đa type system của TS — single source of truth
từ DB → API → form, không phải duy trì type ở nhiều tầng.

:::

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi đối chiếu lại với nội dung phía trên.

1. Formatter và linter khác nhau ở vai trò gì? Vì sao một dự án nghiêm túc thường dùng cả Prettier lẫn ESLint chứ không chỉ một?
2. `TSLint` hiện còn dùng được không? Nếu tiếp quản một codebase cũ còn `tslint.json`, bạn di trú sang `typescript-eslint` theo các bước nào?
3. ESLint flat config (`eslint.config.js`, ESLint 9+) khác `.eslintrc` ở điểm nào? Cấu hình `typescript-eslint` trong flat config ra sao?
4. ESLint cho TypeScript có hai chế độ syntax-only và type-aware. Bật type-aware bằng cách nào và đánh đổi về hiệu năng là gì?
5. Nêu vài rule chỉ chạy được ở chế độ type-aware (ví dụ `no-floating-promises`, `no-misused-promises`) và giải thích chúng bắt được lớp bug nào mà syntax-only bỏ sót.
6. ESLint có thay thế được `tsc` trong việc bắt lỗi type không? Vì sao?
7. Trong CI và trong pre-commit hook, bạn cấu hình lint/type-check khác nhau thế nào để vừa an toàn vừa không làm chậm dev?
8. Vì sao esbuild, swc và Bun build cực nhanh nhưng lại **không** type-check? Giải thích cơ chế transpile từng file (single-file transform) đứng sau điều đó.
9. Mô tả workflow chuẩn khi dùng Vite hoặc Next.js: bước nào lo runtime, bước nào lo type-check, và `tsc --noEmit` đặt ở đâu?
10. Khi publish một thư viện TypeScript lên npm, bạn sinh file `.d.ts` bằng cách nào? So sánh `tsup` với `tsc --declaration`, và nêu vai trò của trường `types`/`exports` trong `package.json`.
11. So sánh `tsc`, `esbuild`, `swc`, `Vite`, `Webpack`, `Turbopack` và `tsup` theo mục đích sử dụng. Với một CLI Node nội bộ và với một app web lớn, bạn chọn gì?
12. Muốn chạy trực tiếp một file `.ts` không qua bước build thì dùng gì? So sánh `ts-node`, `tsx` và `bun run` về tốc độ, khả năng type-check và hỗ trợ ESM.
13. `DefinitelyTyped` và các package `@types/...` hoạt động thế nào? Khi nào một thư viện không cần `@types` nữa, và bạn xử lý ra sao khi `@types` lệch phiên bản với thư viện?
14. So sánh Vitest, Jest, Bun test và Node test runner built-in. Nếu dự án đang dùng Vite thì vì sao Vitest thường là lựa chọn hợp lý?
15. Chạy Jest với TypeScript có những cách nào? So sánh `ts-jest` và `@swc/jest` về tốc độ và khả năng bắt lỗi type trong test.
16. Type của TypeScript biến mất lúc runtime, vậy dữ liệu từ API hay form được đảm bảo đúng kiểu bằng cách nào? Vai trò của `zod`/`valibot` và ý nghĩa của việc infer type từ schema.
17. So sánh `zod` và `valibot`. Khi nào kích thước bundle khiến bạn chọn cái tree-shakeable hơn?
18. "Type-safe end-to-end" nghĩa là gì trong stack `tRPC` + `drizzle`/`prisma` + `zod`? Nó khác cách sinh type từ OpenAPI/GraphQL codegen ở điểm nào?
19. `Biome` định vị ở đâu so với ESLint + Prettier? Nêu lý do chọn và lý do chưa nên chuyển sang nó.
20. Khi `tsc` chạy ngày càng chậm trên codebase lớn, bạn tối ưu bằng những cách nào? Nhắc tới `incremental`, `skipLibCheck`, project references và cách chia package.
21. `type-fest` và `ts-toolbelt` giải quyết nhu cầu gì? Cho ví dụ một utility type bạn từng cần nhưng TypeScript không có sẵn.
