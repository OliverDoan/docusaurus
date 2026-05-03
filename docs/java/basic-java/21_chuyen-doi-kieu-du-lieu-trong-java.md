---
sidebar_position: 21
title: "21. Chuyển đổi kiểu dữ liệu"
---

# Chuyển đổi kiểu dữ liệu trong Java

**Chuyển đổi kiểu dữ liệu (Type Conversion)** là thao tác biến đổi giá trị từ kiểu này sang kiểu khác, ví dụ: chuyển một chuỗi `"123"` thành số nguyên `123`, hoặc chuyển số `3.14` thành chuỗi `"3.14"`. Đây là thao tác **cực kỳ phổ biến** trong mọi chương trình Java.

Hãy tưởng tượng bạn có một hộp đựng **số** (kiểu `int`) và một hộp đựng **chữ** (kiểu `String`). Khi bạn đọc dữ liệu từ người dùng (luôn là chuỗi), bạn cần "chuyển số từ hộp chữ sang hộp số" để tính toán. Khi bạn muốn hiển thị kết quả, bạn lại "chuyển số từ hộp số sang hộp chữ" để in ra màn hình. Đó chính là chuyển đổi kiểu dữ liệu.

---

## Mục lục

- [1. String sang int](#1-string-sang-int)
- [2. int sang String](#2-int-sang-string)
- [3. String sang double / double sang String](#3-string-sang-double-double-sang-string)
- [4. String sang long / long sang String](#4-string-sang-long-long-sang-string)
- [5. String sang char array và ngược lại](#5-string-sang-char-array-và-ngược-lại)
- [6. Các chuyển đổi khác thường dùng](#6-các-chuyển-đổi-khác-thường-dùng)
- [7. Bảng tổng hợp các phương thức chuyển đổi](#7-bảng-tổng-hợp-các-phương-thức-chuyển-đổi)
- [8. Xử lý NumberFormatException](#8-xử-lý-numberformatexception)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. String sang int

Có 2 cách chính: `Integer.parseInt()` và `Integer.valueOf()`.

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

| Method                    | Kiểu trả về        | Cache                   |
| ------------------------- | ------------------ | ----------------------- |
| `Integer.parseInt("123")` | `int` (primitive)  | Không                   |
| `Integer.valueOf("123")`  | `Integer` (object) | Có (cache -128 đến 127) |

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

## 5. String sang char array và ngược lại

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

## 6. Các chuyển đổi khác thường dùng

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

## 7. Bảng tổng hợp các phương thức chuyển đổi

| Từ        | Sang      | Phương thức                                      |
| --------- | --------- | ------------------------------------------------ |
| `String`  | `int`     | `Integer.parseInt(s)` hoặc `Integer.valueOf(s)`  |
| `String`  | `long`    | `Long.parseLong(s)` hoặc `Long.valueOf(s)`       |
| `String`  | `double`  | `Double.parseDouble(s)` hoặc `Double.valueOf(s)` |
| `String`  | `float`   | `Float.parseFloat(s)` hoặc `Float.valueOf(s)`    |
| `String`  | `boolean` | `Boolean.parseBoolean(s)`                        |
| `String`  | `char[]`  | `s.toCharArray()`                                |
| `String`  | `byte[]`  | `s.getBytes(StandardCharsets.UTF_8)`             |
| `int`     | `String`  | `String.valueOf(n)` hoặc `Integer.toString(n)`   |
| `long`    | `String`  | `String.valueOf(n)` hoặc `Long.toString(n)`      |
| `double`  | `String`  | `String.valueOf(d)` hoặc `Double.toString(d)`    |
| `boolean` | `String`  | `String.valueOf(b)`                              |
| `char[]`  | `String`  | `new String(chars)`                              |
| `char`    | `String`  | `String.valueOf(c)` hoặc `Character.toString(c)` |
| `byte[]`  | `String`  | `new String(bytes, StandardCharsets.UTF_8)`      |
| `int`     | `double`  | Tự động (widening): `double d = intVal;`         |
| `double`  | `int`     | Ép kiểu (narrowing): `int i = (int) doubleVal;`  |

---

## 8. Xử lý NumberFormatException

Đây là lỗi xảy ra khi bạn cố gắng chuyển một chuỗi **không hợp lệ** sang số.

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

## Khi nào dùng?

**Các tình huống phổ biến:**

- **Đọc input từ người dùng**: Scanner trả về String, cần chuyển sang int/double để tính toán
- **Đọc dữ liệu từ file/API**: JSON, CSV, database đều trả về String, cần parse sang kiểu phù hợp
- **Hiển thị kết quả**: Chuyển số sang String để ghép với câu thông báo
- **Xử lý form web**: Dữ liệu từ HTML form luôn là String

**Best practices:**

- **Luôn dùng try-catch** khi parse từ String sang số (người dùng có thể nhập sai)
- Ưu tiên `String.valueOf()` hơn `"" + n` để chuyển số sang chuỗi (rõ ràng và hiệu quả hơn)
- Ưu tiên `Integer.parseInt()` khi cần `int`, dùng `Integer.valueOf()` khi cần `Integer` object
- **Trim chuỗi trước khi parse**: `Integer.parseInt(input.trim())` để tránh lỗi do khoảng trắng
- Dùng `String.format()` khi cần định dạng số phức tạp (padding, số thập phân)

---

## Lỗi thường gặp

### 1. Không xử lý NumberFormatException

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

### 2. Dùng parseInt cho số thập phân

```java
// Sai - parseInt chi nhan so nguyen
// int num = Integer.parseInt("3.14"); // NumberFormatException!

// Dung - dung parseDouble roi ep kieu neu can
double num = Double.parseDouble("3.14");
int intNum = (int) num; // 3 (cat phan thap phan)
```

### 3. Nhầm lẫn autoboxing và unboxing

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

### 4. Ép kiểu thu hẹp mất dữ liệu

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

## Câu hỏi phỏng vấn

### 1. `Integer.parseInt()` và `Integer.valueOf()` khác nhau như thế nào?

**Trả lời:** `parseInt()` trả về kiểu `int` (primitive), còn `valueOf()` trả về kiểu `Integer` (wrapper object). `valueOf()` sử dụng **IntegerCache** để cache các giá trị từ -128 đến 127, nên nếu chuyển cùng giá trị trong phạm vi này nhiều lần, `valueOf()` sẽ trả về cùng một object (tiết kiệm bộ nhớ). Ngoài phạm vi cache, `valueOf()` tạo object mới mỗi lần.

### 2. Khi nào xảy ra `NumberFormatException`?

**Trả lời:** `NumberFormatException` xảy ra khi cố gắng chuyển String sang số nhưng chuỗi không hợp lệ. Các trường hợp: chuỗi chứa ký tự không phải số (`"abc"`), chuỗi rỗng (`""`), chuỗi có khoảng trắng (`" 123 "` với một số method), chuỗi có dấu thập phân khi dùng `parseInt()` (`"3.14"`), chuỗi có hậu tố kiểu (`"123L"`), hoặc `null`. Luôn dùng try-catch hoặc validate trước khi parse.

### 3. `"" + n` và `String.valueOf(n)` khác nhau về performance như thế nào?

**Trả lời:** `"" + n` được compiler chuyển thành `new StringBuilder().append("").append(n).toString()`, tạo ra nhiều object trung gian (StringBuilder, String tạm). `String.valueOf(n)` gọi trực tiếp `Integer.toString(n)`, chỉ tạo 1 String object. Trong vòng lặp lớn, `String.valueOf()` nhanh hơn đáng kể. Tuy nhiên, với JIT compiler hiện đại, sự khác biệt có thể nhỏ. Vẫn khuyến nghị dùng `String.valueOf()` vì nó rõ ràng hơn về ý định.

### 4. Widening và Narrowing casting khác nhau như thế nào?

**Trả lời:** **Widening** (mở rộng) là chuyển từ kiểu nhỏ sang kiểu lớn (`int` -> `double`), **tự động** và **không mất dữ liệu**. Thứ tự: `byte -> short -> int -> long -> float -> double`. **Narrowing** (thu hẹp) là chuyển từ kiểu lớn sang kiểu nhỏ (`double` -> `int`), **bắt buộc phải ép kiểu** với cú pháp `(int)` và **có thể mất dữ liệu** (cắt phần thập phân hoặc tràn số). Luôn cẩn thận khi narrowing.
