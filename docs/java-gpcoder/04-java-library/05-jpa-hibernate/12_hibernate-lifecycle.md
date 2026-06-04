---
sidebar_position: 12
title: "Hibernate Lifecycle"
---

# Hibernate Lifecycle

## Entity Lifecycle là gì?

**Entity Lifecycle** (vòng đời của Entity) mô tả các trạng thái mà một đối tượng Entity có thể trải qua trong Hibernate. Hiểu rõ vòng đời giúp bạn kiểm soát chính xác khi nào dữ liệu được đồng bộ với database.

## Bốn trạng thái của Entity

### 1. Transient (tạm thời - chưa được quản lý)

Entity vừa được `new`, chưa có ID và Hibernate chưa biết đến nó:

```java
// Tạo object bình thường với new - đây là trạng thái TRANSIENT
NhanVien nv = new NhanVien();
nv.setHoTen("Nguyen Van A");
nv.setEmail("vana@cty.com");
// nv.getId() = null (chưa có ID)
// Hibernate chưa quản lý nv này
// Nếu nv bị garbage collected (thu hồi bộ nhớ), dữ liệu mất hoàn toàn
```

### 2. Persistent (tồn tại - đang được quản lý)

Entity đang được `Session` quản lý trong **persistence context** (ngữ cảnh lưu trữ). Mọi thay đổi sẽ tự động được đồng bộ với database khi session flush:

```java
Session session = sessionFactory.openSession();
session.beginTransaction();

// Cách 1: Gọi persist() → entity chuyển từ Transient sang Persistent
session.persist(nv);
// nv giờ là PERSISTENT, session đang theo dõi nó
// nv.getId() có giá trị (được database sinh ra)

// Cách 2: load từ database → entity luôn ở trạng thái PERSISTENT
NhanVien nvFromDB = session.find(NhanVien.class, 1L);
// nvFromDB đang ở trạng thái PERSISTENT

// Thay đổi entity PERSISTENT - KHÔNG cần gọi update()!
nvFromDB.setLuong(20000000.0);
// Hibernate tự động detect thay đổi và sinh UPDATE SQL khi commit

session.getTransaction().commit();
// Khi commit: Hibernate flush (đẩy) tất cả thay đổi xuống database
session.close();
```

### 3. Detached (tách rời - không được quản lý)

Entity đã tồn tại trong database (có ID) nhưng session đã bị đóng hoặc bị evict:

```java
Session session1 = sessionFactory.openSession();
NhanVien nv = session1.find(NhanVien.class, 1L);
// nv là PERSISTENT trong session1

session1.close();
// Session đóng → nv trở thành DETACHED
// nv.getId() vẫn có giá trị, nhưng Hibernate không còn theo dõi nó

// Thay đổi khi DETACHED - Hibernate KHÔNG tự động cập nhật database
nv.setLuong(25000000.0);  // Thay đổi này chưa xuống database

// Để lưu lại thay đổi, cần merge() trong session mới
Session session2 = sessionFactory.openSession();
session2.beginTransaction();
NhanVien mergedNv = session2.merge(nv);  // Đưa nv từ DETACHED → PERSISTENT
// mergedNv bây giờ là PERSISTENT, còn nv vẫn là DETACHED
session2.getTransaction().commit();
session2.close();
```

### 4. Removed (đã xóa - sẽ bị xóa khỏi database)

Entity đang ở trạng thái REMOVED sẽ bị xóa khỏi database khi transaction commit:

```java
Session session = sessionFactory.openSession();
session.beginTransaction();

NhanVien nv = session.find(NhanVien.class, 1L);
// nv là PERSISTENT

session.remove(nv);
// nv chuyển sang trạng thái REMOVED
// SQL DELETE được lên kế hoạch nhưng chưa thực thi

session.getTransaction().commit();
// DELETE FROM nhan_vien WHERE id = 1 được thực thi
// nv trở thành TRANSIENT sau khi session đóng
session.close();
```

## Biểu đồ chuyển đổi trạng thái

```
new NhanVien()
     │
     ▼
[TRANSIENT] ──persist()──────────────────────────────▶ [PERSISTENT]
                                                              │
                                                    find(), load()
                                                    merge() kết quả
                                                              │
                                          ┌───────────────────┤
                                          │                   │
                                    remove()           session.close()
                                          │              evict()
                                          ▼                   ▼
                                      [REMOVED]          [DETACHED]
                                          │                   │
                                    commit()             merge()
                                          │                   │
                                          ▼                   ▼
                                   (xóa khỏi DB)        [PERSISTENT]
```

## Dirty Checking - Tự động phát hiện thay đổi

**Dirty Checking** (kiểm tra thay đổi tự động) là cơ chế Hibernate theo dõi snapshot (bản chụp trạng thái ban đầu) của mỗi entity PERSISTENT và tự động sinh SQL UPDATE khi có thay đổi:

```java
Session session = sessionFactory.openSession();
session.beginTransaction();

NhanVien nv = session.find(NhanVien.class, 1L);
// Hibernate lưu snapshot: {hoTen: "Nguyen Van A", luong: 15000000}

nv.setLuong(20000000.0);    // Thay đổi field
nv.setHoTen("Nguyen Van An"); // Thay đổi thêm một field nữa

// Không cần gọi session.update() hay session.save()!
// Hibernate tự phát hiện sự khác biệt với snapshot

session.getTransaction().commit();
// Hibernate tự động sinh:
// UPDATE nhan_vien SET luong=20000000, ho_ten='Nguyen Van An' WHERE id=1

session.close();
```

## Flush - Đẩy thay đổi xuống database

**Flush** (xả/đẩy) là quá trình Hibernate đồng bộ persistence context với database bằng cách thực thi các câu SQL đã được lên kế hoạch. Flush khác với **commit** — flush thực thi SQL nhưng chưa kết thúc transaction.

```java
Session session = sessionFactory.openSession();
session.beginTransaction();

NhanVien nv = session.find(NhanVien.class, 1L);
nv.setLuong(20000000.0);

// Flush thủ công - thực thi UPDATE SQL ngay lập tức nhưng chưa commit
session.flush();
// Lúc này SQL đã được gửi xuống database nhưng transaction vẫn chưa kết thúc

// ... có thể làm thêm thao tác khác ...

session.getTransaction().commit();  // Commit transaction
session.close();
```

### FlushMode - Chế độ flush

| FlushMode | Mô tả |
|-----------|-------|
| `AUTO` | Flush trước khi query (mặc định) |
| `COMMIT` | Chỉ flush khi commit |
| `MANUAL` | Chỉ flush khi gọi `flush()` thủ công |
| `ALWAYS` | Flush trước mọi query |

## Evict và Clear

```java
Session session = sessionFactory.openSession();

NhanVien nv = session.find(NhanVien.class, 1L);

// evict(): loại bỏ một entity khỏi persistence context → entity trở thành DETACHED
session.evict(nv);
nv.setLuong(99999999.0);  // Thay đổi này sẽ KHÔNG được lưu khi commit

// clear(): loại bỏ TẤT CẢ entity khỏi persistence context
session.clear();
// Dùng khi xử lý batch lớn để giải phóng memory

// contains(): kiểm tra entity có đang trong persistence context không
boolean dangQuanLy = session.contains(nv);  // false sau khi evict
System.out.println("Đang quản lý: " + dangQuanLy);

session.close();
```

## Tóm tắt

| Trạng thái | Có ID | Session theo dõi | Thay đổi tự động lưu |
|-----------|-------|-----------------|---------------------|
| Transient | Không | Không | Không |
| Persistent | Có | Có | Có (dirty checking) |
| Detached | Có | Không | Không |
| Removed | Có | Có (để xóa) | Sẽ bị xóa khi commit |

- **Dirty checking** tự động phát hiện thay đổi trên entity PERSISTENT — không cần gọi `update()`.
- **`merge()`** đưa entity DETACHED trở về PERSISTENT.
- **`flush()`** đồng bộ SQL nhưng chưa kết thúc transaction.
- Dùng **`evict()`** và **`clear()`** khi xử lý batch lớn để tránh tràn bộ nhớ.
