---
sidebar_position: 2
title: "2. Spring Core"
---

# 2. Spring Core

## 1. IoC Container

Bài học: [1. IoC Container](../../spring-boot/02-spring-core/1_ioc-container.md)

**1. IoC Container trong Spring làm những gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Đọc metadata cấu hình (annotation, Java config, XML) thành bean definition; khởi tạo bean theo đúng thứ tự phụ thuộc; tiêm phụ thuộc (DI); áp dụng các `BeanPostProcessor` (xử lý `@Autowired`, tạo proxy AOP cho `@Transactional`...); gọi callback khởi tạo và huỷ; cung cấp thêm event, `Environment`, i18n, resource loading. Code ứng dụng chỉ khai báo, không tự tạo và nối object.

</details>

**2. Mô tả quá trình khởi động của `ApplicationContext`.**

<details className="qa">
<summary>Xem đáp án</summary>

Trong Spring Boot: `SpringApplication.run()` chuẩn bị `Environment` (đọc file cấu hình, profile, biến môi trường) → tạo `ApplicationContext` phù hợp → nạp bean definition (component scan, `@Bean`, auto-configuration) → gọi `refresh()`: chạy `BeanFactoryPostProcessor`, đăng ký `BeanPostProcessor`, khởi tạo mọi singleton không lazy (constructor, inject, init callback, bọc proxy) → khởi động web server nhúng → phát `ApplicationReadyEvent`, chạy `CommandLineRunner`/`ApplicationRunner`.

</details>

**3. Vì sao `ApplicationContext` tạo singleton ngay khi khởi động (eager)? Lợi gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Để **phát hiện lỗi cấu hình sớm** (fail fast): thiếu bean, sai thuộc tính, vòng tròn phụ thuộc, không kết nối được DB... đều làm app không lên, thay vì nổ ở request đầu tiên của người dùng. Ngoài ra request đầu không bị chậm vì phải khởi tạo. Có thể đổi bằng `@Lazy` cho từng bean hoặc `spring.main.lazy-initialization=true` toàn cục (khởi động nhanh hơn nhưng mất fail fast).

</details>

**4. `BeanFactoryPostProcessor` và `BeanPostProcessor` khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- `BeanFactoryPostProcessor` làm việc với **bean definition** (metadata), chạy **trước** khi bất kỳ bean thường nào được tạo. Ví dụ: thay placeholder `${...}`, xử lý class `@Configuration`.
- `BeanPostProcessor` làm việc với **instance bean**, chạy trước/sau bước init của **từng** bean, có thể trả về object khác (proxy). Ví dụ: xử lý `@Autowired`, `@PostConstruct`, tạo proxy AOP.

</details>

**5. Vì sao không nên inject `ApplicationContext` rồi gọi `getBean()` trong service?**

<details className="qa">
<summary>Xem đáp án</summary>

Đó là mẫu Service Locator: phụ thuộc bị giấu trong thân method thay vì lộ ra ở constructor, khó đọc và khó test (phải mock cả context), dính code nghiệp vụ vào API Spring, lỗi thiếu bean chỉ lộ lúc runtime khi chạy tới dòng đó. Thay bằng constructor injection; nếu cần chọn động thì inject `Map<String, T>` hoặc `List<T>`, hoặc `ObjectProvider<T>` khi cần lấy lười/prototype.

</details>

**6. Làm sao chạy một đoạn code ngay sau khi ứng dụng Spring Boot khởi động xong?**

<details className="qa">
<summary>Xem đáp án</summary>

- Implement `CommandLineRunner` (nhận `String... args`) hoặc `ApplicationRunner` (nhận `ApplicationArguments`) và đánh `@Component`; có thể sắp thứ tự bằng `@Order`.
- Hoặc `@EventListener(ApplicationReadyEvent.class)` — chạy khi app đã sẵn sàng phục vụ.
- `@PostConstruct` chạy sớm hơn — ngay sau khi **bean đó** được tiêm phụ thuộc, lúc context chưa khởi động xong, nên không phù hợp cho việc cần toàn bộ ứng dụng sẵn sàng.

</details>

---

## 2. Dependency Injection

Bài học: [2. Dependency Injection](../../spring-boot/02-spring-core/2_dependency-injection.md)

**1. Có mấy kiểu dependency injection trong Spring? Vì sao constructor injection được khuyến nghị?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba kiểu: constructor, setter, field. Constructor injection được khuyến nghị vì: field có thể `final` (bất biến, thread-safe khi publish); phụ thuộc bắt buộc được đảm bảo — object không thể tồn tại ở trạng thái thiếu phụ thuộc; unit test chỉ cần `new` với mock, không cần Spring hay reflection; constructor quá dài cảnh báo class vi phạm Single Responsibility; vòng tròn phụ thuộc lộ ra ngay lúc khởi động. Từ Spring 4.3, class chỉ có một constructor không cần `@Autowired`.

</details>

**2. Có hai bean cùng implement một interface, inject sẽ lỗi gì và xử lý thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Lỗi `NoUniqueBeanDefinitionException` khi khởi động. Cách xử lý: đánh `@Primary` lên bean mặc định; dùng `@Qualifier("tenBean")` tại điểm inject để chọn đích danh (thắng `@Primary`); đặt tên tham số trùng tên bean (dựa vào `-parameters`, không khuyến khích); hoặc inject `List`/`Map` nếu thực sự cần nhiều bean.

</details>

**3. `@Autowired` và `@Inject`, `@Resource` khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- `@Autowired` (Spring): resolve **theo kiểu** trước, sau đó qualifier/primary/tên; có thuộc tính `required`.
- `@Inject` (JSR-330, `jakarta.inject`): tương tự `@Autowired` nhưng không có `required`; kết hợp `@Named` để chọn tên. Cần thêm dependency `jakarta.inject-api`.
- `@Resource` (`jakarta.annotation`): resolve **theo tên** trước (thuộc tính `name` hoặc tên field), không thấy mới theo kiểu; không dùng được trên constructor.

Trong dự án Spring, thường chỉ cần constructor injection không annotation.

</details>

**4. Vì sao field `@Autowired` bị `null`?**

<details className="qa">
<summary>Xem đáp án</summary>

Các nguyên nhân phổ biến: (1) object được tạo bằng `new` chứ không lấy từ container; (2) truy cập field trong constructor — field injection chạy sau constructor; (3) field là `static`; (4) class không phải bean (quên annotation hoặc không được scan) nhưng vẫn có `@Autowired`. Cách phòng tránh tốt nhất: dùng constructor injection — nếu không có bean, ứng dụng không khởi động được thay vì `null` lúc runtime.

</details>

**5. Circular dependency là gì? Spring Boot xử lý thế nào và bạn sửa ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Là khi bean A phụ thuộc B và B (trực tiếp hoặc gián tiếp) phụ thuộc A. Với constructor injection, Spring không thể tạo bean nào trước nên báo lỗi. Với setter/field, Spring Framework có cơ chế cache tham chiếu sớm (3 tầng cache singleton) để giải, nhưng Spring Boot 2.6+ mặc định cấm (`spring.main.allow-circular-references=false`). Sửa đúng: tách logic dùng chung ra bean thứ ba, dùng event, hoặc đảo hướng phụ thuộc qua interface; chữa cháy: `@Lazy` tại điểm inject để nhận proxy lười.

</details>

**6. Inject bean tuỳ chọn (có thể không tồn tại) như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- `Optional<T>` trong constructor.
- `ObjectProvider<T>` với `getIfAvailable()`, `ifAvailable(...)` — còn hỗ trợ lấy lười và lấy instance prototype mới.
- `@Autowired(required = false)` trên setter/field.
- Tham số `@Nullable`.

`ObjectProvider` linh hoạt nhất và hay được dùng trong auto-configuration.

</details>

**7. Inject `List` của một interface thì thứ tự các phần tử được quyết định thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Mặc định theo thứ tự đăng ký bean definition (không nên dựa vào). Để kiểm soát, đánh `@Order(n)` lên class bean hoặc implement `Ordered` — số nhỏ đứng trước. Hữu ích cho chuỗi validator, filter, handler theo kiểu Chain of Responsibility.

</details>

---

## 3. Cấu hình Spring

Bài học: [3. Cấu hình Spring](../../spring-boot/02-spring-core/3_configuration.md)

**1. So sánh cấu hình XML, Java config và annotation trong Spring.**

<details className="qa">
<summary>Xem đáp án</summary>

- **XML**: tách cấu hình khỏi code, nhưng dài dòng, không type-safe, lỗi tên class chỉ lộ lúc chạy. Hiện chỉ còn ở dự án cũ.
- **Annotation** (`@Component`, `@Service`...) + component scan: gọn, dùng cho class do mình viết.
- **Java config** (`@Configuration` + `@Bean`): type-safe, refactor được, có thể viết logic tạo bean; dùng cho class thư viện bên thứ ba hoặc cần khởi tạo phức tạp.

Spring Boot hiện đại dùng annotation + Java config + auto-configuration.

</details>

**2. `@Value` và `@ConfigurationProperties` khác nhau thế nào? Khi nào dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`@Value` inject từng giá trị, hỗ trợ SpEL, phù hợp 1–2 thuộc tính lẻ. `@ConfigurationProperties` bind cả nhóm thuộc tính theo prefix vào một object (record/class) type-safe, hỗ trợ cấu trúc lồng, `List`, `Map`, `Duration`, relaxed binding đầy đủ, validate với `@Validated`, gợi ý IDE qua configuration processor. Khi có nhiều thuộc tính liên quan (cấu hình mail, client API ngoài), dùng `@ConfigurationProperties`.

</details>

**3. Thứ tự ưu tiên của các nguồn cấu hình trong Spring Boot?**

<details className="qa">
<summary>Xem đáp án</summary>

Từ cao đến thấp (rút gọn): thuộc tính trong test → tham số dòng lệnh → `SPRING_APPLICATION_JSON` → system properties `-D` → biến môi trường → file profile ngoài jar → file profile trong jar → `application.yml` ngoài jar → `application.yml` trong jar → default properties. Quy tắc nhớ: càng "gần lúc chạy" và càng cụ thể (profile) thì càng ưu tiên. Nhờ vậy cùng một jar có thể chạy mọi môi trường bằng cách đặt biến môi trường.

</details>

**4. Profile là gì? Làm sao để một bean chỉ tồn tại ở môi trường dev?**

<details className="qa">
<summary>Xem đáp án</summary>

Profile là nhãn môi trường để bật/tắt cấu hình và bean. Đánh `@Profile("dev")` lên class `@Component` hoặc method `@Bean` → bean chỉ được tạo khi profile `dev` active. Hỗ trợ biểu thức: `!dev`, `dev | test`, `prod & eu`. Cấu hình riêng đặt trong `application-dev.yml`. Bật profile bằng `spring.profiles.active` (tham số, biến môi trường `SPRING_PROFILES_ACTIVE`), trong test dùng `@ActiveProfiles`.

</details>

**5. `@Configuration` khác gì so với khai báo `@Bean` trong một class `@Component`?**

<details className="qa">
<summary>Xem đáp án</summary>

Class `@Configuration` (mặc định `proxyBeanMethods = true`) được CGLIB proxy: khi một method `@Bean` gọi method `@Bean` khác, proxy chặn và trả về bean singleton đã có trong container. Trong `@Component` (lite mode) hoặc `@Configuration(proxyBeanMethods = false)`, lời gọi đó là gọi method Java bình thường → tạo object mới mỗi lần, phá vỡ singleton. Lite mode khởi động nhanh hơn (không cần proxy), Spring Boot dùng nó trong auto-configuration; khi dùng lite mode hãy nhận phụ thuộc qua tham số method.

</details>

**6. Làm sao quản lý secret (mật khẩu DB, API key) trong ứng dụng Spring Boot?**

<details className="qa">
<summary>Xem đáp án</summary>

Không commit giá trị thật vào file cấu hình. Trong `application.yml` dùng placeholder `${DB_PASSWORD}`, giá trị thật cung cấp qua biến môi trường (Kubernetes Secret, Docker secret), hoặc tích hợp secret manager (HashiCorp Vault qua Spring Cloud Vault, AWS Secrets Manager, Spring Cloud Config có mã hoá). Thêm validation khi khởi động để fail fast nếu thiếu secret. Cũng nên tránh in toàn bộ `Environment` ra log hoặc mở endpoint Actuator `/env` công khai.

</details>

---

## 4. Annotation quan trọng

Bài học: [4. Annotation quan trọng](../../spring-boot/02-spring-core/4_annotations.md)

**1. `@Component`, `@Service`, `@Repository`, `@Controller` khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả bốn đều đăng ký bean qua component scan (`@Service`, `@Repository`, `@Controller` được meta-annotate bởi `@Component`). Khác biệt: `@Service` chỉ mang ý nghĩa tầng nghiệp vụ; `@Repository` thêm dịch exception đặc thù của công nghệ lưu trữ (SQLException, JPA exception) sang hệ `DataAccessException` thống nhất; `@Controller` được Spring MVC nhận diện là handler web (cùng `@RequestMapping`). Dùng đúng stereotype giúp code rõ tầng và cho phép AOP nhắm theo stereotype.

</details>

**2. `@Component` và `@Bean` khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`@Component` đánh trên **class**, Spring tự phát hiện qua component scan và tự gọi constructor — dùng cho class bạn viết. `@Bean` đánh trên **method** trong class `@Configuration`; bạn tự viết code tạo object và trả về — dùng cho class thư viện (không sửa source để thêm annotation được), khi cần logic khởi tạo phức tạp, hoặc cần nhiều bean cùng class với cấu hình khác nhau.

</details>

**3. `@RestController` khác `@Controller` thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`@RestController` = `@Controller` + `@ResponseBody`. Với `@Controller`, giá trị trả về của method mặc định được hiểu là tên view (Thymeleaf/JSP) để render HTML. Với `@RestController`, giá trị trả về được ghi thẳng vào response body qua `HttpMessageConverter` (thường là JSON bằng Jackson). REST API dùng `@RestController`.

</details>

**4. `@PostConstruct` dùng để làm gì? Khác constructor thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`@PostConstruct` đánh dấu method chạy **sau khi** bean được tạo và **đã tiêm xong mọi phụ thuộc** (kể cả field/setter injection), trước khi bean được đưa vào sử dụng. Constructor chạy trước field/setter injection nên chưa dùng được các phụ thuộc đó. Dùng để khởi tạo cache, kiểm tra cấu hình. Ở Spring Boot 3 annotation nằm trong `jakarta.annotation`. Với constructor injection, có thể làm việc khởi tạo ngay trong constructor, nhưng tránh tác vụ nặng hoặc gọi ra ngoài (I/O) quá lâu vì làm chậm khởi động.

</details>

**5. `@Conditional` dùng để làm gì? Kể vài biến thể của Spring Boot.**

<details className="qa">
<summary>Xem đáp án</summary>

`@Conditional(SomeCondition.class)` chỉ đăng ký bean/class cấu hình khi `Condition.matches()` trả về `true`. Spring Boot xây auto-configuration hoàn toàn dựa trên nó với các biến thể: `@ConditionalOnClass`, `@ConditionalOnMissingClass`, `@ConditionalOnBean`, `@ConditionalOnMissingBean`, `@ConditionalOnProperty`, `@ConditionalOnWebApplication`, `@ConditionalOnResource`, `@ConditionalOnExpression`. `@Profile` thực chất cũng được hiện thực bằng `@Conditional`.

</details>

**6. `@Lazy` hoạt động thế nào? Có rủi ro gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Trên class/method `@Bean`: bean không được tạo lúc khởi động mà khi lần đầu được yêu cầu. Tại điểm inject: Spring tiêm một proxy, bean thật chỉ resolve khi gọi method đầu tiên — cũng là cách phá vòng tròn phụ thuộc. Rủi ro: lỗi cấu hình của bean chỉ lộ ra lúc runtime (mất fail fast), request đầu tiên bị chậm. Lazy toàn cục (`spring.main.lazy-initialization=true`) hữu ích khi dev để khởi động nhanh, nên cân nhắc kỹ ở production.

</details>

---

## 5. Bean Scope và vòng đời Bean

Bài học: [5. Bean Scope và vòng đời Bean](../../spring-boot/02-spring-core/5_bean-scope.md)

**1. Spring có những bean scope nào? Mặc định là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`singleton` (mặc định — một instance mỗi container), `prototype` (mới mỗi lần yêu cầu), và các scope web: `request`, `session`, `application`, `websocket`. Có thể tự định nghĩa scope bằng cách implement interface `Scope` và đăng ký vào container (ví dụ Spring Cloud có `refresh` scope).

</details>

**2. Bean singleton có thread-safe không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không tự động. Spring chỉ đảm bảo một instance; nhiều thread request gọi đồng thời vào cùng instance đó. Nếu bean có trạng thái thay đổi được (field mutable) thì có race condition. Cách đảm bảo: thiết kế stateless (chỉ giữ phụ thuộc `final`), dùng biến cục bộ, cấu trúc bất biến hoặc thread-safe (`ConcurrentHashMap`, `AtomicXxx`), hoặc đổi scope nếu trạng thái thực sự gắn với request/session.

</details>

**3. Inject bean prototype vào singleton thì chuyện gì xảy ra? Cách khắc phục?**

<details className="qa">
<summary>Xem đáp án</summary>

Prototype chỉ được tạo một lần — lúc singleton được tạo và inject — nên singleton dùng mãi cùng một instance, mất ý nghĩa prototype. Khắc phục: inject `ObjectProvider<T>` (hoặc `jakarta.inject.Provider<T>`) và gọi `getObject()` mỗi khi cần; dùng `@Lookup` method injection; hoặc scoped proxy (`proxyMode = TARGET_CLASS`) — lưu ý mỗi lời gọi method trên proxy tạo instance mới.

</details>

**4. Làm sao inject bean request scope vào singleton controller?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng scoped proxy: `@RequestScope` đã mặc định `proxyMode = ScopedProxyMode.TARGET_CLASS`. Spring tiêm vào singleton một proxy CGLIB; mỗi lời gọi method trên proxy, nó tra `RequestAttributes` của thread hiện tại để lấy (hoặc tạo) instance gắn với request đó. Lưu ý chỉ dùng được trong thread đang xử lý request.

</details>

**5. Mô tả vòng đời của một bean Spring.**

<details className="qa">
<summary>Xem đáp án</summary>

Đọc bean definition → khởi tạo (constructor) → inject phụ thuộc (setter/field) → gọi các `Aware` (`BeanNameAware`, `BeanFactoryAware`, `ApplicationContextAware`) → `BeanPostProcessor.postProcessBeforeInitialization` → init callback (`@PostConstruct`, `InitializingBean.afterPropertiesSet`, `initMethod`) → `BeanPostProcessor.postProcessAfterInitialization` (nơi tạo proxy AOP) → bean được sử dụng → khi đóng context: `@PreDestroy`, `DisposableBean.destroy`, `destroyMethod` (chỉ cho singleton và các scope được container quản lý).

</details>

**6. Vì sao Spring không gọi `@PreDestroy` cho bean prototype?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì sau khi tạo và giao instance prototype cho bên yêu cầu, container không giữ tham chiếu đến nó nữa (nếu giữ sẽ gây rò rỉ bộ nhớ khi tạo nhiều). Container không biết khi nào bạn dùng xong, nên trách nhiệm giải phóng tài nguyên thuộc về code dùng nó — ví dụ implement `AutoCloseable` và dùng try-with-resources.

</details>

**7. Singleton của Spring khác Singleton pattern của GoF thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Singleton GoF đảm bảo một instance **mỗi ClassLoader** bằng constructor private + static field, khó test và khó thay thế. Singleton của Spring là **một instance mỗi container cho mỗi bean definition**: class vẫn có constructor public, có thể tạo nhiều bean cùng class với tên khác nhau, hoặc nhiều container khác nhau; dễ test vì có thể `new` trực tiếp.

</details>

---

## 6. Spring AOP

Bài học: [6. Spring AOP](../../spring-boot/02-spring-core/6_aop.md)

**1. AOP là gì? Giải thích aspect, advice, pointcut, join point.**

<details className="qa">
<summary>Xem đáp án</summary>

AOP là kỹ thuật tách các mối quan tâm cắt ngang (logging, transaction, security, cache) khỏi logic nghiệp vụ. **Aspect** là module chứa logic cắt ngang. **Join point** là điểm trong lúc chạy có thể chèn logic — Spring AOP chỉ hỗ trợ lời gọi method. **Advice** là hành động thực hiện tại join point cùng thời điểm (Before, AfterReturning, AfterThrowing, After, Around). **Pointcut** là biểu thức chọn tập join point mà advice áp dụng. **Weaving** là quá trình gắn aspect vào target — Spring làm lúc runtime bằng proxy.

</details>

**2. Spring AOP khác AspectJ thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Spring AOP: thuần Java, dựa trên proxy runtime, chỉ áp cho bean Spring, chỉ join point là lời gọi method public qua proxy, có bẫy self-invocation, đủ dùng cho đa số nhu cầu. AspectJ: weaving lúc compile/post-compile/load-time bằng cách sửa bytecode, hỗ trợ mọi join point (field, constructor, static, private, gọi nội bộ), hiệu năng tốt hơn, nhưng cần trình biên dịch `ajc` hoặc agent load-time. Spring AOP mượn cú pháp annotation của AspectJ.

</details>

**3. Vì sao `@Transactional` không hoạt động khi gọi method trong cùng class?**

<details className="qa">
<summary>Xem đáp án</summary>

`@Transactional` được hiện thực bằng proxy: bean khác inject được là proxy, proxy mở transaction rồi gọi target. Khi bên trong target gọi `this.otherMethod()`, lời gọi đi thẳng trên object target, không qua proxy, nên advice transaction không chạy (self-invocation). Cách sửa: tách method sang bean khác; tự inject proxy của chính mình (`@Lazy` hoặc `ObjectProvider`); dùng `TransactionTemplate`; hoặc dùng AspectJ mode. Lỗi tương tự với `@Async`, `@Cacheable`, `@Retryable`.

</details>

**4. JDK dynamic proxy và CGLIB proxy khác nhau thế nào? Spring Boot dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

JDK proxy tạo class implement các interface của target — yêu cầu target có interface, và proxy chỉ cast được về interface. CGLIB sinh subclass của target lúc runtime — không cần interface nhưng không proxy được class/method `final`. Spring Framework mặc định dùng JDK proxy khi bean có interface, ngược lại dùng CGLIB. Spring Boot đặt mặc định `spring.aop.proxy-target-class=true` nên luôn dùng CGLIB, tránh lỗi inject theo kiểu class cụ thể.

</details>

**5. `@Around` khác các advice khác thế nào? Cần lưu ý gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`@Around` nhận `ProceedingJoinPoint`, bao trọn lời gọi: có thể chạy code trước và sau, đổi tham số (`proceed(newArgs)`), đổi kết quả trả về, bắt/đổi exception, hoặc không gọi method thật (cache hit). Lưu ý: phải gọi `proceed()` và trả về kết quả của nó; khai báo `throws Throwable`; không nuốt exception; dùng advice "nhẹ" hơn (`@Before`, `@AfterReturning`) khi đủ nhu cầu cho rõ ý đồ.

</details>

**6. Những method nào Spring AOP không chặn được?**

<details className="qa">
<summary>Xem đáp án</summary>

Method `private`, `static`, `final` (với CGLIB), constructor, truy cập field; lời gọi nội bộ trong cùng object (self-invocation); method của object không phải bean Spring (tự `new`); với JDK proxy là method không có trong interface. Nếu cần các join point này, dùng AspectJ weaving.

</details>

**7. Nhiều aspect cùng áp vào một method thì thứ tự chạy thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Không xác định nếu không chỉ định. Dùng `@Order(n)` trên class aspect hoặc implement `Ordered`: giá trị nhỏ có độ ưu tiên cao hơn, chạy "bọc ngoài" — advice trước của nó chạy trước, advice sau của nó chạy sau cùng. Ví dụ muốn aspect retry bọc ngoài transaction (mỗi lần retry một transaction mới) thì đặt order của retry nhỏ hơn của transaction.

</details>
