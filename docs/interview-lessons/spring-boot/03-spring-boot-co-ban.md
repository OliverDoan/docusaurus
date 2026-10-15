---
sidebar_position: 3
title: "3. Spring Boot cơ bản"
---

# 3. Spring Boot cơ bản

## 1. Spring Boot Starters

Bài học: [1. Spring Boot Starters](../../spring-boot/03-spring-boot-co-ban/1_starters.md)

**1. Spring Boot Starter là gì? Vì sao cần nó?**

<details className="qa">
<summary>Xem đáp án</summary>

Starter là một dependency "gom nhóm" (thường chỉ có `pom.xml`) kéo theo bộ thư viện cần cho một tính năng, với phiên bản đã được kiểm thử tương thích. Nó giải quyết việc tự chọn từng thư viện và xung đột phiên bản. Ví dụ `spring-boot-starter-web` kéo Spring MVC, Jackson, Tomcat nhúng, validation API. Kết hợp với auto-configuration, thêm starter là có ngay tính năng chạy được.

</details>

**2. Vì sao trong `pom.xml` Spring Boot thường không ghi `version` cho dependency?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì phiên bản được quản lý tập trung bởi BOM `spring-boot-dependencies` (thông qua parent `spring-boot-starter-parent` hoặc import BOM trong `dependencyManagement`). Maven lấy phiên bản từ `dependencyManagement` khi dependency không ghi version. Lợi ích: mọi thư viện đồng bộ với phiên bản Spring Boot đã kiểm thử; nâng cấp Boot là nâng cả bộ.

</details>

**3. `spring-boot-starter-parent` và import BOM `spring-boot-dependencies` khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`spring-boot-starter-parent` kế thừa `spring-boot-dependencies` (quản lý phiên bản) **và** thêm cấu hình build mặc định: Java version qua `java.version`, encoding UTF-8, cấu hình `spring-boot-maven-plugin`, resource filtering cho `application*.yml`, các plugin khác. Import BOM chỉ lấy phần quản lý phiên bản — dùng khi dự án đã có parent riêng (của công ty) vì Maven chỉ cho một parent.

</details>

**4. Làm sao thay Tomcat bằng Jetty hoặc Undertow?**

<details className="qa">
<summary>Xem đáp án</summary>

Trong dependency `spring-boot-starter-web`, thêm `exclusion` cho `spring-boot-starter-tomcat`, sau đó thêm `spring-boot-starter-jetty` (hoặc `spring-boot-starter-undertow`). Auto-configuration thấy class Jetty trên classpath và không thấy Tomcat sẽ tự dựng Jetty. Lưu ý: hỗ trợ Undertow đã bị bỏ ở Spring Boot 4 vì Undertow chưa hỗ trợ Servlet 6.1.

</details>

**5. Cần vá lỗ hổng một thư viện (ví dụ driver PostgreSQL) mà chưa có bản Spring Boot mới, làm thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Ghi đè phiên bản qua thuộc tính mà BOM định nghĩa, ví dụ `<postgresql.version>` trong `properties` (Maven) hoặc `extra["postgresql.version"]` (Gradle với plugin dependency-management). Không ghi version trực tiếp ở dependency để tránh lệch với các module khác dùng chung. Chỉ nên nâng bản vá (patch/minor tương thích), chạy lại test, và gỡ ghi đè khi nâng Spring Boot.

</details>

**6. Đặt tên starter tự viết thế nào cho đúng quy ước?**

<details className="qa">
<summary>Xem đáp án</summary>

Tiền tố `spring-boot-starter-*` dành riêng cho starter chính thức của Spring Boot. Starter bên thứ ba/nội bộ đặt dạng `tenduan-spring-boot-starter` (ví dụ `acme-audit-spring-boot-starter`). Thông thường tách hai module: `...-spring-boot-autoconfigure` chứa code auto-configuration và `...-spring-boot-starter` chỉ là pom kéo module autoconfigure cùng thư viện cần thiết.

</details>

---

## 2. Auto-configuration

Bài học: [2. Auto-configuration](../../spring-boot/03-spring-boot-co-ban/2_autoconfiguration.md)

**1. Auto-configuration trong Spring Boot hoạt động thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`@EnableAutoConfiguration` (nằm trong `@SpringBootApplication`) import `AutoConfigurationImportSelector`. Selector đọc danh sách class từ các file `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` trên classpath, loại các class bị exclude, rồi đánh giá điều kiện `@Conditional*` của từng class (có trên classpath không, đã có bean chưa, thuộc tính bật chưa...). Auto-config được xử lý sau cấu hình người dùng (deferred), nên `@ConditionalOnMissingBean` thấy bean người dùng và lùi lại. Class khớp điều kiện được đăng ký như class `@Configuration`.

</details>

**2. `@SpringBootApplication` gồm những annotation nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`@SpringBootConfiguration` (một dạng `@Configuration`), `@EnableAutoConfiguration` (bật auto-config, kèm `@AutoConfigurationPackage` ghi nhớ package gốc), `@ComponentScan` (quét package chứa class main và package con, có filter loại auto-config). Có thuộc tính `exclude`, `excludeName`, `scanBasePackages`, `proxyBeanMethods`.

</details>

**3. Làm sao biết auto-configuration nào đang được áp dụng và vì sao một cái không được áp dụng?**

<details className="qa">
<summary>Xem đáp án</summary>

Chạy ứng dụng với `--debug` hoặc `debug=true` để in **Conditions Evaluation Report**: Positive matches (đã áp dụng + lý do), Negative matches (không áp dụng + điều kiện không khớp), Exclusions, Unconditional classes. Khi app đang chạy có thể dùng Actuator endpoint `/actuator/conditions` và `/actuator/beans`.

</details>

**4. Làm sao ghi đè một bean do auto-configuration tạo?**

<details className="qa">
<summary>Xem đáp án</summary>

Theo thứ tự ưu tiên: (1) chỉnh thuộc tính `application.yml` mà auto-config đọc; (2) dùng bean `*Customizer` do Boot cung cấp (ví dụ `Jackson2ObjectMapperBuilderCustomizer`, `WebServerFactoryCustomizer`); (3) tự khai báo bean cùng kiểu — auto-config có `@ConditionalOnMissingBean` sẽ lùi lại; (4) exclude hẳn auto-config qua `exclude` hoặc `spring.autoconfigure.exclude`.

</details>

**5. Sự khác nhau giữa `spring.factories` và `AutoConfiguration.imports`?**

<details className="qa">
<summary>Xem đáp án</summary>

Trước Boot 2.7, auto-config được đăng ký dưới key `org.springframework.boot.autoconfigure.EnableAutoConfiguration` trong `META-INF/spring.factories` (file chung cho nhiều loại extension). Boot 2.7 giới thiệu file riêng `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` (mỗi dòng một class) và annotation `@AutoConfiguration`. Từ Boot 3.0, đăng ký auto-config qua `spring.factories` không còn được hỗ trợ; `spring.factories` vẫn dùng cho các extension khác như `ApplicationListener`, `EnvironmentPostProcessor`.

</details>

**6. Vì sao thêm `@EnableWebMvc` vào ứng dụng Spring Boot lại làm mất cấu hình mặc định?**

<details className="qa">
<summary>Xem đáp án</summary>

`@EnableWebMvc` import `DelegatingWebMvcConfiguration` (một `WebMvcConfigurationSupport`). `WebMvcAutoConfiguration` có điều kiện `@ConditionalOnMissingBean(WebMvcConfigurationSupport.class)`, nên khi thấy bean này nó lùi lại hoàn toàn — mất static resource mặc định, converter, formatter Boot cấu hình sẵn. Cách đúng để tuỳ biến: implement `WebMvcConfigurer` trong class `@Configuration` không có `@EnableWebMvc`.

</details>

**7. Viết một auto-configuration cho thư viện nội bộ cần những bước nào?**

<details className="qa">
<summary>Xem đáp án</summary>

(1) Tạo class `@ConfigurationProperties` cho cấu hình; (2) tạo class `@AutoConfiguration` với điều kiện phù hợp (`@ConditionalOnClass`, `@ConditionalOnProperty`) và bean có `@ConditionalOnMissingBean` để người dùng ghi đè được; (3) đăng ký class trong `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`; (4) đặt ở package không bị component scan; (5) viết test bằng `ApplicationContextRunner`; (6) đóng gói kèm module starter và `spring-boot-configuration-processor` để có metadata gợi ý thuộc tính.

</details>

---

## 3. Embedded Server

Bài học: [3. Embedded Server](../../spring-boot/03-spring-boot-co-ban/3_embedded-server.md)

**1. Embedded server là gì? Lợi ích so với deploy WAR truyền thống?**

<details className="qa">
<summary>Xem đáp án</summary>

Embedded server là web server (Tomcat, Jetty, Undertow, Netty) được nhúng như một thư viện trong ứng dụng; ứng dụng tự khởi động server trong `main()` và đóng gói thành một fat jar chạy bằng `java -jar`. Lợi ích: không cần cài/cấu hình server riêng; phiên bản server đi theo ứng dụng nên dev và prod giống nhau; mỗi app một process cô lập; rất hợp container, microservices, CI/CD; cấu hình server nằm trong source code (`server.*`).

</details>

**2. Spring Boot hỗ trợ những embedded server nào? Đổi server thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Với Servlet stack: Tomcat (mặc định), Jetty, Undertow (Boot 3; bị bỏ ở Boot 4). Với reactive stack: Reactor Netty (mặc định), cũng có thể dùng Tomcat, Jetty. Đổi bằng cách exclude `spring-boot-starter-tomcat` khỏi `spring-boot-starter-web` và thêm starter của server mới; auto-configuration (`ServletWebServerFactoryAutoConfiguration`) dựa vào class trên classpath để tạo factory tương ứng.

</details>

**3. Fat jar của Spring Boot khác jar thường thế nào? Vì sao chạy được bằng `java -jar`?**

<details className="qa">
<summary>Xem đáp án</summary>

Fat jar chứa code (`BOOT-INF/classes`), mọi thư viện phụ thuộc dạng jar lồng (`BOOT-INF/lib`), và Spring Boot Loader. `MANIFEST.MF` có `Main-Class` trỏ tới `JarLauncher` (Boot 3.2+: `org.springframework.boot.loader.launch.JarLauncher`) và `Start-Class` trỏ tới class main của bạn. JDK không đọc được jar lồng nhau nên `JarLauncher` tạo ClassLoader riêng nạp các jar trong `BOOT-INF/lib`, rồi gọi `main()` của `Start-Class`. File được tạo bởi goal `repackage` của `spring-boot-maven-plugin` (hoặc task `bootJar` của Gradle).

</details>

**4. Graceful shutdown là gì, cấu hình thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi nhận tín hiệu tắt (SIGTERM), server ngừng nhận request mới nhưng chờ các request đang xử lý hoàn tất (trong giới hạn thời gian) rồi mới đóng context. Cấu hình `server.shutdown=graceful` (mặc định từ Boot 3.4) và `spring.lifecycle.timeout-per-shutdown-phase=30s`. Trên Kubernetes cần kết hợp readiness probe (Actuator chuyển trạng thái readiness sang `REFUSING_TRAFFIC` khi bắt đầu tắt) và `terminationGracePeriodSeconds` đủ lớn để rolling update không làm rớt request.

</details>

**5. Muốn deploy Spring Boot dưới dạng WAR thì cần làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

(1) Đổi `packaging` thành `war`; (2) đánh dấu `spring-boot-starter-tomcat` là `provided` để không đóng gói server; (3) class main kế thừa `SpringBootServletInitializer` và override `configure()` để server ngoài khởi tạo được Spring context qua Servlet 3+ `ServletContainerInitializer`. Server ngoài phải hỗ trợ Jakarta Servlet phiên bản Boot yêu cầu (Boot 3 cần Tomcat 10.1+).

</details>

**6. Cấu hình thread pool của Tomcat ảnh hưởng hiệu năng thế nào? Virtual thread thay đổi điều gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Mỗi request Spring MVC chiếm một thread Tomcat (`server.tomcat.threads.max`, mặc định 200) cho đến khi xong. Nếu thread bị block lâu chờ I/O (DB, API ngoài), pool cạn và request mới phải đợi trong `accept-count`. Tăng thread giúp đến khi chạm giới hạn khác (DB pool, CPU, RAM). Với Java 21 và `spring.threads.virtual.enabled=true`, Tomcat dùng virtual thread cho mỗi request — rẻ hơn rất nhiều so với platform thread, nên chịu được nhiều request đồng thời đang chờ I/O mà vẫn giữ code blocking dễ đọc; tuy vậy vẫn cần giới hạn tài nguyên phía sau như DB pool.

</details>

---

## 4. Spring Boot Actuator

Bài học: [4. Spring Boot Actuator](../../spring-boot/03-spring-boot-co-ban/4_actuator.md)

**1. Spring Boot Actuator là gì? Kể tên vài endpoint quan trọng.**

<details className="qa">
<summary>Xem đáp án</summary>

Actuator là module cung cấp tính năng sẵn sàng cho production: giám sát và quản lý ứng dụng qua HTTP hoặc JMX. Endpoint quan trọng: `health` (trạng thái, liveness/readiness), `info` (thông tin build/git), `metrics` và `prometheus` (số liệu), `loggers` (xem/đổi log level), `env` và `configprops` (cấu hình), `beans`, `conditions`, `mappings`, `threaddump`, `heapdump`, `shutdown`.

</details>

**2. Mặc định endpoint nào được expose qua web? Làm sao expose thêm?**

<details className="qa">
<summary>Xem đáp án</summary>

Mặc định chỉ `health` được expose qua HTTP (từ Boot 2.5; trước đó gồm cả `info`). Expose thêm bằng `management.endpoints.web.exposure.include=health,info,prometheus` và loại trừ bằng `exclude`. Cần phân biệt: endpoint được bật (tồn tại) và được expose (đi ra ngoài qua HTTP/JMX) là hai cấu hình khác nhau.

</details>

**3. Bảo mật Actuator endpoint trên production thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Chỉ expose endpoint cần thiết; tách cổng quản trị `management.server.port` và chỉ mở trong mạng nội bộ; dùng Spring Security với `SecurityFilterChain` riêng dùng `EndpointRequest.toAnyEndpoint()`, cho phép công khai `health`/`info`, yêu cầu role cho phần còn lại; đặt `management.endpoint.health.show-details=when-authorized`; tuyệt đối không mở `heapdump`, `env`, `shutdown` ra Internet vì có thể lộ secret hoặc cho phép tắt ứng dụng.

</details>

**4. Liveness và Readiness probe khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Liveness trả lời "ứng dụng còn sống, không bị treo không?" — nếu fail, Kubernetes restart container. Readiness trả lời "ứng dụng sẵn sàng nhận traffic chưa?" — nếu fail, Kubernetes tạm gỡ pod khỏi Service, không restart. Spring Boot cung cấp `/actuator/health/liveness` và `/actuator/health/readiness` (dựa trên `ApplicationAvailability`). Phụ thuộc ngoài (DB) chỉ nên đưa vào readiness, không đưa vào liveness để tránh restart dây chuyền.

</details>

**5. Viết custom health check thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Tạo bean implement `HealthIndicator` (hoặc `ReactiveHealthIndicator` cho WebFlux), override `health()` trả về `Health.up()`, `Health.down(ex)` hoặc `Health.status("TEN")` kèm `withDetail(...)`. Tên thành phần trong JSON là tên bean bỏ hậu tố `HealthIndicator`. Có thể nhóm vào health group (ví dụ readiness) qua `management.endpoint.health.group.*`, và khai báo thứ tự, mã HTTP cho trạng thái tuỳ biến. Lưu ý giữ health check nhanh, có timeout để không làm treo probe.

</details>

**6. Micrometer là gì? Counter, Gauge, Timer khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Micrometer là facade metric trung lập nhà cung cấp (giống SLF4J cho logging): code dùng một API, chọn registry để xuất ra Prometheus, Datadog, CloudWatch, OTLP... `Counter` là giá trị chỉ tăng (số đơn, số lỗi); `Gauge` là giá trị tức thời có thể tăng giảm, được đọc khi thu thập (kích thước hàng đợi); `Timer` đo số lần và tổng/phân phối thời gian (latency), hỗ trợ percentile/histogram. Ngoài ra có `DistributionSummary` cho phân phối giá trị không phải thời gian.

</details>

**7. High cardinality trong metric là gì, vì sao nguy hiểm?**

<details className="qa">
<summary>Xem đáp án</summary>

Là khi tag của metric có quá nhiều giá trị khác nhau (userId, orderId, URL thô chứa ID, message lỗi). Mỗi tổ hợp tag tạo một time series riêng, làm bộ nhớ ứng dụng và Prometheus tăng không giới hạn, truy vấn chậm, thậm chí sập hệ thống giám sát. Tránh bằng cách chỉ dùng tag có tập giá trị nhỏ cố định, dùng URI template thay URL thật, và có thể đặt `MeterFilter` giới hạn số giá trị tag.

</details>
