---
sidebar_position: 3
title: "3. TestNG"
---

# 3. TestNG

TestNG là một framework test cho Java, ra đời như lựa chọn thay thế JUnit và mạnh hơn ở việc quản lý nhóm test, chạy test song song và cung cấp dữ liệu linh hoạt. Nó rất được ưa chuộng trong kiểm thử tự động (ví dụ dùng cùng Selenium). Bài này giới thiệu cách dùng TestNG và so sánh với JUnit; chi tiết nằm bên dưới.

---

## Mục lục

- [TestNG là gì?](#testng-là-gì)
- [Cài đặt TestNG](#cài-đặt-testng)
- [Viết test với @Test](#viết-test-với-test)
- [Priority: thứ tự chạy test](#priority-thứ-tự-chạy-test)
- [Groups: nhóm test theo loại](#groups-nhóm-test-theo-loại)
- [@DataProvider: cung cấp nhiều bộ dữ liệu](#dataprovider-cung-cấp-nhiều-bộ-dữ-liệu)
- [Các annotation vòng đời](#các-annotation-vòng-đời)
- [So sánh TestNG với JUnit](#so-sánh-testng-với-junit)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## TestNG là gì?

**TestNG** (chữ NG là viết tắt của **Next Generation** — thế hệ tiếp theo) là một **framework test** cho Java, ra đời như một lựa chọn **thay thế JUnit**.

TestNG được tạo ra để bổ sung những tính năng mà JUnit (phiên bản cũ) còn thiếu, đặc biệt hữu ích cho:

- **Integration test (kiểm thử tích hợp)** và **end-to-end test (kiểm thử toàn luồng)**.
- **Quản lý nhóm test (groups)** — chạy chọn lọc nhóm test nào.
- **Test song song (parallel)** — chạy nhiều test cùng lúc cho nhanh.
- **Cung cấp dữ liệu linh hoạt** qua `@DataProvider`.

TestNG rất được ưa chuộng trong giới **automation testing (kiểm thử tự động)** như khi dùng cùng Selenium để test web.

## Cài đặt TestNG

Với **Maven**, thêm vào `pom.xml`:

```xml
<!-- Thư viện TestNG -->
<dependency>
    <groupId>org.testng</groupId>
    <artifactId>testng</artifactId>
    <version>7.9.0</version>
    <scope>test</scope>
</dependency>
```

Với **Gradle**, thêm vào `build.gradle`:

```groovy
dependencies {
    testImplementation 'org.testng:testng:7.9.0'
}
test {
    useTestNG()  // báo Gradle dùng TestNG thay vì JUnit
}
```

## Viết test với @Test

Giống JUnit, TestNG cũng dùng annotation **`@Test`**, nhưng import từ gói khác (`org.testng.annotations.Test`). Các phương thức assert nằm trong lớp `Assert`.

```java
import org.testng.annotations.Test;
import org.testng.Assert;   // chú ý: Assert (số ít), không phải Assertions

public class CalculatorTest {

    @Test  // đánh dấu phương thức là test
    void testAdd() {
        Calculator calc = new Calculator();
        int ketQua = calc.add(2, 3);
        // Chú ý: TestNG đặt giá trị THỰC TẾ trước, MONG ĐỢI sau (NGƯỢC với JUnit!)
        Assert.assertEquals(ketQua, 5);
    }
}
```

> Cẩn thận: Trong TestNG, `assertEquals(thucTe, mongDoi)` — thứ tự **ngược** với JUnit. Đây là điểm hay gây nhầm khi chuyển qua lại giữa hai framework.

## Priority: thứ tự chạy test

Mặc định TestNG chạy test theo thứ tự bảng chữ cái của tên. Nếu muốn chỉ định thứ tự, dùng thuộc tính **`priority`** (ưu tiên). Số càng nhỏ chạy càng sớm.

```java
public class OrderTest {

    @Test(priority = 1)  // chạy đầu tiên
    void dangNhap() {
        System.out.println("1. Đăng nhập");
    }

    @Test(priority = 2)  // chạy thứ hai
    void themSanPhamVaoGio() {
        System.out.println("2. Thêm sản phẩm vào giỏ");
    }

    @Test(priority = 3)  // chạy cuối
    void thanhToan() {
        System.out.println("3. Thanh toán");
    }
}
```

> Lưu ý: Unit test tốt nên **độc lập với thứ tự**. `priority` chủ yếu hữu ích cho test luồng (như mô phỏng hành vi người dùng theo các bước).

## Groups: nhóm test theo loại

**`groups`** cho phép gắn "nhãn" cho test, rồi chạy chọn lọc theo nhãn. Ví dụ chia test thành nhóm "nhanh" (smoke) và "chậm" (regression).

```java
public class GroupTest {

    @Test(groups = "smoke")  // nhóm test nhanh, chạy thường xuyên
    void kiemTraTrangChu() {
        System.out.println("Kiểm tra trang chủ tải được");
    }

    @Test(groups = "regression")  // nhóm test đầy đủ, chạy ít hơn
    void kiemTraToanBoLuong() {
        System.out.println("Kiểm tra toàn bộ luồng mua hàng");
    }

    @Test(groups = {"smoke", "regression"})  // thuộc cả hai nhóm
    void kiemTraDangNhap() {
        System.out.println("Kiểm tra đăng nhập");
    }
}
```

Sau đó cấu hình file `testng.xml` để chỉ chạy nhóm mong muốn:

```xml
<!-- Chỉ chạy các test thuộc nhóm "smoke" -->
<suite name="BoTestCuaToi">
    <test name="ChiChaySmoke">
        <groups>
            <run>
                <include name="smoke"/>  <!-- chỉ chạy nhóm smoke -->
            </run>
        </groups>
        <classes>
            <class name="GroupTest"/>
        </classes>
    </test>
</suite>
```

## @DataProvider: cung cấp nhiều bộ dữ liệu

**`@DataProvider`** là cách TestNG chạy cùng một test với **nhiều bộ dữ liệu** (tương tự `@ParameterizedTest` của JUnit, nhưng linh hoạt hơn).

```java
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import org.testng.Assert;

public class DataProviderTest {

    // Phương thức cung cấp dữ liệu: trả về mảng các bộ {a, b, mongDoi}
    @DataProvider(name = "duLieuPhepCong")
    public Object[][] cungCapDuLieu() {
        return new Object[][] {
            {1, 1, 2},
            {2, 3, 5},
            {10, 20, 30},
            {-5, 5, 0}
        };
    }

    // Test dùng dữ liệu từ provider ở trên -> chạy 4 lần
    @Test(dataProvider = "duLieuPhepCong")
    void testAdd(int a, int b, int mongDoi) {
        Calculator calc = new Calculator();
        Assert.assertEquals(calc.add(a, b), mongDoi);
    }
}
```

Điểm mạnh của `@DataProvider`: vì nó là **một phương thức Java**, bạn có thể đọc dữ liệu từ file, database, hay tính toán động — linh hoạt hơn nhiều so với việc viết cứng dữ liệu.

## Các annotation vòng đời

TestNG có hệ thống annotation vòng đời phong phú hơn JUnit:

```java
import org.testng.annotations.*;

public class LifecycleTest {

    @BeforeSuite  // chạy 1 lần trước toàn bộ suite (tập hợp test)
    void beforeSuite() { System.out.println("Trước suite"); }

    @BeforeClass  // chạy 1 lần trước tất cả test trong class
    void beforeClass() { System.out.println("Trước class"); }

    @BeforeMethod // chạy trước MỖI test (giống @BeforeEach của JUnit)
    void beforeMethod() { System.out.println("Trước mỗi test"); }

    @Test
    void test1() { System.out.println("Test 1"); }

    @AfterMethod  // chạy sau MỖI test
    void afterMethod() { System.out.println("Sau mỗi test"); }

    @AfterClass   // chạy 1 lần sau tất cả test trong class
    void afterClass() { System.out.println("Sau class"); }

    @AfterSuite   // chạy 1 lần sau toàn bộ suite
    void afterSuite() { System.out.println("Sau suite"); }
}
```

## So sánh TestNG với JUnit

| Tiêu chí | JUnit 5 | TestNG |
|----------|---------|--------|
| Annotation test | `@Test` | `@Test` |
| Trước mỗi test | `@BeforeEach` | `@BeforeMethod` |
| Sau mỗi test | `@AfterEach` | `@AfterMethod` |
| Thứ tự `assertEquals` | (mongDoi, thucTe) | (thucTe, mongDoi) |
| Test theo dữ liệu | `@ParameterizedTest` | `@DataProvider` |
| Nhóm test | `@Tag` | `groups` (mạnh hơn) |
| Cấu hình bằng XML | Không phổ biến | `testng.xml` (mạnh) |
| Test song song | Có (cấu hình) | Có (dễ cấu hình) |
| Phổ biến cho | Unit test | Integration/E2E, automation |

**Nên chọn cái nào?** Với người mới và unit test thông thường, **JUnit 5** là lựa chọn phổ biến và đủ dùng. **TestNG** mạnh hơn khi cần quản lý nhóm test phức tạp, test song song, hay làm automation testing (ví dụ với Selenium). Cả hai đều tốt — quan trọng là chọn một và dùng nhất quán trong dự án.

## Lỗi thường gặp

1. **Nhầm thứ tự `assertEquals`**: TestNG là `(thucTe, mongDoi)`, ngược với JUnit. Ghi nhớ kỹ khi chuyển framework.
2. **Import nhầm annotation**: TestNG dùng `org.testng.annotations.Test`, không phải `org.junit...`.
3. **Lạm dụng `priority`**: Khiến test phụ thuộc thứ tự, vi phạm tính độc lập. Chỉ dùng khi thực sự cần luồng tuần tự.
4. **Tên `@DataProvider` không khớp**: Tên trong `@Test(dataProvider = "...")` phải trùng đúng với `@DataProvider(name = "...")`.
5. **Quên cấu hình `useTestNG()` trong Gradle**: Nếu không, Gradle vẫn chạy bằng JUnit và không thấy test TestNG.

## Tóm tắt

- **TestNG** (Next Generation) là framework test thay thế JUnit, mạnh về quản lý nhóm và test song song.
- Dùng **`@Test`** giống JUnit nhưng `assertEquals` có **thứ tự ngược** (thực tế trước, mong đợi sau).
- **`priority`** chỉ định thứ tự chạy; **`groups`** gắn nhãn để chạy chọn lọc.
- **`@DataProvider`** cung cấp nhiều bộ dữ liệu linh hoạt cho cùng một test.
- TestNG có hệ thống annotation vòng đời phong phú: `@BeforeSuite/@BeforeClass/@BeforeMethod`...
- Với unit test thông thường, JUnit 5 đủ dùng; TestNG mạnh hơn cho integration/E2E và automation.
- Bài tiếp theo: **Mockito** — công cụ tạo đối tượng giả lập (mock) khi test.
