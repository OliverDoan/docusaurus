---
sidebar_position: 5
title: "5. Chuỗi (String)"
---

# 5. Chuỗi (String)

:::note[Ghi nhớ nhanh]

- **String ở cả hai đều bất biến** (immutable — không sửa được, mọi thao tác tạo chuỗi mới).
- Java **chỉ dùng nháy kép** `"..."` cho String; nháy đơn `'...'` dành cho `char`.
- Java **không có template literal** `` `${...}` `` — dùng `+` hoặc `String.format()`/`"...".formatted()`.
- Nối chuỗi nhiều lần trong vòng lặp nên dùng **`StringBuilder`** để tránh chậm.
- Tên hàm khác nhau: `length` (JS, thuộc tính) vs `length()` (Java, method).

:::

---

## Tạo chuỗi & nối chuỗi

<table>
<tr><th>JavaScript</th><th>Java</th></tr>
<tr>
<td>

```javascript
const name = "An";
const age = 25;
const msg = `Tôi là ${name}, ${age} tuổi`;
const msg2 = "Tôi là " + name;
```

</td>
<td>

```java
String name = "An";
int age = 25;
String msg = "Tôi là %s, %d tuổi".formatted(name, age);
String msg2 = "Tôi là " + name;
```

</td>
</tr>
</table>

Java không có `` `${}` ``. Hai cách thay thế:

```java
// Cách 1: nối bằng +
String s = "Tôi là " + name + ", " + age + " tuổi";

// Cách 2: format (giống printf trong C)
String s2 = String.format("Tôi là %s, %d tuổi", name, age);
String s3 = "Tôi là %s, %d tuổi".formatted(name, age); // Java 15+
```

> `%s` = chuỗi, `%d` = số nguyên, `%f` = số thực. Đây là **placeholder** (chỗ giữ chỗ) sẽ được thay bằng giá trị.

---

## Các thao tác thường dùng — bảng đối chiếu

| Việc cần làm | JavaScript | Java |
|---|---|---|
| Độ dài | `s.length` | `s.length()` |
| Chữ hoa | `s.toUpperCase()` | `s.toUpperCase()` |
| Chữ thường | `s.toLowerCase()` | `s.toLowerCase()` |
| Lấy ký tự tại vị trí | `s[0]` / `s.charAt(0)` | `s.charAt(0)` |
| Cắt chuỗi con | `s.slice(1, 4)` | `s.substring(1, 4)` |
| Chứa chuỗi? | `s.includes("x")` | `s.contains("x")` |
| Bắt đầu bằng? | `s.startsWith("x")` | `s.startsWith("x")` |
| Tách chuỗi | `s.split(",")` | `s.split(",")` |
| Bỏ khoảng trắng | `s.trim()` | `s.trim()` / `s.strip()` |
| Thay thế | `s.replace("a","b")` | `s.replace("a","b")` |
| Vị trí ký tự | `s.indexOf("x")` | `s.indexOf("x")` |

Nhiều tên trùng nhau. Khác biệt lớn nhất: **`length` là thuộc tính bên JS nhưng là method `length()` bên Java** (nhớ dấu ngoặc).

---

## So sánh chuỗi

Nhắc lại từ [bài 4](./04-toan-tu-va-so-sanh.md) vì rất quan trọng:

```java
String a = "hello";
// a == "hello"       ❌ ĐỪNG dùng == cho String
a.equals("hello");    // ✅ so sánh nội dung
a.equalsIgnoreCase("HELLO"); // ✅ không phân biệt hoa/thường
```

---

## StringBuilder — khi nối chuỗi trong vòng lặp

Vì String **bất biến**, mỗi lần `+` là tạo chuỗi mới → chậm nếu lặp nhiều. Java có `StringBuilder` (tương tự việc `push` vào mảng rồi `join` trong JS):

<table>
<tr><th>JavaScript</th><th>Java</th></tr>
<tr>
<td>

```javascript
const parts = [];
for (let i = 0; i < 1000; i++) {
  parts.push(i);
}
const result = parts.join("");
```

</td>
<td>

```java
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 1000; i++) {
    sb.append(i);
}
String result = sb.toString();
```

</td>
</tr>
</table>
