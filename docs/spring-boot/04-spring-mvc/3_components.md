---
sidebar_position: 3
title: "3. Các thành phần Spring MVC"
---

# Các thành phần Spring MVC

Sau khi hiểu luồng bên trong `DispatcherServlet`, bài này đi vào những gì bạn viết hằng ngày: annotation khai báo controller và route, các cách lấy dữ liệu từ request, `ResponseEntity`, validation, xử lý lỗi tập trung với `@ControllerAdvice` và `ProblemDetail`, interceptor và CORS. Xuyên suốt bài là một REST API CRUD quản lý sản phẩm hoàn chỉnh mà bạn có thể chép về chạy thử.

---

:::note[Ghi nhớ nhanh]

- ⭐ **`@RestController` = `@Controller` + `@ResponseBody`** — dùng cho API JSON; `@Controller` dùng khi trả về view.
- ⭐ **`@Valid` + `@ControllerAdvice` + `ProblemDetail`** — bộ ba chuẩn để validate input và trả lỗi thống nhất theo RFC 9457.
- **Lấy dữ liệu request**: `@PathVariable` (đường dẫn), `@RequestParam` (query string), `@RequestBody` (body JSON), `@RequestHeader` (header).
- **`ResponseEntity`** cho phép kiểm soát status, header và body; trả `201 Created` kèm `Location` khi tạo mới.
- **Không trả entity JPA ra ngoài** — dùng DTO (record) để tránh lộ field và lỗi lazy loading.

:::

---

## Mục lục

- [Vì sao cần các annotation này?](#vì-sao-cần-các-annotation-này)
- [Controller và RestController](#controller-và-restcontroller)
- [Khai báo route với RequestMapping](#khai-báo-route-với-requestmapping)
- [Lấy dữ liệu từ request](#lấy-dữ-liệu-từ-request)
- [ResponseEntity và status code](#responseentity-và-status-code)
- [REST API CRUD mẫu](#rest-api-crud-mẫu)
- [Validation với Valid](#validation-với-valid)
- [Xử lý lỗi tập trung với ControllerAdvice và ProblemDetail](#xử-lý-lỗi-tập-trung-với-controlleradvice-và-problemdetail)
- [HandlerInterceptor](#handlerinterceptor)
- [CORS](#cors)

---

## Vì sao cần các annotation này?

**Vấn đề:** Trước Spring 2.5, controller phải implement interface `Controller` và khai báo URL trong XML. Mỗi lớp chỉ xử lý được một URL, tham số phải tự đọc từ `HttpServletRequest`:

```java
// Spring MVC kiểu cũ (trước annotation)
public class ProductController implements org.springframework.web.servlet.mvc.Controller {
    @Override
    public ModelAndView handleRequest(HttpServletRequest req, HttpServletResponse resp) {
        String idParam = req.getParameter("id");
        Long id = Long.valueOf(idParam);           // tự parse, tự lo NumberFormatException
        Product p = productService.findById(id);
        return new ModelAndView("productDetail", "product", p);
    }
}
```

```xml
<bean name="/product.htm" class="com.shop.web.ProductController"/>
```

**Giải pháp:** Annotation đặt route và cách binding **ngay trên method**. Spring tự parse, chuyển kiểu, validate và chuyển kết quả thành JSON:

```java
@RestController
@RequestMapping("/api/products")
public class ProductController {
    @GetMapping("/{id}")
    public ProductResponse get(@PathVariable Long id) {
        return productService.findById(id);
    }
}
```

:::tip[Dùng thực tế]

- API cho app mobile/SPA: `@RestController` + DTO record + `ResponseEntity`.
- Form đăng ký: `@Valid` trên DTO, lỗi trả về theo từng field để frontend hiện dưới ô input.
- Mọi lỗi nghiệp vụ (không tìm thấy, trùng email) gom về một `@RestControllerAdvice` để format giống nhau.
- Frontend chạy domain khác (localhost:3000) gọi API → cấu hình CORS.

:::

---

## Controller và RestController

| | `@Controller` | `@RestController` |
|---|---------------|-------------------|
| Bản chất | `@Component` đặc biệt cho tầng web | `@Controller` + `@ResponseBody` |
| Giá trị trả về | Tên view (String) hoặc `ModelAndView` | Object được ghi thành JSON/XML |
| Dùng cho | Trang HTML (Thymeleaf) | REST API |

Bạn vẫn có thể trả JSON từ `@Controller` bằng cách thêm `@ResponseBody` lên từng method — `@RestController` chỉ là cách viết gọn.

:::tip[Ví dụ đời thường]

`@Controller` giống **nhà hàng phục vụ tại bàn**: món ăn được bày lên đĩa, trang trí đẹp (render view HTML). `@RestController` giống **bếp nhận đơn giao hàng**: chỉ đóng hộp món ăn (JSON) đưa cho shipper, cách bày biện là việc của người nhận (frontend).

:::

---

## Khai báo route với RequestMapping

`@RequestMapping` khai báo đường dẫn, HTTP method, `consumes`, `produces`, header... Các annotation rút gọn:

| Annotation | Tương đương |
|------------|-------------|
| `@GetMapping` | `@RequestMapping(method = GET)` |
| `@PostMapping` | `@RequestMapping(method = POST)` |
| `@PutMapping` | `@RequestMapping(method = PUT)` |
| `@PatchMapping` | `@RequestMapping(method = PATCH)` |
| `@DeleteMapping` | `@RequestMapping(method = DELETE)` |

```java
@RestController
@RequestMapping("/api/products")          // prefix chung cho cả lớp
public class ProductController {

    @GetMapping                            // GET /api/products
    public List<ProductResponse> list() { ... }

    @GetMapping("/{id}")                   // GET /api/products/42
    public ProductResponse get(@PathVariable Long id) { ... }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ProductResponse create(@RequestBody ProductRequest req) { ... }

    @GetMapping("/{id:\\d+}/reviews")     // chỉ khớp khi id là số
    public List<ReviewResponse> reviews(@PathVariable Long id) { ... }
}
```

:::warning[Lỗi hay gặp]

Từ Spring Framework 6, **trailing slash không còn tự khớp**: `GET /api/products/` không khớp với `@GetMapping("/api/products")` và trả 404. Hãy thống nhất URL không có dấu `/` ở cuối, hoặc xử lý ở tầng proxy.

:::

---

## Lấy dữ liệu từ request

```java
@GetMapping("/{id}")
public ProductResponse get(
        @PathVariable Long id,                                   // /api/products/42
        @RequestParam(defaultValue = "vi") String lang,           // ?lang=en
        @RequestParam(required = false) String fields,           // không bắt buộc
        @RequestHeader(value = "X-Client-Version", required = false) String clientVersion,
        @CookieValue(value = "session-theme", required = false) String theme) {
    ...
}

@PostMapping
public ProductResponse create(@RequestBody ProductRequest request) { ... } // body JSON

@GetMapping("/search")
public List<ProductResponse> search(ProductFilter filter) { ... }
// không annotation + object → @ModelAttribute: ?name=ban&minPrice=100 bind vào field
```

| Annotation | Nguồn dữ liệu | Ví dụ |
|------------|---------------|-------|
| `@PathVariable` | Một đoạn của URL | `/products/42` |
| `@RequestParam` | Query string hoặc form field | `?page=2&size=20` |
| `@RequestBody` | Body (JSON) qua `HttpMessageConverter` | `{"name":"Bàn phím"}` |
| `@RequestHeader` | Header | `Authorization`, `Accept-Language` |
| `@CookieValue` | Cookie | `JSESSIONID` |
| `@ModelAttribute` | Nhiều query param/form field gộp thành object | bộ lọc tìm kiếm |

:::warning[Lỗi hay gặp]

Bỏ tên trong `@PathVariable` (viết `@PathVariable Long id`) chỉ chạy khi code được biên dịch với cờ `-parameters`. Spring Boot parent POM bật sẵn cờ này; nếu tự cấu hình Maven/Gradle mà thiếu, Spring Framework 6.1+ sẽ báo lỗi không xác định được tên tham số. Khi đó ghi rõ `@PathVariable("id")`.

:::

---

## ResponseEntity và status code

Trả về object trực tiếp → luôn là `200 OK`. Muốn đặt status, header thì dùng `ResponseEntity` hoặc `@ResponseStatus`:

```java
@PostMapping
public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest req) {
    ProductResponse created = productService.create(req);
    URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}").buildAndExpand(created.id()).toUri();
    return ResponseEntity.created(location).body(created);      // 201 + Location
}

@DeleteMapping("/{id}")
@ResponseStatus(HttpStatus.NO_CONTENT)                          // 204
public void delete(@PathVariable Long id) {
    productService.delete(id);
}

@GetMapping("/{id}")
public ResponseEntity<ProductResponse> get(@PathVariable Long id) {
    return productService.findOptional(id)
            .map(ResponseEntity::ok)                             // 200
            .orElse(ResponseEntity.notFound().build());          // 404
}
```

| Thao tác | Status hợp lý |
|----------|---------------|
| GET thành công | 200 OK |
| POST tạo mới | 201 Created + header `Location` |
| PUT/PATCH cập nhật | 200 OK (có body) hoặc 204 No Content |
| DELETE | 204 No Content |
| Dữ liệu đầu vào sai | 400 Bad Request |
| Không tìm thấy | 404 Not Found |
| Xung đột (trùng mã) | 409 Conflict |

---

## REST API CRUD mẫu

Cấu trúc gọn theo tầng: DTO → Controller → Service → Repository (Spring Data JPA).

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```

**DTO** — dùng `record` (bất biến) kèm ràng buộc validation:

```java
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank(message = "Tên không được để trống")
        @Size(max = 100, message = "Tên tối đa 100 ký tự")
        String name,

        @NotNull @DecimalMin(value = "0.0", inclusive = false, message = "Giá phải lớn hơn 0")
        BigDecimal price,

        @PositiveOrZero(message = "Tồn kho không được âm")
        int stock) {
}

public record ProductResponse(Long id, String name, BigDecimal price, int stock) {
    static ProductResponse from(Product p) {
        return new ProductResponse(p.getId(), p.getName(), p.getPrice(), p.getStock());
    }
}
```

**Exception nghiệp vụ:**

```java
public class ProductNotFoundException extends RuntimeException {
    public ProductNotFoundException(Long id) {
        super("Không tìm thấy sản phẩm id=" + id);
    }
}
```

**Service:**

```java
@Service
@Transactional(readOnly = true)
public class ProductService {
    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    public Page<ProductResponse> list(Pageable pageable) {
        return repository.findAll(pageable).map(ProductResponse::from);
    }

    public ProductResponse get(Long id) {
        return ProductResponse.from(find(id));
    }

    @Transactional
    public ProductResponse create(ProductRequest req) {
        Product saved = repository.save(new Product(req.name(), req.price(), req.stock()));
        return ProductResponse.from(saved);
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest req) {
        Product product = find(id);
        product.update(req.name(), req.price(), req.stock()); // dirty checking tự UPDATE
        return ProductResponse.from(product);
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(find(id));
    }

    private Product find(Long id) {
        return repository.findById(id).orElseThrow(() -> new ProductNotFoundException(id));
    }
}
```

**Controller:**

```java
@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping
    public Page<ProductResponse> list(
            @PageableDefault(size = 20, sort = "id") Pageable pageable) { // ?page=0&size=20&sort=price,desc
        return service.list(pageable);
    }

    @GetMapping("/{id}")
    public ProductResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest req) {
        ProductResponse created = service.create(req);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable Long id, @Valid @RequestBody ProductRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
```

Thử nhanh bằng curl:

```bash
curl -X POST localhost:8080/api/products \
  -H 'Content-Type: application/json' \
  -d '{"name":"Bàn phím cơ","price":1290000,"stock":15}'
# HTTP/1.1 201, Location: http://localhost:8080/api/products/1

curl localhost:8080/api/products/1
curl -X DELETE localhost:8080/api/products/1 -i   # 204
```

:::note[Về trả Page ra JSON]

Spring Data 3.3+ cảnh báo khi serialize trực tiếp `PageImpl` vì cấu trúc JSON không ổn định. Với API công khai, nên bật `@EnableSpringDataWebSupport(pageSerializationMode = VIA_DTO)` hoặc tự định nghĩa DTO phân trang.

:::

---

## Validation với Valid

Thêm `spring-boot-starter-validation` (Hibernate Validator, hiện thực Jakarta Bean Validation). Đặt `@Valid` trước tham số `@RequestBody`; nếu vi phạm, Spring ném `MethodArgumentNotValidException` → mặc định trả 400.

Các ràng buộc hay dùng: `@NotNull`, `@NotBlank` (chuỗi không rỗng sau khi trim), `@NotEmpty`, `@Size`, `@Min`/`@Max`, `@Positive`, `@Email`, `@Pattern`, `@Past`/`@Future`.

Validate tham số đơn (`@PathVariable`, `@RequestParam`):

```java
@GetMapping("/search")
public List<ProductResponse> search(@RequestParam @Size(min = 2) String keyword) { ... }
```

Từ Spring Framework 6.1, ràng buộc trên tham số method được kiểm tra **ngay trong MVC** (built-in method validation) và lỗi được ném dưới dạng `HandlerMethodValidationException`. Trước 6.1 bạn phải đặt `@Validated` lên lớp controller để kích hoạt qua AOP (lỗi là `ConstraintViolationException`).

:::warning[Lỗi hay gặp]

- Quên `@Valid` → các annotation `@NotBlank` trên DTO **không có tác dụng**, dữ liệu rác vào thẳng database.
- DTO lồng nhau (đơn hàng chứa danh sách item) phải đặt `@Valid` trên field con, ví dụ `@Valid List<OrderItemRequest> items`, thì item mới được kiểm tra.
- Dùng `@NotNull` cho `String` vẫn chấp nhận chuỗi `""` — muốn chặn chuỗi rỗng dùng `@NotBlank`.

:::

---

## Xử lý lỗi tập trung với ControllerAdvice và ProblemDetail

**`@ExceptionHandler`** trong một controller chỉ áp dụng cho controller đó. **`@ControllerAdvice`** (hay `@RestControllerAdvice` = thêm `@ResponseBody`) áp dụng cho mọi controller.

**`ProblemDetail`** (Spring 6) hiện thực chuẩn **RFC 9457 "Problem Details for HTTP APIs"** (thay thế RFC 7807) — một định dạng JSON lỗi thống nhất với các field `type`, `title`, `status`, `detail`, `instance` và các field mở rộng.

```java
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(ProductNotFoundException.class)
    public ProblemDetail handleNotFound(ProductNotFoundException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        pd.setTitle("Không tìm thấy tài nguyên");
        pd.setType(URI.create("https://api.shop.vn/errors/not-found"));
        return pd;
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers,
            HttpStatusCode status, WebRequest request) {
        Map<String, String> errors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(FieldError::getField,
                        fe -> Objects.requireNonNullElse(fe.getDefaultMessage(), "không hợp lệ"),
                        (a, b) -> a));
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Dữ liệu không hợp lệ");
        pd.setProperty("errors", errors);
        return ResponseEntity.badRequest().body(pd);
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleUnexpected(Exception ex) {
        log.error("Lỗi không mong muốn", ex);   // log đầy đủ ở server
        return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR,
                "Đã có lỗi xảy ra, vui lòng thử lại sau"); // không lộ stack trace
    }

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
}
```

Response khi gửi tên rỗng và giá âm:

```json
{
  "type": "about:blank",
  "title": "Bad Request",
  "status": 400,
  "detail": "Dữ liệu không hợp lệ",
  "instance": "/api/products",
  "errors": {
    "name": "Tên không được để trống",
    "price": "Giá phải lớn hơn 0"
  }
}
```

`ResponseEntityExceptionHandler` là lớp nền của Spring đã có sẵn handler cho các exception chuẩn của MVC (405, 415, 400...) và trả về `ProblemDetail`. Nếu không muốn tự viết advice, có thể bật để Spring Boot tự dùng định dạng này cho các lỗi MVC chuẩn:

```yaml
spring:
  mvc:
    problemdetails:
      enabled: true
```

:::tip[Ví dụ đời thường]

`@ControllerAdvice` giống **phòng chăm sóc khách hàng** của một chuỗi cửa hàng. Cửa hàng nào gặp sự cố (exception) cũng chuyển về một phòng duy nhất, và phòng đó trả lời khách theo **một mẫu văn bản chuẩn** (`ProblemDetail`): mã sự cố, tiêu đề, mô tả. Khách không bao giờ phải nghe nhân viên bán hàng giải thích lỗi kỹ thuật lộn xộn.

:::

---

## HandlerInterceptor

Interceptor chạy **bên trong** `DispatcherServlet`, có ba điểm móc:

- `preHandle` — trước khi gọi controller; trả `false` để chặn.
- `postHandle` — sau controller, trước khi render view (không chạy nếu có exception).
- `afterCompletion` — luôn chạy sau cùng, kể cả khi có exception.

```java
public class ApiVersionInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response,
                             Object handler) throws IOException {
        String version = request.getHeader("X-Api-Version");
        if (version != null && !version.equals("1")) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Phiên bản API không hỗ trợ");
            return false;                    // dừng, không gọi controller
        }
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                Object handler, Exception ex) {
        if (handler instanceof HandlerMethod hm) {
            // biết chính xác method nào vừa xử lý
            request.setAttribute("handledBy", hm.getMethod().getName());
        }
    }
}

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new ApiVersionInterceptor())
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/health");
    }
}
```

:::warning[Lỗi hay gặp]

Đừng dùng interceptor để làm xác thực/phân quyền — đó là việc của Spring Security (filter), chạy sớm hơn và bao phủ cả request không vào Spring MVC (static file, `/error`).

:::

---

## CORS

**CORS** (Cross-Origin Resource Sharing) là cơ chế trình duyệt chặn JavaScript ở domain A gọi API ở domain B, trừ khi server B trả header cho phép. Trình duyệt có thể gửi trước một request **preflight** `OPTIONS` để hỏi.

Cho phép ở mức method/lớp:

```java
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/products")
public class ProductController { ... }
```

Cấu hình toàn cục:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("https://shop.vn", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

:::warning[Lỗi hay gặp]

- `allowedOrigins("*")` cùng `allowCredentials(true)` bị Spring từ chối (trình duyệt cũng không chấp nhận). Liệt kê origin cụ thể hoặc dùng `allowedOriginPatterns`.
- Khi có Spring Security, preflight `OPTIONS` có thể bị chặn trước khi tới MVC → phải bật `http.cors(Customizer.withDefaults())` để Security dùng cấu hình CORS.
- CORS chỉ là luật của **trình duyệt**; Postman/curl không bị ảnh hưởng, và CORS không phải là cơ chế bảo mật API.

:::
