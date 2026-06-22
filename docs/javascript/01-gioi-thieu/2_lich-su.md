---
sidebar_position: 2
title: "2. Lịch sử & các phiên bản JavaScript"
---

# Lịch sử & các phiên bản JavaScript

Bài này kể lại hành trình của JavaScript: từ lúc ra đời chỉ trong 10 ngày năm 1995, qua "cuộc chiến trình duyệt" (browser war), đến khi được chuẩn hoá thành **ECMAScript** (bản tiêu chuẩn chính thức của ngôn ngữ), bùng nổ nhờ **Node.js** và liên tục thêm phiên bản mới qua từng năm. Hiểu lịch sử và cách đánh số phiên bản giúp người mới biết vì sao JavaScript có nhiều cách viết khác nhau, vì sao một số cú pháp chỉ chạy được trên bản mới, và tại sao nó lại quan trọng đến vậy ngày nay.

---

## Mục lục

- [Khởi nguồn](#khởi-nguồn)
- [Cuộc chiến trình duyệt](#cuộc-chiến-trình-duyệt)
- [ECMAScript ra đời](#ecmascript-ra-đời)
- [ECMAScript vs JavaScript](#ecmascript-vs-javascript)
- [Các phiên bản đáng nhớ](#các-phiên-bản-đáng-nhớ)
- [ES6 — bước ngoặt](#es6--bước-ngoặt)
- [Tính năng phổ biến từ ES2017+](#tính-năng-phổ-biến-từ-es2017)
- [Bước ngoặt Node.js](#bước-ngoặt-nodejs)
- [JavaScript ngày nay](#javascript-ngày-nay)

---

## Khởi nguồn

Năm **1995**, **Brendan Eich** tại Netscape được giao nhiệm vụ tạo
ngôn ngữ kịch bản cho trình duyệt **Netscape Navigator**. Ông hoàn thành
prototype đầu tiên trong **10 ngày**.

> **Prototype** (bản mẫu) là một **phiên bản thử nghiệm sơ khai** của sản phẩm, làm nhanh để chạy thử và chứng minh ý tưởng khả thi — chưa hoàn chỉnh, còn thiếu tính năng. Ở đây nghĩa là Brendan Eich dựng được bản JavaScript chạy được đầu tiên chỉ trong 10 ngày, rồi mới hoàn thiện dần sau đó. (Lưu ý: từ này khác với khái niệm *prototype* trong cơ chế kế thừa của JavaScript.)

Tên ngôn ngữ qua các giai đoạn:

- **Mocha** (tên nội bộ ban đầu).
- **LiveScript** (tháng 5/1995).
- **JavaScript** (tháng 12/1995, marketing ăn theo Java).

---

## Cuộc chiến trình duyệt

"Cuộc chiến trình duyệt" (browser war) là giai đoạn cuối thập niên 1990,
khi **Netscape** và **Microsoft** đua nhau giành thị phần trình duyệt
bằng cách tự thêm tính năng riêng — thay vì cùng theo một chuẩn.

Diễn biến chính:

- **1995**: Netscape Navigator thống trị, đi kèm **JavaScript**.
- **1996**: Microsoft tung **Internet Explorer** kèm **JScript** — một
  bản "clone" JavaScript (vì JS là của Netscape, Microsoft không được
  dùng đúng tên).
- Hai hãng liên tục thêm tính năng độc quyền chỉ chạy trên trình duyệt
  của mình, không thèm tương thích với nhau.

Hệ quả với dev web:

- Cùng một đoạn code chạy **khác nhau** (hoặc lỗi) trên IE và Netscape.
- Phải viết code **rẽ nhánh** kiểu "nếu là IE thì làm thế này, nếu là
  Netscape thì làm thế kia" → tốn công, dễ lỗi.
- Xuất hiện huy hiệu **"Best viewed in Internet Explorer"** trên nhiều
  website — dấu hiệu của sự phân mảnh.

→ Cần một **chuẩn chung** để các trình duyệt cùng tuân thủ, dẫn tới sự
ra đời của **ECMAScript** (mục bên dưới).

:::info[Phân tích]

Microsoft cuối cùng **thắng cuộc chiến thứ nhất**: IE đạt ~95% thị phần
đầu những năm 2000 sau khi được nhúng sẵn vào Windows. Nhưng việc IE
"đứng yên không cải tiến" suốt nhiều năm sau đó lại mở đường cho
**Firefox** (2004) và **Chrome** (2008) — châm ngòi cho **cuộc chiến
trình duyệt lần hai**. Bài học còn nguyên giá trị: **đứng ngoài chuẩn
chung** giúp thắng ngắn hạn nhưng gây hại lâu dài cho cả hệ sinh thái.

:::

---

## ECMAScript ra đời

Năm **1997**, Netscape gửi JS lên **ECMA International** để chuẩn hoá.
Chuẩn được đặt tên là **ECMAScript (ES)** — vì "JavaScript" là trademark
của Sun/Oracle.

> **ECMA International** là một **tổ chức tiêu chuẩn quốc tế** (lập năm 1961, trụ sở tại Geneva, Thụy Sĩ), chuyên xây dựng các chuẩn cho công nghệ thông tin và truyền thông. "Chuẩn hoá" nghĩa là tổ chức này đặt ra **bộ quy tắc chung** để mọi trình duyệt cùng tuân theo, nhờ vậy cùng một đoạn code JavaScript chạy giống nhau ở Chrome, Firefox, Safari... Ngoài JavaScript (ECMAScript), ECMA còn chuẩn hoá nhiều công nghệ khác như JSON, C#, Dart.

:::info[Phân tích]

Từ **ES2015 trở đi**, ECMAScript phát hành **theo năm** thay vì đánh số
phiên bản lớn. Lý do: cộng đồng quá lớn, không thể chờ "big release"
mỗi 6 năm như ES6 — phải có release đều đặn để theo kịp nhu cầu.

Mỗi feature phải qua **5 stage** của TC39 (committee chuẩn):

- **Stage 0**: Strawperson (ý tưởng).
- **Stage 1**: Proposal (đã có champion).
- **Stage 2**: Draft (cú pháp ổn định).
- **Stage 3**: Candidate (chuẩn bị merge).
- **Stage 4**: Finished (vào spec năm sau).

Stage 3 là điểm các trình duyệt và Babel/SWC bắt đầu implement. Khi
đọc proposal trên https://github.com/tc39/proposals biết stage là biết
được khi nào dùng được trong production.

:::

---

## ECMAScript vs JavaScript

Đây là hai khái niệm hay bị nhầm:

- **ECMAScript (ES)** là **chuẩn**, mô tả ngôn ngữ trên giấy.
- **JavaScript** là **implementation** (bản triển khai) chuẩn đó, do
  trình duyệt và Node.js thực hiện.

Nói "ES6" hay "ES2015" đều chỉ cùng một phiên bản tiêu chuẩn.

---

## Các phiên bản đáng nhớ

| Phiên bản | Năm | Tính năng nổi bật |
|-----------|-----|-------------------|
| ES1 | 1997 | Phiên bản đầu tiên |
| ES3 | 1999 | RegExp, try/catch — chuẩn ổn định lâu dài |
| ES5 | 2009 | `strict mode`, `JSON`, array method (map, filter, reduce) |
| **ES6 / ES2015** | 2015 | `let`/`const`, arrow function, class, Promise, module — **cuộc cách mạng** |
| ES2016 | 2016 | `**` toán tử, `Array.prototype.includes` |
| ES2017 | 2017 | `async`/`await`, `Object.entries`, `Object.values` |
| ES2018 | 2018 | Rest/spread cho object, `for await...of` |
| ES2019 | 2019 | `Array.flat`, `Object.fromEntries`, optional catch |
| ES2020 | 2020 | `?.` optional chaining, `??` nullish coalescing, `BigInt`, dynamic `import()` |
| ES2021 | 2021 | `String.replaceAll`, logical assignment `??=` `\|\|=` `&&=` |
| ES2022 | 2022 | Top-level `await`, `#field` private, `at()` |
| ES2023 | 2023 | `Array.findLast`, `toSorted` (immutable methods) |
| ES2024 | 2024 | `Object.groupBy`, `Promise.withResolvers` |

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

---

## Bước ngoặt Node.js

Năm **2009**, **Ryan Dahl** tạo **Node.js** — JS chạy **ngoài trình
duyệt**, dùng engine V8. Đây là bước ngoặt biến JS từ ngôn ngữ "đồ
chơi cho web" thành ngôn ngữ **fullstack**.

```bash
# Chạy JS không cần trình duyệt
node script.js
```

Hệ quả:

- **npm** (2010) trở thành package manager lớn nhất thế giới.
- Developer có thể viết cả frontend + backend bằng cùng một ngôn ngữ.
- Hệ sinh thái build tool (Webpack, Babel, esbuild...) nở rộ.

---

## JavaScript ngày nay

JavaScript là ngôn ngữ **phổ biến nhất** trên StackOverflow Survey hơn
10 năm liền. Phạm vi hiện tại:

- **Web frontend**: React, Vue, Svelte, Solid.
- **Web backend**: Node.js, Bun, Deno, NestJS.
- **Mobile**: React Native, Ionic.
- **Desktop**: Electron (VS Code, Discord, Slack, Figma...).
- **Edge computing**: Cloudflare Workers, Vercel Edge.
- **AI/ML**: TensorFlow.js, transformers.js.

:::tip[Mẹo]

Khi đọc tài liệu cũ, nếu thấy "ES5 code", "Pre-ES6 syntax" — hiểu rằng
đó là code **trước 2015**: dùng `var`, không có arrow function,
template string... Code hiện đại nên ở **ES2020+** trở lên, vì các
trình duyệt phổ biến đều đã hỗ trợ native.

Ngoài ra, đa số "best practice" thời ES5 đã lỗi thời:

- `IIFE` để tạo scope → không cần với `let`/`const` + module.
- `Object.assign` → spread `{ ...obj }` ngắn hơn.
- Callback pattern → Promise + async/await.

Đọc **MDN** và **You Don't Know JS Yet (2nd edition)** thay vì các blog
cũ là cách nhanh nhất để học JS chuẩn.

:::
