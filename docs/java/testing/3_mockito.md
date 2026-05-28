---
sidebar_position: 3
title: "3. Mockito (Mocking)"
---

# Mockito -- Framework Mock phổ biến nhất

**Mockito** là framework **mocking** Java -- tạo "đối tượng giả" thay cho dependency thật. Giúp test **độc lập** với DB, network, third-party service. **#1** library mocking trong Java.

**Tương tự đơn giản:** Khi test xe ô tô mới, bạn không lái thật trên đường -- mà dùng **dummy** (manequin) và **simulator**. Mockito giống simulator -- giả lập DB, API service... để test logic của bạn không phụ thuộc môi trường thật.

---

## Mục lục

- [1. Mock là gì?](#1-mock-là-gì)
- [2. Cài đặt](#2-cài-đặt)
- [3. Tạo Mock](#3-tạo-mock)
- [4. Stub -- thiết lập behavior](#4-stub-thiết-lập-behavior)
- [5. Verify -- kiểm tra tương tác](#5-verify-kiểm-tra-tương-tác)
- [6. ArgumentMatcher và ArgumentCaptor](#6-argumentmatcher-và-argumentcaptor)
- [7. Spy -- mock một phần](#7-spy-mock-một-phần)
- [8. Test với Spring](#8-test-với-spring)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Mock là gì?

**Mock** = đối tượng giả implement cùng interface/class với object thật, nhưng:

- Trả về giá trị **bạn định nghĩa**
- Ghi nhận **cách bị gọi** -- verify được

### Lý do mock

```java
class UserService {
    private final UserRepository repo;
    private final EmailService email;

    public User register(User user) {
        User saved = repo.save(user);
        email.send(saved.getEmail(), "Welcome");
        return saved;
    }
}
```

Test `register` không thể:

- Gọi DB thật (chậm, side effect)
- Gửi email thật (production!)

-> Dùng mock `UserRepository` và `EmailService`.

---

## 2. Cài đặt

```xml
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-core</artifactId>
    <version>5.7.0</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-junit-jupiter</artifactId>
    <version>5.7.0</version>
    <scope>test</scope>
</dependency>
```

---

## 3. Tạo Mock

```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository repo;

    @Mock
    private EmailService email;

    @InjectMocks  // tu inject mock vao
    private UserService service;

    @Test
    void register_savesUserAndSendsEmail() {
        // Arrange
        User user = new User("Alice", "alice@example.com");
        when(repo.save(any(User.class))).thenReturn(user);

        // Act
        User result = service.register(user);

        // Assert
        verify(repo).save(user);
        verify(email).send("alice@example.com", "Welcome");
        assertEquals("Alice", result.getName());
    }
}
```

### Cách khác tạo mock

```java
// Static method
UserRepository repo = mock(UserRepository.class);

// MockitoAnnotations
@Mock UserRepository repo;
MockitoAnnotations.openMocks(this);
```

---

## 4. Stub -- thiết lập behavior

```java
// Return gia tri
when(repo.findById(1L)).thenReturn(Optional.of(user));

// Return nhieu lan khac nhau
when(repo.count())
    .thenReturn(10L)
    .thenReturn(11L)
    .thenReturn(12L);

// Throw exception
when(repo.findById(0L)).thenThrow(new IllegalArgumentException());

// Void method -- thenThrow
doThrow(new RuntimeException()).when(email).send(anyString(), anyString());

// Do nothing (mac dinh cho void)
doNothing().when(email).send(anyString(), anyString());

// Answer dong
when(repo.save(any())).thenAnswer(invocation -> {
    User u = invocation.getArgument(0);
    u.setId(1L);
    return u;
});
```

---

## 5. Verify -- kiểm tra tương tác

```java
// Goi 1 lan
verify(repo).save(user);

// Goi N lan
verify(repo, times(2)).findById(1L);

// Khong goi
verify(email, never()).send(anyString(), anyString());

// Goi it nhat
verify(repo, atLeast(1)).save(any());
verify(repo, atLeastOnce()).save(any());

// Goi nhieu nhat
verify(repo, atMost(3)).save(any());

// Thu tu
InOrder inOrder = inOrder(repo, email);
inOrder.verify(repo).save(any());
inOrder.verify(email).send(anyString(), anyString());

// Khong con tuong tac khac
verifyNoMoreInteractions(repo);

// Khong tuong tac nao
verifyNoInteractions(email);
```

---

## 6. ArgumentMatcher và ArgumentCaptor

### ArgumentMatcher

```java
// Bat ky
when(repo.findById(anyLong())).thenReturn(Optional.empty());
when(repo.save(any(User.class))).thenReturn(user);

// Cu the
when(repo.findByEmail(eq("alice@example.com"))).thenReturn(Optional.of(user));

// Combine -- neu dung anyXxx() cho 1 tham so, MOI tham so phai dung matcher
when(repo.update(eq(1L), any(User.class))).thenReturn(user);

// Custom matcher
when(repo.findByCondition(argThat(u -> u.getAge() > 18))).thenReturn(List.of());
```

### ArgumentCaptor -- bắt argument để verify

```java
ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
verify(repo).save(captor.capture());

User saved = captor.getValue();
assertEquals("Alice", saved.getName());
assertNotNull(saved.getCreatedAt());

// Multiple
verify(repo, times(2)).save(captor.capture());
List<User> allValues = captor.getAllValues();
```

---

## 7. Spy -- mock một phần

`Spy` = object thật + có thể override method.

```java
List<String> list = spy(new ArrayList<>());

list.add("a");
list.add("b");
System.out.println(list.size()); // 2 -- goi method that

// Override
doReturn(100).when(list).size();
System.out.println(list.size()); // 100

verify(list).add("a"); // van verify duoc
```

**Khi nào dùng:** Test legacy code phức tạp, không muốn mock toàn bộ.

---

## 8. Test với Spring

```java
// Unit test service -- chi mock dependency
@ExtendWith(MockitoExtension.class)
class UserServiceTest { ... }

// Integration test voi Spring context
@SpringBootTest
class UserServiceIntegrationTest {

    @Autowired UserService service;

    @MockBean      // mock bean trong Spring context
    UserRepository repo;

    @Test
    void test() {
        when(repo.findById(1L)).thenReturn(Optional.of(user));
        // ...
    }
}

// Controller test (chi tang web)
@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired MockMvc mockMvc;
    @MockBean UserService service;

    @Test
    void getUser() throws Exception {
        when(service.findById(1L)).thenReturn(Optional.of(user));

        mockMvc.perform(get("/api/users/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Alice"));
    }
}
```

---

## Khi nào dùng?

- **Dùng Mockito khi:**
  - Test class có dependency (Repository, Service, API client)
  - Cần test exception handling
  - Cần verify cách gọi (số lần, thứ tự)
- **Không nên mock khi:**
  - Object đơn giản (DTO, value object)
  - Static method (Mockito 3+ có `mockStatic` nhưng tránh)
  - Final class/method (cần config riêng)
- **Best practice:**
  - **Constructor injection** -- dễ mock
  - **Don't mock what you don't own** -- mock interface của bạn, không mock third-party
  - **Argument captor** thay cho verify với matcher phức tạp
  - Reset hiếm dùng -- tạo mock mới mỗi test

---

## Lỗi thường gặp

### Lỗi 1: Stub method không bị gọi

```java
when(repo.findById(1L)).thenReturn(Optional.of(user));
service.someOtherMethod(); // khong goi findById -> stub khong duoc dung
// Khong loi nhung cung khong test dung gi
```

### Lỗi 2: Mix `any()` và giá trị thật

```java
// SAI -- mix any va literal
when(repo.update(any(), 1L)); // CompileError or wrong

// DUNG -- moi tham so dung matcher
when(repo.update(any(), eq(1L)));
```

### Lỗi 3: Verify trên void

```java
// SAI -- void khong return
when(email.send(anyString(), anyString())).thenReturn(null);

// DUNG
doNothing().when(email).send(anyString(), anyString());
// Hoac
doThrow(new RuntimeException()).when(email).send(anyString(), anyString());
```

### Lỗi 4: Mock final class

```java
// Mac dinh khong mock duoc
final class Util { ... }

// Can config mockito-inline
<dependency>
    <artifactId>mockito-inline</artifactId>
</dependency>
```

### Lỗi 5: NullPointer khi gọi method chưa stub

```java
UserRepository repo = mock(UserRepository.class);
// Khong stub -- mac dinh tra null/0/false
User u = repo.findById(1L).get(); // NPE -- Optional null
```

Mock trả default: null cho object, 0 cho primitive, empty collection. Phải stub các method gọi.

---

## Câu hỏi phỏng vấn

### Câu 1: Mock, Stub, Spy khác gì?

**Trả lời:**

- **Stub**: định nghĩa giá trị trả về (test state)
- **Mock**: stub + ghi nhận interaction (test behavior)
- **Spy**: object thật + có thể override một số method

Trong Mockito, `mock()` tạo mock thuần. `spy()` tạo spy.

### Câu 2: `when().thenReturn()` vs `doReturn().when()`?

**Trả lời:**

- `when(mock.method()).thenReturn(value)` -- thông dụng, method được gọi
- `doReturn(value).when(mock).method()` -- gọi mock.method() **không** thực sự chạy, dùng cho:
  - Void method (`doNothing`, `doThrow`)
  - Spy (tránh chạy method thật)
  - Khi method throw exception ngay khi gọi

### Câu 3: `@Mock` vs `@MockBean`?

**Trả lời:**

- `@Mock` (Mockito): mock thường, dùng trong unit test
- `@MockBean` (Spring): mock bean trong Spring context, dùng trong `@SpringBootTest`/`@WebMvcTest`

`@MockBean` replace bean thật trong context.

### Câu 4: ArgumentCaptor dùng để làm gì?

**Trả lời:** Bắt argument được pass vào mock để **verify chi tiết**. Hữu ích khi argument là object complex -- verify từng field thay vì viết equals/hashCode.

```java
verify(repo).save(captor.capture());
User saved = captor.getValue();
assertThat(saved.getName()).isEqualTo("Alice");
assertThat(saved.getCreatedAt()).isNotNull();
```

### Câu 5: Mock static method?

**Trả lời:** Từ Mockito 3.4+ có `mockStatic`:

```java
try (MockedStatic<Util> mock = mockStatic(Util.class)) {
    mock.when(Util::random).thenReturn(42);
    // test
}
```

Cần `mockito-inline`. Tuy nhiên, **anti-pattern** -- static khó test là dấu hiệu code cần refactor.
