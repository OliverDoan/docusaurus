---
sidebar_position: 9
title: "9. Spring Boot Core"
---

# Spring Boot Core

> *Tổng hợp các câu hỏi phỏng vấn về Spring Boot — từ khái niệm nền tảng đến các cơ chế nâng cao như transaction management và externalized configuration.*

:::note[Ghi nhớ nhanh]

- ⭐ **`IoC` + `DI`** — Spring quản lý bean qua IoC Container, ưu tiên Constructor Injection (immutable, dễ test); dùng `@Qualifier`/`@Primary` khi có nhiều bean cùng type.
- **`@SpringBootApplication`** — gộp `@Configuration` + `@EnableAutoConfiguration` + `@ComponentScan`; Spring Boot theo "convention over configuration" với auto-configuration, embedded server và Starters.
- **Stereotype annotations** — `@Component`, `@Service`, `@Repository` (có exception translation sang `DataAccessException`), `@Controller`/`@RestController`; `@Bean` dùng cho class third-party trong lớp `@Configuration`.
- **Externalized config** — `application.yml`/`.properties` đọc theo thứ tự ưu tiên; ưu tiên `@ConfigurationProperties` hơn `@Value`; Actuator cung cấp endpoint giám sát như `/actuator/health`.
- ⭐ **`@Transactional`** — hoạt động qua AOP proxy, đảm bảo ACID; mặc định chỉ rollback với `RuntimeException` (dùng `rollbackFor`), không chạy trên method `private` hay gọi nội bộ.
- **`@Transactional(readOnly=true)`** — hint tắt dirty checking của Hibernate và cho phép route sang read replica; Spring Data JPA giảm boilerplate nhờ `JpaRepository` và query derivation.

:::

---

## Câu 1: Spring Boot là gì và có những ưu điểm gì? `[Basic]`

### Câu hỏi

> *"Bạn có thể giải thích Spring Boot là gì và tại sao nó lại phổ biến trong phát triển ứng dụng Java không?"*

### Giải thích lý thuyết

**Spring Boot** là một framework xây dựng trên nền tảng Spring Framework, được thiết kế để đơn giản hóa việc tạo ra các ứng dụng Spring có thể chạy độc lập (stand-alone). Thay vì phải cấu hình thủ công mọi thứ như trước, Spring Boot áp dụng nguyên tắc **"convention over configuration"** (quy ước thay vì cấu hình) — tức là nó tự đưa ra các giá trị mặc định hợp lý để lập trình viên chỉ cần tập trung vào logic nghiệp vụ.

**Các ưu điểm chính:**

| Tính năng | Mô tả |
|---|---|
| Auto-configuration | Tự động cấu hình các bean dựa trên classpath |
| Embedded server | Nhúng sẵn Tomcat/Jetty, không cần deploy WAR |
| Starters | Các dependency bundle sẵn sàng sử dụng |
| Actuator | Endpoints giám sát ứng dụng tích hợp sẵn |
| Opinionated defaults | Cấu hình mặc định hợp lý, giảm boilerplate |

### Code minh hoạ

```java
// Điểm khởi động của một ứng dụng Spring Boot
@SpringBootApplication  // Gộp @Configuration + @EnableAutoConfiguration + @ComponentScan
public class Application {
    public static void main(String[] args) {
        // Khởi chạy ứng dụng với embedded server
        SpringApplication.run(Application.class, args);
    }
}
```

### Đáp án mẫu

> "Spring Boot là framework giúp xây dựng ứng dụng Spring một cách nhanh chóng với cấu hình tối thiểu. Nó nổi bật nhờ auto-configuration tự động phát hiện thư viện trên classpath và cấu hình phù hợp, embedded server giúp đóng gói ứng dụng thành file JAR chạy được ngay, và hệ sinh thái Starters giúp quản lý dependency đơn giản. Nhờ đó, developer có thể khởi tạo và chạy một REST API chỉ trong vài phút thay vì phải cấu hình XML phức tạp như Spring truyền thống."

---

## Câu 2: Dependency Injection (DI) là gì? Spring cài đặt DI thế nào? `[Basic]`

### Câu hỏi

> *"Bạn hiểu Dependency Injection là gì? Spring Framework thực hiện DI như thế nào?"*

### Giải thích lý thuyết

**Dependency Injection (DI)** — Tiêm phụ thuộc — là một design pattern trong đó một đối tượng không tự tạo ra các phụ thuộc của mình mà nhận chúng từ bên ngoài. Đây là một trong những hiện thực của nguyên tắc **Inversion of Control (IoC)** — Đảo ngược quyền kiểm soát.

Spring thực hiện DI thông qua **IoC Container** (hay còn gọi là **Application Context**). Container này:
1. Quét và đăng ký các **Bean** (đối tượng được Spring quản lý)
2. Phân tích các phụ thuộc giữa các bean
3. Tự động tạo và tiêm các đối tượng cần thiết

**Ba hình thức DI trong Spring:**

| Loại | Mô tả | Khuyến nghị |
|---|---|---|
| Constructor Injection | Tiêm qua constructor | Ưu tiên (immutable, testable) |
| Setter Injection | Tiêm qua setter method | Dùng khi dependency tùy chọn |
| Field Injection | Dùng `@Autowired` trực tiếp trên field | Tránh (khó test) |

### Code minh hoạ

```java
// Cách được khuyến nghị: Constructor Injection
@Service
public class OrderService {

    // Khai báo dependency là final — đảm bảo tính bất biến (immutability)
    private final PaymentService paymentService;
    private final InventoryService inventoryService;

    // Spring tự động tiêm các bean vào constructor
    // Từ Spring 4.3+, không cần @Autowired nếu chỉ có 1 constructor
    public OrderService(PaymentService paymentService,
                        InventoryService inventoryService) {
        this.paymentService = paymentService;
        this.inventoryService = inventoryService;
    }

    public void processOrder(Order order) {
        inventoryService.reserve(order);
        paymentService.charge(order);
    }
}
```

### Đáp án mẫu

> "Dependency Injection là pattern mà thay vì một class tự tạo object phụ thuộc bằng `new`, nó nhận object đó từ bên ngoài — thường là từ một framework. Spring thực hiện DI thông qua IoC Container: container quét các class được đánh dấu annotation, đăng ký chúng thành bean, rồi tự động tiêm vào những nơi cần thiết. Tôi ưu tiên Constructor Injection vì giúp code dễ test hơn và đảm bảo tính immutability — khi đã khởi tạo xong thì dependency không thể bị thay đổi."

---

## Câu 3: `@Component`, `@Service`, `@Repository` và `@Controller` khác nhau thế nào? `[Intermediate]`

### Câu hỏi

> *"Trong Spring, có nhiều annotation để đánh dấu một class là bean. Bạn có thể phân biệt `@Component`, `@Service`, `@Repository`, và `@Controller` không?"*

### Giải thích lý thuyết

Tất cả bốn annotation này đều là **stereotype annotations** — chúng đều kế thừa từ `@Component` và đều khiến Spring đăng ký class đó như một bean trong IoC Container. Sự khác biệt nằm ở **ngữ nghĩa** (semantic) và **chức năng bổ sung**:

| Annotation | Layer | Chức năng bổ sung |
|---|---|---|
| `@Component` | Bất kỳ | Không có — là annotation gốc |
| `@Service` | Business Logic | Không có thêm kỹ thuật, nhưng thể hiện rõ tầng service |
| `@Repository` | Data Access | Tự động dịch exception JDBC/JPA thành `DataAccessException` |
| `@Controller` | Presentation (MVC) | Đánh dấu class xử lý HTTP request (trả về View) |
| `@RestController` | Presentation (REST) | Kết hợp `@Controller` + `@ResponseBody` |

`@Repository` có thêm cơ chế **exception translation** — Spring sẽ bắt các exception đặc thù của cơ sở dữ liệu (như `SQLException`) và chuyển chúng thành hierarchy exception của Spring (`DataAccessException`), giúp code ở tầng trên không phụ thuộc vào công nghệ database cụ thể.

### Code minh hoạ

```java
// Tầng Data Access — có exception translation
@Repository
public class UserRepository {
    // Spring tự động dịch SQLException -> DataAccessException
    public User findById(Long id) { /* ... */ return null; }
}

// Tầng Business Logic
@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getUser(Long id) {
        return userRepository.findById(id);
    }
}

// Tầng Presentation — trả về JSON cho REST API
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.getUser(id);
    }
}
```

### Đáp án mẫu

> "Về mặt kỹ thuật, cả bốn đều là alias của `@Component` và đều đăng ký bean vào Spring Container. Sự khác biệt quan trọng: `@Repository` có thêm tính năng exception translation — tự động chuyển đổi các database exception thành Spring `DataAccessException`. `@Service` và `@Component` giống nhau về kỹ thuật nhưng `@Service` thể hiện rõ ràng hơn rằng class đó thuộc tầng business logic. Còn `@Controller` và `@RestController` được Spring MVC nhận diện để xử lý HTTP request. Tôi luôn chọn đúng annotation phù hợp với layer để code dễ đọc và maintain hơn."

---

## Câu 4: `@Autowired` là gì và hoạt động thế nào? `[Basic]`

### Câu hỏi

> *"Annotation `@Autowired` trong Spring làm gì? Spring tìm bean để inject như thế nào khi có nhiều bean cùng type?"*

### Giải thích lý thuyết

`@Autowired` là annotation yêu cầu Spring **tự động tiêm (inject) một bean** vào field, constructor, hoặc setter method được đánh dấu. Spring thực hiện theo thứ tự ưu tiên:

1. **Tìm theo type** (type-based matching): Tìm bean có type khớp
2. **Tìm theo name** (name-based matching): Nếu có nhiều bean cùng type, Spring tìm theo tên biến
3. **`@Qualifier`**: Chỉ định rõ tên bean khi có nhiều bean cùng type
4. **`@Primary`**: Đánh dấu bean được ưu tiên khi có nhiều bean cùng type

Nếu không tìm được bean phù hợp, Spring ném `NoSuchBeanDefinitionException`. Nếu có nhiều bean cùng type mà không phân biệt được, Spring ném `NoUniqueBeanDefinitionException`.

### Code minh hoạu

```java
// Tình huống: có nhiều implementation của cùng một interface
public interface NotificationService {
    void send(String message);
}

@Service("emailNotification")
public class EmailNotificationService implements NotificationService {
    public void send(String message) { /* gửi email */ }
}

@Service("smsNotification")
public class SmsNotificationService implements NotificationService {
    public void send(String message) { /* gửi SMS */ }
}

// Cách 1: Dùng @Qualifier để chỉ định rõ bean nào
@Service
public class AlertService {

    private final NotificationService notificationService;

    public AlertService(@Qualifier("emailNotification") NotificationService notificationService) {
        this.notificationService = notificationService;
    }
}

// Cách 2: Đánh dấu @Primary cho bean mặc định
@Service
@Primary  // Bean này sẽ được ưu tiên khi không dùng @Qualifier
public class EmailNotificationService implements NotificationService {
    public void send(String message) { /* gửi email */ }
}
```

### Đáp án mẫu

> "`@Autowired` yêu cầu Spring tìm và tiêm bean phù hợp vào class của mình. Spring tìm trước theo type, nếu có nhiều bean cùng type thì tìm theo tên biến, và nếu vẫn không rõ thì cần dùng `@Qualifier` để chỉ định rõ hoặc `@Primary` để đánh dấu bean mặc định. Trong dự án hiện tại, tôi ưu tiên Constructor Injection thay vì `@Autowired` trực tiếp trên field vì giúp code dễ unit test hơn — khi test có thể truyền mock object qua constructor mà không cần Spring Context."

---

## Câu 5: `@Bean` và `@Component` khác nhau thế nào? `[Intermediate]`

### Câu hỏi

> *"Cả `@Bean` và `@Component` đều đăng ký bean vào Spring Container, vậy khi nào dùng cái nào?"*

### Giải thích lý thuyết

| Tiêu chí | `@Component` | `@Bean` |
|---|---|---|
| Đặt ở đâu | Trên class | Trên method trong class `@Configuration` |
| Kiểm soát source code | Phải là class của mình | Có thể là class của third-party library |
| Cách Spring tạo bean | Tự động qua component scan | Thủ công — code trong method là logic tạo bean |
| Tùy chỉnh khởi tạo | Hạn chế | Linh hoạt hoàn toàn |

**Khi nào dùng `@Bean`:**
- Đăng ký bean từ **thư viện bên thứ ba** (không thể sửa source code để thêm `@Component`)
- Cần **logic phức tạp** khi khởi tạo bean
- Cần tạo nhiều bean từ cùng một class với cấu hình khác nhau

### Code minh hoạ

```java
@Configuration
public class AppConfig {

    // Dùng @Bean để đăng ký ObjectMapper từ thư viện Jackson
    // (không thể thêm @Component vào class của Jackson)
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        // Tùy chỉnh: không ném exception khi gặp property không biết
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        // Tùy chỉnh: viết date dưới dạng timestamp
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }

    // Dùng @Bean để tạo DataSource với cấu hình tùy chỉnh
    @Bean
    public DataSource dataSource() {
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl("jdbc:postgresql://localhost:5432/mydb");
        ds.setMaximumPoolSize(10);
        return ds;
    }
}

// Ngược lại, dùng @Component cho class do mình viết
@Component
public class MyCustomValidator {
    public boolean validate(String input) { /* ... */ return true; }
}
```

### Đáp án mẫu

> "`@Component` dùng để đánh dấu class của mình là bean — Spring tự động phát hiện qua component scan. `@Bean` dùng trong class `@Configuration` để khai báo thủ công một bean, thường khi cần tích hợp thư viện bên thứ ba mà mình không thể sửa source code của nó, hoặc khi cần logic khởi tạo phức tạp. Ví dụ, để cấu hình `ObjectMapper` của Jackson với các tùy chỉnh riêng, tôi sẽ dùng `@Bean` trong một class `@Configuration`."

---

## Câu 6: application.properties và application.yml là gì? Externalized config hoạt động thế nào? `[Intermediate]`

### Câu hỏi

> *"Spring Boot đọc cấu hình từ đâu? Bạn có thể giải thích cơ chế externalized configuration không?"*

### Giải thích lý thuyết

**Externalized Configuration** — Cấu hình ngoại hóa — là cơ chế cho phép tách biệt cấu hình ra khỏi code, giúp cùng một ứng dụng chạy được ở nhiều môi trường khác nhau (dev, staging, production) mà không cần rebuild.

Spring Boot đọc cấu hình theo **thứ tự ưu tiên** từ cao đến thấp:
1. Command-line arguments
2. Biến môi trường (environment variables)
3. `application-{profile}.properties` hoặc `.yml`
4. `application.properties` hoặc `application.yml`
5. Default values trong code

**`@Value`** và **`@ConfigurationProperties`** là hai cách đọc giá trị cấu hình:
- `@Value("${key}")`: Đọc từng giá trị đơn lẻ
- `@ConfigurationProperties`: Ánh xạ (map) một nhóm property vào một class — được khuyến nghị hơn

### Code minh hoạ

```yaml
# application.yml — cấu hình chung
server:
  port: 8080

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/mydb
    username: postgres

# Cấu hình tùy chỉnh cho ứng dụng
app:
  payment:
    timeout-seconds: 30
    retry-count: 3
    gateway-url: https://payment.example.com
```

```java
// Cách được khuyến nghị: @ConfigurationProperties
// Ánh xạ toàn bộ nhóm "app.payment" vào class này
@ConfigurationProperties(prefix = "app.payment")
@Component
public class PaymentProperties {

    // Tên field phải khớp với key trong yml (camelCase <-> kebab-case)
    private int timeoutSeconds;
    private int retryCount;
    private String gatewayUrl;

    // Getters và setters (hoặc dùng Lombok @Data)
    public int getTimeoutSeconds() { return timeoutSeconds; }
    public void setTimeoutSeconds(int timeoutSeconds) {
        this.timeoutSeconds = timeoutSeconds;
    }
    public int getRetryCount() { return retryCount; }
    public void setRetryCount(int retryCount) { this.retryCount = retryCount; }
    public String getGatewayUrl() { return gatewayUrl; }
    public void setGatewayUrl(String gatewayUrl) { this.gatewayUrl = gatewayUrl; }
}

// Sử dụng trong service
@Service
public class PaymentService {

    private final PaymentProperties config;

    public PaymentService(PaymentProperties config) {
        this.config = config;
    }

    public void processPayment() {
        // Sử dụng cấu hình từ yml/properties
        String url = config.getGatewayUrl();
        int timeout = config.getTimeoutSeconds();
        // ...
    }
}
```

### Đáp án mẫu

> "Spring Boot hỗ trợ externalized configuration — đọc cấu hình từ nhiều nguồn theo thứ tự ưu tiên: environment variables, file `application.yml` hoặc `application.properties`, và cả command-line arguments. Điều này cho phép cùng một file JAR chạy ở dev với database local, còn production thì đọc cấu hình từ biến môi trường mà không cần rebuild. Tôi ưu tiên `@ConfigurationProperties` hơn `@Value` vì nó nhóm các property liên quan vào một class riêng, dễ quản lý và có thể validate bằng Bean Validation."

---

## Câu 7: Spring Boot Actuator dùng để làm gì? `[Intermediate]`

### Câu hỏi

> *"Spring Boot Actuator là gì? Bạn đã dùng nó để làm gì trong dự án thực tế?"*

### Giải thích lý thuyết

**Spring Boot Actuator** là module cung cấp các **production-ready endpoints** để giám sát và quản lý ứng dụng đang chạy mà không cần viết thêm code. Các endpoint được expose qua HTTP (hoặc JMX).

**Các endpoint thường dùng:**

| Endpoint | Mô tả |
|---|---|
| `/actuator/health` | Trạng thái sức khỏe của ứng dụng |
| `/actuator/info` | Thông tin ứng dụng (version, build) |
| `/actuator/metrics` | Các metric: memory, CPU, request count |
| `/actuator/env` | Xem các biến môi trường và properties |
| `/actuator/loggers` | Xem và thay đổi log level tại runtime |
| `/actuator/httptrace` | Lịch sử các HTTP request gần đây |
| `/actuator/beans` | Danh sách tất cả bean trong context |

**Lưu ý bảo mật:** Một số endpoint (như `/actuator/env`, `/actuator/beans`) chứa thông tin nhạy cảm — cần bảo vệ bằng Spring Security trong môi trường production.

### Code minh hoạ

```yaml
# application.yml — cấu hình Actuator
management:
  endpoints:
    web:
      exposure:
        # Chỉ expose các endpoint cần thiết, không expose tất cả (*) trong production
        include: health, info, metrics, loggers
  endpoint:
    health:
      # Hiển thị chi tiết trạng thái các component (db, cache,...)
      show-details: when-authorized
  info:
    env:
      enabled: true

# Thông tin hiển thị ở /actuator/info
info:
  app:
    name: My Application
    version: "@project.version@"
```

```java
// Tạo custom health indicator để kiểm tra dịch vụ bên ngoài
@Component
public class ExternalApiHealthIndicator implements HealthIndicator {

    private final ExternalApiClient apiClient;

    public ExternalApiHealthIndicator(ExternalApiClient apiClient) {
        this.apiClient = apiClient;
    }

    @Override
    public Health health() {
        try {
            // Kiểm tra kết nối đến API bên ngoài
            apiClient.ping();
            return Health.up()
                .withDetail("externalApi", "Accessible")
                .build();
        } catch (Exception e) {
            return Health.down()
                .withDetail("externalApi", "Unreachable")
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}
```

### Đáp án mẫu

> "Spring Boot Actuator cung cấp các endpoint sẵn có để giám sát ứng dụng trong production mà không cần viết thêm code. Endpoint `/actuator/health` thường được dùng làm healthcheck endpoint cho Kubernetes hay load balancer — nó tự động kiểm tra kết nối database, cache, và các dependency khác. Tôi cũng hay dùng `/actuator/metrics` kết hợp với Prometheus để thu thập metric và Grafana để hiển thị dashboard. Trong thực tế, tôi chỉ expose các endpoint cần thiết và bảo vệ bằng Spring Security để tránh lộ thông tin nhạy cảm."

---

## Câu 8: Spring Boot Starters là gì và tại sao hữu ích? `[Basic]`

### Câu hỏi

> *"Bạn có thể giải thích Spring Boot Starters là gì không? Tại sao chúng giúp đơn giản hóa việc quản lý dependency?"*

### Giải thích lý thuyết

**Spring Boot Starters** là các **dependency descriptor** — tức là các file POM tập hợp sẵn một nhóm dependency liên quan đến một tính năng cụ thể. Thay vì phải tìm và thêm từng thư viện con một (cùng với đúng version tương thích), developer chỉ cần thêm một starter duy nhất.

**Ví dụ:** Để xây dựng REST API, trước đây phải thêm riêng: Spring MVC, Jackson (JSON), Tomcat, và phải tự đảm bảo các version tương thích. Với `spring-boot-starter-web`, tất cả được xử lý tự động.

**Một số starters phổ biến:**

| Starter | Mục đích |
|---|---|
| `spring-boot-starter-web` | REST API với Spring MVC và Tomcat |
| `spring-boot-starter-data-jpa` | ORM với Hibernate và Spring Data JPA |
| `spring-boot-starter-security` | Authentication và Authorization |
| `spring-boot-starter-test` | Testing với JUnit 5, Mockito, AssertJ |
| `spring-boot-starter-actuator` | Giám sát và monitoring |
| `spring-boot-starter-validation` | Bean Validation với Hibernate Validator |

### Code minh hoạu

```xml
<!-- pom.xml — Chỉ cần 1 dòng thay vì 5-6 dependency riêng lẻ -->
<dependencies>
    <!-- Thay vì phải thêm: spring-webmvc, jackson-databind,
         tomcat-embed-core, spring-web, spring-context... -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <!-- Không cần khai báo version — parent POM quản lý -->
    </dependency>

    <!-- JPA + Hibernate + Spring Data, đúng version tương thích -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>

    <!-- Testing: JUnit 5 + Mockito + AssertJ + Spring Test -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### Đáp án mẫu

> "Spring Boot Starters là các bundle dependency được đóng gói sẵn cho từng tính năng. Thay vì phải tìm hiểu mình cần thêm những thư viện con nào và version nào tương thích với nhau, tôi chỉ cần thêm một starter duy nhất. Ví dụ, `spring-boot-starter-web` tự động kéo theo Spring MVC, Jackson để serialize JSON, và Tomcat embedded. Spring Boot parent POM còn quản lý version của tất cả dependency, đảm bảo chúng tương thích với nhau — tránh được các lỗi version conflict phức tạp."

---

## Câu 9: Embedded server trong Spring Boot là gì và tại sao hữu ích? `[Basic]`

### Câu hỏi

> *"Spring Boot có khái niệm embedded server. Bạn có thể giải thích điều này có nghĩa là gì và tại sao nó lại là một lợi thế lớn không?"*

### Giải thích lý thuyết

**Embedded server** — Máy chủ nhúng — có nghĩa là web server (như Tomcat, Jetty, hoặc Undertow) được đóng gói **bên trong** ứng dụng thay vì cần cài đặt riêng và deploy ứng dụng vào đó.

**Trước khi có Spring Boot (cách truyền thống):**
1. Cài đặt Tomcat trên server
2. Cấu hình Tomcat (port, thread pool,...)
3. Build ứng dụng thành file `.war`
4. Copy file `.war` vào thư mục `webapps/` của Tomcat
5. Khởi động Tomcat

**Với Spring Boot embedded server:**
1. Build thành file `.jar`
2. Chạy `java -jar myapp.jar`

**Lợi ích:**

| Lợi ích | Giải thích |
|---|---|
| Triển khai đơn giản | Chỉ cần 1 file JAR, không phụ thuộc môi trường |
| Phù hợp Microservices | Mỗi service tự chứa server của mình |
| Phù hợp Container | Dễ đóng gói vào Docker image |
| Cấu hình trong code | Cấu hình server qua `application.yml` |

### Code minh hoạu

```yaml
# application.yml — cấu hình Tomcat embedded
server:
  port: 8080
  servlet:
    context-path: /api  # Tất cả endpoint có prefix /api
  tomcat:
    # Số luồng tối đa xử lý request đồng thời
    max-threads: 200
    # Số kết nối tối đa chờ trong hàng đợi
    accept-count: 100
    connection-timeout: 30000
```

```java
// Tùy chỉnh Tomcat embedded bằng code nếu cần
@Configuration
public class ServerConfig {

    @Bean
    public TomcatServletWebServerFactory tomcatFactory() {
        TomcatServletWebServerFactory factory = new TomcatServletWebServerFactory();
        // Thêm connector để lắng nghe thêm port HTTP
        factory.addAdditionalTomcatConnectors(createHttpConnector());
        return factory;
    }

    private Connector createHttpConnector() {
        Connector connector = new Connector(TomcatServletWebServerFactory.DEFAULT_PROTOCOL);
        connector.setPort(8090);  // Port phụ
        return connector;
    }
}
```

### Đáp án mẫu

> "Embedded server có nghĩa là Tomcat (hoặc Jetty, Undertow) được đóng gói ngay bên trong file JAR của ứng dụng. Điều này thay đổi hoàn toàn cách triển khai: thay vì phải cài Tomcat trên server, copy file WAR vào, và quản lý vòng đời của server riêng, giờ chỉ cần `java -jar myapp.jar` là xong. Điều này đặc biệt phù hợp với kiến trúc microservices và container hóa bằng Docker — mỗi service là một Docker image tự chứa hoàn chỉnh, không phụ thuộc vào cơ sở hạ tầng bên ngoài."

---

## Câu 10: Spring Data JPA và `@Repository` là gì? `[Intermediate]`

### Câu hỏi

> *"Bạn có thể giải thích Spring Data JPA là gì không? Nó giúp đơn giản hóa việc làm việc với database như thế nào?"*

### Giải thích lý thuyết

**JPA (Java Persistence API)** là một specification (đặc tả) của Java định nghĩa cách ánh xạ object Java sang bảng trong database quan hệ. **Hibernate** là implementation phổ biến nhất của JPA.

**Spring Data JPA** là một layer nằm trên JPA, giúp giảm thiểu tối đa boilerplate code khi làm việc với database. Cốt lõi của nó là interface `JpaRepository` — chỉ cần khai báo interface, Spring tự động tạo implementation đầy đủ tại runtime.

**Các tính năng chính của Spring Data JPA:**
- **CRUD sẵn có**: `save()`, `findById()`, `findAll()`, `delete()`... không cần viết code
- **Query derivation**: Tự sinh query SQL từ tên method
- **`@Query`**: Viết JPQL hoặc native SQL tùy chỉnh
- **Pagination**: Hỗ trợ phân trang với `Pageable`

### Code minh hoạ

```java
// Entity — ánh xạ class Java sang bảng "users" trong database
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    // Constructors, getters, setters...
}

// Repository — chỉ khai báo interface, Spring tự tạo implementation
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Spring tự sinh SQL: SELECT * FROM users WHERE email = ?
    Optional<User> findByEmail(String email);

    // Spring tự sinh SQL: SELECT * FROM users WHERE name LIKE ? AND active = ?
    List<User> findByNameContainingAndActiveTrue(String name);

    // Tùy chỉnh query bằng JPQL (Java Persistence Query Language)
    @Query("SELECT u FROM User u WHERE u.createdAt > :date ORDER BY u.name")
    List<User> findRecentUsers(@Param("date") LocalDateTime date);

    // Native SQL khi cần query phức tạp đặc thù của database
    @Query(value = "SELECT * FROM users WHERE LOWER(email) LIKE LOWER(:pattern)",
           nativeQuery = true)
    List<User> searchByEmailPattern(@Param("pattern") String pattern);

    // Phân trang: trả về Page<User> thay vì List<User>
    Page<User> findByActiveTrue(Pageable pageable);
}
```

```java
// Sử dụng repository trong service
@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Page<User> getActiveUsers(int page, int size) {
        // Pageable: trang số `page`, mỗi trang `size` bản ghi, sắp xếp theo name
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        return userRepository.findByActiveTrue(pageable);
    }
}
```

### Đáp án mẫu

> "Spring Data JPA là một abstraction layer nằm trên JPA/Hibernate, giúp giảm thiểu boilerplate code đáng kể. Thay vì phải viết toàn bộ CRUD operations thủ công, tôi chỉ cần khai báo interface extend từ `JpaRepository`, và Spring tự động tạo implementation tại runtime. Đặc biệt hữu ích là tính năng query derivation — đặt tên method theo quy tắc như `findByEmailAndActiveTrue()` là Spring tự hiểu và sinh SQL tương ứng. Với các query phức tạp hơn, tôi dùng annotation `@Query` để viết JPQL hoặc native SQL."

---

## Câu 11: Spring transaction management và `@Transactional` là gì? `[Intermediate]`

### Câu hỏi

> *"Bạn có thể giải thích transaction management trong Spring là gì không? `@Transactional` hoạt động như thế nào?"*

### Giải thích lý thuyết

**Transaction** (giao dịch) là một đơn vị công việc phải được thực hiện hoàn toàn (tất cả thành công) hoặc không có gì (nếu có lỗi thì rollback tất cả). Transaction đảm bảo tính **ACID**:
- **Atomicity** (Nguyên tử): Tất cả hoặc không có gì
- **Consistency** (Nhất quán): Database luôn ở trạng thái hợp lệ
- **Isolation** (Cô lập): Các transaction không ảnh hưởng lẫn nhau
- **Durability** (Bền vững): Kết quả được lưu vĩnh viễn sau khi commit

`@Transactional` hoạt động thông qua **AOP (Aspect-Oriented Programming)** — Spring tạo ra một proxy bao bọc method được đánh dấu. Khi method được gọi:
1. Proxy mở transaction
2. Thực thi method gốc
3. Nếu thành công: commit transaction
4. Nếu có RuntimeException: rollback transaction

**Lưu ý quan trọng về `@Transactional`:**
- Chỉ hoạt động khi được gọi từ **bên ngoài** class (vì cơ chế proxy)
- Mặc định chỉ rollback với `RuntimeException`, không rollback với `checked Exception`
- Không hoạt động trên `private` method

### Code minh hoạu

```java
@Service
public class BankingService {

    private final AccountRepository accountRepository;
    private final TransactionLogRepository logRepository;

    public BankingService(AccountRepository accountRepository,
                          TransactionLogRepository logRepository) {
        this.accountRepository = accountRepository;
        this.logRepository = logRepository;
    }

    // Toàn bộ method này chạy trong 1 transaction
    // Nếu bất kỳ bước nào thất bại, tất cả sẽ được rollback
    @Transactional
    public void transfer(Long fromAccountId, Long toAccountId, BigDecimal amount) {
        Account from = accountRepository.findById(fromAccountId)
            .orElseThrow(() -> new AccountNotFoundException("Tài khoản nguồn không tồn tại"));

        Account to = accountRepository.findById(toAccountId)
            .orElseThrow(() -> new AccountNotFoundException("Tài khoản đích không tồn tại"));

        // Kiểm tra số dư
        if (from.getBalance().compareTo(amount) < 0) {
            throw new InsufficientFundsException("Số dư không đủ");
        }

        // Bước 1: Trừ tiền tài khoản nguồn
        from.setBalance(from.getBalance().subtract(amount));
        accountRepository.save(from);

        // Bước 2: Cộng tiền tài khoản đích
        to.setBalance(to.getBalance().add(amount));
        accountRepository.save(to);

        // Bước 3: Ghi log giao dịch
        // Nếu bước này lỗi -> cả 3 bước đều bị rollback
        logRepository.save(new TransactionLog(fromAccountId, toAccountId, amount));
    }

    // Rollback cho cả checked exception (mặc định không rollback)
    @Transactional(rollbackFor = Exception.class)
    public void riskyOperation() throws IOException {
        // Thao tác database...
        // Nếu ném IOException, transaction vẫn được rollback
    }

    // Propagation: REQUIRES_NEW — luôn tạo transaction mới, độc lập với transaction cha
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveAuditLog(String action) {
        // Log này sẽ được commit ngay cả khi transaction cha rollback
    }
}
```

### Đáp án mẫu

> "`@Transactional` là cách Spring quản lý transaction thông qua AOP. Khi đánh dấu một method với annotation này, Spring tạo proxy tự động mở transaction trước khi method chạy và commit sau khi thành công, hoặc rollback nếu có RuntimeException. Điều này giúp đảm bảo tính nhất quán dữ liệu — ví dụ trong nghiệp vụ chuyển tiền, nếu bước trừ tiền thành công nhưng bước cộng tiền thất bại, cả hai bước đều phải được rollback. Tôi cũng cần nhớ rằng `@Transactional` chỉ hoạt động khi method được gọi từ bên ngoài class vì cơ chế proxy của Spring."

---

## Câu 12: `@Transactional(readOnly=true)` có tác dụng gì? `[Advanced]`

### Câu hỏi

> *"Bạn có biết attribute `readOnly=true` trong `@Transactional` có tác dụng gì không? Khi nào nên dùng và nó mang lại lợi ích gì về hiệu năng?"*

### Giải thích lý thuyết

`@Transactional(readOnly = true)` là một gợi ý (hint) cho Spring và database rằng transaction này **chỉ đọc dữ liệu, không ghi**. Điều này mang lại một số tối ưu hóa quan trọng:

**Tác dụng với Hibernate:**
- **Tắt dirty checking** (kiểm tra thay đổi): Hibernate thông thường theo dõi mọi thay đổi trên entity để tự động flush khi kết thúc transaction. Với `readOnly=true`, cơ chế này bị tắt, tiết kiệm CPU và memory.
- **Không tạo snapshot** của entity: Hibernate không cần lưu trạng thái ban đầu để so sánh, giảm memory usage.
- Hibernate có thể bỏ qua bước flush session

**Tác dụng với Database:**
- Một số database driver (như PostgreSQL) có thể tối ưu hóa câu query khi biết đây là read-only transaction
- Cho phép routing đến **read replica** nếu có cấu hình database routing

**Lưu ý quan trọng:** `readOnly=true` **không ngăn** code thực sự ghi vào database — nó chỉ là hint. Nếu code trong method cố gắng ghi dữ liệu, hành vi phụ thuộc vào database và driver.

### Code minh hoạu

```java
@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // Đánh dấu readOnly=true cho tất cả method đọc dữ liệu
    // Hibernate tắt dirty checking -> nhanh hơn, ít memory hơn
    @Transactional(readOnly = true)
    public ProductDto getProduct(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ProductNotFoundException("Không tìm thấy sản phẩm"));
        // Hibernate KHÔNG theo dõi thay đổi của `product` trong method này
        return mapToDto(product);
    }

    // Tìm kiếm và phân trang — đọc nhiều dữ liệu, readOnly giúp tiết kiệm tài nguyên
    @Transactional(readOnly = true)
    public Page<ProductDto> searchProducts(String keyword, Pageable pageable) {
        return productRepository.findByNameContaining(keyword, pageable)
            .map(this::mapToDto);
    }

    // Method ghi dữ liệu — KHÔNG dùng readOnly=true
    @Transactional
    public ProductDto createProduct(CreateProductRequest request) {
        Product product = new Product(request.getName(), request.getPrice());
        Product saved = productRepository.save(product);
        return mapToDto(saved);
    }

    // Ví dụ class-level annotation — đặt readOnly=true cho cả class
    // rồi override cho method ghi
}

// Pattern hay dùng: đặt readOnly=true ở class level, override cho method write
@Service
@Transactional(readOnly = true)  // Mặc định tất cả method là read-only
public class ReportService {

    private final OrderRepository orderRepository;

    public ReportService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    // Kế thừa readOnly=true từ class — không cần khai báo lại
    public List<OrderSummary> getMonthlyReport(YearMonth month) {
        return orderRepository.findByMonth(month.getYear(), month.getMonthValue());
    }

    public BigDecimal getTotalRevenue(LocalDate from, LocalDate to) {
        return orderRepository.sumRevenueByDateRange(from, to);
    }

    // Override class-level annotation khi cần ghi — hiếm gặp trong Report service
    @Transactional  // readOnly mặc định là false
    public void generateAndSaveReport(YearMonth month) {
        // Tạo và lưu báo cáo vào database
    }
}
```

### Đáp án mẫu

> "`readOnly=true` là một optimization hint quan trọng thường bị bỏ qua. Tác dụng chính là với Hibernate: framework sẽ tắt cơ chế dirty checking — tức là không theo dõi sự thay đổi của các entity trong session, không cần tạo snapshot ban đầu để so sánh. Điều này giúp tiết kiệm đáng kể CPU và memory, đặc biệt khi load nhiều entity cùng lúc. Ngoài ra, một số database driver có thể routing câu query đến read replica thay vì primary server. Tôi thường áp dụng bằng cách đặt `@Transactional(readOnly = true)` ở class level cho các service thiên về đọc như Report Service, rồi override từng method cần ghi dữ liệu."

---
