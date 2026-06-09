---
sidebar_position: 9
title: "Hibernate Query Language (HQL)"
---

# Hibernate Query Language (HQL)

HQL là ngôn ngữ truy vấn của Hibernate, nhìn rất giống SQL nhưng làm việc với tên class và tên field Java thay vì tên bảng và tên cột. Nhờ đó bạn viết truy vấn theo tư duy hướng đối tượng, độc lập với loại database đang dùng. Bài này giới thiệu cú pháp HQL cơ bản, các mệnh đề như JOIN, GROUP BY, subquery, bulk update/delete và Named Query.

## HQL là gì?

**HQL** (Hibernate Query Language — ngôn ngữ truy vấn của Hibernate) là ngôn ngữ truy vấn hướng đối tượng của Hibernate. HQL tương tự SQL nhưng thao tác với **tên class và tên field Java** thay vì tên bảng và tên cột database.

**JPQL** (Java Persistence Query Language — ngôn ngữ truy vấn chuẩn JPA) là phiên bản chuẩn hóa của HQL, được hỗ trợ bởi mọi JPA provider. HQL là superset (tập cha) của JPQL — mọi JPQL đều là HQL hợp lệ, nhưng không ngược lại.

## Cú pháp cơ bản

### SELECT tất cả entity

```java
import org.hibernate.Session;
import java.util.List;

public class HQLDemo {

    public static void demoSelect(Session session) {
        // Lấy tất cả NhanVien (không cần SELECT *, chỉ cần FROM)
        List<NhanVien> danhSach = session
            .createQuery("FROM NhanVien", NhanVien.class)
            .list();

        // Tương đương SQL: SELECT * FROM nhan_vien
        danhSach.forEach(nv ->
            System.out.println(nv.getHoTen() + " - " + nv.getEmail())
        );
    }
}
```

### WHERE với tham số

```java
// Tham số đặt tên (named parameter) - khuyến khích dùng
NhanVien nv = session
    .createQuery("FROM NhanVien WHERE email = :email", NhanVien.class)
    .setParameter("email", "vana@cty.com")
    .uniqueResult();

// Tham số vị trí (positional parameter) - ít dùng hơn
NhanVien nv2 = session
    .createQuery("FROM NhanVien WHERE email = ?1", NhanVien.class)
    .setParameter(1, "vana@cty.com")
    .uniqueResult();
```

### ORDER BY, LIMIT, OFFSET

```java
// Sắp xếp và phân trang (pagination)
List<NhanVien> trang1 = session
    .createQuery("FROM NhanVien ORDER BY hoTen ASC", NhanVien.class)
    .setFirstResult(0)    // Bỏ qua 0 bản ghi (trang đầu tiên)
    .setMaxResults(10)    // Lấy tối đa 10 bản ghi
    .list();

// Trang 2: bỏ qua 10 bản ghi đầu, lấy 10 bản ghi tiếp theo
List<NhanVien> trang2 = session
    .createQuery("FROM NhanVien ORDER BY hoTen ASC", NhanVien.class)
    .setFirstResult(10)
    .setMaxResults(10)
    .list();
```

## Các mệnh đề HQL

### SELECT chọn field cụ thể

```java
// Chọn chỉ một số field - trả về Object[]
List<Object[]> ketQua = session
    .createQuery("SELECT nv.hoTen, nv.luong FROM NhanVien nv WHERE nv.luong > :luong")
    .setParameter("luong", 10000000.0)
    .list();

for (Object[] row : ketQua) {
    System.out.println("Tên: " + row[0] + ", Lương: " + row[1]);
}
```

### Dùng Constructor trong SELECT

```java
// DTO (Data Transfer Object - đối tượng truyền dữ liệu): class chứa dữ liệu trả về
public class NhanVienDTO {
    private String hoTen;
    private Double luong;

    public NhanVienDTO(String hoTen, Double luong) {
        this.hoTen = hoTen;
        this.luong = luong;
    }
    // Getters...
    public String getHoTen() { return hoTen; }
    public Double getLuong() { return luong; }
}

// Dùng new ClassName() trong HQL để tạo DTO trực tiếp
List<NhanVienDTO> dtoList = session
    .createQuery(
        "SELECT new com.example.dto.NhanVienDTO(nv.hoTen, nv.luong) " +
        "FROM NhanVien nv WHERE nv.luong > :luong",
        NhanVienDTO.class)
    .setParameter("luong", 10000000.0)
    .list();

dtoList.forEach(dto ->
    System.out.println(dto.getHoTen() + ": " + dto.getLuong())
);
```

### JOIN - Truy vấn liên bảng

```java
// INNER JOIN: chỉ lấy NhanVien có PhongBan
List<NhanVien> nvCoPhongBan = session
    .createQuery(
        "SELECT nv FROM NhanVien nv JOIN nv.phongBan pb WHERE pb.tenPhongBan = :ten",
        NhanVien.class)
    .setParameter("ten", "Phòng IT")
    .list();

// JOIN FETCH: tải luôn cả PhongBan trong một query (tránh N+1 problem)
List<NhanVien> nvVoiPhongBan = session
    .createQuery(
        "SELECT nv FROM NhanVien nv JOIN FETCH nv.phongBan",
        NhanVien.class)
    .list();

// LEFT JOIN: lấy cả NhanVien chưa có PhongBan
List<NhanVien> tatCaNv = session
    .createQuery(
        "SELECT nv FROM NhanVien nv LEFT JOIN nv.phongBan pb",
        NhanVien.class)
    .list();
```

### GROUP BY và Aggregate Functions

**Aggregate Function** (hàm tổng hợp) là các hàm tính toán trên một nhóm bản ghi như `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`.

```java
// Đếm nhân viên theo phòng ban
List<Object[]> thongKe = session
    .createQuery(
        "SELECT pb.tenPhongBan, COUNT(nv) " +
        "FROM NhanVien nv JOIN nv.phongBan pb " +
        "GROUP BY pb.tenPhongBan " +
        "ORDER BY COUNT(nv) DESC")
    .list();

for (Object[] row : thongKe) {
    System.out.println("Phòng: " + row[0] + " - Số NV: " + row[1]);
}

// Tính lương trung bình theo phòng ban, chỉ lấy phòng có > 5 nhân viên
List<Object[]> luongTB = session
    .createQuery(
        "SELECT pb.tenPhongBan, AVG(nv.luong), MAX(nv.luong) " +
        "FROM NhanVien nv JOIN nv.phongBan pb " +
        "GROUP BY pb.tenPhongBan " +
        "HAVING COUNT(nv) > 5")
    .list();
```

### Subquery - Truy vấn con

```java
// Tìm nhân viên có lương cao hơn lương trung bình
List<NhanVien> luongCaoBTB = session
    .createQuery(
        "FROM NhanVien nv WHERE nv.luong > " +
        "(SELECT AVG(nv2.luong) FROM NhanVien nv2)",
        NhanVien.class)
    .list();

// Tìm phòng ban có nhân viên
List<PhongBan> pbCoNV = session
    .createQuery(
        "FROM PhongBan pb WHERE EXISTS " +
        "(SELECT nv FROM NhanVien nv WHERE nv.phongBan = pb)",
        PhongBan.class)
    .list();
```

## UPDATE và DELETE bằng HQL

**Bulk operation** (thao tác hàng loạt) cho phép cập nhật hoặc xóa nhiều bản ghi cùng lúc mà không cần load từng entity vào memory:

```java
// Cập nhật lương hàng loạt
int soHangCapNhat = session
    .createMutationQuery(
        "UPDATE NhanVien SET luong = luong * 1.1 " +
        "WHERE phongBan.id = :pbId")
    .setParameter("pbId", 1L)
    .executeUpdate();

System.out.println("Đã tăng lương " + soHangCapNhat + " nhân viên");

// Xóa hàng loạt
int soHangXoa = session
    .createMutationQuery(
        "DELETE FROM NhanVien WHERE luong < :luongMin")
    .setParameter("luongMin", 5000000.0)
    .executeUpdate();
```

## Named Query - Truy vấn đặt tên

**Named Query** (truy vấn có tên) được định nghĩa trên class Entity và được compile một lần khi khởi động, giúp cải thiện hiệu năng và tổ chức code:

```java
@Entity
@NamedQuery(
    name = "NhanVien.findByPhongBan",
    query = "FROM NhanVien nv WHERE nv.phongBan.id = :pbId ORDER BY nv.hoTen"
)
@NamedQuery(
    name = "NhanVien.findByLuongRange",
    query = "FROM NhanVien nv WHERE nv.luong BETWEEN :min AND :max"
)
public class NhanVien {
    // ... fields và methods
}

// Sử dụng Named Query
List<NhanVien> nvTrongPB = session
    .createNamedQuery("NhanVien.findByPhongBan", NhanVien.class)
    .setParameter("pbId", 2L)
    .list();
```

## Tóm tắt

- HQL thao tác với **tên class Java** và **tên field** thay vì tên bảng/cột.
- Luôn dùng **named parameter** (`:tenThamSo`) để an toàn và dễ đọc.
- `JOIN FETCH` giải quyết vấn đề **N+1 query** khi cần load cả entity liên quan.
- Dùng **bulk update/delete** (`createMutationQuery`) thay vì load từng entity khi xử lý hàng loạt.
- **Named Query** giúp tập trung quản lý query và cải thiện hiệu năng.
