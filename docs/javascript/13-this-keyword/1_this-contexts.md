---
sidebar_position: 1
title: "1. this trong các ngữ cảnh"
---

# this trong các ngữ cảnh

---

## Mục lục

- [this là gì?](#this-là-gì)
- [this trong method](#this-trong-method)
- [this trong function thường](#this-trong-function-thường)
- [this trong arrow function](#this-trong-arrow-function)
- [this trong event handler](#this-trong-event-handler)
- [this trong class](#this-trong-class)

---

## this là gì?

`this` là **giá trị động** trỏ đến **context gọi function**. Giá trị
`this` phụ thuộc **cách gọi**, không phải **nơi khai báo** (trừ arrow).

Quy tắc tổng quát:

| Cách gọi | `this` |
|----------|--------|
| `obj.method()` | `obj` |
| `fn()` (standalone) | `undefined` (strict) hoặc `window` (sloppy) |
| `new Fn()` | object mới tạo |
| `fn.call(x)` / `fn.apply(x)` | `x` |
| Arrow function | `this` của scope outer (lexical) |
| Event handler (function) | element gắn listener |
| Method trong class | instance |

---

## this trong method

Khi gọi `obj.method()`, `this` = `obj`:

```js
const user = {
  name: "An",
  greet() {
    console.log(this.name); // "An"
  },
};

user.greet();
```

**`this` bị mất khi tách method khỏi object:**

```js
const greet = user.greet;
greet(); // undefined (strict) — this không còn là user
```

Lý do: cách gọi là `greet()`, không phải `user.greet()`. `this` được
quyết định **tại lúc gọi**.

---

## this trong function thường

Function độc lập:

```js
function test() {
  console.log(this);
}

test();
// strict mode: undefined
// sloppy mode: window (browser) / globalThis
```

Trong callback truyền vào method:

```js
const user = {
  name: "An",
  run() {
    setTimeout(function () {
      console.log(this.name); // undefined — this không phải user
    }, 100);
  },
};

user.run();
```

---

## this trong arrow function

Arrow **không có `this` riêng** — kế thừa `this` từ scope **bên ngoài**:

```js
const user = {
  name: "An",
  run() {
    setTimeout(() => {
      console.log(this.name); // "An" — this lấy từ run()
    }, 100);
  },
};

user.run();
```

Đây là lý do arrow phù hợp cho **callback giữ context**:

```js
class Counter {
  count = 0;

  start() {
    setInterval(() => {
      this.count++; // this = instance
    }, 1000);
  }
}
```

:::warning[Cần lưu ý]

**Đừng dùng arrow làm method của object literal** khi cần `this`:

```js
const user = {
  name: "An",
  greet: () => console.log(this.name), // SAI — this là outer scope
};

user.greet(); // undefined
```

Arrow lấy `this` từ **scope chứa object literal**, không phải từ object.
Method object → dùng shorthand `greet() {}`.

:::

---

## this trong event handler

Khi truyền **function thường** làm listener, `this` = element:

```js
button.addEventListener("click", function () {
  console.log(this); // button element
  console.log(this.textContent);
});
```

Với **arrow function** — `this` lấy từ scope ngoài:

```js
class App {
  setup() {
    button.addEventListener("click", () => {
      console.log(this); // App instance, không phải button
    });
  }
}
```

Dùng `e.currentTarget` để lấy element gắn listener (an toàn nhất):

```js
button.addEventListener("click", (e) => {
  console.log(e.currentTarget); // button (luôn đúng)
  console.log(e.target);        // element thực sự được click
});
```

---

## this trong class

`this` trong method class = **instance**:

```js
class User {
  constructor(name) {
    this.name = name;
  }

  greet() {
    console.log(this.name);
  }
}

new User("An").greet(); // "An"
```

**Pitfall**: method bị tách khỏi instance:

```js
const u = new User("An");
const greet = u.greet;
greet(); // TypeError: Cannot read 'name' of undefined
```

Cách fix:

```js
// 1. Bind trong constructor
class User {
  constructor(name) {
    this.name = name;
    this.greet = this.greet.bind(this);
  }
}

// 2. Class field với arrow
class User {
  constructor(name) {
    this.name = name;
  }

  greet = () => {
    console.log(this.name); // arrow giữ this
  };
}

// 3. Gọi luôn qua instance
button.onclick = () => u.greet();
```

:::info[Phân tích]

**Tại sao JS có `this` "khó" như vậy?**

Lịch sử: JS lấy cảm hứng từ Self và Scheme, không phải Java. `this` ban
đầu được thiết kế là **late-bound** (xác định tại runtime) — cho phép
một function dùng được với nhiều object qua `call`/`apply`.

Phản ứng của ngôn ngữ khác:

- **Python**: explicit `self` — phải khai báo rõ.
- **Java/C#**: `this` luôn là instance (không thay đổi).
- **JS**: dynamic — quyền lực nhưng dễ sai.

Arrow function (ES6) là **đáp lại quyết định thiết kế này** — đa số
trường hợp dev muốn `this` ổn định (như Java), không phải dynamic.

Quy tắc thực dụng cho 2026:
- **Method**: function thường (lexical `this` = instance qua dispatch).
- **Callback**: arrow (giữ `this` outer).
- **Standalone**: arrow (rõ ý đồ không dùng `this`).
- **Event handler cần element**: function thường + `e.currentTarget`.
- **Constructor**: function thường + `new`.

:::

:::tip[Mẹo]

**Cách debug `this` nhanh** — `console.log(this)` ngay đầu function. Nếu
không như mong đợi, hỏi 3 câu:

1. Function được gọi **như thế nào**? (`obj.fn()`, `fn()`, `new Fn()`?)
2. Có `bind`/`call`/`apply` ở đâu không?
3. Có phải arrow không? Nếu có, scope outer của nó là gì?

Trả lời 3 câu này thường tìm ra ngay nguyên nhân.

:::
