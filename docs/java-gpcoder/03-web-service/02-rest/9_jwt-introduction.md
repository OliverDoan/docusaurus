---
sidebar_position: 9
title: "Giới thiệu JSON Web Token (JWT)"
---

# Giới thiệu JSON Web Token (JWT)

JWT là một chuẩn phổ biến để xác thực mà không cần lưu session trên server — toàn bộ thông tin người dùng nằm gọn trong token đã được ký số. Bài này giải thích tại sao JWT lại tiện hơn session truyền thống, mổ xẻ cấu trúc ba phần Header–Payload–Signature, và hướng dẫn tạo cũng như kiểm tra token trong Java bằng thư viện JJWT. Nắm được JWT là bước quan trọng để xây dựng API stateless dễ mở rộng.

## JWT là gì?

**JWT** (JSON Web Token — mã thông báo web dạng JSON) là một tiêu chuẩn mở (RFC 7519) để truyền thông tin an toàn giữa các bên dưới dạng đối tượng JSON. Thông tin trong JWT được **ký số** (digitally signed), đảm bảo tính toàn vẹn mà không cần kiểm tra database.

## Tại sao cần JWT thay vì Session?

### Session truyền thống

```
Client                    Server                   Database
  |--- POST /login -------->|                          |
  |                         |--- query user ---------->|
  |                         |<-- user found -----------|
  |<-- Set-Cookie: sid=abc--|--- store session(abc) -->|
  |                         |                          |
  |--- GET /profile ------->|                          |
  | (Cookie: sid=abc)       |--- lookup session(abc) ->|
  |                         |<-- user data ------------|
  |<-- profile data --------|                          |
```

**Nhược điểm**: Mỗi request phải tra cứu database. Khó scale với nhiều server (server A có session, server B không có).

### JWT (Stateless)

```
Client                    Server
  |--- POST /login -------->|
  |                         |-- verify password
  |<-- JWT token -----------|-- sign token (không lưu gì)
  |                         |
  |--- GET /profile ------->|
  | (Authorization: Bearer  |-- verify signature
  |    eyJhbGci...)         |-- decode payload → user info
  |<-- profile data --------|-- (không cần database)
```

**Ưu điểm**: Stateless (phi trạng thái) — server không lưu gì, dễ scale ngang.

## Cấu trúc của JWT

JWT gồm 3 phần, cách nhau bởi dấu chấm (`.`):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.
eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3MTcwMDAwMDAsImV4cCI6MTcxNzA4NjQwMH0
.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### 1. Header (Tiêu đề)

Chứa loại token và thuật toán ký.

```json
{
    "alg": "HS256",
    "typ": "JWT"
}
```

- `alg`: **HS256** (HMAC-SHA256 — thuật toán ký đối xứng, dùng một khóa bí mật) hoặc **RS256** (RSA-SHA256 — thuật toán ký bất đối xứng, dùng cặp khóa công khai/riêng tư)
- `typ`: Loại token, luôn là `JWT`

### 2. Payload (Tải trọng)

Chứa **claims** (khẳng định — thông tin về người dùng và metadata).

```json
{
    "sub": "1",
    "username": "admin",
    "role": "ADMIN",
    "iat": 1717000000,
    "exp": 1717086400
}
```

**Các claim chuẩn (Registered Claims)**:

| Claim | Tên đầy đủ | Ý nghĩa |
|---|---|---|
| `iss` | Issuer | Ai phát hành token (tên ứng dụng/domain) |
| `sub` | Subject | Đối tượng của token (thường là user ID) |
| `aud` | Audience | Ai được phép nhận token |
| `exp` | Expiration | Thời điểm hết hạn (Unix timestamp) |
| `iat` | Issued At | Thời điểm phát hành |
| `jti` | JWT ID | ID duy nhất của token (tránh replay attack) |

**Lưu ý quan trọng**: Payload chỉ được mã hóa Base64 URL, **không phải mã hóa bảo mật**. Bất kỳ ai cũng có thể decode và đọc. Không đặt thông tin nhạy cảm (mật khẩu, số thẻ tín dụng) trong payload.

### 3. Signature (Chữ ký số)

Đảm bảo token không bị giả mạo.

```
HMACSHA256(
    base64UrlEncode(header) + "." + base64UrlEncode(payload),
    secretKey
)
```

Nếu ai đó thay đổi payload, chữ ký sẽ không khớp → server từ chối token.

## JWT trong thực tế với Java

### Thêm dependency JJWT

**JJWT** (Java JWT) là thư viện phổ biến nhất để làm việc với JWT trong Java.

```xml
<dependencies>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.5</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.12.5</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.12.5</version>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

### JwtUtils — Tạo và xác thực JWT

```java
package com.example.rest.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.util.Date;
import java.util.Optional;

public class JwtUtils {

    // Secret key để ký JWT — phải được lưu an toàn, không commit vào git
    // Trong thực tế đọc từ biến môi trường hoặc vault
    private static final String SECRET = System.getenv().getOrDefault(
        "JWT_SECRET",
        "my-super-secret-key-at-least-256-bits-long!!"  // Chỉ dùng cho dev
    );

    // Thời gian hiệu lực: 24 giờ (tính bằng milliseconds)
    private static final long EXPIRATION_MS = 24 * 60 * 60 * 1000L;

    // Tạo Key object từ secret string
    private static final Key SIGNING_KEY = Keys.hmacShaKeyFor(SECRET.getBytes());

    /**
     * Tạo JWT token cho người dùng đã đăng nhập
     * @param userId ID người dùng
     * @param username Tên đăng nhập
     * @param role Vai trò (ADMIN, USER...)
     * @return JWT token dạng String
     */
    public static String generateToken(int userId, String username, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + EXPIRATION_MS);

        return Jwts.builder()
            .subject(String.valueOf(userId))    // sub claim
            .claim("username", username)         // Custom claim
            .claim("role", role)                 // Custom claim
            .issuedAt(now)                       // iat claim
            .expiration(expiry)                  // exp claim
            .issuer("my-rest-app")              // iss claim
            .signWith(SIGNING_KEY)               // Ký với HMAC-SHA256
            .compact();                          // Tạo chuỗi JWT
    }

    /**
     * Xác thực và giải mã JWT token
     * @return Claims (payload) nếu hợp lệ
     */
    public static Optional<Claims> validateToken(String token) {
        try {
            Claims claims = Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) SIGNING_KEY)
                .build()
                .parseSignedClaims(token)
                .getPayload();

            return Optional.of(claims);

        } catch (ExpiredJwtException e) {
            // Token đã hết hạn
            System.out.println("Token hết hạn: " + e.getMessage());
            return Optional.empty();

        } catch (JwtException e) {
            // Token không hợp lệ (chữ ký sai, định dạng lỗi...)
            System.out.println("Token không hợp lệ: " + e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Lấy thông tin người dùng từ token đã xác thực
     */
    public static UserPrincipal extractUser(Claims claims) {
        int userId = Integer.parseInt(claims.getSubject());
        String username = claims.get("username", String.class);
        String role = claims.get("role", String.class);
        return new UserPrincipal(userId, username, role);
    }
}
```

### Ví dụ tạo và kiểm tra token

```java
public class JwtDemo {
    public static void main(String[] args) {
        // Tạo token
        String token = JwtUtils.generateToken(1, "admin", "ADMIN");
        System.out.println("Token: " + token);

        // Xác thực token
        JwtUtils.validateToken(token).ifPresent(claims -> {
            System.out.println("User ID: " + claims.getSubject());
            System.out.println("Username: " + claims.get("username"));
            System.out.println("Role: " + claims.get("role"));
            System.out.println("Hết hạn: " + claims.getExpiration());
        });

        // Test token giả
        String fakeToken = token.replace("a", "b"); // Thay đổi chữ ký
        boolean isValid = JwtUtils.validateToken(fakeToken).isPresent();
        System.out.println("Token giả hợp lệ? " + isValid); // false
    }
}
```

## Refresh Token là gì?

**Refresh Token** (token làm mới) là token có thời hạn dài dùng để lấy Access Token mới khi Access Token hết hạn, mà không cần đăng nhập lại.

```
Access Token:   Hạn ngắn (15 phút - 1 giờ) — dùng để gọi API
Refresh Token:  Hạn dài  (7-30 ngày)        — dùng để lấy Access Token mới
```

## Tóm tắt

JWT cho phép xác thực stateless: thông tin người dùng nằm trong token, không cần tra cứu database. Cấu trúc gồm Header + Payload + Signature. Chữ ký đảm bảo tính toàn vẹn nhưng payload không được mã hóa. Luôn bảo vệ secret key và đặt thời hạn hợp lý cho token.
