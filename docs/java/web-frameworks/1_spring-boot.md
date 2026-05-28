---
sidebar_position: 1
title: "1. Spring Boot (Recommended)"
---

# Spring Boot -- Framework Java phổ biến nhất

**Spring Boot** là framework Java **#1** cho web/microservice. Xây trên nền **Spring Framework**, Spring Boot **giảm cấu hình**, **auto-configure**, **embedded server** -- chạy ứng dụng web chỉ với `java -jar`.

**Tương tự đơn giản:** Spring giống **bộ Lego nâng cao** -- linh hoạt nhưng phải tự lắp ráp. Spring Boot giống **bộ Lego có hướng dẫn + mặc định** -- mọi thứ "vừa vặn" sẵn, bạn chỉ tập trung vào logic app.

---

## Mục lục

- [1. Spring Boot là gì?](#1-spring-boot-là-gì)
- [2. Tạo project](#2-tạo-project)
- [3. Cấu trúc và Annotation cơ bản](#3-cấu-trúc-và-annotation-cơ-bản)
- [4. REST Controller](#4-rest-controller)
- [5. Dependency Injection và Configuration](#5-dependency-injection-và-configuration)
- [6. Spring Data JPA](#6-spring-data-jpa)
- [7. Spring Security](#7-spring-security)
- [8. Actuator -- Monitoring](#8-actuator-monitoring)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Spring Boot là gì?

Đặc điểm:

- **Convention over Configuration**: Default đúng đa số case
- **Auto-configuration**: Tự setup bean dựa vào dependency có
- **Embedded server**: Tomcat/Jetty/Undertow built-in
- **Production-ready**: Metrics, health check, externalized config
- **Starter dependency**: Một dòng bao gồm nhiều dep liên quan

---

## 2. Tạo project

### Spring Initializr

Truy cập https://start.spring.io -- chọn:

- Project: Maven/Gradle
- Language: Java
- Java version: 17/21
- Dependencies: Spring Web, Spring Data JPA, ...

Hoặc command line:

```bash
curl https://start.spring.io/starter.tgz \
    -d type=maven-project \
    -d language=java \
    -d javaVersion=21 \
    -d dependencies=web,data-jpa \
    -d groupId=com.example \
    -d artifactId=demo \
    -o demo.tgz
tar -xvf demo.tgz
```

### `pom.xml`

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.0</version>
</parent>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

---

## 3. Cấu trúc và Annotation cơ bản

### Cấu trúc dự án

```
src/main/java/com/example/demo/
├── DemoApplication.java        <-- @SpringBootApplication
├── controller/
│   └── UserController.java
├── service/
│   └── UserService.java
├── repository/
│   └── UserRepository.java
├── entity/
│   └── User.java
└── dto/
    └── UserDto.java

src/main/resources/
├── application.yml
└── application-prod.yml
```

### Main class

```java
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

`@SpringBootApplication` = `@SpringBootConfiguration` + `@EnableAutoConfiguration` + `@ComponentScan`.

### Stereotype Annotations

| Annotation        | Vai trò                                       |
| ----------------- | --------------------------------------------- |
| `@Component`      | Bean chung                                    |
| `@Service`        | Business logic                                |
| `@Repository`     | Data access                                   |
| `@Controller`     | Web MVC controller                            |
| `@RestController` | REST API (= `@Controller` + `@ResponseBody`)  |
| `@Configuration`  | Class chứa `@Bean`                            |

---

## 4. REST Controller

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @GetMapping
    public List<UserDto> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public UserDto getById(@PathVariable Long id) {
        return service.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserDto create(@Valid @RequestBody UserCreateDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public UserDto update(@PathVariable Long id, @Valid @RequestBody UserUpdateDto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @GetMapping("/search")
    public List<UserDto> search(@RequestParam String name,
                                 @RequestParam(defaultValue = "0") int page) {
        return service.search(name, page);
    }
}
```

### Mapping annotations

| Annotation        | HTTP method |
| ----------------- | ----------- |
| `@GetMapping`     | GET         |
| `@PostMapping`    | POST        |
| `@PutMapping`     | PUT         |
| `@PatchMapping`   | PATCH       |
| `@DeleteMapping`  | DELETE      |
| `@RequestMapping` | Tổng quát   |

### Tham số

| Annotation        | Lấy gì                                |
| ----------------- | ------------------------------------- |
| `@PathVariable`   | `/users/{id}` -> id                   |
| `@RequestParam`   | `?name=Alice` -> name                 |
| `@RequestBody`    | Body JSON -> object                   |
| `@RequestHeader`  | HTTP header                           |
| `@CookieValue`    | Cookie                                |

---

## 5. Dependency Injection và Configuration

### Constructor injection (khuyến nghị)

```java
@Service
public class UserService {
    private final UserRepository repo;

    public UserService(UserRepository repo) {
        this.repo = repo;
    }
}
```

### Configuration class

```java
@Configuration
public class AppConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    @ConditionalOnProperty(name = "feature.cache.enabled", havingValue = "true")
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("users");
    }
}
```

### Externalized Configuration

`application.yml`:

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/mydb
    username: ${DB_USER}
    password: ${DB_PASS}

app:
  feature:
    enabled: true
  api:
    timeout: 30s
```

```java
@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private Feature feature;
    private Api api;

    public static class Feature { private boolean enabled; /* g/s */ }
    public static class Api { private Duration timeout; /* g/s */ }
    // getter/setter
}
```

### Profiles

```bash
java -jar app.jar --spring.profiles.active=prod
```

`application-prod.yml` được nạp.

---

## 6. Spring Data JPA

### Entity

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String email;

    @CreatedDate
    private Instant createdAt;
    // ...
}
```

### Repository

```java
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByNameContaining(String keyword);

    @Query("SELECT u FROM User u WHERE u.email LIKE %:domain")
    List<User> findByEmailDomain(@Param("domain") String domain);
}
```

Spring **tự generate implementation** từ tên method.

---

## 7. Spring Security

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .oauth2ResourceServer(oauth2 -> oauth2.jwt());

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

---

## 8. Actuator -- Monitoring

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

Endpoints sẵn sàng:

- `/actuator/health` -- kiểm tra sống
- `/actuator/info` -- thông tin app
- `/actuator/metrics` -- metric (CPU, memory, request)
- `/actuator/prometheus` -- export Prometheus

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
```

---

## Khi nào dùng?

- **Spring Boot khi:**
  - REST API enterprise
  - Microservice
  - Hệ thống cần tích hợp nhiều (DB, MQ, cache, security)
  - Team có kinh nghiệm Spring
- **Best practice:**
  - **Constructor injection** -- không field injection
  - **DTO** tách khỏi Entity -- không expose DB schema
  - Dùng **profile** cho dev/staging/prod
  - Externalize config -- không hardcode
  - **Spring Boot DevTools** trong dev -- hot reload
  - **Actuator** để monitor production
  - **Validation** với `@Valid` và Jakarta Validation

---

## Lỗi thường gặp

### Lỗi 1: Field Injection

```java
// SAI
@Autowired
private UserService service;

// DUNG -- constructor
private final UserService service;
public UserController(UserService service) { this.service = service; }
```

### Lỗi 2: Expose Entity ra API

```java
// SAI -- expose DB schema, easy to leak
@GetMapping("/{id}")
public User get(@PathVariable Long id) { ... }

// DUNG -- DTO
@GetMapping("/{id}")
public UserDto get(@PathVariable Long id) { ... }
```

### Lỗi 3: Quên `@Transactional`

```java
// SAI -- thao tac DB ngoai transaction
@Service
public class UserService {
    public void register(User u) {
        repo.save(u);
        notify.send(u); // neu loi, save khong rollback
    }
}

// DUNG
@Transactional
public void register(User u) { ... }
```

### Lỗi 4: Bean circular dependency

```
A needs B, B needs A
```

Refactor: tách logic chung, hoặc dùng `@Lazy`.

### Lỗi 5: Configuration hardcode

```java
// SAI
String url = "jdbc:mysql://prod-db";

// DUNG -- properties
@Value("${db.url}") String url;
```

---

## Câu hỏi phỏng vấn

### Câu 1: Spring vs Spring Boot?

**Trả lời:**

- **Spring**: framework core (DI, AOP, MVC) -- yêu cầu nhiều config XML/Java
- **Spring Boot**: built trên Spring, **auto-configure**, **embedded server**, **starter dependency** -- giảm boilerplate, ready to run

Spring Boot không thay Spring -- mà là cách dùng Spring nhanh hơn.

### Câu 2: `@SpringBootApplication` làm gì?

**Trả lời:** Là tổ hợp 3 annotation:

- `@SpringBootConfiguration`: marker config class
- `@EnableAutoConfiguration`: bật auto-config dựa vào classpath
- `@ComponentScan`: scan bean từ package hiện tại và con

### Câu 3: Auto-configuration hoạt động thế nào?

**Trả lời:** Spring Boot scan classpath, đọc `META-INF/spring/...` của các starter. Nếu thấy class nhất định (`@ConditionalOnClass`), tự config bean tương ứng. Ví dụ thấy `DataSource` trên classpath -> tự tạo DataSource bean từ `application.yml`.

### Câu 4: Bean scope phổ biến?

**Trả lời:**

- `singleton` (default): 1 instance toàn ApplicationContext
- `prototype`: tạo mới mỗi lần inject
- `request`: 1 instance/HTTP request (web)
- `session`: 1 instance/HTTP session
- `application`: 1 instance/ServletContext

99% bean nên `singleton`.

### Câu 5: `@Transactional` hoạt động thế nào?

**Trả lời:** Spring tạo **proxy** quanh bean. Khi method có `@Transactional` được gọi qua proxy:

1. Mở transaction
2. Chạy method
3. Commit nếu OK, rollback nếu exception (default chỉ RuntimeException)

**Pitfall:** Gọi `this.method()` trong cùng class **không qua proxy** -- transaction không bật.
