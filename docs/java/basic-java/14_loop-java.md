---
sidebar_position: 14
title: "14. Vòng lặp trong Java"
---
# Vòng lặp trong Java


---

## Mục lục

- [1. Giới thiệu](#1-giới-thiệu)
- [Nội dung](#nội-dung)
- [2. Vòng lặp for](#2-vòng-lặp-for)
- [3. Vòng lặp while](#3-vòng-lặp-while)
- [4. Vòng lặp do-while](#4-vòng-lặp-do-while)
- [5. Vòng lặp for-each (Enhanced for)](#5-vòng-lặp-for-each-enhanced-for)
- [6. So sánh các loại vòng lặp](#6-so-sánh-các-loại-vòng-lặp)
- [7. Vòng lặp lồng nhau (Nested loops)](#7-vòng-lặp-lồng-nhau-nested-loops)
- [8. Vòng lặp vô hạn](#8-vòng-lặp-vô-hạn)
- [9. Labeled loops](#9-labeled-loops)
- [10. Ví dụ thực tế](#10-ví-dụ-thực-tế)
- [11. Khi nào dùng?](#11-khi-nào-dùng)
- [12. Lỗi thường gặp](#12-lỗi-thường-gặp)
- [13. Câu hỏi phỏng vấn](#13-câu-hỏi-phỏng-vấn)

---

## 1. Giới thiệu

**Vòng lặp (Loop)** trong Java cho phép chương trình **thực thi một khối lệnh lặp đi lặp lại** cho đến khi một điều kiện nhất định không còn đúng.

**Tại sao cần vòng lặp?** Trong lập trình, có rất nhiều tình huống cần làm đi làm lại một việc: duyệt danh sách sản phẩm, tính tổng các số, đợi người dùng nhập đúng mật khẩu, xử lý từng dòng dữ liệu từ file... Nếu không có vòng lặp, bạn phải viết cùng một dòng code hàng trăm, hàng ngàn lần - điều này là **bất khả thi**.

Hãy hình dung vòng lặp như một **băng chuyền trong nhà máy**:
- Sản phẩm đi qua từng công đoạn (mỗi vòng lặp)
- Khi sản phẩm đạt chuẩn (điều kiện đúng), nó được chuyển ra ngoài (kết thúc vòng lặp)
- Nếu chưa đạt, nó tiếp tục quay lại (lặp tiếp)

---

## Nội dung

1. [Giới thiệu](#1-gioi-thieu)
2. [Vòng lặp for](#2-vong-lap-for)
3. [Vòng lặp while](#3-vong-lap-while)
4. [Vòng lặp do-while](#4-vong-lap-do-while)
5. [Vòng lặp for-each (Enhanced for)](#5-vong-lap-for-each-enhanced-for)
6. [So sánh các loại vòng lặp](#6-so-sanh-cac-loai-vong-lap)
7. [Vòng lặp lồng nhau (Nested loops)](#7-vong-lap-long-nhau-nested-loops)
8. [Vòng lặp vô hạn](#8-vong-lap-vo-han)
9. [Labeled loops](#9-labeled-loops)
10. [Ví dụ thực tế](#10-vi-du-thuc-te)
11. [Khi nào dùng?](#11-khi-nao-dung)
12. [Lỗi thường gặp](#12-loi-thuong-gap)
13. [Câu hỏi phỏng vấn](#13-cau-hoi-phong-van)

---

## 2. Vòng lặp for

### 2.1 Cú pháp

```java
for (initialization; condition; update) {
    // code được lặp lại
}
```

Trong đó:
- **`initialization`**: khởi tạo biến đếm (chạy 1 lần duy nhất)
- **`condition`**: điều kiện lặp (kiểm tra trước mỗi vòng)
- **`update`**: cập nhật biến đếm (chạy sau mỗi vòng)

### 2.2 Ví dụ cơ bản

```java
public class ForLoopDemo {
    public static void main(String[] args) {
        // In các số từ 1 đến 5
        for (int i = 1; i <= 5; i++) {
            System.out.println("So: " + i);
        }
    }
}
```

**Kết quả:**
```
So: 1
So: 2
So: 3
So: 4
So: 5
```

### 2.3 Quá trình thực thi

```
Bước 1: int i = 1        (khởi tạo)
Bước 2: i <= 5 ? true    (kiểm tra điều kiện)
Bước 3: in "So: 1"       (thực thi body)
Bước 4: i++  -> i = 2    (cập nhật)
Bước 5: i <= 5 ? true    (kiểm tra lại)
...
Bước cuối: i = 6, i <= 5 ? false -> THOÁT
```

### 2.4 Đếm ngược

```java
public class CountdownDemo {
    public static void main(String[] args) {
        for (int i = 10; i >= 1; i--) {
            System.out.println(i);
        }
        System.out.println("Xuat phat!");
    }
}
```

### 2.5 For với nhiều biến

```java
public class MultiVarForDemo {
    public static void main(String[] args) {
        for (int i = 0, j = 10; i < j; i++, j--) {
            System.out.println("i = " + i + ", j = " + j);
        }
    }
}
```

**Kết quả:**
```
i = 0, j = 10
i = 1, j = 9
i = 2, j = 8
i = 3, j = 7
i = 4, j = 6
```

---

## 3. Vòng lặp while

### 3.1 Cú pháp

```java
while (condition) {
    // code được lặp lại
}
```

- **Kiểm tra điều kiện TRƯỚC** khi thực thi body
- Nếu điều kiện sai ngay từ đầu, body **không chạy lần nào**

### 3.2 Ví dụ

```java
public class WhileLoopDemo {
    public static void main(String[] args) {
        int i = 1;

        while (i <= 5) {
            System.out.println("Lan lap thu: " + i);
            i++; // QUAN TRỌNG: phải cập nhật biến đếm!
        }
    }
}
```

**Kết quả:**
```
Lan lap thu: 1
Lan lap thu: 2
Lan lap thu: 3
Lan lap thu: 4
Lan lap thu: 5
```

### 3.3 While với điều kiện động

```java
import java.util.Scanner;

public class WhileInputDemo {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String input = "";

        while (!input.equals("quit")) {
            System.out.print("Nhap lenh (quit de thoat): ");
            input = scanner.nextLine();
            System.out.println("Ban da nhap: " + input);
        }

        System.out.println("Chuong trinh ket thuc.");
        scanner.close();
    }
}
```

---

## 4. Vòng lặp do-while

### 4.1 Cú pháp

```java
do {
    // code được lặp lại
} while (condition);
```

- **Thực thi body TRƯỚC**, rồi mới kiểm tra điều kiện
- Body luôn chạy **ít nhất 1 lần**, dù điều kiện sai ngay từ đầu

### 4.2 Ví dụ: Body chạy dù điều kiện sai

```java
public class DoWhileDemo {
    public static void main(String[] args) {
        int i = 10;

        do {
            System.out.println("Gia tri i: " + i);
            i++;
        } while (i < 5);

        System.out.println("Ket thuc. i = " + i);
    }
}
```

**Kết quả:**
```
Gia tri i: 10
Ket thuc. i = 11
```

Mặc dù `i = 10` (lớn hơn 5), body vẫn chạy **1 lần**.

### 4.3 Ví dụ: Menu lựa chọn

```java
import java.util.Scanner;

public class MenuDemo {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int choice;

        do {
            System.out.println("=== MENU ===");
            System.out.println("1. Them moi");
            System.out.println("2. Xem danh sach");
            System.out.println("3. Thoat");
            System.out.print("Chon: ");
            choice = scanner.nextInt();

            switch (choice) {
                case 1:
                    System.out.println("-> Chuc nang Them moi");
                    break;
                case 2:
                    System.out.println("-> Chuc nang Xem danh sach");
                    break;
                case 3:
                    System.out.println("-> Tam biet!");
                    break;
                default:
                    System.out.println("-> Lua chon khong hop le!");
            }
            System.out.println();
        } while (choice != 3);

        scanner.close();
    }
}
```

---

## 5. Vòng lặp for-each (Enhanced for)

### 5.1 Cú pháp

```java
for (dataType element : collection) {
    // xử lý từng element
}
```

Dùng để **duyệt qua từng phần tử** của mảng hoặc Collection (ArrayList, Set, ...).

### 5.2 Ví dụ với mảng

```java
public class ForEachArrayDemo {
    public static void main(String[] args) {
        String[] fruits = {"Tao", "Cam", "Chuoi", "Nho"};

        for (String fruit : fruits) {
            System.out.println("Trai cay: " + fruit);
        }
    }
}
```

**Kết quả:**
```
Trai cay: Tao
Trai cay: Cam
Trai cay: Chuoi
Trai cay: Nho
```

### 5.3 Ví dụ với ArrayList

```java
import java.util.ArrayList;

public class ForEachListDemo {
    public static void main(String[] args) {
        ArrayList<Integer> numbers = new ArrayList<>();
        numbers.add(10);
        numbers.add(20);
        numbers.add(30);

        int sum = 0;
        for (int num : numbers) {
            sum += num;
        }

        System.out.println("Tong: " + sum); // 60
    }
}
```

### 5.4 Hạn chế của for-each

- **Không truy cập được index** của phần tử
- **Không thể thay đổi phần tử** của mảng/collection trong vòng lặp
- **Không thể duyệt ngược**
- **Không thể bỏ qua phần tử** (không kiểm soát bước nhảy)

---

## 6. So sánh các loại vòng lặp

| Tiêu chí | for | while | do-while | for-each |
|---------|-----|-------|----------|----------|
| Biết trước số lần lặp | Có | Không | Không | Có (số phần tử) |
| Kiểm tra điều kiện | Trước | Trước | Sau | Tự động |
| Chạy tối thiểu | 0 lần | 0 lần | **1 lần** | 0 lần |
| Truy cập index | Có | Có | Có | **Không** |
| Dùng cho | Đếm, duyệt có index | Điều kiện động | Menu, nhập liệu | Duyệt mảng/collection |

---

## 7. Vòng lặp lồng nhau (Nested loops)

Vòng lặp đặt bên trong vòng lặp khác:

### 7.1 In bảng cửu chương

```java
public class MultiplicationTable {
    public static void main(String[] args) {
        for (int i = 2; i <= 9; i++) {
            System.out.println("=== Bang cuu chuong " + i + " ===");
            for (int j = 1; j <= 10; j++) {
                System.out.println(i + " x " + j + " = " + (i * j));
            }
            System.out.println();
        }
    }
}
```

### 7.2 In hình tam giác sao

```java
public class TriangleDemo {
    public static void main(String[] args) {
        int rows = 5;

        for (int i = 1; i <= rows; i++) {
            for (int j = 1; j <= i; j++) {
                System.out.print("* ");
            }
            System.out.println();
        }
    }
}
```

**Kết quả:**
```
*
* *
* * *
* * * *
* * * * *
```

**Lưu ý:** Vòng lặp lồng nhau có **độ phức tạp O(n x m)**. Nếu n và m lớn, hiệu năng sẽ giảm đáng kể. Tránh lồng quá 3 cấp.

---

## 8. Vòng lặp vô hạn

### 8.1 Cách tạo vòng lặp vô hạn

```java
// Cách 1: for
for (;;) {
    System.out.println("Vo han voi for");
}

// Cách 2: while
while (true) {
    System.out.println("Vo han voi while");
}

// Cách 3: do-while
do {
    System.out.println("Vo han voi do-while");
} while (true);
```

### 8.2 Khi nào vòng lặp vô hạn có ích?

- **Server** lắng nghe kết nối liên tục
- **Game loop** chạy liên tục cho đến khi người chơi thoát
- **Menu chương trình** lặp lại cho đến khi chọn "Thoát"

```java
public class InfiniteLoopUseful {
    public static void main(String[] args) {
        int count = 0;

        while (true) {
            count++;
            System.out.println("Lan chay: " + count);

            if (count >= 5) {
                System.out.println("Da du 5 lan, thoat!");
                break; // Thoát vòng lặp vô hạn
            }
        }
    }
}
```

### 8.3 Cách tránh vòng lặp vô hạn ngoài ý muốn

- **Luôn cập nhật biến điều kiện** bên trong vòng lặp
- **Đặt điều kiện thoát rõ ràng**
- **Sử dụng break** khi cần thiết
- **Kiểm tra logic** trước khi chạy

---

## 9. Labeled loops

Labeled loop cho phép bạn **đặt nhãn (label)** cho vòng lặp, rồi dùng `break` hoặc `continue` để **thoát hoặc bỏ qua vòng lặp cụ thể** (không chỉ vòng lặp gần nhất):

```java
public class LabeledLoopDemo {
    public static void main(String[] args) {
        outer:
        for (int i = 1; i <= 3; i++) {
            inner:
            for (int j = 1; j <= 3; j++) {
                if (i == 2 && j == 2) {
                    System.out.println("Break outer tai i=" + i + ", j=" + j);
                    break outer; // Thoát vòng lặp ngoài
                }
                System.out.println("i=" + i + ", j=" + j);
            }
        }
        System.out.println("Ket thuc");
    }
}
```

**Kết quả:**
```
i=1, j=1
i=1, j=2
i=1, j=3
i=2, j=1
Break outer tai i=2, j=2
Ket thuc
```

**Lưu ý:** Labeled loop làm code **khó đọc**, nên **hạn chế sử dụng**. Trong đa số trường hợp, có thể thay thế bằng cách **tách logic ra method riêng** và dùng `return`.

---

## 10. Ví dụ thực tế

### 10.1 Duyệt mảng tìm giá trị lớn nhất

```java
public class FindMaxDemo {
    public static void main(String[] args) {
        int[] arr = {45, 12, 78, 34, 90, 23};
        int max = arr[0];

        for (int i = 1; i < arr.length; i++) {
            if (arr[i] > max) {
                max = arr[i];
            }
        }

        System.out.println("Gia tri lon nhat: " + max); // 90
    }
}
```

### 10.2 Tìm kiếm phần tử trong mảng

```java
public class SearchDemo {
    public static void main(String[] args) {
        String[] names = {"An", "Binh", "Cuong", "Dung", "Em"};
        String target = "Cuong";
        boolean found = false;

        for (int i = 0; i < names.length; i++) {
            if (names[i].equals(target)) {
                System.out.println("Tim thay '" + target + "' tai vi tri " + i);
                found = true;
                break;
            }
        }

        if (!found) {
            System.out.println("Khong tim thay '" + target + "'");
        }
    }
}
```

### 10.3 Tính giai thừa

```java
public class FactorialDemo {
    public static void main(String[] args) {
        int n = 6;
        long factorial = 1;

        for (int i = 1; i <= n; i++) {
            factorial *= i;
        }

        System.out.println(n + "! = " + factorial); // 6! = 720
    }
}
```

---

## 11. Khi nào dùng?

### for:
- Biết **chính xác số lần lặp**
- Cần **biến đếm** (index)
- Duyệt mảng khi cần index

### while:
- **Chưa biết trước** số lần lặp
- Điều kiện phụ thuộc **sự kiện bên ngoài** (nhập liệu, kết nối mạng...)
- **Đọc file** cho đến hết

### do-while:
- Cần body chạy **ít nhất 1 lần**
- **Menu chương trình** (hiện menu trước, rồi hỏi tiếp)
- **Nhập liệu có kiểm tra** (nhập trước, kiểm tra sau)

### for-each:
- **Duyệt toàn bộ** mảng hoặc collection
- **Không cần index**, chỉ cần giá trị
- **Chỉ đọc** (không thay đổi phần tử)

### Best practices:
- **Ưu tiên for-each** khi chỉ cần đọc dữ liệu
- Tránh **vòng lặp lồng quá 3 cấp**
- **Luôn đảm bảo điều kiện thoát** để tránh vòng lặp vô hạn
- **Đặt tên biến đếm rõ ràng** (`i`, `j`, `row`, `col`...)

---

## 12. Lỗi thường gặp

### Lỗi 1: Quên cập nhật biến đếm (vòng lặp vô hạn)

```java
// Sai: Quên i++ -> Vòng lặp vô hạn!
int i = 0;
while (i < 5) {
    System.out.println(i);
    // Thiếu i++ ở đây!
}
```

```java
// Đúng: Có cập nhật biến đếm
int i = 0;
while (i < 5) {
    System.out.println(i);
    i++;
}
```

### Lỗi 2: Sai điều kiện vòng lặp

```java
// Sai: Điều kiện luôn đúng -> Vô hạn
for (int i = 0; i < 10; i--) { // i giảm mãi, luôn < 10
    System.out.println(i);
}
```

```java
// Đúng: Điều kiện tiến dần về kết thúc
for (int i = 0; i < 10; i++) {
    System.out.println(i);
}
```

### Lỗi 3: Off-by-one error (sai 1 đơn vị)

```java
// Sai: Muốn in 1-10 nhưng chỉ in 1-9
for (int i = 1; i < 10; i++) {
    System.out.println(i); // Chỉ in đến 9!
}
```

```java
// Đúng: Dùng <= để bao gồm cả 10
for (int i = 1; i <= 10; i++) {
    System.out.println(i);
}
```

### Lỗi 4: Thay đổi collection trong for-each

```java
// Sai: ConcurrentModificationException!
import java.util.ArrayList;

ArrayList<String> list = new ArrayList<>();
list.add("A");
list.add("B");
list.add("C");

for (String item : list) {
    if (item.equals("B")) {
        list.remove(item); // LỖI khi chạy!
    }
}
```

```java
// Đúng: Dùng Iterator hoặc removeIf
import java.util.ArrayList;
import java.util.Iterator;

ArrayList<String> list = new ArrayList<>();
list.add("A");
list.add("B");
list.add("C");

Iterator<String> it = list.iterator();
while (it.hasNext()) {
    if (it.next().equals("B")) {
        it.remove(); // An toàn
    }
}

// Hoặc đơn giản hơn (Java 8+):
// list.removeIf(item -> item.equals("B"));
```

### Lỗi 5: Dùng == thay vì equals() khi so sánh String trong vòng lặp

```java
// Sai: So sánh tham chiếu thay vì nội dung
String[] arr = {new String("Java"), new String("Python")};
for (String s : arr) {
    if (s == "Java") { // Có thể trả về false!
        System.out.println("Tim thay");
    }
}
```

```java
// Đúng: Dùng equals()
String[] arr = {new String("Java"), new String("Python")};
for (String s : arr) {
    if (s.equals("Java")) {
        System.out.println("Tim thay");
    }
}
```

---

## 13. Câu hỏi phỏng vấn

### Câu 1: Sự khác nhau giữa `while` và `do-while` là gì?

**Trả lời:**
- `while` **kiểm tra điều kiện TRƯỚC** khi thực thi body. Nếu điều kiện sai ngay từ đầu, body **không chạy lần nào**.
- `do-while` **thực thi body TRƯỚC**, rồi mới kiểm tra điều kiện. Body luôn chạy **ít nhất 1 lần**.

```java
// while: không chạy lần nào
int x = 10;
while (x < 5) {
    System.out.println(x); // Không in gì cả
}

// do-while: chạy 1 lần
int y = 10;
do {
    System.out.println(y); // In "10"
} while (y < 5);
```

### Câu 2: Sự khác nhau giữa `for` và `for-each`?

**Trả lời:**

| Tiêu chí | for | for-each |
|---------|-----|----------|
| Truy cập index | Có | Không |
| Thay đổi phần tử | Có | Không trực tiếp |
| Duyệt ngược | Có | Không |
| Cú pháp | `for (int i=0; ...)` | `for (Type x : arr)` |
| Lỗi off-by-one | Có thể | Không |
| Khi nào dùng | Cần index, thay đổi, duyệt ngược | Chỉ đọc, gọn gàng |

### Câu 3: Có thể dùng for-each để thay đổi (modify) phần tử của collection không?

**Trả lời:** **Không trực tiếp.** Trong for-each, biến lặp (loop variable) là **bản sao** của giá trị phần tử (với primitive) hoặc bản sao của tham chiếu (với object). Với kiểu nguyên thủy và String, thay đổi biến lặp **không ảnh hưởng** đến collection gốc. Với object, bạn có thể **thay đổi thuộc tính bên trong** object (vì cùng tham chiếu), nhưng **không thể thay thế phần tử** trong collection. Ngoài ra, **không được add/remove phần tử** trong khi đang duyệt bằng for-each (sẽ gây `ConcurrentModificationException`).

### Câu 4: Cách nào để tạo vòng lặp vô hạn? Khi nào nó có ích?

**Trả lời:** Có 3 cách chính:
```java
for (;;) { }
while (true) { }
do { } while (true);
```
Vòng lặp vô hạn có ích trong: **server** lắng nghe request liên tục, **game loop**, **event loop** của ứng dụng GUI, **menu chương trình** cho đến khi người dùng chọn thoát. Luôn phải có **điều kiện `break`** bên trong để kết thúc vòng lặp khi cần.

### Câu 5: Labeled loop là gì? Khi nào nên dùng?

**Trả lời:** Labeled loop là vòng lặp được **đặt tên (nhãn)**, cho phép `break` hoặc `continue` tác động lên **vòng lặp cụ thể** thay vì chỉ vòng lặp gần nhất. Ví dụ `break outer;` sẽ thoát vòng lặp ngoài trong nested loop. Tuy nhiên, labeled loop làm code **khó đọc và khó bảo trì**, nên chỉ dùng khi **thật sự cần thiết** (ví dụ: tìm kiếm trong ma trận 2 chiều và cần thoát cả 2 vòng). Trong đa số trường hợp, nên **tách logic ra method riêng** và dùng `return` thay vì labeled loop.
