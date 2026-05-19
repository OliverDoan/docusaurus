---
sidebar_position: 3
title: "3. Prototype và Prototypal Inheritance"
---

# Prototype và Prototypal Inheritance

---

## Mục lục

- [Prototype là gì?](#prototype-là-gì)
- [Prototype chain](#prototype-chain)
- [Tạo object với prototype tùy chỉnh](#tạo-object-với-prototype-tùy-chỉnh)
- [Class chỉ là sugar của prototype](#class-chỉ-là-sugar-của-prototype)
- [Quan hệ với constructor function](#quan-hệ-với-constructor-function)

---

## Prototype là gì?

JavaScript dùng **prototype-based inheritance** — không có class thật
như Java/C++. Mỗi object có một property ẩn `[[Prototype]]` trỏ tới
**object cha**.

Truy cập qua `Object.getPrototypeOf`:

```js
const user = { name: "An" };
Object.getPrototypeOf(user) === Object.prototype; // true
```

Hoặc qua `__proto__` (cũ, vẫn được hỗ trợ):

```js
user.__proto__ === Object.prototype; // true
```

---

## Prototype chain

Khi truy cập property của object, JS tìm theo **chuỗi prototype**:

```js
const user = { name: "An" };

user.toString();
// 1. Tìm trong user → không có
// 2. Tìm trong Object.prototype → có
// 3. Gọi method đó
```

Chain kết thúc ở `null`:

```
user → Object.prototype → null
arr  → Array.prototype  → Object.prototype → null
fn   → Function.prototype → Object.prototype → null
```

---

## Tạo object với prototype tùy chỉnh

```js
const animal = {
  eat() { console.log(`${this.name} đang ăn`); },
};

const dog = Object.create(animal); // dog kế thừa từ animal
dog.name = "Lulu";
dog.eat(); // "Lulu đang ăn"
```

`Object.create(null)` tạo object **không có prototype** — không có
`toString`, `hasOwnProperty`...:

```js
const plain = Object.create(null);
plain.x = 1;
plain.toString; // undefined
```

:::tip[Mẹo]

`Object.create(null)` rất hữu ích cho **dictionary thuần** — tránh xung
đột với property kế thừa:

```js
// Dictionary nguy hiểm
const dict = {};
dict["toString"] = "value"; // ghi đè method!
if (dict["toString"]) { /* always true vì toString tồn tại */ }

// Dictionary an toàn
const dict = Object.create(null);
dict["toString"] = "value"; // không xung đột
if (dict["toString"]) { /* chỉ true khi có key */ }
```

Map (ES6) là lựa chọn hiện đại hơn — type-safe key, iterable, có `size`.

:::

---

## Class chỉ là sugar của prototype

`class` (ES6) là **cú pháp đẹp** cho prototype, không phải tính năng mới:

```js
// ES6 class
class User {
  constructor(name) { this.name = name; }
  greet() { return `Hi ${this.name}`; }
}

// Tương đương prototype
function User(name) {
  this.name = name;
}
User.prototype.greet = function () {
  return "Hi " + this.name;
};

new User("An").greet(); // cả hai đều "Hi An"
```

Method khai báo trong class được gắn vào `User.prototype`, không phải
mỗi instance:

```js
const u1 = new User("An");
const u2 = new User("Bình");

u1.greet === u2.greet; // true — chung một function
```

---

## Quan hệ với constructor function

Mọi function có property `prototype` (chính là object sẽ làm parent cho
instance):

```js
function User(name) {
  this.name = name;
}

const u = new User("An");

u.__proto__ === User.prototype;        // true
User.prototype.constructor === User;   // true
```

`new` thực ra làm 4 việc:

1. Tạo object mới `{}`.
2. Đặt `__proto__` của object đó = `Function.prototype`.
3. Gọi function với `this` = object mới.
4. Trả về object (hoặc giá trị explicit return).

:::info[Phân tích]

**Câu hỏi phỏng vấn kinh điển**: "Khác biệt giữa `__proto__` và `prototype`?"

| | `__proto__` | `prototype` |
|--|--|--|
| Thuộc về | **Mọi object** (instance) | **Chỉ function** (constructor) |
| Trỏ tới | Object cha trong chain | Object sẽ làm cha của instance |
| Truy cập đúng | `Object.getPrototypeOf(obj)` | `Constructor.prototype` |

Mối quan hệ:

```js
function User() {}
const u = new User();

u.__proto__ === User.prototype;       // true
User.__proto__ === Function.prototype; // true (User cũng là object)
User.prototype.__proto__ === Object.prototype; // true
```

→ Chain của `u`: `u → User.prototype → Object.prototype → null`.

Hiểu được hai khái niệm này tách bạch là dấu hiệu nắm chắc JS — phân
biệt junior và mid/senior.

:::

:::warning[Cần lưu ý]

**Không sửa `Object.prototype` (prototype pollution)** — gây bug toàn hệ
thống:

```js
// KHÔNG BAO GIỜ
Object.prototype.toString = "x";
({}).toString; // "x" — mọi object bị ảnh hưởng!
```

Đây là loại lỗi bảo mật nghiêm trọng (CVE) khi nhận input không sanitize
ghi vào `__proto__`:

```js
const config = {};
const userInput = JSON.parse(req.body); // { __proto__: { isAdmin: true } }
Object.assign(config, userInput);

({}).isAdmin; // true — mọi object trong app!
```

→ Khi merge object từ untrusted source, dùng `Object.create(null)` hoặc
filter `__proto__` thủ công. Thư viện lodash đã từng có CVE về vấn đề này.

:::
