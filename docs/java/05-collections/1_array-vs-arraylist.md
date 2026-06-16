---
sidebar_position: 1
title: "1. Array vs ArrayList"
---

# Array vs ArrayList

Array (mảng) và ArrayList (danh sách động) là hai cách cơ bản nhất để lưu nhiều giá trị trong một biến duy nhất. Array có kích thước cố định, còn ArrayList tự co giãn khi bạn thêm hoặc xóa phần tử. Bài này giải thích sự khác nhau và khi nào nên dùng cái nào; chi tiết nằm bên dưới.

---

## Mục lục

- [Vì sao có ArrayList (so với mảng)?](#vì-sao-có-arraylist-so-với-mảng)
- [Vì sao cần lưu nhiều giá trị?](#vì-sao-cần-lưu-nhiều-giá-trị)
- [Array — mảng cố định kích thước](#array--mảng-cố-định-kích-thước)
- [Vấn đề của Array](#vấn-đề-của-array)
- [ArrayList — danh sách linh hoạt](#arraylist--danh-sách-linh-hoạt)
- [Thêm và xóa phần tử trong ArrayList](#thêm-và-xóa-phần-tử-trong-arraylist)
- [So sánh Array và ArrayList](#so-sánh-array-và-arraylist)
- [Khi nào dùng cái nào?](#khi-nào-dùng-cái-nào)
- [Giới thiệu Collections Framework](#giới-thiệu-collections-framework)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao có ArrayList (so với mảng)?

**Vấn đề:** Mảng (`int[]`) có **kích thước cố định** — phải biết trước số phần tử ngay khi khởi tạo. Muốn thêm phần tử thứ n+1, bạn phải tự tạo mảng mới lớn hơn rồi sao chép toàn bộ sang; chèn/xóa phần tử ở giữa cũng phải dời tay từng ô; và mảng không có sẵn API tiện ích.

```java
int[] diem = new int[3]; // chỉ chứa được 3 phần tử
diem[0] = 8;
diem[1] = 9;
diem[2] = 7;

// Muốn thêm phần tử thứ 4 -> phải tạo mảng mới lớn hơn rồi copy thủ công
int[] moi = new int[4];
for (int i = 0; i < diem.length; i++) {
    moi[i] = diem[i];
}
moi[3] = 10; // rất phiền phức, không có hàm add()
```

**Giải pháp:** `ArrayList` (một loại `List`) là **mảng động tự co giãn** khi thêm/bớt phần tử, kèm API phong phú (`add`, `remove`, `contains`, `indexOf`...) và tích hợp generics cùng Collections Framework. Mảng vẫn nhanh hơn một chút và phù hợp cho kiểu nguyên thủy hoặc kích thước cố định.

```java
import java.util.ArrayList;

ArrayList<Integer> diem = new ArrayList<>();
diem.add(8);
diem.add(9);
diem.add(7);
diem.add(10); // tự lớn lên, không cần tạo mảng mới hay copy

System.out.println(diem.contains(9)); // true — API tiện lợi có sẵn
System.out.println(diem.indexOf(7));  // 2
```

:::tip[Dùng thực tế]
- Lưu danh sách **không biết trước số lượng**, ví dụ kết quả truy vấn từ cơ sở dữ liệu.
- Cần **thêm/xóa phần tử động** trong lúc chạy, ví dụ giỏ hàng hay danh sách bình luận.
- Cần **duyệt, tìm kiếm, lọc** tiện lợi nhờ API và for-each.
- Dùng **mảng** khi cần kiểu nguyên thủy (`int[]`, `double[]`) hoặc kích thước cố định, không đổi.
:::

---

## Vì sao cần lưu nhiều giá trị?

Hãy tưởng tượng bạn cần lưu điểm số của 5 học sinh. Nếu dùng biến (variable — ô nhớ chứa một giá trị) thông thường, bạn phải viết:

```java
int diem1 = 8;
int diem2 = 9;
int diem3 = 7;
int diem4 = 10;
int diem5 = 6;
```

Cách này rất bất tiện: nếu có 1000 học sinh thì bạn phải tạo 1000 biến. Vì vậy Java cung cấp các cấu trúc để lưu **nhiều giá trị cùng loại trong một biến duy nhất**. Hai cấu trúc cơ bản nhất là **Array** (mảng) và **ArrayList** (danh sách động).

---

## Array — mảng cố định kích thước

**Array** (mảng — dãy các ô nhớ liên tiếp, mỗi ô chứa một giá trị) giống như một dãy tủ khóa được đánh số. Mỗi ngăn tủ gọi là một **phần tử** (element), và số thứ tự của ngăn gọi là **chỉ số** (index — bắt đầu từ 0, không phải 1).

```java
// Khai báo mảng chứa 5 số nguyên
int[] diem = new int[5]; // tạo 5 ngăn, ban đầu đều bằng 0

// Gán giá trị cho từng ngăn (chỉ số từ 0 đến 4)
diem[0] = 8;
diem[1] = 9;
diem[2] = 7;
diem[3] = 10;
diem[4] = 6;

// Đọc giá trị ở ngăn thứ 0
System.out.println(diem[0]); // in ra 8

// Lấy số lượng phần tử bằng thuộc tính length
System.out.println(diem.length); // in ra 5
```

Bạn cũng có thể khai báo và gán giá trị ngay lập tức:

```java
// Cách viết gọn: Java tự đếm số phần tử là 5
int[] diem = {8, 9, 7, 10, 6};

// Duyệt qua từng phần tử bằng vòng lặp for
for (int i = 0; i < diem.length; i++) {
    System.out.println("Điểm thứ " + i + " là " + diem[i]);
}
```

---

## Vấn đề của Array

Array có một hạn chế lớn: **kích thước cố định ngay khi tạo ra**. Khi bạn đã tạo `new int[5]`, mảng đó mãi mãi chỉ có 5 ngăn.

```java
int[] diem = new int[5];

// Nếu cố gắng truy cập ngăn thứ 5 (không tồn tại) sẽ bị lỗi
diem[5] = 100; // LỖI: ArrayIndexOutOfBoundsException
```

Nếu sau này bạn muốn thêm học sinh thứ 6, bạn không thể "nới rộng" mảng cũ. Bạn buộc phải tạo mảng mới lớn hơn rồi sao chép dữ liệu sang — rất phiền phức. Đây chính là lý do Java tạo ra **ArrayList**.

---

## ArrayList — danh sách linh hoạt

**ArrayList** (danh sách động — co giãn được) là một cấu trúc lưu nhiều phần tử nhưng **tự động phình to hoặc thu nhỏ** khi bạn thêm hoặc xóa. Bạn không cần khai báo kích thước trước.

```java
// Phải import trước khi dùng
import java.util.ArrayList;

// Tạo danh sách chứa các số nguyên
// Lưu ý: dùng Integer (không phải int) trong dấu < >
ArrayList<Integer> diem = new ArrayList<>();

// Thêm phần tử — danh sách tự lớn lên
diem.add(8);
diem.add(9);
diem.add(7);

System.out.println(diem.size()); // in ra 3 (dùng size(), không phải length)
System.out.println(diem.get(0)); // in ra 8 (dùng get(), không dùng [])
```

Phần `<Integer>` gọi là **generic** (kiểu tổng quát — quy định loại dữ liệu mà danh sách chứa). Vì ArrayList chỉ chứa **object** (đối tượng) chứ không chứa kiểu nguyên thủy như `int`, ta dùng lớp bọc `Integer` thay cho `int`, `Double` thay cho `double`, v.v. Bạn sẽ học kỹ về generic ở bài cuối chương này.

---

## Thêm và xóa phần tử trong ArrayList

Đây là điểm mạnh nhất của ArrayList so với Array:

```java
import java.util.ArrayList;

ArrayList<String> tenHocSinh = new ArrayList<>();

// Thêm vào cuối danh sách
tenHocSinh.add("An");
tenHocSinh.add("Bình");
tenHocSinh.add("Cường");

// Thêm vào vị trí cụ thể (chèn "Dũng" vào chỉ số 1)
tenHocSinh.add(1, "Dũng"); // [An, Dũng, Bình, Cường]

// Sửa giá trị tại một vị trí
tenHocSinh.set(0, "An Nguyễn"); // đổi "An" thành "An Nguyễn"

// Xóa theo chỉ số
tenHocSinh.remove(2); // xóa phần tử ở chỉ số 2

// Xóa theo giá trị
tenHocSinh.remove("Cường"); // xóa phần tử có giá trị "Cường"

// Kiểm tra có chứa giá trị không
System.out.println(tenHocSinh.contains("Dũng")); // true

// Duyệt qua toàn bộ danh sách (vòng lặp for-each)
for (String ten : tenHocSinh) {
    System.out.println(ten);
}
```

---

## So sánh Array và ArrayList

| Đặc điểm | Array (mảng) | ArrayList (danh sách động) |
|----------|--------------|----------------------------|
| Kích thước | Cố định, không đổi được | Tự co giãn |
| Lấy số phần tử | `array.length` | `list.size()` |
| Đọc phần tử | `array[i]` | `list.get(i)` |
| Gán phần tử | `array[i] = x` | `list.set(i, x)` |
| Thêm phần tử | Không thể | `list.add(x)` |
| Xóa phần tử | Không thể | `list.remove(i)` |
| Chứa kiểu nguyên thủy | Có (`int[]`) | Không (phải dùng `Integer`) |
| Tốc độ | Nhanh hơn một chút | Chậm hơn một chút |

---

## Khi nào dùng cái nào?

- **Dùng Array** khi: bạn biết chính xác số phần tử ngay từ đầu và số đó không đổi (ví dụ: 12 tháng trong năm, 7 ngày trong tuần). Array cũng nhanh hơn một chút vì cấu trúc đơn giản.
- **Dùng ArrayList** khi: bạn không biết trước có bao nhiêu phần tử, hoặc cần thêm/xóa thường xuyên (ví dụ: danh sách sản phẩm trong giỏ hàng, danh sách bình luận). Đây là lựa chọn phổ biến nhất trong thực tế.

> Lời khuyên cho người mới: khi phân vân, hãy chọn ArrayList. Nó linh hoạt và dễ dùng hơn.

---

## Giới thiệu Collections Framework

**Collections Framework** (bộ khung tập hợp — thư viện chuẩn của Java để lưu trữ nhóm dữ liệu) là tập hợp các lớp và **interface** (giao diện — bản thiết kế các phương thức) giúp bạn lưu và xử lý nhóm đối tượng một cách dễ dàng. ArrayList chỉ là một thành viên trong gia đình lớn này.

Các nhánh chính bạn sẽ học trong chương này:

- **List** (danh sách — có thứ tự, cho phép trùng lặp): ví dụ `ArrayList`, `LinkedList`.
- **Set** (tập hợp — không cho phép trùng lặp): ví dụ `HashSet`, `TreeSet`.
- **Map** (ánh xạ — cặp khóa-giá trị): ví dụ `HashMap`, `TreeMap`.
- **Queue** (hàng đợi) và **Deque** (hàng đợi hai đầu): xử lý dữ liệu theo thứ tự vào/ra.

Tất cả đều giúp bạn không phải tự viết lại các cấu trúc dữ liệu phức tạp.

---

## Lỗi thường gặp

1. **Nhầm `length` với `size()`**: Array dùng `diem.length` (không có ngoặc), còn ArrayList dùng `diem.size()` (có ngoặc). Đây là lỗi cú pháp rất hay gặp.

2. **Truy cập chỉ số vượt giới hạn**: cả Array và ArrayList đều ném lỗi `IndexOutOfBoundsException` khi bạn dùng chỉ số quá lớn. Nhớ rằng chỉ số bắt đầu từ 0, nên mảng 5 phần tử chỉ có chỉ số từ 0 đến 4.

3. **Quên import ArrayList**: phải có dòng `import java.util.ArrayList;` ở đầu file, nếu không sẽ báo lỗi "cannot find symbol".

4. **Dùng kiểu nguyên thủy trong generic**: viết `ArrayList<int>` là SAI, phải viết `ArrayList<Integer>`.

5. **Nhầm remove theo chỉ số và theo giá trị**: với `ArrayList<Integer>`, `list.remove(2)` xóa phần tử ở **chỉ số** 2, còn `list.remove(Integer.valueOf(2))` mới xóa phần tử có **giá trị** 2.

---

## Tóm tắt

- **Array** là mảng có kích thước **cố định**, truy cập nhanh, dùng `[]` và `.length`.
- **ArrayList** là danh sách **co giãn tự động**, dùng `add()`, `remove()`, `get()`, `size()`.
- Array không thêm/xóa được phần tử; ArrayList làm điều đó dễ dàng.
- ArrayList chỉ chứa object nên dùng lớp bọc (`Integer`, `Double`) thay kiểu nguyên thủy.
- Cả hai đều nằm trong **Collections Framework** — bộ thư viện cấu trúc dữ liệu chuẩn của Java.
- Khi phân vân, người mới nên ưu tiên ArrayList vì sự linh hoạt.
