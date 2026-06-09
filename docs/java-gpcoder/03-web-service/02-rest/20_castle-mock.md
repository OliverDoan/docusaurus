---
sidebar_position: 20
title: "Giới thiệu Castle Mock - Mock REST API và SOAP web service"
---

# Giới thiệu Castle Mock - Mock REST API và SOAP web service

Castle Mock là công cụ tạo server giả lập (mock) cho REST API và SOAP, giúp bạn phát triển và test mà không cần service thật phải sẵn sàng. Điều này rất hữu ích khi frontend và backend làm song song, hoặc khi cần giả lập các tình huống lỗi. Bài này hướng dẫn cài đặt, tạo mock server với Castle Mock, và so sánh với WireMock cho test trong code.

## Castle Mock là gì?

**Castle Mock** là công cụ mã nguồn mở cho phép tạo **mock server** (máy chủ giả lập) cho REST API và SOAP web service. Thay vì gọi đến service thật (có thể chưa tồn tại, không ổn định, hoặc tốn phí), bạn tạo ra một server giả trả về dữ liệu được định sẵn.

**Mock** (giả lập) trong ngữ cảnh này là thay thế một service thật bằng một phiên bản giả có hành vi có thể dự đoán.

## Tại sao cần Mock Server?

1. **Phát triển song song**: Frontend và backend develop đồng thời, frontend dùng mock API.
2. **Isolated testing** (kiểm thử cô lập): Test không phụ thuộc vào service bên thứ ba.
3. **API chưa sẵn sàng**: Partner API chưa release, dùng mock để phát triển trước.
4. **Kiểm soát scenario**: Dễ dàng giả lập lỗi (404, 500, timeout) để test error handling.
5. **Tiết kiệm chi phí**: Không cần gọi API tính phí (SMS, email, payment) khi test.

## Castle Mock vs các công cụ tương tự

| Công cụ | Loại | Giao diện | SOAP | Lưu trữ |
|---|---|---|---|---|
| Castle Mock | Standalone app | Web UI | Có | Persistent |
| WireMock | Library/Standalone | API/Admin | Hạn chế | In-memory/File |
| Mockoon | Standalone | Desktop GUI | Không | File |
| Postman Mock | SaaS | Web | Không | Cloud |

## Cài đặt Castle Mock

### Cách 1: Docker (khuyến nghị)

```bash
# Chạy Castle Mock với Docker
docker run -d \
    -p 8080:8080 \
    --name castlemock \
    --restart unless-stopped \
    castlemock/castlemock:latest

# Truy cập Web UI
# http://localhost:8080/castlemock
# Tài khoản mặc định: admin / admin
```

### Cách 2: JAR standalone

```bash
# Tải file JAR từ GitHub releases
wget https://github.com/castlemock/castlemock/releases/latest/download/castlemock.jar

# Chạy
java -jar castlemock.jar --server.port=8080
```

## Tạo Mock REST API

### Bước 1: Tạo Project

1. Đăng nhập vào `http://localhost:8080/castlemock`
2. Vào **REST** > **New project**
3. Đặt tên: `Product API Mock`

### Bước 2: Import OpenAPI/Swagger Spec

Castle Mock hỗ trợ import từ Swagger/OpenAPI — tự động tạo mock từ spec:

1. Vào project > **Import** > **Swagger (OpenAPI)**
2. Dán URL hoặc upload file `openapi.yaml`
3. Castle Mock tự tạo tất cả endpoints

### Bước 3: Cấu hình Mock Response thủ công

Nếu không có spec, tạo thủ công:

```
Project: Product API Mock
  └── REST Application: /api
        └── Resource: /products
              ├── Method: GET
              │     └── Response: 200 OK
              │           Body: [{"id":1,"name":"Laptop Dell","price":35000000}]
              ├── Method: POST
              │     └── Response: 201 Created
              │           Body: {"id":99,"name":"New Product","price":0}
              └── Resource: /products/{id}
                    ├── Method: GET
                    │     ├── Response: 200 OK (default)
                    │     └── Response: 404 Not Found
                    └── Method: DELETE
                          └── Response: 204 No Content
```

## Sử dụng Castle Mock trong Java

Khi Castle Mock chạy, gọi API như bình thường — chỉ đổi base URL:

```java
package com.example.client;

import jakarta.ws.rs.client.*;
import jakarta.ws.rs.core.*;
import java.util.List;

public class MockApiExample {

    // URL của Castle Mock thay vì server thật
    private static final String MOCK_BASE_URL = "http://localhost:8080/castlemock/mock/rest/project/abc123/application/xyz";
    // URL server thật: "http://api.example.com"

    private final Client client;
    private final String baseUrl;

    public MockApiExample(boolean useMock) {
        this.client = ClientBuilder.newClient();
        // Chọn URL dựa trên môi trường
        this.baseUrl = useMock ? MOCK_BASE_URL : "http://api.example.com";
    }

    public String getAllProducts() {
        return client.target(baseUrl)
            .path("/products")
            .request(MediaType.APPLICATION_JSON)
            .get(String.class);
    }

    public static void main(String[] args) {
        // Môi trường dev: dùng mock
        boolean isDev = System.getenv("ENVIRONMENT") == null
                     || System.getenv("ENVIRONMENT").equals("dev");

        MockApiExample demo = new MockApiExample(isDev);
        System.out.println("Products: " + demo.getAllProducts());
    }
}
```

## Cấu hình Mock Response nâng cao

### Dynamic Response với Template

Castle Mock hỗ trợ **Velocity Template** (ngôn ngữ template Java) để tạo response động:

```
# Response Body Template (Velocity)
{
    "id": ${request.path[0]},
    "name": "Mock Product ${request.path[0]}",
    "price": #set($price = 1000000 * ${request.path[0]})$price,
    "timestamp": "${mockRequest.currentDate}"
}
```

Khi gọi `GET /products/5`, trả về:
```json
{
    "id": 5,
    "name": "Mock Product 5",
    "price": 5000000
}
```

### Giả lập lỗi để test Error Handling

```java
// Test xử lý lỗi 503 Service Unavailable
@Test
void testWhenPaymentServiceDown() {
    // Castle Mock đã cấu hình /payment endpoint trả về 503

    Response response = client.target(MOCK_BASE_URL)
        .path("/payment/process")
        .request()
        .post(Entity.json("{\"amount\": 100000}"));

    assertThat(response.getStatus()).isEqualTo(503);

    // Kiểm tra ứng dụng xử lý lỗi đúng cách (fallback, retry...)
}
```

## WireMock — Alternative trong code

**WireMock** là thư viện giả lập HTTP server ngay trong JUnit test (không cần chạy ứng dụng riêng):

```xml
<dependency>
    <groupId>com.github.tomakehurst</groupId>
    <artifactId>wiremock-jre8-standalone</artifactId>
    <version>2.35.2</version>
    <scope>test</scope>
</dependency>
```

```java
package com.example.test;

import com.github.tomakehurst.wiremock.WireMockServer;
import org.junit.jupiter.api.*;

import static com.github.tomakehurst.wiremock.client.WireMock.*;

/**
 * WireMock — khởi động mock server ngay trong JUnit test
 * Phù hợp khi không muốn cài thêm ứng dụng riêng
 */
class PaymentServiceTest {

    private WireMockServer wireMockServer;

    @BeforeEach
    void setUp() {
        // Khởi động mock server ở port 9090
        wireMockServer = new WireMockServer(9090);
        wireMockServer.start();

        // Cấu hình: GET /payment/status/123 trả về JSON
        wireMockServer.stubFor(
            get(urlEqualTo("/payment/status/123"))
                .willReturn(
                    aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"transactionId\": \"123\", \"status\": \"SUCCESS\"}")
                )
        );

        // Cấu hình lỗi: POST /payment/process trả về 503
        wireMockServer.stubFor(
            post(urlEqualTo("/payment/process"))
                .willReturn(
                    aResponse()
                        .withStatus(503)
                        .withFixedDelay(5000)  // Giả lập latency 5 giây
                        .withBody("{\"error\": \"Service không khả dụng\"}")
                )
        );
    }

    @AfterEach
    void tearDown() {
        wireMockServer.stop();
    }

    @Test
    void testCheckPaymentStatus() {
        // Gọi mock server
        var response = ClientBuilder.newClient()
            .target("http://localhost:9090/payment/status/123")
            .request()
            .get();

        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(response.readEntity(String.class)).contains("SUCCESS");

        // Verify mock được gọi đúng
        wireMockServer.verify(1, getRequestedFor(urlEqualTo("/payment/status/123")));
    }
}
```

## Tóm tắt

Castle Mock là giải pháp toàn diện để giả lập REST và SOAP, có Web UI thân thiện, hỗ trợ import Swagger/WSDL tự động. WireMock phù hợp hơn khi cần mock nhúng vào test code (không cần server riêng). Mock server là công cụ thiết yếu trong phát triển microservice và test tích hợp — giúp làm việc độc lập mà không cần tất cả service phải chạy.
