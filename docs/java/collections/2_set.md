---
sidebar_position: 2
title: "2. Set (Tập hợp không trùng)"
---

# Set -- Tập hợp các phần tử không trùng

`Set` là collection **không cho phép trùng lặp**. Mỗi phần tử **chỉ xuất hiện 1 lần**. Phù hợp khi bạn quan tâm đến **việc có hay không** một phần tử, không quan tâm thứ tự (tùy implementation).

**Tương tự đơn giản:** Set giống **danh sách khách mời** đám cưới. Mỗi người chỉ có một thiếp mời -- không trùng. Bạn không quan tâm thứ tự, chỉ quan tâm "ai trong danh sách" và "tổng bao nhiêu khách".

---

## Mục lục

- [1. Set Interface](#1-set-interface)
- [2. HashSet](#2-hashset)
- [3. LinkedHashSet](#3-linkedhashset)
- [4. TreeSet](#4-treeset)
- [5. So sánh các loại Set](#5-so-sánh-các-loại-set)
- [6. Set operations](#6-set-operations)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Set Interface

`java.util.Set<E>` kế thừa `Collection<E>` -- thêm constraint: **không trùng**.

```java
import java.util.*;

Set<String> set = new HashSet<>();
set.add("apple");
set.add("banana");
set.add("apple");  // bo qua, da co
System.out.println(set.size()); // 2
```

### Phương thức chính

| Phương thức        | Mô tả                                  |
| ------------------ | -------------------------------------- |
| `add(e)`           | Thêm, trả false nếu đã có              |
| `remove(e)`        | Xóa                                    |
| `contains(e)`      | Kiểm tra có không                      |
| `size()`           | Số phần tử                             |
| `isEmpty()`        | Rỗng không                             |
| `iterator()`       | Lấy iterator                           |
| `clear()`          | Xóa hết                                |
| `addAll(c)`        | Thêm tất cả -- hiệu quả union          |
| `retainAll(c)`     | Giữ phần tử có trong c -- intersection |
| `removeAll(c)`     | Xóa phần tử trong c -- difference      |

---

## 2. HashSet

`HashSet` -- nội bộ dùng `HashMap`. Phổ biến nhất, **không thứ tự**, O(1) cho hầu hết thao tác.

```java
Set<Integer> set = new HashSet<>();
set.add(3);
set.add(1);
set.add(2);
System.out.println(set); // [1, 2, 3] hoac thu tu khac (khong dam bao)
```

### Cơ chế nội bộ

```
HashSet<E> = HashMap<E, Object>
- key cua HashMap = phan tu cua Set
- value = mot dummy object (PRESENT)
```

Khi `add`, Java gọi `hashCode()` của phần tử để tính bucket, dùng `equals()` để check trùng.

### Bắt buộc override `equals` và `hashCode`

```java
class Person {
    String name;
    Person(String name) { this.name = name; }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Person p)) return false;
        return name.equals(p.name);
    }

    @Override
    public int hashCode() {
        return name.hashCode();
    }
}

Set<Person> set = new HashSet<>();
set.add(new Person("Alice"));
set.add(new Person("Alice")); // bo qua vi equals
System.out.println(set.size()); // 1
```

---

## 3. LinkedHashSet

`LinkedHashSet` -- HashSet + giữ **thứ tự thêm vào**.

```java
Set<String> set = new LinkedHashSet<>();
set.add("c");
set.add("a");
set.add("b");
System.out.println(set); // [c, a, b]
```

**Trade-off:** Tốn thêm memory (linked list nội bộ), nhưng thứ tự ổn định.

---

## 4. TreeSet

`TreeSet` -- nội bộ dùng **Red-Black Tree**. **Tự sắp xếp** theo natural order hoặc `Comparator`.

```java
Set<Integer> set = new TreeSet<>();
set.add(5); set.add(2); set.add(8); set.add(1);
System.out.println(set); // [1, 2, 5, 8]

// Voi Comparator
Set<String> byLength = new TreeSet<>(Comparator.comparingInt(String::length));
byLength.add("apple");
byLength.add("dog");
byLength.add("banana");
System.out.println(byLength); // [dog, apple, banana]
```

### Phương thức bổ sung (NavigableSet)

```java
TreeSet<Integer> ts = new TreeSet<>(List.of(1, 3, 5, 7, 9));

ts.first();        // 1
ts.last();         // 9
ts.floor(6);       // 5 (lon nhat <= 6)
ts.ceiling(6);     // 7 (nho nhat >= 6)
ts.higher(5);      // 7 (strict >)
ts.lower(5);       // 3 (strict <)
ts.headSet(5);     // [1, 3] (< 5)
ts.tailSet(5);     // [5, 7, 9] (>= 5)
ts.subSet(3, 7);   // [3, 5]
```

---

## 5. So sánh các loại Set

| Tiêu chí           | HashSet         | LinkedHashSet    | TreeSet          |
| ------------------ | --------------- | ---------------- | ---------------- |
| Thứ tự             | Không xác định  | Theo thứ tự thêm | Theo natural/comparator |
| Phép `add/remove/contains` | O(1)    | O(1)             | O(log n)         |
| Null               | Cho phép 1      | Cho phép 1       | KHÔNG (NPE)      |
| Sort               | Không           | Không            | Có               |
| Memory             | Thấp            | Trung            | Cao              |

---

## 6. Set operations

```java
Set<Integer> a = new HashSet<>(List.of(1, 2, 3, 4));
Set<Integer> b = new HashSet<>(List.of(3, 4, 5, 6));

// Union (hop) -- a + b
Set<Integer> union = new HashSet<>(a);
union.addAll(b);
System.out.println(union); // [1, 2, 3, 4, 5, 6]

// Intersection (giao) -- chung
Set<Integer> intersection = new HashSet<>(a);
intersection.retainAll(b);
System.out.println(intersection); // [3, 4]

// Difference (hieu) -- a tru b
Set<Integer> diff = new HashSet<>(a);
diff.removeAll(b);
System.out.println(diff); // [1, 2]

// Symmetric difference -- chi co o 1 ben
Set<Integer> symDiff = new HashSet<>(a);
symDiff.addAll(b);
Set<Integer> tmp = new HashSet<>(a);
tmp.retainAll(b);
symDiff.removeAll(tmp);
System.out.println(symDiff); // [1, 2, 5, 6]
```

---

## Khi nào dùng?

- **HashSet**: Phổ biến nhất -- check trùng, đếm phần tử unique
- **LinkedHashSet**: Khi cần giữ thứ tự thêm (dedup list)
- **TreeSet**: Khi cần thứ tự sort hoặc query range
- **`Set.of(...)`**: Immutable set, Java 9+
- **`ConcurrentHashMap.newKeySet()`**: Set thread-safe
- **Best practice:**
  - Khai báo `Set<T>` thay vì implementation cụ thể
  - Object trong HashSet **PHẢI** override `equals` + `hashCode`
  - Nếu cần sort, dùng `TreeSet`; nếu cần insertion order, dùng `LinkedHashSet`

---

## Lỗi thường gặp

### Lỗi 1: Quên override `equals`/`hashCode`

```java
class User {
    int id;
    User(int id) { this.id = id; }
}

Set<User> set = new HashSet<>();
set.add(new User(1));
set.add(new User(1));
System.out.println(set.size()); // 2 (sai! mac dinh equals la ==)

// DUNG -- override equals + hashCode (hoac dung record)
record User(int id) {}
```

### Lỗi 2: Mutate phần tử sau khi add

```java
List<String> key = new ArrayList<>();
key.add("a");
Set<List<String>> set = new HashSet<>();
set.add(key);

key.add("b"); // hashCode thay doi!
set.contains(key); // co the false du vua add!
```

### Lỗi 3: Null trong TreeSet

```java
TreeSet<String> set = new TreeSet<>();
set.add(null); // NullPointerException

// DUNG -- HashSet/LinkedHashSet cho null
HashSet<String> hs = new HashSet<>();
hs.add(null); // OK
```

### Lỗi 4: Iterate và modify

```java
for (String s : set) {
    set.remove(s); // ConcurrentModificationException
}

// DUNG -- Iterator hoac removeIf
set.removeIf(s -> condition(s));
```

---

## Câu hỏi phỏng vấn

### Câu 1: HashSet hoạt động nội bộ thế nào?

**Trả lời:** `HashSet` nội bộ là 1 `HashMap`. Khi `add(x)`, key của map = x, value = constant `PRESENT`. Khi check trùng:

1. Tính `hashCode(x)` -> bucket index
2. Trong bucket, dùng `equals` so sánh với phần tử hiện có

Nếu hashCode/equals đúng quy ước, mọi thao tác O(1).

### Câu 2: Tại sao bắt buộc override cả `equals` và `hashCode`?

**Trả lời:** Quy ước Java: nếu `a.equals(b)` thì `a.hashCode() == b.hashCode()`. Nếu chỉ override 1, có thể:

- `equals` true nhưng hashCode khác -> Set chứa 2 phần tử "bằng nhau"
- hashCode bằng nhưng equals false -> Map tìm sai bucket

`record` (Java 16+) tự sinh equals/hashCode -- tránh bug.

### Câu 3: HashSet vs TreeSet -- nên dùng cái nào?

**Trả lời:**

- **HashSet**: Mặc định -- O(1), nhanh, không thứ tự
- **TreeSet**: O(log n) -- chậm hơn, nhưng sort tự động, hỗ trợ range query

Dùng TreeSet chỉ khi thực sự cần sort/range. Phần lớn case HashSet đủ.

### Câu 4: Có cách nào tạo Set thread-safe?

**Trả lời:**

- `Collections.synchronizedSet(new HashSet<>())` -- wrap, lock toàn bộ
- `ConcurrentHashMap.newKeySet()` -- thread-safe hiệu năng cao
- `CopyOnWriteArraySet` -- tốt cho read-heavy

Tránh dùng `HashSet` raw trong concurrent context.

### Câu 5: `Set.of(1, 2, 1)` có lỗi không?

**Trả lời:** **Có**. `Set.of` (Java 9+) ném `IllegalArgumentException: duplicate element` ngay khi tạo nếu có phần tử trùng. Khác `HashSet` -- chỉ bỏ qua. Đây là feature an toàn để tránh bug.
