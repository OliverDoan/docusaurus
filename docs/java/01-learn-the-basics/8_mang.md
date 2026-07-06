---
sidebar_position: 8
title: "8. Mảng (Arrays)"
---

# Mảng (Arrays)

Mảng là một dãy các phần tử cùng kiểu được đánh số thứ tự, giúp bạn lưu nhiều giá trị mà không phải khai báo hàng loạt biến riêng lẻ. Đây là cấu trúc dữ liệu nền tảng để gom và xử lý dữ liệu theo nhóm. Bài này giới thiệu cách khai báo, truy cập phần tử, độ dài, duyệt mảng, mảng nhiều chiều và một vài tiện ích của lớp Arrays; phần chi tiết nằm bên dưới.

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
