---
sidebar_position: 1
title: "1. Array vs ArrayList"
---

# Array vs ArrayList -- Mảng truyền thống và Danh sách động

`Array` và `ArrayList` đều dùng để lưu danh sách phần tử, nhưng khác nhau ở **kích thước cố định/động**, **API**, và **hiệu năng**. Hiểu rõ giúp bạn chọn đúng công cụ.

**Tương tự đơn giản:** **Array** giống **hộp bút chì 12 cây** -- kích thước cố định, không thêm bớt được. **ArrayList** giống **giỏ đựng bút** -- bao nhiêu cũng bỏ vào, tự nở rộng.

---

## Mục lục

- [1. Array trong Java](#1-array-trong-java)
- [2. ArrayList trong Java](#2-arraylist-trong-java)
- [3. So sánh chi tiết](#3-so-sánh-chi-tiết)
- [4. Chuyển đổi qua lại](#4-chuyển-đổi-qua-lại)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Array trong Java

Array là **mảng** -- nhóm phần tử **cùng kiểu**, kích thước **cố định** khi tạo.

```java
public class ArrayDemo {
    public static void main(String[] args) {
        // Khai bao + khoi tao
        int[] numbers = new int[5];                     // mac dinh 0
        int[] init = {1, 2, 3, 4, 5};
        String[] names = new String[]{"Alice", "Bob"};

        // Truy cap
        numbers[0] = 10;
        System.out.println(numbers[0]);    // 10
        System.out.println(numbers.length); // 5

        // Lap
        for (int i = 0; i < init.length; i++) {
            System.out.println(init[i]);
        }
        for (int x : init) {
            System.out.println(x);
        }
    }
}
```

### Mảng 2 chiều

```java
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};

System.out.println(matrix[1][2]); // 6
System.out.println(matrix.length);     // 3 (so hang)
System.out.println(matrix[0].length);  // 3 (so cot)
```

### Đặc điểm

- Kích thước **cố định** -- không thể thêm/bớt sau khi tạo
- Lưu được **primitive** (`int`, `double`...) và **object**
- Truy cập **rất nhanh** O(1) qua index
- Có thuộc tính `.length` (không phải method!)

---

## 2. ArrayList trong Java

`ArrayList` là **danh sách động** -- nội bộ vẫn dùng array nhưng tự động mở rộng khi đầy.

```java
import java.util.ArrayList;
import java.util.List;

public class ArrayListDemo {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>();

        names.add("Alice");
        names.add("Bob");
        names.add("Charlie");

        System.out.println(names.size());          // 3
        System.out.println(names.get(0));          // Alice
        names.set(0, "Anna");                       // Sua phan tu
        names.remove(1);                            // Xoa Bob
        System.out.println(names.contains("Anna")); // true

        for (String name : names) {
            System.out.println(name);
        }
    }
}
```

### Cơ chế nội bộ

```java
// Khi tao, ArrayList co mang noi bo size 10 (default)
ArrayList<Integer> list = new ArrayList<>();

// Khi them phan tu thu 11, mang phong to 1.5x = 15
// Khi day, lai phong to: 15 -> 22 -> 33 -> ...
```

**Giải thích thuật ngữ:**

- **Capacity**: Kích thước mảng nội bộ (có thể lớn hơn size)
- **Size**: Số phần tử thực tế
- **Growth factor**: Tỷ lệ phóng to khi đầy (1.5x)

### Generic

`ArrayList<T>` -- bắt buộc khai báo type tham số:

```java
List<Integer> nums = new ArrayList<>();
List<String> names = new ArrayList<>();
List<List<Integer>> matrix = new ArrayList<>();
```

---

## 3. So sánh chi tiết

| Tiêu chí           | Array            | ArrayList                  |
| ------------------ | ---------------- | -------------------------- |
| Kích thước         | Cố định          | Động (tự mở rộng)          |
| Kiểu dữ liệu       | Primitive + Object | Chỉ Object (autoboxing)   |
| Hiệu năng truy cập | O(1) -- nhanh hơn | O(1) -- chậm hơn chút     |
| Thêm phần tử       | Không có         | O(1) amortized             |
| Xóa phần tử        | Không có         | O(n) -- phải shift         |
| Memory             | Ít hơn (không overhead) | Nhiều hơn (object wrapper) |
| API                | Chỉ `.length`    | `add`, `remove`, `contains`... |
| Generic            | Không             | Có                         |
| Multidimensional   | Tốt              | Phải dùng `List<List<T>>` |

### Hiệu năng

```java
// 1 trieu phep truy cap
int[] arr = new int[1_000_000];
ArrayList<Integer> list = new ArrayList<>(1_000_000);

// Truy cap: arr nhanh hon ~2x do khong unboxing
arr[i] = 5;
list.set(i, 5); // autobox int -> Integer
```

---

## 4. Chuyển đổi qua lại

### Array -> ArrayList

```java
import java.util.*;

String[] arr = {"a", "b", "c"};

// Cach 1: Arrays.asList (immutable, khong add/remove duoc)
List<String> list1 = Arrays.asList(arr);
// list1.add("d"); // ERROR

// Cach 2: ArrayList moi (mutable)
List<String> list2 = new ArrayList<>(Arrays.asList(arr));
list2.add("d"); // OK

// Cach 3: List.of (Java 9+, immutable)
List<String> list3 = List.of(arr);

// Cach 4: Stream
List<String> list4 = Arrays.stream(arr).collect(Collectors.toList());
```

### ArrayList -> Array

```java
List<String> list = new ArrayList<>(List.of("a", "b", "c"));

// Cach 1
String[] arr1 = list.toArray(new String[0]);

// Cach 2 (Java 11+)
String[] arr2 = list.toArray(String[]::new);
```

---

## Khi nào dùng?

- **Dùng Array khi:**
  - Biết trước kích thước cố định
  - Cần hiệu năng tối đa (game, scientific computing)
  - Làm việc với primitive (`int[]` nhanh hơn `List<Integer>`)
  - API trả về/nhận array (legacy code)
- **Dùng ArrayList khi:**
  - Kích thước thay đổi
  - Cần nhiều thao tác: `contains`, `indexOf`, `subList`
  - Tận dụng API Stream, Collection
  - Pass qua method generic
- **Best practice:**
  - Khai báo `List<T>` thay vì `ArrayList<T>` (interface programming)
  - Dùng `ArrayList<>(initialCapacity)` nếu biết trước size để tránh resize
  - Dùng `List.of()` cho immutable list

---

## Lỗi thường gặp

### Lỗi 1: `Arrays.asList` rồi `add`

```java
List<String> list = Arrays.asList("a", "b");
list.add("c"); // UnsupportedOperationException!

// DUNG -- wrap them ArrayList
List<String> list = new ArrayList<>(Arrays.asList("a", "b"));
list.add("c");
```

### Lỗi 2: Tạo `int[]` bằng `Integer[]`

```java
// SAI -- mismatch type
int[] arr = new Integer[5]; // compile error

// DUNG
int[] arr = new int[5];
Integer[] arr2 = new Integer[5];
```

### Lỗi 3: `length` vs `size()`

```java
int[] arr = new int[5];
arr.length;     // PROPERTY -- khong dau ngoac

ArrayList<Integer> list = new ArrayList<>();
list.size();    // METHOD -- co dau ngoac
```

### Lỗi 4: Xóa khi duyệt

```java
// SAI -- ConcurrentModificationException
for (String s : list) {
    if (s.startsWith("a")) list.remove(s);
}

// DUNG -- Iterator
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    if (it.next().startsWith("a")) it.remove();
}

// Hoac stream
list.removeIf(s -> s.startsWith("a"));
```

---

## Câu hỏi phỏng vấn

### Câu 1: ArrayList mở rộng thế nào khi đầy?

**Trả lời:** Mặc định capacity 10. Khi `add` mà đầy, ArrayList tạo array mới với capacity = `oldCapacity * 1.5`, copy phần tử cũ sang. Đây là lý do `add` là O(1) **amortized** (trung bình), nhưng O(n) ở lần phải copy.

### Câu 2: Tại sao ArrayList chậm hơn array nhỏ?

**Trả lời:**

- ArrayList chỉ chứa `Object` -- `int` phải **autobox** thành `Integer` (heap object)
- Truy cập qua method `get(i)` -- overhead method call
- Memory layout phân tán hơn -- cache miss nhiều hơn

Array chứa primitive trực tiếp, layout liên tục -- CPU cache thân thiện.

### Câu 3: Có thể tạo `ArrayList<int>` không?

**Trả lời:** **Không**. Generic Java chỉ chấp nhận reference type. Phải dùng `ArrayList<Integer>` -- mỗi `int` bị autobox thành `Integer`. Để tránh autobox, dùng thư viện như Eclipse Collections (`IntArrayList`) hoặc primitive array.

### Câu 4: `Arrays.asList` và `List.of` khác gì?

**Trả lời:**

- `Arrays.asList(arr)`: View của mảng -- **fixed size** (không add/remove), nhưng **set được**
- `List.of(...)` (Java 9+): **Immutable hoàn toàn** -- không add/remove/set
- `new ArrayList<>(Arrays.asList(arr))`: Bản copy mutable

### Câu 5: Khi nào dùng `LinkedList` thay `ArrayList`?

**Trả lời:** Hiếm khi. `LinkedList` chỉ tốt khi:

- Thêm/xóa **đầu/cuối** nhiều (dùng `Deque`)
- Truy cập **tuần tự** qua Iterator

Với truy cập random, ArrayList **luôn nhanh hơn** do cache locality. Trong production, 95% case nên dùng `ArrayList`, hoặc `ArrayDeque` thay `LinkedList`.
