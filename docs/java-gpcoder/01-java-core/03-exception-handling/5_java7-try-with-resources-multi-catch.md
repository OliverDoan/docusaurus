---
sidebar_position: 5
title: "Tính năng mới về ngoại lệ trong Java 7: try-with-resources và multi-catch"
---

# Tính năng mới về ngoại lệ trong Java 7: try-with-resources và multi-catch

Java 7 giới thiệu hai cải tiến quan trọng giúp code xử lý **Exception** (ngoại lệ) trở nên gọn gàng, an toàn và dễ đọc hơn đáng kể.

---

## 1. Multi-catch — Bắt nhiều ngoại lệ trong một khối catch

Trước Java 7, nếu muốn xử lý nhiều loại ngoại lệ theo cùng một cách, bạn phải viết nhiều khối `catch` riêng biệt.

**Cách cũ (trước Java 7):**

```java
try {
    // một số thao tác
} catch (IOException e) {
    System.out.println("Lỗi IO: " + e.getMessage());
    e.printStackTrace();
} catch (SQLException e) {
    System.out.println("Lỗi SQL: " + e.getMessage());
    e.printStackTrace();
} catch (ClassNotFoundException e) {
    System.out.println("Lỗi class: " + e.getMessage());
    e.printStackTrace();
}
```

**Cách mới từ Java 7 — Multi-catch:**

```java
try {
    // một số thao tác
} catch (IOException | SQLException | ClassNotFoundException e) {
    // Xử lý chung cho cả ba loại ngoại lệ
    System.out.println("Có lỗi xảy ra: " + e.getMessage());
    e.printStackTrace();
}
```

Dùng ký tự `|` (pipe) để ngăn cách giữa các loại ngoại lệ.

**Lưu ý quan trọng về Multi-catch:**

```java
// Không được dùng ngoại lệ có quan hệ cha-con trong cùng multi-catch
// LỖI BIÊN DỊCH: IOException là lớp cha của FileNotFoundException
// catch (IOException | FileNotFoundException e) { } // COMPILE ERROR!

// Đúng: chỉ dùng IOException là đủ (đã bao gồm FileNotFoundException)
catch (IOException e) { }
```

---

## 2. try-with-resources — Tự động đóng tài nguyên

**Resource** (tài nguyên) là bất kỳ đối tượng nào cần được đóng sau khi dùng xong: file, kết nối database, kết nối mạng... Trước Java 7, lập trình viên phải đóng tài nguyên thủ công trong khối `finally`.

**Cách cũ (trước Java 7) — dễ quên đóng tài nguyên:**

```java
import java.io.*;

public class DocFileCu {
    public static void main(String[] args) {
        BufferedReader reader = null;
        try {
            reader = new BufferedReader(new FileReader("data.txt"));
            String dong;
            while ((dong = reader.readLine()) != null) {
                System.out.println(dong);
            }
        } catch (IOException e) {
            System.out.println("Lỗi đọc file: " + e.getMessage());
        } finally {
            // Phải tự nhớ đóng trong finally
            if (reader != null) {
                try {
                    reader.close(); // Ngay cả việc đóng cũng có thể ném IOException!
                } catch (IOException e) {
                    System.out.println("Lỗi đóng file: " + e.getMessage());
                }
            }
        }
    }
}
```

**Cách mới từ Java 7 — try-with-resources:**

```java
import java.io.*;

public class DocFileMoi {
    public static void main(String[] args) {
        // Tài nguyên khai báo trong () sẽ tự động được đóng khi khối try kết thúc
        try (BufferedReader reader = new BufferedReader(new FileReader("data.txt"))) {
            String dong;
            while ((dong = reader.readLine()) != null) {
                System.out.println(dong);
            }
        } catch (IOException e) {
            System.out.println("Lỗi đọc file: " + e.getMessage());
        }
        // reader.close() được gọi tự động — kể cả khi có ngoại lệ xảy ra
    }
}
```

### 2.1. Khai báo nhiều tài nguyên

```java
import java.io.*;
import java.sql.*;

public class NhieuTaiNguyen {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:mysql://localhost:3306/mydb";

        // Nhiều tài nguyên ngăn cách bởi dấu ;
        // Thứ tự đóng: ngược lại với thứ tự khai báo (stmt đóng trước, conn đóng sau)
        try (Connection conn = DriverManager.getConnection(url, "user", "pass");
             Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery("SELECT * FROM users");
            while (rs.next()) {
                System.out.println(rs.getString("name"));
            }
        } catch (SQLException e) {
            System.out.println("Lỗi database: " + e.getMessage());
        }
    }
}
```

### 2.2. Yêu cầu: AutoCloseable interface

Để dùng được với try-with-resources, lớp tài nguyên phải **implement** (triển khai) **`AutoCloseable`** (giao diện tự đóng) hoặc `Closeable`.

```java
// Tạo tài nguyên tùy chỉnh có thể dùng với try-with-resources
public class KetNoiDatabase implements AutoCloseable {

    private String tenKetNoi;

    public KetNoiDatabase(String ten) {
        this.tenKetNoi = ten;
        System.out.println("Mở kết nối: " + tenKetNoi);
    }

    public void truyVan(String sql) {
        System.out.println("Thực thi truy vấn: " + sql);
    }

    // Phương thức close() được gọi tự động
    @Override
    public void close() {
        System.out.println("Đóng kết nối: " + tenKetNoi);
    }

    public static void main(String[] args) {
        try (KetNoiDatabase db = new KetNoiDatabase("MySQL-Primary")) {
            db.truyVan("SELECT * FROM products");
        }
        // Output:
        // Mở kết nối: MySQL-Primary
        // Thực thi truy vấn: SELECT * FROM products
        // Đóng kết nối: MySQL-Primary
    }
}
```

---

## 3. Kết hợp cả hai tính năng

```java
import java.io.*;
import java.sql.*;

public class XuLyDonHang {

    public void nhapDonHang(String duongDanFile) {
        // try-with-resources + multi-catch
        try (BufferedReader reader = new BufferedReader(new FileReader(duongDanFile))) {

            String dong;
            while ((dong = reader.readLine()) != null) {
                xuLyDong(dong);
            }

        } catch (FileNotFoundException e) {
            System.out.println("Không tìm thấy file: " + duongDanFile);
        } catch (IOException | NumberFormatException e) {
            // Multi-catch cho hai loại lỗi xử lý giống nhau
            System.out.println("Lỗi đọc hoặc phân tích dữ liệu: " + e.getMessage());
        }
    }

    private void xuLyDong(String dong) {
        // Giả sử mỗi dòng là một số
        int soLuong = Integer.parseInt(dong.trim());
        System.out.println("Số lượng đơn hàng: " + soLuong);
    }
}
```

---

## Tóm tắt

| Tính năng | Lợi ích |
|---|---|
| **Multi-catch** (`A \| B`) | Giảm code trùng lặp khi nhiều ngoại lệ xử lý giống nhau |
| **try-with-resources** | Tự động đóng tài nguyên, tránh **resource leak** (rò rỉ tài nguyên) |
