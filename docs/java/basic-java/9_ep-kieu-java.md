---
sidebar_position: 9
title: "9. Ép kiểu trong Java"
---

# Ép kiểu trong Java

**Ép kiểu (Type Casting)** trong Java là quá trình **chuyển đổi giá trị từ kiểu dữ liệu này sang kiểu dữ liệu khác**. Đây là thao tác rất phổ biến khi bạn cần tính toán giữa các kiểu dữ liệu khác nhau hoặc khi nhận dữ liệu từ bên ngoài.

Hãy hình dung ép kiểu giống như **đổi tiền tệ**: bạn có 100 USD (kiểu lớn) và muốn đổi sang VND (kiểu khác). Khi đổi từ "đơn vị nhỏ" sang "đơn vị lớn" (ví dụ VND sang USD), bạn sẽ mất phần lẻ. Ngược lại, từ "đơn vị lớn" sang "đơn vị nhỏ" thì không mất gì. Tương tự, ép kiểu từ `int` sang `double` thì an toàn, nhưng từ `double` sang `int` sẽ mất phần thập phân.

---


---

## Mục lục

- [Nội dung](#nội-dung)
- [1. Type Casting là gì?](#1-type-casting-là-gì)
- [2. Ép kiểu nới rộng (Widening Casting)](#2-ép-kiểu-nới-rộng-widening-casting)
- [3. Ép kiểu thu hẹp (Narrowing Casting)](#3-ép-kiểu-thu-hẹp-narrowing-casting)
- [4. Ép kiểu với Wrapper Classes](#4-ép-kiểu-với-wrapper-classes)
- [5. Chuyển đổi String sang Number và ngược lại](#5-chuyển-đổi-string-sang-number-và-ngược-lại)
- [6. Mất dữ liệu khi Narrowing](#6-mất-dữ-liệu-khi-narrowing)
- [7. Bảng tổng hợp ép kiểu](#7-bảng-tổng-hợp-ép-kiểu)
- [8. Khi nào dùng?](#8-khi-nào-dùng)
- [9. Lỗi thường gặp](#9-lỗi-thường-gặp)
- [10. Câu hỏi phỏng vấn](#10-câu-hỏi-phỏng-vấn)

---

## Nội dung

1. [Type Casting là gì?](#1-type-casting-là-gì)
2. [Ép kiểu nới rộng (Widening Casting)](#2-ép-kiểu-nới-rộng-widening-casting)
3. [Ép kiểu thu hẹp (Narrowing Casting)](#3-ép-kiểu-thu-hẹp-narrowing-casting)
4. [Ép kiểu với Wrapper Classes](#4-ép-kiểu-với-wrapper-classes)
5. [Chuyển đổi String sang Number và ngược lại](#5-chuyển-đổi-string-sang-number-và-ngược-lại)
6. [Mất dữ liệu khi Narrowing](#6-mất-dữ-liệu-khi-narrowing)
7. [Bảng tổng hợp ép kiểu](#7-bảng-tổng-hợp-ép-kiểu)
8. [Khi nào dùng?](#8-khi-nào-dùng)
9. [Lỗi thường gặp](#9-lỗi-thường-gặp)
10. [Câu hỏi phỏng vấn](#10-câu-hỏi-phỏng-vấn)

---

## 1. Type Casting là gì?

Type Casting là việc **chuyển một giá trị từ kiểu dữ liệu này sang kiểu dữ liệu khác**. Java hỗ trợ 2 loại chính:

| Loại | Tên gọi | Đặc điểm |
|------|---------|----------|
| **Implicit** (ngầm định) | Widening Casting | Tự động, không mất dữ liệu |
| **Explicit** (tường minh) | Narrowing Casting | Phải ép thủ công, có thể mất dữ liệu |

```java
public class TypeCastingIntro {
    public static void main(String[] args) {
        // Implicit (tự động): int -> double
        int soNguyen = 100;
        double soThuc = soNguyen; // Tự động chuyển
        System.out.println(soThuc); // 100.0

        // Explicit (thủ công): double -> int
        double pi = 3.14159;
        int piNguyen = (int) pi; // Phải dùng (int) để ép
        System.out.println(piNguyen); // 3 (mất phần .14159)
    }
}
```

---

## 2. Ép kiểu nới rộng (Widening Casting)

Widening (mở rộng) là chuyển từ kiểu **nhỏ sang kiểu lớn hơn**. Java thực hiện **tự động**, không cần viết thêm gì.

**Chuỗi nâng kiểu tự động**:

```
byte -> short -> int -> long -> float -> double
```

Mỗi kiểu bên trái có thể tự động chuyển sang bất kỳ kiểu nào bên phải.

```java
public class WideningDemo {
    public static void main(String[] args) {
        byte byteVal = 42;
        short shortVal = byteVal;   // byte -> short (tự động)
        int intVal = shortVal;      // short -> int (tự động)
        long longVal = intVal;      // int -> long (tự động)
        float floatVal = longVal;   // long -> float (tự động)
        double doubleVal = floatVal; // float -> double (tự động)

        System.out.println("byte:   " + byteVal);    // 42
        System.out.println("short:  " + shortVal);   // 42
        System.out.println("int:    " + intVal);     // 42
        System.out.println("long:   " + longVal);    // 42
        System.out.println("float:  " + floatVal);   // 42.0
        System.out.println("double: " + doubleVal);  // 42.0

        // char -> int (tự động)
        char ch = 'A';
        int charToInt = ch;
        System.out.println("char 'A' -> int: " + charToInt); // 65
    }
}
```

**Tại sao an toàn?** Vì kiểu lớn hơn luôn chứa được mọi giá trị của kiểu nhỏ hơn. `int` có 32 bit, `long` có 64 bit -- chắc chắn `long` chứa được mọi giá trị `int`.

---

## 3. Ép kiểu thu hẹp (Narrowing Casting)

Narrowing (thu hẹp) là chuyển từ kiểu **lớn sang kiểu nhỏ hơn**. Java **không tự động** làm điều này vì có nguy cơ mất dữ liệu. Bạn phải dùng **cast operator** `(kiểu)` để ép kiểu tường minh.

**Chuỗi thu hẹp**:

```
double -> float -> long -> int -> short -> byte
```

```java
public class NarrowingDemo {
    public static void main(String[] args) {
        double doubleVal = 9.78;
        int intVal = (int) doubleVal;   // Ép kiểu: bỏ phần thập phân
        System.out.println("double -> int: " + intVal); // 9

        float floatVal = (float) doubleVal;
        System.out.println("double -> float: " + floatVal); // 9.78

        long longVal = 100000L;
        short shortVal = (short) longVal;
        System.out.println("long -> short: " + shortVal); // -31072 (tràn số!)

        int intVal2 = 130;
        byte byteVal = (byte) intVal2;
        System.out.println("int 130 -> byte: " + byteVal); // -126 (tràn!)

        // int -> char
        int num = 65;
        char ch = (char) num;
        System.out.println("int 65 -> char: " + ch); // 'A'
    }
}
```

**Coi chừng**: Khi giá trị vượt quá phạm vi của kiểu đích, kết quả sẽ bị **tràn (overflow)** và cho ra giá trị không mong muốn.

---

## 4. Ép kiểu với Wrapper Classes

Wrapper classes (`Integer`, `Double`, `Long`...) cung cấp các method hữu ích để chuyển đổi kiểu.

```java
public class WrapperCastingDemo {
    public static void main(String[] args) {
        // Wrapper -> primitive (unboxing)
        Integer wrapperInt = 42;
        int primitiveInt = wrapperInt; // auto-unboxing
        System.out.println(primitiveInt); // 42

        // Primitive -> wrapper (autoboxing)
        double d = 3.14;
        Double wrapperDouble = d; // auto-boxing
        System.out.println(wrapperDouble); // 3.14

        // Chuyển đổi giữa các wrapper thông qua method
        Integer intObj = 100;
        double fromInt = intObj.doubleValue();  // Integer -> double
        long fromInt2 = intObj.longValue();     // Integer -> long
        System.out.println("doubleValue: " + fromInt);  // 100.0
        System.out.println("longValue: " + fromInt2);   // 100

        Double doubleObj = 9.99;
        int fromDouble = doubleObj.intValue();  // Double -> int
        System.out.println("intValue: " + fromDouble);  // 9
    }
}
```

---

## 5. Chuyển đổi String sang Number và ngược lại

Đây là thao tác rất thường gặp khi đọc dữ liệu từ người dùng, file, hoặc API.

```java
public class StringConversionDemo {
    public static void main(String[] args) {
        // === String -> Number ===
        String strInt = "123";
        int num = Integer.parseInt(strInt);
        System.out.println("String -> int: " + num); // 123

        String strDouble = "3.14";
        double d = Double.parseDouble(strDouble);
        System.out.println("String -> double: " + d); // 3.14

        String strLong = "9999999999";
        long l = Long.parseLong(strLong);
        System.out.println("String -> long: " + l); // 9999999999

        String strFloat = "2.5";
        float f = Float.parseFloat(strFloat);
        System.out.println("String -> float: " + f); // 2.5

        // === Number -> String ===
        // Cách 1: String.valueOf()
        int age = 25;
        String str1 = String.valueOf(age);
        System.out.println("int -> String: " + str1); // "25"

        // Cách 2: Nối chuỗi rỗng
        double pi = 3.14;
        String str2 = pi + "";
        System.out.println("double -> String: " + str2); // "3.14"

        // Cách 3: Integer.toString(), Double.toString()...
        String str3 = Integer.toString(100);
        System.out.println("toString: " + str3); // "100"
    }
}
```

---

## 6. Mất dữ liệu khi Narrowing

Khi ép kiểu thu hẹp, dữ liệu có thể bị mất theo nhiều cách:

```java
public class DataLossDemo {
    public static void main(String[] args) {
        // 1. Mất phần thập phân
        double price = 19.99;
        int intPrice = (int) price;
        System.out.println("19.99 -> int: " + intPrice); // 19 (mất .99)

        // 2. Tràn số (overflow)
        int bigNumber = 300;
        byte smallByte = (byte) bigNumber;
        System.out.println("300 -> byte: " + smallByte); // 44 (tràn!)

        // 3. Mất độ chính xác: long -> float
        long bigLong = 123456789012345L;
        float floatVal = bigLong;
        System.out.println("long: " + bigLong);               // 123456789012345
        System.out.println("long -> float: " + floatVal);     // 1.23456792E14 (mất chính xác!)
        System.out.println("float -> long: " + (long) floatVal); // 123456792000000

        // 4. Mất độ chính xác: int -> float (với giá trị lớn)
        int largeInt = 123456789;
        float f = largeInt;
        System.out.println("int: " + largeInt);        // 123456789
        System.out.println("int -> float: " + f);      // 1.23456792E8 (mất chính xác!)
    }
}
```

**Lưu ý quan trọng**: Ngay cả widening casting (`long -> float`) cũng có thể **mất độ chính xác** vì `float` chỉ có 23 bit mantissa, không đủ để biểu diễn chính xác mọi giá trị `long` (64 bit).

---

## 7. Bảng tổng hợp ép kiểu

| Từ kiểu / Sang kiểu | byte | short | char | int | long | float | double |
|---------------------|------|-------|------|-----|------|-------|--------|
| **byte** | -- | Auto | Cast | Auto | Auto | Auto | Auto |
| **short** | Cast | -- | Cast | Auto | Auto | Auto | Auto |
| **char** | Cast | Cast | -- | Auto | Auto | Auto | Auto |
| **int** | Cast | Cast | Cast | -- | Auto | Auto | Auto |
| **long** | Cast | Cast | Cast | Cast | -- | Auto | Auto |
| **float** | Cast | Cast | Cast | Cast | Cast | -- | Auto |
| **double** | Cast | Cast | Cast | Cast | Cast | Cast | -- |

- **Auto**: Ép kiểu tự động (widening), không cần viết gì thêm.
- **Cast**: Ép kiểu thủ công (narrowing), cần `(type)`.
- **--**: Chính nó, không cần chuyển.
- **boolean** không thể ép kiểu sang bất kỳ kiểu số nào và ngược lại.

---

## 8. Khi nào dùng?

| Tình huống | Loại ép kiểu | Ví dụ |
|-----------|-------------|-------|
| Tính toán giữa các kiểu khác nhau | Widening (tự động) | `int + double -> double` |
| Đọc dữ liệu từ người dùng | String -> Number | `Integer.parseInt(input)` |
| Hiển thị dữ liệu | Number -> String | `String.valueOf(number)` |
| Tiết kiệm bộ nhớ | Narrowing (thủ công) | `(byte) intValue` |
| Kiểm tra kiểu trước khi ép | `instanceof` + cast | `if (obj instanceof String) (String) obj` |

**Best practices**:
- Ưu tiên widening casting (tự động) khi có thể.
- Luôn kiểm tra phạm vi giá trị trước khi narrowing casting.
- Dùng `try-catch` khi parse String sang Number để xử lý dữ liệu không hợp lệ.
- Cẩn thận với mất độ chính xác khi `long -> float` hoặc `int -> float` với giá trị lớn.

---

## 9. Lỗi thường gặp

### Lỗi 1: Quên ép kiểu khi narrowing

```java
// ❌ Sai: không thể gán double vào int mà không ép kiểu
double price = 19.99;
// int intPrice = price; // Lỗi biên dịch: incompatible types

// ✅ Đúng: ép kiểu tường minh
int intPrice = (int) price;
System.out.println(intPrice); // 19
```

### Lỗi 2: Không xử lý NumberFormatException khi parse String

```java
// ❌ Sai: không bắt lỗi khi input không phải số
String input = "abc";
// int num = Integer.parseInt(input); // NumberFormatException!

// ✅ Đúng: bắt exception
try {
    int num = Integer.parseInt(input);
    System.out.println(num);
} catch (NumberFormatException e) {
    System.out.println("Dữ liệu không hợp lệ: " + input);
}
```

### Lỗi 3: Không kiểm tra instanceof trước khi ép kiểu object

```java
// ❌ Sai: ép kiểu mù quáng
Object obj = 42; // Integer
// String str = (String) obj; // ClassCastException tại runtime!

// ✅ Đúng: kiểm tra instanceof trước
if (obj instanceof String) {
    String str = (String) obj;
    System.out.println(str);
} else {
    System.out.println("obj không phải String, mà là: " + obj.getClass().getSimpleName());
}
```

### Lỗi 4: Tưởng nhầm widening luôn không mất dữ liệu

```java
// ❌ Sai hiểu: widening luôn an toàn
long bigNumber = 123456789012345L;
float f = bigNumber; // Widening tự động, nhưng MẤT ĐỘ CHÍNH XÁC!
System.out.println(bigNumber);   // 123456789012345
System.out.println(f);           // 1.23456792E14 (sai!)

// ✅ Đúng: nếu cần giữ chính xác, dùng double thay vì float
double d = bigNumber;
System.out.println(d);           // 1.23456789012345E14 (chính xác hơn)
```

---

## 10. Câu hỏi phỏng vấn

### Q1: Implicit casting và explicit casting khác nhau thế nào?

**A**:

| Tiêu chí | Implicit (Widening) | Explicit (Narrowing) |
|----------|-------------------|--------------------|
| Hướng chuyển | Kiểu nhỏ -> kiểu lớn | Kiểu lớn -> kiểu nhỏ |
| Cú pháp | Tự động, không viết gì | Phải dùng `(type)` |
| Mất dữ liệu | Thường không (ngoại trừ `long->float`) | Có thể mất |
| Ví dụ | `double d = 10;` | `int i = (int) 3.14;` |

---

### Q2: Khi chuyển `long` sang `float`, có mất dữ liệu không?

**A**: **Có thể!** Mặc dù `long -> float` là widening casting (tự động), nhưng `float` chỉ có **23 bit mantissa** (khoảng 7 chữ số thập phân có nghĩa), trong khi `long` có **63 bit** giá trị. Nên nếu giá trị `long` quá lớn (vượt khoảng 16 triệu), `float` không thể biểu diễn chính xác.

```java
long value = 123456789L;
float f = value;           // Widening tự động
System.out.println(value); // 123456789
System.out.println(f);     // 1.23456792E8 (sai 3 đơn vị cuối!)
```

Muốn chính xác hơn, dùng `double` (52 bit mantissa).

---

### Q3: `ClassCastException` xảy ra khi nào?

**A**: `ClassCastException` xảy ra **tại runtime** khi bạn cố ép kiểu một object sang kiểu mà nó **không thuộc về**.

```java
Object obj = "Hello";
Integer num = (Integer) obj; // ClassCastException!
// "Hello" là String, không phải Integer
```

Cách phòng tránh: luôn dùng `instanceof` để kiểm tra trước khi ép kiểu.

```java
if (obj instanceof Integer) {
    Integer num = (Integer) obj;
}
```

---

### Q4: Tại sao `boolean` không thể ép kiểu sang `int` (và ngược lại)?

**A**: Trong Java, `boolean` và các kiểu số là **hoàn toàn tách biệt**, không có mối quan hệ chuyển đổi. Điều này khác với C/C++ (nơi `0` = `false`, khác `0` = `true`). Java thiết kế như vậy để **tránh nhầm lẫn** và **tăng tính an toàn kiểu** (type safety).

```java
// Không hợp lệ trong Java
// int x = (int) true;     // Lỗi biên dịch!
// boolean b = (boolean) 1; // Lỗi biên dịch!

// Nếu cần chuyển đổi, dùng logic thủ công
boolean flag = true;
int intFlag = flag ? 1 : 0; // OK
boolean backToBoolean = (intFlag != 0); // OK
```

---

### Q5: Khi nào nên dùng `String.valueOf()` vs `Integer.toString()` vs nối chuỗi rỗng?

**A**:

| Cách | Code | Ghi chú |
|------|------|---------|
| `String.valueOf()` | `String.valueOf(42)` | An toàn nhất, xử lý `null` (trả về `"null"`) |
| `Integer.toString()` | `Integer.toString(42)` | Rõ ràng, nhưng chỉ dùng cho kiểu cụ thể |
| Nối chuỗi rỗng | `42 + ""` | Ngắn gọn nhưng tạo thêm StringBuilder ngầm |

Khuyến nghị: dùng `String.valueOf()` vì an toàn và đa năng nhất.
