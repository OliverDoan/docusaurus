---
sidebar_position: 4
title: "4. Collections"
---

# Collections

> Bộ câu hỏi phỏng vấn về **Collections Framework** (bộ khung tập hợp) trong Java cho vị trí thực tập. Đây là chủ đề được hỏi rất nhiều vì nó xuất hiện trong hầu hết mọi dự án thực tế. Hãy nắm vững `List`, `Set`, `Map` và biết khi nào dùng cấu trúc nào.

:::note[Ghi nhớ nhanh]

- ⭐ **`List` / `Set` / `Map` / `Queue`** — `List` có thứ tự và cho trùng, `Set` không trùng, `Map` lưu cặp key-value, `Queue` xử lý theo FIFO. Lưu ý `Map` không kế thừa `Collection`.
- ⭐ **`HashMap` hoạt động thế nào** — băm key ra bucket, xử lý va chạm bằng danh sách liên kết (Java 8+ chuyển sang cây khi nhiều phần tử); truy xuất trung bình O(1).
- **`ArrayList` vs `LinkedList`** — `ArrayList` truy cập theo index nhanh (O(1)); `LinkedList` thêm/xóa ở đầu/giữa nhanh hơn nhưng truy cập chậm.
- **`HashMap` vs `Hashtable`** — `HashMap` cho null, không đồng bộ, nhanh; `Hashtable` không cho null, đồng bộ (cũ).
- **Array vs `ArrayList`** — mảng cố định kích thước, chứa cả primitive; `ArrayList` co giãn tự động, chỉ chứa object.
- **Override `equals()` + `hashCode()`** — bắt buộc khi dùng object làm key trong `HashMap`, nếu không sẽ tra cứu sai.

:::

---

## Câu 1: Collections Framework là gì? Phân biệt List, Set, Map, Queue `[Basic]`

### Câu hỏi

Collections Framework (bộ khung tập hợp) trong Java là gì? Các nhóm `List`, `Set`, `Map`, `Queue` khác nhau ra sao?

### Giải thích lý thuyết

**Collections Framework** là một tập hợp các interface (giao diện) và class (lớp) có sẵn trong Java, dùng để lưu trữ và thao tác với nhóm các đối tượng (ví dụ: danh sách sinh viên, danh bạ điện thoại). Nó nằm trong package `java.util`.

Bốn nhóm chính:

- **`List`** (danh sách): lưu các phần tử **có thứ tự** (ordered), **cho phép trùng lặp** (duplicate). Truy cập theo chỉ số (index). Ví dụ: `ArrayList`, `LinkedList`.
- **`Set`** (tập hợp): **không cho phép trùng lặp** (unique). Thường không quan tâm thứ tự. Ví dụ: `HashSet`, `TreeSet`.
- **`Map`** (ánh xạ): lưu theo cặp **khoá - giá trị** (key - value). Khoá là duy nhất. Ví dụ: `HashMap`, `TreeMap`. Lưu ý: `Map` **không** kế thừa từ interface `Collection`.
- **`Queue`** (hàng đợi): xử lý phần tử theo thứ tự, thường là FIFO (vào trước ra trước). Ví dụ: `LinkedList`, `PriorityQueue`.

### Code minh hoạ

```java
import java.util.*;

public class CollectionsDemo {
    public static void main(String[] args) {
        // List: có thứ tự, cho phép trùng
        List<String> danhSach = new ArrayList<>();
        danhSach.add("A");
        danhSach.add("A"); // OK, cho phép trùng

        // Set: không cho phép trùng
        Set<String> tapHop = new HashSet<>();
        tapHop.add("A");
        tapHop.add("A"); // bị bỏ qua, vẫn chỉ có 1 phần tử "A"

        // Map: cặp khoá - giá trị
        Map<String, Integer> diem = new HashMap<>();
        diem.put("Toan", 9); // khoá "Toan" ứng với giá trị 9

        // Queue: hàng đợi FIFO (vào trước ra trước)
        Queue<String> hangDoi = new LinkedList<>();
        hangDoi.offer("Khach1"); // thêm vào cuối hàng
        hangDoi.poll();          // lấy ra và xoá phần tử đầu hàng

        System.out.println(danhSach.size()); // 2
        System.out.println(tapHop.size());   // 1
    }
}
```

### Đáp án mẫu

Collections Framework là tập hợp các interface và class có sẵn trong `java.util` để lưu trữ nhóm đối tượng. Bốn nhóm chính: `List` có thứ tự và cho phép trùng, `Set` không cho phép trùng, `Map` lưu theo cặp khoá - giá trị, và `Queue` là hàng đợi xử lý theo thứ tự FIFO. Trong đó `Map` là nhánh riêng, không kế thừa `Collection`.

---

## Câu 2: Phân biệt `List`, `Set`, `Map` và khi nào dùng `[Basic]`

### Câu hỏi

So sánh `List`, `Set` và `Map` về mặt cơ bản. Khi nào nên dùng từng loại?

### Giải thích lý thuyết

| Tiêu chí | `List` | `Set` | `Map` |
| --- | --- | --- | --- |
| Trùng lặp | Cho phép | Không cho phép | Khoá không trùng, giá trị có thể trùng |
| Thứ tự | Có (theo index) | Tuỳ loại (HashSet không, TreeSet có sắp xếp) | Tuỳ loại |
| Truy cập | Theo chỉ số (index) | Không có index | Theo khoá (key) |
| Kế thừa | `Collection` | `Collection` | Riêng (không kế thừa `Collection`) |

**Khi nào dùng:**

- Dùng `List` khi cần giữ thứ tự thêm vào và chấp nhận trùng lặp (ví dụ: lịch sử thao tác, giỏ hàng).
- Dùng `Set` khi cần đảm bảo các phần tử là duy nhất (ví dụ: danh sách email không trùng).
- Dùng `Map` khi cần tra cứu nhanh theo một khoá (ví dụ: tra số điện thoại theo tên).

### Code minh hoạ

```java
import java.util.*;

public class ChonCollection {
    public static void main(String[] args) {
        // List: giỏ hàng có thể chứa 2 sản phẩm giống nhau
        List<String> gioHang = new ArrayList<>(List.of("Ao", "Ao", "Quan"));

        // Set: loại bỏ email trùng tự động
        Set<String> emailDuyNhat = new HashSet<>(
            List.of("a@x.com", "a@x.com", "b@x.com"));
        // emailDuyNhat chỉ còn 2 phần tử

        // Map: tra số điện thoại theo tên
        Map<String, String> danhBa = new HashMap<>();
        danhBa.put("An", "0901");
        System.out.println(danhBa.get("An")); // 0901
        System.out.println(gioHang.size());    // 3
        System.out.println(emailDuyNhat.size()); // 2
    }
}
```

### Đáp án mẫu

`List` cho phép trùng và giữ thứ tự, truy cập theo index, dùng khi cần một danh sách tuần tự. `Set` không cho phép trùng, dùng khi cần các phần tử duy nhất. `Map` lưu theo cặp khoá - giá trị, dùng khi cần tra cứu nhanh theo khoá. Em chọn `List` cho giỏ hàng, `Set` cho danh sách email không trùng, và `Map` cho danh bạ.

---

## Câu 3: Phân biệt `ArrayList` và `LinkedList` `[Intermediate]`

### Câu hỏi

`ArrayList` và `LinkedList` khác nhau như thế nào về cấu trúc dữ liệu và hiệu năng? Khi nào nên dùng cái nào?

### Giải thích lý thuyết

Cả hai đều cài đặt interface `List`, nhưng cấu trúc bên trong khác nhau:

- **`ArrayList`**: dựa trên **mảng động** (dynamic array). Các phần tử nằm liên tiếp trong bộ nhớ.
  - Truy cập theo index rất nhanh — độ phức tạp `O(1)`.
  - Thêm/xoá ở **giữa** danh sách chậm vì phải dịch chuyển các phần tử — `O(n)`.
- **`LinkedList`**: dựa trên **danh sách liên kết đôi** (doubly linked list). Mỗi phần tử (node) trỏ tới phần tử trước và sau.
  - Truy cập theo index chậm vì phải duyệt từ đầu — `O(n)`.
  - Thêm/xoá ở **đầu hoặc cuối** rất nhanh — `O(1)`.

**Khi nào dùng:**

- Dùng `ArrayList` (mặc định, phổ biến nhất) khi thao tác chủ yếu là **đọc/truy cập theo index**.
- Dùng `LinkedList` khi thao tác chủ yếu là **thêm/xoá ở đầu hoặc cuối** liên tục (ví dụ: làm hàng đợi).

### Code minh hoạ

```java
import java.util.*;

public class ArrayListVsLinkedList {
    public static void main(String[] args) {
        // ArrayList: truy cập theo index nhanh O(1)
        List<Integer> arr = new ArrayList<>(List.of(10, 20, 30));
        System.out.println(arr.get(2)); // 30 - rất nhanh

        // LinkedList: thêm/xoá đầu danh sách nhanh O(1)
        LinkedList<Integer> linked = new LinkedList<>(List.of(10, 20, 30));
        linked.addFirst(5);  // thêm vào đầu, không phải dịch chuyển mảng
        linked.removeLast(); // xoá cuối nhanh

        System.out.println(linked); // [5, 10, 20]
    }
}
```

### Đáp án mẫu

`ArrayList` dùng mảng động nên truy cập theo index nhanh `O(1)`, nhưng thêm/xoá ở giữa chậm vì phải dịch chuyển phần tử. `LinkedList` dùng danh sách liên kết đôi nên thêm/xoá ở đầu/cuối nhanh `O(1)`, nhưng truy cập theo index chậm `O(n)`. Thực tế đa số trường hợp em dùng `ArrayList` vì thao tác đọc nhiều hơn; chỉ dùng `LinkedList` khi cần thêm/xoá ở hai đầu liên tục.

---

## Câu 4: `HashMap` hoạt động như thế nào? `[Intermediate]`

### Câu hỏi

`HashMap` lưu trữ và tìm kiếm dữ liệu như thế nào? Giải thích vai trò của `hashCode` và cách xử lý va chạm (collision).

### Giải thích lý thuyết

`HashMap` lưu dữ liệu theo cặp **khoá - giá trị** (key - value) và cho phép tra cứu rất nhanh, trung bình `O(1)`.

Cơ chế cơ bản:

1. Khi gọi `put(key, value)`, Java gọi `key.hashCode()` để tính ra một số nguyên (mã băm - hash code).
2. Từ mã băm này, `HashMap` tính ra vị trí ô (bucket) trong mảng nội bộ để lưu cặp dữ liệu.
3. Khi gọi `get(key)`, nó tính lại vị trí bucket tương tự rồi tìm trong đó.

**Va chạm (collision)** xảy ra khi hai khoá khác nhau cho ra cùng một vị trí bucket. Khi đó `HashMap` lưu nhiều cặp trong cùng một bucket dưới dạng **danh sách liên kết** (linked list). Trong Java 8 trở lên, nếu một bucket chứa quá nhiều phần tử (mặc định là 8), nó tự chuyển thành **cây cân bằng** (balanced tree) để tìm kiếm nhanh hơn.

Để so sánh khoá chính xác, `HashMap` dùng cả `hashCode()` (tìm bucket) và `equals()` (so sánh trong bucket).

### Code minh hoạ

```java
import java.util.*;

public class HashMapDemo {
    public static void main(String[] args) {
        Map<String, Integer> tuoi = new HashMap<>();

        // put: tính hashCode("An") -> tìm bucket -> lưu cặp
        tuoi.put("An", 20);
        tuoi.put("Binh", 22);

        // get: tính lại hashCode("An") -> tới đúng bucket -> trả về 20
        System.out.println(tuoi.get("An")); // 20

        // put cùng khoá -> ghi đè giá trị cũ
        tuoi.put("An", 21);
        System.out.println(tuoi.get("An")); // 21

        // khoá không tồn tại -> trả về null
        System.out.println(tuoi.get("Chi")); // null
    }
}
```

### Đáp án mẫu

`HashMap` lưu dữ liệu theo cặp khoá - giá trị. Khi `put`, nó dùng `hashCode()` của khoá để tính vị trí bucket trong mảng nội bộ rồi lưu vào đó; khi `get` thì tính lại vị trí để tìm, nên trung bình rất nhanh `O(1)`. Khi hai khoá ra cùng bucket (va chạm) thì lưu cùng chỗ dưới dạng danh sách liên kết, và từ Java 8 nếu quá dài sẽ chuyển thành cây để tìm nhanh hơn. Nó dùng cả `hashCode()` và `equals()` để xác định khoá.

---

## Câu 5: Phân biệt `HashMap`, `HashSet` và `Hashtable` `[Intermediate]`

### Câu hỏi

`HashMap`, `HashSet` và `Hashtable` khác nhau như thế nào?

### Giải thích lý thuyết

- **`HashMap`**: cài đặt `Map`, lưu cặp **khoá - giá trị**. Cho phép **một khoá `null`** và nhiều giá trị `null`. **Không đồng bộ** (not synchronized — không an toàn khi nhiều luồng cùng truy cập), nhưng nhanh.
- **`HashSet`**: cài đặt `Set`, lưu **các phần tử đơn lẻ** không trùng. Bên trong, `HashSet` thực ra dùng một `HashMap` để lưu (mỗi phần tử là một khoá). Cho phép một phần tử `null`.
- **`Hashtable`**: lớp cũ (legacy), cũng lưu cặp khoá - giá trị giống `HashMap`, nhưng **đồng bộ** (synchronized — an toàn đa luồng) nên chậm hơn, và **không cho phép `null`** cho cả khoá lẫn giá trị. Ngày nay ít dùng; nếu cần an toàn đa luồng người ta dùng `ConcurrentHashMap`.

### Code minh hoạ

```java
import java.util.*;

public class HashSoSanh {
    public static void main(String[] args) {
        // HashMap: cặp khoá - giá trị, cho phép khoá null
        Map<String, Integer> map = new HashMap<>();
        map.put(null, 1); // OK
        map.put("A", 2);

        // HashSet: chỉ lưu phần tử đơn, không trùng
        Set<String> set = new HashSet<>();
        set.add("A");
        set.add("A"); // bị bỏ qua
        set.add(null); // OK, cho phép 1 null

        // Hashtable: không cho phép null -> ném lỗi nếu thử
        Hashtable<String, Integer> table = new Hashtable<>();
        table.put("A", 1); // OK
        // table.put(null, 1); // sẽ ném NullPointerException

        System.out.println(set.size()); // 2 ("A" và null)
    }
}
```

### Đáp án mẫu

`HashMap` lưu cặp khoá - giá trị, cho phép một khoá `null`, và không đồng bộ nên nhanh. `HashSet` chỉ lưu các phần tử đơn không trùng và bên trong dùng `HashMap`. `Hashtable` là lớp cũ, cũng lưu khoá - giá trị nhưng đồng bộ nên an toàn đa luồng mà chậm hơn, và không cho phép `null`. Hiện nay nếu cần đa luồng em dùng `ConcurrentHashMap` thay vì `Hashtable`.

---

## Câu 6: Phân biệt mảng (Array) và `ArrayList` `[Basic]`

### Câu hỏi

Mảng (array) thường và `ArrayList` khác nhau như thế nào?

### Giải thích lý thuyết

| Tiêu chí | Mảng (Array) | `ArrayList` |
| --- | --- | --- |
| Kích thước | **Cố định** khi khởi tạo | **Tự động co giãn** (dynamic) |
| Kiểu dữ liệu | Lưu được kiểu nguyên thuỷ (primitive như `int`) và đối tượng | Chỉ lưu **đối tượng** (dùng `Integer` thay cho `int`) |
| Cú pháp | `arr[i]` để truy cập, `arr.length` để lấy độ dài | `list.get(i)`, `list.size()` |
| Phương thức hỗ trợ | Rất ít | Nhiều: `add`, `remove`, `contains`... |

Tóm lại: mảng đơn giản và nhanh khi biết trước số lượng phần tử cố định; `ArrayList` linh hoạt hơn khi số lượng phần tử thay đổi trong lúc chạy.

### Code minh hoạ

```java
import java.util.*;

public class ArrayVsArrayList {
    public static void main(String[] args) {
        // Mảng: kích thước cố định = 3
        int[] mang = new int[3];
        mang[0] = 10;
        System.out.println(mang.length); // 3 (không thể thêm phần tử thứ 4)

        // ArrayList: tự co giãn, dùng phương thức add
        List<Integer> list = new ArrayList<>();
        list.add(10);
        list.add(20); // kích thước tự tăng
        list.add(30);
        System.out.println(list.size()); // 3, có thể add tiếp
    }
}
```

### Đáp án mẫu

Mảng có kích thước cố định khi khởi tạo và lưu được cả kiểu nguyên thuỷ như `int`, truy cập bằng `arr[i]`. `ArrayList` tự động co giãn kích thước, chỉ lưu đối tượng (dùng `Integer`), và có nhiều phương thức tiện lợi như `add`, `remove`, `contains`. Em dùng mảng khi biết trước số phần tử cố định, dùng `ArrayList` khi số phần tử thay đổi lúc chạy.

---

## Câu 7: Cách duyệt qua `List` và `Map` `[Basic]`

### Câu hỏi

Có những cách nào để duyệt (lặp qua) một `List` và một `Map` trong Java?

### Giải thích lý thuyết

**Duyệt `List`:**

- **Vòng lặp for thường**: dùng index, phù hợp khi cần biết vị trí.
- **Vòng lặp for-each** (`for (T item : list)`): ngắn gọn, phổ biến nhất.
- **Iterator** (bộ lặp): cho phép **xoá phần tử an toàn** trong lúc duyệt bằng `iterator.remove()`.

**Duyệt `Map`:**

- **`entrySet()`**: duyệt từng cặp khoá - giá trị (`Map.Entry`), hiệu quả nhất khi cần cả khoá lẫn giá trị.
- **`keySet()`**: duyệt qua các khoá.
- **`values()`**: duyệt qua các giá trị.

Lưu ý: nếu vừa duyệt bằng for-each vừa gọi `list.remove()` trực tiếp sẽ gây lỗi `ConcurrentModificationException`. Khi cần xoá trong lúc duyệt, hãy dùng `Iterator`.

### Code minh hoạ

```java
import java.util.*;

public class DuyetCollection {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>(List.of("A", "B", "C"));

        // Cách 1: for-each (phổ biến nhất)
        for (String item : list) {
            System.out.println(item);
        }

        // Cách 2: Iterator - xoá an toàn khi duyệt
        Iterator<String> it = list.iterator();
        while (it.hasNext()) {
            String s = it.next();
            if (s.equals("B")) it.remove(); // xoá "B" an toàn
        }

        // Duyệt Map bằng entrySet (lấy cả khoá lẫn giá trị)
        Map<String, Integer> diem = new HashMap<>();
        diem.put("Toan", 9);
        diem.put("Ly", 8);
        for (Map.Entry<String, Integer> e : diem.entrySet()) {
            System.out.println(e.getKey() + " = " + e.getValue());
        }
    }
}
```

### Đáp án mẫu

Với `List`, em có thể dùng for thường (theo index), for-each (ngắn gọn, hay dùng nhất), hoặc `Iterator` khi cần xoá phần tử an toàn trong lúc duyệt. Với `Map`, em duyệt bằng `entrySet()` để lấy cả khoá lẫn giá trị, hoặc `keySet()` và `values()` nếu chỉ cần một trong hai. Lưu ý nếu xoá trực tiếp bằng `list.remove()` trong vòng for-each sẽ bị lỗi `ConcurrentModificationException`, nên dùng `Iterator`.

---

## Câu 8: Vì sao cần override `equals()` và `hashCode()` khi dùng object làm khoá trong `HashMap`? `[Intermediate]`

### Câu hỏi

Khi dùng một đối tượng tự định nghĩa làm khoá (key) trong `HashMap`, vì sao phải override (ghi đè) cả `equals()` và `hashCode()`?

### Giải thích lý thuyết

`HashMap` tìm khoá theo hai bước: dùng `hashCode()` để xác định **bucket** (ô lưu), rồi dùng `equals()` để **so sánh chính xác** khoá trong bucket đó.

Nếu **không** override:

- `Object.hashCode()` mặc định dựa trên địa chỉ bộ nhớ, nên hai đối tượng có cùng nội dung vẫn cho mã băm **khác nhau** → rơi vào bucket khác nhau → `get()` không tìm thấy.
- `Object.equals()` mặc định so sánh **tham chiếu** (cùng ô nhớ hay không), không so sánh nội dung.

**Quy tắc bắt buộc** (hợp đồng equals - hashCode): nếu hai đối tượng `equals()` bằng nhau thì `hashCode()` của chúng **phải** bằng nhau. Vì vậy luôn override cả hai cùng lúc, dựa trên cùng các trường (field).

### Code minh hoạ

```java
import java.util.*;

class SinhVien {
    String maSV;

    SinhVien(String maSV) { this.maSV = maSV; }

    // override equals: so sánh theo nội dung (maSV) thay vì tham chiếu
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SinhVien sv = (SinhVien) o;
        return Objects.equals(maSV, sv.maSV);
    }

    // override hashCode: cùng maSV -> cùng mã băm
    @Override
    public int hashCode() {
        return Objects.hash(maSV);
    }
}

public class EqualsHashCodeDemo {
    public static void main(String[] args) {
        Map<SinhVien, String> map = new HashMap<>();
        map.put(new SinhVien("SV01"), "An");

        // Nhờ override, đối tượng mới cùng maSV vẫn tìm thấy giá trị
        System.out.println(map.get(new SinhVien("SV01"))); // An
        // Nếu KHÔNG override -> kết quả sẽ là null
    }
}
```

### Đáp án mẫu

Vì `HashMap` dùng `hashCode()` để tìm bucket và `equals()` để so sánh khoá trong bucket đó. Mặc định, `hashCode()` dựa trên địa chỉ bộ nhớ và `equals()` so sánh tham chiếu, nên hai đối tượng có cùng nội dung vẫn bị coi là khác nhau, dẫn đến `get()` không tìm thấy. Quy tắc bắt buộc là nếu hai đối tượng bằng nhau qua `equals()` thì `hashCode()` cũng phải bằng nhau, nên em luôn override cả hai dựa trên cùng các trường.
