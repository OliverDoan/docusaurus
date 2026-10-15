---
sidebar_position: 8
title: "8. Microservices với Spring Cloud"
---

# 8. Microservices với Spring Cloud

## 1. Tổng quan Microservices & Spring Cloud

Bài học: [1. Tổng quan Microservices & Spring Cloud](../../spring-boot/08-microservices/1_tong-quan-spring-cloud.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Khi nào nên chuyển từ monolith sang microservices?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi có lý do cụ thể: nhiều team cần phát hành độc lập và đang cản trở nhau; các phần hệ thống có nhu cầu scale rất khác nhau; cần cô lập lỗi giữa các chức năng quan trọng; hoặc cần công nghệ khác cho một phần. Ngoài ra phải có năng lực vận hành (CI/CD, container, monitoring, tracing). Với dự án mới, team nhỏ, nên bắt đầu bằng modular monolith.

</details>

**2. Kể tên các vấn đề chính của hệ phân tán và công cụ Spring Cloud tương ứng.**

<details className="qa">
<summary>Xem đáp án</summary>

- Tìm dịch vụ: Eureka (hoặc Consul, Kubernetes).
- Cân bằng tải: Spring Cloud LoadBalancer.
- Điểm vào duy nhất, xác thực tập trung: Spring Cloud Gateway.
- Cấu hình tập trung: Spring Cloud Config.
- Gọi HTTP giữa dịch vụ: OpenFeign hoặc HTTP Interface.
- Chống lỗi lan truyền: Resilience4j qua Spring Cloud Circuit Breaker.
- Quan sát: Micrometer Tracing với Zipkin/OpenTelemetry.
- Giao tiếp bất đồng bộ: Spring Cloud Stream.

</details>

**3. Release train của Spring Cloud là gì? Vì sao cần BOM?**

<details className="qa">
<summary>Xem đáp án</summary>

Release train là một bộ phiên bản các dự án Spring Cloud đã được kiểm tra chạy cùng nhau, đặt tên theo năm (2023.0, 2024.0, 2025.0...). Mỗi train tương thích với một dải phiên bản Spring Boot. Import BOM `spring-cloud-dependencies` giúp các starter tự lấy đúng phiên bản, tránh lệch phiên bản giữa các module.

</details>

**4. "Distributed monolith" là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Là hệ thống được chia thành nhiều dịch vụ nhưng vẫn ràng buộc chặt: dùng chung database, phải deploy cùng lúc, gọi đồng bộ dây chuyền qua nhiều dịch vụ. Nó có mọi nhược điểm của hệ phân tán (độ trễ mạng, lỗi một phần, khó debug) mà không có ưu điểm (deploy và scale độc lập). Nguyên nhân thường là chia sai ranh giới nghiệp vụ.

</details>

**5. Những thành phần Netflix OSS nào đã bị thay thế và thay bằng gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Hystrix → Resilience4j (qua Spring Cloud Circuit Breaker); Ribbon → Spring Cloud LoadBalancer; Zuul 1 → Spring Cloud Gateway. Eureka vẫn được duy trì. Ngoài ra Spring Cloud Sleuth (không thuộc Netflix) đã được thay bằng Micrometer Tracing từ Spring Boot 3.

</details>

**6. Chạy trên Kubernetes thì còn cần Eureka và Config Server không?**

<details className="qa">
<summary>Xem đáp án</summary>

Thường là không. Kubernetes đã có Service (DNS nội bộ + load balancing) để tìm dịch vụ, ConfigMap/Secret để cấp cấu hình, và probe để kiểm tra sức khoẻ. Dựng thêm Eureka sẽ trùng lặp chức năng. Spring Cloud Kubernetes giúp đọc ConfigMap/Secret và discovery từ API Kubernetes nếu cần. Eureka/Config Server hữu ích khi chạy trên VM hoặc môi trường không có orchestrator.

</details>

**7. Làm sao xử lý transaction trải qua nhiều dịch vụ?**

<details className="qa">
<summary>Xem đáp án</summary>

Không dùng transaction phân tán 2PC (chậm, khoá lâu, phụ thuộc mọi bên). Thay vào đó dùng **Saga**: chuỗi transaction cục bộ, mỗi bước thành công thì phát sự kiện cho bước sau, bước nào thất bại thì chạy **compensating action** (hành động bù) để hoàn tác các bước trước. Kết hợp **outbox pattern** để đảm bảo ghi DB và phát sự kiện không bị lệch. Hệ thống chấp nhận eventual consistency.

</details>

---

## 2. Service Discovery với Eureka

Bài học: [2. Service Discovery với Eureka](../../spring-boot/08-microservices/2_eureka.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Service discovery giải quyết vấn đề gì? Client-side và server-side discovery khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Nó cho phép các dịch vụ tìm nhau bằng tên thay vì địa chỉ cứng, trong khi instance liên tục thay đổi. **Client-side discovery** (Eureka + LoadBalancer): client tự tra registry và chọn instance. **Server-side discovery** (Kubernetes Service, AWS ALB): client gọi một địa chỉ cố định, hạ tầng chọn instance giúp. Client-side linh hoạt hơn nhưng cần thư viện ở mọi client.

</details>

**2. Mô tả vòng đời đăng ký của một Eureka client.**

<details className="qa">
<summary>Xem đáp án</summary>

Khi khởi động, client gửi yêu cầu **register** kèm tên dịch vụ, host, port, metadata. Sau đó cứ 30 giây gửi **renew** (heartbeat). Đồng thời mỗi 30 giây tải phần thay đổi của registry về cache cục bộ. Khi tắt êm, client gửi **cancel** để huỷ đăng ký. Nếu chết đột ngột, server chờ hết lease (mặc định 90 giây) rồi mới gỡ trong lần dọn tiếp theo.

</details>

**3. Self-preservation mode của Eureka là gì? Vì sao không nên tắt ở production?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi tỉ lệ heartbeat nhận được giảm dưới ngưỡng (mặc định 85% kỳ vọng), Eureka giả định đó là sự cố mạng và ngừng xoá instance. Điều này tránh tình huống phân mảnh mạng khiến server xoá sạch danh bạ trong khi các instance vẫn chạy tốt. Tắt nó ở production có nguy cơ mất toàn bộ danh bạ khi mạng chập chờn. Đây là lựa chọn ưu tiên Availability trong CAP.

</details>

**4. `@LoadBalanced` làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Nó đánh dấu bean `RestTemplate`, `RestClient.Builder` hoặc `WebClient.Builder` để Spring Cloud gắn interceptor/filter của LoadBalancer. Khi gặp URL dạng `http://ten-dich-vu/...`, interceptor lấy danh sách instance của `ten-dich-vu` từ discovery, chọn một instance theo thuật toán (mặc định round-robin) và thay host/port thật vào URL.

</details>

**5. Vì sao instance đã chết vẫn có thể nhận request? Xử lý thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì thông tin lan truyền có độ trễ: server chờ hết lease mới xoá, client chỉ tải lại danh bạ định kỳ, cộng thêm cache của LoadBalancer. Cách xử lý: graceful shutdown để huỷ đăng ký chủ động; ở phía gọi dùng retry sang instance khác, timeout ngắn và circuit breaker; có thể bật health-check based instance supplier của LoadBalancer.

</details>

**6. Khi deploy lên Kubernetes có nên dùng Eureka không?**

<details className="qa">
<summary>Xem đáp án</summary>

Thường không nên. Kubernetes đã cung cấp DNS cho Service, cân bằng tải, readiness probe — đầy đủ và độc lập ngôn ngữ. Thêm Eureka tạo hai nguồn sự thật về trạng thái instance và thêm hạ tầng phải vận hành. Eureka phù hợp khi chạy trên VM, Docker Compose hoặc hệ thống trải trên nhiều môi trường không có orchestrator chung.

</details>

---

## 3. Spring Cloud Gateway

Bài học: [3. Spring Cloud Gateway](../../spring-boot/08-microservices/3_spring-cloud-gateway.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. API Gateway giải quyết những vấn đề gì? Có nhược điểm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Gateway cung cấp một điểm vào duy nhất, ẩn cấu trúc nội bộ, xử lý tập trung các việc chung: định tuyến, xác thực, rate limit, CORS, log, circuit breaker. Nhược điểm: thêm một bước mạng (độ trễ), có thể trở thành điểm lỗi đơn và nút cổ chai nếu không chạy nhiều instance, và dễ bị nhồi logic nghiệp vụ nếu không có kỷ luật.

</details>

**2. Giải thích route, predicate và filter trong Spring Cloud Gateway.**

<details className="qa">
<summary>Xem đáp án</summary>

**Route** là một quy tắc định tuyến gồm id, URI đích, danh sách predicate và filter. **Predicate** là điều kiện trên request (path, method, header, thời gian, trọng số...) — tất cả predicate phải đúng thì route mới khớp. **Filter** chỉnh sửa request trước khi chuyển tiếp và response trước khi trả về (thêm header, viết lại path, retry, rate limit, circuit breaker).

</details>

**3. `lb://` trong URI có nghĩa gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Đó là scheme báo Gateway dùng Spring Cloud LoadBalancer: phần sau `lb://` là tên dịch vụ, LoadBalancer tra danh sách instance từ discovery (Eureka, Consul, Kubernetes) và chọn một instance để chuyển tiếp request.

</details>

**4. `RequestRateLimiter` hoạt động thế nào? Vì sao cần Redis?**

<details className="qa">
<summary>Xem đáp án</summary>

Nó dùng thuật toán token bucket: mỗi khoá (IP, user) có một xô token được nạp với tốc độ `replenishRate`, tối đa `burstCapacity`; mỗi request tiêu `requestedTokens`. Hết token thì trả 429. Redis được dùng để lưu trạng thái xô dùng chung giữa nhiều instance Gateway (thao tác bằng Lua script nguyên tử); nếu lưu trong bộ nhớ từng instance thì giới hạn sẽ bị nhân lên theo số instance.

</details>

**5. Có nên chỉ xác thực ở Gateway rồi tin tưởng hoàn toàn các dịch vụ phía sau?**

<details className="qa">
<summary>Xem đáp án</summary>

Không nên. Gateway nên lo xác thực thô (token hợp lệ, chưa hết hạn), nhưng dịch vụ vẫn cần kiểm quyền trên dữ liệu cụ thể. Tốt nhất chuyển tiếp nguyên JWT để dịch vụ tự kiểm chữ ký (zero trust). Nếu truyền danh tính qua header tự đặt, phải đảm bảo mạng chỉ cho phép Gateway gọi vào dịch vụ và Gateway xoá header đó từ request gốc của client.

</details>

**6. Khác nhau giữa Gateway WebFlux và Gateway Server MVC? Chọn bản nào?**

<details className="qa">
<summary>Xem đáp án</summary>

WebFlux chạy trên Netty, non-blocking, là bản gốc với bộ filter đầy đủ nhất, phù hợp tải cao và kết nối dài; nhưng filter phải viết reactive và không được blocking. Server MVC chạy trên servlet/Tomcat, viết theo kiểu blocking quen thuộc, có thể kết hợp virtual threads; phù hợp đội quen Spring MVC hoặc cần gọi thư viện blocking. Chọn theo năng lực đội và yêu cầu tải.

</details>

**7. Vì sao không nên đặt logic nghiệp vụ vào Gateway?**

<details className="qa">
<summary>Xem đáp án</summary>

Gateway là thành phần dùng chung mọi dịch vụ; nhét logic nghiệp vụ vào sẽ biến nó thành một monolith mới, buộc mọi team phải phối hợp khi thay đổi, khó test và tăng rủi ro sập toàn hệ thống. Gateway chỉ nên làm việc cross-cutting. Nếu cần gộp dữ liệu cho từng loại client, dùng pattern **Backend for Frontend (BFF)** như một dịch vụ riêng.

</details>

---

## 4. Spring Cloud Config

Bài học: [4. Spring Cloud Config](../../spring-boot/08-microservices/4_cloud-config.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Spring Cloud Config giải quyết vấn đề gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Nó tập trung cấu hình của nhiều dịch vụ, nhiều môi trường vào một nơi (thường là Git), có version, audit, rollback; cho phép đổi cấu hình không cần build lại ứng dụng và làm mới nóng một số thuộc tính. Đồng thời tách cấu hình (và secret) ra khỏi mã nguồn theo nguyên tắc 12-factor app.

</details>

**2. Config Server gộp các file cấu hình theo thứ tự ưu tiên nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Với `order-service` profile `prod`: `order-service-prod.yml` cao nhất, rồi `order-service.yml`, rồi `application-prod.yml`, thấp nhất `application.yml`. Ngoài ra cấu hình từ Config Server mặc định ưu tiên cao hơn file cục bộ trong jar, nhưng thấp hơn biến môi trường và tham số dòng lệnh nếu cấu hình cho phép ghi đè (`spring.cloud.config.override-system-properties`).

</details>

**3. `spring.config.import` khác `bootstrap.yml` thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`bootstrap.yml` là cơ chế cũ: Spring Cloud tạo một bootstrap context riêng nạp trước để lấy cấu hình từ xa. Từ Boot 2.4, Spring Boot có cơ chế import cấu hình chuẩn — `spring.config.import=configserver:...` khai báo ngay trong `application.yml`, không cần context phụ. Bootstrap bị tắt mặc định từ Spring Cloud 2020.0 và chỉ bật lại bằng `spring-cloud-starter-bootstrap`.

</details>

**4. `@RefreshScope` hoạt động thế nào? Có giới hạn gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Bean có `@RefreshScope` được bọc bởi proxy; khi có sự kiện refresh (`/actuator/refresh` hoặc Bus), Spring huỷ instance đang cache, lần gọi tiếp theo tạo instance mới với cấu hình mới. Giới hạn: chỉ tác động lên bean trong scope này (và `@ConfigurationProperties` có setter); không phù hợp cho thay đổi hạ tầng như DataSource, port; bean có state sẽ mất state; và refresh chỉ áp dụng cho instance nhận lệnh nếu không dùng Bus.

</details>

**5. Làm sao làm mới cấu hình cho 20 instance cùng lúc?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng Spring Cloud Bus với Kafka hoặc RabbitMQ: gọi `POST /actuator/busrefresh` trên một instance, sự kiện được phát tới mọi instance đăng ký bus. Có thể tự động hoá bằng webhook Git gọi `/monitor` của Config Server (`spring-cloud-config-monitor`). Trên Kubernetes, có thể dùng Spring Cloud Kubernetes theo dõi ConfigMap, hoặc đơn giản là rolling restart.

</details>

**6. Bạn bảo vệ secret trong hệ thống dùng Spring Cloud Config thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Không commit secret dạng rõ. Lựa chọn: mã hoá giá trị bằng `{cipher}` với khoá cấp qua biến môi trường; dùng Vault backend để có phân quyền, audit và secret động; hoặc dùng secret manager của nền tảng. Bảo vệ Config Server bằng xác thực và mạng nội bộ, khoá các endpoint `/encrypt`, `/decrypt`, và không expose `/actuator/env` ra ngoài.

</details>

---

## 5. Spring Cloud OpenFeign

Bài học: [5. Spring Cloud OpenFeign](../../spring-boot/08-microservices/5_openfeign.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. OpenFeign hoạt động thế nào bên dưới?**

<details className="qa">
<summary>Xem đáp án</summary>

`@EnableFeignClients` quét các interface có `@FeignClient` và đăng ký một `FeignClientFactoryBean` cho mỗi interface. Bean này tạo **JDK dynamic proxy**; mỗi lời gọi method được chuyển thành `RequestTemplate` dựa vào annotation (path, query, header, body), đi qua các `RequestInterceptor`, encoder, rồi được gửi bởi HTTP client bên dưới. Nếu có LoadBalancer, tên dịch vụ được thay bằng instance cụ thể. Response được decoder chuyển thành kiểu trả về, hoặc `ErrorDecoder` chuyển thành exception.

</details>

**2. Vì sao phải cấu hình timeout cho Feign client?**

<details className="qa">
<summary>Xem đáp án</summary>

Mặc định read timeout là 60 giây. Khi dịch vụ đích chậm hoặc treo, mỗi lời gọi giữ một thread trong thời gian dài; với lưu lượng cao, thread pool của dịch vụ gọi cạn kiệt và nó cũng ngừng phản hồi — lỗi lan dây chuyền. Timeout ngắn hợp lý (vài giây) kết hợp circuit breaker giúp thất bại nhanh và bảo vệ dịch vụ gọi.

</details>

**3. `ErrorDecoder` dùng để làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Nó chuyển response lỗi (status không phải 2xx) thành exception phù hợp. Thay vì xử lý `FeignException` chung chung ở khắp nơi, ta map 404 thành `ProductNotFoundException`, 409 thành `OutOfStockException`, lỗi tạm thời thành `RetryableException`... giúp tầng nghiệp vụ xử lý rõ ràng và `@ControllerAdvice` trả lỗi đúng cho client.

</details>

**4. `fallback` và `fallbackFactory` khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai cung cấp cài đặt dự phòng khi gọi lỗi (cần bật circuit breaker cho Feign). `fallback` là một class implement interface, không biết nguyên nhân lỗi. `fallbackFactory` nhận `Throwable cause` để tạo fallback, nên có thể log nguyên nhân và xử lý khác nhau theo loại lỗi (timeout, 404, circuit đang mở).

</details>

**5. HTTP Interface (`@HttpExchange`) khác OpenFeign ra sao? Khi nào chọn cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

HTTP Interface là tính năng của Spring Framework 6, tạo client khai báo trên nền `RestClient`/`WebClient`, hỗ trợ cả blocking lẫn reactive, không cần Spring Cloud hay thư viện Feign. OpenFeign thuộc Spring Cloud, đã ổn định nhưng ở chế độ feature-complete. Dự án mới trên Boot 3.2+ nên ưu tiên HTTP Interface; dự án đang dùng Feign tốt thì không cần vội chuyển.

</details>

**6. Truyền JWT của người dùng sang dịch vụ khác qua Feign thế nào? Có bẫy gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Viết `RequestInterceptor` lấy token từ `SecurityContextHolder` và gắn header `Authorization`. Bẫy: `SecurityContextHolder` dùng ThreadLocal, nên nếu lời gọi Feign chạy trên luồng khác (async, thread pool của circuit breaker/bulkhead) thì context trống. Cần truyền context sang luồng mới (ví dụ `DelegatingSecurityContextExecutor`) hoặc dùng cơ chế cách ly không đổi luồng. Với gọi giữa dịch vụ không có người dùng, dùng client credentials thay vì token người dùng.

</details>

---

## 6. Circuit Breaker với Resilience4j

Bài học: [6. Circuit Breaker với Resilience4j](../../spring-boot/08-microservices/6_circuit-breaker.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Giải thích ba trạng thái của circuit breaker.**

<details className="qa">
<summary>Xem đáp án</summary>

**CLOSED**: cho lời gọi qua và ghi nhận kết quả vào sliding window. Khi đủ số lời gọi tối thiểu và tỉ lệ lỗi (hoặc gọi chậm) vượt ngưỡng → chuyển **OPEN**: mọi lời gọi bị từ chối ngay (`CallNotPermittedException`), trả fallback. Sau `waitDurationInOpenState` → **HALF_OPEN**: cho một số lời gọi thử; nếu tỉ lệ lỗi dưới ngưỡng thì về CLOSED, ngược lại quay lại OPEN.

</details>

**2. Circuit breaker giúp gì cho hệ thống? Khác retry ở điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Circuit breaker ngăn lỗi dây chuyền: thất bại nhanh thay vì chờ, giải phóng thread và cho dịch vụ đích thời gian hồi phục. Retry thì ngược lại — cố gắng gọi lại để vượt qua lỗi tạm thời. Retry phù hợp lỗi thoáng qua; circuit breaker phù hợp khi lỗi kéo dài. Hai cơ chế dùng kết hợp, với retry giới hạn và có backoff.

</details>

**3. Thứ tự mặc định khi kết hợp nhiều annotation Resilience4j là gì? Ảnh hưởng thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Ngoài vào trong: Retry → CircuitBreaker → RateLimiter → TimeLimiter → Bulkhead → method. Vì Retry bọc ngoài, mỗi lần thử lại đều đi qua circuit breaker và được tính vào thống kê lỗi; khi cầu dao mở, retry nhận `CallNotPermittedException` (nên cấu hình không retry exception này). Có thể đổi thứ tự bằng thuộc tính `*-aspect-order`.

</details>

**4. Khi nào không nên retry?**

<details className="qa">
<summary>Xem đáp án</summary>

Không retry lỗi vĩnh viễn (400, 401, 404, lỗi validate). Không retry thao tác không idempotent (tạo đơn, chuyển tiền) trừ khi có idempotency key. Tránh retry ở nhiều tầng cùng lúc gây retry storm. Luôn dùng số lần giới hạn, exponential backoff và jitter.

</details>

**5. Bulkhead là gì? Semaphore bulkhead khác thread pool bulkhead thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Bulkhead giới hạn số lời gọi đồng thời tới một phụ thuộc để nó không chiếm hết tài nguyên chung. Semaphore bulkhead đếm số lời gọi đang chạy trên chính thread gọi, nhẹ, phù hợp code đồng bộ. Thread pool bulkhead chạy lời gọi trong pool riêng, cách ly hoàn toàn, method phải trả `CompletableFuture`, tốn chi phí đổi luồng và cần chú ý truyền context (security, tracing).

</details>

**6. Viết fallback thế nào cho đúng?**

<details className="qa">
<summary>Xem đáp án</summary>

Về kỹ thuật: cùng kiểu trả về, cùng tham số với method gốc, thêm tham số exception cuối; nằm cùng class. Về nghiệp vụ: fallback phải an toàn — trả cache, giá trị rỗng, giảm chức năng, hoặc báo lỗi rõ ràng; không được giả lập kết quả thành công cho thao tác quan trọng như thanh toán. Ghi log/metrics trong fallback để biết hệ thống đang chạy chế độ suy giảm.

</details>

**7. Vì sao Hystrix bị thay bằng Resilience4j?**

<details className="qa">
<summary>Xem đáp án</summary>

Netflix ngừng phát triển Hystrix (chế độ bảo trì từ 2018), Spring Cloud loại bỏ nó từ 2020.0. Resilience4j nhẹ, chỉ phụ thuộc Vavr (bản 1.x) hoặc không phụ thuộc thêm (bản 2.x), thiết kế theo decorator hàm, chia module độc lập, hỗ trợ Java 17+, reactive, và tích hợp tốt với Micrometer/Actuator.

</details>

---

## 7. Distributed Tracing (Micrometer Tracing)

Bài học: [7. Distributed Tracing (Micrometer Tracing)](../../spring-boot/08-microservices/7_tracing.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Trace và span khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Trace là toàn bộ hành trình của một request qua hệ thống, xác định bởi `traceId`. Span là một bước công việc trong hành trình đó (một lời gọi HTTP, một câu truy vấn), có `spanId`, thời gian bắt đầu/kết thúc, tag và tham chiếu tới span cha. Các span cùng `traceId` tạo thành một cây thể hiện quan hệ gọi và thời gian từng bước.

</details>

**2. Ngữ cảnh trace được truyền giữa các dịch vụ như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Qua **propagation**: bên gọi chèn ngữ cảnh (traceId, spanId hiện tại, cờ sampling) vào header của request/message — mặc định header W3C `traceparent`, hoặc các header B3. Bên nhận đọc header, tạo span con có cùng traceId và cha là span của bên gọi. Trong một tiến trình, ngữ cảnh được giữ trong ThreadLocal (và MDC cho log), nên khi đổi luồng phải truyền ngữ cảnh thủ công hoặc dùng decorator.

</details>

**3. Vì sao Spring Cloud Sleuth bị thay bằng Micrometer Tracing?**

<details className="qa">
<summary>Xem đáp án</summary>

Sleuth chỉ hỗ trợ đến Spring Boot 2.x. Ở Boot 3, Spring chuyển sang Micrometer **Observation API**: thư viện chỉ cần instrument một lần, các handler sinh cả metrics và trace. Micrometer Tracing là lớp trừu tượng trên Brave hoặc OpenTelemetry, được Actuator tự cấu hình. Điều này loại bỏ trùng lặp giữa đo metrics và tracing, đồng thời đưa tracing vào lõi thay vì phụ thuộc Spring Cloud.

</details>

**4. Sampling là gì? Nên đặt bao nhiêu?**

<details className="qa">
<summary>Xem đáp án</summary>

Sampling quyết định trace nào được ghi và gửi đi, nhằm giảm chi phí. Spring Boot mặc định 10%. Dev/test nên đặt 100% để debug. Production thường 1–10% tuỳ lưu lượng; quyết định sampling được truyền cùng ngữ cảnh để cả chuỗi dịch vụ thống nhất. Để không bỏ sót trace lỗi/chậm, dùng tail-based sampling tại OpenTelemetry Collector.

</details>

**5. Vì sao trace bị "đứt" giữa hai dịch vụ? Cách khắc phục?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên nhân thường gặp: tạo HTTP client thủ công (`new RestTemplate()`, `RestClient.create()`) nên không có instrument; gọi trong luồng khác mà không truyền ngữ cảnh; messaging chưa bật observation; hai dịch vụ dùng chuẩn propagation khác nhau (W3C và B3); hoặc proxy/gateway trung gian xoá header. Khắc phục: inject builder do Boot cấu hình, dùng `ContextPropagatingTaskDecorator`, bật observation cho Kafka/RabbitMQ, cấu hình `management.tracing.propagation.type` thống nhất.

</details>

**6. Làm sao in traceId vào log và tận dụng nó?**

<details className="qa">
<summary>Xem đáp án</summary>

Micrometer Tracing đặt `traceId`, `spanId` vào MDC. Từ Boot 3.2, pattern log mặc định đã có phần correlation; bản cũ tự thêm `%X{traceId}` vào `logging.pattern.level`. Dùng log JSON để traceId thành field riêng, gom log tập trung (ELK, Loki) rồi tìm theo traceId. Có thể trả traceId trong response lỗi để khách hàng cung cấp khi báo lỗi, và liên kết từ log sang giao diện trace (Grafana Tempo/Zipkin).

</details>
