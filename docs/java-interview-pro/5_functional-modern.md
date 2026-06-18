---
sidebar_position: 5
title: "5. Functional & Java hiện đại"
---

# Functional & Java hiện đại

> *Từ Java 8 trở đi, ngôn ngữ liên tục bổ sung các tính năng hàm (functional) và biểu đạt (expressive) — nắm vững chúng là yếu tố phân biệt senior và junior trong mắt interviewer.*

---

## Câu 1: Stream API và lập trình hàm trong Java 8 là gì? `[Intermediate]`

### Câu hỏi

> *"Anh/chị có thể giải thích Stream API trong Java 8 là gì và tại sao nó lại quan trọng không?"*

### Giải thích lý thuyết

**Stream API** (Application Programming Interface) là một cơ chế xử lý tập hợp dữ liệu theo phong cách **lập trình hàm** (functional programming) được giới thiệu trong Java 8.

Điểm cốt lõi cần hiểu:

- **Stream** không phải là cấu trúc dữ liệu — nó là một **luồng xử lý** (pipeline) đi qua dữ liệu mà không lưu trữ.
- Phân biệt hai loại thao tác:
  - **Intermediate operations** (thao tác trung gian): `filter`, `map`, `sorted`, `distinct` — lười biếng (lazy), chỉ thực thi khi có terminal operation.
  - **Terminal operations** (thao tác kết thúc): `collect`, `forEach`, `reduce`, `count` — kích hoạt toàn bộ pipeline.
- **Lazy evaluation** (đánh giá lười): Stream chỉ xử lý phần tử khi thực sự cần, giúp tối ưu hiệu năng.
- Stream hỗ trợ **parallel stream** (stream song song) để tận dụng đa nhân CPU thông qua `parallelStream()`.

So sánh phong cách lập trình:

| Tiêu chí | Imperative (truyền thống) | Functional (Stream) |
|---|---|---|
| Cách viết | Vòng lặp `for`, biến tạm | Pipeline chain |
| Đọc hiểu | Tường minh nhưng dài | Ngắn gọn, declarative |
| Song song hóa | Phức tạp, cần tự xử lý | Chỉ đổi sang `parallelStream()` |
| Side effect | Dễ xảy ra | Hạn chế tối đa |

### Code minh hoạ

```java
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class StreamAPIDemo {
    public static void main(String[] args) {
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

        // Phong cách imperative (truyền thống)
        List<Integer> evenSquaresImperative = new java.util.ArrayList<>();
        for (int n : numbers) {
            if (n % 2 == 0) {
                evenSquaresImperative.add(n * n);
            }
        }

        // Phong cách functional với Stream API
        List<Integer> evenSquaresStream = numbers.stream()
            .filter(n -> n % 2 == 0)      // intermediate: lọc số chẵn
            .map(n -> n * n)               // intermediate: bình phương
            .collect(Collectors.toList()); // terminal: thu thập kết quả

        System.out.println(evenSquaresStream); // [4, 16, 36, 64, 100]

        // Stream song song — hữu ích khi tập dữ liệu lớn
        long count = numbers.parallelStream()
            .filter(n -> n > 5)
            .count(); // terminal operation

        System.out.println("Số phần tử > 5: " + count); // 5
    }
}
```

### Đáp án mẫu

> "Stream API là cơ chế xử lý collection theo phong cách lập trình hàm, giúp viết code ngắn gọn và dễ đọc hơn. Nó hoạt động theo mô hình pipeline gồm các intermediate operations lười biếng và terminal operation kích hoạt thực thi. Ưu điểm lớn nhất là hỗ trợ parallel processing dễ dàng và giảm thiểu side effect. Tôi thường dùng Stream khi cần filter, transform, hoặc aggregate dữ liệu từ collection."

---

## Câu 2: Functional interface là gì? Lambda liên quan thế nào? `[Intermediate]`

### Câu hỏi

> *"Functional interface là gì trong Java? Tại sao nó lại là nền tảng cho lambda expression?"*

### Giải thích lý thuyết

**Functional interface** là interface chỉ có **đúng một abstract method** (phương thức trừu tượng). Annotation `@FunctionalInterface` giúp compiler kiểm tra điều này nhưng không bắt buộc.

**Lambda expression** là cú pháp rút gọn để tạo instance của một functional interface — thay vì viết anonymous class dài dòng, ta viết ngắn gọn bằng `(tham_số) -> biểu_thức`.

Các functional interface quan trọng trong `java.util.function`:

| Interface | Mô tả | Signature |
|---|---|---|
| `Predicate<T>` | Nhận T, trả boolean | `test(T t)` |
| `Function<T, R>` | Nhận T, trả R | `apply(T t)` |
| `Consumer<T>` | Nhận T, không trả về | `accept(T t)` |
| `Supplier<T>` | Không nhận, trả T | `get()` |
| `BiFunction<T, U, R>` | Nhận T và U, trả R | `apply(T t, U u)` |
| `UnaryOperator<T>` | Nhận T, trả T | `apply(T t)` |

### Code minh hoạ

```java
import java.util.function.*;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

// Định nghĩa functional interface tùy chỉnh
@FunctionalInterface
interface Transformer<T, R> {
    R transform(T input);
    // Chỉ được có một abstract method — thêm method thứ hai sẽ lỗi compile
}

public class FunctionalInterfaceDemo {
    public static void main(String[] args) {
        // Predicate: kiểm tra điều kiện
        Predicate<String> isLong = s -> s.length() > 5;
        System.out.println(isLong.test("Hello"));     // false
        System.out.println(isLong.test("Hello World")); // true

        // Function: chuyển đổi kiểu dữ liệu
        Function<String, Integer> strToLength = String::length; // method reference
        System.out.println(strToLength.apply("Java")); // 4

        // Consumer: thực hiện hành động, không trả về
        Consumer<String> printer = System.out::println;
        printer.accept("Xin chào!"); // In ra: Xin chào!

        // Supplier: cung cấp giá trị
        Supplier<String> greeting = () -> "Hello, Java!";
        System.out.println(greeting.get()); // Hello, Java!

        // Sử dụng functional interface tùy chỉnh
        Transformer<String, String> toUpperCase = String::toUpperCase;
        System.out.println(toUpperCase.transform("java")); // JAVA

        // Kết hợp trong Stream
        List<String> names = Arrays.asList("Alice", "Bob", "Charlie");
        names.stream()
             .filter(isLong)           // Predicate
             .map(strToLength)         // Function
             .forEach(System.out::println); // Consumer
        // In ra: 7 (Charlie)
    }
}
```

### Đáp án mẫu

> "Functional interface là interface có đúng một abstract method, và lambda expression chính là cách tạo instance của nó một cách ngắn gọn. Java cung cấp sẵn nhiều functional interface trong gói `java.util.function` như `Predicate`, `Function`, `Consumer`, `Supplier`. Lambda thay thế hoàn toàn anonymous class, giúp code gọn hơn nhiều. Khi gặp yêu cầu truyền hành vi như tham số, tôi thường dùng các functional interface này kết hợp lambda."

---

## Câu 3: Method reference trong Java là gì? Khác lambda thế nào? `[Intermediate]`

### Câu hỏi

> *"Method reference trong Java là gì? Khi nào nên dùng method reference thay vì lambda?"*

### Giải thích lý thuyết

**Method reference** (tham chiếu phương thức) là cú pháp rút gọn hơn nữa của lambda, dùng khi lambda chỉ đơn giản là **gọi một method đã có sẵn**. Cú pháp: `ClassName::methodName` hoặc `object::methodName`.

Có 4 loại method reference:

| Loại | Cú pháp | Tương đương lambda |
|---|---|---|
| Static method | `ClassName::staticMethod` | `x -> ClassName.staticMethod(x)` |
| Instance method của object cụ thể | `instance::method` | `x -> instance.method(x)` |
| Instance method của kiểu bất kỳ | `ClassName::instanceMethod` | `x -> x.instanceMethod()` |
| Constructor | `ClassName::new` | `x -> new ClassName(x)` |

**Khi nào dùng method reference thay lambda?**
- Khi lambda chỉ gọi duy nhất một method mà không thêm logic.
- Method reference ngắn hơn và rõ ý định hơn.
- Nếu cần thêm logic (điều kiện, biến đổi trước khi gọi) thì dùng lambda.

### Code minh hoạu

```java
import java.util.*;
import java.util.stream.*;
import java.util.function.*;

public class MethodReferenceDemo {

    static String toUpperCase(String s) {
        return s.toUpperCase(); // static method
    }

    public static void main(String[] args) {
        List<String> names = Arrays.asList("alice", "bob", "charlie");

        // 1. Static method reference
        // Lambda:           s -> MethodReferenceDemo.toUpperCase(s)
        // Method reference: MethodReferenceDemo::toUpperCase
        names.stream()
             .map(MethodReferenceDemo::toUpperCase)
             .forEach(System.out::println); // Consumer dùng instance method reference

        // 2. Instance method reference của object cụ thể
        String prefix = "Hello, ";
        // Lambda:           s -> prefix.concat(s)
        // Method reference: prefix::concat
        names.stream()
             .map(prefix::concat)
             .forEach(System.out::println);

        // 3. Instance method reference của kiểu bất kỳ
        // Lambda:           s -> s.length()
        // Method reference: String::length
        names.stream()
             .map(String::length)
             .forEach(System.out::println);

        // 4. Constructor reference
        // Lambda:           s -> new StringBuilder(s)
        // Method reference: StringBuilder::new
        List<StringBuilder> builders = names.stream()
             .map(StringBuilder::new)
             .collect(Collectors.toList());

        System.out.println(builders.get(0)); // alice
    }
}
```

### Đáp án mẫu

> "Method reference là cú pháp rút gọn của lambda khi lambda chỉ đơn giản gọi một method đã tồn tại. Có 4 loại: static method, instance method của object cụ thể, instance method của kiểu bất kỳ, và constructor reference. Tôi ưu tiên dùng method reference khi có thể vì code ngắn hơn và thể hiện ý định rõ ràng hơn, còn lambda khi cần thêm logic xử lý."

---

## Câu 4: Optional class trong Java dùng để làm gì? `[Intermediate]`

### Câu hỏi

> *"Optional trong Java là gì? Tại sao nên dùng nó thay vì trả về null?"*

### Giải thích lý thuyết

**`Optional<T>`** là một container object có thể chứa hoặc không chứa giá trị, giới thiệu trong Java 8 để giải quyết vấn đề **NullPointerException** (NPE) — lỗi phổ biến nhất trong Java.

**Tại sao `null` nguy hiểm?**
- `null` không có ngữ nghĩa — không biết liệu đây là giá trị không tồn tại, lỗi, hay chưa khởi tạo.
- Gọi method trên `null` luôn ném `NullPointerException`.
- Buộc phải kiểm tra `if (value != null)` ở mọi nơi, dễ bỏ sót.

**Nguyên tắc dùng `Optional` đúng cách:**
- Chỉ dùng làm **kiểu trả về** của method, không làm tham số hoặc field.
- Không dùng `Optional.get()` trực tiếp mà không kiểm tra — sẽ ném `NoSuchElementException`.
- Ưu tiên `orElse`, `orElseGet`, `ifPresent`, `map`, `flatMap`.

### Code minh hoạ

```java
import java.util.Optional;
import java.util.List;
import java.util.Arrays;

public class OptionalDemo {

    // Tìm người dùng theo ID — trả về Optional thay vì null
    public static Optional<String> findUserById(int id) {
        List<String> users = Arrays.asList("Alice", "Bob", "Charlie");
        if (id >= 0 && id < users.size()) {
            return Optional.of(users.get(id)); // Có giá trị
        }
        return Optional.empty(); // Không tìm thấy
    }

    public static void main(String[] args) {
        // Cách KHÔNG nên: dùng get() trực tiếp
        // Optional<String> user = findUserById(99);
        // String name = user.get(); // Ném NoSuchElementException!

        // orElse: giá trị mặc định nếu không tìm thấy
        String name1 = findUserById(0).orElse("Người dùng không xác định");
        System.out.println(name1); // Alice

        String name2 = findUserById(99).orElse("Người dùng không xác định");
        System.out.println(name2); // Người dùng không xác định

        // orElseGet: dùng Supplier khi giá trị mặc định tốn kém để tạo
        String name3 = findUserById(99).orElseGet(() -> "Khách vãng lai");
        System.out.println(name3); // Khách vãng lai

        // map: biến đổi giá trị nếu có
        Optional<Integer> nameLength = findUserById(1).map(String::length);
        System.out.println(nameLength.orElse(0)); // 3 (Bob)

        // ifPresent: thực hiện hành động nếu có giá trị
        findUserById(2).ifPresent(u -> System.out.println("Tìm thấy: " + u));

        // orElseThrow: ném exception tùy chỉnh khi không có giá trị
        try {
            String name4 = findUserById(99)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        } catch (RuntimeException e) {
            System.out.println(e.getMessage());
        }
    }
}
```

### Đáp án mẫu

> "Optional là container bọc một giá trị có thể có hoặc không, giúp buộc caller phải xử lý trường hợp không có giá trị thay vì bị NPE bất ngờ. Tôi dùng Optional làm kiểu trả về của method, tránh trả về null trực tiếp. Trong thực tế tôi hay dùng `orElseGet` thay `orElse` khi giá trị mặc định tốn kém tính toán, và `map` để chain xử lý mà không cần null check."

---

## Câu 5: Generics và type erasure trong Java là gì? `[Advanced]`

### Câu hỏi

> *"Type erasure trong Java là gì? Tại sao nó lại gây ra một số hạn chế khi dùng generics?"*

### Giải thích lý thuyết

**Generics** (kiểu tổng quát) cho phép định nghĩa class, interface, và method với **type parameter** (tham số kiểu), giúp tái sử dụng code an toàn kiểu tại compile time.

**Type erasure** (xóa kiểu) là cơ chế JVM thực thi: **thông tin kiểu generic bị xóa hoàn toàn sau khi biên dịch**. Tại runtime, `List<String>` và `List<Integer>` đều chỉ là `List`.

**Tại sao Java làm vậy?** — Để tương thích ngược với code Java cũ (pre-Java 5) không có generics.

**Hậu quả của type erasure:**
- Không thể tạo instance của type parameter: `new T()` — lỗi compile.
- Không thể kiểm tra `instanceof` với type parameter: `obj instanceof List<String>` — lỗi compile.
- Không thể tạo mảng generic: `new T[10]` — không được phép.
- Overloading bằng generic type khác nhau nhưng cùng raw type sẽ xung đột.

**Bounded type parameter** (tham số kiểu có giới hạn):
- `<T extends Comparable<T>>` — T phải là subtype của `Comparable<T>`.
- `<? extends Number>` — wildcard trên (upper bounded): cho phép đọc.
- `<? super Integer>` — wildcard dưới (lower bounded): cho phép ghi.

### Code minh hoạ

```java
import java.util.*;

// Generic class với bounded type parameter
public class GenericDemo {

    // Generic method: tìm phần tử lớn nhất
    // T extends Comparable<T> đảm bảo T có thể so sánh được
    public static <T extends Comparable<T>> T findMax(List<T> list) {
        if (list.isEmpty()) throw new IllegalArgumentException("Danh sách rỗng");
        T max = list.get(0);
        for (T item : list) {
            if (item.compareTo(max) > 0) {
                max = item;
            }
        }
        return max;
    }

    // Wildcard: copy từ source sang dest
    // "? extends T" cho phép đọc từ source
    // "? super T" cho phép ghi vào dest
    public static <T> void copy(List<? extends T> source, List<? super T> dest) {
        for (T item : source) {
            dest.add(item);
        }
    }

    public static void main(String[] args) {
        // Type erasure: tại compile time khác nhau, tại runtime giống nhau
        List<String> strings = new ArrayList<>();
        List<Integer> ints = new ArrayList<>();

        // Tại runtime, cả hai đều là ArrayList (raw type)
        System.out.println(strings.getClass() == ints.getClass()); // true!

        // Generic method hoạt động với nhiều kiểu
        List<Integer> numbers = Arrays.asList(3, 1, 4, 1, 5, 9, 2, 6);
        System.out.println(findMax(numbers)); // 9

        List<String> words = Arrays.asList("banana", "apple", "cherry");
        System.out.println(findMax(words)); // cherry

        // Wildcard ví dụ
        List<Integer> src = Arrays.asList(1, 2, 3);
        List<Number> dst = new ArrayList<>();
        copy(src, dst); // Integer extends Number — hợp lệ
        System.out.println(dst); // [1, 2, 3]

        // instanceof với raw type — hợp lệ
        Object obj = new ArrayList<String>();
        System.out.println(obj instanceof List); // true

        // instanceof với parameterized type — KHÔNG được phép (bị type erasure)
        // System.out.println(obj instanceof List<String>); // Lỗi compile!
    }
}
```

### Đáp án mẫu

> "Generics cho phép viết code tái sử dụng an toàn kiểu. Type erasure là cơ chế JVM xóa thông tin type parameter sau khi biên dịch để tương thích ngược — tại runtime không còn phân biệt `List<String>` và `List<Integer>`. Điều này gây ra hạn chế: không thể tạo instance của T, không kiểm tra instanceof với parameterized type, không tạo generic array. Khi làm việc với wildcard tôi nhớ nguyên tắc PECS: Producer Extends, Consumer Super."

---

## Câu 6: Diamond problem trong Java và cách Java xử lý? `[Advanced]`

### Câu hỏi

> *"Diamond problem là gì? Java giải quyết vấn đề này như thế nào với default methods?"*

### Giải thích lý thuyết

**Diamond problem** (vấn đề kim cương) xảy ra trong **đa kế thừa** (multiple inheritance): khi một class kế thừa từ hai class/interface có cùng method, trình biên dịch không biết nên dùng phiên bản nào.

**Java truyền thống** tránh vấn đề này bằng cách **chỉ cho phép đơn kế thừa class** — một class chỉ `extends` một class duy nhất. Interface không có implementation nên không gây xung đột.

**Java 8 thêm default methods** — interface giờ có thể có implementation. Điều này tái sinh diamond problem ở mức interface!

**Quy tắc Java giải quyết xung đột default methods (theo thứ tự ưu tiên):**
1. **Class thắng** — implementation trong class (hoặc superclass) luôn thắng interface default method.
2. **Interface cụ thể hơn thắng** — nếu interface B extends interface A, thì B's default method thắng A's.
3. **Phải override tường minh** — nếu hai interface ngang hàng có cùng default method, class implement phải tự override để giải quyết xung đột, và dùng `InterfaceName.super.method()` để chỉ rõ gọi phiên bản nào.

### Code minh hoạ

```java
public class DiamondProblemDemo {

    interface A {
        default String greet() {
            return "Xin chào từ A";
        }
    }

    interface B extends A {
        @Override
        default String greet() {
            return "Xin chào từ B"; // B cụ thể hơn A — sẽ thắng
        }
    }

    interface C extends A {
        @Override
        default String greet() {
            return "Xin chào từ C"; // C cũng cụ thể hơn A — xung đột với B!
        }
    }

    // Class implement cả B và C — phải override để giải quyết xung đột
    static class D implements B, C {
        @Override
        public String greet() {
            // Dùng InterfaceName.super.method() để chọn rõ ràng
            return B.super.greet() + " và " + C.super.greet();
        }
    }

    // Class thắng interface (quy tắc 1)
    static class Base {
        public String greet() {
            return "Xin chào từ Base class";
        }
    }

    static class Child extends Base implements B {
        // Không cần override — Base.greet() thắng B.greet()
    }

    public static void main(String[] args) {
        // B cụ thể hơn A — B thắng (quy tắc 2)
        B b = new B() {};
        System.out.println(b.greet()); // Xin chào từ B

        // D phải giải quyết xung đột tường minh (quy tắc 3)
        D d = new D();
        System.out.println(d.greet()); // Xin chào từ B và Xin chào từ C

        // Class thắng interface (quy tắc 1)
        Child child = new Child();
        System.out.println(child.greet()); // Xin chào từ Base class
    }
}
```

### Đáp án mẫu

> "Diamond problem xảy ra khi đa kế thừa dẫn đến method ambiguity. Java truyền thống tránh bằng đơn kế thừa class. Từ Java 8, default methods trong interface tái sinh vấn đề này. Java giải quyết theo 3 quy tắc ưu tiên: class implementation thắng interface, interface cụ thể hơn thắng interface tổng quát hơn, và khi vẫn còn xung đột thì class phải override tường minh và dùng `InterfaceName.super.method()` để chỉ định."

---

## Câu 7: Java 8 interface default methods và static methods? `[Intermediate]`

### Câu hỏi

> *"Default methods và static methods trong interface Java 8 là gì? Tại sao Java lại thêm tính năng này?"*

### Giải thích lý thuyết

Trước Java 8, interface chỉ có thể chứa **abstract methods** và constants. Java 8 thêm:

**Default methods:**
- Method có implementation trong interface, đánh dấu bằng từ khóa `default`.
- Class implement interface **không bắt buộc phải override**.
- Giải quyết bài toán **API evolution** (phát triển API): thêm method mới vào interface mà không phá vỡ các class đã implement.
- Ví dụ điển hình: `Collection.forEach()`, `List.sort()`, `Map.getOrDefault()`.

**Static methods:**
- Method tĩnh thuộc về interface, gọi qua `InterfaceName.staticMethod()`.
- Không thể gọi qua instance hay kế thừa.
- Dùng để cung cấp **utility/factory methods** liên quan đến interface.

**So sánh với abstract class:**

| Tiêu chí | Interface (Java 8+) | Abstract Class |
|---|---|---|
| Kế thừa | Nhiều interface | Một abstract class |
| State (field) | Chỉ constants | Có instance field |
| Constructor | Không có | Có constructor |
| Default method | Có | Có (normal method) |
| Static method | Có | Có |

### Code minh hoạu

```java
import java.util.*;

// Interface với default và static methods
interface Validator<T> {

    // Abstract method — bắt buộc implement
    boolean validate(T value);

    // Default method — không cần override nhưng có thể
    default boolean validateAndLog(T value) {
        boolean result = validate(value);
        System.out.println("Kiểm tra " + value + ": " + (result ? "Hợp lệ" : "Không hợp lệ"));
        return result;
    }

    // Default method: kết hợp nhiều validator (chain)
    default Validator<T> and(Validator<T> other) {
        return value -> this.validate(value) && other.validate(value);
    }

    // Static factory method
    static <T> Validator<T> notNull() {
        return value -> value != null;
    }
}

public class InterfaceDefaultStaticDemo {

    public static void main(String[] args) {
        // Validator kiểm tra chuỗi không rỗng
        Validator<String> notEmpty = s -> !s.isEmpty();

        // Validator kiểm tra độ dài
        Validator<String> minLength = s -> s.length() >= 3;

        // Kết hợp hai validator bằng default method 'and'
        Validator<String> combined = notEmpty.and(minLength);

        // Dùng default method validateAndLog
        combined.validateAndLog("AB");      // Không hợp lệ (ít hơn 3 ký tự)
        combined.validateAndLog("ABC");     // Hợp lệ
        combined.validateAndLog("Hello");   // Hợp lệ

        // Dùng static factory method
        Validator<String> nullCheck = Validator.notNull();
        nullCheck.validateAndLog(null);     // Không hợp lệ
        nullCheck.validateAndLog("test");   // Hợp lệ

        // Ví dụ thực tế: List.sort() là default method của List
        List<String> names = new ArrayList<>(Arrays.asList("Charlie", "Alice", "Bob"));
        names.sort(Comparator.naturalOrder()); // sort() là default method
        System.out.println(names); // [Alice, Bob, Charlie]
    }
}
```

### Đáp án mẫu

> "Default methods cho phép interface có implementation để mở rộng API mà không phá vỡ code cũ — đây là lý do chính Java thêm tính năng này để nâng cấp Collection API trong Java 8 mà không bắt buộc mọi implementation phải sửa đổi. Static methods cung cấp utility method đi kèm interface. Khác với abstract class, interface vẫn hỗ trợ đa kế thừa nhưng không có instance state."

---

## Câu 8: Records trong Java là gì? Khi nào nên dùng Record thay vì class thông thường? `[Intermediate]`

### Câu hỏi

> *"Record trong Java là gì? Khi nào nên dùng Record thay vì tạo một class thông thường?"*

### Giải thích lý thuyết

**Record** (giới thiệu chính thức từ Java 16) là loại class đặc biệt được thiết kế cho **data carrier** (lớp mang dữ liệu thuần túy) — tương tự như `data class` trong Kotlin hay `struct` trong Swift.

**Java tự động tạo** cho mỗi Record:
- Constructor với tất cả fields (canonical constructor).
- Accessor methods (getter) cho từng field — tên trùng với tên field, không có prefix `get`.
- `equals()` và `hashCode()` dựa trên tất cả fields.
- `toString()` chuẩn.

**Đặc điểm của Record:**
- Fields là `private final` — **bất biến (immutable)** sau khi tạo.
- Không có setter.
- Có thể thêm custom method, implement interface, có static fields.
- Không thể `extends` class khác (Record ngầm extends `java.lang.Record`).
- Không thể bị extend (implicitly final).

**Khi nào dùng Record:**
- DTO (Data Transfer Object) — truyền dữ liệu giữa các layer.
- Value object — đối tượng định danh bởi giá trị, không phải identity.
- Tuple tạm thời — giữ nhóm giá trị liên quan.

**Khi nào KHÔNG dùng Record:**
- Khi cần kế thừa.
- Khi object cần thay đổi state (mutable).
- Khi cần ORM mapping (JPA entity thường dùng class thường).

### Code minh hoạ

```java
// Record đơn giản — Java tự sinh constructor, getter, equals, hashCode, toString
public record Point(double x, double y) {

    // Compact canonical constructor — validate input
    public Point {
        if (Double.isNaN(x) || Double.isNaN(y)) {
            throw new IllegalArgumentException("Tọa độ không được là NaN");
        }
    }

    // Custom method — hoàn toàn hợp lệ
    public double distanceTo(Point other) {
        double dx = this.x - other.x;
        double dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Static factory method
    public static Point origin() {
        return new Point(0, 0);
    }
}

// Record làm DTO
public record UserDto(int id, String name, String email) {}

// So sánh với class thông thường phải viết boilerplate
class PointClass {
    private final double x;
    private final double y;

    public PointClass(double x, double y) { this.x = x; this.y = y; }
    public double x() { return x; }
    public double y() { return y; }

    @Override public boolean equals(Object o) { /* nhiều dòng... */ return false; }
    @Override public int hashCode() { return java.util.Objects.hash(x, y); }
    @Override public String toString() { return "PointClass[x=" + x + ", y=" + y + "]"; }
}

class RecordDemo {
    public static void main(String[] args) {
        Point p1 = new Point(3.0, 4.0);
        Point p2 = new Point(0.0, 0.0);

        System.out.println(p1);             // Point[x=3.0, y=4.0]
        System.out.println(p1.x());         // 3.0 — accessor, không phải getX()
        System.out.println(p1.distanceTo(p2)); // 5.0

        Point p3 = new Point(3.0, 4.0);
        System.out.println(p1.equals(p3));  // true — so sánh theo giá trị

        UserDto user = new UserDto(1, "Alice", "alice@example.com");
        System.out.println(user); // UserDto[id=1, name=Alice, email=alice@example.com]
    }
}
```

### Đáp án mẫu

> "Record là loại class bất biến Java tự động sinh boilerplate — constructor, accessor, equals, hashCode, toString. Tôi dùng Record cho DTO, value object, và response/request model vì giảm đáng kể code thừa và đảm bảo immutability. Không dùng Record khi cần kế thừa class, cần mutable state, hoặc khi làm JPA entity vì Hibernate cần setter và no-arg constructor."

---

## Câu 9: Sealed Classes là gì và tại sao dùng kết hợp với Pattern Matching? `[Advanced]`

### Câu hỏi

> *"Sealed Classes trong Java là gì? Tại sao chúng lại kết hợp tốt với Pattern Matching?"*

### Giải thích lý thuyết

**Sealed Classes** (giới thiệu chính thức từ Java 17) là class hoặc interface **hạn chế tập con class được phép kế thừa**. Từ khóa `sealed` kết hợp với `permits` để liệt kê các subclass được phép.

**Mục đích:** Tạo **closed type hierarchy** (phân cấp kiểu đóng) — biết trước tất cả subtype có thể tồn tại tại compile time.

**Các subclass của sealed class phải chọn một trong ba:**
- `final` — không thể bị extend tiếp.
- `sealed` — tiếp tục hạn chế subclass của nó.
- `non-sealed` — mở ra cho bất kỳ class nào extend.

**Tại sao kết hợp tốt với Pattern Matching?**
- Pattern matching `switch` (Java 21) có thể kiểm tra **exhaustiveness** (toàn diện): khi switch trên sealed type, compiler biết đủ các case phải cover, tương tự `when` trong Kotlin hay `match` trong Rust.
- Nếu thêm subclass mới vào sealed hierarchy mà không cập nhật switch, compiler báo lỗi ngay — giúp phát hiện bug tại compile time.

### Code minh hoạu

```java
// Sealed interface — chỉ cho phép 3 implement cụ thể
public sealed interface Shape permits Circle, Rectangle, Triangle {
    double area();
}

// final: không thể extend tiếp
public record Circle(double radius) implements Shape {
    @Override
    public double area() {
        return Math.PI * radius * radius;
    }
}

public record Rectangle(double width, double height) implements Shape {
    @Override
    public double area() {
        return width * height;
    }
}

public record Triangle(double base, double height) implements Shape {
    @Override
    public double area() {
        return 0.5 * base * height;
    }
}

public class SealedClassDemo {

    // Pattern matching with switch — exhaustive, không cần default!
    public static String describeShape(Shape shape) {
        return switch (shape) {
            case Circle c    -> String.format("Hình tròn bán kính %.1f, diện tích %.2f", c.radius(), c.area());
            case Rectangle r -> String.format("Hình chữ nhật %.1f x %.1f, diện tích %.2f", r.width(), r.height(), r.area());
            case Triangle t  -> String.format("Tam giác đáy %.1f cao %.1f, diện tích %.2f", t.base(), t.height(), t.area());
            // Không cần 'default' — compiler biết đã cover hết sealed hierarchy
        };
    }

    public static void main(String[] args) {
        Shape[] shapes = {
            new Circle(5),
            new Rectangle(4, 6),
            new Triangle(3, 8)
        };

        for (Shape s : shapes) {
            System.out.println(describeShape(s));
        }
        // Hình tròn bán kính 5.0, diện tích 78.54
        // Hình chữ nhật 4.0 x 6.0, diện tích 24.00
        // Tam giác đáy 3.0 cao 8.0, diện tích 12.00
    }
}
```

### Đáp án mẫu

> "Sealed Classes định nghĩa tập hợp subclass được phép kế thừa, tạo closed type hierarchy. Kết hợp với pattern matching switch, compiler có thể kiểm tra exhaustiveness — đảm bảo tất cả subtype đều được xử lý mà không cần `default` case. Lợi ích lớn nhất là khi thêm subclass mới vào sealed hierarchy, mọi switch chưa cập nhật sẽ báo lỗi compile, tránh runtime bug. Tôi dùng sealed class khi muốn mô hình hóa tập hợp trạng thái cố định như kết quả API, trạng thái UI, hoặc command."

---

## Câu 10: Pattern matching for switch (Java 21) thay đổi cách viết switch như thế nào? `[Advanced]`

### Câu hỏi

> *"Pattern matching for switch trong Java 21 có gì mới so với switch truyền thống? Anh/chị có thể cho ví dụ thực tế?"*

### Giải thích lý thuyết

Java 21 chính thức ra mắt **Pattern Matching for switch** (sau nhiều phiên bản preview), nâng switch từ một cấu trúc kiểm tra **giá trị** đơn giản thành cơ chế **phân tích kiểu và cấu trúc** mạnh mẽ.

**Các tính năng mới:**

| Tính năng | Mô tả |
|---|---|
| Type pattern | `case Integer i ->` — match theo kiểu và bind vào biến |
| Guarded pattern | `case Integer i when i > 0 ->` — thêm điều kiện |
| Null case | `case null ->` — xử lý null tường minh trong switch |
| Exhaustiveness | Compiler kiểm tra đủ case khi switch trên sealed type |
| Arrow syntax | `->` không fall-through, ngắn gọn hơn `break` |

**So sánh với cách cũ:**

Trước Java 21: phải dùng chuỗi `instanceof` check, ép kiểu thủ công, dễ bỏ sót case.

Java 21: switch xử lý mọi kiểu, bind biến tự động, compiler kiểm tra toàn diện.

**Guarded pattern** với từ khóa `when` cho phép thêm điều kiện tùy chỉnh sau type pattern.

### Code minh hoạu

```java
// Sealed hierarchy cho ví dụ thực tế
sealed interface ApiResponse<T> permits ApiResponse.Success, ApiResponse.Error, ApiResponse.Loading {
    record Success<T>(T data, int statusCode) implements ApiResponse<T> {}
    record Error(String message, int errorCode) implements ApiResponse<Object> {}
    record Loading() implements ApiResponse<Object> {}
}

public class PatternMatchingSwitchDemo {

    // Cách CŨ (trước Java 21) — verbose và dễ lỗi
    public static String handleOldWay(Object obj) {
        if (obj instanceof Integer i) {
            if (i > 0) return "Số dương: " + i;
            else return "Số không dương: " + i;
        } else if (obj instanceof String s) {
            return "Chuỗi: " + s;
        } else if (obj == null) {
            return "Null";
        } else {
            return "Kiểu khác";
        }
    }

    // Cách MỚI (Java 21) — ngắn gọn, an toàn kiểu
    public static String handleNewWay(Object obj) {
        return switch (obj) {
            case null             -> "Null được xử lý tường minh";
            case Integer i when i > 0 -> "Số dương: " + i;  // guarded pattern
            case Integer i        -> "Số không dương: " + i;
            case String s when s.isEmpty() -> "Chuỗi rỗng";
            case String s         -> "Chuỗi: " + s;
            case Double d         -> String.format("Số thực: %.2f", d);
            default               -> "Kiểu không xác định: " + obj.getClass().getSimpleName();
        };
    }

    // Ví dụ thực tế: xử lý API response với sealed class
    public static <T> String processResponse(ApiResponse<T> response) {
        return switch (response) {
            // Guarded pattern: phân biệt thành công theo status code
            case ApiResponse.Success<T> s when s.statusCode() == 200 -> "OK: " + s.data();
            case ApiResponse.Success<T> s when s.statusCode() == 201 -> "Tạo mới thành công: " + s.data();
            case ApiResponse.Success<T> s -> "Thành công khác (" + s.statusCode() + "): " + s.data();

            // Guarded pattern: phân biệt lỗi theo error code
            case ApiResponse.Error e when e.errorCode() == 404 -> "Không tìm thấy: " + e.message();
            case ApiResponse.Error e when e.errorCode() >= 500 -> "Lỗi server: " + e.message();
            case ApiResponse.Error e -> "Lỗi client: " + e.message();

            case ApiResponse.Loading l -> "Đang tải...";
            // Không cần default — sealed class đã cover hết
        };
    }

    public static void main(String[] args) {
        // Test handleNewWay
        System.out.println(handleNewWay(42));       // Số dương: 42
        System.out.println(handleNewWay(-5));       // Số không dương: -5
        System.out.println(handleNewWay("Java"));   // Chuỗi: Java
        System.out.println(handleNewWay(""));       // Chuỗi rỗng
        System.out.println(handleNewWay(null));     // Null được xử lý tường minh
        System.out.println(handleNewWay(3.14));     // Số thực: 3.14

        // Test processResponse
        ApiResponse<String> ok = new ApiResponse.Success<>("Hello", 200);
        ApiResponse<Object> notFound = new ApiResponse.Error("Trang không tồn tại", 404);
        ApiResponse<Object> loading = new ApiResponse.Loading();

        System.out.println(processResponse(ok));       // OK: Hello
        System.out.println(processResponse(notFound)); // Không tìm thấy: Trang không tồn tại
        System.out.println(processResponse(loading));  // Đang tải...
    }
}
```

### Đáp án mẫu

> "Pattern matching for switch Java 21 biến switch từ kiểm tra giá trị đơn thuần thành công cụ phân tích kiểu và cấu trúc mạnh mẽ. Ba điểm tôi thấy có giá trị nhất: type pattern binding giúp tránh ép kiểu thủ công, guarded pattern với `when` cho phép điều kiện phức tạp trong từng case, và khi kết hợp với sealed class thì compiler kiểm tra exhaustiveness — không thể bỏ sót case. Nó thay thế hoàn toàn chuỗi `instanceof` if-else lồng nhau và giúp code dễ đọc, dễ bảo trì hơn rất nhiều."

---
