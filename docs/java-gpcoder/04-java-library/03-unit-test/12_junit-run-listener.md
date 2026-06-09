---
sidebar_position: 12
title: "Lắng nghe các sự kiện khi test được thực thi trong JUnit (RunListener)"
---

# Lắng nghe các sự kiện khi test được thực thi trong JUnit (RunListener)

RunListener cho phép bạn "lắng nghe" quá trình chạy test và phản ứng với các sự kiện như test bắt đầu, kết thúc, pass hay fail. Nhờ đó bạn có thể ghi log chi tiết, đo thời gian, tạo báo cáo tùy chỉnh hoặc gửi thông báo khi có test hỏng. Bài này hướng dẫn dùng RunListener trong JUnit 4, cách đăng ký nó, và đối tượng tương đương TestExecutionListener trong JUnit 5.

## RunListener là gì?

**RunListener** (bộ lắng nghe sự kiện test) là cơ chế cho phép bạn theo dõi quá trình thực thi test và phản ứng với các sự kiện như: test bắt đầu, test kết thúc, test pass, test fail, ...

`RunListener` trong JUnit 4 cho phép bạn:
- Ghi log chi tiết tiến trình test.
- Tạo báo cáo test tùy chỉnh.
- Gửi thông báo (email, Slack) khi có test fail.
- Thu thập metrics (chỉ số) hiệu năng test.
- Tích hợp với hệ thống monitoring.

## Các phương thức của RunListener

```java
import org.junit.runner.notification.RunListener;
import org.junit.runner.Description;
import org.junit.runner.Result;
import org.junit.runner.notification.Failure;

public class CustomRunListener extends RunListener {

    // Gọi khi bắt đầu toàn bộ test run
    @Override
    public void testRunStarted(Description description) throws Exception {
        System.out.println("=== BẮT ĐẦU CHẠY TEST ===");
        System.out.println("Tổng số test: " + description.testCount());
    }

    // Gọi khi kết thúc toàn bộ test run
    @Override
    public void testRunFinished(Result result) throws Exception {
        System.out.println("=== KẾT THÚC CHẠY TEST ===");
        System.out.println("Tổng: " + result.getRunCount());
        System.out.println("Pass: " + (result.getRunCount() - result.getFailureCount() - result.getIgnoreCount()));
        System.out.println("Fail: " + result.getFailureCount());
        System.out.println("Bỏ qua: " + result.getIgnoreCount());
        System.out.println("Thời gian: " + result.getRunTime() + "ms");
    }

    // Gọi khi bắt đầu mỗi test
    @Override
    public void testStarted(Description description) throws Exception {
        System.out.println("CHẠY: " + description.getMethodName()
            + " [" + description.getTestClass().getSimpleName() + "]");
    }

    // Gọi khi kết thúc mỗi test (dù pass hay fail)
    @Override
    public void testFinished(Description description) throws Exception {
        System.out.println("XONG: " + description.getMethodName());
    }

    // Gọi khi test FAIL
    @Override
    public void testFailure(Failure failure) throws Exception {
        System.out.println("FAIL: " + failure.getDescription().getMethodName());
        System.out.println("  Nguyên nhân: " + failure.getMessage());
    }

    // Gọi khi test bị bỏ qua (@Ignore/@Disabled)
    @Override
    public void testIgnored(Description description) throws Exception {
        System.out.println("BỎ QUA: " + description.getMethodName());
    }

    // Gọi khi test gặp Assumption failure (Assume.assumeTrue fail)
    @Override
    public void testAssumptionFailure(Failure failure) {
        System.out.println("GIẢ ĐỊNH THẤT BẠI: " + failure.getDescription().getMethodName());
    }
}
```

## Cách đăng ký RunListener

### Cách 1: Đăng ký qua code với JUnitCore

```java
import org.junit.runner.JUnitCore;
import org.junit.runner.Result;

public class TestRunner {

    public static void main(String[] args) {
        JUnitCore runner = new JUnitCore();

        // Đăng ký listener trước khi chạy
        runner.addListener(new CustomRunListener());

        // Chạy test
        Result result = runner.run(
            CalculatorTest.class,
            StringUtilsTest.class
        );

        System.out.println("Kết quả: " + (result.wasSuccessful() ? "PASS" : "FAIL"));
    }
}
```

### Cách 2: Đăng ký qua Maven Surefire Plugin

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>3.1.2</version>
    <configuration>
        <properties>
            <property>
                <name>listener</name>
                <value>com.example.test.CustomRunListener</value>
            </property>
        </properties>
    </configuration>
</plugin>
```

## Ví dụ thực tế — Listener ghi log và đo thời gian

```java
import org.junit.runner.Description;
import org.junit.runner.Result;
import org.junit.runner.notification.Failure;
import org.junit.runner.notification.RunListener;
import java.util.*;

public class TestMetricsListener extends RunListener {

    private Map<String, Long> startTimes = new HashMap<>();
    private List<String> failedTests = new ArrayList<>();
    private List<String> slowTests = new ArrayList<>();
    private static final long SLOW_THRESHOLD_MS = 500;

    @Override
    public void testStarted(Description description) {
        // Ghi thời điểm bắt đầu của mỗi test
        startTimes.put(description.getMethodName(), System.currentTimeMillis());
    }

    @Override
    public void testFinished(Description description) {
        Long startTime = startTimes.get(description.getMethodName());
        if (startTime != null) {
            long elapsed = System.currentTimeMillis() - startTime;

            if (elapsed > SLOW_THRESHOLD_MS) {
                slowTests.add(description.getMethodName() + " (" + elapsed + "ms)");
                System.out.printf("CẢNH BÁO: Test chậm '%s' mất %dms%n",
                    description.getMethodName(), elapsed);
            }
        }
    }

    @Override
    public void testFailure(Failure failure) {
        failedTests.add(failure.getDescription().getMethodName());
    }

    @Override
    public void testRunFinished(Result result) {
        System.out.println("\n=== BÁO CÁO TEST ===");
        System.out.println("Tổng thời gian: " + result.getRunTime() + "ms");
        System.out.println("Tổng test: " + result.getRunCount());

        if (!failedTests.isEmpty()) {
            System.out.println("\nTest FAIL (" + failedTests.size() + "):");
            failedTests.forEach(t -> System.out.println("  ✗ " + t));
        }

        if (!slowTests.isEmpty()) {
            System.out.println("\nTest chậm (" + slowTests.size() + "):");
            slowTests.forEach(t -> System.out.println("  ⚠ " + t));
        }

        System.out.println("===================");
    }
}
```

## RunListener trong JUnit 5

JUnit 5 dùng `TestExecutionListener` (trong `junit-platform-launcher`) thay cho `RunListener`:

```java
import org.junit.platform.launcher.TestExecutionListener;
import org.junit.platform.launcher.TestIdentifier;
import org.junit.platform.launcher.TestPlan;
import org.junit.platform.engine.TestExecutionResult;

public class CustomTestExecutionListener implements TestExecutionListener {

    @Override
    public void testPlanExecutionStarted(TestPlan testPlan) {
        System.out.println("Bắt đầu chạy test plan");
    }

    @Override
    public void executionStarted(TestIdentifier testIdentifier) {
        if (testIdentifier.isTest()) {
            System.out.println("Bắt đầu: " + testIdentifier.getDisplayName());
        }
    }

    @Override
    public void executionFinished(TestIdentifier testIdentifier,
                                   TestExecutionResult result) {
        if (testIdentifier.isTest()) {
            String status = result.getStatus().name();
            System.out.println("Kết thúc: " + testIdentifier.getDisplayName()
                + " — " + status);

            result.getThrowable().ifPresent(t ->
                System.out.println("  Lỗi: " + t.getMessage())
            );
        }
    }

    @Override
    public void testPlanExecutionFinished(TestPlan testPlan) {
        System.out.println("Hoàn thành test plan");
    }
}
```

Đăng ký trong file `src/test/resources/META-INF/services/org.junit.platform.launcher.TestExecutionListener`:
```
com.example.test.CustomTestExecutionListener
```

## Thuật ngữ quan trọng

| Thuật ngữ | Giải thích |
|---|---|
| **RunListener** | Bộ lắng nghe sự kiện test trong JUnit 4 |
| **TestExecutionListener** | Bộ lắng nghe sự kiện test trong JUnit 5 |
| **Event** | Sự kiện — khoảnh khắc quan trọng trong vòng đời test |
| **Metrics** | Chỉ số đo lường, ví dụ: thời gian chạy, số test pass/fail |
| **Monitoring** | Theo dõi hệ thống theo thời gian thực |
| **ServiceLoader** | Cơ chế Java để phát hiện và tải các implementation qua file cấu hình |
