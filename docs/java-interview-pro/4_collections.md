---
sidebar_position: 4
title: "4. Collections"
---

# Collections

> *Java Collections Framework là bộ khung dữ liệu chuẩn — nắm vững sự khác biệt giữa các cấu trúc là chìa khoá vượt qua phỏng vấn kỹ thuật.*

---

## Câu 1: HashSet và TreeSet khác nhau thế nào? `[Basic]`

### Câu hỏi

> *"Bạn sẽ chọn HashSet hay TreeSet trong trường hợp nào? Sự khác biệt chính giữa chúng là gì?"*

### Giải thích lý thuyết

Cả hai đều implement interface `Set` (tập hợp không chứa phần tử trùng lặp), nhưng khác nhau về cơ chế lưu trữ và hiệu năng:

- **HashSet**: Dùng bảng băm (hash table) bên trong, thứ tự phần tử **không đảm bảo**. Phép thêm/xoá/tìm kiếm đạt `O(1)` trung bình. Cho phép một giá trị `null`.
- **TreeSet**: Dùng cây đỏ-đen (Red-Black Tree) bên trong, phần tử luôn được **sắp xếp theo thứ tự tự nhiên** (natural ordering) hoặc theo `Comparator` do người dùng cung cấp. Phép thêm/xoá/tìm kiếm đạt `O(log n)`. Không cho phép `null`.

| Tiêu chí | HashSet | TreeSet |
|---|---|---|
| Thứ tự | Không đảm bảo | Sắp xếp tăng dần |
| Hiệu năng | O(1) | O(log n) |
| Cho phép null | Có (1 phần tử) | Không |
| Cấu trúc bên trong | Hash Table | Red-Black Tree |

### Code minh hoạ

```java
import java.util.HashSet;
import java.util.TreeSet;
import java.util.Set;

public class SetComparison {
    public static void main(String[] args) {
        // HashSet - thứ tự không đảm bảo
        Set<String> hashSet = new HashSet<>();
        hashSet.add("Chuối");
        hashSet.add("Táo");
        hashSet.add("Xoài");
        hashSet.add("Táo"); // trùng lặp, bị bỏ qua
        System.out.println("HashSet: " + hashSet); // thứ tự bất kỳ

        // TreeSet - tự động sắp xếp theo alphabet
        Set<String> treeSet = new TreeSet<>();
        treeSet.add("Chuối");
        treeSet.add("Táo");
        treeSet.add("Xoài");
        System.out.println("TreeSet: " + treeSet); // [Chuối, Táo, Xoài] - sắp xếp
    }
}
```

### Đáp án mẫu

> "HashSet và TreeSet đều là tập hợp không trùng lặp, nhưng HashSet dùng hash table nên truy cập O(1) và không đảm bảo thứ tự, còn TreeSet dùng cây đỏ-đen nên luôn sắp xếp tăng dần với chi phí O(log n). Tôi dùng HashSet khi cần tốc độ và không quan tâm thứ tự, còn TreeSet khi cần duyệt dữ liệu theo thứ tự hoặc dùng các phép như `first()`, `last()`, `headSet()`."

---

## Câu 2: HashMap và TreeMap khác nhau thế nào? `[Intermediate]`

### Câu hỏi

> *"Khi nào bạn chọn TreeMap thay vì HashMap? Hãy so sánh hai cấu trúc này."*

### Giải thích lý thuyết

Cả hai đều implement interface `Map` (ánh xạ khoá-giá trị, key-value), nhưng:

- **HashMap**: Dùng hash table, cho phép một khoá `null` và nhiều giá trị `null`. Truy cập `O(1)` trung bình. Thứ tự không đảm bảo.
- **TreeMap**: Dùng Red-Black Tree, các khoá luôn được **sắp xếp** theo natural ordering hoặc `Comparator`. Truy cập `O(log n)`. Không cho phép khoá `null`.
- **LinkedHashMap**: Biến thể của HashMap, duy trì thứ tự **chèn** (insertion order).

| Tiêu chí | HashMap | TreeMap | LinkedHashMap |
|---|---|---|---|
| Thứ tự khoá | Không | Sắp xếp | Thứ tự chèn |
| Hiệu năng | O(1) | O(log n) | O(1) |
| Khoá null | Cho phép | Không | Cho phép |

### Code minh hoạ

```java
import java.util.HashMap;
import java.util.TreeMap;
import java.util.Map;

public class MapComparison {
    public static void main(String[] args) {
        // HashMap - thứ tự không đảm bảo
        Map<String, Integer> hashMap = new HashMap<>();
        hashMap.put("Banana", 3);
        hashMap.put("Apple", 1);
        hashMap.put("Cherry", 2);
        System.out.println("HashMap: " + hashMap); // thứ tự bất kỳ

        // TreeMap - khoá sắp xếp theo alphabet
        Map<String, Integer> treeMap = new TreeMap<>();
        treeMap.put("Banana", 3);
        treeMap.put("Apple", 1);
        treeMap.put("Cherry", 2);
        System.out.println("TreeMap: " + treeMap); // {Apple=1, Banana=3, Cherry=2}

        // Tính năng đặc biệt của TreeMap
        TreeMap<String, Integer> sorted = new TreeMap<>(treeMap);
        System.out.println("Khoá nhỏ nhất: " + sorted.firstKey()); // Apple
        System.out.println("Khoá lớn nhất: " + sorted.lastKey());  // Cherry
        System.out.println("Các khoá <= B: " + sorted.headMap("B")); // {Apple=1}
    }
}
```

### Đáp án mẫu

> "HashMap dùng hash table, truy cập O(1) nhưng không đảm bảo thứ tự khoá, còn TreeMap dùng cây đỏ-đen nên khoá luôn sắp xếp tăng dần với chi phí O(log n). Tôi chọn HashMap cho hầu hết trường hợp vì hiệu năng cao hơn, chọn TreeMap khi cần duyệt khoá theo thứ tự hoặc cần các phép như `headMap()`, `tailMap()`, `floorKey()`."

---

## Câu 3: HashSet và HashMap khác nhau thế nào? `[Basic]`

### Câu hỏi

> *"HashSet và HashMap có mối liên hệ gì không? Chúng khác nhau ra sao?"*

### Giải thích lý thuyết

Điểm thú vị là **HashSet được implement bên trong bằng HashMap** trong Java. Mỗi phần tử của HashSet thực ra là một khoá trong HashMap nội bộ, còn giá trị là một đối tượng dummy (giả) dùng chung.

- **HashMap**: Lưu cặp khoá-giá trị (`key-value`). Truy cập giá trị qua khoá. Cho phép nhiều giá trị `null`.
- **HashSet**: Chỉ lưu giá trị (các phần tử độc nhất). Không có khái niệm khoá. Thực chất là `HashMap<E, Object>`.

| Tiêu chí | HashMap | HashSet |
|---|---|---|
| Interface | Map | Set |
| Lưu trữ | Key-Value pair | Chỉ phần tử |
| Trùng lặp | Khoá không trùng | Phần tử không trùng |
| Phương thức thêm | `put(key, value)` | `add(element)` |
| Hiệu năng | O(1) | O(1) |

### Code minh hoạ

```java
import java.util.HashMap;
import java.util.HashSet;

public class HashSetVsHashMap {
    public static void main(String[] args) {
        // HashMap - lưu cặp khoá-giá trị
        HashMap<String, Integer> map = new HashMap<>();
        map.put("Alice", 25);   // khoá: "Alice", giá trị: 25
        map.put("Bob", 30);
        System.out.println("Tuổi Alice: " + map.get("Alice")); // 25

        // HashSet - chỉ lưu phần tử, không có giá trị đi kèm
        HashSet<String> set = new HashSet<>();
        set.add("Alice");
        set.add("Bob");
        set.add("Alice"); // trùng - bị bỏ qua
        System.out.println("Set chứa Alice: " + set.contains("Alice")); // true
        System.out.println("Kích thước set: " + set.size()); // 2
    }
}
```

### Đáp án mẫu

> "HashMap lưu cặp khoá-giá trị còn HashSet chỉ lưu tập hợp phần tử không trùng lặp. Thực ra HashSet được implement bên trong bằng HashMap — mỗi phần tử là một khoá trong HashMap với giá trị là đối tượng dummy. Tôi dùng HashMap khi cần tra cứu giá trị qua khoá, và HashSet khi chỉ cần kiểm tra sự tồn tại của phần tử."

---

## Câu 4: ArrayList và LinkedList khác nhau thế nào? `[Basic]`

### Câu hỏi

> *"Bạn sẽ chọn ArrayList hay LinkedList khi nào? Hãy so sánh hiệu năng của chúng."*

### Giải thích lý thuyết

Cả hai đều implement interface `List` (danh sách có thứ tự, cho phép trùng lặp), nhưng cấu trúc bên trong khác nhau hoàn toàn:

- **ArrayList**: Dùng mảng động (dynamic array). Truy cập ngẫu nhiên `O(1)`. Chèn/xoá ở giữa `O(n)` vì phải dịch chuyển phần tử.
- **LinkedList**: Dùng danh sách liên kết đôi (doubly linked list). Truy cập ngẫu nhiên `O(n)`. Chèn/xoá ở đầu/cuối `O(1)`. Cũng implement `Deque` (double-ended queue).

| Thao tác | ArrayList | LinkedList |
|---|---|---|
| Truy cập theo chỉ số `get(i)` | O(1) | O(n) |
| Thêm vào cuối `add(e)` | O(1) amortized | O(1) |
| Chèn vào giữa `add(i, e)` | O(n) | O(n) tìm + O(1) chèn |
| Xoá ở đầu `remove(0)` | O(n) | O(1) |
| Bộ nhớ | Ít hơn | Nhiều hơn (lưu con trỏ prev/next) |

### Code minh hoạ

```java
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public class ListComparison {
    public static void main(String[] args) {
        // ArrayList - tốt cho truy cập ngẫu nhiên
        List<String> arrayList = new ArrayList<>();
        arrayList.add("A");
        arrayList.add("B");
        arrayList.add("C");
        System.out.println("ArrayList get(1): " + arrayList.get(1)); // B - O(1)

        // LinkedList - tốt cho chèn/xoá ở đầu/cuối
        LinkedList<String> linkedList = new LinkedList<>();
        linkedList.add("A");
        linkedList.add("B");
        linkedList.addFirst("Z"); // O(1) - thêm vào đầu
        linkedList.addLast("Y");  // O(1) - thêm vào cuối
        System.out.println("LinkedList: " + linkedList); // [Z, A, B, Y]

        // LinkedList dùng như Queue (hàng đợi) hoặc Stack (ngăn xếp)
        linkedList.offer("X"); // thêm vào cuối - Queue
        System.out.println("Poll: " + linkedList.poll()); // lấy từ đầu - Queue
    }
}
```

### Đáp án mẫu

> "ArrayList dùng mảng động nên truy cập theo chỉ số O(1) nhưng chèn/xoá ở giữa tốn O(n). LinkedList dùng danh sách liên kết đôi nên chèn/xoá ở đầu/cuối O(1) nhưng truy cập ngẫu nhiên O(n). Trong thực tế tôi thường dùng ArrayList vì cache-friendly hơn; chỉ chọn LinkedList khi cần thường xuyên chèn/xoá ở đầu danh sách hoặc dùng như Queue/Deque."

---

## Câu 5: Iterator interface là gì và tại sao nên dùng? `[Basic]`

### Câu hỏi

> *"Iterator trong Java là gì? Tại sao nên dùng Iterator thay vì vòng lặp for thông thường?"*

### Giải thích lý thuyết

**Iterator** (bộ lặp) là một interface trong `java.util` cho phép duyệt tuần tự qua các phần tử của collection mà **không cần biết cấu trúc bên trong** của nó. Iterator có 3 phương thức chính:

- `hasNext()`: Kiểm tra còn phần tử tiếp theo không.
- `next()`: Trả về phần tử tiếp theo.
- `remove()`: Xoá phần tử hiện tại an toàn trong khi duyệt.

**Lý do nên dùng Iterator**:
1. **Xoá phần tử an toàn khi đang duyệt**: Dùng `iterator.remove()` thay vì `collection.remove()` tránh `ConcurrentModificationException`.
2. **Tính trừu tượng (abstraction)**: Code không phụ thuộc vào loại collection cụ thể.
3. **Hỗ trợ for-each**: Lớp implement `Iterable` được dùng trong vòng lặp for-each.

### Code minh hoạ

```java
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class IteratorDemo {
    public static void main(String[] args) {
        List<Integer> numbers = new ArrayList<>();
        numbers.add(1);
        numbers.add(2);
        numbers.add(3);
        numbers.add(4);
        numbers.add(5);

        // Cách SAI: xoá khi đang dùng for-each -> ConcurrentModificationException
        // for (Integer n : numbers) {
        //     if (n % 2 == 0) numbers.remove(n); // LỖI!
        // }

        // Cách ĐÚNG: dùng Iterator để xoá an toàn
        Iterator<Integer> iterator = numbers.iterator();
        while (iterator.hasNext()) {
            Integer n = iterator.next();
            if (n % 2 == 0) {
                iterator.remove(); // xoá an toàn trong khi duyệt
            }
        }
        System.out.println("Sau khi xoá số chẵn: " + numbers); // [1, 3, 5]

        // For-each cũng dùng Iterator bên trong (ngầm định)
        for (Integer n : numbers) {
            System.out.print(n + " "); // 1 3 5
        }
    }
}
```

### Đáp án mẫu

> "Iterator là interface cho phép duyệt tuần tự qua collection mà không cần biết cấu trúc bên trong. Lý do quan trọng nhất để dùng Iterator là an toàn khi xoá phần tử trong lúc duyệt — nếu dùng `collection.remove()` trong for-each sẽ bị `ConcurrentModificationException`, còn `iterator.remove()` thì không. For-each thực ra chỉ là cú pháp ngắn gọn của Iterator."

---

## Câu 6: Fail-fast và fail-safe iterator khác nhau thế nào? `[Advanced]`

### Câu hỏi

> *"Bạn có thể giải thích fail-fast và fail-safe iterator là gì không? Cho ví dụ cụ thể."*

### Giải thích lý thuyết

Hai khái niệm này liên quan đến hành vi của iterator khi collection bị **sửa đổi trong lúc đang duyệt** (concurrent modification).

- **Fail-fast iterator**: Phát hiện ngay lập tức khi collection bị thay đổi bởi luồng khác (hoặc cùng luồng không qua iterator). Ném `ConcurrentModificationException` ngay lập tức. Hoạt động bằng cách kiểm tra **modCount** (đếm số lần sửa đổi). Ví dụ: `ArrayList`, `HashMap`, `HashSet`.

- **Fail-safe iterator**: Duyệt trên **bản sao** (snapshot) của collection tại thời điểm tạo iterator, nên không ném exception khi collection gốc bị thay đổi. Nhược điểm là không phản ánh thay đổi mới nhất. Ví dụ: `CopyOnWriteArrayList`, `ConcurrentHashMap`.

| Tiêu chí | Fail-fast | Fail-safe |
|---|---|---|
| Phản ứng khi sửa đổi | Ném ConcurrentModificationException | Không ném exception |
| Duyệt trên | Collection gốc | Bản sao (snapshot) |
| Ví dụ | ArrayList, HashMap | CopyOnWriteArrayList, ConcurrentHashMap |
| Hiệu năng bộ nhớ | Tốt hơn | Tốn bộ nhớ hơn (cần copy) |

### Code minh hoạ

```java
import java.util.ArrayList;
import java.util.Iterator;
import java.util.concurrent.CopyOnWriteArrayList;

public class IteratorTypes {
    public static void main(String[] args) {
        // Fail-fast: ArrayList iterator
        ArrayList<String> failFastList = new ArrayList<>();
        failFastList.add("A");
        failFastList.add("B");
        failFastList.add("C");

        Iterator<String> failFastIt = failFastList.iterator();
        failFastList.add("D"); // sửa đổi collection sau khi lấy iterator

        try {
            while (failFastIt.hasNext()) {
                System.out.println(failFastIt.next()); // ném ConcurrentModificationException
            }
        } catch (java.util.ConcurrentModificationException e) {
            System.out.println("Fail-fast: Phát hiện sửa đổi! " + e.getClass().getSimpleName());
        }

        // Fail-safe: CopyOnWriteArrayList iterator
        CopyOnWriteArrayList<String> failSafeList = new CopyOnWriteArrayList<>();
        failSafeList.add("X");
        failSafeList.add("Y");
        failSafeList.add("Z");

        Iterator<String> failSafeIt = failSafeList.iterator(); // snapshot tại đây
        failSafeList.add("W"); // thêm vào collection gốc

        System.out.println("Fail-safe duyệt snapshot cũ:");
        while (failSafeIt.hasNext()) {
            System.out.print(failSafeIt.next() + " "); // X Y Z (không thấy W)
        }
        System.out.println("\nCollection gốc: " + failSafeList); // [X, Y, Z, W]
    }
}
```

### Đáp án mẫu

> "Fail-fast iterator duyệt trực tiếp trên collection gốc và ném `ConcurrentModificationException` ngay khi phát hiện có sửa đổi bên ngoài — đây là hành vi của `ArrayList`, `HashMap`. Fail-safe iterator duyệt trên bản sao tại thời điểm tạo iterator nên không bao giờ ném exception, nhưng không thấy thay đổi mới — đây là hành vi của `CopyOnWriteArrayList`, `ConcurrentHashMap`. Trong môi trường đa luồng tôi ưu tiên dùng các collection concurrent thay vì cố dùng fail-fast với synchronized."

---

## Câu 7: Comparable và Comparator khác nhau thế nào? `[Intermediate]`

### Câu hỏi

> *"Bạn sẽ dùng Comparable hay Comparator khi cần sắp xếp đối tượng tự định nghĩa? Khi nào dùng cái nào?"*

### Giải thích lý thuyết

Cả hai dùng để định nghĩa thứ tự sắp xếp (ordering) cho đối tượng, nhưng khác nhau về cách tiếp cận:

- **Comparable** (`java.lang`): Interface được implement **bởi chính class** cần sắp xếp. Định nghĩa thứ tự "tự nhiên" (natural ordering) qua phương thức `compareTo(T other)`. Chỉ có **một cách sắp xếp**.
- **Comparator** (`java.util`): Interface bên ngoài, có thể tạo **nhiều Comparator khác nhau** cho cùng một class. Phương thức `compare(T o1, T o2)`. Linh hoạt hơn, hỗ trợ lambda từ Java 8.

| Tiêu chí | Comparable | Comparator |
|---|---|---|
| Implement bởi | Chính class đó | Class ngoài / Lambda |
| Phương thức | `compareTo(T o)` | `compare(T o1, T o2)` |
| Số cách sắp xếp | 1 (natural ordering) | Nhiều |
| Sửa source code gốc | Bắt buộc | Không cần |
| Package | `java.lang` | `java.util` |

### Code minh hoạ

```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

// Comparable: class tự định nghĩa thứ tự tự nhiên (theo tên)
class SinhVien implements Comparable<SinhVien> {
    String ten;
    double gpa;

    SinhVien(String ten, double gpa) {
        this.ten = ten;
        this.gpa = gpa;
    }

    @Override
    public int compareTo(SinhVien other) {
        return this.ten.compareTo(other.ten); // sắp xếp theo tên (natural ordering)
    }

    @Override
    public String toString() {
        return ten + "(" + gpa + ")";
    }
}

public class SortingDemo {
    public static void main(String[] args) {
        List<SinhVien> ds = new ArrayList<>();
        ds.add(new SinhVien("Minh", 3.5));
        ds.add(new SinhVien("An", 3.8));
        ds.add(new SinhVien("Hoa", 3.2));

        // Dùng Comparable - sắp xếp theo tên (natural ordering)
        Collections.sort(ds);
        System.out.println("Sắp xếp theo tên: " + ds);
        // [An(3.8), Hoa(3.2), Minh(3.5)]

        // Dùng Comparator - sắp xếp theo GPA (linh hoạt, không sửa class)
        Comparator<SinhVien> theoGpa = Comparator.comparingDouble(sv -> sv.gpa);
        ds.sort(theoGpa.reversed()); // GPA cao nhất lên đầu
        System.out.println("Sắp xếp theo GPA giảm dần: " + ds);
        // [An(3.8), Minh(3.5), Hoa(3.2)]

        // Comparator với lambda - sắp xếp nhiều tiêu chí
        ds.sort(Comparator.comparing((SinhVien sv) -> sv.ten)
                          .thenComparingDouble(sv -> sv.gpa));
        System.out.println("Sắp xếp theo tên rồi GPA: " + ds);
    }
}
```

### Đáp án mẫu

> "`Comparable` cho phép class tự định nghĩa thứ tự tự nhiên qua `compareTo()` — chỉ có một cách sắp xếp và phải sửa source code của class. `Comparator` là đối tượng ngoài định nghĩa cách sắp xếp riêng — có thể tạo nhiều Comparator cho cùng một class mà không cần sửa class đó. Tôi implement `Comparable` khi có một thứ tự tự nhiên rõ ràng (ví dụ sinh viên theo tên), và dùng `Comparator` khi cần sắp xếp theo nhiều tiêu chí khác nhau hoặc khi không thể sửa class gốc."

---

## Câu 8: Queue interface là gì và khi nào nên dùng? `[Intermediate]`

### Câu hỏi

> *"Bạn có thể giải thích Queue interface trong Java không? Sự khác biệt giữa `offer()`, `add()`, `poll()`, `remove()` là gì?"*

### Giải thích lý thuyết

**Queue** (hàng đợi) là interface trong `java.util` đại diện cho cấu trúc dữ liệu FIFO (First In, First Out — vào trước ra trước). Queue có hai nhóm phương thức với hành vi khác nhau khi thất bại:

| Thao tác | Ném exception | Trả về null/false |
|---|---|---|
| Thêm vào cuối | `add(e)` | `offer(e)` |
| Lấy và xoá đầu | `remove()` | `poll()` |
| Chỉ xem đầu | `element()` | `peek()` |

**Các implementation phổ biến**:
- `LinkedList`: Queue đơn giản, cho phép `null`.
- `ArrayDeque`: Hiệu năng cao hơn, không cho phép `null`, implement cả `Deque`.
- `PriorityQueue`: Hàng đợi ưu tiên (priority queue), phần tử được lấy ra theo thứ tự ưu tiên thay vì FIFO.

### Code minh hoạu

```java
import java.util.ArrayDeque;
import java.util.LinkedList;
import java.util.PriorityQueue;
import java.util.Queue;

public class QueueDemo {
    public static void main(String[] args) {
        // Queue thông thường với LinkedList (FIFO)
        Queue<String> queue = new LinkedList<>();
        queue.offer("Khách 1"); // thêm an toàn (trả false nếu đầy)
        queue.offer("Khách 2");
        queue.offer("Khách 3");

        System.out.println("Người đứng đầu: " + queue.peek()); // Khách 1 (không xoá)
        System.out.println("Phục vụ: " + queue.poll());         // Khách 1 (xoá)
        System.out.println("Còn lại: " + queue);                // [Khách 2, Khách 3]

        // ArrayDeque - hiệu năng cao hơn LinkedList
        Queue<Integer> deque = new ArrayDeque<>();
        deque.offer(10);
        deque.offer(20);
        System.out.println("ArrayDeque poll: " + deque.poll()); // 10

        // PriorityQueue - lấy phần tử nhỏ nhất trước (min-heap mặc định)
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        pq.offer(5);
        pq.offer(1);
        pq.offer(3);
        System.out.println("PriorityQueue poll: " + pq.poll()); // 1 (nhỏ nhất)
        System.out.println("PriorityQueue poll: " + pq.poll()); // 3
        System.out.println("PriorityQueue poll: " + pq.poll()); // 5
    }
}
```

### Đáp án mẫu

> "Queue là interface FIFO trong Java với hai nhóm phương thức: `add/remove/element` ném exception khi thất bại, còn `offer/poll/peek` trả về null hoặc false — tôi luôn ưu tiên nhóm sau để tránh exception không mong muốn. Tôi dùng `ArrayDeque` cho queue thông thường vì nhanh hơn `LinkedList`, dùng `PriorityQueue` khi cần lấy phần tử theo mức độ ưu tiên (ví dụ xử lý task quan trọng trước)."

---

## Câu 9: ConcurrentHashMap khác Hashtable thế nào? `[Advanced]`

### Câu hỏi

> *"Trong môi trường đa luồng, bạn sẽ dùng Hashtable, synchronized HashMap, hay ConcurrentHashMap? Tại sao?"*

### Giải thích lý thuyết

Cả ba đều thread-safe, nhưng cơ chế khóa khác nhau, dẫn đến hiệu năng rất khác nhau:

- **Hashtable**: Đồng bộ hóa toàn bộ (lock toàn bộ object) trên **mọi thao tác**. Rất chậm trong môi trường đa luồng. Không cho phép khoá hoặc giá trị `null`. Legacy class, không khuyến khích dùng.
- **Collections.synchronizedMap(HashMap)**: Cũng lock toàn bộ object, tương tự Hashtable. Không khuyến khích.
- **ConcurrentHashMap**: Dùng **segment locking** (Java 7) hoặc **CAS + bucket-level locking** (Java 8+). Cho phép nhiều luồng đọc đồng thời và ghi trên các bucket khác nhau cùng lúc. Không cho phép khoá hoặc giá trị `null`. Hiệu năng cao hơn nhiều.

| Tiêu chí | Hashtable | synchronizedMap | ConcurrentHashMap |
|---|---|---|---|
| Thread-safe | Có | Có | Có |
| Cơ chế lock | Toàn object | Toàn object | Bucket-level |
| Cho phép null | Không | Phụ thuộc Map gốc | Không |
| Hiệu năng đọc song song | Kém | Kém | Tốt |
| Khuyến khích | Không | Không | Có |

### Code minh hoạu

```java
import java.util.Collections;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class ConcurrentMapDemo {
    public static void main(String[] args) throws InterruptedException {
        // ConcurrentHashMap - thread-safe với hiệu năng cao
        ConcurrentHashMap<String, Integer> concurrentMap = new ConcurrentHashMap<>();

        // Thêm dữ liệu từ nhiều luồng đồng thời
        Runnable task = () -> {
            for (int i = 0; i < 1000; i++) {
                // merge() là thao tác nguyên tử (atomic)
                concurrentMap.merge(Thread.currentThread().getName(), 1, Integer::sum);
            }
        };

        Thread t1 = new Thread(task, "Luong-1");
        Thread t2 = new Thread(task, "Luong-2");
        t1.start();
        t2.start();
        t1.join();
        t2.join();

        System.out.println("Kết quả: " + concurrentMap);

        // Thao tác nguyên tử của ConcurrentHashMap
        ConcurrentHashMap<String, Integer> cache = new ConcurrentHashMap<>();
        // putIfAbsent: chỉ thêm nếu khoá chưa tồn tại (nguyên tử)
        cache.putIfAbsent("user:1", 100);
        cache.putIfAbsent("user:1", 200); // bị bỏ qua vì đã tồn tại
        System.out.println("Cache: " + cache); // {user:1=100}

        // computeIfAbsent: khởi tạo lazy (nguyên tử)
        cache.computeIfAbsent("user:2", key -> loadFromDatabase(key));
    }

    static int loadFromDatabase(String key) {
        return 42; // giả lập truy vấn database
    }
}
```

### Đáp án mẫu

> "`Hashtable` và `synchronizedMap` khóa toàn bộ object nên mọi thao tác phải chờ nhau — rất kém hiệu năng trong môi trường đa luồng. `ConcurrentHashMap` dùng khóa ở cấp độ bucket (Java 8+) nên nhiều luồng có thể đọc và ghi trên các phần khác nhau của map cùng lúc, hiệu năng tốt hơn rất nhiều. Trong thực tế tôi luôn dùng `ConcurrentHashMap` và tận dụng các phương thức nguyên tử như `putIfAbsent()`, `computeIfAbsent()`, `merge()` thay vì dùng `Hashtable`."

---

## Câu 10: `equals()` và `hashCode()` — vì sao phải override cùng nhau? `[Intermediate]`

### Câu hỏi

> *"Tại sao khi override `equals()` bạn bắt buộc phải override `hashCode()` cùng lúc? Điều gì xảy ra nếu không làm vậy?"*

### Giải thích lý thuyết

Đây là **contract** (hợp đồng) quan trọng trong Java:

1. Nếu `a.equals(b)` trả về `true` thì `a.hashCode()` **phải bằng** `b.hashCode()`.
2. Nếu `a.hashCode() == b.hashCode()` thì `a.equals(b)` **không nhất thiết** phải là `true` (collision chấp nhận được).

**Vì sao quan trọng với Collections?**

Các collection dựa trên hash (như `HashMap`, `HashSet`) hoạt động theo hai bước:
1. Tính `hashCode()` để xác định **bucket** (ngăn) lưu trữ.
2. Dùng `equals()` để so sánh chính xác trong bucket đó.

Nếu override `equals()` mà không override `hashCode()`:
- Hai đối tượng "bằng nhau" theo `equals()` sẽ có `hashCode()` khác nhau (mặc định dùng địa chỉ bộ nhớ).
- `HashMap`/`HashSet` sẽ tìm ở hai bucket khác nhau, dẫn đến **không tìm được phần tử** hoặc **lưu trùng lặp**.

### Code minh hoạu

```java
import java.util.HashMap;
import java.util.HashSet;
import java.util.Objects;

class SinhVienSai {
    String mssv;

    SinhVienSai(String mssv) { this.mssv = mssv; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SinhVienSai)) return false;
        return mssv.equals(((SinhVienSai) o).mssv);
        // KHÔNG override hashCode -> LỖI LOGIC!
    }
}

class SinhVienDung {
    String mssv;

    SinhVienDung(String mssv) { this.mssv = mssv; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SinhVienDung)) return false;
        return mssv.equals(((SinhVienDung) o).mssv);
    }

    @Override
    public int hashCode() {
        return Objects.hash(mssv); // PHẢI override cùng với equals
    }
}

public class EqualsHashCodeDemo {
    public static void main(String[] args) {
        // Trường hợp SAI: override equals nhưng không override hashCode
        HashSet<SinhVienSai> setSai = new HashSet<>();
        setSai.add(new SinhVienSai("SV001"));
        // Tạo đối tượng mới cùng mssv - theo equals() thì "bằng nhau"
        boolean foundSai = setSai.contains(new SinhVienSai("SV001"));
        System.out.println("Tìm thấy (SAI): " + foundSai); // FALSE - lỗi logic!

        // Trường hợp ĐÚNG: override cả hai
        HashSet<SinhVienDung> setDung = new HashSet<>();
        setDung.add(new SinhVienDung("SV001"));
        boolean foundDung = setDung.contains(new SinhVienDung("SV001"));
        System.out.println("Tìm thấy (ĐÚNG): " + foundDung); // TRUE - đúng!

        // HashMap cũng bị ảnh hưởng tương tự
        HashMap<SinhVienDung, String> map = new HashMap<>();
        SinhVienDung key = new SinhVienDung("SV001");
        map.put(key, "Nguyễn Văn A");
        // Tạo đối tượng mới cùng mssv để tra cứu
        System.out.println("Tên SV: " + map.get(new SinhVienDung("SV001"))); // Nguyễn Văn A
    }
}
```

### Đáp án mẫu

> "Java quy định: nếu `a.equals(b)` là `true` thì `a.hashCode()` phải bằng `b.hashCode()`. `HashMap` và `HashSet` dùng `hashCode()` để tìm bucket trước rồi mới dùng `equals()` để so sánh chính xác. Nếu chỉ override `equals()` mà không override `hashCode()`, hai đối tượng bằng nhau về mặt logic có thể rơi vào hai bucket khác nhau — kết quả là `HashSet` sẽ cho phép lưu trùng lặp và `HashMap` sẽ không tìm thấy giá trị dù key đúng. Đây là lỗi rất khó debug nên luôn phải override cả hai."

---
