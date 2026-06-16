---
sidebar_position: 2
title: "2. JUnit"
---

# 2. JUnit

JUnit là framework test phổ biến nhất trong thế giới Java, gần như dự án nào cũng dùng để viết unit test. Nó cung cấp các annotation như `@Test` và các phương thức assert giúp viết test gọn gàng, tự động chạy và báo pass/fail. Bài này hướng dẫn cách cài đặt và dùng JUnit 5 qua các ví dụ; chi tiết nằm bên dưới.

---

## Mục lục

- [Vì sao JUnit ra đời?](#vì-sao-junit-ra-đời)
- [JUnit là gì?](#junit-là-gì)
- [Cài đặt JUnit 5](#cài-đặt-junit-5)
- [Viết test đầu tiên với @Test](#viết-test-đầu-tiên-với-test)
- [Các phương thức Assertions](#các-phương-thức-assertions)
- [Vòng đời test: @BeforeEach, @AfterEach](#vòng-đời-test-beforeeach-aftereach)
- [Kiểm tra ngoại lệ với assertThrows](#kiểm-tra-ngoại-lệ-với-assertthrows)
- [Test với nhiều dữ liệu: @ParameterizedTest](#test-với-nhiều-dữ-liệu-parameterizedtest)
- [Ví dụ đầy đủ: test lớp Calculator](#ví-dụ-đầy-đủ-test-lớp-calculator)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao JUnit ra đời?

**Vấn đề:** Trước khi có JUnit, lập trình viên Java phải test thủ công bằng cách viết hàm `main()`, in kết quả ra console rồi tự mắt so sánh. Cách này không lặp lại được tự động, không phân biệt pass/fail rõ ràng, và không tích hợp được vào CI/CD.

```java
// Cách cũ: test thủ công, dễ bỏ sót lỗi
public class Main {
    public static void main(String[] args) {
        Calculator calc = new Calculator();
        int ketQua = calc.add(2, 3);
        // Phải tự nhìn console và so sánh bằng mắt!
        System.out.println("Kết quả: " + ketQua);  // in ra 5 -> tự kiểm tra
        // Nếu có 100 hàm cần test -> mệt mỏi, dễ nhầm, không tự động hóa được
    }
}
```

**Giải pháp:** JUnit chuẩn hóa việc viết test bằng annotation `@Test`, dùng assertion để máy tự kiểm tra pass/fail, chạy hàng loạt test cùng lúc và báo cáo tổng kết, tích hợp trực tiếp vào Maven/Gradle/CI.

```java
// Cách mới với JUnit: máy tự kiểm tra, không cần nhìn console
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class CalculatorTest {
    @Test
    void testAdd() {
        Calculator calc = new Calculator();
        assertEquals(5, calc.add(2, 3));  // máy tự so sánh, tự báo pass/fail
    }
}
// Chạy `mvn test` -> JUnit tự tìm và chạy tất cả @Test, in báo cáo xanh/đỏ
```

:::tip[Dùng thực tế]
- Chạy toàn bộ test suite bằng một lệnh (`mvn test` hoặc `gradle test`) trước khi commit code.
- Tích hợp vào pipeline CI/CD (GitHub Actions, Jenkins) để test tự động mỗi khi push code.
- Phát hiện regression (hỏng tính năng cũ) ngay khi thêm tính năng mới.
- Viết test trước khi code (TDD) để thiết kế API rõ ràng hơn ngay từ đầu.
:::

## JUnit là gì?

**JUnit** là **framework (bộ khung) test phổ biến nhất** trong thế giới Java. Gần như mọi dự án Java đều dùng JUnit để viết unit test.

Thay vì tự viết các câu lệnh `if`/`throw` để kiểm tra như ở bài trước, JUnit cung cấp:

- Các **annotation (chú thích)** như `@Test` để đánh dấu phương thức nào là test.
- Các phương thức **assertion (khẳng định)** như `assertEquals` để so sánh kết quả gọn gàng.
- Một **test runner (trình chạy test)** tự động tìm và chạy tất cả test, rồi báo cáo pass/fail.

Phiên bản hiện đại là **JUnit 5** (còn gọi là **JUnit Jupiter**). Tài liệu này dùng JUnit 5.

## Cài đặt JUnit 5

Nếu dùng **Maven**, thêm vào file `pom.xml`:

```xml
<!-- Thư viện JUnit 5 dùng cho test -->
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
    <version>5.10.0</version>
    <scope>test</scope>  <!-- chỉ dùng khi test, không đóng gói vào sản phẩm -->
</dependency>
```

Nếu dùng **Gradle**, thêm vào `build.gradle`:

```groovy
dependencies {
    // JUnit 5 cho phần test
    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.0'
}
test {
    useJUnitPlatform()  // báo Gradle dùng nền tảng JUnit 5
}
```

Theo quy ước, code test đặt trong thư mục `src/test/java`, còn code chính nằm ở `src/main/java`.

## Viết test đầu tiên với @Test

Annotation **`@Test`** đánh dấu một phương thức là test. JUnit sẽ tự gọi mọi phương thức có `@Test`.

```java
import org.junit.jupiter.api.Test;            // annotation @Test
import static org.junit.jupiter.api.Assertions.assertEquals; // hàm so sánh

class CalculatorTest {

    @Test  // đánh dấu đây là một test
    void testAdd() {
        Calculator calc = new Calculator();    // Arrange
        int ketQua = calc.add(2, 3);           // Act
        assertEquals(5, ketQua);               // Assert: mong đợi 5
    }
}
```

`assertEquals(5, ketQua)` nghĩa là: "Tôi mong đợi giá trị là `5`. Nếu `ketQua` khác `5`, hãy báo test fail."

> Lưu ý: tham số đầu là **giá trị mong đợi (expected)**, tham số sau là **giá trị thực tế (actual)**. Đừng viết ngược!

## Các phương thức Assertions

JUnit cung cấp nhiều phương thức `assert...` để kiểm tra. Tất cả nằm trong lớp `Assertions`:

```java
import static org.junit.jupiter.api.Assertions.*;

@Test
void viDuCacAssertion() {
    // So sánh hai giá trị bằng nhau
    assertEquals(10, 5 + 5);

    // Kiểm tra điều kiện đúng (true)
    assertTrue(5 > 3);

    // Kiểm tra điều kiện sai (false)
    assertFalse(5 < 3);

    // Kiểm tra một giá trị là null
    assertNull(null);

    // Kiểm tra một giá trị KHÔNG null
    assertNotNull("xin chào");

    // So sánh hai mảng có phần tử giống nhau
    assertArrayEquals(new int[]{1, 2}, new int[]{1, 2});
}
```

Bạn có thể thêm **thông báo lỗi** ở tham số cuối để dễ debug khi fail:

```java
// Nếu fail, JUnit in ra dòng chữ này -> dễ hiểu nguyên nhân
assertEquals(5, calc.add(2, 3), "Phép cộng 2 + 3 phải bằng 5");
```

## Vòng đời test: @BeforeEach, @AfterEach

Thường nhiều test cần chuẩn bị giống nhau (ví dụ: tạo đối tượng `Calculator`). Thay vì lặp lại, ta dùng:

- **`@BeforeEach`**: chạy **trước MỖI** test. Dùng để chuẩn bị (Arrange chung).
- **`@AfterEach`**: chạy **sau MỖI** test. Dùng để dọn dẹp (đóng file, xóa dữ liệu tạm...).

Ngoài ra còn có `@BeforeAll`/`@AfterAll` (chạy **một lần** trước/sau tất cả test, phải là `static`).

```java
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class CalculatorTest {

    private Calculator calc;  // dùng chung cho mọi test

    @BeforeEach  // chạy trước mỗi test -> tạo đối tượng mới, sạch sẽ
    void setUp() {
        calc = new Calculator();
        System.out.println("Chuẩn bị: tạo Calculator mới");
    }

    @AfterEach  // chạy sau mỗi test -> dọn dẹp nếu cần
    void tearDown() {
        System.out.println("Dọn dẹp sau test");
    }

    @Test
    void testAdd() {
        assertEquals(7, calc.add(3, 4));  // không cần tạo lại calc
    }

    @Test
    void testSubtract() {
        assertEquals(1, calc.subtract(4, 3));  // calc đã được tạo mới ở @BeforeEach
    }
}
```

> Vì sao tạo mới mỗi lần? Để các test **độc lập** — test này không làm bẩn dữ liệu của test kia.

## Kiểm tra ngoại lệ với assertThrows

Đôi khi code **nên** ném ra **exception (ngoại lệ)** trong tình huống lỗi (ví dụ chia cho 0). Ta dùng `assertThrows` để kiểm tra điều đó:

```java
import static org.junit.jupiter.api.Assertions.assertThrows;

@Test
void testChiaChoKhongPhaiNemLoi() {
    Calculator calc = new Calculator();

    // Mong đợi: gọi divide(10, 0) sẽ ném ra ArithmeticException
    assertThrows(ArithmeticException.class, () -> {
        calc.divide(10, 0);  // chia cho 0
    });
}
```

Nếu code **không** ném ngoại lệ như mong đợi, test sẽ fail. Đây là cách kiểm tra "đường đi lỗi" (error path), không chỉ "đường đi đúng".

## Test với nhiều dữ liệu: @ParameterizedTest

Nếu muốn chạy **cùng một test với nhiều bộ dữ liệu** khác nhau, dùng **`@ParameterizedTest`** thay cho `@Test`. Điều này tránh phải copy-paste nhiều test gần giống nhau.

```java
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import static org.junit.jupiter.api.Assertions.assertEquals;

class CalculatorParamTest {

    // Mỗi dòng trong CsvSource là một lần chạy test:
    // a, b, ketQuaMongDoi
    @ParameterizedTest
    @CsvSource({
        "1, 1, 2",
        "2, 3, 5",
        "10, 20, 30",
        "-1, 1, 0"
    })
    void testAddNhieuTruongHop(int a, int b, int mongDoi) {
        Calculator calc = new Calculator();
        assertEquals(mongDoi, calc.add(a, b));  // chạy 4 lần với 4 bộ số
    }
}
```

Ngoài `@CsvSource`, còn có `@ValueSource` (một danh sách giá trị đơn) và `@MethodSource` (lấy dữ liệu từ một phương thức).

## Ví dụ đầy đủ: test lớp Calculator

Lớp cần test:

```java
public class Calculator {
    public int add(int a, int b) { return a + b; }
    public int subtract(int a, int b) { return a - b; }
    public int multiply(int a, int b) { return a * b; }

    public int divide(int a, int b) {
        if (b == 0) {
            // Ném ngoại lệ khi chia cho 0
            throw new ArithmeticException("Không thể chia cho 0");
        }
        return a / b;
    }
}
```

Lớp test đầy đủ:

```java
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CalculatorTest {

    private Calculator calc;

    @BeforeEach
    void setUp() {
        calc = new Calculator();  // tạo mới trước mỗi test
    }

    @Test
    void testAdd() {
        assertEquals(5, calc.add(2, 3), "2 + 3 phải bằng 5");
    }

    @Test
    void testSubtract() {
        assertEquals(1, calc.subtract(4, 3), "4 - 3 phải bằng 1");
    }

    @Test
    void testMultiply() {
        assertEquals(12, calc.multiply(4, 3), "4 * 3 phải bằng 12");
    }

    @Test
    void testDivide() {
        assertEquals(5, calc.divide(10, 2), "10 / 2 phải bằng 5");
    }

    @Test
    void testDivideByZeroThrows() {
        // Kiểm tra chia cho 0 sẽ ném ngoại lệ
        assertThrows(ArithmeticException.class, () -> calc.divide(10, 0));
    }
}
```

Chạy test: trong IDE (IntelliJ/Eclipse) bấm nút "Run", hoặc dùng lệnh `mvn test` (Maven) / `gradle test` (Gradle). Test pass hiện màu xanh, fail hiện màu đỏ kèm lý do.

## Lỗi thường gặp

1. **Viết ngược tham số `assertEquals`**: Phải là `assertEquals(mongDoi, thucTe)`. Viết ngược thì thông báo lỗi sẽ gây hiểu nhầm.
2. **Quên annotation `@Test`**: Phương thức không có `@Test` sẽ không được JUnit chạy — bạn tưởng test pass nhưng thực ra nó chưa chạy.
3. **Nhầm import của JUnit 4 và 5**: JUnit 5 dùng `org.junit.jupiter.api.*`, JUnit 4 dùng `org.junit.*`. Trộn lẫn gây lỗi.
4. **So sánh số thực bằng `assertEquals` không có delta**: Với `double`/`float` phải dùng `assertEquals(0.3, ketQua, 0.0001)` (tham số thứ ba là sai số cho phép) vì số thực có sai số làm tròn.
5. **Để test phụ thuộc trạng thái chung**: Dùng biến `static` chia sẻ giữa các test khiến test này ảnh hưởng test kia. Hãy dùng `@BeforeEach` để reset.

## Tóm tắt

- **JUnit** là framework test phổ biến nhất của Java; phiên bản hiện đại là **JUnit 5**.
- **`@Test`** đánh dấu một phương thức là test.
- Các **assertion** như `assertEquals`, `assertTrue`, `assertFalse`, `assertNull`, `assertThrows` dùng để kiểm tra kết quả.
- **`@BeforeEach`/`@AfterEach`** chạy trước/sau mỗi test để chuẩn bị và dọn dẹp.
- **`assertThrows`** kiểm tra code có ném đúng ngoại lệ mong đợi không.
- **`@ParameterizedTest`** chạy cùng một test với nhiều bộ dữ liệu khác nhau.
- Bài tiếp theo sẽ giới thiệu **TestNG** — một framework test thay thế JUnit.
