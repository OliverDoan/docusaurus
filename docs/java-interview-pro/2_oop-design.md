---
sidebar_position: 2
title: "2. OOP & Design Patterns"
---

# OOP & Design Patterns

> *Nắm vững lập trình hướng đối tượng và các design pattern phổ biến — nền tảng để viết code Java chuyên nghiệp và vượt qua mọi vòng phỏng vấn kỹ thuật.*

---

## Câu 1: Bốn tính chất (trụ cột) của OOP là gì? `[Basic]`

### Câu hỏi

> *"Hãy kể và giải thích 4 tính chất cơ bản của lập trình hướng đối tượng?"*

### Giải thích lý thuyết

OOP (Object-Oriented Programming — Lập trình hướng đối tượng) được xây dựng trên 4 trụ cột:

1. **Encapsulation (Đóng gói):** Ẩn chi tiết bên trong đối tượng, chỉ public những gì cần thiết ra ngoài. Dùng access modifier (`private`, `protected`, `public`) để kiểm soát truy cập.

2. **Inheritance (Kế thừa):** Lớp con (subclass) kế thừa thuộc tính và phương thức của lớp cha (superclass), giúp tái sử dụng code.

3. **Polymorphism (Đa hình):** Cùng một tên phương thức có thể hoạt động khác nhau tuỳ context — thông qua overloading hoặc overriding.

4. **Abstraction (Trừu tượng hoá):** Ẩn đi chi tiết cài đặt phức tạp, chỉ expose interface cần thiết cho người dùng.

### Code minh hoạ

```java
// Encapsulation — đóng gói dữ liệu, truy cập qua getter/setter
public class BankAccount {
    private double balance; // ẩn balance bên trong

    public double getBalance() {
        return balance;
    }

    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
        }
    }
}

// Inheritance — Animal là lớp cha, Dog là lớp con
public class Animal {
    public void eat() {
        System.out.println("Đang ăn...");
    }
}

public class Dog extends Animal {
    public void bark() {
        System.out.println("Gâu gâu!");
    }
}

// Polymorphism — cùng gọi sound() nhưng hành vi khác nhau
public class Cat extends Animal {
    public void sound() { System.out.println("Meo meo"); }
}

public class DogSound extends Animal {
    public void sound() { System.out.println("Gâu gâu"); }
}

// Abstraction — ẩn chi tiết, expose interface đơn giản
public abstract class Shape {
    public abstract double area(); // người dùng chỉ cần gọi area()
}

public class Circle extends Shape {
    private double radius;

    public Circle(double radius) { this.radius = radius; }

    @Override
    public double area() {
        return Math.PI * radius * radius; // chi tiết tính toán ẩn bên trong
    }
}
```

### Đáp án mẫu

> "OOP có 4 tính chất: Encapsulation — đóng gói dữ liệu và hành vi trong class, chỉ public những gì cần thiết; Inheritance — lớp con kế thừa lớp cha để tái sử dụng code; Polymorphism — đa hình, cùng tên method nhưng hoạt động khác nhau tuỳ đối tượng; và Abstraction — trừu tượng hoá, ẩn chi tiết phức tạp, chỉ expose interface đơn giản. Đây là nền tảng để xây dựng phần mềm dễ mở rộng và bảo trì."

---

## Câu 2: Kế thừa (Inheritance) trong Java có mấy loại? `[Basic]`

### Câu hỏi

> *"Java hỗ trợ những loại kế thừa nào? Tại sao Java không hỗ trợ multiple inheritance qua class?"*

### Giải thích lý thuyết

Java hỗ trợ các loại kế thừa sau:

| Loại | Mô tả | Java hỗ trợ? |
|------|-------|-------------|
| Single Inheritance | A extends B | Có |
| Multilevel Inheritance | A extends B, B extends C | Có |
| Hierarchical Inheritance | B extends A, C extends A | Có |
| Multiple Inheritance (qua class) | A extends B, C | Không |
| Multiple Inheritance (qua interface) | A implements B, C | Có |

**Tại sao không có multiple inheritance qua class?** Vấn đề "Diamond Problem" (vấn đề kim cương) — nếu class A kế thừa cả B và C, và cả B, C đều có method `display()`, Java không biết dùng cái nào. Để tránh sự mơ hồ này, Java chỉ cho phép kế thừa một class nhưng implement nhiều interface.

### Code minh hoạ

```java
// Single Inheritance
public class Vehicle {
    public void move() { System.out.println("Phương tiện di chuyển"); }
}

public class Car extends Vehicle {
    public void honk() { System.out.println("Bim bim!"); }
}

// Multilevel Inheritance
public class ElectricCar extends Car {
    public void charge() { System.out.println("Đang sạc pin..."); }
}

// Hierarchical Inheritance
public class Truck extends Vehicle {
    public void loadCargo() { System.out.println("Chất hàng lên xe"); }
}

// Multiple Inheritance qua interface (được phép)
public interface Flyable {
    default void fly() { System.out.println("Đang bay"); }
}

public interface Swimmable {
    default void swim() { System.out.println("Đang bơi"); }
}

public class Duck extends Animal implements Flyable, Swimmable {
    // Duck vừa bay vừa bơi được
}
```

### Đáp án mẫu

> "Java hỗ trợ single, multilevel, và hierarchical inheritance qua class. Multiple inheritance qua class bị cấm để tránh Diamond Problem — khi hai lớp cha có cùng method, compiler không biết dùng cái nào. Thay vào đó, Java cho phép implement nhiều interface để đạt được đa kế thừa an toàn hơn."

---

## Câu 3: Polymorphism là gì? Giải thích compile-time và runtime polymorphism. `[Intermediate]`

### Câu hỏi

> *"Polymorphism trong Java là gì? Phân biệt compile-time và runtime polymorphism với ví dụ cụ thể?"*

### Giải thích lý thuyết

**Polymorphism (Đa hình)** cho phép cùng một tên phương thức hoạt động theo nhiều cách khác nhau tuỳ vào đối tượng được sử dụng.

Có 2 loại:

- **Compile-time Polymorphism (Đa hình tại thời điểm biên dịch):** Còn gọi là *static binding* hoặc *method overloading*. Compiler quyết định phương thức nào được gọi dựa trên số lượng và kiểu tham số.

- **Runtime Polymorphism (Đa hình tại thời điểm chạy):** Còn gọi là *dynamic binding* hoặc *method overriding*. JVM quyết định phương thức nào được gọi tại runtime dựa trên kiểu đối tượng thực sự (không phải kiểu tham chiếu).

### Code minh hoạ

```java
// Compile-time Polymorphism — Method Overloading
public class Calculator {
    // Cùng tên add, khác tham số — compiler phân biệt tại build time
    public int add(int a, int b) {
        return a + b;
    }

    public double add(double a, double b) {
        return a + b;
    }

    public int add(int a, int b, int c) {
        return a + b + c;
    }
}

// Runtime Polymorphism — Method Overriding
public class Animal {
    public void sound() {
        System.out.println("Âm thanh chung chung");
    }
}

public class Dog extends Animal {
    @Override
    public void sound() {
        System.out.println("Gâu gâu!");
    }
}

public class Cat extends Animal {
    @Override
    public void sound() {
        System.out.println("Meo meo!");
    }
}

public class Main {
    public static void main(String[] args) {
        // Kiểu tham chiếu là Animal, nhưng đối tượng thực là Dog/Cat
        Animal a1 = new Dog();
        Animal a2 = new Cat();

        a1.sound(); // In ra: Gâu gâu! — JVM quyết định tại runtime
        a2.sound(); // In ra: Meo meo! — JVM quyết định tại runtime
    }
}
```

### Đáp án mẫu

> "Polymorphism là khả năng cùng một tên method hoạt động khác nhau. Compile-time polymorphism dùng method overloading — compiler quyết định gọi method nào dựa vào tham số. Runtime polymorphism dùng method overriding — JVM quyết định tại lúc chạy dựa vào kiểu đối tượng thực sự. Ví dụ, khai báo `Animal a = new Dog()`, khi gọi `a.sound()` sẽ gọi method của Dog chứ không phải Animal."

---

## Câu 4: Method overloading và method overriding khác nhau thế nào? `[Basic]`

### Câu hỏi

> *"Phân biệt method overloading và method overriding trong Java?"*

### Giải thích lý thuyết

| Tiêu chí | Method Overloading | Method Overriding |
|---------|-------------------|------------------|
| Xảy ra ở đâu | Cùng một class | Lớp cha và lớp con |
| Tên method | Giống nhau | Giống nhau |
| Tham số | Khác nhau (số lượng hoặc kiểu) | Giống hệt nhau |
| Return type | Có thể khác | Phải giống (hoặc covariant) |
| Binding | Compile-time (static) | Runtime (dynamic) |
| `@Override` | Không dùng | Nên dùng |
| `static` method | Được phép | Không override được (chỉ hide) |

**Covariant return type** — Lớp con có thể override và trả về kiểu con của kiểu return của lớp cha.

### Code minh hoạ

```java
// Method Overloading — cùng class, khác tham số
public class Printer {
    public void print(String text) {
        System.out.println("In chữ: " + text);
    }

    public void print(int number) {
        System.out.println("In số: " + number);
    }

    public void print(String text, int copies) {
        for (int i = 0; i < copies; i++) {
            System.out.println(text);
        }
    }
}

// Method Overriding — lớp con ghi đè lớp cha
public class Shape {
    public String describe() {
        return "Tôi là một hình";
    }
}

public class Rectangle extends Shape {
    @Override // annotation giúp compiler kiểm tra đúng chữ ký
    public String describe() {
        return "Tôi là hình chữ nhật";
    }
}

// Covariant return type — lớp con trả về kiểu hẹp hơn
public class AnimalFactory {
    public Animal create() {
        return new Animal();
    }
}

public class DogFactory extends AnimalFactory {
    @Override
    public Dog create() { // Dog là subtype của Animal — hợp lệ
        return new Dog();
    }
}
```

### Đáp án mẫu

> "Overloading xảy ra trong cùng một class khi nhiều method cùng tên nhưng khác tham số — compiler phân giải tại build time. Overriding xảy ra khi lớp con tái định nghĩa method của lớp cha với cùng chữ ký — JVM phân giải tại runtime. Overriding cần chú ý: không được giảm access modifier, không được throw thêm checked exception rộng hơn."

---

## Câu 5: Method hiding là gì? Khác method overriding thế nào? `[Intermediate]`

### Câu hỏi

> *"Method hiding trong Java là gì? Khi nào xảy ra và khác gì với method overriding?"*

### Giải thích lý thuyết

**Method hiding** xảy ra khi lớp con định nghĩa một **static method** có cùng chữ ký với static method của lớp cha. Đây không phải overriding vì static method thuộc về class, không thuộc về đối tượng.

| Tiêu chí | Method Overriding | Method Hiding |
|---------|------------------|--------------|
| Áp dụng với | Instance method | Static method |
| Binding | Runtime (dynamic) | Compile-time (static) |
| Phụ thuộc vào | Kiểu đối tượng thực | Kiểu tham chiếu |
| Polymorphism | Có | Không |

### Code minh hoạu

```java
public class Parent {
    // Instance method — sẽ bị override
    public void instanceMethod() {
        System.out.println("Parent - instance method");
    }

    // Static method — sẽ bị hide, không bị override
    public static void staticMethod() {
        System.out.println("Parent - static method");
    }
}

public class Child extends Parent {
    @Override
    public void instanceMethod() {
        System.out.println("Child - instance method");
    }

    // Đây là method hiding, KHÔNG phải overriding
    public static void staticMethod() {
        System.out.println("Child - static method");
    }
}

public class Main {
    public static void main(String[] args) {
        Parent obj = new Child(); // tham chiếu Parent, đối tượng Child

        obj.instanceMethod(); // In: "Child - instance method" — runtime binding
        obj.staticMethod();   // In: "Parent - static method" — compile-time binding!

        Child child = new Child();
        child.staticMethod(); // In: "Child - static method"
    }
}
```

### Đáp án mẫu

> "Method hiding xảy ra khi lớp con định nghĩa static method có cùng chữ ký với static method lớp cha. Khác với overriding, method hiding dùng compile-time binding — method được gọi phụ thuộc vào kiểu tham chiếu, không phải kiểu đối tượng thực. Điều này có thể gây nhầm lẫn nên thực tế hiếm khi cố ý dùng method hiding."

---

## Câu 6: Abstract class là gì? Khi nào nên dùng? `[Basic]`

### Câu hỏi

> *"Abstract class trong Java là gì? Cho tôi biết khi nào nên dùng abstract class?"*

### Giải thích lý thuyết

**Abstract class (lớp trừu tượng)** là class được khai báo với từ khoá `abstract`. Đặc điểm:

- Không thể khởi tạo trực tiếp (không thể `new AbstractClass()`)
- Có thể chứa **abstract method** (khai báo nhưng không cài đặt)
- Có thể chứa **concrete method** (có cài đặt đầy đủ)
- Có thể có constructor, fields, static methods
- Lớp con **phải** override tất cả abstract method (hoặc tự cũng là abstract)

**Nên dùng abstract class khi:**
- Muốn chia sẻ code (state và behaviour) giữa các lớp có quan hệ họ hàng
- Các lớp con cần dùng `protected` fields hoặc methods chung
- Muốn cung cấp implement mặc định cho một số method, để abstract cho method khác
- Có "template method pattern" — bộ khung chung, chi tiết để lớp con điền vào

### Code minh hoạu

```java
// Abstract class — Template Method Pattern
public abstract class DataProcessor {
    // Template method — xác định bộ khung thuật toán
    public final void process() {
        readData();      // bước 1: đọc dữ liệu
        processData();   // bước 2: xử lý — để lớp con tự cài đặt
        writeResult();   // bước 3: ghi kết quả
    }

    // Concrete method — dùng chung cho tất cả lớp con
    protected void readData() {
        System.out.println("Đọc dữ liệu từ nguồn...");
    }

    // Abstract method — lớp con bắt buộc phải cài đặt
    protected abstract void processData();

    // Concrete method với implement mặc định
    protected void writeResult() {
        System.out.println("Ghi kết quả ra output...");
    }
}

public class CSVProcessor extends DataProcessor {
    @Override
    protected void processData() {
        System.out.println("Xử lý file CSV...");
    }
}

public class JSONProcessor extends DataProcessor {
    @Override
    protected void processData() {
        System.out.println("Xử lý file JSON...");
    }
}
```

### Đáp án mẫu

> "Abstract class là class không thể khởi tạo trực tiếp, dùng để định nghĩa bộ khung chung cho các lớp con. Nó có thể có cả abstract method lẫn concrete method. Tôi dùng abstract class khi các lớp có quan hệ 'is-a' và cần chia sẻ state hoặc implementation chung, ví dụ template method pattern. Nếu chỉ cần định nghĩa contract mà không cần share code, tôi dùng interface."

---

## Câu 7: Abstract class và interface khác nhau thế nào? `[Intermediate]`

### Câu hỏi

> *"Phân biệt abstract class và interface trong Java. Khi nào chọn cái nào?"*

### Giải thích lý thuyết

| Tiêu chí | Abstract Class | Interface |
|---------|---------------|-----------|
| Từ khoá | `abstract class` | `interface` |
| Kế thừa | Chỉ extend 1 class | Implement nhiều interface |
| Constructor | Có | Không |
| Fields | Có (mọi loại) | Chỉ `public static final` |
| Methods | Abstract + Concrete | Abstract, default, static (Java 8+) |
| Access modifier | Mọi loại | `public` (mặc định) |
| Quan hệ | "is-a" | "can-do" / "has-ability" |

**Quy tắc chọn:**
- Dùng **abstract class** khi các lớp có quan hệ họ hàng chặt chẽ và cần chia sẻ code/state
- Dùng **interface** khi muốn định nghĩa capability (khả năng) mà nhiều lớp không liên quan có thể implement

### Code minh hoạu

```java
// Abstract class — quan hệ "is-a", chia sẻ state và code
public abstract class Vehicle {
    protected String brand; // shared state
    protected int year;

    public Vehicle(String brand, int year) {
        this.brand = brand;
        this.year = year;
    }

    public String getBrand() { return brand; } // shared implementation

    public abstract void startEngine(); // mỗi xe có cách khởi động khác nhau
}

// Interface — định nghĩa capability, không quan hệ họ hàng
public interface Rechargeable {
    void charge(); // khả năng sạc điện
    default int getChargeLevel() { return 0; } // default method Java 8+
}

public interface GPSEnabled {
    String getCurrentLocation(); // khả năng định vị GPS
}

// Tesla vừa là Vehicle (is-a), vừa Rechargeable và GPSEnabled (can-do)
public class Tesla extends Vehicle implements Rechargeable, GPSEnabled {
    public Tesla() { super("Tesla", 2024); }

    @Override
    public void startEngine() {
        System.out.println("Tesla khởi động im lặng...");
    }

    @Override
    public void charge() {
        System.out.println("Đang sạc pin Tesla...");
    }

    @Override
    public String getCurrentLocation() {
        return "10.762622, 106.660172"; // Tọa độ TP.HCM
    }
}
```

### Đáp án mẫu

> "Abstract class dùng cho quan hệ 'is-a' chặt chẽ, cho phép chia sẻ state và code giữa các lớp họ hàng, nhưng chỉ extend được một class. Interface định nghĩa 'can-do' capability, không ràng buộc họ hàng và có thể implement nhiều interface cùng lúc. Thực tế tôi ưu tiên interface để giữ tính linh hoạt, chỉ dùng abstract class khi thực sự cần chia sẻ implementation."

---

## Câu 8: Interface là gì? Java 8 thay đổi gì với interface? `[Intermediate]`

### Câu hỏi

> *"Interface trong Java là gì? Java 8 đã thêm những tính năng mới nào cho interface?"*

### Giải thích lý thuyết

**Interface** là một contract — định nghĩa những gì một class phải làm, không quan tâm cách làm. Trước Java 8, interface chỉ có abstract method.

**Java 8 bổ sung:**

1. **Default method** — method có implementation mặc định trong interface, lớp implement có thể override hoặc dùng mặc định. Giải quyết vấn đề backward compatibility khi thêm method mới vào interface.

2. **Static method** — method static trong interface, gọi qua tên interface, không thể override.

3. **Functional interface** — interface chỉ có 1 abstract method, dùng với Lambda expression. Annotation `@FunctionalInterface` để compiler kiểm tra.

**Java 9 bổ sung thêm:**
- **Private method** — method private dùng nội bộ trong interface, tránh trùng lặp code giữa các default method.

### Code minh hoạu

```java
// Interface với các tính năng Java 8+
public interface Logger {
    // Abstract method — bắt buộc implement
    void log(String message);

    // Default method — có implement mặc định, có thể override
    default void logInfo(String message) {
        log("[INFO] " + message);
    }

    default void logError(String message) {
        log("[ERROR] " + message);
    }

    // Static method — gọi qua Logger.createConsoleLogger()
    static Logger createConsoleLogger() {
        return message -> System.out.println(message); // Lambda vì là Functional Interface
    }
}

// Functional Interface — chỉ 1 abstract method
@FunctionalInterface
public interface Validator<T> {
    boolean validate(T value);

    // Default method không vi phạm "functional" vì không phải abstract
    default Validator<T> and(Validator<T> other) {
        return value -> this.validate(value) && other.validate(value);
    }
}

public class Main {
    public static void main(String[] args) {
        // Dùng Lambda với Functional Interface
        Validator<String> notEmpty = s -> !s.isEmpty();
        Validator<String> notTooLong = s -> s.length() <= 100;

        // Kết hợp validator bằng default method
        Validator<String> combined = notEmpty.and(notTooLong);

        System.out.println(combined.validate("Hello")); // true
        System.out.println(combined.validate(""));       // false

        // Static factory method
        Logger logger = Logger.createConsoleLogger();
        logger.logInfo("Ứng dụng khởi động");   // [INFO] Ứng dụng khởi động
        logger.logError("Lỗi kết nối database"); // [ERROR] Lỗi kết nối database
    }
}
```

### Đáp án mẫu

> "Interface là contract định nghĩa những method mà class phải cài đặt. Java 8 bổ sung default method — cho phép thêm method có implementation vào interface mà không phá vỡ các class đã implement; static method — dùng như utility method của interface; và hỗ trợ functional interface với Lambda expression. Đây là bước ngoặt giúp Java hỗ trợ functional programming."

---

## Câu 9: Composition và Inheritance — khi nào nên dùng cái nào? `[Intermediate]`

### Câu hỏi

> *"Bạn nghe câu 'Favor composition over inheritance' chưa? Giải thích và cho ví dụ cụ thể?"*

### Giải thích lý thuyết

**Inheritance (Kế thừa):** Lớp con kế thừa từ lớp cha — quan hệ "is-a". Lớp con phụ thuộc chặt vào lớp cha (tight coupling — kết nối chặt).

**Composition (Thành phần):** Một class chứa instance của class khác — quan hệ "has-a". Kết nối lỏng hơn (loose coupling).

**Tại sao ưu tiên Composition?**
- **Linh hoạt hơn:** Có thể thay đổi behaviour tại runtime bằng cách đổi component
- **Ít phụ thuộc:** Thay đổi lớp cha không ảnh hưởng lớp sử dụng composition
- **Dễ test:** Dễ mock từng component riêng
- **Tránh class hierarchy sâu:** Quá nhiều tầng kế thừa khó bảo trì

**Dùng Inheritance khi:** Quan hệ "is-a" rõ ràng và lớp con thực sự là phiên bản đặc biệt của lớp cha.

### Code minh hoạu

```java
// KHÔNG NÊN: Inheritance khi không có quan hệ "is-a" thực sự
public class Stack<T> extends ArrayList<T> { // Stack IS-A ArrayList? Sai!
    public void push(T item) { add(item); }
    public T pop() { return remove(size() - 1); }
    // Vấn đề: lộ ra tất cả method của ArrayList như add(index, element)
    // người dùng có thể thêm vào giữa stack — vi phạm ngữ nghĩa Stack
}

// NÊN: Composition — Stack HAS-A List để lưu dữ liệu
public class BetterStack<T> {
    private final List<T> elements = new ArrayList<>(); // composition

    public void push(T item) { elements.add(item); }

    public T pop() {
        if (isEmpty()) throw new EmptyStackException();
        return elements.remove(elements.size() - 1);
    }

    public boolean isEmpty() { return elements.isEmpty(); }
    public int size() { return elements.size(); }
    // Chỉ expose đúng API của Stack, không lộ List API
}

// Composition cho phép thay đổi behaviour tại runtime
public interface SortStrategy {
    void sort(int[] array);
}

public class BubbleSort implements SortStrategy {
    @Override
    public void sort(int[] array) {
        System.out.println("Sắp xếp bằng Bubble Sort");
        // ... implement bubble sort
    }
}

public class QuickSort implements SortStrategy {
    @Override
    public void sort(int[] array) {
        System.out.println("Sắp xếp bằng Quick Sort");
        // ... implement quick sort
    }
}

public class Sorter {
    private SortStrategy strategy; // composition

    public Sorter(SortStrategy strategy) {
        this.strategy = strategy;
    }

    // Thay strategy tại runtime!
    public void setStrategy(SortStrategy strategy) {
        this.strategy = strategy;
    }

    public void sort(int[] array) {
        strategy.sort(array); // delegate sang strategy
    }
}
```

### Đáp án mẫu

> "Composition được ưu tiên hơn inheritance vì nó linh hoạt và ít phụ thuộc hơn. Với composition, một class chứa và delegate công việc sang class khác, dễ thay đổi tại runtime. Inheritance chỉ nên dùng khi có quan hệ 'is-a' thực sự — ví dụ Dog is-a Animal. Sai lầm cổ điển là dùng Stack extends ArrayList, lộ ra API không phù hợp; đúng hơn là Stack có ArrayList bên trong."

---

## Câu 10: SOLID principles là gì? Giải thích S và O. `[Intermediate]`

### Câu hỏi

> *"SOLID là gì? Giải thích Single Responsibility Principle và Open/Closed Principle với ví dụ?"*

### Giải thích lý thuyết

**SOLID** là 5 nguyên tắc thiết kế hướng đối tượng giúp code dễ bảo trì, mở rộng và test:

| Chữ cái | Tên nguyên tắc | Ý nghĩa ngắn |
|--------|---------------|-------------|
| **S** | Single Responsibility Principle | Mỗi class chỉ có 1 lý do để thay đổi |
| **O** | Open/Closed Principle | Mở để mở rộng, đóng để sửa đổi |
| **L** | Liskov Substitution Principle | Lớp con thay thế được lớp cha |
| **I** | Interface Segregation Principle | Không ép implement interface không cần |
| **D** | Dependency Inversion Principle | Phụ thuộc vào abstraction, không vào implementation |

**S — Single Responsibility Principle (SRP):** Một class chỉ nên có một trách nhiệm duy nhất. Nếu class thay đổi vì nhiều lý do khác nhau — vi phạm SRP.

**O — Open/Closed Principle (OCP):** Class nên mở để mở rộng (thêm tính năng mới) nhưng đóng để sửa đổi (không sửa code cũ). Đạt được qua abstraction và polymorphism.

### Code minh hoạu

```java
// Vi phạm SRP — class Order đang làm quá nhiều việc
public class OrderBad {
    public void calculateTotal() { /* tính tiền */ }
    public void saveToDatabase() { /* lưu DB */ }
    public void sendEmailNotification() { /* gửi email */ }
    public void printInvoice() { /* in hoá đơn */ }
}

// Đúng SRP — tách ra từng class có 1 trách nhiệm
public class Order {
    public void calculateTotal() { /* chỉ tính tiền */ }
}

public class OrderRepository {
    public void save(Order order) { /* chỉ lưu DB */ }
}

public class OrderNotificationService {
    public void sendEmail(Order order) { /* chỉ gửi email */ }
}

// Vi phạm OCP — phải sửa class khi thêm loại discount mới
public class DiscountCalculatorBad {
    public double calculate(String type, double price) {
        if (type.equals("STUDENT")) return price * 0.8;
        if (type.equals("SENIOR")) return price * 0.7;
        // Thêm loại mới phải sửa method này — vi phạm OCP!
        return price;
    }
}

// Đúng OCP — thêm loại mới chỉ cần tạo class mới, không sửa code cũ
public interface DiscountStrategy {
    double apply(double price);
}

public class StudentDiscount implements DiscountStrategy {
    @Override
    public double apply(double price) { return price * 0.8; }
}

public class SeniorDiscount implements DiscountStrategy {
    @Override
    public double apply(double price) { return price * 0.7; }
}

// Thêm loại mới: chỉ tạo class mới, không đụng vào DiscountCalculator
public class SeasonalDiscount implements DiscountStrategy {
    @Override
    public double apply(double price) { return price * 0.9; }
}

public class DiscountCalculator {
    public double calculate(DiscountStrategy strategy, double price) {
        return strategy.apply(price); // mở để mở rộng, đóng để sửa đổi
    }
}
```

### Đáp án mẫu

> "SOLID là 5 nguyên tắc thiết kế OOP. S — Single Responsibility: mỗi class chỉ có một lý do để thay đổi, tránh class làm quá nhiều việc. O — Open/Closed: mở để mở rộng qua abstraction và polymorphism, đóng để sửa code cũ. Ví dụ, thay vì if-else cho từng loại discount, dùng interface DiscountStrategy, thêm loại mới chỉ cần tạo class implement mới."

---

## Câu 11: Liskov Substitution Principle (LSP) là gì? `[Advanced]`

### Câu hỏi

> *"Liskov Substitution Principle là gì? Cho ví dụ vi phạm và cách sửa?"*

### Giải thích lý thuyết

**Liskov Substitution Principle (LSP):** Nếu S là subtype của T, thì object của T có thể được thay thế bằng object của S mà không làm hỏng tính đúng đắn của chương trình.

Nói đơn giản: **lớp con phải hoạt động đúng ở bất kỳ chỗ nào lớp cha được dùng.**

Vi phạm LSP thường xảy ra khi:
- Lớp con throw exception mà lớp cha không throw
- Lớp con override method nhưng thay đổi ngữ nghĩa (precondition chặt hơn hoặc postcondition yếu hơn)
- Lớp con override method để làm... không gì cả (no-op)

Ví dụ cổ điển: **Rectangle** và **Square**. Về toán học, hình vuông là hình chữ nhật đặc biệt — nhưng trong code, `Square extends Rectangle` vi phạm LSP.

### Code minh hoạu

```java
// Vi phạm LSP — Square extends Rectangle
public class Rectangle {
    protected int width;
    protected int height;

    public void setWidth(int width) { this.width = width; }
    public void setHeight(int height) { this.height = height; }
    public int area() { return width * height; }
}

public class Square extends Rectangle {
    @Override
    public void setWidth(int width) {
        // Hình vuông: width = height phải bằng nhau
        this.width = width;
        this.height = width; // thay đổi ngầm height!
    }

    @Override
    public void setHeight(int height) {
        this.width = height; // thay đổi ngầm width!
        this.height = height;
    }
}

public class Main {
    // Hàm này viết cho Rectangle — kỳ vọng width và height độc lập
    public static void testRectangle(Rectangle r) {
        r.setWidth(5);
        r.setHeight(3);
        // Kỳ vọng: 5 * 3 = 15
        assert r.area() == 15 : "Diện tích phải là 15!";
        // Khi truyền Square vào: area() = 3*3 = 9 — FAIL!
    }
}

// Sửa đúng — dùng abstraction chung, không kế thừa
public interface Shape {
    int area();
}

public class Rectangle implements Shape {
    private final int width;
    private final int height;

    public Rectangle(int width, int height) {
        this.width = width;
        this.height = height;
    }

    @Override
    public int area() { return width * height; }
}

public class Square implements Shape {
    private final int side;

    public Square(int side) { this.side = side; }

    @Override
    public int area() { return side * side; }
}
// Rectangle và Square là 2 class độc lập, cùng implement Shape
// Không ai phá vỡ kỳ vọng của class kia
```

### Đáp án mẫu

> "LSP nói rằng lớp con phải hoạt động đúng ở mọi nơi lớp cha được dùng. Ví dụ cổ điển: Square extends Rectangle vi phạm LSP vì khi set width cho Square, height cũng tự thay đổi — phá vỡ kỳ vọng của code dùng Rectangle. Cách sửa là dùng abstraction chung như interface Shape thay vì kế thừa nhau. LSP giúp code an toàn với polymorphism và dễ mở rộng."

---

## Câu 12: Singleton pattern là gì? `[Intermediate]`

### Câu hỏi

> *"Singleton pattern là gì? Cài đặt thread-safe Singleton trong Java như thế nào?"*

### Giải thích lý thuyết

**Singleton pattern** đảm bảo một class chỉ có **duy nhất một instance** trong suốt vòng đời ứng dụng, và cung cấp một điểm truy cập global đến instance đó.

**Các cách cài đặt:**

1. **Eager Initialization** — tạo instance ngay khi class load, đơn giản nhưng tốn bộ nhớ nếu không dùng
2. **Lazy Initialization** — tạo khi lần đầu cần, nhưng không thread-safe
3. **Double-Checked Locking** — lazy + thread-safe, hiệu quả cao
4. **Bill Pugh (Static Inner Class)** — cách tốt nhất, lazy + thread-safe + đơn giản
5. **Enum Singleton** — thread-safe, chống reflection attack

**Nhược điểm Singleton:**
- Khó test (global state)
- Vi phạm SRP (tự quản lý vòng đời)
- Nên dùng Dependency Injection thay thế trong hầu hết trường hợp

### Code minh hoạu

```java
// Cách 1: Eager Initialization — đơn giản, thread-safe
public class ConfigManager {
    // Tạo ngay khi class load
    private static final ConfigManager INSTANCE = new ConfigManager();

    private ConfigManager() {} // private constructor — ngăn new từ bên ngoài

    public static ConfigManager getInstance() {
        return INSTANCE;
    }
}

// Cách 2: Double-Checked Locking — lazy + thread-safe
public class DatabaseConnection {
    // volatile đảm bảo visibility giữa các thread
    private static volatile DatabaseConnection instance;

    private DatabaseConnection() {
        System.out.println("Khởi tạo kết nối DB...");
    }

    public static DatabaseConnection getInstance() {
        if (instance == null) { // kiểm tra lần 1 — không lock, nhanh
            synchronized (DatabaseConnection.class) {
                if (instance == null) { // kiểm tra lần 2 — trong lock, an toàn
                    instance = new DatabaseConnection();
                }
            }
        }
        return instance;
    }
}

// Cách 3: Bill Pugh — CÁCH TỐT NHẤT, lazy + thread-safe + đơn giản
public class AppConfig {
    private AppConfig() {}

    // Inner class chỉ được load khi getInstance() được gọi lần đầu
    private static class Holder {
        private static final AppConfig INSTANCE = new AppConfig();
    }

    public static AppConfig getInstance() {
        return Holder.INSTANCE; // thread-safe do JVM đảm bảo class loading
    }

    public String getProperty(String key) {
        return System.getProperty(key);
    }
}

// Cách 4: Enum — chống reflection và deserialization attack
public enum LogService {
    INSTANCE; // duy nhất một giá trị enum

    public void log(String message) {
        System.out.println("[LOG] " + message);
    }
}

// Sử dụng
LogService.INSTANCE.log("Ứng dụng bắt đầu"); // thread-safe, đơn giản
```

### Đáp án mẫu

> "Singleton đảm bảo một class chỉ có một instance duy nhất. Cách tốt nhất là Bill Pugh — dùng static inner class, lazy initialization và thread-safe nhờ JVM đảm bảo class loading an toàn. Enum Singleton cũng rất tốt vì chống cả reflection attack. Tuy nhiên Singleton gây khó test do global state, nên trong Spring Boot tôi thường dùng Dependency Injection thay thế."

---

## Câu 13: Factory pattern là gì? `[Intermediate]`

### Câu hỏi

> *"Factory pattern trong Java là gì? Phân biệt Factory Method và Abstract Factory?"*

### Giải thích lý thuyết

**Factory pattern** là creational design pattern — ẩn đi logic khởi tạo đối tượng, client chỉ cần yêu cầu loại đối tượng mà không cần biết cách tạo.

**3 biến thể chính:**

| Biến thể | Mô tả | Dùng khi |
|---------|-------|---------|
| **Simple Factory** | Một method/class tạo object | Logic tạo object đơn giản |
| **Factory Method** | Lớp cha định nghĩa method tạo, lớp con quyết định tạo loại nào | Muốn lớp con kiểm soát việc tạo object |
| **Abstract Factory** | Factory của các factory, tạo họ object liên quan | Cần tạo nhóm object tương thích nhau |

**Lợi ích:**
- Tách biệt logic tạo object khỏi logic sử dụng
- Dễ thêm loại object mới (OCP)
- Client không phụ thuộc vào class cụ thể

### Code minh hoạu

```java
// Simple Factory — tập trung logic tạo vào một chỗ
public interface Notification {
    void send(String message);
}

public class EmailNotification implements Notification {
    @Override
    public void send(String message) {
        System.out.println("Gửi email: " + message);
    }
}

public class SMSNotification implements Notification {
    @Override
    public void send(String message) {
        System.out.println("Gửi SMS: " + message);
    }
}

public class PushNotification implements Notification {
    @Override
    public void send(String message) {
        System.out.println("Gửi push notification: " + message);
    }
}

// Simple Factory
public class NotificationFactory {
    public static Notification create(String type) {
        return switch (type) {
            case "EMAIL" -> new EmailNotification();
            case "SMS"   -> new SMSNotification();
            case "PUSH"  -> new PushNotification();
            default -> throw new IllegalArgumentException("Loại không hợp lệ: " + type);
        };
    }
}

// Factory Method Pattern — lớp con quyết định tạo loại nào
public abstract class NotificationSender {
    // Template method — dùng factory method bên trong
    public void notifyUser(String userId, String message) {
        Notification notification = createNotification(); // factory method
        notification.send(message);
    }

    // Factory method — lớp con override để trả về loại phù hợp
    protected abstract Notification createNotification();
}

public class EmailSender extends NotificationSender {
    @Override
    protected Notification createNotification() {
        return new EmailNotification();
    }
}

public class SMSSender extends NotificationSender {
    @Override
    protected Notification createNotification() {
        return new SMSNotification();
    }
}

// Sử dụng Simple Factory
public class OrderService {
    public void processOrder(String orderId, String notifType) {
        Notification notif = NotificationFactory.create(notifType);
        notif.send("Đơn hàng " + orderId + " đã được xử lý");
    }
}
```

### Đáp án mẫu

> "Factory pattern ẩn logic khởi tạo đối tượng, client chỉ yêu cầu loại cần dùng. Simple Factory dùng một method trung tâm để tạo object. Factory Method để lớp con quyết định tạo loại nào — phù hợp khi cần mở rộng qua kế thừa. Abstract Factory tạo họ object liên quan nhau — ví dụ UI factory tạo button và dialog phù hợp với từng OS. Lợi ích chính là client không phụ thuộc vào class cụ thể, dễ mở rộng."

---

## Câu 14: Builder pattern là gì? `[Intermediate]`

### Câu hỏi

> *"Builder pattern là gì? Khi nào nên dùng và cài đặt thế nào trong Java?"*

### Giải thích lý thuyết

**Builder pattern** là creational pattern dùng để xây dựng đối tượng phức tạp từng bước (step-by-step). Tách biệt việc xây dựng (construction) khỏi biểu diễn (representation) của đối tượng.

**Nên dùng Builder khi:**
- Constructor có nhiều tham số (trên 4-5 tham số — "telescoping constructor problem")
- Một số tham số là optional
- Object phức tạp cần nhiều bước khởi tạo
- Muốn object immutable sau khi tạo

**Lợi ích:**
- Code dễ đọc hơn nhiều so với constructor nhiều tham số
- Tránh nhầm lẫn thứ tự tham số
- Hỗ trợ tạo object immutable
- Fluent API (method chaining) dễ sử dụng

### Code minh hoạu

```java
// Telescoping Constructor Problem — khó đọc, dễ nhầm
public class UserBad {
    public UserBad(String name, String email, int age, String phone,
                   String address, boolean active) { /* ... */ }
}

// Gọi constructor — dễ nhầm thứ tự tham số!
UserBad user = new UserBad("Thuan", "thuan@example.com", 25,
                            "0912345678", "TP.HCM", true);

// Builder Pattern — dễ đọc, rõ ràng, hỗ trợ optional fields
public class User {
    // Tất cả fields là final — immutable object
    private final String name;
    private final String email;
    private final int age;
    private final String phone;    // optional
    private final String address;  // optional
    private final boolean active;

    // Private constructor — chỉ Builder mới gọi được
    private User(Builder builder) {
        this.name    = builder.name;
        this.email   = builder.email;
        this.age     = builder.age;
        this.phone   = builder.phone;
        this.address = builder.address;
        this.active  = builder.active;
    }

    // Getters
    public String getName()    { return name; }
    public String getEmail()   { return email; }
    public int getAge()        { return age; }
    public String getPhone()   { return phone; }
    public String getAddress() { return address; }
    public boolean isActive()  { return active; }

    // Static Builder class bên trong
    public static class Builder {
        // Required fields
        private final String name;
        private final String email;

        // Optional fields với giá trị mặc định
        private int age = 0;
        private String phone = "";
        private String address = "";
        private boolean active = true;

        // Constructor chỉ nhận required fields
        public Builder(String name, String email) {
            this.name  = name;
            this.email = email;
        }

        // Setter method trả về this — cho phép method chaining
        public Builder age(int age) {
            this.age = age;
            return this;
        }

        public Builder phone(String phone) {
            this.phone = phone;
            return this;
        }

        public Builder address(String address) {
            this.address = address;
            return this;
        }

        public Builder active(boolean active) {
            this.active = active;
            return this;
        }

        // Build — validate và tạo object
        public User build() {
            if (name == null || name.isBlank()) {
                throw new IllegalStateException("Tên không được để trống");
            }
            if (!email.contains("@")) {
                throw new IllegalStateException("Email không hợp lệ");
            }
            return new User(this);
        }
    }
}

// Sử dụng Builder — dễ đọc, fluent API
public class Main {
    public static void main(String[] args) {
        // Tạo user đầy đủ thông tin
        User user1 = new User.Builder("Nguyen Van A", "nva@example.com")
                .age(28)
                .phone("0912345678")
                .address("Hà Nội")
                .active(true)
                .build();

        // Tạo user chỉ có required fields — optional dùng giá trị mặc định
        User user2 = new User.Builder("Tran Thi B", "ttb@example.com")
                .build();

        System.out.println(user1.getName()); // Nguyen Van A
        System.out.println(user2.isActive()); // true (giá trị mặc định)
    }
}
```

### Đáp án mẫu

> "Builder pattern giải quyết vấn đề constructor có quá nhiều tham số. Thay vì truyền 7-8 tham số vào constructor và dễ nhầm thứ tự, Builder cho phép set từng field rõ ràng qua fluent API, hỗ trợ optional fields với giá trị mặc định, và tạo ra immutable object. Trong thực tế tôi hay dùng Lombok `@Builder` để tránh viết tay boilerplate code."

---
