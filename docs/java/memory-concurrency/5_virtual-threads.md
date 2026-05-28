---
sidebar_position: 5
title: "5. Virtual Threads (Java 21+)"
---

# Virtual Threads -- Luồng ảo trong Java 21+

**Virtual Threads** (luồng ảo) là tính năng đột phá của **Project Loom** -- chính thức ra mắt trong **Java 21 LTS** (2023). Cho phép tạo **hàng triệu thread** trong một JVM với cost thấp -- thay đổi hoàn toàn cách viết code concurrent.

**Tương tự đơn giản:** Trước Java 21, thread như **nhân viên thực thụ** -- mỗi người tốn lương, văn phòng (1MB stack/thread). Có 1000 task = 1000 nhân viên = tốn kém. **Virtual Threads** giống **freelancer** -- thuê khi cần, trả về khi xong -- 1 triệu freelancer cũng không tốn nhiều.

---

## Mục lục

- [1. Platform Thread vs Virtual Thread](#1-platform-thread-vs-virtual-thread)
- [2. Cách tạo Virtual Thread](#2-cách-tạo-virtual-thread)
- [3. Cơ chế hoạt động](#3-cơ-chế-hoạt-động)
- [4. Khi nào dùng?](#4-khi-nào-dùng)
- [5. Ví dụ thực tế](#5-ví-dụ-thực-tế)
- [6. Hạn chế và lưu ý](#6-hạn-chế-và-lưu-ý)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Platform Thread vs Virtual Thread

| Đặc điểm        | Platform Thread (truyền thống) | Virtual Thread        |
| --------------- | ------------------------------ | --------------------- |
| Backed by       | OS thread (1:1)                | Carrier thread (M:N)  |
| Stack size      | ~1MB                           | Vài KB (động)         |
| Số lượng tối đa | ~vài nghìn                     | Hàng triệu            |
| Tạo/hủy        | Tốn (~vài ms)                  | Nhẹ (~vài µs)         |
| Phù hợp        | CPU-bound                      | I/O-bound             |
| Scheduling      | OS scheduler                   | JVM scheduler         |

**Giải thích thuật ngữ:**

- **Platform Thread:** Thread truyền thống -- mỗi thread Java tương ứng 1 OS thread
- **Virtual Thread:** Thread "ảo" -- nhiều virtual thread chia sẻ ít platform thread (carrier)
- **Carrier Thread:** Platform thread "chở" virtual thread chạy

---

## 2. Cách tạo Virtual Thread

### Cách 1: `Thread.startVirtualThread`

```java
Thread vt = Thread.startVirtualThread(() -> {
    System.out.println("Chay tren VT");
});
vt.join();
```

### Cách 2: `Thread.ofVirtual()`

```java
Thread vt = Thread.ofVirtual()
    .name("worker")
    .start(() -> System.out.println("Hello"));
```

### Cách 3: ExecutorService

```java
import java.util.concurrent.Executors;

try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 100_000; i++) {
        executor.submit(() -> {
            try {
                Thread.sleep(1000);
                System.out.println("done");
            } catch (InterruptedException e) {}
        });
    }
} // auto shutdown
```

**Cùng API như Thread thường** -- không cần học lại.

---

## 3. Cơ chế hoạt động

```
Virtual Threads (1 trieu)
  |  |  |  |  |  |  |  |  |  |
  v  v  v  v  v  v  v  v  v  v
Carrier Threads (10 - bang so CPU core)
  |  |  |  |  |
  v  v  v  v  v
OS Threads
```

### Cơ chế "Unmount" khi I/O

```java
Thread.ofVirtual().start(() -> {
    System.out.println("Step 1");
    // Khi goi I/O blocking (sleep, socket read...):
    Thread.sleep(1000); // VT bi UNMOUNT khoi carrier
    // Carrier duoc dung cho VT khac
    System.out.println("Step 2"); // VT MOUNT lai khi I/O xong
});
```

Khi virtual thread block (sleep, I/O), JVM **unmount** nó khỏi carrier thread, cho VT khác chạy. Khi I/O xong, VT được mount lại (có thể trên carrier khác).

**Kết quả:** 1 carrier có thể "phục vụ" hàng nghìn virtual thread đang chờ I/O.

---

## 4. Khi nào dùng?

### Nên dùng Virtual Threads cho:

- **I/O-bound tasks**: gọi DB, REST API, đọc file
- **Server-side request handling**: mỗi request 1 VT
- **Crawler, batch job với nhiều task song song**
- **Code blocking style** -- không cần async/reactive

### KHÔNG dùng Virtual Threads cho:

- **CPU-bound tasks**: tính toán nặng, encoding (vẫn dùng platform thread + ForkJoinPool)
- **Long-lived threads**: thread chạy mãi mãi -- không lợi
- **Code dùng `synchronized` heavy** -- VT bị "pin" carrier (xem hạn chế)

---

## 5. Ví dụ thực tế

### Trước Java 21 -- Thread Pool

```java
// Pool 200 thread, chi xu ly duoc 200 request song song
ExecutorService pool = Executors.newFixedThreadPool(200);

for (int i = 0; i < 10_000; i++) {
    pool.submit(() -> {
        // Goi API ngoai: 90% thoi gian cho I/O
        callExternalApi();
    });
}
// Phai cho lau vi pool han che
```

### Với Virtual Threads

```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 10_000; i++) {
        executor.submit(() -> {
            callExternalApi(); // VT block khi I/O, carrier phuc vu VT khac
        });
    }
}
// 10_000 task chay song song that su
```

### Spring Boot 3.2+ tự động bật

```yaml
spring:
  threads:
    virtual:
      enabled: true
```

Tomcat dùng VT cho mọi request -- xử lý 100k request/sec mà không cần reactive code.

---

## 6. Hạn chế và lưu ý

### Pinning -- VT bị "ghim" vào carrier

Khi VT chạy code trong `synchronized` block hoặc native method, nó **không unmount** được -- carrier bị "ghim". Nếu nhiều VT bị pin, hiệu năng giảm.

```java
synchronized (lock) {
    Thread.sleep(1000); // VT bi PIN, carrier khong duoc free
}
```

**Cách tránh:** Dùng `ReentrantLock` thay `synchronized` cho VT.

```java
lock.lock();
try {
    Thread.sleep(1000); // OK, unmount duoc
} finally {
    lock.unlock();
}
```

### ThreadLocal

VT vẫn hỗ trợ `ThreadLocal` nhưng có thể tốn memory -- mỗi VT có ThreadLocal riêng. Hạn chế dùng nếu có 1 triệu VT.

### Performance debug

- `jcmd <pid> Thread.dump_to_file` để xem dump VT
- JFR (Java Flight Recorder) hỗ trợ VT events

---

## Lỗi thường gặp

### Lỗi 1: Dùng VT cho CPU-bound

```java
// SAI -- VT khong giup CPU-bound
try (var ex = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 1_000_000; i++) {
        ex.submit(() -> heavyCompute()); // Khong nhanh hon
    }
}

// DUNG -- platform thread + ForkJoinPool
ForkJoinPool.commonPool().submit(() -> heavyCompute());
```

### Lỗi 2: Pool VT

```java
// SAI -- VT khong can pool, tao moi van re
ExecutorService pool = Executors.newFixedThreadPool(100, Thread.ofVirtual().factory());

// DUNG -- per task
Executors.newVirtualThreadPerTaskExecutor();
```

### Lỗi 3: Block trong synchronized

```java
// SAI -- pin carrier
synchronized (lock) {
    Thread.sleep(1000);
}

// DUNG -- ReentrantLock
lock.lock();
try { Thread.sleep(1000); } finally { lock.unlock(); }
```

### Lỗi 4: Dùng ThreadLocal nặng cho mỗi VT

```java
// SAI -- 1 trieu VT * thread-local 1MB = 1TB
ThreadLocal<BufferedImage> image = ...

// DUNG -- ScopedValue (Java 21+) hoac chia se cache
```

---

## Câu hỏi phỏng vấn

### Câu 1: Virtual Thread khác Platform Thread thế nào?

**Trả lời:** Platform Thread = 1 OS thread (~1MB), tạo tốn, giới hạn vài nghìn. Virtual Thread = thread "ảo" do JVM quản lý, vài KB, có thể tạo hàng triệu. Khi VT block I/O, JVM unmount khỏi carrier (platform thread bên dưới) -- carrier phục vụ VT khác. Phù hợp I/O-bound workload.

### Câu 2: Khi nào dùng VT, khi nào dùng PT?

**Trả lời:**

- **VT**: I/O-bound (HTTP, DB, file), server request handling -- nơi thread mostly waiting
- **PT**: CPU-bound (math, image processing) -- nơi thread thực sự dùng CPU

VT không nhanh hơn cho CPU work -- vẫn cần PT phía dưới làm việc.

### Câu 3: "Pinning" là gì?

**Trả lời:** Khi VT vào `synchronized` block hoặc native method, nó không thể unmount -- "ghim" vào carrier thread. Nếu I/O xảy ra trong synchronized, cả carrier bị block -- mất lợi thế của VT. Cách tránh: dùng `ReentrantLock` thay `synchronized`.

### Câu 4: VT có thay reactive programming không?

**Trả lời:** Phần lớn use case có. Reactive (WebFlux, Reactor) phức tạp, học khó, debug khó. VT cho phép viết code **blocking style đơn giản** mà vẫn scale tốt. Tuy nhiên, reactive vẫn ưu thế cho streaming, backpressure phức tạp.

### Câu 5: VT pool có cần thiết không?

**Trả lời:** **Không**. VT cost gần 0 -- tạo mới mỗi task vẫn rẻ hơn pool overhead. Dùng `Executors.newVirtualThreadPerTaskExecutor()` -- tạo 1 VT mỗi task, không pool. Pool chỉ có ý nghĩa cho PT (đắt tạo).
