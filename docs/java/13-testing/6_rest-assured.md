---
sidebar_position: 6
title: "6. REST Assured"
---

# 6. REST Assured

REST Assured là thư viện Java giúp test các REST API với cú pháp dễ đọc gần như tiếng Anh tự nhiên (given - when - then). Thay vì tự viết code gửi HTTP, đọc JSON rồi so sánh, bạn viết test ngắn gọn để kiểm tra status code và nội dung phản hồi. Bài này hướng dẫn cách dùng REST Assured qua nhiều ví dụ; chi tiết nằm bên dưới.

---

## Mục lục

- [REST Assured là gì?](#rest-assured-là-gì)
- [Ôn lại nhanh: REST API là gì?](#ôn-lại-nhanh-rest-api-là-gì)
- [Cài đặt REST Assured](#cài-đặt-rest-assured)
- [Cú pháp given - when - then](#cú-pháp-given---when---then)
- [Kiểm tra status code](#kiểm-tra-status-code)
- [Kiểm tra nội dung JSON trong body](#kiểm-tra-nội-dung-json-trong-body)
- [Gửi dữ liệu trong request (POST)](#gửi-dữ-liệu-trong-request-post)
- [Ví dụ đầy đủ](#ví-dụ-đầy-đủ)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## REST Assured là gì?

**REST Assured** là một thư viện Java giúp **test (kiểm thử) các REST API** một cách dễ đọc, gần như viết bằng tiếng Anh tự nhiên.

Thay vì viết code thủ công để gửi yêu cầu HTTP, đọc phản hồi, phân tích JSON rồi so sánh, REST Assured cho phép bạn viết gọn theo kiểu:

> "**Cho** (given) các điều kiện này, **khi** (when) gọi API kia, **thì** (then) kết quả phải như thế này."

Đây là công cụ rất phổ biến để kiểm thử **API tích hợp** (gọi API thật và kiểm tra phản hồi).

## Ôn lại nhanh: REST API là gì?

**REST API** là cách các ứng dụng giao tiếp với nhau qua giao thức HTTP. Một lời gọi API gồm:

- **Method (phương thức)**: `GET` (lấy dữ liệu), `POST` (tạo mới), `PUT` (cập nhật), `DELETE` (xóa).
- **URL (đường dẫn)**: ví dụ `/users/1`.
- **Body (nội dung)**: dữ liệu gửi đi, thường ở dạng **JSON**.
- **Response (phản hồi)**: gồm **status code (mã trạng thái)** như `200` (thành công), `404` (không tìm thấy), `201` (đã tạo), và **body** chứa dữ liệu trả về.

> Ví dụ đời thường: API như nhân viên phục vụ ở nhà hàng. Bạn (client) gọi món (request), nhân viên mang đồ ăn ra (response). Mã `200` nghĩa là "đã phục vụ xong", `404` nghĩa là "món này không có trong menu".

## Cài đặt REST Assured

Với **Maven**:

```xml
<dependency>
    <groupId>io.rest-assured</groupId>
    <artifactId>rest-assured</artifactId>
    <version>5.4.0</version>
    <scope>test</scope>
</dependency>
```

Với **Gradle**:

```groovy
testImplementation 'io.rest-assured:rest-assured:5.4.0'
```

## Cú pháp given - when - then

REST Assured dùng ba từ khóa nối tiếp nhau, đọc như một câu tiếng Anh:

- **`given()`** — *Cho*: thiết lập điều kiện trước khi gọi (header, tham số, body...).
- **`when()`** — *Khi*: thực hiện lời gọi (`get`, `post`...).
- **`then()`** — *Thì*: kiểm tra kết quả (status code, body...).

```java
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import org.junit.jupiter.api.Test;

class UserApiTest {

    @Test
    void layThongTinNguoiDung() {
        given()                                  // Cho: (không cần thiết lập gì thêm)
            .baseUri("http://localhost:8080")    // địa chỉ gốc của server
        .when()
            .get("/users/1")                     // Khi: gọi GET /users/1
        .then()
            .statusCode(200)                     // Thì: mã trạng thái phải là 200
            .body("name", equalTo("An"));        // và trường name phải là "An"
    }
}
```

## Kiểm tra status code

Phương thức **`statusCode(...)`** kiểm tra mã trạng thái HTTP của phản hồi:

```java
@Test
void kiemTraCacMaTrangThai() {
    // Người dùng tồn tại -> 200 OK
    given().baseUri("http://localhost:8080")
        .when().get("/users/1")
        .then().statusCode(200);

    // Người dùng không tồn tại -> 404 Not Found
    given().baseUri("http://localhost:8080")
        .when().get("/users/9999")
        .then().statusCode(404);
}
```

Các mã thường gặp: `200` (OK), `201` (Created - đã tạo), `204` (No Content - thành công nhưng không trả body), `400` (Bad Request - dữ liệu sai), `401` (chưa xác thực), `404` (không tìm thấy), `500` (lỗi server).

## Kiểm tra nội dung JSON trong body

Giả sử API trả về JSON:

```json
{
  "id": 1,
  "name": "An",
  "email": "an@example.com",
  "roles": ["admin", "user"]
}
```

REST Assured dùng cú pháp **JsonPath** để truy cập từng trường, kết hợp với các **matcher** của thư viện Hamcrest như `equalTo`, `hasItem`, `hasSize`:

```java
import static org.hamcrest.Matchers.*;

@Test
void kiemTraNoiDungJson() {
    given().baseUri("http://localhost:8080")
        .when().get("/users/1")
        .then()
            .statusCode(200)
            .body("id", equalTo(1))                  // trường id = 1
            .body("name", equalTo("An"))             // trường name = "An"
            .body("email", containsString("@"))      // email chứa ký tự @
            .body("roles", hasSize(2))               // mảng roles có 2 phần tử
            .body("roles", hasItem("admin"));        // roles chứa "admin"
}
```

> JsonPath dùng dấu chấm để đi sâu vào JSON lồng nhau, ví dụ `"address.city"` lấy `city` bên trong `address`.

## Gửi dữ liệu trong request (POST)

Khi tạo mới dữ liệu, ta gửi JSON trong body bằng `.body(...)` và đặt header `Content-Type`:

```java
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;

@Test
void taoNguoiDungMoi() {
    String jsonGui = """
        {
          "name": "Bình",
          "email": "binh@example.com"
        }
        """;

    given()
        .baseUri("http://localhost:8080")
        .header("Content-Type", "application/json")  // báo server đây là JSON
        .body(jsonGui)                                // nội dung gửi đi
    .when()
        .post("/users")                               // gọi POST /users
    .then()
        .statusCode(201)                              // 201 = đã tạo thành công
        .body("id", notNullValue())                   // server trả về id mới (khác null)
        .body("name", equalTo("Bình"));               // tên đúng như đã gửi
}
```

## Ví dụ đầy đủ

Một bộ test hoàn chỉnh cho API người dùng, dùng `@BeforeAll` để cấu hình địa chỉ gốc một lần:

```java
import io.restassured.RestAssured;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

class UserApiTest {

    @BeforeAll  // chạy một lần: đặt địa chỉ gốc cho mọi test
    static void setUp() {
        RestAssured.baseURI = "http://localhost:8080";
    }

    @Test
    void layNguoiDungTonTai() {
        given()
        .when().get("/users/1")
        .then()
            .statusCode(200)
            .body("name", equalTo("An"));
    }

    @Test
    void layNguoiDungKhongTonTaiTraVe404() {
        given()
        .when().get("/users/9999")
        .then().statusCode(404);
    }

    @Test
    void taoNguoiDungMoiThanhCong() {
        given()
            .header("Content-Type", "application/json")
            .body("{ \"name\": \"Bình\", \"email\": \"binh@example.com\" }")
        .when().post("/users")
        .then()
            .statusCode(201)
            .body("id", notNullValue());
    }

    @Test
    void taoNguoiDungThieuTenTraVe400() {
        given()
            .header("Content-Type", "application/json")
            .body("{ \"email\": \"loi@example.com\" }")  // thiếu name -> dữ liệu sai
        .when().post("/users")
        .then().statusCode(400);  // server từ chối với 400 Bad Request
    }
}
```

> Lưu ý: các test này cần server đang chạy ở `localhost:8080`. Trong dự án Spring Boot, ta thường kết hợp với `@SpringBootTest(webEnvironment = RANDOM_PORT)` để tự khởi động server khi test.

## Lỗi thường gặp

1. **Quên server chưa chạy**: REST Assured gọi API thật, nếu server không chạy sẽ lỗi kết nối. Hãy đảm bảo server (hoặc môi trường test) đã sẵn sàng.
2. **Quên header `Content-Type`**: Gửi JSON mà không khai báo `application/json` khiến server không hiểu body, thường trả về `415` hoặc `400`.
3. **Sai JsonPath**: Viết sai tên trường (ví dụ `userName` thay vì `name`) làm test fail dù API đúng. Kiểm tra kỹ cấu trúc JSON thực tế.
4. **Hard-code URL cố định**: Viết cứng cổng `8080` gây lỗi khi chạy với cổng ngẫu nhiên. Nên lấy cổng động khi tích hợp Spring Boot.
5. **Không kiểm tra cả trường hợp lỗi**: Chỉ test "đường đi đúng" mà quên test 404/400 khiến bỏ sót lỗi xử lý ngoại lệ của API.

## Tóm tắt

- **REST Assured** là thư viện Java để test REST API với cú pháp dễ đọc như tiếng Anh.
- Cú pháp cốt lõi: **`given()`** (cho) → **`when()`** (khi gọi) → **`then()`** (thì kiểm tra).
- **`statusCode(...)`** kiểm tra mã trạng thái HTTP (200, 201, 404, 400...).
- Dùng **JsonPath** + matcher (`equalTo`, `hasItem`, `hasSize`...) để kiểm tra nội dung JSON trong body.
- Gửi dữ liệu POST bằng `.body(...)` kèm header `Content-Type: application/json`.
- Nên test cả trường hợp thành công lẫn trường hợp lỗi.
- Bài tiếp theo: **JMeter** — công cụ test hiệu năng và tải.
