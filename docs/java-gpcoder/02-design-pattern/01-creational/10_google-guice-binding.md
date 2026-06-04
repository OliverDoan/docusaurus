---
sidebar_position: 10
title: "Google Guice - Binding"
---

# Giới thiệu Google Guice - Binding

## Binding là gì?

**Binding** (ràng buộc / ánh xạ) trong Guice là việc khai báo quy tắc: "Khi cần kiểu X, hãy cung cấp Y". Binding được định nghĩa trong lớp **Module** (kế thừa `AbstractModule`) và là trái tim của hệ thống DI trong Guice.

## Các loại Binding

### 1. Linked Binding — ánh xạ interface sang lớp cụ thể

Đây là dạng phổ biến nhất:

```java
public class AppModule extends AbstractModule {
    @Override
    protected void configure() {
        // Interface -> Implementation
        bind(PaymentService.class).to(StripePaymentService.class);
        bind(UserRepository.class).to(JpaUserRepository.class);
        bind(CacheService.class).to(RedisCacheService.class);
    }
}
```

### 2. Instance Binding — ánh xạ sang một instance cụ thể

Dùng khi muốn cung cấp một object đã được tạo sẵn (giá trị config, object đặc biệt):

```java
public class DatabaseModule extends AbstractModule {
    @Override
    protected void configure() {
        // Binding đến instance cụ thể (luôn là Singleton ngầm định)
        bind(String.class)
            .annotatedWith(Names.named("dbUrl"))
            .toInstance("jdbc:postgresql://localhost:5432/mydb");

        bind(Integer.class)
            .annotatedWith(Names.named("maxConnections"))
            .toInstance(20);

        // Binding đến object phức tạp
        DataSourceConfig config = new DataSourceConfig("localhost", 5432, "mydb");
        bind(DataSourceConfig.class).toInstance(config);
    }
}

// Sử dụng trong class nhận injection
public class UserRepository {
    private final String dbUrl;
    private final int maxConnections;

    @Inject
    public UserRepository(
            @Named("dbUrl") String dbUrl,
            @Named("maxConnections") int maxConnections) {
        this.dbUrl = dbUrl;
        this.maxConnections = maxConnections;
        System.out.println("Kết nối đến: " + dbUrl + " (max: " + maxConnections + ")");
    }
}
```

### 3. Provider Binding — dùng Provider để kiểm soát cách tạo object

Khi logic tạo object phức tạp, cần dùng `Provider`:

```java
import com.google.inject.Provider;

// Provider cho DatabaseConnection
public class DatabaseConnectionProvider implements Provider`<DatabaseConnection>` {
    private final String url;
    private final String username;
    private final String password;

    @Inject
    public DatabaseConnectionProvider(
            @Named("dbUrl") String url,
            @Named("dbUsername") String username,
            @Named("dbPassword") String password) {
        this.url = url;
        this.username = username;
        this.password = password;
    }

    @Override
    public DatabaseConnection get() {
        System.out.println("Tạo kết nối mới đến: " + url);
        return new DatabaseConnection(url, username, password);
    }
}

// Đăng ký Provider trong Module
public class DatabaseModule extends AbstractModule {
    @Override
    protected void configure() {
        bind(DatabaseConnection.class).toProvider(DatabaseConnectionProvider.class);
    }
}
```

### 4. @Provides Method — cách ngắn gọn hơn Provider class

```java
public class ServiceModule extends AbstractModule {

    // @Provides thay thế toàn bộ Provider class
    @Provides
    public EmailService provideEmailService() {
        SmtpConfig config = new SmtpConfig("smtp.gmail.com", 587, true);
        return new SmtpEmailService(config);
    }

    // @Provides với @Singleton
    @Provides
    @Singleton
    public HttpClient provideHttpClient() {
        return HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    // @Provides nhận inject từ Guice
    @Provides
    public OrderService provideOrderService(
            OrderRepository repo,
            NotificationService notification,
            @Named("maxRetries") int maxRetries) {
        return new OrderService(repo, notification, maxRetries);
    }

    @Override
    protected void configure() {
        bind(OrderRepository.class).to(JpaOrderRepository.class);
        bind(NotificationService.class).to(EmailNotificationService.class);
        bindConstant().annotatedWith(Names.named("maxRetries")).to(3);
    }
}
```

### 5. Binding Annotation — phân biệt nhiều implementation của cùng một interface

```java
import com.google.inject.BindingAnnotation;
import java.lang.annotation.*;

// Tạo custom annotation để phân biệt
@BindingAnnotation
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Primary {}

@BindingAnnotation
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Fallback {}

// Đăng ký nhiều binding cho cùng interface
public class NotificationModule extends AbstractModule {
    @Override
    protected void configure() {
        bind(NotificationService.class)
            .annotatedWith(Primary.class)
            .to(EmailNotificationService.class);

        bind(NotificationService.class)
            .annotatedWith(Fallback.class)
            .to(SmsNotificationService.class);
    }
}

// Sử dụng annotation để chọn đúng implementation
public class OrderProcessor {
    private final NotificationService primaryNotifier;
    private final NotificationService fallbackNotifier;

    @Inject
    public OrderProcessor(
            @Primary NotificationService primaryNotifier,
            @Fallback NotificationService fallbackNotifier) {
        this.primaryNotifier  = primaryNotifier;
        this.fallbackNotifier = fallbackNotifier;
    }

    public void notifyCustomer(String email, String message) {
        try {
            primaryNotifier.send(email, message);
        } catch (Exception e) {
            System.out.println("Kênh chính thất bại, dùng kênh dự phòng...");
            fallbackNotifier.send(email, message);
        }
    }
}
```

### 6. Constant Binding — binding giá trị nguyên thủy

```java
public class ConfigModule extends AbstractModule {
    @Override
    protected void configure() {
        // Dùng bindConstant() cho các kiểu nguyên thủy và String
        bindConstant().annotatedWith(Names.named("appName")).to("MyShop");
        bindConstant().annotatedWith(Names.named("port")).to(8080);
        bindConstant().annotatedWith(Names.named("debugMode")).to(false);
        bindConstant().annotatedWith(Names.named("maxPageSize")).to(100);
    }
}
```

## Kết hợp nhiều Module

```java
public class Main {
    public static void main(String[] args) {
        Injector injector = Guice.createInjector(
            new AppModule(),
            new DatabaseModule(),
            new ServiceModule(),
            new NotificationModule(),
            new ConfigModule()
        );

        OrderProcessor processor = injector.getInstance(OrderProcessor.class);
        processor.notifyCustomer("customer@example.com", "Đơn hàng đã xử lý thành công!");
    }
}
```

## Tóm tắt các loại Binding

| Loại | Cú pháp | Dùng khi |
|---|---|---|
| Linked | `bind(X).to(Y.class)` | Interface → Implementation cơ bản |
| Instance | `bind(X).toInstance(obj)` | Giá trị config, singleton đặc biệt |
| Provider class | `bind(X).toProvider(P.class)` | Logic tạo phức tạp, tái sử dụng |
| `@Provides` method | `@Provides T provide(...)` | Logic tạo gọn, ít dùng lại |
| Constant | `bindConstant().annotatedWith(...).to(v)` | String, int, boolean từ config |
| Annotated | `bind(X).annotatedWith(Ann.class).to(Y)` | Nhiều implementation cùng interface |
