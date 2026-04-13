---
sidebar_position: 12
title: "12. 4 tính chất của OOP"
---

# 4 tính chất của OOP

## Giới thiệu

Lập trình hướng đối tượng (OOP) dựa trên 4 tính chất nền tảng: **Encapsulation** (Đóng gói), **Inheritance** (Kế thừa), **Polymorphism** (Đa hình), và **Abstraction** (Trừu tượng). Bốn tính chất này không tồn tại độc lập -- chúng **phối hợp chặt chẽ** với nhau để tạo ra code dễ bảo trì, mở rộng và tái sử dụng.

Hãy hình dung OOP như một chiếc xe hơi:
- **Encapsulation**: Động cơ được đóng kín trong capô -- bạn không cần biết bên trong hoạt động thế nào, chỉ cần đạp ga.
- **Inheritance**: Xe điện kế thừa từ xe hơi -- có tất cả tính năng cơ bản, nhưng thêm pin và motor điện.
- **Polymorphism**: Cùng đạp ga, nhưng xe số sàn và xe tự động phản ứng khác nhau.
- **Abstraction**: Bạn chỉ thấy vô lăng, bàn đạp, cần số -- mọi thứ phức tạp bên dưới được ẩn đi.

---

## 1. Encapsulation -- Tính đóng gói

### Khái niệm

Encapsulation là kỹ thuật **gói dữ liệu (field) và phương thức (method) vào trong một class**, đồng thời **kiểm soát quyền truy cập** vào dữ liệu đó. Bên ngoài chỉ tương tác qua các method công khai (getter/setter), không trực tiếp sờ vào dữ liệu bên trong.

**Ví von thực tế**: Tài khoản ngân hàng -- bạn không thể tự tay sửa số dư, mà phải thông qua quầy giao dịch (method) để nạp/rút tiền. Quầy giao dịch sẽ kiểm tra hợp lệ trước khi thực hiện.

### Ví dụ

```java
public class BankAccount {
    // Dữ liệu được bảo vệ bằng private
    private String accountNumber;
    private double balance;
    private String ownerName;

    public BankAccount(String accountNumber, String ownerName, double initialBalance) {
        this.accountNumber = accountNumber;
        this.ownerName = ownerName;
        this.balance = initialBalance;
    }

    // Getter -- cho phép đọc nhưng không cho sửa trực tiếp
    public double getBalance() {
        return balance;
    }

    public String getOwnerName() {
        return ownerName;
    }

    // Method kiểm soát -- validation trước khi thay đổi state
    public void deposit(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Deposit amount must be positive");
        }
        balance += amount;
        System.out.println("Deposited: " + amount + ". New balance: " + balance);
    }

    public void withdraw(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Withdrawal amount must be positive");
        }
        if (amount > balance) {
            throw new IllegalStateException("Insufficient funds");
        }
        balance -= amount;
        System.out.println("Withdrew: " + amount + ". New balance: " + balance);
    }
}
```

**Giải thích**: Field `balance` là `private` -- bên ngoài không thể gán `account.balance = 1000000`. Muốn thay đổi số dư phải qua `deposit()` hoặc `withdraw()`, hai method này **validate** trước khi thay đổi.

### Lợi ích của Encapsulation

| Lợi ích | Giải thích |
|---|---|
| Bảo vệ dữ liệu | Không ai sửa trực tiếp, luôn qua validation |
| Dễ thay đổi nội bộ | Sửa cách tính bên trong mà không ảnh hưởng bên ngoài |
| Giảm coupling | Class khác không phụ thuộc vào cấu trúc bên trong |
| Dễ debug | Mọi thay đổi state đều đi qua một chỗ |

---

## 2. Inheritance -- Tính kế thừa

### Khái niệm

Inheritance cho phép **tạo class mới từ class đã có**, kế thừa toàn bộ field và method của class cha. Class con có thể thêm field/method mới hoặc override method của class cha.

**Ví von thực tế**: Con cái kế thừa DNA từ cha mẹ -- có những đặc điểm giống (mắt, tóc), nhưng cũng có đặc điểm riêng (tính cách, sở thích).

### Ví dụ

```java
// Class cha -- định nghĩa thuộc tính và hành vi chung
public class Smartphone {
    private String brand;
    private int batteryCapacity; // mAh
    private double screenSize;   // inches

    public Smartphone(String brand, int batteryCapacity, double screenSize) {
        this.brand = brand;
        this.batteryCapacity = batteryCapacity;
        this.screenSize = screenSize;
    }

    public void call(String number) {
        System.out.println(brand + " is calling " + number);
    }

    public void sendMessage(String number, String message) {
        System.out.println(brand + " sends to " + number + ": " + message);
    }

    public String getBrand() { return brand; }
    public int getBatteryCapacity() { return batteryCapacity; }

    public void showSpecs() {
        System.out.println(brand + " - Battery: " + batteryCapacity
            + "mAh, Screen: " + screenSize + " inches");
    }
}

// Class con -- kế thừa và mở rộng
public class GamingPhone extends Smartphone {
    private int refreshRate; // Hz
    private String coolingSystem;

    public GamingPhone(String brand, int batteryCapacity, double screenSize,
                       int refreshRate, String coolingSystem) {
        super(brand, batteryCapacity, screenSize); // gọi constructor cha
        this.refreshRate = refreshRate;
        this.coolingSystem = coolingSystem;
    }

    // Method mới -- chỉ GamingPhone có
    public void enableGameMode() {
        System.out.println(getBrand() + " Game Mode activated! "
            + refreshRate + "Hz, " + coolingSystem + " cooling");
    }

    // Override method cha
    @Override
    public void showSpecs() {
        super.showSpecs(); // gọi method cha
        System.out.println("  Gaming: " + refreshRate + "Hz, " + coolingSystem);
    }
}
```

```java
// Sử dụng
GamingPhone phone = new GamingPhone("ROG", 6000, 6.78, 165, "Vapor Chamber");
phone.call("0901234567");     // Kế thừa từ Smartphone
phone.sendMessage("0901234567", "Hello!"); // Kế thừa từ Smartphone
phone.enableGameMode();        // Method riêng của GamingPhone
phone.showSpecs();             // Override version
```

### Các loại kế thừa trong Java

| Loại | Mô tả | Java hỗ trợ? |
|---|---|---|
| Single | A extends B | Co |
| Multilevel | A extends B, B extends C | Co |
| Hierarchical | B extends A, C extends A | Co |
| Multiple (class) | C extends A, B | KHONG (dung interface thay the) |

---

## 3. Polymorphism -- Tính đa hình

### Khái niệm

Polymorphism cho phép **cùng một method gọi trên các object khác nhau cho kết quả khác nhau**. Có 2 loại:
- **Compile-time (static)**: Method overloading -- cùng tên, khác tham số.
- **Runtime (dynamic)**: Method overriding -- class con override method class cha.

**Ví von thực tế**: Nút "Play" trên remote TV -- cùng bấm nút đó, nhưng nếu đang xem YouTube thì phát video, đang nghe Spotify thì phát nhạc, đang xem Netflix thì phát phim.

### Ví dụ -- Compile-time Polymorphism (Overloading)

```java
public class Calculator {
    // Cùng tên "add" nhưng khác tham số
    public int add(int a, int b) {
        return a + b;
    }

    public double add(double a, double b) {
        return a + b;
    }

    public String add(String a, String b) {
        return a + b; // nối chuỗi
    }

    public int add(int a, int b, int c) {
        return a + b + c;
    }
}
```

### Ví dụ -- Runtime Polymorphism (Overriding)

```java
public abstract class NotificationSender {
    protected String recipient;

    public NotificationSender(String recipient) {
        this.recipient = recipient;
    }

    // Method sẽ bị override
    public abstract void send(String message);

    public void sendUrgent(String message) {
        System.out.println("[URGENT]");
        send(message); // gọi version của class con!
    }
}

public class EmailSender extends NotificationSender {
    public EmailSender(String email) {
        super(email);
    }

    @Override
    public void send(String message) {
        System.out.println("Email to " + recipient + ": " + message);
    }
}

public class SmsSender extends NotificationSender {
    public SmsSender(String phoneNumber) {
        super(phoneNumber);
    }

    @Override
    public void send(String message) {
        System.out.println("SMS to " + recipient + ": " + message);
    }
}

public class PushSender extends NotificationSender {
    public PushSender(String deviceToken) {
        super(deviceToken);
    }

    @Override
    public void send(String message) {
        System.out.println("Push to device " + recipient + ": " + message);
    }
}
```

```java
// Runtime polymorphism -- biến kiểu cha, object kiểu con
public class NotificationService {
    public static void notifyAll(List<NotificationSender> senders, String message) {
        for (NotificationSender sender : senders) {
            sender.send(message); // Gọi đúng version của từng class con!
        }
    }

    public static void main(String[] args) {
        List<NotificationSender> senders = List.of(
            new EmailSender("user@email.com"),
            new SmsSender("0901234567"),
            new PushSender("device-token-abc")
        );

        notifyAll(senders, "Server is down!");
        // Output:
        // Email to user@email.com: Server is down!
        // SMS to 0901234567: Server is down!
        // Push to device device-token-abc: Server is down!
    }
}
```

**Giải thích**: Biến `sender` có kiểu `NotificationSender` (class cha), nhưng JVM gọi đúng method `send()` của class con tại runtime. Đây chính là **dynamic dispatch**.

---

## 4. Abstraction -- Tính trừu tượng

### Khái niệm

Abstraction là **ẩn đi chi tiết phức tạp bên trong**, chỉ hiển thị những gì cần thiết ra bên ngoài. Người dùng chỉ cần biết **CÁI GÌ** có thể làm, không cần biết **LÀM NHƯ THẾ NÀO**.

**Ví von thực tế**: Bạn lái xe chỉ cần biết đạp ga là xe chạy, đạp thắng là xe dừng. Bạn không cần biết động cơ đốt cháy xăng như thế nào, hộp số chuyển lực ra sao.

### Ví dụ

```java
// Abstraction -- chỉ hiển thị "cái gì", ẩn "như thế nào"
public interface FileStorage {
    void upload(String fileName, byte[] content);
    byte[] download(String fileName);
    void delete(String fileName);
    boolean exists(String fileName);
}

// Implementation cụ thể -- chi tiết bị ẩn
public class LocalFileStorage implements FileStorage {
    private String basePath;

    public LocalFileStorage(String basePath) {
        this.basePath = basePath;
    }

    @Override
    public void upload(String fileName, byte[] content) {
        // Chi tiết: ghi file vào ổ cứng
        System.out.println("Saving " + fileName + " to " + basePath);
        // ... java.nio.file logic ...
    }

    @Override
    public byte[] download(String fileName) {
        System.out.println("Reading " + fileName + " from " + basePath);
        return new byte[0]; // simplified
    }

    @Override
    public void delete(String fileName) {
        System.out.println("Deleting " + fileName + " from " + basePath);
    }

    @Override
    public boolean exists(String fileName) {
        System.out.println("Checking " + fileName + " in " + basePath);
        return true; // simplified
    }
}

public class S3FileStorage implements FileStorage {
    private String bucketName;

    public S3FileStorage(String bucketName) {
        this.bucketName = bucketName;
    }

    @Override
    public void upload(String fileName, byte[] content) {
        // Chi tiết: gọi AWS S3 API
        System.out.println("Uploading " + fileName + " to S3 bucket " + bucketName);
    }

    @Override
    public byte[] download(String fileName) {
        System.out.println("Downloading " + fileName + " from S3 bucket " + bucketName);
        return new byte[0];
    }

    @Override
    public void delete(String fileName) {
        System.out.println("Deleting " + fileName + " from S3 bucket " + bucketName);
    }

    @Override
    public boolean exists(String fileName) {
        System.out.println("Checking " + fileName + " in S3 bucket " + bucketName);
        return true;
    }
}
```

```java
// Người dùng chỉ làm việc với interface -- không cần biết chi tiết
public class DocumentService {
    private FileStorage storage; // Chỉ biết interface

    public DocumentService(FileStorage storage) {
        this.storage = storage;
    }

    public void saveDocument(String name, byte[] content) {
        storage.upload(name, content); // Không biết lưu ở đâu, bằng cách nào
    }
}

// Đổi từ Local sang S3 -- chỉ thay implementation, code không đổi
FileStorage storage = new LocalFileStorage("/uploads");
// FileStorage storage = new S3FileStorage("my-bucket"); // swap dễ dàng
DocumentService service = new DocumentService(storage);
```

---

## 4 tính chất phối hợp với nhau

Bốn tính chất OOP không hoạt động riêng lẻ -- chúng **phối hợp** để tạo ra hệ thống mạnh mẽ. Hãy xem một ví dụ mini project: **Hệ thống quản lý nhân viên**.

```java
// ABSTRACTION: Interface định nghĩa hành vi trừu tượng
public interface Payable {
    double calculateSalary();
    String getPaymentDetails();
}

public interface Reportable {
    String generateReport();
}

// ABSTRACTION + ENCAPSULATION: Abstract class ẩn chi tiết, bảo vệ state
public abstract class Employee implements Payable {
    // ENCAPSULATION: field private, truy cập qua method
    private String id;
    private String name;
    private String department;

    public Employee(String id, String name, String department) {
        this.id = id;
        this.name = name;
        this.department = department;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getDepartment() { return department; }

    // Template method -- logic chung
    public void printPaySlip() {
        System.out.println("=== PAY SLIP ===");
        System.out.println("ID: " + id);
        System.out.println("Name: " + name);
        System.out.println("Department: " + department);
        System.out.println("Salary: " + calculateSalary());
        System.out.println("Details: " + getPaymentDetails());
        System.out.println("================");
    }

    @Override
    public String toString() {
        return name + " (" + id + ")";
    }
}

// INHERITANCE: Kế thừa từ Employee, thêm thuộc tính riêng
public class FullTimeEmployee extends Employee implements Reportable {
    private double monthlySalary;
    private double bonusRate;

    public FullTimeEmployee(String id, String name, String department,
                            double monthlySalary, double bonusRate) {
        super(id, name, department);
        this.monthlySalary = monthlySalary;
        this.bonusRate = bonusRate;
    }

    // POLYMORPHISM: Override method theo cách riêng
    @Override
    public double calculateSalary() {
        return monthlySalary + (monthlySalary * bonusRate);
    }

    @Override
    public String getPaymentDetails() {
        return "Monthly: " + monthlySalary + " + Bonus: " + (monthlySalary * bonusRate);
    }

    @Override
    public String generateReport() {
        return "Full-time employee report for " + getName();
    }
}

public class FreelanceEmployee extends Employee {
    private double hourlyRate;
    private int hoursWorked;

    public FreelanceEmployee(String id, String name, String department,
                             double hourlyRate, int hoursWorked) {
        super(id, name, department);
        this.hourlyRate = hourlyRate;
        this.hoursWorked = hoursWorked;
    }

    // POLYMORPHISM: Cùng method, kết quả khác
    @Override
    public double calculateSalary() {
        return hourlyRate * hoursWorked;
    }

    @Override
    public String getPaymentDetails() {
        return hoursWorked + " hours x " + hourlyRate + "/hr";
    }
}

public class InternEmployee extends Employee {
    private double stipend;

    public InternEmployee(String id, String name, String department, double stipend) {
        super(id, name, department);
        this.stipend = stipend;
    }

    @Override
    public double calculateSalary() {
        return stipend;
    }

    @Override
    public String getPaymentDetails() {
        return "Stipend: " + stipend;
    }
}
```

```java
// POLYMORPHISM trong thực tế: xử lý danh sách Employee đa dạng
public class PayrollSystem {
    private List<Employee> employees = new ArrayList<>();

    public void addEmployee(Employee employee) {
        employees.add(employee);
    }

    public void processPayroll() {
        System.out.println("=== PROCESSING PAYROLL ===");
        double totalCost = 0;
        for (Employee emp : employees) {
            emp.printPaySlip();          // Gọi đúng version của từng class con
            totalCost += emp.calculateSalary(); // Polymorphism!
        }
        System.out.println("Total payroll cost: " + totalCost);
    }

    // Chỉ in report cho employee có khả năng Reportable
    public void generateReports() {
        for (Employee emp : employees) {
            if (emp instanceof Reportable) {
                System.out.println(((Reportable) emp).generateReport());
            }
        }
    }

    public static void main(String[] args) {
        PayrollSystem payroll = new PayrollSystem();

        payroll.addEmployee(new FullTimeEmployee("FT001", "Nguyen Van A",
            "Engineering", 20000000, 0.1));
        payroll.addEmployee(new FreelanceEmployee("FL001", "Tran Thi B",
            "Design", 500000, 80));
        payroll.addEmployee(new InternEmployee("IN001", "Le Van C",
            "Marketing", 5000000));

        payroll.processPayroll();
        System.out.println();
        payroll.generateReports();
    }
}
```

### Phân tích 4 tính chất trong ví dụ

| Tính chất | Thể hiện qua |
|---|---|
| **Encapsulation** | Field `private` trong `Employee`, truy cập qua getter. `BankAccount` validate trước khi thay đổi `balance` |
| **Inheritance** | `FullTimeEmployee`, `FreelanceEmployee`, `InternEmployee` kế thừa từ `Employee` |
| **Polymorphism** | `calculateSalary()` cho kết quả khác nhau tùy loại employee. `PayrollSystem` xử lý List chung mà không cần biết loại cụ thể |
| **Abstraction** | Interface `Payable` ẩn chi tiết tính lương. `PayrollSystem` chỉ biết `calculateSalary()`, không biết tính như thế nào |

---

## OOP vs Procedural Programming

| Tiêu chí | OOP | Procedural |
|---|---|---|
| **Đơn vị cơ bản** | Object (data + behavior) | Function (behavior only) |
| **Tổ chức code** | Theo class/object | Theo function/module |
| **Dữ liệu** | Encapsulated trong object | Global hoặc truyền qua tham số |
| **Mở rộng** | Inheritance, Polymorphism | Copy-paste hoặc sửa function |
| **Bảo trì** | Dễ hơn (thay đổi cục bộ) | Khó hơn (thay đổi lan truyền) |
| **Phù hợp cho** | Hệ thống lớn, phức tạp | Script nhỏ, xử lý tuần tự |
| **Ví dụ ngôn ngữ** | Java, C#, Python | C, Bash, early PHP |

---

## Hiểu lầm phổ biến về OOP

### 1. "OOP là tạo thật nhiều class"
**Sai**. OOP là về **thiết kế đúng** -- đúng abstraction, đúng encapsulation. Tạo class vô tội vạ mà không suy nghĩ thì code còn tệ hơn procedural.

### 2. "Kế thừa là tính chất quan trọng nhất"
**Sai**. Nhiều developer có kinh nghiệm cho rằng **Composition over Inheritance** -- ưu tiên composition hơn kế thừa. Kế thừa sâu (A -> B -> C -> D -> E) làm code khó hiểu.

### 3. "Mọi thứ phải là object"
**Sai**. Utility functions, constants, helper methods không nhất thiết phải gói trong object. Java có static method, có primitive types vì lý do thực tế.

### 4. "Getter/Setter = Encapsulation"
**Không hoàn toàn**. Nếu bạn có getter/setter cho MỌI field mà không validation gì, thì chẳng khác nào field public. Encapsulation thực sự là **kiểm soát quyền truy cập có ý nghĩa**.

---

## Bảng tổng hợp: Khi nào tính chất nào hữu ích nhất

| Tình huống | Tính chất cần | Lý do |
|---|---|---|
| Bảo vệ dữ liệu nhạy cảm | Encapsulation | Kiểm soát ai được truy cập, cách truy cập |
| Tái sử dụng code giữa các class liên quan | Inheritance | Kế thừa field và method chung |
| Xử lý danh sách object đa dạng | Polymorphism | Gọi cùng method, kết quả khác nhau |
| Thiết kế API/interface dễ dùng | Abstraction | Ẩn chi tiết phức tạp |
| Thay đổi implementation không ảnh hưởng bên ngoài | Encapsulation + Abstraction | Field private + interface |
| Thêm loại mới mà không sửa code cũ | Inheritance + Polymorphism | Tạo class con mới, code cũ tự hoạt động |

---

## Lỗi thường gặp

### Sai: Không đóng gói -- để field public

```java
// SAI
public class Student {
    public String name;
    public int age;
    public double gpa;
}

// Bên ngoài thoải mái gán giá trị vô nghĩa
Student s = new Student();
s.age = -5;     // Tuổi âm?
s.gpa = 100.0;  // GPA 100?

// ĐÚNG
public class Student {
    private String name;
    private int age;
    private double gpa;

    public void setAge(int age) {
        if (age < 0 || age > 150) {
            throw new IllegalArgumentException("Invalid age: " + age);
        }
        this.age = age;
    }

    public void setGpa(double gpa) {
        if (gpa < 0.0 || gpa > 4.0) {
            throw new IllegalArgumentException("GPA must be between 0.0 and 4.0");
        }
        this.gpa = gpa;
    }
}
```

### Sai: Kế thừa quá sâu

```java
// SAI -- chain kế thừa quá dài
class LivingThing {}
class Animal extends LivingThing {}
class Mammal extends Animal {}
class DomesticAnimal extends Mammal {}
class Pet extends DomesticAnimal {}
class Dog extends Pet {}
class GoldenRetriever extends Dog {}
// Sửa LivingThing -> ảnh hưởng 6 tầng bên dưới!

// ĐÚNG -- giữ kế thừa nông, dùng interface cho khả năng
class Animal {}
class Dog extends Animal implements Trainable, Adoptable {}
class GoldenRetriever extends Dog {}
```

### Sai: Nhầm overloading và overriding

```java
public class Parent {
    public void greet(String name) {
        System.out.println("Hello, " + name);
    }
}

// SAI -- tưởng là overriding nhưng thực ra là overloading
public class Child extends Parent {
    // Khác tham số -> đây là OVERLOADING, không phải OVERRIDING
    public void greet(String name, String title) {
        System.out.println("Hello, " + title + " " + name);
    }
}

// ĐÚNG -- overriding phải cùng signature
public class Child extends Parent {
    @Override // Annotation giúp compiler kiểm tra
    public void greet(String name) {
        System.out.println("Hi there, " + name + "!");
    }
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: Giải thích 4 tính chất OOP và cho ví dụ thực tế

**Trả lời**: (1) **Encapsulation**: Gói data và method vào class, kiểm soát truy cập. Ví dụ: class `BankAccount` có `balance` private, chỉ thay đổi qua `deposit()` và `withdraw()`. (2) **Inheritance**: Tạo class mới từ class đã có, tái sử dụng code. Ví dụ: `GamingPhone extends Smartphone`. (3) **Polymorphism**: Cùng method cho kết quả khác tùy object. Ví dụ: `calculateSalary()` cho kết quả khác nhau giữa FullTime, Freelance, Intern. (4) **Abstraction**: Ẩn chi tiết, chỉ hiện cái cần. Ví dụ: interface `FileStorage` có `upload()`, `download()` -- người dùng không cần biết lưu ở local hay S3.

### Câu 2: Phân biệt Overloading và Overriding

**Trả lời**: **Overloading** (compile-time polymorphism): cùng tên method, khác danh sách tham số (số lượng, kiểu, thứ tự), trong cùng class hoặc class con. Compiler quyết định gọi method nào. **Overriding** (runtime polymorphism): class con định nghĩa lại method của class cha với **cùng signature** (tên, tham số, return type). JVM quyết định gọi method nào dựa trên kiểu thực tế của object.

### Câu 3: Tại sao nên ưu tiên Composition hơn Inheritance?

**Trả lời**: Inheritance tạo **coupling chặt** giữa class cha và con -- thay đổi class cha có thể phá vỡ class con. Inheritance cũng bị giới hạn single inheritance trong Java. Composition linh hoạt hơn: một class "có" (HAS-A) các thành phần, thay vì "là" (IS-A). Có thể thay đổi behavior tại runtime bằng cách swap component. Ví dụ: thay vì `class RobotDuck extends Duck`, dùng `class RobotDuck` có field `FlyBehavior` và `SwimBehavior` -- dễ dàng thay đổi cách bay, cách bơi.

### Câu 4: Abstraction và Encapsulation khác nhau thế nào?

**Trả lời**: **Abstraction** tập trung vào **ẩn chi tiết phức tạp** -- chỉ hiện "cái gì" có thể làm, ẩn "làm thế nào". Thường implement qua abstract class/interface. **Encapsulation** tập trung vào **bảo vệ dữ liệu** -- gói data và method lại, kiểm soát quyền truy cập qua access modifier. Abstraction là thiết kế ở mức **khái niệm** (ẩn độ phức tạp), Encapsulation là cơ chế **kỹ thuật** (ẩn dữ liệu). Ví dụ: interface `List` là abstraction (ẩn cách lưu trữ), field `private size` trong `ArrayList` là encapsulation (bảo vệ dữ liệu).

### Câu 5: Cho ví dụ runtime polymorphism phá vỡ nguyên lý Liskov

**Trả lời**: Ví dụ kinh điển: `Square extends Rectangle`. Rectangle có `setWidth()` và `setHeight()` independent. Nhưng Square override cả hai để luôn giữ width = height. Code `Rectangle r = new Square(); r.setWidth(5); r.setHeight(3);` -- mong đợi area = 15 nhưng thực tế area = 9 (vì Square set height = 3 cũng set width = 3). Đây là vi phạm Liskov -- Square không thể thay thế Rectangle mà giữ đúng hành vi. Giải pháp: không cho Square extends Rectangle, mà tạo interface `Shape` chung với method `getArea()`.

---

## Tổng kết

Bốn tính chất OOP là nền tảng để thiết kế phần mềm tốt:

- **Encapsulation**: Bảo vệ dữ liệu, giảm coupling.
- **Inheritance**: Tái sử dụng code, mở rộng hệ thống.
- **Polymorphism**: Linh hoạt, xử lý đa dạng object.
- **Abstraction**: Đơn giản hóa, ẩn phức tạp.

Khi sử dụng, hãy nhớ: 4 tính chất này **không phải mục đích** mà là **công cụ**. Mục đích cuối cùng là code **dễ đọc, dễ bảo trì, dễ mở rộng**. Đừng ép OOP vào mọi nơi -- hãy dùng đúng lúc, đúng chỗ.
