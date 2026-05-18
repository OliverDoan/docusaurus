---
sidebar_position: 4
title: "4. Object Prototype"
---

# Object Prototype

---

## Mục lục

- [Prototype là gì?](#prototype-là-gì)
- [`[[Prototype]]` vs `prototype`](#prototype-vs-prototype)
- [Truy cập prototype](#truy-cập-prototype)
- [Prototype chain](#prototype-chain)
- [Tạo object với prototype tuỳ ý](#tạo-object-với-prototype-tuỳ-ý)
- [Built-in prototype](#built-in-prototype)
- [Modify prototype — đừng làm vậy](#modify-prototype--đừng-làm-vậy)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Prototype là gì?

Mọi object trong JavaScript đều có **một property nội bộ** gọi là `[[Prototype]]` — trỏ đến **object cha** mà nó kế thừa.

Khi truy cập một property, JS sẽ:
1. Tìm trên **object hiện tại**
2. Không thấy → tìm trên `[[Prototype]]`
3. Không thấy → tìm tiếp prototype của prototype
4. Đến khi gặp `null` → trả `undefined`

> **Ví dụ thực tế:** Hãy tưởng tượng prototype như **cha mẹ truyền lại tài sản**. Bạn tìm vật gì trước trong phòng mình, không có → tìm trong nhà cha mẹ, không có → tìm trong nhà ông bà...

```js
const animal = {
  eats: true,
  walk() { console.log("Walking..."); }
};

const rabbit = Object.create(animal);
rabbit.jumps = true;

rabbit.jumps;   // true (own)
rabbit.eats;    // true (từ animal — prototype)
rabbit.walk();  // "Walking..." (từ animal)
```

## `[[Prototype]]` vs `prototype`

Đây là điểm dễ gây nhầm:

| | `[[Prototype]]` | `prototype` |
|---|----------------|-------------|
| Của ai? | **Mọi object** | Chỉ **function** |
| Bản chất | Property nội bộ (hidden) | Property thường |
| Truy cập | `Object.getPrototypeOf(obj)` hoặc `obj.__proto__` | `Func.prototype` |
| Ý nghĩa | Object cha | Object dùng khi `new Func()` |

### Ví dụ phân biệt

```js
function Dog(name) {
  this.name = name;
}

Dog.prototype.bark = function() {
  console.log(`${this.name} sủa!`);
};

const rex = new Dog("Rex");

// rex là object instance
Object.getPrototypeOf(rex) === Dog.prototype;   // true
rex.__proto__ === Dog.prototype;                 // true

// Function Dog có cả hai:
Dog.prototype;                              // { bark: function, constructor: Dog }
Object.getPrototypeOf(Dog) === Function.prototype;   // true
```

## Truy cập prototype

### `Object.getPrototypeOf()` (khuyến nghị)

```js
const proto = Object.getPrototypeOf(obj);
```

### `__proto__` (cũ — vẫn dùng được)

```js
obj.__proto__;
obj.__proto__ = newProto;   // setter (deprecated)
```

> `__proto__` được giữ lại vì legacy, nhưng **không khuyến nghị** dùng — nên dùng `Object.getPrototypeOf` và `Object.setPrototypeOf`.

### `Object.setPrototypeOf()` (chậm — tránh dùng)

```js
const rabbit = { jumps: true };
const animal = { eats: true };

Object.setPrototypeOf(rabbit, animal);

rabbit.eats;   // true
```

> ⚠️ Thay đổi prototype của object đã tồn tại làm **chậm** engine vì phải optimize lại — chỉ nên làm khi tạo object.

## Prototype chain

Object kế thừa qua **chuỗi**: `obj → proto → proto.proto → ... → null`

```js
const grandparent = { lastName: "Nguyễn" };
const parent = Object.create(grandparent);
parent.house = "Hà Nội";

const child = Object.create(parent);
child.name = "Alice";

child.name;        // "Alice" (own)
child.house;       // "Hà Nội" (từ parent)
child.lastName;    // "Nguyễn" (từ grandparent)
child.unknown;     // undefined

// Cấu trúc chain:
// child → parent → grandparent → Object.prototype → null

Object.getPrototypeOf(child) === parent;          // true
Object.getPrototypeOf(parent) === grandparent;    // true
Object.getPrototypeOf(grandparent) === Object.prototype;  // true
Object.getPrototypeOf(Object.prototype);          // null (cuối chain)
```

### Duyệt prototype chain

```js
let current = child;
while (current) {
  console.log(current);
  current = Object.getPrototypeOf(current);
}
```

## Tạo object với prototype tuỳ ý

### `Object.create(proto)` — cách "thuần"

```js
const animal = {
  eats: true,
  walk() { console.log("Walking"); }
};

// Tạo rabbit có prototype là animal
const rabbit = Object.create(animal);
rabbit.jumps = true;

rabbit.eats;    // true
rabbit.walk();  // "Walking"

// Tạo object KHÔNG có prototype (pure dictionary)
const dict = Object.create(null);
dict.key = "value";
dict.toString;   // undefined (không kế thừa Object.prototype)
```

### Với property descriptors

```js
const rabbit = Object.create(animal, {
  jumps: { value: true, enumerable: true, writable: true },
  hidden: { value: "secret", enumerable: false }
});
```

### Với `class` (đường dùng phổ biến hơn)

```js
class Animal {
  walk() { console.log("Walking"); }
}

class Rabbit extends Animal {
  jump() { console.log("Jumping"); }
}

const r = new Rabbit();
r.walk();   // "Walking" (từ Animal.prototype)
r.jump();   // "Jumping" (từ Rabbit.prototype)

Object.getPrototypeOf(r) === Rabbit.prototype;          // true
Object.getPrototypeOf(Rabbit.prototype) === Animal.prototype;   // true
```

## Built-in prototype

Tất cả object built-in đều có chain prototype:

```js
// Array
const arr = [1, 2, 3];
// arr → Array.prototype → Object.prototype → null

arr.map;   // method từ Array.prototype
arr.hasOwnProperty;   // method từ Object.prototype

// String
"hello".__proto__ === String.prototype;   // true

// Function
function foo() {}
foo.__proto__ === Function.prototype;     // true
```

### `Object.prototype` — gốc của mọi object

```js
Object.prototype.hasOwnProperty;    // function
Object.prototype.toString;          // function
Object.prototype.valueOf;           // function
Object.getPrototypeOf(Object.prototype);   // null (gốc)
```

Mọi object đều có các method này — trừ object tạo bằng `Object.create(null)`.

## Modify prototype — đừng làm vậy

### Anti-pattern: extend native prototype

```js
// ❌ KHÔNG NÊN
Array.prototype.last = function() {
  return this[this.length - 1];
};

[1, 2, 3].last();   // 3 ⚠️ hoạt động nhưng gây vấn đề
```

### Vì sao tránh?

1. **Xung đột tên** với phương thức tương lai của ES (vd: `Array.prototype.includes` đã được thêm năm 2016)
2. **Khó debug** — ai cũng có thể thêm
3. **Bí mật** — người đọc code không biết phương thức đến từ đâu
4. **Hỏng `for...in`** trên mảng:
   ```js
   Array.prototype.foo = "bar";
   for (let i in [1, 2, 3]) console.log(i);  // 0, 1, 2, "foo"
   ```

### Cách thay thế

```js
// ✅ Hàm helper
function lastItem(arr) {
  return arr[arr.length - 1];
}
lastItem([1, 2, 3]);

// ✅ ES2022 — Array.at
[1, 2, 3].at(-1);   // 3 (built-in)
```

### Trừ trường hợp polyfill chính thức

```js
// Polyfill: thêm method nếu engine cũ chưa có
if (!Array.prototype.includes) {
  Array.prototype.includes = function(search) {
    return this.indexOf(search) !== -1;
  };
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: `[[Prototype]]` và `prototype` khác nhau như thế nào?

**Đáp án:**

- **`[[Prototype]]`** — property nội bộ của **mọi object**, trỏ đến object cha (để lookup chain).
- **`prototype`** — property thường, chỉ có ở **function**. Nó là **object sẽ trở thành `[[Prototype]]`** khi dùng `new Func()`.

```js
function Foo() {}
const f = new Foo();

// f là object — có [[Prototype]]
Object.getPrototypeOf(f) === Foo.prototype;   // true

// Foo là function — có cả prototype và [[Prototype]]
Foo.prototype;                                 // object dùng khi new
Object.getPrototypeOf(Foo) === Function.prototype;   // true
```

### Câu 2: `Object.create(null)` khác `{}` như thế nào?

**Đáp án:**

- `{}` — tạo object với `[[Prototype]]` là `Object.prototype` → có method như `toString`, `hasOwnProperty`.
- `Object.create(null)` — tạo object **không có prototype** → không có bất kỳ method built-in nào.

```js
const obj1 = {};
obj1.toString;          // function

const obj2 = Object.create(null);
obj2.toString;          // undefined
obj2.hasOwnProperty;    // undefined

// obj2 là "pure dictionary" — an toàn cho dùng làm map (không bị conflict với prototype keys)
obj2["__proto__"] = "safe";   // chỉ là property thường, không phải accessor
```

Use case: **map an toàn** khi user input có thể chứa keys như `__proto__`, `constructor`.

### Câu 3: Đoán kết quả

```js
const a = { x: 1 };
const b = Object.create(a);
b.y = 2;
const c = Object.create(b);
c.z = 3;

console.log(c.x, c.y, c.z);
console.log(Object.keys(c));
console.log("x" in c);
```

**Đáp án:**

```
1 2 3
["z"]
true
```

- `c.x` từ `a` qua prototype chain → 1
- `Object.keys(c)` chỉ trả về **own enumerable** → chỉ `["z"]`
- `"x" in c` — operator `in` kiểm tra **cả prototype chain** → `true`

### Câu 4: Vì sao không nên extend `Array.prototype`?

**Đáp án:**

3 lý do chính:

1. **Xung đột tương lai**: nếu ES thêm method cùng tên, code của bạn sẽ ghi đè built-in.
2. **Hỏng iteration**: `for...in` trên mảng sẽ duyệt cả property thêm vào prototype.
3. **Pollution toàn cục**: mọi mảng trong ứng dụng bị ảnh hưởng — khó debug.

**Cách đúng:**
- Dùng **utility function** (`function last(arr) { return arr[arr.length-1] }`).
- Dùng **class kế thừa Array** nếu cần custom.
- Dùng polyfill **có check** cho phương thức chính thức ES đã ra.
