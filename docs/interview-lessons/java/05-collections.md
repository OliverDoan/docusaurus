---
sidebar_position: 5
title: "5. Collections"
---

# 5. Collections

## 1. Array vs ArrayList

Bài học: [1. Array vs ArrayList](../../java/05-collections/1_array-vs-arraylist.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `Array` và `ArrayList` khác nhau cốt lõi ở điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Kích thước**: `Array` cố định ngay khi khởi tạo (`new int[5]` mãi mãi chỉ có 5 ô); `ArrayList` tự co giãn khi `add`/`remove`.
- **Kiểu dữ liệu chứa được**: `Array` chứa được cả kiểu nguyên thủy (`int[]`, `double[]`) lẫn object; `ArrayList` chỉ chứa object, nên phải dùng lớp bọc (`Integer`, `Double`).
- **API**: `Array` chỉ có `[]` và `.length`; `ArrayList` có sẵn `add()`, `remove()`, `contains()`, `indexOf()`...
- **Hiệu năng**: `Array` truy cập nhanh hơn một chút vì không có lớp bọc và overhead quản lý kích thước.

</details>

**2. Vì sao `ArrayList<int>` là cú pháp sai? Cách khắc phục?**

<details className="qa">
<summary>Xem đáp án</summary>

- Generic trong Java Collections Framework chỉ hoạt động với **kiểu tham chiếu (reference type)**, không chấp nhận kiểu nguyên thủy (`int`, `double`, `boolean`...), vì generic được cài đặt bằng cơ chế **type erasure** — tại runtime, mọi generic đều bị xóa và xử lý như `Object`, mà kiểu nguyên thủy không phải là object.
- Khắc phục: dùng **lớp bọc (wrapper class)** tương ứng — `Integer` thay cho `int`, `Double` thay cho `double`, `Boolean` thay cho `boolean`.

```java
ArrayList<Integer> diem = new ArrayList<>(); // đúng
```

- Nhờ **autoboxing/unboxing** (Java tự động chuyển đổi qua lại giữa `int` và `Integer`), bạn vẫn viết `diem.add(8)` tự nhiên như đang thêm `int`.

</details>

**3. `list.length` có gọi được không? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không** — đây là lỗi biên dịch (compile error). `length` là một **thuộc tính (field)** chỉ tồn tại trên `Array`, không phải phương thức. `ArrayList` không có field này; nó dùng phương thức `size()` để lấy số phần tử.

```java
int[] a = {1, 2, 3};
System.out.println(a.length);   // đúng — field

ArrayList<Integer> list = new ArrayList<>();
System.out.println(list.length); // LỖI biên dịch: cannot find symbol
System.out.println(list.size());  // đúng — method
```

</details>

**4. Đoạn code sau ném ngoại lệ gì? Giải thích vì sao.**

```java
int[] diem = new int[5];
diem[5] = 100;
```

<details className="qa">
<summary>Xem đáp án</summary>

Ném `ArrayIndexOutOfBoundsException`.

- `new int[5]` tạo mảng có **chỉ số hợp lệ từ 0 đến 4**, tổng cộng 5 phần tử. Chỉ số 5 nằm ngoài phạm vi này.
- Đây là ngoại lệ **unchecked (runtime exception)** — trình biên dịch không bắt lỗi này, nó chỉ xuất hiện khi chương trình thực sự chạy tới dòng truy cập sai chỉ số.
- Với `ArrayList`, thao tác tương tự (`list.get(5)` khi chỉ có 5 phần tử, chỉ số 0–4) ném `IndexOutOfBoundsException` (lớp cha của `ArrayIndexOutOfBoundsException`).

</details>

**5. `ArrayList` bên trong hoạt động dựa trên cấu trúc dữ liệu nào? Khi hết chỗ chứa, nó xử lý ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

- Bên trong, `ArrayList` vẫn dùng một **mảng (array)** thông thường để lưu dữ liệu — đó là lý do truy cập theo chỉ số (`get(i)`) có độ phức tạp **O(1)**, giống như mảng thật.
- Khi mảng nội bộ đầy và bạn tiếp tục `add()`, `ArrayList` sẽ: tạo một mảng mới **lớn hơn** (thường tăng khoảng 50% dung lượng cũ), copy toàn bộ phần tử cũ sang, rồi mới thêm phần tử mới vào. Việc này gọi là **resize/grow**, có chi phí O(n) tại thời điểm đó nhưng amortized (phân bổ đều) vẫn là O(1) cho mỗi lần `add()` trung bình.
- Có thể giảm số lần resize bằng cách khởi tạo trước dung lượng dự kiến: `new ArrayList<>(1000)`.

</details>

**6. So sánh độ phức tạp của các thao tác `add`, `get`, `remove` giữa `Array` và `ArrayList`.**

<details className="qa">
<summary>Xem đáp án</summary>

| Thao tác | Array | ArrayList |
|----------|-------|-----------|
| Đọc theo chỉ số `get`/`[i]` | O(1) | O(1) |
| Ghi theo chỉ số `set`/`[i]=` | O(1) | O(1) |
| Thêm vào cuối | không hỗ trợ | O(1) amortized (thỉnh thoảng O(n) khi resize) |
| Thêm/xóa ở giữa hoặc đầu | không hỗ trợ (phải tự dời tay) | O(n) — phải dịch chuyển các phần tử phía sau |

- Lý do thêm/xóa ở giữa `ArrayList` tốn O(n): vì dữ liệu lưu trong mảng liên tục, chèn/xóa một phần tử buộc phải dịch chuyển tất cả phần tử phía sau sang trái/phải một ô.

</details>

**7. Trong thực tế, khi nào nên ưu tiên `Array` thay vì `ArrayList` dù `ArrayList` linh hoạt hơn?**

<details className="qa">
<summary>Xem đáp án</summary>

- Khi làm việc với **số lượng lớn kiểu nguyên thủy** (ví dụ hàng triệu số `double` trong tính toán khoa học) — `int[]`/`double[]` tiết kiệm bộ nhớ hơn hẳn vì không cần lớp bọc (`Integer`, `Double`) với overhead object header của từng phần tử.
- Khi kích thước **biết trước và không đổi trong suốt vòng đời**, ví dụ bảng tra cứu cố định (7 ngày trong tuần, 12 tháng).
- Khi cần **hiệu năng tối đa** ở tầng thấp (low-level), ví dụ xử lý ảnh, buffer dữ liệu nhị phân, thuật toán số học nặng.
- Ngược lại, với logic nghiệp vụ thông thường (danh sách sản phẩm, danh sách người dùng...), `ArrayList` vẫn là lựa chọn mặc định vì API tiện lợi và ít lỗi hơn.

</details>

**8. `list.remove(2)` và `list.remove(Integer.valueOf(2))` trên `ArrayList<Integer>` khác nhau thế nào? Đây là lỗi hay gặp ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

`ArrayList` có hai phương thức `remove` bị **overload (nạp chồng)**:

- `remove(int index)` — xóa phần tử tại **chỉ số**.
- `remove(Object o)` — xóa phần tử đầu tiên có **giá trị** bằng `o`.

```java
ArrayList<Integer> list = new ArrayList<>(List.of(10, 20, 30));

list.remove(2);               // gọi remove(int) -> xóa chỉ số 2 -> còn [10, 20]
list.remove(Integer.valueOf(2)); // gọi remove(Object) -> tìm giá trị 2 -> không có gì bị xóa (không tồn tại giá trị 2)
```

- Vì `Integer` là kiểu tham chiếu, khi bạn viết `list.remove(2)`, Java ưu tiên khớp overload `remove(int)` (không cần autoboxing) thay vì `remove(Object)`. Đây là lỗi rất hay gặp khi người mới muốn xóa **theo giá trị** một số nguyên nhưng vô tình xóa nhầm **theo chỉ số**.
- Cách xóa đúng theo giá trị: ép kiểu tường minh về `Integer` bằng `Integer.valueOf(...)` hoặc autobox rõ ràng.

</details>

**9. `ArrayList` có phải là cấu trúc dữ liệu an toàn luồng (thread-safe) không? Nếu không, giải pháp thay thế là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không**, `ArrayList` không thread-safe. Nhiều luồng cùng đọc/ghi vào một `ArrayList` có thể gây `ConcurrentModificationException` (khi một luồng sửa trong lúc luồng khác đang duyệt) hoặc dữ liệu sai lệch (do race condition — nhiều luồng tranh chấp cùng lúc trên một dữ liệu).

Các giải pháp thay thế:

- `Collections.synchronizedList(new ArrayList<>())` — bọc danh sách lại, đồng bộ hóa (synchronize) toàn bộ thao tác bằng một khóa (lock) chung, đơn giản nhưng làm giảm khả năng chạy song song.
- `CopyOnWriteArrayList` (trong `java.util.concurrent`) — mỗi lần ghi sẽ tạo bản sao mảng mới; phù hợp khi **đọc nhiều, ghi ít**, vì đọc không cần khóa.
- Với nhu cầu phức tạp hơn, cân nhắc các cấu trúc trong `java.util.concurrent` được thiết kế riêng cho môi trường đa luồng.

</details>

---

## 2. Set

Bài học: [2. Set](../../java/05-collections/2_set.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `Set` khác `List` cốt lõi ở điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- `Set` **không cho phần tử trùng lặp**; `List` cho phép trùng và giữ nguyên số lần xuất hiện.
- `Set` **không truy cập theo chỉ số** (không có `get(0)`); `List` truy cập được qua `get(i)`.
- `Set` không đảm bảo thứ tự trừ khi dùng `LinkedHashSet`/`TreeSet`; `List` luôn giữ đúng thứ tự đã thêm vào.
- Cả hai đều là interface con của `Collection`, đều có `add()`, `remove()`, `contains()`, `size()`.

</details>

**2. `HashSet`, `LinkedHashSet`, `TreeSet` khác nhau thế nào về thứ tự phần tử và tốc độ?**

<details className="qa">
<summary>Xem đáp án</summary>

| Loại | Thứ tự | Tốc độ `add`/`contains` | Cấu trúc bên trong |
|------|--------|--------------------------|---------------------|
| `HashSet` | Không xác định | O(1) trung bình | Bảng băm (hash table) |
| `LinkedHashSet` | Theo thứ tự thêm vào | O(1) trung bình (chậm hơn `HashSet` một chút) | Bảng băm + danh sách liên kết đôi để nhớ thứ tự |
| `TreeSet` | Tăng dần theo `Comparable`/`Comparator` | O(log n) | Cây đỏ-đen (red-black tree) |

- Chọn `HashSet` khi chỉ cần kiểm tra tồn tại nhanh, không quan tâm thứ tự.
- Chọn `LinkedHashSet` khi cần loại trùng nhưng vẫn giữ thứ tự người dùng thêm vào (ví dụ hiển thị lịch sử duyệt trang, không trùng URL).
- Chọn `TreeSet` khi cần dữ liệu luôn ở trạng thái sắp xếp, hoặc cần các truy vấn dải như `first()`, `last()`, `headSet()`, `tailSet()`.

</details>

**3. `HashSet` dựa vào đâu để biết hai phần tử là "trùng nhau"?**

<details className="qa">
<summary>Xem đáp án</summary>

`HashSet` dùng cặp phương thức **`hashCode()` và `equals()`** của phần tử:

1. Khi `add(x)`, `HashSet` gọi `x.hashCode()` để xác định **bucket** (ngăn chứa) trong bảng băm.
2. Nếu bucket đó đã có phần tử, `HashSet` gọi `equals()` để so sánh xem `x` có trùng với phần tử đã tồn tại không.
3. Chỉ khi cả hai điều kiện — cùng bucket (`hashCode` bằng nhau) và `equals()` trả về `true` — mới coi là trùng và bỏ qua.

Vì vậy nếu bạn thêm một object tự định nghĩa vào `HashSet` mà **chưa override `hashCode()` và `equals()`**, `HashSet` sẽ dùng bản mặc định của `Object` (so sánh theo địa chỉ bộ nhớ), khiến hai object có nội dung giống hệt nhau vẫn bị coi là khác nhau và không loại trùng được.

</details>

**4. Đoạn code sau in ra gì? Vì sao?**

```java
class DiemThi {
    int diem;
    DiemThi(int diem) { this.diem = diem; }
}

Set<DiemThi> set = new HashSet<>();
set.add(new DiemThi(9));
set.add(new DiemThi(9));
System.out.println(set.size());
```

<details className="qa">
<summary>Xem đáp án</summary>

In ra **`2`**, không phải `1` như nhiều người nghĩ.

- Lớp `DiemThi` **không override `hashCode()` và `equals()`**, nên `HashSet` dùng bản mặc định kế thừa từ `Object` — so sánh hai tham chiếu (reference) có trỏ tới cùng một object trong bộ nhớ hay không.
- Hai lời gọi `new DiemThi(9)` tạo ra **hai object khác nhau trên heap**, dù có cùng giá trị `diem`. Vì vậy `HashSet` coi chúng là hai phần tử khác nhau, không loại trùng.
- Muốn loại trùng theo giá trị `diem`, phải override `hashCode()` và `equals()` trong `DiemThi` (hoặc dùng `record`, tự động sinh cả hai theo mọi field).

</details>

**5. Vì sao cần override cả `hashCode()` lẫn `equals()` cùng lúc, chứ không chỉ một trong hai?**

<details className="qa">
<summary>Xem đáp án</summary>

Java có một **hợp đồng (contract)** bắt buộc giữa hai phương thức: nếu `a.equals(b)` trả về `true` thì `a.hashCode()` phải bằng `b.hashCode()`.

- Nếu chỉ override `equals()` mà giữ nguyên `hashCode()` mặc định (dựa trên địa chỉ bộ nhớ), hai object "bằng nhau" theo `equals()` vẫn rơi vào **bucket khác nhau** trong bảng băm — `HashSet` sẽ không bao giờ tìm thấy chúng là trùng, phá vỡ tính năng loại trùng.
- Nếu chỉ override `hashCode()` mà không override `equals()`, hai object có thể rơi cùng bucket nhưng `equals()` mặc định vẫn so theo địa chỉ, nên vẫn bị coi là khác nhau.
- Vì vậy phải luôn override **cả hai cùng lúc và nhất quán** (dựa trên cùng tập field). IDE hiện đại và `record` (Java 16+) tự sinh cặp này đúng chuẩn.

</details>

**6. `TreeSet` yêu cầu gì ở các phần tử để có thể sắp xếp? Điều gì xảy ra nếu thiếu?**

<details className="qa">
<summary>Xem đáp án</summary>

`TreeSet` cần biết cách **so sánh** hai phần tử để quyết định thứ tự, thông qua một trong hai cách:

- Phần tử tự định nghĩa (custom class) cài đặt interface `Comparable` và override `compareTo()`.
- Hoặc truyền một `Comparator` khi tạo `TreeSet`: `new TreeSet<>(comparator)`.

```java
class SinhVien implements Comparable<SinhVien> {
    String ten;
    int diem;
    // ...
    @Override
    public int compareTo(SinhVien khac) {
        return Integer.compare(this.diem, khac.diem);
    }
}
```

Nếu thêm một object **không cài đặt `Comparable`** vào `TreeSet` mà cũng không truyền `Comparator`, chương trình sẽ ném `ClassCastException` ngay tại thời điểm `add()`, vì `TreeSet` không biết đặt phần tử đó vào đâu trong cây.

</details>

**7. Nêu cách thực hiện phép hợp, giao, hiệu giữa hai `Set` bằng các phương thức có sẵn.**

<details className="qa">
<summary>Xem đáp án</summary>

```java
Set<Integer> a = new HashSet<>(Set.of(1, 2, 3));
Set<Integer> b = new HashSet<>(Set.of(2, 3, 4));

Set<Integer> hop = new HashSet<>(a);
hop.addAll(b);      // {1, 2, 3, 4} — hợp (union)

Set<Integer> giao = new HashSet<>(a);
giao.retainAll(b);  // {2, 3} — giao (intersection)

Set<Integer> hieu = new HashSet<>(a);
hieu.removeAll(b);  // {1} — hiệu (difference)
```

- Lưu ý: các phương thức này **thay đổi trực tiếp (mutate)** tập hợp gọi chúng, nên luôn tạo bản sao (`new HashSet<>(a)`) trước khi gọi nếu muốn giữ nguyên tập gốc.

</details>

**8. Làm thế nào để loại bỏ phần tử trùng khỏi một `List` mà vẫn giữ nguyên thứ tự ban đầu?**

<details className="qa">
<summary>Xem đáp án</summary>

Đổ thẳng `List` vào `HashSet` sẽ loại trùng nhưng **mất thứ tự ban đầu**. Muốn vừa loại trùng vừa giữ thứ tự, dùng `LinkedHashSet`:

```java
List<Integer> coTrung = List.of(3, 1, 2, 3, 1, 4);

// Sai cách nếu cần giữ thứ tự: HashSet không đảm bảo thứ tự
Set<Integer> mat_thu_tu = new HashSet<>(coTrung);

// Đúng cách: LinkedHashSet giữ nguyên thứ tự xuất hiện lần đầu
List<Integer> khongTrungGiuThuTu = new ArrayList<>(new LinkedHashSet<>(coTrung));
// Kết quả: [3, 1, 2, 4]
```

Từ Java 8 trở đi, cũng có thể dùng Stream API: `list.stream().distinct().toList()` (giữ thứ tự gặp lần đầu, do `distinct()` bảo toàn thứ tự nguồn).

</details>

**9. `Set.of(...)` (Java 9+) tạo ra Set có đặc điểm gì khác với `new HashSet<>()`?**

<details className="qa">
<summary>Xem đáp án</summary>

`Set.of(...)` tạo ra một **immutable Set (tập hợp bất biến)**, có từ Java 9:

- Không thể `add()`, `remove()`, hay `clear()` — mọi thao tác sửa đổi đều ném `UnsupportedOperationException` ngay khi gọi.
- Không chấp nhận phần tử `null` — thêm `null` sẽ ném `NullPointerException` ngay khi tạo.
- Không cho phép phần tử trùng lặp ngay trong lời gọi khởi tạo — `Set.of(1, 1)` ném `IllegalArgumentException` tại thời điểm tạo.

```java
Set<String> vaiTro = Set.of("ADMIN", "USER");
vaiTro.add("GUEST"); // LỖI: UnsupportedOperationException
```

Phù hợp khi muốn khai báo một tập hợp hằng số, không đổi trong suốt vòng đời chương trình — an toàn hơn `HashSet` thông thường vì tránh được sửa đổi ngoài ý muốn.

</details>

**10. Trong một hệ thống đa luồng, `HashSet` có an toàn không? Có lựa chọn nào thay thế?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không**, `HashSet` (và cả `LinkedHashSet`, `TreeSet`) không thread-safe. Nhiều luồng cùng `add()`/`remove()` đồng thời có thể làm hỏng cấu trúc bảng băm nội bộ hoặc ném `ConcurrentModificationException` khi một luồng đang duyệt (`for-each`) trong lúc luồng khác sửa đổi.

Các lựa chọn thay thế:

- `Collections.synchronizedSet(new HashSet<>())` — bọc lại bằng khóa (lock) chung cho mọi thao tác, đơn giản nhưng giảm khả năng chạy song song.
- `ConcurrentHashMap.newKeySet()` (trong `java.util.concurrent`) — tạo một Set dựa trên `ConcurrentHashMap`, cho phép nhiều luồng đọc/ghi hiệu quả hơn nhờ khóa được chia nhỏ theo từng phần (segment) thay vì khóa toàn bộ.
- `CopyOnWriteArraySet` — phù hợp khi **đọc nhiều, ghi ít**, vì mỗi lần ghi tạo bản sao mảng mới, đọc không cần khóa.

</details>

---

## 3. Map

Bài học: [3. Map](../../java/05-collections/3_map.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `Map` khác `List` và `Set` cốt lõi ở điểm nào? Vì sao `Map` không kế thừa `Collection`?**

<details className="qa">
<summary>Xem đáp án</summary>

- `Map` lưu dữ liệu dạng **cặp key-value**, tra cứu bằng khóa; `List` và `Set` chỉ lưu **một giá trị** cho mỗi phần tử.
- `Map` là một **nhánh interface riêng** trong Java Collections Framework, không kế thừa `Collection`, vì đơn vị làm việc của nó là **cặp** (key, value) chứ không phải phần tử đơn lẻ — các phương thức như `add(e)` của `Collection` không có ý nghĩa với Map (phải là `put(k, v)`).
- Tuy vậy `Map` vẫn cung cấp `keySet()`, `values()`, `entrySet()` trả về các view dạng `Collection`, giúp tận dụng lại API duyệt/lọc quen thuộc.

</details>

**2. `HashMap` xác định vị trí lưu một cặp key-value bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

1. Gọi `key.hashCode()` để tính ra một số nguyên, rồi qua một hàm băm nội bộ để xác định **bucket** (ngăn chứa) trong mảng bên trong `HashMap`.
2. Nếu bucket đó trống, đặt cặp key-value vào ngay.
3. Nếu bucket đã có phần tử khác (**collision** — đụng độ băm), `HashMap` so sánh key mới với các key đã có trong bucket bằng `equals()`; nếu trùng thì ghi đè value, nếu không trùng thì thêm vào (dùng danh sách liên kết, hoặc cây đỏ-đen nếu bucket quá đông từ Java 8).

Vì vậy, key dùng cho `HashMap` **bắt buộc phải override `hashCode()` và `equals()` nhất quán** nếu là object tự định nghĩa, nếu không việc tra cứu sẽ sai hoặc luôn miss.

</details>

**3. Đoạn code sau ném lỗi gì? Vì sao?**

```java
Map<String, Integer> map = new HashMap<>();
int soDT = map.get("Dũng");
```

<details className="qa">
<summary>Xem đáp án</summary>

Ném `NullPointerException` ngay tại dòng gán.

- `map.get("Dũng")` trả về `null` vì khóa `"Dũng"` không tồn tại trong Map.
- `int soDT = null;` yêu cầu Java **unbox** (chuyển từ `Integer` sang `int`) giá trị `null` — nhưng `null` không thể unbox thành kiểu nguyên thủy, gây `NullPointerException`.
- Cách phòng tránh: dùng `map.getOrDefault("Dũng", 0)`, hoặc kiểm tra `map.containsKey("Dũng")` trước, hoặc gán vào biến kiểu `Integer` (kiểu tham chiếu) rồi tự kiểm tra `null`.

</details>

**4. `HashMap`, `LinkedHashMap`, `TreeMap` khác nhau về thứ tự khóa và độ phức tạp như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| Loại | Thứ tự khóa | `get`/`put` | Cấu trúc bên trong |
|------|-------------|-------------|---------------------|
| `HashMap` | Không xác định | O(1) trung bình | Bảng băm |
| `LinkedHashMap` | Theo thứ tự thêm vào (hoặc thứ tự truy cập nếu cấu hình `accessOrder`) | O(1) trung bình | Bảng băm + danh sách liên kết đôi |
| `TreeMap` | Tăng dần theo khóa (`Comparable`/`Comparator`) | O(log n) | Cây đỏ-đen |

- `LinkedHashMap` với `accessOrder = true` còn được dùng để cài đặt **LRU cache** (Least Recently Used — loại bỏ mục ít dùng gần đây nhất) bằng cách override `removeEldestEntry()`.

</details>

**5. Nếu dùng một object tự định nghĩa làm key cho `HashMap` mà quên override `hashCode()`/`equals()`, chuyện gì xảy ra?**

<details className="qa">
<summary>Xem đáp án</summary>

```java
class UserId {
    int id;
    UserId(int id) { this.id = id; }
}

Map<UserId, String> map = new HashMap<>();
map.put(new UserId(1), "An");

System.out.println(map.get(new UserId(1))); // in ra null, KHÔNG phải "An"
```

- Vì `UserId` không override `hashCode()`/`equals()`, Java dùng bản mặc định của `Object` — so sánh theo **địa chỉ tham chiếu**.
- `new UserId(1)` ở dòng `get` là một object **hoàn toàn khác** với object đã dùng ở `put`, dù cùng giá trị `id`. `HashMap` tính `hashCode` khác nhau (hoặc bằng nhau nhưng `equals` trả `false`), nên không tìm thấy — trả về `null`.
- Bài học: key cho `HashMap`/`HashSet` phải là **immutable** và override đúng `hashCode()`/`equals()` (hoặc dùng kiểu có sẵn như `String`, `Integer`, hoặc `record`).

</details>

**6. Điều gì xảy ra nếu bạn thay đổi (mutate) một object đang được dùng làm key trong `HashMap` sau khi đã `put()`?**

<details className="qa">
<summary>Xem đáp án</summary>

Rất nguy hiểm — Map có thể **"mất" cặp key-value đó vĩnh viễn**, dù nó vẫn còn nằm trong bộ nhớ.

- `HashMap` xác định bucket dựa trên `hashCode()` của key **tại thời điểm `put()`**.
- Nếu sau đó bạn sửa field ảnh hưởng tới `hashCode()` của key (ví dụ đổi giá trị field dùng để tính hash), `hashCode()` mới sẽ khác, nhưng object vẫn nằm ở **bucket cũ**.
- Khi gọi `get(keyDaSua)`, `HashMap` tính `hashCode` mới và tìm ở bucket mới — không tìm thấy vì dữ liệu thực tế vẫn nằm ở bucket cũ.
- Đây là lý do quan trọng khiến quy tắc **key của Map/Set nên là immutable** (bất biến) trở thành best practice bắt buộc, không chỉ là khuyến nghị phong cách.

</details>

**7. Cách nào để duyệt một `Map` hiệu quả nhất khi cần cả key lẫn value? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng `entrySet()`:

```java
for (Map.Entry<String, Integer> entry : map.entrySet()) {
    System.out.println(entry.getKey() + " -> " + entry.getValue());
}
```

- `entrySet()` chỉ cần **duyệt bảng băm một lần**, mỗi entry đã sẵn cả key và value.
- Nếu dùng `keySet()` rồi gọi `map.get(key)` bên trong vòng lặp, mỗi lần `get()` lại là một lần tra cứu bảng băm **riêng biệt** — tốn thêm chi phí không cần thiết (dù vẫn O(1), nhưng gấp đôi số lần truy cập bảng băm so với dùng `entrySet()`).

```java
// Kém hiệu quả hơn: mỗi vòng lặp gọi thêm một lần get() riêng
for (String key : map.keySet()) {
    System.out.println(key + " -> " + map.get(key));
}
```

</details>

**8. `computeIfAbsent()` và `merge()` (Java 8+) giúp viết code đếm/gom nhóm gọn hơn thế nào so với `getOrDefault`?**

<details className="qa">
<summary>Xem đáp án</summary>

```java
Map<String, Integer> demTu = new HashMap<>();

// Cách cũ (Java 7 trở về trước)
demTu.put(t, demTu.getOrDefault(t, 0) + 1);

// Cách mới, gọn hơn, dùng merge (Java 8+)
demTu.merge(t, 1, Integer::sum);
```

- `merge(key, value, function)`: nếu key chưa có, đặt giá trị = `value`; nếu đã có, áp dụng `function` lên (giá trị cũ, `value`) để ra giá trị mới.
- `computeIfAbsent(key, function)` thường dùng để **gom nhóm (group by)** — tự tạo collection rỗng nếu key chưa có:

```java
Map<String, List<String>> theoNhom = new HashMap<>();
theoNhom.computeIfAbsent("A", k -> new ArrayList<>()).add("An");
theoNhom.computeIfAbsent("A", k -> new ArrayList<>()).add("Anh");
// {"A": ["An", "Anh"]} — chỉ tạo ArrayList mới ở lần gọi đầu tiên
```

</details>

**9. `TreeMap` yêu cầu gì ở khóa để có thể sắp xếp? Nếu key là kiểu tự định nghĩa mà không đáp ứng, chuyện gì xảy ra?**

<details className="qa">
<summary>Xem đáp án</summary>

Giống `TreeSet`, `TreeMap` cần biết cách so sánh các khóa, thông qua:

- Khóa cài đặt `Comparable` (override `compareTo()`), hoặc
- Truyền một `Comparator` khi khởi tạo: `new TreeMap<>(comparator)`.

Nếu khóa là object tự định nghĩa không thỏa một trong hai điều kiện trên, `TreeMap` sẽ ném `ClassCastException` ngay khi `put()` phần tử đầu tiên có khóa đó, vì nó không biết đặt khóa này vào đâu trong cây đỏ-đen.

</details>

**10. `HashMap` có cho phép key hoặc value là `null` không? So với `Hashtable` và `ConcurrentHashMap`?**

<details className="qa">
<summary>Xem đáp án</summary>

| Loại | Key `null`? | Value `null`? | Thread-safe? |
|------|-------------|----------------|--------------|
| `HashMap` | Cho phép (1 key `null` duy nhất) | Cho phép | Không |
| `Hashtable` (legacy, ít dùng) | Không cho phép | Không cho phép | Có (đồng bộ toàn bộ, chậm) |
| `ConcurrentHashMap` | Không cho phép | Không cho phép | Có (khóa chia nhỏ, hiệu năng tốt) |

- Lý do `ConcurrentHashMap` cấm `null`: trong môi trường đa luồng, `get(key)` trả về `null` sẽ **mơ hồ** — không phân biệt được "key không tồn tại" hay "key tồn tại nhưng value đang là `null`" khi có luồng khác đang thao tác đồng thời, dễ gây race condition khó phát hiện.

</details>

**11. Trong một ứng dụng đa luồng, tại sao không nên dùng `HashMap` trực tiếp? Nêu cách thay thế phù hợp.**

<details className="qa">
<summary>Xem đáp án</summary>

- Nhiều luồng cùng `put()` đồng thời vào `HashMap` **không đồng bộ** có thể gây hỏng cấu trúc bảng băm nội bộ (ví dụ vòng lặp vô hạn khi resize ở các phiên bản Java cũ), mất dữ liệu, hoặc `ConcurrentModificationException` khi một luồng duyệt trong lúc luồng khác sửa đổi.
- Giải pháp:
  - `Collections.synchronizedMap(new HashMap<>())` — đơn giản, khóa toàn bộ Map cho mỗi thao tác, nhưng giảm khả năng chạy song song.
  - `ConcurrentHashMap` — lựa chọn phổ biến nhất trong thực tế, chia khóa (lock) theo từng phần dữ liệu (segment/bucket) nên nhiều luồng có thể đọc/ghi các phần khác nhau **đồng thời** mà không chặn nhau, hiệu năng tốt hơn hẳn `synchronizedMap` trong tải cao.

</details>

**12. So sánh `equals()`/`hashCode()` mặc định của `record` (Java 16+) với việc tự viết bằng tay khi dùng làm key cho `Map`.**

<details className="qa">
<summary>Xem đáp án</summary>

```java
record ToaDo(int x, int y) {}

Map<ToaDo, String> oNho = new HashMap<>();
oNho.put(new ToaDo(1, 2), "Kho bau");

System.out.println(oNho.get(new ToaDo(1, 2))); // "Kho bau" — hoạt động đúng
```

- `record` (từ Java 16) **tự động sinh** `equals()`, `hashCode()`, và `toString()` dựa trên **toàn bộ các field khai báo trong phần header**, theo đúng hợp đồng contract giữa hai phương thức — không cần tự viết tay và không lo viết sai/thiếu field.
- So với việc tự override bằng tay: `record` giảm rủi ro lỗi con người (quên override một trong hai, hoặc tính hash dựa trên field khác với field dùng trong `equals`), rất phù hợp để làm key bất biến (immutable) cho `Map`/`Set` — vì `record` mặc định cũng là immutable (mọi field đều `final`).

</details>

---

## 4. Queue (Hàng đợi)

Bài học: [4. Queue (Hàng đợi)](../../java/05-collections/4_queue.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `Queue` khác `Stack` ở nguyên tắc xử lý nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- `Queue` theo nguyên tắc **FIFO** (First In, First Out — vào trước ra trước): thêm ở cuối bằng `offer()`, lấy ở đầu bằng `poll()`.
- `Stack` theo nguyên tắc **LIFO** (Last In, First Out — vào sau ra trước): thêm và lấy đều ở cùng một đầu (đỉnh stack) bằng `push()`/`pop()`.
- Ví dụ trực quan: `Queue` giống hàng người xếp hàng mua vé (ai đến trước ra trước); `Stack` giống chồng đĩa (đĩa đặt lên sau cùng lại được lấy ra trước).

</details>

**2. Vì sao nên ưu tiên `offer`/`poll`/`peek` thay vì `add`/`remove`/`element`?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai bộ phương thức làm cùng chức năng, nhưng khác nhau cách xử lý khi hàng đợi **rỗng hoặc đầy**:

| Thao tác | Bộ an toàn | Bộ ném ngoại lệ |
|----------|-----------|------------------|
| Thêm | `offer(x)` → `false` nếu thất bại | `add(x)` → ném `IllegalStateException` |
| Lấy & xóa đầu | `poll()` → `null` nếu rỗng | `remove()` → ném `NoSuchElementException` |
| Xem đầu | `peek()` → `null` nếu rỗng | `element()` → ném `NoSuchElementException` |

- Dùng bộ `offer/poll/peek` giúp code không bị dừng đột ngột (crash) vì ngoại lệ không mong muốn khi hàng đợi rỗng — chỉ cần kiểm tra giá trị trả về (`null`/`false`) là đủ, phù hợp với các vòng lặp xử lý liên tục kiểu `while (!queue.isEmpty())`.

</details>

**3. `LinkedList` và `ArrayDeque` — cùng cài đặt `Queue`, khi nào nên chọn cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`ArrayDeque`** dùng mảng động (resizable array) làm cấu trúc bên trong, không có overhead của con trỏ liên kết như `LinkedList` — **nhanh hơn** và tiết kiệm bộ nhớ hơn cho hầu hết trường hợp dùng làm Queue hoặc Stack thuần túy.
- **`LinkedList`** dùng danh sách liên kết đôi (doubly linked list), phù hợp hơn khi cần **thêm/xóa thường xuyên ở giữa danh sách** (không chỉ hai đầu) hoặc cần vừa dùng như `List` vừa như `Queue`.
- Java Docs khuyến nghị: khi chỉ cần dùng thuần túy như Queue/Stack (chỉ thao tác ở hai đầu), nên ưu tiên `ArrayDeque` thay vì `LinkedList` vì hiệu năng tốt hơn trong đa số trường hợp.

</details>

**4. `PriorityQueue` sắp xếp thứ tự lấy ra dựa trên tiêu chí nào? Mặc định lấy ra phần tử như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- Mặc định, `PriorityQueue` lấy ra phần tử **nhỏ nhất trước** (min-heap), dựa trên **thứ tự tự nhiên (natural ordering)** — yêu cầu phần tử cài đặt `Comparable` (ví dụ `Integer`, `String` đã có sẵn).
- Có thể tùy chỉnh thứ tự bằng cách truyền một `Comparator` khi khởi tạo, ví dụ để lấy ra phần tử **lớn nhất trước** (max-heap):

```java
PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Comparator.reverseOrder());
maxHeap.offer(30);
maxHeap.offer(10);
maxHeap.offer(20);
System.out.println(maxHeap.poll()); // 30 — lớn nhất trước
```

- Cấu trúc bên trong là **heap nhị phân (binary heap)**, đảm bảo `offer()`/`poll()` có độ phức tạp O(log n), còn `peek()` là O(1).

</details>

**5. Đoạn code sau in ra thứ tự nào? Giải thích vì sao nhiều người nhầm.**

```java
Queue<Integer> pq = new PriorityQueue<>();
pq.offer(30);
pq.offer(10);
pq.offer(20);
System.out.println(pq); // in trực tiếp cả Queue
```

<details className="qa">
<summary>Xem đáp án</summary>

`System.out.println(pq)` **không** in ra theo thứ tự `10, 20, 30` mà in ra thứ tự **lưu trữ nội bộ** của heap (ví dụ có thể là `[10, 30, 20]` tùy cách heap sắp xếp cây), vì `toString()` của `PriorityQueue` duyệt mảng nội bộ chứ không đảm bảo thứ tự ưu tiên.

- Chỉ có `poll()` (gọi liên tục) mới đảm bảo lấy ra đúng thứ tự ưu tiên: nhỏ nhất trước.
- Đây là lỗi rất hay gặp: nhầm rằng in trực tiếp `PriorityQueue` sẽ hiện ra thứ tự đã sắp xếp, trong khi thực chất phải `poll()` từng phần tử ra mới đúng thứ tự.

```java
while (!pq.isEmpty()) {
    System.out.println(pq.poll()); // đúng thứ tự: 10, 20, 30
}
```

</details>

**6. `Deque` (Double-Ended Queue) khác `Queue` ở điểm nào? Vì sao `Deque` có thể đóng vai trò cả Stack lẫn Queue?**

<details className="qa">
<summary>Xem đáp án</summary>

- `Deque` (đọc là "deck", viết tắt của **Double-Ended Queue** — hàng đợi hai đầu) cho phép thêm/xóa hiệu quả ở **cả hai đầu**: `addFirst()`/`addLast()`, `removeFirst()`/`removeLast()`, `peekFirst()`/`peekLast()`.
- `Queue` thường chỉ thêm ở một đầu (cuối) và lấy ở đầu kia (đầu hàng) — chỉ hỗ trợ FIFO.
- Vì thao tác được ở cả hai đầu, `Deque` có thể mô phỏng:
  - **Queue (FIFO)**: dùng `addLast()` + `removeFirst()`.
  - **Stack (LIFO)**: dùng `addFirst()` (hoặc `push()`) + `removeFirst()` (hoặc `pop()`).
- Trong Java hiện đại, `ArrayDeque` được khuyến nghị dùng thay cho lớp `Stack` cũ (kế thừa `Vector`, đồng bộ hóa không cần thiết, được coi là legacy).

</details>

**7. Nêu một ứng dụng thực tế của `Queue` trong thuật toán duyệt đồ thị.**

<details className="qa">
<summary>Xem đáp án</summary>

`Queue` là cấu trúc trung tâm của thuật toán **BFS (Breadth-First Search — duyệt theo chiều rộng)**: duyệt đồ thị hoặc cây theo từng "lớp" (level) tính từ nút gốc, thay vì đi sâu như DFS (Depth-First Search).

```java
Queue<Node> queue = new LinkedList<>();
queue.offer(root);
Set<Node> daTham = new HashSet<>();
daTham.add(root);

while (!queue.isEmpty()) {
    Node hienTai = queue.poll();
    xuLy(hienTai);
    for (Node ke : hienTai.getNeighbors()) {
        if (!daTham.contains(ke)) {
            daTham.add(ke);
            queue.offer(ke); // thêm các nút kề vào cuối hàng đợi
        }
    }
}
```

- Nguyên tắc FIFO của Queue đảm bảo các nút ở "lớp gần gốc hơn" luôn được xử lý trước các nút ở lớp xa hơn — đúng bản chất của BFS.

</details>

**8. `BlockingQueue` là gì và giải quyết bài toán gì trong lập trình đa luồng?**

<details className="qa">
<summary>Xem đáp án</summary>

`BlockingQueue` (trong `java.util.concurrent`) là một `Queue` **thread-safe**, hỗ trợ mô hình **producer-consumer** (nhà sản xuất - người tiêu thụ):

- `put(x)`: nếu hàng đợi đầy, luồng gọi sẽ **tự động chờ (block)** cho đến khi có chỗ trống, thay vì báo lỗi ngay.
- `take()`: nếu hàng đợi rỗng, luồng gọi sẽ tự động chờ cho đến khi có phần tử mới.

```java
BlockingQueue<String> hangDoi = new LinkedBlockingQueue<>(100);

// Luồng producer: sản xuất dữ liệu
hangDoi.put("Đơn hàng #1"); // tự chờ nếu hàng đợi đầy

// Luồng consumer: xử lý dữ liệu
String donHang = hangDoi.take(); // tự chờ nếu hàng đợi rỗng
```

- Giải quyết được bài toán đồng bộ hóa giữa nhiều luồng ghi/đọc mà không cần tự viết `wait()`/`notify()` thủ công — an toàn và ít lỗi hơn.

</details>

**9. Vì sao dùng `list.remove(0)` liên tục trên `ArrayList` để mô phỏng Queue lại kém hiệu quả?**

<details className="qa">
<summary>Xem đáp án</summary>

- `ArrayList` lưu dữ liệu trong một **mảng liên tục**. `remove(0)` xóa phần tử đầu tiên, buộc phải **dịch chuyển tất cả các phần tử còn lại lên trước một ô** để lấp chỗ trống — độ phức tạp **O(n)** cho mỗi lần gọi.
- Nếu lặp lại `remove(0)` cho `n` phần tử, tổng chi phí là **O(n²)**.
- Trong khi đó, `LinkedList`/`ArrayDeque` khi dùng đúng API `poll()` (lấy từ đầu) chỉ tốn **O(1)** mỗi lần, vì cấu trúc bên trong được thiết kế để thao tác ở hai đầu hiệu quả (không cần dịch chuyển phần tử khác).
- Bài học: chọn đúng cấu trúc dữ liệu theo đúng thao tác cần làm — không nên dùng `List` để giả lập `Queue`.

</details>

**10. Trong bài toán "K phần tử lớn nhất trong mảng lớn", vì sao `PriorityQueue` thường được chọn thay vì sắp xếp toàn bộ mảng?**

<details className="qa">
<summary>Xem đáp án</summary>

- Sắp xếp toàn bộ mảng `n` phần tử rồi lấy `k` phần tử cuối có độ phức tạp **O(n log n)**.
- Dùng `PriorityQueue` (min-heap) kích thước cố định `k`: duyệt qua từng phần tử của mảng, nếu heap chưa đủ `k` phần tử thì `offer()` vào; nếu đã đủ `k` mà phần tử mới lớn hơn phần tử nhỏ nhất trong heap (`peek()`), thì `poll()` phần tử nhỏ nhất ra rồi `offer()` phần tử mới vào. Độ phức tạp tổng thể chỉ **O(n log k)** — nhanh hơn hẳn khi `k` nhỏ hơn nhiều so với `n`.

```java
PriorityQueue<Integer> minHeap = new PriorityQueue<>();
for (int x : mang) {
    minHeap.offer(x);
    if (minHeap.size() > k) {
        minHeap.poll(); // loại bỏ phần tử nhỏ nhất, chỉ giữ lại k phần tử lớn nhất
    }
}
// minHeap giờ chứa đúng k phần tử lớn nhất của mảng
```

</details>

---

## 5. Deque (Hàng đợi hai đầu)

Bài học: [5. Deque (Hàng đợi hai đầu)](../../java/05-collections/5_deque.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `Deque` khác `Queue` cốt lõi ở điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- `Queue` chỉ hỗ trợ thao tác **một đầu cho mỗi chiều**: thêm ở cuối (`offer`), lấy ở đầu (`poll`) — chỉ dùng được cho FIFO.
- `Deque` (Double-Ended Queue) hỗ trợ thao tác ở **cả hai đầu**: `addFirst`/`addLast`, `pollFirst`/`pollLast`, `peekFirst`/`peekLast` — nên dùng được cho cả FIFO (Queue) lẫn LIFO (Stack).
- Về mặt kế thừa, `Deque` là **interface con của `Queue`** (`Deque extends Queue`), nên mọi `Deque` đều có thể dùng như một `Queue`, nhưng không ngược lại.

</details>

**2. Vì sao `ArrayDeque` được khuyến nghị dùng thay cho lớp `Stack` cũ của Java?**

<details className="qa">
<summary>Xem đáp án</summary>

- Lớp `Stack` (trong `java.util`) kế thừa từ `Vector` — một cấu trúc **đồng bộ hóa (synchronized)** cho mọi thao tác, dù chương trình đơn luồng vẫn phải trả chi phí khóa (lock) không cần thiết, làm chậm hiệu năng.
- `Stack` cũng có thiết kế lỗi thời: kế thừa từ `Vector` khiến nó "lỡ" thừa hưởng các phương thức truy cập theo chỉ số (`get(i)`, `insertElementAt()`...) vốn phá vỡ nguyên tắc đóng gói của một ngăn xếp thuần túy.
- `ArrayDeque` không đồng bộ hóa (không thread-safe, nhưng nhanh hơn nhiều trong ngữ cảnh đơn luồng), cấu trúc dựa trên mảng động thuần túy, và có API `push()`/`pop()`/`peek()` rõ ràng, đúng ngữ nghĩa Stack. Java documentation chính thức khuyến nghị dùng `ArrayDeque` thay cho `Stack`.

</details>

**3. Đoạn code sau in ra gì? Giải thích cơ chế `push`/`pop` của `Deque`.**

```java
Deque<Integer> stack = new ArrayDeque<>();
stack.push(1);
stack.push(2);
stack.push(3);
System.out.println(stack.pop());
System.out.println(stack.peek());
```

<details className="qa">
<summary>Xem đáp án</summary>

In ra `3` rồi `2`.

- `push(x)` trên `Deque` thực chất là gọi `addFirst(x)` — luôn thêm vào **đầu** deque.
- `pop()` thực chất là gọi `removeFirst()` — luôn lấy và xóa phần tử ở **đầu** deque.
- Vì cả hai đều thao tác ở cùng một đầu (đầu = đỉnh stack), thứ tự lấy ra tuân theo **LIFO** (Last In, First Out): `3` được đẩy vào sau cùng nên lấy ra trước.
- Sau khi `pop()` lấy `3` ra, deque còn `[2, 1]`, nên `peek()` (thực chất là `peekFirst()`) trả về `2`.

</details>

**4. Nếu dùng nhầm `pollLast()` xen giữa các lệnh `push`/`pop` khi mô phỏng Stack, chuyện gì xảy ra?**

<details className="qa">
<summary>Xem đáp án</summary>

Logic LIFO sẽ **bị phá vỡ**, vì `push`/`pop` thao tác ở đầu (`First`), còn `pollLast()` lại lấy ở cuối (`Last`) — hai đầu khác nhau của cùng một deque.

```java
Deque<Integer> stack = new ArrayDeque<>();
stack.push(1); // [1]
stack.push(2); // [2, 1]
stack.push(3); // [3, 2, 1]

stack.pollLast(); // lấy nhầm ở cuối -> lấy ra 1 (không phải phần tử vừa push gần nhất!)
```

- Đây là lỗi thường gặp khi lập trình viên không nắm rõ Deque là cấu trúc **hai đầu**, và trộn lẫn hai bộ phương thức (`push`/`pop` cho Stack, `offerLast`/`pollLast` cho Queue) trên cùng một biến mà không nhất quán đầu nào là "đỉnh".
- Quy tắc an toàn: khi dùng Deque làm Stack, chỉ dùng nhất quán `push()`/`pop()`/`peek()` (đều ở đầu First); khi dùng làm Queue, chỉ dùng nhất quán `offerLast()`/`pollFirst()`.

</details>

**5. Nêu ứng dụng của `Deque` trong bài toán "cửa sổ trượt" (sliding window), ví dụ tìm giá trị lớn nhất trong mỗi cửa sổ kích thước k.**

<details className="qa">
<summary>Xem đáp án</summary>

Thuật toán **"Sliding Window Maximum"** dùng một `Deque` lưu **chỉ số** (index) của phần tử, giữ deque theo thứ tự **giảm dần giá trị**:

```java
Deque<Integer> deque = new ArrayDeque<>(); // lưu chỉ số

for (int i = 0; i < mang.length; i++) {
    // Xóa chỉ số ra khỏi phạm vi cửa sổ hiện tại
    if (!deque.isEmpty() && deque.peekFirst() <= i - k) {
        deque.pollFirst();
    }
    // Xóa các phần tử ở cuối deque nhỏ hơn phần tử hiện tại (chúng không còn cơ hội là max)
    while (!deque.isEmpty() && mang[deque.peekLast()] < mang[i]) {
        deque.pollLast();
    }
    deque.offerLast(i);

    if (i >= k - 1) {
        System.out.println(mang[deque.peekFirst()]); // giá trị lớn nhất của cửa sổ hiện tại
    }
}
```

- Nhờ thao tác được ở **cả hai đầu** với O(1), thuật toán đạt độ phức tạp tổng thể **O(n)**, thay vì O(n·k) nếu duyệt lại từng cửa sổ.

</details>

**6. `ArrayDeque` có cho phép phần tử `null` không? Vì sao thiết kế như vậy?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không** — thêm `null` vào `ArrayDeque` (qua `add`, `offer`, `push`...) sẽ ném `NullPointerException` ngay lập tức.

- Lý do: các phương thức "xem/lấy an toàn" như `peekFirst()`, `pollFirst()` dùng giá trị trả về `null` để báo hiệu **"deque rỗng, không có phần tử"**. Nếu cho phép `null` là một phần tử hợp lệ, sẽ không thể phân biệt được "deque rỗng" và "phần tử đầu deque chính là `null`" — gây mơ hồ (ambiguous) khi kiểm tra kết quả trả về.
- Đây cũng là lý do tương tự khiến `ConcurrentHashMap` cấm `null` cho key và value.

</details>

**7. So sánh độ phức tạp và cách dùng bộ nhớ giữa `ArrayDeque` và `LinkedList` khi cùng đóng vai trò `Deque`.**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | `ArrayDeque` | `LinkedList` |
|----------|--------------|--------------|
| Cấu trúc bên trong | Mảng động (circular array) | Danh sách liên kết đôi (node + 2 con trỏ) |
| Thêm/xóa ở hai đầu | O(1) amortized | O(1) |
| Bộ nhớ mỗi phần tử | Chỉ dữ liệu, gần như không overhead | Mỗi phần tử là một `Node` object riêng, tốn thêm bộ nhớ cho 2 con trỏ (prev/next) |
| Cache locality (khả năng tận dụng cache CPU) | Tốt hơn (dữ liệu liên tục trong mảng) | Kém hơn (các node rải rác trên heap) |

- Vì lý do bộ nhớ và cache locality, `ArrayDeque` thường **nhanh hơn thực tế** dù độ phức tạp Big-O tương đương, và được Java khuyến nghị làm lựa chọn mặc định cho Stack/Queue thuần túy.

</details>

**8. `Deque` có thể dùng để cài đặt thuật toán kiểm tra chuỗi đối xứng (palindrome) như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

```java
boolean laPalindrome(String s) {
    Deque<Character> deque = new ArrayDeque<>();
    for (char c : s.toCharArray()) {
        deque.addLast(c);
    }

    while (deque.size() > 1) {
        if (!deque.pollFirst().equals(deque.pollLast())) {
            return false; // ký tự đầu và cuối không khớp
        }
    }
    return true;
}
```

- Ý tưởng: đưa toàn bộ ký tự vào `Deque`, rồi liên tục so sánh **ký tự đầu và ký tự cuối**, thu hẹp dần vào giữa. Đây là ứng dụng trực tiếp của khả năng thao tác đồng thời ở cả hai đầu mà `Deque` cung cấp, điều mà `Queue` một chiều không làm được gọn gàng như vậy.

</details>

**9. `ArrayDeque` có thread-safe không? Nếu cần một Deque an toàn cho đa luồng thì dùng gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không**, `ArrayDeque` không đồng bộ hóa và không an toàn khi nhiều luồng cùng đọc/ghi đồng thời — tương tự `ArrayList`/`HashMap`.

Với nhu cầu đa luồng, Java cung cấp các lựa chọn trong `java.util.concurrent`:

- `ConcurrentLinkedDeque` — deque non-blocking (không chặn luồng), dùng thuật toán lock-free, phù hợp khi cần hiệu năng cao và không cần luồng "chờ" khi deque rỗng/đầy.
- `LinkedBlockingDeque` — deque hỗ trợ **blocking** (luồng tự động chờ khi rỗng/đầy), thường dùng cho mô hình producer-consumer cần giới hạn dung lượng (bounded).

</details>

---

## 6. Stack (Ngăn xếp)

Bài học: [6. Stack (Ngăn xếp)](../../java/05-collections/6_stack.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Nguyên tắc LIFO của Stack là gì? Cho ví dụ thực tế ngoài đời.**

<details className="qa">
<summary>Xem đáp án</summary>

**LIFO** (Last In, First Out — vào sau, ra trước): phần tử được thêm vào **gần nhất** sẽ được lấy ra **đầu tiên**.

- Ví dụ ngoài đời: chồng đĩa trong bếp — bạn đặt đĩa mới rửa lên trên cùng, và khi cần dùng lại lấy đĩa trên cùng xuống trước, không rút được đĩa ở giữa hay dưới đáy.
- Trong Java: `push(x)` đẩy `x` lên đỉnh, `pop()` lấy và xóa phần tử ở đỉnh, `peek()` xem đỉnh mà không xóa.

</details>

**2. Vì sao Java khuyến nghị không dùng lớp `Stack` (`java.util.Stack`) cho code mới?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai lý do chính:

1. **Chậm không cần thiết**: `Stack` kế thừa từ `Vector`, khiến mọi thao tác (`push`, `pop`, `peek`) đều bị **đồng bộ hóa (synchronized)** — tốn chi phí khóa (lock) ngay cả khi chương trình chạy đơn luồng và không cần an toàn đa luồng.
2. **Thiết kế kế thừa kém**: vì là subclass của `Vector`, `Stack` "lỡ" thừa hưởng các phương thức truy cập theo chỉ số như `get(i)`, `insertElementAt()`, `remove(i)` — những thao tác phá vỡ ngữ nghĩa thuần túy của một ngăn xếp (chỉ nên thao tác ở đỉnh), dễ khiến người dùng vô tình thao túng dữ liệu sai cách.

Java documentation chính thức khuyến nghị dùng `ArrayDeque` thay thế, với API `push`/`pop`/`peek` giữ nguyên.

</details>

**3. `Deque` (`ArrayDeque`) thay thế `Stack` như thế nào? Vì hai đầu của `Deque`, làm sao biết đầu nào là "đỉnh"?**

<details className="qa">
<summary>Xem đáp án</summary>

```java
Deque<Integer> stack = new ArrayDeque<>();
stack.push(10); // thực chất gọi addFirst(10)
stack.push(20); // thực chất gọi addFirst(20)
System.out.println(stack.pop()); // thực chất gọi removeFirst() -> 20
```

- Khi dùng `Deque` làm Stack, **đầu (First)** luôn đóng vai trò "đỉnh": `push()` = `addFirst()`, `pop()` = `removeFirst()`, `peek()` = `peekFirst()`.
- Miễn là chỉ dùng nhất quán bộ ba phương thức này (không trộn lẫn với `offerLast`/`pollLast`), logic LIFO luôn đúng, bất kể tên gọi bên trong là "đầu" hay "đỉnh".

</details>

**4. Đoạn code sau ném lỗi gì? So sánh cách xử lý lỗi giữa `Stack` cũ và `ArrayDeque`.**

```java
Stack<Integer> stack = new Stack<>();
stack.pop();
```

<details className="qa">
<summary>Xem đáp án</summary>

Ném `EmptyStackException` — một ngoại lệ **riêng của lớp `Stack`**, kế thừa `RuntimeException`.

- Nếu thay bằng `ArrayDeque`: `new ArrayDeque<Integer>().pop()` sẽ ném `NoSuchElementException` thay vì `EmptyStackException` — vì `pop()` của `Deque` thực chất gọi `removeFirst()`, và mọi phương thức `removeXxx()` trên collection rỗng đều ném `NoSuchElementException` theo quy ước chung của Collections Framework.
- Bài học: khi chuyển từ `Stack` sang `ArrayDeque`, nếu code cũ có bắt `catch (EmptyStackException e)`, phải đổi sang bắt `NoSuchElementException`.
- Cách phòng tránh chung cho cả hai: luôn kiểm tra `isEmpty()` trước khi `pop()`, hoặc dùng `pollFirst()` (trả về `null` thay vì ném lỗi) nếu chấp nhận xử lý `null`.

</details>

**5. Trình bày thuật toán dùng Stack để kiểm tra chuỗi ngoặc `()[]{}` có cân bằng hay không. Vì sao phải dùng Stack thay vì đếm số lượng ngoặc mở/đóng đơn giản?**

<details className="qa">
<summary>Xem đáp án</summary>

```java
boolean kiemTraNgoac(String s) {
    Deque<Character> stack = new ArrayDeque<>();
    for (char c : s.toCharArray()) {
        if (c == '(' || c == '[' || c == '{') {
            stack.push(c);
        } else if (c == ')' || c == ']' || c == '}') {
            if (stack.isEmpty()) return false;
            char mo = stack.pop();
            if ((c == ')' && mo != '(') || (c == ']' && mo != '[') || (c == '}' && mo != '{')) {
                return false;
            }
        }
    }
    return stack.isEmpty();
}
```

- Chỉ đếm số lượng ngoặc mở/đóng **không đủ**, vì không kiểm tra được **thứ tự lồng nhau đúng loại**. Ví dụ `"(a[b)]"` có số ngoặc mở/đóng bằng nhau, nhưng thứ tự sai — cặp `[...]` bị chồng chéo (overlap) không hợp lệ với `(...)`.
- Stack giải quyết được vì bản chất bài toán này chính là kiểm tra **LIFO**: ngoặc đóng gặp phải phải khớp với ngoặc mở **gần nhất, chưa đóng** — đúng thứ tự mà Stack đảm bảo tự nhiên.

</details>

**6. Nêu mối liên hệ giữa Stack và cơ chế Call Stack (ngăn xếp lời gọi hàm) khi Java thực thi đệ quy (recursion).**

<details className="qa">
<summary>Xem đáp án</summary>

- Mỗi khi một phương thức được gọi (kể cả gọi đệ quy chính nó), JVM đẩy một **stack frame** (khung ngăn xếp — chứa biến cục bộ, tham số, địa chỉ trả về) vào **Call Stack** của luồng hiện tại.
- Khi phương thức kết thúc (`return`), frame tương ứng bị **pop** ra khỏi Call Stack, và luồng thực thi quay lại đúng vị trí đã gọi.
- Đệ quy sâu quá mức (ví dụ vòng lặp vô hạn không có điều kiện dừng) sẽ khiến Call Stack tăng liên tục cho tới khi vượt quá dung lượng cho phép, ném ra `StackOverflowError`.
- Vì cùng nguyên lý LIFO này, nhiều bài toán đệ quy có thể được **chuyển đổi thành vòng lặp tường minh (iterative)** bằng cách tự quản lý một `Deque`/`Stack` để mô phỏng call stack thủ công — tránh rủi ro `StackOverflowError` với dữ liệu lớn.

</details>

**7. Stack được dùng trong thuật toán DFS (Depth-First Search) như thế nào? So sánh với Queue trong BFS.**

<details className="qa">
<summary>Xem đáp án</summary>

```java
Deque<Node> stack = new ArrayDeque<>();
stack.push(root);
Set<Node> daTham = new HashSet<>();

while (!stack.isEmpty()) {
    Node hienTai = stack.pop();
    if (daTham.contains(hienTai)) continue;
    daTham.add(hienTai);
    xuLy(hienTai);
    for (Node ke : hienTai.getNeighbors()) {
        stack.push(ke);
    }
}
```

- **DFS** dùng Stack (LIFO): luôn đi **sâu vào nhánh vừa phát hiện gần nhất** trước khi quay lại các nhánh khác — vì phần tử `push` sau cùng luôn được `pop` ra xử lý trước.
- **BFS** dùng Queue (FIFO): luôn xử lý hết các nút ở "lớp gần gốc hơn" trước khi sang lớp xa hơn.
- Bản thân đệ quy DFS (không tự khai báo Stack) cũng hoạt động theo nguyên lý này, vì nó dựa trên Call Stack có sẵn của JVM.

</details>

**8. `ArrayDeque` khi dùng làm Stack có thread-safe không? Nếu cần Stack an toàn cho đa luồng thì làm sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không**, `ArrayDeque` không đồng bộ hóa, không an toàn khi nhiều luồng cùng `push`/`pop` đồng thời — đây chính là đánh đổi để đổi lấy tốc độ so với lớp `Stack` cũ.

Các lựa chọn khi cần an toàn đa luồng:

- `ConcurrentLinkedDeque` — cấu trúc **lock-free** (không dùng khóa truyền thống), phù hợp khi cần hiệu năng cao trong môi trường đa luồng mà không cần blocking.
- `Collections.synchronizedDeque(...)` không tồn tại sẵn trong JDK chuẩn — thường phải tự bọc thủ công bằng khóa (`synchronized` block) nếu bắt buộc phải dùng `ArrayDeque` trong ngữ cảnh đa luồng đơn giản.
- Nếu cần blocking (luồng tự chờ khi Stack rỗng/đầy), cân nhắc `LinkedBlockingDeque`.

</details>

**9. `EmptyStackException` và `NoSuchElementException` khác nhau thế nào trong hệ thống phân cấp exception của Java?**

<details className="qa">
<summary>Xem đáp án</summary>

- `EmptyStackException` (`java.util`): kế thừa trực tiếp từ `RuntimeException`, được thiết kế **riêng cho lớp `Stack`** — chỉ xuất hiện khi gọi `pop()`/`peek()` trên `Stack` rỗng.
- `NoSuchElementException` (`java.util`): cũng kế thừa `RuntimeException`, nhưng là ngoại lệ **dùng chung cho nhiều cấu trúc** trong Collections Framework — ném ra khi gọi các phương thức `removeXxx()`/`getXxx()`/`next()` (kể cả `Iterator`) trên cấu trúc rỗng hoặc đã hết phần tử.
- Cả hai đều là **unchecked exception** (không bắt buộc khai báo `throws` hay `try-catch`), nên lập trình viên dễ bỏ sót nếu không chủ động kiểm tra `isEmpty()` trước khi thao tác.

</details>

---

## 7. Iterator

Bài học: [7. Iterator](../../java/05-collections/7_iterator.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Vì sao Java thiết kế Iterator như một interface thống nhất thay vì để mỗi collection tự cung cấp cách duyệt riêng?**

<details className="qa">
<summary>Xem đáp án</summary>

- Mỗi cấu trúc dữ liệu lưu trữ khác nhau (mảng liên tục, node liên kết, cây, bảng băm...), nếu duyệt theo cách riêng của từng loại, code gọi sẽ **phụ thuộc chặt (tight coupling)** vào chi tiết cài đặt bên trong — khó thay đổi loại collection sau này mà không sửa code duyệt.
- `Iterator` là một ví dụ kinh điển của nguyên tắc **lập trình theo interface, không theo implementation cụ thể**: chỉ cần gọi `hasNext()`/`next()`, không cần biết bên dưới là `ArrayList` hay `LinkedList` hay `HashSet`.
- Đây cũng chính là nền tảng để vòng lặp `for-each` hoạt động thống nhất trên mọi lớp implement `Iterable`.

</details>

**2. Đoạn code sau ném lỗi gì? Giải thích nguyên nhân sâu xa.**

```java
List<Integer> list = new ArrayList<>(List.of(1, 2, 3));
for (Integer n : list) {
    if (n == 2) {
        list.remove(n);
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

Ném `ConcurrentModificationException`.

- Vòng lặp `for-each` thực chất dùng `Iterator` bên dưới. `ArrayList` có một biến đếm nội bộ gọi là **`modCount`** (số lần cấu trúc bị sửa đổi cấu trúc — thêm/xóa phần tử).
- `Iterator` ghi nhớ giá trị `modCount` tại thời điểm được tạo ra (`expectedModCount`). Mỗi lần gọi `next()`, nó so sánh `modCount` hiện tại của list với `expectedModCount` đã lưu.
- `list.remove(n)` gọi trực tiếp trên list (không qua iterator) làm tăng `modCount`, nhưng không cập nhật `expectedModCount` của iterator đang duyệt dở. Lần gọi `next()` kế tiếp phát hiện chênh lệch và ném exception ngay — đây gọi là cơ chế **fail-fast**.

</details>

**3. `iterator.remove()` giải quyết vấn đề trên như thế nào? Vì sao nó được coi là an toàn?**

<details className="qa">
<summary>Xem đáp án</summary>

```java
Iterator<Integer> it = list.iterator();
while (it.hasNext()) {
    if (it.next() == 2) {
        it.remove(); // an toàn
    }
}
```

- `iterator.remove()` xóa phần tử **thông qua chính iterator đang duyệt**, nên nó có thể đồng bộ lại `expectedModCount` của iterator bằng `modCount` mới nhất của collection ngay sau khi xóa — không gây ra sự chênh lệch bị fail-fast phát hiện ở lần `next()` kế tiếp.
- Đây là lý do `iterator.remove()` được coi là cách **duy nhất an toàn** để xóa phần tử trong lúc đang duyệt bằng Iterator (for-each không cung cấp cách nào để xóa an toàn, vì nó không cho truy cập trực tiếp vào iterator ẩn bên dưới).

</details>

**4. Cơ chế fail-fast của Iterator có đảm bảo phát hiện MỌI trường hợp sửa đổi đồng thời không? Vì sao Javadoc khuyến cáo không nên dựa vào nó để viết logic quan trọng?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không đảm bảo tuyệt đối.** Javadoc của `ConcurrentModificationException` nêu rõ: cơ chế fail-fast chỉ nỗ lực **phát hiện lỗi tốt nhất có thể (best-effort)**, không phải một đảm bảo chắc chắn.

- Trong môi trường đa luồng, có những tình huống race condition (tranh chấp luồng) mà `modCount` vẫn khớp một cách "may mắn" dù dữ liệu đã bị sửa đổi không nhất quán, khiến fail-fast **không phát hiện ra** lỗi.
- Vì vậy, Javadoc khuyến cáo: **không nên viết chương trình mà tính đúng đắn phụ thuộc vào việc `ConcurrentModificationException` chắc chắn được ném ra** — nó chỉ nên dùng để phát hiện bug khi debug/phát triển, không phải cơ chế đồng bộ hóa (synchronization) đáng tin cậy.
- Với môi trường đa luồng thực sự, cần dùng các cấu trúc thread-safe chuyên dụng như `CopyOnWriteArrayList` hoặc `ConcurrentHashMap` thay vì trông chờ vào fail-fast.

</details>

**5. `ListIterator` khác `Iterator` ở những điểm nào? Vì sao `ListIterator` chỉ áp dụng được cho `List`, không áp dụng cho `Set`?**

<details className="qa">
<summary>Xem đáp án</summary>

| Khả năng | `Iterator` | `ListIterator` |
|----------|-----------|-----------------|
| Duyệt tiến (`hasNext`/`next`) | Có | Có |
| Duyệt lùi (`hasPrevious`/`previous`) | Không | Có |
| Xóa phần tử (`remove()`) | Có | Có |
| Sửa phần tử vừa duyệt (`set()`) | Không | Có |
| Thêm phần tử mới (`add()`) | Không | Có |
| Lấy chỉ số hiện tại (`nextIndex`/`previousIndex`) | Không | Có |

- `ListIterator` cần khái niệm **vị trí/chỉ số (index)** để hỗ trợ duyệt lùi và `add`/`set` đúng vị trí — điều mà chỉ `List` (có thứ tự, truy cập theo chỉ số) mới có ý nghĩa.
- `Set` (không có thứ tự chỉ số cố định, đặc biệt `HashSet`) không có khái niệm "vị trí i" để `ListIterator` có thể thao tác, nên interface `Set` không cung cấp `listIterator()`.

</details>

**6. Vì sao gọi `it.remove()` hai lần liên tiếp (không gọi `next()` ở giữa) lại ném lỗi? Lỗi gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Ném `IllegalStateException`.

- `remove()` chỉ được phép xóa phần tử **vừa mới được trả về bởi lần gọi `next()` gần nhất**. Nội bộ, Iterator ghi nhớ "phần tử hiện tại đã hợp lệ để xóa" chỉ ngay sau `next()`.
- Sau khi `remove()` được gọi một lần, trạng thái "hợp lệ để xóa" bị **reset**. Gọi `remove()` lần thứ hai mà chưa có `next()` mới ở giữa sẽ vi phạm điều kiện tiên quyết này, và Iterator ném `IllegalStateException` để báo lỗi sử dụng sai quy trình.
- Quy tắc đúng: mỗi lần `remove()` phải có đúng một lần `next()` đứng ngay trước nó.

</details>

**7. Điều gì xảy ra khi gọi `next()` trên một Iterator đã duyệt hết phần tử (khi `hasNext()` trả về `false`)?**

<details className="qa">
<summary>Xem đáp án</summary>

Ném `NoSuchElementException`.

- Đây là lý do quy trình chuẩn luôn là: kiểm tra `hasNext()` **trước**, chỉ gọi `next()` khi `hasNext()` trả về `true`.
- Đây cũng là ngoại lệ dùng chung trong nhiều tình huống "hết phần tử" khác của Collections Framework (ví dụ `Deque.remove()` khi rỗng), không riêng gì Iterator.

</details>

**8. `Iterable` và `Iterator` khác nhau thế nào? Vai trò của mỗi interface trong việc cho phép một class dùng được với vòng lặp `for-each`?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`Iterable<T>`**: interface chỉ có một phương thức `iterator()`, trả về một `Iterator<T>`. Một class **implements `Iterable`** thì mới dùng được trực tiếp trong cú pháp `for (T x : obj)`.
- **`Iterator<T>`**: interface đại diện cho "trạng thái duyệt hiện tại" — có `hasNext()`, `next()`, `remove()`. Nó là đối tượng được **`Iterable.iterator()`** tạo ra và trả về mỗi lần gọi.
- Quan hệ: mọi `Collection` (List, Set...) đều `extends Iterable`, nên chúng đều dùng được với for-each. Nếu bạn tự viết một class dữ liệu tùy chỉnh (ví dụ cây nhị phân riêng) và muốn nó dùng được với for-each, class đó phải tự `implements Iterable<T>` và cài đặt `iterator()` trả về một `Iterator` tùy chỉnh.

</details>

**9. Vì sao Iterator có thể coi là một ứng dụng của Iterator Design Pattern? Lợi ích chính của pattern này là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Iterator Pattern** (một trong các Gang of Four design pattern) tách rời **logic duyệt** ra khỏi **cấu trúc dữ liệu lưu trữ** — cho phép truy cập tuần tự các phần tử của một tập hợp mà không cần lộ chi tiết cài đặt bên trong (mảng, node, cây...).

Lợi ích chính:

- **Tính đa hình khi duyệt (polymorphic traversal)**: cùng một đoạn code duyệt (`hasNext`/`next`) hoạt động với mọi loại collection.
- **Nhiều iterator độc lập trên cùng một collection**: có thể tạo nhiều `Iterator` khác nhau đang duyệt collection đồng thời, mỗi cái giữ trạng thái vị trí riêng (con trỏ nội bộ) mà không ảnh hưởng lẫn nhau.
- **Tách biệt trách nhiệm (separation of concerns)**: collection chỉ lo lưu trữ dữ liệu, còn Iterator lo việc duyệt — tuân theo nguyên tắc Single Responsibility trong SOLID.

</details>

**10. Duyệt và xóa phần tử trong một `Map` (ví dụ xóa các entry có value âm) an toàn nhất bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

```java
Map<String, Integer> map = new HashMap<>();
map.put("A", -1);
map.put("B", 5);

// Đúng cách: lấy Iterator từ entrySet() rồi remove qua iterator
Iterator<Map.Entry<String, Integer>> it = map.entrySet().iterator();
while (it.hasNext()) {
    Map.Entry<String, Integer> entry = it.next();
    if (entry.getValue() < 0) {
        it.remove(); // xóa an toàn khỏi map gốc
    }
}
```

- `Map` không implement `Iterable` trực tiếp và không có `remove()` an toàn khi duyệt trực tiếp bằng for-each trên `entrySet()`/`keySet()`. Phải lấy `Iterator` tường minh từ view (`entrySet().iterator()`) rồi gọi `it.remove()`, tương tự nguyên tắc áp dụng cho `List`/`Set`.
- Một lựa chọn thay thế gọn hơn từ Java 8: `map.values().removeIf(v -> v < 0)` hoặc `map.entrySet().removeIf(e -> e.getValue() < 0)` — dùng `Predicate` để lọc và xóa mà không cần tự viết Iterator thủ công.

</details>

---

## 8. Generic Collections

Bài học: [8. Generic Collections](../../java/05-collections/8_generic-collections.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Generics mang lại lợi ích gì so với dùng raw type (kiểu thô)?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Type safety (an toàn kiểu)**: trình biên dịch bắt lỗi sai kiểu **ngay lúc biên dịch**, thay vì để lộ ra thành `ClassCastException` lúc chạy.
- **Không cần ép kiểu (cast)**: lấy phần tử ra từ `List<String>` đã đúng kiểu `String` sẵn, không cần viết `(String) list.get(i)`.
- **Code rõ ràng, dễ đọc**: nhìn `List<User>` là biết ngay collection chứa gì, không cần đoán hay xem tài liệu.
- **IDE hỗ trợ tốt hơn**: autocomplete, gợi ý phương thức đúng theo kiểu phần tử.

</details>

**2. Generics trong Java được cài đặt bằng cơ chế nào? Điều này dẫn tới hệ quả gì lúc runtime?**

<details className="qa">
<summary>Xem đáp án</summary>

Generics được cài đặt bằng **type erasure** (xóa kiểu): trình biên dịch dùng thông tin generic để **kiểm tra kiểu lúc biên dịch**, nhưng sau khi biên dịch xong, mọi thông tin generic bị **xóa bỏ** khỏi bytecode — `List<String>` và `List<Integer>` đều trở thành cùng một `List` (chứa `Object`) khi chạy.

```java
List<String> a = new ArrayList<>();
List<Integer> b = new ArrayList<>();
System.out.println(a.getClass() == b.getClass()); // true — cùng là ArrayList.class lúc runtime
```

Hệ quả: không thể lấy được kiểu generic thực tế lúc runtime bằng reflection (ví dụ không thể viết `if (list instanceof List<String>)` — đây là lỗi biên dịch), và không thể tạo mảng generic trực tiếp (`new T[10]` không hợp lệ).

</details>

**3. Đoạn code sau ném lỗi gì lúc chạy? Vì sao trình biên dịch không bắt được ở lúc biên dịch?**

```java
List raw = new ArrayList();
raw.add("An");
raw.add(123);

List<String> ten = raw; // generic warning, nhưng vẫn biên dịch được
for (String t : ten) {
    System.out.println(t.toUpperCase());
}
```

<details className="qa">
<summary>Xem đáp án</summary>

Ném `ClassCastException` khi vòng lặp `for-each` chạy tới phần tử `123` — vì bên dưới, Java tự động chèn một lệnh ép kiểu ẩn `(String) raw.get(i)`, và `123` (kiểu `Integer`) không thể ép sang `String`.

- Vì `raw` là **raw type** (không có `<>`), trình biên dịch **không kiểm tra được kiểu phần tử thêm vào** (`raw.add(123)` biên dịch bình thường, chỉ mất type safety).
- Khi gán `raw` vào biến `List<String> ten`, trình biên dịch chỉ đưa ra **cảnh báo (unchecked warning)**, không phải lỗi cứng, vì về mặt kỹ thuật (do type erasure) nó không thể chứng minh được điều này sai lúc biên dịch.
- Lỗi chỉ thực sự lộ ra khi chương trình **chạy đến** dòng cố ép kiểu phần tử sai — minh chứng rõ ràng cho việc mất type safety khi trộn raw type với generic.

</details>

**4. `List<?>` (unbounded wildcard) khác gì với `List<Object>`? Vì sao không thể `add()` phần tử vào `List<?>`?**

<details className="qa">
<summary>Xem đáp án</summary>

- `List<Object>` là một List **cụ thể chỉ chứa `Object`** — có thể `add()` bất kỳ object nào vào, vì mọi kiểu đều là subtype của `Object`.
- `List<?>` nghĩa là "một List chứa **một kiểu nào đó, chưa xác định**" — có thể là `List<String>`, `List<Integer>`, hay bất kỳ `List<T>` nào, nhưng compiler **không biết chính xác `T` là gì** tại điểm đó.
- Vì không biết `T` là gì, trình biên dịch **không thể đảm bảo an toàn** nếu cho phép `add()` một giá trị cụ thể (ví dụ `add("abc")` có thể phá vỡ tính đúng đắn nếu List thật sự là `List<Integer>`). Do đó Java **cấm** `add()` vào `List<?>` (trừ `add(null)`, vì `null` hợp lệ với mọi kiểu tham chiếu).
- `List<?>` chủ yếu dùng để **đọc (read-only)** — lấy phần tử ra dưới dạng `Object`.

</details>

**5. Giải thích nguyên tắc PECS (Producer Extends, Consumer Super) khi chọn giữa `<? extends T>` và `<? super T>`.**

<details className="qa">
<summary>Xem đáp án</summary>

**PECS** = **P**roducer **E**xtends, **C**onsumer **S**uper — quy tắc ghi nhớ khi nào dùng wildcard nào:

- Dùng `<? extends T>` khi collection đóng vai trò **producer** (nguồn cung cấp dữ liệu) — bạn chỉ **đọc** phần tử ra từ nó.

```java
public static double tinhTong(List<? extends Number> ds) { // chỉ đọc (produce)
    double tong = 0;
    for (Number n : ds) tong += n.doubleValue();
    return tong;
}
```

- Dùng `<? super T>` khi collection đóng vai trò **consumer** (nơi tiếp nhận dữ liệu) — bạn chỉ **ghi** phần tử vào nó.

```java
public static void themSo(List<? super Integer> ds) { // chỉ ghi (consume)
    ds.add(1);
    ds.add(2);
}
// Dùng được với List<Integer>, List<Number>, List<Object>
```

- Nếu vừa cần đọc vừa cần ghi cùng kiểu cụ thể, không dùng wildcard mà dùng kiểu tham số thông thường (ví dụ `<T>`).

</details>

**6. Vì sao không thể viết `List<int>` mà phải viết `List<Integer>`?**

<details className="qa">
<summary>Xem đáp án</summary>

- Generics trong Java chỉ hoạt động với **kiểu tham chiếu (reference type)**, vì cơ chế type erasure biến mọi tham số kiểu generic (`T`, `E`...) thành `Object` lúc runtime — và kiểu nguyên thủy (`int`, `double`, `boolean`...) không phải là subtype của `Object`, không thể "erasure" về `Object` được.
- Vì vậy phải dùng **lớp bọc (wrapper class)** tương ứng: `Integer` thay `int`, `Double` thay `double`.
- Nhờ **autoboxing/unboxing** (Java 5+), bạn vẫn viết `list.add(5)` tự nhiên — Java tự động bọc `5` thành `Integer.valueOf(5)` phía sau.

</details>

**7. Bounded type `<T extends Comparable<T>>` nghĩa là gì? Cho ví dụ ứng dụng thực tế.**

<details className="qa">
<summary>Xem đáp án</summary>

`<T extends Comparable<T>>` giới hạn `T` phải là một kiểu **có khả năng so sánh với chính nó** — tức là đã cài đặt interface `Comparable<T>` (có phương thức `compareTo(T o)`).

```java
public static <T extends Comparable<T>> T timMax(List<T> ds) {
    T max = ds.get(0);
    for (T x : ds) {
        if (x.compareTo(max) > 0) {
            max = x;
        }
    }
    return max;
}

// Dùng được vì Integer, String đều implement Comparable
System.out.println(timMax(List.of(3, 7, 2)));       // 7
System.out.println(timMax(List.of("cam", "buoi"))); // "cam" (theo thứ tự chữ cái)
```

- Nhờ bounded type, phương thức `timMax` có thể gọi `x.compareTo(max)` một cách an toàn — nếu không giới hạn, trình biên dịch sẽ báo lỗi vì `T` (không giới hạn) không đảm bảo có phương thức `compareTo()`.

</details>

**8. Vì sao Java không cho phép tạo mảng generic trực tiếp, ví dụ `new T[10]` hay `new List<String>[10]`?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì mảng trong Java là **reified (giữ lại thông tin kiểu lúc runtime)** — mảng biết chính xác kiểu phần tử của nó và kiểm tra kiểu khi gán (`ArrayStoreException` nếu sai). Trong khi đó, generics dùng **type erasure**, nghĩa là thông tin kiểu (`T`, `String` trong `List<String>`) **bị xóa lúc runtime**.

- Nếu Java cho phép `new List<String>[10]`, rồi gán một `List<Integer>` vào một phần tử của mảng đó (do mảng chỉ kiểm tra kiểu "thô" là `List`, không phân biệt được `List<String>` hay `List<Integer>` lúc runtime), sẽ phá vỡ tính an toàn kiểu mà mảng vốn đảm bảo — dẫn tới lỗi `ClassCastException` âm thầm ở một chỗ khác không liên quan.
- Vì hai cơ chế (mảng reified và generic type-erased) mâu thuẫn nhau về triết lý, Java chọn **cấm tạo mảng generic** để tránh lỗ hổng an toàn kiểu này.

</details>

**9. Sự khác nhau giữa phương thức generic (`<T> void method(T t)`) và class generic (`class Box<T>`)?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Class generic**: tham số kiểu `<T>` gắn với **toàn bộ instance** của class — một khi tạo `Box<String>`, mọi field/method dùng `T` trong instance đó đều là `String`.

```java
class Box<T> {
    private T value;
    public void set(T value) { this.value = value; }
    public T get() { return value; }
}
Box<String> hop = new Box<>();
```

- **Phương thức generic**: tham số kiểu `<T>` chỉ có phạm vi trong **một lời gọi phương thức**, độc lập với class chứa nó (class có thể không generic). Mỗi lần gọi, Java tự suy luận `T` khác nhau tùy tham số truyền vào.

```java
public static <T> T layPhanTuDau(List<T> ds) { return ds.get(0); }
String a = layPhanTuDau(List.of("x", "y")); // T = String ở lần gọi này
Integer b = layPhanTuDau(List.of(1, 2));    // T = Integer ở lần gọi khác
```

</details>

**10. Diamond operator (`<>`) là gì? Nó khác gì so với việc viết đầy đủ kiểu ở cả hai vế?**

<details className="qa">
<summary>Xem đáp án</summary>

**Diamond operator** (toán tử kim cương, Java 7+) cho phép bỏ trống phần kiểu ở vế phải khi khởi tạo, vì trình biên dịch **tự suy luận (type inference)** kiểu dựa trên khai báo ở vế trái:

```java
// Trước Java 7: phải lặp lại kiểu ở cả hai vế
List<String> ten = new ArrayList<String>();

// Từ Java 7: dùng diamond operator, gọn hơn
List<String> ten = new ArrayList<>();
```

- Hai cách hoàn toàn tương đương về mặt kiểu tại thời điểm biên dịch — diamond operator chỉ là cú pháp rút gọn (syntactic sugar), không thay đổi hành vi runtime.
- Lưu ý: vẫn phải giữ `<>` (không được bỏ hẳn thành `new ArrayList()`) — nếu bỏ hẳn, đó lại là raw type, mất type safety.

</details>

**11. Nêu một ví dụ thực tế cho thấy sự khác nhau giữa `List<Object>` và `List<? extends Object>` khi truyền tham số cho một phương thức.**

<details className="qa">
<summary>Xem đáp án</summary>

```java
public static void inTatCa(List<Object> ds) {
    for (Object o : ds) System.out.println(o);
}

public static void inTatCaLinhHoat(List<? extends Object> ds) {
    for (Object o : ds) System.out.println(o);
}

List<String> ten = List.of("An", "Bình");

// inTatCa(ten);          // LỖI biên dịch! List<String> KHÔNG phải là List<Object>
inTatCaLinhHoat(ten);     // OK — List<String> là một List<? extends Object> hợp lệ
```

- Generics **không có tính hiệp biến (covariance)** như mảng: dù `String` là subtype của `Object`, `List<String>` **không phải** là subtype của `List<Object>`. Đây là quy tắc quan trọng khác biệt hoàn toàn so với mảng (`String[]` là subtype của `Object[]`).
- Muốn phương thức nhận được `List` của **bất kỳ subtype nào của `Object`** (tức là mọi `List` nói chung, vì mọi kiểu đều là subtype của `Object`), phải dùng wildcard `List<? extends Object>` (tương đương `List<?>`).

</details>

**12. Vì sao mảng (`Array`) trong Java được coi là hiệp biến (covariant) trong khi Generic List thì không? Điều này có rủi ro gì?**

<details className="qa">
<summary>Xem đáp án</summary>

- Mảng Java **hiệp biến**: nếu `Sub` là subtype của `Super`, thì `Sub[]` cũng được coi là subtype của `Super[]` — có thể gán `Sub[] s = ...; Super[] sup = s;`.
- Điều này tiềm ẩn rủi ro **runtime error**, vì mảng vẫn "nhớ" kiểu thật của nó:

```java
Object[] arr = new String[3]; // hợp lệ vì mảng hiệp biến
arr[0] = 123; // biên dịch OK (kiểu khai báo là Object[])... nhưng ném ArrayStoreException lúc CHẠY!
// vì mảng thật sự là String[], không chấp nhận phần tử Integer
```

- Generic Collections **cố tình không hiệp biến** (`List<String>` không phải subtype của `List<Object>`) chính là để **tránh lặp lại rủi ro này** — lỗi sai kiểu bị đẩy về phát hiện lúc **biên dịch** thay vì rơi vào bẫy `ArrayStoreException` lúc chạy như mảng.
- Đây là lý do thiết kế Generics ưu tiên an toàn kiểu tĩnh (static type safety) hơn là tính linh hoạt hiệp biến mà mảng cho phép.

</details>
