---
sidebar_position: 5
title: "5. Spring Cloud OpenFeign"
---

# Spring Cloud OpenFeign

Trong microservices, các dịch vụ gọi HTTP lẫn nhau liên tục. Viết tay từng lời gọi bằng `RestTemplate` vừa dài vừa dễ sai. **OpenFeign** cho phép khai báo một interface Java kèm annotation kiểu Spring MVC, và Spring tự sinh HTTP client tương ứng — giống cách Spring Data sinh repository. Bài này hướng dẫn `@FeignClient`, `@EnableFeignClients`, xử lý lỗi bằng `ErrorDecoder`, cấu hình timeout, và giới thiệu **HTTP Interface** (`@HttpExchange` + `RestClient`) — lựa chọn mới hơn có sẵn trong Spring Framework 6.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Khai báo interface + `@FeignClient(name = "catalog-service")`** — dùng annotation `@GetMapping`, `@PathVariable`... giống controller; tích hợp sẵn LoadBalancer khi có discovery.
- ⭐ **Luôn cấu hình timeout** — `connectTimeout` và `readTimeout` qua `spring.cloud.openfeign.client.config`; kết hợp circuit breaker để không treo luồng.
- **`ErrorDecoder`** chuyển response 4xx/5xx thành exception nghiệp vụ có nghĩa (thay vì `FeignException` chung chung).
- **OpenFeign đang ở chế độ "feature-complete"** — đội Spring Cloud khuyến nghị dự án mới cân nhắc **HTTP Interface** (`@HttpExchange` với `RestClient`/`WebClient`) có sẵn trong Spring Framework 6.
- **Không dùng chung interface giữa server và client** (kế thừa controller) — gây ràng buộc chặt giữa hai dịch vụ.

:::

---

## Mục lục

- [Vì sao OpenFeign ra đời?](#vì-sao-openfeign-ra-đời)
- [Khai báo Feign client](#khai-báo-feign-client)
- [Cấu hình timeout và logging](#cấu-hình-timeout-và-logging)
- [Xử lý lỗi với ErrorDecoder](#xử-lý-lỗi-với-errordecoder)
- [Interceptor truyền token](#interceptor-truyền-token)
- [HTTP Interface: lựa chọn mới hơn](#http-interface-lựa-chọn-mới-hơn)

---

## Vì sao OpenFeign ra đời?

**Vấn đề:** Gọi `catalog-service` bằng `RestTemplate`:

```java
@Service
public class CatalogGateway {

    private final RestTemplate restTemplate;

    public ProductDto getProduct(long id) {
        try {
            return restTemplate.getForObject(
                    "http://catalog-service/api/products/{id}", ProductDto.class, id);
        } catch (HttpClientErrorException.NotFound e) {
            throw new ProductNotFoundException(id);
        }
    }

    public List<ProductDto> search(String keyword, int page) {
        String url = UriComponentsBuilder.fromUriString("http://catalog-service/api/products")
                .queryParam("q", keyword)
                .queryParam("page", page)
                .toUriString();
        ProductDto[] arr = restTemplate.getForObject(url, ProductDto[].class);
        return arr == null ? List.of() : List.of(arr);
    }

    // ... mỗi endpoint thêm 10 dòng lặp lại
}
```

Ghép URL, xử lý lỗi, chuyển kiểu — lặp lại cho mọi endpoint của mọi dịch vụ.

**Giải pháp:** Netflix tạo Feign (sau chuyển thành dự án cộng đồng OpenFeign), Spring Cloud tích hợp với annotation Spring MVC:

```java
@FeignClient(name = "catalog-service")
public interface CatalogClient {

    @GetMapping("/api/products/{id}")
    ProductDto getProduct(@PathVariable("id") long id);

    @GetMapping("/api/products")
    List<ProductDto> search(@RequestParam("q") String keyword,
                            @RequestParam("page") int page);
}
```

Inject `CatalogClient` và gọi như method thường.

:::tip[Dùng thực tế]

- `order-service` gọi `catalog-service` kiểm tra giá và tồn kho.
- `payment-service` gọi cổng thanh toán bên thứ ba qua URL cố định.
- Gọi API nội bộ có xác thực, cần tự gắn token cho mọi request.
- Kết hợp circuit breaker để trả kết quả dự phòng khi dịch vụ đích lỗi.

:::

:::tip[Ví dụ đời thường]

Feign giống **điền mẫu đơn có sẵn ở bưu điện**: bạn chỉ điền tên người nhận, địa chỉ, nội dung (tham số method) — bưu điện lo đóng gói, dán tem, vận chuyển (HTTP). Không ai phải tự đóng thùng gỗ cho mỗi lá thư.

:::

---

## Khai báo Feign client

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

Bật quét Feign client:

```java
@SpringBootApplication
@EnableFeignClients(basePackages = "com.example.order.client")
public class OrderServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}
```

Các kiểu khai báo thường gặp:

```java
@FeignClient(name = "catalog-service", path = "/api/products")
public interface CatalogClient {

    @GetMapping("/{id}")
    ProductDto getProduct(@PathVariable("id") long id);

    @GetMapping
    List<ProductDto> search(@RequestParam("q") String q, @SpringQueryMap PageQuery page);

    @PostMapping("/reserve")
    ReservationDto reserve(@RequestBody ReserveRequest request,
                           @RequestHeader("Idempotency-Key") String key);

    @GetMapping("/{id}/stock")
    ResponseEntity<StockDto> stock(@PathVariable("id") long id);   // lấy cả status, header
}

// Gọi URL cố định (API bên ngoài), không qua discovery
@FeignClient(name = "vnpay", url = "${payment.vnpay.base-url}")
public interface VnpayClient {

    @PostMapping("/transactions")
    TransactionResponse create(@RequestBody TransactionRequest req);
}
```

Sử dụng:

```java
@Service
@RequiredArgsConstructor
public class OrderService {

    private final CatalogClient catalogClient;

    public Order place(PlaceOrderCommand cmd) {
        ProductDto product = catalogClient.getProduct(cmd.productId());
        if (product.stock() < cmd.quantity()) {
            throw new OutOfStockException(cmd.productId());
        }
        // ...
    }
}
```

Khi có Eureka/LoadBalancer trên classpath, `name` được dùng làm tên dịch vụ để tìm instance. Khi có `url`, Feign gọi thẳng URL đó.

:::warning[Lỗi hay gặp]

- Thiếu tên trong `@PathVariable("id")`/`@RequestParam("q")` → khi biên dịch không có cờ `-parameters`, Feign không biết tên tham số và báo lỗi lúc khởi động. Luôn ghi tên tường minh.
- Viết interface Feign **kế thừa** interface của controller bên dịch vụ đích để "tái sử dụng" → hai dịch vụ dính chặt vào cùng một artifact, đổi một bên là vỡ bên kia.
- Gọi Feign bên trong `@Transactional` dài → giữ kết nối DB trong lúc chờ mạng. Gọi dịch vụ ngoài trước hoặc sau transaction.

:::

---

## Cấu hình timeout và logging

Mặc định của Spring Cloud OpenFeign: connect timeout 10 giây, read timeout 60 giây — **quá dài** cho gọi nội bộ. Cấu hình lại:

```yaml
spring:
  cloud:
    openfeign:
      client:
        config:
          default:                       # áp dụng mọi client
            connect-timeout: 2000
            read-timeout: 5000
            logger-level: basic
          catalog-service:               # ghi đè riêng cho một client
            read-timeout: 2000
      circuitbreaker:
        enabled: true                    # bọc mọi Feign client bằng circuit breaker
      httpclient:
        hc5:
          enabled: true                  # dùng Apache HttpClient 5 thay cho HttpURLConnection

logging:
  level:
    com.example.order.client: DEBUG      # logger-level của Feign chỉ in khi package ở DEBUG
```

Mức log Feign: `NONE`, `BASIC` (method, URL, status, thời gian), `HEADERS`, `FULL` (cả body — chỉ dùng khi debug vì có thể lộ dữ liệu nhạy cảm).

Fallback khi bật circuit breaker:

```java
@FeignClient(name = "catalog-service", fallbackFactory = CatalogFallbackFactory.class)
public interface CatalogClient {
    @GetMapping("/api/products/{id}")
    ProductDto getProduct(@PathVariable("id") long id);
}

@Component
@Slf4j
public class CatalogFallbackFactory implements FallbackFactory<CatalogClient> {

    @Override
    public CatalogClient create(Throwable cause) {
        return id -> {
            log.warn("Catalog không khả dụng, trả dữ liệu dự phòng cho {}", id, cause);
            return ProductDto.unavailable(id);
        };
    }
}
```

`fallbackFactory` tốt hơn `fallback` vì nhận được nguyên nhân lỗi (`cause`) để ghi log hoặc phân nhánh.

:::warning[Lỗi hay gặp]

- Không đặt timeout → khi `catalog-service` treo, mọi luồng của `order-service` bị giữ 60 giây, thread pool cạn, `order-service` chết theo (cascading failure).
- Fallback trả dữ liệu "giả như thật" (ví dụ tồn kho = 999) → đơn hàng sai. Fallback phải an toàn: trả trạng thái "không xác định" và để nghiệp vụ quyết định.

:::

---

## Xử lý lỗi với ErrorDecoder

Mặc định, response không thành công (status không phải 2xx) bị chuyển thành `FeignException` (có lớp con như `FeignException.NotFound`). Muốn exception mang ý nghĩa nghiệp vụ, viết `ErrorDecoder`:

```java
@Slf4j
public class CatalogErrorDecoder implements ErrorDecoder {

    private final ErrorDecoder defaultDecoder = new ErrorDecoder.Default();

    @Override
    public Exception decode(String methodKey, Response response) {
        int status = response.status();
        return switch (status) {
            case 404 -> new ProductNotFoundException("Không tìm thấy sản phẩm: " + methodKey);
            case 409 -> new OutOfStockException("Hết hàng");
            case 503 -> new CatalogUnavailableException("Catalog tạm thời quá tải");
            default -> {
                log.error("Lỗi gọi catalog {} status {}", methodKey, status);
                yield defaultDecoder.decode(methodKey, response);
            }
        };
    }
}
```

Đăng ký cho một client:

```java
public class CatalogClientConfig {

    @Bean
    public ErrorDecoder catalogErrorDecoder() {
        return new CatalogErrorDecoder();
    }
}

@FeignClient(name = "catalog-service", configuration = CatalogClientConfig.class)
public interface CatalogClient { /* ... */ }
```

Giống LoadBalancer, class cấu hình riêng cho client **không** đặt `@Configuration` (hoặc nằm ngoài vùng component-scan), nếu không bean sẽ áp dụng cho mọi Feign client.

Nếu decoder trả về `RetryableException`, Feign sẽ chuyển cho `Retryer` — nhưng mặc định Spring Cloud dùng `Retryer.NEVER_RETRY`, muốn retry phải khai báo bean `Retryer`. Trong thực tế nên để Resilience4j lo retry (bài Circuit Breaker) cho thống nhất, còn decoder chỉ cần ném exception nghiệp vụ rõ nghĩa như trên.

---

## Interceptor truyền token

Gọi dịch vụ nội bộ cần mang theo JWT của người dùng:

```java
@Component
public class BearerTokenInterceptor implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate template) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwtAuth) {
            template.header(HttpHeaders.AUTHORIZATION,
                    "Bearer " + jwtAuth.getToken().getTokenValue());
        }
    }
}
```

`RequestInterceptor` là bean toàn cục sẽ áp cho mọi Feign client; muốn chỉ áp cho một client thì khai báo trong class `configuration` riêng.

:::warning[Lỗi hay gặp]

Khi Feign chạy trong luồng khác (ví dụ trong `CompletableFuture`, hoặc circuit breaker dùng thread pool riêng), `SecurityContextHolder` mặc định là ThreadLocal nên **trống** → token không được gắn. Cần truyền context sang luồng mới hoặc dùng chế độ semaphore.

:::

---

## HTTP Interface: lựa chọn mới hơn

Spring Framework 6 (Boot 3) đưa vào **HTTP Interface**: khai báo interface với `@HttpExchange`, Spring tạo proxy trên nền `RestClient` (blocking) hoặc `WebClient` (reactive). Không cần thư viện Feign, không cần Spring Cloud.

```java
@HttpExchange("/api/products")
public interface CatalogHttpClient {

    @GetExchange("/{id}")
    ProductDto getProduct(@PathVariable long id);

    @GetExchange
    List<ProductDto> search(@RequestParam("q") String keyword);

    @PostExchange("/reserve")
    ReservationDto reserve(@RequestBody ReserveRequest request);
}
```

```java
@Configuration
public class HttpClientsConfig {

    @Bean
    @LoadBalanced
    RestClient.Builder lbRestClientBuilder() {
        return RestClient.builder();
    }

    @Bean
    CatalogHttpClient catalogHttpClient(RestClient.Builder lbRestClientBuilder) {
        RestClient restClient = lbRestClientBuilder
                .baseUrl("http://catalog-service")
                .defaultStatusHandler(HttpStatusCode::is4xxClientError, (req, res) -> {
                    throw new CatalogClientException(res.getStatusCode());
                })
                .build();
        HttpServiceProxyFactory factory = HttpServiceProxyFactory
                .builderFor(RestClientAdapter.create(restClient))
                .build();
        return factory.createClient(CatalogHttpClient.class);
    }
}
```

Timeout cấu hình qua `ClientHttpRequestFactory` của `RestClient` (ví dụ `JdkClientHttpRequestFactory` hoặc `HttpComponentsClientHttpRequestFactory`), hoặc từ Boot 3.4 qua các thuộc tính `spring.http.client.*`.

| Tiêu chí | OpenFeign | HTTP Interface |
|----------|-----------|----------------|
| Thuộc về | Spring Cloud + thư viện OpenFeign | Spring Framework 6 (core) |
| Annotation | `@FeignClient` + annotation MVC | `@HttpExchange`, `@GetExchange`... |
| Nền tảng HTTP | Feign client (HttpURLConnection, Apache HC5, OkHttp) | `RestClient`, `WebClient`, `RestTemplate` |
| Reactive | Không chính thức | Có (qua `WebClient`) |
| Tự đăng ký bean | `@EnableFeignClients` | Phải tự tạo bean bằng `HttpServiceProxyFactory` (Boot 4 có hỗ trợ đăng ký tự động hơn) |
| Trạng thái | Feature-complete, chủ yếu bảo trì | Hướng phát triển chính |

Gợi ý: dự án cũ đang dùng Feign ổn định thì giữ nguyên; dự án mới trên Boot 3.2+ nên cân nhắc HTTP Interface với `RestClient`.
