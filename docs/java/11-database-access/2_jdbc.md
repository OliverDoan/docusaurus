---
sidebar_position: 2
title: "2. JDBC"
---

# 2. JDBC — Kết nối CSDL cấp thấp

JDBC là API cấp thấp nền tảng để Java nói chuyện trực tiếp với cơ sở dữ liệu, nơi bạn tự mở kết nối, viết SQL và đọc kết quả. Bài này hướng dẫn các bước cơ bản với JDBC, vì sao phải dùng PreparedStatement để chống SQL injection, cách đọc dữ liệu bằng ResultSet, tự đóng tài nguyên với try-with-resources và tăng tốc bằng connection pool HikariCP. Hiểu JDBC giúp bạn nắm vững nền tảng trước khi dùng các ORM cấp cao hơn.

---

## Mục lục

- [JDBC là gì?](#jdbc-là-gì)
- [Các bước cơ bản khi dùng JDBC](#các-bước-cơ-bản-khi-dùng-jdbc)
- [Kết nối: DriverManager và Connection](#kết-nối-drivermanager-và-connection)
- [Statement vs PreparedStatement (CỰC KỲ QUAN TRỌNG)](#statement-vs-preparedstatement-cực-kỳ-quan-trọng)
- [executeQuery và executeUpdate](#executequery-và-executeupdate)
- [Đọc kết quả với ResultSet](#đọc-kết-quả-với-resultset)
- [try-with-resources: tự đóng tài nguyên](#try-with-resources-tự-đóng-tài-nguyên)
- [Connection Pool và HikariCP](#connection-pool-và-hikaricp)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## JDBC là gì?

**JDBC** (Java Database Connectivity — kết nối CSDL của Java) là một **API**
(Application Programming Interface — bộ giao diện lập trình, tức tập hợp các
lớp/phương thức cho sẵn) **cấp thấp** để Java nói chuyện trực tiếp với CSDL.

"Cấp thấp" nghĩa là bạn phải tự làm gần như mọi việc: tự mở kết nối, tự viết câu
SQL, tự đọc kết quả, tự đóng kết nối. Đổi lại, bạn kiểm soát được mọi thứ và hiểu
rõ điều gì đang diễn ra.

> Ví dụ đời thường: JDBC giống như **lái xe số sàn**. Bạn phải tự đạp côn, vào
> số. Mệt hơn xe số tự động (ORM), nhưng bạn hiểu rõ máy móc hoạt động ra sao.

JDBC chỉ định nghĩa "giao diện chuẩn". Mỗi loại CSDL (MySQL, PostgreSQL...) cung
cấp một **driver** (trình điều khiển — thư viện kết nối riêng) để hiện thực hóa
giao diện đó. Bạn chỉ cần thêm driver tương ứng vào dự án.

---

## Các bước cơ bản khi dùng JDBC

1. **Mở kết nối** (Connection) tới CSDL.
2. **Chuẩn bị câu lệnh** (PreparedStatement) với câu SQL.
3. **Thực thi** câu lệnh: truy vấn lấy dữ liệu hoặc cập nhật.
4. **Đọc kết quả** (ResultSet) nếu là truy vấn lấy dữ liệu.
5. **Đóng** mọi tài nguyên đã mở (kết nối, câu lệnh, kết quả).

---

## Kết nối: DriverManager và Connection

`DriverManager` là lớp quản lý các driver. Bạn gọi `DriverManager.getConnection()`
để xin một `Connection` (kết nối) tới CSDL.

```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseDemo {
    // Thông tin kết nối — KHÔNG hardcode mật khẩu thật trong code thực tế!
    // Thực tế nên đọc từ biến môi trường hoặc file cấu hình.
    private static final String URL = "jdbc:mysql://localhost:3306/mydb";
    private static final String USER = "root";
    private static final String PASSWORD = "your_password";

    public static void main(String[] args) {
        try {
            // Mở kết nối tới CSDL MySQL
            Connection conn = DriverManager.getConnection(URL, USER, PASSWORD);
            System.out.println("Kết nối thành công!");
            conn.close(); // nhớ đóng kết nối
        } catch (SQLException e) {
            // Luôn xử lý ngoại lệ, ghi log để biết lỗi gì
            System.err.println("Kết nối thất bại: " + e.getMessage());
        }
    }
}
```

Chuỗi `URL` có cấu trúc: `jdbc:<loại-db>://<host>:<cổng>/<tên-database>`. Ví dụ
`jdbc:mysql://localhost:3306/mydb` nghĩa là kết nối MySQL ở máy local, cổng 3306,
database tên `mydb`.

---

## Statement vs PreparedStatement (CỰC KỲ QUAN TRỌNG)

Đây là phần **quan trọng nhất** của bài này về mặt **bảo mật**.

### Cách SAI: nối chuỗi với Statement (gây SQL injection)

```java
// ⛔ TUYỆT ĐỐI KHÔNG LÀM THẾ NÀY ⛔
String email = userInput; // dữ liệu do người dùng nhập vào
String sql = "SELECT * FROM users WHERE email = '" + email + "'";
Statement stmt = conn.createStatement();
ResultSet rs = stmt.executeQuery(sql); // RẤT NGUY HIỂM!
```

Vấn đề: nếu kẻ xấu nhập email là:

```text
' OR '1'='1
```

Thì câu SQL trở thành:

```sql
SELECT * FROM users WHERE email = '' OR '1'='1'
```

Vì `'1'='1'` luôn đúng, câu lệnh sẽ trả về **TẤT CẢ người dùng**! Tệ hơn, kẻ xấu
có thể nhập câu lệnh xóa cả bảng. Đây gọi là **SQL injection** (tiêm nhiễm SQL —
lỗ hổng bảo mật nghiêm trọng nhất khi làm việc với CSDL).

> Ví dụ đời thường: nối chuỗi SQL giống như để người lạ tự viết lên tờ giấy lệnh
> rồi đưa cho ngân hàng làm theo. Họ có thể viết "chuyển hết tiền cho tôi".

### Cách ĐÚNG: dùng PreparedStatement với tham số `?`

```java
// ✅ LUÔN LUÔN LÀM THẾ NÀY ✅
String email = userInput; // dữ liệu người dùng
// Dùng dấu ? làm chỗ trống cho tham số, KHÔNG nối chuỗi
String sql = "SELECT * FROM users WHERE email = ?";
PreparedStatement ps = conn.prepareStatement(sql);
// Gán giá trị vào vị trí ? thứ 1 — driver tự xử lý an toàn
ps.setString(1, email);
ResultSet rs = ps.executeQuery();
```

Với `PreparedStatement` (câu lệnh được chuẩn bị trước), dữ liệu người dùng được
gửi **tách biệt** khỏi câu lệnh SQL. Dù người dùng nhập `' OR '1'='1`, nó được
coi là **một chuỗi văn bản thường**, không phải lệnh SQL. SQL injection bị chặn
đứng hoàn toàn.

> **QUY TẮC VÀNG: LUÔN dùng `PreparedStatement` với dấu `?` cho mọi giá trị động.
> KHÔNG BAO GIỜ nối chuỗi dữ liệu người dùng vào câu SQL.** Hãy ghi nhớ điều này
> suốt sự nghiệp lập trình của bạn.

`PreparedStatement` còn nhanh hơn (CSDL biên dịch câu lệnh một lần, dùng nhiều
lần) và sạch hơn (không cần lo escape dấu nháy).

---

## executeQuery và executeUpdate

`PreparedStatement` có hai phương thức thực thi chính:

- **`executeQuery()`**: dùng cho **SELECT** (lấy dữ liệu). Trả về `ResultSet`.
- **`executeUpdate()`**: dùng cho **INSERT, UPDATE, DELETE** (thay đổi dữ liệu).
  Trả về số nguyên = số hàng bị ảnh hưởng.

```java
// Thêm một người dùng mới (INSERT) — dùng executeUpdate
String insertSql = "INSERT INTO users (name, email) VALUES (?, ?)";
PreparedStatement ps = conn.prepareStatement(insertSql);
ps.setString(1, "Nguyen An");            // gán cho ? thứ 1
ps.setString(2, "an@example.com");       // gán cho ? thứ 2
int rowsAffected = ps.executeUpdate();   // trả về số hàng được thêm
System.out.println("Đã thêm " + rowsAffected + " hàng");
```

---

## Đọc kết quả với ResultSet

`ResultSet` (tập kết quả) chứa dữ liệu trả về từ một truy vấn SELECT. Nó giống
một con trỏ đọc từng hàng. Bạn dùng vòng lặp `while (rs.next())` để duyệt qua
từng hàng kết quả.

```java
String sql = "SELECT id, name, email FROM users WHERE name = ?";
PreparedStatement ps = conn.prepareStatement(sql);
ps.setString(1, "Nguyen An");
ResultSet rs = ps.executeQuery();

// rs.next() chuyển sang hàng tiếp theo, trả về false khi hết hàng
while (rs.next()) {
    // Lấy giá trị theo TÊN cột (rõ ràng, dễ đọc)
    long id = rs.getLong("id");
    String name = rs.getString("name");
    String email = rs.getString("email");
    System.out.println(id + " - " + name + " - " + email);
}
```

Một số phương thức đọc thường dùng: `getLong`, `getInt`, `getString`,
`getBoolean`, `getDouble`, `getDate`. Bạn có thể lấy theo **tên cột** (khuyến
khích) hoặc theo **số thứ tự cột** (bắt đầu từ 1).

---

## try-with-resources: tự đóng tài nguyên

`Connection`, `PreparedStatement`, `ResultSet` đều là **tài nguyên** cần đóng
sau khi dùng. Quên đóng sẽ gây **rò rỉ tài nguyên** (resource leak), làm CSDL
hết kết nối và app sập.

Cách an toàn nhất là **try-with-resources** (mở tài nguyên trong dấu ngoặc của
`try`). Java sẽ **tự động đóng** mọi tài nguyên khi khối `try` kết thúc, kể cả
khi có lỗi xảy ra.

```java
String sql = "SELECT id, name FROM users WHERE email = ?";

// Khai báo tài nguyên trong (...) — Java tự gọi close() khi xong
try (Connection conn = DriverManager.getConnection(URL, USER, PASSWORD);
     PreparedStatement ps = conn.prepareStatement(sql)) {

    ps.setString(1, "an@example.com");

    try (ResultSet rs = ps.executeQuery()) {
        while (rs.next()) {
            System.out.println(rs.getString("name"));
        }
    }
} catch (SQLException e) {
    // Ghi log lỗi đầy đủ để debug
    System.err.println("Lỗi truy vấn: " + e.getMessage());
}
// Đến đây conn, ps, rs đã được đóng TỰ ĐỘNG, không cần gọi close() thủ công
```

> Ví dụ đời thường: try-with-resources giống như cửa tự động đóng. Bạn không cần
> nhớ "đóng cửa khi ra về" — nó tự đóng giúp bạn, dù bạn vội vàng hay quên.

---

## Connection Pool và HikariCP

Mỗi lần mở một `Connection` mới tới CSDL khá **tốn kém** (mất thời gian bắt tay,
xác thực...). Nếu app của bạn xử lý hàng nghìn yêu cầu mỗi giây, việc mở/đóng
liên tục sẽ rất chậm.

Giải pháp: **connection pool** (bể kết nối). Thay vì mở mới mỗi lần, ta tạo sẵn
một "bể" gồm nhiều kết nối, dùng xong thì **trả lại bể** để tái sử dụng.

> Ví dụ đời thường: connection pool giống như **đội taxi chờ sẵn** ở bến. Khách
> đến lấy xe đi luôn, đi xong trả xe về bến cho khách khác dùng — không phải sản
> xuất xe mới mỗi lần.

**HikariCP** là thư viện connection pool nhanh và phổ biến nhất trong Java.

```java
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:mysql://localhost:3306/mydb");
config.setUsername("root");
config.setPassword("your_password");
config.setMaximumPoolSize(10); // tối đa 10 kết nối trong bể

HikariDataSource dataSource = new HikariDataSource(config);

// Lấy 1 kết nối từ bể, dùng xong nó tự trả về bể (nhờ try-with-resources)
try (Connection conn = dataSource.getConnection()) {
    // ... dùng conn để truy vấn như bình thường
}
```

Khi dùng Spring Boot, HikariCP là pool **mặc định** — bạn không cần cấu hình thủ
công, chỉ cần khai báo thông tin CSDL trong file cấu hình.

---

## Lỗi thường gặp

- **Nối chuỗi SQL** → lỗ hổng SQL injection. Luôn dùng `PreparedStatement` với `?`.
- **Quên đóng tài nguyên** → rò rỉ kết nối, app treo. Dùng try-with-resources.
- **Dùng `executeQuery` cho INSERT/UPDATE** → lỗi. Dùng `executeUpdate` thay thế.
- **Quên `rs.next()`** trước khi đọc → lỗi "no current row". Phải gọi `next()` trước.
- **Hardcode mật khẩu trong code** → rủi ro bảo mật. Đọc từ biến môi trường/cấu hình.
- **Mở kết nối mới cho mỗi yêu cầu** → chậm. Dùng connection pool (HikariCP).

---

## Tóm tắt

- **JDBC** là API cấp thấp để Java nói chuyện trực tiếp với CSDL.
- Quy trình: mở `Connection` → tạo `PreparedStatement` → thực thi → đọc
  `ResultSet` → đóng tài nguyên.
- **LUÔN dùng `PreparedStatement` với dấu `?`**, không nối chuỗi SQL → chống
  SQL injection. Đây là quy tắc bảo mật quan trọng nhất.
- `executeQuery()` cho SELECT, `executeUpdate()` cho INSERT/UPDATE/DELETE.
- Dùng **try-with-resources** để tự động đóng tài nguyên, tránh rò rỉ.
- Dùng **connection pool (HikariCP)** để tái sử dụng kết nối, tăng tốc độ.
