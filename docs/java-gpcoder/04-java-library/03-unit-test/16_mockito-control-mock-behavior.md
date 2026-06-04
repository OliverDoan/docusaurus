---
sidebar_position: 16
title: "Mockito - Control mock's behavior"
---

# Mockito — Control mock's behavior (Kiểm soát hành vi của mock)

## Giới thiệu

Sau khi tạo mock, bước tiếp theo là **stubbing** (định nghĩa hành vi) — chỉ định mock sẽ làm gì khi một phương thức được gọi với các tham số nhất định. Mockito cung cấp nhiều cách để kiểm soát hành vi: trả về giá trị, ném exception, gọi phương thức thật, hoặc thực hiện logic tùy chỉnh.

## 1. `when(...).thenReturn(...)` — Trả về giá trị

Phương thức phổ biến nhất để stub hành vi của mock:

```java
UserRepository mockRepo = mock(UserRepository.class);

// Stub đơn giản
when(mockRepo.findById(1L)).thenReturn(Optional.of(new User(1L, "Alice")));
when(mockRepo.count()).thenReturn(42L);
when(mockRepo.existsById(99L)).thenReturn(false);

// Trả về nhiều giá trị lần lượt
when(mockRepo.count())
    .thenReturn(0L)    // Lần gọi 1
    .thenReturn(1L)    // Lần gọi 2
    .thenReturn(2L);   // Lần gọi 3 và mọi lần sau

Long first  = mockRepo.count(); // 0
Long second = mockRepo.count(); // 1
Long third  = mockRepo.count(); // 2
Long fourth = mockRepo.count(); // 2 (giá trị cuối được giữ lại)
```

## 2. `when(...).thenThrow(...)` — Ném exception

```java
// Ném exception khi gọi phương thức
when(mockRepo.findById(-1L))
    .thenThrow(new IllegalArgumentException("ID không hợp lệ"));

when(mockRepo.save(null))
    .thenThrow(IllegalArgumentException.class); // Có thể truyền class exception

// Ném lần lượt
when(mockRepo.findAll())
    .thenReturn(Collections.emptyList())          // Lần 1: trả về danh sách rỗng
    .thenThrow(new DatabaseException("Mất kết nối")); // Lần 2: ném exception
```

## 3. `doReturn(...)` và `doThrow(...)` — Cú pháp thay thế

Dùng `doReturn()`/`doThrow()` khi stub phương thức `void` hoặc stub **spy**:

```java
// doThrow với phương thức void
doThrow(new RuntimeException("Lỗi gửi email"))
    .when(mockEmailService)
    .sendEmail(anyString()); // sendEmail là void — không thể dùng when().thenThrow()

// doNothing với phương thức void (mặc định của mock, nhưng rõ ràng hơn)
doNothing().when(mockEmailService).sendEmail(anyString());

// doReturn với Spy — tránh gọi phương thức thật khi stub
List<String> spyList = spy(new ArrayList<>());
// ĐÚNG: doReturn không gọi phương thức thật khi setup
doReturn(100).when(spyList).size();
// SAI: when().thenReturn() sẽ gọi thật size() trước khi stub, có thể gây lỗi
// when(spyList.size()).thenReturn(100); // Gọi thật trước — có thể không mong muốn
```

## 4. `thenAnswer(...)` — Logic tùy chỉnh

`thenAnswer` cho phép bạn định nghĩa logic phức tạp hơn cho giá trị trả về:

```java
// Trả về giá trị dựa trên tham số đầu vào
when(mockRepo.findById(anyLong())).thenAnswer(invocation -> {
    Long id = invocation.getArgument(0); // Lấy tham số thứ 0
    if (id > 0) {
        return Optional.of(new User(id, "User " + id));
    }
    return Optional.empty();
});

// Ví dụ: mock save() trả về đối tượng đầu vào với ID được set
when(mockRepo.save(any(User.class))).thenAnswer(invocation -> {
    User user = invocation.getArgument(0);
    user.setId(System.currentTimeMillis()); // Gán ID ngẫu nhiên
    return user;
});
```

## 5. `thenCallRealMethod()` — Gọi phương thức thật

Hữu ích khi mock một lớp cụ thể và muốn một số phương thức vẫn chạy thật:

```java
Calculator mockCalc = mock(Calculator.class);

// add() sẽ gọi phương thức thật của Calculator
when(mockCalc.add(anyInt(), anyInt())).thenCallRealMethod();

// multiply() vẫn là mock — trả về 0 mặc định
int sum = mockCalc.add(2, 3); // 5 — gọi thật
int product = mockCalc.multiply(2, 3); // 0 — mock mặc định
```

## 6. Argument Matchers — So khớp tham số linh hoạt

```java
UserRepository mockRepo = mock(UserRepository.class);

// any() — bất kỳ đối tượng nào
when(mockRepo.save(any(User.class))).thenReturn(savedUser);

// anyString(), anyInt(), anyLong(), anyBoolean()
when(mockRepo.findByEmail(anyString())).thenReturn(Optional.empty());

// eq() — chính xác giá trị
when(mockRepo.findById(eq(1L))).thenReturn(Optional.of(admin));
when(mockRepo.findById(eq(2L))).thenReturn(Optional.of(normalUser));

// isNull() / isNotNull()
when(mockRepo.findByEmail(isNull())).thenThrow(NullPointerException.class);

// startsWith, contains (cho String)
when(mockService.process(startsWith("VIP_"))).thenReturn(premiumResult);

// argThat — điều kiện tùy chỉnh
when(mockRepo.save(argThat(user -> user.getAge() >= 18)))
    .thenReturn(adultUser);
```

**Lưu ý quan trọng**: Khi dùng argument matcher cho một tham số, TẤT CẢ tham số còn lại cũng phải dùng matcher:

```java
// ĐÚNG — tất cả dùng matcher
when(mockService.process(eq("key"), anyInt())).thenReturn("result");

// SAI — mix giá trị thường với matcher
// when(mockService.process("key", anyInt())).thenReturn("result"); // Lỗi!
```

## 7. Stubbing với điều kiện phức tạp

```java
// Ví dụ: mock tính phí vận chuyển theo tình huống
when(shippingService.calculateFee(any(Order.class))).thenAnswer(inv -> {
    Order order = inv.getArgument(0);
    double totalAmount = order.getTotalAmount();

    if (totalAmount >= 500_000) {
        return 0.0;     // Miễn phí vận chuyển
    } else if (totalAmount >= 200_000) {
        return 15_000.0; // Phí vận chuyển thấp
    } else {
        return 30_000.0; // Phí vận chuyển đầy đủ
    }
});
```

## 8. Reset mock

```java
UserRepository mockRepo = mock(UserRepository.class);
when(mockRepo.count()).thenReturn(5L);

// Reset — xóa tất cả stubbing và verification history
reset(mockRepo);

// Sau reset — hành vi về mặc định
Long count = mockRepo.count(); // 0 (giá trị mặc định của Long)
```

## 9. Default Return Values

Giá trị mặc định khi phương thức không được stub:

| Kiểu trả về | Giá trị mặc định |
|---|---|
| `int`, `long`, `double`, ... | `0` |
| `boolean` | `false` |
| `String` | `null` |
| Object | `null` |
| `List`, `Set`, `Map` | Collection rỗng |
| `Optional` | `Optional.empty()` |

## Thuật ngữ quan trọng

| Thuật ngữ | Giải thích |
|---|---|
| **Stubbing** | Định nghĩa hành vi cho mock khi một phương thức được gọi |
| **thenAnswer** | Cung cấp logic động cho giá trị trả về dựa trên tham số |
| **Argument Matcher** | Bộ so khớp tham số, dùng thay cho giá trị chính xác |
| **invocation** | Lần gọi phương thức, chứa thông tin về tham số đã truyền |
| **void method** | Phương thức không có giá trị trả về |
| **reset** | Xóa toàn bộ stubbing và lịch sử gọi của mock |
