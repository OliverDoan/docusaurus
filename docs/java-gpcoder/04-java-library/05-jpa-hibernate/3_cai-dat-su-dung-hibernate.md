---
sidebar_position: 3
title: "Cài đặt và sử dụng Hibernate"
---

# Cài đặt và sử dụng Hibernate

## Thêm dependency vào dự án

### Dùng Maven

Thêm các dependency sau vào file `pom.xml`:

```xml
<dependencies>
    <!-- Hibernate Core - thư viện chính -->
    <dependency>
        <groupId>org.hibernate.orm</groupId>
        <artifactId>hibernate-core</artifactId>
        <version>6.4.4.Final</version>
    </dependency>

    <!-- Driver kết nối MySQL -->
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <version>8.3.0</version>
    </dependency>

    <!-- Connection Pool - quản lý pool kết nối database -->
    <dependency>
        <groupId>com.zaxxer</groupId>
        <artifactId>HikariCP</artifactId>
        <version>5.1.0</version>
    </dependency>
</dependencies>
```

### Dùng Gradle

```groovy
dependencies {
    implementation 'org.hibernate.orm:hibernate-core:6.4.4.Final'
    implementation 'com.mysql:mysql-connector-j:8.3.0'
    implementation 'com.zaxxer:HikariCP:5.1.0'
}
```

## Cấu hình Hibernate

Hibernate hỗ trợ hai cách cấu hình: file XML và Java code.

### Cách 1: File hibernate.cfg.xml

Tạo file `src/main/resources/hibernate.cfg.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE hibernate-configuration PUBLIC
        "-//Hibernate/Hibernate Configuration DTD 3.0//EN"
        "http://www.hibernate.org/dtd/hibernate-configuration-3.0.dtd">

<hibernate-configuration>
    <session-factory>
        <!-- Thông tin kết nối database -->
        <property name="hibernate.connection.driver_class">
            com.mysql.cj.jdbc.Driver
        </property>
        <property name="hibernate.connection.url">
            jdbc:mysql://localhost:3306/hibernate_demo?useSSL=false&amp;serverTimezone=UTC
        </property>
        <property name="hibernate.connection.username">root</property>
        <property name="hibernate.connection.password">secret</property>

        <!-- Dialect - phương ngữ SQL cho từng loại database -->
        <property name="hibernate.dialect">
            org.hibernate.dialect.MySQLDialect
        </property>

        <!-- Tự động tạo/cập nhật schema (cấu trúc bảng) -->
        <!-- Giá trị: create, create-drop, update, validate, none -->
        <property name="hibernate.hbm2ddl.auto">update</property>

        <!-- Hiển thị câu SQL được sinh ra trên console -->
        <property name="hibernate.show_sql">true</property>

        <!-- Format câu SQL cho dễ đọc -->
        <property name="hibernate.format_sql">true</property>

        <!-- Đăng ký các Entity class -->
        <mapping class="com.example.entity.NhanVien"/>
        <mapping class="com.example.entity.PhongBan"/>
    </session-factory>
</hibernate-configuration>
```

### Cách 2: Cấu hình bằng Java code (không cần file XML)

```java
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import java.util.Properties;

public class HibernateConfig {

    private static SessionFactory sessionFactory;

    public static SessionFactory getSessionFactory() {
        if (sessionFactory == null) {
            Properties props = new Properties();

            // Cấu hình kết nối
            props.setProperty("hibernate.connection.driver_class",
                    "com.mysql.cj.jdbc.Driver");
            props.setProperty("hibernate.connection.url",
                    "jdbc:mysql://localhost:3306/hibernate_demo");
            props.setProperty("hibernate.connection.username", "root");
            props.setProperty("hibernate.connection.password", "secret");

            // Cấu hình Hibernate
            props.setProperty("hibernate.dialect",
                    "org.hibernate.dialect.MySQLDialect");
            props.setProperty("hibernate.hbm2ddl.auto", "update");
            props.setProperty("hibernate.show_sql", "true");
            props.setProperty("hibernate.format_sql", "true");

            sessionFactory = new Configuration()
                    .setProperties(props)
                    .addAnnotatedClass(NhanVien.class)
                    .addAnnotatedClass(PhongBan.class)
                    .buildSessionFactory();
        }
        return sessionFactory;
    }
}
```

## Tạo Entity class

```java
package com.example.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "nhan_vien")
public class NhanVien {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ho_ten", nullable = false, length = 100)
    private String hoTen;

    @Column(name = "email", unique = true)
    private String email;

    @Column(name = "luong")
    private Double luong;

    public NhanVien() {}

    public NhanVien(String hoTen, String email, Double luong) {
        this.hoTen = hoTen;
        this.email = email;
        this.luong = luong;
    }

    // Getters và setters
    public Long getId() { return id; }
    public String getHoTen() { return hoTen; }
    public void setHoTen(String hoTen) { this.hoTen = hoTen; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Double getLuong() { return luong; }
    public void setLuong(Double luong) { this.luong = luong; }
}
```

## Thực hiện các thao tác CRUD cơ bản

```java
import org.hibernate.Session;
import org.hibernate.SessionFactory;

public class NhanVienDAO {

    private SessionFactory sf = HibernateConfig.getSessionFactory();

    // CREATE - Thêm mới
    public void them(NhanVien nv) {
        try (Session session = sf.openSession()) {
            session.beginTransaction();
            session.persist(nv);
            session.getTransaction().commit();
            System.out.println("Đã thêm nhân viên: " + nv.getHoTen());
        }
    }

    // READ - Đọc theo ID
    public NhanVien timTheoId(Long id) {
        try (Session session = sf.openSession()) {
            // find() trả về null nếu không tìm thấy (khác get() trong Hibernate cũ)
            return session.find(NhanVien.class, id);
        }
    }

    // UPDATE - Cập nhật
    public void capNhat(NhanVien nv) {
        try (Session session = sf.openSession()) {
            session.beginTransaction();
            // merge() dùng để cập nhật entity đã tách khỏi session (detached entity)
            session.merge(nv);
            session.getTransaction().commit();
        }
    }

    // DELETE - Xóa
    public void xoa(Long id) {
        try (Session session = sf.openSession()) {
            session.beginTransaction();
            NhanVien nv = session.find(NhanVien.class, id);
            if (nv != null) {
                session.remove(nv);
                System.out.println("Đã xóa nhân viên ID: " + id);
            }
            session.getTransaction().commit();
        }
    }
}
```

## Chạy thử chương trình

```java
public class Main {
    public static void main(String[] args) {
        NhanVienDAO dao = new NhanVienDAO();

        // Thêm nhân viên mới
        NhanVien nv1 = new NhanVien("Nguyen Van A", "vana@cty.com", 15000000.0);
        dao.them(nv1);

        // Đọc nhân viên theo ID
        NhanVien timThay = dao.timTheoId(1L);
        if (timThay != null) {
            System.out.println("Tìm thấy: " + timThay.getHoTen());
        }

        // Cập nhật lương
        timThay.setLuong(18000000.0);
        dao.capNhat(timThay);

        // Xóa nhân viên
        dao.xoa(1L);
    }
}
```

## Các giá trị của hibernate.hbm2ddl.auto

| Giá trị | Mô tả | Dùng khi nào |
|---------|-------|--------------|
| `create` | Xóa schema cũ, tạo mới mỗi lần chạy | Phát triển ban đầu |
| `create-drop` | Tạo khi khởi động, xóa khi tắt | Testing tự động |
| `update` | Cập nhật schema nếu có thay đổi | Phát triển thường ngày |
| `validate` | Kiểm tra schema khớp với entity, không thay đổi | Môi trường production |
| `none` | Không làm gì với schema | Khi tự quản lý migration |

> **Cảnh báo**: Không dùng `create` hay `create-drop` ở môi trường production vì sẽ mất toàn bộ dữ liệu!

## Tóm tắt

- Thêm dependency `hibernate-core` và driver database vào Maven/Gradle.
- Cấu hình qua file `hibernate.cfg.xml` hoặc Java code.
- `SessionFactory` tạo một lần, `Session` tạo mỗi khi cần thao tác.
- Dùng `persist()`, `find()`, `merge()`, `remove()` cho các thao tác CRUD.
- Chọn `hbm2ddl.auto=validate` cho môi trường production.
