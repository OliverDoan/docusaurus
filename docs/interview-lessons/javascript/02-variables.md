---
sidebar_position: 2
title: "✅ 2. Variables"
---

# ✅ 2. Variables

## 1. Khai báo biến: var, let, const

Bài học: [1. Khai báo biến: var, let, const](../../javascript/02-variables/1_khai-bao-bien.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. JavaScript có mấy cách khai báo biến? So sánh `var`, `let`, `const` theo scope, hoisting, khả năng gán lại và TDZ.**

<details className="qa">
<summary>Xem đáp án</summary>

JavaScript có **3 từ khoá** khai báo biến: `var` (từ thời đầu) cùng `let` và `const` (thêm từ ES6/2015).

| Từ khoá | Scope        | Hoisting                              | Gán lại   | TDZ    |
| ------- | ------------ | ------------------------------------- | --------- | ------ |
| `var`   | **Function** | Có — khởi tạo sẵn giá trị `undefined` | Có        | Không  |
| `let`   | **Block**    | Có — nhưng chưa khởi tạo (TDZ)        | Có        | **Có** |
| `const` | **Block**    | Có — nhưng chưa khởi tạo (TDZ)        | **Không** | **Có** |

Vài điểm bổ sung:

- `var` cho phép **khai báo lại** cùng tên không báo lỗi; `let`/`const` khai báo lại trong cùng scope là `SyntaxError`.
- `const` **bắt buộc gán giá trị ngay** lúc khai báo; `let` thì không (mặc định `undefined`).
- `const` chỉ chặn **gán lại biến**, không làm giá trị bên trong bất biến.

Quy tắc thực hành hiện đại: mặc định `const`, cần gán lại mới dùng `let`, không dùng `var` trong code mới.

</details>

**2. Phân biệt `function scope` và `block scope`. Cho ví dụ code mà `var` "lọt" ra ngoài khối `if` còn `let` thì không.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Function scope**: biến sống trong toàn bộ hàm chứa nó, bất kể được khai báo bên trong khối `{}` nào. Đây là cách `var` hoạt động.
- **Block scope**: biến chỉ sống trong cặp `{}` gần nhất — thân `if`, `for`, `while`, hay khối `{}` trơn. Đây là cách `let`/`const` hoạt động.

```js
function test() {
  if (true) {
    var x = 10;
    let y = 20;
  }
  console.log(x); // 10 — var "lọt" ra ngoài khối if
  console.log(y); // ReferenceError: y is not defined
}
```

`var x` tuy viết bên trong `if` nhưng thực chất thuộc về cả hàm `test`, nên vẫn truy cập được sau khối. `let y` thì "chết" ngay khi ra khỏi `{}`.

Vì sao block scope tốt hơn: biến chỉ tồn tại đúng nơi cần dùng, giảm nguy cơ ghi đè nhầm biến cùng tên ở chỗ khác, và giúp bộ nhớ được giải phóng sớm hơn. Đây là lý do chính khiến `var` bị xem là nguồn bug.

</details>

**3. Khai báo lại cùng một tên biến hai lần với `var`, với `let`, với `const` — mỗi trường hợp cho kết quả gì?**

<details className="qa">
<summary>Xem đáp án</summary>

```js
// var — hợp lệ, không báo lỗi gì
var name = "An";
var name = "Bình"; // OK, name === "Bình"

// let — lỗi cú pháp
let age = 20;
let age = 30; // SyntaxError: Identifier 'age' has already been declared

// const — cũng lỗi cú pháp
const PI = 3.14;
const PI = 3.15; // SyntaxError: Identifier 'PI' has already been declared
```

Lưu ý quan trọng: `SyntaxError` ở đây được phát hiện **lúc parse**, trước khi bất kỳ dòng nào chạy — nên cả file không chạy được, kể cả `console.log` ở dòng đầu tiên.

Việc `var` cho phép khai báo lại là một nguồn bug kinh điển: trong một hàm dài, bạn vô tình khai báo lại một biến đã tồn tại và ghi đè nó mà không nhận được cảnh báo nào. `let`/`const` báo lỗi ngay, giúp phát hiện xung đột tên sớm.

Cũng cần phân biệt: khai báo lại trong **scope khác** (ví dụ khối lồng bên trong) thì hợp lệ với cả ba — đó là **shadowing**, không phải khai báo lại.

</details>

**4. `const` có nghĩa là giá trị bất biến (`immutable`) không? Giải thích bằng ví dụ với object và array.**

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** `const` chỉ đảm bảo **binding không đổi** — tức là tên biến luôn trỏ tới cùng một giá trị, không thể gán lại. Nó **không** khoá nội dung bên trong của giá trị đó.

Với kiểu nguyên thủy (number, string...) thì điều này trông giống như bất biến, vì bản thân giá trị nguyên thủy vốn đã bất biến. Nhưng với object và array thì khác hẳn:

```js
const user = { name: "An" };
user.name = "Bình"; // OK — sửa property
user.age = 25; // OK — thêm property
user = {}; // TypeError: Assignment to constant variable

const arr = [1, 2, 3];
arr.push(4); // OK — [1, 2, 3, 4]
arr[0] = 99; // OK
arr = []; // TypeError
```

Cách hiểu đúng: biến `const` giống một cái hộp bị dán niêm phong — bạn không đổi được **cái hộp** (địa chỉ tham chiếu), nhưng vẫn thò tay vào sắp xếp lại **đồ bên trong**.

Muốn bất biến thật sự thì cần `Object.freeze()` hoặc thư viện chuyên dụng.

</details>

**5. Làm sao để thực sự khoá một object không cho sửa? `Object.freeze()` có hạn chế gì và khắc phục ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng **`Object.freeze()`** — nó chặn thêm, xóa và sửa property của object:

```js
const config = Object.freeze({ url: "/api" });
config.url = "x"; // Silently fail (ở strict mode: TypeError)
console.log(config.url); // "/api"
```

**Hạn chế lớn nhất: `Object.freeze` chỉ là shallow (nông)** — nó chỉ khoá tầng ngoài cùng, object lồng bên trong vẫn sửa được:

```js
const cfg = Object.freeze({ db: { host: "localhost" } });
cfg.db.host = "remote"; // vẫn sửa được!
console.log(cfg.db.host); // "remote"
```

Hạn chế khác: ở **non-strict mode** việc gán bị thất bại **im lặng**, không báo lỗi gì — rất khó phát hiện bug.

**Cách khắc phục:**

- Viết hàm **deep freeze** đệ quy: duyệt mọi property là object rồi `freeze` từng cái.
- Dùng thư viện chuyên dụng: **Immer** (viết code như đang mutate nhưng tạo ra bản sao bất biến), **Immutable.js** (cấu trúc dữ liệu bất biến).
- Luôn bật **strict mode** (ES Module mặc định strict) để mọi vi phạm ném `TypeError` thay vì im lặng.

</details>

**6. `Temporal Dead Zone (TDZ)` là gì? Nó bắt đầu và kết thúc ở đâu trong một block?**

<details className="qa">
<summary>Xem đáp án</summary>

**TDZ (Temporal Dead Zone — vùng chết tạm thời)** là khoảng thời gian mà một biến `let`/`const` **đã được tạo ra nhưng chưa được khởi tạo**. Truy cập biến trong khoảng này ném `ReferenceError`.

- **Bắt đầu**: ngay tại **đầu block** chứa khai báo (không phải đầu file).
- **Kết thúc**: tại **dòng khai báo** được thực thi và giá trị được gán xong.

```js
{
  // ── TDZ của x bắt đầu từ đây ──
  console.log(x); // ReferenceError: Cannot access 'x' before initialization
  let x = 10; // ── TDZ kết thúc tại đây ──
  console.log(x); // 10
}
```

So sánh với `var` — được hoisting **kèm khởi tạo `undefined`** nên không có TDZ:

```js
console.log(y); // undefined — không lỗi
var y = 10;
```

Điểm cần nhớ: `let`/`const` **cũng được hoisting** (engine biết chúng tồn tại từ đầu block), chỉ khác là không được khởi tạo sẵn. Ý nghĩa của TDZ là **phát hiện sớm bug** dùng biến trước khi khai báo — thay vì âm thầm nhận `undefined` rồi lỗi ở chỗ khác khó truy.

</details>

**7. Đoán output và giải thích: `console.log(a); var a = 1;` so với `console.log(b); let b = 1;`**

<details className="qa">
<summary>Xem đáp án</summary>

```js
console.log(a); // undefined
var a = 1;

console.log(b); // ReferenceError: Cannot access 'b' before initialization
let b = 1;
```

**Vì sao khác nhau:** cả `var` lẫn `let` đều được **hoisting** — engine ghi nhận sự tồn tại của biến ngay khi vào scope. Khác biệt nằm ở **bước khởi tạo**:

- `var a` được hoisting **kèm khởi tạo giá trị `undefined`**. Nên lúc `console.log(a)` chạy, biến đã tồn tại và có giá trị `undefined` → in ra `undefined`, không lỗi.
- `let b` được hoisting nhưng **chưa khởi tạo** — nó nằm trong **TDZ**. Truy cập biến ở trạng thái này ném `ReferenceError`.

Chú ý thông điệp lỗi: `"Cannot access 'b' before initialization"` khác với `"b is not defined"`. Câu đầu nghĩa là biến **có tồn tại** nhưng chưa khởi tạo (TDZ); câu sau nghĩa là biến **không hề được khai báo**.

Hành vi `undefined` im lặng của `var` chính là thứ TDZ sinh ra để khắc phục.

</details>

**8. Vì sao `typeof` với một biến chưa hề khai báo trả về `"undefined"` nhưng `typeof` với biến `let` đang trong TDZ lại ném `ReferenceError`?**

<details className="qa">
<summary>Xem đáp án</summary>

```js
typeof undeclared; // "undefined" — an toàn
typeof x; // ReferenceError — TDZ
let x = 1;
```

**Với biến chưa khai báo:** `typeof` được đặc cách trong spec — đây là một ngoại lệ có từ thời JS sơ khai, cố ý cho phép kiểm tra sự tồn tại của biến mà không gây lỗi. Nó vốn được dùng để **feature detection** (`if (typeof someGlobal !== "undefined")`) khi chưa có API kiểm tra nào tốt hơn.

**Với biến `let` trong TDZ:** ngoại lệ trên **không áp dụng**. Lý do: TDZ không phải trạng thái "không tồn tại" mà là **trạng thái thực sự của một biến đã được tạo nhưng chưa khởi tạo**. Engine biết chắc `x` tồn tại trong scope này, chỉ là chưa có giá trị — nên mọi thao tác đọc nó, kể cả `typeof`, đều bị chặn.

Đây cũng là một thiết kế có chủ đích: nếu `typeof` "cứu" được TDZ thì sẽ mất luôn tác dụng phát hiện sớm bug. Hệ quả thực tế: `typeof` **không còn là cách an toàn tuyệt đối** để kiểm tra biến — với biến toàn cục nên dùng `"name" in globalThis`.

</details>

**9. Đoán output: vòng lặp `for (var i = 0; i < 3; i++) setTimeout(() => console.log(i))` in ra gì? Đổi `var` thành `let` thì sao? Giải thích cơ chế.**

<details className="qa">
<summary>Xem đáp án</summary>

```js
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i));
// Output: 3, 3, 3

for (let i = 0; i < 3; i++) setTimeout(() => console.log(i));
// Output: 0, 1, 2
```

**Với `var`:** chỉ có **một biến `i` duy nhất** ở function scope, dùng chung cho cả vòng lặp. `setTimeout` là bất đồng bộ — các callback chỉ chạy sau khi toàn bộ code đồng bộ kết thúc, tức là sau khi vòng lặp đã chạy xong và `i` đã bằng `3`. Cả ba closure đều trỏ tới **cùng một biến** đó nên đều in `3`.

**Với `let`:** đây là hành vi đặc biệt được spec quy định riêng cho vòng `for` — mỗi lần lặp, engine tạo một **binding mới** của `i` và sao chép giá trị hiện tại vào đó. Ba callback vì vậy "bắt" (capture) ba biến khác nhau, giữ đúng giá trị `0`, `1`, `2` tại thời điểm chúng được tạo.

Đây là một trong những câu phỏng vấn kinh điển nhất về closure — và cũng là ví dụ rõ nhất cho thấy block scope giải quyết được vấn đề gì.

</details>

**10. Nếu buộc phải dùng `var` trong vòng lặp trên mà vẫn muốn in `0 1 2`, bạn xử lý thế nào (gợi ý: `IIFE`, closure)?**

<details className="qa">
<summary>Xem đáp án</summary>

Vấn đề là cả ba callback dùng chung một biến `i`. Giải pháp: **tạo một scope riêng cho mỗi lần lặp** để "đóng băng" giá trị `i` tại thời điểm đó.

**Cách 1 — IIFE (Immediately Invoked Function Expression):**

```js
for (var i = 0; i < 3; i++) {
  (function (j) {
    setTimeout(() => console.log(j)); // 0, 1, 2
  })(i); // truyền i vào làm tham số → mỗi lần gọi có j riêng
}
```

Mỗi lần lặp gọi một hàm mới, tạo ra một function scope mới với tham số `j` giữ bản sao của `i`.

**Cách 2 — truyền tham số qua `setTimeout`:**

```js
for (var i = 0; i < 3; i++) {
  setTimeout((j) => console.log(j), 0, i); // 0, 1, 2
}
```

`setTimeout` chuyển các tham số từ vị trí thứ 3 trở đi cho callback — giá trị `i` được chốt ngay lúc gọi.

Trước ES6, IIFE là cách chuẩn mực để mô phỏng block scope. Ngày nay chỉ cần đổi `var` thành `let` là xong — đó chính là lý do `let` ra đời.

</details>

**11. Gán giá trị cho một biến chưa khai báo (`x = 5`) thì chuyện gì xảy ra? Ở `strict mode` thì khác gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Ở non-strict mode (sloppy mode):** JS âm thầm tạo một **biến toàn cục ngầm** (implicit global) — thực chất là một property trên object global (`window` trong trình duyệt):

```js
function f() {
  x = 5; // không có var/let/const
}
f();
console.log(x); // 5 — rò ra global!
console.log(window.x); // 5
```

Đây là nguồn bug nghiêm trọng: gõ sai tên biến (`cont` thay vì `count`) không báo lỗi mà lặng lẽ tạo ra một biến global mới, gây xung đột tên giữa các module và rò rỉ bộ nhớ.

**Ở strict mode:** hành vi này bị cấm, ném lỗi ngay:

```js
"use strict";
x = 5; // ReferenceError: x is not defined
```

Điểm thực tế cần nhớ: **ES Module và thân `class` luôn ở strict mode**, nên trong code hiện đại (dùng `import`/`export`, bundler, framework) bạn tự động được bảo vệ. Chỉ script cũ dạng `<script>` thường mới còn rơi vào non-strict mode. Cách phòng ngừa tốt nhất vẫn là luôn khai báo biến tường minh bằng `const`/`let`.

</details>

**12. Vì sao quy tắc hiện đại là "mặc định `const`, cần gán lại mới dùng `let`, không dùng `var`"? Lợi ích cụ thể là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Vì sao `const` trước tiên:**

- **Truyền đạt ý định**: đọc `const` là biết ngay biến này không bị gán lại ở đâu khác trong hàm — bớt hẳn một thứ phải theo dõi khi đọc code.
- **Ngăn bug gán nhầm**: gán lại sẽ bị `TypeError` ngay thay vì âm thầm làm hỏng logic.
- **Dễ refactor**: khi cần tách hàm hay di chuyển code, biến bất biến an toàn hơn nhiều.

**Vì sao `let` chỉ khi cần:** dùng `let` là một tín hiệu rõ ràng "biến này sẽ thay đổi" — dành cho counter, accumulator, biến tích lũy trong vòng lặp.

**Vì sao tránh `var`:**

- Function scope khiến biến "lọt" ra ngoài khối, dễ va chạm tên.
- Hoisting kèm `undefined` che giấu lỗi dùng biến trước khi khai báo.
- Cho phép khai báo lại, âm thầm ghi đè biến cũ.
- Ở top-level trình duyệt còn tạo property trên `window`, gây ô nhiễm global.
- Gây bug closure trong vòng lặp (câu `setTimeout` in `3 3 3`).

```js
const users = await fetchUsers(); // không gán lại → const
let total = 0; // sẽ thay đổi → let
```

Bật ESLint `no-var` và `prefer-const` để cả nhóm tuân thủ tự động.

</details>

**13. `for (const item of arr)` chạy được, nhưng `for (const i = 0; i < 3; i++)` thì lỗi. Giải thích vì sao.**

<details className="qa">
<summary>Xem đáp án</summary>

Khác biệt nằm ở chỗ **biến có bị gán lại hay không**.

**`for...of` với `const` — hợp lệ:**

```js
for (const item of [1, 2, 3]) {
  console.log(item); // 1, 2, 3
}
```

Mỗi lần lặp, engine tạo một **binding `item` hoàn toàn mới** và gán giá trị phần tử kế tiếp cho nó. Không có thao tác gán lại nào trên cùng một binding, nên `const` không bị vi phạm. (`for...in` cũng tương tự.)

**`for` cổ điển với `const` — lỗi:**

```js
for (const i = 0; i < 3; i++) {
  // TypeError: Assignment to constant variable.
}
```

Ở đây `i` được khởi tạo **một lần duy nhất**, rồi biểu thức `i++` **gán lại** chính binding đó ở cuối mỗi vòng. Đó chính là thao tác `const` cấm. Cụ thể: vòng đầu tiên vẫn chạy được thân lặp, lỗi ném ra khi tới bước `i++`.

Quy tắc dễ nhớ: `for...of` / `for...in` → dùng `const` (trừ khi cần sửa biến lặp); vòng `for` cổ điển có bộ đếm → phải dùng `let`.

</details>

**14. Rule ESLint `no-var` và `prefer-const` làm gì? Vì sao nên bật chúng trong codebase nhóm?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`no-var`** — báo lỗi mọi khai báo bằng `var`, buộc dùng `let`/`const`.
- **`prefer-const`** — báo khi một biến khai báo bằng `let` nhưng **không hề bị gán lại** ở đâu, gợi ý đổi sang `const`.

```js
// eslint.config.js
{
  rules: {
    "no-var": "error",
    "prefer-const": "warn",
  }
}
```

**Vì sao nên bật trong nhóm:**

- **Tự động hoá quy ước**: quy tắc "const trước, let khi cần, không var" không còn phụ thuộc vào trí nhớ hay thiện chí của từng người.
- **Bỏ tranh cãi trong code review**: máy nhắc thay người, reviewer tập trung vào logic thay vì style.
- **Nhất quán toàn codebase**, kể cả với thành viên mới hoặc code kế thừa.
- **Sửa được tự động**: cả hai rule đều hỗ trợ `--fix`, chạy một lệnh là migrate được cả dự án.
- **Bắt lỗi sớm**: `prefer-const` còn gián tiếp cho thấy biến nào thực sự thay đổi — hữu ích khi đọc và refactor.

Thường đi kèm với việc chạy ESLint trong pre-commit hook và CI để không lọt lên nhánh chính.

</details>

**15. Biến khai báo bằng `var` ở top-level trong trình duyệt có trở thành property của `window` không? Còn `let`/`const` thì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Trong một `<script>` thường (không phải module):

```js
var a = 1;
let b = 2;
const c = 3;

console.log(window.a); // 1        — var TRỞ THÀNH property của window
console.log(window.b); // undefined — let thì không
console.log(window.c); // undefined — const cũng không

console.log(b); // 2 — vẫn truy cập bình thường bằng tên
```

**Vì sao khác nhau:** `var` và `function` ở top-level được ghi vào **object environment record** của global scope — chính là object `window`. Còn `let`, `const` và `class` được ghi vào một **declarative environment record** riêng (thường gọi là "script scope"), nằm ngoài `window` nhưng vẫn thuộc phạm vi toàn cục nên truy cập bằng tên vẫn được.

Đây là thiết kế có chủ đích: tránh làm ô nhiễm `window`, giảm nguy cơ hai script vô tình ghi đè biến của nhau, và không cho phép ghi đè các property có sẵn của trình duyệt.

Hai lưu ý thêm:

- Trong **ES Module** (`<script type="module">`), kể cả `var` ở top-level **cũng không** lên `window` — module có scope riêng.
- Trong **Node.js**, mỗi file CommonJS là một module nên `var` top-level cũng không thành property của `globalThis`.

</details>

---

## 2. Hoisting và Quy tắc đặt tên

Bài học: [2. Hoisting và Quy tắc đặt tên](../../javascript/02-variables/2_hoisting-naming.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `Hoisting` là gì? Engine làm gì trước khi thực sự chạy code trong một scope?**

<details className="qa">
<summary>Xem đáp án</summary>

**Hoisting** ("cẩu lên") là cơ chế JavaScript engine **đưa khai báo biến và hàm lên đầu scope** trước khi chạy code. Nói chính xác hơn, engine xử lý mỗi scope theo hai pha:

- **Pha tạo (creation)**: engine **scan toàn bộ scope**, đăng ký trước mọi tên được khai báo (`var`, `let`, `const`, `function`, `class`) vào môi trường của scope đó.
- **Pha thực thi (execution)**: chạy code từng dòng, thực hiện các phép gán.

Vì vậy khi code chạy tới dòng đầu tiên thì tất cả tên đã tồn tại sẵn — chỉ khác nhau ở **trạng thái ban đầu**:

```js
console.log(x); // undefined — x đã tồn tại, chưa gán
var x = 10; // gán xảy ra ở đúng dòng này
```

Hiểu đúng: hoisting **không di chuyển code**, nó chỉ là hệ quả của việc engine đăng ký khai báo trước khi chạy.

</details>

**2. Câu nói "`let` và `const` không được hoist" đúng hay sai? Trả lời chuẩn cho phỏng vấn là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Sai.** Đây là khẳng định phổ biến trong tài liệu cũ nhưng không chính xác. Thực tế:

1. Engine vẫn **scan toàn block** trước khi chạy → biến `let`/`const` **đã tồn tại**.
2. Nhưng biến ở trạng thái **uninitialized** — nằm trong **Temporal Dead Zone (TDZ)** cho đến dòng khai báo.
3. Truy cập biến uninitialized ném `ReferenceError`.

Bằng chứng biến đã tồn tại: nếu `let` không hoist, dòng dưới sẽ đọc được biến ở scope ngoài, nhưng thực tế nó báo lỗi.

```js
let x = "ngoài";
{
  console.log(x); // ReferenceError, không phải "ngoài"
  let x = "trong";
}
```

**Trả lời chuẩn cho phỏng vấn:** "**Tất cả khai báo đều được hoist**, nhưng `let`/`const` nằm trong TDZ cho đến dòng khai báo, nên truy cập trước đó ném `ReferenceError` thay vì trả về `undefined`."

</details>

**3. So sánh trạng thái ban đầu của `var`, `let`/`const` và `function` sau khi được hoist.**

<details className="qa">
<summary>Xem đáp án</summary>

| Loại khai báo          | Được hoist? | Trạng thái ban đầu       | Truy cập trước dòng khai báo |
| ---------------------- | ----------- | ------------------------ | ---------------------------- |
| `var`                  | Có          | Khởi tạo sẵn `undefined` | Trả về `undefined`           |
| `let` / `const`        | **Có**      | Uninitialized (TDZ)      | **`ReferenceError`**         |
| `function` declaration | Có          | Đã gán **toàn bộ body**  | Gọi được bình thường         |
| `class`                | Có          | Uninitialized (TDZ)      | `ReferenceError`             |

Điểm mấu chốt: hoisting là chuyện **tên được đăng ký trước**, còn khác biệt nằm ở **giá trị khởi tạo**. `var` được khởi tạo `undefined` ngay; `function` declaration được gán luôn hàm nên gọi trước cũng chạy; `let`/`const`/`class` thì chưa khởi tạo gì cả nên chạm vào là lỗi.

```js
console.log(a); // undefined
console.log(fn()); // "ok"
console.log(b); // ReferenceError

var a = 1;
function fn() {
  return "ok";
}
let b = 2;
```

</details>

**4. Đoán output và giải thích: `console.log(name); var name = "An";`**

<details className="qa">
<summary>Xem đáp án</summary>

Output: **`undefined`**.

```js
console.log(name); // undefined
var name = "An";
```

Engine xử lý tương đương như sau:

```js
var name; // khai báo hoist lên đầu, khởi tạo undefined
console.log(name); // undefined — biến tồn tại nhưng chưa gán
name = "An"; // phép gán ở lại đúng vị trí ban đầu
```

Vì sao **không** phải `ReferenceError`? Vì biến `name` đã được đăng ký và **khởi tạo sẵn `undefined`** trong pha tạo. Chỉ có `let`/`const` mới ném `ReferenceError` do nằm trong TDZ.

Vì sao **không** phải `"An"`? Vì hoisting chỉ cẩu **khai báo**, không cẩu **phép gán** — `name = "An"` vẫn chạy ở dòng thứ hai.

_(Lưu ý nhỏ: nếu chạy đoạn này ở scope toàn cục của trình duyệt, `name` trùng với `window.name` có sẵn nên kết quả có thể là chuỗi rỗng. Chạy trong hàm hoặc module thì đúng là `undefined`.)_

</details>

**5. Đoán output và giải thích: `greet(); function greet() { console.log("Hi"); }`**

<details className="qa">
<summary>Xem đáp án</summary>

Output: **`Hi`** — chạy hoàn toàn bình thường, không lỗi.

```js
greet(); // "Hi" — chạy được!

function greet() {
  console.log("Hi");
}
```

Lý do: **function declaration được hoist toàn bộ** — cả tên lẫn body. Trong pha tạo, engine đăng ký tên `greet` và **gán luôn giá trị là hàm** vào đó. Nên đến khi code chạy dòng `greet()`, biến `greet` đã là một function đầy đủ, gọi được ngay.

Đây là điểm khác biệt lớn nhất so với `var`: `var` chỉ được khởi tạo `undefined`, còn `function` declaration được khởi tạo bằng chính hàm.

Trên thực tế, đặc tính này cho phép viết code theo kiểu "hàm chính ở trên, hàm phụ định nghĩa ở dưới" mà vẫn chạy được — một phong cách khá phổ biến trong JS.

</details>

**6. Đoán output và giải thích: `greet(); var greet = function () {};` — vì sao lại là `TypeError` chứ không phải `ReferenceError`?**

<details className="qa">
<summary>Xem đáp án</summary>

Output: **`TypeError: greet is not a function`**.

```js
greet(); // TypeError: greet is not a function

var greet = function () {
  console.log("Hi");
};
```

Đây là **function expression** — vế phải chỉ là một giá trị được gán cho biến `var greet`. Engine hoist **biến** `greet` (khởi tạo `undefined`), chứ không hoist hàm. Tại thời điểm gọi:

```js
var greet;   // undefined
greet();     // undefined() → TypeError
greet = function () { ... };
```

**Vì sao là `TypeError` chứ không phải `ReferenceError`?** Hai lỗi phản ánh hai vấn đề khác nhau:

- `ReferenceError` = **không tìm thấy biến** (hoặc biến đang trong TDZ).
- `TypeError` = **tìm thấy biến rồi, nhưng làm sai thao tác với giá trị của nó**.

Ở đây biến `greet` tồn tại và có giá trị `undefined`; lỗi nằm ở chỗ ta cố **gọi** một giá trị không phải hàm.

</details>

**7. Đoán output và giải thích: `greet(); const greet = () => {};` — vì sao lỗi ở đây khác với câu trên?**

<details className="qa">
<summary>Xem đáp án</summary>

Output: **`ReferenceError: Cannot access 'greet' before initialization`**.

```js
greet(); // ReferenceError (TDZ)

const greet = () => console.log("Hi");
```

Khác biệt nằm ở **cách khai báo biến**, không phải ở arrow function:

|                    | `var greet = function(){}`      | `const greet = () => {}`             |
| ------------------ | ------------------------------- | ------------------------------------ |
| Biến được hoist    | Có, khởi tạo `undefined`        | Có, nhưng **uninitialized (TDZ)**    |
| Gọi trước khai báo | `undefined()` → **`TypeError`** | Chạm vào biến → **`ReferenceError`** |

Với `var`, engine cho phép **đọc** biến (ra `undefined`), lỗi chỉ phát sinh khi gọi nó như hàm. Với `const`/`let`, engine **chặn ngay từ bước đọc biến** vì nó đang trong TDZ — chưa kịp tới chuyện gọi hàm hay không.

Lỗi TDZ thực ra "tốt" hơn: nó báo đúng bản chất vấn đề (dùng biến trước khi khai báo) thay vì để lộ ra một `undefined` khó lần.

</details>

**8. Phân biệt `function declaration` và `function expression` về hoisting. Khi nào nên dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí               | Function declaration                      | Function expression                                       |
| ---------------------- | ----------------------------------------- | --------------------------------------------------------- |
| Cú pháp                | `function greet() {}`                     | `const greet = function () {}` / `() => {}`               |
| Hoisting               | Hoist **cả tên lẫn body**                 | Chỉ hoist **biến** chứa nó                                |
| Gọi trước khi khai báo | Chạy được                                 | `TypeError` (`var`) hoặc `ReferenceError` (`let`/`const`) |
| Trong block scope      | Hành vi khác nhau giữa strict/sloppy mode | Tuân theo scope của biến, nhất quán                       |

```js
sayHi(); // OK — declaration
function sayHi() {}

sayBye(); // ReferenceError — expression với const
const sayBye = () => {};
```

**Khi nào dùng cái nào:**

- **Declaration**: hàm tiện ích cấp module, muốn định nghĩa ở cuối file mà vẫn gọi được ở trên; dễ đọc tên hàm trong stack trace.
- **Expression (ưu tiên trong code hiện đại)**: khi cần truyền hàm làm tham số, gán vào object, hoặc muốn ràng buộc thứ tự "khai báo trước — dùng sau" cho rõ ràng. Đặc biệt nên dùng khi khai báo hàm **bên trong block**.

</details>

**9. Khai báo `function` bên trong một block `if` thì hành vi khác nhau ra sao giữa `strict mode` và `sloppy mode`? Nên viết thế nào để an toàn?**

<details className="qa">
<summary>Xem đáp án</summary>

```js
"use strict";

if (true) {
  function foo() {}
}
foo(); // ReferenceError trong strict
// OK trong sloppy mode (foo bị hoist ra ngoài)
```

- **Strict mode**: function declaration trong block được **scope vào chính block đó** — ra ngoài block là không còn tồn tại.
- **Sloppy mode**: vì lý do tương thích ngược, engine áp dụng cơ chế đặc biệt khiến tên hàm "rò" ra function scope bên ngoài, nên `foo()` bên ngoài vẫn gọi được.

Hệ quả: cùng một đoạn code cho hai kết quả khác nhau tùy môi trường — nguồn bug rất khó lần, nhất là khi code được bundle hoặc chuyển sang module (module luôn ở strict mode).

**Cách viết an toàn:** không khai báo `function` trong block. Thay bằng function expression hoặc arrow function gán vào biến:

```js
let foo;
if (true) {
  foo = () => {
    /* ... */
  };
}
```

Khi đó phạm vi của `foo` do chính khai báo biến quyết định, nhất quán ở mọi mode.

</details>

**10. Nếu trong cùng scope có cả `var foo` và `function foo()` thì cái nào "thắng"? Giải thích thứ tự hoisting.**

<details className="qa">
<summary>Xem đáp án</summary>

Sau pha hoisting, **`function` thắng** — tên `foo` mang giá trị là hàm.

```js
console.log(typeof foo); // "function"

var foo;
function foo() {}
```

Thứ tự trong pha tạo:

1. Engine đăng ký các khai báo `var` trước, khởi tạo `undefined`.
2. Sau đó xử lý `function` declaration, **ghi đè** tên đó bằng chính hàm.
3. `var foo;` **không có initializer** nên ở bước này không xóa giá trị hàm đi.

Nhưng nếu `var` **có phép gán**, phép gán đó chạy ở pha thực thi và sẽ ghi đè hàm:

```js
console.log(typeof foo); // "function" — sau hoisting
var foo = 42;
function foo() {}
console.log(typeof foo); // "number" — phép gán đã chạy
```

Kết luận thực dụng: đây là code khó đọc và dễ gây hiểu nhầm. Đừng trùng tên giữa biến và hàm; dùng `let`/`const` thì engine còn báo `SyntaxError` ngay, an toàn hơn.

</details>

**11. Những ký tự nào hợp lệ trong tên biến JavaScript? Vì sao `let 1user`, `let my-name`, `let class` đều lỗi?**

<details className="qa">
<summary>Xem đáp án</summary>

Tên biến hợp lệ:

- Chứa chữ cái (a-z, A-Z), số (0-9), dấu gạch dưới `_` và ký hiệu `$`.
- **Không** bắt đầu bằng số.
- Hỗ trợ Unicode — tên tiếng Việt có dấu chạy được nhưng không khuyến nghị.

```js
let name;
let _private;
let $element;
let user1;
let người_dùng; // OK nhưng không khuyến nghị
```

Vì sao ba trường hợp kia lỗi (đều là `SyntaxError`):

- `let 1user` — **bắt đầu bằng số**. Parser gặp `1` sẽ hiểu đó là số literal, không thể là định danh.
- `let my-name` — chứa **dấu trừ**, mà `-` là toán tử. Engine đọc thành biểu thức `my - name`, không phải một tên.
- `let class` — `class` là **reserved keyword**, đã được ngôn ngữ dành riêng cho cú pháp khác.

</details>

**12. `Reserved keyword` là gì? Kể vài từ khoá không được dùng làm tên biến.**

<details className="qa">
<summary>Xem đáp án</summary>

**Reserved keyword** (từ khoá dành riêng) là những từ đã được ngôn ngữ giữ chỗ cho cú pháp của chính nó. Vì parser hiểu chúng theo nghĩa ngữ pháp, ta **không thể dùng làm tên biến, tên hàm hay tên tham số** — làm vậy sẽ gặp `SyntaxError`.

Danh sách các từ khoá dành riêng:

```
break case catch class const continue debugger default delete do
else export extends false finally for function if import in instanceof
new null return super switch this throw true try typeof var void
while with yield let static
```

Vài lưu ý thực tế:

- Một số từ chỉ bị cấm **theo ngữ cảnh**: `let`, `static`, `yield` chỉ là từ khoá trong strict mode hoặc trong generator.
- `undefined`, `NaN`, `Infinity` **không** phải keyword mà là thuộc tính toàn cục — gán đè vào chúng không báo lỗi cú pháp nhưng là thói quen rất xấu.
- Cách né đơn giản khi bị trùng: đổi tên cho rõ nghĩa hơn (`className`, `defaultValue`, `newUser`) thay vì thêm gạch dưới.

</details>

**13. Nêu convention đặt tên cho biến/hàm, class, hằng số global, boolean. Vì sao boolean nên có prefix `is`/`has`/`can`?**

<details className="qa">
<summary>Xem đáp án</summary>

| Loại                   | Convention              | Ví dụ                          |
| ---------------------- | ----------------------- | ------------------------------ |
| Biến, hàm              | camelCase               | `userName`, `getCurrentUser()` |
| Class, constructor     | PascalCase              | `User`, `UserService`          |
| Hằng số global         | UPPER_SNAKE_CASE        | `MAX_RETRIES`, `API_URL`       |
| Private (theo quy ước) | `_camelCase`            | `_internalState`               |
| Private thật (class)   | `#camelCase`            | `#password`                    |
| Boolean                | `is`/`has`/`can` prefix | `isActive`, `hasPermission`    |

**Vì sao boolean nên có prefix:** prefix biến tên biến thành một **câu hỏi có/không**, nên vừa đọc đã biết ngay giá trị chỉ là `true`/`false` và ý nghĩa của từng nhánh.

```js
if (user.admin) {
} // admin là boolean? là object? là id?
if (user.isAdmin) {
} // rõ ràng ngay
if (cart.items) {
} // mảng — luôn truthy, dễ sai
if (cart.hasItems) {
} // đúng ý định
```

Quy ước chung: `is` cho trạng thái (`isLoading`), `has` cho sở hữu (`hasError`), `can`/`should` cho quyền hoặc quyết định (`canEdit`, `shouldRetry`).

</details>

**14. Phân biệt quy ước `_privateField` và private thật sự `#privateField` trong class.**

<details className="qa">
<summary>Xem đáp án</summary>

|                                    | `_privateField`                          | `#privateField`                              |
| ---------------------------------- | ---------------------------------------- | -------------------------------------------- |
| Bản chất                           | **Quy ước đặt tên**, không có gì ép buộc | **Tính năng ngôn ngữ** (private class field) |
| Truy cập từ bên ngoài              | Vẫn được, chỉ là "không nên"             | `SyntaxError` — không thể truy cập           |
| Xuất hiện khi lặp/`JSON.stringify` | Có                                       | Không                                        |
| Phạm vi hỗ trợ                     | Mọi nơi (object thường, class...)        | Chỉ trong thân class                         |

```js
class User {
  _token = "abc"; // quy ước
  #password = "123"; // private thật

  check() {
    return this.#password;
  } // OK trong class
}

const u = new User();
u._token; // "abc" — vẫn đọc được
u.#password; // SyntaxError
```

Ý nghĩa thực tế: `_` là **tín hiệu cho đồng đội** ("đây là nội bộ, đừng phụ thuộc vào nó"), còn `#` là **rào chắn thật** do engine bảo đảm. Trong code mới viết bằng `class`, ưu tiên `#` khi muốn đóng gói thực sự; dùng `_` khi chỉ cần đánh dấu ý định hoặc khi cần truy cập trong test/kế thừa.

</details>

**15. Vì sao "tên biến tốt đáng giá hơn comment"? Cho ví dụ đổi tên biến làm code tự giải thích được.**

<details className="qa">
<summary>Xem đáp án</summary>

Vì tên biến **đi cùng code ở mọi nơi nó được dùng**, còn comment chỉ nằm ở một chỗ và rất dễ **lỗi thời** khi code thay đổi. Một tên rõ ràng giúp người đọc hiểu code mà không cần đọc context xung quanh; comment giải thích "biến này là gì" thường là dấu hiệu tên đang đặt tệ.

```js
// Tệ
const d = new Date() - user.createdAt;

// Tốt
const accountAgeMs = Date.now() - user.createdAt.getTime();
```

Tên `accountAgeMs` nói luôn ba điều: nội dung (tuổi tài khoản), kiểu (số) và **đơn vị** (mili giây) — thứ mà đọc `d` không tài nào đoán ra.

Vài nguyên tắc rút ra:

- Đặt tên theo **ý nghĩa nghiệp vụ**, không theo kiểu dữ liệu (`activeUsers` thay vì `arr`).
- Gắn **đơn vị** khi có (`timeoutMs`, `priceVnd`, `widthPx`).
- Tên dài mà rõ vẫn tốt hơn tên ngắn mà mơ hồ.

Trong code review, đổi tên thường là feedback **dễ nhất và hiệu quả nhất** — chi phí gần như bằng không, lợi ích kéo dài.

</details>

**16. `Shadowing` là gì? Cho ví dụ biến ở block trong che biến cùng tên ở block ngoài, và trường hợp nào gây `illegal shadowing`?**

<details className="qa">
<summary>Xem đáp án</summary>

**Shadowing** (che biến) là khi một biến khai báo ở scope bên trong **trùng tên** với biến ở scope ngoài, khiến trong phạm vi đó biến ngoài bị "che" hoàn toàn.

```js
let message = "ngoài";

{
  let message = "trong"; // che biến ngoài
  console.log(message); // "trong"
}

console.log(message); // "ngoài" — biến ngoài không bị ảnh hưởng
```

Shadowing hợp lệ và đôi khi hữu ích (ví dụ tham số hàm trùng tên biến ngoài), nhưng lạm dụng sẽ khiến code khó theo dõi.

**Illegal shadowing** xảy ra khi dùng `var` bên trong để che một biến `let`/`const` ở ngoài. Vì `var` không bị giới hạn bởi block, nó "tràn" ra function scope và đụng độ với khai báo `let` sẵn có:

```js
let x = 1;
{
  var x = 2; // SyntaxError: Identifier 'x' has already been declared
}
```

Chiều ngược lại thì hợp lệ, vì `let` nằm gọn trong block:

```js
var y = 1;
{
  let y = 2; // OK
}
```

</details>

---

## 3. Scope (Phạm vi biến)

Bài học: [3. Scope (Phạm vi biến)](../../javascript/02-variables/3_scope.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `Scope` là gì? JavaScript có mấy loại scope và mỗi loại được tạo ra bởi cái gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Scope** là **phạm vi truy cập** của biến — vùng code mà tại đó biến có thể được nhìn thấy và sử dụng. Scope tồn tại để kiểm soát "biến nào nhìn thấy ở đâu", tránh đụng độ tên và làm bẩn global.

JavaScript có 3 loại scope chính:

| Scope    | Tạo bởi                                               | Ví dụ khai báo                         |
| -------- | ----------------------------------------------------- | -------------------------------------- |
| Global   | Ngoài mọi function và block                           | `const APP_NAME = "MyApp"` ở top-level |
| Function | Bên trong một function                                | `var`, `let`, `const` trong thân hàm   |
| Block    | Bên trong cặp `{}` (`if`, `for`, `while`, block trần) | chỉ `let` / `const`                    |

```js
const APP_NAME = "MyApp"; // global

function show() {
  var inFn = 1; // function scope
  if (true) {
    let inBlock = 2; // block scope
  }
  console.log(inBlock); // ReferenceError
}
```

Điểm cần nhớ: `var` **không** tạo block scope — nó luôn thuộc về function gần nhất.

</details>

**2. `var`, `let` và `const` khác nhau thế nào về scope? Vì sao biến `var` khai báo bên trong `if` vẫn đọc được ở ngoài block đó?**

<details className="qa">
<summary>Xem đáp án</summary>

|                         | `var`              | `let` / `const`         |
| ----------------------- | ------------------ | ----------------------- |
| Phạm vi                 | **Function scope** | **Block scope**         |
| Trong `if` / `for`      | Lọt ra ngoài block | Bị giới hạn trong block |
| Khai báo lại cùng scope | Được               | `SyntaxError`           |
| Truy cập trước khai báo | `undefined`        | `ReferenceError` (TDZ)  |

```js
function demo() {
  if (true) {
    var a = 1;
    let b = 2;
  }
  console.log(a); // 1 — var lọt ra ngoài if
  console.log(b); // ReferenceError — let bị scope vào if
}
```

**Vì sao `var` lọt ra ngoài?** Vì `var` có từ ES1, khi JavaScript chưa có khái niệm block scope — đơn vị phạm vi nhỏ nhất lúc đó là **function**. Engine đăng ký `var a` vào môi trường của `demo()` chứ không phải của khối `if`, nên sau khi ra khỏi `if`, biến vẫn còn sống. ES6 thêm `let`/`const` để sửa đúng điểm này, và vì lý do tương thích ngược, hành vi của `var` được giữ nguyên.

</details>

**3. Giải thích `hoisting`. Vì sao truy cập biến `let` trước dòng khai báo lại ném `ReferenceError` thay vì cho `undefined`? `TDZ` (Temporal Dead Zone) là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Hoisting** là việc engine **scan toàn scope và đăng ký mọi khai báo trước khi chạy code**. Mọi khai báo (`var`, `let`, `const`, `function`) đều được hoist — khác nhau ở **trạng thái khởi tạo**:

- `var` → khởi tạo sẵn `undefined`, đọc trước khai báo ra `undefined`.
- `let` / `const` → **uninitialized**, nằm trong TDZ.
- `function` declaration → gán sẵn cả body, gọi trước vẫn chạy.

**TDZ (Temporal Dead Zone)** là khoảng thời gian từ lúc vào scope cho tới lúc thực thi dòng khai báo. Trong khoảng đó biến **đã tồn tại nhưng chưa khởi tạo**, và mọi thao tác đọc/ghi vào nó đều ném `ReferenceError`.

```js
{
  // TDZ của x bắt đầu từ đây
  console.log(x); // ReferenceError: Cannot access 'x' before initialization
  let x = 10; // TDZ kết thúc
  console.log(x); // 10
}
```

Đây là thiết kế **có chủ đích**: thay vì âm thầm trả về `undefined` như `var`, TDZ ép lỗi lộ ra ngay tại nơi viết sai thứ tự.

</details>

**4. `Lexical scope` (static scope) nghĩa là gì? Nếu một hàm được viết ở top-level nhưng được gọi bên trong một hàm khác, nó đọc biến ở đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

**Lexical scope** (static scope) nghĩa là scope của một hàm được xác định bởi **vị trí code khi viết**, không phải vị trí khi gọi. Chữ "lexical" = "thuộc về văn bản code": chỉ cần nhìn hàm được viết lồng bên trong function/block nào là biết nó truy cập được biến nào — điều này được "chốt" ngay lúc viết và không đổi.

Hàm viết ở top-level sẽ **luôn đọc biến ở top-level**, bất kể được gọi ở đâu:

```js
const message = "global";

function inner() {
  console.log(message); // nhìn lên nơi inner ĐƯỢC VIẾT
}

function outer() {
  const message = "local trong outer";
  inner(); // gọi ở đây, nhưng...
}

outer(); // In ra "global", KHÔNG phải "local trong outer"
```

Nếu JS dùng _dynamic scope_ (lấy biến theo nơi gọi) thì kết quả sẽ là `"local trong outer"` — nhưng JS **không** làm vậy. Chính đặc tính này là nền tảng của **closure**.

</details>

**5. So sánh `lexical scope` và `dynamic scope`. JavaScript dùng loại nào, và điều đó giúp gì cho việc suy luận code?**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí           | Lexical scope (JS dùng)     | Dynamic scope                  |
| ------------------ | --------------------------- | ------------------------------ |
| Quyết định khi nào | Lúc **viết** code (static)  | Lúc **chạy/gọi** hàm           |
| Lấy biến từ đâu    | Nơi hàm **được định nghĩa** | Nơi hàm **được gọi**           |
| Đoán kết quả       | Dễ — nhìn cấu trúc code     | Khó — phải lần theo call stack |

**JavaScript dùng lexical scope.** Lợi ích cho việc suy luận code:

- **Đọc code là biết ngay**: chỉ cần nhìn cấu trúc lồng nhau trong file, không cần biết hàm sẽ được gọi từ đâu.
- **Engine tối ưu được**: vì scope chain cố định từ lúc parse, V8 có thể phân giải biến trước, không phải tra cứu động lúc chạy.
- **An toàn hơn**: một hàm không thể bị "đổi nghĩa" chỉ vì ai đó gọi nó từ một ngữ cảnh có biến trùng tên.
- **Tooling hoạt động được**: linter, "go to definition", refactor đổi tên, tree-shaking đều dựa trên tính tĩnh này.

Hầu hết ngôn ngữ hiện đại (JavaScript, Python, C...) dùng lexical scope; dynamic scope hiếm gặp (Bash, Emacs Lisp cũ). Lưu ý: `this` trong JS lại là ngoại lệ — nó được quyết định theo cách gọi, gần với dynamic hơn.

</details>

**6. Mô tả `scope chain`: khi truy cập một biến, engine tìm theo thứ tự nào và chuyện gì xảy ra khi tìm hết chuỗi mà vẫn không thấy?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi truy cập một biến, JS tìm theo **chuỗi scope từ trong ra ngoài**: **inner → outer → ... → global**. Tìm thấy ở đâu thì dừng ở đó (nên biến gần nhất "che" biến cùng tên ở ngoài).

```js
const global = "G";

function outer() {
  const a = "A";

  function inner() {
    const b = "B";
    console.log(b); // thấy ngay ở inner scope
    console.log(a); // không có ở inner → lên outer scope
    console.log(global); // lên tiếp tới global scope
  }

  inner();
}

outer();
```

Nếu duyệt hết chuỗi mà vẫn không thấy, JS ném **`ReferenceError`**.

Về mặt runtime, mỗi lần gọi hàm engine tạo một **Lexical Environment** gồm bảng biến của scope đó và một **outer reference** trỏ tới scope cha (theo lexical, tức nơi hàm được viết). Scope chain chính là chuỗi outer reference này. Lưu ý chiều tìm kiếm chỉ đi **một hướng**: scope trong nhìn ra được scope ngoài, còn scope ngoài không nhìn vào trong được.

</details>

**7. Đoán output: `for (var i = 0; i < 3; i++) setTimeout(() => console.log(i), 100)` in ra gì? Đổi `var` thành `let` thì in ra gì? Giải thích cơ chế đằng sau sự khác biệt.**

<details className="qa">
<summary>Xem đáp án</summary>

```js
for (var j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 100);
}
// In ra: 3, 3, 3

for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// In ra: 0, 1, 2
```

**Với `var`:** chỉ có **một biến `j` duy nhất** ở function scope. Vòng lặp chạy xong tức thì (callback `setTimeout` phải chờ tới khi call stack rỗng), lúc đó `j` đã là `3`. Cả ba closure cùng đóng trên **một binding**, nên đều đọc ra `3`.

**Với `let`:** **mỗi iteration tạo một binding `i` mới** trong một scope riêng. Mỗi callback đóng trên binding của chính vòng đó.

Tương đương ngầm:

```js
// for (let i = 0; i < 3; i++) ... thực ra là:
for (let _binding = 0; _binding < 3; _binding++) {
  let i = _binding; // tạo mới mỗi vòng
  // ...
}
```

Đây là hành vi đặc biệt của `let` trong vòng `for`, sinh ra chính để giải quyết bug kinh điển này.

</details>

**8. Nếu bắt buộc phải dùng `var` trong vòng lặp trên mà vẫn muốn in ra `0, 1, 2`, bạn sửa bằng những cách nào (`IIFE`, tham số thứ ba của `setTimeout`, hàm nhận tham số...)?**

<details className="qa">
<summary>Xem đáp án</summary>

Mấu chốt: phải **copy giá trị `i` của từng vòng vào một scope riêng**.

**Cách 1 — IIFE** (kinh điển thời trước ES6): mỗi vòng tạo một function scope mới.

```js
for (var i = 0; i < 3; i++) {
  (function (n) {
    setTimeout(() => console.log(n), 100);
  })(i);
}
// 0, 1, 2
```

**Cách 2 — hàm nhận tham số** (bản tách rời, dễ đọc hơn IIFE):

```js
function schedule(n) {
  setTimeout(() => console.log(n), 100);
}
for (var i = 0; i < 3; i++) schedule(i);
```

**Cách 3 — tham số thứ ba trở đi của `setTimeout`**: các tham số sau `delay` được truyền vào callback.

```js
for (var i = 0; i < 3; i++) {
  setTimeout((n) => console.log(n), 100, i);
}
```

Cả ba đều dựa trên cùng nguyên lý: **truyền `i` làm tham số** để tạo một biến mới, độc lập với `i` dùng chung. Trong code hiện đại thì chỉ cần đổi `var` thành `let`.

</details>

**9. `Closure` là gì? Viết hàm `createCounter` giữ biến `count` private, rồi giải thích vì sao `count` không bị thu hồi sau khi hàm cha đã return.**

<details className="qa">
<summary>Xem đáp án</summary>

**Closure** là một hàm "nhớ" được biến của scope bên ngoài nơi nó được viết, **kể cả sau khi scope đó đã kết thúc**.

```js
function createCounter() {
  let count = 0; // private — bên ngoài không chạm tới được

  return function () {
    count++;
    return count;
  };
}

const next = createCounter();
next(); // 1
next(); // 2 — count vẫn "sống" nhờ closure
```

**Vì sao `count` không bị thu hồi?** Vì garbage collector chỉ dọn những gì **không còn ai tham chiếu tới**. Khi `createCounter()` chạy, engine tạo một Lexical Environment chứa `count`. Hàm con được trả về giữ một **outer reference** tới môi trường đó. Sau khi `createCounter` return, call stack đã pop nhưng môi trường kia vẫn **đang được hàm con trỏ tới**, nên nó không bị thu hồi — chỉ khi biến `next` không còn tham chiếu nào thì cả cụm mới được dọn.

Nhờ vậy ta có biến **private** thật sự: `count` chỉ thay đổi qua hàm được trả về.

</details>

**10. Closure giữ giá trị hay giữ tham chiếu tới biến? Điều đó ảnh hưởng ra sao khi nhiều closure cùng đóng trên một biến?**

<details className="qa">
<summary>Xem đáp án</summary>

Closure giữ **tham chiếu tới biến (binding)**, không phải bản sao giá trị tại thời điểm hàm được tạo. Vì vậy closure luôn đọc ra **giá trị mới nhất** của biến đó.

```js
let x = 1;
const show = () => console.log(x);
x = 99;
show(); // 99 — không phải 1
```

**Khi nhiều closure cùng đóng trên một biến**, chúng chia sẻ cùng một binding — sửa ở một chỗ thì chỗ kia thấy ngay:

```js
function makePair() {
  let count = 0;
  return {
    inc: () => ++count,
    get: () => count,
  };
}

const c = makePair();
c.inc();
c.inc();
c.get(); // 2 — inc và get dùng chung một count
```

Đây vừa là **tính năng** (làm được module pattern, state dùng chung), vừa là **cái bẫy** — chính là nguyên nhân của `3, 3, 3` trong vòng lặp `var`: ba callback cùng đóng trên một binding `j`. Muốn mỗi closure có bản riêng thì phải **tạo binding mới** (dùng `let` trong `for`, hoặc truyền qua tham số hàm).

</details>

**11. Trong trình duyệt, vì sao `var x = 1` ở top-level tạo ra `window.x` còn `let y = 1` thì không? Trong ES Module và strict mode thì behavior khác gì?**

<details className="qa">
<summary>Xem đáp án</summary>

```js
var x = 10;
console.log(window.x); // 10 (browser, script thường)

let y = 20;
console.log(window.y); // undefined
```

Lý do: ở top-level của một script trong trình duyệt, môi trường toàn cục có **hai phần**. `var` và `function` declaration được ghi vào **object environment record** — chính là object `window`, nên chúng thành property của `window`. Còn `let`, `const`, `class` được ghi vào một **declarative record** riêng (thường gọi là _global declarative environment_) — vẫn là biến toàn cục, truy cập được ở mọi nơi, nhưng **không gắn vào `window`**. ES6 cố ý thiết kế vậy để ngừng làm bẩn object global.

**Trong ES Module** (`<script type="module">` hoặc file `.mjs`): mọi biến top-level đều thuộc **module scope**, kể cả `var` — không có gì lọt ra `window`. Module cũng luôn chạy ở **strict mode**, nên không thể tạo biến global ngầm bằng cách gán vào tên chưa khai báo (`z = 1` sẽ ném `ReferenceError` thay vì âm thầm tạo `window.z`). Đây là behavior chuẩn nên dùng.

</details>

**12. Mỗi lần gọi hàm, engine tạo ra một `Lexical Environment` gồm những thành phần nào? `Environment Record` và outer reference liên quan gì tới closure?**

<details className="qa">
<summary>Xem đáp án</summary>

Mỗi function call tạo một **Lexical Environment** gồm hai phần:

- **Environment Record**: bảng lưu các biến/tham số/hàm được khai báo trong scope đó (tên → giá trị).
- **Outer reference**: con trỏ tới Lexical Environment của **scope cha theo lexical** — tức nơi hàm được _viết_, không phải nơi được _gọi_.

**Scope chain chính là chuỗi outer reference này.** Khi truy cập một biến, engine tra trong Environment Record hiện tại; không thấy thì đi theo outer reference lên tiếp, cho tới global — hết chuỗi vẫn không thấy thì ném `ReferenceError`.

**Liên quan tới closure:** khi một hàm con được trả ra ngoài, nó mang theo outer reference trỏ tới Environment Record của hàm cha. Chừng nào hàm con còn sống thì record đó còn được tham chiếu, nên **không bị garbage collector thu hồi** — đó chính là cơ chế vật lý của closure.

Hiểu mô hình này giải thích được cả ba chuyện: closure giữ biến sống, memory leak khi closure giữ tham chiếu DOM, và chi phí khi scope lồng quá sâu.

</details>

**13. Closure có thể gây `memory leak` trong tình huống nào? Cho ví dụ với DOM node hoặc event listener và cách phòng tránh.**

<details className="qa">
<summary>Xem đáp án</summary>

Closure gây leak khi nó **giữ tham chiếu tới dữ liệu lớn hoặc DOM node lâu hơn mức cần thiết**, khiến garbage collector không dọn được.

```js
function setup() {
  const bigData = new Array(1_000_000).fill("x");
  const el = document.getElementById("btn");

  el.addEventListener("click", () => {
    console.log(el.id, bigData.length); // giữ cả el lẫn bigData sống mãi
  });
}
```

Hai vấn đề: (1) listener chưa gỡ nên closure còn sống; (2) closure tham chiếu `el`, nên dù node bị xoá khỏi DOM nó vẫn nằm trong bộ nhớ (_detached DOM node_) — kéo theo `bigData`.

Cách phòng tránh:

- **Gỡ listener** khi không dùng nữa: `removeEventListener`, hoặc `{ once: true }`, hoặc `AbortController` với `{ signal }`. Trong React thì trả hàm cleanup từ `useEffect`.
- **Chỉ đóng trên thứ thực sự cần**: lấy `el.id` ra biến riêng thay vì giữ cả node; giải phóng dữ liệu lớn (`bigData = null`) khi xong.
- **Dùng `WeakMap`/`WeakRef`** khi cần gắn dữ liệu kèm theo DOM node.
- Kiểm tra bằng tab **Memory** của DevTools: chụp heap snapshot và tìm "Detached" node.

</details>

**14. Kể vài ứng dụng thực tế của closure: `debounce`/`throttle`, `factory function`, `module pattern`, `memoize` — mỗi cái closure giữ lại cái gì?**

<details className="qa">
<summary>Xem đáp án</summary>

| Ứng dụng         | Closure giữ lại gì                                     |
| ---------------- | ------------------------------------------------------ |
| `debounce`       | `timerId` của lần hẹn giờ gần nhất, để huỷ và đặt lại  |
| `throttle`       | Mốc **thời gian gọi gần nhất** (hoặc cờ đang khoá)     |
| Factory function | **Cấu hình/state riêng** của từng instance được tạo ra |
| Module pattern   | Các biến/hàm **private**, chỉ lộ ra API công khai      |
| `memoize`        | **Cache** kết quả đã tính theo tham số                 |

```js
function debounce(fn, delay) {
  let timerId; // closure giữ biến này qua các lần gọi
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delay);
  };
}

function memoize(fn) {
  const cache = new Map(); // closure giữ cache
  return (n) => {
    if (!cache.has(n)) cache.set(n, fn(n));
    return cache.get(n);
  };
}
```

Điểm chung: tất cả đều cần **state tồn tại giữa các lần gọi** nhưng **không muốn để lộ ra global**. Closure là công cụ tự nhiên nhất cho việc đó — cũng chính là nền tảng của event handler, callback và hooks trong React.

</details>

**15. Với `let`/`const` và ES Module ngày nay, `IIFE` còn cần thiết không? Trước đây nó được dùng để giải quyết vấn đề gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Trước đây** JS chỉ có `var` (function scope) và chưa có module. Mọi file `<script>` đều đổ biến vào cùng một global, nên rất dễ đụng độ tên và làm bẩn `window`. **IIFE** (Immediately Invoked Function Expression) là cách duy nhất tạo ra một scope riêng để cô lập code:

```js
(function () {
  const internalState = {};
  // ...
})();
```

Nó giải quyết ba việc: tạo scope riêng, giấu biến private, và tránh làm bẩn global.

**Ngày nay** cả ba việc đó đã có giải pháp tốt hơn:

- `let`/`const` cho **block scope** — chỉ cần `{ ... }` là đủ cô lập.
- **ES Module** có scope riêng theo file; muốn lộ ra thì phải `export`.
- Bundler và strict mode xử lý phần còn lại.

Nên **IIFE gần như không còn cần thiết** trong code mới. Nó vẫn còn chỗ dùng: cô lập code legacy, viết script chèn trực tiếp vào trang, hoặc `(async () => { ... })()` khi cần `await` ở nơi chưa hỗ trợ top-level await. Ngoài ra, đọc hiểu IIFE vẫn quan trọng vì bundler và thư viện cũ đầy pattern này.

</details>

**16. Đặt biến ở scope càng nhỏ càng tốt mang lại lợi ích gì? Vì sao biến global bị coi là mùi code xấu (trừ hằng số)?**

<details className="qa">
<summary>Xem đáp án</summary>

**Lợi ích của scope nhỏ** (khai báo biến càng gần nơi dùng càng tốt):

- **Dễ đọc**: người đọc chỉ cần quét vài dòng là biết biến được dùng ở đâu, gán ở đâu.
- **Dễ suy luận và debug**: số nơi có thể sửa biến ít đi, nên lỗi dễ khoanh vùng.
- **Dễ refactor**: tách hàm, đổi tên, xoá code chết đều an toàn hơn.
- **Tốt cho bộ nhớ**: biến hết scope là được thu hồi, không sống dai vô ích.

**Vì sao global là mùi code xấu:**

- **Đụng độ tên**: hai đoạn code không liên quan vô tình dùng cùng tên sẽ ghi đè nhau.
- **Không kiểm soát được ai sửa**: `count = 999` từ bất kỳ đâu cũng phá được state, không có gì bảo vệ.
- **Khó test**: state toàn cục rò rỉ giữa các test case, kết quả phụ thuộc thứ tự chạy.
- **Coupling ngầm**: các module phụ thuộc nhau qua biến global thay vì qua tham số/`import` rõ ràng.

**Ngoại lệ**: hằng số cấu hình (`const MAX_RETRIES`, `API_URL`) — bất biến, không mang state, nên an toàn. Với ES Module thì top-level vốn đã không còn là global, cứ `export` thứ cần chia sẻ là đủ.

</details>
