---
sidebar_position: 17
title: "Mockito - Verifying Behavior"
---

# Mockito — Verifying Behavior (Xác nhận hành vi)

## Verification là gì?

**Verification** (xác nhận hành vi) là bước kiểm tra xem các phương thức của mock có được gọi đúng cách hay không — gọi bao nhiêu lần, với tham số gì, theo thứ tự nào. Đây là một trong hai trụ cột của Mockito (bên cạnh stubbing).

**Tại sao cần verify?**

Stubbing kiểm tra "kết quả trả về", còn verification kiểm tra "hành vi đã xảy ra". Ví dụ: kiểm tra rằng `emailService.sendWelcome()` đã được gọi sau khi đăng ký người dùng thành công.

## 1. `verify()` cơ bản

```java
UserRepository mockRepo = mock(UserRepository.class);
EmailService mockEmail = mock(EmailService.class);
UserService service = new UserService(mockRepo, mockEmail);

service.createUser("Alice", "alice@example.com");

// Xác nhận save() đã được gọi đúng 1 lần (mặc định)
verify(mockRepo).save(any(User.class));

// Xác nhận sendWelcome() đã được gọi với email đúng
verify(mockEmail).sendWelcome("alice@example.com");
```

## 2. Kiểm soát số lần gọi — Verification Modes

```java
EmailService mockEmail = mock(EmailService.class);

// Gọi nhiều lần để test
service.sendNotification("user1");
service.sendNotification("user2");
service.sendNotification("user2"); // Gọi lần 2 cho user2

// times(n) — đúng n lần
verify(mockEmail, times(1)).sendEmail("user1"); // Đúng 1 lần
verify(mockEmail, times(2)).sendEmail("user2"); // Đúng 2 lần

// never() — không được gọi lần nào
verify(mockEmail, never()).sendEmail("user3");

// atLeastOnce() — ít nhất 1 lần
verify(mockEmail, atLeastOnce()).sendEmail(anyString());

// atLeast(n) — ít nhất n lần
verify(mockEmail, atLeast(2)).sendEmail("user2");

// atMost(n) — nhiều nhất n lần
verify(mockEmail, atMost(3)).sendEmail(anyString());

// only() — ĐÂY LÀ phương thức DUY NHẤT được gọi trên mock
verify(mockEmail, only()).sendEmail("user1");
// Fail nếu có bất kỳ phương thức nào khác của mockEmail được gọi
```

## 3. `verifyNoInteractions()` — Mock không được gọi gì

```java
AuditService mockAudit = mock(AuditService.class);

// Khi xảy ra lỗi validation, audit không được gọi
try {
    service.createUser(null, null); // Lỗi validation
} catch (IllegalArgumentException e) {
    // expected
}

// Đảm bảo audit service không được gọi chút nào
verifyNoInteractions(mockAudit);
```

## 4. `verifyNoMoreInteractions()` — Không có gọi nào ngoài dự kiến

```java
UserRepository mockRepo = mock(UserRepository.class);
when(mockRepo.findById(1L)).thenReturn(Optional.of(user));

service.getUser(1L);

// Xác nhận findById được gọi
verify(mockRepo).findById(1L);

// Đảm bảo không có phương thức nào khác của mockRepo được gọi
// (ví dụ: save, delete không được gọi khi chỉ get)
verifyNoMoreInteractions(mockRepo);
```

## 5. `ArgumentCaptor` — Bắt và kiểm tra tham số

**ArgumentCaptor** (bộ bắt tham số) cho phép bắt đối tượng được truyền vào mock để kiểm tra chi tiết hơn:

```java
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private EmailService emailService;

    @Captor
    private ArgumentCaptor<String> emailCaptor;

    @Captor
    private ArgumentCaptor<OrderConfirmationEmail> emailContentCaptor;

    @InjectMocks
    private OrderService orderService;

    @Test
    void testPlaceOrder_guiEmailXacNhan_dungThongTin() {
        Order order = new Order(1L, "Alice", List.of(new Item("Laptop", 999.0)));
        orderService.placeOrder(order);

        // Bắt email được gửi đến
        verify(emailService).sendOrderConfirmation(
            emailCaptor.capture(),
            emailContentCaptor.capture()
        );

        String sentToEmail = emailCaptor.getValue();
        OrderConfirmationEmail emailContent = emailContentCaptor.getValue();

        assertEquals("alice@example.com", sentToEmail);
        assertEquals(1L, emailContent.getOrderId());
        assertTrue(emailContent.getTotal() > 0);
    }

    @Test
    void testPlaceOrder_guiEmailNhieuLan_kiemTraTatCa() {
        orderService.placeOrder(order1);
        orderService.placeOrder(order2);

        // Bắt TẤT CẢ lần gọi
        verify(emailService, times(2)).sendEmail(emailCaptor.capture());
        List<String> allEmails = emailCaptor.getAllValues();

        assertEquals(2, allEmails.size());
        assertTrue(allEmails.contains("user1@example.com"));
        assertTrue(allEmails.contains("user2@example.com"));
    }
}
```

## 6. `InOrder` — Xác nhận thứ tự gọi

```java
UserRepository mockRepo = mock(UserRepository.class);
AuditService mockAudit = mock(AuditService.class);
CacheService mockCache = mock(CacheService.class);

service.updateUser(user);

// Tạo InOrder để kiểm tra thứ tự
InOrder inOrder = inOrder(mockRepo, mockAudit, mockCache);

// Các lệnh verify phải theo đúng thứ tự thực thi
inOrder.verify(mockRepo).save(any(User.class));      // Bước 1: Lưu vào DB
inOrder.verify(mockCache).invalidate(user.getId());  // Bước 2: Xóa cache
inOrder.verify(mockAudit).log("USER_UPDATED", any()); // Bước 3: Ghi audit log
```

## 7. Timeout Verification — Xác nhận trong giới hạn thời gian

Dùng cho các tác vụ bất đồng bộ (asynchronous):

```java
// Xác nhận phương thức được gọi trong vòng 1 giây
verify(mockEmailService, timeout(1000)).sendEmail(anyString());

// Kết hợp với times
verify(mockEmailService, timeout(2000).times(3)).sendEmail(anyString());
```

## 8. Ví dụ thực tế tổng hợp

```java
@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock private PaymentGateway paymentGateway;
    @Mock private OrderRepository orderRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks private PaymentService paymentService;

    @Captor private ArgumentCaptor<PaymentRequest> paymentCaptor;

    @Test
    void testProcessPayment_thanhToanThanhCong_capNhatDonVaThongBao() {
        // Arrange
        Order order = new Order(1L, 500_000.0, "pending");
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(paymentGateway.charge(any())).thenReturn(new PaymentResult(true, "TXN123"));

        // Act
        paymentService.processPayment(1L, "CREDIT_CARD", 500_000.0);

        // Verify thứ tự: load order → charge → update status → notify
        InOrder inOrder = inOrder(orderRepository, paymentGateway, notificationService);
        inOrder.verify(orderRepository).findById(1L);
        inOrder.verify(paymentGateway).charge(paymentCaptor.capture());
        inOrder.verify(orderRepository).save(argThat(o -> "paid".equals(o.getStatus())));
        inOrder.verify(notificationService).sendPaymentSuccess(eq("TXN123"), any());

        // Kiểm tra chi tiết PaymentRequest
        PaymentRequest sentRequest = paymentCaptor.getValue();
        assertEquals(500_000.0, sentRequest.getAmount(), 0.01);
        assertEquals("CREDIT_CARD", sentRequest.getMethod());

        // Đảm bảo không có gì bất thường
        verifyNoMoreInteractions(paymentGateway, notificationService);
    }

    @Test
    void testProcessPayment_thanhToanThatBai_khongCapNhatDon() {
        // Arrange
        Order order = new Order(1L, 500_000.0, "pending");
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(paymentGateway.charge(any())).thenReturn(new PaymentResult(false, null));

        // Act
        paymentService.processPayment(1L, "CREDIT_CARD", 500_000.0);

        // Verify: KHÔNG cập nhật order, KHÔNG gửi thông báo thành công
        verify(orderRepository, never()).save(any());
        verify(notificationService, never()).sendPaymentSuccess(any(), any());
        // Nhưng PHẢI gửi thông báo thất bại
        verify(notificationService).sendPaymentFailed(eq(1L), any());
    }
}
```

## Thuật ngữ quan trọng

| Thuật ngữ | Giải thích |
|---|---|
| **Verification** | Kiểm tra phương thức của mock có được gọi đúng cách không |
| **Verification Mode** | Chế độ xác nhận: `times`, `never`, `atLeast`, `atMost`, ... |
| **ArgumentCaptor** | Bộ bắt tham số để kiểm tra giá trị được truyền vào mock |
| **InOrder** | Đối tượng kiểm tra thứ tự gọi phương thức của các mock |
| **Asynchronous** | Bất đồng bộ — tác vụ chạy trên luồng khác, không đợi kết quả ngay |
| **Interaction** | Lần tương tác (gọi phương thức) giữa code cần test và mock |
