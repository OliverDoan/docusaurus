---
sidebar_position: 14
title: "HashMap trong Java hoạt động như thế nào"
---

# HashMap trong Java hoạt động như thế nào

Hiểu cơ chế bên trong của `HashMap` giúp bạn sử dụng nó hiệu quả hơn và tránh các lỗi hiệu năng phổ biến.

## Cấu trúc nội tại: Array of Buckets

`HashMap` lưu trữ dữ liệu trong một **mảng các bucket** (thùng chứa). Mỗi bucket là một vị trí trong mảng, và mỗi vị trí có thể chứa một hoặc nhiều cặp key-value.

```
Mảng bucket:
[0] → null
[1] → Entry("name", "Java") → Entry("city", "HCM") → null
[2] → null
[3] → Entry("age", 25)
...
[n-1] → null
```

## Bước 1: Tính hash code

Khi bạn gọi `map.put(key, value)`, Java tính **hash code** (mã băm) của `key` bằng phương thức `hashCode()`. Hash code là một số nguyên đại diện cho đối tượng.

```java
String key = "name";
int hash = key.hashCode(); // ví dụ: 3373752
```

Java sau đó áp dụng thêm một phép biến đổi để phân tán đều hơn:

```java
// Mã nguồn rút gọn từ JDK
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```

## Bước 2: Tính chỉ số bucket (index)

Từ hash code, Java tính chỉ số bucket bằng phép AND:

```java
int index = hash & (capacity - 1);
// capacity là kích thước mảng (mặc định 16)
// Tương đương: hash % capacity (nhưng nhanh hơn)
```

## Bước 3: Lưu vào bucket (Collision handling)

Khi hai key khác nhau có cùng chỉ số bucket, xảy ra **collision** (va chạm). HashMap xử lý collision bằng cách nối chuỗi các Entry (node) trong cùng một bucket theo cấu trúc **linked list** (danh sách liên kết).

```
Trước khi có collision:
bucket[1] → Entry("name", "Java")

Sau khi "city" cũng rơi vào bucket[1] (collision):
bucket[1] → Entry("city", "HCM") → Entry("name", "Java") → null
```

## Bước 4: Treeify (từ Java 8)

Khi một bucket có **8 node trở lên** (ngưỡng `TREEIFY_THRESHOLD = 8`), linked list trong bucket đó được chuyển thành **Red-Black Tree** (cây đỏ-đen). Thao tác này gọi là **treeify** (cây hóa).

- Trước treeify: tìm kiếm trong bucket là O(n)
- Sau treeify: tìm kiếm trong bucket là O(log n)

Khi bucket thu nhỏ xuống còn 6 node (`UNTREEIFY_THRESHOLD = 6`), cây lại được chuyển về linked list.

```
bucket[1] sau treeify:
        Entry("d")
       /          \
  Entry("b")   Entry("f")
  /    \          /    \
Entry("a") Entry("c") Entry("e") Entry("g")
```

## Bước 5: Resize (tăng kích thước)

Khi tỷ lệ phần tử / capacity vượt quá **load factor** (hệ số tải, mặc định 0.75), HashMap tự động **resize** (tái cấp phát) — tăng capacity gấp đôi và phân phối lại toàn bộ phần tử.

```java
// capacity mặc định = 16, load factor = 0.75
// Resize xảy ra khi số phần tử > 16 * 0.75 = 12
HashMap<String, Integer> map = new HashMap<>(16, 0.75f);
```

Resize là thao tác tốn kém O(n). Nếu biết trước kích thước, hãy khai báo dung lượng ban đầu phù hợp:

```java
// Cần lưu ~100 phần tử → khai báo capacity = 100/0.75 ≈ 134
HashMap<String, Integer> map = new HashMap<>(134);
```

## Ví dụ tổng hợp

```java
import java.util.HashMap;
import java.util.Map;

public class HashMapInternals {
    public static void main(String[] args) {
        Map<String, Integer> scores = new HashMap<>();

        // put: tính hash("Alice") → chỉ số bucket → lưu Entry
        scores.put("Alice", 95);
        scores.put("Bob", 87);
        scores.put("Charlie", 92);

        // get: tính hash("Bob") → chỉ số bucket → duyệt bucket → so sánh key bằng equals()
        int bobScore = scores.get("Bob"); // 87
        System.out.println("Điểm của Bob: " + bobScore);

        // Kiểm tra collision: hai key có cùng bucket index
        // Java dùng equals() để phân biệt key trong cùng bucket
        scores.put("Alice", 99); // ghi đè vì "Alice".equals("Alice") == true
        System.out.println("Điểm mới của Alice: " + scores.get("Alice")); // 99
    }
}
```

## Tóm tắt luồng hoạt động

```
put(key, value):
  1. hash = hash(key)
  2. index = hash & (capacity - 1)
  3. Nếu bucket[index] rỗng → tạo Entry mới
  4. Nếu bucket[index] có Entry với key.equals(existingKey) → cập nhật value
  5. Nếu collision → thêm vào đầu linked list
  6. Nếu bucket.size >= 8 → treeify
  7. Nếu size > capacity * loadFactor → resize
```

## Điều kiện để dùng object làm key

Khi dùng custom object làm key trong HashMap, bắt buộc phải override cả hai phương thức:
- `hashCode()`: đảm bảo hai object bằng nhau có cùng hash code.
- `equals()`: đảm bảo so sánh đúng khi xảy ra collision.

```java
public class Student {
    private int id;
    private String name;

    @Override
    public int hashCode() {
        return Integer.hashCode(id);
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof Student)) return false;
        Student other = (Student) obj;
        return this.id == other.id;
    }
}
```
