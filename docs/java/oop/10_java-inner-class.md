---
sidebar_position: 10
title: "10. Inner Class trong Java"
---

# Inner Class trong Java

Hãy tưởng tượng một chiếc **xe hơi** (outer class) có **động cơ** (inner class) bên trong. Động cơ chỉ tồn tại trong ngữ cảnh của xe — không ai dùng động cơ một mình mà không có xe. Tương tự, **inner class** là class được định nghĩa bên trong một class khác, thường phục vụ cho logic nội bộ của outer class.

---


---

## Mục lục

- [1. Inner Class là gì?](#1-inner-class-là-gì)
- [2. Member Inner Class](#2-member-inner-class)
- [3. Static Nested Class](#3-static-nested-class)
- [4. Local Inner Class](#4-local-inner-class)
- [5. Anonymous Inner Class](#5-anonymous-inner-class)
- [6. Lambda thay thế Anonymous Class (Java 8+)](#6-lambda-thay-thế-anonymous-class-java-8)
- [7. So sánh 4 loại Inner Class](#7-so-sánh-4-loại-inner-class)
- [8. Lỗi thường gặp](#8-lỗi-thường-gặp)
- [9. Câu hỏi phỏng vấn](#9-câu-hỏi-phỏng-vấn)

---

## 1. Inner Class là gì?

Inner class là class được khai báo **bên trong** một class khác. Java hỗ trợ 4 loại inner class:

| Loại | Vị trí khai báo | Truy cập outer | Static? |
|---|---|---|---|
| **Member Inner Class** | Trong body của outer class | Có (mọi member) | Không |
| **Static Nested Class** | Trong body, có `static` | Chỉ static members | Có |
| **Local Inner Class** | Trong method | Có + local variables (effectively final) | Không |
| **Anonymous Inner Class** | Trong expression | Có + local variables (effectively final) | Không |

### Tại sao dùng inner class?

- **Nhóm logic liên quan**: Class chỉ dùng trong ngữ cảnh của outer class
- **Encapsulation tốt hơn**: Ẩn class khỏi bên ngoài
- **Truy cập dễ dàng**: Inner class truy cập được private members của outer
- **Code gọn hơn**: Không cần tạo file riêng cho class phụ

---

## 2. Member Inner Class

Member inner class là class thông thường được khai báo bên trong outer class (không có `static`). Nó **cần một instance của outer class** để tồn tại.

```java
class Car {
    private String brand = "Toyota";
    private int speed = 0;

    // Member inner class
    class Engine {
        private int horsepower;

        Engine(int horsepower) {
            this.horsepower = horsepower;
        }

        void start() {
            // Truy cập được private field của outer class!
            System.out.println(brand + " engine khởi động với " + horsepower + " HP");
            speed = 10; // Có thể thay đổi field của outer
        }
    }

    void showSpeed() {
        System.out.println("Tốc độ: " + speed + " km/h");
    }
}
```

### Tạo instance

```java
public class Main {
    public static void main(String[] args) {
        // Phải có outer instance trước
        Car car = new Car();

        // Tạo inner instance thông qua outer instance
        Car.Engine engine = car.new Engine(150);
        engine.start();    // Toyota engine khởi động với 150 HP
        car.showSpeed();   // Tốc độ: 10 km/h
    }
}
```

**Lưu ý cú pháp:** `car.new Engine(150)` — phải dùng outer instance để tạo inner instance.

---

## 3. Static Nested Class

Static nested class có từ khóa `static`, **không cần** outer instance và **chỉ truy cập được static members** của outer class.

```java
class University {
    private static String name = "Bach Khoa";
    private int ranking = 1; // non-static

    // Static nested class
    static class Department {
        private String deptName;

        Department(String deptName) {
            this.deptName = deptName;
        }

        void display() {
            System.out.println(name + " - Khoa " + deptName); // OK — name là static
            // System.out.println(ranking); // Lỗi! ranking là non-static
        }
    }
}
```

### Tạo instance

```java
// Không cần outer instance!
University.Department dept = new University.Department("CNTT");
dept.display(); // Bach Khoa - Khoa CNTT
```

### Khi nào dùng Static Nested Class?

- Class phụ **không cần** truy cập non-static members của outer
- Muốn **nhóm logic** liên quan (ví dụ: `Map.Entry` là static nested class trong `Map`)
- Builder pattern: `Student.Builder` thường là static nested class

```java
// Ví dụ Builder pattern
class Student {
    private String name;
    private int age;

    private Student(Builder builder) {
        this.name = builder.name;
        this.age = builder.age;
    }

    // Static nested class — Builder
    static class Builder {
        private String name;
        private int age;

        Builder setName(String name) { this.name = name; return this; }
        Builder setAge(int age) { this.age = age; return this; }
        Student build() { return new Student(this); }
    }

    @Override
    public String toString() { return name + " (" + age + ")"; }
}

// Sử dụng
Student s = new Student.Builder()
    .setName("An")
    .setAge(20)
    .build();
System.out.println(s); // An (20)
```

---

## 4. Local Inner Class

Local inner class được khai báo **bên trong method**. Nó chỉ tồn tại trong scope của method đó.

```java
class Calculator {
    void calculate(int a, int b) {
        // Local inner class — chỉ tồn tại trong method này
        class Addition {
            int add() {
                return a + b; // Truy cập local variables (effectively final)
            }
        }

        Addition addition = new Addition();
        System.out.println("Kết quả: " + addition.add());
    }
}
```

```java
Calculator calc = new Calculator();
calc.calculate(5, 3); // Kết quả: 8
// Không thể truy cập Addition từ bên ngoài method
```

**Lưu ý:** Local inner class chỉ truy cập được local variables là **effectively final** (không thay đổi giá trị sau khi gán).

```java
void demo() {
    int x = 10;
    // x = 20; ← Nếu uncomment, local inner class không dùng được x!

    class Inner {
        void show() {
            System.out.println(x); // OK vì x là effectively final
        }
    }
}
```

---

## 5. Anonymous Inner Class

Anonymous inner class là class **không có tên**, được khai báo và khởi tạo cùng lúc. Đây là loại inner class **phổ biến nhất** trong thực tế.

### Implement Interface

```java
interface Greeting {
    void greet(String name);
}

public class Main {
    public static void main(String[] args) {
        // Anonymous inner class — implement Greeting ngay tại chỗ
        Greeting hello = new Greeting() {
            @Override
            public void greet(String name) {
                System.out.println("Xin chào, " + name + "!");
            }
        };

        hello.greet("An"); // Xin chào, An!
    }
}
```

### Extend Class

```java
abstract class Animal {
    abstract void sound();
}

Animal cat = new Animal() {
    @Override
    void sound() {
        System.out.println("Meo meo!");
    }
};

cat.sound(); // Meo meo!
```

### Ứng dụng phổ biến

```java
// 1. Comparator
List<String> names = Arrays.asList("Binh", "An", "Cuong");
Collections.sort(names, new Comparator<String>() {
    @Override
    public int compare(String a, String b) {
        return a.compareTo(b);
    }
});

// 2. Runnable (Threading)
Thread thread = new Thread(new Runnable() {
    @Override
    public void run() {
        System.out.println("Đang chạy trong thread mới");
    }
});
thread.start();

// 3. Event listener (Swing/Android)
button.addActionListener(new ActionListener() {
    @Override
    public void actionPerformed(ActionEvent e) {
        System.out.println("Button được click!");
    }
});
```

---

## 6. Lambda thay thế Anonymous Class (Java 8+)

Với **functional interface** (interface chỉ có 1 abstract method), Lambda expression ngắn gọn hơn nhiều:

```java
// Anonymous inner class
Comparator<String> comp1 = new Comparator<String>() {
    @Override
    public int compare(String a, String b) {
        return a.compareTo(b);
    }
};

// Lambda (Java 8+) — tương đương nhưng ngắn hơn
Comparator<String> comp2 = (a, b) -> a.compareTo(b);

// Runnable
Runnable r1 = new Runnable() {
    @Override
    public void run() {
        System.out.println("Hello");
    }
};

Runnable r2 = () -> System.out.println("Hello");
```

### Khi nào dùng Lambda, khi nào dùng Anonymous Class?

| Tiêu chí | Lambda | Anonymous Class |
|---|---|---|
| **Functional interface** (1 method) | Dùng Lambda | Cũng được, nhưng dài hơn |
| **Interface có nhiều methods** | Không dùng được | Dùng anonymous class |
| **Cần truy cập `this` của anonymous** | Không (`this` trỏ về enclosing class) | Có (`this` trỏ về anonymous instance) |
| **Extend abstract class** | Không dùng được | Dùng anonymous class |
| **Code phức tạp (nhiều dòng)** | Nên dùng named class | Dùng được nhưng khó đọc |

---

## 7. So sánh 4 loại Inner Class

| Tiêu chí | Member Inner | Static Nested | Local Inner | Anonymous |
|---|---|---|---|---|
| **Vị trí** | Trong class | Trong class | Trong method | Trong expression |
| **Có `static`?** | Không | Có | Không | Không |
| **Cần outer instance?** | Có | Không | Có (ngầm) | Có (ngầm) |
| **Truy cập outer members** | Tất cả | Chỉ static | Tất cả | Tất cả |
| **Truy cập local vars** | N/A | N/A | Effectively final | Effectively final |
| **Có tên?** | Có | Có | Có | Không |
| **Tạo nhiều instance?** | Có | Có | Có | Thường chỉ 1 |
| **Dùng phổ biến** | Ít | Builder, Entry | Rất ít | Rất phổ biến |

---

## 8. Lỗi thường gặp

### Lỗi 1: Tạo member inner class không có outer instance

```java
class Outer {
    class Inner {
        void hello() { System.out.println("Hi"); }
    }
}

// SAI
// Outer.Inner inner = new Outer.Inner(); // Lỗi!

// ĐÚNG
Outer outer = new Outer();
Outer.Inner inner = outer.new Inner();
```

### Lỗi 2: Thay đổi local variable trong anonymous class

```java
void demo() {
    int count = 0;

    Runnable r = new Runnable() {
        @Override
        public void run() {
            // count++; // Lỗi compile! count phải effectively final
            System.out.println(count);
        }
    };

    // count = 5; // Nếu uncomment → biến count không còn effectively final
}

// ĐÚNG — Dùng mảng hoặc AtomicInteger nếu cần thay đổi
void demo() {
    int[] count = {0}; // Mảng là reference, reference không đổi

    Runnable r = () -> {
        count[0]++; // OK! Thay đổi giá trị trong mảng, không thay đổi reference
        System.out.println(count[0]);
    };
}
```

### Lỗi 3: Nhầm `this` trong Lambda vs Anonymous Class

```java
class Outer {
    String name = "Outer";

    void demo() {
        // Anonymous class: this trỏ về anonymous instance
        Runnable r1 = new Runnable() {
            String name = "Anonymous";
            @Override
            public void run() {
                System.out.println(this.name); // "Anonymous"
            }
        };

        // Lambda: this trỏ về enclosing class (Outer)
        Runnable r2 = () -> {
            System.out.println(this.name); // "Outer"
        };

        r1.run(); // Anonymous
        r2.run(); // Outer
    }
}
```

---

## 9. Câu hỏi phỏng vấn

### Câu 1: Java có mấy loại inner class? Kể tên và khác biệt chính.

**Trả lời:** Java có 4 loại: (1) **Member inner class** — khai báo trong class, cần outer instance, truy cập mọi member. (2) **Static nested class** — có `static`, không cần outer instance, chỉ truy cập static members. (3) **Local inner class** — khai báo trong method, truy cập local variables effectively final. (4) **Anonymous inner class** — không có tên, khai báo và khởi tạo cùng lúc, thường dùng với interface có 1 method.

### Câu 2: Tại sao local variable phải effectively final trong inner class?

**Trả lời:** Vì local variables sống trên **stack** và bị hủy khi method kết thúc, nhưng inner class object có thể sống lâu hơn trên **heap**. Java copy giá trị local variable vào inner class (closure). Nếu local variable thay đổi sau khi copy, giá trị trong inner class sẽ không khớp — gây inconsistency. Nên Java bắt buộc local variable phải effectively final để đảm bảo tính nhất quán.

### Câu 3: Static nested class khác member inner class thế nào?

**Trả lời:** Static nested class có `static`, **không cần** outer instance để tạo (`new Outer.StaticNested()`), và chỉ truy cập **static members** của outer. Member inner class **cần** outer instance (`outer.new Inner()`), và truy cập được **tất cả members** (cả private non-static) của outer. Static nested class giống top-level class nhưng được đặt trong outer class để nhóm logic.

### Câu 4: Lambda expression có thể thay thế hoàn toàn anonymous class không?

**Trả lời:** **Không.** Lambda chỉ thay thế anonymous class khi implement **functional interface** (interface có đúng 1 abstract method). Lambda không thể: (1) extend abstract class, (2) implement interface có nhiều abstract methods, (3) có state (fields) riêng, (4) dùng `this` để trỏ đến chính nó (Lambda's `this` trỏ về enclosing class).

### Câu 5: `Map.Entry` trong Java là loại inner class nào? Tại sao?

**Trả lời:** `Map.Entry` là **static nested interface** (tương tự static nested class). Nó là `static` vì không cần truy cập non-static members của `Map` — `Entry` chỉ cần key và value của riêng nó. Nó được đặt trong `Map` vì `Entry` chỉ có ý nghĩa trong ngữ cảnh của `Map`. Cú pháp: `Map.Entry<K, V>` — tạo instance không cần `Map` instance.
