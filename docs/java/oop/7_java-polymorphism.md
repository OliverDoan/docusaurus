# Tính đa hình (Polymorphism)


---

## Nội dung

1. [Tính đa hình là gì?](#1-tính-đa-hình-là-gì)
2. [Đa hình tại runtime trong Java](#2-đa-hình-tại-runtime-trong-java)
3. [Đa hình với thành viên dữ liệu](#3-đa-hình-với-thành-viên-dữ-liệu)
4. [Đa hình với kế thừa nhiều tầng](#4-đa-hình-với-kế-thừa-nhiều-tầng)
5. [Nạp chồng phương thức (Method Overloading)](#5-nạp-chồng-phương-thức-method-overloading)
6. [Ghi đè phương thức (Method Overriding)](#6-ghi-đè-phương-thức-method-overriding)
7. [So sánh Overloading và Overriding](#7-so-sánh-overloading-và-overriding)
8. [Tổng kết](#8-tổng-kết)

---

## 1. Tính đa hình là gì?

**Tính đa hình (Polymorphism)** là một trong **bốn tính chất cơ bản của lập trình hướng đối tượng** trong Java.

Đa hình là khả năng một đối tượng có thể **thực hiện một hành vi theo nhiều cách khác nhau**.

Trong Java, đa hình được thể hiện rõ nhất thông qua:
- **Nạp chồng phương thức (Method Overloading)**
- **Ghi đè phương thức (Method Overriding)**

---

## 2. Đa hình tại runtime trong Java

Đa hình tại runtime xảy ra khi **phương thức bị ghi đè** được gọi thông qua **biến tham chiếu của lớp cha**.

### Upcasting là gì?

Upcasting xảy ra khi biến tham chiếu của lớp cha trỏ tới đối tượng của lớp con.

```java
class A {}
class B extends A {}

A a = new B(); // upcasting
```

### Ví dụ

```java
class Bike {
    void run() {
        System.out.println("running");
    }
}

class Splender extends Bike {
    void run() {
        System.out.println("running safely with 60km");
    }

    public static void main(String[] args) {
        Bike b = new Splender();
        b.run();
    }
}
```

**Kết quả**

```text
running safely with 60km
```

---

## 3. Đa hình với thành viên dữ liệu

📌 **Đa hình runtime không áp dụng cho thành viên dữ liệu (field)**.

```java
class Bike {
    int speedlimit = 90;
}

class Honda extends Bike {
    int speedlimit = 150;

    public static void main(String[] args) {
        Bike obj = new Honda();
        System.out.println(obj.speedlimit); // 90
    }
}
```

---

## 4. Đa hình với kế thừa nhiều tầng

```java
class Animal {
    void eat() {
        System.out.println("eating");
    }
}

class Dog extends Animal {
    void eat() {
        System.out.println("eating fruits");
    }
}

class BabyDog extends Dog {
    void eat() {
        System.out.println("drinking milk");
    }

    public static void main(String[] args) {
        Animal a1 = new Animal();
        Animal a2 = new Dog();
        Animal a3 = new BabyDog();

        a1.eat();
        a2.eat();
        a3.eat();
    }
}
```

---

## 5. Nạp chồng phương thức (Method Overloading)

Nạp chồng phương thức là việc **một lớp có nhiều phương thức cùng tên** nhưng:
- Khác số lượng tham số
- Hoặc khác kiểu dữ liệu tham số

### Ví dụ

```java
class Adder {
    static int add(int a, int b) {
        return a + b;
    }

    static int add(int a, int b, int c) {
        return a + b + c;
    }
}
```

📌 Overloading xảy ra tại **compile-time**.

---

## 6. Ghi đè phương thức (Method Overriding)

Ghi đè phương thức xảy ra khi **lớp con cài đặt lại phương thức của lớp cha**.

### Quy tắc ghi đè

- Cùng tên phương thức
- Cùng danh sách tham số
- Có quan hệ kế thừa

### Ví dụ

```java
class Vehicle {
    void run() {
        System.out.println("Vehicle is running");
    }
}

class Bike extends Vehicle {
    void run() {
        System.out.println("Bike is running safely");
    }
}
```

📌 Overriding xảy ra tại **runtime**.

---

## 7. So sánh Overloading và Overriding

| Tiêu chí | Overloading | Overriding |
|--------|-------------|-----------|
| Thời điểm | Compile-time | Runtime |
| Quan hệ | Cùng class | Cha – Con |
| Tham số | Phải khác | Phải giống |
| Static | Có thể | Không thể |
| Tính đa hình | Biên dịch | Thực thi |

---

## 8. Tổng kết

- Đa hình giúp code **linh hoạt và mở rộng**
- Overloading → đa hình lúc biên dịch
- Overriding → đa hình lúc runtime
- Field **không** tham gia đa hình runtime

