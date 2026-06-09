---
sidebar_position: 2
title: "Sử dụng JDBC API thực thi câu lệnh truy vấn dữ liệu"
---

# Sử dụng JDBC API thực thi câu lệnh truy vấn dữ liệu

Sau khi đã kết nối được cơ sở dữ liệu, bước tiếp theo là thực thi các câu lệnh SQL để đọc và ghi dữ liệu. Bài này hướng dẫn cách dùng `Statement`, `PreparedStatement` và `ResultSet` để chạy SELECT, INSERT, UPDATE, DELETE, cũng như quản lý transaction và batch update. Đây là kỹ năng cốt lõi để thao tác dữ liệu an toàn và tránh lỗi SQL Injection.

## Các lớp thực thi SQL trong JDBC

Sau khi có `Connection`, JDBC cung cấp ba lớp để thực thi câu lệnh SQL:

| Lớp | Mô tả |
|---|---|
| `Statement` | Thực thi SQL tĩnh, không có tham số. Dễ bị **SQL Injection**. |
| `PreparedStatement` | SQL có tham số `?`, được biên dịch trước, an toàn và hiệu quả hơn. |
| `CallableStatement` | Gọi **stored procedure** (thủ tục lưu trữ sẵn trong cơ sở dữ liệu). |

**SQL Injection** (tấn công chèn SQL — kẻ xấu chèn đoạn SQL độc hại vào câu truy vấn) là lỗ hổng bảo mật nghiêm trọng. Luôn dùng `PreparedStatement` thay vì `Statement` khi câu SQL có dữ liệu người dùng nhập vào.

---

## 1. Truy vấn dữ liệu — SELECT

**`ResultSet`** (tập kết quả — đối tượng lưu trữ các hàng dữ liệu trả về từ câu SELECT) hoạt động như một con trỏ, ban đầu trỏ trước hàng đầu tiên. Mỗi lần gọi `.next()` sẽ di chuyển con trỏ xuống một hàng.

```java
import java.sql.*;

public class SelectExample {

    public static void main(String[] args) {
        String url  = "jdbc:mysql://localhost:3306/mydb";
        String user = "root";
        String pass = "secret";

        String sql = "SELECT id, name, email FROM users WHERE active = ?";

        try (Connection conn = DriverManager.getConnection(url, user, pass);
             // PreparedStatement: câu lệnh SQL được biên dịch trước với tham số ?
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setBoolean(1, true); // Gán giá trị cho tham số thứ 1

            // executeQuery(): thực thi câu SELECT, trả về ResultSet
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    int    id    = rs.getInt("id");
                    String name  = rs.getString("name");
                    String email = rs.getString("email");
                    System.out.printf("ID: %d | Tên: %s | Email: %s%n", id, name, email);
                }
            }

        } catch (SQLException e) {
            System.err.println("Lỗi truy vấn: " + e.getMessage());
        }
    }
}
```

---

## 2. Chèn dữ liệu — INSERT

```java
public static int insertUser(Connection conn, String name, String email) throws SQLException {
    String sql = "INSERT INTO users (name, email, active) VALUES (?, ?, ?)";

    // Statement.RETURN_GENERATED_KEYS: yêu cầu trả về khóa tự tăng vừa được tạo
    try (PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
        pstmt.setString(1, name);
        pstmt.setString(2, email);
        pstmt.setBoolean(3, true);

        // executeUpdate(): thực thi INSERT/UPDATE/DELETE, trả về số hàng bị ảnh hưởng
        int affectedRows = pstmt.executeUpdate();

        if (affectedRows == 0) {
            throw new SQLException("Thêm người dùng thất bại, không có hàng nào được tạo.");
        }

        // Lấy giá trị khóa tự tăng (auto-generated key) vừa được chèn
        try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
            if (generatedKeys.next()) {
                return generatedKeys.getInt(1);
            } else {
                throw new SQLException("Không lấy được ID vừa tạo.");
            }
        }
    }
}
```

---

## 3. Cập nhật dữ liệu — UPDATE

```java
public static int updateEmail(Connection conn, int userId, String newEmail) throws SQLException {
    String sql = "UPDATE users SET email = ? WHERE id = ?";

    try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
        pstmt.setString(1, newEmail);
        pstmt.setInt(2, userId);

        return pstmt.executeUpdate(); // Trả về số hàng được cập nhật
    }
}
```

---

## 4. Xóa dữ liệu — DELETE

```java
public static int deleteUser(Connection conn, int userId) throws SQLException {
    String sql = "DELETE FROM users WHERE id = ?";

    try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
        pstmt.setInt(1, userId);
        return pstmt.executeUpdate();
    }
}
```

---

## 5. Transaction

**Transaction** (giao dịch — một nhóm thao tác SQL thực hiện cùng nhau, hoặc tất cả thành công, hoặc tất cả thất bại) đảm bảo tính toàn vẹn dữ liệu.

- **`commit()`** — xác nhận tất cả thay đổi trong transaction.
- **`rollback()`** — hoàn tác toàn bộ thay đổi nếu có lỗi xảy ra.
- Mặc định JDBC ở chế độ **auto-commit** (tự động xác nhận sau mỗi câu SQL). Cần tắt đi khi dùng transaction thủ công.

```java
public static void transferMoney(Connection conn, int fromId, int toId, double amount)
        throws SQLException {

    conn.setAutoCommit(false); // Tắt auto-commit để quản lý transaction thủ công

    try {
        String deductSql = "UPDATE accounts SET balance = balance - ? WHERE id = ?";
        try (PreparedStatement deduct = conn.prepareStatement(deductSql)) {
            deduct.setDouble(1, amount);
            deduct.setInt(2, fromId);
            deduct.executeUpdate();
        }

        String addSql = "UPDATE accounts SET balance = balance + ? WHERE id = ?";
        try (PreparedStatement add = conn.prepareStatement(addSql)) {
            add.setDouble(1, amount);
            add.setInt(2, toId);
            add.executeUpdate();
        }

        conn.commit(); // Xác nhận transaction — cả hai thao tác đều thành công
        System.out.println("Chuyển tiền thành công.");

    } catch (SQLException e) {
        conn.rollback(); // Hoàn tác toàn bộ nếu có lỗi
        System.err.println("Chuyển tiền thất bại, đã hoàn tác: " + e.getMessage());
        throw e;

    } finally {
        conn.setAutoCommit(true); // Khôi phục chế độ auto-commit
    }
}
```

---

## 6. Batch Update — Thực thi nhiều lệnh cùng lúc

**Batch** (xử lý hàng loạt — gom nhiều câu SQL thành một lần gửi tới cơ sở dữ liệu) giúp tăng hiệu năng đáng kể khi cần insert/update nhiều hàng.

```java
public static void batchInsert(Connection conn, List<String> names) throws SQLException {
    String sql = "INSERT INTO users (name) VALUES (?)";

    conn.setAutoCommit(false);
    try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
        for (String name : names) {
            pstmt.setString(1, name);
            pstmt.addBatch(); // Thêm câu lệnh vào batch, chưa thực thi ngay
        }

        int[] results = pstmt.executeBatch(); // Gửi toàn bộ batch một lần
        conn.commit();
        System.out.println("Đã chèn " + results.length + " bản ghi.");

    } catch (SQLException e) {
        conn.rollback();
        throw e;
    } finally {
        conn.setAutoCommit(true);
    }
}
```

---

## Tóm tắt

- Luôn dùng `PreparedStatement` với tham số `?` thay vì ghép chuỗi SQL để ngăn SQL Injection.
- `executeQuery()` dùng cho SELECT, `executeUpdate()` dùng cho INSERT/UPDATE/DELETE.
- Dùng `setAutoCommit(false)` + `commit()` / `rollback()` để quản lý transaction.
- Dùng `addBatch()` + `executeBatch()` để tăng hiệu năng khi thao tác nhiều hàng.
- Luôn đóng `Connection`, `PreparedStatement`, `ResultSet` bằng try-with-resources.
