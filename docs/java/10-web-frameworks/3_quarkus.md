---
sidebar_position: 3
title: "3. Quarkus"
---

# 3. Quarkus

---

## Mục lục

- [Quarkus là gì?](#quarkus-là-gì)
- [Cloud-native và Microservice là gì?](#cloud-native-và-microservice-là-gì)
- [Vì sao Quarkus khởi động siêu nhanh?](#vì-sao-quarkus-khởi-động-siêu-nhanh)
- [Native Image với GraalVM](#native-image-với-graalvm)
- [Tạo dự án Quarkus](#tạo-dự-án-quarkus)
- [Viết endpoint với JAX-RS](#viết-endpoint-với-jax-rs)
- [Dependency Injection trong Quarkus](#dependency-injection-trong-quarkus)
- [So sánh Quarkus với Spring Boot](#so-sánh-quarkus-với-spring-boot)
- [Khi nào nên dùng Quarkus?](#khi-nào-nên-dùng-quarkus)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Quarkus là gì?

**Quarkus** là một framework Java hiện đại do công ty Red Hat tạo ra, thiết kế đặc
biệt cho việc chạy trên **cloud** (đám mây) và **container** (vùng chứa — gói ứng
dụng kèm môi trường chạy, ví dụ Docker).

Khẩu hiệu của Quarkus là "Supersonic Subatomic Java" (Java siêu thanh siêu nhỏ),
nhấn mạnh hai điểm mạnh:

- **Khởi động cực nhanh** (tính bằng phần nghìn giây thay vì vài giây).
- **Dùng rất ít bộ nhớ** (RAM).

Quarkus dùng các chuẩn quen thuộc của Java như JAX-RS, CDI nên nếu bạn từng học
Spring thì sẽ thấy nhiều thứ tương tự.

## Cloud-native và Microservice là gì?

Trước khi hiểu vì sao Quarkus đặc biệt, cần nắm hai khái niệm:

- **Cloud-native** (sinh ra cho cloud): ứng dụng được thiết kế để chạy tốt trên hạ
  tầng đám mây. Đặc điểm: đóng gói trong container, có thể nhân bản nhiều bản chạy
  song song, khởi động/tắt nhanh tùy theo lượng truy cập.
- **Microservice** (dịch vụ nhỏ): thay vì viết một ứng dụng to (gọi là **monolith**
  — khối liền), người ta chia thành nhiều dịch vụ nhỏ độc lập. Ví dụ: dịch vụ đăng
  nhập riêng, dịch vụ thanh toán riêng, dịch vụ giỏ hàng riêng.

Trong môi trường này, ứng dụng thường xuyên được khởi động lại và nhân bản. Vì vậy
tốc độ khởi động và mức tiêu thụ RAM trở nên cực kỳ quan trọng — đây chính là chỗ
Quarkus tỏa sáng.

## Vì sao Quarkus khởi động siêu nhanh?

Các framework truyền thống (như Spring Boot kiểu cũ) làm rất nhiều việc **lúc chạy**
(runtime — thời điểm ứng dụng đang chạy): quét class, đọc cấu hình, tạo đối tượng...
Những việc này tốn thời gian mỗi lần khởi động.

Quarkus làm khác: nó chuyển phần lớn công việc này sang **lúc build** (build time —
thời điểm biên dịch, trước khi chạy). Nghĩa là khi đóng gói ứng dụng, Quarkus đã
chuẩn bị sẵn mọi thứ. Đến lúc chạy, nó chỉ việc "bật lên" là xong.

Hãy ví von: nấu cơm.

- **Spring Boot kiểu cũ**: mỗi lần ăn mới đi chợ, sơ chế, rồi nấu (chậm).
- **Quarkus**: chuẩn bị sẵn nguyên liệu từ trước, lúc ăn chỉ việc hâm nóng (nhanh).

## Native Image với GraalVM

**GraalVM** là một công nghệ (do Oracle phát triển) cho phép biên dịch chương trình
Java thành **native image** (ảnh chạy gốc — file chạy trực tiếp trên hệ điều hành mà
không cần JVM).

Bình thường Java chạy trên **JVM** (Java Virtual Machine — máy ảo Java), phải khởi
động JVM trước rồi mới chạy code. Native image bỏ qua bước đó: ứng dụng trở thành
một file thực thi gọn, chạy thẳng.

Lợi ích của native image:

- Khởi động trong vài **mili-giây** (phần nghìn giây).
- Tốn ít RAM hơn nhiều.

Quarkus được tối ưu rất tốt để build native image. Lệnh build (dùng Maven):

```bash
# Build ứng dụng thành native image (cần cài GraalVM)
./mvnw package -Pnative
```

Đánh đổi: build native image **lâu hơn** build thường, và một số thư viện Java cần
cấu hình thêm để tương thích. Vì vậy native image chỉ nên dùng khi thực sự cần tốc
độ khởi động cực nhanh.

## Tạo dự án Quarkus

Bạn có thể tạo dự án tại trang `code.quarkus.io` (tương tự Spring Initializr), chọn
các thư viện cần dùng rồi tải về. Một file cấu hình quan trọng là
`application.properties` (giống Spring Boot):

```properties
# Đổi cổng chạy server
quarkus.http.port=8080

# Bật chế độ log chi tiết khi phát triển
quarkus.log.level=INFO
```

Quarkus có chế độ **dev mode** (chế độ phát triển) rất tiện: bạn sửa code thì ứng
dụng tự cập nhật ngay, không cần khởi động lại:

```bash
# Chạy ở chế độ phát triển, tự nạp lại khi sửa code
./mvnw quarkus:dev
```

## Viết endpoint với JAX-RS

**JAX-RS** (Java API for RESTful Web Services — chuẩn API của Java để làm REST) là
một bộ quy ước chuẩn của Java để viết REST API. Quarkus dùng JAX-RS thay vì các
annotation riêng của Spring.

**Endpoint** (điểm cuối) là một đường dẫn API mà người dùng có thể gọi tới, ví dụ
`/hello`.

```java
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

// @Path("/hello"): đặt đường dẫn gốc cho class này là /hello
@Path("/hello")
public class GreetingResource {

    // @GET: xử lý request GET
    @GET
    // @Produces: khai báo kiểu dữ liệu trả về là văn bản thuần
    @Produces(MediaType.TEXT_PLAIN)
    public String hello() {
        // Chuỗi này sẽ là response gửi về cho người dùng
        return "Xin chào từ Quarkus!";
    }
}
```

So sánh với Spring Boot để dễ nhớ:

| Spring Boot | JAX-RS (Quarkus) |
|-------------|------------------|
| `@RestController` | (không cần, class có `@Path` là đủ) |
| `@RequestMapping("/x")` | `@Path("/x")` |
| `@GetMapping` | `@GET` |
| `@PostMapping` | `@POST` |
| `@PathVariable` | `@PathParam` |
| `@RequestParam` | `@QueryParam` |

Ví dụ lấy tham số từ đường dẫn:

```java
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;

@Path("/users")
public class UserResource {

    // GET /users/5 -> lấy người dùng id = 5
    // @PathParam("id"): lấy giá trị {id} trong đường dẫn gán vào biến id
    @GET
    @Path("/{id}")
    public String getUser(@PathParam("id") int id) {
        return "Người dùng số " + id;
    }
}
```

## Dependency Injection trong Quarkus

Quarkus dùng **CDI** (Contexts and Dependency Injection — chuẩn tiêm phụ thuộc của
Java) để làm dependency injection, tương tự như Spring nhưng dùng annotation khác.

```java
import jakarta.enterprise.context.ApplicationScoped;

// @ApplicationScoped: tạo một đối tượng dùng chung cho toàn ứng dụng
// (tương tự @Service bên Spring)
@ApplicationScoped
public class UserService {

    public String findUserName(int id) {
        return "Người dùng số " + id;
    }
}
```

```java
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;

@Path("/users")
public class UserResource {

    // @Inject: tiêm UserService vào đây (tương tự @Autowired bên Spring)
    @Inject
    UserService userService;

    @GET
    @Path("/{id}")
    public String getUser(@PathParam("id") int id) {
        return userService.findUserName(id);
    }
}
```

## So sánh Quarkus với Spring Boot

| Tiêu chí | Spring Boot | Quarkus |
|----------|-------------|---------|
| Tốc độ khởi động | Vài giây | Mili-giây (đặc biệt với native) |
| Tiêu thụ RAM | Cao hơn | Thấp hơn nhiều |
| Cộng đồng / tài liệu | Rất lớn, lâu đời | Nhỏ hơn, đang phát triển |
| Độ phổ biến đi làm | Rất cao | Đang tăng |
| Annotation | Riêng của Spring | Chuẩn Java (JAX-RS, CDI) |
| Native image | Hỗ trợ nhưng phức tạp hơn | Hỗ trợ rất tốt |

## Khi nào nên dùng Quarkus?

Nên cân nhắc Quarkus khi:

- Bạn xây **microservice** chạy trên cloud/container (Kubernetes, Docker).
- Bạn cần khởi động siêu nhanh, ví dụ ứng dụng kiểu **serverless** (chạy theo từng
  lần gọi, khởi động liên tục).
- Bạn muốn tiết kiệm RAM để giảm chi phí hạ tầng.

Nên dùng Spring Boot thay vì Quarkus khi:

- Bạn mới học và muốn nhiều tài liệu, nhiều người hỗ trợ.
- Dự án truyền thống, không quá nhạy cảm với tốc độ khởi động.
- Đội ngũ đã quen Spring.

## Lỗi thường gặp

- **Dùng annotation của Spring trong Quarkus**: ví dụ `@RestController` không hoạt
  động ở Quarkus. Phải dùng JAX-RS (`@Path`, `@GET`...).
- **Tưởng native image luôn tốt hơn**: build native image lâu và phức tạp hơn. Với
  ứng dụng nhỏ hoặc giai đoạn học, chạy trên JVM bình thường là đủ.
- **Quên cài GraalVM khi build native**: lệnh `-Pnative` sẽ lỗi nếu chưa có GraalVM.
- **Nhầm @PathParam với @QueryParam**: `@PathParam` lấy từ đường dẫn `/users/5`,
  `@QueryParam` lấy sau dấu `?` như `/users?id=5`.
- **Không tận dụng dev mode**: nhiều người mới khởi động lại thủ công mỗi lần sửa.
  Hãy dùng `quarkus:dev` để code nhanh hơn.

## Tóm tắt

- **Quarkus** là framework Java cho **cloud-native** và **microservice**, nổi bật ở
  khởi động siêu nhanh và dùng ít RAM.
- Quarkus nhanh vì chuyển nhiều việc từ **lúc chạy** sang **lúc build**.
- **Native image** (qua **GraalVM**) biến ứng dụng thành file chạy trực tiếp, khởi
  động trong mili-giây nhưng build lâu hơn.
- Quarkus dùng chuẩn Java: **JAX-RS** cho endpoint (`@Path`, `@GET`...) và **CDI**
  cho dependency injection (`@Inject`, `@ApplicationScoped`).
- Chọn Quarkus cho microservice/serverless trên cloud; chọn Spring Boot khi cần
  cộng đồng lớn và dễ học.
