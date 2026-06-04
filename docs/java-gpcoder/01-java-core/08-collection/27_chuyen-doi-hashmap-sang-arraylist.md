---
sidebar_position: 27
title: "Chuyển đổi từ HashMap sang ArrayList"
---

# Chuyển đổi từ HashMap sang ArrayList

Trong thực tế, bạn thường cần chuyển dữ liệu từ `HashMap` sang `ArrayList` để duyệt có thứ tự, sắp xếp, hoặc truyền cho hàm cần `List`. Java cung cấp nhiều cách để làm điều này.

## Chuyển đổi danh sách key

Dùng `keySet()` để lấy tập hợp (Set) các key, sau đó tạo `ArrayList` từ đó:

```java
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MapToListKeys {
    public static void main(String[] args) {
        Map<String, Integer> scores = new HashMap<>();
        scores.put("Alice", 95);
        scores.put("Bob", 87);
        scores.put("Charlie", 92);

        // Lấy danh sách key
        List<String> names = new ArrayList<>(scores.keySet());
        System.out.println("Danh sách tên: " + names);
        // [Alice, Bob, Charlie] (thứ tự không xác định)
    }
}
```

## Chuyển đổi danh sách value

Dùng `values()` để lấy tập hợp các value:

```java
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MapToListValues {
    public static void main(String[] args) {
        Map<String, Integer> scores = new HashMap<>();
        scores.put("Alice", 95);
        scores.put("Bob", 87);
        scores.put("Charlie", 92);

        // Lấy danh sách value
        List<Integer> pointList = new ArrayList<>(scores.values());
        System.out.println("Danh sách điểm: " + pointList);
        // [95, 87, 92] (thứ tự không xác định)
    }
}
```

## Chuyển đổi danh sách Entry (cặp key-value)

Dùng `entrySet()` để lấy tập hợp các entry `Map.Entry<K, V>`:

```java
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MapToListEntries {
    public static void main(String[] args) {
        Map<String, Integer> scores = new HashMap<>();
        scores.put("Alice", 95);
        scores.put("Bob", 87);
        scores.put("Charlie", 92);

        // Lấy danh sách Entry
        List<Map.Entry<String, Integer>> entries = new ArrayList<>(scores.entrySet());

        for (Map.Entry<String, Integer> entry : entries) {
            System.out.println(entry.getKey() + " → " + entry.getValue());
        }
    }
}
```

## Sắp xếp sau khi chuyển đổi

Sau khi chuyển sang `ArrayList`, có thể sắp xếp dễ dàng:

```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SortAfterConvert {
    public static void main(String[] args) {
        Map<String, Integer> scores = new HashMap<>();
        scores.put("Alice", 95);
        scores.put("Bob", 87);
        scores.put("Charlie", 92);
        scores.put("Diana", 98);

        // Chuyển entries sang list rồi sắp xếp theo điểm giảm dần
        List<Map.Entry<String, Integer>> entries = new ArrayList<>(scores.entrySet());
        entries.sort((a, b) -> b.getValue() - a.getValue());

        System.out.println("Xếp hạng theo điểm:");
        for (int i = 0; i < entries.size(); i++) {
            System.out.println((i + 1) + ". " + entries.get(i).getKey()
                    + ": " + entries.get(i).getValue());
        }
        // 1. Diana: 98
        // 2. Alice: 95
        // 3. Charlie: 92
        // 4. Bob: 87
    }
}
```

## Dùng Stream API (Java 8+)

```java
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class MapToListStream {
    public static void main(String[] args) {
        Map<String, Integer> scores = new HashMap<>();
        scores.put("Alice", 95);
        scores.put("Bob", 87);
        scores.put("Charlie", 92);

        // Lọc và chuyển key có điểm >= 90 sang List
        List<String> highScorers = scores.entrySet().stream()
                .filter(e -> e.getValue() >= 90)
                .map(Map.Entry::getKey)
                .sorted()
                .collect(Collectors.toList());

        System.out.println("Điểm cao (>= 90): " + highScorers);
        // [Alice, Charlie]
    }
}
```

## Tóm tắt

| Mục tiêu | Phương thức HashMap | Kiểu kết quả |
|---|---|---|
| Lấy tất cả key | `map.keySet()` | `Set<K>` |
| Lấy tất cả value | `map.values()` | `Collection<V>` |
| Lấy tất cả cặp key-value | `map.entrySet()` | `Set<Map.Entry<K,V>>` |

Tất cả đều có thể truyền vào constructor của `ArrayList` để tạo list mới.
