---
sidebar_position: 28
title: "28. Java Annotation"
---

# Java Annotation

**Annotation** trong Java là một dạng **metadata (siêu dữ liệu)** - thông tin mô tả về code nhưng **không trực tiếp thay đổi logic chương trình**. Annotation giúp compiler, framework, và các công cụ xử lý code tự động hiểu và xử lý code theo cách đặc biệt.

Hãy tưởng tượng bạn viết một bức thư. Nội dung thư là **code** của bạn. Nhưng trên bao thư, bạn ghi thêm các ghi chú như "KHẨN CẤP", "XỬ LÝ TRƯỚC", "GỬI LẠI NẾU KHÔNG NHẬN ĐƯỢC". Những ghi chú này không thay đổi nội dung thư, nhưng giúp người xử lý biết phải làm gì với bức thư đó. Annotation cũng tương tự - nó "ghi chú" cho code để compiler và framework biết cách xử lý.

Annotation là **nền tảng của Java hiện đại**: Spring Boot, JPA/Hibernate, JUnit, Lombok... tất cả đều hoạt động dựa trên annotation.

---

## Mục lục

- [1. Built-in Annotations (Annotation có sẵn)](#1-built-in-annotations-annotation-có-sẵn)
- [2. Meta-annotations (Annotation cho Annotation)](#2-meta-annotations-annotation-cho-annotation)
- [3. Tao Custom Annotation](#3-tao-custom-annotation)
- [4. Annotation trong cac Framework pho bien](#4-annotation-trong-cac-framework-pho-bien)
- [5. Annotation vs Comment](#5-annotation-vs-comment)
- [Khi nao dung?](#khi-nao-dung)
- [Loi thuong gap](#loi-thuong-gap)
- [Cau hoi phong van](#cau-hoi-phong-van)

---

## 1. Built-in Annotations (Annotation có sẵn)

### 1.1 `@Override` - Ghi đè method của lớp cha

```java
public class Animal {
    public String makeSound() {
        return "...";
    }
}

public class Dog extends Animal {
    @Override  // Báo compiler: method này ghi đè method của lớp cha
    public String makeSound() {
        return "Gau gau!";
    }

    // Nếu viết sai tên method, compiler sẽ BÁO LỖI
    // @Override
    // public String makeSound2() { }  // Lỗi! Lớp cha không có makeSound2
}
```

**Tại sao nên dùng `@Override`:** Nếu bạn viết sai tên method (ví dụ `makesound` thay vì `makeSound`), không có `@Override` thì compiler sẽ tưởng bạn tạo method mới, không báo lỗi. Với `@Override`, compiler sẽ báo lỗi ngay, giúp tránh bug khó tìm.

### 1.2 `@Deprecated` - Đánh dấu đã lỗi thời

```java
public class PaymentService {
    /**
     * @deprecated Dùng {@link #processPaymentV2(String, double)} thay thế.
     * Method này sẽ bị xóa ở version 3.0.
     */
    @Deprecated
    public void processPayment(String cardNumber, double amount) {
        // Logic cũ...
    }

    public void processPaymentV2(String cardNumber, double amount) {
        // Logic mới, bảo mật hơn...
    }
}

public class Main {
    public static void main(String[] args) {
        PaymentService service = new PaymentService();

        // Compiler sẽ cảnh báo khi gọi method deprecated
        service.processPayment("1234", 100.0); // Warning: deprecated

        // Nên dùng method mới
        service.processPaymentV2("1234", 100.0); // OK
    }
}
```

### 1.3 `@SuppressWarnings` - Tắt cảnh báo của compiler

```java
public class SuppressDemo {

    @SuppressWarnings("unchecked")  // Tắt cảnh báo về unchecked cast
    public void example1() {
        java.util.List rawList = new java.util.ArrayList();
        rawList.add("hello"); // Không có generic -> compiler cảnh báo
    }

    @SuppressWarnings("deprecation")  // Tắt cảnh báo về deprecated
    public void example2() {
        PaymentService service = new PaymentService();
        service.processPayment("1234", 100.0); // Không cảnh báo nữa
    }

    @SuppressWarnings({"unchecked", "deprecation"})  // Tắt nhiều cảnh báo
    public void example3() {
        // ...
    }
}
```

**Các giá trị thường dùng:**

| Giá trị         | Ý nghĩa                                |
| --------------- | -------------------------------------- |
| `"unchecked"`   | Tắt cảnh báo unchecked cast (generics) |
| `"deprecation"` | Tắt cảnh báo deprecated                |
| `"unused"`      | Tắt cảnh báo biến không dùng           |
| `"all"`         | Tắt tất cả cảnh báo                    |

### 1.4 `@FunctionalInterface` - Đánh dấu interface hàm

```java
@FunctionalInterface  // Đảm bảo interface chỉ có 1 abstract method
public interface Calculator {
    double calculate(double a, double b);

    // Co the co default methods
    default void printResult(double a, double b) {
        System.out.println("Kết quả: " + calculate(a, b));
    }

    // NẾU thêm abstract method thứ 2 -> Compiler BÁO LỖI
    // double anotherMethod(); // Lỗi!
}

public class LambdaDemo {
    public static void main(String[] args) {
        // Dung voi lambda expression
        Calculator add = (a, b) -> a + b;
        Calculator multiply = (a, b) -> a * b;

        add.printResult(3, 4);       // Ket qua: 7.0
        multiply.printResult(3, 4);  // Ket qua: 12.0
    }
}
```

---

## 2. Meta-annotations (Annotation cho Annotation)

Meta-annotations la cac annotation dung de **dinh nghia cac annotation khac**. Chung chi dinh pham vi, thoi gian ton tai, va cac dac tinh cua annotation.

### 2.1 `@Target` - Annotation duoc dung o dau?

```java
import java.lang.annotation.Target;
import java.lang.annotation.ElementType;

// Chi dung tren METHOD
@Target(ElementType.METHOD)
public @interface MethodOnly { }

// Dung tren nhieu noi
@Target({ElementType.TYPE, ElementType.METHOD, ElementType.FIELD})
public @interface MultiTarget { }
```

**Cac gia tri `ElementType`:**

| Gia tri           | Ap dung cho                       |
| ----------------- | --------------------------------- |
| `TYPE`            | Class, Interface, Enum            |
| `METHOD`          | Method                            |
| `FIELD`           | Field (bien instance)             |
| `PARAMETER`       | Tham so cua method                |
| `CONSTRUCTOR`     | Constructor                       |
| `LOCAL_VARIABLE`  | Bien cuc bo                       |
| `ANNOTATION_TYPE` | Annotation khac (meta-annotation) |
| `PACKAGE`         | Package                           |

### 2.2 `@Retention` - Annotation ton tai den khi nao?

```java
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

// Chi ton tai trong source code (bi xoa khi compile)
@Retention(RetentionPolicy.SOURCE)
public @interface SourceOnly { }

// Ton tai trong file .class nhung KHONG co o runtime
@Retention(RetentionPolicy.CLASS)
public @interface ClassLevel { }

// Ton tai o runtime - co the doc bang Reflection
@Retention(RetentionPolicy.RUNTIME)
public @interface RuntimeAvailable { }
```

**So sanh `RetentionPolicy`:**

| Policy    | Source | .class file | Runtime | Dung khi                          |
| --------- | ------ | ----------- | ------- | --------------------------------- |
| `SOURCE`  | Co     | Khong       | Khong   | Compiler processing (`@Override`) |
| `CLASS`   | Co     | Co          | Khong   | Bytecode tools (mac dinh)         |
| `RUNTIME` | Co     | Co          | **Co**  | **Reflection** (Spring, JUnit)    |

### 2.3 `@Documented` va `@Inherited`

```java
import java.lang.annotation.*;

// @Documented: Annotation se xuat hien trong Javadoc
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface ApiVersion {
    String value();
}

// @Inherited: Lop con tu dong ke thua annotation cua lop cha
@Inherited
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface Auditable { }

@Auditable
public class BaseEntity { }

// ChildEntity TU DONG co @Auditable (nho @Inherited)
public class ChildEntity extends BaseEntity { }
```

---

## 3. Tao Custom Annotation

### 3.1 Annotation don gian

```java
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.annotation.ElementType;

// Dinh nghia annotation
@Retention(RetentionPolicy.RUNTIME)  // Co the doc o runtime
@Target(ElementType.METHOD)          // Chi dung tren method
public @interface LogExecutionTime {
    String value() default "";       // Tham so tuy chon voi gia tri mac dinh
}
```

### 3.2 Annotation voi nhieu tham so

```java
import java.lang.annotation.*;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface ApiInfo {
    String author();                       // Bat buoc (khong co default)
    String version() default "1.0";        // Tuy chon
    String[] tags() default {};            // Mang voi gia tri mac dinh rong
    boolean deprecated() default false;    // Boolean voi gia tri mac dinh
}
```

### 3.3 Su dung va doc annotation bang Reflection

```java
import java.lang.reflect.Method;

// Dinh nghia annotation
@java.lang.annotation.Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
@java.lang.annotation.Target(java.lang.annotation.ElementType.METHOD)
@interface RateLimit {
    int maxRequests() default 100;
    int timeWindowSeconds() default 60;
}

// Su dung annotation
@ApiInfo(author = "Thuan", version = "2.0", tags = {"api", "user"})
public class UserController {

    @RateLimit(maxRequests = 10, timeWindowSeconds = 30)
    @LogExecutionTime("getUser")
    public String getUser(int id) {
        return "User " + id;
    }

    @RateLimit  // Dung gia tri mac dinh: 100 requests / 60 giay
    public String listUsers() {
        return "All users";
    }
}

// Doc annotation bang Reflection
public class AnnotationReader {
    public static void main(String[] args) throws Exception {
        Class<?> clazz = UserController.class;

        // Doc annotation tren class
        if (clazz.isAnnotationPresent(ApiInfo.class)) {
            ApiInfo info = clazz.getAnnotation(ApiInfo.class);
            System.out.println("Author: " + info.author());
            System.out.println("Version: " + info.version());
            System.out.println("Tags: " + java.util.Arrays.toString(info.tags()));
        }

        // Doc annotation tren method
        for (Method method : clazz.getDeclaredMethods()) {
            if (method.isAnnotationPresent(RateLimit.class)) {
                RateLimit limit = method.getAnnotation(RateLimit.class);
                System.out.println("\nMethod: " + method.getName());
                System.out.println("  Max requests: " + limit.maxRequests());
                System.out.println("  Time window: " + limit.timeWindowSeconds() + "s");
            }
        }
    }
}
```

**Output:**

```
Author: Thuan
Version: 2.0
Tags: [api, user]

Method: getUser
  Max requests: 10
  Time window: 30s

Method: listUsers
  Max requests: 100
  Time window: 60s
```

---

## 4. Annotation trong cac Framework pho bien

### 4.1 Spring Framework

```java
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.stereotype.Repository;

// @RestController: Danh dau class la REST API controller
@RestController
@RequestMapping("/api/users")
public class UserController {

    // @Autowired: Tu dong inject dependency
    @Autowired
    private UserService userService;

    // @GetMapping: Xu ly HTTP GET request
    @GetMapping("/{id}")
    public User getUser(@PathVariable int id) {
        return userService.findById(id);
    }

    // @PostMapping: Xu ly HTTP POST request
    @PostMapping
    public User createUser(@RequestBody UserRequest request) {
        return userService.create(request);
    }
}

// @Service: Danh dau class la business logic layer
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public User findById(int id) {
        return userRepository.findById(id).orElse(null);
    }
}
```

### 4.2 JPA/Hibernate

```java
import jakarta.persistence.*;

// @Entity: Danh dau class map voi bang trong database
@Entity
@Table(name = "users")
public class User {

    @Id  // Primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // Auto-increment
    private Long id;

    @Column(nullable = false, length = 100)  // Dinh nghia cot
    private String name;

    @Column(unique = true)  // Cot duy nhat
    private String email;

    @OneToMany(mappedBy = "user")  // Quan he 1-N
    private java.util.List<Order> orders;

    // Getters va setters...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
```

### 4.3 JUnit 5

```java
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

public class CalculatorTest {

    @BeforeEach  // Chay truoc moi test
    void setUp() {
        // Khoi tao...
    }

    @Test  // Danh dau day la method test
    @DisplayName("Cong 2 so duong")
    void testAdd() {
        assertEquals(5, 2 + 3);
    }

    @Test
    @Disabled("Chua implement")  // Bo qua test nay
    void testDivide() {
        // TODO
    }

    @ParameterizedTest  // Test voi nhieu bo du lieu
    @ValueSource(ints = {1, 2, 3, 4, 5})
    void testPositive(int number) {
        assertTrue(number > 0);
    }

    @AfterEach  // Chay sau moi test
    void tearDown() {
        // Don dep...
    }
}
```

---

## 5. Annotation vs Comment

| Tieu chi          | Annotation                             | Comment       |
| ----------------- | -------------------------------------- | ------------- |
| Doc boi           | **Compiler, JVM, Framework**           | Chi con nguoi |
| Anh huong runtime | Co (voi `RUNTIME` retention)           | Khong         |
| Kiem tra loi      | Co (vi du `@Override` bao loi compile) | Khong         |
| Sinh code         | Co (Lombok, Spring)                    | Khong         |
| Vi du             | `@Override`, `@Autowired`              | `// Ghi chu`  |

---

## Khi nao dung?

**Dung Annotation khi:**

- **Ghi de method**: Luon dung `@Override` de compiler kiem tra
- **Danh dau code cu**: Dung `@Deprecated` khi method se bi xoa
- **Cau hinh framework**: Spring (`@RestController`, `@Autowired`), JPA (`@Entity`), JUnit (`@Test`)
- **Validation**: `@NotNull`, `@Size`, `@Email` (Bean Validation)
- **AOP (Aspect-Oriented Programming)**: `@Transactional`, `@Cacheable`
- **Tao custom metadata**: Khi can xu ly dac biet bang Reflection

**Best practices:**

- **Luon dung `@Override`** khi ghi de method cua lop cha hoac interface
- Dung `@Deprecated` kem theo Javadoc giai thich ly do va phuong an thay the
- Khi tao custom annotation, luon chi dinh `@Target` va `@Retention`
- Dung `@Retention(RetentionPolicy.RUNTIME)` neu can doc annotation bang Reflection
- Tranh lam dung `@SuppressWarnings` - chi dung khi that su hieu tai sao co warning

---

## Loi thuong gap

### 1. Quen `@Override` khi ghi de method

```java
public class Animal {
    public String makeSound() { return "..."; }
}

public class Cat extends Animal {
    // Sai - viet sai ten nhung khong co @Override nen compiler khong bao loi
    public String makesound() { // "s" thuong thay vi "S" hoa
        return "Meo meo!";
    }
    // Day la method MOI, KHONG ghi de makeSound()!

    // Dung - co @Override, compiler se bao loi neu ten sai
    @Override
    public String makeSound() {
        return "Meo meo!";
    }
}
```

### 2. Nham RetentionPolicy

```java
// Sai - dung SOURCE thi khong the doc bang Reflection o runtime
@java.lang.annotation.Retention(java.lang.annotation.RetentionPolicy.SOURCE)
@interface MyAnnotation {
    String value();
}

// O runtime:
// method.getAnnotation(MyAnnotation.class) -> NULL! Vi annotation da bi xoa

// Dung - dung RUNTIME khi can doc bang Reflection
@java.lang.annotation.Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
@interface MyAnnotation2 {
    String value();
}
```

### 3. Quen @Target dan den dung sai vi tri

```java
@java.lang.annotation.Target(java.lang.annotation.ElementType.METHOD)
@interface MethodOnly {
    String value() default "";
}

// Sai - annotation chi cho method, khong the dung tren class
// @MethodOnly("test")  // Loi compile!
// public class MyClass { }

// Dung - dung tren method
public class MyClass {
    @MethodOnly("test")
    public void myMethod() { }
}
```

### 4. Annotation parameter khong dung kieu

```java
// Annotation parameter chi chap nhan:
// - primitive (int, boolean, ...)
// - String
// - Class
// - Enum
// - Annotation khac
// - Array cua cac kieu tren

@interface Valid {
    String name();                    // OK
    int maxLength() default 100;      // OK
    Class<?> type() default Object.class; // OK
    // Object obj();                  // LOI! Object khong duoc phep
    // java.util.List<String> list(); // LOI! Generic khong duoc phep
}
```

---

## Cau hoi phong van

### 1. Annotation va Comment khac nhau nhu the nao?

**Tra loi:** Comment chi la ghi chu cho nguoi doc code, bi compiler bo qua hoan toan va khong anh huong den chuong trinh. Annotation la **metadata** duoc compiler va JVM xu ly: `@Override` giup compiler kiem tra loi ghi de, `@Deprecated` tao ra canh bao, `@Autowired` (Spring) tu dong inject dependency o runtime. Annotation co the ton tai den runtime va duoc doc bang Reflection, con comment thi khong.

### 2. `@Override` co bat buoc khong?

**Tra loi:** Khong bat buoc ve mat cu phap - code van chay khong co `@Override`. Nhung **rat nen dung** vi no giup compiler kiem tra: neu ban ghi de sai ten method, khong co `@Override` thi compiler se tuong ban tao method moi (khong bao loi), dan den bug logic rat kho tim. Voi `@Override`, compiler se bao loi ngay neu method khong thuc su ghi de method nao cua lop cha hay interface.

### 3. `RetentionPolicy` la gi va co may loai?

**Tra loi:** `RetentionPolicy` chi dinh thoi gian ton tai cua annotation. Co 3 loai: (1) **SOURCE** - chi ton tai trong source code, bi xoa khi compile (vi du `@Override`, `@SuppressWarnings`). (2) **CLASS** - ton tai trong file .class nhung khong co o runtime (mac dinh neu khong chi dinh). (3) **RUNTIME** - ton tai o runtime, co the doc bang Reflection API. Phan lon annotation trong framework (Spring, JPA, JUnit) dung `RUNTIME` vi can xu ly o runtime.

### 4. Annotation duoc su dung nhu the nao trong Spring?

**Tra loi:** Spring dung annotation lam **co che cau hinh chinh** thay cho XML: `@Component` / `@Service` / `@Repository` de danh dau bean, Spring tu dong scan va tao instance. `@Autowired` de inject dependency tu dong. `@RestController` + `@GetMapping` / `@PostMapping` de dinh nghia REST API. `@Transactional` de quan ly transaction. `@Configuration` + `@Bean` de cau hinh thu cong. Spring doc cac annotation nay bang Reflection o runtime va thuc hien cac xu ly tuong ung (tao bean, inject, wrap proxy...).

### 5. Lam sao tao custom annotation va doc no o runtime?

**Tra loi:** Tao annotation bang `@interface`, chi dinh `@Retention(RetentionPolicy.RUNTIME)` va `@Target`. Doc bang Reflection: dung `Class.getAnnotation()`, `Method.getAnnotation()`, hoac `isAnnotationPresent()`. Vi du:

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface Timeout { int value() default 30; }

// Doc:
Method m = MyClass.class.getMethod("myMethod");
if (m.isAnnotationPresent(Timeout.class)) {
    int timeout = m.getAnnotation(Timeout.class).value();
}
```

Day la cach cac framework nhu Spring va JUnit hoat dong ben trong.
