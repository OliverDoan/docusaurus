---
sidebar_position: 14
title: "Vong lap trong Java"
---
# Vong lap trong Java

## 1. Gioi thieu

**Vong lap (Loop)** trong Java cho phep chuong trinh **thuc thi mot khoi lenh lap di lap lai** cho den khi mot dieu kien nhat dinh khong con dung.

**Tai sao can vong lap?** Trong lap trinh, co rat nhieu tinh huong can lam di lam lai mot viec: duyet danh sach san pham, tinh tong cac so, doi nguoi dung nhap dung mat khau, xu ly tung dong du lieu tu file... Neu khong co vong lap, ban phai viet cung mot dong code hang tram, hang ngan lan - dieu nay la **bat kha thi**.

Hay hinh dung vong lap nhu mot **bang chuyen trong nha may**:
- San pham di qua tung cong doan (moi vong lap)
- Khi san pham dat chuan (dieu kien dung), no duoc chuyen ra ngoai (ket thuc vong lap)
- Neu chua dat, no tiep tuc quay lai (lap tiep)

---

## Noi dung

1. [Gioi thieu](#1-gioi-thieu)
2. [Vong lap for](#2-vong-lap-for)
3. [Vong lap while](#3-vong-lap-while)
4. [Vong lap do-while](#4-vong-lap-do-while)
5. [Vong lap for-each (Enhanced for)](#5-vong-lap-for-each-enhanced-for)
6. [So sanh cac loai vong lap](#6-so-sanh-cac-loai-vong-lap)
7. [Vong lap long nhau (Nested loops)](#7-vong-lap-long-nhau-nested-loops)
8. [Vong lap vo han](#8-vong-lap-vo-han)
9. [Labeled loops](#9-labeled-loops)
10. [Vi du thuc te](#10-vi-du-thuc-te)
11. [Khi nao dung?](#11-khi-nao-dung)
12. [Loi thuong gap](#12-loi-thuong-gap)
13. [Cau hoi phong van](#13-cau-hoi-phong-van)

---

## 2. Vong lap for

### 2.1 Cu phap

```java
for (initialization; condition; update) {
    // code duoc lap lai
}
```

Trong do:
- **`initialization`**: khoi tao bien dem (chay 1 lan duy nhat)
- **`condition`**: dieu kien lap (kiem tra truoc moi vong)
- **`update`**: cap nhat bien dem (chay sau moi vong)

### 2.2 Vi du co ban

```java
public class ForLoopDemo {
    public static void main(String[] args) {
        // In cac so tu 1 den 5
        for (int i = 1; i <= 5; i++) {
            System.out.println("So: " + i);
        }
    }
}
```

**Ket qua:**
```
So: 1
So: 2
So: 3
So: 4
So: 5
```

### 2.3 Qua trinh thuc thi

```
Buoc 1: int i = 1        (khoi tao)
Buoc 2: i <= 5 ? true    (kiem tra dieu kien)
Buoc 3: in "So: 1"       (thuc thi body)
Buoc 4: i++  -> i = 2    (cap nhat)
Buoc 5: i <= 5 ? true    (kiem tra lai)
...
Buoc cuoi: i = 6, i <= 5 ? false -> THOAT
```

### 2.4 Dem nguoc

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

### 2.5 For voi nhieu bien

```java
public class MultiVarForDemo {
    public static void main(String[] args) {
        for (int i = 0, j = 10; i < j; i++, j--) {
            System.out.println("i = " + i + ", j = " + j);
        }
    }
}
```

**Ket qua:**
```
i = 0, j = 10
i = 1, j = 9
i = 2, j = 8
i = 3, j = 7
i = 4, j = 6
```

---

## 3. Vong lap while

### 3.1 Cu phap

```java
while (condition) {
    // code duoc lap lai
}
```

- **Kiem tra dieu kien TRUOC** khi thuc thi body
- Neu dieu kien sai ngay tu dau, body **khong chay lan nao**

### 3.2 Vi du

```java
public class WhileLoopDemo {
    public static void main(String[] args) {
        int i = 1;

        while (i <= 5) {
            System.out.println("Lan lap thu: " + i);
            i++; // QUAN TRONG: phai cap nhat bien dem!
        }
    }
}
```

**Ket qua:**
```
Lan lap thu: 1
Lan lap thu: 2
Lan lap thu: 3
Lan lap thu: 4
Lan lap thu: 5
```

### 3.3 While voi dieu kien dong

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

## 4. Vong lap do-while

### 4.1 Cu phap

```java
do {
    // code duoc lap lai
} while (condition);
```

- **Thuc thi body TRUOC**, roi moi kiem tra dieu kien
- Body luon chay **it nhat 1 lan**, du dieu kien sai ngay tu dau

### 4.2 Vi du: Body chay du dieu kien sai

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

**Ket qua:**
```
Gia tri i: 10
Ket thuc. i = 11
```

Mac du `i = 10` (lon hon 5), body van chay **1 lan**.

### 4.3 Vi du: Menu lua chon

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

## 5. Vong lap for-each (Enhanced for)

### 5.1 Cu phap

```java
for (dataType element : collection) {
    // xu ly tung element
}
```

Dung de **duyet qua tung phan tu** cua mang hoac Collection (ArrayList, Set, ...).

### 5.2 Vi du voi mang

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

**Ket qua:**
```
Trai cay: Tao
Trai cay: Cam
Trai cay: Chuoi
Trai cay: Nho
```

### 5.3 Vi du voi ArrayList

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

### 5.4 Han che cua for-each

- **Khong truy cap duoc index** cua phan tu
- **Khong the thay doi phan tu** cua mang/collection trong vong lap
- **Khong the duyet nguoc**
- **Khong the bo qua phan tu** (khong kiem soat buoc nhay)

---

## 6. So sanh cac loai vong lap

| Tieu chi | for | while | do-while | for-each |
|---------|-----|-------|----------|----------|
| Biet truoc so lan lap | Co | Khong | Khong | Co (so phan tu) |
| Kiem tra dieu kien | Truoc | Truoc | Sau | Tu dong |
| Chay toi thieu | 0 lan | 0 lan | **1 lan** | 0 lan |
| Truy cap index | Co | Co | Co | **Khong** |
| Dung cho | Dem, duyet co index | Dieu kien dong | Menu, nhap lieu | Duyet mang/collection |

---

## 7. Vong lap long nhau (Nested loops)

Vong lap dat ben trong vong lap khac:

### 7.1 In bang cuu chuong

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

### 7.2 In hinh tam giac sao

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

**Ket qua:**
```
*
* *
* * *
* * * *
* * * * *
```

**Luu y:** Vong lap long nhau co **do phuc tap O(n x m)**. Neu n va m lon, hieu nang se giam dang ke. Tranh long qua 3 cap.

---

## 8. Vong lap vo han

### 8.1 Cach tao vong lap vo han

```java
// Cach 1: for
for (;;) {
    System.out.println("Vo han voi for");
}

// Cach 2: while
while (true) {
    System.out.println("Vo han voi while");
}

// Cach 3: do-while
do {
    System.out.println("Vo han voi do-while");
} while (true);
```

### 8.2 Khi nao vong lap vo han co ich?

- **Server** lang nghe ket noi lien tuc
- **Game loop** chay lien tuc cho den khi nguoi choi thoat
- **Menu chuong trinh** lap lai cho den khi chon "Thoat"

```java
public class InfiniteLoopUseful {
    public static void main(String[] args) {
        int count = 0;

        while (true) {
            count++;
            System.out.println("Lan chay: " + count);

            if (count >= 5) {
                System.out.println("Da du 5 lan, thoat!");
                break; // Thoat vong lap vo han
            }
        }
    }
}
```

### 8.3 Cach tranh vong lap vo han ngoai y muon

- **Luon cap nhat bien dieu kien** ben trong vong lap
- **Dat dieu kien thoat ro rang**
- **Su dung break** khi can thiet
- **Kiem tra logic** truoc khi chay

---

## 9. Labeled loops

Labeled loop cho phep ban **dat nhan (label)** cho vong lap, roi dung `break` hoac `continue` de **thoat hoac bo qua vong lap cu the** (khong chi vong lap gan nhat):

```java
public class LabeledLoopDemo {
    public static void main(String[] args) {
        outer:
        for (int i = 1; i <= 3; i++) {
            inner:
            for (int j = 1; j <= 3; j++) {
                if (i == 2 && j == 2) {
                    System.out.println("Break outer tai i=" + i + ", j=" + j);
                    break outer; // Thoat vong lap ngoai
                }
                System.out.println("i=" + i + ", j=" + j);
            }
        }
        System.out.println("Ket thuc");
    }
}
```

**Ket qua:**
```
i=1, j=1
i=1, j=2
i=1, j=3
i=2, j=1
Break outer tai i=2, j=2
Ket thuc
```

**Luu y:** Labeled loop lam code **kho doc**, nen **han che su dung**. Trong da so truong hop, co the thay the bang cach **tach logic ra method rieng** va dung `return`.

---

## 10. Vi du thuc te

### 10.1 Duyet mang tim gia tri lon nhat

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

### 10.2 Tim kiem phan tu trong mang

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

### 10.3 Tinh giai thua

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

## 11. Khi nao dung?

### for:
- Biet **chinh xac so lan lap**
- Can **bien dem** (index)
- Duyet mang khi can index

### while:
- **Chua biet truoc** so lan lap
- Dieu kien phu thuoc **su kien ben ngoai** (nhap lieu, ket noi mang...)
- **Doc file** cho den het

### do-while:
- Can body chay **it nhat 1 lan**
- **Menu chuong trinh** (hien menu truoc, roi hoi tiep)
- **Nhap lieu co kiem tra** (nhap truoc, kiem tra sau)

### for-each:
- **Duyet toan bo** mang hoac collection
- **Khong can index**, chi can gia tri
- **Doc-only** (khong thay doi phan tu)

### Best practices:
- **Uu tien for-each** khi chi can doc du lieu
- Tranh **vong lap long qua 3 cap**
- **Luon dam bao dieu kien thoat** de tranh vong lap vo han
- **Dat ten bien dem ro rang** (`i`, `j`, `row`, `col`...)

---

## 12. Loi thuong gap

### Loi 1: Quen cap nhat bien dem (vong lap vo han)

```java
// Sai: Quen i++ -> Vong lap vo han!
int i = 0;
while (i < 5) {
    System.out.println(i);
    // Thieu i++ o day!
}
```

```java
// Dung: Co cap nhat bien dem
int i = 0;
while (i < 5) {
    System.out.println(i);
    i++;
}
```

### Loi 2: Sai dieu kien vong lap

```java
// Sai: Dieu kien luon dung -> Vo han
for (int i = 0; i < 10; i--) { // i giam mai, luon < 10
    System.out.println(i);
}
```

```java
// Dung: Dieu kien tien dan ve ket thuc
for (int i = 0; i < 10; i++) {
    System.out.println(i);
}
```

### Loi 3: Off-by-one error (sai 1 don vi)

```java
// Sai: Muon in 1-10 nhung chi in 1-9
for (int i = 1; i < 10; i++) {
    System.out.println(i); // Chi in den 9!
}
```

```java
// Dung: Dung <= de bao gom ca 10
for (int i = 1; i <= 10; i++) {
    System.out.println(i);
}
```

### Loi 4: Thay doi collection trong for-each

```java
// Sai: ConcurrentModificationException!
import java.util.ArrayList;

ArrayList<String> list = new ArrayList<>();
list.add("A");
list.add("B");
list.add("C");

for (String item : list) {
    if (item.equals("B")) {
        list.remove(item); // LOI khi chay!
    }
}
```

```java
// Dung: Dung Iterator hoac removeIf
import java.util.ArrayList;
import java.util.Iterator;

ArrayList<String> list = new ArrayList<>();
list.add("A");
list.add("B");
list.add("C");

Iterator<String> it = list.iterator();
while (it.hasNext()) {
    if (it.next().equals("B")) {
        it.remove(); // An toan
    }
}

// Hoac don gian hon (Java 8+):
// list.removeIf(item -> item.equals("B"));
```

### Loi 5: Dung == thay vi equals() khi so sanh String trong vong lap

```java
// Sai: So sanh tham chieu thay vi noi dung
String[] arr = {new String("Java"), new String("Python")};
for (String s : arr) {
    if (s == "Java") { // Co the tra ve false!
        System.out.println("Tim thay");
    }
}
```

```java
// Dung: Dung equals()
String[] arr = {new String("Java"), new String("Python")};
for (String s : arr) {
    if (s.equals("Java")) {
        System.out.println("Tim thay");
    }
}
```

---

## 13. Cau hoi phong van

### Cau 1: Su khac nhau giua `while` va `do-while` la gi?

**Tra loi:**
- `while` **kiem tra dieu kien TRUOC** khi thuc thi body. Neu dieu kien sai ngay tu dau, body **khong chay lan nao**.
- `do-while` **thuc thi body TRUOC**, roi moi kiem tra dieu kien. Body luon chay **it nhat 1 lan**.

```java
// while: khong chay lan nao
int x = 10;
while (x < 5) {
    System.out.println(x); // Khong in gi ca
}

// do-while: chay 1 lan
int y = 10;
do {
    System.out.println(y); // In "10"
} while (y < 5);
```

### Cau 2: Su khac nhau giua `for` va `for-each`?

**Tra loi:**

| Tieu chi | for | for-each |
|---------|-----|----------|
| Truy cap index | Co | Khong |
| Thay doi phan tu | Co | Khong truc tiep |
| Duyet nguoc | Co | Khong |
| Cu phap | `for (int i=0; ...)` | `for (Type x : arr)` |
| Loi off-by-one | Co the | Khong |
| Khi nao dung | Can index, thay doi, duyet nguoc | Doc-only, gon gang |

### Cau 3: Co the dung for-each de thay doi (modify) phan tu cua collection khong?

**Tra loi:** **Khong truc tiep.** Trong for-each, bien lap (loop variable) la **ban sao** cua gia tri phan tu (voi primitive) hoac ban sao cua tham chieu (voi object). Voi kieu nguyen thuy va String, thay doi bien lap **khong anh huong** den collection goc. Voi object, ban co the **thay doi thuoc tinh ben trong** object (vi cung tham chieu), nhung **khong the thay the phan tu** trong collection. Ngoai ra, **khong duoc add/remove phan tu** trong khi dang duyet bang for-each (se gay `ConcurrentModificationException`).

### Cau 4: Cach nao de tao vong lap vo han? Khi nao no co ich?

**Tra loi:** Co 3 cach chinh:
```java
for (;;) { }
while (true) { }
do { } while (true);
```
Vong lap vo han co ich trong: **server** lang nghe request lien tuc, **game loop**, **event loop** cua ung dung GUI, **menu chuong trinh** cho den khi nguoi dung chon thoat. Luon phai co **dieu kien `break`** ben trong de ket thuc vong lap khi can.

### Cau 5: Labeled loop la gi? Khi nao nen dung?

**Tra loi:** Labeled loop la vong lap duoc **dat ten (nhan)**, cho phep `break` hoac `continue` tac dong len **vong lap cu the** thay vi chi vong lap gan nhat. Vi du `break outer;` se thoat vong lap ngoai trong nested loop. Tuy nhien, labeled loop lam code **kho doc va kho bao tri**, nen chi dung khi **that su can thiet** (vi du: tim kiem trong ma tran 2 chieu va can thoat ca 2 vong). Trong da so truong hop, nen **tach logic ra method rieng** va dung `return` thay vi labeled loop.
