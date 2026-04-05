---
sidebar_position: 2
title: "this, Prototype & Ke thua trong JS"
---

# this, Prototype & Ke thua trong JS

`this` la mot trong nhung khai niem gay nhieu nham lan nhat trong JavaScript. Ket hop voi prototype chain va ke thua, day la nhom cau hoi ma interviewer rat thich dung de danh gia muc do hieu sau ve ngon ngu cua ung vien.

---

## Cau 1: `this` trong cac context khac nhau `[Intermediate]`

### Cau hoi

> Gia tri cua `this` duoc xac dinh nhu the nao trong JavaScript? Cho vi du trong moi context.

### Giai thich ly thuyet

`this` trong JavaScript **khong co dinh** -- no duoc xac dinh **tai thoi diem goi ham**, khong phai tai thoi diem dinh nghia (ngoai tru arrow function). Co 5 quy tac chinh:

| Context | Gia tri cua `this` |
|---|---|
| Global (non-strict) | `window` (browser) / `global` (Node) |
| Global (strict mode) | `undefined` |
| Method call (`obj.fn()`) | Object phia truoc dau `.` |
| Constructor (`new Fn()`) | Object moi duoc tao |
| Arrow function | Ke thua `this` tu scope cha (lexical this) |
| Event handler (DOM) | Element nhan event |
| `call`/`apply`/`bind` | Object duoc truyen vao |

### Code vi du

```javascript
// ===== 1. Global context =====
console.log(this); // window (browser) hoac {} (Node module)

// ===== 2. Method call =====
const user = {
  name: "An",
  greet() {
    console.log(`Xin chao, toi la ${this.name}`);
  },
};

user.greet(); // "Xin chao, toi la An" -- this = user

const greetFn = user.greet;
greetFn(); // "Xin chao, toi la undefined" -- this = window (mat context!)

// ===== 3. Constructor =====
function Person(name) {
  this.name = name; // this = object moi duoc tao boi new
}

const p = new Person("Binh");
console.log(p.name); // "Binh"

// ===== 4. Arrow function -- lexical this =====
const team = {
  name: "Dev Team",
  members: ["An", "Binh", "Cuong"],

  // WRONG: regular function mat this
  printMembersWrong() {
    this.members.forEach(function (member) {
      // this o day la undefined (strict) hoac window
      console.log(`${member} thuoc ${this.name}`); // this.name = undefined
    });
  },

  // CORRECT: arrow function ke thua this tu printMembers
  printMembers() {
    this.members.forEach((member) => {
      // Arrow function khong co this rieng, dung this cua printMembers
      console.log(`${member} thuoc ${this.name}`); // "Dev Team"
    });
  },
};

team.printMembers();

// ===== 5. Event handler =====
// button.addEventListener('click', function() {
//   console.log(this); // button element
// });

// button.addEventListener('click', () => {
//   console.log(this); // window -- arrow function ke thua scope cha!
// });
```

### Dap an mau

> "`this` trong JavaScript duoc xac dinh boi cach ham duoc goi, khong phai noi ham duoc dinh nghia. Co 5 quy tac chinh: global context, method call (this = object truoc dau cham), constructor (this = object moi), arrow function (ke thua this tu lexical scope), va explicit binding qua call/apply/bind. Dac biet, arrow function khong co `this` rieng -- day la diem khac biet co ban voi regular function va la ly do chinh de chon arrow function trong callback."

---

## Cau 2: `call`, `apply`, `bind` `[Intermediate]`

### Cau hoi

> Phan biet `call`, `apply` va `bind`. Khi nao dung cai nao?

### Giai thich ly thuyet

Ca ba deu dung de **gan `this` cho ham**, nhung cach hoat dong khac nhau:

| Phuong thuc | Cu phap | Goi ngay? | Tra ve |
|---|---|---|---|
| `call` | `fn.call(thisArg, a, b, c)` | Co | Ket qua cua ham |
| `apply` | `fn.apply(thisArg, [a, b, c])` | Co | Ket qua cua ham |
| `bind` | `fn.bind(thisArg, a, b)` | Khong | Ham moi voi this da bind |

Meo nho: **C**all = **C**omma (tham so cach nhau bang dau phay), **A**pply = **A**rray (tham so la array).

### Code vi du

```javascript
function introduce(greeting, punctuation) {
  return `${greeting}, toi la ${this.name}${punctuation}`;
}

const person = { name: "An" };

// call -- truyen tham so rieng le
console.log(introduce.call(person, "Xin chao", "!"));
// "Xin chao, toi la An!"

// apply -- truyen tham so la array
console.log(introduce.apply(person, ["Hey", "~"]));
// "Hey, toi la An~"

// bind -- tra ve ham moi, chua goi
const boundIntroduce = introduce.bind(person, "Chao");
console.log(boundIntroduce(".")); // "Chao, toi la An."
// Co the goi nhieu lan
console.log(boundIntroduce("!!")); // "Chao, toi la An!!"

// ===== Use case thuc te: method borrowing =====
const numbers = {
  values: [1, 5, 3, 8, 2],
  findMax() {
    // "muon" Math.max voi apply
    return Math.max.apply(null, this.values);
    // Tuong duong: Math.max(...this.values)
  },
};

console.log(numbers.findMax()); // 8

// ===== Use case: fix mat this =====
class Logger {
  constructor(prefix) {
    this.prefix = prefix;
    // Bind de khong mat this khi truyen nhu callback
    this.log = this.log.bind(this);
  }

  log(message) {
    console.log(`[${this.prefix}] ${message}`);
  }
}

const logger = new Logger("APP");
const logFn = logger.log;
logFn("Khoi dong"); // "[APP] Khoi dong" -- this da duoc bind

// Khong bind thi:
// const logFn2 = logger.log; // mat this -> loi

// ===== Partial application voi bind =====
function multiply(a, b) {
  return a * b;
}

const double = multiply.bind(null, 2); // a = 2, doi b
const triple = multiply.bind(null, 3); // a = 3, doi b

console.log(double(5));  // 10
console.log(triple(5));  // 15
```

### Dap an mau

> "`call` va `apply` deu goi ham ngay voi `this` duoc chi dinh -- khac biet la `call` nhan tham so rieng le con `apply` nhan array. `bind` tra ve mot ham moi voi `this` da duoc bind vinh vien, huu ich khi truyen method lam callback. Use case pho bien nhat la fix mat this trong class methods, method borrowing, va partial application."

---

## Cau 3: Prototype Chain `[Senior]`

### Cau hoi

> Giai thich prototype chain trong JavaScript. Khi truy cap mot property, JavaScript tim kiem no nhu the nao?

### Giai thich ly thuyet

Moi object trong JavaScript co mot **internal slot** goi la `[[Prototype]]` (truy cap qua `__proto__` hoac `Object.getPrototypeOf()`). Khi truy cap property tren mot object:

1. Tim trong chinh object do.
2. Neu khong thay, tim trong `[[Prototype]]` cua no.
3. Tiep tuc di len chuoi prototype.
4. Dung lai khi gap `null` (dinh cua chuoi -- `Object.prototype.__proto__`).
5. Tra ve `undefined` neu khong tim thay.

### Code vi du

```javascript
// ===== Minh hoa prototype chain =====
const animal = {
  type: "Animal",
  eat() {
    return `${this.name} dang an`;
  },
};

const dog = Object.create(animal); // dog.__proto__ = animal
dog.name = "Rex";
dog.bark = function () {
  return `${this.name}: Gau gau!`;
};

const puppy = Object.create(dog); // puppy.__proto__ = dog
puppy.name = "Lucky";

// Prototype chain: puppy -> dog -> animal -> Object.prototype -> null

console.log(puppy.name);  // "Lucky"        -- tim thay o puppy
console.log(puppy.bark()); // "Lucky: Gau gau!" -- tim thay o dog
console.log(puppy.eat());  // "Lucky dang an" -- tim thay o animal
console.log(puppy.type);  // "Animal"       -- tim thay o animal

// ===== Kiem tra prototype =====
console.log(Object.getPrototypeOf(puppy) === dog);    // true
console.log(Object.getPrototypeOf(dog) === animal);    // true

console.log(puppy.hasOwnProperty("name"));  // true
console.log(puppy.hasOwnProperty("bark"));  // false -- bark o dog
console.log(puppy.hasOwnProperty("eat"));   // false -- eat o animal

// ===== Property shadowing =====
dog.type = "Dog"; // Tao property "type" tren dog, KHONG sua animal.type
console.log(dog.type);    // "Dog"    -- dog's own property
console.log(animal.type); // "Animal" -- khong bi thay doi
console.log(puppy.type);  // "Dog"    -- tim thay o dog (gan hon animal)

// ===== Constructor function va prototype =====
function Vehicle(brand) {
  this.brand = brand;
}

Vehicle.prototype.start = function () {
  return `${this.brand} khoi dong`;
};

const car = new Vehicle("Toyota");
// car.__proto__ === Vehicle.prototype

console.log(car.start()); // "Toyota khoi dong"
console.log(car instanceof Vehicle); // true
```

### Dap an mau

> "Moi object co mot [[Prototype]] link tro den object khac, tao thanh prototype chain. Khi truy cap property, JS tim tu object hien tai di len chuoi cho den Object.prototype (dinh chuoi). Neu khong thay tra ve undefined. Property shadowing xay ra khi object con co property trung ten voi prototype -- no 'che' property cua prototype. Day la co che ke thua cot loi cua JavaScript, ES6 class chi la syntactic sugar tren prototype."

---

## Cau 4: ES6 Class vs Prototype-based inheritance `[Senior]`

### Cau hoi

> ES6 class co phai la OOP thuc su khong? So sanh voi prototype-based inheritance.

### Giai thich ly thuyet

ES6 `class` la **syntactic sugar** tren prototype-based inheritance. No **khong** tao ra mot co che ke thua moi -- van dung prototype chain phia sau.

| Tieu chi | Prototype Pattern | ES6 Class |
|---|---|---|
| Cu phap | Verbose, kho doc | Sach, quen thuoc voi dev OOP |
| Hoisting | Function declaration duoc hoist | Class **khong** duoc hoist (TDZ) |
| Strict mode | Tuy chon | **Luon strict mode** |
| `new` | Co the quen `new` | Bat buoc `new`, bao loi neu khong |
| Method enumerable | `for...in` co the thay | Methods **khong** enumerable |
| Co che ben trong | Prototype chain | Prototype chain (y het) |

### Code vi du

```javascript
// ===== Prototype-based =====
function Animal(name) {
  this.name = name;
}

Animal.prototype.speak = function () {
  return `${this.name} keu`;
};

function Dog(name, breed) {
  Animal.call(this, name); // Goi constructor cha
  this.breed = breed;
}

// Thiet lap ke thua
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function () {
  return `${this.name} (${this.breed}): Gau gau!`;
};

const rex = new Dog("Rex", "Husky");
console.log(rex.speak()); // "Rex keu"
console.log(rex.bark());  // "Rex (Husky): Gau gau!"

// ===== ES6 Class -- tuong duong 100% =====
class AnimalClass {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return `${this.name} keu`;
  }
}

class DogClass extends AnimalClass {
  constructor(name, breed) {
    super(name); // Tuong duong Animal.call(this, name)
    this.breed = breed;
  }

  bark() {
    return `${this.name} (${this.breed}): Gau gau!`;
  }
}

const lucky = new DogClass("Lucky", "Corgi");
console.log(lucky.speak()); // "Lucky keu"
console.log(lucky.bark());  // "Lucky (Corgi): Gau gau!"

// ===== Chung minh class la syntactic sugar =====
console.log(typeof AnimalClass);  // "function" -- class thuc chat la function!
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
    if (amount <= 0) throw new Error("So tien khong hop le");
  }

  deposit(amount) {
    this.#validate(amount);
    this.#balance += amount;
    return this;
  }

  // Static method
  static getBankInfo() {
    return `Ngan hang: ${BankAccount.bankName}`;
  }
}

const acc = new BankAccount("An", 1000);
acc.deposit(500);
console.log(acc.balance);  // 1500
// console.log(acc.#balance); // SyntaxError: Private field
console.log(BankAccount.getBankInfo()); // "Ngan hang: VN Bank"
```

### Dap an mau

> "ES6 class la syntactic sugar tren prototype -- typeof class tra ve 'function' va ke thua van dung prototype chain. Tuy nhien class co nhieu loi the: cu phap sach hon, tu dong strict mode, bat buoc dung `new`, va ho tro private fields (#). Toi khuyen dung class cho code moi vi no dang ro rang va quen thuoc hon, nhung can hieu prototype phia sau de debug hieu qua."

---

## Cau 5: `Object.create()` vs `new` `[Senior]`

### Cau hoi

> `Object.create()` va `new` khac nhau nhu the nao? Khi nao nen dung cai nao?

### Giai thich ly thuyet

| Tieu chi | `new Constructor()` | `Object.create(proto)` |
|---|---|---|
| Tao object moi | Co | Co |
| Goi constructor | Co | **Khong** |
| Set prototype | `Constructor.prototype` | Object duoc truyen vao |
| Linh hoat | Thap (phai co constructor) | Cao (bat ky object nao lam prototype) |
| Use case | Tao instance tu class/constructor | Prototype delegation, mixin |

### Code vi du

```javascript
// ===== new =====
function Car(brand) {
  // new tao: this = {} voi __proto__ = Car.prototype
  this.brand = brand;
  // tu dong return this
}
Car.prototype.drive = function () {
  return `Lai xe ${this.brand}`;
};

const toyota = new Car("Toyota");
console.log(toyota.drive()); // "Lai xe Toyota"

// ===== Object.create =====
const carPrototype = {
  drive() {
    return `Lai xe ${this.brand}`;
  },
  honk() {
    return "Bip bip!";
  },
};

const honda = Object.create(carPrototype);
honda.brand = "Honda";
console.log(honda.drive()); // "Lai xe Honda"
console.log(honda.honk());  // "Bip bip!"

// ===== Object.create(null) -- "pure dictionary" =====
const dict = Object.create(null);
// dict khong co prototype -> khong co toString, hasOwnProperty, etc.
dict.key = "value";
console.log(dict.key); // "value"
// console.log(dict.toString()); // TypeError -- khong co method nao

// Huu ich khi can object "sach" lam map, khong lo trung ten voi prototype methods
dict["hasOwnProperty"] = "oops"; // An toan! Khong ghi de gi ca

// ===== So sanh tao ke thua =====
// Voi new:
function Parent(x) {
  this.x = x;
}
function Child(x, y) {
  Parent.call(this, x);
  this.y = y;
}
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;

// Voi Object.create (khong can constructor):
const parent = {
  greet() {
    return `Hello from ${this.name}`;
  },
};

const child = Object.create(parent);
child.name = "Child";
console.log(child.greet()); // "Hello from Child"
```

### Dap an mau

> "`new` goi constructor function de tao object moi voi prototype la Constructor.prototype. `Object.create` tao object moi voi prototype la bat ky object nao duoc truyen vao, **khong goi constructor**. `Object.create` linh hoat hon -- co the tao object khong co prototype (`Object.create(null)`) hoac dung prototype delegation ma khong can class. Trong thuc te, `new` va class pho bien hon cho OOP pattern, con `Object.create` hay dung khi can prototype delegation linh hoat hoac tao 'pure dictionary'."

---

## Cau 6: Bai tap thuc hanh tong hop `[Senior]`

### Cau hoi

> Doan code sau output gi? Giai thich.

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

### Giai thich va dap an

```javascript
console.log(obj.getName());
// "Object" -- method call, this = obj

console.log(obj.getNameArrow());
// undefined -- arrow function ke thua this tu scope noi no duoc DINH NGHIA
// getNameArrow duoc dinh nghia trong object literal, scope cha la global/module
// -> this = window (undefined trong strict mode/module)

console.log(obj.getNameNested());
// "Object" -- getNameNested la regular function, this = obj
// inner la arrow function, ke thua this tu getNameNested -> this = obj

const { getName, getNameArrow, getNameNested } = obj;

console.log(getName());
// undefined -- mat context, this = window/undefined

console.log(getNameNested());
// undefined -- mat context, this = window/undefined
// inner ke thua this tu getNameNested, nhung getNameNested mat context
```

### Dap an mau

> "Ket qua la: `'Object'`, `undefined`, `'Object'`, `undefined`, `undefined`. Diem mau chot la: regular function xac dinh `this` luc goi (ai goi no), arrow function ke thua `this` tu noi no duoc dinh nghia. Khi destructure method ra khoi object, no mat context (this khong con la obj nua). Day la ly do trong React, chung ta thuong dung arrow function hoac bind trong class components."

---

## Loi thuong gap khi tra loi

| Loi | Giai thich dung |
|---|---|
| "Arrow function co this rieng" | Arrow function **khong co** this rieng, no ke thua tu lexical scope cha. |
| "Class la co che ke thua moi" | Class la syntactic sugar, van dung prototype chain. `typeof MyClass` tra ve `"function"`. |
| "`this` luon la object goi ham" | Khong dung voi arrow function, global context, va explicit binding. |
| "Prototype va `__proto__` la mot" | `prototype` la property cua function (constructor). `__proto__` la link tren moi object tro den prototype cua constructor. |
| "`Object.create` giong `new`" | `Object.create` **khong** goi constructor. `new` goi constructor, set `this`, va return object moi. |
| "`bind` thay doi this vinh vien" | `bind` tra ve ham **moi** voi this da bind. Ham goc khong bi anh huong. Nhung mot ham da bind khong the bind lai. |
