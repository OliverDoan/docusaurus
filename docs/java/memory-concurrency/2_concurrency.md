---
sidebar_position: 2
title: "2. Concurrency (Đồng bộ và Concurrent API)"
---

# Concurrency -- Đồng bộ hóa và Concurrent API

Khi nhiều thread cùng truy cập **dữ liệu chia sẻ**, ta cần **đồng bộ hóa** (synchronization) để tránh kết quả sai. Java cung cấp `synchronized`, `Lock`, các class `Atomic*`, và package `java.util.concurrent` -- bộ công cụ mạnh mẽ cho lập trình concurrent.

**Tương tự đơn giản:** Hãy tưởng tượng một bàn ATM. Nếu 2 người cùng rút tiền cùng lúc, máy có thể trừ tiền sai. Cần **một hàng đợi** -- ai vào trước rút trước. **Lock** chính là "cánh cửa" đảm bảo chỉ 1 người vào ATM tại một thời điểm.

---

## Mục lục

- [1. Race Condition và Critical Section](#1-race-condition-và-critical-section)
- [2. `synchronized`](#2-synchronized)
- [3. `Lock` API](#3-lock-api)
- [4. Atomic classes](#4-atomic-classes)
- [5. ExecutorService và Thread Pool](#5-executorservice-và-thread-pool)
- [6. CompletableFuture](#6-completablefuture)
- [7. Concurrent Collections](#7-concurrent-collections)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Race Condition và Critical Section

**Race Condition** -- nhiều thread đọc/ghi cùng dữ liệu, kết quả phụ thuộc thứ tự (không xác định).

```java
public class RaceDemo {
    static int count = 0;

    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new Thread(() -> { for (int i = 0; i < 10_000; i++) count++; });
        Thread t2 = new Thread(() -> { for (int i = 0; i < 10_000; i++) count++; });
        t1.start(); t2.start();
        t1.join(); t2.join();
        System.out.println(count); // Co the < 20_000
    }
}
```

`count++` thực chất là 3 bước:

1. Đọc `count` từ memory vào CPU
2. Cộng 1
3. Ghi lại vào memory

2 thread chạy xen kẽ có thể "ăn mất" update.

**Critical Section** là đoạn code truy cập shared data -- phải bảo vệ.

---

## 2. `synchronized`

### Synchronized method

```java
class Counter {
    private int count = 0;

    public synchronized void increment() {
        count++;
    }

    public synchronized int get() {
        return count;
    }
}
```

### Synchronized block

```java
class Counter {
    private int count = 0;
    private final Object lock = new Object();

    public void increment() {
        synchronized (lock) {
            count++;
        }
    }
}
```

**Giải thích:**

- `synchronized` dùng **monitor lock** (intrinsic lock) của object
- Tại 1 thời điểm, **chỉ 1 thread** giữ lock đó
- Các thread khác **BLOCKED** chờ

### Static synchronized

```java
class Util {
    public static synchronized void method() {
        // Lock tren Util.class
    }
}
```

---

## 3. `Lock` API

`java.util.concurrent.locks.Lock` linh hoạt hơn `synchronized`.

```java
import java.util.concurrent.locks.*;

class Counter {
    private final ReentrantLock lock = new ReentrantLock();
    private int count = 0;

    public void increment() {
        lock.lock();
        try {
            count++;
        } finally {
            lock.unlock(); // PHAI o finally
        }
    }
}
```

### Ưu điểm hơn `synchronized`

| Tính năng              | `synchronized` | `Lock`            |
| ---------------------- | -------------- | ----------------- |
| Try lock (không block) | Không          | `tryLock()`       |
| Timeout                | Không          | `tryLock(time)`   |
| Interruptible          | Không          | `lockInterruptibly()` |
| Multiple condition     | Không          | `newCondition()`  |
| Fair lock              | Không          | `new ReentrantLock(true)` |

### ReadWriteLock

```java
ReadWriteLock rwLock = new ReentrantReadWriteLock();
Lock readLock = rwLock.readLock();
Lock writeLock = rwLock.writeLock();

// Nhieu thread doc cung luc, nhung chi 1 thread ghi
readLock.lock();
try { /* doc */ } finally { readLock.unlock(); }

writeLock.lock();
try { /* ghi */ } finally { writeLock.unlock(); }
```

---

## 4. Atomic classes

Các class trong `java.util.concurrent.atomic` cung cấp thao tác **nguyên tử** (atomic) -- không cần lock.

```java
import java.util.concurrent.atomic.*;

AtomicInteger count = new AtomicInteger(0);
count.incrementAndGet();    // count = 1
count.addAndGet(5);         // count = 6
count.compareAndSet(6, 10); // Neu = 6 thi set = 10

AtomicReference<String> ref = new AtomicReference<>("hello");
ref.compareAndSet("hello", "world");
```

**CAS (Compare-And-Swap):** Nguyên lý hardware -- "nếu giá trị hiện tại = expected thì set = new". Không cần lock, nhanh hơn synchronized.

### `LongAdder` -- hiệu năng cao hơn `AtomicLong` cho high contention

```java
LongAdder counter = new LongAdder();
counter.increment();
long total = counter.sum();
```

---

## 5. ExecutorService và Thread Pool

Tạo thread thủ công tốn kém. Thread pool **tái sử dụng** thread.

```java
import java.util.concurrent.*;

public class ExecutorDemo {
    public static void main(String[] args) throws Exception {
        // Pool 4 thread
        ExecutorService executor = Executors.newFixedThreadPool(4);

        for (int i = 0; i < 10; i++) {
            final int taskId = i;
            executor.submit(() -> {
                System.out.println("Task " + taskId + " on " + Thread.currentThread().getName());
            });
        }

        executor.shutdown(); // Khong nhan task moi
        executor.awaitTermination(1, TimeUnit.MINUTES);
    }
}
```

### Các loại Executor

| Factory method                          | Mô tả                                       |
| --------------------------------------- | ------------------------------------------- |
| `newFixedThreadPool(n)`                 | Pool cố định n thread                       |
| `newCachedThreadPool()`                 | Tạo thread mới nếu cần, recycle             |
| `newSingleThreadExecutor()`             | 1 thread, task chạy tuần tự                 |
| `newScheduledThreadPool(n)`             | Schedule task delay/định kỳ                 |
| `newWorkStealingPool()`                 | ForkJoinPool, work-stealing                 |
| `newVirtualThreadPerTaskExecutor()`     | Virtual thread (Java 21+)                   |

### Future để lấy kết quả

```java
Future<Integer> future = executor.submit(() -> 42);
Integer result = future.get(); // Block den khi xong
```

---

## 6. CompletableFuture

API hiện đại cho async programming (Java 8+).

```java
import java.util.concurrent.CompletableFuture;

CompletableFuture<String> future = CompletableFuture
    .supplyAsync(() -> {
        // Tac vu nang
        return "Du lieu";
    })
    .thenApply(data -> data.toUpperCase())
    .thenApply(data -> "[" + data + "]")
    .exceptionally(ex -> "Loi: " + ex.getMessage());

System.out.println(future.join()); // [DU LIEU]
```

### Kết hợp nhiều future

```java
CompletableFuture<String> a = CompletableFuture.supplyAsync(() -> "A");
CompletableFuture<String> b = CompletableFuture.supplyAsync(() -> "B");

// Cho tat ca
CompletableFuture.allOf(a, b).join();

// Lay ket qua dau tien
CompletableFuture<Object> first = CompletableFuture.anyOf(a, b);

// Combine
CompletableFuture<String> combined = a.thenCombine(b, (x, y) -> x + y);
```

---

## 7. Concurrent Collections

Collection chuẩn **không thread-safe**. Cần dùng:

| Collection                  | Thay thế cho      | Đặc điểm                              |
| --------------------------- | ----------------- | ------------------------------------- |
| `ConcurrentHashMap`         | `HashMap`         | Khóa từng segment, đọc song song      |
| `CopyOnWriteArrayList`      | `ArrayList`       | Copy mảng khi ghi, đọc cực nhanh      |
| `ConcurrentLinkedQueue`     | `LinkedList`      | Queue non-blocking                    |
| `BlockingQueue`             | -                 | Producer-consumer, block khi đầy/rỗng |
| `LinkedBlockingQueue`       | -                 | BlockingQueue thông dụng              |

```java
Map<String, Integer> map = new ConcurrentHashMap<>();
map.computeIfAbsent("key", k -> compute(k));
map.merge("count", 1, Integer::sum);

BlockingQueue<String> queue = new LinkedBlockingQueue<>(100);
queue.put("item"); // block neu day
String item = queue.take(); // block neu rong
```

---

## Khi nào dùng?

- **`synchronized`**: Đơn giản, đủ cho hầu hết case
- **`Lock`**: Cần tính năng cao -- tryLock, timeout, fair, multiple condition
- **`Atomic*`**: Counter, flag đơn giản
- **`ExecutorService`**: Mọi project production -- KHÔNG tạo thread thủ công
- **`CompletableFuture`**: Async chain, composition
- **`ConcurrentHashMap`**: Map chia sẻ giữa thread
- **Best practice:**
  - **Hạn chế shared state** -- code không state là an toàn nhất
  - Ưu tiên **immutable object**
  - Lock càng nhỏ càng tốt
  - Đặt `try-finally` cho `lock.unlock()`
  - Không lock trên `String` hoặc `Integer` cached

---

## Lỗi thường gặp

### Lỗi 1: Forget `unlock`

```java
// SAI -- neu exception, lock khong duoc release
lock.lock();
doSomething();
lock.unlock();

// DUNG
lock.lock();
try {
    doSomething();
} finally {
    lock.unlock();
}
```

### Lỗi 2: Deadlock

```java
// SAI -- thread A lock X roi cho Y; thread B lock Y roi cho X
Thread A: lock(X); lock(Y);
Thread B: lock(Y); lock(X);
// -> deadlock

// DUNG -- lock theo cung thu tu
Thread A: lock(X); lock(Y);
Thread B: lock(X); lock(Y);
```

### Lỗi 3: Lock trên object không cố định

```java
// SAI -- moi lan tao Integer moi, lock khac nhau
private Integer lock = 0;
synchronized (lock) { lock++; } // BUG!

// DUNG
private final Object lock = new Object();
```

### Lỗi 4: Không shutdown ExecutorService

```java
// SAI -- chuong trinh khong ket thuc
ExecutorService pool = Executors.newFixedThreadPool(4);
// quen shutdown

// DUNG
try {
    pool.shutdown();
    pool.awaitTermination(1, TimeUnit.MINUTES);
} catch (InterruptedException e) {
    pool.shutdownNow();
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: `synchronized` và `volatile` khác nhau thế nào?

**Trả lời:**

- `synchronized`: Đảm bảo **mutual exclusion** (1 thread tại 1 thời điểm) và **visibility** (thay đổi thấy được giữa thread)
- `volatile`: Chỉ đảm bảo **visibility** -- mọi thread thấy giá trị mới nhất. Không đảm bảo atomic (nếu là `i++`)

Dùng `volatile` cho flag boolean đơn giản, `synchronized`/Atomic cho composite operation.

### Câu 2: Deadlock là gì? Cách phòng?

**Trả lời:** **Deadlock** -- 2 thread chờ lock lẫn nhau, không thread nào tiến được. 4 điều kiện cần (Coffman): mutual exclusion, hold and wait, no preemption, circular wait. Cách phòng:

- Lock **theo cùng thứ tự** ở mọi nơi
- Dùng `tryLock` với timeout
- Tránh lock nhiều object cùng lúc

### Câu 3: `ExecutorService` ưu điểm gì so với tạo Thread?

**Trả lời:**

- **Tái sử dụng** thread -- không tốn tạo/hủy
- **Quản lý queue** task tự động
- **Giới hạn** số thread -- tránh OutOfMemory
- API thống nhất với `Future`, `CompletableFuture`
- Tích hợp `ScheduledExecutorService` cho schedule task

### Câu 4: `ConcurrentHashMap` hoạt động thế nào?

**Trả lời:** Java 7: chia map thành **16 segment**, lock từng segment riêng -- 16 thread ghi song song được. Java 8+: bỏ segment, dùng **CAS** + lock per bucket. Đọc gần như không lock. Hiệu năng cao gấp nhiều lần `Collections.synchronizedMap`.

### Câu 5: `CompletableFuture` vs `Future`?

**Trả lời:** `Future` cũ -- chỉ có `get()` block. **`CompletableFuture`** mới:

- Chain xử lý với `thenApply`, `thenCompose`, `thenCombine`
- Xử lý exception với `exceptionally`, `handle`
- Combine nhiều future với `allOf`, `anyOf`
- Non-blocking, callback-based
- Hỗ trợ async với executor tùy chỉnh
