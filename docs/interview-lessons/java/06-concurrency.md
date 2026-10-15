---
sidebar_position: 6
title: "6. Đa luồng (Concurrency)"
---

# 6. Đa luồng (Concurrency)

## 1. Luồng (Threads)

Bài học: [1. Luồng (Threads)](../../java/06-concurrency/1_threads.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Phân biệt Process (tiến trình) và Thread (luồng). Khi JVM chạy một chương trình Java, luồng đầu tiên tên là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Process (tiến trình)**: một chương trình đang chạy, có **vùng nhớ riêng**, không chia sẻ với tiến trình khác.
- **Thread (luồng)**: một mạch thực thi bên trong một tiến trình; nhiều luồng trong **cùng một tiến trình** thì **dùng chung vùng nhớ** (cùng biến static, cùng đối tượng heap).
- Khi JVM chạy chương trình Java, nó tạo một tiến trình và luôn có sẵn ít nhất một luồng tên **`main`** — đây là nơi phương thức `main()` thực thi.

</details>

**2. So sánh hai cách tạo luồng: kế thừa `Thread` và cài đặt `Runnable`. Vì sao `Runnable` được khuyến khích hơn?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `extends Thread` | `implements Runnable` |
|---|---|---|
| Kế thừa | Chiếm mất suất kế thừa duy nhất của Java | Không chiếm — vẫn có thể `extends` lớp khác |
| Tách biệt "công việc" và "cơ chế chạy" | Trộn lẫn — lớp vừa là công việc vừa là luồng | Tách bạch — `Runnable` chỉ là công việc, `Thread` là cơ chế thực thi |
| Tái sử dụng | Khó tái sử dụng công việc cho `ExecutorService` | Dễ — cùng một `Runnable` truyền được vào `Thread` hoặc `ExecutorService` |

`Runnable` được khuyến khích vì Java chỉ cho kế thừa **một** lớp — nếu đã `extends Thread`, lớp đó không thể kế thừa thêm lớp nào khác. `Runnable` là interface nên linh hoạt hơn nhiều, đồng thời tách bạch rõ ràng "việc cần làm" khỏi "cơ chế chạy việc đó".

</details>

**3. Đoạn code sau in ra gì? Vì sao?**

```java
public class Test {
    public static void main(String[] args) {
        Thread t = new Thread(() ->
            System.out.println("Chạy trong: " + Thread.currentThread().getName()));

        t.run();
        t.start();
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

In ra hai dòng: `Chạy trong: main` rồi `Chạy trong: Thread-0`.

- `t.run()` chỉ là một **lời gọi phương thức bình thường**, chạy ngay trong luồng gọi nó — ở đây là luồng `main` — nên `Thread.currentThread().getName()` trả về `"main"`. **Không có luồng mới nào được tạo.**
- `t.start()` mới thực sự **tạo một luồng mới** (`"Thread-0"`) và chạy `run()` bên trong luồng mới đó, song song với luồng gọi.
- Đây là lỗi kinh điển của người mới: gọi nhầm `run()` khi tưởng đang tạo đa luồng, nhưng thực chất code vẫn chạy tuần tự.

</details>

**4. Phân biệt `Thread.sleep()` và `Object.wait()`. Vì sao chúng không thể dùng thay thế cho nhau?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `Thread.sleep(ms)` | `object.wait()` |
|---|---|---|
| Thuộc về | Static method của lớp `Thread` | Instance method của `Object` (mọi object đều có) |
| Có cần giữ lock không | Không cần — có thể gọi ở bất cứ đâu | **Bắt buộc** gọi trong khối `synchronized` giữ lock của chính object đó, nếu không ném `IllegalMonitorStateException` |
| Có nhả lock khi chờ không | **Không** — nếu đang giữ lock, vẫn giữ nguyên trong lúc ngủ | **Có** — nhả lock ra cho luồng khác dùng trong lúc chờ |
| Cách đánh thức | Tự dậy sau đúng thời gian chỉ định | Cần luồng khác gọi `notify()`/`notifyAll()` trên cùng object (hoặc hết `timeout` nếu dùng `wait(ms)`) |
| Mục đích | Tạm dừng vô điều kiện một khoảng thời gian | Chờ một **điều kiện/tín hiệu** cụ thể từ luồng khác (mô hình producer-consumer) |

`sleep()` là "ngủ theo đồng hồ", còn `wait()` là "chờ tín hiệu và sẵn sàng nhường chỗ cho người khác trong lúc chờ" — hai cơ chế phục vụ hai mục đích khác nhau, không thay thế được cho nhau.

</details>

**5. Đoạn code sau in ra dòng cuối cùng trước hay sau khi `worker` chạy xong? Giải thích.**

```java
public class Test {
    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> {
            for (int i = 1; i <= 3; i++) System.out.println("Việc " + i);
        });

        worker.start();
        worker.join();

        System.out.println("Main kết thúc");
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

`"Main kết thúc"` **luôn** in ra **sau** khi cả ba dòng `"Việc 1"`, `"Việc 2"`, `"Việc 3"` đã in xong.

- `worker.join()` khiến luồng gọi nó (ở đây là `main`) **đứng chờ** cho đến khi luồng `worker` chạy xong hoàn toàn mới được đi tiếp.
- Nếu bỏ dòng `worker.join();`, thứ tự giữa `"Việc ..."` và `"Main kết thúc"` sẽ **không xác định** (có thể xen kẽ hoặc "Main kết thúc" in trước), vì hai luồng chạy song song không đồng bộ với nhau.

</details>

**6. Mô tả các trạng thái chính trong vòng đời của một `Thread` trong Java.**

<details className="qa">
<summary>Xem đáp án</summary>

Một luồng đi qua các trạng thái (`Thread.State`) sau:

- **`NEW`**: vừa `new Thread()`, chưa gọi `start()`.
- **`RUNNABLE`**: đã `start()`, đang chạy hoặc sẵn sàng chạy (chờ CPU cấp phát).
- **`BLOCKED`**: đang chờ để lấy được một khóa `synchronized` mà luồng khác đang giữ.
- **`WAITING`**: đang chờ vô thời hạn tín hiệu từ luồng khác (ví dụ gọi `join()` không tham số, hoặc `wait()` không tham số).
- **`TIMED_WAITING`**: đang chờ có giới hạn thời gian (ví dụ `sleep(ms)`, `join(ms)`, `wait(ms)`).
- **`TERMINATED`**: `run()` đã kết thúc (bình thường hoặc do exception không bắt được).

Hiểu đúng các trạng thái này giúp đọc được thread dump khi debug ứng dụng bị treo hoặc chạy chậm bất thường.

</details>

**7. Đoạn code sau xảy ra chuyện gì?**

```java
Thread t = new Thread(() -> System.out.println("Chạy"));
t.start();
t.start(); // Gọi start() lần thứ hai
```

<details className="qa">
<summary>Xem đáp án</summary>

Ném ra **`IllegalThreadStateException`** ở lần gọi `start()` thứ hai.

- Mỗi đối tượng `Thread` chỉ có thể `start()` **đúng một lần duy nhất** trong toàn bộ vòng đời của nó — một khi đã rời khỏi trạng thái `NEW` (dù đang chạy hay đã `TERMINATED`), gọi `start()` lại là bất hợp lệ.
- Muốn chạy lại cùng một công việc, phải tạo một đối tượng `Thread` **mới** (ví dụ bọc cùng một `Runnable` vào `new Thread(runnable)` khác), chứ không thể tái sử dụng object `Thread` cũ.

</details>

**8. Cơ chế `interrupt()` hoạt động thế nào? Nó có ép buộc dừng ngay lập tức một luồng đang chạy không?**

<details className="qa">
<summary>Xem đáp án</summary>

`interrupt()` **không** ép buộc dừng luồng ngay lập tức — nó chỉ đặt một **cờ interrupted** bên trong luồng đích, coi như một **tín hiệu yêu cầu hợp tác dừng lại (cooperative cancellation)**.

```java
Thread worker = new Thread(() -> {
    while (!Thread.currentThread().isInterrupted()) {
        // Công việc phải TỰ kiểm tra cờ interrupted định kỳ
    }
    System.out.println("Đã dừng do bị interrupt");
});
worker.start();
worker.interrupt(); // Chỉ đặt cờ, không ép dừng ngay
```

- Nếu luồng đang ở trạng thái chờ (`sleep()`, `wait()`, `join()`), việc gọi `interrupt()` sẽ khiến các phương thức đó **ném ngay `InterruptedException`**, đánh thức luồng dậy sớm.
- Nếu luồng đang chạy một vòng lặp tính toán bình thường (không gọi các phương thức chờ ở trên), nó sẽ **không tự dừng** trừ khi code bên trong **chủ động kiểm tra** `Thread.currentThread().isInterrupted()` và tự thoát vòng lặp.
- Đây là lý do việc thiết kế các tác vụ dài cần chủ động kiểm tra cờ interrupt định kỳ để có thể dừng "sạch sẽ" khi được yêu cầu.

</details>

**9. `ThreadLocal` là gì? Nêu một tình huống thực tế nên dùng, và một rủi ro cần lưu ý khi dùng chung với thread pool.**

<details className="qa">
<summary>Xem đáp án</summary>

`ThreadLocal<T>` cho phép mỗi luồng giữ **một bản sao giá trị riêng** của cùng một biến — luồng này đọc/ghi giá trị của nó, hoàn toàn không ảnh hưởng tới giá trị mà luồng khác thấy.

```java
private static final ThreadLocal<SimpleDateFormat> DINH_DANG =
    ThreadLocal.withInitial(() -> new SimpleDateFormat("dd/MM/yyyy"));
// Mỗi luồng có một SimpleDateFormat riêng, tránh chia sẻ đối tượng không thread-safe này
```

- **Tình huống thực tế**: lưu thông tin theo từng request trong web server (ví dụ userId đang đăng nhập, transaction hiện tại) mà không cần truyền tham số qua hàng chục lớp gọi nhau; hoặc giữ các đối tượng không thread-safe như `SimpleDateFormat` riêng cho mỗi luồng.
- **Rủi ro với thread pool**: các luồng trong `ExecutorService` được **tái sử dụng** cho nhiều tác vụ khác nhau. Nếu quên gọi `remove()` sau khi dùng xong, giá trị `ThreadLocal` cũ có thể **rò rỉ sang tác vụ tiếp theo** chạy trên cùng luồng đó (dữ liệu "lẫn" giữa các request), đồng thời gây rò rỉ bộ nhớ (memory leak) vì giá trị không bao giờ được giải phóng.

</details>

**10. Tình huống: server cần xử lý 1.000 kết nối đồng thời, mỗi kết nối chỉ thực hiện vài thao tác I/O ngắn. Có nên tạo `new Thread()` riêng cho mỗi kết nối không? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không nên** tạo `new Thread()` trực tiếp cho từng kết nối trong trường hợp số lượng lớn và lặp lại liên tục, vì:

- Mỗi platform thread tốn khá nhiều bộ nhớ (khoảng 1MB stack) và chi phí tạo/hủy luồng không hề rẻ — tạo hàng nghìn luồng riêng lẻ liên tục có thể khiến máy quá tải hoặc cạn tài nguyên hệ điều hành.
- Giải pháp thực tế phổ biến trước Java 21: dùng **`ExecutorService`/thread pool** (bài tiếp theo) để **tái sử dụng** một số lượng luồng cố định, xếp hàng các tác vụ dư ra.
- Giải pháp hiện đại hơn (Java 21+): dùng **virtual thread** (bài cuối chương) — cho phép tạo rất nhiều luồng "ảo" siêu nhẹ mà không lo quá tải, đặc biệt phù hợp với khối lượng lớn tác vụ chờ I/O như mô tả ở đây.

</details>

**11. `Runnable` không cho phép trả về giá trị hay ném checked exception ra ngoài. Interface nào trong `java.util.concurrent` khắc phục hạn chế này, và dùng kèm với gì để lấy kết quả?**

<details className="qa">
<summary>Xem đáp án</summary>

Interface **`Callable<V>`** (trong `java.util.concurrent`) khắc phục hai hạn chế của `Runnable`:

```java
import java.util.concurrent.Callable;

Callable<Integer> tinhToan = () -> {
    Thread.sleep(1000);
    return 42; // Callable CÓ THỂ trả về giá trị
    // và có thể throws checked exception (ví dụ InterruptedException) mà không cần try-catch trong lambda
};
```

- Khác với `Runnable.run()` (trả về `void`, không khai báo `throws` được checked exception), `Callable<V>.call()` **trả về một giá trị kiểu `V`** và **được phép khai báo `throws Exception`**.
- Để lấy được kết quả, `Callable` thường được nộp (`submit`) cho một `ExecutorService`, trả về một **`Future<V>`** — gọi `future.get()` sẽ **chờ** cho đến khi tác vụ hoàn tất và lấy kết quả (hoặc ném lại exception nếu tác vụ đó gặp lỗi, bọc trong `ExecutionException`).

</details>

---

## 2. Đa luồng cơ bản (Concurrency)

Bài học: [2. Đa luồng cơ bản (Concurrency)](../../java/06-concurrency/2_concurrency-co-ban.md)

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

---

## 3. Mô hình bộ nhớ Java (Java Memory Model)

Bài học: [3. Mô hình bộ nhớ Java (Java Memory Model)](../../java/06-concurrency/3_java-memory-model.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Java Memory Model (JMM) là gì? Gốc rễ vật lý nào khiến các lỗi "hiển thị" (visibility) xảy ra?**

<details className="qa">
<summary>Xem đáp án</summary>

**JMM** là bộ quy tắc định nghĩa **khi nào** một luồng chắc chắn nhìn thấy thay đổi mà luồng khác vừa ghi lên một biến chia sẻ.

Gốc rễ nằm ở phần cứng: để chạy nhanh, mỗi nhân CPU giữ một **cache riêng** gần nó, và có thể giữ bản sao của biến trong cache đó thay vì luôn đọc/ghi trực tiếp bộ nhớ chính (RAM). Nếu luồng A ghi một biến nhưng giá trị mới chỉ nằm trong cache của A, luồng B (chạy trên nhân khác) đọc từ cache riêng của B có thể vẫn thấy **giá trị cũ** — đây gọi là vấn đề **visibility (hiển thị)**.

</details>

**2. "Happens-before" là gì? Nêu ít nhất ba quy tắc happens-before quan trọng.**

<details className="qa">
<summary>Xem đáp án</summary>

**Happens-before** là quan hệ: nếu hành động A "happens-before" hành động B, thì **mọi thay đổi bộ nhớ do A tạo ra chắc chắn được B nhìn thấy** (và thứ tự đó được đảm bảo, không bị JIT/CPU đảo lộn theo cách phá vỡ quan hệ này).

Một số quy tắc quan trọng:

- Các lệnh **trong cùng một luồng** luôn "happens-before" nhau theo đúng thứ tự viết trong code (program order).
- Việc **mở khóa** (`unlock`) một `synchronized` happens-before lần **khóa** (`lock`) tiếp theo trên cùng khóa đó (của luồng khác).
- Việc **ghi** một biến `volatile` happens-before lần **đọc** biến đó sau này.
- `thread.start()` happens-before mọi hành động bên trong luồng `thread` đó.
- Mọi hành động bên trong một luồng happens-before thời điểm luồng khác `join()` xong nó thành công.

</details>

**3. Đoạn code sau có thể chạy mãi mãi không dừng dù trông như phải dừng. Giải thích vì sao, và cách sửa.**

```java
public class Test {
    static boolean dungLai = false;

    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> {
            while (!dungLai) {
                // vòng lặp rỗng
            }
            System.out.println("Đã dừng");
        });
        worker.start();

        Thread.sleep(1000);
        dungLai = true;
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

Có thể **treo mãi mãi**, vì `dungLai` không có `volatile`.

- Luồng `worker` có thể đọc `dungLai` **một lần** vào thanh ghi/cache của nó (thấy `false`), và JIT compiler hoàn toàn có quyền tối ưu hóa vòng lặp để **không đọc lại** biến này từ bộ nhớ chính trong các lần lặp sau — vì theo góc nhìn của trình biên dịch, không có gì (mà nó biết) thay đổi giá trị đó ở giữa vòng lặp.
- Dù luồng `main` đã ghi `dungLai = true` vào bộ nhớ chính, không có **quan hệ happens-before** nào được thiết lập giữa lần ghi đó và các lần đọc của `worker`, nên JMM **không đảm bảo** `worker` sẽ thấy giá trị mới — có thể thấy ngay, có thể không bao giờ thấy, tùy JVM/phần cứng.
- **Cách sửa**: thêm `volatile` cho `dungLai` (`static volatile boolean dungLai`), thiết lập quan hệ happens-before giữa ghi và đọc, đảm bảo `worker` luôn thấy giá trị mới nhất.

</details>

**4. "Reordering" (sắp xếp lại lệnh) là gì? Vì sao nó có thể gây lỗi trong đoạn code sau nếu thiếu đồng bộ hóa?**

```java
class CauHinh {
    private boolean sanSang = false;
    private int giaTri = 0;

    void chuanBi() {
        giaTri = 42;      // (1)
        sanSang = true;   // (2)
    }

    int doc() {
        if (sanSang) {
            return giaTri; // Có thể đọc phải 0!
        }
        return -1;
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

**Reordering** là việc trình biên dịch (compiler) hoặc CPU **thay đổi thứ tự thực thi thực tế** của các lệnh so với thứ tự viết trong code nguồn, miễn là điều đó không làm thay đổi kết quả **trong phạm vi một luồng đơn lẻ** — một tối ưu hóa hợp lệ và phổ biến để tăng hiệu năng.

- Trong ví dụ trên, lệnh `(2) sanSang = true` **về lý thuyết có thể bị đẩy lên chạy trước** lệnh `(1) giaTri = 42` (từ góc nhìn của luồng khác quan sát), vì trong một luồng đơn, thứ tự này không ảnh hưởng gì tới hành vi của chính luồng đó.
- Hệ quả: một luồng khác gọi `doc()` có thể thấy `sanSang == true` **nhưng `giaTri` vẫn là `0`** — đọc phải trạng thái "nửa vời" chưa từng tồn tại theo ý người viết code.
- **Cách sửa**: đặt `volatile` cho `sanSang`. Việc ghi biến `volatile` thiết lập một "rào chắn bộ nhớ" (memory barrier) cấm reorder các lệnh ghi thường **trước** nó bị đẩy ra sau nó — đảm bảo `giaTri = 42` chắc chắn hoàn tất trước khi `sanSang = true` được thấy bởi luồng khác.

</details>

**5. So sánh ba cách bảo đảm an toàn khi chia sẻ biến giữa các luồng: `volatile`, `synchronized`, và các lớp `Atomic`.**

<details className="qa">
<summary>Xem đáp án</summary>

| | `volatile` | `synchronized` | `Atomic` (`AtomicInteger`...) |
|---|---|---|---|
| Bảo đảm visibility | Có | Có | Có |
| Bảo đảm atomicity (thao tác nhiều bước) | Không | Có | Chỉ cho đúng thao tác nó cung cấp (increment, CAS...) |
| Có khóa/chặn luồng khác | Không | Có | Không (dùng CAS, lock-free) |
| Phù hợp nhất cho | Cờ trạng thái đơn giản, một luồng ghi nhiều luồng đọc | Vùng tới hạn (critical section) nhiều bước, nhiều biến liên quan | Bộ đếm, cập nhật nguyên tử trên một biến số |

Cả ba đều giải quyết vấn đề **visibility**, nhưng khác nhau về mức độ hỗ trợ **atomicity** và chi phí hiệu năng.

</details>

**6. Vì sao một chương trình đa luồng chạy đúng trên máy của lập trình viên chưa chắc đã đúng khi triển khai ở môi trường khác?**

<details className="qa">
<summary>Xem đáp án</summary>

Các lỗi liên quan tới JMM (visibility, reordering) **phụ thuộc vào**:

- **Kiến trúc CPU và số nhân**: máy nhiều nhân, nhiều cấp cache dễ bộc lộ lỗi visibility hơn máy một nhân (nơi mọi luồng thực chất chia sẻ cùng cache).
- **Phiên bản JVM và mức tối ưu hóa của JIT compiler**: các bản JVM khác nhau có thể áp dụng reordering khác nhau ở các mức tối ưu khác nhau.
- **Thời điểm và tải hệ thống**: lỗi race condition/reordering thường chỉ bộc lộ khi có đủ áp lực tải hoặc đúng thời điểm "xui rủi" trùng khớp giữa các luồng.

Vì vậy, "chạy đúng trên máy mình" **không phải bằng chứng** rằng code thread-safe — phải dựa vào việc tuân thủ đúng các quy tắc JMM (happens-before) khi thiết kế, chứ không dựa vào quan sát thực nghiệm trên một môi trường cụ thể.

</details>

**7. "Safe publication" (xuất bản an toàn) là gì? Vì sao khai báo field là `final` giúp ích cho việc này?**

<details className="qa">
<summary>Xem đáp án</summary>

**Safe publication** là việc đảm bảo khi một luồng khác lần đầu nhìn thấy một object, nó nhìn thấy object đó ở trạng thái **đã khởi tạo đầy đủ**, không phải trạng thái "nửa vời" (ví dụ field đã có tên class nhưng field khác vẫn `null` dù constructor đã gán).

- JMM có một đảm bảo đặc biệt: nếu một field được khai báo **`final`**, giá trị của nó được gán xong **trong constructor** sẽ chắc chắn "hiển thị" đúng cho mọi luồng khác nhìn thấy object đó **sau khi constructor kết thúc** — kể cả khi object được truyền qua các luồng khác **mà không cần thêm `synchronized`/`volatile`**.
- Đây là lý do các lớp bất biến (immutable, toàn field `final`, không có setter) được coi là **an toàn tuyệt đối để chia sẻ giữa nhiều luồng** mà không cần thêm bất kỳ cơ chế đồng bộ hóa nào — miễn là tham chiếu tới object đó được truyền đi **sau khi** constructor đã chạy xong hoàn toàn (không để lộ `this` ra ngoài khi constructor còn đang chạy dở).

</details>

**8. Quan hệ happens-before của `start()` và `join()` có ý nghĩa thực tế gì khi thiết kế chương trình đa luồng?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`thread.start()` happens-before mọi hành động bên trong `thread`**: nghĩa là mọi thứ luồng cha chuẩn bị (gán field, khởi tạo dữ liệu) **trước khi gọi `start()`** chắc chắn được luồng con nhìn thấy đầy đủ, không cần thêm `volatile`/`synchronized` cho riêng việc này.
- **Mọi hành động trong `thread` happens-before khi luồng khác `join()` xong nó**: nghĩa là sau khi `worker.join()` trả về, luồng gọi `join()` chắc chắn nhìn thấy **mọi thay đổi** mà `worker` đã thực hiện, không có rủi ro đọc phải dữ liệu "nửa vời" của `worker`.
- Ý nghĩa thực tế: đây là lý do mẫu "chuẩn bị dữ liệu → `start()` luồng xử lý → `join()` chờ xong → đọc kết quả" luôn **an toàn về mặt visibility** mà không cần thêm cơ chế đồng bộ nào khác — `start()`/`join()` tự thân đã tạo ra đủ quan hệ happens-before cần thiết.

</details>

**9. Trong mẫu Singleton "double-checked locking" dưới đây, vì sao field `instance` phải khai báo `volatile`?**

```java
class Singleton {
    private static volatile Singleton instance;

    static Singleton getInstance() {
        if (instance == null) {              // Kiểm tra lần 1 (không khóa, cho nhanh)
            synchronized (Singleton.class) {
                if (instance == null) {       // Kiểm tra lần 2 (có khóa, tránh tạo trùng)
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

Nếu bỏ `volatile`, dòng `instance = new Singleton();` có thể bị **reorder**: việc gán tham chiếu `instance` trỏ tới vùng nhớ mới có thể xảy ra **trước khi** constructor của `Singleton` chạy xong hoàn toàn (do JIT/CPU tối ưu hóa nội bộ việc cấp phát và khởi tạo object).

- Hậu quả: một luồng khác gọi `getInstance()`, thấy `instance != null` ở "Kiểm tra lần 1" (vì tham chiếu đã được gán), và **trả về ngay** một object **chưa được khởi tạo đầy đủ** — dùng nó có thể gây lỗi khó hiểu (field bên trong vẫn là giá trị mặc định).
- `volatile` trên `instance` **cấm việc reorder này**: đảm bảo mọi ghi vào field của object mới (bên trong constructor) chắc chắn hoàn tất **trước** khi tham chiếu `instance` được gán và "hiển thị" cho luồng khác — nhờ đó double-checked locking mới thực sự an toàn (đây là kỹ thuật được chính thức công nhận đúng đắn kể từ JMM được sửa lại ở Java 5).

</details>

**10. Tình huống: bạn cần chia sẻ một object cấu hình (`CauHinh`) được đọc bởi nhiều luồng, nhưng chỉ được ghi (cập nhật) một lần lúc khởi động ứng dụng. Thiết kế nào giúp việc chia sẻ này an toàn mà không cần `synchronized` ở mọi nơi đọc?**

<details className="qa">
<summary>Xem đáp án</summary>

Cách tiếp cận tốt nhất: làm cho `CauHinh` **bất biến (immutable)** và tận dụng **safe publication qua `final`**, kết hợp `volatile` cho biến tham chiếu tới nó:

```java
final class CauHinh {
    private final String url;      // Mọi field đều final -> bất biến
    private final int timeout;

    CauHinh(String url, int timeout) {
        this.url = url;
        this.timeout = timeout;
    } // Sau constructor, nhờ final, object luôn ở trạng thái đầy đủ khi được thấy

    String getUrl() { return url; }
    int getTimeout() { return timeout; }
}

class AppConfig {
    // volatile đảm bảo mọi luồng đọc thấy NGAY tham chiếu mới khi được gán lại
    static volatile CauHinh cauHinhHienTai;
}
```

- Nhờ mọi field của `CauHinh` là `final`, mọi luồng đọc được tham chiếu tới object này (kể cả không qua `synchronized`) đều thấy nó ở trạng thái **hoàn chỉnh**, không bao giờ "nửa vời" (safe publication).
- `volatile` trên biến tham chiếu `cauHinhHienTai` đảm bảo khi có bản cấu hình mới được gán (`AppConfig.cauHinhHienTai = new CauHinh(...)`), mọi luồng đọc **thấy ngay** tham chiếu mới, không bị kẹt với bản cache cũ.
- Cách này **không cần `synchronized`** ở từng nơi đọc, vì bản thân dữ liệu bất biến không có gì để tranh chấp (đọc bao nhiêu luồng cùng lúc cũng an toàn) — chỉ riêng bước "thay tham chiếu" mới cần `volatile` để đảm bảo hiển thị.

</details>

---

## 4. Từ khóa volatile

Bài học: [4. Từ khóa volatile](../../java/06-concurrency/4_volatile-keyword.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Từ khóa `volatile` làm gì? Đặt nó ở đâu trong khai báo biến?**

<details className="qa">
<summary>Xem đáp án</summary>

`volatile` là một từ khóa đặt **trước kiểu dữ liệu** của biến, buộc biến đó luôn được **đọc và ghi trực tiếp tại bộ nhớ chính (RAM)**, không dùng bản sao trong cache riêng của CPU.

```java
private volatile boolean sanSang = false;
```

Nhờ vậy, thay đổi mà một luồng ghi vào biến này **luôn hiển thị ngay** với các luồng khác đọc sau đó — giải quyết đúng vấn đề **visibility** đã học ở bài Java Memory Model.

</details>

**2. `volatile` bảo đảm điều gì và KHÔNG bảo đảm điều gì?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Bảo đảm visibility (hiển thị)**: mọi lần ghi đẩy thẳng xuống bộ nhớ chính, mọi lần đọc lấy thẳng từ bộ nhớ chính — luồng khác luôn thấy giá trị mới nhất.
- **KHÔNG bảo đảm atomicity (tính nguyên tử)**: với các thao tác gồm nhiều bước phụ thuộc lẫn nhau (đọc rồi ghi dựa trên giá trị vừa đọc, ví dụ `count++`), `volatile` **không** ngăn được việc hai luồng xen kẽ nhau giữa các bước đó — vẫn có thể xảy ra race condition.

</details>

**3. So sánh `volatile` và `synchronized` theo các tiêu chí: visibility, atomicity, và có khóa (lock) hay không.**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | `volatile` | `synchronized` |
|---|---|---|
| Bảo đảm visibility | Có | Có |
| Bảo đảm atomicity | Không | Có |
| Có khóa, chặn luồng khác chờ | Không | Có (chỉ một luồng vào vùng tới hạn) |
| Tốc độ | Nhanh, nhẹ | Chậm hơn vì có khóa |
| Phù hợp cho | Biến đơn, đọc/ghi độc lập (cờ trạng thái) | Khối lệnh phức tạp, nhiều bước, nhiều biến liên quan |

Ghi nhớ ngắn gọn: `volatile` chỉ lo "nhìn thấy đúng giá trị mới nhất", còn `synchronized` lo cả "nhìn thấy đúng" lẫn "không ai được xen vào giữa chừng".

</details>

**4. Đoạn code sau có luôn in ra đúng `200000` không, dù `count` đã được khai báo `volatile`? Vì sao?**

```java
public class Test {
    private static volatile int count = 0;

    public static void main(String[] args) throws InterruptedException {
        Runnable job = () -> { for (int i = 0; i < 100000; i++) count++; };
        Thread t1 = new Thread(job), t2 = new Thread(job);
        t1.start(); t2.start();
        t1.join(); t2.join();
        System.out.println(count);
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

**Không luôn đúng `200000`** — kết quả thường **nhỏ hơn**, dù `count` là `volatile`.

- `count++` vẫn là một thao tác **ba bước** (đọc, cộng 1, ghi lại). `volatile` chỉ đảm bảo mỗi bước đọc/ghi riêng lẻ đó thấy đúng giá trị mới nhất tại đúng thời điểm nó xảy ra — nhưng **không ngăn** hai luồng cùng đọc một giá trị **trước khi** một trong hai kịp ghi giá trị mới, dẫn tới mất một lần tăng (race condition y hệt trường hợp không có `volatile`).
- **Cách sửa đúng**: dùng `synchronized` bọc quanh thao tác tăng, hoặc thay `count` bằng `AtomicInteger` với `incrementAndGet()` — cả hai đều đảm bảo tính **nguyên tử (atomicity)** cho trọn vẹn thao tác đọc-cộng-ghi, điều mà riêng `volatile` không làm được.

</details>

**5. Đoạn code sau nếu bỏ từ khóa `volatile` khỏi `dangChay` thì có gì thay đổi?**

```java
public class Test {
    private static /* volatile */ boolean dangChay = true;

    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> {
            while (dangChay) { /* bận xử lý */ }
            System.out.println("Worker dừng");
        });
        worker.start();
        Thread.sleep(1000);
        dangChay = false;
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

Nếu bỏ `volatile`, chương trình **có nguy cơ treo vĩnh viễn** — luồng `worker` không bao giờ in ra `"Worker dừng"`.

- Luồng `worker` có thể chỉ đọc `dangChay` **một lần** rồi giữ giá trị `true` đó trong thanh ghi/cache riêng, không đọc lại từ bộ nhớ chính ở các vòng lặp sau (JIT compiler có thể tối ưu hóa theo hướng này vì không thấy dấu hiệu gì bắt nó phải đọc lại).
- Luồng `main` ghi `dangChay = false` vào bộ nhớ chính, nhưng **không có gì đảm bảo** (không có quan hệ happens-before) rằng `worker` sẽ thấy thay đổi này.
- Có `volatile`: mỗi lần kiểm tra điều kiện vòng lặp, `worker` **buộc phải đọc lại từ bộ nhớ chính**, nên sẽ thấy `false` ngay khi `main` ghi vào, và dừng đúng.

</details>

**6. Nếu một biến `volatile` là một **tham chiếu** tới object hoặc mảng (ví dụ `private volatile int[] mang`), `volatile` có bảo đảm visibility cho các phần tử/field **bên trong** object đó khi bị sửa qua tham chiếu không?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** `volatile` chỉ bảo đảm visibility cho **chính bản thân biến tham chiếu** (nghĩa là: gán lại `mang = mangMoi;` thì luồng khác thấy tham chiếu mới ngay) — nó **không** lan tỏa bảo đảm đó vào việc **sửa đổi trực tiếp phần tử/field bên trong** object mà tham chiếu đang trỏ tới.

```java
private static volatile int[] mang = new int[]{1, 2, 3};

// Gán lại toàn bộ tham chiếu -> volatile ĐẢM BẢO luồng khác thấy mảng mới ngay
mang = new int[]{4, 5, 6};

// Sửa MỘT PHẦN TỬ bên trong mảng hiện tại -> volatile KHÔNG đảm bảo visibility cho thay đổi này!
mang[0] = 99;
```

- Đây là một cạm bẫy dễ bị bỏ qua: nhiều người nghĩ đánh dấu `volatile` cho một mảng/object là "an toàn toàn bộ", nhưng thực chất chỉ an toàn cho **thao tác gán lại tham chiếu**. Muốn an toàn cho việc sửa nội dung bên trong, cần `synchronized`, dùng cấu trúc dữ liệu concurrent chuyên dụng (ví dụ `AtomicIntegerArray`), hoặc luôn tạo object/mảng **mới** rồi gán lại tham chiếu thay vì sửa tại chỗ.

</details>

**7. `volatile` có thiết lập quan hệ happens-before không? Nếu có, đó là quan hệ gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Có.** Đây là một trong các quy tắc happens-before quan trọng của JMM: **việc ghi vào một biến `volatile` happens-before mọi lần đọc biến đó sau này** (bởi bất kỳ luồng nào).

- Hệ quả thực tế: không chỉ chính biến `volatile` được đảm bảo hiển thị đúng, mà **mọi thay đổi khác** mà luồng ghi thực hiện **trước** khi ghi biến `volatile` đó cũng "đi kèm" và được luồng đọc nhìn thấy đầy đủ sau khi đọc được giá trị `volatile` mới — đây chính là kỹ thuật đứng sau ví dụ ở bài Java Memory Model (`giaTri = 42;` rồi mới `sanSang = true;` với `sanSang` là `volatile`).
- Nói cách khác, `volatile` không chỉ bảo vệ riêng nó, mà còn đóng vai trò như một "cột mốc đồng bộ" giúp các thay đổi khác xung quanh nó cũng được truyền tải đúng thứ tự.

</details>

**8. Nêu hai điều kiện để một biến phù hợp dùng `volatile` thay vì `synchronized`/`Atomic`.**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng `volatile` khi **đồng thời** thỏa hai điều kiện:

1. Biến chỉ được **một luồng ghi** (các luồng khác chỉ đọc), hoặc nếu nhiều luồng cùng ghi thì việc ghi đó **không phụ thuộc vào giá trị cũ** của biến (ví dụ luôn gán một giá trị cố định/mới hoàn toàn, không phải "giá trị mới = giá trị cũ + 1").
2. Chỉ cần đảm bảo các luồng thấy **giá trị mới nhất**, không cần khóa hay đảm bảo tính nguyên tử cho một chuỗi nhiều thao tác.

Trường hợp điển hình đáp ứng cả hai: cờ trạng thái `boolean` (`dangChay`, `daKhoiTao`), hoặc một tham chiếu cấu hình được gán lại toàn bộ mỗi khi cập nhật.

</details>

**9. Tình huống: bạn cần chia sẻ một object cấu hình được **một luồng cập nhật** (thay hẳn bằng object mới) và **nhiều luồng đọc** liên tục. Nên dùng biến tham chiếu `volatile` hay `AtomicReference`? Có khác biệt thực chất không?**

<details className="qa">
<summary>Xem đáp án</summary>

Với đúng kịch bản "một luồng ghi, nhiều luồng đọc, mỗi lần ghi là thay hẳn toàn bộ tham chiếu", **cả hai đều đảm bảo visibility tương đương** — thực chất `AtomicReference` được cài đặt dựa trên một field `volatile` bên trong.

```java
private static volatile CauHinh cauHinh = CauHinh.macDinh();
// hoặc
private static final AtomicReference<CauHinh> cauHinhRef =
    new AtomicReference<>(CauHinh.macDinh());
```

Khác biệt thực sự chỉ xuất hiện nếu bạn cần thêm các thao tác **nguyên tử phức hợp**:

- Chỉ cần **gán/đọc đơn giản** → `volatile` là đủ, gọn hơn.
- Cần **so sánh-và-đổi (compare-and-set)**, ví dụ "chỉ cập nhật cấu hình mới nếu cấu hình hiện tại đúng là bản mà tôi mong đợi" (tránh ghi đè lẫn nhau khi nhiều luồng cùng cố cập nhật) → dùng `AtomicReference.compareAndSet(cu, moi)`, vì `volatile` đơn thuần không cung cấp thao tác nguyên tử kiểu "kiểm tra rồi mới gán" này.

</details>

---

## 5. Virtual Threads (Luồng ảo)

Bài học: [5. Virtual Threads (Luồng ảo)](../../java/06-concurrency/5_virtual-threads.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Virtual thread là gì? Ra mắt chính thức từ phiên bản Java nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Virtual thread (luồng ảo)** là một loại luồng **siêu nhẹ** do JVM quản lý (không gắn 1-1 với luồng hệ điều hành), ra mắt **chính thức** từ **Java 21** (từng là tính năng preview ở Java 19 và 20). Nó cho phép tạo tới **hàng triệu** luồng mà không làm quá tải máy, đặc biệt hữu ích cho ứng dụng nhiều I/O.

</details>

**2. So sánh platform thread và virtual thread về cách ánh xạ tới OS thread và mức tiêu tốn tài nguyên.**

<details className="qa">
<summary>Xem đáp án</summary>

| | Platform thread | Virtual thread |
|---|---|---|
| Ánh xạ tới OS thread | **1-1 cố định** | Nhiều virtual thread **chia sẻ** một số ít **carrier thread** (là platform thread) |
| Bộ nhớ mỗi luồng | Khoảng vài MB stack | Chỉ vài KB |
| Số lượng tạo được | Vài nghìn trước khi quá tải | Hàng triệu |
| Do ai quản lý | Hệ điều hành | JVM |

</details>

**3. Vì sao virtual thread lại nhẹ đến vậy? Điều gì xảy ra khi một virtual thread gặp thao tác chờ I/O?**

<details className="qa">
<summary>Xem đáp án</summary>

Mấu chốt: khi một virtual thread **chờ I/O** (đọc file, gọi mạng, truy vấn DB), JVM sẽ **"tháo" (unmount)** nó ra khỏi carrier thread (platform thread) đang chạy nó, và **trả carrier thread đó** cho một virtual thread khác đang sẵn sàng chạy sử dụng. Khi dữ liệu I/O đã sẵn sàng, virtual thread được **gắn lại (mount)** vào một carrier thread rảnh (không nhất thiết là carrier thread ban đầu) để tiếp tục chạy.

Nhờ cơ chế này, **một số ít carrier thread có thể phục vụ luân phiên cho hàng chục nghìn virtual thread** đang ở trạng thái chờ cùng lúc — vì phần lớn thời gian của một ứng dụng I/O-bound là ngồi chờ, không thực sự chiếm CPU.

</details>

**4. Kể hai cách tạo virtual thread trong Java 21+.**

<details className="qa">
<summary>Xem đáp án</summary>

```java
// Cách 1: tạo trực tiếp một virtual thread và khởi động ngay
Thread t = Thread.ofVirtual().start(() -> System.out.println("Xin chào"));

// Cách 2: dùng ExecutorService chuyên cho virtual thread — mỗi tác vụ một luồng ảo riêng
try (ExecutorService pool = Executors.newVirtualThreadPerTaskExecutor()) {
    pool.submit(() -> System.out.println("Việc chạy trên virtual thread"));
}
```

`newVirtualThreadPerTaskExecutor()` là cách phổ biến hơn trong thực tế vì nó tích hợp tốt với mô hình `ExecutorService`/`Future` sẵn có, dễ thay thế cho thread pool cũ mà ít phải sửa code xung quanh.

</details>

**5. Vì sao KHÔNG nên gom virtual thread vào một thread pool cố định như `Executors.newFixedThreadPool(n)`?**

<details className="qa">
<summary>Xem đáp án</summary>

Ý nghĩa cốt lõi của virtual thread là: chúng **cực rẻ**, nên triết lý sử dụng đúng là **"mỗi tác vụ một virtual thread mới"**, không cần tái sử dụng như platform thread.

- `newFixedThreadPool(n)` giới hạn số luồng đồng thời ở mức `n` — nếu áp dụng cho virtual thread, bạn **vô tình giới hạn ngược lại** đúng điểm mạnh của nó (khả năng tạo hàng triệu luồng đồng thời), biến virtual thread thành một platform thread "đội lốt" mà không có lợi ích gì thêm.
- Cách dùng đúng: `newVirtualThreadPerTaskExecutor()` — không giới hạn số luồng tùy ý, để JVM tự quản lý việc mount/unmount vào carrier thread bên dưới.

</details>

**6. "Pinning" (ghim luồng ảo) là gì? Vì sao dùng `synchronized` quanh một đoạn chờ I/O dài có thể gây ra hiện tượng này, và cách khắc phục?**

<details className="qa">
<summary>Xem đáp án</summary>

**Pinning** là hiện tượng một virtual thread bị **"ghim chặt"** vào carrier thread của nó trong lúc chờ I/O, thay vì được tháo ra (unmount) để nhường carrier thread cho virtual thread khác — làm mất đi lợi ích chính của mô hình luồng ảo.

- Nguyên nhân phổ biến: khi virtual thread đang ở **bên trong một khối `synchronized`** mà gặp thao tác chờ I/O, JVM (tùy phiên bản) không thể an toàn tháo nó ra (vì phải đảm bảo khóa monitor gắn với đúng carrier thread), nên đành giữ nguyên — carrier thread bị "kẹt" chờ cùng, không phục vụ được virtual thread nào khác trong lúc đó.
- **Cách khắc phục**: thay `synchronized` bằng `java.util.concurrent.locks.Lock` (ví dụ `ReentrantLock`) cho các đoạn code có gọi I/O chờ lâu bên trong vùng khóa — `Lock` không gây pinning theo cách `synchronized` làm.
- **Lưu ý phiên bản**: từ **Java 24** (JEP 491), `synchronized` **không còn gây pinning** nữa. Pinning vẫn xảy ra khi virtual thread đang chạy native method/JNI. Vấn đề trên chủ yếu áp dụng cho Java 21–23.

</details>

**7. Virtual thread có giúp ích cho các tác vụ nặng về tính toán CPU (ví dụ mã hóa, xử lý ảnh, tính toán số học liên tục) không? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không giúp ích đáng kể**, thậm chí không cần thiết.

- Lợi thế của virtual thread nằm ở việc **nhường carrier thread trong lúc chờ I/O** — khi một tác vụ liên tục dùng CPU mà không hề "chờ" gì, nó **không bao giờ nhường chỗ**, nên hàng triệu virtual thread cùng chạy tính toán CPU-bound sẽ tranh nhau đúng số lượng carrier thread giới hạn (thường bằng số nhân CPU) y hệt như platform thread.
- Với tác vụ CPU-bound, cách hợp lý vẫn là dùng **platform thread theo đúng số nhân CPU** (ví dụ `ForkJoinPool` hoặc `newFixedThreadPool` với kích thước gần số core), vì tạo thêm luồng (dù ảo hay thật) không giúp tính toán nhanh hơn khi CPU đã bận rộn hết công suất.

</details>

**8. So sánh cách tiếp cận "virtual thread + code blocking tuần tự" với mô hình lập trình bất đồng bộ/reactive (callback, `CompletableFuture` xâu chuỗi, reactive streams) cho bài toán server nhiều I/O.**

<details className="qa">
<summary>Xem đáp án</summary>

| | Virtual thread (blocking tuần tự) | Reactive/Async (callback, `CompletableFuture`, reactive streams) |
|---|---|---|
| Cách viết code | Tuần tự, dễ đọc như code thông thường (`goiApi(); xuLy();`) | Xâu chuỗi callback/operator (`.thenApply().thenCompose()...`), khó đọc hơn với logic phức tạp |
| Debug / stack trace | Dễ — stack trace phản ánh đúng luồng gọi tuần tự | Khó hơn — stack trace bị "cắt khúc" qua nhiều callback bất đồng bộ |
| Khả năng scale với nhiều tác vụ chờ I/O | Rất cao, tương đương reactive nhờ cơ chế mount/unmount | Rất cao — đây vốn là thế mạnh truyền thống của reactive |
| Độ phức tạp khi triển khai | Thấp — gần như không đổi code logic so với dùng platform thread | Cao hơn — cần học mô hình lập trình khác, xử lý lỗi/context truyền qua callback phức tạp hơn |

**Kết luận thực tế**: virtual thread mang lại phần lớn lợi ích scale của reactive nhưng vẫn giữ được sự đơn giản, dễ đọc, dễ debug của code blocking truyền thống — đây là lý do nó được xem là bước tiến lớn, giúp nhiều dự án **không còn bắt buộc** phải chuyển sang reactive chỉ vì lý do hiệu năng I/O.

</details>

**9. Tình huống: bạn thiết kế một web server cần xử lý 200.000 kết nối đồng thời, mỗi request gọi trung bình 3 API/DB bên ngoài (I/O-bound). Virtual thread giúp gì ở đây, và điểm giới hạn còn lại là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Virtual thread giúp**: mỗi request có thể được xử lý bởi **một virtual thread riêng**, viết code tuần tự tự nhiên (`goiApi1(); goiApi2(); goiApi3();`) mà không cần callback/reactive, và JVM tự động mount/unmount các virtual thread này quanh một số ít carrier thread trong lúc chờ các lệnh gọi I/O trả về — cho phép scale tới hàng trăm nghìn request đồng thời mà không cần hàng trăm nghìn OS thread thật.

**Giới hạn vẫn còn tồn tại**:

- Nếu logic xử lý request có đoạn **tính toán CPU nặng** xen giữa các lệnh gọi I/O, phần đó vẫn tranh chấp đúng số carrier thread giới hạn (mặc định thường bằng số nhân CPU) — virtual thread không tạo thêm năng lực tính toán CPU.
- Tài nguyên **khác** ngoài luồng (kết nối DB pool, file descriptor, bộ nhớ heap cho dữ liệu mỗi request) vẫn có thể trở thành nút thắt cổ chai dù số luồng không còn là vấn đề — cần cấu hình connection pool và giới hạn tài nguyên phù hợp riêng.
- Cẩn trọng với **pinning** (câu 6) nếu code cũ còn dùng nhiều `synchronized` quanh các đoạn gọi I/O, có thể vô tình làm giảm hiệu quả của virtual thread.

</details>
