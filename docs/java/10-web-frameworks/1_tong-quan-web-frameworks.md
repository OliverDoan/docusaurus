---
sidebar_position: 1
title: "1. Tổng quan Web Frameworks"
---

# 1. Tổng quan Web Frameworks

---

## Mục lục

- [Web Framework là gì?](#web-framework-là-gì)
- [Vì sao cần dùng Framework?](#vì-sao-cần-dùng-framework)
- [HTTP hoạt động thế nào?](#http-hoạt-động-thế-nào)
- [REST API là gì?](#rest-api-là-gì)
- [Request và Response](#request-và-response)
- [So sánh nhanh các Framework Java](#so-sánh-nhanh-các-framework-java)
- [Nên học cái nào trước?](#nên-học-cái-nào-trước)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Web Framework là gì?

**Web Framework** (khung làm web — bộ thư viện dựng sẵn để xây ứng dụng web) là một
tập hợp các công cụ, thư viện và quy tắc giúp bạn viết ứng dụng web nhanh hơn, không
phải làm lại những thứ cơ bản từ đầu.

Hãy tưởng tượng bạn muốn xây một ngôi nhà:

- **Không có framework**: bạn phải tự đúc gạch, tự trộn xi măng, tự làm cửa, tự kéo
  điện nước. Rất lâu và dễ sai.
- **Có framework**: bạn được phát sẵn tường đúc sẵn, cửa lắp ráp, ống nước có sẵn.
  Bạn chỉ việc ghép lại theo nhu cầu. Nhanh hơn rất nhiều.

Trong lập trình web, "những việc cơ bản" mà framework làm sẵn cho bạn gồm:

- Lắng nghe yêu cầu từ trình duyệt (browser) gửi tới.
- Phân tích đường dẫn URL (địa chỉ web) để biết người dùng muốn gì.
- Đọc dữ liệu người dùng gửi lên (form, JSON...).
- Gửi kết quả trả về cho người dùng.

## Vì sao cần dùng Framework?

Giả sử bạn muốn tự viết một server web bằng Java thuần (không framework). Bạn sẽ phải:

1. Mở một **socket** (cổng kết nối mạng) để lắng nghe.
2. Đọc từng dòng văn bản theo đúng chuẩn giao thức HTTP.
3. Tự tách phương thức (GET, POST...), đường dẫn, các header (thông tin kèm theo).
4. Tự viết code chuyển chuỗi JSON thành đối tượng Java và ngược lại.
5. Tự xử lý nhiều người dùng truy cập cùng lúc (đa luồng — multithreading).

Tất cả những việc trên rất khó, dễ lỗi và mất thời gian. Framework làm sẵn hết.
Bạn chỉ cần tập trung vào **logic nghiệp vụ** (business logic — phần xử lý riêng của
ứng dụng bạn), ví dụ: "khi người dùng đặt hàng thì lưu vào database".

```java
// KHÔNG dùng framework: phải tự lắng nghe socket, rất phức tạp
ServerSocket server = new ServerSocket(8080); // Mở cổng 8080
Socket client = server.accept();              // Chờ người dùng kết nối
// ... còn phải tự đọc HTTP, tự parse, tự trả lời: rất dài và dễ sai
```

```java
// CÓ framework (ví dụ Javalin): chỉ vài dòng là xong
import io.javalin.Javalin;

Javalin app = Javalin.create().start(8080); // Tạo server ở cổng 8080
app.get("/", ctx -> ctx.result("Xin chào!")); // Trả về chữ khi vào trang chủ
```

## HTTP hoạt động thế nào?

**HTTP** (HyperText Transfer Protocol — giao thức truyền siêu văn bản) là "ngôn ngữ"
mà trình duyệt và server dùng để nói chuyện với nhau. Nó hoạt động theo kiểu
**hỏi - đáp** (request - response):

1. Trình duyệt gửi một **request** (yêu cầu): "Cho tôi xem trang sản phẩm".
2. Server xử lý rồi gửi lại một **response** (phản hồi): "Đây là danh sách sản phẩm".

Mỗi request có một **method** (phương thức — loại hành động muốn làm). Các method
phổ biến:

| Method | Ý nghĩa đời thường | Dùng để |
|--------|-------------------|---------|
| `GET` | "Cho tôi xem" | Lấy dữ liệu (đọc) |
| `POST` | "Tạo cái mới giúp tôi" | Tạo dữ liệu mới |
| `PUT` | "Sửa toàn bộ cái này" | Cập nhật dữ liệu |
| `PATCH` | "Sửa một phần cái này" | Cập nhật một phần |
| `DELETE` | "Xóa cái này đi" | Xóa dữ liệu |

## REST API là gì?

**API** (Application Programming Interface — giao diện lập trình ứng dụng) là cách để
hai chương trình nói chuyện với nhau. Ví dụ app điện thoại nói chuyện với server.

**REST** (REpresentational State Transfer — một kiểu thiết kế API phổ biến) là một
"quy ước" về cách đặt đường dẫn và dùng method sao cho gọn gàng, dễ hiểu.

Ý tưởng của REST: mỗi "thứ" trong hệ thống (gọi là **resource** — tài nguyên) có một
đường dẫn riêng, và bạn dùng method để nói muốn làm gì với nó:

```
GET    /users        -> Lấy danh sách tất cả người dùng
GET    /users/5      -> Lấy thông tin người dùng có id = 5
POST   /users        -> Tạo một người dùng mới
PUT    /users/5      -> Cập nhật người dùng id = 5
DELETE /users/5      -> Xóa người dùng id = 5
```

Lưu ý quy ước: đường dẫn dùng **danh từ số nhiều** (`/users`, không phải `/getUser`),
còn hành động thì thể hiện bằng method. Đây là cách viết "đẹp" theo chuẩn REST.

## Request và Response

Một **request** (yêu cầu) thường gồm các phần:

- **Method**: GET, POST...
- **URL**: đường dẫn, ví dụ `/users/5`.
- **Headers** (phần đầu — thông tin kèm theo): ví dụ kiểu dữ liệu, token đăng nhập.
- **Body** (phần thân — dữ liệu chính): thường là JSON khi POST/PUT.

Một **response** (phản hồi) thường gồm:

- **Status code** (mã trạng thái): con số cho biết kết quả.
- **Headers**: thông tin kèm theo.
- **Body**: dữ liệu trả về (thường là JSON).

Các **status code** quan trọng cần nhớ:

| Mã | Ý nghĩa | Khi nào gặp |
|----|---------|-------------|
| `200` | OK — thành công | Lấy dữ liệu thành công |
| `201` | Created — đã tạo | Tạo mới thành công |
| `400` | Bad Request — yêu cầu sai | Dữ liệu gửi lên không hợp lệ |
| `401` | Unauthorized — chưa đăng nhập | Thiếu/sai token đăng nhập |
| `404` | Not Found — không tìm thấy | Đường dẫn không tồn tại |
| `500` | Internal Server Error | Server bị lỗi |

**JSON** (JavaScript Object Notation — định dạng dữ liệu dạng văn bản) là cách phổ
biến nhất để gửi dữ liệu qua API. Ví dụ một người dùng dạng JSON:

```json
{
  "id": 5,
  "name": "An",
  "email": "an@example.com"
}
```

## So sánh nhanh các Framework Java

Có rất nhiều framework web cho Java. Dưới đây là 4 cái phổ biến mà bạn sẽ học trong
các bài tiếp theo:

| Framework | Đặc điểm chính | Phù hợp với |
|-----------|----------------|-------------|
| **Spring Boot** | Phổ biến nhất, đầy đủ tính năng, cộng đồng lớn | Đa số dự án thực tế, đi làm |
| **Quarkus** | Khởi động siêu nhanh, nhẹ, cloud-native | Microservice, chạy trên cloud |
| **Javalin** | Siêu nhẹ, đơn giản, ít cấu hình | App nhỏ, học nhanh, prototype |
| **Play** | Reactive, full-stack, hỗ trợ Scala | Ứng dụng web lớn, thời gian thực |

Một vài thuật ngữ trong bảng:

- **Cloud-native** (sinh ra cho cloud): thiết kế để chạy tốt trên hạ tầng đám mây
  như AWS, Google Cloud, thường đóng gói trong container.
- **Microservice** (dịch vụ nhỏ): chia ứng dụng lớn thành nhiều dịch vụ nhỏ độc lập.
- **Reactive** (phản ứng): kiểu lập trình xử lý nhiều việc cùng lúc rất hiệu quả,
  tốt cho lượng truy cập lớn.
- **Full-stack** (toàn bộ tầng): hỗ trợ cả phần giao diện (frontend) lẫn phần
  xử lý (backend).

## Nên học cái nào trước?

Lời khuyên cho người mới:

1. **Bắt đầu với Javalin** nếu bạn muốn hiểu nhanh khái niệm request/response mà
   không bị rối bởi quá nhiều cấu hình.
2. **Học kỹ Spring Boot** vì đây là thứ được dùng nhiều nhất khi đi làm. Hầu hết
   tin tuyển dụng Java backend đều yêu cầu Spring Boot.
3. Quarkus và Play học sau, khi bạn đã vững Spring Boot và gặp nhu cầu cụ thể.

## Lỗi thường gặp

- **Nhầm GET với POST**: GET chỉ để đọc dữ liệu, không nên dùng GET để thay đổi
  dữ liệu. Tạo/sửa/xóa phải dùng POST/PUT/DELETE.
- **Đặt đường dẫn không theo chuẩn REST**: ví dụ viết `/getAllUsers` thay vì
  `GET /users`. Không sai về kỹ thuật nhưng khó bảo trì.
- **Quên status code phù hợp**: tạo mới thành công nên trả `201`, không phải `200`.
- **Tưởng framework là ngôn ngữ mới**: framework chỉ là thư viện viết bằng Java.
  Bạn vẫn dùng Java như bình thường, chỉ thêm các công cụ có sẵn.
- **Học quá nhiều framework cùng lúc**: nên học vững một cái (Spring Boot) trước,
  các cái khác chỉ là biến thể của cùng ý tưởng.

## Tóm tắt

- **Web framework** giúp bạn xây ứng dụng web nhanh hơn bằng cách làm sẵn các việc
  cơ bản như lắng nghe request, đọc dữ liệu, trả response.
- **HTTP** là giao thức hỏi - đáp giữa client và server, mỗi request có một
  **method** (GET, POST, PUT, DELETE).
- **REST API** là quy ước thiết kế API gọn gàng: dùng danh từ cho resource và method
  cho hành động.
- **Status code** cho biết kết quả: 200 (OK), 201 (đã tạo), 400 (sai), 404 (không
  thấy), 500 (lỗi server).
- Bốn framework chính: **Spring Boot** (phổ biến nhất), **Quarkus** (siêu nhanh),
  **Javalin** (siêu nhẹ), **Play** (reactive).
- Người mới nên học **Javalin** để hiểu khái niệm, rồi tập trung vào **Spring Boot**.
