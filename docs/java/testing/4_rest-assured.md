---
sidebar_position: 4
title: "4. REST Assured (API Testing)"
---

# REST Assured -- Test REST API

**REST Assured** là thư viện Java **chuyên dụng test REST API** -- cú pháp BDD (Given-When-Then) đẹp, mạnh mẽ. Là **chuẩn de facto** cho integration test REST trong Java.

**Tương tự đơn giản:** REST Assured giống **Postman + assertion** trong code Java. Bạn gửi HTTP request, check response, JSON path -- tất cả trong test code.

---

## Mục lục

- [1. REST Assured là gì?](#1-rest-assured-là-gì)
- [2. Cài đặt](#2-cài-đặt)
- [3. Cú pháp BDD](#3-cú-pháp-bdd)
- [4. Verify response](#4-verify-response)
- [5. Authentication](#5-authentication)
- [6. Extract response](#6-extract-response)
- [7. Tích hợp Spring Boot Test](#7-tích-hợp-spring-boot-test)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. REST Assured là gì?

Đặc điểm:

- **DSL fluent** -- cú pháp đẹp như tiếng Anh
- **BDD style** -- given().when().then()
- **JSON Path / XML Path** -- assert nested response
- **Schema validation** -- check JSON schema
- **OAuth2, JWT** -- built-in
- **Spring MockMvc/WebTestClient** thay thế REST Assured trong test Spring

---

## 2. Cài đặt

```xml
<dependency>
    <groupId>io.rest-assured</groupId>
    <artifactId>rest-assured</artifactId>
    <version>5.3.2</version>
    <scope>test</scope>
</dependency>

<!-- JSON path matcher cho schema validation -->
<dependency>
    <groupId>io.rest-assured</groupId>
    <artifactId>json-schema-validator</artifactId>
    <version>5.3.2</version>
    <scope>test</scope>
</dependency>
```

---

## 3. Cú pháp BDD

```java
import io.restassured.RestAssured;
import org.junit.jupiter.api.Test;
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

public class UserApiTest {

    @Test
    public void getUser_returnsCorrectData() {
        given()
            .baseUri("http://localhost:8080")
            .contentType("application/json")
            .header("Authorization", "Bearer token")
        .when()
            .get("/api/users/1")
        .then()
            .statusCode(200)
            .body("name", equalTo("Alice"))
            .body("email", containsString("@"))
            .body("age", greaterThan(18));
    }
}
```

### POST với body

```java
@Test
public void createUser_returns201() {
    String body = """
        {
            "name": "Bob",
            "email": "bob@example.com"
        }
        """;

    given()
        .contentType("application/json")
        .body(body)
    .when()
        .post("/api/users")
    .then()
        .statusCode(201)
        .body("id", notNullValue())
        .body("name", equalTo("Bob"));
}
```

### Hoặc với object

```java
UserCreateDto dto = new UserCreateDto("Bob", "bob@example.com");

given()
    .contentType(ContentType.JSON)
    .body(dto)
.when()
    .post("/api/users")
.then()
    .statusCode(201);
```

---

## 4. Verify response

### Status, header, cookie

```java
.then()
    .statusCode(200)
    .header("Content-Type", containsString("application/json"))
    .cookie("SESSIONID", notNullValue())
    .time(lessThan(2000L));  // duoi 2s
```

### JSON Path

```java
// Truy cap nested
.body("user.name", equalTo("Alice"))
.body("user.address.city", equalTo("Hanoi"))

// Array
.body("users", hasSize(3))
.body("users[0].name", equalTo("Alice"))
.body("users.name", hasItems("Alice", "Bob"))

// Filter
.body("users.find { it.age > 18 }.name", equalTo("Alice"))

// Sum
.body("orders.price.sum()", equalTo(1500.0f))
```

### JSON Schema

```java
.body(matchesJsonSchemaInClasspath("schemas/user.json"))
```

`schemas/user.json`:

```json
{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
        "id": { "type": "integer" },
        "name": { "type": "string" },
        "email": { "type": "string", "format": "email" }
    },
    "required": ["id", "name", "email"]
}
```

---

## 5. Authentication

```java
// Basic Auth
given()
    .auth().basic("user", "pass")
.when().get("/secured");

// Bearer token
given()
    .header("Authorization", "Bearer " + token)
.when().get("/api");

// OAuth2
given()
    .auth().oauth2(token)
.when().get("/api");
```

### Login flow

```java
String token = given()
    .contentType(ContentType.JSON)
    .body(Map.of("username", "alice", "password", "secret"))
.when()
    .post("/login")
.then()
    .statusCode(200)
.extract().path("token");

given()
    .header("Authorization", "Bearer " + token)
.when().get("/api/me")
.then().statusCode(200);
```

---

## 6. Extract response

```java
// Toan bo response
Response response = given()...when().get("/users").then().extract().response();

String body = response.asString();
int status = response.statusCode();
String name = response.path("name");

// POJO
User user = given()
    .when().get("/users/1")
    .then().statusCode(200)
    .extract().as(User.class);

// List
List<User> users = given()
    .when().get("/users")
    .then().extract().jsonPath().getList(".", User.class);
```

---

## 7. Tích hợp Spring Boot Test

### REST Assured + `@SpringBootTest`

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class UserApiTest {

    @LocalServerPort
    int port;

    @BeforeEach
    void setUp() {
        RestAssured.baseURI = "http://localhost";
        RestAssured.port = port;
    }

    @Test
    void getUsers() {
        given().when().get("/api/users").then().statusCode(200);
    }
}
```

### Hoặc dùng MockMvc / WebTestClient (Spring native)

```java
@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired MockMvc mockMvc;

    @Test
    void getUser() throws Exception {
        mockMvc.perform(get("/api/users/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Alice"));
    }
}
```

MockMvc nhẹ hơn (không start server), nhưng REST Assured thực sự HTTP request.

---

## Khi nào dùng?

- **REST Assured khi:**
  - Test API integration (end-to-end)
  - Test API ngoài (3rd party)
  - Cần thực sự HTTP request
- **MockMvc khi:**
  - Test controller Spring (unit)
  - Nhanh, không cần real server
- **Best practice:**
  - **Base URI** ở `@BeforeAll`
  - **Static import** `RestAssured.*`, `Matchers.*`
  - DTO POJO cho request/response -- type-safe
  - Schema validation cho contract
  - Test data riêng -- không động chạm dữ liệu thật

---

## Lỗi thường gặp

### Lỗi 1: Quên `.then()` -> chain không chạy

```java
// SAI -- thieu .then() -- request van gui nhung khong verify
given().when().get("/users");

// DUNG
given().when().get("/users").then().statusCode(200);
```

### Lỗi 2: ContentType sai

```java
// SAI -- server expect JSON, gui form
given().body("name=Alice").post("/users");

// DUNG
given().contentType(ContentType.JSON).body(...).post("/users");
```

### Lỗi 3: JsonPath sai

```java
// JSON: {"user": {"name": "Alice"}}
.body("name", equalTo("Alice"))     // SAI -- name khong o root
.body("user.name", equalTo("Alice")) // DUNG
```

### Lỗi 4: Test phụ thuộc dữ liệu

```java
// SAI -- test 2 phu thuoc test 1 tao user
@Test void create() { ... }
@Test void delete() { delete("/users/1"); } // depends on test1

// DUNG -- moi test setup va cleanup riêng
```

---

## Câu hỏi phỏng vấn

### Câu 1: REST Assured là gì?

**Trả lời:** Thư viện Java test REST API với cú pháp BDD (`given-when-then`). Gửi HTTP request thật, verify response (status, header, JSON body). Phổ biến cho **integration test, contract test**.

### Câu 2: REST Assured vs MockMvc?

**Trả lời:**

- **REST Assured**: HTTP thật, full stack (network, server)
- **MockMvc** (Spring): mock servlet, không qua network -- nhanh hơn nhưng không test layer dưới

Dùng REST Assured khi cần test end-to-end. MockMvc khi test controller logic.

### Câu 3: JSON Path là gì?

**Trả lời:** Cú pháp truy cập field JSON như XPath cho XML. `user.address.city` -> truy cập nested. Hỗ trợ filter (`find`), aggregate (`sum`). Cho phép assert nested data dễ.

### Câu 4: Schema validation lợi ích gì?

**Trả lời:** Verify response **đúng format** -- field nào bắt buộc, type gì, regex pattern... Bảo vệ contract giữa frontend/backend. Khi BE đổi schema, test fail ngay -- biết để update spec.

### Câu 5: Test data trong API test?

**Trả lời:**

- **Database test riêng** (Testcontainers, H2)
- **Setup data ở `@BeforeEach`** -- mỗi test có data sạch
- **Cleanup ở `@AfterEach`** -- không leak giữa test
- **Tránh dùng dữ liệu production**
- **Test ID động** (UUID) -- không assert ID cụ thể
