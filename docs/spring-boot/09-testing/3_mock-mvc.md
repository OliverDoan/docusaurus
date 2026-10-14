---
sidebar_position: 3
title: "3. MockMvc"
---

# MockMvc

MockMvc cho phép test tầng web của Spring MVC — controller, validation, exception handler, bảo mật, chuyển đổi JSON — **mà không cần khởi động server thật**. Request được đưa thẳng vào `DispatcherServlet` trong bộ nhớ, nên test chạy nhanh nhưng vẫn đi qua đầy đủ cơ chế của Spring MVC. Bài này hướng dẫn `@WebMvcTest`, cú pháp `perform`/`andExpect`, kiểm tra JSON bằng `jsonPath`, test validation và `@ControllerAdvice`, test với Spring Security qua `@WithMockUser`, và giới thiệu `MockMvcTester` — API mới dựa trên AssertJ.

---

:::note[Ghi nhớ nhanh]

- ⭐ **`@WebMvcTest(XController.class)`** chỉ nạp tầng web (controller, `@ControllerAdvice`, filter, converter, Jackson) — service phải được mock bằng `@MockitoBean`.
- ⭐ **`perform(...)` → `andExpect(...)`** — dựng request, rồi kiểm tra status, header, body; `jsonPath("$.name").value("...")` để assert JSON.
- **Test cả nhánh lỗi**: body sai → 400 kèm chi tiết field; không tìm thấy → 404 từ exception handler.
- **Có Spring Security**: `@WithMockUser(roles = "ADMIN")` giả lập người dùng; request POST/PUT/DELETE cần `.with(csrf())` nếu CSRF đang bật; JWT dùng `.with(jwt())`.
- **`MockMvcTester`** (Spring Framework 6.2, Boot 3.4) — viết assertion theo phong cách AssertJ, không cần `throws Exception`.

:::

---

## Mục lục

- [Vì sao cần MockMvc?](#vì-sao-cần-mockmvc)
- [@WebMvcTest và test đầu tiên](#webmvctest-và-test-đầu-tiên)
- [perform và andExpect](#perform-và-andexpect)
- [Kiểm tra JSON với jsonPath](#kiểm-tra-json-với-jsonpath)
- [Test validation và exception handler](#test-validation-và-exception-handler)
- [Test với Spring Security](#test-với-spring-security)
- [MockMvcTester: API mới với AssertJ](#mockmvctester-api-mới-với-assertj)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vì sao cần MockMvc?

**Vấn đề:** Gọi thẳng method controller như một class Java:

```java
@Test
void createProduct() {
    ProductController controller = new ProductController(productService);
    ResponseEntity<ProductDto> res = controller.create(new CreateProductRequest("", -5));
    // Pass! Nhưng ngoài thực tế:
    // - @Valid không chạy → dữ liệu rỗng, giá âm lọt qua
    // - URL /api/products có map đúng không? method POST hay PUT?
    // - JSON request có được parse đúng tên field không?
    // - @ControllerAdvice có trả 400 đúng format không?
    // - Endpoint có bị Security chặn không?
}
```

Gọi method trực tiếp bỏ qua toàn bộ những gì Spring MVC làm quanh controller. Còn khởi động server thật với `@SpringBootTest(RANDOM_PORT)` thì chậm và phải dựng cả database.

**Giải pháp:** MockMvc giả lập request HTTP và đẩy qua `DispatcherServlet` thật:

```java
mockMvc.perform(post("/api/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        { "name": "", "price": -5 }
                        """))
       .andExpect(status().isBadRequest())
       .andExpect(jsonPath("$.errors.name").exists());
```

:::tip[Dùng thực tế]

- Kiểm tra mapping URL, HTTP method, status code của từng endpoint.
- Kiểm tra validation (`@Valid`, `@NotBlank`, `@Min`) trả lỗi đúng định dạng.
- Kiểm tra `@ControllerAdvice` chuyển exception thành response chuẩn (ProblemDetail).
- Kiểm tra phân quyền: user thường gọi API admin nhận 403.

:::

:::tip[Ví dụ đời thường]

MockMvc giống **diễn tập phòng cháy trong toà nhà**: chuông báo, lối thoát, người hướng dẫn đều thật, chỉ có ngọn lửa là giả. Bạn kiểm tra được cả quy trình mà không phải đốt thật toà nhà (khởi động server, kết nối DB).

:::

---

## @WebMvcTest và test đầu tiên

Controller cần test:

```java
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping("/{id}")
    public ProductDto get(@PathVariable Long id) {
        return productService.findById(id);
    }

    @PostMapping
    public ResponseEntity<ProductDto> create(@Valid @RequestBody CreateProductRequest req) {
        ProductDto created = productService.create(req);
        return ResponseEntity.created(URI.create("/api/products/" + created.id())).body(created);
    }
}

public record CreateProductRequest(
        @NotBlank String name,
        @NotNull @Positive BigDecimal price) {}
```

Test:

```java
@WebMvcTest(ProductController.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductService productService;

    @Test
    void getProduct_returns200() throws Exception {
        when(productService.findById(1L))
                .thenReturn(new ProductDto(1L, "iPhone 15", new BigDecimal("22000000")));

        mockMvc.perform(get("/api/products/{id}", 1L))
               .andExpect(status().isOk())
               .andExpect(content().contentType(MediaType.APPLICATION_JSON))
               .andExpect(jsonPath("$.name").value("iPhone 15"));
    }
}
```

`@WebMvcTest` nạp những gì?

| Được nạp | Không được nạp |
|----------|----------------|
| `@Controller`, `@RestController` (chỉ class chỉ định, hoặc tất cả nếu để trống) | `@Service`, `@Repository`, `@Component` thông thường |
| `@ControllerAdvice` | DataSource, JPA |
| `Filter`, `WebMvcConfigurer`, `Converter`, `HandlerMethodArgumentResolver` | Bean `@Configuration` của bạn (trừ khi `@Import`) |
| Jackson (`ObjectMapper`, `@JsonComponent`) | |
| Auto-config Spring Security và `MockMvc` | |

:::warning[Lỗi hay gặp]

- Quên mock service mà controller phụ thuộc → lỗi `NoSuchBeanDefinitionException` khi dựng context.
- Đặt `@EnableJpaAuditing` hoặc `@EnableScheduling`... trên class `@SpringBootApplication` → `@WebMvcTest` cũng nạp nó và đòi bean JPA không có. Tách các `@Enable...` sang class `@Configuration` riêng.
- Viết `@WebMvcTest` không chỉ định controller → nạp **mọi** controller, phải mock mọi service. Luôn chỉ định class.

:::

---

## perform và andExpect

Dựng request với `MockMvcRequestBuilders`:

```java
mockMvc.perform(put("/api/products/{id}", 5)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .header("X-Request-Id", "abc-123")
                .param("notify", "true")
                .content(objectMapper.writeValueAsString(request)))
       .andDo(print())                                  // in request/response khi debug
       .andExpect(status().isOk())
       .andExpect(header().string("Cache-Control", "no-store"))
       .andExpect(jsonPath("$.id").value(5));
```

Các matcher thường dùng (`MockMvcResultMatchers`):

| Matcher | Ví dụ |
|---------|-------|
| `status()` | `isOk()`, `isCreated()`, `isNoContent()`, `isBadRequest()`, `isNotFound()`, `isForbidden()` |
| `header()` | `string("Location", "/api/products/1")`, `exists("ETag")` |
| `content()` | `contentType(...)`, `string(containsString("..."))`, `json("{...}")` |
| `jsonPath()` | `value(...)`, `exists()`, `isArray()`, `isEmpty()` |
| `cookie()` | `exists("SESSION")` |

Lấy kết quả ra để xử lý thêm:

```java
MvcResult result = mockMvc.perform(post("/api/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        { "name": "AirPods", "price": 5000000 }
                        """))
        .andExpect(status().isCreated())
        .andReturn();

ProductDto body = objectMapper.readValue(result.getResponse().getContentAsString(), ProductDto.class);
assertThat(body.name()).isEqualTo("AirPods");
```

---

## Kiểm tra JSON với jsonPath

JsonPath là ngôn ngữ truy vấn JSON: `$` là gốc, `.field` truy cập thuộc tính, `[i]` truy cập phần tử.

Giả sử response:

```json
{
  "content": [
    { "id": 1, "name": "iPhone 15", "tags": ["apple", "phone"] },
    { "id": 2, "name": "Galaxy S24", "tags": ["samsung", "phone"] }
  ],
  "totalElements": 2
}
```

```java
mockMvc.perform(get("/api/products"))
       .andExpect(status().isOk())
       .andExpect(jsonPath("$.content").isArray())
       .andExpect(jsonPath("$.content.length()").value(2))
       .andExpect(jsonPath("$.content[0].name").value("iPhone 15"))
       .andExpect(jsonPath("$.content[1].tags", hasItem("samsung")))
       .andExpect(jsonPath("$.content[*].id", contains(1, 2)))
       .andExpect(jsonPath("$.totalElements").value(2))
       .andExpect(jsonPath("$.password").doesNotExist());     // không lộ field nhạy cảm
```

`hasItem`, `contains` là matcher của Hamcrest (`org.hamcrest.Matchers`).

So sánh cả khối JSON (bỏ qua thứ tự field) bằng `content().json(...)`:

```java
.andExpect(content().json("""
        { "id": 1, "name": "iPhone 15" }
        """));        // chế độ lenient: response có thêm field khác vẫn pass
```

:::warning[Lỗi hay gặp]

- So sánh số thập phân: `jsonPath("$.price").value(22000000.0)` có thể fail vì JSON trả `22000000` (kiểu Integer). Cẩn thận kiểu dữ liệu, hoặc so sánh dạng chuỗi/`BigDecimal` với matcher phù hợp.
- Assert toàn bộ JSON chuỗi cứng (`content().string("...")`) → gãy khi thứ tự field hay khoảng trắng thay đổi. Dùng `jsonPath` hoặc `content().json(...)`.

:::

---

## Test validation và exception handler

Exception handler toàn cục:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ProductNotFoundException.class)
    public ProblemDetail notFound(ProductNotFoundException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        pd.setTitle("Không tìm thấy sản phẩm");
        return pd;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail invalid(MethodArgumentNotValidException ex) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        pd.setTitle("Dữ liệu không hợp lệ");
        Map<String, String> errors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(FieldError::getField,
                        fe -> Objects.requireNonNullElse(fe.getDefaultMessage(), "không hợp lệ"),
                        (a, b) -> a));
        pd.setProperty("errors", errors);
        return pd;
    }
}
```

Test:

```java
@Test
void createProduct_invalidBody_returns400WithFieldErrors() throws Exception {
    mockMvc.perform(post("/api/products")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            { "name": "", "price": -1 }
                            """))
           .andExpect(status().isBadRequest())
           .andExpect(jsonPath("$.title").value("Dữ liệu không hợp lệ"))
           .andExpect(jsonPath("$.errors.name").exists())
           .andExpect(jsonPath("$.errors.price").exists());

    verifyNoInteractions(productService);       // dữ liệu sai thì không được gọi xuống service
}

@Test
void getProduct_notFound_returns404ProblemDetail() throws Exception {
    when(productService.findById(99L)).thenThrow(new ProductNotFoundException(99L));

    mockMvc.perform(get("/api/products/99"))
           .andExpect(status().isNotFound())
           .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
           .andExpect(jsonPath("$.title").value("Không tìm thấy sản phẩm"));
}

@Test
void createProduct_malformedJson_returns400() throws Exception {
    mockMvc.perform(post("/api/products")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{ không phải json"))
           .andExpect(status().isBadRequest());
}
```

`@RestControllerAdvice` được `@WebMvcTest` tự nạp — nhờ vậy test bao phủ cả định dạng lỗi trả về client.

---

## Test với Spring Security

```xml
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-test</artifactId>
    <scope>test</scope>
</dependency>
```

`@WebMvcTest` tự cấu hình Spring Security. Để test đúng **quy tắc phân quyền của bạn**, import class cấu hình `SecurityFilterChain`:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .httpBasic(Customizer.withDefaults())
                .build();
    }
}
```

```java
@WebMvcTest(AdminProductController.class)
@Import(SecurityConfig.class)
class AdminProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductService productService;

    @Test
    void anonymous_returns401() throws Exception {
        mockMvc.perform(delete("/api/admin/products/1").with(csrf()))
               .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    void normalUser_returns403() throws Exception {
        mockMvc.perform(delete("/api/admin/products/1").with(csrf()))
               .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void admin_returns204() throws Exception {
        mockMvc.perform(delete("/api/admin/products/1").with(csrf()))
               .andExpect(status().isNoContent());

        verify(productService).delete(1L);
    }
}
```

Các cách giả lập người dùng khác (`SecurityMockMvcRequestPostProcessors`):

```java
// Gắn user cho một request
mockMvc.perform(get("/api/orders").with(user("an").roles("USER")));

// API là OAuth2 Resource Server dùng JWT
mockMvc.perform(get("/api/orders")
        .with(jwt().jwt(j -> j.subject("user-42"))
                   .authorities(new SimpleGrantedAuthority("SCOPE_orders.read"))));
```

:::warning[Lỗi hay gặp]

- Test POST/PUT/DELETE nhận **403** dù đã `@WithMockUser(roles = "ADMIN")` → do CSRF đang bật mặc định. Thêm `.with(csrf())` (hoặc cấu hình tắt CSRF cho API stateless).
- Không `@Import(SecurityConfig.class)` → test dùng cấu hình bảo mật **mặc định** của Boot (mọi endpoint yêu cầu đăng nhập), không phản ánh quy tắc thật.
- `@WithMockUser(roles = "ROLE_ADMIN")` → lỗi vì `roles` tự thêm tiền tố `ROLE_`. Dùng `roles = "ADMIN"` hoặc `authorities = "ROLE_ADMIN"`.

:::

---

## MockMvcTester: API mới với AssertJ

Spring Framework 6.2 (Spring Boot 3.4) bổ sung `MockMvcTester` — bọc MockMvc bằng assertion AssertJ, dễ đọc hơn và không cần `throws Exception`. Khi AssertJ có trên classpath, `@WebMvcTest`/`@AutoConfigureMockMvc` tự cấu hình bean này.

```java
@WebMvcTest(ProductController.class)
class ProductControllerTesterTest {

    @Autowired
    private MockMvcTester mvc;

    @MockitoBean
    private ProductService productService;

    @Test
    void getProduct() {
        when(productService.findById(1L))
                .thenReturn(new ProductDto(1L, "iPhone 15", new BigDecimal("22000000")));

        assertThat(mvc.get().uri("/api/products/{id}", 1L))
                .hasStatusOk()
                .hasContentType(MediaType.APPLICATION_JSON)
                .bodyJson()
                .extractingPath("$.name").isEqualTo("iPhone 15");
    }

    @Test
    void createProduct_invalid() {
        assertThat(mvc.post().uri("/api/products")
                       .contentType(MediaType.APPLICATION_JSON)
                       .content("""
                               { "name": "", "price": -1 }
                               """))
                .hasStatus(HttpStatus.BAD_REQUEST);
    }
}
```

| | MockMvc truyền thống | `MockMvcTester` |
|---|---|---|
| Phong cách | `perform(...).andExpect(...)` với Hamcrest | `assertThat(mvc.get()...)` với AssertJ |
| Exception | Method test phải `throws Exception` | Không cần |
| Thông báo lỗi | Đôi khi khó đọc | Rõ ràng theo kiểu AssertJ |
| Tương thích | Mọi phiên bản | Spring Framework 6.2+ |

Hai cách dùng song song được; code cũ không cần chuyển gấp.

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. MockMvc khác gì so với gọi API bằng `TestRestTemplate`?**

<details className="qa">
<summary>Xem đáp án</summary>

MockMvc không mở cổng mạng: request được dựng trong bộ nhớ và đưa thẳng vào `DispatcherServlet`, chạy cùng luồng với test (nên `@Transactional` trên test có thể rollback). `TestRestTemplate` gửi HTTP thật tới server nhúng đang chạy, đi qua cả tầng servlet container (Tomcat), gần thực tế hơn nhưng chậm hơn và không rollback được. MockMvc phù hợp test tầng web chi tiết; `TestRestTemplate` cho integration test đầu-cuối.

</details>

**2. `@WebMvcTest` nạp những bean nào? Vì sao phải mock service?**

<details className="qa">
<summary>Xem đáp án</summary>

Nó chỉ nạp các thành phần tầng web: controller (được chỉ định), `@ControllerAdvice`, filter, `WebMvcConfigurer`, converter, Jackson, auto-config Spring Security và MockMvc. Các `@Service`, `@Repository` và cấu hình dữ liệu không được nạp, nên phụ thuộc của controller phải được cung cấp bằng `@MockitoBean`. Nhờ vậy test nhanh và chỉ tập trung vào hành vi tầng web.

</details>

**3. Làm sao test validation của request body?**

<details className="qa">
<summary>Xem đáp án</summary>

Gửi request với body vi phạm ràng buộc (`@NotBlank`, `@Positive`...) qua MockMvc, kỳ vọng status 400 và dùng `jsonPath` kiểm tra cấu trúc lỗi do `@ControllerAdvice` trả về (tên field lỗi, thông điệp). Đồng thời `verifyNoInteractions(service)` để chắc dữ liệu sai không đi xuống tầng nghiệp vụ. Test thêm JSON sai cú pháp để chắc trả 400 chứ không phải 500.

</details>

**4. Vì sao test POST với `@WithMockUser` vẫn bị 403?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì Spring Security bật bảo vệ CSRF mặc định cho các method thay đổi dữ liệu. Request trong test không có CSRF token nên bị từ chối với 403. Thêm `.with(csrf())` từ `SecurityMockMvcRequestPostProcessors`, hoặc nếu API là stateless dùng JWT thì cấu hình tắt CSRF trong `SecurityFilterChain` và import cấu hình đó vào test.

</details>

**5. `@WithMockUser` hoạt động thế nào? Có cách nào khác giả lập người dùng?**

<details className="qa">
<summary>Xem đáp án</summary>

`@WithMockUser` (từ `spring-security-test`) tạo một `SecurityContext` chứa `UsernamePasswordAuthenticationToken` với username, roles/authorities chỉ định, trước khi test chạy. Các cách khác: `@WithUserDetails` (nạp user thật từ `UserDetailsService`), `@WithSecurityContext` cho annotation tự định nghĩa, và request post-processor như `.with(user(...))`, `.with(jwt())`, `.with(oauth2Login())` cho từng request.

</details>

**6. `MockMvcTester` là gì? Có nên chuyển sang dùng không?**

<details className="qa">
<summary>Xem đáp án</summary>

`MockMvcTester` là API mới từ Spring Framework 6.2 bọc MockMvc bằng AssertJ: viết `assertThat(mvc.get().uri(...)).hasStatusOk().bodyJson()...` thay cho chuỗi `perform().andExpect()` với Hamcrest; không cần khai báo `throws Exception` và thông báo lỗi dễ đọc hơn. Với test mới trên Boot 3.4+ nên cân nhắc dùng; test cũ vẫn chạy bình thường, không bắt buộc chuyển.

</details>
