---
sidebar_position: 6
title: "6. Dependency Injection (Tiêm phụ thuộc)"
---

# Dependency Injection -- Tiêm phụ thuộc

**Dependency Injection (DI)** là một trong những pattern quan trọng nhất trong lập trình hiện đại. Thay vì class **tự tạo** đối tượng nó cần, ai đó **đưa cho nó** -- giảm coupling, tăng khả năng test.

**Tương tự đơn giản:** Hãy tưởng tượng một đầu bếp. Có 2 cách:

- **Cách 1 (không DI):** Đầu bếp tự ra chợ mua nguyên liệu. Mất thời gian, lệ thuộc chợ.
- **Cách 2 (DI):** Có người **đưa nguyên liệu** đến tận bếp. Đầu bếp chỉ tập trung nấu. Nguyên liệu có thể từ chợ A, chợ B, hoặc nguyên liệu giả (để tập nấu) -- không quan trọng.

Cách 2 chính là Dependency Injection.

---

## Mục lục

- [1. Dependency Injection là gì?](#1-dependency-injection-là-gì)
- [2. Tại sao cần DI?](#2-tại-sao-cần-di)
- [3. Các loại DI](#3-các-loại-di)
- [4. DI thủ công](#4-di-thủ-công)
- [5. DI với Spring Framework](#5-di-với-spring-framework)
- [6. DI với Guice](#6-di-với-guice)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Dependency Injection là gì?

**Dependency Injection** là pattern mà **các phụ thuộc của một class được cung cấp từ bên ngoài**, thay vì class tự tạo. Đây là một dạng cụ thể của **Inversion of Control (IoC)** -- "đảo ngược quyền điều khiển".

### Ví dụ không có DI

```java
public class OrderService {
    private PaymentService payment = new StripePayment(); // Tu tao
    private EmailService email = new GmailEmail();        // Tu tao

    public void placeOrder(Order order) {
        payment.charge(order);
        email.send(order);
    }
}
```

**Vấn đề:**

- `OrderService` **lệ thuộc cứng** vào `StripePayment` và `GmailEmail`
- Muốn đổi sang `PayPalPayment` phải sửa code
- Test khó -- không thể "fake" Payment/Email

### Ví dụ có DI

```java
public class OrderService {
    private final PaymentService payment;
    private final EmailService email;

    public OrderService(PaymentService payment, EmailService email) {
        this.payment = payment;
        this.email = email;
    }

    public void placeOrder(Order order) {
        payment.charge(order);
        email.send(order);
    }
}

// Su dung
OrderService service = new OrderService(new StripePayment(), new GmailEmail());
```

**Lợi ích:**

- Có thể đổi implementation mà không sửa `OrderService`
- Test dễ -- truyền mock
- Tuân thủ **Dependency Inversion Principle** (SOLID)

---

## 2. Tại sao cần DI?

| Lợi ích                | Giải thích                                                |
| ---------------------- | --------------------------------------------------------- |
| **Loose coupling**     | Class không biết implementation cụ thể                    |
| **Testability**        | Inject mock để test (như JUnit + Mockito)                 |
| **Flexibility**        | Đổi implementation không cần sửa class chính              |
| **Reusability**        | Class có thể tái sử dụng với dependency khác              |
| **Single Responsibility** | Class chỉ tập trung logic, không lo tạo dependency     |

---

## 3. Các loại DI

### 3.1. Constructor Injection (khuyến nghị)

```java
public class OrderService {
    private final PaymentService payment;

    public OrderService(PaymentService payment) {
        this.payment = payment;
    }
}
```

**Ưu điểm:**

- Đảm bảo dependency không null
- Hỗ trợ `final` -- bất biến (immutable)
- Dễ test

### 3.2. Setter Injection

```java
public class OrderService {
    private PaymentService payment;

    public void setPaymentService(PaymentService payment) {
        this.payment = payment;
    }
}
```

**Khi nào dùng:** Dependency optional hoặc cần thay đổi runtime.

### 3.3. Field Injection (KHÔNG khuyến khích)

```java
public class OrderService {
    @Autowired
    private PaymentService payment;
}
```

**Vấn đề:**

- Khó test (phải dùng Reflection)
- Không dùng được `final`
- Ẩn dependency -- người đọc không biết class cần gì

---

## 4. DI thủ công

Bạn có thể tự làm DI mà không cần framework.

```java
// Interface
public interface PaymentService {
    void charge(double amount);
}

// Implementation
public class StripePayment implements PaymentService {
    @Override
    public void charge(double amount) {
        System.out.println("Stripe charged: " + amount);
    }
}

public class PayPalPayment implements PaymentService {
    @Override
    public void charge(double amount) {
        System.out.println("PayPal charged: " + amount);
    }
}

// Class can dependency
public class OrderService {
    private final PaymentService payment;

    public OrderService(PaymentService payment) {
        this.payment = payment;
    }

    public void checkout(double amount) {
        payment.charge(amount);
    }
}

// Composition Root -- noi day moi thu lai
public class Main {
    public static void main(String[] args) {
        PaymentService payment = new StripePayment(); // Co the doi sang PayPal
        OrderService order = new OrderService(payment);
        order.checkout(100);
    }
}
```

---

## 5. DI với Spring Framework

Spring là framework DI phổ biến nhất trong Java.

### 5.1. Khai báo Bean

```java
import org.springframework.stereotype.Service;

@Service
public class StripePayment implements PaymentService {
    public void charge(double amount) {
        System.out.println("Stripe: " + amount);
    }
}

@Service
public class OrderService {
    private final PaymentService payment;

    // Constructor injection -- Spring tu dong inject
    public OrderService(PaymentService payment) {
        this.payment = payment;
    }

    public void checkout(double amount) {
        payment.charge(amount);
    }
}
```

### 5.2. Stereotype Annotations

| Annotation        | Vai trò                                        |
| ----------------- | ---------------------------------------------- |
| `@Component`      | Class chung -- Spring quản lý                  |
| `@Service`        | Tầng business logic                            |
| `@Repository`     | Tầng data access                               |
| `@Controller`     | Tầng web (MVC)                                 |
| `@RestController` | REST API (= `@Controller` + `@ResponseBody`)   |

### 5.3. `@Autowired`

```java
public class OrderService {
    // 1. Constructor (khuyen khich) -- @Autowired tu chon neu chi 1 constructor
    public OrderService(PaymentService payment) { ... }

    // 2. Setter
    @Autowired
    public void setPayment(PaymentService payment) { ... }

    // 3. Field (khong nen)
    @Autowired
    private PaymentService payment;
}
```

### 5.4. Nhiều implementation -- `@Qualifier`

```java
@Service("stripe")
public class StripePayment implements PaymentService { ... }

@Service("paypal")
public class PayPalPayment implements PaymentService { ... }

@Service
public class OrderService {
    public OrderService(@Qualifier("stripe") PaymentService payment) {
        this.payment = payment;
    }
}
```

### 5.5. Bean Configuration với `@Bean`

```java
@Configuration
public class AppConfig {

    @Bean
    public PaymentService paymentService() {
        return new StripePayment();
    }

    @Bean
    public OrderService orderService(PaymentService payment) {
        return new OrderService(payment);
    }
}
```

---

## 6. DI với Guice

Google Guice là framework DI nhẹ thay thế Spring.

```java
import com.google.inject.*;

public class PaymentModule extends AbstractModule {
    @Override
    protected void configure() {
        bind(PaymentService.class).to(StripePayment.class);
    }
}

public class Main {
    public static void main(String[] args) {
        Injector injector = Guice.createInjector(new PaymentModule());
        OrderService service = injector.getInstance(OrderService.class);
        service.checkout(100);
    }
}
```

---

## Khi nào dùng?

- **Dùng DI khi:**
  - Class có dependency tới class/interface khác
  - Cần test bằng mock
  - Code base lớn, muốn quản lý lifecycle object
- **Chọn framework:**
  - **Spring:** Project enterprise, web, microservice
  - **Guice:** Project nhỏ, cần DI nhẹ
  - **Dagger:** Android (compile-time, không reflection)
  - **Manual DI:** Project rất nhỏ, học thuật
- **Best practice:**
  - Ưu tiên **Constructor Injection**
  - Inject **interface**, không inject implementation
  - Tránh **circular dependency**
  - Mỗi class chỉ phụ thuộc 3-5 thứ -- nhiều hơn là vi phạm SRP

---

## Lỗi thường gặp

### Lỗi 1: Field Injection trong code production

```java
// SAI -- kho test, kho biet dependency
@Service
public class OrderService {
    @Autowired
    private PaymentService payment;
}

// DUNG -- constructor
@Service
public class OrderService {
    private final PaymentService payment;

    public OrderService(PaymentService payment) {
        this.payment = payment;
    }
}
```

### Lỗi 2: Circular Dependency

```java
// SAI -- A can B, B can A
class A { A(B b) {} }
class B { B(A a) {} }
// Spring se nem BeanCurrentlyInCreationException

// DUNG -- refactor de bo vong tron, hoac dung @Lazy
```

### Lỗi 3: Inject implementation thay vì interface

```java
// SAI
public OrderService(StripePayment payment) { ... }

// DUNG
public OrderService(PaymentService payment) { ... }
```

### Lỗi 4: Quá nhiều dependency

```java
// SAI -- 10 dependency = vi pham SRP
public OrderService(A a, B b, C c, D d, E e, F f, G g, H h, I i, J j) { ... }

// DUNG -- chia nho class, group dependency
```

---

## Câu hỏi phỏng vấn

### Câu 1: DI và IoC khác nhau thế nào?

**Trả lời:** **IoC (Inversion of Control)** là khái niệm rộng -- "đảo ngược quyền điều khiển", framework gọi code của bạn (Hollywood Principle: "Don't call us, we'll call you"). **DI (Dependency Injection)** là **một cách triển khai cụ thể** của IoC -- inject dependency thay vì class tự tạo.

### Câu 2: 3 loại DI và nên dùng loại nào?

**Trả lời:**

- **Constructor Injection** -- khuyến nghị, đảm bảo dependency không null, hỗ trợ `final`
- **Setter Injection** -- cho dependency optional
- **Field Injection** -- ngắn nhưng không nên dùng (khó test, không `final`)

### Câu 3: `@Autowired` hoạt động thế nào?

**Trả lời:** Spring scan các class có annotation (`@Component`, `@Service`...) và lưu vào ApplicationContext. Khi gặp `@Autowired`, Spring dùng Reflection để inject instance phù hợp -- thường theo type, nếu nhiều thì theo `@Qualifier` hoặc `@Primary`.

### Câu 4: Circular Dependency là gì? Cách xử lý?

**Trả lời:** Khi A phụ thuộc B, B lại phụ thuộc A -- Spring không thể quyết định tạo cái nào trước. Cách xử lý:

1. **Refactor** -- tách logic chung ra class C để cả A và B dùng
2. **Setter Injection** -- inject sau khi tạo object
3. **`@Lazy`** -- inject proxy, tạo lúc cần
4. **`@PostConstruct`** -- inject thủ công sau khi context init

### Câu 5: Tại sao nên inject interface?

**Trả lời:**

- **Loose coupling** -- không phụ thuộc implementation cụ thể
- **Dễ test** -- inject mock của interface
- **Dễ thay đổi** -- swap implementation không cần sửa code
- Tuân thủ **Dependency Inversion Principle** (SOLID)
