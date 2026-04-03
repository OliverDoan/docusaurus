---
sidebar_position: 5
title: "Các kiểu dữ liệu trong Java"
---

# Các kiểu dữ liệu trong Java

Kiểu dữ liệu (data type) quyết định **loại giá trị** mà một biến có thể lưu trữ và **bao nhiêu bộ nhớ** được cấp phát. Trong Java, kiểu dữ liệu được chia thành hai nhóm lớn: **kiểu nguyên thủy (primitive)** và **kiểu tham chiếu (reference)**.

**Ví dụ đơn giản:** Hãy tưởng tượng kiểu dữ liệu giống như **loại hộp chứa đồ**:
- Hộp nhỏ (byte) -- chứa số nhỏ
- Hộp vừa (int) -- chứa số thường dùng
- Hộp lớn (long) -- chứa số cực lớn
- Hộp chữ (char) -- chứa một ký tự
- Hộp đúng/sai (boolean) -- chỉ có 2 trạng thái

Chọn đúng loại hộp giúp **tiết kiệm bộ nhớ** và **tránh lỗi dữ liệu**.

---

## 1. Hai nhóm kiểu dữ liệu

```
Kiểu dữ liệu Java
├── Primitive (Nguyên thủy) -- 8 kiểu, lưu giá trị trực tiếp
│   ├── Số nguyên: byte, short, int, long
│   ├── Số thực: float, double
│   ├── Ký tự: char
│   └── Logic: boolean
│
└── Reference (Tham chiếu) -- lưu địa chỉ vùng nhớ
    ├── String
    ├── Array
    ├── Class
    └── Interface
```

---

## 2. Tám kiểu nguyên thủy (Primitive Types)

### Bảng tổng hợp

| Kiểu | Kích thước | Giá trị nhỏ nhất | Giá trị lớn nhất | Giá trị mặc định | Ví dụ |
|------|-----------|------------------|------------------|------------------|-------|
| **byte** | 8 bit (1 byte) | -128 | 127 | 0 | `byte b = 100;` |
| **short** | 16 bit (2 byte) | -32,768 | 32,767 | 0 | `short s = 30000;` |
| **int** | 32 bit (4 byte) | -2,147,483,648 | 2,147,483,647 | 0 | `int i = 100000;` |
| **long** | 64 bit (8 byte) | -9.2 x 10^18 | 9.2 x 10^18 | 0L | `long l = 999999999L;` |
| **float** | 32 bit (4 byte) | ~1.4 x 10^-45 | ~3.4 x 10^38 | 0.0f | `float f = 3.14f;` |
| **double** | 64 bit (8 byte) | ~4.9 x 10^-324 | ~1.7 x 10^308 | 0.0d | `double d = 3.14159;` |
| **boolean** | 1 bit (logic) | false | true | false | `boolean b = true;` |
| **char** | 16 bit (2 byte) | '\u0000' (0) | '\uffff' (65,535) | '\u0000' | `char c = 'A';` |

### Ví dụ chi tiết

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

**Kết quả:**

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

## 3. Các lưu ý quan trọng

### 3.1. Hậu tố bắt buộc

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

### 3.2. Các hệ cơ số trong Java

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

### 3.3. Dấu gạch dưới cho dễ đọc (Java 7+)

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

### 3.4. Overflow và Underflow

Khi giá trị vượt quá phạm vi của kiểu dữ liệu, Java **không báo lỗi** mà "quay vòng":

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

## 4. Kiểu tham chiếu (Reference Types)

Kiểu tham chiếu lưu **địa chỉ vùng nhớ** (reference) của đối tượng, không lưu trực tiếp giá trị.

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

### So sánh Primitive vs Reference

| Tiêu chí | Primitive | Reference |
|----------|-----------|-----------|
| **Lưu trữ** | Giá trị trực tiếp | Địa chỉ (reference) |
| **Vùng nhớ** | Stack | Heap (đối tượng), Stack (reference) |
| **Giá trị null** | Không thể null | Có thể null |
| **So sánh** | `==` so sánh giá trị | `==` so sánh địa chỉ, `.equals()` so sánh nội dung |
| **Hiệu năng** | Nhanh hơn | Chậm hơn (tạo object trên Heap) |

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

Mỗi kiểu primitive có một **lớp bọc (wrapper class)** tương ứng, cho phép sử dụng primitive như đối tượng.

| Primitive | Wrapper | Ví dụ |
|-----------|---------|-------|
| byte | Byte | `Byte b = 5;` |
| short | Short | `Short s = 100;` |
| int | **Integer** | `Integer i = 42;` |
| long | Long | `Long l = 999L;` |
| float | Float | `Float f = 3.14f;` |
| double | Double | `Double d = 2.718;` |
| boolean | Boolean | `Boolean b = true;` |
| char | **Character** | `Character c = 'A';` |

### Autoboxing và Unboxing

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

### So sánh int vs Integer

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

## Khi nào dùng?

| Tình huống | Kiểu nên dùng | Lý do |
|------------|--------------|-------|
| Tính toán thường ngày, vòng lặp | `int`, `double` (primitive) | Nhanh, tiết kiệm bộ nhớ |
| Lưu trong Collection (List, Map, Set) | Wrapper (Integer, Double...) | Collection không nhận primitive |
| Cần giá trị null (ví dụ: chưa nhập dữ liệu) | Wrapper | Primitive không thể null |
| Dữ liệu tài chính, cần chính xác cao | `BigDecimal` | float/double có sai số làm tròn |
| Số nguyên nhỏ (-128 đến 127) | `byte` | Tiết kiệm bộ nhớ khi lưu nhiều |
| Ký tự đơn lẻ | `char` | Chuỗi dùng String |

---

## Lỗi thường gặp

### Lỗi 1: Quên hậu tố L/F

```java
❌ Sai:
long soLon = 9999999999;   // LỖI: integer number too large
float pi = 3.14;            // LỖI: possible lossy conversion from double to float

✅ Đúng:
long soLon = 9999999999L;   // Thêm L cho long
float pi = 3.14f;           // Thêm f cho float
```

### Lỗi 2: Dùng == so sánh Wrapper

```java
❌ Sai:
Integer a = 200;
Integer b = 200;
if (a == b) {  // false! So sánh địa chỉ, không phải giá trị
    System.out.println("Bang nhau");
}

✅ Đúng:
Integer a = 200;
Integer b = 200;
if (a.equals(b)) {  // true! So sánh giá trị
    System.out.println("Bang nhau");
}
```

### Lỗi 3: Không xử lý NullPointerException khi unboxing

```java
❌ Sai:
Integer wrapper = null;
int primitive = wrapper; // RUNTIME ERROR: NullPointerException

✅ Đúng:
Integer wrapper = null;
int primitive = (wrapper != null) ? wrapper : 0; // Kiểm tra null trước
```

### Lỗi 4: Dùng float cho tiền tệ

```java
❌ Sai:
float giaTien = 19.99f;
float tongTien = giaTien * 3;
System.out.println(tongTien); // 59.970001 (sai số!)

✅ Đúng:
import java.math.BigDecimal;
BigDecimal giaTien = new BigDecimal("19.99");
BigDecimal tongTien = giaTien.multiply(new BigDecimal("3"));
System.out.println(tongTien); // 59.97 (chính xác)
```

---

## Câu hỏi phỏng vấn

### Câu 1: Kích thước của từng kiểu primitive là bao nhiêu? Giá trị mặc định là gì?

**Trả lời:**
- `byte`: 1 byte, mặc định 0
- `short`: 2 byte, mặc định 0
- `int`: 4 byte, mặc định 0
- `long`: 8 byte, mặc định 0L
- `float`: 4 byte, mặc định 0.0f
- `double`: 8 byte, mặc định 0.0d
- `boolean`: không xác định chính xác (JVM dependent), mặc định false
- `char`: 2 byte, mặc định '\u0000'

Lưu ý: Giá trị mặc định chỉ áp dụng cho **biến instance và static**. Biến local không có giá trị mặc định.

### Câu 2: Tại sao String không phải kiểu primitive?

**Trả lời:** String là một **class** (kiểu reference) vì:
- String có thể chứa nhiều ký tự (kích thước không cố định)
- String có các phương thức như `length()`, `substring()`, `equals()`...
- String là đối tượng bất biến (immutable) được lưu trên Heap
- String có thể là `null`, trong khi primitive không thể
- Java chỉ có 8 kiểu primitive được định nghĩa sẵn trong ngôn ngữ. Mọi thứ khác là object.

### Câu 3: Sự khác biệt giữa float và double?

**Trả lời:**
- `float`: 32 bit, độ chính xác khoảng **6-7 chữ số thập phân**, cần hậu tố `f`/`F`
- `double`: 64 bit, độ chính xác khoảng **15-16 chữ số thập phân**, là kiểu mặc định cho số thực
- Dùng `double` khi cần độ chính xác cao hơn. Dùng `float` khi tiết kiệm bộ nhớ (ví dụ: đồ họa, game)
- Cả hai đều **không chính xác tuyệt đối** do biểu diễn IEEE 754 -- không nên dùng cho tính toán tài chính (dùng `BigDecimal` thay thế).

### Câu 4: Overflow trong Java xử lý như thế nào?

**Trả lời:** Java **không ném exception** khi overflow số nguyên. Giá trị sẽ **quay vòng (wrap around)**. Ví dụ: `Integer.MAX_VALUE + 1` cho ra `Integer.MIN_VALUE`. Để phát hiện overflow, có thể dùng:
- `Math.addExact()`, `Math.multiplyExact()` (từ Java 8) -- ném `ArithmeticException` khi overflow
- Kiểu `long` hoặc `BigInteger` cho số lớn

```java
try {
    int result = Math.addExact(Integer.MAX_VALUE, 1);
} catch (ArithmeticException e) {
    System.out.println("Overflow detected!");
}
```

### Câu 5: Integer cache là gì? Tại sao `Integer.valueOf(127) == Integer.valueOf(127)` là true?

**Trả lời:** Java cache (lưu tạm) các đối tượng `Integer` có giá trị từ **-128 đến 127**. Khi dùng autoboxing hoặc `Integer.valueOf()`, nếu giá trị nằm trong khoảng này, Java trả về đối tượng đã cache sẵn thay vì tạo mới. Vì vậy `==` trả về `true` vì cùng tham chiếu đến một đối tượng. Với giá trị ngoài khoảng này (như 128), Java tạo đối tượng mới mỗi lần, nên `==` trả về `false`.
