---
sidebar_position: 18
title: "Heap Space vs Stack"
---
# Heap Space vs Stack

## 1. Giới thiệu

Trong Java, **bộ nhớ (memory)** là tài nguyên quan trọng nhất mà chương trình sử dụng. JVM (Java Virtual Machine) quản lý bộ nhớ tự động, nhưng để viết code **hiệu quả, tránh lỗi runtime**, bạn cần hiểu **2 vùng bộ nhớ chính**: **Stack** và **Heap**.

**Tại sao cần hiểu Stack và Heap?** Vì:
- Các lỗi `StackOverflowError` và `OutOfMemoryError` là **lỗi runtime nguy hiểm** có thể crash ứng dụng
- Hiểu bộ nhớ giúp bạn **tối ưu hiệu năng** và tránh **memory leak**
- Đây là **câu hỏi phỏng vấn bắt buộc** ở mọi level

Hãy hình dung:
- **Stack** giống như **một chồng đĩa**: bạn đặt đĩa lên (gọi method), lấy đĩa ra (method kết thúc). Luôn lấy đĩa **trên cùng** (LIFO). Chồng đĩa có **giới hạn chiều cao** - đặt quá nhiều sẽ đổ (StackOverflowError).
- **Heap** giống như **một kho hàng lớn**: bạn cất đồ vào bất kỳ chỗ nào còn trống. Kho hàng được **chia sẻ** cho nhiều người (thread). Có **nhân viên dọn dẹp** (Garbage Collector) định kỳ dọn dẹp đồ cũ.

---

## Nội dung

1. [Giới thiệu](#1-gioi-thieu)
2. [Stack Memory](#2-stack-memory)
3. [Heap Memory](#3-heap-memory)
4. [Ví dụ minh họa: biến nằm ở đâu?](#4-vi-du-minh-hoa-bien-nam-o-dau)
5. [StackOverflowError](#5-stackoverflowerror)
6. [OutOfMemoryError](#6-outofmemoryerror)
7. [Garbage Collection cơ bản](#7-garbage-collection-co-ban)
8. [Cấu hình bộ nhớ JVM (-Xms, -Xmx, -Xss)](#8-cau-hinh-bo-nho-jvm--xms--xmx--xss)
9. [Bảng so sánh Stack vs Heap](#9-bang-so-sanh-stack-vs-heap)
10. [Khi nào dùng?](#10-khi-nao-dung)
11. [Lỗi thường gặp](#11-loi-thuong-gap)
12. [Câu hỏi phỏng vấn](#12-cau-hoi-phong-van)

---

## 2. Stack Memory

### 2.1 Stack là gì?

**Stack Memory** là vùng bộ nhớ dùng để lưu:
- **Biến cục bộ** (local variables) của primitive type
- **Tham chiếu** (reference) đến object trên Heap
- **Thông tin method call** (stack frame): tham số, địa chỉ trả về

Mỗi khi gọi một method, JVM tạo một **stack frame** mới đặt lên đỉnh stack. Khi method kết thúc, stack frame đó được **tự động xóa**.

### 2.2 Đặc điểm của Stack

| Đặc điểm | Mô tả |
|---------|-------|
| **Phạm vi** | Mỗi thread có stack **riêng** |
| **Cấu trúc** | LIFO (Last In, First Out) |
| **Tốc độ** | **Rất nhanh** (cấp phát/giải phóng đơn giản) |
| **Kích thước** | **Giới hạn** (mặc định ~512KB - 1MB) |
| **Quản lý** | Tự động (không cần GC) |
| **Thread-safe** | Có (riêng biệt cho từng thread) |
| **Lưu gì** | Primitive, reference, stack frame |

### 2.3 Ví dụ Stack hoạt động

```java
public class StackDemo {
    public static void main(String[] args) {
        int a = 10;      // a lưu trên Stack của main thread
        int b = 20;      // b lưu trên Stack
        int result = add(a, b);  // Gọi method add()
        System.out.println("Kết quả: " + result);
    }

    static int add(int x, int y) {
        int sum = x + y;  // x, y, sum lưu trên Stack của add()
        return sum;        // Khi add() kết thúc, stack frame bị xóa
    }
}
```

**Trạng thái Stack khi `add()` đang chạy:**

```
Stack (main thread)
+-------------------+
| add():            |  <-- Đỉnh stack (đang chạy)
|   x = 10         |
|   y = 20         |
|   sum = 30       |
+-------------------+
| main():           |
|   a = 10         |
|   b = 20         |
|   result = ?     |
+-------------------+
```

Khi `add()` kết thúc và return, stack frame của `add()` bị **xóa ngay lập tức**:

```
Stack (main thread)
+-------------------+
| main():           |  <-- Đỉnh stack
|   a = 10         |
|   b = 20         |
|   result = 30    |
+-------------------+
```

---

## 3. Heap Memory

### 3.1 Heap là gì?

**Heap Memory** là vùng bộ nhớ dùng để lưu:
- **Tất cả object** được tạo bằng `new`
- **Instance variable** (thuộc tính của object)
- **Mảng** (array)
- **String Pool** (từ Java 7)

### 3.2 Đặc điểm của Heap

| Đặc điểm | Mô tả |
|---------|-------|
| **Phạm vi** | **Chia sẻ** giữa tất cả thread |
| **Cấu trúc** | Không có thứ tự cụ thể |
| **Tốc độ** | **Chậm hơn Stack** |
| **Kích thước** | **Lớn hơn Stack** nhiều (có thể GB) |
| **Quản lý** | Garbage Collector (GC) |
| **Thread-safe** | Không (cần đồng bộ khi truy cập chung) |
| **Lưu gì** | Object, array, String Pool |

### 3.3 Cấu trúc Heap (đơn giản hóa)

```
Heap Memory
+--------------------------------------------------+
|  Young Generation                                  |
|  +--------------------------------------------+  |
|  | Eden Space  | Survivor S0 | Survivor S1    |  |
|  +--------------------------------------------+  |
|                                                    |
|  Old Generation (Tenured)                          |
|  +--------------------------------------------+  |
|  | Object sống lâu nằm ở đây                   |  |
|  +--------------------------------------------+  |
|                                                    |
|  String Pool                                       |
|  +--------------------------------------------+  |
|  | "Hello", "Java", "World"                    |  |
|  +--------------------------------------------+  |
+--------------------------------------------------+
```

- **Object mới** -> tạo trong **Eden Space**
- Sau nhiều lần GC mà vẫn sống -> chuyển sang **Survivor Space**
- Sống đủ lâu -> chuyển sang **Old Generation**

---

## 4. Ví dụ minh họa: biến nằm ở đâu?

```java
public class MemoryDemo {
    // instance variable -> Heap (nằm trong object)
    String name;
    int age;

    public static void main(String[] args) {
        // 'args' là reference -> Stack, đối tượng String[] -> Heap
        int count = 5;  // primitive -> Stack

        // 'p' là reference -> Stack
        // object MemoryDemo -> Heap
        MemoryDemo p = new MemoryDemo();
        p.name = "Thuan";  // "Thuan" -> Heap (String Pool)
        p.age = 25;         // age là instance var -> Heap (trong object p)

        // 'numbers' là reference -> Stack
        // mảng int[3] -> Heap
        int[] numbers = new int[]{1, 2, 3};

        // 'msg' là reference -> Stack
        // "Hello" -> Heap (String Pool)
        String msg = "Hello";

        process(p);
    }

    static void process(MemoryDemo person) {
        // 'person' là reference -> Stack (copy của 'p')
        // vẫn trỏ đến cùng object MemoryDemo trên Heap

        // 'localVar' -> Stack
        int localVar = person.age * 2;

        // 'temp' là reference -> Stack
        // new String(...) -> Heap
        String temp = new String("Temp");
    }
    // Khi process() kết thúc: person, localVar, temp bị xóa khỏi Stack
    // Object "Temp" trên Heap trở thành rác (không còn ai trỏ đến) -> GC sẽ dọn dẹp
}
```

**Tóm tắt:**

| Biến/Object | Lưu ở đâu | Ghi chú |
|-------------|-----------|---------|
| `count = 5` | Stack | Primitive local var |
| `p` (reference) | Stack | Tham chiếu đến object |
| Object `MemoryDemo` | Heap | Tạo bằng `new` |
| `p.name = "Thuan"` | Heap | Instance var + String Pool |
| `p.age = 25` | Heap | Instance var (trong object) |
| `numbers` (reference) | Stack | Tham chiếu đến mảng |
| Mảng `int[3]` | Heap | Mảng tạo bằng `new` |
| `msg = "Hello"` | Stack (ref) + Heap (Pool) | Literal trong String Pool |
| `localVar = 50` | Stack | Primitive local var |
| `temp` (reference) | Stack | Tham chiếu |
| Object `"Temp"` | Heap | Tạo bằng `new String(...)` |

**Quy tắc đơn giản:**
- **Primitive local variable** -> Stack
- **Object reference** -> Stack (tham chiếu), Heap (object)
- **Tất cả object (tạo bằng new)** -> Heap
- **Instance variable** -> Heap (nằm trong object)
- **Static variable** -> Method Area (vùng đặc biệt của Heap)

---

## 5. StackOverflowError

### 5.1 Khi nào xảy ra?

**StackOverflowError** xảy ra khi **stack đầy** - thường do **đệ quy không có điều kiện dừng** (infinite recursion):

```java
public class StackOverflowDemo {
    public static void main(String[] args) {
        try {
            recursiveMethod(1);
        } catch (StackOverflowError e) {
            System.out.println("StackOverflowError! Stack đã đầy.");
        }
    }

    static void recursiveMethod(int n) {
        System.out.println("Lần gọi thứ: " + n);
        recursiveMethod(n + 1); // Đệ quy vô hạn -> Stack đầy!
    }
}
```

**Kết quả:**
```
Lần gọi thứ: 1
Lần gọi thứ: 2
...
Lần gọi thứ: ~7000 (tùy JVM)
StackOverflowError! Stack đã đầy.
```

### 5.2 Cách khắc phục

```java
// Sai: Đệ quy không có điều kiện dừng
static int factorial(int n) {
    return n * factorial(n - 1); // Không bao giờ dừng!
}
```

```java
// Đúng: Có điều kiện dừng (base case)
static int factorial(int n) {
    if (n <= 1) {
        return 1; // Base case: DỪNG đệ quy
    }
    return n * factorial(n - 1);
}
```

### 5.3 Các nguyên nhân thường gặp

- **Đệ quy vô hạn** (thiếu base case)
- **Đệ quy quá sâu** (n quá lớn)
- **Method gọi lẫn nhau** (A gọi B, B gọi A)
- **Tạo quá nhiều local variable** trong method đệ quy

---

## 6. OutOfMemoryError

### 6.1 Khi nào xảy ra?

**OutOfMemoryError** xảy ra khi **Heap đầy** - thường do tạo **quá nhiều object** mà Garbage Collector không thể thu gom:

```java
import java.util.ArrayList;
import java.util.List;

public class OutOfMemoryDemo {
    public static void main(String[] args) {
        List<int[]> list = new ArrayList<>();

        try {
            while (true) {
                list.add(new int[1_000_000]); // Mỗi mảng ~ 4MB
                System.out.println("Đã tạo " + list.size() + " mảng");
            }
        } catch (OutOfMemoryError e) {
            System.out.println("OutOfMemoryError! Heap đã đầy.");
            System.out.println("Số mảng đã tạo: " + list.size());
        }
    }
}
```

### 6.2 Các nguyên nhân thường gặp

- **Memory leak**: giữ reference đến object không còn cần (ví dụ: đặt vào static List mà không bao giờ xóa)
- **Tạo quá nhiều object**: vòng lặp tạo object không giới hạn
- **Load dữ liệu lớn**: đọc toàn bộ file/database vào bộ nhớ
- **Heap cấu hình quá nhỏ**: ứng dụng cần nhiều bộ nhớ nhưng -Xmx quá thấp

### 6.3 Cách khắc phục

```java
// Sai: Memory leak - giữ reference mãi
static List<byte[]> cache = new ArrayList<>();

void processData() {
    byte[] data = new byte[1_000_000];
    // ... xử lý ...
    cache.add(data); // KHÔNG BAO GIỜ xóa! -> Memory leak
}
```

```java
// Đúng: Giải phóng khi không cần
static List<byte[]> cache = new ArrayList<>();
static final int MAX_CACHE_SIZE = 100;

void processData() {
    byte[] data = new byte[1_000_000];
    // ... xử lý ...
    if (cache.size() >= MAX_CACHE_SIZE) {
        cache.clear(); // Giải phóng bộ nhớ
    }
    cache.add(data);
}
```

---

## 7. Garbage Collection cơ bản

### 7.1 GC là gì?

**Garbage Collection (GC)** là cơ chế **tự động thu gom và giải phóng bộ nhớ** trên Heap khi object không còn được tham chiếu (không còn biến nào trỏ đến).

```java
public class GarbageCollectionDemo {
    public static void main(String[] args) {
        // Object 1 được tạo, 'a' trỏ đến nó
        String a = new String("Hello");

        // Object 2 được tạo, 'a' bây giờ trỏ đến Object 2
        // Object 1 KHÔNG CÒN AI TRỎ ĐẾN -> trở thành "rác"
        a = new String("World");

        // Object 3 được tạo, 'b' trỏ đến nó
        String b = new String("Java");

        // b trỏ đến null -> Object 3 trở thành "rác"
        b = null;

        // Gọi đề xuất GC chạy (không đảm bảo chạy ngay)
        System.gc();

        System.out.println("a = " + a); // World
        System.out.println("b = " + b); // null
    }
}
```

### 7.2 Khi nào object được thu gom?

Object **đủ điều kiện thu gom** khi:
1. **Không còn reference nào** trỏ đến nó
2. **Tất cả reference** trỏ đến nó đều là **unreachable** (không thể truy cập từ root)

```java
// Trường hợp 1: Gán null
Object obj = new Object();
obj = null; // Object đủ điều kiện GC

// Trường hợp 2: Gán lại reference
Object a = new Object(); // Object A
a = new Object();        // Object A đủ điều kiện GC

// Trường hợp 3: Object trong method kết thúc
void method() {
    Object local = new Object(); // Object tạo trên Heap
} // Khi method kết thúc, 'local' bị xóa khỏi Stack
  // Object trên Heap không còn ai trỏ đến -> đủ điều kiện GC
```

### 7.3 Lưu ý quan trọng

- **Không thể ép GC chạy**: `System.gc()` chỉ là **đề xuất**, JVM có thể **không chạy ngay**
- **Không nên gọi System.gc()**: làm giảm hiệu năng, để JVM tự quyết định
- GC có thể **tạm dừng ứng dụng** (stop-the-world pause)

---

## 8. Cấu hình bộ nhớ JVM (-Xms, -Xmx, -Xss)

### 8.1 Các flag quan trọng

| Flag | Mô tả | Ví dụ |
|------|-------|-------|
| `-Xms` | **Heap khởi tạo** (initial heap size) | `-Xms256m` (256MB) |
| `-Xmx` | **Heap tối đa** (maximum heap size) | `-Xmx1024m` (1GB) |
| `-Xss` | **Stack size** cho mỗi thread | `-Xss512k` (512KB) |

### 8.2 Cách sử dụng

```bash
# Chạy với Heap tối thiểu 256MB, tối đa 1GB
java -Xms256m -Xmx1024m MyApp

# Tăng stack size cho đệ quy sâu
java -Xss2m MyApp

# Kiểm tra cấu hình mặc định
java -XX:+PrintFlagsFinal -version | grep -i heap
```

### 8.3 Ví dụ trong code

```java
public class MemoryInfoDemo {
    public static void main(String[] args) {
        Runtime runtime = Runtime.getRuntime();

        long maxMemory = runtime.maxMemory();       // -Xmx
        long totalMemory = runtime.totalMemory();   // Heap hiện tại
        long freeMemory = runtime.freeMemory();     // Bộ nhớ chưa dùng

        System.out.println("=== Thông tin bộ nhớ ===");
        System.out.printf("Max Memory (Xmx):  %d MB%n", maxMemory / (1024 * 1024));
        System.out.printf("Total Memory:       %d MB%n", totalMemory / (1024 * 1024));
        System.out.printf("Free Memory:        %d MB%n", freeMemory / (1024 * 1024));
        System.out.printf("Used Memory:        %d MB%n",
            (totalMemory - freeMemory) / (1024 * 1024));
    }
}
```

**Kết quả (tham khảo):**
```
=== Thông tin bộ nhớ ===
Max Memory (Xmx):  256 MB
Total Memory:       16 MB
Free Memory:        14 MB
Used Memory:        2 MB
```

### 8.4 Khuyến nghị cấu hình

- **Xms = Xmx**: tránh JVM phải resize Heap liên tục
- **Xmx không quá 70-80% RAM** vật lý (chừa lại cho OS và các process khác)
- **Tăng Xss** khi có đệ quy sâu hoặc method có nhiều local variable
- **Không đặt quá lớn**: lãng phí RAM, GC pause lâu hơn

---

## 9. Bảng so sánh Stack vs Heap

| Tiêu chí | Stack | Heap |
|---------|-------|------|
| **Lưu gì** | Primitive local var, reference, stack frame | Object, array, instance var |
| **Phạm vi** | **Riêng** cho từng thread | **Chia sẻ** giữa tất cả thread |
| **Cấu trúc** | LIFO (Last In, First Out) | Không có thứ tự |
| **Tốc độ** | **Rất nhanh** | Chậm hơn |
| **Kích thước** | **Nhỏ** (~512KB - 1MB/thread) | **Lớn** (có thể GB) |
| **Quản lý** | Tự động (method kết thúc -> xóa) | Garbage Collector |
| **Thread-safe** | Có (riêng biệt) | Không (cần đồng bộ) |
| **Lỗi** | `StackOverflowError` | `OutOfMemoryError` |
| **Cấu hình** | `-Xss` | `-Xms`, `-Xmx` |
| **Tuổi thọ** | Ngắn (theo method) | Dài (cho đến khi GC thu gom) |

---

## 10. Khi nào dùng?

### Kiến thức này áp dụng khi:
- **Thiết kế ứng dụng**: chọn cấu trúc dữ liệu phù hợp (tránh tạo quá nhiều object)
- **Tối ưu hiệu năng**: giảm số object tạo ra, tái sử dụng object (object pooling)
- **Debug lỗi runtime**: nhận biết StackOverflowError (stack đầy) vs OutOfMemoryError (heap đầy)
- **Cấu hình JVM**: đặt -Xms, -Xmx, -Xss phù hợp với ứng dụng
- **Viết đệ quy**: đảm bảo có base case và không đệ quy quá sâu
- **Đa luồng**: hiểu rằng Heap chia sẻ nên cần đồng bộ khi truy cập chung

### Best practices:
- **Tránh tạo object không cần thiết** trong vòng lặp
- **Dùng primitive** thay vì Wrapper khi có thể (`int` thay vì `Integer`)
- **Đóng tài nguyên** (stream, connection) sau khi dùng xong (try-with-resources)
- **Tránh giữ reference lâu** đến object lớn (memory leak)
- **Sử dụng WeakReference/SoftReference** cho cache
- **Giới hạn độ sâu đệ quy** hoặc dùng vòng lặp thay thế
- **Monitor bộ nhớ** bằng VisualVM, JConsole, hoặc `-XX:+HeapDumpOnOutOfMemoryError`

---

## 11. Lỗi thường gặp

### Lỗi 1: Đệ quy không có điều kiện dừng -> StackOverflowError

```java
// Sai: Không có base case
static void count(int n) {
    System.out.println(n);
    count(n + 1); // Gọi mãi không dừng!
}
```

```java
// Đúng: Có base case rõ ràng
static void count(int n, int max) {
    if (n > max) {
        return; // Base case: DỪNG
    }
    System.out.println(n);
    count(n + 1, max);
}
```

### Lỗi 2: Thêm object vào collection mãi không xóa -> OutOfMemoryError

```java
// Sai: Memory leak!
static List<byte[]> dataStore = new ArrayList<>();

void collectData() {
    while (true) {
        byte[] data = readFromSensor();
        dataStore.add(data); // Chỉ thêm, KHÔNG BAO GIỜ xóa!
    }
}
```

```java
// Đúng: Giới hạn kích thước hoặc xóa dữ liệu cũ
static List<byte[]> dataStore = new ArrayList<>();
static final int MAX_SIZE = 1000;

void collectData() {
    while (true) {
        byte[] data = readFromSensor();
        if (dataStore.size() >= MAX_SIZE) {
            dataStore.remove(0); // Xóa dữ liệu cũ nhất
        }
        dataStore.add(data);
    }
}
```

### Lỗi 3: Quên đóng tài nguyên

```java
// Sai: Không đóng stream -> memory leak
void readFile(String path) throws Exception {
    FileInputStream fis = new FileInputStream(path);
    byte[] data = fis.readAllBytes();
    // Nếu exception xảy ra ở đây, fis KHÔNG được đóng!
    fis.close();
}
```

```java
// Đúng: Dùng try-with-resources (tự động đóng)
void readFile(String path) throws Exception {
    try (FileInputStream fis = new FileInputStream(path)) {
        byte[] data = fis.readAllBytes();
        // fis tự động đóng khi thoát try, kể cả khi có exception
    }
}
```

### Lỗi 4: Nhầm lẫn primitive và object về bộ nhớ

```java
// Nhầm: Nghĩ rằng int[] nằm trên Stack
void example() {
    int x = 10;           // x -> Stack (primitive local var)
    int[] arr = new int[5]; // arr (reference) -> Stack
                             // mảng int[5] (object) -> HEAP!
}
```

**Ghi nhớ:** Bất kỳ thứ gì tạo bằng `new` đều nằm trên **Heap**, kể cả mảng primitive.

### Lỗi 5: Gọi System.gc() để "fix" memory leak

```java
// Sai: System.gc() KHÔNG giải quyết memory leak
static List<Object> leakyList = new ArrayList<>();

void process() {
    leakyList.add(new Object());
    System.gc(); // Vô ích! Object vẫn được tham chiếu bởi leakyList
}
```

```java
// Đúng: Fix nguyên nhân gốc - xóa reference không cần
static List<Object> leakyList = new ArrayList<>();

void process() {
    Object obj = new Object();
    // ... xử lý ...
    // Không thêm vào static list nếu không cần thiết
}
```

---

## 12. Câu hỏi phỏng vấn

### Câu 1: Stack và Heap khác nhau như thế nào?

**Trả lời:**
- **Stack** là vùng bộ nhớ **riêng cho từng thread**, lưu **primitive local variable, reference, stack frame**. Quản lý theo **LIFO**, truy cập **nhanh**, kích thước **nhỏ** (~512KB-1MB/thread), tự động giải phóng khi method kết thúc.
- **Heap** là vùng bộ nhớ **chia sẻ giữa tất cả thread**, lưu **object, array, instance variable**. Kích thước **lớn** (có thể GB), truy cập **chậm hơn**, quản lý bởi **Garbage Collector**. Không tự động giải phóng - phải đợi GC thu gom.

### Câu 2: Khi nào xảy ra StackOverflowError? Cho ví dụ.

**Trả lời:** StackOverflowError xảy ra khi **Stack đầy**, thường do:
1. **Đệ quy vô hạn** (không có base case)
2. **Đệ quy quá sâu** (n rất lớn)
3. **Method gọi vòng** (A gọi B, B gọi A)

```java
// Ví dụ: Đệ quy vô hạn
void infinite() {
    infinite(); // Mỗi lần gọi -> thêm stack frame -> Stack đầy -> ERROR
}
```

Khắc phục: đảm bảo mọi đệ quy có **base case**, giới hạn **độ sâu đệ quy**, hoặc dùng **vòng lặp** thay thế.

### Câu 3: Khi nào xảy ra OutOfMemoryError? Cách phòng tránh?

**Trả lời:** OutOfMemoryError xảy ra khi **Heap đầy** và GC không thể giải phóng đủ bộ nhớ. Nguyên nhân:
1. **Memory leak**: giữ reference đến object không cần (static collection chỉ thêm không xóa)
2. **Load dữ liệu lớn**: đọc toàn bộ file/database vào bộ nhớ
3. **Heap quá nhỏ**: cấu hình -Xmx thấp

Phòng tránh:
- Giải phóng reference khi không cần (gán null, xóa khỏi collection)
- Xử lý dữ liệu theo **batch/stream** thay vì load hết
- Tăng `-Xmx` nếu cần thiết
- Dùng tool (VisualVM, MAT) để phát hiện memory leak
- Dùng `-XX:+HeapDumpOnOutOfMemoryError` để debug

### Câu 4: Garbage Collection là gì? Hoạt động như thế nào?

**Trả lời:** Garbage Collection (GC) là cơ chế **tự động của JVM** để **phát hiện và giải phóng bộ nhớ** của các object không còn được tham chiếu (unreachable objects) trên Heap.

**Cách hoạt động cơ bản:**
1. **Mark**: GC duyệt từ **GC roots** (Stack variable, static variable...) và **đánh dấu** tất cả object còn **reachable** (có thể truy cập được)
2. **Sweep**: Các object **không được đánh dấu** (unreachable) bị **xóa** và bộ nhớ được giải phóng
3. **Compact** (tùy GC): Dọn dẹp bộ nhớ, dịch chuyển object để giảm **fragmentation**

**Lưu ý:** Lập trình viên **không thể ép GC chạy**. `System.gc()` chỉ là đề xuất. JVM tự quyết định khi nào chạy GC dựa trên tình trạng bộ nhớ.

### Câu 5: Tại sao mỗi thread có Stack riêng nhưng chia sẻ Heap?

**Trả lời:**
- **Stack riêng** vì mỗi thread có **luồng thực thi độc lập**: gọi method khác nhau, biến cục bộ khác nhau. Nếu chia sẻ Stack, các thread sẽ ghi đè lên nhau -> lỗi.
- **Heap chia sẻ** vì object thường cần được **truy cập từ nhiều thread** (ví dụ: danh sách user, connection pool, shared cache). Nếu mỗi thread có Heap riêng, sẽ không thể chia sẻ dữ liệu -> lãng phí bộ nhớ và không hiệu quả.

Vì Heap chia sẻ, khi nhiều thread **cùng đọc/ghi** một object, cần dùng **synchronized**, **Lock**, hoặc **concurrent data structure** để tránh **race condition**.
