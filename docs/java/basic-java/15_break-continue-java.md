---
sidebar_position: 15
title: "Break & Continue"
---
# Break & Continue

## 1. Giới thiệu

Trong Java, **`break`** và **`continue`** là hai câu lệnh điều khiển luồng thực thi bên trong vòng lặp và switch. Chúng cho phép bạn **can thiệp vào quá trình lặp** thay vì để vòng lặp chạy hết tự nhiên.

- **`break`**: thoát **hoàn toàn** khỏi vòng lặp hoặc switch
- **`continue`**: bỏ qua **phần còn lại của lần lặp hiện tại**, nhảy sang lần lặp tiếp theo

**Tại sao cần break và continue?** Khi duyệt dữ liệu, bạn thường không cần xử lý hết tất cả. Ví dụ: tìm một phần tử trong mảng thì dừng lại ngay khi tìm thấy (break), hoặc bỏ qua các dữ liệu không hợp lệ khi xử lý (continue). Hai câu lệnh này giúp code **hiệu quả hơn** và **tránh xử lý thừa**.

Hãy hình dung như bạn đang **đọc một cuốn sách**:
- **`break`** giống như bạn **đóng sách lại** vì đã tìm thấy thông tin cần thiết
- **`continue`** giống như bạn **lật qua một trang** vì trang đó không liên quan

---

## Nội dung

1. [Giới thiệu](#1-gioi-thieu)
2. [Câu lệnh break](#2-cau-lenh-break)
3. [break trong switch](#3-break-trong-switch)
4. [Labeled break](#4-labeled-break)
5. [Câu lệnh continue](#5-cau-lenh-continue)
6. [Labeled continue](#6-labeled-continue)
7. [So sánh break và continue](#7-so-sanh-break-va-continue)
8. [Ví dụ thực tế](#8-vi-du-thuc-te)
9. [Khi nào dùng?](#9-khi-nao-dung)
10. [Lỗi thường gặp](#10-loi-thuong-gap)
11. [Câu hỏi phỏng vấn](#11-cau-hoi-phong-van)

---

## 2. Câu lệnh break

### 2.1 break trong vòng lặp

`break` **kết thúc ngay lập tức** vòng lặp chứa nó. Code sau vòng lặp sẽ được thực thi tiếp.

```java
public class BreakDemo {
    public static void main(String[] args) {
        for (int i = 1; i <= 10; i++) {
            if (i == 6) {
                System.out.println("Gap so 6, dung lai!");
                break; // Thoát vòng lặp ngay
            }
            System.out.println("i = " + i);
        }
        System.out.println("Da thoat vong lap.");
    }
}
```

**Kết quả:**
```
i = 1
i = 2
i = 3
i = 4
i = 5
Gap so 6, dung lai!
Da thoat vong lap.
```

### 2.2 break chỉ thoát vòng lặp gần nhất

Trong vòng lặp lồng nhau, `break` **chỉ thoát vòng lặp trong cùng** (gần nhất):

```java
public class BreakNestedDemo {
    public static void main(String[] args) {
        for (int i = 1; i <= 3; i++) {
            for (int j = 1; j <= 3; j++) {
                if (j == 2) {
                    break; // Chỉ thoát vòng for(j), không thoát for(i)
                }
                System.out.println("i=" + i + ", j=" + j);
            }
        }
    }
}
```

**Kết quả:**
```
i=1, j=1
i=2, j=1
i=3, j=1
```

Mỗi lần `j == 2`, chỉ vòng `for(j)` bị thoát. Vòng `for(i)` vẫn tiếp tục.

---

## 3. break trong switch

`break` trong switch dùng để **kết thúc một case**, ngăn không cho code chạy xuống các case bên dưới (fall-through):

```java
public class BreakSwitchDemo {
    public static void main(String[] args) {
        int option = 2;

        switch (option) {
            case 1:
                System.out.println("Tuy chon 1");
                break; // Thoát switch
            case 2:
                System.out.println("Tuy chon 2");
                break; // Thoát switch
            case 3:
                System.out.println("Tuy chon 3");
                break;
            default:
                System.out.println("Tuy chon khong hop le");
        }
    }
}
```

**Kết quả:**
```
Tuy chon 2
```

---

## 4. Labeled break

Khi có vòng lặp lồng nhau, `break` thường chỉ thoát vòng trong cùng. Nếu muốn **thoát vòng lặp ngoài**, bạn dùng **labeled break**:

### 4.1 Cú pháp

```java
labelName:
for (...) {
    for (...) {
        if (condition) {
            break labelName; // Thoát vòng lặp có nhãn labelName
        }
    }
}
```

### 4.2 Ví dụ: Tìm kiếm trong ma trận

```java
public class LabeledBreakDemo {
    public static void main(String[] args) {
        int[][] matrix = {
            {1, 2, 3},
            {4, 5, 6},
            {7, 8, 9}
        };
        int target = 5;
        boolean found = false;

        search:
        for (int i = 0; i < matrix.length; i++) {
            for (int j = 0; j < matrix[i].length; j++) {
                if (matrix[i][j] == target) {
                    System.out.println("Tim thay " + target +
                        " tai vi tri [" + i + "][" + j + "]");
                    found = true;
                    break search; // Thoát CẢ HAI vòng lặp
                }
            }
        }

        if (!found) {
            System.out.println("Khong tim thay " + target);
        }
    }
}
```

**Kết quả:**
```
Tim thay 5 tai vi tri [1][1]
```

Nếu không có `break search`, chương trình sẽ tiếp tục duyệt các phần tử còn lại (không cần thiết).

---

## 5. Câu lệnh continue

### 5.1 continue trong for

`continue` **bỏ qua phần code còn lại** trong lần lặp hiện tại và **nhảy sang lần lặp tiếp theo**:

```java
public class ContinueForDemo {
    public static void main(String[] args) {
        for (int i = 1; i <= 10; i++) {
            if (i % 2 == 0) {
                continue; // Bỏ qua số chẵn
            }
            System.out.println("So le: " + i);
        }
    }
}
```

**Kết quả:**
```
So le: 1
So le: 3
So le: 5
So le: 7
So le: 9
```

Khi `i` là số chẵn, `continue` làm cho `System.out.println` **không được thực thi**, và vòng lặp nhảy sang giá trị `i` tiếp theo.

### 5.2 continue trong while

```java
public class ContinueWhileDemo {
    public static void main(String[] args) {
        int i = 0;

        while (i < 10) {
            i++;
            if (i % 3 == 0) {
                continue; // Bỏ qua bội của 3
            }
            System.out.println("i = " + i);
        }
    }
}
```

**Kết quả:**
```
i = 1
i = 2
i = 4
i = 5
i = 7
i = 8
i = 10
```

**Lưu ý quan trọng:** Trong `while`, biến đếm phải được **cập nhật TRƯỚC `continue`**. Nếu cập nhật sau continue, dòng cập nhật sẽ bị bỏ qua và gây **vòng lặp vô hạn**.

### 5.3 Hiểu đúng luồng thực thi của continue

Trong vòng `for`:
```
for (init; condition; update) {
    // code trước continue
    continue; // -> nhảy đến phần 'update', rồi kiểm tra 'condition'
    // code sau continue KHÔNG được thực thi
}
```

Trong vòng `while`:
```
while (condition) {
    // code trước continue
    continue; // -> nhảy đến kiểm tra 'condition'
    // code sau continue KHÔNG được thực thi
}
```

---

## 6. Labeled continue

Tương tự labeled break, **labeled continue** cho phép bạn **bỏ qua lần lặp hiện tại của vòng lặp ngoài**:

```java
public class LabeledContinueDemo {
    public static void main(String[] args) {
        outer:
        for (int i = 1; i <= 3; i++) {
            for (int j = 1; j <= 3; j++) {
                if (j == 2) {
                    continue outer; // Bỏ qua phần còn lại, nhảy sang i tiếp theo
                }
                System.out.println("i=" + i + ", j=" + j);
            }
        }
    }
}
```

**Kết quả:**
```
i=1, j=1
i=2, j=1
i=3, j=1
```

Mỗi khi `j == 2`, `continue outer` làm vòng `for(j)` **dừng lại** và nhảy sang **lần lặp tiếp theo của `for(i)`**. Vì vậy `j` chỉ có giá trị 1 trong output.

---

## 7. So sánh break và continue

| Tiêu chí | break | continue |
|---------|-------|----------|
| Tác dụng | **Thoát hoàn toàn** vòng lặp | **Bỏ qua 1 lần lặp**, tiếp tục vòng tiếp |
| Phạm vi | Vòng lặp/switch gần nhất | Vòng lặp gần nhất |
| Sau khi thực thi | Code sau vòng lặp chạy | Vòng lặp tiếp tục |
| Hỗ trợ label | Có (labeled break) | Có (labeled continue) |
| Dùng trong switch | Có | Không |
| Ví dụ | Tìm thấy kết quả, dừng tìm | Bỏ qua dữ liệu không hợp lệ |

---

## 8. Ví dụ thực tế

### 8.1 Tìm số nguyên tố đầu tiên lớn hơn n

```java
public class FindPrimeDemo {
    public static void main(String[] args) {
        int n = 20;

        for (int candidate = n + 1; ; candidate++) { // Vòng lặp vô hạn
            boolean isPrime = true;

            for (int i = 2; i <= Math.sqrt(candidate); i++) {
                if (candidate % i == 0) {
                    isPrime = false;
                    break; // Không phải số nguyên tố, không cần kiểm tra tiếp
                }
            }

            if (isPrime) {
                System.out.println("So nguyen to dau tien lon hon " + n + " la: " + candidate);
                break; // Tìm thấy, thoát vòng ngoài
            }
        }
    }
}
```

**Kết quả:**
```
So nguyen to dau tien lon hon 20 la: 23
```

### 8.2 Lọc dữ liệu hợp lệ từ mảng

```java
public class FilterDataDemo {
    public static void main(String[] args) {
        int[] scores = {85, -1, 92, 0, 78, -5, 95, 100, 110};

        System.out.println("Diem hop le (1-100):");
        for (int score : scores) {
            if (score < 1 || score > 100) {
                continue; // Bỏ qua điểm không hợp lệ
            }
            System.out.println("  Diem: " + score);
        }
    }
}
```

**Kết quả:**
```
Diem hop le (1-100):
  Diem: 85
  Diem: 92
  Diem: 78
  Diem: 95
  Diem: 100
```

### 8.3 Tìm phần tử chung của hai mảng

```java
public class CommonElementsDemo {
    public static void main(String[] args) {
        int[] arr1 = {1, 3, 5, 7, 9};
        int[] arr2 = {2, 3, 5, 8, 9, 10};

        System.out.println("Phan tu chung:");
        for (int a : arr1) {
            for (int b : arr2) {
                if (a == b) {
                    System.out.println("  " + a);
                    break; // Tìm thấy trong arr2, không cần duyệt tiếp arr2
                }
            }
        }
    }
}
```

**Kết quả:**
```
Phan tu chung:
  3
  5
  9
```

---

## 9. Khi nào dùng?

### Khi nào dùng break:
- **Tìm kiếm**: dừng lại ngay khi tìm thấy kết quả
- **Kiểm tra điều kiện**: thoát vòng lặp khi phát hiện lỗi hoặc điều kiện đặc biệt
- **Giới hạn xử lý**: chỉ xử lý n phần tử đầu tiên
- **Vòng lặp vô hạn có điều kiện thoát**: server loop, game loop

### Khi nào dùng continue:
- **Lọc dữ liệu**: bỏ qua các phần tử không hợp lệ
- **Điều kiện tiên quyết**: chỉ xử lý phần tử thỏa mãn điều kiện
- **Tránh if lồng nhau**: thay vì `if (valid) { ... code dài ... }`, dùng `if (!valid) continue;`

### Khi nào dùng labeled break/continue:
- **Tìm kiếm trong ma trận** (mảng 2 chiều): thoát cả 2 vòng khi tìm thấy
- **Nested loop phức tạp**: cần điều khiển vòng lặp ngoài từ vòng lặp trong
- **Lưu ý**: Hạn chế sử dụng, ưu tiên tách logic ra method riêng

### Best practices:
- **Ưu tiên logic rõ ràng** hơn là dùng break/continue. Nếu có thể viết lại điều kiện vòng lặp để tránh break, hãy làm vậy.
- **Không lạm dụng**: Nhiều break/continue trong một vòng lặp làm code khó theo dõi
- **Comment giải thích** tại sao dùng break/continue nếu logic không hiển nhiên
- **Tách method** thay vì dùng labeled loop

---

## 10. Lỗi thường gặp

### Lỗi 1: Vòng lặp vô hạn do continue trước cập nhật biến đếm (while)

```java
// Sai: Vòng lặp vô hạn!
int i = 0;
while (i < 5) {
    if (i == 3) {
        continue; // Nhảy lên kiểm tra điều kiện, i vẫn = 3 mãi!
    }
    System.out.println(i);
    i++; // Dòng này bị bỏ qua khi i == 3
}
```

```java
// Đúng: Cập nhật biến đếm TRƯỚC continue
int i = 0;
while (i < 5) {
    if (i == 3) {
        i++; // Cập nhật trước khi continue
        continue;
    }
    System.out.println(i);
    i++;
}
```

### Lỗi 2: Nhầm break với return

```java
// Sai: Dùng break nhưng muốn thoát method
public static void process(int[] arr) {
    for (int x : arr) {
        if (x < 0) {
            break; // Chỉ thoát vòng lặp, method vẫn tiếp tục chạy
        }
        System.out.println(x);
    }
    System.out.println("Dong nay VAN chay sau break!");
}
```

```java
// Đúng: Dùng return nếu muốn thoát method
public static void process(int[] arr) {
    for (int x : arr) {
        if (x < 0) {
            return; // Thoát method luôn
        }
        System.out.println(x);
    }
    System.out.println("Dong nay KHONG chay sau return");
}
```

### Lỗi 3: Dùng break/continue ngoài vòng lặp

```java
// Sai: Lỗi biên dịch!
if (x > 5) {
    break; // LỖI: break chỉ dùng trong vòng lặp hoặc switch
}
```

```java
// Đúng: break phải nằm trong vòng lặp hoặc switch
for (int i = 0; i < 10; i++) {
    if (i > 5) {
        break; // OK: nằm trong for
    }
}
```

### Lỗi 4: Labeled break/continue với nhãn sai

```java
// Sai: Nhãn không tồn tại
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        break myLabel; // LỖI: 'myLabel' chưa được định nghĩa
    }
}
```

```java
// Đúng: Định nghĩa nhãn đúng chỗ
myLabel:
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        break myLabel; // OK
    }
}
```

### Lỗi 5: Lạm dụng break thay vì chỉnh sửa điều kiện vòng lặp

```java
// Không tốt: Dùng break thay vì điều kiện rõ ràng
int i = 0;
while (true) {
    if (i >= 10) {
        break;
    }
    System.out.println(i);
    i++;
}
```

```java
// Tốt hơn: Điều kiện rõ ràng trong while
int i = 0;
while (i < 10) {
    System.out.println(i);
    i++;
}
```

---

## 11. Câu hỏi phỏng vấn

### Câu 1: Sự khác nhau giữa `break` và `return` là gì?

**Trả lời:**
- `break` chỉ **thoát vòng lặp hoặc switch** gần nhất. Code sau vòng lặp/switch trong cùng method **vẫn được thực thi**.
- `return` **thoát khỏi toàn bộ method** và trả về giá trị (nếu có). Code sau `return` trong method **không được thực thi**.

```java
void example() {
    for (int i = 0; i < 5; i++) {
        if (i == 3) break;
    }
    System.out.println("Dong nay VAN chay sau break");

    for (int i = 0; i < 5; i++) {
        if (i == 3) return;
    }
    System.out.println("Dong nay KHONG chay sau return");
}
```

### Câu 2: Labeled break là gì? Cho ví dụ thực tế.

**Trả lời:** Labeled break cho phép thoát khỏi **vòng lặp được gán nhãn cụ thể**, không chỉ vòng lặp gần nhất. Thường dùng khi cần **thoát nhiều cấp vòng lặp lồng nhau** cùng lúc. Ví dụ thực tế: tìm kiếm một giá trị trong ma trận 2 chiều, khi tìm thấy thì thoát cả 2 vòng for.

```java
found:
for (int row = 0; row < matrix.length; row++) {
    for (int col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col] == target) {
            break found; // Thoát cả 2 vòng
        }
    }
}
```

### Câu 3: `continue` hoạt động khác nhau thế nào trong `for` và `while`?

**Trả lời:** Trong vòng `for`, khi gặp `continue`, chương trình nhảy đến **phần update** (ví dụ `i++`), rồi kiểm tra condition. Vì vậy biến đếm **luôn được cập nhật**. Trong vòng `while`, khi gặp `continue`, chương trình nhảy **trực tiếp lên kiểm tra condition**. Nếu dòng cập nhật biến đếm nằm **sau `continue`**, nó sẽ bị bỏ qua và có thể gây **vòng lặp vô hạn**.

```java
// for: i++ LUÔN được thực thi dù có continue
for (int i = 0; i < 5; i++) {
    if (i == 3) continue; // i++ vẫn chạy -> i tăng lên 4
}

// while: cần cập nhật TRƯỚC continue
int i = 0;
while (i < 5) {
    if (i == 3) {
        i++; // PHẢI cập nhật trước continue
        continue;
    }
    i++;
}
```

### Câu 4: Có nên dùng `break` và `continue` nhiều trong code không?

**Trả lời:** **Không nên lạm dụng.** Một vài `break` hoặc `continue` là bình thường và giúp code hiệu quả hơn (ví dụ: dừng tìm khi đã thấy, bỏ qua dữ liệu không hợp lệ). Nhưng **nhiều break/continue** trong một vòng lặp làm luồng chương trình khó theo dõi và khó debug. Trong trường hợp đó, nên **tách logic ra method riêng**, dùng `return` thay cho `break`, hoặc **viết lại điều kiện vòng lặp** cho rõ ràng hơn.

### Câu 5: `continue` có thể dùng trong `switch` không?

**Trả lời:** **Không trực tiếp.** `continue` chỉ dùng trong **vòng lặp** (for, while, do-while), không dùng trong switch đơn lẻ. Tuy nhiên, nếu switch **nằm bên trong** một vòng lặp, bạn có thể dùng `continue` trong switch để **bỏ qua lần lặp hiện tại** của vòng lặp ngoài:

```java
for (int i = 0; i < 5; i++) {
    switch (i) {
        case 2:
            continue; // Bỏ qua lần lặp i=2 của vòng for
        default:
            System.out.println(i);
    }
}
// Kết quả: 0, 1, 3, 4 (bỏ qua 2)
```
