---
sidebar_position: 10
title: "10. Web Frameworks"
---

# 10. Web Frameworks

## 1. Tổng quan Web Frameworks

Bài học: [1. Tổng quan Web Frameworks](../../java/10-web-frameworks/1_tong-quan-web-frameworks.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Web framework mang lại lợi ích gì so với viết server bằng Java thuần (không dùng framework)? Nêu ít nhất 3 việc framework làm sẵn cho bạn.**

<details className="qa">
<summary>Xem đáp án</summary>

Framework giúp lập trình viên không phải tự làm lại các việc nền tảng lặp đi lặp lại ở mọi ứng dụng web, ví dụ:

- **Lắng nghe kết nối mạng**: tự mở socket, quản lý luồng (thread) xử lý nhiều request cùng lúc.
- **Phân tích HTTP thô**: tách method, URL, header từ luồng byte theo đúng chuẩn giao thức.
- **Định tuyến (routing)**: ánh xạ URL + method tới đúng đoạn code xử lý (`GET /users` gọi hàm nào).
- **Chuyển đổi dữ liệu (serialization)**: tự động chuyển JSON thành object Java và ngược lại.
- **Xử lý lỗi, validate, bảo mật cơ bản**: nhiều framework có sẵn cơ chế bắt lỗi tập trung, xác thực request.

Nhờ vậy lập trình viên chỉ cần tập trung vào **business logic** (logic nghiệp vụ) riêng của ứng dụng.

</details>

**2. Phân biệt các HTTP method `GET`, `POST`, `PUT`, `PATCH`, `DELETE`. Method nào nên là idempotent (gọi nhiều lần cho cùng kết quả) và tại sao điều này quan trọng?**

<details className="qa">
<summary>Xem đáp án</summary>

| Method | Mục đích | Idempotent? |
|--------|----------|-------------|
| `GET` | Đọc dữ liệu, không thay đổi gì | Có |
| `POST` | Tạo mới một resource | Không |
| `PUT` | Cập nhật/thay thế toàn bộ resource | Có |
| `PATCH` | Cập nhật một phần resource | Thường không (tùy cách hiện thực) |
| `DELETE` | Xóa resource | Có |

- **Idempotent** (bất biến khi lặp lại) nghĩa là gọi cùng một request nhiều lần cho **kết quả cuối cùng giống hệt** như gọi một lần. Ví dụ `DELETE /users/5` gọi 1 lần hay 10 lần thì user 5 vẫn chỉ ở trạng thái "đã xóa" — không lỗi, không xóa "thêm".
- Ngược lại, `POST /users` gọi 2 lần sẽ tạo ra **2 user khác nhau** — không idempotent.
- Điều này quan trọng vì mạng có thể bị mất gói tin, client (hoặc load balancer) có thể **tự động gửi lại request** khi nghi ngờ timeout. Nếu method đó idempotent, việc gửi lại là an toàn; nếu không (như `POST`), gửi lại có thể tạo dữ liệu trùng lặp ngoài ý muốn.

</details>

**3. REST API là gì? Thiết kế endpoint sau đây có tuân theo chuẩn REST không: `GET /getUserById?id=5`? Nếu không, hãy sửa lại cho đúng.**

<details className="qa">
<summary>Xem đáp án</summary>

**REST** (REpresentational State Transfer) là quy ước thiết kế API theo hướng **resource** (tài nguyên): mỗi "thứ" trong hệ thống có một đường dẫn cố định (danh từ số nhiều), còn **hành động** thể hiện qua HTTP method chứ không phải nhét vào tên đường dẫn.

`GET /getUserById?id=5` **không đúng chuẩn REST** vì:

- Tên đường dẫn chứa động từ `getUserById` — REST đã dùng `GET` để nói "lấy dữ liệu" rồi, không cần lặp lại ý đó trong URL.
- `id` truyền qua query string trong khi đây là định danh của một resource cụ thể, nên đưa vào path.

Sửa lại theo chuẩn REST:

```
GET /users/5
```

Đường dẫn `/users` đại diện cho tập hợp user, còn `/5` xác định đúng một user cụ thể trong tập đó.

</details>

**4. Sự khác nhau giữa status code `401 Unauthorized` và `403 Forbidden` là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai đều liên quan tới việc từ chối truy cập, nhưng khác nhau ở **nguyên nhân**:

- **`401 Unauthorized`** (chưa xác thực — authentication): server **không biết bạn là ai**, vì request thiếu thông tin đăng nhập (token/credential) hoặc thông tin đó sai/hết hạn. Cách xử lý: đăng nhập lại để lấy token hợp lệ.
- **`403 Forbidden`** (bị cấm — authorization): server **biết chính xác bạn là ai** (đã xác thực thành công), nhưng tài khoản đó **không có quyền** thực hiện hành động này. Đăng nhập lại cũng không giải quyết được, vì vấn đề là phân quyền chứ không phải danh tính.

Ví dụ dễ nhớ: `401` giống như bảo vệ chặn ở cổng vì bạn chưa xuất trình thẻ; `403` giống như bạn đã xuất trình thẻ nhân viên hợp lệ, nhưng thẻ đó không được vào phòng máy chủ.

</details>

**5. Điền status code phù hợp cho từng tình huống sau: (a) tạo user thành công, (b) client gửi JSON sai định dạng, (c) gọi tới một đường dẫn không tồn tại, (d) server bị lỗi ngoại lệ chưa xử lý.**

<details className="qa">
<summary>Xem đáp án</summary>

| Tình huống | Status code |
|---|---|
| (a) Tạo user thành công | `201 Created` |
| (b) Client gửi JSON sai định dạng | `400 Bad Request` |
| (c) Đường dẫn không tồn tại | `404 Not Found` |
| (d) Server bị lỗi ngoại lệ chưa xử lý | `500 Internal Server Error` |

Lưu ý phân biệt nhóm mã: `2xx` là thành công, `4xx` là **lỗi do phía client** (dữ liệu/gọi sai), `5xx` là **lỗi do phía server**. Trả sai nhóm mã (ví dụ trả `200` kèm thông báo lỗi trong body) khiến client khó xử lý tự động và là lỗi thiết kế API phổ biến.

</details>

**6. Đoạn thiết kế API sau có vấn đề gì về mặt REST? Hãy chỉ ra và sửa lại.**

```
POST /deleteUser/5
GET  /updateUserName?id=5&name=An
```

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai đều sai quy ước REST vì **hành động bị nhét vào URL thay vì dùng đúng HTTP method**:

- `POST /deleteUser/5`: dùng `POST` để xóa, trong khi REST đã có `DELETE` dành riêng cho việc này.
- `GET /updateUserName?...`: `GET` chỉ nên dùng để **đọc** dữ liệu, không được dùng để **sửa** dữ liệu — đây còn là lỗi nghiêm trọng hơn vì trình duyệt, proxy hay công cụ crawl có thể tự động gọi `GET` (ví dụ để cache trước), vô tình gây thay đổi dữ liệu ngoài ý muốn.

Sửa lại theo chuẩn REST:

```
DELETE /users/5
PATCH  /users/5   (body: {"name": "An"})
```

</details>

**7. So sánh Spring Boot, Quarkus, Javalin, Play theo tiêu chí: mức độ phổ biến, tốc độ khởi động, độ phức tạp cấu hình, use case phù hợp.**

<details className="qa">
<summary>Xem đáp án</summary>

| | Spring Boot | Quarkus | Javalin | Play |
|---|---|---|---|---|
| Phổ biến | Rất cao, gần như mặc định ở doanh nghiệp | Đang tăng, mạnh ở microservice | Thấp hơn, dùng cho project nhỏ/học tập | Trung bình, phổ biến hơn ở hệ sinh thái Scala |
| Tốc độ khởi động | Chậm hơn (nhiều auto-configuration) | Rất nhanh, tối ưu cho container/serverless | Rất nhanh, ít lớp trung gian | Trung bình, có kiến trúc reactive riêng |
| Độ phức tạp cấu hình | Cao — nhiều annotation, nhiều lớp trừu tượng | Trung bình — vẫn theo phong cách Spring/Jakarta nhưng nhẹ hơn | Thấp — API tối giản, ít "phép màu" ẩn | Cao — có convention và tooling riêng |
| Use case phù hợp | Đa số dự án doanh nghiệp, hệ thống lớn | Microservice chạy trên Kubernetes/cloud, cần khởi động nhanh | App nhỏ, prototype, dạy/học framework | Ứng dụng cần xử lý đồng thời lớn, real-time |

Trong thực tế, phần lớn tin tuyển dụng Java backend yêu cầu Spring Boot, nên đây thường là framework nên đầu tư học sâu nhất.

</details>

**8. Bạn được giao thiết kế REST API cho một hệ thống quản lý đơn hàng (order) có quan hệ với người dùng (user) và sản phẩm (product). Hãy đề xuất các endpoint chính theo chuẩn REST, bao gồm cả trường hợp lấy danh sách đơn hàng của một user cụ thể.**

<details className="qa">
<summary>Xem đáp án</summary>

Áp dụng nguyên tắc "resource là danh từ số nhiều, hành động thể hiện qua method":

```
GET    /orders            -> Lấy danh sách tất cả đơn hàng
GET    /orders/10         -> Lấy chi tiết đơn hàng id = 10
POST   /orders            -> Tạo đơn hàng mới
PUT    /orders/10         -> Cập nhật toàn bộ đơn hàng id = 10
PATCH  /orders/10         -> Cập nhật một phần (vd: đổi trạng thái)
DELETE /orders/10         -> Hủy/xóa đơn hàng id = 10

GET    /users/5/orders    -> Lấy danh sách đơn hàng của user id = 5
```

- Endpoint `GET /users/5/orders` thể hiện quan hệ **user sở hữu nhiều order** bằng cách lồng resource con dưới resource cha — đây là quy ước REST phổ biến cho quan hệ 1-nhiều.
- Với sản phẩm trong đơn hàng (order có nhiều product), thường không lồng path sâu thêm mà thể hiện qua **body** khi tạo/sửa đơn hàng, ví dụ `POST /orders` với body chứa danh sách `productId` và số lượng — tránh path bị lồng quá 2 cấp gây khó bảo trì (`/users/5/orders/10/products/3` là ví dụ nên tránh).

</details>

---

## 2. Spring & Spring Boot (⭐ phổ biến nhất)

Bài học: [2. Spring & Spring Boot (⭐ phổ biến nhất)](../../java/10-web-frameworks/2_spring-boot.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Auto-configuration của Spring Boot hoạt động theo cơ chế nào? Cho ví dụ cụ thể khi thêm `spring-boot-starter-web` vào dự án.**

<details className="qa">
<summary>Xem đáp án</summary>

Auto-configuration dựa trên nguyên tắc **"nhìn vào classpath (các thư viện đang có mặt) để tự đoán cấu hình hợp lý"**, thực hiện qua các class được đánh dấu `@Conditional...` (ví dụ `@ConditionalOnClass`, `@ConditionalOnMissingBean`) — chỉ kích hoạt một cấu hình nếu điều kiện tương ứng đúng.

Ví dụ với `spring-boot-starter-web`:

- Spring Boot phát hiện có thư viện Tomcat nhúng trên classpath → tự tạo và khởi động một `TomcatServletWebServerFactory`, mở cổng `8080` mặc định.
- Phát hiện có Spring MVC → tự đăng ký `DispatcherServlet` (bộ điều phối request trung tâm), cấu hình sẵn bộ chuyển đổi JSON (Jackson) để tự động serialize/deserialize.
- Nếu bạn tự khai báo bean của riêng mình (ví dụ tự định nghĩa `ObjectMapper`), Spring Boot sẽ **ưu tiên bean của bạn** thay vì bean tự động (nhờ `@ConditionalOnMissingBean`) — đây chính là ý nghĩa "quy ước hơn cấu hình": tự làm sẵn nhưng vẫn cho ghi đè khi cần.

</details>

**2. Spring Boot khác gì so với Spring Framework thuần? Có phải Spring Boot là một framework hoàn toàn khác thay thế Spring không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không, **Spring Boot không thay thế Spring** — nó là một lớp tiện ích được xây **trên nền Spring Framework**, giúp khởi động ứng dụng Spring nhanh hơn.

| | Spring Framework (thuần) | Spring Boot |
|---|---|---|
| Cấu hình | Thủ công, thường bằng XML hoặc nhiều class `@Configuration` | Tự động (auto-configuration), chỉ ghi đè khi cần |
| Quản lý thư viện | Tự chọn version từng thư viện, dễ xung đột | Dùng `starter`, version đã được chọn tương thích sẵn |
| Server | Phải cài và deploy lên server ngoài (Tomcat riêng, đóng gói `.war`) | Server nhúng (embedded), chạy trực tiếp bằng `java -jar` |
| Mục tiêu | Cung cấp bộ khung linh hoạt, đầy đủ tính năng | Giảm thời gian cấu hình, giúp khởi động dự án nhanh |

Nói ngắn gọn: Spring Boot = Spring Framework + auto-configuration + starter + embedded server, giúp bạn dùng được sức mạnh của Spring mà không phải cấu hình thủ công nặng nề.

</details>

**3. `@RestController` khác `@Controller` ở điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`@Controller`**: đánh dấu class xử lý request theo mô hình MVC truyền thống — giá trị trả về từ hàm xử lý thường là **tên view** (ví dụ tên file HTML/Thymeleaf) để Spring render ra trang web.
- **`@RestController`**: là sự kết hợp của `@Controller` + `@ResponseBody` — giá trị trả về được **serialize thẳng thành JSON (hoặc text)** gửi về client, không tìm view nào cả. Đây là annotation dùng cho hầu hết REST API hiện đại.

```java
@Controller
public class PageController {
    @GetMapping("/home")
    public String home() {
        return "home"; // Spring tìm file view tên "home" (vd home.html) để render
    }
}

@RestController
public class ApiController {
    @GetMapping("/api/home")
    public String home() {
        return "home"; // Trả thẳng chuỗi "home" làm response body, KHÔNG tìm view
    }
}
```

Nếu dùng `@Controller` mà muốn một hàm cụ thể trả JSON, phải thêm `@ResponseBody` riêng cho hàm đó.

</details>

**4. Phân biệt `@PathVariable`, `@RequestParam` và `@RequestBody`. Viết một endpoint dùng cả ba trong cùng một hàm.**

<details className="qa">
<summary>Xem đáp án</summary>

| Annotation | Lấy dữ liệu từ đâu | Ví dụ URL/body |
|---|---|---|
| `@PathVariable` | Một đoạn trong đường dẫn URL | `/orders/10` → `id = 10` |
| `@RequestParam` | Tham số sau dấu `?` | `/orders?status=paid` → `status = "paid"` |
| `@RequestBody` | Dữ liệu JSON trong phần thân request | body: `{"note": "giao giờ hành chính"}` |

```java
// PUT /orders/10?status=paid   body: {"note": "giao giờ hành chính"}
@PutMapping("/orders/{id}")
public String updateOrder(
        @PathVariable int id,
        @RequestParam String status,
        @RequestBody OrderUpdateRequest body) {
    return "Cập nhật đơn " + id + " sang " + status + ", ghi chú: " + body.note();
}
```

</details>

**5. Spring hỗ trợ mấy cách Dependency Injection? Vì sao constructor injection được khuyến nghị hơn field injection (`@Autowired` trên field)?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba cách: **constructor injection** (qua hàm khởi tạo), **setter injection** (qua hàm `set...`), và **field injection** (`@Autowired` gắn thẳng lên field).

Constructor injection được khuyến nghị vì:

- **Cho phép field là `final`** — dependency chắc chắn được gán ngay khi tạo object, không thể quên gán hay bị thay đổi sau đó (đúng tinh thần immutability).
- **Dễ viết unit test hơn**: có thể `new UserController(fakeService)` trực tiếp trong test mà không cần khởi động Spring context, trong khi field injection bắt buộc phải dùng cơ chế reflection hoặc chạy Spring để inject.
- **Phát hiện circular dependency (phụ thuộc vòng) sớm**: nếu hai bean phụ thuộc vòng qua constructor, Spring báo lỗi ngay lúc khởi động thay vì có thể "chữa cháy" ngầm như field injection.
- **Tường minh**: nhìn vào constructor là biết ngay class cần những dependency nào, không phải lướt qua toàn bộ class tìm field có `@Autowired`.

</details>

**6. Đoạn code sau có vấn đề gì? Hãy chỉ ra và sửa lại theo hướng khuyến nghị.**

```java
@RestController
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/users/{id}")
    public String getUser(@PathVariable int id) {
        return userService.findUserName(id);
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

Vấn đề: dùng **field injection** (`@Autowired` trực tiếp trên field) thay vì constructor injection. Hệ quả:

- `userService` không thể là `final` → có nguy cơ bị gán lại (dù hiếm khi cố ý) hoặc bị bỏ quên chưa gán nếu object được tạo bằng cách khác ngoài Spring.
- Khó viết unit test: muốn test `UserController` độc lập, không thể truyền `UserService` giả vào qua constructor thông thường.

Sửa lại bằng constructor injection:

```java
@RestController
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users/{id}")
    public String getUser(@PathVariable int id) {
        return userService.findUserName(id);
    }
}
```

</details>

**7. `@Component`, `@Service`, `@Repository`, `@Controller` đều là các "stereotype annotation" (annotation đánh dấu vai trò) và về bản chất Spring xử lý chúng giống nhau khi quét bean. Vậy vì sao vẫn cần dùng annotation riêng biệt thay vì dùng chung `@Component`?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Về mặt kỹ thuật**: `@Service`, `@Repository`, `@Controller` đều được đánh dấu **`@Component` bên trong** (gọi là meta-annotation), nên Spring vẫn nhận diện và tạo bean bình thường dù bạn dùng annotation nào.
- **Về mặt ý nghĩa (semantic)**: dùng đúng annotation giúp code **tự mô tả vai trò** — người đọc (và cả IDE) biết ngay class này thuộc tầng nào (nghiệp vụ, dữ liệu, hay tiếp nhận request) mà không cần đọc code bên trong.
- **`@Repository` có thêm hành vi đặc biệt**: Spring tự động bật cơ chế **exception translation** — chuyển các exception đặc thù của công nghệ lưu trữ (ví dụ `SQLException` của JDBC) thành các exception thống nhất của Spring (`DataAccessException`), giúp tầng Service không cần biết đang dùng công nghệ database cụ thể nào bên dưới.

Kết luận: dùng đúng annotation theo tầng vừa để code rõ ràng, vừa tận dụng được hành vi đặc biệt Spring cung cấp riêng cho từng vai trò.

</details>

**8. Spring bean mặc định có scope (phạm vi) gì? Điều này ảnh hưởng thế nào nếu một `@Service` có field có thể thay đổi (mutable field)?**

<details className="qa">
<summary>Xem đáp án</summary>

Mặc định, mọi Spring bean có scope **`singleton`** — Spring chỉ tạo **một instance duy nhất** cho cả ứng dụng, và instance đó được **chia sẻ (dùng chung)** cho mọi nơi cần tiêm nó vào.

Hệ quả nếu bean có field mutable (thay đổi được):

```java
@Service
public class CounterService {
    private int count = 0; // NGUY HIỂM: field mutable trong singleton bean

    public void increment() {
        count++;
    }
}
```

- Vì chỉ có một instance dùng chung cho **mọi request, mọi luồng (thread)**, nếu nhiều request gọi `increment()` đồng thời, sẽ xảy ra **race condition** (tranh chấp dữ liệu) — kết quả đếm sai lệch.
- Nguyên tắc an toàn: các bean singleton (Controller, Service, Repository...) nên **không giữ trạng thái thay đổi được ở field**; dữ liệu thay đổi theo từng request nên là **biến cục bộ (local variable)** trong hàm, hoặc lưu ở nơi khác (database, cache) chứ không phải field của bean.

</details>

**9. Đoạn code sau in ra gì? Giải thích dựa trên scope mặc định của Spring bean.**

```java
@Service
public class UserService { }

@RestController
public class DebugController {
    private final UserService a;
    private final UserService b;

    public DebugController(UserService a, UserService b) {
        this.a = a;
        this.b = b;
    }

    @GetMapping("/debug")
    public String debug() {
        return String.valueOf(a == b);
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

In ra **`true`**.

- `a` và `b` đều được Spring tiêm cùng một kiểu bean `UserService`. Vì scope mặc định là **singleton**, Spring chỉ tạo **đúng một instance** `UserService` trong toàn bộ ứng dụng và tiêm **cùng một tham chiếu (reference)** đó vào mọi nơi cần dùng.
- Do đó `a` và `b` cùng trỏ tới một object trên bộ nhớ, nên `a == b` (so sánh địa chỉ) trả về `true`.
- Nếu muốn mỗi lần tiêm là một instance mới, phải khai báo `@Scope("prototype")` trên bean đó — khi ấy Spring sẽ tạo instance mới mỗi lần bean được yêu cầu.

</details>

**10. Ứng dụng báo lỗi "Port 8080 was already in use" khi khởi động. Nêu cách khắc phục, và cách cấu hình để chạy các cổng/cấu hình khác nhau giữa môi trường phát triển (dev) và môi trường thật (production).**

<details className="qa">
<summary>Xem đáp án</summary>

Khắc phục nhanh: đổi cổng khác trong `application.properties` (`server.port=9090`) hoặc tắt tiến trình đang chiếm cổng `8080`.

Về lâu dài, dùng cơ chế **Profile** (hồ sơ cấu hình) của Spring Boot để tách cấu hình theo môi trường:

```properties
# application-dev.properties
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/mydb_dev

# application-prod.properties
server.port=80
spring.datasource.url=jdbc:mysql://prod-host:3306/mydb
```

Kích hoạt profile mong muốn khi chạy:

```bash
java -jar app.jar --spring.profiles.active=prod
```

Cách này giúp mỗi môi trường có cấu hình riêng (cổng, database, log level...) mà không cần sửa code hay commit thông tin nhạy cảm của production vào file chung.

</details>

**11. Bạn cần xử lý lỗi tập trung cho toàn bộ REST API — khi bất kỳ Controller nào ném exception, ứng dụng phải trả về JSON lỗi có cấu trúc thống nhất (status code, message) thay vì để lộ stack trace mặc định. Nên thiết kế thế nào trong Spring Boot?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng **`@ControllerAdvice`** (hoặc `@RestControllerAdvice`) kết hợp **`@ExceptionHandler`** để bắt lỗi tập trung một chỗ, áp dụng cho mọi Controller, thay vì viết `try-catch` lặp lại trong từng hàm:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException ex) {
        ErrorResponse body = new ErrorResponse(400, ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnknown(Exception ex) {
        ErrorResponse body = new ErrorResponse(500, "Đã có lỗi xảy ra");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}

record ErrorResponse(int status, String message) { }
```

- **`@RestControllerAdvice`** = `@ControllerAdvice` + `@ResponseBody`, áp dụng cho toàn bộ Controller trong ứng dụng.
- Mỗi `@ExceptionHandler` xử lý một loại exception cụ thể — nên bắt exception nghiệp vụ cụ thể trước (`IllegalArgumentException`...), để `Exception` chung ở cuối làm lưới an toàn cuối cùng, tránh lộ thông tin nội bộ (stack trace) ra client.

</details>

**12. Vì sao trong Spring, người ta thường khuyến nghị Controller/Service nên phụ thuộc vào một `interface` (ví dụ `UserService`) thay vì phụ thuộc trực tiếp vào class hiện thực cụ thể (ví dụ `UserServiceImpl`)?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Loose coupling** (kết nối lỏng): Controller chỉ cần biết "tôi cần một thứ biết làm `findUserName`", không quan tâm cách hiện thực bên trong ra sao. Muốn đổi cách hiện thực (ví dụ đổi nguồn dữ liệu, thêm cache) chỉ cần viết class mới implement cùng interface, không phải sửa Controller.
- **Dễ viết unit test**: khi test Controller, có thể tạo một implementation giả (fake/mock) của interface để kiểm soát hoàn toàn kết quả trả về, mà không cần khởi động toàn bộ logic thật hay database.
- **Hỗ trợ nhiều hiện thực cùng lúc**: Spring có thể tiêm đúng bean cần thiết dựa trên `@Qualifier` khi có nhiều class cùng implement một interface (ví dụ `EmailNotificationService` và `SmsNotificationService` cùng implement `NotificationService`).

Lưu ý: với Service đơn giản, chỉ có đúng một hiện thực và không có kế hoạch thay đổi, việc tạo interface riêng đôi khi chỉ là thêm tầng gián tiếp không cần thiết — nên áp dụng khi thực sự có lợi ích rõ ràng (test, đa hiện thực), không phải quy tắc bắt buộc cho mọi trường hợp.

</details>

---

## 3. Quarkus

Bài học: [3. Quarkus](../../java/10-web-frameworks/3_quarkus.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Cloud-native và microservice là gì? Vì sao hai khái niệm này khiến tốc độ khởi động ứng dụng trở nên quan trọng?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Cloud-native**: cách thiết kế ứng dụng để chạy tốt trên hạ tầng đám mây — đóng gói trong container, có thể nhân bản (scale) nhiều bản chạy song song, tự động khởi động/tắt theo lượng truy cập.
- **Microservice**: chia một ứng dụng lớn (monolith) thành nhiều dịch vụ nhỏ độc lập, mỗi dịch vụ triển khai và mở rộng riêng.

Trong môi trường này, các container thường xuyên được **tạo mới, nhân bản, hoặc tắt đi (scale-to-zero)** theo tải thực tế, đặc biệt với kiến trúc **serverless**. Nếu ứng dụng khởi động chậm (vài giây như JVM truyền thống), mỗi lần cần một bản chạy mới (**cold start**) người dùng phải chờ lâu — ảnh hưởng trực tiếp tới trải nghiệm và cả chi phí (trả tiền theo thời gian container chạy).

</details>

**2. Vì sao Quarkus khởi động nhanh hơn nhiều so với một ứng dụng Spring Boot truyền thống chạy trên JVM?**

<details className="qa">
<summary>Xem đáp án</summary>

Khác biệt cốt lõi nằm ở **thời điểm xử lý công việc nặng**:

- **Spring Boot kiểu cũ**: phần lớn công việc như quét class, đọc annotation, tạo bean bằng reflection diễn ra **lúc chạy (runtime)** — mỗi lần khởi động phải làm lại từ đầu.
- **Quarkus**: dời phần lớn công việc đó sang **lúc build (build-time)**. Khi đóng gói ứng dụng, Quarkus đã quét sẵn class, xử lý sẵn annotation, chuẩn bị sẵn cấu trúc cần thiết. Lúc chạy chỉ còn việc "bật lên" và phục vụ request ngay, gần như không cần reflection.

Nhờ vậy thời gian khởi động giảm từ vài giây xuống còn vài chục/vài trăm mili-giây (và có thể xuống thấp hơn nữa với native image).

</details>

**3. Native image là gì? Nó mang lại lợi ích gì và phải đánh đổi điều gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Native image** là kết quả biên dịch ứng dụng Java (qua công cụ **GraalVM**) thành một **file thực thi chạy trực tiếp trên hệ điều hành**, không cần khởi động JVM (Java Virtual Machine) trước như cách chạy Java thông thường.

- **Lợi ích**: khởi động chỉ trong vài mili-giây, tiêu thụ RAM ít hơn hẳn — rất phù hợp cho serverless và microservice cần scale nhanh.
- **Đánh đổi**:
  - Thời gian **build lâu hơn đáng kể** so với build file `.jar` thông thường.
  - Một số thư viện dùng nhiều reflection lúc runtime cần **cấu hình bổ sung** (reflection config) mới tương thích được với native image, vì GraalVM cần biết trước mọi thứ sẽ dùng reflection ngay lúc build.
  - Vì vậy native image nên dùng khi thực sự cần tốc độ khởi động cực nhanh, không phải lựa chọn mặc định cho mọi dự án.

</details>

**4. Viết lại đoạn endpoint Spring Boot sau đây sang phong cách JAX-RS của Quarkus.**

```java
@RestController
@RequestMapping("/products")
public class ProductController {

    @GetMapping("/{id}")
    public String getProduct(@PathVariable int id) {
        return "Sản phẩm số " + id;
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

```java
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;

@Path("/products")
public class ProductResource {

    @GET
    @Path("/{id}")
    public String getProduct(@PathParam("id") int id) {
        return "Sản phẩm số " + id;
    }
}
```

Điểm khác biệt chính: không cần annotation tương đương `@RestController` (chỉ cần class có `@Path` là JAX-RS đã nhận diện), `@RequestMapping`/`@GetMapping` gộp thành `@Path` (cấp class) + `@Path` (cấp method) + `@GET`, và `@PathVariable` đổi thành `@PathParam("id")` với tên tham số phải khai báo tường minh trong ngoặc.

</details>

**5. CDI là gì? So sánh `@ApplicationScoped` + `@Inject` của Quarkus với `@Service` + constructor injection của Spring.**

<details className="qa">
<summary>Xem đáp án</summary>

**CDI** (Contexts and Dependency Injection) là chuẩn dependency injection của Java (một phần của Jakarta EE), mà Quarkus dùng thay cho cơ chế DI riêng của Spring.

| Spring | Quarkus (CDI) | Ý nghĩa |
|---|---|---|
| `@Service` / `@Component` | `@ApplicationScoped` | Đánh dấu bean dùng chung (singleton) cho cả ứng dụng |
| `@Autowired` (field injection) | `@Inject` (trên field) | Yêu cầu tiêm dependency vào |
| Constructor injection (khuyến nghị) | Cũng hỗ trợ `@Inject` trên constructor | Cách tiêm được khuyến nghị ở cả hai |

Về bản chất, cả hai đều giải quyết cùng vấn đề (để framework tự tạo và tiêm đối tượng thay vì tự `new`), chỉ khác annotation vì CDI là chuẩn chung của Java còn Spring có annotation riêng của mình.

</details>

**6. Đoạn code sau chạy trên Quarkus có vấn đề gì? Sửa lại cho đúng.**

```java
@RestController
@RequestMapping("/hello")
public class GreetingResource {

    @GetMapping
    public String hello() {
        return "Xin chào từ Quarkus!";
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

Vấn đề: dùng nhầm annotation của **Spring** (`@RestController`, `@RequestMapping`, `@GetMapping`) trong một dự án **Quarkus** — Quarkus không hiểu các annotation này vì nó dùng chuẩn **JAX-RS**, không phải Spring MVC. Ứng dụng sẽ không nhận diện được endpoint này.

Sửa lại:

```java
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/hello")
public class GreetingResource {

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String hello() {
        return "Xin chào từ Quarkus!";
    }
}
```

</details>

**7. So sánh Quarkus và Spring Boot theo các tiêu chí: tốc độ khởi động, tiêu thụ RAM, hệ sinh thái/cộng đồng, kiểu annotation dùng.**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | Spring Boot | Quarkus |
|---|---|---|
| Tốc độ khởi động | Vài giây (JVM thường) | Mili-giây, đặc biệt nhanh với native image |
| Tiêu thụ RAM | Cao hơn | Thấp hơn đáng kể |
| Cộng đồng/tài liệu | Rất lớn, lâu đời, dễ tìm hướng dẫn | Nhỏ hơn, đang phát triển nhanh |
| Annotation | Riêng của Spring (`@RestController`...) | Chuẩn Java: JAX-RS (`@Path`), CDI (`@Inject`) |
| Phù hợp | Đa số dự án doanh nghiệp truyền thống | Microservice, serverless, container cần khởi động nhanh |

Cả hai đều là lựa chọn tốt cho REST API; sự khác biệt chủ yếu nằm ở **triết lý tối ưu** (đầy đủ tính năng, cộng đồng lớn vs. khởi động nhanh, tiết kiệm tài nguyên) hơn là hơn/kém tuyệt đối.

</details>

**8. Bạn cần thiết kế một hệ thống gồm hàng chục microservice chạy trên Kubernetes, trong đó nhiều service có lượng truy cập thấp và muốn tự động scale về 0 (không chạy instance nào) khi không có request để tiết kiệm chi phí, rồi bật lại tức thì khi có request tới. Nên ưu tiên Quarkus hay Spring Boot? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Nên ưu tiên **Quarkus**, đặc biệt kết hợp build **native image**, vì:

- Kịch bản "scale về 0 rồi bật lại tức thì" chính là mô hình **serverless**, nơi **cold start** (thời gian khởi động bản chạy mới) ảnh hưởng trực tiếp tới độ trễ mà người dùng cảm nhận được — mỗi request đầu tiên sau khi scale-to-zero phải chờ instance khởi động xong mới được phục vụ.
- Native image của Quarkus khởi động trong vài mili-giây, gần như không có độ trễ đáng kể; trong khi Spring Boot chạy trên JVM thường mất vài giây để khởi động — với tần suất scale-to-zero cao, độ trễ này cộng dồn ảnh hưởng lớn tới trải nghiệm.
- Quarkus cũng tiêu thụ ít RAM hơn, giúp chạy được nhiều instance hơn trên cùng tài nguyên Kubernetes, giảm chi phí hạ tầng khi có hàng chục service.

Đánh đổi cần lưu ý: build native image tốn thời gian hơn trong CI/CD, và đội ngũ cần quen với JAX-RS/CDI thay vì Spring quen thuộc.

</details>

**9. Giải thích ý tưởng "container-first" và "build-time processing" của Quarkus qua ví dụ đời thường.**

<details className="qa">
<summary>Xem đáp án</summary>

**Container-first** nghĩa là Quarkus được thiết kế với giả định ứng dụng sẽ chạy trong container, thường xuyên bị tạo mới/nhân bản — nên mọi quyết định thiết kế đều ưu tiên khởi động nhanh, ít tài nguyên.

Ví von nấu ăn: 

- Cách truyền thống (nhiều framework Java khác) giống như **mỗi lần có khách mới đi chợ, sơ chế rồi mới nấu** — tốn thời gian mỗi lần.
- Quarkus giống như **chuẩn bị sẵn nguyên liệu đã sơ chế từ trước** (lúc build), khi có khách chỉ việc **hâm nóng** (lúc chạy) là phục vụ ngay.

Cụ thể hơn, "build-time processing" nghĩa là các bước như quét class tìm annotation, phân tích cấu hình, xác định bean nào cần tạo... được Quarkus thực hiện **một lần duy nhất lúc đóng gói ứng dụng**, kết quả được "đóng băng" sẵn. Lúc chạy thật, ứng dụng không cần lặp lại các bước phân tích tốn thời gian đó nữa.

</details>

**10. `@ApplicationScoped` trong CDI có luôn hoạt động giống hệt bean `singleton` mặc định của Spring không? Nêu thêm ít nhất một scope khác của CDI và ý nghĩa của nó.**

<details className="qa">
<summary>Xem đáp án</summary>

Về hành vi thực tế, **`@ApplicationScoped` tương đương singleton của Spring**: CDI chỉ tạo **một instance duy nhất** cho cả vòng đời ứng dụng, dùng chung cho mọi nơi tiêm vào — giống hệt ý nghĩa "singleton".

Tuy nhiên CDI có **nhiều loại scope** khác nhau tùy vòng đời mong muốn, ví dụ:

- **`@RequestScoped`**: tạo một instance **mới cho mỗi request HTTP**, hủy khi request kết thúc — phù hợp khi cần giữ trạng thái riêng biệt cho từng request (ví dụ thông tin người dùng đang đăng nhập).
- **`@Dependent`**: instance có vòng đời **gắn liền với đối tượng đang tiêm nó vào** (gần giống scope "prototype" của Spring — mỗi lần tiêm là một instance mới).

Vì vậy khi thiết kế bean trong Quarkus, cần chọn đúng scope theo nhu cầu giữ trạng thái, không nên mặc định luôn dùng `@ApplicationScoped` cho mọi trường hợp.

</details>

---

## 4. Javalin

Bài học: [4. Javalin](../../java/10-web-frameworks/4_javalin.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Triết lý "ít phép thuật nhất có thể" (least magic) của Javalin nghĩa là gì? So với cơ chế annotation + auto-configuration của Spring Boot, nó có ưu và nhược điểm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

"Ít phép thuật" nghĩa là mọi hành vi của ứng dụng đều được viết **tường minh, ngay tại chỗ gọi** (ví dụ `app.get("/path", ctx -> ...)`), thay vì dựa vào annotation rồi để framework tự động dò, quét, và quyết định hành vi ngầm phía sau như Spring Boot.

- **Ưu điểm**: đọc code là hiểu ngay luồng chạy, dễ debug vì không có bước "ẩn" nào ở giữa; học rất nhanh vì không cần hiểu cơ chế auto-configuration phức tạp.
- **Nhược điểm**: không có sẵn nhiều tính năng "làm hộ" như Spring (bảo mật, tích hợp database, validation...) — người dùng phải tự ghép thêm thư viện và tự viết nhiều hơn cho các nhu cầu phức tạp.

Đây là sự đánh đổi giữa **tường minh, đơn giản** (Javalin) và **tiện lợi, đầy đủ tính năng nhưng phức tạp hơn** (Spring Boot).

</details>

**2. Phân biệt `ctx.pathParam(...)`, `ctx.queryParam(...)` và `ctx.body()` trong Javalin.**

<details className="qa">
<summary>Xem đáp án</summary>

| Hàm | Lấy dữ liệu từ đâu | Ví dụ |
|---|---|---|
| `ctx.pathParam("id")` | Một đoạn trong đường dẫn URL | `/users/{id}` với request `/users/5` → `"5"` |
| `ctx.queryParam("keyword")` | Tham số sau dấu `?` | `/search?keyword=java` → `"java"` |
| `ctx.body()` | Toàn bộ phần thân request (thường là JSON) | body: `{"content": "..."}` → chuỗi JSON thô |

Lưu ý chung: cả `pathParam` và `queryParam` đều trả về kiểu `String`, phải tự chuyển đổi kiểu (`Integer.parseInt(...)`) nếu cần dùng làm số.

</details>

**3. Đoạn code sau chạy nhưng không có server nào phục vụ request cả. Lỗi ở đâu?**

```java
public class App {
    public static void main(String[] args) {
        Javalin app = Javalin.create();
        app.get("/hello", ctx -> ctx.result("Xin chào!"));
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

Thiếu lời gọi **`.start(port)`**. `Javalin.create()` chỉ tạo ra đối tượng cấu hình ứng dụng, chưa thực sự **mở cổng lắng nghe**. Route `app.get(...)` được đăng ký vào đối tượng `app`, nhưng vì server chưa khởi động nên không có gì lắng nghe request cả.

Sửa lại:

```java
public class App {
    public static void main(String[] args) {
        Javalin app = Javalin.create().start(7070); // .start(port) mới thực sự chạy server
        app.get("/hello", ctx -> ctx.result("Xin chào!"));
    }
}
```

</details>

**4. Đoạn code sau có nguy cơ lỗi gì khi client gọi `GET /users/abc`? Nên xử lý thế nào?**

```java
app.get("/users/{id}", ctx -> {
    int id = Integer.parseInt(ctx.pathParam("id"));
    ctx.result("Người dùng số " + id);
});
```

<details className="qa">
<summary>Xem đáp án</summary>

`ctx.pathParam("id")` luôn trả về `String`, nên nếu client gọi `/users/abc` (không phải số), `Integer.parseInt("abc")` sẽ ném ra **`NumberFormatException`** — nếu không được xử lý, request này sẽ trả về lỗi `500 Internal Server Error` thay vì một thông báo lỗi rõ ràng cho client.

Cách xử lý hợp lý hơn: validate trước khi parse, hoặc bắt exception để trả về `400 Bad Request` kèm thông báo dễ hiểu:

```java
app.get("/users/{id}", ctx -> {
    try {
        int id = Integer.parseInt(ctx.pathParam("id"));
        ctx.result("Người dùng số " + id);
    } catch (NumberFormatException e) {
        ctx.status(400).result("id phải là một số nguyên hợp lệ");
    }
});
```

</details>

**5. `ctx.result(...)` và `ctx.json(...)` khác nhau thế nào? Khi nào nên dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`ctx.result(...)`**: trả về **văn bản thuần** (plain text) — nhận vào một `String` và gửi thẳng làm response body.
- **`ctx.json(...)`**: nhận vào một **object Java bất kỳ** (record, class...) và **tự động serialize thành chuỗi JSON**, đồng thời tự set header `Content-Type: application/json` cho response.

Dùng `ctx.result()` khi chỉ cần trả một thông báo văn bản đơn giản; dùng `ctx.json()` khi trả về dữ liệu có cấu trúc (danh sách, object) — đây là cách phổ biến nhất cho REST API thực tế.

</details>

**6. So sánh Javalin và Spring Boot: khi nào nên chọn Javalin, khi nào nên chọn Spring Boot?**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | Javalin | Spring Boot |
|---|---|---|
| Độ phức tạp | Rất đơn giản, ít khái niệm | Nhiều khái niệm (DI, auto-config, annotation) |
| Tính năng có sẵn | Ít, tự ghép thêm khi cần | Rất nhiều (bảo mật, JPA, validation...) |
| Tốc độ học | Rất nhanh | Chậm hơn |
| Phù hợp | App nhỏ, prototype, học request/response | Dự án doanh nghiệp, hệ thống lớn, đi làm |

Chọn Javalin khi cần dựng nhanh một API nhỏ, công cụ nội bộ, hoặc muốn hiểu cặn kẽ luồng request/response mà không bị annotation che khuất. Chọn Spring Boot khi dự án cần nhiều tính năng tích hợp sẵn (bảo mật, database, validation phức tạp) hoặc khi làm việc nhóm lớn cần quy ước thống nhất.

</details>

**7. Vì sao Javalin không có sẵn cơ chế xử lý exception tập trung như `@ControllerAdvice` của Spring? Javalin cung cấp cách nào để bắt lỗi tập trung cho toàn ứng dụng?**

<details className="qa">
<summary>Xem đáp án</summary>

Đúng với triết lý "ít phép thuật", Javalin không tự động bắt exception ngầm cho bạn theo kiểu annotation quét toàn cục như Spring. Thay vào đó, Javalin cung cấp hàm **`app.exception(...)`** để đăng ký handler xử lý một loại exception cụ thể, áp dụng cho mọi route:

```java
app.exception(IllegalArgumentException.class, (e, ctx) -> {
    ctx.status(400).json(Map.of("error", e.getMessage()));
});

app.exception(Exception.class, (e, ctx) -> {
    ctx.status(500).json(Map.of("error", "Đã có lỗi xảy ra"));
});
```

Cách đăng ký này tường minh hơn (bạn thấy rõ ràng handler nào xử lý exception nào ngay trong hàm `main`), nhưng vẫn đạt được mục tiêu tương tự `@ControllerAdvice`: xử lý lỗi tập trung một chỗ thay vì lặp lại `try-catch` trong từng route.

</details>

**8. Bạn cần dựng nhanh một API nội bộ chỉ có 3 endpoint để đội QA test thử trong 1 buổi chiều, sau đó có thể bỏ đi. Nên chọn Javalin hay Spring Boot? Giải thích lựa chọn dựa trên chi phí học và triển khai.**

<details className="qa">
<summary>Xem đáp án</summary>

Nên chọn **Javalin** cho tình huống này:

- Với yêu cầu tạm thời, ít endpoint, không cần các tính năng phức tạp (bảo mật, ORM, validation nâng cao), việc dựng cả một dự án Spring Boot (nhiều file cấu hình, nhiều annotation, thời gian khởi động lâu hơn) là **quá mức cần thiết** so với lợi ích mang lại.
- Javalin cho phép viết toàn bộ 3 endpoint gọn trong một file `main`, chạy ngay lập tức, dễ dàng xóa bỏ khi không cần nữa mà không để lại "di sản" cấu hình phức tạp.
- Nếu sau này API này cần phát triển thành dịch vụ lâu dài, nhiều tính năng, có thể cân nhắc viết lại bằng Spring Boot — nhưng với nhu cầu ngắn hạn, chi phí chuyển đổi ngay từ đầu là không đáng.

Nguyên tắc chung: chọn công cụ theo đúng quy mô và tuổi thọ dự kiến của dự án, không phải lúc nào cũng dùng framework "mạnh nhất".

</details>

**9. Đoạn code sau (API quản lý ghi chú) có vấn đề gì về mặt an toàn dữ liệu khi nhiều request `POST /notes` được gửi đồng thời (concurrent)?**

```java
List<Note> notes = new ArrayList<>();

app.post("/notes", ctx -> {
    Note input = ctx.bodyAsClass(Note.class);
    Note newNote = new Note(notes.size() + 1, input.content());
    notes.add(newNote);
    ctx.status(201);
    ctx.json(newNote);
});
```

<details className="qa">
<summary>Xem đáp án</summary>

Vấn đề: `ArrayList` **không thread-safe** (không an toàn khi nhiều luồng cùng truy cập), trong khi Javalin (giống hầu hết web framework) xử lý mỗi request trên một luồng riêng — nhiều request `POST /notes` gửi gần như đồng thời có thể:

- Cùng đọc `notes.size()` trước khi luồng kia kịp `add(...)`, dẫn đến **hai ghi chú khác nhau bị gán trùng `id`**.
- Trong trường hợp xấu hơn, thao tác `add()` đồng thời trên `ArrayList` từ nhiều luồng có thể làm hỏng cấu trúc dữ liệu nội bộ, gây ra lỗi khó lường (`ConcurrentModificationException` hoặc mất dữ liệu).

Cách khắc phục: dùng một cấu trúc dữ liệu thread-safe (ví dụ `Collections.synchronizedList(...)` hoặc `CopyOnWriteArrayList`), hoặc tốt hơn trong thực tế là **dùng database thật** thay vì lưu tạm trong bộ nhớ — vừa an toàn đa luồng, vừa không mất dữ liệu khi tắt ứng dụng.

</details>

---

## 5. Play Framework

Bài học: [5. Play Framework](../../java/10-web-frameworks/5_play-framework.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Mô hình "mỗi request một thread" (blocking) của các framework Servlet truyền thống gặp vấn đề gì khi có nhiều kết nối I/O đồng thời (gọi database, gọi API ngoài)?**

<details className="qa">
<summary>Xem đáp án</summary>

Trong mô hình blocking, một **thread bị giữ chặt** từ lúc nhận request đến khi trả response — kể cả trong khoảng thời gian nó **không làm gì** ngoài việc chờ một thao tác I/O chậm (đọc database, gọi API bên ngoài) hoàn tất.

Hệ quả khi lượng kết nối đồng thời lớn:

- Số thread cần thiết tăng theo số request đang xử lý cùng lúc, mà thread là tài nguyên **tốn kém** (mỗi thread hệ điều hành chiếm một lượng bộ nhớ stack riêng, và việc chuyển đổi ngữ cảnh — context switching — giữa nhiều thread cũng tốn CPU).
- Thread pool (nhóm thread có sẵn) có giới hạn kích thước; khi tất cả thread đều đang "ngồi chờ" I/O, các request mới phải xếp hàng dù CPU thực ra đang rảnh — gây nghẽn dù tài nguyên tính toán chưa hết.

</details>

**2. Reactive (non-blocking) giải quyết vấn đề trên như thế nào? Giải thích qua ví dụ đời thường.**

<details className="qa">
<summary>Xem đáp án</summary>

Reactive giải quyết bằng cách: khi một thao tác chậm (I/O) đang chờ kết quả, thread **không đứng im chờ** mà được **trả lại ngay** để phục vụ request khác; khi thao tác chậm hoàn tất, một callback (đoạn code xử lý tiếp theo) được gọi để hoàn thành phần còn lại.

Ví von quán cà phê:

- **Blocking**: nhân viên bấm máy pha cho khách A, đứng chờ máy chạy xong mới quay sang khách B — lãng phí thời gian đứng chờ.
- **Non-blocking**: nhân viên bấm máy pha cho khách A, lập tức quay sang phục vụ khách B trong lúc máy đang chạy; khi cà phê A xong thì quay lại đưa.

Nhờ đó, **một số lượng thread nhỏ có thể phục vụ được rất nhiều kết nối đồng thời**, miễn là phần lớn thời gian xử lý request là chờ I/O chứ không phải tính toán nặng liên tục.

</details>

**3. "Full-stack" trong ngữ cảnh Play Framework nghĩa là gì? Nó khác Spring Boot, Quarkus, Javalin ở điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Full-stack** nghĩa là Play có thể đảm nhận **cả hai tầng**:

- **Backend**: xử lý logic, dữ liệu, giống mọi framework khác.
- **Frontend**: tự dựng ra **trang HTML hoàn chỉnh** để hiển thị cho người dùng, thông qua **template** (file HTML có chèn dữ liệu động), mà không cần một framework frontend riêng (React, Vue...).

Trong khi đó, Spring Boot, Quarkus, Javalin thường được dùng chủ yếu để làm **API thuần** (chỉ trả JSON), và phần giao diện thường do một ứng dụng frontend riêng biệt đảm nhận. Play phù hợp hơn khi muốn một dự án duy nhất lo cả giao diện lẫn xử lý, theo phong cách gần giống Ruby on Rails hay Django.

</details>

**4. Trong kiến trúc MVC, Model, View và Controller đóng vai trò gì? Cho ví dụ với một ứng dụng quản lý sản phẩm.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Model** (mô hình — dữ liệu): đại diện cho dữ liệu và logic nghiệp vụ. Ví dụ: class `Product` chứa thông tin sản phẩm và các quy tắc liên quan (giá không được âm...).
- **View** (khung nhìn — giao diện): phần hiển thị cho người dùng, ví dụ template HTML hiển thị danh sách sản phẩm dạng bảng.
- **Controller** (bộ điều khiển): nhận request (ví dụ `GET /products`), lấy dữ liệu `Product` từ Model, rồi chọn View phù hợp để render, hoặc trả JSON nếu là API.

Ví von: Model là kịch bản/diễn viên, View là cảnh quay người xem thấy, Controller là đạo diễn điều phối — nhận yêu cầu và ghép dữ liệu với giao diện phù hợp.

</details>

**5. Giải thích sự khác nhau giữa hai chữ ký hàm Controller sau trong Play. Vì sao dùng `CompletionStage<Result>` lại có lợi cho hiệu năng?**

```java
public Result index() { ... }
public CompletionStage<Result> index() { ... }
```

<details className="qa">
<summary>Xem đáp án</summary>

- **`Result index()`**: hàm xử lý **đồng bộ (synchronous)** — thread đang xử lý request này sẽ **bị giữ lại** cho tới khi toàn bộ logic bên trong (kể cả các thao tác I/O chậm) hoàn tất và trả về `Result`.
- **`CompletionStage<Result> index()`**: hàm xử lý **bất đồng bộ (asynchronous)** — trả về ngay một "lời hứa" (promise) sẽ có `Result` trong tương lai. Trong lúc thao tác chậm (ví dụ gọi API ngoài qua `CompletableFuture.supplyAsync(...)`) đang chạy, **thread hiện tại được giải phóng** để phục vụ request khác; khi thao tác chậm xong, Play tự động gọi tiếp phần `.thenApply(...)` để hoàn thiện response.

Lợi ích: với ứng dụng có nhiều request đồng thời mà phần lớn thời gian xử lý là chờ I/O, dùng `CompletionStage<Result>` giúp một số lượng thread nhỏ phục vụ được nhiều request hơn hẳn so với cách đồng bộ, tận dụng đúng tinh thần reactive của Play.

</details>

**6. Viết khai báo route trong file `conf/routes` cho một endpoint `POST /users` gọi hàm `createUser` trong `UserController`, nhận vào tên người dùng là tham số kiểu chuỗi từ query string.**

<details className="qa">
<summary>Xem đáp án</summary>

```
# File: conf/routes
POST    /users    controllers.UserController.createUser(name: String)
```

Trong đó `name: String` khai báo Play sẽ tự lấy tham số `name` từ query string (`/users?name=An`) và truyền vào hàm `createUser(String name)` trong `UserController`. Cú pháp chung của file `routes` là `<METHOD>  <đường-dẫn>  <controller>.<hàm>(<tham-số>)`, khai báo tập trung toàn bộ route của ứng dụng ở một file duy nhất thay vì rải rác qua annotation trong nhiều class như Spring Boot.

</details>

**7. So sánh Play Framework và Spring Boot theo các tiêu chí: mô hình xử lý request, cách khai báo route, khả năng làm full-stack, độ phổ biến khi đi làm.**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | Play | Spring Boot |
|---|---|---|
| Mô hình xử lý | Reactive, non-blocking (dựa trên Akka) | Truyền thống, blocking theo mặc định (có hỗ trợ reactive qua WebFlux) |
| Khai báo route | Tập trung trong một file `conf/routes` | Rải rác qua annotation trên từng Controller |
| Full-stack (giao diện) | Mạnh, có template HTML tích hợp sẵn | Cần thêm thư viện (Thymeleaf...) hoặc tách frontend riêng |
| Độ phổ biến đi làm | Thấp hơn, ít vị trí tuyển dụng | Rất cao, gần như mặc định ở Java backend |
| Cộng đồng/tài liệu | Nhỏ hơn | Rất lớn, dễ tìm hướng dẫn |

Kết luận thực tế: Play là lựa chọn tốt cho use case cụ thể (full-stack, reactive, lượng truy cập lớn), nhưng vì độ phổ biến thấp hơn, phần lớn lộ trình học Java backend vẫn nên ưu tiên Spring Boot trước.

</details>

**8. Bạn viết xong một `UserController` trong Play với hàm `getUser(id: Int)`, chạy ứng dụng và gọi `GET /users/5` nhưng nhận về lỗi 404 Not Found dù Controller hoàn toàn không có lỗi cú pháp. Nguyên nhân có khả năng cao nhất là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên nhân phổ biến nhất: **quên khai báo route tương ứng trong file `conf/routes`**. Khác với Spring Boot (route được khai báo ngay trong Controller qua annotation như `@GetMapping`), Play tách biệt hoàn toàn việc **viết logic xử lý** (trong Controller) và **khai báo đường dẫn** (trong file `routes`) — viết Controller đúng nhưng chưa thêm dòng route thì Play không biết đường dẫn `/users/5` phải gọi tới hàm nào, nên trả về `404`.

Cách khắc phục: thêm dòng khai báo tương ứng, ví dụ:

```
GET     /users/:id        controllers.UserController.getUser(id: Int)
```

</details>

**9. Java 21 (LTS) đã chính thức đưa vào `virtual thread` (luồng ảo — một cơ chế giúp mô hình "mỗi request một thread" truyền thống trở nên rẻ và mở rộng tốt hơn nhiều). Điều này có làm cho lợi thế reactive của Play trở nên kém quan trọng hơn không? Hãy phân tích.**

<details className="qa">
<summary>Xem đáp án</summary>

Đây là một câu hỏi mở mang tính phân tích, thường gặp trong phỏng vấn senior:

- **Virtual thread** (từ Java 21) cho phép tạo ra **hàng trăm nghìn thread "ảo"** với chi phí bộ nhớ cực thấp, được quản lý bởi JVM thay vì ánh xạ trực tiếp 1-1 với thread hệ điều hành. Nhờ vậy, code viết theo phong cách blocking truyền thống (dễ đọc, dễ debug hơn code reactive) vẫn có thể chịu tải lớn mà không cần đổi sang mô hình reactive phức tạp.
- Điều này khiến áp lực phải "viết reactive" chỉ để đạt hiệu năng cao ở tầng I/O đã **giảm đáng kể** — nhiều framework mới (và cả Spring, qua module hỗ trợ virtual thread) đang tận dụng virtual thread để đạt hiệu năng tương đương reactive mà giữ code đơn giản hơn.
- Tuy nhiên, reactive vẫn có giá trị riêng ở các khía cạnh mà virtual thread không thay thế hoàn toàn: kiểm soát luồng dữ liệu chi tiết (backpressure — cơ chế điều tiết khi bên nhận xử lý chậm hơn bên gửi), xử lý luồng sự kiện phức tạp (streaming, kết hợp nhiều nguồn bất đồng bộ), vốn là thế mạnh của các thư viện reactive (Akka Streams mà Play dùng, Project Reactor...).
- Kết luận hợp lý: virtual thread làm giảm bớt lý do "phải" chọn framework reactive chỉ vì lo hiệu năng I/O, nhưng không xóa bỏ hoàn toàn use case của reactive programming — lựa chọn vẫn nên dựa trên đặc thù bài toán (cần backpressure/streaming phức tạp hay không) chứ không chỉ đơn thuần vì lý do hiệu năng thread.

</details>
