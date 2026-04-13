---
sidebar_position: 2
title: "2. this, Prototype title: "this, Prototype & Kế thừa trong JS" Kế thừa trong JS"
---

# this, Prototype & Kế thừa trong JS

`this` là một trong những khái niệm gây nhiều nhầm lẫn nhất trong JavaScript. Kết hợp với prototype chain và kế thừa, đây là nhóm câu hỏi mà interviewer rất thích dùng để đánh giá mức độ hiểu sâu về ngôn ngữ của ứng viên.

---

## Câu 1: `this` trong các context khác nhau `[Intermediate]`

### Câu hỏi

> Giá trị của `this` được xác định như thế nào trong JavaScript? Cho ví dụ trong mỗi context.

### Giải thích lý thuyết

`this` trong JavaScript **không cố định** -- nó được xác định **tại thời điểm gọi hàm**, không phải tại thời điểm định nghĩa (ngoại trừ arrow function). Có 5 quy tắc chính:

| Context | Giá trị của `this` |
|---|---|
| Global (non-strict) | `window` (browser) / `global` (Node) |
| Global (strict mode) | `undefined` |
| Method call (`obj.fn()`) | Object phía trước dấu `.` |
| Constructor (`new Fn()`) | Object mới được tạo |
| Arrow function | Kế thừa `this` từ scope cha (lexical this) |
| Event handler (DOM) | Element nhận event |
| `call`/`apply`/`bind` | Object được truyền vào |

### Code ví dụ

```javascript
// ===== 1. Global context =====
console.log(this); // window (browser) hoặc {} (Node module)

// ===== 2. Method call =====
const user = {
  name: "An",
  greet() {
    console.log(`Xin chào, tôi là ${this.name}`);
  },
};

user.greet(); // "Xin chào, tôi là An" -- this = user

const greetFn = user.greet;
greetFn(); // "Xin chào, tôi là undefined" -- this = window (mất context!)

// ===== 3. Constructor =====
function Person(name) {
  this.name = name; // this = object mới được tạo bởi new
}

const p = new Person("Bình");
console.log(p.name); // "Bình"

// ===== 4. Arrow function -- lexical this =====
const team = {
  name: "Dev Team",
  members: ["An", "Bình", "Cường"],

  // WRONG: regular function mất this
  printMembersWrong() {
    this.members.forEach(function (member) {
      // this ở đây là undefined (strict) hoặc window
      console.log(`${member} thuộc ${this.name}`); // this.name = undefined
    });
  },

  // CORRECT: arrow function kế thừa this từ printMembers
  printMembers() {
    this.members.forEach((member) => {
      // Arrow function không có this riêng, dùng this của printMembers
      console.log(`${member} thuộc ${this.name}`); // "Dev Team"
    });
  },
};

team.printMembers();

// ===== 5. Event handler =====
// button.addEventListener('click', function() {
//   console.log(this); // button element
// });

// button.addEventListener('click', () => {
//   console.log(this); // window -- arrow function kế thừa scope cha!
// });
```

### Đáp án mẫu

> "`this` trong JavaScript được xác định bởi cách hàm được gọi, không phải nơi hàm được định nghĩa. Có 5 quy tắc chính: global context, method call (this = object trước dấu chấm), constructor (this = object mới), arrow function (kế thừa this từ lexical scope), và explicit binding qua call/apply/bind. Đặc biệt, arrow function không có `this` riêng -- đây là điểm khác biệt cơ bản với regular function và là lý do chính để chọn arrow function trong callback."

---

## Câu 2: `call`, `apply`, `bind` `[Intermediate]`

### Câu hỏi

> Phân biệt `call`, `apply` và `bind`. Khi nào dùng cái nào?

### Giải thích lý thuyết

Cả ba đều dùng để **gán `this` cho hàm**, nhưng cách hoạt động khác nhau:

| Phương thức | Cú pháp | Gọi ngay? | Trả về |
|---|---|---|---|
| `call` | `fn.call(thisArg, a, b, c)` | Có | Kết quả của hàm |
| `apply` | `fn.apply(thisArg, [a, b, c])` | Có | Kết quả của hàm |
| `bind` | `fn.bind(thisArg, a, b)` | Không | Hàm mới với this đã bind |

Mẹo nhớ: **C**all = **C**omma (tham số cách nhau bằng dấu phẩy), **A**pply = **A**rray (tham số là array).

### Code ví dụ

```javascript
function introduce(greeting, punctuation) {
  return `${greeting}, tôi là ${this.name}${punctuation}`;
}

const person = { name: "An" };

// call -- truyền tham số riêng lẻ
console.log(introduce.call(person, "Xin chào", "!"));
// "Xin chào, tôi là An!"

// apply -- truyền tham số là array
console.log(introduce.apply(person, ["Hey", "~"]));
// "Hey, tôi là An~"

// bind -- trả về hàm mới, chưa gọi
const boundIntroduce = introduce.bind(person, "Chào");
console.log(boundIntroduce(".")); // "Chào, tôi là An."
// Có thể gọi nhiều lần
console.log(boundIntroduce("!!")); // "Chào, tôi là An!!"

// ===== Use case thực tế: method borrowing =====
const numbers = {
  values: [1, 5, 3, 8, 2],
  findMax() {
    // "mượn" Math.max với apply
    return Math.max.apply(null, this.values);
    // Tương đương: Math.max(...this.values)
  },
};

console.log(numbers.findMax()); // 8

// ===== Use case: fix mất this =====
class Logger {
  constructor(prefix) {
    this.prefix = prefix;
    // Bind để không mất this khi truyền như callback
    this.log = this.log.bind(this);
  }

  log(message) {
    console.log(`[${this.prefix}] ${message}`);
  }
}

const logger = new Logger("APP");
const logFn = logger.log;
logFn("Khởi động"); // "[APP] Khởi động" -- this đã được bind

// Không bind thì:
// const logFn2 = logger.log; // mất this -> lỗi

// ===== Partial application với bind =====
function multiply(a, b) {
  return a * b;
}

const double = multiply.bind(null, 2); // a = 2, đợi b
const triple = multiply.bind(null, 3); // a = 3, đợi b

console.log(double(5));  // 10
console.log(triple(5));  // 15
```

### Đáp án mẫu

> "`call` và `apply` đều gọi hàm ngay với `this` được chỉ định -- khác biệt là `call` nhận tham số riêng lẻ còn `apply` nhận array. `bind` trả về một hàm mới với `this` đã được bind vĩnh viễn, hữu ích khi truyền method làm callback. Use case phổ biến nhất là fix mất this trong class methods, method borrowing, và partial application."

---

## Câu 3: Prototype Chain `[Senior]`

### Câu hỏi

> Giải thích prototype chain trong JavaScript. Khi truy cập một property, JavaScript tìm kiếm nó như thế nào?

### Giải thích lý thuyết

Mỗi object trong JavaScript có một **internal slot** gọi là `[[Prototype]]` (truy cập qua `__proto__` hoặc `Object.getPrototypeOf()`). Khi truy cập property trên một object:

1. Tìm trong chính object đó.
2. Nếu không thấy, tìm trong `[[Prototype]]` của nó.
3. Tiếp tục đi lên chuỗi prototype.
4. Dừng lại khi gặp `null` (đỉnh của chuỗi -- `Object.prototype.__proto__`).
5. Trả về `undefined` nếu không tìm thấy.

### Code ví dụ

```javascript
// ===== Minh họa prototype chain =====
const animal = {
  type: "Animal",
  eat() {
    return `${this.name} đang ăn`;
  },
};

const dog = Object.create(animal); // dog.__proto__ = animal
dog.name = "Rex";
dog.bark = function () {
  return `${this.name}: Gâu gâu!`;
};

const puppy = Object.create(dog); // puppy.__proto__ = dog
puppy.name = "Lucky";

// Prototype chain: puppy -> dog -> animal -> Object.prototype -> null

console.log(puppy.name);  // "Lucky"        -- tìm thấy ở puppy
console.log(puppy.bark()); // "Lucky: Gâu gâu!" -- tìm thấy ở dog
console.log(puppy.eat());  // "Lucky đang ăn" -- tìm thấy ở animal
console.log(puppy.type);  // "Animal"       -- tìm thấy ở animal

// ===== Kiểm tra prototype =====
console.log(Object.getPrototypeOf(puppy) === dog);    // true
console.log(Object.getPrototypeOf(dog) === animal);    // true

console.log(puppy.hasOwnProperty("name"));  // true
console.log(puppy.hasOwnProperty("bark"));  // false -- bark ở dog
console.log(puppy.hasOwnProperty("eat"));   // false -- eat ở animal

// ===== Property shadowing =====
dog.type = "Dog"; // Tạo property "type" trên dog, KHÔNG sửa animal.type
console.log(dog.type);    // "Dog"    -- dog's own property
console.log(animal.type); // "Animal" -- không bị thay đổi
console.log(puppy.type);  // "Dog"    -- tìm thấy ở dog (gần hơn animal)

// ===== Constructor function và prototype =====
function Vehicle(brand) {
  this.brand = brand;
}

Vehicle.prototype.start = function () {
  return `${this.brand} khởi động`;
};

const car = new Vehicle("Toyota");
// car.__proto__ === Vehicle.prototype

console.log(car.start()); // "Toyota khởi động"
console.log(car instanceof Vehicle); // true
```

### Đáp án mẫu

> "Mỗi object có một [[Prototype]] link trỏ đến object khác, tạo thành prototype chain. Khi truy cập property, JS tìm từ object hiện tại đi lên chuỗi cho đến Object.prototype (đỉnh chuỗi). Nếu không thấy trả về undefined. Property shadowing xảy ra khi object con có property trùng tên với prototype -- nó 'che' property của prototype. Đây là cơ chế kế thừa cốt lõi của JavaScript, ES6 class chỉ là syntactic sugar trên prototype."

---

## Câu 4: ES6 Class vs Prototype-based inheritance `[Senior]`

### Câu hỏi

> ES6 class có phải là OOP thực sự không? So sánh với prototype-based inheritance.

### Giải thích lý thuyết

ES6 `class` là **syntactic sugar** trên prototype-based inheritance. Nó **không** tạo ra một cơ chế kế thừa mới -- vẫn dùng prototype chain phía sau.

| Tiêu chí | Prototype Pattern | ES6 Class |
|---|---|---|
| Cú pháp | Verbose, khó đọc | Sạch, quen thuộc với dev OOP |
| Hoisting | Function declaration được hoist | Class **không** được hoist (TDZ) |
| Strict mode | Tùy chọn | **Luôn strict mode** |
| `new` | Có thể quên `new` | Bắt buộc `new`, báo lỗi nếu không |
| Method enumerable | `for...in` có thể thấy | Methods **không** enumerable |
| Cơ chế bên trong | Prototype chain | Prototype chain (y hệt) |

### Code ví dụ

```javascript
// ===== Prototype-based =====
function Animal(name) {
  this.name = name;
}

Animal.prototype.speak = function () {
  return `${this.name} kêu`;
};

function Dog(name, breed) {
  Animal.call(this, name); // Gọi constructor cha
  this.breed = breed;
}

// Thiết lập kế thừa
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function () {
  return `${this.name} (${this.breed}): Gâu gâu!`;
};

const rex = new Dog("Rex", "Husky");
console.log(rex.speak()); // "Rex kêu"
console.log(rex.bark());  // "Rex (Husky): Gâu gâu!"

// ===== ES6 Class -- tương đương 100% =====
class AnimalClass {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return `${this.name} kêu`;
  }
}

class DogClass extends AnimalClass {
  constructor(name, breed) {
    super(name); // Tương đương Animal.call(this, name)
    this.breed = breed;
  }

  bark() {
    return `${this.name} (${this.breed}): Gâu gâu!`;
  }
}

const lucky = new DogClass("Lucky", "Corgi");
console.log(lucky.speak()); // "Lucky kêu"
console.log(lucky.bark());  // "Lucky (Corgi): Gâu gâu!"

// ===== Chứng minh class là syntactic sugar =====
console.log(typeof AnimalClass);  // "function" -- class thực chất là function!
console.log(lucky.__proto__ === DogClass.prototype);          // true
console.log(DogClass.prototype.__proto__ === AnimalClass.prototype); // true

// ===== ES2022 class features =====
class BankAccount {
  // Private field (ES2022)
  #balance = 0;

  // Public field
  owner;

  // Static field
  static bankName = "VN Bank";

  constructor(owner, initialBalance) {
    this.owner = owner;
    this.#balance = initialBalance;
  }

  // Getter
  get balance() {
    return this.#balance;
  }

  // Private method
  #validate(amount) {
    if (amount <= 0) throw new Error("Số tiền không hợp lệ");
  }

  deposit(amount) {
    this.#validate(amount);
    this.#balance += amount;
    return this;
  }

  // Static method
  static getBankInfo() {
    return `Ngân hàng: ${BankAccount.bankName}`;
  }
}

const acc = new BankAccount("An", 1000);
acc.deposit(500);
console.log(acc.balance);  // 1500
// console.log(acc.#balance); // SyntaxError: Private field
console.log(BankAccount.getBankInfo()); // "Ngân hàng: VN Bank"
```

### Đáp án mẫu

> "ES6 class là syntactic sugar trên prototype -- typeof class trả về 'function' và kế thừa vẫn dùng prototype chain. Tuy nhiên class có nhiều lợi thế: cú pháp sạch hơn, tự động strict mode, bắt buộc dùng `new`, và hỗ trợ private fields (#). Tôi khuyên dùng class cho code mới vì nó dàng rõ ràng và quen thuộc hơn, nhưng cần hiểu prototype phía sau để debug hiệu quả."

---

## Câu 5: `Object.create()` vs `new` `[Senior]`

### Câu hỏi

> `Object.create()` và `new` khác nhau như thế nào? Khi nào nên dùng cái nào?

### Giải thích lý thuyết

| Tiêu chí | `new Constructor()` | `Object.create(proto)` |
|---|---|---|
| Tạo object mới | Có | Có |
| Gọi constructor | Có | **Không** |
| Set prototype | `Constructor.prototype` | Object được truyền vào |
| Linh hoạt | Thấp (phải có constructor) | Cao (bất kỳ object nào làm prototype) |
| Use case | Tạo instance từ class/constructor | Prototype delegation, mixin |

### Code ví dụ

```javascript
// ===== new =====
function Car(brand) {
  // new tạo: this = {} với __proto__ = Car.prototype
  this.brand = brand;
  // tự động return this
}
Car.prototype.drive = function () {
  return `Lái xe ${this.brand}`;
};

const toyota = new Car("Toyota");
console.log(toyota.drive()); // "Lái xe Toyota"

// ===== Object.create =====
const carPrototype = {
  drive() {
    return `Lái xe ${this.brand}`;
  },
  honk() {
    return "Bíp bíp!";
  },
};

const honda = Object.create(carPrototype);
honda.brand = "Honda";
console.log(honda.drive()); // "Lái xe Honda"
console.log(honda.honk());  // "Bíp bíp!"

// ===== Object.create(null) -- "pure dictionary" =====
const dict = Object.create(null);
// dict không có prototype -> không có toString, hasOwnProperty, etc.
dict.key = "value";
console.log(dict.key); // "value"
// console.log(dict.toString()); // TypeError -- không có method nào

// Hữu ích khi cần object "sạch" làm map, không lo trùng tên với prototype methods
dict["hasOwnProperty"] = "oops"; // An toàn! Không ghi đè gì cả

// ===== So sánh tạo kế thừa =====
// Với new:
function Parent(x) {
  this.x = x;
}
function Child(x, y) {
  Parent.call(this, x);
  this.y = y;
}
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;

// Với Object.create (không cần constructor):
const parent = {
  greet() {
    return `Hello from ${this.name}`;
  },
};

const child = Object.create(parent);
child.name = "Child";
console.log(child.greet()); // "Hello from Child"
```

### Đáp án mẫu

> "`new` gọi constructor function để tạo object mới với prototype là Constructor.prototype. `Object.create` tạo object mới với prototype là bất kỳ object nào được truyền vào, **không gọi constructor**. `Object.create` linh hoạt hơn -- có thể tạo object không có prototype (`Object.create(null)`) hoặc dùng prototype delegation mà không cần class. Trong thực tế, `new` và class phổ biến hơn cho OOP pattern, còn `Object.create` hay dùng khi cần prototype delegation linh hoạt hoặc tạo 'pure dictionary'."

---

## Câu 6: Bài tập thực hành tổng hợp `[Senior]`

### Câu hỏi

> Đoạn code sau output gì? Giải thích.

```javascript
const obj = {
  name: "Object",
  getName: function () {
    return this.name;
  },
  getNameArrow: () => {
    return this.name;
  },
  getNameNested: function () {
    const inner = () => {
      return this.name;
    };
    return inner();
  },
};

console.log(obj.getName());         // ?
console.log(obj.getNameArrow());    // ?
console.log(obj.getNameNested());   // ?

const { getName, getNameArrow, getNameNested } = obj;
console.log(getName());             // ?
console.log(getNameNested());       // ?
```

### Giải thích và đáp án

```javascript
console.log(obj.getName());
// "Object" -- method call, this = obj

console.log(obj.getNameArrow());
// undefined -- arrow function kế thừa this từ scope nơi nó được ĐỊNH NGHĨA
// getNameArrow được định nghĩa trong object literal, scope cha là global/module
// -> this = window (undefined trong strict mode/module)

console.log(obj.getNameNested());
// "Object" -- getNameNested là regular function, this = obj
// inner là arrow function, kế thừa this từ getNameNested -> this = obj

const { getName, getNameArrow, getNameNested } = obj;

console.log(getName());
// undefined -- mất context, this = window/undefined

console.log(getNameNested());
// undefined -- mất context, this = window/undefined
// inner kế thừa this từ getNameNested, nhưng getNameNested mất context
```

### Đáp án mẫu

> "Kết quả là: `'Object'`, `undefined`, `'Object'`, `undefined`, `undefined`. Điểm mấu chốt là: regular function xác định `this` lúc gọi (ai gọi nó), arrow function kế thừa `this` từ nơi nó được định nghĩa. Khi destructure method ra khỏi object, nó mất context (this không còn là obj nữa). Đây là lý do trong React, chúng ta thường dùng arrow function hoặc bind trong class components."

---

## Lỗi thường gặp khi trả lời

| Lỗi | Giải thích đúng |
|---|---|
| "Arrow function có this riêng" | Arrow function **không có** this riêng, nó kế thừa từ lexical scope cha. |
| "Class là cơ chế kế thừa mới" | Class là syntactic sugar, vẫn dùng prototype chain. `typeof MyClass` trả về `"function"`. |
| "`this` luôn là object gọi hàm" | Không đúng với arrow function, global context, và explicit binding. |
| "Prototype và `__proto__` là một" | `prototype` là property của function (constructor). `__proto__` là link trên mỗi object trỏ đến prototype của constructor. |
| "`Object.create` giống `new`" | `Object.create` **không** gọi constructor. `new` gọi constructor, set `this`, và return object mới. |
| "`bind` thay đổi this vĩnh viễn" | `bind` trả về hàm **mới** với this đã bind. Hàm gốc không bị ảnh hưởng. Nhưng một hàm đã bind không thể bind lại. |
