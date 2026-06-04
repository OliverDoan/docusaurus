---
sidebar_position: 5
title: "Lập trình đa luồng với Callable và Future trong Java"
---

# Lập trình đa luồng với Callable và Future trong Java

## Hạn chế của Runnable

Interface `Runnable` chỉ có phương thức `run()` — không trả về kết quả và không ném checked exception. Nếu muốn luồng tính toán và trả về giá trị, cần dùng **Callable** và **Future**.

## Callable là gì?

**Callable** (có thể gọi để lấy kết quả) là interface tương tự `Runnable` nhưng có thêm hai điểm khác biệt:
- Phương thức `call()` **trả về giá trị** (có kiểu generic `V`).
- `call()` có thể **ném checked exception**.

```java
@FunctionalInterface
public interface Callable<V> {
    V call() throws Exception;
}
```

## Future là gì?

**Future** (tương lai — đại diện cho kết quả của tác vụ bất đồng bộ) là interface đại diện cho kết quả của tác vụ đang thực thi. Nó cho phép:
- Kiểm tra tác vụ đã hoàn thành chưa.
- Chờ và lấy kết quả.
- Hủy tác vụ nếu cần.

| Phương thức | Mô tả |
|---|---|
| `get()` | Chờ (block) đến khi có kết quả rồi trả về |
| `get(timeout, unit)` | Chờ trong thời gian giới hạn, ném `TimeoutException` nếu quá hạn |
| `isDone()` | Kiểm tra tác vụ đã xong chưa (không block) |
| `isCancelled()` | Kiểm tra tác vụ đã bị hủy chưa |
| `cancel(mayInterrupt)` | Hủy tác vụ; nếu `true` sẽ interrupt luồng đang chạy |

## Ví dụ cơ bản: Callable và Future

```java
import java.util.concurrent.*;

public class CallableFutureDemo {

    public static void main(String[] args) throws InterruptedException {
        ExecutorService executor = Executors.newFixedThreadPool(3);

        // Callable<Integer> — tác vụ trả về kiểu Integer
        Callable<Integer> tinhToan = () -> {
            System.out.println("Đang tính toán... " + Thread.currentThread().getName());
            Thread.sleep(2000); // mô phỏng tính toán nặng
            int ketQua = 0;
            for (int i = 1; i <= 1000; i++) {
                ketQua += i;
            }
            return ketQua;
        };

        // submit(Callable) — gửi tác vụ, nhận về Future ngay lập tức (không block)
        Future<Integer> future = executor.submit(tinhToan);

        System.out.println("Tác vụ đã gửi. Tiếp tục làm việc khác...");

        // isDone() — kiểm tra không block
        System.out.println("Đã xong? " + future.isDone()); // false

        try {
            // get() — chờ đến khi tác vụ hoàn thành
            Integer ketQua = future.get();
            System.out.println("Kết quả: " + ketQua); // 500500
            System.out.println("Đã xong? " + future.isDone()); // true
        } catch (ExecutionException e) {
            // ExecutionException bọc exception từ call()
            System.out.println("Lỗi trong tác vụ: " + e.getCause().getMessage());
        }

        executor.shutdown();
    }
}
```

## Ví dụ thực tế: Tìm kiếm song song

```java
import java.util.*;
import java.util.concurrent.*;

public class TimKiemSongSong {

    // Mô phỏng tìm kiếm trên một nguồn dữ liệu (database, API, ...)
    static List<String> timKiemTrong(String nguon, String tuKhoa) throws InterruptedException {
        Thread.sleep((long) (Math.random() * 1500 + 500)); // 0.5 - 2 giây
        // Mô phỏng kết quả
        return List.of(
                nguon + ": Kết quả 1 cho '" + tuKhoa + "'",
                nguon + ": Kết quả 2 cho '" + tuKhoa + "'"
        );
    }

    public static void main(String[] args) throws InterruptedException {
        ExecutorService executor = Executors.newFixedThreadPool(4);
        String tuKhoa = "Java";

        // Tạo 4 Callable tìm kiếm song song trên 4 nguồn
        List<Callable<List<String>>> danhSachTacVu = List.of(
                () -> timKiemTrong("MySQL", tuKhoa),
                () -> timKiemTrong("Elasticsearch", tuKhoa),
                () -> timKiemTrong("Redis Cache", tuKhoa),
                () -> timKiemTrong("File Index", tuKhoa)
        );

        long batDau = System.currentTimeMillis();

        // invokeAll() — gửi tất cả tác vụ và chờ tất cả hoàn thành
        // Trả về List<Future> theo cùng thứ tự
        List<Future<List<String>>> futures = executor.invokeAll(danhSachTacVu);

        List<String> tatCaKetQua = new ArrayList<>();
        for (Future<List<String>> f : futures) {
            try {
                tatCaKetQua.addAll(f.get());
            } catch (ExecutionException e) {
                System.out.println("Một nguồn tìm kiếm bị lỗi: " + e.getCause().getMessage());
            }
        }

        long thoiGian = System.currentTimeMillis() - batDau;
        System.out.println("Tìm thấy " + tatCaKetQua.size()
                + " kết quả trong " + thoiGian + "ms:");
        tatCaKetQua.forEach(kq -> System.out.println("  - " + kq));

        executor.shutdown();
    }
}
```

## invokeAny — lấy kết quả nhanh nhất

```java
import java.util.*;
import java.util.concurrent.*;

public class InvokeAnyDemo {

    // Mô phỏng gọi API từ nhiều region — dùng kết quả nào về trước
    static String goiApi(String region, int doTre) throws InterruptedException {
        Thread.sleep(doTre);
        return region + " phản hồi sau " + doTre + "ms";
    }

    public static void main(String[] args)
            throws InterruptedException, ExecutionException {
        ExecutorService executor = Executors.newFixedThreadPool(3);

        List<Callable<String>> servers = List.of(
                () -> goiApi("Singapore", 1200),
                () -> goiApi("Tokyo",     600),   // Nhanh nhất
                () -> goiApi("US-West",   900)
        );

        // invokeAny() — chạy tất cả, trả về kết quả của tác vụ HOÀN THÀNH TRƯỚC
        // Các tác vụ còn lại bị hủy
        String ketQuaNhanhNhat = executor.invokeAny(servers);
        System.out.println("Phản hồi nhanh nhất: " + ketQuaNhanhNhat);
        // In ra: "Tokyo phản hồi sau 600ms"

        executor.shutdown();
    }
}
```

## Xử lý timeout và hủy tác vụ

```java
import java.util.concurrent.*;

public class TimeoutVaHuy {

    public static void main(String[] args) {
        ExecutorService executor = Executors.newSingleThreadExecutor();

        Callable<String> tacVuCham = () -> {
            System.out.println("Tác vụ bắt đầu...");
            Thread.sleep(5000); // Mô phỏng tác vụ 5 giây
            return "Hoàn thành"; // Sẽ không đến đây nếu bị hủy
        };

        Future<String> future = executor.submit(tacVuCham);

        try {
            // Chờ tối đa 2 giây — tác vụ 5 giây sẽ bị timeout
            String ketQua = future.get(2, TimeUnit.SECONDS);
            System.out.println("Kết quả: " + ketQua);

        } catch (TimeoutException e) {
            System.out.println("Hết thời gian chờ! Hủy tác vụ...");
            // cancel(true) — gửi interrupt để dừng luồng đang chạy
            boolean daHuy = future.cancel(true);
            System.out.println("Hủy thành công? " + daHuy);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (ExecutionException e) {
            System.out.println("Lỗi trong tác vụ: " + e.getCause().getMessage());
        } finally {
            executor.shutdown();
        }

        System.out.println("Đã bị hủy? " + future.isCancelled()); // true
        System.out.println("Đã xong? " + future.isDone());         // true (cancelled = done)
    }
}
```

## Callable ném Exception

```java
import java.util.concurrent.*;

public class CallableException {

    public static void main(String[] args) {
        ExecutorService executor = Executors.newSingleThreadExecutor();

        Callable<Integer> phanChia = () -> {
            int a = 10, b = 0;
            if (b == 0) {
                throw new ArithmeticException("Không thể chia cho 0!");
            }
            return a / b;
        };

        Future<Integer> future = executor.submit(phanChia);

        try {
            future.get(); // Ném ExecutionException bọc ArithmeticException

        } catch (ExecutionException e) {
            // getCause() — lấy exception gốc từ call()
            Throwable nguonLoi = e.getCause();
            System.out.println("Loại lỗi: " + nguonLoi.getClass().getSimpleName());
            System.out.println("Thông điệp: " + nguonLoi.getMessage());

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            executor.shutdown();
        }
    }
}
```

## So sánh Runnable vs Callable

| Tiêu chí | Runnable | Callable\<V\> |
|---|---|---|
| Phương thức | `run()` | `call()` |
| Trả về giá trị | Không (void) | Có (kiểu V) |
| Ném checked exception | Không | Có |
| Dùng với ExecutorService | `submit(Runnable)` → `Future<?>` | `submit(Callable)` → `Future<V>` |
| Dùng với Thread trực tiếp | Có | Không |

## Tổng kết

`Callable` và `Future` là bộ đôi không thể thiếu khi cần lấy **kết quả từ tác vụ bất đồng bộ**:
- `Callable<V>` định nghĩa tác vụ có trả về và có thể ném lỗi.
- `Future<V>` đại diện cho kết quả tương lai — dùng `get()` để lấy (có thể block), `isDone()` để kiểm tra không block.
- `invokeAll()` chờ tất cả tác vụ hoàn thành.
- `invokeAny()` lấy kết quả nhanh nhất, hủy phần còn lại.
- Luôn xử lý `ExecutionException` để bắt lỗi phát sinh trong `call()`.
