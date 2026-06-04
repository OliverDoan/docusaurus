---
sidebar_position: 8
title: "Đơn giản hóa Unit Test với JUnit Rule"
---

# Đơn giản hóa Unit Test với JUnit Rule

## JUnit Rule là gì?

**JUnit Rule** (quy tắc JUnit) là cơ chế cho phép bạn tái sử dụng logic thiết lập và dọn dẹp test mà không cần kế thừa lớp. Rule hoạt động giống như một **interceptor** (bộ chặn) — nó bao quanh quá trình thực thi test để thêm hành vi bổ sung.

Rule được khai báo bằng annotation `@Rule` (áp dụng cho từng test) hoặc `@ClassRule` (áp dụng một lần cho cả lớp test).

**Lợi ích so với `@Before`/`@After`:**
- Tái sử dụng ở nhiều lớp test khác nhau mà không cần kế thừa.
- Đóng gói logic phức tạp vào một lớp Rule riêng biệt.
- Kết hợp nhiều Rule cùng lúc.

## Các Rule có sẵn trong JUnit 4

### `TemporaryFolder` — Thư mục tạm thời

Tạo thư mục và file tạm thời trong test, tự động xóa sau khi test kết thúc:

```java
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;
import java.io.File;

public class FileProcessorTest {

    @Rule
    public TemporaryFolder tempFolder = new TemporaryFolder();

    @Test
    public void testWriteFile_ghiDuLieu_docLaiDung() throws Exception {
        // Tạo file trong thư mục tạm — tự động xóa sau test
        File tempFile = tempFolder.newFile("test.txt");
        FileProcessor processor = new FileProcessor();

        processor.writeToFile(tempFile, "Nội dung test");
        String content = processor.readFromFile(tempFile);

        assertEquals("Nội dung test", content);
    }

    @Test
    public void testCreateSubdirectory_taoThuMucCon_thanhCong() throws Exception {
        File subDir = tempFolder.newFolder("subdir", "nested");
        assertTrue(subDir.exists());
        assertTrue(subDir.isDirectory());
    }
}
```

### `ExpectedException` — Kiểm tra exception chi tiết

```java
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

public class UserServiceTest {

    @Rule
    public ExpectedException thrown = ExpectedException.none();

    @Test
    public void testCreateUser_emailNull_nemIllegalArgumentException() {
        // Khai báo TRƯỚC KHI gọi phương thức ném exception
        thrown.expect(IllegalArgumentException.class);
        thrown.expectMessage("Email không được null");

        // Khi dòng này chạy, Rule sẽ bắt exception và kiểm tra
        userService.createUser(null, "Alice");
    }

    @Test
    public void testCreateUser_emailKhongHopLe_nemException() {
        thrown.expect(IllegalArgumentException.class);
        thrown.expectMessage(containsString("email không hợp lệ"));

        userService.createUser("not-an-email", "Bob");
    }
}
```

### `Timeout` — Giới hạn thời gian cho tất cả test

```java
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.Timeout;
import java.util.concurrent.TimeUnit;

public class PerformanceTest {

    // Áp dụng timeout cho TẤT CẢ test trong lớp này
    @Rule
    public Timeout globalTimeout = Timeout.seconds(5);

    @Test
    public void testQuickOperation_hoanThanhDuoi5Giay() {
        // Nếu test này chạy quá 5 giây sẽ tự động fail
        processData(smallDataset);
    }

    @Test
    public void testAnotherOperation_hoanThanhDuoi5Giay() {
        sortData(mediumDataset);
    }
}
```

### `ErrorCollector` — Thu thập nhiều lỗi trong một test

Mặc định, test dừng ngay khi gặp assertion đầu tiên thất bại. `ErrorCollector` cho phép tiếp tục và thu thập TẤT CẢ lỗi:

```java
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ErrorCollector;
import static org.hamcrest.CoreMatchers.*;

public class UserValidationTest {

    @Rule
    public ErrorCollector collector = new ErrorCollector();

    @Test
    public void testValidateUser_kiemTraNhieuDieuKien_baoCaoTatCaLoi() {
        User user = userService.getUser(1L);

        // Dù assertion đầu tiên fail, test vẫn tiếp tục chạy
        collector.checkThat("Tên người dùng", user.getName(), is("Alice"));
        collector.checkThat("Email", user.getEmail(), containsString("@"));
        collector.checkThat("Tuổi", user.getAge(), greaterThan(0));
        collector.checkThat("Vai trò", user.getRole(), is("USER"));
        // Cuối cùng, tất cả lỗi được báo cáo cùng một lúc
    }
}
```

### `TestName` — Lấy tên phương thức test hiện tại

```java
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TestName;

public class LoggingTest {

    @Rule
    public TestName testName = new TestName();

    @Test
    public void testSomething() {
        System.out.println("Đang chạy test: " + testName.getMethodName());
        // In ra: "Đang chạy test: testSomething"
    }
}
```

### `TestWatcher` — Theo dõi kết quả test

```java
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TestWatcher;
import org.junit.runner.Description;

public class WatchedTest {

    @Rule
    public TestWatcher watcher = new TestWatcher() {

        @Override
        protected void succeeded(Description description) {
            System.out.println("PASS: " + description.getMethodName());
        }

        @Override
        protected void failed(Throwable e, Description description) {
            System.out.println("FAIL: " + description.getMethodName() + " - " + e.getMessage());
        }

        @Override
        protected void starting(Description description) {
            System.out.println("Bắt đầu: " + description.getMethodName());
        }

        @Override
        protected void finished(Description description) {
            System.out.println("Kết thúc: " + description.getMethodName());
        }
    };

    @Test
    public void testHopLe() {
        assertEquals(4, 2 + 2);
    }
}
```

## Tạo Custom Rule

Bạn có thể tạo Rule tùy chỉnh bằng cách implement `TestRule`:

```java
import org.junit.rules.TestRule;
import org.junit.runner.Description;
import org.junit.runners.model.Statement;

// Custom Rule: ghi log thời gian thực thi test
public class ExecutionTimeRule implements TestRule {

    @Override
    public Statement apply(Statement base, Description description) {
        return new Statement() {
            @Override
            public void evaluate() throws Throwable {
                long startTime = System.currentTimeMillis();
                try {
                    base.evaluate(); // Chạy test thực sự
                } finally {
                    long elapsed = System.currentTimeMillis() - startTime;
                    System.out.printf("Test '%s' chạy trong %d ms%n",
                        description.getMethodName(), elapsed);
                }
            }
        };
    }
}

// Sử dụng Custom Rule
public class MyTest {

    @Rule
    public ExecutionTimeRule timeRule = new ExecutionTimeRule();

    @Test
    public void testHeavyOperation() {
        performHeavyComputation();
    }
}
```

## `@ClassRule` — Rule cho toàn bộ lớp test

```java
import org.junit.ClassRule;
import org.junit.rules.ExternalResource;

public class DatabaseIntegrationTest {

    // Chạy MỘT LẦN trước/sau toàn bộ lớp test (phải là static)
    @ClassRule
    public static ExternalResource databaseResource = new ExternalResource() {

        @Override
        protected void before() {
            Database.startEmbeddedServer();
            Database.createTestSchema();
        }

        @Override
        protected void after() {
            Database.dropTestSchema();
            Database.stopEmbeddedServer();
        }
    };

    @Test
    public void testInsert() { ... }

    @Test
    public void testQuery() { ... }
}
```

## Thuật ngữ quan trọng

| Thuật ngữ | Giải thích |
|---|---|
| **Rule** | Đối tượng bao quanh test để thêm hành vi trước/sau |
| **Interceptor** | Thành phần chặn và xử lý trước/sau một hành động |
| **Statement** | Đối tượng đại diện cho quá trình thực thi test trong JUnit |
| **ExternalResource** | Rule tiện ích cho tài nguyên bên ngoài cần setup/teardown |
| **TestWatcher** | Rule theo dõi kết quả pass/fail của test |
