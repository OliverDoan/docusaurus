---
sidebar_position: 5
title: "5. Prototypal Inheritance"
---

# Prototypal Inheritance — Kế thừa qua Prototype

---

## Mục lục

- [Kế thừa trong JS](#kế-thừa-trong-js)
- [Cách 1: `Object.create`](#cách-1-objectcreate)
- [Cách 2: Constructor Function (ES5)](#cách-2-constructor-function-es5)
- [Cách 3: `class` (ES6)](#cách-3-class-es6)
- [Prototype Chain trong kế thừa](#prototype-chain-trong-kế-thừa)
- [Override method](#override-method)
- [`super` keyword](#super-keyword)
- [Pitfall thường gặp](#pitfall-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Kế thừa trong JS

JavaScript dùng **prototypal inheritance** — khác với **classical inheritance** trong Java/C++:

| | Classical (Java/C++) | Prototypal (JS) |
|---|---------------------|-----------------|
| Đơn vị | Class | Object |
| Kế thừa | Class extends class | Object kế thừa object |
| Tạo instance | `new ClassName()` | `Object.create(obj)` |
| Memory | Mỗi instance copy method | Method share qua prototype |

JS từ ES6 thêm cú pháp `class` — **chỉ là đường mới (syntactic sugar)** trên prototypal inheritance, **không phải class thật**.

## Cách 1: `Object.create`

Cách thuần và đơn giản nhất:

```js
const animal = {
  walk() { console.log(`${this.name} đi bộ`); },
  eat() { console.log(`${this.name} ăn`); }
};

const dog = Object.create(animal);
dog.name = "Rex";
dog.bark = function() { console.log("Gâu gâu!"); };

dog.walk();   // "Rex đi bộ" (kế thừa)
dog.eat();    // "Rex ăn"
dog.bark();   // "Gâu gâu!"

// Chain: dog → animal → Object.prototype → null
```

### Factory function

```js
function createDog(name, breed) {
  const dog = Object.create(animal);
  dog.name = name;
  dog.breed = breed;
  dog.bark = function() { console.log("Gâu!"); };
  return dog;
}

const rex = createDog("Rex", "Husky");
rex.walk();   // "Rex đi bộ"
```

## Cách 2: Constructor Function (ES5)

Trước ES6, dùng function làm constructor:

```js
function Animal(name) {
  this.name = name;
}

Animal.prototype.walk = function() {
  console.log(`${this.name} đi bộ`);
};

function Dog(name, breed) {
  Animal.call(this, name);   // gọi parent constructor
  this.breed = breed;
}

// Kế thừa prototype
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;   // sửa lại constructor

// Thêm method riêng
Dog.prototype.bark = function() {
  console.log(`${this.name} sủa: Gâu!`);
};

const rex = new Dog("Rex", "Husky");
rex.walk();   // "Rex đi bộ"
rex.bark();   // "Rex sủa: Gâu!"
rex instanceof Dog;     // true
rex instanceof Animal;  // true
```

### Vấn đề của constructor function

- Code dài, dễ lỗi (quên `Object.create`, quên gán `constructor`)
- Không có cú pháp `super` rõ ràng
- Khó đọc khi kế thừa nhiều cấp

## Cách 3: `class` (ES6)

Cú pháp hiện đại — ngắn gọn, rõ ràng:

```js
class Animal {
  constructor(name) {
    this.name = name;
  }
  
  walk() {
    console.log(`${this.name} đi bộ`);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);   // gọi Animal constructor
    this.breed = breed;
  }
  
  bark() {
    console.log(`${this.name} sủa: Gâu!`);
  }
}

const rex = new Dog("Rex", "Husky");
rex.walk();   // "Rex đi bộ"
rex.bark();   // "Rex sủa: Gâu!"
```

### `class` chỉ là sugar — vẫn là prototype

```js
class Foo {
  bar() {}
}

typeof Foo;                          // "function"
Foo.prototype.bar;                   // function
new Foo() instanceof Foo;            // true
Object.getPrototypeOf(new Foo());    // Foo.prototype
```

## Prototype Chain trong kế thừa

```js
class Animal {
  walk() {}
}

class Dog extends Animal {
  bark() {}
}

class Puppy extends Dog {
  whine() {}
}

const p = new Puppy();

// Chain:
// p → Puppy.prototype → Dog.prototype → Animal.prototype → Object.prototype → null

Object.getPrototypeOf(p) === Puppy.prototype;            // true
Object.getPrototypeOf(Puppy.prototype) === Dog.prototype;       // true
Object.getPrototypeOf(Dog.prototype) === Animal.prototype;      // true
Object.getPrototypeOf(Animal.prototype) === Object.prototype;   // true

// Lookup
p.whine;   // Puppy.prototype
p.bark;    // Dog.prototype (lookup qua chain)
p.walk;    // Animal.prototype
p.toString;  // Object.prototype

p instanceof Puppy;    // true
p instanceof Dog;      // true
p instanceof Animal;   // true
p instanceof Object;   // true
```

## Override method

Override = ghi đè method của parent:

```js
class Animal {
  speak() {
    return "Some sound";
  }
}

class Dog extends Animal {
  speak() {
    return "Gâu gâu!";   // override
  }
}

class Cat extends Animal {
  speak() {
    return "Meo meo!";   // override
  }
}

new Animal().speak();   // "Some sound"
new Dog().speak();      // "Gâu gâu!"
new Cat().speak();      // "Meo meo!"
```

## `super` keyword

### `super(...)` — gọi parent constructor

```js
class Dog extends Animal {
  constructor(name, breed) {
    super(name);   // BẮT BUỘC trước khi dùng this
    this.breed = breed;
  }
}
```

### `super.method()` — gọi method của parent

```js
class Dog extends Animal {
  speak() {
    return super.speak() + " - Gâu gâu!";   // gọi Animal.speak
  }
}

new Dog("Rex").speak();
// "Some sound - Gâu gâu!"
```

### Trong static

```js
class Animal {
  static create(name) {
    return new this(name);   // this là class hiện tại
  }
}

class Dog extends Animal {
  static create(name, breed) {
    const d = super.create(name);   // gọi Animal.create
    d.breed = breed;
    return d;
  }
}

Dog.create("Rex", "Husky");
```

## Pitfall thường gặp

### 1. Quên `super()` trong constructor

```js
class Dog extends Animal {
  constructor() {
    // ❌ ReferenceError nếu dùng this trước super
    this.name = "Rex";
    super();
  }
}
```

### 2. Shared state qua prototype (ref types)

```js
function Animal() {}
Animal.prototype.tags = [];   // ⚠️ shared!

const a = new Animal();
const b = new Animal();
a.tags.push("cute");

console.log(b.tags);   // ["cute"] ⚠️ b cũng bị ảnh hưởng!
```

Fix: khởi tạo trong constructor:

```js
function Animal() {
  this.tags = [];   // mỗi instance riêng
}
```

### 3. `this` mất khi destructure method

```js
class Counter {
  constructor() { this.count = 0; }
  increment() { this.count++; }
}

const c = new Counter();
const { increment } = c;
increment();   // ❌ TypeError (this là undefined)

// Fix:
const bound = c.increment.bind(c);
// hoặc dùng arrow trong field:
class Counter {
  count = 0;
  increment = () => { this.count++; };
}
```

### 4. Method trong constructor vs prototype

```js
// ❌ Method trong constructor — mỗi instance copy
class Bad {
  constructor() {
    this.greet = function() {};   // tốn memory
  }
}

// ✅ Method trên prototype — share
class Good {
  greet() {}   // chỉ 1 copy duy nhất
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: Prototypal vs Classical inheritance?

**Đáp án:**

- **Classical** (Java/C++): kế thừa giữa **class** — class A extends class B. Khi tạo instance, class được "instantiate" thành object.
- **Prototypal** (JS): kế thừa giữa **object** — object A có `[[Prototype]]` trỏ đến object B. Lookup qua chain.

JS dùng prototypal:
- Linh hoạt hơn — có thể đổi prototype runtime
- Method **share qua prototype** (tiết kiệm memory)
- `class` ES6 chỉ là **sugar** cho prototypal

### Câu 2: Đoán kết quả

```js
class Animal {
  speak() { return "Animal sound"; }
}

class Dog extends Animal {
  speak() { return "Gâu " + super.speak(); }
}

class Puppy extends Dog {
  speak() { return "Tí " + super.speak(); }
}

console.log(new Puppy().speak());
```

**Đáp án:**

```
"Tí Gâu Animal sound"
```

Mỗi `super.speak()` gọi đến parent class theo prototype chain.

### Câu 3: Vì sao method nên ở prototype, không trong constructor?

**Đáp án:**

Khi method nằm trong **constructor**:
- Mỗi instance **tạo bản sao** function → tốn memory
- Không share — không thể override một method cho tất cả instance

Khi method nằm trên **prototype**:
- **Một bản duy nhất** — mọi instance share
- Tiết kiệm memory, tăng performance
- Có thể "monkey-patch" dễ dàng

```js
// Tốn memory nếu có hàng triệu instance
class Bad {
  constructor() {
    this.greet = () => "hi";   // mỗi instance 1 function
  }
}

// Tốt
class Good {
  greet() { return "hi"; }   // 1 function trên Good.prototype
}
```

### Câu 4: Cách kiểm tra một object có kế thừa từ class cụ thể?

**Đáp án:**

```js
// 1. instanceof — check qua prototype chain
obj instanceof Dog;

// 2. Object.getPrototypeOf
Object.getPrototypeOf(obj) === Dog.prototype;

// 3. isPrototypeOf
Dog.prototype.isPrototypeOf(obj);

// 4. constructor (không khuyến nghị — có thể bị đổi)
obj.constructor === Dog;
```

`instanceof` là phổ biến nhất — kiểm tra **toàn bộ chain**:

```js
const p = new Puppy();
p instanceof Puppy;    // true
p instanceof Dog;      // true (qua chain)
p instanceof Animal;   // true (qua chain)
p instanceof Object;   // true
```
