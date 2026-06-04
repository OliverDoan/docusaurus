---
sidebar_position: 5
title: "5. Play Framework"
---

# 5. Play Framework

---

## Mục lục

- [Play Framework là gì?](#play-framework-là-gì)
- [Reactive nghĩa là gì?](#reactive-nghĩa-là-gì)
- [Full-stack nghĩa là gì?](#full-stack-nghĩa-là-gì)
- [Kiến trúc MVC](#kiến-trúc-mvc)
- [Play hỗ trợ cả Java và Scala](#play-hỗ-trợ-cả-java-và-scala)
- [Cấu trúc một dự án Play](#cấu-trúc-một-dự-án-play)
- [Định nghĩa route trong Play](#định-nghĩa-route-trong-play)
- [Viết một Controller](#viết-một-controller)
- [So sánh Play với Spring Boot](#so-sánh-play-với-spring-boot)
- [Khi nào nên dùng Play?](#khi-nào-nên-dùng-play)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Play Framework là gì?

**Play Framework** (gọi tắt là Play) là một framework web **full-stack** (toàn bộ
tầng — hỗ trợ cả giao diện lẫn xử lý phía server) và **reactive** (phản ứng — xử lý
nhiều việc đồng thời rất hiệu quả) cho Java và Scala.

Play khác biệt so với các framework đã học ở chỗ: nó được thiết kế theo phong cách
giống các framework web của ngôn ngữ khác (như Ruby on Rails hay Django của Python),
nhấn mạnh việc phát triển nhanh, cấu trúc rõ ràng và hiệu năng cao khi có nhiều
người dùng cùng lúc.

## Reactive nghĩa là gì?

**Reactive** (phản ứng) là một kiểu lập trình giúp ứng dụng xử lý nhiều yêu cầu cùng
lúc mà không bị "kẹt".

Hãy hình dung một quán cà phê:

- **Cách thường (blocking — chặn)**: một nhân viên pha cà phê cho khách A, đứng chờ
  máy chạy xong mới quay sang khách B. Trong lúc chờ, nhân viên đứng không, lãng phí.
- **Cách reactive (non-blocking — không chặn)**: nhân viên bấm máy pha cho khách A,
  rồi quay ngay sang phục vụ khách B trong khi máy đang chạy. Khi cà phê A xong thì
  quay lại đưa. Một nhân viên phục vụ được nhiều khách hơn.

Lập trình reactive làm điều tương tự: thay vì đứng chờ một việc chậm (như đọc
database, gọi API ngoài), chương trình làm việc khác trước, xong việc kia thì quay
lại xử lý. Nhờ vậy phục vụ được nhiều người dùng hơn với cùng tài nguyên.

Play được xây trên nền **Akka** (một bộ công cụ xử lý đồng thời rất mạnh), nên hỗ
trợ reactive rất tốt — phù hợp cho ứng dụng có lượng truy cập lớn hoặc thời gian
thực (real-time) như chat, thông báo trực tiếp.

## Full-stack nghĩa là gì?

**Full-stack** nghĩa là Play lo được cả hai phần:

- **Backend** (phía sau — xử lý logic, dữ liệu): nhận request, xử lý, trả dữ liệu.
- **Frontend** (phía trước — giao diện): Play có thể tạo ra trang HTML hoàn chỉnh để
  hiển thị cho người dùng, thông qua **template** (khuôn mẫu — file HTML có chèn dữ
  liệu động).

Trong khi Spring Boot, Quarkus, Javalin thường được dùng chủ yếu để làm API (chỉ
trả dữ liệu JSON), thì Play có thể đảm nhận cả việc dựng giao diện trang web hoàn
chỉnh.

## Kiến trúc MVC

Play theo **kiến trúc MVC** (Model - View - Controller), một cách tổ chức code rất
phổ biến chia ứng dụng thành 3 phần:

- **Model** (mô hình — dữ liệu): đại diện cho dữ liệu và logic nghiệp vụ, ví dụ
  class `User`, `Product`.
- **View** (khung nhìn — giao diện): phần hiển thị cho người dùng, thường là các
  template HTML.
- **Controller** (bộ điều khiển): nhận request, lấy dữ liệu từ Model, rồi chọn View
  để hiển thị (hoặc trả JSON).

Ví von như làm một bộ phim:

- **Model**: kịch bản và diễn viên (nội dung, dữ liệu).
- **View**: cảnh quay người xem thấy trên màn hình (giao diện).
- **Controller**: đạo diễn điều phối mọi thứ (nhận yêu cầu, ghép dữ liệu với giao
  diện).

## Play hỗ trợ cả Java và Scala

Play là framework đặc biệt vì hỗ trợ tốt cả hai ngôn ngữ:

- **Java**: ngôn ngữ bạn đang học.
- **Scala**: một ngôn ngữ khác chạy trên JVM, mạnh về lập trình hàm (functional).

Bạn có thể viết toàn bộ ứng dụng Play bằng Java mà không cần biết Scala. Tuy nhiên
nhiều dự án Play dùng Scala vì Scala và Play hợp nhau về phong cách reactive.

## Cấu trúc một dự án Play

Một dự án Play (dùng Java) thường có cấu trúc thư mục như sau:

```
my-play-app/
├── app/
│   ├── controllers/   -> Chứa các Controller
│   ├── models/        -> Chứa các Model (dữ liệu)
│   └── views/         -> Chứa các template View (giao diện)
├── conf/
│   ├── routes         -> File khai báo tất cả đường dẫn
│   └── application.conf -> File cấu hình chung
└── build.sbt          -> File quản lý thư viện (dùng công cụ sbt)
```

Điểm khác biệt đáng chú ý: Play có một file riêng tên **routes** trong thư mục `conf`
để khai báo tất cả đường dẫn ở một chỗ, thay vì rải rác bằng annotation như Spring.

## Định nghĩa route trong Play

File `conf/routes` liệt kê các route theo định dạng: `METHOD  đường-dẫn  hàm-xử-lý`.

```
# File: conf/routes
# Cú pháp: <METHOD>   <đường dẫn>   <controller>.<hàm>

# GET / -> gọi hàm index trong HomeController
GET     /                 controllers.HomeController.index()

# GET /users/5 -> gọi hàm getUser với id = 5
GET     /users/:id        controllers.UserController.getUser(id: Int)
```

Cách khai báo tập trung này giúp bạn nhìn vào một file là thấy toàn bộ đường dẫn của
ứng dụng — rất dễ quản lý khi dự án lớn.

## Viết một Controller

Controller trong Play (Java) là một class kế thừa từ lớp `Controller` có sẵn:

```java
package controllers;

import play.mvc.Controller;
import play.mvc.Result;

// Controller xử lý các request liên quan tới trang chủ
public class HomeController extends Controller {

    // Hàm index: xử lý request GET / (đã khai báo trong file routes)
    public Result index() {
        // ok(...) tạo response với status 200 và nội dung kèm theo
        return ok("Xin chào từ Play Framework!");
    }
}
```

Trả về JSON cũng rất gọn:

```java
package controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import play.mvc.Controller;
import play.mvc.Result;

public class UserController extends Controller {

    // Hàm getUser: trả về thông tin người dùng dạng JSON
    public Result getUser(int id) {
        // Tạo một đối tượng JSON: {"id": <id>, "name": "An"}
        ObjectNode json = JsonNodeFactory.instance.objectNode();
        json.put("id", id);
        json.put("name", "An");
        // ok(json) trả response 200 với nội dung JSON
        return ok(json);
    }
}
```

Khái niệm `Result` (kết quả): là đối tượng đại diện cho toàn bộ response trả về.
Hàm `ok(...)` tạo `Result` với status 200; tương tự có `notFound()` (404),
`badRequest()` (400)...

## So sánh Play với Spring Boot

| Tiêu chí | Play | Spring Boot |
|----------|------|-------------|
| Phong cách | Reactive, giống Rails/Django | Truyền thống, dựa trên annotation |
| Ngôn ngữ | Java và Scala | Chủ yếu Java/Kotlin |
| Khai báo route | Tập trung trong file `routes` | Rải rác qua annotation |
| Full-stack (giao diện) | Mạnh, có template sẵn | Cần thêm thư viện |
| Xử lý lượng truy cập lớn | Rất tốt (reactive) | Tốt (cần cấu hình thêm) |
| Độ phổ biến đi làm | Thấp hơn | Rất cao |
| Cộng đồng / tài liệu | Nhỏ hơn | Rất lớn |

## Khi nào nên dùng Play?

Nên cân nhắc Play khi:

- Bạn xây ứng dụng web **full-stack** cần cả giao diện lẫn API.
- Ứng dụng cần xử lý **lượng truy cập lớn** hoặc tính năng **thời gian thực** (chat,
  cập nhật trực tiếp).
- Đội ngũ dùng **Scala** hoặc muốn phong cách reactive.

Nên dùng Spring Boot thay vì Play khi:

- Bạn mới học và cần cộng đồng lớn, nhiều tài liệu.
- Dự án backend truyền thống, chủ yếu làm API.
- Công ty đã dùng Spring Boot (đa số trường hợp).

## Lỗi thường gặp

- **Quên khai báo route trong file `routes`**: ở Play, viết Controller thôi chưa đủ;
  phải khai báo đường dẫn trong `conf/routes` thì route mới hoạt động.
- **Nhầm Play với một thư viện cài qua Maven thông thường**: Play thường dùng công
  cụ build riêng là **sbt** (Scala Build Tool), khác với Maven/Gradle quen thuộc.
- **Tưởng phải biết Scala mới dùng được Play**: không bắt buộc; bạn có thể viết toàn
  bộ bằng Java.
- **Lạm dụng reactive khi chưa cần**: reactive mạnh nhưng khó hơn. Với app nhỏ,
  không nhất thiết phải dùng Play chỉ vì nó reactive.
- **Quên `extends Controller`**: class controller trong Play cần kế thừa lớp
  `Controller` để dùng các hàm như `ok()`, `notFound()`.

## Tóm tắt

- **Play Framework** là framework web **full-stack** và **reactive** cho cả Java và
  Scala.
- **Reactive** giúp xử lý nhiều request đồng thời mà không bị "kẹt", phù hợp lượng
  truy cập lớn và ứng dụng thời gian thực.
- **Full-stack** nghĩa là Play lo được cả backend lẫn frontend (qua template).
- Play theo kiến trúc **MVC** (Model - View - Controller) và khai báo route tập
  trung trong file `conf/routes`.
- Controller kế thừa lớp `Controller`, dùng `Result` và các hàm như `ok()` để trả
  response.
- Chọn Play cho ứng dụng full-stack/reactive lớn; với người mới và đa số dự án, Spring
  Boot vẫn là lựa chọn dễ tiếp cận và phổ biến hơn.
