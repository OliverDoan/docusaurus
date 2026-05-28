---
sidebar_position: 2
title: "2. this, Prototype & Kế thừa"
---

# `this`, Prototype & Kế thừa

> *Phần này test xem bạn có thực sự hiểu cách JavaScript hoạt động "dưới capô" hay chỉ biết viết React component. Bug về `this` chiếm phần lớn lỗi production của dev mới.*

---

## Câu 1: 4 quy tắc bind `this` trong JavaScript `[Intermediate]`

### Câu hỏi

> Em hãy liệt kê các quy tắc xác định `this` trong JavaScript. Đoạn code sau, mỗi lệnh log ra gì?
>
> ```javascript
> const obj = {
>   name: "A",
>   greet() { console.log(this?.name); }
> };
> obj.greet();
> const g = obj.greet;
> g();
> g.call({ name: "B" });
> new obj.greet();
> ```

### Giải thích lý thuyết

Thứ tự ưu tiên (từ cao → thấp):

1. **`new` binding** → `this` là object mới được tạo.
2. **Explicit binding** (`call`/`apply`/`bind`) → `this` là argument truyền vào.
3. **Implicit binding** (`obj.fn()`) → `this` là object trước dấu chấm.
4. **Default binding** → `undefined` (strict mode) hoặc `globalThis` (sloppy mode).

**Arrow function không có `this` riêng** — nó lấy `this` của lexical scope ngoài (giống biến thường).

### Code minh hoạ

```javascript
const obj = {
  name: "A",
  greet() { console.log(this?.name); }
};

obj.greet();              // "A"   — implicit binding
const g = obj.greet;
g();                      // undefined — default binding (strict)
g.call({ name: "B" });    // "B"   — explicit binding
new obj.greet();          // undefined — new binding tạo {} mới, không có .name

// Arrow vs regular
const counter = {
  count: 0,
  startRegular() { setInterval(function () { this.count++; }, 1000); },
  startArrow()   { setInterval(() => { this.count++; }, 1000); }
};

// startRegular bug: this trong callback = undefined (strict) hoặc window
// startArrow đúng: arrow giữ this = counter
```

### Đáp án mẫu

> "Có 4 quy tắc, theo thứ tự ưu tiên: `new` binding, explicit binding qua `call/apply/bind`, implicit binding khi gọi qua object, và default binding (undefined trong strict). Riêng arrow function không có `this` riêng, nó kế thừa từ lexical scope. Với đoạn code trên: `obj.greet()` → 'A', `g()` → undefined do mất binding, `g.call({name:'B'})` → 'B', `new obj.greet()` → undefined vì tạo object mới không có `.name`."

---

## Câu 2: Khác biệt giữa `call`, `apply`, `bind` `[Intermediate]`

### Câu hỏi

> Khi nào em dùng `call`, khi nào dùng `apply`, khi nào dùng `bind`? Cho ví dụ thực tế.

### Giải thích lý thuyết

| Method  | Gọi function ngay | Cách truyền args        | Trả về             |
| ------- | ----------------- | ----------------------- | ------------------ |
| `call`  | Có                | Liệt kê: `fn.call(t,a,b)` | Kết quả của fn   |
| `apply` | Có                | Mảng: `fn.apply(t,[a,b])` | Kết quả của fn   |
| `bind`  | Không             | Liệt kê                  | Function mới đã bind `this` |

### Code minh hoạ

```javascript
function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`;
}

const user = { name: "An" };

greet.call(user, "Hi", "!");        // "Hi, An!"
greet.apply(user, ["Hi", "!"]);     // "Hi, An!"
const boundGreet = greet.bind(user);
boundGreet("Hi", "!");              // "Hi, An!"

// Use case thực tế: mượn array method cho array-like
function sum() {
  return Array.prototype.reduce.call(arguments, (a, b) => a + b, 0);
}
sum(1, 2, 3); // 6

// (Modern: dùng rest params + Array.from thay vì call)
function sumModern(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}

// Use case bind: event handler giữ context
class Counter {
  constructor() {
    this.count = 0;
    this.handleClick = this.handleClick.bind(this); // bind 1 lần
  }
  handleClick() { this.count++; }
}
```

### Đáp án mẫu

> "Cả 3 đều set `this`. `call` truyền args dạng liệt kê, `apply` truyền dạng mảng — về performance hiện đại không khác nhau, chọn theo cú pháp thuận hơn. `bind` không gọi function mà trả về function mới đã pre-bind. Em hay dùng `bind` nhất trong React class component để bind method một lần ở constructor, tránh tạo function mới mỗi render. Trong code modern hầu như chỉ còn dùng `bind` — `call`/`apply` bị thay thế bởi spread operator."

---

## Câu 3: Prototype chain hoạt động thế nào? `[Intermediate]`

### Câu hỏi

> Khi em gọi `arr.map()` trên một array, JavaScript tìm `map` ở đâu? Vẽ lại prototype chain của array.

### Giải thích lý thuyết

Mỗi object có internal slot `[[Prototype]]` trỏ tới một object khác (hoặc `null`). Khi đọc thuộc tính, JS:

1. Tìm trên object hiện tại.
2. Không thấy → đi theo `[[Prototype]]` lên parent.
3. Lặp đến khi gặp `null`. Không thấy → trả về `undefined`.

```
arr → Array.prototype → Object.prototype → null
```

### Code minh hoạ

```javascript
const arr = [1, 2, 3];

// Chain: arr → Array.prototype → Object.prototype → null
Object.getPrototypeOf(arr) === Array.prototype;            // true
Object.getPrototypeOf(Array.prototype) === Object.prototype; // true
Object.getPrototypeOf(Object.prototype) === null;          // true

// Tìm method
arr.map(...);     // Có trên Array.prototype
arr.toString();   // Có trên Array.prototype (override Object.prototype.toString)
arr.hasOwnProperty("length"); // Có trên Object.prototype

// `hasOwnProperty` vs `in`
arr.hasOwnProperty("map"); // false — `map` nằm trên prototype
"map" in arr;              // true  — `in` đi cả prototype chain

// Tạo object kế thừa
const animal = { eat() { console.log("eating"); } };
const dog = Object.create(animal);
dog.bark = () => console.log("woof");
dog.eat();  // "eating" — lấy từ prototype
dog.bark(); // "woof"
```

### Đáp án mẫu

> "Khi gọi `arr.map`, engine tìm trên chính `arr` trước — không thấy thì đi theo `[[Prototype]]` lên `Array.prototype`, tìm thấy `map` ở đó. Nếu không thấy nữa thì lên tiếp `Object.prototype`, rồi `null`. Đây là lý do tại sao mọi array đều có `map`, `filter`, `reduce` — chúng nằm trên `Array.prototype` chứ không phải copy vào từng array. Để check có method nằm trên chính object hay không, dùng `hasOwnProperty` thay vì `in`."

---

## Câu 4: `class` của ES6 là syntactic sugar của gì? `[Senior]`

### Câu hỏi

> ES6 `class` được mọi người gọi là syntactic sugar. Sugar của cái gì? Có điểm nào `class` làm được mà prototype-based truyền thống không làm được không?

### Giải thích lý thuyết

`class` chủ yếu là sugar cho **constructor function + prototype**, nhưng KHÔNG hoàn toàn tương đương:

| Khác biệt                         | `class`                         | Function constructor             |
| --------------------------------- | ------------------------------- | -------------------------------- |
| Hoisting                          | Có, nhưng nằm trong TDZ         | Function declaration hoist full  |
| Bắt buộc `new`                    | Bắt buộc                        | Không (có thể gọi như fn thường) |
| `[[FunctionKind]]`                | `classConstructor`              | `normal`                         |
| Method enumerable                 | `false` (không hiện trong `for...in`) | `true` mặc định            |
| Strict mode trong body            | Mặc định                        | Không (trừ khi khai báo)         |
| `extends` đúng đắn                | Built-in (super, hidden classes) | Phải làm thủ công bằng `Object.create` |

### Code minh hoạ

```javascript
// ES6 class
class Animal {
  constructor(name) { this.name = name; }
  eat() { console.log(`${this.name} eats`); }
}
class Dog extends Animal {
  bark() { console.log("woof"); }
}

// Tương đương prototype-based (gần đúng)
function AnimalFn(name) { this.name = name; }
AnimalFn.prototype.eat = function () { console.log(`${this.name} eats`); };

function DogFn(name) { AnimalFn.call(this, name); }
DogFn.prototype = Object.create(AnimalFn.prototype);
DogFn.prototype.constructor = DogFn;
DogFn.prototype.bark = function () { console.log("woof"); };

// Khác biệt thực tế
Animal("Tom");    // TypeError: must be called with new
AnimalFn("Tom");  // OK nhưng `this` = window/undefined (bug)

// Private fields — class làm được, prototype-based không có cú pháp
class Account {
  #balance = 0;
  deposit(amt) { this.#balance += amt; }
  get balance() { return this.#balance; }
}
```

### Đáp án mẫu

> "`class` là sugar trên top của constructor function + prototype, nhưng có một số khác biệt thực: class bắt buộc `new`, body luôn ở strict mode, method không enumerable, và quan trọng nhất là cú pháp `extends` + `super` thực hiện đúng prototype chain mà tự làm tay rất dễ sai. Ngoài ra `class` có **private fields** (`#field`) và `static` block — cái mà prototype truyền thống không có cú pháp. Nên dùng `class` cho code OOP modern, đừng quay lại function constructor."

---

## Câu 5: Mất `this` trong callback — cách fix `[Intermediate]`

### Câu hỏi

> ```javascript
> class Timer {
>   constructor() {
>     this.seconds = 0;
>     setInterval(function tick() { this.seconds++; }, 1000);
>   }
> }
> ```
>
> Đoạn này có bug gì? Liệt kê các cách fix và đánh giá ưu nhược điểm.

### Giải thích lý thuyết

Bug: `function tick` có `this` riêng, được setInterval gọi như default binding → `this = undefined` (strict) → `undefined.seconds++` throw.

3 cách fix:

| Cách             | Code                                       | Ưu                      | Nhược                    |
| ---------------- | ------------------------------------------ | ----------------------- | ------------------------ |
| Arrow function   | `setInterval(() => this.seconds++, 1000);` | Ngắn gọn, modern        | Không có ưu điểm nào khác đáng kể |
| `bind`           | `setInterval(tick.bind(this), 1000);`      | Rõ ý đồ                 | Tạo function mới mỗi lần |
| `self = this`    | `const self = this;`                       | Hỗ trợ env cũ           | Code "smell" thời ES5    |

### Code minh hoạ

```javascript
// Fix 1: Arrow (preferred)
class Timer {
  constructor() {
    this.seconds = 0;
    setInterval(() => this.seconds++, 1000);
  }
}

// Fix 2: bind
class Timer2 {
  constructor() {
    this.seconds = 0;
    this.tick = this.tick.bind(this); // bind 1 lần
    setInterval(this.tick, 1000);
  }
  tick() { this.seconds++; }
}

// Fix 3: self = this (legacy)
class Timer3 {
  constructor() {
    this.seconds = 0;
    const self = this;
    setInterval(function () { self.seconds++; }, 1000);
  }
}

// React class field syntax (kết hợp arrow + class field)
class TimerComponent extends React.Component {
  state = { seconds: 0 };
  tick = () => this.setState((s) => ({ seconds: s.seconds + 1 }));
}
```

### Đáp án mẫu

> "Bug là `function tick` có `this` riêng và setInterval gọi default binding nên `this` = undefined trong strict mode. Em sẽ fix bằng arrow function — `setInterval(() => this.seconds++, 1000)`. Arrow không có `this` riêng nên kế thừa lexical `this` từ constructor. Hai cách khác là `tick.bind(this)` hoặc lưu `const self = this`, nhưng arrow ngắn gọn và là idiom modern. Trong React, cú pháp class field `handleClick = () => {}` cũng giải quyết bug này một cách elegant."

---

## Câu 6: Composition vs Inheritance — chọn cái nào? `[Senior]`

### Câu hỏi

> "Favor composition over inheritance" — em hiểu câu này thế nào? Cho ví dụ một tình huống em nên ưu tiên composition.

### Giải thích lý thuyết

**Inheritance** tạo quan hệ "is-a" (rigid, tight coupling). Vấn đề:

- **Fragile base class**: thay đổi parent có thể break tất cả con.
- **Diamond problem**, deep hierarchy khó debug.
- Khó kết hợp nhiều behaviors (JS không có multiple inheritance).

**Composition** tạo quan hệ "has-a" (flexible). Object kết hợp nhiều behaviors qua object literal hoặc function.

### Code minh hoạ

```javascript
// Inheritance — cứng nhắc
class Animal {
  eat() {}
}
class Dog extends Animal {
  bark() {}
}
class FlyingDog extends Dog { // có cần phải kế thừa Dog không?
  fly() {}
}

// Composition — linh hoạt
const canEat = (state) => ({ eat: () => console.log(`${state.name} eats`) });
const canBark = (state) => ({ bark: () => console.log("woof") });
const canFly = (state) => ({ fly: () => console.log("flying") });

const createDog = (name) => {
  const state = { name };
  return { ...state, ...canEat(state), ...canBark(state) };
};

const createFlyingDog = (name) => {
  const state = { name };
  return { ...state, ...canEat(state), ...canBark(state), ...canFly(state) };
};

// React: HOC vs Hook
// Inheritance-style (cũ): HOC nesting
const Enhanced = withAuth(withTheme(withRouter(Component)));

// Composition-style (modern): hooks
function Component() {
  const auth = useAuth();
  const theme = useTheme();
  const router = useRouter();
}
```

### Đáp án mẫu

> "Inheritance tạo quan hệ 'is-a' chặt — thay đổi parent ảnh hưởng tất cả con, và JS chỉ cho single inheritance nên khó kết hợp nhiều behaviors. Composition tạo quan hệ 'has-a' — đối tượng được lắp ráp từ các 'mảnh' chức năng nhỏ. Một ví dụ rõ nhất em từng làm là khi build một UI library: ban đầu em làm `class IconButton extends Button extends BaseControl` — đến khi cần `ToggleIconButton` thì kẹt. Refactor sang composition với React hooks (`useToggle`, `useIcon`, `useButton`) thì kết hợp được mọi tổ hợp tính năng mà không phải đẻ ra class mới."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                            | Đúng là                                                                  |
| -------------------------------------------------- | ------------------------------------------------------------------------ |
| "Arrow function chậm hơn function thường"          | Không có khác biệt performance đáng kể; arrow không hỗ trợ `new`, `arguments` |
| "`bind` thay đổi `this` của function gốc"         | `bind` trả về function MỚI; function gốc không đổi                       |
| "Prototype = inheritance"                          | Prototype là chain lookup, inheritance là pattern xây trên prototype     |
| "`class` không phải prototype-based"               | Vẫn là prototype-based, chỉ là cú pháp khác                              |
| "`new` luôn cần thiết với `class`"                 | Đúng — nhưng nếu quên thì throw TypeError, không silent như fn constructor |
