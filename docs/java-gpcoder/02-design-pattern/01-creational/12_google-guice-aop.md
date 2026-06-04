---
sidebar_position: 12
title: "Google Guice - AOP"
---

# Giới thiệu Google Guice - Aspect Oriented Programming (AOP)

## AOP là gì?

**AOP — Aspect Oriented Programming** (lập trình hướng khía cạnh) là một mô hình lập trình cho phép tách biệt các **cross-cutting concerns** (mối quan tâm xuyên suốt — những logic lặp lại ở nhiều nơi như logging, bảo mật, transaction, cache) ra khỏi logic nghiệp vụ chính.

Thay vì viết code logging/transaction ở mọi method, AOP cho phép định nghĩa một lần và áp dụng tự động.

### Vấn đề không dùng AOP

```java
// KHÔNG TỐT: Logic phụ trợ lặp lại ở khắp nơi
public class OrderService {
    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    public Order createOrder(String customerId, String product) {
        log.info("Bắt đầu createOrder: customerId={}", customerId); // Lặp lại
        long start = System.currentTimeMillis();                     // Lặp lại
        try {
            // Logic nghiệp vụ thực sự
            Order order = new Order(customerId, product);
            repository.save(order);
            return order;
        } finally {
            log.info("createOrder hoàn thành: {}ms",               // Lặp lại
                System.currentTimeMillis() - start);
        }
    }

    public void cancelOrder(String orderId) {
        log.info("Bắt đầu cancelOrder: orderId={}", orderId);       // Lặp lại
        long start = System.currentTimeMillis();                     // Lặp lại
        // ... logic ...
        log.info("cancelOrder hoàn thành: {}ms",                    // Lặp lại
            System.currentTimeMillis() - start);
    }
}
```

## Guice AOP — Cơ chế hoạt động

Guice AOP sử dụng **MethodInterceptor** (bộ chặn phương thức) — một object được chèn vào trước/sau khi method được gọi. Guice tạo ra một **proxy** (đối tượng bọc) xung quanh đối tượng thật để kích hoạt interceptor.

**Yêu cầu:** Chỉ hoạt động với các class được tạo bởi Guice (không phải `new`), và method phải là `public` hoặc `protected`, không phải `static` hay `final`.

## Ví dụ 1: Logging Interceptor

```java
import com.google.inject.*;
import com.google.inject.matcher.Matchers;
import org.aopalliance.intercept.MethodInterceptor;
import org.aopalliance.intercept.MethodInvocation;
import java.lang.annotation.*;

// Bước 1: Tạo annotation đánh dấu method cần logging
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Loggable {}

// Bước 2: Implement MethodInterceptor
public class LoggingInterceptor implements MethodInterceptor {

    @Override
    public Object invoke(MethodInvocation invocation) throws Throwable {
        String methodName = invocation.getMethod().getName();
        String className  = invocation.getThis().getClass().getSimpleName();
        Object[] args     = invocation.getArguments();

        System.out.printf("[LOG] Bắt đầu %s.%s() với args: %s%n",
            className, methodName, java.util.Arrays.toString(args));

        long startTime = System.currentTimeMillis();

        try {
            Object result = invocation.proceed(); // Gọi method thực sự

            long elapsed = System.currentTimeMillis() - startTime;
            System.out.printf("[LOG] Hoàn thành %s.%s() trong %dms — kết quả: %s%n",
                className, methodName, elapsed, result);

            return result;
        } catch (Throwable ex) {
            System.out.printf("[LOG] Lỗi trong %s.%s(): %s%n",
                className, methodName, ex.getMessage());
            throw ex;
        }
    }
}

// Bước 3: Service sử dụng annotation
public class ProductService {

    @Loggable
    public String getProductName(int productId) {
        // Logic nghiệp vụ thuần túy — không có logging code
        return "Laptop Dell XPS " + productId;
    }

    @Loggable
    public void updateStock(int productId, int quantity) {
        System.out.printf("Cập nhật tồn kho: sản phẩm #%d = %d%n", productId, quantity);
    }

    public void internalMethod() {
        System.out.println("Method này không bị interceptor chặn");
    }
}

// Bước 4: Đăng ký interceptor trong Module
public class AopModule extends AbstractModule {
    @Override
    protected void configure() {
        // bindInterceptor(matcher cho class, matcher cho method, interceptors...)
        bindInterceptor(
            Matchers.any(),                           // Áp dụng cho tất cả class
            Matchers.annotatedWith(Loggable.class),   // Chỉ method có @Loggable
            new LoggingInterceptor()
        );
    }
}

// Bước 5: Chạy và quan sát
public class Main {
    public static void main(String[] args) {
        Injector injector = Guice.createInjector(new AopModule(), new AbstractModule() {
            @Override protected void configure() {}
        });

        ProductService service = injector.getInstance(ProductService.class);

        service.getProductName(42);
        service.updateStock(42, 100);
        service.internalMethod(); // Không bị log
    }
}
// Kết quả:
// [LOG] Bắt đầu ProductService.getProductName() với args: [42]
// [LOG] Hoàn thành ProductService.getProductName() trong 1ms — kết quả: Laptop Dell XPS 42
// [LOG] Bắt đầu ProductService.updateStock() với args: [42, 100]
// Cập nhật tồn kho: sản phẩm #42 = 100
// [LOG] Hoàn thành ProductService.updateStock() trong 0ms — kết quả: null
// Method này không bị interceptor chặn
```

## Ví dụ 2: Retry Interceptor — tự động thử lại khi thất bại

```java
// Annotation với tham số — số lần thử lại tối đa
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Retryable {
    int maxAttempts() default 3;
    long delayMs() default 1000;
}

// Interceptor tự động retry
public class RetryInterceptor implements MethodInterceptor {

    @Override
    public Object invoke(MethodInvocation invocation) throws Throwable {
        Retryable retryable = invocation.getMethod().getAnnotation(Retryable.class);
        int maxAttempts = retryable.maxAttempts();
        long delayMs    = retryable.delayMs();

        Throwable lastException = null;

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return invocation.proceed();
            } catch (Exception e) {
                lastException = e;
                System.out.printf("[RETRY] Lần %d/%d thất bại: %s%n",
                    attempt, maxAttempts, e.getMessage());

                if (attempt < maxAttempts) {
                    Thread.sleep(delayMs);
                }
            }
        }

        System.out.println("[RETRY] Đã thử " + maxAttempts + " lần, từ bỏ.");
        throw lastException;
    }
}

// Sử dụng
public class ExternalApiClient {
    private int callCount = 0;

    @Retryable(maxAttempts = 3, delayMs = 500)
    public String fetchData(String endpoint) {
        callCount++;
        if (callCount < 3) {
            throw new RuntimeException("Kết nối thất bại (mô phỏng)");
        }
        return "Dữ liệu từ: " + endpoint;
    }
}
```

## Ví dụ 3: Authorization Interceptor — kiểm tra quyền truy cập

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface RequiresRole {
    String value(); // Ví dụ: "ADMIN", "MANAGER"
}

public class AuthorizationInterceptor implements MethodInterceptor {

    @Inject
    private SecurityContext securityContext; // Guice inject vào interceptor

    @Override
    public Object invoke(MethodInvocation invocation) throws Throwable {
        RequiresRole annotation = invocation.getMethod().getAnnotation(RequiresRole.class);
        String requiredRole = annotation.value();

        if (!securityContext.hasRole(requiredRole)) {
            throw new SecurityException(
                "Từ chối truy cập: cần quyền '" + requiredRole + "'"
            );
        }

        return invocation.proceed();
    }
}

// Service bảo vệ bằng annotation
public class AdminService {

    @RequiresRole("ADMIN")
    public void deleteUser(String userId) {
        System.out.println("Xóa người dùng: " + userId);
    }

    @RequiresRole("MANAGER")
    public void approveOrder(String orderId) {
        System.out.println("Duyệt đơn hàng: " + orderId);
    }
}
```

## Matcher — kiểm soát áp dụng interceptor

```java
public class AopModule extends AbstractModule {
    @Override
    protected void configure() {
        LoggingInterceptor logger = new LoggingInterceptor();
        RetryInterceptor retrier  = new RetryInterceptor();
        requestInjection(retrier); // Guice inject vào interceptor instance

        // Chỉ áp dụng cho class trong package service
        bindInterceptor(
            Matchers.inSubpackage("com.example.service"),
            Matchers.annotatedWith(Loggable.class),
            logger
        );

        // Áp dụng cho tất cả method có @Retryable
        bindInterceptor(
            Matchers.any(),
            Matchers.annotatedWith(Retryable.class),
            retrier
        );

        // Áp dụng cho tất cả class kế thừa BaseService
        bindInterceptor(
            Matchers.subclassesOf(BaseService.class),
            Matchers.any(),
            new PerformanceMonitorInterceptor()
        );
    }
}
```

## Tóm tắt AOP trong Guice

| Khái niệm | Giải thích |
|---|---|
| `MethodInterceptor` | Logic chạy trước/sau/thay thế method |
| `MethodInvocation` | Thông tin về method đang được gọi |
| `invocation.proceed()` | Gọi method thực sự (bắt buộc phải gọi trừ khi muốn block) |
| `bindInterceptor()` | Đăng ký interceptor với điều kiện áp dụng |
| `Matchers.any()` | Matcher khớp tất cả |
| `Matchers.annotatedWith()` | Matcher khớp annotation cụ thể |
| `Matchers.inSubpackage()` | Matcher khớp package |

## Khi nào nên dùng Guice AOP

- **Logging** tập trung — ghi log đầu vào/đầu ra của service method.
- **Transaction management** — mở/đóng transaction tự động.
- **Security/Authorization** — kiểm tra quyền trước khi thực thi.
- **Retry logic** — tự động thử lại khi gọi external service thất bại.
- **Performance monitoring** — đo thời gian thực thi tự động.
- **Caching** — tự động cache kết quả method.
