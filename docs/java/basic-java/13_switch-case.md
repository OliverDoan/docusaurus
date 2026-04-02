---
sidebar_position: 13
title: "Menh de Switch-case"
---
# Menh de Switch-case

## 1. Gioi thieu

Trong Java, **menh de switch-case** la mot cau truc dieu khien luong chuong trinh, cho phep ban **so sanh gia tri cua mot bieu thuc voi nhieu truong hop (case) cu the** va thuc thi khoi lenh tuong ung.

**Tai sao can switch-case?** Khi ban co nhieu lua chon re nhanh ro rang (vi du: menu chon chuc nang, xu ly ngay trong tuan, phan loai vai tro nguoi dung...), viec dung chuoi `if - else if` dai se lam code kho doc va kho bao tri. `switch-case` giup code **gon gang, de doc va de bao tri hon**.

Hay hinh dung `switch-case` nhu mot **bang dieu khien thang may**:
- Ban nhan so tang (gia tri)
- Thang may di den dung tang do (case tuong ung)
- Neu so tang khong ton tai, thang may dung o tang mac dinh (default)

---

## Noi dung

1. [Gioi thieu](#1-gioi-thieu)
2. [Cu phap co ban](#2-cu-phap-co-ban)
3. [Tu khoa break va hien tuong fall-through](#3-tu-khoa-break-va-hien-tuong-fall-through)
4. [Default case](#4-default-case)
5. [Case gop (Multiple case)](#5-case-gop-multiple-case)
6. [Kieu du lieu ho tro trong switch](#6-kieu-du-lieu-ho-tro-trong-switch)
7. [Switch voi String (Java 7+)](#7-switch-voi-string-java-7)
8. [Switch voi enum](#8-switch-voi-enum)
9. [Switch Expression (Java 12+ arrow syntax)](#9-switch-expression-java-12-arrow-syntax)
10. [Tu khoa yield (Java 13+)](#10-tu-khoa-yield-java-13)
11. [So sanh switch vs if-else](#11-so-sanh-switch-vs-if-else)
12. [Khi nao dung?](#12-khi-nao-dung)
13. [Loi thuong gap](#13-loi-thuong-gap)
14. [Cau hoi phong van](#14-cau-hoi-phong-van)

---

## 2. Cu phap co ban

```java
switch (expression) {
    case value1:
        // code khi expression == value1
        break;
    case value2:
        // code khi expression == value2
        break;
    // ... them cac case khac
    default:
        // code khi khong khop case nao
}
```

Trong do:
- **`expression`**: bieu thuc can so sanh (phai tra ve kieu du lieu duoc ho tro)
- **`case value`**: gia tri cu the de so sanh
- **`break`**: ket thuc nhanh hien tai, thoat khoi switch
- **`default`**: nhanh mac dinh khi khong co case nao khop

**Vi du co ban:**

```java
public class SwitchDemo {
    public static void main(String[] args) {
        int day = 3;

        switch (day) {
            case 1:
                System.out.println("Thu Hai");
                break;
            case 2:
                System.out.println("Thu Ba");
                break;
            case 3:
                System.out.println("Thu Tu");
                break;
            case 4:
                System.out.println("Thu Nam");
                break;
            case 5:
                System.out.println("Thu Sau");
                break;
            case 6:
                System.out.println("Thu Bay");
                break;
            case 7:
                System.out.println("Chu Nhat");
                break;
            default:
                System.out.println("Ngay khong hop le");
        }
    }
}
```

**Ket qua:**
```
Thu Tu
```

---

## 3. Tu khoa break va hien tuong fall-through

### 3.1 Fall-through la gi?

Neu ban **quen dat `break`** sau mot case, chuong trinh se **tiep tuc chay xuyen qua cac case ben duoi** cho den khi gap `break` hoac het switch. Day goi la **fall-through**.

```java
public class FallThroughDemo {
    public static void main(String[] args) {
        int x = 1;

        switch (x) {
            case 1:
                System.out.println("One");
                // Khong co break! -> Fall-through
            case 2:
                System.out.println("Two");
                // Khong co break! -> Fall-through
            case 3:
                System.out.println("Three");
                break;
            default:
                System.out.println("Default");
        }
    }
}
```

**Ket qua:**
```
One
Two
Three
```

Mac du `x == 1`, chuong trinh van chay tiep case 2 va case 3 vi thieu `break`.

### 3.2 Khi nao fall-through co ich?

Fall-through **co the duoc su dung co y** khi nhieu case co cung xu ly:

```java
public class FallThroughUseful {
    public static void main(String[] args) {
        int month = 2;

        switch (month) {
            case 12:
            case 1:
            case 2:
                System.out.println("Mua Dong");
                break;
            case 3:
            case 4:
            case 5:
                System.out.println("Mua Xuan");
                break;
            default:
                System.out.println("Mua khac");
        }
    }
}
```

**Ket qua:**
```
Mua Dong
```

---

## 4. Default case

`default` la nhanh **mac dinh**, chay khi khong co case nao khop voi gia tri cua expression.

```java
public class DefaultDemo {
    public static void main(String[] args) {
        int color = 99;

        switch (color) {
            case 1:
                System.out.println("Do");
                break;
            case 2:
                System.out.println("Xanh");
                break;
            default:
                System.out.println("Mau khong xac dinh");
        }
    }
}
```

**Ket qua:**
```
Mau khong xac dinh
```

**Luu y:**
- `default` khong bat buoc phai o cuoi, nhung dat o cuoi la **quy uoc chuan** giup code de doc
- `default` khong can `break` neu dat o cuoi cung

---

## 5. Case gop (Multiple case)

Khi nhieu case co cung xu ly, ban co the gop chung:

```java
public class MultipleCaseDemo {
    public static void main(String[] args) {
        char grade = 'B';

        switch (grade) {
            case 'A':
            case 'B':
                System.out.println("Gioi");
                break;
            case 'C':
                System.out.println("Kha");
                break;
            case 'D':
                System.out.println("Trung binh");
                break;
            case 'F':
                System.out.println("Yeu");
                break;
            default:
                System.out.println("Diem khong hop le");
        }
    }
}
```

**Ket qua:**
```
Gioi
```

---

## 6. Kieu du lieu ho tro trong switch

Java ho tro cac kieu du lieu sau trong `switch`:

| Kieu du lieu | Ho tro | Ghi chu |
|-------------|--------|---------|
| `byte` | Co | Kieu nguyen thuy |
| `short` | Co | Kieu nguyen thuy |
| `int` | Co | Kieu nguyen thuy |
| `char` | Co | Kieu nguyen thuy |
| `String` | Co | Tu Java 7 |
| `enum` | Co | Tu Java 5 |
| `Byte`, `Short`, `Integer`, `Character` | Co | Wrapper class (auto-unboxing) |
| `long` | **Khong** | Kieu qua lon |
| `float`, `double` | **Khong** | Kieu thuc khong chinh xac |
| `boolean` | **Khong** | Chi co 2 gia tri, dung if-else |

---

## 7. Switch voi String (Java 7+)

Tu Java 7, ban co the dung `String` trong switch:

```java
public class SwitchStringDemo {
    public static void main(String[] args) {
        String role = "admin";

        switch (role) {
            case "admin":
                System.out.println("Quan tri vien - Quyen cao nhat");
                break;
            case "editor":
                System.out.println("Bien tap vien - Quyen chinh sua");
                break;
            case "viewer":
                System.out.println("Nguoi xem - Chi xem");
                break;
            default:
                System.out.println("Vai tro khong xac dinh");
        }
    }
}
```

**Ket qua:**
```
Quan tri vien - Quyen cao nhat
```

**Luu y:** Java su dung `equals()` de so sanh String trong switch, nen **phan biet chu hoa/chu thuong** va **can xu ly null truoc khi truyen vao switch** (tranh `NullPointerException`).

---

## 8. Switch voi enum

```java
public class SwitchEnumDemo {
    enum Season { SPRING, SUMMER, AUTUMN, WINTER }

    public static void main(String[] args) {
        Season season = Season.SUMMER;

        switch (season) {
            case SPRING:
                System.out.println("Mua Xuan - Hoa no");
                break;
            case SUMMER:
                System.out.println("Mua Ha - Nang nong");
                break;
            case AUTUMN:
                System.out.println("Mua Thu - La rung");
                break;
            case WINTER:
                System.out.println("Mua Dong - Lanh gia");
                break;
        }
    }
}
```

**Ket qua:**
```
Mua Ha - Nang nong
```

**Luu y:** Trong switch voi enum, **khong can ghi ten enum truoc gia tri** (viet `case SUMMER` thay vi `case Season.SUMMER`).

---

## 9. Switch Expression (Java 12+ arrow syntax)

Tu Java 12 (preview) va chinh thuc tu **Java 14**, Java ho tro **switch expression** voi cu phap mui ten (`->`):

```java
public class SwitchExpressionDemo {
    public static void main(String[] args) {
        int day = 5;

        String dayType = switch (day) {
            case 1, 2, 3, 4, 5 -> "Ngay lam viec";
            case 6, 7 -> "Ngay nghi";
            default -> "Ngay khong hop le";
        };

        System.out.println(dayType);
    }
}
```

**Ket qua:**
```
Ngay lam viec
```

**Uu diem cua switch expression:**
- **Khong can `break`** - moi nhanh tu dong ket thuc
- **Khong bi fall-through**
- Co the **gan ket qua vao bien** (switch tra ve gia tri)
- **Gop nhieu case** bang dau phay: `case 1, 2, 3 ->`
- Code **ngan gon va an toan hon**

### Switch expression voi khoi lenh:

```java
public class SwitchExpressionBlockDemo {
    public static void main(String[] args) {
        int score = 85;

        String result = switch (score / 10) {
            case 10, 9 -> {
                System.out.println("Tuyet voi!");
                yield "Xuat sac";
            }
            case 8 -> {
                System.out.println("Rat tot!");
                yield "Gioi";
            }
            case 7 -> "Kha";
            case 6 -> "Trung binh";
            default -> "Yeu";
        };

        System.out.println("Xep loai: " + result);
    }
}
```

**Ket qua:**
```
Rat tot!
Xep loai: Gioi
```

---

## 10. Tu khoa yield (Java 13+)

Tu khoa `yield` duoc dung trong switch expression khi ban can **thuc thi nhieu dong code** trong mot case va **tra ve gia tri**:

```java
public class YieldDemo {
    public static void main(String[] args) {
        int month = 8;

        int daysInMonth = switch (month) {
            case 1, 3, 5, 7, 8, 10, 12 -> 31;
            case 4, 6, 9, 11 -> 30;
            case 2 -> {
                // Gia su nam khong nhuan
                System.out.println("Thang 2 (nam khong nhuan)");
                yield 28;
            }
            default -> {
                throw new IllegalArgumentException("Thang khong hop le: " + month);
            }
        };

        System.out.println("So ngay: " + daysInMonth);
    }
}
```

**Ket qua:**
```
So ngay: 31
```

**Luu y:**
- `yield` chi dung trong **switch expression** (khong dung trong switch statement truyen thong)
- `yield` tuong tu `return` nhung danh cho switch expression

---

## 11. So sanh switch vs if-else

| Tieu chi | switch-case | if-else |
|---------|-------------|---------|
| Khi nao dung | So sanh **mot bien** voi **nhieu gia tri cu the** | Dieu kien **phuc tap**, khoang gia tri |
| Kieu du lieu | byte, short, int, char, String, enum | Bat ky bieu thuc boolean |
| Do doc | **Gon gang** khi nhieu nhanh | Co the dai va kho doc |
| Hieu nang | Co the duoc toi uu (jump table) | Kiem tra tuan tu |
| Dieu kien phuc tap | Khong ho tro (vd: `x > 10`) | Ho tro day du |
| Khoang gia tri | Khong ho tro (vd: `1-100`) | Ho tro (`x >= 1 && x <= 100`) |

**Quy tac chon:**
- Dung **switch** khi: so sanh mot bien voi **cac gia tri roi rac, cu the** (1, 2, 3, "admin", "user",...)
- Dung **if-else** khi: dieu kien **phuc tap**, **khoang gia tri**, hoac **nhieu bien khac nhau**

---

## 12. Khi nao dung?

### Nen dung switch-case khi:
- So sanh **mot bien duy nhat** voi **nhieu gia tri cu the**
- Xu ly **menu lua chon** (chon chuc nang 1, 2, 3,...)
- Phan loai **trang thai** (status code, role, enum state...)
- **Thay the chuoi if-else if dai** khi dieu kien la gia tri roi rac

### Best practices:
- **Luon dat `break`** sau moi case (tru khi co chu dich fall-through)
- **Luon co `default`** de xu ly truong hop ngoai du kien
- **Uu tien switch expression** (Java 14+) de tranh loi fall-through
- **Xu ly null truoc** khi truyen String vao switch
- **Comment ro rang** neu co chu dich su dung fall-through

---

## 13. Loi thuong gap

### Loi 1: Quen `break` gay fall-through ngoai y muon

```java
// Sai: Thieu break
int x = 1;
switch (x) {
    case 1:
        System.out.println("Mot");
    case 2:
        System.out.println("Hai"); // Chay ca dong nay!
}
```

```java
// Dung: Co break
int x = 1;
switch (x) {
    case 1:
        System.out.println("Mot");
        break;
    case 2:
        System.out.println("Hai");
        break;
}
```

### Loi 2: Truyen null vao switch voi String

```java
// Sai: NullPointerException
String name = null;
switch (name) { // Loi NullPointerException o day!
    case "Java":
        break;
}
```

```java
// Dung: Kiem tra null truoc
String name = null;
if (name != null) {
    switch (name) {
        case "Java":
            System.out.println("Ngon ngu Java");
            break;
        default:
            System.out.println("Ngon ngu khac");
    }
} else {
    System.out.println("Ten khong duoc de trong");
}
```

### Loi 3: Dung kieu du lieu khong ho tro

```java
// Sai: long khong duoc ho tro
long value = 100L;
switch (value) { // Loi bien dich!
    case 100L:
        break;
}
```

```java
// Dung: Ep kieu ve int neu gia tri nam trong pham vi
long value = 100L;
switch ((int) value) {
    case 100:
        System.out.println("Gia tri 100");
        break;
}
```

### Loi 4: Case trung gia tri

```java
// Sai: Hai case cung gia tri -> Loi bien dich
switch (x) {
    case 1:
        System.out.println("A");
        break;
    case 1: // Loi: duplicate case label
        System.out.println("B");
        break;
}
```

### Loi 5: Dung bien (khong phai hang so) trong case

```java
// Sai: Case phai la hang so (compile-time constant)
int a = 1;
switch (x) {
    case a: // Loi bien dich! 'a' khong phai hang so
        break;
}
```

```java
// Dung: Dung hang so (final) hoac literal
final int A = 1;
switch (x) {
    case A: // OK vi A la compile-time constant
        break;
    case 2: // OK vi 2 la literal
        break;
}
```

---

## 14. Cau hoi phong van

### Cau 1: Switch co ho tro kieu `long` khong? Tai sao?

**Tra loi:** Khong. Java **khong ho tro `long`** trong switch. Ly do la switch duoc thiet ke de lam viec voi **jump table** (bang nhay) hoac **lookup table** de toi uu hieu nang. Cac bang nay su dung chi muc kieu `int`, nen cac kieu lon hon nhu `long` khong duoc ho tro. Cac kieu `byte`, `short`, `char` duoc ho tro vi chung co the **tu dong mo rong (widening)** len `int`.

### Cau 2: Fall-through la gi? Cho vi du.

**Tra loi:** Fall-through la hien tuong khi **thieu `break`** trong mot case, chuong trinh se **tiep tuc chay xuyen xuong cac case ben duoi** ma khong kiem tra dieu kien. Vi du:
```java
int x = 1;
switch (x) {
    case 1: System.out.println("A");
    case 2: System.out.println("B");
    case 3: System.out.println("C"); break;
}
// Ket qua: A, B, C (du x chi bang 1)
```
Fall-through co the duoc **su dung co y** khi nhieu case co cung xu ly (case gop), nhung thuong la **loi** neu quen break.

### Cau 3: Switch expression trong Java 14 khac gi switch statement truyen thong?

**Tra loi:**

| Tieu chi | Switch statement | Switch expression (Java 14+) |
|---------|-----------------|------------------------------|
| Tra ve gia tri | Khong | Co (gan vao bien) |
| Cu phap | `case X:` voi `break` | `case X ->` (arrow) |
| Fall-through | Co the xay ra | **Khong co** |
| `yield` | Khong dung | Dung de tra ve gia tri tu block |
| An toan | De bi loi fall-through | An toan hon |
| Exhaustiveness | Khong bat buoc | Bat buoc xu ly het cac case (compiler kiem tra) |

### Cau 4: Tai sao switch khong ho tro `float` va `double`?

**Tra loi:** Vi `float` va `double` la kieu du lieu **so thuc dau phay dong**, co van de ve **do chinh xac**. Hai gia tri co ve bang nhau (`0.1 + 0.2` va `0.3`) co the khong thuc su bang nhau trong bo nho. Viec so sanh chinh xac (`==`) voi so thuc la **khong dang tin cay**, nen Java khong cho phep dung chung trong switch.

### Cau 5: Co the dung switch voi null khong?

**Tra loi:** Trong **switch truyen thong (truoc Java 21)**, truyen `null` vao switch se gay **`NullPointerException`** ngay tai dong `switch(expression)`. Ban phai kiem tra null truoc khi vao switch. Tu **Java 21 (preview)**, Java ho tro **pattern matching for switch** cho phep xu ly null truc tiep:
```java
// Java 21+ (preview)
switch (str) {
    case null -> System.out.println("Null!");
    case "hello" -> System.out.println("Hello!");
    default -> System.out.println("Other");
}
```
