---
sidebar_position: 1
title: "1. Keyword this"
---

# Keyword this


---

## Mục lục

- [this là gì?](#this-là-gì)
- [this trong Global Context](#this-trong-global-context)
- [this trong Function thường](#this-trong-function-thường)
- [this trong Method (Object)](#this-trong-method-object)
- [this trong Arrow Function](#this-trong-arrow-function)
- [this trong Class](#this-trong-class)
- [this trong Event Handler](#this-trong-event-handler)
- [this trong Strict Mode](#this-trong-strict-mode)
- [Tóm tắt quy tắc xác định this](#tóm-tắt-quy-tắc-xác-định-this)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## this là gì?

`this` là một **keyword đặc biệt** trong JavaScript, tham chiếu đến **object đang gọi hàm hiện tại**. Giá trị của `this` **không cố định** — nó thay đổi tùy thuộc vào **cách hàm được gọi**, không phải nơi hàm được viết.

> **Ví dụ thực tế:** Hãy tưởng tượng từ "tôi" trong tiếng Việt. Khi **Minh** nói "tôi thích cà phê", "tôi" là Minh. Khi **Lan** nói "tôi thích trà", "tôi" là Lan. Cùng một từ "tôi" nhưng **ai nói** thì "tôi" là **người đó**. `this` trong JavaScript hoạt động giống hệt vậy.

```javascript
const minh = {
  ten: "Minh",
  chao: function() {
    console.log("Xin chào, tôi là " + this.ten);
    // "this" ở đây là object đang gọi method
  }
};

const lan = {
  ten: "Lan",
  chao: function() {
    console.log("Xin chào, tôi là " + this.ten);
  }
};

minh.chao(); // "Xin chào, tôi là Minh" — this = minh
lan.chao();  // "Xin chào, tôi là Lan"  — this = lan
```

---

## this trong Global Context

Khi `this` được sử dụng **ngoài bất kỳ hàm nào**, nó tham chiếu đến **global object**.

```javascript
// Trong trình duyệt
console.log(this); // Window object

// this ở global = window (trình duyệt) hoặc global (Node.js)
console.log(this === window); // true (trong trình duyệt)
```

```javascript
// Trong Node.js
console.log(this); // {} (module scope, không phải global)

// Nhưng trong function thường (không strict mode):
function test() {
  console.log(this === global); // true trong Node.js
}
test();
```

---

## this trong Function thường

Trong **function thường** (không phải method), `this` phụ thuộc vào **strict mode**:

```javascript
// ❌ Non-strict mode: this = window (trình duyệt)
function showThis() {
  console.log(this); // Window object
}
showThis();

// ✅ Strict mode: this = undefined
"use strict";
function showThisStrict() {
  console.log(this); // undefined
}
showThisStrict();
```

> **Tại sao lại khác nhau?** Ở non-strict mode, JavaScript tự động "gắn" `this` vào global object khi không có object nào gọi hàm. Strict mode bỏ hành vi này để tránh lỗi vô ý.

---

## this trong Method (Object)

Khi hàm được gọi **như một method của object**, `this` tham chiếu đến **object đó**.

```javascript
const sinhVien = {
  ten: "Hùng",
  tuoi: 22,
  gioiThieu: function() {
    // this = sinhVien (vì sinhVien.gioiThieu() gọi)
    console.log(`Tôi là ${this.ten}, ${this.tuoi} tuổi`);
  }
};

sinhVien.gioiThieu(); // "Tôi là Hùng, 22 tuổi"
```

### Cẩn thận khi tách method ra khỏi object

```javascript
const sinhVien = {
  ten: "Hùng",
  gioiThieu: function() {
    console.log("Tôi là " + this.ten);
  }
};

// ✅ Gọi như method — this = sinhVien
sinhVien.gioiThieu(); // "Tôi là Hùng"

// ❌ Gán vào biến rồi gọi — this KHÔNG còn là sinhVien!
const hamGioiThieu = sinhVien.gioiThieu;
hamGioiThieu(); // "Tôi là undefined" — this = window (hoặc undefined ở strict mode)
```

> **Quy tắc vàng:** `this` được xác định **tại thời điểm gọi hàm**, không phải lúc khai báo. Ai đứng trước dấu chấm (`.`) gọi hàm, `this` là **người đó**.

---

## this trong Arrow Function

Arrow function **KHÔNG có `this` riêng**. Nó **kế thừa `this`** từ scope bao ngoài (lexical this).

```javascript
const nhom = {
  ten: "Nhóm Dev",
  thanhVien: ["An", "Bình", "Cường"],

  // ❌ Function thường — this bị mất trong callback
  lietKeFunction: function() {
    this.thanhVien.forEach(function(tv) {
      console.log(tv + " thuộc " + this.ten);
      // this ở đây = window (KHÔNG phải nhom!)
    });
  },

  // ✅ Arrow function — kế thừa this từ lietKeArrow
  lietKeArrow: function() {
    this.thanhVien.forEach((tv) => {
      console.log(tv + " thuộc " + this.ten);
      // this ở đây = nhom (kế thừa từ lietKeArrow)
    });
  }
};

nhom.lietKeFunction();
// "An thuộc undefined"
// "Bình thuộc undefined"
// "Cường thuộc undefined"

nhom.lietKeArrow();
// "An thuộc Nhóm Dev"
// "Bình thuộc Nhóm Dev"
// "Cường thuộc Nhóm Dev"
```

### So sánh Function thường vs Arrow Function

| Đặc điểm | Function thường | Arrow Function |
|-----------|----------------|----------------|
| `this` | Phụ thuộc cách gọi | Kế thừa từ scope cha |
| Dùng làm method | ✅ Phù hợp | ❌ Tránh dùng |
| Dùng trong callback | ⚠️ Cần cẩn thận | ✅ Phù hợp |
| `bind/call/apply` | ✅ Có thể thay đổi this | ❌ Không thể thay đổi |

---

## this trong Class

Trong **class**, `this` tham chiếu đến **instance** (đối tượng) được tạo ra.

```javascript
class NhanVien {
  constructor(ten, luong) {
    this.ten = ten;     // this = instance mới
    this.luong = luong;
  }

  gioiThieu() {
    console.log(`${this.ten} — Lương: ${this.luong}`);
  }
}

const nv1 = new NhanVien("Minh", 15000000);
const nv2 = new NhanVien("Lan", 20000000);

nv1.gioiThieu(); // "Minh — Lương: 15000000"
nv2.gioiThieu(); // "Lan — Lương: 20000000"
```

### Vấn đề mất this khi truyền method

```javascript
class DongHo {
  constructor() {
    this.gio = 0;
  }

  tang() {
    this.gio++;
    console.log("Giờ: " + this.gio);
  }
}

const dh = new DongHo();

// ❌ Mất this khi truyền callback
setTimeout(dh.tang, 1000); // "Giờ: NaN" — this = window

// ✅ Cách 1: Dùng arrow function
setTimeout(() => dh.tang(), 1000); // "Giờ: 1"

// ✅ Cách 2: Dùng bind
setTimeout(dh.tang.bind(dh), 1000); // "Giờ: 1"
```

---

## this trong Event Handler

Trong **event handler**, `this` tham chiếu đến **phần tử DOM** nhận sự kiện.

```javascript
const nutBam = document.querySelector("#myButton");

// Function thường — this = phần tử DOM
nutBam.addEventListener("click", function() {
  console.log(this);           // <button id="myButton">
  this.style.color = "red";   // Thay đổi màu nút
  console.log(this.textContent); // Nội dung nút
});

// ❌ Arrow function — this KHÔNG phải phần tử DOM
nutBam.addEventListener("click", () => {
  console.log(this); // Window — KHÔNG phải nút!
});
```

> **Quy tắc:** Khi cần truy cập phần tử DOM trong event handler, dùng **function thường**. Khi cần giữ `this` của class/object bên ngoài, dùng **arrow function**.

---

## this trong Strict Mode

`"use strict"` thay đổi hành vi mặc định của `this`:

```javascript
// Non-strict mode
function nonStrict() {
  console.log(this); // Window
}
nonStrict();

// Strict mode
"use strict";
function strict() {
  console.log(this); // undefined
}
strict();

// Nhưng method vẫn hoạt động bình thường
"use strict";
const obj = {
  method: function() {
    console.log(this); // obj — không bị ảnh hưởng
  }
};
obj.method();
```

---

## Tóm tắt quy tắc xác định this

| Cách gọi | this là gì? | Ví dụ |
|-----------|-------------|-------|
| Global | `window` / `global` | `console.log(this)` |
| Function thường | `window` (non-strict) / `undefined` (strict) | `func()` |
| Method | Object trước dấu `.` | `obj.method()` → `this = obj` |
| Arrow function | Kế thừa từ scope cha | `() => this` |
| Event handler | Phần tử DOM | `el.addEventListener(...)` |
| `new` | Instance mới | `new Class()` → `this = instance` |
| `call/apply/bind` | Object được chỉ định | `func.call(obj)` → `this = obj` |

**Thứ tự ưu tiên:**
1. `new` (cao nhất)
2. `call` / `apply` / `bind`
3. Method call (`obj.method()`)
4. Default (global / undefined)

---

## Lỗi thường gặp

### 1. Mất this khi gán method vào biến

```javascript
const user = {
  name: "Minh",
  greet: function() {
    console.log("Hi, " + this.name);
  }
};

// ❌ Sai — mất this
const fn = user.greet;
fn(); // "Hi, undefined"

// ✅ Đúng — dùng bind
const fn = user.greet.bind(user);
fn(); // "Hi, Minh"
```

### 2. Dùng arrow function làm method

```javascript
// ❌ Sai — arrow function không có this riêng
const obj = {
  name: "Test",
  greet: () => {
    console.log(this.name); // undefined — this = window
  }
};

// ✅ Đúng — dùng function thường
const obj = {
  name: "Test",
  greet: function() {
    console.log(this.name); // "Test"
  }
};
```

### 3. this trong setTimeout/setInterval

```javascript
const timer = {
  count: 0,

  // ❌ Sai — this bị mất
  startWrong: function() {
    setInterval(function() {
      this.count++; // this = window, KHÔNG phải timer
      console.log(this.count); // NaN
    }, 1000);
  },

  // ✅ Đúng — arrow function giữ this
  startRight: function() {
    setInterval(() => {
      this.count++; // this = timer (kế thừa từ startRight)
      console.log(this.count); // 1, 2, 3, ...
    }, 1000);
  }
};
```

---

## Câu hỏi phỏng vấn

### Câu 1: `this` trong JavaScript là gì? Giá trị của nó được xác định khi nào?

**Đáp án:** `this` là keyword tham chiếu đến object đang thực thi hàm hiện tại. Giá trị của `this` được xác định **tại thời điểm gọi hàm** (runtime), không phải lúc khai báo. Có 4 quy tắc chính: default binding (global), implicit binding (method), explicit binding (call/apply/bind), và new binding (constructor).

### Câu 2: Arrow function khác function thường về `this` như thế nào?

**Đáp án:** Arrow function **không có `this` riêng** — nó kế thừa `this` từ lexical scope (scope bao ngoài tại thời điểm khai báo). Function thường xác định `this` dựa trên cách gọi. Vì vậy arrow function không nên dùng làm method, và `call/apply/bind` không thể thay đổi `this` của arrow function.

### Câu 3: Output của đoạn code sau là gì?

```javascript
const obj = {
  name: "A",
  getName: function() {
    return this.name;
  },
  getNameArrow: () => {
    return this.name;
  }
};

console.log(obj.getName());      // ?
console.log(obj.getNameArrow()); // ?
```

**Đáp án:**
- `obj.getName()` → `"A"` — function thường, `this = obj`
- `obj.getNameArrow()` → `undefined` — arrow function, `this` kế thừa từ global scope (window), `window.name` là `undefined`

### Câu 4: Làm thế nào để fix vấn đề mất `this` trong callback?

**Đáp án:** Có 3 cách:
1. **Arrow function:** `setTimeout(() => this.method(), 1000)` — kế thừa this từ scope cha
2. **bind:** `setTimeout(this.method.bind(this), 1000)` — gắn cố định this
3. **Biến trung gian:** `const self = this; setTimeout(function() { self.method(); }, 1000)` — cách cũ, ít dùng

### Câu 5: Thứ tự ưu tiên của `this` binding là gì?

**Đáp án:** Từ cao đến thấp:
1. **new binding** — `new Func()` → this = instance mới
2. **Explicit binding** — `func.call(obj)` / `func.apply(obj)` / `func.bind(obj)` → this = obj
3. **Implicit binding** — `obj.func()` → this = obj
4. **Default binding** — `func()` → this = window (non-strict) / undefined (strict)
