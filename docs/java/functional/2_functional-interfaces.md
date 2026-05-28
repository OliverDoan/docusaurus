---
sidebar_position: 2
title: "2. Functional Interfaces"
---

# Functional Interfaces -- Interface chức năng

**Functional Interface** là interface có **đúng 1 abstract method** (Single Abstract Method - SAM). Đây là "khuôn mẫu" cho phép Java biểu diễn hàm dưới dạng object -- nền tảng cho Lambda và Stream API.

**Tương tự đơn giản:** Functional Interface giống **mẫu hợp đồng có một việc duy nhất**: "Tôi sẽ làm việc X". Bạn ký hợp đồng (implement) bằng cách ghi cách bạn làm việc đó (lambda).

---

## Mục lục

- [1. Functional Interface là gì?](#1-functional-interface-là-gì)
- [2. Functional Interfaces có sẵn](#2-functional-interfaces-có-sẵn)
- [3. Tự tạo Functional Interface](#3-tự-tạo-functional-interface)
- [4. Default và Static method](#4-default-và-static-method)
- [5. Primitive Functional Interfaces](#5-primitive-functional-interfaces)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Functional Interface là gì?

```java
@FunctionalInterface
public interface Calculator {
    int calc(int a, int b);
}

// Implement bang lambda
Calculator add = (a, b) -> a + b;
Calculator mul = (a, b) -> a * b;

add.calc(3, 4); // 7
mul.calc(3, 4); // 12
```

### Annotation `@FunctionalInterface`

- **Không bắt buộc** -- chỉ là hint
- Compiler check interface có đúng 1 abstract method
- Document rằng interface dùng cho lambda

```java
@FunctionalInterface
interface BadInterface {
    void a();
    void b(); // COMPILE ERROR -- co 2 abstract method
}
```

### Method kế thừa từ `Object` không tính

```java
@FunctionalInterface
interface MyComparator<T> {
    int compare(T a, T b);
    boolean equals(Object obj); // tu Object, khong tinh la abstract
}
```

---

## 2. Functional Interfaces có sẵn

Package `java.util.function` có 40+ interface. 6 cái phổ biến nhất:

| Interface             | Method            | Mô tả                              |
| --------------------- | ----------------- | ---------------------------------- |
| `Function<T, R>`      | `R apply(T t)`    | Biến đổi T thành R                 |
| `Consumer<T>`         | `void accept(T t)`| Nhận T, không trả                  |
| `Supplier<T>`         | `T get()`         | Không nhận, trả T                  |
| `Predicate<T>`        | `boolean test(T)` | Kiểm tra điều kiện                 |
| `BiFunction<T, U, R>` | `R apply(T, U)`   | Biến đổi (T, U) thành R            |
| `UnaryOperator<T>`    | `T apply(T)`      | `Function<T,T>`                    |

### Function

```java
Function<String, Integer> length = String::length;
length.apply("hello"); // 5

// Chain
Function<Integer, Integer> add1 = x -> x + 1;
Function<Integer, Integer> mul2 = x -> x * 2;
Function<Integer, Integer> combined = add1.andThen(mul2); // (x+1)*2
combined.apply(3); // 8

Function<Integer, Integer> composed = add1.compose(mul2); // (x*2)+1
composed.apply(3); // 7
```

### Consumer

```java
Consumer<String> printer = System.out::println;
printer.accept("hello");

// andThen
Consumer<String> printer2 = printer.andThen(s -> System.out.println("done"));
```

### Supplier

```java
Supplier<Double> random = Math::random;
Supplier<LocalDate> now = LocalDate::now;
Supplier<List<String>> empty = ArrayList::new;

random.get(); // 0.534...
```

### Predicate

```java
Predicate<Integer> isPositive = x -> x > 0;
Predicate<Integer> isEven = x -> x % 2 == 0;

Predicate<Integer> both = isPositive.and(isEven);
Predicate<Integer> either = isPositive.or(isEven);
Predicate<Integer> notEven = isEven.negate();

both.test(4);    // true
both.test(-4);   // false
```

### BiFunction

```java
BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;
BiFunction<String, Integer, String> repeat = (s, n) -> s.repeat(n);

add.apply(2, 3);         // 5
repeat.apply("ab", 3);   // ababab
```

### UnaryOperator vs BinaryOperator

```java
UnaryOperator<String> upper = String::toUpperCase;  // T -> T
BinaryOperator<Integer> sum = Integer::sum;          // (T, T) -> T
```

---

## 3. Tự tạo Functional Interface

```java
@FunctionalInterface
public interface TriFunction<A, B, C, R> {
    R apply(A a, B b, C c);
}

TriFunction<Integer, Integer, Integer, Integer> sum3 = (a, b, c) -> a + b + c;
sum3.apply(1, 2, 3); // 6
```

### Với Generic và checked exception

```java
@FunctionalInterface
public interface ThrowingFunction<T, R> {
    R apply(T t) throws Exception;
}

ThrowingFunction<String, Integer> parser = Integer::parseInt;
try {
    parser.apply("123");
} catch (Exception e) {
    // handle
}
```

---

## 4. Default và Static method

Functional Interface có thể có **default** và **static** method (không phải abstract).

```java
@FunctionalInterface
public interface Calculator {
    int calc(int a, int b);  // abstract

    default Calculator andThen(Calculator next) {
        return (a, b) -> next.calc(this.calc(a, b), 0);
    }

    static Calculator zero() {
        return (a, b) -> 0;
    }
}
```

`Function` interface đã có sẵn `andThen`, `compose`, `identity` -- là default/static method.

---

## 5. Primitive Functional Interfaces

Để tránh autoboxing, có các version dành cho primitive:

| Interface           | Primitive       |
| ------------------- | --------------- |
| `IntFunction<R>`    | `R apply(int)`  |
| `IntPredicate`      | `test(int)`     |
| `IntConsumer`       | `accept(int)`   |
| `IntSupplier`       | `getAsInt()`    |
| `IntUnaryOperator`  | `(int) -> int`  |
| `IntBinaryOperator` | `(int, int) -> int` |
| `ToIntFunction<T>`  | `int apply(T)`  |

Tương tự cho `Long`, `Double`.

```java
// Tranh autobox
IntPredicate isPositive = x -> x > 0;
IntUnaryOperator square = x -> x * x;

// So sanh
Predicate<Integer> isPositive2 = x -> x > 0; // autobox -- cham hon
```

---

## Khi nào dùng?

- **Function**: Biến đổi giá trị (map)
- **Predicate**: Kiểm tra điều kiện (filter)
- **Consumer**: Xử lý không trả về (forEach, log, save)
- **Supplier**: Lazy initialization, factory
- **BiFunction**: 2 input, 1 output (reduce, merge)
- **UnaryOperator**: Same-type transformation (replaceAll trong List)
- **Primitive version**: Khi performance quan trọng
- **Best practice:**
  - **Ưu tiên** functional interface có sẵn trước khi tự tạo
  - Đặt `@FunctionalInterface` để compiler check
  - Dùng method reference khi có thể (`String::length` thay `s -> s.length()`)
  - Dùng primitive version cho int/long/double

---

## Lỗi thường gặp

### Lỗi 1: Tự tạo lại Function

```java
// SAI -- da co Function
@FunctionalInterface
interface MyFunction<T, R> {
    R apply(T t);
}

// DUNG -- dung Function co san
Function<T, R> fn;
```

### Lỗi 2: Quên @FunctionalInterface

```java
// Khong sai nhung de bi them abstract method tinh co
interface Calculator {
    int calc(int a, int b);
}

// DUNG
@FunctionalInterface
interface Calculator {
    int calc(int a, int b);
}
```

### Lỗi 3: Lambda dài

```java
// SAI -- lambda 20 dong
Function<Order, Receipt> fn = order -> {
    // 20 dong
};

// DUNG -- tach method
Function<Order, Receipt> fn = this::process;

Receipt process(Order order) {
    // logic
}
```

### Lỗi 4: Dùng Integer thay int

```java
// CHAM -- autobox
Predicate<Integer> isPositive = x -> x > 0;
nums.stream().filter(isPositive)... // autobox

// NHANH
IntPredicate isPositive = x -> x > 0;
intStream.filter(isPositive)...
```

---

## Câu hỏi phỏng vấn

### Câu 1: Functional Interface là gì?

**Trả lời:** Interface có **đúng 1 abstract method** (Single Abstract Method - SAM). Là khuôn cho lambda và method reference. Có thể có thêm default/static method. Annotation `@FunctionalInterface` (optional) giúp compiler check.

### Câu 2: `Function` và `Predicate` khác gì?

**Trả lời:**

- `Function<T, R>`: T -> R (biến đổi)
- `Predicate<T>`: T -> boolean (kiểm tra)

`Predicate` có method tổ hợp `and()`, `or()`, `negate()`. `Function` có `andThen()`, `compose()`. Cùng concept nhưng ngữ nghĩa và return type khác.

### Câu 3: Tại sao có Function và IntFunction riêng?

**Trả lời:** **Tránh autoboxing**. `Function<Integer, ...>` autobox `int -> Integer` mỗi lần gọi -- tốn memory + cache miss. `IntFunction<R>` nhận `int` trực tiếp -- nhanh hơn đáng kể trong stream lớn.

### Câu 4: Functional Interface kế thừa được không?

**Trả lời:** **Có** -- nhưng phải đảm bảo vẫn chỉ có 1 abstract method. Nếu interface con thêm abstract method, không còn là functional interface. Nhưng có thể thêm default method.

### Câu 5: Lambda có phải instance của Functional Interface không?

**Trả lời:** **Có**. Lambda thực chất là implementation của Functional Interface. Lúc compile, lambda bị "desugar" thành `invokedynamic` -- runtime tạo class anonymous implement interface.

```java
Runnable r = () -> System.out.println("hi");
System.out.println(r instanceof Runnable); // true
```
