---
sidebar_position: 2
title: "2. for...in"
---

# Vòng lặp `for...in`

---

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Cú pháp](#cú-pháp)
- [Lặp qua object](#lặp-qua-object)
- [Lặp qua mảng — KHÔNG khuyến nghị](#lặp-qua-mảng--không-khuyến-nghị)
- [Inherited properties](#inherited-properties)
- [`for...in` vs `for...of`](#forin-vs-forof)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Giới thiệu

`for...in` lặp qua **các property key (string)** của một object — bao gồm cả **inherited** enumerable properties.

> **Ví dụ thực tế:** Hãy tưởng tượng object như một **danh bạ điện thoại** — `for...in` đọc lần lượt **tên** các liên hệ (key), không quan tâm số điện thoại (value).

```js
const user = { name: "Alice", age: 30, city: "Hà Nội" };

for (const key in user) {
  console.log(key, "→", user[key]);
}
// name → Alice
// age → 30
// city → Hà Nội
```

## Cú pháp

```js
for (const key in object) {
  // dùng key (string) và object[key]
}
```

- `key` là **string** (luôn luôn — kể cả với mảng)
- Lặp qua các **enumerable property** của object và prototype chain

## Lặp qua object

```js
const product = {
  name: "Áo thun",
  price: 200000,
  stock: 50,
  category: "fashion"
};

for (const key in product) {
  console.log(`${key}: ${product[key]}`);
}
// name: Áo thun
// price: 200000
// stock: 50
// category: fashion
```

### Thứ tự duyệt

ES2020 chuẩn hoá thứ tự lặp:
1. **Integer keys** (theo thứ tự tăng dần)
2. **String keys** (theo thứ tự insert)
3. **Symbol keys** (KHÔNG được duyệt bởi `for...in`)

```js
const obj = { "2": "a", "1": "b", name: "Alice", id: 1 };

for (const k in obj) console.log(k);
// 1, 2, name, id   (integer key sort tăng trước)
```

## Lặp qua mảng — KHÔNG khuyến nghị

```js
const arr = ["a", "b", "c"];

for (const i in arr) {
  console.log(i, arr[i]);
}
// "0" "a"
// "1" "b"
// "2" "c"
```

### Vì sao không nên dùng?

1. **Index là chuỗi**, không phải số:
   ```js
   for (const i in [10, 20]) {
     console.log(typeof i);   // "string"
     console.log(i + 1);      // "01", "11" ⚠️
   }
   ```

2. **Có thể lặp qua property "lạ"** thêm vào mảng:
   ```js
   const arr = [1, 2, 3];
   arr.extra = "custom";
   
   for (const k in arr) {
     console.log(k);   // 0, 1, 2, "extra"  ⚠️
   }
   ```

3. **Lặp qua property của prototype** (nếu bị mở rộng):
   ```js
   Array.prototype.lastItem = function() { /* ... */ };
   
   for (const k in [1, 2, 3]) {
     console.log(k);   // 0, 1, 2, "lastItem" ⚠️
   }
   ```

4. **Thứ tự không đảm bảo** trên một số engine cũ (ES2020+ đã chuẩn hoá).

### Cách đúng để lặp mảng

```js
const arr = ["a", "b", "c"];

// ✅ for...of — lấy giá trị
for (const value of arr) console.log(value);

// ✅ for cổ điển — có index
for (let i = 0; i < arr.length; i++) console.log(arr[i]);

// ✅ forEach — callback
arr.forEach((value, index) => console.log(index, value));

// ✅ entries — index + value
for (const [i, v] of arr.entries()) console.log(i, v);
```

## Inherited properties

`for...in` lặp qua **toàn bộ prototype chain** — đôi khi không mong muốn:

```js
const parent = { inherited: "yes" };
const child = Object.create(parent);
child.own = "yes";

for (const k in child) {
  console.log(k);   // own, inherited  ⚠️
}
```

### Cách lọc chỉ own properties

```js
// ✅ Cách 1: hasOwnProperty
for (const k in child) {
  if (Object.hasOwn(child, k)) {  // ES2022 — thay cho hasOwnProperty
    console.log(k);
  }
}

// ✅ Cách 2: dùng Object.keys (chỉ own + enumerable)
for (const k of Object.keys(child)) {
  console.log(k);   // chỉ "own"
}

// ✅ Cách 3: Object.getOwnPropertyNames (kể cả non-enumerable)
for (const k of Object.getOwnPropertyNames(child)) { /* ... */ }
```

### Vì sao `Object.hasOwn` thay `hasOwnProperty`?

```js
const obj = Object.create(null);   // không có prototype Object
obj.x = 1;

obj.hasOwnProperty("x");   // ❌ TypeError
Object.hasOwn(obj, "x");    // ✅ true
```

## `for...in` vs `for...of`

| | `for...in` | `for...of` |
|---|-----------|------------|
| Lặp qua | **Keys** (string) | **Values** |
| Object | ✅ | ❌ (object không iterable mặc định) |
| Mảng | ⚠️ Lặp index (không khuyến nghị) | ✅ Lặp value |
| String | ✅ Lặp index ký tự | ✅ Lặp từng ký tự |
| Map / Set | ❌ | ✅ |
| Generator | ❌ | ✅ |
| Inherited prop | ✅ Có | ❌ Không |
| Thứ tự | Integer trước | Theo thứ tự iterable |

### Ví dụ minh hoạ

```js
const arr = ["a", "b", "c"];

for (const k in arr) console.log(k);   // "0", "1", "2"
for (const v of arr) console.log(v);   // "a", "b", "c"

const obj = { x: 1, y: 2 };

for (const k in obj) console.log(k);   // "x", "y"
for (const v of obj) console.log(v);   // ❌ TypeError: obj is not iterable

// Để dùng for...of với object:
for (const v of Object.values(obj)) console.log(v);   // 1, 2
for (const [k, v] of Object.entries(obj)) console.log(k, v);  // x 1, y 2
```

---

## Câu hỏi phỏng vấn

### Câu 1: `for...in` lặp qua cái gì?

**Đáp án:**

`for...in` lặp qua **các property key (string)** **enumerable** của object — **bao gồm cả prototype chain**.

```js
const obj = { a: 1 };
const child = Object.create(obj);
child.b = 2;

for (const k in child) console.log(k);
// "b" (own), "a" (inherited)
```

Để chỉ lấy own property, dùng `Object.hasOwn(obj, key)` để lọc.

### Câu 2: Vì sao không nên dùng `for...in` với mảng?

**Đáp án:**

3 lý do chính:

1. **Index là string**, không phải number — gây bug khi tính toán:
   ```js
   for (const i in [10, 20]) console.log(i + 1);   // "01", "11"
   ```

2. **Có thể lặp qua property "lạ"** thêm vào mảng hoặc Array.prototype:
   ```js
   arr.customProp = "extra";
   for (const i in arr) console.log(i);  // 0, 1, 2, "customProp"
   ```

3. **Thứ tự không đảm bảo 100%** trên engine cũ (đã được chuẩn hoá ES2020).

→ Dùng `for...of`, `forEach`, hoặc `for` cổ điển cho mảng.

### Câu 3: Đoán kết quả

```js
const arr = [10, 20, 30];
arr.foo = "bar";

let result = "";
for (const k in arr) {
  result += k + " ";
}
console.log(result);
```

**Đáp án:**

```
"0 1 2 foo "
```

`for...in` lặp qua **tất cả enumerable property** — bao gồm cả `foo` mà ta vừa thêm.

### Câu 4: Sự khác biệt giữa `Object.keys()`, `for...in`, `Object.getOwnPropertyNames()`?

**Đáp án:**

```js
const parent = { inherited: 1 };
const obj = Object.create(parent);
obj.own = 2;
Object.defineProperty(obj, "hidden", { value: 3, enumerable: false });

Object.keys(obj);                    // ["own"]
Object.getOwnPropertyNames(obj);     // ["own", "hidden"]

const result = [];
for (const k in obj) result.push(k);
// ["own", "inherited"]
```

| API | Own? | Enumerable? | Inherited? | Symbol? |
|-----|------|-------------|------------|---------|
| `Object.keys` | ✅ | ✅ chỉ | ❌ | ❌ |
| `Object.getOwnPropertyNames` | ✅ | ✅+❌ | ❌ | ❌ |
| `for...in` | ✅+❌ | ✅ chỉ | ✅ | ❌ |
| `Object.getOwnPropertySymbols` | ✅ | ✅+❌ | ❌ | ✅ |
| `Reflect.ownKeys` | ✅ | ✅+❌ | ❌ | ✅ |
