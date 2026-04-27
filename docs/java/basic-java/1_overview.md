---
sidebar_position: 1
title: "1. Tổng quan về Java"
---

# Tổng quan về Java

Java là một trong những ngôn ngữ lập trình phổ biến nhất thế giới, được sử dụng rộng rãi từ phát triển ứng dụng Android, web backend với Spring Boot, đến Big Data và IoT. Nếu bạn mới bắt đầu học lập trình, hãy tưởng tượng Java như một **ngôn ngữ quốc tế** trong thế giới máy tính -- viết một lần, chạy được ở mọi nơi (Write Once, Run Anywhere). Bài này sẽ giúp bạn hiểu Java là gì, lịch sử hình thành, các đặc điểm nổi bật và quy trình biên dịch của Java.

---


---

## Mục lục

- [1. Java là gì?](#1-java-là-gì)
- [2. Lịch sử hình thành](#2-lịch-sử-hình-thành)
- [3. Các đặc điểm nổi bật của Java](#3-các-đặc-điểm-nổi-bật-của-java)
- [4. Các nền tảng Java](#4-các-nền-tảng-java)
- [5. Quy trình biên dịch và thực thi](#5-quy-trình-biên-dịch-và-thực-thi)
- [6. Ứng dụng thực tế của Java](#6-ứng-dụng-thực-tế-của-java)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Java là gì?

Java là **ngôn ngữ lập trình hướng đối tượng** (Object-Oriented Programming - OOP), được thiết kế để **đơn giản, an toàn và độc lập nền tảng**.

```java
public class XinChao {
    public static void main(String[] args) {
        System.out.println("Xin chao, toi la Java!");
    }
}
```

Chương trình này in ra màn hình dòng chữ `Xin chao, toi la Java!`. Đây là chương trình Java đơn giản nhất mà bạn sẽ gặp.

---

## 2. Lịch sử hình thành

| Mốc thời gian | Sự kiện |
|---------------|---------|
| **1991** | **James Gosling** và nhóm kỹ sư tại **Sun Microsystems** bắt đầu phát triển. Tên ban đầu là **Oak** |
| **1995** | Đổi tên thành **Java**, phát hành phiên bản đầu tiên |
| **2006** | Sun Microsystems phát hành Java dưới giấy phép mã nguồn mở |
| **2010** | **Oracle** mua lại Sun Microsystems, Java thuộc về Oracle |
| **Hiện nay** | Java liên tục cập nhật (6 tháng/phiên bản), phiên bản mới nhất là Java 21+ (LTS) |

---

## 3. Các đặc điểm nổi bật của Java

### 3.1. Độc lập nền tảng (Platform Independent - WORA)

Đây là đặc điểm quan trọng nhất của Java. Code Java được biên dịch thành **bytecode**, và bytecode này chạy trên **JVM** (Java Virtual Machine). Bất kỳ máy tính nào có JVM đều chạy được chương trình Java.

```
Mã nguồn (.java) --> Compiler (javac) --> Bytecode (.class) --> JVM --> Máy tính
```

**Ví dụ thực tế:** Bạn viết một ứng dụng trên Windows. File `.class` đó có thể mang sang macOS hoặc Linux và chạy bình thường mà không cần sửa code.

### 3.2. Hướng đối tượng (Object-Oriented Programming)

Mọi thứ trong Java đều xoay quanh **đối tượng (object)** và **lớp (class)**. Java hỗ trợ đầy đủ 4 tính chất OOP:

- **Đóng gói (Encapsulation):** Ẩn dữ liệu bên trong đối tượng
- **Kế thừa (Inheritance):** Lớp con kế thừa từ lớp cha
- **Đa hình (Polymorphism):** Cùng một hành vi nhưng ứng xử khác nhau
- **Trừu tượng (Abstraction):** Ẩn chi tiết, chỉ hiển thị những gì cần thiết

```java
public class DongVat {
    String ten;

    public void keu() {
        System.out.println("...");
    }
}

public class Cho extends DongVat {
    @Override
    public void keu() {
        System.out.println("Gau gau!");
    }
}

public class Meo extends DongVat {
    @Override
    public void keu() {
        System.out.println("Meo meo!");
    }
}
```

### 3.3. Thu gom rác tự động (Garbage Collection)

Java **tự động giải phóng bộ nhớ** khi đối tượng không còn được sử dụng. Lập trình viên không cần giải phóng bộ nhớ thủ công như C/C++.

```java
public class GarbageCollectionDemo {
    public static void main(String[] args) {
        String s1 = new String("Hello");
        s1 = null; // Object "Hello" khong con ai tham chieu --> GC se thu hoi
        System.gc(); // Goi de nghi GC chay (khong dam bao chay ngay)
    }
}
```

### 3.4. An toàn và bảo mật (Secure)

- Không sử dụng **con trỏ (pointer)** như C/C++
- JVM **kiểm tra bytecode** trước khi thực thi
- Cơ chế **ClassLoader** tải class an toàn
- Hỗ trợ **sandbox** ngăn chặn mã độc

### 3.5. Hỗ trợ đa luồng (Multithreading)

Java cho phép chạy nhiều tác vụ **đồng thời** trong cùng một chương trình:

```java
public class MultiThreadDemo {
    public static void main(String[] args) {
        Thread thread1 = new Thread(() -> {
            for (int i = 0; i < 3; i++) {
                System.out.println("Thread 1: " + i);
            }
        });

        Thread thread2 = new Thread(() -> {
            for (int i = 0; i < 3; i++) {
                System.out.println("Thread 2: " + i);
            }
        });

        thread1.start();
        thread2.start();
    }
}
```

### 3.6. Mạnh mẽ (Robust)

- Kiểm tra kiểu dữ liệu chặt chẽ (strongly typed)
- Cơ chế xử lý ngoại lệ (exception handling)
- Quản lý bộ nhớ tự động
- Không có con trỏ trực tiếp --> tránh lỗi truy cập bộ nhớ

---

## 4. Các nền tảng Java

| Nền tảng | Tên đầy đủ | Mục đích |
|----------|-----------|----------|
| **Java SE** | Standard Edition | Ứng dụng desktop, console, thư viện core |
| **Java EE** | Enterprise Edition (nay là Jakarta EE) | Web, Microservices, Enterprise (Servlet, JPA, EJB) |
| **Java ME** | Micro Edition | Thiết bị nhúng, IoT, điện thoại đời cũ |

---

## 5. Quy trình biên dịch và thực thi

Java là ngôn ngữ **vừa biên dịch (compiled) vừa thông dịch (interpreted)**:

```
Bước 1: Viết code         -->  HelloWorld.java
Bước 2: Biên dịch (javac) -->  HelloWorld.class (bytecode)
Bước 3: JVM thông dịch    -->  Mã máy (machine code)
Bước 4: CPU thực thi      -->  Kết quả
```

```java
// File: HelloWorld.java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

Chạy bằng dòng lệnh:

```bash
javac HelloWorld.java   # Buoc 2: Bien dich thanh bytecode
java HelloWorld         # Buoc 3-4: JVM thuc thi
```

**JIT Compiler (Just-In-Time):** JVM sử dụng JIT để biên dịch bytecode thành mã máy **ngay tại thời điểm chạy**, giúp tăng hiệu năng đáng kể so với thông dịch thuần túy.

---

## 6. Ứng dụng thực tế của Java

| Lĩnh vực | Ví dụ cụ thể |
|----------|-------------|
| **Android** | Phần lớn ứng dụng Android được viết bằng Java (hoặc Kotlin trên nền JVM) |
| **Web Backend** | Spring Boot, Spring MVC -- dùng trong ngân hàng, thương mại điện tử |
| **Big Data** | Apache Hadoop, Apache Spark đều viết bằng Java |
| **Enterprise** | Hệ thống ERP, CRM của các tập đoàn lớn |
| **Game** | Minecraft được viết bằng Java |
| **IoT** | Thiết bị nhúng, smart home |

---

## Khi nào dùng?

- **Chọn Java khi:** Cần xây dựng hệ thống lớn, cần tính ổn định cao, đa nền tảng, hoặc làm việc với hệ sinh thái Spring/Android
- **Không nên chọn Java khi:** Cần hiệu năng cực cao (game AAA), lập trình hệ thống cấp thấp (dùng C/C++), hoặc ứng dụng nhỏ đơn giản (dùng Python/JavaScript)
- **Best practice:** Luôn cập nhật phiên bản Java mới nhất (LTS), sử dụng IDE chuyên nghiệp (IntelliJ IDEA, Eclipse), và học theo chuẩn OOP

---

## Lỗi thường gặp

### Lỗi 1: Nhầm lẫn Java với JavaScript

```
❌ Sai: "Java và JavaScript là cùng một ngôn ngữ"
✅ Đúng: Java và JavaScript là hai ngôn ngữ hoàn toàn khác nhau.
   Java là ngôn ngữ OOP biên dịch, JavaScript là ngôn ngữ scripting cho web.
```

### Lỗi 2: Không hiểu WORA

```
❌ Sai: "Java chạy được trên mọi máy mà không cần cài gì"
✅ Đúng: Java cần JVM để chạy. Máy tính phải cài JRE/JDK thì mới chạy được Java.
```

### Lỗi 3: Nghĩ Java đã lỗi thời

```
❌ Sai: "Java cũ rồi, không ai dùng nữa"
✅ Đúng: Java vẫn nằm trong top 3 ngôn ngữ phổ biến nhất (TIOBE Index),
   được cập nhật liên tục và sử dụng rộng rãi trong enterprise.
```

---

## Câu hỏi phỏng vấn

### Câu 1: Java là platform independent như thế nào?

**Trả lời:** Java đạt được tính độc lập nền tảng nhờ có **JVM**. Code Java được biên dịch thành **bytecode** (file `.class`), và bytecode này chạy trên JVM. Mỗi hệ điều hành (Windows, Linux, macOS) có phiên bản JVM riêng, nên cùng một file `.class` có thể chạy trên bất kỳ nền tảng nào có JVM. Đây chính là triết lý **"Write Once, Run Anywhere"**.

### Câu 2: Java là compiled hay interpreted?

**Trả lời:** Java là **cả hai**. Đầu tiên, `javac` **biên dịch** mã nguồn `.java` thành bytecode `.class`. Sau đó, JVM **thông dịch** bytecode thành mã máy. Ngoài ra, JVM còn sử dụng **JIT Compiler** để biên dịch các đoạn code "nóng" (hay thực thi) thành mã máy trực tiếp, giúp tăng hiệu năng.

### Câu 3: Tại sao Java không hỗ trợ đa kế thừa (multiple inheritance) với class?

**Trả lời:** Java không cho phép một class kế thừa từ nhiều class để tránh **vấn đề Diamond Problem** -- khi hai lớp cha có cùng một phương thức, lớp con không biết gọi phương thức của lớp cha nào. Tuy nhiên, Java hỗ trợ đa kế thừa thông qua **interface** (từ Java 8, interface có thể có default method).

### Câu 4: Tại sao phương thức main phải là static?

**Trả lời:** Phương thức `main` phải là `static` vì JVM gọi `main` **trước khi bất kỳ đối tượng nào được tạo**. Nếu `main` không phải `static`, JVM sẽ phải tạo đối tượng của class trước -- nhưng để tạo đối tượng cần gọi constructor, và không có điểm bắt đầu để thực hiện điều đó. `static` cho phép gọi trực tiếp thông qua tên class mà không cần đối tượng.

### Câu 5: Sự khác biệt giữa JDK, JRE và JVM?

**Trả lời:**
- **JVM** (Java Virtual Machine): Máy ảo thực thi bytecode
- **JRE** (Java Runtime Environment): JVM + thư viện chuẩn, dùng để **chạy** chương trình Java
- **JDK** (Java Development Kit): JRE + công cụ phát triển (javac, jar, javadoc...), dùng để **phát triển** Java

Quan hệ: **JDK ⊃ JRE ⊃ JVM**
