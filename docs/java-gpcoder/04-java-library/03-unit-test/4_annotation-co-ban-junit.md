---
sidebar_position: 4
title: "Một số Annotation cơ bản của JUnit"
---

# Một số Annotation cơ bản của JUnit

JUnit dùng các annotation (chú thích bắt đầu bằng `@`) để đánh dấu phương thức nào là test, phương thức nào chạy trước hay sau test. Hiểu các annotation cơ bản này là điều bắt buộc để viết được một lớp test hoàn chỉnh. Bài này giới thiệu `@Test`, `@Before`/`@After`, `@BeforeClass`/`@AfterClass`, `@Ignore` cùng thứ tự thực thi và các annotation tương ứng trong JUnit 5.

## Annotation là gì?

**Annotation** (chú thích / siêu dữ liệu) là cú pháp đặc biệt trong Java bắt đầu bằng `@`, dùng để cung cấp thêm thông tin cho trình biên dịch hoặc framework. JUnit sử dụng annotation để xác định phương thức nào là test, phương thức nào chạy trước/sau test, ...

## Các Annotation cơ bản trong JUnit 4

### `@Test` — Đánh dấu phương thức test

Annotation `@Test` đánh dấu một phương thức là một bài kiểm thử. JUnit sẽ tự động tìm và chạy các phương thức này.

```java
import org.junit.Test;
import static org.junit.Assert.*;

public class MathUtilsTest {

    @Test
    public void testMultiply_haiSoDuong_traVeTich() {
        MathUtils utils = new MathUtils();
        assertEquals(12, utils.multiply(3, 4));
    }
}
```

**Tham số của `@Test`:**

```java
// expected — mong đợi một exception cụ thể được ném ra
@Test(expected = ArithmeticException.class)
public void testDivide_chiaSoChoZero_nemArithmeticException() {
    int result = 10 / 0;
}

// timeout — test thất bại nếu chạy lâu hơn N mili giây
@Test(timeout = 1000)
public void testSort_mangLonNgan_hoanThanhDuoi1Giay() {
    int[] arr = generateLargeArray(100000);
    Arrays.sort(arr);
}
```

### `@Before` và `@After` — Chạy trước/sau mỗi test

```java
import org.junit.Before;
import org.junit.After;
import org.junit.Test;

public class DatabaseServiceTest {

    private DatabaseService service;
    private Connection connection;

    @Before
    public void setUp() {
        // Chạy trước MỖI phương thức @Test
        connection = Database.connect("jdbc:h2:mem:testdb");
        service = new DatabaseService(connection);
        service.createTable();
    }

    @After
    public void tearDown() {
        // Chạy sau MỖI phương thức @Test
        service.dropTable();
        connection.close();
    }

    @Test
    public void testInsert_duLieuHopLe_luuThanhCong() {
        service.insert("Alice", 25);
        assertEquals(1, service.count());
    }

    @Test
    public void testDelete_duLieuTonTai_xoaThanhCong() {
        service.insert("Bob", 30);
        service.delete(1);
        assertEquals(0, service.count());
    }
}
```

### `@BeforeClass` và `@AfterClass` — Chạy một lần cho cả lớp test

```java
import org.junit.BeforeClass;
import org.junit.AfterClass;

public class ExpensiveResourceTest {

    private static Server server;

    @BeforeClass
    public static void startServer() {
        // Chạy MỘT LẦN trước tất cả @Test trong lớp này
        // Phương thức phải là static
        server = new Server(8080);
        server.start();
    }

    @AfterClass
    public static void stopServer() {
        // Chạy MỘT LẦN sau tất cả @Test trong lớp này
        // Phương thức phải là static
        server.stop();
    }

    @Test
    public void testEndpoint_pingServer_traVe200() {
        int status = HttpClient.get("http://localhost:8080/ping");
        assertEquals(200, status);
    }
}
```

### `@Ignore` — Bỏ qua test tạm thời

```java
import org.junit.Ignore;

public class FeatureTest {

    @Ignore("Tính năng chưa triển khai xong — bỏ qua tạm thời")
    @Test
    public void testNewFeature_khiHoanTat_hoatDungDung() {
        // Test này sẽ bị bỏ qua, không chạy
    }

    @Test
    public void testExistingFeature_hoatDongBinhThuong() {
        // Test này vẫn chạy bình thường
        assertTrue(true);
    }
}
```

## Thứ tự thực thi Annotation

Khi chạy một lớp test, thứ tự thực thi như sau:

```
@BeforeClass (một lần)
    ↓
@Before (trước test 1)
    ↓
@Test (test 1)
    ↓
@After (sau test 1)
    ↓
@Before (trước test 2)
    ↓
@Test (test 2)
    ↓
@After (sau test 2)
    ↓
@AfterClass (một lần)
```

## Annotation trong JUnit 5

JUnit 5 đổi tên một số annotation cho nhất quán hơn:

| JUnit 4 | JUnit 5 | Ý nghĩa |
|---|---|---|
| `@Test` | `@Test` | Đánh dấu phương thức test |
| `@Before` | `@BeforeEach` | Chạy trước mỗi test |
| `@After` | `@AfterEach` | Chạy sau mỗi test |
| `@BeforeClass` | `@BeforeAll` | Chạy một lần trước tất cả |
| `@AfterClass` | `@AfterAll` | Chạy một lần sau tất cả |
| `@Ignore` | `@Disabled` | Bỏ qua test |

```java
// JUnit 5 - ví dụ đầy đủ
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Kiểm thử lớp Calculator")
class CalculatorTest {

    private Calculator calculator;

    @BeforeAll
    static void initAll() {
        System.out.println("Bắt đầu kiểm thử Calculator");
    }

    @BeforeEach
    void init() {
        calculator = new Calculator();
    }

    @Test
    @DisplayName("Cộng hai số dương")
    void testAdd_haiSoDuong_traVeTong() {
        assertEquals(7, calculator.add(3, 4));
    }

    @Test
    @Disabled("Đang sửa lỗi phép chia")
    void testDivide_chiaSoChoZero_nemException() {
        assertThrows(ArithmeticException.class, () -> calculator.divide(5, 0));
    }

    @AfterEach
    void tearDown() {
        calculator = null;
    }

    @AfterAll
    static void tearDownAll() {
        System.out.println("Hoàn thành kiểm thử Calculator");
    }
}
```

`@DisplayName` (JUnit 5) cho phép đặt tên hiển thị cho test class hoặc test method, giúp báo cáo test dễ đọc hơn.

## Thuật ngữ quan trọng

| Thuật ngữ | Giải thích |
|---|---|
| **Fixture** | Trạng thái cố định (dữ liệu, đối tượng) được thiết lập trước khi test chạy |
| **Setup** | Giai đoạn chuẩn bị fixture, thường dùng `@Before`/`@BeforeEach` |
| **Teardown** | Giai đoạn dọn dẹp sau test, thường dùng `@After`/`@AfterEach` |
| **Static method** | Phương thức thuộc về lớp, không cần khởi tạo đối tượng — bắt buộc cho `@BeforeClass`/`@AfterClass` |
