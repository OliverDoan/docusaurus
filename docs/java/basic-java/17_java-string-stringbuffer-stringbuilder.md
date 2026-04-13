---
sidebar_position: 17
title: "17. String, StringBuffer title: "String, StringBuffer & StringBuilder" StringBuilder"
---
# String, StringBuffer & StringBuilder

## 1. Giới thiệu

Trong Java, **chuỗi (String)** là một trong những kiểu dữ liệu được sử dụng **thường xuyên nhất**. Hầu như mọi chương trình Java đều làm việc với chuỗi: tên người dùng, địa chỉ email, nội dung tin nhắn, URL, JSON...

Java cung cấp **3 lớp chính** để xử lý chuỗi:
- **`String`** - Bất biến (immutable)
- **`StringBuffer`** - Thay đổi được (mutable), an toàn luồng (thread-safe)
- **`StringBuilder`** - Thay đổi được (mutable), nhanh nhất nhưng không an toàn luồng

**Tại sao cần hiểu sự khác biệt?** Việc chọn sai lớp chuỗi có thể dẫn đến: code **chậm gấp hàng trăm lần** (nối String trong vòng lặp), **lỗi ẩn** trong ứng dụng đa luồng, hoặc **lãng phí bộ nhớ**. Đây cũng là **câu hỏi phỏng vấn rất phổ biến**.

Hãy hình dung:
- **String** giống như **bút bi**: viết xong không thể xóa, muốn sửa phải lấy tờ giấy mới
- **StringBuffer** giống như **bảng trắng có khóa**: nhiều người có thể viết nhưng phải **đợi lượt** (thread-safe)
- **StringBuilder** giống như **bảng trắng cá nhân**: chỉ một người viết, **nhanh nhất** vì không cần đợi

---

## Nội dung

1. [Giới thiệu](#1-gioi-thieu)
2. [Lớp String - Bất biến (Immutable)](#2-lop-string---bat-bien-immutable)
3. [String Pool](#3-string-pool)
4. [Tạo String: literal vs new](#4-tao-string-literal-vs-new)
5. [Lớp StringBuffer - Mutable & Thread-safe](#5-lop-stringbuffer---mutable--thread-safe)
6. [Lớp StringBuilder - Mutable & Nhanh nhất](#6-lop-stringbuilder---mutable--nhanh-nhat)
7. [Bảng so sánh String - StringBuffer - StringBuilder](#7-bang-so-sanh-string---stringbuffer---stringbuilder)
8. [Các method phổ biến](#8-cac-method-pho-bien)
9. [So sánh hiệu năng (Benchmark)](#9-so-sanh-hieu-nang-benchmark)
10. [Khi nào dùng?](#10-khi-nao-dung)
11. [Lỗi thường gặp](#11-loi-thuong-gap)
12. [Câu hỏi phỏng vấn](#12-cau-hoi-phong-van)

---

## 2. Lớp String - Bất biến (Immutable)

### 2.1 String là immutable

Trong Java, **String là bất biến (immutable)**: một khi đã tạo, **nội dung của nó không thể thay đổi**. Mọi thao tác "thay đổi" trên String thực chất là **tạo ra một đối tượng String mới**.

```java
public class StringImmutableDemo {
    public static void main(String[] args) {
        String s1 = "Hello";
        String s2 = s1; // s2 trỏ cùng object với s1

        s1 = s1 + " World"; // Tạo object MỚI "Hello World"

        System.out.println("s1 = " + s1); // Hello World
        System.out.println("s2 = " + s2); // Hello (KHÔNG thay đổi!)
    }
}
```

**Kết quả:**
```
s1 = Hello World
s2 = Hello
```

Khi thực hiện `s1 = s1 + " World"`:
1. Java tạo object mới `"Hello World"` trên Heap
2. `s1` bây giờ trỏ đến object mới
3. Object cũ `"Hello"` vẫn tồn tại, `s2` vẫn trỏ đến nó

### 2.2 Tại sao String được thiết kế là immutable?

- **An toàn**: nhiều biến có thể trỏ đến cùng một String (trong String Pool) mà không sợ bị thay đổi
- **Thread-safe**: nhiều thread đọc cùng String mà không cần đồng bộ
- **Hashcode caching**: hashcode tính một lần và lưu lại, giúp `HashMap`/`HashSet` nhanh hơn
- **Bảo mật**: String dùng cho password, URL, class name... không bị thay đổi ngầm

---

## 3. String Pool

**String Pool** (hay String Constant Pool) là một vùng bộ nhớ đặc biệt trong Heap, nơi Java **lưu trữ các String literal** để **tái sử dụng**, tiết kiệm bộ nhớ.

```java
public class StringPoolDemo {
    public static void main(String[] args) {
        String s1 = "Java"; // Tạo trong String Pool
        String s2 = "Java"; // Tái sử dụng từ String Pool

        String s3 = new String("Java"); // Tạo object MỚI trên Heap (NGOÀI Pool)

        System.out.println(s1 == s2);      // true  (cùng tham chiếu trong Pool)
        System.out.println(s1 == s3);      // false (khác tham chiếu)
        System.out.println(s1.equals(s3)); // true  (cùng nội dung)

        // intern(): đưa String vào Pool
        String s4 = s3.intern();
        System.out.println(s1 == s4);      // true  (s4 trỏ đến String trong Pool)
    }
}
```

**Kết quả:**
```
true
false
true
true
```

**Cách hoạt động:**
- Khi bạn viết `String s = "Java"`, Java kiểm tra Pool:
  - Nếu `"Java"` **đã tồn tại** trong Pool -> trả về tham chiếu đến nó
  - Nếu **chưa tồn tại** -> tạo mới trong Pool
- Khi bạn viết `new String("Java")` -> **luôn tạo object mới** trên Heap (ngoài Pool)

---

## 4. Tạo String: literal vs new

```java
public class StringCreationDemo {
    public static void main(String[] args) {
        // Cách 1: String literal (KHUYÊN DÙNG)
        String a = "Hello";
        String b = "Hello";
        System.out.println("a == b: " + (a == b));           // true (cùng Pool)
        System.out.println("a.equals(b): " + a.equals(b));   // true

        // Cách 2: new String (TRÁNH dùng khi không cần thiết)
        String c = new String("Hello");
        String d = new String("Hello");
        System.out.println("c == d: " + (c == d));           // false (khác object)
        System.out.println("c.equals(d): " + c.equals(d));   // true

        System.out.println("a == c: " + (a == c));           // false
    }
}
```

**Kết quả:**
```
a == b: true
a.equals(b): true
c == d: false
c.equals(d): true
a == c: false
```

**Quy tắc:**
- **`==`** so sánh **tham chiếu** (địa chỉ bộ nhớ)
- **`equals()`** so sánh **nội dung** chuỗi
- **Luôn dùng `equals()`** khi so sánh nội dung String

---

## 5. Lớp StringBuffer - Mutable & Thread-safe

### 5.1 Đặc điểm

- **Mutable**: nội dung có thể thay đổi mà **không tạo object mới**
- **Thread-safe**: các method được **đồng bộ (synchronized)**, an toàn khi nhiều thread cùng truy cập
- **Chậm hơn StringBuilder** do overhead của synchronized

```java
public class StringBufferDemo {
    public static void main(String[] args) {
        StringBuffer sb = new StringBuffer("Hello");
        System.out.println("Ban đầu: " + sb);
        System.out.println("Hashcode: " + System.identityHashCode(sb));

        sb.append(" World");
        System.out.println("Sau append: " + sb);
        System.out.println("Hashcode: " + System.identityHashCode(sb));
        // Hashcode GIỐNG NHAU -> cùng object, không tạo mới!

        sb.insert(5, ",");
        System.out.println("Sau insert: " + sb);

        sb.replace(0, 5, "Hi");
        System.out.println("Sau replace: " + sb);

        sb.delete(2, 3);
        System.out.println("Sau delete: " + sb);

        sb.reverse();
        System.out.println("Sau reverse: " + sb);
    }
}
```

**Kết quả:**
```
Ban đầu: Hello
Hashcode: 1234567 (ví dụ)
Sau append: Hello World
Hashcode: 1234567 (GIỐNG!)
Sau insert: Hello, World
Sau replace: Hi, World
Sau delete: Hi World
Sau reverse: dlroW iH
```

---

## 6. Lớp StringBuilder - Mutable & Nhanh nhất

### 6.1 Đặc điểm

- **Mutable**: giống StringBuffer
- **KHÔNG thread-safe**: không có synchronized -> **nhanh hơn StringBuffer**
- **Nên dùng trong đa số trường hợp** (ứng dụng đơn luồng hoặc biến cục bộ)

```java
public class StringBuilderDemo {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder();

        // Xây dựng chuỗi trong vòng lặp (HIỆU QUẢ)
        for (int i = 1; i <= 5; i++) {
            sb.append("Item ").append(i);
            if (i < 5) {
                sb.append(", ");
            }
        }

        System.out.println(sb.toString());

        // Các method tương tự StringBuffer
        StringBuilder sb2 = new StringBuilder("Java Programming");
        System.out.println("Length: " + sb2.length());          // 16
        System.out.println("Capacity: " + sb2.capacity());     // 33 (16 + 16 + 1)
        System.out.println("charAt(0): " + sb2.charAt(0));     // J
        System.out.println("substring(5): " + sb2.substring(5)); // Programming
    }
}
```

**Kết quả:**
```
Item 1, Item 2, Item 3, Item 4, Item 5
Length: 16
Capacity: 33
charAt(0): J
substring(5): Programming
```

---

## 7. Bảng so sánh String - StringBuffer - StringBuilder

| Tiêu chí | String | StringBuffer | StringBuilder |
|---------|--------|--------------|---------------|
| **Mutable** | Không (immutable) | Có | Có |
| **Thread-safe** | Có (vì immutable) | Có (synchronized) | Không |
| **Hiệu năng** | Chậm nhất (tạo object mới) | Trung bình | **Nhanh nhất** |
| **Khi nào dùng** | Chuỗi ít thay đổi | Đa luồng cần thay đổi chuỗi | Đơn luồng cần thay đổi chuỗi |
| **String Pool** | Có | Không | Không |
| **equals() override** | Có (so sánh nội dung) | Không (so sánh tham chiếu) | Không (so sánh tham chiếu) |
| **Ra đời từ** | Java 1.0 | Java 1.0 | Java 1.5 |

---

## 8. Các method phổ biến

### 8.1 Method của String

```java
public class StringMethodsDemo {
    public static void main(String[] args) {
        String s = "  Hello, Java World!  ";

        // Lấy thông tin
        System.out.println("length(): " + s.length());             // 22
        System.out.println("charAt(7): " + s.charAt(7));           // J
        System.out.println("indexOf('J'): " + s.indexOf('J'));     // 7
        System.out.println("lastIndexOf('o'): " + s.lastIndexOf('o')); // 17
        System.out.println("isEmpty(): " + s.isEmpty());           // false

        // Cắt chuỗi
        System.out.println("substring(7): " + s.substring(7));           // Java World!
        System.out.println("substring(7,11): " + s.substring(7, 11));   // Java

        // Biến đổi (trả về String MỚI, không thay đổi s gốc)
        System.out.println("toUpperCase(): " + s.toUpperCase());   // HELLO, JAVA WORLD!
        System.out.println("toLowerCase(): " + s.toLowerCase());   // hello, java world!
        System.out.println("trim(): '" + s.trim() + "'");          // 'Hello, Java World!'
        System.out.println("replace('o','0'): " + s.replace('o', '0'));  // Hell0, Java W0rld!

        // Tách và nối
        String csv = "apple,banana,cherry";
        String[] fruits = csv.split(",");
        for (String fruit : fruits) {
            System.out.println("  Fruit: " + fruit);
        }

        String joined = String.join(" - ", fruits);
        System.out.println("join: " + joined);    // apple - banana - cherry

        // Kiểm tra
        String url = "https://www.google.com";
        System.out.println("startsWith: " + url.startsWith("https"));  // true
        System.out.println("endsWith: " + url.endsWith(".com"));       // true
        System.out.println("contains: " + url.contains("google"));     // true
    }
}
```

### 8.2 Method của StringBuffer/StringBuilder

```java
public class BufferBuilderMethodsDemo {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder("Hello");

        // Thêm vào
        sb.append(" World");            // Hello World
        sb.append(123);                 // Hello World123
        System.out.println("append: " + sb);

        // Chèn vào
        sb.insert(5, ",");             // Hello, World123
        System.out.println("insert: " + sb);

        // Thay thế
        sb.replace(13, 16, "");        // Hello, World
        System.out.println("replace: " + sb);

        // Xóa
        sb.delete(5, 6);              // Hello World
        System.out.println("delete: " + sb);

        sb.deleteCharAt(4);            // Hell World
        System.out.println("deleteCharAt: " + sb);

        // Đảo ngược
        sb.reverse();                   // dlroW lleH
        System.out.println("reverse: " + sb);

        // Thông tin
        sb.reverse(); // trả lại
        System.out.println("length: " + sb.length());
        System.out.println("capacity: " + sb.capacity());
        System.out.println("charAt(0): " + sb.charAt(0));
    }
}
```

---

## 9. So sánh hiệu năng (Benchmark)

```java
public class PerformanceBenchmark {
    public static void main(String[] args) {
        int iterations = 100_000;

        // Test 1: String concatenation (CHẬM)
        long start1 = System.currentTimeMillis();
        String s = "";
        for (int i = 0; i < iterations; i++) {
            s += i; // Tạo object mới mỗi lần!
        }
        long time1 = System.currentTimeMillis() - start1;
        System.out.println("String      : " + time1 + " ms");

        // Test 2: StringBuffer (TRUNG BÌNH)
        long start2 = System.currentTimeMillis();
        StringBuffer sbuf = new StringBuffer();
        for (int i = 0; i < iterations; i++) {
            sbuf.append(i);
        }
        long time2 = System.currentTimeMillis() - start2;
        System.out.println("StringBuffer: " + time2 + " ms");

        // Test 3: StringBuilder (NHANH NHẤT)
        long start3 = System.currentTimeMillis();
        StringBuilder sbld = new StringBuilder();
        for (int i = 0; i < iterations; i++) {
            sbld.append(i);
        }
        long time3 = System.currentTimeMillis() - start3;
        System.out.println("StringBuilder: " + time3 + " ms");
    }
}
```

**Kết quả (tham khảo):**
```
String      : 4500 ms
StringBuffer: 8 ms
StringBuilder: 5 ms
```

String chậm hơn **gấp hàng trăm đến hàng nghìn lần** vì mỗi phép `+=` trong vòng lặp tạo ra **đối tượng String mới**, sao chép nội dung cũ sang, rồi thêm nội dung mới. Với 100.000 lần lặp, đó là 100.000 đối tượng tạm thời được tạo và hủy.

---

## 10. Khi nào dùng?

### Dùng String khi:
- Chuỗi **ít thay đổi** hoặc **không thay đổi** (tên, email, URL, config...)
- Cần **so sánh nội dung** chuỗi (`equals()`)
- Dùng làm **key trong HashMap/HashSet**
- **Hằng số** (constant) được định nghĩa sẵn

### Dùng StringBuffer khi:
- Thay đổi chuỗi **trong môi trường đa luồng** (multi-thread)
- Nhiều thread **cùng đọc/ghi** một object chuỗi
- **Cần thread-safe** (ví dụ: logger dùng chung giữa các thread)

### Dùng StringBuilder khi:
- Thay đổi chuỗi **trong môi trường đơn luồng** (đa số trường hợp)
- **Nối chuỗi trong vòng lặp**
- Xây dựng chuỗi động (SQL query, HTML, JSON...)
- **Biến cục bộ** trong method (không cần thread-safe)

### Best practices:
- **Mặc định chọn StringBuilder** khi cần thay đổi chuỗi
- **Chỉ dùng StringBuffer** khi chắc chắn cần thread-safe
- **Không nối String trong vòng lặp** bằng toán tử `+`
- Dùng **`equals()`** để so sánh nội dung, **không dùng `==`**
- Khi khởi tạo StringBuilder, **dự tính capacity** để tránh resize:
  ```java
  StringBuilder sb = new StringBuilder(1000); // Dự tính 1000 ký tự
  ```

---

## 11. Lỗi thường gặp

### Lỗi 1: So sánh String bằng `==` thay vì `equals()`

```java
// Sai: Có thể cho kết quả sai
String a = new String("hello");
String b = new String("hello");
if (a == b) { // false! So sánh tham chiếu
    System.out.println("Giống nhau");
}
```

```java
// Đúng: Dùng equals() để so sánh nội dung
String a = new String("hello");
String b = new String("hello");
if (a.equals(b)) { // true! So sánh nội dung
    System.out.println("Giống nhau");
}
```

### Lỗi 2: Nối String trong vòng lặp (cực chậm)

```java
// Sai: Mỗi lần tạo object mới -> O(n^2)
String result = "";
for (int i = 0; i < 10000; i++) {
    result += i; // CHAM!
}
```

```java
// Đúng: Dùng StringBuilder -> O(n)
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 10000; i++) {
    sb.append(i); // NHANH!
}
String result = sb.toString();
```

### Lỗi 3: Dùng StringBuffer khi không cần thread-safe

```java
// Không tốt: StringBuffer có overhead synchronized không cần thiết
public String buildMessage() {
    StringBuffer sb = new StringBuffer(); // Biến cục bộ, không cần thread-safe!
    sb.append("Hello");
    sb.append(" World");
    return sb.toString();
}
```

```java
// Tốt hơn: StringBuilder nhanh hơn cho biến cục bộ
public String buildMessage() {
    StringBuilder sb = new StringBuilder();
    sb.append("Hello");
    sb.append(" World");
    return sb.toString();
}
```

### Lỗi 4: Gọi method trên String mà quên gán kết quả

```java
// Sai: String là immutable, method trả về String MỚI
String s = "  Hello  ";
s.trim(); // Kết quả bị bỏ đi vì không gán!
System.out.println("'" + s + "'"); // '  Hello  ' (vẫn có khoảng trắng)
```

```java
// Đúng: Gán kết quả trả về
String s = "  Hello  ";
s = s.trim(); // Gán lại kết quả
System.out.println("'" + s + "'"); // 'Hello'
```

### Lỗi 5: NullPointerException khi gọi method trên null String

```java
// Sai: Gọi method trên null
String name = null;
if (name.equals("admin")) { // NullPointerException!
    System.out.println("Admin");
}
```

```java
// Đúng: Đặt hằng số trước hoặc kiểm tra null
String name = null;
if ("admin".equals(name)) { // An toàn, trả về false
    System.out.println("Admin");
}

// Hoặc kiểm tra null trước
if (name != null && name.equals("admin")) {
    System.out.println("Admin");
}
```

---

## 12. Câu hỏi phỏng vấn

### Câu 1: Tại sao String là immutable trong Java?

**Trả lời:** String được thiết kế là immutable vì nhiều lý do:
1. **String Pool**: Nhiều biến có thể trỏ cùng một String trong Pool. Nếu String mutable, thay đổi 1 biến sẽ ảnh hưởng tất cả biến khác.
2. **Thread-safe**: Không cần đồng bộ hóa khi nhiều thread đọc cùng String.
3. **Bảo mật**: String dùng cho password, URL, class name... Immutable đảm bảo không bị thay đổi ngầm bởi code khác.
4. **Hashcode caching**: Vì nội dung không đổi, hashcode chỉ tính 1 lần và lưu cache, giúp HashMap/HashSet nhanh hơn.
5. **Class loading**: JVM dùng String để load class. Nếu String bị thay đổi, có thể load sai class -> lỗi bảo mật.

### Câu 2: String Pool là gì? Hoạt động như thế nào?

**Trả lời:** String Pool (String Constant Pool) là **vùng bộ nhớ đặc biệt trong Heap** (từ Java 7, trước đó nằm trong PermGen). Khi tạo String bằng literal (`String s = "abc"`), Java kiểm tra Pool:
- Nếu `"abc"` **đã tồn tại** -> trả về tham chiếu cũ (không tạo mới)
- Nếu **chưa tồn tại** -> tạo mới trong Pool

String tạo bằng `new String("abc")` **luôn tạo object mới trên Heap** (ngoài Pool). Có thể dùng `intern()` để đưa String vào Pool.

### Câu 3: `==` và `equals()` khác nhau như thế nào với String?

**Trả lời:**
- **`==`** so sánh **tham chiếu** (địa chỉ bộ nhớ): hai biến có trỏ đến **cùng object** không?
- **`equals()`** so sánh **nội dung**: hai chuỗi có **cùng ký tự** không?

```java
String a = "hello";
String b = "hello";
String c = new String("hello");

a == b;      // true  (cùng tham chiếu trong Pool)
a == c;      // false (khác tham chiếu, a trong Pool, c trên Heap)
a.equals(c); // true  (cùng nội dung)
```

**Quy tắc:** Luôn dùng `equals()` khi so sánh nội dung String.

### Câu 4: StringBuffer và StringBuilder khác nhau thế nào?

**Trả lời:**

| Tiêu chí | StringBuffer | StringBuilder |
|---------|--------------|---------------|
| Thread-safe | Có (synchronized) | Không |
| Hiệu năng | Chậm hơn | Nhanh hơn |
| Ra đời | Java 1.0 | Java 1.5 |
| Khi nào dùng | Đa luồng | Đơn luồng |

Cả hai đều **mutable** và có **cùng API** (append, insert, delete, reverse...). **StringBuilder nhanh hơn** vì không có overhead của synchronized. Trong **99% trường hợp**, dùng StringBuilder là đủ (vì biến chuỗi thường là biến cục bộ, không chia sẻ giữa thread).

### Câu 5: Tại sao không nên nối String trong vòng lặp? Trình bày vấn đề hiệu năng.

**Trả lời:** Mỗi phép `+=` trên String:
1. Tạo **StringBuilder tạm** (trong bytecode)
2. Copy nội dung String cũ sang StringBuilder
3. Append nội dung mới
4. Gọi `toString()` để tạo **String mới**
5. String cũ trở thành **rác** cho GC thu gom

Với n lần lặp, độ phức tạp là **O(n^2)** (vì mỗi lần copy chuỗi ngày càng dài). Trong khi StringBuilder.append() là **O(1)** (amortized), tổng là O(n).

Ví dụ: nối 100.000 chuỗi:
- String `+=`: **vài giây** (tạo 100.000 object tạm)
- StringBuilder: **vài mili-giây** (1 object duy nhất)
