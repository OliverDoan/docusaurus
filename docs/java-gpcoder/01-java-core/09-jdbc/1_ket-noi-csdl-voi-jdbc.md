---
sidebar_position: 1
title: "Hướng dẫn kết nối cơ sở dữ liệu với Java JDBC"
---

# Hướng dẫn kết nối cơ sở dữ liệu với Java JDBC

JDBC là API chuẩn của Java giúp ứng dụng kết nối và làm việc với cơ sở dữ liệu như MySQL, PostgreSQL, Oracle... Đây là kiến thức nền tảng vì hầu hết ứng dụng thực tế đều cần lưu trữ và truy xuất dữ liệu. Bài này hướng dẫn các thành phần chính của JDBC và cách viết code kết nối tới cơ sở dữ liệu một cách an toàn.

## JDBC là gì?

**JDBC** (Java Database Connectivity — API chuẩn của Java để kết nối và thao tác với cơ sở dữ liệu quan hệ) là một tập hợp các interface và class nằm trong gói `java.sql`, cho phép ứng dụng Java giao tiếp với bất kỳ hệ quản trị cơ sở dữ liệu nào như MySQL, PostgreSQL, Oracle, SQLite...

**JDBC Driver** (trình điều khiển JDBC) là thư viện do nhà cung cấp cơ sở dữ liệu cung cấp, đóng vai trò cầu nối giữa code Java và hệ quản trị cơ sở dữ liệu cụ thể. Mỗi loại cơ sở dữ liệu có một driver riêng.

---

## Các thành phần chính

| Thành phần | Vai trò |
|---|---|
| `DriverManager` | Quản lý danh sách driver, tạo kết nối tới cơ sở dữ liệu |
| `Connection` | Đại diện cho một phiên kết nối với cơ sở dữ liệu |
| `Statement` | Thực thi câu lệnh SQL đơn giản |
| `PreparedStatement` | Thực thi câu lệnh SQL có tham số, an toàn hơn `Statement` |
| `ResultSet` | Lưu trữ kết quả trả về từ câu truy vấn |

---

## Các bước kết nối cơ sở dữ liệu bằng JDBC

Quy trình kết nối cơ sở dữ liệu với JDBC gồm 4 bước cơ bản:

1. **Thêm JDBC Driver** vào project (dependency).
2. **Đăng ký driver** (từ JDBC 4.0 trở đi, bước này tự động).
3. **Tạo kết nối** qua `DriverManager.getConnection()`.
4. **Đóng kết nối** sau khi dùng xong để giải phóng tài nguyên.

---

## Ví dụ: Kết nối MySQL bằng JDBC

### 1. Thêm dependency (Maven)

```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <version>8.3.0</version>
</dependency>
```

### 2. Viết code kết nối

```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class JdbcConnectionExample {

    // URL kết nối theo định dạng: jdbc:<loại-db>://<host>:<port>/<tên-db>
    private static final String URL      = "jdbc:mysql://localhost:3306/mydb";
    private static final String USERNAME = "root";
    private static final String PASSWORD = "secret";

    public static void main(String[] args) {
        // try-with-resources tự động đóng Connection khi thoát khỏi khối try
        try (Connection connection = DriverManager.getConnection(URL, USERNAME, PASSWORD)) {

            if (connection != null) {
                System.out.println("Kết nối thành công!");
                System.out.println("Catalog: " + connection.getCatalog());
            }

        } catch (SQLException e) {
            // SQLException: ngoại lệ xảy ra khi thao tác với cơ sở dữ liệu thất bại
            System.err.println("Lỗi kết nối: " + e.getMessage());
            System.err.println("SQLState: " + e.getSQLState());
            System.err.println("Error Code: " + e.getErrorCode());
        }
    }
}
```

---

## Giải thích chi tiết

### Connection URL

**Connection URL** (chuỗi URL kết nối) có dạng:

```
jdbc:<subprotocol>://<host>:<port>/<database>?<tham-so-tuy-chon>
```

Ví dụ với MySQL:

```
jdbc:mysql://localhost:3306/mydb?useSSL=false&serverTimezone=UTC
```

- `jdbc:mysql` — xác định loại driver cần dùng.
- `localhost:3306` — địa chỉ máy chủ và cổng mặc định của MySQL.
- `mydb` — tên cơ sở dữ liệu muốn kết nối.

### try-with-resources

Luôn dùng **try-with-resources** (cú pháp Java 7+ tự động gọi `.close()` khi kết thúc khối lệnh) để đảm bảo `Connection` được đóng đúng cách, tránh rò rỉ tài nguyên (**resource leak** — tình trạng tài nguyên không được giải phóng dù không còn dùng nữa).

### Thông tin nhạy cảm

Không nên đặt URL, tên đăng nhập và mật khẩu trực tiếp trong code. Trong thực tế, hãy đọc từ **biến môi trường** hoặc file cấu hình bên ngoài:

```java
String url      = System.getenv("DB_URL");
String username = System.getenv("DB_USERNAME");
String password = System.getenv("DB_PASSWORD");
```

---

## Kết nối với các cơ sở dữ liệu khác

| Cơ sở dữ liệu | Dependency (groupId:artifactId) | URL mẫu |
|---|---|---|
| MySQL | `com.mysql:mysql-connector-j` | `jdbc:mysql://localhost:3306/mydb` |
| PostgreSQL | `org.postgresql:postgresql` | `jdbc:postgresql://localhost:5432/mydb` |
| SQLite | `org.xerial:sqlite-jdbc` | `jdbc:sqlite:./mydb.db` |
| H2 (in-memory) | `com.h2database:h2` | `jdbc:h2:mem:testdb` |

---

## Tóm tắt

- JDBC là API chuẩn của Java để kết nối cơ sở dữ liệu.
- Dùng `DriverManager.getConnection(url, user, pass)` để lấy `Connection`.
- Luôn đóng `Connection` bằng try-with-resources.
- Không hardcode thông tin đăng nhập trong code nguồn.
