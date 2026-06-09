---
sidebar_position: 4
title: "Giới thiệu về Hibernate"
---

# Giới thiệu về Hibernate

Hibernate là framework ORM phổ biến nhất cho Java, giúp lập trình viên làm việc với cơ sở dữ liệu thông qua các đối tượng Java thay vì viết SQL thủ công. Nó tự động hoá những công việc lặp đi lặp lại của JDBC như viết câu SQL, đọc từng cột, quản lý kết nối. Bài này giới thiệu khái niệm ORM, vai trò của Hibernate, mối quan hệ với JPA và khi nào nên dùng Hibernate thay vì JDBC thuần.

## ORM là gì?

**ORM** (Object-Relational Mapping — ánh xạ đối tượng-quan hệ) là kỹ thuật cho phép lập trình viên làm việc với cơ sở dữ liệu quan hệ thông qua các đối tượng Java thay vì viết SQL thủ công.

Với JDBC thuần, developer phải tự:
- Viết từng câu SQL INSERT, SELECT, UPDATE, DELETE.
- Đọc từng cột từ `ResultSet` và gán vào thuộc tính của object.
- Quản lý transaction, kết nối thủ công.

ORM tự động hóa tất cả các công việc lặp đi lặp lại đó.

```
JDBC thuần:   Java Object  ←──thủ công──→  Bảng SQL
ORM:          Java Object  ←──tự động──→   Bảng SQL
```

---

## Hibernate là gì?

**Hibernate** là framework ORM phổ biến nhất cho Java, ra đời năm 2001, hiện do Red Hat duy trì. Hibernate triển khai đặc tả **JPA** (Java Persistence API — tiêu chuẩn Java EE/Jakarta EE định nghĩa giao diện ORM) và bổ sung thêm nhiều tính năng riêng.

Mối quan hệ giữa JPA và Hibernate:

```
JPA (đặc tả/interface)
    └── Hibernate (một trong các cài đặt/implementation)
    └── EclipseLink (cài đặt khác)
    └── OpenJPA (cài đặt khác)
```

Trong thực tế, khi nói "dùng JPA", thường có nghĩa là dùng Hibernate làm nền tảng bên dưới.

---

## Hibernate giải quyết được gì?

| Tác vụ | JDBC thuần | Hibernate |
|---|---|---|
| Chèn một object vào DB | Viết SQL INSERT + set từng tham số | `session.save(object)` |
| Đọc một bản ghi theo ID | SQL SELECT + đọc từng cột từ ResultSet | `session.get(User.class, id)` |
| Ánh xạ quan hệ (1-N, N-N) | JOIN thủ công, tự ghép object | Khai báo annotation, tự động |
| Chuyển đổi giữa các DB | Sửa lại SQL (khác dialect) | Chỉ đổi `dialect`, SQL tự sinh |
| Cache kết quả truy vấn | Tự cài đặt | Tích hợp sẵn (L1, L2 cache) |

---

## Ví dụ nhanh: So sánh JDBC vs Hibernate

### Với JDBC thuần

```java
// Lưu một User vào DB bằng JDBC
String sql = "INSERT INTO users (name, email) VALUES (?, ?)";
try (PreparedStatement ps = conn.prepareStatement(sql)) {
    ps.setString(1, user.getName());
    ps.setString(2, user.getEmail());
    ps.executeUpdate();
}
```

### Với Hibernate

```java
// Ánh xạ class User với bảng "users" bằng JPA annotation
import jakarta.persistence.*;

@Entity                    // @Entity: đánh dấu đây là một entity (thực thể) được quản lý bởi JPA
@Table(name = "users")     // @Table: chỉ định tên bảng trong cơ sở dữ liệu
public class User {

    @Id                    // @Id: đánh dấu trường này là khóa chính (primary key)
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Tự tăng do DB quản lý
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "email", unique = true)
    private String email;

    // Constructors, getters, setters...
}
```

```java
// Lưu một User vào DB bằng Hibernate
// Session: phiên làm việc với Hibernate, tương đương Connection trong JDBC
try (Session session = sessionFactory.openSession()) {
    Transaction tx = session.beginTransaction();

    User user = new User();
    user.setName("Nguyen Van A");
    user.setEmail("a@example.com");

    session.persist(user); // Chỉ một dòng, không cần viết SQL

    tx.commit();
}
```

---

## Các khái niệm cốt lõi của Hibernate

| Khái niệm | Giải thích |
|---|---|
| `SessionFactory` | Đối tượng nặng, tạo một lần khi khởi động ứng dụng, dùng để mở `Session` |
| `Session` | Phiên làm việc tương tác với DB, tương đương `Connection` trong JDBC |
| `Transaction` | Giao dịch, tương tự Transaction trong JDBC |
| `HQL` | **Hibernate Query Language** — ngôn ngữ truy vấn hướng đối tượng của Hibernate, cú pháp giống SQL nhưng dùng tên class và thuộc tính Java thay vì tên bảng và cột |
| `JPQL` | **Jakarta Persistence Query Language** — phiên bản chuẩn hóa của HQL theo đặc tả JPA |
| `Criteria API` | Cách xây dựng câu truy vấn bằng Java thuần (type-safe), không dùng chuỗi SQL |

---

## Khi nào dùng JDBC thuần, khi nào dùng Hibernate?

**Dùng JDBC thuần khi:**
- Câu truy vấn phức tạp, cần tối ưu từng chi tiết.
- Dự án nhỏ, ít bảng, không có quan hệ phức tạp.
- Cần toàn quyền kiểm soát SQL được sinh ra.

**Dùng Hibernate/JPA khi:**
- Ứng dụng có nhiều entity với quan hệ phức tạp (1-N, N-N).
- Muốn giảm thiểu code lặp (boilerplate code).
- Cần hỗ trợ nhiều loại cơ sở dữ liệu khác nhau.
- Dùng Spring Boot (tích hợp Spring Data JPA rất tiện).

---

## Tóm tắt

- **ORM** ánh xạ tự động giữa Java object và bảng SQL, giảm code lặp.
- **Hibernate** là framework ORM phổ biến nhất cho Java, đồng thời là cài đặt chuẩn của **JPA**.
- Hibernate phù hợp cho ứng dụng doanh nghiệp với nhiều entity và quan hệ phức tạp.
- Phần tiếp theo trong lộ trình học sẽ đi sâu vào **JPA/Hibernate** với cấu hình, mapping, truy vấn HQL/JPQL và tích hợp Spring Boot.
