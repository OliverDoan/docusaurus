---
sidebar_position: 11
title: "11. Truy cập CSDL"
---

# 11. Truy cập CSDL

## 1. Tổng quan truy cập CSDL

Bài học: [1. Tổng quan truy cập CSDL](../../java/11-database-access/1_tong-quan.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Vì sao dữ liệu lưu trong một biến (variable) của chương trình Java bị mất khi tắt chương trình, trong khi dữ liệu lưu trong CSDL thì không?**

<details className="qa">
<summary>Xem đáp án</summary>

Biến trong chương trình được lưu trong **bộ nhớ RAM (memory)** — nơi lưu trữ tạm thời, chỉ tồn tại trong lúc chương trình đang chạy trên JVM. Khi tắt chương trình (hoặc tắt máy), JVM kết thúc, toàn bộ vùng nhớ đó bị hệ điều hành thu hồi và **xóa sạch** — đây gọi là dữ liệu **volatile** (dễ bay hơi, không bền vững).

Ngược lại, CSDL ghi dữ liệu xuống **ổ đĩa (disk)** — thiết bị lưu trữ vật lý vẫn giữ nguyên dữ liệu kể cả khi mất điện hay khởi động lại máy. Đây là dữ liệu **persistent** (bền vững). Vì vậy, bất kỳ dữ liệu nào cần tồn tại lâu dài qua nhiều lần chạy chương trình đều phải được ghi vào CSDL (hoặc file), không thể chỉ giữ trong biến.

</details>

**2. Đoạn code sau có lỗ hổng bảo mật gì? Hãy giải thích và sửa lại.**

```java
String name = request.getParameter("name"); // dữ liệu người dùng nhập vào
String sql = "SELECT * FROM users WHERE name = '" + name + "'";
```

<details className="qa">
<summary>Xem đáp án</summary>

Đây là lỗ hổng **SQL injection** (tiêm SQL) — một trong những lỗ hổng bảo mật nghiêm trọng và phổ biến nhất. Vì `name` được **nối chuỗi trực tiếp** vào câu SQL, kẻ tấn công có thể nhập một giá trị đặc biệt để thay đổi ý nghĩa câu truy vấn, ví dụ nhập `name = "' OR '1'='1"` khiến câu SQL thực tế trở thành:

```sql
SELECT * FROM users WHERE name = '' OR '1'='1'
```

Điều kiện `'1'='1'` luôn đúng, nên câu lệnh trả về **toàn bộ** người dùng trong bảng thay vì chỉ người có tên khớp — kẻ tấn công có thể dùng kỹ thuật tương tự để đọc trộm hoặc phá hoại dữ liệu.

Cách sửa: dùng **tham số hóa truy vấn (parameterized query)** thay vì nối chuỗi:

```java
String sql = "SELECT * FROM users WHERE name = ?";
PreparedStatement stmt = connection.prepareStatement(sql);
stmt.setString(1, name); // giá trị được truyền riêng, không thể phá vỡ cấu trúc câu SQL
```

</details>

**3. ORM là gì? Nêu ít nhất một lợi ích và một nhược điểm của việc dùng ORM thay vì viết SQL tay hoàn toàn.**

<details className="qa">
<summary>Xem đáp án</summary>

**ORM** (Object-Relational Mapping — ánh xạ đối tượng-quan hệ) là kỹ thuật/công cụ tự động chuyển đổi qua lại giữa **đối tượng Java** (class, field) và **dữ liệu quan hệ** (bảng, cột, hàng), giúp lập trình viên thao tác với dữ liệu thông qua object thay vì viết SQL thủ công.

- **Lợi ích**: viết ít SQL tay hơn, code gọn gàng và tập trung vào logic nghiệp vụ hơn là cú pháp SQL; giảm lỗi vặt khi ánh xạ thủ công giữa `ResultSet` và object.
- **Nhược điểm**: với các truy vấn phức tạp (join nhiều bảng, thống kê nặng), ORM có thể sinh ra câu SQL **kém tối ưu** hơn so với SQL viết tay; nếu dùng sai cách (ví dụ không hiểu cơ chế lazy loading) có thể gây ra vấn đề hiệu năng khó phát hiện.

</details>

**4. So sánh JDBC, Hibernate, Spring Data JPA và EBean theo mức độ tự động hóa và trường hợp nên dùng.**

<details className="qa">
<summary>Xem đáp án</summary>

| Công cụ | Mức độ tự động | Trường hợp nên dùng |
|---|---|---|
| `JDBC` | Thấp nhất — tự viết SQL, tự map kết quả | Học nền tảng, hoặc cần kiểm soát tối đa câu truy vấn |
| `Hibernate` | Cao — tự sinh SQL từ đối tượng (ORM đầy đủ) | Dự án cần ORM mạnh nhưng không nhất thiết dùng Spring |
| `Spring Data JPA` | Rất cao — tự sinh cả tầng repository | Dự án Spring Boot (phổ biến nhất trong thực tế) |
| `EBean` | Cao, theo phong cách Active Record (`user.save()`) | Thích cú pháp gọn, object tự biết cách lưu chính nó |

Xu hướng chung: càng lên cao trong bảng, bạn viết càng ít code nhưng càng ít kiểm soát chi tiết câu SQL sinh ra — cần đánh đổi giữa tốc độ phát triển và khả năng tối ưu truy vấn thủ công khi cần.

</details>

**5. Tại sao `id` của một bảng thường được thiết kế là khóa chính (primary key)? Điều gì sẽ xảy ra nếu một bảng không có khóa chính?**

<details className="qa">
<summary>Xem đáp án</summary>

**Khóa chính (primary key)** là cột (hoặc tổ hợp cột) có giá trị **duy nhất, không được `NULL`**, dùng để xác định chính xác một hàng cụ thể trong bảng. `id` thường được chọn làm khóa chính vì nó không phụ thuộc vào dữ liệu nghiệp vụ (tên, email... có thể trùng hoặc thay đổi), đảm bảo luôn phân biệt được từng bản ghi.

Nếu bảng không có khóa chính:

- Không có cách nào đảm bảo **không trùng lặp hàng** — hai bản ghi có thể giống hệt nhau về mọi cột mà CSDL vẫn coi là hai hàng khác nhau.
- Việc **cập nhật/xóa một hàng cụ thể** trở nên khó khăn và rủi ro: câu lệnh `UPDATE`/`DELETE` dựa trên điều kiện không định danh duy nhất có thể vô tình ảnh hưởng tới nhiều hàng cùng lúc.
- Các bảng khác không thể **tham chiếu (foreign key)** một cách đáng tin cậy tới bảng này để thiết lập quan hệ.

</details>

**6. Viết câu SQL cho các yêu cầu sau trên bảng `users(id, name, email)`: (a) lấy tất cả user có email chứa domain `@gmail.com`, (b) đếm tổng số user, (c) xóa user có id = 10.**

<details className="qa">
<summary>Xem đáp án</summary>

```sql
-- (a) Lấy user có email domain @gmail.com
SELECT * FROM users WHERE email LIKE '%@gmail.com';

-- (b) Đếm tổng số user
SELECT COUNT(*) FROM users;

-- (c) Xóa user có id = 10
DELETE FROM users WHERE id = 10;
```

Lưu ý: `LIKE '%...'` dùng `%` làm ký tự đại diện (wildcard) khớp mọi chuỗi ở vị trí đó — ở đây khớp mọi email kết thúc bằng `@gmail.com`.

</details>

**7. Trong tình huống nào bạn nên chọn dùng JDBC thuần thay vì một ORM như Hibernate hay Spring Data JPA, dù ORM giúp viết ít code hơn?**

<details className="qa">
<summary>Xem đáp án</summary>

Nên cân nhắc JDBC thuần khi:

- **Cần kiểm soát tuyệt đối câu SQL sinh ra**, ví dụ tối ưu một truy vấn báo cáo phức tạp (nhiều join, subquery, window function) mà ORM sinh SQL không hiệu quả hoặc khó tùy biến.
- **Ứng dụng cực kỳ nhỏ, gọn** (một script xử lý dữ liệu đơn giản, một bài học) — thêm cả Hibernate/Spring Data JPA vào chỉ để chạy vài câu SQL là quá mức cần thiết, làm dự án nặng nề không cần thiết.
- **Cần hiệu năng tối đa và kiểm soát tài nguyên chặt chẽ** ở tầng thấp (ví dụ batch insert hàng triệu bản ghi với cấu hình đặc biệt) mà lớp trừu tượng của ORM có thể gây thêm chi phí không cần thiết.

Trong đa số dự án doanh nghiệp thông thường, lợi ích về tốc độ phát triển và bảo trì của ORM thường lớn hơn chi phí mất kiểm soát chi tiết, nên JDBC thuần thường chỉ được dùng cho các phần đặc biệt cần tối ưu, không phải toàn bộ ứng dụng.

</details>

**8. Một người mới bắt đầu học Java backend hỏi: "Em nên học Spring Data JPA luôn cho nhanh, hay phải học JDBC trước?" Bạn sẽ tư vấn thế nào và vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Nên khuyên học **JDBC trước**, dù mất thời gian hơn ban đầu, vì các lý do:

- JDBC giúp hiểu **cơ chế nền tảng** thực sự đang diễn ra: mở kết nối (`Connection`), gửi câu SQL, đọc `ResultSet`, đóng kết nối — đây chính là những gì Hibernate/Spring Data JPA làm **tự động** phía sau. Hiểu nền tảng giúp debug hiệu quả hơn khi ORM sinh ra hành vi bất ngờ (ví dụ vấn đề N+1 query, lazy loading).
- Nếu học thẳng Spring Data JPA mà chưa hiểu JDBC, người học dễ rơi vào tình trạng "code chạy được nhưng không hiểu vì sao", gặp khó khăn lớn khi cần tối ưu hiệu năng hoặc xử lý lỗi liên quan tới transaction, connection pool.
- Sau khi vững JDBC, chuyển sang Spring Data JPA sẽ nhanh và hiểu sâu hơn nhiều, vì người học nhận ra JPA chỉ đang **làm hộ** những việc mình đã từng tự tay làm, không phải một "hộp đen" khó hiểu.

Lộ trình hợp lý: JDBC (hiểu nền tảng) → Hibernate/JPA (hiểu ORM) → Spring Data JPA (dùng thành thạo trong thực tế, vì đây là công cụ phổ biến nhất khi đi làm).

</details>

---

## 2. JDBC

Bài học: [2. JDBC](../../java/11-database-access/2_jdbc.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. JDBC là gì? Vì sao nói JDBC là API "cấp thấp"? Vai trò của driver trong kiến trúc JDBC là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**JDBC** (Java Database Connectivity) là API chuẩn của Java để kết nối và thao tác với CSDL quan hệ, thông qua các interface chung (`Connection`, `Statement`, `ResultSet`).

Gọi là "cấp thấp" vì bạn phải **tự làm gần như mọi bước**: tự mở kết nối, tự viết câu SQL, tự đọc từng dòng kết quả, tự đóng tài nguyên — không có framework nào tự động sinh SQL hay ánh xạ object giúp bạn như ORM.

**Driver** là thư viện do từng hãng CSDL (MySQL, PostgreSQL...) cung cấp, hiện thực hóa các interface chuẩn của JDBC theo đúng giao thức riêng của CSDL đó. Nhờ vậy, code nghiệp vụ chỉ cần lập trình theo interface chuẩn (`Connection`, `PreparedStatement`...), còn việc "nói đúng ngôn ngữ" với từng loại CSDL cụ thể do driver đảm nhiệm — đổi CSDL chỉ cần đổi driver + URL kết nối.

</details>

**2. Đoạn code sau có lỗ hổng bảo mật nghiêm trọng gì? Kẻ tấn công có thể khai thác như thế nào?**

```java
String email = userInput;
String sql = "SELECT * FROM users WHERE email = '" + email + "'";
Statement stmt = conn.createStatement();
ResultSet rs = stmt.executeQuery(sql);
```

<details className="qa">
<summary>Xem đáp án</summary>

Đây là lỗ hổng **SQL injection** do nối chuỗi dữ liệu người dùng trực tiếp vào câu SQL bằng `Statement`. Nếu kẻ tấn công nhập `email` là:

```text
' OR '1'='1
```

Câu SQL thực tế trở thành:

```sql
SELECT * FROM users WHERE email = '' OR '1'='1'
```

Vì `'1'='1'` luôn đúng, câu lệnh trả về **toàn bộ** người dùng trong bảng thay vì đúng một người. Nghiêm trọng hơn, kẻ tấn công có thể lồng thêm các lệnh khác tùy loại CSDL để đọc trộm hoặc phá hoại dữ liệu.

Sửa lại bằng `PreparedStatement` với dấu `?`:

```java
String sql = "SELECT * FROM users WHERE email = ?";
PreparedStatement ps = conn.prepareStatement(sql);
ps.setString(1, email);
ResultSet rs = ps.executeQuery();
```

</details>

**3. Vì sao `PreparedStatement` chống được SQL injection còn `Statement` thì không? Nêu thêm một lợi ích khác của `PreparedStatement` ngoài bảo mật.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Về bảo mật**: với `Statement`, toàn bộ câu lệnh (bao gồm cả dữ liệu người dùng) được gửi tới CSDL dưới dạng **một chuỗi văn bản duy nhất**, nên CSDL không phân biệt được đâu là cấu trúc lệnh, đâu là dữ liệu — dữ liệu độc hại có thể "biến thành" một phần cấu trúc lệnh. Với `PreparedStatement`, câu lệnh SQL (có dấu `?`) được gửi và biên dịch **trước, tách biệt** với dữ liệu; sau đó dữ liệu được gán vào từng vị trí `?` như tham số thuần túy — CSDL luôn hiểu đó là **giá trị**, không thể diễn giải thành cú pháp SQL dù nội dung có chứa ký tự đặc biệt.
- **Lợi ích hiệu năng**: vì câu lệnh được CSDL **biên dịch (compile) một lần**, các lần gọi sau với tham số khác nhau có thể tái sử dụng kế hoạch thực thi đã biên dịch (execution plan) thay vì phân tích lại cú pháp từ đầu mỗi lần — nhanh hơn đáng kể khi chạy cùng một câu lệnh nhiều lần với dữ liệu khác nhau.

</details>

**4. Phân biệt `executeQuery()`, `executeUpdate()` và `execute()` của `PreparedStatement`. Khi nào dùng loại nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| Phương thức | Dùng cho | Giá trị trả về |
|---|---|---|
| `executeQuery()` | `SELECT` (lấy dữ liệu) | `ResultSet` chứa các hàng kết quả |
| `executeUpdate()` | `INSERT`, `UPDATE`, `DELETE` (thay đổi dữ liệu) | `int` — số hàng bị ảnh hưởng |
| `execute()` | Trường hợp không biết trước là truy vấn hay cập nhật (ví dụ chạy SQL động, hoặc gọi stored procedure) | `boolean` — `true` nếu kết quả là `ResultSet`, `false` nếu là số hàng cập nhật |

Trong thực tế, `executeQuery()` và `executeUpdate()` được dùng phần lớn thời gian vì loại câu lệnh thường đã biết trước; `execute()` chỉ cần khi viết code tổng quát xử lý SQL bất kỳ mà không biết trước loại lệnh.

</details>

**5. Đoạn code sau ném ra lỗi khi chạy. Lỗi gì và tại sao?**

```java
String sql = "SELECT id, name FROM users WHERE id = ?";
PreparedStatement ps = conn.prepareStatement(sql);
ps.setLong(1, 5L);
ResultSet rs = ps.executeQuery();

String name = rs.getString("name"); // ném lỗi ở đây
```

<details className="qa">
<summary>Xem đáp án</summary>

Lỗi: **`SQLException: no current row`** (hoặc thông báo tương tự tùy driver).

`ResultSet` hoạt động như một **con trỏ (cursor)**, ban đầu trỏ **trước hàng đầu tiên** — chưa trỏ vào hàng dữ liệu nào cả. Phải gọi **`rs.next()`** để di chuyển con trỏ sang hàng tiếp theo (hàng đầu tiên, nếu có) rồi mới được phép đọc giá trị cột; `rs.next()` trả về `false` nếu không còn hàng nào.

Sửa lại:

```java
ResultSet rs = ps.executeQuery();
if (rs.next()) { // di chuyển con trỏ tới hàng đầu tiên (nếu có)
    String name = rs.getString("name");
}
```

</details>

**6. `try-with-resources` giúp gì khi làm việc với `Connection`, `PreparedStatement`, `ResultSet`? Nếu khai báo nhiều resource lồng nhau trong cùng một `try(...)`, chúng được đóng theo thứ tự nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`try-with-resources` tự động gọi `close()` trên mọi resource được khai báo trong ngoặc của `try`, ngay cả khi có exception xảy ra bên trong khối — giúp tránh **rò rỉ tài nguyên (resource leak)** do lập trình viên quên gọi `close()` thủ công, đặc biệt khi có nhiều đường thoát khỏi hàm (return sớm, exception...).

```java
try (Connection conn = DriverManager.getConnection(URL, USER, PASSWORD);
     PreparedStatement ps = conn.prepareStatement(sql);
     ResultSet rs = ps.executeQuery()) {
    // dùng rs
}
// conn, ps, rs đều đã được đóng tự động
```

Thứ tự đóng: các resource được đóng theo thứ tự **ngược lại** với thứ tự khai báo — resource khai báo **sau cùng** (ở đây là `rs`) được đóng **trước tiên**, rồi tới `ps`, cuối cùng mới tới `conn`. Thứ tự này hợp lý vì resource khai báo sau thường phụ thuộc vào resource khai báo trước (ví dụ `ResultSet` cần `PreparedStatement` còn tồn tại để hoạt động).

</details>

**7. Connection pool giải quyết vấn đề gì? Vì sao không nên mở một `Connection` mới cho mỗi request trong một ứng dụng web có lượng truy cập lớn?**

<details className="qa">
<summary>Xem đáp án</summary>

Mở một kết nối CSDL mới (`DriverManager.getConnection(...)`) là một thao tác **tốn kém**: cần thời gian thiết lập kết nối mạng, bắt tay giao thức (handshake), xác thực (authentication) với CSDL — mỗi lần có thể mất từ vài chục đến vài trăm mili-giây.

Nếu ứng dụng mở một connection mới cho **mỗi request**, với lượng truy cập lớn (hàng trăm/nghìn request mỗi giây), phần lớn thời gian xử lý sẽ bị tiêu tốn vào việc mở/đóng kết nối thay vì xử lý logic thực sự — làm ứng dụng chậm hẳn và có nguy cơ làm CSDL quá tải vì số kết nối đồng thời tăng vọt.

**Connection pool** (bể kết nối, ví dụ HikariCP) giải quyết bằng cách **mở sẵn một số lượng kết nối cố định**, giữ chúng sống, và cho ứng dụng **mượn — dùng xong trả lại bể** để request khác tái sử dụng, thay vì mở/đóng liên tục. Điều này giảm chi phí thiết lập kết nối xuống gần như bằng 0 cho mỗi request.

</details>

**8. Đoạn code sau chạy đúng logic nhưng tiềm ẩn nguy cơ rò rỉ tài nguyên khi ứng dụng chạy lâu dài. Hãy chỉ ra vấn đề và sửa lại.**

```java
public String getUserName(Connection conn, long id) throws SQLException {
    PreparedStatement ps = conn.prepareStatement("SELECT name FROM users WHERE id = ?");
    ps.setLong(1, id);
    ResultSet rs = ps.executeQuery();
    if (rs.next()) {
        return rs.getString("name");
    }
    return null;
}
```

<details className="qa">
<summary>Xem đáp án</summary>

Vấn đề: `PreparedStatement` (`ps`) và `ResultSet` (`rs`) **không bao giờ được đóng** — hàm `return` thoát ngay khi tìm thấy kết quả (hoặc khi không tìm thấy), bỏ qua việc gọi `close()`. Gọi hàm này lặp đi lặp lại (ví dụ hàng nghìn lần trong một ứng dụng chạy lâu dài) sẽ dần **rò rỉ tài nguyên**, cuối cùng CSDL báo lỗi "quá nhiều cursor/statement đang mở" hoặc ứng dụng hết bộ nhớ.

Sửa lại bằng `try-with-resources`:

```java
public String getUserName(Connection conn, long id) throws SQLException {
    String sql = "SELECT name FROM users WHERE id = ?";
    try (PreparedStatement ps = conn.prepareStatement(sql)) {
        ps.setLong(1, id);
        try (ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                return rs.getString("name");
            }
            return null;
        }
    }
}
```

Lưu ý: hàm này nhận `Connection` từ bên ngoài truyền vào nên **không đóng `conn`** ở đây — việc đóng `conn` (trả về pool) là trách nhiệm của nơi đã mở/mượn nó.

</details>

**9. Bạn cần chèn 10.000 bản ghi vào bảng `logs` một lúc. Chèn bằng cách gọi `executeUpdate()` 10.000 lần liên tiếp trong vòng lặp rất chậm. Nên tối ưu như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Nên dùng **batch insert** (chèn theo lô) qua `addBatch()` / `executeBatch()` của `PreparedStatement`, thay vì gửi từng câu lệnh riêng lẻ tới CSDL:

```java
String sql = "INSERT INTO logs (message, created_at) VALUES (?, ?)";
try (PreparedStatement ps = conn.prepareStatement(sql)) {
    conn.setAutoCommit(false); // tắt auto-commit để gộp thành một transaction

    for (LogEntry entry : entries) { // entries có 10.000 phần tử
        ps.setString(1, entry.message());
        ps.setTimestamp(2, entry.createdAt());
        ps.addBatch(); // gom vào lô, chưa gửi ngay
    }

    ps.executeBatch();  // gửi toàn bộ lô một lần
    conn.commit();       // xác nhận transaction
}
```

Lợi ích: giảm đáng kể số lần **round-trip mạng** giữa ứng dụng và CSDL (gửi một lô lớn thay vì 10.000 lần gửi/nhận riêng lẻ), đồng thời gộp thành một transaction giúp CSDL tối ưu việc ghi xuống đĩa — nhanh hơn nhiều lần so với gọi `executeUpdate()` lặp lại.

</details>

**10. Đoạn code sau in ra gì? Giải thích lỗi trong cách đánh số tham số của `PreparedStatement`.**

```java
String sql = "UPDATE users SET name = ?, email = ? WHERE id = ?";
PreparedStatement ps = conn.prepareStatement(sql);
ps.setString(0, "An");
ps.setString(1, "an@example.com");
ps.setLong(2, 5L);
ps.executeUpdate();
```

<details className="qa">
<summary>Xem đáp án</summary>

Đoạn code này ném ra **`SQLException`** (thường có thông báo dạng "Parameter index out of range" hoặc tương tự tùy driver), vì **chỉ số tham số của `PreparedStatement` bắt đầu từ 1, không phải 0**.

Câu lệnh có 3 dấu `?`, tương ứng với chỉ số hợp lệ là `1`, `2`, `3`. Đoạn code trên gọi `ps.setString(0, ...)` — chỉ số `0` không tồn tại, gây lỗi ngay tại dòng đó.

Sửa lại cho đúng:

```java
ps.setString(1, "An");             // ? thứ 1: name
ps.setString(2, "an@example.com"); // ? thứ 2: email
ps.setLong(3, 5L);                  // ? thứ 3: id
```

Đây là lỗi rất dễ mắc với người quen tư duy mảng/index bắt đầu từ 0 trong Java.

</details>

**11. Bạn cần INSERT một bản ghi `users` mới và lấy ngay giá trị `id` tự sinh (auto-generated key) của bản ghi đó để dùng tiếp (ví dụ tạo đơn hàng gắn với user vừa tạo). JDBC hỗ trợ việc này như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng cờ **`Statement.RETURN_GENERATED_KEYS`** khi tạo `PreparedStatement`, sau đó gọi `getGeneratedKeys()` để lấy `ResultSet` chứa các khóa tự sinh:

```java
String sql = "INSERT INTO users (name, email) VALUES (?, ?)";
try (PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
    ps.setString(1, "Nguyen An");
    ps.setString(2, "an@example.com");
    ps.executeUpdate();

    try (ResultSet keys = ps.getGeneratedKeys()) {
        if (keys.next()) {
            long newId = keys.getLong(1); // lấy id vừa được CSDL tự sinh
            System.out.println("User mới có id = " + newId);
        }
    }
}
```

Không có cờ này, sau khi `INSERT` thành công bạn sẽ không có cách trực tiếp nào để biết CSDL vừa sinh ra giá trị `id` (khóa tự tăng) là bao nhiêu, mà phải chạy thêm một câu `SELECT` riêng (kém hiệu quả và có thể không chính xác nếu có insert khác xen vào).

</details>

**12. Ứng dụng web của bạn dùng JDBC thuần, chạy ổn định vài giờ đầu rồi bắt đầu báo lỗi "Too many connections" từ CSDL, dù lượng truy cập không tăng đột biến. Hãy nêu các nguyên nhân khả dĩ và cách chẩn đoán.**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên nhân khả dĩ nhất: **rò rỉ connection (connection leak)** — code ở đâu đó mở `Connection` nhưng không đóng lại trong mọi nhánh xử lý (ví dụ quên `try-with-resources`, hoặc có nhánh `return`/`throw` sớm bỏ qua việc đóng). Theo thời gian, số connection "treo" (không dùng nhưng cũng chưa được trả về CSDL) tích lũy dần cho tới khi chạm giới hạn tối đa mà CSDL cho phép.

Cách chẩn đoán:

- Rà lại toàn bộ chỗ mở `Connection` thủ công, đảm bảo dùng **try-with-resources** nhất quán, không có nhánh nào bỏ sót việc đóng.
- Nếu đang dùng **connection pool (HikariCP)**, bật log/metric của pool (ví dụ `leakDetectionThreshold`) — HikariCP có thể tự cảnh báo khi một connection bị giữ quá lâu mà không trả về pool, kèm stack trace nơi đã mượn nó, giúp xác định chính xác đoạn code gây leak.
- Kiểm tra các đường code hiếm khi được chạy (nhánh xử lý lỗi, xử lý ngoại lệ đặc biệt) — đây thường là nơi dễ bị bỏ sót việc đóng resource nhất vì ít được test tới.

</details>

---

## 3. Hibernate

Bài học: [3. Hibernate](../../java/11-database-access/3_hibernate.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. "Object-relational impedance mismatch" là gì? Hibernate giải quyết vấn đề này như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Object-relational impedance mismatch** (sự lệch pha giữa đối tượng và quan hệ) là thuật ngữ mô tả sự khác biệt cơ bản giữa hai mô hình:

- Thế giới **object (Java)**: dữ liệu là các đối tượng có thuộc tính, quan hệ (kế thừa, tham chiếu đối tượng khác), và hành vi (method).
- Thế giới **relational (SQL)**: dữ liệu là các bảng phẳng, hàng, cột, liên kết qua khóa ngoại — không có khái niệm kế thừa hay đối tượng lồng nhau.

Việc chuyển đổi qua lại thủ công giữa hai mô hình này (như trong JDBC thuần: tự đọc từng cột `ResultSet` rồi gán vào field) rất lặp đi lặp lại và dễ sai, đặc biệt khi có quan hệ phức tạp.

**Hibernate** giải quyết bằng cách **tự động ánh xạ** class ↔ bảng, đối tượng ↔ hàng, thuộc tính ↔ cột (chỉ cần khai báo qua annotation), và tự sinh SQL cần thiết phía sau — lập trình viên thao tác hoàn toàn bằng object, không cần tự tay chuyển đổi.

</details>

**2. Vì sao Hibernate yêu cầu mọi Entity phải có một constructor không tham số (no-args constructor)?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi đọc dữ liệu từ CSDL, Hibernate cần **tự tạo instance của Entity trước, rồi mới gán giá trị vào từng field sau** (thường bằng reflection — cơ chế đọc/ghi field lúc runtime mà không cần gọi qua constructor có tham số). Để làm được điều này, Hibernate cần một cách tạo object mà **không cần biết trước giá trị của bất kỳ field nào** — đó chính là constructor rỗng.

Nếu Entity chỉ có constructor có tham số (ví dụ `User(String name, String email)`), Hibernate không biết truyền giá trị gì vào lúc khởi tạo (vì lúc đó chưa đọc dữ liệu từ CSDL), dẫn tới lỗi khi Hibernate cố tạo object. Vì vậy quy tắc bắt buộc: **luôn khai báo thêm một constructor không tham số**, dù bạn có thể vẫn giữ thêm các constructor có tham số khác để tiện dùng trong code nghiệp vụ.

</details>

**3. Phân biệt vòng đời của `SessionFactory` và `Session`. Vì sao không nên tạo `SessionFactory` mới cho mỗi request?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`SessionFactory`**: đối tượng **rất nặng** — khi khởi tạo, nó đọc toàn bộ cấu hình, phân tích mọi Entity đã đăng ký, chuẩn bị sẵn các cấu trúc ánh xạ và (thường) cả connection pool bên dưới. Vì chi phí khởi tạo lớn, `SessionFactory` được thiết kế để tạo **đúng một lần** khi ứng dụng khởi động và **dùng chung** cho toàn bộ vòng đời ứng dụng — nó thread-safe (an toàn khi nhiều luồng cùng dùng).
- **`Session`**: đối tượng **nhẹ**, đại diện cho một "đơn vị công việc" (ví dụ xử lý một request), tạo mới và đóng lại sau khi xong việc — **không** thread-safe, không nên chia sẻ giữa nhiều luồng.

Nếu tạo mới `SessionFactory` cho mỗi request, ứng dụng phải trả chi phí khởi tạo nặng nề đó (đọc cấu hình, phân tích mapping...) **lặp lại liên tục**, làm chậm nghiêm trọng và lãng phí tài nguyên — hoàn toàn đi ngược lại mục đích thiết kế của `SessionFactory`.

</details>

**4. Trong đoạn code UPDATE sau, tại sao Hibernate biết cần sinh câu `UPDATE` dù không có lệnh nào gọi `session.update(user)` hay tương tự?**

```java
try (Session session = sessionFactory.openSession()) {
    session.beginTransaction();

    User user = session.get(User.class, 1L);
    user.setEmail("new@example.com");

    session.getTransaction().commit();
}
```

<details className="qa">
<summary>Xem đáp án</summary>

Đây là cơ chế **dirty checking** (kiểm tra thay đổi) của Hibernate: khi một entity được lấy ra thông qua `Session` (gọi là ở trạng thái **managed** — được Hibernate quản lý và theo dõi), Hibernate **ghi nhớ trạng thái ban đầu** của entity đó lúc tải lên.

Khi transaction chuẩn bị `commit()`, Hibernate tự động **so sánh trạng thái hiện tại với trạng thái ban đầu** đã ghi nhớ. Nếu phát hiện field nào đã thay đổi (ở đây là `email`), Hibernate tự sinh câu `UPDATE` tương ứng chỉ cho những cột đã thay đổi — hoàn toàn không cần bạn gọi thêm bất kỳ hàm "save/update" nào một cách tường minh, chỉ cần sửa trực tiếp thuộc tính của object.

</details>

**5. HQL khác gì so với SQL thông thường? Đoạn HQL sau có an toàn trước SQL injection không? Vì sao?**

```java
String hql = "FROM User WHERE email = :email";
session.createQuery(hql, User.class)
        .setParameter("email", userInput)
        .uniqueResult();
```

<details className="qa">
<summary>Xem đáp án</summary>

**HQL** (Hibernate Query Language) có cú pháp gần giống SQL nhưng thao tác trên **tên class và thuộc tính Java** (`User`, `email`) thay vì **tên bảng và cột CSDL** (`users`, `email` cột) — Hibernate tự dịch HQL thành SQL thật tương ứng với CSDL đang dùng.

Đoạn code trên **an toàn** trước SQL injection vì dùng tham số có tên (`:email`) kết hợp `setParameter(...)`, tương tự cơ chế của `PreparedStatement` trong JDBC — dữ liệu `userInput` được truyền tách biệt khỏi cấu trúc câu truy vấn, dù nội dung có chứa ký tự đặc biệt cũng không thể làm thay đổi ý nghĩa câu HQL.

Lưu ý: an toàn này **chỉ đúng khi dùng tham số hóa**. Nếu ai đó lỡ nối chuỗi trực tiếp vào HQL (`"FROM User WHERE email = '" + userInput + "'"`), lỗ hổng SQL injection vẫn xảy ra tương tự như với SQL thuần — Hibernate không tự động bảo vệ khỏi cách viết sai này.

</details>

**6. Lazy loading là gì? Đoạn code sau ném ra `LazyInitializationException`. Giải thích nguyên nhân và nêu hai cách khắc phục.**

```java
User user;
try (Session session = sessionFactory.openSession()) {
    user = session.get(User.class, 1L);
} // Session đã đóng ở đây

System.out.println(user.getOrders().size()); // ném LazyInitializationException
```

<details className="qa">
<summary>Xem đáp án</summary>

**Lazy loading** (tải lười) nghĩa là dữ liệu của quan hệ (ví dụ danh sách `orders` của `user`) **chưa được tải từ CSDL** ngay khi lấy `user` ra — Hibernate chỉ tải khi thuộc tính đó thực sự được truy cập.

Nguyên nhân lỗi: việc "tải khi cần" đòi hỏi Hibernate phải chạy thêm một câu `SELECT` mới, và để làm điều đó cần một **`Session` đang mở, còn kết nối tới CSDL**. Ở đây, `user.getOrders()` được gọi **sau khi `Session` đã đóng** (`try` đã kết thúc) — Hibernate không còn kết nối nào để chạy truy vấn bổ sung, nên ném ra `LazyInitializationException`.

Hai cách khắc phục:

- **Truy cập dữ liệu lazy trong lúc `Session` còn mở**, ví dụ gọi `user.getOrders().size()` ngay bên trong khối `try` trước khi Session đóng.
- **Dùng `JOIN FETCH`** (hoặc chuyển field đó sang `FetchType.EAGER` nếu luôn cần dùng) để Hibernate tải sẵn dữ liệu liên quan ngay trong câu truy vấn ban đầu, không cần Session còn mở về sau.

</details>

**7. Vấn đề "N+1 query" trong Hibernate là gì? Cho ví dụ minh họa và cách khắc phục bằng `JOIN FETCH`.**

<details className="qa">
<summary>Xem đáp án</summary>

**N+1 query** là tình trạng: để hiển thị **N** đối tượng cha kèm dữ liệu quan hệ của chúng, Hibernate chạy **1 câu truy vấn** để lấy N đối tượng cha, rồi chạy thêm **N câu truy vấn riêng lẻ khác** (mỗi đối tượng một câu) để tải dữ liệu lazy liên quan — tổng cộng N+1 câu truy vấn thay vì chỉ cần 1 hoặc 2 câu tối ưu.

```java
List<User> users = session.createQuery("FROM User", User.class).list(); // 1 query

for (User user : users) {
    System.out.println(user.getOrders().size()); // mỗi vòng lặp lại chạy 1 query lazy riêng!
}
// Nếu có 100 user -> tổng cộng 1 + 100 = 101 câu truy vấn!
```

Khắc phục bằng `JOIN FETCH` để gộp việc tải quan hệ vào cùng một câu truy vấn duy nhất:

```java
String hql = "FROM User u JOIN FETCH u.orders"; // tải sẵn orders trong 1 query duy nhất
List<User> users = session.createQuery(hql, User.class).list();

for (User user : users) {
    System.out.println(user.getOrders().size()); // KHÔNG chạy thêm query nào nữa
}
```

</details>

**8. Đoạn code sau chạy xong nhưng dữ liệu không được lưu vào CSDL, dù không có exception nào xảy ra. Lỗi ở đâu?**

```java
try (Session session = sessionFactory.openSession()) {
    session.beginTransaction();

    User user = new User("Nguyen An", "an@example.com");
    session.persist(user);

    // Thiếu một dòng quan trọng ở đây
}
```

<details className="qa">
<summary>Xem đáp án</summary>

Thiếu lời gọi **`session.getTransaction().commit()`**. `persist(user)` chỉ đưa entity vào trạng thái được `Session` **theo dõi (managed)** trong bộ nhớ, chuẩn bị để ghi xuống CSDL — nhưng dữ liệu **chỉ thực sự được ghi xuống CSDL khi transaction được `commit()`**.

Ở đây, khối `try-with-resources` kết thúc và đóng `Session` **mà chưa commit**, khiến giao dịch bị bỏ dở (thường tương đương một rollback ngầm) — dữ liệu không bao giờ được lưu thật, dù code chạy không có lỗi cú pháp hay exception nào.

Sửa lại:

```java
try (Session session = sessionFactory.openSession()) {
    session.beginTransaction();

    User user = new User("Nguyen An", "an@example.com");
    session.persist(user);

    session.getTransaction().commit(); // BẮT BUỘC để lưu thật vào CSDL
}
```

</details>

**9. `@GeneratedValue` có những `GenerationType` (chiến lược sinh khóa) phổ biến nào? Nêu ít nhất hai loại và sự khác biệt giữa chúng.**

<details className="qa">
<summary>Xem đáp án</summary>

- **`GenerationType.IDENTITY`**: dựa vào cột **auto-increment** của chính CSDL (ví dụ `AUTO_INCREMENT` của MySQL) — CSDL tự sinh giá trị mỗi khi `INSERT`. Đơn giản, được hỗ trợ rộng rãi, nhưng Hibernate **không thể tối ưu batch insert** hiệu quả với chiến lược này vì phải insert từng dòng để biết được id ngay lập tức.
- **`GenerationType.SEQUENCE`**: dựa vào **sequence** (đối tượng sinh số riêng biệt của CSDL, ví dụ PostgreSQL/Oracle hỗ trợ tốt) — Hibernate có thể **xin trước một dải số** từ sequence, cho phép tối ưu batch insert tốt hơn nhiều so với `IDENTITY`.
- **`GenerationType.TABLE`**: mô phỏng sequence bằng một **bảng riêng** lưu giá trị đếm — hoạt động được trên mọi CSDL (kể cả loại không hỗ trợ sequence) nhưng chậm hơn vì cần thêm thao tác đọc/ghi bảng đếm.
- **`GenerationType.AUTO`**: để Hibernate **tự chọn** chiến lược phù hợp nhất dựa trên loại CSDL đang dùng.

Trong thực tế với MySQL thường dùng `IDENTITY`, còn với PostgreSQL nhiều dự án ưu tiên `SEQUENCE` để tận dụng khả năng tối ưu batch insert tốt hơn.

</details>

**10. Hibernate và JPA (Jakarta Persistence API) liên quan với nhau như thế nào? Nếu code chỉ dùng annotation `@Entity`, `@Id` chuẩn JPA, có thể đổi từ Hibernate sang một ORM khác mà không sửa code không?**

<details className="qa">
<summary>Xem đáp án</summary>

**JPA** (Jakarta Persistence API, trước đây là Java Persistence API) là một **đặc tả (specification)** — tức tập hợp các interface và annotation chuẩn (`@Entity`, `@Id`, `EntityManager`...) mô tả **"nên có những gì"**, chứ bản thân JPA không phải là một thư viện có thể chạy được.

**Hibernate** là một trong các **triển khai (implementation)** phổ biến nhất của đặc tả JPA — nó hiện thực hóa các interface JPA bằng code thực sự chạy được, đồng thời cũng cung cấp thêm một số API/tính năng riêng ngoài chuẩn JPA (như `Session`, HQL — trong khi JPA có `EntityManager`, JPQL tương ứng).

Nếu code **chỉ dùng đúng annotation và interface chuẩn JPA** (không dùng các API mở rộng riêng của Hibernate như `Session`), về lý thuyết có thể chuyển sang một triển khai JPA khác (ví dụ EclipseLink) mà ít phải sửa code nghiệp vụ — đây chính là lợi ích của việc lập trình theo chuẩn thay vì phụ thuộc trực tiếp vào một implementation cụ thể. Tuy nhiên trong thực tế, Hibernate vẫn là lựa chọn phổ biến áp đảo, nên tình huống đổi triển khai JPA khác khá hiếm gặp.

</details>

**11. Bạn có một API trả về danh sách 1.000 `User`, mỗi user hiển thị kèm số lượng đơn hàng (`orders.size()`). Đo đạc cho thấy API này chạy rất chậm và log ghi nhận hơn 1.000 câu SQL được thực thi cho một request. Chẩn đoán vấn đề và đề xuất cách khắc phục.**

<details className="qa">
<summary>Xem đáp án</summary>

Đây là dấu hiệu kinh điển của **vấn đề N+1 query**: 1 câu truy vấn lấy 1.000 user, cộng thêm khoảng 1.000 câu truy vấn riêng lẻ khác (mỗi user một câu) để tải lazy `orders` khi gọi `.size()` — tổng cộng khoảng 1.001 câu SQL, mỗi câu tốn thêm một round-trip mạng tới CSDL, làm request cực kỳ chậm.

Hướng khắc phục, tùy nhu cầu cụ thể:

- Nếu **luôn cần** số lượng đơn hàng cho mọi user trong danh sách này: dùng **`JOIN FETCH`** để gộp việc tải `orders` vào cùng một câu truy vấn ban đầu, giảm còn 1 (hoặc rất ít) câu SQL.
- Nếu chỉ cần **đếm số lượng** chứ không cần toàn bộ dữ liệu `orders`, cân nhắc viết một câu truy vấn riêng dùng `COUNT` nhóm theo `user_id` thay vì tải cả object `orders` rồi mới đếm trong bộ nhớ — tránh tải dữ liệu thừa không cần thiết.
- Nếu quan hệ được truy cập theo nhiều kiểu khác nhau tùy tình huống, có thể cấu hình **batch fetching** (`@BatchSize` hoặc tương đương) để Hibernate gộp nhiều truy vấn lazy nhỏ thành một số ít câu truy vấn dùng `IN (...)`, giảm đáng kể số round-trip dù không tối ưu tuyệt đối như `JOIN FETCH`.

</details>

**12. Đoạn code sau xóa một `User` nhưng ném ra lỗi vi phạm ràng buộc khóa ngoại (foreign key constraint violation) từ CSDL. Vì sao, và nên xử lý thế nào?**

```java
try (Session session = sessionFactory.openSession()) {
    session.beginTransaction();

    User user = session.get(User.class, 1L); // user này đang có nhiều Order liên kết
    session.remove(user);

    session.getTransaction().commit();
}
```

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên nhân: bảng `orders` có cột khóa ngoại (`user_id`) tham chiếu tới bảng `users`. Khi xóa một `User` mà vẫn còn các `Order` đang tham chiếu tới `id` của nó, CSDL **từ chối xóa** để bảo toàn tính toàn vẹn dữ liệu (referential integrity) — không cho phép tồn tại một `Order` có `user_id` trỏ tới một `User` không còn tồn tại.

Hướng xử lý, tùy nghiệp vụ mong muốn:

- **Xóa theo tầng (cascade delete)**: nếu nghiệp vụ cho phép xóa hết đơn hàng khi xóa user, khai báo `@OneToMany(cascade = CascadeType.REMOVE)` trên quan hệ `orders` trong entity `User`, để Hibernate tự xóa các `Order` liên quan trước khi xóa `User`.
- **Chặn xóa nếu còn dữ liệu liên quan**: nếu nghiệp vụ không cho phép mất dữ liệu đơn hàng, nên kiểm tra trước (`if (!user.getOrders().isEmpty()) { báo lỗi nghiệp vụ }`) và trả về thông báo rõ ràng cho người dùng thay vì để lỗi CSDL cấp thấp lộ ra ngoài.
- **Xóa mềm (soft delete)**: thay vì xóa thật, đánh dấu user là "đã vô hiệu hóa" (thêm cột `deleted` hoặc `active`) — giữ nguyên toàn vẹn dữ liệu lịch sử, phổ biến trong các hệ thống cần lưu vết giao dịch.

</details>

---

## 4. Spring Data JPA

Bài học: [4. Spring Data JPA](../../java/11-database-access/4_spring-data-jpa.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Phân biệt rõ ràng JPA, Hibernate và Spring Data JPA. Vì sao ba khái niệm này thường gây nhầm lẫn cho người mới?**

<details className="qa">
<summary>Xem đáp án</summary>

- **JPA** (Jakarta Persistence API): một **chuẩn (specification)** — quy định các annotation (`@Entity`, `@Id`...) và interface (`EntityManager`...), nhưng bản thân không phải code chạy được.
- **Hibernate**: một **bản hiện thực (implementation)** của chuẩn JPA — là code thực sự thực thi các quy định đó, tự sinh SQL, quản lý entity...
- **Spring Data JPA**: một **lớp tiện ích** đặt **bên trên** JPA (thường dùng Hibernate làm bản hiện thực bên dưới), giúp giảm code hơn nữa bằng cách tự sinh cả tầng repository chỉ từ một interface khai báo.

Nhầm lẫn thường đến từ việc cả ba đều "làm việc với CSDL bằng đối tượng" và dùng chung annotation (`@Entity`...), khiến người mới khó phân biệt ranh giới: JPA là **luật chơi**, Hibernate là **người chơi tuân theo luật**, Spring Data JPA là **trợ lý** giúp bạn chơi nhanh hơn dựa trên luật đó.

</details>

**2. `JpaRepository<User, Long>` chỉ là một interface trống, không có thân hàm nào. Vậy khi gọi `userRepository.save(user)`, ai thực sự thực thi logic lưu vào CSDL?**

<details className="qa">
<summary>Xem đáp án</summary>

Spring Data JPA dùng cơ chế **proxy động (dynamic proxy)**: lúc ứng dụng khởi động, Spring **quét** các interface kế thừa `JpaRepository`, rồi **tự sinh ra một class hiện thực (implementation)** ở runtime cho từng interface đó (thường tên dạng `SimpleJpaRepository`), triển khai sẵn các phương thức chuẩn như `save`, `findById`, `findAll`...

Khi bạn gọi `userRepository.save(user)`, thực chất bạn đang gọi vào **bean proxy** mà Spring đã tạo và đăng ký sẵn (nhờ dependency injection) — proxy này bên trong gọi tới `EntityManager` của JPA (thường do Hibernate hiện thực) để thực sự chạy `persist`/`merge`. Bạn không bao giờ tự viết class implement `UserRepository`, toàn bộ được sinh và tiêm tự động.

</details>

**3. Viết một query method (dùng quy ước đặt tên) cho `ProductRepository` để: tìm tất cả sản phẩm có giá lớn hơn một giá trị cho trước VÀ thuộc một danh mục cụ thể, sắp xếp theo giá tăng dần.**

<details className="qa">
<summary>Xem đáp án</summary>

```java
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByPriceGreaterThanAndCategoryOrderByPriceAsc(
            BigDecimal price, String category);
}
```

Giải thích cấu trúc tên: `findBy` (bắt đầu truy vấn) + `PriceGreaterThan` (điều kiện `price > ?`) + `And` (nối điều kiện) + `Category` (điều kiện `category = ?`) + `OrderByPriceAsc` (sắp xếp theo `price` tăng dần). Spring Data JPA đọc đúng tên hàm này và tự sinh câu JPQL tương ứng, không cần viết thêm dòng code nào.

</details>

**4. Khi nào nên dùng query method (đặt tên hàm), khi nào nên chuyển sang `@Query`?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Query method** phù hợp khi điều kiện truy vấn **đơn giản, ít mệnh đề** — tên hàm vẫn còn dễ đọc, ví dụ `findByEmailAndStatus`. Ưu điểm: không cần viết gì thêm, Spring tự sinh.
- **`@Query`** nên dùng khi:
  - Điều kiện phức tạp khiến tên hàm theo quy ước trở nên **quá dài, khó đọc** (ví dụ nhiều `And`/`Or` lồng nhau, điều kiện `JOIN` giữa nhiều entity).
  - Cần viết truy vấn có **phép tính, hàm tổng hợp phức tạp** (subquery, `GROUP BY` nhiều tầng) mà quy ước đặt tên không diễn đạt được.
  - Cần **native query** (SQL gốc) để tận dụng tính năng đặc thù của CSDL mà JPQL không hỗ trợ.

Nguyên tắc chung: ưu tiên query method cho các trường hợp đơn giản để giữ code gọn, chỉ chuyển sang `@Query` khi tên hàm bắt đầu trở nên khó đọc hoặc không đủ biểu đạt.

</details>

**5. Đoạn code sau tiềm ẩn lỗi gì khi user không tồn tại? Sửa lại theo cách an toàn.**

```java
public User getUser(Long id) {
    return userRepository.findById(id).get();
}
```

<details className="qa">
<summary>Xem đáp án</summary>

`findById(id)` trả về **`Optional<User>`** — một "hộp" có thể rỗng nếu không tìm thấy user tương ứng. Gọi thẳng `.get()` mà không kiểm tra trước sẽ ném ra **`NoSuchElementException`** nếu `Optional` đang rỗng, và thông báo lỗi mặc định này **không rõ ràng** cho người dùng API (không nói rõ "user không tồn tại").

Sửa lại theo cách xử lý tường minh, thường dùng `orElseThrow(...)` để ném ra một exception nghiệp vụ rõ ràng hơn:

```java
public User getUser(Long id) {
    return userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user id = " + id));
}
```

Cách này giúp tầng gọi phía trên (ví dụ `@ExceptionHandler` trong Controller) dễ dàng bắt đúng loại exception và trả về status code phù hợp (ví dụ `404 Not Found`).

</details>

**6. `@Transactional` làm gì? Mặc định, nó tự động rollback khi gặp loại exception nào, và khi nào KHÔNG tự rollback?**

<details className="qa">
<summary>Xem đáp án</summary>

`@Transactional` đánh dấu một phương thức (hoặc class) chạy trong một **giao dịch (transaction)**: mọi thao tác ghi dữ liệu bên trong hoặc **thành công toàn bộ (commit)**, hoặc **hủy toàn bộ (rollback)** nếu có lỗi — đảm bảo dữ liệu không bị ở trạng thái "nửa vời".

Mặc định, Spring chỉ tự động **rollback khi gặp `RuntimeException`** (unchecked exception, bao gồm cả các exception con của nó) hoặc `Error`. Với **checked exception** (ví dụ tự khai báo `throws SomeCheckedException extends Exception`), Spring **KHÔNG tự rollback** trừ khi bạn khai báo rõ ràng:

```java
@Transactional(rollbackFor = SomeCheckedException.class)
public void doSomething() throws SomeCheckedException {
    // nếu SomeCheckedException được ném ra, giao dịch vẫn rollback nhờ khai báo trên
}
```

Đây là điểm dễ gây lỗi tiềm ẩn: nếu code nghiệp vụ ném checked exception mà quên khai báo `rollbackFor`, dữ liệu đã ghi trước đó **vẫn được commit** dù có lỗi xảy ra sau đó — gây ra tình trạng dữ liệu không nhất quán ngoài ý muốn.

</details>

**7. Ứng dụng không khởi động được, log báo lỗi liên quan tới `findByEmial` trong `UserRepository`. Nguyên nhân có khả năng cao nhất là gì?**

```java
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmial(String email); // ???
}
```

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên nhân: gõ sai tên thuộc tính trong tên phương thức — `findByEmial` thay vì `findByEmail`. Spring Data JPA phân tích tên hàm để suy ra tên **thuộc tính (field)** cần lọc trong entity; nó tìm thuộc tính tên `emial` trong class `User` nhưng **không tồn tại** thuộc tính nào tên như vậy (entity chỉ có `email`).

Vì việc phân tích và sinh truy vấn diễn ra **lúc khởi động ứng dụng** (Spring cần xác thực mọi query method hợp lệ trước khi ứng dụng sẵn sàng phục vụ), lỗi này khiến ứng dụng **không khởi động được** ngay từ đầu, thay vì chỉ lỗi khi gọi tới hàm đó lúc chạy — đây thực ra là một điểm tốt: lỗi được phát hiện sớm thay vì âm thầm gây bug lúc runtime.

Sửa lại: đổi tên đúng chính tả `findByEmail`.

</details>

**8. `spring.jpa.hibernate.ddl-auto=update` tiện lợi khi phát triển nhưng vì sao **không nên** dùng trên production? Nên thay thế bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`ddl-auto=update` khiến Hibernate **tự động thay đổi cấu trúc bảng** (thêm cột, đổi kiểu dữ liệu...) dựa trên sự khác biệt giữa Entity hiện tại và schema đang có trong CSDL, mỗi khi ứng dụng khởi động.

Rủi ro trên production:

- Hibernate có thể suy luận **sai ý định** của lập trình viên khi cấu trúc entity thay đổi (ví dụ đổi tên field: Hibernate có thể hiểu thành "thêm cột mới" thay vì "đổi tên cột cũ", khiến dữ liệu cột cũ bị bỏ quên hoặc mất).
- Không có **lịch sử thay đổi (migration history)** rõ ràng, khó biết chính xác schema đã thay đổi ra sao qua từng phiên bản, khó rollback khi có sự cố.
- Chạy tự động lúc khởi động nghĩa là một lần deploy sai sót có thể **thay đổi schema production ngay lập tức**, không có bước rà soát/duyệt trước.

Thay thế bằng công cụ **migration chuyên dụng** như **Flyway** hoặc **Liquibase**: mỗi thay đổi schema được viết thành một file migration có đánh số thứ tự, được review trước khi áp dụng, chạy theo đúng trình tự và ghi lại lịch sử đầy đủ — an toàn và có thể kiểm soát hơn nhiều so với để Hibernate tự đoán.

</details>

**9. Bạn có `List<User> findAll()` rồi lặp qua từng user để lấy `user.getOrders().size()`, gây ra vấn đề N+1 giống như ở Hibernate thuần. Trong Spring Data JPA, có cách nào để khai báo tải sẵn quan hệ `orders` mà không cần tự viết JPQL với `JOIN FETCH`?**

<details className="qa">
<summary>Xem đáp án</summary>

Có thể dùng annotation **`@EntityGraph`** để khai báo "khi chạy truy vấn này, tải sẵn kèm quan hệ nào" mà không cần tự viết JPQL:

```java
public interface UserRepository extends JpaRepository<User, Long> {

    @EntityGraph(attributePaths = "orders")
    List<User> findAll(); // ghi đè findAll() mặc định, tải sẵn orders trong 1 câu truy vấn
}
```

Cách khác là vẫn dùng `@Query` với `JOIN FETCH` tường minh:

```java
@Query("SELECT u FROM User u JOIN FETCH u.orders")
List<User> findAllWithOrders();
```

Cả hai cách đều giải quyết được vấn đề N+1 bằng cách gộp việc tải `orders` vào cùng một câu truy vấn ban đầu; `@EntityGraph` thường gọn hơn khi chỉ cần khai báo "tải kèm gì" mà không cần viết lại toàn bộ câu truy vấn.

</details>

**10. Thiết kế một endpoint trả về danh sách sản phẩm có phân trang và sắp xếp, cho phép client tùy chỉnh qua query string (ví dụ `?page=0&size=20&sort=price,desc`). Hãy viết signature của Repository method và Controller tương ứng.**

<details className="qa">
<summary>Xem đáp án</summary>

```java
// Repository: JpaRepository đã có sẵn hàm nhận Pageable
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Không cần viết thêm gì nếu chỉ cần phân trang toàn bộ sản phẩm —
    // findAll(Pageable) đã có sẵn từ JpaRepository (PagingAndSortingRepository)
}

// Controller: Spring tự parse tham số page/size/sort thành Pageable
@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    public Page<Product> getProducts(Pageable pageable) {
        // Pageable được Spring tự tạo từ query string ?page=0&size=20&sort=price,desc
        return productRepository.findAll(pageable);
    }
}
```

`Page<Product>` trả về không chỉ danh sách sản phẩm của trang hiện tại mà còn kèm metadata hữu ích (tổng số phần tử, tổng số trang...), giúp client tự dựng giao diện phân trang mà không cần API riêng để đếm tổng.

</details>

**11. Vì sao Controller không nên gọi trực tiếp `Repository` mà nên đi qua tầng `Service`, dù về mặt kỹ thuật Controller hoàn toàn có thể tiêm `UserRepository` thẳng vào và gọi `save()`, `findById()`?**

<details className="qa">
<summary>Xem đáp án</summary>

Về mặt kỹ thuật, Controller có thể tiêm `Repository` trực tiếp và gọi được, nhưng đây là **thực hành không tốt** vì:

- **Trộn lẫn trách nhiệm**: Controller chỉ nên lo tiếp nhận request/trả response; logic nghiệp vụ (validate, kiểm tra trùng lặp, tính toán, gọi nhiều repository phối hợp với nhau, quản lý transaction) nên tập trung ở Service — nếu để lẫn vào Controller, code khó tái sử dụng và khó test.
- **`@Transactional` cần đặt ở đúng tầng**: các thao tác cần đảm bảo tính toàn vẹn giao dịch (ví dụ trừ tiền tài khoản A và cộng tiền tài khoản B phải cùng thành công hoặc cùng thất bại) cần được gộp trong một phương thức `@Transactional` ở Service — Controller gọi trực tiếp nhiều lời gọi Repository rời rạc sẽ **không đảm bảo tính nguyên tử (atomicity)** giữa các thao tác đó.
- **Dễ tái sử dụng logic**: nếu sau này có thêm một nguồn gọi khác (ví dụ một job chạy nền, hoặc một Controller khác) cần logic tương tự, đặt logic ở Service cho phép tái sử dụng, trong khi đặt trong Controller thì logic đó chỉ dùng được ở đúng endpoint đó.

</details>

**12. `@Transactional(readOnly = true)` khác gì `@Transactional` thông thường? Vì sao nên dùng nó cho các phương thức chỉ đọc dữ liệu?**

<details className="qa">
<summary>Xem đáp án</summary>

`@Transactional(readOnly = true)` báo cho Spring (và tầng bên dưới như Hibernate) biết phương thức này **chỉ đọc dữ liệu, không có thao tác ghi nào**. Dựa trên thông tin này:

- **Hibernate có thể bỏ qua cơ chế dirty checking** (theo dõi thay đổi entity để tự sinh `UPDATE`) cho các entity được tải trong giao dịch này, vì biết chắc sẽ không có thay đổi nào cần lưu — giảm chi phí bộ nhớ và CPU khi tải nhiều entity.
- Một số driver CSDL hoặc connection pool có thể **tối ưu riêng cho giao dịch chỉ đọc** (ví dụ định tuyến tới một database replica chỉ đọc trong kiến trúc có read replica).

```java
@Transactional(readOnly = true)
public List<User> getAllUsers() {
    return userRepository.findAll();
}
```

Nguyên tắc thực hành tốt: đánh dấu `readOnly = true` cho mọi phương thức Service chỉ đọc dữ liệu, giữ `@Transactional` thông thường (mặc định `readOnly = false`) cho các phương thức có ghi (tạo, sửa, xóa) — vừa rõ ràng về ý định, vừa tận dụng được tối ưu hiệu năng có sẵn.

</details>

---

## 5. EBean

Bài học: [5. EBean](../../java/11-database-access/5_ebean.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Phân biệt mẫu thiết kế Active Record (EBean) và Repository (Hibernate/Spring Data JPA). Cho ví dụ cú pháp của mỗi kiểu.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Active Record**: bản thân đối tượng **chủ động** biết cách lưu/xóa chính nó — đối tượng vừa chứa dữ liệu vừa chứa hành vi lưu trữ. Ví dụ: `user.save()`, `user.delete()`.
- **Repository**: đối tượng dữ liệu **thụ động**, việc lưu trữ được giao cho một đối tượng "kho" (repository) riêng biệt xử lý. Ví dụ: `userRepository.save(user)`.

Sự khác biệt cốt lõi nằm ở **ai chịu trách nhiệm lưu trữ**: với Active Record, trách nhiệm đó nằm ngay trong entity; với Repository, trách nhiệm đó được tách ra một tầng riêng, giữ entity chỉ tập trung vào dữ liệu.

</details>

**2. Vì sao EBean tránh được các lỗi kiểu "detached entity passed to persist" hay `LazyInitializationException` thường gặp ở Hibernate?**

<details className="qa">
<summary>Xem đáp án</summary>

Các lỗi đó ở Hibernate xuất phát từ khái niệm **persistence context** (`Session`/`EntityManager`) quản lý trạng thái entity (`attached`/`detached`) — một entity chỉ có thể lazy-load hoặc được Hibernate tự động theo dõi thay đổi khi vẫn còn nằm trong một `Session`/`EntityManager` đang mở; thao tác sai thời điểm (ví dụ sau khi Session đã đóng) sẽ gây lỗi.

**EBean bỏ hoàn toàn khái niệm persistence context**: không có `Session`, không có trạng thái attached/detached để quản lý. Mỗi lần gọi `user.save()`, EBean tự xử lý toàn bộ việc kết nối, ghi dữ liệu và đóng lại ngay trong lời gọi đó — không có khái niệm "entity bị tách khỏi ngữ cảnh" vì bản thân không tồn tại "ngữ cảnh" nào cần entity phải gắn vào liên tục. Nhờ đơn giản hóa mô hình này, lớp lỗi liên quan tới persistence context của Hibernate không xuất hiện ở EBean.

</details>

**3. Để một class Java trở thành Model của EBean có `save()`/`delete()`, cần khai báo những gì?**

<details className="qa">
<summary>Xem đáp án</summary>

```java
import io.ebean.Model;
import jakarta.persistence.*;

@Entity                            // Annotation JPA chuẩn, giống Hibernate
@Table(name = "users")
public class User extends Model {  // Bắt buộc: kế thừa io.ebean.Model

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ... các field khác với @Column
}
```

Hai điều kiện bắt buộc: (1) đánh dấu `@Entity` như JPA thông thường để EBean biết đây là entity ánh xạ tới bảng, và (2) **kế thừa `io.ebean.Model`** — đây là điểm khác biệt so với Hibernate, vì `Model` chính là nơi cung cấp sẵn các phương thức `save()`, `delete()` cho mọi entity kế thừa nó.

</details>

**4. `find.byId(1L).findOne()`-style và `findList()` khác nhau thế nào? Điều gì xảy ra nếu dùng `findOne()` cho một điều kiện khớp nhiều hơn 1 bản ghi?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`findOne()`**: kỳ vọng kết quả truy vấn **đúng 0 hoặc 1 bản ghi**. Trả về `null` nếu không có kết quả nào.
- **`findList()`**: trả về **danh sách (`List`)** kết quả, dùng cho truy vấn có thể khớp nhiều bản ghi.

Nếu điều kiện truyền cho `findOne()` thực tế khớp **nhiều hơn 1 bản ghi** trong CSDL, EBean sẽ ném ra exception (thường liên quan tới việc kết quả trả về nhiều hơn 1 dòng ngoài mong đợi), vì `findOne()` không được thiết kế để xử lý trường hợp có nhiều kết quả — đây là dấu hiệu cho thấy điều kiện lọc chưa đủ chặt để xác định duy nhất một bản ghi (ví dụ lọc theo một cột không phải khóa duy nhất).

</details>

**5. Đoạn code sau có vấn đề bảo mật gì? Sửa lại cho đúng cách của EBean.**

```java
String keyword = userInput;
List<User> users = User.find.query()
        .where().raw("name LIKE '%" + keyword + "%'")
        .findList();
```

<details className="qa">
<summary>Xem đáp án</summary>

Vấn đề: dùng `.raw(...)` để **tự ghép chuỗi** điều kiện SQL với dữ liệu người dùng (`keyword`) — đây chính là lỗ hổng **SQL injection**, y hệt việc nối chuỗi trong `Statement` của JDBC thuần. Dù EBean có cơ chế tham số hóa mặc định qua các hàm như `.eq()`, `.like()`, việc dùng `.raw()` với chuỗi tự ghép sẽ **vô hiệu hóa hoàn toàn** lớp bảo vệ đó.

Sửa lại bằng `.like()` với tham số được EBean tự động tham số hóa:

```java
String keyword = userInput;
List<User> users = User.find.query()
        .where().like("name", "%" + keyword + "%") // "%...%" chỉ là mẫu, EBean vẫn tham số hóa giá trị
        .findList();
```

Lưu ý: dù `keyword` được ghép với ký tự `%` ngay trong code Java, giá trị cuối cùng vẫn được EBean truyền xuống CSDL như **một tham số duy nhất** (giống `PreparedStatement.setString`), không bị diễn giải thành cú pháp SQL — khác hoàn toàn với việc ghép trực tiếp vào chuỗi câu lệnh như `.raw(...)` ở trên.

</details>

**6. So sánh EBean và Hibernate/Spring Data JPA theo các tiêu chí: phong cách CRUD, độ phổ biến, đường cong học tập.**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | Hibernate/Spring Data JPA | EBean |
|---|---|---|
| Phong cách CRUD | Repository — đối tượng thụ động (`repository.save(user)`) | Active Record — đối tượng chủ động (`user.save()`) |
| Độ phổ biến | Rất cao, gần như mặc định khi dùng Spring Boot | Thấp hơn nhiều, dùng trong các ngách cụ thể (Play Framework...) |
| Đường cong học | Dốc hơn — nhiều khái niệm (Session/EntityManager, persistence context) | Thoải hơn — ít khái niệm, cú pháp trực quan |
| Hệ sinh thái | Khổng lồ, tài liệu và cộng đồng rất lớn | Nhỏ hơn, ít tài liệu tiếng Việt/cộng đồng hỗ trợ |

Do độ phổ biến chênh lệch lớn, phần lớn lộ trình học Java backend nên ưu tiên Hibernate/Spring Data JPA; EBean là kiến thức "biết thêm" hữu ích khi làm việc với Play Framework hoặc thích phong cách Active Record.

</details>

**7. Bạn tham gia một dự án nhỏ dùng Play Framework, đội ngũ quen phong cách Ruby on Rails. Vì sao EBean (ORM mặc định của Play) là lựa chọn hợp lý ở đây hơn là cấu hình thêm Hibernate?**

<details className="qa">
<summary>Xem đáp án</summary>

- **EBean là ORM tích hợp sẵn của Play Framework** — không cần thêm cấu hình phức tạp để tích hợp một ORM khác vào; dùng đúng công cụ mặc định giúp giảm rủi ro xung đột cấu hình và tận dụng tài liệu chính thức của Play (vốn đã hướng dẫn theo EBean).
- **Phong cách Active Record của EBean gần gũi với Ruby on Rails** (vốn cũng dùng Active Record) — đội ngũ quen Rails sẽ thấy `user.save()` tự nhiên và nhanh tiếp cận hơn nhiều so với việc phải học thêm khái niệm `Session`/`EntityManager` của Hibernate.
- **Dự án nhỏ, ít nhu cầu truy vấn phức tạp**: lợi thế "kiểm soát chi tiết, hệ sinh thái lớn" của Hibernate/Spring Data JPA phát huy rõ nhất ở dự án lớn, nhiều truy vấn phức tạp — với quy mô nhỏ, chi phí học thêm Hibernate có thể không xứng đáng so với lợi ích.

Tình huống này minh họa nguyên tắc chung: chọn công cụ theo đúng bối cảnh dự án (framework đang dùng, kinh nghiệm đội ngũ, quy mô), không phải luôn chọn công cụ phổ biến nhất một cách máy móc.

</details>

**8. Đoạn code sau gọi `save()` hai lần. Vì sao EBean biết lần gọi thứ hai là `UPDATE` chứ không phải tạo thêm một bản ghi `INSERT` mới?**

```java
User user = new User("Nguyen An", "an@example.com");
user.save();   // (1)

user.setEmail("new@example.com");
user.save();   // (2)
```

<details className="qa">
<summary>Xem đáp án</summary>

EBean phân biệt dựa trên việc **khóa chính (`id`) đã có giá trị hay chưa**:

- Ở lần gọi **(1)**, `user` vừa được tạo bằng `new User(...)`, field `id` đang là `null` (chưa có giá trị) — EBean hiểu đây là một entity **mới**, nên sinh câu `INSERT`. Sau khi `INSERT` thành công, EBean **tự gán giá trị `id`** mới sinh (nhờ `@GeneratedValue`) ngược lại vào field `id` của object `user`.
- Ở lần gọi **(2)**, `user` (vẫn là cùng một object, giờ đã có `id` khác `null` từ bước trên) được sửa `email` rồi gọi lại `save()` — vì `id` **đã có giá trị**, EBean hiểu đây là entity **đã tồn tại** trong CSDL, nên sinh câu `UPDATE` dựa trên `id` đó thay vì `INSERT` thêm một bản ghi mới.

Đây là quy tắc chung của nhiều ORM theo phong cách Active Record: trạng thái "mới hay đã tồn tại" được suy ra từ việc khóa chính có giá trị hay không, chứ không cần bạn tự gọi hai hàm khác nhau cho tạo mới và cập nhật.

</details>

**9. Active Record (như EBean) bị phê bình là vi phạm nguyên tắc "Single Responsibility" (một class chỉ nên có một trách nhiệm). Hãy giải thích lời phê bình này và nêu một hệ quả thực tế khi viết unit test.**

<details className="qa">
<summary>Xem đáp án</summary>

Lời phê bình: một entity theo phong cách Active Record (ví dụ `User extends Model`) đang gánh **hai trách nhiệm khác nhau** cùng lúc:

- **Trách nhiệm 1 — biểu diễn dữ liệu nghiệp vụ**: chứa các field như `name`, `email` và logic nghiệp vụ liên quan tới đối tượng đó.
- **Trách nhiệm 2 — biết cách lưu trữ**: chứa cả logic kết nối, thực thi thao tác với CSDL (thông qua `save()`, `delete()` kế thừa từ `Model`).

Nguyên tắc **Single Responsibility** (một phần của SOLID) cho rằng một class chỉ nên có **một lý do để thay đổi** — nhưng entity Active Record có thể phải thay đổi vì lý do nghiệp vụ (thêm field mới) **hoặc** vì lý do hạ tầng lưu trữ (đổi cách kết nối CSDL), vi phạm nguyên tắc này.

Hệ quả thực tế khi viết unit test: muốn viết **unit test thuần** (không cần CSDL thật) cho logic nghiệp vụ nằm trong entity, bạn khó tách rời được vì entity đã "dính chặt" với hành vi lưu trữ — test dễ trở thành integration test (cần CSDL thật hoặc CSDL giả lập) thay vì unit test độc lập nhanh gọn. Ngược lại, với mẫu Repository (Hibernate/Spring Data), entity (`User`) hoàn toàn tách biệt khỏi logic lưu trữ (`UserRepository`), nên có thể test logic nghiệp vụ của `User` mà không cần đụng tới bất kỳ thứ gì liên quan tới CSDL.

</details>
