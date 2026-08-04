---
sidebar_position: 11
title: "11. Xử lý null"
---

# 11. Xử lý null (Null Handling)

:::note[Ghi nhớ nhanh]

- Java **chỉ có `null`**, không có `undefined` như JS.
- `null` chỉ áp dụng cho **kiểu tham chiếu** (String, object, mảng); primitive (`int`, `boolean`) **không thể** là `null`.
- Gọi method trên `null` → **`NullPointerException`** (NPE) — "ác mộng" kinh điển của Java, tương tự `Cannot read property of undefined` bên JS.
- Java **không có** `?.` và `??` — phải kiểm tra `null` thủ công.
- **`Optional`** (Java 8+) là cách hiện đại để diễn đạt "có thể không có giá trị".

:::

---

## `null` vs `undefined`

JS phân biệt hai loại "rỗng": `undefined` (chưa gán) và `null` (cố ý rỗng). Java gộp làm một — chỉ có `null`:

```java
String name = null;      // ✅ hợp lệ cho kiểu tham chiếu
// int age = null;       ❌ lỗi: primitive không nhận null
Integer age = null;      // ✅ wrapper class thì được
```

> Nhớ lại [bài 2](./02-kieu-du-lieu.md): `int` là primitive (không null được), `Integer` là wrapper class (null được). Đây là lý do đôi khi ta chọn `Integer` thay vì `int`.

---

## NullPointerException — "Cannot read property" của Java

<table>
<tr><th>JavaScript</th><th>Java</th></tr>
<tr>
<td>

```javascript
const user = null;
user.name;
// TypeError: Cannot read
// property 'name' of null
```

</td>
<td>

```java
User user = null;
user.getName();
// NullPointerException
```

</td>
</tr>
</table>

Cùng một loại lỗi, tên khác nhau. Cách phòng tránh cũng tương tự: kiểm tra trước khi dùng.

---

## Không có `?.` và `??`

JS hiện đại có optional chaining và nullish coalescing rất tiện:

```javascript
const city = user?.address?.city ?? "Không rõ";
```

Java **không có** cú pháp này. Bạn phải viết tường minh:

```java
String city = "Không rõ";
if (user != null && user.getAddress() != null) {
    city = user.getAddress().getCity();
}
```

---

## Optional — cách hiện đại của Java

`Optional<T>` là một "hộp" có thể chứa giá trị hoặc rỗng, buộc người dùng xử lý trường hợp rỗng một cách tường minh:

```java
Optional<User> maybeUser = findUserById(1);

// Lấy giá trị, hoặc dùng mặc định nếu rỗng
User user = maybeUser.orElse(defaultUser);

// Chỉ chạy khi có giá trị (giống ?. )
maybeUser.ifPresent(u -> System.out.println(u.getName()));

// Biến đổi giá trị nếu có (giống ?. + map)
String name = maybeUser
    .map(User::getName)
    .orElse("Khách");
```

So sánh trực tiếp với JS:

<table>
<tr><th>JavaScript</th><th>Java Optional</th></tr>
<tr>
<td>

```javascript
const name = user?.name ?? "Khách";
```

</td>
<td>

```java
String name = maybeUser
    .map(User::getName)
    .orElse("Khách");
```

</td>
</tr>
</table>

> Quy ước tốt: dùng `Optional` làm **kiểu trả về** cho hàm có thể không tìm thấy kết quả (thay vì trả `null`), để người gọi buộc phải xử lý. Đừng lạm dụng `Optional` cho field trong class.

---

## Nguyên tắc thực dụng

1. Ưu tiên trả `Optional` thay vì `null` cho hàm "tìm kiếm".
2. Kiểm tra `null` ngay tại **ranh giới** (đầu vào hàm, dữ liệu từ ngoài).
3. Với chuỗi hằng, viết `"hello".equals(x)` thay vì `x.equals("hello")` để không NPE khi `x` là `null`.
