---
sidebar_position: 4
title: "4. Mockito (Mocking)"
---

# 4. Mockito (Mocking)

---

## Mục lục

- [Mock (đối tượng giả lập) là gì?](#mock-đối-tượng-giả-lập-là-gì)
- [Vì sao cần mock khi test?](#vì-sao-cần-mock-khi-test)
- [Mockito là gì và cài đặt](#mockito-là-gì-và-cài-đặt)
- [Tạo mock và when().thenReturn()](#tạo-mock-và-whenthenreturn)
- [verify(): kiểm tra hành vi đã được gọi](#verify-kiểm-tra-hành-vi-đã-được-gọi)
- [@Mock và @InjectMocks](#mock-và-injectmocks)
- [Ví dụ đầy đủ: test một Service](#ví-dụ-đầy-đủ-test-một-service)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Mock (đối tượng giả lập) là gì?

**Mock (đối tượng giả lập)** là một đối tượng "đóng giả" một đối tượng thật, dùng riêng cho việc test. Bạn ra lệnh cho mock: "Khi ai đó gọi phương thức này với tham số kia, hãy trả về kết quả này" — mà không cần chạy code thật bên trong.

> Ví dụ đời thường: Khi quay phim, người ta dùng **diễn viên đóng thế (stunt double)** cho các pha nguy hiểm thay vì diễn viên chính. Mock cũng giống vậy: nó đóng thế cho đối tượng thật trong những tình huống mà dùng đồ thật thì khó, chậm, hoặc nguy hiểm.

## Vì sao cần mock khi test?

Trong thực tế, một lớp thường **phụ thuộc (depend on)** vào lớp khác. Ví dụ một `UserService` (dịch vụ người dùng) cần một `UserRepository` (kho dữ liệu) để truy vấn database.

Nếu test thật, ta gặp vấn đề:

- **Chậm**: Gọi database/API thật mất thời gian.
- **Khó kiểm soát**: Database thật có thể thay đổi, mạng có thể lỗi → test lúc pass lúc fail.
- **Tốn kém / nguy hiểm**: Gọi API gửi email thật, trừ tiền thật trong khi test thì rất tệ.

Giải pháp: thay các phụ thuộc đó bằng **mock**. Như vậy ta chỉ test **riêng logic của lớp đang quan tâm**, không bị ảnh hưởng bởi database hay mạng.

```java
// UserService phụ thuộc vào UserRepository (để lấy dữ liệu)
public class UserService {
    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;  // nhận phụ thuộc từ bên ngoài
    }

    public String getUserName(int id) {
        User user = repository.findById(id);  // gọi database -> ta sẽ mock chỗ này
        if (user == null) {
            return "Không tìm thấy";
        }
        return user.getName();
    }
}
```

## Mockito là gì và cài đặt

**Mockito** là thư viện **mocking (giả lập)** phổ biến nhất trong Java. Nó giúp tạo mock và kiểm tra hành vi một cách gọn gàng.

Cài đặt với **Maven**:

```xml
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-core</artifactId>
    <version>5.11.0</version>
    <scope>test</scope>
</dependency>
<!-- Tích hợp Mockito với JUnit 5 -->
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-junit-jupiter</artifactId>
    <version>5.11.0</version>
    <scope>test</scope>
</dependency>
```

Cài đặt với **Gradle**:

```groovy
testImplementation 'org.mockito:mockito-core:5.11.0'
testImplementation 'org.mockito:mockito-junit-jupiter:5.11.0'
```

## Tạo mock và when().thenReturn()

Hai bước cơ bản khi dùng Mockito:

1. **`mock(...)`**: tạo một đối tượng giả.
2. **`when(...).thenReturn(...)`**: dạy cho mock biết trả về gì khi được gọi (gọi là **stubbing** — gắn hành vi giả).

```java
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;

class UserServiceTest {

    @Test
    void testGetUserName() {
        // 1. Arrange: tạo mock cho UserRepository (không cần database thật)
        UserRepository repoMock = mock(UserRepository.class);

        // Dạy mock: khi gọi findById(1) thì trả về một User tên "An"
        when(repoMock.findById(1)).thenReturn(new User(1, "An"));

        // Đưa mock vào service cần test
        UserService service = new UserService(repoMock);

        // 2. Act: gọi phương thức cần kiểm tra
        String ten = service.getUserName(1);

        // 3. Assert: kiểm tra kết quả
        assertEquals("An", ten);
    }
}
```

Lưu ý: mock **không chạy** code thật của `UserRepository`. Nó chỉ làm đúng những gì ta "dạy" qua `when().thenReturn()`. Nhờ vậy test rất nhanh và ổn định.

Ta cũng có thể dạy mock **ném ngoại lệ**:

```java
// Khi gọi findById(999), mock sẽ ném ra ngoại lệ (mô phỏng lỗi database)
when(repoMock.findById(999)).thenThrow(new RuntimeException("Lỗi DB"));
```

## verify(): kiểm tra hành vi đã được gọi

Đôi khi ta không chỉ quan tâm **kết quả trả về**, mà còn muốn chắc chắn rằng **một phương thức đã được gọi** (hoặc không được gọi). Dùng **`verify(...)`**.

```java
@Test
void testGoiSave() {
    UserRepository repoMock = mock(UserRepository.class);
    UserService service = new UserService(repoMock);

    // Act: tạo người dùng mới
    service.createUser("Bình");

    // Verify: kiểm tra repository.save(...) đã được gọi đúng 1 lần
    verify(repoMock, times(1)).save(any(User.class));

    // Có thể kiểm tra KHÔNG được gọi:
    verify(repoMock, never()).delete(anyInt());
}
```

Một vài "matcher" (bộ so khớp tham số) hữu ích: `any()` (bất kỳ giá trị nào), `anyInt()`, `eq(value)` (đúng giá trị này). Đây gọi là **behavior verification** (kiểm tra hành vi) — khác với **state verification** (kiểm tra trạng thái/kết quả).

## @Mock và @InjectMocks

Thay vì gọi `mock(...)` thủ công, ta có thể dùng annotation cho gọn:

- **`@Mock`**: tự tạo một mock cho biến đó.
- **`@InjectMocks`**: tạo đối tượng thật và **tự động nhét (inject)** các mock vào.

Để annotation hoạt động với JUnit 5, thêm `@ExtendWith(MockitoExtension.class)` lên lớp test.

```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(MockitoExtension.class)  // kích hoạt @Mock, @InjectMocks
class UserServiceTest {

    @Mock                       // tạo mock cho repository
    private UserRepository repository;

    @InjectMocks                // tạo UserService và nhét repository mock vào
    private UserService service;

    @Test
    void testGetUserName() {
        // Dạy mock trả về User tên "An" khi tìm id = 1
        when(repository.findById(1)).thenReturn(new User(1, "An"));

        String ten = service.getUserName(1);

        assertEquals("An", ten);
    }
}
```

Cách này gọn hơn nhiều khi service có nhiều phụ thuộc.

## Ví dụ đầy đủ: test một Service

Giả sử có lớp `OrderService` (dịch vụ đơn hàng) phụ thuộc vào hai thành phần: kho đơn hàng và dịch vụ gửi email.

```java
public class OrderService {
    private final OrderRepository orderRepo;   // lưu đơn hàng
    private final EmailService emailService;   // gửi email xác nhận

    public OrderService(OrderRepository orderRepo, EmailService emailService) {
        this.orderRepo = orderRepo;
        this.emailService = emailService;
    }

    public boolean placeOrder(Order order) {
        if (order.getAmount() <= 0) {
            return false;  // đơn hàng không hợp lệ
        }
        orderRepo.save(order);                       // lưu vào DB
        emailService.send(order.getEmail(), "Đặt hàng thành công"); // gửi mail
        return true;
    }
}
```

Test với Mockito:

```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock private OrderRepository orderRepo;   // mock kho đơn hàng
    @Mock private EmailService emailService;   // mock dịch vụ email (không gửi mail thật)
    @InjectMocks private OrderService service; // tự nhét 2 mock vào service

    @Test
    void datHangThanhCong() {
        Order order = new Order(100, "an@example.com");  // đơn hàng hợp lệ

        boolean ketQua = service.placeOrder(order);

        assertTrue(ketQua);                              // phải thành công
        verify(orderRepo).save(order);                   // đã lưu đơn hàng
        verify(emailService).send("an@example.com", "Đặt hàng thành công"); // đã gửi mail
    }

    @Test
    void datHangThatBaiKhiSoTienAm() {
        Order order = new Order(-5, "an@example.com");   // số tiền âm -> không hợp lệ

        boolean ketQua = service.placeOrder(order);

        assertFalse(ketQua);                             // phải thất bại
        verify(orderRepo, never()).save(any());          // KHÔNG được lưu
        verify(emailService, never()).send(any(), any()); // KHÔNG gửi mail
    }
}
```

Nhờ mock, ta test được logic của `OrderService` mà **không cần database thật và không gửi email thật**.

## Lỗi thường gặp

1. **Quên `@ExtendWith(MockitoExtension.class)`**: Khi đó `@Mock`/`@InjectMocks` không được khởi tạo, biến mock sẽ là `null`.
2. **Stub thừa không dùng đến**: Mockito (strict mode) báo lỗi `UnnecessaryStubbingException` khi bạn `when(...)` nhưng không dùng. Chỉ stub những gì test cần.
3. **Cố mock final class/method (phiên bản cũ)**: Một số phiên bản Mockito cũ không mock được lớp/phương thức `final`. Mockito mới đã hỗ trợ tốt hơn.
4. **Lẫn lộn mock và đối tượng thật**: Quên đưa mock vào service (vẫn dùng repository thật) khiến test gọi database thật.
5. **Verify quá nhiều chi tiết**: Kiểm tra mọi lời gọi nhỏ khiến test "giòn" (dễ vỡ khi refactor). Chỉ verify những hành vi quan trọng.

## Tóm tắt

- **Mock** là đối tượng giả lập, đóng thế đối tượng thật khi test.
- Mock giúp test **nhanh, ổn định, an toàn** khi lớp có phụ thuộc vào database, API, email...
- **Mockito** là thư viện mocking phổ biến nhất của Java.
- **`mock(...)`** tạo mock; **`when(...).thenReturn(...)`** dạy mock trả về giá trị.
- **`verify(...)`** kiểm tra một phương thức đã (hoặc chưa) được gọi.
- **`@Mock`** + **`@InjectMocks`** (kèm `@ExtendWith(MockitoExtension.class)`) giúp viết test gọn hơn.
- Bài tiếp theo: **Integration Testing** — kiểm thử nhiều thành phần phối hợp với nhau.
