---
sidebar_position: 1
title: "1. Java Core & Cú pháp"
---

# Java Core & Cú pháp

> *Nền tảng vững chắc về Java Core giúp bạn tự tin trả lời mọi câu hỏi phỏng vấn từ cơ bản đến nâng cao.*

:::note[Ghi nhớ nhanh]

- ⭐ **`==` vs `.equals()`** — `==` so sánh địa chỉ tham chiếu, `.equals()` so sánh nội dung; luôn dùng `.equals()` cho String/đối tượng (chú ý String Pool và cache `Integer` `[-128, 127]`).
- ⭐ **JVM ⊂ JRE ⊂ JDK** — JVM thực thi bytecode, JRE thêm thư viện chuẩn để chạy, JDK thêm `javac` và công cụ để phát triển.
- **Java không thuần OOP** — vì có 8 kiểu nguyên thủy và `static` method; bù lại bằng Wrapper class và autoboxing.
- **4 access modifier** — `private` → `default` (package-private) → `protected` → `public`; điểm khác biệt: `protected` cho subclass khác package truy cập.
- **`static`** — thuộc về class (một bản duy nhất), dùng cho hằng số, utility method, bộ đếm; không dùng khi phụ thuộc trạng thái object.
- **`final`** — biến (gán một lần), method (không override), class (không kế thừa); reference `final` giữ địa chỉ nhưng nội dung object mutable vẫn đổi được.

:::

---

## Câu 1: Java là gì và vì sao đến nay vẫn được dùng rộng rãi? `[Basic]`

### Câu hỏi

> *"Bạn có thể giới thiệu ngắn gọn về Java và lý do tại sao nó vẫn còn phổ biến sau hơn 30 năm không?"*

### Giải thích lý thuyết

Java là ngôn ngữ lập trình **hướng đối tượng** (Object-Oriented), **kiểu tĩnh** (statically typed — kiểu dữ liệu được kiểm tra lúc biên dịch), được phát triển bởi Sun Microsystems vào năm 1995. Điểm nổi bật nhất là triết lý **"Write Once, Run Anywhere"** (viết một lần, chạy mọi nơi) nhờ JVM (Java Virtual Machine — máy ảo Java).

Java vẫn được dùng rộng rãi vì nhiều lý do:

- **Hệ sinh thái khổng lồ**: hàng triệu thư viện, framework như Spring, Hibernate, Maven.
- **Cộng đồng lớn**: dễ tìm tài liệu, giải pháp khi gặp vấn đề.
- **Bảo mật tốt**: cơ chế quản lý bộ nhớ tự động (Garbage Collection — thu gom rác), không có con trỏ trần như C/C++.
- **Dùng trong doanh nghiệp**: ngân hàng, tài chính, thương mại điện tử lớn đều dùng Java ở backend.
- **Phát triển liên tục**: Java vẫn ra phiên bản mới đều đặn (Java 21 LTS, Java 23...).

### Code minh hoạ

```java
// Chương trình Java đơn giản nhất
public class HelloWorld {
    public static void main(String[] args) {
        // In ra màn hình — chạy được trên Windows, macOS, Linux mà không đổi code
        System.out.println("Hello, World!");
        System.out.println("Java version: " + System.getProperty("java.version"));
    }
}
```

### Đáp án mẫu

> "Java là ngôn ngữ lập trình hướng đối tượng ra đời năm 1995, nổi tiếng với triết lý 'Write Once, Run Anywhere' — tức là code Java sau khi biên dịch thành bytecode có thể chạy trên bất kỳ máy nào có cài JVM. Java vẫn phổ biến vì hệ sinh thái rất lớn, cộng đồng mạnh, đặc biệt được tin dùng trong các hệ thống doanh nghiệp, ngân hàng và tài chính nơi yêu cầu độ ổn định cao."

---

## Câu 2: Năm đặc điểm nổi bật của Java là gì? `[Basic]`

### Câu hỏi

> *"Theo bạn, Java có những đặc điểm gì nổi bật so với các ngôn ngữ khác?"*

### Giải thích lý thuyết

Java được thiết kế với các đặc điểm cốt lõi sau:

| Đặc điểm | Giải thích |
|---|---|
| **Platform Independent** (độc lập nền tảng) | Biên dịch sang bytecode, chạy trên JVM ở mọi hệ điều hành |
| **Object-Oriented** (hướng đối tượng) | Mọi thứ đều là đối tượng, hỗ trợ encapsulation, inheritance, polymorphism, abstraction |
| **Robust** (mạnh mẽ, bền vững) | Quản lý bộ nhớ tự động, kiểm tra kiểu lúc biên dịch, xử lý ngoại lệ có cấu trúc |
| **Multithreaded** (đa luồng) | Hỗ trợ lập trình đa luồng tích hợp sẵn, dễ xây dựng ứng dụng đồng thời |
| **Secure** (bảo mật) | Không có con trỏ trần, Security Manager, bytecode verification trước khi chạy |

Ngoài ra còn có **Simple** (dễ học hơn C++), **Distributed** (hỗ trợ lập trình phân tán qua RMI, socket), và **High Performance** (hiệu năng cao nhờ JIT Compiler — trình biên dịch Just-In-Time).

### Code minh hoạ

```java
// Minh hoạ tính hướng đối tượng và mạnh mẽ của Java
public class Employee {
    // Encapsulation — đóng gói: thuộc tính private, truy cập qua getter/setter
    private String name;
    private double salary;

    public Employee(String name, double salary) {
        this.name = name;
        // Robust: kiểm tra dữ liệu đầu vào ngay khi tạo đối tượng
        if (salary < 0) {
            throw new IllegalArgumentException("Lương không được âm");
        }
        this.salary = salary;
    }

    public String getName() { return name; }
    public double getSalary() { return salary; }

    @Override
    public String toString() {
        return "Employee{name='" + name + "', salary=" + salary + "}";
    }
}
```

### Đáp án mẫu

> "Java có năm đặc điểm nổi bật: thứ nhất là độc lập nền tảng — code biên dịch một lần chạy mọi nơi qua JVM. Thứ hai là hướng đối tượng hoàn toàn. Thứ ba là robust — quản lý bộ nhớ tự động qua Garbage Collection, giảm lỗi rò rỉ bộ nhớ. Thứ tư là hỗ trợ đa luồng tích hợp sẵn. Thứ năm là bảo mật tốt nhờ không có con trỏ trần và cơ chế xác thực bytecode."

---

## Câu 3: Java có phải ngôn ngữ thuần hướng đối tượng không? `[Basic]`

### Câu hỏi

> *"Tôi nghe nói Java không phải ngôn ngữ thuần hướng đối tượng 100%. Bạn nghĩ sao?"*

### Giải thích lý thuyết

**Java không phải ngôn ngữ thuần hướng đối tượng** (Pure OOP) vì hai lý do chính:

**1. Kiểu nguyên thủy (Primitive types)**: Java có 8 kiểu dữ liệu nguyên thủy không phải đối tượng: `int`, `long`, `double`, `float`, `boolean`, `char`, `byte`, `short`. Trong ngôn ngữ thuần OOP như Smalltalk hay Ruby, mọi giá trị đều là đối tượng.

**2. Phương thức tĩnh (Static methods)**: Static method (phương thức tĩnh) thuộc về class, không thuộc về instance (thể hiện). Đây là lập trình thủ tục lẫn vào OOP.

Tuy nhiên, Java bù đắp bằng cơ chế **Autoboxing/Unboxing** — tự động chuyển đổi giữa kiểu nguyên thủy và lớp bao bọc tương ứng (`int` ↔ `Integer`, `double` ↔ `Double`...).

### Code minh hoạ

```java
public class PureOOPDiscussion {
    public static void main(String[] args) {
        // Kiểu nguyên thủy — KHÔNG phải đối tượng
        int primitiveInt = 42;

        // Integer là lớp bao bọc (Wrapper class) — LÀ đối tượng
        Integer wrappedInt = 42;

        // Autoboxing: Java tự động chuyển int -> Integer
        Integer autoBoxed = primitiveInt; // tương đương: Integer.valueOf(primitiveInt)

        // Unboxing: Java tự động chuyển Integer -> int
        int unboxed = wrappedInt; // tương đương: wrappedInt.intValue()

        System.out.println("Primitive: " + primitiveInt);
        System.out.println("Wrapped: " + wrappedInt.getClass().getName()); // java.lang.Integer

        // Static method — không cần instance để gọi
        int max = Math.max(10, 20); // Math.max() là static, không phải OOP thuần
        System.out.println("Max: " + max);
    }
}
```

### Đáp án mẫu

> "Java không phải thuần hướng đối tượng 100% vì hai lý do: một là Java có 8 kiểu dữ liệu nguyên thủy như int, double, boolean — chúng không phải đối tượng. Hai là Java có static method thuộc về class, không thuộc instance. Để thuận tiện, Java cung cấp các Wrapper class như Integer, Double và cơ chế Autoboxing để tự động chuyển đổi giữa kiểu nguyên thủy và đối tượng khi cần."

---

## Câu 4: JVM, JRE và JDK khác nhau thế nào? `[Basic]`

### Câu hỏi

> *"Bạn có thể giải thích sự khác nhau giữa JVM, JRE và JDK không? Cái nào bao gồm cái nào?"*

### Giải thích lý thuyết

Ba thành phần này có quan hệ bao hàm lồng nhau:

```
JDK (lớn nhất)
  └── JRE
        └── JVM (nhỏ nhất, cốt lõi nhất)
```

| Thành phần | Tên đầy đủ | Chức năng | Dùng khi nào |
|---|---|---|---|
| **JVM** | Java Virtual Machine | Thực thi bytecode, quản lý bộ nhớ, Garbage Collection | Cốt lõi — luôn có mặt |
| **JRE** | Java Runtime Environment | JVM + thư viện chuẩn (java.lang, java.util...) | Chỉ cần chạy ứng dụng Java |
| **JDK** | Java Development Kit | JRE + compiler (javac), debugger, javadoc, các công cụ phát triển | Cần phát triển / biên dịch Java |

**JVM** là trái tim của Java: nhận bytecode (file `.class`), dịch sang mã máy (native code) qua JIT Compiler rồi thực thi.

**JRE** đủ để người dùng cuối chạy ứng dụng Java nhưng không thể biên dịch code mới.

**JDK** là bộ hoàn chỉnh cho lập trình viên.

### Code minh hoạ

```java
// Quy trình từ source code -> chạy:
// 1. Lập trình viên viết: Hello.java
// 2. javac (trong JDK) biên dịch: Hello.java -> Hello.class (bytecode)
// 3. JVM (trong JRE/JDK) thực thi: java Hello

public class Hello {
    public static void main(String[] args) {
        // Runtime.getRuntime() cho thấy JVM đang chạy
        Runtime runtime = Runtime.getRuntime();
        System.out.println("JVM đang dùng: " + runtime.totalMemory() / 1024 / 1024 + " MB");
        System.out.println("Java version: " + System.getProperty("java.version"));
        System.out.println("JVM name: " + System.getProperty("java.vm.name"));
    }
}
```

### Đáp án mẫu

> "JVM là Java Virtual Machine — máy ảo thực thi bytecode Java và quản lý bộ nhớ. JRE là Java Runtime Environment, bao gồm JVM cộng thêm các thư viện chuẩn, đủ để chạy ứng dụng Java. JDK là Java Development Kit, bao gồm JRE cộng thêm công cụ phát triển như trình biên dịch javac, debugger — dành cho lập trình viên. Tóm lại: JDK bao gồm JRE, JRE bao gồm JVM."

---

## Câu 5: `==` và `.equals()` trong Java khác nhau thế nào? `[Basic]`

### Câu hỏi

> *"Nếu tôi so sánh hai String bằng == và bằng .equals(), kết quả có khác nhau không? Tại sao?"*

### Giải thích lý thuyết

Đây là câu hỏi kinh điển và thường gây nhầm lẫn:

| Toán tử | So sánh gì | Dùng cho |
|---|---|---|
| `==` | **Địa chỉ bộ nhớ** (reference) — hai biến có trỏ đến cùng một object không | Kiểu nguyên thủy hoặc kiểm tra cùng object |
| `.equals()` | **Giá trị nội dung** — hai object có bằng nhau về mặt logic không | Đối tượng, đặc biệt là String |

Với **String**, Java có **String Pool** (vùng nhớ đặc biệt): các String literal giống nhau được tái sử dụng. Nhưng String tạo bằng `new String(...)` luôn tạo object mới ngoài pool.

Với các lớp tự định nghĩa, nếu không override `.equals()`, mặc định nó so sánh địa chỉ bộ nhớ (giống `==`).

### Code minh hoạ

```java
public class EqualsDemo {
    public static void main(String[] args) {
        // String literal — lưu trong String Pool
        String s1 = "hello";
        String s2 = "hello";

        // String tạo bằng new — tạo object mới ngoài pool
        String s3 = new String("hello");

        System.out.println(s1 == s2);        // true  — cùng object trong pool
        System.out.println(s1 == s3);        // false — khác object (s3 ở ngoài pool)
        System.out.println(s1.equals(s3));   // true  — cùng nội dung "hello"

        // So sánh kiểu nguyên thủy: == là đúng
        int a = 5;
        int b = 5;
        System.out.println(a == b); // true — so sánh giá trị trực tiếp

        // Integer (Wrapper) — chú ý cache [-128, 127]
        Integer x = 127;
        Integer y = 127;
        System.out.println(x == y);      // true  — trong vùng cache
        Integer p = 128;
        Integer q = 128;
        System.out.println(p == q);      // false — ngoài vùng cache, object khác nhau
        System.out.println(p.equals(q)); // true  — cùng giá trị 128
    }
}
```

### Đáp án mẫu

> "Dấu == so sánh địa chỉ bộ nhớ — tức là kiểm tra hai biến có trỏ đến cùng một object không. Còn .equals() so sánh nội dung giá trị. Với String, nếu tôi viết String s1 = 'hello' và String s2 = new String('hello'), thì s1 == s2 sẽ là false vì chúng là hai object khác nhau, nhưng s1.equals(s2) là true vì nội dung giống nhau. Vì vậy khi so sánh String hay các đối tượng, luôn dùng .equals() thay vì ==."

---

## Câu 6: Các access modifier trong Java là gì? Giải thích từng loại. `[Basic]`

### Câu hỏi

> *"Java có những access modifier nào? Sự khác biệt giữa protected và package-private là gì?"*

### Giải thích lý thuyết

**Access modifier** (bộ điều chỉnh truy cập) kiểm soát phạm vi có thể truy cập một class, method hoặc field. Java có 4 loại:

| Modifier | Cùng class | Cùng package | Subclass (khác package) | Mọi nơi |
|---|:---:|:---:|:---:|:---:|
| `private` | Có | Không | Không | Không |
| `(default)` — package-private | Có | Có | Không | Không |
| `protected` | Có | Có | Có | Không |
| `public` | Có | Có | Có | Có |

- **`private`**: chỉ truy cập trong cùng class — dùng cho thuộc tính nội bộ, phương thức helper.
- **`(default)`** (không viết gì): truy cập trong cùng package — dùng khi muốn chia sẻ trong module nội bộ.
- **`protected`**: truy cập trong package và các subclass (lớp con) kể cả khác package — dùng khi thiết kế kế thừa.
- **`public`**: truy cập từ mọi nơi — dùng cho API công khai.

### Code minh hoạ

```java
package com.example.animal;

public class Animal {
    public String name;          // Mọi nơi đều truy cập được
    protected int age;           // Package + subclass truy cập được
    String species;              // Chỉ trong package com.example.animal
    private String secretDNA;    // Chỉ trong class Animal

    public Animal(String name, int age, String species) {
        this.name = name;
        this.age = age;
        this.species = species;
        this.secretDNA = "ATCG..."; // Chỉ class này được gán
    }

    private void decodeDNA() {
        // Phương thức nội bộ, không ai gọi từ ngoài được
        System.out.println("Decoding: " + secretDNA);
    }

    protected void breathe() {
        // Subclass có thể override phương thức này
        System.out.println(name + " đang thở");
    }
}

package com.example.pet; // package khác

import com.example.animal.Animal;

public class Dog extends Animal { // Subclass của Animal
    public Dog(String name, int age) {
        super(name, age, "Canis lupus familiaris");
    }

    public void showInfo() {
        System.out.println(name);    // OK — public
        System.out.println(age);     // OK — protected, Dog là subclass
        // System.out.println(species);   // Lỗi — default, khác package
        // System.out.println(secretDNA); // Lỗi — private
        breathe(); // OK — protected method
    }
}
```

### Đáp án mẫu

> "Java có 4 access modifier: private chỉ truy cập trong cùng class, default (không viết gì) truy cập trong cùng package, protected truy cập trong package và các subclass kể cả khác package, public truy cập từ mọi nơi. Sự khác biệt quan trọng giữa protected và package-private là protected cho phép subclass ở package khác truy cập, còn package-private thì không. Nguyên tắc là luôn dùng phạm vi nhỏ nhất có thể — thường bắt đầu với private rồi mở rộng khi cần."

---

## Câu 7: Static member là gì? Khi nào nên dùng? `[Basic]`

### Câu hỏi

> *"Static field và static method khác gì so với field/method thông thường? Cho ví dụ thực tế."*

### Giải thích lý thuyết

**Static member** (thành viên tĩnh) thuộc về **class** chứ không thuộc về **instance** (thể hiện — đối tượng cụ thể). Điều này có nghĩa:

- Tồn tại duy nhất một bản sao cho toàn bộ chương trình (không phụ thuộc số lượng object).
- Truy cập qua tên class, không cần tạo object.
- Được khởi tạo khi class được load vào JVM.

**Khi nên dùng static**:
- **Hằng số** (`static final`): giá trị không đổi, dùng chung — như `Math.PI`.
- **Phương thức tiện ích** (utility method): không cần trạng thái của object — như `Math.max()`, `Collections.sort()`.
- **Bộ đếm** (counter): đếm số lượng object đã tạo.
- **Singleton pattern**: đảm bảo chỉ có một instance.

**Không nên dùng static** khi logic phụ thuộc vào trạng thái của từng object cụ thể.

### Code minh hoạ

```java
public class BankAccount {
    // Static field — đếm tổng số tài khoản, dùng chung cho tất cả instance
    private static int totalAccounts = 0;

    // Static final — hằng số lãi suất mặc định
    public static final double DEFAULT_INTEREST_RATE = 0.05;

    // Instance field — số dư riêng của từng tài khoản
    private String accountId;
    private double balance;

    public BankAccount(String accountId, double initialBalance) {
        this.accountId = accountId;
        this.balance = initialBalance;
        totalAccounts++; // Mỗi lần tạo tài khoản mới, tăng bộ đếm chung
    }

    // Static method — lấy tổng số tài khoản, không cần instance cụ thể
    public static int getTotalAccounts() {
        return totalAccounts;
        // Lưu ý: không thể dùng this.balance ở đây vì static không có 'this'
    }

    // Instance method — lấy số dư của tài khoản CỤ THỂ
    public double getBalance() {
        return balance;
    }

    public static void main(String[] args) {
        System.out.println("Tổng tài khoản: " + BankAccount.getTotalAccounts()); // 0

        BankAccount acc1 = new BankAccount("ACC001", 1000);
        BankAccount acc2 = new BankAccount("ACC002", 2000);

        System.out.println("Tổng tài khoản: " + BankAccount.getTotalAccounts()); // 2
        System.out.println("Lãi suất mặc định: " + BankAccount.DEFAULT_INTEREST_RATE);
        System.out.println("Số dư acc1: " + acc1.getBalance()); // 1000.0
    }
}
```

### Đáp án mẫu

> "Static member thuộc về class chứ không thuộc về từng object cụ thể. Điều đó có nghĩa là chỉ có một bản sao duy nhất trong suốt vòng đời chương trình và truy cập qua tên class không cần tạo object. Tôi thường dùng static cho hằng số như DEFAULT_INTEREST_RATE, phương thức tiện ích không phụ thuộc trạng thái object như Math.max(), hoặc bộ đếm dùng chung. Cần tránh dùng static cho logic phụ thuộc vào trạng thái của từng object."

---

## Câu 8: Keyword `final` trong Java có mấy cách dùng? `[Basic]`

### Câu hỏi

> *"Từ khóa final trong Java dùng để làm gì? Nó ảnh hưởng thế nào khi áp dụng cho biến, phương thức và lớp?"*

### Giải thích lý thuyết

`final` là từ khóa đa năng trong Java, có 3 cách dùng với ý nghĩa khác nhau:

| Áp dụng cho | Ý nghĩa | Hệ quả |
|---|---|---|
| **Biến** (variable) | **Immutable** (không thể thay đổi) — biến chỉ gán một lần | Compile error nếu cố gán lại |
| **Phương thức** (method) | **Non-overridable** (không thể ghi đè) | Subclass không thể override method này |
| **Lớp** (class) | **Non-extendable** (không thể kế thừa) | Không thể tạo subclass từ class này |

**Lưu ý quan trọng** với `final` trên object: biến `final` giữ nguyên **tham chiếu** (reference — địa chỉ), nhưng **nội dung** của object vẫn có thể thay đổi nếu object đó không phải immutable.

### Code minh hoạ

```java
// 1. final CLASS — không thể kế thừa
final class ImmutableConfig {
    private final String host; // 2. final FIELD — chỉ gán một lần
    private final int port;

    public ImmutableConfig(String host, int port) {
        this.host = host;
        this.port = port;
    }

    public String getHost() { return host; }
    public int getPort() { return port; }
}

// class ExtendedConfig extends ImmutableConfig { } // Lỗi biên dịch!

class BaseService {
    // 3. final METHOD — subclass không thể override
    public final void connect() {
        System.out.println("Kết nối theo giao thức chuẩn...");
    }

    public void process() {
        System.out.println("BaseService xử lý");
    }
}

class ChildService extends BaseService {
    // @Override
    // public void connect() { } // Lỗi biên dịch — không override được

    @Override
    public void process() { // OK — process() không phải final
        System.out.println("ChildService xử lý theo cách riêng");
    }
}

public class FinalDemo {
    public static void main(String[] args) {
        // final biến cục bộ
        final int MAX_SIZE = 100;
        // MAX_SIZE = 200; // Lỗi biên dịch!

        // final reference — tham chiếu không đổi nhưng nội dung List có thể thay đổi
        final java.util.List<String> list = new java.util.ArrayList<>();
        list.add("item1"); // OK — thay đổi nội dung list
        list.add("item2"); // OK
        // list = new java.util.ArrayList<>(); // Lỗi — không thể gán lại tham chiếu

        System.out.println("MAX_SIZE: " + MAX_SIZE);
        System.out.println("List: " + list);
    }
}
```

### Đáp án mẫu

> "Từ khóa final trong Java có ba cách dùng. Với biến, final nghĩa là chỉ được gán một lần — thường dùng cho hằng số hoặc để đảm bảo immutability. Với phương thức, final ngăn subclass override — dùng khi logic quan trọng không được thay đổi. Với class, final ngăn việc tạo subclass — ví dụ điển hình là String trong Java là final class. Một điểm tinh tế: final trên object reference giữ nguyên địa chỉ, nhưng nội dung object bên trong vẫn có thể bị thay đổi nếu object đó mutable."

---

## Câu 9: `this` và `super` trong Java khác nhau thế nào? `[Basic]`

### Câu hỏi

> *"Bạn giải thích từ khóa this và super trong Java được không? Cho tôi biết khi nào nên dùng mỗi từ khóa."*

### Giải thích lý thuyết

| Từ khóa | Tham chiếu đến | Mục đích phổ biến |
|---|---|---|
| `this` | Instance hiện tại của class | Phân biệt field/method của class với tham số cùng tên; gọi constructor khác trong cùng class |
| `super` | Phần thuộc lớp cha (parent class) | Gọi constructor lớp cha; gọi method đã bị override của lớp cha |

**Quy tắc quan trọng**:
- `this()` và `super()` phải là câu lệnh **đầu tiên** trong constructor.
- Không thể dùng cả `this()` và `super()` trong cùng một constructor.
- `super` không dùng được trong `static` method.

### Code minh hoạ

```java
class Vehicle {
    protected String brand;
    protected int year;

    public Vehicle(String brand, int year) {
        this.brand = brand; // this: phân biệt field 'brand' với tham số 'brand'
        this.year = year;
        System.out.println("Vehicle constructor chạy: " + brand);
    }

    public void describe() {
        System.out.println("Xe " + brand + " năm " + year);
    }
}

class Car extends Vehicle {
    private int doors;

    // Constructor đầy đủ tham số
    public Car(String brand, int year, int doors) {
        super(brand, year); // Gọi constructor của Vehicle — phải đặt đầu tiên
        this.doors = doors;
    }

    // Constructor rút gọn — gọi constructor khác trong cùng class
    public Car(String brand, int year) {
        this(brand, year, 4); // Gọi Car(String, int, int) — dùng this()
    }

    @Override
    public void describe() {
        super.describe(); // Gọi phương thức describe() của Vehicle
        System.out.println("Số cửa: " + doors); // this.doors hoặc chỉ doors
    }

    public void compareWithSuper() {
        System.out.println("Brand của Car (this): " + this.brand);
        // super.brand cũng hợp lệ vì brand là protected trong Vehicle
        // Nhưng thường dùng this khi cần phân biệt với biến cục bộ
    }
}

public class ThisSuperDemo {
    public static void main(String[] args) {
        Car myCar = new Car("Toyota", 2023); // Dùng constructor 2 tham số
        myCar.describe();
        // Output:
        // Vehicle constructor chạy: Toyota
        // Xe Toyota năm 2023
        // Số cửa: 4
    }
}
```

### Đáp án mẫu

> "this tham chiếu đến instance hiện tại của class, thường dùng để phân biệt field của class với tham số cùng tên, hoặc gọi constructor khác trong cùng class bằng this(). super tham chiếu đến lớp cha, dùng để gọi constructor lớp cha bằng super() hoặc gọi method của lớp cha đã bị override. Cả this() và super() đều phải là câu lệnh đầu tiên trong constructor và không thể dùng cả hai cùng lúc trong một constructor."

---

## Câu 10: Constructor overloading là gì? `[Basic]`

### Câu hỏi

> *"Constructor overloading là gì và nó giúp ích gì trong thực tế? Bạn có thể cho ví dụ không?"*

### Giải thích lý thuyết

**Constructor overloading** (nạp chồng constructor) là việc định nghĩa nhiều constructor trong cùng một class, mỗi constructor có **danh sách tham số khác nhau** (số lượng, kiểu, hoặc thứ tự tham số). Java phân biệt chúng qua **method signature** (chữ ký phương thức).

Lợi ích thực tế:
- **Tạo object linh hoạt**: người dùng class có thể tạo object với ít hoặc nhiều thông tin ban đầu.
- **Giá trị mặc định** (default values): constructor ít tham số cung cấp giá trị mặc định hợp lý.
- **API rõ ràng hơn**: thể hiện ý định khởi tạo khác nhau.
- **Tái sử dụng code** qua `this()`: tránh lặp code giữa các constructor.

**Lưu ý**: Java không có giá trị mặc định cho tham số như Python hay C++, nên constructor overloading là cách thông dụng để đạt hiệu quả tương tự.

### Code minh hoạ

```java
public class HttpRequest {
    private final String url;
    private final String method;
    private final int timeoutSeconds;
    private final String contentType;

    // Constructor đầy đủ — tất cả tham số
    public HttpRequest(String url, String method, int timeoutSeconds, String contentType) {
        this.url = url;
        this.method = method;
        this.timeoutSeconds = timeoutSeconds;
        this.contentType = contentType;
    }

    // Constructor 3 tham số — dùng contentType mặc định
    public HttpRequest(String url, String method, int timeoutSeconds) {
        this(url, method, timeoutSeconds, "application/json"); // Gọi constructor đầy đủ
    }

    // Constructor 2 tham số — dùng timeout mặc định 30 giây
    public HttpRequest(String url, String method) {
        this(url, method, 30); // Gọi constructor 3 tham số
    }

    // Constructor tối giản — chỉ cần URL, mặc định là GET
    public HttpRequest(String url) {
        this(url, "GET"); // Gọi constructor 2 tham số
    }

    @Override
    public String toString() {
        return method + " " + url + " (timeout=" + timeoutSeconds + "s, type=" + contentType + ")";
    }

    public static void main(String[] args) {
        // Các cách tạo HttpRequest khác nhau
        HttpRequest req1 = new HttpRequest("https://api.example.com/users");
        HttpRequest req2 = new HttpRequest("https://api.example.com/users", "POST");
        HttpRequest req3 = new HttpRequest("https://api.example.com/files", "POST", 60);
        HttpRequest req4 = new HttpRequest("https://api.example.com/upload", "PUT", 120, "multipart/form-data");

        System.out.println(req1); // GET https://api.example.com/users (timeout=30s, type=application/json)
        System.out.println(req2); // POST https://api.example.com/users (timeout=30s, type=application/json)
        System.out.println(req3); // POST https://api.example.com/files (timeout=60s, type=application/json)
        System.out.println(req4); // PUT https://api.example.com/upload (timeout=120s, type=multipart/form-data)
    }
}
```

### Đáp án mẫu

> "Constructor overloading là việc định nghĩa nhiều constructor trong cùng một class, mỗi cái có danh sách tham số khác nhau. Điều này giúp người dùng class linh hoạt tạo object với ít hoặc nhiều thông tin ban đầu. Ví dụ tôi hay dùng là một class HttpRequest có thể tạo chỉ với URL — Java tự dùng method GET và timeout mặc định 30 giây, hoặc truyền đầy đủ tham số khi cần. Thực hành tốt là các constructor ít tham số gọi constructor nhiều tham số hơn qua this() để tránh lặp code."

---
