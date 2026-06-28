---
sidebar_position: 7
title: "7. API CRUD sinh viên (JPA + H2)"
---

# Project 5 (tiếp): API CRUD sinh viên với JPA + H2

Ở bài trước ta đã có server chạy và một endpoint "Hello". Giờ ta xây **API CRUD đầy đủ** cho sinh viên: thêm, xem, sửa, xoá — dữ liệu lưu trong database H2 thông qua **Spring Data JPA**. Bài này giới thiệu kiến trúc 3 tầng chuẩn của một ứng dụng backend (**Entity → Repository → Controller**), giúp bạn hiểu cách dữ liệu đi từ request HTTP xuống database và ngược lại.

---

## Mục lục

- [Kiến trúc 3 tầng](#kiến-trúc-3-tầng)
- [Bước 1: Cấu hình H2 database](#bước-1-cấu-hình-h2-database)
- [Bước 2: Entity — ánh xạ class sang bảng](#bước-2-entity--ánh-xạ-class-sang-bảng)
- [Bước 3: Repository — truy cập dữ liệu](#bước-3-repository--truy-cập-dữ-liệu)
- [Bước 4: Controller — các endpoint CRUD](#bước-4-controller--các-endpoint-crud)
- [Bước 5: Test API bằng curl](#bước-5-test-api-bằng-curl)
- [Bước 6: Xem database qua H2 Console](#bước-6-xem-database-qua-h2-console)
- [Bước 7: Validation và xử lý lỗi 404](#bước-7-validation-và-xử-lý-lỗi-404)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Thử thách mở rộng](#thử-thách-mở-rộng)
- [Tóm tắt](#tóm-tắt)

---

## Kiến trúc 3 tầng

Một backend gọn gàng chia trách nhiệm thành các tầng, dữ liệu chảy qua từng tầng:

```
[ Frontend ]
     │  HTTP request (JSON)
     ▼
┌──────────────┐   nhận request, trả response
│  Controller  │   (@RestController)
└──────┬───────┘
       ▼
┌──────────────┐   truy vấn / lưu dữ liệu
│  Repository  │   (Spring Data JPA)
└──────┬───────┘
       ▼
┌──────────────┐   bảng dữ liệu
│   Database   │   (H2)
└──────────────┘
       ▲
       │ ánh xạ qua
   [ Entity ]  ← class Java mô tả một dòng trong bảng
```

- **Entity** — class Java tương ứng với một bảng; mỗi object = một dòng.
- **Repository** — kho truy xuất dữ liệu; Spring tự sinh sẵn các hàm `save`, `findAll`, `findById`, `deleteById`.
- **Controller** — nhận request HTTP, gọi repository, trả JSON về.

:::tip Vì sao tách tầng?
Mỗi tầng làm một việc → dễ đọc, dễ sửa, dễ test. Controller không cần biết dữ liệu lưu ở đâu; Repository không cần biết có web hay không. Đây là nguyên tắc **separation of concerns** (tách bạch trách nhiệm).
:::

---

## Bước 1: Cấu hình H2 database

Mở `src/main/resources/application.properties`, thêm:

```properties
# Kết nối tới H2 database trong bộ nhớ
spring.datasource.url=jdbc:h2:mem:truongdb
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# Tự tạo/cập nhật bảng từ Entity khi khởi động
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# Bật trang web xem database
spring.h2.console.enabled=true
```

Giải thích các dòng quan trọng:

- **`jdbc:h2:mem:truongdb`** — `mem` nghĩa là database nằm **trong bộ nhớ RAM**: chạy tức thì, không cần cài, nhưng **dữ liệu mất khi tắt app** (phù hợp để học/test).
- **`ddl-auto=update`** — Spring tự động **tạo bảng từ Entity** giúp bạn, không phải viết câu lệnh `CREATE TABLE`.
- **`show-sql=true`** — in câu SQL Hibernate sinh ra ở console, rất hữu ích để học và debug.
- **`h2.console.enabled=true`** — bật giao diện web xem dữ liệu (xem bước 6).

---

## Bước 2: Entity — ánh xạ class sang bảng

Tạo `Student.java`. Đây là phiên bản nâng cấp của class `Student` ở project console, thêm các annotation JPA:

```java
package com.example.quanlysinhvien;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String maSV;
    private String ten;
    private double diem;

    // JPA BẮT BUỘC phải có constructor rỗng
    public Student() {}

    public Student(String maSV, String ten, double diem) {
        this.maSV = maSV;
        this.ten = ten;
        this.diem = diem;
    }

    // getter & setter (Jackson dùng để chuyển JSON, JPA dùng để ánh xạ)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMaSV() { return maSV; }
    public void setMaSV(String maSV) { this.maSV = maSV; }

    public String getTen() { return ten; }
    public void setTen(String ten) { this.ten = ten; }

    public double getDiem() { return diem; }
    public void setDiem(double diem) { this.diem = diem; }
}
```

Giải thích:

- **`@Entity`** — báo cho JPA: class này ánh xạ tới một bảng (mặc định tên bảng = `student`).
- **`@Id`** — đánh dấu trường khoá chính (định danh duy nhất mỗi dòng).
- **`@GeneratedValue(strategy = IDENTITY)`** — database **tự sinh id** tăng dần (1, 2, 3…), bạn không phải tự gán.
- **Constructor rỗng `public Student() {}`** — JPA cần nó để tạo object khi đọc từ database. **Thiếu nó là một lỗi rất hay gặp.**
- **Getter/setter** — cả Jackson (JSON) và JPA đều dùng để đọc/ghi giá trị.

---

## Bước 3: Repository — truy cập dữ liệu

Đây là phần "ảo diệu" của Spring Data JPA: bạn chỉ cần khai báo một **interface**, không viết code triển khai:

```java
package com.example.quanlysinhvien;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {

    // Spring tự sinh câu truy vấn từ TÊN HÀM!
    List<Student> findByTenContainingIgnoreCase(String ten);
}
```

Giải thích:

- **`extends JpaRepository<Student, Long>`** — kế thừa kho có sẵn cho Entity `Student` với khoá kiểu `Long`. Bạn **được tặng miễn phí** các hàm: `save()`, `findAll()`, `findById()`, `deleteById()`, `count()`…
- **`findByTenContainingIgnoreCase`** — Spring đọc **tên hàm** và tự sinh câu SQL tìm theo tên (chứa chuỗi, không phân biệt hoa thường). Đây gọi là **derived query** — đặt tên đúng quy ước là có truy vấn, không viết SQL.

:::info Không cần viết class triển khai?
Đúng vậy. Spring Data JPA **tự tạo** đối tượng triển khai interface này lúc chạy. Bạn chỉ định nghĩa "muốn gì", Spring lo "làm thế nào".
:::

---

## Bước 4: Controller — các endpoint CRUD

Tạo `StudentController.java` — nơi định nghĩa các endpoint REST:

```java
package com.example.quanlysinhvien;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/students")   // tiền tố chung cho mọi endpoint
public class StudentController {

    private final StudentRepository repo;

    // Spring tự "tiêm" repository vào qua constructor (Dependency Injection)
    public StudentController(StudentRepository repo) {
        this.repo = repo;
    }

    // GET /api/students  → lấy tất cả
    @GetMapping
    public List<Student> getAll() {
        return repo.findAll();
    }

    // GET /api/students/1  → lấy 1 theo id
    @GetMapping("/{id}")
    public ResponseEntity<Student> getOne(@PathVariable Long id) {
        return repo.findById(id)
                .map(ResponseEntity::ok)                       // tìm thấy → 200
                .orElse(ResponseEntity.notFound().build());    // không có → 404
    }

    // POST /api/students  → tạo mới
    @PostMapping
    public Student create(@RequestBody Student student) {
        return repo.save(student);
    }

    // PUT /api/students/1  → cập nhật
    @PutMapping("/{id}")
    public ResponseEntity<Student> update(@PathVariable Long id,
                                          @RequestBody Student moi) {
        return repo.findById(id).map(sv -> {
            sv.setMaSV(moi.getMaSV());
            sv.setTen(moi.getTen());
            sv.setDiem(moi.getDiem());
            return ResponseEntity.ok(repo.save(sv));
        }).orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/students/1  → xoá
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repo.deleteById(id);
        return ResponseEntity.noContent().build();   // 204
    }
}
```

Giải thích các khái niệm mới:

- **`@RequestMapping("/api/students")`** — đặt tiền tố URL chung cho cả class. Mỗi method bên trong nối thêm phần riêng.
- **Dependency Injection (DI):** ta khai báo cần `StudentRepository` ở constructor; Spring **tự tạo và truyền vào**. Bạn không bao giờ phải `new StudentRepository()`. Đây là cơ chế lõi của Spring giúp các thành phần ráp nối lỏng lẻo, dễ thay thế và test.
- **`@PathVariable Long id`** — lấy phần `{id}` trong URL (`/api/students/5` → `id = 5`).
- **`@RequestBody Student student`** — Spring đọc **JSON từ body request** rồi tự chuyển thành object `Student`.
- **`ResponseEntity`** — cho phép bạn kiểm soát **mã trạng thái HTTP** trả về: `ok()` = 200, `notFound()` = 404, `noContent()` = 204. Trả đúng mã giúp Frontend biết kết quả.
- **`findById(...).map(...).orElse(...)`** — `findById` trả về `Optional` (có thể rỗng). `map` chạy khi có dữ liệu, `orElse` chạy khi không — cách xử lý "có/không" an toàn, tránh `NullPointerException`.

---

## Bước 5: Test API bằng curl

Khởi động app, rồi mở terminal test từng endpoint:

```bash
# Tạo mới (POST) — gửi JSON trong body
curl -X POST http://localhost:8080/api/students \
  -H "Content-Type: application/json" \
  -d '{"maSV":"SV001","ten":"Nguyen Van A","diem":8.5}'

# Lấy tất cả (GET)
curl http://localhost:8080/api/students

# Lấy 1 theo id
curl http://localhost:8080/api/students/1

# Cập nhật (PUT)
curl -X PUT http://localhost:8080/api/students/1 \
  -H "Content-Type: application/json" \
  -d '{"maSV":"SV001","ten":"Nguyen Van A","diem":9.0}'

# Xoá (DELETE)
curl -X DELETE http://localhost:8080/api/students/1
```

Giải thích các cờ curl: `-X` chọn phương thức HTTP, `-H` đặt header (báo body là JSON), `-d` là dữ liệu body. Nếu ngại gõ, dùng **Postman** — công cụ test API có giao diện đồ hoạ.

---

## Bước 6: Xem database qua H2 Console

Spring Boot tặng kèm trang web xem database. Mở trình duyệt vào:

```
http://localhost:8080/h2-console
```

Điền đúng các thông số (khớp `application.properties`):

- **JDBC URL:** `jdbc:h2:mem:truongdb`
- **User Name:** `sa`
- **Password:** (để trống)

Bấm **Connect** → bạn thấy bảng `STUDENT` và có thể chạy SQL như `SELECT * FROM STUDENT;` để xem dữ liệu vừa thêm. Rất tiện để kiểm tra dữ liệu có lưu đúng không.

---

## Bước 7: Validation và xử lý lỗi 404

API thực tế phải **từ chối dữ liệu sai** (điểm âm, tên rỗng). Thêm dependency validation vào `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

Gắn ràng buộc lên Entity:

```java
import jakarta.validation.constraints.*;

@NotBlank(message = "Mã SV không được để trống")
private String maSV;

@NotBlank(message = "Tên không được để trống")
private String ten;

@Min(value = 0, message = "Điểm tối thiểu là 0")
@Max(value = 10, message = "Điểm tối đa là 10")
private double diem;
```

Và thêm `@Valid` ở controller để bật kiểm tra:

```java
@PostMapping
public Student create(@Valid @RequestBody Student student) {
    return repo.save(student);
}
```

Giờ nếu gửi `{"diem": 15}`, API trả về lỗi `400 Bad Request` kèm thông báo, thay vì lưu dữ liệu rác. **Không bao giờ tin dữ liệu từ client** — luôn validate ở server.

---

## Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| `No default constructor for entity` | Entity thiếu constructor rỗng | Thêm `public Student() {}` |
| POST trả về 415 Unsupported Media Type | Quên header `Content-Type: application/json` | Thêm `-H "Content-Type: application/json"` |
| Dữ liệu là `null` khi POST | Thiếu getter/setter để Jackson ánh xạ | Bổ sung đủ getter/setter |
| Mất hết dữ liệu sau khi restart | H2 chạy chế độ `mem` (RAM) | Bình thường khi học; muốn giữ thì dùng `jdbc:h2:file:./data/db` |
| H2 console không kết nối được | JDBC URL gõ sai | Phải khớp đúng `jdbc:h2:mem:truongdb` |
| 404 ở mọi endpoint | Controller khác package với Application | Đặt cùng package gốc để bị quét |

---

## Thử thách mở rộng

1. **Tách tầng Service:** thêm class `StudentService` giữa Controller và Repository để chứa logic nghiệp vụ (đúng chuẩn 4 tầng thực tế).
2. **Tìm kiếm:** thêm endpoint `GET /api/students/search?ten=an` dùng hàm `findByTenContainingIgnoreCase` đã khai báo.
3. **Phân trang:** dùng `Pageable` để trả dữ liệu theo trang (`findAll(Pageable)`).
4. **Xử lý lỗi tập trung:** dùng `@RestControllerAdvice` để gom việc xử lý exception về một chỗ, trả JSON lỗi thống nhất.

---

## Tóm tắt

- Backend chuẩn chia **3 tầng**: Controller (HTTP) → Repository (dữ liệu) → Database, với **Entity** ánh xạ class ↔ bảng.
- **`@Entity` + `@Id` + `@GeneratedValue`** biến class thành bảng; nhớ **constructor rỗng**.
- **`JpaRepository`** tặng sẵn CRUD; **derived query** sinh truy vấn từ tên hàm.
- Controller dùng **`@GetMapping`/`@PostMapping`/`@PutMapping`/`@DeleteMapping`**, **`@PathVariable`**, **`@RequestBody`**, **`ResponseEntity`** để điều khiển mã HTTP.
- **Dependency Injection** ráp các thành phần tự động; luôn **validate** dữ liệu client với `@Valid`.

Tiếp theo: [Kết nối Frontend (React/fetch) gọi API](./8_ket-noi-frontend.md).
