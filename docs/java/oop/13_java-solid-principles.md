---
sidebar_position: 13
title: "Nguyên lý SOLID"
---

# Nguyên lý SOLID

## Giới thiệu

SOLID là tập hợp 5 nguyên lý thiết kế hướng đối tượng được giới thiệu bởi Robert C. Martin (Uncle Bob). Đây không phải là "luật cứng" mà là **kim chỉ nam** giúp bạn viết code dễ bảo trì, mở rộng và test.

Hãy tưởng tượng bạn đang xây nhà:
- Nếu xây không theo nguyên tắc, sau này muốn thêm phòng phải đập cả bức tường chịu lực.
- Nếu xây theo nguyên tắc SOLID, thêm phòng chỉ cần nối thêm vào mà không ảnh hưởng phần cũ.

SOLID giúp code của bạn:
- **Dễ mở rộng**: Thêm tính năng mới không phá code cũ
- **Dễ bảo trì**: Sửa bug ở một chỗ không gây bug chỗ khác
- **Dễ test**: Mỗi phần nhỏ, độc lập, test được riêng
- **Dễ hiểu**: Code rõ ràng, mỗi phần có trách nhiệm rõ

| Chữ cái | Nguyên lý | Ý nghĩa ngắn gọn |
|---|---|---|
| **S** | Single Responsibility | Mỗi class chỉ một trách nhiệm |
| **O** | Open/Closed | Mở cho mở rộng, đóng cho sửa đổi |
| **L** | Liskov Substitution | Class con thay thế được class cha |
| **I** | Interface Segregation | Nhiều interface nhỏ hơn một interface lớn |
| **D** | Dependency Inversion | Phụ thuộc vào abstraction, không phải implementation |

---

## S -- Single Responsibility Principle (SRP)

### Nguyên lý

> **Một class chỉ nên có MỘT lý do để thay đổi.**

Mỗi class chỉ nên đảm nhiệm **một trách nhiệm duy nhất**. Nếu một class làm quá nhiều việc, bất kỳ thay đổi nào cũng có nguy cơ phá vỡ những phần không liên quan.

**Ví von thực tế**: Trong nhà hàng, đầu bếp nấu ăn, phục vụ bưng đồ, thu ngân tính tiền. Nếu một người làm cả 3 việc, nhà hàng đông khách sẽ hỗn loạn. Mỗi người một việc thì mọi thứ trôi chảy.

### Vi phạm SRP

```java
// SAI: Class này làm quá nhiều việc
public class UserService {
    // Trách nhiệm 1: Quản lý user
    public User createUser(String name, String email) {
        User user = new User(name, email);
        // logic tạo user...
        return user;
    }

    // Trách nhiệm 2: Validation
    public boolean isValidEmail(String email) {
        return email != null && email.contains("@");
    }

    // Trách nhiệm 3: Gửi email
    public void sendWelcomeEmail(User user) {
        System.out.println("Sending welcome email to " + user.getEmail());
        // logic gửi email...
    }

    // Trách nhiệm 4: Logging
    public void logUserActivity(User user, String activity) {
        System.out.println("[LOG] " + user.getName() + ": " + activity);
    }

    // Trách nhiệm 5: Export dữ liệu
    public String exportToJson(User user) {
        return "{\"name\":\"" + user.getName() + "\"}";
    }
}
```

**Vấn đề**: Thay đổi cách gửi email -> phải sửa `UserService`. Thay đổi format log -> phải sửa `UserService`. Bất kỳ thay đổi nào cũng ảnh hưởng class này.

### Áp dụng SRP

```java
// ĐÚNG: Mỗi class một trách nhiệm

// Trách nhiệm: Quản lý user
public class UserService {
    private final UserValidator validator;
    private final EmailService emailService;
    private final UserRepository repository;

    public UserService(UserValidator validator, EmailService emailService,
                       UserRepository repository) {
        this.validator = validator;
        this.emailService = emailService;
        this.repository = repository;
    }

    public User createUser(String name, String email) {
        validator.validateEmail(email);
        User user = new User(name, email);
        repository.save(user);
        emailService.sendWelcomeEmail(user);
        return user;
    }
}

// Trách nhiệm: Validation
public class UserValidator {
    public void validateEmail(String email) {
        if (email == null || !email.contains("@")) {
            throw new IllegalArgumentException("Invalid email: " + email);
        }
    }

    public void validateName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Name cannot be empty");
        }
    }
}

// Trách nhiệm: Gửi email
public class EmailService {
    public void sendWelcomeEmail(User user) {
        System.out.println("Sending welcome email to " + user.getEmail());
    }

    public void sendPasswordResetEmail(User user, String token) {
        System.out.println("Sending password reset to " + user.getEmail());
    }
}

// Trách nhiệm: Lưu trữ dữ liệu
public class UserRepository {
    public void save(User user) {
        System.out.println("Saving user to database: " + user.getName());
    }

    public User findByEmail(String email) {
        System.out.println("Finding user by email: " + email);
        return null; // simplified
    }
}
```

**Kết quả**: Thay đổi cách gửi email? Chỉ sửa `EmailService`. Thay đổi validation? Chỉ sửa `UserValidator`. Mỗi class có **một lý do duy nhất để thay đổi**.

---

## O -- Open/Closed Principle (OCP)

### Nguyên lý

> **Mở cho mở rộng (extension), đóng cho sửa đổi (modification).**

Khi cần thêm tính năng mới, bạn nên **thêm code mới** (extend) thay vì **sửa code cũ đang chạy ổn** (modify). Code cũ đã test, đã deploy -- sửa nó có nguy cơ gây bug.

**Ví von thực tế**: Ổ cắm điện trong nhà. Khi mua thiết bị mới (quạt, TV, máy giặt), bạn chỉ cần **cắm phích vào ổ** (extension), không cần **đục tường đi lại dây điện** (modification).

### Vi phạm OCP

```java
// SAI: Mỗi lần thêm loại discount mới phải SỬA class này
public class DiscountCalculator {
    public double calculateDiscount(String customerType, double amount) {
        if (customerType.equals("REGULAR")) {
            return amount * 0.05;
        } else if (customerType.equals("VIP")) {
            return amount * 0.15;
        } else if (customerType.equals("PREMIUM")) {
            return amount * 0.20;
        }
        // Thêm loại mới? Phải sửa method này!
        // else if (customerType.equals("STUDENT")) { ... }
        // else if (customerType.equals("EMPLOYEE")) { ... }
        return 0;
    }
}
```

### Áp dụng OCP

```java
// ĐÚNG: Thêm loại discount mới bằng cách TẠO class mới, không sửa code cũ

public interface DiscountStrategy {
    double calculate(double amount);
    String getCustomerType();
}

public class RegularDiscount implements DiscountStrategy {
    @Override
    public double calculate(double amount) {
        return amount * 0.05;
    }

    @Override
    public String getCustomerType() {
        return "REGULAR";
    }
}

public class VipDiscount implements DiscountStrategy {
    @Override
    public double calculate(double amount) {
        return amount * 0.15;
    }

    @Override
    public String getCustomerType() {
        return "VIP";
    }
}

public class PremiumDiscount implements DiscountStrategy {
    @Override
    public double calculate(double amount) {
        return amount * 0.20;
    }

    @Override
    public String getCustomerType() {
        return "PREMIUM";
    }
}

// Thêm loại mới? Chỉ TẠO class mới, KHÔNG sửa code cũ!
public class StudentDiscount implements DiscountStrategy {
    @Override
    public double calculate(double amount) {
        return amount * 0.10;
    }

    @Override
    public String getCustomerType() {
        return "STUDENT";
    }
}

// Calculator KHÔNG cần sửa khi thêm loại discount mới
public class DiscountCalculator {
    private final Map<String, DiscountStrategy> strategies = new HashMap<>();

    public void registerStrategy(DiscountStrategy strategy) {
        strategies.put(strategy.getCustomerType(), strategy);
    }

    public double calculateDiscount(String customerType, double amount) {
        DiscountStrategy strategy = strategies.get(customerType);
        if (strategy == null) {
            throw new IllegalArgumentException("Unknown customer type: " + customerType);
        }
        return strategy.calculate(amount);
    }
}
```

---

## L -- Liskov Substitution Principle (LSP)

### Nguyên lý

> **Class con phải có thể thay thế class cha mà không làm sai hành vi của chương trình.**

Nếu `B` là con của `A`, thì mọi nơi dùng `A` đều có thể thay bằng `B` mà code vẫn đúng. Nếu class con thay đổi hành vi của class cha theo cách "bất ngờ", đó là vi phạm LSP.

**Ví von thực tế**: Nếu bạn thuê "tài xế" (class cha), bạn mong đợi họ lái xe đưa bạn từ A đến B. Nếu "tài xế tập sự" (class con) lại lái ngược hướng hoặc từ chối lái -- đó là vi phạm LSP. Tài xế tập sự phải thực hiện đúng nhiệm vụ của tài xế, dù có thể lái chậm hơn.

### Vi phạm LSP -- Ví dụ kinh điển

```java
// SAI: Square vi phạm LSP khi kế thừa Rectangle
public class Rectangle {
    protected int width;
    protected int height;

    public void setWidth(int width) {
        this.width = width;
    }

    public void setHeight(int height) {
        this.height = height;
    }

    public int getArea() {
        return width * height;
    }
}

public class Square extends Rectangle {
    // Override để giữ width = height
    @Override
    public void setWidth(int width) {
        this.width = width;
        this.height = width; // Cũng set height!
    }

    @Override
    public void setHeight(int height) {
        this.width = height; // Cũng set width!
        this.height = height;
    }
}

// Code sử dụng Rectangle
public class AreaCalculator {
    public static void resize(Rectangle rect) {
        rect.setWidth(5);
        rect.setHeight(3);
        // Mong đợi: area = 5 * 3 = 15
        System.out.println("Area: " + rect.getArea());
    }

    public static void main(String[] args) {
        Rectangle rect = new Rectangle();
        resize(rect); // Area: 15 -- Đúng!

        Rectangle square = new Square();
        resize(square); // Area: 9 -- SAI! Mong đợi 15 nhưng được 9
        // Vì setHeight(3) cũng set width = 3, nên area = 3 * 3 = 9
    }
}
```

### Áp dụng LSP -- Sửa lại

```java
// ĐÚNG: Tạo abstraction chung thay vì ép Square kế thừa Rectangle
public interface Shape {
    int getArea();
}

public class Rectangle implements Shape {
    private final int width;
    private final int height;

    public Rectangle(int width, int height) {
        this.width = width;
        this.height = height;
    }

    @Override
    public int getArea() {
        return width * height;
    }
}

public class Square implements Shape {
    private final int side;

    public Square(int side) {
        this.side = side;
    }

    @Override
    public int getArea() {
        return side * side;
    }
}

// Sử dụng -- hoạt động đúng với cả Rectangle và Square
public class AreaCalculator {
    public static void printArea(Shape shape) {
        System.out.println("Area: " + shape.getArea());
    }

    public static void main(String[] args) {
        printArea(new Rectangle(5, 3)); // Area: 15
        printArea(new Square(4));        // Area: 16
    }
}
```

### Ví dụ thực tế hơn

```java
// SAI: ReadOnlyFile vi phạm LSP
public class File {
    public String read() {
        return "file content";
    }

    public void write(String content) {
        System.out.println("Writing: " + content);
    }
}

public class ReadOnlyFile extends File {
    @Override
    public void write(String content) {
        // Vi phạm LSP: class con từ chối hành vi của class cha
        throw new UnsupportedOperationException("Cannot write to read-only file!");
    }
}

// Code dùng File mong đợi write() hoạt động
public void saveDocument(File file, String content) {
    file.write(content); // Nổ exception nếu file là ReadOnlyFile!
}

// ĐÚNG: Tách interface
public interface Readable {
    String read();
}

public interface Writable {
    void write(String content);
}

public class RegularFile implements Readable, Writable {
    @Override
    public String read() { return "content"; }

    @Override
    public void write(String content) {
        System.out.println("Writing: " + content);
    }
}

public class ReadOnlyFile implements Readable {
    @Override
    public String read() { return "content"; }
    // Không implement Writable -> không có write() -> không vi phạm
}
```

---

## I -- Interface Segregation Principle (ISP)

### Nguyên lý

> **Nhiều interface nhỏ, chuyên biệt tốt hơn một interface lớn, tổng quát.**

Client (class implement) không nên bị buộc phải implement những method mà nó không dùng. Nếu interface quá lớn, hãy tách thành nhiều interface nhỏ.

**Ví von thực tế**: Thẻ thành viên gym. Thay vì một thẻ "all-in-one" bao gồm gym + pool + sauna + yoga (mà bạn chỉ tập gym), tốt hơn là có các gói riêng: thẻ gym, thẻ pool, thẻ yoga. Bạn chỉ mua gói mình cần.

### Vi phạm ISP

```java
// SAI: Interface quá lớn, ép mọi class phải implement hết
public interface Worker {
    void work();
    void eat();
    void sleep();
    void attendMeeting();
    void writeReport();
    void manageTeam();
}

// Robot worker -- không ăn, không ngủ, không họp
public class RobotWorker implements Worker {
    @Override
    public void work() {
        System.out.println("Robot working 24/7");
    }

    @Override
    public void eat() {
        // Robot không ăn -- bị ép implement method vô nghĩa!
        throw new UnsupportedOperationException("Robot doesn't eat");
    }

    @Override
    public void sleep() {
        throw new UnsupportedOperationException("Robot doesn't sleep");
    }

    @Override
    public void attendMeeting() {
        throw new UnsupportedOperationException("Robot doesn't attend meetings");
    }

    @Override
    public void writeReport() {
        System.out.println("Robot generating report");
    }

    @Override
    public void manageTeam() {
        throw new UnsupportedOperationException("Robot doesn't manage");
    }
}
```

### Áp dụng ISP

```java
// ĐÚNG: Tách thành nhiều interface nhỏ, chuyên biệt

public interface Workable {
    void work();
}

public interface Feedable {
    void eat();
    void sleep();
}

public interface Reportable {
    void writeReport();
}

public interface Manageable {
    void manageTeam();
    void attendMeeting();
}

// Human developer: làm việc, ăn, ngủ, viết report
public class Developer implements Workable, Feedable, Reportable {
    @Override
    public void work() {
        System.out.println("Developer writing code");
    }

    @Override
    public void eat() {
        System.out.println("Developer eating lunch");
    }

    @Override
    public void sleep() {
        System.out.println("Developer sleeping");
    }

    @Override
    public void writeReport() {
        System.out.println("Developer writing sprint report");
    }
}

// Manager: làm việc, ăn, ngủ, viết report, quản lý team
public class Manager implements Workable, Feedable, Reportable, Manageable {
    @Override
    public void work() { System.out.println("Manager planning"); }

    @Override
    public void eat() { System.out.println("Manager eating"); }

    @Override
    public void sleep() { System.out.println("Manager sleeping"); }

    @Override
    public void writeReport() { System.out.println("Manager writing report"); }

    @Override
    public void manageTeam() { System.out.println("Manager managing team"); }

    @Override
    public void attendMeeting() { System.out.println("Manager in meeting"); }
}

// Robot: chỉ làm việc và viết report -- không bị ép implement ăn, ngủ
public class Robot implements Workable, Reportable {
    @Override
    public void work() {
        System.out.println("Robot working 24/7");
    }

    @Override
    public void writeReport() {
        System.out.println("Robot generating automated report");
    }
}
```

---

## D -- Dependency Inversion Principle (DIP)

### Nguyên lý

> **Module cấp cao không nên phụ thuộc vào module cấp thấp. Cả hai nên phụ thuộc vào abstraction.**
>
> **Abstraction không nên phụ thuộc vào chi tiết. Chi tiết nên phụ thuộc vào abstraction.**

Nói đơn giản: đừng phụ thuộc trực tiếp vào implementation cụ thể, hãy phụ thuộc vào interface/abstract class.

**Ví von thực tế**: Ổ cắm USB. Laptop của bạn (module cấp cao) không phụ thuộc trực tiếp vào chuột Logitech hay bàn phím Corsair (module cấp thấp). Cả hai phụ thuộc vào **chuẩn USB** (abstraction). Bạn có thể cắm bất kỳ thiết bị USB nào mà laptop vẫn hoạt động.

### Vi phạm DIP

```java
// SAI: OrderService phụ thuộc TRỰC TIẾP vào MySqlDatabase
public class MySqlDatabase {
    public void save(String data) {
        System.out.println("Saving to MySQL: " + data);
    }

    public String findById(int id) {
        return "Data from MySQL #" + id;
    }
}

public class EmailSender {
    public void send(String to, String message) {
        System.out.println("Sending email to " + to + ": " + message);
    }
}

// Module cấp cao phụ thuộc trực tiếp vào module cấp thấp
public class OrderService {
    // Phụ thuộc trực tiếp vào MySQL -- đổi sang PostgreSQL phải SỬA class này!
    private MySqlDatabase database = new MySqlDatabase();
    // Phụ thuộc trực tiếp vào EmailSender -- đổi sang SMS phải SỬA class này!
    private EmailSender emailSender = new EmailSender();

    public void createOrder(String orderData, String customerEmail) {
        database.save(orderData);
        emailSender.send(customerEmail, "Order created!");
    }
}
```

**Vấn đề**: `OrderService` bị "gắn chết" vào MySQL và Email. Muốn đổi database hay cách thông báo phải sửa `OrderService`. Không thể test `OrderService` riêng vì nó tạo dependency bên trong.

### Áp dụng DIP

```java
// ĐÚNG: Phụ thuộc vào abstraction (interface)

// Abstraction cho database
public interface OrderRepository {
    void save(String data);
    String findById(int id);
}

// Abstraction cho notification
public interface NotificationService {
    void notify(String recipient, String message);
}

// Implementation cụ thể -- MySQL
public class MySqlOrderRepository implements OrderRepository {
    @Override
    public void save(String data) {
        System.out.println("Saving to MySQL: " + data);
    }

    @Override
    public String findById(int id) {
        return "Data from MySQL #" + id;
    }
}

// Implementation cụ thể -- PostgreSQL (thêm mới, KHÔNG sửa code cũ)
public class PostgresOrderRepository implements OrderRepository {
    @Override
    public void save(String data) {
        System.out.println("Saving to PostgreSQL: " + data);
    }

    @Override
    public String findById(int id) {
        return "Data from PostgreSQL #" + id;
    }
}

// Implementation cụ thể -- Email
public class EmailNotificationService implements NotificationService {
    @Override
    public void notify(String recipient, String message) {
        System.out.println("Email to " + recipient + ": " + message);
    }
}

// Implementation cụ thể -- SMS (thêm mới, KHÔNG sửa code cũ)
public class SmsNotificationService implements NotificationService {
    @Override
    public void notify(String recipient, String message) {
        System.out.println("SMS to " + recipient + ": " + message);
    }
}

// Module cấp cao phụ thuộc vào ABSTRACTION
public class OrderService {
    private final OrderRepository repository;        // Interface
    private final NotificationService notification;  // Interface

    // Dependency Injection qua constructor
    public OrderService(OrderRepository repository, NotificationService notification) {
        this.repository = repository;
        this.notification = notification;
    }

    public void createOrder(String orderData, String customerContact) {
        repository.save(orderData);
        notification.notify(customerContact, "Order created!");
    }
}

// Sử dụng -- dễ dàng swap implementation
public class Main {
    public static void main(String[] args) {
        // Dùng MySQL + Email
        OrderService service1 = new OrderService(
            new MySqlOrderRepository(),
            new EmailNotificationService()
        );
        service1.createOrder("Order #1", "user@email.com");

        // Dùng PostgreSQL + SMS -- KHÔNG sửa OrderService!
        OrderService service2 = new OrderService(
            new PostgresOrderRepository(),
            new SmsNotificationService()
        );
        service2.createOrder("Order #2", "0901234567");
    }
}
```

---

## Bảng tổng hợp SOLID

| Nguyên lý | Câu hỏi kiểm tra | Vi phạm khi... | Tuân thủ khi... |
|---|---|---|---|
| **SRP** | Class này có bao nhiêu lý do để thay đổi? | Class làm nhiều việc không liên quan | Mỗi class một trách nhiệm |
| **OCP** | Thêm tính năng có phải sửa code cũ? | Phải sửa `if-else` hoặc `switch` khi thêm loại mới | Thêm class mới, không sửa code cũ |
| **LSP** | Class con thay thế class cha được không? | Class con throw exception hoặc thay đổi hành vi bất ngờ | Class con hoạt động đúng ở mọi nơi class cha hoạt động |
| **ISP** | Class có bị ép implement method không dùng? | Method throw `UnsupportedOperationException` | Interface nhỏ, chuyên biệt |
| **DIP** | Code phụ thuộc vào class cụ thể hay interface? | `new ConcreteClass()` bên trong module cấp cao | Inject dependency qua constructor |

---

## Lỗi thường gặp

### Sai: Áp dụng SRP quá cực đoan

```java
// SAI -- tách quá nhỏ, mỗi method một class
public class UserNameValidator {
    public boolean isValid(String name) { return name != null; }
}

public class UserEmailValidator {
    public boolean isValid(String email) { return email.contains("@"); }
}

public class UserAgeValidator {
    public boolean isValid(int age) { return age > 0; }
}

// ĐÚNG -- nhóm các validation liên quan vào một class
public class UserValidator {
    public void validate(UserCreateRequest request) {
        validateName(request.getName());
        validateEmail(request.getEmail());
        validateAge(request.getAge());
    }

    private void validateName(String name) { /* ... */ }
    private void validateEmail(String email) { /* ... */ }
    private void validateAge(int age) { /* ... */ }
}
```

### Sai: Vi phạm OCP với if-else chain

```java
// SAI -- thêm loại mới phải sửa method này
public class NotificationSender {
    public void send(String type, String message) {
        if (type.equals("EMAIL")) {
            System.out.println("Sending email: " + message);
        } else if (type.equals("SMS")) {
            System.out.println("Sending SMS: " + message);
        } else if (type.equals("PUSH")) {
            System.out.println("Sending push: " + message);
        }
        // Thêm Slack? Telegram? Phải sửa ở đây!
    }
}

// ĐÚNG -- mỗi loại là một class, thêm loại mới không sửa code cũ
public interface NotificationChannel {
    void send(String message);
}

public class EmailChannel implements NotificationChannel {
    @Override
    public void send(String message) {
        System.out.println("Sending email: " + message);
    }
}

// Thêm Slack -- tạo class mới, không sửa gì cũ
public class SlackChannel implements NotificationChannel {
    @Override
    public void send(String message) {
        System.out.println("Sending Slack: " + message);
    }
}
```

### Sai: Vi phạm DIP -- tạo dependency bên trong class

```java
// SAI
public class ReportService {
    // Tạo trực tiếp bên trong -- không thể swap, không thể mock
    private PdfGenerator generator = new PdfGenerator();

    public void generateReport() {
        generator.generate();
    }
}

// ĐÚNG
public class ReportService {
    private final ReportGenerator generator; // Interface

    // Inject qua constructor
    public ReportService(ReportGenerator generator) {
        this.generator = generator;
    }

    public void generateReport() {
        generator.generate();
    }
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: Giải thích SOLID bằng ví dụ thực tế

**Trả lời**: Lấy ví dụ hệ thống đặt hàng: **SRP** -- `OrderService` chỉ xử lý order, `PaymentService` chỉ xử lý payment, `EmailService` chỉ gửi email. **OCP** -- Thêm phương thức thanh toán mới (MoMo, ZaloPay) bằng cách tạo class mới implement `PaymentStrategy`, không sửa code cũ. **LSP** -- Mọi `PaymentStrategy` (CreditCard, MoMo, ZaloPay) đều gọi `pay()` mà code gọi chúng không cần biết loại cụ thể. **ISP** -- Tách `OrderRepository` (CRUD), `OrderSearchable` (tìm kiếm), `OrderExportable` (export) thay vì một interface chung. **DIP** -- `OrderService` nhận `OrderRepository` (interface) qua constructor, không `new MySqlOrderRepository()` bên trong.

### Câu 2: SRP và phân tách quá nhỏ -- ranh giới ở đâu?

**Trả lời**: SRP nói "một lý do để thay đổi", không phải "một method per class". Các method liên quan chặt chẽ về mặt nghiệp vụ nên ở chung class. Ví dụ: `UserValidator` gồm `validateEmail()`, `validateName()`, `validateAge()` -- tất cả đều thuộc trách nhiệm "validation user", thay đổi khi business rule validation thay đổi. Nhưng `UserValidator` + `UserEmailSender` + `UserPdfExporter` thì phải tách vì chúng thay đổi vì lý do khác nhau.

### Câu 3: Cho ví dụ vi phạm Liskov Substitution Principle

**Trả lời**: Ví dụ kinh điển: `Square extends Rectangle`. Rectangle có `setWidth()` và `setHeight()` độc lập. Square override để giữ `width == height`. Code `Rectangle r = new Square(); r.setWidth(5); r.setHeight(3);` mong đợi area = 15 nhưng được 9. Vi phạm vì Square không thể thay thế Rectangle mà giữ đúng hành vi. Cách fix: tạo interface `Shape` với method `getArea()`, cả Rectangle và Square implement riêng, không kế thừa nhau.

### Câu 4: Dependency Inversion liên quan gì đến Dependency Injection?

**Trả lời**: **Dependency Inversion** là nguyên lý thiết kế -- "phụ thuộc vào abstraction, không phải implementation". **Dependency Injection** là kỹ thuật thực hiện nguyên lý đó -- truyền dependency từ bên ngoài vào (qua constructor, setter, hoặc framework). Spring Boot dùng DI container (IoC container) để tự động inject implementation vào interface. Khi bạn viết `@Autowired OrderRepository repo`, Spring tự inject `MySqlOrderRepository` hoặc `JpaOrderRepository` tùy config -- đó là DI thực hiện DIP.

### Câu 5: Trong thực tế, có nên áp dụng SOLID 100% không?

**Trả lời**: Không. SOLID là **hướng dẫn**, không phải luật tuyệt đối. Áp dụng cứng nhắc 100% dẫn đến over-engineering -- quá nhiều class, interface, abstraction cho vấn đề đơn giản. Nguyên tắc: (1) Code nhỏ, prototype -> có thể bỏ qua một số nguyên lý. (2) Code production, team lớn -> nên tuân thủ chặt chẽ. (3) Khi thấy code smell (class quá lớn, sửa một chỗ hỏng chỗ khác) -> refactor theo SOLID. Mục tiêu cuối cùng là code dễ đọc, dễ bảo trì, dễ test -- nếu SOLID giúp đạt mục tiêu đó thì dùng, nếu nó làm code phức tạp hơn thì dừng lại.

---

## Tổng kết

SOLID không chỉ là lý thuyết khô khan -- nó là nền tảng của:
- **Design Patterns**: Strategy, Factory, Observer, Template Method đều dựa trên SOLID.
- **Spring Boot**: IoC Container là hiện thực hóa của DIP. `@Service`, `@Repository` tuân thủ SRP.
- **Clean Architecture**: Các layer phụ thuộc vào abstraction (DIP), mỗi layer có trách nhiệm riêng (SRP).

Khi code, hãy tự hỏi:
- Class này có làm quá nhiều việc không? (SRP)
- Thêm tính năng có phải sửa code cũ không? (OCP)
- Class con có hoạt động đúng ở mọi nơi class cha hoạt động không? (LSP)
- Interface có ép implement method thừa không? (ISP)
- Code có phụ thuộc trực tiếp vào class cụ thể không? (DIP)
