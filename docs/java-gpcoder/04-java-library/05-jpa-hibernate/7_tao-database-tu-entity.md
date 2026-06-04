---
sidebar_position: 7
title: "Tạo database table tự động từ Hibernate Entity"
---

# Tạo database table tự động từ Hibernate Entity

## Giới thiệu

**Code-first** (ưu tiên code) là cách tiếp cận ngược lại với database-first: bạn viết Entity class trước, sau đó để Hibernate tự động tạo cấu trúc bảng (schema) trong database. Cách này giúp lập trình viên tập trung vào mô hình domain (tầng nghiệp vụ) mà không cần viết SQL DDL thủ công.

**DDL** (Data Definition Language — ngôn ngữ định nghĩa dữ liệu) là tập lệnh SQL dùng để tạo, sửa, xóa cấu trúc bảng như `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE`.

## Cấu hình hibernate.hbm2ddl.auto

Thuộc tính `hibernate.hbm2ddl.auto` kiểm soát hành vi tự động quản lý schema:

```xml
<!-- Trong hibernate.cfg.xml -->
<property name="hibernate.hbm2ddl.auto">update</property>

<!-- Hoặc trong persistence.xml -->
<property name="jakarta.persistence.schema-generation.database.action" value="create"/>
```

### Giải thích từng giá trị

| Giá trị | Khi khởi động | Khi tắt | Dùng khi nào |
|---------|--------------|---------|--------------|
| `create` | Xóa schema cũ, tạo mới | Không làm gì | Phát triển ban đầu |
| `create-drop` | Xóa schema cũ, tạo mới | Xóa schema | Chạy test tự động |
| `update` | Cập nhật schema nếu thay đổi | Không làm gì | Phát triển thường ngày |
| `validate` | Kiểm tra schema, báo lỗi nếu sai | Không làm gì | Môi trường production |
| `none` | Không làm gì | Không làm gì | Tự quản lý schema |

## Ví dụ thực tế

### Định nghĩa các Entity

```java
package com.example.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// Entity PhongBan - sẽ tạo bảng phong_ban
@Entity
@Table(name = "phong_ban",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_ma_phong_ban",
        columnNames = "ma_phong_ban"
    )
)
public class PhongBan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_phong_ban", length = 20, nullable = false)
    private String maPhongBan;

    @Column(name = "ten_phong_ban", length = 100, nullable = false)
    private String tenPhongBan;

    @OneToMany(mappedBy = "phongBan", cascade = CascadeType.ALL)
    private List<NhanVien> danhSachNhanVien = new ArrayList<>();

    public PhongBan() {}

    public Long getId() { return id; }
    public String getMaPhongBan() { return maPhongBan; }
    public void setMaPhongBan(String maPhongBan) { this.maPhongBan = maPhongBan; }
    public String getTenPhongBan() { return tenPhongBan; }
    public void setTenPhongBan(String tenPhongBan) { this.tenPhongBan = tenPhongBan; }
    public List<NhanVien> getDanhSachNhanVien() { return danhSachNhanVien; }
}
```

```java
// Entity NhanVien - sẽ tạo bảng nhan_vien với khóa ngoại sang phong_ban
@Entity
@Table(name = "nhan_vien",
    indexes = {
        @Index(name = "idx_email", columnList = "email"),
        @Index(name = "idx_phong_ban", columnList = "phong_ban_id")
    }
)
public class NhanVien {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ho_ten", nullable = false, length = 100)
    private String hoTen;

    @Column(name = "email", unique = true, length = 150)
    private String email;

    @Column(name = "luong", precision = 15, scale = 2)
    private BigDecimal luong;

    // Enum lưu theo chuỗi để dễ đọc trong database
    @Enumerated(EnumType.STRING)
    @Column(name = "chuc_vu", length = 30)
    private ChucVu chucVu;

    @Column(name = "ngay_tao", updatable = false)
    private LocalDateTime ngayTao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phong_ban_id", foreignKey = @ForeignKey(name = "fk_nv_phong_ban"))
    private PhongBan phongBan;

    public enum ChucVu {
        NHAN_VIEN, TRUONG_PHONG, GIAM_DOC
    }

    @PrePersist
    public void truocKhiLuu() {
        this.ngayTao = LocalDateTime.now();
    }

    public NhanVien() {}

    public Long getId() { return id; }
    public String getHoTen() { return hoTen; }
    public void setHoTen(String hoTen) { this.hoTen = hoTen; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public BigDecimal getLuong() { return luong; }
    public void setLuong(BigDecimal luong) { this.luong = luong; }
    public ChucVu getChucVu() { return chucVu; }
    public void setChucVu(ChucVu chucVu) { this.chucVu = chucVu; }
    public PhongBan getPhongBan() { return phongBan; }
    public void setPhongBan(PhongBan phongBan) { this.phongBan = phongBan; }
    public LocalDateTime getNgayTao() { return ngayTao; }
}
```

### Khởi động và xem Hibernate tạo bảng

```java
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;

public class SchemaGenerationDemo {

    public static void main(String[] args) {
        // Dùng "create" để tạo mới bảng mỗi lần chạy
        SessionFactory sf = new Configuration()
                .configure("hibernate.cfg.xml")
                .addAnnotatedClass(PhongBan.class)
                .addAnnotatedClass(NhanVien.class)
                .buildSessionFactory();

        System.out.println("SessionFactory đã được tạo thành công!");
        System.out.println("Kiểm tra database để xem các bảng vừa được tạo.");

        sf.close();
    }
}
```

Hibernate sẽ in ra SQL DDL được tạo:

```sql
create table phong_ban (
    id bigint not null auto_increment,
    ma_phong_ban varchar(20) not null,
    ten_phong_ban varchar(100) not null,
    primary key (id),
    constraint uk_ma_phong_ban unique (ma_phong_ban)
) engine=InnoDB

create table nhan_vien (
    id bigint not null auto_increment,
    ho_ten varchar(100) not null,
    email varchar(150),
    luong decimal(15,2),
    chuc_vu varchar(30),
    ngay_tao datetime(6),
    phong_ban_id bigint,
    primary key (id),
    constraint uk_email unique (email),
    constraint fk_nv_phong_ban
        foreign key (phong_ban_id) references phong_ban (id)
) engine=InnoDB

create index idx_email on nhan_vien (email)
create index idx_phong_ban on nhan_vien (phong_ban_id)
```

## Xuất DDL ra file (không thực thi trực tiếp)

Dùng cách này để kiểm tra SQL trước khi thực thi, hoặc cho DBA (Database Administrator — quản trị viên cơ sở dữ liệu) xem xét:

```java
import org.hibernate.boot.Metadata;
import org.hibernate.boot.MetadataSources;
import org.hibernate.boot.registry.StandardServiceRegistry;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.hibernate.tool.hbm2ddl.SchemaExport;
import org.hibernate.tool.schema.TargetType;

import java.util.EnumSet;

public class XuatDDL {

    public static void main(String[] args) {
        StandardServiceRegistry registry = new StandardServiceRegistryBuilder()
                .configure("hibernate.cfg.xml")
                .build();

        MetadataSources sources = new MetadataSources(registry);
        sources.addAnnotatedClass(PhongBan.class);
        sources.addAnnotatedClass(NhanVien.class);

        Metadata metadata = sources.buildMetadata();

        SchemaExport schemaExport = new SchemaExport();
        schemaExport.setOutputFile("schema.sql");   // Xuất ra file
        schemaExport.setFormat(true);               // Format đẹp
        schemaExport.setDelimiter(";");             // Phân cách câu lệnh

        // Chỉ xuất ra file, không thực thi vào database
        schemaExport.createOnly(
            EnumSet.of(TargetType.SCRIPT),   // Chỉ xuất script
            metadata
        );

        System.out.println("Đã xuất DDL ra file schema.sql");
        StandardServiceRegistryBuilder.destroy(registry);
    }
}
```

## Sử dụng Flyway cho production

Trong môi trường production, **không nên** dùng `hbm2ddl.auto` mà thay bằng **Flyway** hoặc **Liquibase** — các công cụ **database migration** (di chuyển/nâng cấp cấu trúc database):

```xml
<!-- Thêm Flyway vào pom.xml -->
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
    <version>10.11.0</version>
</dependency>
```

```sql
-- src/main/resources/db/migration/V1__Create_phong_ban.sql
CREATE TABLE phong_ban (
    id BIGINT NOT NULL AUTO_INCREMENT,
    ma_phong_ban VARCHAR(20) NOT NULL,
    ten_phong_ban VARCHAR(100) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_ma_phong_ban UNIQUE (ma_phong_ban)
);

-- src/main/resources/db/migration/V2__Create_nhan_vien.sql
CREATE TABLE nhan_vien (
    id BIGINT NOT NULL AUTO_INCREMENT,
    ho_ten VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    ...
);
```

## Tóm tắt

- **Code-first**: Viết Entity trước, Hibernate tự tạo bảng — tiện lợi cho giai đoạn phát triển.
- `hbm2ddl.auto=update` dùng cho development, `validate` dùng cho production.
- Dùng `@ForeignKey(name=...)` và `@Index` để đặt tên rõ ràng cho các ràng buộc.
- Trong production, dùng **Flyway** hoặc **Liquibase** thay vì `hbm2ddl.auto` để kiểm soát migration chặt chẽ hơn.
