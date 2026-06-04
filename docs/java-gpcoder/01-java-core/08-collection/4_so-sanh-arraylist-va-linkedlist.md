---
sidebar_position: 4
title: "So sánh ArrayList và LinkedList trong Java"
---

# So sánh ArrayList và LinkedList trong Java

`ArrayList` và `LinkedList` đều là hai cài đặt (implementation) phổ biến của `List` interface trong Java. Dù cùng lưu trữ danh sách phần tử có thứ tự, chúng có cấu trúc nội tại và hiệu năng rất khác nhau.

## Cấu trúc bộ nhớ

- **ArrayList**: Sử dụng mảng động (dynamic array) bên trong. Các phần tử nằm liên tiếp nhau trong bộ nhớ.
- **LinkedList**: Sử dụng danh sách liên kết đôi (doubly linked list). Mỗi phần tử (node – nút) chứa dữ liệu và hai con trỏ trỏ tới nút trước và nút sau.

## So sánh hiệu năng

| Thao tác | ArrayList | LinkedList |
|---|---|---|
| Truy cập theo chỉ số `get(i)` | O(1) – rất nhanh | O(n) – phải duyệt từ đầu |
| Thêm vào cuối `add(e)` | O(1) amortized | O(1) |
| Thêm vào đầu/giữa `add(i, e)` | O(n) – phải dịch chuyển phần tử | O(1) sau khi tìm vị trí |
| Xóa theo chỉ số `remove(i)` | O(n) – phải dịch chuyển phần tử | O(1) sau khi tìm vị trí |
| Tìm kiếm `contains(e)` | O(n) | O(n) |
| Bộ nhớ tiêu thụ | Thấp hơn | Cao hơn (lưu thêm 2 con trỏ mỗi nút) |

> **amortized**: Chi phí trung bình theo thời gian. Khi mảng đầy, ArrayList cấp phát mảng mới gấp đôi (O(n) một lần), nhưng tính trung bình vẫn là O(1).

## Ví dụ minh họa

```java
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public class CompareListDemo {
    public static void main(String[] args) {
        // ArrayList - phù hợp truy cập ngẫu nhiên
        List<String> arrayList = new ArrayList<>();
        arrayList.add("Java");
        arrayList.add("Python");
        arrayList.add("C++");
        System.out.println("ArrayList get(1): " + arrayList.get(1)); // Python

        // LinkedList - phù hợp thêm/xóa ở đầu/giữa
        List<String> linkedList = new LinkedList<>();
        linkedList.add("Java");
        linkedList.add("Python");
        linkedList.add(0, "C++"); // thêm vào đầu - hiệu quả hơn ArrayList
        System.out.println("LinkedList: " + linkedList); // [C++, Java, Python]
    }
}
```

## Khi nào dùng cái nào?

**Dùng `ArrayList` khi:**
- Thường xuyên truy cập phần tử theo chỉ số (index).
- Chủ yếu thêm/xóa ở cuối danh sách.
- Cần tiết kiệm bộ nhớ.
- Đây là lựa chọn mặc định trong hầu hết trường hợp.

**Dùng `LinkedList` khi:**
- Thường xuyên thêm/xóa phần tử ở đầu hoặc giữa danh sách.
- Cần sử dụng như một hàng đợi (Queue) hoặc ngăn xếp (Stack) thông qua các phương thức `addFirst()`, `addLast()`, `removeFirst()`, `removeLast()`.

## Ví dụ LinkedList làm Queue (hàng đợi)

```java
import java.util.LinkedList;
import java.util.Queue;

public class LinkedListAsQueue {
    public static void main(String[] args) {
        Queue<String> queue = new LinkedList<>();
        queue.offer("Yêu cầu 1"); // thêm vào cuối hàng đợi
        queue.offer("Yêu cầu 2");
        queue.offer("Yêu cầu 3");

        // poll() lấy và xóa phần tử đầu hàng đợi
        System.out.println("Xử lý: " + queue.poll()); // Yêu cầu 1
        System.out.println("Còn lại: " + queue);       // [Yêu cầu 2, Yêu cầu 3]
    }
}
```

## Tóm tắt

- `ArrayList` ưu việt hơn về truy cập ngẫu nhiên và tiết kiệm bộ nhớ.
- `LinkedList` ưu việt hơn về thêm/xóa ở đầu/giữa danh sách và hỗ trợ thêm các cấu trúc dữ liệu như Queue, Deque.
- Trong thực tế, `ArrayList` được dùng nhiều hơn vì phần lớn ứng dụng đọc dữ liệu nhiều hơn ghi.
