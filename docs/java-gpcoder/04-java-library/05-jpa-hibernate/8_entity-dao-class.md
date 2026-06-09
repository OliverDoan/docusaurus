---
sidebar_position: 8
title: "Xây dựng Entity và DAO class trong Hibernate"
---

# Xây dựng Entity và DAO class trong Hibernate

Để code Hibernate gọn gàng và dễ bảo trì, người ta thường tách phần truy cập database ra một lớp riêng gọi là DAO, tách biệt khỏi logic nghiệp vụ. Bài này giới thiệu DAO pattern, cách xây một GenericDAO dùng chung cho mọi Entity rồi mở rộng thành DAO chuyên biệt, và cách kết hợp với tầng Service. Đây là cấu trúc nền tảng cho hầu hết ứng dụng dùng Hibernate.

## DAO Pattern là gì?

**DAO** (Data Access Object — đối tượng truy cập dữ liệu) là một design pattern tách biệt hoàn toàn logic truy cập database ra khỏi logic nghiệp vụ (business logic). Mỗi Entity thường có một DAO class riêng.

Lợi ích:
- Dễ bảo trì: thay đổi database không ảnh hưởng đến business logic.
- Dễ test: có thể mock DAO khi test service.
- Tái sử dụng: nhiều service có thể dùng cùng một DAO.

## Cấu trúc dự án đề xuất

```
src/main/java/com/example/
├── config/
│   └── HibernateConfig.java       ← Cấu hình SessionFactory
├── entity/
│   ├── SanPham.java               ← Entity class
│   └── DanhMuc.java
├── dao/
│   ├── GenericDAO.java            ← DAO tổng quát (generic)
│   ├── SanPhamDAO.java            ← DAO riêng cho SanPham
│   └── DanhMucDAO.java
└── service/
    └── SanPhamService.java        ← Business logic
```

## GenericDAO - DAO tổng quát

```java
package com.example.dao;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import com.example.config.HibernateConfig;

import java.io.Serializable;
import java.util.List;
import java.util.Optional;

/**
 * GenericDAO cung cấp các thao tác CRUD chung cho mọi Entity.
 * T: kiểu Entity (ví dụ SanPham)
 * ID: kiểu khóa chính (ví dụ Long)
 */
public class GenericDAO<T, ID extends Serializable> {

    private final Class<T> entityClass;   // Lưu kiểu Entity để dùng trong find()
    private final SessionFactory sf;

    public GenericDAO(Class<T> entityClass) {
        this.entityClass = entityClass;
        this.sf = HibernateConfig.getSessionFactory();
    }

    // Thêm mới entity
    public T save(T entity) {
        try (Session session = sf.openSession()) {
            session.beginTransaction();
            session.persist(entity);
            session.getTransaction().commit();
            return entity;
        }
    }

    // Tìm theo ID, trả về Optional để tránh NullPointerException
    public Optional<T> findById(ID id) {
        try (Session session = sf.openSession()) {
            T entity = session.find(entityClass, id);
            return Optional.ofNullable(entity);
        }
    }

    // Lấy tất cả records (dùng HQL - Hibernate Query Language)
    public List<T> findAll() {
        try (Session session = sf.openSession()) {
            String hql = "FROM " + entityClass.getSimpleName();
            return session.createQuery(hql, entityClass).list();
        }
    }

    // Cập nhật entity
    public T update(T entity) {
        try (Session session = sf.openSession()) {
            session.beginTransaction();
            T merged = session.merge(entity);
            session.getTransaction().commit();
            return merged;
        }
    }

    // Xóa theo ID
    public boolean deleteById(ID id) {
        try (Session session = sf.openSession()) {
            session.beginTransaction();
            T entity = session.find(entityClass, id);
            if (entity != null) {
                session.remove(entity);
                session.getTransaction().commit();
                return true;
            }
            session.getTransaction().rollback();
            return false;
        }
    }

    // Đếm số lượng records
    public long count() {
        try (Session session = sf.openSession()) {
            String hql = "SELECT COUNT(e) FROM " + entityClass.getSimpleName() + " e";
            return session.createQuery(hql, Long.class).uniqueResult();
        }
    }
}
```

## Entity và DAO cụ thể

### Entity SanPham

```java
package com.example.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "san_pham")
public class SanPham {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_sp", unique = true, nullable = false, length = 50)
    private String maSP;

    @Column(name = "ten_sp", nullable = false, length = 200)
    private String tenSP;

    @Column(name = "gia_ban", precision = 15, scale = 2)
    private BigDecimal giaBan;

    @Column(name = "so_luong_ton")
    private Integer soLuongTon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "danh_muc_id")
    private DanhMuc danhMuc;

    @Column(name = "ngay_tao", updatable = false)
    private LocalDateTime ngayTao;

    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat;

    @PrePersist
    public void truocKhiLuu() {
        ngayTao = LocalDateTime.now();
        ngayCapNhat = LocalDateTime.now();
    }

    @PreUpdate
    public void truocKhiCapNhat() {
        ngayCapNhat = LocalDateTime.now();
    }

    public SanPham() {}

    public SanPham(String maSP, String tenSP, BigDecimal giaBan) {
        this.maSP = maSP;
        this.tenSP = tenSP;
        this.giaBan = giaBan;
    }

    // Getters và setters
    public Long getId() { return id; }
    public String getMaSP() { return maSP; }
    public void setMaSP(String maSP) { this.maSP = maSP; }
    public String getTenSP() { return tenSP; }
    public void setTenSP(String tenSP) { this.tenSP = tenSP; }
    public BigDecimal getGiaBan() { return giaBan; }
    public void setGiaBan(BigDecimal giaBan) { this.giaBan = giaBan; }
    public Integer getSoLuongTon() { return soLuongTon; }
    public void setSoLuongTon(Integer soLuongTon) { this.soLuongTon = soLuongTon; }
    public DanhMuc getDanhMuc() { return danhMuc; }
    public void setDanhMuc(DanhMuc danhMuc) { this.danhMuc = danhMuc; }
    public LocalDateTime getNgayTao() { return ngayTao; }
    public LocalDateTime getNgayCapNhat() { return ngayCapNhat; }
}
```

### SanPhamDAO - DAO chuyên biệt

```java
package com.example.dao;

import com.example.entity.SanPham;
import org.hibernate.Session;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public class SanPhamDAO extends GenericDAO<SanPham, Long> {

    public SanPhamDAO() {
        super(SanPham.class);
    }

    // Tìm sản phẩm theo mã SP (unique)
    public Optional<SanPham> findByMaSP(String maSP) {
        try (Session session = getSessionFactory().openSession()) {
            return session.createQuery(
                    "FROM SanPham WHERE maSP = :maSP", SanPham.class)
                    .setParameter("maSP", maSP)
                    .uniqueResultOptional();
        }
    }

    // Tìm sản phẩm theo tên (LIKE search, không phân biệt hoa thường)
    public List<SanPham> findByTenContaining(String keyword) {
        try (Session session = getSessionFactory().openSession()) {
            return session.createQuery(
                    "FROM SanPham sp WHERE lower(sp.tenSP) LIKE lower(:keyword)",
                    SanPham.class)
                    .setParameter("keyword", "%" + keyword + "%")
                    .list();
        }
    }

    // Tìm sản phẩm theo danh mục
    public List<SanPham> findByDanhMucId(Long danhMucId) {
        try (Session session = getSessionFactory().openSession()) {
            return session.createQuery(
                    "FROM SanPham sp WHERE sp.danhMuc.id = :danhMucId",
                    SanPham.class)
                    .setParameter("danhMucId", danhMucId)
                    .list();
        }
    }

    // Tìm sản phẩm có giá trong khoảng
    public List<SanPham> findByGiaBanBetween(BigDecimal giaTu, BigDecimal giaDen) {
        try (Session session = getSessionFactory().openSession()) {
            return session.createQuery(
                    "FROM SanPham sp WHERE sp.giaBan BETWEEN :giaTu AND :giaDen ORDER BY sp.giaBan",
                    SanPham.class)
                    .setParameter("giaTu", giaTu)
                    .setParameter("giaDen", giaDen)
                    .list();
        }
    }

    // Cập nhật số lượng tồn kho
    public int capNhatSoLuongTon(Long id, int soLuongMoi) {
        try (Session session = getSessionFactory().openSession()) {
            session.beginTransaction();
            int soHang = session.createMutationQuery(
                    "UPDATE SanPham SET soLuongTon = :soLuong WHERE id = :id")
                    .setParameter("soLuong", soLuongMoi)
                    .setParameter("id", id)
                    .executeUpdate();
            session.getTransaction().commit();
            return soHang;   // Trả về số hàng bị ảnh hưởng
        }
    }
}
```

> **Lưu ý**: `GenericDAO` ở trên dùng `sf` là field private. Để `SanPhamDAO` có thể dùng session factory, cần thêm `protected SessionFactory getSessionFactory()` trong `GenericDAO`.

## SanPhamService - Tầng nghiệp vụ

```java
package com.example.service;

import com.example.dao.SanPhamDAO;
import com.example.entity.SanPham;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public class SanPhamService {

    private final SanPhamDAO sanPhamDAO = new SanPhamDAO();

    public SanPham taoMoiSanPham(String maSP, String tenSP, BigDecimal gia) {
        // Kiểm tra mã SP đã tồn tại chưa
        Optional<SanPham> existing = sanPhamDAO.findByMaSP(maSP);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Mã sản phẩm đã tồn tại: " + maSP);
        }
        SanPham sp = new SanPham(maSP, tenSP, gia);
        return sanPhamDAO.save(sp);
    }

    public List<SanPham> timKiemTheoTen(String keyword) {
        return sanPhamDAO.findByTenContaining(keyword);
    }

    public void capNhatGia(Long id, BigDecimal giaMoi) {
        Optional<SanPham> spOpt = sanPhamDAO.findById(id);
        SanPham sp = spOpt.orElseThrow(() ->
                new RuntimeException("Không tìm thấy sản phẩm ID: " + id));
        sp.setGiaBan(giaMoi);
        sanPhamDAO.update(sp);
    }
}
```

## Tóm tắt

- **DAO pattern** tách biệt logic truy cập database khỏi business logic.
- `GenericDAO` cung cấp CRUD chung, DAO cụ thể bổ sung các query đặc thù.
- Dùng `Optional` thay vì trả về `null` để code an toàn hơn.
- **Service layer** (tầng dịch vụ) chứa business logic và sử dụng DAO.
- Luôn dùng **parameterized query** (câu truy vấn tham số hóa) để tránh SQL injection.
