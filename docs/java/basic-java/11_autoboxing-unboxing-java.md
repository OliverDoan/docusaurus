---
sidebar_position: 11
title: "11. Autoboxing & Unboxing"
---

# Autoboxing & Unboxing trong Java

**Autoboxing** là quá trình Java **tự động chuyển đổi** từ kiểu nguyên thủy (primitive) sang kiểu Wrapper tương ứng (ví dụ `int` -> `Integer`). **Unboxing** là quá trình ngược lại: từ Wrapper sang primitive (ví dụ `Integer` -> `int`). Tính năng này xuất hiện từ **Java 5**, giúp lập trình viên không cần chuyển đổi thủ công.

Hãy hình dung primitive như **tiền mặt** (nhanh, gọn, trực tiếp), còn Wrapper như **ví điện tử** (là một "đối tượng" chứa tiền, có thêm nhiều tính năng nhưng nặng hơn). **Autoboxing** giống như khi bạn **nạp tiền mặt vào ví điện tử** -- Java tự làm giúp bạn. **Unboxing** giống như **rút tiền từ ví ra tiền mặt** -- cũng tự động, nhưng nếu ví rỗng (`null`) thì sẽ bị lỗi!

---

## Mục lục

- [Nội dung](#nội-dung)
- [1. Primitive vs Wrapper Classes](#1-primitive-vs-wrapper-classes)
- [2. Autoboxing (Primitive -> Wrapper)](#2-autoboxing-primitive-wrapper)
- [3. Unboxing (Wrapper -> Primitive)](#3-unboxing-wrapper-primitive)
- [4. Integer Cache (-128 đến 127)](#4-integer-cache-128-đến-127)
- [5. NullPointerException khi Unboxing null](#5-nullpointerexception-khi-unboxing-null)
- [6. Performance Impact trong vòng lặp](#6-performance-impact-trong-vòng-lặp)
- [7. Autoboxing trong Collections](#7-autoboxing-trong-collections)
- [8. Khi nào dùng?](#8-khi-nào-dùng)
- [9. Lỗi thường gặp](#9-lỗi-thường-gặp)
- [10. Câu hỏi phỏng vấn](#10-câu-hỏi-phỏng-vấn)

---

## Nội dung

1. [Primitive vs Wrapper Classes](#1-primitive-vs-wrapper-classes)
2. [Autoboxing (Primitive -> Wrapper)](#2-autoboxing-primitive---wrapper)
3. [Unboxing (Wrapper -> Primitive)](#3-unboxing-wrapper---primitive)
4. [Integer Cache (-128 đến 127)](#4-integer-cache--128-đến-127)
5. [NullPointerException khi Unboxing null](#5-nullpointerexception-khi-unboxing-null)
6. [Performance Impact trong vòng lặp](#6-performance-impact-trong-vòng-lặp)
7. [Autoboxing trong Collections](#7-autoboxing-trong-collections)
8. [Khi nào dùng?](#8-khi-nào-dùng)
9. [Lỗi thường gặp](#9-lỗi-thường-gặp)
10. [Câu hỏi phỏng vấn](#10-câu-hỏi-phỏng-vấn)

---

## 1. Primitive vs Wrapper Classes

Java có **8 kiểu nguyên thủy** và mỗi kiểu có một **Wrapper class** tương ứng:

| Primitive | Wrapper     | Giá trị mặc định (field) |
| --------- | ----------- | ------------------------ |
| `byte`    | `Byte`      | `0` vs `null`            |
| `short`   | `Short`     | `0` vs `null`            |
| `int`     | `Integer`   | `0` vs `null`            |
| `long`    | `Long`      | `0L` vs `null`           |
| `float`   | `Float`     | `0.0f` vs `null`         |
| `double`  | `Double`    | `0.0` vs `null`          |
| `char`    | `Character` | `'\u0000'` vs `null`     |
| `boolean` | `Boolean`   | `false` vs `null`        |

**Khác biệt quan trọng**:

- Primitive **không thể null**, Wrapper **có thể null**.
- Primitive **không thể dùng trong Generics** (`List<int>` sai), Wrapper thì được (`List<Integer>` đúng).
- Primitive **nhanh hơn**, Wrapper tạo object trên heap nên **chậm hơn**.

```java
public class PrimitiveVsWrapper {
    // Khi là field (biến instance)
    int primitiveAge;       // Mặc định: 0
    Integer wrapperAge;     // Mặc định: null

    public static void main(String[] args) {
        PrimitiveVsWrapper demo = new PrimitiveVsWrapper();
        System.out.println("Primitive field: " + demo.primitiveAge); // 0
        System.out.println("Wrapper field: " + demo.wrapperAge);     // null
    }
}
```

---

## 2. Autoboxing (Primitive -> Wrapper)

Java compiler tự động chuyển primitive thành Wrapper khi cần.

```java
public class AutoboxingDemo {
    public static void main(String[] args) {
        // Autoboxing: int -> Integer (tự động)
        Integer a = 42;          // Compiler chuyển thành: Integer.valueOf(42)
        Double b = 3.14;         // Compiler chuyển thành: Double.valueOf(3.14)
        Boolean c = true;        // Compiler chuyển thành: Boolean.valueOf(true)
        Character d = 'A';       // Compiler chuyển thành: Character.valueOf('A')

        System.out.println("Integer: " + a);   // 42
        System.out.println("Double: " + b);    // 3.14
        System.out.println("Boolean: " + c);   // true
        System.out.println("Character: " + d); // A

        // Autoboxing khi truyền tham số
        printInteger(100); // int 100 tự động chuyển thành Integer

        // Autoboxing khi gán vào mảng wrapper
        Integer[] numbers = {1, 2, 3, 4, 5}; // Mỗi int tự động boxing
    }

    static void printInteger(Integer num) {
        System.out.println("Received: " + num);
    }
}
```

**Bên trong compiler**: Khi bạn viết `Integer a = 42;`, compiler thực chất biên dịch thành `Integer a = Integer.valueOf(42);`. Method `valueOf()` có cơ chế cache (sẽ nói ở phần 4).

---

## 3. Unboxing (Wrapper -> Primitive)

Java compiler tự động chuyển Wrapper thành primitive khi cần.

```java
public class UnboxingDemo {
    public static void main(String[] args) {
        // Unboxing: Integer -> int (tự động)
        Integer wrapperNum = Integer.valueOf(50);
        int primitiveNum = wrapperNum; // Compiler chuyển thành: wrapperNum.intValue()
        System.out.println(primitiveNum); // 50

        // Unboxing trong phép tính
        Integer a = 10;
        Integer b = 20;
        int sum = a + b;  // Cả a và b được unboxing trước khi cộng
        System.out.println("Sum: " + sum); // 30

        // Unboxing trong điều kiện
        Boolean isActive = Boolean.TRUE;
        if (isActive) { // Boolean tự động unboxing thành boolean
            System.out.println("Active!");
        }

        // Unboxing khi truyền tham số
        Integer number = 42;
        printInt(number); // Integer tự động unboxing thành int
    }

    static void printInt(int num) {
        System.out.println("Primitive int: " + num);
    }
}
```

---

## 4. Integer Cache (-128 đến 127)

Java **cache (lưu sẵn)** các đối tượng `Integer` có giá trị từ **-128 đến 127**. Khi bạn dùng `Integer.valueOf()` hoặc autoboxing với giá trị trong khoảng này, Java trả về **cùng một object** thay vì tạo mới.

Đây là kiến thức **rất hay hỏi trong phỏng vấn**.

```java
public class IntegerCacheDemo {
    public static void main(String[] args) {
        // Giá trị trong khoảng -128 đến 127: DÙNG CACHE
        Integer a = 127;
        Integer b = 127;
        System.out.println(a == b);      // true (cùng object từ cache)
        System.out.println(a.equals(b)); // true (cùng giá trị)

        // Giá trị NGOÀI khoảng -128 đến 127: TẠO OBJECT MỚI
        Integer c = 128;
        Integer d = 128;
        System.out.println(c == d);      // false (2 object khác nhau!)
        System.out.println(c.equals(d)); // true  (cùng giá trị)

        // Minh họa thêm
        Integer e = -128;
        Integer f = -128;
        System.out.println(e == f);      // true (trong khoảng cache)

        Integer g = -129;
        Integer h = -129;
        System.out.println(g == h);      // false (ngoài khoảng cache)

        // Với new Integer() luôn tạo object mới (deprecated từ Java 9)
        // Integer x = new Integer(127);
        // Integer y = new Integer(127);
        // System.out.println(x == y); // false! (2 object mới, bỏ qua cache)
    }
}
```

**Tại sao có cache?** Các giá trị nhỏ (-128 đến 127) được dùng rất thường xuyên. Cache giúp tiết kiệm bộ nhớ và tăng tốc. Khoảng cache có thể mở rộng bằng JVM option `-XX:AutoBoxCacheMax=<size>`.

---

## 5. NullPointerException khi Unboxing null

Đây là **bẫy nguy hiểm nhất** của autoboxing/unboxing.

```java
public class NullUnboxingDemo {
    public static void main(String[] args) {
        // Wrapper có thể null
        Integer number = null;

        // Unboxing null -> NullPointerException!
        try {
            int value = number; // NPE! Vì compiler chuyển thành number.intValue()
        } catch (NullPointerException e) {
            System.out.println("NullPointerException khi unboxing null!");
        }

        // Cũng xảy ra trong phép tính
        Integer a = null;
        Integer b = 10;
        try {
            int sum = a + b; // NPE! Vì a được unboxing
        } catch (NullPointerException e) {
            System.out.println("NPE trong phép tính!");
        }

        // Cũng xảy ra trong điều kiện
        Boolean flag = null;
        try {
            if (flag) { // NPE! Vì flag được unboxing
                System.out.println("True");
            }
        } catch (NullPointerException e) {
            System.out.println("NPE trong điều kiện!");
        }

        // === CÁCH PHÒNG TRÁNH ===
        // Kiểm tra null trước khi dùng
        Integer safeNumber = null;
        if (safeNumber != null) {
            int safeValue = safeNumber;
            System.out.println(safeValue);
        } else {
            System.out.println("Giá trị null, dùng mặc định: 0");
        }

        // Hoặc dùng giá trị mặc định
        int result = (safeNumber != null) ? safeNumber : 0;
        System.out.println("Kết quả: " + result);
    }
}
```

---

## 6. Performance Impact trong vòng lặp

Autoboxing trong vòng lặp có thể tạo ra **hàng triệu object không cần thiết**, gây chậm chương trình.

```java
public class PerformanceDemo {
    public static void main(String[] args) {
        // ❌ Sai: dùng Wrapper trong vòng lặp tính toán
        long startBad = System.currentTimeMillis();
        Long sumBad = 0L; // Wrapper!
        for (int i = 0; i < 10_000_000; i++) {
            sumBad += i; // Mỗi lần: unboxing -> cộng -> autoboxing (tạo object mới!)
        }
        long endBad = System.currentTimeMillis();
        System.out.println("Wrapper: " + (endBad - startBad) + "ms, sum=" + sumBad);

        // ✅ Đúng: dùng primitive trong vòng lặp tính toán
        long startGood = System.currentTimeMillis();
        long sumGood = 0L; // Primitive!
        for (int i = 0; i < 10_000_000; i++) {
            sumGood += i; // Chỉ là phép cộng đơn giản, không tạo object
        }
        long endGood = System.currentTimeMillis();
        System.out.println("Primitive: " + (endGood - startGood) + "ms, sum=" + sumGood);

        // Kết quả: Wrapper chậm hơn đáng kể (có thể gấp 5-10 lần)
    }
}
```

---

## 7. Autoboxing trong Collections

Collections (`List`, `Set`, `Map`...) chỉ chứa **object**, không chứa primitive. Autoboxing giúp bạn thêm primitive vào Collections mà không cần chuyển đổi thủ công.

```java
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CollectionAutoboxingDemo {
    public static void main(String[] args) {
        // List<int> sai! Phải dùng List<Integer>
        List<Integer> numbers = new ArrayList<>();
        numbers.add(1);   // Autoboxing: int 1 -> Integer.valueOf(1)
        numbers.add(2);
        numbers.add(3);

        // Unboxing khi lấy ra
        int first = numbers.get(0); // Unboxing: Integer -> int
        System.out.println("First: " + first); // 1

        // Map cũng tương tự
        Map<String, Integer> scores = new HashMap<>();
        scores.put("Math", 95);    // Autoboxing: int 95 -> Integer
        scores.put("English", 88);

        int mathScore = scores.get("Math"); // Unboxing
        System.out.println("Math: " + mathScore); // 95

        // Cẩn thận: get() trả về null nếu key không tồn tại
        // Integer physicsScore = scores.get("Physics"); // null
        // int score = physicsScore; // NullPointerException!

        // An toàn hơn: dùng getOrDefault
        int physicsScore = scores.getOrDefault("Physics", 0);
        System.out.println("Physics: " + physicsScore); // 0
    }
}
```

---

## 8. Khi nào dùng?

| Dùng Primitive                      | Dùng Wrapper                                |
| ----------------------------------- | ------------------------------------------- |
| Tính toán, vòng lặp (cần hiệu năng) | Dùng trong Collections (`List<Integer>`)    |
| Giá trị luôn có, không bao giờ null | Cần biểu thị "không có giá trị" (`null`)    |
| Biến local trong method             | Field trong entity/DTO có thể null          |
| Không cần method đặc biệt           | Cần gọi method (`parseInt`, `compareTo`...) |

**Best practices**:

- **Ưu tiên primitive** khi không cần null và không dùng trong Generics.
- Luôn **kiểm tra null** trước khi unboxing Wrapper.
- **Dùng `equals()`** thay vì `==` khi so sánh Wrapper (trừ khi bạn hiểu rõ Integer cache).
- **Tránh autoboxing trong vòng lặp** -- dùng primitive cho biến tích lũy.
- Dùng `getOrDefault()` khi lấy giá trị từ Map để tránh NPE.

---

## 9. Lỗi thường gặp

### Lỗi 1: NullPointerException khi unboxing

```java
// ❌ Sai: unboxing null
Integer count = null;
// int value = count; // NPE!

// ✅ Đúng: kiểm tra null
int value = (count != null) ? count : 0;
```

### Lỗi 2: Dùng `==` thay vì `equals()` để so sánh giá trị Wrapper

```java
// ❌ Sai: == so sánh reference, không phải giá trị
Integer a = 200;
Integer b = 200;
if (a == b) { // false! (ngoài khoảng cache -128 đến 127)
    System.out.println("Bằng nhau");
}

// ✅ Đúng: dùng equals() hoặc ép về primitive
if (a.equals(b)) { // true!
    System.out.println("Bằng nhau");
}

// Hoặc
if (a.intValue() == b.intValue()) { // true!
    System.out.println("Bằng nhau");
}
```

### Lỗi 3: Autoboxing gây chậm trong vòng lặp

```java
// ❌ Sai: dùng Integer thay vì int
Integer sum = 0;
for (int i = 0; i < 1_000_000; i++) {
    sum += i; // Tạo hàng triệu Integer object!
}

// ✅ Đúng: dùng primitive
int sum2 = 0;
for (int i = 0; i < 1_000_000; i++) {
    sum2 += i; // Nhanh gấp nhiều lần
}
```

### Lỗi 4: So sánh `==` cho kết quả "lúc đúng lúc sai"

```java
// ❌ Sai hiểu: tưởng == luôn đúng vì giá trị bằng nhau
Integer x = 100;
Integer y = 100;
System.out.println(x == y); // true (trong cache!)

Integer m = 200;
Integer n = 200;
System.out.println(m == n); // false (ngoài cache!)

// ✅ Đúng: LUÔN dùng equals() cho wrapper
System.out.println(x.equals(y)); // true
System.out.println(m.equals(n)); // true
```

---

## 10. Câu hỏi phỏng vấn

### Q1: `new Integer(127) == new Integer(127)` trả về gì? Tại sao?

**A**: Trả về **`false`**.

`new Integer()` **luôn tạo object mới** trên heap, bỏ qua Integer cache. Nên hai object khác reference, `==` trả về `false`.

Ngược lại, `Integer.valueOf(127) == Integer.valueOf(127)` trả về **`true`** vì `valueOf()` sử dụng cache cho giá trị -128 đến 127, trả về cùng object.

```java
// new Integer() luôn tạo mới (deprecated từ Java 9)
// Integer a = new Integer(127);
// Integer b = new Integer(127);
// a == b -> false (2 object khác nhau)

// valueOf() dùng cache
Integer c = Integer.valueOf(127);
Integer d = Integer.valueOf(127);
// c == d -> true (cùng object từ cache)
```

_Lưu ý: `new Integer(int)` đã deprecated từ Java 9, nên dùng `Integer.valueOf()` thay thế._

---

### Q2: Tại sao cần Autoboxing cho Collections?

**A**: Java Generics hoạt động dựa trên **type erasure** -- tại compile time, generic type bị xóa và thay bằng `Object`. Vì primitive **không phải Object** (không kế thừa từ `Object`), nên không thể dùng `List<int>`. Phải dùng `List<Integer>` -- và autoboxing giúp chuyển `int` sang `Integer` tự động.

```java
// Lỗi biên dịch: primitive không dùng trong Generics
// List<int> numbers = new ArrayList<>();

// Đúng: dùng Wrapper
List<Integer> numbers = new ArrayList<>();
numbers.add(42); // Autoboxing: int -> Integer
```

---

### Q3: Khi nào unboxing gây NullPointerException?

**A**: Khi biến Wrapper có giá trị **`null`** và bị unboxing sang primitive. Compiler chuyển unboxing thành gọi method (ví dụ `.intValue()`), mà gọi method trên `null` sẽ ném NPE.

Các trường hợp thường gặp:

1. Gán Wrapper null cho biến primitive: `int x = nullInteger;`
2. Dùng Wrapper null trong phép tính: `int sum = nullInteger + 5;`
3. Dùng Boolean null trong điều kiện: `if (nullBoolean) { }`
4. Lấy giá trị null từ Map rồi gán cho primitive: `int x = map.get("missing_key");`

---

### Q4: `==` vs `equals()` với Integer Wrapper -- giải thích chi tiết?

**A**:

- `==` so sánh **reference** (có phải cùng object hay không).
- `equals()` so sánh **giá trị** bên trong.

Do Integer cache (-128 đến 127), `==` **có thể cho kết quả đúng** với giá trị nhỏ (vì cùng object cache), nhưng **sai** với giá trị lớn (vì tạo object mới). Đây chính là lý do `==` **không đáng tin cậy** cho Wrapper -- luôn dùng `equals()`.

```java
Integer a = 127, b = 127;
System.out.println(a == b);      // true  (cache)
System.out.println(a.equals(b)); // true  (giá trị)

Integer c = 128, d = 128;
System.out.println(c == d);      // false (ngoài cache, 2 object khác)
System.out.println(c.equals(d)); // true  (giá trị vẫn bằng)
```

---

### Q5: Autoboxing ảnh hưởng hiệu năng như thế nào?

**A**: Mỗi lần autoboxing, Java tạo (hoặc lấy từ cache) một **object Wrapper trên heap**. Trong vòng lặp lớn, điều này tạo ra hàng triệu object tạm, gây:

1. **Tốn bộ nhớ**: mỗi Integer object chiếm khoảng 16 bytes (so với 4 bytes cho `int`).
2. **Tăng áp lực GC**: Garbage Collector phải thu hồi các object tạm.
3. **Chậm hơn đáng kể**: có thể chậm gấp 5-10 lần so với dùng primitive.

Khuyến nghị: dùng **primitive cho mọi tính toán và vòng lặp**, chỉ dùng Wrapper khi bắt buộc (Collections, nullable field).
