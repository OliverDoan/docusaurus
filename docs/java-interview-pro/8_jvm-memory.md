---
sidebar_position: 8
title: "8. JVM & Bộ nhớ"
---

# JVM & Bộ nhớ

> *Hiểu rõ cách JVM quản lý bộ nhớ là chìa khóa để viết ứng dụng Java ổn định, hiệu năng cao và tránh các lỗi khó debug nhất trong thực tế.*

:::note[Ghi nhớ nhanh]

- ⭐ **`Stack` vs `Heap`** — `Stack` riêng mỗi thread, lưu biến cục bộ và tham chiếu theo LIFO; `Heap` dùng chung, lưu object tạo bằng `new` và do `Garbage Collector` quản lý.
- **`Garbage Collection`** — object là "rác" khi không còn `GC Root` nào tham chiếu tới; cơ chế cơ bản là Mark and Sweep, có thể gây Stop-the-World pause.
- **Generational GC** — chia `Heap` thành Young (Eden, Survivor) và Old Generation; Minor GC dọn Young rất nhanh, Full GC quét toàn bộ nên tốn kém.
- **`OutOfMemoryError` vs `StackOverflowError`** — OOM do Heap/`Metaspace` đầy hoặc memory leak; StackOverflow do đệ quy vô hạn làm tràn `Stack`.
- **Memory leak** — vẫn xảy ra dù có GC khi giữ tham chiếu ngoài ý muốn (static collection, `ThreadLocal` không `remove()`, cache vô hạn).
- **`ClassLoader` & Reflection** — ClassLoader tải `.class` theo mô hình Parent Delegation; Reflection thao tác class tại runtime, mạnh cho framework nhưng chậm và mất type safety.

:::

---

## Câu 1: Bộ nhớ Stack và Heap trong Java khác nhau thế nào? `[Intermediate]`

### Câu hỏi

> *"Bạn có thể giải thích sự khác biệt giữa Stack memory và Heap memory trong JVM không?"*

### Giải thích lý thuyết

JVM chia bộ nhớ runtime thành nhiều vùng. Hai vùng quan trọng nhất là:

**Stack (ngăn xếp)**:
- Mỗi thread có một Stack riêng.
- Lưu trữ **stack frame** (khung ngăn xếp) — mỗi lần gọi method sẽ tạo ra một frame mới.
- Frame chứa: biến cục bộ (local variables), tham số truyền vào, địa chỉ trả về.
- Bộ nhớ được cấp phát và giải phóng tự động theo thứ tự LIFO (Last In First Out — vào sau ra trước).
- Kích thước cố định, thường nhỏ (mặc định 256 KB – 1 MB mỗi thread).

**Heap (vùng đống)**:
- Dùng chung cho tất cả các thread.
- Nơi lưu trữ tất cả **object** (đối tượng) và **array** (mảng) được tạo bằng `new`.
- Vòng đời của object do **Garbage Collector (GC)** quản lý.
- Kích thước lớn hơn nhiều và có thể cấu hình (`-Xmx`, `-Xms`).

| Đặc điểm | Stack | Heap |
|---|---|---|
| Phạm vi | Mỗi thread riêng | Dùng chung toàn bộ JVM |
| Lưu gì | Biến cục bộ, tham chiếu | Object, mảng |
| Quản lý | Tự động (LIFO) | Garbage Collector |
| Tốc độ | Nhanh hơn | Chậm hơn |
| Lỗi tràn | `StackOverflowError` | `OutOfMemoryError` |

### Code minh hoạ

```java
public class MemoryDemo {

    // Phương thức này minh hoạ vùng nhớ Stack và Heap
    public static void main(String[] args) {
        // "age" là biến nguyên thủy (primitive) → nằm trên Stack
        int age = 25;

        // "name" là tham chiếu → tham chiếu nằm trên Stack,
        // nhưng đối tượng String thực sự nằm trên Heap
        String name = new String("Alice");

        // Gọi phương thức → tạo stack frame mới trên Stack
        int result = square(age);

        System.out.println(name + " squared age: " + result);
    }

    static int square(int n) {
        // "n" và "squared" đều nằm trên Stack của frame này
        int squared = n * n;
        return squared;
        // Khi phương thức kết thúc, frame bị xóa khỏi Stack
    }
}
```

### Đáp án mẫu

> "Stack lưu biến cục bộ và tham chiếu, mỗi thread có Stack riêng, được cấp phát và giải phóng tự động theo LIFO. Heap là vùng dùng chung của tất cả thread, lưu trữ các object được tạo bằng `new`, và được quản lý bởi Garbage Collector. Stack nhanh hơn nhưng nhỏ hơn; vượt giới hạn Stack gây `StackOverflowError`, vượt giới hạn Heap gây `OutOfMemoryError`."

---

## Câu 2: Quá trình Garbage Collection hoạt động thế nào? `[Intermediate]`

### Câu hỏi

> *"Garbage Collection trong Java hoạt động như thế nào? JVM quyết định thu hồi object nào?"*

### Giải thích lý thuyết

**Garbage Collection (GC — thu dọn rác)** là cơ chế JVM tự động giải phóng bộ nhớ Heap khi object không còn được tham chiếu nữa.

**Tiêu chí thu hồi**: Một object được coi là "rác" khi không có **GC Root** nào còn giữ tham chiếu đến nó (trực tiếp hoặc gián tiếp).

**GC Root** bao gồm:
- Biến cục bộ đang active trên Stack
- Biến `static` của class
- Tham chiếu từ JNI (Java Native Interface)

**Các bước hoạt động cơ bản (Mark and Sweep — đánh dấu và quét)**:
1. **Mark (Đánh dấu)**: GC duyệt từ GC Root, đánh dấu tất cả object còn được tham chiếu là "sống".
2. **Sweep (Quét)**: Giải phóng tất cả object không được đánh dấu.
3. **Compact (Nén — tuỳ GC)**: Di chuyển các object sống về liền nhau để tránh phân mảnh bộ nhớ.

**Stop-the-World (STW)**: Nhiều pha GC yêu cầu dừng tất cả thread ứng dụng lại. Đây là nguyên nhân gây ra **GC pause** (độ trễ do GC).

### Code minh hoạ

```java
public class GCDemo {

    public static void main(String[] args) {
        // Tạo object trên Heap, "obj" (tham chiếu) nằm trên Stack
        Object obj = new Object();

        // Gán tham chiếu khác vào "obj"
        // Object cũ không còn tham chiếu nào → đủ điều kiện để GC thu hồi
        obj = new Object();

        // Yêu cầu JVM chạy GC (chỉ là gợi ý, JVM có thể bỏ qua)
        System.gc();

        // Tạo nhiều object ngắn hạn → GC sẽ thu hồi sau vòng lặp
        for (int i = 0; i < 100_000; i++) {
            String temp = "value-" + i; // object String mới mỗi vòng lặp
        }
        // Sau vòng lặp, tất cả "temp" đều là rác → GC thu hồi
    }
}
```

```bash
# Xem log GC chi tiết khi chạy ứng dụng
java -Xlog:gc* -jar MyApp.jar
```

### Đáp án mẫu

> "GC hoạt động theo nguyên tắc Mark and Sweep: đánh dấu tất cả object còn được tham chiếu từ GC Root, sau đó giải phóng các object không được đánh dấu. Một object đủ điều kiện bị thu hồi khi không còn tham chiếu nào giữ nó. GC chạy tự động, nhưng có thể gây ra Stop-the-World pause. Chúng ta không nên gọi `System.gc()` trong code production vì JVM tự quản lý tốt hơn."

---

## Câu 3: Generational Garbage Collection là gì? `[Advanced]`

### Câu hỏi

> *"Bạn có thể giải thích Generational Garbage Collection và tại sao JVM lại chia Heap thành các thế hệ không?"*

### Giải thích lý thuyết

**Generational GC (Thu gom rác theo thế hệ)** dựa trên giả thuyết thực nghiệm: **"Hầu hết object chết trẻ"** (Weak Generational Hypothesis). Vì vậy, JVM chia Heap thành các vùng thế hệ để tối ưu hiệu suất GC.

**Cấu trúc Heap (với G1GC hoặc Serial/Parallel GC truyền thống)**:

```
Heap
├── Young Generation (Thế hệ trẻ) — object mới tạo
│   ├── Eden Space       (nơi object được tạo ra)
│   ├── Survivor S0      (object sống sót qua Minor GC lần 1)
│   └── Survivor S1      (object sống sót qua Minor GC lần 2)
└── Old Generation / Tenured (Thế hệ già) — object sống lâu
```

**Luồng vòng đời của object**:
1. Object mới tạo → **Eden**.
2. **Minor GC** (nhỏ, nhanh) dọn Eden → object sống sót chuyển sang Survivor.
3. Sau nhiều lần Minor GC (đạt ngưỡng `tenuring threshold`) → object chuyển sang **Old Generation**.
4. **Major GC / Full GC** (lớn, chậm hơn) dọn Old Generation khi cần.

**Lợi ích**: Minor GC chỉ quét Young Generation (nhỏ) → rất nhanh. Full GC hiếm hơn.

| Loại GC | Vùng quét | Tần suất | Tốc độ |
|---|---|---|---|
| Minor GC | Young Generation | Thường xuyên | Nhanh |
| Major GC | Old Generation | Ít hơn | Chậm hơn |
| Full GC | Toàn bộ Heap | Hiếm | Chậm nhất |

### Code minh hoạ

```bash
# Cấu hình kích thước Heap và Young Generation
java -Xms512m -Xmx2g -Xmn512m -jar MyApp.jar
# -Xms: kích thước Heap ban đầu
# -Xmx: kích thước Heap tối đa
# -Xmn: kích thước Young Generation

# Chọn GC algorithm (thuật toán GC)
java -XX:+UseG1GC -jar MyApp.jar        # G1 GC (mặc định từ Java 9+)
java -XX:+UseZGC -jar MyApp.jar         # ZGC (low-latency, Java 15+)
java -XX:+UseShenandoahGC -jar MyApp.jar # Shenandoah GC
```

```java
// Ví dụ tạo object ngắn hạn (sẽ bị Minor GC thu hồi nhanh)
public List<String> processRequests(List<String> inputs) {
    List<String> results = new ArrayList<>();
    for (String input : inputs) {
        // "processed" là object ngắn hạn, sẽ chết trong Young Generation
        String processed = input.trim().toLowerCase();
        results.add(processed);
    }
    return results;
}
```

### Đáp án mẫu

> "Generational GC chia Heap thành Young Generation và Old Generation dựa trên quan sát rằng hầu hết object chỉ sống trong thời gian ngắn. Object mới tạo ở Eden, sau Minor GC nếu còn sống chuyển qua Survivor, rồi sau nhiều vòng mới lên Old Generation. Minor GC chỉ quét Young Generation nên rất nhanh và ít gây pause. Full GC mới quét toàn bộ Heap và tốn kém hơn. Đây là lý do tại sao tránh tạo object sống quá lâu không cần thiết là best practice."

---

## Câu 4: OutOfMemoryError là gì và làm thế nào để phòng tránh? `[Advanced]`

### Câu hỏi

> *"Bạn đã từng gặp OutOfMemoryError chưa? Nguyên nhân và cách xử lý là gì?"*

### Giải thích lý thuyết

`OutOfMemoryError` (OOM) xảy ra khi JVM không thể cấp phát thêm bộ nhớ dù đã cố gắng GC. Đây là `Error` (không phải `Exception`) — thường nghiêm trọng.

**Các loại OOM phổ biến**:

| Thông báo lỗi | Nguyên nhân |
|---|---|
| `Java heap space` | Heap đầy — quá nhiều object hoặc memory leak |
| `GC overhead limit exceeded` | GC chiếm hơn 98% thời gian nhưng thu hồi ít hơn 2% |
| `Metaspace` | Vùng Metaspace đầy (quá nhiều class được load) |
| `Unable to create new native thread` | Quá nhiều thread, OS không còn tài nguyên |
| `Direct buffer memory` | NIO Direct Buffer vượt giới hạn |

**Cách phòng tránh**:
1. Tăng kích thước Heap hợp lý (`-Xmx`).
2. Tránh memory leak (xem Câu 5).
3. Dùng **Heap dump** (snapshot bộ nhớ) để phân tích: `-XX:+HeapDumpOnOutOfMemoryError`.
4. Dùng công cụ như **VisualVM**, **Eclipse MAT**, **JProfiler** để phân tích dump.
5. Giới hạn cache, collection không tăng vô hạn.

### Code minh hoạ

```java
import java.util.ArrayList;
import java.util.List;

public class OOMDemo {

    // KHÔNG NÊN: Tích lũy dữ liệu vô hạn → dẫn đến OOM
    static List<byte[]> cache = new ArrayList<>();

    public static void simulateOOM() {
        while (true) {
            // Mỗi lần cấp phát 1MB, không bao giờ giải phóng
            cache.add(new byte[1024 * 1024]);
        }
    }

    // NÊN: Giới hạn kích thước cache, dùng WeakReference hoặc SoftReference
    static java.util.Map<String, java.lang.ref.SoftReference<byte[]>> safeCache
            = new java.util.LinkedHashMap<>() {
        @Override
        protected boolean removeEldestEntry(java.util.Map.Entry eldest) {
            return size() > 100; // Tối đa 100 entry
        }
    };
}
```

```bash
# Bật tự động tạo Heap dump khi OOM xảy ra
java -XX:+HeapDumpOnOutOfMemoryError \
     -XX:HeapDumpPath=/tmp/heapdump.hprof \
     -Xmx2g \
     -jar MyApp.jar
```

### Đáp án mẫu

> "`OutOfMemoryError` xảy ra khi JVM không thể cấp phát thêm bộ nhớ. Nguyên nhân thường gặp nhất là memory leak — object không còn dùng nhưng vẫn được giữ tham chiếu — hoặc đơn giản là Heap quá nhỏ so với nhu cầu. Cách xử lý: bật `-XX:+HeapDumpOnOutOfMemoryError` để lấy heap dump, dùng VisualVM hoặc Eclipse MAT để phân tích object nào chiếm nhiều bộ nhớ nhất, sau đó fix code gây leak hoặc điều chỉnh `-Xmx` phù hợp."

---

## Câu 5: Memory leak trong Java là gì? GC có thu hồi được không? `[Advanced]`

### Câu hỏi

> *"Java có Garbage Collector rồi thì có thể bị memory leak không? Nếu có, cho ví dụ cụ thể."*

### Giải thích lý thuyết

**Memory leak (rò rỉ bộ nhớ)** trong Java xảy ra khi object không còn cần dùng nữa nhưng vẫn còn **tham chiếu đang hoạt động** giữ chúng lại → GC không thể thu hồi.

GC chỉ thu hồi object **không thể truy cập** (unreachable). Nếu code của bạn vô tình giữ tham chiếu → object vẫn "sống" trong mắt GC dù ứng dụng không dùng nữa.

**Các nguyên nhân phổ biến**:
1. **Static collection (collection tĩnh)** tích lũy dữ liệu không xóa.
2. **Listener / Callback** đăng ký mà không hủy đăng ký.
3. **Inner class non-static** giữ tham chiếu đến outer class.
4. **ThreadLocal** không gọi `remove()` sau khi dùng.
5. **Cache không giới hạn** tăng mãi theo thời gian.

### Code minh hoạ

```java
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MemoryLeakExamples {

    // VÍ DỤ 1: Static collection tích lũy dữ liệu — memory leak điển hình
    private static final List<String> leakyList = new ArrayList<>();

    public void addToLeakyList(String item) {
        leakyList.add(item); // Không bao giờ xóa → tăng mãi
    }

    // VÍ DỤ 2: ThreadLocal không được dọn dẹp
    private static final ThreadLocal<Map<String, Object>> threadLocalCache
            = ThreadLocal.withInitial(HashMap::new);

    public void processRequest(String key, Object value) {
        threadLocalCache.get().put(key, value);
        // Thiếu: threadLocalCache.remove() sau khi xử lý xong
        // Với thread pool, thread được tái sử dụng → data cũ tích tụ
    }

    // CÁCH FIX ThreadLocal đúng
    public void processRequestFixed(String key, Object value) {
        try {
            threadLocalCache.get().put(key, value);
            // ... xử lý logic ...
        } finally {
            threadLocalCache.remove(); // Luôn dọn dẹp trong finally
        }
    }
}
```

```java
import java.util.LinkedHashMap;
import java.util.Map;

// VÍ DỤ 3: Cache không giới hạn → dùng LRU cache thay thế
public class SafeCacheExample {

    private static final int MAX_CACHE_SIZE = 1000;

    // LRU Cache (Least Recently Used — xóa item ít dùng gần đây nhất)
    private final Map<String, Object> lruCache = new LinkedHashMap<>(
            MAX_CACHE_SIZE, 0.75f, true) {
        @Override
        protected boolean removeEldestEntry(Map.Entry<String, Object> eldest) {
            return size() > MAX_CACHE_SIZE;
        }
    };
}
```

### Đáp án mẫu

> "Java có thể bị memory leak dù có GC. GC chỉ thu hồi object không còn tham chiếu nào giữ. Nếu code vô tình giữ tham chiếu — ví dụ static List tích lũy mãi, ThreadLocal không gọi remove(), hay listener đăng ký không hủy — thì GC không thể can thiệp. Cách phát hiện: dùng heap dump và phân tích bằng Eclipse MAT để tìm object nào chiếm nhiều bộ nhớ bất thường. Phòng tránh bằng cách dùng WeakReference, giới hạn cache, và luôn gọi remove() cho ThreadLocal."

---

## Câu 6: Stack overflow và heap overflow khác nhau thế nào? `[Intermediate]`

### Câu hỏi

> *"Sự khác biệt giữa StackOverflowError và OutOfMemoryError là gì? Nguyên nhân của từng loại?"*

### Giải thích lý thuyết

**`StackOverflowError` (tràn Stack)**:
- Xảy ra khi Stack của một thread bị đầy.
- Nguyên nhân phổ biến nhất: **đệ quy vô hạn** (infinite recursion) — phương thức gọi chính nó mãi mà không có điều kiện dừng.
- Mỗi lần gọi phương thức tạo một stack frame mới; khi Stack hết chỗ → lỗi.
- Cũng có thể xảy ra khi chuỗi gọi phương thức quá sâu (dù không phải đệ quy thuần túy).

**`OutOfMemoryError` (tràn Heap — hoặc các vùng khác)**:
- Xảy ra khi JVM không thể cấp phát thêm bộ nhớ ở Heap (hoặc Metaspace, Direct buffer...).
- Nguyên nhân: quá nhiều object, memory leak, cache không giới hạn.

| | `StackOverflowError` | `OutOfMemoryError` |
|---|---|---|
| Vùng bộ nhớ | Stack | Heap (hoặc Metaspace) |
| Nguyên nhân chính | Đệ quy vô hạn | Object quá nhiều / memory leak |
| Phạm vi | Một thread | Toàn bộ JVM |
| Khả năng recover | Khó (thường crash thread) | Đôi khi có thể xử lý |

### Code minh hoạ

```java
public class OverflowDemo {

    // GÂY StackOverflowError: Đệ quy không có điều kiện dừng
    public static int infiniteRecursion(int n) {
        return infiniteRecursion(n + 1); // Gọi mãi → Stack đầy → StackOverflowError
    }

    // FIX: Đệ quy có điều kiện dừng rõ ràng
    public static int factorial(int n) {
        if (n <= 1) return 1;       // Điều kiện dừng (base case)
        return n * factorial(n - 1); // Đệ quy có giới hạn
    }

    // FIX tốt hơn: Dùng vòng lặp thay đệ quy sâu
    public static int factorialIterative(int n) {
        int result = 1;
        for (int i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    public static void main(String[] args) {
        try {
            infiniteRecursion(0);
        } catch (StackOverflowError e) {
            System.out.println("Bắt được StackOverflowError: " + e.getMessage());
        }
    }
}
```

```bash
# Tăng kích thước Stack mỗi thread (mặc định thường 512KB-1MB)
java -Xss2m -jar MyApp.jar
```

### Đáp án mẫu

> "`StackOverflowError` xảy ra khi Stack của thread bị đầy, thường do đệ quy vô hạn — phương thức gọi chính nó không có điều kiện dừng. Còn `OutOfMemoryError` xảy ra khi Heap (hoặc Metaspace) không còn chỗ cho object mới. Cách fix `StackOverflowError`: thêm điều kiện dừng cho đệ quy hoặc chuyển sang dùng vòng lặp. Có thể tăng Stack size với `-Xss` nhưng đây chỉ là giải pháp tạm thời."

---

## Câu 7: ClassLoader là gì và có mấy loại? `[Advanced]`

### Câu hỏi

> *"ClassLoader trong Java là gì? JVM có những loại ClassLoader nào và chúng hoạt động theo thứ tự nào?"*

### Giải thích lý thuyết

**ClassLoader (bộ tải lớp)** là thành phần của JVM chịu trách nhiệm **tải bytecode** (file `.class`) vào bộ nhớ và tạo đối tượng `Class` tương ứng khi runtime.

**Mô hình phân cấp (Parent Delegation Model — mô hình ủy quyền cha)**:

Khi ClassLoader được yêu cầu tải một class, nó **không tự tải ngay** mà **ủy quyền lên ClassLoader cha** trước. Chỉ khi cha không tìm thấy thì con mới tự tải.

**Ba loại ClassLoader cơ bản (Java 8 trở về trước)**:

| ClassLoader | Tải từ đâu | Ví dụ |
|---|---|---|
| Bootstrap ClassLoader | `$JAVA_HOME/lib` (rt.jar) | `java.lang.*`, `java.util.*` |
| Extension ClassLoader | `$JAVA_HOME/lib/ext` | Thư viện mở rộng JDK |
| Application ClassLoader | Classpath của ứng dụng | Code của bạn, thư viện bên thứ ba |

Từ **Java 9+** với hệ thống module (Project Jigsaw), Extension ClassLoader được thay bằng **Platform ClassLoader**.

**Lợi ích của Parent Delegation**:
- Ngăn class core của Java (`java.lang.String`) bị ghi đè bởi class cùng tên trong ứng dụng.
- Đảm bảo tính nhất quán và bảo mật.

### Code minh hoạ

```java
public class ClassLoaderDemo {

    public static void main(String[] args) {
        // Xem ClassLoader của các class khác nhau
        Class<String> stringClass = String.class;
        System.out.println("String ClassLoader: " + stringClass.getClassLoader());
        // → null (Bootstrap ClassLoader không phải Java object)

        Class<ClassLoaderDemo> appClass = ClassLoaderDemo.class;
        System.out.println("App class ClassLoader: " + appClass.getClassLoader());
        // → jdk.internal.loader.ClassLoaders$AppClassLoader (hoặc sun.misc.Launcher$AppClassLoader)

        // Lấy ClassLoader hiện tại
        ClassLoader cl = Thread.currentThread().getContextClassLoader();
        System.out.println("Current ClassLoader: " + cl);

        // Lấy chuỗi phân cấp parent
        ClassLoader current = cl;
        while (current != null) {
            System.out.println("ClassLoader: " + current);
            current = current.getParent();
        }
        System.out.println("Cuối chuỗi: Bootstrap ClassLoader (null)");
    }
}
```

```java
// Tải class động bằng ClassLoader — dùng trong plugin system, framework
public class DynamicLoadingDemo {

    public static void loadClassDynamically(String className) throws Exception {
        ClassLoader classLoader = Thread.currentThread().getContextClassLoader();

        // Tải class theo tên đầy đủ (fully qualified name)
        Class<?> loadedClass = classLoader.loadClass(className);

        // Tạo instance và gọi phương thức
        Object instance = loadedClass.getDeclaredConstructor().newInstance();
        System.out.println("Đã tải class: " + loadedClass.getName());
    }
}
```

### Đáp án mẫu

> "ClassLoader chịu trách nhiệm tải file `.class` vào bộ nhớ JVM. Có ba loại chính: Bootstrap ClassLoader tải các class core của Java như `java.lang`, Extension (Platform) ClassLoader tải thư viện mở rộng JDK, và Application ClassLoader tải code ứng dụng từ classpath. Chúng hoạt động theo mô hình Parent Delegation: khi cần tải class, luôn hỏi cha trước, chỉ tự tải khi cha không tìm thấy. Điều này ngăn code ứng dụng ghi đè class core của Java."

---

## Câu 8: Reflection trong Java là gì và dùng khi nào? `[Advanced]`

### Câu hỏi

> *"Reflection trong Java là gì? Ưu và nhược điểm của nó? Khi nào nên và không nên dùng?"*

### Giải thích lý thuyết

**Reflection (phản chiếu)** là khả năng của chương trình **kiểm tra và thao tác cấu trúc của chính nó** tại runtime — bao gồm class, method, field, constructor — mà không cần biết trước tại compile time.

Reflection cho phép:
- Lấy thông tin metadata của class (tên, phương thức, field, annotation).
- Tạo instance từ tên class dạng chuỗi.
- Gọi method private từ bên ngoài.
- Đọc/ghi field dù là `private`.

**Khi nào nên dùng**:
- Framework (Spring, Hibernate, Jackson) dùng để tự động inject, serialize/deserialize.
- Plugin system — tải và thực thi class không biết trước.
- Testing tools — truy cập method/field private trong unit test.
- Dependency Injection container tự động.

**Khi nào KHÔNG nên dùng**:
- Code business logic thông thường — dùng Reflection làm code khó đọc và debug.
- Code cần hiệu năng cao — Reflection chậm hơn gọi method thông thường đáng kể.

**Nhược điểm**:
- **Chậm**: Overhead do kiểm tra type tại runtime.
- **Mất type safety (an toàn kiểu)**: Lỗi compile time trở thành lỗi runtime.
- **Vấn đề bảo mật**: Có thể truy cập thành viên `private`.
- **Khó debug**: Stack trace phức tạp hơn.

### Code minh hoạ

```java
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;

public class ReflectionDemo {

    // Class mẫu để thao tác bằng Reflection
    private static class Person {
        private String name;
        private int age;

        private Person(String name, int age) {
            this.name = name;
            this.age = age;
        }

        private String greet() {
            return "Xin chào, tôi là " + name;
        }
    }

    public static void main(String[] args) throws Exception {
        // 1. Lấy đối tượng Class
        Class<?> clazz = Class.forName("ReflectionDemo$Person");

        // 2. Tạo instance từ constructor private
        Constructor<?> constructor = clazz.getDeclaredConstructor(String.class, int.class);
        constructor.setAccessible(true); // Cho phép truy cập private
        Object person = constructor.newInstance("Alice", 30);

        // 3. Đọc field private "name"
        Field nameField = clazz.getDeclaredField("name");
        nameField.setAccessible(true);
        String name = (String) nameField.get(person);
        System.out.println("Tên: " + name); // Tên: Alice

        // 4. Gọi method private "greet"
        Method greetMethod = clazz.getDeclaredMethod("greet");
        greetMethod.setAccessible(true);
        String greeting = (String) greetMethod.invoke(person);
        System.out.println(greeting); // Xin chào, tôi là Alice

        // 5. Liệt kê tất cả method của class
        System.out.println("Tất cả phương thức:");
        for (Method m : clazz.getDeclaredMethods()) {
            System.out.println("  - " + m.getName());
        }
    }
}
```

```java
import java.lang.annotation.*;
import java.lang.reflect.Method;

// Ví dụ thực tế: Xử lý custom annotation bằng Reflection (như Spring làm)
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface LogExecution {} // Annotation tùy chỉnh

class ServiceExample {
    @LogExecution
    public void processOrder() {
        System.out.println("Đang xử lý đơn hàng...");
    }

    public void nonLoggedMethod() {
        System.out.println("Phương thức không có log");
    }
}

class AnnotationProcessor {
    public static void invokeAnnotatedMethods(Object obj) throws Exception {
        Class<?> clazz = obj.getClass();
        for (Method method : clazz.getDeclaredMethods()) {
            // Kiểm tra method có annotation @LogExecution không
            if (method.isAnnotationPresent(LogExecution.class)) {
                System.out.println("Gọi method có @LogExecution: " + method.getName());
                method.invoke(obj);
            }
        }
    }
}
```

### Đáp án mẫu

> "Reflection cho phép chương trình Java kiểm tra và thao tác cấu trúc class tại runtime — tạo instance từ tên class, gọi method, đọc field kể cả khi là `private`. Nó là nền tảng của các framework như Spring (Dependency Injection), Jackson (JSON serialization), và JUnit. Nhược điểm: chậm hơn gọi method thông thường, mất type safety, và khó debug. Trong code business thông thường không nên dùng Reflection; chỉ dùng khi xây dựng framework, plugin system, hoặc tool kiểm tra metadata."

---
