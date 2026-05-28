---
sidebar_position: 4
title: "4. Java Memory Model (JMM)"
---

# Java Memory Model -- Mô hình bộ nhớ Java

**Java Memory Model (JMM)** là **bộ quy tắc** định nghĩa cách thread tương tác với memory: khi nào một thread thấy được thay đổi của thread khác, khi nào compiler/CPU được phép sắp xếp lại lệnh. Đây là **kiến thức cốt lõi** để hiểu concurrency Java.

**Tương tự đơn giản:** Hãy tưởng tượng JMM là **"luật giao thông"** cho thread. Nếu không có luật, ai cũng làm theo ý mình -- tai nạn (race condition, visibility bug). Luật quy định: "Đèn đỏ phải dừng" (lock), "Có biển STOP phải nhường" (happens-before)...

---

## Mục lục

- [1. JMM là gì?](#1-jmm-là-gì)
- [2. Main Memory và Working Memory](#2-main-memory-và-working-memory)
- [3. Happens-before](#3-happens-before)
- [4. Reordering](#4-reordering)
- [5. Final field và Safe Publication](#5-final-field-và-safe-publication)
- [6. Memory Barrier](#6-memory-barrier)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. JMM là gì?

JMM định nghĩa:

1. Khi nào ghi của thread A **visible** cho thread B
2. Compiler/JIT/CPU được phép reorder lệnh nào
3. Cách `synchronized`, `volatile`, `final` ảnh hưởng đến memory

JMM được mô tả trong **JSR-133** (Java Memory Model and Thread Specification, 2004) và là **chuẩn ngôn ngữ** -- mọi JVM phải tuân theo.

---

## 2. Main Memory và Working Memory

JMM mô hình hóa memory thành 2 phần:

- **Main Memory**: Memory chính (RAM) -- chứa tất cả biến shared
- **Working Memory**: Memory "làm việc" của mỗi thread (CPU cache, registers)

```
   Thread 1                    Thread 2
   +-----+                     +-----+
   |  WM | <-- cache cua T1    |  WM | <-- cache cua T2
   +--+--+                     +--+--+
      |                           |
      +-------+-------------------+
              |
         +----v-----+
         |  Main    |
         |  Memory  |
         +----------+
```

Khi thread đọc biến, có thể đọc từ working memory (cache). Khi ghi, có thể ghi vào working memory trước.

**Hệ quả:** Nếu không có cơ chế đồng bộ, thread A thay đổi biến, thread B không thấy.

---

## 3. Happens-before

**Happens-before** là khái niệm trung tâm của JMM. Nếu hành động X **happens-before** Y thì:

- Mọi thay đổi của X **visible** với Y
- X được thực hiện **trước** Y (không reorder)

### Các quy tắc happens-before chính

1. **Program order**: Trong cùng thread, lệnh trước HB lệnh sau
2. **Monitor lock**: `unlock` HB `lock` tiếp theo trên cùng monitor
3. **Volatile**: Ghi vào volatile HB đọc volatile đó
4. **Thread start**: `Thread.start()` HB mọi action trong thread đó
5. **Thread join**: Action trong thread HB `join()` trả về
6. **Transitivity**: Nếu A HB B và B HB C thì A HB C

### Ví dụ

```java
class Demo {
    int x = 0;
    volatile boolean ready = false;

    // Thread A
    void write() {
        x = 42;        // 1
        ready = true;  // 2
    }

    // Thread B
    void read() {
        if (ready) {           // 3
            System.out.println(x); // 4 -- chac chan in 42
        }
    }
}
```

**Phân tích:**

- 1 HB 2 (program order)
- 2 HB 3 (volatile write HB volatile read)
- 3 HB 4 (program order)
- Vậy 1 HB 4 -- thread B chắc chắn thấy `x = 42`

---

## 4. Reordering

Compiler, JIT, và CPU có thể **sắp xếp lại lệnh** để tối ưu hiệu năng. Trong single-thread, người dùng không nhận ra. Nhưng trong multi-thread, có thể gây bug.

### Ví dụ reorder

```java
// Code goc
x = 1;
y = 2;

// CPU/compiler co the chay
y = 2;
x = 1;
```

Trong single-thread, kết quả như nhau. Trong multi-thread, thread khác có thể thấy `y = 2` trước `x = 1`.

### Ngăn reorder

| Cơ chế              | Ngăn reorder?                          |
| ------------------- | -------------------------------------- |
| `synchronized`      | Lock/unlock không bị reorder qua       |
| `volatile`          | Đọc/ghi volatile không reorder qua     |
| `final` (constructor) | Init final field xong trước khi expose object |
| `Atomic*`           | CAS có memory barrier                  |

---

## 5. Final field và Safe Publication

`final` field có quy tắc đặc biệt trong JMM.

```java
class Immutable {
    final int value;

    Immutable(int v) {
        this.value = v;
    }
}

// Thread A
Immutable obj = new Immutable(42);

// Thread B
// Khi thay obj != null, chac chan thay value = 42
// Du khong dung volatile, synchronized
```

**Safe Publication** -- 1 object được "xuất bản" an toàn nếu thread khác chỉ thấy reference sau khi object đã init xong. Cách:

- `volatile` field
- `synchronized`
- `final` field (immutable)
- `Atomic*` reference
- `static` initializer

---

## 6. Memory Barrier

Để thực thi happens-before, JVM emit **memory barrier** (cơ chế hardware):

| Barrier            | Tác dụng                                |
| ------------------ | --------------------------------------- |
| `LoadLoad`         | Load1 hoàn thành trước Load2            |
| `StoreStore`       | Store1 hoàn thành trước Store2          |
| `LoadStore`        | Load1 hoàn thành trước Store2           |
| `StoreLoad`        | Store1 hoàn thành trước Load2 (đắt nhất) |

Người lập trình Java **không trực tiếp** dùng -- chỉ qua `volatile`, `synchronized`...

---

## Khi nào dùng?

- **Cần hiểu JMM khi:**
  - Viết code concurrent phức tạp
  - Debug race condition khó hiểu
  - Tối ưu performance multi-thread
- **Best practice:**
  - **Hạn chế shared mutable state** -- vấn đề biến mất nếu không chia sẻ
  - Dùng **immutable object** -- inherently thread-safe
  - Hiểu rõ trước khi dùng `volatile` -- không phải "tất cả công dụng"
  - Test với **stress test** -- nhiều thread, nhiều iteration

---

## Lỗi thường gặp

### Lỗi 1: Nghĩ assignment là atomic

```java
// SAI -- long (64-bit) khong atomic tren JVM 32-bit
long count = 1234567890L;
// Thread khac co the thay nua tren, nua duoi

// DUNG -- volatile long hoac AtomicLong
volatile long count;
```

### Lỗi 2: Publish object trước khi init xong

```java
// SAI
class Holder {
    static Singleton instance;
    static void init() {
        instance = new Singleton(); // co the bi reorder
    }
}

// DUNG
class Holder {
    static volatile Singleton instance;
}
```

### Lỗi 3: Dùng non-volatile flag

```java
// SAI
boolean stop = false;
new Thread(() -> { while (!stop) {} }).start();
// thread co the cache stop -> khong dung

// DUNG
volatile boolean stop = false;
```

### Lỗi 4: Cho rằng `synchronized` không cần volatile

```java
// DUNG -- synchronized da dam bao visibility
private int count;
synchronized void inc() { count++; }
synchronized int get() { return count; }

// Khong can volatile vi synchronized da dam bao
```

---

## Câu hỏi phỏng vấn

### Câu 1: JMM giải quyết vấn đề gì?

**Trả lời:** JMM định nghĩa **chính xác** cách thread tương tác qua memory: khi nào ghi visible, khi nào được reorder. Không có JMM, kết quả code multi-thread phụ thuộc JVM, OS, CPU -- không portable. JMM đảm bảo "Write Once, Run Anywhere" cũng đúng cho concurrent code.

### Câu 2: Happens-before nghĩa là gì?

**Trả lời:** Quan hệ giữa 2 action. Nếu X HB Y thì:

- Mọi thay đổi của X **visible** với Y
- Compiler/CPU **không reorder** Y trước X (về mặt observable)

Các quy tắc HB: program order, monitor lock, volatile, thread start/join, final, transitivity.

### Câu 3: Tại sao `long`/`double` không atomic?

**Trả lời:** Trên JVM 32-bit, JMM cho phép `long`/`double` (64 bit) được đọc/ghi thành 2 phần 32-bit. Thread khác có thể thấy nửa cũ + nửa mới. Để atomic, dùng `volatile long`/`AtomicLong`. Trên JVM 64-bit, thường atomic nhưng đừng dựa vào.

### Câu 4: `final` field có gì đặc biệt?

**Trả lời:** JMM bảo đảm: khi thread khác thấy reference của object, mọi `final` field đã init xong. Đây là cơ sở để **immutable object** thread-safe mà không cần `volatile`/`synchronized`. String, Integer, LocalDate -- tất cả đều dựa vào quy tắc này.

### Câu 5: Reordering có bị cấm hoàn toàn không?

**Trả lời:** **Không**. Reorder vẫn xảy ra để tối ưu. JMM chỉ **cấm reorder qua** các cấu trúc đồng bộ (lock, volatile, final). Trong code thường, compiler tự do reorder miễn không thay đổi single-thread semantic. Đây là lý do code multi-thread cần biết cách dùng các từ khóa đồng bộ.
