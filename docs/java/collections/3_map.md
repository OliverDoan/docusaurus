---
sidebar_position: 3
title: "3. Map (Key-Value)"
---

# Map -- Cấu trúc dữ liệu Key-Value

`Map` lưu các cặp **key-value** -- mỗi key duy nhất, ánh xạ tới một value. Đây là một trong những cấu trúc dữ liệu được dùng **nhiều nhất** trong lập trình.

**Tương tự đơn giản:** `Map` giống **danh bạ điện thoại**: **tên** (key) ánh xạ tới **số điện thoại** (value). Tra tên là ra số -- không cần lướt cả danh sách. Map cho phép tra cứu **siêu nhanh** O(1).

---

## Mục lục

- [1. Map Interface](#1-map-interface)
- [2. HashMap](#2-hashmap)
- [3. LinkedHashMap](#3-linkedhashmap)
- [4. TreeMap](#4-treemap)
- [5. ConcurrentHashMap](#5-concurrenthashmap)
- [6. Phương thức Java 8+](#6-phương-thức-java-8)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Map Interface

```java
import java.util.*;

Map<String, Integer> ages = new HashMap<>();
ages.put("Alice", 25);
ages.put("Bob", 30);
ages.put("Charlie", 28);

System.out.println(ages.get("Alice"));            // 25
System.out.println(ages.containsKey("Bob"));      // true
System.out.println(ages.size());                  // 3

// Duyet
for (Map.Entry<String, Integer> entry : ages.entrySet()) {
    System.out.println(entry.getKey() + " = " + entry.getValue());
}

// Lambda
ages.forEach((k, v) -> System.out.println(k + " = " + v));
```

### Phương thức chính

| Phương thức              | Mô tả                                      |
| ------------------------ | ------------------------------------------ |
| `put(k, v)`              | Đặt/ghi đè value                           |
| `get(k)`                 | Lấy value, null nếu không có               |
| `getOrDefault(k, d)`     | Lấy hoặc default                           |
| `containsKey(k)`         | Có key không                               |
| `containsValue(v)`       | Có value không (chậm O(n))                 |
| `remove(k)`              | Xóa                                        |
| `keySet()`               | Set các key                                |
| `values()`               | Collection các value                       |
| `entrySet()`             | Set các Entry                              |
| `putIfAbsent(k, v)`      | Put nếu chưa có                            |
| `compute(k, fn)`         | Tính value mới từ key+value cũ             |
| `merge(k, v, fn)`        | Merge giá trị                              |

---

## 2. HashMap

`HashMap` -- phổ biến nhất, **không thứ tự**, O(1) cho hầu hết thao tác.

### Cơ chế nội bộ

```
HashMap = mang bucket[]
- Moi bucket la 1 linked list (hoac tree neu collision nhieu)
- Index = hashCode(key) % bucketSize
```

### Quá trình `put`

1. Tính `hash(key)` -> `bucket index`
2. Tìm trong bucket: nếu key tồn tại (qua `equals`), ghi đè
3. Nếu không, thêm Entry mới
4. Khi `size / capacity > loadFactor (0.75)`, **resize** (gấp đôi capacity)

### Hash collision

Khi 2 key có hashCode trùng -> cùng bucket. Java 8+: nếu bucket có ≥ 8 phần tử, chuyển từ linked list sang **Red-Black Tree** -- worst case từ O(n) xuống O(log n).

```java
HashMap<String, Integer> map = new HashMap<>();
map.put("a", 1);
map.put("b", 2);
map.put("a", 3); // ghi de
System.out.println(map.get("a")); // 3
```

---

## 3. LinkedHashMap

`LinkedHashMap` -- HashMap + giữ **thứ tự thêm vào** (hoặc access order).

```java
LinkedHashMap<String, Integer> map = new LinkedHashMap<>();
map.put("c", 1);
map.put("a", 2);
map.put("b", 3);
System.out.println(map); // {c=1, a=2, b=3}

// Access-order (LRU cache)
LinkedHashMap<String, Integer> lru = new LinkedHashMap<>(16, 0.75f, true);
lru.put("a", 1);
lru.put("b", 2);
lru.get("a");        // a duoc move sang cuoi
System.out.println(lru); // {b=2, a=1}
```

### LRU Cache đơn giản

```java
class LruCache<K, V> extends LinkedHashMap<K, V> {
    private final int maxSize;

    public LruCache(int maxSize) {
        super(maxSize, 0.75f, true);
        this.maxSize = maxSize;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > maxSize;
    }
}
```

---

## 4. TreeMap

`TreeMap` -- nội bộ Red-Black Tree, **tự sort theo key**.

```java
TreeMap<String, Integer> map = new TreeMap<>();
map.put("banana", 2);
map.put("apple", 1);
map.put("cherry", 3);
System.out.println(map); // {apple=1, banana=2, cherry=3}

// NavigableMap
map.firstKey();           // apple
map.lastKey();            // cherry
map.floorKey("b");        // apple (lon nhat <= b)
map.ceilingKey("b");      // banana (nho nhat >= b)
map.headMap("c");         // {apple=1, banana=2}
map.tailMap("b");         // {banana=2, cherry=3}
map.subMap("a", "c");     // [a, c)
```

---

## 5. ConcurrentHashMap

Thread-safe, hiệu năng cao -- thay thế `Hashtable` cũ.

```java
import java.util.concurrent.ConcurrentHashMap;

ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
map.put("key", 1);
map.computeIfAbsent("count", k -> 0);
map.merge("count", 1, Integer::sum); // dem tang
```

**Đặc điểm:**

- Đọc gần như **không lock**
- Ghi lock theo bucket (Java 8+) -- nhiều thread ghi song song được
- KHÔNG cho phép `null` key/value (khác HashMap)

---

## 6. Phương thức Java 8+

### `getOrDefault`

```java
int count = map.getOrDefault("key", 0);
```

### `putIfAbsent`

```java
map.putIfAbsent("key", 1); // chi put neu chua co
```

### `compute`

```java
// Tang count len 1
map.compute("count", (k, v) -> v == null ? 1 : v + 1);
```

### `computeIfAbsent`

```java
// Lazy init -- value nay co the tao tu key
Map<String, List<Integer>> grouped = new HashMap<>();
grouped.computeIfAbsent("a", k -> new ArrayList<>()).add(1);
grouped.computeIfAbsent("a", k -> new ArrayList<>()).add(2);
System.out.println(grouped); // {a=[1, 2]}
```

### `merge`

```java
// Dem so lan xuat hien
Map<String, Integer> wordCount = new HashMap<>();
for (String word : words) {
    wordCount.merge(word, 1, Integer::sum);
}
```

### `Map.of` / `Map.entry` (Java 9+)

```java
Map<String, Integer> immutable = Map.of(
    "a", 1,
    "b", 2,
    "c", 3
);

Map<String, Integer> big = Map.ofEntries(
    Map.entry("a", 1),
    Map.entry("b", 2)
);
```

---

## Khi nào dùng?

- **HashMap**: Mặc định 99% case
- **LinkedHashMap**: Cần thứ tự thêm vào, LRU cache
- **TreeMap**: Cần sort theo key, range query
- **ConcurrentHashMap**: Map chia sẻ giữa nhiều thread
- **Map.of(...)**: Constant map nhỏ
- **EnumMap**: Map có key là enum (nhanh hơn HashMap)
- **Best practice:**
  - Khai báo `Map<K, V>` không phải `HashMap<K, V>`
  - Override `equals + hashCode` cho key
  - Set **initialCapacity** nếu biết trước size: `new HashMap<>(expectedSize * 4/3)`
  - Tránh dùng `Hashtable` (cũ, không cần dùng nữa)

---

## Lỗi thường gặp

### Lỗi 1: Key mutable

```java
List<String> key = new ArrayList<>(List.of("a"));
map.put(key, 1);
key.add("b"); // hashCode thay doi -> map khong tim lai duoc
```

### Lỗi 2: NPE khi `get` trả null

```java
// SAI
int count = map.get("key"); // NPE neu khong co

// DUNG
int count = map.getOrDefault("key", 0);
```

### Lỗi 3: `containsKey + get` chậm gấp đôi

```java
// SAI -- 2 lan luc
if (map.containsKey("k")) {
    Integer v = map.get("k");
}

// DUNG
Integer v = map.get("k");
if (v != null) { ... }
```

### Lỗi 4: Iterate và modify

```java
// SAI
for (Map.Entry<K, V> e : map.entrySet()) {
    if (...) map.remove(e.getKey()); // CME
}

// DUNG -- Iterator hoac entrySet.removeIf
map.entrySet().removeIf(e -> condition(e));
```

### Lỗi 5: `Map.of` với key null

```java
Map.of("a", null); // NPE -- Map.of khong cho null
```

---

## Câu hỏi phỏng vấn

### Câu 1: HashMap hoạt động nội bộ thế nào?

**Trả lời:** Mảng bucket. `put(k, v)`:

1. `hash(k.hashCode())` -> chỉ số bucket
2. Trong bucket, dùng `equals` tìm entry hiện có
3. Ghi đè hoặc thêm mới
4. Khi `size / capacity > 0.75`, resize (×2)

Java 8+ chuyển bucket sang **Red-Black Tree** nếu collision ≥ 8 -- worst case O(log n).

### Câu 2: HashMap có thread-safe không?

**Trả lời:** **Không**. Concurrent put/resize có thể gây **infinite loop** (Java 7), data loss, NPE. Trong Java 8 không loop nhưng vẫn không an toàn. Dùng `ConcurrentHashMap` thay thế -- thread-safe, hiệu năng cao.

### Câu 3: Tại sao `HashMap` cho null key, `ConcurrentHashMap` không?

**Trả lời:** `HashMap` xử lý null key đặc biệt -- đặt vào bucket 0. `ConcurrentHashMap` cấm null vì:

- Không phân biệt được "key không có" vs "key có value null" trong concurrent context
- Quy ước an toàn hơn

### Câu 4: `HashMap` vs `Hashtable`?

**Trả lời:**

- `HashMap`: Không synchronized, cho null key/value, **nhanh**
- `Hashtable`: Mọi method synchronized -- chậm, **legacy**, không nên dùng

Cần thread-safe -> dùng `ConcurrentHashMap`, không phải `Hashtable`.

### Câu 5: Load factor 0.75 nghĩa là gì?

**Trả lời:** Khi `size / capacity > 0.75`, HashMap resize. 0.75 là **trade-off**:

- Thấp hơn (0.5): ít collision, nhanh, **tốn memory**
- Cao hơn (1.0): tiết kiệm memory, **nhiều collision, chậm**

0.75 là balance tốt cho hầu hết case.
