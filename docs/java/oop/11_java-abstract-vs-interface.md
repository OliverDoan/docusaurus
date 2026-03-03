# Abstract Class và Interface


---

## Nội dung

1. [Lớp trừu tượng (Abstract Class) trong Java](#1-lớp-trừu-tượng-abstract-class-trong-java)
2. [Interface trong Java](#2-interface-trong-java)
3. [Đa kế thừa với Interface](#3-đa-kế-thừa-với-interface)
4. [Marker (Tagging) Interface trong Java](#4-marker-tagging-interface-trong-java)
5. [So sánh Abstract Class và Interface](#5-so-sánh-abstract-class-và-interface)
6. [Khi nào dùng Abstract Class? Khi nào dùng Interface?](#6-khi-nào-dùng-abstract-class-khi-nào-dùng-interface)
7. [Tổng kết](#7-tổng-kết)

---

## 1. Lớp trừu tượng (Abstract Class) trong Java

### Đặc điểm

- Được khai báo bằng từ khóa `abstract`
- Có thể chứa **abstract method** và **non-abstract method**
- Không thể khởi tạo trực tiếp object
- Lớp con **bắt buộc override** các abstract method (trừ khi nó cũng là abstract)

### Cú pháp

```java
public abstract class ClassName {
}
```

### Phương thức trừu tượng

```java
public abstract void methodName();
```

### Ví dụ

```java
public abstract class Shape {
    private String color = "red";

    public abstract void draw();

    public String getColor() {
        return color;
    }
}
```

```java
public class Rectangle extends Shape {
    @Override
    public void draw() {
        System.out.println("Draw " + getColor() + " rectangle");
    }
}
```

---

## 2. Interface trong Java

### Đặc điểm

- Tất cả method mặc định là `public abstract`
- Field mặc định là `public static final`
- Không có constructor
- Hỗ trợ **đa kế thừa**
- Java 8+: `default`, `static method`
- Java 9+: `private method`

### Ví dụ

```java
public interface Shape {
    String color = "red";
    void draw();
}
```

```java
public class Circle implements Shape {
    @Override
    public void draw() {
        System.out.println("Draw " + color + " circle");
    }
}
```

---

## 3. Đa kế thừa với Interface

### Class implements nhiều Interface

```java
interface Shape {
    void draw();
}

interface Color {
    String getColor();
}

class Rectangle implements Shape, Color {
    public void draw() {
        System.out.println("Draw " + getColor() + " rectangle");
    }

    public String getColor() {
        return "red";
    }
}
```

### Interface extends nhiều Interface

```java
interface ShapeColor extends Shape, Color {
}
```

---

## 4. Marker (Tagging) Interface trong Java

### Khái niệm

Marker Interface là interface **không chứa method nào**.

Ví dụ:

```java
public interface Serializable {
}
```

### Mục đích

- Cung cấp thông tin cho JVM
- Gắn thêm kiểu dữ liệu cho class
- Ví dụ: `Serializable`, `Cloneable`, `Remote`

---

## 5. So sánh Abstract Class và Interface

| Tiêu chí | Abstract Class | Interface |
|--------|---------------|-----------|
| Mức độ trừu tượng | < 100% | 100% (Java < 8) |
| Đa kế thừa | ❌ | ✔ |
| Constructor | ✔ | ❌ |
| Field | Mọi loại | `public static final` |
| Method có thân | ✔ | Java 8+ |
| Từ khóa | abstract | interface |

---

## 6. Khi nào dùng Abstract Class? Khi nào dùng Interface?

### Dùng Abstract Class khi:
- Có logic chung
- Có trạng thái (field)
- Quan hệ **is-a**

### Dùng Interface khi:
- Xây dựng bộ khung chức năng
- Cần đa kế thừa
- Quan hệ **has-a / can-do**

---

## 7. Tổng kết

- Abstract Class: logic chung + kế thừa
- Interface: hợp đồng hành vi + đa kế thừa
- Cả hai là nền tảng của:
  - OOP
  - Spring Boot
  - Clean Architecture
