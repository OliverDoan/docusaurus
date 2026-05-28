---
sidebar_position: 2
title: "2. Quarkus"
---

# Quarkus -- Supersonic Subatomic Java

**Quarkus** là framework Java **được tối ưu cho Kubernetes, GraalVM native image, và serverless**. Slogan: "Supersonic Subatomic Java" -- khởi động cực nhanh (< 100ms), bộ nhớ thấp.

**Tương tự đơn giản:** Spring Boot giống **xe limousine** -- tiện nghi, nhiều tính năng, nhưng nặng. Quarkus giống **xe đua** -- nhanh, nhẹ, tối ưu cho thiên đường mới (cloud, container, serverless).

---

## Mục lục

- [1. Quarkus là gì?](#1-quarkus-là-gì)
- [2. Tạo project](#2-tạo-project)
- [3. REST với Quarkus](#3-rest-với-quarkus)
- [4. Dependency Injection (CDI)](#4-dependency-injection-cdi)
- [5. Persistence với Panache](#5-persistence-với-panache)
- [6. Native Image với GraalVM](#6-native-image-với-graalvm)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Quarkus là gì?

Đặc điểm:

- **Cloud-native**: Tối ưu Kubernetes, OpenShift
- **GraalVM native**: Compile thành **binary native** -- start < 100ms, memory ~30MB
- **Build-time optimization**: Việc làm sẵn lúc build thay vì startup
- **Live coding**: Hot reload nhanh
- **Standards-based**: JAX-RS, CDI, JPA, MicroProfile

Được tạo bởi **Red Hat** (2019), nay là chuẩn Red Hat cho Java cloud-native.

---

## 2. Tạo project

### CLI

```bash
# Cai Quarkus CLI
brew install quarkusio/tap/quarkus

# Tao project
quarkus create app com.example:demo \
    --extension=rest-jackson,hibernate-orm-panache,jdbc-postgresql

cd demo
quarkus dev
```

### Hoặc qua start.quarkus.io

Truy cập https://code.quarkus.io -> chọn extension -> download.

### `pom.xml` (tự tạo)

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-rest</artifactId>
</dependency>
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-rest-jackson</artifactId>
</dependency>
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-hibernate-orm-panache</artifactId>
</dependency>
```

---

## 3. REST với Quarkus

Dùng **JAX-RS** (Jakarta REST):

```java
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

@Path("/api/users")
public class UserResource {

    @Inject UserService service;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<UserDto> getAll() {
        return service.findAll();
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Long id) {
        return service.findById(id)
            .map(u -> Response.ok(u).build())
            .orElse(Response.status(Response.Status.NOT_FOUND).build());
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response create(@Valid UserCreateDto dto) {
        var user = service.create(dto);
        return Response.status(Response.Status.CREATED).entity(user).build();
    }
}
```

---

## 4. Dependency Injection (CDI)

Quarkus dùng **CDI** (Jakarta Context and Dependency Injection):

```java
@ApplicationScoped
public class UserService {

    @Inject UserRepository repository;

    @Transactional
    public User create(UserCreateDto dto) {
        var user = new User(dto.name(), dto.email());
        repository.persist(user);
        return user;
    }
}
```

### Scope phổ biến

| Scope                | Vai trò                                  |
| -------------------- | ---------------------------------------- |
| `@ApplicationScoped` | Singleton -- toàn app                    |
| `@RequestScoped`     | 1 instance/HTTP request                  |
| `@Singleton`         | Tương tự ApplicationScoped, không proxy  |
| `@Dependent`         | Tạo mới mỗi lần inject                   |

**Khác Spring:** Quarkus dùng `@Inject` (không `@Autowired`).

---

## 5. Persistence với Panache

**Panache** là wrapper trên Hibernate, đơn giản hóa code.

### Active Record pattern

```java
@Entity
public class User extends PanacheEntity {
    public String name;
    public String email;

    public static Optional<User> findByEmail(String email) {
        return find("email", email).firstResultOptional();
    }
}

// Su dung
User user = User.findById(1L);
List<User> all = User.listAll();
User.findByEmail("a@b.com").ifPresent(u -> System.out.println(u.name));

var newUser = new User();
newUser.name = "Alice";
newUser.persist();

User.delete("name", "Bob");
long count = User.count();
```

### Repository pattern

```java
@ApplicationScoped
public class UserRepository implements PanacheRepository<User> {
    public Optional<User> findByEmail(String email) {
        return find("email", email).firstResultOptional();
    }
}
```

---

## 6. Native Image với GraalVM

### Build native

```bash
# Yeu cau GraalVM cai san
quarkus build --native

# Hoac Maven
./mvnw package -Dnative

# Output: target/demo-1.0-runner (binary native, khong can JVM)
./target/demo-1.0-runner
# Start in ~50ms, memory ~30MB
```

### So sánh

| Metric           | JVM       | Native        |
| ---------------- | --------- | ------------- |
| Startup time     | ~1-3s     | ~30-100ms     |
| Memory (RSS)     | ~150MB    | ~30MB         |
| Build time       | 30s       | 3-5 phút      |
| Binary size      | -         | ~50MB         |
| Throughput       | Cao       | Hơi thấp hơn  |
| Reflection       | OK        | Cần cấu hình  |

### Cấu hình reflection

```java
@RegisterForReflection
public class MyClass { ... }
```

---

## Khi nào dùng?

- **Quarkus khi:**
  - Cloud-native, Kubernetes
  - Serverless (AWS Lambda) -- cần start nhanh
  - Microservice nhỏ, memory hạn chế
  - Cần GraalVM native
  - Hệ sinh thái Red Hat (OpenShift)
- **Spring Boot khi:**
  - Project enterprise truyền thống
  - Team đã có kinh nghiệm Spring
  - Cần ecosystem Spring (Security, Cloud, Batch)
- **Best practice:**
  - Live coding (`quarkus dev`) -- iterate nhanh
  - Build native cho production nếu cần
  - Dùng Panache thay JPA thô
  - Test với `@QuarkusTest`
  - **MicroProfile Config** cho externalized config

---

## Lỗi thường gặp

### Lỗi 1: Class không reflectable trong native

```
java.lang.ClassNotFoundException khi reflection
```

**Giải pháp:** Thêm `@RegisterForReflection` hoặc `reflect-config.json`.

### Lỗi 2: Dùng `@Autowired` thay `@Inject`

```java
// SAI -- Spring annotation
@Autowired UserRepository repo;

// DUNG -- CDI
@Inject UserRepository repo;
```

### Lỗi 3: Build native fail do dependency không hỗ trợ

Một số lib (cũ, dynamic) không hoạt động native. Check trước trong Quarkus extension marketplace.

### Lỗi 4: Quên `@Transactional` cho persist

```java
// SAI
public void save(User u) {
    u.persist(); // Loi -- khong co transaction
}

// DUNG
@Transactional
public void save(User u) { u.persist(); }
```

---

## Câu hỏi phỏng vấn

### Câu 1: Quarkus khác Spring Boot thế nào?

**Trả lời:**

- **Quarkus**: tối ưu cloud-native, GraalVM native, build-time processing, start cực nhanh
- **Spring Boot**: phổ biến hơn, ecosystem mạnh hơn, học dễ hơn, JVM-focused

Quarkus mới hơn nhưng catch up nhanh. Chọn dựa vào team + use case.

### Câu 2: GraalVM Native Image là gì?

**Trả lời:** Compile Java code thành **binary native** ahead-of-time (AOT) -- không cần JVM lúc chạy. Lợi ích: start cực nhanh (~30ms), memory thấp. Hạn chế: build chậm, một số dynamic feature (reflection, proxy) cần config trước.

### Câu 3: Tại sao Quarkus nhanh startup?

**Trả lời:**

- **Build-time processing**: việc Spring làm lúc startup (scan class, build bean graph), Quarkus làm **lúc build** -- runtime chỉ load
- **Native image**: skip JVM warmup, JIT
- **Lazy initialization**: bean tạo khi cần

### Câu 4: Panache Active Record vs Repository?

**Trả lời:**

- **Active Record**: entity có method query (`User.findByEmail`) -- ngắn gọn, ít boilerplate
- **Repository**: tách Repository class -- testable hơn, sạch hơn

Cả 2 đều dựa trên Panache, chọn theo phong cách team.

### Câu 5: Khi nào KHÔNG nên dùng Quarkus?

**Trả lời:**

- Team chưa quen CDI/Jakarta
- Cần ecosystem Spring (Security, Cloud, Batch)
- App long-running (start time không quan trọng)
- Yêu cầu dependency chưa có Quarkus extension
