---
sidebar_position: 27
title: "Integer Constant Pool trong Java"
---

# Integer Constant Pool trong Java

## Integer Constant Pool là gì?

**Integer Constant Pool** (hay **Integer Cache**) là cơ chế của Java để **tái sử dụng** các đối tượng `Integer` trong khoảng từ **-128 đến 127**. Thay vì tạo đối tượng mới mỗi lần, JVM lưu sẵn 256 đối tượng Integer vào một bộ nhớ cache khi khởi động.

Đây là lý do dẫn đến hành vi bất ngờ khi so sánh `Integer` bằng `==`.

---

## Minh họa vấn đề

```java
public class IntegerPoolDemo {
    public static void main(String[] args) {
        // Trong khoảng -128 đến 127
        Integer a = 100;
        Integer b = 100;
        System.out.println(a == b);       // true  ← cùng đối tượng trong Cache!
        System.out.println(a.equals(b));  // true

        // Ngoài khoảng -128 đến 127
        Integer c = 200;
        Integer d = 200;
        System.out.println(c == d);       // false ← đối tượng khác nhau!
        System.out.println(c.equals(d));  // true  ← cùng giá trị

        // Ranh giới: 127 và 128
        Integer e = 127;
        Integer f = 127;
        System.out.println(e == f);  // true

        Integer g = 128;
        Integer h = 128;
        System.out.println(g == h);  // false
    }
}
```

---

## Tại sao lại có Integer Cache?

### Lịch sử ra đời

Từ **Java 5**, Java giới thiệu **Autoboxing** — tự động chuyển `int` thành `Integer`. Trong lập trình thực tế, các số nhỏ (đặc biệt từ -128 đến 127) xuất hiện rất thường xuyên: chỉ mục mảng, vòng lặp, trạng thái...

Nếu mỗi lần autoboxing đều tạo đối tượng mới, sẽ tạo ra hàng triệu đối tượng `Integer` giống nhau, gây lãng phí bộ nhớ và tốn thời gian GC.

### Cách JVM triển khai

```java
// Đây là code nội bộ của JDK (IntegerCache)
// Khi JVM khởi động, tạo sẵn 256 đối tượng Integer
private static class IntegerCache {
    static final Integer[] cache = new Integer[256];
    static {
        for (int i = 0; i < 256; i++) {
            cache[i] = new Integer(i - 128);  // từ -128 đến 127
        }
    }
}

// Integer.valueOf() — dùng cache
public static Integer valueOf(int i) {
    if (i >= -128 && i <= 127) {
        return IntegerCache.cache[i + 128];  // Trả về đối tượng có sẵn
    }
    return new Integer(i);  // Tạo mới nếu ngoài khoảng
}
```

---

## Hình dung bộ nhớ

```
Khi viết: Integer a = 100; Integer b = 100;

Heap - IntegerCache:
[ Integer(-128), Integer(-127), ..., Integer(100), ..., Integer(127) ]
                                         ↑           ↑
                                         a           b
                                     (cùng đối tượng!)

Khi viết: Integer c = 200; Integer d = 200;

Heap:
[0x500] Integer(200)  ← c trỏ đến
[0x600] Integer(200)  ← d trỏ đến (đối tượng KHÁC!)
```

---

## Phạm vi Cache của các Wrapper Class khác

| Wrapper Class | Khoảng cache |
|---|---|
| `Integer` | -128 đến 127 (có thể cấu hình tối đa) |
| `Long` | -128 đến 127 |
| `Short` | -128 đến 127 |
| `Byte` | -128 đến 127 (toàn bộ) |
| `Character` | 0 đến 127 |
| `Boolean` | `true` và `false` |
| `Float`, `Double` | Không có cache |

```java
public class WrapperCacheDemo {
    public static void main(String[] args) {
        // Long
        Long la = 100L;
        Long lb = 100L;
        System.out.println(la == lb);   // true (trong cache)

        Long lc = 200L;
        Long ld = 200L;
        System.out.println(lc == ld);   // false

        // Boolean: chỉ có 2 giá trị, luôn cache
        Boolean ba = true;
        Boolean bb = true;
        System.out.println(ba == bb);   // true

        // Character
        Character ca = 'A';  // 65, trong [0, 127]
        Character cb = 'A';
        System.out.println(ca == cb);   // true
    }
}
```

---

## String Pool — Cơ chế tương tự cho String

String Pool hoạt động theo nguyên tắc tương tự nhưng dành cho chuỗi ký tự:

```java
public class StringPoolDemo {
    public static void main(String[] args) {
        // String literal → dùng String Pool
        String s1 = "Hello";
        String s2 = "Hello";
        System.out.println(s1 == s2);       // true (cùng đối tượng trong Pool)

        // new String() → luôn tạo mới, bỏ qua Pool
        String s3 = new String("Hello");
        String s4 = new String("Hello");
        System.out.println(s3 == s4);       // false
        System.out.println(s3.equals(s4));  // true

        // intern() → lấy về tham chiếu trong Pool
        String s5 = s3.intern();
        System.out.println(s1 == s5);       // true
    }
}
```

---

## Mở rộng khoảng cache Integer

JVM cho phép mở rộng giới hạn trên của Integer Cache thông qua tham số JVM:

```bash
# Mở rộng cache tối đa đến 1000
java -XX:AutoBoxCacheMax=1000 MyApp
```

```java
// Sau khi cấu hình:
Integer a = 500;
Integer b = 500;
System.out.println(a == b);  // true (vì 500 <= 1000)
```

---

## Bài học quan trọng

```java
public class BestPractice {
    public static void main(String[] args) {
        Integer a = 1000;
        Integer b = 1000;

        // SAI: Không dùng == để so sánh giá trị Integer
        if (a == b) {  // Không đáng tin cậy!
            System.out.println("Bằng nhau");
        }

        // ĐÚNG: Dùng equals() để so sánh giá trị
        if (a.equals(b)) {
            System.out.println("Bằng nhau");  // Luôn đúng
        }

        // ĐÚNG: Unboxing về int trước khi so sánh
        int x = a;
        int y = b;
        if (x == y) {
            System.out.println("Bằng nhau");  // Luôn đúng
        }
    }
}
```

---

## Tóm tắt

- **Integer Constant Pool** (Integer Cache): JVM cache sẵn các đối tượng `Integer` từ -128 đến 127
- **Nguyên nhân**: Tiết kiệm bộ nhớ và thời gian tạo đối tượng khi dùng Autoboxing
- **Hậu quả**: So sánh `Integer` bằng `==` cho kết quả không nhất quán ngoài khoảng cache
- **Giải pháp**: Luôn dùng `.equals()` để so sánh giá trị của các Wrapper Class
- Cơ chế tương tự tồn tại ở `Long`, `Short`, `Byte`, `Character`, `Boolean`, và **String Pool**
