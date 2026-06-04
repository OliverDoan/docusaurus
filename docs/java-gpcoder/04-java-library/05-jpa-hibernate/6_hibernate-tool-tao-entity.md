---
sidebar_position: 6
title: "Sử dụng Hibernate Tool tạo Entity tự động từ table"
---

# Sử dụng Hibernate Tool tạo Entity tự động từ table

## Giới thiệu

**Reverse Engineering** (kỹ thuật đảo ngược) trong Hibernate cho phép tự động tạo các **Entity class** từ cấu trúc bảng database sẵn có. Đây là cách tiếp cận **database-first** (ưu tiên database), ngược lại với **code-first** (ưu tiên code).

Cách này rất hữu ích khi:
- Làm việc với database cũ (legacy database) đã có sẵn.
- Muốn tiết kiệm thời gian tạo entity thủ công cho database có nhiều bảng.
- Cần đảm bảo entity khớp chính xác với cấu trúc bảng hiện có.

## Phương pháp 1: Dùng IntelliJ IDEA (JPA Tools)

IntelliJ IDEA Ultimate tích hợp sẵn tính năng tạo Entity từ database.

### Bước 1: Kết nối Database trong IntelliJ

1. Mở **Database** panel (View → Tool Windows → Database).
2. Nhấn `+` → Data Source → chọn loại database (MySQL, PostgreSQL...).
3. Nhập thông tin kết nối và nhấn **Test Connection**.

### Bước 2: Tạo Entity từ table

1. Nhấn chuột phải vào bảng trong Database panel.
2. Chọn **Scripted Extensions → Generate POJOs.clj**.

Hoặc dùng **Persistence** panel:
1. View → Tool Windows → Persistence.
2. Nhấn chuột phải vào persistence unit → **Generate Persistence Mapping** → **By Database Schema**.
3. Chọn các bảng cần tạo Entity và cấu hình package đích.

## Phương pháp 2: Dùng Plugin Hibernate Tools cho Maven

### Thêm plugin vào pom.xml

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.hibernate.tool</groupId>
            <artifactId>hibernate-tools-maven</artifactId>
            <version>6.5.1.Final</version>
            <executions>
                <execution>
                    <id>generate-entities</id>
                    <goals>
                        <!-- Mục tiêu: tạo source code từ database -->
                        <goal>hbm2java</goal>
                    </goals>
                    <configuration>
                        <!-- Thư mục đầu ra của các class được tạo -->
                        <outputDirectory>
                            ${project.build.directory}/generated-sources/hibernate
                        </outputDirectory>
                    </configuration>
                </execution>
            </executions>
            <configuration>
                <!-- File cấu hình kết nối database để reverse engineer -->
                <revengFile>src/main/resources/hibernate.reveng.xml</revengFile>
                <packageName>com.example.entity</packageName>
                <detectManyToMany>true</detectManyToMany>
                <detectOptimisticLock>true</detectOptimisticLock>
            </configuration>
            <dependencies>
                <dependency>
                    <groupId>com.mysql</groupId>
                    <artifactId>mysql-connector-j</artifactId>
                    <version>8.3.0</version>
                </dependency>
            </dependencies>
        </plugin>
    </plugins>
</build>
```

### File hibernate.reveng.xml

**`hibernate.reveng.xml`** là file điều khiển quá trình reverse engineering, chỉ định bảng nào cần tạo Entity:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE hibernate-reverse-engineering PUBLIC
    "-//Hibernate/Hibernate Reverse Engineering DTD 3.0//EN"
    "http://hibernate.org/dtd/hibernate-reverse-engineering-3.0.dtd">

<hibernate-reverse-engineering>

    <!-- Chỉ định schema làm việc (cho MySQL là tên database) -->
    <schema-selection match-catalog="my_database"/>

    <!-- Bảng nào cần tạo Entity -->
    <table-filter match-name="nhan_vien"/>
    <table-filter match-name="phong_ban"/>
    <table-filter match-name="du_an"/>

    <!-- Có thể dùng regex để match nhiều bảng cùng lúc -->
    <!-- <table-filter match-name=".*"/> sẽ tạo Entity cho tất cả bảng -->

    <!-- Tùy chỉnh tên class và tên package cho từng bảng -->
    <table name="nhan_vien" class="NhanVien">
        <primary-key>
            <!-- Chỉ định chiến lược sinh khóa cho cột id -->
            <generator class="identity"/>
        </primary-key>
    </table>

</hibernate-reverse-engineering>
```

### Chạy lệnh tạo Entity

```bash
mvn hibernate-tools:hbm2java
```

## Ví dụ: Entity được tạo tự động

Giả sử database có bảng `nhan_vien` với cấu trúc:

```sql
CREATE TABLE nhan_vien (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    ho_ten     VARCHAR(100) NOT NULL,
    email      VARCHAR(150) UNIQUE,
    luong      DECIMAL(15,2),
    ngay_vao   DATE,
    phong_ban_id BIGINT,
    FOREIGN KEY (phong_ban_id) REFERENCES phong_ban(id)
);
```

Hibernate Tools sẽ tạo ra Entity tương tự như sau:

```java
package com.example.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "nhan_vien", catalog = "my_database")
public class NhanVien implements java.io.Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", unique = true, nullable = false)
    private Long id;

    @Column(name = "ho_ten", nullable = false, length = 100)
    private String hoTen;

    @Column(name = "email", unique = true, length = 150)
    private String email;

    @Column(name = "luong", precision = 15, scale = 2)
    private BigDecimal luong;

    @Column(name = "ngay_vao")
    private LocalDate ngayVao;

    // Quan hệ ManyToOne với PhongBan được phát hiện từ FOREIGN KEY
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phong_ban_id")
    private PhongBan phongBan;

    // Constructor mặc định - bắt buộc với Hibernate
    public NhanVien() {}

    // Getters và setters được tạo tự động
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getHoTen() { return hoTen; }
    public void setHoTen(String hoTen) { this.hoTen = hoTen; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public BigDecimal getLuong() { return luong; }
    public void setLuong(BigDecimal luong) { this.luong = luong; }
    public LocalDate getNgayVao() { return ngayVao; }
    public void setNgayVao(LocalDate ngayVao) { this.ngayVao = ngayVao; }
    public PhongBan getPhongBan() { return phongBan; }
    public void setPhongBan(PhongBan phongBan) { this.phongBan = phongBan; }
}
```

## Phương pháp 3: Dùng Lombok để rút gọn code Entity

Sau khi tạo Entity, bạn có thể tích hợp **Lombok** (thư viện tạo tự động getters/setters/constructors) để rút gọn code:

```java
package com.example.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "nhan_vien")
@Getter              // Tự động tạo tất cả getters
@Setter              // Tự động tạo tất cả setters
@NoArgsConstructor   // Tạo constructor không tham số (bắt buộc với JPA)
@AllArgsConstructor  // Tạo constructor với tất cả tham số
@ToString(exclude = "phongBan")   // toString(), loại bỏ phongBan để tránh vòng lặp vô hạn
public class NhanVien {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ho_ten", nullable = false, length = 100)
    private String hoTen;

    @Column(unique = true, length = 150)
    private String email;

    @Column(precision = 15, scale = 2)
    private BigDecimal luong;

    private LocalDate ngayVao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phong_ban_id")
    private PhongBan phongBan;
}
```

## Những điểm cần kiểm tra sau khi tạo tự động

Dù Entity được tạo tự động, bạn cần kiểm tra và chỉnh sửa thêm:

1. **FetchType**: Mặc định `@ManyToOne` là `EAGER`, nên đổi thành `LAZY` để tránh tải dữ liệu thừa.
2. **CascadeType**: Thêm `cascade` phù hợp nếu cần.
3. **Tên field**: Đổi tên từ `snake_case` sang `camelCase` cho đúng chuẩn Java.
4. **Kiểu dữ liệu**: Kiểm tra xem kiểu Java có phù hợp không (ví dụ dùng `BigDecimal` thay `Double` cho tiền tệ).
5. **Validation**: Thêm `@NotNull`, `@Size` từ Jakarta Validation nếu cần.

## Tóm tắt

- **Database-first**: Tạo Entity từ bảng database sẵn có - tiết kiệm thời gian với database lớn.
- IntelliJ IDEA Ultimate tích hợp sẵn tính năng này qua **Persistence** panel.
- Dùng **Hibernate Tools Maven Plugin** và file `hibernate.reveng.xml` để tự động hóa trong pipeline.
- Luôn kiểm tra và tinh chỉnh Entity được tạo tự động, đặc biệt là `FetchType` và `CascadeType`.
