---
sidebar_position: 7
title: "7. Iterator (Duyệt collection)"
---

# Iterator -- Cách duyệt Collection

`Iterator` là **interface chuẩn** để duyệt qua từng phần tử của collection mà **không cần biết cấu trúc nội bộ**. Mọi collection (List, Set, Queue) đều cung cấp Iterator.

**Tương tự đơn giản:** Iterator giống **chiếc đèn pin trong thư viện** -- bạn không cần biết sách xếp thế nào, chỉ cần đi theo đèn từng cuốn một. Iterator giữ "vị trí hiện tại" và cho phép bạn lấy phần tử tiếp theo.

---

## Mục lục

- [1. Iterator Interface](#1-iterator-interface)
- [2. Các cách duyệt collection](#2-các-cách-duyệt-collection)
- [3. ListIterator](#3-listiterator)
- [4. Fail-Fast vs Fail-Safe](#4-fail-fast-vs-fail-safe)
- [5. Iterable interface](#5-iterable-interface)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Iterator Interface

```java
public interface Iterator<E> {
    boolean hasNext();
    E next();
    default void remove() { ... } // optional
}
```

```java
import java.util.*;

List<String> names = new ArrayList<>(List.of("Alice", "Bob", "Charlie"));
Iterator<String> it = names.iterator();

while (it.hasNext()) {
    String name = it.next();
    System.out.println(name);
}
```

### Phương thức

| Phương thức    | Mô tả                                          |
| -------------- | ---------------------------------------------- |
| `hasNext()`    | Còn phần tử không?                             |
| `next()`       | Lấy phần tử tiếp theo, **di chuyển con trỏ**   |
| `remove()`     | Xóa phần tử **vừa lấy** từ `next()`            |
| `forEachRemaining(action)` | Java 8+, áp dụng action cho phần tử còn lại |

---

## 2. Các cách duyệt collection

### 2.1. For-each (enhanced for loop)

```java
List<Integer> list = List.of(1, 2, 3);
for (int x : list) {
    System.out.println(x);
}
```

**Cú pháp đẹp** -- nội bộ vẫn dùng Iterator.

### 2.2. Iterator thủ công

Cần khi muốn `remove()` an toàn.

```java
List<Integer> list = new ArrayList<>(List.of(1, 2, 3, 4));
Iterator<Integer> it = list.iterator();
while (it.hasNext()) {
    if (it.next() % 2 == 0) {
        it.remove(); // OK -- xoa qua iterator
    }
}
System.out.println(list); // [1, 3]
```

### 2.3. Stream

```java
list.stream().forEach(System.out::println);
```

### 2.4. `forEach` của Iterable (Java 8+)

```java
list.forEach(System.out::println);
list.forEach(x -> System.out.println(x * 2));
```

### 2.5. Index-based (chỉ với List)

```java
for (int i = 0; i < list.size(); i++) {
    System.out.println(list.get(i));
}
```

**Chỉ dùng** khi cần index hoặc skip phần tử -- thường for-each tốt hơn.

---

## 3. ListIterator

`List` có `ListIterator` -- mạnh hơn Iterator: duyệt **2 chiều**, thêm/sửa phần tử.

```java
List<Integer> list = new ArrayList<>(List.of(1, 2, 3, 4));
ListIterator<Integer> lit = list.listIterator();

while (lit.hasNext()) {
    int x = lit.next();
    if (x % 2 == 0) {
        lit.set(x * 10); // sua phan tu vua lay
    }
}
System.out.println(list); // [1, 20, 3, 40]

// Di chuyen nguoc
while (lit.hasPrevious()) {
    System.out.println(lit.previous());
}
```

### Phương thức bổ sung

| Phương thức        | Mô tả                                |
| ------------------ | ------------------------------------ |
| `hasPrevious()`    | Còn phần tử trước                    |
| `previous()`       | Phần tử trước, di chuyển lùi         |
| `nextIndex()`      | Index của phần tử tiếp theo          |
| `previousIndex()`  | Index của phần tử trước              |
| `set(e)`           | Sửa phần tử vừa `next/previous`      |
| `add(e)`           | Thêm phần tử tại vị trí hiện tại     |

---

## 4. Fail-Fast vs Fail-Safe

### Fail-Fast (mặc định)

Hầu hết collection (`ArrayList`, `HashMap`, `HashSet`...) là **fail-fast**: nếu collection bị **modify từ bên ngoài** trong khi iterate, ném `ConcurrentModificationException`.

```java
List<Integer> list = new ArrayList<>(List.of(1, 2, 3));
for (int x : list) {
    if (x == 2) list.remove(Integer.valueOf(2)); // CME!
}
```

**Cơ chế:** Mỗi collection có biến `modCount`. Khi tạo Iterator, lưu `expectedModCount`. Mỗi lần `next`, check nếu khác -> ném CME.

### Fail-Safe

`ConcurrentHashMap`, `CopyOnWriteArrayList`... -- **fail-safe**: iterator làm việc trên **snapshot/copy**, không ném CME nhưng có thể không thấy thay đổi.

```java
import java.util.concurrent.CopyOnWriteArrayList;

CopyOnWriteArrayList<Integer> list = new CopyOnWriteArrayList<>(List.of(1, 2, 3));
for (int x : list) {
    if (x == 2) list.add(99); // OK -- khong CME
    System.out.println(x);
}
// Iterator chay tren snapshot, khong thay 99
```

---

## 5. Iterable interface

`Iterable<T>` là interface cha của `Collection`. Để class **dùng được for-each**, implement `Iterable`.

```java
class Bag<T> implements Iterable<T> {
    private List<T> items = new ArrayList<>();

    public void add(T item) { items.add(item); }

    @Override
    public Iterator<T> iterator() {
        return items.iterator();
    }
}

// Su dung
Bag<String> bag = new Bag<>();
bag.add("a"); bag.add("b");
for (String s : bag) {
    System.out.println(s);
}
```

### Tự tạo Iterator

```java
class CountDown implements Iterable<Integer> {
    private final int start;

    public CountDown(int start) { this.start = start; }

    @Override
    public Iterator<Integer> iterator() {
        return new Iterator<>() {
            int current = start;

            @Override
            public boolean hasNext() { return current >= 0; }

            @Override
            public Integer next() {
                if (!hasNext()) throw new NoSuchElementException();
                return current--;
            }
        };
    }
}

for (int x : new CountDown(3)) System.out.println(x);
// 3, 2, 1, 0
```

---

## Khi nào dùng?

- **For-each**: 95% case -- ngắn, đẹp, đúng
- **Iterator thủ công**: Khi cần `remove()` trong khi duyệt
- **ListIterator**: Khi cần sửa/thêm phần tử trong khi duyệt List
- **Stream**: Khi cần chain (filter, map, collect)
- **Index for-loop**: Khi cần biết index, skip
- **Best practice:**
  - Ưu tiên for-each
  - **KHÔNG** modify collection trong for-each -- dùng Iterator.remove() hoặc `removeIf`
  - Implement `Iterable` cho custom class để dùng for-each

---

## Lỗi thường gặp

### Lỗi 1: Modify trong for-each

```java
// SAI
for (Integer x : list) {
    if (x % 2 == 0) list.remove(x); // CME
}

// DUNG -- Iterator.remove()
Iterator<Integer> it = list.iterator();
while (it.hasNext()) {
    if (it.next() % 2 == 0) it.remove();
}

// HOAC removeIf (Java 8+)
list.removeIf(x -> x % 2 == 0);
```

### Lỗi 2: Gọi `next` nhiều lần

```java
// SAI -- 2 lan next() lay 2 phan tu khac nhau
while (it.hasNext()) {
    if (it.next().equals("a")) {
        System.out.println(it.next()); // skip phan tu!
    }
}

// DUNG -- gan vao bien
while (it.hasNext()) {
    String x = it.next();
    if (x.equals("a")) System.out.println(x);
}
```

### Lỗi 3: `next` mà không `hasNext`

```java
// SAI -- het phan tu -> NoSuchElementException
Iterator<Integer> it = list.iterator();
while (true) {
    Integer x = it.next();
}

// DUNG
while (it.hasNext()) {
    Integer x = it.next();
}
```

### Lỗi 4: `remove` mà chưa `next`

```java
Iterator<Integer> it = list.iterator();
it.remove(); // IllegalStateException

// DUNG -- next truoc roi remove
it.next();
it.remove();
```

---

## Câu hỏi phỏng vấn

### Câu 1: For-each loop có dùng Iterator không?

**Trả lời:** **Có**. For-each thực chất là **syntactic sugar** -- compiler dịch thành:

```java
Iterator<E> it = collection.iterator();
while (it.hasNext()) {
    E e = it.next();
    // body
}
```

Đây là lý do array dùng for-each được (compiler dịch khác) nhưng object phải implement `Iterable`.

### Câu 2: Fail-Fast và Fail-Safe khác gì?

**Trả lời:**

- **Fail-Fast**: Phát hiện modify giữa chừng, ném `ConcurrentModificationException` ngay -- giúp tìm bug sớm. Các collection trong `java.util` đa số fail-fast.
- **Fail-Safe**: Iterate trên snapshot, không ném exception. Các collection trong `java.util.concurrent` (`ConcurrentHashMap`, `CopyOnWriteArrayList`) fail-safe.

### Câu 3: `Iterator.remove()` khác `Collection.remove()` thế nào?

**Trả lời:** `Iterator.remove()` xóa phần tử vừa được `next()` và **không gây CME**. `Collection.remove(x)` gây CME nếu đang iterate.

Khi cần xóa khi duyệt -> dùng Iterator.remove() hoặc `removeIf` (Java 8+).

### Câu 4: ListIterator có gì hơn Iterator?

**Trả lời:**

- Duyệt **2 chiều**: `hasPrevious()`, `previous()`
- Biết **index**: `nextIndex()`, `previousIndex()`
- Sửa **set(e)** và thêm **add(e)** phần tử trong khi duyệt

ListIterator chỉ có ở `List`, không có ở `Set`, `Map`.

### Câu 5: Tự implement Iterable bằng cách nào?

**Trả lời:** Implement `Iterable<T>`, override `iterator()` trả về `Iterator<T>`. Iterator phải có `hasNext()` và `next()`. Có thể dùng anonymous class hoặc class riêng. Một cách nhanh là delegate tới iterator của collection nội bộ:

```java
public Iterator<T> iterator() {
    return items.iterator();
}
```
