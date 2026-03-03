# Lập trình hướng đối tượng (OOPs) 


---

## Nội dung

1. [Khái niệm về lập trình hướng đối tượng trong Java](#1-khái-niệm-về-lập-trình-hướng-đối-tượng-trong-java)
2. [Đối tượng (Object)](#2-đối-tượng-object)
3. [Lớp (Class)](#3-lớp-class)
4. [Sự khác nhau giữa lớp và đối tượng trong Java](#4-sự-khác-nhau-giữa-lớp-và-đối-tượng-trong-java)
5. [Package](#5-package)
6. [Constructor](#6-constructor)
7. [Phạm vi truy cập (Access modifier)](#7-phạm-vi-truy-cập-access-modifier)

---

## 1. Khái niệm về lập trình hướng đối tượng trong Java

Lập trình hướng đối tượng (**Object Oriented Programming – OOP**) là một phương pháp thiết kế chương trình bằng cách sử dụng **các lớp (class)** và **các đối tượng (object)**.

Java là một ngôn ngữ lập trình hướng đối tượng, vì vậy nó hỗ trợ đầy đủ các đặc tính của lập trình hướng đối tượng:

- Đa hình (Polymorphism)
- Kế thừa (Inheritance)
- Đóng gói (Encapsulation)
- Trừu tượng (Abstraction)

---

## 2. Đối tượng (Object)

Đối tượng là một **thực thể** có **trạng thái** và **hành vi**.  
Nó có thể mang tính **vật lý** hoặc **logic**.

Trong Java:
- Thuộc tính được lưu trữ trong **field**
- Hành vi được thể hiện bằng **method**

---

## 3. Lớp (Class)

Lớp là một **khuôn mẫu (template)** dùng để tạo ra đối tượng.

```java
public class Student {
    private int id;
    private String name;

    public Student(int id) {
        this.id = id;
    }

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
```

---

## 4. Sự khác nhau giữa lớp và đối tượng trong Java

| Đối tượng | Lớp |
|---------|----|
| Là thể hiện của lớp | Là khuôn mẫu |
| Có bộ nhớ | Không cấp bộ nhớ |
| Dùng `new` để tạo | Dùng `class` để khai báo |

---

## 5. Package

**Package** là tập hợp các lớp và interface liên quan.

```java
package com.gpcoder.oop;
```

Lợi ích:
- Quản lý code tốt hơn
- Tránh trùng tên
- Kiểm soát truy cập

---

## 6. Constructor

Constructor là phương thức đặc biệt:
- Trùng tên class
- Không có kiểu trả về
- Gọi khi tạo object

```java
public class Example {
    public Example() {
        System.out.println("Default constructor");
    }
}
```

---

## 7. Phạm vi truy cập (Access modifier)

| Modifier | Trong class | Trong package | Subclass | Mọi nơi |
|--------|------------|--------------|---------|--------|
| private | ✔ | ✘ | ✘ | ✘ |
| default | ✔ | ✔ | ✘ | ✘ |
| protected | ✔ | ✔ | ✔ | ✘ |
| public | ✔ | ✔ | ✔ | ✔ |

---

