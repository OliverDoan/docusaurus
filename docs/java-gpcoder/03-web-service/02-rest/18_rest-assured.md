---
sidebar_position: 18
title: "Test REST Web Service đơn giản hơn với REST Assured"
---

# Test REST Web Service đơn giản hơn với REST Assured

REST Assured là thư viện giúp viết test cho REST API với cú pháp Given-When-Then gần giống tiếng Anh, giảm rất nhiều code lặp so với cách dùng HttpClient thuần. Bài này hướng dẫn cấu hình REST Assured, viết test CRUD, kiểm tra JSON phức tạp với JsonPath, và test xác thực JWT.

## REST Assured là gì?

**REST Assured** là thư viện Java giúp kiểm thử REST API với cú pháp **Given-When-Then** rất tự nhiên, gần giống tiếng Anh. So với JUnit + HttpClient thông thường, REST Assured giảm đáng kể boilerplate code và làm cho test dễ đọc hơn.

### So sánh với JUnit thuần

```java
// JUnit thuần — nhiều code hơn
HttpURLConnection conn = (HttpURLConnection) new URL("http://localhost:8080/api/products").openConnection();
conn.setRequestMethod("GET");
int status = conn.getResponseCode();
assertEquals(200, status);
// Đọc body, parse JSON, assert từng field...

// REST Assured — ngắn gọn, tự nhiên
given()
    .when().get("/products")
    .then().statusCode(200);
```

## Cấu hình Maven

```xml
<dependencies>
    <!-- REST Assured core -->
    <dependency>
        <groupId>io.rest-assured</groupId>
        <artifactId>rest-assured</artifactId>
        <version>5.4.0</version>
        <scope>test</scope>
    </dependency>

    <!-- Hỗ trợ JSON path -->
    <dependency>
        <groupId>io.rest-assured</groupId>
        <artifactId>json-path</artifactId>
        <version>5.4.0</version>
        <scope>test</scope>
    </dependency>

    <!-- Hỗ trợ XML path (nếu cần) -->
    <dependency>
        <groupId>io.rest-assured</groupId>
        <artifactId>xml-path</artifactId>
        <version>5.4.0</version>
        <scope>test</scope>
    </dependency>

    <!-- JUnit 5 -->
    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter</artifactId>
        <version>5.10.2</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

## Cấu hình base URL

```java
package com.example.test;

import io.restassured.RestAssured;
import org.junit.jupiter.api.BeforeAll;

public class BaseTest {

    @BeforeAll
    static void setUp() {
        // Cấu hình base URL — không cần lặp lại trong mỗi test
        RestAssured.baseURI = "http://localhost";
        RestAssured.port = 8080;
        RestAssured.basePath = "/api";

        // Bật logging khi test thất bại
        RestAssured.enableLoggingOfRequestAndResponseIfValidationFails();
    }
}
```

## Given-When-Then Pattern

**Given** (đặt trước) → **When** (khi nào) → **Then** (thì) là cấu trúc BDD (Behavior Driven Development — phát triển hướng hành vi) giúp test dễ đọc như tiếng Anh.

```java
package com.example.test;

import io.restassured.http.ContentType;
import org.junit.jupiter.api.*;

import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

/**
 * Test CRUD cho Product API bằng REST Assured
 * Server phải đang chạy tại localhost:8080
 */
class ProductApiTest extends BaseTest {

    @Test
    @DisplayName("GET /products - Trả về 200 và JSON array")
    void testGetAllProducts() {
        given()
            .accept(ContentType.JSON)        // Header: Accept: application/json
        .when()
            .get("/products")               // Gọi GET /api/products
        .then()
            .statusCode(200)                // Kiểm tra status 200
            .contentType(ContentType.JSON)  // Kiểm tra Content-Type là JSON
            .body("$", not(empty()))        // Body không rỗng
            .body("size()", greaterThan(0)); // Có ít nhất 1 phần tử
    }

    @Test
    @DisplayName("GET /products/{id} - Trả về sản phẩm đúng")
    void testGetProductById() {
        given()
            .pathParam("id", 1)  // Path parameter
        .when()
            .get("/products/{id}")
        .then()
            .statusCode(200)
            // Dùng JsonPath để kiểm tra từng field trong JSON
            .body("id", equalTo(1))
            .body("name", notNullValue())
            .body("price", greaterThan(0f));
    }

    @Test
    @DisplayName("GET /products/{id} - Trả về 404 khi không tồn tại")
    void testGetProductById_NotFound() {
        when()
            .get("/products/99999")
        .then()
            .statusCode(404);
    }

    @Test
    @DisplayName("POST /products - Tạo thành công và trả về 201")
    void testCreateProduct() {
        // Dữ liệu JSON dạng String
        String newProduct = """
            {
                "name": "Webcam Logitech C920",
                "price": 2200000,
                "category": "Camera"
            }
            """;

        given()
            .contentType(ContentType.JSON)  // Header: Content-Type: application/json
            .body(newProduct)               // Request body
        .when()
            .post("/products")
        .then()
            .statusCode(201)
            .body("id", greaterThan(0))     // ID được tạo tự động
            .body("name", equalTo("Webcam Logitech C920"))
            .body("price", equalTo(2200000f));
    }

    @Test
    @DisplayName("POST /products - Trả về 400 khi tên rỗng")
    void testCreateProduct_InvalidName() {
        String invalidProduct = "{\"name\": \"\", \"price\": 1000}";

        given()
            .contentType(ContentType.JSON)
            .body(invalidProduct)
        .when()
            .post("/products")
        .then()
            .statusCode(400)
            .body("error", containsString("Tên"));  // Kiểm tra message lỗi
    }

    @Test
    @DisplayName("PUT /products/{id} - Cập nhật thành công")
    void testUpdateProduct() {
        String updatedProduct = """
            {
                "name": "Laptop Dell XPS 15 (2024)",
                "price": 38000000,
                "category": "Laptop"
            }
            """;

        given()
            .contentType(ContentType.JSON)
            .body(updatedProduct)
        .when()
            .put("/products/1")
        .then()
            .statusCode(200)
            .body("name", equalTo("Laptop Dell XPS 15 (2024)"));
    }

    @Test
    @DisplayName("DELETE /products/{id} - Xóa thành công trả về 204")
    void testDeleteProduct() {
        when()
            .delete("/products/2")
        .then()
            .statusCode(204);
    }
}
```

## Kiểm tra JSON phức tạp với JsonPath

```java
@Test
@DisplayName("Kiểm tra cấu trúc JSON phân trang")
void testGetProductsPaged() {
    given()
        .queryParam("page", 1)
        .queryParam("size", 5)
    .when()
        .get("/products")
    .then()
        .statusCode(200)
        // Kiểm tra cấu trúc phân trang
        .body("data", hasSize(lessThanOrEqualTo(5)))
        .body("page", equalTo(1))
        .body("total", greaterThanOrEqualTo(0))
        // Kiểm tra nested field trong mỗi phần tử
        .body("data.id",    everyItem(greaterThan(0)))
        .body("data.name",  everyItem(notNullValue()))
        .body("data.price", everyItem(greaterThan(0f)));
}

@Test
@DisplayName("Lấy giá trị từ response và dùng trong request tiếp theo")
void testCreateAndGet() {
    // Bước 1: Tạo sản phẩm và lấy ID từ response
    String body = """
        {"name": "Tai nghe AirPods", "price": 4500000}
        """;

    // extract() — lấy giá trị từ response để dùng tiếp
    int createdId = given()
        .contentType(ContentType.JSON)
        .body(body)
    .when()
        .post("/products")
    .then()
        .statusCode(201)
    .extract()
        .path("id");  // Lấy field "id" từ JSON response

    // Bước 2: Kiểm tra sản phẩm vừa tạo
    given()
        .pathParam("id", createdId)
    .when()
        .get("/products/{id}")
    .then()
        .statusCode(200)
        .body("name", equalTo("Tai nghe AirPods"));
}
```

## Test Authentication với JWT

```java
@Test
@DisplayName("GET /auth/login - Đăng nhập thành công, nhận token")
void testLogin_Success() {
    String credentials = """
        {"username": "admin", "password": "password123"}
        """;

    // Lấy token từ response
    String token = given()
        .contentType(ContentType.JSON)
        .body(credentials)
    .when()
        .post("/auth/login")
    .then()
        .statusCode(200)
        .body("accessToken", notNullValue())
        .body("tokenType", equalTo("Bearer"))
    .extract()
        .path("accessToken");

    // Dùng token để gọi API bảo vệ
    given()
        .header("Authorization", "Bearer " + token)
    .when()
        .get("/v1/me")
    .then()
        .statusCode(200)
        .body("username", equalTo("admin"))
        .body("role", equalTo("ADMIN"));
}

@Test
@DisplayName("GET /v1/me - Trả về 401 khi không có token")
void testProtectedEndpoint_withoutToken() {
    when()
        .get("/v1/me")
    .then()
        .statusCode(401)
        .body("error", notNullValue());
}
```

## Test Upload File

```java
@Test
@DisplayName("POST /files/upload - Upload file thành công")
void testFileUpload() {
    given()
        .multiPart("file", new java.io.File("/tmp/test.txt"), "text/plain")
        .multiPart("description", "File test")
    .when()
        .post("/files/upload")
    .then()
        .statusCode(201)
        .body("message", containsString("thành công"));
}
```

## Tóm tắt

REST Assured cung cấp DSL (Domain Specific Language — ngôn ngữ đặc thù miền) Given-When-Then cho phép viết test API như đọc văn bản tiếng Anh. `body()` với Hamcrest matchers giúp kiểm tra JSON linh hoạt. `extract()` cho phép lấy giá trị từ response để dùng trong test tiếp theo — rất hữu ích cho test flows (luồng). REST Assured phù hợp nhất cho integration test khi server đang chạy.
