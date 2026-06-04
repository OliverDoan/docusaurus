---
sidebar_position: 3
title: "Đồng bộ hóa các luồng trong Java - synchronized"
---

# Đồng bộ hóa các luồng trong Java - synchronized

## Vấn đề khi nhiều luồng dùng chung dữ liệu

Khi nhiều luồng cùng đọc/ghi một biến dùng chung mà không có kiểm soát, chương trình sẽ cho kết quả sai. Đây gọi là **Race Condition** (điều kiện tranh chấp — nhiều luồng đua nhau truy cập dữ liệu chung gây ra kết quả không nhất quán).

### Ví dụ lỗi Race Condition

```java
public class TaiKhoanNganHang {

    private int soDu = 1000; // số dư ban đầu: 1000

    // Rút tiền KHÔNG an toàn với đa luồng
    public void rutTienKhongAnToan(int soTien) {
        if (soDu >= soTien) {
            // Hai luồng có thể vượt qua if này cùng lúc!
            System.out.println(Thread.currentThread().getName()
                    + " rút " + soTien);
            soDu -= soTien;
        } else {
            System.out.println(Thread.currentThread().getName()
                    + " không đủ số dư");
        }
    }

    public static void main(String[] args) throws InterruptedException {
        TaiKhoanNganHang taiKhoan = new TaiKhoanNganHang();

        // Hai luồng cùng rút 800 — tổng 1600 > 1000, nhưng cả hai có thể thành công!
        Thread luong1 = new Thread(() -> taiKhoan.rutTienKhongAnToan(800), "Luồng-1");
        Thread luong2 = new Thread(() -> taiKhoan.rutTienKhongAnToan(800), "Luồng-2");

        luong1.start();
        luong2.start();
        luong1.join();
        luong2.join();

        System.out.println("Số dư cuối: " + taiKhoan.soDu); // Có thể là -600!
    }
}
```

## Giải pháp: từ khóa `synchronized`

**Synchronized** (đồng bộ hóa) đảm bảo tại một thời điểm chỉ có **một luồng** được thực thi khối code được bảo vệ. Nó sử dụng cơ chế **Monitor Lock** (khóa màn hình — mỗi đối tượng Java có một khóa nội tại) để kiểm soát truy cập.

### Cách 1: Synchronized Method (phương thức đồng bộ)

```java
public class TaiKhoanAnToan {

    private int soDu = 1000;

    // synchronized trên instance method — khóa trên đối tượng this
    public synchronized void rutTien(int soTien) {
        // Chỉ một luồng vào đây tại một thời điểm
        if (soDu >= soTien) {
            System.out.println(Thread.currentThread().getName()
                    + " rút " + soTien + " | Số dư trước: " + soDu);
            soDu -= soTien;
            System.out.println("Số dư sau: " + soDu);
        } else {
            System.out.println(Thread.currentThread().getName()
                    + " không đủ số dư (hiện có: " + soDu + ")");
        }
    }

    public synchronized void napTien(int soTien) {
        soDu += soTien;
        System.out.println(Thread.currentThread().getName()
                + " nạp " + soTien + " | Số dư mới: " + soDu);
    }

    public synchronized int getSoDu() {
        return soDu;
    }

    public static void main(String[] args) throws InterruptedException {
        TaiKhoanAnToan taiKhoan = new TaiKhoanAnToan();

        Thread luong1 = new Thread(() -> taiKhoan.rutTien(800), "Luồng-1");
        Thread luong2 = new Thread(() -> taiKhoan.rutTien(800), "Luồng-2");

        luong1.start();
        luong2.start();
        luong1.join();
        luong2.join();

        System.out.println("Số dư cuối: " + taiKhoan.getSoDu()); // Luôn >= 0
    }
}
```

### Cách 2: Synchronized Block (khối đồng bộ)

Khối đồng bộ linh hoạt hơn: chỉ khóa đúng phần code cần thiết, thay vì toàn bộ phương thức.

```java
public class KhoDuTru {

    private int soLuongTon = 100;
    private final Object khoaDuTru = new Object(); // đối tượng khóa riêng

    public void datHang(String tenKhach, int soLuong) {
        // Code không cần đồng bộ — chạy song song được
        System.out.println(tenKhach + " đang kiểm tra đơn hàng...");

        // Chỉ đồng bộ phần thao tác với tồn kho
        synchronized (khoaDuTru) {
            if (soLuongTon >= soLuong) {
                soLuongTon -= soLuong;
                System.out.println(tenKhach + " đặt " + soLuong
                        + " sản phẩm. Còn lại: " + soLuongTon);
            } else {
                System.out.println(tenKhach + " thất bại — chỉ còn " + soLuongTon);
            }
        }
        // Code sau khối synchronized — chạy song song được
        System.out.println(tenKhach + " nhận xác nhận đơn hàng.");
    }

    public static void main(String[] args) throws InterruptedException {
        KhoDuTru kho = new KhoDuTru();

        Thread[] luongs = new Thread[5];
        String[] khach = {"An", "Bình", "Cúc", "Dũng", "Em"};

        for (int i = 0; i < 5; i++) {
            final String ten = khach[i];
            luongs[i] = new Thread(() -> kho.datHang(ten, 30));
            luongs[i].start();
        }

        for (Thread t : luongs) t.join();
        System.out.println("Tồn kho cuối: " + kho.soLuongTon);
    }
}
```

### Cách 3: Static Synchronized Method (phương thức tĩnh đồng bộ)

```java
public class BoDemToanCuc {

    private static int tongSoLuot = 0;

    // synchronized trên static method — khóa trên Class object (BoDemToanCuc.class)
    public static synchronized void tangBoDem() {
        tongSoLuot++;
    }

    public static synchronized int layGiaTri() {
        return tongSoLuot;
    }

    public static void main(String[] args) throws InterruptedException {
        Thread[] luongs = new Thread[1000];

        for (int i = 0; i < 1000; i++) {
            luongs[i] = new Thread(BoDemToanCuc::tangBoDem);
            luongs[i].start();
        }

        for (Thread t : luongs) t.join();

        System.out.println("Kết quả: " + BoDemToanCuc.layGiaTri()); // Luôn là 1000
    }
}
```

## wait(), notify(), notifyAll()

Các phương thức này dùng để **phối hợp** giữa các luồng — một luồng chờ đến khi luồng khác báo hiệu. Phải gọi bên trong khối `synchronized`.

| Phương thức | Ý nghĩa |
|---|---|
| `wait()` | Luồng hiện tại nhả khóa và chờ đến khi được `notify()` |
| `notify()` | Đánh thức một luồng đang `wait()` trên cùng đối tượng |
| `notifyAll()` | Đánh thức tất cả luồng đang `wait()` trên cùng đối tượng |

### Ví dụ: Hàng đợi Sản xuất - Tiêu thụ (Producer - Consumer)

```java
import java.util.LinkedList;
import java.util.Queue;

public class HangDoiSanXuat {

    private final Queue<Integer> hangDoi = new LinkedList<>();
    private final int DUNG_LUONG_TOI_DA = 5;

    // Nhà sản xuất (Producer) — tạo ra sản phẩm
    public synchronized void sanXuat(int sanPham) throws InterruptedException {
        // Chờ nếu hàng đợi đã đầy
        while (hangDoi.size() == DUNG_LUONG_TOI_DA) {
            System.out.println("Kho đầy, nhà sản xuất chờ...");
            wait(); // nhả khóa và ngủ
        }
        hangDoi.add(sanPham);
        System.out.println("Sản xuất: " + sanPham + " | Hàng trong kho: " + hangDoi.size());
        notifyAll(); // thông báo cho người tiêu dùng
    }

    // Người tiêu dùng (Consumer) — lấy sản phẩm
    public synchronized int tieuThu() throws InterruptedException {
        // Chờ nếu hàng đợi trống
        while (hangDoi.isEmpty()) {
            System.out.println("Kho trống, người tiêu dùng chờ...");
            wait(); // nhả khóa và ngủ
        }
        int sanPham = hangDoi.poll();
        System.out.println("Tiêu thụ: " + sanPham + " | Còn lại: " + hangDoi.size());
        notifyAll(); // thông báo cho nhà sản xuất
        return sanPham;
    }

    public static void main(String[] args) {
        HangDoiSanXuat hangDoi = new HangDoiSanXuat();

        // Nhà sản xuất
        Thread sanXuat = new Thread(() -> {
            for (int i = 1; i <= 10; i++) {
                try {
                    hangDoi.sanXuat(i);
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        });

        // Người tiêu dùng
        Thread tieuThu = new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                try {
                    hangDoi.tieuThu();
                    Thread.sleep(300);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        });

        sanXuat.start();
        tieuThu.start();
    }
}
```

## Lưu ý và cạm bẫy phổ biến

### Deadlock — bế tắc

**Deadlock** (bế tắc — hai luồng cùng chờ nhau nhả khóa, dẫn đến đứng chương trình mãi mãi):

```java
// CẢNH BÁO: đoạn code này gây Deadlock!
Object khoaA = new Object();
Object khoaB = new Object();

Thread luong1 = new Thread(() -> {
    synchronized (khoaA) {           // Luồng 1 giữ khóa A
        try { Thread.sleep(100); } catch (InterruptedException e) {}
        synchronized (khoaB) {       // Luồng 1 chờ khóa B
            System.out.println("Luồng 1 hoàn thành");
        }
    }
});

Thread luong2 = new Thread(() -> {
    synchronized (khoaB) {           // Luồng 2 giữ khóa B
        try { Thread.sleep(100); } catch (InterruptedException e) {}
        synchronized (khoaA) {       // Luồng 2 chờ khóa A -> DEADLOCK!
            System.out.println("Luồng 2 hoàn thành");
        }
    }
});
```

**Cách tránh Deadlock**: luôn lấy các khóa **theo cùng thứ tự** trong mọi luồng.

## Tổng kết

`synchronized` là cơ chế đồng bộ hóa cơ bản và mạnh mẽ trong Java:
- **Synchronized method**: khóa toàn bộ phương thức — đơn giản nhưng có thể giảm hiệu năng.
- **Synchronized block**: khóa đúng phần cần thiết — linh hoạt và hiệu quả hơn.
- **Static synchronized**: khóa tầng class — dùng cho dữ liệu dùng chung toàn cục.
- Dùng `wait()`/`notify()` để phối hợp luồng theo mô hình Sản xuất - Tiêu thụ.
- Cẩn thận với **Deadlock** — luôn giữ thứ tự lấy khóa nhất quán.
