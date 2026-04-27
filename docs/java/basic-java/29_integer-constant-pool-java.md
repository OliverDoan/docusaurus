---
sidebar_position: 29
title: "29. Integer Constant Pool"
---

# Integer Constant Pool trong Java


---

## Mục lục

- [Integer Constant Pool là gì?](#integer-constant-pool-là-gì)
- [1. Cơ chế Integer Cache hoạt động như thế nào?](#1-cơ-chế-integer-cache-hoạt-động-như-thế-nào)
- [2. Demo: == cho Integer 127 vs 128](#2-demo-cho-integer-127-vs-128)
- [3. Tại sao Java làm vậy?](#3-tại-sao-java-làm-vậy)
- [4. Tương tự cho các Wrapper class khác](#4-tương-tự-cho-các-wrapper-class-khác)
- [5. Integer.valueOf() vs new Integer()](#5-integervalueof-vs-new-integer)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Integer Constant Pool là gì?

**Integer Constant Pool** (hay Integer Cache) là cơ chế tối ưu bộ nhớ trong Java. Thay vì tạo mới một object `Integer` mới mỗi khi bạn dùng autoboxing, Java **lưu sẵn (cache) các đối tượng Integer** có giá trị từ **-128 đến 127** trong bộ nhớ. Khi bạn sử dụng giá trị trong khoảng này, Java sẽ trả về **cùng một object** thay vì tạo object mới.

Hãy tưởng tượng như một **thư viện sách công cộng**: nếu quyển sách bạn cần là quyển phổ biến (giá trị -128 đến 127), thư viện đã có sẵn một bản -- mọi người đều mượn chung quyển đó. Nhưng nếu bạn cần quyển sách hiếm (giá trị ngoài khoảng), thư viện phải in riêng một bản mới cho bạn.

Đây là chủ đề **rất hay xuất hiện trong phỏng vấn Java** và dễ gây nhầm lẫn nếu không hiểu rõ.

---

## 1. Cơ chế Integer Cache hoạt động như thế nào?

Khi bạn viết:

```java
Integer a = 127;  // autoboxing: goi Integer.valueOf(127)
Integer b = 127;  // autoboxing: goi Integer.valueOf(127)
```

Java **không gọi `new Integer(127)`**. Thay vào đó, nó gọi `Integer.valueOf(127)`, và method này sẽ:

1. Kiểm tra xem giá trị `127` có nằm trong khoảng **-128 đến 127** không.
2. Nếu **có** -- trả về object đã được cache sẵn.
3. Nếu **không** -- tạo object `Integer` mới.

Hãy xem source code thật của `Integer.valueOf()`:

```java
// Source code ben trong JDK (don gian hoa)
public static Integer valueOf(int i) {
    if (i >= -128 && i <= 127) {
        return IntegerCache.cache[i + 128]; // Tra ve object da cache
    }
    return new Integer(i); // Tao object moi
}
```

---

## 2. Demo: == cho Integer 127 vs 128

Đây là ví dụ kinh điển trong phỏng vấn Java:

```java
public class IntegerCacheDemo {
    public static void main(String[] args) {
        // === Truong hop 1: Gia tri trong khoang cache (-128 den 127) ===
        Integer a = 127;
        Integer b = 127;

        System.out.println("a == b: " + (a == b));           // true
        System.out.println("a.equals(b): " + a.equals(b));   // true

        // === Truong hop 2: Gia tri NGOAI khoang cache ===
        Integer x = 128;
        Integer y = 128;

        System.out.println("x == y: " + (x == y));           // false (!)
        System.out.println("x.equals(y): " + x.equals(y));   // true

        // === Truong hop 3: Dung new Integer (luon tao object moi) ===
        Integer m = new Integer(127); // deprecated tu Java 9, nhung van chay
        Integer n = new Integer(127);

        System.out.println("m == n: " + (m == n));           // false
        System.out.println("m.equals(n): " + m.equals(n));   // true

        // === Truong hop 4: So sanh Integer voi int (unboxing) ===
        Integer p = 128;
        int q = 128;

        System.out.println("p == q: " + (p == q));           // true (unboxing)
    }
}
```

**Giải thích kết quả:**

| Biểu thức | Kết quả | Lý do |
|-----------|---------|-------|
| `a == b` (127) | `true` | Cả hai trỏ cùng object trong cache |
| `x == y` (128) | `false` | 128 ngoài cache, tạo 2 object khác nhau |
| `m == n` (new) | `false` | `new` luôn tạo object mới, không dùng cache |
| `p == q` (Integer vs int) | `true` | `p` được unbox thành `int`, so sánh giá trị |

---

## 3. Tại sao Java làm vậy?

### Lý do về performance và memory

- Các giá trị nhỏ (-128 đến 127) được sử dụng **rất thường xuyên** trong lập trình (index mảng, đếm, cờ điều kiện...).
- Thay vì tạo hàng ngàn object `Integer` giống nhau, Java **tạo sẵn một lần** và tái sử dụng.
- Tiết kiệm **bộ nhớ heap** và giảm áp lực **garbage collection**.

### Tại sao lại là -128 đến 127?

- Khoảng này trùng với phạm vi của kiểu `byte` (-128 đến 127).
- **Java Language Specification (JLS 5.1.7)** yêu cầu bắt buộc cache ít nhất khoảng này.
- Có thể mở rộng upper bound bằng JVM option:

```
java -XX:AutoBoxCacheMax=1000 MyApp
```

---

## 4. Tương tự cho các Wrapper class khác

Không chỉ `Integer`, nhiều wrapper class khác cũng có cache:

```java
public class OtherCacheDemo {
    public static void main(String[] args) {
        // Long: cache -128 den 127
        Long l1 = 127L;
        Long l2 = 127L;
        System.out.println("Long 127: " + (l1 == l2));   // true

        Long l3 = 128L;
        Long l4 = 128L;
        System.out.println("Long 128: " + (l3 == l4));   // false

        // Short: cache -128 den 127
        Short s1 = 100;
        Short s2 = 100;
        System.out.println("Short 100: " + (s1 == s2));  // true

        // Byte: cache toan bo -128 den 127 (dung pham vi byte)
        Byte b1 = 50;
        Byte b2 = 50;
        System.out.println("Byte 50: " + (b1 == b2));    // true

        // Character: cache 0 den 127
        Character c1 = 'A';  // 65
        Character c2 = 'A';
        System.out.println("Char A: " + (c1 == c2));     // true

        // Boolean: chi co 2 gia tri, luon cache
        Boolean bool1 = true;
        Boolean bool2 = true;
        System.out.println("Boolean: " + (bool1 == bool2)); // true

        // Float va Double: KHONG co cache
        Double d1 = 1.0;
        Double d2 = 1.0;
        System.out.println("Double: " + (d1 == d2));     // false
    }
}
```

**Bảng tóm tắt cache:**

| Wrapper class | Khoảng cache | Ghi chú |
|---------------|-------------|---------|
| `Integer` | -128 đến 127 | Có thể mở rộng bằng JVM option |
| `Long` | -128 đến 127 | Không thể mở rộng |
| `Short` | -128 đến 127 | Không thể mở rộng |
| `Byte` | -128 đến 127 | Toàn bộ phạm vi byte |
| `Character` | 0 đến 127 | Ký tự ASCII cơ bản |
| `Boolean` | `true`, `false` | Chỉ 2 giá trị, luôn cache |
| `Float` | Không cache | |
| `Double` | Không cache | |

---

## 5. Integer.valueOf() vs new Integer()

```java
public class ValueOfVsNew {
    public static void main(String[] args) {
        // valueOf(): su dung cache (nen dung)
        Integer a = Integer.valueOf(100);
        Integer b = Integer.valueOf(100);
        System.out.println("valueOf: " + (a == b));  // true (cung object tu cache)

        // new Integer(): luon tao object moi (KHONG nen dung)
        Integer c = new Integer(100);  // Deprecated tu Java 9
        Integer d = new Integer(100);
        System.out.println("new: " + (c == d));      // false (2 object khac nhau)

        // Autoboxing su dung valueOf() phia sau
        Integer e = 100;  // tuong duong Integer.valueOf(100)
        System.out.println("autobox: " + (a == e));  // true
    }
}
```

**Kết luận:** Luôn dùng `Integer.valueOf()` hoặc autoboxing. **Không bao giờ dùng `new Integer()`** (đã deprecated từ Java 9).

---

## Khi nào dùng?

| Tình huống | Lời khuyên |
|------------|-----------|
| So sánh 2 giá trị Integer | **Luôn dùng `equals()`**, không dùng `==` |
| Tạo Integer từ giá trị | Dùng `Integer.valueOf()` hoặc autoboxing |
| Cần so sánh tham chiếu (hiếm khi cần) | Hiểu rõ cache range trước khi dùng `==` |
| Viết code có nhiều giá trị Integer nhỏ | Yên tâm, Java đã tối ưu bằng cache |

**Best practices:**
- **Luôn dùng `equals()`** khi so sánh wrapper objects.
- Ưu tiên dùng kiểu `int` (primitive) khi không cần null.
- Tránh `new Integer()` -- đã deprecated.
- Khi làm việc với collection (`List<Integer>`), hiểu rằng autoboxing đang sử dụng `valueOf()`.

---

## Lỗi thường gặp

### Lỗi 1: Dùng == để so sánh Integer

```java
// ❌ Sai: Dung == cho Integer object
Integer price1 = 500;
Integer price2 = 500;
if (price1 == price2) {  // false! Vi 500 ngoai cache
    System.out.println("Bang nhau");
}
```

```java
// ✅ Dung: Dung equals()
Integer price1 = 500;
Integer price2 = 500;
if (price1.equals(price2)) {  // true
    System.out.println("Bang nhau");
}
```

### Lỗi 2: Nghĩ rằng == luôn sai cho Integer

```java
// ❌ Hieu nham: "== luon tra ve false cho Integer"
Integer a = 50;
Integer b = 50;
System.out.println(a == b);  // true! Vi 50 nam trong cache

// Ket qua phu thuoc vao GIA TRI, khong phai luc nao cung false
```

### Lỗi 3: Không hiểu sự khác biệt giữa Integer và int khi dùng ==

```java
// ❌ Nham lan
Integer a = 200;
int b = 200;
System.out.println(a == b);  // true (a duoc unbox thanh int)

Integer x = 200;
Integer y = 200;
System.out.println(x == y);  // false (so sanh tham chieu)
```

```java
// ✅ Hieu dung: Khi so sanh Integer voi int, Java unbox Integer thanh int
// Khi so sanh Integer voi Integer, Java so sanh tham chieu (reference)
```

### Lỗi 4: Dùng new Integer() thay vì valueOf()

```java
// ❌ Sai: Tao object moi khong can thiet
Integer a = new Integer(10);  // Deprecated, luon tao object moi

// ✅ Dung: De Java su dung cache
Integer a = Integer.valueOf(10);  // Hoac don gian: Integer a = 10;
```

---

## Câu hỏi phỏng vấn

### Câu 1: Integer a = 127, b = 127. a == b trả về gì? Tại sao?

**Trả lời:** Trả về `true`. Khi autoboxing, Java gọi `Integer.valueOf(127)`. Vì 127 nằm trong khoảng cache (-128 đến 127), cả `a` và `b` đều trỏ đến **cùng một object** trong Integer Cache. Toán tử `==` so sánh tham chiếu, và vì cùng tham chiếu nên trả về `true`.

### Câu 2: Integer a = 128, b = 128. a == b trả về gì? Tại sao?

**Trả lời:** Trả về `false`. Giá trị 128 nằm **ngoài khoảng cache** (-128 đến 127). Do đó, `Integer.valueOf(128)` tạo **2 object Integer khác nhau** trên heap. Toán tử `==` so sánh tham chiếu, 2 object khác nhau nên trả về `false`. Để so sánh giá trị, phải dùng `a.equals(b)` (trả về `true`).

### Câu 3: Integer.valueOf(10) khác gì new Integer(10)?

**Trả lời:**
- `Integer.valueOf(10)`: Kiểm tra cache trước. Nếu giá trị nằm trong khoảng -128 đến 127, trả về object đã cache. Nếu ngoài khoảng, tạo object mới. **Tiết kiệm bộ nhớ.**
- `new Integer(10)`: **Luôn tạo object mới** trên heap, không bao giờ dùng cache. Đã **deprecated từ Java 9** vì lãng phí bộ nhớ.
- **Nên dùng:** `Integer.valueOf()` hoặc autoboxing (`Integer a = 10`).

### Câu 4: Tại sao Java chỉ cache -128 đến 127?

**Trả lời:** Theo Java Language Specification (JLS 5.1.7), JVM bắt buộc phải cache các giá trị Integer trong khoảng -128 đến 127. Lý do:
- Khoảng này trùng với phạm vi kiểu `byte`, là những giá trị **được sử dụng thường xuyên nhất** (index, biến đếm, flag...).
- Cache giúp **giảm số lượng object** trên heap, giảm áp lực garbage collection.
- Có thể tăng upper bound bằng JVM option `-XX:AutoBoxCacheMax=N`, nhưng **không thể giảm lower bound** (-128).

### Câu 5: Làm sao để so sánh 2 Integer an toàn?

**Trả lời:** Có 3 cách:
1. **Dùng `equals()`**: `a.equals(b)` -- cách chuẩn nhất.
2. **Unbox về `int`**: `a.intValue() == b.intValue()` -- so sánh primitive.
3. **Dùng `Integer.compare()`**: `Integer.compare(a, b) == 0` -- an toàn với null-safe wrapper.

**Không bao giờ dùng `==`** để so sánh giá trị của 2 Integer object, vì kết quả phụ thuộc vào cache và không nhất quán.
