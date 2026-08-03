---
sidebar_position: 6
title: "6. Xử lý ngoại lệ"
---

# Xử lý ngoại lệ

> *Ngoại lệ (exception) là cơ chế quan trọng giúp chương trình Java xử lý lỗi một cách có kiểm soát — hiểu rõ exception là nền tảng để viết code bền vững và chuyên nghiệp.*

:::note[Ghi nhớ nhanh]

- ⭐ **`checked` vs `unchecked`** — `checked` kế thừa `Exception` (không phải `RuntimeException`), bị compiler bắt buộc `try-catch`/`throws`; `unchecked` kế thừa `RuntimeException` cho lỗi lập trình, không bắt buộc xử lý.
- ⭐ **`try-with-resources`** (Java 7) — tự động gọi `close()` trên mọi resource implement `AutoCloseable`, tránh resource leak và không cần `finally` thủ công.
- **`NullPointerException`** — là `RuntimeException` khi dùng tham chiếu `null`; phòng tránh bằng kiểm tra `null`, `Optional`, `Objects.requireNonNull()`, annotation `@NonNull`.
- **Suppressed exceptions** — khi cả khối `try` lẫn `close()` cùng ném lỗi, `try-with-resources` lưu lỗi phụ vào suppressed thay vì che khuất lỗi gốc như `try-finally`.
- **Nhiều resource** — khai báo nhiều resource sẽ được đóng theo thứ tự ngược lại với thứ tự khai báo.

:::

---

## Câu 1: NullPointerException là gì và làm thế nào để phòng tránh? `[Basic]`

### Câu hỏi

> *"Bạn có thể giải thích NullPointerException là gì không? Bạn thường gặp nó trong trường hợp nào và cách phòng tránh ra sao?"*

### Giải thích lý thuyết

**NullPointerException (NPE)** là một `RuntimeException` xảy ra khi chương trình cố gắng sử dụng một tham chiếu (reference) đang trỏ tới `null` — tức là không trỏ tới bất kỳ đối tượng nào trong bộ nhớ.

Các tình huống thường gặp NPE:

- Gọi phương thức trên một biến đang là `null`. Ví dụ: `str.length()` khi `str` chưa được gán giá trị.
- Truy cập field (trường) của một object `null`.
- Duyệt mảng hoặc collection có phần tử `null` mà không kiểm tra trước.
- Unboxing (chuyển từ `Integer` sang `int`) khi giá trị là `null`.

**Các cách phòng tránh:**

1. **Kiểm tra `null` trước khi dùng** — cách đơn giản nhất.
2. **Sử dụng `Optional`** (từ Java 8) — bọc giá trị có thể `null` trong một container rõ ràng, buộc lập trình viên xử lý trường hợp không có giá trị.
3. **Dùng `Objects.requireNonNull()`** — ném NPE sớm với thông báo rõ ràng thay vì để lỗi xuất hiện muộn.
4. **Dùng annotation `@NonNull` / `@Nullable`** từ các thư viện như Lombok hoặc JetBrains để IDE cảnh báo tại compile time.
5. **Áp dụng Null Object Pattern** — thay thế `null` bằng một đối tượng "rỗng" có hành vi mặc định.

### Code minh hoạ

```java
import java.util.Optional;
import java.util.Objects;

public class NullPointerDemo {

    // CÁCH SAI: Không kiểm tra null, dễ gây NPE
    public static int getLengthBad(String str) {
        return str.length(); // NPE nếu str == null
    }

    // CÁCH 1: Kiểm tra null thủ công
    public static int getLengthSafe(String str) {
        if (str == null) {
            return 0; // Trả về giá trị mặc định
        }
        return str.length();
    }

    // CÁCH 2: Dùng Optional để tránh null
    public static Optional<String> findUser(String id) {
        // Giả sử database trả về null nếu không tìm thấy
        String user = id.equals("1") ? "Alice" : null;
        return Optional.ofNullable(user); // Bọc trong Optional
    }

    // CÁCH 3: Objects.requireNonNull — fail sớm với thông báo rõ ràng
    public static void processUser(String name) {
        // Ném NPE ngay tại đây với message rõ ràng thay vì lỗi mơ hồ sau này
        Objects.requireNonNull(name, "Tên người dùng không được null");
        System.out.println("Xử lý user: " + name);
    }

    public static void main(String[] args) {
        // Sử dụng Optional đúng cách
        Optional<String> user = findUser("99");
        String name = user.orElse("Khách"); // Giá trị mặc định nếu không có
        System.out.println("Tên: " + name); // In ra: Tên: Khách

        // Optional với orElseThrow
        user.orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }
}
```

### Đáp án mẫu

> "NullPointerException xảy ra khi tôi gọi phương thức hoặc truy cập field trên một biến đang là null. Để phòng tránh, tôi ưu tiên dùng `Optional` từ Java 8 để biểu đạt rõ ràng rằng giá trị có thể không tồn tại, thay vì dùng null ngầm định. Với constructor và phương thức public, tôi dùng `Objects.requireNonNull()` để fail nhanh với thông báo rõ ràng. Trong các dự án thực tế, tôi cũng dùng annotation `@NonNull` để IDE cảnh báo tại thời điểm viết code."

---

## Câu 2: Checked exception và unchecked exception khác nhau thế nào? `[Basic]`

### Câu hỏi

> *"Hãy phân biệt checked exception và unchecked exception trong Java. Khi nào nên dùng loại nào?"*

### Giải thích lý thuyết

Java chia exception thành hai nhóm chính dựa trên cách compiler kiểm tra:

**Checked exception** (ngoại lệ được kiểm tra tại compile time):
- Kế thừa từ `Exception` nhưng KHÔNG phải `RuntimeException`.
- Compiler **bắt buộc** lập trình viên phải xử lý (dùng `try-catch`) hoặc khai báo (`throws`) trong chữ ký phương thức.
- Đại diện cho các lỗi **có thể dự đoán được** từ bên ngoài chương trình (hệ thống file, mạng, database).
- Ví dụ: `IOException`, `SQLException`, `FileNotFoundException`.

**Unchecked exception** (ngoại lệ không bị kiểm tra tại compile time):
- Kế thừa từ `RuntimeException` hoặc `Error`.
- Compiler **không bắt buộc** xử lý — lập trình viên có thể bắt hoặc bỏ qua.
- Đại diện cho lỗi **lập trình** (bug trong code), thường không thể recover được.
- Ví dụ: `NullPointerException`, `ArrayIndexOutOfBoundsException`, `IllegalArgumentException`.

| Tiêu chí | Checked Exception | Unchecked Exception |
|---|---|---|
| Kế thừa từ | `Exception` (không phải `RuntimeException`) | `RuntimeException` hoặc `Error` |
| Compiler kiểm tra | Có — bắt buộc xử lý | Không |
| Nguyên nhân thường gặp | Lỗi từ môi trường bên ngoài | Lỗi logic trong code |
| Ví dụ | `IOException`, `SQLException` | `NPE`, `IllegalArgumentException` |
| Khi nào dùng | Khi caller có thể xử lý và recover | Khi là bug cần fix trong code |

### Code minh hoạ

```java
import java.io.*;

public class ExceptionTypesDemo {

    // Checked exception: Phải khai báo throws hoặc dùng try-catch
    // IOException xảy ra khi đọc file thất bại — caller cần xử lý
    public static String readFile(String path) throws IOException {
        try (BufferedReader reader = new BufferedReader(new FileReader(path))) {
            return reader.readLine();
        }
        // Không cần catch ở đây vì đã khai báo throws IOException
        // Compiler sẽ bắt buộc nơi gọi phương thức này phải xử lý
    }

    // Unchecked exception: Không cần khai báo throws
    // IllegalArgumentException là lỗi lập trình — đầu vào không hợp lệ
    public static int divide(int a, int b) {
        if (b == 0) {
            // Ném unchecked exception để báo lỗi logic
            throw new IllegalArgumentException("Số chia không được bằng 0");
        }
        return a / b;
    }

    // Custom checked exception
    public static class InsufficientFundsException extends Exception {
        private final double amount;

        public InsufficientFundsException(double amount) {
            super("Không đủ số dư, thiếu: " + amount);
            this.amount = amount;
        }

        public double getAmount() { return amount; }
    }

    // Custom unchecked exception
    public static class InvalidUserStateException extends RuntimeException {
        public InvalidUserStateException(String message) {
            super(message);
        }
    }

    public static void main(String[] args) {
        // Xử lý checked exception — compiler bắt buộc
        try {
            String content = readFile("data.txt");
            System.out.println(content);
        } catch (IOException e) {
            System.err.println("Không đọc được file: " + e.getMessage());
        }

        // Unchecked exception — không bắt buộc, nhưng có thể bắt
        try {
            int result = divide(10, 0);
        } catch (IllegalArgumentException e) {
            System.err.println("Lỗi tham số: " + e.getMessage());
        }
    }
}
```

### Đáp án mẫu

> "Checked exception là các ngoại lệ mà compiler bắt buộc tôi phải xử lý hoặc khai báo, thường dùng cho lỗi đến từ bên ngoài như đọc file hay kết nối mạng — những tình huống caller có thể xử lý và phục hồi được. Unchecked exception thì không bị compiler kiểm tra, thường là `RuntimeException`, đại diện cho lỗi lập trình như truyền sai tham số hay truy cập null — đây là bug cần sửa trong code, không phải xử lý runtime. Trong thiết kế API, tôi dùng checked exception khi muốn buộc người dùng API phải nghĩ đến trường hợp lỗi, và unchecked exception cho các vi phạm contract rõ ràng."

---

## Câu 3: try-with-resources là gì? `[Intermediate]`

### Câu hỏi

> *"Bạn hiểu gì về try-with-resources trong Java? Tại sao nên dùng nó thay vì try-finally truyền thống?"*

### Giải thích lý thuyết

**try-with-resources** (giới thiệu từ Java 7) là cú pháp đặc biệt tự động đóng các tài nguyên (resource) sau khi khối `try` kết thúc — dù thành công hay gặp exception.

**Điều kiện**: Resource phải implement interface `AutoCloseable` (hoặc `Closeable` — subinterface của `AutoCloseable`). Interface này chỉ có một phương thức duy nhất: `close()`.

**Tại sao tốt hơn try-finally?**

1. **Code ngắn gọn hơn** — không cần viết `finally` để đóng resource thủ công.
2. **An toàn hơn** — tránh tình huống quên đóng resource gây **resource leak** (rò rỉ tài nguyên như file handle, database connection).
3. **Xử lý exception đúng hơn** — trong `try-finally`, nếu cả `try` và `finally` đều ném exception, exception trong `finally` sẽ **che khuất** exception gốc. `try-with-resources` lưu exception phụ vào **suppressed exceptions**, không mất thông tin.
4. **Hỗ trợ nhiều resource** — có thể khai báo nhiều resource, chúng sẽ được đóng theo thứ tự **ngược lại** với thứ tự khai báo.

### Code minh hoạ

```java
import java.io.*;
import java.sql.*;

public class TryWithResourcesDemo {

    // CÁCH CŨ: try-finally — dễ gây resource leak và code dài
    public static String readFileLegacy(String path) throws IOException {
        BufferedReader reader = null;
        try {
            reader = new BufferedReader(new FileReader(path));
            return reader.readLine();
        } finally {
            // Phải nhớ đóng thủ công — dễ quên, dễ lỗi
            if (reader != null) {
                try {
                    reader.close(); // close() cũng có thể ném IOException!
                } catch (IOException e) {
                    // Exception ở đây sẽ che khuất exception gốc từ readLine()
                }
            }
        }
    }

    // CÁCH MỚI: try-with-resources — tự động đóng, an toàn và gọn
    public static String readFileModern(String path) throws IOException {
        // BufferedReader và FileReader đều implement Closeable (con của AutoCloseable)
        // Chúng sẽ tự động được đóng khi khối try kết thúc
        try (BufferedReader reader = new BufferedReader(new FileReader(path))) {
            return reader.readLine();
        }
        // Không cần finally — compiler tự sinh code đóng reader
    }

    // Nhiều resource: đóng theo thứ tự ngược lại (conn đóng sau stmt)
    public static void queryDatabase(String url) throws SQLException {
        try (Connection conn = DriverManager.getConnection(url);
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM users")) {

            ResultSet rs = stmt.executeQuery();
            // Xử lý kết quả...
        }
        // stmt.close() được gọi trước, rồi mới conn.close()
    }

    // Tạo custom AutoCloseable resource
    public static class DatabaseConnection implements AutoCloseable {
        private final String name;

        public DatabaseConnection(String name) {
            this.name = name;
            System.out.println("Mở kết nối: " + name);
        }

        public void query(String sql) {
            System.out.println("Thực thi: " + sql);
        }

        @Override
        public void close() {
            // Được gọi tự động khi thoát khỏi try-with-resources
            System.out.println("Đóng kết nối: " + name);
        }
    }

    public static void main(String[] args) {
        // Custom resource tự động được đóng
        try (DatabaseConnection db = new DatabaseConnection("MySQL")) {
            db.query("SELECT * FROM products");
        } // db.close() được gọi tự động ở đây

        // Kiểm tra suppressed exceptions
        try (BufferedReader reader = new BufferedReader(new FileReader("test.txt"))) {
            String line = reader.readLine();
        } catch (IOException e) {
            // Nếu close() cũng ném exception, nó được lưu trong suppressed
            Throwable[] suppressed = e.getSuppressed();
            for (Throwable t : suppressed) {
                System.err.println("Exception bị chặn: " + t.getMessage());
            }
        }
    }
}
```

### Đáp án mẫu

> "try-with-resources là cú pháp từ Java 7 tự động gọi `close()` trên bất kỳ object nào implement `AutoCloseable` sau khi khối try kết thúc, dù thành công hay gặp exception. So với try-finally truyền thống, nó giải quyết hai vấn đề lớn: thứ nhất là tránh resource leak do lập trình viên quên đóng tài nguyên; thứ hai là xử lý exception đúng hơn — nếu cả try lẫn close đều ném exception, exception phụ được lưu vào suppressed exceptions thay vì che khuất exception gốc. Trong thực tế, tôi luôn dùng try-with-resources khi làm việc với file, database connection, hay network stream."

---
