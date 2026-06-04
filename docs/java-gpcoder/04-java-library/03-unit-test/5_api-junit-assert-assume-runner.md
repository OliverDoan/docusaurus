---
sidebar_position: 5
title: "Một số API của JUnit - Assert, Assume, Test Runner"
---

# Một số API của JUnit — Assert, Assume, Test Runner

## 1. Assert — Xác nhận kết quả

**Assert** (xác nhận) là lớp cung cấp các phương thức kiểm tra điều kiện trong test. Nếu điều kiện sai, test sẽ **fail** ngay lập tức và ném ra `AssertionError`.

### Các phương thức Assert phổ biến trong JUnit 4

```java
import static org.junit.Assert.*;

public class AssertExamplesTest {

    // assertEquals — kiểm tra hai giá trị bằng nhau
    @Test
    public void testEquals() {
        assertEquals("Thông báo khi fail", 10, 5 + 5);
        assertEquals(3.14, Math.PI, 0.01); // delta — sai số cho phép với số thực
        assertEquals("hello", "hel" + "lo");
    }

    // assertNotEquals — kiểm tra hai giá trị KHÔNG bằng nhau
    @Test
    public void testNotEquals() {
        assertNotEquals(10, 5 + 3);
    }

    // assertTrue / assertFalse — kiểm tra điều kiện boolean
    @Test
    public void testBoolean() {
        assertTrue("Danh sách không được rỗng", list.size() > 0);
        assertFalse("Chuỗi không được null", str == null);
    }

    // assertNull / assertNotNull — kiểm tra null
    @Test
    public void testNull() {
        String s = null;
        assertNull("Phải là null", s);

        String name = "Alice";
        assertNotNull("Không được null", name);
    }

    // assertSame / assertNotSame — kiểm tra cùng tham chiếu (reference) trong bộ nhớ
    @Test
    public void testSameReference() {
        String a = "hello";
        String b = a; // b trỏ đến cùng đối tượng với a
        assertSame(a, b); // pass — cùng tham chiếu

        String c = new String("hello");
        assertNotSame(a, c); // pass — khác tham chiếu dù nội dung giống nhau
    }

    // assertArrayEquals — kiểm tra hai mảng bằng nhau
    @Test
    public void testArrayEquals() {
        int[] expected = {1, 2, 3};
        int[] actual = {1, 2, 3};
        assertArrayEquals(expected, actual);
    }

    // fail — buộc test thất bại
    @Test
    public void testFail() {
        try {
            riskyMethod();
            fail("Phải ném Exception nhưng không ném");
        } catch (Exception e) {
            assertEquals("Lỗi mong đợi", e.getMessage());
        }
    }
}
```

### Assert trong JUnit 5

JUnit 5 dùng lớp `Assertions` thay cho `Assert`, bổ sung thêm nhiều phương thức:

```java
import static org.junit.jupiter.api.Assertions.*;

class AssertionsJUnit5Test {

    @Test
    void testAssertAll_nhomNhieuAssertions() {
        // assertAll — chạy TẤT CẢ assertions dù có fail, rồi báo cáo tất cả lỗi
        assertAll("Kiểm tra người dùng",
            () -> assertEquals("Alice", user.getName()),
            () -> assertEquals(25, user.getAge()),
            () -> assertNotNull(user.getEmail())
        );
    }

    @Test
    void testAssertThrows_kiemTraException() {
        // assertThrows — kiểm tra exception được ném ra
        ArithmeticException exception = assertThrows(
            ArithmeticException.class,
            () -> divide(10, 0)
        );
        assertEquals("/ by zero", exception.getMessage());
    }

    @Test
    void testAssertTimeout_kiemTraThoiGian() {
        // assertTimeout — kiểm tra hoàn thành trong giới hạn thời gian
        assertTimeout(Duration.ofMillis(500), () -> {
            performFastOperation();
        });
    }
}
```

## 2. Assume — Giả định điều kiện

**Assume** (giả định) cho phép bỏ qua một test nếu điều kiện môi trường không thỏa mãn. Khác với `Assert` (làm test fail), `Assume` chỉ bỏ qua (skip) test mà không coi là lỗi.

```java
import org.junit.Assume;
import org.junit.Test;

public class AssumeExamplesTest {

    @Test
    public void testFeatureChiTrenLinux() {
        // Bỏ qua test nếu không chạy trên Linux
        Assume.assumeTrue(
            "Test này chỉ chạy trên Linux",
            System.getProperty("os.name").toLowerCase().contains("linux")
        );

        // Nếu đang chạy trên Linux, tiếp tục test
        assertTrue(LinuxUtils.isAvailable());
    }

    @Test
    public void testKetNoiDatabase() {
        // Bỏ qua nếu không có kết nối database (môi trường CI)
        Assume.assumeNotNull(System.getenv("DATABASE_URL"));

        // Tiếp tục test nếu có biến môi trường DATABASE_URL
        assertNotNull(DatabaseService.getConnection());
    }

    @Test
    public void testAssumeNoException() {
        // Bỏ qua test nếu có ngoại lệ xảy ra khi thiết lập điều kiện
        Assume.assumeNoException(() -> externalService.connect());

        assertTrue(externalService.isConnected());
    }
}
```

**Khi nào dùng Assume?**
- Test phụ thuộc vào môi trường cụ thể (Windows/Linux/macOS).
- Test cần dịch vụ bên ngoài chỉ có trong một số môi trường.
- Test đang được phát triển và chưa sẵn sàng chạy trong mọi điều kiện.

## 3. Test Runner — Bộ chạy test

**Test Runner** (bộ chạy test) là thành phần chịu trách nhiệm tìm, khởi tạo và thực thi các lớp test. JUnit 4 sử dụng annotation `@RunWith` để chỉ định runner.

### BlockJUnit4ClassRunner (mặc định)

Runner mặc định khi không khai báo `@RunWith`:

```java
// Hai lớp dưới đây tương đương nhau
public class MyTest { ... }

@RunWith(BlockJUnit4ClassRunner.class)
public class MyTest { ... }
```

### Parameterized Runner

Chạy cùng một test với nhiều bộ dữ liệu khác nhau:

```java
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;

@RunWith(Parameterized.class)
public class FibonacciTest {

    @Parameterized.Parameters
    public static Collection<Object[]> data() {
        return Arrays.asList(new Object[][] {
            { 0, 0 }, { 1, 1 }, { 2, 1 }, { 3, 2 }, { 4, 3 }
        });
    }

    private int input;
    private int expected;

    public FibonacciTest(int input, int expected) {
        this.input = input;
        this.expected = expected;
    }

    @Test
    public void testFibonacci() {
        assertEquals(expected, MathUtils.fibonacci(input));
    }
}
```

### Suite Runner

Gom nhiều lớp test vào một suite để chạy cùng nhau:

```java
import org.junit.runner.RunWith;
import org.junit.runners.Suite;

@RunWith(Suite.class)
@Suite.SuiteClasses({
    CalculatorTest.class,
    StringUtilsTest.class,
    BankAccountTest.class
})
public class AllTests {
    // Lớp này trống — chỉ cần annotation
}
```

### MockitoJUnitRunner — Runner tích hợp Mockito

```java
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;
import org.mockito.Mock;
import org.mockito.InjectMocks;

@RunWith(MockitoJUnitRunner.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository; // Tự động tạo mock

    @InjectMocks
    private UserService userService; // Tự động inject mock vào đây

    @Test
    public void testFindUser_idHopLe_traVeUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(new User("Alice")));
        User user = userService.findUser(1L);
        assertEquals("Alice", user.getName());
    }
}
```

## Tổng hợp

| API | Mục đích | Khi nào dùng |
|---|---|---|
| `Assert` | Kiểm tra kết quả, fail nếu sai | Kiểm tra đầu ra của phương thức |
| `Assume` | Bỏ qua test nếu điều kiện không thỏa | Test phụ thuộc vào môi trường |
| `@RunWith` | Chỉ định test runner | Cần Parameterized, Suite, Mockito, ... |
