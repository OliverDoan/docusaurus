---
sidebar_position: 11
title: "Tạo ứng dụng Java RESTful Client không dùng thư viện bên thứ ba (HttpURLConnection)"
---

# Tạo ứng dụng Java RESTful Client không dùng thư viện bên thứ ba (HttpURLConnection)

## Tổng quan

Java cung cấp sẵn `HttpURLConnection` (kết nối HTTP URL) từ phiên bản 1.1, và `HttpClient` mới hơn từ Java 11. Hai class này không cần dependency bên thứ ba, phù hợp khi muốn giữ ứng dụng nhẹ hoặc làm việc trong môi trường hạn chế.

## HttpURLConnection (Java 1.1+)

**HttpURLConnection** là class cũ nhưng vẫn dùng được, hỗ trợ đầy đủ HTTP/1.1.

```java
package com.example.client;

import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;

public class HttpURLConnectionClient {

    private static final String BASE_URL = "http://localhost:8080/api/products";

    /**
     * Phương thức tiện ích để tạo connection
     */
    private static HttpURLConnection createConnection(String url, String method)
            throws IOException {
        URL endpoint = new URL(url);
        HttpURLConnection conn = (HttpURLConnection) endpoint.openConnection();

        conn.setRequestMethod(method);
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("Accept", "application/json");

        // setDoInput(true) — cho phép đọc response body
        conn.setDoInput(true);
        // setConnectTimeout — thời gian tối đa để kết nối (milliseconds)
        conn.setConnectTimeout(5000);
        // setReadTimeout — thời gian tối đa để đọc response (milliseconds)
        conn.setReadTimeout(10000);

        return conn;
    }

    /**
     * Đọc response body từ InputStream
     */
    private static String readResponse(InputStream inputStream) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }
        return sb.toString();
    }

    /**
     * GET request — lấy danh sách sản phẩm
     */
    public static String getAll() throws IOException {
        HttpURLConnection conn = createConnection(BASE_URL, "GET");

        int statusCode = conn.getResponseCode();
        System.out.println("GET - Status: " + statusCode);

        if (statusCode >= 200 && statusCode < 300) {
            // getInputStream() — luồng đọc response thành công (2xx)
            return readResponse(conn.getInputStream());
        } else {
            // getErrorStream() — luồng đọc response lỗi (4xx, 5xx)
            return readResponse(conn.getErrorStream());
        }
    }

    /**
     * GET với Path Parameter
     */
    public static String getById(int id) throws IOException {
        HttpURLConnection conn = createConnection(BASE_URL + "/" + id, "GET");

        int statusCode = conn.getResponseCode();
        if (statusCode == 200) {
            return readResponse(conn.getInputStream());
        } else if (statusCode == 404) {
            System.out.println("Không tìm thấy sản phẩm ID: " + id);
            return null;
        }
        return readResponse(conn.getErrorStream());
    }

    /**
     * POST request — tạo sản phẩm mới
     * setDoOutput(true) — bắt buộc khi có request body (POST, PUT)
     */
    public static String create(String jsonBody) throws IOException {
        HttpURLConnection conn = createConnection(BASE_URL, "POST");
        conn.setDoOutput(true); // Cho phép ghi request body

        // Ghi JSON body vào OutputStream
        try (OutputStream os = conn.getOutputStream()) {
            byte[] data = jsonBody.getBytes(StandardCharsets.UTF_8);
            os.write(data, 0, data.length);
        }

        int statusCode = conn.getResponseCode();
        System.out.println("POST - Status: " + statusCode);

        InputStream responseStream = (statusCode >= 200 && statusCode < 300)
            ? conn.getInputStream()
            : conn.getErrorStream();

        return readResponse(responseStream);
    }

    /**
     * PUT request — cập nhật sản phẩm
     */
    public static String update(int id, String jsonBody) throws IOException {
        HttpURLConnection conn = createConnection(BASE_URL + "/" + id, "PUT");
        conn.setDoOutput(true);

        try (OutputStream os = conn.getOutputStream()) {
            os.write(jsonBody.getBytes(StandardCharsets.UTF_8));
        }

        int statusCode = conn.getResponseCode();
        System.out.println("PUT - Status: " + statusCode);
        return statusCode < 400 ? readResponse(conn.getInputStream()) : null;
    }

    /**
     * DELETE request
     */
    public static int delete(int id) throws IOException {
        HttpURLConnection conn = createConnection(BASE_URL + "/" + id, "DELETE");
        int statusCode = conn.getResponseCode();
        System.out.println("DELETE - Status: " + statusCode);
        return statusCode;
    }

    /**
     * GET với Authentication header
     */
    public static String getWithAuth(String url, String token) throws IOException {
        HttpURLConnection conn = createConnection(url, "GET");
        // Thêm Authorization header
        conn.setRequestProperty("Authorization", "Bearer " + token);

        int statusCode = conn.getResponseCode();
        if (statusCode == 401) {
            throw new IOException("Xác thực thất bại — token không hợp lệ");
        }
        return readResponse(conn.getInputStream());
    }

    public static void main(String[] args) {
        try {
            // GET all
            System.out.println("=== GET ALL ===");
            System.out.println(getAll());

            // GET by ID
            System.out.println("\n=== GET BY ID ===");
            System.out.println(getById(1));

            // POST
            System.out.println("\n=== POST ===");
            String newProduct = "{\"name\": \"Tai nghe Sony\", \"price\": 2500000}";
            System.out.println(create(newProduct));

            // DELETE
            System.out.println("\n=== DELETE ===");
            int deleteStatus = delete(3);
            System.out.println("Kết quả xóa: " + (deleteStatus == 204 ? "Thành công" : "Thất bại"));

        } catch (IOException e) {
            System.err.println("Lỗi kết nối: " + e.getMessage());
        }
    }
}
```

## HttpClient (Java 11+)

**`HttpClient`** (Java 11) là API hiện đại hơn, hỗ trợ HTTP/2, async, và có API fluent gọn hơn.

```java
package com.example.client;

import java.net.*;
import java.net.http.*;
import java.time.Duration;
import java.nio.charset.StandardCharsets;

public class JavaHttpClientExample {

    private static final String BASE_URL = "http://localhost:8080/api/products";

    // HttpClient nên được tạo một lần và tái sử dụng (thread-safe)
    private static final HttpClient httpClient = HttpClient.newBuilder()
        .version(HttpClient.Version.HTTP_2)          // Ưu tiên HTTP/2
        .connectTimeout(Duration.ofSeconds(5))        // Timeout kết nối
        .followRedirects(HttpClient.Redirect.NORMAL)  // Tự động follow redirect
        .build();

    /**
     * GET request đồng bộ (blocking)
     */
    public static String getAll() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(BASE_URL))
            .header("Accept", "application/json")
            .timeout(Duration.ofSeconds(10))
            .GET() // Mặc định là GET, có thể bỏ qua
            .build();

        // send() — gửi request và chờ response (blocking)
        HttpResponse<String> response = httpClient.send(
            request,
            HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8)
        );

        System.out.println("Status: " + response.statusCode());
        return response.body();
    }

    /**
     * POST request với JSON body
     */
    public static String create(String jsonBody) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(BASE_URL))
            .header("Content-Type", "application/json")
            .header("Accept", "application/json")
            // POST với body dạng String
            .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
            .build();

        HttpResponse<String> response = httpClient.send(
            request,
            HttpResponse.BodyHandlers.ofString()
        );

        System.out.println("POST Status: " + response.statusCode());
        return response.body();
    }

    /**
     * Gọi API bất đồng bộ (non-blocking) với CompletableFuture
     * sendAsync() — trả về CompletableFuture, không chặn thread hiện tại
     */
    public static void getAllAsync() {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(BASE_URL))
            .header("Accept", "application/json")
            .build();

        httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
            .thenApply(HttpResponse::body)
            .thenAccept(body -> System.out.println("Kết quả async: " + body))
            .exceptionally(e -> {
                System.err.println("Lỗi async: " + e.getMessage());
                return null;
            });
        // Tiếp tục thực thi ngay mà không chờ response
        System.out.println("Đã gửi request async, đang xử lý...");
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== Java 11 HttpClient ===");
        System.out.println(getAll());

        String body = "{\"name\": \"Webcam Logitech\", \"price\": 1200000}";
        System.out.println(create(body));

        getAllAsync();
        Thread.sleep(2000); // Chờ async hoàn thành
    }
}
```

## So sánh các cách tiếp cận

| Tiêu chí | HttpURLConnection | Java HttpClient (11+) | Jersey Client |
|---|---|---|---|
| Phiên bản | Java 1.1+ | Java 11+ | Cần dependency |
| API | Verbose | Fluent, hiện đại | Fluent, phong phú |
| Async | Không | Có (CompletableFuture) | Có |
| HTTP/2 | Không | Có | Hạn chế |
| JSON tự động | Không | Không | Có (với Jackson) |
| Phù hợp | Môi trường hạn chế | Dự án Java 11+ | Dự án Jersey |

## Tóm tắt

`HttpURLConnection` là lựa chọn khi không thể thêm dependency, nhưng code verbose. `HttpClient` từ Java 11 cung cấp API hiện đại hơn với hỗ trợ HTTP/2 và async. Khi làm việc với JSON, nên dùng thư viện như Jackson để parse thay vì xử lý thủ công.
