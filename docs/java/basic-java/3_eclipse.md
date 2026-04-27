---
sidebar_position: 3
title: "3. Chương trình Java đầu tiên"
---

# Chương trình Java đầu tiên

Sau khi đã hiểu Java là gì, JVM/JRE/JDK khác nhau ra sao, bây giờ là lúc bạn **thực hành viết chương trình Java đầu tiên**. Bài này sẽ hướng dẫn bạn cài đặt JDK, viết và chạy chương trình "Hello World" bằng cả **dòng lệnh (command line)** và **Eclipse IDE**.

**Ví dụ đơn giản:** Viết chương trình giống như viết thư -- bạn cần giấy (JDK), bút (IDE/text editor), và người nhận (JVM để chạy). Bây giờ chúng ta sẽ "viết lá thư đầu tiên" trong thế giới Java.

---


---

## Mục lục

- [1. Cài đặt JDK](#1-cài-đặt-jdk)
- [2. Chạy Java bằng Command Line](#2-chạy-java-bằng-command-line)
- [3. Giải thích chi tiết chương trình Hello World](#3-giải-thích-chi-tiết-chương-trình-hello-world)
- [4. Cài đặt và sử dụng Eclipse IDE](#4-cài-đặt-và-sử-dụng-eclipse-ide)
- [5. Phím tắt Eclipse hữu ích](#5-phím-tắt-eclipse-hữu-ích)
- [6. Ví dụ thêm: Chương trình tính tuổi](#6-ví-dụ-thêm-chương-trình-tính-tuổi)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Cài đặt JDK

### Bước 1: Tải JDK

Tải JDK từ trang chính thức của Oracle hoặc dùng bản OpenJDK:
- **Oracle JDK:** https://www.oracle.com/java/technologies/downloads/
- **OpenJDK (Adoptium):** https://adoptium.net/

:::tip Khuyến nghị
Chọn phiên bản **LTS** (Long-Term Support) như Java 17 hoặc Java 21.
:::

### Bước 2: Cài đặt và cấu hình

Sau khi cài xong, kiểm tra bằng dòng lệnh:

```bash
# Kiem tra phien ban Java
java -version

# Kiem tra trinh bien dich
javac -version
```

Kết quả mong đợi:

```
java version "17.0.2" 2022-01-18 LTS
javac 17.0.2
```

Nếu lệnh `javac` không được nhận diện, bạn cần thêm **JAVA_HOME** vào biến môi trường:

```bash
# Windows: System Properties > Environment Variables
# Them JAVA_HOME = C:\Program Files\Java\jdk-17
# Them %JAVA_HOME%\bin vao PATH

# macOS/Linux:
export JAVA_HOME=/usr/lib/jvm/java-17
export PATH=$JAVA_HOME/bin:$PATH
```

---

## 2. Chạy Java bằng Command Line

### Bước 1: Tạo file mã nguồn

Tạo file `HelloWorld.java` với nội dung:

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("Day la chuong trinh Java dau tien cua toi.");
    }
}
```

:::warning Quan trọng
Tên file **phải trùng** với tên class chứa `main`. Class tên `HelloWorld` --> file tên `HelloWorld.java`.
:::

### Bước 2: Biên dịch

```bash
javac HelloWorld.java
```

Nếu thành công, sẽ tạo ra file `HelloWorld.class` (bytecode).

### Bước 3: Chạy

```bash
java HelloWorld
```

**Kết quả:**

```
Hello, World!
Day la chuong trinh Java dau tien cua toi.
```

### Quy trình tổng quan

```
HelloWorld.java  --[javac]-->  HelloWorld.class  --[java/JVM]-->  Kết quả
  (mã nguồn)                     (bytecode)                       (màn hình)
```

---

## 3. Giải thích chi tiết chương trình Hello World

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

### Phân tích từng thành phần

| Thành phần | Ý nghĩa |
|------------|---------|
| `public` | Access modifier -- lớp này có thể truy cập từ bất kỳ đâu |
| `class` | Từ khóa khai báo một lớp (class) |
| `HelloWorld` | Tên của lớp (phải trùng với tên file) |
| `public` (trước main) | Phương thức có thể truy cập từ bên ngoài (JVM cần truy cập) |
| `static` | Phương thức thuộc về lớp, không cần tạo đối tượng để gọi |
| `void` | Phương thức không trả về giá trị |
| `main` | Tên phương thức -- **điểm bắt đầu** của mọi chương trình Java |
| `String[] args` | Mảng chuỗi chứa tham số dòng lệnh |
| `System.out.println()` | In nội dung ra màn hình và xuống dòng |

### Tại sao main phải là `public static void main(String[] args)`?

```java
public class GiaiThichMain {
    // public: JVM can truy cap tu ben ngoai
    // static: JVM goi truc tiep ma khong can tao doi tuong
    // void:   main khong can tra ve gia tri
    // main:   ten quy uoc, JVM tim phuong thuc nay de bat dau
    // String[] args: nhan tham so tu dong lenh

    public static void main(String[] args) {
        // In tham so dong lenh
        if (args.length > 0) {
            System.out.println("Tham so dau tien: " + args[0]);
        } else {
            System.out.println("Khong co tham so nao.");
        }
    }
}
```

Chạy với tham số:

```bash
javac GiaiThichMain.java
java GiaiThichMain Xin Chao
# Output: Tham so dau tien: Xin
```

---

## 4. Cài đặt và sử dụng Eclipse IDE

### 4.1. Tải và cài Eclipse

1. Truy cập: https://www.eclipse.org/downloads/
2. Chọn **Eclipse IDE for Java Developers**
3. Tải và cài đặt theo hướng dẫn

### 4.2. Tạo Java Project trong Eclipse

1. Mở Eclipse --> **File** --> **New** --> **Java Project**
2. Đặt tên project (ví dụ: `MyFirstProject`)
3. Chọn JRE version (ví dụ: JavaSE-17)
4. Click **Finish**

### 4.3. Tạo Class mới

1. Click phải vào **src** --> **New** --> **Class**
2. Đặt tên class: `HelloEclipse`
3. Tick chọn **public static void main(String[] args)**
4. Click **Finish**

### 4.4. Viết code

```java
public class HelloEclipse {
    public static void main(String[] args) {
        // Khai bao bien
        String ten = "Java";
        int phienBan = 17;

        // In ra man hinh
        System.out.println("Xin chao " + ten + " phien ban " + phienBan + "!");
        System.out.println("Toi dang hoc lap trinh Java.");

        // Phep tinh don gian
        int a = 10;
        int b = 20;
        int tong = a + b;
        System.out.println(a + " + " + b + " = " + tong);
    }
}
```

### 4.5. Chạy chương trình

- **Cách 1:** Click phải vào file --> **Run As** --> **Java Application**
- **Cách 2:** Nhấn **Ctrl + F11**

**Kết quả trong Console:**

```
Xin chao Java phien ban 17!
Toi dang hoc lap trinh Java.
10 + 20 = 30
```

---

## 5. Phím tắt Eclipse hữu ích

### Phím tắt thường dùng nhất

| Phím tắt | Chức năng |
|----------|-----------|
| **Ctrl + Space** | Gợi ý code (autocomplete) |
| **Ctrl + Shift + F** | Format code tự động |
| **Ctrl + Shift + O** | Tự động import và xóa import thừa |
| **Ctrl + F11** | Chạy chương trình |
| **Ctrl + D** | Xóa dòng hiện tại |
| **Ctrl + /** | Comment/uncomment dòng |
| **Ctrl + Shift + /** | Comment block |
| **F3** | Nhảy đến định nghĩa (Go to Definition) |
| **Ctrl + L** | Nhảy đến dòng bất kỳ |
| **Ctrl + 1** | Quick Fix (gợi ý sửa lỗi) |

### Phím tắt nâng cao

| Phím tắt | Chức năng |
|----------|-----------|
| **Alt + Shift + R** | Đổi tên biến/class (Rename Refactor) |
| **Alt + Shift + S --> R** | Tạo getter/setter tự động |
| **Alt + Shift + S --> O** | Tạo constructor tự động |
| **Alt + Up/Down** | Di chuyển dòng lên/xuống |
| **Ctrl + Alt + Down** | Nhân đôi dòng hiện tại |
| **Ctrl + Shift + R** | Tìm file/class nhanh |
| **Ctrl + Shift + G** | Tìm tất cả nơi sử dụng (Find Usages) |

### Template nhanh (gõ tắt rồi nhấn Ctrl+Space)

| Gõ tắt | Kết quả |
|--------|---------|
| `sysout` + Ctrl+Space | `System.out.println();` |
| `main` + Ctrl+Space | Tạo phương thức `main` |
| `for` + Ctrl+Space | Tạo vòng lặp `for` |
| `foreach` + Ctrl+Space | Tạo vòng lặp `for-each` |

---

## 6. Ví dụ thêm: Chương trình tính tuổi

```java
import java.util.Scanner;

public class TinhTuoi {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.print("Nhap ten cua ban: ");
        String ten = scanner.nextLine();

        System.out.print("Nhap nam sinh: ");
        int namSinh = scanner.nextInt();

        int namHienTai = 2026;
        int tuoi = namHienTai - namSinh;

        System.out.println("Chao " + ten + "! Ban " + tuoi + " tuoi.");

        scanner.close();
    }
}
```

**Kết quả:**

```
Nhap ten cua ban: Thuan
Nhap nam sinh: 1995
Chao Thuan! Ban 31 tuoi.
```

---

## Khi nào dùng?

- **Command line:** Khi học cơ bản, debug nhanh, hoặc làm việc trên server không có GUI
- **Eclipse IDE:** Khi làm project lớn, cần autocomplete, debug, và refactor
- **IntelliJ IDEA:** Một lựa chọn khác rất phổ biến, được nhiều lập trình viên Java ưa chuộng (đặc biệt khi làm Spring Boot)
- **Best practice:** Học chạy bằng command line trước để hiểu quy trình biên dịch, sau đó chuyển sang IDE để tăng năng suất

---

## Lỗi thường gặp

### Lỗi 1: Tên file không trùng với tên class

```java
// File: hello.java
❌ Sai:
public class HelloWorld {  // Ten class la HelloWorld nhung file la hello.java
    public static void main(String[] args) {
        System.out.println("Hello");
    }
}

// File: HelloWorld.java
✅ Đúng:
public class HelloWorld {  // Ten class trung voi ten file
    public static void main(String[] args) {
        System.out.println("Hello");
    }
}
```

### Lỗi 2: Quên dấu chấm phẩy (semicolon)

```java
❌ Sai:
System.out.println("Hello")   // Thiếu dấu ;
// Lỗi: ';' expected

✅ Đúng:
System.out.println("Hello");  // Có dấu ; cuối lệnh
```

### Lỗi 3: Gọi `java` với đuôi `.class`

```bash
❌ Sai:
java HelloWorld.class    # Lỗi: Could not find or load main class

✅ Đúng:
java HelloWorld          # Không cần đuôi .class
```

### Lỗi 4: Viết sai `main` method

```java
❌ Sai:
public static void Main(String[] args) {  // Chữ M viết hoa
    // JVM không tìm thấy main method
}

✅ Đúng:
public static void main(String[] args) {  // Chữ m viết thường
    // JVM tìm thấy và thực thi
}
```

### Lỗi 5: In nhầm `System.out.Println` (viết hoa P)

```java
❌ Sai:
System.out.Println("Hello");  // Viết hoa P --> lỗi

✅ Đúng:
System.out.println("Hello");  // Viết thường p
```

---

## Câu hỏi phỏng vấn

### Câu 1: Giải thích từng từ trong `public static void main(String[] args)`

**Trả lời:**
- `public`: Access modifier, cho phép JVM truy cập phương thức từ bất kỳ đâu
- `static`: Phương thức thuộc về lớp (class-level), JVM gọi được mà không cần tạo đối tượng
- `void`: Phương thức không trả về giá trị
- `main`: Tên phương thức đặc biệt, là điểm bắt đầu (entry point) của mọi chương trình Java
- `String[] args`: Mảng chứa các tham số truyền từ dòng lệnh (command-line arguments)

### Câu 2: Có thể overload phương thức main được không?

**Trả lời:** **Có.** Bạn có thể overload main với các tham số khác nhau. Tuy nhiên, JVM chỉ gọi phiên bản `public static void main(String[] args)` làm điểm bắt đầu. Các phiên bản overload khác phải được gọi thủ công.

```java
public class OverloadMain {
    public static void main(String[] args) {
        System.out.println("JVM goi phien ban nay");
        main(42); // Goi thu cong phien ban overload
    }

    public static void main(int number) {
        System.out.println("Phien ban overload: " + number);
    }
}
```

### Câu 3: Có thể chạy chương trình Java mà không có main method không?

**Trả lời:**
- **Trước Java 7:** Có thể dùng khối `static {}` để chạy code mà không cần `main`.
- **Từ Java 7 trở đi:** **Không.** JVM bắt buộc phải có phương thức `main` để khởi chạy chương trình. Nếu không có, JVM sẽ báo lỗi: `Main method not found in class`.

```java
// Chi hoat dong truoc Java 7
public class KhongCoMain {
    static {
        System.out.println("Chay khong can main!");
        System.exit(0);
    }
}
// Tu Java 7+: Error: Main method not found
```

### Câu 4: Sự khác biệt giữa `System.out.println()` và `System.out.print()`?

**Trả lời:**
- `println()`: In nội dung và **xuống dòng** sau khi in
- `print()`: In nội dung nhưng **không xuống dòng**

```java
public class PrintDemo {
    public static void main(String[] args) {
        System.out.print("A");
        System.out.print("B");
        System.out.println("C");   // Xuong dong sau C
        System.out.println("D");   // Xuong dong sau D
        // Ket qua:
        // ABC
        // D
    }
}
```
