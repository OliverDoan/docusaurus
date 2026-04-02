---
sidebar_position: 15
title: "Break & Continue"
---
# Break & Continue

## 1. Gioi thieu

Trong Java, **`break`** va **`continue`** la hai cau lenh dieu khien luong thuc thi ben trong vong lap va switch. Chung cho phep ban **can thiep vao qua trinh lap** thay vi de vong lap chay het tu nhien.

- **`break`**: thoat **hoan toan** khoi vong lap hoac switch
- **`continue`**: bo qua **phan con lai cua lan lap hien tai**, nhay sang lan lap tiep theo

**Tai sao can break va continue?** Khi duyet du lieu, ban thuong khong can xu ly het tat ca. Ví du: tim mot phan tu trong mang thi dung lai ngay khi tim thay (break), hoac bo qua cac du lieu khong hop le khi xu ly (continue). Hai cau lenh nay giup code **hieu qua hon** va **tranh xu ly thua**.

Hay hinh dung nhu ban dang **doc mot cuon sach**:
- **`break`** giong nhu ban **dong sach lai** vi da tim thay thong tin can thiet
- **`continue`** giong nhu ban **lat qua mot trang** vi trang do khong lien quan

---

## Noi dung

1. [Gioi thieu](#1-gioi-thieu)
2. [Cau lenh break](#2-cau-lenh-break)
3. [break trong switch](#3-break-trong-switch)
4. [Labeled break](#4-labeled-break)
5. [Cau lenh continue](#5-cau-lenh-continue)
6. [Labeled continue](#6-labeled-continue)
7. [So sanh break va continue](#7-so-sanh-break-va-continue)
8. [Vi du thuc te](#8-vi-du-thuc-te)
9. [Khi nao dung?](#9-khi-nao-dung)
10. [Loi thuong gap](#10-loi-thuong-gap)
11. [Cau hoi phong van](#11-cau-hoi-phong-van)

---

## 2. Cau lenh break

### 2.1 break trong vong lap

`break` **ket thuc ngay lap tuc** vong lap chua no. Code sau vong lap se duoc thuc thi tiep.

```java
public class BreakDemo {
    public static void main(String[] args) {
        for (int i = 1; i <= 10; i++) {
            if (i == 6) {
                System.out.println("Gap so 6, dung lai!");
                break; // Thoat vong lap ngay
            }
            System.out.println("i = " + i);
        }
        System.out.println("Da thoat vong lap.");
    }
}
```

**Ket qua:**
```
i = 1
i = 2
i = 3
i = 4
i = 5
Gap so 6, dung lai!
Da thoat vong lap.
```

### 2.2 break chi thoat vong lap gan nhat

Trong vong lap long nhau, `break` **chi thoat vong lap trong cung** (gan nhat):

```java
public class BreakNestedDemo {
    public static void main(String[] args) {
        for (int i = 1; i <= 3; i++) {
            for (int j = 1; j <= 3; j++) {
                if (j == 2) {
                    break; // Chi thoat vong for(j), khong thoat for(i)
                }
                System.out.println("i=" + i + ", j=" + j);
            }
        }
    }
}
```

**Ket qua:**
```
i=1, j=1
i=2, j=1
i=3, j=1
```

Moi lan `j == 2`, chi vong `for(j)` bi thoat. Vong `for(i)` van tiep tuc.

---

## 3. break trong switch

`break` trong switch dung de **ket thuc mot case**, ngan khong cho code chay xuong cac case ben duoi (fall-through):

```java
public class BreakSwitchDemo {
    public static void main(String[] args) {
        int option = 2;

        switch (option) {
            case 1:
                System.out.println("Tuy chon 1");
                break; // Thoat switch
            case 2:
                System.out.println("Tuy chon 2");
                break; // Thoat switch
            case 3:
                System.out.println("Tuy chon 3");
                break;
            default:
                System.out.println("Tuy chon khong hop le");
        }
    }
}
```

**Ket qua:**
```
Tuy chon 2
```

---

## 4. Labeled break

Khi co vong lap long nhau, `break` thuong chi thoat vong trong cung. Neu muon **thoat vong lap ngoai**, ban dung **labeled break**:

### 4.1 Cu phap

```java
labelName:
for (...) {
    for (...) {
        if (condition) {
            break labelName; // Thoat vong lap co nhan labelName
        }
    }
}
```

### 4.2 Vi du: Tim kiem trong ma tran

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
                    break search; // Thoat CA HAI vong lap
                }
            }
        }

        if (!found) {
            System.out.println("Khong tim thay " + target);
        }
    }
}
```

**Ket qua:**
```
Tim thay 5 tai vi tri [1][1]
```

Neu khong co `break search`, chuong trinh se tiep tuc duyet cac phan tu con lai (khong can thiet).

---

## 5. Cau lenh continue

### 5.1 continue trong for

`continue` **bo qua phan code con lai** trong lan lap hien tai va **nhay sang lan lap tiep theo**:

```java
public class ContinueForDemo {
    public static void main(String[] args) {
        for (int i = 1; i <= 10; i++) {
            if (i % 2 == 0) {
                continue; // Bo qua so chan
            }
            System.out.println("So le: " + i);
        }
    }
}
```

**Ket qua:**
```
So le: 1
So le: 3
So le: 5
So le: 7
So le: 9
```

Khi `i` la so chan, `continue` lam cho `System.out.println` **khong duoc thuc thi**, va vong lap nhay sang gia tri `i` tiep theo.

### 5.2 continue trong while

```java
public class ContinueWhileDemo {
    public static void main(String[] args) {
        int i = 0;

        while (i < 10) {
            i++;
            if (i % 3 == 0) {
                continue; // Bo qua boi cua 3
            }
            System.out.println("i = " + i);
        }
    }
}
```

**Ket qua:**
```
i = 1
i = 2
i = 4
i = 5
i = 7
i = 8
i = 10
```

**Luu y quan trong:** Trong `while`, bien dem phai duoc **cap nhat TRUOC `continue`**. Neu cap nhat sau continue, dong cap nhat se bi bo qua va gay **vong lap vo han**.

### 5.3 Hieu dung luong thuc thi cua continue

Trong vong `for`:
```
for (init; condition; update) {
    // code truoc continue
    continue; // -> nhay den phan 'update', roi kiem tra 'condition'
    // code sau continue KHONG duoc thuc thi
}
```

Trong vong `while`:
```
while (condition) {
    // code truoc continue
    continue; // -> nhay den kiem tra 'condition'
    // code sau continue KHONG duoc thuc thi
}
```

---

## 6. Labeled continue

Tuong tu labeled break, **labeled continue** cho phep ban **bo qua lan lap hien tai cua vong lap ngoai**:

```java
public class LabeledContinueDemo {
    public static void main(String[] args) {
        outer:
        for (int i = 1; i <= 3; i++) {
            for (int j = 1; j <= 3; j++) {
                if (j == 2) {
                    continue outer; // Bo qua phan con lai, nhay sang i tiep theo
                }
                System.out.println("i=" + i + ", j=" + j);
            }
        }
    }
}
```

**Ket qua:**
```
i=1, j=1
i=2, j=1
i=3, j=1
```

Moi khi `j == 2`, `continue outer` lam vong `for(j)` **dung lai** va nhay sang **lan lap tiep theo cua `for(i)`**. Vi vay `j` chi co gia tri 1 trong output.

---

## 7. So sanh break va continue

| Tieu chi | break | continue |
|---------|-------|----------|
| Tac dung | **Thoat hoan toan** vong lap | **Bo qua 1 lan lap**, tiep tuc vong tiep |
| Pham vi | Vong lap/switch gan nhat | Vong lap gan nhat |
| Sau khi thuc thi | Code sau vong lap chay | Vong lap tiep tuc |
| Ho tro label | Co (labeled break) | Co (labeled continue) |
| Dung trong switch | Co | Khong |
| Vi du | Tim thay ket qua, dung tim | Bo qua du lieu khong hop le |

---

## 8. Vi du thuc te

### 8.1 Tim so nguyen to dau tien lon hon n

```java
public class FindPrimeDemo {
    public static void main(String[] args) {
        int n = 20;

        for (int candidate = n + 1; ; candidate++) { // Vong lap vo han
            boolean isPrime = true;

            for (int i = 2; i <= Math.sqrt(candidate); i++) {
                if (candidate % i == 0) {
                    isPrime = false;
                    break; // Khong phai so nguyen to, khong can kiem tra tiep
                }
            }

            if (isPrime) {
                System.out.println("So nguyen to dau tien lon hon " + n + " la: " + candidate);
                break; // Tim thay, thoat vong ngoai
            }
        }
    }
}
```

**Ket qua:**
```
So nguyen to dau tien lon hon 20 la: 23
```

### 8.2 Loc du lieu hop le tu mang

```java
public class FilterDataDemo {
    public static void main(String[] args) {
        int[] scores = {85, -1, 92, 0, 78, -5, 95, 100, 110};

        System.out.println("Diem hop le (1-100):");
        for (int score : scores) {
            if (score < 1 || score > 100) {
                continue; // Bo qua diem khong hop le
            }
            System.out.println("  Diem: " + score);
        }
    }
}
```

**Ket qua:**
```
Diem hop le (1-100):
  Diem: 85
  Diem: 92
  Diem: 78
  Diem: 95
  Diem: 100
```

### 8.3 Tim phan tu chung cua hai mang

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
                    break; // Tim thay trong arr2, khong can duyet tiep arr2
                }
            }
        }
    }
}
```

**Ket qua:**
```
Phan tu chung:
  3
  5
  9
```

---

## 9. Khi nao dung?

### Khi nao dung break:
- **Tim kiem**: dung lai ngay khi tim thay ket qua
- **Kiem tra dieu kien**: thoat vong lap khi phat hien loi hoac dieu kien dac biet
- **Gioi han xu ly**: chi xu ly n phan tu dau tien
- **Vong lap vo han co dieu kien thoat**: server loop, game loop

### Khi nao dung continue:
- **Loc du lieu**: bo qua cac phan tu khong hop le
- **Dieu kien tien quyet**: chi xu ly phan tu thoa man dieu kien
- **Tranh if long nhau**: thay vi `if (valid) { ... code dai ... }`, dung `if (!valid) continue;`

### Khi nao dung labeled break/continue:
- **Tim kiem trong ma tran** (mang 2 chieu): thoat ca 2 vong khi tim thay
- **Nested loop phuc tap**: can dieu khien vong lap ngoai tu vong lap trong
- **Luu y**: Han che su dung, uu tien tach logic ra method rieng

### Best practices:
- **Uu tien logic ro rang** hon la dung break/continue. Neu co the viet lai dieu kien vong lap de tranh break, hay lam vay.
- **Khong lam dung**: Nhieu break/continue trong mot vong lap lam code kho theo doi
- **Comment giai thich** tai sao dung break/continue neu logic khong hien nhien
- **Tach method** thay vi dung labeled loop

---

## 10. Loi thuong gap

### Loi 1: Vong lap vo han do continue truoc cap nhat bien dem (while)

```java
// Sai: Vong lap vo han!
int i = 0;
while (i < 5) {
    if (i == 3) {
        continue; // Nhay len kiem tra dieu kien, i van = 3 mai!
    }
    System.out.println(i);
    i++; // Dong nay bi bo qua khi i == 3
}
```

```java
// Dung: Cap nhat bien dem TRUOC continue
int i = 0;
while (i < 5) {
    if (i == 3) {
        i++; // Cap nhat truoc khi continue
        continue;
    }
    System.out.println(i);
    i++;
}
```

### Loi 2: Nham break voi return

```java
// Sai: Dung break nhung muon thoat method
public static void process(int[] arr) {
    for (int x : arr) {
        if (x < 0) {
            break; // Chi thoat vong lap, method van tiep tuc chay
        }
        System.out.println(x);
    }
    System.out.println("Dong nay VAN chay sau break!");
}
```

```java
// Dung: Dung return neu muon thoat method
public static void process(int[] arr) {
    for (int x : arr) {
        if (x < 0) {
            return; // Thoat method luon
        }
        System.out.println(x);
    }
    System.out.println("Dong nay KHONG chay sau return");
}
```

### Loi 3: Dung break/continue ngoai vong lap

```java
// Sai: Loi bien dich!
if (x > 5) {
    break; // LOI: break chi dung trong vong lap hoac switch
}
```

```java
// Dung: break phai nam trong vong lap hoac switch
for (int i = 0; i < 10; i++) {
    if (i > 5) {
        break; // OK: nam trong for
    }
}
```

### Loi 4: Labeled break/continue voi nhan sai

```java
// Sai: Nhan khong ton tai
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        break myLabel; // LOI: 'myLabel' chua duoc dinh nghia
    }
}
```

```java
// Dung: Dinh nghia nhan dung cho
myLabel:
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        break myLabel; // OK
    }
}
```

### Loi 5: Lam dung break thay vi chinh sua dieu kien vong lap

```java
// Khong tot: Dung break thay vi dieu kien ro rang
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
// Tot hon: Dieu kien ro rang trong while
int i = 0;
while (i < 10) {
    System.out.println(i);
    i++;
}
```

---

## 11. Cau hoi phong van

### Cau 1: Su khac nhau giua `break` va `return` la gi?

**Tra loi:**
- `break` chi **thoat vong lap hoac switch** gan nhat. Code sau vong lap/switch trong cung method **van duoc thuc thi**.
- `return` **thoat khoi toan bo method** va tra ve gia tri (neu co). Code sau `return` trong method **khong duoc thuc thi**.

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

### Cau 2: Labeled break la gi? Cho vi du thuc te.

**Tra loi:** Labeled break cho phep thoat khoi **vong lap duoc gan nhan cu the**, khong chi vong lap gan nhat. Thuong dung khi can **thoat nhieu cap vong lap long nhau** cung luc. Vi du thuc te: tim kiem mot gia tri trong ma tran 2 chieu, khi tim thay thi thoat ca 2 vong for.

```java
found:
for (int row = 0; row < matrix.length; row++) {
    for (int col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col] == target) {
            break found; // Thoat ca 2 vong
        }
    }
}
```

### Cau 3: `continue` hoat dong khac nhau the nao trong `for` va `while`?

**Tra loi:** Trong vong `for`, khi gap `continue`, chuong trinh nhay den **phan update** (vi du `i++`), roi kiem tra condition. Vi vay bien dem **luon duoc cap nhat**. Trong vong `while`, khi gap `continue`, chuong trinh nhay **truc tiep len kiem tra condition**. Neu dong cap nhat bien dem nam **sau `continue`**, no se bi bo qua va co the gay **vong lap vo han**.

```java
// for: i++ LUON duoc thuc thi du co continue
for (int i = 0; i < 5; i++) {
    if (i == 3) continue; // i++ van chay -> i tang len 4
}

// while: can cap nhat TRUOC continue
int i = 0;
while (i < 5) {
    if (i == 3) {
        i++; // PHAI cap nhat truoc continue
        continue;
    }
    i++;
}
```

### Cau 4: Co nen dung `break` va `continue` nhieu trong code khong?

**Tra loi:** **Khong nen lam dung.** Mot vai `break` hoac `continue` la binh thuong va giup code hieu qua hon (vi du: dung tim khi da thay, bo qua du lieu khong hop le). Nhung **nhieu break/continue** trong mot vong lap lam luong chuong trinh kho theo doi va kho debug. Trong truong hop do, nen **tach logic ra method rieng**, dung `return` thay cho `break`, hoac **viet lai dieu kien vong lap** cho ro rang hon.

### Cau 5: `continue` co the dung trong `switch` khong?

**Tra loi:** **Khong truc tiep.** `continue` chi dung trong **vong lap** (for, while, do-while), khong dung trong switch don le. Tuy nhien, neu switch **nam ben trong** mot vong lap, ban co the dung `continue` trong switch de **bo qua lan lap hien tai** cua vong lap ngoai:

```java
for (int i = 0; i < 5; i++) {
    switch (i) {
        case 2:
            continue; // Bo qua lan lap i=2 cua vong for
        default:
            System.out.println(i);
    }
}
// Ket qua: 0, 1, 3, 4 (bo qua 2)
```
