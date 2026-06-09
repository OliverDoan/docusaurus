---
sidebar_position: 2
title: "Giới thiệu về Hibernate"
---

# Giới thiệu về Hibernate

Hibernate là framework ORM phổ biến nhất trong thế giới Java, giúp bạn làm việc với database bằng các đối tượng Java thay vì phải viết tay nhiều câu SQL. Nó giải quyết sự khác biệt giữa mô hình hướng đối tượng và mô hình bảng quan hệ, nhờ đó code gọn hơn và dễ bảo trì hơn. Bài này giới thiệu tổng quan về Hibernate, kiến trúc và một ví dụ đơn giản; phần chi tiết nằm bên dưới.

## Hibernate là gì?

**Hibernate** là một framework **ORM** (Object-Relational Mapping — kỹ thuật ánh xạ đối tượng Java với bảng trong cơ sở dữ liệu quan hệ) mã nguồn mở và phổ biến nhất trong hệ sinh thái Java. Hibernate triển khai đặc tả **JPA** (Java Persistence API) và bổ sung thêm nhiều tính năng nâng cao riêng.

Hibernate được phát triển bởi Gavin King từ năm 2001, hiện nay do Red Hat (JBoss) duy trì và liên tục cập nhật.

## Hibernate làm được gì?

Hibernate giải quyết vấn đề **impedance mismatch** (sự không tương đồng giữa mô hình hướng đối tượng trong Java và mô hình quan hệ của database):

| Thế giới Java (OOP) | Thế giới Database (Relational) |
|---------------------|-------------------------------|
| Class | Bảng (Table) |
| Object (instance) | Hàng (Row) |
| Thuộc tính (field) | Cột (Column) |
| Quan hệ giữa objects | Khóa ngoại (Foreign Key) |
| Kế thừa (Inheritance) | Không có tương đương trực tiếp |

## Kiến trúc của Hibernate

```
Ứng dụng Java
     |
     v
[Hibernate API] ← Configuration (hibernate.cfg.xml / annotation)
     |
     v
[Session Factory]  ← Được tạo một lần khi ứng dụng khởi động
     |
     v
[Session]          ← Tương đương với EntityManager trong JPA
     |
     v
[JDBC / Connection Pool]
     |
     v
[Database: MySQL, PostgreSQL, Oracle, ...]
```

### Các thành phần chính

- **Configuration** (cấu hình): Đọc file `hibernate.cfg.xml` hoặc các annotation để biết cách kết nối và ánh xạ.
- **SessionFactory** (nhà máy tạo Session): Đối tượng nặng (heavy-weight), chỉ tạo một lần. Tương đương với `EntityManagerFactory` trong JPA.
- **Session** (phiên): Đối tượng nhẹ (light-weight), tạo mới cho mỗi tác vụ. Tương đương với `EntityManager` trong JPA.
- **Transaction** (giao dịch): Đảm bảo tính toàn vẹn dữ liệu khi thực hiện nhiều thao tác.
- **Query** (truy vấn): Hỗ trợ **HQL** (Hibernate Query Language) và SQL thuần túy.

## Ví dụ đơn giản với Hibernate

### Định nghĩa Entity

```java
import org.hibernate.annotations.*;
import jakarta.persistence.*;

@Entity
@Table(name = "san_pham")   // Ánh xạ tới bảng san_pham trong database
public class SanPham {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ten_san_pham", nullable = false)
    private String ten;

    @Column(name = "gia")
    private Double gia;

    // Constructor mặc định - bắt buộc với Hibernate
    public SanPham() {}

    public SanPham(String ten, Double gia) {
        this.ten = ten;
        this.gia = gia;
    }

    // Getters và setters
    public Long getId() { return id; }
    public String getTen() { return ten; }
    public void setTen(String ten) { this.ten = ten; }
    public Double getGia() { return gia; }
    public void setGia(Double gia) { this.gia = gia; }

    @Override
    public String toString() {
        return "SanPham{id=" + id + ", ten='" + ten + "', gia=" + gia + "}";
    }
}
```

### Sử dụng Session để thao tác dữ liệu

```java
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;

public class HibernateDemo {

    public static void main(String[] args) {
        // Bước 1: Tạo SessionFactory từ file cấu hình
        SessionFactory sessionFactory = new Configuration()
                .configure("hibernate.cfg.xml")   // Đọc file cấu hình
                .addAnnotatedClass(SanPham.class)  // Đăng ký Entity
                .buildSessionFactory();

        // Bước 2: Mở Session
        Session session = sessionFactory.openSession();

        try {
            // Bước 3: Bắt đầu Transaction
            session.beginTransaction();

            // Bước 4: Thao tác với dữ liệu
            SanPham sp = new SanPham("Laptop Dell XPS", 25000000.0);
            session.persist(sp);   // Lưu vào database

            // Bước 5: Commit để xác nhận
            session.getTransaction().commit();

            System.out.println("Đã lưu: " + sp);

        } catch (Exception e) {
            // Rollback nếu có lỗi (hoàn tác các thao tác chưa commit)
            session.getTransaction().rollback();
            e.printStackTrace();
        } finally {
            // Bước 6: Đóng session
            session.close();
        }

        sessionFactory.close();
    }
}
```

## So sánh Hibernate API và JPA API

| Tính năng | JPA (chuẩn) | Hibernate (riêng) |
|-----------|-------------|-------------------|
| Quản lý session | `EntityManager` | `Session` |
| Tạo factory | `EntityManagerFactory` | `SessionFactory` |
| Lưu đối tượng | `em.persist()` | `session.save()` / `session.persist()` |
| Đọc theo ID | `em.find()` | `session.get()` |
| Xóa | `em.remove()` | `session.delete()` |
| Ngôn ngữ truy vấn | JPQL | HQL |
| Caching | Có (cơ bản) | L1 + L2 Cache mạnh mẽ |

> **Lưu ý**: Nên ưu tiên dùng **JPA API** (`EntityManager`, `persist()`, `find()`...) thay vì Hibernate API thuần túy để code dễ di chuyển sang provider khác nếu cần.

## Ưu điểm của Hibernate

- **Năng suất cao**: Giảm đáng kể lượng code JDBC lặp lại.
- **Độc lập database**: Dễ dàng chuyển từ MySQL sang PostgreSQL chỉ bằng cách đổi cấu hình.
- **Caching tích hợp**: Tăng hiệu năng với L1 cache và L2 cache.
- **Lazy Loading**: Chỉ tải dữ liệu khi thực sự cần, tiết kiệm tài nguyên.
- **Cộng đồng lớn**: Tài liệu phong phú, nhiều ví dụ thực tế.

## Nhược điểm cần lưu ý

- **Đường cong học tập** (learning curve) khá dốc với người mới.
- Dễ gặp vấn đề **N+1 query** nếu không cấu hình đúng `FetchType`.
- Debug đôi khi khó vì SQL được sinh tự động.
- Hiệu năng kém hơn JDBC thuần túy cho các truy vấn phức tạp hoặc batch lớn.

## Tóm tắt

- Hibernate là **ORM framework** phổ biến nhất cho Java, triển khai đặc tả JPA.
- Ba thành phần cốt lõi: `Configuration` → `SessionFactory` → `Session`.
- Nên dùng **JPA API** thay vì Hibernate API thuần để code linh hoạt hơn.
- Hibernate phù hợp với ứng dụng doanh nghiệp (enterprise) vừa và lớn cần ORM mạnh mẽ.
