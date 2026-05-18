---
sidebar_position: 4
title: "4. break & continue"
---

# `break` & `continue`

---

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [`break` — Thoát vòng lặp](#break--thoát-vòng-lặp)
- [`continue` — Bỏ qua iteration hiện tại](#continue--bỏ-qua-iteration-hiện-tại)
- [Labeled loops](#labeled-loops)
- [Trong các vòng lặp khác nhau](#trong-các-vòng-lặp-khác-nhau)
- [Pitfall với `forEach`/`map`](#pitfall-với-foreachmap)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Giới thiệu

`break` và `continue` là **control flow statements** dùng để **thay đổi luồng** của vòng lặp:

- **`break`** — thoát vòng lặp **ngay lập tức**
- **`continue`** — bỏ qua phần còn lại của iteration, sang lần lặp tiếp theo

```js
// Tìm phần tử đầu tiên > 5 và dừng
for (const n of [3, 7, 1, 9, 2]) {
  if (n > 5) {
    console.log("Tìm thấy:", n);
    break;
  }
}
// Tìm thấy: 7
```

## `break` — Thoát vòng lặp

### Cú pháp

```js
for (let i = 0; i < 10; i++) {
  if (i === 5) break;
  console.log(i);
}
// 0, 1, 2, 3, 4
```

### Use case

#### 1. Tìm phần tử đầu tiên thoả điều kiện

```js
function findFirstAdult(users) {
  for (const user of users) {
    if (user.age >= 18) {
      return user;   // return cũng thoát vòng lặp
    }
  }
  return null;
}

// hoặc dùng break:
let found = null;
for (const user of users) {
  if (user.age >= 18) {
    found = user;
    break;
  }
}
```

#### 2. Dừng khi gặp lỗi

```js
const items = [1, 2, "abc", 4, 5];

for (const item of items) {
  if (typeof item !== "number") {
    console.error("Lỗi:", item);
    break;
  }
  console.log(item * 2);
}
// 2, 4, "Lỗi: abc"
```

#### 3. Trong `while`

```js
let attempts = 0;
while (true) {
  attempts++;
  const result = tryOperation();
  if (result.success) break;
  if (attempts > 5) {
    throw new Error("Quá số lần thử");
  }
}
```

#### 4. Trong `switch`

```js
switch (color) {
  case "red":
    console.log("Đỏ");
    break;
  case "blue":
    console.log("Xanh");
    break;
  default:
    console.log("Khác");
}
```

> Trong `switch`, **bắt buộc** dùng `break` (hoặc `return`) — nếu không sẽ **fall through** sang case tiếp theo.

## `continue` — Bỏ qua iteration hiện tại

### Cú pháp

```js
for (let i = 0; i < 10; i++) {
  if (i % 2 === 0) continue;  // bỏ qua số chẵn
  console.log(i);
}
// 1, 3, 5, 7, 9
```

### Use case

#### 1. Skip invalid input

```js
const inputs = ["1", "abc", "3", "", "5"];

for (const input of inputs) {
  const num = Number(input);
  if (isNaN(num)) continue;
  console.log(num * 2);
}
// 2, 6, 10
```

#### 2. Skip falsy values

```js
const items = [1, null, 2, undefined, 3];

for (const item of items) {
  if (item == null) continue;
  console.log(item);
}
// 1, 2, 3
```

#### 3. Skip phần tử không hợp lệ

```js
for (const user of users) {
  if (user.banned) continue;
  sendNotification(user);
}
```

## Labeled loops

Khi có **vòng lặp lồng**, `break` và `continue` chỉ tác động lên **vòng trong cùng**. Dùng **label** để thoát vòng ngoài:

```js
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (i === 1 && j === 1) {
      break outer;   // thoát cả vòng outer
    }
    console.log(i, j);
  }
}
// 0 0, 0 1, 0 2, 1 0
```

### `continue` với label

```js
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (j === 1) continue outer;  // qua i tiếp theo
    console.log(i, j);
  }
}
// 0 0, 1 0, 2 0
```

### Use case thực tế: tìm trong ma trận

```js
const matrix = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
];

let foundAt = null;
search: for (let i = 0; i < matrix.length; i++) {
  for (let j = 0; j < matrix[i].length; j++) {
    if (matrix[i][j] === 5) {
      foundAt = [i, j];
      break search;
    }
  }
}

console.log(foundAt);  // [1, 1]
```

> **Khuyến nghị:** Hạn chế dùng label — code thường khó đọc. Nếu cần, cân nhắc tách thành function với `return`.

```js
// ✅ Tách function — gọn hơn
function findValue(matrix, target) {
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] === target) return [i, j];
    }
  }
  return null;
}
```

## Trong các vòng lặp khác nhau

### `for`

```js
for (let i = 0; i < 10; i++) {
  if (i === 5) break;       // ✅
  if (i % 2) continue;       // ✅
}
```

### `while` / `do...while`

```js
while (condition) {
  if (...) break;             // ✅
  if (...) continue;          // ✅
}
```

### `for...in` / `for...of`

```js
for (const x of arr) {
  if (...) break;             // ✅
  if (...) continue;          // ✅
}
```

### `switch`

```js
switch (x) {
  case 1:
    break;                    // ✅ thoát switch
  case 2:
    continue;                 // ❌ SyntaxError (nếu không trong loop)
}
```

## Pitfall với `forEach`/`map`

`break` và `continue` **KHÔNG hoạt động** trong `forEach`, `map`, `filter`, `reduce`:

```js
// ❌ Không thể break
[1, 2, 3, 4, 5].forEach(n => {
  if (n === 3) break;  // ❌ SyntaxError
});

// ❌ return chỉ skip callback, không dừng forEach
[1, 2, 3, 4, 5].forEach(n => {
  if (n === 3) return;  // chỉ skip n=3
  console.log(n);       // 1, 2, 4, 5
});
```

### Cách thay thế

```js
// Cách 1: dùng for...of
for (const n of [1, 2, 3, 4, 5]) {
  if (n === 3) break;
  console.log(n);
}

// Cách 2: dùng some/every (dừng khi return true/false)
[1, 2, 3, 4, 5].some(n => {
  if (n === 3) return true;   // dừng iteration
  console.log(n);
  return false;
});

// Cách 3: throw + catch (anti-pattern)
try {
  [1, 2, 3, 4, 5].forEach(n => {
    if (n === 3) throw new Error("break");
    console.log(n);
  });
} catch (e) { /* swallow */ }
```

---

## Câu hỏi phỏng vấn

### Câu 1: `break` và `continue` khác nhau như thế nào?

**Đáp án:**

- **`break`**: thoát **hoàn toàn** vòng lặp, không chạy iteration nào nữa.
- **`continue`**: bỏ qua **phần còn lại** của iteration hiện tại, **sang iteration tiếp theo**.

```js
for (let i = 0; i < 5; i++) {
  if (i === 2) continue;
  if (i === 4) break;
  console.log(i);
}
// 0, 1, 3
```

### Câu 2: Đoán kết quả

```js
let result = "";
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (i === 1 && j === 1) break outer;
    if (j === 0) continue;
    result += `${i}${j} `;
  }
}
console.log(result);
```

**Đáp án:**

```
"01 02 "
```

- `i=0`: `j=0` (continue), `j=1` → "01", `j=2` → "02"
- `i=1`: `j=0` (continue), `j=1` → break outer

### Câu 3: Vì sao `break` không hoạt động trong `forEach`?

**Đáp án:**

`forEach` là **method** chứ không phải structure — nó nhận một callback và gọi callback cho từng phần tử. `break`/`continue` là **statement**, chỉ hoạt động trong **loop construct** (`for`, `while`).

Trong callback của forEach, `return` chỉ thoát khỏi **lần gọi callback hiện tại**, không dừng forEach.

Để có thể "break", dùng:
- `for...of` (hỗ trợ break)
- `some()` / `every()` (return true/false để dừng)
- `find()` / `findIndex()` (dừng khi tìm thấy)

### Câu 4: Có nên dùng `goto` qua label không?

**Đáp án:**

JS không có `goto` — chỉ có **labeled break/continue** áp dụng cho **vòng lặp** hoặc **block**.

```js
// Label với block (không phải loop)
foo: {
  if (condition) break foo;
  console.log("không chạy");
}
```

**Khuyến nghị:** tránh dùng label — code khó đọc. Tách thành function với `return` thường rõ ràng hơn:

```js
// ❌ Khó đọc
outer: for (...) {
  for (...) {
    if (...) break outer;
  }
}

// ✅ Dễ đọc
function findInMatrix(matrix, target) {
  for (...) {
    for (...) {
      if (...) return result;
    }
  }
}
```
