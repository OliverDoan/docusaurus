---
sidebar_position: 2
title: "2. Đa luồng cơ bản (Concurrency)"
---

# 2. Đa luồng cơ bản (Concurrency)

---

## Mục lục

- [Vì sao cần xử lý song song?](#vì-sao-cần-xử-lý-song-song)
- [Tranh chấp tài nguyên (Race Condition)](#tranh-chấp-tài-nguyên-race-condition)
- [synchronized — khóa đồng bộ](#synchronized--khóa-đồng-bộ)
- [Lock — khóa linh hoạt hơn](#lock--khóa-linh-hoạt-hơn)
- [Khóa chết (Deadlock)](#khóa-chết-deadlock)
- [ExecutorService và Thread Pool](#executorservice-và-thread-pool)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao cần xử lý song song?

Hãy tưởng tượng một quán cà phê có **một nhân viên** pha chế. Nếu có 100 khách, mỗi ly mất 1 phút, người cuối cùng phải chờ 100 phút. Nhưng nếu thuê **5 nhân viên** (5 luồng), họ làm song song và khách được phục vụ nhanh hơn 5 lần.

Trong phần mềm, xử lý song song (concurrency) giúp:

- Phục vụ nhiều người dùng cùng lúc (web server xử lý nhiều yêu cầu).
- Tận dụng CPU nhiều nhân.
- Không chờ đợi vô ích khi một việc bị chậm.

Nhưng song song cũng sinh ra rắc rối: khi nhiều luồng **cùng dùng chung một thứ**, chúng có thể giẫm chân nhau. Đó là lý do ta cần các công cụ bên dưới.

---

## Tranh chấp tài nguyên (Race Condition)

**Race condition (tranh chấp tài nguyên)** xảy ra khi nhiều luồng cùng đọc/ghi một dữ liệu chung, và kết quả phụ thuộc vào **thứ tự may rủi** của các luồng.

Ví dụ đời thường: hai người cùng rút tiền từ một tài khoản có 100k. Cả hai cùng nhìn thấy "còn 100k", cùng rút 100k. Nếu không khóa lại, ngân hàng có thể trừ sai và tài khoản bị âm.

```java
class DemSai {
    int count = 0; // Biến chung bị nhiều luồng cùng tăng

    void tang() {
        count++; // Thực ra là 3 bước: đọc, cộng 1, ghi lại → KHÔNG an toàn
    }
}

public class ViDuRaceCondition {
    public static void main(String[] args) throws InterruptedException {
        DemSai dem = new DemSai();

        // Tạo 2 luồng, mỗi luồng tăng 100000 lần
        Runnable job = () -> {
            for (int i = 0; i < 100000; i++) dem.tang();
        };
        Thread t1 = new Thread(job);
        Thread t2 = new Thread(job);
        t1.start(); t2.start();
        t1.join(); t2.join();

        // Mong đợi 200000, nhưng thực tế thường NHỎ HƠN → đó là race condition
        System.out.println("Kết quả: " + dem.count);
    }
}
```

Vì sao sai? Vì `count++` không phải một bước duy nhất, mà gồm: **đọc** giá trị, **cộng 1**, **ghi lại**. Hai luồng có thể đọc cùng một giá trị cũ rồi ghi đè nhau, làm mất lần tăng.

---

## synchronized — khóa đồng bộ

Từ khóa `synchronized` (đồng bộ hóa) giống như **một cái chìa khóa phòng vệ sinh**: chỉ một người vào được mỗi lúc, ai đến sau phải xếp hàng chờ.

Khi một luồng vào khối `synchronized`, các luồng khác phải **chờ** đến lượt.

```java
class DemDung {
    int count = 0;

    // synchronized: chỉ một luồng được chạy phương thức này mỗi lúc
    synchronized void tang() {
        count++;
    }
}
```

Hoặc khóa một khối lệnh cụ thể (chứ không cả phương thức):

```java
class Vi {
    private final Object khoa = new Object(); // Đối tượng dùng làm khóa
    private int soDu = 0;

    void napTien(int tien) {
        // Chỉ phần trong khối này được bảo vệ
        synchronized (khoa) {
            soDu += tien;
        }
    }
}
```

Nhờ `synchronized`, ví dụ đếm ở trên sẽ cho kết quả **đúng 200000**.

---

## Lock — khóa linh hoạt hơn

`Lock` (khóa) trong gói `java.util.concurrent.locks` là cách khóa thủ công, linh hoạt hơn `synchronized`. Bạn tự gọi `lock()` để khóa và `unlock()` để mở.

```java
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

class DemVoiLock {
    private final Lock lock = new ReentrantLock(); // Một loại Lock thông dụng
    private int count = 0;

    void tang() {
        lock.lock(); // Khóa lại
        try {
            count++;
        } finally {
            // LUÔN mở khóa trong finally để chắc chắn không bị kẹt khóa
            lock.unlock();
        }
    }
}
```

So sánh nhanh:

- `synchronized`: đơn giản, tự động mở khóa khi ra khỏi khối.
- `Lock`: phải tự mở khóa (nhớ dùng `finally`), nhưng có thêm tính năng như thử khóa (`tryLock`), khóa có thời hạn.

Lời khuyên cho người mới: **ưu tiên `synchronized`** vì khó quên mở khóa. Dùng `Lock` khi cần tính năng nâng cao.

---

## Khóa chết (Deadlock)

**Deadlock (khóa chết)** là tình huống hai luồng cùng chờ nhau mãi mãi, không ai chạy tiếp được.

Ví dụ đời thường: An giữ cái thìa và chờ cái dĩa; Bình giữ cái dĩa và chờ cái thìa. Cả hai cứ chờ nhau, không ai ăn được.

```java
public class ViDuDeadlock {
    static final Object thia = new Object();
    static final Object dia = new Object();

    public static void main(String[] args) {
        // Luồng An: giữ thìa rồi cần dĩa
        new Thread(() -> {
            synchronized (thia) {
                synchronized (dia) {
                    System.out.println("An ăn được");
                }
            }
        }).start();

        // Luồng Bình: giữ dĩa rồi cần thìa → ngược thứ tự → DEADLOCK
        new Thread(() -> {
            synchronized (dia) {
                synchronized (thia) {
                    System.out.println("Bình ăn được");
                }
            }
        }).start();
    }
}
```

**Cách tránh deadlock**: luôn khóa các tài nguyên theo **cùng một thứ tự**. Nếu cả hai luồng đều khóa `thia` trước rồi mới `dia`, sẽ không bao giờ kẹt.

---

## ExecutorService và Thread Pool

Việc tự tạo `new Thread()` mỗi lần khá tốn kém (giống như thuê rồi đuổi việc nhân viên liên tục). **Thread pool (bể luồng)** là một nhóm luồng có sẵn được tái sử dụng — giống như thuê sẵn 5 nhân viên cố định, giao việc cho ai rảnh.

`ExecutorService` là công cụ quản lý thread pool trong Java.

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class ViDuExecutor {
    public static void main(String[] args) {
        // Tạo bể có 3 luồng dùng chung
        ExecutorService pool = Executors.newFixedThreadPool(3);

        // Giao 5 việc; 3 luồng sẽ luân phiên xử lý
        for (int i = 1; i <= 5; i++) {
            int viec = i;
            pool.submit(() ->
                System.out.println("Việc " + viec + " chạy bởi "
                    + Thread.currentThread().getName())
            );
        }

        // shutdown() báo "không nhận thêm việc", chờ việc cũ xong rồi tắt
        pool.shutdown();
    }
}
```

Lợi ích của thread pool:

- Tái sử dụng luồng → tiết kiệm tài nguyên.
- Giới hạn số luồng → tránh tạo quá nhiều luồng làm treo máy.
- Quản lý vòng đời dễ dàng với `shutdown()`.

---

## Lỗi thường gặp

1. **Quên đồng bộ biến chung** → race condition, kết quả sai và khó tái hiện.
2. **Quên `unlock()`** khi dùng `Lock`, hoặc không đặt trong `finally` → kẹt khóa vĩnh viễn.
3. **Khóa nhiều tài nguyên theo thứ tự khác nhau** giữa các luồng → deadlock.
4. **Quên gọi `shutdown()`** trên `ExecutorService` → chương trình không tự kết thúc (luồng pool vẫn sống).
5. **Đồng bộ quá mức** (khóa mọi thứ) → mất hết lợi ích song song vì các luồng cứ phải xếp hàng chờ.

---

## Tóm tắt

- Xử lý song song giúp nhanh hơn nhưng dễ gây lỗi khi dùng chung dữ liệu.
- **Race condition** xảy ra khi nhiều luồng cùng ghi một dữ liệu chung mà không khóa.
- `synchronized` là cách khóa đơn giản, tự mở khóa; `Lock` linh hoạt hơn nhưng phải tự `unlock()` trong `finally`.
- **Deadlock** là hai luồng chờ nhau mãi; tránh bằng cách khóa theo cùng thứ tự.
- **ExecutorService / thread pool** tái sử dụng luồng, hiệu quả hơn tạo `new Thread()` thủ công.
