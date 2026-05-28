---
sidebar_position: 3
title: "3. Javalin"
---

# Javalin -- Web framework nhỏ gọn

**Javalin** là **micro web framework** Java/Kotlin -- API đơn giản như Express.js (Node) hoặc Sinatra (Ruby). Phù hợp **API nhỏ, prototype, microservice nhẹ**.

**Tương tự đơn giản:** Spring Boot giống **bộ máy lớn** -- nhiều tính năng nhưng nặng. Javalin giống **xe đạp** -- đơn giản, nhanh, đi từ A đến B không cần phức tạp.

---

## Mục lục

- [1. Javalin là gì?](#1-javalin-là-gì)
- [2. Tạo project](#2-tạo-project)
- [3. Routing cơ bản](#3-routing-cơ-bản)
- [4. Request/Response](#4-requestresponse)
- [5. Middleware (Handler)](#5-middleware-handler)
- [6. JSON với Jackson](#6-json-với-jackson)
- [7. WebSocket](#7-websocket)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Javalin là gì?

Đặc điểm:

- **API nhỏ, dễ học** -- chỉ vài dòng để chạy server
- **Built trên Jetty** -- mạnh, ổn định
- **Hỗ trợ Java và Kotlin** -- bình đẳng
- **WebSocket, SSE, HTTP/2** -- built-in
- **Không "magic"** -- code rõ ràng, không annotation phức tạp

---

## 2. Tạo project

### Maven

```xml
<dependency>
    <groupId>io.javalin</groupId>
    <artifactId>javalin</artifactId>
    <version>6.1.3</version>
</dependency>
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-simple</artifactId>
    <version>2.0.9</version>
</dependency>
```

### Hello World

```java
import io.javalin.Javalin;

public class App {
    public static void main(String[] args) {
        Javalin app = Javalin.create()
            .get("/", ctx -> ctx.result("Hello Javalin!"))
            .start(7070);
    }
}
```

Chạy `java App` -> `curl http://localhost:7070`.

---

## 3. Routing cơ bản

```java
Javalin.create()
    .get("/users", UserController::getAll)
    .get("/users/{id}", UserController::getById)
    .post("/users", UserController::create)
    .put("/users/{id}", UserController::update)
    .delete("/users/{id}", UserController::delete)
    .start(7070);

// Patterns
app.get("/files/*", ctx -> ctx.result("Wildcard")); // bat moi path
app.get("/users/{id}/posts/{postId}", ctx -> { ... });
```

### Path Parameter

```java
app.get("/users/{id}", ctx -> {
    String id = ctx.pathParam("id");
    int idInt = Integer.parseInt(id);
    ctx.json(Map.of("id", idInt));
});
```

### Query Parameter

```java
// GET /search?name=alice&page=2
app.get("/search", ctx -> {
    String name = ctx.queryParam("name");
    int page = ctx.queryParamAsClass("page", Integer.class).getOrDefault(1);
    ctx.json(Map.of("name", name, "page", page));
});
```

### Group routes

```java
app.routes(() -> {
    path("/api", () -> {
        path("/users", () -> {
            get(UserController::getAll);
            post(UserController::create);
            path("/{id}", () -> {
                get(UserController::getById);
                put(UserController::update);
                delete(UserController::delete);
            });
        });
    });
});
```

---

## 4. Request/Response

```java
app.post("/echo", ctx -> {
    // Doc body
    String body = ctx.body();
    UserDto user = ctx.bodyAsClass(UserDto.class);

    // Headers
    String auth = ctx.header("Authorization");

    // Cookies
    String session = ctx.cookie("SESSION");

    // Response
    ctx.status(201);
    ctx.header("X-Custom", "value");
    ctx.cookie("token", "abc");
    ctx.json(user);
});

// Plain text
ctx.result("text");

// HTML
ctx.html("<h1>Hi</h1>");

// JSON
ctx.json(user);

// Redirect
ctx.redirect("/login");

// File
ctx.result(new FileInputStream("file.pdf"));

// Stream
ctx.writeSeekableStream(inputStream, "video/mp4");
```

---

## 5. Middleware (Handler)

### Before / After

```java
app.before(ctx -> {
    System.out.println(ctx.method() + " " + ctx.path());
});

app.before("/api/*", ctx -> {
    String token = ctx.header("Authorization");
    if (token == null) throw new UnauthorizedResponse();
});

app.after(ctx -> {
    System.out.println("Status: " + ctx.status());
});

app.exception(Exception.class, (e, ctx) -> {
    ctx.status(500).json(Map.of("error", e.getMessage()));
});
```

### Validation

```java
app.post("/users", ctx -> {
    String name = ctx.queryParamAsClass("name", String.class)
        .check(n -> n.length() >= 3, "Name >= 3 ky tu")
        .get();
    int age = ctx.queryParamAsClass("age", Integer.class)
        .check(a -> a >= 18, "Tu 18 tuoi")
        .get();
});
```

---

## 6. JSON với Jackson

Javalin auto-detect Jackson trên classpath.

```xml
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.16.0</version>
</dependency>
```

```java
public record User(Long id, String name, String email) {}

app.get("/users/1", ctx -> {
    ctx.json(new User(1L, "Alice", "alice@example.com"));
});

app.post("/users", ctx -> {
    User user = ctx.bodyAsClass(User.class);
    // save
    ctx.status(201).json(user);
});
```

---

## 7. WebSocket

```java
app.ws("/chat", ws -> {
    ws.onConnect(ctx -> System.out.println("Connected: " + ctx.sessionId()));
    ws.onMessage(ctx -> {
        String msg = ctx.message();
        ctx.send("Echo: " + msg);
    });
    ws.onClose(ctx -> System.out.println("Closed"));
});
```

Client (JS):

```javascript
const ws = new WebSocket('ws://localhost:7070/chat');
ws.onmessage = (e) => console.log(e.data);
ws.send('Hello!');
```

---

## Khi nào dùng?

- **Javalin khi:**
  - API nhỏ, microservice nhẹ
  - Prototype, hackathon
  - Cần WebSocket dễ
  - Team biết Kotlin
  - Không cần ecosystem lớn (Spring Security, Spring Data)
- **Spring Boot khi:**
  - Project enterprise lớn
  - Cần nhiều integration (DB, MQ, cache)
- **Best practice:**
  - Tách controller, service, repository
  - Dùng dependency injection (Guice, Koin) nếu app lớn
  - Validation tự tay vì Javalin không có Jakarta Validation tích hợp
  - Log với SLF4J

---

## Lỗi thường gặp

### Lỗi 1: Không dùng `bodyAsClass` cho POST

```java
// SAI -- doc string roi parse JSON thu cong
String body = ctx.body();
User u = new ObjectMapper().readValue(body, User.class);

// DUNG
User u = ctx.bodyAsClass(User.class);
```

### Lỗi 2: Quên start

```java
Javalin app = Javalin.create()
    .get("/", ctx -> ctx.result("Hi"));
// Quen .start()!
```

### Lỗi 3: Path conflict

```java
// SAI -- 2 route giong nhau
app.get("/users/{id}", ...);
app.get("/users/admin", ...); // bi /users/{id} bat truoc

// DUNG -- specific truoc
app.get("/users/admin", ...);
app.get("/users/{id}", ...);
```

### Lỗi 4: Block trên main thread

```java
// SAI -- HTTP request block
app.get("/heavy", ctx -> {
    Thread.sleep(60_000); // dat het thread pool!
});

// DUNG -- async
app.get("/heavy", ctx -> {
    ctx.future(() -> CompletableFuture.supplyAsync(() -> heavy()));
});
```

---

## Câu hỏi phỏng vấn

### Câu 1: Javalin khác Spring Boot thế nào?

**Trả lời:** Javalin là **micro framework** -- API đơn giản, ít magic, code rõ ràng. Spring Boot full-stack -- nhiều tính năng, nhiều annotation, nhiều integration. Javalin phù hợp app nhỏ; Spring Boot phù hợp enterprise.

### Câu 2: Javalin dùng Jetty?

**Trả lời:** **Đúng**. Javalin là **wrapper trên Jetty** -- cung cấp API đẹp hơn cho Java/Kotlin. Hưởng lợi tính ổn định, performance của Jetty.

### Câu 3: Tại sao Javalin phù hợp Kotlin?

**Trả lời:** API dùng nhiều lambda -- Kotlin syntax ngắn hơn Java. Coroutine integrate được với Javalin. Cộng đồng Kotlin web đông ưa Javalin (cùng Ktor).

### Câu 4: Javalin có DI không?

**Trả lời:** **Không built-in**. Bạn tự tạo controller/service hoặc tích hợp **Guice/Koin** (Kotlin). Đây là trade-off đơn giản: ít magic, nhưng tự code DI.

### Câu 5: Async trong Javalin?

**Trả lời:** Dùng `ctx.future(CompletableFuture)` -- Javalin sẽ chờ future hoàn thành rồi response. Tránh block thread Jetty cho task nặng/I/O. Java 21+ có thể tận dụng **Virtual Threads**.
