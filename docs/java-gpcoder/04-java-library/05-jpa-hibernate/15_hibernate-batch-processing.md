---
sidebar_position: 15
title: "Hibernate Batch Processing"
---

# Hibernate Batch Processing

## Batch Processing là gì?

**Batch Processing** (xử lý theo lô) là kỹ thuật thực thi nhiều thao tác database trong một lần, thay vì gửi từng câu SQL một. Điều này giúp giảm đáng kể số lần round-trip (khứ hồi) giữa ứng dụng và database, tăng hiệu năng rõ rệt khi cần xử lý hàng nghìn hoặc hàng triệu bản ghi.

### Vấn đề khi không dùng Batch

```java
// CÁCH KÉM HIỆU NĂNG: 10,000 INSERT riêng lẻ
Session session = sessionFactory.openSession();
session.beginTransaction();

for (int i = 0; i < 10000; i++) {
    NhanVien nv = new NhanVien("NV-" + i, "nv" + i + "@cty.com", 10000000.0);
    session.persist(nv);
    // Mỗi persist() sinh 1 INSERT statement riêng lẻ → rất chậm
    // L1 Cache ngày càng lớn → tốn RAM
}

session.getTransaction().commit();
session.close();
// Kết quả: 10,000 lần round-trip tới database!
```

## Cấu hình Batch Insert/Update

### Kích hoạt JDBC Batching

```xml
<!-- Trong hibernate.cfg.xml -->

<!-- Kích thước batch: gom 50 câu SQL vào một lần gửi -->
<property name="hibernate.jdbc.batch_size">50</property>

<!-- Sắp xếp INSERT theo thứ tự entity để tối ưu batch -->
<property name="hibernate.order_inserts">true</property>

<!-- Sắp xếp UPDATE theo thứ tự entity để tối ưu batch -->
<property name="hibernate.order_updates">true</property>

<!-- Bật batch versioned data (cần cho optimistic locking) -->
<property name="hibernate.jdbc.batch_versioned_data">true</property>
```

### Batch Insert đúng cách

```java
import org.hibernate.Session;
import org.hibernate.StatelessSession;

public class BatchInsertDemo {

    private static final int BATCH_SIZE = 50;

    // Cách 1: Dùng Session thông thường với flush() + clear()
    public void batchInsertVoiSession(SessionFactory sf, List<NhanVien> danhSach) {
        Session session = sf.openSession();
        session.beginTransaction();

        for (int i = 0; i < danhSach.size(); i++) {
            session.persist(danhSach.get(i));

            // Mỗi BATCH_SIZE bản ghi: flush để gửi SQL, clear để giải phóng L1 Cache
            if ((i + 1) % BATCH_SIZE == 0) {
                session.flush();   // Gửi batch SQL xuống database
                session.clear();   // Xóa L1 Cache để tránh tràn bộ nhớ
                System.out.println("Đã lưu " + (i + 1) + " bản ghi...");
            }
        }

        // Flush phần cuối (nếu tổng số không chia hết cho BATCH_SIZE)
        session.flush();
        session.getTransaction().commit();
        session.close();

        System.out.println("Hoàn thành! Tổng: " + danhSach.size() + " nhân viên");
    }
}
```

## StatelessSession - Phiên không trạng thái

**`StatelessSession`** (phiên không trạng thái) là session đặc biệt của Hibernate:
- Không có persistence context (L1 Cache).
- Không thực hiện dirty checking.
- Không có cascading.
- Hiệu năng cao nhất cho batch processing.

```java
public class StatelessSessionDemo {

    // Cách 2: Dùng StatelessSession - tốt hơn cho batch rất lớn
    public void batchInsertVoiStatelessSession(SessionFactory sf, int soLuong) {
        // Mở StatelessSession thay vì Session thông thường
        try (StatelessSession statelessSession = sf.openStatelessSession()) {
            statelessSession.beginTransaction();

            for (int i = 0; i < soLuong; i++) {
                NhanVien nv = new NhanVien(
                    "NV-" + String.format("%06d", i),
                    "nv" + i + "@cty.com",
                    10000000.0 + (i % 10) * 1000000
                );
                // insert() thay vì persist() cho StatelessSession
                statelessSession.insert(nv);

                // Không cần flush/clear - StatelessSession không có L1 Cache
            }

            statelessSession.getTransaction().commit();
            System.out.println("Đã insert " + soLuong + " nhân viên");
        }
    }

    // StatelessSession cũng hỗ trợ update và delete
    public void batchUpdateVoiStatelessSession(SessionFactory sf, Double tyLeTang) {
        try (StatelessSession ss = sf.openStatelessSession()) {
            ss.beginTransaction();

            // Scroll qua từng bản ghi để xử lý hàng loạt mà không load hết vào RAM
            // ScrollableResults: con trỏ cuộn qua kết quả từng bước một
            try (org.hibernate.ScrollableResults<NhanVien> scroll =
                     ss.createQuery("FROM NhanVien", NhanVien.class)
                       .scroll(org.hibernate.ScrollMode.FORWARD_ONLY)) {

                while (scroll.next()) {
                    NhanVien nv = scroll.get();
                    nv.setLuong(nv.getLuong() * (1 + tyLeTang));
                    ss.update(nv);
                }
            }

            ss.getTransaction().commit();
            System.out.println("Đã cập nhật lương cho tất cả nhân viên");
        }
    }
}
```

## ScrollableResults - Cuộn qua kết quả lớn

**`ScrollableResults`** (kết quả có thể cuộn) cho phép xử lý từng bản ghi một từ một tập kết quả lớn mà không cần load tất cả vào RAM cùng một lúc:

```java
public class ScrollableDemo {

    private static final int BATCH_SIZE = 100;

    public void xuLyHangTrieuBanGhi(Session session) {
        session.beginTransaction();

        // scroll(): tạo cursor (con trỏ) để đọc từng bản ghi
        // FORWARD_ONLY: chỉ đọc tiến, không đọc ngược lại
        try (org.hibernate.ScrollableResults<NhanVien> results =
                 session.createQuery("FROM NhanVien ORDER BY id", NhanVien.class)
                        .setFetchSize(BATCH_SIZE)   // Tải trước BATCH_SIZE bản ghi
                        .scroll(org.hibernate.ScrollMode.FORWARD_ONLY)) {

            int count = 0;
            while (results.next()) {
                NhanVien nv = results.get();

                // Xử lý nghiệp vụ
                nv.setLuong(nv.getLuong() * 1.05);   // Tăng 5% lương

                count++;
                if (count % BATCH_SIZE == 0) {
                    session.flush();
                    session.clear();   // Giải phóng L1 Cache
                    System.out.println("Đã xử lý " + count + " bản ghi...");
                }
            }

            // Xử lý phần cuối
            session.flush();
        }

        session.getTransaction().commit();
    }
}
```

## Bulk Operations - Cập nhật/Xóa hàng loạt

Khi cần cập nhật hoặc xóa nhiều bản ghi theo điều kiện, **bulk operation** (thao tác hàng loạt) hiệu quả hơn nhiều so với load từng entity:

```java
public class BulkOperationDemo {

    // Cập nhật hàng loạt bằng HQL
    public int tangLuongHangLoat(Session session, Long phongBanId, Double tyLe) {
        session.beginTransaction();

        int soHang = session
            .createMutationQuery(
                "UPDATE NhanVien SET luong = luong * :tyLe " +
                "WHERE phongBan.id = :pbId AND luong < :luongTran")
            .setParameter("tyLe", 1 + tyLe)
            .setParameter("pbId", phongBanId)
            .setParameter("luongTran", 30000000.0)
            .executeUpdate();

        session.getTransaction().commit();
        System.out.println("Đã tăng lương " + soHang + " nhân viên trong phòng " + phongBanId);
        return soHang;
    }

    // Xóa hàng loạt bằng HQL
    public int xoaNhanVienNghiViec(Session session) {
        session.beginTransaction();

        int soHang = session
            .createMutationQuery(
                "DELETE FROM NhanVien WHERE trangThai = :trangThai " +
                "AND ngayNghi < :ngayGioiHan")
            .setParameter("trangThai", NhanVien.TrangThai.DA_NGHI_VIEC)
            .setParameter("ngayGioiHan",
                java.time.LocalDate.now().minusYears(2))
            .executeUpdate();

        session.getTransaction().commit();
        System.out.println("Đã xóa " + soHang + " nhân viên đã nghỉ việc quá 2 năm");
        return soHang;
    }
}
```

## So sánh hiệu năng

| Phương pháp | 10,000 inserts | Ghi chú |
|------------|---------------|---------|
| Không batch | ~30 giây | Mỗi insert là 1 round-trip |
| Session + flush/clear | ~2 giây | 200 lần gửi batch (mỗi lô 50) |
| StatelessSession | ~1.5 giây | Ít overhead nhất |
| JDBC thuần (baseline) | ~1 giây | Điểm tham chiếu |

> Số liệu trên chỉ mang tính minh họa, kết quả thực tế phụ thuộc vào cấu hình database, network và phần cứng.

## Tóm tắt

- Kích hoạt `hibernate.jdbc.batch_size` (thường 50-100) để Hibernate gom SQL thành batch.
- Dùng `flush()` + `clear()` định kỳ trong vòng lặp để tránh tràn L1 Cache.
- **`StatelessSession`** là lựa chọn tốt nhất cho batch rất lớn — không có overhead của persistence context.
- **`ScrollableResults`** cho phép xử lý tập kết quả triệu bản ghi mà không tốn RAM.
- **Bulk operation** bằng HQL nhanh hơn nhiều so với load entity rồi xóa/cập nhật từng cái một.
