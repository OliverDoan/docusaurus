---
sidebar_position: 21
title: "Chuyển đổi kiểu dữ liệu"
---

# Chuyen doi kieu du lieu trong Java

**Chuyen doi kieu du lieu (Type Conversion)** la thao tac bien doi gia tri tu kieu nay sang kieu khac, vi du: chuyen mot chuoi `"123"` thanh so nguyen `123`, hoac chuyen so `3.14` thanh chuoi `"3.14"`. Day la thao tac **cuc ky pho bien** trong moi chuong trinh Java.

Hay tuong tuong ban co mot hop dung **so** (kieu `int`) va mot hop dung **chu** (kieu `String`). Khi ban doc du lieu tu nguoi dung (luon la chuoi), ban can "chuyen so tu hop chu sang hop so" de tinh toan. Khi ban muon hien thi ket qua, ban lai "chuyen so tu hop so sang hop chu" de in ra man hinh. Do chinh la chuyen doi kieu du lieu.

---

## 1. String sang int

Co 2 cach chinh: `Integer.parseInt()` va `Integer.valueOf()`.

```java
public class StringToInt {
    public static void main(String[] args) {
        String numberStr = "123";

        // Cach 1: Integer.parseInt() - tra ve kieu int (primitive)
        int num1 = Integer.parseInt(numberStr);
        System.out.println("parseInt: " + num1);       // 123
        System.out.println("Kieu: " + ((Object) num1).getClass().getSimpleName());
        // Integer (autoboxed)

        // Cach 2: Integer.valueOf() - tra ve kieu Integer (wrapper object)
        Integer num2 = Integer.valueOf(numberStr);
        System.out.println("valueOf: " + num2);         // 123

        // Chuyen chuoi so am
        int negative = Integer.parseInt("-456");
        System.out.println("So am: " + negative);       // -456

        // Chuyen chuoi so co he co so (radix)
        int binary = Integer.parseInt("1010", 2);       // He 2
        System.out.println("Binary 1010 = " + binary);  // 10

        int hex = Integer.parseInt("FF", 16);           // He 16
        System.out.println("Hex FF = " + hex);           // 255
    }
}
```

**`parseInt()` vs `valueOf()`:**

| Method | Kieu tra ve | Cache |
|---|---|---|
| `Integer.parseInt("123")` | `int` (primitive) | Khong |
| `Integer.valueOf("123")` | `Integer` (object) | Co (cache -128 den 127) |

---

## 2. int sang String

```java
public class IntToString {
    public static void main(String[] args) {
        int number = 42;

        // Cach 1: String.valueOf() (KHUYEN NGHI)
        String s1 = String.valueOf(number);
        System.out.println("valueOf: " + s1);     // "42"

        // Cach 2: Integer.toString()
        String s2 = Integer.toString(number);
        System.out.println("toString: " + s2);     // "42"

        // Cach 3: Noi chuoi voi "" (don gian nhung KHONG khuyen nghi cho performance)
        String s3 = number + "";
        System.out.println("noi chuoi: " + s3);    // "42"

        // Cach 4: String.format()
        String s4 = String.format("%d", number);
        System.out.println("format: " + s4);        // "42"

        // Dinh dang so voi padding
        String padded = String.format("%05d", number);
        System.out.println("Padded: " + padded);    // "00042"
    }
}
```

---

## 3. String sang double / double sang String

```java
public class StringDoubleConversion {
    public static void main(String[] args) {
        // String -> double
        String piStr = "3.14159";
        double pi = Double.parseDouble(piStr);
        System.out.println("Pi: " + pi);           // 3.14159

        Double piObj = Double.valueOf(piStr);
        System.out.println("Pi object: " + piObj);  // 3.14159

        // double -> String
        double price = 99.95;
        String priceStr = String.valueOf(price);
        System.out.println("Gia: " + priceStr);     // "99.95"

        // Dinh dang so thap phan
        String formatted = String.format("%.2f", price);
        System.out.println("Dinh dang: " + formatted); // "99.95"

        double bigNumber = 1234567.891;
        String formatted2 = String.format("%,.2f", bigNumber);
        System.out.println("Co dau phay: " + formatted2); // "1,234,567.89"
    }
}
```

---

## 4. String sang long / long sang String

```java
public class StringLongConversion {
    public static void main(String[] args) {
        // String -> long
        String bigStr = "9999999999";
        long bigNum = Long.parseLong(bigStr);
        System.out.println("Long: " + bigNum);        // 9999999999

        Long bigObj = Long.valueOf(bigStr);
        System.out.println("Long obj: " + bigObj);     // 9999999999

        // long -> String
        long timestamp = System.currentTimeMillis();
        String tsStr = String.valueOf(timestamp);
        System.out.println("Timestamp: " + tsStr);

        String tsStr2 = Long.toString(timestamp);
        System.out.println("Timestamp2: " + tsStr2);
    }
}
```

---

## 5. String sang char array va nguoc lai

```java
public class StringCharConversion {
    public static void main(String[] args) {
        // String -> char[]
        String text = "Hello Java";
        char[] chars = text.toCharArray();

        System.out.println("Do dai: " + chars.length);  // 10
        System.out.println("Ky tu dau: " + chars[0]);    // 'H'
        System.out.println("Ky tu cuoi: " + chars[chars.length - 1]); // 'a'

        // Duyet tung ky tu
        for (char c : chars) {
            System.out.print(c + " ");
        }
        System.out.println(); // H e l l o   J a v a

        // char[] -> String
        char[] greeting = {'X', 'i', 'n', ' ', 'c', 'h', 'a', 'o'};
        String result = new String(greeting);
        System.out.println("Chuoi: " + result);          // "Xin chao"

        // String -> lay 1 ky tu tai vi tri
        char firstChar = text.charAt(0);
        System.out.println("Ky tu 0: " + firstChar);     // 'H'

        // char -> String
        char letter = 'A';
        String letterStr = String.valueOf(letter);
        System.out.println("Char to String: " + letterStr); // "A"

        // hoac
        String letterStr2 = Character.toString(letter);
        System.out.println("Char to String 2: " + letterStr2); // "A"
    }
}
```

---

## 6. Cac chuyen doi khac thuong dung

```java
public class OtherConversions {
    public static void main(String[] args) {
        // String -> boolean
        boolean b1 = Boolean.parseBoolean("true");   // true
        boolean b2 = Boolean.parseBoolean("TRUE");   // true
        boolean b3 = Boolean.parseBoolean("yes");    // false (chi "true" moi tra ve true)
        System.out.println(b1 + ", " + b2 + ", " + b3);

        // boolean -> String
        String boolStr = String.valueOf(true);       // "true"

        // int -> double (mo rong - tu dong)
        int intVal = 42;
        double doubleVal = intVal;                    // Tu dong chuyen, khong mat du lieu
        System.out.println("int -> double: " + doubleVal); // 42.0

        // double -> int (thu hep - can nen kieu)
        double pi = 3.99;
        int intPi = (int) pi;                         // Cat phan thap phan, KHONG lam tron
        System.out.println("double -> int: " + intPi); // 3

        // Lam tron dung cach
        int rounded = (int) Math.round(pi);
        System.out.println("Lam tron: " + rounded);   // 4

        // String -> byte array (UTF-8)
        String text = "Xin chao";
        byte[] bytes = text.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        System.out.println("Byte array length: " + bytes.length);

        // byte array -> String
        String fromBytes = new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
        System.out.println("Tu bytes: " + fromBytes);  // "Xin chao"
    }
}
```

---

## 7. Bang tong hop cac phuong thuc chuyen doi

| Tu | Sang | Phuong thuc |
|---|---|---|
| `String` | `int` | `Integer.parseInt(s)` hoac `Integer.valueOf(s)` |
| `String` | `long` | `Long.parseLong(s)` hoac `Long.valueOf(s)` |
| `String` | `double` | `Double.parseDouble(s)` hoac `Double.valueOf(s)` |
| `String` | `float` | `Float.parseFloat(s)` hoac `Float.valueOf(s)` |
| `String` | `boolean` | `Boolean.parseBoolean(s)` |
| `String` | `char[]` | `s.toCharArray()` |
| `String` | `byte[]` | `s.getBytes(StandardCharsets.UTF_8)` |
| `int` | `String` | `String.valueOf(n)` hoac `Integer.toString(n)` |
| `long` | `String` | `String.valueOf(n)` hoac `Long.toString(n)` |
| `double` | `String` | `String.valueOf(d)` hoac `Double.toString(d)` |
| `boolean` | `String` | `String.valueOf(b)` |
| `char[]` | `String` | `new String(chars)` |
| `char` | `String` | `String.valueOf(c)` hoac `Character.toString(c)` |
| `byte[]` | `String` | `new String(bytes, StandardCharsets.UTF_8)` |
| `int` | `double` | Tu dong (widening): `double d = intVal;` |
| `double` | `int` | Ep kieu (narrowing): `int i = (int) doubleVal;` |

---

## 8. Xu ly NumberFormatException

Day la loi xay ra khi ban co gang chuyen mot chuoi **khong hop le** sang so.

```java
public class NumberFormatExceptionDemo {
    public static void main(String[] args) {
        // Cac truong hop gay NumberFormatException
        String[] invalidInputs = {"abc", "12.5", "123L", "", " ", null};

        for (String input : invalidInputs) {
            try {
                int result = Integer.parseInt(input);
                System.out.println("OK: \"" + input + "\" = " + result);
            } catch (NumberFormatException e) {
                System.out.println("LOI: \"" + input + "\" - " + e.getMessage());
            } catch (NullPointerException e) {
                System.out.println("LOI: null - NullPointerException");
            }
        }
        // LOI: "abc" - For input string: "abc"
        // LOI: "12.5" - For input string: "12.5"
        // LOI: "123L" - For input string: "123L"
        // LOI: "" - For input string: ""
        // LOI: " " - For input string: " "
        // LOI: null - NullPointerException

        // Cach an toan: viet method helper
        System.out.println(safeParseInt("123", 0));   // 123
        System.out.println(safeParseInt("abc", 0));   // 0 (gia tri mac dinh)
        System.out.println(safeParseInt(null, -1));    // -1
    }

    /**
     * Chuyen String sang int an toan, tra ve defaultValue neu loi.
     */
    public static int safeParseInt(String str, int defaultValue) {
        if (str == null || str.trim().isEmpty()) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(str.trim());
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }
}
```

---

## Khi nao dung?

**Cac tinh huong pho bien:**
- **Doc input tu nguoi dung**: Scanner tra ve String, can chuyen sang int/double de tinh toan
- **Doc du lieu tu file/API**: JSON, CSV, database deu tra ve String, can parse sang kieu phu hop
- **Hien thi ket qua**: Chuyen so sang String de ghep voi cau thong bao
- **Xu ly form web**: Du lieu tu HTML form luon la String

**Best practices:**
- **Luon dung try-catch** khi parse tu String sang so (nguoi dung co the nhap sai)
- Uu tien `String.valueOf()` hon `"" + n` de chuyen so sang chuoi (ro rang va hieu qua hon)
- Uu tien `Integer.parseInt()` khi can `int`, dung `Integer.valueOf()` khi can `Integer` object
- **Trim chuoi truoc khi parse**: `Integer.parseInt(input.trim())` de tranh loi do khoang trang
- Dung `String.format()` khi can dinh dang so phuc tap (padding, so thap phan)

---

## Loi thuong gap

### 1. Khong xu ly NumberFormatException

```java
// Sai - chuong trinh crash neu input khong hop le
String input = "abc";
int number = Integer.parseInt(input); // NumberFormatException!

// Dung - luon bao ve bang try-catch
try {
    int number2 = Integer.parseInt(input);
} catch (NumberFormatException e) {
    System.out.println("Vui long nhap so hop le!");
}
```

### 2. Dung parseInt cho so thap phan

```java
// Sai - parseInt chi nhan so nguyen
// int num = Integer.parseInt("3.14"); // NumberFormatException!

// Dung - dung parseDouble roi ep kieu neu can
double num = Double.parseDouble("3.14");
int intNum = (int) num; // 3 (cat phan thap phan)
```

### 3. Nham lan autoboxing va unboxing

```java
// Chu y khi so sanh Integer objects
Integer a = Integer.valueOf(127);
Integer b = Integer.valueOf(127);
System.out.println(a == b);       // true (cache -128 den 127)

Integer c = Integer.valueOf(128);
Integer d = Integer.valueOf(128);
System.out.println(c == d);       // false! Ngoai pham vi cache
System.out.println(c.equals(d));  // true (nen dung .equals())
```

### 4. Ep kieu thu hep mat du lieu

```java
// Sai - mat du lieu khong biet
long bigNumber = 9999999999L;
int small = (int) bigNumber;
System.out.println(small); // 1410065407 (sai! bi tran so)

// Dung - kiem tra truoc khi ep
if (bigNumber >= Integer.MIN_VALUE && bigNumber <= Integer.MAX_VALUE) {
    int safe = (int) bigNumber;
} else {
    System.out.println("So qua lon de chuyen sang int!");
}
```

---

## Cau hoi phong van

### 1. `Integer.parseInt()` va `Integer.valueOf()` khac nhau nhu the nao?

**Tra loi:** `parseInt()` tra ve kieu `int` (primitive), con `valueOf()` tra ve kieu `Integer` (wrapper object). `valueOf()` su dung **IntegerCache** de cache cac gia tri tu -128 den 127, nen neu chuyen cung gia tri trong pham vi nay nhieu lan, `valueOf()` se tra ve cung mot object (tiet kiem bo nho). Ngoai pham vi cache, `valueOf()` tao object moi moi lan.

### 2. Khi nao xay ra `NumberFormatException`?

**Tra loi:** `NumberFormatException` xay ra khi co gang chuyen String sang so nhung chuoi khong hop le. Cac truong hop: chuoi chua ky tu khong phai so (`"abc"`), chuoi rong (`""`), chuoi co khoang trang (`" 123 "` voi mot so method), chuoi co dau thap phan khi dung `parseInt()` (`"3.14"`), chuoi co hau to kieu (`"123L"`), hoac `null`. Luon dung try-catch hoac validate truoc khi parse.

### 3. `"" + n` va `String.valueOf(n)` khac nhau ve performance nhu the nao?

**Tra loi:** `"" + n` duoc compiler chuyen thanh `new StringBuilder().append("").append(n).toString()`, tao ra nhieu object trung gian (StringBuilder, String tam). `String.valueOf(n)` goi truc tiep `Integer.toString(n)`, chi tao 1 String object. Trong vong lap lon, `String.valueOf()` nhanh hon dang ke. Tuy nhien, voi JIT compiler hien dai, su khac biet co the nho. Van khuyen nghi dung `String.valueOf()` vi no ro rang hon ve y dinh.

### 4. Widening va Narrowing casting khac nhau nhu the nao?

**Tra loi:** **Widening** (mo rong) la chuyen tu kieu nho sang kieu lon (`int` -> `double`), **tu dong** va **khong mat du lieu**. Thu tu: `byte -> short -> int -> long -> float -> double`. **Narrowing** (thu hep) la chuyen tu kieu lon sang kieu nho (`double` -> `int`), **bat buoc phai ep kieu** voi cu phap `(int)` va **co the mat du lieu** (cat phan thap phan hoac tran so). Luon can than khi narrowing.
