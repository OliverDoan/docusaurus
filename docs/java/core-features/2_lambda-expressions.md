---
sidebar_position: 2
title: "2. Lambda Expressions"
---

# Lambda Expressions -- Biểu thức Lambda

Lambda là một trong những tính năng "thay đổi cuộc chơi" của Java 8. Nó giúp code **ngắn gọn**, **dễ đọc**, và mở đường cho phong cách **lập trình hàm (functional programming)** trong Java.

**Tương tự đơn giản:** Trước Java 8, để truyền một "hành động" vào hàm khác, bạn phải tạo cả một class (anonymous class). Với Lambda, bạn chỉ cần viết một dòng mô tả "hành động" đó -- giống như viết tin nhắn ngắn thay vì gửi cả một lá thư.

---

## Mục lục

- [1. Lambda là gì?](#1-lambda-là-gì)
- [2. Cú pháp Lambda](#2-cú-pháp-lambda)
- [3. Functional Interface](#3-functional-interface)
- [4. So sánh với Anonymous Class](#4-so-sánh-với-anonymous-class)
- [5. Method Reference](#5-method-reference)
- [6. Variable Capture](#6-variable-capture)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Lambda là gì?

**Lambda Expression** là một **hàm ẩn danh** (không có tên) -- nó nhận tham số, thực hiện hành động, và có thể trả về kết quả. Lambda được dùng chủ yếu để **truyền hành vi như tham số**.

```java
// Truoc Java 8: dung Anonymous Class
Runnable task = new Runnable() {
    @Override
    public void run() {
        System.out.println("Chao ban!");
    }
};

// Java 8 voi Lambda
Runnable task = () -> System.out.println("Chao ban!");
```

Chỉ 1 dòng so với 6 dòng -- ý nghĩa rõ ràng hơn nhiều.

---

## 2. Cú pháp Lambda

```
(tham_so) -> { than_ham }
```

### Các dạng cú pháp

```java
// 1. Khong tham so
() -> System.out.println("Hello");

// 2. Mot tham so (co the bo dau ngoac)
x -> x * 2
(x) -> x * 2

// 3. Nhieu tham so
(x, y) -> x + y

// 4. Co the khai bao kieu
(int x, int y) -> x + y

// 5. Than ham nhieu dong
(x, y) -> {
    int sum = x + y;
    return sum;
}
```

### Ví dụ thực tế

```java
import java.util.*;

public class LambdaDemo {
    public static void main(String[] args) {
        List<String> names = Arrays.asList("Nam", "An", "Binh");

        // Sap xep voi Lambda
        names.sort((a, b) -> a.compareTo(b));

        // Lap voi Lambda
        names.forEach(name -> System.out.println(name));
    }
}
```

---

## 3. Functional Interface

**Functional Interface** là interface chỉ có **một phương thức abstract** (Single Abstract Method - SAM). Đây là "khuôn mẫu" để Lambda hoạt động.

```java
@FunctionalInterface
interface Calculator {
    int calculate(int a, int b);
}

public class Demo {
    public static void main(String[] args) {
        Calculator cong = (a, b) -> a + b;
        Calculator tru = (a, b) -> a - b;

        System.out.println(cong.calculate(5, 3)); // 8
        System.out.println(tru.calculate(5, 3));  // 2
    }
}
```

**Giải thích:** Annotation `@FunctionalInterface` (tùy chọn) giúp compiler kiểm tra interface có đúng 1 abstract method.

### Các Functional Interface có sẵn (trong `java.util.function`)

| Interface              | Tham số -> Trả về | Ví dụ                                |
| ---------------------- | ----------------- | ------------------------------------ |
| `Function<T, R>`       | T -> R            | `Function<Integer, String> f = x -> "So: " + x` |
| `Consumer<T>`          | T -> void         | `Consumer<String> c = s -> System.out.println(s)` |
| `Supplier<T>`          | () -> T           | `Supplier<Double> s = () -> Math.random()` |
| `Predicate<T>`         | T -> boolean      | `Predicate<Integer> p = x -> x > 0`  |
| `BiFunction<T, U, R>`  | T, U -> R         | `BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b` |
| `UnaryOperator<T>`     | T -> T            | `UnaryOperator<Integer> square = x -> x * x` |
| `BinaryOperator<T>`    | T, T -> T         | `BinaryOperator<Integer> max = (a, b) -> a > b ? a : b` |

---

## 4. So sánh với Anonymous Class

```java
// Anonymous Class -- dai dong
Comparator<String> c1 = new Comparator<String>() {
    @Override
    public int compare(String a, String b) {
        return a.length() - b.length();
    }
};

// Lambda -- ngan gon
Comparator<String> c2 = (a, b) -> a.length() - b.length();
```

| Tiêu chí       | Anonymous Class       | Lambda                |
| -------------- | --------------------- | --------------------- |
| Cú pháp        | Dài                   | Ngắn                  |
| `this`         | Tham chiếu inner class | Tham chiếu enclosing class |
| Khả năng       | Multi-method, có state | Chỉ 1 method          |
| Compile        | Tạo file `.class` riêng | Dùng `invokedynamic`  |

---

## 5. Method Reference

Khi Lambda chỉ gọi **một method có sẵn**, ta có thể dùng **method reference** (toán tử `::`) cho ngắn hơn.

```java
import java.util.*;

public class MethodRefDemo {
    public static void main(String[] args) {
        List<String> names = Arrays.asList("Nam", "An", "Binh");

        // Lambda
        names.forEach(name -> System.out.println(name));

        // Method Reference -- ngan hon
        names.forEach(System.out::println);
    }
}
```

### 4 loại Method Reference

```java
// 1. Tham chieu static method
Function<String, Integer> parser = Integer::parseInt;

// 2. Tham chieu instance method cua object cu the
String s = "hello";
Supplier<Integer> length = s::length;

// 3. Tham chieu instance method cua class
Function<String, Integer> len = String::length;

// 4. Tham chieu constructor
Supplier<ArrayList<String>> creator = ArrayList::new;
```

---

## 6. Variable Capture

Lambda có thể **truy cập biến** từ scope bên ngoài, nhưng các biến đó phải là **effectively final** (không thay đổi sau khi gán).

```java
public class CaptureDemo {
    public static void main(String[] args) {
        int factor = 2; // effectively final

        Function<Integer, Integer> multiply = x -> x * factor;
        System.out.println(multiply.apply(5)); // 10

        // factor = 3; // ERROR -- neu thay doi se khong compile
    }
}
```

**Giải thích thuật ngữ:**

- **Effectively final:** Biến không cần khai báo `final` nhưng không bao giờ bị gán lại
- **Closure:** Khái niệm chung -- hàm "đóng gói" cả môi trường xung quanh

---

## Khi nào dùng?

- **Dùng Lambda khi:**
  - Truyền hành vi đơn giản cho phương thức (callback, comparator, predicate)
  - Làm việc với Stream API (`map`, `filter`, `forEach`)
  - Code event handler trong UI
  - Triển khai chiến lược (Strategy pattern) nhẹ
- **Không nên dùng Lambda khi:**
  - Logic phức tạp (>5 dòng) -- nên tách thành method riêng
  - Cần state (dùng class)
  - Cần nhiều method -- không phải functional interface
- **Best practice:**
  - Tách lambda dài ra method riêng và dùng method reference
  - Đặt tên biến trong lambda **có ý nghĩa**, không dùng `x`, `y` nếu không rõ
  - Ưu tiên method reference khi có thể

---

## Lỗi thường gặp

### Lỗi 1: Lambda quá phức tạp

```java
// SAI -- kho doc
list.forEach(item -> {
    if (item.isActive()) {
        try {
            process(item);
            log(item);
        } catch (Exception e) {
            handle(e);
        }
    }
});

// DUNG -- tach method
list.forEach(this::processActive);

private void processActive(Item item) {
    if (!item.isActive()) return;
    try {
        process(item);
        log(item);
    } catch (Exception e) {
        handle(e);
    }
}
```

### Lỗi 2: Thay đổi biến capture

```java
// SAI -- compile error
int count = 0;
list.forEach(item -> count++); // ERROR

// DUNG -- dung AtomicInteger hoac Stream.count()
AtomicInteger count = new AtomicInteger(0);
list.forEach(item -> count.incrementAndGet());
```

### Lỗi 3: NPE trong Lambda

```java
// SAI -- neu names co null se NPE
names.forEach(n -> System.out.println(n.toUpperCase()));

// DUNG -- filter null truoc
names.stream()
     .filter(Objects::nonNull)
     .forEach(n -> System.out.println(n.toUpperCase()));
```

---

## Câu hỏi phỏng vấn

### Câu 1: Lambda là gì và tại sao Java 8 thêm vào?

**Trả lời:** Lambda là biểu thức hàm ẩn danh, được Java 8 giới thiệu để hỗ trợ **lập trình hàm**, đơn giản hóa code truyền hành vi (callback, listener), và là nền tảng cho **Stream API**. Trước Lambda, phải dùng anonymous class -- rất dài dòng.

### Câu 2: Functional Interface là gì?

**Trả lời:** Là interface chỉ có **một abstract method** (SAM - Single Abstract Method). Có thể có thêm default method, static method, và method từ `Object`. Annotation `@FunctionalInterface` (tùy chọn) giúp compiler kiểm tra. Lambda thực chất là implementation của Functional Interface.

### Câu 3: Sự khác biệt giữa Lambda và Anonymous Class?

**Trả lời:**

- **Cú pháp:** Lambda ngắn hơn nhiều
- **`this`:** Trong Lambda, `this` trỏ tới class chứa Lambda. Trong anonymous class, `this` trỏ tới chính anonymous class
- **Compile:** Lambda dùng `invokedynamic` (không tạo file `.class` riêng), anonymous class tạo file riêng
- **Khả năng:** Anonymous class có thể implement nhiều method và có state riêng

### Câu 4: Method Reference có gì khác Lambda?

**Trả lời:** Method Reference là **cú pháp tắt** cho Lambda khi Lambda chỉ làm một việc duy nhất là gọi một method có sẵn. Ví dụ `x -> System.out.println(x)` có thể viết là `System.out::println`. Có 4 loại: static, instance method của object, instance method của class, constructor.

### Câu 5: Tại sao biến capture phải là effectively final?

**Trả lời:** Vì Lambda có thể được thực thi **sau** scope gốc kết thúc (ví dụ trong callback, thread khác). Nếu biến thay đổi, có thể gây race condition và bug khó debug. Java yêu cầu **effectively final** để đảm bảo an toàn -- giá trị tại thời điểm Lambda được tạo ra sẽ giữ nguyên.
