---
sidebar_position: 5
title: "5. Integration Testing (Kiểm thử tích hợp)"
---

# 5. Integration Testing (Kiểm thử tích hợp)

Integration testing kiểm tra xem nhiều thành phần khi ghép lại có hoạt động đúng với nhau hay không, dùng phụ thuộc thật (như database) thay vì mock. Nó bắt được những lỗi mà unit test bỏ sót, ví dụ câu SQL sai hay cấu hình kết nối không khớp. Bài này giới thiệu test pyramid, `@SpringBootTest` và Testcontainers; chi tiết nằm bên dưới.

---

## Mục lục

- [Vì sao cần Integration Testing?](#vì-sao-cần-integration-testing)
- [Integration Test là gì?](#integration-test-là-gì)
- [Khác biệt với Unit Test](#khác-biệt-với-unit-test)
- [Kim tự tháp kiểm thử (Test Pyramid)](#kim-tự-tháp-kiểm-thử-test-pyramid)
- [@SpringBootTest trong Spring Boot](#springboottest-trong-spring-boot)
- [Vấn đề: test với database](#vấn-đề-test-với-database)
- [Testcontainers: database thật trong Docker](#testcontainers-database-thật-trong-docker)
- [Ví dụ test repository với database](#ví-dụ-test-repository-với-database)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao cần Integration Testing?

**Vấn đề:** Unit test mock toàn bộ các phụ thuộc (database, service khác, API ngoài), nên mỗi thành phần chạy đúng riêng lẻ mà vẫn có thể lỗi khi ghép thật. Các lỗi điển hình unit test **không bắt được**:

```java
// Unit test: mock repository → luôn pass vì không chạm DB thật
when(userRepository.save(any())).thenReturn(mockUser);

// Nhưng ở production, câu SQL sai kiểu dữ liệu → lỗi ngay khi ghi thật
// Ví dụ: cột `age` trong DB là INTEGER, nhưng entity ánh xạ sang String
@Column(name = "age")
private String age;  // sai kiểu → unit test không phát hiện, DB thật báo lỗi
```

Các tình huống thường gặp:
- Câu SQL sai cú pháp hoặc sai tên cột
- Ánh xạ entity (mapping) không khớp với schema database
- Cấu hình transaction (rollback/commit) sai
- Hai service hiểu sai định dạng dữ liệu truyền qua nhau

**Giải pháp:** Integration Testing chạy nhiều thành phần cùng nhau với **phụ thuộc thật** (database thật, Spring context thật), thường dùng Testcontainers hoặc H2 in-memory để bắt đúng các lỗi ghép nối này:

```java
// Integration test: dùng PostgreSQL thật trong Docker (Testcontainers)
@Testcontainers
@SpringBootTest
class UserRepositoryIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @Autowired
    private UserRepository userRepository;  // repository + DB thật

    @Test
    void luuVaDocLai_phatHienLoi_anhXaSai() {
        User saved = userRepository.save(new User("An", "an@example.com"));
        // Nếu mapping sai kiểu → test fail ngay ở đây, trước khi lên production
        assertNotNull(userRepository.findById(saved.getId()).orElse(null));
    }
}
```

:::tip[Dùng thực tế]
- Kiểm tra repository đọc/ghi database đúng schema và kiểu dữ liệu
- Xác nhận transaction rollback/commit hoạt động đúng khi có lỗi
- Kiểm thử luồng từ Controller → Service → Repository trong Spring Boot
- Phát hiện lỗi cấu hình kết nối (datasource, connection pool) trước khi deploy
:::

## Integration Test là gì?

**Integration Test (kiểm thử tích hợp)** là loại test kiểm tra xem **nhiều thành phần khi ghép lại có hoạt động đúng với nhau hay không**.

Ở bài unit test, ta test **từng phần riêng lẻ** và **mock** mọi phụ thuộc. Nhưng đôi khi mỗi phần chạy đúng riêng lẻ mà ghép lại vẫn sai — ví dụ câu SQL viết sai, cấu hình kết nối database không khớp, hai service hiểu sai định dạng dữ liệu của nhau. Integration test bắt được những lỗi đó.

> Ví dụ đời thường: Mỗi linh kiện xe máy (động cơ, bánh xe, phanh) được kiểm tra riêng đã đạt chuẩn (unit test). Nhưng ta vẫn phải **lắp ráp hoàn chỉnh rồi chạy thử trên đường** để chắc chắn cả chiếc xe hoạt động (integration test).

## Khác biệt với Unit Test

| Tiêu chí | Unit Test | Integration Test |
|----------|-----------|------------------|
| Phạm vi | Một method/class | Nhiều thành phần ghép lại |
| Phụ thuộc | Mock hết (DB, API...) | Dùng thật (DB, service...) |
| Tốc độ | Rất nhanh (mili-giây) | Chậm hơn (giây) |
| Số lượng | Nhiều | Ít hơn |
| Bắt lỗi gì | Logic từng hàm | Lỗi khi ghép nối, cấu hình, SQL |

Cả hai loại đều cần thiết và **bổ sung cho nhau**, không thay thế nhau.

## Kim tự tháp kiểm thử (Test Pyramid)

**Test Pyramid (kim tự tháp kiểm thử)** là một nguyên tắc về tỉ lệ các loại test:

```
        /\
       /  \      E2E Test (ít nhất) - chậm, đắt
      /----\
     /      \    Integration Test (vừa phải)
    /--------\
   /          \  Unit Test (nhiều nhất) - nhanh, rẻ
  /____________\
```

- **Nhiều** unit test ở dưới đáy (nhanh, rẻ).
- **Vừa phải** integration test ở giữa.
- **Ít** end-to-end test (E2E) trên đỉnh (chậm, đắt, dễ vỡ).

Ý tưởng: ưu tiên test nhanh ở tầng thấp, chỉ dùng test chậm cho những luồng quan trọng.

## @SpringBootTest trong Spring Boot

Nếu bạn dùng **Spring Boot** (framework phổ biến để xây dựng ứng dụng Java), annotation **`@SpringBootTest`** sẽ khởi động **toàn bộ ngữ cảnh ứng dụng (application context)** khi test — tức là nạp tất cả các bean (đối tượng do Spring quản lý), cấu hình, kết nối... giống như chạy thật.

```java
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest  // khởi động toàn bộ ứng dụng để test tích hợp
class OrderServiceIntegrationTest {

    @Autowired  // Spring tự tiêm đối tượng thật vào (không phải mock)
    private OrderService orderService;

    @Test
    void serviceDuocNapDung() {
        // Kiểm tra Spring đã tạo và tiêm OrderService thật thành công
        assertNotNull(orderService);
    }
}
```

Khác với unit test (tạo đối tượng bằng `new` và mock thủ công), `@SpringBootTest` dùng **đối tượng thật do Spring tạo**, kết nối thật với nhau.

## Vấn đề: test với database

Integration test thường cần một **database thật** để kiểm tra câu truy vấn. Nhưng dùng database production (thật của hệ thống) thì rất nguy hiểm: test có thể làm hỏng dữ liệu thật.

Các cách xử lý phổ biến:

1. **Database trong bộ nhớ (in-memory)** như **H2**: nhanh, tự xóa sau khi test. Nhược điểm: H2 không giống hệt database thật (ví dụ PostgreSQL), nên đôi khi test pass với H2 nhưng fail với production.
2. **Testcontainers**: chạy database thật (PostgreSQL, MySQL...) trong **Docker container** tạm thời. Đây là cách hiện đại và đáng tin cậy nhất.

## Testcontainers: database thật trong Docker

**Testcontainers** là một thư viện giúp **khởi động database (hoặc dịch vụ khác) thật bên trong Docker container** chỉ phục vụ cho test, rồi tự động dọn dẹp sau khi test xong.

Lợi ích: bạn test với **đúng loại database** dùng ở production (ví dụ PostgreSQL thật), nên kết quả đáng tin cậy. Điều kiện: máy chạy test phải cài **Docker**.

Cài đặt (Maven):

```xml
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>postgresql</artifactId>
    <version>1.19.7</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>junit-jupiter</artifactId>
    <version>1.19.7</version>
    <scope>test</scope>
</dependency>
```

Ví dụ khởi tạo một PostgreSQL container cho test:

```java
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers  // bật tích hợp Testcontainers với JUnit 5
@SpringBootTest
class UserRepositoryIntegrationTest {

    // Khởi động một PostgreSQL thật trong Docker, dùng riêng cho test
    @Container
    static PostgreSQLContainer<?> postgres =
        new PostgreSQLContainer<>("postgres:16")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    // Testcontainers tự cung cấp URL/cổng động, Spring sẽ kết nối tới đây
    // (thường cấu hình qua @DynamicPropertySource)
}
```

> Vì sao không cài PostgreSQL cố định trên máy CI? Vì Testcontainers tự tạo container **sạch** mỗi lần chạy, không lo dữ liệu cũ làm bẩn test, và mọi lập trình viên đều có môi trường giống nhau.

## Ví dụ test repository với database

Giả sử có một `UserRepository` lưu/đọc người dùng từ database. Integration test sẽ ghi vào database thật (trong container) rồi đọc lại để kiểm tra.

```java
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@Testcontainers
@SpringBootTest
class UserRepositoryIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres =
        new PostgreSQLContainer<>("postgres:16");

    @Autowired
    private UserRepository userRepository;  // repository thật, kết nối DB thật

    @Test
    void luuVaTimNguoiDung() {
        // Arrange: tạo người dùng mới
        User user = new User("An", "an@example.com");

        // Act: lưu vào database thật rồi tìm lại theo id
        User saved = userRepository.save(user);
        User found = userRepository.findById(saved.getId()).orElse(null);

        // Assert: dữ liệu đọc lại phải khớp
        assertNotNull(found);                       // tìm thấy
        assertEquals("An", found.getName());        // đúng tên
        assertEquals("an@example.com", found.getEmail()); // đúng email
    }
}
```

Test này bắt được những lỗi mà unit test không thấy: ánh xạ entity (mapping) sai cột, kiểu dữ liệu không khớp, ràng buộc khóa... vì nó dùng database thật.

## Lỗi thường gặp

1. **Lạm dụng `@SpringBootTest`**: Nó khởi động cả ứng dụng nên rất **chậm**. Đừng dùng cho mọi test — chỉ dùng khi thật sự cần kiểm thử tích hợp.
2. **Test phụ thuộc dữ liệu sẵn có**: Nếu test giả định database đã có sẵn vài bản ghi, nó sẽ fail trên môi trường sạch. Mỗi test nên tự tạo dữ liệu mình cần.
3. **Không dọn dữ liệu giữa các test**: Test trước để lại dữ liệu làm hỏng test sau. Dùng transaction rollback hoặc xóa dữ liệu sau mỗi test.
4. **Quên cài Docker khi dùng Testcontainers**: Testcontainers cần Docker đang chạy, nếu không sẽ lỗi ngay khi khởi động container.
5. **Trộn lẫn unit và integration test không phân loại**: Khiến bộ test chạy chậm. Nên tách riêng (ví dụ đặt tên `*IT.java`) để chạy chọn lọc.

## Tóm tắt

- **Integration Test** kiểm tra nhiều thành phần phối hợp với nhau, dùng phụ thuộc **thật** thay vì mock.
- Khác unit test ở chỗ: phạm vi rộng hơn, chậm hơn, ít hơn, nhưng bắt được lỗi ghép nối và cấu hình.
- **Test Pyramid**: nhiều unit test, vừa phải integration test, ít E2E test.
- **`@SpringBootTest`** khởi động toàn bộ ứng dụng Spring Boot cho integration test.
- **Testcontainers** chạy database thật trong Docker container tạm thời, cho kết quả đáng tin cậy (cần Docker).
- Bài tiếp theo: **REST Assured** — test các REST API.
