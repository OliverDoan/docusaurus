---
sidebar_position: 4
title: "Hướng dẫn tạo và sử dụng ThreadPool trong Java - ExecutorService"
---

# Hướng dẫn tạo và sử dụng ThreadPool trong Java - ExecutorService

Tạo và hủy luồng thủ công liên tục rất tốn tài nguyên và làm chậm hệ thống khi xử lý nhiều tác vụ. ThreadPool giải quyết vấn đề này bằng cách tạo sẵn một nhóm luồng để tái sử dụng, quản lý qua interface `ExecutorService`. Bài này giới thiệu các loại ThreadPool phổ biến, cách dùng chúng qua nhiều ví dụ thực tế và cách tự tùy chỉnh `ThreadPoolExecutor`.

## Vấn đề với việc tạo Thread thủ công

Mỗi lần tạo `new Thread(...)` đều tốn chi phí:
- Cấp phát bộ nhớ cho stack của luồng.
- Đăng ký với hệ điều hành.
- Khi luồng kết thúc, tài nguyên bị giải phóng rồi lại cấp phát mới.

Với hàng nghìn tác vụ, việc tạo và hủy luồng liên tục sẽ làm chậm hệ thống đáng kể.

## ThreadPool là gì?

**ThreadPool** (bể luồng — tập hợp các luồng được tạo sẵn và tái sử dụng) giải quyết vấn đề trên. Thay vì tạo luồng mới cho mỗi tác vụ, ThreadPool duy trì một nhóm luồng sẵn sàng — tác vụ đến thì giao cho luồng rảnh, luồng xong việc quay lại chờ việc mới.

**ExecutorService** (dịch vụ thực thi) là interface trung tâm trong gói `java.util.concurrent` để quản lý ThreadPool.

## Các loại ThreadPool trong Java

Lớp tiện ích **Executors** cung cấp các factory method tạo ThreadPool phổ biến:

| Factory Method | Mô tả |
|---|---|
| `newFixedThreadPool(n)` | Đúng n luồng, không đổi |
| `newCachedThreadPool()` | Tự động tăng/giảm theo tải, tái dùng luồng nhàn rỗi |
| `newSingleThreadExecutor()` | Đúng 1 luồng, thực thi tuần tự |
| `newScheduledThreadPool(n)` | Lên lịch chạy định kỳ hoặc trễ |
| `newWorkStealingPool()` | Dùng ForkJoinPool, tối ưu cho tác vụ song song (Java 8+) |

## Ví dụ: FixedThreadPool

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class FixedThreadPoolDemo {

    public static void main(String[] args) throws InterruptedException {
        // Tạo pool cố định 3 luồng
        ExecutorService executor = Executors.newFixedThreadPool(3);

        System.out.println("Bắt đầu gửi 8 tác vụ vào pool 3 luồng:");

        for (int i = 1; i <= 8; i++) {
            final int soTacVu = i;
            // submit(Runnable) — gửi tác vụ vào hàng đợi của pool
            executor.submit(() -> {
                System.out.printf("Tác vụ %d | Luồng: %s%n",
                        soTacVu, Thread.currentThread().getName());
                try {
                    Thread.sleep(1000); // mô phỏng xử lý 1 giây
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                System.out.println("Tác vụ " + soTacVu + " hoàn thành.");
            });
        }

        // shutdown() — ngừng nhận tác vụ mới, nhưng chờ tác vụ hiện tại xong
        executor.shutdown();

        // awaitTermination() — chờ tối đa 30 giây cho pool dọn dẹp
        if (executor.awaitTermination(30, TimeUnit.SECONDS)) {
            System.out.println("Tất cả tác vụ hoàn thành!");
        } else {
            System.out.println("Timeout! Buộc dừng pool.");
            // shutdownNow() — gửi interrupt cho các luồng đang chạy
            executor.shutdownNow();
        }
    }
}
```

**Kết quả mẫu** — 8 tác vụ được xử lý bởi 3 luồng, tối đa 3 tác vụ song song:
```
Tác vụ 1 | Luồng: pool-1-thread-1
Tác vụ 2 | Luồng: pool-1-thread-2
Tác vụ 3 | Luồng: pool-1-thread-3
Tác vụ 1 hoàn thành.
Tác vụ 4 | Luồng: pool-1-thread-1   ← luồng 1 tái sử dụng
...
```

## Ví dụ: CachedThreadPool

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class CachedThreadPoolDemo {

    public static void main(String[] args) throws InterruptedException {
        // CachedThreadPool — tạo luồng mới khi cần, tái dùng luồng rảnh
        // Phù hợp cho tác vụ ngắn và số lượng thay đổi linh hoạt
        ExecutorService executor = Executors.newCachedThreadPool();

        // Gửi 10 tác vụ nhanh — pool sẽ tạo tối đa 10 luồng
        for (int i = 1; i <= 10; i++) {
            final int id = i;
            executor.submit(() -> {
                System.out.println("Tác vụ " + id
                        + " chạy trên " + Thread.currentThread().getName());
                try { Thread.sleep(200); } catch (InterruptedException e) {}
            });
        }

        executor.shutdown();
        executor.awaitTermination(10, TimeUnit.SECONDS);
        System.out.println("Xong!");
    }
}
```

## Ví dụ: ScheduledThreadPool

```java
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class ScheduledPoolDemo {

    public static void main(String[] args) throws InterruptedException {
        // ScheduledExecutorService — dùng cho tác vụ lên lịch
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);

        // schedule() — chạy một lần sau độ trễ chỉ định
        scheduler.schedule(() -> {
            System.out.println("Thông báo sau 2 giây: " + System.currentTimeMillis());
        }, 2, TimeUnit.SECONDS);

        // scheduleAtFixedRate() — chạy lặp với chu kỳ cố định
        // Tham số: (task, delay ban đầu, chu kỳ, đơn vị)
        scheduler.scheduleAtFixedRate(() -> {
            System.out.println("Kiểm tra định kỳ mỗi 1 giây: "
                    + Thread.currentThread().getName());
        }, 0, 1, TimeUnit.SECONDS);

        // scheduleWithFixedDelay() — chạy lặp, đo khoảng cách từ KHI XONG tác vụ trước
        scheduler.scheduleWithFixedDelay(() -> {
            System.out.println("Backup dữ liệu...");
            try { Thread.sleep(500); } catch (InterruptedException e) {}
        }, 1, 2, TimeUnit.SECONDS);

        // Chạy 5 giây rồi dừng
        Thread.sleep(5000);
        scheduler.shutdown();
    }
}
```

## Ví dụ thực tế: Xử lý nhiều file song song

```java
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;

public class XuLyFileSongSong {

    // Mô phỏng xử lý một file (đọc, phân tích, lưu kết quả)
    static String xuLyFile(String tenFile) throws InterruptedException {
        Thread.sleep((long) (Math.random() * 2000 + 500)); // 0.5 - 2.5 giây
        return "Kết quả của " + tenFile;
    }

    public static void main(String[] args) throws InterruptedException {
        List<String> danhSachFile = List.of(
                "bao-cao-q1.csv", "bao-cao-q2.csv", "bao-cao-q3.csv",
                "bao-cao-q4.csv", "nhan-su.xlsx", "tai-chinh.xlsx"
        );

        // Dùng 3 luồng xử lý 6 file
        ExecutorService executor = Executors.newFixedThreadPool(3);
        List<Future<String>> ketQua = new ArrayList<>();

        long batDau = System.currentTimeMillis();

        // submit(Callable) trả về Future — giữ kết quả tương lai
        for (String file : danhSachFile) {
            Future<String> future = executor.submit(() -> xuLyFile(file));
            ketQua.add(future);
        }

        // Thu thập kết quả
        for (int i = 0; i < ketQua.size(); i++) {
            try {
                // future.get() — chờ tác vụ xong và lấy kết quả
                String kq = ketQua.get(i).get(10, TimeUnit.SECONDS);
                System.out.println((i + 1) + ". " + kq);
            } catch (ExecutionException e) {
                System.out.println("Lỗi xử lý file " + (i + 1) + ": " + e.getCause().getMessage());
            } catch (TimeoutException e) {
                System.out.println("Timeout file " + (i + 1));
            }
        }

        executor.shutdown();

        long thoiGian = System.currentTimeMillis() - batDau;
        System.out.printf("Hoàn thành %d file trong %.1f giây%n",
                danhSachFile.size(), thoiGian / 1000.0);
    }
}
```

## Cách tạo ThreadPoolExecutor tùy chỉnh

Khi cần kiểm soát chi tiết hơn, dùng trực tiếp **ThreadPoolExecutor**:

```java
import java.util.concurrent.*;

public class CustomThreadPool {

    public static void main(String[] args) throws InterruptedException {
        ThreadPoolExecutor pool = new ThreadPoolExecutor(
                2,                              // corePoolSize: số luồng tối thiểu luôn duy trì
                5,                              // maximumPoolSize: số luồng tối đa
                30, TimeUnit.SECONDS,           // keepAliveTime: luồng thừa sống thêm bao lâu
                new ArrayBlockingQueue<>(10),   // workQueue: hàng đợi tác vụ, sức chứa 10
                new ThreadFactory() {           // ThreadFactory: factory tạo luồng tùy chỉnh
                    int dem = 0;
                    @Override
                    public Thread newThread(Runnable r) {
                        Thread t = new Thread(r, "NhanVien-" + (++dem));
                        t.setDaemon(false);
                        return t;
                    }
                },
                new ThreadPoolExecutor.CallerRunsPolicy() // RejectedExecutionHandler: xử lý khi đầy
        );

        for (int i = 1; i <= 8; i++) {
            final int id = i;
            pool.submit(() -> {
                System.out.println("Tác vụ " + id + " | " + Thread.currentThread().getName());
                try { Thread.sleep(500); } catch (InterruptedException e) {}
            });
        }

        pool.shutdown();
        pool.awaitTermination(30, TimeUnit.SECONDS);
    }
}
```

## Tổng kết

| Loại Pool | Khi nào dùng |
|---|---|
| `FixedThreadPool(n)` | Số tác vụ nhiều, muốn giới hạn tài nguyên |
| `CachedThreadPool` | Tác vụ ngắn, số lượng thay đổi linh hoạt |
| `SingleThreadExecutor` | Cần thực thi tuần tự, chỉ một luồng |
| `ScheduledThreadPool` | Tác vụ lên lịch, định kỳ |
| `ThreadPoolExecutor` | Cần kiểm soát đầy đủ thông số |

Luôn nhớ gọi `shutdown()` sau khi dùng xong để giải phóng tài nguyên, và dùng `awaitTermination()` để đảm bảo tất cả tác vụ hoàn thành trước khi thoát chương trình.
