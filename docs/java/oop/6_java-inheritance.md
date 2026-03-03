# Tính kế thừa (Inheritance) 

---

## Nội dung

1. [Tính kế thừa là gì?](#1-tính-kế-thừa-là-gì)
2. [Các kiểu kế thừa trong Java](#2-các-kiểu-kế-thừa-trong-java)
3. [Một số câu hỏi liên quan đến tính kế thừa trong Java](#3-một-số-câu-hỏi-liên-quan-đến-tính-kế-thừa-trong-java)

---

## 1. Tính kế thừa là gì?

**Tính kế thừa (Inheritance)** là một trong **bốn tính chất cơ bản của lập trình hướng đối tượng (OOP)** trong Java.

Kế thừa thể hiện mối quan hệ giữa:
- **Class cha (Superclass)**
- **Class con (Subclass)**

Class con:
- Kế thừa **thuộc tính (field)** và **phương thức (method)** của class cha
- Chỉ truy cập được thành viên `public` và `protected`
- **Không truy cập được** thành viên `private` của class cha

Mục tiêu của kế thừa:
- Tái sử dụng code
- Mở rộng chức năng
- Hỗ trợ đa hình (Polymorphism)

Java sử dụng từ khóa `extends` để thể hiện kế thừa.

### Cú pháp

```java
class Super {
}

class Sub extends Super {
}
```

### Ví dụ

```java
public class Employee {
    protected float salary = 40000;
}

public class Programmer extends Employee {
    int bonus = 10000;

    public static void main(String args[]) {
        Programmer p = new Programmer();
        System.out.println("Programmer salary is: " + p.salary);
        System.out.println("Bonus of Programmer is: " + p.bonus);
    }
}
```

---

## 2. Các kiểu kế thừa trong Java

Trong Java có **3 kiểu kế thừa chính**:

### 2.1 Thừa kế đơn (Single Inheritance)

```java
class Animal {
    public void eat() {
        System.out.println("eating...");
    }
}

class Dog extends Animal {
    public void bark() {
        System.out.println("barking...");
    }
}

public class TestInheritance {
    public static void main(String args[]) {
        Dog d = new Dog();
        d.bark();
        d.eat();
    }
}
```

**Kết quả**

```text
barking...
eating...
```

---

### 2.2 Thừa kế nhiều cấp (Multilevel Inheritance)

```java
class Animal {
    public void eat() {
        System.out.println("eating...");
    }
}

class Dog extends Animal {
    public void bark() {
        System.out.println("barking...");
    }
}

class BabyDog extends Dog {
    public void weep() {
        System.out.println("weeping...");
    }
}

public class TestInheritance2 {
    public static void main(String args[]) {
        BabyDog d = new BabyDog();
        d.weep();
        d.bark();
        d.eat();
    }
}
```

**Kết quả**

```text
weeping...
barking...
eating...
```

---

### 2.3 Thừa kế thứ bậc (Hierarchical Inheritance)

```java
class Animal {
    public void eat() {
        System.out.println("eating...");
    }
}

class Dog extends Animal {
    public void bark() {
        System.out.println("barking...");
    }
}

class Cat extends Animal {
    public void meow() {
        System.out.println("meowing...");
    }
}

public class TestInheritance3 {
    public static void main(String args[]) {
        Cat c = new Cat();
        c.meow();
        c.eat();
    }
}
```

**Kết quả**

```text
meowing...
eating...
```

---

### ❌ Đa kế thừa (Multiple Inheritance) với class

Java **không hỗ trợ đa kế thừa bằng class** để tránh sự mơ hồ khi gọi phương thức.

Ví dụ không hợp lệ:

```java
class Printable {
    void print() {
        System.out.println("Printable");
    }
}

class Showable {
    void print() {
        System.out.println("Showable");
    }
}

// Lỗi biên dịch
public class MultiHeritanceExample extends Printable, Showable {
}
```

➡ Java cho phép **implements nhiều interface** nhưng **extends chỉ một class**.

---

## 3. Một số câu hỏi liên quan đến tính kế thừa trong Java

### ❓ Tại sao sử dụng kế thừa trong Java?

- Tăng khả năng tái sử dụng code
- Hỗ trợ ghi đè phương thức (Method Overriding)
- Tạo nền tảng cho đa hình runtime

---

### ❓ Tại sao Java không hỗ trợ đa kế thừa bằng class?

- Tránh sự phức tạp
- Tránh lỗi mơ hồ khi gọi method
- Lỗi compile-time tốt hơn runtime error

---

## Tổng kết

- Kế thừa giúp **tái sử dụng và mở rộng code**
- Java hỗ trợ:
  - Single
  - Multilevel
  - Hierarchical inheritance
- Không hỗ trợ multiple inheritance với class
- Dùng `extends` cho class, `implements` cho interface

