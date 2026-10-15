---
sidebar_position: 13
title: "13. this keyword"
---

# 13. this keyword

## 1. this trong các ngữ cảnh

Bài học: [1. this trong các ngữ cảnh](../../javascript/13-this-keyword/1_this-contexts.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `this` trong JavaScript được xác định lúc VIẾT code hay lúc GỌI hàm? Cho một ví dụ chứng minh.**

<details className="qa">
<summary>Xem đáp án</summary>

Xác định **lúc gọi**, không phải lúc viết — đây là điểm cốt lõi khiến `this` của JS khác với `this` của Java hay `self` của Python. `this` là một **binding động**, gắn vào *call site* (nơi và cách hàm được gọi), chứ không gắn vào nơi hàm được khai báo.

```js
function greet() {
  console.log("Xin chào " + this.name);
}

const an = { name: "An", greet };
const binh = { name: "Bình", greet };

an.greet();   // "Xin chào An"   → this = an
binh.greet(); // "Xin chào Bình" → this = binh
greet();      // strict: TypeError (this = undefined)
```

**Cùng một hàm `greet`**, ba cách gọi cho ba giá trị `this` khác nhau. Nếu `this` chốt lúc viết thì cả ba phải giống nhau.

Ngoại lệ duy nhất là **arrow function**: nó không có `this` riêng mà lấy `this` lexical từ scope bao quanh — nên `this` của arrow đúng là chốt **lúc viết**.

</details>

**2. Liệt kê các quy tắc binding của `this` theo thứ tự ưu tiên: `new`, `call`/`apply`/`bind`, `obj.method()`, và gọi standalone.**

<details className="qa">
<summary>Xem đáp án</summary>

Thứ tự ưu tiên, từ cao xuống thấp:

| Ưu tiên | Quy tắc | Cách nhận biết | `this` bằng |
|---|---|---|---|
| 1 | **`new` binding** | `new Fn()` | Object mới được tạo |
| 2 | **Explicit binding** | `fn.call(x)`, `fn.apply(x)`, `fn.bind(x)` | `x` |
| 3 | **Implicit binding** | `obj.method()` | `obj` (object ngay trước dấu chấm) |
| 4 | **Default binding** | `fn()` standalone | `undefined` (strict) / `globalThis` (sloppy) |

```js
function Fn() { console.log(this.tag); }
const bound = Fn.bind({ tag: "bind" });

bound();          // "bind"      — explicit thắng default
new bound();      // undefined   — new thắng bind, this là object mới
```

Hai điểm hay bị hỏi thêm:

- **Arrow function nằm ngoài bảng này** — nó không có `this` riêng, nên mọi quy tắc trên đều không áp dụng; `this` luôn là của scope bao quanh.
- Truyền `null`/`undefined` vào `call`: strict mode giữ nguyên `null`, còn sloppy mode ép về `globalThis` (gọi là *indirect binding*).

</details>

**3. Gọi `fn()` standalone thì `this` bằng gì trong strict mode và trong sloppy mode? Vì sao có sự khác biệt này?**

<details className="qa">
<summary>Xem đáp án</summary>

```js
function test() { console.log(this); }
test();
// strict mode: undefined
// sloppy mode: window (browser) / globalThis
```

Khi gọi standalone, không có object nào đứng trước dấu chấm nên `this` ban đầu là `undefined`. Khác biệt nằm ở bước tiếp theo: **sloppy mode thực hiện this-coercion** — thấy `this` là `undefined` hoặc `null` thì thay bằng object global (và bọc giá trị nguyên thuỷ thành object). **Strict mode bỏ hẳn bước này**, giữ nguyên `undefined`.

Vì sao sửa: hành vi cũ tạo ra bug rất khó tìm — quên `new` khi gọi constructor sẽ khiến `this.name = ...` âm thầm ghi vào `window`, ô nhiễm global mà không báo gì. Strict mode biến nó thành `TypeError` ngay tại chỗ, đúng triết lý "fail nhanh, fail rõ".

Lưu ý thực tế: **ES Module và thân `class` luôn strict**, nên code hiện đại gần như luôn rơi vào nhánh `undefined`.

</details>

**4. Vì sao `const g = obj.method; g();` lại làm mất `this`? Nêu các cách giữ lại `this` trong tình huống đó.**

<details className="qa">
<summary>Xem đáp án</summary>

Vì `obj.method` chỉ lấy ra **tham chiếu tới hàm**, không hề mang theo `obj`. Binding `this` được quyết định tại *call site*: gọi `g()` là cách gọi standalone, không có object nào đứng trước dấu chấm, nên `this` không còn là `obj`.

```js
const user = { name: "An", greet() { console.log(this.name); } };
const g = user.greet;
g(); // strict: TypeError — this là undefined
```

Đây chính là lý do truyền method làm callback (`setTimeout(user.greet, 100)`, `arr.map(obj.fn)`) thường hỏng.

Các cách giữ `this`:

```js
const g1 = user.greet.bind(user);   // 1. bind — tạo hàm mới chốt this
const g2 = () => user.greet();      // 2. wrapper arrow — gọi lại qua object
user.greet.call(user);              // 3. call/apply — chỉ định this lúc gọi
setTimeout(() => user.greet(), 100);
```

Trong `class`, hai cách phổ biến là `this.greet = this.greet.bind(this)` trong constructor, hoặc khai báo **class field dạng arrow** (`greet = () => {}`) — khi đó `this` được chốt theo instance ngay lúc tạo object.

</details>

**5. Phân biệt `call`, `apply` và `bind`: cái nào gọi hàm ngay, cái nào trả về hàm mới, truyền tham số khác nhau ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Gọi hàm ngay? | Tham số | Trả về |
|---|---|---|---|
| `fn.call(thisArg, a, b)` | Có | Liệt kê rời từng cái | Kết quả của `fn` |
| `fn.apply(thisArg, [a, b])` | Có | Một **mảng** (hoặc array-like) | Kết quả của `fn` |
| `fn.bind(thisArg, a)` | **Không** | Liệt kê rời (partial application) | **Hàm mới** đã chốt `this` |

```js
function intro(greeting, mark) {
  console.log(`${greeting}, tôi là ${this.name}${mark}`);
}
const user = { name: "An" };

intro.call(user, "Chào", "!");     // gọi ngay
intro.apply(user, ["Chào", "!"]);  // gọi ngay, tham số dạng mảng
const boundIntro = intro.bind(user, "Chào"); // chưa gọi
boundIntro("!");                   // "Chào, tôi là An!"
```

Mẹo nhớ: **a**pply đi với **a**rray, **c**all đi với **c**omma, **b**ind trả về hàm mới để dùng **b**ackup sau.

Ghi chú: `bind` còn hỗ trợ **partial application** (khoá sẵn vài tham số đầu). Với spread syntax hiện đại, `fn(...args)` thường thay được `apply`, nên `apply` ít dùng hơn trước. Hàm đã `bind` không thể đổi `this` lần nữa.

</details>

**6. Tự viết polyfill cho `Function.prototype.bind` (hoặc `call`). Bạn xử lý trường hợp hàm bind được gọi kèm `new` thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

```js
Function.prototype.myBind = function (thisArg, ...boundArgs) {
  if (typeof this !== "function") throw new TypeError("Not callable");
  const target = this;

  function bound(...callArgs) {
    // Gọi kèm new → this là instance mới, bỏ qua thisArg
    const isNew = this instanceof bound;
    return target.apply(isNew ? this : thisArg, [...boundArgs, ...callArgs]);
  }

  // Giữ prototype chain để instanceof hoạt động đúng
  bound.prototype = Object.create(target.prototype || null);
  return bound;
};
```

Ba điểm mấu chốt:

- **Lưu `target = this`** — chính là hàm gốc đang được bind.
- **Nối tham số**: tham số truyền lúc `bind` đứng trước, tham số lúc gọi đứng sau (partial application).
- **Xử lý `new`**: theo spec, `new` có ưu tiên cao hơn bind — `thisArg` bị bỏ qua và `this` là object mới. Nhận biết bằng `this instanceof bound`, và phải gán `bound.prototype` kế thừa từ `target.prototype` thì `instanceof` mới đúng.

Bản gốc còn khác vài chỗ: hàm bind thật không có `prototype` riêng, `name` là `"bound tên gốc"`, và `length` bằng `max(0, target.length - boundArgs.length)`.

</details>

**7. Đoán kết quả khi `bind` hai lần: `fn.bind(a).bind(b)` thì `this` cuối cùng là gì? Giải thích.**

<details className="qa">
<summary>Xem đáp án</summary>

```js
function show() { console.log(this.tag); }

const a = { tag: "A" };
const b = { tag: "B" };

show.bind(a).bind(b)(); // "A" — lần bind đầu tiên thắng
```

Giải thích: `bind` tạo ra một **hàm mới (exotic bound function)** với `[[BoundThis]]` đã **chốt cứng** là `a`. Khi gọi hàm bound này, engine **luôn dùng `[[BoundThis]]`** và **bỏ qua** mọi `this` được truyền vào.

Lần `.bind(b)` thứ hai bind lên chính hàm bound đó: nó tạo thêm một lớp bọc với `[[BoundThis]] = b`, nhưng khi lớp ngoài gọi lớp trong với `this = b`, lớp trong vẫn phớt lờ và dùng `a`.

Quy tắc rút ra: **`this` của một bound function không thể đổi được nữa** — kể cả bằng `bind` lần nữa, `call` hay `apply`:

```js
show.bind(a).call(b);  // "A"
show.bind(a).apply(b); // "A"
new (show.bind(a))();  // ngoại lệ duy nhất: new thắng bind
```

Chỉ `new` mới vượt qua được, vì `new` binding có ưu tiên cao nhất.

</details>

**8. Arrow function lấy `this` từ đâu? Có thể đổi `this` của một arrow function bằng `call`/`apply`/`bind` không?**

<details className="qa">
<summary>Xem đáp án</summary>

Arrow function **không có `this` riêng**. Khi thân arrow dùng `this`, engine tra ngược lên **scope bao quanh lúc viết code** (lexical scope) giống như tra một biến thường — đúng với quy tắc tra `super`, `arguments` và `new.target` nữa.

**Không thể** đổi `this` của arrow bằng `call`/`apply`/`bind`. `thisArg` truyền vào bị bỏ qua hoàn toàn, không báo lỗi:

```js
const obj = { tag: "obj" };
const arrow = () => console.log(this);

arrow.call(obj);  // vẫn là this của scope ngoài, KHÔNG phải obj
arrow.bind(obj)(); // tương tự
```

Hệ quả kèm theo:

- Arrow **không dùng được với `new`** (`new arrow()` ném `TypeError`) vì không có `[[Construct]]`.
- Arrow không có `arguments` riêng — dùng rest parameter `(...args)` thay thế.
- Arrow không có `prototype`.

Vì vậy arrow rất hợp làm **callback giữ context** (`setTimeout(() => this.count++, 1000)`), nhưng **không nên** làm method của object literal hay method cần `this` động.

</details>

**9. Vì sao KHÔNG nên dùng arrow function làm method của object literal? Đoán output của ví dụ `greet: () => this.name` ở ES Module và ở script thường.**

<details className="qa">
<summary>Xem đáp án</summary>

Vì **object literal không tạo ra scope mới**. Arrow lấy `this` từ scope *chứa* object literal — thường là top-level — chứ không phải từ chính object đó. Nên `this` không bao giờ trỏ tới object như bạn mong đợi.

```js
const user = {
  name: "An",
  greet: () => console.log(this.name), // SAI
};

user.greet();
// ES Module (strict): this = undefined ở top-level → TypeError
// Script thường (sloppy): this = window → in ra "" hoặc undefined
```

| Ngữ cảnh | `this` ở top-level | Kết quả `user.greet()` |
|---|---|---|
| ES Module / `<script type="module">` | `undefined` | `TypeError: Cannot read properties of undefined` |
| Script thường trong trình duyệt | `window` | In ra `window.name`, thường là chuỗi rỗng |

Cách đúng là dùng **method shorthand**, khi đó `this` được quyết định lúc gọi và bằng object đứng trước dấu chấm:

```js
const user = {
  name: "An",
  greet() { console.log(this.name); }, // "An"
};
```

</details>

**10. Trong `setTimeout(function () { ... })` viết bên trong một method, `this` bằng gì? Nêu ít nhất ba cách fix (arrow, `bind`, `const self = this`).**

<details className="qa">
<summary>Xem đáp án</summary>

`setTimeout` gọi callback như một **hàm standalone**, không qua object nào, nên `this` **không phải** object chứa method:

```js
const user = {
  name: "An",
  run() {
    setTimeout(function () {
      console.log(this.name);
      // strict: TypeError (this = undefined)
      // sloppy: undefined (this = window)
    }, 100);
  },
};
```

Ba cách fix:

```js
// 1. Arrow function — kế thừa this lexical từ run()
setTimeout(() => console.log(this.name), 100);

// 2. bind — chốt this cho callback
setTimeout(function () { console.log(this.name); }.bind(this), 100);

// 3. Biến trung gian (pattern trước ES6)
const self = this;
setTimeout(function () { console.log(self.name); }, 100);
```

Cách 1 là chuẩn hiện đại: ngắn, rõ ý đồ, không tạo hàm bọc thừa. Cách 3 (`const self = this`, hoặc `that`/`_this`) vẫn hay gặp trong code cũ — bản chất là dùng closure thay cho `this`.

Lưu ý: trong trình duyệt, `this` bên trong callback của `setTimeout` ở sloppy mode là `window`; trong Node.js là object `Timeout`.

</details>

**11. Trong event handler, `this` bằng gì khi dùng function thường so với arrow function? Khi nào nên dùng `e.currentTarget` thay cho `this`?**

<details className="qa">
<summary>Xem đáp án</summary>

```js
// Function thường — this = element gắn listener
button.addEventListener("click", function () {
  console.log(this); // <button>
});

// Arrow — this lấy từ scope ngoài
class App {
  setup() {
    button.addEventListener("click", () => {
      console.log(this); // App instance, KHÔNG phải button
    });
  }
}
```

Với function thường, DOM gọi handler với `this` được set bằng **element đã đăng ký listener** — tức là bằng đúng `e.currentTarget`. Arrow thì phớt lờ điều đó và giữ `this` lexical.

Khi nào dùng `e.currentTarget`:

- **Khi handler là arrow function** — `this` không còn là element, chỉ `e.currentTarget` mới cho đúng.
- **Trong class/component**, khi bạn cần cả instance (`this`) lẫn element — dùng arrow cho `this`, dùng `e.currentTarget` cho element.
- **Khi muốn code rõ ràng, không phụ thuộc chế độ gọi** — `e.currentTarget` luôn đúng bất kể function thường hay arrow.

Thực tế nên mặc định dùng `e.currentTarget`: nó tường minh, an toàn khi refactor từ function thường sang arrow, và tránh hẳn câu chuyện `this`.

</details>

**12. Phân biệt `e.target` và `e.currentTarget` — cái nào tương đương với `this` trong một handler viết bằng function thường?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`e.target`** — element **thực sự phát sinh** event, tức chỗ người dùng click. Không đổi trong suốt hành trình capture → bubble.
- **`e.currentTarget`** — element **đang chạy listener hiện tại**, chính là element mà bạn gọi `addEventListener` lên. Thay đổi theo từng bước lan truyền.

Trong handler viết bằng **function thường**, `this === e.currentTarget`:

```js
list.addEventListener("click", function (e) {
  console.log(this === e.currentTarget); // true — <ul>
  console.log(e.target);                 // <li> bị click
});
```

Với **arrow function** thì đẳng thức trên không còn đúng — `this` là scope ngoài, còn `e.currentTarget` vẫn là `<ul>`.

Chọn cái nào:

| Nhu cầu | Dùng |
|---|---|
| Biết con nào bị click (event delegation) | `e.target`, thường kèm `closest()` |
| Thao tác lên chính element gắn listener | `e.currentTarget` |

Lưu ý: `e.currentTarget` trở thành `null` sau khi handler kết thúc, nên đừng lưu nó lại để dùng trong callback bất đồng bộ — hãy gán ra biến trước.

</details>

**13. `this` trong method của `class` là gì? Vì sao tách method ra rồi gọi standalone luôn ném `TypeError`, kể cả trong file sloppy mode?**

<details className="qa">
<summary>Xem đáp án</summary>

`this` trong method của class là **instance** đang gọi method đó:

```js
class User {
  constructor(name) { this.name = name; }
  greet() { console.log(this.name); }
}
new User("An").greet(); // "An"
```

Khi tách method ra, binding bị mất y như với object literal:

```js
const u = new User("An");
const greet = u.greet;
greet(); // TypeError: Cannot read properties of undefined (reading 'name')
```

Vì sao **luôn** là `TypeError`, kể cả file sloppy: **thân `class` luôn chạy strict mode**, không cần khai báo `"use strict"` và không tắt được. Do đó không có bước ép `this` về `globalThis` — `this` giữ nguyên `undefined`, và đọc `undefined.name` ném lỗi ngay.

So sánh với object literal trong file sloppy: `this` rơi về `window`, `this.name` chỉ in ra `undefined` — code "chạy được" nhưng sai, bug ẩn rất lâu. Class **"fail nhanh, fail rõ"** nên dễ phát hiện lỗi `this` hơn nhiều.

</details>

**14. So sánh ba cách fix mất `this` trong class: `bind` trong constructor, class field dạng arrow, và wrapper arrow lúc gọi — ưu nhược điểm về bộ nhớ, prototype và khả năng mock trong test.**

<details className="qa">
<summary>Xem đáp án</summary>

```js
class User {
  constructor(name) {
    this.name = name;
    this.greetA = this.greet.bind(this); // (1) bind trong constructor
  }
  greet() { console.log(this.name); }
  greetB = () => console.log(this.name); // (2) class field arrow
}
button.onclick = () => u.greet();        // (3) wrapper arrow lúc gọi
```

| | Bộ nhớ | Prototype | Mock trong test |
|---|---|---|---|
| `bind` trong constructor | Mỗi instance một hàm bound | Bản gốc vẫn ở trên prototype | Tốt — vẫn stub được `User.prototype.greet` cho instance tạo sau |
| Class field arrow | Mỗi instance một hàm riêng | **Không nằm trên prototype**, là own property | Khó — phải gán trực tiếp lên từng instance |
| Wrapper arrow lúc gọi | Một hàm cho mỗi chỗ gắn | Không ảnh hưởng | Tốt nhất — method gốc nguyên vẹn |

Nhận xét thực dụng:

- Cả (1) và (2) đều tốn bộ nhớ theo số instance — với vài nghìn object mới đáng cân nhắc.
- (2) gọn và phổ biến trong React class component, nhưng phá tính chia sẻ qua prototype: không kế thừa/override bằng `super.greetB()` được.
- (3) giữ class sạch nhất, `this` được giải quyết ngay tại call site; đổi lại phải nhớ viết wrapper ở mọi nơi truyền callback.

</details>

**15. Khi gọi `new Fn()`, engine thực hiện những bước nào và `this` được tạo ra ở bước nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Bốn bước:

1. **Tạo một object rỗng mới** và đặt `[[Prototype]]` của nó bằng `Fn.prototype`.
2. **Gán object đó cho `this`** rồi chạy thân hàm `Fn` — `this` ra đời ở đây, trước khi dòng code đầu tiên của constructor chạy.
3. **Thực thi thân hàm**, thường là gán các property lên `this`.
4. **Trả về**: nếu constructor `return` một **object** thì object đó được trả; mọi trường hợp khác (không return, hoặc return giá trị nguyên thuỷ) đều trả về `this`.

```js
function User(name) {
  // this = {} với prototype là User.prototype
  this.name = name;
  // return this ngầm định
}
const u = new User("An");
Object.getPrototypeOf(u) === User.prototype; // true

function Odd(name) {
  this.name = name;
  return { name: "khác" }; // trả object → ghi đè this
}
new Odd("An").name; // "khác"
```

Mô phỏng thủ công: `const obj = Object.create(Fn.prototype); const r = Fn.apply(obj, args); return typeof r === "object" && r !== null ? r : obj;`

Lưu ý: arrow function và method shorthand không có `[[Construct]]` nên không gọi được bằng `new`.

</details>

**16. Đoán output với object lồng nhau: gọi `obj.inner.fn()` thì `this` là `obj` hay `obj.inner`? Giải thích quy tắc "object đứng ngay trước dấu chấm".**

<details className="qa">
<summary>Xem đáp án</summary>

`this` là **`obj.inner`** — object đứng **ngay trước** dấu chấm cuối cùng, không phải object ngoài cùng.

```js
const obj = {
  tag: "ngoài",
  inner: {
    tag: "trong",
    fn() { console.log(this.tag); },
  },
};

obj.inner.fn(); // "trong" — this = obj.inner
```

Quy tắc: với implicit binding, engine chỉ nhìn **một bậc** — biểu thức `obj.inner.fn` được đánh giá thành cặp (receiver = `obj.inner`, hàm = `fn`). Chuỗi truy cập phía trước chỉ là đường đi tới `obj.inner`, không ảnh hưởng gì tới `this`.

Hệ quả quan trọng: **object lồng nhau không "nhìn thấy" object cha qua `this`**. Muốn truy cập `obj.tag` từ trong `fn`, phải tham chiếu trực tiếp `obj.tag` hoặc truyền vào tường minh.

```js
const fn = obj.inner.fn;
fn(); // TypeError (strict) — mất receiver, không còn implicit binding

obj.inner.fn.call(obj); // "ngoài" — explicit binding ghi đè
```

</details>

**17. `this` ở top-level khác nhau ra sao giữa CommonJS module, ES Module và script thường trong trình duyệt?**

<details className="qa">
<summary>Xem đáp án</summary>

| Ngữ cảnh | `this` ở top-level | Ghi chú |
|---|---|---|
| Script thường trong trình duyệt | `window` (`globalThis`) | Sloppy mode, không có bao bọc nào |
| `<script type="module">` / ES Module (`.mjs`, `"type": "module"`) | `undefined` | Module luôn strict; muốn lấy global thì dùng `globalThis` |
| CommonJS module (Node.js `require`) | `module.exports` — một object rỗng `{}` | Node bọc file trong một hàm wrapper rồi gọi với `this = module.exports` |
| Bên trong hàm gọi standalone | `undefined` (strict) / `globalThis` (sloppy) | Không phụ thuộc loại module |

```js
// CommonJS
console.log(this === module.exports); // true
this.foo = 1; // tương đương exports.foo = 1

// ES Module
console.log(this); // undefined
```

Vì sao khác nhau: script thường chạy trực tiếp trong global scope; CommonJS được Node bọc trong `function (exports, require, module, __filename, __dirname)` và gọi với receiver là `module.exports`; còn ES Module được spec quy định rõ `this` ở top-level là `undefined` — vừa vì module luôn strict, vừa để tránh mọi phụ thuộc ngầm vào global.

Cách viết an toàn cho mọi môi trường: dùng **`globalThis`** thay vì dựa vào `this` ở top-level.

</details>

**18. `globalThis` là gì và nó giải quyết vấn đề gì so với việc dùng `window`, `global` hay `self`?**

<details className="qa">
<summary>Xem đáp án</summary>

**`globalThis`** (ES2020) là cách **thống nhất** để truy cập object global ở mọi môi trường JavaScript.

Trước đó mỗi môi trường có một tên riêng:

| Môi trường | Tên object global |
|---|---|
| Trình duyệt (main thread) | `window` (và `self`, `frames`) |
| Web Worker / Service Worker | `self` (không có `window`) |
| Node.js | `global` |

Hệ quả: thư viện muốn chạy được ở mọi nơi phải viết đoạn dò tìm dài dòng và dễ sai:

```js
// Trước ES2020
const g =
  typeof globalThis !== "undefined" ? globalThis :
  typeof window !== "undefined" ? window :
  typeof global !== "undefined" ? global :
  typeof self !== "undefined" ? self : this;

// Từ ES2020
globalThis.myLib = {};
```

`globalThis` giải quyết đúng bài toán đó: một cái tên, chạy ở mọi runtime, không cần dò. Nó đặc biệt hữu ích vì trong **ES Module** `this` ở top-level là `undefined`, còn trong strict mode `this` của hàm standalone cũng là `undefined` — những mẹo cũ để lấy global đều không còn dùng được.

Lưu ý: nên dùng `globalThis` để **feature-detect** hoặc đăng ký thứ thật sự cần toàn cục, không nên lạm dụng làm nơi chứa state.

</details>

---

## 2. call, apply, bind và Function Borrowing

Bài học: [2. call, apply, bind và Function Borrowing](../../javascript/13-this-keyword/2_call-apply-bind.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `this` trong JavaScript được quyết định lúc định nghĩa hàm hay lúc gọi hàm? Điều đó dẫn tới lỗi gì khi bạn tách một method ra khỏi object?**

<details className="qa">
<summary>Xem đáp án</summary>

`this` được quyết định **lúc gọi hàm**, không phải lúc định nghĩa. Engine nhìn vào *cách* hàm được gọi: `user.greet()` thì `this` là `user`, còn `fn()` gọi trần thì `this` là `undefined` (strict mode) hoặc `globalThis`.

Vì vậy khi tách method khỏi object, sợi dây liên kết với object bị đứt:

```js
const user = {
  name: "An",
  greet() { console.log(`Hello, ${this.name}`); },
};

const fn = user.greet; // chỉ copy tham chiếu tới hàm
fn(); // "Hello, undefined" — this không còn là user
```

Biến `fn` chỉ giữ **bản thân hàm**, không giữ object đứng trước dấu chấm. Đây chính là lỗi kinh điển khi truyền method làm callback (`setTimeout`, `addEventListener`, `map`) và là lý do `call`/`apply`/`bind` tồn tại.

</details>

**2. `call`, `apply`, `bind` sinh ra để giải quyết vấn đề gì mà cách gọi hàm thông thường không giải quyết được?**

<details className="qa">
<summary>Xem đáp án</summary>

Cách gọi thông thường chỉ cho bạn **một** cơ chế gán `this`: object đứng trước dấu chấm. Nếu hàm không được gọi qua object đó — vì đã tách ra biến, vì truyền làm callback, hoặc vì bạn muốn dùng hàm của object A cho object B — thì bạn hoàn toàn không có cách nào chỉ định `this`.

Ba method này cho phép **tự ép `this`**:

- `call(thisArg, ...args)` — gọi ngay, đối số truyền rời.
- `apply(thisArg, argsArray)` — gọi ngay, đối số là mảng.
- `bind(thisArg, ...args)` — không gọi ngay, trả về hàm mới đã gắn cứng `this`.

Nhờ đó giải được ba bài toán thực tế: giữ `this` cho callback (`bind`), mượn method từ object/class khác (function borrowing), và wrap hàm với context cố định (decorator, middleware).

</details>

**3. So sánh `call` và `apply`: khác nhau đúng ở điểm nào, và khi nào bạn chọn `apply`?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai method **giống hệt nhau** về hành vi — đều gọi hàm ngay lập tức với `this` do bạn chỉ định — chỉ khác **cách truyền đối số**.

| | `call` | `apply` |
|---|---|---|
| Đối số | Rời: `fn.call(ctx, a, b)` | Mảng: `fn.apply(ctx, [a, b])` |
| Gọi ngay? | Có | Có |
| Trả về | Kết quả của hàm | Kết quả của hàm |

```js
greet.call(ctx, "Hello", "An");    // "Hello, Mr. An"
greet.apply(ctx, ["Hello", "An"]); // "Hello, Mr. An"
```

Chọn `apply` khi đối số **đã nằm sẵn trong một mảng** và bạn không biết trước số lượng — điển hình là `Math.max.apply(null, nums)` thời trước ES6. Ngày nay spread (`fn.call(ctx, ...arr)` hoặc `Math.max(...nums)`) đã thay thế gần hết vai trò này, nên `apply` chủ yếu còn gặp trong code cũ.

</details>

**4. `bind` khác `call`/`apply` ở chỗ nào? `bind` trả về cái gì, và nó có gọi hàm ngay không?**

<details className="qa">
<summary>Xem đáp án</summary>

Khác biệt cốt lõi: `call`/`apply` **thực thi hàm ngay**, còn `bind` **không gọi gì cả** — nó trả về một **hàm mới** (bound function) đã gắn cứng `this`, để bạn gọi sau.

```js
greet.call(ctx, "Hi", "An"); // chạy ngay

const bound = greet.bind(ctx, "Hi"); // KHÔNG chạy, trả về hàm mới
bound("An");   // "Hi, Mr. An"
bound("Bình"); // "Hi, Mr. Bình" — dùng lại được nhiều lần
```

| | `call`/`apply` | `bind` |
|---|---|---|
| Gọi ngay? | Có | Không |
| Trả về | Kết quả hàm | Hàm mới |
| Dùng lại | Mỗi lần phải viết lại | Gọi bao nhiêu lần cũng được |

Vì trả về hàm mới nên `bind` là lựa chọn duy nhất khi bạn cần **đưa hàm cho ai đó gọi sau** — `setTimeout(user.greet.bind(user), 100)`, event handler, hoặc preset đối số (partial application).

</details>

**5. Cho `user = { name: "An", greet() { console.log(this.name) } }`, đoạn `const fn = user.greet; fn();` in ra gì? Giải thích vì sao. Sửa lại bằng `call` và bằng `bind` khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

In ra **`undefined`** (trong module/strict mode thì ném `TypeError` vì `this` là `undefined`).

Lý do: `const fn = user.greet` chỉ copy **tham chiếu tới hàm**, không copy object chủ. Khi gọi `fn()` không có gì đứng trước dấu chấm, nên `this` không phải `user` → `this.name` là `undefined`.

Hai cách sửa:

```js
fn.call(user);               // "An" — gọi NGAY một lần với this = user

const bound = fn.bind(user); // chưa chạy gì
bound();                     // "An" — hàm mới, gọi lúc nào cũng đúng this
setTimeout(bound, 100);      // "An" — dùng được cho callback
```

Khác biệt: `call` là **hành động một lần** — bạn phải đang ở đúng thời điểm muốn chạy. `bind` **tạo ra công cụ** — một hàm dùng lại được, phù hợp khi phải giao hàm cho bên khác gọi hộ.

</details>

**6. `setTimeout(user.greet, 100)` in ra gì? Vì sao truyền method làm callback lại mất `this`?**

<details className="qa">
<summary>Xem đáp án</summary>

In ra `"Hello, undefined"` — `this.name` không lấy được.

Nguyên nhân giống câu trên: khi viết `setTimeout(user.greet, 100)`, JavaScript **đánh giá biểu thức `user.greet` ngay tại đó** và chỉ truyền đi **giá trị hàm**. Object `user` không đi kèm. Sau 100ms, `setTimeout` gọi hàm đó theo kiểu gọi trần, nên `this` trở thành `globalThis` (browser) hoặc object `Timeout` (Node), chứ không phải `user`.

Cách sửa:

```js
setTimeout(user.greet.bind(user), 100); // bind — chuẩn nhất
setTimeout(() => user.greet(), 100);    // arrow bọc ngoài, gọi qua dấu chấm
```

Bài học tổng quát: **truyền hàm đi nơi khác là mất context**. Bất kỳ chỗ nào nhận callback — `setTimeout`, `addEventListener`, `map`, `forEach` — đều dính lỗi này.

</details>

**7. Partial application là gì? Giải thích `add.bind(null, 5)` làm gì và vì sao đối số đầu là `null`.**

<details className="qa">
<summary>Xem đáp án</summary>

**Partial application** là kỹ thuật preset sẵn một phần đối số của hàm, tạo ra hàm mới chuyên biệt hơn, chỉ cần nhận phần đối số còn lại.

```js
function add(a, b, c) { return a + b + c; }

const add5 = add.bind(null, 5);
add5(10, 20); // 35 — 5 đã được chốt cho a

const add5_10 = add.bind(null, 5, 10);
add5_10(20);  // 35
```

Đối số thứ hai trở đi của `bind` được **ghép vào đầu** danh sách tham số, đối số lúc gọi nối tiếp phía sau.

Vì sao `null`? Vì tham số đầu tiên của `bind` **bắt buộc** là `thisArg`, mà hàm `add` hoàn toàn không dùng tới `this`. Truyền `null` (hoặc `undefined`) là cách nói "tôi không quan tâm `this`, tôi chỉ muốn preset đối số". Ở non-strict mode `null` sẽ bị thay bằng `globalThis`, nhưng điều đó vô hại khi hàm không đụng tới `this`.

</details>

**8. Nếu `bind` hai lần (`fn.bind(a).bind(b)`) thì `this` cuối cùng là `a` hay `b`? Giải thích cơ chế bên dưới.**

<details className="qa">
<summary>Xem đáp án</summary>

`this` cuối cùng là **`a`** — lần `bind` đầu tiên thắng, các lần sau vô hiệu.

```js
function show() { console.log(this.name); }
const a = { name: "A" };
const b = { name: "B" };

show.bind(a).bind(b)(); // "A"
```

Cơ chế: `fn.bind(a)` không sửa `fn`, nó tạo ra một **hàm bọc mới** (bound function) mà bên trong luôn gọi `fn` với `this = a` — đây là quy tắc cứng, không thể ghi đè. Khi bạn `.bind(b)` lên hàm bọc đó, bạn chỉ đang gắn `this = b` cho **lớp bọc ngoài cùng**. Nhưng lớp bọc ngoài khi chạy lại gọi lớp trong, và lớp trong đã tự quyết định `this = a` rồi, nên `b` bị bỏ qua.

Hệ quả tương tự: gọi `call`/`apply` trên một bound function cũng không đổi được `this`. Bound function là "khóa một chiều".

</details>

**9. Gọi `call`/`apply`/`bind` trên một arrow function thì chuyện gì xảy ra? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Không lỗi, hàm vẫn chạy — nhưng **đối số `this` bị bỏ qua hoàn toàn**.

```js
const fn = () => console.log(this);

fn.call({ x: 1 });   // vẫn là this lexical, không phải {x: 1}
fn.apply({ x: 1 });  // tương tự
fn.bind({ x: 1 })(); // tương tự
```

Lý do: arrow function **không có `this` của riêng nó**. Nó không tạo binding `this` khi được gọi, mà lấy `this` từ scope bao ngoài tại nơi nó được **định nghĩa** (lexical `this`), và giá trị đó được chốt vĩnh viễn. Vì không có chỗ nào để ghi `this` vào, `call`/`apply`/`bind` chẳng có gì để thay đổi.

Đối số thường thì vẫn hoạt động bình thường: `((a, b) => a + b).call(null, 1, 2)` trả về `3`. Chỉ riêng `thisArg` là vô tác dụng. Đây cũng là lý do arrow function không nên dùng làm method khi cần `this`, và không dùng được với `new`.

</details>

**10. Function borrowing là gì? Giải thích `Array.prototype.slice.call(obj)` hoạt động ra sao với một object array-like, và điều kiện để nó chạy đúng.**

<details className="qa">
<summary>Xem đáp án</summary>

**Function borrowing** là "mượn" method của object/class này để dùng cho object khác vốn không hề kế thừa nó, bằng cách ép `this` qua `call`/`apply`.

```js
const obj = { 0: "a", 1: "b", 2: "c", length: 3 };
Array.prototype.slice.call(obj); // ["a", "b", "c"] — Array thật
```

`slice` không quan tâm `this` có thực sự là `Array` hay không. Bên trong, nó chỉ đọc `this.length` rồi lặp đọc `this[0]`, `this[1]`... và nhồi vào một mảng mới. Vì `obj` có đủ những thứ đó, `slice` chạy ngon lành.

Điều kiện để chạy đúng: object phải **array-like** — có thuộc tính `length` là số, và các key số `0..length-1`. Thiếu `length` thì kết quả là mảng rỗng; key không liên tục thì phần tử tương ứng là `undefined`.

Code hiện đại thay bằng `Array.from(obj)` hoặc spread — lưu ý spread yêu cầu object phải iterable, điều kiện chặt hơn array-like.

</details>

**11. Vì sao `Object.prototype.toString.call(x)` kiểm tra kiểu chính xác hơn `typeof x`? Cho ví dụ `typeof` cho kết quả gây hiểu nhầm.**

<details className="qa">
<summary>Xem đáp án</summary>

`typeof` chỉ phân biệt được vài kiểu primitive, còn **mọi object đều trả về `"object"`** — không tách được array, `null`, `Date`, `RegExp`, `Map`...

```js
typeof null;         // "object"   ← bug lịch sử của JS
typeof [];           // "object"   ← không biết là mảng
typeof new Date();   // "object"
typeof /abc/;        // "object"
typeof function(){}; // "function" ← riêng hàm thì ổn
```

`Object.prototype.toString` đọc một nhãn nội bộ của object và trả về chuỗi dạng `"[object Xxx]"` nên phân biệt chi tiết hơn. Phải dùng `.call` vì cần **mượn** đúng bản gốc trên `Object.prototype` — nếu gọi `x.toString()` trực tiếp sẽ trúng phiên bản đã bị override (ví dụ `[1,2].toString()` cho ra `"1,2"`).

```js
Object.prototype.toString.call(null);       // "[object Null]"
Object.prototype.toString.call([]);         // "[object Array]"
Object.prototype.toString.call(new Date()); // "[object Date]"
```

Thực tế ngày nay: dùng `Array.isArray()` cho mảng, `x === null` cho null; `toString.call` để dành cho hàm check type tổng quát trong utility.

</details>

**12. Trước ES6, `Math.max.apply(null, arr)` giải quyết việc gì? Cách viết hiện đại tương đương là gì, và có giới hạn nào khi mảng cực lớn?**

<details className="qa">
<summary>Xem đáp án</summary>

`Math.max` nhận đối số **rời** (`Math.max(1, 5, 3)`), không nhận mảng — `Math.max([1, 5, 3])` trả về `NaN`. Trước ES6 chưa có spread, nên `apply` là cách duy nhất để "rải" một mảng thành danh sách đối số:

```js
const nums = [1, 5, 3, 7];

Math.max.apply(null, nums); // 7 — cách cũ
Math.max(...nums);          // 7 — cách hiện đại
```

`null` ở đây là `thisArg` mà `Math.max` không dùng tới.

**Giới hạn với mảng cực lớn:** cả hai cách đều đẩy từng phần tử lên **call stack** dưới dạng đối số. Khi mảng quá lớn (thường là hàng chục đến hàng trăm nghìn phần tử, tùy engine), sẽ ném `RangeError: Maximum call stack size exceeded`. Với dữ liệu lớn nên duyệt thủ công:

```js
const max = nums.reduce((m, n) => (n > m ? n : m), -Infinity);
```

</details>

**13. Hãy tự viết polyfill `Function.prototype.myBind` — cần xử lý những gì (đối số preset, đối số lúc gọi, `this`)?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba việc phải xử lý: giữ `thisArg`, giữ đối số preset lúc bind, và nối thêm đối số lúc gọi.

```js
Function.prototype.myBind = function (thisArg, ...presetArgs) {
  const targetFn = this; // "this" chính là hàm đang được bind

  if (typeof targetFn !== "function") {
    throw new TypeError("myBind phải gọi trên một function");
  }

  return function (...callArgs) {
    // preset trước, đối số lúc gọi nối sau
    return targetFn.apply(thisArg, [...presetArgs, ...callArgs]);
  };
};
```

Điểm dễ quên:

- `this` bên trong `myBind` **là hàm gốc**, vì ta gọi theo kiểu `fn.myBind(...)`.
- Phải **nối** `presetArgs` với `callArgs` theo đúng thứ tự, không ghi đè nhau.
- Hàm trả về nên là `function` thường chứ không phải arrow, để còn hỗ trợ `new`.
- Bản đầy đủ cần xử lý thêm trường hợp gọi bằng `new` (khi đó `thisArg` bị bỏ qua) và giữ prototype chain của hàm gốc.

</details>

**14. Chuyện gì xảy ra khi dùng `new` trên một hàm đã `bind`? Giá trị `this` lúc đó là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`new` **thắng** `bind`: `thisArg` đã gắn cứng bị **bỏ qua**, `this` là object mới do `new` tạo ra. Các đối số preset thì vẫn được giữ.

```js
function Point(x, y) {
  this.x = x;
  this.y = y;
}

const Bound = Point.bind({ fake: true }, 10); // ép this = {fake:true}, preset x = 10

const p = new Bound(20);
p.x; // 10 — preset vẫn có hiệu lực
p.y; // 20
p.fake;                       // undefined — thisArg bị bỏ qua
p instanceof Point;           // true
```

Lý do: bound function giữ tham chiếu tới hàm gốc. Khi được gọi bình thường, nó ép `this` theo `thisArg`. Nhưng khi gọi bằng `new`, engine đi theo đường "khởi tạo object" của hàm gốc — object mới được tạo và gán làm `this`, nên không còn chỗ cho `thisArg`.

Đây cũng là chi tiết hay bị bỏ sót khi viết polyfill `bind` ở câu trên.

</details>

**15. Trong React class component, vì sao phải viết `this.handleClick = this.handleClick.bind(this)` trong constructor? Kể các cách thay thế và đánh đổi của mỗi cách.**

<details className="qa">
<summary>Xem đáp án</summary>

Vì `onClick={this.handleClick}` chỉ **truyền hàm đi**, không gọi qua dấu chấm. Khi React gọi lại handler, `this` là `undefined` (thân class luôn ở strict mode) → `this.setState` ném lỗi. `bind(this)` trong constructor tạo bản gắn cứng `this`, và vì chỉ chạy một lần nên tham chiếu **ổn định qua các lần render**.

| Cách viết | Ưu | Nhược |
|---|---|---|
| `bind` trong constructor | Tham chiếu ổn định, không tạo hàm mới mỗi render | Dài dòng, dễ quên với method mới |
| Class field arrow: `handleClick = () => {}` | Gọn nhất, `this` lexical tự đúng | Method nằm trên instance chứ không trên prototype |
| `onClick={() => this.handleClick()}` | Viết nhanh, truyền tham số dễ | Tạo hàm **mới mỗi render** → child dùng `PureComponent`/`memo` bị re-render thừa |
| `onClick={this.handleClick.bind(this)}` | Không cần constructor | Cũng tạo hàm mới mỗi render — nhược điểm y hệt |

Trong code hiện đại, function component + hooks loại bỏ hoàn toàn `this` nên vấn đề này biến mất.

</details>

**16. Trong code hiện đại (arrow function, class field, rest/spread, hooks), `call`/`apply`/`bind` còn cần thiết không? Kể trường hợp thực tế vẫn bắt buộc phải dùng.**

<details className="qa">
<summary>Xem đáp án</summary>

Ít dùng hơn nhiều, nhưng **chưa lỗi thời**. Những thứ thay thế phần lớn nhu cầu cũ: arrow giữ `this` lexical, class field tự bind, rest/spread thay `apply`, hooks bỏ hẳn `this`.

Các trường hợp vẫn cần:

- **Function borrowing trong utility** — `Object.prototype.toString.call(x)` để check type, `Object.prototype.hasOwnProperty.call(obj, key)` để an toàn khi object có key tên `hasOwnProperty` hoặc được tạo bằng `Object.create(null)`.
- **Đọc và bảo trì code legacy** — `slice.call(arguments)`, `bind` trong React class component vẫn đầy trong codebase cũ.
- **Viết decorator / wrapper / middleware** — hàm bọc nhận `this` và đối số động rồi chuyển tiếp: `fn.apply(this, args)` trong các hàm `debounce`, `throttle`, `memoize`, logger.
- **Monkey-patch hoặc mock** built-in, thư viện: giữ nguyên context của hàm gốc khi gọi lại.
- **Câu hỏi phỏng vấn** — viết polyfill `bind`/`call` là bài test kinh điển để kiểm tra bạn hiểu `this` tới đâu.

</details>
