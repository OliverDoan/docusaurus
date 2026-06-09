---
sidebar_position: 12
title: "Null Object Pattern"
---

# Java Design Pattern - Null Object

Null Object là mẫu thiết kế hành vi dùng một đối tượng "rỗng" với hành vi mặc định không làm gì để thay cho giá trị `null`. Nhờ vậy code không phải kiểm tra `null` lặp đi lặp lại và tránh được lỗi `NullPointerException`. Pattern này hay dùng cho logger, cache hay event handler khi muốn "tắt" chức năng một cách an toàn. Bài này giới thiệu tổng quan; phần chi tiết và ví dụ Java nằm bên dưới.

## Mục đích

**Null Object** (Đối tượng Null) là một mẫu thiết kế hành vi cung cấp một đối tượng với hành vi mặc định "không làm gì" thay thế cho giá trị `null`. Điều này giúp loại bỏ các kiểm tra `null` lặp đi lặp lại trong code, tránh `NullPointerException`.

## Vấn đề giải quyết

Khi client thường xuyên phải kiểm tra `if (object != null)` trước khi sử dụng, code trở nên dài dòng và dễ quên, dẫn đến `NullPointerException`. Null Object thay thế `null` bằng một đối tượng "rỗng" tuân thủ cùng interface nhưng không làm gì.

## Cấu trúc

- **AbstractObject** (interface/abstract): định nghĩa hành vi của đối tượng thực.
- **RealObject**: triển khai hành vi thực sự.
- **NullObject**: triển khai cùng interface nhưng không làm gì (no-op) hoặc trả về giá trị mặc định.
- **Client**: sử dụng AbstractObject mà không cần kiểm tra null.

## Ví dụ Java: Hệ thống logging

```java
// AbstractObject: Logger interface
interface Logger {
    void log(String message);
    void warn(String message);
    void error(String message);
    boolean isEnabled();
}

// RealObject: Logger thực
class ConsoleLogger implements Logger {
    private String prefix;

    public ConsoleLogger(String prefix) {
        this.prefix = prefix;
    }

    @Override
    public void log(String message) {
        System.out.println("[INFO][" + prefix + "] " + message);
    }

    @Override
    public void warn(String message) {
        System.out.println("[WARN][" + prefix + "] " + message);
    }

    @Override
    public void error(String message) {
        System.err.println("[ERROR][" + prefix + "] " + message);
    }

    @Override
    public boolean isEnabled() { return true; }
}

// NullObject: Logger giả — không làm gì
class NullLogger implements Logger {
    // Singleton vì không có trạng thái
    private static final NullLogger INSTANCE = new NullLogger();

    private NullLogger() {}

    public static NullLogger getInstance() { return INSTANCE; }

    @Override public void log(String message)   { /* không làm gì */ }
    @Override public void warn(String message)  { /* không làm gì */ }
    @Override public void error(String message) { /* không làm gì */ }
    @Override public boolean isEnabled()        { return false; }
}

// Client: Service sử dụng Logger
class UserService {
    private Logger logger;

    // Nếu không truyền logger, dùng NullLogger thay vì null
    public UserService() {
        this(NullLogger.getInstance());
    }

    public UserService(Logger logger) {
        this.logger = logger;
    }

    public void createUser(String name) {
        // Không cần kiểm tra if (logger != null)
        logger.log("Bắt đầu tạo người dùng: " + name);

        if (name == null || name.isBlank()) {
            logger.warn("Tên người dùng không hợp lệ.");
            return;
        }

        // Logic tạo user...
        logger.log("Tạo người dùng thành công: " + name);
    }

    public void deleteUser(int id) {
        logger.log("Xóa người dùng ID: " + id);
        // Logic xóa user...
        logger.warn("Người dùng ID " + id + " đã bị xóa.");
    }
}

// Client
public class NullObjectDemo {
    public static void main(String[] args) {
        System.out.println("=== Chế độ có logging ===");
        UserService serviceWithLog = new UserService(new ConsoleLogger("UserService"));
        serviceWithLog.createUser("Nguyễn Văn An");
        serviceWithLog.createUser("");  // Tên rỗng
        serviceWithLog.deleteUser(42);

        System.out.println("\n=== Chế độ tắt logging (dùng NullLogger) ===");
        UserService serviceNoLog = new UserService(); // Dùng NullLogger
        serviceNoLog.createUser("Trần Thị Bình");     // Không in gì
        serviceNoLog.deleteUser(99);                   // Không in gì
        System.out.println("(Không có output từ logger — NullLogger đang hoạt động)");

        System.out.println("\n=== So sánh isEnabled ===");
        Logger real = new ConsoleLogger("test");
        Logger nullLog = NullLogger.getInstance();
        System.out.println("Real logger enabled: " + real.isEnabled());
        System.out.println("Null logger enabled: " + nullLog.isEnabled());
    }
}
```

**Kết quả:**
```
=== Chế độ có logging ===
[INFO][UserService] Bắt đầu tạo người dùng: Nguyễn Văn An
[INFO][UserService] Tạo người dùng thành công: Nguyễn Văn An
[INFO][UserService] Bắt đầu tạo người dùng:
[WARN][UserService] Tên người dùng không hợp lệ.
[INFO][UserService] Xóa người dùng ID: 42
[WARN][UserService] Người dùng ID 42 đã bị xóa.

=== Chế độ tắt logging (dùng NullLogger) ===
(Không có output từ logger — NullLogger đang hoạt động)

=== So sánh isEnabled ===
Real logger enabled: true
Null logger enabled: false
```

:::tip Trong Java thực tế
`Optional` trong Java 8+ là cách hiện đại để xử lý giá trị có thể null trong luồng xử lý đơn lẻ. Null Object Pattern phù hợp hơn khi bạn cần một đối tượng có thể gọi phương thức liên tục mà không cần kiểm tra null — đặc biệt với dependency injection (tiêm phụ thuộc).
:::

## Ưu điểm

- Loại bỏ hoàn toàn các kiểm tra `null` trong code client.
- Tránh `NullPointerException` một cách có hệ thống.
- Code client đơn giản, dễ đọc hơn.
- NullObject thường là Singleton vì không có trạng thái.

## Nhược điểm

- Có thể che giấu lỗi logic — đôi khi `null` là dấu hiệu cho thấy có gì đó sai, không nên im lặng bỏ qua.
- Tạo thêm lớp cho mỗi interface cần Null Object.
- Không phù hợp khi client cần phân biệt "không tồn tại" với "tồn tại nhưng rỗng".

## Khi nào dùng

- Khi một đối tượng thường xuyên được kiểm tra `null` trước khi dùng.
- Khi hành vi "không làm gì" là hợp lệ và có nghĩa trong domain.
- Ví dụ thực tế: `NullLogger` (tắt log), `NullEventHandler` (bỏ qua sự kiện), `NullCache` (không cache), `Collections.emptyList()` trong Java — một dạng Null Object cho danh sách rỗng.
