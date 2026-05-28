---
sidebar_position: 4
title: "4. Stream API"
---

# Stream API -- Xử lý dữ liệu kiểu functional

**Stream API** (Java 8+) cho phép xử lý collection theo kiểu **functional, declarative** -- ngắn gọn, dễ đọc, dễ parallel hóa. Đây là **một trong những tính năng đáng giá nhất** của Java hiện đại.

**Tương tự đơn giản:** Stream giống **dây chuyền sản xuất**: nguyên liệu (collection) đi qua các trạm (filter, map, sort), cuối cùng đóng gói (collect). Bạn mô tả **WHAT** muốn làm, không cần viết **HOW** (vòng for thủ công).

---

## Mục lục

- [1. Stream là gì?](#1-stream-là-gì)
- [2. Tạo Stream](#2-tạo-stream)
- [3. Intermediate Operations](#3-intermediate-operations)
- [4. Terminal Operations](#4-terminal-operations)
- [5. Collectors](#5-collectors)
- [6. Primitive Streams](#6-primitive-streams)
- [7. Parallel Stream](#7-parallel-stream)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Stream là gì?

**Stream** là **chuỗi dữ liệu** có thể được **xử lý qua nhiều bước**. Không phải collection -- không lưu dữ liệu, chỉ "chạy qua".

### So sánh kiểu cũ vs Stream

```java
List<Integer> nums = List.of(1, 2, 3, 4, 5, 6, 7, 8);

// CACH CU -- imperative
List<Integer> result = new ArrayList<>();
for (int n : nums) {
    if (n % 2 == 0) {
        result.add(n * n);
    }
}
Collections.sort(result);
System.out.println(result); // [4, 16, 36, 64]

// CACH MOI -- declarative voi Stream
List<Integer> result = nums.stream()
    .filter(n -> n % 2 == 0)
    .map(n -> n * n)
    .sorted()
    .collect(Collectors.toList());
```

Ngắn hơn, rõ hơn, dễ parallel.

### Đặc điểm

- **Không lưu trữ**: Stream là view, không copy data
- **Functional**: Không sửa source -- mỗi op trả Stream mới
- **Lazy**: Intermediate op không chạy đến khi có terminal op
- **One-shot**: Stream chỉ dùng được 1 lần
- **Có thể vô tận**: `Stream.iterate`, `Stream.generate`

---

## 2. Tạo Stream

```java
// Tu Collection
List<String> list = List.of("a", "b", "c");
Stream<String> s1 = list.stream();
Stream<String> s2 = list.parallelStream();

// Tu Array
String[] arr = {"a", "b"};
Stream<String> s3 = Arrays.stream(arr);

// Tu gia tri cu the
Stream<String> s4 = Stream.of("a", "b", "c");

// Stream rong
Stream<String> empty = Stream.empty();

// Vo tan
Stream<Integer> infinite = Stream.iterate(0, x -> x + 1);
Stream<Double> random = Stream.generate(Math::random);

// Range so
IntStream range = IntStream.range(0, 10);        // 0..9
IntStream closed = IntStream.rangeClosed(1, 10); // 1..10

// Tu file
Stream<String> lines = Files.lines(Path.of("file.txt"));

// Tu string
IntStream chars = "hello".chars();
```

---

## 3. Intermediate Operations

Trả về Stream mới, **lazy** -- không chạy đến khi có terminal op.

### `filter` -- lọc

```java
List<Integer> nums = List.of(1, 2, 3, 4, 5);
nums.stream()
    .filter(n -> n > 2)
    .forEach(System.out::println); // 3, 4, 5
```

### `map` -- biến đổi

```java
List<String> names = List.of("alice", "bob");
names.stream()
    .map(String::toUpperCase)
    .forEach(System.out::println); // ALICE, BOB
```

### `flatMap` -- flatten

```java
List<List<Integer>> nested = List.of(List.of(1, 2), List.of(3, 4));
nested.stream()
    .flatMap(List::stream)
    .forEach(System.out::println); // 1, 2, 3, 4
```

### `sorted`

```java
List.of(3, 1, 2).stream()
    .sorted()
    .forEach(System.out::println); // 1, 2, 3

// Voi Comparator
list.stream().sorted(Comparator.reverseOrder());
list.stream().sorted(Comparator.comparingInt(String::length));
```

### `distinct` -- bỏ trùng

```java
List.of(1, 2, 2, 3, 3, 3).stream()
    .distinct()
    .forEach(System.out::println); // 1, 2, 3
```

### `limit` và `skip`

```java
Stream.iterate(1, x -> x + 1)
    .limit(5)
    .forEach(System.out::println); // 1, 2, 3, 4, 5

list.stream().skip(2).limit(3); // Bo 2 dau, lay 3 phan tu
```

### `peek` -- debug

```java
list.stream()
    .peek(x -> System.out.println("Truoc filter: " + x))
    .filter(x -> x > 0)
    .peek(x -> System.out.println("Sau filter: " + x))
    .count();
```

### `takeWhile` / `dropWhile` (Java 9+)

```java
Stream.of(1, 2, 3, 10, 4, 5)
    .takeWhile(x -> x < 5)
    .forEach(System.out::println); // 1, 2, 3

Stream.of(1, 2, 3, 10, 4, 5)
    .dropWhile(x -> x < 5)
    .forEach(System.out::println); // 10, 4, 5
```

---

## 4. Terminal Operations

Trigger pipeline chạy, trả về kết quả (không phải Stream).

### `forEach`, `forEachOrdered`

```java
list.stream().forEach(System.out::println);

// Parallel se loi thu tu -- dung forEachOrdered de giu
list.parallelStream().forEachOrdered(System.out::println);
```

### `collect`

```java
List<Integer> list = stream.collect(Collectors.toList());
Set<Integer> set = stream.collect(Collectors.toSet());
String joined = stream.collect(Collectors.joining(", "));
```

### `toList` (Java 16+)

```java
List<Integer> list = stream.toList(); // immutable
```

### `count`

```java
long total = list.stream().filter(x -> x > 0).count();
```

### `reduce`

```java
// Sum
int sum = list.stream().reduce(0, Integer::sum);

// Max khong co identity
Optional<Integer> max = list.stream().reduce(Integer::max);

// Concat strings
String all = strs.stream().reduce("", String::concat);
```

### `min`, `max`

```java
Optional<Integer> min = list.stream().min(Comparator.naturalOrder());
Optional<User> oldest = users.stream().max(Comparator.comparingInt(User::age));
```

### `findFirst`, `findAny`

```java
Optional<Integer> first = list.stream().filter(x -> x > 0).findFirst();
Optional<Integer> any = list.parallelStream().findAny();
```

### `anyMatch`, `allMatch`, `noneMatch`

```java
boolean hasNeg = nums.stream().anyMatch(x -> x < 0);
boolean allPos = nums.stream().allMatch(x -> x > 0);
boolean noNeg = nums.stream().noneMatch(x -> x < 0);
```

### `toArray`

```java
Object[] arr = stream.toArray();
String[] arr2 = stream.toArray(String[]::new);
```

---

## 5. Collectors

`Collectors` cung cấp nhiều hàm sẵn:

```java
import static java.util.stream.Collectors.*;

// Co ban
List<T> list = stream.collect(toList());
Set<T> set = stream.collect(toSet());

// String
String joined = stream.collect(joining(", ", "[", "]"));

// Map
Map<String, User> byName = users.stream()
    .collect(toMap(User::name, u -> u));

// Group by
Map<String, List<User>> byCity = users.stream()
    .collect(groupingBy(User::city));

// Group by + count
Map<String, Long> countByCity = users.stream()
    .collect(groupingBy(User::city, counting()));

// Group by + sum
Map<String, Integer> sumAgeByCity = users.stream()
    .collect(groupingBy(User::city, summingInt(User::age)));

// Partition (true/false)
Map<Boolean, List<User>> adults = users.stream()
    .collect(partitioningBy(u -> u.age() >= 18));

// Statistic
IntSummaryStatistics stats = users.stream()
    .collect(summarizingInt(User::age));
System.out.println(stats.getAverage());
System.out.println(stats.getMax());
```

---

## 6. Primitive Streams

Tránh autobox với `IntStream`, `LongStream`, `DoubleStream`.

```java
IntStream.range(1, 10)
    .filter(x -> x % 2 == 0)
    .map(x -> x * x)
    .sum(); // tra ve int

// Chuyen sang object stream
IntStream.range(1, 5).boxed().collect(toList()); // List<Integer>

// Ngược lại
list.stream().mapToInt(Integer::intValue);

// Statistics
IntStream.rangeClosed(1, 100).summaryStatistics();
```

---

## 7. Parallel Stream

Tận dụng đa core CPU.

```java
List<Integer> result = bigList.parallelStream()
    .filter(x -> heavyCompute(x))
    .collect(Collectors.toList());
```

**Khi nào dùng?**

- Collection **rất lớn** (>10000 phần tử)
- Operation **CPU heavy**
- Không có **shared mutable state**

**Khi nào KHÔNG dùng?**

- Collection nhỏ -- overhead lớn hơn lợi ích
- I/O bound -- overhead, không lợi
- Cần thứ tự -- parallel làm lệch
- Có side effect không đồng bộ

---

## Khi nào dùng?

- **Stream khi:**
  - Pipeline xử lý collection
  - Aggregate (sum, count, group)
  - Transform data
  - Đọc file dòng theo dòng
- **KHÔNG dùng Stream khi:**
  - Cần modify collection gốc -- Stream là read-only
  - Cần break/continue phức tạp -- for-loop dễ hơn
  - Cần multiple iteration -- collect xong dùng list
- **Best practice:**
  - Method reference (`String::length`) > lambda
  - Tránh side effect trong intermediate op
  - Dùng `Collectors.toUnmodifiableList()` nếu không cần modify
  - Parallel chỉ khi thực sự cần (đã measure)

---

## Lỗi thường gặp

### Lỗi 1: Reuse stream

```java
Stream<Integer> s = list.stream();
s.count();
s.forEach(...); // IllegalStateException -- stream da consumed
```

### Lỗi 2: Side effect

```java
List<Integer> result = new ArrayList<>();
list.stream().filter(...).forEach(result::add); // side effect

// DUNG
List<Integer> result = list.stream().filter(...).collect(toList());
```

### Lỗi 3: Parallel với non-thread-safe accumulator

```java
// SAI -- ArrayList khong thread-safe
List<Integer> result = new ArrayList<>();
list.parallelStream().forEach(result::add); // race condition

// DUNG -- collect
List<Integer> result = list.parallelStream().collect(toList());
```

### Lỗi 4: Stream vô tận không có limit

```java
Stream.iterate(0, x -> x + 1).forEach(System.out::println);
// Vong lap vo tan

// DUNG -- limit
Stream.iterate(0, x -> x + 1).limit(100).forEach(System.out::println);
```

### Lỗi 5: `collect(toMap)` key trùng

```java
// SAI -- 2 user cung name -> IllegalStateException
users.stream().collect(toMap(User::name, u -> u));

// DUNG -- merge function
users.stream().collect(toMap(
    User::name,
    u -> u,
    (a, b) -> a // giu phan tu dau
));
```

---

## Câu hỏi phỏng vấn

### Câu 1: Stream khác Collection thế nào?

**Trả lời:**

- **Collection**: lưu data, có size, modify được
- **Stream**: pipeline xử lý data, không lưu, chỉ duyệt 1 lần

Stream functional, lazy, có parallel.

### Câu 2: Intermediate vs Terminal operation?

**Trả lời:**

- **Intermediate**: trả về Stream (filter, map, sorted) -- lazy, chỉ chạy khi có terminal
- **Terminal**: trả về kết quả (collect, forEach, count, reduce) -- trigger pipeline

Stream phải có **ít nhất 1 terminal** mới thực sự chạy.

### Câu 3: `map` và `flatMap` khác gì?

**Trả lời:**

- `map`: T -> R, mỗi phần tử ra 1 phần tử mới
- `flatMap`: `T -> Stream<R>`, mỗi phần tử ra **nhiều** phần tử, flatten lại

Ví dụ `List<List<Integer>>` -> dùng `flatMap(List::stream)` thành `Stream<Integer>`.

### Câu 4: Parallel Stream có luôn nhanh hơn không?

**Trả lời:** **Không**. Phụ thuộc:

- Size data (cần lớn)
- Cost operation (cần nặng)
- Splittable (ArrayList tốt, LinkedList kém)
- Không có contention

Collection nhỏ + op nhẹ -> parallel **chậm hơn** do overhead. Luôn benchmark trước khi dùng.

### Câu 5: `reduce` hoạt động thế nào?

**Trả lời:** Gộp các phần tử thành 1 giá trị. 3 forms:

- `reduce(identity, accumulator)`: T -> T (sum, product)
- `reduce(accumulator)`: trả Optional (max, min)
- `reduce(identity, accumulator, combiner)`: cho parallel với type khác

Ví dụ `nums.reduce(0, Integer::sum)` cộng tất cả số.
