---
sidebar_position: 12
title: "Autoboxing và Unboxing trong Java"
---

# Autoboxing và Unboxing trong Java

Autoboxing và Unboxing là cơ chế Java tự động chuyển qua lại giữa kiểu nguyên thủy (như `int`) và lớp bọc tương ứng (như `Integer`). Hiểu rõ cơ chế này giúp bạn dùng Collections dễ dàng hơn và tránh được những cạm bẫy hay gặp như so sánh sai bằng `==` hay lỗi `NullPointerException`. Bài này giải thích khái niệm, ví dụ minh họa và các lưu ý quan trọng khi dùng.

## Kiểu nguyên thủy và Wrapper Class

Java có 8 **kiểu dữ liệu nguyên thủy** (primitive types): `byte`, `short`, `int`, `long`, `float`, `double`, `char`, `boolean`.

Mỗi kiểu nguyên thủy có một **Wrapper Class** (lớp bọc) tương ứng trong gói `java.lang`:

| Kiểu nguyên thủy | Wrapper Class |
|---|---|
| `byte` | `Byte` |
| `short` | `Short` |
| `int` | `Integer` |
| `long` | `Long` |
| `float` | `Float` |
| `double` | `Double` |
| `char` | `Character` |
| `boolean` | `Boolean` |

**Wrapper Class** cần thiết vì nhiều API của Java (như Collections) chỉ làm việc với đối tượng (Object), không làm việc với kiểu nguyên thủy.

---

## Autoboxing là gì?

**Autoboxing** (tự động đóng hộp) là quá trình Java **tự động chuyển** kiểu nguyên thủy thành Wrapper Class tương ứng.

```java
// Trước Java 5: phải chuyển thủ công
Integer obj = Integer.valueOf(42);  // thủ công

// Từ Java 5: Autoboxing — trình biên dịch tự chuyển
Integer obj = 42;  // tự động chuyển int → Integer
```

Ví dụ đầy đủ:

```java
import java.util.ArrayList;
import java.util.List;

public class AutoboxingDemo {
    public static void main(String[] args) {
        // Autoboxing: int → Integer (tự động)
        Integer a = 100;       // int 100 được bọc thành Integer
        Double b = 3.14;       // double 3.14 → Double
        Boolean c = true;      // boolean true → Boolean

        // Autoboxing với ArrayList (chỉ chứa Object, không chứa int)
        List<Integer> numbers = new ArrayList<>();
        numbers.add(1);   // int 1 tự động chuyển thành Integer(1)
        numbers.add(2);   // int 2 tự động chuyển thành Integer(2)
        numbers.add(3);

        System.out.println(numbers);  // [1, 2, 3]
    }
}
```

---

## Unboxing là gì?

**Unboxing** (tự động tháo hộp) là quá trình ngược lại — Java **tự động chuyển** Wrapper Class về kiểu nguyên thủy.

```java
// Trước Java 5: phải chuyển thủ công
Integer obj = Integer.valueOf(42);
int num = obj.intValue();  // thủ công

// Từ Java 5: Unboxing — tự động
Integer obj = 42;
int num = obj;  // tự động chuyển Integer → int
```

Ví dụ đầy đủ:

```java
public class UnboxingDemo {
    public static void main(String[] args) {
        Integer a = 100;
        Integer b = 200;

        // Unboxing: Integer → int khi thực hiện phép tính
        int sum = a + b;  // a và b tự động chuyển về int
        System.out.println("Tổng: " + sum);  // Tổng: 300

        // Unboxing trong biểu thức điều kiện
        Boolean flag = true;
        if (flag) {  // Boolean → boolean
            System.out.println("Điều kiện đúng");
        }

        // Unboxing trong vòng lặp
        List<Integer> numbers = List.of(1, 2, 3, 4, 5);
        int total = 0;
        for (int n : numbers) {  // Integer → int (unboxing)
            total += n;
        }
        System.out.println("Tổng: " + total);  // Tổng: 15
    }
}
```

---

## Cạm bẫy cần biết

### 1. So sánh bằng `==` với Integer

```java
public class TrapDemo {
    public static void main(String[] args) {
        Integer a = 127;
        Integer b = 127;
        System.out.println(a == b);   // true (vì cache -128 đến 127)

        Integer c = 128;
        Integer d = 128;
        System.out.println(c == d);   // false! (ngoài vùng cache)
        System.out.println(c.equals(d)); // true (dùng equals để so sánh giá trị)
    }
}
```

> Giải thích: Java cache sẵn các đối tượng Integer từ -128 đến 127. Ngoài khoảng này, mỗi lần tạo là đối tượng mới. Luôn dùng `.equals()` để so sánh giá trị của Wrapper Class.

### 2. NullPointerException khi Unboxing

```java
public class NullTrapDemo {
    public static void main(String[] args) {
        Integer value = null;

        // Lỗi NullPointerException khi unboxing null
        int num = value;  // NullPointerException!

        // Cách an toàn: kiểm tra null trước
        if (value != null) {
            int safeNum = value;
            System.out.println(safeNum);
        }
    }
}
```

### 3. Hiệu suất trong vòng lặp lớn

```java
// Chậm: Autoboxing liên tục tạo đối tượng Long
Long sum = 0L;
for (long i = 0; i < 1_000_000; i++) {
    sum += i;  // Unboxing Long → long, tính toán, rồi Autoboxing long → Long
}

// Nhanh hơn: dùng kiểu nguyên thủy
long sumFast = 0L;
for (long i = 0; i < 1_000_000; i++) {
    sumFast += i;  // Không có boxing/unboxing
}
```

---

## Các phương thức hữu ích của Wrapper Class

```java
public class WrapperMethodsDemo {
    public static void main(String[] args) {
        // Chuyển String → int
        int num = Integer.parseInt("123");
        double d = Double.parseDouble("3.14");

        // Chuyển int → String
        String s = Integer.toString(456);
        String s2 = String.valueOf(789);

        // Giá trị max/min
        System.out.println(Integer.MAX_VALUE);  // 2147483647
        System.out.println(Integer.MIN_VALUE);  // -2147483648
        System.out.println(Double.MAX_VALUE);   // 1.7976931348623157E308

        // Chuyển đổi hệ cơ số
        System.out.println(Integer.toBinaryString(10));  // 1010 (nhị phân)
        System.out.println(Integer.toHexString(255));    // ff (thập lục phân)
        System.out.println(Integer.toOctalString(8));    // 10 (bát phân)

        // So sánh
        System.out.println(Integer.compare(5, 10));  // âm (5 < 10)
        System.out.println(Integer.max(5, 10));       // 10
        System.out.println(Integer.min(5, 10));       // 5
    }
}
```

---

## Tóm tắt

- **Autoboxing**: Java tự động chuyển kiểu nguyên thủy → Wrapper Class
- **Unboxing**: Java tự động chuyển Wrapper Class → kiểu nguyên thủy
- Luôn dùng `.equals()` thay vì `==` khi so sánh Wrapper Class
- Kiểm tra `null` trước khi unboxing để tránh `NullPointerException`
- Tránh boxing/unboxing trong vòng lặp lớn vì ảnh hưởng hiệu suất
