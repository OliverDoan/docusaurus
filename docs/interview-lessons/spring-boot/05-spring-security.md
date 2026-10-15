---
sidebar_position: 5
title: "5. Spring Security"
---

# 5. Spring Security

## 1. Authentication

Bài học: [1. Authentication](../../spring-boot/05-spring-security/1_authentication.md)

**1. Spring Security tích hợp vào ứng dụng web như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Thông qua Servlet Filter. `DelegatingFilterProxy` được đăng ký với container, chuyển request cho bean `FilterChainProxy`. `FilterChainProxy` chọn `SecurityFilterChain` đầu tiên khớp request và chạy chuỗi filter bảo mật của nó (CSRF, xác thực, xử lý exception, phân quyền) trước khi request tới `DispatcherServlet`.

</details>

**2. Mô tả luồng xác thực username/password.**

<details className="qa">
<summary>Xem đáp án</summary>

`UsernamePasswordAuthenticationFilter` (hoặc `BasicAuthenticationFilter`) tạo `UsernamePasswordAuthenticationToken` chưa xác thực, gọi `AuthenticationManager.authenticate()`. `ProviderManager` chuyển cho `DaoAuthenticationProvider`, provider gọi `UserDetailsService.loadUserByUsername()`, dùng `PasswordEncoder.matches()` so mật khẩu, kiểm tra tài khoản bị khoá/vô hiệu. Thành công thì trả `Authentication` đã xác thực có authorities, filter lưu vào `SecurityContext` (và session nếu stateful). Thất bại ném `AuthenticationException`.

</details>

**3. Vì sao WebSecurityConfigurerAdapter bị bỏ? Thay bằng gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Nó bị deprecated từ Spring Security 5.7 và xoá ở 6.0 để chuyển sang cấu hình dựa trên bean (component-based): khai báo bean `SecurityFilterChain` từ `HttpSecurity`, bean `UserDetailsService`, `PasswordEncoder`, dùng lambda DSL. Cách này dễ có nhiều chain, dễ test và nhất quán với phong cách cấu hình bean của Spring.

</details>

**4. Vì sao dùng BCrypt thay vì SHA-256?**

<details className="qa">
<summary>Xem đáp án</summary>

SHA-256 được thiết kế để nhanh, nên GPU có thể thử hàng tỷ mật khẩu mỗi giây. BCrypt chậm có chủ đích với cost factor điều chỉnh được, tự sinh salt cho mỗi mật khẩu chống rainbow table. Argon2 và scrypt còn tốn bộ nhớ, chống phần cứng chuyên dụng tốt hơn.

</details>

**5. SecurityContextHolder lưu dữ liệu ở đâu? Có vấn đề gì với thread khác?**

<details className="qa">
<summary>Xem đáp án</summary>

Mặc định dùng chiến lược `MODE_THREADLOCAL`: mỗi thread có `SecurityContext` riêng, được xoá sau khi request kết thúc. Thread khác (async, executor) không thấy context; cần `DelegatingSecurityContextExecutor`/`DelegatingSecurityContextRunnable` hoặc chiến lược `MODE_INHERITABLETHREADLOCAL` (cẩn thận với thread pool).

</details>

**6. Khác nhau giữa 401 và 403 trong Spring Security?**

<details className="qa">
<summary>Xem đáp án</summary>

401 Unauthorized nghĩa là chưa xác thực hoặc xác thực sai — `ExceptionTranslationFilter` gọi `AuthenticationEntryPoint` (redirect login hoặc trả 401). 403 Forbidden nghĩa là đã xác thực nhưng không đủ quyền — `AccessDeniedHandler` xử lý.

</details>

**7. Khi nào cần nhiều SecurityFilterChain?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi các nhóm URL cần chính sách khác nhau, ví dụ `/api/**` stateless dùng JWT/Basic và tắt CSRF, còn phần web dùng form login và session. Mỗi chain có `securityMatcher` riêng và `@Order`; `FilterChainProxy` dùng chain đầu tiên khớp.

</details>

---

## 2. Authorization

Bài học: [2. Authorization](../../spring-boot/05-spring-security/2_authorization.md)

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

---

## 3. OAuth2 & OpenID Connect

Bài học: [3. OAuth2 & OpenID Connect](../../spring-boot/05-spring-security/3_oauth2.md)

**1. OAuth2 và OpenID Connect khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

OAuth2 là framework ủy quyền: cấp access token để client gọi API thay người dùng, không chuẩn hoá thông tin danh tính. OIDC là lớp xác thực xây trên OAuth2: thêm scope `openid`, ID token dạng JWT chứa thông tin người dùng, endpoint UserInfo và discovery. "Đăng nhập bằng Google" thực chất là OIDC.

</details>

**2. Vì sao Implicit grant bị loại bỏ?**

<details className="qa">
<summary>Xem đáp án</summary>

Implicit trả access token trực tiếp qua URL fragment trên trình duyệt: token có thể lộ qua lịch sử, Referer, extension; không có refresh token an toàn; không xác thực được client. Authorization Code + PKCE giải quyết được bài toán SPA mà không trả token qua URL, nên OAuth 2.1 và các best practice hiện tại loại Implicit.

</details>

**3. PKCE hoạt động thế nào và chống được gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Client sinh `code_verifier` ngẫu nhiên, gửi `code_challenge` (SHA-256 của verifier) ở bước authorize. Khi đổi code lấy token phải gửi kèm `code_verifier`; server băm lại và so. Kẻ đánh cắp authorization code (qua redirect bị chặn, app độc hại trên mobile) không có verifier nên không đổi được token. Đặc biệt cần cho public client không giữ được client secret.

</details>

**4. Khi nào dùng Client Credentials?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi không có người dùng tham gia: service gọi service, job batch, tác vụ hệ thống. Client tự xác thực bằng client id/secret (hoặc private key JWT, mTLS) và nhận access token mang quyền của chính client.

</details>

**5. Resource Server kiểm tra JWT như thế nào trong Spring?**

<details className="qa">
<summary>Xem đáp án</summary>

`BearerTokenAuthenticationFilter` lấy token từ header, `JwtAuthenticationProvider` dùng `JwtDecoder` (thường `NimbusJwtDecoder` cấu hình từ `issuer-uri` hoặc `jwk-set-uri`) để kiểm tra chữ ký bằng khoá công khai JWKS, kiểm tra `exp`, `nbf`, `iss` và `aud` nếu cấu hình. Sau đó `JwtAuthenticationConverter` đổi claim `scope`/`scp` thành authority `SCOPE_...` và tạo `JwtAuthenticationToken`.

</details>

**6. Tham số state trong luồng Authorization Code dùng để làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Chống CSRF trên callback: kẻ tấn công không thể dụ người dùng hoàn tất luồng đăng nhập bằng code của kẻ tấn công, vì client chỉ chấp nhận callback có `state` khớp giá trị nó đã lưu trong session trước khi redirect. Spring Security OAuth2 Client tự sinh và kiểm tra `state`.

</details>

**7. Access token opaque và JWT khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

JWT tự chứa thông tin và chữ ký, Resource Server kiểm tra cục bộ bằng khoá công khai, nhanh và không cần gọi mạng, nhưng khó thu hồi trước khi hết hạn. Opaque token là chuỗi ngẫu nhiên, Resource Server phải gọi introspection endpoint để hỏi, tốn thêm một lượt mạng nhưng thu hồi tức thì và không lộ thông tin.

</details>

---

## 4. JWT Authentication

Bài học: [4. JWT Authentication](../../spring-boot/05-spring-security/4_jwt.md)

**1. JWT gồm những phần nào? Có được mã hoá không?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba phần base64url: header (thuật toán, kid), payload (claims), signature. JWT thông thường (JWS) chỉ được **ký**: đảm bảo toàn vẹn và nguồn gốc, nhưng ai cũng giải mã base64 đọc được payload. Muốn bí mật nội dung phải dùng JWE, ít phổ biến. Vì vậy không đặt dữ liệu nhạy cảm vào JWT.

</details>

**2. Vì sao nên dùng spring-boot-starter-oauth2-resource-server thay vì tự viết JwtFilter?**

<details className="qa">
<summary>Xem đáp án</summary>

Module có sẵn `BearerTokenAuthenticationFilter`, `JwtDecoder` (Nimbus) kiểm tra chữ ký với thuật toán cố định, `exp`/`nbf`/`iss`/`aud`, hỗ trợ JWKS và xoay vòng khoá, trả lỗi 401 chuẩn RFC 6750, tích hợp `JwtAuthenticationConverter` để map quyền. Tự viết dễ sai: chấp nhận `alg` tuỳ ý, nuốt exception, query DB mỗi request, thiếu kiểm tra audience. Chỉ tự viết filter cho cơ chế không phải bearer token chuẩn như API key, chữ ký webhook.

</details>

**3. HS256 và RS256 khác nhau, chọn cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

HS256 dùng một secret đối xứng cho cả ký và kiểm tra; mọi bên kiểm tra đều có khả năng ký token. RS256/ES256 dùng private key để ký và public key để kiểm tra, public key có thể phát qua JWKS. Một ứng dụng đơn lẻ dùng HS256 được; nhiều service kiểm tra token thì nên dùng RS256/ES256.

</details>

**4. Làm sao thu hồi JWT trước khi hết hạn?**

<details className="qa">
<summary>Xem đáp án</summary>

Bản chất JWT không thu hồi được. Các cách giảm thiểu: access token sống ngắn; refresh token lưu ở server để thu hồi; blacklist theo `jti` trong Redis với TTL bằng thời gian sống còn lại; lưu "token version" hoặc thời điểm đổi mật khẩu của user và từ chối token phát trước đó; hoặc chuyển sang opaque token + introspection khi cần thu hồi tức thì.

</details>

**5. Refresh token rotation là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Mỗi lần dùng refresh token để lấy access token mới, server cũng phát refresh token mới và vô hiệu hoá cái cũ. Nếu refresh token đã dùng bị gửi lại, server coi là dấu hiệu bị đánh cắp và thu hồi toàn bộ chuỗi token của phiên đó, buộc đăng nhập lại.

</details>

**6. Nên lưu JWT ở localStorage hay cookie?**

<details className="qa">
<summary>Xem đáp án</summary>

`localStorage` bị lộ nếu có XSS vì JavaScript đọc được. Cookie `HttpOnly` không bị JS đọc nhưng tự gửi theo request nên phải chống CSRF bằng `SameSite` và/hoặc CSRF token. Khuyến nghị: access token ngắn hạn trong bộ nhớ, refresh token trong cookie `HttpOnly; Secure; SameSite` giới hạn path; hoặc dùng mô hình BFF.

</details>

**7. Vì sao API dùng JWT thường tắt CSRF và đặt STATELESS?**

<details className="qa">
<summary>Xem đáp án</summary>

CSRF lợi dụng việc trình duyệt tự gửi cookie. Nếu API xác thực bằng header `Authorization` mà trình duyệt không tự gửi, CSRF không khai thác được nên có thể tắt. `STATELESS` để Spring Security không tạo và không đọc `HttpSession`, mỗi request tự xác thực bằng token, giúp scale ngang dễ. Nếu token nằm trong cookie thì không được tắt CSRF.

</details>
