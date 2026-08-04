---
sidebar_position: 1
title: "1. Biến & phạm vi"
---

# 1. Biến & phạm vi (Variables & Scope)

:::note[Ghi nhớ nhanh]

- **JS:** `let`/`const` — không cần kiểu, engine tự suy ra lúc chạy.
- **Java:** phải khai báo **kiểu** trước tên biến: `int x = 5;`.
- **`const` (JS) ≈ `final` (Java)** — biến chỉ gán được một lần.
- **Kết thúc câu lệnh bằng `;`** trong Java là bắt buộc (JS thì tùy chọn).
- **Cả hai đều dùng block scope** (`{}`), nhưng Java **không có** `var`-hoisting kiểu function scope như JS ngày xưa.

:::

---

## Khai báo biến

<table>
<tr><th>JavaScript</th><th>Java</th></tr>
<tr>
<td>

```javascript
let age = 25;
const name = "An";
let isActive = true;
```

</td>
<td>

```java
int age = 25;
final String name = "An";
boolean isActive = true;
```

</td>
</tr>
</table>

Điểm khác cốt lõi: bên Java bạn **phải nói rõ kiểu** (`int`, `String`, `boolean`). Trình biên dịch (compiler — chương trình dịch code Java sang bytecode) dùng thông tin này để bắt lỗi sớm.

---

## `const` và `final`

`const` trong JS ngăn **gán lại** biến. `final` trong Java cũng vậy:

```java
final int MAX = 100;
MAX = 200; // ❌ Lỗi biên dịch: cannot assign a value to final variable
```

> ⚠️ Giống JS, `final`/`const` chỉ khóa **tham chiếu** (reference — chỗ biến trỏ tới), không khóa nội dung bên trong object. Một `final List` vẫn có thể `.add()` phần tử.

---

## `var` trong Java (khác `var` trong JS!)

Java 10+ có `var`, nhưng ý nghĩa **hoàn toàn khác** JS:

```java
var age = 25;        // Java tự suy ra kiểu int lúc BIÊN DỊCH
// age = "hello";    // ❌ Vẫn lỗi — kiểu đã bị "chốt" là int
```

`var` trong Java chỉ là "lười gõ kiểu", nhưng kiểu vẫn **tĩnh và cố định**. Còn `var` trong JS là động, gán lại kiểu gì cũng được.

| | JS `var` | Java `var` |
|---|---|---|
| Kiểu | Động, đổi được | Tĩnh, cố định |
| Phạm vi | Function scope | Block scope |
| Khi nào biết kiểu | Lúc chạy | Lúc biên dịch |

---

## Phạm vi (scope)

Cả hai đều dùng **block scope** với dấu `{}`:

```java
{
    int x = 10;
}
// System.out.println(x); // ❌ x không tồn tại ngoài block
```

Điểm dễ chịu cho dân JS: quy tắc block scope của Java gần giống `let`/`const`, **không có** trò hoisting rắc rối của `var` kiểu cũ trong JS.
