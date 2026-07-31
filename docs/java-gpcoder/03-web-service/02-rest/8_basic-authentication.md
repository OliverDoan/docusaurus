---
sidebar_position: 8
title: "REST Web service - Basic Authentication trong Jersey 2.x"
---

# REST Web service - Basic Authentication trong Jersey 2.x

Basic Authentication là cách xác thực HTTP đơn giản nhất: client gửi username và password (mã hóa Base64) trong header của mỗi request. Bài này hướng dẫn triển khai Basic Auth trong Jersey 2.x từ đầu đến cuối — tạo model User, viết filter giải mã và kiểm tra thông tin đăng nhập, gắn SecurityContext và test bằng Jersey Client. Đây là điểm khởi đầu tốt để hiểu cơ chế xác thực trước khi học các phương thức nâng cao hơn như JWT.

:::note[Ghi nhớ nhanh]

- ⭐ **Basic Auth gửi `Base64(username:password)` trong header `Authorization`** — đơn giản nhưng Base64 không phải mã hóa bảo mật, BẮT BUỘC dùng HTTPS.
- ⭐ **`BasicAuthFilter` giải mã & xác thực** — sai/thiếu thông tin thì `abortWith` trả 401 kèm header `WWW-Authenticate`.
- **Xác thực thành công thì gắn `SecurityContext`** — tạo `UserPrincipal` + `CustomSecurityContext` cho resource dùng.
- **`@BasicAuth` (`@NameBinding`)** — chỉ áp filter cho endpoint cần bảo vệ.
- **Mật khẩu lưu dạng hash** — dùng BCrypt, không bao giờ lưu plain text.

:::

## Basic Authentication là gì?

**Basic Authentication** (xác thực cơ bản) là phương thức xác thực HTTP đơn giản nhất. Client gửi username và password được mã hóa **Base64** trong header `Authorization` của mỗi request.

Định dạng: `Authorization: Basic <Base64(username:password)>`

Ví dụ: username=`admin`, password=`secret123`
→ `admin:secret123` → Base64 → `YWRtaW46c2VjcmV0MTIz`
→ Header: `Authorization: Basic YWRtaW46c2VjcmV0MTIz`

**Lưu ý quan trọng**: Base64 là mã hóa, không phải mã hóa bảo mật (encryption). Bất kỳ ai có header đó đều có thể giải mã. Vì vậy, **phải dùng HTTPS** khi dùng Basic Authentication.

Sơ đồ sau mô tả luồng xử lý một request có Basic Authentication qua filter:

```mermaid
sequenceDiagram
    participant C as Client
    participant F as BasicAuthFilter
    participant U as UserService
    participant R as SecureResource
    C->>F: Request kem Authorization Basic base64
    F->>F: Giai ma Base64 thanh username va password
    F->>U: authenticate(username, password)
    alt Dung thong tin
        U-->>F: Tra ve User
        F->>R: Gan SecurityContext va cho di tiep
        R-->>C: 200 OK kem du lieu
    else Sai thong tin
        F-->>C: 401 Unauthorized
    end
```

Filter giải mã và kiểm tra thông tin trước; chỉ khi hợp lệ mới gắn `SecurityContext` và cho request vào resource.

## Model User

```java
package com.example.rest.model;

/**
 * User — đại diện cho người dùng trong hệ thống
 * Trong thực tế, password nên được lưu dạng hash (bcrypt, argon2...)
 * KHÔNG BAO GIỜ lưu mật khẩu dưới dạng plain text
 */
public class User {
    private int id;
    private String username;
    private String passwordHash; // Lưu hash, không lưu mật khẩu gốc
    private String role;

    public User(int id, String username, String passwordHash, String role) {
        this.id = id;
        this.username = username;
        this.passwordHash = passwordHash;
        this.role = role;
    }

    public int getId() { return id; }
    public String getUsername() { return username; }
    public String getPasswordHash() { return passwordHash; }
    public String getRole() { return role; }
}
```

## UserService — Xác thực người dùng

```java
package com.example.rest.service;

import com.example.rest.model.User;
import java.util.*;

public class UserService {

    // Database giả lập — trong thực tế truy vấn từ database
    private static final Map<String, User> USER_DB = new HashMap<>();

    static {
        // Trong thực tế, password được lưu dạng BCrypt hash
        // "$2a$10$..." là BCrypt hash của "password123"
        USER_DB.put("admin", new User(1, "admin",
            "$2a$10$mockHashForAdmin", "ADMIN"));
        USER_DB.put("user1", new User(2, "user1",
            "$2a$10$mockHashForUser1", "USER"));
    }

    /**
     * Xác thực username và password
     * @return User nếu thành công, null nếu sai thông tin
     */
    public Optional<User> authenticate(String username, String password) {
        User user = USER_DB.get(username);
        if (user == null) {
            return Optional.empty();
        }

        // Trong thực tế: BCrypt.checkpw(password, user.getPasswordHash())
        // Ở đây dùng so sánh đơn giản cho demo
        boolean passwordMatch = password.equals("password123"); // Demo only!
        return passwordMatch ? Optional.of(user) : Optional.empty();
    }
}
```

## Basic Authentication Filter

```java
package com.example.rest.filter;

import com.example.rest.model.User;
import com.example.rest.security.*;
import com.example.rest.service.UserService;
import jakarta.ws.rs.container.*;
import jakarta.ws.rs.ext.Provider;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;

/**
 * BasicAuthFilter — ContainerRequestFilter xử lý Basic Authentication
 * Chạy trước mọi request có annotation @BasicAuth
 */
@Provider
@BasicAuth  // Annotation tùy chỉnh (NameBinding)
public class BasicAuthFilter implements ContainerRequestFilter {

    private static final UserService userService = new UserService();

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        String authHeader = requestContext.getHeaderString("Authorization");

        // Kiểm tra header tồn tại và có định dạng "Basic ..."
        if (authHeader == null || !authHeader.startsWith("Basic ")) {
            abortWithUnauthorized(requestContext, "Thiếu hoặc sai định dạng Authorization header");
            return;
        }

        // Giải mã Base64
        String encoded = authHeader.substring("Basic ".length()).trim();
        String decoded;
        try {
            decoded = new String(Base64.getDecoder().decode(encoded), StandardCharsets.UTF_8);
        } catch (IllegalArgumentException e) {
            abortWithUnauthorized(requestContext, "Base64 không hợp lệ");
            return;
        }

        // Tách username:password
        int colonIndex = decoded.indexOf(':');
        if (colonIndex == -1) {
            abortWithUnauthorized(requestContext, "Định dạng phải là username:password");
            return;
        }

        String username = decoded.substring(0, colonIndex);
        String password = decoded.substring(colonIndex + 1);

        // Xác thực với UserService
        Optional<User> userOpt = userService.authenticate(username, password);
        if (!userOpt.isPresent()) {
            abortWithUnauthorized(requestContext, "Sai username hoặc password");
            return;
        }

        // Xác thực thành công — gắn SecurityContext vào request
        User user = userOpt.get();
        UserPrincipal principal = new UserPrincipal(user.getId(), user.getUsername(), user.getRole());
        boolean isSecure = requestContext.getSecurityContext().isSecure();
        requestContext.setSecurityContext(new CustomSecurityContext(principal, isSecure));
    }

    /**
     * Từ chối request với 401 và WWW-Authenticate header
     * WWW-Authenticate — yêu cầu client cung cấp thông tin xác thực
     */
    private void abortWithUnauthorized(ContainerRequestContext ctx, String message) {
        ctx.abortWith(
            jakarta.ws.rs.core.Response
                .status(jakarta.ws.rs.core.Response.Status.UNAUTHORIZED)
                // WWW-Authenticate header báo cho client biết loại xác thực cần dùng
                .header("WWW-Authenticate", "Basic realm=\"MyApp\"")
                .entity("{\"error\": \"" + message + "\"}")
                .type("application/json")
                .build()
        );
    }
}
```

## Annotation @BasicAuth

```java
package com.example.rest.filter;

import jakarta.ws.rs.NameBinding;
import java.lang.annotation.*;

@NameBinding
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.METHOD})
public @interface BasicAuth {}
```

## Resource sử dụng Basic Authentication

```java
package com.example.rest;

import com.example.rest.filter.BasicAuth;
import com.example.rest.security.UserPrincipal;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

@Path("/secure")
@Produces(MediaType.APPLICATION_JSON)
public class SecureResource {

    /**
     * GET /api/secure/profile
     * Yêu cầu xác thực Basic Auth
     */
    @GET
    @Path("/profile")
    @BasicAuth  // Filter BasicAuthFilter sẽ chạy trước method này
    public Response getProfile(@Context SecurityContext securityContext) {
        UserPrincipal user = (UserPrincipal) securityContext.getUserPrincipal();
        return Response.ok(String.format(
            "{\"id\": %d, \"username\": \"%s\", \"role\": \"%s\"}",
            user.getUserId(), user.getName(), user.getRole()
        )).build();
    }

    /**
     * GET /api/secure/admin-only
     * Yêu cầu xác thực VÀ phải có role ADMIN
     */
    @GET
    @Path("/admin-only")
    @BasicAuth
    public Response adminArea(@Context SecurityContext securityContext) {
        if (!securityContext.isUserInRole("ADMIN")) {
            return Response.status(Response.Status.FORBIDDEN)
                           .entity("{\"error\": \"Chỉ Admin mới có quyền truy cập\"}")
                           .build();
        }
        return Response.ok("{\"message\": \"Chào mừng Admin!\"}").build();
    }

    /**
     * Endpoint công khai, không cần xác thực
     */
    @GET
    @Path("/public")
    public Response publicInfo() {
        return Response.ok("{\"message\": \"Thông tin công khai\"}").build();
    }
}
```

## Test với Jersey Client

```java
package com.example.client;

import jakarta.ws.rs.client.*;
import jakarta.ws.rs.core.*;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

public class BasicAuthClientExample {

    public static void main(String[] args) {
        Client client = ClientBuilder.newClient();
        String baseUrl = "http://localhost:8080/api/secure";

        // Tạo Basic Auth header
        String credentials = "admin:password123";
        String encodedCredentials = Base64.getEncoder()
            .encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
        String authHeader = "Basic " + encodedCredentials;

        // Gọi API với Basic Auth
        Response response = client.target(baseUrl)
            .path("/profile")
            .request(MediaType.APPLICATION_JSON)
            .header("Authorization", authHeader)  // Thêm header thủ công
            .get();

        System.out.println("Status: " + response.getStatus());
        System.out.println("Body: " + response.readEntity(String.class));

        // Test không có credentials
        Response noAuthResponse = client.target(baseUrl)
            .path("/profile")
            .request(MediaType.APPLICATION_JSON)
            .get(); // Không có Authorization header

        System.out.println("No auth status: " + noAuthResponse.getStatus()); // 401

        client.close();
    }
}
```

## Tóm tắt

Basic Authentication đơn giản, dễ triển khai nhưng cần HTTPS bắt buộc. Quy trình: client mã hóa Base64 `username:password` → gửi trong header → server giải mã và xác thực. Dùng `@NameBinding` để chỉ áp dụng filter cho endpoint cụ thể. Mật khẩu phải được lưu dạng hash (BCrypt) trong database, không bao giờ lưu plain text.
