# Mệnh đề switch – case

## 1. Giới thiệu
Trong Java, **mệnh đề switch – case** là một cấu trúc điều khiển luồng, dùng để **so sánh một giá trị với nhiều nhánh khác nhau**.  
Nó thường được sử dụng khi có **nhiều lựa chọn rẽ nhánh rõ ràng**, thay thế cho chuỗi `if – else if` dài.

Có thể hình dung `switch – case` giống như:
- Một **bảng chọn kênh TV**
- Bạn chọn số kênh → chương trình tương ứng sẽ chạy

---

## Nội dung

1. [Giới thiệu](#1-giới-thiệu)  
2. [Cú pháp cơ bản](#2-cú-pháp-cơ-bản)  
3. [Ví dụ đơn giản](#3-ví-dụ-đơn-giản)  
4. [Tại sao cần break?](#4-tại-sao-cần-break)  
5. [Case gộp (Multiple case)](#5-case-gộp-multiple-case)  
6. [Kiểu dữ liệu dùng trong switch](#6-kiểu-dữ-liệu-dùng-trong-switch)  
7. [switch với enum](#7-switch-với-enum)  
8. [switch expression (Java 12+)](#8-switch-expression-java-12)  
9. [Lỗi thường gặp](#9-lỗi-thường-gặp)  
10. [So sánh switch – case và if – else](#10-so-sánh-switch--case-và-if--else)  
11. [Khi nào nên dùng switch – case?](#11-khi-nào-nên-dùng-switch--case)  
12. [Tổng kết](#12-tổng-kết)  

---

## 2. Cú pháp cơ bản

```java
switch (expression) {
    case value1:
        // code
        break;
    case value2:
        // code
        break;
    default:
        // code mặc định
}
```

Trong đó:
- `expression`: biểu thức cần so sánh
- `case`: các giá trị cụ thể
- `break`: kết thúc nhánh
- `default`: chạy khi không khớp case nào

---

## 3. Ví dụ đơn giản

```java
int day = 3;

switch (day) {
    case 1:
        System.out.println("Thứ Hai");
        break;
    case 2:
        System.out.println("Thứ Ba");
        break;
    case 3:
        System.out.println("Thứ Tư");
        break;
    default:
        System.out.println("Ngày không hợp lệ");
}
```

---

## 4. Tại sao cần break?

Nếu **không có `break`**, chương trình sẽ chạy **xuyên qua các case bên dưới** (fall-through):

```java
int x = 1;

switch (x) {
    case 1:
        System.out.println("One");
    case 2:
        System.out.println("Two");
    default:
        System.out.println("Done");
}
```

👉 Kết quả:
```
One
Two
Done
```

---

## 5. Case gộp (Multiple case)

```java
int month = 2;

switch (month) {
    case 1:
    case 2:
    case 3:
        System.out.println("Quý 1");
        break;
    case 4:
    case 5:
    case 6:
        System.out.println("Quý 2");
        break;
    default:
        System.out.println("Không xác định");
}
```

---

## 6. Kiểu dữ liệu dùng trong switch

Java hỗ trợ `switch` với:
- `byte`, `short`, `int`, `char`
- `enum`
- `String` (từ Java 7)
- Wrapper class (Byte, Integer, Character...)

❌ Không hỗ trợ:
- `float`, `double`
- `boolean`

Ví dụ với `String`:

```java
String role = "admin";

switch (role) {
    case "admin":
        System.out.println("Quản trị viên");
        break;
    case "user":
        System.out.println("Người dùng");
        break;
    default:
        System.out.println("Khách");
}
```

---

## 7. switch với enum

```java
enum Level {
    LOW, MEDIUM, HIGH
}

Level level = Level.HIGH;

switch (level) {
    case LOW:
        System.out.println("Mức thấp");
        break;
    case MEDIUM:
        System.out.println("Mức trung bình");
        break;
    case HIGH:
        System.out.println("Mức cao");
        break;
}
```

---

## 8. switch expression (Java 12+)

```java
int day = 2;

String result = switch (day) {
    case 1, 2, 3 -> "Đầu tuần";
    case 4, 5 -> "Giữa tuần";
    case 6, 7 -> "Cuối tuần";
    default -> "Không hợp lệ";
};
```

✔ Ngắn gọn, an toàn hơn  
✔ Không cần `break`

---

## 9. Lỗi thường gặp

### ❌ Quên break
- Dẫn đến fall-through ngoài ý muốn

### ❌ Trùng case
```java
case 1:
case 1: // lỗi biên dịch
```

### ❌ Kiểu dữ liệu không hỗ trợ
```java
double x = 1.5;
switch (x) { } // lỗi
```

---

## 10. So sánh switch – case và if – else

| switch – case | if – else |
|--------------|----------|
| Gọn gàng khi nhiều lựa chọn | Linh hoạt |
| Dễ đọc với giá trị rời rạc | Xử lý điều kiện phức tạp |
| Hạn chế kiểu dữ liệu | Không giới hạn |

---

## 11. Khi nào nên dùng switch – case?

- So sánh **một biến với nhiều giá trị cụ thể**
- Menu, lựa chọn, trạng thái
- Tránh chuỗi `if – else if` dài

---

## 12. Tổng kết

- `switch – case` giúp code **rõ ràng và dễ bảo trì**
- Luôn chú ý `break`
- Có thể dùng **switch expression** trong Java mới

