---
sidebar_position: 3
title: "3. Ép kiểu"
---

# 3. Ép kiểu (Type Casting & Conversion)

:::note[Ghi nhớ nhanh]

- **JS ép kiểu ngầm rất "hào phóng"** (`"5" + 1 === "51"`, `"5" * 1 === 5`). Java **gần như không** ép ngầm giữa các kiểu khác nhóm.
- Java tự ép **số nhỏ → số lớn** (widening: `int → double`), nhưng **số lớn → số nhỏ** phải ép tường minh với `(kiểu)`.
- Đổi giữa `String` và số phải dùng hàm: `Integer.parseInt()`, `String.valueOf()`.
- Không có `truthy`/`falsy` trong Java — điều kiện **bắt buộc** là `boolean`.

:::

---

## Ép kiểu ngầm: JS dễ dãi, Java nghiêm khắc

<table>
<tr><th>JavaScript</th><th>Java</th></tr>
<tr>
<td>

```javascript
"5" + 1   // "51" (nối chuỗi)
"5" * 1   // 5   (thành số)
1 + true  // 2
if ("hi") { } // truthy
```

</td>
<td>

```java
"5" + 1;  // "51" (nối chuỗi — giống JS)
// "5" * 1;  ❌ lỗi biên dịch
// 1 + true; ❌ lỗi biên dịch
// if ("hi") ❌ phải là boolean
```

</td>
</tr>
</table>

Điểm chung duy nhất: toán tử `+` với `String` sẽ **nối chuỗi** ở cả hai. Ngoài ra Java từ chối gần hết các phép ép ngầm "ảo diệu" của JS.

---

## Ép kiểu số

Java **tự động** ép từ kiểu nhỏ sang kiểu lớn hơn (an toàn, không mất dữ liệu):

```java
int i = 10;
double d = i;   // ✅ tự động: int → double (widening)
```

Ngược lại, từ lớn sang nhỏ **phải ép tường minh** vì có thể mất dữ liệu:

```java
double d = 9.99;
int i = (int) d;   // ✅ ép tường minh → i = 9 (cắt phần thập phân)
```

`(int)` phía trước gọi là **cast** (ép kiểu tường minh). JS không cần vì chỉ có một kiểu số.

---

## Chuỗi ↔ Số

Đây là thao tác cực hay dùng. Bên JS bạn quen `Number()`, `parseInt()`, `String()`, template string. Bên Java:

<table>
<tr><th>JavaScript</th><th>Java</th></tr>
<tr>
<td>

```javascript
// String → number
Number("42");      // 42
parseInt("42");    // 42
parseFloat("9.9"); // 9.9

// number → String
String(42);        // "42"
(42).toString();   // "42"
`${42}`;           // "42"
```

</td>
<td>

```java
// String → số
Integer.parseInt("42");    // 42
Double.parseDouble("9.9"); // 9.9

// số → String
String.valueOf(42);        // "42"
Integer.toString(42);      // "42"
"" + 42;                   // "42" (mẹo nối chuỗi)
```

</td>
</tr>
</table>

> ⚠️ `Integer.parseInt("abc")` sẽ **ném ngoại lệ** (throw exception — báo lỗi lúc chạy) `NumberFormatException`, không trả `NaN` như `parseInt` của JS. Bạn phải dùng `try/catch` để xử lý.

---

## Không có truthy/falsy

Trong JS, `if (value)` chấp nhận mọi giá trị. Trong Java, điều kiện **bắt buộc là `boolean`**:

```java
String name = "An";
// if (name) { }        ❌ lỗi: String không phải boolean
if (name != null) { }   // ✅ phải so sánh tường minh
if (!name.isEmpty()) { } // ✅
```

Đây là nguồn lỗi phổ biến khi mới chuyển từ JS. Hãy luôn viết điều kiện rõ ràng thành `boolean`.
