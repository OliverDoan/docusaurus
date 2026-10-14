---
sidebar_position: 1
title: "1. Thuật ngữ Spring"
---

# Thuật ngữ Spring

Spring có một bộ từ vựng riêng: Bean, IoC, DI, ApplicationContext, Starter, Auto-configuration... Đọc tài liệu hay log lỗi mà không nắm các từ này thì rất dễ "lạc". Bài này gom các thuật ngữ cốt lõi vào một chỗ, giải thích ngắn gọn kèm ví dụ code, làm "từ điển" để quay lại tra trong suốt lộ trình.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Bean = object do Spring tạo và quản lý** — không phải mọi object trong ứng dụng đều là bean, chỉ những object nằm trong container.
- ⭐ **IoC là nguyên lý, DI là cách thực hiện** — "đảo ngược quyền kiểm soát" việc tạo object; DI là truyền phụ thuộc từ ngoài vào.
- **ApplicationContext là container đầy đủ** — mở rộng `BeanFactory`, thêm event, i18n, đọc config, AOP tự động. Thực tế luôn dùng ApplicationContext.
- **Starter gom dependency, Auto-configuration dựng bean** — hai trụ cột giúp Spring Boot "chạy ngay".
- **Profile tách cấu hình theo môi trường** — `dev`, `test`, `prod` dùng chung code, khác file cấu hình.

:::

---

## Mục lục

- [Vì sao cần nắm thuật ngữ Spring?](#vì-sao-cần-nắm-thuật-ngữ-spring)
- [Bảng thuật ngữ tổng hợp](#bảng-thuật-ngữ-tổng-hợp)
- [Nhóm 1 - Container và Bean](#nhóm-1---container-và-bean)
- [Nhóm 2 - IoC và DI](#nhóm-2---ioc-và-di)
- [Nhóm 3 - Cấu hình](#nhóm-3---cấu-hình)
- [Nhóm 4 - Thuật ngữ riêng của Spring Boot](#nhóm-4---thuật-ngữ-riêng-của-spring-boot)
- [Nhóm 5 - Thuật ngữ nâng cao hay gặp](#nhóm-5---thuật-ngữ-nâng-cao-hay-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vì sao cần nắm thuật ngữ Spring?

**Vấn đề:** Spring ra đời (2003) để thay thế mô hình EJB nặng nề. Nó mang theo một loạt khái niệm mới — container, bean, injection — mà người chỉ biết Java thuần chưa từng gặp. Khi gặp lỗi như dưới đây, người mới thường bối rối:

```text
***************************
APPLICATION FAILED TO START
***************************

Description:
Parameter 0 of constructor in com.shop.OrderService required a bean
of type 'com.shop.PaymentGateway' that could not be found.

Action:
Consider defining a bean of type 'com.shop.PaymentGateway' in your configuration.
```

Câu lỗi trên chứa ba thuật ngữ: **constructor injection**, **bean**, **configuration**. Không hiểu chúng thì chỉ biết copy lỗi lên Google.

**Giải pháp:** nắm vững từ vựng — đọc lỗi trên sẽ hiểu ngay: "Spring muốn tiêm (inject) một `PaymentGateway` vào constructor của `OrderService`, nhưng trong container không có bean nào kiểu đó → mình quên đánh `@Component` hoặc quên khai báo `@Bean`".

```java
// Sửa lỗi: đánh dấu class implement để Spring quét thấy và tạo bean
@Component
public class VnPayGateway implements PaymentGateway {
    @Override
    public void pay(long amount) {
        // gọi API VNPay
    }
}
```

:::tip[Dùng thực tế]

- **Đọc log khởi động** — hiểu "bean creation", "circular reference", "no qualifying bean" để tự sửa lỗi.
- **Đọc tài liệu chính thức** tại [docs.spring.io](https://docs.spring.io/spring-framework/reference/) — toàn dùng các thuật ngữ này.
- **Trao đổi trong team / code review** — "chỗ này nên inject qua constructor", "tách bean này ra profile dev".
- **Phỏng vấn** — câu hỏi "IoC khác DI thế nào", "BeanFactory khác ApplicationContext ra sao" gần như luôn xuất hiện.

:::

---

## Bảng thuật ngữ tổng hợp

| Thuật ngữ | Giải thích ngắn | Ví dụ |
|-----------|-----------------|-------|
| **Bean** | Object được Spring container tạo, cấu hình và quản lý vòng đời | `OrderService` đánh `@Service` |
| **Container** | "Thùng chứa" giữ toàn bộ bean, chịu trách nhiệm tạo và nối chúng | `ApplicationContext` |
| **BeanFactory** | Interface container gốc, tối giản, tạo bean lười (lazy) | Hiếm dùng trực tiếp |
| **ApplicationContext** | Container đầy đủ, mở rộng `BeanFactory`, tạo singleton sẵn khi khởi động | `AnnotationConfigApplicationContext` |
| **IoC** (Inversion of Control) | Nguyên lý: framework điều khiển việc tạo object thay cho code của bạn | Không `new` service nữa |
| **DI** (Dependency Injection) | Kỹ thuật thực hiện IoC: truyền phụ thuộc vào object từ bên ngoài | Constructor injection |
| **Bean Definition** | "Bản thiết kế" mô tả cách tạo một bean (class, scope, phụ thuộc) | Đọc từ `@Bean`, `@Component`, XML |
| **Configuration** | Nơi khai báo bean và cấu hình | Class `@Configuration`, `application.yml` |
| **Component Scanning** | Spring tự quét package tìm class có stereotype annotation để đăng ký bean | `@ComponentScan` |
| **Stereotype** | Nhóm annotation đánh dấu vai trò class | `@Component`, `@Service`, `@Repository`, `@Controller` |
| **Scope** | Phạm vi sống của bean | `singleton`, `prototype`, `request` |
| **Profile** | Nhóm bean/cấu hình chỉ bật ở môi trường nhất định | `@Profile("dev")` |
| **Starter** | Dependency "gói sẵn" kéo theo bộ thư viện tương thích | `spring-boot-starter-web` |
| **Auto-configuration** | Spring Boot tự tạo bean dựa trên classpath và cấu hình | Có H2 trên classpath → tự tạo `DataSource` |
| **Actuator** | Module cung cấp endpoint vận hành: health, metrics, info | `/actuator/health` |
| **AOP** | Lập trình hướng khía cạnh: tách logic cắt ngang (log, transaction) | `@Transactional`, `@Aspect` |
| **Proxy** | Object "bọc" bean thật để chèn thêm hành vi | Proxy của `@Transactional` |
| **Embedded Server** | Web server nhúng trong ứng dụng | Tomcat trong file `.jar` |

---

## Nhóm 1 - Container và Bean

### Bean

**Bean** là một object Java bình thường (POJO - Plain Old Java Object) nhưng **được Spring tạo ra và quản lý**. Spring quyết định khi nào tạo, tiêm phụ thuộc gì vào, và khi nào huỷ.

```java
@Service
public class OrderService {          // bean, tên mặc định "orderService"
    private final OrderRepository repo;

    public OrderService(OrderRepository repo) {
        this.repo = repo;
    }
}

// Object này KHÔNG phải bean: tự new, Spring không biết đến
OrderDto dto = new OrderDto("A001", 150_000);
```

Quy tắc phân biệt: **entity, DTO, value object** thường không phải bean (tạo theo từng request/dữ liệu). **Service, repository, controller, client gọi API ngoài, config** thường là bean (dùng chung, sống suốt ứng dụng).

### Container, BeanFactory và ApplicationContext

**Container** là "bộ não" của Spring: đọc bean definition, tạo bean, nối các bean với nhau, gọi callback vòng đời. Có hai interface chính:

| Tiêu chí | `BeanFactory` | `ApplicationContext` |
|----------|---------------|----------------------|
| Quan hệ | Interface gốc | Kế thừa `BeanFactory` |
| Tạo singleton | Lười — khi gọi `getBean()` | Sớm — ngay khi khởi động (eager) |
| Event (publish/listen) | Không | Có (`ApplicationEventPublisher`) |
| i18n (`MessageSource`) | Không | Có |
| Tự đăng ký `BeanPostProcessor` | Phải đăng ký tay | Tự động |
| Dùng khi nào | Môi trường cực hạn chế tài nguyên (hiếm) | **Mọi ứng dụng thực tế** |

```java
// Spring Boot tự tạo ApplicationContext khi chạy
ConfigurableApplicationContext ctx = SpringApplication.run(ShopApplication.class, args);
OrderService service = ctx.getBean(OrderService.class);
```

:::tip[Ví dụ đời thường]

Container giống **bếp trưởng trong nhà hàng**. Bạn (code) không tự đi chợ, tự sơ chế; bạn chỉ ghi thực đơn (bean definition). Bếp trưởng chuẩn bị nguyên liệu, giao cho từng đầu bếp đúng thứ họ cần (DI), và dọn dẹp khi đóng cửa (destroy). `BeanFactory` là bếp nhỏ — khách gọi món nào mới nấu món đó. `ApplicationContext` là bếp nhà hàng lớn — nấu sẵn nước dùng từ sáng, có loa thông báo (event), có thực đơn nhiều thứ tiếng (i18n).

:::

### Bean Definition và Scope

**Bean definition** là metadata mô tả bean: class nào, scope gì, phụ thuộc gì, init/destroy method nào. Spring đọc nó từ annotation, Java config hoặc XML, rồi mới tạo bean thật.

**Scope** quyết định "một bean có bao nhiêu instance":

- `singleton` (mặc định) — một instance duy nhất cho cả container.
- `prototype` — mỗi lần xin là một instance mới.
- `request`, `session`, `application`, `websocket` — chỉ có trong ứng dụng web.

Chi tiết xem bài **Bean Scope và vòng đời Bean** trong nhóm Spring Core.

---

## Nhóm 2 - IoC và DI

### IoC - Inversion of Control

**Inversion of Control** (đảo ngược quyền điều khiển): thay vì code của bạn chủ động tạo và điều phối các object, **framework làm việc đó** và gọi lại code của bạn khi cần. Nguyên tắc nổi tiếng: *"Don't call us, we'll call you"* (Hollywood Principle).

```java
// Không có IoC: class tự tạo phụ thuộc → dính chặt vào MySqlOrderRepository
public class OrderService {
    private final OrderRepository repo = new MySqlOrderRepository();
}

// Có IoC: class chỉ khai báo "tôi cần OrderRepository", ai cung cấp không quan trọng
public class OrderService {
    private final OrderRepository repo;
    public OrderService(OrderRepository repo) { this.repo = repo; }
}
```

### DI - Dependency Injection

**Dependency Injection** (tiêm phụ thuộc) là một cách cụ thể để hiện thực IoC: phụ thuộc được **truyền vào** object qua constructor, setter hoặc field. Spring hỗ trợ cả ba, nhưng khuyến nghị **constructor injection**.

| Kiểu | Cách viết | Đánh giá |
|------|-----------|----------|
| Constructor | Tham số constructor | ⭐ Khuyến nghị: field `final`, dễ test, phát hiện vòng tròn sớm |
| Setter | Method `setXxx` + `@Autowired` | Cho phụ thuộc tuỳ chọn |
| Field | `@Autowired` trên field | Gọn nhưng khó test, không `final` được |

:::warning[Lỗi hay gặp]

Nhầm "IoC = DI". IoC là **nguyên lý** rộng hơn: event listener, template method (`JdbcTemplate` gọi lại `RowMapper` của bạn), Servlet container gọi `doGet`... đều là IoC. DI chỉ là **một dạng** IoC tập trung vào việc cung cấp phụ thuộc.

:::

---

## Nhóm 3 - Cấu hình

### Configuration

"Configuration" trong Spring có hai nghĩa:

1. **Cấu hình bean** — class đánh `@Configuration` chứa các method `@Bean`.
2. **Cấu hình thuộc tính** — giá trị ngoài code: `application.yml`, biến môi trường, tham số dòng lệnh.

```java
@Configuration
public class HttpClientConfig {

    @Bean
    public RestClient paymentClient(@Value("${payment.base-url}") String baseUrl) {
        return RestClient.builder().baseUrl(baseUrl).build();
    }
}
```

```yaml
payment:
  base-url: https://sandbox.vnpayment.vn
```

### Component Scanning

**Component scanning** là việc Spring quét các package để tìm class đánh `@Component` (và các annotation "con" như `@Service`, `@Repository`, `@Controller`, `@RestController`, `@Configuration`) rồi đăng ký chúng thành bean. Trong Spring Boot, `@SpringBootApplication` đã bao gồm `@ComponentScan` — mặc định quét **package chứa class main và mọi package con**.

```text
com.shop
├── ShopApplication.java        ← @SpringBootApplication (gốc quét)
├── order/OrderService.java     ← được quét
└── payment/VnPayGateway.java   ← được quét
com.other
└── Util.java                   ← KHÔNG được quét (nằm ngoài com.shop)
```

### Profile

**Profile** cho phép bật/tắt bean và cấu hình theo môi trường.

```java
@Configuration
@Profile("dev")
public class DevDataSeeder {
    // chỉ chạy khi profile "dev" được bật: chèn dữ liệu mẫu
}
```

```yaml
# application-prod.yml — chỉ nạp khi chạy với profile prod
spring:
  datasource:
    url: jdbc:postgresql://db.prod:5432/shop
```

Bật profile: `--spring.profiles.active=prod` hoặc biến môi trường `SPRING_PROFILES_ACTIVE=prod`.

---

## Nhóm 4 - Thuật ngữ riêng của Spring Boot

### Starter

**Starter** là một dependency "rỗng" (gần như không có code) nhưng khai báo sẵn danh sách thư viện thường dùng cùng nhau với phiên bản đã kiểm thử tương thích.

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<!-- Kéo theo: spring-webmvc, Jackson, Tomcat nhúng, validation API... -->
```

### Auto-configuration

**Auto-configuration** là cơ chế Spring Boot tự tạo bean dựa vào: thư viện nào có trên classpath, bean nào bạn đã tự khai báo, thuộc tính nào trong `application.yml`. Nguyên tắc "lùi lại" (back off): **bạn tự khai báo bean thì Boot không tạo nữa**.

```java
// Ý tưởng bên trong một auto-configuration (rút gọn)
@AutoConfiguration
@ConditionalOnClass(DataSource.class)
public class MyDataSourceAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean   // chỉ tạo khi bạn chưa tự khai báo DataSource
    public DataSource dataSource(DataSourceProperties props) {
        return props.initializeDataSourceBuilder().build();
    }
}
```

### Embedded Server, Fat JAR

- **Embedded server** — Tomcat (mặc định), Jetty hoặc Undertow được nhúng vào ứng dụng, không cần cài server riêng.
- **Fat JAR** (executable JAR) — file `.jar` chứa cả code, thư viện và server; chạy bằng `java -jar app.jar`.

### Actuator

**Actuator** cung cấp các endpoint giám sát: `/actuator/health` (ứng dụng còn sống không), `/actuator/metrics` (số liệu), `/actuator/info`. Dùng cho Kubernetes probe, Prometheus, dashboard vận hành.

### Spring Initializr

Trang [start.spring.io](https://start.spring.io) sinh khung dự án Spring Boot: chọn Maven/Gradle, phiên bản Java, các starter → tải về file zip chạy được ngay.

:::tip[Ví dụ đời thường]

**Starter** như **combo cơm văn phòng**: gọi "combo gà" là có cơm, gà, canh, nước — không phải gọi lẻ từng món và lo món này có hợp món kia không. **Auto-configuration** như **quán quen**: thấy bạn mang hộp cơm (thư viện) vào là tự lấy lò vi sóng hâm giúp; nếu bạn dặn "để em tự hâm" (tự khai báo bean) thì quán thôi không làm nữa.

:::

---

## Nhóm 5 - Thuật ngữ nâng cao hay gặp

| Thuật ngữ | Ý nghĩa |
|-----------|---------|
| **BeanPostProcessor** | Hook can thiệp vào bean sau khi tạo — nơi Spring bọc proxy cho AOP, `@Transactional`, `@Async` |
| **BeanFactoryPostProcessor** | Hook sửa bean definition **trước** khi tạo bean (vd thay placeholder `${...}`) |
| **Proxy** | Object đứng trước bean thật, chặn lời gọi method để thêm logic. Có JDK dynamic proxy (theo interface) và CGLIB (kế thừa class) |
| **Aspect / Advice / Pointcut** | Thuật ngữ AOP: module cắt ngang / đoạn code chạy thêm / biểu thức chọn method áp dụng |
| **Environment** | Đối tượng gom mọi nguồn thuộc tính (file, biến môi trường, tham số) và profile đang bật |
| **ApplicationEvent** | Sự kiện phát trong container, ví dụ `ApplicationReadyEvent` khi app sẵn sàng |
| **SpEL** | Spring Expression Language — biểu thức `#{...}` dùng trong `@Value`, `@PreAuthorize` |
| **Lazy initialization** | Tạo bean khi lần đầu cần dùng thay vì lúc khởi động (`@Lazy`) |

:::warning[Lỗi hay gặp]

- Gọi nhầm `@Bean` là "annotation đánh lên class". Sai: `@Bean` đánh trên **method** trong class `@Configuration`; annotation đánh trên class là `@Component` và các stereotype.
- Nghĩ rằng mọi class trong project đều tự thành bean. Chỉ class được quét thấy (có stereotype, nằm trong package được quét) hoặc khai báo qua `@Bean` mới là bean.
- Nhầm `${...}` (placeholder đọc thuộc tính) với `#{...}` (biểu thức SpEL).

:::

---

## Câu hỏi phỏng vấn

**1. Bean trong Spring là gì? Mọi object trong ứng dụng Spring có phải bean không?**

<details className="qa">
<summary>Xem đáp án</summary>

Bean là object được **Spring IoC container khởi tạo, cấu hình và quản lý vòng đời**. Không phải mọi object đều là bean: DTO, entity, object tạo bằng `new` trong method là object thường. Chỉ những class được đăng ký vào container (qua `@Component` và các stereotype được component scan thấy, qua method `@Bean`, hoặc qua XML) mới là bean. Bean mặc định là singleton — một instance dùng chung cho cả container.

</details>

**2. IoC và DI khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **IoC** là nguyên lý thiết kế: chuyển quyền điều khiển (tạo object, gọi luồng chính) từ code ứng dụng sang framework. Ví dụ khác của IoC: template method, callback, event listener, Servlet container gọi servlet.
- **DI** là một kỹ thuật cụ thể để thực hiện IoC: phụ thuộc của object được cung cấp từ bên ngoài (qua constructor, setter, field) thay vì object tự `new`.

Nói gọn: DI là một cách để đạt IoC; Spring IoC container dùng DI để nối các bean.

</details>

**3. So sánh `BeanFactory` và `ApplicationContext`.**

<details className="qa">
<summary>Xem đáp án</summary>

`ApplicationContext` kế thừa `BeanFactory` và bổ sung: tạo sẵn (eager) singleton khi khởi động — phát hiện lỗi cấu hình sớm; hỗ trợ event (`ApplicationEventPublisher`), i18n (`MessageSource`), truy cập resource, `Environment`/profile; tự động đăng ký `BeanPostProcessor` và `BeanFactoryPostProcessor` (nên AOP, `@Transactional`, `@Autowired` hoạt động sẵn). `BeanFactory` tối giản, tạo bean lười. Thực tế luôn dùng `ApplicationContext`; Spring Boot tạo nó qua `SpringApplication.run()`.

</details>

**4. Starter và Auto-configuration khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Starter** giải quyết bài toán **dependency**: gom các thư viện thường dùng chung với phiên bản tương thích (quản lý qua BOM `spring-boot-dependencies`). Nó chỉ đưa thư viện lên classpath.
- **Auto-configuration** giải quyết bài toán **cấu hình bean**: dựa trên classpath, bean đã có và thuộc tính để tự tạo bean cần thiết (`DataSource`, `ObjectMapper`, `DispatcherServlet`...), dùng các điều kiện `@ConditionalOnClass`, `@ConditionalOnMissingBean`...

Starter đưa thư viện vào → auto-configuration thấy thư viện → tự dựng bean.

</details>

**5. Profile dùng để làm gì? Bật profile bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Profile tách bean và cấu hình theo môi trường (dev, test, staging, prod) mà không đổi code. Bean đánh `@Profile("dev")` chỉ được tạo khi profile `dev` bật; file `application-dev.yml` chỉ nạp khi `dev` bật (ghi đè lên `application.yml`). Cách bật: thuộc tính `spring.profiles.active` trong file cấu hình, tham số `--spring.profiles.active=prod`, biến môi trường `SPRING_PROFILES_ACTIVE=prod`, hoặc `@ActiveProfiles` trong test.

</details>

**6. Component scanning hoạt động thế nào trong Spring Boot? Vì sao đôi khi bean "không được tìm thấy"?**

<details className="qa">
<summary>Xem đáp án</summary>

`@SpringBootApplication` gồm `@ComponentScan` không chỉ định package, nên Spring quét **package của class main và mọi package con**, tìm class có `@Component` (hoặc annotation được meta-annotate bởi nó: `@Service`, `@Repository`, `@Controller`, `@Configuration`). Bean "không được tìm thấy" thường do: class nằm ngoài package gốc (đặt class main sai chỗ), quên annotation, bean bị điều kiện/profile loại bỏ, hoặc khai báo kiểu interface nhưng không có class implement nào là bean.

</details>

**7. Proxy trong Spring là gì, liên quan gì đến `@Transactional`?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi một bean cần hành vi cắt ngang (transaction, cache, async, security), Spring không đưa bean gốc cho nơi inject mà đưa một **proxy** bọc ngoài. Proxy chặn lời gọi method, chạy logic thêm (mở transaction), rồi gọi method thật, sau đó commit/rollback. Proxy được tạo bằng JDK dynamic proxy (nếu dựa trên interface) hoặc CGLIB (tạo subclass; Spring Boot mặc định dùng CGLIB). Hệ quả quan trọng: gọi method nội bộ `this.method()` sẽ **bỏ qua proxy**, nên `@Transactional` trên method đó không có tác dụng.

</details>
