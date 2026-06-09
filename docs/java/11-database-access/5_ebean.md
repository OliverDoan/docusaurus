---
sidebar_position: 5
title: "5. EBean"
---

# 5. EBean — ORM kiểu Active Record

EBean là một thư viện ORM cho Java theo phong cách Active Record, nổi bật vì cú pháp gọn gàng khi đối tượng tự biết cách lưu chính nó bằng cách gọi `user.save()`. Bài này giải thích Active Record là gì, cách khai báo Model, thực hiện CRUD và truy vấn với Finder, đồng thời so sánh EBean với Hibernate để bạn biết khi nào nên cân nhắc dùng nó.

---

## Mục lục

- [EBean là gì?](#ebean-là-gì)
- [Active Record là gì?](#active-record-là-gì)
- [Khai báo Model](#khai-báo-model)
- [Lưu, cập nhật, xóa: model.save()](#lưu-cập-nhật-xóa-modelsave)
- [Tìm kiếm với Finder và query](#tìm-kiếm-với-finder-và-query)
- [So sánh EBean với Hibernate](#so-sánh-ebean-với-hibernate)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## EBean là gì?

**EBean** là một thư viện **ORM** cho Java, nổi bật vì cú pháp **gọn gàng, dễ
đọc**. Điểm khác biệt lớn nhất so với Hibernate là EBean theo phong cách
**Active Record** (sẽ giải thích ngay dưới), giúp code ngắn và trực quan hơn cho
các thao tác đơn giản.

> Ví dụ đời thường: nếu Hibernate là chiếc xe nhiều nút bấm và tính năng, thì
> EBean là chiếc xe điện đơn giản — ít nút hơn, lái dễ hơn cho nhu cầu thường ngày.

---

## Active Record là gì?

**Active Record** (bản ghi chủ động) là một mẫu thiết kế trong đó **bản thân đối
tượng biết cách lưu chính nó** vào CSDL. Tức là đối tượng vừa chứa dữ liệu, vừa
có sẵn các phương thức như `save()`, `delete()`.

So sánh nhanh:

- **Kiểu Repository** (Hibernate/Spring Data): bạn gọi `repository.save(user)`.
  Đối tượng `user` *thụ động* — có một "kho" lo việc lưu.
- **Kiểu Active Record** (EBean): bạn gọi `user.save()`. Đối tượng `user` *chủ
  động* — tự lo việc lưu chính nó.

> Ví dụ đời thường: Active Record giống như nhân viên **tự nộp báo cáo** lên hệ
> thống (`báo_cáo.nộp()`), thay vì đưa cho thư ký nộp hộ (`thư_ký.nộp(báo_cáo)`).

---

## Khai báo Model

Trong EBean, entity thường kế thừa `io.ebean.Model` để có sẵn `save()`,
`delete()`. Các annotation ánh xạ vẫn dùng chuẩn JPA quen thuộc.

```java
import io.ebean.Model;
import jakarta.persistence.*;

@Entity                       // Ánh xạ tới bảng (chuẩn JPA, giống Hibernate)
@Table(name = "users")        // Tên bảng "users"
public class User extends Model {  // Kế thừa Model để có save()/delete()

    @Id                                                 // Khóa chính
    @GeneratedValue(strategy = GenerationType.IDENTITY) // id tự tăng
    private Long id;

    @Column(nullable = false)  // cột name, không null
    private String name;

    @Column(unique = true)     // cột email, duy nhất
    private String email;

    public User() { }

    public User(String name, String email) {
        this.name = name;
        this.email = email;
    }

    // ... getter và setter
    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
```

---

## Lưu, cập nhật, xóa: model.save()

Vì `User` kế thừa `Model`, mọi thao tác CRUD gọi **trực tiếp trên đối tượng**:

```java
// --- CREATE: thêm mới ---
User user = new User("Nguyen An", "an@example.com");
user.save();   // đối tượng tự lưu chính nó vào CSDL (INSERT)

// --- UPDATE: cập nhật ---
user.setEmail("new@example.com");
user.save();   // cùng phương thức save() — EBean biết đây là cập nhật (UPDATE)

// --- DELETE: xóa ---
user.delete(); // đối tượng tự xóa chính nó (DELETE)
```

Cú pháp rất ngắn gọn: không cần `SessionFactory`, không cần `repository`, không
cần mở/đóng session thủ công cho các thao tác cơ bản. EBean **mặc định tham số
hóa** mọi truy vấn nên **an toàn trước SQL injection**.

---

## Tìm kiếm với Finder và query

Để truy vấn, EBean dùng đối tượng **`Finder`** (bộ tìm kiếm) hoặc API query.
Cách phổ biến là khai báo một `Finder` tĩnh ngay trong model:

```java
import io.ebean.Finder;

@Entity
@Table(name = "users")
public class User extends Model {
    // ... các thuộc tính như trên

    // Finder<KiểuKhóaChính, KiểuEntity> — công cụ tìm kiếm cho User
    public static final Finder<Long, User> find = new Finder<>(User.class);
}
```

Sau đó dùng `find` để truy vấn. Lưu ý: dùng **`.eq()`, `.like()`** với tham số,
EBean **tự tham số hóa** — KHÔNG nối chuỗi:

```java
// Tìm theo khóa chính id = 1
User user = User.find.byId(1L);

// Tìm 1 user theo email — eq() truyền tham số an toàn, KHÔNG nối chuỗi SQL
User byEmail = User.find.query()
        .where().eq("email", "an@example.com")  // điều kiện email = ?
        .findOne();                              // lấy 1 kết quả

// Tìm danh sách user có tên chứa từ khóa, sắp xếp theo tên
List<User> list = User.find.query()
        .where().like("name", "%An%")            // name LIKE ?
        .orderBy("name asc")
        .findList();                             // lấy danh sách

// Đếm số user
int total = User.find.query().findCount();
```

> **Quy tắc bảo mật**: luôn truyền giá trị qua `.eq()`, `.like()`,
> `.setParameter()`... để EBean tham số hóa. **KHÔNG** tự ghép chuỗi điều kiện
> với dữ liệu người dùng.

---

## So sánh EBean với Hibernate

| Tiêu chí | Hibernate / Spring Data | EBean |
|----------|-------------------------|-------|
| Phong cách | Repository (đối tượng thụ động) | Active Record (`user.save()`) |
| Cú pháp CRUD | `repository.save(user)` | `user.save()` |
| Độ phổ biến | Rất cao (chuẩn ngành) | Thấp hơn, ngách riêng |
| Đường cong học | Dốc hơn, nhiều khái niệm | Thoải hơn, trực quan |
| Truy vấn | HQL/JPQL, `@Query` | Query builder gọn (`.where().eq()`) |
| Hệ sinh thái | Khổng lồ (Spring Boot...) | Nhỏ hơn |
| Bảo mật | Tham số hóa mặc định | Tham số hóa mặc định |

Tóm lại: EBean **dễ học và viết nhanh** cho dự án vừa và nhỏ nhờ phong cách
Active Record. Nhưng trong thực tế công việc (đặc biệt với Spring Boot),
**Hibernate + Spring Data JPA vẫn phổ biến hơn rất nhiều** và có cộng đồng,
tài liệu lớn hơn. Người mới nên ưu tiên học Spring Data JPA trước, biết EBean
như một lựa chọn thay thế.

---

## Lỗi thường gặp

- **Quên kế thừa `Model`** → không có `save()`/`delete()` trên đối tượng.
- **Quên `@Id`** → EBean không biết khóa chính, báo lỗi.
- **Nhầm `findOne()` với `findList()`**: `findOne()` lấy đúng 1 kết quả (ném lỗi
  nếu có nhiều); `findList()` lấy danh sách. Chọn đúng theo nhu cầu.
- **Tự nối chuỗi trong điều kiện `where`** → dính SQL injection. Luôn dùng
  `.eq()`, `.like()` với tham số.
- **Quên cấu hình EBean** (file `ebean.properties` hoặc tích hợp build plugin) →
  app không chạy được.

---

## Tóm tắt

- **EBean** là ORM Java theo phong cách **Active Record**: đối tượng tự biết
  lưu/xóa chính nó (`user.save()`, `user.delete()`).
- Khai báo model kế thừa `io.ebean.Model`, dùng annotation JPA quen thuộc.
- Truy vấn bằng **`Finder`** và query builder: `find.byId()`,
  `find.query().where().eq(...)`, `.findOne()`, `.findList()`.
- **Luôn truyền tham số** qua `.eq()`, `.like()`... — EBean tham số hóa mặc định,
  chống SQL injection. KHÔNG nối chuỗi.
- So với Hibernate/Spring Data JPA: EBean **gọn và dễ học hơn**, nhưng **ít phổ
  biến hơn**. Thực tế nên ưu tiên Spring Data JPA.
