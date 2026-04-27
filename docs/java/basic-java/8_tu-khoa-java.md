---
sidebar_position: 8
title: "8. Từ khóa trong Java"
---

# Từ khóa trong Java

**Từ khóa (Keyword)** trong Java là những từ đã được ngôn ngữ Java **đặt trước** với ý nghĩa riêng. Bạn **không được phép** dùng chúng để đặt tên biến, tên phương thức, tên class hay bất kỳ định danh nào.

Hãy hình dung từ khóa giống như **biển báo giao thông**: mỗi biển có ý nghĩa cố định mà ai cũng phải tuân theo. Bạn không thể tự ý thay đổi ý nghĩa của biển "Cấm rẽ trái" -- tương tự, bạn không thể dùng từ `class` hay `int` làm tên biến trong Java.

Java hiện có khoảng **50 từ khóa**. Lưu ý: `true`, `false`, `null` **không phải là keyword** mà là **literal** (giá trị hằng).

---


---

## Mục lục

- [Nội dung](#nội-dung)
- [1. Nhóm Access Modifier (Phạm vi truy cập)](#1-nhóm-access-modifier-phạm-vi-truy-cập)
- [2. Nhóm khai báo Class/Interface](#2-nhóm-khai-báo-classinterface)
- [3. Nhóm kiểu dữ liệu](#3-nhóm-kiểu-dữ-liệu)
- [4. Nhóm điều khiển luồng (Control Flow)](#4-nhóm-điều-khiển-luồng-control-flow)
- [5. Nhóm xử lý ngoại lệ (Exception)](#5-nhóm-xử-lý-ngoại-lệ-exception)
- [6. Nhóm Modifier khác](#6-nhóm-modifier-khác)
- [7. Nhóm từ khóa khác](#7-nhóm-từ-khóa-khác)
- [8. Từ khóa reserved nhưng không dùng](#8-từ-khóa-reserved-nhưng-không-dùng)
- [9. Khi nào dùng?](#9-khi-nào-dùng)
- [10. Lỗi thường gặp](#10-lỗi-thường-gặp)
- [11. Câu hỏi phỏng vấn](#11-câu-hỏi-phỏng-vấn)

---

## Nội dung

1. [Nhóm Access Modifier](#1-nhóm-access-modifier-phạm-vi-truy-cập)
2. [Nhóm khai báo Class/Interface](#2-nhóm-khai-báo-classinterface)
3. [Nhóm kiểu dữ liệu](#3-nhóm-kiểu-dữ-liệu)
4. [Nhóm điều khiển luồng (Control Flow)](#4-nhóm-điều-khiển-luồng-control-flow)
5. [Nhóm xử lý ngoại lệ (Exception)](#5-nhóm-xử-lý-ngoại-lệ-exception)
6. [Nhóm Modifier khác](#6-nhóm-modifier-khác)
7. [Nhóm từ khóa khác](#7-nhóm-từ-khóa-khác)
8. [Từ khóa reserved nhưng không dùng](#8-từ-khóa-reserved-nhưng-không-dùng)
9. [Khi nào dùng?](#9-khi-nào-dùng)
10. [Lỗi thường gặp](#10-lỗi-thường-gặp)
11. [Câu hỏi phỏng vấn](#11-câu-hỏi-phỏng-vấn)

---

## 1. Nhóm Access Modifier (Phạm vi truy cập)

Các từ khóa kiểm soát ai được phép truy cập thành phần nào trong chương trình.

| Từ khóa | Phạm vi truy cập |
|---------|-----------------|
| `public` | Truy cập từ **mọi nơi** |
| `protected` | Truy cập trong **cùng package** và **class con** (subclass) |
| `private` | Chỉ truy cập trong **chính class đó** |
| *(không ghi)* | **Default** -- chỉ truy cập trong **cùng package** |

```java
public class Student {
    public String name;       // Truy cập từ mọi nơi
    protected int age;        // Cùng package + subclass
    private String password;  // Chỉ trong class Student
    String school;            // Default: chỉ trong cùng package

    public String getName() {
        return this.name;
    }

    private void secretMethod() {
        // Chỉ gọi được bên trong class Student
    }
}
```

---

## 2. Nhóm khai báo Class/Interface

| Từ khóa | Ý nghĩa |
|---------|---------|
| `class` | Khai báo một lớp |
| `interface` | Khai báo một interface (chỉ định nghĩa hành vi) |
| `enum` | Khai báo kiểu liệt kê |
| `extends` | Kế thừa từ lớp cha |
| `implements` | Triển khai interface |
| `abstract` | Khai báo lớp/phương thức trừu tượng |
| `new` | Tạo đối tượng mới |
| `this` | Tham chiếu đến đối tượng hiện tại |
| `super` | Tham chiếu đến lớp cha |

```java
// Khai báo interface
interface Drivable {
    void drive();
}

// Khai báo abstract class
abstract class Vehicle {
    abstract void start();

    void stop() {
        System.out.println("Vehicle stopped");
    }
}

// Kế thừa class + triển khai interface
class Car extends Vehicle implements Drivable {
    @Override
    void start() {
        System.out.println("Car started");
    }

    @Override
    public void drive() {
        System.out.println("Car is driving");
    }
}

// Khai báo enum
enum Color {
    RED, GREEN, BLUE
}

public class KeywordClassDemo {
    public static void main(String[] args) {
        Car car = new Car(); // new: tạo đối tượng
        car.start();
        car.drive();
        car.stop();

        Color color = Color.RED;
        System.out.println(color); // RED
    }
}
```

---

## 3. Nhóm kiểu dữ liệu

| Từ khóa | Ý nghĩa |
|---------|---------|
| `byte` | Số nguyên 8-bit (-128 đến 127) |
| `short` | Số nguyên 16-bit |
| `int` | Số nguyên 32-bit |
| `long` | Số nguyên 64-bit |
| `float` | Số thực 32-bit |
| `double` | Số thực 64-bit |
| `char` | Ký tự Unicode 16-bit |
| `boolean` | Giá trị logic (`true` / `false`) |
| `void` | Phương thức không trả về giá trị |

```java
public class DataTypeKeywords {
    public static void main(String[] args) {
        byte b = 100;
        short s = 30000;
        int i = 2_000_000;
        long l = 9_000_000_000L;
        float f = 3.14f;
        double d = 3.141592653589793;
        char c = 'A';
        boolean isActive = true;

        System.out.println("byte: " + b);
        System.out.println("int: " + i);
        System.out.println("boolean: " + isActive);
    }

    // void: không trả về giá trị
    static void sayHello() {
        System.out.println("Hello!");
    }
}
```

---

## 4. Nhóm điều khiển luồng (Control Flow)

| Từ khóa | Ý nghĩa |
|---------|---------|
| `if` | Điều kiện nếu |
| `else` | Nhánh ngược lại của `if` |
| `switch` | Rẽ nhánh theo giá trị |
| `case` | Một nhánh trong `switch` |
| `default` | Nhánh mặc định trong `switch` |
| `for` | Vòng lặp `for` |
| `while` | Vòng lặp `while` |
| `do` | Vòng lặp `do-while` |
| `break` | Thoát khỏi vòng lặp hoặc `switch` |
| `continue` | Bỏ qua lần lặp hiện tại, sang lần lặp tiếp |
| `return` | Trả về giá trị và kết thúc phương thức |

```java
public class ControlFlowKeywords {
    public static void main(String[] args) {
        // if - else
        int score = 85;
        if (score >= 80) {
            System.out.println("Giỏi");
        } else {
            System.out.println("Chưa giỏi");
        }

        // switch - case - default
        int day = 3;
        switch (day) {
            case 1: System.out.println("Thứ Hai"); break;
            case 2: System.out.println("Thứ Ba"); break;
            case 3: System.out.println("Thứ Tư"); break;
            default: System.out.println("Ngày khác");
        }

        // for loop với break và continue
        for (int i = 1; i <= 10; i++) {
            if (i == 3) continue; // Bỏ qua số 3
            if (i == 8) break;    // Dừng khi i = 8
            System.out.print(i + " ");
        }
        // Output: 1 2 4 5 6 7
    }

    // return: trả về giá trị
    static int add(int a, int b) {
        return a + b;
    }
}
```

---

## 5. Nhóm xử lý ngoại lệ (Exception)

| Từ khóa | Ý nghĩa |
|---------|---------|
| `try` | Bao khối code có thể xảy ra lỗi |
| `catch` | Bắt và xử lý ngoại lệ |
| `finally` | Luôn chạy dù có ngoại lệ hay không (thường dùng để dọn dẹp tài nguyên) |
| `throw` | Ném ra một ngoại lệ |
| `throws` | Khai báo phương thức có thể ném ngoại lệ |

```java
public class ExceptionKeywords {
    // throws: khai báo method có thể ném exception
    static int divide(int a, int b) throws ArithmeticException {
        if (b == 0) {
            throw new ArithmeticException("Không thể chia cho 0");
        }
        return a / b;
    }

    public static void main(String[] args) {
        // try - catch - finally
        try {
            int result = divide(10, 0);
            System.out.println("Kết quả: " + result);
        } catch (ArithmeticException e) {
            System.out.println("Lỗi: " + e.getMessage());
        } finally {
            System.out.println("Khối finally luôn chạy");
        }
        // Output:
        // Lỗi: Không thể chia cho 0
        // Khối finally luôn chạy
    }
}
```

---

## 6. Nhóm Modifier khác

| Từ khóa | Ý nghĩa |
|---------|---------|
| `static` | Thuộc về **class**, không cần tạo object để truy cập |
| `final` | **Không thể thay đổi**: biến hằng, method không override, class không kế thừa |
| `abstract` | Lớp/phương thức trừu tượng, chưa có triển khai |
| `synchronized` | Đồng bộ hóa trong đa luồng (chỉ 1 thread truy cập tại một thời điểm) |
| `volatile` | Biến luôn đọc từ bộ nhớ chính (main memory), không cache |
| `transient` | Biến không được lưu khi serialize đối tượng |
| `native` | Phương thức được triển khai bằng ngôn ngữ khác (C/C++) qua JNI |
| `strictfp` | Đảm bảo phép tính float point nhất quán trên mọi nền tảng |

```java
public class ModifierKeywords {
    // static: thuộc về class
    static int count = 0;

    // final: hằng số, không thay đổi được
    static final double PI = 3.14159265358979;

    // transient: không serialize
    transient String tempData = "temporary";

    public static void main(String[] args) {
        // Truy cập static không cần tạo object
        ModifierKeywords.count++;
        System.out.println("Count: " + ModifierKeywords.count);
        System.out.println("PI: " + PI);

        // final biến không thay đổi được
        final int maxRetry = 3;
        // maxRetry = 5; // Lỗi biên dịch! Cannot assign a value to final variable
    }

    // synchronized: đồng bộ hóa
    synchronized void safeMethod() {
        // Chỉ 1 thread truy cập tại 1 thời điểm
    }
}
```

---

## 7. Nhóm từ khóa khác

| Từ khóa | Ý nghĩa |
|---------|---------|
| `package` | Khai báo package chứa class |
| `import` | Nhập class từ package khác |
| `instanceof` | Kiểm tra object có thuộc kiểu nào |
| `assert` | Kiểm tra điều kiện (thường dùng trong debug/test) |

```java
package com.example.demo; // Khai báo package

import java.util.ArrayList; // Import class cụ thể
import java.util.List;

public class OtherKeywords {
    public static void main(String[] args) {
        // instanceof
        Object obj = "Hello";
        if (obj instanceof String) {
            System.out.println("obj là String");
        }

        // assert (chạy với flag -ea)
        int age = 25;
        assert age > 0 : "Tuổi phải dương";
    }
}
```

---

## 8. Từ khóa reserved nhưng không dùng

Java có **2 từ khóa dành riêng** nhưng **chưa bao giờ được sử dụng** trong bất kỳ phiên bản nào:

| Từ khóa | Ghi chú |
|---------|---------|
| `goto` | Tồn tại trong C/C++, Java giữ lại nhưng **không dùng** (tránh code khó đọc) |
| `const` | Tương tự `final`, Java giữ lại nhưng **không dùng** (dùng `final` thay thế) |

```java
// Cả hai đều gây lỗi biên dịch nếu dùng làm tên biến
// int goto = 5;   // Lỗi!
// int const = 10; // Lỗi!

// Dùng final thay cho const
final int MAX_SIZE = 100;
```

---

## 9. Khi nào dùng?

### Bảng tóm tắt theo nhóm

| Khi muốn | Dùng từ khóa |
|----------|--------------|
| Kiểm soát ai truy cập được | `public`, `private`, `protected` |
| Tạo class/interface | `class`, `interface`, `abstract`, `enum` |
| Kế thừa và triển khai | `extends`, `implements` |
| Rẽ nhánh, vòng lặp | `if`, `else`, `switch`, `for`, `while`, `do`, `break`, `continue` |
| Xử lý lỗi | `try`, `catch`, `finally`, `throw`, `throws` |
| Biến/method dùng chung cho cả class | `static` |
| Giá trị không đổi | `final` |
| Lập trình đa luồng | `synchronized`, `volatile` |

**Best practices**:
- Luôn dùng **access modifier rõ ràng** (`public`, `private`, `protected`) thay vì để mặc định.
- Dùng `final` cho hằng số và biến không nên thay đổi.
- Dùng `static` cho tiện ích dùng chung không cần trạng thái riêng.
- Tổ chức code vào `package` hợp lý.

---

## 10. Lỗi thường gặp

### Lỗi 1: Dùng từ khóa làm tên biến

```java
// ❌ Sai: dùng keyword làm tên biến
// int class = 5;       // Lỗi biên dịch!
// String static = "a"; // Lỗi biên dịch!
// boolean new = true;  // Lỗi biên dịch!

// ✅ Đúng: đặt tên biến có ý nghĩa, không trùng keyword
int classCount = 5;
String staticText = "a";
boolean isNew = true;
```

### Lỗi 2: Nhầm `final` không thể thay đổi object bên trong

```java
// ❌ Sai hiểu: final nghĩa là object không thay đổi
final List<String> names = new ArrayList<>();
// names = new ArrayList<>(); // Lỗi! Không thể gán lại reference

// ✅ Đúng hiểu: final chỉ giữ reference không đổi, nội dung vẫn thay đổi được
names.add("Alice");   // OK!
names.add("Bob");     // OK!
System.out.println(names); // [Alice, Bob]
```

### Lỗi 3: Nhầm `throw` và `throws`

```java
// ❌ Sai: dùng throws bên trong method body
// void test() {
//     throws new Exception("error"); // Lỗi cú pháp!
// }

// ✅ Đúng: throw ném exception, throws khai báo ở chữ ký method
void test() throws Exception {     // throws: khai báo
    throw new Exception("error");  // throw: ném exception
}
```

### Lỗi 4: Quên break trong switch-case

```java
// ❌ Sai: thiếu break, gây "fall-through"
int day = 1;
switch (day) {
    case 1: System.out.println("Thứ Hai");
    case 2: System.out.println("Thứ Ba");
    case 3: System.out.println("Thứ Tư");
}
// Output: Thứ Hai, Thứ Ba, Thứ Tư (chạy cả 3!)

// ✅ Đúng: thêm break sau mỗi case
switch (day) {
    case 1: System.out.println("Thứ Hai"); break;
    case 2: System.out.println("Thứ Ba"); break;
    case 3: System.out.println("Thứ Tư"); break;
}
// Output: Thứ Hai
```

---

## 11. Câu hỏi phỏng vấn

### Q1: `final` vs `finally` vs `finalize` -- khác nhau thế nào?

**A**: Ba từ tuy giống tên nhưng hoàn toàn khác mục đích:

| Từ khóa | Loại | Ý nghĩa |
|---------|------|---------|
| `final` | Keyword (modifier) | Biến không gán lại, method không override, class không kế thừa |
| `finally` | Keyword (exception) | Khối code luôn chạy sau try-catch, dù có lỗi hay không |
| `finalize()` | Method (Object class) | Được GC gọi trước khi thu hồi object (deprecated từ Java 9) |

```java
// final: hằng số
final int MAX = 100;

// finally: luôn chạy
try {
    int x = 10 / 0;
} catch (Exception e) {
    System.out.println("Lỗi!");
} finally {
    System.out.println("Luôn chạy"); // Luôn in ra
}

// finalize: GC gọi trước khi xóa object (không nên dùng)
// @Override
// protected void finalize() throws Throwable { ... }
```

---

### Q2: `static` có thể dùng ở đâu?

**A**: `static` có thể dùng ở 4 vị trí:

1. **Static variable**: biến dùng chung cho tất cả object của class.
2. **Static method**: gọi trực tiếp qua class mà không cần tạo object.
3. **Static block**: khối khởi tạo chạy một lần khi class được load.
4. **Static inner class**: class bên trong không cần reference đến class bên ngoài.

```java
public class StaticDemo {
    static int count = 0;           // 1. Static variable

    static {                         // 3. Static block
        System.out.println("Class được load");
    }

    static void increment() {       // 2. Static method
        count++;
    }

    static class Helper {           // 4. Static inner class
        void help() {
            System.out.println("Helping...");
        }
    }
}
```

Lưu ý: static method **không thể** truy cập trực tiếp instance variable hoặc gọi instance method.

---

### Q3: `abstract` class khác `interface` thế nào?

**A**:

| Tiêu chí | Abstract class | Interface |
|----------|---------------|-----------|
| Khai báo | `abstract class` | `interface` |
| Method có body | Có thể có | Chỉ có default/static method (Java 8+) |
| Constructor | Có | Không |
| Biến | Mọi loại | Chỉ `public static final` |
| Kế thừa | Chỉ extends **1** class | Implements **nhiều** interface |
| Khi nào dùng | Chia sẻ code chung giữa các class liên quan | Định nghĩa "hợp đồng" hành vi cho class không liên quan |

---

### Q4: `volatile` là gì? Khi nào dùng?

**A**: `volatile` đảm bảo rằng mọi thread đều **đọc giá trị mới nhất** của biến từ **main memory** thay vì dùng bản cache riêng của mỗi thread.

Dùng khi: biến được **nhiều thread đọc/ghi** và bạn muốn đảm bảo **visibility** (tính nhìn thấy được) giữa các thread.

```java
class SharedFlag {
    volatile boolean running = true; // volatile đảm bảo thread khác thấy thay đổi

    void stop() {
        running = false; // Thread A ghi
    }

    void run() {
        while (running) { // Thread B đọc - luôn thấy giá trị mới nhất
            // làm việc
        }
    }
}
```

Lưu ý: `volatile` chỉ đảm bảo visibility, **không đảm bảo atomicity**. Nếu cần cả hai (ví dụ `count++`), dùng `synchronized` hoặc `AtomicInteger`.

---

### Q5: Tại sao Java có `goto` nhưng không cho dùng?

**A**: Java giữ `goto` là từ khóa reserved để **ngăn lập trình viên dùng nó**. Trong C/C++, `goto` cho phép nhảy đến bất kỳ đâu trong code, dẫn đến "spaghetti code" cực kỳ khó đọc và bảo trì. Java thay thế `goto` bằng các cấu trúc an toàn hơn như `break`, `continue`, `return`, và labeled break/continue.
