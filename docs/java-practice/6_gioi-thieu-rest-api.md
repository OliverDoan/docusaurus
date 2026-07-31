---
sidebar_position: 6
title: "6. REST API & Spring Boot"
---

# Project 5 (Nâng cao): Từ console lên REST API

Bốn project trước chạy trong terminal — chỉ bạn dùng được. Giờ ta nâng cấp project "Quản lý sinh viên" thành một **REST API**: một chương trình chạy nền, lắng nghe trên mạng, để **bất kỳ ứng dụng nào khác** (web React, app mobile, Postman…) gọi tới và lấy dữ liệu. Đây chính là cách Backend và Frontend nói chuyện với nhau trong mọi sản phẩm thực tế. Bài này giải thích REST API là gì, vì sao dùng Spring Boot, và dựng bộ khung project chạy "Hello API" đầu tiên.

:::info Đây là chuỗi 3 bài
- **Bài 6 (bài này):** Hiểu REST API + dựng project Spring Boot.
- **Bài 7:** Xây API CRUD sinh viên đầy đủ với JPA + H2.
- **Bài 8:** Kết nối Frontend (React/fetch) gọi API.
:::

---

:::note[Ghi nhớ nhanh]

- ⭐ **REST API phơi bộ CRUD ra mạng qua HTTP** — `GET`/`POST`/`PUT`/`DELETE` trên các URL tài nguyên như `/api/students`.
- ⭐ **Spring Boot lo phần web server + cấu hình** — bạn chỉ viết logic với annotation như `@RestController`, `@GetMapping`.
- **Dữ liệu trao đổi thường ở dạng JSON** — trả về một object/`record` Java, Spring tự chuyển thành JSON nhờ Jackson.
- **Dựng project bằng Spring Initializr** ([start.spring.io](https://start.spring.io)) với 3 dependency: Spring Web, Spring Data JPA, H2.
- **Ứng dụng web chạy liên tục** (khác project console) — lắng nghe request ở `http://localhost:8080`.

:::

---

## Mục lục

- [REST API là gì?](#rest-api-là-gì)
- [Vì sao dùng Spring Boot?](#vì-sao-dùng-spring-boot)
- [Bước 1: Tạo project với Spring Initializr](#bước-1-tạo-project-với-spring-initializr)
- [Bước 2: Hiểu cấu trúc thư mục](#bước-2-hiểu-cấu-trúc-thư-mục)
- [Bước 3: Chạy ứng dụng lần đầu](#bước-3-chạy-ứng-dụng-lần-đầu)
- [Bước 4: Viết endpoint "Hello API" đầu tiên](#bước-4-viết-endpoint-hello-api-đầu-tiên)
- [Bước 5: Trả về JSON thay vì chuỗi](#bước-5-trả-về-json-thay-vì-chuỗi)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## REST API là gì?

Hãy tưởng tượng nhà hàng: **bạn (Frontend)** không vào bếp tự nấu, mà gọi món qua **người phục vụ (API)**; bếp **(Backend + database)** nấu rồi đưa món ra. Bạn chỉ cần biết *gọi gì* và *nhận lại gì*, không cần biết bếp hoạt động ra sao.

**API** (Application Programming Interface) là "thực đơn" các yêu cầu mà chương trình khác được phép gọi. **REST** là một bộ quy ước phổ biến để thiết kế API trên nền HTTP, dựa vào:

- **Đường dẫn (URL)** xác định *tài nguyên*: `/api/students` = "danh sách sinh viên".
- **Phương thức HTTP** xác định *hành động*:

| Phương thức | Ý nghĩa | Ví dụ |
|-------------|---------|-------|
| `GET` | Lấy dữ liệu (Read) | `GET /api/students` → lấy tất cả SV |
| `POST` | Tạo mới (Create) | `POST /api/students` → thêm 1 SV |
| `PUT` | Cập nhật (Update) | `PUT /api/students/1` → sửa SV id=1 |
| `DELETE` | Xoá (Delete) | `DELETE /api/students/1` → xoá SV id=1 |

Đây chính là bộ **CRUD** bạn đã làm ở project console, nhưng nay phơi ra mạng qua HTTP. Dữ liệu trao đổi thường ở định dạng **JSON**:

```json
{ "id": 1, "maSV": "SV001", "ten": "Nguyen Van A", "diem": 8.5 }
```

---

## Vì sao dùng Spring Boot?

Để tự viết một web server từ con số 0 (mở socket, phân tích HTTP, định tuyến…) rất cực và dễ lỗi. **Spring Boot** là framework Java phổ biến nhất để làm việc này, lo giúp bạn toàn bộ phần "đường ống":

- **Tự cấu hình** — chỉ khai báo thư viện cần, Spring Boot ráp sẵn web server (Tomcat) nhúng bên trong.
- **Chạy độc lập** — đóng gói thành một file `.jar` chạy bằng `java -jar`, không cần cài server riêng.
- **Annotation gọn nhẹ** — chỉ cần gắn `@RestController`, `@GetMapping`… là có endpoint, không phải viết code cấu hình dài dòng.

Bạn tập trung vào **logic nghiệp vụ**, Spring lo phần còn lại.

---

## Bước 1: Tạo project với Spring Initializr

Không gõ tay từ đầu — dùng công cụ chính thức [start.spring.io](https://start.spring.io) để sinh khung project:

1. Mở **https://start.spring.io**
2. Chọn:
   - **Project:** Maven
   - **Language:** Java
   - **Spring Boot:** bản ổn định mới nhất (vd 3.3.x)
   - **Java:** 21 (hoặc 17)
3. **Metadata:**
   - Group: `com.example`
   - Artifact: `quanlysinhvien`
4. **Dependencies** (bấm "Add Dependencies", thêm 3 cái):
   - **Spring Web** — để viết REST API
   - **Spring Data JPA** — để làm việc với database dễ dàng
   - **H2 Database** — database chạy trong bộ nhớ, không cần cài
5. Bấm **GENERATE** → tải file `.zip` → giải nén → mở bằng IntelliJ IDEA (File → Open → chọn thư mục).

:::tip Maven là gì?
**Maven** là công cụ quản lý thư viện và build cho Java. File `pom.xml` liệt kê các thư viện project cần; Maven tự tải về. Bạn không phải tải `.jar` thủ công như thời xưa.
:::

---

## Bước 2: Hiểu cấu trúc thư mục

Sau khi mở, project có dạng:

```
quanlysinhvien/
├── pom.xml                          ← khai báo thư viện & cấu hình build
└── src/
    └── main/
        ├── java/com/example/quanlysinhvien/
        │   └── QuanlysinhvienApplication.java   ← điểm khởi động
        └── resources/
            └── application.properties           ← cấu hình ứng dụng
```

File khởi động được sinh sẵn:

```java
package com.example.quanlysinhvien;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class QuanlysinhvienApplication {
    public static void main(String[] args) {
        SpringApplication.run(QuanlysinhvienApplication.class, args);
    }
}
```

Giải thích:

- **`@SpringBootApplication`** — annotation "bật công tắc": báo đây là ứng dụng Spring Boot, kích hoạt tự cấu hình và quét tìm các thành phần (controller, service…) trong cùng package.
- **`SpringApplication.run(...)`** — khởi động web server nhúng và toàn bộ ứng dụng. Vẫn là hàm `main` quen thuộc, chỉ là giờ nó chạy mãi để lắng nghe request.

---

## Bước 3: Chạy ứng dụng lần đầu

Bấm nút ▶ cạnh hàm `main` (hoặc chạy `./mvnw spring-boot:run` trong terminal). Khi log hiện dòng:

```
Tomcat started on port 8080 (http) ...
Started QuanlysinhvienApplication in 2.1 seconds
```

nghĩa là server đã chạy tại `http://localhost:8080`. Khác với 4 project trước (chạy xong là thoát), ứng dụng web **chạy liên tục** để chờ request. Muốn dừng thì bấm nút ⏹ (Stop).

:::warning Cổng 8080 đã bị chiếm
Nếu thấy lỗi `Port 8080 was already in use`, có ứng dụng khác đang dùng cổng này. Đổi cổng bằng cách thêm vào `src/main/resources/application.properties`:
```properties
server.port=8081
```
:::

---

## Bước 4: Viết endpoint "Hello API" đầu tiên

Tạo file mới `HelloController.java` cùng package với class Application:

```java
package com.example.quanlysinhvien;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/api/hello")
    public String hello() {
        return "Xin chào từ Spring Boot API!";
    }
}
```

Giải thích:

- **`@RestController`** — đánh dấu class này chứa các endpoint REST. Spring tự tạo object và "treo" nó lên để xử lý request.
- **`@GetMapping("/api/hello")`** — gắn hàm `hello()` vào request `GET /api/hello`. Khi có ai gọi URL đó, Spring chạy hàm này và gửi giá trị trả về về cho người gọi.

Khởi động lại app, rồi mở trình duyệt vào `http://localhost:8080/api/hello` — bạn sẽ thấy dòng chữ. **Chúc mừng, bạn vừa tạo endpoint web đầu tiên!**

Hoặc test bằng terminal:

```bash
curl http://localhost:8080/api/hello
# → Xin chào từ Spring Boot API!
```

---

## Bước 5: Trả về JSON thay vì chuỗi

API thực tế trả về **dữ liệu có cấu trúc (JSON)**, không phải chuỗi đơn. Điều tuyệt vời: chỉ cần trả về một **object Java**, Spring **tự động chuyển thành JSON**.

Tạo một record nhỏ và trả về nó:

```java
@GetMapping("/api/ping")
public ThongTin ping() {
    return new ThongTin("ok", "API đang hoạt động", 8080);
}

// record = class dữ liệu gọn (Java 16+), tự sinh constructor & getter
record ThongTin(String trangThai, String thongDiep, int cong) {}
```

Gọi `GET /api/ping` sẽ nhận về:

```json
{ "trangThai": "ok", "thongDiep": "API đang hoạt động", "cong": 8080 }
```

Giải thích:

- **`record ThongTin(...)`** — cách khai báo class chứa dữ liệu cực gọn từ Java 16. Tên các trường trong record trở thành **tên khoá JSON**.
- Spring Boot dùng thư viện **Jackson** (có sẵn) để tự chuyển object ↔ JSON. Bạn không phải viết code chuyển đổi thủ công.

Đây là nền tảng cho bài tiếp theo: ta sẽ trả về danh sách sinh viên dưới dạng JSON cho Frontend dùng.

---

## Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| `Port 8080 was already in use` | Cổng bị app khác chiếm | Đặt `server.port=8081` trong `application.properties` |
| Endpoint trả 404 | Controller nằm **ngoài** package của Application nên không bị quét | Đặt controller cùng hoặc trong package con của class `@SpringBootApplication` |
| Quên `@RestController` | Class không được Spring nhận diện | Thêm annotation `@RestController` lên class |
| Trình duyệt tải file thay vì hiển thị | Trả kiểu lạ hoặc thiếu annotation | Đảm bảo có `@RestController` + `@GetMapping` |
| `whitelabel error page` | Gõ sai URL endpoint | Kiểm tra đúng đường dẫn trong `@GetMapping` |

---

## Tóm tắt

- **REST API** phơi bộ **CRUD** ra mạng qua HTTP: `GET`/`POST`/`PUT`/`DELETE` trên các URL tài nguyên (`/api/students`).
- Dữ liệu trao đổi thường ở dạng **JSON**.
- **Spring Boot** lo phần web server + cấu hình; bạn chỉ viết logic với các **annotation** như `@RestController`, `@GetMapping`.
- Dựng project bằng **Spring Initializr** với 3 dependency: Spring Web, Spring Data JPA, H2.
- Trả về **object/record** → Spring tự chuyển thành JSON nhờ Jackson.

Tiếp theo: [Xây API CRUD sinh viên với JPA + H2](./7_api-quan-ly-sinh-vien.md).
