---
sidebar_position: 4
title: "4. Play Framework"
---

# Play Framework -- Reactive Web Framework

**Play Framework** là framework web Java/Scala **non-blocking, reactive** -- built trên **Akka** và **Netty**. Truyền cảm hứng từ Ruby on Rails (convention over configuration) + Node.js (async). Phổ biến ở LinkedIn, Verizon, Walmart.

**Tương tự đơn giản:** Spring Boot giống **xe ô tô gia đình** -- ổn định, đầy đủ tiện nghi, đi đường nào cũng được. Play giống **xe đua F1** -- tốc độ cao, kiến trúc reactive, nhưng cần kỹ năng để lái.

---

## Mục lục

- [1. Play Framework là gì?](#1-play-framework-là-gì)
- [2. Tạo project](#2-tạo-project)
- [3. Routing và Controller](#3-routing-và-controller)
- [4. Async Action](#4-async-action)
- [5. JSON với Jackson](#5-json-với-jackson)
- [6. Form Binding và Validation](#6-form-binding-và-validation)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Play Framework là gì?

Đặc điểm:

- **Reactive, non-blocking**: Akka + Netty, handle nhiều request ít thread
- **Convention over Configuration**: cấu trúc thư mục chuẩn
- **Hot reload**: sửa code, F5 -> thấy thay đổi ngay (như PHP)
- **Stateless**: dễ scale horizontal
- **Type-safe routing**: file routes được compile

---

## 2. Tạo project

### sbt (Scala build tool)

```bash
sbt new playframework/play-java-seed.g8
```

### Cấu trúc

```
my-play-app/
├── app/
│   ├── controllers/
│   │   └── HomeController.java
│   ├── views/                  (Twirl template)
│   │   └── index.scala.html
│   └── models/
├── conf/
│   ├── application.conf        (config)
│   ├── routes                  (URL mapping)
│   └── logback.xml
├── public/                     (static files)
├── test/
└── build.sbt
```

### Chạy

```bash
sbt run         # dev mode, hot reload
sbt test        # chay test
sbt stage       # build production
```

---

## 3. Routing và Controller

### `conf/routes`

```
# routes - file mapping URL -> action
GET     /                       controllers.HomeController.index()
GET     /users                  controllers.UserController.list()
GET     /users/:id              controllers.UserController.show(id: Long)
POST    /users                  controllers.UserController.create()
PUT     /users/:id              controllers.UserController.update(id: Long)
DELETE  /users/:id              controllers.UserController.delete(id: Long)

# Static files
GET     /assets/*file           controllers.Assets.versioned(file)
```

### Controller

```java
package controllers;

import play.mvc.*;
import javax.inject.Inject;

public class UserController extends Controller {

    private final UserService service;

    @Inject
    public UserController(UserService service) {
        this.service = service;
    }

    public Result list() {
        List<User> users = service.findAll();
        return ok(Json.toJson(users));
    }

    public Result show(Long id) {
        return service.findById(id)
            .map(user -> ok(Json.toJson(user)))
            .orElse(notFound());
    }

    public Result create(Http.Request request) {
        UserDto dto = Json.fromJson(request.body().asJson(), UserDto.class);
        User created = service.create(dto);
        return created(Json.toJson(created));
    }
}
```

### Result helpers

```java
return ok("text");                   // 200
return ok(jsonNode);                 // 200 + JSON
return created();                    // 201
return noContent();                  // 204
return badRequest("error");          // 400
return unauthorized();               // 401
return notFound();                   // 404
return status(418, "I'm a teapot");
return redirect("/login");
```

---

## 4. Async Action

Play khuyến nghị **non-blocking**:

```java
import java.util.concurrent.CompletionStage;

public CompletionStage<Result> asyncList() {
    return service.findAllAsync()
        .thenApply(users -> ok(Json.toJson(users)));
}

// Goi nhieu service song song
public CompletionStage<Result> dashboard() {
    var users = userService.findAllAsync();
    var posts = postService.findAllAsync();

    return users.thenCombine(posts, (u, p) -> {
        return ok(Json.toJson(Map.of("users", u, "posts", p)));
    });
}
```

### WS Client (HTTP)

```java
import play.libs.ws.*;

public CompletionStage<Result> callExternal(WSClient ws) {
    return ws.url("https://api.example.com/data")
        .get()
        .thenApply(resp -> ok(resp.getBody()));
}
```

---

## 5. JSON với Jackson

Play tích hợp Jackson:

```java
public record User(Long id, String name, String email) {}

// Object -> JSON
JsonNode json = Json.toJson(new User(1L, "Alice", "alice@example.com"));

// JSON -> Object
User user = Json.fromJson(jsonNode, User.class);
```

### Custom serializer

```java
// Tao tu dien tu Java object
JsonNode result = Json.newObject()
    .put("name", "Alice")
    .put("age", 25);
```

---

## 6. Form Binding và Validation

```java
import play.data.*;
import javax.validation.constraints.*;

public class UserForm {
    @NotBlank
    @Size(min = 3, max = 50)
    private String name;

    @Email
    private String email;

    @Min(18)
    private int age;
    // getter, setter
}

@Inject
private FormFactory formFactory;

public Result submit(Http.Request request) {
    Form<UserForm> form = formFactory.form(UserForm.class).bindFromRequest(request);
    if (form.hasErrors()) {
        return badRequest(form.errorsAsJson());
    }
    UserForm data = form.get();
    // save
    return ok();
}
```

---

## Khi nào dùng?

- **Play khi:**
  - High-concurrency app (chat, streaming)
  - Microservice cần performance
  - Team biết Scala (Play có hỗ trợ Scala mạnh)
  - Cần hot reload tốt cho dev
- **Spring Boot khi:**
  - Project enterprise truyền thống
  - Ecosystem rộng
  - Team không quen reactive
- **Best practice:**
  - Async khi gọi DB/API -- không block thread
  - DI bằng Guice (built-in) hoặc Macwire
  - Stateless -- không lưu state trong session
  - Routes file ngắn, có cấu trúc

---

## Lỗi thường gặp

### Lỗi 1: Block trong action

```java
// SAI -- chan thread Netty
public Result heavy() {
    Thread.sleep(5000); // block
    return ok();
}

// DUNG
public CompletionStage<Result> heavy() {
    return CompletableFuture.supplyAsync(() -> {
        // heavy work
        return ok();
    });
}
```

### Lỗi 2: Quên register route

```
# routes
GET /users controllers.UserController.list()
# Quen add -> 404
```

### Lỗi 3: State trong controller

```java
// SAI -- field thay doi, controller singleton -> race
public class UserController extends Controller {
    private List<User> cache = new ArrayList<>(); // BUG!
}

// DUNG -- inject service, ConcurrentHashMap
```

### Lỗi 4: Synchronous DB call trong reactive

```java
// SAI
public CompletionStage<Result> list() {
    var users = repo.findAll(); // sync DB call
    return CompletableFuture.completedFuture(ok(Json.toJson(users)));
}

// DUNG -- repo tra ve CompletionStage
public CompletionStage<Result> list() {
    return repo.findAllAsync()
        .thenApply(users -> ok(Json.toJson(users)));
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: Play khác Spring Boot thế nào?

**Trả lời:** Play **reactive, non-blocking** (Akka, Netty) -- tận dụng ít thread cho nhiều request. Spring Boot mặc định **blocking** (Tomcat), có WebFlux cho reactive. Play **hot reload tốt hơn** dev, structure giống Rails. Spring Boot ecosystem mạnh hơn.

### Câu 2: Action async dùng để làm gì?

**Trả lời:** Tránh **block thread** khi đợi I/O (DB, HTTP). Play dùng ít thread hơn (event loop) -- block 1 thread = mất khả năng phục vụ request khác. Async trả `CompletionStage<Result>` để framework chờ kết quả mà không block.

### Câu 3: `routes` file là gì?

**Trả lời:** File **type-safe routing** -- map URL pattern -> action. Compile-time check, refactor an toàn (đổi tên method controller -> routes báo lỗi). Khác Spring `@RequestMapping` (annotation-based) -- Play tách routing khỏi code.

### Câu 4: Play hỗ trợ Scala và Java?

**Trả lời:** **Cả hai**, nhưng **Scala là first-class**. Play core viết Scala. Java API là wrapper, hơi đời sau. Nếu team Java thuần -> Spring Boot/Quarkus tốt hơn. Team Scala -> Play là lựa chọn tự nhiên.

### Câu 5: Play stateless nghĩa là gì?

**Trả lời:** Mỗi request **độc lập**, không lưu state server-side -- session/cache nằm ngoài (Redis, DB). Lợi: dễ scale horizontal (thêm instance), restart không mất gì. Hạn: phải design quanh stateless (token JWT thay session cookie).
