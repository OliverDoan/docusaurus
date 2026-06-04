---
sidebar_position: 3
title: "Giới thiệu JDBC Connection Pool"
---

# Giới thiệu JDBC Connection Pool

## Vấn đề với kết nối trực tiếp

Khi dùng `DriverManager.getConnection()` để tạo kết nối mỗi lần truy vấn, ứng dụng phải thực hiện nhiều bước tốn thời gian:

1. Mở socket TCP tới máy chủ cơ sở dữ liệu.
2. Xác thực (authentication) tài khoản.
3. Khởi tạo phiên làm việc (session) phía server.
4. Đóng kết nối và giải phóng tài nguyên sau khi dùng xong.

Mỗi kết nối mất vài chục đến vài trăm millisecond. Với hàng trăm request mỗi giây, đây là nút thắt cổ chai (**bottleneck** — điểm gây chậm toàn bộ hệ thống) nghiêm trọng.

---

## Connection Pool là gì?

**Connection Pool** (bể kết nối — cơ chế duy trì sẵn một tập hợp các `Connection` đã mở, cho mượn khi cần và thu hồi khi dùng xong) giải quyết vấn đề trên bằng cách:

- Tạo trước một số lượng kết nối khi khởi động ứng dụng.
- Khi cần, lấy kết nối có sẵn từ pool thay vì tạo mới.
- Khi xong việc, trả kết nối về pool để tái sử dụng (thay vì đóng thật sự).

```
Không có pool:   [Request] → Tạo kết nối → Truy vấn → Đóng kết nối  (chậm)
Có pool:         [Request] → Lấy từ pool → Truy vấn → Trả về pool   (nhanh)
```

---

## Các thư viện Connection Pool phổ biến

| Thư viện | Đặc điểm |
|---|---|
| **HikariCP** | Nhanh nhất, nhẹ nhất, mặc định trong Spring Boot |
| **c3p0** | Lâu đời, nhiều tùy chọn cấu hình |
| **Apache DBCP2** | Một phần của Apache Commons |
| **Tomcat JDBC Pool** | Tích hợp sẵn trong Tomcat |

---

## Ví dụ với HikariCP

### 1. Thêm dependency (Maven)

```xml
<dependency>
    <groupId>com.zaxxer</groupId>
    <artifactId>HikariCP</artifactId>
    <version>5.1.0</version>
</dependency>
```

### 2. Cấu hình và sử dụng HikariCP

```java
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class HikariCPExample {

    // DataSource là interface chuẩn JDBC đại diện cho nguồn kết nối (thay thế cho DriverManager)
    private static HikariDataSource dataSource;

    static {
        HikariConfig config = new HikariConfig();

        // Thông tin kết nối cơ bản
        config.setJdbcUrl("jdbc:mysql://localhost:3306/mydb");
        config.setUsername("root");
        config.setPassword("secret");

        // Kích thước pool
        config.setMinimumIdle(5);          // Số kết nối tối thiểu luôn duy trì
        config.setMaximumPoolSize(20);     // Số kết nối tối đa trong pool

        // Thời gian chờ (millisecond)
        config.setConnectionTimeout(30_000);   // Thời gian tối đa chờ lấy kết nối từ pool
        config.setIdleTimeout(600_000);        // Thời gian tối đa kết nối rảnh trước khi bị đóng
        config.setMaxLifetime(1_800_000);      // Tuổi thọ tối đa của một kết nối (30 phút)

        // Câu SQL kiểm tra kết nối còn sống hay không (connection validation query)
        config.setConnectionTestQuery("SELECT 1");

        dataSource = new HikariDataSource(config);
        System.out.println("HikariCP đã khởi tạo.");
    }

    public static Connection getConnection() throws SQLException {
        // Lấy kết nối từ pool — tự động trả về pool khi đóng (try-with-resources)
        return dataSource.getConnection();
    }

    public static void main(String[] args) {
        String sql = "SELECT id, name FROM users LIMIT ?";

        try (Connection conn  = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, 10);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    System.out.printf("ID: %d | Tên: %s%n",
                            rs.getInt("id"), rs.getString("name"));
                }
            }

        } catch (SQLException e) {
            System.err.println("Lỗi: " + e.getMessage());
        }
    }

    // Đóng pool khi ứng dụng tắt
    public static void shutdown() {
        if (dataSource != null && !dataSource.isClosed()) {
            dataSource.close();
        }
    }
}
```

---

## Ví dụ với c3p0

```java
import com.mchange.v2.c3p0.ComboPooledDataSource;

import java.beans.PropertyVetoException;

public class C3P0Example {

    public static ComboPooledDataSource createDataSource() throws PropertyVetoException {
        ComboPooledDataSource ds = new ComboPooledDataSource();

        // JDBC driver class name (tên lớp driver cần tải)
        ds.setDriverClass("com.mysql.cj.jdbc.Driver");
        ds.setJdbcUrl("jdbc:mysql://localhost:3306/mydb");
        ds.setUser("root");
        ds.setPassword("secret");

        ds.setMinPoolSize(3);              // Số kết nối tối thiểu
        ds.setMaxPoolSize(15);             // Số kết nối tối đa
        ds.setAcquireIncrement(3);         // Tạo thêm bao nhiêu kết nối khi pool cạn
        ds.setMaxIdleTime(1800);           // Giây — đóng kết nối rảnh quá lâu
        ds.setTestConnectionOnCheckout(true); // Kiểm tra kết nối trước khi cho mượn

        return ds;
    }
}
```

---

## Các thông số cần chú ý khi cấu hình pool

| Thông số | Ý nghĩa | Gợi ý |
|---|---|---|
| `maximumPoolSize` | Số kết nối tối đa | Bằng số CPU lõi × 2 + số ổ đĩa |
| `connectionTimeout` | Thời gian chờ lấy kết nối | 30 000 ms (30 giây) |
| `idleTimeout` | Kết nối rảnh tối đa trước khi đóng | 10 phút |
| `maxLifetime` | Tuổi thọ tối đa một kết nối | 30 phút (nhỏ hơn `wait_timeout` của MySQL) |

---

## Tóm tắt

- `DriverManager.getConnection()` tạo kết nối mới mỗi lần, tốn thời gian và tài nguyên.
- Connection Pool duy trì sẵn kết nối, cho mượn và thu hồi, giúp ứng dụng nhanh hơn nhiều.
- **HikariCP** là lựa chọn mặc định trong Spring Boot và được khuyến nghị cho dự án mới.
- Cấu hình `maximumPoolSize` phù hợp — quá nhỏ gây nghẽn, quá lớn gây quá tải server.
- Khi dùng try-with-resources với `Connection` từ pool, kết nối sẽ được trả về pool (không bị đóng thật sự).
