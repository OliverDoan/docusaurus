---
sidebar_position: 16
title: "Bai tap minh hoa"
---
# Bai tap minh hoa

## 1. Gioi thieu

Sau khi da hoc cac kien thuc co ban ve **if-else**, **switch-case**, **vong lap**, **break & continue**, viec **thuc hanh bang cac bai tap cu the** la buoc quan trong nhat de hieu sau va nho lau.

**Tai sao can thuc hanh?** Ly thuyet chi cho ban hieu khai niem, nhung **viet code that** moi giup ban: nhan dien pattern, xu ly loi, va tu tin giai quyet van de. Cac bai tap duoi day duoc chon loc tu **de thi, phong van va bai tap pho bien** nhat khi hoc Java co ban.

Moi bai tap gom: **De bai** -> **Phan tich** -> **Code** -> **Output**.

---

## Noi dung

1. [Kiem tra chan le](#2-bai-1-kiem-tra-chan-le)
2. [Tim max 3 so](#3-bai-2-tim-so-lon-nhat-trong-3-so)
3. [Giai phuong trinh bac 2](#4-bai-3-giai-phuong-trinh-bac-2)
4. [In bang cuu chuong](#5-bai-4-in-bang-cuu-chuong)
5. [Tinh tong 1 den n](#6-bai-5-tinh-tong-tu-1-den-n)
6. [Kiem tra so nguyen to](#7-bai-6-kiem-tra-so-nguyen-to)
7. [Menu chon phep tinh](#8-bai-7-menu-chon-phep-tinh-may-tinh-don-gian)
8. [Kiem tra mat khau](#9-bai-8-kiem-tra-mat-khau)
9. [Dem ky tu trong chuoi](#10-bai-9-dem-ky-tu-trong-chuoi)
10. [Dao nguoc chuoi](#11-bai-10-dao-nguoc-chuoi)
11. [Kiem tra palindrome](#12-bai-11-kiem-tra-palindrome)
12. [Sap xep mang](#13-bai-12-sap-xep-mang-bubble-sort)

---

## 2. Bai 1: Kiem tra chan le

### De bai
Viet chuong trinh kiem tra mot so nguyen la **so chan** hay **so le**.

### Phan tich
- So chan la so **chia het cho 2** (phan du bang 0)
- So le la so **khong chia het cho 2** (phan du bang 1)
- Dung toan tu `%` (modulo) de lay phan du

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

## 3. Bai 2: Tim so lon nhat trong 3 so

### De bai
Cho 3 so nguyen a, b, c. Tim so lon nhat.

### Phan tich
- So sanh tung cap: a voi b, roi ket qua voi c
- Hoac dung cach: gia su a la max, roi so sanh voi b va c

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

## 4. Bai 3: Giai phuong trinh bac 2

### De bai
Giai phuong trinh bac 2: **ax^2 + bx + c = 0**

### Phan tich
- Tinh **delta = b^2 - 4ac**
- Neu delta < 0: vo nghiem
- Neu delta == 0: nghiem kep x = -b / (2a)
- Neu delta > 0: hai nghiem phan biet
- Truong hop dac biet: a == 0 (phuong trinh bac nhat)

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

## 5. Bai 4: In bang cuu chuong

### De bai
In bang cuu chuong tu 2 den 9.

### Phan tich
- Vong ngoai: duyet so can nhan (2 -> 9)
- Vong trong: duyet so nhan voi (1 -> 10)
- Ket qua = so can nhan * so nhan voi

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

### Output (rut gon)
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

## 6. Bai 5: Tinh tong tu 1 den n

### De bai
Tinh tong cac so tu 1 den n: **1 + 2 + 3 + ... + n**

### Phan tich
- Dung bien tich luy `sum`, khoi tao bang 0
- Moi lan lap: `sum += i`
- Co the kiem tra bang cong thuc: `n * (n + 1) / 2`

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

        // Kiem tra bang cong thuc
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

## 7. Bai 6: Kiem tra so nguyen to

### De bai
Kiem tra mot so nguyen n co phai la **so nguyen to** hay khong.

### Phan tich
- So nguyen to la so lon hon 1 va **chi chia het cho 1 va chinh no**
- Chi can kiem tra tu 2 den **sqrt(n)** (toi uu)
- Neu n < 2: khong phai so nguyen to
- Cac so chan > 2: khong phai so nguyen to

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

        // Kiem tra them mot vai so
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

## 8. Bai 7: Menu chon phep tinh (may tinh don gian)

### De bai
Viet chuong trinh may tinh don gian voi 4 phep tinh: cong, tru, nhan, chia. Nguoi dung chon phep tinh tu menu.

### Phan tich
- Dung switch-case de xu ly lua chon
- Xu ly truong hop chia cho 0
- Dung do-while de cho phep tinh nhieu lan

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

### Output (vi du)
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

## 9. Bai 8: Kiem tra mat khau

### De bai
Viet chuong trinh yeu cau nguoi dung nhap mat khau. Cho phep nhap toi da 3 lan. Neu dung thi thong bao thanh cong, sai 3 lan thi khoa tai khoan.

### Phan tich
- Dung vong lap voi bien dem so lan nhap sai
- Dung String.equals() de so sanh mat khau
- Dung break khi nhap dung

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

### Output (vi du sai 2 lan, dung lan 3)
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

## 10. Bai 9: Dem ky tu trong chuoi

### De bai
Cho mot chuoi, dem so lan xuat hien cua mot ky tu cu the trong chuoi do.

### Phan tich
- Duyet tung ky tu cua chuoi bang charAt()
- So sanh voi ky tu can tim
- Tang bien dem khi tim thay

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

        // Dem ca chu hoa va chu thuong
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

## 11. Bai 10: Dao nguoc chuoi

### De bai
Viet chuong trinh dao nguoc mot chuoi (khong dung StringBuilder.reverse()).

### Phan tich
- Duyet chuoi tu cuoi ve dau
- Noi tung ky tu vao chuoi moi
- Hoac dung mang char

### Code

```java
public class BaiTap10_DaoNguocChuoi {
    public static void main(String[] args) {
        String original = "Hello Java";

        // Cach 1: Duyet nguoc
        String reversed1 = "";
        for (int i = original.length() - 1; i >= 0; i--) {
            reversed1 += original.charAt(i);
        }
        System.out.println("Cach 1: " + reversed1);

        // Cach 2: Dung StringBuilder (hieu nang tot hon)
        StringBuilder sb = new StringBuilder();
        for (int i = original.length() - 1; i >= 0; i--) {
            sb.append(original.charAt(i));
        }
        String reversed2 = sb.toString();
        System.out.println("Cach 2: " + reversed2);

        // Cach 3: Dung mang char
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

## 12. Bai 11: Kiem tra Palindrome

### De bai
Kiem tra mot chuoi co phai la **palindrome** (doc xuoi va nguoc giong nhau) hay khong. Vi du: "madam", "racecar", "12321".

### Phan tich
- So sanh ky tu dau voi ky tu cuoi, ky tu thu 2 voi ky tu ke cuoi...
- Neu tat ca cac cap deu giong nhau -> palindrome
- Chi can duyet den giua chuoi

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
        // Chuyen ve chu thuong de khong phan biet hoa/thuong
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

## 13. Bai 12: Sap xep mang (Bubble Sort)

### De bai
Sap xep mot mang so nguyen tang dan bang thuat toan **Bubble Sort**.

### Phan tich
- **Bubble Sort**: so sanh tung cap phan tu lien ke, doi cho neu sai thu tu
- Lap lai cho den khi mang da duoc sap xep
- Do phuc tap: O(n^2) - phu hop voi mang nho
- Y tuong: phan tu lon "noi" len cuoi mang nhu bong khi

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
                    // Doi cho 2 phan tu
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    swapped = true;
                }
            }

            System.out.print("Sau vong " + (i + 1) + ":   ");
            printArray(arr);

            // Toi uu: neu khong co doi cho nao -> mang da sap xep
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

## 14. Tong ket

| Bai | Kien thuc chinh | Do kho |
|-----|-----------------|--------|
| 1. Chan le | if-else, modulo | De |
| 2. Max 3 so | if, so sanh | De |
| 3. Phuong trinh bac 2 | if long, Math.sqrt | Trung binh |
| 4. Bang cuu chuong | Vong lap long | De |
| 5. Tinh tong | for, bien tich luy | De |
| 6. So nguyen to | for, break, Math.sqrt | Trung binh |
| 7. May tinh | switch-case, do-while | Trung binh |
| 8. Mat khau | for, break, String.equals | Trung binh |
| 9. Dem ky tu | for, charAt | De |
| 10. Dao nguoc chuoi | for nguoc, StringBuilder | Trung binh |
| 11. Palindrome | while, two-pointer | Trung binh |
| 12. Bubble Sort | Nested loop, swap | Kho |

**Loi khuyen:** Hay tu viet code truoc khi xem loi giai. Neu bi ket, doc phan "Phan tich" de lay goi y, roi thu lai. Viec tu suy nghi va debug la cach hoc hieu qua nhat.
