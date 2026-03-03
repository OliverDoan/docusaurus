# Java Inner Class


---

## Nội dung

1. [Giới thiệu Inner Class](#1-giới-thiệu-inner-class)
2. [Member Inner Class](#2-member-inner-class)
3. [Anonymous Inner Class](#3-anonymous-inner-class)
4. [Local Inner Class](#4-local-inner-class)
5. [Static Nested Class](#5-static-nested-class)
6. [Interface lồng nhau (Nested Interface)](#6-interface-lồng-nhau-nested-interface)
7. [Tổng kết](#7-tổng-kết)

---

## 1. Giới thiệu Inner Class

**Lớp lồng nhau (Inner Class)** trong Java là một lớp được khai báo bên trong **class** hoặc **interface** khác.

### Mục đích sử dụng
- Nhóm các class/interface có liên quan về logic
- Giúp code dễ đọc, dễ bảo trì
- Có thể truy cập **tất cả thành viên của outer class**, kể cả `private`

### Cú pháp

```java
class OuterClass {
    class InnerClass {
    }
}
```

### Ưu điểm
- Truy cập được member `private` của outer class
- Giảm số lượng class độc lập
- Code gọn và rõ ràng hơn

---

## 2. Member Inner Class

### Khái niệm
- Là lớp **non-static**
- Được khai báo trong class, ngoài method

### Ví dụ

```java
class MemberOuterExample {
    private int data = 30;

    class Inner {
        void msg() {
            System.out.println("data is " + data);
        }
    }

    public static void main(String[] args) {
        MemberOuterExample obj = new MemberOuterExample();
        MemberOuterExample.Inner in = obj.new Inner();
        in.msg();
    }
}
```

### Kết quả

```text
data is 30
```

📌 Trình biên dịch tạo file: `Outer$Inner.class`

---

## 3. Anonymous Inner Class

### Khái niệm
- Lớp **không có tên**
- Dùng để:
  - `extends` class
  - `implements` interface
- Thường dùng khi override **1 phương thức**

---

### Anonymous Inner Class với class

```java
abstract class Person {
    abstract void eat();
}

class TestAnonymousInner {
    public static void main(String[] args) {
        Person p = new Person() {
            void eat() {
                System.out.println("nice fruits");
            }
        };
        p.eat();
    }
}
```

---

### Anonymous Inner Class với interface

```java
interface Eatable {
    void eat();
}

class TestAnonymousInner1 {
    public static void main(String[] args) {
        Eatable e = new Eatable() {
            public void eat() {
                System.out.println("nice fruits");
            }
        };
        e.eat();
    }
}
```

📌 Compiler tự sinh class: `Outer$1.class`

---

## 4. Local Inner Class

### Khái niệm
- Được khai báo **bên trong method**
- Chỉ sử dụng được trong method đó

### Ví dụ

```java
class LocalInnerExample {
    private int data = 30;

    void display() {
        class Local {
            void msg() {
                System.out.println(data);
            }
        }
        Local l = new Local();
        l.msg();
    }

    public static void main(String[] args) {
        new LocalInnerExample().display();
    }
}
```

### Quy tắc
- Không có access modifier
- Trước Java 8: chỉ truy cập biến `final`
- Java 8+: biến phải **effectively final**

---

## 5. Static Nested Class

### Khái niệm
- Class `static` bên trong class khác
- Không truy cập được member **non-static**

### Ví dụ

```java
class TestOuter {
    static int data = 30;

    static class Inner {
        void msg() {
            System.out.println("data is " + data);
        }
    }

    public static void main(String[] args) {
        TestOuter.Inner obj = new TestOuter.Inner();
        obj.msg();
    }
}
```

📌 Không cần tạo object outer class

---

## 6. Interface lồng nhau (Nested Interface)

### Nested Interface trong Interface

```java
interface Showable {
    void show();

    interface Message {
        void msg();
    }
}

class TestNestedInterface1 implements Showable.Message {
    public void msg() {
        System.out.println("Hello nested interface");
    }

    public static void main(String[] args) {
        Showable.Message m = new TestNestedInterface1();
        m.msg();
    }
}
```

---

### Nested Interface trong Class

```java
class A {
    interface Message {
        void msg();
    }
}

class TestNestedInterface2 implements A.Message {
    public void msg() {
        System.out.println("Hello nested interface");
    }
}
```

📌 Nested interface:
- Mặc định là `static`
- Trong interface: **bắt buộc public**
- Trong class: có thể dùng mọi access modifier

---

## 7. Tổng kết

- Inner Class giúp code **gọn, logic, dễ bảo trì**
- Các loại Inner Class:
  - Member Inner Class
  - Anonymous Inner Class
  - Local Inner Class
  - Static Nested Class
  - Nested Interface
- Được dùng nhiều trong:
  - Event handling
  - Callback
  - Framework (Spring, JavaFX)

