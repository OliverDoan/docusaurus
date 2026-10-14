---
sidebar_position: 2
title: "2. Authorization"
---

# Authorization

Authorization (phân quyền) trả lời câu hỏi "bạn được làm gì?" sau khi đã biết bạn là ai. Spring Security hỗ trợ phân quyền ở hai tầng: theo **URL** với `authorizeHttpRequests` và theo **method** với `@PreAuthorize`/`@PostAuthorize`. Bài này giải thích role và authority khác nhau thế nào, cách viết biểu thức SpEL và đặc biệt là cách kiểm tra **quyền sở hữu dữ liệu** — lỗ hổng phổ biến nhất trong API thực tế (IDOR).

---

:::note[Ghi nhớ nhanh]

- ⭐ **Role chỉ là authority có tiền tố `ROLE_`** — `hasRole("ADMIN")` kiểm tra authority `ROLE_ADMIN`; `hasAuthority("order:write")` kiểm tra đúng chuỗi.
- ⭐ **Kiểm tra quyền sở hữu (ownership)** — đã đăng nhập chưa đủ, phải chắc user chỉ đọc/sửa dữ liệu **của mình**; thiếu bước này là lỗ hổng IDOR.
- **URL-level**: `authorizeHttpRequests` duyệt quy tắc **từ trên xuống, khớp đầu tiên thắng** — quy tắc cụ thể đặt trước, `anyRequest()` đặt cuối.
- **Method-level**: bật `@EnableMethodSecurity`, dùng `@PreAuthorize` (trước khi chạy) và `@PostAuthorize` (sau khi có kết quả).
- **Mặc định từ chối** — kết thúc bằng `anyRequest().authenticated()` hoặc `denyAll()`, đừng `permitAll()`.

:::

---

## Mục lục

- [Vì sao cần cơ chế phân quyền?](#vì-sao-cần-cơ-chế-phân-quyền)
- [Role và Authority](#role-và-authority)
- [Phân quyền theo URL với authorizeHttpRequests](#phân-quyền-theo-url-với-authorizehttprequests)
- [Phân quyền theo method với EnableMethodSecurity](#phân-quyền-theo-method-với-enablemethodsecurity)
- [Biểu thức SpEL trong phân quyền](#biểu-thức-spel-trong-phân-quyền)
- [Kiểm tra quyền sở hữu dữ liệu](#kiểm-tra-quyền-sở-hữu-dữ-liệu)
- [Xử lý 401 và 403](#xử-lý-401-và-403)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vì sao cần cơ chế phân quyền?

**Vấn đề:** Kiểm tra quyền rải rác bằng `if` trong từng controller:

```java
@DeleteMapping("/api/orders/{id}")
public void delete(@PathVariable Long id, HttpSession session) {
    AppUser user = (AppUser) session.getAttribute("user");
    if (user == null) throw new UnauthorizedException();
    if (!user.getRole().equals("ADMIN") && !user.getRole().equals("MANAGER")) {
        throw new ForbiddenException();
    }
    orderService.delete(id);
}
// 80 endpoint → 80 đoạn if, chỉ cần quên một chỗ là lộ dữ liệu
```

Quy tắc phân quyền bị trộn lẫn với nghiệp vụ, khó rà soát, khó kiểm thử.

**Giải pháp:** Khai báo quyền một cách **tập trung và khai báo** (declarative):

```java
// URL-level
.requestMatchers(HttpMethod.DELETE, "/api/orders/**").hasAnyRole("ADMIN", "MANAGER")

// hoặc method-level
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public void delete(Long id) { ... }
```

:::tip[Dùng thực tế]

- Trang `/admin/**` chỉ cho `ADMIN` — URL-level là đủ.
- Nhân viên chỉ xem được đơn hàng của **chi nhánh mình** — method-level kèm SpEL gọi bean kiểm tra.
- Khách hàng chỉ xem được hồ sơ của **chính mình** — kiểm tra ownership trong query hoặc `@PostAuthorize`.
- Hệ thống có nhiều quyền chi tiết (`product:read`, `product:write`) gán cho role — dùng authority.

:::

---

## Role và Authority

Trong Spring Security, mọi quyền đều là **`GrantedAuthority`** — một object có một chuỗi. **Role** chỉ là quy ước: authority bắt đầu bằng `ROLE_`.

| Khai báo | Authority thực tế | Kiểm tra bằng |
|----------|-------------------|---------------|
| `User.withUsername("an").roles("ADMIN")` | `ROLE_ADMIN` | `hasRole("ADMIN")` hoặc `hasAuthority("ROLE_ADMIN")` |
| `.authorities("order:read")` | `order:read` | `hasAuthority("order:read")` |
| Scope trong JWT `scope: "orders.read"` | `SCOPE_orders.read` | `hasAuthority("SCOPE_orders.read")` |

Mô hình phổ biến: **role là nhóm quyền thô** (ADMIN, STAFF, CUSTOMER), **authority là quyền chi tiết** (`order:read`, `order:refund`). Database lưu role → permission, `UserDetailsService` nạp cả hai:

```java
List<GrantedAuthority> authorities = new ArrayList<>();
authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
user.getRole().getPermissions().forEach(p ->
        authorities.add(new SimpleGrantedAuthority(p.code())));  // "order:read"...
return new User(user.getUsername(), user.getPasswordHash(), authorities);
```

:::tip[Ví dụ đời thường]

Role giống **chức danh** trong công ty: "Trưởng phòng", "Nhân viên". Authority giống **từng chiếc chìa khoá cụ thể**: chìa kho, chìa phòng họp, quyền ký duyệt chi dưới 10 triệu. Chức danh "Trưởng phòng" thực chất là một chùm chìa khoá được phát sẵn — nhưng bảo vệ ở cửa kho chỉ quan tâm bạn có **đúng chìa kho** hay không.

:::

:::warning[Lỗi hay gặp]

- Viết `.requestMatchers(...).hasRole("ROLE_ADMIN")` → Spring Security 6 ném `IllegalArgumentException` khi khởi động vì `hasRole` tự thêm tiền tố. Dùng `hasRole("ADMIN")` hoặc `hasAuthority("ROLE_ADMIN")`.
- Lưu role trong DB là `"ADMIN"` nhưng tạo `SimpleGrantedAuthority("ADMIN")` (thiếu tiền tố) rồi kiểm tra bằng `hasRole("ADMIN")` → luôn 403.

:::

Muốn ADMIN tự có mọi quyền của STAFF, khai báo **role hierarchy**:

```java
@Bean
static RoleHierarchy roleHierarchy() {
    return RoleHierarchyImpl.fromHierarchy("""
            ROLE_ADMIN > ROLE_STAFF
            ROLE_STAFF > ROLE_CUSTOMER
            """);
}
```

---

## Phân quyền theo URL với authorizeHttpRequests

```java
@Bean
SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests(auth -> auth
            .requestMatchers("/", "/login", "/register", "/css/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
            .requestMatchers("/actuator/health").permitAll()
            .requestMatchers("/actuator/**").hasRole("ADMIN")
            .requestMatchers("/admin/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.POST, "/api/products/**").hasAuthority("product:write")
            .requestMatchers("/api/reports/**").hasAnyRole("ADMIN", "MANAGER")
            .anyRequest().authenticated())                  // mặc định: phải đăng nhập
        .formLogin(Customizer.withDefaults());
    return http.build();
}
```

Các phương thức thường dùng: `permitAll()`, `denyAll()`, `authenticated()`, `hasRole()`, `hasAnyRole()`, `hasAuthority()`, `hasAnyAuthority()`, `access(AuthorizationManager)`.

:::warning[Lỗi hay gặp]

Quy tắc được duyệt **theo thứ tự**, khớp đầu tiên là dừng:

```java
.requestMatchers("/api/**").authenticated()
.requestMatchers("/api/admin/**").hasRole("ADMIN")   // KHÔNG BAO GIỜ được tới
```

User thường đã đăng nhập vẫn gọi được `/api/admin/**` vì dòng đầu đã khớp. Luôn đặt quy tắc **cụ thể trước**, tổng quát sau.

:::

---

## Phân quyền theo method với EnableMethodSecurity

URL-level không biết gì về dữ liệu cụ thể. Method-level cho phép đặt quyền ngay trên service, nơi có đủ ngữ cảnh.

```java
@Configuration
@EnableMethodSecurity   // bật @PreAuthorize, @PostAuthorize, @PreFilter, @PostFilter
public class MethodSecurityConfig {
}
```

`@EnableMethodSecurity` (Spring Security 5.6+) thay cho `@EnableGlobalMethodSecurity(prePostEnabled = true)` cũ; mặc định đã bật pre/post. Muốn dùng `@Secured` thì thêm `securedEnabled = true`, `@RolesAllowed` thì `jsr250Enabled = true`.

| Annotation | Khi nào kiểm tra | Ví dụ |
|------------|------------------|-------|
| `@PreAuthorize` | Trước khi chạy method | `@PreAuthorize("hasRole('ADMIN')")` |
| `@PostAuthorize` | Sau khi method trả về, dùng được `returnObject` | `@PostAuthorize("returnObject.ownerId == authentication.name")` |
| `@PreFilter` | Lọc collection đầu vào | `@PreFilter("filterObject.ownerId == authentication.name")` |
| `@PostFilter` | Lọc collection kết quả | `@PostFilter("filterObject.public")` |
| `@Secured` | Trước, chỉ so role | `@Secured("ROLE_ADMIN")` |

```java
@Service
public class OrderService {

    @PreAuthorize("hasRole('ADMIN') or hasAuthority('order:refund')")
    public void refund(Long orderId) { ... }

    @PostAuthorize("returnObject.customerUsername() == authentication.name or hasRole('STAFF')")
    public OrderResponse getOrder(Long id) {
        return OrderResponse.from(orderRepository.findById(id).orElseThrow());
    }
}
```

:::warning[Lỗi hay gặp]

Method security dựa trên **proxy AOP**, nên:

- Gọi method có `@PreAuthorize` từ **một method khác trong cùng lớp** (`this.refund(...)`) → kiểm tra bị **bỏ qua**.
- Đặt trên method `private` → không có tác dụng.
- `@PostFilter` lọc **sau khi** đã tải toàn bộ dữ liệu vào bộ nhớ — với bảng lớn, hãy lọc trong câu query.

:::

---

## Biểu thức SpEL trong phân quyền

**SpEL** (Spring Expression Language) cho phép viết điều kiện phân quyền linh hoạt. Các biến có sẵn:

| Biến/hàm | Ý nghĩa |
|----------|---------|
| `authentication` | `Authentication` hiện tại |
| `principal` | `authentication.getPrincipal()` (thường là `UserDetails` hoặc `Jwt`) |
| `#tenThamSo` | Tham số method (cần biên dịch với `-parameters`) |
| `returnObject` | Giá trị trả về (chỉ `@PostAuthorize`) |
| `filterObject` | Phần tử đang xét (`@PreFilter`, `@PostFilter`) |
| `@tenBean` | Gọi một bean Spring |
| `hasRole`, `hasAuthority`, `isAuthenticated()`, `isAnonymous()` | Hàm kiểm tra sẵn có |

```java
// So sánh tham số với user hiện tại
@PreAuthorize("#username == authentication.name")
public ProfileResponse getProfile(String username) { ... }

// Gọi bean để kiểm tra logic phức tạp
@PreAuthorize("@orderSecurity.canView(#orderId, authentication)")
public OrderResponse view(Long orderId) { ... }
```

Biểu thức dài và lặp lại có thể gói vào **meta-annotation**:

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@PreAuthorize("hasRole('ADMIN')")
public @interface IsAdmin {
}

@IsAdmin
public void deleteUser(Long id) { ... }
```

---

## Kiểm tra quyền sở hữu dữ liệu

**IDOR** (Insecure Direct Object Reference) — đứng đầu OWASP API Security Top 10 dưới tên BOLA (Broken Object Level Authorization): API nhận id từ client rồi trả dữ liệu mà **không kiểm tra id đó có thuộc về user không**.

```java
// LỖ HỔNG: user đăng nhập bất kỳ đổi id là xem được đơn của người khác
@GetMapping("/api/orders/{id}")
public OrderResponse get(@PathVariable Long id) {
    return orderService.findById(id);
}
```

**Cách 1 — đưa owner vào câu query** (khuyên dùng, hiệu quả và khó quên):

```java
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByIdAndCustomerUsername(Long id, String username);
}

@GetMapping("/api/orders/{id}")
public OrderResponse get(@PathVariable Long id, @AuthenticationPrincipal UserDetails user) {
    return orderRepository.findByIdAndCustomerUsername(id, user.getUsername())
            .map(OrderResponse::from)
            .orElseThrow(() -> new OrderNotFoundException(id));  // trả 404, không lộ sự tồn tại
}
```

**Cách 2 — bean kiểm tra quyền dùng với `@PreAuthorize`:**

```java
@Component("orderSecurity")
public class OrderSecurity {
    private final OrderRepository orderRepository;

    public OrderSecurity(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public boolean canView(Long orderId, Authentication auth) {
        boolean isStaff = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF"));
        return isStaff || orderRepository.existsByIdAndCustomerUsername(orderId, auth.getName());
    }
}

@PreAuthorize("@orderSecurity.canView(#id, authentication)")
public OrderResponse view(Long id) { ... }
```

**Cách 3 — `@PostAuthorize`** khi phải tải object rồi mới biết chủ sở hữu (như ví dụ `getOrder` ở trên). Nhược điểm: query đã chạy và có thể có side effect trước khi bị từ chối.

:::tip[Ví dụ đời thường]

Kiểm tra ownership giống **tủ gửi đồ ở siêu thị**: có thẻ (đăng nhập) chưa đủ — thẻ số 12 chỉ mở được tủ số 12. Một hệ thống chỉ kiểm tra "có thẻ không" rồi cho mở bất kỳ tủ nào bạn chỉ vào chính là lỗ hổng IDOR.

:::

:::warning[Lỗi hay gặp]

- Lấy `userId` từ **request body hoặc query param** để lọc dữ liệu (`?userId=5`) → client sửa thành 6 là xong. Danh tính phải lấy từ `SecurityContext`, không bao giờ từ input.
- Endpoint sửa/xoá (`PUT`, `DELETE`) thường bị quên kiểm tra ownership hơn endpoint đọc.

:::

---

## Xử lý 401 và 403

`ExceptionTranslationFilter` bắt exception từ các filter phía sau:

- `AuthenticationException` hoặc user ẩn danh bị từ chối → **`AuthenticationEntryPoint`** → 401 (API) hoặc redirect `/login` (web).
- `AccessDeniedException` khi đã đăng nhập → **`AccessDeniedHandler`** → 403.

Tuỳ biến cho API trả JSON:

```java
http.exceptionHandling(ex -> ex
        .authenticationEntryPoint((request, response, e) ->
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Chưa đăng nhập"))
        .accessDeniedHandler((request, response, e) ->
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Không đủ quyền")));
```

:::note[Lưu ý với @ControllerAdvice]

`AccessDeniedException` ném từ `@PreAuthorize` trong service đi qua Spring MVC trước. Nếu bạn có `@ExceptionHandler(Exception.class)` bắt mọi exception, nó sẽ "nuốt" luôn lỗi này và trả 500 thay vì 403. Hãy để `AccessDeniedException` và `AuthenticationException` được ném lại hoặc xử lý riêng.

:::

---

## Câu hỏi phỏng vấn

**1. Role và Authority khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Về kỹ thuật cả hai đều là `GrantedAuthority` chứa một chuỗi. Role là authority có tiền tố `ROLE_`; `hasRole("ADMIN")` tự thêm tiền tố và so với `ROLE_ADMIN`, còn `hasAuthority` so chính xác chuỗi. Về thiết kế, role thường là nhóm quyền thô, authority là quyền chi tiết theo hành động.

</details>

**2. Thứ tự các quy tắc trong authorizeHttpRequests có quan trọng không?**

<details className="qa">
<summary>Xem đáp án</summary>

Có. Các quy tắc được đánh giá từ trên xuống, quy tắc khớp đầu tiên quyết định. Quy tắc tổng quát đặt trước sẽ che quy tắc cụ thể phía sau. Nên đặt quy tắc cụ thể trước và kết thúc bằng `anyRequest().authenticated()` hoặc `denyAll()`.

</details>

**3. @PreAuthorize và @PostAuthorize khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`@PreAuthorize` đánh giá biểu thức trước khi gọi method, dùng được tham số method; từ chối thì method không chạy. `@PostAuthorize` chạy method trước rồi đánh giá với `returnObject`, phù hợp khi quyền phụ thuộc vào dữ liệu trả về, nhưng method đã chạy (có thể đã có side effect hoặc tốn truy vấn).

</details>

**4. Vì sao @PreAuthorize không có tác dụng khi gọi method nội bộ?**

<details className="qa">
<summary>Xem đáp án</summary>

Method security được hiện thực bằng proxy AOP bao quanh bean. Lời gọi `this.method()` trong cùng lớp đi thẳng vào object gốc, không qua proxy, nên interceptor kiểm tra quyền không chạy. Cách xử lý: tách method sang bean khác, hoặc đặt annotation ở method public được gọi từ bên ngoài.

</details>

**5. IDOR là gì và phòng chống trong Spring thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

IDOR/BOLA là khi API cho phép truy cập object chỉ dựa vào id do client gửi mà không kiểm tra quyền với object đó. Phòng chống: lấy danh tính từ `SecurityContext`, đưa điều kiện chủ sở hữu vào câu query (`findByIdAndOwner`), hoặc dùng `@PreAuthorize` gọi bean kiểm tra quyền, hoặc `@PostAuthorize` so `returnObject`. Trả 404 thay vì 403 để không lộ sự tồn tại của tài nguyên.

</details>

**6. @EnableMethodSecurity khác @EnableGlobalMethodSecurity ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

`@EnableMethodSecurity` là phiên bản mới (5.6+), mặc định bật `prePostEnabled`, dùng API `AuthorizationManager` thay cho cơ chế `AccessDecisionManager`/voter cũ, cấu hình gọn hơn. `@EnableGlobalMethodSecurity` đã bị deprecated.

</details>

**7. Làm sao cho ADMIN có mọi quyền của STAFF mà không gán trùng?**

<details className="qa">
<summary>Xem đáp án</summary>

Khai báo bean `RoleHierarchy` (ví dụ `ROLE_ADMIN > ROLE_STAFF`). Spring Security sẽ coi user có `ROLE_ADMIN` như có thêm `ROLE_STAFF` khi đánh giá quyền ở cả URL-level và method-level.

</details>
