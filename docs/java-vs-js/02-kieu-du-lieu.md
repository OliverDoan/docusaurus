---
sidebar_position: 2
title: "2. Kiểu dữ liệu"
---

# 2. Kiểu dữ liệu (Data Types)

:::note[Ghi nhớ nhanh]

- **JS có 1 kiểu số** (`number`), **Java tách nhiều kiểu số:** `int`, `long`, `double`, `float`, `short`, `byte`.
- Java chia làm 2 nhóm: **kiểu nguyên thủy** (primitive — `int`, `double`, `boolean`...) và **kiểu tham chiếu** (reference — `String`, mảng, object).
- **Primitive viết thường** (`int`), **class viết hoa** (`String`, `Integer`).
- Java **không có** `undefined`; chỉ có `null` (và chỉ cho kiểu tham chiếu).
- Chọn sai kiểu số có thể **tràn số** (overflow) hoặc mất độ chính xác — điều JS che giấu.

:::

---

## Số: 1 kiểu (JS) vs nhiều kiểu (Java)

Bên JS mọi con số đều là `number`. Bên Java bạn phải chọn:

<table>
<tr><th>JavaScript</th><th>Java</th></tr>
<tr>
<td>

```javascript
let count = 42;
let price = 9.99;
let big = 9007199254740991;
```

</td>
<td>

```java
int count = 42;        // số nguyên 32-bit
double price = 9.99;   // số thực
long big = 9007199254740991L; // 64-bit, hậu tố L
```

</td>
</tr>
</table>

| Kiểu Java | Dùng cho | Phạm vi |
|---|---|---|
| `int` | Số nguyên thường dùng | ~ ±2,1 tỷ |
| `long` | Số nguyên rất lớn | ~ ±9,2 tỷ tỷ |
| `double` | Số thực (mặc định) | Độ chính xác cao |
| `float` | Số thực (ít dùng) | Hậu tố `f` |
| `boolean` | true/false | — |
| `char` | Một ký tự | `'A'` (nháy đơn) |

> ⚠️ **Tràn số:** `int` cộng quá giới hạn sẽ "lộn vòng" về số âm — JS `number` thì không (nhưng mất chính xác với số quá lớn). Cần số cực lớn dùng `long` hoặc `BigInteger`.

---

## Primitive vs Reference

Đây là khái niệm mới với dân JS. Java chia biến làm 2 nhóm:

- **Primitive** (nguyên thủy): `int`, `double`, `boolean`, `char`... — lưu **giá trị trực tiếp**.
- **Reference** (tham chiếu): `String`, mảng, mọi object — lưu **địa chỉ trỏ tới dữ liệu** (giống object/array trong JS).

```java
int a = 5;          // primitive: a chứa trực tiếp số 5
String s = "hello"; // reference: s trỏ tới đối tượng String
```

Mỗi primitive có một **class bọc ngoài** (wrapper class) để dùng khi cần object:

| Primitive | Wrapper class |
|---|---|
| `int` | `Integer` |
| `double` | `Double` |
| `boolean` | `Boolean` |
| `char` | `Character` |

Wrapper cần thiết khi làm việc với `ArrayList`, `Map`... (chỉ chứa được object, không chứa primitive).

---

## `char`: kiểu không có trong JS

JS không có kiểu ký tự riêng — chuỗi 1 ký tự vẫn là `string`. Java có `char`:

```java
char letter = 'A';   // nháy ĐƠN cho char
String text = "A";   // nháy KÉP cho String
```

> ⚠️ Trong Java, `'A'` (char) và `"A"` (String) là **hai kiểu khác nhau**. Nhầm nháy đơn/kép sẽ lỗi biên dịch.

---

## Bảng ánh xạ kiểu

| JavaScript | Java |
|---|---|
| `number` (nguyên) | `int` / `long` |
| `number` (thực) | `double` / `float` |
| `string` | `String` |
| `boolean` | `boolean` |
| (không có) | `char` |
| `null` / `undefined` | `null` |
| `bigint` | `BigInteger` |
| `object` | class do bạn định nghĩa |
