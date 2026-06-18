---
sidebar_position: 10
title: "10. Spring nâng cao"
---

# Spring nâng cao

> *Các câu hỏi phỏng vấn chuyên sâu về hệ sinh thái Spring Boot 3, từ reactive programming, observability, đến bảo mật OAuth 2.1 và tối ưu native image với GraalVM.*

---

## Câu 1: Spring MVC và Spring WebFlux khác nhau thế nào? Khi nào chọn cái nào? `[Advanced]`

### Câu hỏi

> *"Hãy phân biệt Spring MVC và Spring WebFlux. Trong dự án thực tế, bạn sẽ chọn cái nào và dựa trên tiêu chí gì?"*

### Giải thích lý thuyết

**Spring MVC** xây dựng trên mô hình **blocking I/O** (I/O chặn luồng): mỗi HTTP request được xử lý bởi một thread riêng. Khi thread chờ database hoặc external service, nó bị block và không phục vụ được request khác. Mô hình này đơn giản, quen thuộc với phần lớn developer Java.

**Spring WebFlux** xây dựng trên **Reactive Streams** (luồng phản ứng) và mô hình **non-blocking I/O** (I/O không chặn luồng). Một số ít thread (event loop) xử lý hàng nghìn request đồng thời bằng cách đăng ký callback thay vì chờ đợi. WebFlux dùng **Project Reactor** làm thư viện reactive với hai kiểu chính: `Mono<T>` (0 hoặc 1 phần tử) và `Flux<T>` (0 đến N phần tử).

| Tiêu chí | Spring MVC | Spring WebFlux |
|---|---|---|
| Mô hình I/O | Blocking (chặn luồng) | Non-blocking (không chặn luồng) |
| Thread model | Thread-per-request | Event loop (ít thread) |
| API style | Imperative (mệnh lệnh) | Reactive / Functional |
| Độ phức tạp | Thấp, dễ debug | Cao hơn, stack trace khó đọc |
| Phù hợp | CRUD truyền thống, team quen thuộc | High-concurrency, streaming, I/O-intensive |
| Tích hợp JDBC | Tốt | Cần R2DBC (reactive JDBC) |

**Khi chọn Spring MVC:** hầu hết ứng dụng CRUD, team không có kinh nghiệm reactive, cần tích hợp thư viện blocking (JPA, JDBC truyền thống).

**Khi chọn WebFlux:** cần xử lý hàng chục nghìn concurrent connection, streaming data (Server-Sent Events, WebSocket), hoặc toàn bộ stack đã là reactive (R2DBC, reactive MongoDB).

### Code minh hoạ

```java
// --- Spring MVC (Blocking) ---
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    // Thread bị block khi userService.findById() chờ DB
    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        return userService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

// --- Spring WebFlux (Non-blocking) ---
@RestController
@RequestMapping("/api/users")
public class ReactiveUserController {

    private final ReactiveUserService userService;

    // Thread không bị block, trả về Mono để framework subscribe
    @GetMapping("/{id}")
    public Mono<ResponseEntity<User>> getUser(@PathVariable Long id) {
        return userService.findById(id)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    // Streaming: trả về stream liên tục dữ liệu
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<User> streamUsers() {
        return userService.findAll()
                .delayElements(Duration.ofMillis(100)); // mô phỏng delay
    }
}
```

### Đáp án mẫu

> "Spring MVC dùng mô hình blocking thread-per-request, đơn giản và phù hợp phần lớn ứng dụng. Spring WebFlux dùng non-blocking reactive model với ít thread hơn nhưng xử lý được nhiều concurrent request hơn. Tôi chọn MVC cho CRUD thông thường vì dễ maintain, và chọn WebFlux khi cần high-concurrency thực sự hoặc streaming data — nhưng cần lưu ý WebFlux yêu cầu toàn bộ stack phải reactive, không thể mix blocking code."

---

## Câu 2: Mono, Flux và backpressure trong Spring WebFlux là gì? `[Advanced]`

### Câu hỏi

> *"Giải thích Mono, Flux và cơ chế backpressure trong Project Reactor. Backpressure giải quyết vấn đề gì?"*

### Giải thích lý thuyết

**Mono** và **Flux** là hai kiểu **Publisher** (nhà phát) trong Project Reactor, triển khai chuẩn **Reactive Streams**:

- `Mono<T>`: phát ra **0 hoặc 1** phần tử rồi complete hoặc error. Tương đương `Optional` nhưng async.
- `Flux<T>`: phát ra **0 đến N** phần tử, có thể là stream vô hạn.

**Backpressure** (áp lực ngược) là cơ chế **Subscriber** (người tiêu thụ) thông báo cho Publisher biết nó có thể xử lý bao nhiêu phần tử tại một thời điểm. Điều này ngăn tình trạng **producer nhanh hơn consumer** dẫn đến tràn bộ nhớ (OutOfMemoryError).

Trong Reactive Streams, subscriber gọi `request(n)` để nói "tôi muốn nhận tối đa n phần tử". Publisher chỉ gửi đúng số lượng đó.

Các chiến lược xử lý backpressure trong Reactor:
- `onBackpressureBuffer()`: đệm phần tử chờ consumer sẵn sàng
- `onBackpressureDrop()`: bỏ qua phần tử khi consumer quá tải
- `onBackpressureLatest()`: chỉ giữ phần tử mới nhất
- `onBackpressureError()`: phát ra lỗi khi bị quá tải

### Code minh hoạ

```java
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

public class ReactorDemo {

    // Mono: 0 hoặc 1 phần tử
    public Mono<User> findUserById(Long id) {
        return Mono.fromCallable(() -> userRepository.findById(id))
                .subscribeOn(Schedulers.boundedElastic()) // chạy trên thread pool riêng
                .map(opt -> opt.orElseThrow(() -> new UserNotFoundException(id)));
    }

    // Flux: stream nhiều phần tử
    public Flux<User> findAllUsers() {
        return Flux.fromIterable(userRepository.findAll())
                .filter(user -> user.isActive())
                .map(this::toDto);
    }

    // Backpressure: producer nhanh, consumer chậm
    public void demonstrateBackpressure() {
        Flux.range(1, 1000)
                .onBackpressureBuffer(100) // đệm tối đa 100 phần tử
                .publishOn(Schedulers.single())
                .subscribe(
                    item -> {
                        // mô phỏng consumer chậm
                        try { Thread.sleep(10); } catch (InterruptedException e) {}
                        System.out.println("Processed: " + item);
                    },
                    error -> System.err.println("Error: " + error.getMessage())
                );
    }

    // Kết hợp Mono và Flux
    public Flux<Order> getOrdersForUser(Long userId) {
        return findUserById(userId)           // Mono<User>
                .flatMapMany(user ->           // chuyển sang Flux
                    orderService.findByUser(user)
                );
    }
}
```

### Đáp án mẫu

> "Mono đại diện cho 0 hoặc 1 kết quả async, Flux đại diện cho stream 0 đến N phần tử. Backpressure là cơ chế subscriber báo cho publisher biết tốc độ tiêu thụ, tránh trường hợp producer tạo data nhanh hơn consumer xử lý được — điều này đặc biệt quan trọng khi streaming từ database hoặc message queue. Reactor cung cấp các chiến lược như buffer, drop, hoặc error khi backpressure xảy ra."

---

## Câu 3: Testcontainers cải thiện integration testing như thế nào? `[Intermediate]`

### Câu hỏi

> *"Testcontainers là gì và nó giải quyết vấn đề gì mà H2 in-memory database không làm được?"*

### Giải thích lý thuyết

**Testcontainers** là thư viện Java cho phép khởi động **Docker container thực** (PostgreSQL, Redis, Kafka, v.v.) trong quá trình chạy test. Container tự động start trước test và stop sau khi test hoàn thành.

**Vấn đề Testcontainers giải quyết:**

1. **Dialect mismatch (không tương thích cú pháp):** H2 hỗ trợ cú pháp SQL riêng, nhiều tính năng của PostgreSQL/MySQL không có trong H2 (window functions, JSON operators, specific types). Test pass với H2 nhưng fail ở production.

2. **Feature parity (tính năng đầy đủ):** Test với database thực giúp phát hiện lỗi liên quan đến constraints, indexes, triggers, stored procedures.

3. **Isolation (cô lập):** Mỗi test suite có container riêng, không ảnh hưởng lẫn nhau.

Spring Boot 3.1+ tích hợp Testcontainers trực tiếp qua `@ServiceConnection`, giúp tự động cấu hình connection mà không cần viết properties thủ công.

### Code minh hoạ

```java
// pom.xml dependency
// <dependency>
//   <groupId>org.springframework.boot</groupId>
//   <artifactId>spring-boot-testcontainers</artifactId>
//   <scope>test</scope>
// </dependency>

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@Testcontainers
class UserRepositoryIntegrationTest {

    // @ServiceConnection tự động cấu hình DataSource từ container này
    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres =
            new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldSaveAndRetrieveUser() {
        // Chạy trên PostgreSQL thực, không phải H2
        User user = new User(null, "Nguyễn Văn A", "a@example.com");
        User saved = userRepository.save(user);

        assertThat(saved.getId()).isNotNull();
        assertThat(userRepository.findById(saved.getId())).isPresent();
    }

    @Test
    void shouldUsePostgresSpecificJsonQuery() {
        // Truy vấn JSON - chỉ hoạt động trên PostgreSQL thực
        // H2 không hỗ trợ toán tử ->> của PostgreSQL
        List<User> users = userRepository.findByMetadataField("role", "admin");
        assertThat(users).isNotEmpty();
    }
}
```

### Đáp án mẫu

> "Testcontainers khởi động Docker container thực trong quá trình test, giúp test chạy trên database giống hệt production. H2 có dialect riêng không hỗ trợ nhiều tính năng của PostgreSQL như JSON operators hay window functions — dẫn đến test pass nhưng production fail. Spring Boot 3.1 tích hợp sẵn qua `@ServiceConnection`, giúp cấu hình tự động mà không cần viết properties thủ công."

---

## Câu 4: Đánh đổi giữa Testcontainers và H2 in-memory database trong CI/CD là gì? `[Advanced]`

### Câu hỏi

> *"Trong pipeline CI/CD, bạn sẽ cân nhắc gì khi chọn giữa Testcontainers và H2? Có trường hợp nào nên dùng H2 không?"*

### Giải thích lý thuyết

Đây là bài toán **đánh đổi** (trade-off) thực tế, không có câu trả lời tuyệt đối. Cần cân nhắc nhiều yếu tố:

| Tiêu chí | H2 In-memory | Testcontainers |
|---|---|---|
| Tốc độ start | Rất nhanh (ms) | Chậm hơn (vài giây pull/start Docker) |
| Độ chính xác | Thấp (dialect khác) | Cao (database thực) |
| Yêu cầu Docker | Không | Có (CI phải hỗ trợ Docker-in-Docker) |
| Resource sử dụng | Rất thấp | Cao hơn (RAM, CPU cho container) |
| Phù hợp unit test | Tốt | Quá nặng |
| Phù hợp integration test | Rủi ro dialect | Lý tưởng |

**Thách thức của Testcontainers trong CI/CD:**
- Một số CI runner (như GitHub Actions với container jobs) không hỗ trợ Docker-in-Docker dễ dàng
- Pull image lần đầu chậm nếu không có cache layer
- Tốn RAM hơn, có thể gây fail trên runner cấu hình thấp

**Khi H2 vẫn hợp lý:**
- Unit test thuần túy cần chạy nhanh
- Team test domain logic không phụ thuộc SQL dialect
- CI runner không hỗ trợ Docker

**Chiến lược kết hợp:** dùng H2 cho unit test nhanh, Testcontainers cho integration test chạy riêng trong CI stage khác.

### Code minh hoạ

```yaml
# .github/workflows/test.yml — chiến lược kết hợp
name: CI Pipeline

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run unit tests (H2, nhanh)
        run: ./mvnw test -Dtest="*UnitTest" -Dspring.datasource.url=jdbc:h2:mem:testdb

  integration-tests:
    runs-on: ubuntu-latest
    # Docker sẵn có trên ubuntu-latest của GitHub Actions
    steps:
      - uses: actions/checkout@v4
      - name: Cache Docker images
        uses: ScribeMD/docker-cache@0.5.0
        with:
          key: docker-${{ runner.os }}-postgres-16-alpine
      - name: Run integration tests (Testcontainers, chính xác)
        run: ./mvnw test -Dtest="*IntegrationTest"
```

```java
// Tách biệt rõ ràng unit test vs integration test
// Unit test - dùng mock, không cần DB
@ExtendWith(MockitoExtension.class)
class UserServiceUnitTest {
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void shouldCalculateUserScore() {
        // Test logic thuần túy, không cần DB
        when(userRepository.findById(1L)).thenReturn(Optional.of(new User(...)));
        int score = userService.calculateScore(1L);
        assertThat(score).isEqualTo(100);
    }
}

// Integration test - dùng Testcontainers
@SpringBootTest
@Testcontainers
class UserRepositoryIntegrationTest {
    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    // ... test với DB thực
}
```

### Đáp án mẫu

> "H2 nhanh và không cần Docker nhưng dialect khác nhau có thể tạo false confidence — test pass nhưng production fail. Testcontainers chính xác hơn nhưng cần Docker trong CI và tốn resource hơn. Chiến lược tôi dùng là: H2 hoặc mock cho unit test chạy nhanh, Testcontainers cho integration test chạy trong CI stage riêng. GitHub Actions ubuntu-latest đã có Docker sẵn nên khá thuận tiện, nhưng cần cache Docker image để tránh pull lại mỗi lần."

---

## Câu 5: SpringDoc OpenAPI sinh API docs cho Spring Boot ra sao và thay thế cái gì? `[Intermediate]`

### Câu hỏi

> *"SpringDoc OpenAPI là gì? Nó thay thế Springfox như thế nào và tích hợp với Spring Boot 3 ra sao?"*

### Giải thích lý thuyết

**SpringDoc OpenAPI** là thư viện tự động sinh tài liệu API theo chuẩn **OpenAPI 3** từ code Spring Boot, cung cấp giao diện **Swagger UI** để test API trực tiếp trên browser.

**Springfox** là thư viện cũ phổ biến trước đây, nhưng đã **không còn được maintain tích cực** từ 2021 và không tương thích với Spring Boot 3 / Spring Framework 6. SpringDoc OpenAPI là sự thay thế chính thức được cộng đồng Spring khuyến nghị.

**Cách hoạt động:**
1. SpringDoc quét toàn bộ `@RestController`, `@RequestMapping`, các annotation request/response
2. Tự động sinh file `openapi.json` hoặc `openapi.yaml`
3. Tích hợp Swagger UI để hiển thị và test API
4. Hỗ trợ đầy đủ Spring Security, Spring WebFlux, Spring Data REST

**Endpoints mặc định:**
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

### Code minh hoạ

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.5.0</version>
</dependency>
<!-- Với WebFlux dùng: springdoc-openapi-starter-webflux-ui -->
```

```java
// Cấu hình metadata cho toàn bộ API
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("User Management API")
                        .version("1.0.0")
                        .description("API quản lý người dùng")
                        .contact(new Contact()
                                .name("Dev Team")
                                .email("dev@example.com")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Auth"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Auth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}

// Annotation trên controller để làm giàu tài liệu
@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "API quản lý người dùng")
public class UserController {

    @Operation(summary = "Lấy thông tin người dùng theo ID",
               description = "Trả về chi tiết người dùng nếu tìm thấy")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Thành công",
                     content = @Content(schema = @Schema(implementation = UserResponse.class))),
        @ApiResponse(responseCode = "404", description = "Không tìm thấy người dùng")
    })
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(
            @Parameter(description = "ID người dùng", example = "1")
            @PathVariable Long id) {
        // ...
    }
}
```

```yaml
# application.yml - tùy chỉnh SpringDoc
springdoc:
  swagger-ui:
    path: /swagger-ui.html
    operations-sorter: method   # sắp xếp theo HTTP method
    tags-sorter: alpha           # sắp xếp tag theo alphabet
  api-docs:
    path: /v3/api-docs
  show-actuator: true            # hiển thị Actuator endpoints
  packages-to-scan: com.example.api  # chỉ quét package này
```

### Đáp án mẫu

> "SpringDoc OpenAPI tự động quét các `@RestController` và sinh tài liệu chuẩn OpenAPI 3, kèm Swagger UI để test API trực tiếp. Nó thay thế Springfox vốn đã không còn được maintain và không tương thích Spring Boot 3. Chỉ cần thêm dependency và optionally cấu hình `OpenAPI` bean, SpringDoc tự làm phần còn lại — rất ít boilerplate so với Springfox."

---

## Câu 6: GraalVM Native Image cải thiện Spring Boot như thế nào và có những thách thức gì? `[Advanced]`

### Câu hỏi

> *"GraalVM Native Image mang lại lợi ích gì cho Spring Boot? Có những thách thức và đánh đổi nào cần biết?"*

### Giải thích lý thuyết

**GraalVM Native Image** biên dịch ứng dụng Java thành **native executable** (file thực thi native) — không cần JVM lúc runtime. Quá trình này gọi là **Ahead-of-Time (AOT) compilation** (biên dịch trước).

**Lợi ích so với JVM truyền thống:**

| Tiêu chí | JVM (JIT) | GraalVM Native |
|---|---|---|
| Startup time | Hàng giây (vài giây) | Milliseconds (dưới 100ms) |
| Memory RSS | ~200-500MB | ~50-100MB |
| Peak throughput | Cao (JIT optimize) | Thấp hơn một chút |
| Build time | Vài giây | Vài phút (3-10 phút) |
| Portability | Chạy mọi nơi có JVM | Cần build riêng cho từng OS/arch |

**Phù hợp với:** serverless (AWS Lambda, Google Cloud Run), CLI tools, microservices cần cold-start nhanh.

**Thách thức thực tế (cần trung thực):**

1. **Reflection limitations (giới hạn reflection):** GraalVM phân tích code tĩnh tại build time. Reflection động (load class theo tên string) cần khai báo trong file hint hoặc dùng Spring AOT.

2. **Build time chậm:** Native image build có thể mất 3-10 phút, ảnh hưởng CI/CD pipeline.

3. **Thư viện bên thứ ba không tương thích:** Một số thư viện dùng reflection hoặc dynamic class loading chưa hỗ trợ native, cần kiểm tra danh sách **GraalVM Reachability Metadata**.

4. **Debugging khó hơn:** Stack trace native khó đọc hơn JVM, profiling tools khác.

5. **Peak performance thấp hơn JIT:** JIT compiler của JVM optimize code theo thời gian thực, native image không làm được điều này.

### Code minh hoạ

```xml
<!-- pom.xml: kích hoạt Native Image support -->
<plugin>
    <groupId>org.graalvm.buildtools</groupId>
    <artifactId>native-maven-plugin</artifactId>
    <configuration>
        <imageName>my-app</imageName>
        <buildArgs>
            <!-- Giảm bộ nhớ build, hữu ích trên CI -->
            <buildArg>-J-Xmx6g</buildArg>
        </buildArgs>
    </configuration>
</plugin>
```

```java
// Khai báo hint cho reflection thủ công (khi Spring AOT không tự phát hiện được)
@Configuration
@ImportRuntimeHints(MyRuntimeHints.class)
public class AppConfig {
}

class MyRuntimeHints implements RuntimeHintsRegistrar {
    @Override
    public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
        // Khai báo class cần reflection lúc runtime
        hints.reflection()
                .registerType(SomeDynamicClass.class,
                        MemberCategory.INVOKE_DECLARED_CONSTRUCTORS,
                        MemberCategory.INVOKE_DECLARED_METHODS);

        // Khai báo resource cần đọc lúc runtime
        hints.resources().registerPattern("templates/*.html");
    }
}
```

```bash
# Build native image
./mvnw -Pnative native:compile

# Chạy: startup thường dưới 100ms
./target/my-app
# Started MyApplication in 0.087 seconds (process running for 0.1)

# Build Docker image native (không cần GraalVM cài trên máy, dùng Buildpacks)
./mvnw -Pnative spring-boot:build-image
```

### Đáp án mẫu

> "GraalVM Native Image biên dịch Spring Boot thành file native, cho startup dưới 100ms và memory footprint nhỏ hơn nhiều — lý tưởng cho serverless và cold-start sensitive workloads. Nhưng có đánh đổi rõ ràng: build time chậm hơn nhiều (3-10 phút), reflection phải khai báo thêm hints, một số thư viện bên thứ ba chưa tương thích, và peak throughput thấp hơn JIT. Spring AOT giúp tự động hóa phần lớn hints nhưng vẫn cần kiểm tra kỹ với các thư viện phức tạp."

---

## Câu 7: Spring AOT là gì và khác gì so với Dependency Injection lúc runtime? `[Advanced]`

### Câu hỏi

> *"Spring AOT processing là gì? Nó thay đổi cách Spring Boot khởi động như thế nào so với mô hình truyền thống?"*

### Giải thích lý thuyết

**Spring AOT (Ahead-of-Time) Processing** là quá trình Spring phân tích và xử lý application context **tại build time** thay vì runtime. Kết quả là code Java/Kotlin được sinh ra (generated source code) thay thế cho reflection và dynamic class loading.

**Mô hình truyền thống (Runtime DI):**
1. JVM khởi động
2. Spring scan classpath, tìm `@Component`, `@Bean`, v.v. bằng reflection
3. Spring phân tích dependency graph
4. Spring khởi tạo ApplicationContext, inject dependencies
5. Application sẵn sàng (mất vài giây)

**Mô hình với Spring AOT:**
1. **Build time:** Spring phân tích toàn bộ cấu hình, sinh ra source code Java (BeanDefinition, proxy classes, reflection hints)
2. **Runtime:** JVM chạy code đã được sinh sẵn, bỏ qua bước scan/analyze
3. Application khởi động nhanh hơn đáng kể

**Spring AOT tự động xử lý:**
- Sinh `BeanDefinitionRegistrationAotProcessor` cho tất cả beans
- Tạo proxy class thay vì dùng dynamic proxy runtime
- Sinh reflection hints cho GraalVM Native Image
- Optimize Spring Security filter chain

**Lưu ý quan trọng:** Spring AOT không thay thế hoàn toàn runtime DI trong JVM mode — nó chủ yếu là **tiền xử lý** để tăng tốc và hỗ trợ native compilation.

### Code minh hoạ

```bash
# Kích hoạt AOT processing trong Maven build
./mvnw spring-boot:process-aot

# Xem code được sinh ra tại:
# target/spring-aot/main/sources/
# target/spring-aot/main/resources/
```

```java
// Ví dụ code Spring AOT sinh ra (thường không cần viết tay)
// Đây là BeanDefinitionRegistrationAotProcessor cho UserService

// Code TRƯỚC AOT (runtime reflection):
// Spring dùng reflection để tìm constructor và inject dependencies

// Code SAU AOT (sinh tự động bởi Spring):
public class UserServiceBeanDefinitions
        implements BeanDefinitionRegistrationAotProcessor {

    @Override
    public void processAheadOfTime(RegisteredBean registeredBean,
                                    BeanDefinitionBuilder builder) {
        // Spring đã biết trước UserService cần UserRepository
        // Không cần reflection lúc runtime
        builder.setInstanceSupplier(() ->
                new UserService(registeredBean.getBeanFactory()
                        .getBean(UserRepository.class)));
    }
}
```

```java
// Kiểm tra AOT compatibility trong test
@SpringBootTest
@EnabledIfSystemProperty(named = "spring.aot.enabled", matches = "true")
class AotCompatibilityTest {

    @Test
    void contextLoads() {
        // Đảm bảo ApplicationContext load thành công trong AOT mode
    }
}
```

```yaml
# application.yml - một số feature có thể cần tắt trong AOT/native mode
spring:
  aot:
    enabled: true  # bật khi chạy native
  # DevTools không tương thích với native image
  devtools:
    restart:
      enabled: false
```

### Đáp án mẫu

> "Spring AOT di chuyển phần lớn công việc của Spring container — scan, analyze, tạo proxy — từ runtime sang build time. Kết quả là code Java được sinh sẵn, runtime không cần reflection để khởi động application. Điều này giảm startup time và là nền tảng bắt buộc để tương thích với GraalVM Native Image, vì native image không hỗ trợ dynamic reflection tùy ý."

---

## Câu 8: OpenTelemetry và Micrometer giúp observability trong Spring Boot 3 như thế nào? `[Advanced]`

### Câu hỏi

> *"Giải thích sự khác biệt giữa Micrometer và OpenTelemetry. Spring Boot 3 tích hợp chúng như thế nào để đạt observability đầy đủ?"*

### Giải thích lý thuyết

**Observability** (khả năng quan sát) trong microservices gồm ba trụ cột: **Metrics** (chỉ số), **Logs** (nhật ký), và **Traces** (dấu vết phân tán).

**Micrometer** là **abstraction layer** (lớp trừu tượng) cho metrics trong JVM ecosystem — tương tự SLF4J cho logging. Micrometer cung cấp API thống nhất, backend-agnostic để đo lường (counter, gauge, timer), sau đó export sang Prometheus, Datadog, InfluxDB, v.v.

**OpenTelemetry (OTel)** là chuẩn mở cho cả ba trụ cột observability — metrics, logs, traces. Nó cung cấp SDK và **Collector** (bộ thu thập) để ingest data từ nhiều nguồn và export sang nhiều backend.

**Spring Boot 3 tích hợp:**
- **Micrometer Tracing** (tích hợp từ Spring Boot 3): API tracing thống nhất với backend là Brave (Zipkin) hoặc OpenTelemetry
- **Spring Boot Actuator**: expose metrics endpoint `/actuator/metrics` và `/actuator/prometheus`
- **Micrometer Observation API**: instrument code một lần, tự động tạo cả metrics lẫn traces

| Thành phần | Vai trò | Backend phổ biến |
|---|---|---|
| Micrometer | Metrics abstraction | Prometheus, Datadog |
| Micrometer Tracing + OTel | Distributed tracing | Jaeger, Zipkin, Tempo |
| OpenTelemetry Collector | Thu thập và route data | Jaeger, Loki, Tempo |

### Code minh hoạ

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
<!-- Micrometer Tracing với OpenTelemetry bridge -->
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-otel</artifactId>
</dependency>
<dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-exporter-otlp</artifactId>
</dependency>
```

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health, metrics, prometheus, info
  tracing:
    sampling:
      probability: 1.0   # 100% sampling (giảm xuống 0.1 ở production)
  otlp:
    tracing:
      endpoint: http://otel-collector:4318/v1/traces

# Export metrics sang Prometheus
  prometheus:
    metrics:
      export:
        enabled: true
```

```java
// Sử dụng Observation API: tự động tạo metrics + traces
@Service
public class UserService {

    private final ObservationRegistry observationRegistry;
    private final UserRepository userRepository;

    public User findById(Long id) {
        // Observation tự động tạo span cho tracing và timer metric
        return Observation.createNotStarted("user.find-by-id", observationRegistry)
                .lowCardinalityKeyValue("service", "user-service")
                .observe(() -> userRepository.findById(id)
                        .orElseThrow(() -> new UserNotFoundException(id)));
    }

    // Custom counter cho business metric
    public User createUser(UserCreateRequest request) {
        User user = userRepository.save(new User(request));

        // Tăng counter mỗi khi user được tạo
        Counter.builder("users.created")
                .tag("type", request.getUserType())
                .register(observationRegistry.observationConfig()
                        .getObservationHandler(MeterRegistry.class))
                .increment();

        return user;
    }
}
```

### Đáp án mẫu

> "Micrometer là abstraction layer cho metrics — tương tự SLF4J cho logging — cho phép switch giữa Prometheus, Datadog mà không đổi code. OpenTelemetry là chuẩn mở bao phủ metrics, logs và distributed traces. Spring Boot 3 tích hợp cả hai qua Micrometer Observation API: instrument code một lần, tự động sinh cả metrics lẫn traces. Actuator expose endpoint Prometheus để Prometheus scrape, còn traces được gửi qua OTLP exporter đến Jaeger hoặc Tempo."

---

## Câu 9: Structured logging với correlation ID hoạt động như thế nào trong microservices? `[Advanced]`

### Câu hỏi

> *"Làm thế nào để trace một request qua nhiều microservices? Correlation ID và structured logging giải quyết vấn đề này như thế nào?"*

### Giải thích lý thuyết

**Vấn đề:** Trong kiến trúc microservices, một request người dùng có thể đi qua 5-10 service. Khi có lỗi, làm sao tìm log liên quan từ nhiều service khác nhau?

**Correlation ID** (ID tương quan) là một **UUID duy nhất** được gán cho mỗi request từ đầu vào (API Gateway hoặc service đầu tiên) và **truyền qua toàn bộ chuỗi** các service qua HTTP header (thường là `X-Correlation-ID` hoặc `X-Request-ID`). Mỗi service include ID này trong log.

**Structured logging** (log có cấu trúc) là ghi log dạng **JSON** thay vì plain text, giúp log aggregation system (ELK Stack, Loki) dễ dàng filter và search theo field.

**MDC (Mapped Diagnostic Context)** là cơ chế của SLF4J cho phép gắn key-value vào thread context, tự động include vào mọi log statement trong thread đó.

Spring Boot 3 + Micrometer Tracing tự động propagate **Trace ID** và **Span ID** — là dạng correlation ID nâng cao hơn, tương thích với OpenTelemetry.

### Code minh hoạ

```java
// Filter tự động đọc/tạo Correlation ID từ HTTP header
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorrelationIdFilter implements OncePerRequestFilter {

    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    private static final String MDC_KEY = "correlationId";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain)
            throws ServletException, IOException {

        String correlationId = request.getHeader(CORRELATION_ID_HEADER);
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
        }

        // Gắn vào MDC: tự động xuất hiện trong mọi log của request này
        MDC.put(MDC_KEY, correlationId);
        // Gắn vào response header để client có thể trace
        response.setHeader(CORRELATION_ID_HEADER, correlationId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove(MDC_KEY); // Xóa sau khi request xong
        }
    }
}
```

```java
// Service gọi sang service khác: truyền Correlation ID
@Service
public class OrderService {

    private final WebClient webClient;
    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    public Order createOrder(CreateOrderRequest request) {
        log.info("Creating order for user: {}", request.getUserId());
        // Log tự động include correlationId từ MDC

        // Truyền Correlation ID khi gọi service khác
        String correlationId = MDC.get("correlationId");

        return webClient.post()
                .uri("http://inventory-service/api/inventory/reserve")
                .header("X-Correlation-ID", correlationId)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Order.class)
                .block();
    }
}
```

```json
// Ví dụ structured log output (JSON) với Logback + logstash-logback-encoder
{
  "@timestamp": "2024-01-15T10:30:00.123Z",
  "level": "INFO",
  "logger": "com.example.OrderService",
  "message": "Creating order for user: 12345",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "traceId": "d4cda95b652f4a1592b449d5929fda1b",
  "spanId": "6e0c63257de34c92",
  "service": "order-service",
  "thread": "http-nio-8080-exec-1"
}
```

```yaml
# logback-spring.xml hoặc application.yml để dùng JSON logging
# application.yml
logging:
  structured:
    format:
      console: ecs   # Elastic Common Schema format (Spring Boot 3.4+)
  # Hoặc dùng Logback với logstash encoder
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%X{correlationId}] [%X{traceId}] %-5level %logger{36} - %msg%n"
```

### Đáp án mẫu

> "Correlation ID là UUID duy nhất gắn vào mỗi request ngay từ entry point, được truyền qua HTTP header giữa các service và gắn vào MDC của SLF4J. Mọi log trong thread đó tự động include Correlation ID, nên khi có lỗi, tôi chỉ cần search theo ID đó trong log aggregation system để thấy toàn bộ chuỗi request. Structured logging dạng JSON giúp việc filter và search hiệu quả hơn so với plain text. Spring Boot 3 với Micrometer Tracing còn tự động propagate Trace ID/Span ID tương thích OpenTelemetry."

---

## Câu 10: OAuth 2.1 + Spring Authorization Server hoạt động như thế nào trong kiến trúc microservices? `[Advanced]`

### Câu hỏi

> *"Hãy giải thích flow của OAuth 2.1 với Spring Authorization Server trong kiến trúc microservices. Những điểm khác biệt so với OAuth 2.0 cần lưu ý?"*

### Giải thích lý thuyết

**OAuth 2.1** là bản consolidation (hợp nhất) của OAuth 2.0, loại bỏ các grant type không an toàn và bắt buộc các best practice trước đây là tùy chọn:

| Thay đổi OAuth 2.1 so với 2.0 | Lý do |
|---|---|
| Bỏ Implicit Flow | Token lộ trong URL, không an toàn |
| Bỏ Resource Owner Password Credentials | Ứng dụng giữ password người dùng |
| Bắt buộc PKCE cho Authorization Code | Ngăn chặn authorization code interception attack |
| Bắt buộc Refresh Token Rotation | Phát hiện token bị đánh cắp |
| Bắt buộc exact redirect URI matching | Ngăn open redirect attacks |

**Spring Authorization Server** là implementation chính thức của Spring cho **Authorization Server** (máy chủ cấp phép). Thay thế Spring Security OAuth2 (đã deprecated).

**Flow Authorization Code + PKCE trong microservices:**
1. Client (SPA/mobile) tạo `code_verifier` ngẫu nhiên và `code_challenge = SHA256(code_verifier)`
2. Client redirect người dùng đến Authorization Server với `code_challenge`
3. Người dùng đăng nhập và cấp phép
4. Authorization Server trả về `authorization_code`
5. Client gửi `authorization_code` + `code_verifier` để đổi lấy `access_token` (JWT)
6. Client dùng `access_token` để gọi Resource Servers
7. Resource Servers validate JWT (stateless, không cần gọi Authorization Server mỗi request)

### Code minh hoạ

```java
// Authorization Server configuration (Spring Authorization Server 1.x)
@Configuration
@EnableWebSecurity
public class AuthorizationServerConfig {

    @Bean
    @Order(1)
    public SecurityFilterChain authorizationServerSecurityFilterChain(
            HttpSecurity http) throws Exception {

        OAuth2AuthorizationServerConfiguration.applyDefaultSecurity(http);

        http.getConfigurer(OAuth2AuthorizationServerConfigurer.class)
                .oidc(Customizer.withDefaults()); // OpenID Connect hỗ trợ

        http.exceptionHandling(exceptions ->
                exceptions.defaultAuthenticationEntryPointFor(
                        new LoginUrlAuthenticationEntryPoint("/login"),
                        new MediaTypeRequestMatcher(MediaType.TEXT_HTML)));

        return http.build();
    }

    @Bean
    public RegisteredClientRepository registeredClientRepository() {
        // Đăng ký client (ứng dụng frontend, mobile)
        RegisteredClient webClient = RegisteredClient
                .withId(UUID.randomUUID().toString())
                .clientId("web-client")
                .clientSecret("{noop}secret") // production dùng BCrypt
                .clientAuthenticationMethod(
                        ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
                .redirectUri("http://localhost:3000/callback")
                .scope(OidcScopes.OPENID)
                .scope("read:users")
                .scope("write:orders")
                .clientSettings(ClientSettings.builder()
                        .requireProofKey(true)         // Bắt buộc PKCE
                        .requireAuthorizationConsent(true)
                        .build())
                .tokenSettings(TokenSettings.builder()
                        .accessTokenTimeToLive(Duration.ofMinutes(15))
                        .refreshTokenTimeToLive(Duration.ofDays(7))
                        .reuseRefreshTokens(false)     // Refresh Token Rotation
                        .build())
                .build();

        return new InMemoryRegisteredClientRepository(webClient);
        // Production: dùng JdbcRegisteredClientRepository
    }

    @Bean
    public JWKSource<SecurityContext> jwkSource() {
        // Sinh RSA key pair để ký JWT
        RSAKey rsaKey = Jwks.generateRsa();
        JWKSet jwkSet = new JWKSet(rsaKey);
        return (jwkSelector, securityContext) -> jwkSelector.select(jwkSet);
    }
}
```

```java
// Resource Server (microservice) validate JWT
@Configuration
@EnableWebSecurity
public class ResourceServerConfig {

    @Bean
    public SecurityFilterChain resourceServerFilterChain(HttpSecurity http)
            throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/users/**")
                    .hasAuthority("SCOPE_read:users")
                .requestMatchers(HttpMethod.POST, "/api/orders/**")
                    .hasAuthority("SCOPE_write:orders")
                .anyRequest().authenticated())
            .oauth2ResourceServer(oauth2 ->
                oauth2.jwt(jwt ->
                    // Tự validate JWT với public key của Authorization Server
                    jwt.jwkSetUri("http://auth-server/.well-known/jwks.json")));

        return http.build();
    }
}
```

### Đáp án mẫu

> "OAuth 2.1 hợp nhất các best practice của OAuth 2.0: bỏ Implicit Flow và Password Grant không an toàn, bắt buộc PKCE cho Authorization Code Flow và Refresh Token Rotation. Spring Authorization Server là implementation chính thức thay thế Spring Security OAuth2 deprecated. Trong microservices, Authorization Server cấp JWT, các Resource Server validate JWT bằng public key qua JWK endpoint — stateless, không cần gọi trung tâm mỗi request. PKCE quan trọng với SPA và mobile vì client không thể giữ secret an toàn."

---

## Câu 11: Sự khác biệt giữa Authorization Server và Resource Server trong Spring Security 6? `[Advanced]`

### Câu hỏi

> *"Phân biệt vai trò Authorization Server và Resource Server trong Spring Security 6. Chúng giao tiếp với nhau như thế nào?"*

### Giải thích lý thuyết

Đây là hai vai trò hoàn toàn khác nhau trong kiến trúc OAuth 2.x:

**Authorization Server (Máy chủ cấp phép):**
- Xác thực **người dùng** (authentication) và cấp **access token**
- Quản lý danh sách **registered clients** (ứng dụng được phép)
- Quản lý **consent** (người dùng đồng ý cấp quyền gì)
- Expose các endpoint chuẩn: `/oauth2/authorize`, `/oauth2/token`, `/oauth2/jwks`
- Triển khai: **Spring Authorization Server** (thư viện riêng biệt)
- Ví dụ: Keycloak, Auth0, hoặc tự build với Spring Authorization Server

**Resource Server (Máy chủ tài nguyên):**
- Phục vụ **API/data** được bảo vệ
- **Không** xác thực người dùng trực tiếp
- Nhận `access_token` trong `Authorization: Bearer` header từ client
- Validate token (kiểm tra chữ ký, expiry, scopes)
- Quyết định **authorization** (người dùng có quyền không)
- Triển khai: Spring Boot microservice với `spring-boot-starter-oauth2-resource-server`
- Ví dụ: User Service, Order Service, Inventory Service

**Cách giao tiếp:**

```
Client → [Authorization Server] → nhận access_token (JWT)
Client → [Resource Server] với Bearer token
Resource Server → validate JWT bằng public key (JWK endpoint của Auth Server)
Resource Server → extract scopes/claims từ JWT → quyết định authorize
```

**Hai chiến lược validate token:**
1. **JWT (stateless):** Resource Server tự validate bằng public key — nhanh, không cần gọi Auth Server mỗi request. Nhược điểm: không thể revoke token trước khi expire.
2. **Token Introspection (stateful):** Resource Server gọi Auth Server endpoint `/oauth2/introspect` mỗi request — chậm hơn nhưng có thể revoke ngay lập tức.

### Code minh hoạ

```java
// === AUTHORIZATION SERVER ===
// (Spring Authorization Server - separate service)
@SpringBootApplication
public class AuthorizationServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(AuthorizationServerApplication.class, args);
    }
}

// application.yml của Authorization Server
// server:
//   port: 9000
// spring:
//   authorization-server:
//     issuer: http://auth-server:9000


// === RESOURCE SERVER ===
// (Spring Boot microservice - ví dụ: user-service)
@Configuration
@EnableWebSecurity
@EnableMethodSecurity  // cho phép @PreAuthorize
public class UserServiceSecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {
        http
            // Resource Server không cần session (stateless)
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .csrf(csrf -> csrf.disable()) // REST API, không cần CSRF
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health").permitAll()
                .anyRequest().authenticated())
            // Cấu hình JWT validation
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    // Tải public key từ Authorization Server's JWK endpoint
                    .jwkSetUri("http://auth-server:9000/oauth2/jwks")
                    // Custom converter để map claims sang Authorities
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())));

        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter converter = new JwtGrantedAuthoritiesConverter();
        // JWT claim "scope" -> Spring Security "SCOPE_xxx" authorities
        converter.setAuthorityPrefix("SCOPE_");
        converter.setAuthoritiesClaimName("scope");

        JwtAuthenticationConverter jwtConverter = new JwtAuthenticationConverter();
        jwtConverter.setJwtGrantedAuthoritiesConverter(converter);
        return jwtConverter;
    }
}

// Controller dùng scope-based authorization
@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping
    @PreAuthorize("hasAuthority('SCOPE_read:users')")
    public List<UserResponse> getAllUsers() {
        // Chỉ client có scope "read:users" mới được gọi
        return userService.findAll();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SCOPE_admin') or #id == authentication.name")
    public void deleteUser(@PathVariable Long id) {
        // Chỉ admin hoặc chính user đó mới xóa được
        userService.delete(id);
    }
}
```

```yaml
# Cấu hình Token Introspection thay vì JWT (khi cần revoke ngay)
# application.yml của Resource Server
spring:
  security:
    oauth2:
      resourceserver:
        opaquetoken:
          introspection-uri: http://auth-server:9000/oauth2/introspect
          client-id: resource-server-client
          client-secret: resource-server-secret
        # Dùng jwt HOẶC opaquetoken, không dùng cả hai
```

### Đáp án mẫu

> "Authorization Server xác thực người dùng và cấp JWT access token — đây là identity provider trung tâm. Resource Server là từng microservice, nhận Bearer token từ client và validate bằng public key của Authorization Server mà không cần gọi lại Auth Server mỗi request — đó là stateless JWT validation. Spring Security 6 cấu hình Resource Server chỉ cần khai báo `jwkSetUri` trỏ đến JWK endpoint của Auth Server, rồi dùng `@PreAuthorize` với scope-based authorization. Nếu cần revoke token ngay lập tức, dùng Token Introspection thay vì JWT nhưng chấp nhận overhead mỗi request phải gọi Auth Server."

---
