---
sidebar_position: 4
title: "4. Spring MVC"
---

# 4. Spring MVC

## 1. Servlet

Bài học: [1. Servlet](../../spring-boot/04-spring-mvc/1_servlet.md)

**1. Servlet là gì và servlet container làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Servlet là lớp Java hiện thực Servlet API để xử lý request HTTP và tạo response. Servlet container (Tomcat, Jetty, Undertow) hiện thực API đó: lắng nghe cổng, phân tích HTTP thành `HttpServletRequest`, cấp thread từ thread pool, chạy chuỗi filter và servlet, ghi response, quản lý vòng đời servlet và session.

</details>

**2. Mô tả vòng đời của một Servlet.**

<details className="qa">
<summary>Xem đáp án</summary>

Container nạp class và tạo **một instance**, gọi `init()` một lần. Với mỗi request, container gọi `service()` trên một thread riêng; `HttpServlet.service()` chuyển tới `doGet`/`doPost`... theo HTTP method. Khi ứng dụng tắt hoặc servlet bị gỡ, container gọi `destroy()` một lần.

</details>

**3. Servlet có thread-safe không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không tự động. Mặc định chỉ có một instance phục vụ đồng thời nhiều thread, nên field có thể bị tranh chấp. Cách đúng là không giữ state theo request trong field, chỉ dùng biến cục bộ; state dùng chung phải là bất biến hoặc dùng cấu trúc thread-safe. `SingleThreadModel` từng tồn tại nhưng đã bị deprecated rồi xoá.

</details>

**4. Filter khác Servlet và khác HandlerInterceptor thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Servlet tạo ra response cho request. Filter không phải đích đến mà chặn trước/sau servlet, có thể sửa request/response hoặc chặn hẳn bằng cách không gọi `chain.doFilter()`. `HandlerInterceptor` là khái niệm của Spring MVC, chạy **bên trong** `DispatcherServlet`, biết handler (controller method) nào sẽ xử lý, có các hook `preHandle`, `postHandle`, `afterCompletion`. Filter thì chạy ở tầng servlet, áp dụng cả cho request không đi vào Spring MVC.

</details>

**5. DispatcherServlet là gì? Tại sao Spring MVC chỉ cần một servlet?**

<details className="qa">
<summary>Xem đáp án</summary>

`DispatcherServlet` là servlet kế thừa `HttpServlet`, hiện thực mẫu Front Controller: nhận mọi request rồi nhờ `HandlerMapping` tìm controller, `HandlerAdapter` gọi controller, sau đó dùng `ViewResolver` hoặc `HttpMessageConverter` để tạo response. Một điểm vào duy nhất giúp gom xử lý chung (binding, validation, xử lý lỗi, chuyển đổi định dạng) thay vì lặp lại ở từng servlet.

</details>

**6. OncePerRequestFilter dùng để làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Một request có thể đi qua chuỗi filter nhiều lần do dispatch nội bộ (forward, error dispatch, async dispatch). `OncePerRequestFilter` đánh dấu attribute trên request để đảm bảo `doFilterInternal` chỉ chạy một lần cho mỗi request, tránh log trùng hoặc xác thực lặp.

</details>

**7. Vì sao lên Spring Boot 3 phải đổi javax sang jakarta?**

<details className="qa">
<summary>Xem đáp án</summary>

Spring Boot 3 dựa trên Spring Framework 6, yêu cầu Jakarta EE 9+ (Servlet 6.0 với Boot 3). Từ Jakarta EE 9 các package đổi namespace từ `javax.*` sang `jakarta.*` vì lý do thương hiệu khi Java EE chuyển sang Eclipse Foundation. Vì vậy mọi import servlet, persistence, validation phải đổi, và thư viện cũ dùng `javax.servlet` phải nâng cấp.

</details>

---

## 2. Kiến trúc Spring MVC

Bài học: [2. Kiến trúc Spring MVC](../../spring-boot/04-spring-mvc/2_kien-truc-mvc.md)

**1. Mô tả luồng xử lý một request trong Spring MVC.**

<details className="qa">
<summary>Xem đáp án</summary>

Request đi qua filter chain tới `DispatcherServlet`. Nó hỏi các `HandlerMapping` để lấy `HandlerExecutionChain` (handler + interceptor), chọn `HandlerAdapter` phù hợp, chạy `preHandle` của interceptor, rồi adapter gọi controller method (dùng argument resolver để binding tham số). Nếu trả về tên view, `ViewResolver` tìm `View` và render với model. Nếu là `@ResponseBody`, `HttpMessageConverter` ghi thẳng object vào body. Sau đó chạy `postHandle`/`afterCompletion`. Exception được chuyển cho `HandlerExceptionResolver`.

</details>

**2. HandlerMapping và HandlerAdapter khác nhau thế nào? Sao không gộp làm một?**

<details className="qa">
<summary>Xem đáp án</summary>

`HandlerMapping` trả lời "ai xử lý request này", `HandlerAdapter` trả lời "gọi handler đó như thế nào". Tách ra giúp `DispatcherServlet` hỗ trợ nhiều kiểu handler khác nhau (method `@RequestMapping`, lớp implement `Controller` interface cũ, `HttpRequestHandler`, functional endpoint `RouterFunction`) mà không cần biết chi tiết từng kiểu — đây là mẫu Adapter.

</details>

**3. @RestController khác @Controller thế nào trong luồng xử lý?**

<details className="qa">
<summary>Xem đáp án</summary>

`@RestController` = `@Controller` + `@ResponseBody`. Với `@ResponseBody`, giá trị trả về được `RequestResponseBodyMethodProcessor` ghi vào body qua `HttpMessageConverter` ngay trong adapter, không qua `ViewResolver`. Với `@Controller` thường, chuỗi trả về được hiểu là tên view.

</details>

**4. Khi nào gặp lỗi 415 và 406?**

<details className="qa">
<summary>Xem đáp án</summary>

415 Unsupported Media Type: client gửi body với `Content-Type` mà không `HttpMessageConverter` nào đọc được thành kiểu tham số, hoặc không khớp `consumes`. 406 Not Acceptable: header `Accept` yêu cầu định dạng mà không converter nào ghi được giá trị trả về, hoặc không khớp `produces`.

</details>

**5. Filter và HandlerInterceptor nằm ở đâu trong luồng?**

<details className="qa">
<summary>Xem đáp án</summary>

Filter thuộc Servlet API, chạy trước khi request tới `DispatcherServlet`. Interceptor chạy bên trong `DispatcherServlet`, sau khi `HandlerMapping` đã xác định handler, nên biết controller method nào sẽ chạy và có `postHandle` để sửa `ModelAndView`.

</details>

**6. Tại sao không nên dùng @EnableWebMvc trong Spring Boot?**

<details className="qa">
<summary>Xem đáp án</summary>

`@EnableWebMvc` import `DelegatingWebMvcConfiguration` (một `WebMvcConfigurationSupport`), và `WebMvcAutoConfiguration` có điều kiện chỉ chạy khi không có bean loại này. Thêm annotation đó tức là tắt toàn bộ cấu hình mặc định của Boot. Muốn tuỳ biến thêm, implement `WebMvcConfigurer`.

</details>

**7. Exception ném ra từ controller được xử lý ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

`DispatcherServlet` duyệt các `HandlerExceptionResolver`: trước hết là `ExceptionHandlerExceptionResolver` (tìm `@ExceptionHandler` trong controller rồi trong `@ControllerAdvice`), sau đó `ResponseStatusExceptionResolver`, rồi `DefaultHandlerExceptionResolver`. Nếu không resolver nào xử lý, exception đi lên container và Spring Boot chuyển tới endpoint `/error`.

</details>

---

## 3. Các thành phần Spring MVC

Bài học: [3. Các thành phần Spring MVC](../../spring-boot/04-spring-mvc/3_components.md)

**1. @RequestParam và @PathVariable khác nhau thế nào? Khi nào dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`@PathVariable` lấy giá trị từ một đoạn của đường dẫn (`/products/42`), thường dùng để định danh tài nguyên. `@RequestParam` lấy từ query string hoặc form (`?page=2&sort=price`), thường dùng cho lọc, phân trang, sắp xếp, tham số tuỳ chọn. `@RequestParam` hỗ trợ `required` và `defaultValue`.

</details>

**2. Vì sao không nên trả entity JPA trực tiếp từ controller?**

<details className="qa">
<summary>Xem đáp án</summary>

Lộ field nhạy cảm (mật khẩu, field nội bộ), gắn chặt API với schema database, dễ gặp `LazyInitializationException` hoặc vòng lặp vô hạn khi Jackson serialize quan hệ hai chiều, và có thể kích hoạt truy vấn N+1 ngầm. DTO (record) cho phép định nghĩa hợp đồng API rõ ràng và ổn định.

</details>

**3. @ControllerAdvice hoạt động thế nào? Thứ tự chọn @ExceptionHandler?**

<details className="qa">
<summary>Xem đáp án</summary>

`@ControllerAdvice` là bean chứa các `@ExceptionHandler`, `@InitBinder`, `@ModelAttribute` dùng chung. Khi controller ném exception, `ExceptionHandlerExceptionResolver` tìm handler trong chính controller trước, rồi mới tới các advice (theo `@Order`). Trong cùng một nơi, handler khớp với kiểu exception gần nhất (cụ thể nhất) được chọn. Có thể giới hạn phạm vi bằng `basePackages` hoặc `assignableTypes`.

</details>

**4. ProblemDetail là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Là lớp của Spring Framework 6 hiện thực định dạng lỗi chuẩn RFC 9457 (trước là RFC 7807) với các field `type`, `title`, `status`, `detail`, `instance` và thuộc tính mở rộng qua `setProperty`. Có thể trả trực tiếp từ `@ExceptionHandler`, dùng `ErrorResponseException` hoặc kế thừa `ResponseEntityExceptionHandler`. Response có content type `application/problem+json`.

</details>

**5. Điều gì xảy ra nếu quên @Valid trên @RequestBody?**

<details className="qa">
<summary>Xem đáp án</summary>

Các annotation ràng buộc trên DTO bị bỏ qua, request không hợp lệ vẫn đi vào service. Có `@Valid` thì vi phạm ném `MethodArgumentNotValidException`, mặc định trả 400; kết hợp advice để trả chi tiết lỗi từng field.

</details>

**6. HandlerInterceptor khác Filter ra sao, chọn cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Filter thuộc Servlet API, chạy trước `DispatcherServlet`, áp dụng cho mọi request, phù hợp cho bảo mật, CORS, nén, log toàn cục. Interceptor thuộc Spring MVC, biết handler nào sẽ được gọi, có `postHandle` để sửa model, phù hợp cho logic gắn với controller (kiểm tra phiên bản API, đo thời gian theo handler).

</details>

**7. CORS là gì và preflight request là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

CORS là cơ chế của trình duyệt cho phép server khai báo origin nào được gọi API của nó từ JavaScript. Với request không "đơn giản" (method PUT/DELETE, header tuỳ biến, `Content-Type: application/json`), trình duyệt gửi trước `OPTIONS` (preflight) hỏi server; server trả `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`... thì request thật mới được gửi.

</details>

**8. POST tạo tài nguyên nên trả status gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`201 Created`, kèm header `Location` trỏ tới URL của tài nguyên mới và thường kèm body là tài nguyên đã tạo. Trong Spring: `ResponseEntity.created(uri).body(dto)`.

</details>

---

## 4. View: JSP và Thymeleaf

Bài học: [4. View: JSP và Thymeleaf](../../spring-boot/04-spring-mvc/4_jsp-thymeleaf.md)

**1. JSP được xử lý như thế nào khi chạy?**

<details className="qa">
<summary>Xem đáp án</summary>

Lần đầu được gọi (hoặc khi file thay đổi), container dịch file JSP thành mã nguồn một servlet, biên dịch thành class rồi nạp và chạy như servlet bình thường. Các request sau dùng lại servlet đã biên dịch. Vì vậy JSP thực chất là một servlet viết theo dạng template.

</details>

**2. Vì sao Spring Boot không khuyến khích JSP?**

<details className="qa">
<summary>Xem đáp án</summary>

Với server nhúng, JSP chỉ chạy khi đóng gói war, không chạy với jar thực thi; Undertow không hỗ trợ JSP; cần thêm Jasper và JSTL; không phải natural template; dễ trộn logic Java vào view qua scriptlet. Spring Boot khuyên dùng Thymeleaf, FreeMarker hoặc Mustache.

</details>

**3. Natural template trong Thymeleaf nghĩa là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Template là file HTML hợp lệ: các thuộc tính `th:*` bị trình duyệt bỏ qua, nội dung tĩnh bên trong thẻ đóng vai trò dữ liệu mẫu. Designer có thể mở trực tiếp file để xem giao diện, còn khi render qua Thymeleaf thì nội dung mẫu được thay bằng dữ liệu thật.

</details>

**4. th:text và th:utext khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`th:text` escape ký tự đặc biệt HTML (dấu nhỏ hơn, lớn hơn, nháy, ampersand) nên an toàn với dữ liệu người dùng. `th:utext` (unescaped) chèn nguyên văn, cho phép HTML chạy — chỉ dùng với nội dung tin cậy, nếu không sẽ gây XSS.

</details>

**5. Model, ModelMap, ModelAndView khác nhau ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

`Model` là interface chứa attribute cho view, khai báo làm tham số method. `ModelMap` là hiện thực dạng `LinkedHashMap` với API tương tự. `ModelAndView` gói cả model lẫn tên view vào một object để trả về. Cách hiện đại phổ biến: nhận `Model` làm tham số và trả về chuỗi tên view.

</details>

**6. Mẫu Post/Redirect/Get là gì và vì sao cần?**

<details className="qa">
<summary>Xem đáp án</summary>

Sau khi xử lý POST thành công, server trả redirect (302/303) tới một URL GET thay vì render trang trực tiếp. Trình duyệt khi đó nằm ở trang GET, nên nhấn F5 không gửi lại form, tránh tạo bản ghi trùng. Dữ liệu cần hiển thị một lần (thông báo thành công) truyền qua flash attribute.

</details>
