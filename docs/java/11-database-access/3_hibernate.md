---
sidebar_position: 3
title: "3. Hibernate"
---

# 3. Hibernate — ORM nổi tiếng nhất

Hibernate là thư viện ORM nổi tiếng nhất trong Java, giúp bạn làm việc với cơ sở dữ liệu bằng đối tượng Java mà không phải tự viết SQL cho các thao tác thông thường. Bài này hướng dẫn cách khai báo Entity bằng annotation, dùng SessionFactory và Session để thực hiện CRUD, truy vấn với HQL, hiểu lazy loading và vì sao Hibernate an toàn trước SQL injection. Đây là nền tảng quan trọng trước khi học Spring Data JPA.

---

## Mục lục

- [Vì sao có Hibernate (ORM)?](#vì-sao-có-hibernate-orm)
- [Vì sao cần Hibernate?](#vì-sao-cần-hibernate)
- [ORM là gì? (nhắc lại nhanh)](#orm-là-gì-nhắc-lại-nhanh)
- [Khai báo Entity: @Entity, @Id, @Column](#khai-báo-entity-entity-id-column)
- [SessionFactory và Session](#sessionfactory-và-session)
- [CRUD với Hibernate: save, get, update, delete](#crud-với-hibernate-save-get-update-delete)
- [HQL — truy vấn theo đối tượng](#hql--truy-vấn-theo-đối-tượng)
- [Lazy loading — tải lười](#lazy-loading--tải-lười)
- [Vì sao không cần viết SQL tay?](#vì-sao-không-cần-viết-sql-tay)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao có Hibernate (ORM)?

**Vấn đề:** Dùng JDBC thuần, bạn phải tự viết SQL bằng tay và **ánh xạ thủ công
từng cột** của `ResultSet` sang field của object — lặp đi lặp lại, dễ sai. Khi
có quan hệ và khóa ngoại thì còn cực hơn nhiều. Gốc rễ là sự **lệch pha giữa
thế giới object (Java) và thế giới table (SQL)** — gọi là *object-relational
impedance mismatch*.

```java
// JDBC thuần: viết SQL tay + đọc từng cột ResultSet thủ công
String sql = "SELECT id, name, email FROM users WHERE id = ?";
try (PreparedStatement ps = conn.prepareStatement(sql)) {
    ps.setLong(1, 1L);
    try (ResultSet rs = ps.executeQuery()) {
        if (rs.next()) {
            User user = new User();
            user.setId(rs.getLong("id"));       // gán thủ công cột -> field
            user.setName(rs.getString("name"));  // lặp lại với mọi cột
            user.setEmail(rs.getString("email"));// quên/sai 1 cột là lỗi
            // ... còn quan hệ, khóa ngoại thì phải tự JOIN và ráp object
        }
    }
}
```

**Giải pháp:** **Hibernate** (ORM, là một triển khai của JPA) **ánh xạ class ↔
table tự động** qua annotation `@Entity`, cho bạn thao tác DB **bằng object**
(save/find) thay vì SQL tay. Hibernate tự sinh SQL, quản lý quan hệ, lazy
loading, cache, và cung cấp HQL/Criteria. Lượng code lặp (boilerplate) giảm rất
nhiều.

```java
// Hibernate: thao tác bằng object, không viết SQL, không ráp cột thủ công
User user = session.get(User.class, 1L);  // tự sinh SELECT + ráp object
System.out.println(user.getName());

session.persist(new User("Nguyen An", "an@example.com")); // tự sinh INSERT
```

:::tip[Dùng thực tế]

- **Lưu/đọc entity không viết SQL**: `persist()`, `get()` đủ cho CRUD thường ngày.
- **Ánh xạ quan hệ**: dùng `@OneToMany` để 1 `User` gắn nhiều `Order` mà không tự JOIN.
- **Đổi loại CSDL dễ dàng**: chỉ đổi cấu hình "dialect" (phương ngữ), không sửa code.
- **Giảm code DAO lặp**: bớt hẳn lớp DAO đọc `ResultSet` thủ công cho từng bảng.

:::

---

## Vì sao cần Hibernate?

Ở bài JDBC, bạn thấy để lưu một `User`, bạn phải tự viết SQL `INSERT`, tự gán
từng tham số, tự đọc `ResultSet`. Làm với 1 bảng đã mệt, với hàng chục bảng thì
cực kỳ lặp đi lặp lại và dễ sai.

**Hibernate** là một thư viện **ORM** (Object-Relational Mapping — ánh xạ đối
tượng - quan hệ) giúp bạn **làm việc với CSDL bằng đối tượng Java**, không cần
viết SQL tay cho các thao tác thông thường.

> Ví dụ đời thường: nếu JDBC là tự nấu ăn từ nguyên liệu thô, thì Hibernate là
> **thuê đầu bếp riêng**. Bạn chỉ nói "lưu user này", đầu bếp tự dịch ra SQL,
> tự nấu, tự dọn. Bạn tập trung vào logic nghiệp vụ, không lo chi tiết SQL.

---

## ORM là gì? (nhắc lại nhanh)

ORM tự động chuyển đổi giữa hai thế giới:

- Một **class Java** ⟷ một **bảng CSDL**.
- Một **đối tượng** ⟷ một **hàng**.
- Một **thuộc tính (field)** ⟷ một **cột**.

Bạn chỉ cần "đánh dấu" class Java bằng vài chú thích (annotation), Hibernate tự
biết phải lưu vào bảng nào, cột nào.

---

## Khai báo Entity: @Entity, @Id, @Column

**Entity** (thực thể) là một class Java được ánh xạ tới một bảng CSDL. Bạn dùng
các **annotation** (chú thích — ghi chú đặc biệt bắt đầu bằng `@` để cung cấp
thông tin cho thư viện) để khai báo.

```java
import jakarta.persistence.*;

@Entity                       // Đánh dấu: đây là một entity (ánh xạ tới bảng)
@Table(name = "users")        // Tên bảng trong CSDL là "users"
public class User {

    @Id                       // Đây là khóa chính (primary key)
    @GeneratedValue(strategy = GenerationType.IDENTITY) // CSDL tự sinh id tăng dần
    private Long id;

    @Column(name = "name", nullable = false) // Ánh xạ tới cột "name", không được null
    private String name;

    @Column(name = "email", unique = true)   // Cột "email", giá trị phải duy nhất
    private String email;

    // Hibernate yêu cầu phải có constructor rỗng (không tham số)
    public User() {
    }

    public User(String name, String email) {
        this.name = name;
        this.email = email;
    }

    // ... getter và setter cho id, name, email
}
```

Giải thích các annotation:

- **`@Entity`**: báo đây là class được ánh xạ tới bảng.
- **`@Table(name = "...")`**: chỉ định tên bảng (nếu bỏ, mặc định lấy tên class).
- **`@Id`**: đánh dấu thuộc tính làm khóa chính.
- **`@GeneratedValue`**: để CSDL tự sinh giá trị khóa chính (id tự tăng).
- **`@Column`**: tùy chỉnh tên cột, ràng buộc như `nullable`, `unique`.

---

## SessionFactory và Session

Để làm việc với Hibernate, bạn cần hai khái niệm:

- **`SessionFactory`** (nhà máy tạo session): đối tượng **nặng**, tạo **một lần
  duy nhất** khi app khởi động. Nó đọc cấu hình và giữ thông tin kết nối CSDL.
- **`Session`** (phiên làm việc): đối tượng **nhẹ**, tạo mới cho **mỗi đơn vị
  công việc** (ví dụ mỗi yêu cầu của người dùng). Dùng để lưu, đọc, xóa entity.

> Ví dụ đời thường: `SessionFactory` giống như **một ngân hàng** (mở một lần),
> còn `Session` giống như **một lượt giao dịch tại quầy** (mở rồi đóng cho từng
> khách).

```java
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;

// Tạo SessionFactory MỘT LẦN khi app khởi động (rất tốn tài nguyên)
SessionFactory sessionFactory = new Configuration()
        .configure()              // đọc file cấu hình hibernate.cfg.xml
        .addAnnotatedClass(User.class)
        .buildSessionFactory();

// Mỗi đơn vị công việc mở một Session mới
Session session = sessionFactory.openSession();
```

---

## CRUD với Hibernate: save, get, update, delete

Mọi thao tác thay đổi dữ liệu phải nằm trong một **transaction** (giao dịch —
nhóm thao tác hoặc thành công tất cả, hoặc hủy tất cả). Đây là CRUD cơ bản:

```java
// --- CREATE: thêm mới ---
try (Session session = sessionFactory.openSession()) {
    session.beginTransaction();           // bắt đầu giao dịch

    User user = new User("Nguyen An", "an@example.com");
    session.persist(user);                // lưu đối tượng vào CSDL (INSERT)

    session.getTransaction().commit();    // xác nhận, lưu thật vào CSDL
}

// --- READ: đọc theo khóa chính ---
try (Session session = sessionFactory.openSession()) {
    // get() trả về đối tượng có id = 1, hoặc null nếu không tìm thấy
    User user = session.get(User.class, 1L);
    System.out.println(user.getName());
}

// --- UPDATE: cập nhật ---
try (Session session = sessionFactory.openSession()) {
    session.beginTransaction();

    User user = session.get(User.class, 1L);
    user.setEmail("new@example.com");     // chỉ cần đổi thuộc tính
    // Hibernate tự phát hiện thay đổi và sinh câu UPDATE khi commit

    session.getTransaction().commit();
}

// --- DELETE: xóa ---
try (Session session = sessionFactory.openSession()) {
    session.beginTransaction();

    User user = session.get(User.class, 1L);
    session.remove(user);                 // xóa đối tượng khỏi CSDL (DELETE)

    session.getTransaction().commit();
}
```

Lưu ý: bạn **không hề viết một dòng SQL nào**. Hibernate tự sinh `INSERT`,
`SELECT`, `UPDATE`, `DELETE` phía sau. Và quan trọng: Hibernate **luôn dùng
tham số hóa** (giống `PreparedStatement`), nên **an toàn trước SQL injection**
một cách mặc định.

---

## HQL — truy vấn theo đối tượng

Khi cần truy vấn phức tạp hơn (lọc theo điều kiện, sắp xếp...), Hibernate cung
cấp **HQL** (Hibernate Query Language — ngôn ngữ truy vấn của Hibernate). HQL
trông giống SQL nhưng thao tác trên **tên class và thuộc tính Java**, không phải
tên bảng và cột.

```java
try (Session session = sessionFactory.openSession()) {
    // Lưu ý: "User" là TÊN CLASS, "email" là TÊN THUỘC TÍNH (không phải tên cột)
    // Dùng :email là THAM SỐ — an toàn, KHÔNG nối chuỗi
    String hql = "FROM User WHERE email = :email";

    User user = session.createQuery(hql, User.class)
            .setParameter("email", "an@example.com") // gán tham số an toàn
            .uniqueResult();                          // lấy 1 kết quả duy nhất

    System.out.println(user.getName());
}
```

> **Quy tắc bảo mật vẫn áp dụng**: trong HQL, luôn dùng tham số `:tên` với
> `setParameter(...)`, **không nối chuỗi** dữ liệu người dùng vào câu HQL.

---

## Lazy loading — tải lười

Giả sử một `User` có nhiều `Order` (đơn hàng). Khi bạn lấy một `User`, Hibernate
có nên tải luôn toàn bộ đơn hàng không? Nếu user có 10.000 đơn hàng mà bạn chỉ
cần xem tên, thì tải hết là rất lãng phí.

**Lazy loading** (tải lười) nghĩa là: chỉ tải dữ liệu liên quan **khi nào thực
sự cần dùng**. Đây là hành vi mặc định của Hibernate cho các quan hệ "một - nhiều".

> Ví dụ đời thường: lazy loading giống như **menu nhà hàng**. Bạn được đưa menu
> (thông tin user) ngay, nhưng món ăn (đơn hàng) chỉ được nấu khi bạn gọi món.

```java
try (Session session = sessionFactory.openSession()) {
    User user = session.get(User.class, 1L);
    // Tới đây, danh sách orders CHƯA được tải từ CSDL

    // Chỉ khi gọi getOrders() và truy cập, Hibernate mới chạy SELECT đơn hàng
    System.out.println(user.getOrders().size());
}
```

Ngược lại với lazy là **eager loading** (tải háo hức — tải luôn mọi thứ ngay).
Lazy thường tiết kiệm hơn, nhưng cẩn thận lỗi ở phần dưới.

---

## Vì sao không cần viết SQL tay?

- Hibernate **tự sinh SQL** từ đối tượng và annotation của bạn.
- Cùng một code Java chạy được trên **nhiều loại CSDL** (MySQL, PostgreSQL,
  Oracle...) chỉ bằng cách đổi cấu hình "dialect" (phương ngữ — kiểu SQL riêng
  của từng CSDL). Bạn không phải sửa code.
- Hibernate quản lý cache, theo dõi thay đổi đối tượng, tự tối ưu.
- Bảo mật mặc định: luôn tham số hóa, chống SQL injection.

Tuy vậy, với truy vấn **rất phức tạp** (báo cáo, thống kê), đôi khi viết SQL gốc
(native query) vẫn rõ ràng và nhanh hơn. ORM giúp đỡ, không thay thế hoàn toàn.

---

## Lỗi thường gặp

- **Quên constructor rỗng** trong entity → Hibernate báo lỗi khi tạo đối tượng.
- **Quên `@Id`** → Hibernate không biết khóa chính, báo lỗi khi khởi động.
- **Quên `commit()`** giao dịch → dữ liệu không được lưu thật vào CSDL.
- **LazyInitializationException**: truy cập dữ liệu lazy **sau khi `Session` đã
  đóng**. Cần truy cập trong lúc Session còn mở, hoặc dùng eager khi cần thiết.
- **Nối chuỗi trong HQL** → vẫn dính SQL injection. Luôn dùng `setParameter`.
- **Vấn đề N+1 query**: lặp qua danh sách rồi mỗi lần lại truy vấn lazy → sinh ra
  cực nhiều câu SELECT. Cần dùng `JOIN FETCH` để gộp lại.

---

## Tóm tắt

- **Hibernate** là thư viện ORM giúp làm việc CSDL bằng **đối tượng Java**.
- Đánh dấu class bằng `@Entity`, `@Id`, `@Column`... để ánh xạ tới bảng.
- **`SessionFactory`** tạo một lần; **`Session`** tạo mới cho mỗi đơn vị công việc.
- CRUD: `persist` (tạo), `get` (đọc), đổi thuộc tính (sửa), `remove` (xóa) —
  tất cả trong một **transaction** với `commit()`.
- **HQL** truy vấn theo tên class/thuộc tính; **luôn dùng `setParameter`**.
- **Lazy loading**: chỉ tải dữ liệu liên quan khi cần. Cẩn thận
  `LazyInitializationException` và vấn đề N+1.
- Hibernate **mặc định tham số hóa** → an toàn trước SQL injection.
