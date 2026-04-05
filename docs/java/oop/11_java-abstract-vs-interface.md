---
sidebar_position: 11
title: "So sánh Abstract Class và Interface"
---

# So sánh Abstract Class và Interface

## Giới thiệu

Nếu bạn đã học qua abstract class và interface, chắc hẳn bạn từng tự hỏi: "Hai thứ này khác nhau chỗ nào? Khi nào dùng cái nào?" Đây là một trong những câu hỏi **kinh điển nhất** trong phỏng vấn Java, và cũng là chủ đề mà nhiều bạn mới học hay bị nhầm lẫn.

Hãy tưởng tượng thế này:
- **Abstract class** giống như một **bản thiết kế nhà** -- nó đã có sẵn một số phòng (method có thân), nhưng vẫn để trống một số phòng cho bạn tự thiết kế (abstract method). Tất cả các ngôi nhà xây từ bản thiết kế này đều có chung nền móng.
- **Interface** giống như một **hợp đồng** -- nó chỉ ghi "nhà phải có phòng ngủ, phòng bếp, phòng tắm" nhưng không nói phòng trông như thế nào. Bạn tự quyết định cách xây.

Trong bài này, chúng ta sẽ đi sâu vào so sánh, phân tích khi nào nên dùng cái nào, và xem các thay đổi quan trọng từ Java 8, 9.

---

## Ôn nhanh Abstract Class

Abstract class là lớp được khai báo với từ khóa `abstract`. Nó **không thể tạo object trực tiếp**, nhưng có thể chứa cả method có thân lẫn method trừu tượng.

```java
public abstract class Vehicle {
    // Field bình thường -- có thể có bất kỳ access modifier nào
    private String brand;
    protected int year;

    // Constructor -- abstract class CÓ constructor
    public Vehicle(String brand, int year) {
        this.brand = brand;
        this.year = year;
    }

    // Method có thân -- logic dùng chung cho tất cả lớp con
    public String getBrand() {
        return brand;
    }

    // Abstract method -- bắt buộc lớp con phải implement
    public abstract void startEngine();

    // Method bình thường
    public void honk() {
        System.out.println("Beep beep!");
    }
}
```

Lớp con kế thừa abstract class:

```java
public class Car extends Vehicle {
    public Car(String brand, int year) {
        super(brand, year);
    }

    @Override
    public void startEngine() {
        System.out.println(getBrand() + " car engine starts: Vroom!");
    }
}
```

**Điểm mấu chốt**: Abstract class phù hợp khi các lớp con có **quan hệ IS-A** rõ ràng và **chia sẻ trạng thái (state)** chung.

---

## Ôn nhanh Interface

Interface là một "bản hợp đồng" -- nó định nghĩa **hành vi** mà class phải thực hiện, nhưng không quy định cách thực hiện.

```java
public interface Drivable {
    // Tất cả method mặc định là public abstract
    void drive();

    void brake();

    // Field mặc định là public static final (hằng số)
    int MAX_SPEED = 200; // tương đương public static final int MAX_SPEED = 200;
}
```

Class implement interface:

```java
public class Motorcycle implements Drivable {
    @Override
    public void drive() {
        System.out.println("Motorcycle is driving");
    }

    @Override
    public void brake() {
        System.out.println("Motorcycle brakes applied");
    }
}
```

**Điểm mấu chốt**: Interface phù hợp khi bạn muốn định nghĩa **khả năng (capability)** mà nhiều class không liên quan đều có thể có.

---

## Bảng so sánh chi tiết

| Tiêu chí | Abstract Class | Interface |
|---|---|---|
| **Từ khóa** | `abstract class` | `interface` |
| **Constructor** | Co -- lớp con gọi qua `super()` | Khong co |
| **Field (biến)** | Mọi loại: `private`, `protected`, `public`, `static`, instance | Chi `public static final` (hang so) |
| **Method có thân** | Co (method thuong va abstract) | Java 8+: `default`, `static`. Java 9+: `private` |
| **Abstract method** | Co -- khai bao voi `abstract` | Co -- mac dinh tat ca method la abstract (truoc Java 8) |
| **Access modifier cho method** | Mọi loại: `public`, `protected`, `private`, default | Chi `public` (method abstract). `private` tu Java 9 |
| **Đa kế thừa** | KHONG -- mot class chi extends 1 abstract class | CO -- mot class co the implements nhieu interface |
| **Ke thua lan nhau** | Abstract class extends abstract class khac | Interface extends nhieu interface khac |
| **Biến instance** | Co -- luu tru trang thai | Khong co -- chi co hang so |
| **Static method** | Co | Java 8+: Co, nhung KHONG bi ke thua |
| **Tốc độ** | Nhanh hon mot chut | Cham hon mot chut (do lookup table) |
| **Khi nào dùng** | Chia se code + trang thai giua cac lop con lien quan | Dinh nghia kha nang cho cac lop KHONG lien quan |
| **Từ khóa sử dụng** | `extends` | `implements` |

---

## Thay đổi quan trọng từ Java 8

Trước Java 8, interface **chỉ có thể chứa** abstract method và hằng số. Nhưng từ Java 8, mọi thứ thay đổi đáng kể.

### Default method

Default method cho phép bạn thêm method **có thân** vào interface mà không phá vỡ các class đã implement nó.

```java
public interface Loggable {
    // Abstract method -- bắt buộc implement
    String getLogPrefix();

    // Default method -- có thân, class con KHÔNG bắt buộc override
    default void log(String message) {
        System.out.println("[" + getLogPrefix() + "] " + message);
    }
}

public class OrderService implements Loggable {
    @Override
    public String getLogPrefix() {
        return "ORDER";
    }

    // Không cần override log() -- dùng mặc định
}

public class UserService implements Loggable {
    @Override
    public String getLogPrefix() {
        return "USER";
    }

    // Override để tùy chỉnh
    @Override
    public void log(String message) {
        System.out.println("[" + getLogPrefix() + "] "
            + java.time.LocalDateTime.now() + " - " + message);
    }
}
```

### Static method trong interface

```java
public interface StringUtils {
    // Static method -- gọi qua tên interface, KHÔNG bị kế thừa
    static boolean isNullOrEmpty(String str) {
        return str == null || str.isEmpty();
    }

    static String capitalize(String str) {
        if (isNullOrEmpty(str)) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }
}

// Sử dụng
String result = StringUtils.capitalize("hello"); // "Hello"
```

### Xung đột default method (Diamond Problem)

Khi một class implement 2 interface có cùng default method, Java **bắt buộc** class đó phải override:

```java
interface A {
    default void hello() {
        System.out.println("Hello from A");
    }
}

interface B {
    default void hello() {
        System.out.println("Hello from B");
    }
}

// PHẢI override để giải quyết xung đột
class MyClass implements A, B {
    @Override
    public void hello() {
        // Có thể gọi lại default method của interface cụ thể
        A.super.hello(); // Gọi hello() từ A
    }
}
```

---

## Thay đổi từ Java 9: Private method trong Interface

Java 9 cho phép interface có **private method** -- giúp tái sử dụng code giữa các default method mà không lộ ra bên ngoài.

```java
public interface DataProcessor {
    void process(String data);

    default void processWithLogging(String data) {
        logStart(data);
        process(data);
        logEnd(data);
    }

    default void processWithValidation(String data) {
        if (data == null || data.isEmpty()) {
            System.out.println("Invalid data!");
            return;
        }
        logStart(data);
        process(data);
        logEnd(data);
    }

    // Private method -- chỉ dùng nội bộ trong interface
    private void logStart(String data) {
        System.out.println("Start processing: " + data);
    }

    private void logEnd(String data) {
        System.out.println("End processing: " + data);
    }
}
```

---

## Khi nào dùng Abstract Class?

Dùng abstract class khi:

1. **Các lớp con có quan hệ IS-A rõ ràng**: Dog IS-A Animal, Car IS-A Vehicle.
2. **Cần chia sẻ trạng thái (state)**: Các lớp con cần truy cập field chung (ví dụ: `name`, `id`).
3. **Cần constructor**: Bạn muốn khởi tạo state chung cho tất cả lớp con.
4. **Có logic chung phức tạp**: Nhiều method dùng chung mà không phải chỉ là "contract".

```java
// Abstract class phù hợp vì: Employee có state chung (name, salary)
// và logic chung (calculateBonus dựa trên salary)
public abstract class Employee {
    private String name;
    private double salary;

    public Employee(String name, double salary) {
        this.name = name;
        this.salary = salary;
    }

    public double getSalary() {
        return salary;
    }

    public String getName() {
        return name;
    }

    // Logic chung cho tất cả employee
    public double calculateBonus() {
        return salary * getBonusRate();
    }

    // Mỗi loại employee có bonus rate khác nhau
    protected abstract double getBonusRate();
}

public class Manager extends Employee {
    public Manager(String name, double salary) {
        super(name, salary);
    }

    @Override
    protected double getBonusRate() {
        return 0.2; // Manager được 20% bonus
    }
}

public class Developer extends Employee {
    public Developer(String name, double salary) {
        super(name, salary);
    }

    @Override
    protected double getBonusRate() {
        return 0.15; // Developer được 15% bonus
    }
}
```

---

## Khi nào dùng Interface?

Dùng interface khi:

1. **Các class KHÔNG có quan hệ họ hàng**: Bird và Airplane đều `Flyable`, nhưng không cùng họ.
2. **Cần đa kế thừa**: Một class cần nhiều "khả năng".
3. **Định nghĩa contract/API**: Bạn muốn các team khác implement theo chuẩn.
4. **Cần tính linh hoạt cao**: Dễ dàng swap implementation.

```java
// Interface phù hợp vì: Flyable là KHẢ NĂNG, không phải quan hệ họ hàng
public interface Flyable {
    void fly();
    double getMaxAltitude();
}

public interface Swimmable {
    void swim();
    double getMaxDepth();
}

// Bird có thể bay
public class Eagle implements Flyable {
    @Override
    public void fly() {
        System.out.println("Eagle soars high in the sky");
    }

    @Override
    public double getMaxAltitude() {
        return 3000; // meters
    }
}

// Duck vừa bay vừa bơi -- đa kế thừa!
public class Duck implements Flyable, Swimmable {
    @Override
    public void fly() {
        System.out.println("Duck flies low");
    }

    @Override
    public double getMaxAltitude() {
        return 500;
    }

    @Override
    public void swim() {
        System.out.println("Duck paddles in the lake");
    }

    @Override
    public double getMaxDepth() {
        return 2;
    }
}

// Airplane cũng bay -- nhưng KHÔNG phải là Bird!
public class Airplane implements Flyable {
    @Override
    public void fly() {
        System.out.println("Airplane takes off");
    }

    @Override
    public double getMaxAltitude() {
        return 12000;
    }
}
```

---

## Design Pattern: Template Method (Abstract Class)

Template Method pattern sử dụng abstract class để định nghĩa **khung thuật toán**, cho phép lớp con tùy chỉnh từng bước.

```java
public abstract class ReportGenerator {
    // Template method -- định nghĩa thuật toán, KHÔNG cho override
    public final void generateReport() {
        fetchData();
        processData();
        formatReport();
        exportReport();
    }

    // Các bước cụ thể -- lớp con tùy chỉnh
    protected abstract void fetchData();
    protected abstract void processData();

    // Hook method -- có default implementation, lớp con CÓ THỂ override
    protected void formatReport() {
        System.out.println("Formatting as plain text...");
    }

    protected abstract void exportReport();
}

public class PdfReportGenerator extends ReportGenerator {
    @Override
    protected void fetchData() {
        System.out.println("Fetching data from database...");
    }

    @Override
    protected void processData() {
        System.out.println("Processing data for PDF...");
    }

    @Override
    protected void formatReport() {
        System.out.println("Formatting as PDF layout...");
    }

    @Override
    protected void exportReport() {
        System.out.println("Exporting to report.pdf");
    }
}

public class ExcelReportGenerator extends ReportGenerator {
    @Override
    protected void fetchData() {
        System.out.println("Fetching data from API...");
    }

    @Override
    protected void processData() {
        System.out.println("Processing data for Excel...");
    }

    @Override
    protected void exportReport() {
        System.out.println("Exporting to report.xlsx");
    }
}
```

---

## Design Pattern: Strategy (Interface)

Strategy pattern sử dụng interface để **swap thuật toán** linh hoạt tại runtime.

```java
// Interface định nghĩa strategy
public interface PaymentStrategy {
    void pay(double amount);
    String getPaymentMethod();
}

// Các implementation khác nhau
public class CreditCardPayment implements PaymentStrategy {
    private String cardNumber;

    public CreditCardPayment(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    @Override
    public void pay(double amount) {
        System.out.println("Paid " + amount + " via Credit Card: " + cardNumber);
    }

    @Override
    public String getPaymentMethod() {
        return "Credit Card";
    }
}

public class MomoPayment implements PaymentStrategy {
    private String phoneNumber;

    public MomoPayment(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    @Override
    public void pay(double amount) {
        System.out.println("Paid " + amount + " via MoMo: " + phoneNumber);
    }

    @Override
    public String getPaymentMethod() {
        return "MoMo";
    }
}

// Context class -- sử dụng strategy
public class ShoppingCart {
    private PaymentStrategy paymentStrategy;

    public void setPaymentStrategy(PaymentStrategy strategy) {
        this.paymentStrategy = strategy;
    }

    public void checkout(double total) {
        if (paymentStrategy == null) {
            System.out.println("Please select a payment method!");
            return;
        }
        System.out.println("Checking out with " + paymentStrategy.getPaymentMethod());
        paymentStrategy.pay(total);
    }
}

// Sử dụng
public class Main {
    public static void main(String[] args) {
        ShoppingCart cart = new ShoppingCart();

        // Thanh toán bằng Credit Card
        cart.setPaymentStrategy(new CreditCardPayment("1234-5678-9012-3456"));
        cart.checkout(500000);

        // Đổi sang MoMo -- linh hoạt!
        cart.setPaymentStrategy(new MomoPayment("0901234567"));
        cart.checkout(200000);
    }
}
```

---

## Ví dụ thực tế: Hệ thống thanh toán kết hợp cả hai

Trong thực tế, chúng ta thường **kết hợp** abstract class và interface:

```java
// Interface định nghĩa khả năng
public interface Refundable {
    void refund(double amount);
}

public interface Trackable {
    String getTransactionId();
    String getStatus();
}

// Abstract class chia sẻ state và logic chung
public abstract class AbstractPayment implements Trackable {
    private String transactionId;
    private String status;
    private double amount;

    public AbstractPayment(double amount) {
        this.transactionId = "TXN-" + System.currentTimeMillis();
        this.status = "PENDING";
        this.amount = amount;
    }

    public double getAmount() { return amount; }

    @Override
    public String getTransactionId() { return transactionId; }

    @Override
    public String getStatus() { return status; }

    protected void setStatus(String status) { this.status = status; }

    // Template method
    public final void execute() {
        validate();
        processPayment();
        setStatus("COMPLETED");
        sendNotification();
    }

    protected abstract void validate();
    protected abstract void processPayment();

    protected void sendNotification() {
        System.out.println("Transaction " + transactionId + " completed.");
    }
}

// Credit Card: có thể refund
public class CreditCardPay extends AbstractPayment implements Refundable {
    private String cardNumber;

    public CreditCardPay(double amount, String cardNumber) {
        super(amount);
        this.cardNumber = cardNumber;
    }

    @Override
    protected void validate() {
        if (cardNumber == null || cardNumber.length() != 16) {
            throw new IllegalArgumentException("Invalid card number");
        }
    }

    @Override
    protected void processPayment() {
        System.out.println("Processing credit card payment: " + getAmount());
    }

    @Override
    public void refund(double amount) {
        System.out.println("Refunding " + amount + " to card " + cardNumber);
        setStatus("REFUNDED");
    }
}

// Cash: KHÔNG thể refund (không implement Refundable)
public class CashPayment extends AbstractPayment {
    public CashPayment(double amount) {
        super(amount);
    }

    @Override
    protected void validate() {
        if (getAmount() <= 0) {
            throw new IllegalArgumentException("Invalid amount");
        }
    }

    @Override
    protected void processPayment() {
        System.out.println("Cash payment received: " + getAmount());
    }
}
```

Trong ví dụ trên:
- **`AbstractPayment`** (abstract class): chia sẻ state (`transactionId`, `status`, `amount`) và logic chung (`execute()` template method).
- **`Refundable`** (interface): định nghĩa khả năng hoàn tiền -- chỉ một số loại thanh toán hỗ trợ.
- **`Trackable`** (interface): định nghĩa khả năng theo dõi giao dịch.

---

## Lỗi thường gặp

### Sai: Dùng abstract class khi chỉ cần interface

```java
// SAI -- chỉ có abstract method, không có state hay logic chung
public abstract class Printable {
    public abstract void print();
    public abstract String getFormat();
}

// ĐÚNG -- dùng interface vì chỉ định nghĩa contract
public interface Printable {
    void print();
    String getFormat();
}
```

### Sai: Dùng interface khi cần chia sẻ state

```java
// SAI -- interface không lưu trữ được state
public interface Animal {
    // Đây là hằng số, KHÔNG phải biến instance!
    String name = ""; // public static final -- giống nhau cho mọi object
}

// ĐÚNG -- dùng abstract class khi cần state
public abstract class Animal {
    private String name; // mỗi object có name riêng

    public Animal(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
```

### Sai: Quên giải quyết Diamond Problem

```java
interface Logger {
    default void log(String msg) {
        System.out.println("Logger: " + msg);
    }
}

interface Auditor {
    default void log(String msg) {
        System.out.println("Auditor: " + msg);
    }
}

// SAI -- compile error! Phải override
class Service implements Logger, Auditor {
    // Không override log() --> lỗi biên dịch
}

// ĐÚNG
class Service implements Logger, Auditor {
    @Override
    public void log(String msg) {
        Logger.super.log(msg); // chọn implementation cụ thể
    }
}
```

### Sai: Nhầm lẫn static method trong interface

```java
interface MyInterface {
    static void hello() {
        System.out.println("Hello from interface");
    }
}

class MyClass implements MyInterface {}

// SAI -- static method trong interface KHÔNG bị kế thừa
MyClass.hello(); // Compile error!

// ĐÚNG
MyInterface.hello(); // OK
```

---

## Câu hỏi phỏng vấn

### Câu 1: Khi nào dùng abstract class, khi nào dùng interface?

**Trả lời**: Dùng **abstract class** khi các lớp con có quan hệ IS-A và cần chia sẻ state (field) hoặc logic chung. Dùng **interface** khi muốn định nghĩa khả năng (capability) mà nhiều class không liên quan đều có thể implement. Ví dụ: `Dog extends Animal` (abstract class vì Dog IS-A Animal, chia sẻ `name`, `age`), nhưng `Dog implements Trainable` (interface vì không phải tất cả Animal đều trainable, và Robot cũng có thể Trainable).

### Câu 2: Java 8 thêm default method vào interface -- vậy interface và abstract class còn khác nhau không?

**Trả lời**: Vẫn khác nhau rõ ràng. Interface vẫn **không có constructor**, **không lưu state** (chỉ có hằng số `public static final`), và **không có field thông thường**. Abstract class có constructor, lưu state qua field instance, và hỗ trợ mọi access modifier. Default method trong interface chỉ giải quyết vấn đề backward compatibility -- thêm method mới vào interface mà không phá vỡ code cũ.

### Câu 3: Giải thích Diamond Problem trong Java

**Trả lời**: Diamond Problem xảy ra khi một class implement 2 interface cùng có default method trùng tên. Ví dụ: `class C implements A, B` mà cả A và B đều có `default void hello()`. Java giải quyết bằng cách **bắt buộc class C phải override method đó**. Trong override, có thể gọi `A.super.hello()` hoặc `B.super.hello()` để chọn implementation cụ thể. Với abstract class, Java tránh Diamond Problem bằng cách **không cho phép đa kế thừa class**.

### Câu 4: Tại sao Java không hỗ trợ đa kế thừa class nhưng cho phép implement nhiều interface?

**Trả lời**: Đa kế thừa class gây ra vấn đề **ambiguity về state** -- nếu class A và B đều có field `name`, class C extends cả hai thì `name` lấy từ đâu? Interface không có vấn đề này vì **không có state** (chỉ có hằng số). Với default method (Java 8+), nếu xung đột xảy ra, Java bắt buộc phải override -- giải quyết rõ ràng.

### Câu 5: Cho ví dụ thực tế kết hợp abstract class và interface

**Trả lời**: Hệ thống notification: `AbstractNotification` (abstract class) chứa state chung (`recipient`, `message`, `timestamp`) và template method `send()`. `Retryable` (interface) định nghĩa khả năng gửi lại khi thất bại. `Schedulable` (interface) định nghĩa khả năng lên lịch gửi. `EmailNotification extends AbstractNotification implements Retryable, Schedulable` -- email có state chung, có thể retry và schedule. `SmsNotification extends AbstractNotification implements Retryable` -- SMS retry được nhưng không schedule. `PushNotification extends AbstractNotification` -- push notification đơn giản, không retry, không schedule.

---

## Tổng kết

| Cần gì? | Dùng gì? |
|---|---|
| Chia sẻ state (field) giữa các lớp con | Abstract Class |
| Constructor cho lớp con | Abstract Class |
| Đa kế thừa | Interface |
| Định nghĩa contract cho các class không liên quan | Interface |
| Template Method pattern | Abstract Class |
| Strategy pattern | Interface |
| Backward compatibility khi thêm method mới | Interface (default method) |
| Kết hợp cả hai | Abstract class implements interface |

Trong thực tế, các framework lớn như Spring Boot **kết hợp cả hai**: interface để định nghĩa contract (`JpaRepository`), abstract class để chia sẻ logic chung (`AbstractJpaRepository`). Hiểu rõ khi nào dùng cái nào sẽ giúp bạn thiết kế hệ thống linh hoạt và dễ bảo trì.
