---
sidebar_position: 3
title: "3. Từ khóa volatile"
---

# Từ khóa `volatile` -- Đảm bảo visibility giữa thread

`volatile` là một từ khóa **rất ngắn nhưng rất quan trọng** trong lập trình đa luồng. Nó đảm bảo **visibility** -- mọi thread đọc biến đều thấy giá trị mới nhất, không bị cache trong CPU.

**Tương tự đơn giản:** Hãy tưởng tượng một bảng thông báo trong văn phòng. Mỗi nhân viên có **bảng nháp riêng** ở bàn -- tiết kiệm thời gian không phải ra xem bảng chính. Nhưng nếu bảng chính cập nhật, nhân viên không biết. **`volatile`** giống dán nhãn: "biến này QUAN TRỌNG -- luôn ra bảng chính đọc, không xem nháp".

---

## Mục lục

- [1. Vấn đề visibility](#1-vấn-đề-visibility)
- [2. `volatile` là gì?](#2-volatile-là-gì)
- [3. Visibility vs Atomicity](#3-visibility-vs-atomicity)
- [4. Khi nào dùng volatile](#4-khi-nào-dùng-volatile)
- [5. Double-checked Locking](#5-double-checked-locking)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Vấn đề visibility

CPU hiện đại có **cache** nhiều cấp (L1, L2, L3). Mỗi core có cache riêng. Khi thread T1 ghi biến `flag`, giá trị có thể chỉ nằm ở cache của core 1 -- thread T2 trên core 2 vẫn đọc giá trị cũ từ cache của nó.

```java
public class VisibilityProblem {
    static boolean running = true; // KHONG volatile

    public static void main(String[] args) throws InterruptedException {
        Thread t = new Thread(() -> {
            while (running) {
                // do something
            }
            System.out.println("Da dung");
        });
        t.start();

        Thread.sleep(1000);
        running = false; // Co the t khong bao gio thay -> vong lap vo tan
    }
}
```

**Vấn đề:** Thread `t` có thể **cache** giá trị `running = true`, không bao giờ thấy `false` từ main.

---

## 2. `volatile` là gì?

Thêm `volatile` -- mọi thao tác đọc/ghi đi thẳng vào **main memory**, không qua cache.

```java
public class VisibilityFixed {
    static volatile boolean running = true; // OK

    public static void main(String[] args) throws InterruptedException {
        Thread t = new Thread(() -> {
            while (running) { /* ... */ }
            System.out.println("Da dung");
        });
        t.start();

        Thread.sleep(1000);
        running = false; // t thay duoc, dung lai
    }
}
```

### `volatile` đảm bảo:

1. **Visibility**: Mọi thread thấy giá trị mới nhất
2. **Happens-before**: Ghi vào volatile xảy ra **trước** mọi đọc sau đó
3. **No reordering**: Compiler/CPU không sắp xếp lại các thao tác qua volatile

### `volatile` KHÔNG đảm bảo:

- **Atomicity** cho composite operation (như `count++`)

---

## 3. Visibility vs Atomicity

```java
class Counter {
    private volatile int count = 0;

    public void increment() {
        count++; // KHONG ATOMIC du co volatile
    }
}
```

`count++` thực chất:

1. Đọc `count`
2. Cộng 1
3. Ghi lại

`volatile` đảm bảo đọc/ghi từng bước thấy giá trị mới, nhưng giữa các bước, thread khác có thể xen vào.

**Giải pháp:** Dùng `AtomicInteger` hoặc `synchronized`.

```java
// DUNG cho counter
AtomicInteger count = new AtomicInteger(0);
count.incrementAndGet();
```

---

## 4. Khi nào dùng volatile

### Trường hợp 1: Flag boolean

```java
volatile boolean shutdown = false;

// Thread A
void worker() {
    while (!shutdown) {
        process();
    }
}

// Thread B
void stop() {
    shutdown = true;
}
```

### Trường hợp 2: Publish reference an toàn

```java
class Config {
    private volatile Settings settings; // Read thay version moi

    void update(Settings newSettings) {
        this.settings = newSettings; // Single write
    }

    Settings get() {
        return settings; // Visible immediately
    }
}
```

### Trường hợp 3: Sau khi gán **không đọc rồi sửa**

OK với volatile:

- `flag = true;`
- `state = new State();`

KHÔNG OK:

- `count++`
- `if (a == 0) a = 1;`

---

## 5. Double-checked Locking

Pattern singleton dùng volatile để tránh lock không cần thiết.

```java
public class Singleton {
    private static volatile Singleton instance; // QUAN TRONG: volatile

    public static Singleton getInstance() {
        if (instance == null) {                  // 1st check (no lock)
            synchronized (Singleton.class) {
                if (instance == null) {           // 2nd check (with lock)
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

**Tại sao cần volatile?** `new Singleton()` thực chất:

1. Allocate memory
2. Init object
3. Gán reference

CPU có thể đảo thứ tự 2 và 3. Thread khác có thể thấy reference != null nhưng object chưa init xong. `volatile` ngăn reorder.

---

## Khi nào dùng?

- **Dùng `volatile` khi:**
  - Flag boolean đơn giản (`running`, `shutdown`)
  - Publish immutable object reference
  - Double-checked locking
  - Communicate giữa thread chỉ qua **một** biến đơn
- **KHÔNG dùng `volatile` khi:**
  - Composite operation (`count++`, `if-then-set`) -> dùng `Atomic*`, `synchronized`
  - Cần mutual exclusion -> dùng lock
  - Nhiều biến liên quan đến nhau -> dùng `synchronized`
- **Best practice:**
  - Dùng `AtomicReference` thay vì volatile reference nếu cần CAS
  - Đặt `volatile` lên field, không phải tham số/local var
  - Không lạm dụng -- volatile chậm hơn biến thường ~25%

---

## Lỗi thường gặp

### Lỗi 1: Dùng `volatile` cho counter

```java
// SAI
volatile int count;
count++; // race condition!

// DUNG
AtomicInteger count = new AtomicInteger();
count.incrementAndGet();
```

### Lỗi 2: Nghĩ `volatile` thay synchronized

```java
// SAI -- volatile khong loc 2 thread
volatile boolean lock = false;
if (!lock) {
    lock = true;
    // critical section
    lock = false;
}
// 2 thread cung vao duoc

// DUNG
private final Object monitor = new Object();
synchronized (monitor) {
    // critical section
}
```

### Lỗi 3: Quên `volatile` trong DCL

```java
// SAI -- co the lay object chua init
private static Singleton instance;

// DUNG
private static volatile Singleton instance;
```

### Lỗi 4: Dùng `volatile` cho object thay đổi nhiều field

```java
// SAI -- volatile chi dam bao visibility cho reference
volatile User user;
user.setName("...");
user.setEmail("..."); // 2 thao tac khong dong bo

// DUNG -- tao object moi (immutable)
volatile User user;
user = new User("name", "email"); // 1 thao tac
```

---

## Câu hỏi phỏng vấn

### Câu 1: `volatile` đảm bảo gì?

**Trả lời:** `volatile` đảm bảo **visibility** (mọi thread thấy giá trị mới nhất, không cache cũ) và **happens-before ordering** (không reorder qua volatile). KHÔNG đảm bảo **atomicity** cho composite operation như `count++`.

### Câu 2: `volatile` vs `synchronized`?

**Trả lời:**

- `volatile`: Chỉ visibility, không lock -- nhanh, không block thread
- `synchronized`: Mutual exclusion + visibility -- chậm hơn, có thể block

Dùng `volatile` cho single read/write, `synchronized` cho composite operation.

### Câu 3: Tại sao Double-checked Locking cần volatile?

**Trả lời:** `new Singleton()` không atomic -- gồm allocate + init + assign. CPU/compiler có thể reorder. Thread khác thấy `instance != null` nhưng object chưa init xong -> NPE/dữ liệu sai. `volatile` đảm bảo: nếu thấy reference, object đã init đầy đủ.

### Câu 4: `volatile` có thay được `AtomicInteger` không?

**Trả lời:** **Không** cho composite operation. `volatile int count; count++;` vẫn race condition. `AtomicInteger` dùng CAS đảm bảo atomic. Chỉ dùng `volatile int` khi **đọc + ghi đơn lẻ**, không có read-modify-write.

### Câu 5: `volatile` hoạt động ở mức nào?

**Trả lời:** Mức **hardware + compiler**:

- Hardware: emit memory barrier -- flush cache, đồng bộ giữa core
- Compiler: không reorder thao tác qua volatile

JMM (Java Memory Model) định nghĩa chính xác hành vi qua khái niệm **happens-before**.
