---
sidebar_position: 1
title: "1. Scope, Closures & Hoisting"
---

# Scope, Closures & Hoisting

Phần này tổng hợp những câu hỏi phỏng vấn phổ biến nhất về Scope, Closures và Hoisting trong JavaScript. Đây là nền tảng mà hầu hết interviewer sẽ hỏi ở vòng đầu tiên, vì nó phản ánh rõ bạn hiểu JavaScript "sâu" đến đâu.

---


---

## Mục lục

- [Câu 1: Phân biệt `var`, `let`, `const` -- Block scope vs Function scope `[Intermediate]`](#câu-1-phân-biệt-var-let-const-block-scope-vs-function-scope-intermediate)
- [Câu 2: Hoisting -- biến, function declaration vs expression `[Intermediate]`](#câu-2-hoisting-biến-function-declaration-vs-expression-intermediate)
- [Câu 3: Closures -- định nghĩa, use cases `[Intermediate]`](#câu-3-closures-định-nghĩa-use-cases-intermediate)
- [Câu 4: IIFE và Module Pattern `[Intermediate]`](#câu-4-iife-và-module-pattern-intermediate)
- [Câu 5: Lexical Environment và Scope Chain `[Senior]`](#câu-5-lexical-environment-và-scope-chain-senior)
- [Câu 6: Closures trong loops -- Classic tricky question `[Senior]`](#câu-6-closures-trong-loops-classic-tricky-question-senior)
- [Lỗi thường gặp khi trả lời](#lỗi-thường-gặp-khi-trả-lời)

---

## Câu 1: Phân biệt `var`, `let`, `const` -- Block scope vs Function scope `[Intermediate]`

### Câu hỏi

> Hãy giải thích sự khác nhau giữa `var`, `let` và `const`. Khi nào nên dùng cái nào?

### Giải thích lý thuyết

JavaScript có hai loại scope chính cho biến:

- **Function scope**: Biến tồn tại trong toàn bộ hàm chứa nó. `var` tuân theo kiểu này.
- **Block scope**: Biến chỉ tồn tại bên trong cặp `{}` gần nhất. `let` và `const` tuân theo kiểu này.

| Tính chất | `var` | `let` | `const` |
|---|---|---|---|
| Scope | Function scope | Block scope | Block scope |
| Hoisting | Có, khởi tạo `undefined` | Có, nhưng nằm trong TDZ | Có, nhưng nằm trong TDZ |
| Re-declaration | Cho phép | Không cho phép | Không cho phép |
| Re-assignment | Cho phép | Cho phép | Không cho phép |
| Temporal Dead Zone | Không | Có | Có |

**TDZ (Temporal Dead Zone)** là khoảng thời gian từ khi block bắt đầu cho đến khi biến được khai báo. Truy cập biến trong TDZ sẽ gây ra `ReferenceError`.

### Code ví dụ

```javascript
// Function scope vs Block scope
function demoScope() {
  if (true) {
    var a = 1;   // function scope -> tồn tại trong toàn bộ hàm
    let b = 2;   // block scope -> chỉ tồn tại trong if
    const c = 3; // block scope -> chỉ tồn tại trong if
  }

  console.log(a); // 1 -- var "thoát" ra khỏi block
  // console.log(b); // ReferenceError: b is not defined
  // console.log(c); // ReferenceError: c is not defined
}

// Re-declaration
var x = 1;
var x = 2; // OK, không lỗi

let y = 1;
// let y = 2; // SyntaxError: Identifier 'y' has already been declared

// const và mutation
const user = { name: "An" };
user.name = "Bình"; // OK! const chỉ ngăn re-assignment, không ngăn mutation
console.log(user.name); // "Bình"

// const user = { name: "Cường" }; // TypeError: Assignment to constant variable
```

### Đáp án mẫu

> "`var` là function-scoped và được hoisted với giá trị `undefined`. `let` và `const` là block-scoped và nằm trong Temporal Dead Zone cho đến khi được khai báo. `const` không cho re-assign nhưng object được khai báo bằng `const` vẫn có thể bị mutate. Trong thực tế, tôi mặc định dùng `const`, chỉ dùng `let` khi cần thay đổi giá trị, và hầu như không bao giờ dùng `var` để tránh các lỗi liên quan đến scope."

---

## Câu 2: Hoisting -- biến, function declaration vs expression `[Intermediate]`

### Câu hỏi

> Giải thích hoisting trong JavaScript. Function declaration và function expression được hoist khác nhau như thế nào?

### Giải thích lý thuyết

**Hoisting** là cơ chế JavaScript "di chuyển" phần khai báo lên đầu scope trước khi code chạy. Nhưng cần hiểu chính xác:

- **Function declaration**: Được hoist **toàn bộ** (cả tên và body). Bạn có thể gọi hàm trước khi khai báo.
- **Function expression**: Chỉ **tên biến** được hoist (nếu dùng `var`), body thì không. Gọi trước khai báo sẽ bị lỗi.
- **`var`**: Được hoist và khởi tạo bằng `undefined`.
- **`let`/`const`**: Được hoist nhưng **không khởi tạo** (TDZ).

### Code ví dụ

```javascript
// ===== Function Declaration: hoist toàn bộ =====
sayHello(); // "Xin chào!" -- chạy được trước khi khai báo

function sayHello() {
  console.log("Xin chào!");
}

// ===== Function Expression: chỉ hoist biến =====
// sayBye(); // TypeError: sayBye is not a function

var sayBye = function () {
  console.log("Tạm biệt!");
};

// ===== Arrow function expression cũng tương tự =====
// greet(); // TypeError: greet is not a function

var greet = () => {
  console.log("Hey!");
};

// ===== var hoisting =====
console.log(a); // undefined (không phải ReferenceError)
var a = 10;
console.log(a); // 10

// JavaScript "hiểu" đoạn code trên như:
// var a;           // hoist lên đầu
// console.log(a); // undefined
// a = 10;
// console.log(a); // 10

// ===== let/const hoisting với TDZ =====
// console.log(b); // ReferenceError: Cannot access 'b' before initialization
let b = 20;

// ===== Trick question: function trong block =====
// Hành vi này khác nhau giữa strict mode và non-strict mode
// Nên tránh khai báo function trong block
```

### Đáp án mẫu

> "Hoisting là cơ chế JavaScript di chuyển khai báo lên đầu scope. Function declaration được hoist toàn bộ, nên có thể gọi trước khi khai báo. Function expression chỉ hoist phần biến -- nếu dùng `var` thì biến là `undefined`, nếu dùng `let`/`const` thì nằm trong TDZ. Đây là lý do chính mà modern JS khuyên dùng `const` với arrow function để khai báo hàm, vì nó làm rõ ràng thứ tự phụ thuộc trong code."

---

## Câu 3: Closures -- định nghĩa, use cases `[Intermediate]`

### Câu hỏi

> Closure là gì? Cho 3 use case thực tế của closure trong dự án.

### Giải thích lý thuyết

**Closure** xảy ra khi một hàm "nhớ" được các biến từ scope bên ngoài, ngay cả khi hàm bên ngoài đã thực thi xong. Về bản chất, closure là sự kết hợp của:

1. Một **hàm** (function)
2. Và **lexical environment** nơi hàm đó được tạo ra

Closure tồn tại vì JavaScript sử dụng **lexical scoping** -- scope được xác định tại thời điểm viết code, không phải tại thời điểm chạy code.

### Code ví dụ

```javascript
// ===== Use Case 1: Data Privacy (Module Pattern) =====
function createWallet(initialBalance) {
  let balance = initialBalance; // "private" variable

  return {
    deposit(amount) {
      if (amount <= 0) throw new Error("Số tiền phải lớn hơn 0");
      balance += amount;
      return balance;
    },
    withdraw(amount) {
      if (amount > balance) throw new Error("Không đủ số dư");
      balance -= amount;
      return balance;
    },
    getBalance() {
      return balance;
    },
  };
}

const wallet = createWallet(100);
console.log(wallet.getBalance()); // 100
wallet.deposit(50);               // 150
wallet.withdraw(30);              // 120
// console.log(wallet.balance);   // undefined -- không truy cập trực tiếp được!

// ===== Use Case 2: Factory Functions =====
function createMultiplier(multiplier) {
  return function (number) {
    return number * multiplier; // "nhớ" multiplier từ scope bên ngoài
  };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15

// ===== Use Case 3: Event Handlers với trạng thái =====
function createClickCounter(buttonId) {
  let count = 0; // Mỗi button có count riêng

  const button = document.getElementById(buttonId);
  button.addEventListener("click", function () {
    count++;
    button.textContent = `Đã click ${count} lần`;
  });
}

// Mỗi lần gọi tạo một closure độc lập
createClickCounter("btn-1");
createClickCounter("btn-2");
```

### Đáp án mẫu

> "Closure là khi một hàm giữ tham chiếu đến các biến trong lexical scope của nó, ngay cả khi scope đó đã kết thúc. Ba use case phổ biến nhất là: (1) data privacy -- tạo biến 'private' mà bên ngoài không truy cập trực tiếp được, (2) factory functions -- tạo các hàm tùy chỉnh từ một hàm gốc, và (3) event handlers -- mỗi handler có thể giữ trạng thái riêng mà không cần biến global."

---

## Câu 4: IIFE và Module Pattern `[Intermediate]`

### Câu hỏi

> IIFE là gì? Tại sao trước ES6, IIFE được dùng rất nhiều? Ngày nay còn cần dùng không?

### Giải thích lý thuyết

**IIFE (Immediately Invoked Function Expression)** là một hàm được định nghĩa và gọi ngay lập tức. Cú pháp:

```javascript
(function () {
  // code chạy ngay
})();
```

Trước ES6, JavaScript chỉ có function scope (không có `let`/`const`). IIFE là cách **duy nhất** để tạo scope riêng, tránh ô nhiễm global namespace. Đây là nền tảng của **Module Pattern**.

Ngày nay với ES Modules (`import`/`export`) và block scope (`let`/`const`), IIFE ít được dùng hơn. Nhưng vẫn hữu ích trong một số trường hợp.

### Code ví dụ

```javascript
// ===== IIFE cơ bản =====
(function () {
  const secret = "Mật khẩu cực kỳ bí mật";
  console.log(secret); // "Mật khẩu cực kỳ bí mật"
})();

// console.log(secret); // ReferenceError -- secret không lộ ra ngoài

// ===== Module Pattern với IIFE =====
const CounterModule = (function () {
  // Private state
  let count = 0;

  // Private function
  function log(message) {
    console.log(`[Counter] ${message}`);
  }

  // Public API
  return {
    increment() {
      count++;
      log(`Tăng lên ${count}`);
      return count;
    },
    decrement() {
      count--;
      log(`Giảm xuống ${count}`);
      return count;
    },
    getCount() {
      return count;
    },
  };
})();

CounterModule.increment(); // [Counter] Tăng lên 1
CounterModule.increment(); // [Counter] Tăng lên 2
CounterModule.decrement(); // [Counter] Giảm xuống 1
console.log(CounterModule.getCount()); // 1
// CounterModule.count -- undefined (private)
// CounterModule.log  -- undefined (private)

// ===== IIFE với tham số =====
(function (global, $) {
  // Tránh xung đột với thư viện khác
  // global = window, $ = jQuery
  global.myApp = {
    init() {
      $(".container").show();
    },
  };
})(window, jQuery);

// ===== Trường hợp IIFE vẫn hữu ích ngày nay =====
// 1. Async IIFE trong file không phải module
(async function () {
  const data = await fetch("/api/data");
  const json = await data.json();
  console.log(json);
})();

// 2. Tạo block scope cho switch case
const result = (() => {
  switch (type) {
    case "A":
      return handleA();
    case "B":
      return handleB();
    default:
      return handleDefault();
  }
})();
```

### Đáp án mẫu

> "IIFE là một function expression được gọi ngay khi định nghĩa. Trước ES6, nó là cách chính để tạo private scope vì JavaScript chỉ có function scope. Module Pattern dựa trên IIFE để tạo public API và private state. Ngày nay với ES Modules và `let`/`const`, IIFE ít cần thiết hơn, nhưng vẫn hữu ích khi cần async top-level execution hoặc tạo giá trị từ complex logic."

---

## Câu 5: Lexical Environment và Scope Chain `[Senior]`

### Câu hỏi

> Giải thích Lexical Environment là gì và scope chain hoạt động như thế nào khi JavaScript tìm kiếm một biến?

### Giải thích lý thuyết

Mỗi khi một execution context được tạo (gọi hàm, chạy script), JavaScript tạo một **Lexical Environment** gồm hai phần:

1. **Environment Record**: Lưu trữ các biến và hàm được khai báo trong scope hiện tại.
2. **Outer Reference**: Tham chiếu đến Lexical Environment của scope cha (nơi hàm được **định nghĩa**, không phải nơi hàm được **gọi**).

Khi truy cập một biến, JavaScript thực hiện **scope chain lookup**:

1. Tìm trong Environment Record hiện tại.
2. Nếu không thấy, đi theo outer reference lên scope cha.
3. Lặp lại cho đến khi tới Global Scope.
4. Nếu vẫn không thấy: `ReferenceError`.

### Code ví dụ

```javascript
const globalVar = "Global";

function outer() {
  const outerVar = "Outer";

  function middle() {
    const middleVar = "Middle";

    function inner() {
      const innerVar = "Inner";

      // Scope chain: inner -> middle -> outer -> global
      console.log(innerVar);  // "Inner"   -- tìm thấy ở inner
      console.log(middleVar); // "Middle"  -- tìm thấy ở middle
      console.log(outerVar);  // "Outer"   -- tìm thấy ở outer
      console.log(globalVar); // "Global"  -- tìm thấy ở global
    }

    inner();
  }

  middle();
}

outer();

// ===== Lexical scope vs Dynamic scope =====
// JavaScript dùng LEXICAL scope (static scope)
const value = "global";

function printValue() {
  console.log(value); // luôn là "global", không phải "local"
}

function callPrint() {
  const value = "local";
  printValue(); // "global" -- vì printValue được ĐỊNH NGHĨA ở global scope
}

callPrint(); // "global"

// ===== Scope chain với closure =====
function createCounter(name) {
  let count = 0;
  // Lexical Environment của createCounter:
  // { name: "...", count: 0 } -> outer: global

  return {
    increment() {
      count++;
      // Lexical Environment của increment:
      // {} -> outer: createCounter's env -> outer: global
      console.log(`${name}: ${count}`);
    },
  };
}

const counterA = createCounter("A");
const counterB = createCounter("B");

counterA.increment(); // "A: 1"
counterA.increment(); // "A: 2"
counterB.increment(); // "B: 1"
// Mỗi closure có Lexical Environment riêng, độc lập!
```

### Đáp án mẫu

> "Lexical Environment là cấu trúc dữ liệu mà JavaScript tạo ra mỗi khi một execution context mới xuất hiện. Nó gồm Environment Record (chứa biến/hàm trong scope hiện tại) và outer reference (trỏ đến scope cha). Scope chain là chuỗi các Lexical Environment liên kết qua outer reference. Khi tìm biến, engine đi từ trong ra ngoài theo chuỗi này. Điều quan trọng là scope được xác định tại thời điểm viết code (lexical), không phải tại thời điểm chạy. Đây chính là cơ sở để closure hoạt động."

---

## Câu 6: Closures trong loops -- Classic tricky question `[Senior]`

### Câu hỏi

> Cho đoạn code sau, output là gì? Làm sao để fix?

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(function () {
    console.log(i);
  }, 1000);
}
```

### Giải thích lý thuyết

Đây là câu hỏi kinh điển về closure trong loop:

- `var` là **function-scoped**, nên chỉ có **một biến `i` duy nhất** cho cả vòng loop.
- `setTimeout` callback là một closure, nó **tham chiếu đến biến `i`**, không phải **giá trị của `i`** tại thời điểm tạo callback.
- Khi callback chạy (sau 1 giây), vòng loop đã kết thúc và `i = 3`.
- Kết quả: in ra `3, 3, 3`.

### Code ví dụ

```javascript
// ===== Vấn đề =====
for (var i = 0; i < 3; i++) {
  setTimeout(function () {
    console.log(i); // 3, 3, 3
  }, 1000);
}

// ===== Fix 1: Dùng let (đơn giản nhất, khuyên dùng) =====
for (let i = 0; i < 3; i++) {
  setTimeout(function () {
    console.log(i); // 0, 1, 2
  }, 1000);
}
// let tạo block scope mới cho mỗi lần lặp -> mỗi callback có "bản sao" riêng của i

// ===== Fix 2: Dùng IIFE (cách cũ trước ES6) =====
for (var i = 0; i < 3; i++) {
  (function (j) {
    setTimeout(function () {
      console.log(j); // 0, 1, 2
    }, 1000);
  })(i);
  // IIFE tạo scope mới, "chụp lại" giá trị i vào tham số j
}

// ===== Fix 3: Dùng tham số thứ 3 của setTimeout =====
for (var i = 0; i < 3; i++) {
  setTimeout(
    function (j) {
      console.log(j); // 0, 1, 2
    },
    1000,
    i // Truyền i như tham số cho callback
  );
}

// ===== Fix 4: Dùng bind =====
for (var i = 0; i < 3; i++) {
  setTimeout(
    function (j) {
      console.log(j); // 0, 1, 2
    }.bind(null, i),
    1000
  );
}

// ===== Nâng cao: Hiểu sâu hơn =====
// Tại sao let fix được? Vì với mỗi iteration, JS tạo một
// Lexical Environment mới với bản sao của i.
// Tương đương với:
{
  let i = 0;
  setTimeout(() => console.log(i), 1000);
}
{
  let i = 1;
  setTimeout(() => console.log(i), 1000);
}
{
  let i = 2;
  setTimeout(() => console.log(i), 1000);
}
```

### Đáp án mẫu

> "Output là `3, 3, 3` vì `var` là function-scoped, chỉ có một biến `i` duy nhất. Các callback closure tham chiếu đến cùng một biến `i`, và khi chúng chạy thì `i` đã là 3. Cách fix đơn giản nhất là dùng `let` thay `var` -- `let` tạo block scope mới cho mỗi iteration, mỗi callback sẽ có bản sao riêng của `i`. Các cách khác là dùng IIFE để tạo scope mới hoặc truyền `i` qua tham số. Đây là ví dụ kinh điển cho thấy closure 'bắt' tham chiếu, không phải giá trị."

---

## Lỗi thường gặp khi trả lời

| Lỗi | Giải thích đúng |
|---|---|
| "Hoisting di chuyển code lên đầu file" | Hoisting chỉ di chuyển **khai báo**, không di chuyển code vật lý. Đây là cơ chế của compiler phase. |
| "Closure là hàm bên trong hàm" | Closure là hàm + lexical environment của nó. Hàm bên trong hàm chỉ là điều kiện cần, không đủ. |
| "`const` tạo biến bất biến (immutable)" | `const` chỉ ngăn **re-assignment**. Object/array khai báo bằng `const` vẫn có thể bị mutate. |
| "let và const không được hoist" | Chúng **có** được hoist, nhưng nằm trong TDZ nên không truy cập được trước khi khai báo. |
| "IIFE chỉ là cú pháp" | IIFE là pattern quan trọng tạo private scope. Nó là nền tảng của Module Pattern trước ES6. |
| "Closure gây memory leak" | Closure **có thể** gây memory leak nếu giữ reference không cần thiết, nhưng bản thân nó không phải là leak. Cần hiểu khi nào reference bị giữ và khi nào được GC thu hồi. |
