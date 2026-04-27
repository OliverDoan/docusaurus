---
sidebar_position: 14
title: "14. Nguyên tắc lập trình trong Java"
---

# Nguyên tắc lập trình trong Java

Viết code chạy được thì ai cũng làm được. Nhưng viết code **dễ đọc, dễ bảo trì, dễ mở rộng** thì cần tuân theo các nguyên tắc lập trình. Bài này tổng hợp những nguyên tắc quan trọng nhất mà mọi Java developer cần biết — từ cơ bản (DRY, KISS) đến nâng cao (SOLID, Law of Demeter).

---


---

## Mục lục

- [1. DRY — Don't Repeat Yourself](#1-dry-dont-repeat-yourself)
- [2. KISS — Keep It Simple, Stupid](#2-kiss-keep-it-simple-stupid)
- [3. YAGNI — You Aren't Gonna Need It](#3-yagni-you-arent-gonna-need-it)
- [4. Nguyên tắc Boy Scout](#4-nguyên-tắc-boy-scout)
- [5. Fail Fast](#5-fail-fast)
- [6. Law of Demeter (LoD) — Nguyên tắc ít biết](#6-law-of-demeter-lod-nguyên-tắc-ít-biết)
- [7. Composition over Inheritance — Ưu tiên Composition](#7-composition-over-inheritance-ưu-tiên-composition)
- [8. Nguyên tắc Least Astonishment (Bất ngờ nhỏ nhất)](#8-nguyên-tắc-least-astonishment-bất-ngờ-nhỏ-nhất)
- [9. Định luật Brook](#9-định-luật-brook)
- [10. Định luật Conway](#10-định-luật-conway)
- [11. SOLID — 5 Nguyên lý thiết kế OOP](#11-solid-5-nguyên-lý-thiết-kế-oop)
- [12. Tổng kết](#12-tổng-kết)
- [13. Lỗi thường gặp](#13-lỗi-thường-gặp)
- [14. Câu hỏi phỏng vấn](#14-câu-hỏi-phỏng-vấn)

---

## 1. DRY — Don't Repeat Yourself

**DRY** nghĩa là: **Đừng lặp lại chính mình.** Nếu một đoạn logic xuất hiện ở nhiều nơi, hãy trích xuất thành method hoặc class chung.

### Vi phạm DRY

```java
class OrderService {
    void createOrder(String customerEmail, double amount) {
        // Validate email — logic lặp lại!
        if (customerEmail == null || !customerEmail.contains("@")) {
            throw new IllegalArgumentException("Email không hợp lệ");
        }
        System.out.println("Tạo đơn hàng cho " + customerEmail + ": " + amount);
    }

    void sendInvoice(String customerEmail, double amount) {
        // Validate email — copy-paste y hệt!
        if (customerEmail == null || !customerEmail.contains("@")) {
            throw new IllegalArgumentException("Email không hợp lệ");
        }
        System.out.println("Gửi hóa đơn cho " + customerEmail + ": " + amount);
    }
}
```

**Vấn đề:** Nếu logic validate email thay đổi (ví dụ: thêm check domain), bạn phải sửa ở **mọi nơi** — dễ quên, dễ sai.

### Áp dụng DRY

```java
class OrderService {
    // Trích xuất logic chung thành method riêng
    private void validateEmail(String email) {
        if (email == null || !email.contains("@")) {
            throw new IllegalArgumentException("Email không hợp lệ");
        }
    }

    void createOrder(String customerEmail, double amount) {
        validateEmail(customerEmail); // Gọi method chung
        System.out.println("Tạo đơn hàng cho " + customerEmail + ": " + amount);
    }

    void sendInvoice(String customerEmail, double amount) {
        validateEmail(customerEmail); // Gọi method chung
        System.out.println("Gửi hóa đơn cho " + customerEmail + ": " + amount);
    }
}
```

**Lợi ích:** Sửa logic validate chỉ cần sửa **một chỗ**. Code ngắn hơn, ít bug hơn.

### Khi nào KHÔNG nên DRY?

- **2 đoạn code trông giống nhau nhưng phục vụ mục đích khác nhau** — ép DRY có thể tạo coupling không cần thiết
- **Rule of Three**: Nếu logic chỉ lặp 2 lần, có thể chấp nhận. Lặp **3 lần trở lên** thì nên extract

---

## 2. KISS — Keep It Simple, Stupid

**KISS** nghĩa là: **Giữ mọi thứ đơn giản nhất có thể.** Đừng over-engineer, đừng dùng design pattern phức tạp khi một solution đơn giản là đủ.

### Vi phạm KISS

```java
// Quá phức tạp cho một tác vụ đơn giản!
class StringReverser {
    interface ReverseStrategy {
        String reverse(String input);
    }

    class RecursiveReverse implements ReverseStrategy {
        @Override
        public String reverse(String input) {
            if (input.length() <= 1) return input;
            return reverse(input.substring(1)) + input.charAt(0);
        }
    }

    class StrategyContext {
        private ReverseStrategy strategy;
        StrategyContext(ReverseStrategy strategy) { this.strategy = strategy; }
        String execute(String input) { return strategy.reverse(input); }
    }

    String reverseString(String input) {
        return new StrategyContext(new RecursiveReverse()).execute(input);
    }
}
```

### Áp dụng KISS

```java
// Đơn giản, rõ ràng, ai cũng hiểu!
class StringReverser {
    String reverseString(String input) {
        return new StringBuilder(input).reverse().toString();
    }
}
```

### Dấu hiệu vi phạm KISS

- Dùng design pattern khi không cần thiết
- Code phức tạp hơn vấn đề nó giải quyết
- Đồng nghiệp đọc code mất hơn 30 giây mới hiểu một method
- Quá nhiều abstraction layers

---

## 3. YAGNI — You Aren't Gonna Need It

**YAGNI** nghĩa là: **Bạn sẽ không cần đâu.** Đừng code chức năng mà bạn **nghĩ** sẽ cần trong tương lai. Chỉ code những gì cần **ngay bây giờ**.

### Vi phạm YAGNI

```java
class UserService {
    void createUser(String name) {
        System.out.println("Tạo user: " + name);
    }

    // Chưa ai yêu cầu, "phòng khi sau này cần"
    void createUserWithRole(String name, String role) {
        System.out.println("Tạo user: " + name + " với role: " + role);
    }

    // "Biết đâu sau này cần import từ CSV"
    void importUsersFromCSV(String filePath) {
        // 50 dòng code... chưa ai dùng
    }

    // "Chắc sẽ cần export"
    void exportUsersToJSON() {
        // 30 dòng code... chưa ai dùng
    }
}
```

### Áp dụng YAGNI

```java
class UserService {
    // Chỉ code những gì cần ngay bây giờ
    void createUser(String name) {
        System.out.println("Tạo user: " + name);
    }
}
// Khi nào cần import CSV → thêm lúc đó
// Khi nào cần export JSON → thêm lúc đó
```

### Tại sao YAGNI quan trọng?

- Code không dùng vẫn phải **maintain** (update khi dependency thay đổi)
- Code không dùng vẫn **tăng complexity** (đồng nghiệp đọc và thắc mắc)
- Yêu cầu tương lai **thường khác** với những gì bạn tưởng tượng
- **80% "phòng khi cần"** sẽ không bao giờ cần

---

## 4. Nguyên tắc Boy Scout

> "Luôn rời khỏi đoạn code tốt hơn khi bạn đến."

Mỗi lần sửa file, hãy cải thiện một chút: đổi tên biến rõ nghĩa hơn, xóa comment thừa, refactor method quá dài. Không cần thay đổi lớn — **tích tiểu thành đại**.

### Ví dụ

```java
// Trước — tên biến tệ, method quá dài
class ReportGenerator {
    void gen(List<Integer> d) {
        int s = 0;
        for (int i = 0; i < d.size(); i++) {
            s = s + d.get(i);
        }
        double a = (double) s / d.size();
        System.out.println("Sum: " + s);
        System.out.println("Average: " + a);
        System.out.println("Count: " + d.size());
    }
}
```

```java
// Sau — bạn đến sửa bug, tiện tay cải thiện
class ReportGenerator {
    void generateReport(List<Integer> data) {
        int sum = calculateSum(data);
        double average = (double) sum / data.size();

        System.out.println("Sum: " + sum);
        System.out.println("Average: " + average);
        System.out.println("Count: " + data.size());
    }

    private int calculateSum(List<Integer> data) {
        int sum = 0;
        for (int value : data) {
            sum += value;
        }
        return sum;
    }
}
```

**Lưu ý:** Nguyên tắc này **không** khuyến khích refactor toàn bộ codebase mỗi lần commit. Chỉ cải thiện **phần bạn đang chạm vào**.

---

## 5. Fail Fast

**Fail Fast** nghĩa là: **Nếu sai, hãy sai ngay lập tức.** Đừng để lỗi lan ra xa mới phát hiện — lúc đó rất khó debug.

### Vi phạm Fail Fast

```java
class BankAccount {
    private double balance;

    // Không kiểm tra → lỗi ở nơi khác, khó tìm
    void withdraw(double amount) {
        balance -= amount; // balance có thể âm!
    }

    void processPayment(double amount) {
        withdraw(amount);
        // ... 10 dòng code khác ...
        sendReceipt(); // Gửi receipt cho giao dịch không hợp lệ!
    }
}
```

### Áp dụng Fail Fast

```java
class BankAccount {
    private double balance;

    void withdraw(double amount) {
        // Kiểm tra ngay → fail fast
        if (amount <= 0) {
            throw new IllegalArgumentException("Số tiền phải lớn hơn 0");
        }
        if (amount > balance) {
            throw new IllegalStateException("Số dư không đủ: " + balance);
        }
        balance -= amount;
    }

    void processPayment(double amount) {
        withdraw(amount); // Nếu sai → exception ngay tại đây, dễ trace
        sendReceipt();
    }
}
```

### Áp dụng với Constructor

```java
class Employee {
    private String name;
    private int age;

    Employee(String name, int age) {
        // Validate ngay trong constructor — không cho tạo object sai
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Tên không được rỗng");
        }
        if (age < 18 || age > 65) {
            throw new IllegalArgumentException("Tuổi phải từ 18 đến 65");
        }
        this.name = name;
        this.age = age;
    }
}

// Object luôn ở trạng thái hợp lệ — không cần check null/invalid sau này
Employee emp = new Employee("An", 25); // OK
Employee emp2 = new Employee("", 25);  // Exception ngay!
```

---

## 6. Law of Demeter (LoD) — Nguyên tắc ít biết

**Law of Demeter** (hay **nguyên tắc ít biết**) nói rằng: một object chỉ nên giao tiếp với **bạn thân trực tiếp**, không nên "thò tay" vào bên trong object khác.

**Quy tắc đơn giản:** Chỉ dùng **một dấu chấm** (`.`), tránh **chuỗi dấu chấm** dài.

### Vi phạm LoD

```java
// "Train wreck" — chuỗi dấu chấm dài
class OrderService {
    String getCustomerCity(Order order) {
        // order biết quá nhiều về cấu trúc bên trong!
        return order.getCustomer().getAddress().getCity();
    }
}
```

**Vấn đề:** Nếu cấu trúc `Address` thay đổi (ví dụ: tách `city` thành `City` object), **mọi chỗ** dùng chuỗi này đều phải sửa.

### Áp dụng LoD

```java
// Order biết cách lấy city — không cần biết cấu trúc bên trong
class Order {
    private Customer customer;

    String getCustomerCity() {
        return customer.getCity(); // Delegate cho Customer
    }
}

class Customer {
    private Address address;

    String getCity() {
        return address.getCity(); // Delegate cho Address
    }
}

class OrderService {
    String getCustomerCity(Order order) {
        return order.getCustomerCity(); // Chỉ một dấu chấm!
    }
}
```

### Quy tắc cụ thể

Một method `m` của class `C` chỉ nên gọi method của:
1. **Chính `C`** (this)
2. **Object được tạo trong `m`** (local variables)
3. **Parameter của `m`**
4. **Field của `C`** (instance variables)

```java
class Example {
    private Helper helper; // Field — OK gọi helper.doSomething()

    void doWork(Tool tool) {           // tool là parameter — OK
        helper.assist();               // Field — OK
        tool.execute();                // Parameter — OK

        Result result = new Result();  // Tạo trong method — OK
        result.display();

        // tool.getEngine().start();   // KHÔNG OK — "thò tay" vào bên trong tool
    }
}
```

---

## 7. Composition over Inheritance — Ưu tiên Composition

**"Ưu tiên composition hơn inheritance"** là lời khuyên từ cuốn *Design Patterns* (Gang of Four). Thay vì kế thừa để tái sử dụng code, hãy **chứa object** (HAS-A) thay vì **là loại** (IS-A).

### Vấn đề của Inheritance

```java
// Inheritance — cứng nhắc
class Bird {
    void fly() { System.out.println("Đang bay"); }
    void eat() { System.out.println("Đang ăn"); }
}

class Penguin extends Bird {
    @Override
    void fly() {
        // Chim cánh cụt không bay được!
        throw new UnsupportedOperationException("Chim cánh cụt không bay!");
    }
}
```

**Vấn đề:** `Penguin IS-A Bird` nhưng lại không bay được — vi phạm Liskov Substitution Principle.

### Giải pháp: Composition

```java
// Tách hành vi thành interface
interface Flyable {
    void fly();
}

interface Swimmable {
    void swim();
}

// Implement cho từng hành vi
class FlyingAbility implements Flyable {
    @Override
    public void fly() { System.out.println("Đang bay"); }
}

class SwimmingAbility implements Swimmable {
    @Override
    public void swim() { System.out.println("Đang bơi"); }
}

// Composition — chứa hành vi cần thiết
class Eagle {
    private Flyable flyable = new FlyingAbility();

    void fly() { flyable.fly(); }
    void eat() { System.out.println("Đại bàng đang ăn"); }
}

class Penguin {
    private Swimmable swimmable = new SwimmingAbility();

    void swim() { swimmable.swim(); }
    void eat() { System.out.println("Chim cánh cụt đang ăn"); }
    // Không có fly() — đúng logic!
}
```

### So sánh

| Tiêu chí | Inheritance | Composition |
|---|---|---|
| **Quan hệ** | IS-A (là loại) | HAS-A (có) |
| **Linh hoạt** | Cứng nhắc (compile-time) | Linh hoạt (runtime) |
| **Coupling** | Chặt (child phụ thuộc parent) | Lỏng (chỉ phụ thuộc interface) |
| **Thay đổi hành vi** | Khó (phải override) | Dễ (swap implementation) |
| **Khi nào dùng** | Quan hệ IS-A rõ ràng | Mặc định — ưu tiên dùng |

---

## 8. Nguyên tắc Least Astonishment (Bất ngờ nhỏ nhất)

**Principle of Least Astonishment** nói rằng: code nên hoạt động **đúng như người đọc mong đợi**. Không có "bất ngờ".

### Vi phạm

```java
class Calculator {
    // Tên là "add" nhưng lại... lưu vào database?!
    int add(int a, int b) {
        int result = a + b;
        database.save(result); // Bất ngờ! Side effect không ai đoán được
        return result;
    }
}

class UserService {
    // Tên là "getUser" nhưng lại tạo user mới nếu không tìm thấy?!
    User getUser(String email) {
        User user = database.findByEmail(email);
        if (user == null) {
            user = new User(email);
            database.save(user); // Bất ngờ! "get" mà lại "create"
        }
        return user;
    }
}
```

### Áp dụng

```java
class Calculator {
    // Tên đúng nghĩa — không side effect
    int add(int a, int b) {
        return a + b;
    }
}

class UserService {
    // Tách rõ: tìm là tìm, tạo là tạo
    User getUser(String email) {
        return database.findByEmail(email); // Chỉ tìm, trả null nếu không có
    }

    User getOrCreateUser(String email) {
        User user = database.findByEmail(email);
        if (user == null) {
            user = new User(email);
            database.save(user);
        }
        return user; // Tên method nói rõ hành vi
    }
}
```

### Quy tắc

- **Tên method phản ánh chính xác** những gì nó làm
- **Getter không có side effect** — chỉ trả về giá trị
- **Setter không có logic phức tạp** — chỉ gán giá trị
- **Không có hành vi ẩn** — nếu method làm nhiều việc, tên phải nói rõ

---

## 9. Định luật Brook

> "Thêm người vào dự án phần mềm đang trễ chỉ làm nó trễ hơn."
>
> — Fred Brooks, *The Mythical Man-Month* (1975)

### Tại sao?

- Người mới cần **thời gian học** codebase (onboarding)
- **Communication overhead** tăng theo công thức: `n × (n-1) / 2`
  - 3 người → 3 kênh giao tiếp
  - 6 người → 15 kênh giao tiếp
  - 10 người → 45 kênh giao tiếp
- Người cũ phải **dừng việc** để hướng dẫn người mới

### Ý nghĩa cho developer

- Ước lượng thời gian **thực tế**, không quá lạc quan
- Nếu dự án trễ → **giảm scope** thay vì thêm người
- Thiết kế code **modular** để nhiều người có thể làm song song mà ít conflict

---

## 10. Định luật Conway

> "Tổ chức thiết kế hệ thống sẽ tạo ra kiến trúc phản ánh cấu trúc giao tiếp của tổ chức đó."
>
> — Melvin Conway (1967)

### Ví dụ

| Cấu trúc team | Kiến trúc hệ thống |
|---|---|
| Team Frontend + Team Backend | Monolith với 2 layer |
| Team theo sản phẩm (A, B, C) | Microservices cho từng sản phẩm |
| Team theo chức năng (Auth, Payment, Inventory) | Microservices theo domain |

### Ý nghĩa cho developer

- Nếu muốn kiến trúc **microservices** → cần team **tự chủ** theo domain
- Kiến trúc code thường **phản ánh** cách team được tổ chức
- **Inverse Conway Maneuver**: Tổ chức team theo kiến trúc bạn muốn đạt được

---

## 11. SOLID — 5 Nguyên lý thiết kế OOP

SOLID là tập hợp 5 nguyên lý giúp code OOP **dễ bảo trì, dễ mở rộng, dễ test**.

### S — Single Responsibility Principle (SRP)

> Mỗi class chỉ nên có **một lý do để thay đổi**.

```java
// VI PHẠM SRP — class làm quá nhiều việc
class Employee {
    void calculateSalary() { /* Tính lương */ }
    void saveToDatabase() { /* Lưu database */ }
    void generateReport() { /* Tạo báo cáo */ }
}

// ÁP DỤNG SRP — tách thành 3 class
class Employee {
    private String name;
    private double baseSalary;
    // Chỉ chứa data
}

class SalaryCalculator {
    double calculate(Employee emp) { /* Tính lương */ return 0; }
}

class EmployeeRepository {
    void save(Employee emp) { /* Lưu database */ }
}

class EmployeeReportGenerator {
    void generate(Employee emp) { /* Tạo báo cáo */ }
}
```

### O — Open/Closed Principle (OCP)

> Class nên **mở để mở rộng** (extend), **đóng để sửa đổi** (modify).

```java
// VI PHẠM OCP — phải sửa class mỗi khi thêm loại discount mới
class DiscountCalculator {
    double calculate(String type, double price) {
        if (type.equals("student")) return price * 0.8;
        if (type.equals("vip")) return price * 0.7;
        // Thêm loại mới → phải sửa method này!
        return price;
    }
}

// ÁP DỤNG OCP — thêm loại mới bằng cách tạo class mới, không sửa code cũ
interface DiscountStrategy {
    double apply(double price);
}

class StudentDiscount implements DiscountStrategy {
    @Override
    public double apply(double price) { return price * 0.8; }
}

class VipDiscount implements DiscountStrategy {
    @Override
    public double apply(double price) { return price * 0.7; }
}

// Thêm loại mới → chỉ cần tạo class mới, KHÔNG sửa code cũ
class SeniorDiscount implements DiscountStrategy {
    @Override
    public double apply(double price) { return price * 0.75; }
}

class DiscountCalculator {
    double calculate(DiscountStrategy strategy, double price) {
        return strategy.apply(price);
    }
}
```

### L — Liskov Substitution Principle (LSP)

> Object của subclass phải **thay thế** được object của superclass mà không làm sai logic.

```java
// VI PHẠM LSP
class Rectangle {
    protected int width, height;

    void setWidth(int w) { this.width = w; }
    void setHeight(int h) { this.height = h; }
    int getArea() { return width * height; }
}

class Square extends Rectangle {
    @Override
    void setWidth(int w) { this.width = w; this.height = w; } // Bất ngờ!
    @Override
    void setHeight(int h) { this.width = h; this.height = h; } // Bất ngờ!
}

// Test: Thay Rectangle bằng Square → logic sai!
Rectangle rect = new Square();
rect.setWidth(5);
rect.setHeight(3);
System.out.println(rect.getArea()); // Mong 15, được 9! LSP violated.
```

```java
// ÁP DỤNG LSP — tách riêng, không ép Square IS-A Rectangle
interface Shape {
    int getArea();
}

class Rectangle implements Shape {
    private int width, height;
    Rectangle(int w, int h) { this.width = w; this.height = h; }
    @Override
    public int getArea() { return width * height; }
}

class Square implements Shape {
    private int side;
    Square(int side) { this.side = side; }
    @Override
    public int getArea() { return side * side; }
}
```

### I — Interface Segregation Principle (ISP)

> Đừng ép class implement **interface quá lớn** mà nó không cần tất cả method.

```java
// VI PHẠM ISP — interface quá lớn
interface Worker {
    void work();
    void eat();
    void sleep();
}

class Robot implements Worker {
    @Override
    public void work() { System.out.println("Đang làm việc"); }
    @Override
    public void eat() { /* Robot không ăn! */ }   // Bắt buộc implement vô nghĩa
    @Override
    public void sleep() { /* Robot không ngủ! */ } // Bắt buộc implement vô nghĩa
}

// ÁP DỤNG ISP — tách thành nhiều interface nhỏ
interface Workable { void work(); }
interface Eatable { void eat(); }
interface Sleepable { void sleep(); }

class Human implements Workable, Eatable, Sleepable {
    @Override
    public void work() { System.out.println("Đang làm việc"); }
    @Override
    public void eat() { System.out.println("Đang ăn"); }
    @Override
    public void sleep() { System.out.println("Đang ngủ"); }
}

class Robot implements Workable {
    @Override
    public void work() { System.out.println("Đang làm việc"); }
    // Không cần eat() hay sleep()!
}
```

### D — Dependency Inversion Principle (DIP)

> Module cấp cao **không nên phụ thuộc** vào module cấp thấp. Cả hai nên phụ thuộc vào **abstraction** (interface).

```java
// VI PHẠM DIP — phụ thuộc trực tiếp vào implementation
class MySQLDatabase {
    void save(String data) { System.out.println("Lưu vào MySQL: " + data); }
}

class UserService {
    private MySQLDatabase db = new MySQLDatabase(); // Phụ thuộc cứng!

    void createUser(String name) {
        db.save(name); // Đổi sang PostgreSQL → phải sửa UserService!
    }
}

// ÁP DỤNG DIP — phụ thuộc vào abstraction
interface Database {
    void save(String data);
}

class MySQLDatabase implements Database {
    @Override
    public void save(String data) { System.out.println("MySQL: " + data); }
}

class PostgreSQLDatabase implements Database {
    @Override
    public void save(String data) { System.out.println("PostgreSQL: " + data); }
}

class UserService {
    private Database db; // Phụ thuộc vào interface!

    UserService(Database db) {
        this.db = db; // Inject từ bên ngoài
    }

    void createUser(String name) {
        db.save(name); // Đổi database → chỉ cần inject implementation khác
    }
}

// Sử dụng
UserService service1 = new UserService(new MySQLDatabase());
UserService service2 = new UserService(new PostgreSQLDatabase());
```

---

## 12. Tổng kết

| Nguyên tắc | Ý nghĩa | Một câu ghi nhớ |
|---|---|---|
| **DRY** | Không lặp logic | "Một sự thật, một nơi" |
| **KISS** | Đơn giản nhất có thể | "Đừng over-engineer" |
| **YAGNI** | Không code trước khi cần | "Viết khi nào cần khi đó" |
| **Boy Scout** | Cải thiện dần | "Rời đi tốt hơn khi đến" |
| **Fail Fast** | Phát hiện lỗi sớm | "Sai sớm, sửa dễ" |
| **Law of Demeter** | Ít biết về nhau | "Chỉ nói chuyện với bạn thân" |
| **Composition > Inheritance** | Ưu tiên HAS-A | "Chứa, đừng kế thừa" |
| **Least Astonishment** | Không gây bất ngờ | "Code đúng như tên gọi" |
| **SOLID** | 5 nguyên lý OOP | "S-O-L-I-D" |

---

## 13. Lỗi thường gặp

### Lỗi 1: Áp dụng DRY quá mức

```java
// SAI — Ép DRY cho 2 đoạn code trông giống nhưng mục đích khác
// Validate email đăng ký (cần strict) vs validate email search (có thể loose)
void validateEmail(String email, boolean isStrict) {
    if (isStrict) {
        // 20 dòng validate phức tạp
    } else {
        // 5 dòng validate cơ bản
    }
}

// ĐÚNG — Tách riêng vì mục đích khác nhau
void validateRegistrationEmail(String email) { /* strict */ }
void validateSearchEmail(String email) { /* loose */ }
```

### Lỗi 2: Over-engineering (vi phạm KISS + YAGNI cùng lúc)

```java
// SAI — Factory + Strategy + Observer cho một app TODO list đơn giản
class TaskFactory {
    Task create(TaskType type) { ... }
}
interface TaskStrategy { void execute(Task task); }
interface TaskObserver { void onTaskChanged(Task task); }

// ĐÚNG — Đơn giản cho ứng dụng đơn giản
class TodoApp {
    private List<String> tasks = new ArrayList<>();

    void addTask(String task) { tasks.add(task); }
    void removeTask(int index) { tasks.remove(index); }
    List<String> getTasks() { return List.copyOf(tasks); }
}
```

### Lỗi 3: Vi phạm SRP vì "tiện"

```java
// SAI — Một class vừa gửi email, vừa log, vừa validate
class EmailSender {
    void sendEmail(String to, String body) {
        if (!to.contains("@")) { throw new RuntimeException("Invalid"); } // Validate
        System.out.println("Sending to " + to);                          // Log
        // ... gửi email thật ...                                         // Send
        writeToFile("sent-log.txt", to + ": " + body);                   // File I/O
    }
}

// ĐÚNG — Mỗi class một trách nhiệm
class EmailValidator { boolean isValid(String email) { return email.contains("@"); } }
class EmailSender { void send(String to, String body) { /* chỉ gửi email */ } }
class EmailLogger { void log(String to, String body) { /* chỉ ghi log */ } }
```

---

## 14. Câu hỏi phỏng vấn

### Câu 1: SOLID là gì? Giải thích từng nguyên lý.

**Trả lời:** SOLID là 5 nguyên lý thiết kế OOP: (1) **SRP** — mỗi class một trách nhiệm. (2) **OCP** — mở để mở rộng, đóng để sửa đổi. (3) **LSP** — subclass phải thay thế được superclass. (4) **ISP** — tách interface lớn thành nhiều interface nhỏ. (5) **DIP** — phụ thuộc vào abstraction, không phụ thuộc implementation. Mục đích chung: giảm coupling, tăng cohesion, code dễ bảo trì và mở rộng.

### Câu 2: DRY và KISS có mâu thuẫn không?

**Trả lời:** Có thể mâu thuẫn. Áp dụng DRY quá mức (extract mọi thứ thành abstraction) có thể vi phạm KISS (code phức tạp hơn cần thiết). Ví dụ: 2 đoạn code giống nhau 3 dòng — nếu extract thành generic helper với parameter, method và interface, code phức tạp hơn nhiều. **Cách cân bằng:** Dùng **Rule of Three** — chỉ extract khi logic lặp 3 lần trở lên, và chỉ khi mục đích giống nhau.

### Câu 3: Composition over Inheritance nghĩa là gì? Cho ví dụ.

**Trả lời:** Nghĩa là ưu tiên quan hệ **HAS-A** (chứa) hơn **IS-A** (kế thừa) khi tái sử dụng code. Ví dụ: thay vì `class Penguin extends Bird` (Penguin IS-A Bird nhưng không bay được — vi phạm LSP), dùng composition: `Penguin` có field `Swimmable swimmable` — chỉ chứa hành vi nó thực sự có. Composition linh hoạt hơn vì có thể swap implementation lúc runtime, không bị ràng buộc bởi class hierarchy.

### Câu 4: Law of Demeter là gì? Vi phạm như thế nào?

**Trả lời:** Law of Demeter (LoD) nói rằng một object chỉ nên nói chuyện với "bạn thân trực tiếp": `this`, fields, parameters, objects tạo trong method. Vi phạm LoD khi dùng "chuỗi dấu chấm" dài: `order.getCustomer().getAddress().getCity()` — object `OrderService` biết quá nhiều về cấu trúc bên trong của `Order`, `Customer`, `Address`. Sửa bằng cách delegate: `order.getCustomerCity()`.

### Câu 5: Tại sao nên Fail Fast? Cho ví dụ thực tế.

**Trả lời:** Fail Fast phát hiện lỗi **ngay khi xảy ra**, thay vì để lỗi lan xa. Ví dụ: method `withdraw(amount)` không kiểm tra `amount > 0` → balance âm → tính lãi sai → báo cáo tài chính sai → phát hiện sau 1 tháng. Nếu fail fast (throw exception ngay khi `amount <= 0`), bug được phát hiện tại dòng gọi `withdraw()`, dễ debug, dễ sửa. Trong Java, dùng `Objects.requireNonNull()`, `IllegalArgumentException`, validate trong constructor để fail fast.
