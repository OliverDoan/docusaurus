---
sidebar_position: 2
title: "2. Phân biệt JVM, JRE, JDK"
---

# Phân biệt JVM, JRE, JDK

Khi bắt đầu học Java, bạn sẽ thường gặp ba thuật ngữ: **JVM**, **JRE** và **JDK**. Đây là ba thành phần cốt lõi của nền tảng Java, và hiểu rõ chúng sẽ giúp bạn nắm được cách Java hoạt động từ khi viết code đến khi chạy chương trình.

**Tương tự đơn giản:** Hãy tưởng tượng bạn muốn nghe nhạc:
- **JVM** giống như **máy phát nhạc** -- nó đọc và phát các bản nhạc (bytecode)
- **JRE** giống như **máy phát nhạc + bộ sưu tập đĩa nhạc** -- có đủ để bạn thưởng thức nhạc
- **JDK** giống như **studio thu âm** -- có máy phát, đĩa nhạc, và cả công cụ để bạn **thu âm, mix, sản xuất nhạc** (phát triển phần mềm)

---

## 1. JVM -- Java Virtual Machine

### JVM là gì?

JVM (Java Virtual Machine) là **máy ảo Java** -- một phần mềm **giả lập môi trường thực thi** để chạy bytecode Java. JVM là lý do Java có thể chạy trên nhiều nền tảng khác nhau.

### Cách JVM hoạt động

```
Mã nguồn (.java)
      |
      v
   javac (Compiler)
      |
      v
Bytecode (.class)
      |
      v
   JVM (đọc bytecode --> chuyển thành mã máy của từng OS)
      |
      v
  Windows / Linux / macOS
```

### Các thành phần chính của JVM

```java
// Vi du: Khi ban chay chuong trinh nay
public class HelloJVM {
    public static void main(String[] args) {
        String message = "Hello JVM!";
        System.out.println(message);
    }
}
```

JVM thực hiện các bước sau:

**1. ClassLoader (Bộ nạp lớp)**
- Nạp file `.class` vào bộ nhớ
- Gồm 3 giai đoạn: **Loading** --> **Linking** --> **Initialization**

```
Loading:    Đọc file HelloJVM.class từ đĩa
Linking:    Kiểm tra bytecode hợp lệ, cấp phát bộ nhớ
Initialize: Gán giá trị ban đầu cho các biến static
```

**2. Runtime Data Areas (Vùng dữ liệu thực thi)**

| Vùng nhớ | Mục đích |
|----------|----------|
| **Method Area** | Lưu thông tin class, static variable, constant pool |
| **Heap** | Lưu đối tượng được tạo bằng `new` |
| **Stack** | Lưu biến cục bộ, tham chiếu phương thức |
| **PC Register** | Địa chỉ lệnh đang thực thi của mỗi thread |
| **Native Method Stack** | Gọi phương thức native (C/C++) |

**3. Execution Engine (Bộ thực thi)**

| Thành phần | Vai trò |
|------------|---------|
| **Interpreter** | Đọc và thực thi bytecode từng dòng |
| **JIT Compiler** | Biên dịch bytecode "nóng" thành mã máy để tăng tốc |
| **Garbage Collector** | Tự động thu hồi bộ nhớ không còn sử dụng |

### JIT Compiler (Just-In-Time Compiler)

JIT là "vũ khí bí mật" giúp Java chạy nhanh:

```java
public class JITDemo {
    public static void main(String[] args) {
        // Phuong thuc nay duoc goi 10,000 lan
        // JIT se bien dich no thanh ma may truc tiep de tang toc
        for (int i = 0; i < 10000; i++) {
            tinhTong(i, i + 1);
        }
    }

    public static int tinhTong(int a, int b) {
        return a + b;
    }
}
```

- Lần đầu: Interpreter thông dịch từng dòng (chậm)
- Sau nhiều lần gọi: JIT nhận ra đây là **"hot code"** và biên dịch thành mã máy
- Các lần sau: Chạy trực tiếp mã máy (nhanh như C++)

---

## 2. JRE -- Java Runtime Environment

### JRE là gì?

JRE (Java Runtime Environment) là **môi trường chạy Java**. Nó cung cấp mọi thứ cần thiết để **chạy** một chương trình Java, nhưng **không có công cụ để phát triển**.

### Thành phần của JRE

```
JRE = JVM + Thư viện chuẩn (Java Class Libraries) + File hỗ trợ runtime
```

| Thành phần | Mô tả |
|------------|-------|
| **JVM** | Máy ảo thực thi bytecode |
| **java.lang** | Các lớp cơ bản: String, Math, System, Object... |
| **java.util** | Collections, Date, Scanner... |
| **java.io** | Đọc/ghi file |
| **java.net** | Lập trình mạng |
| **java.sql** | Kết nối cơ sở dữ liệu |

### Ví dụ: Chỉ cần JRE để chạy

```java
// File: ChaoMung.class (da duoc bien dich san)
// Nguoi dung chi can JRE de chay:
// java ChaoMung
```

```bash
# Nguoi dung cuoi chi can cai JRE
java -version
# java version "17.0.2" 2022-01-18 LTS
# Java(TM) SE Runtime Environment (build 17.0.2+8-86)
# Java HotSpot(TM) 64-Bit Server VM (build 17.0.2+8-86, mixed mode, sharing)
```

**Khi nào chỉ cần JRE?**
- Bạn là **người dùng cuối**, chỉ muốn chạy ứng dụng Java (ví dụ: Minecraft, công cụ doanh nghiệp)
- Bạn **không cần** viết hoặc biên dịch code Java

---

## 3. JDK -- Java Development Kit

### JDK là gì?

JDK (Java Development Kit) là **bộ công cụ phát triển Java đầy đủ**. Nếu bạn muốn **viết và biên dịch** code Java, bạn **bắt buộc phải cài JDK**.

### Thành phần của JDK

```
JDK = JRE + Công cụ phát triển (Development Tools)
```

| Công cụ | Chức năng |
|---------|-----------|
| **javac** | Trình biên dịch: `.java` --> `.class` (bytecode) |
| **java** | Thực thi chương trình Java (gọi JVM) |
| **jar** | Đóng gói file thành `.jar` |
| **javadoc** | Tạo tài liệu API từ comment trong code |
| **jdb** | Trình gỡ lỗi (debugger) |
| **jconsole** | Giám sát hiệu năng ứng dụng |
| **jshell** | Java REPL -- chạy code Java tương tác (từ Java 9) |

### Ví dụ sử dụng các công cụ JDK

```java
// File: TinhToan.java
public class TinhToan {
    /**
     * Tinh tong hai so nguyen.
     * @param a so thu nhat
     * @param b so thu hai
     * @return tong cua a va b
     */
    public static int tong(int a, int b) {
        return a + b;
    }

    public static void main(String[] args) {
        int ketQua = tong(5, 3);
        System.out.println("5 + 3 = " + ketQua);
    }
}
```

```bash
# Bien dich (can javac -- chi co trong JDK)
javac TinhToan.java

# Chay (can java -- co trong ca JRE va JDK)
java TinhToan
# Output: 5 + 3 = 8

# Tao tai lieu (can javadoc -- chi co trong JDK)
javadoc TinhToan.java

# Dong goi thanh JAR (can jar -- chi co trong JDK)
jar cf TinhToan.jar TinhToan.class

# Chay tuong tac voi jshell (tu Java 9+)
jshell
# jshell> System.out.println("Hello")
# Hello
```

---

## 4. Sơ đồ lồng nhau: JDK ⊃ JRE ⊃ JVM

```
+--------------------------------------------------+
|                    JDK                            |
|  +--------------------------------------------+  |
|  |                 JRE                         |  |
|  |  +--------------------------------------+  |  |
|  |  |              JVM                      |  |  |
|  |  |  - ClassLoader                        |  |  |
|  |  |  - Bytecode Verifier                  |  |  |
|  |  |  - Execution Engine (Interpreter+JIT) |  |  |
|  |  |  - Garbage Collector                  |  |  |
|  |  |  - Runtime Data Areas                 |  |  |
|  |  +--------------------------------------+  |  |
|  |                                             |  |
|  |  + Thư viện chuẩn (java.lang, java.util...) |  |
|  |  + File hỗ trợ runtime                      |  |
|  +--------------------------------------------+  |
|                                                   |
|  + javac (Compiler)                               |
|  + jar (Packaging)                                |
|  + javadoc (Documentation)                        |
|  + jdb (Debugger)                                 |
|  + jshell (REPL)                                  |
+--------------------------------------------------+
```

---

## 5. Bảng so sánh tổng hợp

| Tiêu chí | JVM | JRE | JDK |
|----------|-----|-----|-----|
| **Là gì?** | Máy ảo thực thi bytecode | Môi trường chạy Java | Bộ công cụ phát triển Java |
| **Bao gồm** | ClassLoader, Execution Engine, GC | JVM + thư viện chuẩn | JRE + công cụ dev |
| **Có thể biên dịch code?** | Không | Không | Có (javac) |
| **Có thể chạy code?** | Có (bytecode) | Có | Có |
| **Dành cho** | Nền tảng/thực thi | Người dùng cuối | Lập trình viên |
| **Ví dụ tương tự** | Máy phát nhạc | Máy phát + đĩa nhạc | Studio thu âm |

---

## Khi nào dùng?

- **Chỉ cài JRE:** Khi bạn là người dùng cuối, chỉ cần chạy ứng dụng Java (ví dụ chạy file `.jar`)
- **Cài JDK:** Khi bạn là lập trình viên, cần viết, biên dịch và debug code Java
- **Best practice:** Luôn cài JDK phiên bản **LTS** (Long-Term Support) như Java 17 hoặc Java 21. Sử dụng tool `sdkman` hoặc `jenv` để quản lý nhiều phiên bản JDK

:::tip Lưu ý
Từ **Java 11**, Oracle không còn cung cấp JRE riêng lẻ. Khi bạn cài JDK 11+, nó đã bao gồm mọi thứ cần thiết. Nên thực tế, hầu hết mọi người chỉ cần cài JDK.
:::

---

## Lỗi thường gặp

### Lỗi 1: Nhầm JVM là platform independent

```
❌ Sai: "JVM là platform independent"
✅ Đúng: JVM là PLATFORM DEPENDENT (phụ thuộc nền tảng).
   Mỗi OS cần cài phiên bản JVM riêng.
   Chính JAVA (bytecode) mới là platform independent.
```

### Lỗi 2: Tưởng JRE đủ để lập trình

```
❌ Sai: Cài JRE rồi viết code Java
   > javac HelloWorld.java
   > 'javac' is not recognized as a command

✅ Đúng: Phải cài JDK để có javac (trình biên dịch).
   JRE chỉ có thể CHẠY chương trình, không thể BIÊN DỊCH.
```

### Lỗi 3: Không phân biệt ClassLoader và Compiler

```
❌ Sai: "ClassLoader biên dịch code Java"
✅ Đúng: ClassLoader NẠP (load) file .class đã được biên dịch vào bộ nhớ.
   javac (Compiler) mới là thành phần biên dịch .java thành .class.
```

### Lỗi 4: Quên cấu hình JAVA_HOME

```
❌ Sai: Cài JDK xong nhưng không set JAVA_HOME
   > javac HelloWorld.java
   > 'javac' is not recognized

✅ Đúng: Sau khi cài JDK, cần thêm JAVA_HOME vào biến môi trường (environment variable)
   và thêm %JAVA_HOME%\bin vào PATH.
```

---

## Câu hỏi phỏng vấn

### Câu 1: Phân biệt JVM, JRE và JDK?

**Trả lời:**
- **JVM** là máy ảo thực thi bytecode Java. Nó chuyển bytecode thành mã máy của từng nền tảng cụ thể.
- **JRE** gồm JVM + thư viện chuẩn Java, dùng để **chạy** chương trình Java.
- **JDK** gồm JRE + công cụ phát triển (javac, jar, javadoc...), dùng để **phát triển** ứng dụng Java.
- Quan hệ lồng nhau: JDK ⊃ JRE ⊃ JVM.

### Câu 2: JIT Compiler là gì? Tại sao cần nó?

**Trả lời:** JIT (Just-In-Time) Compiler là thành phần của JVM, chuyển bytecode thành **mã máy trực tiếp** tại thời điểm chạy. Thay vì thông dịch từng dòng (chậm), JIT nhận diện các đoạn code được gọi nhiều lần (**hotspot**) và biên dịch chúng thành mã máy. Các lần gọi tiếp theo sẽ chạy mã máy trực tiếp, giúp tăng hiệu năng đáng kể -- gần như tương đương với ngôn ngữ biên dịch như C++.

### Câu 3: ClassLoader là gì? Nó hoạt động như thế nào?

**Trả lời:** ClassLoader là thành phần của JVM có nhiệm vụ **nạp các file .class vào bộ nhớ**. Nó hoạt động theo 3 giai đoạn:
1. **Loading:** Tìm và đọc file .class từ disk hoặc network
2. **Linking:** Kiểm tra bytecode (verification), cấp phát bộ nhớ (preparation), giải quyết tham chiếu (resolution)
3. **Initialization:** Thực thi các khối static và gán giá trị cho static variable

Java có 3 ClassLoader mặc định: Bootstrap ClassLoader, Extension ClassLoader, và Application ClassLoader, hoạt động theo mô hình **ủy quyền cha (Parent Delegation Model)**.

### Câu 4: JVM có phải là platform independent không?

**Trả lời:** **Không.** JVM là **platform dependent** (phụ thuộc nền tảng). Mỗi hệ điều hành (Windows, Linux, macOS) cần một phiên bản JVM riêng. Tuy nhiên, **bytecode Java** là platform independent -- cùng một file `.class` chạy được trên bất kỳ JVM nào. Chính nhờ JVM "dịch" bytecode thành mã máy của từng nền tảng cụ thể mà Java đạt được tính "Write Once, Run Anywhere".
