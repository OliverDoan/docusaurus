---
sidebar_position: 3
title: "Các nguyên lý thiết kế hướng đối tượng - SOLID"
---

# Các nguyên lý thiết kế hướng đối tượng - SOLID

**SOLID** là tập hợp 5 nguyên lý thiết kế **hướng đối tượng** (Object-Oriented Design) do Robert C. Martin tổng hợp, giúp xây dựng phần mềm dễ mở rộng, dễ bảo trì và ít bị ảnh hưởng khi yêu cầu thay đổi.

| Chữ cái | Tên đầy đủ | Ý nghĩa ngắn gọn |
|---|---|---|
| **S** | Single Responsibility Principle | Mỗi lớp chỉ có một lý do để thay đổi |
| **O** | Open/Closed Principle | Mở để mở rộng, đóng để sửa đổi |
| **L** | Liskov Substitution Principle | Lớp con có thể thay thế lớp cha mà không làm hỏng chương trình |
| **I** | Interface Segregation Principle | Không ép lớp phụ thuộc vào interface mà nó không dùng |
| **D** | Dependency Inversion Principle | Phụ thuộc vào trừu tượng, không phụ thuộc vào cài đặt cụ thể |

---

## 1. S — Single Responsibility Principle (Nguyên lý trách nhiệm đơn)

> "Một lớp chỉ nên có **một lý do duy nhất** để thay đổi."

Nếu một lớp thay đổi vì nhiều lý do khác nhau (ví dụ: cả nghiệp vụ lẫn cách xuất báo cáo), thì nó đang vi phạm SRP.

```java
// XẤU - lớp Employee vừa quản lý dữ liệu, vừa tính lương, vừa xuất báo cáo
public class Employee {
    private String name;
    private double salary;

    // Trách nhiệm 1: Dữ liệu nhân viên
    public String getName() { return name; }

    // Trách nhiệm 2: Tính lương (logic nghiệp vụ)
    public double calculateBonus() {
        return salary * 0.1; // 10% thưởng
    }

    // Trách nhiệm 3: Xuất báo cáo (presentation layer — lớp trình bày)
    public String generatePayslipHtml() {
        return "<html><body>Lương: " + salary + "</body></html>";
    }

    // Trách nhiệm 4: Lưu vào database (data access layer — lớp truy cập dữ liệu)
    public void save() {
        // Kết nối DB và lưu...
    }
}

// TỐT - mỗi lớp một trách nhiệm
public class Employee {
    private String name;
    private double baseSalary;
    // Chỉ chứa dữ liệu và logic thuần túy liên quan đến nhân viên
    public String getName() { return name; }
    public double getBaseSalary() { return baseSalary; }
}

public class PayrollCalculator {
    // Chỉ chịu trách nhiệm tính toán lương, thưởng
    public double calculateBonus(Employee employee) {
        return employee.getBaseSalary() * 0.1;
    }

    public double calculateTotalPay(Employee employee) {
        return employee.getBaseSalary() + calculateBonus(employee);
    }
}

public class PayslipGenerator {
    // Chỉ chịu trách nhiệm tạo tài liệu xuất lương
    public String generateHtml(Employee employee, double totalPay) {
        return String.format(
            "<html><body><h1>Phiếu lương</h1><p>%s: %.2f VND</p></body></html>",
            employee.getName(), totalPay
        );
    }
}

public class EmployeeRepository {
    // Chỉ chịu trách nhiệm lưu trữ dữ liệu
    public void save(Employee employee) { /* Lưu vào DB */ }
    public Employee findById(Long id) { /* Tìm từ DB */ return null; }
}
```

---

## 2. O — Open/Closed Principle (Nguyên lý đóng/mở)

> "Một lớp nên **mở để mở rộng** (thêm tính năng mới) nhưng **đóng với sửa đổi** (không thay đổi code hiện tại)."

Cách thực hiện: sử dụng **abstraction** (trừu tượng hóa) thông qua interface hoặc lớp abstract, thêm tính năng bằng cách tạo lớp mới thay vì sửa lớp cũ.

```java
// XẤU - mỗi khi thêm loại hình thanh toán mới phải sửa PaymentProcessor
public class PaymentProcessor {
    public void processPayment(String paymentType, double amount) {
        if (paymentType.equals("CREDIT_CARD")) {
            System.out.println("Thanh toán thẻ tín dụng: " + amount);
        } else if (paymentType.equals("PAYPAL")) {
            System.out.println("Thanh toán PayPal: " + amount);
        }
        // Thêm MoMo → phải sửa lớp này → vi phạm OCP!
        // else if (paymentType.equals("MOMO")) { ... }
    }
}

// TỐT - thêm loại thanh toán mới = tạo lớp mới, không sửa lớp cũ
public interface PaymentMethod {
    void process(double amount);
    String getMethodName();
}

public class CreditCardPayment implements PaymentMethod {
    @Override
    public void process(double amount) {
        System.out.println("Thanh toán thẻ tín dụng: " + amount + " VND");
    }

    @Override
    public String getMethodName() { return "Thẻ tín dụng"; }
}

public class PayPalPayment implements PaymentMethod {
    @Override
    public void process(double amount) {
        System.out.println("Thanh toán PayPal: " + amount + " VND");
    }

    @Override
    public String getMethodName() { return "PayPal"; }
}

// Thêm MoMo mà KHÔNG cần sửa PaymentProcessor
public class MoMoPayment implements PaymentMethod {
    @Override
    public void process(double amount) {
        System.out.println("Thanh toán MoMo: " + amount + " VND");
    }

    @Override
    public String getMethodName() { return "MoMo"; }
}

// PaymentProcessor không cần thay đổi khi thêm phương thức mới
public class PaymentProcessor {
    public void processPayment(PaymentMethod method, double amount) {
        method.process(amount);
    }
}
```

---

## 3. L — Liskov Substitution Principle (Nguyên lý thay thế Liskov)

> "Đối tượng của lớp con phải có thể **thay thế** đối tượng của lớp cha mà không làm hỏng tính đúng đắn của chương trình."

Nói cách khác: code hoạt động với lớp cha thì phải hoạt động đúng với mọi lớp con.

```java
// XẤU - Square (hình vuông) kế thừa Rectangle (hình chữ nhật) nhưng vi phạm LSP
public class Rectangle {
    protected int width;
    protected int height;

    public void setWidth(int width) { this.width = width; }
    public void setHeight(int height) { this.height = height; }
    public int calculateArea() { return width * height; }
}

public class Square extends Rectangle {
    // Hình vuông bắt buộc width == height, nên override cả hai setter
    @Override
    public void setWidth(int width) {
        this.width = width;
        this.height = width; // thay đổi "ẩn" gây ngạc nhiên!
    }

    @Override
    public void setHeight(int height) {
        this.width = height;
        this.height = height;
    }
}

// Test - hành vi bất ngờ khi dùng Square thay cho Rectangle
public void resizeRectangle(Rectangle rect) {
    rect.setWidth(5);
    rect.setHeight(10);
    // Kỳ vọng: 5 * 10 = 50
    // Với Square: setHeight(10) cũng đổi width thành 10, nên kết quả là 100!
    assert rect.calculateArea() == 50; // FAIL với Square!
}

// TỐT - không dùng kế thừa khi hành vi khác nhau về bản chất
public interface Shape {
    int calculateArea();
}

public class Rectangle implements Shape {
    private final int width;
    private final int height;

    public Rectangle(int width, int height) {
        this.width = width;
        this.height = height;
    }

    @Override
    public int calculateArea() { return width * height; }
}

public class Square implements Shape {
    private final int side;

    public Square(int side) { this.side = side; }

    @Override
    public int calculateArea() { return side * side; }
}

// Code chỉ phụ thuộc vào Shape — hoạt động đúng với cả hai
public void printArea(Shape shape) {
    System.out.println("Diện tích: " + shape.calculateArea());
}
```

---

## 4. I — Interface Segregation Principle (Nguyên lý phân tách interface)

> "Không nên ép một lớp phải phụ thuộc vào những phương thức của interface mà nó **không sử dụng**."

Nhiều interface nhỏ và chuyên biệt tốt hơn một interface lớn chứa tất cả.

```java
// XẤU - interface "béo" buộc mọi lớp implement tất cả phương thức
public interface Animal {
    void eat();
    void sleep();
    void fly();    // Không phải mọi con vật đều bay được!
    void swim();   // Không phải mọi con vật đều bơi được!
    void run();
}

// Chó không biết bay → phải implement phương thức rỗng, gây nhầm lẫn
public class Dog implements Animal {
    @Override public void eat() { System.out.println("Chó đang ăn"); }
    @Override public void sleep() { System.out.println("Chó đang ngủ"); }
    @Override public void run() { System.out.println("Chó đang chạy"); }

    @Override
    public void fly() {
        throw new UnsupportedOperationException("Chó không biết bay!"); // vi phạm LSP luôn!
    }

    @Override
    public void swim() { /* Chó này không bơi được, để trống? */ }
}

// TỐT - phân tách thành các interface nhỏ
public interface Eatable {
    void eat();
}

public interface Sleepable {
    void sleep();
}

public interface Flyable {
    void fly();
}

public interface Swimmable {
    void swim();
}

public interface Runnable {
    void run();
}

// Mỗi lớp chỉ implement những gì nó thực sự có khả năng
public class Dog implements Eatable, Sleepable, Runnable {
    @Override public void eat() { System.out.println("Chó đang ăn"); }
    @Override public void sleep() { System.out.println("Chó đang ngủ"); }
    @Override public void run() { System.out.println("Chó đang chạy"); }
}

public class Duck implements Eatable, Sleepable, Flyable, Swimmable {
    @Override public void eat() { System.out.println("Vịt đang ăn"); }
    @Override public void sleep() { System.out.println("Vịt đang ngủ"); }
    @Override public void fly() { System.out.println("Vịt đang bay"); }
    @Override public void swim() { System.out.println("Vịt đang bơi"); }
}
```

---

## 5. D — Dependency Inversion Principle (Nguyên lý đảo ngược phụ thuộc)

> "Các module cấp cao không nên phụ thuộc vào module cấp thấp. Cả hai nên phụ thuộc vào **abstraction** (trừu tượng). Abstraction không nên phụ thuộc vào chi tiết cài đặt — chi tiết cài đặt mới phụ thuộc vào abstraction."

Đây là nền tảng của **Dependency Injection** (DI — tiêm phụ thuộc), kỹ thuật phổ biến trong Spring Boot.

```java
// XẤU - OrderService phụ thuộc trực tiếp vào lớp cụ thể MySQLOrderRepository
public class MySQLOrderRepository {
    public void save(Order order) {
        // Lưu vào MySQL cụ thể
        System.out.println("Lưu đơn hàng vào MySQL: " + order.getId());
    }
}

public class OrderService {
    // Phụ thuộc vào cài đặt cụ thể — khó test, khó thay đổi database
    private MySQLOrderRepository repository = new MySQLOrderRepository();

    public void placeOrder(Order order) {
        // Xử lý nghiệp vụ...
        repository.save(order);
    }
}

// Muốn đổi sang MongoDB → phải sửa OrderService!
// Muốn viết unit test → không thể mock MySQLOrderRepository dễ dàng!

// TỐT - phụ thuộc vào abstraction (interface)
// Abstraction (interface) — cả hai phía đều phụ thuộc vào đây
public interface OrderRepository {
    void save(Order order);
    Optional<Order> findById(Long id);
}

// Cài đặt cụ thể 1 — phụ thuộc vào interface
public class MySQLOrderRepository implements OrderRepository {
    @Override
    public void save(Order order) {
        System.out.println("Lưu vào MySQL: " + order.getId());
    }

    @Override
    public Optional<Order> findById(Long id) {
        // Truy vấn MySQL...
        return Optional.empty();
    }
}

// Cài đặt cụ thể 2 — dễ dàng thêm mà không sửa OrderService
public class MongoOrderRepository implements OrderRepository {
    @Override
    public void save(Order order) {
        System.out.println("Lưu vào MongoDB: " + order.getId());
    }

    @Override
    public Optional<Order> findById(Long id) {
        // Truy vấn MongoDB...
        return Optional.empty();
    }
}

// Module cấp cao chỉ biết đến interface — Dependency Injection qua constructor
public class OrderService {
    private final OrderRepository orderRepository; // Nhận qua constructor (DI)

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public void placeOrder(Order order) {
        // Xử lý nghiệp vụ...
        orderRepository.save(order);
    }
}

// Trong Spring Boot, DI được quản lý tự động bởi IoC Container:
// @Service
// public class OrderService {
//     private final OrderRepository orderRepository;
//
//     @Autowired  // Spring tự inject implementation
//     public OrderService(OrderRepository orderRepository) {
//         this.orderRepository = orderRepository;
//     }
// }

// Dễ dàng test với mock object (đối tượng giả lập)
class OrderServiceTest {
    @Test
    void testPlaceOrder() {
        OrderRepository mockRepo = order -> {}; // lambda implement interface
        OrderService service = new OrderService(mockRepo);
        service.placeOrder(new Order(1L));
        // Test không cần database thật!
    }
}
```

---

## Tổng kết SOLID

```
S — Single Responsibility  →  "Một lớp, một trách nhiệm"
O — Open/Closed            →  "Thêm tính năng = tạo lớp mới"
L — Liskov Substitution    →  "Lớp con dùng được ở mọi nơi lớp cha dùng được"
I — Interface Segregation  →  "Nhiều interface nhỏ > một interface lớn"
D — Dependency Inversion   →  "Phụ thuộc vào interface, không phụ thuộc vào class cụ thể"
```

**Lợi ích khi áp dụng SOLID:**
- Code dễ đọc và dễ hiểu hơn.
- Thêm tính năng mới ít rủi ro phá vỡ tính năng cũ.
- Dễ viết unit test vì các thành phần tách biệt rõ ràng.
- Dễ tái sử dụng các component trong các ngữ cảnh khác nhau.

**Lưu ý thực tế:** Áp dụng SOLID cần cân bằng — đừng over-engineer (thiết kế quá mức cần thiết) cho những hệ thống nhỏ. Hãy áp dụng khi bạn thấy code đang trở nên khó bảo trì hoặc khi có dấu hiệu vi phạm rõ ràng.
