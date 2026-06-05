---
sidebar_position: 3
title: "3. JavaScript Versions"
---

# JavaScript Versions

JavaScript có nhiều phiên bản (version) được phát hành qua từng năm, mỗi bản bổ sung thêm tính năng mới giúp viết code gọn và mạnh hơn. Các phiên bản này được đặt tên theo chuẩn **ECMAScript** (viết tắt ES, ví dụ ES6 / ES2015). Người mới nên nắm khái niệm này để hiểu vì sao một số cú pháp chỉ chạy được trên phiên bản mới.

---

## Mục lục

- [ECMAScript vs JavaScript](#ecmascript-vs-javascript)
- [Các phiên bản đáng nhớ](#các-phiên-bản-đáng-nhớ)
- [ES6 — bước ngoặt](#es6--bước-ngoặt)
- [Tính năng phổ biến từ ES2017+](#tính-năng-phổ-biến-từ-es2017)

---

## ECMAScript vs JavaScript

- **ECMAScript (ES)** là **chuẩn**, mô tả ngôn ngữ trên giấy.
- **JavaScript** là **implementation** chuẩn đó, do trình duyệt và
  Node.js triển khai.

Nói "ES6" hay "ES2015" đều chỉ cùng một phiên bản tiêu chuẩn.

---

## Các phiên bản đáng nhớ

| Phiên bản | Năm | Tính năng nổi bật |
|-----------|-----|-------------------|
| ES5 | 2009 | `strict mode`, JSON, array method |
| ES6 / ES2015 | 2015 | `let`, `const`, arrow, class, Promise, module |
| ES2016 | 2016 | `**` toán tử, `Array.prototype.includes` |
| ES2017 | 2017 | `async`/`await`, `Object.entries`, `Object.values` |
| ES2018 | 2018 | Rest/spread cho object, `for await...of` |
| ES2019 | 2019 | `Array.flat`, `Object.fromEntries`, optional catch |
| ES2020 | 2020 | `?.`, `??`, `BigInt`, dynamic `import()` |
| ES2021 | 2021 | `String.replaceAll`, logical assignment `??=` `\|\|=` `&&=` |
| ES2022 | 2022 | Top-level `await`, `#field` private, `at()` |
| ES2023 | 2023 | `Array.findLast`, `toSorted` (immutable methods) |
| ES2024 | 2024 | `Object.groupBy`, Promise.withResolvers |

---

## ES6 — bước ngoặt

ES6 (2015) là phiên bản **thay đổi cách viết JS** mạnh nhất. So sánh:

**Trước ES6 (ES5):**

```js
var add = function (a, b) {
  return a + b;
};

var users = [{ name: "An" }, { name: "Bình" }];
var names = users.map(function (u) {
  return u.name;
});

function Person(name) {
  this.name = name;
}
Person.prototype.greet = function () {
  return "Hi " + this.name;
};
```

**Từ ES6:**

```js
const add = (a, b) => a + b;

const users = [{ name: "An" }, { name: "Bình" }];
const names = users.map(u => u.name);

class Person {
  constructor(name) {
    this.name = name;
  }
  greet() {
    return `Hi ${this.name}`;
  }
}
```

Các feature lớn của ES6:

- `let`, `const` — thay thế `var`.
- Arrow function — cú pháp ngắn + `this` lexical.
- Template literals — `` `hello ${name}` ``.
- Destructuring — `const { x, y } = obj`.
- Default + rest + spread parameters.
- Class — sugar cho prototype.
- Promise — thay callback hell.
- ES Modules — `import`/`export`.
- `Map`, `Set`, `Symbol`, `Iterator`.

---

## Tính năng phổ biến từ ES2017+

**Async/await (ES2017)** — biến Promise thành code đồng bộ:

```js
async function loadUser(id) {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
}
```

**Optional chaining `?.` (ES2020)** — truy cập an toàn:

```js
const city = user?.address?.city;
```

**Nullish coalescing `??` (ES2020)** — fallback chỉ khi `null`/`undefined`:

```js
const port = config.port ?? 3000; // không nhầm với 0
```

**Logical assignment (ES2021):**

```js
a ||= b; // a = a || b
a ??= b; // a = a ?? b
a &&= b; // a = a && b
```

**Top-level await (ES2022)** — `await` ngoài hàm async, chỉ trong ES Module:

```js
// module.js
const data = await fetch("/api").then(r => r.json());
export { data };
```

:::info[Phân tích]

**Tương thích trình duyệt** là điều luôn cần kiểm tra trước khi dùng
feature mới. Các công cụ chính:

- **caniuse.com** — tra cứu feature theo trình duyệt.
- **compat-table.github.io** — table chi tiết của TC39.
- **MDN Browser Compatibility** — phần "Browser compatibility" cuối mỗi
  trang.

Trong production, dùng **Babel** hoặc **SWC** để **transpile** code ES
mới về ES5 nếu cần hỗ trợ trình duyệt cũ:

```bash
npm install --save-dev @babel/core @babel/preset-env
```

Hoặc dùng **target option** trong `tsconfig.json` / Vite config để bundler
tự xử lý:

```json
{ "target": "ES2020" }
```

Năm 2026, **ES2020 là baseline an toàn** cho mọi trình duyệt hiện đại
(Chrome, Firefox, Safari, Edge — đã loại IE từ 2022).

:::

:::tip[Mẹo]

Khi học JS hiện đại, **bỏ qua tài liệu cũ trước 2017**. Đa số "best
practice" thời ES5 đã lỗi thời:

- `IIFE` để tạo scope → không cần với `let`/`const` + module.
- `Object.assign` → spread `{ ...obj }` ngắn hơn.
- Callback pattern → Promise + async/await.

Đọc **MDN** và **You Don't Know JS Yet (2nd edition)** thay vì các blog
cũ là cách nhanh nhất để học JS chuẩn.

:::
