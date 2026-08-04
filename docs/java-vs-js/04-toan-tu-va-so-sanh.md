---
sidebar_position: 4
title: "4. Toán tử & so sánh"
---

# 4. Toán tử & so sánh (Operators & Equality)

:::note[Ghi nhớ nhanh]

- **Cạm bẫy lớn nhất khi chuyển từ JS:** trong Java, `==` so sánh **địa chỉ object**, không so sánh nội dung. Muốn so nội dung phải dùng **`.equals()`**.
- Với **primitive** (`int`, `double`, `boolean`), `==` so sánh giá trị — dùng bình thường.
- Java **không có `===`** vì đã có kiểu tĩnh, không cần phân biệt "so sánh có ép kiểu" hay không.
- Toán tử logic `&&`, `||`, `!` giống hệt JS (kể cả short-circuit — ngắn mạch).
- Java **không có** `??`, `?.` (optional chaining) như JS hiện đại.

:::

---

## `==` — điểm khác biệt nguy hiểm nhất

Với **số** thì giống JS. Nhưng với **object (String, mảng...)**, `==` so sánh **tham chiếu** chứ không so nội dung:

```java
String a = new String("hello");
String b = new String("hello");

a == b;        // ❌ false! (hai object khác địa chỉ)
a.equals(b);   // ✅ true  (so sánh nội dung)
```

<table>
<tr><th>JavaScript</th><th>Java</th></tr>
<tr>
<td>

```javascript
"hello" === "hello"  // true
[1] === [1]          // false (khác reference)
```

</td>
<td>

```java
"hello".equals("hello") // true ✅
// dùng .equals cho MỌI object
```

</td>
</tr>
</table>

> 🔑 **Quy tắc vàng:** so sánh primitive → dùng `==`. So sánh object → dùng `.equals()`. Quên quy tắc này là lỗi kinh điển của mọi dev JS mới học Java.

---

## Vì sao đôi khi `==` với String lại "đúng"?

```java
String a = "hello";
String b = "hello";
a == b;   // true (?!)
```

Java có cơ chế **String pool** (bể chứa chuỗi — tái dùng chuỗi ký tự giống nhau), nên hai literal `"hello"` có thể trỏ cùng một object. Nhưng **đừng dựa vào điều này** — luôn dùng `.equals()` cho chắc chắn.

---

## So sánh và toán tử số học

Các toán tử này **giống hệt JS**:

| Nhóm | Toán tử |
|---|---|
| Số học | `+  -  *  /  %` |
| So sánh | `<  >  <=  >=` |
| Logic | `&&  ||  !` (có short-circuit) |
| Gán gọn | `+=  -=  *=  ++  --` |

> ⚠️ **Chia số nguyên:** `7 / 2` trong Java = `3` (không phải `3.5`)! Vì cả hai là `int`, kết quả cũng là `int`. Muốn ra `3.5` phải có ít nhất một số thực: `7.0 / 2`. JS luôn ra `3.5` vì chỉ có một kiểu số.

---

## Những thứ JS có mà Java (bản cũ) không có

```javascript
// JavaScript
const name = user?.name;          // optional chaining
const port = config.port ?? 8080; // nullish coalescing
```

Java **không có** `?.` và `??`. Bạn phải kiểm tra `null` thủ công hoặc dùng `Optional` (xem [bài 11](./11-xu-ly-null.md)):

```java
String name = (user != null) ? user.getName() : null;
int port = (config.getPort() != null) ? config.getPort() : 8080;
```

Toán tử `? :` (ternary — ba ngôi) thì giống hệt JS.
