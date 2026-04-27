---
sidebar_position: 26
title: "26. Enum trong Java"
---

# Enum trong Java


---

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Nội dung](#nội-dung)
- [1. Khai báo enum](#1-khai-báo-enum)
- [2. Duyệt các phần tử trong enum](#2-duyệt-các-phần-tử-trong-enum)
- [3. Khởi tạo giá trị đặc biệt cho hằng số enum](#3-khởi-tạo-giá-trị-đặc-biệt-cho-hằng-số-enum)
- [4. So sánh các phần tử java enum](#4-so-sánh-các-phần-tử-java-enum)
- [5. Enum có thể sử dụng như tham số trong câu lệnh switch](#5-enum-có-thể-sử-dụng-như-tham-số-trong-câu-lệnh-switch)
- [6. Ghi đè phương thức trong Enum](#6-ghi-đè-phương-thức-trong-enum)
- [7. Phương thức trừu tượng (abstract method) trong Enum](#7-phương-thức-trừu-tượng-abstract-method-trong-enum)
- [8. Enum có thể implement một Interface](#8-enum-có-thể-implement-một-interface)
- [Tổng kết](#tổng-kết)

---

## Giới thiệu
**Enum (Enumeration)** trong Java là một kiểu dữ liệu đặc biệt dùng để **định nghĩa một tập hợp các hằng số cố định**.

Enum giúp:
- Code rõ ràng, dễ đọc
- Tránh lỗi do dùng giá trị magic number / magic string
- Phù hợp với `switch-case`, so sánh, trạng thái

---

## Nội dung

1. [Khai báo enum](#1-khai-báo-enum)  
2. [Duyệt các phần tử trong enum](#2-duyệt-các-phần-tử-trong-enum)  
3. [Khởi tạo giá trị đặc biệt cho hằng số enum](#3-khởi-tạo-giá-trị-đặc-biệt-cho-hằng-số-enum)  
4. [So sánh các phần tử java enum](#4-so-sánh-các-phần-tử-java-enum)  
5. [Enum có thể sử dụng như tham số trong câu lệnh switch](#5-enum-có-thể-sử-dụng-như-tham-số-trong-câu-lệnh-switch)  
6. [Ghi đè phương thức trong Enum](#6-ghi-đè-phương-thức-trong-enum)  
7. [Phương thức trừu tượng (abstract method) trong Enum](#7-phương-thức-trừu-tượng-abstract-method-trong-enum)  
8. [Enum có thể implement một Interface](#8-enum-có-thể-implement-một-interface)  

---

## 1. Khai báo enum

```java
enum Day {
    MONDAY, TUESDAY, WEDNESDAY,
    THURSDAY, FRIDAY, SATURDAY, SUNDAY
}
```

👉 `enum` là một **class đặc biệt** trong Java.

---

## 2. Duyệt các phần tử trong enum

```java
for (Day d : Day.values()) {
    System.out.println(d);
}
```

👉 `values()` trả về mảng các phần tử enum.

---

## 3. Khởi tạo giá trị đặc biệt cho hằng số enum

```java
enum Status {
    SUCCESS(200),
    ERROR(500);

    private int code;

    Status(int code) {
        this.code = code;
    }

    public int getCode() {
        return code;
    }
}
```

---

## 4. So sánh các phần tử java enum

```java
Status s1 = Status.SUCCESS;
Status s2 = Status.ERROR;

s1 == s2;        // false
s1.equals(s2);   // false
```

✔ So sánh enum bằng `==` là **an toàn**.

---

## 5. Enum có thể sử dụng như tham số trong câu lệnh switch

```java
switch (s1) {
    case SUCCESS:
        System.out.println("Thành công");
        break;
    case ERROR:
        System.out.println("Lỗi");
        break;
}
```

👉 Rất phổ biến khi xử lý **trạng thái**.

---

## 6. Ghi đè phương thức trong Enum

```java
enum Operation {
    ADD {
        public int apply(int a, int b) {
            return a + b;
        }
    },
    SUB {
        public int apply(int a, int b) {
            return a - b;
        }
    };

    public abstract int apply(int a, int b);
}
```

---

## 7. Phương thức trừu tượng (abstract method) trong Enum

```java
enum Shape {
    CIRCLE {
        double area(double r) {
            return Math.PI * r * r;
        }
    },
    SQUARE {
        double area(double r) {
            return r * r;
        }
    };

    abstract double area(double r);
}
```

👉 Mỗi enum constant có thể có **hành vi riêng**.

---

## 8. Enum có thể implement một Interface

```java
interface Printable {
    void print();
}

enum Color implements Printable {
    RED {
        public void print() {
            System.out.println("Red");
        }
    },
    BLUE {
        public void print() {
            System.out.println("Blue");
        }
    };
}
```

---

## Tổng kết

- Enum là kiểu dữ liệu **rất mạnh** trong Java
- Enum an toàn hơn hằng số truyền thống
- Có thể có constructor, method, abstract method
- Dùng enum giúp code **clean và dễ bảo trì**
