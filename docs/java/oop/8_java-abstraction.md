# Tính trừu tượng (Abstraction)


---

## Nội dung

1. [Tính trừu tượng là gì?](#1-tính-trừu-tượng-là-gì)
2. [Mục đích của tính trừu tượng](#2-mục-đích-của-tính-trừu-tượng)
3. [Cách实现 tính trừu tượng trong Java](#3-cách-thực-hiện-tính-trừu-tượng-trong-java)
4. [Abstract Class trong Java](#4-abstract-class-trong-java)
5. [Interface trong Java](#5-interface-trong-java)
6. [So sánh Abstract Class và Interface](#6-so-sánh-abstract-class-và-interface)
7. [Tổng kết](#7-tổng-kết)

---

## 1. Tính trừu tượng là gì?

**Tính trừu tượng (Abstraction)** là một trong **bốn tính chất cơ bản của lập trình hướng đối tượng (OOP)** trong Java.

Trừu tượng là **tiến trình ẩn đi các chi tiết cài đặt** và **chỉ hiển thị các hành vi cần thiết** tới người sử dụng.

👉 Người dùng **biết đối tượng làm gì**, nhưng **không cần biết nó làm như thế nào**.

---

## 2. Mục đích của tính trừu tượng

Tính trừu tượng giúp:

- Giảm độ phức tạp của hệ thống
- Tập trung vào **cốt lõi của đối tượng**
- Tăng khả năng mở rộng
- Giảm sự phụ thuộc giữa các thành phần

📌 Lập trình viên chỉ cần làm việc với **interface / abstract**, không phụ thuộc chi tiết triển khai.

---

## 3. Cách thực hiện tính trừu tượng trong Java

Trong Java, trừu tượng được thực hiện thông qua:

- **Abstract Class**
- **Interface**

📎 Chi tiết hơn sẽ được trình bày ở bài: *Abstract class và Interface trong Java*.

---

## 4. Abstract Class trong Java

### Khái niệm

- Abstract class được khai báo bằng từ khóa `abstract`
- Có thể chứa:
  - Phương thức abstract (không có thân)
  - Phương thức thường (có thân)
- Không thể tạo object trực tiếp

### Ví dụ

```java
abstract class Shape {
    abstract void draw();

    void display() {
        System.out.println("Displaying shape");
    }
}

class Circle extends Shape {
    void draw() {
        System.out.println("Drawing circle");
    }
}
```

📌 Abstract class phù hợp khi:
- Có hành vi chung
- Có trạng thái (field)
- Có logic dùng chung

---

## 5. Interface trong Java

### Khái niệm

- Interface là **hợp đồng hành vi**
- Chỉ chứa phương thức abstract (Java 8+ có default, static)
- Một class có thể `implements` nhiều interface

### Ví dụ

```java
interface Drawable {
    void draw();
}

class Rectangle implements Drawable {
    public void draw() {
        System.out.println("Drawing rectangle");
    }
}
```

📌 Interface phù hợp khi:
- Thiết kế hệ thống lớn
- Áp dụng đa kế thừa hành vi
- Dùng trong Spring, Microservices

---

## 6. So sánh Abstract Class và Interface

| Tiêu chí | Abstract Class | Interface |
|--------|----------------|-----------|
| Từ khóa | abstract | interface |
| Đa kế thừa | ❌ | ✔ |
| Constructor | ✔ | ❌ |
| Field | Có | public static final |
| Method có thân | ✔ | Java 8+ |
| Khi dùng | Có logic chung | Hợp đồng hành vi |

---

## 7. Tổng kết

- Trừu tượng giúp **giảm phức tạp**
- Ẩn chi tiết, lộ hành vi
- Dùng **Abstract Class** hoặc **Interface**
- Là nền tảng của:
  - OOP nâng cao
  - Spring Boot
  - Clean Architecture

