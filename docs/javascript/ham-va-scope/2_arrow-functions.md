---
sidebar_position: 2
title: "2. Arrow Functions"
---

# Arrow Functions

## Arrow Function là gì?

Arrow function (hàm mũi tên) là cú pháp **viết tắt** để tạo hàm trong JavaScript, sử dụng ký hiệu `=>`. Arrow function ngắn gọn hơn function thường và có hành vi đặc biệt với từ khóa `this`.

**Ví dụ thực tế:** Hãy tưởng tượng bạn viết tin nhắn:
- **Function thường** = viết thư tay đầy đủ (kính gửi, nội dung, ký tên)
- **Arrow function** = nhắn tin nhanh (chỉ nội dung chính)

```javascript
// Function thường — cú pháp đầy đủ
const chao = function(ten) {
  return "Xin chào " + ten;
};

// Arrow function — ngắn gọn hơn
const chao = (ten) => {
  return "Xin chào " + ten;
};

// Arrow function — siêu ngắn gọn (implicit return)
const chao = (ten) => "Xin chào " + ten;
```

## Tại sao Arrow Function ra đời?

Arrow function được giới thiệu trong **ES6 (2015)** để giải quyết hai vấn đề:

**1. Cú pháp dài dòng** khi viết callback:

```javascript
// ❌ Trước ES6 — dài dòng
const soNhan2 = [1, 2, 3].map(function(so) {
  return so * 2;
});

// ✅ Sau ES6 — ngắn gọn
const soNhan2 = [1, 2, 3].map(so => so * 2);
```

**2. Vấn đề `this` khó hiểu** trong function thường:

```javascript
// ❌ Trước ES6 — this bị mất trong callback
const person = {
  ten: "Minh",
  chaoSau1Giay: function() {
    setTimeout(function() {
      // "this" ở đây KHÔNG phải person!
      console.log("Xin chào, " + this.ten); // "Xin chào, undefined"
    }, 1000);
  }
};

// ✅ Arrow function — this kế thừa từ bên ngoài
const person = {
  ten: "Minh",
  chaoSau1Giay: function() {
    setTimeout(() => {
      // "this" ở đây VẪN LÀ person
      console.log("Xin chào, " + this.ten); // "Xin chào, Minh"
    }, 1000);
  }
};
```

## Cách sử dụng

### Các dạng cú pháp

```javascript
// 1. Đầy đủ — nhiều tham số, nhiều dòng code
const tinhTong = (a, b) => {
  const ketQua = a + b;
  return ketQua;
};

// 2. Một tham số — bỏ ngoặc tròn
const binhPhuong = x => {
  return x * x;
};

// 3. Implicit return — một dòng, bỏ {} và return
const binhPhuong = x => x * x;

// 4. Không tham số — phải có ngoặc tròn rỗng
const layNgayHomNay = () => new Date().toLocaleDateString("vi-VN");

// 5. Trả về object — phải bọc trong ()
const taoUser = (ten, tuoi) => ({ ten: ten, tuoi: tuoi });
```

### Implicit Return vs Explicit Return

```javascript
// Implicit return: KHÔNG có {} → tự động return
const nhanDoi = x => x * 2;
console.log(nhanDoi(5)); // 10

// Explicit return: CÓ {} → PHẢI viết return
const nhanDoi = x => {
  return x * 2; // Bắt buộc có return
};

// ❌ Sai: Có {} nhưng quên return
const nhanDoi = x => {
  x * 2; // Không return → trả về undefined!
};
console.log(nhanDoi(5)); // undefined
```

### Khi nào cần dấu `{}`?

| Trường hợp | Cần `{}`? | Ví dụ |
|------------|-----------|-------|
| Một biểu thức đơn | Không | `x => x * 2` |
| Nhiều dòng code | Có | `x => { const y = x * 2; return y; }` |
| Có if/else | Có | `x => { if (x > 0) return x; return 0; }` |
| Console.log trước return | Có | `x => { console.log(x); return x * 2; }` |
| Trả về object literal | Bọc `()` | `x => ({ ten: x })` |

## Arrow Function KHÔNG có `this` riêng

Đây là điểm **quan trọng nhất** cần hiểu. Arrow function **không tạo `this` riêng** — nó kế thừa `this` từ scope bên ngoài (lexical `this`).

```javascript
// Function thường: tạo this RIÊNG
const dog = {
  ten: "Milu",
  sua: function() {
    console.log(this.ten + " sủa: Gâu gâu!"); // this = dog
  }
};
dog.sua(); // "Milu sủa: Gâu gâu!" ✅

// Arrow function: KHÔNG có this riêng
const cat = {
  ten: "Mimi",
  keu: () => {
    console.log(this.ten + " kêu: Meo meo!"); // this = window/undefined
  }
};
cat.keu(); // "undefined kêu: Meo meo!" ❌
```

### Tại sao arrow function KHÔNG dùng làm method?

```javascript
// ❌ Sai: Arrow function làm method
const nguoi = {
  ten: "Lan",
  // Arrow function → this kế thừa từ bên ngoài (global/undefined)
  chao: () => {
    return "Tôi là " + this.ten; // this KHÔNG phải nguoi
  }
};
console.log(nguoi.chao()); // "Tôi là undefined"

// ✅ Đúng: Function thường làm method
const nguoi = {
  ten: "Lan",
  // Function thường → this = object gọi method
  chao: function() {
    return "Tôi là " + this.ten; // this = nguoi
  }
};
console.log(nguoi.chao()); // "Tôi là Lan"

// ✅ Shorthand method (cách viết tắt ES6)
const nguoi = {
  ten: "Lan",
  chao() {
    return "Tôi là " + this.ten; // this = nguoi
  }
};
```

### Arrow function phù hợp trong callback

```javascript
const nhom = {
  ten: "Nhóm A",
  thanhVien: ["Minh", "Lan", "Hùng"],

  // ✅ Arrow function trong callback — this kế thừa từ inDanhSach
  inDanhSach: function() {
    this.thanhVien.forEach(tv => {
      console.log(this.ten + ": " + tv); // this = nhom ✅
    });
  }
};
nhom.inDanhSach();
// "Nhóm A: Minh"
// "Nhóm A: Lan"
// "Nhóm A: Hùng"
```

## So sánh Arrow Function vs Function Thường

| Đặc điểm | Function thường | Arrow function |
|-----------|----------------|----------------|
| Cú pháp | `function() {}` | `() => {}` |
| `this` | Tạo `this` riêng | Kế thừa `this` từ scope ngoài |
| `arguments` | Có object `arguments` | Không có `arguments` |
| Hoisting | Có (declaration) | Không |
| Dùng làm method | Phù hợp | Không phù hợp |
| Dùng làm constructor | Có (`new`) | Không (`new` sẽ lỗi) |
| Dùng làm callback | Được | Rất phù hợp |

## Khi nào dùng?

| Dùng Arrow Function | Dùng Function Thường |
|---------------------|---------------------|
| Callback ngắn (`map`, `filter`, `forEach`) | Method trong object |
| Callback trong `setTimeout`, `setInterval` | Constructor function |
| Hàm không cần `this` riêng | Event handler cần `this` là element |
| Functional programming | Hàm cần `arguments` object |

## Lỗi thường gặp

```javascript
// ❌ Sai: Trả về object mà quên bọc ()
const taoUser = (ten) => { ten: ten };
console.log(taoUser("Minh")); // undefined (JS hiểu {} là block code)

// ✅ Đúng: Bọc () khi trả về object
const taoUser = (ten) => ({ ten: ten });
console.log(taoUser("Minh")); // { ten: "Minh" }
```

```javascript
// ❌ Sai: Dùng arrow function làm method
const counter = {
  count: 0,
  tang: () => { this.count++; } // this KHÔNG phải counter!
};

// ✅ Đúng: Dùng function thường làm method
const counter = {
  count: 0,
  tang() { this.count++; } // this = counter ✅
};
```

---

## Câu hỏi phỏng vấn

### Câu 1: Arrow function khác function thường ở những điểm nào?

**Đáp án:**

Có 4 khác biệt chính:

```javascript
// 1. this — Arrow kế thừa, function thường tạo riêng
const obj = {
  value: 42,
  arrow: () => console.log(this.value),   // undefined (this = global)
  regular: function() { console.log(this.value); } // 42 (this = obj)
};

// 2. arguments — Arrow KHÔNG có
const regularFn = function() {
  console.log(arguments); // [1, 2, 3]
};
const arrowFn = () => {
  console.log(arguments); // ReferenceError!
};

// 3. new — Arrow KHÔNG thể dùng làm constructor
const Person = (name) => { this.name = name; };
new Person("Minh"); // TypeError: Person is not a constructor

// 4. Hoisting — Arrow KHÔNG được hoisting
arrowFn(); // ReferenceError
const arrowFn = () => "hello";
```

### Câu 2: Tại sao arrow function không nên dùng làm method trong object?

**Đáp án:**

Vì arrow function **không tạo `this` riêng**, mà kế thừa `this` từ scope bao bên ngoài. Khi dùng làm method, `this` sẽ không trỏ đến object mà trỏ đến global scope (hoặc `undefined` trong strict mode).

```javascript
const user = {
  name: "Minh",
  // ❌ Arrow: this = global, KHÔNG phải user
  greet: () => `Hello ${this.name}`,
  // ✅ Regular: this = user
  greetCorrect() { return `Hello ${this.name}`; }
};

console.log(user.greet());        // "Hello undefined"
console.log(user.greetCorrect()); // "Hello Minh"
```

### Câu 3: Output của đoạn code sau là gì?

```javascript
const obj = {
  count: 10,
  doSomething: function() {
    setTimeout(() => {
      this.count++;
      console.log(this.count);
    }, 100);
  }
};
obj.doSomething();
```

**Đáp án:**

Output là `11`. Giải thích:
1. `doSomething` là function thường, nên `this` = `obj`
2. Arrow function bên trong `setTimeout` **kế thừa `this`** từ `doSomething`
3. Vì vậy `this.count` chính là `obj.count` (= 10)
4. Sau `this.count++`, giá trị trở thành `11`

Nếu dùng function thường thay vì arrow function trong `setTimeout`, `this` sẽ là `window` (hoặc `undefined`) và kết quả sẽ là `NaN`.

### Câu 4: Khi nào BẮT BUỘC phải dùng function thường thay vì arrow?

**Đáp án:**

Có 3 trường hợp bắt buộc:

```javascript
// 1. Object method — cần this trỏ đến object
const car = {
  brand: "Toyota",
  getBrand() { return this.brand; } // Phải dùng function thường
};

// 2. Constructor function — cần dùng với new
function Animal(name) {
  this.name = name; // Phải dùng function thường
}
const dog = new Animal("Rex");

// 3. Event handler cần this là element DOM
button.addEventListener("click", function() {
  this.classList.toggle("active"); // this = button element
  // Arrow function → this = scope ngoài, KHÔNG phải button
});
```

### Câu 5: Implicit return là gì? Khi nào dùng?

**Đáp án:**

Implicit return là khi arrow function **tự động trả về giá trị** mà không cần viết từ khóa `return`. Điều kiện: hàm chỉ có **một biểu thức duy nhất** và **không dùng `{}`**.

```javascript
// Implicit return — ngắn gọn
const double = x => x * 2;          // tự động return x * 2
const isAdult = age => age >= 18;    // tự động return true/false
const getFirst = arr => arr[0];      // tự động return phần tử đầu

// Phải dùng explicit return khi có nhiều dòng
const calculate = (a, b) => {
  const sum = a + b;
  const avg = sum / 2;
  return avg; // Bắt buộc viết return
};

// Chú ý: trả về object phải bọc ()
const createPair = (a, b) => ({ first: a, second: b }); // ✅
const createPair = (a, b) => { first: a, second: b };   // ❌ lỗi cú pháp
```
