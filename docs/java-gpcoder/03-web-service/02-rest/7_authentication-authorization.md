---
sidebar_position: 7
title: "Tìm hiểu về xác thực và phân quyền trong ứng dụng (Authentication vs Authorization)"
---

# Tìm hiểu về xác thực và phân quyền trong ứng dụng

Authentication (xác thực) và Authorization (phân quyền) là hai khái niệm nền tảng của bảo mật ứng dụng, rất dễ bị nhầm lẫn. Nói ngắn gọn: xác thực trả lời "bạn là ai?", còn phân quyền trả lời "bạn được phép làm gì?". Bài này giải thích sự khác nhau giữa hai khái niệm, điểm qua các phương thức phổ biến (Basic Auth, JWT, OAuth, RBAC, ABAC) và cách dùng SecurityContext trong JAX-RS.

:::note[Ghi nhớ nhanh]

- ⭐ **Authentication = "Bạn là ai?", Authorization = "Bạn được làm gì?"** — xác thực diễn ra trước, phân quyền sau.
- ⭐ **Mã lỗi tương ứng** — xác thực thất bại trả `401 Unauthorized`, không đủ quyền trả `403 Forbidden`.
- **Phương thức xác thực phổ biến** — Basic Auth, Token/JWT, OAuth 2.0, API Key.
- **Mô hình phân quyền** — `RBAC` (theo vai trò, phổ biến nhất) và `ABAC` (theo thuộc tính).
- **`SecurityContext` trong JAX-RS** — inject bằng `@Context`, cung cấp `getUserPrincipal()` và `isUserInRole(...)`.

:::

## Authentication và Authorization là gì?

Đây là hai khái niệm cốt lõi trong bảo mật ứng dụng, thường bị nhầm lẫn nhưng có vai trò hoàn toàn khác nhau:

- **Authentication** (Xác thực — Authn): Trả lời câu hỏi **"Bạn là ai?"**. Quá trình xác minh danh tính của người dùng, thường thông qua username/password, token, fingerprint...

- **Authorization** (Phân quyền — Authz): Trả lời câu hỏi **"Bạn được phép làm gì?"**. Quá trình kiểm tra xem một người dùng đã xác thực có quyền thực hiện một hành động cụ thể không.

### Ví dụ thực tế

Hãy tưởng tượng hệ thống quản lý một tòa nhà công ty:

- **Authentication**: Quẹt thẻ để vào tòa nhà — xác nhận bạn là nhân viên.
- **Authorization**: Thẻ của bạn chỉ cho phép vào tầng 3 và 4, không được vào phòng server tầng 10.

Trong REST API:

- **Authentication**: Gửi token `Bearer eyJhbGci...` để xác nhận bạn đã đăng nhập.
- **Authorization**: Token đó có role `EDITOR`, được phép `POST /articles`, nhưng không được `DELETE /users`.

Sơ đồ dưới đây cho thấy thứ tự hai bước xác thực rồi phân quyền cùng mã lỗi tương ứng:

```mermaid
flowchart TD
    A["Request den"] --> B{"Authentication<br/>Ban la ai?"}
    B -->|That bai| C["401 Unauthorized"]
    B -->|Thanh cong| D{"Authorization<br/>Ban duoc lam gi?"}
    D -->|Khong du quyen| E["403 Forbidden"]
    D -->|Du quyen| F["Cho phep truy cap"]
```

Xác thực luôn diễn ra trước (sai trả 401), phân quyền diễn ra sau (không đủ quyền trả 403).

## Các phương thức Authentication phổ biến

### 1. Basic Authentication

**Basic Authentication** (xác thực cơ bản) gửi username và password được mã hóa Base64 trong header.

```
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
```

- Base64 decode của `dXNlcm5hbWU6cGFzc3dvcmQ=` là `username:password`.
- Đơn giản nhưng kém an toàn nếu không dùng HTTPS vì Base64 không phải mã hóa.
- Phù hợp: API nội bộ, môi trường development, đơn giản hóa testing.

### 2. Token-based Authentication

**Token** (mã thông báo) là chuỗi ký tự đại diện cho phiên đăng nhập. Server tạo token sau khi xác thực thành công, client lưu và gửi kèm mỗi request.

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. JWT (JSON Web Token)

**JWT** (JSON Web Token) là loại token đặc biệt chứa thông tin người dùng được mã hóa và ký số, không cần tra cứu database.

### 4. OAuth 2.0

**OAuth 2.0** (Open Authorization — giao thức ủy quyền mở) cho phép ứng dụng bên thứ ba truy cập tài nguyên của người dùng mà không cần biết mật khẩu. Ví dụ: "Đăng nhập bằng Google".

### 5. API Key

**API Key** (khóa API) là chuỗi định danh duy nhất cấp cho từng ứng dụng/client để theo dõi và kiểm soát truy cập.

```
X-API-Key: abc123def456ghi789
```

## Các phương thức Authorization phổ biến

### 1. RBAC (Role-Based Access Control)

**RBAC** (Kiểm soát truy cập dựa trên vai trò) là mô hình phân quyền phổ biến nhất. Quyền gắn với **vai trò**, không gắn trực tiếp với người dùng.

```java
// Người dùng → Vai trò → Quyền
// Nguyễn Văn An → ADMIN → [đọc, tạo, sửa, xóa]
// Trần Thị Bình → EDITOR → [đọc, tạo, sửa]
// Lê Văn Cường → VIEWER → [chỉ đọc]

public enum Role {
    ADMIN, EDITOR, VIEWER
}

public enum Permission {
    READ, CREATE, UPDATE, DELETE
}

public class RbacUtils {
    private static final Map<Role, Set<Permission>> ROLE_PERMISSIONS = Map.of(
        Role.ADMIN,  Set.of(Permission.READ, Permission.CREATE,
                            Permission.UPDATE, Permission.DELETE),
        Role.EDITOR, Set.of(Permission.READ, Permission.CREATE, Permission.UPDATE),
        Role.VIEWER, Set.of(Permission.READ)
    );

    public static boolean hasPermission(Role role, Permission permission) {
        return ROLE_PERMISSIONS.getOrDefault(role, Set.of()).contains(permission);
    }
}
```

### 2. ABAC (Attribute-Based Access Control)

**ABAC** (Kiểm soát truy cập dựa trên thuộc tính) quyết định truy cập dựa trên nhiều thuộc tính: thuộc tính người dùng, tài nguyên, môi trường.

```java
// Ví dụ quy tắc ABAC:
// "Người dùng có department=IT AND role=MANAGER
//  được phép xem báo cáo lương KIFS giờ làm việc"

public boolean canAccessDocument(User user, Document doc, LocalTime currentTime) {
    boolean isDepartmentMatch = user.getDepartment().equals(doc.getDepartment());
    boolean isManager = user.getRole() == Role.MANAGER;
    boolean isWorkingHours = currentTime.isAfter(LocalTime.of(8, 0))
                          && currentTime.isBefore(LocalTime.of(17, 30));
    return isDepartmentMatch && isManager && isWorkingHours;
}
```

## SecurityContext trong JAX-RS

**SecurityContext** (ngữ cảnh bảo mật) là interface của JAX-RS cung cấp thông tin về người dùng đã xác thực trong một request.

```java
package com.example.rest.security;

import jakarta.ws.rs.core.SecurityContext;
import java.security.Principal;

/**
 * UserPrincipal — đại diện cho người dùng đã đăng nhập
 * Principal — interface Java đại diện cho một thực thể (người dùng, hệ thống...)
 */
public class UserPrincipal implements Principal {
    private final String username;
    private final String role;
    private final int userId;

    public UserPrincipal(int userId, String username, String role) {
        this.userId = userId;
        this.username = username;
        this.role = role;
    }

    @Override
    public String getName() { return username; }
    public String getRole() { return role; }
    public int getUserId() { return userId; }
}
```

```java
package com.example.rest.security;

import jakarta.ws.rs.core.SecurityContext;
import java.security.Principal;

/**
 * CustomSecurityContext — implementation tùy chỉnh của SecurityContext
 * Được tạo trong AuthenticationFilter sau khi xác thực token thành công
 */
public class CustomSecurityContext implements SecurityContext {

    private final UserPrincipal principal;
    private final boolean secure; // true nếu kết nối qua HTTPS

    public CustomSecurityContext(UserPrincipal principal, boolean secure) {
        this.principal = principal;
        this.secure = secure;
    }

    @Override
    public Principal getUserPrincipal() {
        return principal; // Trả về thông tin người dùng đã xác thực
    }

    @Override
    public boolean isUserInRole(String role) {
        // Kiểm tra xem người dùng có thuộc role được chỉ định không
        return principal != null && principal.getRole().equalsIgnoreCase(role);
    }

    @Override
    public boolean isSecure() {
        return secure; // Kết nối có phải HTTPS không
    }

    @Override
    public String getAuthenticationScheme() {
        return "Bearer"; // Loại xác thực đang sử dụng
    }
}
```

## Dùng SecurityContext trong Resource

```java
package com.example.rest;

import com.example.rest.security.*;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

@Path("/reports")
@Produces(MediaType.APPLICATION_JSON)
public class ReportResource {

    /**
     * @Context SecurityContext — inject thông tin bảo mật của request hiện tại
     */
    @GET
    @Path("/my")
    public Response getMyReports(@Context SecurityContext securityContext) {
        // Lấy thông tin người dùng đang đăng nhập
        UserPrincipal user = (UserPrincipal) securityContext.getUserPrincipal();

        if (user == null) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }

        return Response.ok(String.format(
            "{\"userId\": %d, \"username\": \"%s\", \"reports\": []}",
            user.getUserId(), user.getName()
        )).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deleteReport(@PathParam("id") int id,
                                  @Context SecurityContext securityContext) {
        // Chỉ ADMIN mới được xóa báo cáo
        if (!securityContext.isUserInRole("ADMIN")) {
            return Response.status(Response.Status.FORBIDDEN)
                           .entity("{\"error\": \"Chỉ Admin mới có quyền xóa báo cáo\"}")
                           .build();
        }

        // Xử lý xóa...
        return Response.noContent().build();
    }
}
```

## Tóm tắt so sánh

| Tiêu chí | Authentication | Authorization |
|---|---|---|
| Câu hỏi | Bạn là ai? | Bạn được làm gì? |
| Thời điểm | Diễn ra trước | Diễn ra sau |
| Thất bại | 401 Unauthorized | 403 Forbidden |
| Ví dụ | Đăng nhập, xác thực token | Kiểm tra quyền xóa |

Authentication và Authorization luôn đi cùng nhau: xác thực danh tính trước, phân quyền hành động sau. REST API cần xử lý cả hai để đảm bảo bảo mật toàn diện.
