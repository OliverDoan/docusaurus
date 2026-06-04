---
sidebar_position: 6
title: "REST Web service - Filter và Interceptor với Jersey 2.x (Phần 2)"
---

# REST Web service - Filter và Interceptor với Jersey 2.x (Phần 2)

## Interceptor là gì?

**Interceptor** (bộ chặn) trong JAX-RS hoạt động ở tầng sâu hơn Filter — nó can thiệp vào quá trình **đọc và ghi message body** (nội dung request/response). Trong khi Filter xử lý headers và metadata, Interceptor xử lý payload.

Hai loại Interceptor:

- **ReaderInterceptor** (bộ chặn đọc): Chặn khi JAX-RS đọc request body (deserialize JSON → Java object)
- **WriterInterceptor** (bộ chặn ghi): Chặn khi JAX-RS ghi response body (serialize Java object → JSON)

## ReaderInterceptor — Ghi log request body

```java
package com.example.rest.interceptor;

import jakarta.ws.rs.ext.*;
import jakarta.ws.rs.WebApplicationException;
import java.io.*;
import java.nio.charset.StandardCharsets;

/**
 * @Provider — đăng ký với Jersey runtime
 * ReaderInterceptor — chặn quá trình đọc (deserialize) request body
 */
@Provider
public class RequestBodyLoggingInterceptor implements ReaderInterceptor {

    @Override
    public Object aroundReadFrom(ReaderInterceptorContext context)
            throws IOException, WebApplicationException {

        // Đọc body gốc thành byte array
        InputStream originalStream = context.getInputStream();
        byte[] bodyBytes = originalStream.readAllBytes();
        String body = new String(bodyBytes, StandardCharsets.UTF_8);

        // Ghi log nội dung request body
        System.out.println("REQUEST BODY: " + (body.isEmpty() ? "(empty)" : body));

        // Bắt buộc: khôi phục lại InputStream để JAX-RS có thể đọc tiếp
        // Nếu không làm bước này, body sẽ bị mất và resource nhận được null
        context.setInputStream(new ByteArrayInputStream(bodyBytes));

        // proceed() — tiếp tục chuỗi interceptor, cuối cùng là deserialize thực sự
        return context.proceed();
    }
}
```

## WriterInterceptor — Ghi log response body

```java
package com.example.rest.interceptor;

import jakarta.ws.rs.ext.*;
import jakarta.ws.rs.WebApplicationException;
import java.io.*;
import java.nio.charset.StandardCharsets;

/**
 * WriterInterceptor — chặn quá trình ghi (serialize) response body
 */
@Provider
public class ResponseBodyLoggingInterceptor implements WriterInterceptor {

    @Override
    public void aroundWriteTo(WriterInterceptorContext context)
            throws IOException, WebApplicationException {

        // Thay thế OutputStream thật bằng buffer để đọc được nội dung
        OutputStream originalStream = context.getOutputStream();
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        context.setOutputStream(buffer);

        // Cho JAX-RS serialize object → JSON vào buffer
        context.proceed();

        // Đọc JSON vừa được tạo ra
        byte[] responseBytes = buffer.toByteArray();
        String responseBody = new String(responseBytes, StandardCharsets.UTF_8);

        // Ghi log
        System.out.println("RESPONSE BODY: " + responseBody);

        // Ghi dữ liệu thật ra output stream ban đầu để gửi về client
        originalStream.write(responseBytes);
        context.setOutputStream(originalStream);
    }
}
```

## GZip Interceptor — Nén dữ liệu

**GZIP** (GNU Zip) là thuật toán nén dữ liệu giúp giảm kích thước response. Tăng tốc độ tải trang và tiết kiệm băng thông mạng.

### Annotation tùy chỉnh

```java
package com.example.rest.interceptor;

import jakarta.ws.rs.NameBinding;
import java.lang.annotation.*;

/**
 * @GZipEncoded — đánh dấu endpoint trả về response được nén gzip
 */
@NameBinding
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.METHOD})
public @interface GZipEncoded {}
```

### GZip WriterInterceptor

```java
package com.example.rest.interceptor;

import jakarta.ws.rs.ext.*;
import jakarta.ws.rs.WebApplicationException;
import java.io.*;
import java.util.zip.GZIPOutputStream;

/**
 * GZipWriterInterceptor — nén response body bằng GZIP trước khi gửi về client
 * Chỉ áp dụng cho endpoint có annotation @GZipEncoded
 */
@Provider
@GZipEncoded
public class GZipWriterInterceptor implements WriterInterceptor {

    @Override
    public void aroundWriteTo(WriterInterceptorContext context)
            throws IOException, WebApplicationException {

        // Thêm header báo cho client biết response được nén gzip
        // Content-Encoding — cho biết cách thức mã hóa nội dung
        context.getHeaders().add("Content-Encoding", "gzip");

        // Bọc output stream trong GZIPOutputStream để tự động nén
        OutputStream originalStream = context.getOutputStream();
        GZIPOutputStream gzipStream = new GZIPOutputStream(originalStream);
        context.setOutputStream(gzipStream);

        try {
            context.proceed(); // Serialize và nén
        } finally {
            // Bắt buộc phải finish để flush dữ liệu còn lại trong GZIP buffer
            gzipStream.finish();
        }
    }
}
```

### Dùng @GZipEncoded trong resource

```java
@GET
@Path("/large-data")
@GZipEncoded  // Response sẽ tự động được nén GZIP
@Produces(MediaType.APPLICATION_JSON)
public Response getLargeData() {
    // Giả lập dữ liệu lớn
    StringBuilder sb = new StringBuilder("[");
    for (int i = 0; i < 10000; i++) {
        if (i > 0) sb.append(",");
        sb.append("{\"id\":").append(i).append(",\"name\":\"Item ").append(i).append("\"}");
    }
    sb.append("]");
    return Response.ok(sb.toString()).build();
}
```

## Client-side Filter và Interceptor

Jersey Client cũng hỗ trợ filter và interceptor phía client, hữu ích để tự động thêm header xác thực.

```java
package com.example.client;

import jakarta.ws.rs.client.*;
import jakarta.ws.rs.core.*;
import java.io.IOException;

/**
 * ClientRequestFilter — filter phía client, chạy trước khi gửi request
 * Dùng để tự động thêm Authorization header vào mọi request
 */
public class AuthTokenClientFilter implements ClientRequestFilter {

    private final String token;

    public AuthTokenClientFilter(String token) {
        this.token = token;
    }

    @Override
    public void filter(ClientRequestContext requestContext) throws IOException {
        // Tự động thêm Bearer token vào mọi request
        requestContext.getHeaders().add("Authorization", "Bearer " + token);
    }
}
```

```java
public class SecureApiClient {

    private final Client client;
    private final String baseUrl;

    public SecureApiClient(String baseUrl, String authToken) {
        this.baseUrl = baseUrl;
        // Đăng ký filter vào client — tất cả request sẽ có Authorization header
        this.client = ClientBuilder.newClient()
            .register(new AuthTokenClientFilter(authToken));
    }

    public String getUserProfile() {
        return client.target(baseUrl)
                     .path("/profile")
                     .request(MediaType.APPLICATION_JSON)
                     .get(String.class);
        // Authorization header tự động được thêm bởi AuthTokenClientFilter
    }

    public void close() {
        client.close();
    }
}
```

## ClientResponseFilter — Xử lý response phía client

```java
/**
 * ClientResponseFilter — chặn response trước khi client xử lý
 * Dùng để log response, kiểm tra rate limit header, refresh token...
 */
public class ResponseLoggingClientFilter implements ClientResponseFilter {

    @Override
    public void filter(ClientRequestContext requestContext,
                       ClientResponseContext responseContext) throws IOException {

        System.out.println(String.format(
            "CLIENT <- %d %s  [%s %s]",
            responseContext.getStatus(),
            responseContext.getStatusInfo().getReasonPhrase(),
            requestContext.getMethod(),
            requestContext.getUri()
        ));

        // Kiểm tra rate limit header (phổ biến trong các public API)
        String remaining = responseContext.getHeaderString("X-RateLimit-Remaining");
        if (remaining != null && Integer.parseInt(remaining) < 10) {
            System.out.println("CẢNH BÁO: Còn lại " + remaining + " request trong rate limit!");
        }
    }
}
```

## Thứ tự thực thi đầy đủ

Khi một request đến và response được trả về, thứ tự thực thi như sau:

```
REQUEST đến
    ↓
ContainerRequestFilter (theo Priority tăng dần)
    ↓
ReaderInterceptor.aroundReadFrom() → deserialize body
    ↓
Resource Method thực thi
    ↓
WriterInterceptor.aroundWriteTo() → serialize body
    ↓
ContainerResponseFilter (theo Priority giảm dần — LIFO)
    ↓
RESPONSE gửi về client
```

## Tóm tắt

Interceptor phù hợp để xử lý body: logging nội dung request/response, nén GZIP, mã hóa/giải mã. Điểm mấu chốt là luôn gọi `context.proceed()` để tiếp tục chuỗi xử lý. Client-side filter và interceptor cho phép tự động hóa các tác vụ lặp lại như thêm Authorization header hay xử lý rate limit.
