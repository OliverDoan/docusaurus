---
sidebar_position: 1
title: "1. Threads (Đa luồng cơ bản)"
---

# Threads -- Đa luồng trong Java

**Thread** (luồng) là **đơn vị thực thi nhỏ nhất** mà CPU lên lịch. Một chương trình Java có thể có nhiều thread chạy **đồng thời** (parallel) hoặc **đan xen** (concurrent), giúp tận dụng đa lõi CPU và xử lý nhiều việc cùng lúc.

**Tương tự đơn giản:** Hãy tưởng tượng một nhà hàng. Một chương trình **single-thread** giống quán có **một đầu bếp** -- nấu xong món A mới nấu món B. Một chương trình **multi-thread** giống quán có **nhiều đầu bếp** -- mỗi người nấu một món song song -- ra món nhanh hơn.

---

## Mục lục

- [1. Thread là gì?](#1-thread-là-gì)
- [2. Tạo Thread](#2-tạo-thread)
- [3. Vòng đời Thread](#3-vòng-đời-thread)
- [4. Các phương thức quan trọng](#4-các-phương-thức-quan-trọng)
- [5. Daemon Thread](#5-daemon-thread)
- [6. Thread Priority](#6-thread-priority)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Thread là gì?

Mọi chương trình Java đều có ít nhất **1 thread** -- thread `main`. Khi chạy:

```java
public static void main(String[] args) {
    System.out.println(Thread.currentThread().getName()); // main
}
```

Bạn có thể tạo thêm nhiều thread khác để chạy việc song song.

**Giải thích thuật ngữ:**

- **Process:** Một chương trình đang chạy (có memory space riêng)
- **Thread:** Một "đường thực thi" trong process, chia sẻ memory với thread khác trong cùng process
- **Concurrent:** Nhiều task **đan xen** trên cùng CPU (chuyển đổi nhanh)
- **Parallel:** Nhiều task **thực sự đồng thời** trên nhiều core khác nhau

---

## 2. Tạo Thread

### Cách 1: Kế thừa `Thread`

```java
public class MyThread extends Thread {
    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println(getName() + ": " + i);
        }
    }

    public static void main(String[] args) {
        MyThread t1 = new MyThread();
        MyThread t2 = new MyThread();
        t1.start();
        t2.start();
    }
}
```

### Cách 2: Implement `Runnable` (khuyến nghị)

```java
public class RunnableDemo implements Runnable {
    @Override
    public void run() {
        System.out.println("Chay tu thread: " + Thread.currentThread().getName());
    }

    public static void main(String[] args) {
        Thread t = new Thread(new RunnableDemo());
        t.start();
    }
}
```

### Cách 3: Lambda (ngắn nhất)

```java
Thread t = new Thread(() -> {
    System.out.println("Hello tu thread!");
});
t.start();
```

### Cách 4: `Callable` (có return value)

```java
import java.util.concurrent.*;

public class CallableDemo {
    public static void main(String[] args) throws Exception {
        ExecutorService executor = Executors.newSingleThreadExecutor();
        Future<Integer> future = executor.submit(() -> {
            Thread.sleep(1000);
            return 42;
        });
        System.out.println("Ket qua: " + future.get()); // 42
        executor.shutdown();
    }
}
```

**So sánh:**

| Cách        | Ưu điểm                          | Khi nào dùng                |
| ----------- | -------------------------------- | --------------------------- |
| Extend Thread | Đơn giản                       | Học, demo                   |
| Runnable    | Tách logic khỏi Thread, đa kế thừa | Phổ biến nhất             |
| Lambda      | Ngắn gọn                         | Task đơn giản               |
| Callable    | Có return + exception            | Cần kết quả từ thread       |

---

## 3. Vòng đời Thread

```
NEW         --> Vua tao, chua start
RUNNABLE    --> Da start, dang chay hoac san sang
BLOCKED     --> Cho lock cua synchronized
WAITING     --> Cho thread khac (wait, join)
TIMED_WAITING --> Cho co timeout (sleep, wait(ms))
TERMINATED  --> Da ket thuc
```

```java
public class LifecycleDemo {
    public static void main(String[] args) throws InterruptedException {
        Thread t = new Thread(() -> {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {}
        });

        System.out.println(t.getState()); // NEW
        t.start();
        System.out.println(t.getState()); // RUNNABLE
        Thread.sleep(100);
        System.out.println(t.getState()); // TIMED_WAITING
        t.join();
        System.out.println(t.getState()); // TERMINATED
    }
}
```

---

## 4. Các phương thức quan trọng

### `start()` vs `run()`

```java
Thread t = new Thread(() -> System.out.println(Thread.currentThread().getName()));

t.start();  // Tao thread moi, chay // "Thread-0"
t.run();    // Chay tren thread hien tai, KHONG tao thread moi // "main"
```

**Quy tắc:** Luôn gọi `start()`, không gọi `run()` trực tiếp.

### `sleep()`

```java
Thread.sleep(1000); // Tam dung 1 giay, throws InterruptedException
```

### `join()`

Chờ thread khác kết thúc.

```java
Thread t1 = new Thread(() -> {
    try { Thread.sleep(2000); } catch (InterruptedException e) {}
    System.out.println("t1 xong");
});
t1.start();
t1.join(); // main cho t1 ket thuc
System.out.println("main tiep tuc");
```

### `interrupt()`

Đánh thức/ngắt thread đang `sleep`/`wait`/`join`.

```java
Thread t = new Thread(() -> {
    try {
        Thread.sleep(10_000);
    } catch (InterruptedException e) {
        System.out.println("Bi ngat!");
    }
});
t.start();
Thread.sleep(1000);
t.interrupt(); // Danh thuc t
```

### `yield()`

Gợi ý scheduler chuyển sang thread khác (không đảm bảo).

---

## 5. Daemon Thread

Daemon thread là **thread phụ** -- JVM **không chờ** nó hoàn thành khi tắt.

```java
Thread daemon = new Thread(() -> {
    while (true) {
        System.out.println("Daemon dang chay");
        try { Thread.sleep(500); } catch (InterruptedException e) {}
    }
});
daemon.setDaemon(true);
daemon.start();

Thread.sleep(2000);
// Main ket thuc -> JVM tat -> daemon dung
```

**Ví dụ daemon:** Garbage Collector, background log writer.

---

## 6. Thread Priority

```java
t.setPriority(Thread.MIN_PRIORITY);  // 1
t.setPriority(Thread.NORM_PRIORITY); // 5 (mac dinh)
t.setPriority(Thread.MAX_PRIORITY);  // 10
```

**Lưu ý:** Priority chỉ là **gợi ý** cho scheduler, không đảm bảo thứ tự thực thi.

---

## Khi nào dùng?

- **Dùng Thread khi:**
  - Cần làm nhiều việc song song (tải file, gọi API, render UI)
  - Tận dụng đa core CPU
  - Tách công việc nặng khỏi luồng chính (UI không freeze)
- **Không nên dùng Thread thuần khi:**
  - Có thư viện cao hơn: `ExecutorService`, `CompletableFuture`, Virtual Threads (Java 21+)
  - Quản lý nhiều thread (>100) -- dùng thread pool
- **Best practice:**
  - Đặt **tên thread** -- dễ debug (`thread.setName("worker-1")`)
  - Xử lý `InterruptedException` đúng
  - Tránh `Thread.stop()` -- đã deprecated, không an toàn
  - Dùng `ExecutorService` thay vì tạo Thread thủ công

---

## Lỗi thường gặp

### Lỗi 1: Gọi `run()` thay vì `start()`

```java
// SAI -- chay tren thread hien tai
new Thread(task).run();

// DUNG -- tao thread moi
new Thread(task).start();
```

### Lỗi 2: Nuốt `InterruptedException`

```java
// SAI -- mat trang thai interrupt
try {
    Thread.sleep(1000);
} catch (InterruptedException e) {
    // im lang
}

// DUNG -- khoi phuc lai trang thai
try {
    Thread.sleep(1000);
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();
}
```

### Lỗi 3: Race condition

```java
// SAI -- count khong dong bo
class Counter {
    int count = 0;
    void inc() { count++; }
}
// 2 thread cung inc() -> ket qua co the sai

// DUNG -- synchronized hoac AtomicInteger
class Counter {
    AtomicInteger count = new AtomicInteger();
    void inc() { count.incrementAndGet(); }
}
```

### Lỗi 4: Tạo quá nhiều Thread

```java
// SAI -- tao 10000 thread
for (int i = 0; i < 10000; i++) {
    new Thread(task).start();
}

// DUNG -- thread pool
ExecutorService pool = Executors.newFixedThreadPool(10);
for (int i = 0; i < 10000; i++) pool.submit(task);
```

---

## Câu hỏi phỏng vấn

### Câu 1: Sự khác biệt giữa Process và Thread?

**Trả lời:**

- **Process**: Chương trình đang chạy -- có memory riêng (heap, stack, code)
- **Thread**: Đơn vị nhỏ hơn trong process -- chia sẻ heap, có stack riêng

Tạo thread nhẹ hơn tạo process. Communication giữa thread dễ hơn (chia sẻ memory) nhưng cần đồng bộ.

### Câu 2: `Runnable` vs `Thread` -- nên dùng cái nào?

**Trả lời:** **Runnable** tốt hơn vì:

- Java chỉ cho extend 1 class -- extend Thread mất quyền kế thừa khác
- Tách logic (task) khỏi cơ chế chạy (thread) -- linh hoạt hơn
- Dùng được với `ExecutorService`

### Câu 3: `start()` và `run()` khác gì?

**Trả lời:** `start()` **tạo thread mới**, JVM gọi `run()` trên thread đó. `run()` gọi trực tiếp **chỉ chạy trên thread hiện tại**, không tạo thread mới. Lỗi này rất phổ biến với người mới.

### Câu 4: Race condition là gì?

**Trả lời:** Khi 2 thread cùng đọc/ghi shared variable **không đồng bộ**, kết quả phụ thuộc thứ tự thực thi -- không xác định. Ví dụ `count++` thực chất là 3 bước (read, add, write). 2 thread chạy xen kẽ có thể mất update. Cách giải: `synchronized`, `AtomicInteger`, `Lock`, `volatile` (tùy trường hợp).

### Câu 5: Daemon thread là gì?

**Trả lời:** Thread phụ trợ -- JVM **không chờ** daemon thread hoàn thành khi tắt. Khi tất cả non-daemon thread kết thúc, JVM tắt và kill daemon. Ví dụ: Garbage Collector, finalizer thread. Set bằng `setDaemon(true)` **trước khi `start()`**.
