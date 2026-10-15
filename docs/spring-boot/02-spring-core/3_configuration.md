---
sidebar_position: 3
title: "3. Cấu hình Spring"
---

# Cấu hình Spring

"Cấu hình" trong Spring có hai lớp: **cấu hình bean** (khai báo object nào được tạo, nối với nhau ra sao) và **cấu hình thuộc tính** (giá trị như URL database, timeout, API key nằm ngoài code). Bài này đi theo dòng lịch sử XML → Java config → annotation, rồi sang cách Spring Boot đọc `application.yml`, inject giá trị bằng `@Value`, gom nhóm bằng `@ConfigurationProperties` và tách môi trường bằng Profile.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Ưu tiên `@ConfigurationProperties` hơn `@Value`** khi có nhiều thuộc tính liên quan — type-safe, validate được, hỗ trợ relaxed binding và gợi ý trong IDE.
- ⭐ **Thứ tự ưu tiên nguồn cấu hình**: tham số dòng lệnh > biến môi trường > file profile (`application-prod.yml`) > `application.yml`. Nguồn sau ghi đè được nguồn trước.
- **Ba cách khai báo bean**: XML (cũ), Java config `@Configuration` + `@Bean` (cho class thư viện), annotation + component scan (cho class của bạn).
- **Profile** tách cấu hình theo môi trường: `application-{profile}.yml` và `@Profile`.
- **Không hard-code secret** trong file cấu hình commit lên git — dùng biến môi trường hoặc secret manager.

:::

---

## Mục lục

- [Vì sao cần cấu hình ngoài code?](#vì-sao-cần-cấu-hình-ngoài-code)
- [Lịch sử: XML, Java config, annotation](#lịch-sử-xml-java-config-annotation)
- [application.yml và application.properties](#applicationyml-và-applicationproperties)
- [Inject giá trị bằng @Value](#inject-giá-trị-bằng-value)
- [Gom nhóm bằng @ConfigurationProperties](#gom-nhóm-bằng-configurationproperties)
- [Profile](#profile)
- [Thứ tự ưu tiên nguồn cấu hình](#thứ-tự-ưu-tiên-nguồn-cấu-hình)

---

## Vì sao cần cấu hình ngoài code?

**Vấn đề:** Giá trị phụ thuộc môi trường bị viết cứng trong code:

```java
public class PaymentClient {
    // Đổi sang môi trường production phải sửa code, build lại, và lộ secret lên git
    private static final String URL = "https://sandbox.vnpayment.vn";
    private static final String SECRET = "ABCXYZ123";
    private static final int TIMEOUT_MS = 3000;
}
```

**Giải pháp:** Tách giá trị ra file cấu hình và biến môi trường; code chỉ đọc vào.

```yaml
# application.yml
payment:
  url: https://sandbox.vnpayment.vn
  secret: ${VNPAY_SECRET}   # đọc từ biến môi trường, không commit giá trị thật
  timeout: 3s
```

```java
@ConfigurationProperties(prefix = "payment")
public record PaymentProperties(String url, String secret, Duration timeout) { }
```

Một bản build (cùng một file `.jar`) chạy được ở dev, staging, prod — chỉ khác cấu hình. Đây là nguyên tắc "Config" trong 12-Factor App.

:::tip[Dùng thực tế]

- **Mỗi môi trường một database** — dev dùng H2/Docker local, prod dùng PostgreSQL cluster.
- **Bật/tắt tính năng** — `feature.new-checkout.enabled=true` chỉ ở staging để thử.
- **Secret** (mật khẩu DB, API key) đưa vào qua biến môi trường / Kubernetes Secret / Vault.
- **Tinh chỉnh không cần build lại** — đổi timeout, pool size bằng cách sửa ConfigMap rồi restart.

:::

---

## Lịch sử: XML, Java config, annotation

### Giai đoạn 1 — XML (Spring 1.x, 2.x)

```xml
<!-- applicationContext.xml -->
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
           https://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="orderRepository" class="com.shop.JdbcOrderRepository">
        <constructor-arg ref="dataSource"/>
    </bean>

    <bean id="orderService" class="com.shop.OrderService">
        <constructor-arg ref="orderRepository"/>
    </bean>
</beans>
```

Nhược điểm: dài dòng, gõ sai tên class chỉ phát hiện lúc chạy, refactor đổi tên class IDE khó theo dõi.

### Giai đoạn 2 — Annotation + component scan (Spring 2.5)

```java
@Repository
public class JdbcOrderRepository implements OrderRepository { /* ... */ }

@Service
public class OrderService {
    public OrderService(OrderRepository repo) { /* ... */ }
}
```

### Giai đoạn 3 — Java config (Spring 3.0)

```java
@Configuration
public class PersistenceConfig {

    @Bean
    public DataSource dataSource() {
        HikariConfig cfg = new HikariConfig();
        cfg.setJdbcUrl("jdbc:postgresql://localhost:5432/shop");
        return new HikariDataSource(cfg);
    }

    @Bean
    public OrderRepository orderRepository(DataSource dataSource) { // tham số = phụ thuộc
        return new JdbcOrderRepository(dataSource);
    }
}
```

| Cách | Hợp với | Ưu điểm | Nhược điểm |
|------|---------|---------|------------|
| XML | Dự án cũ | Tách hẳn cấu hình khỏi code | Dài, không type-safe |
| Annotation (`@Component`) | **Class do bạn viết** | Gọn, gần code | Không đánh được lên class thư viện |
| Java config (`@Bean`) | **Class thư viện**, logic tạo phức tạp | Type-safe, refactor tốt, có logic | Dài hơn annotation |

Thực tế dự án Spring Boot: **annotation cho class của mình + `@Bean` cho class thư viện + auto-configuration cho phần còn lại**. XML gần như không còn dùng.

:::tip[Ví dụ đời thường]

XML giống **ghi thực đơn vào sổ riêng** để ở quầy — muốn biết món nào gồm gì phải lật sổ. Annotation giống **dán nhãn lên từng hộp nguyên liệu** — nhìn là biết. `@Bean` giống **công thức pha chế** cho nguyên liệu mua ngoài (chai sữa đặc không dán nhãn quán được, nên ghi cách dùng nó vào công thức).

:::

### `@Configuration` full mode và lite mode

```java
@Configuration // full mode: class bị CGLIB proxy
public class AppConfig {
    @Bean
    public Clock clock() { return Clock.systemUTC(); }

    @Bean
    public TokenService tokenService() {
        return new TokenService(clock()); // gọi clock() → trả về CÙNG bean singleton
    }
}
```

Trong class `@Configuration` (mặc định `proxyBeanMethods = true`), lời gọi `clock()` giữa các method `@Bean` bị proxy chặn và trả về bean singleton có sẵn. Nếu đặt `@Configuration(proxyBeanMethods = false)` hoặc khai báo `@Bean` trong class `@Component` thường (lite mode), lời gọi `clock()` là gọi method Java thường → **tạo object mới**. Cách an toàn: nhận phụ thuộc qua **tham số method** `tokenService(Clock clock)`.

---

## application.yml và application.properties

Spring Boot tự đọc `application.properties` hoặc `application.yml` trong `src/main/resources`. Hai định dạng tương đương:

```properties
server.port=8080
spring.datasource.url=jdbc:postgresql://localhost:5432/shop
spring.datasource.username=shop
app.upload.max-size=10MB
app.cors.allowed-origins[0]=https://shop.vn
app.cors.allowed-origins[1]=https://admin.shop.vn
```

```yaml
server:
  port: 8080
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/shop
    username: shop
app:
  upload:
    max-size: 10MB
  cors:
    allowed-origins:
      - https://shop.vn
      - https://admin.shop.vn
```

Placeholder và giá trị mặc định:

```yaml
spring:
  datasource:
    password: ${DB_PASSWORD}                # bắt buộc có biến môi trường
app:
  base-url: ${APP_BASE_URL:http://localhost:8080}   # mặc định nếu không có
```

Import file khác (Boot 2.4+):

```yaml
spring:
  config:
    import: optional:file:./secrets.yml
```

:::warning[Lỗi hay gặp]

- **YAML thụt lề bằng tab** → lỗi parse. Chỉ dùng dấu cách.
- **Có cả `.properties` và `.yml`** cùng thuộc tính → `.properties` thắng, dễ gây nhầm. Chọn một định dạng.
- **Commit mật khẩu thật** vào `application.yml` — dùng `${ENV_VAR}` và để giá trị thật ở biến môi trường.

:::

---

## Inject giá trị bằng @Value

```java
@Service
public class UploadService {
    private final DataSize maxSize;
    private final String bucket;
    private final List<String> allowedTypes;

    public UploadService(@Value("${app.upload.max-size:5MB}") DataSize maxSize,
                         @Value("${app.upload.bucket}") String bucket,
                         @Value("${app.upload.allowed-types:jpg,png}") List<String> allowedTypes) {
        this.maxSize = maxSize;
        this.bucket = bucket;
        this.allowedTypes = allowedTypes;
    }
}
```

- `${...}` — placeholder đọc thuộc tính; `:giá-trị` sau dấu hai chấm là mặc định.
- `#{...}` — biểu thức SpEL, ví dụ `@Value("#{${app.timeout-seconds} * 1000}")`.
- Thiếu thuộc tính mà không có mặc định → app không khởi động (`Could not resolve placeholder`).

---

## Gom nhóm bằng @ConfigurationProperties

Khi có nhiều thuộc tính cùng prefix, `@Value` rải rác khắp nơi rất khó quản lý. `@ConfigurationProperties` bind cả nhóm vào một object:

```yaml
app:
  mail:
    host: smtp.gmail.com
    port: 587
    from: no-reply@shop.vn
    timeout: 5s
    retry:
      max-attempts: 3
      backoff: 2s
```

```java
@ConfigurationProperties(prefix = "app.mail")
@Validated
public record MailProperties(
        @NotBlank String host,
        @Min(1) @Max(65535) int port,
        @Email String from,
        @DefaultValue("10s") Duration timeout,
        Retry retry) {

    public record Retry(@DefaultValue("3") int maxAttempts,
                        @DefaultValue("1s") Duration backoff) { }
}
```

Đăng ký (chọn một cách):

```java
@SpringBootApplication
@ConfigurationPropertiesScan            // quét mọi class @ConfigurationProperties
public class ShopApplication { /* ... */ }

// hoặc
@Configuration
@EnableConfigurationProperties(MailProperties.class)
public class MailConfig { }
```

Dùng như một bean thường:

```java
@Service
public class MailService {
    private final MailProperties props;

    public MailService(MailProperties props) {
        this.props = props;
    }

    public void send(String to, String body) {
        // props.host(), props.retry().maxAttempts() ...
    }
}
```

Thêm `spring-boot-configuration-processor` để IDE gợi ý và kiểm tra key trong `application.yml`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <optional>true</optional>
</dependency>
```

| Tiêu chí | `@Value` | `@ConfigurationProperties` |
|----------|----------|----------------------------|
| Số thuộc tính | Lẻ tẻ 1–2 | Cả nhóm |
| Type-safe, cấu trúc lồng | Hạn chế | ✅ (record lồng, `List`, `Map`, `Duration`, `DataSize`) |
| Relaxed binding (`max-size` = `maxSize` = `MAX_SIZE`) | Hạn chế | ✅ đầy đủ |
| Validate (`@Validated`) | ❌ | ✅ |
| SpEL | ✅ | ❌ |
| Gợi ý trong IDE | ❌ | ✅ (với configuration processor) |

:::tip[Ví dụ đời thường]

`@Value` như **ghi từng số điện thoại lên giấy nhớ dán khắp bàn**. `@ConfigurationProperties` như **một cuốn danh bạ** có mục "Nhà cung cấp email" — mở ra là thấy đủ host, cổng, người gửi, và có người kiểm tra (validate) số nào sai định dạng trước khi bạn gọi.

:::

---

## Profile

### File cấu hình theo profile

```text
src/main/resources/
├── application.yml          # chung cho mọi môi trường
├── application-dev.yml      # ghi đè khi profile dev bật
└── application-prod.yml     # ghi đè khi profile prod bật
```

```yaml
# application.yml
spring:
  application:
    name: shop
  profiles:
    active: dev        # mặc định khi chạy local; prod sẽ ghi đè bằng biến môi trường
```

```yaml
# application-prod.yml
spring:
  datasource:
    url: jdbc:postgresql://db.internal:5432/shop
logging:
  level:
    root: WARN
```

Có thể gộp nhiều profile trong một file YAML bằng dấu `---`:

```yaml
app:
  cache-ttl: 1m
---
spring:
  config:
    activate:
      on-profile: prod
app:
  cache-ttl: 30m
```

### Bean theo profile

```java
public interface SmsSender { void send(String phone, String text); }

@Component
@Profile("dev")
public class LogSmsSender implements SmsSender {
    private static final Logger log = LoggerFactory.getLogger(LogSmsSender.class);
    public void send(String phone, String text) { log.info("[FAKE SMS] {} - {}", phone, text); }
}

@Component
@Profile("!dev") // mọi profile trừ dev
public class TwilioSmsSender implements SmsSender {
    public void send(String phone, String text) { /* gọi API thật */ }
}
```

Bật profile:

```bash
java -jar shop.jar --spring.profiles.active=prod
SPRING_PROFILES_ACTIVE=prod java -jar shop.jar
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

:::warning[Lỗi hay gặp]

- Đặt `spring.profiles.active` **trong** `application-prod.yml` — không có tác dụng (và bị cấm từ Boot 2.4). Profile phải được bật từ nguồn ngoài hoặc từ `application.yml`.
- Quên rằng **nhiều profile** có thể bật cùng lúc (`dev,local`) — file nạp sau ghi đè file nạp trước.
- Dùng profile để chứa logic nghiệp vụ khác nhau giữa môi trường — dễ "chạy được ở staging, lỗi ở prod". Profile chỉ nên khác về hạ tầng.

:::

---

## Thứ tự ưu tiên nguồn cấu hình

Spring Boot gom thuộc tính từ nhiều nguồn vào `Environment`. Rút gọn, nguồn **ở trên ghi đè nguồn ở dưới**:

| Ưu tiên | Nguồn |
|---------|-------|
| 1 (cao nhất) | Thuộc tính trong test (`@TestPropertySource`, `@SpringBootTest(properties = ...)`) |
| 2 | Tham số dòng lệnh `--server.port=9090` |
| 3 | `SPRING_APPLICATION_JSON` |
| 4 | Java system properties `-Dserver.port=9090` |
| 5 | Biến môi trường hệ điều hành `SERVER_PORT=9090` |
| 6 | File profile ngoài jar (`./config/application-prod.yml`) |
| 7 | File profile trong jar (`application-prod.yml`) |
| 8 | File ngoài jar (`./config/application.yml`) |
| 9 | File trong jar (`application.yml`) |
| 10 (thấp nhất) | Giá trị mặc định (`SpringApplication.setDefaultProperties`) |

Tên biến môi trường theo quy tắc relaxed binding: đổi `.` thành `_`, bỏ `-`, viết hoa — `spring.datasource.url` → `SPRING_DATASOURCE_URL`.

Đọc thuộc tính bằng code (hiếm khi cần):

```java
@Component
public class StartupInfo {
    public StartupInfo(Environment env) {
        String port = env.getProperty("server.port", "8080");
        boolean isProd = env.matchesProfiles("prod");
    }
}
```
