---
sidebar_position: 1
title: "1. JDBC (Java Database Connectivity)"
---

# JDBC -- Kết nối Database trong Java

**JDBC** (Java Database Connectivity) là API **chuẩn** của Java để giao tiếp với database **quan hệ** (MySQL, PostgreSQL, Oracle...). JDBC là **cấp thấp nhất** -- mọi framework ORM (Hibernate, JPA) đều dựa trên JDBC.

**Tương tự đơn giản:** JDBC giống **giao thức điện thoại quốc tế** -- bạn có thể gọi điện cho người ở bất kỳ nước nào, miễn họ có "máy điện thoại" (JDBC driver). Java không cần biết database cụ thể -- chỉ cần biết "ngôn ngữ" JDBC.

---

## Mục lục

- [1. JDBC là gì?](#1-jdbc-là-gì)
- [2. Kết nối Database](#2-kết-nối-database)
- [3. Statement và PreparedStatement](#3-statement-và-preparedstatement)
- [4. ResultSet -- đọc dữ liệu](#4-resultset-đọc-dữ-liệu)
- [5. Transaction](#5-transaction)
- [6. Connection Pool](#6-connection-pool)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. JDBC là gì?

JDBC cung cấp:

- **Driver Manager**: chọn JDBC driver phù hợp
- **Connection**: kết nối tới DB
- **Statement / PreparedStatement**: gửi SQL
- **ResultSet**: nhận kết quả query

### Thêm driver vào Maven

```xml
<!-- PostgreSQL -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.0</version>
</dependency>

<!-- MySQL -->
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <version>8.2.0</version>
</dependency>
```

---

## 2. Kết nối Database

```java
import java.sql.*;

public class JdbcDemo {
    public static void main(String[] args) throws SQLException {
        String url = "jdbc:postgresql://localhost:5432/mydb";
        String user = "postgres";
        String password = "secret";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("Da ket noi DB!");
            // ...
        }
    }
}
```

### URL format

```
jdbc:postgresql://host:port/database
jdbc:mysql://host:port/database?useSSL=false
jdbc:oracle:thin:@host:port:SID
jdbc:sqlserver://host:port;databaseName=db
jdbc:h2:mem:test                              (in-memory)
jdbc:sqlite:/path/to/file.db
```

---

## 3. Statement và PreparedStatement

### Statement (CŨ, KHÔNG NÊN dùng cho user input)

```java
try (Statement stmt = conn.createStatement()) {
    stmt.executeUpdate("INSERT INTO users(name) VALUES ('Alice')");
}
```

**Vấn đề:** Dễ bị **SQL Injection** nếu nối chuỗi từ user input.

### PreparedStatement (khuyến nghị)

```java
String sql = "INSERT INTO users (name, email, age) VALUES (?, ?, ?)";
try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
    pstmt.setString(1, "Alice");
    pstmt.setString(2, "alice@example.com");
    pstmt.setInt(3, 25);
    int rows = pstmt.executeUpdate();
    System.out.println(rows + " row inserted");
}
```

### Insert với return generated key

```java
String sql = "INSERT INTO users(name) VALUES (?)";
try (PreparedStatement pstmt = conn.prepareStatement(
        sql, Statement.RETURN_GENERATED_KEYS)) {
    pstmt.setString(1, "Alice");
    pstmt.executeUpdate();

    try (ResultSet keys = pstmt.getGeneratedKeys()) {
        if (keys.next()) {
            long id = keys.getLong(1);
            System.out.println("Generated ID: " + id);
        }
    }
}
```

### Batch insert (nhanh hơn nhiều)

```java
String sql = "INSERT INTO users(name) VALUES (?)";
try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
    for (String name : List.of("a", "b", "c", "d")) {
        pstmt.setString(1, name);
        pstmt.addBatch();
    }
    int[] result = pstmt.executeBatch();
}
```

---

## 4. ResultSet -- đọc dữ liệu

```java
String sql = "SELECT id, name, email FROM users WHERE age > ?";
try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
    pstmt.setInt(1, 18);
    try (ResultSet rs = pstmt.executeQuery()) {
        while (rs.next()) {
            long id = rs.getLong("id");
            String name = rs.getString("name");
            String email = rs.getString("email");
            System.out.printf("%d: %s (%s)%n", id, name, email);
        }
    }
}
```

### Mapping về object

```java
List<User> users = new ArrayList<>();
try (PreparedStatement pstmt = conn.prepareStatement("SELECT * FROM users");
     ResultSet rs = pstmt.executeQuery()) {

    while (rs.next()) {
        User u = new User();
        u.setId(rs.getLong("id"));
        u.setName(rs.getString("name"));
        u.setEmail(rs.getString("email"));
        users.add(u);
    }
}
```

### Các method `getXxx`

```java
rs.getString("col");
rs.getInt("col");
rs.getLong("col");
rs.getDouble("col");
rs.getBoolean("col");
rs.getDate("col");                  // java.sql.Date
rs.getTimestamp("col");             // java.sql.Timestamp
rs.getObject("col", LocalDate.class); // Java 8+ type
```

---

## 5. Transaction

```java
try (Connection conn = DriverManager.getConnection(url, user, pass)) {
    conn.setAutoCommit(false); // tat auto-commit

    try (PreparedStatement debit = conn.prepareStatement("UPDATE accounts SET balance = balance - ? WHERE id = ?");
         PreparedStatement credit = conn.prepareStatement("UPDATE accounts SET balance = balance + ? WHERE id = ?")) {

        debit.setBigDecimal(1, new BigDecimal("100"));
        debit.setLong(2, 1);
        debit.executeUpdate();

        credit.setBigDecimal(1, new BigDecimal("100"));
        credit.setLong(2, 2);
        credit.executeUpdate();

        conn.commit();
    } catch (SQLException e) {
        conn.rollback();
        throw e;
    }
}
```

### Isolation Level

```java
conn.setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED);
```

| Level                | Đặc điểm                                |
| -------------------- | --------------------------------------- |
| `READ_UNCOMMITTED`   | Đọc cả uncommitted -- dirty read        |
| `READ_COMMITTED`     | Chỉ đọc committed (default PostgreSQL)  |
| `REPEATABLE_READ`    | Cùng row đọc 2 lần không đổi (MySQL)    |
| `SERIALIZABLE`       | Như serial, mạnh nhất, chậm nhất        |

---

## 6. Connection Pool

Tạo Connection rất tốn -- mỗi lần handshake TCP, auth. **Pool** giữ sẵn nhiều Connection, tái sử dụng.

### HikariCP (khuyến nghị)

```xml
<dependency>
    <groupId>com.zaxxer</groupId>
    <artifactId>HikariCP</artifactId>
    <version>5.1.0</version>
</dependency>
```

```java
HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:postgresql://localhost:5432/mydb");
config.setUsername("postgres");
config.setPassword("secret");
config.setMaximumPoolSize(20);
config.setConnectionTimeout(30_000);

HikariDataSource ds = new HikariDataSource(config);

try (Connection conn = ds.getConnection()) {
    // Su dung
}
```

---

## Khi nào dùng?

- **JDBC thuần khi:**
  - Project nhỏ, query đơn giản
  - Cần control SQL tuyệt đối
  - Performance critical (mỗi query 1 statement)
- **JDBC + framework wrapper:**
  - JdbcTemplate (Spring) -- giảm boilerplate
  - jOOQ -- type-safe SQL builder
  - MyBatis -- mapping XML/annotation
  - JPA/Hibernate -- ORM full-stack (xem bài sau)
- **Best practice:**
  - **LUÔN** dùng `PreparedStatement` -- chống SQL Injection
  - **LUÔN** try-with-resources -- đóng Connection/Statement/ResultSet
  - Dùng **connection pool** (HikariCP) -- không tạo Connection thủ công
  - Tách SQL ra file/constants -- dễ đọc
  - Batch update khi insert nhiều row

---

## Lỗi thường gặp

### Lỗi 1: SQL Injection

```java
// SAI
String sql = "SELECT * FROM users WHERE name = '" + userInput + "'";
// userInput = "' OR 1=1 --" -> lay het user!

// DUNG -- PreparedStatement
String sql = "SELECT * FROM users WHERE name = ?";
pstmt.setString(1, userInput);
```

### Lỗi 2: Quên close

```java
// SAI -- resource leak
Connection conn = DriverManager.getConnection(url);
Statement stmt = conn.createStatement();
ResultSet rs = stmt.executeQuery("SELECT 1");

// DUNG -- try-with-resources
try (Connection conn = ...;
     PreparedStatement pstmt = conn.prepareStatement(sql);
     ResultSet rs = pstmt.executeQuery()) {
    // ...
}
```

### Lỗi 3: Tạo Connection mỗi request

```java
// SAI -- moi request tao moi
public User findById(Long id) {
    try (Connection conn = DriverManager.getConnection(...)) {
        // query
    }
}

// DUNG -- dung pool
public User findById(Long id) {
    try (Connection conn = dataSource.getConnection()) {
        // pool reuse
    }
}
```

### Lỗi 4: N+1 query

```java
// SAI -- 1 query lay user, N query lay post
List<User> users = ... ;
for (User u : users) {
    List<Post> posts = repo.findPostsByUser(u.getId()); // N queries
}

// DUNG -- JOIN hoac IN
String sql = """
    SELECT u.*, p.*
    FROM users u
    LEFT JOIN posts p ON p.user_id = u.id
    """;
```

### Lỗi 5: Quên commit transaction

```java
conn.setAutoCommit(false);
// query
conn.close(); // quen commit -> rollback!

// DUNG
conn.commit(); // truoc khi close
```

---

## Câu hỏi phỏng vấn

### Câu 1: PreparedStatement vs Statement?

**Trả lời:**

- `Statement`: nhận SQL string, **dễ SQL Injection**, không cache plan
- `PreparedStatement`: parameterized với `?`, **chống SQL Injection**, DB cache plan -- nhanh hơn khi reuse

Luôn dùng PreparedStatement cho mọi user input. Statement chỉ dùng cho DDL/SQL cố định.

### Câu 2: Connection Pool là gì?

**Trả lời:** Tập hợp các Connection được **giữ sẵn** và **tái sử dụng**. Tạo Connection tốn (TCP handshake, auth). Pool giảm latency và resource. Phổ biến: HikariCP (nhanh nhất), Apache DBCP, c3p0.

### Câu 3: Transaction là gì?

**Trả lời:** Tập hợp các thao tác **thực hiện hết hoặc không gì cả** (ACID). Bắt đầu `setAutoCommit(false)`, kết thúc `commit()` hoặc `rollback()`. Đảm bảo data consistency -- ví dụ chuyển tiền: trừ A và cộng B phải cùng commit, hoặc cùng rollback.

### Câu 4: 4 isolation level?

**Trả lời:**

- `READ_UNCOMMITTED`: đọc cả uncommitted (dirty read) -- ít dùng
- `READ_COMMITTED`: chỉ đọc committed (default đa số DB)
- `REPEATABLE_READ`: cùng row đọc 2 lần kết quả như nhau
- `SERIALIZABLE`: như chạy tuần tự -- mạnh nhất, chậm nhất

Trade-off giữa **consistency** và **performance**.

### Câu 5: Tại sao N+1 query là vấn đề?

**Trả lời:** Lấy 100 user xong, lặp 100 lần query post của từng user = **101 query**. Round-trip DB rất tốn. Giải pháp:

- JOIN trong 1 query
- Subquery với IN (...)
- ORM: `JOIN FETCH`, `@BatchSize`
