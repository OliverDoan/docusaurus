# Tính đóng gói (Encapsulation) 


---

## Nội dung

1. [Khái niệm về tính đóng gói trong Java](#1-khái-niệm-về-tính-đóng-gói-trong-java)
2. [Cách thực hiện đóng gói trong Java](#2-cách-thực-hiện-đóng-gói-trong-java)
3. [Ví dụ về Encapsulation](#3-ví-dụ-về-encapsulation)
4. [Quy ước đặt tên Getter và Setter](#4-quy-ước-đặt-tên-getter-và-setter)
5. [Lợi ích của đóng gói trong Java](#5-lợi-ích-của-đóng-gói-trong-java)
6. [Tổng kết](#6-tổng-kết)

---

## 1. Khái niệm về tính đóng gói trong Java

**Tính đóng gói (Encapsulation)** là một trong **bốn tính chất cơ bản của lập trình hướng đối tượng** trong Java.

Đóng gói là kỹ thuật:
- **Ẩn giấu thông tin không cần thiết**
- **Chỉ hiển thị thông tin cần thiết**

Mục đích chính của đóng gói là **giảm độ phức tạp**, **tăng tính bảo mật** và **dễ bảo trì phần mềm**.

Encapsulation còn được gọi là **data hiding (che giấu dữ liệu)**.

---

## 2. Cách thực hiện đóng gói trong Java

Để đạt được tính đóng gói trong Java, chúng ta cần:

1. Khai báo các biến của lớp là `private`
2. Cung cấp các phương thức `getter` và `setter` là `public`

➡ Nhờ đó, dữ liệu không thể bị truy cập trực tiếp từ bên ngoài class.

---

## 3. Ví dụ về Encapsulation

### Lớp Student

```java
package com.gpcoder.encapsulation;

public class Student {
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
```

### Sử dụng lớp Student

```java
package com.gpcoder.encapsulation;

public class EncapsulationExample {

    public static void main(String[] args) {
        Student s = new Student();
        s.setName("gpcoder.com");
        System.out.println(s.getName());
    }
}
```

### Kết quả

```text
gpcoder.com
```

---

## 4. Quy ước đặt tên Getter và Setter

### Quy ước đặt tên biến

- Chữ cái đầu viết thường
- Các từ tiếp theo viết hoa chữ cái đầu (camelCase)

### Quy ước Getter

```java
public String getFirstName() {
    return firstName;
}
```

### Quy ước Setter

```java
public void setFirstName(String firstName) {
    this.firstName = firstName;
}
```

---

## 5. Lợi ích của đóng gói trong Java

- Có thể tạo field **chỉ đọc** (read-only) hoặc **chỉ ghi** (write-only)
- Class có toàn quyền kiểm soát dữ liệu của mình
- Người dùng class không cần biết cách dữ liệu được lưu trữ
- Có thể thay đổi cách cài đặt bên trong mà **không ảnh hưởng code bên ngoài**

---

## 6. Tổng kết

- Encapsulation = **ẩn dữ liệu + cung cấp interface truy cập**
- Field nên để `private`
- Truy cập thông qua `getter` / `setter`
- Là nền tảng cho **OOP, Java Core, Spring Boot**

