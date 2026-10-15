---
sidebar_position: 1
title: "1. Giới thiệu"
---

# 1. Giới thiệu

## 1. Thuật ngữ Spring

Bài học: [1. Thuật ngữ Spring](../../spring-boot/01-gioi-thieu/1_thuat-ngu.md)

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

---

## 2. Kiến trúc Spring

Bài học: [2. Kiến trúc Spring](../../spring-boot/01-gioi-thieu/2_kien-truc.md)

**1. Kể tên các module chính trong Spring Framework.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Core Container**: `spring-core`, `spring-beans`, `spring-context`, `spring-expression` — IoC/DI, ApplicationContext, SpEL.
- **AOP**: `spring-aop`, `spring-aspects`.
- **Data Access/Integration**: `spring-jdbc`, `spring-tx`, `spring-orm`, `spring-jms`, `spring-oxm`.
- **Web**: `spring-web`, `spring-webmvc`, `spring-webflux`, `spring-websocket`.
- **Test**: `spring-test`.

Tất cả đều dựa trên Core Container.

</details>

**2. Spring Framework và Spring Boot khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Spring Framework cung cấp các tính năng lõi (IoC, AOP, MVC, transaction, data access) nhưng bạn phải tự cấu hình: khai báo bean, chọn phiên bản thư viện, deploy WAR vào server. Spring Boot xây **bên trên** Framework, thêm: starter (gom dependency), auto-configuration (tự dựng bean theo classpath), embedded server (chạy `java -jar`), externalized configuration và Actuator. Boot không thay thế Framework; một ứng dụng Boot vẫn là ứng dụng Spring Framework.

</details>

**3. Mô tả kiến trúc 3 tầng trong ứng dụng Spring Boot. Vì sao không cho Controller gọi thẳng Repository?**

<details className="qa">
<summary>Xem đáp án</summary>

Controller (web: nhận request, validate, map DTO) → Service (nghiệp vụ, transaction) → Repository (truy cập dữ liệu). Không cho Controller gọi thẳng Repository vì: logic nghiệp vụ bị rải ở tầng web, không tái sử dụng được cho kênh khác (job, message consumer); mất ranh giới transaction (nhiều thao tác ghi không nằm chung transaction); khó test (phải dựng cả web layer để test nghiệp vụ). Tách tầng giúp mỗi tầng thay đổi độc lập.

</details>

**4. `DispatcherServlet` là gì, vai trò trong luồng request?**

<details className="qa">
<summary>Xem đáp án</summary>

Là **front controller** của Spring MVC — một Servlet duy nhất nhận mọi request (sau filter chain). Nó hỏi `HandlerMapping` để tìm controller method phù hợp, dùng `HandlerAdapter` để gọi method (kèm chuyển đổi tham số, validation qua `HttpMessageConverter`), xử lý exception qua `HandlerExceptionResolver` (gồm `@ExceptionHandler`), rồi ghi response (JSON qua converter hoặc render view qua `ViewResolver`). Spring Boot tự đăng ký `DispatcherServlet` qua auto-configuration.

</details>

**5. Filter và Interceptor khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Filter** thuộc Servlet API (`jakarta.servlet.Filter`), chạy **trước** `DispatcherServlet`, thấy mọi request (kể cả file tĩnh), làm việc ở mức request/response thô. Spring Security là một chuỗi filter.
- **HandlerInterceptor** thuộc Spring MVC, chạy **trong** `DispatcherServlet`, biết handler (controller method) nào sẽ xử lý; có `preHandle`, `postHandle`, `afterCompletion`.

Dùng Filter cho bảo mật, CORS, logging thô; Interceptor cho logic gắn với controller (kiểm tra quyền theo handler, đo thời gian xử lý).

</details>

**6. Spring MVC và Spring WebFlux khác nhau thế nào, khi nào chọn WebFlux?**

<details className="qa">
<summary>Xem đáp án</summary>

Spring MVC dùng mô hình Servlet blocking: mỗi request chiếm một thread đến khi xong. WebFlux là reactive, non-blocking (Project Reactor, `Mono`/`Flux`), chạy trên Netty hoặc Servlet async, ít thread phục vụ nhiều kết nối. Chọn WebFlux khi có rất nhiều kết nối đồng thời chờ I/O (gateway, streaming, SSE) và toàn bộ chuỗi gọi đều non-blocking. Với ứng dụng CRUD thông thường dùng JDBC/JPA (blocking), MVC đơn giản hơn; từ Java 21 có thể bật virtual threads (`spring.threads.virtual.enabled=true`) để MVC xử lý nhiều request đồng thời hơn mà vẫn giữ code tuần tự.

</details>

---

## 3. Vì sao dùng Spring

Bài học: [3. Vì sao dùng Spring](../../spring-boot/01-gioi-thieu/3_vi-sao-dung-spring.md)

**1. Vì sao Spring ra đời? Nó giải quyết vấn đề gì của J2EE/EJB?**

<details className="qa">
<summary>Xem đáp án</summary>

EJB 2.x yêu cầu nhiều interface và XML cho mỗi component, bắt code nghiệp vụ phụ thuộc API của container, phải chạy trong application server nặng mới test được, tra cứu phụ thuộc thủ công bằng JNDI. Spring (2004) đưa ra mô hình nhẹ: class nghiệp vụ là POJO, phụ thuộc được container tiêm vào (DI), các mối quan tâm cắt ngang như transaction, bảo mật được gắn từ ngoài bằng AOP. Kết quả: code đơn giản, dễ unit test, chạy được ngoài app server.

</details>

**2. Spring và Jakarta EE có phải đối thủ hoàn toàn không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không hoàn toàn. Jakarta EE là bộ đặc tả, Spring là framework. Spring dùng lại nhiều spec Jakarta: Servlet (Spring MVC chạy trên Tomcat), JPA (qua Hibernate), Bean Validation, Jakarta Mail, JMS. Chỗ cạnh tranh trực tiếp là mô hình DI (Spring DI vs CDI) và REST (Spring MVC vs JAX-RS). Từ Spring Boot 3, Spring yêu cầu Jakarta EE 9+ (package `jakarta.*`).

</details>

**3. Quarkus/Micronaut nhanh hơn Spring Boot ở điểm nào, vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Nhanh hơn chủ yếu ở **thời gian khởi động và bộ nhớ**. Lý do: chúng xử lý DI, cấu hình, proxy lúc **build/compile** (sinh bytecode sẵn) thay vì quét classpath, đọc annotation và dùng reflection lúc runtime như Spring truyền thống. Điều này cũng giúp chúng dễ build GraalVM native image. Throughput khi đã chạy ổn định thì chênh lệch thường không lớn. Spring đã thu hẹp khoảng cách bằng Spring AOT + native image và hỗ trợ CDS (Class Data Sharing) để khởi động nhanh hơn trên JVM.

</details>

**4. Nêu 3 ưu điểm và 3 nhược điểm của Spring Boot.**

<details className="qa">
<summary>Xem đáp án</summary>

Ưu: (1) hệ sinh thái và cộng đồng lớn nhất Java; (2) năng suất cao nhờ starter, auto-configuration, server nhúng; (3) sẵn sàng production: Actuator, metrics, cấu hình ngoài, hỗ trợ test tốt.

Nhược: (1) nhiều "phép thuật" ngầm, khó debug khi không hiểu auto-configuration và proxy; (2) khởi động chậm, tốn RAM hơn các framework compile-time; (3) đường cong học tập dài, đặc biệt Spring Security; nâng cấp major version có thể tốn công.

</details>

**5. Khi nào bạn KHÔNG chọn Spring Boot?**

<details className="qa">
<summary>Xem đáp án</summary>

- Function serverless cần cold start vài chục mili giây và RAM rất thấp, team không muốn đánh đổi thời gian build native → Quarkus/Micronaut.
- Tool CLI nhỏ, script đơn giản — Spring là quá tải; dùng Java thuần hoặc Picocli.
- Tổ chức bắt buộc dùng chuẩn Jakarta EE trên app server có sẵn.
- Đội ngũ đã thành thạo stack khác (Go, Node.js) và bài toán không cần hệ sinh thái Java.

</details>

**6. Spring Boot 2 lên 3 có những thay đổi lớn nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- Yêu cầu **Java 17** tối thiểu, dựa trên Spring Framework 6.
- Chuyển từ `javax.*` sang **`jakarta.*`** (Jakarta EE 9/10) — đổi import cho Servlet, JPA, Validation.
- Hỗ trợ chính thức **GraalVM native image** qua Spring AOT.
- Observability chuyển sang **Micrometer Observation / Micrometer Tracing** (Spring Cloud Sleuth ngừng phát triển).
- Spring Security 6: bỏ `WebSecurityConfigurerAdapter`, dùng bean `SecurityFilterChain` + lambda DSL, `authorizeHttpRequests`, `requestMatchers`.
- File đăng ký auto-configuration đổi từ `spring.factories` sang `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`.

</details>
