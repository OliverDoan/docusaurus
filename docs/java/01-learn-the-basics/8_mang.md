---
sidebar_position: 8
title: "✅ 8. Mảng (Arrays)"
---

# Mảng (Arrays)

Mảng là một dãy các phần tử cùng kiểu được đánh số thứ tự, giúp bạn lưu nhiều giá trị mà không phải khai báo hàng loạt biến riêng lẻ. Đây là cấu trúc dữ liệu nền tảng để gom và xử lý dữ liệu theo nhóm. Bài này giới thiệu cách khai báo, truy cập phần tử, độ dài, duyệt mảng, mảng nhiều chiều và một vài tiện ích của lớp Arrays; phần chi tiết nằm bên dưới.

[![Sơ đồ tóm tắt bài: Mảng](/img/java/mang.webp)](pathname:///img/java/mang.webp)

---

:::note[Ghi nhớ nhanh]

- ⭐ **Mảng** — lưu nhiều phần tử cùng kiểu, kích thước **cố định**, chỉ số đếm từ `0`.
- **Khai báo** — `int[] a = new int[n];` hoặc liệt kê `int[] a = {1, 2, 3};`.
- **Số phần tử** — lấy bằng `.length` (không ngoặc, khác `length()` của String).
- **Duyệt mảng** — dùng `for` khi cần chỉ số, `for-each` khi chỉ cần đọc giá trị.
- **Mảng nhiều chiều** — truy cập theo `a[hàng][cột]`.

:::

---

## Mục lục

- [Vì sao cần mảng?](#vì-sao-cần-mảng)
- [Mảng là gì?](#mảng-là-gì)
- [Khai báo và khởi tạo mảng](#khai-báo-và-khởi-tạo-mảng)
- [Truy cập phần tử](#truy-cập-phần-tử)
- [Độ dài mảng](#độ-dài-mảng)
- [Duyệt mảng](#duyệt-mảng)
- [Mảng nhiều chiều](#mảng-nhiều-chiều)
- [Một vài tiện ích với Arrays](#một-vài-tiện-ích-với-arrays)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vì sao cần mảng?

**Vấn đề:** Giả sử cần lưu điểm thi của 100 học sinh. Nếu dùng biến rời, bạn phải khai báo 100 biến và không thể duyệt chúng bằng vòng lặp — cực kỳ khó quản lý:

```java
// Không thể duyệt bằng vòng lặp, không thể mở rộng dễ dàng
int diem1 = 8;
int diem2 = 7;
int diem3 = 9;
// ... thêm 97 biến nữa
```

**Giải pháp:** Mảng lưu nhiều giá trị cùng kiểu dưới một tên, truy cập qua chỉ số và duyệt gọn bằng vòng lặp:

```java
// 100 điểm gom vào một mảng, duyệt bằng 3 dòng code
int[] diem = new int[100];
diem[0] = 8;
diem[1] = 7;
// ... hoặc nhập từ bàn phím qua vòng lặp

int tong = 0;
for (int d : diem) {
    tong += d;
}
System.out.println("Điểm trung bình: " + (tong / diem.length));
```

:::tip[Dùng thực tế]
- Lưu danh sách điểm thi của cả lớp rồi tính điểm trung bình, tìm điểm cao nhất.
- Lưu tọa độ các điểm trên màn hình (x, y) để xử lý đồ họa hoặc game.
- Lưu kết quả đo nhiệt độ theo từng giờ trong ngày để phân tích xu hướng.
- Lưu danh sách mã sản phẩm để tìm kiếm hoặc lọc nhanh bằng vòng lặp.
:::

---

## Mảng là gì?

**Mảng** (array — một dãy các phần tử cùng kiểu, được đánh số thứ tự) giống như một dãy ô tủ liền nhau, mỗi ô chứa một giá trị cùng loại. Thay vì khai báo 100 biến cho 100 điểm số, bạn dùng một mảng chứa được cả 100 giá trị.

Đặc điểm quan trọng: mảng có **kích thước cố định** (fixed size — số lượng phần tử không đổi sau khi tạo).

Sơ đồ một mảng 4 phần tử — chỉ số đếm từ 0 đến length - 1:

```mermaid
flowchart LR
    I0["Chỉ số 0<br/>giá trị 10"] --- I1["Chỉ số 1<br/>giá trị 20"] --- I2["Chỉ số 2<br/>giá trị 30"] --- I3["Chỉ số 3<br/>giá trị 40"]
```

---

## Khai báo và khởi tạo mảng

```java
public class ViDuKhaiBaoMang {
    public static void main(String[] args) {
        // Cách 1: tạo mảng với kích thước cho trước (các ô mặc định là 0)
        int[] diem = new int[5]; // mảng 5 số nguyên, ban đầu toàn 0

        // Cách 2: liệt kê giá trị trực tiếp (Java tự đếm kích thước)
        int[] tuoi = {18, 20, 22, 25};

        // Mảng chuỗi cũng tương tự
        String[] ten = {"An", "Binh", "Cuong"};

        System.out.println(tuoi[0]); // 18
        System.out.println(ten[2]);  // "Cuong"
    }
}
```

`new int[5]` tạo mảng 5 phần tử; vì là kiểu số nên các ô mặc định bằng `0`. Với mảng `String`, các ô mặc định là `null`.

---

## Truy cập phần tử

Mỗi phần tử có một **chỉ số** (index — vị trí của phần tử, đếm bắt đầu từ 0). Phần tử đầu tiên ở chỉ số `0`, phần tử cuối ở chỉ số `độ_dài - 1`.

```java
public class ViDuTruyCap {
    public static void main(String[] args) {
        int[] so = {10, 20, 30, 40};

        // Đọc giá trị
        System.out.println(so[0]); // 10 (phần tử đầu)
        System.out.println(so[3]); // 40 (phần tử cuối)

        // Ghi giá trị mới vào một ô
        so[1] = 99;
        System.out.println(so[1]); // 99
    }
}
```

Hãy ghi nhớ: mảng 4 phần tử có chỉ số từ `0` đến `3`. Truy cập `so[4]` sẽ gây lỗi.

---

## Độ dài mảng

Dùng thuộc tính `.length` (KHÔNG có dấu ngoặc, khác với `length()` của String):

```java
public class ViDuDoDai {
    public static void main(String[] args) {
        int[] so = {5, 10, 15};
        System.out.println("So phan tu: " + so.length); // 3

        // Chỉ số hợp lệ: từ 0 đến length - 1
        int chiSoCuoi = so.length - 1;
        System.out.println("Phan tu cuoi: " + so[chiSoCuoi]); // 15
    }
}
```

---

## Duyệt mảng

**Duyệt** (iterate/traverse — lần lượt đi qua từng phần tử) thường dùng vòng lặp:

```java
public class ViDuDuyetMang {
    public static void main(String[] args) {
        int[] diem = {7, 8, 9, 10};

        // Cách 1: vòng for thường, dùng chỉ số i
        for (int i = 0; i < diem.length; i++) {
            System.out.println("Vi tri " + i + ": " + diem[i]);
        }

        // Cách 2: vòng for-each, gọn hơn khi chỉ cần giá trị
        int tong = 0;
        for (int d : diem) {     // đọc là "với mỗi d trong diem"
            tong += d;
        }
        System.out.println("Tong: " + tong); // 34
    }
}
```

- Dùng `for` thường khi cần biết **chỉ số** hoặc cần sửa phần tử.
- Dùng `for-each` khi chỉ cần **đọc giá trị** từng phần tử cho gọn.

---

## Mảng nhiều chiều

**Mảng hai chiều** (2D array — mảng của các mảng, giống một bảng có hàng và cột) hữu ích cho ma trận, bảng điểm...

```java
public class ViDuMang2Chieu {
    public static void main(String[] args) {
        // Bảng 2 hàng, 3 cột
        int[][] bang = {
            {1, 2, 3},   // hàng 0
            {4, 5, 6}    // hàng 1
        };

        // Truy cập: bang[hàng][cột]
        System.out.println(bang[0][2]); // 3 (hàng 0, cột 2)
        System.out.println(bang[1][0]); // 4 (hàng 1, cột 0)

        // Duyệt mảng 2 chiều bằng vòng lặp lồng nhau
        for (int h = 0; h < bang.length; h++) {        // số hàng
            for (int c = 0; c < bang[h].length; c++) { // số cột của hàng đó
                System.out.print(bang[h][c] + " ");
            }
            System.out.println(); // xuống dòng sau mỗi hàng
        }
    }
}
```

---

## Một vài tiện ích với Arrays

Lớp `Arrays` cung cấp các phương thức hỗ trợ thao tác mảng:

```java
import java.util.Arrays; // cần import để dùng lớp Arrays

public class ViDuArraysUtil {
    public static void main(String[] args) {
        int[] so = {3, 1, 4, 1, 5};

        // Sắp xếp tăng dần
        Arrays.sort(so);
        System.out.println(Arrays.toString(so)); // [1, 1, 3, 4, 5]

        // In mảng dễ đọc
        System.out.println(Arrays.toString(so));
    }
}
```

Lưu ý: phải `import java.util.Arrays;` ở đầu file mới dùng được lớp này.

---

## Lỗi thường gặp

- **Vượt chỉ số** (`ArrayIndexOutOfBoundsException`): truy cập `so[length]` trong khi chỉ số tối đa là `length - 1`.
- **Nhầm `.length` với `.length()`**: mảng dùng `length` (không ngoặc), String dùng `length()` (có ngoặc).
- **Tưởng đổi được kích thước mảng**: mảng cố định, muốn co giãn dùng `ArrayList` (học sau).
- **Quên `import java.util.Arrays`** khi dùng `Arrays.sort` hoặc `Arrays.toString`.
- **In trực tiếp mảng** bằng `System.out.println(so)` ra dãy ký tự lạ; dùng `Arrays.toString(so)`.

---

## Tóm tắt

- **Mảng** lưu nhiều phần tử cùng kiểu, kích thước **cố định**, chỉ số đếm từ `0`.
- Khai báo `int[] a = new int[n];` hoặc liệt kê `int[] a = {1, 2, 3};`.
- Số phần tử lấy bằng `.length`; phần tử cuối ở chỉ số `length - 1`.
- Duyệt bằng `for` (cần chỉ số) hoặc `for-each` (chỉ cần giá trị).
- **Mảng nhiều chiều** truy cập theo `a[hàng][cột]`.

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Mảng (array) là gì? Đặc điểm quan trọng nhất phân biệt mảng với các cấu trúc dữ liệu khác như `ArrayList` là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Mảng** là một dãy các phần tử **cùng kiểu dữ liệu**, được đánh **chỉ số** (index) liên tục bắt đầu từ `0`, lưu trong một vùng nhớ liền kề.

Đặc điểm quan trọng nhất: **kích thước cố định** (fixed size) — một khi đã tạo mảng với `new int[5]`, bạn không thể thêm/bớt phần tử, chỉ có thể đọc/ghi giá trị vào các ô có sẵn. Ngược lại, `ArrayList` (học ở phần Collection) có thể co giãn kích thước linh hoạt khi thêm/xóa phần tử.

</details>

**2. Phân biệt `.length` (trên mảng) và `.length()` (trên `String`).**

<details className="qa">
<summary>Xem đáp án</summary>

- `array.length` — là một **thuộc tính** (field), không có dấu ngoặc, dùng cho mảng.
- `str.length()` — là một **phương thức** (method), có dấu ngoặc, dùng cho `String`.

```java
int[] so = {1, 2, 3};
String ten = "Java";

System.out.println(so.length);   // 3  — không có ()
System.out.println(ten.length()); // 4  — bắt buộc có ()
```

Nhầm lẫn hai cú pháp này (viết `so.length()` hoặc `ten.length`) sẽ gây lỗi biên dịch.

</details>

**3. Khi khai báo `int[] a = new int[5];` và `String[] b = new String[5];`, các phần tử có giá trị mặc định là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Java tự động khởi tạo giá trị mặc định theo kiểu dữ liệu:

| Kiểu phần tử | Giá trị mặc định |
|---|---|
| Số nguyên (`int`, `long`...) | `0` |
| Số thực (`double`, `float`) | `0.0` |
| `boolean` | `false` |
| `char` | `'\u0000'` (ký tự rỗng) |
| Kiểu tham chiếu (`String`, object...) | `null` |

Với `String[] b = new String[5]`, mỗi phần tử là `null` chứ **không phải** chuỗi rỗng `""` — gọi `b[0].length()` sẽ ném `NullPointerException`.

</details>

**4. So sánh vòng `for` thường và vòng `for-each` khi duyệt mảng. Khi nào bắt buộc phải dùng `for` thường?**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | `for` thường | `for-each` |
|---|---|---|
| Biết chỉ số phần tử | Có (`i`) | Không |
| Sửa được giá trị phần tử | Có (`a[i] = ...`) | Không (biến lặp chỉ là bản sao giá trị) |
| Độ gọn | Dài hơn | Ngắn gọn hơn |
| Duyệt ngược, bỏ qua phần tử | Dễ dàng | Khó/không làm được |

`for-each` chỉ phù hợp khi **chỉ cần đọc** giá trị lần lượt. Khi cần **ghi đè phần tử**, biết **vị trí** (ví dụ để in "phần tử thứ mấy"), hoặc duyệt theo thứ tự đặc biệt (ngược, cách quãng), bắt buộc phải dùng `for` thường với chỉ số.

</details>

**5. Đoạn code sau chạy có vấn đề gì? Giải thích lỗi và cách sửa.**

```java
int[] so = {10, 20, 30, 40};
for (int i = 0; i <= so.length; i++) {
    System.out.println(so[i]);
}
```

<details className="qa">
<summary>Xem đáp án</summary>

Lỗi ở điều kiện `i <= so.length` — mảng có `4` phần tử với chỉ số hợp lệ từ `0` đến `3` (`so.length - 1`), nhưng vòng lặp cho phép `i` chạy tới `4` (bằng `so.length`). Khi `i = 4`, `so[4]` không tồn tại nên chương trình ném ra `ArrayIndexOutOfBoundsException` lúc chạy.

Cách sửa: đổi điều kiện thành `i < so.length` (dùng `<` thay vì `<=`).

</details>

**6. Output của đoạn code duyệt mảng hai chiều sau là gì?**

```java
int[][] bang = {
    {1, 2, 3},
    {4, 5, 6}
};

int tong = 0;
for (int h = 0; h < bang.length; h++) {
    for (int c = 0; c < bang[h].length; c++) {
        tong += bang[h][c];
    }
}
System.out.println(tong);
```

<details className="qa">
<summary>Xem đáp án</summary>

**Output: `21`**

`bang.length` là số hàng (`2`), `bang[h].length` là số cột của hàng `h` (ở đây đều là `3`). Vòng lặp cộng dồn toàn bộ phần tử: `1+2+3+4+5+6 = 21`.

Lưu ý mở rộng: với mảng hai chiều **không đều** (jagged array — mỗi hàng có số cột khác nhau), `bang[h].length` vẫn đúng vì nó lấy độ dài của **hàng thứ h**, không phải một giá trị cố định chung cho cả bảng.

</details>

**7. Mảng có phải là một object trong Java không? Khi truyền mảng vào một method, sửa đổi bên trong method có ảnh hưởng ra ngoài không?**

<details className="qa">
<summary>Xem đáp án</summary>

Có, **mảng là object** trong Java (kể cả mảng kiểu nguyên thủy như `int[]`), được cấp phát trên heap và biến mảng chỉ lưu **tham chiếu** (địa chỉ) tới vùng nhớ đó.

Java luôn truyền tham trị (pass-by-value), nhưng với object/mảng, giá trị được truyền là **tham chiếu**, nên:

```java
static void sua(int[] a) {
    a[0] = 999;      // SỬA nội dung qua tham chiếu → ảnh hưởng ra ngoài
    a = new int[3];  // GÁN LẠI biến cục bộ a trỏ tới mảng mới → không ảnh hưởng ra ngoài
}
```

- Thay đổi **nội dung phần tử** của mảng (`a[0] = 999`) sẽ ảnh hưởng tới mảng gốc bên ngoài, vì cả hai biến cùng trỏ tới một vùng nhớ.
- Gán lại biến `a` để trỏ sang một mảng khác chỉ thay đổi tham chiếu cục bộ bên trong method, không ảnh hưởng biến gốc bên ngoài.

</details>

**8. Vì sao `mang1 == mang2` thường cho kết quả `false` dù hai mảng có nội dung giống hệt nhau? Nên so sánh nội dung mảng bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Toán tử `==` trên mảng (là object) so sánh **địa chỉ tham chiếu**, không so sánh nội dung. Hai mảng được tạo riêng biệt dù chứa cùng giá trị vẫn là hai object khác nhau trong bộ nhớ:

```java
int[] a = {1, 2, 3};
int[] b = {1, 2, 3};
System.out.println(a == b);              // false — khác địa chỉ
System.out.println(Arrays.equals(a, b)); // true  — so sánh nội dung
```

Muốn so sánh **nội dung từng phần tử**, dùng `Arrays.equals(a, b)` (mảng một chiều) hoặc `Arrays.deepEquals(a, b)` (mảng nhiều chiều).

</details>

**9. `int[] b = a;` và `int[] b = Arrays.copyOf(a, a.length);` khác nhau thế nào? Vì sao sự khác biệt này quan trọng?**

<details className="qa">
<summary>Xem đáp án</summary>

- `int[] b = a;` — chỉ **sao chép tham chiếu**, `b` và `a` cùng trỏ tới **một** mảng trong bộ nhớ. Sửa `b[0]` cũng làm `a[0]` thay đổi theo.
- `Arrays.copyOf(a, a.length)` (hoặc `a.clone()`) — tạo ra một **mảng mới** với nội dung được sao chép, `b` và `a` là hai vùng nhớ độc lập.

```java
int[] a = {1, 2, 3};
int[] b = a;
b[0] = 99;
System.out.println(a[0]); // 99 — a cũng bị đổi!

int[] c = Arrays.copyOf(a, a.length);
c[0] = 5;
System.out.println(a[0]); // 99 — a không đổi
```

Quan trọng vì bug loại này rất khó phát hiện: code tưởng đang làm việc trên "bản sao" nhưng thực chất đang sửa trực tiếp dữ liệu gốc, gây tác dụng phụ (side effect) ngoài ý muốn — nhất là khi truyền mảng qua nhiều method.

</details>

**10. Tình huống: bạn cần lưu danh sách tên sản phẩm nhưng số lượng sản phẩm thay đổi liên tục (thêm/xóa trong lúc chạy). Dùng mảng có phù hợp không? Nên chọn cấu trúc dữ liệu nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Mảng **không phù hợp** cho trường hợp này vì kích thước cố định — muốn "thêm" một phần tử thực chất phải tạo mảng mới lớn hơn rồi copy toàn bộ dữ liệu cũ sang (tốn kém và dễ lỗi nếu tự cài đặt thủ công).

Nên dùng `ArrayList<String>` (thuộc Java Collections Framework, sẽ học ở bài sau): hỗ trợ sẵn `add`, `remove`, tự động co giãn kích thước bên trong, code gọn và an toàn hơn nhiều so với tự quản lý mảng động.

Mảng vẫn nên dùng khi: biết trước và **cố định** số lượng phần tử, cần hiệu năng tối đa (không có overhead của Collection), hoặc làm việc với dữ liệu kiểu nguyên thủy số lượng lớn (ví dụ xử lý ảnh, ma trận số).

</details>

