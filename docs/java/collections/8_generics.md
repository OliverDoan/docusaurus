---
sidebar_position: 8
title: "8. Generics (Generic types)"
---

# Generics -- Kiểu dữ liệu tổng quát

**Generics** là tính năng cho phép viết class/method **làm việc với nhiều kiểu** mà vẫn **an toàn kiểu** (type-safe) tại compile time. Đây là nền tảng của Collections Framework hiện đại.

**Tương tự đơn giản:** Hãy tưởng tượng **hộp đựng đồ** có thể đựng được nhiều loại -- nhưng khi bạn đã chọn loại, không thể đựng loại khác. **Generics** giống vậy: `List<Integer>` chỉ đựng Integer, không bỏ String vào được.

---

## Mục lục

- [1. Tại sao cần Generics?](#1-tại-sao-cần-generics)
- [2. Generic Class](#2-generic-class)
- [3. Generic Method](#3-generic-method)
- [4. Bounded Type Parameter](#4-bounded-type-parameter)
- [5. Wildcards: ?, extends, super](#5-wildcards--extends-super)
- [6. Type Erasure](#6-type-erasure)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Tại sao cần Generics?

### Trước Java 5 (không có Generics)

```java
List list = new ArrayList();
list.add("hello");
list.add(42);              // bo lan dat

String s = (String) list.get(1); // ClassCastException luc chay!
```

### Java 5+ với Generics

```java
List<String> list = new ArrayList<>();
list.add("hello");
list.add(42);              // COMPILE ERROR ngay lap tuc
String s = list.get(0);    // khong can cast
```

**Lợi ích:**

- **Type safety**: compile-time check
- **Không cần cast**
- **Code rõ ràng** hơn

---

## 2. Generic Class

```java
public class Box<T> {
    private T value;

    public void set(T value) { this.value = value; }
    public T get() { return value; }
}

// Su dung
Box<String> stringBox = new Box<>();
stringBox.set("hello");
String s = stringBox.get();

Box<Integer> intBox = new Box<>();
intBox.set(42);
Integer i = intBox.get();
```

### Nhiều type parameter

```java
public class Pair<K, V> {
    private final K key;
    private final V value;

    public Pair(K key, V value) {
        this.key = key;
        this.value = value;
    }

    public K getKey() { return key; }
    public V getValue() { return value; }
}

Pair<String, Integer> p = new Pair<>("age", 25);
```

### Convention đặt tên

| Ký tự | Ý nghĩa            |
| ----- | ------------------ |
| `T`   | Type (kiểu chung)  |
| `E`   | Element            |
| `K`   | Key                |
| `V`   | Value              |
| `N`   | Number             |
| `R`   | Return type        |

---

## 3. Generic Method

```java
public class Util {
    // Generic method
    public static <T> T firstOrDefault(List<T> list, T defaultValue) {
        return list.isEmpty() ? defaultValue : list.get(0);
    }

    public static <T> void swap(T[] arr, int i, int j) {
        T tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
}

// Su dung -- type inference
Integer first = Util.firstOrDefault(List.of(1, 2, 3), 0);
String name = Util.firstOrDefault(List.of("a"), "default");

// Hoac chi dinh tuong minh
Integer first2 = Util.<Integer>firstOrDefault(List.of(1), 0);
```

---

## 4. Bounded Type Parameter

Giới hạn type parameter chỉ chấp nhận **subtype** của một class.

```java
// T phai la Number hoac subtype
public static <T extends Number> double sum(List<T> list) {
    double total = 0;
    for (T x : list) total += x.doubleValue();
    return total;
}

sum(List.of(1, 2, 3));           // OK
sum(List.of(1.5, 2.5));          // OK
sum(List.of("a", "b"));          // COMPILE ERROR
```

### Nhiều bound

```java
public static <T extends Comparable<T> & Serializable> T max(List<T> list) {
    // T phai vua Comparable vua Serializable
}
```

---

## 5. Wildcards: ?, extends, super

Wildcard `?` đại diện cho "kiểu chưa biết".

### Unbounded `?`

```java
public static void printAll(List<?> list) {
    for (Object o : list) {
        System.out.println(o);
    }
}

printAll(List.of(1, 2, 3));
printAll(List.of("a", "b"));
```

### Upper bound `? extends`

`? extends T` = T hoặc subtype của T. Dùng khi chỉ **đọc**.

```java
public static double sumNumbers(List<? extends Number> list) {
    double sum = 0;
    for (Number n : list) sum += n.doubleValue();
    return sum;
}

List<Integer> ints = List.of(1, 2, 3);
List<Double> doubles = List.of(1.0, 2.0);
sumNumbers(ints);     // OK
sumNumbers(doubles);  // OK
```

### Lower bound `? super`

`? super T` = T hoặc supertype của T. Dùng khi chỉ **ghi**.

```java
public static void addNumbers(List<? super Integer> list) {
    list.add(1);
    list.add(2);
}

List<Number> nums = new ArrayList<>();
List<Object> objs = new ArrayList<>();
addNumbers(nums);  // OK -- Number la super cua Integer
addNumbers(objs);  // OK -- Object la super
```

### Quy tắc PECS

**Producer Extends, Consumer Super**:

- Nếu collection cung cấp T -> dùng `? extends T`
- Nếu collection nhận T -> dùng `? super T`

```java
public static <T> void copy(List<? super T> dest, List<? extends T> src) {
    for (T item : src) dest.add(item);
}
```

---

## 6. Type Erasure

Generics trong Java là **compile-time only**. Lúc runtime, type parameter bị **xóa** (erased).

```java
List<String> a = new ArrayList<>();
List<Integer> b = new ArrayList<>();
System.out.println(a.getClass() == b.getClass()); // true!

// Tat ca thanh List<Object> luc chay
```

### Hệ quả

1. **Không tạo được `T[]`**:

```java
class Box<T> {
    T[] arr = new T[10]; // COMPILE ERROR
    T[] arr2 = (T[]) new Object[10]; // OK (unchecked warning)
}
```

2. **Không instanceof với generic**:

```java
if (obj instanceof List<String>) // COMPILE ERROR
if (obj instanceof List<?>)      // OK
```

3. **Không tạo instance của T**:

```java
class Box<T> {
    T create() {
        return new T(); // COMPILE ERROR
    }
}
```

### Cách lấy class của T

Truyền `Class<T>` qua constructor:

```java
class Box<T> {
    private final Class<T> type;

    public Box(Class<T> type) { this.type = type; }

    public T create() throws Exception {
        return type.getDeclaredConstructor().newInstance();
    }
}

Box<User> box = new Box<>(User.class);
User u = box.create();
```

---

## Khi nào dùng?

- **Dùng Generics khi:**
  - Viết utility class/method với nhiều kiểu (Container, Cache, Repository)
  - Sử dụng Collections (`List<T>`, `Map<K,V>`)
  - Type safety quan trọng
- **Best practice:**
  - Khai báo type parameter rõ ràng (`<T>`, `<E>`, `<K,V>`)
  - PECS: producer `extends`, consumer `super`
  - Tránh raw type (`List` thay vì `List<String>`)
  - Dùng wildcard `?` khi không quan tâm type cụ thể
  - Tránh `(T[]) new Object[]` -- unchecked warning

---

## Lỗi thường gặp

### Lỗi 1: Raw type

```java
// SAI -- raw type, mat type safety
List list = new ArrayList();

// DUNG
List<String> list = new ArrayList<>();
```

### Lỗi 2: Mix generic và raw

```java
List<String> list = new ArrayList<>();
List raw = list;
raw.add(42); // OK luc compile
String s = list.get(0); // ClassCastException
```

### Lỗi 3: Generic array creation

```java
// SAI
T[] arr = new T[10];

// DUNG -- cast tu Object[]
@SuppressWarnings("unchecked")
T[] arr = (T[]) new Object[10];
```

### Lỗi 4: Nhầm `? extends` và `? super`

```java
// SAI -- thiet ke API nhan input nen dung super
public static <T> void addAll(List<? extends T> dest, T value) {
    dest.add(value); // COMPILE ERROR
}

// DUNG
public static <T> void addAll(List<? super T> dest, T value) {
    dest.add(value);
}
```

### Lỗi 5: `instanceof List<String>`

```java
// SAI
if (obj instanceof List<String>) // COMPILE ERROR

// DUNG
if (obj instanceof List<?> list) {
    // list la List<?>
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: Generics dùng để làm gì?

**Trả lời:** Cho phép viết class/method **hoạt động với nhiều kiểu** mà vẫn an toàn kiểu (compile-time check). Tránh `ClassCastException` runtime, không cần cast thủ công, code dễ đọc và bảo trì.

### Câu 2: Type Erasure là gì?

**Trả lời:** Trong Java, generic là **compile-time only**. Sau compile, type parameter bị **xóa** -- `List<String>` và `List<Integer>` đều thành `List` lúc runtime. Hệ quả: không tạo được `T[]`, không `instanceof T`, không `new T()`.

### Câu 3: PECS là gì?

**Trả lời:** **Producer Extends, Consumer Super**:

- Method **đọc** (producer) từ collection -> dùng `? extends T`
- Method **ghi** (consumer) vào collection -> dùng `? super T`

Ví dụ `Collections.copy(List<? super T> dest, List<? extends T> src)` -- src producer, dest consumer.

### Câu 4: `List<Object>` có chứa được `List<String>` không?

**Trả lời:** **Không**. Generic **không có inheritance** -- `List<String>` KHÔNG phải subtype của `List<Object>`. Để chấp nhận, dùng wildcard:

```java
List<? extends Object> list = new ArrayList<String>(); // OK
```

### Câu 5: Tại sao không tạo được `T[] arr = new T[10]`?

**Trả lời:** Vì **type erasure** -- lúc runtime không biết T là gì để allocate array. Array trong Java cần biết type chính xác lúc tạo (để check phần tử). Cách workaround: `(T[]) new Object[10]` (unchecked) hoặc dùng `Array.newInstance(Class<T>, int)`.
