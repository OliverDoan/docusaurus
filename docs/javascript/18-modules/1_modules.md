---
sidebar_position: 1
title: "1. Modules: CommonJS vs ES Modules"
---

# Modules: CommonJS vs ES Modules

**Module** (mô-đun — một file code độc lập có thể chia sẻ cho file khác) giúp bạn tách chương trình thành nhiều phần nhỏ, mỗi phần lo một việc và có thể tái sử dụng. JavaScript có hai cách viết module phổ biến: **CommonJS** (chuẩn cũ dùng `require` và `module.exports`, thường gặp trong Node.js) và **ES Modules** (chuẩn hiện đại dùng `import` và `export`). Bài này giúp người mới hiểu vì sao cần chia code thành module và khác biệt giữa hai chuẩn này.

---

## Mục lục

- [Lịch sử module trong JS](#lịch-sử-module-trong-js)
- [CommonJS (CJS)](#commonjs-cjs)
- [ES Modules (ESM)](#es-modules-esm)
- [Default vs Named export](#default-vs-named-export)
- [Dynamic import](#dynamic-import)
- [Interop CJS và ESM](#interop-cjs-và-esm)

---

## Lịch sử module trong JS

JavaScript ban đầu **không có module** — mọi file share global namespace.

Các giải pháp lần lượt:

- **CommonJS** (2009) — chuẩn của Node.js (`require`/`module.exports`).
- **AMD** (2011) — async loading cho browser (RequireJS).
- **UMD** (2014) — tương thích cả CJS và AMD.
- **ES Modules** (2015) — chuẩn chính thức của ECMAScript.

Năm 2026, **ES Modules thắng**. CommonJS vẫn dùng trong Node legacy.

---

## CommonJS (CJS)

Cú pháp của Node.js cổ điển:

```js
// math.js
function add(a, b) { return a + b; }
const PI = 3.14;

module.exports = { add, PI };
// hoặc
exports.add = add;
exports.PI = PI;
```

```js
// app.js
const { add, PI } = require("./math");
const math = require("./math");

add(1, 2);
math.PI;
```

Đặc điểm:

- **Đồng bộ** — `require` chặn thread đến khi load xong.
- **Dynamic** — `require()` chạy tại runtime, có thể conditional.
- **Có cached** — module chỉ load 1 lần.

---

## ES Modules (ESM)

Cú pháp chuẩn từ ES6:

```js
// math.js
export function add(a, b) { return a + b; }
export const PI = 3.14;

export default function multiply(a, b) { return a * b; }
```

```js
// app.js
import multiply, { add, PI } from "./math.js";
import * as math from "./math.js";

add(1, 2);
math.PI;
```

Đặc điểm:

- **Static** — `import`/`export` phải ở top-level, không trong `if`/`for`.
- **Async** — module được parse trước, load song song.
- **Strict mode** mặc định.
- **Live binding** — export là tham chiếu live, không phải copy.

:::info[Phân tích]

**Live binding** là khác biệt lớn so với CJS:

```js
// counter.mjs (ESM)
export let count = 0;
export function inc() { count++; }
```

```js
// app.mjs
import { count, inc } from "./counter.mjs";
console.log(count); // 0
inc();
console.log(count); // 1 — thay đổi reflect ngay
```

Trong CJS, value được **copy** khi require:

```js
// counter.cjs
let count = 0;
function inc() { count++; }
module.exports = { count, inc };
```

```js
// app.cjs
const { count, inc } = require("./counter.cjs");
inc();
console.log(count); // 0 — copy lúc require, không update
```

→ Khi cần share state qua module, ESM rõ ràng hơn. Hoặc dùng object
wrapper trong CJS.

:::

---

## Default vs Named export

**Named export** — đặt tên cụ thể:

```js
// utils.js
export const PI = 3.14;
export function add(a, b) { return a + b; }
export class Calc {}
```

```js
import { PI, add, Calc } from "./utils.js";
import { PI as Constant } from "./utils.js"; // rename
import * as utils from "./utils.js";
```

**Default export** — một export duy nhất, không tên:

```js
// User.js
export default class User {}
```

```js
import User from "./User.js";       // tên do caller chọn
import MyUser from "./User.js";     // OK luôn
```

Có thể trộn cả hai:

```js
// api.js
export default fetch;
export const BASE_URL = "/api";
export function get(url) {}
```

```js
import fetch, { BASE_URL, get } from "./api.js";
```

:::warning[Cần lưu ý]

**Default export không tốt khi nào?**

- **Rename không nhất quán** — mỗi file dùng tên khác → khó grep.
- **Refactor khó hơn** — đổi tên class/function không tự sync vào caller.
- **Re-export verbose hơn**:

```js
// Named — gọn
export { default as Button } from "./Button.js";
export * from "./utils.js";

// Default — phải gán tên lại
export { default as Header } from "./Header.js";
```

Nhiều style guide (Airbnb, Google) khuyên **tránh default export**.
Riêng React component, default export vẫn phổ biến vì 1 component / file.

Quy tắc thực dụng:

- Library/util — **named** (lib có nhiều export).
- Component/class chính của file — **default**.
- Nhất quán trong codebase.

:::

---

## Dynamic import

`import()` trả Promise — load module **runtime**:

```js
async function loadLodash() {
  const { default: _ } = await import("lodash");
  return _;
}

// Code splitting trong React
const LazyComponent = React.lazy(() => import("./Heavy.js"));
```

Conditional:

```js
if (userWantsAdvancedMode) {
  const { advancedFeature } = await import("./advanced.js");
  advancedFeature();
}
```

`import.meta` — metadata về module hiện tại:

```js
console.log(import.meta.url);   // URL của file
console.log(import.meta.env);   // env vars (Vite, Bun)
```

---

## Interop CJS và ESM

Vấn đề: 80% npm package từng là CJS, chuyển dần sang ESM.

Trong Node.js, **`package.json`** quyết định module format:

```json
{
  "type": "module"  // file .js → ESM
}
```

Hoặc dùng đuôi rõ ràng:

- `.mjs` — ESM
- `.cjs` — CommonJS
- `.js` — theo `"type"` trong `package.json`

**Import CJS từ ESM** — thường OK:

```js
import express from "express";       // default
import { Router } from "express";    // có thể không hoạt động
```

**Import ESM từ CJS** — **chỉ qua dynamic import**:

```js
// app.cjs
const lib = await import("esm-only-lib"); // OK
const lib = require("esm-only-lib"); // ERR_REQUIRE_ESM
```

:::info[Phân tích]

**ERR_REQUIRE_ESM** là lỗi gặp khi:

1. Package mới publish chỉ ESM (vd `node-fetch` v3, `chalk` v5).
2. Code bạn vẫn CJS.

Cách xử lý:

**1. Migrate sang ESM** (khuyến nghị):

```json
// package.json
{ "type": "module" }
```

Phải đổi: `require` → `import`, `__dirname` → `import.meta.url`, etc.

**2. Pin version cũ của package**:

```bash
npm install chalk@4  # CJS-compatible
```

**3. Dynamic import trong CJS**:

```js
async function main() {
  const { default: chalk } = await import("chalk");
  console.log(chalk.red("error"));
}
```

Node.js 22+ có **`--experimental-require-module`** cho phép `require()`
ESM trong một số trường hợp. Đang dần ổn định trong các bản gần đây.

:::

:::tip[Mẹo]

**Cho project mới năm 2026 — luôn ESM**:

```json
{
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
}
```

Tránh CJS trừ khi:
- Maintain library cũ.
- Target Node version rất cũ (≤ 12).

Bundler hiện đại (Vite, esbuild, Rollup) đều output cả ESM và CJS nếu
publish thư viện — đảm bảo tương thích cả hai phía.

:::
