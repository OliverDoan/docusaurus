---
sidebar_position: 2
title: "2. Spring & Spring Boot (⭐ phổ biến nhất)"
---

# 2. Spring & Spring Boot (⭐ phổ biến nhất)

---

## Mục lục

- [Spring là gì?](#spring-là-gì)
- [Vấn đề của Spring thuần và sự ra đời của Spring Boot](#vấn-đề-của-spring-thuần-và-sự-ra-đời-của-spring-boot)
- [Auto-configuration là gì?](#auto-configuration-là-gì)
- [Tạo dự án Spring Boot đầu tiên](#tạo-dự-án-spring-boot-đầu-tiên)
- [Cấu trúc một ứng dụng Spring Boot](#cấu-trúc-một-ứng-dụng-spring-boot)
- [Viết REST API đầu tiên với @RestController](#viết-rest-api-đầu-tiên-với-restcontroller)
- [@GetMapping và @PostMapping](#getmapping-và-postmapping)
- [Dependency Injection là gì?](#dependency-injection-là-gì)
- [@Service và @Autowired](#service-và-autowired)
- [Ghép tất cả lại: API quản lý người dùng](#ghép-tất-cả-lại-api-quản-lý-người-dùng)
- [File application.properties](#file-applicationproperties)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Spring là gì?

**Spring** (tên đầy đủ là Spring Framework) là framework Java phổ biến nhất thế giới
để xây dựng ứng dụng phía server (backend). Nó ra đời năm 2003 và đến nay vẫn là lựa
chọn số một khi đi làm.

Spring rất mạnh nhưng cũng rất lớn. Nó gồm nhiều phần (gọi là **module** — mô-đun):

- **Spring Core**: phần lõi, lo việc quản lý các đối tượng (object).
- **Spring MVC**: lo việc làm web (xử lý request/response).
- **Spring Data**: lo việc làm việc với database.
- **Spring Security**: lo việc đăng nhập, phân quyền.

## Vấn đề của Spring thuần và sự ra đời của Spring Boot

Ngày xưa, dùng Spring thuần rất cực: bạn phải viết hàng trăm dòng cấu hình (XML hoặc
Java) chỉ để chạy được một ứng dụng đơn giản. Phải khai báo từng thứ một, dễ sai và
mất thời gian.

**Spring Boot** ra đời để giải quyết điều đó. Cái tên "Boot" nghĩa là "khởi động" —
nó giúp bạn khởi động một ứng dụng Spring cực nhanh với rất ít cấu hình. Triết lý của
Spring Boot là:

> **Convention over Configuration** (quy ước hơn cấu hình): thay vì bắt bạn khai báo
> mọi thứ, Spring Boot tự đoán những gì hợp lý nhất. Bạn chỉ cần khai báo khi muốn
> làm khác đi.

Ví dụ: Spring Boot mặc định chạy ở cổng `8080`, mặc định tìm file cấu hình tên
`application.properties`. Bạn không cần khai báo gì, nó vẫn chạy.

## Auto-configuration là gì?

**Auto-configuration** (tự động cấu hình) là tính năng cốt lõi của Spring Boot. Nó
tự động thiết lập mọi thứ dựa trên những thư viện bạn thêm vào dự án.

Hãy hiểu đơn giản: Spring Boot nhìn vào dự án của bạn và "đoán":

- "À, dự án này có thư viện web → mình tự khởi động server web cho họ."
- "À, dự án này có thư viện database MySQL → mình tự thiết lập kết nối database."

Nhờ vậy bạn không phải viết code thiết lập thủ công. Đây chính là lý do Spring Boot
được yêu thích: viết ít, làm được nhiều.

## Tạo dự án Spring Boot đầu tiên

Cách dễ nhất để tạo dự án là dùng **Spring Initializr** (công cụ tạo dự án online tại
địa chỉ `start.spring.io`). Bạn chọn:

- **Project**: Maven hoặc Gradle (công cụ quản lý thư viện và build dự án).
- **Language**: Java.
- **Dependencies** (các thư viện cần dùng): chọn `Spring Web`.

Sau đó tải về, mở bằng IDE (như IntelliJ IDEA). Dự án sẽ có sẵn một file khởi động:

```java
package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// @SpringBootApplication: đánh dấu đây là ứng dụng Spring Boot,
// đồng thời bật auto-configuration (tự động cấu hình)
@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        // Dòng này khởi động toàn bộ ứng dụng và server web
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

Chạy hàm `main` này là server đã chạy ở `http://localhost:8080`. Đơn giản vậy thôi!

## Cấu trúc một ứng dụng Spring Boot

Một ứng dụng Spring Boot thường được chia thành các tầng (layer — lớp) để code gọn
gàng, mỗi tầng lo một việc:

```
Controller (tầng tiếp nhận)  ->  nhận request, trả response
     |
Service (tầng nghiệp vụ)     ->  xử lý logic chính
     |
Repository (tầng dữ liệu)    ->  nói chuyện với database
```

Hãy tưởng tượng như một nhà hàng:

- **Controller** giống nhân viên phục vụ: tiếp nhận yêu cầu của khách (request).
- **Service** giống đầu bếp: nấu món ăn (xử lý logic).
- **Repository** giống nhà kho: lấy nguyên liệu ra (lấy dữ liệu từ database).

## Viết REST API đầu tiên với @RestController

**@RestController** (bộ điều khiển kiểu REST) là một **annotation** (chú thích — một
thẻ đánh dấu bắt đầu bằng `@` để báo cho Spring biết vai trò của class) đánh dấu rằng
class này chuyên xử lý các request và trả về dữ liệu (thường là JSON).

```java
package com.example.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

// @RestController: báo cho Spring biết class này xử lý API và trả về dữ liệu
@RestController
public class HelloController {

    // @GetMapping("/hello"): khi có request GET tới /hello thì chạy hàm này
    @GetMapping("/hello")
    public String sayHello() {
        // Chuỗi trả về sẽ được gửi thẳng cho người dùng làm response
        return "Xin chào từ Spring Boot!";
    }
}
```

Chạy ứng dụng rồi mở trình duyệt vào `http://localhost:8080/hello`, bạn sẽ thấy dòng
chữ "Xin chào từ Spring Boot!". Bạn vừa viết xong API đầu tiên!

## @GetMapping và @PostMapping

Spring có các annotation tương ứng với từng HTTP method:

- **@GetMapping**: xử lý request GET (lấy dữ liệu).
- **@PostMapping**: xử lý request POST (tạo dữ liệu mới).
- **@PutMapping**: xử lý request PUT (cập nhật).
- **@DeleteMapping**: xử lý request DELETE (xóa).

```java
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/products") // Tất cả đường dẫn dưới đây bắt đầu bằng /products
public class ProductController {

    // GET /products/5 -> lấy sản phẩm có id = 5
    // @PathVariable: lấy giá trị từ đường dẫn (chỗ {id}) gán vào biến id
    @GetMapping("/{id}")
    public String getProduct(@PathVariable int id) {
        return "Sản phẩm số " + id;
    }

    // POST /products -> tạo sản phẩm mới
    // @RequestBody: lấy dữ liệu JSON người dùng gửi lên, chuyển thành chuỗi
    @PostMapping
    public String createProduct(@RequestBody String name) {
        return "Đã tạo sản phẩm: " + name;
    }
}
```

Một số annotation hữu ích để đọc dữ liệu từ request:

- **@PathVariable** (biến trong đường dẫn): lấy giá trị từ URL, ví dụ `/products/5`
  thì `5` là path variable.
- **@RequestParam** (tham số truy vấn): lấy giá trị sau dấu `?`, ví dụ
  `/products?page=2` thì `page` là request param.
- **@RequestBody** (phần thân request): lấy dữ liệu JSON trong body, thường khi POST.

## Dependency Injection là gì?

**Dependency Injection** (DI — tiêm phụ thuộc) là một khái niệm quan trọng nhất của
Spring. Nghe khó nhưng ý tưởng rất đời thường.

**Dependency** (phụ thuộc) nghĩa là một đối tượng cần một đối tượng khác để làm việc.
Ví dụ `Controller` cần `Service` để xử lý logic.

Cách thông thường (không có DI): bạn tự tạo đối tượng cần dùng.

```java
// KHÔNG dùng DI: tự tạo đối tượng -> khó thay đổi, khó test
public class UserController {
    private UserService service = new UserService(); // Tự tạo, bị "dính chặt"
}
```

Cách dùng DI: bạn **không tự tạo**, mà nhờ Spring tạo sẵn rồi "tiêm" (inject) vào cho
bạn. Giống như bạn không tự nấu ăn mà có người mang sẵn món tới.

```java
// CÓ DI: Spring tự tạo UserService và đưa vào cho bạn
public class UserController {
    private final UserService service;

    // Spring nhìn vào constructor (hàm khởi tạo) và tự đưa UserService vào
    public UserController(UserService service) {
        this.service = service;
    }
}
```

Lợi ích của DI:

- **Dễ thay đổi**: muốn đổi cách xử lý, chỉ cần đổi đối tượng được tiêm vào.
- **Dễ test** (kiểm thử): có thể tiêm một đối tượng giả để kiểm tra.
- **Code gọn**: không phải tự quản lý việc tạo đối tượng.

## @Service và @Autowired

Để Spring biết đối tượng nào cần quản lý và tiêm cho nhau, bạn dùng các annotation:

- **@Service** (dịch vụ): đánh dấu một class là tầng xử lý nghiệp vụ. Spring sẽ tự
  tạo và quản lý đối tượng này (gọi là **bean** — đối tượng do Spring quản lý).
- **@Component** (thành phần): tương tự @Service nhưng tổng quát hơn.
- **@Repository** (kho dữ liệu): đánh dấu tầng làm việc với database.
- **@Autowired** (tự động nối dây): báo cho Spring "tiêm" đối tượng vào chỗ này.

```java
import org.springframework.stereotype.Service;

// @Service: Spring tự tạo và quản lý đối tượng UserService này
@Service
public class UserService {

    public String getUserName(int id) {
        // Trong thực tế sẽ lấy từ database, ở đây trả tạm
        return "Người dùng " + id;
    }
}
```

Hiện nay khuyến khích dùng **constructor injection** (tiêm qua hàm khởi tạo) thay cho
`@Autowired` đặt trực tiếp trên biến, vì rõ ràng và an toàn hơn:

```java
@RestController
public class UserController {
    private final UserService userService;

    // Constructor injection: Spring tự đưa UserService vào, không cần @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }
}
```

## Ghép tất cả lại: API quản lý người dùng

Bây giờ ta ghép tất cả khái niệm trên thành một API hoàn chỉnh có 2 tầng: Controller
và Service.

```java
import org.springframework.stereotype.Service;

// Tầng Service: xử lý logic nghiệp vụ
@Service
public class UserService {

    // Trả về tên người dùng theo id (giả lập, chưa dùng database thật)
    public String findUserName(int id) {
        if (id <= 0) {
            // Ném lỗi nếu id không hợp lệ -> để Controller xử lý
            throw new IllegalArgumentException("id phải lớn hơn 0");
        }
        return "Người dùng số " + id;
    }
}
```

```java
import org.springframework.web.bind.annotation.*;

// Tầng Controller: tiếp nhận request, gọi Service, trả response
@RestController
@RequestMapping("/users") // Mọi đường dẫn bắt đầu bằng /users
public class UserController {

    private final UserService userService;

    // Spring tự tiêm UserService vào qua constructor
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // GET /users/5 -> lấy tên người dùng id = 5
    @GetMapping("/{id}")
    public String getUser(@PathVariable int id) {
        // Controller chỉ điều phối, việc xử lý giao cho Service
        return userService.findUserName(id);
    }
}
```

Chạy ứng dụng và truy cập `http://localhost:8080/users/5`, bạn sẽ thấy
"Người dùng số 5". Đây là mô hình chuẩn mà hầu hết dự án Spring Boot đều dùng.

## File application.properties

**application.properties** là file cấu hình chính của Spring Boot, nằm trong thư mục
`src/main/resources/`. Đây là nơi bạn thay đổi các thiết lập mặc định.

```properties
# Đổi cổng chạy server từ 8080 sang 9090
server.port=9090

# Đặt tên cho ứng dụng
spring.application.name=my-first-app

# Cấu hình kết nối database (ví dụ MySQL)
spring.datasource.url=jdbc:mysql://localhost:3306/mydb
spring.datasource.username=root
# Lưu ý: KHÔNG ghi mật khẩu thật vào đây, nên dùng biến môi trường
spring.datasource.password=${DB_PASSWORD}
```

Một số người thích dùng file `application.yml` (định dạng YAML — gọn hơn) thay vì
`.properties`. Cả hai đều được, chọn cái nào tùy bạn:

```yaml
server:
  port: 9090
spring:
  application:
    name: my-first-app
```

## Lỗi thường gặp

- **Quên annotation @RestController hoặc @Service**: nếu thiếu, Spring không biết
  quản lý class đó, dẫn đến lỗi "không tìm thấy bean" hoặc API không hoạt động.
- **Đặt class controller ngoài package gốc**: Spring Boot chỉ quét các class nằm
  cùng package hoặc package con của class có `@SpringBootApplication`. Đặt sai chỗ
  thì Spring không thấy.
- **Tự `new` đối tượng Service thay vì để Spring tiêm**: làm vậy mất hết lợi ích của
  DI và đối tượng đó sẽ không được Spring quản lý.
- **Cổng 8080 đã bị dùng**: lỗi "Port 8080 was already in use". Đổi `server.port`
  sang cổng khác hoặc tắt ứng dụng đang chiếm cổng.
- **Hardcode mật khẩu vào application.properties**: tuyệt đối không. Dùng biến môi
  trường như `${DB_PASSWORD}` để bảo mật.
- **Nhầm @PathVariable với @RequestParam**: `@PathVariable` lấy từ đường dẫn
  (`/users/5`), `@RequestParam` lấy sau dấu `?` (`/users?id=5`).

## Tóm tắt

- **Spring** là framework Java backend phổ biến nhất; **Spring Boot** giúp khởi động
  ứng dụng Spring cực nhanh với rất ít cấu hình.
- **Auto-configuration** tự động thiết lập mọi thứ dựa trên thư viện bạn thêm vào.
- **@RestController** đánh dấu class xử lý API; **@GetMapping/@PostMapping** ánh xạ
  từng HTTP method tới hàm xử lý.
- Đọc dữ liệu request qua **@PathVariable** (đường dẫn), **@RequestParam** (sau `?`),
  **@RequestBody** (JSON trong body).
- **Dependency Injection** giúp Spring tự tạo và "tiêm" đối tượng cho nhau, làm code
  dễ thay đổi và dễ test. Ưu tiên **constructor injection**.
- **@Service** đánh dấu tầng nghiệp vụ; ứng dụng thường chia thành Controller →
  Service → Repository.
- **application.properties** là nơi cấu hình: đổi cổng, kết nối database, đặt tên app.
- Đây là framework quan trọng nhất nên đầu tư học thật kỹ.
