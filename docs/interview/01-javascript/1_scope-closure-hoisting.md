---
sidebar_position: 1
title: "1. Scope, Closure & Hoisting"
---

# Scope, Closure & Hoisting

> *Đây là vòng "lọc" của hầu hết các công ty. Nếu bạn lúng túng phần này, interviewer sẽ kết luận bạn "biết dùng nhưng không hiểu" — và phỏng vấn gần như kết thúc tại đây.*

:::note[Ghi nhớ nhanh]

- ⭐ **`Closure`** — function + lexical environment, "nhớ" biến scope ngoài kể cả khi scope đó đã pop khỏi call stack (nền tảng của `debounce`, `memoize`).
- ⭐ **`var` vs `let`/`const`** — `var` function-scoped + hoist init `undefined`; `let`/`const` block-scoped, nằm trong `TDZ`.
- **Hoisting** — chỉ function declaration được hoist cả body; function expression và arrow theo luật hoist của biến.
- **Closure trong loop** — `var` chia sẻ 1 binding (`3 3 3`), `let` tạo binding mới mỗi vòng (`0 1 2`).
- **Lexical scope & scope chain** — JS resolve biến theo nơi định nghĩa, tra cứu một chiều từ trong ra ngoài.
- **`const`** — chỉ chặn re-assignment, không freeze object; `IIFE` nay gần như bị thay bởi ESM + block scope.

:::

---

## Câu 1: `var`, `let`, `const` khác nhau như thế nào? `[Intermediate]`

### Câu hỏi

> Em đã làm React một thời gian rồi nhỉ. Cho anh hỏi nhanh — `var`, `let`, `const` khác nhau ở những điểm nào? Trong dự án em mặc định dùng cái nào, và tại sao?

### Giải thích lý thuyết

| Tính chất          | `var`                    | `let`             | `const`           |
| ------------------ | ------------------------ | ----------------- | ----------------- |
| Scope              | Function scope           | Block scope       | Block scope       |
| Hoisting           | Có, init `undefined`     | Có, nằm trong TDZ | Có, nằm trong TDZ |
| Re-declaration     | Cho phép                 | Không             | Không             |
| Re-assignment      | Cho phép                 | Cho phép          | Không             |

**TDZ (Temporal Dead Zone)** là khoảng từ đầu block tới chỗ khai báo. Trong TDZ, truy cập biến sẽ throw `ReferenceError`.

### Code minh hoạ

```javascript
function demo() {
  if (true) {
    var a = 1;
    let b = 2;
    const c = 3;
  }
  console.log(a); // 1 — var thoát block
  // console.log(b); // ReferenceError
}

const user = { name: "An" };
user.name = "Bình"; // OK — const không ngăn mutation
// user = {};       // TypeError — const ngăn re-assignment
```

### Đáp án mẫu

> "`var` là function-scoped, được hoist và init `undefined`, nên dễ gây bug khi quên khai báo. `let` và `const` là block-scoped, nằm trong TDZ. `const` chỉ chặn re-assignment chứ không freeze object. Em mặc định dùng `const`, chuyển sang `let` khi cần reassign, và gần như không dùng `var` trong code mới."

---

## Câu 2: Closure là gì? Cho một use case thực tế trong dự án em đã làm `[Intermediate]`

### Câu hỏi

> Closure thì chắc em đọc qua rồi. Cho anh ví dụ closure mà em **đã thực sự dùng** trong dự án — không phải counter trong sách giáo khoa.

### Giải thích lý thuyết

Closure = **function + lexical environment** mà function đó được tạo ra. Function "nhớ" biến của scope ngoài kể cả khi scope ngoài đã pop khỏi call stack.

Closure tồn tại vì JavaScript dùng **lexical scoping** — scope được xác định lúc viết code, không phải lúc gọi hàm.

### Code minh hoạ

```javascript
// Use case 1: Debounce (dùng trong search input)
function debounce(fn, delay) {
  let timer; // closure "giữ" timer giữa các lần gọi
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const search = debounce((q) => fetchAPI(q), 300);
input.addEventListener("input", (e) => search(e.target.value));

// Use case 2: Custom hook giữ state giữa render
function useCounter(initial) {
  let count = initial;
  return {
    inc: () => ++count,
    get: () => count,
  };
}

// Use case 3: Cache / memoize
function memoize(fn) {
  const cache = new Map();
  return (key) => {
    if (!cache.has(key)) cache.set(key, fn(key));
    return cache.get(key);
  };
}
```

### Đáp án mẫu

> "Closure là khi một function giữ tham chiếu tới biến của lexical scope ngoài, ngay cả khi scope đó đã kết thúc. Em dùng nhiều nhất khi viết `debounce`/`throttle` cho search input — biến `timer` được giữ giữa các lần gọi nhờ closure. Một use case khác là khi viết hàm `memoize` cho các phép tính tốn kém, `cache` Map được đóng kín trong closure thay vì để global."

---

## Câu 3: Hoisting — function declaration vs function expression `[Intermediate]`

### Câu hỏi

> Đoạn code này output gì? Tại sao?
>
> ```javascript
> sayHi();
> sayBye();
>
> function sayHi() { console.log("hi"); }
> var sayBye = function () { console.log("bye"); };
> ```

### Giải thích lý thuyết

- **Function declaration** được hoist **toàn bộ** (cả tên và body) → gọi trước khi khai báo vẫn được.
- **Function expression** gán vào `var` → chỉ biến được hoist với giá trị `undefined`, gọi sẽ throw `TypeError: undefined is not a function`.
- Nếu gán vào `let`/`const` → biến nằm trong TDZ, throw `ReferenceError`.

Quy tắc cốt lõi: **chỉ function declaration mới được hoist như một hàm**. Mọi dạng *gán cho biến* — dù là function expression, **arrow function**, hay **named function expression** — đều tuân theo luật hoisting của **biến** (`var`/`let`/`const`), KHÔNG phải của hàm:

| Cách viết                              | Hoist gì?                          | Gọi trước khi khai báo |
| -------------------------------------- | ---------------------------------- | ---------------------- |
| `function f() {}`                      | Toàn bộ hàm (tên + body)           | ✅ OK                   |
| `var f = function () {}`               | Chỉ biến `f` = `undefined`         | ❌ `TypeError`          |
| `var f = () => {}` (arrow)             | Chỉ biến `f` = `undefined`         | ❌ `TypeError`          |
| `const f = () => {}` / `let f = ...`   | Biến `f` trong TDZ                 | ❌ `ReferenceError`     |
| `var f = function g() {}` (named expr) | Chỉ biến `f` = `undefined`; tên `g` chỉ thấy bên trong body | ❌ `TypeError` |

Điểm hay bị nhầm: **arrow function "trông như khai báo hàm" nhưng bản chất là một expression gán cho biến** → không được hoist như function. Và với **named function expression** (`var f = function g(){}`), cái tên `g` chỉ tồn tại bên trong thân hàm (dùng cho đệ quy), bên ngoài gọi `g()` sẽ `ReferenceError`.

### Code minh hoạ

```javascript
console.log(typeof sayHi);  // "function"
console.log(typeof sayBye); // "undefined"

sayHi();  // "hi" — OK
// sayBye(); // TypeError: sayBye is not a function

function sayHi() { console.log("hi"); }
var sayBye = function () { console.log("bye"); };
```

```javascript
// Arrow function cũng chỉ là expression gán cho biến → KHÔNG hoist như hàm
// add(2, 3);        // TypeError: add is not a function (var) hoặc ReferenceError (const)
var add = (a, b) => a + b;

// const → vào TDZ, lỗi rõ ràng hơn
// mul(2, 3);        // ReferenceError: Cannot access 'mul' before initialization
const mul = (a, b) => a * b;

// Named function expression: tên `fact` chỉ thấy BÊN TRONG body (để đệ quy)
var f = function fact(n) {
  return n <= 1 ? 1 : n * fact(n - 1); // gọi `fact` bên trong: OK
};
console.log(f(5));   // 120
// console.log(fact); // ReferenceError: fact is not defined (ngoài body không thấy)
```

### Đáp án mẫu

> "Output sẽ là `'hi'` rồi `TypeError`. `sayHi` là function declaration nên cả body được hoist, gọi trước khai báo OK. `sayBye` là function expression gán cho `var` — chỉ biến `sayBye` được hoist với giá trị `undefined`, nên khi gọi nó như function sẽ throw. Vì lý do này, em mặc định dùng `const fn = () => {}` để bug kiểu này thành ReferenceError rõ ràng thay vì TypeError mơ hồ."

---

## Câu 4: Closure trong loop — output là gì? `[Senior]`

### Câu hỏi

> ```javascript
> for (var i = 0; i < 3; i++) {
>   setTimeout(() => console.log(i), 0);
> }
> ```
>
> Output? Và đổi `var` thành `let` thì output thay đổi không, tại sao?

### Giải thích lý thuyết

- `var` là function-scoped → cả vòng loop dùng **1 biến `i` duy nhất**. Callback đọc `i` tại thời điểm timeout fires (lúc đó loop đã kết thúc, `i = 3`).
- `let` là block-scoped → **mỗi iteration** sinh ra một binding `i` mới. Mỗi callback closure giữ tham chiếu tới binding riêng.

### Code minh hoạ

```javascript
// var → 3, 3, 3
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}

// let → 0, 1, 2
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}

// Cách fix var trước ES6: IIFE
for (var i = 0; i < 3; i++) {
  ((j) => setTimeout(() => console.log(j), 0))(i);
}
```

### Đáp án mẫu

> "Với `var`, output là `3 3 3` vì `var` function-scoped — chỉ có một biến `i`, callbacks chạy sau loop nên đọc giá trị cuối cùng. Với `let`, output là `0 1 2` vì spec ES6 quy định mỗi iteration của `for(let)` tạo một fresh binding. Đây là một trong những lý do `let`/`const` được đưa vào — fix một class bug rất phổ biến mà trước ES6 phải xử lý bằng IIFE."

---

## Câu 5: Giải thích **cơ chế** tại sao `let` và `var` cho kết quả khác nhau `[Senior]`

### Câu hỏi

> ```javascript
> for (let i = 0; i < 3; i++) {
>   setTimeout(() => console.log(i), 100);
> }
> // In ra: 0, 1, 2 (mỗi vòng có scope riêng)
>
> for (var j = 0; j < 3; j++) {
>   setTimeout(() => console.log(j), 100);
> }
> // In ra: 3, 3, 3 (j được share, đã là 3 khi setTimeout chạy)
> ```
>
> Câu 4 em đã trả lời output rồi. Giờ giải thích **chính xác** engine làm gì khác nhau giữa hai vòng loop? Tại sao `let` lại "tạo scope riêng cho mỗi vòng"?

### Giải thích lý thuyết

Mấu chốt nằm ở **hai yếu tố cộng lại**: (1) `setTimeout` là **bất đồng bộ** — callback không chạy ngay mà bị đẩy vào hàng đợi, chỉ chạy **sau khi loop đã kết thúc hoàn toàn**; (2) closure giữ **tham chiếu tới binding**, không phải copy giá trị tại thời điểm tạo.

**Với `var` — chỉ có MỘT binding `j` duy nhất:**

- `var j` là function-scoped → toàn bộ loop dùng chung **một ô nhớ `j`**.
- Cả 3 callback đều closure tới **cùng một `j`** đó.
- Loop chạy đồng bộ tới khi `j = 3` (điều kiện `j < 3` sai → thoát). *Sau đó* event loop mới lấy các callback ra chạy → cả 3 đọc cùng một `j`, lúc này đã là `3`.

```
Bộ nhớ:  [ j ] ←── cb1, cb2, cb3 cùng trỏ vào đây
Loop xong: j = 3
Callback chạy: đọc j → 3, 3, 3
```

**Với `let` — MỖI iteration một binding mới:**

Spec ES6 quy định: trong `for (let i ...)`, mỗi lần lặp engine tạo một **binding `i` mới** và **copy giá trị** của lần lặp trước sang. Tức là có 3 ô nhớ `i` riêng biệt (i₀=0, i₁=1, i₂=2).

- Callback của vòng 1 closure tới `i₀`, vòng 2 tới `i₁`, vòng 3 tới `i₂`.
- Khi callback chạy, mỗi cái đọc binding riêng của nó → `0, 1, 2`.

```
Bộ nhớ:  [i₀=0] ← cb1    [i₁=1] ← cb2    [i₂=2] ← cb3
Callback chạy: 0, 1, 2
```

### Code minh hoạ

```javascript
// Chứng minh "var share 1 binding": gán callback đọc biến NGOÀI loop cũng ra 3
for (var j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 100);
}
console.log("j sau loop =", j); // 3 — j vẫn truy cập được ngoài loop (function-scoped)

// Chứng minh "let tạo binding mới mỗi vòng": j không tồn tại ngoài loop
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// console.log(i); // ReferenceError — i chỉ sống trong block của loop

// Tự "tái tạo" hành vi let bằng var + IIFE (đóng băng giá trị mỗi vòng)
for (var k = 0; k < 3; k++) {
  ((snapshot) => setTimeout(() => console.log(snapshot), 100))(k);
}
// 0, 1, 2 — IIFE copy k vào tham số `snapshot` (binding riêng mỗi lần gọi)
```

> **Lưu ý:** nếu bỏ `setTimeout` đi và `console.log(j)` chạy đồng bộ ngay trong loop thì cả `var` lẫn `let` đều in `0, 1, 2`. Sự khác biệt **chỉ lộ ra khi callback chạy bất đồng bộ** (sau khi loop kết thúc). Đây là điểm interviewer hay gài để xem ứng viên có hiểu vai trò của tính bất đồng bộ hay không.

### Đáp án mẫu

> "Khác biệt đến từ hai thứ cộng lại. Thứ nhất, `setTimeout` là bất đồng bộ — callback chỉ chạy sau khi loop kết thúc. Thứ hai, closure giữ *tham chiếu* tới biến chứ không copy giá trị. Với `var`, cả loop dùng chung một binding `j`; loop chạy xong `j = 3` rồi callback mới chạy nên cả ba đọc `3`. Với `let`, spec ES6 tạo một binding mới cho mỗi iteration và copy giá trị sang, nên ba callback closure tới ba ô nhớ khác nhau → `0, 1, 2`. Em hay kiểm chứng bằng cách: `var` thì `j` vẫn truy cập được sau loop (function-scoped), còn `let` thì `i` chết ngay khi ra khỏi block. Nếu muốn `var` hành xử như `let` thì dùng IIFE để snapshot giá trị mỗi vòng."

---

## Câu 6: Lexical scope vs Dynamic scope — JavaScript là cái nào? `[Senior]`

### Câu hỏi

> Đoạn này log ra gì, và nếu JavaScript dùng dynamic scope thì sẽ thay đổi thế nào?
>
> ```javascript
> const value = "global";
> function printValue() { console.log(value); }
> function caller() {
>   const value = "local";
>   printValue();
> }
> caller();
> ```

### Giải thích lý thuyết

- **Lexical (static) scope**: scope quyết định bởi **chỗ function được định nghĩa** trong source code. JavaScript dùng cái này.
- **Dynamic scope**: scope quyết định bởi **chỗ function được gọi**. Một số ngôn ngữ như Bash/Perl từng dùng.

### Code minh hoạ

```javascript
const value = "global";

function printValue() {
  // Resolve `value` từ chỗ printValue được ĐỊNH NGHĨA → global
  console.log(value);
}

function caller() {
  const value = "local";
  printValue(); // "global" (không phải "local")
}

caller();

// Tuy nhiên `this` của JS lại được resolve động (giống dynamic scope cho `this`)
const obj = {
  value: "obj",
  print() { console.log(this.value); }
};
const fn = obj.print;
fn(); // undefined (trong strict mode) — `this` resolve theo cách gọi
```

### Đáp án mẫu

> "Output là `'global'`. JavaScript dùng lexical scoping — scope được xác định tại chỗ function được viết ra, không phải chỗ gọi. Nếu là dynamic scope thì `printValue` sẽ thấy `value = 'local'` của caller. Một điểm thú vị: `this` của JS lại resolve động giống dynamic scope, đó là lý do `this` hay bị nhầm — nó không tuân lexical scope như các biến thường."

---

## Câu 7: Scope chain hoạt động thế nào? Engine resolve một biến ra sao? `[Senior]`

### Câu hỏi

> Em nói JavaScript dùng lexical scope. Vậy khi engine gặp một biến trong hàm lồng nhau, nó **tìm biến đó theo cơ chế nào**? Đoạn này log ra gì?
>
> ```javascript
> const a = "global-a";
>
> function outer() {
>   const b = "outer-b";
>   function inner() {
>     const c = "inner-c";
>     console.log(a, b, c);
>   }
>   return inner;
> }
>
> outer()();
> ```

### Giải thích lý thuyết

Mỗi function khi được tạo ra mang theo một tham chiếu tới **lexical environment cha** (nơi nó được **định nghĩa**). Chuỗi các environment nối tiếp nhau này gọi là **scope chain**.

Khi engine cần resolve một biến, nó tra cứu theo **một chiều — từ trong ra ngoài**:

1. Tìm trong **scope hiện tại** (local). Có → dùng.
2. Không có → leo lên **scope cha** trong scope chain.
3. Lặp lại tới khi gặp → dừng. Tới **global** vẫn không có → `ReferenceError` (hoặc `undefined` nếu là property của global object).

Hai điểm cốt lõi interviewer muốn nghe:

- **Một chiều**: scope trong nhìn thấy scope ngoài, **không có chiều ngược lại**. `outer` không thấy `c` của `inner`.
- **Theo nơi định nghĩa, không phải nơi gọi**: dù `inner` được gọi ở global (`outer()()`), scope chain của nó vẫn là `inner → outer → global` vì đó là nơi nó được **viết ra**. Đây chính là biểu hiện của lexical scope + nền tảng của closure.

```
Scope chain của inner:
[ inner: c ] → [ outer: b ] → [ global: a ]
   tìm c ✔        tìm b ✔         tìm a ✔
```

### Code minh hoạ

```javascript
const a = "global-a";

function outer() {
  const b = "outer-b";
  function inner() {
    const c = "inner-c";
    console.log(a, b, c); // "global-a outer-b inner-c" — leo scope chain
  }
  return inner;
}
outer()(); // chạy được dù gọi ngoài outer — scope chain gắn lúc ĐỊNH NGHĨA

// Chiều ngược lại KHÔNG tồn tại:
function parent() {
  function child() {
    const secret = 42;
  }
  child();
  // console.log(secret); // ReferenceError — parent không nhìn vào scope con
}

// Mỗi lần gọi tạo một environment MỚI → đếm độc lập
function makeCounter() {
  let n = 0;
  return () => ++n;
}
const c1 = makeCounter();
const c2 = makeCounter();
console.log(c1(), c1(), c2()); // 1 2 1 — c1 và c2 có scope chain riêng
```

### Đáp án mẫu

> "Mỗi hàm khi tạo ra giữ tham chiếu tới lexical environment cha — nơi nó được định nghĩa. Chuỗi các environment đó là scope chain. Khi resolve một biến, engine tìm từ scope hiện tại leo dần ra ngoài, gặp đâu dừng đó, tới global vẫn không có thì `ReferenceError`. Quan trọng là chuỗi này một chiều — trong thấy ngoài, ngoài không thấy trong — và được cố định theo nơi hàm được **viết** chứ không phải nơi gọi. Trong ví dụ, dù `inner` được gọi ngoài `outer`, nó vẫn truy cập được `b` và `a` qua scope chain. Đó cũng là cơ chế nền cho closure."

---

## Câu 8: Variable shadowing — biến trong che biến ngoài `[Intermediate]`

### Câu hỏi

> Đoạn code này log ra gì? Giải thích theo scope chain.
>
> ```javascript
> let x = 1;
> function f() {
>   let x = 2;
>   {
>     let x = 3;
>     console.log(x);
>   }
>   console.log(x);
> }
> f();
> console.log(x);
> ```

### Giải thích lý thuyết

**Shadowing** xảy ra khi một biến ở scope trong có **cùng tên** với biến scope ngoài. Vì scope chain resolve **từ trong ra ngoài** và **dừng ở lần gặp đầu tiên**, biến trong sẽ "che" (shadow) biến ngoài trong phạm vi của nó — biến ngoài không bị thay đổi, chỉ tạm thời bị che khuất.

- Trong block trong cùng: `x` resolve về `x = 3` (gặp ngay).
- Trong thân `f` nhưng ngoài block: `x = 3` đã hết scope → resolve về `x = 2`.
- Ngoài `f`: resolve về `x = 1` global.

→ Output: `3`, `2`, `1`.

**Bẫy đi kèm — shadowing với `var` vs `let`:** `var` không tạo block scope nên không shadow trong block; còn TDZ làm việc shadow bằng `let` dễ sinh `ReferenceError` nếu dùng biến trước khai báo:

```javascript
let y = 1;
function g() {
  console.log(y); // ReferenceError! — KHÔNG phải in 1
  let y = 2;      // khai báo này "kéo" y vào TDZ của cả block g
}
```

Nhiều người tưởng dòng `console.log(y)` in `1` (lấy `y` global), nhưng vì trong `g` có khai báo `let y`, biến `y` của hàm `g` đã được hoist vào đầu block và nằm trong **TDZ** → truy cập trước dòng khai báo throw `ReferenceError`.

### Code minh hoạ

```javascript
let x = 1;
function f() {
  let x = 2;
  {
    let x = 3;
    console.log(x); // 3 — block trong cùng
  }
  console.log(x);   // 2 — thân f
}
f();
console.log(x);     // 1 — global (không bị thay đổi)

// Shadowing là hợp lệ, nhưng dễ gây nhầm → nhiều linter cảnh báo "no-shadow"
```

### Đáp án mẫu

> "Output là `3`, `2`, `1`. Đây là shadowing — mỗi scope khai báo lại `x` nên scope chain dừng ngay ở binding gần nhất, biến ngoài bị che chứ không bị sửa. Block trong cùng thấy `x = 3`, thân hàm thấy `x = 2`, global vẫn là `1`. Em tránh shadowing trùng tên cho biến khác ý nghĩa vì dễ gây nhầm — thường bật rule `no-shadow` của ESLint. Một bẫy liên quan là nếu shadow bằng `let` mà dùng biến trước dòng khai báo thì dính TDZ, throw `ReferenceError` chứ không lấy biến ngoài như nhiều người tưởng."

---

## Câu 9: IIFE còn cần thiết trong code modern không? `[Senior]`

### Câu hỏi

> Trước ES6, IIFE được dùng khắp nơi để tạo module pattern. Ngày nay với ES Modules và block scope, em còn lý do nào để dùng IIFE không?

### Giải thích lý thuyết

IIFE giải quyết 2 vấn đề lịch sử:

1. **Tạo private scope** → giờ đã có `let`/`const` block-scoped.
2. **Tránh ô nhiễm global** → giờ đã có ES Modules (`import`/`export`).

Nhưng IIFE vẫn có chỗ đứng trong:
- Top-level `await` ở môi trường không phải ES Module (script tag, CommonJS cũ).
- Tạo expression trả về từ logic phức tạp (switch, nhiều branch).

### Code minh hoạ

```javascript
// Top-level await trong script không phải module
(async () => {
  const data = await fetch("/api/config").then(r => r.json());
  initApp(data);
})();

// Expression hoá complex logic
const config = (() => {
  if (process.env.NODE_ENV === "production") return prodConfig;
  if (process.env.NODE_ENV === "staging") return stagingConfig;
  return devConfig;
})();
```

### Đáp án mẫu

> "Trong code modern, em ít khi viết IIFE vì ES Modules và `let`/`const` đã thay thế gần hết use case. Hai trường hợp em vẫn dùng: thứ nhất là chạy async code ở top-level của file không phải module — `(async () => { ... })()`; thứ hai là khi muốn ép kết quả của một block logic thành một expression để gán vào `const`, ví dụ với switch nhiều branch. Ngoài hai trường hợp đó thì IIFE thường là code smell — gợi ý cần refactor thành function có tên hoặc module riêng."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                          | Đúng là                                                                             |
| ------------------------------------------------ | ----------------------------------------------------------------------------------- |
| "Hoisting di chuyển code lên đầu file"           | Hoisting chỉ là cách JS engine xử lý **khai báo** trong compilation phase           |
| "`let`/`const` không được hoist"                 | Vẫn được hoist, nhưng nằm trong TDZ                                                 |
| "`const` tạo biến immutable"                     | `const` chỉ chặn re-assignment; object/array vẫn mutate được                        |
| "Closure là function bên trong function"         | Closure = function + lexical env. "Function trong function" chỉ là điều kiện cần    |
| "Closure luôn gây memory leak"                   | Chỉ leak khi giữ reference không cần thiết, không phải bản chất của closure         |
| "Arrow function được hoist như function declaration" | Không — arrow là expression gán cho biến, theo luật hoist của `var`/`let`/`const`  |
