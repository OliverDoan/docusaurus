---
sidebar_position: 1
title: "1. Higher-Order Functions (HOF)"
---

# Higher-Order Functions -- Hàm bậc cao

**Higher-Order Function (HOF)** là hàm **nhận hàm khác làm tham số** hoặc **trả về một hàm**. Đây là khái niệm cốt lõi của lập trình hàm, cho phép code linh hoạt, ngắn gọn và composable.

**Tương tự đơn giản:** Hãy tưởng tượng một **máy pha cà phê đa năng**. Bạn không chỉ đổ nguyên liệu vào, mà còn đưa **công thức** (recipe) -- máy sẽ làm theo công thức đó. Công thức chính là "hàm" được truyền vào "máy" (HOF).

---

## Mục lục

- [1. HOF là gì?](#1-hof-là-gì)
- [2. Hàm nhận hàm làm tham số](#2-hàm-nhận-hàm-làm-tham-số)
- [3. Hàm trả về hàm](#3-hàm-trả-về-hàm)
- [4. HOF với Collections](#4-hof-với-collections)
- [5. Currying và Partial Application](#5-currying-và-partial-application)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. HOF là gì?

Trong Java 8+, **hàm** được biểu diễn qua **Functional Interface** (`Function`, `Predicate`, `Consumer`, `Supplier`...). HOF là hàm thao tác với các "hàm" này.

```java
import java.util.function.*;

// 1. Nhan function lam tham so
public static <T, R> R apply(T input, Function<T, R> fn) {
    return fn.apply(input);
}

apply(5, x -> x * 2);           // 10
apply("hello", String::length); // 5

// 2. Tra ve function
public static Function<Integer, Integer> multiplier(int factor) {
    return x -> x * factor;
}

Function<Integer, Integer> double_ = multiplier(2);
Function<Integer, Integer> triple = multiplier(3);
double_.apply(5); // 10
triple.apply(5);  // 15
```

---

## 2. Hàm nhận hàm làm tham số

### Ví dụ: Retry với function

```java
public static <T> T retry(Supplier<T> action, int maxAttempts) {
    for (int i = 0; i < maxAttempts; i++) {
        try {
            return action.get();
        } catch (Exception e) {
            System.out.println("Thu lai lan " + (i + 1));
        }
    }
    throw new RuntimeException("Het luot");
}

String result = retry(() -> callApi(), 3);
```

### Ví dụ: Logging wrapper

```java
public static <T, R> Function<T, R> withLogging(Function<T, R> fn, String name) {
    return input -> {
        System.out.println(name + " input: " + input);
        R result = fn.apply(input);
        System.out.println(name + " output: " + result);
        return result;
    };
}

Function<Integer, Integer> square = x -> x * x;
Function<Integer, Integer> loggedSquare = withLogging(square, "square");
loggedSquare.apply(5);
// square input: 5
// square output: 25
```

### Ví dụ: Conditional execution

```java
public static <T> void runIf(T value, Predicate<T> condition, Consumer<T> action) {
    if (condition.test(value)) {
        action.accept(value);
    }
}

runIf(42, x -> x > 10, x -> System.out.println("Lon: " + x));
// Lon: 42
```

---

## 3. Hàm trả về hàm

### Ví dụ: Factory function

```java
public static Predicate<Integer> greaterThan(int threshold) {
    return x -> x > threshold;
}

Predicate<Integer> gt5 = greaterThan(5);
Predicate<Integer> gt10 = greaterThan(10);

gt5.test(7);  // true
gt10.test(7); // false
```

### Ví dụ: Validator builder

```java
public static <T> Function<T, Boolean> not(Function<T, Boolean> fn) {
    return input -> !fn.apply(input);
}

Function<String, Boolean> isEmpty = String::isEmpty;
Function<String, Boolean> isNotEmpty = not(isEmpty);

isNotEmpty.apply("hello"); // true
isNotEmpty.apply("");      // false
```

---

## 4. HOF với Collections

Stream API là tập hợp HOF:

```java
import java.util.*;
import java.util.stream.*;

List<Integer> nums = List.of(1, 2, 3, 4, 5);

// filter -- nhan Predicate
List<Integer> evens = nums.stream()
    .filter(x -> x % 2 == 0)
    .collect(Collectors.toList());

// map -- nhan Function
List<Integer> squares = nums.stream()
    .map(x -> x * x)
    .collect(Collectors.toList());

// reduce -- nhan BinaryOperator
int sum = nums.stream().reduce(0, Integer::sum);

// forEach -- nhan Consumer
nums.forEach(System.out::println);
```

### Custom HOF với Stream

```java
public static <T> List<T> takeWhile(List<T> list, Predicate<T> condition) {
    return list.stream()
        .takeWhile(condition)
        .collect(Collectors.toList());
}

takeWhile(List.of(1, 2, 3, 10, 4), x -> x < 5);
// [1, 2, 3]
```

---

## 5. Currying và Partial Application

### Currying

Biến function nhiều tham số thành chuỗi function 1 tham số.

```java
// Function 2 tham so
BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;

// Currying
Function<Integer, Function<Integer, Integer>> curriedAdd =
    a -> b -> a + b;

Function<Integer, Integer> add5 = curriedAdd.apply(5);
add5.apply(3); // 8
add5.apply(10); // 15
```

### Partial Application

Cố định một số tham số, trả về function ít tham số hơn.

```java
public static <A, B, R> Function<B, R> partial(BiFunction<A, B, R> fn, A a) {
    return b -> fn.apply(a, b);
}

BiFunction<Integer, Integer, Integer> multiply = (a, b) -> a * b;
Function<Integer, Integer> double_ = partial(multiply, 2);
double_.apply(5); // 10
```

---

## Khi nào dùng?

- **HOF nhận function khi:**
  - Code "khung" giống nhau, chỉ khác hành động (retry, logging, transaction)
  - Strategy pattern thay vì class implementation
  - Collection processing (filter, map, reduce)
- **HOF trả function khi:**
  - Factory tạo predicate/validator có tham số
  - Decorator (wrap function với behavior thêm)
  - Builder pattern functional
- **Best practice:**
  - Function ngắn -> dùng lambda; dài -> tách method và dùng method reference
  - Đặt tên rõ -- `withLogging`, `retryable`, `cachedBy`
  - Hạn chế deep nesting function -- khó debug
  - Dùng Functional Interface có sẵn (Function, Predicate...) trước khi tự tạo

---

## Lỗi thường gặp

### Lỗi 1: Side effect trong function "thuần"

```java
List<Integer> result = new ArrayList<>();

// SAI -- side effect, khong functional
nums.stream().map(x -> {
    result.add(x);  // side effect
    return x * 2;
}).forEach(System.out::println);

// DUNG -- collect
List<Integer> result = nums.stream()
    .map(x -> x * 2)
    .collect(Collectors.toList());
```

### Lỗi 2: Function quá phức tạp

```java
// SAI -- function 30 dong
Function<Order, Receipt> fn = order -> {
    // 30 dong logic
};

// DUNG -- tach method
Function<Order, Receipt> fn = this::processOrder;
```

### Lỗi 3: Trả về function nhưng capture mutable state

```java
// SAI
int counter = 0;
Supplier<Integer> next = () -> ++counter; // COMPILE ERROR

// DUNG -- dung AtomicInteger
AtomicInteger counter = new AtomicInteger(0);
Supplier<Integer> next = counter::incrementAndGet;
```

### Lỗi 4: Quên type inference

```java
// Java khong infer duoc -- error
var fn = x -> x * 2;

// DUNG
Function<Integer, Integer> fn = x -> x * 2;
```

---

## Câu hỏi phỏng vấn

### Câu 1: HOF là gì?

**Trả lời:** Hàm bậc cao là hàm:

1. **Nhận hàm khác làm tham số** (filter, map, retry, withLogging)
2. **Trả về một hàm** (factory predicate, partial application)

HOF cho phép trừu tượng hóa hành vi, code linh hoạt, composable.

### Câu 2: Trong Java, "hàm" được biểu diễn thế nào?

**Trả lời:** Qua **Functional Interface** -- interface có **1 abstract method**. Phổ biến: `Function<T,R>`, `Predicate<T>`, `Consumer<T>`, `Supplier<T>`, `BiFunction<T,U,R>`. Lambda và method reference đều implement functional interface.

### Câu 3: Currying là gì?

**Trả lời:** Biến hàm **nhiều tham số** thành chuỗi hàm **1 tham số**. Ví dụ `(a, b) -> a + b` thành `a -> b -> a + b`. Cho phép partial application và composition. Java hỗ trợ qua lambda nhưng cú pháp dài hơn Haskell/Scala.

### Câu 4: HOF lợi ích gì so với inheritance/strategy pattern?

**Trả lời:**

- **Ngắn gọn** -- lambda thay class
- **Composable** -- ghép nhiều function dễ
- **Đỡ boilerplate** -- không cần interface + class
- **Linh hoạt runtime** -- truyền function khác nhau dễ dàng

Tuy nhiên không thay thế hoàn toàn -- pattern phức tạp (state, multi-method) vẫn cần class.

### Câu 5: Khi nào không nên dùng HOF?

**Trả lời:**

- Function quá phức tạp (>10 dòng) -- khó đọc
- Cần state, lifecycle -- dùng class
- Performance critical -- lambda có overhead (boxing, megamorphic call)
- Team chưa quen FP -- code dễ đọc cho team quan trọng hơn
