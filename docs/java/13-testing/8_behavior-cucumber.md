---
sidebar_position: 8
title: "8. Behavior Testing & Cucumber-JVM"
---

# 8. Behavior Testing & Cucumber-JVM

BDD (phát triển hướng hành vi) mô tả hành vi mong muốn của hệ thống bằng ngôn ngữ gần với tiếng tự nhiên, để cả người không biết lập trình cũng đọc hiểu được. Cucumber-JVM là công cụ BDD phổ biến cho Java, giúp nối các kịch bản viết bằng Gherkin với code thật. Bài này giới thiệu BDD, ngôn ngữ Gherkin và cách viết step definition; chi tiết nằm bên dưới.

---

## Mục lục

- [BDD (Behavior-Driven Development) là gì?](#bdd-behavior-driven-development-là-gì)
- [Vì sao cần BDD?](#vì-sao-cần-bdd)
- [Cucumber-JVM là gì?](#cucumber-jvm-là-gì)
- [Ngôn ngữ Gherkin: Given - When - Then](#ngôn-ngữ-gherkin-given---when---then)
- [Feature file (file kịch bản)](#feature-file-file-kịch-bản)
- [Step Definition (định nghĩa bước)](#step-definition-định-nghĩa-bước)
- [Chạy test với Cucumber](#chạy-test-với-cucumber)
- [Lợi ích giao tiếp với người không kỹ thuật](#lợi-ích-giao-tiếp-với-người-không-kỹ-thuật)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## BDD (Behavior-Driven Development) là gì?

**BDD (Behavior-Driven Development — phát triển hướng hành vi)** là một cách làm phần mềm trong đó ta **mô tả hành vi mong muốn của hệ thống bằng ngôn ngữ gần với tiếng tự nhiên**, trước khi viết code.

Thay vì nói "test hàm `calculateDiscount`", BDD mô tả: "Khi khách hàng VIP mua hàng trên 1 triệu, thì được giảm 10%". Cách diễn đạt này **ai cũng hiểu** — kể cả người không biết lập trình.

BDD là sự mở rộng của **TDD (test trước, code sau)**, nhưng tập trung vào **hành vi nghiệp vụ** thay vì chi tiết kỹ thuật.

## Vì sao cần BDD?

Trong một dự án thường có nhiều vai trò: lập trình viên, tester, và **người làm nghiệp vụ** (business analyst, product owner — người hiểu yêu cầu khách hàng nhưng không code).

Vấn đề: lập trình viên đọc code, người nghiệp vụ đọc tài liệu — hai bên dễ **hiểu sai ý nhau**. Kết quả là code làm ra không đúng mong muốn.

BDD giải quyết bằng cách tạo ra **một "ngôn ngữ chung"** (gọi là **ubiquitous language** — ngôn ngữ phổ quát): các kịch bản viết bằng tiếng tự nhiên mà cả ba bên đều đọc và đồng ý được. Kịch bản đó vừa là **tài liệu**, vừa là **test tự động**.

> Ví dụ đời thường: Khi xây nhà, kiến trúc sư và chủ nhà cùng xem một bản vẽ dễ hiểu để thống nhất. BDD chính là "bản vẽ chung" cho phần mềm.

## Cucumber-JVM là gì?

**Cucumber** là công cụ BDD phổ biến nhất. **Cucumber-JVM** là phiên bản chạy trên nền Java (JVM).

Cucumber cho phép bạn viết kịch bản bằng **ngôn ngữ Gherkin** (tiếng tự nhiên), rồi nối từng câu trong kịch bản với code Java thật. Khi chạy, Cucumber đọc kịch bản và tự động gọi code tương ứng để kiểm tra.

Cài đặt (Maven):

```xml
<dependency>
    <groupId>io.cucumber</groupId>
    <artifactId>cucumber-java</artifactId>
    <version>7.15.0</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>io.cucumber</groupId>
    <artifactId>cucumber-junit-platform-engine</artifactId>
    <version>7.15.0</version>
    <scope>test</scope>
</dependency>
```

## Ngôn ngữ Gherkin: Given - When - Then

**Gherkin** là ngôn ngữ đặc biệt dùng các từ khóa tiếng Anh đơn giản để mô tả kịch bản:

- **`Feature`** (tính năng): mô tả tính năng đang test.
- **`Scenario`** (kịch bản): một tình huống cụ thể.
- **`Given`** (cho trước): trạng thái ban đầu / điều kiện.
- **`When`** (khi): hành động xảy ra.
- **`Then`** (thì): kết quả mong đợi.
- **`And` / `But`**: nối thêm bước cùng loại.

Cấu trúc Given-When-Then này y hệt tinh thần **Arrange-Act-Assert** của unit test, nhưng viết bằng tiếng tự nhiên.

## Feature file (file kịch bản)

Kịch bản Gherkin được lưu trong **feature file** (đuôi `.feature`), thường đặt trong `src/test/resources`.

```gherkin
# File: src/test/resources/features/giohang.feature
# Tính năng: Giỏ hàng và giảm giá

Feature: Giảm giá cho khách hàng VIP

  Scenario: Khách VIP mua trên 1 triệu được giảm 10%
    Given khách hàng là thành viên VIP
    And giỏ hàng có tổng tiền là 2000000 đồng
    When khách hàng tiến hành thanh toán
    Then tổng tiền sau giảm giá phải là 1800000 đồng

  Scenario: Khách thường không được giảm giá
    Given khách hàng là thành viên thường
    And giỏ hàng có tổng tiền là 2000000 đồng
    When khách hàng tiến hành thanh toán
    Then tổng tiền sau giảm giá phải là 2000000 đồng
```

Lưu ý: file này **không chứa code Java**. Người làm nghiệp vụ hoàn toàn có thể đọc và kiểm tra xem mô tả có đúng yêu cầu không.

## Step Definition (định nghĩa bước)

**Step Definition (định nghĩa bước)** là code Java nối **mỗi câu Gherkin** với hành động thực tế. Cucumber dùng annotation `@Given`, `@When`, `@Then` (kèm mẫu câu) để khớp.

```java
import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class GioHangSteps {

    private Customer khachHang;     // khách hàng trong kịch bản
    private Cart gioHang = new Cart();
    private long tongTienSauGiam;

    // Khớp với: "Given khách hàng là thành viên VIP"
    @Given("khách hàng là thành viên VIP")
    public void khachHangVip() {
        khachHang = new Customer(true);  // true = VIP
    }

    // Khớp với: "Given khách hàng là thành viên thường"
    @Given("khách hàng là thành viên thường")
    public void khachHangThuong() {
        khachHang = new Customer(false); // false = thường
    }

    // {long} là tham số: tự lấy con số trong câu Gherkin
    @Given("giỏ hàng có tổng tiền là {long} đồng")
    public void gioHangCoTongTien(long soTien) {
        gioHang.setTotal(soTien);
    }

    // Khớp với: "When khách hàng tiến hành thanh toán"
    @When("khách hàng tiến hành thanh toán")
    public void thanhToan() {
        // Gọi logic nghiệp vụ thật để tính tiền sau giảm
        tongTienSauGiam = new CheckoutService().checkout(khachHang, gioHang);
    }

    // Khớp với: "Then tổng tiền sau giảm giá phải là {long} đồng"
    @Then("tổng tiền sau giảm giá phải là {long} đồng")
    public void kiemTraTongTien(long mongDoi) {
        assertEquals(mongDoi, tongTienSauGiam);  // assert như unit test
    }
}
```

Mỗi câu trong feature file được Cucumber khớp với một phương thức `@Given/@When/@Then` tương ứng. Đây là "cầu nối" giữa tiếng tự nhiên và code thật.

## Chạy test với Cucumber

Để JUnit 5 nhận và chạy các feature file, ta tạo một lớp khởi chạy (runner) với cấu hình trỏ tới thư mục feature:

```java
import org.junit.platform.suite.api.ConfigurationParameter;
import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectClasspathResource;
import org.junit.platform.suite.api.Suite;
import static io.cucumber.junit.platform.engine.Constants.GLUE_PROPERTY_NAME;

@Suite
@IncludeEngines("cucumber")                          // dùng engine Cucumber
@SelectClasspathResource("features")                 // thư mục chứa file .feature
@ConfigurationParameter(
    key = GLUE_PROPERTY_NAME,
    value = "com.example.steps")                      // gói chứa các Step Definition
public class RunCucumberTest {
    // Lớp trống: chỉ dùng để cấu hình và khởi chạy
}
```

Chạy bằng `mvn test` (Maven) hoặc trong IDE. Cucumber đọc từng kịch bản, chạy các bước tương ứng, và báo kịch bản nào pass/fail bằng tiếng tự nhiên — rất dễ đọc kết quả.

## Lợi ích giao tiếp với người không kỹ thuật

Đây là điểm mạnh lớn nhất của BDD/Cucumber:

1. **Người nghiệp vụ đọc được test**: Feature file viết bằng tiếng tự nhiên, không cần biết Java vẫn hiểu.
2. **Thống nhất yêu cầu trước khi code**: Ba bên (nghiệp vụ, dev, tester) cùng viết và duyệt kịch bản, tránh hiểu lầm.
3. **Tài liệu luôn cập nhật**: Vì feature file vừa là tài liệu vừa là test, nếu code sai thì test fail — tài liệu không bao giờ "lỗi thời" so với code.
4. **Tái sử dụng bước**: Các bước như "khách hàng là thành viên VIP" dùng lại được trong nhiều kịch bản.

> Đánh đổi: BDD tốn công viết step definition và bảo trì. Nó **phù hợp nhất cho các luồng nghiệp vụ quan trọng** cần phối hợp với người không kỹ thuật, chứ không thay thế unit test cho từng hàm nhỏ.

## Lỗi thường gặp

1. **Câu Gherkin không khớp Step Definition**: Sai một chữ giữa feature file và annotation khiến Cucumber báo "bước chưa được định nghĩa" (undefined step). Hai bên phải khớp chính xác.
2. **Viết Gherkin quá kỹ thuật**: Câu như "Given gọi API POST /users với body JSON" làm mất ý nghĩa BDD. Hãy viết theo ngôn ngữ nghiệp vụ, dễ hiểu.
3. **Lạm dụng BDD cho mọi thứ**: Dùng Cucumber để test từng hàm nhỏ là phí công. Để việc đó cho unit test; BDD dành cho luồng nghiệp vụ.
4. **Quên cấu hình `glue`**: Không trỏ đúng gói chứa Step Definition, Cucumber không tìm thấy code để chạy.
5. **Kịch bản phụ thuộc lẫn nhau**: Mỗi `Scenario` nên độc lập, tự thiết lập dữ liệu của mình ở bước `Given`.

## Tóm tắt

- **BDD** mô tả hành vi hệ thống bằng **ngôn ngữ tự nhiên** trước khi viết code, để mọi người (kể cả người không kỹ thuật) cùng hiểu.
- **Cucumber-JVM** là công cụ BDD phổ biến cho Java.
- **Gherkin** dùng từ khóa **Feature / Scenario / Given / When / Then** để viết kịch bản, lưu trong **feature file** (`.feature`).
- **Step Definition** là code Java (`@Given/@When/@Then`) nối từng câu Gherkin với hành động thật.
- Lợi ích lớn nhất: **giao tiếp chung** giữa dev, tester và người nghiệp vụ; tài liệu luôn đồng bộ với code.
- BDD phù hợp cho **luồng nghiệp vụ quan trọng**, không thay thế unit test.
- Đây là bài cuối của chủ đề **Testing** — bạn đã đi từ unit test, framework (JUnit/TestNG), mocking (Mockito), integration test, API test (REST Assured), performance test (JMeter), đến BDD.
