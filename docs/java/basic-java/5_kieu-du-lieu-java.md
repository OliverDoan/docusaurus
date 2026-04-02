---
sidebar_position: 5
title: "Cac kieu du lieu trong Java"
---

# Cac kieu du lieu trong Java

Kieu du lieu (data type) quyet dinh **loai gia tri** ma mot bien co the luu tru va **bao nhieu bo nho** duoc cap phat. Trong Java, kieu du lieu duoc chia thanh hai nhom lon: **kieu nguyen thuy (primitive)** va **kieu tham chieu (reference)**.

**Vi du don gian:** Hay tuong tuong kieu du lieu giong nhu **loai hop chua do**:
- Hop nho (byte) -- chua so nho
- Hop vua (int) -- chua so thuong dung
- Hop lon (long) -- chua so cuc lon
- Hop chu (char) -- chua mot ky tu
- Hop dung/sai (boolean) -- chi co 2 trang thai

Chon dung loai hop giup **tiet kiem bo nho** va **tranh loi du lieu**.

---

## 1. Hai nhom kieu du lieu

```
Kieu du lieu Java
├── Primitive (Nguyen thuy) -- 8 kieu, luu gia tri truc tiep
│   ├── So nguyen: byte, short, int, long
│   ├── So thuc: float, double
│   ├── Ky tu: char
│   └── Logic: boolean
│
└── Reference (Tham chieu) -- luu dia chi vung nho
    ├── String
    ├── Array
    ├── Class
    └── Interface
```

---

## 2. Tam kieu nguyen thuy (Primitive Types)

### Bang tong hop

| Kieu | Kich thuoc | Gia tri nho nhat | Gia tri lon nhat | Gia tri mac dinh | Vi du |
|------|-----------|------------------|------------------|------------------|-------|
| **byte** | 8 bit (1 byte) | -128 | 127 | 0 | `byte b = 100;` |
| **short** | 16 bit (2 byte) | -32,768 | 32,767 | 0 | `short s = 30000;` |
| **int** | 32 bit (4 byte) | -2,147,483,648 | 2,147,483,647 | 0 | `int i = 100000;` |
| **long** | 64 bit (8 byte) | -9.2 x 10^18 | 9.2 x 10^18 | 0L | `long l = 999999999L;` |
| **float** | 32 bit (4 byte) | ~1.4 x 10^-45 | ~3.4 x 10^38 | 0.0f | `float f = 3.14f;` |
| **double** | 64 bit (8 byte) | ~4.9 x 10^-324 | ~1.7 x 10^308 | 0.0d | `double d = 3.14159;` |
| **boolean** | 1 bit (logic) | false | true | false | `boolean b = true;` |
| **char** | 16 bit (2 byte) | '\u0000' (0) | '\uffff' (65,535) | '\u0000' | `char c = 'A';` |

### Vi du chi tiet

```java
public class PrimitiveTypesDemo {
    public static void main(String[] args) {
        // === SO NGUYEN ===

        // byte: -128 den 127 (tiet kiem bo nho)
        byte tuoiEm = 5;
        byte nhietDo = -10;
        System.out.println("byte: " + tuoiEm + ", " + nhietDo);

        // short: -32,768 den 32,767
        short soHocSinh = 25000;
        System.out.println("short: " + soHocSinh);

        // int: kieu so nguyen mac dinh, thuong dung nhat
        int danSo = 100000000;
        int namSinh = 1995;
        System.out.println("int: " + danSo + ", " + namSinh);

        // long: so cuc lon, PHAI co hau to L
        long danSoTheGioi = 8000000000L;
        long nanoGiay = 1234567890123456789L;
        System.out.println("long: " + danSoTheGioi);

        // === SO THUC ===

        // float: do chinh xac 6-7 chu so, PHAI co hau to F
        float diemThi = 8.5f;
        float pi = 3.14f;
        System.out.println("float: " + diemThi + ", " + pi);

        // double: do chinh xac 15-16 chu so (mac dinh cho so thuc)
        double piChinhXac = 3.141592653589793;
        double khoangCachSaoHoa = 225000000.0;
        System.out.println("double: " + piChinhXac);

        // === KY TU ===

        // char: mot ky tu Unicode (16 bit)
        char kyTu = 'A';
        char kyTuUnicode = '\u0041'; // Cung la 'A'
        char kyTuSo = 65;           // Cung la 'A' (ma ASCII)
        System.out.println("char: " + kyTu + ", " + kyTuUnicode + ", " + kyTuSo);

        // === LOGIC ===

        // boolean: true hoac false
        boolean daHoc = true;
        boolean daTotNghiep = false;
        System.out.println("boolean: " + daHoc + ", " + daTotNghiep);
    }
}
```

**Ket qua:**

```
byte: 5, -10
short: 25000
int: 100000000, 1995
long: 8000000000
float: 8.5, 3.14
double: 3.141592653589793
char: A, A, A
boolean: true, false
```

---

## 3. Cac luu y quan trong

### 3.1. Hau to bat buoc

```java
public class HauToDemo {
    public static void main(String[] args) {
        // Mac dinh: so nguyen la int, so thuc la double
        // Nen khi dung long va float PHAI co hau to

        // long L = 999999999999; // LOI neu khong co L (vuot qua pham vi int)
        long soLon = 999999999999L;  // OK voi hau to L

        // float f = 3.14;  // LOI: 3.14 la double, khong tu gan cho float
        float f = 3.14f;    // OK voi hau to f hoac F

        double d = 3.14;    // OK: mac dinh la double

        System.out.println(soLon + ", " + f + ", " + d);
    }
}
```

### 3.2. Cac he so trong Java

```java
public class HeCoSoDemo {
    public static void main(String[] args) {
        int thapPhan = 100;       // He 10 (binh thuong)
        int batPhan = 0144;       // He 8 (bat dau bang 0) = 100
        int thapLucPhan = 0x64;   // He 16 (bat dau bang 0x) = 100
        int nhiPhan = 0b1100100;  // He 2 (bat dau bang 0b) = 100

        System.out.println("He 10: " + thapPhan);
        System.out.println("He 8:  " + batPhan);
        System.out.println("He 16: " + thapLucPhan);
        System.out.println("He 2:  " + nhiPhan);
        // Tat ca deu in ra 100
    }
}
```

### 3.3. Dau gach duoi cho de doc (Java 7+)

```java
public class UnderscoreDemo {
    public static void main(String[] args) {
        // Dung dau _ de ngan cach cho de doc
        int motTrieu = 1_000_000;
        long soLon = 9_999_999_999L;
        double pi = 3.14_15_92;
        int nhiPhan = 0b1010_0001_0100_0010;

        System.out.println(motTrieu);  // 1000000
        System.out.println(soLon);     // 9999999999

        // VI TRI KHONG HOP LE:
        // int a = _1000;    // LOI: bat dau bang _
        // int b = 1000_;    // LOI: ket thuc bang _
        // float c = 3._14f; // LOI: ngay canh dau cham
        // long d = 999_L;   // LOI: ngay truoc hau to L
    }
}
```

### 3.4. Overflow va Underflow

Khi gia tri vuot qua pham vi cua kieu du lieu, Java **khong bao loi** ma "quay vong":

```java
public class OverflowDemo {
    public static void main(String[] args) {
        // Overflow: vuot qua gia tri lon nhat
        int maxInt = Integer.MAX_VALUE; // 2,147,483,647
        System.out.println("Max int: " + maxInt);
        System.out.println("Max + 1: " + (maxInt + 1)); // -2,147,483,648 (quay vong!)

        // Underflow: vuot qua gia tri nho nhat
        int minInt = Integer.MIN_VALUE; // -2,147,483,648
        System.out.println("Min int: " + minInt);
        System.out.println("Min - 1: " + (minInt - 1)); // 2,147,483,647 (quay vong!)

        // byte overflow
        byte maxByte = 127;
        System.out.println("Max byte: " + maxByte);
        System.out.println("Max byte + 1: " + (byte)(maxByte + 1)); // -128
    }
}
```

---

## 4. Kieu tham chieu (Reference Types)

Kieu tham chieu luu **dia chi vung nho** (reference) cua doi tuong, khong luu truc tiep gia tri.

```java
public class ReferenceTypeDemo {
    public static void main(String[] args) {
        // String -- kieu tham chieu pho bien nhat
        String ten = "Thuan";
        String loi = null; // Co the la null (khong co gia tri)

        // Array -- mang
        int[] diemSo = {8, 9, 7, 10};
        String[] monHoc = {"Toan", "Ly", "Hoa"};

        // Object -- doi tuong tu class
        java.util.ArrayList<String> danhSach = new java.util.ArrayList<>();
        danhSach.add("Java");
        danhSach.add("Python");

        System.out.println("Ten: " + ten);
        System.out.println("Diem dau: " + diemSo[0]);
        System.out.println("Danh sach: " + danhSach);
    }
}
```

### So sanh Primitive vs Reference

| Tieu chi | Primitive | Reference |
|----------|-----------|-----------|
| **Luu tru** | Gia tri truc tiep | Dia chi (reference) |
| **Vung nho** | Stack | Heap (doi tuong), Stack (reference) |
| **Gia tri null** | Khong the null | Co the null |
| **So sanh** | `==` so sanh gia tri | `==` so sanh dia chi, `.equals()` so sanh noi dung |
| **Hieu nang** | Nhanh hon | Cham hon (tao object tren Heap) |

```java
public class SoSanhDemo {
    public static void main(String[] args) {
        // Primitive: == so sanh GIA TRI
        int a = 5;
        int b = 5;
        System.out.println(a == b); // true (cung gia tri)

        // Reference: == so sanh DIA CHI
        String s1 = new String("Hello");
        String s2 = new String("Hello");
        System.out.println(s1 == s2);      // false (khac dia chi!)
        System.out.println(s1.equals(s2)); // true (cung noi dung)
    }
}
```

---

## 5. Wrapper Classes

Moi kieu primitive co mot **lop boc (wrapper class)** tuong ung, cho phep su dung primitive nhu doi tuong.

| Primitive | Wrapper | Vi du |
|-----------|---------|-------|
| byte | Byte | `Byte b = 5;` |
| short | Short | `Short s = 100;` |
| int | **Integer** | `Integer i = 42;` |
| long | Long | `Long l = 999L;` |
| float | Float | `Float f = 3.14f;` |
| double | Double | `Double d = 2.718;` |
| boolean | Boolean | `Boolean b = true;` |
| char | **Character** | `Character c = 'A';` |

### Autoboxing va Unboxing

```java
import java.util.ArrayList;
import java.util.List;

public class WrapperDemo {
    public static void main(String[] args) {
        // Autoboxing: primitive --> Wrapper (tu dong)
        Integer soNguyen = 42;      // int --> Integer (tu dong)
        Double soThuc = 3.14;       // double --> Double (tu dong)

        // Unboxing: Wrapper --> primitive (tu dong)
        int giaTri = soNguyen;      // Integer --> int (tu dong)
        double giaTri2 = soThuc;    // Double --> double (tu dong)

        // Tai sao can Wrapper? Vi Collection khong nhan primitive
        List<Integer> danhSach = new ArrayList<>(); // Khong the dung List<int>
        danhSach.add(1);   // Autoboxing: 1 (int) --> Integer.valueOf(1)
        danhSach.add(2);
        danhSach.add(3);

        int phanTu = danhSach.get(0); // Unboxing: Integer --> int

        System.out.println("Danh sach: " + danhSach);      // [1, 2, 3]
        System.out.println("Phan tu dau: " + phanTu);      // 1

        // Wrapper co the la null (primitive khong the)
        Integer coTheNull = null;
        // int loi = coTheNull; // LOI RUNTIME: NullPointerException!

        // Phuong thuc huu ich cua Wrapper
        int parsed = Integer.parseInt("123");        // String --> int
        String chuoi = Integer.toString(456);        // int --> String
        int maxInt = Integer.MAX_VALUE;               // Gia tri lon nhat
        System.out.println("Parsed: " + parsed);
        System.out.println("Max int: " + maxInt);
    }
}
```

### So sanh int vs Integer

```java
public class IntVsInteger {
    public static void main(String[] args) {
        // == voi primitive: so sanh GIA TRI
        int a = 128;
        int b = 128;
        System.out.println(a == b); // true

        // == voi Integer: so sanh DIA CHI (nguy hiem!)
        Integer x = 128;
        Integer y = 128;
        System.out.println(x == y);      // false! (khac doi tuong)
        System.out.println(x.equals(y)); // true (cung gia tri)

        // LUU Y: Integer cache tu -128 den 127
        Integer m = 127;
        Integer n = 127;
        System.out.println(m == n); // true! (dung chung cache)

        Integer p = 128;
        Integer q = 128;
        System.out.println(p == q); // false! (ngoai cache, tao doi tuong moi)

        // LUON dung .equals() khi so sanh Wrapper
    }
}
```

---

## Khi nao dung?

| Tinh huong | Kieu nen dung | Ly do |
|------------|--------------|-------|
| Tinh toan thuong ngay, vong lap | `int`, `double` (primitive) | Nhanh, tiet kiem bo nho |
| Luu trong Collection (List, Map, Set) | Wrapper (Integer, Double...) | Collection khong nhan primitive |
| Can gia tri null (vi du: chua nhap du lieu) | Wrapper | Primitive khong the null |
| Du lieu tai chinh, can chinh xac cao | `BigDecimal` | float/double co sai so lam tron |
| So nguyen nho (-128 den 127) | `byte` | Tiet kiem bo nho khi luu nhieu |
| Ky tu don le | `char` | Chuoi dung String |

---

## Loi thuong gap

### Loi 1: Quen hau to L/F

```java
❌ Sai:
long soLon = 9999999999;   // LOI: integer number too large
float pi = 3.14;            // LOI: possible lossy conversion from double to float

✅ Dung:
long soLon = 9999999999L;   // Them L cho long
float pi = 3.14f;           // Them f cho float
```

### Loi 2: Dung == so sanh Wrapper

```java
❌ Sai:
Integer a = 200;
Integer b = 200;
if (a == b) {  // false! So sanh dia chi, khong phai gia tri
    System.out.println("Bang nhau");
}

✅ Dung:
Integer a = 200;
Integer b = 200;
if (a.equals(b)) {  // true! So sanh gia tri
    System.out.println("Bang nhau");
}
```

### Loi 3: Khong xu ly NullPointerException khi unboxing

```java
❌ Sai:
Integer wrapper = null;
int primitive = wrapper; // RUNTIME ERROR: NullPointerException

✅ Dung:
Integer wrapper = null;
int primitive = (wrapper != null) ? wrapper : 0; // Kiem tra null truoc
```

### Loi 4: Dung float cho tien te

```java
❌ Sai:
float giaTien = 19.99f;
float tongTien = giaTien * 3;
System.out.println(tongTien); // 59.970001 (sai so!)

✅ Dung:
import java.math.BigDecimal;
BigDecimal giaTien = new BigDecimal("19.99");
BigDecimal tongTien = giaTien.multiply(new BigDecimal("3"));
System.out.println(tongTien); // 59.97 (chinh xac)
```

---

## Cau hoi phong van

### Cau 1: Kich thuoc cua tung kieu primitive la bao nhieu? Gia tri mac dinh la gi?

**Tra loi:**
- `byte`: 1 byte, mac dinh 0
- `short`: 2 byte, mac dinh 0
- `int`: 4 byte, mac dinh 0
- `long`: 8 byte, mac dinh 0L
- `float`: 4 byte, mac dinh 0.0f
- `double`: 8 byte, mac dinh 0.0d
- `boolean`: khong xac dinh chinh xac (JVM dependent), mac dinh false
- `char`: 2 byte, mac dinh '\u0000'

Luu y: Gia tri mac dinh chi ap dung cho **bien instance va static**. Bien local khong co gia tri mac dinh.

### Cau 2: Tai sao String khong phai kieu primitive?

**Tra loi:** String la mot **class** (kieu reference) vi:
- String co the chua nhieu ky tu (kich thuoc khong co dinh)
- String co cac phuong thuc nhu `length()`, `substring()`, `equals()`...
- String la doi tuong bất bien (immutable) duoc luu tren Heap
- String co the la `null`, trong khi primitive khong the
- Java chi co 8 kieu primitive duoc dinh nghia san trong ngon ngu. Moi thu khac la object.

### Cau 3: Su khac biet giua float va double?

**Tra loi:**
- `float`: 32 bit, do chinh xac khoang **6-7 chu so thap phan**, can hau to `f`/`F`
- `double`: 64 bit, do chinh xac khoang **15-16 chu so thap phan**, la kieu mac dinh cho so thuc
- Dung `double` khi can do chinh xac cao hon. Dung `float` khi tiet kiem bo nho (vi du: do hoa, game)
- Ca hai deu **khong chinh xac tuyet doi** do bieu dien IEEE 754 -- khong nen dung cho tinh toan tai chinh (dung `BigDecimal` thay the).

### Cau 4: Overflow trong Java xu ly nhu the nao?

**Tra loi:** Java **khong nem exception** khi overflow so nguyen. Gia tri se **quay vong (wrap around)**. Vi du: `Integer.MAX_VALUE + 1` cho ra `Integer.MIN_VALUE`. De phat hien overflow, co the dung:
- `Math.addExact()`, `Math.multiplyExact()` (tu Java 8) -- nem `ArithmeticException` khi overflow
- Kieu `long` hoac `BigInteger` cho so lon

```java
try {
    int result = Math.addExact(Integer.MAX_VALUE, 1);
} catch (ArithmeticException e) {
    System.out.println("Overflow detected!");
}
```

### Cau 5: Integer cache la gi? Tai sao `Integer.valueOf(127) == Integer.valueOf(127)` la true?

**Tra loi:** Java cache (luu tam) cac doi tuong `Integer` co gia tri tu **-128 den 127**. Khi dung autoboxing hoac `Integer.valueOf()`, neu gia tri nam trong khoang nay, Java tra ve doi tuong da cache san thay vi tao moi. Vi vay `==` tra ve `true` vi cung tham chieu den mot doi tuong. Voi gia tri ngoai khoang nay (nhu 128), Java tao doi tuong moi moi lan, nen `==` tra ve `false`.
