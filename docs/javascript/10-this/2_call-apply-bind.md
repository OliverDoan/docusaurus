---
sidebar_position: 7
title: "7. Call, Apply, Bind"
---

# Call, Apply, Bind


---

## Mục lục

- [Tại sao cần Call, Apply, Bind?](#tại-sao-cần-call-apply-bind)
- [call() — Gọi hàm với this chỉ định](#call--gọi-hàm-với-this-chỉ-định)
- [apply() — Giống call nhưng truyền mảng](#apply--giống-call-nhưng-truyền-mảng)
- [bind() — Tạo hàm mới với this cố định](#bind--tạo-hàm-mới-với-this-cố-định)
- [So sánh call vs apply vs bind](#so-sánh-call-vs-apply-vs-bind)
- [Use Cases thực tế](#use-cases-thực-tế)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Tại sao cần Call, Apply, Bind?

Trong JavaScript, giá trị `this` thay đổi tùy cách gọi hàm. Đôi khi bạn cần **chủ động chỉ định** `this` cho hàm — đó là lúc `call`, `apply`, `bind` xuất hiện.

> **Ví dụ thực tế:** Hãy tưởng tượng bạn có một **công thức nấu ăn** (hàm). Công thức này cần **nguyên liệu** (this) để hoạt động. `call/apply` giống như nói "nấu **ngay** với nguyên liệu này", còn `bind` giống như "chuẩn bị sẵn nguyên liệu, **lát nữa** nấu".

```javascript
function chao() {
  console.log("Xin chào, tôi là " + this.ten);
}

const minh = { ten: "Minh" };
const lan = { ten: "Lan" };

// Không có call/apply/bind: this = window
chao(); // "Xin chào, tôi là undefined"

// Với call: chỉ định this = minh
chao.call(minh); // "Xin chào, tôi là Minh"

// Với call: chỉ định this = lan
chao.call(lan);  // "Xin chào, tôi là Lan"
```

---

## call() — Gọi hàm với this chỉ định

`call()` **gọi hàm ngay lập tức** và cho phép bạn chỉ định `this`, kèm theo các tham số **truyền riêng lẻ**.

**Cú pháp:**
```javascript
func.call(thisArg, arg1, arg2, ...)
```

```javascript
function gioiThieu(chucVu, phongBan) {
  console.log(`${this.ten} — ${chucVu} — ${phongBan}`);
}

const nhanVien = { ten: "Hùng" };

// Gọi hàm với this = nhanVien, truyền 2 tham số
gioiThieu.call(nhanVien, "Developer", "Phòng IT");
// "Hùng — Developer — Phòng IT"
```

### Mượn method từ object khác (Method Borrowing)

```javascript
const nguoi = {
  ten: "An",
  chao: function(loiChao) {
    console.log(`${loiChao}, tôi là ${this.ten}`);
  }
};

const robot = { ten: "Bot-3000" };

// robot không có method chao, nhưng có thể "mượn" từ nguoi
nguoi.chao.call(robot, "Beep boop");
// "Beep boop, tôi là Bot-3000"
```

### Dùng với Array-like objects

```javascript
// arguments không phải Array thật, nhưng có thể mượn method
function tinhTong() {
  // Mượn Array.prototype.slice để chuyển arguments thành mảng
  const args = Array.prototype.slice.call(arguments);
  return args.reduce((sum, n) => sum + n, 0);
}

console.log(tinhTong(1, 2, 3, 4)); // 10
```

---

## apply() — Giống call nhưng truyền mảng

`apply()` hoạt động **giống hệt `call()`**, nhưng tham số được truyền dưới dạng **mảng** thay vì riêng lẻ.

**Cú pháp:**
```javascript
func.apply(thisArg, [arg1, arg2, ...])
```

```javascript
function gioiThieu(chucVu, phongBan) {
  console.log(`${this.ten} — ${chucVu} — ${phongBan}`);
}

const nhanVien = { ten: "Lan" };

// call: truyền riêng lẻ
gioiThieu.call(nhanVien, "Designer", "Phòng UX");

// apply: truyền mảng
gioiThieu.apply(nhanVien, ["Designer", "Phòng UX"]);

// Kết quả GIỐNG nhau: "Lan — Designer — Phòng UX"
```

### Khi nào dùng apply?

```javascript
// Tìm số lớn nhất — Math.max không nhận mảng trực tiếp
const diem = [8, 5, 9, 3, 7];

// ❌ Sai — Math.max cần tham số riêng lẻ
console.log(Math.max(diem)); // NaN

// ✅ Dùng apply để "bung" mảng thành tham số
console.log(Math.max.apply(null, diem)); // 9

// ✅ Cách hiện đại hơn: spread operator
console.log(Math.max(...diem)); // 9
```

> **Mẹo nhớ:** **a**pply → **a**rray (truyền mảng), **c**all → **c**omma (truyền từng cái, cách nhau bởi dấu phẩy).

---

## bind() — Tạo hàm mới với this cố định

`bind()` **KHÔNG gọi hàm ngay**. Nó **trả về một hàm mới** với `this` đã được gắn cố định vĩnh viễn.

**Cú pháp:**
```javascript
const newFunc = func.bind(thisArg, arg1, arg2, ...)
```

```javascript
function chao() {
  console.log("Xin chào, " + this.ten);
}

const minh = { ten: "Minh" };

// bind tạo hàm MỚI, không gọi ngay
const chaoMinh = chao.bind(minh);

// Gọi hàm mới — this luôn = minh
chaoMinh(); // "Xin chào, Minh"

// Dù dùng call để thay đổi this — vẫn không đổi!
chaoMinh.call({ ten: "Khác" }); // "Xin chào, Minh" — bind ưu tiên hơn call
```

### Partial Application (Áp dụng một phần)

`bind()` cho phép **gắn sẵn** một số tham số:

```javascript
function nhan(a, b) {
  return a * b;
}

// Tạo hàm "nhân đôi" bằng cách gắn sẵn a = 2
const nhanDoi = nhan.bind(null, 2);

console.log(nhanDoi(5));  // 10 (= 2 × 5)
console.log(nhanDoi(10)); // 20 (= 2 × 10)

// Tạo hàm "nhân ba"
const nhanBa = nhan.bind(null, 3);
console.log(nhanBa(5));  // 15 (= 3 × 5)
```

### Fix this trong Event Handler và setTimeout

```javascript
class DemNguoc {
  constructor() {
    this.so = 10;
  }

  bat() {
    // ❌ Sai — this bị mất trong setInterval
    // setInterval(this.dem, 1000);

    // ✅ Đúng — bind giữ this
    setInterval(this.dem.bind(this), 1000);
  }

  dem() {
    this.so--;
    console.log(this.so);
  }
}

const dc = new DemNguoc();
dc.bat(); // 9, 8, 7, 6, ...
```

---

## So sánh call vs apply vs bind

| Đặc điểm | `call()` | `apply()` | `bind()` |
|-----------|---------|----------|---------|
| Gọi hàm ngay? | ✅ Có | ✅ Có | ❌ Không (trả về hàm mới) |
| Cách truyền tham số | Riêng lẻ: `f.call(obj, a, b)` | Mảng: `f.apply(obj, [a, b])` | Riêng lẻ: `f.bind(obj, a, b)` |
| Trả về | Kết quả hàm | Kết quả hàm | Hàm mới |
| Thay đổi this vĩnh viễn? | ❌ Chỉ lần đó | ❌ Chỉ lần đó | ✅ Vĩnh viễn |
| Dùng khi nào? | Gọi ngay, biết rõ tham số | Gọi ngay, tham số là mảng | Cần hàm mới dùng sau |

```javascript
function chao(loiChao, dauCau) {
  console.log(`${loiChao} ${this.ten}${dauCau}`);
}

const user = { ten: "Minh" };

// call — gọi ngay, tham số riêng lẻ
chao.call(user, "Hello", "!");     // "Hello Minh!"

// apply — gọi ngay, tham số là mảng
chao.apply(user, ["Hello", "!"]);  // "Hello Minh!"

// bind — tạo hàm mới, gọi sau
const chaoUser = chao.bind(user, "Hello", "!");
chaoUser();                         // "Hello Minh!"
```

---

## Use Cases thực tế

### 1. Mượn method mảng cho NodeList

```javascript
// querySelectorAll trả về NodeList, không phải Array
const divs = document.querySelectorAll("div");

// ❌ divs.forEach tồn tại nhưng divs.map thì không
// divs.map(div => div.textContent); // TypeError

// ✅ Mượn Array.prototype.map
const noiDung = Array.prototype.map.call(divs, div => div.textContent);
```

### 2. Kiểm tra kiểu dữ liệu chính xác

```javascript
// typeof không phân biệt được object, array, null
console.log(typeof []);   // "object"
console.log(typeof null); // "object"

// Dùng call với Object.prototype.toString
function kiemTraKieu(value) {
  return Object.prototype.toString.call(value);
}

console.log(kiemTraKieu([]));        // "[object Array]"
console.log(kiemTraKieu(null));      // "[object Null]"
console.log(kiemTraKieu(undefined)); // "[object Undefined]"
console.log(kiemTraKieu(42));        // "[object Number]"
```

### 3. Tạo logger với context cố định

```javascript
function log(level, message) {
  console.log(`[${level}] ${this.module}: ${message}`);
}

const authLogger = log.bind({ module: "AUTH" });
const dbLogger = log.bind({ module: "DATABASE" });

authLogger("INFO", "User logged in");    // "[INFO] AUTH: User logged in"
authLogger("ERROR", "Invalid token");    // "[ERROR] AUTH: Invalid token"
dbLogger("WARN", "Slow query detected"); // "[WARN] DATABASE: Slow query detected"
```

### 4. Currying với bind

```javascript
function tinh(thue, gia) {
  return gia + gia * thue;
}

// Tạo các hàm tính giá theo thuế khác nhau
const tinhVAT = tinh.bind(null, 0.1);    // Thuế 10%
const tinhLuxury = tinh.bind(null, 0.25); // Thuế 25%

console.log(tinhVAT(100000));    // 110000
console.log(tinhLuxury(100000)); // 125000
```

---

## Lỗi thường gặp

### 1. Quên bind khi truyền callback

```javascript
class App {
  constructor() {
    this.data = [1, 2, 3];
  }

  // ❌ Sai — this bị mất khi truyền như callback
  process() {
    setTimeout(this.render, 1000); // this.render mất context
  }

  // ✅ Đúng — dùng bind hoặc arrow function
  processFixed() {
    setTimeout(this.render.bind(this), 1000);
    // hoặc: setTimeout(() => this.render(), 1000);
  }

  render() {
    console.log(this.data); // [1, 2, 3] (nếu đã bind)
  }
}
```

### 2. bind nhiều lần — chỉ lần đầu có tác dụng

```javascript
function showName() {
  console.log(this.name);
}

const fn1 = showName.bind({ name: "Minh" });
const fn2 = fn1.bind({ name: "Lan" }); // bind lần 2 KHÔNG có tác dụng!

fn2(); // "Minh" — vẫn giữ bind lần đầu
```

### 3. apply với quá nhiều tham số

```javascript
// ❌ Mảng quá lớn có thể gây stack overflow
const arr = new Array(1000000).fill(1);
// Math.max.apply(null, arr); // Có thể lỗi!

// ✅ Dùng vòng lặp hoặc reduce cho mảng lớn
const max = arr.reduce((a, b) => Math.max(a, b));
```

---

## Câu hỏi phỏng vấn

### Câu 1: Sự khác nhau giữa `call`, `apply`, `bind` là gì?

**Đáp án:** Cả 3 đều dùng để thay đổi `this` context. `call` gọi hàm ngay với tham số riêng lẻ. `apply` gọi hàm ngay với tham số là mảng. `bind` không gọi hàm mà trả về hàm mới với `this` đã được gắn cố định vĩnh viễn.

### Câu 2: Output của đoạn code sau là gì?

```javascript
const obj = { a: 1 };

function fn() {
  console.log(this.a);
}

const bound = fn.bind(obj);
bound.call({ a: 2 });
```

**Đáp án:** Output là `1`. Khi hàm đã được `bind`, `this` sẽ **cố định** và không thể thay đổi bằng `call`, `apply`, hoặc `bind` lần nữa.

### Câu 3: Implement `Function.prototype.myBind`

**Đáp án:**

```javascript
Function.prototype.myBind = function(context, ...args) {
  const fn = this; // Hàm gốc
  return function(...newArgs) {
    return fn.apply(context, [...args, ...newArgs]);
  };
};

// Test
function add(a, b) {
  return this.base + a + b;
}

const add10 = add.myBind({ base: 10 }, 5);
console.log(add10(3)); // 18 (= 10 + 5 + 3)
```

### Câu 4: Partial Application là gì? Cho ví dụ với `bind`.

**Đáp án:** Partial Application là kỹ thuật tạo hàm mới bằng cách "gắn sẵn" một số tham số của hàm gốc. Dùng `bind()` với tham số đầu tiên là `null` (khi không cần thay đổi `this`):

```javascript
function multiply(a, b) { return a * b; }
const double = multiply.bind(null, 2);
double(5); // 10
```

### Câu 5: Khi nào dùng `call/apply` thay vì gọi hàm trực tiếp?

**Đáp án:**
- **Method borrowing:** Mượn method từ object khác, ví dụ `Array.prototype.slice.call(arguments)`
- **Kiểm tra kiểu:** `Object.prototype.toString.call(value)`
- **Spread arguments:** `Math.max.apply(null, array)` (trước khi có spread operator)
- **Kế thừa constructor:** Gọi constructor cha trong pattern cũ
