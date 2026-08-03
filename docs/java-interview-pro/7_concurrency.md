---
sidebar_position: 7
title: "7. Đồng thời (Concurrency)"
---

# Đồng thời (Concurrency)

> *Concurrency là khả năng chạy nhiều tác vụ "cùng lúc" — đây là chủ đề phỏng vấn cốt lõi đòi hỏi hiểu sâu về bộ nhớ, đồng bộ hoá và các nguy cơ tiềm ẩn trong môi trường đa luồng.*

:::note[Ghi nhớ nhanh]

- ⭐ **`synchronized` vs `volatile`** — `synchronized` đảm bảo cả visibility lẫn atomicity (có block thread); `volatile` chỉ đảm bảo visibility, KHÔNG atomic nên `count++` vẫn race condition.
- ⭐ **Race condition & deadlock** — `count++` gồm 3 bước không atomic; phòng deadlock bằng lấy lock theo thứ tự cố định (phá Circular Wait) hoặc `tryLock()` với timeout.
- **Tạo thread & pool** — 4 cách: kế thừa `Thread`, `Runnable`, `Callable` + `Future`, và `ExecutorService` (khuyến nghị vì tái sử dụng thread, tránh OOM, nhớ `shutdown()`).
- **`Future` vs `CompletableFuture`** — `Future.get()` blocking, không chain; `CompletableFuture` hỗ trợ callback non-blocking, `thenCompose`/`thenCombine`/`allOf` và `exceptionally`.
- **Happens-before & atomic** — quy tắc JMM (ghi `volatile`, unlock, `start()`/`join()`) đảm bảo visibility; dùng `AtomicInteger` (CAS) hoặc `ConcurrentHashMap` cho thao tác thread-safe.
- **Công cụ nâng cao** — `CountDownLatch` (dùng 1 lần, chờ N task xong) vs `CyclicBarrier` (tái sử dụng, thread chờ nhau tại checkpoint); Virtual Threads (Java 21) hợp I/O-intensive; `ThreadLocal` phải `remove()` trong `finally` để tránh leak ở thread pool.

:::

---

## Câu 1: Thread là gì? Có mấy cách tạo thread trong Java? `[Basic]`

### Câu hỏi

> *"Bạn hiểu thread là gì? Hãy liệt kê và so sánh các cách tạo thread trong Java."*

### Giải thích lý thuyết

**Thread** (luồng) là đơn vị thực thi nhỏ nhất trong một tiến trình (process). Nhiều thread có thể tồn tại trong cùng một process và chia sẻ vùng nhớ heap với nhau, nhưng mỗi thread có stack riêng.

Java cung cấp **4 cách** tạo thread chính:

| Cách | Mô tả | Ưu điểm |
|------|-------|----------|
| Kế thừa `Thread` | Override `run()` trong subclass | Đơn giản, dễ hiểu |
| Implement `Runnable` | Truyền `Runnable` vào `Thread` | Tách biệt logic, không ràng buộc kế thừa |
| Implement `Callable` + `Future` | Trả về kết quả, ném exception | Lấy được kết quả từ thread |
| `ExecutorService` | Pool thread được quản lý sẵn | Tái sử dụng thread, kiểm soát tài nguyên |

### Code minh hoạ

```java
// Cách 1: Kế thừa Thread
class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("Thread đang chạy: " + Thread.currentThread().getName());
    }
}

// Cách 2: Implement Runnable
Runnable task = () -> System.out.println("Runnable đang chạy");
Thread t = new Thread(task);

// Cách 3: Callable + Future (trả về kết quả)
import java.util.concurrent.*;

Callable<Integer> callable = () -> {
    // Tính toán rồi trả về kết quả
    return 42;
};
ExecutorService executor = Executors.newSingleThreadExecutor();
Future<Integer> future = executor.submit(callable);
int result = future.get(); // Chặn cho đến khi có kết quả

// Cách 4: ExecutorService (khuyến nghị)
ExecutorService pool = Executors.newFixedThreadPool(4);
pool.submit(() -> System.out.println("Task trong pool"));
pool.shutdown();

public class Main {
    public static void main(String[] args) throws Exception {
        // Khởi chạy thread theo cách 1
        new MyThread().start(); // Gọi start(), KHÔNG gọi run() trực tiếp

        // Khởi chạy thread theo cách 2
        new Thread(task).start();
    }
}
```

### Đáp án mẫu

> "Thread là đơn vị thực thi trong process, chia sẻ heap nhưng có stack riêng. Java có 4 cách tạo thread: kế thừa `Thread`, implement `Runnable`, `Callable` để lấy kết quả, và `ExecutorService` để quản lý pool. Trong thực tế tôi luôn ưu tiên `ExecutorService` vì nó tái sử dụng thread, tránh overhead tạo thread mới liên tục, và dễ kiểm soát tài nguyên hơn."

---

## Câu 2: Synchronization là gì và khi nào nên dùng? `[Intermediate]`

### Câu hỏi

> *"Synchronization trong Java hoạt động như thế nào? Hãy cho biết khi nào bạn sẽ dùng nó."*

### Giải thích lý thuyết

**Synchronization** (đồng bộ hoá) là cơ chế đảm bảo chỉ một thread được phép thực thi một đoạn code (critical section — vùng tới hạn) tại một thời điểm. Java thực hiện điều này qua **monitor lock** (khoá màn hình), mỗi object đều có một lock ẩn.

Khi một thread `synchronized` trên một object, nó **giữ lock** của object đó. Các thread khác muốn vào vùng `synchronized` cùng lock phải **chờ** cho đến khi lock được giải phóng.

**Nên dùng khi:**
- Nhiều thread cùng đọc/ghi (read/write) vào biến chia sẻ
- Cần đảm bảo một chuỗi thao tác là atomic (không thể chia cắt)
- Dùng các cấu trúc dữ liệu không thread-safe (như `ArrayList`, `HashMap`)

### Code minh hoạ

```java
public class Counter {
    private int count = 0;

    // Synchronized method — toàn bộ method là critical section
    public synchronized void increment() {
        count++;
    }

    // Synchronized block — chỉ khóa đoạn cần thiết (hiệu quả hơn)
    public void incrementBlock() {
        // Code không cần đồng bộ có thể nằm ngoài
        synchronized (this) {
            count++;
        }
    }

    public synchronized int getCount() {
        return count;
    }
}

// Synchronized static method — dùng lock của Class object
public class IdGenerator {
    private static int nextId = 0;

    public static synchronized int generate() {
        return ++nextId;
    }
}

// Ví dụ minh hoạ nguy hiểm khi KHÔNG dùng synchronized
class UnsafeCounter {
    private int count = 0;

    public void increment() {
        count++; // Không atomic! count++ = đọc + tăng + ghi (3 bước)
    }
}
```

### Đáp án mẫu

> "Synchronization đảm bảo chỉ một thread vào critical section tại một thời điểm bằng cách sử dụng monitor lock của object. Tôi dùng `synchronized` khi nhiều thread truy cập biến chia sẻ có thể thay đổi — ví dụ bộ đếm, danh sách chia sẻ. Tôi ưu tiên `synchronized block` hơn `synchronized method` để thu hẹp vùng khoá, giảm tranh chấp. Với các trường hợp đơn giản như đếm, tôi còn xem xét dùng `AtomicInteger` từ package `java.util.concurrent.atomic` để hiệu năng tốt hơn."

---

## Câu 3: Deadlock là gì? Làm thế nào để phòng tránh? `[Intermediate]`

### Câu hỏi

> *"Deadlock là gì? Hãy mô tả điều kiện xảy ra deadlock và các cách phòng tránh."*

### Giải thích lý thuyết

**Deadlock** (bế tắc) xảy ra khi hai hoặc nhiều thread chờ nhau giải phóng tài nguyên mà không thread nào có thể tiếp tục.

Bốn điều kiện cần thiết để deadlock xảy ra (**điều kiện Coffman**):

| Điều kiện | Mô tả |
|-----------|-------|
| Mutual Exclusion (loại trừ lẫn nhau) | Tài nguyên chỉ được giữ bởi một thread tại một thời điểm |
| Hold and Wait (giữ và chờ) | Thread giữ ít nhất một tài nguyên và chờ thêm tài nguyên khác |
| No Preemption (không tiếm quyền) | Tài nguyên không thể bị lấy cưỡng bức; chỉ được giải phóng tự nguyện |
| Circular Wait (chờ vòng tròn) | Thread A chờ Thread B, Thread B chờ Thread A |

**Cách phòng tránh:**
- Luôn lấy lock theo **thứ tự cố định** (phá điều kiện Circular Wait)
- Dùng `tryLock()` với timeout để không chờ mãi mãi
- Dùng `ReentrantLock` thay `synchronized` để linh hoạt hơn
- Giảm thiểu số lượng lock cần thiết

### Code minh hoạ

```java
import java.util.concurrent.locks.*;

// XẤU: Dễ gây deadlock
class DeadlockExample {
    private final Object lockA = new Object();
    private final Object lockB = new Object();

    public void methodA() {
        synchronized (lockA) {          // Thread 1 giữ lockA
            synchronized (lockB) {      // Thread 1 chờ lockB
                System.out.println("Method A");
            }
        }
    }

    public void methodB() {
        synchronized (lockB) {          // Thread 2 giữ lockB
            synchronized (lockA) {      // Thread 2 chờ lockA -> DEADLOCK!
                System.out.println("Method B");
            }
        }
    }
}

// TỐT: Lấy lock theo thứ tự cố định (luôn A trước B)
class SafeExample {
    private final Object lockA = new Object();
    private final Object lockB = new Object();

    public void methodA() {
        synchronized (lockA) {
            synchronized (lockB) {
                System.out.println("Method A");
            }
        }
    }

    public void methodB() {
        // Vẫn lấy lockA trước lockB — cùng thứ tự
        synchronized (lockA) {
            synchronized (lockB) {
                System.out.println("Method B");
            }
        }
    }
}

// TỐT: Dùng tryLock với timeout
class TryLockExample {
    private final ReentrantLock lock1 = new ReentrantLock();
    private final ReentrantLock lock2 = new ReentrantLock();

    public boolean performOperation() throws InterruptedException {
        if (lock1.tryLock(1, java.util.concurrent.TimeUnit.SECONDS)) {
            try {
                if (lock2.tryLock(1, java.util.concurrent.TimeUnit.SECONDS)) {
                    try {
                        // Thực hiện công việc an toàn
                        return true;
                    } finally {
                        lock2.unlock();
                    }
                }
            } finally {
                lock1.unlock();
            }
        }
        return false; // Không lấy được lock, thử lại sau
    }
}
```

### Đáp án mẫu

> "Deadlock xảy ra khi các thread tạo thành vòng chờ tài nguyên của nhau — không ai tiến được. Điều kiện gồm loại trừ lẫn nhau, giữ và chờ, không tiếm quyền, và chờ vòng tròn. Cách tôi phòng tránh hiệu quả nhất là quy định thứ tự lấy lock cố định trong toàn codebase. Ngoài ra tôi dùng `ReentrantLock.tryLock()` với timeout để không bị chặn vô thời hạn — nếu không lấy được lock sau một khoảng thời gian, giải phóng những gì đang giữ và thử lại."

---

## Câu 4: Race condition là gì và làm thế nào để phòng tránh? `[Intermediate]`

### Câu hỏi

> *"Race condition là gì? Bạn sẽ làm gì để phát hiện và phòng tránh race condition?"*

### Giải thích lý thuyết

**Race condition** (điều kiện tranh đua) xảy ra khi kết quả của chương trình phụ thuộc vào thứ tự hoặc thời điểm thực thi của các thread — và thứ tự đó không được kiểm soát. Kết quả trở nên không nhất quán và khó tái hiện.

Ví dụ điển hình: thao tác `count++` trông như một lệnh nhưng thực ra gồm ba bước:
1. Đọc giá trị hiện tại của `count`
2. Tăng giá trị lên 1
3. Ghi giá trị mới lại vào `count`

Nếu hai thread thực hiện đồng thời, cả hai có thể đọc cùng giá trị, dẫn đến kết quả sai.

**Cách phòng tránh:**
- Dùng `synchronized` để bảo vệ critical section
- Dùng các lớp trong `java.util.concurrent.atomic` như `AtomicInteger`
- Dùng các collection thread-safe: `ConcurrentHashMap`, `CopyOnWriteArrayList`
- Thiết kế immutable objects (object bất biến) không cần đồng bộ

### Code minh hoạ

```java
import java.util.concurrent.atomic.AtomicInteger;

// XẤU: Race condition
class RaceExample {
    private int count = 0;

    public void increment() {
        count++; // KHÔNG an toàn — ba bước không atomic
    }
}

// TỐT: Dùng AtomicInteger
class AtomicExample {
    private final AtomicInteger count = new AtomicInteger(0);

    public void increment() {
        count.incrementAndGet(); // Atomic — đảm bảo không race condition
    }

    public int getCount() {
        return count.get();
    }
}

// TỐT: Dùng synchronized
class SynchronizedExample {
    private int count = 0;

    public synchronized void increment() {
        count++;
    }

    public synchronized int getCount() {
        return count;
    }
}

// Chứng minh race condition
class RaceConditionDemo {
    public static void main(String[] args) throws InterruptedException {
        RaceExample unsafe = new RaceExample();
        AtomicExample safe = new AtomicExample();

        Runnable unsafeTask = () -> {
            for (int i = 0; i < 1000; i++) unsafe.increment();
        };
        Runnable safeTask = () -> {
            for (int i = 0; i < 1000; i++) safe.increment();
        };

        Thread t1 = new Thread(unsafeTask);
        Thread t2 = new Thread(unsafeTask);
        t1.start(); t2.start();
        t1.join(); t2.join();

        // Kết quả unsafe thường < 2000 (mất update)
        System.out.println("Unsafe count (thường < 2000): " + unsafe.count);
        System.out.println("Safe count (luôn = 2000): " + safe.getCount());
    }
}
```

### Đáp án mẫu

> "Race condition xảy ra khi nhiều thread truy cập và sửa đổi dữ liệu chia sẻ mà không được đồng bộ — kết quả phụ thuộc vào thứ tự thực thi không thể đoán trước. Tôi phòng tránh bằng ba cách chính: dùng `synchronized` block, dùng `AtomicInteger` hay các lớp atomic khác cho thao tác đơn giản, hoặc thiết kế immutable objects. `AtomicInteger` thường nhanh hơn `synchronized` vì dùng CAS — Compare And Swap — ở cấp phần cứng thay vì khóa."

---

## Câu 5: `volatile` keyword trong Java là gì? `[Advanced]`

### Câu hỏi

> *"Từ khoá `volatile` làm gì trong Java? Nó giải quyết vấn đề gì?"*

### Giải thích lý thuyết

`volatile` là từ khoá báo cho JVM rằng biến được khai báo có thể bị thay đổi bởi nhiều thread đồng thời. Nó giải quyết hai vấn đề:

**1. Visibility (Tính hiển thị):** Không có `volatile`, mỗi thread có thể cache giá trị biến trong CPU cache của nó. Một thread ghi giá trị mới nhưng thread khác vẫn đọc giá trị cũ từ cache. `volatile` đảm bảo mọi lần đọc đều lấy thẳng từ main memory (bộ nhớ chính).

**2. Instruction Reordering (Sắp xếp lại lệnh):** JVM và CPU có thể tối ưu bằng cách sắp xếp lại thứ tự thực thi. `volatile` tạo ra memory barrier (hàng rào bộ nhớ) ngăn việc sắp xếp lại lệnh quanh biến đó.

**Giới hạn của `volatile`:**
- Chỉ đảm bảo visibility, KHÔNG đảm bảo atomicity (tính nguyên tử)
- `volatile int count; count++` vẫn có thể gây race condition

### Code minh hoạ

```java
// XẤU: Không có volatile — thread có thể không thấy thay đổi
class WithoutVolatile {
    private boolean running = true; // Thread đọc từ CPU cache

    public void stop() {
        running = false; // Thread khác ghi vào main memory
        // Nhưng thread đang chạy có thể không thấy sự thay đổi này!
    }

    public void run() {
        while (running) { // Có thể vòng lặp vô tận vì cache
            // Làm việc...
        }
    }
}

// TỐT: Dùng volatile cho flag đơn giản
class WithVolatile {
    private volatile boolean running = true;
    // Mọi thread đều đọc/ghi thẳng vào main memory

    public void stop() {
        running = false; // Hiển thị ngay với tất cả thread
    }

    public void run() {
        while (running) { // Luôn đọc giá trị mới nhất
            // Làm việc...
        }
    }
}

// Ví dụ double-checked locking (cần volatile)
class Singleton {
    // volatile ngăn instance được publish trước khi khởi tạo hoàn chỉnh
    private static volatile Singleton instance;

    public static Singleton getInstance() {
        if (instance == null) {                  // Kiểm tra lần 1 (không lock)
            synchronized (Singleton.class) {
                if (instance == null) {          // Kiểm tra lần 2 (có lock)
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

### Đáp án mẫu

> "`volatile` đảm bảo tính hiển thị — mọi lần đọc biến đều lấy giá trị mới nhất từ main memory, không phải CPU cache. Nó còn ngăn instruction reordering quanh biến đó. Tôi dùng `volatile` cho các boolean flag đơn giản kiểm soát vòng lặp của thread, hoặc trong pattern double-checked locking cho singleton. Điểm quan trọng cần nhớ: `volatile` không thay thế `synchronized` vì nó không đảm bảo atomicity — `count++` với `volatile` vẫn có thể bị race condition."

---

## Câu 6: `synchronized` và `volatile` khác nhau thế nào? Khi nào dùng cái nào? `[Advanced]`

### Câu hỏi

> *"Bạn có thể so sánh `synchronized` và `volatile`? Trong tình huống nào bạn chọn cái nào?"*

### Giải thích lý thuyết

Đây là hai cơ chế đồng bộ hoá khác nhau về mục đích và phạm vi:

| Tiêu chí | `synchronized` | `volatile` |
|----------|---------------|------------|
| Đảm bảo Visibility | Có | Có |
| Đảm bảo Atomicity | Có | Không |
| Blocking | Có (block thread) | Không |
| Hiệu năng | Chậm hơn (lock overhead) | Nhanh hơn |
| Phạm vi | Method hoặc block | Chỉ một biến |
| Dùng cho | Compound operations, nhiều biến | Flag đơn, trạng thái đơn giản |

**Quy tắc lựa chọn:**
- **Chỉ cần visibility** cho biến đơn giản → dùng `volatile`
- **Cần atomicity** hoặc **thao tác phức hợp** → dùng `synchronized`
- **Biến số nguyên cần increment** → dùng `AtomicInteger`

### Code minh hoạ

```java
import java.util.concurrent.atomic.AtomicInteger;

// Trường hợp 1: volatile đủ dùng — flag đơn giản
class TaskRunner {
    private volatile boolean shouldStop = false;

    public void requestStop() {
        shouldStop = true; // Thao tác đơn, không cần atomic
    }

    public void run() {
        while (!shouldStop) {
            // Thực thi task...
        }
    }
}

// Trường hợp 2: volatile KHÔNG đủ — cần synchronized hoặc Atomic
class Counter {
    private volatile int count = 0; // KHÔNG an toàn!

    public void increment() {
        count++; // Vẫn race condition dù có volatile
        // count++ là ba bước: đọc, tăng, ghi
    }

    // Giải pháp 1: synchronized
    public synchronized void safeIncrement() {
        count++;
    }

    // Giải pháp 2: AtomicInteger (tốt hơn)
    private final AtomicInteger atomicCount = new AtomicInteger(0);

    public void atomicIncrement() {
        atomicCount.incrementAndGet(); // Thực sự atomic
    }
}

// Trường hợp 3: synchronized khi thao tác liên quan nhiều biến
class BankAccount {
    private volatile double balance;    // Chỉ visibility
    private volatile int transactionCount; // Chỉ visibility

    // PHẢI dùng synchronized để đảm bảo balance và transactionCount nhất quán
    public synchronized void deposit(double amount) {
        balance += amount;          // Cập nhật balance
        transactionCount++;         // Cập nhật counter
        // Cả hai phải xảy ra cùng nhau — không thể tách rời
    }
}
```

### Đáp án mẫu

> "`volatile` và `synchronized` cùng giải quyết visibility nhưng `synchronized` còn đảm bảo atomicity. Tôi chọn `volatile` khi chỉ cần đảm bảo một thread thấy giá trị mới nhất của biến boolean flag — như cờ dừng thread. Tôi chọn `synchronized` khi cần bảo vệ compound operations như `count++`, hoặc khi cần cập nhật nhiều biến một cách nhất quán. Với biến số nguyên đơn giản cần tăng giảm, tôi ưu tiên `AtomicInteger` vì dùng CAS hardware instruction, không block thread, hiệu năng tốt hơn `synchronized`."

---

## Câu 7: ExecutorService là gì? Khác tạo thread thủ công thế nào? `[Intermediate]`

### Câu hỏi

> *"ExecutorService là gì và tại sao bạn nên dùng nó thay vì tự tạo thread?"*

### Giải thích lý thuyết

**ExecutorService** là interface trong `java.util.concurrent` cung cấp cơ chế quản lý thread pool (nhóm luồng). Thay vì tạo và huỷ thread mỗi khi có task, ExecutorService duy trì một nhóm thread sẵn sàng nhận và thực thi task.

**Vấn đề khi tự tạo thread:**
- Tốn chi phí khởi tạo/huỷ thread (mỗi thread ~1MB stack)
- Không kiểm soát được số lượng thread → OOM (Out of Memory) nếu có quá nhiều task
- Không tái sử dụng thread
- Khó quản lý lifecycle (vòng đời) của thread

**Các loại ExecutorService thông dụng:**

| Factory method | Mô tả |
|---------------|-------|
| `Executors.newFixedThreadPool(n)` | Pool cố định n thread |
| `Executors.newCachedThreadPool()` | Tạo thread mới khi cần, tái sử dụng thread rảnh |
| `Executors.newSingleThreadExecutor()` | Một thread duy nhất, đảm bảo thứ tự |
| `Executors.newScheduledThreadPool(n)` | Chạy task theo lịch/định kỳ |

### Code minh hoạ

```java
import java.util.concurrent.*;
import java.util.List;
import java.util.ArrayList;

public class ExecutorServiceDemo {

    public static void main(String[] args) throws Exception {
        // Tạo fixed thread pool với 4 thread
        ExecutorService executor = Executors.newFixedThreadPool(4);

        // Submit Runnable task (không trả về kết quả)
        executor.submit(() -> System.out.println("Task 1 chạy trên: "
                + Thread.currentThread().getName()));

        // Submit Callable task (trả về kết quả)
        Future<String> future = executor.submit(() -> {
            Thread.sleep(100); // Giả lập tác vụ tốn thời gian
            return "Kết quả từ Callable";
        });

        // Lấy kết quả (sẽ chờ nếu chưa xong)
        String result = future.get(5, TimeUnit.SECONDS);
        System.out.println(result);

        // Submit nhiều task cùng lúc và chờ tất cả hoàn thành
        List<Callable<Integer>> tasks = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            final int taskId = i;
            tasks.add(() -> {
                Thread.sleep(50);
                return taskId * taskId; // Trả về bình phương
            });
        }

        List<Future<Integer>> futures = executor.invokeAll(tasks);
        for (Future<Integer> f : futures) {
            System.out.println("Kết quả: " + f.get());
        }

        // QUAN TRỌNG: Luôn shutdown executor khi xong
        executor.shutdown(); // Chờ task hiện tại hoàn thành rồi đóng
        if (!executor.awaitTermination(10, TimeUnit.SECONDS)) {
            executor.shutdownNow(); // Buộc dừng nếu vẫn còn task
        }
    }
}
```

### Đáp án mẫu

> "ExecutorService quản lý thread pool — thay vì tạo mới thread cho mỗi task rồi huỷ nó, pool tái sử dụng thread sẵn có. Điều này giảm đáng kể overhead của việc tạo/huỷ thread, kiểm soát được số lượng thread tối đa tránh OOM, và cung cấp API tiện lợi để lấy kết quả qua `Future`. Trong thực tế tôi luôn dùng `ExecutorService` thay vì `new Thread()` thủ công, và nhớ `shutdown()` sau khi dùng xong để tránh resource leak."

---

## Câu 8: Future và CompletableFuture khác nhau thế nào? `[Advanced]`

### Câu hỏi

> *"Sự khác biệt giữa `Future` và `CompletableFuture` là gì? Khi nào bạn dùng `CompletableFuture`?"*

### Giải thích lý thuyết

**`Future`** (Java 5) là interface cơ bản để đại diện cho kết quả tính toán bất đồng bộ (asynchronous). Tuy nhiên nó có nhiều hạn chế:
- `get()` là blocking call — chặn thread đang gọi
- Không thể compose (kết hợp) nhiều `Future` với nhau
- Không có callback khi hoàn thành
- Không xử lý exception tốt

**`CompletableFuture`** (Java 8) mở rộng `Future` với khả năng:
- Non-blocking callback qua `thenApply`, `thenAccept`, `thenRun`
- Kết hợp nhiều future: `thenCompose`, `thenCombine`, `allOf`, `anyOf`
- Xử lý exception: `exceptionally`, `handle`
- Tạo async pipeline (chuỗi xử lý bất đồng bộ) rõ ràng

| Tính năng | `Future` | `CompletableFuture` |
|-----------|----------|---------------------|
| Blocking get | Có | Có (nhưng thường tránh) |
| Non-blocking callback | Không | Có |
| Composition (kết hợp) | Không | Có |
| Exception handling | Hạn chế | Đầy đủ |
| Hoàn thành thủ công | Không | Có (`complete()`) |

### Code minh hoạ

```java
import java.util.concurrent.*;

public class FutureVsCompletableFuture {

    // --- FUTURE: Cơ bản, blocking ---
    static void futureExample() throws Exception {
        ExecutorService executor = Executors.newFixedThreadPool(2);

        Future<String> future = executor.submit(() -> {
            Thread.sleep(200);
            return "Kết quả từ Future";
        });

        // Chặn thread hiện tại cho đến khi có kết quả
        String result = future.get(); // BLOCKING!
        System.out.println(result);
        executor.shutdown();
    }

    // --- COMPLETABLE FUTURE: Linh hoạt, non-blocking ---
    static void completableFutureExample() throws Exception {
        // Tạo async task
        CompletableFuture<String> cf = CompletableFuture.supplyAsync(() -> {
            // Giả lập tác vụ mạng
            return "Dữ liệu từ API";
        });

        // Xử lý kết quả bất đồng bộ (không blocking)
        cf.thenApply(data -> data.toUpperCase())        // Biến đổi kết quả
          .thenApply(data -> "Đã xử lý: " + data)      // Biến đổi tiếp
          .thenAccept(System.out::println)              // Tiêu thụ kết quả
          .exceptionally(ex -> {                        // Xử lý exception
              System.err.println("Lỗi: " + ex.getMessage());
              return null;
          });

        // Kết hợp hai CompletableFuture song song
        CompletableFuture<String> task1 = CompletableFuture.supplyAsync(() -> "Kết quả 1");
        CompletableFuture<String> task2 = CompletableFuture.supplyAsync(() -> "Kết quả 2");

        // Chờ cả hai hoàn thành rồi kết hợp
        CompletableFuture<String> combined = task1.thenCombine(task2,
                (r1, r2) -> r1 + " + " + r2);
        System.out.println(combined.get());

        // Chờ tất cả hoàn thành
        CompletableFuture.allOf(task1, task2).join();

        // Chain bất đồng bộ (pipeline)
        CompletableFuture.supplyAsync(() -> "user@example.com")          // Bước 1: lấy email
            .thenCompose(email -> CompletableFuture.supplyAsync(          // Bước 2: gọi API
                () -> "Thông tin user cho " + email))
            .thenAccept(info -> System.out.println("Nhận được: " + info)); // Bước 3: in
    }
}
```

### Đáp án mẫu

> "`Future` là cơ bản: submit task, gọi `get()` để lấy kết quả, nhưng `get()` là blocking và không thể chain. `CompletableFuture` giải quyết hoàn toàn những hạn chế đó — tôi có thể viết pipeline bất đồng bộ với `thenApply`, `thenCompose`, kết hợp nhiều task với `thenCombine` hay `allOf`, và xử lý exception với `exceptionally`. Trong dự án thực tế khi cần gọi nhiều API song song và kết hợp kết quả, `CompletableFuture` giúp tôi viết code rõ ràng, không blocking mà vẫn xử lý được async flow phức tạp."

---

## Câu 9: Happens-before relationship trong Java là gì? `[Advanced]`

### Câu hỏi

> *"Bạn có thể giải thích happens-before relationship trong Java Memory Model không?"*

### Giải thích lý thuyết

**Java Memory Model (JMM)** định nghĩa cách các thread tương tác qua bộ nhớ. **Happens-before** (xảy ra trước) là quan hệ thứ tự giữa các thao tác bộ nhớ — nếu thao tác A happens-before thao tác B, thì kết quả của A **đảm bảo hiển thị** với B.

Đây là nền tảng lý thuyết giải thích tại sao `volatile` và `synchronized` hoạt động.

**Các quy tắc happens-before cơ bản:**

| Quy tắc | Mô tả |
|---------|-------|
| Program order | Trong cùng thread, lệnh trước happens-before lệnh sau |
| Monitor lock | Unlock happens-before lock tiếp theo trên cùng monitor |
| Volatile | Ghi `volatile` happens-before mọi lần đọc tiếp theo |
| Thread start | `thread.start()` happens-before mọi thao tác trong thread đó |
| Thread join | Mọi thao tác trong thread happens-before `thread.join()` trả về |
| Transitivity | Nếu A hb B và B hb C thì A hb C |

**Tại sao quan trọng:** Nếu không có happens-before, JVM và CPU có thể reorder instructions hoặc cache giá trị — dẫn đến thread không thấy giá trị mới nhất được ghi bởi thread khác.

### Code minh hoạ

```java
// Minh hoạ happens-before qua volatile
class HappensBefore {
    private volatile boolean flag = false;
    private int data = 0;

    // Thread 1 thực thi writer()
    public void writer() {
        data = 42;          // (A) Ghi data
        flag = true;        // (B) Ghi volatile flag
        // (A) happens-before (B) theo program order trong Thread 1
        // (B) happens-before mọi lần đọc flag tiếp theo (volatile rule)
    }

    // Thread 2 thực thi reader()
    public void reader() {
        if (flag) {         // (C) Đọc volatile flag
            // Nếu C thấy flag = true, thì:
            // (B) happens-before (C) — volatile read/write rule
            // (A) happens-before (B) — program order
            // Suy ra: (A) happens-before (C) — transitivity
            // => Thread 2 ĐẢM BẢO thấy data = 42
            System.out.println("Data: " + data); // In 42, không phải 0
        }
    }
}

// Minh hoạ happens-before qua synchronized
class SynchronizedHB {
    private int value = 0;
    private final Object lock = new Object();

    public void write(int v) {
        synchronized (lock) {
            value = v; // Mọi ghi trong synchronized block...
        }              // ...happens-before mọi lần đọc tiếp theo cùng lock
    }

    public int read() {
        synchronized (lock) { // Đảm bảo thấy giá trị mới nhất
            return value;
        }
    }
}

// Minh hoạ thread start/join
class ThreadHB {
    static int sharedData = 0;

    public static void main(String[] args) throws InterruptedException {
        sharedData = 10; // Ghi trước start()
        Thread t = new Thread(() -> {
            // start() happens-before mọi thao tác trong thread này
            // => Thread này ĐẢM BẢO thấy sharedData = 10
            System.out.println(sharedData);
        });
        t.start(); // start() happens-before mọi thao tác trong t
        t.join();  // Mọi thao tác trong t happens-before join() trả về
        // => Main thread thấy mọi thay đổi t đã làm
    }
}
```

### Đáp án mẫu

> "Happens-before là quan hệ thứ tự trong Java Memory Model đảm bảo nếu thao tác A happens-before B thì kết quả A hiển thị với B — ngay cả khi chúng chạy trên thread khác nhau. Các quy tắc cơ bản: ghi `volatile` happens-before đọc tiếp theo, unlock happens-before lock tiếp theo, `thread.start()` happens-before mọi thao tác trong thread. Hiểu happens-before giúp tôi biết chính xác khi nào cần thêm `volatile` hay `synchronized` để đảm bảo tính nhất quán của dữ liệu chia sẻ."

---

## Câu 10: CountDownLatch và CyclicBarrier khác nhau thế nào? `[Advanced]`

### Câu hỏi

> *"Khi nào bạn dùng `CountDownLatch` và khi nào dùng `CyclicBarrier`? Sự khác biệt là gì?"*

### Giải thích lý thuyết

Cả hai đều là synchronization aids (công cụ đồng bộ hoá) trong `java.util.concurrent` giúp phối hợp nhiều thread, nhưng mục đích khác nhau:

| Tiêu chí | `CountDownLatch` | `CyclicBarrier` |
|----------|-----------------|----------------|
| Tái sử dụng | Không (dùng một lần) | Có (cyclic — chu kỳ) |
| Ai chờ | Một hoặc nhiều thread chờ count về 0 | Tất cả thread chờ nhau đến barrier |
| Điều khiển count | Thread bất kỳ gọi `countDown()` | Mỗi thread gọi `await()` tự giảm |
| Hành động khi đủ | Không có | Có thể chạy `Runnable` barrier action |
| Use case | Chờ nhiều task hoàn thành | Các bước đồng bộ trong thuật toán song song |

**CountDownLatch:** Một thread (hoặc nhiều) chờ cho đến khi N thao tác hoàn tất.
**CyclicBarrier:** Tất cả N thread cùng chờ nhau tại một điểm, rồi cùng tiến.

### Code minh hoạ

```java
import java.util.concurrent.*;

// CountDownLatch: Chờ N task hoàn thành
class CountDownLatchDemo {
    public static void main(String[] args) throws InterruptedException {
        int taskCount = 5;
        CountDownLatch latch = new CountDownLatch(taskCount);
        ExecutorService executor = Executors.newFixedThreadPool(taskCount);

        for (int i = 1; i <= taskCount; i++) {
            final int id = i;
            executor.submit(() -> {
                try {
                    System.out.println("Task " + id + " đang thực thi");
                    Thread.sleep(100 * id); // Giả lập công việc
                    System.out.println("Task " + id + " hoàn thành");
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    latch.countDown(); // Giảm count dù có lỗi hay không
                }
            });
        }

        System.out.println("Main thread đang chờ tất cả task...");
        latch.await(); // Chặn cho đến khi count = 0
        System.out.println("Tất cả task đã hoàn thành! Tiếp tục xử lý...");

        executor.shutdown();
    }
}

// CyclicBarrier: Các phase đồng bộ
class CyclicBarrierDemo {
    public static void main(String[] args) {
        int threadCount = 3;

        // Khi tất cả thread đến barrier, chạy action này rồi mới tiếp
        Runnable barrierAction = () ->
            System.out.println("=== Tất cả thread đã đến barrier, bắt đầu phase mới ===");

        CyclicBarrier barrier = new CyclicBarrier(threadCount, barrierAction);
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);

        for (int i = 1; i <= threadCount; i++) {
            final int id = i;
            executor.submit(() -> {
                try {
                    // Phase 1
                    System.out.println("Thread " + id + " thực hiện Phase 1");
                    Thread.sleep(id * 50);
                    barrier.await(); // Chờ tất cả thread xong Phase 1

                    // Phase 2 — tất cả bắt đầu đồng thời sau barrier
                    System.out.println("Thread " + id + " thực hiện Phase 2");
                    Thread.sleep(id * 30);
                    barrier.await(); // Chờ tất cả xong Phase 2 (tái sử dụng được!)

                    System.out.println("Thread " + id + " hoàn thành");
                } catch (InterruptedException | BrokenBarrierException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }

        executor.shutdown();
    }
}
```

### Đáp án mẫu

> "`CountDownLatch` dùng khi tôi cần một thread chờ cho đến khi N sự kiện xảy ra — ví dụ chờ 5 microservice khởi động xong trước khi bắt đầu test, hoặc chờ nhiều task song song hoàn thành. Nó dùng một lần. `CyclicBarrier` dùng khi nhiều thread cần đồng bộ tại các checkpoint — ví dụ thuật toán song song có nhiều phase, tất cả thread phải xong phase 1 trước khi bất kỳ ai bắt đầu phase 2. Nó tái sử dụng được và có thể chạy action khi đủ thread."

---

## Câu 11: Virtual Threads là gì và chúng giải quyết vấn đề gì của Java? `[Advanced]`

### Câu hỏi

> *"Java 21 giới thiệu Virtual Threads. Chúng là gì và tại sao chúng quan trọng?"*

### Giải thích lý thuyết

**Virtual Threads** (Project Loom, chính thức từ Java 21) là lightweight threads (luồng nhẹ) được quản lý bởi JVM thay vì hệ điều hành.

**Vấn đề của Platform Threads (thread truyền thống):**
- Mỗi Java thread ánh xạ 1:1 với OS thread
- Mỗi OS thread tốn ~1-2MB stack memory
- Switching giữa OS thread tốn kém (kernel context switch)
- Hệ thống thực tế chỉ chịu được ~10.000 thread

**Virtual Threads giải quyết:**
- Hàng triệu virtual thread trên vài chục platform thread (carrier threads)
- Khi virtual thread bị block (I/O, sleep), JVM tự động unmount nó khỏi carrier thread và mount virtual thread khác lên
- Cho phép viết code theo kiểu blocking đơn giản mà vẫn có throughput của non-blocking

| Đặc điểm | Platform Thread | Virtual Thread |
|-----------|----------------|---------------|
| Ánh xạ | 1 Java = 1 OS thread | Nhiều Java = ít OS thread |
| Chi phí tạo | Cao (~1MB stack) | Rất thấp (vài KB) |
| Số lượng tối đa | ~10.000 | Hàng triệu |
| Phù hợp với | CPU-intensive | I/O-intensive (web, DB) |

### Code minh hoạ

```java
import java.util.concurrent.*;

public class VirtualThreadDemo {

    // Cách 1: Tạo virtual thread trực tiếp
    static void simpleVirtualThread() throws InterruptedException {
        Thread vThread = Thread.ofVirtual()
            .name("my-virtual-thread")
            .start(() -> {
                System.out.println("Chạy trên: " + Thread.currentThread());
                System.out.println("Có phải virtual? " + Thread.currentThread().isVirtual());
            });
        vThread.join();
    }

    // Cách 2: ExecutorService với virtual thread (khuyến nghị cho server)
    static void virtualThreadExecutor() throws Exception {
        // Mỗi task nhận một virtual thread mới — không giới hạn pool size
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            // Tạo 10.000 task — không vấn đề với virtual thread
            var futures = new java.util.ArrayList<Future<String>>();
            for (int i = 0; i < 10_000; i++) {
                final int id = i;
                futures.add(executor.submit(() -> {
                    Thread.sleep(100); // Block I/O — virtual thread unmount tự động
                    return "Task " + id + " hoàn thành";
                }));
            }

            // Chờ tất cả hoàn thành
            for (Future<String> f : futures) {
                f.get(); // Kết quả từ 10.000 task concurrent
            }
            System.out.println("Tất cả 10.000 task hoàn thành!");
        }
    }

    // Lưu ý: Virtual thread KHÔNG phù hợp cho CPU-intensive tasks
    static void cpuIntensiveWarning() {
        // Virtual thread không mang lại lợi ích cho tính toán nặng
        // Dùng platform thread pool với ForkJoinPool cho CPU-intensive
        ForkJoinPool forkJoinPool = new ForkJoinPool(
            Runtime.getRuntime().availableProcessors()
        );
        // Dùng forkJoinPool cho parallel streams, heavy computation...
    }

    public static void main(String[] args) throws Exception {
        simpleVirtualThread();
        virtualThreadExecutor();
    }
}
```

### Đáp án mẫu

> "Virtual Threads (Java 21) giải quyết giới hạn lớn nhất của Java trong lập trình server: mỗi platform thread tốn ~1MB và bị giới hạn ở OS. Virtual thread nhẹ hơn cực kỳ — hàng triệu virtual thread ánh xạ lên vài chục carrier thread. Khi virtual thread bị block do I/O, JVM tự động unmount nó và chạy virtual thread khác — giống như async/await nhưng developer vẫn viết code blocking đơn giản. Kết quả: throughput của reactive programming mà không cần thay đổi coding style. Điểm quan trọng: virtual thread tốt cho I/O-intensive (web server, database), nhưng không cải thiện gì cho CPU-intensive tasks."

---

## Câu 12: ThreadLocal là gì và dùng khi nào? `[Advanced]`

### Câu hỏi

> *"ThreadLocal là gì? Hãy cho ví dụ thực tế và cảnh báo khi dùng ThreadLocal."*

### Giải thích lý thuyết

**ThreadLocal** là class cho phép lưu trữ dữ liệu **riêng biệt cho từng thread**. Mỗi thread truy cập `ThreadLocal` sẽ có bản sao giá trị độc lập — không chia sẻ với thread khác.

**Khi nào dùng ThreadLocal:**
- Lưu trữ thông tin context của request (user ID, transaction ID, locale) trong web server
- Lưu database connection/session theo từng thread
- Lưu SimpleDateFormat (không thread-safe) mà không cần tạo mới mỗi lần
- Lưu thông tin bảo mật như user authentication trong request pipeline

**Cảnh báo quan trọng:**
- Phải gọi `remove()` sau khi dùng xong — đặc biệt trong môi trường thread pool
- Trong thread pool, thread được tái sử dụng — giá trị cũ của thread trước có thể lọt sang request sau (memory leak và security leak)
- Với Virtual Threads, cần cẩn thận hơn vì số lượng rất lớn

### Code minh hoạ

```java
// Ví dụ 1: Lưu user context trong web request
class UserContext {
    // ThreadLocal lưu user ID của request đang xử lý
    private static final ThreadLocal<String> currentUserId = new ThreadLocal<>();

    public static void setCurrentUser(String userId) {
        currentUserId.set(userId);
    }

    public static String getCurrentUser() {
        return currentUserId.get();
    }

    // QUAN TRỌNG: Phải gọi clear() sau khi xử lý xong request
    public static void clear() {
        currentUserId.remove(); // Tránh memory/security leak trong thread pool
    }
}

// Ví dụ 2: ThreadLocal với giá trị khởi tạo mặc định
class RequestIdFilter {
    // withInitial cung cấp giá trị mặc định khi thread chưa set
    private static final ThreadLocal<String> requestId =
        ThreadLocal.withInitial(() -> java.util.UUID.randomUUID().toString());

    // Middleware xử lý request trong web server
    public void handleRequest(String userId) {
        UserContext.setCurrentUser(userId);
        try {
            processRequest();       // Gọi các layer sâu hơn
            callDatabase();         // Service, Repository có thể lấy userId
        } finally {
            UserContext.clear();    // LUÔN LUÔN dùng try-finally để đảm bảo clear
        }
    }

    private void processRequest() {
        // Lấy được userId mà không cần truyền qua parameter
        String user = UserContext.getCurrentUser();
        System.out.println("Xử lý request cho user: " + user);
    }

    private void callDatabase() {
        String user = UserContext.getCurrentUser();
        System.out.println("DB query cho user: " + user);
    }
}

// Ví dụ 3: ThreadLocal cho SimpleDateFormat (không thread-safe)
class DateFormatter {
    // Tạo một SimpleDateFormat riêng cho mỗi thread — thread-safe
    private static final ThreadLocal<java.text.SimpleDateFormat> dateFormat =
        ThreadLocal.withInitial(() ->
            new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));

    public static String format(java.util.Date date) {
        return dateFormat.get().format(date); // Thread-safe vì mỗi thread có instance riêng
    }
}

// Cảnh báo: Cách sai trong thread pool
class WrongUsage {
    private static final ThreadLocal<String> context = new ThreadLocal<>();

    public void handleRequest(String value) {
        context.set(value);
        // XỬ LÝ REQUEST...
        // THIẾU: context.remove() — thread này sẽ mang giá trị sang request tiếp theo!
    }
}
```

### Đáp án mẫu

> "`ThreadLocal` cung cấp bản sao biến riêng cho từng thread — mỗi thread đọc/ghi vào slot của mình, không ảnh hưởng thread khác. Tôi dùng nó trong web server để lưu user ID hay transaction ID của request hiện tại, tránh phải truyền qua tất cả các layer. Điểm cực kỳ quan trọng: trong thread pool, thread được tái sử dụng, nên nếu không gọi `remove()` sau khi xử lý xong request, giá trị sẽ tồn tại sang request tiếp theo — gây ra security leak rất nguy hiểm. Tôi luôn đặt `remove()` trong khối `finally` để đảm bảo cleanup dù có exception."

---
