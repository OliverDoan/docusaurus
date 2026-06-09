---
sidebar_position: 11
title: "Chạy lại một failed Test trong JUnit"
---

# Chạy lại một failed Test trong JUnit

Đôi khi một test thất bại không phải vì code sai mà do yếu tố bên ngoài không ổn định như mạng, timing hay race condition — gọi là flaky test. Trong những trường hợp đó, việc tự động chạy lại test có thể giúp giảm báo lỗi giả. Bài này trình bày các cách retry test trong JUnit 4 (TestRule, annotation tùy chỉnh), JUnit 5 (Extension) và qua Maven Surefire, kèm lời khuyên khi nào nên và không nên dùng retry.

## Tại sao cần chạy lại test thất bại?

Trong thực tế, một số test có thể thất bại không phải do lỗi code mà do các yếu tố bên ngoài không ổn định:

- **Flaky test** (test không ổn định): Test phụ thuộc vào timing, mạng, hoặc trạng thái hệ thống.
- **Integration test** với dịch vụ bên ngoài: Kết nối mạng tạm thời bị gián đoạn.
- **Concurrency test** (kiểm thử đồng thời): Race condition thi thoảng xảy ra.

Tuy nhiên, cơ chế retry (chạy lại) chỉ nên là giải pháp tạm thời. Mục tiêu lâu dài là tìm và sửa nguyên nhân gốc rễ khiến test không ổn định.

## Cách 1: Custom Rule — `RetryRule` (JUnit 4)

Tạo một `TestRule` tùy chỉnh để tự động chạy lại test khi thất bại:

```java
import org.junit.rules.TestRule;
import org.junit.runner.Description;
import org.junit.runners.model.Statement;

public class RetryRule implements TestRule {

    private final int maxRetries;

    public RetryRule(int maxRetries) {
        this.maxRetries = maxRetries;
    }

    @Override
    public Statement apply(Statement base, Description description) {
        return new Statement() {
            @Override
            public void evaluate() throws Throwable {
                Throwable lastException = null;

                for (int attempt = 1; attempt <= maxRetries; attempt++) {
                    try {
                        base.evaluate(); // Thử chạy test
                        return; // Thành công — dừng lại
                    } catch (Throwable t) {
                        lastException = t;
                        System.out.printf(
                            "[RetryRule] Test '%s' thất bại lần %d/%d: %s%n",
                            description.getMethodName(),
                            attempt,
                            maxRetries,
                            t.getMessage()
                        );
                    }
                }

                // Hết số lần thử — ném exception cuối cùng
                throw lastException;
            }
        };
    }
}
```

```java
// Sử dụng RetryRule
public class NetworkServiceTest {

    @Rule
    public RetryRule retryRule = new RetryRule(3); // Thử tối đa 3 lần

    @Test
    public void testCallExternalApi_ketNoiMang_nhanDuocPhanHoi() {
        // Test này có thể thất bại do mạng không ổn định
        // RetryRule sẽ tự động chạy lại tối đa 3 lần
        String response = externalApiClient.ping();
        assertNotNull(response);
    }
}
```

## Cách 2: Annotation kết hợp Rule

Tạo annotation `@Retry` để chỉ định số lần retry cho từng test riêng lẻ:

```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

// Định nghĩa annotation @Retry
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Retry {
    int times() default 3;
}
```

```java
// RetryRule đọc annotation @Retry
import org.junit.rules.TestRule;
import org.junit.runner.Description;
import org.junit.runners.model.Statement;

public class RetryRule implements TestRule {

    private final int defaultRetries;

    public RetryRule(int defaultRetries) {
        this.defaultRetries = defaultRetries;
    }

    @Override
    public Statement apply(Statement base, Description description) {
        return new Statement() {
            @Override
            public void evaluate() throws Throwable {
                // Đọc annotation @Retry từ phương thức test (nếu có)
                Retry retry = description.getAnnotation(Retry.class);
                int retries = (retry != null) ? retry.times() : defaultRetries;

                Throwable lastException = null;
                for (int i = 1; i <= retries; i++) {
                    try {
                        base.evaluate();
                        return;
                    } catch (Throwable t) {
                        lastException = t;
                        System.out.printf("Thử lại lần %d/%d cho test: %s%n",
                            i, retries, description.getMethodName());
                    }
                }
                throw lastException;
            }
        };
    }
}
```

```java
// Sử dụng
public class IntegrationTest {

    @Rule
    public RetryRule retryRule = new RetryRule(1); // Mặc định không retry

    @Test
    @Retry(times = 3) // Test này retry 3 lần nếu fail
    public void testKetNoiDatabase_khoiDongCham_choiDenKhiSan() {
        assertTrue(database.isConnected());
    }

    @Test // Không có @Retry — dùng giá trị mặc định (1 lần)
    public void testLogicTinhToan_khongPhuThuocBenNgoai_khongCanRetry() {
        assertEquals(10, calculator.add(3, 7));
    }
}
```

## Cách 3: JUnit 5 — Extension API

JUnit 5 dùng `Extension` thay cho `Rule`:

```java
import org.junit.jupiter.api.extension.*;

public class RetryExtension implements TestExecutionExceptionHandler {

    private static final int DEFAULT_RETRIES = 3;

    @Override
    public void handleTestExecutionException(
            ExtensionContext context, Throwable throwable) throws Throwable {

        // Đọc số lần retry từ annotation (nếu có)
        int retries = context.getElement()
            .map(e -> e.getAnnotation(Retry.class))
            .map(Retry::times)
            .orElse(DEFAULT_RETRIES);

        // Lấy số lần đã thử từ store (bộ lưu trữ tạm)
        ExtensionContext.Store store = context.getStore(
            ExtensionContext.Namespace.create(getClass(), context.getUniqueId())
        );
        int attempts = store.getOrDefault("attempts", Integer.class, 0);
        store.put("attempts", attempts + 1);

        if (attempts < retries - 1) {
            // Còn lần thử — ném IgnoreConditionEvaluationResult để retry
            throw new Exception("Retry lần " + (attempts + 1));
        }
        // Hết lần thử — ném exception thật sự để test fail
        throw throwable;
    }
}
```

```java
// Sử dụng JUnit 5 Extension
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(RetryExtension.class)
class FlakeyTest {

    @Test
    @Retry(times = 3)
    void testKhongOnDinh_coTheRetry() {
        // Test có thể thất bại do yếu tố bên ngoài
        assertTrue(unreliableService.isAvailable());
    }
}
```

## Cách 4: Maven Surefire Plugin — Retry tự động

Cấu hình Maven Surefire Plugin để retry tất cả failed test mà không cần thay đổi code:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>3.1.2</version>
    <configuration>
        <!-- Chạy lại test fail tối đa 2 lần -->
        <rerunFailingTestsCount>2</rerunFailingTestsCount>
    </configuration>
</plugin>
```

Chạy lệnh:
```bash
mvn test -Dsurefire.rerunFailingTestsCount=2
```

## Khi nào nên và không nên dùng Retry?

**Nên dùng Retry:**
- Test tích hợp với dịch vụ bên ngoài (API, database, message queue).
- Test trong môi trường CI/CD với tài nguyên không ổn định.

**Không nên dùng Retry:**
- Unit test thuần túy — nếu unit test fail, đó là lỗi thật sự trong code.
- Che giấu vấn đề: Retry nên đi kèm với logging để theo dõi tần suất fail.
- Số lần retry quá nhiều (không nên vượt quá 3) — sẽ làm chậm toàn bộ test suite.

## Thuật ngữ quan trọng

| Thuật ngữ | Giải thích |
|---|---|
| **Flaky test** | Test không ổn định, đôi khi pass đôi khi fail với cùng code |
| **Retry** | Chạy lại hành động sau khi thất bại |
| **Race condition** | Tình trạng lỗi xảy ra khi nhiều luồng truy cập dữ liệu đồng thời |
| **Extension** | Cơ chế mở rộng JUnit 5, thay thế cho Rule của JUnit 4 |
| **Store** | Bộ nhớ tạm thời trong JUnit 5 Extension để lưu trữ dữ liệu giữa các lần gọi |
