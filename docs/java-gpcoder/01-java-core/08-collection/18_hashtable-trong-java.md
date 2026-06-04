---
sidebar_position: 18
title: "Hashtable trong Java"
---

# Hashtable trong Java

`Hashtable` là một trong những lớp collection lâu đời nhất trong Java, có mặt từ phiên bản 1.0. Nó lưu trữ dữ liệu theo cặp key-value tương tự `HashMap`, nhưng có những điểm khác biệt quan trọng.

## Đặc điểm của Hashtable

- **Thread-safe** (an toàn với đa luồng): tất cả các phương thức đều được đồng bộ hóa bằng `synchronized`.
- **Không cho phép `null`**: cả key lẫn value đều không được là `null` — ném `NullPointerException` nếu vi phạm.
- **Kế thừa từ `Dictionary`** (lớp cũ, đã lỗi thời), không phải từ `AbstractMap`.
- **Thứ tự không đảm bảo**: tương tự `HashMap`.

## Ví dụ cơ bản

```java
import java.util.Hashtable;
import java.util.Enumeration;

public class HashtableDemo {
    public static void main(String[] args) {
        Hashtable<String, Integer> table = new Hashtable<>();

        table.put("Java", 1);
        table.put("Python", 2);
        table.put("Go", 3);

        System.out.println("Kích thước: " + table.size()); // 3
        System.out.println("Lấy giá trị: " + table.get("Java")); // 1
        System.out.println("Chứa key 'Go'? " + table.containsKey("Go")); // true

        // Duyệt bằng Enumeration (cách cũ)
        Enumeration<String> keys = table.keys();
        while (keys.hasMoreElements()) {
            String key = keys.nextElement();
            System.out.println(key + " = " + table.get(key));
        }
    }
}
```

## Thử nghiệm với null

```java
Hashtable<String, String> table = new Hashtable<>();

// Cả hai dòng sau đều ném NullPointerException
try {
    table.put(null, "value"); // NullPointerException!
} catch (NullPointerException e) {
    System.out.println("Không cho phép null key");
}

try {
    table.put("key", null); // NullPointerException!
} catch (NullPointerException e) {
    System.out.println("Không cho phép null value");
}
```

## Hashtable trong môi trường đa luồng

Do tất cả phương thức đều `synchronized`, Hashtable an toàn khi nhiều luồng cùng truy cập:

```java
import java.util.Hashtable;

public class ThreadSafeDemo {
    public static void main(String[] args) throws InterruptedException {
        Hashtable<String, Integer> table = new Hashtable<>();

        Runnable task = () -> {
            for (int i = 0; i < 1000; i++) {
                String key = Thread.currentThread().getName() + "_" + i;
                table.put(key, i);
            }
        };

        Thread t1 = new Thread(task, "Thread-1");
        Thread t2 = new Thread(task, "Thread-2");
        t1.start();
        t2.start();
        t1.join();
        t2.join();

        System.out.println("Tổng phần tử: " + table.size()); // 2000
    }
}
```

## Các phương thức đặc trưng của Hashtable

| Phương thức | Mô tả |
|---|---|
| `put(key, value)` | Thêm hoặc cập nhật cặp key-value |
| `get(key)` | Lấy value theo key |
| `remove(key)` | Xóa entry theo key |
| `containsKey(key)` | Kiểm tra key tồn tại |
| `containsValue(value)` | Kiểm tra value tồn tại |
| `keys()` | Trả về `Enumeration` các key |
| `elements()` | Trả về `Enumeration` các value |
| `size()` | Số lượng phần tử |

## Lưu ý quan trọng

Trong các ứng dụng hiện đại, `Hashtable` ít được dùng vì:
1. Đồng bộ hóa toàn bộ phương thức gây giảm hiệu năng khi không cần thiết.
2. `ConcurrentHashMap` (từ Java 5) hiệu quả hơn nhiều cho môi trường đa luồng vì chỉ khóa một phần của bảng.
3. Nếu không cần đa luồng, `HashMap` nhanh hơn.

```java
// Thay thế hiện đại cho Hashtable
import java.util.concurrent.ConcurrentHashMap;

ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
// Thread-safe nhưng hiệu năng cao hơn Hashtable
```
