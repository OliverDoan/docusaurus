---
sidebar_position: 16
title: "Bài tập minh họa"
---
# Bài tập minh họa

## 1. Giới thiệu

Sau khi đã học các kiến thức cơ bản về **if-else**, **switch-case**, **vòng lặp**, **break & continue**, việc **thực hành bằng các bài tập cụ thể** là bước quan trọng nhất để hiểu sâu và nhớ lâu.

**Tại sao cần thực hành?** Lý thuyết chỉ cho bạn hiểu khái niệm, nhưng **viết code thật** mới giúp bạn: nhận diện pattern, xử lý lỗi, và tự tin giải quyết vấn đề. Các bài tập dưới đây được chọn lọc từ **đề thi, phỏng vấn và bài tập phổ biến** nhất khi học Java cơ bản.

Mỗi bài tập gồm: **Đề bài** -> **Phân tích** -> **Code** -> **Output**.

---

## Nội dung

1. [Kiểm tra chẵn lẻ](#2-bai-1-kiem-tra-chan-le)
2. [Tìm max 3 số](#3-bai-2-tim-so-lon-nhat-trong-3-so)
3. [Giải phương trình bậc 2](#4-bai-3-giai-phuong-trinh-bac-2)
4. [In bảng cửu chương](#5-bai-4-in-bang-cuu-chuong)
5. [Tính tổng 1 đến n](#6-bai-5-tinh-tong-tu-1-den-n)
6. [Kiểm tra số nguyên tố](#7-bai-6-kiem-tra-so-nguyen-to)
7. [Menu chọn phép tính](#8-bai-7-menu-chon-phep-tinh-may-tinh-don-gian)
8. [Kiểm tra mật khẩu](#9-bai-8-kiem-tra-mat-khau)
9. [Đếm ký tự trong chuỗi](#10-bai-9-dem-ky-tu-trong-chuoi)
10. [Đảo ngược chuỗi](#11-bai-10-dao-nguoc-chuoi)
11. [Kiểm tra palindrome](#12-bai-11-kiem-tra-palindrome)
12. [Sắp xếp mảng](#13-bai-12-sap-xep-mang-bubble-sort)

---

## 2. Bài 1: Kiểm tra chẵn lẻ

### Đề bài
Viết chương trình kiểm tra một số nguyên là **số chẵn** hay **số lẻ**.

### Phân tích
- Số chẵn là số **chia hết cho 2** (phần dư bằng 0)
- Số lẻ là số **không chia hết cho 2** (phần dư bằng 1)
- Dùng toán tử `%` (modulo) để lấy phần dư

### Code

```java
public class BaiTap01_ChanLe {
    public static void main(String[] args) {
        int n = 7;

        if (n % 2 == 0) {
            System.out.println(n + " la so chan");
        } else {
            System.out.println(n + " la so le");
        }
    }
}
```

### Output
```
7 la so le
```

---

## 3. Bài 2: Tìm số lớn nhất trong 3 số

### Đề bài
Cho 3 số nguyên a, b, c. Tìm số lớn nhất.

### Phân tích
- So sánh từng cặp: a với b, rồi kết quả với c
- Hoặc dùng cách: giả sử a là max, rồi so sánh với b và c

### Code

```java
public class BaiTap02_Max3So {
    public static void main(String[] args) {
        int a = 15, b = 42, c = 28;

        int max = a;

        if (b > max) {
            max = b;
        }
        if (c > max) {
            max = c;
        }

        System.out.println("Ba so: " + a + ", " + b + ", " + c);
        System.out.println("So lon nhat: " + max);
    }
}
```

### Output
```
Ba so: 15, 42, 28
So lon nhat: 42
```

---

## 4. Bài 3: Giải phương trình bậc 2

### Đề bài
Giải phương trình bậc 2: **ax^2 + bx + c = 0**

### Phân tích
- Tính **delta = b^2 - 4ac**
- Nếu delta < 0: vô nghiệm
- Nếu delta == 0: nghiệm kép x = -b / (2a)
- Nếu delta > 0: hai nghiệm phân biệt
- Trường hợp đặc biệt: a == 0 (phương trình bậc nhất)

### Code

```java
public class BaiTap03_PhuongTrinhBac2 {
    public static void main(String[] args) {
        double a = 1, b = -5, c = 6;

        System.out.println("Phuong trinh: " + a + "x^2 + (" + b + ")x + " + c + " = 0");

        if (a == 0) {
            // Phuong trinh bac nhat: bx + c = 0
            if (b == 0) {
                if (c == 0) {
                    System.out.println("Vo so nghiem");
                } else {
                    System.out.println("Vo nghiem");
                }
            } else {
                double x = -c / b;
                System.out.println("Phuong trinh bac nhat, x = " + x);
            }
        } else {
            double delta = b * b - 4 * a * c;

            if (delta < 0) {
                System.out.println("Phuong trinh vo nghiem (delta = " + delta + ")");
            } else if (delta == 0) {
                double x = -b / (2 * a);
                System.out.println("Nghiem kep: x = " + x);
            } else {
                double x1 = (-b + Math.sqrt(delta)) / (2 * a);
                double x2 = (-b - Math.sqrt(delta)) / (2 * a);
                System.out.println("Hai nghiem:");
                System.out.println("  x1 = " + x1);
                System.out.println("  x2 = " + x2);
            }
        }
    }
}
```

### Output
```
Phuong trinh: 1.0x^2 + (-5.0)x + 6.0 = 0
Hai nghiem:
  x1 = 3.0
  x2 = 2.0
```

---

## 5. Bài 4: In bảng cửu chương

### Đề bài
In bảng cửu chương từ 2 đến 9.

### Phân tích
- Vòng ngoài: duyệt số cần nhân (2 -> 9)
- Vòng trong: duyệt số nhân với (1 -> 10)
- Kết quả = số cần nhân * số nhân với

### Code

```java
public class BaiTap04_BangCuuChuong {
    public static void main(String[] args) {
        for (int i = 2; i <= 9; i++) {
            System.out.println("=== Bang cuu chuong " + i + " ===");
            for (int j = 1; j <= 10; j++) {
                System.out.printf("  %d x %2d = %2d%n", i, j, i * j);
            }
            System.out.println();
        }
    }
}
```

### Output (rút gọn)
```
=== Bang cuu chuong 2 ===
  2 x  1 =  2
  2 x  2 =  4
  ...
  2 x 10 = 20

=== Bang cuu chuong 3 ===
  3 x  1 =  3
  ...
```

---

## 6. Bài 5: Tính tổng từ 1 đến n

### Đề bài
Tính tổng các số từ 1 đến n: **1 + 2 + 3 + ... + n**

### Phân tích
- Dùng biến tích lũy `sum`, khởi tạo bằng 0
- Mỗi lần lặp: `sum += i`
- Có thể kiểm tra bằng công thức: `n * (n + 1) / 2`

### Code

```java
public class BaiTap05_TinhTong {
    public static void main(String[] args) {
        int n = 100;
        int sum = 0;

        for (int i = 1; i <= n; i++) {
            sum += i;
        }

        System.out.println("Tong tu 1 den " + n + " = " + sum);

        // Kiểm tra bằng công thức
        int formulaResult = n * (n + 1) / 2;
        System.out.println("Kiem tra (cong thuc): " + formulaResult);
    }
}
```

### Output
```
Tong tu 1 den 100 = 5050
Kiem tra (cong thuc): 5050
```

---

## 7. Bài 6: Kiểm tra số nguyên tố

### Đề bài
Kiểm tra một số nguyên n có phải là **số nguyên tố** hay không.

### Phân tích
- Số nguyên tố là số lớn hơn 1 và **chỉ chia hết cho 1 và chính nó**
- Chỉ cần kiểm tra từ 2 đến **sqrt(n)** (tối ưu)
- Nếu n < 2: không phải số nguyên tố
- Các số chẵn > 2: không phải số nguyên tố

### Code

```java
public class BaiTap06_SoNguyenTo {
    public static void main(String[] args) {
        int n = 29;

        boolean isPrime = checkPrime(n);

        if (isPrime) {
            System.out.println(n + " la so nguyen to");
        } else {
            System.out.println(n + " khong phai so nguyen to");
        }

        // Kiểm tra thêm một vài số
        int[] testNumbers = {1, 2, 3, 4, 17, 18, 97, 100};
        for (int num : testNumbers) {
            System.out.println(num + " -> " + (checkPrime(num) ? "Nguyen to" : "Khong nguyen to"));
        }
    }

    static boolean checkPrime(int n) {
        if (n < 2) {
            return false;
        }
        if (n == 2) {
            return true;
        }
        if (n % 2 == 0) {
            return false;
        }
        for (int i = 3; i <= Math.sqrt(n); i += 2) {
            if (n % i == 0) {
                return false;
            }
        }
        return true;
    }
}
```

### Output
```
29 la so nguyen to
1 -> Khong nguyen to
2 -> Nguyen to
3 -> Nguyen to
4 -> Khong nguyen to
17 -> Nguyen to
18 -> Khong nguyen to
97 -> Nguyen to
100 -> Khong nguyen to
```

---

## 8. Bài 7: Menu chọn phép tính (máy tính đơn giản)

### Đề bài
Viết chương trình máy tính đơn giản với 4 phép tính: cộng, trừ, nhân, chia. Người dùng chọn phép tính từ menu.

### Phân tích
- Dùng switch-case để xử lý lựa chọn
- Xử lý trường hợp chia cho 0
- Dùng do-while để cho phép tính nhiều lần

### Code

```java
import java.util.Scanner;

public class BaiTap07_MayTinh {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int choice;

        do {
            System.out.println("=============================");
            System.out.println("   MAY TINH DON GIAN");
            System.out.println("=============================");
            System.out.println("1. Phep cong (+)");
            System.out.println("2. Phep tru (-)");
            System.out.println("3. Phep nhan (*)");
            System.out.println("4. Phep chia (/)");
            System.out.println("0. Thoat");
            System.out.print("Chon phep tinh: ");
            choice = scanner.nextInt();

            if (choice == 0) {
                System.out.println("Tam biet!");
                break;
            }

            if (choice < 1 || choice > 4) {
                System.out.println("Lua chon khong hop le!\n");
                continue;
            }

            System.out.print("Nhap so thu nhat: ");
            double a = scanner.nextDouble();
            System.out.print("Nhap so thu hai: ");
            double b = scanner.nextDouble();

            double result;

            switch (choice) {
                case 1:
                    result = a + b;
                    System.out.printf("Ket qua: %.2f + %.2f = %.2f%n", a, b, result);
                    break;
                case 2:
                    result = a - b;
                    System.out.printf("Ket qua: %.2f - %.2f = %.2f%n", a, b, result);
                    break;
                case 3:
                    result = a * b;
                    System.out.printf("Ket qua: %.2f * %.2f = %.2f%n", a, b, result);
                    break;
                case 4:
                    if (b == 0) {
                        System.out.println("Loi: Khong the chia cho 0!");
                    } else {
                        result = a / b;
                        System.out.printf("Ket qua: %.2f / %.2f = %.2f%n", a, b, result);
                    }
                    break;
                default:
                    System.out.println("Lua chon khong hop le!");
            }
            System.out.println();

        } while (choice != 0);

        scanner.close();
    }
}
```

### Output (ví dụ)
```
=============================
   MAY TINH DON GIAN
=============================
1. Phep cong (+)
2. Phep tru (-)
3. Phep nhan (*)
4. Phep chia (/)
0. Thoat
Chon phep tinh: 1
Nhap so thu nhat: 10
Nhap so thu hai: 25
Ket qua: 10.00 + 25.00 = 35.00
```

---

## 9. Bài 8: Kiểm tra mật khẩu

### Đề bài
Viết chương trình yêu cầu người dùng nhập mật khẩu. Cho phép nhập tối đa 3 lần. Nếu đúng thì thông báo thành công, sai 3 lần thì khóa tài khoản.

### Phân tích
- Dùng vòng lặp với biến đếm số lần nhập sai
- Dùng String.equals() để so sánh mật khẩu
- Dùng break khi nhập đúng

### Code

```java
import java.util.Scanner;

public class BaiTap08_KiemTraMatKhau {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String correctPassword = "Java2024";
        int maxAttempts = 3;
        boolean isLoggedIn = false;

        System.out.println("=== DANG NHAP HE THONG ===");

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            System.out.print("Nhap mat khau (lan " + attempt + "/" + maxAttempts + "): ");
            String input = scanner.nextLine();

            if (input.equals(correctPassword)) {
                isLoggedIn = true;
                break;
            } else {
                int remaining = maxAttempts - attempt;
                if (remaining > 0) {
                    System.out.println("Sai mat khau! Con " + remaining + " lan thu.");
                }
            }
        }

        if (isLoggedIn) {
            System.out.println("Dang nhap thanh cong! Chao mung ban.");
        } else {
            System.out.println("Nhap sai " + maxAttempts + " lan. Tai khoan bi khoa!");
        }

        scanner.close();
    }
}
```

### Output (ví dụ sai 2 lần, đúng lần 3)
```
=== DANG NHAP HE THONG ===
Nhap mat khau (lan 1/3): 123456
Sai mat khau! Con 2 lan thu.
Nhap mat khau (lan 2/3): password
Sai mat khau! Con 1 lan thu.
Nhap mat khau (lan 3/3): Java2024
Dang nhap thanh cong! Chao mung ban.
```

---

## 10. Bài 9: Đếm ký tự trong chuỗi

### Đề bài
Cho một chuỗi, đếm số lần xuất hiện của một ký tự cụ thể trong chuỗi đó.

### Phân tích
- Duyệt từng ký tự của chuỗi bằng charAt()
- So sánh với ký tự cần tìm
- Tăng biến đếm khi tìm thấy

### Code

```java
public class BaiTap09_DemKyTu {
    public static void main(String[] args) {
        String text = "Hello World, Welcome to Java Programming!";
        char target = 'o';
        int count = 0;

        for (int i = 0; i < text.length(); i++) {
            if (text.charAt(i) == target) {
                count++;
            }
        }

        System.out.println("Chuoi: \"" + text + "\"");
        System.out.println("Ky tu '" + target + "' xuat hien " + count + " lan");

        // Đếm cả chữ hoa và chữ thường
        char targetIgnoreCase = 'w';
        int countIgnoreCase = 0;

        for (int i = 0; i < text.length(); i++) {
            if (Character.toLowerCase(text.charAt(i)) == Character.toLowerCase(targetIgnoreCase)) {
                countIgnoreCase++;
            }
        }
        System.out.println("Ky tu '" + targetIgnoreCase +
            "' (khong phan biet hoa/thuong) xuat hien " + countIgnoreCase + " lan");
    }
}
```

### Output
```
Chuoi: "Hello World, Welcome to Java Programming!"
Ky tu 'o' xuat hien 4 lan
Ky tu 'w' (khong phan biet hoa/thuong) xuat hien 2 lan
```

---

## 11. Bài 10: Đảo ngược chuỗi

### Đề bài
Viết chương trình đảo ngược một chuỗi (không dùng StringBuilder.reverse()).

### Phân tích
- Duyệt chuỗi từ cuối về đầu
- Nối từng ký tự vào chuỗi mới
- Hoặc dùng mảng char

### Code

```java
public class BaiTap10_DaoNguocChuoi {
    public static void main(String[] args) {
        String original = "Hello Java";

        // Cách 1: Duyệt ngược
        String reversed1 = "";
        for (int i = original.length() - 1; i >= 0; i--) {
            reversed1 += original.charAt(i);
        }
        System.out.println("Cach 1: " + reversed1);

        // Cách 2: Dùng StringBuilder (hiệu năng tốt hơn)
        StringBuilder sb = new StringBuilder();
        for (int i = original.length() - 1; i >= 0; i--) {
            sb.append(original.charAt(i));
        }
        String reversed2 = sb.toString();
        System.out.println("Cach 2: " + reversed2);

        // Cách 3: Dùng mảng char
        char[] chars = original.toCharArray();
        int left = 0;
        int right = chars.length - 1;
        while (left < right) {
            char temp = chars[left];
            chars[left] = chars[right];
            chars[right] = temp;
            left++;
            right--;
        }
        String reversed3 = new String(chars);
        System.out.println("Cach 3: " + reversed3);
    }
}
```

### Output
```
Cach 1: avaJ olleH
Cach 2: avaJ olleH
Cach 3: avaJ olleH
```

---

## 12. Bài 11: Kiểm tra Palindrome

### Đề bài
Kiểm tra một chuỗi có phải là **palindrome** (đọc xuôi và ngược giống nhau) hay không. Ví dụ: "madam", "racecar", "12321".

### Phân tích
- So sánh ký tự đầu với ký tự cuối, ký tự thứ 2 với ký tự kế cuối...
- Nếu tất cả các cặp đều giống nhau -> palindrome
- Chỉ cần duyệt đến giữa chuỗi

### Code

```java
public class BaiTap11_Palindrome {
    public static void main(String[] args) {
        String[] testCases = {"madam", "racecar", "hello", "12321", "Java"};

        for (String word : testCases) {
            boolean isPalin = isPalindrome(word);
            System.out.println("\"" + word + "\" " +
                (isPalin ? "LA palindrome" : "KHONG PHAI palindrome"));
        }
    }

    static boolean isPalindrome(String str) {
        // Chuyển về chữ thường để không phân biệt hoa/thường
        String s = str.toLowerCase();
        int left = 0;
        int right = s.length() - 1;

        while (left < right) {
            if (s.charAt(left) != s.charAt(right)) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }
}
```

### Output
```
"madam" LA palindrome
"racecar" LA palindrome
"hello" KHONG PHAI palindrome
"12321" LA palindrome
"Java" KHONG PHAI palindrome
```

---

## 13. Bài 12: Sắp xếp mảng (Bubble Sort)

### Đề bài
Sắp xếp một mảng số nguyên tăng dần bằng thuật toán **Bubble Sort**.

### Phân tích
- **Bubble Sort**: so sánh từng cặp phần tử liền kề, đổi chỗ nếu sai thứ tự
- Lặp lại cho đến khi mảng đã được sắp xếp
- Độ phức tạp: O(n^2) - phù hợp với mảng nhỏ
- Ý tưởng: phần tử lớn "nổi" lên cuối mảng như bong khí

### Code

```java
public class BaiTap12_BubbleSort {
    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};

        System.out.print("Mang ban dau: ");
        printArray(arr);

        // Bubble Sort
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            boolean swapped = false;

            for (int j = 0; j < n - 1 - i; j++) {
                if (arr[j] > arr[j + 1]) {
                    // Đổi chỗ 2 phần tử
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    swapped = true;
                }
            }

            System.out.print("Sau vong " + (i + 1) + ":   ");
            printArray(arr);

            // Tối ưu: nếu không có đổi chỗ nào -> mảng đã sắp xếp
            if (!swapped) {
                System.out.println("Mang da sap xep, dung som!");
                break;
            }
        }

        System.out.print("Ket qua:      ");
        printArray(arr);
    }

    static void printArray(int[] arr) {
        System.out.print("[");
        for (int i = 0; i < arr.length; i++) {
            System.out.print(arr[i]);
            if (i < arr.length - 1) {
                System.out.print(", ");
            }
        }
        System.out.println("]");
    }
}
```

### Output
```
Mang ban dau: [64, 34, 25, 12, 22, 11, 90]
Sau vong 1:   [34, 25, 12, 22, 11, 64, 90]
Sau vong 2:   [25, 12, 22, 11, 34, 64, 90]
Sau vong 3:   [12, 22, 11, 25, 34, 64, 90]
Sau vong 4:   [12, 11, 22, 25, 34, 64, 90]
Sau vong 5:   [11, 12, 22, 25, 34, 64, 90]
Sau vong 6:   [11, 12, 22, 25, 34, 64, 90]
Mang da sap xep, dung som!
Ket qua:      [11, 12, 22, 25, 34, 64, 90]
```

---

## 14. Tổng kết

| Bài | Kiến thức chính | Độ khó |
|-----|-----------------|--------|
| 1. Chẵn lẻ | if-else, modulo | Dễ |
| 2. Max 3 số | if, so sánh | Dễ |
| 3. Phương trình bậc 2 | if lồng, Math.sqrt | Trung bình |
| 4. Bảng cửu chương | Vòng lặp lồng | Dễ |
| 5. Tính tổng | for, biến tích lũy | Dễ |
| 6. Số nguyên tố | for, break, Math.sqrt | Trung bình |
| 7. Máy tính | switch-case, do-while | Trung bình |
| 8. Mật khẩu | for, break, String.equals | Trung bình |
| 9. Đếm ký tự | for, charAt | Dễ |
| 10. Đảo ngược chuỗi | for ngược, StringBuilder | Trung bình |
| 11. Palindrome | while, two-pointer | Trung bình |
| 12. Bubble Sort | Nested loop, swap | Khó |

**Lời khuyên:** Hãy tự viết code trước khi xem lời giải. Nếu bị kẹt, đọc phần "Phân tích" để lấy gợi ý, rồi thử lại. Việc tự suy nghĩ và debug là cách học hiệu quả nhất.
