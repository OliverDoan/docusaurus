---
sidebar_position: 1
title: "1. Scope, Closure & Hoisting"
---

# Scope, Closure & Hoisting

> *Đây là vòng "lọc" của hầu hết các công ty. Nếu bạn lúng túng phần này, interviewer sẽ kết luận bạn "biết dùng nhưng không hiểu" — và phỏng vấn gần như kết thúc tại đây.*

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

### Code minh hoạ

```javascript
console.log(typeof sayHi);  // "function"
console.log(typeof sayBye); // "undefined"

sayHi();  // "hi" — OK
// sayBye(); // TypeError: sayBye is not a function

function sayHi() { console.log("hi"); }
var sayBye = function () { console.log("bye"); };
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

## Câu 5: Lexical scope vs Dynamic scope — JavaScript là cái nào? `[Senior]`

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

## Câu 6: IIFE còn cần thiết trong code modern không? `[Senior]`

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
