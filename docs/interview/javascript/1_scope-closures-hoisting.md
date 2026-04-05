---
sidebar_position: 1
title: "Scope, Closures & Hoisting"
---

# Scope, Closures & Hoisting

Phần này tổng hợp những câu hỏi phỏng vấn phổ biến nhất về Scope, Closures và Hoisting trong JavaScript. Đây là nền tảng mà hầu hết interviewer sẽ hỏi ở vòng đầu tiên, vì nó phản ánh rõ bạn hiểu JavaScript "sâu" đến đâu.

---

## Câu 1: Phân biệt `var`, `let`, `const` -- Block scope vs Function scope `[Intermediate]`

### Câu hỏi

> Hãy giải thích sự khác nhau giữa `var`, `let` và `const`. Khi nào nên dùng cái nào?

### Giai thich ly thuyet

JavaScript có hai loại scope chính cho biến:

- **Function scope**: Biến tồn tại trong toàn bộ hàm chứa nó. `var` tuân theo kiểu này.
- **Block scope**: Biến chỉ tồn tại bên trong cặp `{}` gần nhất. `let` và `const` tuân theo kiểu này.

| Tính chất | `var` | `let` | `const` |
|---|---|---|---|
| Scope | Function scope | Block scope | Block scope |
| Hoisting | Co, khoi tao `undefined` | Co, nhung nam trong TDZ | Co, nhung nam trong TDZ |
| Re-declaration | Cho phep | Khong cho phep | Khong cho phep |
| Re-assignment | Cho phep | Cho phep | Khong cho phep |
| Temporal Dead Zone | Khong | Co | Co |

**TDZ (Temporal Dead Zone)** la khoang thoi gian tu khi block bat dau cho den khi bien duoc khai bao. Truy cap bien trong TDZ se gay ra `ReferenceError`.

### Code vi du

```javascript
// Function scope vs Block scope
function demoScope() {
  if (true) {
    var a = 1;   // function scope -> ton tai trong toan bo ham
    let b = 2;   // block scope -> chi ton tai trong if
    const c = 3; // block scope -> chi ton tai trong if
  }

  console.log(a); // 1 -- var "thoat" ra khoi block
  // console.log(b); // ReferenceError: b is not defined
  // console.log(c); // ReferenceError: c is not defined
}

// Re-declaration
var x = 1;
var x = 2; // OK, khong loi

let y = 1;
// let y = 2; // SyntaxError: Identifier 'y' has already been declared

// const va mutation
const user = { name: "An" };
user.name = "Binh"; // OK! const chi ngan re-assignment, khong ngan mutation
console.log(user.name); // "Binh"

// const user = { name: "Cuong" }; // TypeError: Assignment to constant variable
```

### Dap an mau

> "`var` la function-scoped va duoc hoisted voi gia tri `undefined`. `let` va `const` la block-scoped va nam trong Temporal Dead Zone cho den khi duoc khai bao. `const` khong cho re-assign nhung object duoc khai bao bang `const` van co the bi mutate. Trong thuc te, toi mac dinh dung `const`, chi dung `let` khi can thay doi gia tri, va hau nhu khong bao gio dung `var` de tranh cac loi lien quan den scope."

---

## Cau 2: Hoisting -- bien, function declaration vs expression `[Intermediate]`

### Cau hoi

> Giai thich hoisting trong JavaScript. Function declaration va function expression duoc hoist khac nhau nhu the nao?

### Giai thich ly thuyet

**Hoisting** la co che JavaScript "di chuyen" phan khai bao len dau scope truoc khi code chay. Nhung can hieu chinh xac:

- **Function declaration**: Duoc hoist **toan bo** (ca ten va body). Ban co the goi ham truoc khi khai bao.
- **Function expression**: Chi **ten bien** duoc hoist (neu dung `var`), body thi khong. Goi truoc khai bao se bi loi.
- **`var`**: Duoc hoist va khoi tao bang `undefined`.
- **`let`/`const`**: Duoc hoist nhung **khong khoi tao** (TDZ).

### Code vi du

```javascript
// ===== Function Declaration: hoist toan bo =====
sayHello(); // "Xin chao!" -- chay duoc truoc khi khai bao

function sayHello() {
  console.log("Xin chao!");
}

// ===== Function Expression: chi hoist bien =====
// sayBye(); // TypeError: sayBye is not a function

var sayBye = function () {
  console.log("Tam biet!");
};

// ===== Arrow function expression cung tuong tu =====
// greet(); // TypeError: greet is not a function

var greet = () => {
  console.log("Hey!");
};

// ===== var hoisting =====
console.log(a); // undefined (khong phai ReferenceError)
var a = 10;
console.log(a); // 10

// JavaScript "hieu" doan code tren nhu:
// var a;           // hoist len dau
// console.log(a); // undefined
// a = 10;
// console.log(a); // 10

// ===== let/const hoisting voi TDZ =====
// console.log(b); // ReferenceError: Cannot access 'b' before initialization
let b = 20;

// ===== Trick question: function trong block =====
// Hanh vi nay khac nhau giua strict mode va non-strict mode
// Nen tranh khai bao function trong block
```

### Dap an mau

> "Hoisting la co che JavaScript di chuyen khai bao len dau scope. Function declaration duoc hoist toan bo, nen co the goi truoc khi khai bao. Function expression chi hoist phan bien -- neu dung `var` thi bien la `undefined`, neu dung `let`/`const` thi nam trong TDZ. Day la ly do chinh ma modern JS khuyen dung `const` voi arrow function de khai bao ham, vi no lam ro rang thu tu phu thuoc trong code."

---

## Cau 3: Closures -- dinh nghia, use cases `[Intermediate]`

### Cau hoi

> Closure la gi? Cho 3 use case thuc te cua closure trong du an.

### Giai thich ly thuyet

**Closure** xay ra khi mot ham "nho" duoc cac bien tu scope ben ngoai, ngay ca khi ham ben ngoai da thuc thi xong. Ve ban chat, closure la su ket hop cua:

1. Mot **ham** (function)
2. Va **lexical environment** noi ham do duoc tao ra

Closure ton tai vi JavaScript su dung **lexical scoping** -- scope duoc xac dinh tai thoi diem viet code, khong phai tai thoi diem chay code.

### Code vi du

```javascript
// ===== Use Case 1: Data Privacy (Module Pattern) =====
function createWallet(initialBalance) {
  let balance = initialBalance; // "private" variable

  return {
    deposit(amount) {
      if (amount <= 0) throw new Error("So tien phai lon hon 0");
      balance += amount;
      return balance;
    },
    withdraw(amount) {
      if (amount > balance) throw new Error("Khong du so du");
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
// console.log(wallet.balance);   // undefined -- khong truy cap truc tiep duoc!

// ===== Use Case 2: Factory Functions =====
function createMultiplier(multiplier) {
  return function (number) {
    return number * multiplier; // "nho" multiplier tu scope ben ngoai
  };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15

// ===== Use Case 3: Event Handlers voi trang thai =====
function createClickCounter(buttonId) {
  let count = 0; // Moi button co count rieng

  const button = document.getElementById(buttonId);
  button.addEventListener("click", function () {
    count++;
    button.textContent = `Da click ${count} lan`;
  });
}

// Moi lan goi tao mot closure doc lap
createClickCounter("btn-1");
createClickCounter("btn-2");
```

### Dap an mau

> "Closure la khi mot ham giu tham chieu den cac bien trong lexical scope cua no, ngay ca khi scope do da ket thuc. Ba use case pho bien nhat la: (1) data privacy -- tao bien 'private' ma ben ngoai khong truy cap truc tiep duoc, (2) factory functions -- tao cac ham tuy chinh tu mot ham goc, va (3) event handlers -- moi handler co the giu trang thai rieng ma khong can bien global."

---

## Cau 4: IIFE va Module Pattern `[Intermediate]`

### Cau hoi

> IIFE la gi? Tai sao truoc ES6, IIFE duoc dung rat nhieu? Ngay nay con can dung khong?

### Giai thich ly thuyet

**IIFE (Immediately Invoked Function Expression)** la mot ham duoc dinh nghia va goi ngay lap tuc. Cu phap:

```javascript
(function () {
  // code chay ngay
})();
```

Truoc ES6, JavaScript chi co function scope (khong co `let`/`const`). IIFE la cach **duy nhat** de tao scope rieng, tranh o nhiem global namespace. Day la nen tang cua **Module Pattern**.

Ngay nay voi ES Modules (`import`/`export`) va block scope (`let`/`const`), IIFE it duoc dung hon. Nhung van huu ich trong mot so truong hop.

### Code vi du

```javascript
// ===== IIFE co ban =====
(function () {
  const secret = "Mat khau cuc ky bi mat";
  console.log(secret); // "Mat khau cuc ky bi mat"
})();

// console.log(secret); // ReferenceError -- secret khong lo ra ngoai

// ===== Module Pattern voi IIFE =====
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
      log(`Tang len ${count}`);
      return count;
    },
    decrement() {
      count--;
      log(`Giam xuong ${count}`);
      return count;
    },
    getCount() {
      return count;
    },
  };
})();

CounterModule.increment(); // [Counter] Tang len 1
CounterModule.increment(); // [Counter] Tang len 2
CounterModule.decrement(); // [Counter] Giam xuong 1
console.log(CounterModule.getCount()); // 1
// CounterModule.count -- undefined (private)
// CounterModule.log  -- undefined (private)

// ===== IIFE voi tham so =====
(function (global, $) {
  // Tranh xung dot voi thu vien khac
  // global = window, $ = jQuery
  global.myApp = {
    init() {
      $(".container").show();
    },
  };
})(window, jQuery);

// ===== Truong hop IIFE van huu ich ngay nay =====
// 1. Async IIFE trong file khong phai module
(async function () {
  const data = await fetch("/api/data");
  const json = await data.json();
  console.log(json);
})();

// 2. Tao block scope cho switch case
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

### Dap an mau

> "IIFE la mot function expression duoc goi ngay khi dinh nghia. Truoc ES6, no la cach chinh de tao private scope vi JavaScript chi co function scope. Module Pattern dua tren IIFE de tao public API va private state. Ngay nay voi ES Modules va `let`/`const`, IIFE it can thiet hon, nhung van huu ich khi can async top-level execution hoac tao gia tri tu complex logic."

---

## Cau 5: Lexical Environment va Scope Chain `[Senior]`

### Cau hoi

> Giai thich Lexical Environment la gi va scope chain hoat dong nhu the nao khi JavaScript tim kiem mot bien?

### Giai thich ly thuyet

Moi khi mot execution context duoc tao (goi ham, chay script), JavaScript tao mot **Lexical Environment** gom hai phan:

1. **Environment Record**: Luu tru cac bien va ham duoc khai bao trong scope hien tai.
2. **Outer Reference**: Tham chieu den Lexical Environment cua scope cha (noi ham duoc **dinh nghia**, khong phai noi ham duoc **goi**).

Khi truy cap mot bien, JavaScript thuc hien **scope chain lookup**:

1. Tim trong Environment Record hien tai.
2. Neu khong thay, di theo outer reference len scope cha.
3. Lap lai cho den khi toi Global Scope.
4. Neu van khong thay: `ReferenceError`.

### Code vi du

```javascript
const globalVar = "Global";

function outer() {
  const outerVar = "Outer";

  function middle() {
    const middleVar = "Middle";

    function inner() {
      const innerVar = "Inner";

      // Scope chain: inner -> middle -> outer -> global
      console.log(innerVar);  // "Inner"   -- tim thay o inner
      console.log(middleVar); // "Middle"  -- tim thay o middle
      console.log(outerVar);  // "Outer"   -- tim thay o outer
      console.log(globalVar); // "Global"  -- tim thay o global
    }

    inner();
  }

  middle();
}

outer();

// ===== Lexical scope vs Dynamic scope =====
// JavaScript dung LEXICAL scope (static scope)
const value = "global";

function printValue() {
  console.log(value); // luon la "global", khong phai "local"
}

function callPrint() {
  const value = "local";
  printValue(); // "global" -- vi printValue duoc DINH NGHIA o global scope
}

callPrint(); // "global"

// ===== Scope chain voi closure =====
function createCounter(name) {
  let count = 0;
  // Lexical Environment cua createCounter:
  // { name: "...", count: 0 } -> outer: global

  return {
    increment() {
      count++;
      // Lexical Environment cua increment:
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
// Moi closure co Lexical Environment rieng, doc lap!
```

### Dap an mau

> "Lexical Environment la cau truc du lieu ma JavaScript tao ra moi khi mot execution context moi xuat hien. No gom Environment Record (chua bien/ham trong scope hien tai) va outer reference (tro den scope cha). Scope chain la chuoi cac Lexical Environment lien ket qua outer reference. Khi tim bien, engine di tu trong ra ngoai theo chuoi nay. Dieu quan trong la scope duoc xac dinh tai thoi diem viet code (lexical), khong phai tai thoi diem chay. Day chinh la co so de closure hoat dong."

---

## Cau 6: Closures trong loops -- Classic tricky question `[Senior]`

### Cau hoi

> Cho doan code sau, output la gi? Lam sao de fix?

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(function () {
    console.log(i);
  }, 1000);
}
```

### Giai thich ly thuyet

Day la cau hoi kinh dien ve closure trong loop:

- `var` la **function-scoped**, nen chi co **mot bien `i` duy nhat** cho ca vong loop.
- `setTimeout` callback la mot closure, no **tham chieu den bien `i`**, khong phai **gia tri cua `i`** tai thoi diem tao callback.
- Khi callback chay (sau 1 giay), vong loop da ket thuc va `i = 3`.
- Ket qua: in ra `3, 3, 3`.

### Code vi du

```javascript
// ===== Van de =====
for (var i = 0; i < 3; i++) {
  setTimeout(function () {
    console.log(i); // 3, 3, 3
  }, 1000);
}

// ===== Fix 1: Dung let (don gian nhat, khuyen dung) =====
for (let i = 0; i < 3; i++) {
  setTimeout(function () {
    console.log(i); // 0, 1, 2
  }, 1000);
}
// let tao block scope moi cho moi lan lap -> moi callback co "ban sao" rieng cua i

// ===== Fix 2: Dung IIFE (cach cu truoc ES6) =====
for (var i = 0; i < 3; i++) {
  (function (j) {
    setTimeout(function () {
      console.log(j); // 0, 1, 2
    }, 1000);
  })(i);
  // IIFE tao scope moi, "chup lai" gia tri i vao tham so j
}

// ===== Fix 3: Dung tham so thu 3 cua setTimeout =====
for (var i = 0; i < 3; i++) {
  setTimeout(
    function (j) {
      console.log(j); // 0, 1, 2
    },
    1000,
    i // Truyen i nhu tham so cho callback
  );
}

// ===== Fix 4: Dung bind =====
for (var i = 0; i < 3; i++) {
  setTimeout(
    function (j) {
      console.log(j); // 0, 1, 2
    }.bind(null, i),
    1000
  );
}

// ===== Nang cao: Hieu sau hon =====
// Tai sao let fix duoc? Vi voi moi iteration, JS tao mot
// Lexical Environment moi voi ban sao cua i.
// Tuong duong voi:
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

### Dap an mau

> "Output la `3, 3, 3` vi `var` la function-scoped, chi co mot bien `i` duy nhat. Cac callback closure tham chieu den cung mot bien `i`, va khi chung chay thi `i` da la 3. Cach fix don gian nhat la dung `let` thay `var` -- `let` tao block scope moi cho moi iteration, moi callback se co ban sao rieng cua `i`. Cac cach khac la dung IIFE de tao scope moi hoac truyen `i` qua tham so. Day la vi du kinh dien cho thay closure 'bat' tham chieu, khong phai gia tri."

---

## Loi thuong gap khi tra loi

| Loi | Giai thich dung |
|---|---|
| "Hoisting di chuyen code len dau file" | Hoisting chi di chuyen **khai bao**, khong di chuyen code vat ly. Day la co che cua compiler phase. |
| "Closure la ham ben trong ham" | Closure la ham + lexical environment cua no. Ham ben trong ham chi la dieu kien can, khong du. |
| "`const` tao bien bat bien (immutable)" | `const` chi ngan **re-assignment**. Object/array khai bao bang `const` van co the bi mutate. |
| "let va const khong duoc hoist" | Chung **co** duoc hoist, nhung nam trong TDZ nen khong truy cap duoc truoc khi khai bao. |
| "IIFE chi la cu phap" | IIFE la pattern quan trong tao private scope. No la nen tang cua Module Pattern truoc ES6. |
| "Closure gay memory leak" | Closure **co the** gay memory leak neu giu reference khong can thiet, nhung ban than no khong phai la leak. Can hieu khi nao reference bi giu va khi nao duoc GC thu hoi. |
