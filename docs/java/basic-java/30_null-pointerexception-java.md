# Error NullPointerException

## Giới thiệu
**NullPointerException (NPE)** là một trong những lỗi runtime **phổ biến nhất và nguy hiểm nhất** trong Java.  
Lỗi này xảy ra khi chương trình cố gắng truy cập:
- Method
- Field
- Object

trên một **tham chiếu null**.

Tài liệu này tổng hợp các **cách hiệu quả để tránh NullPointerException**, đúng theo nội dung bài GP Coder.

---

## Nội dung

1. [Return giá trị](#1-return-giá-trị)  
2. [Luôn kiểm tra NULL trước khi sử dụng](#2-luôn-kiểm-tra-null-trước-khi-sử-dụng)  
3. [Kiểm tra Null-safe](#3-kiểm-tra-null-safe)  
4. [Hạn chế sử dụng multi-dot syntax](#4-hạn-chế-sử-dụng-multi-dot-syntax)  
5. [Khởi tạo giá trị trước khi sử dụng](#5-khởi-tạo-giá-trị-trước-khi-sử-dụng)  
6. [Sử dụng tính năng mới trong Java 8 – Optional](#6-sử-dụng-tính-năng-mới-trong-java-8--optional)  

---

## 1. Return giá trị

Thay vì return `null`, hãy return:
- Object rỗng
- Collection rỗng

```java
public List<String> getNames() {
    return Collections.emptyList();
}
```

✔ Giảm nguy cơ NPE  
✔ Code an toàn hơn

---

## 2. Luôn kiểm tra NULL trước khi sử dụng

```java
if (user != null) {
    user.print();
}
```

👉 Đây là cách **đơn giản nhất** nhưng dễ bị quên.

---

## 3. Kiểm tra Null-safe

### So sánh chuỗi an toàn

```java
"admin".equals(role);
```

❌ Tránh:

```java
role.equals("admin");
```

---

## 4. Hạn chế sử dụng multi-dot syntax

❌ Dễ gây NPE:

```java
order.getCustomer().getAddress().getCity();
```

✔ Nên tách nhỏ:

```java
Customer c = order.getCustomer();
if (c != null) {
    Address a = c.getAddress();
    if (a != null) {
        System.out.println(a.getCity());
    }
}
```

---

## 5. Khởi tạo giá trị trước khi sử dụng

```java
List<String> list = new ArrayList<>();
```

❌ Tránh:

```java
List<String> list;
list.add("A"); // NPE
```

---

## 6. Sử dụng tính năng mới trong Java 8 – Optional

```java
Optional<User> userOpt = Optional.ofNullable(user);

userOpt.ifPresent(u -> u.print());
```

✔ Code rõ ràng  
✔ Hạn chế NPE  
✔ Best practice Java hiện đại

---

## Tổng kết

- NullPointerException là lỗi rất phổ biến
- Không return null nếu có thể
- Luôn null-check khi cần
- Ưu tiên dùng Optional trong Java 8+
- Viết code phòng thủ giúp hệ thống ổn định hơn
