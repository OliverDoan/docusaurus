---
sidebar_position: 6
title: "Thực thi một nhóm các class test trong JUnit (Test Suite)"
---

# Thực thi một nhóm các class test trong JUnit (Test Suite)

## Test Suite là gì?

**Test Suite** (bộ kiểm thử) là cơ chế cho phép gom nhiều lớp test lại và chạy chúng cùng một lần. Thay vì chạy từng lớp test riêng lẻ, bạn tạo một lớp suite đóng vai trò điều phối toàn bộ.

**Tại sao cần Test Suite?**
- Chạy toàn bộ test của một module hoặc tính năng chỉ với một lệnh.
- Tổ chức test theo nhóm chức năng (ví dụ: tất cả test liên quan đến thanh toán).
- Kiểm soát thứ tự chạy các lớp test.
- Tích hợp với hệ thống CI/CD để chạy một tập test được chọn lọc.

## Test Suite với JUnit 4

### Cách 1: Dùng `@Suite.SuiteClasses`

```java
import org.junit.runner.RunWith;
import org.junit.runners.Suite;

// Lớp suite không cần có phương thức hay thuộc tính
// Chỉ cần hai annotation này
@RunWith(Suite.class)
@Suite.SuiteClasses({
    CalculatorTest.class,
    StringUtilsTest.class,
    BankAccountTest.class
})
public class ApplicationTestSuite {
    // Thân lớp để trống
}
```

Khi chạy `ApplicationTestSuite`, JUnit sẽ lần lượt chạy tất cả test trong:
1. `CalculatorTest`
2. `StringUtilsTest`
3. `BankAccountTest`

### Ví dụ thực tế — Tổ chức test theo module

```java
// Test cho module người dùng
@RunWith(Suite.class)
@Suite.SuiteClasses({
    UserRegistrationTest.class,
    UserLoginTest.class,
    UserProfileTest.class
})
public class UserModuleTestSuite {
    // Suite cho toàn bộ module User
}
```

```java
// Test cho module sản phẩm
@RunWith(Suite.class)
@Suite.SuiteClasses({
    ProductCatalogTest.class,
    ProductSearchTest.class,
    ProductInventoryTest.class
})
public class ProductModuleTestSuite {
    // Suite cho toàn bộ module Product
}
```

```java
// Suite tổng hợp toàn bộ ứng dụng
@RunWith(Suite.class)
@Suite.SuiteClasses({
    UserModuleTestSuite.class,      // Suite lồng nhau được
    ProductModuleTestSuite.class,
    PaymentTest.class               // Hoặc thêm lớp test đơn lẻ
})
public class AllTestsSuite {
    // Suite cấp cao nhất
}
```

**Lưu ý quan trọng**: `@Suite.SuiteClasses` chấp nhận cả lớp suite khác, cho phép **lồng suite** (nested suite).

### Cách 2: Dùng `JUnitCore` để chạy từ code Java

```java
import org.junit.runner.JUnitCore;
import org.junit.runner.Result;
import org.junit.runner.notification.Failure;

public class TestRunner {

    public static void main(String[] args) {
        // Chạy một lớp test đơn
        Result result = JUnitCore.runClasses(CalculatorTest.class);
        printResult(result);

        // Chạy nhiều lớp test cùng lúc
        Result multiResult = JUnitCore.runClasses(
            CalculatorTest.class,
            StringUtilsTest.class,
            BankAccountTest.class
        );
        printResult(multiResult);
    }

    private static void printResult(Result result) {
        System.out.println("Tổng số test: " + result.getRunCount());
        System.out.println("Thất bại: " + result.getFailureCount());
        System.out.println("Bỏ qua: " + result.getIgnoreCount());
        System.out.println("Thời gian: " + result.getRunTime() + "ms");

        if (result.wasSuccessful()) {
            System.out.println("Tất cả test PASS!");
        } else {
            System.out.println("Có test FAIL:");
            for (Failure failure : result.getFailures()) {
                System.out.println("  - " + failure.getMessage());
            }
        }
    }
}
```

## Test Suite với JUnit 5

JUnit 5 dùng annotation từ gói `junit-platform-suite`:

```xml
<!-- Thêm dependency vào pom.xml -->
<dependency>
    <groupId>org.junit.platform</groupId>
    <artifactId>junit-platform-suite</artifactId>
    <version>1.10.0</version>
    <scope>test</scope>
</dependency>
```

### Dùng `@SelectClasses`

```java
import org.junit.platform.suite.api.SelectClasses;
import org.junit.platform.suite.api.Suite;

@Suite
@SelectClasses({
    CalculatorTest.class,
    StringUtilsTest.class
})
public class AppTestSuite {
    // Thân lớp để trống
}
```

### Dùng `@SelectPackages` — Chọn theo package

```java
import org.junit.platform.suite.api.SelectPackages;
import org.junit.platform.suite.api.Suite;

@Suite
@SelectPackages({
    "com.example.user",       // Chạy tất cả test trong package này
    "com.example.product"     // Và package này
})
public class ModuleTestSuite {
    // Tự động tìm và chạy mọi lớp test trong các package đã chọn
}
```

### Dùng `@IncludePackages` và `@ExcludePackages` — Lọc package

```java
import org.junit.platform.suite.api.*;

@Suite
@SelectPackages("com.example")
@IncludePackages("com.example.core")     // Chỉ bao gồm package này
@ExcludePackages("com.example.legacy")   // Loại trừ package này
public class FilteredTestSuite {
}
```

### Dùng `@IncludeTags` và `@ExcludeTags` — Lọc theo tag

```java
// Đánh dấu test với @Tag
class PaymentTest {

    @Test
    @Tag("smoke")   // Tag "smoke" — test quan trọng chạy nhanh
    void testPayment_thanhCong() { ... }

    @Test
    @Tag("slow")    // Tag "slow" — test chậm
    void testPayment_kiemTraToanBoLuongXuLy() { ... }
}

// Suite chỉ chạy test có tag "smoke"
@Suite
@SelectPackages("com.example")
@IncludeTags("smoke")
public class SmokeSuite {
}

// Suite loại trừ test chậm
@Suite
@SelectPackages("com.example")
@ExcludeTags("slow")
public class FastSuite {
}
```

## Thứ tự chạy các lớp trong Suite

Mặc định JUnit không đảm bảo thứ tự chạy. Nếu cần kiểm soát:

```java
import org.junit.FixMethodOrder;
import org.junit.runners.MethodSorters;

// Chạy theo thứ tự tên phương thức (alphabetical)
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class OrderedTest {

    @Test
    public void test1_buocDauTien() { ... }

    @Test
    public void test2_buocThuHai() { ... }

    @Test
    public void test3_buocCuoi() { ... }
}
```

## Thuật ngữ quan trọng

| Thuật ngữ | Giải thích |
|---|---|
| **Test Suite** | Tập hợp nhiều lớp test chạy cùng nhau |
| **Nested Suite** | Suite lồng trong suite khác |
| **Tag** | Nhãn gắn vào test để phân nhóm và lọc |
| **Package** | Nhóm các lớp Java cùng namespace, ví dụ `com.example.user` |
| **CI/CD** | Continuous Integration/Deployment — hệ thống tự động build và deploy |
| **Smoke test** | Tập test nhanh, kiểm tra các chức năng quan trọng nhất |
