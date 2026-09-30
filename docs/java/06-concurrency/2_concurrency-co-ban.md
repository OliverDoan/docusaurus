---
sidebar_position: 2
title: "2. Đa luồng cơ bản (Concurrency)"
---

# 2. Đa luồng cơ bản (Concurrency)

Đa luồng (concurrency) là khi nhiều luồng cùng chạy và dùng chung dữ liệu, giúp chương trình nhanh hơn nhưng cũng dễ sinh ra lỗi tranh chấp. Bài này giới thiệu các công cụ cốt lõi để giữ cho dữ liệu chung an toàn như khóa đồng bộ, deadlock và thread pool. Hiểu chúng giúp bạn viết phần mềm song song chạy đúng, không bị sai kết quả hay treo; chi tiết nằm bên dưới.

[![Sơ đồ tóm tắt bài: Concurrency cơ bản](/img/java/concurrency-co-ban.webp)](pathname:///img/java/concurrency-co-ban.webp)

---

:::note[Ghi nhớ nhanh]

- ⭐ **Race condition** — nhiều luồng cùng ghi một dữ liệu chung mà không khóa cho kết quả sai (ví dụ `count++` thực chất là 3 bước đọc–cộng–ghi).
- ⭐ **`synchronized` vs `Lock`** — `synchronized` đơn giản, tự mở khóa; `Lock`/`ReentrantLock` linh hoạt hơn nhưng phải tự `unlock()` trong `finally`.
- **Deadlock** — hai luồng chờ nhau mãi (vòng chờ); tránh bằng cách luôn khóa tài nguyên theo **cùng một thứ tự**.
- **`ExecutorService` / thread pool** — tái sử dụng luồng, hiệu quả hơn `new Thread()`; nhớ gọi `shutdown()`.
- **Công cụ an toàn sẵn có** — `AtomicInteger` cho counter, `ConcurrentHashMap` cho cache đa luồng.

:::

---

## Mục lục

- [Vì sao cần xử lý song song?](#vì-sao-cần-xử-lý-song-song)
- [Vì sao concurrency cần đồng bộ hóa?](#vì-sao-concurrency-cần-đồng-bộ-hóa)
- [Tranh chấp tài nguyên (Race Condition)](#tranh-chấp-tài-nguyên-race-condition)
- [synchronized — khóa đồng bộ](#synchronized--khóa-đồng-bộ)
- [Lock — khóa linh hoạt hơn](#lock--khóa-linh-hoạt-hơn)
- [Khóa chết (Deadlock)](#khóa-chết-deadlock)
- [ExecutorService và Thread Pool](#executorservice-và-thread-pool)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vì sao cần xử lý song song?

Hãy tưởng tượng một quán cà phê có **một nhân viên** pha chế. Nếu có 100 khách, mỗi ly mất 1 phút, người cuối cùng phải chờ 100 phút. Nhưng nếu thuê **5 nhân viên** (5 luồng), họ làm song song và khách được phục vụ nhanh hơn 5 lần.

Trong phần mềm, xử lý song song (concurrency) giúp:

- Phục vụ nhiều người dùng cùng lúc (web server xử lý nhiều yêu cầu).
- Tận dụng CPU nhiều nhân.
- Không chờ đợi vô ích khi một việc bị chậm.

Nhưng song song cũng sinh ra rắc rối: khi nhiều luồng **cùng dùng chung một thứ**, chúng có thể giẫm chân nhau. Đó là lý do ta cần các công cụ bên dưới.

---

## Vì sao concurrency cần đồng bộ hóa?

Khi nhiều luồng **cùng đọc/ghi một dữ liệu chung**, các thao tác đan xen nhau gây ra **race condition**: kết quả sai không lường trước được và bug rất khó tái hiện.

**Vấn đề:**

```java
class Dem {
    int count = 0;

    void tang() {
        // count++ thực ra là 3 bước: ĐỌC → CỘNG 1 → GHI lại
        // Hai luồng có thể cùng đọc giá trị cũ rồi ghi đè nhau → mất cập nhật
        count++;
    }
}
// 2 luồng cùng tăng 100000 lần: mong đợi 200000,
// nhưng thực tế thường NHỎ HƠN vì các bước chồng lên nhau.
```

**Giải pháp:**

```java
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.ConcurrentHashMap;

class DemAnToan {
    // 1) synchronized/Lock: chỉ MỘT luồng vào vùng tới hạn tại một thời điểm
    private int count = 0;
    synchronized void tang() {
        count++;
    }

    // 2) Biến Atomic: thao tác nguyên tử (atomic) không cần khóa
    private final AtomicInteger demNguyenTu = new AtomicInteger(0);
    void tangNguyenTu() {
        demNguyenTu.incrementAndGet();
    }

    // 3) Concurrent collections: an toàn đa luồng sẵn có
    private final ConcurrentHashMap<String, Integer> cache = new ConcurrentHashMap<>();
    void luuCache(String khoa, int giaTri) {
        cache.put(khoa, giaTri);
    }
    // Lưu ý: khi khóa nhiều tài nguyên, luôn khóa theo CÙNG THỨ TỰ để tránh deadlock.
}
```

:::tip[Dùng thực tế]

- Bảo vệ **biến đếm hoặc số dư dùng chung** bằng `synchronized`/`Lock` để không bị mất cập nhật.
- Dùng `ConcurrentHashMap` cho **cache đa luồng** thay vì `HashMap` thường.
- Dùng `AtomicInteger`/`AtomicLong` cho **counter** cần tăng/giảm nhanh, không cần khóa.
- Tránh **race trên trạng thái chia sẻ** (cờ, danh sách dùng chung) bằng cách đồng bộ hóa truy cập.

:::

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

Sơ đồ dưới minh hoạ **vòng chờ (circular wait)** khiến hai luồng kẹt nhau mãi:

```mermaid
flowchart LR
    An["Luồng An<br/>đang giữ thìa"] -->|"chờ dĩa"| Dia["Tài nguyên dĩa"]
    Binh["Luồng Bình<br/>đang giữ dĩa"] -->|"chờ thìa"| Thia["Tài nguyên thìa"]
    Dia -.->|"đang bị Bình giữ"| Binh
    Thia -.->|"đang bị An giữ"| An
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

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Race condition là gì? Vì sao `count++` không an toàn khi nhiều luồng cùng gọi?**

<details className="qa">
<summary>Xem đáp án</summary>

**Race condition (tranh chấp tài nguyên)** xảy ra khi nhiều luồng cùng đọc/ghi một dữ liệu chung, và kết quả cuối cùng phụ thuộc vào **thứ tự thực thi may rủi** của các luồng.

`count++` trông như một phép toán duy nhất, nhưng thực chất gồm **ba bước**: đọc giá trị hiện tại, cộng thêm 1, rồi ghi lại. Nếu hai luồng cùng thực hiện ba bước này đan xen nhau:

```
Luồng A đọc count = 5
Luồng B đọc count = 5   (chưa thấy A ghi vì A chưa ghi xong)
Luồng A ghi count = 6
Luồng B ghi count = 6   (đáng lẽ phải là 7 -> MẤT một lần tăng)
```

Kết quả cuối cùng nhỏ hơn tổng số lần tăng mong đợi, và lỗi này **không xảy ra đều đặn** — có lần đúng, có lần sai, rất khó tái hiện và debug.

</details>

**2. So sánh `synchronized` và `Lock` (`ReentrantLock`). Khi nào nên ưu tiên cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `synchronized` | `Lock` / `ReentrantLock` |
|---|---|---|
| Mở khóa | Tự động khi ra khỏi khối lệnh (kể cả khi có exception) | Phải tự gọi `unlock()`, luôn cần đặt trong `finally` |
| Thử khóa không chờ | Không hỗ trợ | `tryLock()` — thử lấy khóa, không được thì bỏ qua ngay |
| Khóa có giới hạn thời gian | Không hỗ trợ | `tryLock(thoiGian, đơnVị)` |
| Chờ khóa có thể bị ngắt | Không | `lockInterruptibly()` — cho phép luồng đang chờ khóa bị `interrupt()` |
| Độ phức tạp / rủi ro | Đơn giản, khó quên mở khóa | Linh hoạt hơn nhưng dễ gây kẹt khóa vĩnh viễn nếu quên `unlock()` |

**Lời khuyên**: ưu tiên `synchronized` cho các trường hợp thông thường vì an toàn, khó quên mở khóa. Chỉ chuyển sang `Lock` khi thực sự cần các tính năng nâng cao như `tryLock` hoặc khóa có thể bị ngắt.

</details>

**3. Deadlock là gì? Liệt kê bốn điều kiện cần để deadlock xảy ra, và cách phòng tránh phổ biến nhất.**

<details className="qa">
<summary>Xem đáp án</summary>

**Deadlock (khóa chết)** là tình huống hai hoặc nhiều luồng chờ nhau **mãi mãi**, không luồng nào chạy tiếp được, thường do vòng chờ khép kín.

Bốn điều kiện cần để deadlock xảy ra (thiếu một trong bốn thì deadlock không thể xảy ra):

1. **Loại trừ lẫn nhau (mutual exclusion)**: tài nguyên chỉ cho một luồng giữ tại một thời điểm.
2. **Giữ và chờ (hold and wait)**: luồng đang giữ tài nguyên này lại đi chờ xin thêm tài nguyên khác.
3. **Không thể cướp quyền (no preemption)**: không ai có thể ép luồng khác nhả tài nguyên nó đang giữ.
4. **Chờ vòng tròn (circular wait)**: tồn tại một chuỗi luồng chờ nhau khép kín (A chờ B, B chờ A).

**Cách phòng tránh phổ biến nhất**: phá vỡ điều kiện chờ vòng tròn bằng cách luôn khóa các tài nguyên theo **cùng một thứ tự cố định**, dù thứ tự đó do luồng nào yêu cầu.

</details>

**4. Đoạn code sau chạy 2 luồng, mỗi luồng tăng biến `count` 100.000 lần. Kết quả in ra có luôn là `200000` không? Giải thích.**

```java
class Dem {
    int count = 0;
    void tang() { count++; }
}

public class Test {
    public static void main(String[] args) throws InterruptedException {
        Dem dem = new Dem();
        Runnable job = () -> { for (int i = 0; i < 100000; i++) dem.tang(); };
        Thread t1 = new Thread(job), t2 = new Thread(job);
        t1.start(); t2.start();
        t1.join(); t2.join();
        System.out.println(dem.count);
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** Kết quả in ra thường **nhỏ hơn** `200000` (và có thể khác nhau ở mỗi lần chạy).

- `count++` không phải một thao tác nguyên tử (atomic) — nó gồm đọc, cộng, ghi. Khi hai luồng cùng thực hiện xen kẽ, một số lần tăng bị "mất" (xem câu 1).
- **Cách sửa**: thêm `synchronized` vào phương thức `tang()`, hoặc thay `count` bằng `AtomicInteger` với `incrementAndGet()`, để đảm bảo mỗi lần tăng diễn ra **trọn vẹn**, không bị luồng khác xen vào giữa chừng.

</details>

**5. Đoạn code sau có chạy xong được không? Vì sao? Hãy sửa lại để tránh vấn đề này.**

```java
static final Object thia = new Object();
static final Object dia = new Object();

new Thread(() -> {
    synchronized (thia) { synchronized (dia) { System.out.println("An ăn"); } }
}).start();

new Thread(() -> {
    synchronized (dia) { synchronized (thia) { System.out.println("Bình ăn"); } }
}).start();
```

<details className="qa">
<summary>Xem đáp án</summary>

**Có khả năng cao bị treo mãi mãi (deadlock)**, tùy vào thời điểm hai luồng chạy tới đâu.

- Nếu luồng An **vừa giữ được `thia`** và luồng Bình **vừa giữ được `dia`** cùng lúc, sau đó An chờ `dia` (đang bị Bình giữ) trong khi Bình chờ `thia` (đang bị An giữ) — cả hai chờ nhau vô thời hạn, đây chính là **chờ vòng tròn (circular wait)**.
- **Cách sửa**: đảm bảo cả hai luồng luôn khóa theo **cùng một thứ tự** — ví dụ luôn khóa `thia` trước rồi mới đến `dia`:

```java
new Thread(() -> {
    synchronized (dia) { synchronized (thia) { System.out.println("Bình ăn"); } }
}).start();
// Sửa lại: khóa thia trước, dia sau — giống thứ tự luồng An
new Thread(() -> {
    synchronized (thia) { synchronized (dia) { System.out.println("Bình ăn"); } }
}).start();
```

Với cùng thứ tự khóa, không bao giờ xảy ra tình huống mỗi luồng giữ một nửa rồi chờ nửa còn lại của nhau.

</details>

**6. Khi nào nên dùng `AtomicInteger` thay vì `synchronized` cho một biến đếm dùng chung?**

<details className="qa">
<summary>Xem đáp án</summary>

Nên dùng `AtomicInteger` khi thao tác chỉ đơn giản là **một phép cập nhật nguyên tử duy nhất** trên **một biến số** (tăng, giảm, cộng dồn, so sánh-và-đổi), vì:

```java
AtomicInteger count = new AtomicInteger(0);
count.incrementAndGet(); // Nhanh hơn synchronized: dùng CAS (Compare-And-Swap) ở tầng phần cứng
```

- `AtomicInteger` dùng kỹ thuật **CAS (Compare-And-Swap)** không cần khóa (lock-free), thường **nhanh hơn** `synchronized` vì tránh được chi phí tạm dừng/đánh thức luồng khi có tranh chấp thấp tới trung bình.
- Nên quay lại dùng `synchronized`/`Lock` khi cần đồng bộ hóa **nhiều bước, nhiều biến liên quan với nhau** trong cùng một vùng tới hạn (ví dụ vừa kiểm tra số dư vừa trừ tiền) — `Atomic` chỉ bảo vệ được đúng một biến, không bảo vệ được tính nhất quán giữa nhiều biến.

</details>

**7. So sánh `ConcurrentHashMap`, `Collections.synchronizedMap()` và `Hashtable`.**

<details className="qa">
<summary>Xem đáp án</summary>

| | `ConcurrentHashMap` | `Collections.synchronizedMap(new HashMap<>())` | `Hashtable` |
|---|---|---|---|
| Cơ chế khóa | Chia nhỏ khóa theo từng phân đoạn/bucket (fine-grained locking) | Một khóa `synchronized` duy nhất bọc toàn bộ map | Một khóa `synchronized` duy nhất trên mọi phương thức |
| Hiệu năng đọc đồng thời | Cao — nhiều luồng đọc gần như không chặn nhau | Thấp hơn — mọi thao tác đều phải xếp hàng qua một khóa | Thấp — tương tự `synchronizedMap` |
| Cho phép key/value `null` | Không | Tùy theo `Map` gốc (HashMap thì cho phép) | Không |
| Độ "hiện đại" | Được thiết kế riêng cho đa luồng hiệu năng cao (Java 5+) | Chỉ là một "wrapper" bọc quanh map thường | Lớp cũ từ Java 1.0, hiếm dùng trong code mới |

**Khuyến nghị hiện tại**: dùng `ConcurrentHashMap` cho hầu hết nhu cầu cache/map đa luồng — vừa an toàn vừa có hiệu năng tốt hơn nhiều nhờ khóa chia nhỏ thay vì khóa toàn bộ map.

</details>

**8. `ExecutorService`/thread pool mang lại lợi ích gì so với việc tự `new Thread()` cho mỗi tác vụ? Kể tên vài loại pool phổ biến từ `Executors`.**

<details className="qa">
<summary>Xem đáp án</summary>

Lợi ích chính:

- **Tái sử dụng luồng**: tránh chi phí tạo/hủy luồng liên tục (tương tự thuê nhân viên cố định thay vì tuyển-sa thải mỗi việc).
- **Giới hạn số luồng đồng thời**: tránh tạo quá nhiều luồng làm quá tải máy.
- **Quản lý vòng đời tập trung**: `submit()`, `shutdown()`, theo dõi `Future` kết quả dễ dàng.

Một số loại pool phổ biến trong `Executors`:

- `newFixedThreadPool(n)` — số luồng cố định, việc dư xếp hàng chờ.
- `newCachedThreadPool()` — tạo luồng mới khi cần, tái sử dụng luồng rảnh, tự hủy luồng nhàn rỗi lâu.
- `newSingleThreadExecutor()` — chỉ một luồng, các việc chạy tuần tự nhưng vẫn theo mô hình bất đồng bộ (submit rồi lấy `Future`).

</details>

**9. Phân biệt `shutdown()` và `shutdownNow()` của `ExecutorService`.**

<details className="qa">
<summary>Xem đáp án</summary>

| | `shutdown()` | `shutdownNow()` |
|---|---|---|
| Việc đang chạy | Cho chạy tiếp tới khi xong | Cố gắng **ngắt (`interrupt`)** các luồng đang chạy |
| Việc đang xếp hàng chờ | Vẫn được xử lý hết trước khi tắt | **Không xử lý** — trả về danh sách các việc chưa kịp chạy |
| Nhận việc mới | Từ chối ngay lập tức | Từ chối ngay lập tức |

```java
pool.shutdown();           // "Nhẹ nhàng": không nhận việc mới, chờ việc cũ xong rồi tắt
List<Runnable> conLai = pool.shutdownNow(); // "Cứng rắn": cố dừng ngay, trả về việc chưa chạy
pool.awaitTermination(5, TimeUnit.SECONDS); // Chờ tối đa 5 giây để pool tắt hẳn
```

`awaitTermination()` thường được gọi sau `shutdown()` để **chờ** pool thực sự tắt hẳn (có timeout), tránh chương trình kết thúc khi các việc còn dang dở.

</details>

**10. `Lock.tryLock()` giải quyết vấn đề gì mà `synchronized` không làm được?**

<details className="qa">
<summary>Xem đáp án</summary>

`tryLock()` cho phép một luồng **thử xin khóa mà không bị chặn vô thời hạn**: nếu khóa đang bị giữ, luồng có thể **chọn làm việc khác** thay vì phải đứng chờ (khác hẳn `synchronized`, luôn chặn luồng cho tới khi lấy được khóa).

```java
if (lock.tryLock()) {
    try {
        // Lấy khóa thành công, xử lý
    } finally {
        lock.unlock();
    }
} else {
    // Không lấy được khóa ngay -> làm việc khác, hoặc báo bận, thay vì đứng chờ vô thời hạn
    System.out.println("Đang bận, thử lại sau");
}
```

- Có bản có `timeout`: `tryLock(thoiGian, đơnVị)` — chờ tối đa một khoảng thời gian rồi từ bỏ nếu vẫn chưa lấy được khóa.
- Ứng dụng thực tế: giúp **tránh deadlock** trong một số thiết kế (nếu không lấy được khóa thứ hai trong thời gian cho phép, luồng có thể chủ động nhả khóa thứ nhất rồi thử lại từ đầu), hoặc để hệ thống phản hồi nhanh thay vì "đơ" khi tài nguyên đang bận.

</details>

**11. Tình huống: bạn cần một bộ đếm (counter) hiệu năng cực cao, được hàng chục luồng cùng tăng liên tục (ví dụ đếm số request/giây), và chỉ thỉnh thoảng mới cần đọc tổng. `AtomicInteger` có phải lựa chọn tốt nhất? Có lựa chọn nào tốt hơn không?**

<details className="qa">
<summary>Xem đáp án</summary>

Với tranh chấp (contention) rất cao — hàng chục luồng cùng tăng một `AtomicInteger` liên tục — hiệu năng có thể giảm vì nhiều luồng liên tục **thử lại CAS** khi va chạm nhau trên cùng một biến.

**`LongAdder`** (trong `java.util.concurrent.atomic`, từ Java 8) thường là lựa chọn tốt hơn cho đúng tình huống này:

```java
LongAdder counter = new LongAdder();
counter.increment();       // Nhiều luồng tăng, hầu như không tranh chấp
long tong = counter.sum(); // Chỉ khi CẦN đọc tổng mới cộng dồn lại
```

- `LongAdder` chia giá trị nội bộ thành **nhiều "ô" (cell)** riêng biệt; mỗi luồng thường tăng vào một ô khác nhau (giảm tranh chấp), chỉ khi gọi `sum()` mới cộng dồn tất cả các ô lại.
- Đánh đổi: `LongAdder` **không có** các phép `compareAndSet` như `AtomicInteger`, và tốn nhiều bộ nhớ hơn (nhiều ô) khi tranh chấp cao — nó chỉ tối ưu cho đúng use-case "tăng nhiều, đọc tổng ít", không phải bộ đếm đa dụng.
- Nếu tranh chấp thấp hoặc cần các phép so sánh/đổi phức tạp, `AtomicInteger`/`AtomicLong` vẫn là lựa chọn phù hợp hơn.

</details>
