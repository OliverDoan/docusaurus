---
sidebar_position: 10
title: "Sử dụng Semaphore trong Java"
---

# Sử dụng Semaphore trong Java

## Semaphore là gì?

**Semaphore** (đèn hiệu — cơ chế đồng bộ hóa kiểm soát số luồng được truy cập tài nguyên dùng chung cùng một lúc) là class trong `java.util.concurrent`.

Semaphore duy trì một bộ **Permit** (giấy phép). Luồng muốn truy cập tài nguyên phải:
1. Xin giấy phép: `acquire()` — nếu còn permit thì lấy và tiếp tục, nếu hết thì chờ.
2. Trả giấy phép: `release()` — tăng số permit, cho phép luồng đang chờ tiếp tục.

Hình dung: Semaphore như bãi đỗ xe có N chỗ. Xe vào thì lấy 1 vé (acquire), xe ra thì trả vé (release). Khi đầy, xe mới phải chờ ngoài.

## Phân loại

- **Counting Semaphore** (đèn hiệu đếm): N permit, cho phép N luồng đồng thời.
- **Binary Semaphore** (đèn hiệu nhị phân): 1 permit, tương đương `Mutex` (khóa độc quyền) — chỉ 1 luồng tại một thời điểm.

## Khi nào nên dùng?

- Giới hạn số kết nối đến database (connection pool).
- Giới hạn số request đồng thời đến API bên ngoài (rate limiting).
- Giới hạn số luồng xử lý file cùng lúc để tránh quá tải I/O.
- Điều tiết tải (**throttling**) cho bất kỳ tài nguyên giới hạn nào.

## Ví dụ 1: Giới hạn kết nối database

```java
import java.util.concurrent.*;

public class KetNoiDatabase {

    // Chỉ cho phép tối đa 3 kết nối database cùng lúc
    private static final Semaphore semaphore = new Semaphore(3);

    static void thucHienTruyVan(String tenNguoiDung) {
        System.out.println(tenNguoiDung + " đang chờ kết nối database...");
        try {
            // acquire() — xin giấy phép, chặn cho đến khi có permit
            semaphore.acquire();
            System.out.println(tenNguoiDung + " được kết nối! "
                    + "Số permit còn lại: " + semaphore.availablePermits());

            // Thực hiện truy vấn (mô phỏng)
            Thread.sleep((long) (Math.random() * 2000 + 500));
            System.out.println(tenNguoiDung + " hoàn thành truy vấn.");

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            System.out.println(tenNguoiDung + " bị gián đoạn!");
        } finally {
            // release() luôn đặt trong finally để đảm bảo trả permit
            semaphore.release();
            System.out.println(tenNguoiDung + " trả kết nối. "
                    + "Permit còn lại: " + semaphore.availablePermits());
        }
    }

    public static void main(String[] args) {
        // 8 luồng cùng xin kết nối, nhưng tối đa 3 cùng lúc
        String[] nguoiDung = {"An", "Bình", "Cúc", "Dũng", "Em", "Phong", "Giang", "Hà"};

        for (String ten : nguoiDung) {
            new Thread(() -> thucHienTruyVan(ten)).start();
        }
    }
}
```

**Kết quả mẫu** — chú ý số permit không bao giờ âm:
```
An đang chờ kết nối...
Bình đang chờ kết nối...
...
An được kết nối! Số permit còn lại: 2
Bình được kết nối! Số permit còn lại: 1
Cúc được kết nối! Số permit còn lại: 0
Dũng đang chờ...     ← chờ vì hết permit
...
```

## Ví dụ 2: Rate Limiting — giới hạn tốc độ gọi API

```java
import java.util.concurrent.*;

public class GioiHanTocDo {

    // Tối đa 5 request đồng thời đến API bên ngoài
    private static final Semaphore rateLimiter = new Semaphore(5);

    static String goiApi(int requestId) throws InterruptedException {
        // tryAcquire(timeout) — thử lấy permit, chờ tối đa 3 giây
        boolean daLayPermit = rateLimiter.tryAcquire(3, TimeUnit.SECONDS);

        if (!daLayPermit) {
            return "Request " + requestId + " bị từ chối — quá tải!";
        }

        try {
            System.out.println("Request " + requestId + " đang gọi API... "
                    + "(" + (5 - rateLimiter.availablePermits()) + "/5 slot đang dùng)");
            Thread.sleep((long) (Math.random() * 1000 + 200));
            return "Request " + requestId + " thành công";
        } finally {
            rateLimiter.release();
        }
    }

    public static void main(String[] args) throws InterruptedException {
        ExecutorService executor = Executors.newFixedThreadPool(15);
        CountDownLatch latch = new CountDownLatch(15);

        for (int i = 1; i <= 15; i++) {
            final int id = i;
            executor.submit(() -> {
                try {
                    String ket = goiApi(id);
                    System.out.println(ket);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await();
        executor.shutdown();
        System.out.println("Tất cả request hoàn thành!");
    }
}
```

## Ví dụ 3: Binary Semaphore thay thế Mutex

```java
import java.util.concurrent.*;

public class MutexBangSemaphore {

    // Binary Semaphore (1 permit) — chỉ 1 luồng vào critical section
    private final Semaphore mutex = new Semaphore(1);
    private int soLanGhi = 0;

    public void ghiDuLieu(String ten) throws InterruptedException {
        mutex.acquire(); // Lấy khóa
        try {
            // Critical Section — chỉ 1 luồng tại một thời điểm
            int hienTai = soLanGhi;
            Thread.sleep(50); // Mô phỏng xử lý
            soLanGhi = hienTai + 1;
            System.out.println(ten + " ghi lần thứ " + soLanGhi);
        } finally {
            mutex.release(); // Trả khóa
        }
    }

    public static void main(String[] args) throws InterruptedException {
        MutexBangSemaphore obj = new MutexBangSemaphore();
        Thread[] luongs = new Thread[10];

        for (int i = 0; i < 10; i++) {
            final String ten = "Luồng-" + (i + 1);
            luongs[i] = new Thread(() -> {
                try {
                    obj.ghiDuLieu(ten);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
            luongs[i].start();
        }

        for (Thread t : luongs) t.join();
        System.out.println("Tổng số lần ghi: " + obj.soLanGhi); // Luôn là 10
    }
}
```

## Ví dụ 4: acquireUninterruptibly và tryAcquire

```java
import java.util.concurrent.*;

public class CacPhuongThucAcquire {

    static Semaphore sem = new Semaphore(2);

    public static void main(String[] args) throws InterruptedException {
        // tryAcquire() — thử lấy permit ngay, KHÔNG chờ, trả về true/false
        boolean layDuoc = sem.tryAcquire();
        System.out.println("tryAcquire() không chờ: " + layDuoc); // true
        if (layDuoc) sem.release();

        // tryAcquire(N) — thử lấy N permit ngay lập tức
        boolean layDuoc3 = sem.tryAcquire(3);
        System.out.println("tryAcquire(3) khi chỉ có 2 permit: " + layDuoc3); // false

        // tryAcquire(timeout, unit) — thử lấy, chờ tối đa timeout
        boolean layDuocTimeout = sem.tryAcquire(1, TimeUnit.SECONDS);
        System.out.println("tryAcquire với timeout 1s: " + layDuocTimeout); // true
        if (layDuocTimeout) sem.release();

        // acquireUninterruptibly() — lấy permit, KHÔNG thể bị interrupt
        // Dùng khi tác vụ phải hoàn thành, không thể bị gián đoạn
        sem.acquireUninterruptibly();
        System.out.println("acquireUninterruptibly() thành công");
        sem.release();

        // release(N) — trả N permit cùng lúc
        sem.release(2); // Lưu ý: có thể trả nhiều hơn số permit lấy — hãy cẩn thận!
        System.out.println("Số permit hiện tại: " + sem.availablePermits()); // 4!
    }
}
```

## Fair Semaphore — semaphore công bằng

```java
// Mặc định: không công bằng (non-fair) — luồng mới có thể "chen hàng"
Semaphore khongCongBang = new Semaphore(1);

// Fair Semaphore: luồng chờ lâu hơn được phục vụ trước (FIFO)
Semaphore congBang = new Semaphore(1, true);

System.out.println("Fair? " + congBang.isFair()); // true
```

## Tổng kết các phương thức

| Phương thức | Mô tả |
|---|---|
| `acquire()` | Lấy 1 permit, chờ nếu hết |
| `acquire(n)` | Lấy n permit, chờ nếu không đủ |
| `acquireUninterruptibly()` | Lấy permit, không bị interrupt |
| `release()` | Trả 1 permit |
| `release(n)` | Trả n permit |
| `tryAcquire()` | Thử lấy ngay, trả true/false (không chờ) |
| `tryAcquire(timeout, unit)` | Thử lấy với timeout |
| `availablePermits()` | Số permit còn lại |
| `isFair()` | Kiểm tra có phải fair semaphore không |

## Tổng kết

`Semaphore` là công cụ linh hoạt để **kiểm soát số luồng truy cập đồng thời**:
- Counting Semaphore giới hạn N luồng đồng thời — dùng cho connection pool, rate limiting.
- Binary Semaphore (1 permit) hoạt động như Mutex — loại trừ tương hỗ.
- Luôn đặt `release()` trong khối `finally` để tránh giữ permit mãi mãi.
- Dùng `tryAcquire()` khi không muốn block — phù hợp cho circuit breaker, fallback.
- Fair mode đảm bảo công bằng nhưng giảm thông lượng — chỉ dùng khi thực sự cần.
